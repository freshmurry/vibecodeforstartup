"use strict";
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
exports.createApp = createApp;
var hono_1 = require("hono");
var cors_1 = require("hono/cors");
var secure_headers_1 = require("hono/secure-headers");
var security_1 = require("./config/security");
var rateLimits_1 = require("./services/rate-limit/rateLimits");
var routes_1 = require("./api/routes");
var CsrfService_1 = require("./services/csrf/CsrfService");
var errors_1 = require("../shared/types/errors");
var config_1 = require("./config");
var routeAuth_1 = require("./middleware/auth/routeAuth");
var sentry_1 = require("./observability/sentry");
function createApp(env) {
    var _this = this;
    var app = new hono_1.Hono();
    // Observability: Sentry error reporting & context
    (0, sentry_1.initHonoSentry)(app);
    // Apply global security middlewares (skip for WebSocket upgrades)
    app.use('*', function (c, next) { return __awaiter(_this, void 0, void 0, function () {
        var upgradeHeader;
        return __generator(this, function (_a) {
            upgradeHeader = c.req.header('upgrade');
            if ((upgradeHeader === null || upgradeHeader === void 0 ? void 0 : upgradeHeader.toLowerCase()) === 'websocket') {
                return [2 /*return*/, next()];
            }
            // Apply secure headers
            return [2 /*return*/, (0, secure_headers_1.secureHeaders)((0, security_1.getSecureHeadersConfig)(env))(c, next)];
        });
    }); });
    // CORS configuration
    app.use('/api/*', (0, cors_1.cors)((0, security_1.getCORSConfig)(env)));
    // CSRF protection using double-submit cookie pattern with proper GET handling
    app.use('*', function (c, next) { return __awaiter(_this, void 0, void 0, function () {
        var method, upgradeHeader, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    method = c.req.method.toUpperCase();
                    upgradeHeader = c.req.header('upgrade');
                    if ((upgradeHeader === null || upgradeHeader === void 0 ? void 0 : upgradeHeader.toLowerCase()) === 'websocket') {
                        return [2 /*return*/, next()];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, , 9]);
                    if (!(method === 'GET' || method === 'HEAD' || method === 'OPTIONS')) return [3 /*break*/, 5];
                    return [4 /*yield*/, next()];
                case 2:
                    _a.sent();
                    if (!(c.req.url.startsWith('/api/') && c.res.status < 400)) return [3 /*break*/, 4];
                    return [4 /*yield*/, CsrfService_1.CsrfService.enforce(c.req.raw, c.env, c.res)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
                case 5: 
                // Validate CSRF token for state-changing requests
                return [4 /*yield*/, CsrfService_1.CsrfService.enforce(c.req.raw, c.env, undefined)];
                case 6:
                    // Validate CSRF token for state-changing requests
                    _a.sent();
                    return [4 /*yield*/, next()];
                case 7:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 8:
                    error_1 = _a.sent();
                    if (error_1 instanceof errors_1.SecurityError && error_1.type === errors_1.SecurityErrorType.CSRF_VIOLATION) {
                        return [2 /*return*/, new Response(JSON.stringify({
                                error: 'CSRF validation failed',
                                code: 'CSRF_VIOLATION'
                            }), {
                                status: 403,
                                headers: { 'Content-Type': 'application/json' }
                            })];
                    }
                    throw error_1;
                case 9: return [2 /*return*/];
            }
        });
    }); });
    app.use('/api/*', function (c, next) { return __awaiter(_this, void 0, void 0, function () {
        var config;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, config_1.getGlobalConfigurableSettings)(env)];
                case 1:
                    config = _a.sent();
                    c.set('config', config);
                    // Apply global rate limit middleware. Should this be moved after setupRoutes so that maybe 'user' is available?
                    return [4 /*yield*/, rateLimits_1.RateLimitService.enforceGlobalApiRateLimit(env, c.get('config').security.rateLimit, null, c.req.raw)];
                case 2:
                    // Apply global rate limit middleware. Should this be moved after setupRoutes so that maybe 'user' is available?
                    _a.sent();
                    return [4 /*yield*/, next()];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // By default, all routes require authentication
    app.use('/api/*', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.ownerOnly));
    // Now setup all the routes
    (0, routes_1.setupRoutes)(app);
    // Add not found route to redirect to ASSETS
    app.notFound(function (c) {
        return c.env.ASSETS.fetch(c.req.raw);
    });
    return app;
}
