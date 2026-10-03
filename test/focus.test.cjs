const assert = require("node:assert/strict");
const { after, afterEach, test } = require("node:test");
const { JSDOM } = require("jsdom");

const dom = new JSDOM("<!doctype html><html><body></body></html>");
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
  exports: (element, options) => scrolls.push({ element, options }),
};
const React = require("react");
const { createRoot } = require("react-dom/client");
const { FormikProvider } = require("formik");
const ErrorFocus = require("../dist/index.js").default;
const UnconnectedErrorFocus = ErrorFocus.WrappedComponent;

function field(name, attributes = {}, tag = "input") {
  const element = document.createElement(tag);
  if (name !== null) element.setAttribute("name", name);
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }
  document.body.append(element);
  return element;
}

function update(errors, formik = {}, props = {}) {
  const instance = new UnconnectedErrorFocus({
    ...UnconnectedErrorFocus.defaultProps,
    duration: 0,
    ...props,
  });
  instance.componentDidUpdate({
    formik: { errors, isSubmitting: true, isValidating: false, ...formik },
  });
  return instance;
}

function expectTarget(target) {
  assert.equal(scrolls.length, 1);
  assert.ok(scrolls[0].element === target, "Scrolled to the wrong DOM element");
}

afterEach(() => {
  document.body.replaceChildren();
  scrolls.length = 0;
});
after(() => dom.window.close());

test("focuses the first DOM field when errors were inserted in reverse order", () => {
  const first = field("first");
  field("last");
  update({ last: "Required", first: "Required" });
  expectTarget(first);
});

test("skips error keys with no mounted field", () => {
  const first = field("first");
  update({ unmounted: "Required", first: "Required" });
  expectTarget(first);
});

test("keeps DOM order across nested error objects", () => {
  const first = field("address.street");
  field("name");
  update({ name: "Required", address: { street: "Required" } });
  expectTarget(first);
});

test("preserves flattened array field paths", () => {
  const first = field("friends.1.email");
  field("friends.0.email");
  update({ friends: [{ email: "Required" }, { email: "Required" }] });
  expectTarget(first);
});

test("preserves data-error-key priority over name for the same field", () => {
  field("email");
  const custom = field(
    null,
    { "data-error-key": "email", tabindex: "0" },
    "div",
  );
  update({ email: "Required" });
  expectTarget(custom);
});

test("orders custom targets and name fallbacks together", () => {
  const first = field("first");
  field(null, { "data-error-key": "last" });
  update({ last: "Required", first: "Required" });
  expectTarget(first);
});

test("ignores a name fallback superseded by a later custom target", () => {
  field("last");
  const first = field("first");
  field(null, { "data-error-key": "last" });
  update({ last: "Required", first: "Required" });
  expectTarget(first);
});

test("selects an earlier custom target when its error key was added last", () => {
  const first = field(null, { "data-error-key": "first" });
  field("last");
  update({ last: "Required", first: "Required" });
  expectTarget(first);
});

test("keeps name fallback when an unrelated data-error-key is present", () => {
  const first = field("email", { "data-error-key": "unrelated" });
  update({ email: "Required" });
  expectTarget(first);
});

test("uses the first matching element for duplicate names", () => {
  const first = field("choice", { type: "radio" });
  field("choice", { type: "radio" });
  update({ choice: "Required" });
  expectTarget(first);
});

test("uses the first matching element for duplicate custom keys", () => {
  const first = field(null, { "data-error-key": "email" });
  field(null, { "data-error-key": "email" });
  update({ email: "Required" });
  expectTarget(first);
});

for (const attribute of ["name", "data-error-key"]) {
  test(`matches literal ${attribute} values without interpreting CSS syntax`, () => {
    const key = 'contact["email"]\\line\nsecond';
    const first = field(null, { [attribute]: key });
    update({ [key]: "Required" });
    expectTarget(first);
  });
}

test("supports textarea and select fields in DOM order", () => {
  const first = field("description", {}, "textarea");
  field("choice", {}, "select");
  update({ choice: "Required", description: "Required" });
  expectTarget(first);
});

for (const [label, errors, state] of [
  ["no errors", {}, {}],
  ["no matching elements", { missing: "Required" }, {}],
  ["not submitting", { email: "Required" }, { isSubmitting: false }],
  ["still validating", { email: "Required" }, { isValidating: true }],
]) {
  test(`does not scroll with ${label}`, () => {
    field("email");
    update(errors, state);
    assert.equal(scrolls.length, 0);
  });
}

test("preserves scroll options and focuses the selected target after its delay", (t) => {
  const first = field("first");
  field("last");
  let callback;
  let delay;
  t.mock.method(global, "setTimeout", (fn, ms) => {
    callback = fn;
    delay = ms;
    return 42;
  });
  const instance = update(
    { last: "Required", first: "Required" },
    {},
    {
      offset: -50,
      ease: "out-cube",
      duration: 100,
      focusDelay: 25,
      align: "middle",
    },
  );
  expectTarget(first);
  assert.deepEqual(scrolls[0].options, {
    offset: -50,
    ease: "out-cube",
    duration: 100,
    align: "middle",
  });
  assert.equal(delay, 125);
  assert.equal(instance.timeout, 42);
  assert.notEqual(document.activeElement, first);
  callback();
  assert.equal(document.activeElement, first);
});

test("cancels its pending focus on unmount", (t) => {
  field("email");
  t.mock.method(global, "setTimeout", () => 42);
  const clear = t.mock.method(global, "clearTimeout", () => {});
  const instance = update({ email: "Required" }, {}, { duration: 100 });
  instance.componentWillUnmount();
  assert.equal(clear.mock.calls.length, 1);
  assert.deepEqual(clear.mock.calls[0].arguments, [42]);
});

test("preserves duration zero behavior without scheduling focus", (t) => {
  const first = field("email");
  const timeout = t.mock.method(global, "setTimeout", () => 42);
  update({ email: "Required" });
  expectTarget(first);
  assert.equal(timeout.mock.calls.length, 0);
});

test("connects to Formik context and follows rendered field order", () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const errors = { last: "Required", first: "Required" };
  function render(isSubmitting) {
    root.render(
      React.createElement(
        FormikProvider,
        { value: { errors, isSubmitting, isValidating: false } },
        React.createElement("input", { name: "first" }),
        React.createElement("input", { name: "last" }),
        React.createElement(ErrorFocus, { duration: 0 }),
      ),
    );
  }
  try {
    React.act(() => render(true));
    assert.equal(scrolls.length, 0);
    React.act(() => render(false));
    expectTarget(container.querySelector('[name="first"]'));
  } finally {
    React.act(() => root.unmount());
  }
});
