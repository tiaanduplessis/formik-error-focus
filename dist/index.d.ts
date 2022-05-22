import * as react from "react";
import { FormikContextType } from "formik";

declare type Alignment = "top" | "middle" | "bottom" | undefined;
declare type ErrorFocusProps = {
  offset: number;
  align?: Alignment;
  ease?: string | undefined;
  duration?: number | undefined;
  focusDelay: number;
} & {
  formik: FormikContextType<{}>;
};
declare const _default: react.ComponentType<
  {
    offset: number;
    align?: Alignment;
    ease?: string | undefined;
    duration?: number | undefined;
    focusDelay: number;
  } & {
    formik: FormikContextType<{}>;
  }
>;

export { Alignment, ErrorFocusProps, _default as default };
