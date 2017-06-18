'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.willPrefetch = undefined;

var _apolloProvider = require('./apollo-provider');

Object.defineProperty(exports, 'willPrefetch', {
  enumerable: true,
  get: function get() {
    return _apolloProvider.willPrefetch;
  }
});

var _lodash = require('lodash.omit');

var _lodash2 = _interopRequireDefault(_lodash);

var _dollarApollo = require('./dollar-apollo');

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var keywords = ['$subscribe'];

var prepare = function prepare() {
  if (this.$options.apolloProvider) {
    this._apolloProvider = this.$options.apolloProvider;
  }

  if (this._apolloPrepared) return;
  this._apolloPrepared = true;

  // Prepare properties
  var apollo = this.$options.apollo;
  if (apollo) {
    this._apolloQueries = {};
    this._apolloInitData = {};

    // watchQuery
    for (var key in apollo) {
      if (key.charAt(0) !== '$') {
        this._apolloInitData[key] = null;
        this._apolloQueries[key] = apollo[key];
      }
    }
  }
};

var launch = function launch() {
  if (this._apolloLaunched) return;
  this._apolloLaunched = true;

  if (this._apolloQueries) {
    // watchQuery
    for (var key in this._apolloQueries) {
      this.$apollo.addSmartQuery(key, this._apolloQueries[key]);
    }
  }

  var apollo = this.$options.apollo;
  if (apollo) {
    if (apollo.subscribe) {
      _utils.Globals.Vue.util.warn('vue-apollo -> `subscribe` option is deprecated. Use the `$subscribe` option instead.');
    }

    if (apollo.$subscribe) {
      for (var _key in apollo.$subscribe) {
        this.$apollo.addSmartSubscription(_key, apollo.$subscribe[_key]);
      }
    }

    defineReactiveSetter(this.$apollo, 'skipAll', apollo.$skipAll);
    defineReactiveSetter(this.$apollo, 'skipAllQueries', apollo.$skipAllQueries);
    defineReactiveSetter(this.$apollo, 'skipAllSubscriptions', apollo.$skipAllSubscriptions);
    defineReactiveSetter(this.$apollo, 'client', apollo.$client);
  }
};

function defineReactiveSetter($apollo, key, value) {
  if (typeof value !== 'undefined') {
    if (typeof value === 'function') {
      $apollo.defineReactiveSetter(key, value);
    } else {
      $apollo[key] = value;
    }
  }
}

function install(Vue, options) {
  if (install.installed) return;
  install.installed = true;

  _utils.Globals.Vue = Vue;

  // Options merging
  var merge = Vue.config.optionMergeStrategies.methods;
  Vue.config.optionMergeStrategies.apollo = function (toVal, fromVal, vm) {
    if (!toVal) return fromVal;
    if (!fromVal) return toVal;

    var toData = Object.assign({}, (0, _lodash2.default)(toVal, keywords), toVal.data);
    var fromData = Object.assign({}, (0, _lodash2.default)(fromVal, keywords), fromVal.data);

    var map = {};
    for (var i = 0; i < keywords.length; i++) {
      var key = keywords[i];
      map[key] = merge(toVal[key], fromVal[key]);
    }

    return Object.assign(map, merge(toData, fromData));
  };

  // Lazy creation
  Object.defineProperty(Vue.prototype, '$apollo', {
    get: function get() {
      if (!this._apollo) {
        this._apollo = new _dollarApollo.DollarApollo(this);
      }
      return this._apollo;
    }
  });

  Vue.mixin({

    // Vue 1.x
    init: prepare,
    // Vue 2.x
    beforeCreate: prepare,

    // Better devtools support
    data: function data() {
      return this._apolloInitData || {};
    },


    created: launch,

    destroyed: function destroyed() {
      if (this._apollo) {
        this._apollo.destroy();
        this._apollo = null;
      }
    }

  });
}

_apolloProvider.ApolloProvider.install = install;

exports.default = _apolloProvider.ApolloProvider;