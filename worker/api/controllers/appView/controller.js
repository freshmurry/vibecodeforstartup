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
exports.AppViewController = void 0;
var baseController_1 = require("../baseController");
var agents_1 = require("../../../agents");
var AppService_1 = require("../../../database/services/AppService");
var logger_1 = require("../../../logger");
var urls_1 = require("../../../utils/urls");
var AppViewController = /** @class */ (function (_super) {
    __extends(AppViewController, _super);
    function AppViewController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // Get single app details (public endpoint, auth optional for ownership check)
    AppViewController.getAppDetails = function (request, env, _ctx, context) {
        return __awaiter(this, void 0, void 0, function () {
            var appId, user, userId, appService, appResult, agentSummary, previewUrl, agentStub, agentError_1, cloudflareUrl, responseData, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 13, , 14]);
                        appId = context.pathParams.id;
                        if (!appId) {
                            return [2 /*return*/, AppViewController.createErrorResponse('App ID is required', 400)];
                        }
                        return [4 /*yield*/, AppViewController.getOptionalUser(request, env)];
                    case 1:
                        user = _a.sent();
                        userId = user === null || user === void 0 ? void 0 : user.id;
                        appService = new AppService_1.AppService(env);
                        return [4 /*yield*/, appService.getAppDetailsEnhanced(appId, userId)];
                    case 2:
                        appResult = _a.sent();
                        if (!appResult) {
                            return [2 /*return*/, AppViewController.createErrorResponse('App not found', 404)];
                        }
                        // Check if user has permission to view
                        if (appResult.visibility === 'private' && appResult.userId !== userId) {
                            return [2 /*return*/, AppViewController.createErrorResponse('App not found', 404)];
                        }
                        if (!userId) return [3 /*break*/, 4];
                        // Authenticated user view
                        return [4 /*yield*/, appService.recordAppView(appId, userId)];
                    case 3:
                        // Authenticated user view
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 4: 
                    // Anonymous user view - use a special anonymous identifier
                    // This could be enhanced with session tracking or IP-based deduplication
                    return [4 /*yield*/, appService.recordAppView(appId, 'anonymous-' + Date.now())];
                    case 5:
                        // Anonymous user view - use a special anonymous identifier
                        // This could be enhanced with session tracking or IP-based deduplication
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        agentSummary = null;
                        previewUrl = '';
                        _a.label = 7;
                    case 7:
                        _a.trys.push([7, 11, , 12]);
                        return [4 /*yield*/, (0, agents_1.getAgentStub)(env, appResult.id, true, this.logger)];
                    case 8:
                        agentStub = _a.sent();
                        return [4 /*yield*/, agentStub.getSummary()];
                    case 9:
                        agentSummary = _a.sent();
                        return [4 /*yield*/, agentStub.getPreviewUrlCache()];
                    case 10:
                        previewUrl = _a.sent();
                        return [3 /*break*/, 12];
                    case 11:
                        agentError_1 = _a.sent();
                        // If agent doesn't exist or error occurred, fall back to database stored files
                        this.logger.warn('Could not fetch agent state, using stored files:', agentError_1);
                        return [3 /*break*/, 12];
                    case 12:
                        cloudflareUrl = appResult.deploymentId ? (0, urls_1.buildUserWorkerUrl)(env, appResult.deploymentId) : '';
                        responseData = __assign(__assign({}, appResult), { cloudflareUrl: cloudflareUrl, previewUrl: previewUrl || cloudflareUrl, user: {
                                id: appResult.userId,
                                displayName: appResult.userName || 'Unknown',
                                avatarUrl: appResult.userAvatar
                            }, agentSummary: agentSummary });
                        return [2 /*return*/, AppViewController.createSuccessResponse(responseData)];
                    case 13:
                        error_1 = _a.sent();
                        this.logger.error('Error fetching app details:', error_1);
                        return [2 /*return*/, AppViewController.createErrorResponse('Internal server error', 500)];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    // Star/unstar an app
    AppViewController.toggleAppStar = function (_request, env, _ctx, context) {
        return __awaiter(this, void 0, void 0, function () {
            var user, appId, appService, app, result, responseData, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        user = context.user;
                        appId = context.pathParams.id;
                        if (!appId) {
                            return [2 /*return*/, AppViewController.createErrorResponse('App ID is required', 400)];
                        }
                        appService = new AppService_1.AppService(env);
                        return [4 /*yield*/, appService.getSingleAppWithFavoriteStatus(appId, user.id)];
                    case 1:
                        app = _a.sent();
                        if (!app) {
                            return [2 /*return*/, AppViewController.createErrorResponse('App not found', 404)];
                        }
                        return [4 /*yield*/, appService.toggleAppStar(user.id, appId)];
                    case 2:
                        result = _a.sent();
                        responseData = result;
                        return [2 /*return*/, AppViewController.createSuccessResponse(responseData)];
                    case 3:
                        error_2 = _a.sent();
                        this.logger.error('Error toggling star:', error_2);
                        return [2 /*return*/, AppViewController.createErrorResponse('Internal server error', 500)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AppViewController.logger = (0, logger_1.createLogger)('AppViewController');
    return AppViewController;
}(baseController_1.BaseController));
exports.AppViewController = AppViewController;
