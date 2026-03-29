"use strict";
/**
 * TS2614: Module has no exported member (import/export mismatch) fixer
 * Handles cases where imports use wrong syntax (named vs default)
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
exports.fixImportExportTypeMismatch = fixImportExportTypeMismatch;
var ast_1 = require("../utils/ast");
var imports_1 = require("../utils/imports");
var paths_1 = require("../utils/paths");
var logger_1 = require("../../../logger");
var t = require("@babel/types");
var helpers_1 = require("../utils/helpers");
var logger = (0, logger_1.createObjectLogger)({ name: 'TS2614Fixer' }, 'TS2614Fixer');
/**
 * Fix TS2614 "Module has no exported member" errors (import/export mismatch)
 * Corrects import statements to match actual export types
 */
function fixImportExportTypeMismatch(context, issues) {
    return __awaiter(this, void 0, void 0, function () {
        var fixedIssues, unfixableIssues, modifiedFiles, newFiles, fetchedFiles, _i, issues_1, issue, sourceAST, importInfo, targetFile, targetAST, targetExports, mismatchAnalysis, fixedAST, generatedCode, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger.info("Starting TS2614 fixer with ".concat(issues.length, " issues"));
                    fixedIssues = [];
                    unfixableIssues = [];
                    modifiedFiles = [];
                    newFiles = [];
                    fetchedFiles = new Set(context.fetchedFiles);
                    _i = 0, issues_1 = issues;
                    _a.label = 1;
                case 1:
                    if (!(_i < issues_1.length)) return [3 /*break*/, 8];
                    issue = issues_1[_i];
                    logger.info("Processing TS2614 issue: ".concat(issue.message, " at ").concat(issue.filePath, ":").concat(issue.line));
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 6, , 7]);
                    // Get AST for the file with the import issue
                    logger.info("Getting AST for source file: ".concat(issue.filePath));
                    return [4 /*yield*/, (0, imports_1.getFileAST)(issue.filePath, context.files, context.fileFetcher, fetchedFiles)];
                case 3:
                    sourceAST = _a.sent();
                    if (!sourceAST) {
                        logger.warn("Failed to get AST for ".concat(issue.filePath));
                        unfixableIssues.push({
                            issueCode: 'TS2614',
                            filePath: issue.filePath,
                            line: issue.line,
                            column: issue.column,
                            originalMessage: issue.message,
                            reason: 'Failed to parse source file AST'
                        });
                        return [3 /*break*/, 7];
                    }
                    // Find the import at the error location
                    logger.info("Finding import at line ".concat(issue.line, " in ").concat(issue.filePath));
                    importInfo = (0, imports_1.findImportAtLocation)(sourceAST, issue.line);
                    if (!importInfo) {
                        logger.warn("No import found at line ".concat(issue.line, " in ").concat(issue.filePath));
                        unfixableIssues.push({
                            issueCode: 'TS2614',
                            filePath: issue.filePath,
                            line: issue.line,
                            column: issue.column,
                            originalMessage: issue.message,
                            reason: 'No import found at specified location'
                        });
                        return [3 /*break*/, 7];
                    }
                    logger.info("Found import: ".concat(importInfo.moduleSpecifier, ", default: ").concat(importInfo.defaultImport, ", named: [").concat(importInfo.namedImports.join(', '), "]"));
                    // Find the target file
                    logger.info("Searching for target file: ".concat(importInfo.moduleSpecifier));
                    return [4 /*yield*/, (0, paths_1.findModuleFile)(importInfo.moduleSpecifier, issue.filePath, context.files, context.fileFetcher, fetchedFiles)];
                case 4:
                    targetFile = _a.sent();
                    if (!targetFile) {
                        logger.warn("Target file not found for module: ".concat(importInfo.moduleSpecifier));
                        unfixableIssues.push({
                            issueCode: 'TS2614',
                            filePath: issue.filePath,
                            line: issue.line,
                            column: issue.column,
                            originalMessage: issue.message,
                            reason: "Target file not found for module: ".concat(importInfo.moduleSpecifier)
                        });
                        return [3 /*break*/, 7];
                    }
                    logger.info("Found target file: ".concat(targetFile));
                    // Get AST for target file to analyze actual exports
                    logger.info("Getting AST for target file: ".concat(targetFile));
                    return [4 /*yield*/, (0, imports_1.getFileAST)(targetFile, context.files, context.fileFetcher, fetchedFiles)];
                case 5:
                    targetAST = _a.sent();
                    if (!targetAST) {
                        logger.warn("Failed to parse target file: ".concat(targetFile));
                        unfixableIssues.push({
                            issueCode: 'TS2614',
                            filePath: issue.filePath,
                            line: issue.line,
                            column: issue.column,
                            originalMessage: issue.message,
                            reason: "Failed to parse target file: ".concat(targetFile)
                        });
                        return [3 /*break*/, 7];
                    }
                    // Analyze target file's exports
                    logger.info("Analyzing exports in target file: ".concat(targetFile));
                    targetExports = (0, imports_1.getFileExports)(targetAST);
                    logger.info("Found exports - defaultExport: ".concat(targetExports.defaultExport || 'none', ", named: [").concat(targetExports.namedExports.join(', '), "]"));
                    mismatchAnalysis = analyzeMismatch(importInfo, targetExports);
                    if (!mismatchAnalysis) {
                        logger.warn("Could not determine mismatch type for ".concat(importInfo.moduleSpecifier));
                        unfixableIssues.push({
                            issueCode: 'TS2614',
                            filePath: issue.filePath,
                            line: issue.line,
                            column: issue.column,
                            originalMessage: issue.message,
                            reason: 'Could not determine import/export mismatch type'
                        });
                        return [3 /*break*/, 7];
                    }
                    logger.info("Mismatch analysis: ".concat(mismatchAnalysis.type, " - ").concat(mismatchAnalysis.description));
                    fixedAST = fixImportStatement(sourceAST, importInfo, mismatchAnalysis);
                    generatedCode = (0, ast_1.generateCode)(fixedAST);
                    modifiedFiles.push({
                        filePath: issue.filePath,
                        fileContents: generatedCode.code,
                    });
                    fixedIssues.push({
                        issueCode: 'TS2614',
                        filePath: issue.filePath,
                        line: issue.line,
                        column: issue.column,
                        originalMessage: issue.message,
                        fixApplied: mismatchAnalysis.description,
                        fixType: 'import_fix',
                    });
                    logger.info("Successfully fixed import/export mismatch in ".concat(issue.filePath));
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    logger.error("Failed to fix TS2614 issue at ".concat(issue.filePath, ":").concat(issue.line, ": ").concat(error_1 instanceof Error ? error_1.message : 'Unknown error'), error_1);
                    unfixableIssues.push((0, helpers_1.handleFixerError)(issue, error_1, 'TS2614Fixer'));
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 1];
                case 8:
                    logger.info("TS2614 fixer completed: ".concat(fixedIssues.length, " fixed, ").concat(unfixableIssues.length, " unfixable, ").concat(modifiedFiles.length, " modified files, ").concat(newFiles.length, " new files"));
                    return [2 /*return*/, {
                            fixedIssues: fixedIssues,
                            unfixableIssues: unfixableIssues,
                            modifiedFiles: modifiedFiles,
                            newFiles: newFiles
                        }];
            }
        });
    });
}
/**
 * Calculate Levenshtein distance between two strings
 * Used for detecting typos in import names
 */
function levenshteinDistance(str1, str2) {
    var matrix = [];
    for (var i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    for (var j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    for (var i = 1; i <= str2.length; i++) {
        for (var j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            }
            else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                matrix[i][j - 1] + 1, // insertion
                matrix[i - 1][j] + 1 // deletion
                );
            }
        }
    }
    return matrix[str2.length][str1.length];
}
/**
 * Analyze import/export mismatch and determine fix strategy
 * Enhanced to handle complex partial matches
 */
function analyzeMismatch(importInfo, targetExports) {
    // Case 1: Trying to import something as named when it's actually default export
    if (importInfo.namedImports.length > 0 && !importInfo.defaultImport && targetExports.defaultExport) {
        // Check if any named import matches the default export name
        var matchingNamedImport = importInfo.namedImports.find(function (name) {
            var _a;
            return name === targetExports.defaultExport ||
                name.toLowerCase() === ((_a = targetExports.defaultExport) === null || _a === void 0 ? void 0 : _a.toLowerCase());
        });
        if (matchingNamedImport) {
            return {
                type: 'named-to-default',
                description: "Changed import from named '".concat(matchingNamedImport, "' to default import"),
                targetName: matchingNamedImport
            };
        }
    }
    // Case 2: Trying to import as default when it's actually a named export
    if (importInfo.defaultImport && !targetExports.defaultExport && targetExports.namedExports.length > 0) {
        // Check if the default import name matches any named export
        var matchingNamedExport = targetExports.namedExports.find(function (name) {
            var _a;
            return name === importInfo.defaultImport ||
                name.toLowerCase() === ((_a = importInfo.defaultImport) === null || _a === void 0 ? void 0 : _a.toLowerCase());
        });
        if (matchingNamedExport) {
            return {
                type: 'default-to-named',
                description: "Changed import from default '".concat(importInfo.defaultImport, "' to named import '").concat(matchingNamedExport, "'"),
                targetName: matchingNamedExport
            };
        }
    }
    // Case 3: Mixed imports - some correct, some need conversion
    if (importInfo.namedImports.length > 0) {
        var validNamedImports = importInfo.namedImports.filter(function (name) {
            return targetExports.namedExports.includes(name);
        });
        var invalidNamedImports = importInfo.namedImports.filter(function (name) {
            return !targetExports.namedExports.includes(name);
        });
        // Check if any invalid named imports match the default export
        var needsDefaultConversion = invalidNamedImports.filter(function (name) {
            var _a;
            return targetExports.defaultExport && (name === targetExports.defaultExport ||
                name.toLowerCase() === ((_a = targetExports.defaultExport) === null || _a === void 0 ? void 0 : _a.toLowerCase()));
        });
        // Check if any invalid named imports have similar names in exports (typos)
        var possibleTypos = invalidNamedImports.map(function (invalidName) {
            var similar = targetExports.namedExports.find(function (exportName) {
                var distance = levenshteinDistance(invalidName.toLowerCase(), exportName.toLowerCase());
                return distance <= 2; // Allow up to 2 character differences
            });
            return similar ? { invalid: invalidName, correct: similar } : null;
        }).filter(Boolean);
        if (needsDefaultConversion.length > 0 || validNamedImports.length > 0 || possibleTypos.length > 0) {
            return {
                type: 'complex-partial',
                description: "Complex import fix: ".concat(needsDefaultConversion.length, " to default, ").concat(validNamedImports.length, " valid named, ").concat(possibleTypos.length, " typo fixes"),
                targetName: needsDefaultConversion[0], // Primary default conversion
                sourceNames: validNamedImports,
                additionalData: {
                    defaultConversions: needsDefaultConversion,
                    typoCorrections: possibleTypos
                }
            };
        }
    }
    // Case 4: Check if default import matches a named export (opposite of case 1)
    if (importInfo.defaultImport && targetExports.namedExports.length > 0) {
        var matchingNamedExport = targetExports.namedExports.find(function (name) {
            var _a;
            return name === importInfo.defaultImport ||
                name.toLowerCase() === ((_a = importInfo.defaultImport) === null || _a === void 0 ? void 0 : _a.toLowerCase());
        });
        if (matchingNamedExport) {
            return {
                type: 'default-to-named',
                description: "Changed import from default '".concat(importInfo.defaultImport, "' to named import '").concat(matchingNamedExport, "'"),
                targetName: matchingNamedExport
            };
        }
        // Check if default import name is close to any named export (typo)
        var similarNamed = targetExports.namedExports.find(function (name) {
            var distance = levenshteinDistance(importInfo.defaultImport.toLowerCase(), name.toLowerCase());
            return distance <= 2;
        });
        if (similarNamed) {
            return {
                type: 'default-to-named-typo',
                description: "Changed default import '".concat(importInfo.defaultImport, "' to named import '").concat(similarNamed, "' (possible typo)"),
                targetName: similarNamed
            };
        }
    }
    return null;
}
/**
 * Fix the import statement based on mismatch analysis
 */
function fixImportStatement(ast, importInfo, mismatchAnalysis) {
    (0, ast_1.traverseAST)(ast, {
        ImportDeclaration: function (path) {
            if (t.isStringLiteral(path.node.source) && path.node.source.value === importInfo.moduleSpecifier) {
                switch (mismatchAnalysis.type) {
                    case 'named-to-default':
                        // Convert named import to default import
                        if (mismatchAnalysis.targetName) {
                            // Find the original specifier to preserve local alias if any
                            var orig = path.node.specifiers.find(function (s) {
                                return t.isImportSpecifier(s) &&
                                    t.isIdentifier(s.imported) &&
                                    s.imported.name === mismatchAnalysis.targetName;
                            });
                            var localName = orig && t.isIdentifier(orig.local) ? orig.local.name : mismatchAnalysis.targetName;
                            path.node.specifiers = [
                                t.importDefaultSpecifier(t.identifier(localName))
                            ];
                        }
                        break;
                    case 'default-to-named':
                        // Convert default import to named import
                        if (mismatchAnalysis.targetName && importInfo.defaultImport) {
                            path.node.specifiers = [
                                t.importSpecifier(t.identifier(importInfo.defaultImport), t.identifier(mismatchAnalysis.targetName))
                            ];
                        }
                        break;
                    case 'partial-match':
                    case 'complex-partial':
                        // Handle complex partial matches with multiple conversions
                        if (mismatchAnalysis.additionalData) {
                            var newSpecifiers = [];
                            var specifiers = path.node.specifiers;
                            // Add default import for names that need conversion to default
                            var defaultConversions = mismatchAnalysis.additionalData.defaultConversions || [];
                            if (defaultConversions.length > 0) {
                                var firstDefault_1 = defaultConversions[0];
                                var defaultSpec = specifiers.find(function (s) {
                                    return t.isImportSpecifier(s) &&
                                        t.isIdentifier(s.imported) &&
                                        s.imported.name === firstDefault_1;
                                });
                                var defaultLocal = defaultSpec && t.isIdentifier(defaultSpec.local) ? defaultSpec.local.name : firstDefault_1;
                                newSpecifiers.push(t.importDefaultSpecifier(t.identifier(defaultLocal)));
                            }
                            // Keep valid named imports
                            if (mismatchAnalysis.sourceNames) {
                                var _loop_1 = function (validName) {
                                    var orig = specifiers.find(function (s) {
                                        return t.isImportSpecifier(s) &&
                                            t.isIdentifier(s.imported) &&
                                            s.imported.name === validName;
                                    });
                                    var local = orig && t.isIdentifier(orig.local) ? orig.local.name : validName;
                                    newSpecifiers.push(t.importSpecifier(t.identifier(local), t.identifier(validName)));
                                };
                                for (var _i = 0, _a = mismatchAnalysis.sourceNames; _i < _a.length; _i++) {
                                    var validName = _a[_i];
                                    _loop_1(validName);
                                }
                            }
                            // Fix typos in named imports
                            var typoCorrections = mismatchAnalysis.additionalData.typoCorrections || [];
                            var _loop_2 = function (correction) {
                                if (correction) {
                                    var orig = specifiers.find(function (s) {
                                        return t.isImportSpecifier(s) &&
                                            t.isIdentifier(s.imported) &&
                                            s.imported.name === correction.invalid;
                                    });
                                    var local = orig && t.isIdentifier(orig.local) ? orig.local.name : correction.correct;
                                    newSpecifiers.push(t.importSpecifier(t.identifier(local), t.identifier(correction.correct)));
                                }
                            };
                            for (var _b = 0, typoCorrections_1 = typoCorrections; _b < typoCorrections_1.length; _b++) {
                                var correction = typoCorrections_1[_b];
                                _loop_2(correction);
                            }
                            path.node.specifiers = newSpecifiers;
                        }
                        else if (mismatchAnalysis.targetName && mismatchAnalysis.sourceNames) {
                            // Fallback to simple partial match handling
                            var newSpecifiers = [];
                            var specifiers = path.node.specifiers;
                            // Add default import for the converted name
                            var invalidSpec = specifiers.find(function (s) {
                                return t.isImportSpecifier(s) &&
                                    t.isIdentifier(s.imported) &&
                                    s.imported.name === mismatchAnalysis.targetName;
                            });
                            var defaultLocal = invalidSpec && t.isIdentifier(invalidSpec.local) ? invalidSpec.local.name : mismatchAnalysis.targetName;
                            newSpecifiers.push(t.importDefaultSpecifier(t.identifier(defaultLocal)));
                            var _loop_3 = function (validName) {
                                var orig = specifiers.find(function (s) {
                                    return t.isImportSpecifier(s) &&
                                        t.isIdentifier(s.imported) &&
                                        s.imported.name === validName;
                                });
                                var local = orig && t.isIdentifier(orig.local) ? orig.local.name : validName;
                                newSpecifiers.push(t.importSpecifier(t.identifier(local), t.identifier(validName)));
                            };
                            // Keep valid named imports
                            for (var _c = 0, _d = mismatchAnalysis.sourceNames; _c < _d.length; _c++) {
                                var validName = _d[_c];
                                _loop_3(validName);
                            }
                            path.node.specifiers = newSpecifiers;
                        }
                        break;
                    case 'default-to-named-typo':
                        // Convert default import to named import with typo correction
                        if (mismatchAnalysis.targetName && importInfo.defaultImport) {
                            path.node.specifiers = [
                                t.importSpecifier(t.identifier(importInfo.defaultImport), t.identifier(mismatchAnalysis.targetName))
                            ];
                        }
                        break;
                }
            }
        }
    });
    return ast;
}
