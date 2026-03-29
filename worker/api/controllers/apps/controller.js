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
exports.AppController = void 0;
var AnalyticsService_1 = require("../../../database/services/AnalyticsService");
var AppService_1 = require("../../../database/services/AppService");
var timeFormatter_1 = require("../../../utils/timeFormatter");
var baseController_1 = require("../baseController");
var wrapper_1 = require("../../../services/cache/wrapper");
var logger_1 = require("../../../logger");
var AppController = /** @class */ (function (_super) {
    __extends(AppController, _super);
    function AppController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // Get all apps for the current user
    AppController.getUserApps = function (_request, env, _ctx, context) {
        return __awaiter(this, void 0, void 0, function () {
            var user, appService, userApps, responseData, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        user = context.user;
                        appService = new AppService_1.AppService(env);
                        return [4 /*yield*/, appService.getUserAppsWithFavorites(user.id)];
                    case 1:
                        userApps = _a.sent();
                        responseData = {
                            apps: userApps // Already properly typed and formatted by DatabaseService
                        };
                        return [2 /*return*/, AppController.createSuccessResponse(responseData)];
                    case 2:
                        error_1 = _a.sent();
                        this.logger.error('Error fetching user apps:', error_1);
                        return [2 /*return*/, AppController.createErrorResponse('Failed to fetch apps', 500)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Get recent apps (last 10)
    AppController.getRecentApps = function (_request, env, _ctx, context) {
        return __awaiter(this, void 0, void 0, function () {
            var user, appService, recentApps, responseData, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        user = context.user;
                        appService = new AppService_1.AppService(env);
                        return [4 /*yield*/, appService.getRecentAppsWithFavorites(user.id, 10)];
                    case 1:
                        recentApps = _a.sent();
                        responseData = {
                            apps: recentApps // Already properly typed and formatted by DatabaseService
                        };
                        return [2 /*return*/, AppController.createSuccessResponse(responseData)];
                    case 2:
                        error_2 = _a.sent();
                        this.logger.error('Error fetching recent apps:', error_2);
                        return [2 /*return*/, AppController.createErrorResponse('Failed to fetch recent apps', 500)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Get favorite apps - NO CACHE (user-specific, real-time)
    AppController.getFavoriteApps = function (_request, env, _ctx, context) {
        return __awaiter(this, void 0, void 0, function () {
            var user, appService, favoriteApps, responseData, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        user = context.user;
                        appService = new AppService_1.AppService(env);
                        return [4 /*yield*/, appService.getFavoriteAppsOnly(user.id)];
                    case 1:
                        favoriteApps = _a.sent();
                        responseData = {
                            apps: favoriteApps // Already properly typed and formatted by DatabaseService
                        };
                        return [2 /*return*/, AppController.createSuccessResponse(responseData)];
                    case 2:
                        error_3 = _a.sent();
                        this.logger.error('Error fetching favorite apps:', error_3);
                        return [2 /*return*/, AppController.createErrorResponse('Failed to fetch favorite apps', 500)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Toggle favorite status
    AppController.toggleFavorite = function (_request, env, _ctx, context) {
        return __awaiter(this, void 0, void 0, function () {
            var user, appService, appId, ownershipResult, result, responseData, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        user = context.user;
                        appService = new AppService_1.AppService(env);
                        appId = context.pathParams.id;
                        if (!appId) {
                            return [2 /*return*/, AppController.createErrorResponse('App ID is required', 400)];
                        }
                        return [4 /*yield*/, appService.checkAppOwnership(appId, user.id)];
                    case 1:
                        ownershipResult = _a.sent();
                        if (!ownershipResult.exists) {
                            return [2 /*return*/, AppController.createErrorResponse('App not found', 404)];
                        }
                        return [4 /*yield*/, appService.toggleAppFavorite(user.id, appId)];
                    case 2:
                        result = _a.sent();
                        responseData = result;
                        return [2 /*return*/, AppController.createSuccessResponse(responseData)];
                    case 3:
                        error_4 = _a.sent();
                        this.logger.error('Error toggling favorite:', error_4);
                        return [2 /*return*/, AppController.createErrorResponse('Failed to toggle favorite', 500)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Get single app
    AppController.getApp = function (_request, env, _ctx, context) {
        return __awaiter(this, void 0, void 0, function () {
            var user, appId, appService, app, responseData, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        user = context.user;
                        appId = context.pathParams.id;
                        if (!appId) {
                            return [2 /*return*/, AppController.createErrorResponse('App ID is required', 400)];
                        }
                        appService = new AppService_1.AppService(env);
                        return [4 /*yield*/, appService.getSingleAppWithFavoriteStatus(appId, user.id)];
                    case 1:
                        app = _a.sent();
                        if (!app) {
                            return [2 /*return*/, AppController.createErrorResponse('App not found', 404)];
                        }
                        responseData = { app: app };
                        return [2 /*return*/, AppController.createSuccessResponse(responseData)];
                    case 2:
                        error_5 = _a.sent();
                        this.logger.error('Error fetching app:', error_5);
                        return [2 /*return*/, AppController.createErrorResponse('Failed to fetch app', 500)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Update app visibility
    AppController.updateAppVisibility = function (request, env, _ctx, context) {
        return __awaiter(this, void 0, void 0, function () {
            var user, appId, bodyResult, visibility, validVisibility, appService, result, statusCode, responseData, error_6;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        user = context.user;
                        appId = context.pathParams.id;
                        if (!appId) {
                            return [2 /*return*/, AppController.createErrorResponse('App ID is required', 400)];
                        }
                        return [4 /*yield*/, AppController.parseJsonBody(request)];
                    case 1:
                        bodyResult = _c.sent();
                        if (!bodyResult.success) {
                            return [2 /*return*/, bodyResult.response];
                        }
                        visibility = (_a = bodyResult.data) === null || _a === void 0 ? void 0 : _a.visibility;
                        // Validate visibility value
                        if (!visibility || !['private', 'public'].includes(visibility)) {
                            return [2 /*return*/, AppController.createErrorResponse('Visibility must be either "private" or "public"', 400)];
                        }
                        validVisibility = visibility;
                        appService = new AppService_1.AppService(env);
                        return [4 /*yield*/, appService.updateAppVisibility(appId, user.id, validVisibility)];
                    case 2:
                        result = _c.sent();
                        if (!result.success) {
                            statusCode = result.error === 'App not found' ? 404 :
                                ((_b = result.error) === null || _b === void 0 ? void 0 : _b.includes('only change visibility of your own apps')) ? 403 : 500;
                            return [2 /*return*/, AppController.createErrorResponse(result.error || 'Failed to update app visibility', statusCode)];
                        }
                        responseData = {
                            app: __assign(__assign({}, result.app), { visibility: result.app.visibility }),
                            message: "App visibility updated to ".concat(validVisibility)
                        };
                        return [2 /*return*/, AppController.createSuccessResponse(responseData)];
                    case 3:
                        error_6 = _c.sent();
                        this.logger.error('Error updating app visibility:', error_6);
                        return [2 /*return*/, AppController.createErrorResponse('Failed to update app visibility', 500)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Delete app
    AppController.deleteApp = function (_request, env, _ctx, context) {
        return __awaiter(this, void 0, void 0, function () {
            var user, appId, appService, result, statusCode, responseData, error_7;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        user = context.user;
                        appId = context.pathParams.id;
                        if (!appId) {
                            return [2 /*return*/, AppController.createErrorResponse('App ID is required', 400)];
                        }
                        appService = new AppService_1.AppService(env);
                        return [4 /*yield*/, appService.deleteApp(appId, user.id)];
                    case 1:
                        result = _b.sent();
                        if (!result.success) {
                            statusCode = result.error === 'App not found' ? 404 :
                                ((_a = result.error) === null || _a === void 0 ? void 0 : _a.includes('only delete your own apps')) ? 403 : 500;
                            return [2 /*return*/, AppController.createErrorResponse(result.error || 'Failed to delete app', statusCode)];
                        }
                        responseData = {
                            success: true,
                            message: 'App deleted successfully'
                        };
                        return [2 /*return*/, AppController.createSuccessResponse(responseData)];
                    case 2:
                        error_7 = _b.sent();
                        this.logger.error('Error deleting app:', error_7);
                        return [2 /*return*/, AppController.createErrorResponse('Failed to delete app', 500)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AppController.logger = (0, logger_1.createLogger)('AppController');
    // Get public apps feed (like a global board)
    AppController.getPublicApps = (0, wrapper_1.withCache)(function (request, env, _ctx, _context) {
        return __awaiter(this, void 0, void 0, function () {
            var url, limit, page, offset, sort, order, period, framework, search, user, userId, appService, result, apps, pagination, finalApps, analyticsData_1, allAppsResult, analyticsService, appIds, appsWithAnalytics, analyticsService, appIds, responseData, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        url = new URL(request.url);
                        limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
                        page = parseInt(url.searchParams.get('page') || '1');
                        offset = url.searchParams.get('offset') ?
                            parseInt(url.searchParams.get('offset') || '0') :
                            (page - 1) * limit;
                        sort = (url.searchParams.get('sort') || 'recent');
                        order = (url.searchParams.get('order') || 'desc');
                        period = (url.searchParams.get('period') || 'all');
                        framework = url.searchParams.get('framework') || undefined;
                        search = url.searchParams.get('search') || undefined;
                        return [4 /*yield*/, AppController.getOptionalUser(request, env)];
                    case 1:
                        user = _a.sent();
                        userId = user === null || user === void 0 ? void 0 : user.id;
                        appService = new AppService_1.AppService(env);
                        return [4 /*yield*/, appService.getPublicAppsEnhanced({
                                limit: limit,
                                offset: offset,
                                sort: sort,
                                order: order,
                                period: period,
                                framework: framework,
                                search: search,
                                userId: userId
                            })];
                    case 2:
                        result = _a.sent();
                        apps = result.data, pagination = result.pagination;
                        finalApps = apps;
                        analyticsData_1 = {};
                        if (!(sort === 'popular' || sort === 'trending')) return [3 /*break*/, 5];
                        return [4 /*yield*/, appService.getPublicAppsEnhanced({
                                framework: framework,
                                search: search,
                                userId: userId,
                                limit: 1000, // Get more apps for proper sorting
                                offset: 0
                            })];
                    case 3:
                        allAppsResult = _a.sent();
                        analyticsService = new AnalyticsService_1.AnalyticsService(env);
                        appIds = allAppsResult.data.map(function (app) { return app.id; });
                        return [4 /*yield*/, analyticsService.batchGetAppStats(appIds)];
                    case 4:
                        analyticsData_1 = _a.sent();
                        appsWithAnalytics = allAppsResult.data.map(function (app) {
                            var _a, _b, _c;
                            return (__assign(__assign({}, app), { viewCount: ((_a = analyticsData_1[app.id]) === null || _a === void 0 ? void 0 : _a.viewCount) || 0, forkCount: ((_b = analyticsData_1[app.id]) === null || _b === void 0 ? void 0 : _b.forkCount) || 0, likeCount: ((_c = analyticsData_1[app.id]) === null || _c === void 0 ? void 0 : _c.likeCount) || 0 }));
                        });
                        // Sort by analytics
                        if (sort === 'popular') {
                            appsWithAnalytics.sort(function (a, b) {
                                var aScore = (a.viewCount || 0) + (a.likeCount || 0) * 2 + (a.forkCount || 0) * 3;
                                var bScore = (b.viewCount || 0) + (b.likeCount || 0) * 2 + (b.forkCount || 0) * 3;
                                return bScore - aScore;
                            });
                        }
                        else if (sort === 'trending') {
                            appsWithAnalytics.sort(function (a, b) {
                                var now = Date.now();
                                var aCreatedAt = a.createdAt ? new Date(a.createdAt).getTime() : now;
                                var bCreatedAt = b.createdAt ? new Date(b.createdAt).getTime() : now;
                                var aDays = Math.max(1, (now - aCreatedAt) / (1000 * 60 * 60 * 24));
                                var bDays = Math.max(1, (now - bCreatedAt) / (1000 * 60 * 60 * 24));
                                var aScore = ((a.viewCount || 0) + (a.likeCount || 0) * 2 + (a.forkCount || 0) * 3) / Math.log10(aDays + 1);
                                var bScore = ((b.viewCount || 0) + (b.likeCount || 0) * 2 + (b.forkCount || 0) * 3) / Math.log10(bDays + 1);
                                return bScore - aScore;
                            });
                        }
                        // Now apply pagination to sorted results
                        finalApps = appsWithAnalytics.slice(offset, offset + limit);
                        // Update pagination info to reflect correct total
                        pagination.total = allAppsResult.pagination.total;
                        pagination.hasMore = offset + limit < pagination.total;
                        return [3 /*break*/, 7];
                    case 5:
                        analyticsService = new AnalyticsService_1.AnalyticsService(env);
                        appIds = apps.map(function (app) { return app.id; });
                        return [4 /*yield*/, analyticsService.batchGetAppStats(appIds)];
                    case 6:
                        analyticsData_1 = _a.sent();
                        _a.label = 7;
                    case 7:
                        responseData = {
                            apps: finalApps.map(function (app) {
                                var _a, _b, _c;
                                return (__assign(__assign({}, app), { userName: app.userId ? app.userName : 'Anonymous User', userAvatar: app.userId ? app.userAvatar : null, updatedAtFormatted: (0, timeFormatter_1.formatRelativeTime)(app.updatedAt), viewCount: ((_a = analyticsData_1[app.id]) === null || _a === void 0 ? void 0 : _a.viewCount) || 0, forkCount: ((_b = analyticsData_1[app.id]) === null || _b === void 0 ? void 0 : _b.forkCount) || 0, likeCount: ((_c = analyticsData_1[app.id]) === null || _c === void 0 ? void 0 : _c.likeCount) || 0 }));
                            }),
                            pagination: {
                                total: pagination.total,
                                limit: pagination.limit,
                                offset: pagination.offset,
                                hasMore: pagination.hasMore
                            }
                        };
                        return [2 /*return*/, AppController.createSuccessResponse(responseData)];
                    case 8:
                        error_8 = _a.sent();
                        AppController.logger.error('Error fetching public apps:', error_8);
                        return [2 /*return*/, AppController.createErrorResponse('Failed to fetch public apps', 500)];
                    case 9: return [2 /*return*/];
                }
            });
        });
    }, { ttlSeconds: 45 * 60, tags: ['public-apps'] });
    return AppController;
}(baseController_1.BaseController));
exports.AppController = AppController;
