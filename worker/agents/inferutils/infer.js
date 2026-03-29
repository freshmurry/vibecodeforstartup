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
exports.executeInference = executeInference;
exports.createFileEnhancementRequestMessage = createFileEnhancementRequestMessage;
exports.createFileGenerationResponseMessage = createFileGenerationResponseMessage;
var core_1 = require("./core");
var common_1 = require("./common");
var config_types_1 = require("./config.types");
var config_1 = require("./config");
var logger_1 = require("../../logger");
var errors_1 = require("../../../shared/types/errors");
var logger = (0, logger_1.createLogger)('InferenceUtils');
var responseRegenerationPrompts = "\nThe response you provided was either in an incorrect/unparsable format or was incomplete.\nPlease provide a valid response that matches the expected output format exactly.\n";
function executeInference(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var conf, finalConf, backoffMs, useCheaperModel, _loop_1, attempt, state_1;
        var env = _b.env, messages = _b.messages, temperature = _b.temperature, maxTokens = _b.maxTokens, _c = _b.retryLimit, retryLimit = _c === void 0 ? 5 : _c, // Increased retry limit for better reliability
        stream = _b.stream, tools = _b.tools, reasoning_effort = _b.reasoning_effort, schema = _b.schema, agentActionName = _b.agentActionName, format = _b.format, modelName = _b.modelName, modelConfig = _b.modelConfig, context = _b.context;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (modelConfig) {
                        // Use explicitly provided model config
                        conf = modelConfig;
                    }
                    else if ((context === null || context === void 0 ? void 0 : context.userId) && (context === null || context === void 0 ? void 0 : context.userModelConfigs)) {
                        // Try to get user-specific configuration from context cache
                        conf = context.userModelConfigs[agentActionName];
                        if (conf) {
                            logger.info("Using user configuration for ".concat(agentActionName, ": ").concat(JSON.stringify(conf)));
                        }
                        else {
                            logger.info("No user configuration for ".concat(agentActionName, ", using AGENT_CONFIG defaults"));
                        }
                    }
                    finalConf = conf || config_1.AGENT_CONFIG[agentActionName];
                    modelName = modelName || finalConf.name;
                    temperature = temperature || finalConf.temperature || 0.2;
                    maxTokens = maxTokens || finalConf.max_tokens || 16000;
                    reasoning_effort = reasoning_effort || finalConf.reasoning_effort;
                    backoffMs = function (attempt) { return Math.min(100 * Math.pow(2, attempt), 10000); };
                    useCheaperModel = false;
                    _loop_1 = function (attempt) {
                        var result, _e, error_1, isLastAttempt, delay_1;
                        return __generator(this, function (_f) {
                            switch (_f.label) {
                                case 0:
                                    _f.trys.push([0, 5, , 8]);
                                    logger.info("Starting ".concat(agentActionName, " operation with model ").concat(modelName, " (attempt ").concat(attempt + 1, "/").concat(retryLimit, ")"));
                                    if (!schema) return [3 /*break*/, 2];
                                    return [4 /*yield*/, (0, core_1.infer)({
                                            env: env,
                                            metadata: context,
                                            messages: messages,
                                            schema: schema,
                                            schemaName: agentActionName,
                                            format: format,
                                            maxTokens: maxTokens,
                                            modelName: useCheaperModel ? config_types_1.AIModels.GEMINI_2_5_FLASH : modelName,
                                            formatOptions: {
                                                debug: false,
                                            },
                                            tools: tools,
                                            stream: stream,
                                            reasoning_effort: useCheaperModel ? undefined : reasoning_effort,
                                            temperature: temperature,
                                        })];
                                case 1:
                                    _e = _f.sent();
                                    return [3 /*break*/, 4];
                                case 2: return [4 /*yield*/, (0, core_1.infer)({
                                        env: env,
                                        metadata: context,
                                        messages: messages,
                                        maxTokens: maxTokens,
                                        modelName: useCheaperModel ? config_types_1.AIModels.GEMINI_2_5_FLASH : modelName,
                                        tools: tools,
                                        stream: stream,
                                        reasoning_effort: useCheaperModel ? undefined : reasoning_effort,
                                        temperature: temperature,
                                    })];
                                case 3:
                                    _e = _f.sent();
                                    _f.label = 4;
                                case 4:
                                    result = _e;
                                    logger.info("Successfully completed ".concat(agentActionName, " operation"));
                                    return [2 /*return*/, { value: result }];
                                case 5:
                                    error_1 = _f.sent();
                                    if (error_1 instanceof errors_1.RateLimitExceededError || error_1 instanceof errors_1.SecurityError) {
                                        throw error_1;
                                    }
                                    isLastAttempt = attempt === retryLimit - 1;
                                    logger.error("Error during ".concat(agentActionName, " operation (attempt ").concat(attempt + 1, "/").concat(retryLimit, "):"), error_1);
                                    if (error_1 instanceof core_1.InferError) {
                                        // If its an infer error, we can append the partial response to the list of messages and ask a cheaper model to retry the generation
                                        if (error_1.partialResponse && error_1.partialResponse.length > 1000) {
                                            messages.push((0, common_1.createAssistantMessage)(error_1.partialResponse));
                                            messages.push((0, common_1.createUserMessage)(responseRegenerationPrompts));
                                            useCheaperModel = true;
                                        }
                                    }
                                    else {
                                        // Try using fallback model if available
                                        modelName = (conf === null || conf === void 0 ? void 0 : conf.fallbackModel) || modelName;
                                    }
                                    if (!!isLastAttempt) return [3 /*break*/, 7];
                                    delay_1 = backoffMs(attempt);
                                    logger.info("Retrying in ".concat(delay_1, "ms..."));
                                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, delay_1); })];
                                case 6:
                                    _f.sent();
                                    _f.label = 7;
                                case 7: return [3 /*break*/, 8];
                                case 8: return [2 /*return*/];
                            }
                        });
                    };
                    attempt = 0;
                    _d.label = 1;
                case 1:
                    if (!(attempt < retryLimit)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1(attempt)];
                case 2:
                    state_1 = _d.sent();
                    if (typeof state_1 === "object")
                        return [2 /*return*/, state_1.value];
                    _d.label = 3;
                case 3:
                    attempt++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, null];
            }
        });
    });
}
/**
 * Creates a file enhancement request message
 * @param filePath Path to the file being enhanced
 * @param fileContents Contents of the file to enhance
 * @returns A message for the AI model to enhance the file
 */
function createFileEnhancementRequestMessage(filePath, fileContents) {
    var fileExtension = filePath.split('.').pop() || '';
    var codeBlock = fileExtension ?
        "```".concat(fileExtension, "\n").concat(fileContents, "\n```") :
        "```\n".concat(fileContents, "\n```");
    return (0, common_1.createUserMessage)("\n<FILE_ENHANCEMENT_REQUEST>\nPlease review the following file and identify any potential issues:\n- Syntax errors\n- Missing variable declarations\n- Incorrect imports\n- Incorrect usage of libraries or APIs\n- Unicode or special characters that shouldn't be there\n- Inconsistent indentation or formatting\n- Logic errors\n- Any other issues that could cause runtime errors\n\nIf you find any issues:\n1. Fix them directly in the code\n2. Return the full enhanced code with all issues fixed\n3. Provide a list of issues that were fixed with clear descriptions\n\nIf no issues are found, simply indicate this without modifying the code.\n\nFile Path: ".concat(filePath, "\n\n").concat(codeBlock, "\n</FILE_ENHANCEMENT_REQUEST>\n"));
}
/**
 * Creates a response message about a generated file
 */
function createFileGenerationResponseMessage(filePath, fileContents, explanation, nextFile) {
    // Format the message in a focused way to reduce token usage
    var fileExtension = filePath.split('.').pop() || '';
    var codeBlock = fileExtension ?
        "```".concat(fileExtension, "\n").concat(fileContents, "\n```") :
        "```\n".concat(fileContents, "\n```");
    return {
        role: 'assistant',
        content: "\n<GENERATED FILE: \"".concat(filePath, "\">\n").concat(codeBlock, "\n\nExplanation: ").concat(explanation, "\nNext file to generate: ").concat(nextFile ? "Path: ".concat(nextFile.path, " | Purpose: (").concat(nextFile.purpose, ")") : "None", "\n")
    };
}
