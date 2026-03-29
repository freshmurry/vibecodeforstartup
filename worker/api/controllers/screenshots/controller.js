"use strict";
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
exports.ScreenshotsController = void 0;
var baseController_1 = require("../baseController");
var logger_1 = require("../../../logger");
// -------------------------
// Helpers
// -------------------------
function isValidSessionId(id) {
    // Allow alphanumeric, underscore, dash. Prevent dots and slashes.
    // Length 1-128.
    return /^[A-Za-z0-9_-]{1,128}$/.test(id);
}
function validateFileName(file) {
    // Reject any traversal or path separators
    if (file.includes('..') || file.includes('/') || file.includes('\\') || file.includes('\0')) {
        return null;
    }
    // Enforce simple filename pattern
    if (!/^[A-Za-z0-9._-]{1,128}$/.test(file)) {
        return null;
    }
    // Disallow leading dot files
    if (file.startsWith('.')) {
        return null;
    }
    // Validate extension
    var extIndex = file.lastIndexOf('.');
    if (extIndex <= 0 || extIndex === file.length - 1) {
        return null;
    }
    var ext = file.substring(extIndex + 1).toLowerCase();
    var allowed = new Set(['png', 'jpg', 'jpeg', 'webp']);
    if (!allowed.has(ext)) {
        return null;
    }
    return file;
}
function getMimeByExtension(file) {
    var ext = file.substring(file.lastIndexOf('.') + 1).toLowerCase();
    switch (ext) {
        case 'png': return 'image/png';
        case 'jpg':
        case 'jpeg': return 'image/jpeg';
        case 'webp': return 'image/webp';
        default: return undefined;
    }
}
var ScreenshotsController = /** @class */ (function (_super) {
    __extends(ScreenshotsController, _super);
    function ScreenshotsController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ScreenshotsController.serveScreenshot = function (_request, env, _ctx, context) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionId, file, validatedFile, key, obj, contentType, headers, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        sessionId = context.pathParams.id;
                        file = context.pathParams.file;
                        if (!sessionId || !file) {
                            return [2 /*return*/, ScreenshotsController.createErrorResponse('Missing path parameters', 400)];
                        }
                        // Validate and sanitize path parameters
                        if (!isValidSessionId(sessionId)) {
                            return [2 /*return*/, ScreenshotsController.createErrorResponse('Invalid session id', 400)];
                        }
                        validatedFile = validateFileName(file);
                        if (!validatedFile) {
                            return [2 /*return*/, ScreenshotsController.createErrorResponse('Invalid file name', 400)];
                        }
                        key = "screenshots/".concat(sessionId, "/").concat(validatedFile);
                        return [4 /*yield*/, env.TEMPLATES_BUCKET.get(key)];
                    case 1:
                        obj = _b.sent();
                        if (!obj || !obj.body) {
                            return [2 /*return*/, ScreenshotsController.createErrorResponse('Screenshot not found', 404)];
                        }
                        contentType = ((_a = obj.httpMetadata) === null || _a === void 0 ? void 0 : _a.contentType) || getMimeByExtension(validatedFile) || 'image/png';
                        headers = new Headers({
                            'Content-Type': contentType,
                            'Cache-Control': 'public, max-age=31536000, immutable',
                            'X-Content-Type-Options': 'nosniff',
                        });
                        // We return a naked Response because our controller helper types expect JSON, but this route is binary.
                        // It's safe because the router uses this Response directly.
                        return [2 /*return*/, new Response(obj.body, {
                                headers: headers,
                            })];
                    case 2:
                        error_1 = _b.sent();
                        this.logger.error('Error serving screenshot', { error: error_1 });
                        return [2 /*return*/, ScreenshotsController.createErrorResponse('Internal server error', 500)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ScreenshotsController.logger = (0, logger_1.createLogger)('ScreenshotsController');
    return ScreenshotsController;
}(baseController_1.BaseController));
exports.ScreenshotsController = ScreenshotsController;
