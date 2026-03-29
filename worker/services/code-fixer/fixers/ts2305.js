"use strict";
/**
 * TS2305: Module has no exported member fixer
 * Handles missing named exports by adding stub exports to the target file
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
exports.fixMissingExportedMember = fixMissingExportedMember;
var ast_1 = require("../utils/ast");
var imports_1 = require("../utils/imports");
var logger_1 = require("../../../logger");
var t = require("@babel/types");
var helpers_1 = require("../utils/helpers");
var modules_1 = require("../utils/modules");
var logger = (0, logger_1.createObjectLogger)({ name: 'TS2305Fixer' }, 'TS2305Fixer');
/**
 * Fix TS2305 "Module has no exported member" errors
 * Adds missing exports as stubs to the target file
 */
function fixMissingExportedMember(context, issues) {
    return __awaiter(this, void 0, void 0, function () {
        var logs, fixedIssues, unfixableIssues, modifiedFiles, newFiles, _loop_1, _i, issues_1, issue;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    logs = (0, helpers_1.createFixerLogMessages)('TS2305Fixer', issues.length);
                    logger.info(logs.start);
                    fixedIssues = [];
                    unfixableIssues = [];
                    modifiedFiles = [];
                    newFiles = [];
                    _loop_1 = function (issue) {
                        var moduleSpecifier, filesResult, sourceAST, importInfo, targetFilePath, targetAST, missingExportName_1, existingExports, usageAnalysis, exportUsage, modifiedTargetAST, generatedCode, error_1;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    logger.info(logs.processing(issue));
                                    _c.label = 1;
                                case 1:
                                    _c.trys.push([1, 3, , 4]);
                                    moduleSpecifier = extractModuleSpecifierFromMessage(issue.message);
                                    if (moduleSpecifier && (0, modules_1.isExternalModule)(moduleSpecifier)) {
                                        logger.info("Skipping external module: ".concat(moduleSpecifier));
                                        unfixableIssues.push((0, helpers_1.createExternalModuleError)(issue, moduleSpecifier));
                                        return [2 /*return*/, "continue"];
                                    }
                                    return [4 /*yield*/, (0, helpers_1.getSourceAndTargetFiles)(issue, context)];
                                case 2:
                                    filesResult = _c.sent();
                                    if (!filesResult) {
                                        logger.warn("Failed to get source and target files for ".concat(issue.filePath));
                                        unfixableIssues.push((0, helpers_1.createUnfixableIssue)(issue, 'Could not resolve source file, import location, or target file'));
                                        return [2 /*return*/, "continue"];
                                    }
                                    sourceAST = filesResult.sourceAST, importInfo = filesResult.importInfo, targetFilePath = filesResult.targetFilePath, targetAST = filesResult.targetAST;
                                    logger.info("Found import: ".concat(importInfo.moduleSpecifier, ", named: [").concat(importInfo.namedImports.join(', '), "]"));
                                    logger.info("Found target file: ".concat(targetFilePath));
                                    missingExportName_1 = extractMissingExportName(issue.message, importInfo.namedImports);
                                    if (!missingExportName_1) {
                                        logger.warn("Could not extract missing export name from message: ".concat(issue.message));
                                        unfixableIssues.push((0, helpers_1.createUnfixableIssue)(issue, 'Could not determine missing export name'));
                                        return [2 /*return*/, "continue"];
                                    }
                                    logger.info("Missing export name: ".concat(missingExportName_1));
                                    existingExports = (0, imports_1.getFileExports)(targetAST);
                                    // Check for existing named export
                                    if (existingExports.namedExports.includes(missingExportName_1)) {
                                        logger.info("Named export ".concat(missingExportName_1, " already exists in ").concat(targetFilePath, ", marking as unfixable"));
                                        unfixableIssues.push((0, helpers_1.createUnfixableIssue)(issue, "Named export ".concat(missingExportName_1, " already exists in target file")));
                                        return [2 /*return*/, "continue"];
                                    }
                                    // Check for existing default export with same name
                                    if (existingExports.defaultExport && existingExports.defaultExport === missingExportName_1) {
                                        logger.info("Default export ".concat(missingExportName_1, " already exists in ").concat(targetFilePath, ", marking as unfixable"));
                                        unfixableIssues.push((0, helpers_1.createUnfixableIssue)(issue, "Default export ".concat(missingExportName_1, " already exists in target file")));
                                        return [2 /*return*/, "continue"];
                                    }
                                    // Analyze how the missing export is used to generate appropriate stub
                                    logger.info("Analyzing usage of ".concat(missingExportName_1, " in source file"));
                                    usageAnalysis = (0, imports_1.analyzeImportUsage)(sourceAST, [missingExportName_1]);
                                    exportUsage = usageAnalysis.find(function (usage) { return usage.name === missingExportName_1; });
                                    logger.info("Usage analysis result: ".concat(exportUsage ? exportUsage.type : 'generic'));
                                    modifiedTargetAST = addExportToFile(targetAST, missingExportName_1, exportUsage ? {
                                        name: exportUsage.name,
                                        type: exportUsage.type,
                                        properties: exportUsage.properties,
                                        parameters: ((_a = exportUsage.parameters) === null || _a === void 0 ? void 0 : _a.map(function (p) { return String(p); })) || undefined
                                    } : undefined);
                                    generatedCode = (0, ast_1.generateCode)(modifiedTargetAST);
                                    modifiedFiles.push({
                                        filePath: targetFilePath,
                                        fileContents: generatedCode.code,
                                    });
                                    fixedIssues.push({
                                        issueCode: 'TS2305',
                                        filePath: issue.filePath,
                                        line: issue.line,
                                        column: issue.column,
                                        originalMessage: issue.message,
                                        fixApplied: "Added stub export '".concat(missingExportName_1, "' to ").concat(targetFilePath),
                                        fixType: 'export_fix',
                                    });
                                    logger.info(logs.success(issue));
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_1 = _c.sent();
                                    logger.error("Failed to fix TS2305 issue at ".concat(issue.filePath, ":").concat(issue.line, ": ").concat(error_1 instanceof Error ? error_1.message : 'Unknown error'), error_1);
                                    unfixableIssues.push((0, helpers_1.handleFixerError)(issue, error_1, 'TS2305Fixer'));
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, issues_1 = issues;
                    _b.label = 1;
                case 1:
                    if (!(_i < issues_1.length)) return [3 /*break*/, 4];
                    issue = issues_1[_i];
                    return [5 /*yield**/, _loop_1(issue)];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    logger.info(logs.completed(fixedIssues.length, unfixableIssues.length, modifiedFiles.length, newFiles.length));
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
 * Extract the module specifier from the TypeScript error message
 * Example: "Module './button' has no exported member 'Button'" -> './button'
 */
function extractModuleSpecifierFromMessage(errorMessage) {
    var match = errorMessage.match(/Module ["']([^"']+)["'] has no exported member/);
    return match ? match[1] : null;
}
/**
 * Extract the missing export name from the TypeScript error message
 * Example: "Module './button' has no exported member 'Button'" -> 'Button'
 */
function extractMissingExportName(errorMessage, namedImports) {
    // Try to match the standard TS2305 error message pattern
    var match = errorMessage.match(/has no exported member ["']([^"']+)["']/);
    if (match && match[1]) {
        return match[1];
    }
    // Fallback: if we can't parse the message, assume it's the first named import
    // This handles cases where the error message format might be different
    if (namedImports.length > 0) {
        return namedImports[0];
    }
    return null;
}
/**
 * Add a missing export to the target file AST based on usage analysis
 */
function addExportToFile(ast, exportName, usageAnalysis) {
    var exportDeclaration;
    // Add stub comment to generated exports  
    var stubComment = "This is a **STUB** export for '".concat(exportName, "', please implement it properly");
    if (usageAnalysis) {
        switch (usageAnalysis.type) {
            case 'jsx-component':
                // Generate React component export
                exportDeclaration = createComponentExport(exportName, usageAnalysis.properties || [], stubComment);
                break;
            case 'function-call':
                // Generate function export
                exportDeclaration = createFunctionExport(exportName, usageAnalysis.parameters || [], stubComment);
                break;
            case 'object-access':
                // Generate object export with properties
                exportDeclaration = createObjectExport(exportName, usageAnalysis.properties || [], stubComment);
                break;
            default:
                // Generate generic variable export
                exportDeclaration = createVariableExport(exportName, stubComment);
        }
    }
    else {
        // No usage analysis available, create generic export
        exportDeclaration = createVariableExport(exportName, stubComment);
    }
    // Add the export to the end of the file
    ast.program.body.push(exportDeclaration);
    return ast;
}
/**
 * Create a React component export
 */
function createComponentExport(exportName, props, stubComment) {
    // Create props parameter with TypeScript annotation
    var propsParam = props.length > 0 ?
        t.objectPattern(props.map(function (prop) {
            return t.objectProperty(t.identifier(prop), t.identifier(prop));
        })) :
        t.identifier('props');
    // Add type annotation for props
    if (t.isObjectPattern(propsParam)) {
        var propsType = t.tsTypeLiteral(props.map(function (prop) {
            var signature = t.tsPropertySignature(t.identifier(prop), t.tsTypeAnnotation(t.tsStringKeyword()));
            signature.optional = true;
            return signature;
        }));
        propsParam.typeAnnotation = t.tsTypeAnnotation(propsType);
    }
    var componentBody = t.blockStatement([
        t.returnStatement(t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier('div'), [], false), t.jsxClosingElement(t.jsxIdentifier('div')), [t.jsxText("".concat(stubComment, " - Component: ").concat(exportName))], false))
    ]);
    var componentFunction = t.arrowFunctionExpression([propsParam], componentBody);
    componentFunction.returnType = t.tsTypeAnnotation(t.tsTypeReference(t.identifier('React.ReactElement')));
    var componentDeclaration = t.variableDeclaration('const', [
        t.variableDeclarator(t.identifier(exportName), componentFunction)
    ]);
    return t.exportNamedDeclaration(componentDeclaration);
}
/**
 * Create a function export
 */
function createFunctionExport(exportName, parameters, stubComment) {
    var params = parameters.map(function (_, index) { return t.identifier("arg".concat(index)); });
    var functionBody = t.blockStatement([
        // Add stub comment as comment inside function
        t.expressionStatement(t.callExpression(t.memberExpression(t.identifier('console'), t.identifier('warn')), [t.stringLiteral(stubComment)])),
        t.returnStatement(t.nullLiteral())
    ]);
    var functionDeclaration = t.functionDeclaration(t.identifier(exportName), params, functionBody);
    return t.exportNamedDeclaration(functionDeclaration);
}
/**
 * Create an object export with properties
 */
function createObjectExport(exportName, properties, stubComment) {
    var objectProperties = properties.map(function (prop) {
        return t.objectProperty(t.identifier(prop), t.arrowFunctionExpression([], t.blockStatement([
            t.returnStatement(t.nullLiteral())
        ])));
    });
    var objectExpression = t.objectExpression(objectProperties);
    // Add stub comment property
    objectProperties.unshift(t.objectProperty(t.identifier('_stubComment'), t.stringLiteral(stubComment)));
    return t.exportNamedDeclaration(t.variableDeclaration('const', [
        t.variableDeclarator(t.identifier(exportName), objectExpression)
    ]));
}
/**
 * Create a generic variable export
 */
function createVariableExport(exportName, stubComment) {
    var value = t.objectExpression([
        t.objectProperty(t.identifier('_stubComment'), t.stringLiteral(stubComment)),
        t.objectProperty(t.identifier('_stubFor'), t.stringLiteral(exportName))
    ]);
    var declaration = t.variableDeclaration('const', [
        t.variableDeclarator(t.identifier(exportName), value)
    ]);
    return t.exportNamedDeclaration(declaration);
}
