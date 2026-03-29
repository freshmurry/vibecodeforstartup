"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateManager = void 0;
/**
 * State manager implementation for Durable Objects
 * Works with the Agent's state management
 */
var StateManager = /** @class */ (function () {
    function StateManager(getStateFunc, setStateFunc) {
        this.getStateFunc = getStateFunc;
        this.setStateFunc = setStateFunc;
    }
    StateManager.prototype.getState = function () {
        return this.getStateFunc();
    };
    StateManager.prototype.setState = function (newState) {
        this.setStateFunc(newState);
    };
    StateManager.prototype.updateField = function (field, value) {
        var _a;
        var currentState = this.getState();
        this.setState(__assign(__assign({}, currentState), (_a = {}, _a[field] = value, _a)));
    };
    StateManager.prototype.batchUpdate = function (updates) {
        var currentState = this.getState();
        this.setState(__assign(__assign({}, currentState), updates));
    };
    return StateManager;
}());
exports.StateManager = StateManager;
