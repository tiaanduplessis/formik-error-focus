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
  - [📚 API](#-api)
  - [💬 Contributing](#-contributing)
  - [🪪 License](#-license)

## 👀 Background

Wrapper around [scroll-to-element](https://www.npmjs.com/package/scroll-to-element) that scrolls to the first error element in Formik.

Error targets are selected in DOM order, regardless of the order of keys in Formik's errors object. A matching `data-error-key` takes precedence over `name` for the same error key. Nested errors use dot-separated paths, such as `address.street` or `friends.0.email`. Errors without a matching element are skipped.

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
