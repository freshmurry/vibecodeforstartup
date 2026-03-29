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
exports.CodingAgentController = void 0;
var constants_1 = require("../../../agents/constants");
var baseController_1 = require("../baseController");
var idGenerator_1 = require("../../../utils/idGenerator");
var agents_1 = require("../../../agents");
var database_1 = require("../../../database");
var rateLimits_1 = require("../../../services/rate-limit/rateLimits");
var websocket_1 = require("../../../middleware/security/websocket");
var logger_1 = require("../../../logger");
var urls_1 = require("../../../utils/urls");
var defaultCodeGenArgs = {
    query: '',
    language: 'typescript',
    frameworks: ['react', 'vite'],
    selectedTemplate: 'auto',
    agentMode: 'deterministic',
};
/**
 * CodingAgentController to handle all code generation related endpoints
 */
var CodingAgentController = /** @class */ (function (_super) {
    __extends(CodingAgentController, _super);
    function CodingAgentController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Start the incremental code generation process
     */
    CodingAgentController.startCodeGeneration = function (request, env, _, context) {
        return __awaiter(this, void 0, void 0, function () {
            var url, hostname, body, error_1, query, _a, readable, writable, writer_1, user, error_2, agentId_1, modelConfigService, _b, userConfigsRecord, agentInstance, userModelConfigs, _i, _c, _d, actionKey, mergedConfig, modelConfig, inferenceContext, _e, sandboxSessionId, templateDetails, selection, websocketUrl, httpStatusUrl, agentPromise, error_3;
            var _this = this;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 11, , 12]);
                        this.logger.info('Starting code generation process');
                        url = new URL(request.url);
                        hostname = url.hostname === 'localhost' ? "localhost:".concat(url.port) : (0, urls_1.getPreviewDomain)(env);
                        body = void 0;
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, request.json()];
                    case 2:
                        body = (_f.sent());
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _f.sent();
                        return [2 /*return*/, CodingAgentController.createErrorResponse("Invalid JSON in request body: ".concat(JSON.stringify(error_1, null, 2)), 400)];
                    case 4:
                        query = body.query;
                        if (!query) {
                            return [2 /*return*/, CodingAgentController.createErrorResponse('Missing "query" field in request body', 400)];
                        }
                        _a = new TransformStream({
                            transform: function (chunk, controller) {
                                if (chunk === "terminate") {
                                    controller.terminate();
                                }
                                else {
                                    var encoded = new TextEncoder().encode(JSON.stringify(chunk) + '\n');
                                    controller.enqueue(encoded);
                                }
                            }
                        }), readable = _a.readable, writable = _a.writable;
                        writer_1 = writable.getWriter();
                        user = context.user;
                        _f.label = 5;
                    case 5:
                        _f.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, rateLimits_1.RateLimitService.enforceAppCreationRateLimit(env, context.config.security.rateLimit, user, request)];
                    case 6:
                        _f.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        error_2 = _f.sent();
                        if (error_2 instanceof Error) {
                            return [2 /*return*/, CodingAgentController.createErrorResponse(error_2, 429)];
                        }
                        else {
                            this.logger.error('Unknown error in enforceAppCreationRateLimit', error_2);
                            return [2 /*return*/, CodingAgentController.createErrorResponse(JSON.stringify(error_2), 429)];
                        }
                        return [3 /*break*/, 8];
                    case 8:
                        agentId_1 = (0, idGenerator_1.generateId)();
                        modelConfigService = new database_1.ModelConfigService(env);
                        return [4 /*yield*/, Promise.all([
                                modelConfigService.getUserModelConfigs(user.id),
                                (0, agents_1.getAgentStub)(env, agentId_1, false, this.logger)
                            ])];
                    case 9:
                        _b = _f.sent(), userConfigsRecord = _b[0], agentInstance = _b[1];
                        userModelConfigs = new Map();
                        for (_i = 0, _c = Object.entries(userConfigsRecord); _i < _c.length; _i++) {
                            _d = _c[_i], actionKey = _d[0], mergedConfig = _d[1];
                            if (mergedConfig.isUserOverride) {
                                modelConfig = {
                                    name: mergedConfig.name,
                                    max_tokens: mergedConfig.max_tokens,
                                    temperature: mergedConfig.temperature,
                                    reasoning_effort: mergedConfig.reasoning_effort,
                                    fallbackModel: mergedConfig.fallbackModel
                                };
                                userModelConfigs.set(actionKey, modelConfig);
                            }
                        }
                        inferenceContext = {
                            userModelConfigs: Object.fromEntries(userModelConfigs),
                            agentId: agentId_1,
                            userId: user.id,
                            enableRealtimeCodeFix: true, // For now disabled from the model configs itself
                        };
                        this.logger.info("Initialized inference context for user ".concat(user.id), {
                            modelConfigsCount: Object.keys(userModelConfigs).length,
                        });
                        return [4 /*yield*/, (0, agents_1.getTemplateForQuery)(env, inferenceContext, query, hostname, this.logger)];
                    case 10:
                        _e = _f.sent(), sandboxSessionId = _e.sandboxSessionId, templateDetails = _e.templateDetails, selection = _e.selection;
                        websocketUrl = "".concat(url.protocol === 'https:' ? 'wss:' : 'ws:', "//").concat(url.host, "/api/agent/").concat(agentId_1, "/ws");
                        httpStatusUrl = "".concat(url.origin, "/api/agent/").concat(agentId_1);
                        writer_1.write({
                            message: 'Code generation started',
                            agentId: agentId_1,
                            websocketUrl: websocketUrl,
                            httpStatusUrl: httpStatusUrl,
                            template: {
                                name: templateDetails.name,
                                files: templateDetails.files,
                            }
                        });
                        agentPromise = agentInstance.initialize({
                            query: query,
                            language: body.language || defaultCodeGenArgs.language,
                            frameworks: body.frameworks || defaultCodeGenArgs.frameworks,
                            hostname: hostname,
                            inferenceContext: inferenceContext,
                            onBlueprintChunk: function (chunk) {
                                writer_1.write({ chunk: chunk });
                            },
                            templateInfo: { templateDetails: templateDetails, selection: selection },
                            sandboxSessionId: sandboxSessionId
                        }, body.agentMode || defaultCodeGenArgs.agentMode);
                        agentPromise.then(function (_state) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                writer_1.write("terminate");
                                writer_1.close();
                                this.logger.info("Agent ".concat(agentId_1, " terminated successfully"));
                                return [2 /*return*/];
                            });
                        }); });
                        this.logger.info("Agent ".concat(agentId_1, " init launched successfully"));
                        return [2 /*return*/, new Response(readable, {
                                status: 200,
                                headers: {
                                    // Use SSE content-type to ensure Cloudflare disables buffering,
                                    // while the payload remains NDJSON lines consumed by the client.
                                    'Content-Type': 'text/event-stream; charset=utf-8',
                                    // Prevent intermediary caches/proxies from buffering or transforming
                                    'Cache-Control': 'no-cache, no-store, must-revalidate, no-transform',
                                    'Pragma': 'no-cache',
                                    'Connection': 'keep-alive'
                                }
                            })];
                    case 11:
                        error_3 = _f.sent();
                        this.logger.error('Error starting code generation', error_3);
                        return [2 /*return*/, CodingAgentController.handleError(error_3, 'start code generation')];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle WebSocket connections for code generation
     * This routes the WebSocket connection directly to the Agent
     */
    CodingAgentController.handleWebSocketConnection = function (request, env, _, context) {
        return __awaiter(this, void 0, void 0, function () {
            var chatId, user, headers_1, agentInstance, error_4, _a, client, server, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        chatId = context.pathParams.agentId;
                        if (!chatId) {
                            return [2 /*return*/, CodingAgentController.createErrorResponse('Missing agent ID parameter', 400)];
                        }
                        // Ensure the request is a WebSocket upgrade request
                        if (request.headers.get('Upgrade') !== 'websocket') {
                            return [2 /*return*/, new Response('Expected WebSocket upgrade', { status: 426 })];
                        }
                        // Validate WebSocket origin
                        if (!(0, websocket_1.validateWebSocketOrigin)(request, env)) {
                            return [2 /*return*/, new Response('Forbidden: Invalid origin', { status: 403 })];
                        }
                        user = context.user;
                        if (!user) {
                            return [2 /*return*/, CodingAgentController.createErrorResponse('Missing user', 401)];
                        }
                        this.logger.info("WebSocket connection request for chat: ".concat(chatId));
                        headers_1 = {};
                        request.headers.forEach(function (value, key) {
                            headers_1[key] = value;
                        });
                        this.logger.info('WebSocket request details', {
                            headers: headers_1,
                            url: request.url,
                            chatId: chatId
                        });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, agents_1.getAgentStub)(env, chatId, true, this.logger)];
                    case 2:
                        agentInstance = _b.sent();
                        this.logger.info("Successfully got agent instance for chat: ".concat(chatId));
                        // Let the agent handle the WebSocket connection directly
                        return [2 /*return*/, agentInstance.fetch(request)];
                    case 3:
                        error_4 = _b.sent();
                        this.logger.error("Failed to get agent instance with ID ".concat(chatId, ":"), error_4);
                        _a = new WebSocketPair(), client = _a[0], server = _a[1];
                        server.accept();
                        server.send(JSON.stringify({
                            type: constants_1.WebSocketMessageResponses.ERROR,
                            error: "Failed to get agent instance: ".concat(error_4 instanceof Error ? error_4.message : String(error_4))
                        }));
                        server.close(1011, 'Agent instance not found');
                        return [2 /*return*/, new Response(null, {
                                status: 101,
                                webSocket: client
                            })];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_5 = _b.sent();
                        this.logger.error('Error handling WebSocket connection', error_5);
                        return [2 /*return*/, CodingAgentController.handleError(error_5, 'handle WebSocket connection')];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Connect to an existing agent instance
     * Returns connection information for an already created agent
     */
    CodingAgentController.connectToExistingAgent = function (request, env, _, context) {
        return __awaiter(this, void 0, void 0, function () {
            var agentId, agentInstance, _a, url, websocketUrl, responseData, error_6, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        agentId = context.pathParams.agentId;
                        if (!agentId) {
                            return [2 /*return*/, CodingAgentController.createErrorResponse('Missing agent ID parameter', 400)];
                        }
                        this.logger.info("Connecting to existing agent: ".concat(agentId));
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, (0, agents_1.getAgentStub)(env, agentId, true, this.logger)];
                    case 2:
                        agentInstance = _b.sent();
                        _a = !agentInstance;
                        if (_a) return [3 /*break*/, 4];
                        return [4 /*yield*/, agentInstance.isInitialized()];
                    case 3:
                        _a = !(_b.sent());
                        _b.label = 4;
                    case 4:
                        if (_a) {
                            return [2 /*return*/, CodingAgentController.createErrorResponse('Agent instance not found or not initialized', 404)];
                        }
                        this.logger.info("Successfully connected to existing agent: ".concat(agentId));
                        url = new URL(request.url);
                        websocketUrl = "".concat(url.protocol === 'https:' ? 'wss:' : 'ws:', "//").concat(url.host, "/api/agent/").concat(agentId, "/ws");
                        responseData = {
                            websocketUrl: websocketUrl,
                            agentId: agentId,
                        };
                        return [2 /*return*/, CodingAgentController.createSuccessResponse(responseData)];
                    case 5:
                        error_6 = _b.sent();
                        this.logger.error("Failed to connect to agent ".concat(agentId, ":"), error_6);
                        return [2 /*return*/, CodingAgentController.createErrorResponse("Agent instance not found or unavailable: ".concat(error_6 instanceof Error ? error_6.message : String(error_6)), 404)];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_7 = _b.sent();
                        this.logger.error('Error connecting to existing agent', error_7);
                        return [2 /*return*/, CodingAgentController.handleError(error_7, 'connect to existing agent')];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    CodingAgentController.deployPreview = function (_request, env, _, context) {
        return __awaiter(this, void 0, void 0, function () {
            var agentId, agentInstance, preview, error_8, error_9, appError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        agentId = context.pathParams.agentId;
                        if (!agentId) {
                            return [2 /*return*/, CodingAgentController.createErrorResponse('Missing agent ID parameter', 400)];
                        }
                        this.logger.info("Deploying preview for agent: ".concat(agentId));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, (0, agents_1.getAgentStub)(env, agentId, true, this.logger)];
                    case 2:
                        agentInstance = _a.sent();
                        return [4 /*yield*/, agentInstance.deployToSandbox()];
                    case 3:
                        preview = _a.sent();
                        if (!preview) {
                            return [2 /*return*/, CodingAgentController.createErrorResponse('Failed to deploy preview', 500)];
                        }
                        this.logger.info('Preview deployed successfully', {
                            agentId: agentId,
                            previewUrl: preview.previewURL
                        });
                        return [2 /*return*/, CodingAgentController.createSuccessResponse(preview)];
                    case 4:
                        error_8 = _a.sent();
                        this.logger.error('Failed to deploy preview', { agentId: agentId, error: error_8 });
                        return [2 /*return*/, CodingAgentController.createErrorResponse('Failed to deploy preview', 500)];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_9 = _a.sent();
                        this.logger.error('Error deploying preview', error_9);
                        appError = CodingAgentController.handleError(error_9, 'deploy preview');
                        return [2 /*return*/, appError];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    CodingAgentController.logger = (0, logger_1.createLogger)('CodingAgentController');
    return CodingAgentController;
}(baseController_1.BaseController));
exports.CodingAgentController = CodingAgentController;
