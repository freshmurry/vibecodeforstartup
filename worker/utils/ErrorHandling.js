"use strict";
/**
 * Error Handling Utilities
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControllerErrorHandler = exports.ErrorFactory = exports.ErrorHandler = exports.AppError = exports.AppErrorType = void 0;
var logger_1 = require("../logger");
var errors_1 = require("../../shared/types/errors");
var responses_1 = require("../api/responses");
var logger = (0, logger_1.createLogger)('ErrorHandling');
/**
 * Standard error types for the application
 */
var AppErrorType;
(function (AppErrorType) {
    AppErrorType["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    AppErrorType["AUTHENTICATION_ERROR"] = "AUTHENTICATION_ERROR";
    AppErrorType["AUTHORIZATION_ERROR"] = "AUTHORIZATION_ERROR";
    AppErrorType["NOT_FOUND_ERROR"] = "NOT_FOUND_ERROR";
    AppErrorType["CONFLICT_ERROR"] = "CONFLICT_ERROR";
    AppErrorType["RATE_LIMIT_ERROR"] = "RATE_LIMIT_ERROR";
    AppErrorType["EXTERNAL_SERVICE_ERROR"] = "EXTERNAL_SERVICE_ERROR";
    AppErrorType["INTERNAL_ERROR"] = "INTERNAL_ERROR";
})(AppErrorType || (exports.AppErrorType = AppErrorType = {}));
/**
 * Application error class
 */
var AppError = /** @class */ (function (_super) {
    __extends(AppError, _super);
    function AppError(type, message, statusCode, context) {
        if (statusCode === void 0) { statusCode = 500; }
        var _this = _super.call(this, message) || this;
        _this.type = type;
        _this.statusCode = statusCode;
        _this.context = context;
        _this.name = 'AppError';
        return _this;
    }
    return AppError;
}(Error));
exports.AppError = AppError;
/**
 * Error handling utilities
 */
var ErrorHandler = /** @class */ (function () {
    function ErrorHandler() {
    }
    /**
     * Handle and log error with context
     */
    ErrorHandler.handleError = function (error, operation, context) {
        var errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error("Error during ".concat(operation), __assign({ error: errorMessage, stack: error instanceof Error ? error.stack : undefined }, context));
        // Convert SecurityError to AppError
        if (error instanceof errors_1.SecurityError) {
            return new AppError(AppErrorType.AUTHENTICATION_ERROR, error.message, error.statusCode, context);
        }
        // Convert AppError
        if (error instanceof AppError) {
            return error;
        }
        // Default to internal error
        return new AppError(AppErrorType.INTERNAL_ERROR, "Failed to ".concat(operation), 500, context);
    };
    /**
     * Convert AppError to HTTP Response
     */
    ErrorHandler.toResponse = function (error) {
        return (0, responses_1.errorResponse)(error.message, error.statusCode);
    };
    /**
     * Handle async operation with error catching
     */
    ErrorHandler.safeExecute = function (operation, operationName, context) {
        return __awaiter(this, void 0, void 0, function () {
            var data, error_1, appError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, operation()];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, { success: true, data: data }];
                    case 2:
                        error_1 = _a.sent();
                        appError = ErrorHandler.handleError(error_1, operationName, context);
                        return [2 /*return*/, { success: false, error: appError }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Wrap async function with error handling
     */
    ErrorHandler.wrapAsync = function (fn, operationName, defaultReturn) {
        var _this = this;
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(_this, void 0, void 0, function () {
                var error_2, appError;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, fn.apply(void 0, args)];
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2:
                            error_2 = _a.sent();
                            appError = ErrorHandler.handleError(error_2, operationName);
                            if (defaultReturn !== undefined) {
                                return [2 /*return*/, defaultReturn];
                            }
                            throw appError;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
    };
    return ErrorHandler;
}());
exports.ErrorHandler = ErrorHandler;
/**
 * Error factory functions for common scenarios
 */
var ErrorFactory = /** @class */ (function () {
    function ErrorFactory() {
    }
    ErrorFactory.validationError = function (message, context) {
        return new AppError(AppErrorType.VALIDATION_ERROR, message, 400, context);
    };
    ErrorFactory.authenticationError = function (message, context) {
        if (message === void 0) { message = 'Authentication required'; }
        return new AppError(AppErrorType.AUTHENTICATION_ERROR, message, 401, context);
    };
    ErrorFactory.authorizationError = function (message, context) {
        if (message === void 0) { message = 'Insufficient permissions'; }
        return new AppError(AppErrorType.AUTHORIZATION_ERROR, message, 403, context);
    };
    ErrorFactory.notFoundError = function (resource, context) {
        return new AppError(AppErrorType.NOT_FOUND_ERROR, "".concat(resource, " not found"), 404, context);
    };
    ErrorFactory.conflictError = function (message, context) {
        return new AppError(AppErrorType.CONFLICT_ERROR, message, 409, context);
    };
    ErrorFactory.rateLimitError = function (message, context) {
        if (message === void 0) { message = 'Rate limit exceeded'; }
        return new AppError(AppErrorType.RATE_LIMIT_ERROR, message, 429, context);
    };
    ErrorFactory.externalServiceError = function (service, context) {
        return new AppError(AppErrorType.EXTERNAL_SERVICE_ERROR, "External service ".concat(service, " unavailable"), 502, context);
    };
    ErrorFactory.internalError = function (message, context) {
        if (message === void 0) { message = 'Internal server error'; }
        return new AppError(AppErrorType.INTERNAL_ERROR, message, 500, context);
    };
    return ErrorFactory;
}());
exports.ErrorFactory = ErrorFactory;
/**
 * Controller error handling mixin
 */
var ControllerErrorHandler = /** @class */ (function () {
    function ControllerErrorHandler() {
    }
    /**
     * Handle controller operation with standardized error response
     */
    ControllerErrorHandler.handleControllerOperation = function (operation, operationName, context) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3, appError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, operation()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_3 = _a.sent();
                        appError = ErrorHandler.handleError(error_3, operationName, context);
                        return [2 /*return*/, ErrorHandler.toResponse(appError)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validate required parameters
     */
    ControllerErrorHandler.validateRequiredParams = function (params, requiredFields) {
        for (var _i = 0, requiredFields_1 = requiredFields; _i < requiredFields_1.length; _i++) {
            var field = requiredFields_1[_i];
            if (!params[field]) {
                throw ErrorFactory.validationError("".concat(field, " is required"), { field: field });
            }
        }
    };
    /**
     * Handle authentication requirement
     */
    ControllerErrorHandler.requireAuthentication = function (user) {
        if (!user) {
            throw ErrorFactory.authenticationError();
        }
    };
    /**
     * Handle resource ownership verification
     */
    ControllerErrorHandler.requireResourceOwnership = function (resource, userId, resourceName) {
        if (!resource) {
            throw ErrorFactory.notFoundError(resourceName);
        }
        if (resource.userId !== userId) {
            throw ErrorFactory.authorizationError("Access denied to ".concat(resourceName));
        }
    };
    /**
     * Handle JSON parsing with proper error
     */
    ControllerErrorHandler.parseJsonBody = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, request.json()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_4 = _a.sent();
                        throw ErrorFactory.validationError('Invalid JSON in request body');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle external service errors
     */
    ControllerErrorHandler.handleExternalServiceError = function (serviceName, error, context) {
        logger.error("External service error: ".concat(serviceName), __assign({ error: error instanceof Error ? error.message : 'Unknown error' }, context));
        throw ErrorFactory.externalServiceError(serviceName, context);
    };
    return ControllerErrorHandler;
}());
exports.ControllerErrorHandler = ControllerErrorHandler;
