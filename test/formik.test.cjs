const assert = require("node:assert/strict");
const { after, test } = require("node:test");
const { JSDOM } = require("jsdom");

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  pretendToBeVisual: true,
});
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.HTMLButtonElement = dom.window.HTMLButtonElement;
global.requestAnimationFrame = dom.window.requestAnimationFrame.bind(
  dom.window,
);
global.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);
global.IS_REACT_ACT_ENVIRONMENT = true;

const scrolls = [];
require.cache[require.resolve("scroll-to-element")] = {
  id: require.resolve("scroll-to-element"),
  filename: require.resolve("scroll-to-element"),
  loaded: true,
  exports: (element, options) => scrolls.push({ element, options }),
};
const React = require("react");
const ReactDOM = require("react-dom");
const { act } = React.act ? React : require("react-dom/test-utils");
const { Formik, FormikProvider, useFormik } = require("formik");
const ErrorFocus = require("../dist/index.js").default;
const h = React.createElement;
const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));
const renderModes = ["legacy"];
if (Number(React.version.split(".")[0]) >= 18) renderModes.push("root");

after(() => dom.window.close());

function legacyCall(callback) {
  const error = console.error;
  console.error = (message, ...args) => {
    if (
      typeof message === "string" &&
      (message.includes("ReactDOM.render is no longer supported") ||
        message.includes("unmountComponentAtNode is deprecated"))
    ) {
      return;
    }
    error(message, ...args);
  };
  try {
    return callback();
  } finally {
    console.error = error;
  }
}

function fixture({
  mode,
  renderMode,
  strict,
  asyncValidation,
  asyncSubmit,
  disabled = false,
  initialErrors,
  submitPromise,
}) {
  const container = document.createElement("div");
  document.body.append(container);
  scrolls.length = 0;
  let current;
  let submits = 0;
  const config = {
    initialValues: { first: "", last: "" },
    initialErrors,
    validate: (values) => {
      const errors = {};
      // Deliberately differ from the order of the rendered fields.
      if (!values.last) errors.last = "Required";
      if (!values.first) errors.first = "Required";
      return asyncValidation ? wait(2).then(() => errors) : errors;
    },
    onSubmit: (_values, helpers) => {
      submits++;
      if (submitPromise) return submitPromise;
      if (asyncSubmit) return wait(2);
      helpers.setSubmitting(false);
    },
  };
  function fields(formik) {
    current = formik;
    return h(
      "form",
      { onSubmit: formik.handleSubmit, noValidate: true },
      h("input", {
        name: "first",
        disabled,
        value: formik.values.first,
        onChange: formik.handleChange,
        onBlur: formik.handleBlur,
      }),
      h("input", {
        name: "last",
        value: formik.values.last,
        onChange: formik.handleChange,
        onBlur: formik.handleBlur,
      }),
      h("button", { type: "submit" }, "Submit"),
      h(ErrorFocus, { offset: 0, duration: 1, focusDelay: 0 }),
    );
  }
  function HookForm() {
    const formik = useFormik(config);
    return h(FormikProvider, { value: formik }, fields(formik));
  }
  let content = mode === "hook" ? h(HookForm) : h(Formik, config, fields);
  if (strict) content = h(React.StrictMode, null, content);
  const root =
    renderMode === "root"
      ? require("react-dom/client").createRoot(container)
      : null;
  act(() => {
    if (root) root.render(content);
    else legacyCall(() => ReactDOM.render(content, container));
  });
  return {
    container,
    first: container.querySelector('[name="first"]'),
    get formik() {
      return current;
    },
    get submits() {
      return submits;
    },
    async submit() {
      act(() => {
        container
          .querySelector("form")
          .dispatchEvent(
            new dom.window.Event("submit", { bubbles: true, cancelable: true }),
          );
      });
      await act(async () => {
        await wait(12);
      });
      await wait(5);
      assert.equal(current.isSubmitting, false);
      assert.equal(current.isValidating, false);
    },
    async setValues(values) {
      await act(async () => {
        await current.setValues(values, false);
      });
    },
    cleanup() {
      act(() => {
        if (root) root.unmount();
        else legacyCall(() => ReactDOM.unmountComponentAtNode(container));
      });
      container.remove();
    },
  };
}

for (const mode of ["hook", "Formik"]) {
  for (const renderMode of renderModes) {
    for (const strict of [false, true]) {
      for (const asyncValidation of [false, true]) {
        for (const asyncSubmit of [false, true]) {
          const options = {
            mode,
            renderMode,
            strict,
            asyncValidation,
            asyncSubmit,
          };
          const label = JSON.stringify(options);
          test(`submits invalid, invalid, valid, invalid: ${label}`, async () => {
            const form = fixture(options);
            try {
              assert.equal(scrolls.length, 0);
              for (const count of [1, 2]) {
                await form.submit();
                assert.equal(scrolls.length, count);
                assert.equal(scrolls[count - 1].element, form.first);
                assert.equal(document.activeElement, form.first);
                assert.equal(form.submits, 0);
              }
              await form.setValues({ first: "valid", last: "valid" });
              await form.submit();
              assert.equal(
                scrolls.length,
                2,
                "valid submit must not focus stale errors",
              );
              assert.equal(form.submits, 1);
              await form.setValues({ first: "", last: "" });
              await form.submit();
              assert.equal(scrolls.length, 3);
              assert.equal(scrolls[2].element, form.first);
              assert.equal(document.activeElement, form.first);
              assert.equal(form.submits, 1);
            } finally {
              form.cleanup();
            }
          });
        }
      }
      test(`validation-only changes and reset: ${mode}/${renderMode}/${strict}`, async () => {
        const form = fixture({
          mode,
          renderMode,
          strict,
          asyncValidation: true,
        });
        try {
          await act(async () => {
            await form.formik.validateForm();
          });
          assert.equal(scrolls.length, 0);
          await act(async () => {
            await form.formik.setFieldTouched("first", true, true);
          });
          assert.equal(scrolls.length, 0);
          await act(async () => {
            await form.formik.setFieldValue("first", "valid", true);
          });
          assert.equal(scrolls.length, 0);
          await form.setValues({ first: "", last: "" });
          await form.submit();
          assert.equal(scrolls.length, 1);
          await act(async () => {
            await form.formik.validateForm();
          });
          assert.equal(
            scrolls.length,
            1,
            "validation after submission must not refocus",
          );
          act(() => form.formik.resetForm());
          assert.equal(scrolls.length, 1);
          await form.submit();
          assert.equal(scrolls.length, 2);
        } finally {
          form.cleanup();
        }
      });
      test(`reset during async submission: ${mode}/${renderMode}/${strict}`, async () => {
        let finishSubmit;
        const submitPromise = new Promise((resolve) => {
          finishSubmit = resolve;
        });
        const form = fixture({
          mode,
          renderMode,
          strict,
          initialErrors: { first: "Initial error" },
          submitPromise,
        });
        let submission;
        try {
          await form.setValues({ first: "valid", last: "valid" });
          act(() => {
            submission = form.formik.submitForm();
          });
          await act(async () => {
            await wait();
          });
          assert.equal(form.formik.isSubmitting, true);
          assert.equal(form.formik.isValidating, false);
          assert.equal(form.formik.submitCount, 1);
          assert.deepEqual(form.formik.errors, {});
          assert.equal(form.submits, 1);
          act(() => form.formik.resetForm());
          assert.equal(form.formik.submitCount, 0);
          assert.deepEqual(form.formik.errors, { first: "Initial error" });
          assert.equal(
            scrolls.length,
            0,
            "reset must not focus restored errors",
          );
          await act(async () => {
            finishSubmit();
            await submission;
          });
          assert.equal(
            scrolls.length,
            0,
            "old submission must not refocus after reset",
          );
          await form.submit();
          assert.equal(scrolls.length, 1);
          assert.equal(scrolls[0].element, form.first);
          assert.equal(form.submits, 1);
        } finally {
          finishSubmit();
          if (submission)
            await act(async () => {
              await submission;
            });
          form.cleanup();
        }
      });
    }
  }
}

test("preserves disabled fields as scroll targets without promising focus", async () => {
  const form = fixture({
    mode: "hook",
    renderMode: renderModes.at(-1),
    disabled: true,
  });
  try {
    await form.submit();
    assert.equal(scrolls.length, 1);
    assert.equal(scrolls[0].element, form.first);
    assert.notEqual(document.activeElement, form.first);
  } finally {
    form.cleanup();
  }
});
