import { Component } from "react";
import { connect, FormikContextType } from "formik";
import scrollToElement from "scroll-to-element";
import flatten from "flat";

export type Alignment = "top" | "middle" | "bottom" | undefined;

export type ErrorFocusProps = {
  offset: number;
  align?: Alignment;
  ease?: string | undefined;
  duration?: number | undefined;
  focusDelay: number;
} & { formik: FormikContextType<{}> };

class ErrorFocus extends Component<ErrorFocusProps> {
  timeout: number | null = null;

  static defaultProps = {
    offset: 0,
    align: "top" as Alignment,
    focusDelay: 200,
    ease: "linear",
    duration: 1000,
  };

  componentDidUpdate(prevProps: ErrorFocusProps) {
    const { isSubmitting, isValidating, errors } = prevProps.formik;
    const keys = Object.keys(flatten(errors));

    if (keys.length > 0 && isSubmitting && !isValidating) {
      const selector = `[data-error-key="${keys[0]}"]`;
      const fallbackSelector = `[name="${keys[0]}"]`;
      const errorElement = (document.querySelector(selector) ||
        document.querySelector(fallbackSelector)) as HTMLInputElement;

      if (errorElement) {
        const { offset, ease, duration, focusDelay, align } = this.props;
        scrollToElement(errorElement, {
          offset,
          ease,
          duration,
          align,
        });

        if (duration) {
          this.timeout = setTimeout(
            () => errorElement.focus(),
            duration + focusDelay
          );
        }
      }
    }
  }

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  render() {
    return null;
  }
}

export default connect(ErrorFocus);
