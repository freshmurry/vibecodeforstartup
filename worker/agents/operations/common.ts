import { StructuredLogger } from "../../logger";
import { GenerationContext } from "../domain/values/GenerationContext";
import { Message } from "../inferutils/common";
import { InferenceContext } from "../inferutils/config.types";
import { createUserMessage, createSystemMessage, createAssistantMessage } from "../inferutils/common";
import { generalSystemPromptBuilder, getEnhancedSystemPrompt, USER_PROMPT_FORMATTER } from "../prompts";

export function getSystemPromptWithProjectContext(
    systemPrompt: string,
    context: GenerationContext,
    forCodeGen: boolean
): Message[] {
    const { query, blueprint, templateDetails, dependencies, allFiles, commandsHistory } = context;

    const messages = [
        createSystemMessage(generalSystemPromptBuilder(systemPrompt, {
            query,
            blueprint,
            templateDetails,
            dependencies,
            forCodegen: forCodeGen,
        })), 
        createUserMessage(
            USER_PROMPT_FORMATTER.PROJECT_CONTEXT(
                context.getCompletedPhases(),
                allFiles, 
                commandsHistory
            )
        ),
        createAssistantMessage(`I have thoroughly gone through the whole codebase and understood the current implementation and project requirements. We can continue.`)
    ];
    return messages;
}

/**
 * Enhanced async version that integrates VibeCoding for Startups startup-focused prompts
 */
export async function getEnhancedSystemPromptWithProjectContext(
    systemPrompt: string,
    context: GenerationContext,
    forCodeGen: boolean,
    operation: 'code-generation' | 'chat' | 'analysis' | 'debug'
): Promise<Message[]> {
    const { query, blueprint, templateDetails, dependencies, allFiles, commandsHistory } = context;

    // Get enhanced system prompt with VibeCoding for Startups integration
    const enhancedPrompt = await getEnhancedSystemPrompt(systemPrompt, operation, {
        query,
        blueprint,
        templateDetails,
        dependencies,
        forCodegen: forCodeGen,
    });

    const messages = [
        createSystemMessage(enhancedPrompt),
        createUserMessage(
            USER_PROMPT_FORMATTER.PROJECT_CONTEXT(
                context.getCompletedPhases(),
                allFiles, 
                commandsHistory
            )
        ),
        createAssistantMessage(`I have thoroughly analyzed the entire codebase and understood the current implementation, business requirements, and startup context. I'm ready to help you build and scale your application using Cloudflare Workers and modern TypeScript patterns. Let's continue with your startup journey!`)
    ];
    return messages;
}

export interface OperationOptions {
    env: Env;
    agentId: string;
    context: GenerationContext;
    logger: StructuredLogger;
    inferenceContext: InferenceContext;
}

export abstract class AgentOperation<InputType, OutputType> {
    abstract execute(
        inputs: InputType,
        options: OperationOptions
    ): Promise<OutputType>;
}