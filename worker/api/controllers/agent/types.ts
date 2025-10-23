import { PreviewType } from "../../../services/sandbox/sandboxTypes";

export interface CodeGenArgs {
    query: string;
    language?: string;
    frameworks?: string[];
    selectedTemplate?: string;
    agentMode: 'deterministic' | 'smart';
}

/**
 * Data structure for connectToExistingAgent response
 */
export interface AgentConnectionData {
    websocketUrl: string;
    agentId: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AgentPreviewResponse extends PreviewType {
}
    