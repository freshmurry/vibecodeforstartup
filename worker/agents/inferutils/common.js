"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserMessage = createUserMessage;
exports.createSystemMessage = createSystemMessage;
exports.createAssistantMessage = createAssistantMessage;
exports.createMultiModalUserMessage = createMultiModalUserMessage;
/**
 * Create a standard user message with content
 */
function createUserMessage(content) {
    return {
        role: 'user',
        content: content,
    };
}
/**
 * Create a standard system message with content
 */
function createSystemMessage(content) {
    return {
        role: 'system',
        content: content,
    };
}
/**
 * Create a standard assistant message with content
 */
function createAssistantMessage(content) {
    return {
        role: 'assistant',
        content: content,
    };
}
/**
 * Create a multi-modal user message with text and image content
 */
function createMultiModalUserMessage(text, imageUrl, detail) {
    return {
        role: 'user',
        content: [
            {
                type: 'text',
                text: text,
            },
            {
                type: 'image_url',
                image_url: {
                    url: imageUrl,
                    detail: detail || 'auto',
                },
            },
        ],
    };
}
