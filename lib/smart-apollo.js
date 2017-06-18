'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SmartSubscription = exports.SmartQuery = undefined;

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash.omit');

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require('./utils');

var _consts = require('./consts');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SmartApollo = function () {
  function SmartApollo(vm, key, options) {
    var _this = this;

    var autostart = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

    _classCallCheck(this, SmartApollo);

    this.type = null;
    this.vueApolloSpecialKeys = [];

    this.vm = vm;
    this.key = key;
    this.options = options;
    this._skip = false;
    this._watchers = [];

    // Query callback
    if (typeof this.options.query === 'function') {
      var queryCb = this.options.query.bind(this.vm);
      this.options.query = queryCb();
      this._watchers.push(this.vm.$watch(queryCb, function (query) {
        _this.options.query = query;
        _this.refresh();
      }));
    }

    if (autostart) {
      this.autostart();
    }
  }

  _createClass(SmartApollo, [{
    key: 'autostart',
    value: function autostart() {
      if (typeof this.options.skip === 'function') {
        this._watchers.push(this.vm.$watch(this.options.skip.bind(this.vm), this.skipChanged.bind(this), {
          immediate: true
        }));
      } else if (!this.options.skip) {
        this.start();
      } else {
        this._skip = true;
      }
    }
  }, {
    key: 'skipChanged',
    value: function skipChanged(value, oldValue) {
      if (value !== oldValue) {
        this.skip = value;
      }
    }
  }, {
    key: 'refresh',
    value: function refresh() {
      if (!this._skip) {
        this.stop();
        this.start();
      }
    }
  }, {
    key: 'start',
    value: function start() {
      var _this2 = this;

      this.starting = true;
      if (typeof this.options.variables === 'function') {
        var cb = this.executeApollo.bind(this);
        cb = this.options.throttle ? (0, _utils.throttle)(cb, this.options.throttle) : cb;
        cb = this.options.debounce ? (0, _utils.debounce)(cb, this.options.debounce) : cb;
        this.unwatchVariables = this.vm.$watch(function () {
          return _this2.options.variables.bind(_this2.vm)();
        }, cb, {
          immediate: true
        });
      } else {
        this.executeApollo(this.options.variables);
      }
    }
  }, {
    key: 'stop',
    value: function stop() {
      if (this.unwatchVariables) {
        this.unwatchVariables();
        this.unwatchVariables = null;
      }

      if (this.sub) {
        this.sub.unsubscribe();
        this.sub = null;
      }
    }
  }, {
    key: 'generateApolloOptions',
    value: function generateApolloOptions(variables) {
      var apolloOptions = (0, _lodash2.default)(this.options, this.vueApolloSpecialKeys);
      apolloOptions.variables = variables;
      return apolloOptions;
    }
  }, {
    key: 'executeApollo',
    value: function executeApollo(variables) {
      this.starting = false;
    }
  }, {
    key: 'nextResult',
    value: function nextResult() {
      throw new Error('Not implemented');
    }
  }, {
    key: 'catchError',
    value: function catchError(error) {
      if (error.graphQLErrors && error.graphQLErrors.length !== 0) {
        console.error('GraphQL execution errors for ' + this.type + ' \'' + this.key + '\'');
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = error.graphQLErrors[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var e = _step.value;

            console.error(e);
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
      } else if (error.networkError) {
        console.error('Error sending the ' + this.type + ' \'' + this.key + '\'', error.networkError);
      } else {
        console.error('[vue-apollo] An error has occured for ' + this.type + ' \'' + this.key + '\'');
        if (Array.isArray(error)) {
          var _console;

          (_console = console).error.apply(_console, _toConsumableArray(error));
        } else {
          console.error(error);
        }
      }

      if (typeof this.options.error === 'function') {
        this.options.error.call(this.vm, error);
      }
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.stop();
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this._watchers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var unwatch = _step2.value;

          unwatch();
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }, {
    key: 'skip',
    get: function get() {
      return this._skip;
    },
    set: function set(value) {
      if (value) {
        this.stop();
      } else {
        this.start();
      }
      this._skip = value;
    }
  }]);

  return SmartApollo;
}();

var SmartQuery = exports.SmartQuery = function (_SmartApollo) {
  _inherits(SmartQuery, _SmartApollo);

  function SmartQuery(vm, key, options) {
    var autostart = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

    _classCallCheck(this, SmartQuery);

    // Options object callback
    while (typeof options === 'function') {
      options = options.call(vm);
    }

    // Simple query
    if (!options.query) {
      var query = options;
      options = {
        query: query
      };
    }

    var _this3 = _possibleConstructorReturn(this, (SmartQuery.__proto__ || Object.getPrototypeOf(SmartQuery)).call(this, vm, key, options, autostart));

    _this3.type = 'query';
    _this3.vueApolloSpecialKeys = _consts.VUE_APOLLO_QUERY_KEYWORDS;
    _this3.loading = false;
    return _this3;
  }

  _createClass(SmartQuery, [{
    key: 'stop',
    value: function stop() {
      _get(SmartQuery.prototype.__proto__ || Object.getPrototypeOf(SmartQuery.prototype), 'stop', this).call(this);

      if (this.observer) {
        this.observer.stopPolling();
        this.observer = null;
      }
    }
  }, {
    key: 'executeApollo',
    value: function executeApollo(variables) {
      if (this.observer) {
        // Update variables
        // Don't use setVariables directly or it will ignore cache
        this.observer.setOptions(this.generateApolloOptions(variables));
      } else {
        if (this.sub) {
          this.sub.unsubscribe();
        }

        // Create observer
        this.observer = this.vm.$apollo.watchQuery(this.generateApolloOptions(variables)

        // Create subscription
        );this.sub = this.observer.subscribe({
          next: this.nextResult.bind(this),
          error: this.catchError.bind(this)
        });
      }

      this.maySetLoading();

      _get(SmartQuery.prototype.__proto__ || Object.getPrototypeOf(SmartQuery.prototype), 'executeApollo', this).call(this, variables);
    }
  }, {
    key: 'maySetLoading',
    value: function maySetLoading() {
      var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      var currentResult = this.observer.currentResult();
      if (force || currentResult.loading) {
        if (!this.loading) {
          this.applyLoadingModifier(1);
        }
        this.loading = true;
      }
    }
  }, {
    key: 'nextResult',
    value: function nextResult(result) {
      var data = result.data,
          loading = result.loading;


      if (!loading) {
        this.loadingDone();
      }

      if (typeof data === 'undefined') {
        // No result
      } else if (typeof this.options.update === 'function') {
        this.vm[this.key] = this.options.update.call(this.vm, data);
      } else if (data[this.key] === undefined) {
        console.error('Missing ' + this.key + ' attribute on result', data);
      } else {
        this.vm[this.key] = data[this.key];
      }

      if (typeof this.options.result === 'function') {
        this.options.result.call(this.vm, result);
      }
    }
  }, {
    key: 'catchError',
    value: function catchError(error) {
      _get(SmartQuery.prototype.__proto__ || Object.getPrototypeOf(SmartQuery.prototype), 'catchError', this).call(this, error);
      this.loadingDone();
    }
  }, {
    key: 'applyLoadingModifier',
    value: function applyLoadingModifier(value) {
      if (this.options.loadingKey) {
        this.vm[this.options.loadingKey] += value;
      }

      if (this.options.watchLoading) {
        this.options.watchLoading.call(this.vm, value === 1, value);
      }
    }
  }, {
    key: 'loadingDone',
    value: function loadingDone() {
      if (this.loading) {
        this.applyLoadingModifier(-1);
      }
      this.loading = false;
    }
  }, {
    key: 'fetchMore',
    value: function fetchMore() {
      if (this.observer) {
        var _observer;

        this.maySetLoading(true);
        return (_observer = this.observer).fetchMore.apply(_observer, arguments);
      }
    }
  }, {
    key: 'subscribeToMore',
    value: function subscribeToMore() {
      if (this.observer) {
        var _observer2;

        return {
          unsubscribe: (_observer2 = this.observer).subscribeToMore.apply(_observer2, arguments)
        };
      }
    }
  }, {
    key: 'refetch',
    value: function refetch(variables) {
      var _this4 = this;

      variables && (this.options.variables = variables);
      if (this.observer) {
        var result = this.observer.refetch(variables).then(function (result) {
          if (result.loading === false) {
            _this4.loadingDone();
          }
        });
        this.maySetLoading();
        return result;
      }
    }
  }, {
    key: 'setVariables',
    value: function setVariables(variables, tryFetch) {
      this.options.variables = variables;
      if (this.observer) {
        var result = this.observer.setVariables(variables, tryFetch);
        this.maySetLoading();
        return result;
      }
    }
  }, {
    key: 'setOptions',
    value: function setOptions(options) {
      Object.assign(this.options, options);
      if (this.observer) {
        var result = this.observer.setOptions(options);
        this.maySetLoading();
        return result;
      }
    }
  }, {
    key: 'startPolling',
    value: function startPolling() {
      if (this.observer) {
        var _observer3;

        return (_observer3 = this.observer).startPolling.apply(_observer3, arguments);
      }
    }
  }, {
    key: 'stopPolling',
    value: function stopPolling() {
      if (this.observer) {
        var _observer4;

        return (_observer4 = this.observer).stopPolling.apply(_observer4, arguments);
      }
    }
  }]);

  return SmartQuery;
}(SmartApollo);

var SmartSubscription = exports.SmartSubscription = function (_SmartApollo2) {
  _inherits(SmartSubscription, _SmartApollo2);

  function SmartSubscription(vm, key, options) {
    var autostart = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

    _classCallCheck(this, SmartSubscription);

    // Options object callback
    while (typeof options === 'function') {
      options = options.call(vm);
    }

    var _this5 = _possibleConstructorReturn(this, (SmartSubscription.__proto__ || Object.getPrototypeOf(SmartSubscription)).call(this, vm, key, options, autostart));

    _this5.type = 'subscription';
    _this5.vueApolloSpecialKeys = ['variables', 'result', 'error', 'throttle', 'debounce'];
    return _this5;
  }

  _createClass(SmartSubscription, [{
    key: 'executeApollo',
    value: function executeApollo(variables) {
      if (this.sub) {
        this.sub.unsubscribe();
      }

      // Create observer
      this.observer = this.vm.$apollo.subscribe(this.generateApolloOptions(variables)

      // Create subscription
      );this.sub = this.observer.subscribe({
        next: this.nextResult.bind(this),
        error: this.catchError.bind(this)
      });

      _get(SmartSubscription.prototype.__proto__ || Object.getPrototypeOf(SmartSubscription.prototype), 'executeApollo', this).call(this, variables);
    }
  }, {
    key: 'nextResult',
    value: function nextResult(data) {
      if (typeof this.options.result === 'function') {
        this.options.result.call(this.vm, data);
      }
    }
  }]);

  return SmartSubscription;
}(SmartApollo);