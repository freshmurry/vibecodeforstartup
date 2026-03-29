"use strict";
/**
 * App Service
 * Handles all app-related database operations including favorites, views, stars, and forking
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
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
exports.AppService = void 0;
var BaseService_1 = require("./BaseService");
var schema = require("../schema");
var drizzle_orm_1 = require("drizzle-orm");
var idGenerator_1 = require("../../utils/idGenerator");
var timeFormatter_1 = require("../../utils/timeFormatter");
var AnalyticsService_1 = require("./AnalyticsService");
/**
 * App Service Class
 * Comprehensive app management operations
 */
var AppService = /** @class */ (function (_super) {
    __extends(AppService, _super);
    function AppService() {
        // ========================================
        // RANKING ALGORITHM CONFIGURATION
        // ========================================
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * Algorithm configuration constants for popularity and trending ranking
         * Based on industry-standard practices from Reddit, Hacker News, etc.
         */
        _this.RANKING_CONFIG = {
            // Engagement weights optimized for balanced ranking (views:1, stars:5, forks:3)
            WEIGHTS: {
                VIEWS: 1,
                STARS: 5,
                FORKS: 3
            },
            // Time decay factor for trending algorithm (optimized for performance)
            TRENDING_DECAY: 0.005 // Age decay coefficient for trending score
        };
        return _this;
    }
    /**
     * Helper function to create favorite status query
     */
    AppService.prototype.createFavoriteStatusQuery = function (userId) {
        return (0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n            EXISTS (\n                SELECT 1 FROM ", " \n                WHERE ", " = ", " \n                AND ", " = ", "\n            )\n        "], ["\n            EXISTS (\n                SELECT 1 FROM ", " \n                WHERE ", " = ", " \n                AND ", " = ", "\n            )\n        "])), schema.favorites, schema.favorites.userId, userId, schema.favorites.appId, schema.apps.id).as('isFavorite');
    };
    // ========================================
    // APP OPERATIONS
    // ========================================
    /**
     * Create a new app with full schema data
     */
    AppService.prototype.createApp = function (appData) {
        return __awaiter(this, void 0, void 0, function () {
            var app;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database
                            .insert(schema.apps)
                            .values(__assign({}, appData))
                            .returning()];
                    case 1:
                        app = (_a.sent())[0];
                        return [2 /*return*/, app];
                }
            });
        });
    };
    AppService.prototype.getUserApps = function (userId_1) {
        return __awaiter(this, arguments, void 0, function (userId, options) {
            var status, visibility, _a, limit, _b, offset, whereConditions, whereClause;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        status = options.status, visibility = options.visibility, _a = options.limit, limit = _a === void 0 ? 50 : _a, _b = options.offset, offset = _b === void 0 ? 0 : _b;
                        whereConditions = [
                            (0, drizzle_orm_1.eq)(schema.apps.userId, userId),
                            status ? (0, drizzle_orm_1.eq)(schema.apps.status, status) : undefined,
                            visibility ? (0, drizzle_orm_1.eq)(schema.apps.visibility, visibility) : undefined,
                        ];
                        whereClause = this.buildWhereConditions(whereConditions);
                        return [4 /*yield*/, this.database
                                .select()
                                .from(schema.apps)
                                .where(whereClause)
                                .orderBy((0, drizzle_orm_1.desc)(schema.apps.updatedAt))
                                .limit(limit)
                                .offset(offset)];
                    case 1: return [2 /*return*/, _c.sent()];
                }
            });
        });
    };
    /**
     * Get public apps with user stats and pagination
     * Uses optimized queries with aggregations for performance
     */
    AppService.prototype.getPublicAppsEnhanced = function () {
        return __awaiter(this, arguments, void 0, function (options) {
            var _a, sort, _b, limit, _c, offset, framework, search, _d, order, userId, whereConditions, whereClause, direction, basicApps, totalCountResult, total, appsWithUserInfo, enhancedApps;
            var _e;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _a = options.sort, sort = _a === void 0 ? 'recent' : _a;
                        // Use optimized aggregation method for performance-critical sorts
                        if (sort === 'popular' || sort === 'trending') {
                            return [2 /*return*/, this.getEnhancedAppsWithAggregations(options)];
                        }
                        _b = options.limit, limit = _b === void 0 ? 20 : _b, _c = options.offset, offset = _c === void 0 ? 0 : _c, framework = options.framework, search = options.search, _d = options.order, order = _d === void 0 ? 'desc' : _d, userId = options.userId;
                        whereConditions = this.buildPublicAppConditions(framework, search);
                        whereClause = this.buildWhereConditions(whereConditions);
                        direction = order === 'asc' ? drizzle_orm_1.asc : drizzle_orm_1.desc;
                        return [4 /*yield*/, this.database
                                .select({
                                app: schema.apps,
                                userName: schema.users.displayName,
                                userAvatar: schema.users.avatarUrl,
                            })
                                .from(schema.apps)
                                .leftJoin(schema.users, (0, drizzle_orm_1.eq)(schema.apps.userId, schema.users.id))
                                .where(whereClause)
                                .orderBy(direction(schema.apps.updatedAt))
                                .limit(limit)
                                .offset(offset)];
                    case 1:
                        basicApps = _f.sent();
                        return [4 /*yield*/, this.database
                                .select({ count: (0, drizzle_orm_1.sql)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["COUNT(*)"], ["COUNT(*)"]))) })
                                .from(schema.apps)
                                .where(whereClause)];
                    case 2:
                        totalCountResult = _f.sent();
                        total = ((_e = totalCountResult[0]) === null || _e === void 0 ? void 0 : _e.count) || 0;
                        if (basicApps.length === 0) {
                            return [2 /*return*/, {
                                    data: [],
                                    pagination: {
                                        limit: limit,
                                        offset: offset,
                                        total: total,
                                        hasMore: false
                                    }
                                }];
                        }
                        appsWithUserInfo = basicApps.map(function (row) { return (__assign(__assign({}, row.app), { userName: row.userName, userAvatar: row.userAvatar })); });
                        return [4 /*yield*/, this.enhanceAppsWithAnalytics(appsWithUserInfo, userId, true)];
                    case 3:
                        enhancedApps = _f.sent();
                        return [2 /*return*/, {
                                data: enhancedApps,
                                pagination: {
                                    limit: limit,
                                    offset: offset,
                                    total: total,
                                    hasMore: offset + limit < total
                                }
                            }];
                }
            });
        });
    };
    /**
     * Helper to build common app filters (framework and search)
     * Used by both user apps and public apps to avoid duplication
     */
    AppService.prototype.buildCommonAppFilters = function (framework, search) {
        var conditions = [];
        if (framework) {
            conditions.push((0, drizzle_orm_1.eq)(schema.apps.framework, framework));
        }
        if (search) {
            var searchTerm = "%".concat(search.toLowerCase(), "%");
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.sql)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["LOWER(", ") LIKE ", ""], ["LOWER(", ") LIKE ", ""])), schema.apps.title, searchTerm), (0, drizzle_orm_1.sql)(templateObject_4 || (templateObject_4 = __makeTemplateObject(["LOWER(", ") LIKE ", ""], ["LOWER(", ") LIKE ", ""])), schema.apps.description, searchTerm)));
        }
        return conditions.filter(Boolean);
    };
    /**
     * Helper to build public app query conditions
     */
    AppService.prototype.buildPublicAppConditions = function (framework, search) {
        var whereConditions = __spreadArray([
            // Only show public apps or apps from anonymous users
            (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema.apps.visibility, 'public'), (0, drizzle_orm_1.isNull)(schema.apps.userId)),
            (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema.apps.status, 'completed'), (0, drizzle_orm_1.eq)(schema.apps.status, 'generating'))
        ], this.buildCommonAppFilters(framework, search), true);
        return whereConditions.filter(Boolean);
    };
    /**
     * Update app record in database
     */
    AppService.prototype.updateApp = function (appId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!appId) {
                            return [2 /*return*/, false];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.database
                                .update(schema.apps)
                                .set(__assign(__assign({}, updates), { updatedAt: new Date() }))
                                .where((0, drizzle_orm_1.eq)(schema.apps.id, appId))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_1 = _a.sent();
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update app deployment ID
     */
    AppService.prototype.updateDeploymentId = function (appId, deploymentId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.updateApp(appId, {
                        deploymentId: deploymentId,
                    })];
            });
        });
    };
    /**
     * Update app with GitHub repository URL and visibility
     */
    AppService.prototype.updateGitHubRepository = function (appId, repositoryUrl, repositoryVisibility) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.updateApp(appId, {
                        githubRepositoryUrl: repositoryUrl,
                        githubRepositoryVisibility: repositoryVisibility
                    })];
            });
        });
    };
    /**
     * Update app with screenshot data
     */
    AppService.prototype.updateAppScreenshot = function (appId, screenshotUrl) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.updateApp(appId, {
                        screenshotUrl: screenshotUrl,
                        screenshotCapturedAt: new Date()
                    })];
            });
        });
    };
    /**
     * Get user apps with favorite status
     */
    AppService.prototype.getUserAppsWithFavorites = function (userId_1) {
        return __awaiter(this, arguments, void 0, function (userId, options) {
            var _a, limit, _b, offset, results;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = options.limit, limit = _a === void 0 ? 50 : _a, _b = options.offset, offset = _b === void 0 ? 0 : _b;
                        return [4 /*yield*/, this.database
                                .select({
                                app: schema.apps,
                                isFavorite: this.createFavoriteStatusQuery(userId)
                            })
                                .from(schema.apps)
                                .where((0, drizzle_orm_1.eq)(schema.apps.userId, userId))
                                .orderBy((0, drizzle_orm_1.desc)(schema.apps.updatedAt))
                                .limit(limit)
                                .offset(offset)];
                    case 1:
                        results = _c.sent();
                        return [2 /*return*/, results.map(function (row) { return (__assign(__assign({}, row.app), { isFavorite: row.isFavorite, updatedAtFormatted: (0, timeFormatter_1.formatRelativeTime)(row.app.updatedAt) })); })];
                }
            });
        });
    };
    /**
     * Get recent user apps with favorite status
     */
    AppService.prototype.getRecentAppsWithFavorites = function (userId_1) {
        return __awaiter(this, arguments, void 0, function (userId, limit) {
            if (limit === void 0) { limit = 10; }
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getUserAppsWithFavorites(userId, { limit: limit, offset: 0 })];
            });
        });
    };
    /**
     * Get only favorited apps for a user
     */
    AppService.prototype.getFavoriteAppsOnly = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database
                            .select({
                            app: schema.apps
                        })
                            .from(schema.apps)
                            .innerJoin(schema.favorites, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.favorites.appId, schema.apps.id), (0, drizzle_orm_1.eq)(schema.favorites.userId, userId)))
                            .orderBy((0, drizzle_orm_1.desc)(schema.apps.updatedAt))];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, results.map(function (row) { return (__assign(__assign({}, row.app), { isFavorite: true, updatedAtFormatted: (0, timeFormatter_1.formatRelativeTime)(row.app.updatedAt) })); })];
                }
            });
        });
    };
    /**
     * Toggle favorite status for an app
     */
    AppService.prototype.toggleAppFavorite = function (userId, appId) {
        return __awaiter(this, void 0, void 0, function () {
            var existingFavorite;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database
                            .select()
                            .from(schema.favorites)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.favorites.appId, appId), (0, drizzle_orm_1.eq)(schema.favorites.userId, userId)))
                            .limit(1)];
                    case 1:
                        existingFavorite = _a.sent();
                        if (!(existingFavorite.length > 0)) return [3 /*break*/, 3];
                        // Remove favorite
                        return [4 /*yield*/, this.database
                                .delete(schema.favorites)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.favorites.appId, appId), (0, drizzle_orm_1.eq)(schema.favorites.userId, userId)))];
                    case 2:
                        // Remove favorite
                        _a.sent();
                        return [2 /*return*/, { isFavorite: false }];
                    case 3: 
                    // Add favorite
                    return [4 /*yield*/, this.database
                            .insert(schema.favorites)
                            .values({
                            id: (0, idGenerator_1.generateId)(),
                            userId: userId,
                            appId: appId,
                            createdAt: new Date()
                        })];
                    case 4:
                        // Add favorite
                        _a.sent();
                        return [2 /*return*/, { isFavorite: true }];
                }
            });
        });
    };
    /**
     * Check if user owns an app
     */
    AppService.prototype.checkAppOwnership = function (appId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var app;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database
                            .select({
                            id: schema.apps.id,
                            userId: schema.apps.userId
                        })
                            .from(schema.apps)
                            .where((0, drizzle_orm_1.eq)(schema.apps.id, appId))
                            .get()];
                    case 1:
                        app = _a.sent();
                        if (!app) {
                            return [2 /*return*/, { exists: false, isOwner: false }];
                        }
                        return [2 /*return*/, {
                                exists: true,
                                isOwner: app.userId === userId
                            }];
                }
            });
        });
    };
    /**
     * Get single app with favorite status for user
     */
    AppService.prototype.getSingleAppWithFavoriteStatus = function (appId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var apps;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database
                            .select({
                            app: schema.apps,
                            isFavorite: this.createFavoriteStatusQuery(userId)
                        })
                            .from(schema.apps)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.apps.id, appId), (0, drizzle_orm_1.eq)(schema.apps.userId, userId)))
                            .limit(1)];
                    case 1:
                        apps = _a.sent();
                        if (apps.length === 0) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, __assign(__assign({}, apps[0].app), { isFavorite: apps[0].isFavorite, updatedAtFormatted: (0, timeFormatter_1.formatRelativeTime)(apps[0].app.updatedAt) })];
                }
            });
        });
    };
    /**
     * Update app visibility with ownership check
     */
    AppService.prototype.updateAppVisibility = function (appId, userId, visibility) {
        return __awaiter(this, void 0, void 0, function () {
            var existingApp, updatedApps;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database
                            .select({
                            id: schema.apps.id,
                            title: schema.apps.title,
                            userId: schema.apps.userId,
                            visibility: schema.apps.visibility
                        })
                            .from(schema.apps)
                            .where((0, drizzle_orm_1.eq)(schema.apps.id, appId))
                            .limit(1)];
                    case 1:
                        existingApp = _a.sent();
                        if (existingApp.length === 0) {
                            return [2 /*return*/, { success: false, error: 'App not found' }];
                        }
                        if (existingApp[0].userId !== userId) {
                            return [2 /*return*/, { success: false, error: 'You can only change visibility of your own apps' }];
                        }
                        return [4 /*yield*/, this.database
                                .update(schema.apps)
                                .set({
                                visibility: visibility,
                                updatedAt: new Date()
                            })
                                .where((0, drizzle_orm_1.eq)(schema.apps.id, appId))
                                .returning({
                                id: schema.apps.id,
                                title: schema.apps.title,
                                visibility: schema.apps.visibility,
                                updatedAt: schema.apps.updatedAt
                            })];
                    case 2:
                        updatedApps = _a.sent();
                        if (updatedApps.length === 0) {
                            return [2 /*return*/, { success: false, error: 'Failed to update app visibility' }];
                        }
                        return [2 /*return*/, { success: true, app: updatedApps[0] }];
                }
            });
        });
    };
    // ========================================
    // APP VIEW CONTROLLER OPERATIONS
    // ========================================
    /**
     * Get enhanced app details with user info and stats for app view controller
     * Combines app data, user info, and analytics in single optimized query
     */
    AppService.prototype.getAppDetailsEnhanced = function (appId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var appResult, app, _a, viewCount, starCount, isFavorite, userHasStarred;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.database
                            .select({
                            app: schema.apps,
                            userName: schema.users.displayName,
                            userAvatar: schema.users.avatarUrl,
                        })
                            .from(schema.apps)
                            .leftJoin(schema.users, (0, drizzle_orm_1.eq)(schema.apps.userId, schema.users.id))
                            .where((0, drizzle_orm_1.eq)(schema.apps.id, appId))
                            .get()];
                    case 1:
                        appResult = _b.sent();
                        if (!appResult) {
                            return [2 /*return*/, null];
                        }
                        app = appResult.app;
                        return [4 /*yield*/, Promise.all([
                                // View count
                                this.database
                                    .select({ count: (0, drizzle_orm_1.sql)(templateObject_5 || (templateObject_5 = __makeTemplateObject(["count(*)"], ["count(*)"]))) })
                                    .from(schema.appViews)
                                    .where((0, drizzle_orm_1.eq)(schema.appViews.appId, appId))
                                    .get()
                                    .then(function (r) { return (r === null || r === void 0 ? void 0 : r.count) || 0; }),
                                // Star count
                                this.database
                                    .select({ count: (0, drizzle_orm_1.sql)(templateObject_6 || (templateObject_6 = __makeTemplateObject(["count(*)"], ["count(*)"]))) })
                                    .from(schema.stars)
                                    .where((0, drizzle_orm_1.eq)(schema.stars.appId, appId))
                                    .get()
                                    .then(function (r) { return (r === null || r === void 0 ? void 0 : r.count) || 0; }),
                                // Is favorited by current user
                                userId ? this.database
                                    .select({ id: schema.favorites.id })
                                    .from(schema.favorites)
                                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.favorites.userId, userId), (0, drizzle_orm_1.eq)(schema.favorites.appId, appId)))
                                    .get()
                                    .then(function (r) { return !!r; }) : false,
                                // Is starred by current user  
                                userId ? this.database
                                    .select({ id: schema.stars.id })
                                    .from(schema.stars)
                                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.stars.userId, userId), (0, drizzle_orm_1.eq)(schema.stars.appId, appId)))
                                    .get()
                                    .then(function (r) { return !!r; }) : false
                            ])];
                    case 2:
                        _a = _b.sent(), viewCount = _a[0], starCount = _a[1], isFavorite = _a[2], userHasStarred = _a[3];
                        return [2 /*return*/, __assign(__assign({}, app), { userName: appResult.userName, userAvatar: appResult.userAvatar, starCount: starCount, userStarred: userHasStarred, userFavorited: isFavorite, viewCount: viewCount })];
                }
            });
        });
    };
    /**
     * Toggle star status for an app (star/unstar)
     * Uses same pattern as toggleAppFavorite
     */
    AppService.prototype.toggleAppStar = function (userId, appId) {
        return __awaiter(this, void 0, void 0, function () {
            var existingStar, starCountResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database
                            .select({ id: schema.stars.id })
                            .from(schema.stars)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.stars.userId, userId), (0, drizzle_orm_1.eq)(schema.stars.appId, appId)))
                            .get()];
                    case 1:
                        existingStar = _a.sent();
                        if (!existingStar) return [3 /*break*/, 3];
                        // Unstar
                        return [4 /*yield*/, this.database
                                .delete(schema.stars)
                                .where((0, drizzle_orm_1.eq)(schema.stars.id, existingStar.id))
                                .run()];
                    case 2:
                        // Unstar
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: 
                    // Star
                    return [4 /*yield*/, this.database
                            .insert(schema.stars)
                            .values({
                            id: (0, idGenerator_1.generateId)(),
                            userId: userId,
                            appId: appId,
                            starredAt: new Date()
                        })
                            .run()];
                    case 4:
                        // Star
                        _a.sent();
                        _a.label = 5;
                    case 5: return [4 /*yield*/, this.database
                            .select({ count: (0, drizzle_orm_1.sql)(templateObject_7 || (templateObject_7 = __makeTemplateObject(["count(*)"], ["count(*)"]))) })
                            .from(schema.stars)
                            .where((0, drizzle_orm_1.eq)(schema.stars.appId, appId))
                            .get()];
                    case 6:
                        starCountResult = _a.sent();
                        return [2 /*return*/, {
                                isStarred: !existingStar,
                                starCount: (starCountResult === null || starCountResult === void 0 ? void 0 : starCountResult.count) || 0
                            }];
                }
            });
        });
    };
    /**
     * Record app view with duplicate prevention
     */
    AppService.prototype.recordAppView = function (appId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.database
                                .insert(schema.appViews)
                                .values({
                                id: (0, idGenerator_1.generateId)(),
                                appId: appId,
                                userId: userId,
                                viewedAt: new Date()
                            })
                                .run()];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get app for forking with permission checks
     * Single query with built-in ownership/visibility validation
     */
    AppService.prototype.getAppForFork = function (appId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var app, canFork;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database
                            .select()
                            .from(schema.apps)
                            .where((0, drizzle_orm_1.eq)(schema.apps.id, appId))
                            .get()];
                    case 1:
                        app = _a.sent();
                        if (!app) {
                            return [2 /*return*/, { app: null, canFork: false }];
                        }
                        canFork = app.visibility === 'public' || app.userId === userId;
                        return [2 /*return*/, { app: app, canFork: canFork }];
                }
            });
        });
    };
    /**
     * Create forked app using same patterns as createSimpleApp
     */
    AppService.prototype.createForkedApp = function (originalApp, newAgentId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var now, forkedApp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        now = new Date();
                        return [4 /*yield*/, this.database
                                .insert(schema.apps)
                                .values({
                                id: newAgentId,
                                userId: userId,
                                title: "".concat(originalApp.title, " (Fork)"),
                                description: originalApp.description,
                                originalPrompt: originalApp.originalPrompt,
                                finalPrompt: originalApp.finalPrompt,
                                framework: originalApp.framework,
                                visibility: 'private', // Forks start as private
                                status: 'completed', // Forked apps start as completed
                                parentAppId: originalApp.id,
                                createdAt: now,
                                updatedAt: now
                            })
                                .returning()];
                    case 1:
                        forkedApp = (_a.sent())[0];
                        return [2 /*return*/, forkedApp];
                }
            });
        });
    };
    /**
     * Get user apps with analytics data integrated
     * Uses unified analytics approach for consistency with proper sorting
     */
    AppService.prototype.getUserAppsWithAnalytics = function (userId_1) {
        return __awaiter(this, arguments, void 0, function (userId, options) {
            var _a, limit, _b, offset, status, visibility, framework, search, _c, sort, _d, order, whereConditions, whereClause, direction, sortClauses, basicApps, results;
            var _e, _f;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _a = options.limit, limit = _a === void 0 ? 50 : _a, _b = options.offset, offset = _b === void 0 ? 0 : _b, status = options.status, visibility = options.visibility, framework = options.framework, search = options.search, _c = options.sort, sort = _c === void 0 ? 'recent' : _c, _d = options.order, order = _d === void 0 ? 'desc' : _d;
                        // For performance-critical sorts (popular/trending), use optimized aggregation method
                        if (sort === 'popular' || sort === 'trending') {
                            return [2 /*return*/, this.getUserAppsWithAggregations(userId, options)];
                        }
                        whereConditions = __spreadArray([
                            (0, drizzle_orm_1.eq)(schema.apps.userId, userId),
                            status ? (0, drizzle_orm_1.eq)(schema.apps.status, status) : undefined,
                            visibility ? (0, drizzle_orm_1.eq)(schema.apps.visibility, visibility) : undefined
                        ], this.buildCommonAppFilters(framework, search), true);
                        whereClause = this.buildWhereConditions(whereConditions);
                        direction = order === 'asc' ? drizzle_orm_1.asc : drizzle_orm_1.desc;
                        sortClauses = sort === 'starred'
                            ? [(0, drizzle_orm_1.desc)(schema.favorites.createdAt)]
                            : [direction(schema.apps.updatedAt)];
                        if (!(sort === 'starred')) return [3 /*break*/, 2];
                        return [4 /*yield*/, (_e = this.database
                                .select({
                                app: schema.apps
                            })
                                .from(schema.apps)
                                .innerJoin(schema.favorites, (0, drizzle_orm_1.eq)(schema.favorites.appId, schema.apps.id))
                                .where((0, drizzle_orm_1.and)(whereClause, (0, drizzle_orm_1.eq)(schema.favorites.userId, userId))))
                                .orderBy.apply(_e, sortClauses).limit(limit)
                                .offset(offset)];
                    case 1:
                        results = _g.sent();
                        basicApps = results.map(function (r) { return r.app; });
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, (_f = this.database
                            .select()
                            .from(schema.apps)
                            .where(whereClause))
                            .orderBy.apply(_f, sortClauses).limit(limit)
                            .offset(offset)];
                    case 3:
                        basicApps = _g.sent();
                        _g.label = 4;
                    case 4:
                        if (basicApps.length === 0) {
                            return [2 /*return*/, []];
                        }
                        return [4 /*yield*/, this.enhanceAppsWithAnalytics(basicApps, userId, false)];
                    case 5: 
                    // Use unified analytics enhancement approach
                    return [2 /*return*/, _g.sent()];
                }
            });
        });
    };
    /**
     * Get total count of user apps with filters (for pagination)
     */
    AppService.prototype.getUserAppsCount = function (userId_1) {
        return __awaiter(this, arguments, void 0, function (userId, options) {
            var status, visibility, framework, search, _a, sort, whereConditions, whereClause, countQuery, countResult, countResult;
            var _b, _c;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        status = options.status, visibility = options.visibility, framework = options.framework, search = options.search, _a = options.sort, sort = _a === void 0 ? 'recent' : _a;
                        whereConditions = __spreadArray([
                            (0, drizzle_orm_1.eq)(schema.apps.userId, userId),
                            status ? (0, drizzle_orm_1.eq)(schema.apps.status, status) : undefined,
                            visibility ? (0, drizzle_orm_1.eq)(schema.apps.visibility, visibility) : undefined
                        ], this.buildCommonAppFilters(framework, search), true);
                        whereClause = this.buildWhereConditions(whereConditions);
                        countQuery = this.database
                            .select({ count: (0, drizzle_orm_1.sql)(templateObject_8 || (templateObject_8 = __makeTemplateObject(["COUNT(*)"], ["COUNT(*)"]))) })
                            .from(schema.apps);
                        if (!(sort === 'starred')) return [3 /*break*/, 2];
                        return [4 /*yield*/, countQuery
                                .innerJoin(schema.favorites, (0, drizzle_orm_1.eq)(schema.favorites.appId, schema.apps.id))
                                .where((0, drizzle_orm_1.and)(whereClause, (0, drizzle_orm_1.eq)(schema.favorites.userId, userId)))];
                    case 1:
                        countResult = _d.sent();
                        return [2 /*return*/, ((_b = countResult[0]) === null || _b === void 0 ? void 0 : _b.count) || 0];
                    case 2: return [4 /*yield*/, countQuery.where(whereClause)];
                    case 3:
                        countResult = _d.sent();
                        return [2 /*return*/, ((_c = countResult[0]) === null || _c === void 0 ? void 0 : _c.count) || 0];
                }
            });
        });
    };
    // ========================================
    // UNIFIED ANALYTICS HELPER
    // ========================================
    /**
     * Unified analytics enhancement for app collections
     * OPTIMIZED: Uses batch queries to eliminate N+1 problems and minimize database round trips
     * All analytics data fetched in 6 total queries regardless of app count
     */
    AppService.prototype.enhanceAppsWithAnalytics = function (basicApps_1, userId_1) {
        return __awaiter(this, arguments, void 0, function (basicApps, userId, includeUserInfo) {
            var appIds, _a, analyticsData, starCounts, userStars, userFavorites, starCountMap, userStarMap, userFavoriteMap;
            if (includeUserInfo === void 0) { includeUserInfo = false; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (basicApps.length === 0)
                            return [2 /*return*/, []];
                        appIds = basicApps.map(function (app) { return app.id; });
                        return [4 /*yield*/, Promise.all([
                                // 1. Batch analytics (views, forks, likes) - 3 queries in parallel
                                new AnalyticsService_1.AnalyticsService(this.env).batchGetAppStats(appIds),
                                // 2. Batch star counts for all apps - 1 query
                                this.database
                                    .select({
                                    appId: schema.stars.appId,
                                    count: (0, drizzle_orm_1.sql)(templateObject_9 || (templateObject_9 = __makeTemplateObject(["COUNT(*)"], ["COUNT(*)"]))).as('count')
                                })
                                    .from(schema.stars)
                                    .where((0, drizzle_orm_1.inArray)(schema.stars.appId, appIds))
                                    .groupBy(schema.stars.appId)
                                    .all(),
                                // 3. Batch user stars - 1 query (only if userId provided)
                                userId ? this.database
                                    .select({
                                    appId: schema.stars.appId
                                })
                                    .from(schema.stars)
                                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.stars.userId, userId), (0, drizzle_orm_1.inArray)(schema.stars.appId, appIds)))
                                    .all() : [],
                                // 4. Batch user favorites - 1 query (only if userId provided)
                                userId ? this.database
                                    .select({
                                    appId: schema.favorites.appId
                                })
                                    .from(schema.favorites)
                                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.favorites.userId, userId), (0, drizzle_orm_1.inArray)(schema.favorites.appId, appIds)))
                                    .all() : []
                            ])];
                    case 1:
                        _a = _b.sent(), analyticsData = _a[0], starCounts = _a[1], userStars = _a[2], userFavorites = _a[3];
                        starCountMap = new Map(starCounts.map(function (s) { return [s.appId, s.count]; }));
                        userStarMap = new Set(userStars.map(function (s) { return s.appId; }));
                        userFavoriteMap = new Set(userFavorites.map(function (f) { return f.appId; }));
                        // Transform apps with O(1) lookups instead of additional queries
                        return [2 /*return*/, basicApps.map(function (app) {
                                var _a, _b;
                                return (__assign(__assign({}, app), { userName: includeUserInfo ? (app.userName || null) : null, userAvatar: includeUserInfo ? (app.userAvatar || null) : null, starCount: starCountMap.get(app.id) || 0, userStarred: userStarMap.has(app.id), userFavorited: userFavoriteMap.has(app.id), viewCount: ((_a = analyticsData[app.id]) === null || _a === void 0 ? void 0 : _a.viewCount) || 0, forkCount: ((_b = analyticsData[app.id]) === null || _b === void 0 ? void 0 : _b.forkCount) || 0, likeCount: 0 }));
                            })];
                }
            });
        });
    };
    // ========================================
    // UTILITY METHODS
    // ========================================
    /**
     * Get date threshold for time period filtering
     */
    AppService.prototype.getTimePeriodThreshold = function (period) {
        var now = new Date();
        switch (period) {
            case 'today':
                return new Date(now.getFullYear(), now.getMonth(), now.getDate());
            case 'week':
                var weekAgo = new Date(now);
                weekAgo.setDate(now.getDate() - 7);
                return weekAgo;
            case 'month':
                var monthAgo = new Date(now);
                monthAgo.setMonth(now.getMonth() - 1);
                return monthAgo;
            case 'all':
            default:
                return new Date(0); // Beginning of time
        }
    };
    // ========================================
    // OPTIMIZED RANKING METHODS
    // ========================================
    /**
     * Optimized query for popular/trending apps using efficient aggregations
     * Prevents N+1 query problem by using JOINs instead of subqueries
     */
    AppService.prototype.getEnhancedAppsWithAggregations = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, limit, _b, offset, framework, search, _c, sort, _d, order, _e, period, userId, whereConditions, whereClause, periodThreshold, direction, WEIGHTS, timeFilter, starTimeFilter, forkTimeFilter, scoreExpression, basicApps, totalQuery, total, userStarredSet, userFavoritedSet, appIds, _f, userStars, userFavorites, enhancedApps;
            var _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        _a = options.limit, limit = _a === void 0 ? 20 : _a, _b = options.offset, offset = _b === void 0 ? 0 : _b, framework = options.framework, search = options.search, _c = options.sort, sort = _c === void 0 ? 'recent' : _c, _d = options.order, order = _d === void 0 ? 'desc' : _d, _e = options.period, period = _e === void 0 ? 'all' : _e, userId = options.userId;
                        whereConditions = this.buildPublicAppConditions(framework, search);
                        whereClause = this.buildWhereConditions(whereConditions);
                        periodThreshold = this.getTimePeriodThreshold(period);
                        direction = order === 'asc' ? drizzle_orm_1.asc : drizzle_orm_1.desc;
                        WEIGHTS = this.RANKING_CONFIG.WEIGHTS;
                        timeFilter = period === 'all' ? (0, drizzle_orm_1.sql)(templateObject_10 || (templateObject_10 = __makeTemplateObject(["1=1"], ["1=1"]))) : (0, drizzle_orm_1.sql)(templateObject_11 || (templateObject_11 = __makeTemplateObject(["viewed_at >= ", ""], ["viewed_at >= ", ""])), periodThreshold.toISOString());
                        starTimeFilter = period === 'all' ? (0, drizzle_orm_1.sql)(templateObject_12 || (templateObject_12 = __makeTemplateObject(["1=1"], ["1=1"]))) : (0, drizzle_orm_1.sql)(templateObject_13 || (templateObject_13 = __makeTemplateObject(["starred_at >= ", ""], ["starred_at >= ", ""])), periodThreshold.toISOString());
                        forkTimeFilter = period === 'all' ? (0, drizzle_orm_1.sql)(templateObject_14 || (templateObject_14 = __makeTemplateObject(["1=1"], ["1=1"]))) : (0, drizzle_orm_1.sql)(templateObject_15 || (templateObject_15 = __makeTemplateObject(["created_at >= ", ""], ["created_at >= ", ""])), periodThreshold.toISOString());
                        scoreExpression = this.createAdvancedScoreExpression(sort, period, WEIGHTS);
                        return [4 /*yield*/, this.database
                                .select({
                                app: schema.apps,
                                userName: schema.users.displayName,
                                userAvatar: schema.users.avatarUrl,
                                viewCount: (0, drizzle_orm_1.sql)(templateObject_16 || (templateObject_16 = __makeTemplateObject(["COALESCE(view_stats.count, 0)"], ["COALESCE(view_stats.count, 0)"]))),
                                starCount: (0, drizzle_orm_1.sql)(templateObject_17 || (templateObject_17 = __makeTemplateObject(["COALESCE(star_stats.count, 0)"], ["COALESCE(star_stats.count, 0)"]))),
                                forkCount: (0, drizzle_orm_1.sql)(templateObject_18 || (templateObject_18 = __makeTemplateObject(["COALESCE(fork_stats.count, 0)"], ["COALESCE(fork_stats.count, 0)"])))
                            })
                                .from(schema.apps)
                                .leftJoin(schema.users, (0, drizzle_orm_1.eq)(schema.apps.userId, schema.users.id))
                                .leftJoin((0, drizzle_orm_1.sql)(templateObject_19 || (templateObject_19 = __makeTemplateObject(["(\n                    SELECT app_id, COUNT(*) as count \n                    FROM app_views \n                    WHERE ", "\n                    GROUP BY app_id\n                ) view_stats"], ["(\n                    SELECT app_id, COUNT(*) as count \n                    FROM app_views \n                    WHERE ", "\n                    GROUP BY app_id\n                ) view_stats"])), timeFilter), (0, drizzle_orm_1.sql)(templateObject_20 || (templateObject_20 = __makeTemplateObject(["view_stats.app_id = ", ""], ["view_stats.app_id = ", ""])), schema.apps.id))
                                .leftJoin((0, drizzle_orm_1.sql)(templateObject_21 || (templateObject_21 = __makeTemplateObject(["(\n                    SELECT app_id, COUNT(*) as count \n                    FROM stars \n                    WHERE ", "\n                    GROUP BY app_id\n                ) star_stats"], ["(\n                    SELECT app_id, COUNT(*) as count \n                    FROM stars \n                    WHERE ", "\n                    GROUP BY app_id\n                ) star_stats"])), starTimeFilter), (0, drizzle_orm_1.sql)(templateObject_22 || (templateObject_22 = __makeTemplateObject(["star_stats.app_id = ", ""], ["star_stats.app_id = ", ""])), schema.apps.id))
                                .leftJoin((0, drizzle_orm_1.sql)(templateObject_23 || (templateObject_23 = __makeTemplateObject(["(\n                    SELECT parent_app_id, COUNT(*) as count \n                    FROM apps \n                    WHERE parent_app_id IS NOT NULL AND ", "\n                    GROUP BY parent_app_id\n                ) fork_stats"], ["(\n                    SELECT parent_app_id, COUNT(*) as count \n                    FROM apps \n                    WHERE parent_app_id IS NOT NULL AND ", "\n                    GROUP BY parent_app_id\n                ) fork_stats"])), forkTimeFilter), (0, drizzle_orm_1.sql)(templateObject_24 || (templateObject_24 = __makeTemplateObject(["fork_stats.parent_app_id = ", ""], ["fork_stats.parent_app_id = ", ""])), schema.apps.id))
                                .where(whereClause)
                                .orderBy(direction(scoreExpression), (0, drizzle_orm_1.desc)(schema.apps.createdAt))
                                .limit(limit)
                                .offset(offset)];
                    case 1:
                        basicApps = _h.sent();
                        return [4 /*yield*/, this.database
                                .select({ count: (0, drizzle_orm_1.sql)(templateObject_25 || (templateObject_25 = __makeTemplateObject(["count(*)"], ["count(*)"]))) })
                                .from(schema.apps)
                                .where(whereClause)];
                    case 2:
                        totalQuery = _h.sent();
                        total = ((_g = totalQuery[0]) === null || _g === void 0 ? void 0 : _g.count) || 0;
                        userStarredSet = new Set();
                        userFavoritedSet = new Set();
                        if (!(userId && basicApps.length > 0)) return [3 /*break*/, 4];
                        appIds = basicApps.map(function (row) { return row.app.id; });
                        return [4 /*yield*/, Promise.all([
                                // Batch query for user stars
                                this.database
                                    .select({ appId: schema.stars.appId })
                                    .from(schema.stars)
                                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.stars.userId, userId), (0, drizzle_orm_1.inArray)(schema.stars.appId, appIds))),
                                // Batch query for user favorites
                                this.database
                                    .select({ appId: schema.favorites.appId })
                                    .from(schema.favorites)
                                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.favorites.userId, userId), (0, drizzle_orm_1.inArray)(schema.favorites.appId, appIds)))
                            ])];
                    case 3:
                        _f = _h.sent(), userStars = _f[0], userFavorites = _f[1];
                        userStarredSet = new Set(userStars.map(function (s) { return s.appId; }));
                        userFavoritedSet = new Set(userFavorites.map(function (f) { return f.appId; }));
                        _h.label = 4;
                    case 4:
                        enhancedApps = basicApps.map(function (row) { return (__assign(__assign({}, row.app), { userName: row.userName, userAvatar: row.userAvatar, starCount: row.starCount || 0, userStarred: userStarredSet.has(row.app.id), userFavorited: userFavoritedSet.has(row.app.id), viewCount: row.viewCount || 0, forkCount: row.forkCount || 0, likeCount: 0 })); });
                        return [2 /*return*/, {
                                data: enhancedApps,
                                pagination: {
                                    limit: limit,
                                    offset: offset,
                                    total: total,
                                    hasMore: offset + limit < total
                                }
                            }];
                }
            });
        });
    };
    /**
     * Optimized user apps query with aggregations for popular/trending sorting
     */
    AppService.prototype.getUserAppsWithAggregations = function (userId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, limit, _b, offset, status, visibility, framework, search, _c, sort, _d, order, _e, period, whereConditions, whereClause, periodThreshold, direction, WEIGHTS, timeFilter, starTimeFilter, forkTimeFilter, scoreExpression, basicApps, enhancedApps;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _a = options.limit, limit = _a === void 0 ? 50 : _a, _b = options.offset, offset = _b === void 0 ? 0 : _b, status = options.status, visibility = options.visibility, framework = options.framework, search = options.search, _c = options.sort, sort = _c === void 0 ? 'recent' : _c, _d = options.order, order = _d === void 0 ? 'desc' : _d, _e = options.period, period = _e === void 0 ? 'all' : _e;
                        whereConditions = __spreadArray([
                            (0, drizzle_orm_1.eq)(schema.apps.userId, userId),
                            status ? (0, drizzle_orm_1.eq)(schema.apps.status, status) : undefined,
                            visibility ? (0, drizzle_orm_1.eq)(schema.apps.visibility, visibility) : undefined
                        ], this.buildCommonAppFilters(framework, search), true);
                        whereClause = this.buildWhereConditions(whereConditions);
                        periodThreshold = this.getTimePeriodThreshold(period);
                        direction = order === 'asc' ? drizzle_orm_1.asc : drizzle_orm_1.desc;
                        WEIGHTS = this.RANKING_CONFIG.WEIGHTS;
                        timeFilter = period === 'all' ? (0, drizzle_orm_1.sql)(templateObject_26 || (templateObject_26 = __makeTemplateObject(["1=1"], ["1=1"]))) : (0, drizzle_orm_1.sql)(templateObject_27 || (templateObject_27 = __makeTemplateObject(["viewed_at >= ", ""], ["viewed_at >= ", ""])), periodThreshold.toISOString());
                        starTimeFilter = period === 'all' ? (0, drizzle_orm_1.sql)(templateObject_28 || (templateObject_28 = __makeTemplateObject(["1=1"], ["1=1"]))) : (0, drizzle_orm_1.sql)(templateObject_29 || (templateObject_29 = __makeTemplateObject(["starred_at >= ", ""], ["starred_at >= ", ""])), periodThreshold.toISOString());
                        forkTimeFilter = period === 'all' ? (0, drizzle_orm_1.sql)(templateObject_30 || (templateObject_30 = __makeTemplateObject(["1=1"], ["1=1"]))) : (0, drizzle_orm_1.sql)(templateObject_31 || (templateObject_31 = __makeTemplateObject(["created_at >= ", ""], ["created_at >= ", ""])), periodThreshold.toISOString());
                        scoreExpression = this.createAdvancedScoreExpression(sort, period, WEIGHTS);
                        return [4 /*yield*/, this.database
                                .select({
                                app: schema.apps,
                                viewCount: (0, drizzle_orm_1.sql)(templateObject_32 || (templateObject_32 = __makeTemplateObject(["COALESCE(view_stats.count, 0)"], ["COALESCE(view_stats.count, 0)"]))),
                                starCount: (0, drizzle_orm_1.sql)(templateObject_33 || (templateObject_33 = __makeTemplateObject(["COALESCE(star_stats.count, 0)"], ["COALESCE(star_stats.count, 0)"]))),
                                forkCount: (0, drizzle_orm_1.sql)(templateObject_34 || (templateObject_34 = __makeTemplateObject(["COALESCE(fork_stats.count, 0)"], ["COALESCE(fork_stats.count, 0)"])))
                            })
                                .from(schema.apps)
                                .leftJoin((0, drizzle_orm_1.sql)(templateObject_35 || (templateObject_35 = __makeTemplateObject(["(\n                    SELECT app_id, COUNT(*) as count \n                    FROM app_views \n                    WHERE ", "\n                    GROUP BY app_id\n                ) view_stats"], ["(\n                    SELECT app_id, COUNT(*) as count \n                    FROM app_views \n                    WHERE ", "\n                    GROUP BY app_id\n                ) view_stats"])), timeFilter), (0, drizzle_orm_1.sql)(templateObject_36 || (templateObject_36 = __makeTemplateObject(["view_stats.app_id = ", ""], ["view_stats.app_id = ", ""])), schema.apps.id))
                                .leftJoin((0, drizzle_orm_1.sql)(templateObject_37 || (templateObject_37 = __makeTemplateObject(["(\n                    SELECT app_id, COUNT(*) as count \n                    FROM stars \n                    WHERE ", "\n                    GROUP BY app_id\n                ) star_stats"], ["(\n                    SELECT app_id, COUNT(*) as count \n                    FROM stars \n                    WHERE ", "\n                    GROUP BY app_id\n                ) star_stats"])), starTimeFilter), (0, drizzle_orm_1.sql)(templateObject_38 || (templateObject_38 = __makeTemplateObject(["star_stats.app_id = ", ""], ["star_stats.app_id = ", ""])), schema.apps.id))
                                .leftJoin((0, drizzle_orm_1.sql)(templateObject_39 || (templateObject_39 = __makeTemplateObject(["(\n                    SELECT parent_app_id, COUNT(*) as count \n                    FROM apps \n                    WHERE parent_app_id IS NOT NULL AND ", "\n                    GROUP BY parent_app_id\n                ) fork_stats"], ["(\n                    SELECT parent_app_id, COUNT(*) as count \n                    FROM apps \n                    WHERE parent_app_id IS NOT NULL AND ", "\n                    GROUP BY parent_app_id\n                ) fork_stats"])), forkTimeFilter), (0, drizzle_orm_1.sql)(templateObject_40 || (templateObject_40 = __makeTemplateObject(["fork_stats.parent_app_id = ", ""], ["fork_stats.parent_app_id = ", ""])), schema.apps.id))
                                .where(whereClause)
                                .orderBy(direction(scoreExpression), (0, drizzle_orm_1.desc)(schema.apps.createdAt))
                                .limit(limit)
                                .offset(offset)];
                    case 1:
                        basicApps = _f.sent();
                        enhancedApps = basicApps.map(function (row) { return (__assign(__assign({}, row.app), { userName: null, userAvatar: null, starCount: row.starCount || 0, userStarred: false, userFavorited: false, viewCount: row.viewCount || 0, forkCount: row.forkCount || 0, likeCount: 0 })); });
                        return [2 /*return*/, enhancedApps];
                }
            });
        });
    };
    // ========================================
    // RANKING ALGORITHMS
    // ========================================
    /**
     * Create advanced scoring expression based on industry-standard algorithms
     * Implements velocity-based trending inspired by Reddit, Hacker News, GitHub, and Product Hunt
     */
    AppService.prototype.createAdvancedScoreExpression = function (sort, period, weights) {
        if (sort === 'popular') {
            // Popular: Pure engagement score with logarithmic scaling (Reddit-style)
            // Uses SQRT for diminishing returns (D1-compatible alternative to LOG10)
            return (0, drizzle_orm_1.sql)(templateObject_41 || (templateObject_41 = __makeTemplateObject(["(\n                SQRT(1.0 + COALESCE(view_stats.count, 0) * ", ") +\n                SQRT(1.0 + COALESCE(star_stats.count, 0) * ", ") +\n                SQRT(1.0 + COALESCE(fork_stats.count, 0) * ", ")\n            )"], ["(\n                SQRT(1.0 + COALESCE(view_stats.count, 0) * ", ") +\n                SQRT(1.0 + COALESCE(star_stats.count, 0) * ", ") +\n                SQRT(1.0 + COALESCE(fork_stats.count, 0) * ", ")\n            )"])), weights.VIEWS, weights.STARS, weights.FORKS);
        }
        else if (sort === 'trending') {
            // Trending: Velocity-based algorithm with proper time decay (Hacker News + GitHub inspired)
            // Formula: (engagement_score^0.8) / ((age_in_hours + 2)^1.5)
            // This ensures time eventually overwhelms engagement for balanced trending
            return period === 'all'
                ? (0, drizzle_orm_1.sql)(templateObject_42 || (templateObject_42 = __makeTemplateObject(["(\n                    -- D1-compatible approximation: SQRT(SQRT(x)) \u2248 x^0.25, close to x^0.8 for engagement\n                    SQRT(SQRT(\n                        SQRT(1.0 + COALESCE(view_stats.count, 0) * ", ") +\n                        SQRT(1.0 + COALESCE(star_stats.count, 0) * ", ") +\n                        SQRT(1.0 + COALESCE(fork_stats.count, 0) * ", ")\n                    )) / \n                    -- Age penalty: 1 + age_hours^1.5 approximated with quadratic growth\n                    (1.0 + ((julianday('now') - julianday(", ")) * 24) * 0.5 + \n                     ((julianday('now') - julianday(", ")) * 24) * ((julianday('now') - julianday(", ")) * 24) * 0.05)\n                  )"], ["(\n                    -- D1-compatible approximation: SQRT(SQRT(x)) \u2248 x^0.25, close to x^0.8 for engagement\n                    SQRT(SQRT(\n                        SQRT(1.0 + COALESCE(view_stats.count, 0) * ", ") +\n                        SQRT(1.0 + COALESCE(star_stats.count, 0) * ", ") +\n                        SQRT(1.0 + COALESCE(fork_stats.count, 0) * ", ")\n                    )) / \n                    -- Age penalty: 1 + age_hours^1.5 approximated with quadratic growth\n                    (1.0 + ((julianday('now') - julianday(", ")) * 24) * 0.5 + \n                     ((julianday('now') - julianday(", ")) * 24) * ((julianday('now') - julianday(", ")) * 24) * 0.05)\n                  )"])), weights.VIEWS, weights.STARS, weights.FORKS, schema.apps.createdAt, schema.apps.createdAt, schema.apps.createdAt) : this.createVelocityTrendingScore(period, weights);
        }
        // Default fallback
        return (0, drizzle_orm_1.sql)(templateObject_43 || (templateObject_43 = __makeTemplateObject(["", ""], ["", ""])), schema.apps.updatedAt);
    };
    /**
     * Create velocity-based trending score using efficient aggregated stats
     * This approach uses the pre-aggregated view/star/fork stats with velocity weighting
     */
    AppService.prototype.createVelocityTrendingScore = function (period, weights) {
        // Simplified velocity formula using pre-aggregated period stats
        // Higher weight for recent engagement + age decay for fairness
        var velocityMultiplier = this.getVelocityMultiplier(period);
        return (0, drizzle_orm_1.sql)(templateObject_44 || (templateObject_44 = __makeTemplateObject(["(\n            -- Enhanced engagement score with velocity boost for recent period\n            (SQRT(1.0 + COALESCE(view_stats.count, 0) * ", " * ", ") +\n             SQRT(1.0 + COALESCE(star_stats.count, 0) * ", " * ", ") +\n             SQRT(1.0 + COALESCE(fork_stats.count, 0) * ", " * ", ")) /\n            -- Age decay ensures fresh content can trend (Product Hunt style)\n            SQRT(1.0 + ((julianday('now') - julianday(", ")) * 24) * 0.02)\n        )"], ["(\n            -- Enhanced engagement score with velocity boost for recent period\n            (SQRT(1.0 + COALESCE(view_stats.count, 0) * ", " * ", ") +\n             SQRT(1.0 + COALESCE(star_stats.count, 0) * ", " * ", ") +\n             SQRT(1.0 + COALESCE(fork_stats.count, 0) * ", " * ", ")) /\n            -- Age decay ensures fresh content can trend (Product Hunt style)\n            SQRT(1.0 + ((julianday('now') - julianday(", ")) * 24) * 0.02)\n        )"])), weights.VIEWS, velocityMultiplier, weights.STARS, velocityMultiplier, weights.FORKS, velocityMultiplier, schema.apps.createdAt);
    };
    /**
     * Get velocity multiplier based on time period for trending boost
     * Shorter periods get higher multipliers to show recent momentum
     */
    AppService.prototype.getVelocityMultiplier = function (period) {
        switch (period) {
            case 'today':
                return 3.0; // Highest boost for daily trending
            case 'week':
                return 2.0; // Medium boost for weekly trending  
            case 'month':
                return 1.5; // Light boost for monthly trending
            default:
                return 1.0; // No boost for all-time
        }
    };
    /**
     * Delete an app with ownership verification and cascade delete related records
     * Returns success/error result for proper error handling
     */
    AppService.prototype.deleteApp = function (appId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var ownershipResult, deleteResult, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, this.checkAppOwnership(appId, userId)];
                    case 1:
                        ownershipResult = _b.sent();
                        if (!ownershipResult.exists) {
                            return [2 /*return*/, { success: false, error: 'App not found' }];
                        }
                        if (!ownershipResult.isOwner) {
                            return [2 /*return*/, { success: false, error: 'You can only delete your own apps' }];
                        }
                        // Delete related records first (foreign key constraints)
                        // This follows the cascade delete pattern for data integrity
                        // Delete favorites
                        return [4 /*yield*/, this.database
                                .delete(schema.favorites)
                                .where((0, drizzle_orm_1.eq)(schema.favorites.appId, appId))];
                    case 2:
                        // Delete related records first (foreign key constraints)
                        // This follows the cascade delete pattern for data integrity
                        // Delete favorites
                        _b.sent();
                        // Delete stars  
                        return [4 /*yield*/, this.database
                                .delete(schema.stars)
                                .where((0, drizzle_orm_1.eq)(schema.stars.appId, appId))];
                    case 3:
                        // Delete stars  
                        _b.sent();
                        // Delete app views
                        return [4 /*yield*/, this.database
                                .delete(schema.appViews)
                                .where((0, drizzle_orm_1.eq)(schema.appViews.appId, appId))];
                    case 4:
                        // Delete app views
                        _b.sent();
                        // Handle fork relationships properly
                        // If this app is a parent, make forks independent (don't delete them!)
                        return [4 /*yield*/, this.database
                                .update(schema.apps)
                                .set({ parentAppId: null })
                                .where((0, drizzle_orm_1.eq)(schema.apps.parentAppId, appId))];
                    case 5:
                        // Handle fork relationships properly
                        // If this app is a parent, make forks independent (don't delete them!)
                        _b.sent();
                        return [4 /*yield*/, this.database
                                .delete(schema.apps)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.apps.id, appId), (0, drizzle_orm_1.eq)(schema.apps.userId, userId)))
                                .returning({ id: schema.apps.id })];
                    case 6:
                        deleteResult = _b.sent();
                        if (deleteResult.length === 0) {
                            return [2 /*return*/, { success: false, error: 'Failed to delete app - app may have been already deleted' }];
                        }
                        return [2 /*return*/, { success: true }];
                    case 7:
                        error_2 = _b.sent();
                        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.error('Error deleting app:', error_2);
                        return [2 /*return*/, { success: false, error: 'An error occurred while deleting the app' }];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    return AppService;
}(BaseService_1.BaseService));
exports.AppService = AppService;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11, templateObject_12, templateObject_13, templateObject_14, templateObject_15, templateObject_16, templateObject_17, templateObject_18, templateObject_19, templateObject_20, templateObject_21, templateObject_22, templateObject_23, templateObject_24, templateObject_25, templateObject_26, templateObject_27, templateObject_28, templateObject_29, templateObject_30, templateObject_31, templateObject_32, templateObject_33, templateObject_34, templateObject_35, templateObject_36, templateObject_37, templateObject_38, templateObject_39, templateObject_40, templateObject_41, templateObject_42, templateObject_43, templateObject_44;
