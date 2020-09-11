function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var react = require('react');
var formik = require('formik');
var scrollToElement = _interopDefault(require('scroll-to-element'));

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

var ErrorFocus =
/*#__PURE__*/
function (_Component) {
  _inheritsLoose(ErrorFocus, _Component);

  function ErrorFocus() {
    return _Component.apply(this, arguments) || this;
  }

  var _proto = ErrorFocus.prototype;

  _proto.componentDidUpdate = function componentDidUpdate(prevProps) {
    var _prevProps$formik = prevProps.formik,
        isSubmitting = _prevProps$formik.isSubmitting,
        isValidating = _prevProps$formik.isValidating,
        errors = _prevProps$formik.errors;
    var keys = Object.keys(errors);

    if (keys.length > 0 && isSubmitting && !isValidating) {
      var selector = "[data-error-key=\"" + keys[0] + "\"]";
      var fallbackSelector = "[name=\"" + keys[0] + "\"]";
      var errorElement = document.querySelector(selector) || document.querySelector(fallbackSelector);

      if (errorElement) {
        var _this$props = this.props,
            offset = _this$props.offset,
            ease = _this$props.ease,
            duration = _this$props.duration,
            focusDelay = _this$props.focusDelay,
            align = _this$props.align;
        scrollToElement(errorElement, {
          offset: offset,
          ease: ease,
          duration: duration,
          align: align
        });
        this.timeout = setTimeout(function () {
          return errorElement.focus();
        }, duration + focusDelay);
      }
    }
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  };

  _proto.render = function render() {
    return null;
  };

  return ErrorFocus;
}(react.Component);

ErrorFocus.defaultProps = {
  offset: 0,
  align: 'top',
  focusDelay: 200,
  ease: 'linear',
  duration: 1000
};
var index = formik.connect(ErrorFocus);

module.exports = index;
