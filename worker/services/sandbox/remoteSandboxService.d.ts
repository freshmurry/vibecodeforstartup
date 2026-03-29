import { TemplateDetailsResponse, BootstrapResponse, GetInstanceResponse, BootstrapStatusResponse, ShutdownResponse, WriteFilesRequest, WriteFilesResponse, GetFilesResponse, ExecuteCommandsResponse, RuntimeErrorResponse, ClearErrorsResponse, StaticAnalysisResponse, DeploymentResult, GetLogsResponse, ListInstancesResponse, GitHubPushRequest, GitHubPushResponse, GitHubExportRequest, GitHubExportResponse } from './sandboxTypes';
import { BaseSandboxService } from "./BaseSandboxService";
export declare function runnerFetch(url: string, method: 'GET' | 'POST' | 'DELETE', headers: Headers, body: string | undefined): Promise<Response>;
/**
 * Client for interacting with the Runner Service API.
 */
export declare class RemoteSandboxServiceClient extends BaseSandboxService {
    private static sandboxServiceUrl;
    private static token;
    static init(sandboxServiceUrl: string, token: string): void;
    constructor(sandboxId: string);
    private makeRequest;
    /**
     * Get details for a specific template.
     */
    getTemplateDetails(templateName: string): Promise<TemplateDetailsResponse>;
    /**
     * Create a new runner instance.
     */
    createInstance(templateName: string, projectName: string, webhookUrl?: string, localEnvVars?: Record<string, string>): Promise<BootstrapResponse>;
    /**
     * Get details for a specific runner instance.
     */
    getInstanceDetails(instanceId: string): Promise<GetInstanceResponse>;
    /**
     * Get status for a specific runner instance.
     */
    getInstanceStatus(instanceId: string): Promise<BootstrapStatusResponse>;
    /**
     * Write files to a runner instance.
     */
    writeFiles(instanceId: string, files: WriteFilesRequest['files'], commitMessage?: string): Promise<WriteFilesResponse>;
    /**
     * Get specific files from a runner instance.
     * @param instanceId The ID of the runner instance.
     * @param filePaths An optional array of file paths to retrieve.
     */
    getFiles(instanceId: string, filePaths?: string[]): Promise<GetFilesResponse>;
    /**
     * Execute commands in a runner instance.
     */
    executeCommands(instanceId: string, commands: string[], timeout?: number): Promise<ExecuteCommandsResponse>;
    /**
     * Get runtime errors from a runner instance.
     */
    getInstanceErrors(instanceId: string): Promise<RuntimeErrorResponse>;
    clearInstanceErrors(instanceId: string): Promise<ClearErrorsResponse>;
    /**
     * Perform static code analysis on a runner instance to find potential issues.
     * @param instanceId The ID of the runner instance
     * @param files Optional comma-separated list of specific files to lint
     */
    runStaticAnalysisCode(instanceId: string, lintFiles?: string[]): Promise<StaticAnalysisResponse>;
    /**
     * Deploy a runner instance to Cloudflare Workers.
     * @param instanceId The ID of the runner instance to deploy
     * @param credentials Optional Cloudflare deployment credentials
     */
    deployToCloudflareWorkers(instanceId: string): Promise<DeploymentResult>;
    /**
     * Shutdown a runner instance.
     */
    shutdownInstance(instanceId: string): Promise<ShutdownResponse>;
    /**
     * Export generated app to GitHub (creates repository if needed, then pushes files)
     */
    exportToGitHub(instanceId: string, request: GitHubExportRequest): Promise<GitHubExportResponse>;
    /**
     * Push instance files to existing GitHub repository
     */
    pushToGitHub(instanceId: string, request: GitHubPushRequest): Promise<GitHubPushResponse>;
    /**
     * Initialize the client (no-op for remote client)
     */
    initialize(): Promise<void>;
    /**
     * List all instances across all sessions
     */
    listAllInstances(): Promise<ListInstancesResponse>;
    /**
     * Get logs from a runner instance
     */
    getLogs(instanceId: string): Promise<GetLogsResponse>;
    writeFileLogs(logName: string, log: string): Promise<any>;
}
