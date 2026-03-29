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
exports.SentryTunnelController = void 0;
var baseController_1 = require("../baseController");
/**
 * Sentry Tunnel Controller
 * Proxies Sentry events from frontend to bypass ad blockers
 * Implements https://docs.sentry.io/platforms/javascript/troubleshooting/#dealing-with-ad-blockers
 */
var SentryTunnelController = /** @class */ (function (_super) {
    __extends(SentryTunnelController, _super);
    function SentryTunnelController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Tunnel endpoint for Sentry events from the frontend.
     * POST /api/sentry/tunnel
     *
     * This endpoint:
     * 1. Receives Sentry envelopes from the frontend
     * 2. Validates they're for our configured DSN
     * 3. Forwards them to Sentry with proper auth headers
     */
    SentryTunnelController.tunnel = function (request, env, _ctx, _routeContext) {
        return __awaiter(this, void 0, void 0, function () {
            var envelope, pieces, header, dsn, dsnUrl, projectId, sentryHost, sentryUrl, headers, sentryResponse, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        // Check if Sentry is configured
                        if (!env.SENTRY_DSN) {
                            return [2 /*return*/, SentryTunnelController.createErrorResponse('Sentry not configured', 503)];
                        }
                        return [4 /*yield*/, request.text()];
                    case 1:
                        envelope = _a.sent();
                        if (!envelope) {
                            return [2 /*return*/, SentryTunnelController.createErrorResponse('Empty envelope', 400)];
                        }
                        pieces = envelope.split('\n');
                        if (pieces.length < 2) {
                            return [2 /*return*/, SentryTunnelController.createErrorResponse('Invalid envelope format', 400)];
                        }
                        header = JSON.parse(pieces[0]);
                        dsn = header.dsn;
                        // Security: Validate the DSN matches our configured one
                        if (!dsn || dsn !== env.SENTRY_DSN) {
                            return [2 /*return*/, SentryTunnelController.createErrorResponse('Invalid DSN', 403)];
                        }
                        dsnUrl = new URL(env.SENTRY_DSN);
                        projectId = dsnUrl.pathname.replace('/', '');
                        sentryHost = dsnUrl.hostname;
                        sentryUrl = "https://".concat(sentryHost, "/api/").concat(projectId, "/envelope/");
                        headers = {
                            'Content-Type': 'application/x-sentry-envelope',
                        };
                        // Add CF Access headers if configured (matching backend Sentry config)
                        if (env.CF_ACCESS_ID && env.CF_ACCESS_SECRET) {
                            headers['CF-Access-Client-Id'] = env.CF_ACCESS_ID;
                            headers['CF-Access-Client-Secret'] = env.CF_ACCESS_SECRET;
                        }
                        return [4 /*yield*/, fetch(sentryUrl, {
                                method: 'POST',
                                body: envelope,
                                headers: headers,
                            })];
                    case 2:
                        sentryResponse = _a.sent();
                        // Return Sentry's response
                        return [2 /*return*/, new Response(sentryResponse.body, {
                                status: sentryResponse.status,
                                headers: {
                                    'Content-Type': sentryResponse.headers.get('Content-Type') || 'text/plain',
                                },
                            })];
                    case 3:
                        error_1 = _a.sent();
                        // Log error but return success to not block the frontend
                        // Sentry SDKs expect 200 OK even on tunnel errors
                        this.logger.error('Sentry tunnel error', error_1);
                        return [2 /*return*/, new Response('ok', { status: 200 })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return SentryTunnelController;
}(baseController_1.BaseController));
exports.SentryTunnelController = SentryTunnelController;
