"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubPushResponseSchema = exports.GitHubExportResponseSchema = exports.RunnerServiceWebhookPayloadSchema = exports.WebhookPayloadSchema = exports.WebhookEventSchema = exports.WebhookCommandExecutionEventSchema = exports.WebhookInstanceHealthEventSchema = exports.WebhookDeploymentStatusEventSchema = exports.WebhookBuildStatusEventSchema = exports.WebhookRuntimeErrorEventSchema = exports.WebhookEventBaseSchema = exports.DeploymentResultSchema = exports.DeploymentCredentialsSchema = exports.StaticAnalysisResponseSchema = exports.CodeIssueResponseSchema = exports.CodeIssueSchema = exports.LintSeveritySchema = exports.GenerateTemplateResponseSchema = exports.GenerateTemplateRequestSchema = exports.PromoteToTemplateResponseSchema = exports.PromoteToTemplateRequestSchema = exports.ShutdownResponseSchema = exports.FixCodeResponseSchema = exports.ClearErrorsResponseSchema = exports.RuntimeErrorResponseSchema = exports.ExecuteCommandsResponseSchema = exports.ExecuteCommandsRequestSchema = exports.GetLogsResponseSchema = exports.WriteFilesResponseSchema = exports.GetFilesResponseSchema = exports.WriteFilesRequestSchema = exports.GetInstanceResponseSchema = exports.ListInstancesResponseSchema = exports.BootstrapStatusResponseSchema = exports.BootstrapResponseSchema = exports.PreviewSchema = exports.BootstrapRequestSchema = exports.GetTemplateFilesResponseSchema = exports.GetTemplateFilesRequestSchema = exports.TemplateDetailsResponseSchema = exports.TemplateListResponseSchema = exports.TemplateInfoSchema = exports.CommandExecutionResultSchema = exports.InstanceDetailsSchema = exports.RuntimeErrorSchema = exports.TemplateDetailsSchema = exports.TemplateFileSchema = exports.FileTreeNodeSchema = void 0;
var z = require("zod");
exports.FileTreeNodeSchema = z.lazy(function () { return z.object({
    path: z.string(),
    type: z.enum(['file', 'directory']),
    children: z.array(exports.FileTreeNodeSchema).optional(),
}); });
exports.TemplateFileSchema = z.object({
    filePath: z.string(),
    fileContents: z.string(),
});
// --- Template Details ---
exports.TemplateDetailsSchema = z.object({
    name: z.string(),
    description: z.object({
        selection: z.string(),
        usage: z.string(),
    }),
    fileTree: exports.FileTreeNodeSchema,
    files: z.array(exports.TemplateFileSchema),
    language: z.string().optional(),
    deps: z.record(z.string(), z.string()),
    frameworks: z.array(z.string()).optional(),
    dontTouchFiles: z.array(z.string()),
    redactedFiles: z.array(z.string()),
});
// --- Instance Details ---
exports.RuntimeErrorSchema = z.object({
    timestamp: z.union([z.string(), z.date()]),
    message: z.string(),
    stack: z.string().optional(),
    source: z.string().optional(),
    filePath: z.string().optional(),
    lineNumber: z.number().optional(),
    columnNumber: z.number().optional(),
    severity: z.enum(['warning', 'error', 'fatal']),
    rawOutput: z.string().optional(),
});
exports.InstanceDetailsSchema = z.object({
    runId: z.string(),
    templateName: z.string(),
    startTime: z.union([z.string(), z.date()]),
    uptime: z.number(),
    previewURL: z.string().optional(),
    tunnelURL: z.string().optional(),
    directory: z.string(),
    serviceDirectory: z.string(),
    fileTree: exports.FileTreeNodeSchema.optional(),
    runtimeErrors: z.array(exports.RuntimeErrorSchema).optional(),
    processId: z.string().optional(),
});
// --- Command Execution ---
exports.CommandExecutionResultSchema = z.object({
    command: z.string(),
    success: z.boolean(),
    output: z.string(),
    error: z.string().optional(),
    exitCode: z.number().optional(),
});
// --- API Request/Response Schemas ---
// /templates (GET)
exports.TemplateInfoSchema = z.object({
    name: z.string(),
    language: z.string().optional(),
    frameworks: z.array(z.string()).optional(),
    description: z.object({
        selection: z.string(),
        usage: z.string(),
    })
});
exports.TemplateListResponseSchema = z.object({
    success: z.boolean(),
    templates: z.array(exports.TemplateInfoSchema),
    count: z.number(),
    error: z.string().optional(),
});
// /template/:name (GET)
exports.TemplateDetailsResponseSchema = z.object({
    success: z.boolean(),
    templateDetails: exports.TemplateDetailsSchema.optional(),
    error: z.string().optional(),
});
// /template/:name/files (POST)
exports.GetTemplateFilesRequestSchema = z.object({
    filePaths: z.array(z.string()),
});
exports.GetTemplateFilesResponseSchema = z.object({
    success: z.boolean(),
    files: z.array(exports.TemplateFileSchema),
    errors: z.array(z.object({ file: z.string(), error: z.string() })).optional(),
    error: z.string().optional(),
});
exports.BootstrapRequestSchema = z.object({
    templateName: z.string(),
    projectName: z.string(),
    webhookUrl: z.string().url().optional(),
    envVars: z.record(z.string(), z.string()).optional(),
});
exports.PreviewSchema = z.object({
    runId: z.string().optional(),
    previewURL: z.string().optional(),
    tunnelURL: z.string().optional(),
});
exports.BootstrapResponseSchema = exports.PreviewSchema.extend({
    success: z.boolean(),
    processId: z.string().optional(),
    message: z.string().optional(),
    error: z.string().optional(),
});
// /instances/:id/status (GET)
exports.BootstrapStatusResponseSchema = z.object({
    success: z.boolean(),
    pending: z.boolean(),
    message: z.string().optional(),
    previewURL: z.string().optional(),
    tunnelURL: z.string().optional(),
    processId: z.string().optional(),
    isHealthy: z.boolean(),
    error: z.string().optional(),
});
// /instances (GET)
exports.ListInstancesResponseSchema = z.object({
    success: z.boolean(),
    instances: z.array(exports.InstanceDetailsSchema),
    count: z.number(),
    error: z.string().optional(),
});
// /instances/:id (GET)
exports.GetInstanceResponseSchema = z.object({
    success: z.boolean(),
    instance: exports.InstanceDetailsSchema.optional(),
    error: z.string().optional(),
});
// /instances/:id/files (POST)
exports.WriteFilesRequestSchema = z.object({
    files: z.array(z.object({
        filePath: z.string(),
        fileContents: z.string(),
    })),
    commitMessage: z.string().optional(),
});
// /instances/:id/files (GET) - Define schema for getting files from an instance
exports.GetFilesResponseSchema = z.object({
    success: z.boolean(),
    files: z.array(exports.TemplateFileSchema), // Re-use TemplateFileSchema { filePath, fileContents }
    errors: z.array(z.object({ file: z.string(), error: z.string() })).optional(),
    error: z.string().optional(),
});
exports.WriteFilesResponseSchema = z.object({
    success: z.boolean(),
    message: z.string().optional(),
    results: z.array(z.object({
        file: z.string(),
        success: z.boolean(),
        error: z.string().optional(),
    })),
    error: z.string().optional(),
});
exports.GetLogsResponseSchema = z.object({
    success: z.boolean(),
    logs: z.object({
        stdout: z.string(),
        stderr: z.string(),
    }),
    error: z.string().optional(),
});
// /instances/:id/commands (POST)
exports.ExecuteCommandsRequestSchema = z.object({
    commands: z.array(z.string()),
    timeout: z.number().optional(),
});
exports.ExecuteCommandsResponseSchema = z.object({
    success: z.boolean(),
    results: z.array(exports.CommandExecutionResultSchema),
    message: z.string().optional(),
    error: z.string().optional(),
});
// /instances/:id/errors (GET)
exports.RuntimeErrorResponseSchema = z.object({
    success: z.boolean(),
    errors: z.array(exports.RuntimeErrorSchema),
    hasErrors: z.boolean(),
    error: z.string().optional(),
});
// /instances/:id/errors (DELETE)
exports.ClearErrorsResponseSchema = z.object({
    success: z.boolean(),
    message: z.string().optional(),
    error: z.string().optional(),
});
// /instances/:id/fix-code (POST)
exports.FixCodeResponseSchema = z.object({
    success: z.boolean(),
    message: z.string().optional(),
    fixes: z.array(z.object({
        filePath: z.string(),
        originalCode: z.string(),
        fixedCode: z.string(),
        explanation: z.string(),
    })),
    applied: z.array(z.string()).optional(),
    failed: z.array(z.string()).optional(),
    commands: z.array(z.string()).optional(),
    error: z.string().optional(),
});
// /instances/:id (DELETE)
exports.ShutdownResponseSchema = z.object({
    success: z.boolean(),
    message: z.string().optional(),
    error: z.string().optional(),
});
// /templates/from-instance (POST)
exports.PromoteToTemplateRequestSchema = z.object({
    instanceId: z.string(),
    templateName: z.string().optional(),
});
exports.PromoteToTemplateResponseSchema = z.object({
    success: z.boolean(),
    message: z.string().optional(),
    templateName: z.string().optional(),
    error: z.string().optional(),
});
// /templates (POST) - AI template generation
exports.GenerateTemplateRequestSchema = z.object({
    prompt: z.string(),
    templateName: z.string(),
    options: z.object({
        framework: z.string().optional(),
        language: z.enum(['javascript', 'typescript']).optional(),
        styling: z.enum(['tailwind', 'css', 'scss']).optional(),
        features: z.array(z.string()).optional(),
    }).optional(),
});
exports.GenerateTemplateResponseSchema = z.object({
    success: z.boolean(),
    templateName: z.string(),
    summary: z.string().optional(),
    fileCount: z.number().optional(),
    fileTree: exports.FileTreeNodeSchema.optional(),
    error: z.string().optional(),
});
// /instances/:id/lint (GET)
exports.LintSeveritySchema = z.enum(['error', 'warning', 'info']);
exports.CodeIssueSchema = z.object({
    message: z.string(),
    filePath: z.string(),
    line: z.number(),
    column: z.number().optional(),
    severity: exports.LintSeveritySchema,
    ruleId: z.string().optional(),
    source: z.string().optional()
});
exports.CodeIssueResponseSchema = z.object({
    issues: z.array(exports.CodeIssueSchema),
    summary: z.object({
        errorCount: z.number(),
        warningCount: z.number(),
        infoCount: z.number()
    }).optional(),
    rawOutput: z.string().optional(),
});
exports.StaticAnalysisResponseSchema = z.object({
    success: z.boolean(),
    lint: exports.CodeIssueResponseSchema,
    typecheck: exports.CodeIssueResponseSchema,
    error: z.string().optional()
});
// --- Cloudflare Deployment ---
// /instances/:id/deploy (POST) - Request body
exports.DeploymentCredentialsSchema = z.object({
    apiToken: z.string().optional(),
    accountId: z.string().optional(),
});
// /instances/:id/deploy (POST) - Response
exports.DeploymentResultSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    deployedUrl: z.string().optional(),
    deploymentId: z.string().optional(),
    output: z.string().optional(),
    error: z.string().optional(),
});
// --- Webhook Event Types ---
// Base webhook event schema
exports.WebhookEventBaseSchema = z.object({
    eventType: z.string(),
    instanceId: z.string(),
    timestamp: z.union([z.string(), z.date()]).transform(function (val) { return typeof val === 'string' ? val : val.toISOString(); }),
    agentId: z.string().optional(),
});
// Runtime error webhook event - compatible with current runner service
exports.WebhookRuntimeErrorEventSchema = exports.WebhookEventBaseSchema.extend({
    eventType: z.literal('runtime_error'),
    payload: z.object({
        runId: z.string(),
        error: exports.RuntimeErrorSchema,
        instanceInfo: z.object({
            templateName: z.string().optional(),
            serviceDirectory: z.string().optional(),
        }),
    }),
});
// Build status webhook event (for future use)
exports.WebhookBuildStatusEventSchema = exports.WebhookEventBaseSchema.extend({
    eventType: z.literal('build_status'),
    payload: z.object({
        status: z.enum(['started', 'completed', 'failed']),
        buildOutput: z.string().optional(),
        buildErrors: z.array(z.string()).optional(),
        duration: z.number().optional(),
    }),
});
// Deployment status webhook event (for future use)
exports.WebhookDeploymentStatusEventSchema = exports.WebhookEventBaseSchema.extend({
    eventType: z.literal('deployment_status'),
    payload: z.object({
        status: z.enum(['started', 'completed', 'failed']),
        deploymentType: z.enum(['preview', 'cloudflare_workers']).optional(),
        deployedUrl: z.string().optional(),
        deploymentId: z.string().optional(),
        error: z.string().optional(),
    }),
});
// Instance health webhook event (for future use)
exports.WebhookInstanceHealthEventSchema = exports.WebhookEventBaseSchema.extend({
    eventType: z.literal('instance_health'),
    payload: z.object({
        status: z.enum(['healthy', 'unhealthy', 'shutting_down']),
        uptime: z.number().optional(),
        memoryUsage: z.number().optional(),
        cpuUsage: z.number().optional(),
        lastActivity: z.union([z.string(), z.date()]).optional(),
        message: z.string().optional(),
    }),
});
// Command execution webhook event (for future use)
exports.WebhookCommandExecutionEventSchema = exports.WebhookEventBaseSchema.extend({
    eventType: z.literal('command_execution'),
    payload: z.object({
        status: z.enum(['started', 'completed', 'failed']),
        command: z.string(),
        output: z.string().optional(),
        error: z.string().optional(),
        exitCode: z.number().optional(),
        duration: z.number().optional(),
    }),
});
// Union type for all webhook events
exports.WebhookEventSchema = z.discriminatedUnion('eventType', [
    exports.WebhookRuntimeErrorEventSchema,
    exports.WebhookBuildStatusEventSchema,
    exports.WebhookDeploymentStatusEventSchema,
    exports.WebhookInstanceHealthEventSchema,
    exports.WebhookCommandExecutionEventSchema,
]);
// Webhook payload with authentication
exports.WebhookPayloadSchema = z.object({
    signature: z.string().optional(),
    timestamp: z.union([z.string(), z.date()]),
    event: exports.WebhookEventSchema,
});
// Current runner service payload (direct payload without wrapper)
exports.RunnerServiceWebhookPayloadSchema = z.object({
    runId: z.string(),
    error: exports.RuntimeErrorSchema,
    instanceInfo: z.object({
        templateName: z.string().optional(),
        serviceDirectory: z.string().optional(),
    }),
});
exports.GitHubExportResponseSchema = z.object({
    success: z.boolean(),
    repositoryUrl: z.string().optional(),
    cloneUrl: z.string().optional(),
    commitSha: z.string().optional(),
    error: z.string().optional(),
});
exports.GitHubPushResponseSchema = z.object({
    success: z.boolean(),
    commitSha: z.string().optional(),
    error: z.string().optional(),
    details: z.object({
        operation: z.string().optional(),
        exitCode: z.number().optional(),
        stderr: z.string().optional(),
    }).optional(),
});
