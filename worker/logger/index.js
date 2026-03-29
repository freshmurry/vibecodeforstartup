"use strict";
/**
 * Simple Structured Logging System
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
exports.LogMethod = LogMethod;
exports.WithLogger = WithLogger;
__exportStar(require("./types"), exports);
__exportStar(require("./core"), exports);
var core_1 = require("./core");
// Configure logger for Cloudflare Workers environment
core_1.LoggerFactory.configure({
    level: 'info',
    prettyPrint: false, // JSON output for optimal Cloudflare Workers Logs indexing
});
/**
 * Main Logger utilities - simplified API
 */
exports.Logger = {
    /**
     * Create a component logger
     */
    create: core_1.createLogger,
    /**
     * Create an object logger
     */
    forObject: core_1.createObjectLogger,
    /**
     * Configure global logging settings
     */
    configure: core_1.LoggerFactory.configure.bind(core_1.LoggerFactory),
    /**
     * Get current configuration
     */
    getConfig: core_1.LoggerFactory.getConfig.bind(core_1.LoggerFactory),
};
/**
 * Method decorator for automatic logging (simplified)
 */
function LogMethod(component) {
    return function (target, propertyKey, descriptor) {
        var _a;
        var originalMethod = descriptor.value;
        var className = ((_a = target === null || target === void 0 ? void 0 : target.constructor) === null || _a === void 0 ? void 0 : _a.name) ||
            'UnknownClass';
        var methodName = propertyKey;
        var loggerComponent = component || className;
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var logger = (0, core_1.createObjectLogger)(this, loggerComponent);
            logger.debug("Entering method: ".concat(methodName), {
                argsCount: args.length,
            });
            try {
                var result = originalMethod.apply(this, args);
                if (result && typeof result === 'object' && 'then' in result) {
                    // Handle async methods
                    return result.then(function (res) {
                        logger.debug("Exiting method: ".concat(methodName), {
                            success: true,
                        });
                        return res;
                    }, function (error) {
                        logger.error("Method ".concat(methodName, " failed"), error);
                        throw error;
                    });
                }
                else {
                    logger.debug("Exiting method: ".concat(methodName), {
                        success: true,
                    });
                    return result;
                }
            }
            catch (error) {
                logger.error("Method ".concat(methodName, " failed"), error);
                throw error;
            }
        };
        return descriptor;
    };
}
/**
 * Class decorator for automatic logger injection
 */
function WithLogger(component) {
    return function (constructor) {
        return /** @class */ (function (_super) {
            __extends(class_1, _super);
            function class_1() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var _this = _super.apply(this, args) || this;
                _this.logger = (0, core_1.createObjectLogger)(_this, component || constructor.name);
                return _this;
            }
            return class_1;
        }(constructor));
    };
}
// Export default logger instance for quick usage
exports.default = exports.Logger;
