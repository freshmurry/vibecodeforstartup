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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerFactory = exports.StructuredLogger = void 0;
exports.createLogger = createLogger;
exports.createObjectLogger = createObjectLogger;
/**
 * Simple Structured Logger
 */
var Sentry = require("@sentry/cloudflare");
var DEFAULT_CONFIG = {
    level: 'info',
    prettyPrint: false,
};
var LOG_LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};
// Credential scrubbing patterns removed by request
/**
 * Scrubbing disabled: pass-through
 */
function scrubCredentials(data) {
    return data;
}
var StructuredLogger = /** @class */ (function () {
    function StructuredLogger(component, objectContext, config) {
        this.additionalFields = {};
        this.component = component;
        this.objectContext = objectContext ? __assign({}, objectContext) : undefined;
        this.config = __assign(__assign({}, DEFAULT_CONFIG), config);
    }
    /**
     * Set the object ID dynamically
     */
    StructuredLogger.prototype.setObjectId = function (id) {
        if (!this.objectContext) {
            this.objectContext = { type: this.component, id: id };
        }
        else {
            this.objectContext.id = id;
        }
    };
    /**
     * Set additional fields that will be included in all log entries
     */
    StructuredLogger.prototype.setFields = function (fields) {
        this.additionalFields = __assign(__assign({}, this.additionalFields), fields);
    };
    /**
     * Set a single field
     */
    StructuredLogger.prototype.setField = function (key, value) {
        this.additionalFields[key] = value;
    };
    /**
     * Clear all additional fields
     */
    StructuredLogger.prototype.clearFields = function () {
        this.additionalFields = {};
    };
    /**
     * Create a child logger with extended context
     */
    StructuredLogger.prototype.child = function (childContext, component) {
        var newComponent = component || this.component;
        var mergedContext = __assign({ type: childContext.type || 'ChildLogger', id: childContext.id || "child-".concat(Date.now()) }, childContext);
        var childLogger = new StructuredLogger(newComponent, mergedContext, this.config);
        childLogger.setFields(this.additionalFields);
        return childLogger;
    };
    /**
     * Check if message should be logged based on level
     */
    StructuredLogger.prototype.shouldLog = function (level) {
        var configLevel = LOG_LEVELS[this.config.level || 'info'];
        var messageLevel = LOG_LEVELS[level];
        return messageLevel >= configLevel;
    };
    /**
     * Core logging method - builds structured JSON and outputs via console
     */
    StructuredLogger.prototype.log = function (level, message, data, error) {
        if (!this.shouldLog(level))
            return;
        var logEntry = {
            level: level,
            time: new Date().toISOString(),
            component: this.component,
            msg: scrubCredentials(message),
        };
        // Add object context if available
        if (this.objectContext) {
            logEntry.object = __assign({}, this.objectContext);
        }
        // Add additional fields with credential scrubbing
        if (Object.keys(this.additionalFields).length > 0) {
            var scrubbedAdditionalFields = scrubCredentials(this.additionalFields);
            Object.assign(logEntry, scrubbedAdditionalFields);
        }
        // Add structured data with credential scrubbing
        if (data) {
            try {
                var scrubbedData = scrubCredentials(data);
                if (scrubbedData && typeof scrubbedData === 'object' && !Array.isArray(scrubbedData)) {
                    Object.assign(logEntry, scrubbedData);
                }
            }
            catch (_a) {
                // If scrubbing fails, add a safe placeholder
                logEntry.data = '[DATA_SCRUB_FAILED]';
            }
        }
        // Add error details with credential scrubbing
        if (error instanceof Error) {
            logEntry.error = {
                name: error.name,
                message: scrubCredentials(error.message),
                stack: scrubCredentials(error.stack),
            };
        }
        // Output using appropriate method
        this.output(level, logEntry);
    };
    /**
     * Safe JSON stringify that handles circular references
     */
    StructuredLogger.prototype.safeStringify = function (obj) {
        var seen = new WeakSet();
        return JSON.stringify(obj, function (_key, value) {
            // Handle undefined, functions, symbols
            if (value === undefined || typeof value === 'function' || typeof value === 'symbol') {
                return undefined;
            }
            // Handle BigInt
            if (typeof value === 'bigint') {
                return value.toString();
            }
            // Handle circular references
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                    return '[Circular]';
                }
                seen.add(value);
                // Handle Error objects specially to preserve stack traces
                if (value instanceof Error) {
                    return __assign({ name: value.name, message: value.message, stack: value.stack }, Object.getOwnPropertyNames(value).reduce(function (acc, prop) {
                        if (!['name', 'message', 'stack'].includes(prop)) {
                            var descriptor = Object.getOwnPropertyDescriptor(value, prop);
                            if (descriptor && descriptor.enumerable) {
                                acc[prop] = value[prop];
                            }
                        }
                        return acc;
                    }, {}));
                }
            }
            return value;
        });
    };
    /**
     * Output log entry using console methods
     */
    StructuredLogger.prototype.output = function (level, logEntry) {
        var consoleMethod = this.getConsoleMethod(level);
        if (this.config.prettyPrint) {
            // Pretty formatted output for development
            var objectInfo = logEntry.object
                ? "[".concat(logEntry.object.type).concat(logEntry.object.id ? "#".concat(logEntry.object.id) : '', "]")
                : '';
            var prefix = "".concat(logEntry.time, " ").concat(level.toUpperCase(), " ").concat(logEntry.component).concat(objectInfo);
            // Extract additional data excluding base fields
            var _ = logEntry.level, time = logEntry.time, component = logEntry.component, msg = logEntry.msg, object = logEntry.object, error = logEntry.error, additionalData = __rest(logEntry, ["level", "time", "component", "msg", "object", "error"]);
            var hasAdditionalData = Object.keys(additionalData).length > 0;
            if (hasAdditionalData || error) {
                var extraInfo = {};
                if (hasAdditionalData)
                    Object.assign(extraInfo, additionalData);
                if (error)
                    extraInfo.error = error;
                console[consoleMethod]("".concat(prefix, ": ").concat(msg), extraInfo);
            }
            else {
                console[consoleMethod]("".concat(prefix, ": ").concat(msg));
            }
        }
        else {
            // Structured JSON output for production (optimal for Cloudflare Workers Logs)
            try {
                var jsonStr = this.safeStringify(logEntry);
                console[consoleMethod](jsonStr);
            }
            catch (e) {
                // Fallback if even safe stringify fails
                console[consoleMethod](JSON.stringify({
                    level: logEntry.level,
                    time: logEntry.time,
                    component: logEntry.component,
                    msg: '[LOG_STRINGIFY_FAILED]',
                    stringifyError: e instanceof Error ? { name: e.name, message: e.message } : String(e),
                }));
            }
        }
    };
    /**
     * Get appropriate console method for log level
     */
    StructuredLogger.prototype.getConsoleMethod = function (level) {
        switch (level) {
            case 'debug':
                return 'debug';
            case 'info':
                return 'log';
            case 'warn':
                return 'warn';
            case 'error':
                return 'error';
            default:
                return 'log';
        }
    };
    /**
     * Process variable arguments into structured data
     */
    StructuredLogger.prototype.processArgs = function (args) {
        if (args.length === 0)
            return {};
        if (args.length === 1) {
            var arg = args[0];
            if (arg &&
                typeof arg === 'object' &&
                !Array.isArray(arg) &&
                !(arg instanceof Error)) {
                return arg;
            }
            return { data: arg };
        }
        // Multiple arguments
        var result = {};
        args.forEach(function (arg, index) {
            if (arg &&
                typeof arg === 'object' &&
                !Array.isArray(arg) &&
                !(arg instanceof Error)) {
                Object.assign(result, arg);
            }
            else {
                result["arg".concat(index)] = arg;
            }
        });
        return result;
    };
    /**
     * Process arguments with error handling
     */
    StructuredLogger.prototype.processArgsWithError = function (args) {
        var error;
        var otherArgs = [];
        var isErrorLike = function (value) {
            return (value !== null &&
                typeof value === 'object' &&
                ('message' in value || 'name' in value));
        };
        var toError = function (value) {
            var msg = typeof value.message === 'string' ? value.message : 'Unknown error';
            var err = new Error(msg);
            if (typeof value.name === 'string')
                err.name = value.name;
            if (typeof value.stack === 'string')
                err.stack = value.stack;
            return err;
        };
        args.forEach(function (arg) {
            if (arg instanceof Error) {
                error = arg;
                return;
            }
            if (isErrorLike(arg)) {
                error = toError(arg);
                return;
            }
            otherArgs.push(arg);
        });
        return {
            data: this.processArgs(otherArgs),
            error: error,
        };
    };
    // Public logging methods
    StructuredLogger.prototype.debug = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.log('debug', message, this.processArgs(args));
    };
    StructuredLogger.prototype.info = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.log('info', message, this.processArgs(args));
    };
    StructuredLogger.prototype.warn = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.log('warn', message, this.processArgs(args));
    };
    StructuredLogger.prototype.error = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var _a = this.processArgsWithError(args), data = _a.data, error = _a.error;
        Sentry.captureException(error || new Error(message), { extra: data });
        this.log('error', message, data, error);
    };
    StructuredLogger.prototype.trace = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.debug.apply(this, __spreadArray([message], args, false));
    };
    StructuredLogger.prototype.fatal = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.error.apply(this, __spreadArray([message], args, false));
    };
    return StructuredLogger;
}());
exports.StructuredLogger = StructuredLogger;
/**
 * Create a basic structured logger
 */
function createLogger(component, config) {
    return new StructuredLogger(component, undefined, config);
}
/**
 * Create logger with object context
 */
function createObjectLogger(obj, component, config) {
    var componentName = component || getObjectType(obj) || 'UnknownComponent';
    // Create basic object context without complex probing
    var objectContext = {
        type: componentName,
    };
    // Try to get ID safely
    if (obj && typeof obj === 'object') {
        var objWithId = obj;
        if (objWithId.id &&
            (typeof objWithId.id === 'string' ||
                typeof objWithId.id === 'number')) {
            objectContext.id = String(objWithId.id);
        }
    }
    return new StructuredLogger(componentName, objectContext, config);
}
/**
 * Safely get object type
 */
function getObjectType(obj) {
    var _a;
    try {
        if (obj && typeof obj === 'object') {
            return (_a = obj.constructor) === null || _a === void 0 ? void 0 : _a.name;
        }
        return typeof obj;
    }
    catch (_b) {
        return undefined;
    }
}
/**
 * Logger factory for global configuration
 */
var LoggerFactory = /** @class */ (function () {
    function LoggerFactory() {
    }
    LoggerFactory.configure = function (config) {
        this.globalConfig = __assign(__assign({}, this.globalConfig), config);
    };
    LoggerFactory.getConfig = function () {
        return __assign({}, this.globalConfig);
    };
    LoggerFactory.create = function (component) {
        return new StructuredLogger(component, undefined, this.globalConfig);
    };
    LoggerFactory.createForObject = function (obj, component) {
        return createObjectLogger(obj, component, this.globalConfig);
    };
    LoggerFactory.globalConfig = DEFAULT_CONFIG;
    return LoggerFactory;
}());
exports.LoggerFactory = LoggerFactory;
