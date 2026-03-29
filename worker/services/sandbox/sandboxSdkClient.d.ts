import { TemplateDetailsResponse, BootstrapResponse, GetInstanceResponse, BootstrapStatusResponse, ShutdownResponse, WriteFilesRequest, WriteFilesResponse, GetFilesResponse, ExecuteCommandsResponse, RuntimeErrorResponse, ClearErrorsResponse, StaticAnalysisResponse, DeploymentResult, GitHubPushRequest, GitHubPushResponse, GitHubExportRequest, GitHubExportResponse, GetLogsResponse, ListInstancesResponse } from './sandboxTypes';
import { BaseSandboxService } from './BaseSandboxService';
import { CodeFixResult } from '../code-fixer';
import { FileObject } from '../code-fixer/types';
export { Sandbox as UserAppSandboxService, Sandbox as DeployerService } from "@cloudflare/sandbox";
/**
 * Streaming event for enhanced command execution
 */
export interface StreamEvent {
    type: 'stdout' | 'stderr' | 'exit' | 'error';
    data?: string;
    code?: number;
    error?: string;
    timestamp: Date;
}
export declare enum AllocationStrategy {
    MANY_TO_ONE = "many_to_one",
    ONE_TO_ONE = "one_to_one"
}
export declare class SandboxSdkClient extends BaseSandboxService {
    private sandbox;
    private hostname;
    private metadataCache;
    private envVars?;
    constructor(sandboxId: string, hostname: string, envVars?: Record<string, string>);
    initialize(): Promise<void>;
    private getWranglerKVKey;
    private getSandbox;
    private getInstanceMetadataFile;
    private executeCommand;
    private getInstanceMetadata;
    private storeInstanceMetadata;
    private invalidateMetadataCache;
    private allocateAvailablePort;
    private checkTemplateExists;
    downloadTemplate(templateName: string, downloadDir?: string): Promise<ArrayBuffer>;
    private ensureTemplateExists;
    getTemplateDetails(templateName: string): Promise<TemplateDetailsResponse>;
    private getTemplateFromCatalog;
    private buildFileTree;
    listAllInstances(): Promise<ListInstancesResponse>;
    /**
     * Waits for the development server to be ready by monitoring logs for readiness indicators
     */
    private waitForServerReady;
    private startDevServer;
    /**
     * Provisions Cloudflare resources for template placeholders in wrangler.jsonc
     */
    private provisionTemplateResources;
    /**
     * Updates project configuration files with the specified project name
     */
    private updateProjectConfiguration;
    private setupInstance;
    private fetchDontTouchFiles;
    private fetchRedactedFiles;
    createInstance(templateName: string, projectName: string, webhookUrl?: string, localEnvVars?: Record<string, string>): Promise<BootstrapResponse>;
    getInstanceDetails(instanceId: string): Promise<GetInstanceResponse>;
    getInstanceStatus(instanceId: string): Promise<BootstrapStatusResponse>;
    shutdownInstance(instanceId: string): Promise<ShutdownResponse>;
    writeFiles(instanceId: string, files: WriteFilesRequest['files'], commitMessage?: string): Promise<WriteFilesResponse>;
    getFiles(templateOrInstanceId: string, filePaths?: string[], applyFilter?: boolean, redactedFiles?: string[]): Promise<GetFilesResponse>;
    getLogs(instanceId: string, onlyRecent?: boolean): Promise<GetLogsResponse>;
    executeCommands(instanceId: string, commands: string[], timeout?: number): Promise<ExecuteCommandsResponse>;
    getInstanceErrors(instanceId: string, clear?: boolean): Promise<RuntimeErrorResponse>;
    clearInstanceErrors(instanceId: string): Promise<ClearErrorsResponse>;
    runStaticAnalysisCode(instanceId: string): Promise<StaticAnalysisResponse>;
    fixCodeIssues(instanceId: string, allFiles?: FileObject[]): Promise<CodeFixResult>;
    private mapESLintSeverity;
    deployToCloudflareWorkers(instanceId: string): Promise<DeploymentResult>;
    /**
     * Process assets in sandbox and create manifest for deployment
     */
    private processAssetsInSandbox;
    /**
     * Get protocol for host (utility method)
     */
    private getProtocolForHost;
    private createLatestCommit;
    /**
     * Export generated app to GitHub (creates repository if needed, then pushes files)
     */
    exportToGitHub(instanceId: string, request: GitHubExportRequest): Promise<GitHubExportResponse>;
    /**
     * Push files to GitHub using secure API-based approach
     * Extracts git context from sandbox and delegates to GitHubService
     */
    pushToGitHub(instanceId: string, request: GitHubPushRequest): Promise<GitHubPushResponse>;
    /**
     * Extract git history and file tracking information from local repository
     */
    private extractGitContext;
    /**
     * Read contents of git files (both tracked and untracked)
     */
    private getGitTrackedFiles;
    /**
     * Map enhanced severity levels to legacy format for backward compatibility
     */
    private mapSeverityToLegacy;
}
