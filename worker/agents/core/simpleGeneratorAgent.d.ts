import { Agent, Connection } from 'agents';
import { AgentActionType, PhaseConceptGenerationSchemaType, PhaseConceptType, FileOutputType, PhaseImplementationSchemaType } from '../schemas';
import { GitHubPushRequest, PreviewType, StaticAnalysisResponse } from '../../services/sandbox/sandboxTypes';
import { GitHubExportResult } from '../../services/github/types';
import { CodeGenState, CurrentDevState } from './state';
import { AllIssues, AgentSummary, ScreenshotData, AgentInitArgs } from './types';
import { StructuredLogger } from '../../logger';
import { ProjectSetupAssistant } from '../assistants/projectsetup';
import { UserConversationProcessor } from '../operations/UserConversationProcessor';
import { FileManager } from '../services/implementations/FileManager';
import { PhaseImplementationOperation } from '../operations/PhaseImplementation';
import { CodeReviewOperation } from '../operations/CodeReview';
import { FileRegenerationOperation } from '../operations/FileRegeneration';
import { PhaseGenerationOperation } from '../operations/PhaseGeneration';
import { ScreenshotAnalysisOperation } from '../operations/ScreenshotAnalysis';
import { BaseSandboxService } from '../../services/sandbox/BaseSandboxService';
import { WebSocketMessageData, WebSocketMessageType } from '../../api/websocketTypes';
import { FastCodeFixerOperation } from '../operations/FastCodeFixer';
interface Operations {
    codeReview: CodeReviewOperation;
    regenerateFile: FileRegenerationOperation;
    generateNextPhase: PhaseGenerationOperation;
    analyzeScreenshot: ScreenshotAnalysisOperation;
    implementPhase: PhaseImplementationOperation;
    fastCodeFixer: FastCodeFixerOperation;
    processUserMessage: UserConversationProcessor;
}
/**
 * SimpleCodeGeneratorAgent - Deterministically orhestrated AI-powered code generation
 *
 * Manages the lifecycle of code generation including:
 * - Blueprint-based phase generation
 * - Real-time file streaming with WebSocket updates
 * - Code validation and error correction
 * - Deployment to sandbox service
 * - Review cycles with automated fixes
 */
export declare class SimpleCodeGeneratorAgent extends Agent<Env, CodeGenState> {
    protected projectSetupAssistant: ProjectSetupAssistant | undefined;
    protected sandboxServiceClient: BaseSandboxService | undefined;
    protected fileManager: FileManager;
    protected env: Env;
    private previewUrlCache;
    protected operations: Operations;
    isGenerating: boolean;
    private currentDeploymentPromise;
    _logger: StructuredLogger | undefined;
    logger(): StructuredLogger;
    getAgentId(): string;
    private base64ToUint8Array;
    private uploadScreenshotToCloudflareImages;
    private uploadScreenshotToR2;
    initialState: CodeGenState;
    saveToDatabase(): Promise<void>;
    /**
     * Initialize the code generator with project blueprint and template
     * Sets up services and begins deployment process
     */
    initialize(initArgs: AgentInitArgs, ..._args: unknown[]): Promise<CodeGenState>;
    isInitialized(): Promise<boolean>;
    onStateUpdate(_state: CodeGenState, _source: "server" | Connection): void;
    setState(state: CodeGenState): void;
    getPreviewUrlCache(): string;
    getProjectSetupAssistant(): ProjectSetupAssistant;
    getSessionId(): string;
    resetSessionId(): void;
    getSandboxServiceClient(): BaseSandboxService;
    isCodeGenerating(): boolean;
    rechargePhasesCounter(max_phases?: number): void;
    decrementPhasesCounter(): number;
    getPhasesCounter(): number;
    generateReadme(): Promise<void>;
    /**
     * State machine controller for code generation with user interaction support
     * Executes phases sequentially with review cycles and proper state transitions
     */
    generateAllFiles(reviewCycles?: number): Promise<void>;
    /**
     * Execute phase generation state - generate next phase with user suggestions
     */
    executePhaseGeneration(): Promise<{
        currentDevState: CurrentDevState;
        result?: PhaseConceptType;
        staticAnalysis?: StaticAnalysisResponse;
    }>;
    /**
     * Execute phase implementation state - implement current phase
     */
    executePhaseImplementation(phaseConcept?: PhaseConceptType, staticAnalysis?: StaticAnalysisResponse): Promise<{
        currentDevState: CurrentDevState;
        staticAnalysis?: StaticAnalysisResponse;
    }>;
    /**
     * Execute review cycle state - run code review and regeneration cycles
     */
    executeReviewCycle(): Promise<CurrentDevState>;
    /**
     * Execute finalizing state - final review and cleanup (runs only once)
     */
    executeFinalizing(): Promise<CurrentDevState>;
    /**
     * Generate next phase with raw user suggestions
     */
    generateNextPhase(currentIssues: AllIssues, userSuggestions?: string[]): Promise<PhaseConceptGenerationSchemaType | undefined>;
    /**
     * Implement a single phase of code generation
     * Streams file generation with real-time updates and incorporates technical instructions
     */
    implementPhase(phase: PhaseConceptType, currentIssues: AllIssues, streamChunks?: boolean): Promise<PhaseImplementationSchemaType>;
    /**
     * Get current model configurations (defaults + user overrides)
     * Used by WebSocket to provide configuration info to frontend
     */
    getModelConfigsInfo(): Promise<{
        agents: {
            key: string;
            name: any;
            description: any;
        }[];
        userConfigs: Record<string, any>;
        defaultConfigs: Record<string, any>;
    }>;
    /**
     * Perform comprehensive code review
     * Analyzes for runtime errors, static issues, and best practices
     */
    reviewCode(): Promise<{
        commands?: string[];
        dependenciesNotMet?: string[];
        issuesFound?: boolean;
        frontendIssues?: string[];
        backendIssues?: string[];
        filesToFix?: {
            issues?: string[];
            filePath?: string;
            require_code_changes?: boolean;
        }[];
    }>;
    /**
     * Regenerate a file to fix identified issues
     * Retries up to 3 times before giving up
     */
    regenerateFile(file: FileOutputType, issues: string[], retryIndex?: number): Promise<{
        format?: "full_content" | "unified_diff";
        filePath?: string;
        fileContents?: string;
        filePurpose?: string;
    }>;
    getTotalFiles(): number;
    getSummary(): Promise<AgentSummary>;
    getFullState(): Promise<CodeGenState>;
    /**
     * Migrate old snake_case file properties to camelCase format
     * This is needed for apps created before the schema migration
     */
    private migrateStateIfNeeded;
    getFileGenerated(filePath: string): {
        filePath?: string;
        fileContents?: string;
        filePurpose?: string;
    };
    getWebSockets(): WebSocket[];
    fetchRuntimeErrors(clear?: boolean): Promise<{
        message?: string;
        source?: string;
        stack?: string;
        timestamp?: string | Date;
        filePath?: string;
        lineNumber?: number;
        columnNumber?: number;
        severity?: "error" | "fatal" | "warning";
        rawOutput?: string;
    }[]>;
    /**
     * Perform static code analysis on the generated files
     * This helps catch potential issues early in the development process
     */
    runStaticAnalysisCode(): Promise<StaticAnalysisResponse>;
    /**
     * Apply deterministic code fixes for common TypeScript errors
     */
    private applyDeterministicCodeFixes;
    fetchAllIssues(): Promise<AllIssues>;
    resetIssues(): Promise<void>;
    deployToSandbox(files?: FileOutputType[], redeploy?: boolean, commitMessage?: string): Promise<PreviewType | null>;
    private createNewDeployment;
    private executeDeployment;
    /**
     * Deploy the generated code to Cloudflare Workers
     */
    deployToCloudflare(): Promise<{
        deploymentUrl?: string;
        workersUrl?: string;
    } | null>;
    waitForGeneration(): Promise<void>;
    getNextAction(): Promise<AgentActionType>;
    onMessage(connection: Connection, message: string): Promise<void>;
    onClose(connection: Connection): Promise<void>;
    broadcast<T extends WebSocketMessageType>(type: T, data: WebSocketMessageData<T>): void;
    broadcast(msg: string | ArrayBuffer | ArrayBufferView<ArrayBufferLike>, without?: string[]): void;
    /**
     * Handle HTTP requests to this agent instance
     * Includes webhook processing for internal requests
     */
    fetch(request: Request): Promise<Response>;
    /**
     * Generate webhook URL for this agent instance
     */
    private generateWebhookUrl;
    /**
     * Handle webhook events from sandbox service
     */
    handleWebhook(request: Request): Promise<Response>;
    /**
     * Process webhook events and trigger appropriate actions
     */
    private processWebhookEvent;
    /**
     * Handle runtime error webhook events
     */
    private handleRuntimeErrorWebhook;
    /**
     * Execute commands with retry logic
     * Chunks commands and retries failed ones with AI assistance
     */
    private executeCommands;
    /**
     * Delete files from the file manager
     */
    deleteFiles(filePaths: string[]): Promise<void>;
    /**
     * Export generated code to a GitHub repository
     * Creates repository and pushes all generated files
     */
    pushToGitHub(options: GitHubPushRequest): Promise<GitHubExportResult>;
    /**
     * Handle user input during conversational code generation
     * Processes user messages and updates pendingUserInputs state
     */
    handleUserInput(userMessage: string): Promise<void>;
    /**
     * Capture screenshot of the given URL using Cloudflare Browser Rendering REST API
     */
    captureScreenshot(url: string, viewport?: {
        width: number;
        height: number;
    }): Promise<string>;
    /**
     * Save screenshot data to database - now triggers server-side screenshot capture
     */
    saveScreenshotToDatabase(screenshotData: ScreenshotData): Promise<void>;
    /**
     * Execute a terminal command received from the frontend
     * Uses the same infrastructure as the existing executeCommands method
     */
    executeTerminalCommand(command: string, connection?: Connection): Promise<void>;
    /**
     * Send a server log message to terminals
     */
    broadcastServerLog(message: string, level?: 'info' | 'warn' | 'error' | 'debug', source?: string): void;
    /**
     * Send message to a specific connection
     */
    private sendToConnection;
}
export {};
