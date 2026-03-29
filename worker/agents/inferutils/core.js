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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
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
exports.InferError = void 0;
exports.buildGatewayUrl = buildGatewayUrl;
exports.getConfigurationForModel = getConfigurationForModel;
exports.infer = infer;
var openai_1 = require("openai");
var streaming_1 = require("openai/streaming");
var schemaFormatters_1 = require("./schemaFormatters");
var zod_mjs_1 = require("openai/helpers/zod.mjs");
// If you need AIGatewayProviders, ensure it is exported from './config.types'
// import { SecretsService } from '../../database';
var rateLimits_1 = require("../../services/rate-limit/rateLimits");
var config_1 = require("../../config");
var errors_1 = require("../../../shared/types/errors");
var customTools_1 = require("../tools/customTools");
function optimizeInputs(messages) {
    return messages.map(function (message) { return (__assign(__assign({}, message), { content: optimizeMessageContent(message.content) })); });
}
function synthIdForIndex(i) {
    return "tool_".concat(Date.now(), "_").concat(i, "_").concat(Math.random().toString(36).slice(2));
}
function accumulateToolCallDelta(byIndex, byId, deltaToolCall, orderCounterRef) {
    var _a, _b;
    var idx = deltaToolCall.index;
    var idFromDelta = deltaToolCall.id;
    var entry;
    // Look up existing entry by id or index
    if (idFromDelta && byId.has(idFromDelta)) {
        entry = byId.get(idFromDelta);
        console.log("[TOOL_CALL_DEBUG] Found existing entry by id: ".concat(idFromDelta));
    }
    else if (idx !== undefined && byIndex.has(idx)) {
        entry = byIndex.get(idx);
        console.log("[TOOL_CALL_DEBUG] Found existing entry by index: ".concat(idx));
    }
    else {
        console.log("[TOOL_CALL_DEBUG] Creating new entry - id: ".concat(idFromDelta, ", index: ").concat(idx));
        // Create new entry
        var provisionalId = idFromDelta || synthIdForIndex(idx !== null && idx !== void 0 ? idx : byId.size);
        entry = __assign({ id: provisionalId, type: 'function', function: {
                name: '',
                arguments: '',
            }, __order: orderCounterRef.value++ }, (idx !== undefined ? { index: idx } : {}));
        if (idx !== undefined)
            byIndex.set(idx, entry);
        byId.set(provisionalId, entry);
    }
    // Update id if provided and different
    if (idFromDelta && entry.id !== idFromDelta) {
        byId.delete(entry.id);
        entry.id = idFromDelta;
        byId.set(entry.id, entry);
    }
    // Register index if provided and not yet registered
    if (idx !== undefined && entry.index === undefined) {
        entry.index = idx;
        byIndex.set(idx, entry);
    }
    // Update function name - replace if provided
    if ((_a = deltaToolCall.function) === null || _a === void 0 ? void 0 : _a.name) {
        entry.function.name = deltaToolCall.function.name;
    }
    // Append arguments - accumulate string chunks
    if (((_b = deltaToolCall.function) === null || _b === void 0 ? void 0 : _b.arguments) !== undefined) {
        var before = entry.function.arguments;
        var chunk = deltaToolCall.function.arguments;
        // Check if we already have complete JSON and this is extra data
        var isComplete = false;
        if (before.length > 0) {
            try {
                JSON.parse(before);
                isComplete = true;
                console.warn("[TOOL_CALL_WARNING] Already have complete JSON, ignoring additional chunk for ".concat(entry.function.name, ":"), {
                    existing_json: before,
                    ignored_chunk: chunk
                });
            }
            catch (_c) {
                // Not complete yet, continue accumulating
            }
        }
        if (!isComplete) {
            entry.function.arguments += chunk;
            // Debug logging for tool call argument accumulation
            console.log("[TOOL_CALL_DEBUG] Accumulating arguments for ".concat(entry.function.name || 'unknown', ":"), {
                id: entry.id,
                index: entry.index,
                before_length: before.length,
                chunk_length: chunk.length,
                chunk_content: chunk,
                after_length: entry.function.arguments.length,
                after_content: entry.function.arguments
            });
        }
    }
}
function assembleToolCalls(byIndex, byId) {
    if (byIndex.size > 0) {
        return Array.from(byIndex.values())
            .sort(function (a, b) { return (a.index - b.index); })
            .map(function (e) { return ({ id: e.id, type: 'function', function: { name: e.function.name, arguments: e.function.arguments } }); });
    }
    return Array.from(byId.values())
        .sort(function (a, b) { return a.__order - b.__order; })
        .map(function (e) { return ({ id: e.id, type: 'function', function: { name: e.function.name, arguments: e.function.arguments } }); });
}
function optimizeMessageContent(content) {
    if (!content)
        return content;
    // If content is an array (TextContent | ImageContent), only optimize text content
    if (Array.isArray(content)) {
        return content.map(function (item) {
            return item.type === 'text'
                ? __assign(__assign({}, item), { text: optimizeTextContent(item.text) }) : item;
        });
    }
    // If content is a string, optimize it directly
    return optimizeTextContent(content);
}
function optimizeTextContent(content) {
    // CONSERVATIVE OPTIMIZATION - Only safe changes that preserve readability
    // 1. Remove trailing whitespace from lines (always safe)
    content = content.replace(/[ \t]+$/gm, '');
    // 2. Reduce excessive empty lines (more than 3 consecutive) to 2 max
    // This preserves intentional spacing while removing truly excessive gaps
    content = content.replace(/\n\s*\n\s*\n\s*\n+/g, '\n\n\n');
    // // Convert 4-space indentation to 2-space for non-Python/YAML content
    // content = content.replace(/^( {4})+/gm, (match) =>
    // 	'  '.repeat(match.length / 4),
    // );
    // // Convert 8-space indentation to 2-space
    // content = content.replace(/^( {8})+/gm, (match) =>
    // 	'  '.repeat(match.length / 8),
    // );
    // 4. Remove leading/trailing whitespace from the entire content
    // (but preserve internal structure)
    content = content.trim();
    return content;
}
function buildGatewayUrl(env, providerOverride) {
    return __awaiter(this, void 0, void 0, function () {
        var url, cleanPathname, gateway, baseUrl, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    // If CLOUDFLARE_AI_GATEWAY_URL is set and is a valid URL, use it directly
                    if (env.CLOUDFLARE_AI_GATEWAY_URL &&
                        env.CLOUDFLARE_AI_GATEWAY_URL !== 'none' &&
                        env.CLOUDFLARE_AI_GATEWAY_URL.trim() !== '') {
                        try {
                            url = new URL(env.CLOUDFLARE_AI_GATEWAY_URL);
                            // Validate it's actually an HTTP/HTTPS URL
                            if (url.protocol === 'http:' || url.protocol === 'https:') {
                                cleanPathname = url.pathname.replace(/\/$/, '');
                                url.pathname = providerOverride ? "".concat(cleanPathname, "/").concat(providerOverride) : "".concat(cleanPathname, "/compat");
                                return [2 /*return*/, url.toString()];
                            }
                        }
                        catch (error) {
                            // Invalid URL, fall through to use bindings
                            console.warn("Invalid CLOUDFLARE_AI_GATEWAY_URL provided: ".concat(env.CLOUDFLARE_AI_GATEWAY_URL, ". Falling back to AI bindings."));
                        }
                    }
                    gateway = env.AI.gateway(env.CLOUDFLARE_AI_GATEWAY);
                    if (!providerOverride) return [3 /*break*/, 2];
                    return [4 /*yield*/, gateway.getUrl(providerOverride)];
                case 1:
                    _a = _c.sent();
                    return [3 /*break*/, 4];
                case 2:
                    _b = "".concat;
                    return [4 /*yield*/, gateway.getUrl()];
                case 3:
                    _a = _b.apply("", [_c.sent(), "compat"]);
                    _c.label = 4;
                case 4:
                    baseUrl = _a;
                    return [2 /*return*/, baseUrl];
            }
        });
    });
}
function isValidApiKey(apiKey) {
    if (!apiKey || apiKey.trim() === '') {
        return false;
    }
    // Check if value is not 'default' or 'none' and is more than 10 characters long
    if (apiKey.trim().toLowerCase() === 'default' || apiKey.trim().toLowerCase() === 'none' || apiKey.trim().length < 10) {
        return false;
    }
    return true;
}
function getApiKey(provider, env, _userId) {
    return __awaiter(this, void 0, void 0, function () {
        var providerKeyString, envKey, apiKey;
        return __generator(this, function (_a) {
            console.log("Getting API key for provider: ", provider);
            providerKeyString = provider.toUpperCase().replaceAll('-', '_');
            envKey = "".concat(providerKeyString, "_API_KEY");
            apiKey = env[envKey];
            // Check if apiKey is empty or undefined and is valid
            if (!isValidApiKey(apiKey)) {
                apiKey = env.CLOUDFLARE_AI_GATEWAY_TOKEN;
            }
            return [2 /*return*/, apiKey];
        });
    });
}
function getConfigurationForModel(model, env, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var providerForcedOverride, match, provider_1, baseURL, provider, apiKey, defaultHeaders;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    match = model.match(/\[(.*?)\]/);
                    if (match) {
                        provider_1 = match[1];
                        if (provider_1 === 'openrouter') {
                            return [2 /*return*/, {
                                    baseURL: 'https://openrouter.ai/api/v1',
                                    apiKey: env.OPENROUTER_API_KEY,
                                }];
                        }
                        else if (provider_1 === 'gemini') {
                            return [2 /*return*/, {
                                    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
                                    apiKey: env.GOOGLE_AI_STUDIO_API_KEY,
                                }];
                        }
                        else if (provider_1 === 'claude') {
                            return [2 /*return*/, {
                                    baseURL: 'https://api.anthropic.com/v1/',
                                    apiKey: env.ANTHROPIC_API_KEY,
                                }];
                        }
                        providerForcedOverride = provider_1;
                    }
                    return [4 /*yield*/, buildGatewayUrl(env, providerForcedOverride)];
                case 1:
                    baseURL = _a.sent();
                    provider = providerForcedOverride || model.split('/')[0];
                    return [4 /*yield*/, getApiKey(provider, env, userId)];
                case 2:
                    apiKey = _a.sent();
                    defaultHeaders = env.CLOUDFLARE_AI_GATEWAY_TOKEN && apiKey !== env.CLOUDFLARE_AI_GATEWAY_TOKEN ? {
                        'cf-aig-authorization': "Bearer ".concat(env.CLOUDFLARE_AI_GATEWAY_TOKEN),
                    } : undefined;
                    return [2 /*return*/, {
                            baseURL: baseURL,
                            apiKey: apiKey,
                            defaultHeaders: defaultHeaders
                        }];
            }
        });
    });
}
var InferError = /** @class */ (function (_super) {
    __extends(InferError, _super);
    function InferError(message, partialResponse) {
        var _this = _super.call(this, message) || this;
        _this.partialResponse = partialResponse;
        _this.name = 'InferError';
        return _this;
    }
    return InferError;
}(Error));
exports.InferError = InferError;
var claude_thinking_budget_tokens = {
    medium: 8000,
    high: 16000,
    low: 4000,
    minimal: 1000,
};
/**
 * Execute all tool calls from OpenAI response
 */
function executeToolCalls(openAiToolCalls, originalDefinitions) {
    return __awaiter(this, void 0, void 0, function () {
        var toolDefinitions;
        var _this = this;
        return __generator(this, function (_a) {
            toolDefinitions = new Map(originalDefinitions.map(function (td) { return [td.function.name, td]; }));
            return [2 /*return*/, Promise.all(openAiToolCalls.map(function (tc) { return __awaiter(_this, void 0, void 0, function () {
                    var args, td, result, error_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                args = tc.function.arguments ? JSON.parse(tc.function.arguments) : {};
                                td = toolDefinitions.get(tc.function.name);
                                if (!td) {
                                    throw new Error("Tool ".concat(tc.function.name, " not found"));
                                }
                                return [4 /*yield*/, (0, customTools_1.executeToolWithDefinition)(td, args)];
                            case 1:
                                result = _a.sent();
                                console.log("Tool execution result for ".concat(tc.function.name, ":"), result);
                                return [2 /*return*/, {
                                        id: tc.id,
                                        name: tc.function.name,
                                        arguments: args,
                                        result: result
                                    }];
                            case 2:
                                error_1 = _a.sent();
                                console.error("Tool execution failed for ".concat(tc.function.name, ":"), error_1);
                                return [2 /*return*/, {
                                        id: tc.id,
                                        name: tc.function.name,
                                        arguments: {},
                                        result: { error: "Failed to execute ".concat(tc.function.name, ": ").concat(error_1 instanceof Error ? error_1.message : 'Unknown error') }
                                    }];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); }))];
        });
    });
}
/**
 * Perform an inference using OpenAI's structured output with JSON schema
 * This uses the response_format.schema parameter to ensure the model returns
 * a response that matches the provided schema.
 */
function infer(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var authUser, globalConfig, _c, apiKey, baseURL, defaultHeaders, client, schemaObj, extraBody, formatInstructions_1, lastMessage, updatedContent, optimizedMessages, toolsOpts, response, error_2, toolCalls, content, streamIndex, byIndex, byId, orderCounterRef, _d, response_1, response_1_1, event, delta, provider, _i, _e, deltaToolCall, slice, finishReason, e_1_1, _f, toolCalls_1, toolCall, parsed, completion, message, totalTokens, executedToolCalls, newMessages, parsedContent, result, error_3;
        var _g, e_1, _h, _j;
        var _k, _l, _m, _o, _p, _q, _r, _s;
        var env = _b.env, metadata = _b.metadata, messages = _b.messages, schema = _b.schema, schemaName = _b.schemaName, format = _b.format, formatOptions = _b.formatOptions, maxTokens = _b.maxTokens, modelName = _b.modelName, stream = _b.stream, tools = _b.tools, reasoning_effort = _b.reasoning_effort, temperature = _b.temperature;
        return __generator(this, function (_t) {
            switch (_t.label) {
                case 0:
                    _t.trys.push([0, 29, , 30]);
                    authUser = {
                        id: metadata.userId,
                        email: 'unknown@platform.local',
                        displayName: undefined,
                        username: undefined,
                        avatarUrl: undefined
                    };
                    return [4 /*yield*/, (0, config_1.getGlobalConfigurableSettings)(env)
                        // Maybe in the future can expand using config object for other stuff like global model configs?
                    ];
                case 1:
                    globalConfig = _t.sent();
                    // Maybe in the future can expand using config object for other stuff like global model configs?
                    return [4 /*yield*/, rateLimits_1.RateLimitService.enforceLLMCallsRateLimit(env, globalConfig.security.rateLimit, authUser)];
                case 2:
                    // Maybe in the future can expand using config object for other stuff like global model configs?
                    _t.sent();
                    return [4 /*yield*/, getConfigurationForModel(modelName, env, metadata.userId)];
                case 3:
                    _c = _t.sent(), apiKey = _c.apiKey, baseURL = _c.baseURL, defaultHeaders = _c.defaultHeaders;
                    console.log("baseUrl: ".concat(baseURL, ", modelName: ").concat(modelName));
                    // Remove [*.] from model name
                    modelName = modelName.replace(/\[.*?\]/, '');
                    client = new openai_1.OpenAI({ apiKey: apiKey, baseURL: baseURL, defaultHeaders: defaultHeaders });
                    schemaObj = schema && schemaName && !format
                        ? { response_format: (0, zod_mjs_1.zodResponseFormat)(schema, schemaName) }
                        : {};
                    extraBody = modelName.includes('claude') ? {
                        extra_body: {
                            thinking: {
                                type: 'enabled',
                                budget_tokens: claude_thinking_budget_tokens[reasoning_effort !== null && reasoning_effort !== void 0 ? reasoning_effort : 'medium'],
                            },
                        },
                    }
                        : {};
                    if (format) {
                        if (!schema || !schemaName) {
                            throw new Error('Schema and schemaName are required when using a custom format');
                        }
                        formatInstructions_1 = (0, schemaFormatters_1.generateTemplateForSchema)(schema, format, formatOptions);
                        lastMessage = messages[messages.length - 1];
                        // Handle multi-modal content properly
                        if (typeof lastMessage.content === 'string') {
                            // Simple string content - append format instructions
                            messages = __spreadArray(__spreadArray([], messages.slice(0, -1), true), [
                                {
                                    role: lastMessage.role,
                                    content: "".concat(lastMessage.content, "\n\n").concat(formatInstructions_1),
                                },
                            ], false);
                        }
                        else if (Array.isArray(lastMessage.content)) {
                            updatedContent = lastMessage.content.map(function (item) {
                                if (item.type === 'text') {
                                    return __assign(__assign({}, item), { text: "".concat(item.text, "\n\n").concat(formatInstructions_1) });
                                }
                                return item;
                            });
                            messages = __spreadArray(__spreadArray([], messages.slice(0, -1), true), [
                                {
                                    role: lastMessage.role,
                                    content: updatedContent,
                                },
                            ], false);
                        }
                    }
                    console.log("Running inference with ".concat(modelName, " using structured output with ").concat(format, " format, reasoning effort: ").concat(reasoning_effort, ", max tokens: ").concat(maxTokens, ", temperature: ").concat(temperature, ", baseURL: ").concat(baseURL));
                    optimizedMessages = optimizeInputs(messages);
                    console.log("Token optimization: Original messages size ~".concat(JSON.stringify(messages).length, " chars, optimized size ~").concat(JSON.stringify(optimizedMessages).length, " chars"));
                    toolsOpts = tools ? { tools: tools, tool_choice: 'auto' } : {};
                    response = void 0;
                    _t.label = 4;
                case 4:
                    _t.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, client.chat.completions.create(__assign(__assign(__assign(__assign({}, schemaObj), extraBody), toolsOpts), { model: modelName, messages: optimizedMessages, max_completion_tokens: maxTokens || 150000, stream: stream ? true : false, reasoning_effort: reasoning_effort, temperature: temperature }), {
                            headers: {
                                "cf-aig-metadata": JSON.stringify({
                                    chatId: metadata.agentId,
                                    userId: metadata.userId,
                                    schemaName: schemaName,
                                })
                            }
                        })];
                case 5:
                    // Call OpenAI API with proper structured output format
                    response = _t.sent();
                    console.log("Inference response received");
                    return [3 /*break*/, 7];
                case 6:
                    error_2 = _t.sent();
                    console.error("Failed to get inference response from OpenAI: ".concat(error_2));
                    throw error_2;
                case 7:
                    toolCalls = [];
                    content = '';
                    if (!stream) return [3 /*break*/, 22];
                    if (!(response instanceof streaming_1.Stream)) return [3 /*break*/, 20];
                    streamIndex = 0;
                    byIndex = new Map();
                    byId = new Map();
                    orderCounterRef = { value: 0 };
                    _t.label = 8;
                case 8:
                    _t.trys.push([8, 13, 14, 19]);
                    _d = true, response_1 = __asyncValues(response);
                    _t.label = 9;
                case 9: return [4 /*yield*/, response_1.next()];
                case 10:
                    if (!(response_1_1 = _t.sent(), _g = response_1_1.done, !_g)) return [3 /*break*/, 12];
                    _j = response_1_1.value;
                    _d = false;
                    event = _j;
                    delta = (_k = event.choices[0]) === null || _k === void 0 ? void 0 : _k.delta;
                    provider = modelName.split('/')[0];
                    if ((delta === null || delta === void 0 ? void 0 : delta.tool_calls) && (provider === 'google-ai-studio' || provider === 'gemini')) {
                        console.log("[PROVIDER_DEBUG] ".concat(provider, " tool_calls delta:"), JSON.stringify(delta.tool_calls, null, 2));
                    }
                    if (delta === null || delta === void 0 ? void 0 : delta.tool_calls) {
                        try {
                            for (_i = 0, _e = delta.tool_calls; _i < _e.length; _i++) {
                                deltaToolCall = _e[_i];
                                accumulateToolCallDelta(byIndex, byId, deltaToolCall, orderCounterRef);
                            }
                        }
                        catch (error) {
                            console.error('Error processing tool calls in streaming:', error);
                        }
                    }
                    // Process content
                    content += (delta === null || delta === void 0 ? void 0 : delta.content) || '';
                    slice = content.slice(streamIndex);
                    finishReason = (_l = event.choices[0]) === null || _l === void 0 ? void 0 : _l.finish_reason;
                    if (slice.length >= stream.chunk_size || finishReason != null) {
                        stream.onChunk(slice);
                        streamIndex += slice.length;
                    }
                    _t.label = 11;
                case 11:
                    _d = true;
                    return [3 /*break*/, 9];
                case 12: return [3 /*break*/, 19];
                case 13:
                    e_1_1 = _t.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 19];
                case 14:
                    _t.trys.push([14, , 17, 18]);
                    if (!(!_d && !_g && (_h = response_1.return))) return [3 /*break*/, 16];
                    return [4 /*yield*/, _h.call(response_1)];
                case 15:
                    _t.sent();
                    _t.label = 16;
                case 16: return [3 /*break*/, 18];
                case 17:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 18: return [7 /*endfinally*/];
                case 19:
                    // Assemble toolCalls with preference for index ordering, else first-seen order
                    toolCalls = assembleToolCalls(byIndex, byId);
                    // Validate accumulated tool calls (do not mutate arguments)
                    for (_f = 0, toolCalls_1 = toolCalls; _f < toolCalls_1.length; _f++) {
                        toolCall = toolCalls_1[_f];
                        if (!toolCall.function.name) {
                            console.warn('Tool call missing function name:', toolCall);
                        }
                        if (toolCall.function.arguments) {
                            try {
                                parsed = JSON.parse(toolCall.function.arguments);
                                console.log("[TOOL_CALL_VALIDATION] Successfully parsed arguments for ".concat(toolCall.function.name, ":"), parsed);
                            }
                            catch (error) {
                                console.error("[TOOL_CALL_VALIDATION] Invalid JSON in tool call arguments for ".concat(toolCall.function.name, ":"), {
                                    error: error instanceof Error ? error.message : String(error),
                                    arguments_length: toolCall.function.arguments.length,
                                    arguments_content: toolCall.function.arguments,
                                    arguments_hex: Buffer.from(toolCall.function.arguments).toString('hex')
                                });
                            }
                        }
                    }
                    return [3 /*break*/, 21];
                case 20:
                    // Handle the case where stream was requested but a non-stream response was received
                    console.error('Expected a stream response but received a ChatCompletion object.');
                    completion = response;
                    message = (_m = completion.choices[0]) === null || _m === void 0 ? void 0 : _m.message;
                    if (message) {
                        content = message.content || '';
                        toolCalls = message.tool_calls || [];
                    }
                    _t.label = 21;
                case 21: return [3 /*break*/, 23];
                case 22:
                    // If not streaming, get the full response content (response is ChatCompletion)
                    content = ((_p = (_o = response.choices[0]) === null || _o === void 0 ? void 0 : _o.message) === null || _p === void 0 ? void 0 : _p.content) || '';
                    toolCalls = ((_r = (_q = response.choices[0]) === null || _q === void 0 ? void 0 : _q.message) === null || _r === void 0 ? void 0 : _r.tool_calls) || [];
                    totalTokens = (_s = response.usage) === null || _s === void 0 ? void 0 : _s.total_tokens;
                    console.log("Total tokens used in prompt: ".concat(totalTokens));
                    _t.label = 23;
                case 23:
                    if (!content && !stream && !toolCalls.length) {
                        // // Only error if not streaming and no content
                        // console.error('No content received from OpenAI', JSON.stringify(response, null, 2));
                        // throw new Error('No content received from OpenAI');
                        console.warn('No content received from OpenAI', JSON.stringify(response, null, 2));
                        return [2 /*return*/, { string: "", toolCalls: [] }];
                    }
                    executedToolCalls = [];
                    if (!tools) return [3 /*break*/, 25];
                    return [4 /*yield*/, executeToolCalls(toolCalls, tools)];
                case 24:
                    // console.log(`Tool calls:`, JSON.stringify(toolCalls, null, 2), 'definition:', JSON.stringify(tools, null, 2));
                    executedToolCalls = _t.sent();
                    _t.label = 25;
                case 25:
                    if (!executedToolCalls.length) return [3 /*break*/, 28];
                    console.log("Tool calls executed:", JSON.stringify(executedToolCalls, null, 2));
                    newMessages = __spreadArray(__spreadArray(__spreadArray([], messages, true), [
                        { role: "assistant", content: content, tool_calls: toolCalls }
                    ], false), executedToolCalls.map(function (result, _) { return ({
                        role: "tool",
                        content: JSON.stringify(result.result),
                        name: result.name,
                        tool_call_id: result.id,
                    }); }), true);
                    if (!(schema && schemaName)) return [3 /*break*/, 27];
                    return [4 /*yield*/, infer({
                            env: env,
                            metadata: metadata,
                            messages: newMessages,
                            schema: schema,
                            schemaName: schemaName,
                            format: format,
                            formatOptions: formatOptions,
                            modelName: modelName,
                            maxTokens: maxTokens,
                            stream: stream,
                            tools: tools,
                            reasoning_effort: reasoning_effort,
                            temperature: temperature,
                        })];
                case 26: return [2 /*return*/, _t.sent()];
                case 27: return [2 /*return*/, infer({
                        env: env,
                        metadata: metadata,
                        messages: newMessages,
                        modelName: modelName,
                        maxTokens: maxTokens,
                        stream: stream,
                        tools: tools,
                        reasoning_effort: reasoning_effort,
                        temperature: temperature,
                    })];
                case 28:
                    if (!schema) {
                        return [2 /*return*/, { string: content, toolCalls: executedToolCalls }];
                    }
                    try {
                        parsedContent = format
                            ? (0, schemaFormatters_1.parseContentForSchema)(content, format, schema, formatOptions)
                            : JSON.parse(content);
                        result = schema.safeParse(parsedContent);
                        if (!result.success) {
                            console.log('Raw content:', content);
                            console.log('Parsed data:', parsedContent);
                            console.error('Schema validation errors:', result.error.format());
                            throw new Error("Failed to validate AI response against schema: ".concat(result.error.message));
                        }
                        return [2 /*return*/, { object: result.data, toolCalls: executedToolCalls }];
                    }
                    catch (parseError) {
                        console.error('Error parsing response:', parseError);
                        throw new InferError('Failed to parse response', content);
                    }
                    return [3 /*break*/, 30];
                case 29:
                    error_3 = _t.sent();
                    if (error_3 instanceof errors_1.RateLimitExceededError || error_3 instanceof errors_1.SecurityError) {
                        throw error_3;
                    }
                    console.error('Error in inferWithSchemaOutput:', error_3);
                    throw error_3;
                case 30: return [2 /*return*/];
            }
        });
    });
}
