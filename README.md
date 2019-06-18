
# formik-error-focus
[![package version](https://img.shields.io/npm/v/formik-error-focus.svg?style=flat-square)](https://npmjs.org/package/formik-error-focus)
[![package downloads](https://img.shields.io/npm/dm/formik-error-focus.svg?style=flat-square)](https://npmjs.org/package/formik-error-focus)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![package license](https://img.shields.io/npm/l/formik-error-focus.svg?style=flat-square)](https://npmjs.org/package/formik-error-focus)
[![make a pull request](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

> Scroll to the first error in your Formik form and set focus

## Table of Contents

- [About](#about)
- [Usage](#usage)
- [Install](#install)
- [Contribute](#contribute)
- [License](#License)

## About

Wrapper around [scroll-to-element](https://www.npmjs.com/package/scroll-to-element) that scrolls to the first error element in Formik.

## Usage

```js
import React from 'react'
import { Formik, Field, Form } from 'formik'
import FormikErrorFocus from 'formik-error-focus'

export const Signup = () =>
  <div>
    <h1>My Uncool Persisted Form</h1>
    <Formik
      onSubmit={values => console.log(values)}
      initialValues={{ firstName: '', lastName: '', email: '' }}
      render={props =>
        <Form className="whatever">
          <Field name="firstName" placeholder="First Name" />
          <Field name="lastName" placeholder="Last Name" />
          <Field name="email" type="email" placeholder="Email Address" />
          <button type="submit">Submit</button>
          <FormikErrorFocus
            // See scroll-to-element for configuration options: https://www.npmjs.com/package/scroll-to-element
            offset={0}
            align={'top'}
            focusDelay={200}
            ease={'linear'}
            duration={1000}
          />
        </Form>}
    />
  </div>;
```


## Install

This project uses [node](https://nodejs.org) and [npm](https://www.npmjs.com).

```sh
$ npm install formik-error-focus
$ # OR
$ yarn add formik-error-focus
```

## Contribute

1. Fork it and create your feature branch: `git checkout -b my-new-feature`
2. Commit your changes: `git commit -am "Add some feature"`
3. Push to the branch: `git push origin my-new-feature`
4. Submit a pull request

## License

MIT © Tiaan du Plessis
