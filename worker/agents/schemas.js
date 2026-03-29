"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationalResponseSchema = exports.AgentActionSchema = exports.ScreenshotAnalysisSchema = exports.ClientReportedErrorSchema = exports.SetupCommandsSchema = exports.BlueprintSchema = exports.CodeReviewOutput = exports.DocumentationOutput = exports.PhaseImplementationSchema = exports.PhaseConceptGenerationSchema = exports.FileGenerationOutput = exports.PhaseConceptSchema = exports.FileConceptSchema = exports.FileOutputSchema = exports.TemplateSelectionSchema = void 0;
var zod_1 = require("zod");
// Schema for AI template selection output
exports.TemplateSelectionSchema = zod_1.default.object({
    selectedTemplateName: zod_1.default.string().nullable().describe('The name of the most suitable template, or null if none are suitable.'),
    reasoning: zod_1.default.string().describe('Brief explanation for the selection or why no template was chosen.'),
    useCase: zod_1.default.enum(['SaaS Product Website', 'Dashboard', 'Blog', 'Portfolio', 'E-Commerce', 'General', 'Other']).describe('The use case for which the template is selected, if applicable.').nullable(),
    complexity: zod_1.default.enum(['simple', 'moderate', 'complex']).describe('The complexity of developing the project based on the the user query').nullable(),
    styleSelection: zod_1.default.enum(['Minimalist Design', 'Brutalism', 'Retro', 'Illustrative', 'Kid_Playful']).describe('Pick a style relevant to the user query').nullable(),
    projectName: zod_1.default.string().describe('The name of the project based on the user query'),
});
exports.FileOutputSchema = zod_1.default.object({
    filePath: zod_1.default.string().describe('The name of the file including path'),
    fileContents: zod_1.default.string().describe('The complete contents of the file'),
    filePurpose: zod_1.default.string().describe('Concise purpose of the file and it\'s expected contents')
});
exports.FileConceptSchema = zod_1.default.object({
    path: zod_1.default.string().describe('Path to the file relative to the project root. File name should be valid and not contain any special characters apart from hyphen, underscore and dot.'),
    purpose: zod_1.default.string().describe('Very short, Breif, Concise, to the point description, purpose and expected contents of this file including its role in the architecture, data and code flow details'),
    changes: zod_1.default.string().nullable().describe('Concise and brief description of the changes to be made to the file, if it\'s not a new file'),
    // scratchSpacee: z.string().describe('Scratch space for thinking, problem solving or notes. Use this space to write down any thoughts or ideas that come to mind for making the file'),
});
exports.PhaseConceptSchema = zod_1.default.object({
    name: zod_1.default.string().describe('Name of the phase (Utility, api, frontend, etc)'),
    description: zod_1.default.string().describe('Concise description of the phase'),
    files: zod_1.default.array(exports.FileConceptSchema).describe('Files that need to be written in this stage (new or modified existing), including paths and purposes of each source/code file.'),
    lastPhase: zod_1.default.boolean().describe('Whether this is the last phase to be implemented. If true, no next phase is required and the process will end here'),
});
/**
 * Schema for file generation output
 */
exports.FileGenerationOutput = exports.FileOutputSchema.extend({
    format: zod_1.default.enum(['full_content', 'unified_diff']).describe('`full_content` for full, raw file contents, `unified_diff` for unified diff'),
});
exports.PhaseConceptGenerationSchema = exports.PhaseConceptSchema.extend({
    installCommands: zod_1.default.array(zod_1.default.string()).describe('Commands to install any additional **STRICTLY NECESESARY** dependencies for this phase. Should be used very rarely! Stick to the already installed dependencies!'),
});
exports.PhaseImplementationSchema = zod_1.default.object({
    files: zod_1.default.array(exports.FileOutputSchema).describe('Files that need to be written in this stage (new or modified existing), including paths and purposes of each source/code file.'),
    deploymentNeeded: zod_1.default.boolean().describe('Whether deployment is needed for this phase'),
    commands: zod_1.default.array(zod_1.default.string()).describe('Commands to run for deployment'),
});
/**
 * Schema for code documentation fetch output
 */
exports.DocumentationOutput = zod_1.default.object({
    content: zod_1.default.string().describe('The documentation content'),
    source: zod_1.default.string().describe('Source of the documentation'),
});
/**
 * Schema for code review output
 */
exports.CodeReviewOutput = zod_1.default.object({
    // dependencies_already_installed: z.array(z.string()).describe('List of dependencies that are already installed in the project'),
    dependenciesNotMet: zod_1.default.array(zod_1.default.string()).describe('List of dependencies that are not met in the project'),
    issuesFound: zod_1.default.boolean().describe('Whether any issues were found in the code review'),
    frontendIssues: zod_1.default.array(zod_1.default.string()).describe('Issues related to the frontend code'),
    backendIssues: zod_1.default.array(zod_1.default.string()).describe('Issues related to the backend code'),
    // summary: z.string().describe('Detailed summary of the issues found in the code review'),
    filesToFix: zod_1.default.array(zod_1.default.object({
        filePath: zod_1.default.string().describe('Path to the file that needs fixing'),
        issues: zod_1.default.array(zod_1.default.string()).describe('List of issues found in this file and actionable recommendations for fixing them'),
        require_code_changes: zod_1.default.boolean().describe('Whether code changes are required to fix the issues'),
    })).describe('List of files that need to be fixed'),
    commands: zod_1.default.array(zod_1.default.string()).describe('Commands that might be needed to run for fixing an issue. Empty array if no commands are needed'),
});
exports.BlueprintSchema = zod_1.default.object({
    title: zod_1.default.string().describe('Title of the application'),
    projectName: zod_1.default.string().describe('Name of the project, in small case, no special characters, no spaces, no dots. Only letters, numbers, hyphens, underscores are allowed.'),
    detailedDescription: zod_1.default.string().describe('Enhanced and detailed description of what the application does and how its supposed to work. Break down the project into smaller components and describe each component in detail.'),
    description: zod_1.default.string().describe('Short, brief, concise description of the application in a single sentence'),
    colorPalette: zod_1.default.array(zod_1.default.string()).describe('Color palette RGB codes to be used in the application, only base colors and not their shades, max 3 colors'),
    views: zod_1.default.array(zod_1.default.object({
        name: zod_1.default.string().describe('Name of the view'),
        description: zod_1.default.string().describe('Description of the view'),
    })).describe('Views of the application'),
    userFlow: zod_1.default.object({
        uiLayout: zod_1.default.string().describe('Detailed description of the layout of the user interface of the application, including margins, padding, spacing, etc. and how UI elements appear and where'),
        uiDesign: zod_1.default.string().describe('Description of the user interface design and how it should look, including styling, colors, fonts, etc.'),
        userJourney: zod_1.default.string().describe('Description of the user journey through the application across all the components and how they interact with each other'),
    }).describe('Description of how the user will interact with the application'),
    dataFlow: zod_1.default.string().describe('Brief description of how data flows through the application, if any'),
    architecture: zod_1.default.object({
        dataFlow: zod_1.default.string().describe('Conscise description of how data flows through the application'),
    }).describe('Description of the architecture of the application, only needed for a dynamic application'),
    pitfalls: zod_1.default.array(zod_1.default.string()).describe('Exhaustive yet concise list of all the various framework and domain specific pitfalls, issues, challenges, and bugs that can occur while developing this and to avoid during implementation'),
    frameworks: zod_1.default.array(zod_1.default.string()).describe('Essential Frameworks, libraries and dependencies to be used in the application, with only major versions optionally specified'),
    implementationRoadmap: zod_1.default.array(zod_1.default.object({
        phase: zod_1.default.string().describe('Phase name'),
        description: zod_1.default.string().describe('Description of the phase'),
    })).describe('Phases of the implementation roadmap'),
    initialPhase: exports.PhaseConceptSchema.describe('The first phase to be implemented, in **STRICT** accordance with <PHASE GENERATION STRATEGY>'),
    // commands: z.array(z.string()).describe('Commands to set up the development environment and install all dependencies not already in the template. These will run before code generation starts.'),
});
exports.SetupCommandsSchema = zod_1.default.object({
    commands: zod_1.default.array(zod_1.default.string()).describe('Commands to set up the development environment and install all dependencies not already in the template. These will run before code generation starts.')
});
exports.ClientReportedErrorSchema = zod_1.default.object({
    type: zod_1.default.string().describe('Type of error'),
    data: zod_1.default.object({
        errorType: zod_1.default.string().describe('Type of error'),
        consecutiveCount: zod_1.default.number().describe('Number of consecutive errors'),
        url: zod_1.default.string().describe('URL where the error occurred'),
        timestamp: zod_1.default.string().describe('Timestamp of the error'),
        error: zod_1.default.object({
            message: zod_1.default.string().describe('Error message'),
            fullBodyText: zod_1.default.string().describe('Full error body text'),
            fullBodyHtml: zod_1.default.string().describe('Full error body HTML'),
            errorElementsFound: zod_1.default.number().describe('Number of error elements found'),
        }).describe('Error details'),
        browserInfo: zod_1.default.object({
            userAgent: zod_1.default.string().describe('User agent'),
            url: zod_1.default.string().describe('URL where the error occurred'),
        }).describe('Browser information'),
    }).describe('Error data'),
});
// Screenshot Analysis Schema
exports.ScreenshotAnalysisSchema = zod_1.default.object({
    hasIssues: zod_1.default.boolean().describe('Whether any issues were found in the screenshot'),
    issues: zod_1.default.array(zod_1.default.string()).describe('List of specific issues found'),
    suggestions: zod_1.default.array(zod_1.default.string()).describe('Suggestions for improvements'),
    uiCompliance: zod_1.default.object({
        matchesBlueprint: zod_1.default.boolean().describe('Whether the UI matches the blueprint specifications'),
        deviations: zod_1.default.array(zod_1.default.string()).describe('List of deviations from the blueprint')
    })
});
exports.AgentActionSchema = zod_1.default.object({
    action: zod_1.default.string().describe('Next action to be taken'),
    data: zod_1.default.record(zod_1.default.unknown()).describe('Data associated with the action')
});
// Conversational AI Schemas
exports.ConversationalResponseSchema = zod_1.default.object({
    enhancedUserRequest: zod_1.default.string().describe('Enhanced and clarified user request to be added to pendingUserInputs'),
    userResponse: zod_1.default.string().describe('Response message to send back to the user via WebSocket'),
});
