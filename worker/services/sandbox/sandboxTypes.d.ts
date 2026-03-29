import * as z from 'zod';
export interface FileTreeNode {
    path: string;
    type: 'file' | 'directory';
    children?: FileTreeNode[];
}
export declare const FileTreeNodeSchema: z.ZodType<FileTreeNode>;
export declare const TemplateFileSchema: z.ZodObject<{
    filePath: z.ZodString;
    fileContents: z.ZodString;
}, "strip", z.ZodTypeAny, {
    filePath?: string;
    fileContents?: string;
}, {
    filePath?: string;
    fileContents?: string;
}>;
export type TemplateFile = z.infer<typeof TemplateFileSchema>;
export declare const TemplateDetailsSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodObject<{
        selection: z.ZodString;
        usage: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        usage?: string;
        selection?: string;
    }, {
        usage?: string;
        selection?: string;
    }>;
    fileTree: z.ZodType<FileTreeNode, z.ZodTypeDef, FileTreeNode>;
    files: z.ZodArray<z.ZodObject<{
        filePath: z.ZodString;
        fileContents: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        filePath?: string;
        fileContents?: string;
    }, {
        filePath?: string;
        fileContents?: string;
    }>, "many">;
    language: z.ZodOptional<z.ZodString>;
    deps: z.ZodRecord<z.ZodString, z.ZodString>;
    frameworks: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    dontTouchFiles: z.ZodArray<z.ZodString, "many">;
    redactedFiles: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: {
        usage?: string;
        selection?: string;
    };
    language?: string;
    files?: {
        filePath?: string;
        fileContents?: string;
    }[];
    frameworks?: string[];
    fileTree?: FileTreeNode;
    deps?: Record<string, string>;
    dontTouchFiles?: string[];
    redactedFiles?: string[];
}, {
    name?: string;
    description?: {
        usage?: string;
        selection?: string;
    };
    language?: string;
    files?: {
        filePath?: string;
        fileContents?: string;
    }[];
    frameworks?: string[];
    fileTree?: FileTreeNode;
    deps?: Record<string, string>;
    dontTouchFiles?: string[];
    redactedFiles?: string[];
}>;
export type TemplateDetails = z.infer<typeof TemplateDetailsSchema>;
export declare const RuntimeErrorSchema: z.ZodObject<{
    timestamp: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    message: z.ZodString;
    stack: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodString>;
    filePath: z.ZodOptional<z.ZodString>;
    lineNumber: z.ZodOptional<z.ZodNumber>;
    columnNumber: z.ZodOptional<z.ZodNumber>;
    severity: z.ZodEnum<["warning", "error", "fatal"]>;
    rawOutput: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message?: string;
    source?: string;
    stack?: string;
    timestamp?: string | Date;
    filePath?: string;
    lineNumber?: number;
    columnNumber?: number;
    severity?: "error" | "fatal" | "warning";
    rawOutput?: string;
}, {
    message?: string;
    source?: string;
    stack?: string;
    timestamp?: string | Date;
    filePath?: string;
    lineNumber?: number;
    columnNumber?: number;
    severity?: "error" | "fatal" | "warning";
    rawOutput?: string;
}>;
export type RuntimeError = z.infer<typeof RuntimeErrorSchema>;
export declare const InstanceDetailsSchema: z.ZodObject<{
    runId: z.ZodString;
    templateName: z.ZodString;
    startTime: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    uptime: z.ZodNumber;
    previewURL: z.ZodOptional<z.ZodString>;
    tunnelURL: z.ZodOptional<z.ZodString>;
    directory: z.ZodString;
    serviceDirectory: z.ZodString;
    fileTree: z.ZodOptional<z.ZodType<FileTreeNode, z.ZodTypeDef, FileTreeNode>>;
    runtimeErrors: z.ZodOptional<z.ZodArray<z.ZodObject<{
        timestamp: z.ZodUnion<[z.ZodString, z.ZodDate]>;
        message: z.ZodString;
        stack: z.ZodOptional<z.ZodString>;
        source: z.ZodOptional<z.ZodString>;
        filePath: z.ZodOptional<z.ZodString>;
        lineNumber: z.ZodOptional<z.ZodNumber>;
        columnNumber: z.ZodOptional<z.ZodNumber>;
        severity: z.ZodEnum<["warning", "error", "fatal"]>;
        rawOutput: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message?: string;
        source?: string;
        stack?: string;
        timestamp?: string | Date;
        filePath?: string;
        lineNumber?: number;
        columnNumber?: number;
        severity?: "error" | "fatal" | "warning";
        rawOutput?: string;
    }, {
        message?: string;
        source?: string;
        stack?: string;
        timestamp?: string | Date;
        filePath?: string;
        lineNumber?: number;
        columnNumber?: number;
        severity?: "error" | "fatal" | "warning";
        rawOutput?: string;
    }>, "many">>;
    processId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fileTree?: FileTreeNode;
    runId?: string;
    templateName?: string;
    startTime?: string | Date;
    uptime?: number;
    previewURL?: string;
    tunnelURL?: string;
    directory?: string;
    serviceDirectory?: string;
    runtimeErrors?: {
        message?: string;
        source?: string;
        stack?: string;
        timestamp?: string | Date;
        filePath?: string;
        lineNumber?: number;
        columnNumber?: number;
        severity?: "error" | "fatal" | "warning";
        rawOutput?: string;
    }[];
    processId?: string;
}, {
    fileTree?: FileTreeNode;
    runId?: string;
    templateName?: string;
    startTime?: string | Date;
    uptime?: number;
    previewURL?: string;
    tunnelURL?: string;
    directory?: string;
    serviceDirectory?: string;
    runtimeErrors?: {
        message?: string;
        source?: string;
        stack?: string;
        timestamp?: string | Date;
        filePath?: string;
        lineNumber?: number;
        columnNumber?: number;
        severity?: "error" | "fatal" | "warning";
        rawOutput?: string;
    }[];
    processId?: string;
}>;
export type InstanceDetails = z.infer<typeof InstanceDetailsSchema>;
export declare const CommandExecutionResultSchema: z.ZodObject<{
    command: z.ZodString;
    success: z.ZodBoolean;
    output: z.ZodString;
    error: z.ZodOptional<z.ZodString>;
    exitCode: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    error?: string;
    output?: string;
    success?: boolean;
    command?: string;
    exitCode?: number;
}, {
    error?: string;
    output?: string;
    success?: boolean;
    command?: string;
    exitCode?: number;
}>;
export type CommandExecutionResult = z.infer<typeof CommandExecutionResultSchema>;
export declare const TemplateInfoSchema: z.ZodObject<{
    name: z.ZodString;
    language: z.ZodOptional<z.ZodString>;
    frameworks: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    description: z.ZodObject<{
        selection: z.ZodString;
        usage: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        usage?: string;
        selection?: string;
    }, {
        usage?: string;
        selection?: string;
    }>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: {
        usage?: string;
        selection?: string;
    };
    language?: string;
    frameworks?: string[];
}, {
    name?: string;
    description?: {
        usage?: string;
        selection?: string;
    };
    language?: string;
    frameworks?: string[];
}>;
export type TemplateInfo = z.infer<typeof TemplateInfoSchema>;
export declare const TemplateListResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    templates: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        language: z.ZodOptional<z.ZodString>;
        frameworks: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        description: z.ZodObject<{
            selection: z.ZodString;
            usage: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            usage?: string;
            selection?: string;
        }, {
            usage?: string;
            selection?: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        description?: {
            usage?: string;
            selection?: string;
        };
        language?: string;
        frameworks?: string[];
    }, {
        name?: string;
        description?: {
            usage?: string;
            selection?: string;
        };
        language?: string;
        frameworks?: string[];
    }>, "many">;
    count: z.ZodNumber;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error?: string;
    success?: boolean;
    templates?: {
        name?: string;
        description?: {
            usage?: string;
            selection?: string;
        };
        language?: string;
        frameworks?: string[];
    }[];
    count?: number;
}, {
    error?: string;
    success?: boolean;
    templates?: {
        name?: string;
        description?: {
            usage?: string;
            selection?: string;
        };
        language?: string;
        frameworks?: string[];
    }[];
    count?: number;
}>;
export type TemplateListResponse = z.infer<typeof TemplateListResponseSchema>;
export declare const TemplateDetailsResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    templateDetails: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodObject<{
            selection: z.ZodString;
            usage: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            usage?: string;
            selection?: string;
        }, {
            usage?: string;
            selection?: string;
        }>;
        fileTree: z.ZodType<FileTreeNode, z.ZodTypeDef, FileTreeNode>;
        files: z.ZodArray<z.ZodObject<{
            filePath: z.ZodString;
            fileContents: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            filePath?: string;
            fileContents?: string;
        }, {
            filePath?: string;
            fileContents?: string;
        }>, "many">;
        language: z.ZodOptional<z.ZodString>;
        deps: z.ZodRecord<z.ZodString, z.ZodString>;
        frameworks: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        dontTouchFiles: z.ZodArray<z.ZodString, "many">;
        redactedFiles: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        description?: {
            usage?: string;
            selection?: string;
        };
        language?: string;
        files?: {
            filePath?: string;
            fileContents?: string;
        }[];
        frameworks?: string[];
        fileTree?: FileTreeNode;
        deps?: Record<string, string>;
        dontTouchFiles?: string[];
        redactedFiles?: string[];
    }, {
        name?: string;
        description?: {
            usage?: string;
            selection?: string;
        };
        language?: string;
        files?: {
            filePath?: string;
            fileContents?: string;
        }[];
        frameworks?: string[];
        fileTree?: FileTreeNode;
        deps?: Record<string, string>;
        dontTouchFiles?: string[];
        redactedFiles?: string[];
    }>>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error?: string;
    success?: boolean;
    templateDetails?: {
        name?: string;
        description?: {
            usage?: string;
            selection?: string;
        };
        language?: string;
        files?: {
            filePath?: string;
            fileContents?: string;
        }[];
        frameworks?: string[];
        fileTree?: FileTreeNode;
        deps?: Record<string, string>;
        dontTouchFiles?: string[];
        redactedFiles?: string[];
    };
}, {
    error?: string;
    success?: boolean;
    templateDetails?: {
        name?: string;
        description?: {
            usage?: string;
            selection?: string;
        };
        language?: string;
        files?: {
            filePath?: string;
            fileContents?: string;
        }[];
        frameworks?: string[];
        fileTree?: FileTreeNode;
        deps?: Record<string, string>;
        dontTouchFiles?: string[];
        redactedFiles?: string[];
    };
}>;
export type TemplateDetailsResponse = z.infer<typeof TemplateDetailsResponseSchema>;
export declare const GetTemplateFilesRequestSchema: z.ZodObject<{
    filePaths: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    filePaths?: string[];
}, {
    filePaths?: string[];
}>;
export type GetTemplateFilesRequest = z.infer<typeof GetTemplateFilesRequestSchema>;
export declare const GetTemplateFilesResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    files: z.ZodArray<z.ZodObject<{
        filePath: z.ZodString;
        fileContents: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        filePath?: string;
        fileContents?: string;
    }, {
        filePath?: string;
        fileContents?: string;
    }>, "many">;
    errors: z.ZodOptional<z.ZodArray<z.ZodObject<{
        file: z.ZodString;
        error: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        error?: string;
        file?: string;
    }, {
        error?: string;
        file?: string;
    }>, "many">>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error?: string;
    errors?: {
        error?: string;
        file?: string;
    }[];
    success?: boolean;
    files?: {
        filePath?: string;
        fileContents?: string;
    }[];
}, {
    error?: string;
    errors?: {
        error?: string;
        file?: string;
    }[];
    success?: boolean;
    files?: {
        filePath?: string;
        fileContents?: string;
    }[];
}>;
export type GetTemplateFilesResponse = z.infer<typeof GetTemplateFilesResponseSchema>;
export declare const BootstrapRequestSchema: z.ZodObject<{
    templateName: z.ZodString;
    projectName: z.ZodString;
    webhookUrl: z.ZodOptional<z.ZodString>;
    envVars: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    projectName?: string;
    templateName?: string;
    webhookUrl?: string;
    envVars?: Record<string, string>;
}, {
    projectName?: string;
    templateName?: string;
    webhookUrl?: string;
    envVars?: Record<string, string>;
}>;
export type BootstrapRequest = z.infer<typeof BootstrapRequestSchema>;
export declare const PreviewSchema: z.ZodObject<{
    runId: z.ZodOptional<z.ZodString>;
    previewURL: z.ZodOptional<z.ZodString>;
    tunnelURL: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    runId?: string;
    previewURL?: string;
    tunnelURL?: string;
}, {
    runId?: string;
    previewURL?: string;
    tunnelURL?: string;
}>;
export type PreviewType = z.infer<typeof PreviewSchema>;
export declare const BootstrapResponseSchema: z.ZodObject<{
    runId: z.ZodOptional<z.ZodString>;
    previewURL: z.ZodOptional<z.ZodString>;
    tunnelURL: z.ZodOptional<z.ZodString>;
} & {
    success: z.ZodBoolean;
    processId: z.ZodOptional<z.ZodString>;
    message: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error?: string;
    message?: string;
    success?: boolean;
    runId?: string;
    previewURL?: string;
    tunnelURL?: string;
    processId?: string;
}, {
    error?: string;
    message?: string;
    success?: boolean;
    runId?: string;
    previewURL?: string;
    tunnelURL?: string;
    processId?: string;
}>;
export type BootstrapResponse = z.infer<typeof BootstrapResponseSchema>;
export declare const BootstrapStatusResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    pending: z.ZodBoolean;
    message: z.ZodOptional<z.ZodString>;
    previewURL: z.ZodOptional<z.ZodString>;
    tunnelURL: z.ZodOptional<z.ZodString>;
    processId: z.ZodOptional<z.ZodString>;
    isHealthy: z.ZodBoolean;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error?: string;
    message?: string;
    success?: boolean;
    previewURL?: string;
    tunnelURL?: string;
    processId?: string;
    pending?: boolean;
    isHealthy?: boolean;
}, {
    error?: string;
    message?: string;
    success?: boolean;
    previewURL?: string;
    tunnelURL?: string;
    processId?: string;
    pending?: boolean;
    isHealthy?: boolean;
}>;
export type BootstrapStatusResponse = z.infer<typeof BootstrapStatusResponseSchema>;
export declare const ListInstancesResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    instances: z.ZodArray<z.ZodObject<{
        runId: z.ZodString;
        templateName: z.ZodString;
        startTime: z.ZodUnion<[z.ZodString, z.ZodDate]>;
        uptime: z.ZodNumber;
        previewURL: z.ZodOptional<z.ZodString>;
        tunnelURL: z.ZodOptional<z.ZodString>;
        directory: z.ZodString;
        serviceDirectory: z.ZodString;
        fileTree: z.ZodOptional<z.ZodType<FileTreeNode, z.ZodTypeDef, FileTreeNode>>;
        runtimeErrors: z.ZodOptional<z.ZodArray<z.ZodObject<{
            timestamp: z.ZodUnion<[z.ZodString, z.ZodDate]>;
            message: z.ZodString;
            stack: z.ZodOptional<z.ZodString>;
            source: z.ZodOptional<z.ZodString>;
            filePath: z.ZodOptional<z.ZodString>;
            lineNumber: z.ZodOptional<z.ZodNumber>;
            columnNumber: z.ZodOptional<z.ZodNumber>;
            severity: z.ZodEnum<["warning", "error", "fatal"]>;
            rawOutput: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            message?: string;
            source?: string;
            stack?: string;
            timestamp?: string | Date;
            filePath?: string;
            lineNumber?: number;
            columnNumber?: number;
            severity?: "error" | "fatal" | "warning";
            rawOutput?: string;
        }, {
            message?: string;
            source?: string;
            stack?: string;
            timestamp?: string | Date;
            filePath?: string;
            lineNumber?: number;
            columnNumber?: number;
            severity?: "error" | "fatal" | "warning";
            rawOutput?: string;
        }>, "many">>;
        processId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        fileTree?: FileTreeNode;
        runId?: string;
        templateName?: string;
        startTime?: string | Date;
        uptime?: number;
        previewURL?: string;
        tunnelURL?: string;
        directory?: string;
        serviceDirectory?: string;
        runtimeErrors?: {
            message?: string;
            source?: string;
            stack?: string;
            timestamp?: string | Date;
            filePath?: string;
            lineNumber?: number;
            columnNumber?: number;
            severity?: "error" | "fatal" | "warning";
            rawOutput?: string;
        }[];
        processId?: string;
    }, {
        fileTree?: FileTreeNode;
        runId?: string;
        templateName?: string;
        startTime?: string | Date;
        uptime?: number;
        previewURL?: string;
        tunnelURL?: string;
        directory?: string;
        serviceDirectory?: string;
        runtimeErrors?: {
            message?: string;
            source?: string;
            stack?: string;
            timestamp?: string | Date;
            filePath?: string;
            lineNumber?: number;
            columnNumber?: number;
            severity?: "error" | "fatal" | "warning";
            rawOutput?: string;
        }[];
        processId?: string;
    }>, "many">;
    count: z.ZodNumber;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error?: string;
    success?: boolean;
    count?: number;
    instances?: {
        fileTree?: FileTreeNode;
        runId?: string;
        templateName?: string;
        startTime?: string | Date;
        uptime?: number;
        previewURL?: string;
        tunnelURL?: string;
        directory?: string;
        serviceDirectory?: string;
        runtimeErrors?: {
            message?: string;
            source?: string;
            stack?: string;
            timestamp?: string | Date;
            filePath?: string;
            lineNumber?: number;
            columnNumber?: number;
            severity?: "error" | "fatal" | "warning";
            rawOutput?: string;
        }[];
        processId?: string;
    }[];
}, {
    error?: string;
    success?: boolean;
    count?: number;
    instances?: {
        fileTree?: FileTreeNode;
        runId?: string;
        templateName?: string;
        startTime?: string | Date;
        uptime?: number;
        previewURL?: string;
        tunnelURL?: string;
        directory?: string;
        serviceDirectory?: string;
        runtimeErrors?: {
            message?: string;
            source?: string;
            stack?: string;
            timestamp?: string | Date;
            filePath?: string;
            lineNumber?: number;
            columnNumber?: number;
            severity?: "error" | "fatal" | "warning";
            rawOutput?: string;
        }[];
        processId?: string;
    }[];
}>;
export type ListInstancesResponse = z.infer<typeof ListInstancesResponseSchema>;
export declare const GetInstanceResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    instance: z.ZodOptional<z.ZodObject<{
        runId: z.ZodString;
        templateName: z.ZodString;
        startTime: z.ZodUnion<[z.ZodString, z.ZodDate]>;
        uptime: z.ZodNumber;
        previewURL: z.ZodOptional<z.ZodString>;
        tunnelURL: z.ZodOptional<z.ZodString>;
        directory: z.ZodString;
        serviceDirectory: z.ZodString;
        fileTree: z.ZodOptional<z.ZodType<FileTreeNode, z.ZodTypeDef, FileTreeNode>>;
        runtimeErrors: z.ZodOptional<z.ZodArray<z.ZodObject<{
            timestamp: z.ZodUnion<[z.ZodString, z.ZodDate]>;
            message: z.ZodString;
            stack: z.ZodOptional<z.ZodString>;
            source: z.ZodOptional<z.ZodString>;
            filePath: z.ZodOptional<z.ZodString>;
            lineNumber: z.ZodOptional<z.ZodNumber>;
            columnNumber: z.ZodOptional<z.ZodNumber>;
            severity: z.ZodEnum<["warning", "error", "fatal"]>;
            rawOutput: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            message?: string;
            source?: string;
            stack?: string;
            timestamp?: string | Date;
            filePath?: string;
            lineNumber?: number;
            columnNumber?: number;
            severity?: "error" | "fatal" | "warning";
            rawOutput?: string;
        }, {
            message?: string;
            source?: string;
            stack?: string;
            timestamp?: string | Date;
            filePath?: string;
            lineNumber?: number;
            columnNumber?: number;
            severity?: "error" | "fatal" | "warning";
            rawOutput?: string;
        }>, "many">>;
        processId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        fileTree?: FileTreeNode;
        runId?: string;
        templateName?: string;
        startTime?: string | Date;
        uptime?: number;
        previewURL?: string;
        tunnelURL?: string;
        directory?: string;
        serviceDirectory?: string;
        runtimeErrors?: {
            message?: string;
            source?: string;
            stack?: string;
            timestamp?: string | Date;
            filePath?: string;
            lineNumber?: number;
            columnNumber?: number;
            severity?: "error" | "fatal" | "warning";
            rawOutput?: string;
        }[];
        processId?: string;
    }, {
        fileTree?: FileTreeNode;
        runId?: string;
        templateName?: string;
        startTime?: string | Date;
        uptime?: number;
        previewURL?: string;
        tunnelURL?: string;
        directory?: string;
        serviceDirectory?: string;
        runtimeErrors?: {
            message?: string;
            source?: string;
            stack?: string;
            timestamp?: string | Date;
            filePath?: string;
            lineNumber?: number;
            columnNumber?: number;
            severity?: "error" | "fatal" | "warning";
            rawOutput?: string;
        }[];
        processId?: string;
    }>>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error?: string;
    success?: boolean;
    instance?: {
        fileTree?: FileTreeNode;
        runId?: string;
        templateName?: string;
        startTime?: string | Date;
        uptime?: number;
        previewURL?: string;
        tunnelURL?: string;
        directory?: string;
        serviceDirectory?: string;
        runtimeErrors?: {
            message?: string;
            source?: string;
            stack?: string;
            timestamp?: string | Date;
            filePath?: string;
            lineNumber?: number;
            columnNumber?: number;
            severity?: "error" | "fatal" | "warning";
            rawOutput?: string;
        }[];
        processId?: string;
    };
}, {
    error?: string;
    success?: boolean;
    instance?: {
        fileTree?: FileTreeNode;
        runId?: string;
        templateName?: string;
        startTime?: string | Date;
        uptime?: number;
        previewURL?: string;
        tunnelURL?: string;
        directory?: string;
        serviceDirectory?: string;
        runtimeErrors?: {
            message?: string;
            source?: string;
            stack?: string;
            timestamp?: string | Date;
            filePath?: string;
            lineNumber?: number;
            columnNumber?: number;
            severity?: "error" | "fatal" | "warning";
            rawOutput?: string;
        }[];
        processId?: string;
    };
}>;
export type GetInstanceResponse = z.infer<typeof GetInstanceResponseSchema>;
export declare const WriteFilesRequestSchema: z.ZodObject<{
    files: z.ZodArray<z.ZodObject<{
        filePath: z.ZodString;
        fileContents: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        filePath?: string;
        fileContents?: string;
    }, {
        filePath?: string;
        fileContents?: string;
    }>, "many">;
    commitMessage: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    files?: {
        filePath?: string;
        fileContents?: string;
    }[];
    commitMessage?: string;
}, {
    files?: {
        filePath?: string;
        fileContents?: string;
    }[];
    commitMessage?: string;
}>;
export type WriteFilesRequest = z.infer<typeof WriteFilesRequestSchema>;
export declare const GetFilesResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    files: z.ZodArray<z.ZodObject<{
        filePath: z.ZodString;
        fileContents: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        filePath?: string;
        fileContents?: string;
    }, {
        filePath?: string;
        fileContents?: string;
    }>, "many">;
    errors: z.ZodOptional<z.ZodArray<z.ZodObject<{
        file: z.ZodString;
        error: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        error?: string;
        file?: string;
    }, {
        error?: string;
        file?: string;
    }>, "many">>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error?: string;
    errors?: {
        error?: string;
        file?: string;
    }[];
    success?: boolean;
    files?: {
        filePath?: string;
        fileContents?: string;
    }[];
}, {
    error?: string;
    errors?: {
        error?: string;
        file?: string;
    }[];
    success?: boolean;
    files?: {
        filePath?: string;
        fileContents?: string;
    }[];
}>;
export type GetFilesResponse = z.infer<typeof GetFilesResponseSchema>;
export declare const WriteFilesResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodOptional<z.ZodString>;
    results: z.ZodArray<z.ZodObject<{
        file: z.ZodString;
        success: z.ZodBoolean;
        error: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        error?: string;
        file?: string;
        success?: boolean;
    }, {
        error?: string;
        file?: string;
        success?: boolean;
    }>, "many">;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error?: string;
    message?: string;
    success?: boolean;
    results?: {
        error?: string;
        file?: string;
        success?: boolean;
    }[];
}, {
    error?: string;
    message?: string;
    success?: boolean;
    results?: {
        error?: string;
        file?: string;
        success?: boolean;
    }[];
}>;
export type WriteFilesResponse = z.infer<typeof WriteFilesResponseSchema>;
export declare const GetLogsResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    logs: z.ZodObject<{
        stdout: z.ZodString;
        stderr: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        stdout?: string;
        stderr?: string;
    }, {
        stdout?: string;
        stderr?: string;
    }>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error?: string;
    success?: boolean;
    logs?: {
        stdout?: string;
        stderr?: string;
    };
}, {
    error?: string;
    success?: boolean;
    logs?: {
        stdout?: string;
        stderr?: string;
    };
}>;
export type GetLogsResponse = z.infer<typeof GetLogsResponseSchema>;
export declare const ExecuteCommandsRequestSchema: z.ZodObject<{
    commands: z.ZodArray<z.ZodString, "many">;
    timeout: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    timeout?: number;
    commands?: string[];
}, {
    timeout?: number;
    commands?: string[];
}>;
export type ExecuteCommandsRequest = z.infer<typeof ExecuteCommandsRequestSchema>;
export declare const ExecuteCommandsResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    results: z.ZodArray<z.ZodObject<{
        command: z.ZodString;
        success: z.ZodBoolean;
        output: z.ZodString;
        error: z.ZodOptional<z.ZodString>;
        exitCode: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        error?: string;
        output?: string;
        success?: boolean;
        command?: string;
        exitCode?: number;
    }, {
        error?: string;
        output?: string;
        success?: boolean;
        command?: string;
        exitCode?: number;
    }>, "many">;
    message: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error?: string;
    message?: string;
    success?: boolean;
    results?: {
        error?: string;
        output?: string;
        success?: boolean;
        command?: string;
        exitCode?: number;
    }[];
}, {
    error?: string;
    message?: string;
    success?: boolean;
    results?: {
        error?: string;
        output?: string;
        success?: boolean;
        command?: string;
        exitCode?: number;
    }[];
}>;
export type ExecuteCommandsResponse = z.infer<typeof ExecuteCommandsResponseSchema>;
export declare const RuntimeErrorResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    errors: z.ZodArray<z.ZodObject<{
        timestamp: z.ZodUnion<[z.ZodString, z.ZodDate]>;
        message: z.ZodString;
        stack: z.ZodOptional<z.ZodString>;
        source: z.ZodOptional<z.ZodString>;
        filePath: z.ZodOptional<z.ZodString>;
        lineNumber: z.ZodOptional<z.ZodNumber>;
        columnNumber: z.ZodOptional<z.ZodNumber>;
        severity: z.ZodEnum<["warning", "error", "fatal"]>;
        rawOutput: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message?: string;
        source?: string;
        stack?: string;
        timestamp?: string | Date;
        filePath?: string;
        lineNumber?: number;
        columnNumber?: number;
        severity?: "error" | "fatal" | "warning";
        rawOutput?: string;
    }, {
        message?: string;
        source?: string;
        stack?: string;
        timestamp?: string | Date;
        filePath?: string;
        lineNumber?: number;
        columnNumber?: number;
        severity?: "error" | "fatal" | "warning";
        rawOutput?: string;
    }>, "many">;
    hasErrors: z.ZodBoolean;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error?: string;
    errors?: {
        message?: string;
        source?: string;
        stack?: string;
        timestamp?: string | Date;
        filePath?: string;
        lineNumber?: number;
        columnNumber?: number;
        severity?: "error" | "fatal" | "warning";
        rawOutput?: string;
    }[];
    success?: boolean;
    hasErrors?: boolean;
}, {
    error?: string;
    errors?: {
        message?: string;
        source?: string;
        stack?: string;
        timestamp?: string | Date;
        filePath?: string;
        lineNumber?: number;
        columnNumber?: number;
        severity?: "error" | "fatal" | "warning";
        rawOutput?: string;
    }[];
    success?: boolean;
    hasErrors?: boolean;
}>;
export type RuntimeErrorResponse = z.infer<typeof RuntimeErrorResponseSchema>;
export declare const ClearErrorsResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error?: string;
    message?: string;
    success?: boolean;
}, {
    error?: string;
    message?: string;
    success?: boolean;
}>;
export type ClearErrorsResponse = z.infer<typeof ClearErrorsResponseSchema>;
export declare const FixCodeResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodOptional<z.ZodString>;
    fixes: z.ZodArray<z.ZodObject<{
        filePath: z.ZodString;
        originalCode: z.ZodString;
        fixedCode: z.ZodString;
        explanation: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        filePath?: string;
        originalCode?: string;
        fixedCode?: string;
        explanation?: string;
    }, {
        filePath?: string;
        originalCode?: string;
        fixedCode?: string;
        explanation?: string;
    }>, "many">;
    applied: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    failed: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    commands: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error?: string;
    message?: string;
    failed?: string[];
    success?: boolean;
    commands?: string[];
    fixes?: {
        filePath?: string;
        originalCode?: string;
        fixedCode?: string;
        explanation?: string;
    }[];
    applied?: string[];
}, {
    error?: string;
    message?: string;
    failed?: string[];
    success?: boolean;
    commands?: string[];
    fixes?: {
        filePath?: string;
        originalCode?: string;
        fixedCode?: string;
        explanation?: string;
    }[];
    applied?: string[];
}>;
export type FixCodeResponse = z.infer<typeof FixCodeResponseSchema>;
export declare const ShutdownResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error?: string;
    message?: string;
    success?: boolean;
}, {
    error?: string;
    message?: string;
    success?: boolean;
}>;
export type ShutdownResponse = z.infer<typeof ShutdownResponseSchema>;
export declare const PromoteToTemplateRequestSchema: z.ZodObject<{
    instanceId: z.ZodString;
    templateName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    templateName?: string;
    instanceId?: string;
}, {
    templateName?: string;
    instanceId?: string;
}>;
export type PromoteToTemplateRequest = z.infer<typeof PromoteToTemplateRequestSchema>;
export declare const PromoteToTemplateResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodOptional<z.ZodString>;
    templateName: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error?: string;
    message?: string;
    success?: boolean;
    templateName?: string;
}, {
    error?: string;
    message?: string;
    success?: boolean;
    templateName?: string;
}>;
export type PromoteToTemplateResponse = z.infer<typeof PromoteToTemplateResponseSchema>;
export declare const GenerateTemplateRequestSchema: z.ZodObject<{
    prompt: z.ZodString;
    templateName: z.ZodString;
    options: z.ZodOptional<z.ZodObject<{
        framework: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodEnum<["javascript", "typescript"]>>;
        styling: z.ZodOptional<z.ZodEnum<["tailwind", "css", "scss"]>>;
        features: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        language?: "javascript" | "typescript";
        framework?: string;
        styling?: "tailwind" | "css" | "scss";
        features?: string[];
    }, {
        language?: "javascript" | "typescript";
        framework?: string;
        styling?: "tailwind" | "css" | "scss";
        features?: string[];
    }>>;
}, "strip", z.ZodTypeAny, {
    prompt?: string;
    options?: {
        language?: "javascript" | "typescript";
        framework?: string;
        styling?: "tailwind" | "css" | "scss";
        features?: string[];
    };
    templateName?: string;
}, {
    prompt?: string;
    options?: {
        language?: "javascript" | "typescript";
        framework?: string;
        styling?: "tailwind" | "css" | "scss";
        features?: string[];
    };
    templateName?: string;
}>;
export type GenerateTemplateRequest = z.infer<typeof GenerateTemplateRequestSchema>;
export declare const GenerateTemplateResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    templateName: z.ZodString;
    summary: z.ZodOptional<z.ZodString>;
    fileCount: z.ZodOptional<z.ZodNumber>;
    fileTree: z.ZodOptional<z.ZodType<FileTreeNode, z.ZodTypeDef, FileTreeNode>>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error?: string;
    success?: boolean;
    fileTree?: FileTreeNode;
    templateName?: string;
    summary?: string;
    fileCount?: number;
}, {
    error?: string;
    success?: boolean;
    fileTree?: FileTreeNode;
    templateName?: string;
    summary?: string;
    fileCount?: number;
}>;
export type GenerateTemplateResponse = z.infer<typeof GenerateTemplateResponseSchema>;
export declare const LintSeveritySchema: z.ZodEnum<["error", "warning", "info"]>;
export type LintSeverity = z.infer<typeof LintSeveritySchema>;
export declare const CodeIssueSchema: z.ZodObject<{
    message: z.ZodString;
    filePath: z.ZodString;
    line: z.ZodNumber;
    column: z.ZodOptional<z.ZodNumber>;
    severity: z.ZodEnum<["error", "warning", "info"]>;
    ruleId: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message?: string;
    source?: string;
    line?: number;
    filePath?: string;
    severity?: "info" | "error" | "warning";
    column?: number;
    ruleId?: string;
}, {
    message?: string;
    source?: string;
    line?: number;
    filePath?: string;
    severity?: "info" | "error" | "warning";
    column?: number;
    ruleId?: string;
}>;
export type CodeIssue = z.infer<typeof CodeIssueSchema>;
export declare const CodeIssueResponseSchema: z.ZodObject<{
    issues: z.ZodArray<z.ZodObject<{
        message: z.ZodString;
        filePath: z.ZodString;
        line: z.ZodNumber;
        column: z.ZodOptional<z.ZodNumber>;
        severity: z.ZodEnum<["error", "warning", "info"]>;
        ruleId: z.ZodOptional<z.ZodString>;
        source: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message?: string;
        source?: string;
        line?: number;
        filePath?: string;
        severity?: "info" | "error" | "warning";
        column?: number;
        ruleId?: string;
    }, {
        message?: string;
        source?: string;
        line?: number;
        filePath?: string;
        severity?: "info" | "error" | "warning";
        column?: number;
        ruleId?: string;
    }>, "many">;
    summary: z.ZodOptional<z.ZodObject<{
        errorCount: z.ZodNumber;
        warningCount: z.ZodNumber;
        infoCount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        errorCount?: number;
        warningCount?: number;
        infoCount?: number;
    }, {
        errorCount?: number;
        warningCount?: number;
        infoCount?: number;
    }>>;
    rawOutput: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    issues?: {
        message?: string;
        source?: string;
        line?: number;
        filePath?: string;
        severity?: "info" | "error" | "warning";
        column?: number;
        ruleId?: string;
    }[];
    rawOutput?: string;
    summary?: {
        errorCount?: number;
        warningCount?: number;
        infoCount?: number;
    };
}, {
    issues?: {
        message?: string;
        source?: string;
        line?: number;
        filePath?: string;
        severity?: "info" | "error" | "warning";
        column?: number;
        ruleId?: string;
    }[];
    rawOutput?: string;
    summary?: {
        errorCount?: number;
        warningCount?: number;
        infoCount?: number;
    };
}>;
export type CodeIssueResponse = z.infer<typeof CodeIssueResponseSchema>;
export declare const StaticAnalysisResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    lint: z.ZodObject<{
        issues: z.ZodArray<z.ZodObject<{
            message: z.ZodString;
            filePath: z.ZodString;
            line: z.ZodNumber;
            column: z.ZodOptional<z.ZodNumber>;
            severity: z.ZodEnum<["error", "warning", "info"]>;
            ruleId: z.ZodOptional<z.ZodString>;
            source: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            message?: string;
            source?: string;
            line?: number;
            filePath?: string;
            severity?: "info" | "error" | "warning";
            column?: number;
            ruleId?: string;
        }, {
            message?: string;
            source?: string;
            line?: number;
            filePath?: string;
            severity?: "info" | "error" | "warning";
            column?: number;
            ruleId?: string;
        }>, "many">;
        summary: z.ZodOptional<z.ZodObject<{
            errorCount: z.ZodNumber;
            warningCount: z.ZodNumber;
            infoCount: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            errorCount?: number;
            warningCount?: number;
            infoCount?: number;
        }, {
            errorCount?: number;
            warningCount?: number;
            infoCount?: number;
        }>>;
        rawOutput: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        issues?: {
            message?: string;
            source?: string;
            line?: number;
            filePath?: string;
            severity?: "info" | "error" | "warning";
            column?: number;
            ruleId?: string;
        }[];
        rawOutput?: string;
        summary?: {
            errorCount?: number;
            warningCount?: number;
            infoCount?: number;
        };
    }, {
        issues?: {
            message?: string;
            source?: string;
            line?: number;
            filePath?: string;
            severity?: "info" | "error" | "warning";
            column?: number;
            ruleId?: string;
        }[];
        rawOutput?: string;
        summary?: {
            errorCount?: number;
            warningCount?: number;
            infoCount?: number;
        };
    }>;
    typecheck: z.ZodObject<{
        issues: z.ZodArray<z.ZodObject<{
            message: z.ZodString;
            filePath: z.ZodString;
            line: z.ZodNumber;
            column: z.ZodOptional<z.ZodNumber>;
            severity: z.ZodEnum<["error", "warning", "info"]>;
            ruleId: z.ZodOptional<z.ZodString>;
            source: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            message?: string;
            source?: string;
            line?: number;
            filePath?: string;
            severity?: "info" | "error" | "warning";
            column?: number;
            ruleId?: string;
        }, {
            message?: string;
            source?: string;
            line?: number;
            filePath?: string;
            severity?: "info" | "error" | "warning";
            column?: number;
            ruleId?: string;
        }>, "many">;
        summary: z.ZodOptional<z.ZodObject<{
            errorCount: z.ZodNumber;
            warningCount: z.ZodNumber;
            infoCount: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            errorCount?: number;
            warningCount?: number;
            infoCount?: number;
        }, {
            errorCount?: number;
            warningCount?: number;
            infoCount?: number;
        }>>;
        rawOutput: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        issues?: {
            message?: string;
            source?: string;
            line?: number;
            filePath?: string;
            severity?: "info" | "error" | "warning";
            column?: number;
            ruleId?: string;
        }[];
        rawOutput?: string;
        summary?: {
            errorCount?: number;
            warningCount?: number;
            infoCount?: number;
        };
    }, {
        issues?: {
            message?: string;
            source?: string;
            line?: number;
            filePath?: string;
            severity?: "info" | "error" | "warning";
            column?: number;
            ruleId?: string;
        }[];
        rawOutput?: string;
        summary?: {
            errorCount?: number;
            warningCount?: number;
            infoCount?: number;
        };
    }>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error?: string;
    success?: boolean;
    lint?: {
        issues?: {
            message?: string;
            source?: string;
            line?: number;
            filePath?: string;
            severity?: "info" | "error" | "warning";
            column?: number;
            ruleId?: string;
        }[];
        rawOutput?: string;
        summary?: {
            errorCount?: number;
            warningCount?: number;
            infoCount?: number;
        };
    };
    typecheck?: {
        issues?: {
            message?: string;
            source?: string;
            line?: number;
            filePath?: string;
            severity?: "info" | "error" | "warning";
            column?: number;
            ruleId?: string;
        }[];
        rawOutput?: string;
        summary?: {
            errorCount?: number;
            warningCount?: number;
            infoCount?: number;
        };
    };
}, {
    error?: string;
    success?: boolean;
    lint?: {
        issues?: {
            message?: string;
            source?: string;
            line?: number;
            filePath?: string;
            severity?: "info" | "error" | "warning";
            column?: number;
            ruleId?: string;
        }[];
        rawOutput?: string;
        summary?: {
            errorCount?: number;
            warningCount?: number;
            infoCount?: number;
        };
    };
    typecheck?: {
        issues?: {
            message?: string;
            source?: string;
            line?: number;
            filePath?: string;
            severity?: "info" | "error" | "warning";
            column?: number;
            ruleId?: string;
        }[];
        rawOutput?: string;
        summary?: {
            errorCount?: number;
            warningCount?: number;
            infoCount?: number;
        };
    };
}>;
export type StaticAnalysisResponse = z.infer<typeof StaticAnalysisResponseSchema>;
export declare const DeploymentCredentialsSchema: z.ZodObject<{
    apiToken: z.ZodOptional<z.ZodString>;
    accountId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    apiToken?: string;
    accountId?: string;
}, {
    apiToken?: string;
    accountId?: string;
}>;
export type DeploymentCredentials = z.infer<typeof DeploymentCredentialsSchema>;
export declare const DeploymentResultSchema: z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodString;
    deployedUrl: z.ZodOptional<z.ZodString>;
    deploymentId: z.ZodOptional<z.ZodString>;
    output: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error?: string;
    message?: string;
    output?: string;
    success?: boolean;
    deployedUrl?: string;
    deploymentId?: string;
}, {
    error?: string;
    message?: string;
    output?: string;
    success?: boolean;
    deployedUrl?: string;
    deploymentId?: string;
}>;
export type DeploymentResult = z.infer<typeof DeploymentResultSchema>;
export declare const WebhookEventBaseSchema: z.ZodObject<{
    eventType: z.ZodString;
    instanceId: z.ZodString;
    timestamp: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
    agentId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    timestamp?: string;
    instanceId?: string;
    eventType?: string;
    agentId?: string;
}, {
    timestamp?: string | Date;
    instanceId?: string;
    eventType?: string;
    agentId?: string;
}>;
export declare const WebhookRuntimeErrorEventSchema: z.ZodObject<{
    instanceId: z.ZodString;
    timestamp: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
    agentId: z.ZodOptional<z.ZodString>;
} & {
    eventType: z.ZodLiteral<"runtime_error">;
    payload: z.ZodObject<{
        runId: z.ZodString;
        error: z.ZodObject<{
            timestamp: z.ZodUnion<[z.ZodString, z.ZodDate]>;
            message: z.ZodString;
            stack: z.ZodOptional<z.ZodString>;
            source: z.ZodOptional<z.ZodString>;
            filePath: z.ZodOptional<z.ZodString>;
            lineNumber: z.ZodOptional<z.ZodNumber>;
            columnNumber: z.ZodOptional<z.ZodNumber>;
            severity: z.ZodEnum<["warning", "error", "fatal"]>;
            rawOutput: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            message?: string;
            source?: string;
            stack?: string;
            timestamp?: string | Date;
            filePath?: string;
            lineNumber?: number;
            columnNumber?: number;
            severity?: "error" | "fatal" | "warning";
            rawOutput?: string;
        }, {
            message?: string;
            source?: string;
            stack?: string;
            timestamp?: string | Date;
            filePath?: string;
            lineNumber?: number;
            columnNumber?: number;
            severity?: "error" | "fatal" | "warning";
            rawOutput?: string;
        }>;
        instanceInfo: z.ZodObject<{
            templateName: z.ZodOptional<z.ZodString>;
            serviceDirectory: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            templateName?: string;
            serviceDirectory?: string;
        }, {
            templateName?: string;
            serviceDirectory?: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        error?: {
            message?: string;
            source?: string;
            stack?: string;
            timestamp?: string | Date;
            filePath?: string;
            lineNumber?: number;
            columnNumber?: number;
            severity?: "error" | "fatal" | "warning";
            rawOutput?: string;
        };
        runId?: string;
        instanceInfo?: {
            templateName?: string;
            serviceDirectory?: string;
        };
    }, {
        error?: {
            message?: string;
            source?: string;
            stack?: string;
            timestamp?: string | Date;
            filePath?: string;
            lineNumber?: number;
            columnNumber?: number;
            severity?: "error" | "fatal" | "warning";
            rawOutput?: string;
        };
        runId?: string;
        instanceInfo?: {
            templateName?: string;
            serviceDirectory?: string;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    timestamp?: string;
    payload?: {
        error?: {
            message?: string;
            source?: string;
            stack?: string;
            timestamp?: string | Date;
            filePath?: string;
            lineNumber?: number;
            columnNumber?: number;
            severity?: "error" | "fatal" | "warning";
            rawOutput?: string;
        };
        runId?: string;
        instanceInfo?: {
            templateName?: string;
            serviceDirectory?: string;
        };
    };
    instanceId?: string;
    eventType?: "runtime_error";
    agentId?: string;
}, {
    timestamp?: string | Date;
    payload?: {
        error?: {
            message?: string;
            source?: string;
            stack?: string;
            timestamp?: string | Date;
            filePath?: string;
            lineNumber?: number;
            columnNumber?: number;
            severity?: "error" | "fatal" | "warning";
            rawOutput?: string;
        };
        runId?: string;
        instanceInfo?: {
            templateName?: string;
            serviceDirectory?: string;
        };
    };
    instanceId?: string;
    eventType?: "runtime_error";
    agentId?: string;
}>;
export type WebhookRuntimeErrorEvent = z.infer<typeof WebhookRuntimeErrorEventSchema>;
export declare const WebhookBuildStatusEventSchema: z.ZodObject<{
    instanceId: z.ZodString;
    timestamp: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
    agentId: z.ZodOptional<z.ZodString>;
} & {
    eventType: z.ZodLiteral<"build_status">;
    payload: z.ZodObject<{
        status: z.ZodEnum<["started", "completed", "failed"]>;
        buildOutput: z.ZodOptional<z.ZodString>;
        buildErrors: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        duration: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        status?: "started" | "completed" | "failed";
        duration?: number;
        buildOutput?: string;
        buildErrors?: string[];
    }, {
        status?: "started" | "completed" | "failed";
        duration?: number;
        buildOutput?: string;
        buildErrors?: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    timestamp?: string;
    payload?: {
        status?: "started" | "completed" | "failed";
        duration?: number;
        buildOutput?: string;
        buildErrors?: string[];
    };
    instanceId?: string;
    eventType?: "build_status";
    agentId?: string;
}, {
    timestamp?: string | Date;
    payload?: {
        status?: "started" | "completed" | "failed";
        duration?: number;
        buildOutput?: string;
        buildErrors?: string[];
    };
    instanceId?: string;
    eventType?: "build_status";
    agentId?: string;
}>;
export type WebhookBuildStatusEvent = z.infer<typeof WebhookBuildStatusEventSchema>;
export declare const WebhookDeploymentStatusEventSchema: z.ZodObject<{
    instanceId: z.ZodString;
    timestamp: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
    agentId: z.ZodOptional<z.ZodString>;
} & {
    eventType: z.ZodLiteral<"deployment_status">;
    payload: z.ZodObject<{
        status: z.ZodEnum<["started", "completed", "failed"]>;
        deploymentType: z.ZodOptional<z.ZodEnum<["preview", "cloudflare_workers"]>>;
        deployedUrl: z.ZodOptional<z.ZodString>;
        deploymentId: z.ZodOptional<z.ZodString>;
        error: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        error?: string;
        status?: "started" | "completed" | "failed";
        deployedUrl?: string;
        deploymentId?: string;
        deploymentType?: "preview" | "cloudflare_workers";
    }, {
        error?: string;
        status?: "started" | "completed" | "failed";
        deployedUrl?: string;
        deploymentId?: string;
        deploymentType?: "preview" | "cloudflare_workers";
    }>;
}, "strip", z.ZodTypeAny, {
    timestamp?: string;
    payload?: {
        error?: string;
        status?: "started" | "completed" | "failed";
        deployedUrl?: string;
        deploymentId?: string;
        deploymentType?: "preview" | "cloudflare_workers";
    };
    instanceId?: string;
    eventType?: "deployment_status";
    agentId?: string;
}, {
    timestamp?: string | Date;
    payload?: {
        error?: string;
        status?: "started" | "completed" | "failed";
        deployedUrl?: string;
        deploymentId?: string;
        deploymentType?: "preview" | "cloudflare_workers";
    };
    instanceId?: string;
    eventType?: "deployment_status";
    agentId?: string;
}>;
export type WebhookDeploymentStatusEvent = z.infer<typeof WebhookDeploymentStatusEventSchema>;
export declare const WebhookInstanceHealthEventSchema: z.ZodObject<{
    instanceId: z.ZodString;
    timestamp: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
    agentId: z.ZodOptional<z.ZodString>;
} & {
    eventType: z.ZodLiteral<"instance_health">;
    payload: z.ZodObject<{
        status: z.ZodEnum<["healthy", "unhealthy", "shutting_down"]>;
        uptime: z.ZodOptional<z.ZodNumber>;
        memoryUsage: z.ZodOptional<z.ZodNumber>;
        cpuUsage: z.ZodOptional<z.ZodNumber>;
        lastActivity: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
        message: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status?: "healthy" | "unhealthy" | "shutting_down";
        message?: string;
        uptime?: number;
        memoryUsage?: number;
        cpuUsage?: number;
        lastActivity?: string | Date;
    }, {
        status?: "healthy" | "unhealthy" | "shutting_down";
        message?: string;
        uptime?: number;
        memoryUsage?: number;
        cpuUsage?: number;
        lastActivity?: string | Date;
    }>;
}, "strip", z.ZodTypeAny, {
    timestamp?: string;
    payload?: {
        status?: "healthy" | "unhealthy" | "shutting_down";
        message?: string;
        uptime?: number;
        memoryUsage?: number;
        cpuUsage?: number;
        lastActivity?: string | Date;
    };
    instanceId?: string;
    eventType?: "instance_health";
    agentId?: string;
}, {
    timestamp?: string | Date;
    payload?: {
        status?: "healthy" | "unhealthy" | "shutting_down";
        message?: string;
        uptime?: number;
        memoryUsage?: number;
        cpuUsage?: number;
        lastActivity?: string | Date;
    };
    instanceId?: string;
    eventType?: "instance_health";
    agentId?: string;
}>;
export type WebhookInstanceHealthEvent = z.infer<typeof WebhookInstanceHealthEventSchema>;
export declare const WebhookCommandExecutionEventSchema: z.ZodObject<{
    instanceId: z.ZodString;
    timestamp: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
    agentId: z.ZodOptional<z.ZodString>;
} & {
    eventType: z.ZodLiteral<"command_execution">;
    payload: z.ZodObject<{
        status: z.ZodEnum<["started", "completed", "failed"]>;
        command: z.ZodString;
        output: z.ZodOptional<z.ZodString>;
        error: z.ZodOptional<z.ZodString>;
        exitCode: z.ZodOptional<z.ZodNumber>;
        duration: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        error?: string;
        status?: "started" | "completed" | "failed";
        duration?: number;
        output?: string;
        command?: string;
        exitCode?: number;
    }, {
        error?: string;
        status?: "started" | "completed" | "failed";
        duration?: number;
        output?: string;
        command?: string;
        exitCode?: number;
    }>;
}, "strip", z.ZodTypeAny, {
    timestamp?: string;
    payload?: {
        error?: string;
        status?: "started" | "completed" | "failed";
        duration?: number;
        output?: string;
        command?: string;
        exitCode?: number;
    };
    instanceId?: string;
    eventType?: "command_execution";
    agentId?: string;
}, {
    timestamp?: string | Date;
    payload?: {
        error?: string;
        status?: "started" | "completed" | "failed";
        duration?: number;
        output?: string;
        command?: string;
        exitCode?: number;
    };
    instanceId?: string;
    eventType?: "command_execution";
    agentId?: string;
}>;
export type WebhookCommandExecutionEvent = z.infer<typeof WebhookCommandExecutionEventSchema>;
export declare const WebhookEventSchema: z.ZodDiscriminatedUnion<"eventType", [z.ZodObject<{
    instanceId: z.ZodString;
    timestamp: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
    agentId: z.ZodOptional<z.ZodString>;
} & {
    eventType: z.ZodLiteral<"runtime_error">;
    payload: z.ZodObject<{
        runId: z.ZodString;
        error: z.ZodObject<{
            timestamp: z.ZodUnion<[z.ZodString, z.ZodDate]>;
            message: z.ZodString;
            stack: z.ZodOptional<z.ZodString>;
            source: z.ZodOptional<z.ZodString>;
            filePath: z.ZodOptional<z.ZodString>;
            lineNumber: z.ZodOptional<z.ZodNumber>;
            columnNumber: z.ZodOptional<z.ZodNumber>;
            severity: z.ZodEnum<["warning", "error", "fatal"]>;
            rawOutput: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            message?: string;
            source?: string;
            stack?: string;
            timestamp?: string | Date;
            filePath?: string;
            lineNumber?: number;
            columnNumber?: number;
            severity?: "error" | "fatal" | "warning";
            rawOutput?: string;
        }, {
            message?: string;
            source?: string;
            stack?: string;
            timestamp?: string | Date;
            filePath?: string;
            lineNumber?: number;
            columnNumber?: number;
            severity?: "error" | "fatal" | "warning";
            rawOutput?: string;
        }>;
        instanceInfo: z.ZodObject<{
            templateName: z.ZodOptional<z.ZodString>;
            serviceDirectory: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            templateName?: string;
            serviceDirectory?: string;
        }, {
            templateName?: string;
            serviceDirectory?: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        error?: {
            message?: string;
            source?: string;
            stack?: string;
            timestamp?: string | Date;
            filePath?: string;
            lineNumber?: number;
            columnNumber?: number;
            severity?: "error" | "fatal" | "warning";
            rawOutput?: string;
        };
        runId?: string;
        instanceInfo?: {
            templateName?: string;
            serviceDirectory?: string;
        };
    }, {
        error?: {
            message?: string;
            source?: string;
            stack?: string;
            timestamp?: string | Date;
            filePath?: string;
            lineNumber?: number;
            columnNumber?: number;
            severity?: "error" | "fatal" | "warning";
            rawOutput?: string;
        };
        runId?: string;
        instanceInfo?: {
            templateName?: string;
            serviceDirectory?: string;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    timestamp?: string;
    payload?: {
        error?: {
            message?: string;
            source?: string;
            stack?: string;
            timestamp?: string | Date;
            filePath?: string;
            lineNumber?: number;
            columnNumber?: number;
            severity?: "error" | "fatal" | "warning";
            rawOutput?: string;
        };
        runId?: string;
        instanceInfo?: {
            templateName?: string;
            serviceDirectory?: string;
        };
    };
    instanceId?: string;
    eventType?: "runtime_error";
    agentId?: string;
}, {
    timestamp?: string | Date;
    payload?: {
        error?: {
            message?: string;
            source?: string;
            stack?: string;
            timestamp?: string | Date;
            filePath?: string;
            lineNumber?: number;
            columnNumber?: number;
            severity?: "error" | "fatal" | "warning";
            rawOutput?: string;
        };
        runId?: string;
        instanceInfo?: {
            templateName?: string;
            serviceDirectory?: string;
        };
    };
    instanceId?: string;
    eventType?: "runtime_error";
    agentId?: string;
}>, z.ZodObject<{
    instanceId: z.ZodString;
    timestamp: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
    agentId: z.ZodOptional<z.ZodString>;
} & {
    eventType: z.ZodLiteral<"build_status">;
    payload: z.ZodObject<{
        status: z.ZodEnum<["started", "completed", "failed"]>;
        buildOutput: z.ZodOptional<z.ZodString>;
        buildErrors: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        duration: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        status?: "started" | "completed" | "failed";
        duration?: number;
        buildOutput?: string;
        buildErrors?: string[];
    }, {
        status?: "started" | "completed" | "failed";
        duration?: number;
        buildOutput?: string;
        buildErrors?: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    timestamp?: string;
    payload?: {
        status?: "started" | "completed" | "failed";
        duration?: number;
        buildOutput?: string;
        buildErrors?: string[];
    };
    instanceId?: string;
    eventType?: "build_status";
    agentId?: string;
}, {
    timestamp?: string | Date;
    payload?: {
        status?: "started" | "completed" | "failed";
        duration?: number;
        buildOutput?: string;
        buildErrors?: string[];
    };
    instanceId?: string;
    eventType?: "build_status";
    agentId?: string;
}>, z.ZodObject<{
    instanceId: z.ZodString;
    timestamp: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
    agentId: z.ZodOptional<z.ZodString>;
} & {
    eventType: z.ZodLiteral<"deployment_status">;
    payload: z.ZodObject<{
        status: z.ZodEnum<["started", "completed", "failed"]>;
        deploymentType: z.ZodOptional<z.ZodEnum<["preview", "cloudflare_workers"]>>;
        deployedUrl: z.ZodOptional<z.ZodString>;
        deploymentId: z.ZodOptional<z.ZodString>;
        error: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        error?: string;
        status?: "started" | "completed" | "failed";
        deployedUrl?: string;
        deploymentId?: string;
        deploymentType?: "preview" | "cloudflare_workers";
    }, {
        error?: string;
        status?: "started" | "completed" | "failed";
        deployedUrl?: string;
        deploymentId?: string;
        deploymentType?: "preview" | "cloudflare_workers";
    }>;
}, "strip", z.ZodTypeAny, {
    timestamp?: string;
    payload?: {
        error?: string;
        status?: "started" | "completed" | "failed";
        deployedUrl?: string;
        deploymentId?: string;
        deploymentType?: "preview" | "cloudflare_workers";
    };
    instanceId?: string;
    eventType?: "deployment_status";
    agentId?: string;
}, {
    timestamp?: string | Date;
    payload?: {
        error?: string;
        status?: "started" | "completed" | "failed";
        deployedUrl?: string;
        deploymentId?: string;
        deploymentType?: "preview" | "cloudflare_workers";
    };
    instanceId?: string;
    eventType?: "deployment_status";
    agentId?: string;
}>, z.ZodObject<{
    instanceId: z.ZodString;
    timestamp: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
    agentId: z.ZodOptional<z.ZodString>;
} & {
    eventType: z.ZodLiteral<"instance_health">;
    payload: z.ZodObject<{
        status: z.ZodEnum<["healthy", "unhealthy", "shutting_down"]>;
        uptime: z.ZodOptional<z.ZodNumber>;
        memoryUsage: z.ZodOptional<z.ZodNumber>;
        cpuUsage: z.ZodOptional<z.ZodNumber>;
        lastActivity: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
        message: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status?: "healthy" | "unhealthy" | "shutting_down";
        message?: string;
        uptime?: number;
        memoryUsage?: number;
        cpuUsage?: number;
        lastActivity?: string | Date;
    }, {
        status?: "healthy" | "unhealthy" | "shutting_down";
        message?: string;
        uptime?: number;
        memoryUsage?: number;
        cpuUsage?: number;
        lastActivity?: string | Date;
    }>;
}, "strip", z.ZodTypeAny, {
    timestamp?: string;
    payload?: {
        status?: "healthy" | "unhealthy" | "shutting_down";
        message?: string;
        uptime?: number;
        memoryUsage?: number;
        cpuUsage?: number;
        lastActivity?: string | Date;
    };
    instanceId?: string;
    eventType?: "instance_health";
    agentId?: string;
}, {
    timestamp?: string | Date;
    payload?: {
        status?: "healthy" | "unhealthy" | "shutting_down";
        message?: string;
        uptime?: number;
        memoryUsage?: number;
        cpuUsage?: number;
        lastActivity?: string | Date;
    };
    instanceId?: string;
    eventType?: "instance_health";
    agentId?: string;
}>, z.ZodObject<{
    instanceId: z.ZodString;
    timestamp: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
    agentId: z.ZodOptional<z.ZodString>;
} & {
    eventType: z.ZodLiteral<"command_execution">;
    payload: z.ZodObject<{
        status: z.ZodEnum<["started", "completed", "failed"]>;
        command: z.ZodString;
        output: z.ZodOptional<z.ZodString>;
        error: z.ZodOptional<z.ZodString>;
        exitCode: z.ZodOptional<z.ZodNumber>;
        duration: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        error?: string;
        status?: "started" | "completed" | "failed";
        duration?: number;
        output?: string;
        command?: string;
        exitCode?: number;
    }, {
        error?: string;
        status?: "started" | "completed" | "failed";
        duration?: number;
        output?: string;
        command?: string;
        exitCode?: number;
    }>;
}, "strip", z.ZodTypeAny, {
    timestamp?: string;
    payload?: {
        error?: string;
        status?: "started" | "completed" | "failed";
        duration?: number;
        output?: string;
        command?: string;
        exitCode?: number;
    };
    instanceId?: string;
    eventType?: "command_execution";
    agentId?: string;
}, {
    timestamp?: string | Date;
    payload?: {
        error?: string;
        status?: "started" | "completed" | "failed";
        duration?: number;
        output?: string;
        command?: string;
        exitCode?: number;
    };
    instanceId?: string;
    eventType?: "command_execution";
    agentId?: string;
}>]>;
export type WebhookEvent = z.infer<typeof WebhookEventSchema>;
export declare const WebhookPayloadSchema: z.ZodObject<{
    signature: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    event: z.ZodDiscriminatedUnion<"eventType", [z.ZodObject<{
        instanceId: z.ZodString;
        timestamp: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
        agentId: z.ZodOptional<z.ZodString>;
    } & {
        eventType: z.ZodLiteral<"runtime_error">;
        payload: z.ZodObject<{
            runId: z.ZodString;
            error: z.ZodObject<{
                timestamp: z.ZodUnion<[z.ZodString, z.ZodDate]>;
                message: z.ZodString;
                stack: z.ZodOptional<z.ZodString>;
                source: z.ZodOptional<z.ZodString>;
                filePath: z.ZodOptional<z.ZodString>;
                lineNumber: z.ZodOptional<z.ZodNumber>;
                columnNumber: z.ZodOptional<z.ZodNumber>;
                severity: z.ZodEnum<["warning", "error", "fatal"]>;
                rawOutput: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                message?: string;
                source?: string;
                stack?: string;
                timestamp?: string | Date;
                filePath?: string;
                lineNumber?: number;
                columnNumber?: number;
                severity?: "error" | "fatal" | "warning";
                rawOutput?: string;
            }, {
                message?: string;
                source?: string;
                stack?: string;
                timestamp?: string | Date;
                filePath?: string;
                lineNumber?: number;
                columnNumber?: number;
                severity?: "error" | "fatal" | "warning";
                rawOutput?: string;
            }>;
            instanceInfo: z.ZodObject<{
                templateName: z.ZodOptional<z.ZodString>;
                serviceDirectory: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                templateName?: string;
                serviceDirectory?: string;
            }, {
                templateName?: string;
                serviceDirectory?: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            error?: {
                message?: string;
                source?: string;
                stack?: string;
                timestamp?: string | Date;
                filePath?: string;
                lineNumber?: number;
                columnNumber?: number;
                severity?: "error" | "fatal" | "warning";
                rawOutput?: string;
            };
            runId?: string;
            instanceInfo?: {
                templateName?: string;
                serviceDirectory?: string;
            };
        }, {
            error?: {
                message?: string;
                source?: string;
                stack?: string;
                timestamp?: string | Date;
                filePath?: string;
                lineNumber?: number;
                columnNumber?: number;
                severity?: "error" | "fatal" | "warning";
                rawOutput?: string;
            };
            runId?: string;
            instanceInfo?: {
                templateName?: string;
                serviceDirectory?: string;
            };
        }>;
    }, "strip", z.ZodTypeAny, {
        timestamp?: string;
        payload?: {
            error?: {
                message?: string;
                source?: string;
                stack?: string;
                timestamp?: string | Date;
                filePath?: string;
                lineNumber?: number;
                columnNumber?: number;
                severity?: "error" | "fatal" | "warning";
                rawOutput?: string;
            };
            runId?: string;
            instanceInfo?: {
                templateName?: string;
                serviceDirectory?: string;
            };
        };
        instanceId?: string;
        eventType?: "runtime_error";
        agentId?: string;
    }, {
        timestamp?: string | Date;
        payload?: {
            error?: {
                message?: string;
                source?: string;
                stack?: string;
                timestamp?: string | Date;
                filePath?: string;
                lineNumber?: number;
                columnNumber?: number;
                severity?: "error" | "fatal" | "warning";
                rawOutput?: string;
            };
            runId?: string;
            instanceInfo?: {
                templateName?: string;
                serviceDirectory?: string;
            };
        };
        instanceId?: string;
        eventType?: "runtime_error";
        agentId?: string;
    }>, z.ZodObject<{
        instanceId: z.ZodString;
        timestamp: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
        agentId: z.ZodOptional<z.ZodString>;
    } & {
        eventType: z.ZodLiteral<"build_status">;
        payload: z.ZodObject<{
            status: z.ZodEnum<["started", "completed", "failed"]>;
            buildOutput: z.ZodOptional<z.ZodString>;
            buildErrors: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            duration: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            status?: "started" | "completed" | "failed";
            duration?: number;
            buildOutput?: string;
            buildErrors?: string[];
        }, {
            status?: "started" | "completed" | "failed";
            duration?: number;
            buildOutput?: string;
            buildErrors?: string[];
        }>;
    }, "strip", z.ZodTypeAny, {
        timestamp?: string;
        payload?: {
            status?: "started" | "completed" | "failed";
            duration?: number;
            buildOutput?: string;
            buildErrors?: string[];
        };
        instanceId?: string;
        eventType?: "build_status";
        agentId?: string;
    }, {
        timestamp?: string | Date;
        payload?: {
            status?: "started" | "completed" | "failed";
            duration?: number;
            buildOutput?: string;
            buildErrors?: string[];
        };
        instanceId?: string;
        eventType?: "build_status";
        agentId?: string;
    }>, z.ZodObject<{
        instanceId: z.ZodString;
        timestamp: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
        agentId: z.ZodOptional<z.ZodString>;
    } & {
        eventType: z.ZodLiteral<"deployment_status">;
        payload: z.ZodObject<{
            status: z.ZodEnum<["started", "completed", "failed"]>;
            deploymentType: z.ZodOptional<z.ZodEnum<["preview", "cloudflare_workers"]>>;
            deployedUrl: z.ZodOptional<z.ZodString>;
            deploymentId: z.ZodOptional<z.ZodString>;
            error: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            error?: string;
            status?: "started" | "completed" | "failed";
            deployedUrl?: string;
            deploymentId?: string;
            deploymentType?: "preview" | "cloudflare_workers";
        }, {
            error?: string;
            status?: "started" | "completed" | "failed";
            deployedUrl?: string;
            deploymentId?: string;
            deploymentType?: "preview" | "cloudflare_workers";
        }>;
    }, "strip", z.ZodTypeAny, {
        timestamp?: string;
        payload?: {
            error?: string;
            status?: "started" | "completed" | "failed";
            deployedUrl?: string;
            deploymentId?: string;
            deploymentType?: "preview" | "cloudflare_workers";
        };
        instanceId?: string;
        eventType?: "deployment_status";
        agentId?: string;
    }, {
        timestamp?: string | Date;
        payload?: {
            error?: string;
            status?: "started" | "completed" | "failed";
            deployedUrl?: string;
            deploymentId?: string;
            deploymentType?: "preview" | "cloudflare_workers";
        };
        instanceId?: string;
        eventType?: "deployment_status";
        agentId?: string;
    }>, z.ZodObject<{
        instanceId: z.ZodString;
        timestamp: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
        agentId: z.ZodOptional<z.ZodString>;
    } & {
        eventType: z.ZodLiteral<"instance_health">;
        payload: z.ZodObject<{
            status: z.ZodEnum<["healthy", "unhealthy", "shutting_down"]>;
            uptime: z.ZodOptional<z.ZodNumber>;
            memoryUsage: z.ZodOptional<z.ZodNumber>;
            cpuUsage: z.ZodOptional<z.ZodNumber>;
            lastActivity: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
            message: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            status?: "healthy" | "unhealthy" | "shutting_down";
            message?: string;
            uptime?: number;
            memoryUsage?: number;
            cpuUsage?: number;
            lastActivity?: string | Date;
        }, {
            status?: "healthy" | "unhealthy" | "shutting_down";
            message?: string;
            uptime?: number;
            memoryUsage?: number;
            cpuUsage?: number;
            lastActivity?: string | Date;
        }>;
    }, "strip", z.ZodTypeAny, {
        timestamp?: string;
        payload?: {
            status?: "healthy" | "unhealthy" | "shutting_down";
            message?: string;
            uptime?: number;
            memoryUsage?: number;
            cpuUsage?: number;
            lastActivity?: string | Date;
        };
        instanceId?: string;
        eventType?: "instance_health";
        agentId?: string;
    }, {
        timestamp?: string | Date;
        payload?: {
            status?: "healthy" | "unhealthy" | "shutting_down";
            message?: string;
            uptime?: number;
            memoryUsage?: number;
            cpuUsage?: number;
            lastActivity?: string | Date;
        };
        instanceId?: string;
        eventType?: "instance_health";
        agentId?: string;
    }>, z.ZodObject<{
        instanceId: z.ZodString;
        timestamp: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
        agentId: z.ZodOptional<z.ZodString>;
    } & {
        eventType: z.ZodLiteral<"command_execution">;
        payload: z.ZodObject<{
            status: z.ZodEnum<["started", "completed", "failed"]>;
            command: z.ZodString;
            output: z.ZodOptional<z.ZodString>;
            error: z.ZodOptional<z.ZodString>;
            exitCode: z.ZodOptional<z.ZodNumber>;
            duration: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            error?: string;
            status?: "started" | "completed" | "failed";
            duration?: number;
            output?: string;
            command?: string;
            exitCode?: number;
        }, {
            error?: string;
            status?: "started" | "completed" | "failed";
            duration?: number;
            output?: string;
            command?: string;
            exitCode?: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        timestamp?: string;
        payload?: {
            error?: string;
            status?: "started" | "completed" | "failed";
            duration?: number;
            output?: string;
            command?: string;
            exitCode?: number;
        };
        instanceId?: string;
        eventType?: "command_execution";
        agentId?: string;
    }, {
        timestamp?: string | Date;
        payload?: {
            error?: string;
            status?: "started" | "completed" | "failed";
            duration?: number;
            output?: string;
            command?: string;
            exitCode?: number;
        };
        instanceId?: string;
        eventType?: "command_execution";
        agentId?: string;
    }>]>;
}, "strip", z.ZodTypeAny, {
    event?: {
        timestamp?: string;
        payload?: {
            error?: {
                message?: string;
                source?: string;
                stack?: string;
                timestamp?: string | Date;
                filePath?: string;
                lineNumber?: number;
                columnNumber?: number;
                severity?: "error" | "fatal" | "warning";
                rawOutput?: string;
            };
            runId?: string;
            instanceInfo?: {
                templateName?: string;
                serviceDirectory?: string;
            };
        };
        instanceId?: string;
        eventType?: "runtime_error";
        agentId?: string;
    } | {
        timestamp?: string;
        payload?: {
            status?: "started" | "completed" | "failed";
            duration?: number;
            buildOutput?: string;
            buildErrors?: string[];
        };
        instanceId?: string;
        eventType?: "build_status";
        agentId?: string;
    } | {
        timestamp?: string;
        payload?: {
            error?: string;
            status?: "started" | "completed" | "failed";
            deployedUrl?: string;
            deploymentId?: string;
            deploymentType?: "preview" | "cloudflare_workers";
        };
        instanceId?: string;
        eventType?: "deployment_status";
        agentId?: string;
    } | {
        timestamp?: string;
        payload?: {
            status?: "healthy" | "unhealthy" | "shutting_down";
            message?: string;
            uptime?: number;
            memoryUsage?: number;
            cpuUsage?: number;
            lastActivity?: string | Date;
        };
        instanceId?: string;
        eventType?: "instance_health";
        agentId?: string;
    } | {
        timestamp?: string;
        payload?: {
            error?: string;
            status?: "started" | "completed" | "failed";
            duration?: number;
            output?: string;
            command?: string;
            exitCode?: number;
        };
        instanceId?: string;
        eventType?: "command_execution";
        agentId?: string;
    };
    timestamp?: string | Date;
    signature?: string;
}, {
    event?: {
        timestamp?: string | Date;
        payload?: {
            error?: {
                message?: string;
                source?: string;
                stack?: string;
                timestamp?: string | Date;
                filePath?: string;
                lineNumber?: number;
                columnNumber?: number;
                severity?: "error" | "fatal" | "warning";
                rawOutput?: string;
            };
            runId?: string;
            instanceInfo?: {
                templateName?: string;
                serviceDirectory?: string;
            };
        };
        instanceId?: string;
        eventType?: "runtime_error";
        agentId?: string;
    } | {
        timestamp?: string | Date;
        payload?: {
            status?: "started" | "completed" | "failed";
            duration?: number;
            buildOutput?: string;
            buildErrors?: string[];
        };
        instanceId?: string;
        eventType?: "build_status";
        agentId?: string;
    } | {
        timestamp?: string | Date;
        payload?: {
            error?: string;
            status?: "started" | "completed" | "failed";
            deployedUrl?: string;
            deploymentId?: string;
            deploymentType?: "preview" | "cloudflare_workers";
        };
        instanceId?: string;
        eventType?: "deployment_status";
        agentId?: string;
    } | {
        timestamp?: string | Date;
        payload?: {
            status?: "healthy" | "unhealthy" | "shutting_down";
            message?: string;
            uptime?: number;
            memoryUsage?: number;
            cpuUsage?: number;
            lastActivity?: string | Date;
        };
        instanceId?: string;
        eventType?: "instance_health";
        agentId?: string;
    } | {
        timestamp?: string | Date;
        payload?: {
            error?: string;
            status?: "started" | "completed" | "failed";
            duration?: number;
            output?: string;
            command?: string;
            exitCode?: number;
        };
        instanceId?: string;
        eventType?: "command_execution";
        agentId?: string;
    };
    timestamp?: string | Date;
    signature?: string;
}>;
export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>;
export declare const RunnerServiceWebhookPayloadSchema: z.ZodObject<{
    runId: z.ZodString;
    error: z.ZodObject<{
        timestamp: z.ZodUnion<[z.ZodString, z.ZodDate]>;
        message: z.ZodString;
        stack: z.ZodOptional<z.ZodString>;
        source: z.ZodOptional<z.ZodString>;
        filePath: z.ZodOptional<z.ZodString>;
        lineNumber: z.ZodOptional<z.ZodNumber>;
        columnNumber: z.ZodOptional<z.ZodNumber>;
        severity: z.ZodEnum<["warning", "error", "fatal"]>;
        rawOutput: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message?: string;
        source?: string;
        stack?: string;
        timestamp?: string | Date;
        filePath?: string;
        lineNumber?: number;
        columnNumber?: number;
        severity?: "error" | "fatal" | "warning";
        rawOutput?: string;
    }, {
        message?: string;
        source?: string;
        stack?: string;
        timestamp?: string | Date;
        filePath?: string;
        lineNumber?: number;
        columnNumber?: number;
        severity?: "error" | "fatal" | "warning";
        rawOutput?: string;
    }>;
    instanceInfo: z.ZodObject<{
        templateName: z.ZodOptional<z.ZodString>;
        serviceDirectory: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        templateName?: string;
        serviceDirectory?: string;
    }, {
        templateName?: string;
        serviceDirectory?: string;
    }>;
}, "strip", z.ZodTypeAny, {
    error?: {
        message?: string;
        source?: string;
        stack?: string;
        timestamp?: string | Date;
        filePath?: string;
        lineNumber?: number;
        columnNumber?: number;
        severity?: "error" | "fatal" | "warning";
        rawOutput?: string;
    };
    runId?: string;
    instanceInfo?: {
        templateName?: string;
        serviceDirectory?: string;
    };
}, {
    error?: {
        message?: string;
        source?: string;
        stack?: string;
        timestamp?: string | Date;
        filePath?: string;
        lineNumber?: number;
        columnNumber?: number;
        severity?: "error" | "fatal" | "warning";
        rawOutput?: string;
    };
    runId?: string;
    instanceInfo?: {
        templateName?: string;
        serviceDirectory?: string;
    };
}>;
export type RunnerServiceWebhookPayload = z.infer<typeof RunnerServiceWebhookPayloadSchema>;
/**
 * GitHub integration types for exporting generated applications
 */
interface GitHubUserInfo {
    token: string;
    email: string;
    username: string;
    isPrivate: boolean;
}
export interface GitHubExportRequest extends GitHubUserInfo {
    repositoryName: string;
    description?: string;
    cloneUrl?: string;
    repositoryHtmlUrl?: string;
}
export interface GitHubPushRequest extends GitHubUserInfo {
    cloneUrl: string;
    repositoryHtmlUrl: string;
}
export declare const GitHubExportResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    repositoryUrl: z.ZodOptional<z.ZodString>;
    cloneUrl: z.ZodOptional<z.ZodString>;
    commitSha: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error?: string;
    success?: boolean;
    repositoryUrl?: string;
    cloneUrl?: string;
    commitSha?: string;
}, {
    error?: string;
    success?: boolean;
    repositoryUrl?: string;
    cloneUrl?: string;
    commitSha?: string;
}>;
export type GitHubExportResponse = z.infer<typeof GitHubExportResponseSchema>;
export declare const GitHubPushResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    commitSha: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
    details: z.ZodOptional<z.ZodObject<{
        operation: z.ZodOptional<z.ZodString>;
        exitCode: z.ZodOptional<z.ZodNumber>;
        stderr: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        exitCode?: number;
        stderr?: string;
        operation?: string;
    }, {
        exitCode?: number;
        stderr?: string;
        operation?: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    error?: string;
    success?: boolean;
    commitSha?: string;
    details?: {
        exitCode?: number;
        stderr?: string;
        operation?: string;
    };
}, {
    error?: string;
    success?: boolean;
    commitSha?: string;
    details?: {
        exitCode?: number;
        stderr?: string;
        operation?: string;
    };
}>;
export type GitHubPushResponse = z.infer<typeof GitHubPushResponseSchema>;
export {};
