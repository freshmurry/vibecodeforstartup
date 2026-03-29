"use strict";
/**
 * AST utility functions for parsing and generating code using Babel
 * Extracted from the working BabelASTProcessor to maintain exact functionality
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultParseOptions = getDefaultParseOptions;
exports.mergeParseOptions = mergeParseOptions;
exports.parseCode = parseCode;
exports.traverseAST = traverseAST;
exports.generateCode = generateCode;
exports.isScriptFile = isScriptFile;
exports.shouldUseJSXExtension = shouldUseJSXExtension;
exports.getAppropriateExtension = getAppropriateExtension;
exports.createReactImport = createReactImport;
exports.createNamedExport = createNamedExport;
exports.createDefaultExport = createDefaultExport;
exports.createFileAST = createFileAST;
exports.isValidFileAST = isValidFileAST;
exports.validateGeneratedCode = validateGeneratedCode;
var parser_1 = require("@babel/parser");
var traverse_1 = require("@babel/traverse");
var generator_1 = require("@babel/generator");
var t = require("@babel/types");
var logger_1 = require("../../../logger");
var logger = (0, logger_1.createObjectLogger)({ name: 'ASTUtils' }, 'ASTUtils');
// ============================================================================
// PARSER CONFIGURATION
// ============================================================================
/**
 * Get the standard parser options that work with TypeScript/JSX
 * Preserves exact configuration from working BabelASTProcessor
 */
function getDefaultParseOptions() {
    return {
        sourceType: 'module',
        ranges: true,
        attachComment: false,
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
        plugins: [
            'typescript',
            'jsx',
            'decorators-legacy',
            'classProperties',
            'objectRestSpread',
            'functionBind',
            'exportDefaultFrom',
            'exportNamespaceFrom',
            'dynamicImport',
            'nullishCoalescingOperator',
            'optionalChaining',
            'importMeta'
        ],
    };
}
/**
 * Merge custom options with defaults
 */
function mergeParseOptions(custom) {
    var defaults = getDefaultParseOptions();
    if (!custom)
        return defaults;
    return __assign(__assign(__assign({}, defaults), custom), { plugins: custom.plugins ? custom.plugins : defaults.plugins });
}
// ============================================================================
// CORE AST FUNCTIONS
// ============================================================================
/**
 * Parse code string to Babel AST
 * Includes fallback to JavaScript parsing if TypeScript parsing fails
 */
function parseCode(code, options) {
    var _a;
    var parseOptions = mergeParseOptions(options);
    try {
        logger.debug("Parsing code (".concat(code.length, " characters) with TypeScript plugins"));
        var ast = (0, parser_1.parse)(code, parseOptions);
        logger.debug("Successfully parsed code to AST");
        return ast;
    }
    catch (error) {
        logger.warn("TypeScript parsing failed, falling back to JavaScript parsing: ".concat(error instanceof Error ? error.message : 'Unknown error'));
        // Fallback to JavaScript parsing - match old implementation behavior
        var jsOptions = __assign({}, parseOptions);
        jsOptions.plugins = (_a = jsOptions.plugins) === null || _a === void 0 ? void 0 : _a.filter(function (p) { return p !== 'typescript'; });
        // Don't wrap in try-catch - let it throw the original Babel error if it fails
        // This matches the old implementation's behavior
        var ast = (0, parser_1.parse)(code, jsOptions);
        logger.debug("Successfully parsed code to AST using JavaScript fallback");
        return ast;
    }
}
/**
 * Traverse AST with visitor pattern
 * Direct wrapper around Babel traverse
 */
function traverseAST(ast, visitor) {
    try {
        logger.debug("Starting AST traversal");
        // First try with full scope building
        traverse_1.default(ast, visitor);
        logger.debug("AST traversal completed successfully");
    }
    catch (error) {
        var message = error instanceof Error ? error.message : String(error);
        var shouldRetryNoScope = message.includes("reading 'get'") || message.includes('Scope') || message.includes('setScope');
        if (shouldRetryNoScope) {
            logger.warn("AST traversal failed with scope error, retrying with noScope: true");
            try {
                traverse_1.default(ast, __assign(__assign({}, visitor), { noScope: true }));
                logger.debug("AST traversal with noScope completed successfully");
                return;
            }
            catch (e2) {
                logger.error("AST traversal (noScope) failed", e2);
                throw new Error("Failed to traverse AST: ".concat(e2 instanceof Error ? e2.message : 'Unknown error'));
            }
        }
        logger.error("AST traversal failed", error);
        throw new Error("Failed to traverse AST: ".concat(message));
    }
}
/**
 * Generate code from AST
 * Uses settings optimized for readable output
 */
function generateCode(ast, options) {
    var generateOptions = __assign({ retainLines: true, compact: false, concise: false }, options);
    try {
        logger.debug("Generating code from AST");
        var result = (0, generator_1.default)(ast, generateOptions);
        logger.debug("Successfully generated code (".concat(result.code.length, " characters)"));
        return result;
    }
    catch (error) {
        logger.error("Code generation failed", error);
        throw new Error("Failed to generate code from AST: ".concat(error instanceof Error ? error.message : 'Unknown error'));
    }
}
// ============================================================================
// FILE TYPE DETECTION
// ============================================================================
/**
 * Check if a file path represents a script file (TypeScript/JavaScript)
 */
function isScriptFile(filePath) {
    return /\.(ts|tsx|js|jsx)$/.test(filePath);
}
/**
 * Determine if code contains JSX based on usage analysis
 */
function shouldUseJSXExtension(usageAnalysis) {
    return usageAnalysis.some(function (usage) { return usage.type === 'jsx-component'; });
}
/**
 * Get appropriate file extension based on usage
 */
function getAppropriateExtension(usageAnalysis) {
    return shouldUseJSXExtension(usageAnalysis) ? '.tsx' : '.ts';
}
// ============================================================================
// AST NODE UTILITIES
// ============================================================================
/**
 * Create a React import declaration for JSX files
 */
function createReactImport() {
    return t.importDeclaration([t.importDefaultSpecifier(t.identifier('React'))], t.stringLiteral('react'));
}
/**
 * Create an export statement from a variable declaration
 */
function createNamedExport(declaration) {
    return t.exportNamedDeclaration(declaration);
}
/**
 * Create a default export from an identifier
 */
function createDefaultExport(identifier) {
    return t.exportDefaultDeclaration(identifier);
}
/**
 * Create a file AST with given statements
 */
function createFileAST(statements) {
    return t.file(t.program(statements, [], 'module'), [], []);
}
// ============================================================================
// AST VALIDATION
// ============================================================================
/**
 * Validate that an AST node is a valid File node
 */
function isValidFileAST(ast) {
    return t.isFile(ast);
}
/**
 * Validate that generated code is syntactically correct
 */
function validateGeneratedCode(code) {
    try {
        parseCode(code);
        return true;
    }
    catch (_a) {
        return false;
    }
}
