"use strict";
/**
 * TS2307: Cannot find module fixer
 * Handles missing module imports by either finding existing files or creating stubs
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
exports.fixModuleNotFound = fixModuleNotFound;
var t = require("@babel/types");
var ast_1 = require("../utils/ast");
var imports_1 = require("../utils/imports");
var paths_1 = require("../utils/paths");
var stubs_1 = require("../utils/stubs");
var logger_1 = require("../../../logger");
var modules_1 = require("../utils/modules");
var helpers_1 = require("../utils/helpers");
var logger = (0, logger_1.createObjectLogger)({ name: 'TS2307Fixer' }, 'TS2307Fixer');
/**
 * Fix TS2307 "Cannot find module" errors
 * Preserves exact logic from working ImportExportFixer.fixModuleNotFound
 */
function fixModuleNotFound(context, issues) {
    return __awaiter(this, void 0, void 0, function () {
        var fixedIssues, unfixableIssues, modifiedFiles, newFiles, fetchedFiles, _i, issues_1, issue, ast, importInfo, moduleSpecifier, foundFile, relativeImport, updatedAST, generatedCode, targetFilePath, stubContent, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger.info("Starting TS2307 fixer with ".concat(issues.length, " issues"));
                    fixedIssues = [];
                    unfixableIssues = [];
                    modifiedFiles = [];
                    newFiles = [];
                    fetchedFiles = new Set(context.fetchedFiles);
                    _i = 0, issues_1 = issues;
                    _a.label = 1;
                case 1:
                    if (!(_i < issues_1.length)) return [3 /*break*/, 10];
                    issue = issues_1[_i];
                    logger.info("Processing TS2307 issue: ".concat(issue.message, " at ").concat(issue.filePath, ":").concat(issue.line));
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 8, , 9]);
                    logger.info("Getting AST for file: ".concat(issue.filePath));
                    return [4 /*yield*/, (0, imports_1.getFileAST)(issue.filePath, context.files, context.fileFetcher, fetchedFiles)];
                case 3:
                    ast = _a.sent();
                    if (!ast) {
                        logger.warn("Failed to get AST for ".concat(issue.filePath));
                        unfixableIssues.push({
                            issueCode: 'TS2307',
                            filePath: issue.filePath,
                            line: issue.line,
                            column: issue.column,
                            originalMessage: issue.message,
                            reason: 'Failed to parse file AST'
                        });
                        return [3 /*break*/, 9];
                    }
                    logger.info("Finding import at line ".concat(issue.line, " in ").concat(issue.filePath));
                    importInfo = (0, imports_1.findImportAtLocation)(ast, issue.line);
                    if (!importInfo) {
                        logger.warn("No import found at line ".concat(issue.line, " in ").concat(issue.filePath));
                        unfixableIssues.push({
                            issueCode: 'TS2307',
                            filePath: issue.filePath,
                            line: issue.line,
                            column: issue.column,
                            originalMessage: issue.message,
                            reason: 'No import found at specified location'
                        });
                        return [3 /*break*/, 9];
                    }
                    logger.info("Found import: ".concat(importInfo.moduleSpecifier, ", default: ").concat(importInfo.defaultImport, ", named: [").concat(importInfo.namedImports.join(', '), "]"));
                    moduleSpecifier = importInfo.moduleSpecifier;
                    importInfo.filePath = issue.filePath; // Set the file path for usage analysis
                    // Skip external packages - only handle local modules
                    logger.info("Checking if \"".concat(moduleSpecifier, "\" is external package"));
                    if ((0, modules_1.isExternalModule)(moduleSpecifier)) {
                        logger.info("Skipping external package: ".concat(moduleSpecifier));
                        unfixableIssues.push((0, helpers_1.createExternalModuleError)(issue, moduleSpecifier));
                        return [3 /*break*/, 9];
                    }
                    logger.info("Searching for local module file: ".concat(moduleSpecifier));
                    return [4 /*yield*/, (0, paths_1.findModuleFile)(moduleSpecifier, issue.filePath, context.files, context.fileFetcher, fetchedFiles)];
                case 4:
                    foundFile = _a.sent();
                    logger.info("Module file search result: ".concat(foundFile || 'NOT FOUND'));
                    if (!foundFile) return [3 /*break*/, 5];
                    logger.info("Found existing file, fixing import path from \"".concat(moduleSpecifier, "\" to \"").concat(foundFile, "\""));
                    relativeImport = (0, paths_1.makeRelativeImport)(issue.filePath, foundFile);
                    logger.info("Generated relative import path: \"".concat(relativeImport, "\""));
                    logger.info("Updating AST for import path change");
                    updatedAST = updateImportPath(ast, importInfo, relativeImport);
                    generatedCode = (0, ast_1.generateCode)(updatedAST);
                    logger.info("Generated updated code (".concat(generatedCode.code.length, " characters)"));
                    modifiedFiles.push({
                        filePath: issue.filePath,
                        fileContents: generatedCode.code,
                        filePurpose: "Fixed import path in ".concat(issue.filePath),
                    });
                    fixedIssues.push({
                        issueCode: 'TS2307',
                        filePath: issue.filePath,
                        line: issue.line,
                        column: issue.column,
                        originalMessage: issue.message,
                        fixApplied: "Updated import path from \"".concat(moduleSpecifier, "\" to \"").concat(relativeImport, "\""),
                        fixType: 'import_fix',
                    });
                    logger.info("Successfully fixed import path for ".concat(issue.filePath));
                    return [3 /*break*/, 7];
                case 5:
                    logger.info("No existing file found, creating stub file for \"".concat(moduleSpecifier, "\""));
                    targetFilePath = (0, paths_1.resolveImportToFilePath)(moduleSpecifier, issue.filePath);
                    logger.info("Resolved stub file path: \"".concat(targetFilePath, "\""));
                    logger.info("Generating stub content for import: ".concat(importInfo.defaultImport ? 'default: ' + importInfo.defaultImport + ', ' : '', "named: [").concat(importInfo.namedImports.join(', '), "]"));
                    return [4 /*yield*/, (0, stubs_1.generateStubFileContent)(importInfo, context.files, context.fileFetcher, fetchedFiles)];
                case 6:
                    stubContent = _a.sent();
                    logger.info("Generated stub content (".concat(stubContent.length, " characters)"));
                    newFiles.push({
                        filePath: targetFilePath,
                        fileContents: stubContent,
                        filePurpose: "Generated stub file for ".concat(moduleSpecifier),
                    });
                    fixedIssues.push({
                        issueCode: 'TS2307',
                        filePath: issue.filePath,
                        line: issue.line,
                        column: issue.column,
                        originalMessage: issue.message,
                        fixApplied: "Created stub file \"".concat(targetFilePath, "\" with required exports"),
                        fixType: 'stub_creation',
                    });
                    logger.info("Successfully created stub file: \"".concat(targetFilePath, "\""));
                    _a.label = 7;
                case 7: return [3 /*break*/, 9];
                case 8:
                    error_1 = _a.sent();
                    logger.error("Failed to fix TS2307 issue at ".concat(issue.filePath, ":").concat(issue.line, ": ").concat(error_1 instanceof Error ? error_1.message : 'Unknown error'), error_1);
                    unfixableIssues.push((0, helpers_1.handleFixerError)(issue, error_1, 'TS2307Fixer'));
                    return [3 /*break*/, 9];
                case 9:
                    _i++;
                    return [3 /*break*/, 1];
                case 10:
                    logger.info("TS2307 fixer completed: ".concat(fixedIssues.length, " fixed, ").concat(unfixableIssues.length, " unfixable, ").concat(modifiedFiles.length, " modified files, ").concat(newFiles.length, " new files"));
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
 * Update import path in AST by modifying the source value
 * Helper function to modify import statements
 */
function updateImportPath(ast, importInfo, newPath) {
    var _a, _b;
    var body = (_b = (_a = ast.program) === null || _a === void 0 ? void 0 : _a.body) !== null && _b !== void 0 ? _b : [];
    for (var _i = 0, body_1 = body; _i < body_1.length; _i++) {
        var node = body_1[_i];
        if (t.isImportDeclaration(node) && t.isStringLiteral(node.source) && node.source.value === importInfo.specifier) {
            node.source.value = newPath;
        }
    }
    return ast;
}
