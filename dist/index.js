'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var vuex = require('vuex');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var useRootNamespace = { root: true };
var ModuleBuilderImpl = /** @class */ (function () {
    function ModuleBuilderImpl(namespace, _initialState) {
        this.namespace = namespace;
        this._initialState = _initialState;
        this._getters = {};
        this._mutations = {};
        this._actions = {};
        this._moduleBuilders = {};
    }
    ModuleBuilderImpl.prototype.state = function () {
        var _this = this;
        if (!this.namespace) {
            return function () { return _this._store.state; };
        }
        else if (this.namespace.indexOf("/") < 0) {
            return function () { return _this._store.state[_this.namespace]; };
        }
        else {
            var namespaces_1 = this.namespace.split("/");
            return function () {
                var accessor = _this._store.state;
                for (var _i = 0, namespaces_2 = namespaces_1; _i < namespaces_2.length; _i++) {
                    var name_1 = namespaces_2[_i];
                    accessor = accessor[name_1];
                }
                return accessor;
            };
        }
    };
    ModuleBuilderImpl.prototype.setInitialState = function (initialState) {
        this._initialState = initialState;
    };
    ModuleBuilderImpl.prototype.module = function (namespace, initialState) {
        var existingModule = this._moduleBuilders[namespace];
        var qualifiedNamespace = qualifyNamespace(this.namespace, namespace);
        if (!initialState && existingModule) {
            return existingModule;
        }
        // both arguments: create a module
        if (existingModule && initialState) {
            existingModule.setInitialState(initialState);
            return existingModule;
        }
        var nestedBuilder = new ModuleBuilderImpl(qualifiedNamespace, initialState || null);
        this._moduleBuilders[namespace] = nestedBuilder;
        return nestedBuilder;
    };
    ModuleBuilderImpl.prototype.commit = function (handler, name) {
        var _this = this;
        var _a = qualifyKey(handler, this.namespace, name), key = _a.key, namespacedKey = _a.namespacedKey;
        if (this._mutations[key]) {
            throw new Error("There is already a mutation named " + key + ".");
        }
        this._mutations[key] = handler;
        return (function (payload) { return _this._store.commit(namespacedKey, payload, useRootNamespace); });
    };
    ModuleBuilderImpl.prototype.dispatch = function (handler, name) {
        var _this = this;
        var _a = qualifyKey(handler, this.namespace, name), key = _a.key, namespacedKey = _a.namespacedKey;
        if (this._actions[key]) {
            throw new Error("There is already an action named " + key + ".");
        }
        this._actions[key] = handler;
        return function (payload) { return _this._store.dispatch(namespacedKey, payload, useRootNamespace); };
    };
    ModuleBuilderImpl.prototype.read = function (handler, name) {
        var _this = this;
        var _a = qualifyKey(handler, this.namespace, name), key = _a.key, namespacedKey = _a.namespacedKey;
        if (this._getters[key]) {
            throw new Error("There is already a getter named " + key + ".");
        }
        this._getters[key] = handler;
        return function () {
            if (_this._store.rootGetters) {
                return _this._store.rootGetters[namespacedKey];
            }
            return _this._store.getters[namespacedKey];
        };
    };
    ModuleBuilderImpl.prototype.vuexModule = function () {
        if (!this._vuexModule) {
            // build nested modules recursively, if any
            var modules = {};
            for (var _i = 0, _a = Object.keys(this._moduleBuilders); _i < _a.length; _i++) {
                var namespace = _a[_i];
                modules[namespace] = this._moduleBuilders[namespace].vuexModule();
            }
            this._vuexModule = {
                namespaced: true,
                state: this._initialState || {},
                getters: this._getters,
                mutations: this._mutations,
                actions: this._actions,
                modules: modules
            };
        }
        return this._vuexModule;
    };
    ModuleBuilderImpl.prototype._provideStore = function (store) {
        this._store = store;
        forEachValue(this._moduleBuilders, function (m) { return m._provideStore(store); });
    };
    return ModuleBuilderImpl;
}());
function qualifyKey(handler, namespace, name) {
    var key = name || handler.name;
    if (!key) {
        throw new Error("Vuex handler functions must not be anonymous. Possible causes: fat-arrow functions, uglify.  To fix, pass a unique name as a second parameter after your callback.");
    }
    return { key: key, namespacedKey: qualifyNamespace(namespace, key) };
}
function qualifyNamespace(namespace, key) {
    return namespace ? namespace + "/" + key : key;
}
var StoreBuilderImpl = /** @class */ (function (_super) {
    __extends(StoreBuilderImpl, _super);
    function StoreBuilderImpl() {
        return _super.call(this, "", {}) || this;
    }
    StoreBuilderImpl.prototype.module = function (namespace, initialState) {
        return _super.prototype.module.call(this, namespace, initialState);
    };
    StoreBuilderImpl.prototype.vuexStore = function (overrideOptions) {
        if (overrideOptions === void 0) { overrideOptions = {}; }
        if (!this._store) {
            var options = __assign(__assign({}, this.vuexModule()), overrideOptions);
            var store_1 = new vuex.Store(options);
            forEachValue(this._moduleBuilders, function (m) { return m._provideStore(store_1); });
            this._store = store_1;
        }
        return this._store;
    };
    StoreBuilderImpl.prototype.registerModule = function (namespace) {
        if (this._store && this._vuexModule) {
            var mBuilder = this._moduleBuilders[namespace];
            if (!mBuilder)
                throw 'fail to register module: ' + namespace;
            mBuilder._provideStore(this._store);
            var vModule = mBuilder.vuexModule();
            this._store.registerModule(namespace, vModule);
            this._vuexModule.modules[namespace] = vModule;
        }
        else {
            throw 'vuexStore hasn\'t been called yet, use module() instead.';
        }
    };
    StoreBuilderImpl.prototype.reset = function () {
        this._store = undefined;
        this._moduleBuilders = {};
    };
    return StoreBuilderImpl;
}(ModuleBuilderImpl));
var forEachValue = function (dict, loop) {
    Object.keys(dict).forEach(function (key) { return loop(dict[key]); });
};
var storeBuilderSingleton = new StoreBuilderImpl();
var namedStoreBuilderMap = Object.create(null);
function getStoreBuilder(name) {
    // the default store builder
    if (!name) {
        return storeBuilderSingleton;
    }
    // a named store builder
    var builder = namedStoreBuilderMap[name] || (namedStoreBuilderMap[name] = new StoreBuilderImpl());
    return builder;
}

exports.getStoreBuilder = getStoreBuilder;
//# sourceMappingURL=index.js.map
