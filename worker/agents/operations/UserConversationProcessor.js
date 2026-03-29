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
exports.UserConversationProcessor = void 0;
exports.buildEditAppTool = buildEditAppTool;
var common_1 = require("../inferutils/common");
var infer_1 = require("../inferutils/infer");
var common_2 = require("./common");
var constants_1 = require("../constants");
var common_3 = require("../operations/common");
var idGenerator_1 = require("../utils/idGenerator");
var errors_1 = require("../../../shared/types/errors");
var web_search_1 = require("../tools/toolkit/web-search");
var weather_1 = require("../tools/toolkit/weather");
// Constants
var CHUNK_SIZE = 64;
var RelevantProjectUpdateWebsoketMessages = [
    constants_1.WebSocketMessageResponses.PHASE_IMPLEMENTING,
    constants_1.WebSocketMessageResponses.PHASE_IMPLEMENTED,
    constants_1.WebSocketMessageResponses.CODE_REVIEW,
    constants_1.WebSocketMessageResponses.FILE_REGENERATING,
    constants_1.WebSocketMessageResponses.FILE_REGENERATED,
    constants_1.WebSocketMessageResponses.DEPLOYMENT_COMPLETED,
    constants_1.WebSocketMessageResponses.COMMAND_EXECUTING,
];
var SYSTEM_PROMPT = "You are an AI assistant for Cloudflare's Workers Development Platform, helping users build and modify software applications. You have a conversational interface and can help users with software applications.\n\n## YOUR CAPABILITIES:\n- You can answer questions about the project and its current state\n- You can search the web for information when needed\n- Most importantly, you can modify the application when users request changes or ask for new features or points of issues/bugs\n- You can execute other tools provided to you to help users with their projects\n\n## HOW TO INTERACT:\n\n1. **For general questions or discussions**: Simply respond naturally and helpfully. Be friendly and informative.\n\n2. **When users want to modify their app or point out issues/bugs**: Use the queue_request tool to queue the modification request. \n   - First acknowledge what they want to change\n   - Then call the queue_request tool with a clear, actionable description\n   - The modification request should be specific but NOT include code-level implementation details\n   - After calling the tool, let them know the changes will be implemented in the next development phase\n   - queue_request would simply relay the request to a super intelligent AI that would generate the code changes. This is a cheap operation. Please use it often.\n\n3. **For information requests**: Use the appropriate tools (web_search, etc) when they would be helpful.\n\n## RESPONSE STYLE:\n- Be conversational and natural - you're having a chat, not filling out forms\n- Be encouraging and positive about their project\n- When changes are requested, respond as if you're the one making the changes (say \"I'll add that\" not \"the team will add that\")\n- Always acknowledge that implementation will happen \"in the next development phase\" to set expectations\n\n## IMPORTANT GUIDELINES:\n- DO NOT generate or discuss code-level implementation details\n- DO NOT provide specific technical instructions or code snippets\n- DO translate vague user requests into clear, actionable requirements when using queue_request\n- DO be helpful in understanding what the user wants to achieve\n- Always remember to make sure and use `queue_request` tool to queue any modification requests! Not doing so will NOT queue up the changes.\n- You would know if you have correctly queued the request via the `queue_request` tool if you get the response of kind `Modification request queued successfully...`. If you don't get this response, then you have not queued the request correctly.\n- Only declare \"Modification request queued successfully...\" **after** you receive a tool result message from `queue_request` (role=tool) in this conversation turn.\n- If you did not receive that tool result, do **not** claim the request was queued. Instead say: \"I'm preparing that now\u2014one moment.\" and then call the tool.\n\n\nYou can also execute multiple tools in a sequence, for example, to search the web for a image, and then sending the image url to the queue_request tool to queue up the changes.\n\n## Original Project Context:\n{{query}}\n\nRemember: You're here to help users build enterprise-ready applications through natural conversation and the tools at your disposal.";
var FALLBACK_USER_RESPONSE = "I understand you'd like to make some changes to your project. Let me make sure this is incorporated in the next phase of development.";
function buildEditAppTool(stateMutator) {
    var _this = this;
    return {
        type: 'function',
        function: {
            name: 'queue_request',
            description: 'Queue up modification requests or changes, to be implemented in the next development phase',
            parameters: {
                type: 'object',
                additionalProperties: false,
                properties: {
                    modificationRequest: {
                        type: 'string',
                        minLength: 8,
                        description: 'The changes needed to be made to the app. Please don\'t supply any code level or implementation details. Provide detailed requirements and description of the changes you want to make.'
                    }
                },
                required: ['modificationRequest']
            }
        },
        implementation: function (args) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("Queueing app edit request", args);
                stateMutator(args.modificationRequest);
                return [2 /*return*/, { content: "Modification request queued successfully, will be implemented in the next phase of development." }];
            });
        }); }
    };
}
var UserConversationProcessor = /** @class */ (function (_super) {
    __extends(UserConversationProcessor, _super);
    function UserConversationProcessor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UserConversationProcessor.prototype.execute = function (inputs, options) {
        return __awaiter(this, void 0, void 0, function () {
            var env, logger, context, userMessage, pastMessages, systemPrompts, messages, extractedUserResponse_1, extractedEnhancedRequest_1, aiConversationId_1, attachLifecycle, tools, result, conversationResponse, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        env = options.env, logger = options.logger, context = options.context;
                        userMessage = inputs.userMessage, pastMessages = inputs.pastMessages;
                        logger.info("Processing user message", {
                            messageLength: inputs.userMessage.length,
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, (0, common_2.getEnhancedSystemPromptWithProjectContext)(SYSTEM_PROMPT, context, false, 'chat')];
                    case 2:
                        systemPrompts = _a.sent();
                        messages = __spreadArray(__spreadArray([], pastMessages, true), [__assign(__assign({}, (0, common_1.createUserMessage)(userMessage)), { conversationId: idGenerator_1.IdGenerator.generateConversationId() })], false);
                        extractedUserResponse_1 = "";
                        extractedEnhancedRequest_1 = "";
                        aiConversationId_1 = idGenerator_1.IdGenerator.generateConversationId();
                        logger.info("Generated conversation ID", { aiConversationId: aiConversationId_1 });
                        attachLifecycle = function (td) { return (__assign(__assign({}, td), { onStart: function (args) { return inputs.conversationResponseCallback('', aiConversationId_1, false, { name: td.function.name, status: 'start', args: args }); }, onComplete: function (args, _result) { return inputs.conversationResponseCallback('', aiConversationId_1, false, { name: td.function.name, status: 'success', args: args }); } })); };
                        tools = [
                            attachLifecycle(web_search_1.toolWebSearchDefinition),
                            attachLifecycle(weather_1.toolWeatherDefinition),
                            attachLifecycle(buildEditAppTool(function (modificationRequest) {
                                logger.info("Received app edit request", { modificationRequest: modificationRequest });
                                extractedEnhancedRequest_1 = modificationRequest;
                            }))
                        ];
                        logger.info("Executing inference for user message", {
                            messageLength: userMessage.length,
                            aiConversationId: aiConversationId_1,
                            tools: tools
                        });
                        return [4 /*yield*/, (0, infer_1.executeInference)({
                                env: env,
                                messages: __spreadArray(__spreadArray([], systemPrompts, true), messages, true),
                                agentActionName: "conversationalResponse",
                                context: options.inferenceContext,
                                tools: tools, // Enable tools for the conversational AI
                                stream: {
                                    onChunk: function (chunk) {
                                        logger.info("Processing user message chunk", { chunkLength: chunk.length });
                                        inputs.conversationResponseCallback(chunk, aiConversationId_1, true);
                                        extractedUserResponse_1 += chunk;
                                    },
                                    chunk_size: CHUNK_SIZE
                                }
                            })];
                    case 3:
                        result = _a.sent();
                        logger.info("Successfully processed user message", {
                            streamingSuccess: !!extractedUserResponse_1,
                            hasEnhancedRequest: !!extractedEnhancedRequest_1,
                        });
                        conversationResponse = {
                            enhancedUserRequest: extractedEnhancedRequest_1,
                            userResponse: extractedUserResponse_1
                        };
                        // Save the assistant's response to conversation history
                        messages.push(__assign(__assign({}, (0, common_1.createAssistantMessage)(result.string)), { conversationId: idGenerator_1.IdGenerator.generateConversationId() }));
                        return [2 /*return*/, {
                                conversationResponse: conversationResponse,
                                messages: messages
                            }];
                    case 4:
                        error_1 = _a.sent();
                        logger.error("Error processing user message:", error_1);
                        if (error_1 instanceof errors_1.RateLimitExceededError || error_1 instanceof errors_1.SecurityError) {
                            throw error_1;
                        }
                        // Fallback response
                        return [2 /*return*/, {
                                conversationResponse: {
                                    enhancedUserRequest: "User request: ".concat(userMessage),
                                    userResponse: FALLBACK_USER_RESPONSE
                                },
                                messages: __spreadArray(__spreadArray([], pastMessages, true), [
                                    __assign(__assign({}, (0, common_1.createUserMessage)(userMessage)), { conversationId: idGenerator_1.IdGenerator.generateConversationId() }),
                                    __assign(__assign({}, (0, common_1.createAssistantMessage)(FALLBACK_USER_RESPONSE)), { conversationId: idGenerator_1.IdGenerator.generateConversationId() })
                                ], false)
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    UserConversationProcessor.prototype.processProjectUpdates = function (updateType, _data, logger) {
        try {
            logger.info("Processing project update", { updateType: updateType });
            // Just save it as an assistant message. Dont save data for now to avoid DO size issues
            var preparedMessage = "**<Internal Memo>**\nProject Updates: ".concat(updateType, "\n</Internal Memo>");
            return [{
                    role: 'assistant',
                    content: preparedMessage,
                    conversationId: idGenerator_1.IdGenerator.generateConversationId()
                }];
        }
        catch (error) {
            logger.error("Error processing project update:", error);
            return [];
        }
    };
    UserConversationProcessor.prototype.isProjectUpdateType = function (type) {
        return RelevantProjectUpdateWebsoketMessages.includes(type);
    };
    return UserConversationProcessor;
}(common_3.AgentOperation));
exports.UserConversationProcessor = UserConversationProcessor;
