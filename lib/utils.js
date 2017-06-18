'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.debounce = exports.throttle = exports.Globals = undefined;
exports.getMergedDefinition = getMergedDefinition;

var _lodash = require('lodash.throttle');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.debounce');

var _lodash4 = _interopRequireDefault(_lodash3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Globals = exports.Globals = {};

function factory(action) {
  return function (cb, options) {
    if (typeof options === 'number') {
      return action(cb, options);
    } else {
      return action(cb, options.wait, options);
    }
  };
}

var throttle = exports.throttle = factory(_lodash2.default);

var debounce = exports.debounce = factory(_lodash4.default);

function getMergedDefinition(def) {
  return Globals.Vue.util.mergeOptions({}, def);
}