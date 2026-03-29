import { Database } from 'bun:sqlite';
import { createHash } from 'crypto';
import { getErrorDbPath, getLogDbPath, ERROR_HASH_ALGORITHM, DEFAULT_STORAGE_OPTIONS, DEFAULT_LOG_STORE_OPTIONS } from './types.js';
/**
 * Unified storage manager with shared database connections and optimized operations
 */
export class StorageManager {
    errorDb;
    logDb;
    errorStorage;
    logStorage;
    options;
    constructor(errorDbPath = getErrorDbPath(), logDbPath = getLogDbPath(), options = {}) {
        this.options = {
            error: { ...DEFAULT_STORAGE_OPTIONS, ...options.error },
            log: { ...DEFAULT_LOG_STORE_OPTIONS, ...options.log }
        };
        // Ensure data directories exist
        this.ensureDataDirectory(errorDbPath);
        if (errorDbPath !== logDbPath) {
            this.ensureDataDirectory(logDbPath);
        }
        // Initialize databases with optimal settings
        this.errorDb = this.initializeDatabase(errorDbPath);
        this.logDb = errorDbPath === logDbPath ? this.errorDb : this.initializeDatabase(logDbPath);
        // Initialize storage components
        this.errorStorage = new ErrorStorage(this.errorDb, this.options.error);
        this.logStorage = new LogStorage(this.logDb, this.options.log);
        // Setup periodic maintenance
        this.setupMaintenanceTasks();
    }
    ensureDataDirectory(dbPath) {
        const fs = require('fs');
        const path = require('path');
        const dir = path.dirname(dbPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }
    initializeDatabase(dbPath) {
        const fs = require('fs');
        // Check if database already exists to avoid race conditions during initialization
        const dbExists = fs.existsSync(dbPath);
        const db = new Database(dbPath);
        // Only set pragmas if this is a new database to avoid conflicts
        if (!dbExists) {
            try {
                // Optimal performance settings for container environment
                db.exec('PRAGMA journal_mode = WAL');
                db.exec('PRAGMA synchronous = NORMAL');
                db.exec('PRAGMA cache_size = 10000');
                db.exec('PRAGMA temp_store = memory');
            }
            catch (error) {
                // If pragma setup fails (due to concurrent access), continue anyway
                console.warn('Database pragma setup failed (this is okay if database already initialized):', error);
            }
        }
        return db;
    }
    setupMaintenanceTasks() {
        // Cleanup old records every hour
        setInterval(() => {
            this.errorStorage.cleanupOldErrors();
            this.logStorage.cleanupOldLogs();
        }, 60 * 60 * 1000);
    }
    // Error storage methods
    storeError(instanceId, processId, error) {
        try {
            return this.retryOperation(() => this.errorStorage.storeError(instanceId, processId, error));
        }
        catch (retryError) {
            return { success: false, error: retryError instanceof Error ? retryError : new Error(String(retryError)) };
        }
    }
    getErrors(instanceId) {
        try {
            return this.retryOperation(() => this.errorStorage.getErrors(instanceId));
        }
        catch (retryError) {
            return { success: false, error: retryError instanceof Error ? retryError : new Error(String(retryError)) };
        }
    }
    getErrorSummary(instanceId) {
        try {
            return this.retryOperation(() => this.errorStorage.getErrorSummary(instanceId));
        }
        catch (retryError) {
            return { success: false, error: retryError instanceof Error ? retryError : new Error(String(retryError)) };
        }
    }
    clearErrors(instanceId) {
        try {
            return this.retryOperation(() => this.errorStorage.clearErrors(instanceId));
        }
        catch (retryError) {
            return { success: false, error: retryError instanceof Error ? retryError : new Error(String(retryError)) };
        }
    }
    // Log storage methods
    storeLog(log) {
        return this.logStorage.storeLog(log);
    }
    storeLogs(logs) {
        return this.logStorage.storeLogs(logs);
    }
    getLogs(filter = {}) {
        return this.logStorage.getLogs(filter);
    }
    clearLogs(instanceId) {
        return this.logStorage.clearLogs(instanceId);
    }
    getLogStats(instanceId) {
        return this.logStorage.getLogStats(instanceId);
    }
    /**
     * Retry operation with exponential backoff for SQLITE_BUSY errors
     * Uses synchronous retry for immediate operations to maintain performance
     */
    retryOperation(operation, maxAttempts = 3) {
        let lastError;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return operation();
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                // Check if it's a SQLite busy error
                if (lastError.message.includes('SQLITE_BUSY') || lastError.message.includes('database is locked')) {
                    if (attempt < maxAttempts) {
                        // Use minimal delay for SQLite contention - most resolve quickly
                        const delay = Math.min(10 * Math.pow(2, attempt - 1), 100); // Cap at 100ms
                        const start = Date.now();
                        while (Date.now() - start < delay) {
                            // Minimal busy wait for SQLite - usually resolves in microseconds
                        }
                        continue;
                    }
                }
                // If not a busy error, or max attempts reached, throw immediately
                throw lastError;
            }
        }
        throw lastError;
    }
    /**
     * Unified transaction support for batch operations
     */
    transaction(operation) {
        // Use error database for transaction coordination
        const transaction = this.errorDb.transaction(operation);
        return transaction();
    }
    /**
     * Close all database connections and cleanup
     */
    close() {
        try {
            this.errorStorage.close();
            this.logStorage.close();
            if (this.errorDb !== this.logDb) {
                this.logDb.close();
            }
            this.errorDb.close();
        }
        catch (error) {
            console.error('Error closing storage manager:', error);
        }
    }
}
/**
 * Error storage component with optimized SQLite operations
 */
class ErrorStorage {
    db;
    options;
    // Prepared statements for maximum performance  
    insertErrorStmt;
    selectErrorsStmt;
    countErrorsStmt;
    deleteAllErrorsStmt;
    deleteOldErrorsStmt;
    constructor(db, options) {
        this.db = db;
        this.options = options;
        this.initializeSchema();
        this.prepareStatements();
    }
    initializeSchema() {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS runtime_errors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        instance_id TEXT NOT NULL,
        process_id TEXT NOT NULL,
        error_hash TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL,
        severity TEXT NOT NULL,
        message TEXT NOT NULL,
        stack_trace TEXT,
        source_file TEXT,
        line_number INTEGER,
        column_number INTEGER,
        raw_output TEXT NOT NULL,
        first_occurrence TEXT NOT NULL,
        last_occurrence TEXT NOT NULL,
        occurrence_count INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_instance_errors ON runtime_errors(instance_id);
      CREATE INDEX IF NOT EXISTS idx_error_hash ON runtime_errors(error_hash);
      CREATE INDEX IF NOT EXISTS idx_last_occurrence ON runtime_errors(last_occurrence DESC);
      CREATE INDEX IF NOT EXISTS idx_severity ON runtime_errors(severity);
    `);
    }
    prepareStatements() {
        this.insertErrorStmt = this.db.query(`
      INSERT INTO runtime_errors (
        instance_id, process_id, error_hash, category, severity, message,
        stack_trace, source_file, line_number, column_number, raw_output,
        first_occurrence, last_occurrence
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(error_hash) DO UPDATE SET
        last_occurrence = excluded.last_occurrence,
        occurrence_count = occurrence_count + 1
    `);
        this.selectErrorsStmt = this.db.query(`
      SELECT * FROM runtime_errors 
      WHERE instance_id = ?
      ORDER BY last_occurrence DESC
    `);
        this.countErrorsStmt = this.db.query(`
      SELECT COUNT(*) as count FROM runtime_errors WHERE instance_id = ?
    `);
        this.deleteAllErrorsStmt = this.db.query(`
      DELETE FROM runtime_errors WHERE instance_id = ?
    `);
        this.deleteOldErrorsStmt = this.db.query(`
      DELETE FROM runtime_errors 
      WHERE datetime(created_at) < datetime('now', '-' || ? || ' days')
    `);
    }
    storeError(instanceId, processId, error) {
        try {
            const errorHash = this.generateErrorHash(error);
            const now = new Date().toISOString();
            this.insertErrorStmt.run(instanceId, processId, errorHash, error.category, error.severity, error.message, error.stackTrace || null, error.sourceFile || null, error.lineNumber || null, error.columnNumber || null, error.rawOutput, now, now);
            return { success: true, data: true };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error : new Error('Unknown error storing error')
            };
        }
    }
    getErrors(instanceId) {
        try {
            const errors = this.selectErrorsStmt.all(instanceId);
            return { success: true, data: errors };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error : new Error('Unknown error retrieving errors')
            };
        }
    }
    getErrorSummary(instanceId) {
        try {
            const errors = this.selectErrorsStmt.all(instanceId);
            if (errors.length === 0) {
                return {
                    success: true,
                    data: {
                        totalErrors: 0,
                        errorsByCategory: {},
                        errorsBySeverity: {},
                        uniqueErrors: 0,
                        repeatedErrors: 0,
                        latestError: undefined,
                        oldestError: undefined
                    }
                };
            }
            const categoryCount = {};
            const severityCount = {};
            let totalOccurrences = 0;
            for (const error of errors) {
                categoryCount[error.category] = (categoryCount[error.category] || 0) + 1;
                severityCount[error.severity] = (severityCount[error.severity] || 0) + 1;
                totalOccurrences += error.occurrenceCount;
            }
            const summary = {
                totalErrors: totalOccurrences,
                uniqueErrors: errors.length,
                repeatedErrors: totalOccurrences - errors.length,
                errorsByCategory: categoryCount,
                errorsBySeverity: severityCount,
                latestError: new Date(errors[0].lastOccurrence),
                oldestError: new Date(errors[errors.length - 1].firstOccurrence)
            };
            return { success: true, data: summary };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error : new Error('Unknown error getting summary')
            };
        }
    }
    clearErrors(instanceId) {
        try {
            const countResult = this.countErrorsStmt.get(instanceId);
            const clearedCount = countResult?.count || 0;
            this.deleteAllErrorsStmt.run(instanceId);
            return { success: true, data: { clearedCount } };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error : new Error('Unknown error clearing errors')
            };
        }
    }
    cleanupOldErrors() {
        try {
            const result = this.deleteOldErrorsStmt.run(this.options.retentionDays);
            return { success: true, data: result.changes };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error : new Error('Unknown error cleaning up errors')
            };
        }
    }
    generateErrorHash(error) {
        const hashInput = [
            error.message.trim(),
            error.sourceFile || ''
        ].join('|');
        return createHash(ERROR_HASH_ALGORITHM)
            .update(hashInput)
            .digest('hex');
    }
    close() {
        // Database connection is managed by StorageManager
    }
}
/**
 * Log storage component with cursor-based pagination and in-memory buffering
 */
class LogStorage {
    db;
    options;
    // Prepared statements
    insertLogStmt;
    selectLogsStmt;
    selectLogsSinceStmt;
    countLogsStmt;
    deleteOldLogsStmt;
    getLastSequenceStmt;
    deleteAllLogsStmt;
    sequenceCounter = 0;
    constructor(db, options) {
        this.db = db;
        this.options = options;
        this.initializeSchema();
        this.prepareStatements();
        this.initializeSequenceCounter();
    }
    initializeSchema() {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS process_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        instance_id TEXT NOT NULL,
        process_id TEXT NOT NULL,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        stream TEXT NOT NULL,
        source TEXT,
        metadata TEXT,
        sequence INTEGER UNIQUE NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_instance_logs ON process_logs(instance_id);
      CREATE INDEX IF NOT EXISTS idx_sequence ON process_logs(sequence);
      CREATE INDEX IF NOT EXISTS idx_timestamp ON process_logs(timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_level ON process_logs(level);
      CREATE INDEX IF NOT EXISTS idx_instance_sequence ON process_logs(instance_id, sequence);
    `);
    }
    prepareStatements() {
        this.insertLogStmt = this.db.query(`
      INSERT INTO process_logs (
        instance_id, process_id, level, message, timestamp, 
        stream, source, metadata, sequence
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        this.selectLogsStmt = this.db.query(`
      SELECT * FROM process_logs 
      WHERE instance_id = ?
      ORDER BY sequence DESC
      LIMIT ? OFFSET ?
    `);
        this.selectLogsSinceStmt = this.db.query(`
      SELECT * FROM process_logs 
      WHERE instance_id = ? AND sequence > ?
      ORDER BY sequence ASC
      LIMIT ?
    `);
        this.countLogsStmt = this.db.query(`
      SELECT COUNT(*) as count FROM process_logs WHERE instance_id = ?
    `);
        this.deleteOldLogsStmt = this.db.query(`
      DELETE FROM process_logs 
      WHERE datetime(timestamp) < datetime('now', '-' || ? || ' hours')
    `);
        this.getLastSequenceStmt = this.db.query(`
      SELECT MAX(sequence) as maxSequence FROM process_logs
    `);
        this.deleteAllLogsStmt = this.db.query(`
      DELETE FROM process_logs WHERE instance_id = ?
    `);
    }
    initializeSequenceCounter() {
        const result = this.getLastSequenceStmt.get();
        this.sequenceCounter = (result?.maxSequence || 0) + 1;
    }
    storeLog(log) {
        try {
            const sequence = this.sequenceCounter++;
            const now = new Date().toISOString();
            this.insertLogStmt.run(log.instanceId, log.processId, log.level, log.message, now, log.stream, log.source || null, log.metadata ? JSON.stringify(log.metadata) : null, sequence);
            return { success: true, data: sequence };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error : new Error('Unknown error storing log')
            };
        }
    }
    storeLogs(logs) {
        try {
            const sequences = [];
            const transaction = this.db.transaction(() => {
                for (const log of logs) {
                    const result = this.storeLog(log);
                    if (result.success) {
                        sequences.push(result.data);
                    }
                    else {
                        throw result.error;
                    }
                }
            });
            transaction();
            return { success: true, data: sequences };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error : new Error('Unknown error storing logs')
            };
        }
    }
    getLogs(filter = {}) {
        try {
            const instanceId = filter.instanceId || '';
            const limit = filter.limit || 100;
            const offset = filter.offset || 0;
            const logs = this.selectLogsStmt.all(instanceId, limit, offset);
            const countResult = this.countLogsStmt.get(instanceId);
            const totalCount = countResult?.count || 0;
            const lastSequence = logs.length > 0 ? Math.max(...logs.map(l => l.sequence)) : 0;
            const cursor = {
                instanceId,
                lastSequence,
                lastRetrieved: new Date()
            };
            const hasMore = offset + logs.length < totalCount;
            return {
                success: true,
                data: {
                    success: true,
                    logs,
                    cursor,
                    hasMore,
                    totalCount
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error : new Error('Unknown error retrieving logs')
            };
        }
    }
    clearLogs(instanceId) {
        try {
            const countResult = this.countLogsStmt.get(instanceId);
            const clearedCount = countResult?.count || 0;
            this.deleteAllLogsStmt.run(instanceId);
            return { success: true, data: { clearedCount } };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error : new Error('Unknown error clearing logs')
            };
        }
    }
    getLogStats(instanceId) {
        try {
            const stats = this.db.query(`
        SELECT 
          COUNT(*) as total,
          level,
          stream,
          MIN(timestamp) as oldest,
          MAX(timestamp) as newest
        FROM process_logs 
        WHERE instance_id = ?
        GROUP BY level, stream
      `).all(instanceId);
            const logsByLevel = {};
            const logsByStream = {};
            let totalLogs = 0;
            let oldestLog;
            let newestLog;
            for (const stat of stats) {
                totalLogs += stat.total;
                logsByLevel[stat.level] = (logsByLevel[stat.level] || 0) + stat.total;
                logsByStream[stat.stream] = (logsByStream[stat.stream] || 0) + stat.total;
                const oldest = new Date(stat.oldest);
                const newest = new Date(stat.newest);
                if (!oldestLog || oldest < oldestLog)
                    oldestLog = oldest;
                if (!newestLog || newest > newestLog)
                    newestLog = newest;
            }
            return {
                success: true,
                data: {
                    totalLogs,
                    logsByLevel: logsByLevel,
                    logsByStream: logsByStream,
                    oldestLog,
                    newestLog
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error : new Error('Unknown error getting log stats')
            };
        }
    }
    cleanupOldLogs() {
        try {
            const result = this.deleteOldLogsStmt.run(this.options.retentionHours);
            return { success: true, data: result.changes };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error : new Error('Unknown error cleaning up logs')
            };
        }
    }
    close() {
        // Database connection is managed by StorageManager
    }
}
