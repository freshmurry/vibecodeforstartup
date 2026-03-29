"use strict";
/**
 * TS2613: Module is not a module fixer
 * Handles import/export mismatches by converting between default and named imports
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
exports.fixModuleIsNotModule = fixModuleIsNotModule;
var ast_1 = require("../utils/ast");
var imports_1 = require("../utils/imports");
var t = require("@babel/types");
var ast_2 = require("../utils/ast");
var paths_1 = require("../utils/paths");
var logger_1 = require("../../../logger");
var helpers_1 = require("../utils/helpers");
var logger = (0, logger_1.createObjectLogger)({ name: 'TS2613Fixer' }, 'TS2613Fixer');
/**
 * Fix TS2613 "Module is not a module" errors
 * Preserves exact logic from working ImportExportFixer.fixModuleIsNotModule
 */
function fixModuleIsNotModule(context, issues) {
    return __awaiter(this, void 0, void 0, function () {
        var fixedIssues, unfixableIssues, modifiedFiles, newFiles, fetchedFiles, _i, issues_1, issue, ast, importInfo, namespaceImport, moduleSpecifier, targetFile, targetAST, exports_1, fixed, changes, result, result, generatedCode, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger.info("Starting TS2613 fixer with ".concat(issues.length, " issues"));
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
                    logger.info("Processing TS2613 issue: ".concat(issue.message, " at ").concat(issue.filePath, ":").concat(issue.line));
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 6, , 7]);
                    logger.info("Getting AST for file: ".concat(issue.filePath));
                    return [4 /*yield*/, (0, imports_1.getFileAST)(issue.filePath, context.files, context.fileFetcher, fetchedFiles)];
                case 3:
                    ast = _a.sent();
                    if (!ast) {
                        logger.warn("Failed to get AST for ".concat(issue.filePath));
                        unfixableIssues.push({
                            issueCode: 'TS2613',
                            filePath: issue.filePath,
                            line: issue.line,
                            column: issue.column,
                            originalMessage: issue.message,
                            reason: 'Failed to parse file AST'
                        });
                        return [3 /*break*/, 7];
                    }
                    logger.info("Finding import at line ".concat(issue.line, " in ").concat(issue.filePath));
                    importInfo = (0, imports_1.findImportAtLocation)(ast, issue.line);
                    namespaceImport = findNamespaceImportAtLocation(ast, issue.line);
                    if (!importInfo && !namespaceImport) {
                        logger.warn("No import found at line ".concat(issue.line, " in ").concat(issue.filePath));
                        unfixableIssues.push({
                            issueCode: 'TS2613',
                            filePath: issue.filePath,
                            line: issue.line,
                            column: issue.column,
                            originalMessage: issue.message,
                            reason: 'No import found at specified location'
                        });
                        return [3 /*break*/, 7];
                    }
                    logger.info("Found import: ".concat(importInfo ? importInfo.moduleSpecifier : (namespaceImport === null || namespaceImport === void 0 ? void 0 : namespaceImport.moduleSpecifier) || 'unknown', ", default: ").concat(importInfo ? importInfo.defaultImport : 'none', ", named: [").concat(importInfo ? importInfo.namedImports.join(', ') : 'none', "]"));
                    moduleSpecifier = importInfo ? importInfo.moduleSpecifier : ((namespaceImport === null || namespaceImport === void 0 ? void 0 : namespaceImport.moduleSpecifier) || '');
                    logger.info("Searching for target file: ".concat(moduleSpecifier));
                    return [4 /*yield*/, (0, paths_1.findModuleFile)(moduleSpecifier, issue.filePath, context.files, context.fileFetcher, fetchedFiles)];
                case 4:
                    targetFile = _a.sent();
                    if (!targetFile) {
                        logger.warn("Target file not found for module: ".concat(moduleSpecifier));
                        unfixableIssues.push({
                            issueCode: 'TS2613',
                            filePath: issue.filePath,
                            line: issue.line,
                            column: issue.column,
                            originalMessage: issue.message,
                            reason: "Target file not found for module: ".concat(moduleSpecifier)
                        });
                        return [3 /*break*/, 7];
                    }
                    logger.info("Found target file: ".concat(targetFile));
                    logger.info("Getting AST for target file: ".concat(targetFile));
                    logger.info("Files in context: ".concat(Array.from(context.files.keys()).join(', ')));
                    logger.info("FetchedFiles: ".concat(Array.from(fetchedFiles).join(', ')));
                    logger.info("FileFetcher available: ".concat(!!context.fileFetcher));
                    return [4 /*yield*/, (0, imports_1.getFileAST)(targetFile, context.files, context.fileFetcher, fetchedFiles)];
                case 5:
                    targetAST = _a.sent();
                    logger.info("getFileAST result for ".concat(targetFile, ": ").concat(!!targetAST));
                    if (!targetAST) {
                        logger.warn("Failed to parse target file: ".concat(targetFile));
                        unfixableIssues.push({
                            issueCode: 'TS2613',
                            filePath: issue.filePath,
                            line: issue.line,
                            column: issue.column,
                            originalMessage: issue.message,
                            reason: "Failed to parse target file: ".concat(targetFile)
                        });
                        return [3 /*break*/, 7];
                    }
                    logger.info("Analyzing exports in target file: ".concat(targetFile));
                    exports_1 = (0, imports_1.getFileExports)(targetAST);
                    exports_1.filePath = targetFile;
                    logger.info("Found exports - defaultExport: ".concat(exports_1.defaultExport || 'none', ", named: [").concat(exports_1.namedExports.join(', '), "]"));
                    // Fix import/export mismatches using AST manipulation
                    logger.info("Attempting to fix import/export mismatch for \"".concat(moduleSpecifier, "\""));
                    fixed = false;
                    changes = [];
                    if (namespaceImport) {
                        result = fixNamespaceImportMismatch(ast, namespaceImport, exports_1);
                        fixed = result.fixed;
                        changes = result.changes;
                    }
                    else if (importInfo) {
                        result = (0, imports_1.fixImportExportMismatch)(ast, moduleSpecifier, exports_1);
                        fixed = result.fixed;
                        changes = result.changes;
                    }
                    logger.info("Mismatch fix result: fixed=".concat(fixed, ", changes: [").concat(changes.join(', '), "]"));
                    if (fixed) {
                        logger.info("Generating updated code for ".concat(issue.filePath));
                        generatedCode = (0, ast_1.generateCode)(ast);
                        logger.info("Generated updated code (".concat(generatedCode.code.length, " characters)"));
                        modifiedFiles.push({
                            filePath: issue.filePath,
                            fileContents: generatedCode.code,
                        });
                        fixedIssues.push({
                            issueCode: 'TS2613',
                            filePath: issue.filePath,
                            line: issue.line,
                            column: issue.column,
                            originalMessage: issue.message,
                            fixApplied: changes.join('. '),
                            fixType: 'export_fix',
                        });
                        logger.info("Successfully fixed TS2613 issue for ".concat(issue.filePath));
                    }
                    else {
                        logger.warn("No suitable fix found for import/export mismatch in ".concat(issue.filePath));
                        unfixableIssues.push({
                            issueCode: 'TS2613',
                            filePath: issue.filePath,
                            line: issue.line,
                            column: issue.column,
                            originalMessage: issue.message,
                            reason: 'No suitable fix found for import/export mismatch'
                        });
                    }
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    logger.error("Failed to fix TS2613 issue at ".concat(issue.filePath, ":").concat(issue.line, ": ").concat(error_1 instanceof Error ? error_1.message : 'Unknown error'), error_1);
                    unfixableIssues.push((0, helpers_1.handleFixerError)(issue, error_1, 'TS2613Fixer'));
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 1];
                case 8:
                    logger.info("TS2613 fixer completed: ".concat(fixedIssues.length, " fixed, ").concat(unfixableIssues.length, " unfixable, ").concat(modifiedFiles.length, " modified files, ").concat(newFiles.length, " new files"));
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
 * Find namespace import at a specific line
 */
function findNamespaceImportAtLocation(ast, line) {
    var _a, _b, _c, _d, _e, _f;
    var result = null;
    var body = (_b = (_a = ast.program) === null || _a === void 0 ? void 0 : _a.body) !== null && _b !== void 0 ? _b : [];
    for (var _i = 0, body_1 = body; _i < body_1.length; _i++) {
        var node = body_1[_i];
        if (t.isImportDeclaration(node)) {
            var startLine = (_d = (_c = node.loc) === null || _c === void 0 ? void 0 : _c.start.line) !== null && _d !== void 0 ? _d : 0;
            var endLine = (_f = (_e = node.loc) === null || _e === void 0 ? void 0 : _e.end.line) !== null && _f !== void 0 ? _f : startLine;
            if (startLine <= line && endLine >= line) {
                // Check for namespace import (* as name)
                var namespaceSpecifier = node.specifiers.find(function (s) { return t.isImportNamespaceSpecifier(s); });
                if (namespaceSpecifier && t.isImportNamespaceSpecifier(namespaceSpecifier)) {
                    result = {
                        namespace: namespaceSpecifier.local.name,
                        moduleSpecifier: t.isStringLiteral(node.source) ? node.source.value : ''
                    };
                    break;
                }
            }
        }
    }
    return result;
}
/**
 * Fix namespace import mismatches
 * Converts namespace imports to appropriate default or named imports
 */
function fixNamespaceImportMismatch(ast, namespaceImport, targetExports) {
    var fixed = false;
    var changes = [];
    (0, ast_2.traverseAST)(ast, {
        ImportDeclaration: function (path) {
            if (t.isStringLiteral(path.node.source) && path.node.source.value === namespaceImport.moduleSpecifier) {
                var hasNamespace = path.node.specifiers.some(function (s) { return t.isImportNamespaceSpecifier(s); });
                if (hasNamespace) {
                    // Determine what to convert to
                    if (targetExports.defaultExport && targetExports.namedExports.length === 0) {
                        // Only default export - convert to default import
                        path.node.specifiers = [
                            t.importDefaultSpecifier(t.identifier(namespaceImport.namespace))
                        ];
                        changes.push("Converted namespace import to default import for \"".concat(namespaceImport.namespace, "\""));
                        fixed = true;
                    }
                    else if (targetExports.defaultExport && targetExports.namedExports.length > 0) {
                        // Mixed exports - keep as namespace but warn
                        changes.push("Module has mixed exports (default and named). Consider using specific imports.");
                        // Optionally convert to: import defaultExport, * as namespace from '...'
                        // But this depends on usage patterns
                    }
                    else if (targetExports.namedExports.length > 0) {
                        // Only named exports - could convert to specific imports if usage is known
                        // For now, keep as namespace but warn
                        changes.push("Module has named exports. Consider importing specific exports instead of namespace.");
                    }
                }
            }
        }
    });
    return { fixed: fixed, changes: changes };
}
