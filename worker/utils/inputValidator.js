"use strict";
/**
 * Input Validation Middleware for Cloudflare Workers
 * Uses Zod for schema validation and sanitization
 */
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
exports.commonSchemas = void 0;
exports.validateInput = validateInput;
var zod_1 = require("zod");
var errors_1 = require("../../shared/types/errors");
var logger_1 = require("../logger");
var validationUtils_1 = require("./validationUtils");
var logger = (0, logger_1.createLogger)('InputValidator');
/**
 * Input validation middleware using Zod schemas
 *
 * @param request - The incoming request
 * @param schema - Zod schema for validation
 * @returns Validated data or throws SecurityError
 */
function validateInput(request, schema) {
    return __awaiter(this, void 0, void 0, function () {
        var contentType, data, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    contentType = request.headers.get('content-type');
                    data = void 0;
                    if (!(contentType === null || contentType === void 0 ? void 0 : contentType.includes('application/json'))) return [3 /*break*/, 2];
                    return [4 /*yield*/, parseJSON(request)];
                case 1:
                    data = _a.sent();
                    return [3 /*break*/, 7];
                case 2:
                    if (!(contentType === null || contentType === void 0 ? void 0 : contentType.includes('application/x-www-form-urlencoded'))) return [3 /*break*/, 4];
                    return [4 /*yield*/, parseFormData(request)];
                case 3:
                    data = _a.sent();
                    return [3 /*break*/, 7];
                case 4:
                    if (!(contentType === null || contentType === void 0 ? void 0 : contentType.includes('multipart/form-data'))) return [3 /*break*/, 6];
                    return [4 /*yield*/, parseMultipartFormData(request)];
                case 5:
                    data = _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    if (request.method === 'GET' || request.method === 'DELETE') {
                        data = parseQueryParams(request);
                    }
                    else {
                        throw new errors_1.SecurityError(errors_1.SecurityErrorType.INVALID_INPUT, 'Unsupported content type', 400);
                    }
                    _a.label = 7;
                case 7:
                    result = schema.safeParse(data);
                    if (!result.success) {
                        logger.warn('Validation failed', {
                            errors: result.error.errors,
                            path: new URL(request.url).pathname
                        });
                        throw new errors_1.SecurityError(errors_1.SecurityErrorType.INVALID_INPUT, formatValidationErrors(result.error), 400);
                    }
                    logger.debug('Input validated successfully', {
                        path: new URL(request.url).pathname
                    });
                    return [2 /*return*/, result.data];
                case 8:
                    error_1 = _a.sent();
                    if (error_1 instanceof errors_1.SecurityError) {
                        throw error_1;
                    }
                    logger.error('Input validation error', error_1);
                    throw new errors_1.SecurityError(errors_1.SecurityErrorType.INVALID_INPUT, 'Invalid request data', 400);
                case 9: return [2 /*return*/];
            }
        });
    });
}
/**
 * Parse JSON body with size limit
 */
function parseJSON(request) {
    return __awaiter(this, void 0, void 0, function () {
        var text;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, request.text()];
                case 1:
                    text = _a.sent();
                    // Check size limit (1MB)
                    if (text.length > 1024 * 1024) {
                        throw new errors_1.SecurityError(errors_1.SecurityErrorType.INVALID_INPUT, 'Request body too large', 413);
                    }
                    try {
                        return [2 /*return*/, JSON.parse(text)];
                    }
                    catch (_b) {
                        throw new errors_1.SecurityError(errors_1.SecurityErrorType.INVALID_INPUT, 'Invalid JSON', 400);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Parse URL-encoded form data
 */
function parseFormData(request) {
    return __awaiter(this, void 0, void 0, function () {
        var text, params, data, _i, params_1, _a, key, value;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, request.text()];
                case 1:
                    text = _b.sent();
                    params = new URLSearchParams(text);
                    data = {};
                    for (_i = 0, params_1 = params; _i < params_1.length; _i++) {
                        _a = params_1[_i], key = _a[0], value = _a[1];
                        data[key] = value;
                    }
                    return [2 /*return*/, data];
            }
        });
    });
}
/**
 * Parse multipart form data
 */
function parseMultipartFormData(request) {
    return __awaiter(this, void 0, void 0, function () {
        var formData, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, request.formData()];
                case 1:
                    formData = _a.sent();
                    data = {};
                    formData.forEach(function (value, key) {
                        data[key] = value;
                    });
                    return [2 /*return*/, data];
            }
        });
    });
}
/**
 * Parse query parameters
 */
function parseQueryParams(request) {
    var url = new URL(request.url);
    var data = {};
    for (var _i = 0, _a = url.searchParams; _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        data[key] = value;
    }
    return data;
}
/**
 * Format Zod validation errors for user-friendly response
 */
function formatValidationErrors(error) {
    var messages = error.errors.map(function (err) {
        var path = err.path.join('.');
        return path ? "".concat(path, ": ").concat(err.message) : err.message;
    });
    return messages.join(', ');
}
/**
 * Common validation schemas using centralized validation functions
 */
exports.commonSchemas = {
    // Email validation using centralized function
    email: zod_1.z.string().refine(function (email) { return (0, validationUtils_1.validateEmail)(email).valid; }, function (email) { return ({ message: (0, validationUtils_1.validateEmail)(email).error || 'Invalid email format' }); }).transform(function (email) { return email.toLowerCase(); }),
    // Password validation using centralized comprehensive validation
    password: zod_1.z.string().refine(function (password) { return (0, validationUtils_1.validatePassword)(password).valid; }, function (password) {
        var _a;
        var result = (0, validationUtils_1.validatePassword)(password);
        return { message: ((_a = result.errors) === null || _a === void 0 ? void 0 : _a[0]) || 'Password does not meet requirements' };
    }),
    // Password validation with user context (for preventing personal info in passwords)
    passwordWithUserInfo: function (userInfo) {
        return zod_1.z.string().refine(function (password) { return (0, validationUtils_1.validatePassword)(password, undefined, userInfo).valid; }, function (password) {
            var _a;
            var result = (0, validationUtils_1.validatePassword)(password, undefined, userInfo);
            return { message: ((_a = result.errors) === null || _a === void 0 ? void 0 : _a[0]) || 'Password does not meet requirements' };
        });
    },
    // Username validation using centralized function
    username: zod_1.z.string().refine(function (username) { return (0, validationUtils_1.validateUsername)(username).valid; }, function (username) { return ({ message: (0, validationUtils_1.validateUsername)(username).error || 'Invalid username format' }); }),
    // UUID validation
    uuid: zod_1.z.string().uuid(),
    // Pagination
    pagination: zod_1.z.object({
        page: zod_1.z.coerce.number().int().positive().default(1),
        limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
        sortBy: zod_1.z.string().optional(),
        sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc')
    }),
    // Safe string (no special chars that could be used for injection)
    safeString: zod_1.z.string()
        .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Only alphanumeric characters, spaces, hyphens, and underscores allowed')
        .transform(function (val) { return val.trim(); }),
    // URL validation
    url: zod_1.z.string().url(),
    // Date validation
    date: zod_1.z.string().datetime(),
};
