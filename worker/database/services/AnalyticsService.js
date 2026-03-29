"use strict";
/**
 * Analytics and Count Queries Service
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
exports.AnalyticsService = void 0;
var BaseService_1 = require("./BaseService");
var schema = require("../schema");
var drizzle_orm_1 = require("drizzle-orm");
var AnalyticsService = /** @class */ (function (_super) {
    __extends(AnalyticsService, _super);
    function AnalyticsService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Get app statistics
     */
    AnalyticsService.prototype.getAppStats = function (appId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, viewCount, forkCount, likeCount;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            // Count unique views (by user or session)
                            this.database
                                .select({ count: (0, drizzle_orm_1.count)() })
                                .from(schema.appViews)
                                .where((0, drizzle_orm_1.eq)(schema.appViews.appId, appId))
                                .get(),
                            // Count forks (apps with this as parent)
                            this.database
                                .select({ count: (0, drizzle_orm_1.count)() })
                                .from(schema.apps)
                                .where((0, drizzle_orm_1.eq)(schema.apps.parentAppId, appId))
                                .get(),
                            // Count likes/stars
                            this.database
                                .select({ count: (0, drizzle_orm_1.count)() })
                                .from(schema.appLikes)
                                .where((0, drizzle_orm_1.eq)(schema.appLikes.appId, appId))
                                .get()
                        ])];
                    case 1:
                        _a = _e.sent(), viewCount = _a[0], forkCount = _a[1], likeCount = _a[2];
                        return [2 /*return*/, {
                                viewCount: (_b = viewCount === null || viewCount === void 0 ? void 0 : viewCount.count) !== null && _b !== void 0 ? _b : 0,
                                forkCount: (_c = forkCount === null || forkCount === void 0 ? void 0 : forkCount.count) !== null && _c !== void 0 ? _c : 0,
                                likeCount: (_d = likeCount === null || likeCount === void 0 ? void 0 : likeCount.count) !== null && _d !== void 0 ? _d : 0
                            }];
                }
            });
        });
    };
    /**
     * Get comment statistics
     */
    AnalyticsService.prototype.getCommentStats = function (commentId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, likeCount, replyCount;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            // Count comment likes
                            this.database
                                .select({ count: (0, drizzle_orm_1.count)() })
                                .from(schema.commentLikes)
                                .where((0, drizzle_orm_1.eq)(schema.commentLikes.commentId, commentId))
                                .get(),
                            // Count replies
                            this.database
                                .select({ count: (0, drizzle_orm_1.count)() })
                                .from(schema.appComments)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.appComments.parentCommentId, commentId), (0, drizzle_orm_1.eq)(schema.appComments.isDeleted, false)))
                                .get()
                        ])];
                    case 1:
                        _a = _d.sent(), likeCount = _a[0], replyCount = _a[1];
                        return [2 /*return*/, {
                                likeCount: (_b = likeCount === null || likeCount === void 0 ? void 0 : likeCount.count) !== null && _b !== void 0 ? _b : 0,
                                replyCount: (_c = replyCount === null || replyCount === void 0 ? void 0 : replyCount.count) !== null && _c !== void 0 ? _c : 0
                            }];
                }
            });
        });
    };
    /**
     * Batch get statistics for multiple entities
     * More efficient when loading lists of items
     */
    AnalyticsService.prototype.batchGetAppStats = function (appIds) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, views, forks, likes, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (appIds.length === 0)
                            return [2 /*return*/, {}];
                        return [4 /*yield*/, Promise.all([
                                // Batch view counts
                                this.database
                                    .select({
                                    appId: schema.appViews.appId,
                                    count: (0, drizzle_orm_1.count)()
                                })
                                    .from(schema.appViews)
                                    .where((0, drizzle_orm_1.inArray)(schema.appViews.appId, appIds))
                                    .groupBy(schema.appViews.appId)
                                    .all(),
                                // Batch fork counts
                                this.database
                                    .select({
                                    parentAppId: schema.apps.parentAppId,
                                    count: (0, drizzle_orm_1.count)()
                                })
                                    .from(schema.apps)
                                    .where((0, drizzle_orm_1.inArray)(schema.apps.parentAppId, appIds))
                                    .groupBy(schema.apps.parentAppId)
                                    .all(),
                                // Batch like counts
                                this.database
                                    .select({
                                    appId: schema.appLikes.appId,
                                    count: (0, drizzle_orm_1.count)()
                                })
                                    .from(schema.appLikes)
                                    .where((0, drizzle_orm_1.inArray)(schema.appLikes.appId, appIds))
                                    .groupBy(schema.appLikes.appId)
                                    .all()
                            ])];
                    case 1:
                        _a = _b.sent(), views = _a[0], forks = _a[1], likes = _a[2];
                        result = {};
                        appIds.forEach(function (appId) {
                            var _a, _b, _c, _d, _e, _f;
                            result[appId] = {
                                viewCount: (_b = (_a = views.find(function (v) { return v.appId === appId; })) === null || _a === void 0 ? void 0 : _a.count) !== null && _b !== void 0 ? _b : 0,
                                forkCount: (_d = (_c = forks.find(function (f) { return f.parentAppId === appId; })) === null || _c === void 0 ? void 0 : _c.count) !== null && _d !== void 0 ? _d : 0,
                                likeCount: (_f = (_e = likes.find(function (l) { return l.appId === appId; })) === null || _e === void 0 ? void 0 : _e.count) !== null && _f !== void 0 ? _f : 0
                            };
                        });
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Get user statistics
     */
    AnalyticsService.prototype.getUserStats = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, appCount, publicAppCount, favoriteCount, totalLikesReceived, totalViewsReceived;
            var _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            // Count user's total apps
                            this.database
                                .select({ count: (0, drizzle_orm_1.count)() })
                                .from(schema.apps)
                                .where((0, drizzle_orm_1.eq)(schema.apps.userId, userId))
                                .get(),
                            // Count user's public apps
                            this.database
                                .select({ count: (0, drizzle_orm_1.count)() })
                                .from(schema.apps)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.apps.userId, userId), (0, drizzle_orm_1.eq)(schema.apps.visibility, 'public')))
                                .get(),
                            // Count favorites
                            this.database
                                .select({ count: (0, drizzle_orm_1.count)() })
                                .from(schema.favorites)
                                .where((0, drizzle_orm_1.eq)(schema.favorites.userId, userId))
                                .get(),
                            // Count total likes received on user's apps
                            this.database
                                .select({ count: (0, drizzle_orm_1.count)() })
                                .from(schema.appLikes)
                                .innerJoin(schema.apps, (0, drizzle_orm_1.eq)(schema.appLikes.appId, schema.apps.id))
                                .where((0, drizzle_orm_1.eq)(schema.apps.userId, userId))
                                .get(),
                            // Count total views received on user's apps
                            this.database
                                .select({ count: (0, drizzle_orm_1.count)() })
                                .from(schema.appViews)
                                .innerJoin(schema.apps, (0, drizzle_orm_1.eq)(schema.appViews.appId, schema.apps.id))
                                .where((0, drizzle_orm_1.eq)(schema.apps.userId, userId))
                                .get()
                        ])];
                    case 1:
                        _a = _g.sent(), appCount = _a[0], publicAppCount = _a[1], favoriteCount = _a[2], totalLikesReceived = _a[3], totalViewsReceived = _a[4];
                        return [2 /*return*/, {
                                appCount: (_b = appCount === null || appCount === void 0 ? void 0 : appCount.count) !== null && _b !== void 0 ? _b : 0,
                                publicAppCount: (_c = publicAppCount === null || publicAppCount === void 0 ? void 0 : publicAppCount.count) !== null && _c !== void 0 ? _c : 0,
                                favoriteCount: (_d = favoriteCount === null || favoriteCount === void 0 ? void 0 : favoriteCount.count) !== null && _d !== void 0 ? _d : 0,
                                totalLikesReceived: (_e = totalLikesReceived === null || totalLikesReceived === void 0 ? void 0 : totalLikesReceived.count) !== null && _e !== void 0 ? _e : 0,
                                totalViewsReceived: (_f = totalViewsReceived === null || totalViewsReceived === void 0 ? void 0 : totalViewsReceived.count) !== null && _f !== void 0 ? _f : 0
                            }];
                }
            });
        });
    };
    /**
     * Get enhanced user statistics with all metrics for stats controller
     * Extends basic getUserStats with additional calculations
     */
    AnalyticsService.prototype.getEnhancedUserStats = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var basicStats, _a, publicAppCount, totalLikesReceived, streakDays;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getUserStats(userId)];
                    case 1:
                        basicStats = _b.sent();
                        return [4 /*yield*/, Promise.all([
                                // Count user's public apps
                                this.database
                                    .select({ count: (0, drizzle_orm_1.count)() })
                                    .from(schema.apps)
                                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.apps.userId, userId), (0, drizzle_orm_1.eq)(schema.apps.visibility, 'public')))
                                    .get()
                                    .then(function (r) { var _a; return (_a = r === null || r === void 0 ? void 0 : r.count) !== null && _a !== void 0 ? _a : 0; }),
                                // Count total likes received on user's apps
                                this.database
                                    .select({ count: (0, drizzle_orm_1.count)() })
                                    .from(schema.favorites)
                                    .innerJoin(schema.apps, (0, drizzle_orm_1.eq)(schema.favorites.appId, schema.apps.id))
                                    .where((0, drizzle_orm_1.eq)(schema.apps.userId, userId))
                                    .get()
                                    .then(function (r) { var _a; return (_a = r === null || r === void 0 ? void 0 : r.count) !== null && _a !== void 0 ? _a : 0; }),
                                // Calculate user activity streak
                                this.calculateUserStreak(userId)
                            ])];
                    case 2:
                        _a = _b.sent(), publicAppCount = _a[0], totalLikesReceived = _a[1], streakDays = _a[2];
                        return [2 /*return*/, __assign(__assign({}, basicStats), { publicAppCount: publicAppCount, totalLikesReceived: totalLikesReceived, streakDays: streakDays, achievements: [] // Placeholder for future achievement system
                             })];
                }
            });
        });
    };
    /**
     * Calculate consecutive days of user activity
     * Based on app creation and update dates
     */
    AnalyticsService.prototype.calculateUserStreak = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var activities, streak, today, lastActivity, daysDiff, currentDate, _i, activities_1, activity, activityDate, diff, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.database
                                .select({
                                date: (0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["DATE(", ")"], ["DATE(", ")"])), schema.apps.updatedAt)
                            })
                                .from(schema.apps)
                                .where((0, drizzle_orm_1.eq)(schema.apps.userId, userId))
                                .orderBy((0, drizzle_orm_1.sql)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["DATE(", ") DESC"], ["DATE(", ") DESC"])), schema.apps.updatedAt))
                                .groupBy((0, drizzle_orm_1.sql)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["DATE(", ")"], ["DATE(", ")"])), schema.apps.updatedAt))
                                .all()];
                    case 1:
                        activities = _b.sent();
                        if (activities.length === 0)
                            return [2 /*return*/, 0];
                        streak = 0;
                        today = new Date();
                        today.setHours(0, 0, 0, 0);
                        lastActivity = new Date(activities[0].date);
                        daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
                        if (daysDiff > 1)
                            return [2 /*return*/, 0]; // Streak broken
                        currentDate = new Date(lastActivity);
                        for (_i = 0, activities_1 = activities; _i < activities_1.length; _i++) {
                            activity = activities_1[_i];
                            activityDate = new Date(activity.date);
                            diff = Math.floor((currentDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
                            if (diff <= 1) {
                                streak++;
                                currentDate = activityDate;
                            }
                            else {
                                break; // Streak broken
                            }
                        }
                        return [2 /*return*/, streak];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, 0]; // Return 0 on any error
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get user activity timeline
     * Returns recent activities for user dashboard
     */
    AnalyticsService.prototype.getUserActivityTimeline = function (userId_1) {
        return __awaiter(this, arguments, void 0, function (userId, limit) {
            var appActivities, favoriteActivities, activities;
            if (limit === void 0) { limit = 20; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database
                            .select({
                            id: schema.apps.id,
                            title: schema.apps.title,
                            action: (0, drizzle_orm_1.sql)(templateObject_4 || (templateObject_4 = __makeTemplateObject(["CASE WHEN ", " = ", " THEN 'created' ELSE 'updated' END"], ["CASE WHEN ", " = ", " THEN 'created' ELSE 'updated' END"])), schema.apps.createdAt, schema.apps.updatedAt),
                            timestamp: schema.apps.updatedAt,
                            framework: schema.apps.framework
                        })
                            .from(schema.apps)
                            .where((0, drizzle_orm_1.eq)(schema.apps.userId, userId))
                            .orderBy((0, drizzle_orm_1.sql)(templateObject_5 || (templateObject_5 = __makeTemplateObject(["", " DESC"], ["", " DESC"])), schema.apps.updatedAt))
                            .limit(limit)];
                    case 1:
                        appActivities = _a.sent();
                        return [4 /*yield*/, this.database
                                .select({
                                appId: schema.favorites.appId,
                                appTitle: schema.apps.title,
                                timestamp: schema.favorites.createdAt
                            })
                                .from(schema.favorites)
                                .innerJoin(schema.apps, (0, drizzle_orm_1.eq)(schema.favorites.appId, schema.apps.id))
                                .where((0, drizzle_orm_1.eq)(schema.favorites.userId, userId))
                                .orderBy((0, drizzle_orm_1.sql)(templateObject_6 || (templateObject_6 = __makeTemplateObject(["", " DESC"], ["", " DESC"])), schema.favorites.createdAt))
                                .limit(Math.floor(limit / 2))];
                    case 2:
                        favoriteActivities = _a.sent();
                        activities = __spreadArray(__spreadArray([], appActivities.map(function (a) { return ({
                            type: a.action,
                            title: a.title,
                            timestamp: a.timestamp,
                            metadata: { framework: a.framework, appId: a.id }
                        }); }), true), favoriteActivities.map(function (f) { return ({
                            type: 'favorited',
                            title: f.appTitle || 'Unknown App',
                            timestamp: f.timestamp,
                            metadata: { appId: f.appId }
                        }); }), true);
                        // Sort by timestamp descending and limit results
                        return [2 /*return*/, activities
                                .sort(function (a, b) {
                                var dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                                var dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                                return dateB - dateA;
                            })
                                .slice(0, limit)];
                }
            });
        });
    };
    return AnalyticsService;
}(BaseService_1.BaseService));
exports.AnalyticsService = AnalyticsService;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6;
