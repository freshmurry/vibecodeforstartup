"use strict";
/**
 * AI Gateway Analytics Types
 * Type definitions for AI Gateway analytics data and responses
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsError = void 0;
/**
 * Analytics service errors
 */
var AnalyticsError = /** @class */ (function (_super) {
    __extends(AnalyticsError, _super);
    function AnalyticsError(message, code, statusCode, originalError) {
        if (statusCode === void 0) { statusCode = 500; }
        var _this = _super.call(this, message) || this;
        _this.code = code;
        _this.statusCode = statusCode;
        _this.originalError = originalError;
        _this.name = 'AnalyticsError';
        return _this;
    }
    return AnalyticsError;
}(Error));
exports.AnalyticsError = AnalyticsError;
