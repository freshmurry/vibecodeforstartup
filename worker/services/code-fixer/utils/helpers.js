"use strict";
/**
 * Common helper utilities for all fixers
 * Implements DRY principles by centralizing repeated patterns
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSourceFileAndImport = getSourceFileAndImport;
exports.getTargetFileAndAST = getTargetFileAndAST;
exports.getSourceAndTargetFiles = getSourceAndTargetFiles;
exports.createUnfixableIssue = createUnfixableIssue;
exports.handleFixerError = handleFixerError;
exports.createSourceFileParseError = createSourceFileParseError;
exports.createMissingImportError = createMissingImportError;
exports.createExternalModuleError = createExternalModuleError;
exports.createTargetFileNotFoundError = createTargetFileNotFoundError;
exports.createTargetFileParseError = createTargetFileParseError;
exports.validateFixerOperation = validateFixerOperation;
exports.createFixerLogMessages = createFixerLogMessages;
var imports_1 = require("./imports");
var modules_1 = require("./modules");
// ============================================================================
// COMMON FIXER PATTERNS
// ============================================================================
/**
 * Standard pattern: Get source file AST and import info
 * Used by TS2305, TS2613, TS2614 fixers
 */
function getSourceFileAndImport(issue, context) {
    return __awaiter(this, void 0, void 0, function () {
        var sourceAST, importInfo;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, imports_1.getFileAST)(issue.filePath, context.files, context.fileFetcher, context.fetchedFiles)];
                case 1:
                    sourceAST = _a.sent();
                    if (!sourceAST) {
                        return [2 /*return*/, null];
                    }
                    importInfo = (0, imports_1.findImportAtLocation)(sourceAST, issue.line);
                    if (!importInfo) {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, { sourceAST: sourceAST, importInfo: importInfo }];
            }
        });
    });
}
/**
 * Standard pattern: Get target file for a module specifier
 * Used by TS2305, TS2613, TS2614 fixers
 */
function getTargetFileAndAST(moduleSpecifier, fromFilePath, context) {
    return __awaiter(this, void 0, void 0, function () {
        var validation, targetFilePath, fileValidation, targetAST;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    validation = (0, modules_1.validateModuleOperation)(moduleSpecifier, null);
                    if (!validation.valid) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, (0, modules_1.resolveModuleFile)(moduleSpecifier, fromFilePath, context)];
                case 1:
                    targetFilePath = _a.sent();
                    if (!targetFilePath) {
                        return [2 /*return*/, null];
                    }
                    fileValidation = (0, modules_1.validateModuleOperation)(moduleSpecifier, targetFilePath);
                    if (!fileValidation.valid) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, (0, imports_1.getFileAST)(targetFilePath, context.files, context.fileFetcher, context.fetchedFiles)];
                case 2:
                    targetAST = _a.sent();
                    if (!targetAST) {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, { targetFilePath: targetFilePath, targetAST: targetAST }];
            }
        });
    });
}
/**
 * Combined pattern: Get both source and target files
 * Used by import/export fixers that need both files
 */
function getSourceAndTargetFiles(issue, context) {
    return __awaiter(this, void 0, void 0, function () {
        var sourceResult, sourceAST, importInfo, targetResult, targetFilePath, targetAST;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getSourceFileAndImport(issue, context)];
                case 1:
                    sourceResult = _a.sent();
                    if (!sourceResult) {
                        return [2 /*return*/, null];
                    }
                    sourceAST = sourceResult.sourceAST, importInfo = sourceResult.importInfo;
                    return [4 /*yield*/, getTargetFileAndAST(importInfo.moduleSpecifier, issue.filePath, context)];
                case 2:
                    targetResult = _a.sent();
                    if (!targetResult) {
                        return [2 /*return*/, null];
                    }
                    targetFilePath = targetResult.targetFilePath, targetAST = targetResult.targetAST;
                    return [2 /*return*/, {
                            sourceAST: sourceAST,
                            importInfo: importInfo,
                            targetFilePath: targetFilePath,
                            targetAST: targetAST
                        }];
            }
        });
    });
}
// ============================================================================
// ERROR HANDLING HELPERS
// ============================================================================
/**
 * Create a standardized unfixable issue with consistent format
 */
function createUnfixableIssue(issue, reason) {
    return {
        issueCode: issue.ruleId || 'UNKNOWN',
        filePath: issue.filePath,
        line: issue.line,
        column: issue.column,
        originalMessage: issue.message,
        reason: reason
    };
}
/**
 * Handle common fixer errors with standardized messages
 */
function handleFixerError(issue, error, fixerName) {
    return createUnfixableIssue(issue, "".concat(fixerName, " failed: ").concat(error.message));
}
/**
 * Create unfixable issue for source file parsing failures
 */
function createSourceFileParseError(issue) {
    return createUnfixableIssue(issue, 'Failed to parse source file AST');
}
/**
 * Create unfixable issue for missing import at location
 */
function createMissingImportError(issue) {
    return createUnfixableIssue(issue, 'No import found at specified location');
}
/**
 * Create unfixable issue for external module operations
 */
function createExternalModuleError(issue, moduleSpecifier) {
    return createUnfixableIssue(issue, "External package \"".concat(moduleSpecifier, "\" should be handled by package manager"));
}
/**
 * Create unfixable issue for target file not found
 */
function createTargetFileNotFoundError(issue, moduleSpecifier) {
    return createUnfixableIssue(issue, "Target file not found for module: ".concat(moduleSpecifier));
}
/**
 * Create unfixable issue for target file parsing failures
 */
function createTargetFileParseError(issue, targetFilePath) {
    return createUnfixableIssue(issue, "Failed to parse target file: ".concat(targetFilePath));
}
// ============================================================================
// VALIDATION HELPERS
// ============================================================================
/**
 * Validate a fixer operation and return appropriate error if invalid
 */
function validateFixerOperation(issue, moduleSpecifier, targetFilePath) {
    if (moduleSpecifier) {
        var validation = (0, modules_1.validateModuleOperation)(moduleSpecifier, targetFilePath || null);
        if (!validation.valid) {
            return createUnfixableIssue(issue, validation.reason);
        }
    }
    return null;
}
// ============================================================================
// LOGGING HELPERS
// ============================================================================
/**
 * Create consistent log messages for fixer operations
 */
function createFixerLogMessages(fixerName, issueCount) {
    return {
        start: "Starting ".concat(fixerName, " with ").concat(issueCount, " issues"),
        processing: function (issue) { return "Processing ".concat(issue.ruleId, " issue: ").concat(issue.message, " at ").concat(issue.filePath, ":").concat(issue.line); },
        success: function (issue) { return "Successfully fixed ".concat(issue.ruleId, " issue for ").concat(issue.filePath); },
        completed: function (fixed, unfixable, modified, newFiles) {
            return "".concat(fixerName, " completed: ").concat(fixed, " fixed, ").concat(unfixable, " unfixable, ").concat(modified, " modified files, ").concat(newFiles, " new files");
        }
    };
}
