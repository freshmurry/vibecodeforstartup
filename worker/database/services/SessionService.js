"use strict";
/**
 * Session Service for managing user sessions in D1
 * Provides session creation, validation, and cleanup
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
exports.SessionService = void 0;
var errors_1 = require("../../../shared/types/errors");
var schema = require("../schema");
var drizzle_orm_1 = require("drizzle-orm");
var logger_1 = require("../../logger");
var idGenerator_1 = require("../../utils/idGenerator");
var jwtUtils_1 = require("../../utils/jwtUtils");
var authUtils_1 = require("../../utils/authUtils");
var BaseService_1 = require("./BaseService");
var logger = (0, logger_1.createLogger)('SessionService');
/**
 * Session Service for D1-based session management
 */
var SessionService = /** @class */ (function (_super) {
    __extends(SessionService, _super);
    function SessionService(env) {
        var _this = _super.call(this, env) || this;
        _this.jwtUtils = jwtUtils_1.JWTUtils.getInstance(env);
        return _this;
    }
    /**
     * Log security event for audit purposes
     */
    SessionService.prototype.logSecurityEvent = function (userId, sessionId, eventType, details, request) {
        return __awaiter(this, void 0, void 0, function () {
            var metadata, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        metadata = request ? (0, authUtils_1.extractRequestMetadata)(request) : { ipAddress: 'unknown', userAgent: 'unknown' };
                        return [4 /*yield*/, this.db.db.insert(schema.auditLogs).values({
                                id: (0, idGenerator_1.generateId)(),
                                userId: userId,
                                entityType: 'session',
                                entityId: sessionId,
                                action: eventType,
                                newValues: details,
                                ipAddress: metadata.ipAddress,
                                userAgent: metadata.userAgent,
                                createdAt: new Date()
                            })];
                    case 1:
                        _a.sent();
                        logger.warn('Security event logged', {
                            userId: userId,
                            sessionId: sessionId,
                            eventType: eventType,
                            details: details
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        logger.error('Failed to log security event', error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a new session
     */
    SessionService.prototype.createSession = function (userId, request) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionId, userEmail, accessToken, accessTokenHash, requestMetadata, deviceInfo, now, expiresAt, session, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        // Clean up old sessions for this user
                        return [4 /*yield*/, this.cleanupUserSessions(userId)];
                    case 1:
                        // Clean up old sessions for this user
                        _b.sent();
                        sessionId = (0, idGenerator_1.generateId)();
                        return [4 /*yield*/, this.getUserEmail(userId)];
                    case 2:
                        userEmail = _b.sent();
                        return [4 /*yield*/, this.jwtUtils.createAccessToken(userId, userEmail, sessionId)];
                    case 3:
                        accessToken = (_b.sent()).accessToken;
                        return [4 /*yield*/, this.jwtUtils.hashToken(accessToken)];
                    case 4:
                        accessTokenHash = _b.sent();
                        requestMetadata = (0, authUtils_1.extractRequestMetadata)(request);
                        deviceInfo = requestMetadata.userAgent;
                        now = new Date();
                        expiresAt = new Date(Date.now() + SessionService.config.sessionTTL * 1000);
                        return [4 /*yield*/, this.db.db.insert(schema.sessions).values({
                                id: sessionId,
                                userId: userId,
                                accessTokenHash: accessTokenHash,
                                refreshTokenHash: '',
                                expiresAt: expiresAt,
                                lastActivity: now,
                                ipAddress: requestMetadata.ipAddress,
                                userAgent: requestMetadata.userAgent,
                                deviceInfo: deviceInfo,
                                createdAt: now
                            })];
                    case 5:
                        _b.sent();
                        _a = {
                            userId: userId
                        };
                        return [4 /*yield*/, this.getUserEmail(userId)];
                    case 6:
                        session = (_a.email = _b.sent(),
                            _a.sessionId = sessionId,
                            _a.expiresAt = expiresAt,
                            _a);
                        logger.info('Session created', { userId: userId, sessionId: sessionId });
                        return [2 /*return*/, {
                                session: session,
                                accessToken: accessToken,
                            }];
                    case 7:
                        error_2 = _b.sent();
                        logger.error('Error creating session', error_2);
                        throw new errors_1.SecurityError(errors_1.SecurityErrorType.UNAUTHORIZED, 'Failed to create session', 500);
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Revoke session with ID and userID
     */
    SessionService.prototype.revokeUserSession = function (sessionId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.db.db
                                .update(schema.sessions)
                                .set({
                                isRevoked: true,
                                revokedAt: new Date(),
                                revokedReason: 'user_logout'
                            })
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.sessions.id, sessionId), (0, drizzle_orm_1.eq)(schema.sessions.userId, userId)))];
                    case 1:
                        _a.sent();
                        logger.info('Session revoked', { sessionId: sessionId });
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        logger.error('Error revoking session', error_3);
                        throw new errors_1.SecurityError(errors_1.SecurityErrorType.UNAUTHORIZED, 'Failed to revoke session', 500);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Revoke all sessions for a user
     */
    SessionService.prototype.revokeAllUserSessions = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.db.db
                                .update(schema.sessions)
                                .set({
                                isRevoked: true,
                                revokedAt: new Date(),
                                revokedReason: 'user_force_logout'
                            })
                                .where((0, drizzle_orm_1.eq)(schema.sessions.userId, userId))];
                    case 1:
                        _a.sent();
                        logger.info('All user sessions revoked', { userId: userId });
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        logger.error('Error revoking user sessions', error_4);
                        throw new errors_1.SecurityError(errors_1.SecurityErrorType.UNAUTHORIZED, 'Failed to revoke sessions', 500);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get all active sessions for a user
     */
    SessionService.prototype.getUserSessions = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var sessions, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.db.db
                                .select({
                                id: schema.sessions.id,
                                userAgent: schema.sessions.userAgent,
                                ipAddress: schema.sessions.ipAddress,
                                lastActivity: schema.sessions.lastActivity,
                                createdAt: schema.sessions.createdAt
                            })
                                .from(schema.sessions)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.sessions.userId, userId), (0, drizzle_orm_1.eq)(schema.sessions.isRevoked, false), (0, drizzle_orm_1.gt)(schema.sessions.expiresAt, new Date())))
                                .orderBy((0, drizzle_orm_1.desc)(schema.sessions.lastActivity))
                                .all()];
                    case 1:
                        sessions = _a.sent();
                        return [2 /*return*/, sessions.map(function (session) { return ({
                                id: session.id,
                                userAgent: session.userAgent || 'Unknown',
                                ipAddress: session.ipAddress || 'Unknown',
                                lastActivity: session.lastActivity || new Date(),
                                createdAt: session.createdAt || new Date()
                            }); })];
                    case 2:
                        error_5 = _a.sent();
                        logger.error('Error getting user sessions', error_5);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clean up expired sessions
     */
    SessionService.prototype.cleanupExpiredSessions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var now, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        now = new Date();
                        // Delete expired sessions
                        return [4 /*yield*/, this.db.db
                                .delete(schema.sessions)
                                .where((0, drizzle_orm_1.lt)(schema.sessions.expiresAt, now))];
                    case 1:
                        // Delete expired sessions
                        _a.sent();
                        logger.info('Cleaned up expired sessions');
                        return [2 /*return*/, 0]; // D1 doesn't return count
                    case 2:
                        error_6 = _a.sent();
                        logger.error('Error cleaning up sessions', error_6);
                        return [2 /*return*/, 0];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clean up old sessions for a user (keep only most recent)
     */
    SessionService.prototype.cleanupUserSessions = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var sessions, sessionsToDelete, _i, sessionsToDelete_1, session, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, this.db.db
                                .select({ id: schema.sessions.id })
                                .from(schema.sessions)
                                .where((0, drizzle_orm_1.eq)(schema.sessions.userId, userId))
                                .orderBy((0, drizzle_orm_1.desc)(schema.sessions.lastActivity))
                                .all()];
                    case 1:
                        sessions = _a.sent();
                        if (!(sessions.length > SessionService.config.maxSessions)) return [3 /*break*/, 6];
                        sessionsToDelete = sessions.slice(SessionService.config.maxSessions);
                        _i = 0, sessionsToDelete_1 = sessionsToDelete;
                        _a.label = 2;
                    case 2:
                        if (!(_i < sessionsToDelete_1.length)) return [3 /*break*/, 5];
                        session = sessionsToDelete_1[_i];
                        return [4 /*yield*/, this.db.db
                                .delete(schema.sessions)
                                .where((0, drizzle_orm_1.eq)(schema.sessions.id, session.id))];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        logger.debug('Cleaned up old user sessions', {
                            userId: userId,
                            deleted: sessionsToDelete.length
                        });
                        _a.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_7 = _a.sent();
                        logger.error('Error cleaning up user sessions', error_7);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get user email (helper method)
     */
    SessionService.prototype.getUserEmail = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.db
                            .select({ email: schema.users.email })
                            .from(schema.users)
                            .where((0, drizzle_orm_1.eq)(schema.users.id, userId))
                            .get()];
                    case 1:
                        user = _a.sent();
                        return [2 /*return*/, (user === null || user === void 0 ? void 0 : user.email) || ''];
                }
            });
        });
    };
    /**
     * Get security status and recent events for a user
     */
    SessionService.prototype.getUserSecurityStatus = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var activeSessions, oneDayAgo, recentEvents, activeSessionCount, recentSecurityEvents, lastSecurityEvent, riskLevel, recommendations, hijackingEvents, error_8;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.db.db
                                .select({ count: schema.sessions.id })
                                .from(schema.sessions)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.sessions.userId, userId), (0, drizzle_orm_1.eq)(schema.sessions.isRevoked, false), (0, drizzle_orm_1.gt)(schema.sessions.expiresAt, new Date())))
                                .all()];
                    case 1:
                        activeSessions = _b.sent();
                        oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                        return [4 /*yield*/, this.db.db
                                .select({
                                createdAt: schema.auditLogs.createdAt,
                                action: schema.auditLogs.action
                            })
                                .from(schema.auditLogs)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.auditLogs.userId, userId), (0, drizzle_orm_1.eq)(schema.auditLogs.entityType, 'session'), (0, drizzle_orm_1.gt)(schema.auditLogs.createdAt, oneDayAgo)))
                                .orderBy((0, drizzle_orm_1.desc)(schema.auditLogs.createdAt))
                                .all()];
                    case 2:
                        recentEvents = _b.sent();
                        activeSessionCount = activeSessions.length;
                        recentSecurityEvents = recentEvents.length;
                        lastSecurityEvent = ((_a = recentEvents[0]) === null || _a === void 0 ? void 0 : _a.createdAt) || undefined;
                        riskLevel = 'low';
                        recommendations = [];
                        if (activeSessionCount > SessionService.config.maxConcurrentDevices) {
                            riskLevel = 'medium';
                            recommendations.push('Consider revoking old sessions - you have many active sessions');
                        }
                        if (recentSecurityEvents > 5) {
                            riskLevel = 'high';
                            recommendations.push('Multiple security events detected - review your account activity');
                        }
                        else if (recentSecurityEvents > 2) {
                            riskLevel = 'medium';
                            recommendations.push('Some suspicious activity detected - monitor your account');
                        }
                        hijackingEvents = recentEvents.filter(function (e) { return e.action === 'session_hijacking'; });
                        if (hijackingEvents.length > 0) {
                            riskLevel = 'high';
                            recommendations.push('Session hijacking attempts detected - change your password immediately');
                        }
                        if (recommendations.length === 0) {
                            recommendations.push('Your account security looks good');
                        }
                        return [2 /*return*/, {
                                activeSessions: activeSessionCount,
                                recentSecurityEvents: recentSecurityEvents,
                                lastSecurityEvent: lastSecurityEvent,
                                riskLevel: riskLevel,
                                recommendations: recommendations
                            }];
                    case 3:
                        error_8 = _b.sent();
                        logger.error('Error getting user security status', error_8);
                        return [2 /*return*/, {
                                activeSessions: 0,
                                recentSecurityEvents: 0,
                                riskLevel: 'low',
                                recommendations: ['Unable to assess security status']
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Revoke session by ID
     */
    SessionService.prototype.revokeSessionId = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.db.db
                                .update(schema.sessions)
                                .set({
                                isRevoked: true,
                                revokedAt: new Date(),
                                revokedReason: 'user_logout'
                            })
                                .where((0, drizzle_orm_1.eq)(schema.sessions.id, sessionId))];
                    case 1:
                        _a.sent();
                        logger.info('Session revoked by refresh token hash');
                        return [3 /*break*/, 3];
                    case 2:
                        error_9 = _a.sent();
                        logger.error('Error revoking session by refresh token hash', error_9);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Force logout all sessions except current (for security)
     */
    SessionService.prototype.forceLogoutAllOtherSessions = function (userId, currentSessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var result, deletedCount, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.db.db
                                .delete(schema.sessions)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.sessions.userId, userId), (0, drizzle_orm_1.ne)(schema.sessions.id, currentSessionId)))];
                    case 1:
                        result = _a.sent();
                        deletedCount = result.meta.changes || 0;
                        // Log security event
                        return [4 /*yield*/, this.logSecurityEvent(userId, currentSessionId, 'device_change', {
                                action: 'force_logout_other_sessions',
                                sessionsRevoked: deletedCount
                            })];
                    case 2:
                        // Log security event
                        _a.sent();
                        logger.info('Force logged out other sessions', { userId: userId, currentSessionId: currentSessionId, deletedCount: deletedCount });
                        return [2 /*return*/, deletedCount];
                    case 3:
                        error_10 = _a.sent();
                        logger.error('Error force logging out other sessions', error_10);
                        return [2 /*return*/, 0];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SessionService.config = {
        maxSessions: 5,
        sessionTTL: 3 * 24 * 60 * 60,
        cleanupInterval: 60 * 60, // 1 hour
        maxConcurrentDevices: 3, // Max 3 devices concurrently
    };
    return SessionService;
}(BaseService_1.BaseService));
exports.SessionService = SessionService;
