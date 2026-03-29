"use strict";
/**
 * VibeCoding for Startups System Prompts - Entry Point
 *
 * This module provides secure access to VibeCoding for Startups system prompts
 * for backend AI agents. Prompts are not exposed through public APIs.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemPromptUtils = exports.systemPromptManager = void 0;
var system_prompt_manager_1 = require("./system-prompt-manager");
Object.defineProperty(exports, "systemPromptManager", { enumerable: true, get: function () { return system_prompt_manager_1.systemPromptManager; } });
Object.defineProperty(exports, "SystemPromptUtils", { enumerable: true, get: function () { return system_prompt_manager_1.SystemPromptUtils; } });
