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
    const { isSubmitting, isValidating, errors, submitCount } =
      this.props.formik;
    // Validation and submission updates can be batched into one render.
    const submissionFinished =
      !isSubmitting &&
      !isValidating &&
      ((prevProps.formik.isSubmitting &&
        submitCount === prevProps.formik.submitCount) ||
        submitCount > prevProps.formik.submitCount);
    const keys = Object.keys(flatten(errors));

    if (keys.length > 0 && submissionFinished) {
      const errorKeys = new Set(keys);
      const elements = Array.from(
        document.querySelectorAll<HTMLElement>("[data-error-key], [name]"),
      );
      // A custom target still takes precedence over a name match for its key.
      const customErrorKeys = new Set(
        elements
          .map((element) => element.getAttribute("data-error-key"))
          .filter((key): key is string => key !== null && errorKeys.has(key)),
      );
      const errorElement = elements.find((element) => {
        const key = element.getAttribute("data-error-key");
        const name = element.getAttribute("name");
        return (
          (key !== null && errorKeys.has(key)) ||
          (name !== null && errorKeys.has(name) && !customErrorKeys.has(name))
        );
      });

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
            duration + focusDelay,
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

type ConnectedErrorFocusProps = Omit<ErrorFocusProps, "formik"> & {
  formik?: ErrorFocusProps["formik"];
};

export default connect<ConnectedErrorFocusProps>(ErrorFocus);
