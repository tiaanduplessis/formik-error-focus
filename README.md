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
  - [📚 API](#-api)
  - [💬 Contributing](#-contributing)
  - [🪪 License](#-license)

## 👀 Background

Wrapper around [scroll-to-element](https://www.npmjs.com/package/scroll-to-element) that scrolls to the first error element in Formik.

Error targets are selected in DOM order, regardless of the order of keys in Formik's errors object. A matching `data-error-key` takes precedence over `name` for the same error key. Nested errors use dot-separated paths, such as `address.street` or `friends.0.email`. Errors without a matching element are skipped.

Scrolling uses the current errors after validation and submission finish. Validation on change or blur alone does not trigger it. Disabled or otherwise non-focusable elements can still be selected and scrolled to, but the browser may refuse to focus them. Use `data-error-key` on a focusable target when a custom control needs one.

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

The tests build the package and exercise target selection in a DOM, including Formik context integration. `pnpm run coverage` also reports test coverage.

Got an idea for a new feature? Found a bug? Contributions are welcome! Please [open up an issue](https://github.com/tiaanduplessis/formik-error-focus/issues) or [make a pull request](https://makeapullrequest.com/).

## 🪪 License

[MIT © Tiaan du Plessis](./LICENSE)
