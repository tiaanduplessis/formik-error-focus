# formik-error-focus

[![package version](https://img.shields.io/npm/v/formik-error-focus.svg?style=flat-square)](https://npmjs.org/package/formik-error-focus)
[![package downloads](https://img.shields.io/npm/dm/formik-error-focus.svg?style=flat-square)](https://npmjs.org/package/formik-error-focus)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![package license](https://img.shields.io/npm/l/formik-error-focus.svg?style=flat-square)](https://npmjs.org/package/formik-error-focus)
[![make a pull request](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

Scroll to the first error in your Formik form and set focus

## Table of Contents

- [formik-error-focus](#formik-error-focus)
  - [Table of Contents](#table-of-contents)
  - [👀 Background](#-background)
  - [⚙️ Install](#️-install)
  - [📖 Usage](#-usage)
    - [Using useFormik](#using-useformik)
    - [Custom controls (unreleased)](#custom-controls-unreleased)
  - [📚 API](#-api)
  - [💬 Contributing](#-contributing)
  - [🪪 License](#-license)

## 👀 Background

Wrapper around [scroll-to-element](https://www.npmjs.com/package/scroll-to-element) that scrolls to the first error element in Formik.

Error targets are selected in DOM order, regardless of the order of keys in Formik's errors object. A matching `data-error-key` takes precedence over `name` for the same error key. Nested errors use dot-separated paths, such as `address.street` or `friends.0.email`. Errors without a matching element are skipped.

Scrolling uses the current errors after validation and submission finish. Validation on change or blur alone does not trigger it. Disabled or otherwise non-focusable elements can still be selected and scrolled to, but the browser may refuse to focus them. Use `data-error-key` on an explicit target when a custom control needs one; see the release note under [Custom controls](#custom-controls-unreleased).

## ⚙️ Install

Install the package locally within you project folder with your package manager:

With `npm`:

```sh
npm install formik-error-focus
```

With `yarn`:

```sh
yarn add formik-error-focus
```

With `pnpm`:

```sh
pnpm add formik-error-focus
```

## 📖 Usage

```js
import React from "react";
import { Formik, Field, Form } from "formik";
import FormikErrorFocus from "formik-error-focus";

export const Signup = () => (
  <div>
    <h1>My Uncool Persisted Form</h1>
    <Formik
      onSubmit={(values) => console.log(values)}
      initialValues={{ firstName: "", lastName: "", email: "" }}
      render={(props) => (
        <Form className="whatever">
          <Field name="firstName" placeholder="First Name" />
          <Field name="lastName" placeholder="Last Name" />
          <Field name="email" type="email" placeholder="Email Address" />
          <button type="submit">Submit</button>
          <FormikErrorFocus
            // See scroll-to-element for configuration options: https://www.npmjs.com/package/scroll-to-element
            offset={0}
            align={"top"}
            focusDelay={200}
            ease={"linear"}
            duration={1000}
          />
        </Form>
      )}
    />
  </div>
);
```

### Using useFormik

With Formik 2 and React 16.8 or newer, wrap the form in `FormikProvider` and pass it the complete object returned by `useFormik`. The hook and a native `<form>` do not provide Formik context by themselves. `FormikErrorFocus` must be inside the provider:

```jsx
import React from "react";
import { FormikProvider, useFormik } from "formik";
import FormikErrorFocus from "formik-error-focus";

export function SignupWithHook() {
  const formik = useFormik({
    initialValues: { email: "" },
    validate: (values) => (values.email ? {} : { email: "Required" }),
    onSubmit: (_values, { setSubmitting }) => {
      // Replace this with your submission logic.
      setSubmitting(false);
    },
  });

  return (
    <FormikProvider value={formik}>
      <form noValidate onSubmit={formik.handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        <button type="submit">Submit</button>
        <FormikErrorFocus offset={0} focusDelay={200} />
      </form>
    </FormikProvider>
  );
}
```

The default export reads context through Formik's `connect`. Passing `formik={formik}` directly to `FormikErrorFocus` does not replace the provider: `connect` overwrites that prop with its context value. Missing context can cause the `prevProps.formik`/`props.formik` undefined error.

For synchronous `onSubmit` handlers, call `setSubmitting(false)` when finished. If the handler returns a Promise, Formik settles `isSubmitting` automatically. Existing `<Formik>` usage already supplies the required context and does not need another provider.

### Custom controls (unreleased)

The descendant-focus behavior in this section is unreleased source functionality, not part of the published 2.0.0 package. Wait for a release containing this change before relying on it.

Custom controls such as `react-select` put their `name` on a hidden input. That input cannot receive focus, and `name` alone does not identify the interactive input. Set `data-error-key` to the Formik error path on a wrapper containing the control:

```jsx
import React from "react";
import { Formik } from "formik";
import Select from "react-select";
import FormikErrorFocus from "formik-error-focus";

const options = [{ value: "a", label: "A" }];

export function ChoiceForm() {
  return (
    <Formik
      initialValues={{ choice: "" }}
      validate={(values) => (values.choice ? {} : { choice: "Required" })}
      onSubmit={(_values, { setSubmitting }) => {
        // Replace this with your submission logic.
        setSubmitting(false);
      }}
    >
      {(formik) => {
        const error = formik.touched.choice && formik.errors.choice;
        return (
          <form noValidate onSubmit={formik.handleSubmit}>
            <label htmlFor="choice-input">Choice</label>
            <div data-error-key="choice">
              <Select
                name="choice"
                inputId="choice-input"
                isSearchable={false}
                options={options}
                value={
                  options.find(
                    (option) => option.value === formik.values.choice,
                  ) || null
                }
                onChange={(option) =>
                  formik.setFieldValue("choice", option ? option.value : "")
                }
                onBlur={() => formik.setFieldTouched("choice", true)}
                aria-invalid={Boolean(error)}
                aria-errormessage={error ? "choice-error" : undefined}
              />
            </div>
            {error && <div id="choice-error">{error}</div>}
            <button type="submit">Submit</button>
            <FormikErrorFocus offset={0} focusDelay={200} duration={300} />
          </form>
        );
      }}
    </Formik>
  );
}
```

This example is tested with Formik 2.4.9 and react-select 5.10.2, with both searchable and non-searchable selects. No custom `Input` override or extra tab stop is needed. Keep the wrapper limited to that control so another button or link is not selected first.

The wrapper remains the scroll target. After the existing delay, the package tries to focus the target itself. If it cannot, it tries eligible descendants in DOM order, skipping hidden, disabled, inert, and `aria-hidden` content. It stops when focus succeeds. An already focused descendant is preserved. An explicit `tabIndex` target or a custom handler that forwards focus retains its existing behavior. Native `name` matches do not gain descendant search, and controls outside the marked wrapper are never inferred from a hidden input.

Focus is scheduled only with a nonzero `duration`, as before. The target's priority and scroll order are unchanged.

## 📚 API

For all configuration options, please see the [API docs](https://paka.dev/npm/formik-error-focus).

## 💬 Contributing

For local development, use Node.js 22 or newer and pnpm 10.34.6:

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm test
pnpm run types:check
pnpm run format:check
```

The tests build the package and exercise target selection in a DOM, including Formik context integration and real react-select controls. The DOM tests verify active focus; native-browser keyboard traversal is not covered. `pnpm run coverage` also reports test coverage.

Got an idea for a new feature? Found a bug? Contributions are welcome! Please [open up an issue](https://github.com/tiaanduplessis/formik-error-focus/issues) or [make a pull request](https://makeapullrequest.com/).

## 🪪 License

[MIT © Tiaan du Plessis](./LICENSE)
