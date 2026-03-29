/**
 * VibeCoding for Startups System Prompt Configuration
 *
 * This module provides secure access to the VibeCoding for Startups system prompt
 * for backend AI agents. The prompt is not exposed through public APIs
 * but is accessible to internal agent operations.
 */
interface SystemPromptConfig {
    content: string;
    version: string;
    platform: string;
    lastUpdated: Date;
    capabilities: string[];
    restrictions: string[];
}
declare class SystemPromptManager {
    private static instance;
    private promptCache;
    private readonly CACHE_TTL;
    private lastCacheTime;
    private constructor();
    static getInstance(): SystemPromptManager;
    /**
     * Get the VibeCoding for Startups system prompt for AI agents
     * This method is only accessible from backend worker code
     */
    getSystemPrompt(): Promise<SystemPromptConfig>;
    /**
     * Get a truncated version of the system prompt for logging/debugging
     */
    getSystemPromptSummary(): Promise<string>;
    /**
     * Validate that the system prompt contains required sections
     */
    validateSystemPrompt(): Promise<boolean>;
    /**
     * Get system prompt formatted for specific AI operations
     */
    getFormattedPrompt(operation: 'code-generation' | 'chat' | 'analysis' | 'debug', context?: Record<string, any>): Promise<string>;
}
export declare const systemPromptManager: SystemPromptManager;
export type { SystemPromptConfig };
export declare const SystemPromptUtils: {
    /**
     * Check if system prompt is available and valid
     */
    isAvailable(): Promise<boolean>;
    /**
     * Get system prompt capabilities
     */
    getCapabilities(): Promise<string[]>;
    /**
     * Get system prompt for specific agent operation
     */
    getPromptForOperation(operation: "code-generation" | "chat" | "analysis" | "debug", context?: Record<string, any>): Promise<string>;
};
