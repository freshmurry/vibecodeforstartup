"use strict";
/**
 * Stub generation utilities using Babel AST construction
 * Extracted from working ImportExportAnalyzer to preserve exact functionality
 * Uses AST-based generation, not string templates, as requested
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
exports.analyzeImportUsageForStub = analyzeImportUsageForStub;
exports.generateStubFileAST = generateStubFileAST;
exports.generateStubFileContent = generateStubFileContent;
exports.getStubFileExtension = getStubFileExtension;
exports.stubNeedsReactImport = stubNeedsReactImport;
exports.validateStubContent = validateStubContent;
var t = require("@babel/types");
var ast_1 = require("./ast");
var imports_1 = require("./imports");
// ============================================================================
// USAGE ANALYSIS FOR STUB GENERATION
// ============================================================================
/**
 * Analyze how imports are used to generate appropriate stubs
 * Preserves exact logic from working implementation
 */
function analyzeImportUsageForStub(importInfo, files, fileFetcher, fetchedFiles) {
    return __awaiter(this, void 0, void 0, function () {
        var sourceAST, importNames;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, imports_1.getFileAST)(importInfo.filePath, files, fileFetcher, fetchedFiles)];
                case 1:
                    sourceAST = _a.sent();
                    if (!sourceAST)
                        return [2 /*return*/, []];
                    importNames = __spreadArray(__spreadArray([], (importInfo.defaultImport ? [importInfo.defaultImport] : []), true), importInfo.namedImports, true);
                    return [2 /*return*/, (0, imports_1.analyzeImportUsage)(sourceAST, importNames)];
            }
        });
    });
}
// ============================================================================
// AST-BASED STUB GENERATION
// ============================================================================
/**
 * Generate stub file AST based on import information and usage analysis
 * Preserves exact logic from working buildStubAST method
 */
function generateStubFileAST(importInfo, usages) {
    var statements = [];
    var shouldUseJSX = (0, ast_1.shouldUseJSXExtension)(usages);
    // Add React import if JSX is used
    if (shouldUseJSX) {
        // Import React for JSX and types
        statements.push(t.importDeclaration([
            t.importDefaultSpecifier(t.identifier('React'))
        ], t.stringLiteral('react')));
    }
    // Add stub warning comment - we'll prepend it to the generated code as a string
    // For now, we'll handle this in the code generation step
    // Generate exports based on usage analysis
    for (var _i = 0, usages_1 = usages; _i < usages_1.length; _i++) {
        var usage = usages_1[_i];
        var exportStatement = generateExportForUsage(usage, shouldUseJSX);
        if (exportStatement) {
            statements.push(exportStatement);
        }
    }
    // Generate fallback exports for imports without detected usage
    var usedNames = new Set(usages.map(function (u) { return u.name; }));
    // Default export fallback
    if (importInfo.defaultImport && !usedNames.has(importInfo.defaultImport)) {
        statements.push(generateGenericExport(importInfo.defaultImport, true, shouldUseJSX));
    }
    // Named exports fallback
    for (var _a = 0, _b = importInfo.namedImports; _a < _b.length; _a++) {
        var namedImport = _b[_a];
        if (!usedNames.has(namedImport)) {
            statements.push(generateGenericExport(namedImport, false, shouldUseJSX));
        }
    }
    return (0, ast_1.createFileAST)(statements);
}
/**
 * Generate stub file content as a string
 */
function generateStubFileContent(importInfo, files, fileFetcher, fetchedFiles) {
    return __awaiter(this, void 0, void 0, function () {
        var usageAnalysis, stubAST, generated, stubComment;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, analyzeImportUsageForStub(importInfo, files, fileFetcher, fetchedFiles)];
                case 1:
                    usageAnalysis = _a.sent();
                    stubAST = generateStubFileAST(importInfo, usageAnalysis);
                    generated = (0, ast_1.generateCode)(stubAST);
                    stubComment = '// This is a **STUB** file, please properly implement it or fix its usage\n\n';
                    return [2 /*return*/, stubComment + generated.code];
            }
        });
    });
}
// ============================================================================
// EXPORT GENERATION BY USAGE TYPE
// ============================================================================
/**
 * Generate export statement based on usage analysis
 * Preserves exact logic from working implementation
 */
function generateExportForUsage(usage, shouldUseJSX) {
    switch (usage.type) {
        case 'jsx-component':
            return generateJSXComponentExport(usage);
        case 'function-call':
            return generateFunctionExport(usage);
        case 'object-access':
            return generateObjectExport(usage);
        case 'variable-reference':
            return generateVariableExport(usage, shouldUseJSX);
        default:
            return null;
    }
}
/**
 * Generate JSX component export with props interface
 * Fixed to generate proper interfaces and return multiple statements
 */
function generateJSXComponentExport(usage) {
    var componentName = usage.name;
    var props = usage.properties || [];
    // For components with props, we need to generate the interface first
    // But since we can only return one statement, we'll use a simpler approach
    var propsParam = props.length > 0 ?
        t.objectPattern(props.map(function (prop) {
            return t.objectProperty(t.identifier(prop), t.identifier(prop));
        })) :
        t.identifier('props');
    // Add type annotation for props - use a generic type instead of interface
    if (t.isObjectPattern(propsParam)) {
        var propsType = props.length > 0 ?
            t.tsTypeLiteral(props.map(function (prop) {
                var signature = t.tsPropertySignature(t.identifier(prop), t.tsTypeAnnotation(t.tsStringKeyword()));
                signature.optional = true;
                return signature;
            })) :
            t.tsTypeLiteral([]);
        propsParam.typeAnnotation = t.tsTypeAnnotation(propsType);
    }
    var componentBody = t.blockStatement([
        t.returnStatement(t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier('div'), [], false), t.jsxClosingElement(t.jsxIdentifier('div')), [t.jsxText("Placeholder ".concat(componentName, " component"))], false))
    ]);
    var componentFunction = t.arrowFunctionExpression([propsParam], componentBody);
    componentFunction.returnType = t.tsTypeAnnotation(t.tsTypeReference(t.identifier('React.ReactElement')));
    var componentDeclaration = t.variableDeclaration('const', [
        t.variableDeclarator(t.identifier(componentName), componentFunction)
    ]);
    // Return as named export
    return t.exportNamedDeclaration(componentDeclaration);
}
/**
 * Generate function export
 * Preserves exact logic from working implementation
 */
function generateFunctionExport(usage) {
    var functionName = usage.name;
    var paramTypes = usage.parameters || [];
    var params = paramTypes.map(function (_, index) {
        return t.identifier("arg".concat(index));
    });
    var functionBody = t.blockStatement([
        t.returnStatement(t.nullLiteral())
    ]);
    var functionDeclaration = t.functionDeclaration(t.identifier(functionName), params, functionBody);
    return t.exportNamedDeclaration(functionDeclaration);
}
/**
 * Generate object export with properties
 * Preserves exact logic from working implementation
 */
function generateObjectExport(usage) {
    var objectName = usage.name;
    var properties = usage.properties || [];
    var objectProperties = properties.map(function (prop) {
        return t.objectProperty(t.identifier(prop), t.arrowFunctionExpression([], t.blockStatement([
            t.returnStatement(t.nullLiteral())
        ])));
    });
    var objectExpression = t.objectExpression(objectProperties);
    return t.exportNamedDeclaration(t.variableDeclaration('const', [
        t.variableDeclarator(t.identifier(objectName), objectExpression)
    ]));
}
/**
 * Generate variable export
 * Preserves exact logic from working implementation
 */
function generateVariableExport(usage, shouldUseJSX) {
    var varName = usage.name;
    return generateGenericExport(varName, false, shouldUseJSX);
}
/**
 * Generate generic export for unknown usage patterns
 * Fixed to use proper React types
 */
function generateGenericExport(name, isDefault, shouldUseJSX) {
    var value;
    if (shouldUseJSX) {
        // JSX component fallback
        var componentFunc = t.arrowFunctionExpression([], t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier('div'), [], false), t.jsxClosingElement(t.jsxIdentifier('div')), [t.jsxText("Placeholder ".concat(name, " component"))], false));
        componentFunc.returnType = t.tsTypeAnnotation(t.tsTypeReference(t.identifier('React.ReactElement')));
        value = componentFunc;
    }
    else {
        // Function fallback
        value = t.arrowFunctionExpression([], t.blockStatement([t.returnStatement(t.nullLiteral())]));
    }
    var declaration = t.variableDeclaration('const', [
        t.variableDeclarator(t.identifier(name), value)
    ]);
    if (isDefault) {
        // Export the generated expression directly as default to avoid undeclared identifier
        return t.exportDefaultDeclaration(value);
    }
    else {
        return t.exportNamedDeclaration(declaration);
    }
}
// ============================================================================
// STUB FILE UTILITIES
// ============================================================================
/**
 * Determine appropriate file extension based on usage analysis
 */
function getStubFileExtension(usageAnalysis) {
    return (0, ast_1.shouldUseJSXExtension)(usageAnalysis) ? '.tsx' : '.ts';
}
/**
 * Check if stub needs React import based on usage
 */
function stubNeedsReactImport(usageAnalysis) {
    return (0, ast_1.shouldUseJSXExtension)(usageAnalysis);
}
/**
 * Validate generated stub content
 */
function validateStubContent(content) {
    try {
        // Try to parse the generated content to ensure it's valid
        (0, ast_1.parseCode)(content);
        return true;
    }
    catch (_a) {
        return false;
    }
}
