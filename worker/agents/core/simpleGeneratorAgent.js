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
exports.SimpleCodeGeneratorAgent = void 0;
var agents_1 = require("agents");
var state_1 = require("./state");
var constants_1 = require("../constants");
var websocket_1 = require("./websocket");
var logger_1 = require("../../logger");
var projectsetup_1 = require("../assistants/projectsetup");
var UserConversationProcessor_1 = require("../operations/UserConversationProcessor");
var FileManager_1 = require("../services/implementations/FileManager");
var StateManager_1 = require("../services/implementations/StateManager");
// import { WebSocketBroadcaster } from '../services/implementations/WebSocketBroadcaster';
var GenerationContext_1 = require("../domain/values/GenerationContext");
var IssueReport_1 = require("../domain/values/IssueReport");
var PhaseImplementation_1 = require("../operations/PhaseImplementation");
var CodeReview_1 = require("../operations/CodeReview");
var FileRegeneration_1 = require("../operations/FileRegeneration");
var PhaseGeneration_1 = require("../operations/PhaseGeneration");
var ScreenshotAnalysis_1 = require("../operations/ScreenshotAnalysis");
var factory_1 = require("../../services/sandbox/factory");
var config_1 = require("../inferutils/config");
var ModelConfigService_1 = require("../../database/services/ModelConfigService");
var code_fixer_1 = require("../../services/code-fixer");
var FastCodeFixer_1 = require("../operations/FastCodeFixer");
var urls_1 = require("../../utils/urls");
var common_1 = require("../utils/common");
var blueprint_1 = require("../planning/blueprint");
var deployToCf_1 = require("../../utils/deployToCf");
var database_1 = require("../../database");
var errors_1 = require("../../../shared/types/errors");
var idGenerator_1 = require("../../utils/idGenerator");
/**
 * SimpleCodeGeneratorAgent - Deterministically orhestrated AI-powered code generation
 *
 * Manages the lifecycle of code generation including:
 * - Blueprint-based phase generation
 * - Real-time file streaming with WebSocket updates
 * - Code validation and error correction
 * - Deployment to sandbox service
 * - Review cycles with automated fixes
 */
var SimpleCodeGeneratorAgent = /** @class */ (function (_super) {
    __extends(SimpleCodeGeneratorAgent, _super);
    function SimpleCodeGeneratorAgent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.fileManager = new FileManager_1.FileManager(new StateManager_1.StateManager(function () { return _this.state; }, function (s) { return _this.setState(s); }));
        _this.previewUrlCache = '';
        _this.operations = {
            codeReview: new CodeReview_1.CodeReviewOperation(),
            regenerateFile: new FileRegeneration_1.FileRegenerationOperation(),
            generateNextPhase: new PhaseGeneration_1.PhaseGenerationOperation(),
            analyzeScreenshot: new ScreenshotAnalysis_1.ScreenshotAnalysisOperation(),
            implementPhase: new PhaseImplementation_1.PhaseImplementationOperation(),
            fastCodeFixer: new FastCodeFixer_1.FastCodeFixerOperation(),
            processUserMessage: new UserConversationProcessor_1.UserConversationProcessor()
        };
        _this.isGenerating = false;
        // Deployment queue management to prevent concurrent deployments
        _this.currentDeploymentPromise = null;
        _this.initialState = {
            blueprint: {},
            query: "",
            generatedPhases: [],
            generatedFilesMap: {},
            agentMode: 'deterministic',
            generationPromise: undefined,
            sandboxInstanceId: undefined,
            templateDetails: {},
            commandsHistory: [],
            lastPackageJson: '',
            clientReportedErrors: [],
            // latestScreenshot: undefined,
            pendingUserInputs: [],
            inferenceContext: {},
            // conversationalAssistant: new ConversationalAssistant(this.env),
            sessionId: '',
            hostname: '',
            conversationMessages: [],
            currentDevState: state_1.CurrentDevState.IDLE,
            phasesCounter: state_1.MAX_PHASES,
            mvpGenerated: false,
            shouldBeGenerating: false
        };
        return _this;
    }
    SimpleCodeGeneratorAgent.prototype.logger = function () {
        if (!this._logger) {
            this._logger = (0, logger_1.createObjectLogger)(this, 'CodeGeneratorAgent');
            this._logger.setObjectId(this.getAgentId());
            this._logger.setFields({
                sessionId: this.state.sessionId,
                agentId: this.getAgentId(),
                userId: this.state.inferenceContext.userId,
            });
        }
        return this._logger;
    };
    SimpleCodeGeneratorAgent.prototype.getAgentId = function () {
        return this.state.inferenceContext.agentId;
    };
    // ===============================
    // Screenshot storage helpers
    // ===============================
    SimpleCodeGeneratorAgent.prototype.base64ToUint8Array = function (base64) {
        var binary = atob(base64);
        var bytes = new Uint8Array(binary.length);
        for (var i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    };
    SimpleCodeGeneratorAgent.prototype.uploadScreenshotToCloudflareImages = function (base64, filename) {
        return __awaiter(this, void 0, void 0, function () {
            var accountId, url, bytes, blob, form, maybeImages, imagesBinding, resp, json, errMsg, variants;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        accountId = this.env.CLOUDFLARE_ACCOUNT_ID;
                        if (!accountId) {
                            throw new Error('Cloudflare account ID not configured');
                        }
                        url = "https://api.cloudflare.com/client/v4/accounts/".concat(accountId, "/images/v1");
                        bytes = this.base64ToUint8Array(base64);
                        blob = new Blob([bytes], { type: 'image/png' });
                        form = new FormData();
                        form.append('file', blob, filename);
                        maybeImages = this.env['IMAGES'];
                        imagesBinding = (typeof maybeImages === 'object' && maybeImages !== null &&
                            'fetch' in maybeImages &&
                            typeof maybeImages.fetch === 'function') ? maybeImages : null;
                        if (!imagesBinding) return [3 /*break*/, 2];
                        return [4 /*yield*/, imagesBinding.fetch(url, { method: 'POST', body: form })];
                    case 1:
                        // Use Images service binding when available (no explicit token needed)
                        resp = _b.sent();
                        return [3 /*break*/, 5];
                    case 2:
                        if (!this.env.CLOUDFLARE_API_TOKEN) return [3 /*break*/, 4];
                        return [4 /*yield*/, fetch(url, {
                                method: 'POST',
                                headers: { 'Authorization': "Bearer ".concat(this.env.CLOUDFLARE_API_TOKEN) },
                                body: form,
                            })];
                    case 3:
                        // Fallback to direct API with token
                        resp = _b.sent();
                        return [3 /*break*/, 5];
                    case 4: throw new Error('Cloudflare Images not available: missing IMAGES binding and CLOUDFLARE_API_TOKEN');
                    case 5: return [4 /*yield*/, resp.json()];
                    case 6:
                        json = _b.sent();
                        if (!resp.ok || !json.success || !json.result) {
                            errMsg = ((_a = json.errors) === null || _a === void 0 ? void 0 : _a.map(function (e) { return e.message; }).join('; ')) || "status ".concat(resp.status);
                            throw new Error("Cloudflare Images upload failed: ".concat(errMsg));
                        }
                        variants = json.result.variants || [];
                        if (variants.length > 0) {
                            // Prefer first variant URL
                            return [2 /*return*/, variants[0]];
                        }
                        throw new Error('Cloudflare Images upload succeeded without variants');
                }
            });
        });
    };
    SimpleCodeGeneratorAgent.prototype.uploadScreenshotToR2 = function (base64, key) {
        return __awaiter(this, void 0, void 0, function () {
            var bytes, fileName, protocol, base, agentId, url;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        bytes = this.base64ToUint8Array(base64);
                        return [4 /*yield*/, this.env.TEMPLATES_BUCKET.put(key, bytes, { httpMetadata: { contentType: 'image/png' } })];
                    case 1:
                        _a.sent();
                        fileName = key.split('/').pop();
                        protocol = (0, urls_1.getProtocolForHost)(this.state.hostname);
                        base = this.state.hostname ? "".concat(protocol, "://").concat(this.state.hostname) : '';
                        agentId = this.state.inferenceContext.agentId;
                        url = "".concat(base, "/api/screenshots/").concat(encodeURIComponent(agentId), "/").concat(encodeURIComponent(fileName));
                        return [2 /*return*/, url];
                }
            });
        });
    };
    SimpleCodeGeneratorAgent.prototype.saveToDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            var appService;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.logger().info("Blueprint generated successfully for agent ".concat(this.getAgentId()));
                        appService = new database_1.AppService(this.env);
                        return [4 /*yield*/, appService.createApp({
                                id: this.state.inferenceContext.agentId,
                                userId: this.state.inferenceContext.userId,
                                sessionToken: null,
                                title: this.state.blueprint.title || this.state.query.substring(0, 100),
                                description: this.state.blueprint.description || null,
                                originalPrompt: this.state.query,
                                finalPrompt: this.state.query,
                                framework: (_a = this.state.blueprint.frameworks) === null || _a === void 0 ? void 0 : _a[0],
                                visibility: 'private',
                                status: 'generating',
                                createdAt: new Date(),
                                updatedAt: new Date()
                            })];
                    case 1:
                        _b.sent();
                        this.logger().info("App saved successfully to database for agent ".concat(this.state.inferenceContext.agentId), {
                            agentId: this.state.inferenceContext.agentId,
                            userId: this.state.inferenceContext.userId,
                            visibility: 'private'
                        });
                        this.logger().info("Agent initialized successfully for agent ".concat(this.state.inferenceContext.agentId));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Initialize the code generator with project blueprint and template
     * Sets up services and begins deployment process
     */
    SimpleCodeGeneratorAgent.prototype.initialize = function (initArgs) {
        var _args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            _args[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var query, language, frameworks, hostname, inferenceContext, templateInfo, sandboxSessionId, blueprint, packageJsonFile, packageJson;
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        query = initArgs.query, language = initArgs.language, frameworks = initArgs.frameworks, hostname = initArgs.hostname, inferenceContext = initArgs.inferenceContext, templateInfo = initArgs.templateInfo, sandboxSessionId = initArgs.sandboxSessionId;
                        // Generate a blueprint
                        this.logger().info('Generating blueprint', { query: query, queryLength: query.length });
                        this.logger().info("Using language: ".concat(language, ", frameworks: ").concat(frameworks ? frameworks.join(", ") : "none"));
                        return [4 /*yield*/, (0, blueprint_1.generateBlueprint)({
                                env: this.env,
                                inferenceContext: inferenceContext,
                                query: query,
                                language: language,
                                frameworks: frameworks,
                                templateDetails: templateInfo.templateDetails,
                                templateMetaInfo: templateInfo.selection,
                                stream: {
                                    chunk_size: 256,
                                    onChunk: function (chunk) {
                                        // initArgs.writer.write({chunk});
                                        initArgs.onBlueprintChunk(chunk);
                                    }
                                }
                            })];
                    case 1:
                        blueprint = _b.sent();
                        packageJsonFile = (_a = templateInfo.templateDetails) === null || _a === void 0 ? void 0 : _a.files.find(function (file) { return file.filePath === 'package.json'; });
                        packageJson = packageJsonFile ? packageJsonFile.fileContents : '';
                        this.setState(__assign(__assign({}, this.initialState), { query: query, blueprint: blueprint, templateDetails: templateInfo.templateDetails, sandboxInstanceId: undefined, generatedPhases: [], commandsHistory: [], lastPackageJson: packageJson, sessionId: sandboxSessionId, hostname: hostname, inferenceContext: inferenceContext }));
                        try {
                            // Deploy to sandbox service and generate initial setup commands in parallel
                            Promise.all([this.deployToSandbox(), this.getProjectSetupAssistant().generateSetupCommands(), this.generateReadme()]).then(function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                                var setupCommands = _b[1], _readme = _b[2];
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            this.logger().info("Deployment to sandbox service and initial commands predictions completed successfully");
                                            return [4 /*yield*/, this.executeCommands(setupCommands.commands)];
                                        case 1:
                                            _c.sent();
                                            this.logger().info("Initial commands executed successfully");
                                            return [2 /*return*/];
                                    }
                                });
                            }); }).catch(function (error) {
                                _this.logger().error("Error during deployment:", error);
                                _this.broadcast(constants_1.WebSocketMessageResponses.ERROR, {
                                    error: "Error during deployment: ".concat(error instanceof Error ? error.message : String(error))
                                });
                            });
                        }
                        catch (error) {
                            this.logger().error("Error during deployment:", error);
                            this.broadcast(constants_1.WebSocketMessageResponses.ERROR, {
                                error: "Error during deployment: ".concat(error instanceof Error ? error.message : String(error))
                            });
                        }
                        this.logger().info("Agent ".concat(this.getAgentId(), " session: ").concat(this.state.sessionId, " initialized successfully"));
                        return [4 /*yield*/, this.saveToDatabase()];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, this.state];
                }
            });
        });
    };
    SimpleCodeGeneratorAgent.prototype.isInitialized = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getAgentId() ? true : false];
            });
        });
    };
    SimpleCodeGeneratorAgent.prototype.onStateUpdate = function (_state, _source) {
        // You can leave this empty to disable logging
        // Or, you can log a more specific message, for example:
        this.logger().info("State was updated.");
    };
    SimpleCodeGeneratorAgent.prototype.setState = function (state) {
        try {
            _super.prototype.setState.call(this, state);
        }
        catch (error) {
            this.logger().error("Error setting state:", error);
            this.broadcast(constants_1.WebSocketMessageResponses.ERROR, {
                error: "Error setting state: ".concat(error instanceof Error ? error.message : String(error), "; Original state: ").concat(JSON.stringify(this.state, null, 2), "; New state: ").concat(JSON.stringify(state, null, 2))
            });
        }
    };
    SimpleCodeGeneratorAgent.prototype.getPreviewUrlCache = function () {
        return this.previewUrlCache;
    };
    SimpleCodeGeneratorAgent.prototype.getProjectSetupAssistant = function () {
        if (this.projectSetupAssistant === undefined) {
            this.projectSetupAssistant = new projectsetup_1.ProjectSetupAssistant({
                env: this.env,
                agentId: this.getAgentId(),
                query: this.state.query,
                blueprint: this.state.blueprint,
                template: this.state.templateDetails,
                inferenceContext: this.state.inferenceContext
            });
        }
        return this.projectSetupAssistant;
    };
    SimpleCodeGeneratorAgent.prototype.getSessionId = function () {
        return this.state.sessionId;
    };
    SimpleCodeGeneratorAgent.prototype.resetSessionId = function () {
        var newSessionId = (0, idGenerator_1.generateId)();
        this.logger().info("New Sandbox sessionId initialized: ".concat(newSessionId));
        this.setState(__assign(__assign({}, this.state), { sessionId: newSessionId }));
        // Reset sandbox service client
        this.sandboxServiceClient = undefined;
    };
    SimpleCodeGeneratorAgent.prototype.getSandboxServiceClient = function () {
        if (this.sandboxServiceClient === undefined) {
            this.logger().info('Initializing sandbox service client');
            this.sandboxServiceClient = (0, factory_1.getSandboxService)(this.getSessionId(), this.state.hostname);
        }
        return this.sandboxServiceClient;
    };
    SimpleCodeGeneratorAgent.prototype.isCodeGenerating = function () {
        return this.isGenerating;
    };
    SimpleCodeGeneratorAgent.prototype.rechargePhasesCounter = function (max_phases) {
        if (max_phases === void 0) { max_phases = state_1.MAX_PHASES; }
        if (this.getPhasesCounter() <= max_phases) {
            this.setState(__assign(__assign({}, this.state), { phasesCounter: max_phases }));
        }
    };
    SimpleCodeGeneratorAgent.prototype.decrementPhasesCounter = function () {
        var counter = this.getPhasesCounter() - 1;
        this.setState(__assign(__assign({}, this.state), { phasesCounter: counter }));
        return counter;
    };
    SimpleCodeGeneratorAgent.prototype.getPhasesCounter = function () {
        return this.state.phasesCounter;
    };
    SimpleCodeGeneratorAgent.prototype.generateReadme = function () {
        return __awaiter(this, void 0, void 0, function () {
            var readme;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger().info('Generating README.md');
                        // Only generate if it doesn't exist
                        if (this.fileManager.fileExists('README.md')) {
                            this.logger().info('README.md already exists');
                            return [2 /*return*/];
                        }
                        this.broadcast(constants_1.WebSocketMessageResponses.FILE_GENERATING, {
                            message: 'Generating README.md',
                            filePath: 'README.md',
                            filePurpose: 'Project documentation and setup instructions'
                        });
                        return [4 /*yield*/, this.operations.implementPhase.generateReadme({
                                agentId: this.getAgentId(),
                                env: this.env,
                                logger: this.logger(),
                                context: GenerationContext_1.GenerationContext.from(this.state, this.logger()),
                                inferenceContext: this.state.inferenceContext,
                            })];
                    case 1:
                        readme = _a.sent();
                        this.fileManager.saveGeneratedFile(readme);
                        this.broadcast(constants_1.WebSocketMessageResponses.FILE_GENERATED, {
                            message: 'README.md generated successfully',
                            file: readme
                        });
                        this.logger().info('README.md generated successfully');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * State machine controller for code generation with user interaction support
     * Executes phases sequentially with review cycles and proper state transitions
     */
    SimpleCodeGeneratorAgent.prototype.generateAllFiles = function () {
        return __awaiter(this, arguments, void 0, function (reviewCycles) {
            var currentDevState, generatedPhases, completedPhases, phaseConcept, staticAnalysisCache, executionResults, _a, error_1, errorMessage, appService;
            if (reviewCycles === void 0) { reviewCycles = 5; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.state.mvpGenerated && this.state.pendingUserInputs.length === 0) {
                            this.logger().info("Code generation already completed and no user inputs pending");
                            return [2 /*return*/];
                        }
                        if (this.isGenerating) {
                            this.logger().info("Code generation already in progress");
                            return [2 /*return*/];
                        }
                        this.isGenerating = true;
                        this.broadcast(constants_1.WebSocketMessageResponses.GENERATION_STARTED, {
                            message: 'Starting code generation',
                            totalFiles: this.getTotalFiles()
                        });
                        currentDevState = state_1.CurrentDevState.PHASE_IMPLEMENTING;
                        generatedPhases = this.state.generatedPhases;
                        completedPhases = generatedPhases.filter(function (phase) { return !phase.completed; });
                        if (completedPhases.length > 0) {
                            phaseConcept = completedPhases[completedPhases.length - 1];
                        }
                        else if (generatedPhases.length > 0) {
                            currentDevState = state_1.CurrentDevState.PHASE_GENERATING;
                        }
                        else {
                            phaseConcept = this.state.blueprint.initialPhase;
                            this.setState(__assign(__assign({}, this.state), { currentPhase: phaseConcept, generatedPhases: [__assign(__assign({}, phaseConcept), { completed: false })] }));
                        }
                        // Store review cycles for later use
                        this.setState(__assign(__assign({}, this.state), { reviewCycles: reviewCycles }));
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 14, 15, 17]);
                        executionResults = void 0;
                        _b.label = 2;
                    case 2:
                        if (!(currentDevState !== state_1.CurrentDevState.IDLE)) return [3 /*break*/, 13];
                        this.logger().info("[generateAllFiles] Executing state: ".concat(currentDevState));
                        _a = currentDevState;
                        switch (_a) {
                            case state_1.CurrentDevState.PHASE_GENERATING: return [3 /*break*/, 3];
                            case state_1.CurrentDevState.PHASE_IMPLEMENTING: return [3 /*break*/, 5];
                            case state_1.CurrentDevState.REVIEWING: return [3 /*break*/, 7];
                            case state_1.CurrentDevState.FINALIZING: return [3 /*break*/, 9];
                        }
                        return [3 /*break*/, 11];
                    case 3: return [4 /*yield*/, this.executePhaseGeneration()];
                    case 4:
                        executionResults = _b.sent();
                        currentDevState = executionResults.currentDevState;
                        phaseConcept = executionResults.result;
                        staticAnalysisCache = executionResults.staticAnalysis;
                        return [3 /*break*/, 12];
                    case 5: return [4 /*yield*/, this.executePhaseImplementation(phaseConcept, staticAnalysisCache)];
                    case 6:
                        executionResults = _b.sent();
                        currentDevState = executionResults.currentDevState;
                        staticAnalysisCache = executionResults.staticAnalysis;
                        return [3 /*break*/, 12];
                    case 7: return [4 /*yield*/, this.executeReviewCycle()];
                    case 8:
                        currentDevState = _b.sent();
                        return [3 /*break*/, 12];
                    case 9: return [4 /*yield*/, this.executeFinalizing()];
                    case 10:
                        currentDevState = _b.sent();
                        return [3 /*break*/, 12];
                    case 11: return [3 /*break*/, 12];
                    case 12: return [3 /*break*/, 2];
                    case 13:
                        this.logger().info("State machine completed successfully");
                        return [3 /*break*/, 17];
                    case 14:
                        error_1 = _b.sent();
                        this.logger().error("Error in state machine:", error_1);
                        if (error_1 instanceof errors_1.RateLimitExceededError) {
                            this.broadcast(constants_1.WebSocketMessageResponses.RATE_LIMIT_ERROR, { error: error_1 });
                        }
                        errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                        this.broadcast(constants_1.WebSocketMessageResponses.ERROR, {
                            error: "Error during generation: ".concat(errorMessage)
                        });
                        return [3 /*break*/, 17];
                    case 15:
                        appService = new database_1.AppService(this.env);
                        return [4 /*yield*/, appService.updateApp(this.getAgentId(), {
                                status: 'completed',
                            })];
                    case 16:
                        _b.sent();
                        this.isGenerating = false;
                        this.broadcast(constants_1.WebSocketMessageResponses.GENERATION_COMPLETE, {
                            message: "Code generation and review process completed.",
                            instanceId: this.state.sandboxInstanceId,
                        });
                        return [7 /*endfinally*/];
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute phase generation state - generate next phase with user suggestions
     */
    SimpleCodeGeneratorAgent.prototype.executePhaseGeneration = function () {
        return __awaiter(this, void 0, void 0, function () {
            var currentIssues, userSuggestions, nextPhase, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger().info("Executing PHASE_GENERATING state");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.fetchAllIssues()];
                    case 2:
                        currentIssues = _a.sent();
                        userSuggestions = this.state.pendingUserInputs.length > 0 ? this.state.pendingUserInputs : undefined;
                        return [4 /*yield*/, this.generateNextPhase(currentIssues, userSuggestions)];
                    case 3:
                        nextPhase = _a.sent();
                        if (!nextPhase) {
                            this.logger().info("No more phases to implement, transitioning to FINALIZING");
                            return [2 /*return*/, {
                                    currentDevState: state_1.CurrentDevState.FINALIZING,
                                }];
                        }
                        // Store current phase and transition to implementation
                        this.setState(__assign(__assign({}, this.state), { currentPhase: nextPhase }));
                        return [2 /*return*/, {
                                currentDevState: state_1.CurrentDevState.PHASE_IMPLEMENTING,
                                result: nextPhase,
                                staticAnalysis: currentIssues.staticAnalysis
                            }];
                    case 4:
                        error_2 = _a.sent();
                        this.logger().error("Error generating phase", error_2);
                        if (error_2 instanceof errors_1.RateLimitExceededError) {
                            throw error_2;
                        }
                        this.broadcast(constants_1.WebSocketMessageResponses.ERROR, {
                            message: "Error generating phase",
                            error: error_2
                        });
                        return [2 /*return*/, {
                                currentDevState: state_1.CurrentDevState.IDLE,
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute phase implementation state - implement current phase
     */
    SimpleCodeGeneratorAgent.prototype.executePhaseImplementation = function (phaseConcept, staticAnalysis) {
        return __awaiter(this, void 0, void 0, function () {
            var results, currentIssues, phasesCounter, error_3;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 8, , 9]);
                        this.logger().info("Executing PHASE_IMPLEMENTING state");
                        if (!(phaseConcept === undefined)) return [3 /*break*/, 2];
                        phaseConcept = this.state.currentPhase;
                        if (!(phaseConcept === undefined)) return [3 /*break*/, 2];
                        this.logger().error("No phase concept provided to implement, will call phase generation");
                        return [4 /*yield*/, this.executePhaseGeneration()];
                    case 1:
                        results = _b.sent();
                        phaseConcept = results.result;
                        if (phaseConcept === undefined) {
                            this.logger().error("No phase concept provided to implement, will return");
                            return [2 /*return*/, { currentDevState: state_1.CurrentDevState.FINALIZING }];
                        }
                        _b.label = 2;
                    case 2:
                        this.setState(__assign(__assign({}, this.state), { currentPhase: undefined // reset current phase
                         }));
                        currentIssues = void 0;
                        if (!staticAnalysis) return [3 /*break*/, 4];
                        _a = {};
                        return [4 /*yield*/, this.fetchRuntimeErrors(true)];
                    case 3:
                        // If have cached static analysis, fetch everything else fresh
                        currentIssues = (_a.runtimeErrors = _b.sent(),
                            _a.staticAnalysis = staticAnalysis,
                            _a.clientErrors = this.state.clientReportedErrors,
                            _a);
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, this.fetchAllIssues()];
                    case 5:
                        currentIssues = _b.sent();
                        this.resetIssues();
                        _b.label = 6;
                    case 6: 
                    // Implement the phase
                    return [4 /*yield*/, this.implementPhase(phaseConcept, currentIssues)];
                    case 7:
                        // Implement the phase
                        _b.sent();
                        this.logger().info("Phase ".concat(phaseConcept.name, " completed, generating next phase"));
                        phasesCounter = this.decrementPhasesCounter();
                        if (phaseConcept.lastPhase || phasesCounter <= 0)
                            return [2 /*return*/, { currentDevState: state_1.CurrentDevState.FINALIZING, staticAnalysis: staticAnalysis }];
                        return [2 /*return*/, { currentDevState: state_1.CurrentDevState.PHASE_GENERATING, staticAnalysis: staticAnalysis }];
                    case 8:
                        error_3 = _b.sent();
                        this.logger().error("Error implementing phase", error_3);
                        if (error_3 instanceof errors_1.RateLimitExceededError) {
                            throw error_3;
                        }
                        return [2 /*return*/, { currentDevState: state_1.CurrentDevState.IDLE }];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute review cycle state - run code review and regeneration cycles
     */
    SimpleCodeGeneratorAgent.prototype.executeReviewCycle = function () {
        return __awaiter(this, void 0, void 0, function () {
            var reviewCycles, i, reviewResult, issuesFound, promises, _i, _a, fileToFix, fileToRegenerate, fileResults, files, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.logger().info("Executing REVIEWING state");
                        reviewCycles = 3;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 9, , 10]);
                        this.logger().info("Starting code review and improvement cycle...");
                        i = 0;
                        _b.label = 2;
                    case 2:
                        if (!(i < reviewCycles)) return [3 /*break*/, 8];
                        // Check if user input came during review - if so, go back to phase generation
                        if (this.state.pendingUserInputs.length > 0) {
                            this.logger().info("User input received during review, transitioning back to PHASE_GENERATING");
                            return [2 /*return*/, state_1.CurrentDevState.PHASE_GENERATING];
                        }
                        this.logger().info("Starting code review cycle ".concat(i + 1, "..."));
                        return [4 /*yield*/, this.reviewCode()];
                    case 3:
                        reviewResult = _b.sent();
                        if (!reviewResult) {
                            this.logger().warn("Code review failed. Skipping fix cycle.");
                            return [3 /*break*/, 8];
                        }
                        issuesFound = reviewResult.issuesFound;
                        if (!issuesFound) return [3 /*break*/, 6];
                        this.logger().info("Issues found in review cycle ".concat(i + 1), { issuesFound: issuesFound });
                        promises = [];
                        for (_i = 0, _a = reviewResult.filesToFix; _i < _a.length; _i++) {
                            fileToFix = _a[_i];
                            if (!fileToFix.require_code_changes)
                                continue;
                            fileToRegenerate = this.fileManager.getGeneratedFile(fileToFix.filePath);
                            if (!fileToRegenerate) {
                                this.logger().warn("File to fix not found in generated files: ".concat(fileToFix.filePath));
                                continue;
                            }
                            promises.push(this.regenerateFile(fileToRegenerate, fileToFix.issues, 0));
                        }
                        return [4 /*yield*/, Promise.allSettled(promises)];
                    case 4:
                        fileResults = _b.sent();
                        files = fileResults.map(function (result) { return result.status === "fulfilled" ? result.value : null; }).filter(function (result) { return result !== null; });
                        return [4 /*yield*/, this.deployToSandbox(files, false, "fix: Applying code review fixes")];
                    case 5:
                        _b.sent();
                        // await this.applyDeterministicCodeFixes();
                        this.logger().info("Completed regeneration for review cycle");
                        return [3 /*break*/, 7];
                    case 6:
                        this.logger().info("Code review found no issues. Review cycles complete.");
                        return [3 /*break*/, 8];
                    case 7:
                        i++;
                        return [3 /*break*/, 2];
                    case 8:
                        // Check again for user input before finalizing
                        if (this.state.pendingUserInputs.length > 0) {
                            this.logger().info("User input received after review, transitioning back to PHASE_GENERATING");
                            return [2 /*return*/, state_1.CurrentDevState.PHASE_GENERATING];
                        }
                        else {
                            this.logger().info("Review cycles complete, transitioning to IDLE");
                            return [2 /*return*/, state_1.CurrentDevState.IDLE];
                        }
                        return [3 /*break*/, 10];
                    case 9:
                        error_4 = _b.sent();
                        this.logger().error("Error during review cycle:", error_4);
                        if (error_4 instanceof errors_1.RateLimitExceededError) {
                            throw error_4;
                        }
                        return [2 /*return*/, state_1.CurrentDevState.IDLE];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute finalizing state - final review and cleanup (runs only once)
     */
    SimpleCodeGeneratorAgent.prototype.executeFinalizing = function () {
        return __awaiter(this, void 0, void 0, function () {
            var phaseConcept, currentIssues, numFilesGenerated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger().info("Executing FINALIZING state - final review and cleanup");
                        // Only do finalizing stage if it wasn't done before
                        if (this.state.mvpGenerated) {
                            this.logger().info("Finalizing stage already done");
                            return [2 /*return*/, state_1.CurrentDevState.REVIEWING];
                        }
                        this.setState(__assign(__assign({}, this.state), { mvpGenerated: true }));
                        phaseConcept = {
                            name: "Finalization and Review",
                            description: "Full polishing and final review of the application",
                            files: [],
                            lastPhase: true
                        };
                        this.setState(__assign(__assign({}, this.state), { generatedPhases: __spreadArray(__spreadArray([], this.state.generatedPhases, true), [
                                __assign(__assign({}, phaseConcept), { completed: false })
                            ], false) }));
                        return [4 /*yield*/, this.fetchAllIssues()];
                    case 1:
                        currentIssues = _a.sent();
                        this.resetIssues();
                        // Run final review and cleanup phase
                        return [4 /*yield*/, this.implementPhase(phaseConcept, currentIssues)];
                    case 2:
                        // Run final review and cleanup phase
                        _a.sent();
                        numFilesGenerated = this.fileManager.getGeneratedFilePaths().length;
                        this.logger().info("Finalization complete. Generated ".concat(numFilesGenerated, "/").concat(this.getTotalFiles(), " files."));
                        // Transition to IDLE - generation complete
                        return [2 /*return*/, state_1.CurrentDevState.REVIEWING];
                }
            });
        });
    };
    /**
     * Generate next phase with raw user suggestions
     */
    SimpleCodeGeneratorAgent.prototype.generateNextPhase = function (currentIssues, userSuggestions) {
        return __awaiter(this, void 0, void 0, function () {
            var context, issues, result, filesToDelete;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        context = GenerationContext_1.GenerationContext.from(this.state, this.logger());
                        issues = IssueReport_1.IssueReport.from(currentIssues);
                        // Notify phase generation start
                        this.broadcast(constants_1.WebSocketMessageResponses.PHASE_GENERATING, {
                            message: userSuggestions && userSuggestions.length > 0
                                ? "Generating next phase incorporating ".concat(userSuggestions.length, " user suggestions")
                                : "Generating next phase",
                            issues: issues,
                            userSuggestions: userSuggestions,
                        });
                        return [4 /*yield*/, this.operations.generateNextPhase.execute({
                                issues: issues,
                                userSuggestions: userSuggestions,
                                isUserSuggestedPhase: userSuggestions && userSuggestions.length > 0 && this.state.mvpGenerated // If mvpGenerated is true, then it is a purely user suggested phase
                            }, {
                                env: this.env,
                                agentId: this.getAgentId(),
                                logger: this.logger(),
                                context: context,
                                inferenceContext: this.state.inferenceContext,
                            })
                            // Execute install commands if any
                        ];
                    case 1:
                        result = _a.sent();
                        // Execute install commands if any
                        if (result.installCommands && result.installCommands.length > 0) {
                            this.executeCommands(result.installCommands);
                        }
                        filesToDelete = result.files.filter(function (f) { var _a; return ((_a = f.changes) === null || _a === void 0 ? void 0 : _a.toLowerCase().trim()) === 'delete'; });
                        if (filesToDelete.length > 0) {
                            this.logger().info("Deleting ".concat(filesToDelete.length, " files: ").concat(filesToDelete.map(function (f) { return f.path; }).join(", ")));
                            this.deleteFiles(filesToDelete.map(function (f) { return f.path; }));
                        }
                        if (result.files.length === 0) {
                            this.logger().info("No files generated for next phase");
                            // Notify phase generation complete
                            this.broadcast(constants_1.WebSocketMessageResponses.PHASE_GENERATED, {
                                message: "No files generated for next phase",
                                phase: undefined
                            });
                            return [2 /*return*/, undefined];
                        }
                        this.setState(__assign(__assign({}, this.state), { generatedPhases: __spreadArray(__spreadArray([], this.state.generatedPhases, true), [
                                __assign(__assign({}, result), { completed: false })
                            ], false), pendingUserInputs: [] }));
                        // Notify phase generation complete
                        this.broadcast(constants_1.WebSocketMessageResponses.PHASE_GENERATED, {
                            message: "Generated next phase: ".concat(result.name),
                            phase: result
                        });
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Implement a single phase of code generation
     * Streams file generation with real-time updates and incorporates technical instructions
     */
    SimpleCodeGeneratorAgent.prototype.implementPhase = function (phase_1, currentIssues_1) {
        return __awaiter(this, arguments, void 0, function (phase, currentIssues, streamChunks) {
            var context, issues, result, finalFiles, previousPhases, updatedPhases;
            var _this = this;
            if (streamChunks === void 0) { streamChunks = true; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        context = GenerationContext_1.GenerationContext.from(this.state, this.logger());
                        issues = IssueReport_1.IssueReport.from(currentIssues);
                        this.broadcast(constants_1.WebSocketMessageResponses.PHASE_IMPLEMENTING, {
                            message: "Implementing phase: ".concat(phase.name),
                            phase: phase,
                            issues: issues,
                        });
                        return [4 /*yield*/, this.operations.implementPhase.execute({
                                phase: phase,
                                issues: issues,
                                isFirstPhase: this.state.generatedPhases.filter(function (p) { return p.completed; }).length === 0,
                                fileGeneratingCallback: function (filePath, filePurpose) {
                                    _this.broadcast(constants_1.WebSocketMessageResponses.FILE_GENERATING, {
                                        message: "Generating file: ".concat(filePath),
                                        filePath: filePath,
                                        filePurpose: filePurpose
                                    });
                                },
                                shouldAutoFix: this.state.inferenceContext.enableRealtimeCodeFix,
                                fileChunkGeneratedCallback: streamChunks ? function (filePath, chunk, format) {
                                    _this.broadcast(constants_1.WebSocketMessageResponses.FILE_CHUNK_GENERATED, {
                                        message: "Generating file: ".concat(filePath),
                                        filePath: filePath,
                                        chunk: chunk,
                                        format: format,
                                    });
                                } : function (_filePath, _chunk, _format) { },
                                fileClosedCallback: function (file, message) {
                                    _this.broadcast(constants_1.WebSocketMessageResponses.FILE_GENERATED, {
                                        message: message,
                                        file: file,
                                    });
                                }
                            }, {
                                env: this.env,
                                agentId: this.getAgentId(),
                                logger: this.logger(),
                                context: context,
                                inferenceContext: this.state.inferenceContext,
                            })];
                    case 1:
                        result = _a.sent();
                        this.broadcast(constants_1.WebSocketMessageResponses.PHASE_VALIDATING, {
                            message: "Validating files for phase: ".concat(phase.name),
                            phase: phase,
                        });
                        return [4 /*yield*/, Promise.allSettled(result.fixedFilePromises).then(function (results) {
                                return results.map(function (result) {
                                    if (result.status === 'fulfilled') {
                                        return result.value;
                                    }
                                    else {
                                        return null;
                                    }
                                }).filter(function (f) { return f !== null; });
                            })];
                    case 2:
                        finalFiles = _a.sent();
                        // Update state with completed phase
                        this.fileManager.saveGeneratedFiles(finalFiles);
                        this.logger().info("Files generated for phase:", phase.name, finalFiles.map(function (f) { return f.filePath; }));
                        if (!(result.commands && result.commands.length > 0)) return [3 /*break*/, 4];
                        this.logger().info("Phase implementation suggested install commands:", result.commands);
                        return [4 /*yield*/, this.executeCommands(result.commands)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!(finalFiles.length > 0)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.deployToSandbox(finalFiles, false, phase.name)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.applyDeterministicCodeFixes()];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        // Validation complete
                        this.broadcast(constants_1.WebSocketMessageResponses.PHASE_VALIDATED, {
                            message: "Files validated for phase: ".concat(phase.name),
                            phase: phase
                        });
                        this.logger().info("Files generated for phase:", phase.name, finalFiles.map(function (f) { return f.filePath; }));
                        this.logger().info("Validation complete for phase: ".concat(phase.name));
                        // Notify phase completion
                        this.broadcast(constants_1.WebSocketMessageResponses.PHASE_IMPLEMENTED, {
                            phase: {
                                name: phase.name,
                                files: finalFiles.map(function (f) { return ({
                                    path: f.filePath,
                                    purpose: f.filePurpose,
                                    contents: f.fileContents
                                }); }),
                                description: phase.description
                            },
                            message: "Files generated successfully for phase"
                        });
                        previousPhases = this.state.generatedPhases;
                        updatedPhases = previousPhases.map(function (p) { return p.name === phase.name ? __assign(__assign({}, p), { completed: true }) : p; });
                        this.setState(__assign(__assign({}, this.state), { generatedPhases: updatedPhases }));
                        this.logger().info("Completed phases:", JSON.stringify(updatedPhases, null, 2));
                        return [2 /*return*/, {
                                files: finalFiles,
                                deploymentNeeded: result.deploymentNeeded,
                                commands: result.commands
                            }];
                }
            });
        });
    };
    /**
     * Get current model configurations (defaults + user overrides)
     * Used by WebSocket to provide configuration info to frontend
     */
    SimpleCodeGeneratorAgent.prototype.getModelConfigsInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var userId, modelConfigService, userConfigsRecord, agents, userConfigs, defaultConfigs, _i, _a, _b, actionKey, mergedConfig, defaultConfig, error_5;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        userId = this.state.inferenceContext.userId;
                        if (!userId) {
                            throw new Error('No user session available for model configurations');
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        modelConfigService = new ModelConfigService_1.ModelConfigService(this.env);
                        return [4 /*yield*/, modelConfigService.getUserModelConfigs(userId)];
                    case 2:
                        userConfigsRecord = _c.sent();
                        agents = Object.entries(config_1.AGENT_CONFIG).map(function (_a) {
                            var key = _a[0], config = _a[1];
                            return ({
                                key: key,
                                name: config.name,
                                description: config.description
                            });
                        });
                        userConfigs = {};
                        defaultConfigs = {};
                        for (_i = 0, _a = Object.entries(userConfigsRecord); _i < _a.length; _i++) {
                            _b = _a[_i], actionKey = _b[0], mergedConfig = _b[1];
                            if (mergedConfig.isUserOverride) {
                                userConfigs[actionKey] = {
                                    name: mergedConfig.name,
                                    max_tokens: mergedConfig.max_tokens,
                                    temperature: mergedConfig.temperature,
                                    reasoning_effort: mergedConfig.reasoning_effort,
                                    fallbackModel: mergedConfig.fallbackModel,
                                    isUserOverride: true
                                };
                            }
                            defaultConfig = config_1.AGENT_CONFIG[actionKey];
                            if (defaultConfig) {
                                defaultConfigs[actionKey] = {
                                    name: defaultConfig.name,
                                    max_tokens: defaultConfig.max_tokens,
                                    temperature: defaultConfig.temperature,
                                    reasoning_effort: defaultConfig.reasoning_effort,
                                    fallbackModel: defaultConfig.fallbackModel
                                };
                            }
                        }
                        return [2 /*return*/, {
                                agents: agents,
                                userConfigs: userConfigs,
                                defaultConfigs: defaultConfigs
                            }];
                    case 3:
                        error_5 = _c.sent();
                        this.logger().error('Error fetching model configs info:', error_5);
                        throw error_5;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Perform comprehensive code review
     * Analyzes for runtime errors, static issues, and best practices
     */
    SimpleCodeGeneratorAgent.prototype.reviewCode = function () {
        return __awaiter(this, void 0, void 0, function () {
            var context, issues, issueReport, reviewResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        context = GenerationContext_1.GenerationContext.from(this.state, this.logger());
                        return [4 /*yield*/, this.fetchAllIssues()];
                    case 1:
                        issues = _a.sent();
                        this.resetIssues();
                        issueReport = IssueReport_1.IssueReport.from(issues);
                        // Report discovered issues
                        this.broadcast(constants_1.WebSocketMessageResponses.CODE_REVIEWING, {
                            message: "Running code review...",
                            staticAnalysis: issues.staticAnalysis,
                            clientErrors: issues.clientErrors,
                            runtimeErrors: issues.runtimeErrors
                        });
                        return [4 /*yield*/, this.operations.codeReview.execute({ issues: issueReport }, {
                                env: this.env,
                                agentId: this.getAgentId(),
                                logger: this.logger(),
                                context: context,
                                inferenceContext: this.state.inferenceContext,
                            })];
                    case 2:
                        reviewResult = _a.sent();
                        if (!(reviewResult.commands && reviewResult.commands.length > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.executeCommands(reviewResult.commands)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        // Notify review completion
                        this.broadcast(constants_1.WebSocketMessageResponses.CODE_REVIEWED, {
                            review: reviewResult,
                            message: "Code review completed"
                        });
                        return [2 /*return*/, reviewResult];
                }
            });
        });
    };
    /**
     * Regenerate a file to fix identified issues
     * Retries up to 3 times before giving up
     */
    SimpleCodeGeneratorAgent.prototype.regenerateFile = function (file_1, issues_1) {
        return __awaiter(this, arguments, void 0, function (file, issues, retryIndex) {
            var context, result;
            if (retryIndex === void 0) { retryIndex = 0; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        context = GenerationContext_1.GenerationContext.from(this.state, this.logger());
                        this.broadcast(constants_1.WebSocketMessageResponses.FILE_REGENERATING, {
                            message: "Regenerating file: ".concat(file.filePath),
                            filePath: file.filePath,
                            original_issues: issues,
                        });
                        return [4 /*yield*/, this.operations.regenerateFile.execute({ file: file, issues: issues, retryIndex: retryIndex }, {
                                env: this.env,
                                agentId: this.getAgentId(),
                                logger: this.logger(),
                                context: context,
                                inferenceContext: this.state.inferenceContext,
                            })];
                    case 1:
                        result = _a.sent();
                        this.fileManager.saveGeneratedFile(result);
                        this.broadcast(constants_1.WebSocketMessageResponses.FILE_REGENERATED, {
                            message: "Regenerated file: ".concat(file.filePath),
                            file: result,
                            original_issues: issues,
                        });
                        return [2 /*return*/, result];
                }
            });
        });
    };
    SimpleCodeGeneratorAgent.prototype.getTotalFiles = function () {
        var _a, _b;
        return this.fileManager.getGeneratedFilePaths().length + (((_b = (_a = (this.state.currentPhase || this.state.blueprint.initialPhase)) === null || _a === void 0 ? void 0 : _a.files) === null || _b === void 0 ? void 0 : _b.length) || 0);
    };
    SimpleCodeGeneratorAgent.prototype.getSummary = function () {
        // Ensure state is migrated before accessing files
        this.migrateStateIfNeeded();
        var summaryData = {
            query: this.state.query,
            generatedCode: this.fileManager.getGeneratedFiles(),
            conversation: this.state.conversationMessages,
        };
        return Promise.resolve(summaryData);
    };
    SimpleCodeGeneratorAgent.prototype.getFullState = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Ensure state is migrated before returning state
                this.migrateStateIfNeeded();
                return [2 /*return*/, this.state];
            });
        });
    };
    /**
     * Migrate old snake_case file properties to camelCase format
     * This is needed for apps created before the schema migration
     */
    SimpleCodeGeneratorAgent.prototype.migrateStateIfNeeded = function () {
        var _a;
        var needsMigration = false;
        // Helper function to migrate a file object from snake_case to camelCase
        var migrateFile = function (file) {
            var hasOldFormat = 'file_path' in file || 'file_contents' in file || 'file_purpose' in file;
            if (hasOldFormat) {
                return {
                    filePath: file.filePath || file.file_path,
                    fileContents: file.fileContents || file.file_contents,
                    filePurpose: file.filePurpose || file.file_purpose,
                };
            }
            return file;
        };
        // Migrate generatedFilesMap
        var migratedFilesMap = {};
        for (var _i = 0, _b = Object.entries(this.state.generatedFilesMap); _i < _b.length; _i++) {
            var _c = _b[_i], key = _c[0], file = _c[1];
            var migratedFile = migrateFile(file);
            // Add FileState-specific properties if missing
            migratedFilesMap[key] = __assign(__assign({}, migratedFile), { last_hash: migratedFile.last_hash || '', last_modified: migratedFile.last_modified || Date.now(), unmerged: migratedFile.unmerged || [] });
            if (migratedFile !== file) {
                needsMigration = true;
            }
        }
        // Migrate templateDetails.files
        var migratedTemplateDetails = this.state.templateDetails;
        if (migratedTemplateDetails === null || migratedTemplateDetails === void 0 ? void 0 : migratedTemplateDetails.files) {
            var migratedTemplateFiles = migratedTemplateDetails.files.map(function (file) {
                var migratedFile = migrateFile(file);
                if (migratedFile !== file) {
                    needsMigration = true;
                }
                return migratedFile;
            });
            if (needsMigration) {
                migratedTemplateDetails = __assign(__assign({}, migratedTemplateDetails), { files: migratedTemplateFiles });
            }
        }
        // Fix conversation message exponential bloat caused by incorrect message accumulation
        var migratedConversationMessages = this.state.conversationMessages;
        var MIN_MESSAGES_FOR_CLEANUP = 25;
        if (migratedConversationMessages && migratedConversationMessages.length > 0) {
            var originalCount = migratedConversationMessages.length;
            // Deduplicate messages by conversationId
            var seen = new Set();
            var uniqueMessages = [];
            for (var _d = 0, migratedConversationMessages_1 = migratedConversationMessages; _d < migratedConversationMessages_1.length; _d++) {
                var message = migratedConversationMessages_1[_d];
                // Use conversationId as primary unique key since it should be unique per message
                var key = message.conversationId;
                if (!key) {
                    // Fallback for messages without conversationId
                    var contentStr = typeof message.content === 'string'
                        ? message.content.substring(0, 100)
                        : JSON.stringify(message.content || '').substring(0, 100);
                    key = "".concat(message.role || 'unknown', "_").concat(contentStr, "_").concat(Date.now());
                }
                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueMessages.push(message);
                }
            }
            // Sort messages by timestamp (extracted from conversationId) to maintain chronological order
            uniqueMessages.sort(function (a, b) {
                var getTimestamp = function (msg) {
                    if (msg.conversationId && typeof msg.conversationId === 'string' && msg.conversationId.startsWith('conv-')) {
                        var parts = msg.conversationId.split('-');
                        if (parts.length >= 2) {
                            return parseInt(parts[1]) || 0;
                        }
                    }
                    return 0;
                };
                return getTimestamp(a) - getTimestamp(b);
            });
            // Smart filtering: if we have more than MIN_MESSAGES_FOR_CLEANUP, remove internal memos but keep actual conversations
            if (uniqueMessages.length > MIN_MESSAGES_FOR_CLEANUP) {
                var realConversations = [];
                var internalMemos = [];
                for (var _e = 0, uniqueMessages_1 = uniqueMessages; _e < uniqueMessages_1.length; _e++) {
                    var message = uniqueMessages_1[_e];
                    var content = typeof message.content === 'string' ? message.content : JSON.stringify(message.content || '');
                    var isInternalMemo = content.includes('**<Internal Memo>**') || content.includes('Project Updates:');
                    if (isInternalMemo) {
                        internalMemos.push(message);
                    }
                    else {
                        realConversations.push(message);
                    }
                }
                this.logger().info('Conversation cleanup analysis', {
                    totalUniqueMessages: uniqueMessages.length,
                    realConversations: realConversations.length,
                    internalMemos: internalMemos.length,
                    willRemoveInternalMemos: uniqueMessages.length > MIN_MESSAGES_FOR_CLEANUP
                });
                // Keep all real conversations, remove internal memos if we exceed the threshold
                migratedConversationMessages = realConversations;
            }
            else {
                // If we have few messages, keep everything
                migratedConversationMessages = uniqueMessages;
            }
            if (migratedConversationMessages.length !== originalCount) {
                this.logger().info('Fixed conversation message exponential bloat', {
                    originalCount: originalCount,
                    deduplicatedCount: uniqueMessages.length,
                    finalCount: migratedConversationMessages.length,
                    duplicatesRemoved: originalCount - uniqueMessages.length,
                    internalMemosRemoved: uniqueMessages.length - migratedConversationMessages.length
                });
                needsMigration = true;
            }
        }
        var migratedInferenceContext = this.state.inferenceContext;
        if (migratedInferenceContext && 'userApiKeys' in migratedInferenceContext) {
            migratedInferenceContext = __assign({}, migratedInferenceContext);
            // Completely remove the userApiKeys property for security
            delete migratedInferenceContext.userApiKeys;
            needsMigration = true;
        }
        // Check for deprecated properties
        var stateHasDeprecatedProps = 'latestScreenshot' in this.state;
        if (stateHasDeprecatedProps) {
            needsMigration = true;
        }
        // Apply migration if needed
        if (needsMigration) {
            this.logger().info('Migrating state: schema format, conversation cleanup, and security fixes', {
                generatedFilesCount: Object.keys(migratedFilesMap).length,
                templateFilesCount: ((_a = migratedTemplateDetails === null || migratedTemplateDetails === void 0 ? void 0 : migratedTemplateDetails.files) === null || _a === void 0 ? void 0 : _a.length) || 0,
                finalConversationCount: (migratedConversationMessages === null || migratedConversationMessages === void 0 ? void 0 : migratedConversationMessages.length) || 0,
                removedUserApiKeys: this.state.inferenceContext && 'userApiKeys' in this.state.inferenceContext
            });
            var newState = __assign(__assign({}, this.state), { generatedFilesMap: migratedFilesMap, templateDetails: migratedTemplateDetails, conversationMessages: migratedConversationMessages, inferenceContext: migratedInferenceContext });
            // Remove deprecated properties
            if (stateHasDeprecatedProps) {
                delete newState.latestScreenshot;
            }
            this.setState(newState);
        }
    };
    SimpleCodeGeneratorAgent.prototype.getFileGenerated = function (filePath) {
        return this.fileManager.getGeneratedFile(filePath) || null;
    };
    SimpleCodeGeneratorAgent.prototype.getWebSockets = function () {
        // Replace with the correct context reference or implementation
        // For example, if context is passed in constructor or available as this.context:
        // return this.context.getWebSockets();
        // If not available, throw an error or return an empty array
        throw new Error('Context for getWebSockets() is not set on SimpleCodeGeneratorAgent');
        // return [];
    };
    SimpleCodeGeneratorAgent.prototype.fetchRuntimeErrors = function () {
        return __awaiter(this, arguments, void 0, function (clear) {
            var resp, errors, error_6;
            if (clear === void 0) { clear = true; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.state.sandboxInstanceId || !this.fileManager) {
                            this.logger().warn("No sandbox instance ID available to fetch errors from.");
                            return [2 /*return*/, []];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, this.getSandboxServiceClient().getInstanceErrors(this.state.sandboxInstanceId)];
                    case 2:
                        resp = _a.sent();
                        if (!resp || !resp.success) {
                            this.logger().error("Failed to fetch runtime errors: ".concat((resp === null || resp === void 0 ? void 0 : resp.error) || 'Unknown error', ", Will initiate redeploy"));
                            // Initiate redeploy
                            this.deployToSandbox([], true);
                            return [2 /*return*/, []];
                        }
                        errors = (resp === null || resp === void 0 ? void 0 : resp.errors) || [];
                        if (errors.filter(function (error) { return error.message.includes('Unterminated string in JSON at position'); }).length > 0) {
                            this.logger().error('Unterminated string in JSON at position, will initiate redeploy');
                            // Initiate redeploy
                            this.deployToSandbox([], true);
                            return [2 /*return*/, []];
                        }
                        if (!(errors.length > 0)) return [3 /*break*/, 4];
                        this.logger().info("Found ".concat(errors.length, " runtime errors: ").concat(errors.map(function (e) { return e.message; }).join(', ')));
                        this.broadcast(constants_1.WebSocketMessageResponses.RUNTIME_ERROR_FOUND, {
                            errors: errors,
                            message: "Runtime errors found",
                            count: errors.length
                        });
                        if (!clear) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.getSandboxServiceClient().clearInstanceErrors(this.state.sandboxInstanceId)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, errors];
                    case 5:
                        error_6 = _a.sent();
                        this.logger().error("Exception fetching runtime errors:", error_6);
                        return [2 /*return*/, []];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Perform static code analysis on the generated files
     * This helps catch potential issues early in the development process
     */
    SimpleCodeGeneratorAgent.prototype.runStaticAnalysisCode = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sandboxInstanceId, files, analysisResponse, errorMsg, lint, typecheck, lintIssues, lintSummary, typeCheckIssues, typeCheckSummary, error_7, errorMessage;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        sandboxInstanceId = this.state.sandboxInstanceId;
                        if (!sandboxInstanceId) {
                            this.logger().warn("No sandbox instance ID available to lint code.");
                            return [2 /*return*/, { success: false, lint: { issues: [], }, typecheck: { issues: [], } }];
                        }
                        this.logger().info("Linting code in sandbox instance ".concat(sandboxInstanceId));
                        files = this.fileManager.getGeneratedFilePaths();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, ((_a = this.getSandboxServiceClient()) === null || _a === void 0 ? void 0 : _a.runStaticAnalysisCode(sandboxInstanceId, files))];
                    case 2:
                        analysisResponse = _b.sent();
                        if (!analysisResponse || analysisResponse.error) {
                            errorMsg = "Code linting failed: ".concat((analysisResponse === null || analysisResponse === void 0 ? void 0 : analysisResponse.error) || 'Unknown error', ", full response: ").concat(JSON.stringify(analysisResponse));
                            this.logger().error(errorMsg);
                            this.broadcast(constants_1.WebSocketMessageResponses.ERROR, { error: errorMsg, analysisResponse: analysisResponse });
                            throw new Error(errorMsg);
                        }
                        lint = analysisResponse.lint, typecheck = analysisResponse.typecheck;
                        lintIssues = lint.issues, lintSummary = lint.summary;
                        this.logger().info("Linting found ".concat(lintIssues.length, " issues: ") +
                            "".concat((lintSummary === null || lintSummary === void 0 ? void 0 : lintSummary.errorCount) || 0, " errors, ") +
                            "".concat((lintSummary === null || lintSummary === void 0 ? void 0 : lintSummary.warningCount) || 0, " warnings, ") +
                            "".concat((lintSummary === null || lintSummary === void 0 ? void 0 : lintSummary.infoCount) || 0, " info"));
                        typeCheckIssues = typecheck.issues, typeCheckSummary = typecheck.summary;
                        this.logger().info("Typecheck found ".concat(typeCheckIssues.length, " issues: ") +
                            "".concat((typeCheckSummary === null || typeCheckSummary === void 0 ? void 0 : typeCheckSummary.errorCount) || 0, " errors, ") +
                            "".concat((typeCheckSummary === null || typeCheckSummary === void 0 ? void 0 : typeCheckSummary.warningCount) || 0, " warnings, ") +
                            "".concat((typeCheckSummary === null || typeCheckSummary === void 0 ? void 0 : typeCheckSummary.infoCount) || 0, " info"));
                        this.broadcast(constants_1.WebSocketMessageResponses.STATIC_ANALYSIS_RESULTS, {
                            lint: { issues: lintIssues, summary: lintSummary },
                            typecheck: { issues: typeCheckIssues, summary: typeCheckSummary }
                        });
                        return [2 /*return*/, analysisResponse];
                    case 3:
                        error_7 = _b.sent();
                        this.logger().error("Error linting code:", error_7);
                        errorMessage = error_7 instanceof Error ? error_7.message : String(error_7);
                        this.broadcast(constants_1.WebSocketMessageResponses.ERROR, { error: "Failed to lint code: ".concat(errorMessage) });
                        // throw new Error(`Failed to lint code: ${errorMessage}`);
                        return [2 /*return*/, { success: false, lint: { issues: [], }, typecheck: { issues: [], } }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // private async applyFastSmartCodeFixes() : Promise<void> {
    //     try {
    //         const startTime = Date.now();
    //         this.logger().info("Applying fast smart code fixes");
    //         // Get static analysis and do deterministic fixes
    //         const staticAnalysis = await this.runStaticAnalysisCode();
    //         if (staticAnalysis.typecheck.issues.length + staticAnalysis.lint.issues.length == 0) {
    //             this.logger().info("No issues found, skipping fast smart code fixes");
    //             return;
    //         }
    //         const issues = staticAnalysis.typecheck.issues.concat(staticAnalysis.lint.issues);
    //         const allFiles = this.fileManager.getAllFiles();
    //         const context = GenerationContext.from(this.state, this.logger());
    //         const fastCodeFixer = await this.operations.fastCodeFixer.execute({
    //             query: this.state.query,
    //             issues,
    //             allFiles,
    //         }, {
    //             env: this.env,
    //             agentId: this.getAgentId(),
    //             context,
    //             logger: this.logger()
    //         });
    //         if (fastCodeFixer.length > 0) {
    //             this.fileManager.saveGeneratedFiles(fastCodeFixer);
    //             await this.deployToSandbox(fastCodeFixer);
    //             this.logger().info("Fast smart code fixes applied successfully");
    //         }
    //         this.logger().info(`Fast smart code fixes applied in ${Date.now() - startTime}ms`);            
    //     } catch (error) {
    //         this.logger().error("Error applying fast smart code fixes:", error);
    //         const errorMessage = error instanceof Error ? error.message : String(error);
    //         this.broadcast(WebSocketMessageResponses.ERROR, { error: `Failed to apply fast smart code fixes: ${errorMessage}` });
    //         return;
    //     }
    // }
    /**
     * Apply deterministic code fixes for common TypeScript errors
     */
    SimpleCodeGeneratorAgent.prototype.applyDeterministicCodeFixes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var staticAnalysis, typeCheckIssues, allFiles_1, fileFetcher, fixResult, modulesNotFound, moduleNames, installCommands, fixedFiles, error_8;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, this.runStaticAnalysisCode()];
                    case 1:
                        staticAnalysis = _a.sent();
                        if (staticAnalysis.typecheck.issues.length == 0) {
                            this.logger().info("No typecheck issues found, skipping deterministic fixes");
                            return [2 /*return*/, staticAnalysis]; // So that static analysis is not repeated again
                        }
                        typeCheckIssues = staticAnalysis.typecheck.issues;
                        this.broadcast(constants_1.WebSocketMessageResponses.DETERMINISTIC_CODE_FIX_STARTED, {
                            message: "Attempting to fix ".concat(typeCheckIssues.length, " TypeScript issues using deterministic code fixer"),
                            issues: typeCheckIssues
                        });
                        this.logger().info("Attempting to fix ".concat(typeCheckIssues.length, " TypeScript issues using deterministic code fixer"));
                        allFiles_1 = this.fileManager.getAllFiles();
                        fileFetcher = function (filePath) { return __awaiter(_this, void 0, void 0, function () {
                            var result, error_9;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, this.getSandboxServiceClient().getFiles(this.state.sandboxInstanceId, [filePath])];
                                    case 1:
                                        result = _a.sent();
                                        if (result.success && result.files.length > 0) {
                                            this.logger().info("Successfully fetched file: ".concat(filePath));
                                            return [2 /*return*/, {
                                                    filePath: filePath,
                                                    fileContents: result.files[0].fileContents,
                                                    filePurpose: "Fetched file: ".concat(filePath)
                                                }];
                                        }
                                        else {
                                            this.logger().debug("File not found: ".concat(filePath));
                                        }
                                        return [3 /*break*/, 3];
                                    case 2:
                                        error_9 = _a.sent();
                                        this.logger().debug("Failed to fetch file ".concat(filePath, ": ").concat(error_9 instanceof Error ? error_9.message : 'Unknown error'));
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/, null];
                                }
                            });
                        }); };
                        return [4 /*yield*/, (0, code_fixer_1.fixProjectIssues)(allFiles_1.map(function (file) { return ({
                                filePath: file.filePath,
                                fileContents: file.fileContents,
                                filePurpose: ''
                            }); }), typeCheckIssues, fileFetcher)];
                    case 2:
                        fixResult = _a.sent();
                        this.broadcast(constants_1.WebSocketMessageResponses.DETERMINISTIC_CODE_FIX_COMPLETED, {
                            message: "Fixed ".concat(typeCheckIssues.length, " TypeScript issues using deterministic code fixer"),
                            issues: typeCheckIssues,
                            fixResult: fixResult
                        });
                        if (!fixResult) return [3 /*break*/, 7];
                        if (!(fixResult.unfixableIssues.length > 0)) return [3 /*break*/, 5];
                        modulesNotFound = fixResult.unfixableIssues.filter(function (issue) { return issue.issueCode === 'TS2307'; });
                        moduleNames = modulesNotFound.flatMap(function (issue) {
                            var match = issue.reason.match(/External package ["'](.+?)["']/);
                            var name = match === null || match === void 0 ? void 0 : match[1];
                            return (typeof name === 'string' && name.trim().length > 0) ? [name] : [];
                        });
                        if (!(moduleNames.length > 0)) return [3 /*break*/, 4];
                        installCommands = moduleNames.map(function (moduleName) { return "bun install ".concat(moduleName); });
                        return [4 /*yield*/, this.executeCommands(installCommands)];
                    case 3:
                        _a.sent();
                        this.logger().info("Deterministic code fixer installed missing modules: ".concat(moduleNames.join(', ')));
                        return [3 /*break*/, 5];
                    case 4:
                        this.logger().info("Deterministic code fixer detected no external modules to install from unfixable TS2307 issues");
                        _a.label = 5;
                    case 5:
                        if (!(fixResult.modifiedFiles.length > 0)) return [3 /*break*/, 7];
                        this.logger().info("Applying deterministic fixes to files, Fixes: ", JSON.stringify(fixResult, null, 2));
                        fixedFiles = fixResult.modifiedFiles.map(function (file) {
                            var _a;
                            return ({
                                filePath: file.filePath,
                                filePurpose: ((_a = allFiles_1.find(function (f) { return f.filePath === file.filePath; })) === null || _a === void 0 ? void 0 : _a.filePurpose) || '',
                                fileContents: file.fileContents
                            });
                        });
                        this.fileManager.saveGeneratedFiles(fixedFiles);
                        return [4 /*yield*/, this.deployToSandbox(fixedFiles, false, "fix: applied deterministic fixes")];
                    case 6:
                        _a.sent();
                        this.logger().info("Deployed deterministic fixes to sandbox");
                        _a.label = 7;
                    case 7:
                        this.logger().info("Applied deterministic code fixes: ".concat(JSON.stringify(fixResult, null, 2)));
                        return [3 /*break*/, 9];
                    case 8:
                        error_8 = _a.sent();
                        this.logger().error('Error applying deterministic code fixes:', error_8);
                        this.broadcast(constants_1.WebSocketMessageResponses.ERROR, {
                            error: "Deterministic code fixer failed: ".concat(error_8 instanceof Error ? error_8.message : String(error_8))
                        });
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    SimpleCodeGeneratorAgent.prototype.fetchAllIssues = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, runtimeErrors, staticAnalysis, clientErrors;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this.fetchRuntimeErrors(false),
                            this.runStaticAnalysisCode()
                        ])];
                    case 1:
                        _a = _b.sent(), runtimeErrors = _a[0], staticAnalysis = _a[1];
                        clientErrors = this.state.clientReportedErrors;
                        this.logger().info("Fetched all issues:", JSON.stringify({ runtimeErrors: runtimeErrors, staticAnalysis: staticAnalysis, clientErrors: clientErrors }));
                        return [2 /*return*/, { runtimeErrors: runtimeErrors, staticAnalysis: staticAnalysis, clientErrors: clientErrors }];
                }
            });
        });
    };
    SimpleCodeGeneratorAgent.prototype.resetIssues = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger().info("Resetting issues");
                        return [4 /*yield*/, this.getSandboxServiceClient().clearInstanceErrors(this.state.sandboxInstanceId)];
                    case 1:
                        _a.sent();
                        this.setState(__assign(__assign({}, this.state), { clientReportedErrors: [] }));
                        return [2 /*return*/];
                }
            });
        });
    };
    SimpleCodeGeneratorAgent.prototype.deployToSandbox = function () {
        return __awaiter(this, arguments, void 0, function (files, redeploy, commitMessage) {
            var error_10, timeoutPromise, result;
            if (files === void 0) { files = []; }
            if (redeploy === void 0) { redeploy = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.currentDeploymentPromise) return [3 /*break*/, 4];
                        this.logger().info('Deployment already in progress, waiting for completion before starting new deployment');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.currentDeploymentPromise];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_10 = _a.sent();
                        this.logger().warn('Previous deployment failed, proceeding with new deployment:', error_10);
                        return [3 /*break*/, 4];
                    case 4:
                        // Start the actual deployment and track it
                        this.currentDeploymentPromise = this.executeDeployment(files, redeploy, commitMessage);
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, , 7, 8]);
                        timeoutPromise = new Promise(function (_, reject) {
                            setTimeout(function () {
                                reject(new Error('Deployment timed out after 60 seconds'));
                            }, 60000);
                        });
                        return [4 /*yield*/, Promise.race([
                                this.currentDeploymentPromise,
                                timeoutPromise
                            ])];
                    case 6:
                        result = _a.sent();
                        return [2 /*return*/, result];
                    case 7:
                        // Clear the promise when deployment is complete
                        this.currentDeploymentPromise = null;
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    SimpleCodeGeneratorAgent.prototype.createNewDeployment = function () {
        return __awaiter(this, void 0, void 0, function () {
            var templateName, uniqueSuffix, projectName, webhookUrl, createResponse;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        templateName = ((_a = this.state.templateDetails) === null || _a === void 0 ? void 0 : _a.name) || 'scratch';
                        uniqueSuffix = (0, idGenerator_1.generateId)();
                        projectName = "".concat(((_b = this.state.blueprint) === null || _b === void 0 ? void 0 : _b.projectName) || templateName.toLowerCase().replace(/[^a-z0-9]/g, '-'), "-").concat(uniqueSuffix).toLowerCase();
                        webhookUrl = this.generateWebhookUrl();
                        return [4 /*yield*/, this.getSandboxServiceClient().createInstance(templateName, "v1-".concat(projectName), webhookUrl)];
                    case 1:
                        createResponse = _c.sent();
                        if (!createResponse || !createResponse.success || !createResponse.runId) {
                            throw new Error("Failed to create sandbox instance: ".concat((createResponse === null || createResponse === void 0 ? void 0 : createResponse.error) || 'Unknown error'));
                        }
                        this.logger().info("Received createInstance response: ".concat(JSON.stringify(createResponse, null, 2)));
                        if (createResponse.runId && createResponse.previewURL) {
                            this.previewUrlCache = createResponse.previewURL;
                            return [2 /*return*/, createResponse];
                        }
                        throw new Error("Failed to create sandbox instance: ".concat((createResponse === null || createResponse === void 0 ? void 0 : createResponse.error) || 'Unknown error'));
                }
            });
        });
    };
    SimpleCodeGeneratorAgent.prototype.executeDeployment = function () {
        return __awaiter(this, arguments, void 0, function (files, redeploy, commitMessage) {
            var _a, templateDetails, generatedFilesMap, sandboxInstanceId, previewURL, tunnelURL, status, results, checkHealthInterval_1, filesToWrite, writeResponse, preview, error_11, errorMsg;
            var _this = this;
            if (files === void 0) { files = []; }
            if (redeploy === void 0) { redeploy = false; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.state, templateDetails = _a.templateDetails, generatedFilesMap = _a.generatedFilesMap;
                        sandboxInstanceId = this.state.sandboxInstanceId;
                        if (!templateDetails) {
                            this.logger().error("Template details not available for deployment.");
                            this.broadcast(constants_1.WebSocketMessageResponses.ERROR, { error: "Template details not configured." });
                            return [2 /*return*/, null];
                        }
                        this.broadcast(constants_1.WebSocketMessageResponses.DEPLOYMENT_STARTED, {
                            message: "Deploying code to sandbox service",
                            files: files.map(function (file) { return ({
                                filePath: file.filePath,
                            }); })
                        });
                        this.logger().info("Deploying code to sandbox service");
                        if (!sandboxInstanceId) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getSandboxServiceClient().getInstanceStatus(sandboxInstanceId)];
                    case 1:
                        status = _b.sent();
                        if (!status || !status.success || !status.isHealthy) {
                            this.logger().error("DEPLOYMENT CHECK FAILED: Failed to get status for instance ".concat(sandboxInstanceId, ", redeploying..."));
                            sandboxInstanceId = undefined;
                        }
                        else {
                            this.logger().info("DEPLOYMENT CHECK PASSED: Instance ".concat(sandboxInstanceId, " is running, previewURL: ").concat(status.previewURL, ", tunnelURL: ").concat(status.tunnelURL));
                            previewURL = status.previewURL;
                            tunnelURL = status.tunnelURL;
                        }
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 7, , 8]);
                        if (!(!sandboxInstanceId || redeploy)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.createNewDeployment()];
                    case 3:
                        results = _b.sent();
                        if (!results || !results.runId || !results.previewURL) {
                            this.broadcast(constants_1.WebSocketMessageResponses.DEPLOYMENT_FAILED, {
                                message: "Failed to create new deployment",
                            });
                            throw new Error('Failed to create new deployment');
                        }
                        sandboxInstanceId = results.runId;
                        previewURL = results.previewURL;
                        tunnelURL = results.tunnelURL;
                        this.setState(__assign(__assign({}, this.state), { sandboxInstanceId: sandboxInstanceId }));
                        // Run all commands in background
                        this.executeCommands(this.state.commandsHistory || [], 20);
                        checkHealthInterval_1 = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                            var status;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.getSandboxServiceClient().getInstanceStatus(sandboxInstanceId)];
                                    case 1:
                                        status = _a.sent();
                                        if (!(!status || !status.success)) return [3 /*break*/, 3];
                                        this.logger().error("DEPLOYMENT CHECK FAILED: Failed to get status for instance ".concat(sandboxInstanceId, ", redeploying..."));
                                        clearInterval(checkHealthInterval_1);
                                        return [4 /*yield*/, this.executeDeployment([], true)];
                                    case 2:
                                        _a.sent();
                                        _a.label = 3;
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }, 2000);
                        // Launch a static analysis on the codebase in the background to build cache
                        this.runStaticAnalysisCode();
                        _b.label = 4;
                    case 4:
                        filesToWrite = files.length > 0
                            ? files.map(function (file) { return ({
                                filePath: file.filePath,
                                fileContents: file.fileContents
                            }); })
                            : Object.values(generatedFilesMap).map(function (file) { return ({
                                filePath: file.filePath,
                                fileContents: file.fileContents
                            }); });
                        if (!(filesToWrite.length > 0)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.getSandboxServiceClient().writeFiles(sandboxInstanceId, filesToWrite, commitMessage)];
                    case 5:
                        writeResponse = _b.sent();
                        if (!writeResponse || !writeResponse.success) {
                            this.logger().error("File writing failed. Error: ".concat(writeResponse === null || writeResponse === void 0 ? void 0 : writeResponse.error));
                            throw new Error("File writing failed. Error: ".concat(writeResponse === null || writeResponse === void 0 ? void 0 : writeResponse.error));
                        }
                        _b.label = 6;
                    case 6:
                        preview = {
                            runId: sandboxInstanceId,
                            previewURL: previewURL,
                            tunnelURL: tunnelURL,
                        };
                        this.broadcast(constants_1.WebSocketMessageResponses.DEPLOYMENT_COMPLETED, __assign({ message: "Deployment completed" }, preview));
                        return [2 /*return*/, preview];
                    case 7:
                        error_11 = _b.sent();
                        this.logger().error("Error deploying to sandbox service:", error_11);
                        errorMsg = error_11 instanceof Error ? error_11.message : String(error_11);
                        if (errorMsg.includes('Network connection lost')) {
                            // For this particular error, reset the sandbox sessionId
                            this.resetSessionId();
                        }
                        this.setState(__assign(__assign({}, this.state), { sandboxInstanceId: undefined }));
                        this.broadcast(constants_1.WebSocketMessageResponses.DEPLOYMENT_FAILED, {
                            error: "Error deploying to sandbox service: ".concat(errorMsg),
                        });
                        return [2 /*return*/, this.deployToSandbox()];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Deploy the generated code to Cloudflare Workers
     */
    SimpleCodeGeneratorAgent.prototype.deployToCloudflare = function () {
        return __awaiter(this, void 0, void 0, function () {
            var deploymentResult, deploymentUrl, appService, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        this.logger().info('Starting Cloudflare deployment');
                        this.broadcast(constants_1.WebSocketMessageResponses.CLOUDFLARE_DEPLOYMENT_STARTED, {
                            message: 'Starting deployment to Cloudflare Workers...',
                            instanceId: this.state.sandboxInstanceId,
                        });
                        // Check if we have generated files
                        if (!this.state.generatedFilesMap || Object.keys(this.state.generatedFilesMap).length === 0) {
                            this.logger().error('No generated files available for deployment');
                            this.broadcast(constants_1.WebSocketMessageResponses.CLOUDFLARE_DEPLOYMENT_ERROR, {
                                message: 'Deployment failed: No generated code available',
                                error: 'No files have been generated yet'
                            });
                            return [2 /*return*/, null];
                        }
                        if (!!this.state.sandboxInstanceId) return [3 /*break*/, 2];
                        this.logger().info('[DeployToCloudflare] No sandbox instance ID available, will initiate deployment');
                        // Need to redeploy
                        return [4 /*yield*/, this.deployToSandbox()];
                    case 1:
                        // Need to redeploy
                        _a.sent();
                        if (!this.state.sandboxInstanceId) {
                            this.logger().error('[DeployToCloudflare] Failed to deploy to sandbox service');
                            this.broadcast(constants_1.WebSocketMessageResponses.CLOUDFLARE_DEPLOYMENT_ERROR, {
                                message: 'Deployment failed: Failed to deploy to sandbox service',
                                error: 'Sandbox service unavailable'
                            });
                            return [2 /*return*/, null];
                        }
                        _a.label = 2;
                    case 2:
                        this.logger().info('[DeployToCloudflare] Prerequisites met, initiating deployment', {
                            sandboxInstanceId: this.state.sandboxInstanceId,
                            fileCount: Object.keys(this.state.generatedFilesMap).length
                        });
                        return [4 /*yield*/, this.getSandboxServiceClient().deployToCloudflareWorkers(this.state.sandboxInstanceId)];
                    case 3:
                        deploymentResult = _a.sent();
                        this.logger().info('[DeployToCloudflare] Deployment result:', deploymentResult);
                        if (!deploymentResult) {
                            this.logger().error('[DeployToCloudflare] Deployment API call failed');
                            this.broadcast(constants_1.WebSocketMessageResponses.CLOUDFLARE_DEPLOYMENT_ERROR, {
                                message: 'Deployment failed: API call returned null',
                                error: 'Deployment service unavailable'
                            });
                            return [2 /*return*/, null];
                        }
                        if (!deploymentResult.success) {
                            this.logger().error('Deployment failed', {
                                message: deploymentResult.message,
                                error: deploymentResult.error
                            });
                            this.broadcast(constants_1.WebSocketMessageResponses.CLOUDFLARE_DEPLOYMENT_ERROR, {
                                message: "Deployment failed: ".concat(deploymentResult.message),
                                error: deploymentResult.error || 'Unknown deployment error'
                            });
                            return [2 /*return*/, null];
                        }
                        deploymentUrl = deploymentResult.deployedUrl;
                        this.logger().info('[DeployToCloudflare] Cloudflare deployment completed successfully', {
                            deploymentUrl: deploymentUrl,
                            deploymentId: deploymentResult.deploymentId,
                            sandboxInstanceId: this.state.sandboxInstanceId,
                            message: deploymentResult.message
                        });
                        appService = new database_1.AppService(this.env);
                        // Update cloudflare URL in database
                        return [4 /*yield*/, appService.updateDeploymentId(this.getAgentId(), deploymentResult.deploymentId || '')];
                    case 4:
                        // Update cloudflare URL in database
                        _a.sent();
                        // Broadcast success message
                        this.broadcast(constants_1.WebSocketMessageResponses.CLOUDFLARE_DEPLOYMENT_COMPLETED, {
                            message: deploymentResult.message || 'Successfully deployed to Cloudflare Workers!',
                            deploymentUrl: deploymentUrl
                        });
                        return [2 /*return*/, { deploymentUrl: deploymentUrl }];
                    case 5:
                        error_12 = _a.sent();
                        // return ErrorHandler.handleOperationError(
                        //     this.logger(),
                        //     this,
                        //     'Cloudflare deployment',
                        //     error,
                        //     WebSocketMessageResponses.CLOUDFLARE_DEPLOYMENT_ERROR
                        // );
                        this.logger().error('Cloudflare deployment failed', error_12);
                        this.broadcast(constants_1.WebSocketMessageResponses.CLOUDFLARE_DEPLOYMENT_ERROR, {
                            message: "Deployment failed: ".concat(error_12 instanceof Error ? error_12.message : 'Unknown error'),
                            error: error_12 instanceof Error ? error_12.message : 'Unknown error'
                        });
                        return [2 /*return*/, null];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    // async analyzeScreenshot(): Promise<ScreenshotAnalysisType | null> {
    //     const screenshotData = this.state.latestScreenshot;
    //     if (!screenshotData) {
    //         this.logger().warn('No screenshot available for analysis');
    //         return null;
    //     }
    //     const context = GenerationContext.from(this.state, this.logger());    
    //     const result = await this.operations.analyzeScreenshot.execute(
    //         {screenshotData},
    //         {
    //             env: this.env,
    //             agentId: this.getAgentId(),
    //             context,
    //             logger: this.logger(),
    //             inferenceContext: this.state.inferenceContext,
    //         }
    //     );
    //     return result || null;
    // }
    SimpleCodeGeneratorAgent.prototype.waitForGeneration = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.state.generationPromise) return [3 /*break*/, 5];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.state.generationPromise];
                    case 2:
                        _a.sent();
                        this.logger().info("Code generation completed successfully");
                        return [3 /*break*/, 4];
                    case 3:
                        error_13 = _a.sent();
                        this.logger().error("Error during code generation:", error_13);
                        return [3 /*break*/, 4];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        this.logger().error("No generation process found");
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    SimpleCodeGeneratorAgent.prototype.getNextAction = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, { action: 'No action', data: {} }];
            });
        });
    };
    SimpleCodeGeneratorAgent.prototype.onMessage = function (connection, message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                (0, websocket_1.handleWebSocketMessage)(this, connection, message);
                return [2 /*return*/];
            });
        });
    };
    SimpleCodeGeneratorAgent.prototype.onClose = function (connection) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                (0, websocket_1.handleWebSocketClose)(connection);
                return [2 /*return*/];
            });
        });
    };
    SimpleCodeGeneratorAgent.prototype.broadcast = function (typeOrMsg, dataOrWithout) {
        // Send the event to the conversational assistant if its a relevant event
        if (this.operations.processUserMessage.isProjectUpdateType(typeOrMsg)) {
            var messages = this.operations.processUserMessage.processProjectUpdates(typeOrMsg, dataOrWithout, this.logger());
            this.setState(__assign(__assign({}, this.state), { conversationMessages: __spreadArray(__spreadArray([], this.state.conversationMessages, true), messages, true) }));
        }
        (0, websocket_1.broadcastToConnections)(this, typeOrMsg, dataOrWithout);
    };
    /**
     * Handle HTTP requests to this agent instance
     * Includes webhook processing for internal requests
     */
    SimpleCodeGeneratorAgent.prototype.fetch = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var url, pathname;
            return __generator(this, function (_a) {
                url = new URL(request.url);
                pathname = url.pathname;
                // Handle internal webhook requests
                if (pathname.startsWith('/webhook/')) {
                    return [2 /*return*/, this.handleWebhook(request)];
                }
                // Delegate to parent class for other requests
                return [2 /*return*/, _super.prototype.fetch.call(this, request)];
            });
        });
    };
    /**
     * Generate webhook URL for this agent instance
     */
    SimpleCodeGeneratorAgent.prototype.generateWebhookUrl = function () {
        // Use the agent's session ID as the agent identifier
        var agentId = this.getAgentId() || 'unknown';
        // Generate webhook URL with agent ID for routing
        return "".concat((0, urls_1.getProtocolForHost)(this.state.hostname), "://").concat(this.state.hostname, "/api/webhook/sandbox/").concat(agentId, "/runtime_error");
    };
    /**
     * Handle webhook events from sandbox service
     */
    SimpleCodeGeneratorAgent.prototype.handleWebhook = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var url, pathParts, eventType, payload, event, context, source, error_14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        url = new URL(request.url);
                        pathParts = url.pathname.split('/');
                        eventType = pathParts[pathParts.length - 1];
                        this.logger().info('Received webhook from sandbox service', {
                            eventType: eventType,
                            agentId: this.getAgentId()
                        });
                        return [4 /*yield*/, request.json()];
                    case 1:
                        payload = _a.sent();
                        event = payload.event, context = payload.context, source = payload.source;
                        if (source !== 'webhook') {
                            return [2 /*return*/, new Response('Invalid source', { status: 400 })];
                        }
                        // Process the webhook event
                        return [4 /*yield*/, this.processWebhookEvent(event, context)];
                    case 2:
                        // Process the webhook event
                        _a.sent();
                        return [2 /*return*/, new Response(JSON.stringify({ success: true }), {
                                headers: { 'Content-Type': 'application/json' },
                                status: 200
                            })];
                    case 3:
                        error_14 = _a.sent();
                        this.logger().error('Error handling webhook', error_14);
                        return [2 /*return*/, new Response('Internal server error', { status: 500 })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Process webhook events and trigger appropriate actions
     */
    SimpleCodeGeneratorAgent.prototype.processWebhookEvent = function (event, context) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_15;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        _a = event.eventType;
                        switch (_a) {
                            case 'runtime_error': return [3 /*break*/, 1];
                        }
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.handleRuntimeErrorWebhook(event, context)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        this.logger().warn('Unhandled webhook event type', { eventType: event.eventType });
                        _b.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_15 = _b.sent();
                        this.logger().error('Error processing webhook event', error_15);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle runtime error webhook events
     */
    SimpleCodeGeneratorAgent.prototype.handleRuntimeErrorWebhook = function (event, _context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!event.payload.error) {
                    this.logger().error('Invalid runtime error event: No error provided');
                    return [2 /*return*/];
                }
                this.logger().info('Processing runtime error webhook', {
                    errorMessage: event.payload.error.message,
                    runId: event.payload.runId,
                    instanceId: event.instanceId
                });
                // Broadcast runtime error to connected clients
                this.broadcast(constants_1.WebSocketMessageResponses.RUNTIME_ERROR_FOUND, {
                    error: event.payload.error,
                    runId: event.payload.runId,
                    instanceInfo: event.payload.instanceInfo,
                    instanceId: event.instanceId,
                    timestamp: event.timestamp,
                    source: 'webhook'
                });
                return [2 /*return*/];
            });
        });
    };
    // /**
    //  * Get project dependencies from state and package.json
    //  */
    // private getDependencies(): Record<string, string> {
    //     const state = this.state;
    //     const deps = state.templateDetails?.deps || {};
    //     // Add additional dependencies from the last package.json
    //     if (state.lastPackageJson) {
    //         const parsedPackageJson = JSON.parse(state.lastPackageJson);
    //         Object.assign(deps, parsedPackageJson.dependencies as Record<string, string>);
    //         this.logger().info(`Adding dependencies from last package.json: ${Object.keys(parsedPackageJson.dependencies).join(', ')}`);
    //     }
    //     return deps;
    // }
    /**
     * Execute commands with retry logic
     * Chunks commands and retries failed ones with AI assistance
     */
    SimpleCodeGeneratorAgent.prototype.executeCommands = function (commands_1) {
        return __awaiter(this, arguments, void 0, function (commands, chunkSize) {
            var state, commandChunks, i, successfulCommands, _i, commandChunks_1, chunk, currentChunk, i, resp, successful, failures, newCommands, error_16, failedCommands;
            if (chunkSize === void 0) { chunkSize = 5; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        state = this.state;
                        if (!state.sandboxInstanceId) {
                            this.logger().warn('No sandbox instance available for executing commands');
                            return [2 /*return*/];
                        }
                        // Sanitize and prepare commands
                        commands = commands.join('\n').split('\n').filter(function (cmd) { return cmd.trim() !== ''; }).filter(function (cmd) { return (0, common_1.looksLikeCommand)(cmd) && !cmd.includes(' undefined'); });
                        if (commands.length === 0) {
                            this.logger().warn("No commands to execute");
                            return [2 /*return*/];
                        }
                        commands = commands.map(function (cmd) { return cmd.trim().replace(/^\s*-\s*/, '').replace(/^npm/, 'bun'); });
                        this.logger().info("AI suggested ".concat(commands.length, " commands to run: ").concat(commands.join(", ")));
                        commandChunks = [];
                        for (i = 0; i < commands.length; i += chunkSize) {
                            commandChunks.push(commands.slice(i, i + chunkSize));
                        }
                        successfulCommands = [];
                        _i = 0, commandChunks_1 = commandChunks;
                        _a.label = 1;
                    case 1:
                        if (!(_i < commandChunks_1.length)) return [3 /*break*/, 9];
                        chunk = commandChunks_1[_i];
                        currentChunk = chunk;
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < 3 && currentChunk.length > 0)) return [3 /*break*/, 8];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 6, , 7]);
                        this.broadcast(constants_1.WebSocketMessageResponses.COMMAND_EXECUTING, {
                            message: "Executing commands",
                            commands: currentChunk
                        });
                        return [4 /*yield*/, this.getSandboxServiceClient().executeCommands(state.sandboxInstanceId, currentChunk)];
                    case 4:
                        resp = _a.sent();
                        if (!resp || !resp.results) {
                            this.logger().error('Failed to execute commands');
                            return [2 /*return*/];
                        }
                        successful = resp.results.filter(function (r) { return r.success; });
                        failures = resp.results.filter(function (r) { return !r.success; });
                        if (successful.length > 0) {
                            this.logger().info("Commands executed successfully: ".concat(currentChunk.join(", ")));
                            successfulCommands.push.apply(successfulCommands, successful.map(function (r) { return r.command; }));
                            if (successful.length === currentChunk.length) {
                                this.logger().info("All commands executed successfully in this chunk: ".concat(currentChunk.join(", ")));
                                return [3 /*break*/, 8];
                            }
                        }
                        if (failures.length > 0) {
                            this.logger().warn("Some commands failed to execute: ".concat(failures.map(function (r) { return r.command; }).join(", "), ", will retry"));
                        }
                        else {
                            this.logger().error("This should never happen, while executing commands ".concat(currentChunk.join(", "), ", response: ").concat(JSON.stringify(resp)));
                        }
                        return [4 /*yield*/, this.getProjectSetupAssistant().generateSetupCommands("The following failures were reported: ".concat(failures.length > 0 ? JSON.stringify(failures, null, 2) : currentChunk.join(", "), ". The following commands were successful: ").concat(successful.map(function (r) { return r.command; }).join(", ")))];
                    case 5:
                        newCommands = _a.sent();
                        if (newCommands === null || newCommands === void 0 ? void 0 : newCommands.commands) {
                            this.logger().info("Generated new commands: ".concat(newCommands.commands.join(", ")));
                            this.broadcast(constants_1.WebSocketMessageResponses.COMMAND_EXECUTING, {
                                message: "Executing regenerated commands",
                                commands: newCommands.commands
                            });
                            currentChunk = newCommands.commands.filter(common_1.looksLikeCommand);
                        }
                        else {
                            return [3 /*break*/, 8];
                        }
                        this.broadcast(constants_1.WebSocketMessageResponses.ERROR, {
                            error: "Failed to execute commands: ".concat(failures.map(function (r) { return r.command; }).join(", ")),
                            failures: failures
                        });
                        return [3 /*break*/, 7];
                    case 6:
                        error_16 = _a.sent();
                        this.logger().error('Error executing commands:', error_16);
                        return [3 /*break*/, 7];
                    case 7:
                        i++;
                        return [3 /*break*/, 2];
                    case 8:
                        _i++;
                        return [3 /*break*/, 1];
                    case 9:
                        failedCommands = commands.filter(function (cmd) { return !successfulCommands.includes(cmd); });
                        if (failedCommands.length > 0) {
                            this.logger().warn("Failed to execute commands: ".concat(failedCommands.join(", ")));
                            this.broadcast(constants_1.WebSocketMessageResponses.ERROR, {
                                error: "Failed to execute commands: ".concat(failedCommands.join(", "))
                            });
                        }
                        else {
                            this.logger().info("All commands executed successfully: ".concat(successfulCommands.join(", ")));
                        }
                        // Add commands to history
                        this.setState(__assign(__assign({}, this.state), { commandsHistory: __spreadArray(__spreadArray([], (this.state.commandsHistory || []), true), successfulCommands, true) }));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete files from the file manager
     */
    SimpleCodeGeneratorAgent.prototype.deleteFiles = function (filePaths) {
        return __awaiter(this, void 0, void 0, function () {
            var deleteCommands, _i, filePaths_1, filePath, error_17;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        deleteCommands = [];
                        for (_i = 0, filePaths_1 = filePaths; _i < filePaths_1.length; _i++) {
                            filePath = filePaths_1[_i];
                            deleteCommands.push("rm ".concat(filePath));
                        }
                        // Remove the files from file manager
                        this.fileManager.deleteFiles(filePaths);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.executeCommands(deleteCommands)];
                    case 2:
                        _a.sent();
                        this.logger().info("Deleted ".concat(filePaths.length, " files: ").concat(filePaths.join(", ")));
                        return [3 /*break*/, 4];
                    case 3:
                        error_17 = _a.sent();
                        this.logger().error('Error deleting files:', error_17);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Export generated code to a GitHub repository
     * Creates repository and pushes all generated files
     */
    SimpleCodeGeneratorAgent.prototype.pushToGitHub = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var exportResult, readmeFile, error_18, appService, error_19;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 10, , 11]);
                        this.logger().info('Starting GitHub export', {
                            fileCount: Object.keys(this.state.generatedFilesMap).length
                        });
                        // Check if we have generated files
                        if (!this.state.generatedFilesMap || Object.keys(this.state.generatedFilesMap).length === 0) {
                            throw new Error('No generated files available for export');
                        }
                        // Broadcast export started
                        this.broadcast(constants_1.WebSocketMessageResponses.GITHUB_EXPORT_STARTED, {
                            message: "Starting GitHub export to repository \"".concat(options.cloneUrl, "\""),
                            repositoryName: options.repositoryHtmlUrl,
                            isPrivate: options.isPrivate
                        });
                        // Update progress for creating repository
                        this.broadcast(constants_1.WebSocketMessageResponses.GITHUB_EXPORT_PROGRESS, {
                            message: 'Uploading to GitHub repository...',
                            step: 'uploading_files',
                            progress: 30
                        });
                        return [4 /*yield*/, this.getSandboxServiceClient().pushToGitHub(this.state.sandboxInstanceId, options)];
                    case 1:
                        exportResult = _a.sent();
                        if (!(exportResult === null || exportResult === void 0 ? void 0 : exportResult.success)) {
                            throw new Error("Failed to export to GitHub repository: ".concat(exportResult === null || exportResult === void 0 ? void 0 : exportResult.error));
                        }
                        this.logger().info('GitHub export completed successfully', { options: options, commitSha: exportResult.commitSha });
                        readmeFile = this.fileManager.getFile('README.md');
                        if (!readmeFile) return [3 /*break*/, 7];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 5, , 6]);
                        readmeFile.fileContents = readmeFile.fileContents.replaceAll('[cloudflarebutton]', (0, deployToCf_1.prepareCloudflareButton)(options.repositoryHtmlUrl, 'markdown'));
                        this.fileManager.saveGeneratedFile(readmeFile);
                        return [4 /*yield*/, this.deployToSandbox([readmeFile], false, "feat: README updated with cloudflare deploy button")];
                    case 3:
                        _a.sent();
                        // Export again
                        return [4 /*yield*/, this.getSandboxServiceClient().pushToGitHub(this.state.sandboxInstanceId, options)];
                    case 4:
                        // Export again
                        _a.sent();
                        this.logger().info('Readme committed successfully');
                        return [3 /*break*/, 6];
                    case 5:
                        error_18 = _a.sent();
                        this.logger().error('Failed to commit readme', error_18);
                        return [3 /*break*/, 6];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        this.logger().info('Readme not found, skipping commit');
                        _a.label = 8;
                    case 8:
                        // Step 3: Finalize
                        this.broadcast(constants_1.WebSocketMessageResponses.GITHUB_EXPORT_PROGRESS, {
                            message: 'Finalizing GitHub export...',
                            step: 'finalizing',
                            progress: 90
                        });
                        this.logger().info('Finalizing GitHub export...');
                        appService = new database_1.AppService(this.env);
                        // Update database with GitHub repository URL and visibility
                        return [4 /*yield*/, appService.updateGitHubRepository(this.getAgentId() || '', options.repositoryHtmlUrl || '', options.isPrivate ? 'private' : 'public')];
                    case 9:
                        // Update database with GitHub repository URL and visibility
                        _a.sent();
                        // Broadcast success
                        this.broadcast(constants_1.WebSocketMessageResponses.GITHUB_EXPORT_COMPLETED, {
                            message: "Successfully exported to GitHub repository: ".concat(options.repositoryHtmlUrl),
                            repositoryUrl: options.repositoryHtmlUrl
                        });
                        this.logger().info('GitHub export completed successfully', { repositoryUrl: options.repositoryHtmlUrl });
                        return [2 /*return*/, { success: true, repositoryUrl: options.repositoryHtmlUrl }];
                    case 10:
                        error_19 = _a.sent();
                        this.logger().error('GitHub export failed', error_19);
                        this.broadcast(constants_1.WebSocketMessageResponses.GITHUB_EXPORT_ERROR, {
                            message: "GitHub export failed: ".concat(error_19 instanceof Error ? error_19.message : 'Unknown error'),
                            error: error_19 instanceof Error ? error_19.message : 'Unknown error'
                        });
                        return [2 /*return*/, { success: false, repositoryUrl: options.repositoryHtmlUrl }];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle user input during conversational code generation
     * Processes user messages and updates pendingUserInputs state
     */
    SimpleCodeGeneratorAgent.prototype.handleUserInput = function (userMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var context, conversationalResponse, conversationResponse, messages, updatedPendingInputs, error_20;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.logger().info('Processing user input message', {
                            messageLength: userMessage.length,
                            pendingInputsCount: this.state.pendingUserInputs.length
                        });
                        context = GenerationContext_1.GenerationContext.from(this.state, this.logger());
                        return [4 /*yield*/, this.operations.processUserMessage.execute({
                                userMessage: userMessage,
                                pastMessages: this.state.conversationMessages,
                                conversationResponseCallback: function (message, conversationId, isStreaming, tool) {
                                    _this.broadcast(constants_1.WebSocketMessageResponses.CONVERSATION_RESPONSE, {
                                        message: message,
                                        conversationId: conversationId,
                                        isStreaming: isStreaming,
                                        tool: tool,
                                    });
                                }
                            }, { env: this.env, agentId: this.getAgentId(), context: context, logger: this.logger(), inferenceContext: this.state.inferenceContext })];
                    case 1:
                        conversationalResponse = _a.sent();
                        conversationResponse = conversationalResponse.conversationResponse, messages = conversationalResponse.messages;
                        this.setState(__assign(__assign({}, this.state), { conversationMessages: messages }));
                        if (conversationResponse.enhancedUserRequest.length > 0) {
                            this.rechargePhasesCounter(3);
                            updatedPendingInputs = __spreadArray(__spreadArray([], this.state.pendingUserInputs, true), [
                                conversationResponse.enhancedUserRequest
                            ], false);
                            // Update state with new pending input
                            this.setState(__assign(__assign({}, this.state), { pendingUserInputs: updatedPendingInputs }));
                        }
                        if (!this.isGenerating) {
                            // If idle, start generation process
                            this.logger().info('User input during IDLE state, starting generation');
                            this.generateAllFiles().catch(function (error) {
                                _this.logger().error('Error starting generation from user input:', error);
                            });
                        }
                        this.logger().info('User input processed successfully', {
                            responseLength: conversationResponse.userResponse.length,
                            enhancedRequestLength: conversationResponse.enhancedUserRequest.length,
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_20 = _a.sent();
                        this.logger().error('Error handling user input:', error_20);
                        if (error_20 instanceof errors_1.RateLimitExceededError) {
                            this.broadcast(constants_1.WebSocketMessageResponses.RATE_LIMIT_ERROR, error_20);
                            return [2 /*return*/];
                        }
                        this.broadcast(constants_1.WebSocketMessageResponses.ERROR, {
                            error: "Error processing user input: ".concat(error_20 instanceof Error ? error_20.message : String(error_20))
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Capture screenshot of the given URL using Cloudflare Browser Rendering REST API
     */
    SimpleCodeGeneratorAgent.prototype.captureScreenshot = function (url_1) {
        return __awaiter(this, arguments, void 0, function (url, viewport) {
            var error, apiUrl, response, errorText, error, result, error, base64Screenshot, fileStamp, fileBase, publicUrl, imgErr_1, r2Key, r2Err_1, appService, dbError_1, error, error_21, errorMessage;
            if (viewport === void 0) { viewport = { width: 1280, height: 720 }; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!url) {
                            error = 'URL is required for screenshot capture';
                            this.broadcast(constants_1.WebSocketMessageResponses.SCREENSHOT_CAPTURE_ERROR, {
                                error: error,
                                url: url,
                                viewport: viewport
                            });
                            throw new Error(error);
                        }
                        this.logger().info('Capturing screenshot via REST API', { url: url, viewport: viewport });
                        // Notify start of screenshot capture
                        this.broadcast(constants_1.WebSocketMessageResponses.SCREENSHOT_CAPTURE_STARTED, {
                            message: "Capturing screenshot of ".concat(url),
                            url: url,
                            viewport: viewport
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 18, , 19]);
                        apiUrl = "https://api.cloudflare.com/client/v4/accounts/".concat(this.env.CLOUDFLARE_ACCOUNT_ID, "/browser-rendering/snapshot");
                        return [4 /*yield*/, fetch(apiUrl, {
                                method: 'POST',
                                headers: {
                                    'Authorization': "Bearer ".concat(this.env.CLOUDFLARE_API_TOKEN),
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    url: url,
                                    viewport: viewport,
                                    gotoOptions: {
                                        waitUntil: 'networkidle0',
                                        timeout: 30000
                                    },
                                    screenshotOptions: {
                                        fullPage: false,
                                        type: 'png'
                                    }
                                }),
                            })];
                    case 2:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.text()];
                    case 3:
                        errorText = _a.sent();
                        error = "Browser Rendering API failed: ".concat(response.status, " - ").concat(errorText);
                        this.broadcast(constants_1.WebSocketMessageResponses.SCREENSHOT_CAPTURE_ERROR, {
                            error: error,
                            url: url,
                            viewport: viewport,
                            statusCode: response.status,
                            statusText: response.statusText
                        });
                        throw new Error(error);
                    case 4: return [4 /*yield*/, response.json()];
                    case 5:
                        result = _a.sent();
                        if (!result.success || !result.result.screenshot) {
                            error = 'Browser Rendering API succeeded but no screenshot returned';
                            this.broadcast(constants_1.WebSocketMessageResponses.SCREENSHOT_CAPTURE_ERROR, {
                                error: error,
                                url: url,
                                viewport: viewport,
                                apiResponse: result
                            });
                            throw new Error(error);
                        }
                        base64Screenshot = result.result.screenshot;
                        fileStamp = Date.now();
                        fileBase = "".concat(this.getAgentId(), "-").concat(fileStamp);
                        publicUrl = null;
                        _a.label = 6;
                    case 6:
                        _a.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, this.uploadScreenshotToCloudflareImages(base64Screenshot, "".concat(fileBase, ".png"))];
                    case 7:
                        publicUrl = _a.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        imgErr_1 = _a.sent();
                        this.logger().warn('Cloudflare Images upload failed, will try R2 fallback', { error: imgErr_1 instanceof Error ? imgErr_1.message : String(imgErr_1) });
                        return [3 /*break*/, 9];
                    case 9:
                        if (!!publicUrl) return [3 /*break*/, 13];
                        _a.label = 10;
                    case 10:
                        _a.trys.push([10, 12, , 13]);
                        r2Key = "screenshots/".concat(this.getAgentId(), "/").concat(fileBase, ".png");
                        return [4 /*yield*/, this.uploadScreenshotToR2(base64Screenshot, r2Key)];
                    case 11:
                        publicUrl = _a.sent();
                        return [3 /*break*/, 13];
                    case 12:
                        r2Err_1 = _a.sent();
                        this.logger().warn('R2 upload fallback failed, will store as data URL', { error: r2Err_1 instanceof Error ? r2Err_1.message : String(r2Err_1) });
                        return [3 /*break*/, 13];
                    case 13:
                        // 3) Fallback: store data URL directly in DB
                        if (!publicUrl) {
                            publicUrl = "data:image/png;base64,".concat(base64Screenshot);
                        }
                        _a.label = 14;
                    case 14:
                        _a.trys.push([14, 16, , 17]);
                        appService = new database_1.AppService(this.env);
                        return [4 /*yield*/, appService.updateAppScreenshot(this.getAgentId(), publicUrl)];
                    case 15:
                        _a.sent();
                        return [3 /*break*/, 17];
                    case 16:
                        dbError_1 = _a.sent();
                        error = "Database update failed: ".concat(dbError_1 instanceof Error ? dbError_1.message : 'Unknown database error');
                        this.broadcast(constants_1.WebSocketMessageResponses.SCREENSHOT_CAPTURE_ERROR, {
                            error: error,
                            url: url,
                            viewport: viewport,
                            screenshotCaptured: true,
                            databaseError: true
                        });
                        throw new Error(error);
                    case 17:
                        this.logger().info('Screenshot captured and stored successfully', {
                            url: url,
                            storage: publicUrl.startsWith('data:') ? 'database' : (publicUrl.includes('/api/screenshots/') ? 'r2' : 'images'),
                            length: base64Screenshot.length
                        });
                        // Notify successful screenshot capture
                        this.broadcast(constants_1.WebSocketMessageResponses.SCREENSHOT_CAPTURE_SUCCESS, {
                            message: "Successfully captured screenshot of ".concat(url),
                            url: url,
                            viewport: viewport,
                            screenshotSize: base64Screenshot.length,
                            timestamp: new Date().toISOString()
                        });
                        return [2 /*return*/, publicUrl];
                    case 18:
                        error_21 = _a.sent();
                        this.logger().error('Failed to capture screenshot via REST API:', error_21);
                        errorMessage = error_21 instanceof Error ? error_21.message : 'Unknown error';
                        if (!errorMessage.includes('Browser Rendering API') && !errorMessage.includes('Database update failed')) {
                            this.broadcast(constants_1.WebSocketMessageResponses.SCREENSHOT_CAPTURE_ERROR, {
                                error: errorMessage,
                                url: url,
                                viewport: viewport
                            });
                        }
                        throw new Error("Screenshot capture failed: ".concat(error_21 instanceof Error ? error_21.message : 'Unknown error'));
                    case 19: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Save screenshot data to database - now triggers server-side screenshot capture
     */
    SimpleCodeGeneratorAgent.prototype.saveScreenshotToDatabase = function (screenshotData) {
        return __awaiter(this, void 0, void 0, function () {
            var error, screenshotUrl, error_22;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.env.DB || !this.getAgentId()) {
                            error = 'Cannot capture screenshot: DB or agentId not available';
                            this.logger().warn(error);
                            this.broadcast(constants_1.WebSocketMessageResponses.SCREENSHOT_CAPTURE_ERROR, {
                                error: error,
                                url: screenshotData.url,
                                viewport: screenshotData.viewport,
                                configurationError: true
                            });
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.captureScreenshot(screenshotData.url, screenshotData.viewport)];
                    case 2:
                        screenshotUrl = _a.sent();
                        this.logger().info('Screenshot captured and saved successfully', {
                            url: screenshotData.url,
                            viewport: screenshotData.viewport,
                            timestamp: screenshotData.timestamp,
                            screenshotUrl: screenshotUrl
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_22 = _a.sent();
                        this.logger().error('Failed to capture and save screenshot:', error_22);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute a terminal command received from the frontend
     * Uses the same infrastructure as the existing executeCommands method
     */
    SimpleCodeGeneratorAgent.prototype.executeTerminalCommand = function (command, connection) {
        return __awaiter(this, void 0, void 0, function () {
            var serverLogMessage, sanitizedCommand, state, resp, _i, _a, result, outputMessage, errorMessage, exitCodeMessage, error_23, errorMessage;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        this.logger().info('Executing terminal command', { command: command });
                        serverLogMessage = {
                            message: "Executing command: ".concat(command),
                            level: 'info',
                            timestamp: Date.now(),
                            source: 'terminal'
                        };
                        if (connection) {
                            this.sendToConnection(connection, constants_1.WebSocketMessageResponses.SERVER_LOG, serverLogMessage);
                        }
                        else {
                            this.broadcast(constants_1.WebSocketMessageResponses.SERVER_LOG, serverLogMessage);
                        }
                        sanitizedCommand = command.trim();
                        if (!sanitizedCommand) {
                            throw new Error('Empty command');
                        }
                        state = this.state;
                        if (!state.sandboxInstanceId) {
                            throw new Error('No sandbox instance available for executing commands');
                        }
                        // Use the existing sandbox service to execute the command
                        this.broadcast(constants_1.WebSocketMessageResponses.COMMAND_EXECUTING, {
                            message: "Executing terminal command",
                            commands: [sanitizedCommand]
                        });
                        return [4 /*yield*/, this.getSandboxServiceClient().executeCommands(state.sandboxInstanceId, [sanitizedCommand])];
                    case 1:
                        resp = _b.sent();
                        if (!resp || !resp.results) {
                            throw new Error('Failed to execute command');
                        }
                        // Send the command output back to terminal
                        for (_i = 0, _a = resp.results; _i < _a.length; _i++) {
                            result = _a[_i];
                            if (result.output) {
                                outputMessage = {
                                    output: result.output,
                                    outputType: result.success ? 'stdout' : 'stderr',
                                    timestamp: Date.now()
                                };
                                if (connection) {
                                    this.sendToConnection(connection, constants_1.WebSocketMessageResponses.TERMINAL_OUTPUT, outputMessage);
                                }
                                else {
                                    this.broadcast(constants_1.WebSocketMessageResponses.TERMINAL_OUTPUT, outputMessage);
                                }
                            }
                            if (result.error) {
                                errorMessage = {
                                    output: result.error,
                                    outputType: 'stderr',
                                    timestamp: Date.now()
                                };
                                if (connection) {
                                    this.sendToConnection(connection, constants_1.WebSocketMessageResponses.TERMINAL_OUTPUT, errorMessage);
                                }
                                else {
                                    this.broadcast(constants_1.WebSocketMessageResponses.TERMINAL_OUTPUT, errorMessage);
                                }
                            }
                            // Show exit code if non-zero
                            if (result.exitCode !== 0) {
                                exitCodeMessage = {
                                    output: "Command exited with code ".concat(result.exitCode),
                                    outputType: 'stderr',
                                    timestamp: Date.now()
                                };
                                if (connection) {
                                    this.sendToConnection(connection, constants_1.WebSocketMessageResponses.TERMINAL_OUTPUT, exitCodeMessage);
                                }
                                else {
                                    this.broadcast(constants_1.WebSocketMessageResponses.TERMINAL_OUTPUT, exitCodeMessage);
                                }
                            }
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_23 = _b.sent();
                        this.logger().error('Error executing terminal command:', error_23);
                        errorMessage = {
                            output: "Error: ".concat(error_23 instanceof Error ? error_23.message : String(error_23)),
                            outputType: 'stderr',
                            timestamp: Date.now()
                        };
                        if (connection) {
                            this.sendToConnection(connection, constants_1.WebSocketMessageResponses.TERMINAL_OUTPUT, errorMessage);
                        }
                        else {
                            this.broadcast(constants_1.WebSocketMessageResponses.TERMINAL_OUTPUT, errorMessage);
                        }
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send a server log message to terminals
     */
    SimpleCodeGeneratorAgent.prototype.broadcastServerLog = function (message, level, source) {
        if (level === void 0) { level = 'info'; }
        this.broadcast(constants_1.WebSocketMessageResponses.SERVER_LOG, {
            message: message,
            level: level,
            timestamp: Date.now(),
            source: source
        });
    };
    /**
     * Send message to a specific connection
     */
    SimpleCodeGeneratorAgent.prototype.sendToConnection = function (connection, type, data) {
        try {
            var message = __assign({ type: type }, data);
            connection.send(JSON.stringify(message));
        }
        catch (error) {
            this.logger().error('Error sending message to connection:', error);
        }
    };
    return SimpleCodeGeneratorAgent;
}(agents_1.Agent));
exports.SimpleCodeGeneratorAgent = SimpleCodeGeneratorAgent;
