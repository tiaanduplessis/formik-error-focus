import React from "react";
import { FormikProvider, useFormik } from "formik";
import FormikErrorFocus, { ErrorFocusProps } from "../src";

export function HookForm() {
  const formik = useFormik({ initialValues: {}, onSubmit() {} });
  const legacyProps: ErrorFocusProps = { offset: 0, focusDelay: 200, formik };

  return (
    <FormikProvider value={formik}>
      <FormikErrorFocus offset={0} focusDelay={200} />
      <FormikErrorFocus {...legacyProps} />
      {/* @ts-expect-error Invalid alignment still fails typechecking. */}
      <FormikErrorFocus offset={0} focusDelay={200} align="sideways" />
    </FormikProvider>
  );
}
