"use strict";
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
exports.JWTUtils = void 0;
var jose_1 = require("jose");
var errors_1 = require("../../shared/types/errors");
var logger_1 = require("../logger");
var SessionService_1 = require("../database/services/SessionService");
var logger = (0, logger_1.createLogger)('JWTUtils');
var JWTUtils = /** @class */ (function () {
    function JWTUtils(jwtSecret) {
        this.algorithm = 'HS256';
        // this.validateJWTSecret(jwtSecret);
        // No need to validate jwt secrets for others 
        // as everyone else would 1 click deploy. And we would use secure secrets for our deployment anyways.
        this.jwtSecret = new TextEncoder().encode(jwtSecret);
    }
    JWTUtils.getInstance = function (env) {
        if (!env.JWT_SECRET) {
            throw new Error('JWT_SECRET not configured');
        }
        if (!JWTUtils.instance) {
            JWTUtils.instance = new JWTUtils(env.JWT_SECRET);
        }
        return JWTUtils.instance;
    };
    // private validateJWTSecret(secret: string): void {
    //     if (secret.length < 32) {
    //         throw new Error('JWT_SECRET must be at least 32 characters long for security');
    //     }
    //     const weakSecrets = ['default', 'secret', 'password', 'changeme', 'admin', 'test'];
    //     if (weakSecrets.includes(secret.toLowerCase())) {
    //         throw new Error('JWT_SECRET contains a weak/default value. Please use a cryptographically secure random string');
    //     }
    //     const hasLowercase = /[a-z]/.test(secret);
    //     const hasUppercase = /[A-Z]/.test(secret);
    //     const hasNumbers = /[0-9]/.test(secret);
    //     const hasSpecial = /[^a-zA-Z0-9]/.test(secret);
    //     const characterTypes = [hasLowercase, hasUppercase, hasNumbers, hasSpecial].filter(Boolean).length;
    //     if (characterTypes < 3) {
    //         throw new Error('JWT_SECRET must contain at least 3 different character types');
    //     }
    //     const hasRepeatingChars = /(.)\1{3,}/.test(secret);
    //     if (hasRepeatingChars) {
    //         throw new Error('JWT_SECRET contains repetitive patterns');
    //     }
    // }
    JWTUtils.prototype.createToken = function (payload_1) {
        return __awaiter(this, arguments, void 0, function (payload, expiresIn) {
            var now, jwt, error_1;
            if (expiresIn === void 0) { expiresIn = 24 * 3600; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        now = Math.floor(Date.now() / 1000);
                        jwt = new jose_1.SignJWT(__assign(__assign({}, payload), { iat: now, exp: now + expiresIn }))
                            .setProtectedHeader({ alg: this.algorithm })
                            .setIssuedAt(now)
                            .setExpirationTime(now + expiresIn);
                        return [4 /*yield*/, jwt.sign(this.jwtSecret)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_1 = _a.sent();
                        logger.error('Error creating token', error_1);
                        throw new errors_1.SecurityError(errors_1.SecurityErrorType.INVALID_TOKEN, 'Failed to create token', 500);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    JWTUtils.prototype.verifyToken = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var payload, now, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, jose_1.jwtVerify)(token, this.jwtSecret)];
                    case 1:
                        payload = (_a.sent()).payload;
                        now = Math.floor(Date.now() / 1000);
                        if (payload.exp && payload.exp < now) {
                            return [2 /*return*/, null];
                        }
                        if (!payload.sub || !payload.email || !payload.type || !payload.exp || !payload.iat) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, {
                                sub: payload.sub,
                                email: payload.email,
                                type: payload.type,
                                exp: payload.exp,
                                iat: payload.iat,
                                jti: payload.jti,
                                sessionId: payload.sessionId
                            }];
                    case 2:
                        error_2 = _a.sent();
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    JWTUtils.prototype.createAccessToken = function (userId, email, sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var accessTokenExpiry, payload, accessToken;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        accessTokenExpiry = SessionService_1.SessionService.config.sessionTTL;
                        payload = { sub: userId, email: email, sessionId: sessionId };
                        return [4 /*yield*/, this.createToken(__assign(__assign({}, payload), { type: 'access' }), accessTokenExpiry)];
                    case 1:
                        accessToken = _a.sent();
                        return [2 /*return*/, { accessToken: accessToken, expiresIn: accessTokenExpiry }];
                }
            });
        });
    };
    JWTUtils.prototype.hashToken = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var encoder, data, hash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        encoder = new TextEncoder();
                        data = encoder.encode(token);
                        return [4 /*yield*/, crypto.subtle.digest('SHA-256', data)];
                    case 1:
                        hash = _a.sent();
                        return [2 /*return*/, btoa(String.fromCharCode.apply(String, new Uint8Array(hash)))];
                }
            });
        });
    };
    JWTUtils.instance = null;
    return JWTUtils;
}());
exports.JWTUtils = JWTUtils;
