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

function focusErrorElement(element: HTMLElement, isCustomTarget: boolean) {
  const { ownerDocument } = element;
  const previousActiveElement = ownerDocument.activeElement;
  element.focus();

  // Preserve direct focus and custom handlers that forward it elsewhere.
  if (
    !isCustomTarget ||
    element.hasAttribute("tabindex") ||
    element.contains(ownerDocument.activeElement) ||
    ownerDocument.activeElement !== previousActiveElement
  ) {
    return;
  }

  const candidates = element.querySelectorAll<HTMLElement>(
    'input, select, textarea, button, a[href], [tabindex], [contenteditable="true"], [contenteditable=""]',
  );
  for (const candidate of Array.from(candidates)) {
    if (
      candidate.matches('input[type="hidden"], :disabled') ||
      candidate.closest('[hidden], [inert], [aria-hidden="true"]')
    ) {
      continue;
    }

    const view = ownerDocument.defaultView;
    if (view) {
      const style = view.getComputedStyle(candidate);
      if (style.visibility === "hidden" || style.visibility === "collapse") {
        continue;
      }
      let ancestor: HTMLElement | null = candidate;
      while (ancestor && view.getComputedStyle(ancestor).display !== "none") {
        ancestor = ancestor.parentElement;
      }
      if (ancestor) continue;
    }

    candidate.focus();
    if (ownerDocument.activeElement !== previousActiveElement) return;
  }
}

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
          const customKey = errorElement.getAttribute("data-error-key");
          this.timeout = setTimeout(
            () =>
              focusErrorElement(
                errorElement,
                customKey !== null && errorKeys.has(customKey),
              ),
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
