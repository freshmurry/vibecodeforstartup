"use strict";
/**
 * Analytics Controller
 * Handles AI Gateway analytics API endpoints
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
exports.AnalyticsController = void 0;
var baseController_1 = require("../baseController");
var AiGatewayAnalyticsService_1 = require("../../../services/analytics/AiGatewayAnalyticsService");
var types_1 = require("../../../services/analytics/types");
var logger_1 = require("../../../logger");
var AnalyticsController = /** @class */ (function (_super) {
    __extends(AnalyticsController, _super);
    function AnalyticsController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Get analytics data for a specific user
     * GET /api/user/:id/analytics
     */
    AnalyticsController.getUserAnalytics = function (request, env, _ctx, context) {
        return __awaiter(this, void 0, void 0, function () {
            var authUser, userId, url, daysParam, days, service, analyticsData, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        authUser = context.user;
                        userId = context.pathParams.id;
                        if (!userId) {
                            return [2 /*return*/, AnalyticsController.createErrorResponse('User ID is required', 400)];
                        }
                        url = new URL(request.url);
                        daysParam = url.searchParams.get('days');
                        days = void 0;
                        if (daysParam) {
                            days = parseInt(daysParam);
                            if (isNaN(days) || days < 1 || days > 365) {
                                return [2 /*return*/, AnalyticsController.createErrorResponse('Days must be between 1 and 365', 400)];
                            }
                        }
                        service = new AiGatewayAnalyticsService_1.AiGatewayAnalyticsService(env);
                        return [4 /*yield*/, service.getUserAnalytics(userId, days)];
                    case 1:
                        analyticsData = _a.sent();
                        this.logger.info('User analytics retrieved successfully', {
                            userId: userId,
                            days: days || 'all-time',
                            requestCount: analyticsData.totalRequests,
                            cost: analyticsData.totalCost,
                            requestedBy: authUser.id,
                        });
                        return [2 /*return*/, AnalyticsController.createSuccessResponse(analyticsData)];
                    case 2:
                        error_1 = _a.sent();
                        this.logger.error('Error fetching user analytics:', error_1);
                        if (error_1 instanceof types_1.AnalyticsError) {
                            return [2 /*return*/, AnalyticsController.createErrorResponse(error_1.message, error_1.statusCode)];
                        }
                        return [2 /*return*/, AnalyticsController.createErrorResponse('Failed to fetch user analytics', 500)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get analytics data for a specific agent/chat
     * GET /api/agent/:id/analytics
     */
    AnalyticsController.getAgentAnalytics = function (request, env, _ctx, context) {
        return __awaiter(this, void 0, void 0, function () {
            var authUser, agentId, url, daysParam, days, service, analyticsData, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        authUser = context.user;
                        agentId = context.pathParams.id;
                        if (!agentId) {
                            return [2 /*return*/, AnalyticsController.createErrorResponse('Agent ID is required', 400)];
                        }
                        url = new URL(request.url);
                        daysParam = url.searchParams.get('days');
                        days = void 0;
                        if (daysParam) {
                            days = parseInt(daysParam);
                            if (isNaN(days) || days < 1 || days > 365) {
                                return [2 /*return*/, AnalyticsController.createErrorResponse('Days must be between 1 and 365', 400)];
                            }
                        }
                        service = new AiGatewayAnalyticsService_1.AiGatewayAnalyticsService(env);
                        return [4 /*yield*/, service.getChatAnalytics(agentId, days)];
                    case 1:
                        analyticsData = _a.sent();
                        this.logger.info('Agent analytics retrieved successfully', {
                            agentId: agentId,
                            days: days || 'all-time',
                            requestCount: analyticsData.totalRequests,
                            cost: analyticsData.totalCost,
                            requestedBy: authUser.id,
                        });
                        return [2 /*return*/, AnalyticsController.createSuccessResponse(analyticsData)];
                    case 2:
                        error_2 = _a.sent();
                        this.logger.error('Error fetching agent analytics:', error_2);
                        if (error_2 instanceof types_1.AnalyticsError) {
                            return [2 /*return*/, AnalyticsController.createErrorResponse(error_2.message, error_2.statusCode)];
                        }
                        return [2 /*return*/, AnalyticsController.createErrorResponse('Failed to fetch agent analytics', 500)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AnalyticsController.logger = (0, logger_1.createLogger)('AnalyticsController');
    return AnalyticsController;
}(baseController_1.BaseController));
exports.AnalyticsController = AnalyticsController;
