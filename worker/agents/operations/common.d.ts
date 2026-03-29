import { StructuredLogger } from "../../logger";
import { GenerationContext } from "../domain/values/GenerationContext";
import { Message } from "../inferutils/common";
import { InferenceContext } from "../inferutils/config.types";
export declare function getSystemPromptWithProjectContext(systemPrompt: string, context: GenerationContext, forCodeGen: boolean): Message[];
/**
 * Enhanced async version that integrates VibeCoding for Startups startup-focused prompts
 */
export declare function getEnhancedSystemPromptWithProjectContext(systemPrompt: string, context: GenerationContext, forCodeGen: boolean, operation: 'code-generation' | 'chat' | 'analysis' | 'debug'): Promise<Message[]>;
export interface OperationOptions {
    env: Env;
    agentId: string;
    context: GenerationContext;
    logger: StructuredLogger;
    inferenceContext: InferenceContext;
}
export declare abstract class AgentOperation<InputType, OutputType> {
    abstract execute(inputs: InputType, options: OperationOptions): Promise<OutputType>;
}
