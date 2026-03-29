import { z } from 'zod';
// ==========================================
// CORE ERROR TYPES
// ==========================================
export const ErrorCategorySchema = z.enum([
    'compilation', // TypeScript, build tool errors
    'runtime', // JavaScript runtime exceptions, unhandled promises
    'network', // Connection failures, timeout errors
    'filesystem', // Missing files, permission issues
    'dependency', // Missing packages, version conflicts
    'syntax', // Parse errors, invalid code
    'memory', // Out of memory, heap limit exceeded
    'environment', // Missing env vars, configuration issues
    'unknown' // Fallback for unmatched patterns
]);
export const ErrorSeveritySchema = z.enum([
    'fatal', // Process-terminating errors
    'error', // Standard errors that break functionality
    'warning', // Non-breaking issues that should be addressed
    'info' // Informational messages for debugging
]);
// ==========================================
// CORE LOG TYPES
// ==========================================
export const LogLevelSchema = z.enum([
    'debug', // Detailed diagnostic information
    'info', // General informational messages
    'warn', // Warning messages (non-error issues)
    'error', // Error messages (already handled by error system)
    'output' // Raw process output (stdout/stderr)
]);
// ==========================================
// STORAGE SCHEMAS
// ==========================================
export const StoredErrorSchema = z.object({
    id: z.number(),
    instanceId: z.string(),
    processId: z.string(),
    errorHash: z.string(),
    category: ErrorCategorySchema,
    severity: ErrorSeveritySchema,
    message: z.string(),
    stackTrace: z.string().nullable(),
    sourceFile: z.string().nullable(),
    lineNumber: z.number().nullable(),
    columnNumber: z.number().nullable(),
    rawOutput: z.string(),
    context: z.string().nullable(),
    firstOccurrence: z.string(),
    lastOccurrence: z.string(),
    occurrenceCount: z.number(),
    createdAt: z.string()
});
export const StoredLogSchema = z.object({
    id: z.number(),
    instanceId: z.string(),
    processId: z.string(),
    level: LogLevelSchema,
    message: z.string(),
    timestamp: z.string(),
    stream: z.enum(['stdout', 'stderr']),
    source: z.string().optional(),
    metadata: z.string().nullable(),
    sequence: z.number(),
    createdAt: z.string()
});
// ==========================================
// PROCESS MONITORING TYPES
// ==========================================
export const ProcessStateSchema = z.enum([
    'starting',
    'running',
    'stopping',
    'stopped',
    'crashed',
    'restarting'
]);
// ==========================================
// MONITORING EVENTS
// ==========================================
export const MonitoringEventSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('process_started'),
        processId: z.string(),
        instanceId: z.string(),
        pid: z.number(),
        command: z.string(),
        timestamp: z.date()
    }),
    z.object({
        type: z.literal('process_stopped'),
        processId: z.string(),
        instanceId: z.string(),
        exitCode: z.number().nullable(),
        reason: z.string(),
        timestamp: z.date()
    }),
    z.object({
        type: z.literal('error_detected'),
        processId: z.string(),
        instanceId: z.string(),
        error: z.object({
            category: ErrorCategorySchema,
            severity: ErrorSeveritySchema,
            message: z.string(),
            hash: z.string(),
            isNewError: z.boolean()
        }),
        timestamp: z.date()
    }),
    z.object({
        type: z.literal('process_crashed'),
        processId: z.string(),
        instanceId: z.string(),
        exitCode: z.number().nullable(),
        signal: z.string().nullable(),
        willRestart: z.boolean(),
        timestamp: z.date()
    })
]);
// ==========================================
// CONSTANTS
// ==========================================
export const DEFAULT_MONITORING_OPTIONS = {
    restartOnCrash: true,
    maxRestarts: 3,
    restartDelay: 1000,
    killTimeout: 10000,
    errorBufferSize: 100,
    healthCheckInterval: 30000
};
export const DEFAULT_STORAGE_OPTIONS = {
    maxErrors: 1000,
    retentionDays: 7,
    vacuumInterval: 24
};
export const DEFAULT_LOG_STORE_OPTIONS = {
    maxLogs: 10000,
    retentionHours: 168, // 7 days
    bufferSize: 1000
};
// Configurable paths - use environment variables or default to ./data directory
export const getDataDirectory = () => {
    return process.env.CLI_DATA_DIR || './data';
};
export const getErrorDbPath = () => {
    return process.env.CLI_ERROR_DB_PATH || `${getDataDirectory()}/errors.db`;
};
export const getLogDbPath = () => {
    return process.env.CLI_LOG_DB_PATH || `${getDataDirectory()}/logs.db`;
};
// CLI tools path resolution for different environments
export const getCliToolsPath = () => {
    // In Docker container, use absolute path
    if (process.env.CONTAINER_ENV === 'docker') {
        return '/app/container/cli-tools.ts';
    }
    // For local development, try to find the cli-tools.ts file
    const path = require('path');
    const fs = require('fs');
    // Common locations to check
    const possiblePaths = [
        './cli-tools.ts',
        './container/cli-tools.ts',
        '../container/cli-tools.ts',
        path.join(__dirname, 'cli-tools.ts'),
        path.join(process.cwd(), 'container/cli-tools.ts')
    ];
    for (const possiblePath of possiblePaths) {
        try {
            if (fs.existsSync(possiblePath)) {
                return path.resolve(possiblePath);
            }
        }
        catch (error) {
            // Continue checking other paths
        }
    }
    // Fallback to relative path
    return './cli-tools.ts';
};
// Legacy constants for backward compatibility
export const ERROR_DB_PATH = getErrorDbPath();
export const LOG_DB_PATH = getLogDbPath();
export const ERROR_HASH_ALGORITHM = 'sha256';
