'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DollarApollo = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _smartApollo = require('./smart-apollo');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DollarApollo = exports.DollarApollo = function () {
  function DollarApollo(vm) {
    _classCallCheck(this, DollarApollo);

    this._apolloSubscriptions = [];
    this._watchers = [];

    this.vm = vm;
    this.queries = {};
    this.subscriptions = {};
    this.client = undefined;
  }

  _createClass(DollarApollo, [{
    key: 'query',
    value: function query(options) {
      return this.getClient(options).query(options);
    }
  }, {
    key: 'getClient',
    value: function getClient(options) {
      if (!options || !options.client) {
        if (_typeof(this.client) === 'object') {
          return this.client;
        }
        if (this.client) {
          if (!this.provider.clients) {
            throw new Error('[vue-apollo] Missing \'clients\' options in \'apolloProvider\'');
          } else {
            var _client = this.provider.clients[this.client];
            if (!_client) {
              throw new Error('[vue-apollo] Missing client \'' + this.client + '\' in \'apolloProvider\'');
            }
            return _client;
          }
        }
        return this.provider.defaultClient;
      }
      var client = this.provider.clients[options.client];
      if (!client) {
        throw new Error('[vue-apollo] Missing client \'' + options.client + '\' in \'apolloProvider\'');
      }
      return client;
    }
  }, {
    key: 'watchQuery',
    value: function watchQuery(options) {
      var _this = this;

      var observable = this.getClient(options).watchQuery(options);
      var _subscribe = observable.subscribe.bind(observable);
      observable.subscribe = function (options) {
        var sub = _subscribe(options);
        _this._apolloSubscriptions.push(sub);
        return sub;
      };
      return observable;
    }
  }, {
    key: 'mutate',
    value: function mutate(options) {
      return this.getClient(options).mutate(options);
    }
  }, {
    key: 'subscribe',
    value: function subscribe(options) {
      var _this2 = this;

      var observable = this.getClient(options).subscribe(options);
      var _subscribe = observable.subscribe.bind(observable);
      observable.subscribe = function (options) {
        var sub = _subscribe(options);
        _this2._apolloSubscriptions.push(sub);
        return sub;
      };
      return observable;
    }
  }, {
    key: 'addSmartQuery',
    value: function addSmartQuery(key, options) {
      var smart = this.queries[key] = new _smartApollo.SmartQuery(this.vm, key, options, false);
      smart.autostart();
      return smart;
    }
  }, {
    key: 'addSmartSubscription',
    value: function addSmartSubscription(key, options) {
      var smart = this.subscriptions[key] = new _smartApollo.SmartSubscription(this.vm, key, options, false);
      smart.autostart();
      return smart;
    }
  }, {
    key: 'defineReactiveSetter',
    value: function defineReactiveSetter(key, func) {
      var _this3 = this;

      this._watchers.push(this.vm.$watch(func, function (value) {
        _this3[key] = value;
      }, {
        immediate: true
      }));
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this._watchers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var unwatch = _step.value;

          unwatch();
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

      for (var key in this.queries) {
        this.queries[key].destroy();
      }
      for (var _key in this.subscriptions) {
        this.subscriptions[_key].destroy();
      }
      this._apolloSubscriptions.forEach(function (sub) {
        sub.unsubscribe();
      });
      this._apolloSubscriptions = null;
      this.vm = null;
    }
  }, {
    key: 'provider',
    get: function get() {
      return this._apolloProvider || this.vm.$root._apolloProvider;
    }
  }, {
    key: 'skipAllQueries',
    set: function set(value) {
      for (var key in this.queries) {
        this.queries[key].skip = value;
      }
    }
  }, {
    key: 'skipAllSubscriptions',
    set: function set(value) {
      for (var key in this.subscriptions) {
        this.subscriptions[key].skip = value;
      }
    }
  }, {
    key: 'skipAll',
    set: function set(value) {
      this.skipAllQueries = value;
      this.skipAllSubscriptions = value;
    }
  }]);

  return DollarApollo;
}();