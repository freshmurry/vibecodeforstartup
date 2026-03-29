"use strict";
/**
 * User Service
 * Handles all user-related database operations including sessions, teams, and profiles
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
var BaseService_1 = require("./BaseService");
var schema = require("../schema");
var drizzle_orm_1 = require("drizzle-orm");
var idGenerator_1 = require("../../utils/idGenerator");
var AnalyticsService_1 = require("./AnalyticsService");
var AppService_1 = require("./AppService");
/**
 * User Service Class
 */
var UserService = /** @class */ (function (_super) {
    __extends(UserService, _super);
    function UserService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // ========================================
    // USER MANAGEMENT
    // ========================================
    UserService.prototype.createUser = function (userData) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database
                            .insert(schema.users)
                            .values(__assign(__assign({}, userData), { id: (0, idGenerator_1.generateId)() }))
                            .returning()];
                    case 1:
                        user = (_a.sent())[0];
                        return [2 /*return*/, user];
                }
            });
        });
    };
    UserService.prototype.findUserByEmail = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            var users;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database
                            .select()
                            .from(schema.users)
                            .where((0, drizzle_orm_1.eq)(schema.users.email, email))
                            .limit(1)];
                    case 1:
                        users = _a.sent();
                        return [2 /*return*/, users[0] || null];
                }
            });
        });
    };
    UserService.prototype.findUserById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var users;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database
                            .select()
                            .from(schema.users)
                            .where((0, drizzle_orm_1.eq)(schema.users.id, id))
                            .limit(1)];
                    case 1:
                        users = _a.sent();
                        return [2 /*return*/, users[0] || null];
                }
            });
        });
    };
    UserService.prototype.findUserByProvider = function (provider, providerId) {
        return __awaiter(this, void 0, void 0, function () {
            var users;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database
                            .select()
                            .from(schema.users)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.users.provider, provider), (0, drizzle_orm_1.eq)(schema.users.providerId, providerId)))
                            .limit(1)];
                    case 1:
                        users = _a.sent();
                        return [2 /*return*/, users[0] || null];
                }
            });
        });
    };
    UserService.prototype.updateUserActivity = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database
                            .update(schema.users)
                            .set({
                            lastActiveAt: new Date(),
                            updatedAt: new Date()
                        })
                            .where((0, drizzle_orm_1.eq)(schema.users.id, userId))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // ========================================
    // SESSION MANAGEMENT
    // ========================================
    UserService.prototype.createSession = function (sessionData) {
        return __awaiter(this, void 0, void 0, function () {
            var session;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database
                            .insert(schema.sessions)
                            .values(__assign(__assign({}, sessionData), { id: (0, idGenerator_1.generateId)() }))
                            .returning()];
                    case 1:
                        session = (_a.sent())[0];
                        return [2 /*return*/, session];
                }
            });
        });
    };
    UserService.prototype.findValidSession = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var sessions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database
                            .select()
                            .from(schema.sessions)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.sessions.id, sessionId), (0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", " > CURRENT_TIMESTAMP"], ["", " > CURRENT_TIMESTAMP"])), schema.sessions.expiresAt)))
                            .limit(1)];
                    case 1:
                        sessions = _a.sent();
                        return [2 /*return*/, sessions[0] || null];
                }
            });
        });
    };
    UserService.prototype.cleanupExpiredSessions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var now;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        now = new Date();
                        return [4 /*yield*/, this.database
                                .delete(schema.sessions)
                                .where((0, drizzle_orm_1.lt)(schema.sessions.expiresAt, now))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // ========================================
    // USER PROFILE OPERATIONS
    // ========================================
    /**
     * Get user apps with analytics data integrated
     */
    UserService.prototype.getUserAppsWithAnalytics = function (userId_1) {
        return __awaiter(this, arguments, void 0, function (userId, options) {
            var appService;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                appService = new AppService_1.AppService(this.env);
                return [2 /*return*/, appService.getUserAppsWithAnalytics(userId, options)];
            });
        });
    };
    /**
     * Get total count of user apps with filters (for pagination)
     */
    UserService.prototype.getUserAppsCount = function (userId_1) {
        return __awaiter(this, arguments, void 0, function (userId, options) {
            var appService;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                appService = new AppService_1.AppService(this.env);
                return [2 /*return*/, appService.getUserAppsCount(userId, options)];
            });
        });
    };
    /**
     * Update user profile directly
     */
    UserService.prototype.updateUserProfile = function (userId, profileData) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database
                            .update(schema.users)
                            .set(__assign(__assign({}, profileData), { updatedAt: new Date() }))
                            .where((0, drizzle_orm_1.eq)(schema.users.id, userId))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check if username is available
     */
    UserService.prototype.isUsernameAvailable = function (username, excludeUserId) {
        return __awaiter(this, void 0, void 0, function () {
            var existingUser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database
                            .select({ id: schema.users.id })
                            .from(schema.users)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.users.username, username), excludeUserId ? (0, drizzle_orm_1.ne)(schema.users.id, excludeUserId) : undefined))
                            .get()];
                    case 1:
                        existingUser = _a.sent();
                        return [2 /*return*/, !existingUser];
                }
            });
        });
    };
    /**
     * Update user profile with comprehensive validation
     */
    UserService.prototype.updateUserProfileWithValidation = function (userId, profileData) {
        return __awaiter(this, void 0, void 0, function () {
            var username, reserved, existingUser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!profileData.username) return [3 /*break*/, 2];
                        username = profileData.username;
                        // Format validation
                        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
                            return [2 /*return*/, {
                                    success: false,
                                    message: 'Username can only contain letters, numbers, underscores, and hyphens'
                                }];
                        }
                        if (username.length < 3 || username.length > 30) {
                            return [2 /*return*/, {
                                    success: false,
                                    message: 'Username must be between 3 and 30 characters'
                                }];
                        }
                        reserved = ['admin', 'api', 'www', 'mail', 'ftp', 'root', 'support', 'help', 'about', 'terms', 'privacy'];
                        if (reserved.includes(username.toLowerCase())) {
                            return [2 /*return*/, {
                                    success: false,
                                    message: 'Username is reserved'
                                }];
                        }
                        return [4 /*yield*/, this.database
                                .select({ id: schema.users.id })
                                .from(schema.users)
                                .where((0, drizzle_orm_1.eq)(schema.users.username, username))
                                .get()];
                    case 1:
                        existingUser = _a.sent();
                        if (existingUser && existingUser.id !== userId) {
                            return [2 /*return*/, {
                                    success: false,
                                    message: 'Username already taken'
                                }];
                        }
                        _a.label = 2;
                    case 2: 
                    // Update profile
                    return [4 /*yield*/, this.database
                            .update(schema.users)
                            .set({
                            username: profileData.username || undefined,
                            displayName: profileData.displayName || undefined,
                            bio: profileData.bio || undefined,
                            theme: profileData.theme || undefined,
                            updatedAt: new Date()
                        })
                            .where((0, drizzle_orm_1.eq)(schema.users.id, userId))];
                    case 3:
                        // Update profile
                        _a.sent();
                        return [2 /*return*/, { success: true, message: 'Profile updated successfully' }];
                }
            });
        });
    };
    /**
     * Get basic user statistics efficiently
     */
    UserService.prototype.getUserStatisticsBasic = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var startOfMonth, _a, totalApps, appsThisMonth;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        startOfMonth = new Date();
                        startOfMonth.setDate(1);
                        startOfMonth.setHours(0, 0, 0, 0);
                        return [4 /*yield*/, Promise.all([
                                // Total apps count
                                this.database
                                    .select({ count: (0, drizzle_orm_1.sql)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["COUNT(*)"], ["COUNT(*)"]))) })
                                    .from(schema.apps)
                                    .where((0, drizzle_orm_1.eq)(schema.apps.userId, userId))
                                    .get()
                                    .then(function (r) { return Number(r === null || r === void 0 ? void 0 : r.count) || 0; }),
                                // Apps created this month
                                this.database
                                    .select({ count: (0, drizzle_orm_1.sql)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["COUNT(*)"], ["COUNT(*)"]))) })
                                    .from(schema.apps)
                                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.apps.userId, userId), (0, drizzle_orm_1.sql)(templateObject_4 || (templateObject_4 = __makeTemplateObject(["", " >= ", ""], ["", " >= ", ""])), schema.apps.createdAt, startOfMonth)))
                                    .get()
                                    .then(function (r) { return Number(r === null || r === void 0 ? void 0 : r.count) || 0; })
                            ])];
                    case 1:
                        _a = _b.sent(), totalApps = _a[0], appsThisMonth = _a[1];
                        return [2 /*return*/, { totalApps: totalApps, appsThisMonth: appsThisMonth }];
                }
            });
        });
    };
    /**
     * Get comprehensive user statistics for stats controller
     */
    UserService.prototype.getUserStatisticsEnhanced = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var analyticsService;
            return __generator(this, function (_a) {
                analyticsService = new AnalyticsService_1.AnalyticsService(this.env);
                return [2 /*return*/, analyticsService.getEnhancedUserStats(userId)];
            });
        });
    };
    /**
     * Get user activity timeline for stats controller
     */
    UserService.prototype.getUserActivityTimeline = function (userId, limit) {
        return __awaiter(this, void 0, void 0, function () {
            var analyticsService;
            return __generator(this, function (_a) {
                analyticsService = new AnalyticsService_1.AnalyticsService(this.env);
                return [2 /*return*/, analyticsService.getUserActivityTimeline(userId, limit)];
            });
        });
    };
    return UserService;
}(BaseService_1.BaseService));
exports.UserService = UserService;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
