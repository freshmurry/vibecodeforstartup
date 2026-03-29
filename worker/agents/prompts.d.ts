import { RuntimeError, StaticAnalysisResponse, TemplateDetails } from "../services/sandbox/sandboxTypes";
import { Blueprint, ClientReportedErrorType, FileOutputType, PhaseConceptType, TemplateSelection } from "./schemas";
import { IssueReport } from "./domain/values/IssueReport";
export declare const PROMPT_UTILS: {
    /**
     * Replace template variables in a prompt string
     * @param template The template string with {{variable}} placeholders
     * @param variables Object with variable name -> value mappings
     */
    replaceTemplateVariables(template: string, variables: Record<string, string>): string;
    serializeTemplate(template?: TemplateDetails, forCodegen?: boolean): string;
    serializeErrors(errors: RuntimeError[]): string;
    serializeStaticAnalysis(staticAnalysis: StaticAnalysisResponse): string;
    serializeClientReportedErrors(errors: ClientReportedErrorType[]): string;
    verifyPrompt(prompt: string): string;
    serializeFiles(files: FileOutputType[]): string;
    REACT_RENDER_LOOP_PREVENTION: string;
    COMMON_PITFALLS: string;
    STYLE_GUIDE: string;
    COMMON_DEP_DOCUMENTATION: string;
    COMMANDS: string;
    CODE_CONTENT_FORMAT: string;
    UI_GUIDELINES: string;
    PROJECT_CONTEXT: string;
};
export declare const STRATEGIES_UTILS: {
    INITIAL_PHASE_GUIDELINES: string;
    SUBSEQUENT_PHASE_GUIDELINES: string;
    CODING_GUIDELINES: string;
    CONSTRAINTS: string;
};
export declare const STRATEGIES: {
    FRONTEND_FIRST_PLANNING: string;
    FRONTEND_FIRST_CODING: string;
};
export interface GeneralSystemPromptBuilderParams {
    query: string;
    templateDetails: TemplateDetails;
    dependencies: Record<string, string>;
    forCodegen: boolean;
    blueprint?: Blueprint;
    language?: string;
    frameworks?: string[];
    templateMetaInfo?: TemplateSelection;
}
export declare function generalSystemPromptBuilder(prompt: string, params: GeneralSystemPromptBuilderParams): string;
/**
 * Enhanced system prompt builder that integrates VibeCoding for Startups startup-focused prompts
 * for Cloudflare Workers and Workers AI development.
 */
export declare function getEnhancedSystemPrompt(basePrompt: string, operation: 'code-generation' | 'chat' | 'analysis' | 'debug', params: GeneralSystemPromptBuilderParams): Promise<string>;
export declare function issuesPromptFormatter(issues: IssueReport): string;
export declare const USER_PROMPT_FORMATTER: {
    PROJECT_CONTEXT: (phases: PhaseConceptType[], files: FileOutputType[], commandsHistory: string[]) => string;
};
export declare const getUsecaseSpecificInstructions: (selectedTemplate: TemplateSelection) => string;
