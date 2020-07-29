import { Component } from "react";
import { connect } from "formik";
import scrollToElement from "scroll-to-element";

// Based on this gist: https://gist.github.com/dphrag/4db3b453e02567a0bb52592679554a5b
class ErrorFocus extends Component {
  static defaultProps = {
    offset: 0,
    align: "top",
    focusDelay: 200,
    ease: "linear",
    duration: 1000
  };

  /**
   *  @errors - object, get errors from formik
   *  @firstNameValue - String, get first key error from errors object
   */
  getFirstElementErrors = (errors, firstNameValue) => {
    const firstError = errors[firstNameValue];

    if (typeof firstError === "object" && !Array.isArray(firstError)) {
      const keysLayerOne = Object.keys(firstError);
      return `${firstElement}-${keysLayerOne[0]}`;
    }

    if (typeof firstError === "object" && Array.isArray(firstError)) {
      for (let i = 0; i < firstError.length; i++) {
        if (firstError[i]) {
          const elements = Object.keys(firstError[i]);
          return `${firstNameValue}[${i}].${elements[0]}`;
        }
      }
    }
    return firstNameValue;
  };

  componentDidUpdate(prevProps) {
    const { isSubmitting, isValidating, errors } = prevProps.formik;
    const keys = Object.keys(errors);

    if (keys.length > 0 && isSubmitting && !isValidating) {
      const getNameInputError = this.getFirstElementErrors(errors, keys[0]);
      const selector = `[name="${getNameInputError}"]`;
      const errorElement = document.querySelector(selector);

      if (errorElement) {
        const { offset, ease, duration, focusDelay, align } = this.props;
        scrollToElement(errorElement, {
          offset,
          ease,
          duration,
          align
        });

        this.timeout = setTimeout(
          () => errorElement.focus(),
          duration + focusDelay
        );
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
