'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ApolloProvider = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.willPrefetch = willPrefetch;

var _lodash = require('lodash.omit');

var _lodash2 = _interopRequireDefault(_lodash);

var _consts = require('./consts');

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ApolloProvider = exports.ApolloProvider = function () {
  function ApolloProvider(options) {
    _classCallCheck(this, ApolloProvider);

    if (!options) {
      throw new Error('Options argument required');
    }
    this.clients = options.clients || {};
    this.clients.defaultClient = this.defaultClient = options.defaultClient;

    this.prefetchQueries = [];
  }

  _createClass(ApolloProvider, [{
    key: 'willPrefetchQuery',
    value: function willPrefetchQuery(queryOptions, client) {
      this.prefetchQueries.push({
        queryOptions: queryOptions,
        client: client
      });
    }
  }, {
    key: 'willPrefetch',
    value: function willPrefetch(component) {
      component = (0, _utils.getMergedDefinition)(component);
      var apolloOptions = component.apollo;

      if (!apolloOptions) {
        return;
      }

      var componentClient = apolloOptions.$client;
      for (var key in apolloOptions) {
        var options = apolloOptions[key];
        if (!options.query || (typeof options.ssr === 'undefined' || options.ssr) && typeof options.prefetch !== 'undefined' && options.prefetch) {
          this.willPrefetchQuery(options, options.client || componentClient);
        }
      }
    }
  }, {
    key: 'willPrefetchComponents',
    value: function willPrefetchComponents(definitions) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = definitions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var def = _step.value;

          this.willPrefetch(def);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: 'prefetchAll',
    value: function prefetchAll(context, components, options) {
      var _this = this;

      // Optional components argument
      if (!options && components && !Array.isArray(components)) {
        options = components;
        components = undefined;
      }

      var finalOptions = Object.assign({}, {
        includeGlobal: true
      }, options);

      if (components) {
        this.willPrefetchComponents(components);
      }

      if (finalOptions.includeGlobal) {
        this.willPrefetchComponents(globalPrefetchs);
      }

      return Promise.all(this.prefetchQueries.map(function (o) {
        return _this.prefetchQuery(o.queryOptions, context, o.client);
      }));
    }
  }, {
    key: 'prefetchQuery',
    value: function prefetchQuery(queryOptions, context, client) {
      var variables = void 0;

      // Client
      if (!client) {
        client = this.defaultClient;
      } else if (typeof client === 'string') {
        client = this.clients[client];
        if (!client) {
          throw new Error('[vue-apollo] Missing client \'' + client + '\' in \'apolloProvider\'');
        }
      }

      // Simple query
      if (!queryOptions.query) {
        queryOptions = {
          query: queryOptions
        };
      } else {
        var prefetch = queryOptions.prefetch;
        var prefetchType = typeof prefetch === 'undefined' ? 'undefined' : _typeof(prefetch);

        // Resolve variables
        if (prefetchType !== 'undefined') {
          var result = void 0;
          if (prefetchType === 'function') {
            result = prefetch(context);
          } else {
            result = prefetch;
          }

          var optVariables = queryOptions.variables;

          if (!result) {
            return Promise.resolve();
          } else if (prefetchType === 'boolean' && typeof optVariables !== 'undefined') {
            // Reuse `variables` option with `prefetch: true`
            if (typeof optVariables === 'function') {
              variables = optVariables.call(context);
            } else {
              variables = optVariables;
            }
          } else {
            variables = result;
          }
        }
      }

      // Query
      return new Promise(function (resolve, reject) {
        var options = (0, _lodash2.default)(queryOptions, _consts.VUE_APOLLO_QUERY_KEYWORDS);
        options.variables = variables;
        client.query(options).then(resolve, reject);
      });
    }
  }, {
    key: 'exportStates',
    value: function exportStates(options) {
      var finalOptions = Object.assign({}, {
        exportNamespace: '',
        globalName: '__APOLLO_STATE__',
        attachTo: 'window'
      }, options);

      var js = finalOptions.attachTo + '.' + finalOptions.globalName + ' = {';
      for (var key in this.clients) {
        var client = this.clients[key];
        var state = _defineProperty({}, client.reduxRootKey || 'apollo', client.getInitialState());
        js += '[\'' + finalOptions.exportNamespace + key + '\']:' + JSON.stringify(state) + ',';
      }
      js += '};';
      return js;
    }
  }]);

  return ApolloProvider;
}();

var globalPrefetchs = [];

function willPrefetch(component) {
  globalPrefetchs.push(component);
  return component;
}