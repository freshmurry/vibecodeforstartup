import { z } from 'zod';
import { type SchemaFormat, type FormatterOptions } from './schemaFormatters';
import { type ReasoningEffort } from 'openai/resources.mjs';
import { Message } from './common';
import { ToolCallResult, ToolDefinition } from '../tools/types';
import { AIModels, InferenceMetadata } from './config.types';
export declare function buildGatewayUrl(env: Env, providerOverride?: AIGatewayProviders): Promise<string>;
export declare function getConfigurationForModel(model: AIModels | string, env: Env, userId: string): Promise<{
    baseURL: string;
    apiKey: string;
    defaultHeaders?: Record<string, string>;
}>;
type InferArgsBase = {
    env: Env;
    metadata: InferenceMetadata;
    messages: Message[];
    maxTokens?: number;
    modelName: AIModels | string;
    reasoning_effort?: ReasoningEffort;
    temperature?: number;
    stream?: {
        chunk_size: number;
        onChunk: (chunk: string) => void;
    };
    tools?: ToolDefinition<any, any>[];
    providerOverride?: 'cloudflare' | 'direct';
    userApiKeys?: Record<string, string>;
};
type InferArgsStructured = InferArgsBase & {
    schema: z.AnyZodObject;
    schemaName: string;
};
type InferWithCustomFormatArgs = InferArgsStructured & {
    format?: SchemaFormat;
    formatOptions?: FormatterOptions;
};
export declare class InferError extends Error {
    partialResponse?: string;
    constructor(message: string, partialResponse?: string);
}
export type InferResponseObject<OutputSchema extends z.AnyZodObject> = {
    object: z.infer<OutputSchema>;
    toolCalls?: ToolCallResult[];
};
export type InferResponseString = {
    string: string;
    toolCalls?: ToolCallResult[];
};
export declare function infer<OutputSchema extends z.AnyZodObject>(args: InferArgsStructured): Promise<InferResponseObject<OutputSchema>>;
export declare function infer(args: InferArgsBase): Promise<InferResponseString>;
export declare function infer<OutputSchema extends z.AnyZodObject>(args: InferWithCustomFormatArgs): Promise<InferResponseObject<OutputSchema>>;
export {};
