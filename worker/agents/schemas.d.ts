import z from 'zod';
export declare const TemplateSelectionSchema: z.ZodObject<{
    selectedTemplateName: z.ZodNullable<z.ZodString>;
    reasoning: z.ZodString;
    useCase: z.ZodNullable<z.ZodEnum<["SaaS Product Website", "Dashboard", "Blog", "Portfolio", "E-Commerce", "General", "Other"]>>;
    complexity: z.ZodNullable<z.ZodEnum<["simple", "moderate", "complex"]>>;
    styleSelection: z.ZodNullable<z.ZodEnum<["Minimalist Design", "Brutalism", "Retro", "Illustrative", "Kid_Playful"]>>;
    projectName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reasoning?: string;
    selectedTemplateName?: string;
    useCase?: "SaaS Product Website" | "Dashboard" | "Blog" | "Portfolio" | "E-Commerce" | "General" | "Other";
    complexity?: "simple" | "moderate" | "complex";
    styleSelection?: "Minimalist Design" | "Brutalism" | "Retro" | "Illustrative" | "Kid_Playful";
    projectName?: string;
}, {
    reasoning?: string;
    selectedTemplateName?: string;
    useCase?: "SaaS Product Website" | "Dashboard" | "Blog" | "Portfolio" | "E-Commerce" | "General" | "Other";
    complexity?: "simple" | "moderate" | "complex";
    styleSelection?: "Minimalist Design" | "Brutalism" | "Retro" | "Illustrative" | "Kid_Playful";
    projectName?: string;
}>;
export declare const FileOutputSchema: z.ZodObject<{
    filePath: z.ZodString;
    fileContents: z.ZodString;
    filePurpose: z.ZodString;
}, "strip", z.ZodTypeAny, {
    filePath?: string;
    fileContents?: string;
    filePurpose?: string;
}, {
    filePath?: string;
    fileContents?: string;
    filePurpose?: string;
}>;
export declare const FileConceptSchema: z.ZodObject<{
    path: z.ZodString;
    purpose: z.ZodString;
    changes: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    path?: string;
    purpose?: string;
    changes?: string;
}, {
    path?: string;
    purpose?: string;
    changes?: string;
}>;
export declare const PhaseConceptSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    files: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        purpose: z.ZodString;
        changes: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        path?: string;
        purpose?: string;
        changes?: string;
    }, {
        path?: string;
        purpose?: string;
        changes?: string;
    }>, "many">;
    lastPhase: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: string;
    files?: {
        path?: string;
        purpose?: string;
        changes?: string;
    }[];
    lastPhase?: boolean;
}, {
    name?: string;
    description?: string;
    files?: {
        path?: string;
        purpose?: string;
        changes?: string;
    }[];
    lastPhase?: boolean;
}>;
/**
 * Schema for file generation output
 */
export declare const FileGenerationOutput: z.ZodObject<{
    filePath: z.ZodString;
    fileContents: z.ZodString;
    filePurpose: z.ZodString;
} & {
    format: z.ZodEnum<["full_content", "unified_diff"]>;
}, "strip", z.ZodTypeAny, {
    format?: "full_content" | "unified_diff";
    filePath?: string;
    fileContents?: string;
    filePurpose?: string;
}, {
    format?: "full_content" | "unified_diff";
    filePath?: string;
    fileContents?: string;
    filePurpose?: string;
}>;
export declare const PhaseConceptGenerationSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    files: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        purpose: z.ZodString;
        changes: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        path?: string;
        purpose?: string;
        changes?: string;
    }, {
        path?: string;
        purpose?: string;
        changes?: string;
    }>, "many">;
    lastPhase: z.ZodBoolean;
} & {
    installCommands: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: string;
    files?: {
        path?: string;
        purpose?: string;
        changes?: string;
    }[];
    lastPhase?: boolean;
    installCommands?: string[];
}, {
    name?: string;
    description?: string;
    files?: {
        path?: string;
        purpose?: string;
        changes?: string;
    }[];
    lastPhase?: boolean;
    installCommands?: string[];
}>;
export declare const PhaseImplementationSchema: z.ZodObject<{
    files: z.ZodArray<z.ZodObject<{
        filePath: z.ZodString;
        fileContents: z.ZodString;
        filePurpose: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        filePath?: string;
        fileContents?: string;
        filePurpose?: string;
    }, {
        filePath?: string;
        fileContents?: string;
        filePurpose?: string;
    }>, "many">;
    deploymentNeeded: z.ZodBoolean;
    commands: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    files?: {
        filePath?: string;
        fileContents?: string;
        filePurpose?: string;
    }[];
    deploymentNeeded?: boolean;
    commands?: string[];
}, {
    files?: {
        filePath?: string;
        fileContents?: string;
        filePurpose?: string;
    }[];
    deploymentNeeded?: boolean;
    commands?: string[];
}>;
/**
 * Schema for code documentation fetch output
 */
export declare const DocumentationOutput: z.ZodObject<{
    content: z.ZodString;
    source: z.ZodString;
}, "strip", z.ZodTypeAny, {
    source?: string;
    content?: string;
}, {
    source?: string;
    content?: string;
}>;
/**
 * Schema for code review output
 */
export declare const CodeReviewOutput: z.ZodObject<{
    dependenciesNotMet: z.ZodArray<z.ZodString, "many">;
    issuesFound: z.ZodBoolean;
    frontendIssues: z.ZodArray<z.ZodString, "many">;
    backendIssues: z.ZodArray<z.ZodString, "many">;
    filesToFix: z.ZodArray<z.ZodObject<{
        filePath: z.ZodString;
        issues: z.ZodArray<z.ZodString, "many">;
        require_code_changes: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        issues?: string[];
        filePath?: string;
        require_code_changes?: boolean;
    }, {
        issues?: string[];
        filePath?: string;
        require_code_changes?: boolean;
    }>, "many">;
    commands: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
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
}, {
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
export declare const BlueprintSchema: z.ZodObject<{
    title: z.ZodString;
    projectName: z.ZodString;
    detailedDescription: z.ZodString;
    description: z.ZodString;
    colorPalette: z.ZodArray<z.ZodString, "many">;
    views: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        description?: string;
    }, {
        name?: string;
        description?: string;
    }>, "many">;
    userFlow: z.ZodObject<{
        uiLayout: z.ZodString;
        uiDesign: z.ZodString;
        userJourney: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        uiLayout?: string;
        uiDesign?: string;
        userJourney?: string;
    }, {
        uiLayout?: string;
        uiDesign?: string;
        userJourney?: string;
    }>;
    dataFlow: z.ZodString;
    architecture: z.ZodObject<{
        dataFlow: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        dataFlow?: string;
    }, {
        dataFlow?: string;
    }>;
    pitfalls: z.ZodArray<z.ZodString, "many">;
    frameworks: z.ZodArray<z.ZodString, "many">;
    implementationRoadmap: z.ZodArray<z.ZodObject<{
        phase: z.ZodString;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        description?: string;
        phase?: string;
    }, {
        description?: string;
        phase?: string;
    }>, "many">;
    initialPhase: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        files: z.ZodArray<z.ZodObject<{
            path: z.ZodString;
            purpose: z.ZodString;
            changes: z.ZodNullable<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            path?: string;
            purpose?: string;
            changes?: string;
        }, {
            path?: string;
            purpose?: string;
            changes?: string;
        }>, "many">;
        lastPhase: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        description?: string;
        files?: {
            path?: string;
            purpose?: string;
            changes?: string;
        }[];
        lastPhase?: boolean;
    }, {
        name?: string;
        description?: string;
        files?: {
            path?: string;
            purpose?: string;
            changes?: string;
        }[];
        lastPhase?: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    title?: string;
    description?: string;
    projectName?: string;
    detailedDescription?: string;
    colorPalette?: string[];
    views?: {
        name?: string;
        description?: string;
    }[];
    userFlow?: {
        uiLayout?: string;
        uiDesign?: string;
        userJourney?: string;
    };
    dataFlow?: string;
    architecture?: {
        dataFlow?: string;
    };
    pitfalls?: string[];
    frameworks?: string[];
    implementationRoadmap?: {
        description?: string;
        phase?: string;
    }[];
    initialPhase?: {
        name?: string;
        description?: string;
        files?: {
            path?: string;
            purpose?: string;
            changes?: string;
        }[];
        lastPhase?: boolean;
    };
}, {
    title?: string;
    description?: string;
    projectName?: string;
    detailedDescription?: string;
    colorPalette?: string[];
    views?: {
        name?: string;
        description?: string;
    }[];
    userFlow?: {
        uiLayout?: string;
        uiDesign?: string;
        userJourney?: string;
    };
    dataFlow?: string;
    architecture?: {
        dataFlow?: string;
    };
    pitfalls?: string[];
    frameworks?: string[];
    implementationRoadmap?: {
        description?: string;
        phase?: string;
    }[];
    initialPhase?: {
        name?: string;
        description?: string;
        files?: {
            path?: string;
            purpose?: string;
            changes?: string;
        }[];
        lastPhase?: boolean;
    };
}>;
export declare const SetupCommandsSchema: z.ZodObject<{
    commands: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    commands?: string[];
}, {
    commands?: string[];
}>;
export declare const ClientReportedErrorSchema: z.ZodObject<{
    type: z.ZodString;
    data: z.ZodObject<{
        errorType: z.ZodString;
        consecutiveCount: z.ZodNumber;
        url: z.ZodString;
        timestamp: z.ZodString;
        error: z.ZodObject<{
            message: z.ZodString;
            fullBodyText: z.ZodString;
            fullBodyHtml: z.ZodString;
            errorElementsFound: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            message?: string;
            fullBodyText?: string;
            fullBodyHtml?: string;
            errorElementsFound?: number;
        }, {
            message?: string;
            fullBodyText?: string;
            fullBodyHtml?: string;
            errorElementsFound?: number;
        }>;
        browserInfo: z.ZodObject<{
            userAgent: z.ZodString;
            url: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            url?: string;
            userAgent?: string;
        }, {
            url?: string;
            userAgent?: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        error?: {
            message?: string;
            fullBodyText?: string;
            fullBodyHtml?: string;
            errorElementsFound?: number;
        };
        url?: string;
        timestamp?: string;
        errorType?: string;
        consecutiveCount?: number;
        browserInfo?: {
            url?: string;
            userAgent?: string;
        };
    }, {
        error?: {
            message?: string;
            fullBodyText?: string;
            fullBodyHtml?: string;
            errorElementsFound?: number;
        };
        url?: string;
        timestamp?: string;
        errorType?: string;
        consecutiveCount?: number;
        browserInfo?: {
            url?: string;
            userAgent?: string;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    data?: {
        error?: {
            message?: string;
            fullBodyText?: string;
            fullBodyHtml?: string;
            errorElementsFound?: number;
        };
        url?: string;
        timestamp?: string;
        errorType?: string;
        consecutiveCount?: number;
        browserInfo?: {
            url?: string;
            userAgent?: string;
        };
    };
    type?: string;
}, {
    data?: {
        error?: {
            message?: string;
            fullBodyText?: string;
            fullBodyHtml?: string;
            errorElementsFound?: number;
        };
        url?: string;
        timestamp?: string;
        errorType?: string;
        consecutiveCount?: number;
        browserInfo?: {
            url?: string;
            userAgent?: string;
        };
    };
    type?: string;
}>;
export declare const ScreenshotAnalysisSchema: z.ZodObject<{
    hasIssues: z.ZodBoolean;
    issues: z.ZodArray<z.ZodString, "many">;
    suggestions: z.ZodArray<z.ZodString, "many">;
    uiCompliance: z.ZodObject<{
        matchesBlueprint: z.ZodBoolean;
        deviations: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        matchesBlueprint?: boolean;
        deviations?: string[];
    }, {
        matchesBlueprint?: boolean;
        deviations?: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    issues?: string[];
    hasIssues?: boolean;
    suggestions?: string[];
    uiCompliance?: {
        matchesBlueprint?: boolean;
        deviations?: string[];
    };
}, {
    issues?: string[];
    hasIssues?: boolean;
    suggestions?: string[];
    uiCompliance?: {
        matchesBlueprint?: boolean;
        deviations?: string[];
    };
}>;
export declare const AgentActionSchema: z.ZodObject<{
    action: z.ZodString;
    data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    data?: Record<string, unknown>;
    action?: string;
}, {
    data?: Record<string, unknown>;
    action?: string;
}>;
export type TemplateSelection = z.infer<typeof TemplateSelectionSchema>;
export type Blueprint = z.infer<typeof BlueprintSchema>;
export type FileConceptType = z.infer<typeof FileConceptSchema>;
export type PhaseConceptType = z.infer<typeof PhaseConceptSchema>;
export type FileOutputType = z.infer<typeof FileOutputSchema>;
export type PhaseConceptGenerationSchemaType = z.infer<typeof PhaseConceptGenerationSchema>;
export type PhaseImplementationSchemaType = z.infer<typeof PhaseImplementationSchema>;
export type FileGenerationOutputType = z.infer<typeof FileGenerationOutput>;
export type DocumentationOutputType = z.infer<typeof DocumentationOutput>;
export type CodeReviewOutputType = z.infer<typeof CodeReviewOutput>;
export type SetupCommandsType = z.infer<typeof SetupCommandsSchema>;
export type ClientReportedErrorType = z.infer<typeof ClientReportedErrorSchema>;
export type ScreenshotAnalysisType = z.infer<typeof ScreenshotAnalysisSchema>;
export type AgentActionType = z.infer<typeof AgentActionSchema>;
export declare const ConversationalResponseSchema: z.ZodObject<{
    enhancedUserRequest: z.ZodString;
    userResponse: z.ZodString;
}, "strip", z.ZodTypeAny, {
    enhancedUserRequest?: string;
    userResponse?: string;
}, {
    enhancedUserRequest?: string;
    userResponse?: string;
}>;
export type ConversationalResponseType = z.infer<typeof ConversationalResponseSchema>;
