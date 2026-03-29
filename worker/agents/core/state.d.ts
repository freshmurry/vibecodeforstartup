import type { Blueprint, ClientReportedErrorType, PhaseConceptType, FileOutputType } from '../schemas';
import type { TemplateDetails } from '../../services/sandbox/sandboxTypes';
import type { ConversationMessage } from '../inferutils/common';
import type { InferenceContext } from '../inferutils/config.types';
export interface FileState extends FileOutputType {
    last_hash: string;
    last_modified: number;
    unmerged: string[];
}
export interface PhaseState extends PhaseConceptType {
    completed: boolean;
}
export declare enum CurrentDevState {
    IDLE = 0,
    PHASE_GENERATING = 1,
    PHASE_IMPLEMENTING = 2,
    REVIEWING = 3,
    FILE_REGENERATING = 4,
    FINALIZING = 5
}
export declare const MAX_PHASES = 10;
export interface CodeGenState {
    blueprint: Blueprint;
    query: string;
    generatedFilesMap: Record<string, FileState>;
    generationPromise?: Promise<void>;
    generatedPhases: PhaseState[];
    commandsHistory?: string[];
    lastPackageJson?: string;
    templateDetails: TemplateDetails;
    sandboxInstanceId?: string;
    clientReportedErrors: ClientReportedErrorType[];
    shouldBeGenerating: boolean;
    mvpGenerated: boolean;
    agentMode: 'deterministic' | 'smart';
    sessionId: string;
    hostname: string;
    phasesCounter: number;
    pendingUserInputs: string[];
    currentDevState: CurrentDevState;
    reviewCycles?: number;
    currentPhase?: PhaseConceptType;
    conversationMessages: ConversationMessage[];
    inferenceContext: InferenceContext;
}
