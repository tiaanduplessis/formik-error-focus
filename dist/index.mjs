// src/index.tsx
import { Component } from "react";
import { connect } from "formik";
import scrollToElement from "scroll-to-element";
import flatten from "flat";
var ErrorFocus = class extends Component {
  constructor() {
    super(...arguments);
    this.timeout = null;
  }
  componentDidUpdate(prevProps) {
    const { isSubmitting, isValidating, errors } = prevProps.formik;
    const keys = Object.keys(flatten(errors));
    if (keys.length > 0 && isSubmitting && !isValidating) {
      const selector = `[data-error-key="${keys[0]}"]`;
      const fallbackSelector = `[name="${keys[0]}"]`;
      const errorElement =
        document.querySelector(selector) ||
        document.querySelector(fallbackSelector);
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
};
ErrorFocus.defaultProps = {
  offset: 0,
  align: "top",
  focusDelay: 200,
  ease: "linear",
  duration: 1e3,
};
var src_default = connect(ErrorFocus);
export { src_default as default };
