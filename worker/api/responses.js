"use strict";
/**
 * Standardized API response utilities
 */
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
exports.successResponse = successResponse;
exports.errorResponse = errorResponse;
var errors_1 = require("../../shared/types/errors");
/**
 * Creates a success response with standard format
 */
function successResponse(data, message) {
    var responseBody = {
        success: true,
        data: data,
        message: message,
    };
    return new Response(JSON.stringify(responseBody), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}
/**
 * Creates an error response with standard format
 */
function errorResponse(error, statusCode, message) {
    if (statusCode === void 0) { statusCode = 500; }
    var errorResp = {
        message: error instanceof Error ? error.message : error,
        name: error instanceof Error ? error.name : 'Error',
    };
    if (error instanceof errors_1.SecurityError) {
        errorResp = __assign(__assign({}, errorResp), { type: error.type });
    }
    var responseBody = {
        success: false,
        error: errorResp,
        message: message || (error instanceof Error ? error.message : 'An error occurred'),
    };
    return new Response(JSON.stringify(responseBody), {
        status: statusCode,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}
