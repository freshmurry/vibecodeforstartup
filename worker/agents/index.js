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
exports.getAgentStub = getAgentStub;
exports.getAgentState = getAgentState;
exports.cloneAgent = cloneAgent;
exports.getTemplateForQuery = getTemplateForQuery;
var agents_1 = require("agents");
var idGenerator_1 = require("../utils/idGenerator");
var sandboxSdkClient_1 = require("../services/sandbox/sandboxSdkClient");
var templateSelector_1 = require("./planning/templateSelector");
var factory_1 = require("../services/sandbox/factory");
function getAgentStub(env_1, agentId_1) {
    return __awaiter(this, arguments, void 0, function (env, agentId, searchInOtherJurisdictions, logger) {
        var jurisdictions, _i, jurisdictions_1, jurisdiction, stub, isInitialized, error_1;
        if (searchInOtherJurisdictions === void 0) { searchInOtherJurisdictions = false; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!searchInOtherJurisdictions) return [3 /*break*/, 7];
                    jurisdictions = [undefined, 'eu'];
                    _i = 0, jurisdictions_1 = jurisdictions;
                    _a.label = 1;
                case 1:
                    if (!(_i < jurisdictions_1.length)) return [3 /*break*/, 7];
                    jurisdiction = jurisdictions_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 6]);
                    logger.info("Agent ".concat(agentId, " retreiving from jurisdiction ").concat(jurisdiction));
                    return [4 /*yield*/, (0, agents_1.getAgentByName)(env.CodeGenObject, agentId, {
                            locationHint: 'enam',
                            jurisdiction: jurisdiction,
                        })];
                case 3:
                    stub = _a.sent();
                    return [4 /*yield*/, stub.isInitialized()];
                case 4:
                    isInitialized = _a.sent();
                    if (isInitialized) {
                        logger.info("Agent ".concat(agentId, " found in jurisdiction ").concat(jurisdiction));
                        return [2 /*return*/, stub];
                    }
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    logger.info("Agent ".concat(agentId, " not found in jurisdiction ").concat(jurisdiction));
                    return [3 /*break*/, 6];
                case 6:
                    _i++;
                    return [3 /*break*/, 1];
                case 7:
                    logger.info("Agent ".concat(agentId, " retrieved directly"));
                    return [2 /*return*/, (0, agents_1.getAgentByName)(env.CodeGenObject, agentId, {
                            locationHint: 'enam'
                        })];
            }
        });
    });
}
function getAgentState(env_1, agentId_1) {
    return __awaiter(this, arguments, void 0, function (env, agentId, searchInOtherJurisdictions, logger) {
        var agentInstance;
        if (searchInOtherJurisdictions === void 0) { searchInOtherJurisdictions = false; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAgentStub(env, agentId, searchInOtherJurisdictions, logger)];
                case 1:
                    agentInstance = _a.sent();
                    return [2 /*return*/, agentInstance.getFullState()];
            }
        });
    });
}
function cloneAgent(env, agentId, logger) {
    return __awaiter(this, void 0, void 0, function () {
        var agentInstance, _a, newAgentId, newAgent, originalState, newState;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getAgentStub(env, agentId, true, logger)];
                case 1:
                    agentInstance = _b.sent();
                    _a = !agentInstance;
                    if (_a) return [3 /*break*/, 3];
                    return [4 /*yield*/, agentInstance.isInitialized()];
                case 2:
                    _a = !(_b.sent());
                    _b.label = 3;
                case 3:
                    if (_a) {
                        throw new Error("Agent ".concat(agentId, " not found"));
                    }
                    newAgentId = (0, idGenerator_1.generateId)();
                    return [4 /*yield*/, getAgentStub(env, newAgentId, false, logger)];
                case 4:
                    newAgent = _b.sent();
                    return [4 /*yield*/, agentInstance.getFullState()];
                case 5:
                    originalState = _b.sent();
                    newState = __assign(__assign({}, originalState), { sessionId: newAgentId, sandboxInstanceId: undefined, pendingUserInputs: [], currentDevState: 0, generationPromise: undefined, shouldBeGenerating: false, 
                        // latestScreenshot: undefined,
                        clientReportedErrors: [] });
                    return [4 /*yield*/, newAgent.setState(newState)];
                case 6:
                    _b.sent();
                    return [2 /*return*/, { newAgentId: newAgentId, newAgent: newAgent }];
            }
        });
    });
}
function getTemplateForQuery(env, inferenceContext, query, hostname, logger) {
    return __awaiter(this, void 0, void 0, function () {
        var templatesResponse, sandboxSessionId, _a, analyzeQueryResponse, sandboxClient, selectedTemplate, templateDetailsResponse, templateDetails;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, sandboxSdkClient_1.SandboxSdkClient.listTemplates()];
                case 1:
                    templatesResponse = _b.sent();
                    if (!templatesResponse || !templatesResponse.success) {
                        throw new Error('Failed to fetch templates from sandbox service');
                    }
                    sandboxSessionId = (0, idGenerator_1.generateId)();
                    return [4 /*yield*/, Promise.all([
                            (0, templateSelector_1.selectTemplate)({
                                env: env,
                                inferenceContext: inferenceContext,
                                query: query,
                                availableTemplates: templatesResponse.templates,
                            }),
                            (0, factory_1.getSandboxService)(sandboxSessionId, hostname)
                        ])];
                case 2:
                    _a = _b.sent(), analyzeQueryResponse = _a[0], sandboxClient = _a[1];
                    logger.info('Selected template', { selectedTemplate: analyzeQueryResponse });
                    // Find the selected template by name in the available templates
                    if (!analyzeQueryResponse.selectedTemplateName) {
                        logger.error('No suitable template found for code generation');
                        throw new Error('No suitable template found for code generation');
                    }
                    selectedTemplate = templatesResponse.templates.find(function (template) { return template.name === analyzeQueryResponse.selectedTemplateName; });
                    if (!selectedTemplate) {
                        logger.error('Selected template not found');
                        throw new Error('Selected template not found');
                    }
                    return [4 /*yield*/, sandboxClient.getTemplateDetails(selectedTemplate.name)];
                case 3:
                    templateDetailsResponse = _b.sent();
                    if (!templateDetailsResponse.success || !templateDetailsResponse.templateDetails) {
                        logger.error('Failed to fetch files', { templateDetailsResponse: templateDetailsResponse });
                        throw new Error('Failed to fetch files');
                    }
                    templateDetails = templateDetailsResponse.templateDetails;
                    return [2 /*return*/, { sandboxSessionId: sandboxSessionId, templateDetails: templateDetails, selection: analyzeQueryResponse }];
            }
        });
    });
}
