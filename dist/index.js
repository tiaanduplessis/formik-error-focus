var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === "object") || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (
  (target = mod != null ? __create(__getProtoOf(mod)) : {}),
  __copyProps(
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, "default", { value: mod, enumerable: true })
      : target,
    mod
  )
);
var __toCommonJS = (mod) =>
  __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.tsx
var src_exports = {};
__export(src_exports, {
  default: () => src_default,
});
module.exports = __toCommonJS(src_exports);
var import_react = require("react");
var import_formik = require("formik");
var import_scroll_to_element = __toESM(require("scroll-to-element"));
var import_flat = __toESM(require("flat"));
var ErrorFocus = class extends import_react.Component {
  constructor() {
    super(...arguments);
    this.timeout = null;
  }
  componentDidUpdate(prevProps) {
    const { isSubmitting, isValidating, errors } = prevProps.formik;
    const keys = Object.keys((0, import_flat.default)(errors));
    if (keys.length > 0 && isSubmitting && !isValidating) {
      const selector = `[data-error-key="${keys[0]}"]`;
      const fallbackSelector = `[name="${keys[0]}"]`;
      const errorElement =
        document.querySelector(selector) ||
        document.querySelector(fallbackSelector);
      if (errorElement) {
        const { offset, ease, duration, focusDelay, align } = this.props;
        (0, import_scroll_to_element.default)(errorElement, {
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
var src_default = (0, import_formik.connect)(ErrorFocus);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
