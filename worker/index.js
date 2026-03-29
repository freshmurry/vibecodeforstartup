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
exports.DORateLimitStore = exports.CodeGeneratorAgent = exports.DeployerService = exports.UserAppSandboxService = void 0;
var logger_1 = require("./logger");
var smartGeneratorAgent_1 = require("./agents/core/smartGeneratorAgent");
var sandbox_1 = require("@cloudflare/sandbox");
var dispatcherUtils_1 = require("./utils/dispatcherUtils");
var app_1 = require("./app");
var Sentry = require("@sentry/cloudflare");
var sentry_1 = require("./observability/sentry");
var DORateLimitStore_1 = require("./services/rate-limit/DORateLimitStore");
var urls_1 = require("./utils/urls");
// Durable Object and Service exports
var sandboxSdkClient_1 = require("./services/sandbox/sandboxSdkClient");
Object.defineProperty(exports, "UserAppSandboxService", { enumerable: true, get: function () { return sandboxSdkClient_1.UserAppSandboxService; } });
Object.defineProperty(exports, "DeployerService", { enumerable: true, get: function () { return sandboxSdkClient_1.DeployerService; } });
exports.CodeGeneratorAgent = Sentry.instrumentDurableObjectWithSentry(sentry_1.sentryOptions, smartGeneratorAgent_1.SmartCodeGeneratorAgent);
exports.DORateLimitStore = Sentry.instrumentDurableObjectWithSentry(sentry_1.sentryOptions, DORateLimitStore_1.DORateLimitStore);
// Logger for the main application and handlers
var logger = (0, logger_1.createLogger)('App');
/**
 * Handles requests for user-deployed applications on subdomains.
 * It first attempts to proxy to a live development sandbox. If that fails,
 * it dispatches the request to a permanently deployed worker via namespaces.
 * This function will NOT fall back to the main worker.
 *
 * @param request The incoming Request object.
 * @param env The environment bindings.
 * @returns A Response object from the sandbox, the dispatched worker, or an error.
 */
function handleUserAppRequest(request, env) {
    return __awaiter(this, void 0, void 0, function () {
        var url, hostname, sandboxResponse, appName, dispatcher, worker_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = new URL(request.url);
                    hostname = url.hostname;
                    logger.info("Handling user app request for: ".concat(hostname));
                    return [4 /*yield*/, (0, sandbox_1.proxyToSandbox)(request, env)];
                case 1:
                    sandboxResponse = _a.sent();
                    if (sandboxResponse) {
                        logger.info("Serving response from sandbox for: ".concat(hostname));
                        return [2 /*return*/, sandboxResponse];
                    }
                    // 2. If sandbox misses, attempt to dispatch to a deployed worker.
                    logger.info("Sandbox miss for ".concat(hostname, ", attempting dispatch to permanent worker."));
                    if (!(0, dispatcherUtils_1.isDispatcherAvailable)(env)) {
                        logger.warn("Dispatcher not available, cannot serve: ".concat(hostname));
                        return [2 /*return*/, new Response('This application is not currently available.', { status: 404 })];
                    }
                    appName = hostname.split('.')[0];
                    dispatcher = env['DISPATCHER'];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    worker_1 = dispatcher.get(appName);
                    return [4 /*yield*/, worker_1.fetch(request)];
                case 3: return [2 /*return*/, _a.sent()];
                case 4:
                    error_1 = _a.sent();
                    // This block catches errors if the binding doesn't exist or if worker.fetch() fails.
                    logger.warn("Error dispatching to worker '".concat(appName, "': ").concat(error_1.message));
                    return [2 /*return*/, new Response('An error occurred while loading this application.', { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Main Worker fetch handler with robust, secure routing.
 */
var worker = {
    fetch: function (request, env, ctx) {
        return __awaiter(this, void 0, void 0, function () {
            var previewDomain, url, hostname, pathname, ipRegex, isMainDomainRequest, isSubdomainRequest, app;
            return __generator(this, function (_a) {
                previewDomain = (0, urls_1.getPreviewDomain)(env);
                if (!previewDomain || previewDomain.trim() === '') {
                    console.error('FATAL: env.CUSTOM_DOMAIN is not configured in wrangler.toml or the Cloudflare dashboard.');
                    return [2 /*return*/, new Response('Server configuration error: Application domain is not set.', { status: 500 })];
                }
                url = new URL(request.url);
                hostname = url.hostname, pathname = url.pathname;
                ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
                if (ipRegex.test(hostname)) {
                    return [2 /*return*/, new Response('Access denied. Please use the assigned domain name.', { status: 403 })];
                }
                isMainDomainRequest = hostname === env.CUSTOM_DOMAIN ||
                    hostname === 'localhost' ||
                    hostname.endsWith('.workers.dev');
                isSubdomainRequest = hostname.endsWith(".".concat(previewDomain)) ||
                    (hostname.endsWith('.localhost') && hostname !== 'localhost');
                // Route 1: Main Platform Request (e.g., build.cloudflare.dev or localhost)
                if (isMainDomainRequest) {
                    if (pathname.startsWith('/api/')) {
                        logger.info("Handling API request for: ".concat(url));
                        app = (0, app_1.createApp)(env);
                        return [2 /*return*/, app.fetch(request, env, ctx)];
                    }
                    // Let Cloudflare handle static assets automatically
                    return [2 /*return*/, new Response('Not Found', { status: 404 })];
                }
                // Route 2: User App Request (e.g., xyz.build.cloudflare.dev or test.localhost)
                if (isSubdomainRequest) {
                    return [2 /*return*/, handleUserAppRequest(request, env)];
                }
                return [2 /*return*/, new Response('Not Found', { status: 404 })];
            });
        });
    },
};
// Wrap the entire worker with Sentry for comprehensive error monitoring.
exports.default = Sentry.withSentry(sentry_1.sentryOptions, worker);
