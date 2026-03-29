"use strict";
/**
 * Main functional entry point for the deterministic code fixer
 * Stateless, functional approach to fixing TypeScript compilation issues
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateStubFileContent = exports.analyzeImportUsage = exports.makeRelativeImport = exports.resolvePathAlias = exports.isScriptFile = void 0;
exports.fixProjectIssues = fixProjectIssues;
var ast_1 = require("./utils/ast");
var modules_1 = require("./utils/modules");
// Import all fixers
var ts2307_1 = require("./fixers/ts2307");
var ts2613_1 = require("./fixers/ts2613");
var ts2304_1 = require("./fixers/ts2304");
var ts2305_1 = require("./fixers/ts2305");
var ts2614_1 = require("./fixers/ts2614");
var ts2724_1 = require("./fixers/ts2724");
// ============================================================================
// MAIN ENTRY POINT
// ============================================================================
/**
 * Fix TypeScript compilation issues across the entire project
 * Properly accumulates multiple fixes to the same file
 *
 * @param allFiles - Initial files to work with
 * @param issues - TypeScript compilation issues to fix
 * @param fileFetcher - Optional callback to fetch additional files on-demand
 * @returns Promise containing fix results with modified/new files
 */
function fixProjectIssues(allFiles, issues, fileFetcher) {
    return __awaiter(this, void 0, void 0, function () {
        var fileMap, fetchedFiles, context, fixerRegistry, _a, fixableIssues, unfixableIssues, sortedIssues, results, finalResult, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    fileMap = createFileMap(allFiles);
                    fetchedFiles = new Set();
                    context = {
                        files: fileMap,
                        fileFetcher: fileFetcher,
                        fetchedFiles: fetchedFiles
                    };
                    fixerRegistry = createFixerRegistry();
                    _a = separateIssues(issues, fixerRegistry), fixableIssues = _a.fixableIssues, unfixableIssues = _a.unfixableIssues;
                    sortedIssues = sortFixOrder(fixableIssues);
                    return [4 /*yield*/, applyFixesSequentially(context, sortedIssues, fixerRegistry)];
                case 1:
                    results = _b.sent();
                    finalResult = addUnfixableIssues(results, unfixableIssues);
                    return [2 /*return*/, finalResult];
                case 2:
                    error_1 = _b.sent();
                    // If there's a global error, mark all issues as unfixable
                    return [2 /*return*/, {
                            fixedIssues: [],
                            unfixableIssues: issues.map(function (issue) { return ({
                                issueCode: issue.ruleId || 'UNKNOWN',
                                filePath: issue.filePath,
                                line: issue.line,
                                column: issue.column,
                                originalMessage: issue.message,
                                reason: "Global fixer error: ".concat(error_1 instanceof Error ? error_1.message : 'Unknown error')
                            }); }),
                            modifiedFiles: []
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// ============================================================================
// FILE MAP CREATION
// ============================================================================
/**
 * Create file map from input files (mutable for caching fetched files)
 */
function createFileMap(files) {
    var fileMap = new Map();
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        // Only include script files
        if ((0, ast_1.isScriptFile)(file.filePath)) {
            fileMap.set(file.filePath, {
                filePath: file.filePath,
                content: file.fileContents,
                ast: undefined // Lazy-loaded
            });
        }
    }
    return fileMap;
}
// ============================================================================
// FIXER REGISTRY
// ============================================================================
/**
 * Create registry of all available fixers
 */
function createFixerRegistry() {
    var registry = new Map();
    // Register fixers with their detection functions
    registry.set('TS2307', ts2307_1.fixModuleNotFound);
    registry.set('TS2613', ts2613_1.fixModuleIsNotModule);
    registry.set('TS2304', ts2304_1.fixUndefinedName);
    registry.set('TS2305', ts2305_1.fixMissingExportedMember);
    registry.set('TS2614', ts2614_1.fixImportExportTypeMismatch);
    registry.set('TS2724', ts2724_1.fixIncorrectNamedImport);
    return registry;
}
// ============================================================================
// ISSUE GROUPING
// ============================================================================
/**
 * Separate issues into fixable and unfixable based on available fixers
 */
function separateIssues(issues, fixerRegistry) {
    var fixableIssues = [];
    var unfixableIssues = [];
    for (var _i = 0, issues_1 = issues; _i < issues_1.length; _i++) {
        var issue = issues_1[_i];
        if (issue.ruleId && fixerRegistry.has(issue.ruleId)) {
            fixableIssues.push(issue);
        }
        else {
            unfixableIssues.push(issue);
        }
    }
    return { fixableIssues: fixableIssues, unfixableIssues: unfixableIssues };
}
// ============================================================================
// FIX APPLICATION
// ============================================================================
/**
 * Sort issues for optimal fix order
 */
function sortFixOrder(issues) {
    // Priority order:
    // 1. TS2307 - Module not found (creates files)
    // 2. TS2305 - Missing exports (adds to existing files)
    // 3. TS2613/TS2614 - Import/export mismatches
    // 4. TS2724 - Incorrect named imports
    // 5. TS2304 - Undefined names (adds declarations)
    var priorityMap = {
        'TS2307': 1,
        'TS2305': 2,
        'TS2613': 3,
        'TS2614': 3,
        'TS2724': 4,
        'TS2304': 5,
    };
    return issues.sort(function (a, b) {
        var aPriority = priorityMap[a.ruleId || ''] || 99;
        var bPriority = priorityMap[b.ruleId || ''] || 99;
        if (aPriority !== bPriority) {
            return aPriority - bPriority;
        }
        // Within same priority, sort by file then line
        if (a.filePath !== b.filePath) {
            return a.filePath.localeCompare(b.filePath);
        }
        return a.line - b.line;
    });
}
/**
 * Apply fixes sequentially, updating context after each fix
 */
function applyFixesSequentially(context, sortedIssues, fixerRegistry) {
    return __awaiter(this, void 0, void 0, function () {
        var fixedIssues, unfixableIssues, modifiedFiles, newFiles, issuesByFixer, _i, sortedIssues_1, issue, type, issues, fixerTypes, _a, fixerTypes_1, fixerType, issues, fixer, result, _b, _c, file, _d, _e, file, error_2;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    fixedIssues = [];
                    unfixableIssues = [];
                    modifiedFiles = new Map();
                    newFiles = new Map();
                    issuesByFixer = new Map();
                    for (_i = 0, sortedIssues_1 = sortedIssues; _i < sortedIssues_1.length; _i++) {
                        issue = sortedIssues_1[_i];
                        type = issue.ruleId || 'UNKNOWN';
                        issues = issuesByFixer.get(type) || [];
                        issues.push(issue);
                        issuesByFixer.set(type, issues);
                    }
                    fixerTypes = Array.from(issuesByFixer.keys()).sort(function (a, b) {
                        var priorityMap = {
                            'TS2307': 1,
                            'TS2305': 2,
                            'TS2613': 3,
                            'TS2614': 3,
                            'TS2724': 4,
                            'TS2304': 5,
                        };
                        return (priorityMap[a] || 99) - (priorityMap[b] || 99);
                    });
                    _a = 0, fixerTypes_1 = fixerTypes;
                    _f.label = 1;
                case 1:
                    if (!(_a < fixerTypes_1.length)) return [3 /*break*/, 6];
                    fixerType = fixerTypes_1[_a];
                    issues = issuesByFixer.get(fixerType) || [];
                    fixer = fixerRegistry.get(fixerType);
                    if (!fixer) {
                        unfixableIssues.push.apply(unfixableIssues, issues.map(function (issue) { return ({
                            issueCode: issue.ruleId || 'UNKNOWN',
                            filePath: issue.filePath,
                            line: issue.line,
                            column: issue.column,
                            originalMessage: issue.message,
                            reason: 'No fixer available'
                        }); }));
                        return [3 /*break*/, 5];
                    }
                    _f.label = 2;
                case 2:
                    _f.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, fixer(context, issues)];
                case 3:
                    result = _f.sent();
                    // Collect results
                    fixedIssues.push.apply(fixedIssues, result.fixedIssues);
                    unfixableIssues.push.apply(unfixableIssues, result.unfixableIssues);
                    // Update files - these override previous versions
                    for (_b = 0, _c = result.modifiedFiles; _b < _c.length; _b++) {
                        file = _c[_b];
                        if ((0, modules_1.canModifyFile)(file.filePath)) {
                            modifiedFiles.set(file.filePath, file);
                            // Update context for next fixer
                            context.files.set(file.filePath, {
                                filePath: file.filePath,
                                content: file.fileContents,
                                ast: undefined
                            });
                        }
                    }
                    for (_d = 0, _e = result.newFiles || []; _d < _e.length; _d++) {
                        file = _e[_d];
                        if ((0, modules_1.canModifyFile)(file.filePath)) {
                            newFiles.set(file.filePath, file);
                            // Add to context for next fixer
                            context.files.set(file.filePath, {
                                filePath: file.filePath,
                                content: file.fileContents,
                                ast: undefined
                            });
                        }
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _f.sent();
                    unfixableIssues.push.apply(unfixableIssues, issues.map(function (issue) { return ({
                        issueCode: issue.ruleId || 'UNKNOWN',
                        filePath: issue.filePath,
                        line: issue.line,
                        column: issue.column,
                        originalMessage: issue.message,
                        reason: "Fixer failed: ".concat(error_2 instanceof Error ? error_2.message : 'Unknown error')
                    }); }));
                    return [3 /*break*/, 5];
                case 5:
                    _a++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/, {
                        fixedIssues: fixedIssues,
                        unfixableIssues: unfixableIssues,
                        modifiedFiles: Array.from(modifiedFiles.values()),
                        newFiles: Array.from(newFiles.values())
                    }];
            }
        });
    });
}
// ============================================================================
// RESULT MERGING
// ============================================================================
/**
 * Add pre-separated unfixable issues to results
 */
function addUnfixableIssues(results, preSeparatedUnfixableIssues) {
    // Convert pre-separated unfixable issues to proper format
    var noFixerAvailableIssues = preSeparatedUnfixableIssues.map(function (issue) {
        var reason = 'No fixer available for this issue type';
        if (!(0, modules_1.canModifyFile)(issue.filePath)) {
            reason += ' (file outside project boundaries)';
        }
        return {
            issueCode: issue.ruleId || 'UNKNOWN',
            filePath: issue.filePath,
            line: issue.line,
            column: issue.column,
            originalMessage: issue.message,
            reason: reason
        };
    });
    return __assign(__assign({}, results), { unfixableIssues: __spreadArray(__spreadArray([], results.unfixableIssues, true), noFixerAvailableIssues, true) });
}
// Re-export utility functions that might be useful
var ast_2 = require("./utils/ast");
Object.defineProperty(exports, "isScriptFile", { enumerable: true, get: function () { return ast_2.isScriptFile; } });
var paths_1 = require("./utils/paths");
Object.defineProperty(exports, "resolvePathAlias", { enumerable: true, get: function () { return paths_1.resolvePathAlias; } });
Object.defineProperty(exports, "makeRelativeImport", { enumerable: true, get: function () { return paths_1.makeRelativeImport; } });
var imports_1 = require("./utils/imports");
Object.defineProperty(exports, "analyzeImportUsage", { enumerable: true, get: function () { return imports_1.analyzeImportUsage; } });
var stubs_1 = require("./utils/stubs");
Object.defineProperty(exports, "generateStubFileContent", { enumerable: true, get: function () { return stubs_1.generateStubFileContent; } });
