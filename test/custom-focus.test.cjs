const assert = require("node:assert/strict");
const { after, afterEach, test } = require("node:test");
const { JSDOM } = require("jsdom");

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  pretendToBeVisual: true,
});
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.HTMLButtonElement = dom.window.HTMLButtonElement;
global.IS_REACT_ACT_ENVIRONMENT = true;

const scrolls = [];
require.cache[require.resolve("scroll-to-element")] = {
  id: require.resolve("scroll-to-element"),
  filename: require.resolve("scroll-to-element"),
  loaded: true,
  exports: (element) => scrolls.push(element),
};
const React = require("react");
const ReactDOM = require("react-dom");
const { act } = React.act ? React : require("react-dom/test-utils");
const createRoot =
  Number(React.version.split(".")[0]) >= 18
    ? require("react-dom/client").createRoot
    : (container) => ({
        render: (element) => ReactDOM.render(element, container),
        unmount: () => ReactDOM.unmountComponentAtNode(container),
      });
const { Formik } = require("formik");
const { default: Select, components } = require("react-select");
const ErrorFocus = require("../dist/index.js").default;
const UnconnectedErrorFocus = ErrorFocus.WrappedComponent;
const h = React.createElement;

afterEach(() => {
  document.body.replaceChildren();
  scrolls.length = 0;
});
after(() => dom.window.close());

function scheduleFocus(t, errors = { choice: "Required" }) {
  let callback;
  const timeout = t.mock.method(global, "setTimeout", (fn) => {
    callback = fn;
    return 42;
  });
  const previous = {
    errors,
    isSubmitting: true,
    isValidating: false,
    submitCount: 1,
  };
  const instance = new UnconnectedErrorFocus({
    ...UnconnectedErrorFocus.defaultProps,
    duration: 1,
    focusDelay: 0,
    formik: { ...previous, isSubmitting: false },
  });
  instance.componentDidUpdate({ formik: previous });
  timeout.mock.restore();
  assert.equal(typeof callback, "function");
  return callback;
}

function InputOverride(props) {
  return h(components.Input, {
    ...props,
    "data-error-key": props.selectProps.name,
  });
}
function ValueContainerOverride(props) {
  const innerProps = { ...props.innerProps };
  if (!props.selectProps.isSearchable) {
    innerProps["data-error-key"] = props.selectProps.name;
  }
  return h(components.ValueContainer, { ...props, innerProps });
}

for (const isSearchable of [false, true]) {
  for (const mode of ["bare", "marked wrapper", "component overrides"]) {
    test(`react-select ${mode}, searchable=${isSearchable}`, (t) => {
      const container = document.createElement("div");
      document.body.append(container);
      const root = createRoot(container);
      const select = h(Select, {
        name: "choice",
        inputId: "choice-input",
        isSearchable,
        options: [{ value: "a", label: "A" }],
        ...(mode === "component overrides"
          ? {
              components: {
                Input: InputOverride,
                ValueContainer: ValueContainerOverride,
              },
            }
          : {}),
      });
      act(() =>
        root.render(
          mode === "marked wrapper"
            ? h("div", { "data-error-key": "choice" }, select)
            : select,
        ),
      );
      try {
        const input = container.querySelector('[role="combobox"]');
        const hidden = container.querySelector(
          'input[type="hidden"][name="choice"]',
        );
        assert.ok(hidden);
        const callback = scheduleFocus(t);
        assert.equal(document.activeElement, document.body);
        act(callback);
        if (mode === "bare") {
          // A hidden name alone does not identify its custom control's input.
          assert.equal(scrolls[0], hidden);
          assert.equal(document.activeElement, document.body);
        } else {
          assert.equal(
            scrolls[0],
            container.querySelector('[data-error-key="choice"]'),
          );
          assert.ok(
            document.activeElement === input,
            "Expected the actual combobox to receive focus",
          );
        }
        const tabStops = [...container.querySelectorAll("*")].filter(
          (element) => element.tabIndex >= 0 && element.type !== "hidden",
        );
        assert.deepEqual(tabStops, [input]);
        if (mode === "marked wrapper") {
          assert.equal(scrolls[0].hasAttribute("tabindex"), false);
        }
      } finally {
        act(() => root.unmount());
      }
    });
  }
}

test("keeps direct custom focus and a configured focus-forwarding wrapper", (t) => {
  document.body.innerHTML =
    '<div data-error-key="choice" tabindex="-1"><input></div><input id="outside">';
  const wrapper = document.querySelector("div");
  const outside = document.querySelector("#outside");
  scheduleFocus(t)();
  assert.equal(document.activeElement, wrapper);
  outside.focus();
  wrapper.addEventListener("focus", () => outside.focus());
  scheduleFocus(t)();
  assert.equal(document.activeElement, outside);
});

test("respects a custom handler that redirects focus outside the wrapper", (t) => {
  document.body.innerHTML =
    '<div data-error-key="choice" tabindex="-1"><input></div><input id="outside">';
  const outside = document.querySelector("#outside");
  document
    .querySelector("div")
    .addEventListener("focus", () => outside.focus());
  scheduleFocus(t)();
  assert.equal(document.activeElement, outside);
});

test("preserves custom-key priority over a same-name native field", (t) => {
  document.body.innerHTML =
    '<input name="choice"><div data-error-key="choice"><input id="custom"></div>';
  scheduleFocus(t)();
  assert.equal(scrolls[0], document.querySelector("div"));
  assert.equal(document.activeElement.id, "custom");
});

test("preserves earlier named native fields in DOM order", (t) => {
  document.body.innerHTML =
    '<input name="first"><div data-error-key="choice"><input></div>';
  scheduleFocus(t, { choice: "Required", first: "Required" })();
  assert.equal(scrolls[0], document.querySelector('[name="first"]'));
  assert.equal(document.activeElement, scrolls[0]);
});

for (const attributes of [
  'name="choice"',
  'name="choice" data-error-key="unrelated"',
]) {
  test(`does not search descendants of a name-only match: ${attributes}`, (t) => {
    document.body.innerHTML = `<div ${attributes}><input></div>`;
    scheduleFocus(t)();
    assert.equal(document.activeElement, document.body);
  });
}

test("does not focus arbitrary elements outside an empty custom container", (t) => {
  document.body.innerHTML =
    '<div data-error-key="choice"><span>Required</span></div><input name="choice"><button>Other</button>';
  scheduleFocus(t)();
  assert.equal(document.activeElement, document.body);
});

for (const unavailable of [
  '<input type="hidden" tabindex="0">',
  "<input disabled>",
  "<fieldset disabled><input></fieldset>",
  "<div hidden><input></div>",
  "<div inert><input></div>",
  '<div aria-hidden="true"><input></div>',
  '<div style="display:none"><input></div>',
  '<input style="visibility:hidden">',
  '<input style="visibility:collapse">',
]) {
  test(`skips unavailable descendants: ${unavailable}`, (t) => {
    document.body.innerHTML = `<div data-error-key="choice">${unavailable}<input id="available"></div>`;
    scheduleFocus(t)();
    assert.equal(document.activeElement.id, "available");
  });
}

test("tries descendants in DOM order until focus succeeds", (t) => {
  document.body.innerHTML =
    '<div data-error-key="choice"><span tabindex="invalid"></span><textarea id="first"></textarea><button>Later</button></div>';
  scheduleFocus(t)();
  assert.equal(document.activeElement.id, "first");
});

test("keeps an already focused descendant", (t) => {
  document.body.innerHTML =
    '<div data-error-key="choice"><input><input id="already"></div>';
  document.querySelector("#already").focus();
  scheduleFocus(t)();
  assert.equal(document.activeElement.id, "already");
});

test("finds the current descendants when delayed focus runs", (t) => {
  document.body.innerHTML =
    '<div data-error-key="choice"><input id="old"></div>';
  const callback = scheduleFocus(t);
  document.querySelector("div").innerHTML = '<input id="replacement">';
  callback();
  assert.equal(document.activeElement.id, "replacement");
});

for (const isSearchable of [false, true]) {
  test(`focuses the documented react-select form after invalid submit, searchable=${isSearchable}`, async () => {
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    let formik;
    act(() =>
      root.render(
        h(
          Formik,
          {
            initialValues: { choice: "" },
            validate: (values) => (values.choice ? {} : { choice: "Required" }),
            onSubmit: (_values, { setSubmitting }) => setSubmitting(false),
          },
          (props) => {
            formik = props;
            return h(
              "form",
              { noValidate: true, onSubmit: props.handleSubmit },
              h("label", { htmlFor: "choice-input" }, "Choice"),
              h(
                "div",
                { "data-error-key": "choice" },
                h(Select, {
                  name: "choice",
                  inputId: "choice-input",
                  isSearchable,
                  options: [{ value: "a", label: "A" }],
                  value: props.values.choice
                    ? { value: "a", label: "A" }
                    : null,
                  onChange: (option) =>
                    props.setFieldValue("choice", option ? option.value : ""),
                  onBlur: () => props.setFieldTouched("choice", true),
                  "aria-invalid": Boolean(
                    props.touched.choice && props.errors.choice,
                  ),
                  "aria-errormessage":
                    props.touched.choice && props.errors.choice
                      ? "choice-error"
                      : undefined,
                }),
              ),
              props.touched.choice && props.errors.choice
                ? h("div", { id: "choice-error" }, props.errors.choice)
                : null,
              h("button", { type: "submit" }, "Submit"),
              h(ErrorFocus, { offset: 0, duration: 1, focusDelay: 0 }),
            );
          },
        ),
      ),
    );
    try {
      for (let submitCount = 1; submitCount <= 2; submitCount++) {
        const button = container.querySelector("button");
        await act(async () => button.focus());
        await act(async () => {
          await formik.submitForm();
        });
        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
        });
        const input = container.querySelector('[role="combobox"]');
        assert.ok(
          document.activeElement === input,
          "Expected the actual combobox to receive focus",
        );
        assert.equal(input.getAttribute("aria-invalid"), "true");
        assert.equal(input.getAttribute("aria-errormessage"), "choice-error");
        assert.equal(scrolls.length, submitCount);
      }
    } finally {
      act(() => root.unmount());
    }
  });
}
