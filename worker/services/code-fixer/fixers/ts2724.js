"use strict";
/**
 * TS2724: Incorrect named import fixer
 * Handles cases where a named import doesn't exist but TypeScript suggests alternatives
 * Example: "'@/components/ui/sonner' has no exported member named 'toast'. Did you mean 'Toaster'?"
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
exports.fixIncorrectNamedImport = fixIncorrectNamedImport;
exports.parseTS2724ErrorMessage = parseTS2724ErrorMessage;
exports.replaceNamedImport = replaceNamedImport;
exports.applyMultipleNamedImportReplacements = applyMultipleNamedImportReplacements;
var ast_1 = require("../utils/ast");
var imports_1 = require("../utils/imports");
var logger_1 = require("../../../logger");
var t = require("@babel/types");
var paths_1 = require("../utils/paths");
var helpers_1 = require("../utils/helpers");
var modules_1 = require("../utils/modules");
var logger = (0, logger_1.createObjectLogger)({ name: 'TS2724Fixer' }, 'TS2724Fixer');
/**
 * Fix TS2724 "Incorrect named import" errors
 * Replaces incorrect named imports with the suggested correct ones from TypeScript
 */
function fixIncorrectNamedImport(context, issues) {
    return __awaiter(this, void 0, void 0, function () {
        var logs, fixedIssues, unfixableIssues, modifiedFilesMap, newFiles, issuesByFile, _i, issues_1, issue, fileIssues, _a, issuesByFile_1, _b, filePath, fileIssues, sourceAST, _c, fileIssues_1, issue, replacementsByImport, processedIssues, _d, fileIssues_2, issue, parseResult, moduleSpecifier, incorrectImport, suggestedImport, importInfo, resolvedPath, targetFile, targetAST, exports_1, key, fixedAST, fixedCode, _e, processedIssues_1, issue, parseResult, error_1, _f, fileIssues_3, issue;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    logs = (0, helpers_1.createFixerLogMessages)('TS2724Fixer', issues.length);
                    logger.info(logs.start);
                    fixedIssues = [];
                    unfixableIssues = [];
                    modifiedFilesMap = new Map();
                    newFiles = [];
                    issuesByFile = new Map();
                    for (_i = 0, issues_1 = issues; _i < issues_1.length; _i++) {
                        issue = issues_1[_i];
                        fileIssues = issuesByFile.get(issue.filePath) || [];
                        fileIssues.push(issue);
                        issuesByFile.set(issue.filePath, fileIssues);
                    }
                    _a = 0, issuesByFile_1 = issuesByFile;
                    _g.label = 1;
                case 1:
                    if (!(_a < issuesByFile_1.length)) return [3 /*break*/, 12];
                    _b = issuesByFile_1[_a], filePath = _b[0], fileIssues = _b[1];
                    _g.label = 2;
                case 2:
                    _g.trys.push([2, 10, , 11]);
                    return [4 /*yield*/, (0, imports_1.getFileAST)(filePath, context.files, context.fileFetcher, context.fetchedFiles)];
                case 3:
                    sourceAST = _g.sent();
                    if (!sourceAST) {
                        logger.error("Failed to parse source file: ".concat(filePath));
                        for (_c = 0, fileIssues_1 = fileIssues; _c < fileIssues_1.length; _c++) {
                            issue = fileIssues_1[_c];
                            unfixableIssues.push((0, helpers_1.createSourceFileParseError)(issue));
                        }
                        return [3 /*break*/, 11];
                    }
                    replacementsByImport = new Map();
                    processedIssues = [];
                    _d = 0, fileIssues_2 = fileIssues;
                    _g.label = 4;
                case 4:
                    if (!(_d < fileIssues_2.length)) return [3 /*break*/, 9];
                    issue = fileIssues_2[_d];
                    logger.info(logs.processing(issue));
                    parseResult = parseTS2724ErrorMessage(issue.message);
                    if (!parseResult) {
                        logger.warn("Could not parse TS2724 error message: ".concat(issue.message));
                        unfixableIssues.push((0, helpers_1.createUnfixableIssue)(issue, 'Could not parse error message to extract import names'));
                        return [3 /*break*/, 8];
                    }
                    moduleSpecifier = parseResult.moduleSpecifier, incorrectImport = parseResult.incorrectImport, suggestedImport = parseResult.suggestedImport;
                    // Check for external modules - we can't fix imports from external modules
                    if ((0, modules_1.isExternalModule)(moduleSpecifier)) {
                        logger.info("Skipping external module: ".concat(moduleSpecifier));
                        unfixableIssues.push((0, helpers_1.createExternalModuleError)(issue, moduleSpecifier));
                        return [3 /*break*/, 8];
                    }
                    importInfo = (0, imports_1.findImportAtLocation)(sourceAST, issue.line);
                    if (!importInfo) {
                        logger.warn("No import found at line ".concat(issue.line, " in ").concat(filePath));
                        unfixableIssues.push((0, helpers_1.createMissingImportError)(issue));
                        return [3 /*break*/, 8];
                    }
                    // Verify the import matches our expected module and incorrect import name
                    if (importInfo.moduleSpecifier !== moduleSpecifier) {
                        logger.warn("Module specifier mismatch. Expected: ".concat(moduleSpecifier, ", Found: ").concat(importInfo.moduleSpecifier));
                        unfixableIssues.push((0, helpers_1.createUnfixableIssue)(issue, 'Module specifier does not match error message'));
                        return [3 /*break*/, 8];
                    }
                    if (!importInfo.namedImports.includes(incorrectImport)) {
                        logger.warn("Incorrect import '".concat(incorrectImport, "' not found in named imports: ").concat(importInfo.namedImports.join(', ')));
                        unfixableIssues.push((0, helpers_1.createUnfixableIssue)(issue, "Named import '".concat(incorrectImport, "' not found in import statement")));
                        return [3 /*break*/, 8];
                    }
                    resolvedPath = (0, paths_1.resolvePathAlias)(moduleSpecifier);
                    return [4 /*yield*/, (0, paths_1.findModuleFile)(resolvedPath, filePath, context.files, context.fileFetcher, context.fetchedFiles)];
                case 5:
                    targetFile = _g.sent();
                    if (!targetFile) return [3 /*break*/, 7];
                    return [4 /*yield*/, (0, imports_1.getFileAST)(targetFile, context.files, context.fileFetcher, context.fetchedFiles)];
                case 6:
                    targetAST = _g.sent();
                    if (targetAST) {
                        exports_1 = (0, imports_1.getFileExports)(targetAST);
                        // Check if the suggested export exists
                        if (exports_1.namedExports.includes(suggestedImport) ||
                            exports_1.defaultExport === suggestedImport) {
                            key = "".concat(moduleSpecifier, ":").concat(issue.line);
                            if (!replacementsByImport.has(key)) {
                                replacementsByImport.set(key, new Map());
                            }
                            replacementsByImport.get(key).set(incorrectImport, suggestedImport);
                            processedIssues.push(issue);
                        }
                        else {
                            logger.warn("Suggested export '".concat(suggestedImport, "' not found in ").concat(targetFile));
                            unfixableIssues.push((0, helpers_1.createUnfixableIssue)(issue, "Suggested export '".concat(suggestedImport, "' not found in target module")));
                        }
                    }
                    else {
                        logger.warn("Could not parse target file: ".concat(targetFile));
                        unfixableIssues.push((0, helpers_1.createUnfixableIssue)(issue, 'Could not parse target module file'));
                    }
                    return [3 /*break*/, 8];
                case 7:
                    logger.warn("Could not find target module file for: ".concat(moduleSpecifier));
                    unfixableIssues.push((0, helpers_1.createUnfixableIssue)(issue, 'Target module file not found'));
                    _g.label = 8;
                case 8:
                    _d++;
                    return [3 /*break*/, 4];
                case 9:
                    // Apply all replacements at once
                    if (replacementsByImport.size > 0) {
                        fixedAST = applyMultipleNamedImportReplacements(sourceAST, replacementsByImport);
                        if (fixedAST) {
                            fixedCode = (0, ast_1.generateCode)(fixedAST).code;
                            // Store the result
                            modifiedFilesMap.set(filePath, {
                                filePath: filePath,
                                fileContents: fixedCode
                            });
                            // Record all fixed issues
                            for (_e = 0, processedIssues_1 = processedIssues; _e < processedIssues_1.length; _e++) {
                                issue = processedIssues_1[_e];
                                parseResult = parseTS2724ErrorMessage(issue.message);
                                if (parseResult) {
                                    fixedIssues.push({
                                        issueCode: issue.ruleId || 'TS2724',
                                        filePath: issue.filePath,
                                        line: issue.line,
                                        column: issue.column,
                                        originalMessage: issue.message,
                                        fixApplied: "Replaced incorrect named import '".concat(parseResult.incorrectImport, "' with '").concat(parseResult.suggestedImport, "' in module '").concat(parseResult.moduleSpecifier, "'"),
                                        fixType: 'import_fix'
                                    });
                                    logger.info("Successfully fixed TS2724 issue: replaced '".concat(parseResult.incorrectImport, "' with '").concat(parseResult.suggestedImport, "' in ").concat(issue.filePath));
                                }
                            }
                        }
                    }
                    return [3 /*break*/, 11];
                case 10:
                    error_1 = _g.sent();
                    logger.error("Error fixing TS2724 issues in ".concat(filePath, ":"), error_1);
                    for (_f = 0, fileIssues_3 = fileIssues; _f < fileIssues_3.length; _f++) {
                        issue = fileIssues_3[_f];
                        unfixableIssues.push((0, helpers_1.handleFixerError)(issue, error_1, 'TS2724Fixer'));
                    }
                    return [3 /*break*/, 11];
                case 11:
                    _a++;
                    return [3 /*break*/, 1];
                case 12:
                    logger.info(logs.completed(fixedIssues.length, unfixableIssues.length, modifiedFilesMap.size, newFiles.length));
                    return [2 /*return*/, {
                            fixedIssues: fixedIssues,
                            unfixableIssues: unfixableIssues,
                            modifiedFiles: Array.from(modifiedFilesMap.values()),
                            newFiles: newFiles
                        }];
            }
        });
    });
}
/**
 * Parse TS2724 error message to extract module specifier, incorrect import, and suggested import
 *
 * Examples:
 * - "'@/components/ui/sonner' has no exported member named 'toast'. Did you mean 'Toaster'?"
 * - "Module './utils' has no exported member 'utilFunction'. Did you mean 'utilityFunction'?"
 * - "'react' has no exported member named 'useCallback'. Did you mean 'useCallBack'?"
 */
function parseTS2724ErrorMessage(errorMessage) {
    // Pattern 1: Standard format with single quotes around module
    // "'@/components/ui/sonner' has no exported member named 'toast'. Did you mean 'Toaster'?"
    var pattern1 = /^'([^']+)'\s+has no exported member named\s+'([^']+)'\.?\s+Did you mean\s+'([^']+)'\??\s*$/i;
    var match1 = errorMessage.match(pattern1);
    if (match1) {
        return {
            moduleSpecifier: match1[1],
            incorrectImport: match1[2],
            suggestedImport: match1[3]
        };
    }
    // Pattern 2: Module format
    // "Module './utils' has no exported member 'utilFunction'. Did you mean 'utilityFunction'?"
    var pattern2 = /^Module\s+'([^']+)'\s+has no exported member\s+'([^']+)'\.?\s+Did you mean\s+'([^']+)'\??\s*$/i;
    var match2 = errorMessage.match(pattern2);
    if (match2) {
        return {
            moduleSpecifier: match2[1],
            incorrectImport: match2[2],
            suggestedImport: match2[3]
        };
    }
    // Pattern 3: Alternative format with "named" keyword
    // "'react' has no exported member named 'useCallback'. Did you mean 'useCallBack'?"
    var pattern3 = /^'([^']+)'\s+has no exported member\s+named\s+'([^']+)'\.?\s+Did you mean\s+'([^']+)'\??\s*$/i;
    var match3 = errorMessage.match(pattern3);
    if (match3) {
        return {
            moduleSpecifier: match3[1],
            incorrectImport: match3[2],
            suggestedImport: match3[3]
        };
    }
    // Pattern 4: Handle double quotes instead of single quotes
    // '"@/components/ui/sonner" has no exported member named "toast". Did you mean "Toaster"?'
    var pattern4 = /^"([^"]+)"\s+has no exported member named\s+"([^"]+)"\.?\s+Did you mean\s+"([^"]+)"\??\s*$/i;
    var match4 = errorMessage.match(pattern4);
    if (match4) {
        return {
            moduleSpecifier: match4[1],
            incorrectImport: match4[2],
            suggestedImport: match4[3]
        };
    }
    return null;
}
/**
 * Replace a named import in the AST with a different named import
 */
function replaceNamedImport(ast, moduleSpecifier, oldImportName, newImportName) {
    var importReplaced = false;
    // Create a copy of the AST to avoid mutating the original
    var newAST = t.cloneNode(ast, true, true);
    // Traverse the AST to find and replace the import
    t.traverseFast(newAST, function (node) {
        if (t.isImportDeclaration(node) && node.source.value === moduleSpecifier) {
            // Find the specific named import to replace
            node.specifiers = node.specifiers.map(function (specifier) {
                if (t.isImportSpecifier(specifier)) {
                    // Handle both regular named imports and aliased imports
                    var importedName = t.isIdentifier(specifier.imported)
                        ? specifier.imported.name
                        : specifier.imported.value;
                    if (importedName === oldImportName) {
                        // Replace with the new import name
                        var newSpecifier = t.importSpecifier(specifier.local, // Keep the same local name
                        t.identifier(newImportName) // Use the new imported name
                        );
                        importReplaced = true;
                        return newSpecifier;
                    }
                }
                return specifier;
            });
        }
    });
    return importReplaced ? newAST : null;
}
/**
 * Apply multiple named import replacements to handle multiple corrections in the same statement
 */
function applyMultipleNamedImportReplacements(ast, replacementsByImport) {
    var anyReplaced = false;
    // Create a copy of the AST to avoid mutating the original
    var newAST = t.cloneNode(ast, true, true);
    // Traverse the AST to find and replace imports
    t.traverseFast(newAST, function (node) {
        var _a;
        if (t.isImportDeclaration(node)) {
            var moduleSpecifier = node.source.value;
            var line = ((_a = node.loc) === null || _a === void 0 ? void 0 : _a.start.line) || 1; // Default to 1 if no location
            var key = "".concat(moduleSpecifier, ":").concat(line);
            var replacements_1 = replacementsByImport.get(key);
            if (replacements_1) {
                // Apply all replacements for this import
                node.specifiers = node.specifiers.map(function (specifier) {
                    if (t.isImportSpecifier(specifier)) {
                        var importedName = t.isIdentifier(specifier.imported)
                            ? specifier.imported.name
                            : specifier.imported.value;
                        var newName = replacements_1.get(importedName);
                        if (newName) {
                            // Replace with the new import name
                            var newSpecifier = t.importSpecifier(specifier.local, // Keep the same local name
                            t.identifier(newName) // Use the new imported name
                            );
                            anyReplaced = true;
                            return newSpecifier;
                        }
                    }
                    return specifier;
                });
            }
        }
    });
    return anyReplaced ? newAST : null;
}
