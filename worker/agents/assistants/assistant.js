"use strict";
// An assistant to agents
Object.defineProperty(exports, "__esModule", { value: true });
var Assistant = /** @class */ (function () {
    function Assistant(env, inferenceContext, systemPrompt) {
        this.history = [];
        this.env = env;
        this.inferenceContext = inferenceContext;
        if (systemPrompt) {
            this.history.push(systemPrompt);
        }
    }
    Assistant.prototype.save = function (messages) {
        var _a;
        (_a = this.history).push.apply(_a, messages);
        return this.history;
    };
    Assistant.prototype.getHistory = function () {
        return this.history;
    };
    Assistant.prototype.clearHistory = function () {
        this.history = [];
    };
    return Assistant;
}());
exports.default = Assistant;
