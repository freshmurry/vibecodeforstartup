"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI_MODELS_TUPLE = exports.ALL_AI_MODELS = exports.AGENT_CONFIG = void 0;
exports.isValidAIModel = isValidAIModel;
exports.getValidAIModelsArray = getValidAIModelsArray;
var config_types_1 = require("./config.types");
/*
Use these configs instead for better performance, less bugs and costs:

    blueprint: {
        name: AIModels.OPENAI_5_MINI,
        reasoning_effort: 'medium',
        max_tokens: 16000,
        fallbackModel: AIModels.OPENAI_O3,
        temperature: 1,
    },
    projectSetup: {
        name: AIModels.OPENAI_5_MINI,
        reasoning_effort: 'medium',
        max_tokens: 10000,
        temperature: 1,
        fallbackModel: AIModels.GEMINI_2_5_FLASH,
    },
    phaseGeneration: {
        name: AIModels.OPENAI_5_MINI,
        reasoning_effort: 'medium',
        max_tokens: 32000,
        temperature: 1,
        fallbackModel: AIModels.GEMINI_2_5_FLASH,
    },
    codeReview: {
        name: AIModels.OPENAI_5,
        reasoning_effort: 'medium',
        max_tokens: 32000,
        temperature: 1,
        fallbackModel: AIModels.GEMINI_2_5_PRO,
    },
    fileRegeneration: {
        name: AIModels.OPENAI_5_MINI,
        reasoning_effort: 'low',
        max_tokens: 32000,
        temperature: 1,
        fallbackModel: AIModels.CLAUDE_4_SONNET,
    },
    realtimeCodeFixer: {
        name: AIModels.OPENAI_5_MINI,
        reasoning_effort: 'low',
        max_tokens: 32000,
        temperature: 1,
        fallbackModel: AIModels.CLAUDE_4_SONNET,
    },

For real time code fixer, here are some alternatives:
    realtimeCodeFixer: {
        name: AIModels.CEREBRAS_QWEN_3_CODER,
        reasoning_effort: undefined,
        max_tokens: 10000,
        temperature: 0.0,
        fallbackModel: AIModels.GEMINI_2_5_PRO,
    },

OR
    realtimeCodeFixer: {
        name: AIModels.KIMI_2_5,
        providerOverride: 'direct',
        reasoning_effort: 'medium',
        max_tokens: 32000,
        temperature: 0.7,
        fallbackModel: AIModels.OPENAI_OSS,
    },
*/
exports.AGENT_CONFIG = {
    templateSelection: {
        name: config_types_1.AIModels.GEMINI_2_5_FLASH_LITE,
        max_tokens: 2000,
        fallbackModel: config_types_1.AIModels.GEMINI_2_5_FLASH,
        temperature: 0.8,
    },
    blueprint: {
        name: config_types_1.AIModels.GEMINI_2_5_PRO,
        reasoning_effort: 'medium',
        max_tokens: 64000,
        fallbackModel: config_types_1.AIModels.GEMINI_2_5_FLASH,
        temperature: 0.7,
    },
    projectSetup: {
        name: config_types_1.AIModels.GEMINI_2_5_PRO,
        reasoning_effort: 'low',
        max_tokens: 10000,
        temperature: 0.2,
        fallbackModel: config_types_1.AIModels.GEMINI_2_5_PRO,
    },
    phaseGeneration: {
        name: config_types_1.AIModels.GEMINI_2_5_PRO,
        reasoning_effort: 'low',
        max_tokens: 32000,
        temperature: 0.2,
        fallbackModel: config_types_1.AIModels.GEMINI_2_5_FLASH,
    },
    firstPhaseImplementation: {
        name: config_types_1.AIModels.GEMINI_2_5_PRO,
        reasoning_effort: 'low',
        max_tokens: 64000,
        temperature: 0.2,
        fallbackModel: config_types_1.AIModels.GEMINI_2_5_PRO,
    },
    phaseImplementation: {
        name: config_types_1.AIModels.GEMINI_2_5_PRO,
        reasoning_effort: 'low',
        max_tokens: 64000,
        temperature: 0.2,
        fallbackModel: config_types_1.AIModels.GEMINI_2_5_PRO,
    },
    realtimeCodeFixer: {
        name: config_types_1.AIModels.DISABLED,
        reasoning_effort: 'low',
        max_tokens: 32000,
        temperature: 1,
        fallbackModel: config_types_1.AIModels.GEMINI_2_5_FLASH,
    },
    // Not used right now
    fastCodeFixer: {
        name: config_types_1.AIModels.DISABLED,
        reasoning_effort: undefined,
        max_tokens: 64000,
        temperature: 0.0,
        fallbackModel: config_types_1.AIModels.GEMINI_2_5_PRO,
    },
    conversationalResponse: {
        name: config_types_1.AIModels.GEMINI_2_5_FLASH,
        reasoning_effort: 'low',
        max_tokens: 32000,
        temperature: 0,
        fallbackModel: config_types_1.AIModels.GEMINI_2_5_PRO,
    },
    codeReview: {
        name: config_types_1.AIModels.GEMINI_2_5_PRO,
        reasoning_effort: 'medium',
        max_tokens: 32000,
        temperature: 0.1,
        fallbackModel: config_types_1.AIModels.GEMINI_2_5_FLASH,
    },
    fileRegeneration: {
        name: config_types_1.AIModels.GEMINI_2_5_PRO,
        reasoning_effort: 'low',
        max_tokens: 32000,
        temperature: 0,
        fallbackModel: config_types_1.AIModels.GEMINI_2_5_FLASH,
    },
    // Not used right now
    screenshotAnalysis: {
        name: config_types_1.AIModels.GEMINI_2_5_PRO,
        reasoning_effort: 'medium',
        max_tokens: 8000,
        temperature: 0.1,
        fallbackModel: config_types_1.AIModels.GEMINI_2_5_FLASH,
    },
};
// Model validation utilities
exports.ALL_AI_MODELS = Object.values(config_types_1.AIModels);
// Create tuple type for Zod enum validation
exports.AI_MODELS_TUPLE = Object.values(config_types_1.AIModels);
function isValidAIModel(model) {
    return Object.values(config_types_1.AIModels).includes(model);
}
function getValidAIModelsArray() {
    return exports.ALL_AI_MODELS;
}
