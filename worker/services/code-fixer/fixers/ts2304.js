"use strict";
/**
 * TS2304: Cannot find name fixer
 * Handles undefined names by creating placeholder declarations
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
exports.fixUndefinedName = fixUndefinedName;
var t = require("@babel/types");
var ast_1 = require("../utils/ast");
var imports_1 = require("../utils/imports");
var helpers_1 = require("../utils/helpers");
/**
 * Fix TS2304 "Cannot find name" errors
 * Preserves exact logic from working DeclarationFixer.fixUndefinedName
 */
function fixUndefinedName(context, issues) {
    return __awaiter(this, void 0, void 0, function () {
        var fixedIssues, unfixableIssues, modifiedFilesMap, newFiles, fetchedFiles, issuesByFile, _i, issues_1, issue, fileIssues, _a, issuesByFile_1, _b, filePath, fileIssues, fileContent, _c, fileIssues_1, issue, ast, hasChanges, appliedDeclarations, _d, fileIssues_2, issue, undefinedName, usageContext, declaration, generatedCode, error_1, _e, fileIssues_3, issue;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    fixedIssues = [];
                    unfixableIssues = [];
                    modifiedFilesMap = new Map();
                    newFiles = [];
                    fetchedFiles = new Set(context.fetchedFiles);
                    issuesByFile = new Map();
                    for (_i = 0, issues_1 = issues; _i < issues_1.length; _i++) {
                        issue = issues_1[_i];
                        fileIssues = issuesByFile.get(issue.filePath) || [];
                        fileIssues.push(issue);
                        issuesByFile.set(issue.filePath, fileIssues);
                    }
                    _a = 0, issuesByFile_1 = issuesByFile;
                    _f.label = 1;
                case 1:
                    if (!(_a < issuesByFile_1.length)) return [3 /*break*/, 6];
                    _b = issuesByFile_1[_a], filePath = _b[0], fileIssues = _b[1];
                    _f.label = 2;
                case 2:
                    _f.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, imports_1.getFileContent)(filePath, context.files, context.fileFetcher, fetchedFiles)];
                case 3:
                    fileContent = _f.sent();
                    if (!fileContent) {
                        for (_c = 0, fileIssues_1 = fileIssues; _c < fileIssues_1.length; _c++) {
                            issue = fileIssues_1[_c];
                            unfixableIssues.push({
                                issueCode: 'TS2304',
                                filePath: issue.filePath,
                                line: issue.line,
                                column: issue.column,
                                originalMessage: issue.message,
                                reason: 'File content not available'
                            });
                        }
                        return [3 /*break*/, 5];
                    }
                    ast = (0, ast_1.parseCode)(fileContent);
                    hasChanges = false;
                    appliedDeclarations = [];
                    // Process all undefined names for this file
                    for (_d = 0, fileIssues_2 = fileIssues; _d < fileIssues_2.length; _d++) {
                        issue = fileIssues_2[_d];
                        undefinedName = extractUndefinedName(issue.message);
                        if (!undefinedName) {
                            unfixableIssues.push({
                                issueCode: 'TS2304',
                                filePath: issue.filePath,
                                line: issue.line,
                                column: issue.column,
                                originalMessage: issue.message,
                                reason: 'Could not extract undefined name from error message'
                            });
                            continue;
                        }
                        // Skip common global variables that shouldn't be declared
                        if (isGlobalVariable(undefinedName)) {
                            unfixableIssues.push({
                                issueCode: 'TS2304',
                                filePath: issue.filePath,
                                line: issue.line,
                                column: issue.column,
                                originalMessage: issue.message,
                                reason: "".concat(undefinedName, " is a global variable and should not be declared")
                            });
                            continue;
                        }
                        usageContext = analyzeUsageContext(fileContent, undefinedName, issue.line);
                        declaration = generateDeclaration(undefinedName, usageContext);
                        // Add declaration to the AST (accumulating changes)
                        ast = addDeclarationToAST(ast, declaration);
                        hasChanges = true;
                        appliedDeclarations.push(undefinedName);
                        fixedIssues.push({
                            issueCode: 'TS2304',
                            filePath: issue.filePath,
                            line: issue.line,
                            column: issue.column,
                            originalMessage: issue.message,
                            fixApplied: "Added declaration for '".concat(undefinedName, "' (").concat(usageContext, ")"),
                            fixType: 'declaration_fix',
                        });
                    }
                    // Generate code once for all accumulated changes
                    if (hasChanges) {
                        generatedCode = (0, ast_1.generateCode)(ast);
                        modifiedFilesMap.set(filePath, {
                            filePath: filePath,
                            fileContents: generatedCode.code,
                        });
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _f.sent();
                    // If there's an error processing the file, mark all its issues as unfixable
                    for (_e = 0, fileIssues_3 = fileIssues; _e < fileIssues_3.length; _e++) {
                        issue = fileIssues_3[_e];
                        unfixableIssues.push((0, helpers_1.handleFixerError)(issue, error_1, 'TS2304Fixer'));
                    }
                    return [3 /*break*/, 5];
                case 5:
                    _a++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/, {
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
 * Extract undefined name from error message
 */
function extractUndefinedName(message) {
    // Extract name from messages like "Cannot find name 'SomeName'"
    var match = message.match(/Cannot find name '([^']+)'/);
    return match ? match[1] : null;
}
/**
 * Check if a name is a global variable that shouldn't be declared
 */
function isGlobalVariable(name) {
    var globalVars = [
        'window', 'document', 'console', 'process', 'global', 'Buffer',
        'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
        'fetch', 'localStorage', 'sessionStorage', 'location', 'history'
    ];
    return globalVars.includes(name);
}
/**
 * Analyze usage context to infer the appropriate declaration type
 * Enhanced with better pattern detection and multi-line context
 */
function analyzeUsageContext(fileContent, name, line) {
    var lines = fileContent.split('\n');
    // Get expanded context: more surrounding lines for better analysis
    var startLine = Math.max(0, line - 5);
    var endLine = Math.min(lines.length, line + 5);
    var contextLines = lines.slice(startLine, endLine).join('\n');
    var errorLine = lines[line - 1] || '';
    // Enhanced pattern detection with priority order and improved accuracy
    // 1. Class instantiation - check for 'new' keyword
    // Look for: new Name( or new Name<T>( or new Name ()
    var classPattern = new RegExp("new\\s+".concat(name, "\\s*[<(]"), 'g');
    if (classPattern.test(contextLines)) {
        return 'class';
    }
    // 2. React/JSX component - check for JSX usage
    // Look for: <Name or <Name> or <Name/> or <Name prop=
    // Also check if file is .tsx and name starts with capital
    var jsxPattern = new RegExp("<".concat(name, "(?:\\s|>|/>)"), 'g');
    if (jsxPattern.test(contextLines) ||
        (fileContent.includes('React') && name[0] === name[0].toUpperCase() && jsxPattern.test(contextLines))) {
        return 'react_component';
    }
    // 3. Function call - check for invocation with better accuracy
    // Look for: Name( or Name.method( but not new Name(
    // Also check for async/await patterns
    var functionPattern = new RegExp("(?<!new\\s)\\b".concat(name, "\\s*\\("), 'g');
    var asyncPattern = new RegExp("await\\s+".concat(name, "\\s*\\("), 'g');
    var promisePattern = new RegExp("".concat(name, "\\s*\\([^)]*\\)\\s*\\.\\s*(then|catch|finally)"), 'g');
    if (functionPattern.test(errorLine) || asyncPattern.test(contextLines) || promisePattern.test(contextLines)) {
        return 'function';
    }
    // 4. Type usage - check for TypeScript type contexts with better patterns
    // Look for: : Name or extends Name or implements Name or Name<
    // Also check for type assertions and generic constraints
    var typePattern = new RegExp("(?::|extends|implements|satisfies)\\s+".concat(name, "\\b|\\b").concat(name, "\\s*<|as\\s+").concat(name, "\\b"), 'g');
    var genericPattern = new RegExp("<[^>]*".concat(name, "[^>]*>"), 'g');
    if (typePattern.test(contextLines) || genericPattern.test(contextLines)) {
        return 'type_or_interface';
    }
    // 5. Object property/method access with better detection
    // Look for: Name.property or Name.method() or Name?.property
    // Also check for destructuring patterns
    var objectPattern = new RegExp("\\b".concat(name, "\\s*[\\?\\.]+\\s*\\w+"), 'g');
    var destructurePattern = new RegExp("const\\s*\\{[^}]*\\}\\s*=\\s*".concat(name), 'g');
    if (objectPattern.test(errorLine) || destructurePattern.test(contextLines)) {
        return 'object';
    }
    // 6. Array or object indexing
    // Look for: Name[index] or Name['key']
    // Also check for array methods
    var indexPattern = new RegExp("\\b".concat(name, "\\s*\\["), 'g');
    var arrayMethodPattern = new RegExp("".concat(name, "\\s*\\.\\s*(map|filter|reduce|forEach|find|some|every|push|pop)\\s*\\("), 'g');
    if (indexPattern.test(errorLine) || arrayMethodPattern.test(contextLines)) {
        return 'array_or_object';
    }
    // 7. Assignment target - check if being assigned to
    // Look for: Name = value or let/const/var Name
    var assignmentPattern = new RegExp("\\b".concat(name, "\\s*=(?!=)"), 'g');
    var declarationPattern = new RegExp("\\b(let|const|var)\\s+".concat(name, "\\b"), 'g');
    if (assignmentPattern.test(errorLine) && !declarationPattern.test(errorLine)) {
        return 'variable';
    }
    // 8. Enum or constant usage with improved patterns
    // Look for: Name.CONSTANT or usage in switch cases
    // Also check for string literal types patterns
    var enumPattern = new RegExp("\\b".concat(name, "\\.[A-Z_][A-Z0-9_]*\\b"), 'g');
    var switchPattern = new RegExp("switch\\s*\\([^)]*".concat(name, "[^)]*\\)|case\\s+").concat(name, "\\."), 'g');
    if (enumPattern.test(contextLines) || switchPattern.test(contextLines)) {
        return 'enum_or_constants';
    }
    // 9. Check if used as a value in expressions
    // Look for usage in conditions, returns, etc.
    var valuePattern = new RegExp("(return|if|while|for|switch|case|throw).*\\b".concat(name, "\\b"), 'g');
    if (valuePattern.test(errorLine)) {
        return 'value';
    }
    // 10. Hook pattern for React
    if (name.startsWith('use') && name[3] && name[3] === name[3].toUpperCase()) {
        return 'react_hook';
    }
    return 'unknown';
}
/**
 * Generate appropriate declaration based on usage context
 * Enhanced with better TypeScript declarations and proper AST nodes
 */
function generateDeclaration(name, context) {
    switch (context) {
        case 'react_component':
            // Proper React component with better typing
            return "\ninterface ".concat(name, "Props {\n    // TODO: Define component props based on usage\n    children?: React.ReactNode;\n    className?: string;\n    style?: React.CSSProperties;\n    [key: string]: unknown;\n}\n\nconst ").concat(name, ": React.FC<").concat(name, "Props> = ({ children, className, style, ...props }) => {\n    return (\n        <div className={className} style={style} {...props}>\n            {children || 'TODO: Implement ").concat(name, " component'}\n        </div>\n    );\n};\n\nexport default ").concat(name, ";");
        case 'function':
            // Better function typing with generic return type
            return "\n/**\n * TODO: Implement ".concat(name, " function\n * @template T - Return type\n * @param args - Function arguments\n * @returns Function result\n */\nfunction ").concat(name, "<T = unknown>(...args: unknown[]): T | null {\n    // TODO: Implement ").concat(name, "\n    console.warn('").concat(name, " is not implemented', args);\n    return null as T | null;\n}\n\nexport { ").concat(name, " };");
        case 'class':
            // Better class template with common patterns
            return "\n/**\n * TODO: Implement ".concat(name, " class\n */\nclass ").concat(name, " {\n    private _initialized = false;\n    \n    constructor(...args: unknown[]) {\n        // TODO: Initialize ").concat(name, "\n        console.warn('").concat(name, " constructor called with:', args);\n        this._initialized = true;\n    }\n    \n    // TODO: Add methods\n    public isInitialized(): boolean {\n        return this._initialized;\n    }\n}\n\nexport { ").concat(name, " };");
        case 'type_or_interface':
            // Better TypeScript interface with common patterns
            return "\n/**\n * TODO: Define ".concat(name, " type/interface\n */\ninterface ").concat(name, " {\n    id?: string | number;\n    // TODO: Add specific properties based on usage\n    [key: string]: unknown;\n}\n\nexport type { ").concat(name, " };");
        case 'object':
            // Better object with typed methods
            return "\n/**\n * TODO: Implement ".concat(name, " object\n */\nconst ").concat(name, " = {\n    // TODO: Add properties and methods based on usage\n    _stub: true,\n    \n    // Common utility methods\n    init: (...args: unknown[]): void => {\n        console.warn('").concat(name, ".init not implemented', args);\n    },\n    \n    getValue: <T = unknown>(key: string): T | undefined => {\n        console.warn('").concat(name, ".getValue not implemented', key);\n        return undefined;\n    },\n    \n    setValue: <T = unknown>(key: string, value: T): void => {\n        console.warn('").concat(name, ".setValue not implemented', key, value);\n    }\n} as const;\n\nexport { ").concat(name, " };");
        case 'array_or_object':
            // Better array/collection type
            return "\n/**\n * TODO: Initialize ".concat(name, " collection\n */\ntype ").concat(name, "Item = unknown; // TODO: Define item type\n\nconst ").concat(name, ": ").concat(name, "Item[] = [];\n\n// Helper functions for the collection\nexport const ").concat(name, "Utils = {\n    add: (item: ").concat(name, "Item): void => {\n        ").concat(name, ".push(item);\n    },\n    remove: (index: number): ").concat(name, "Item | undefined => {\n        return ").concat(name, ".splice(index, 1)[0];\n    },\n    get: (index: number): ").concat(name, "Item | undefined => {\n        return ").concat(name, "[index];\n    },\n    size: (): number => {\n        return ").concat(name, ".length;\n    }\n};\n\nexport { ").concat(name, " };");
        case 'enum_or_constants':
            // Better enum with TypeScript enum syntax
            return "\n/**\n * TODO: Define ".concat(name, " enum/constants\n */\nenum ").concat(name, " {\n    // TODO: Add enum values\n    DEFAULT = 'DEFAULT',\n    ACTIVE = 'ACTIVE',\n    INACTIVE = 'INACTIVE',\n    // Add more values as needed\n}\n\n// Alternative const assertion pattern\nconst ").concat(name, "Values = {\n    DEFAULT: 'DEFAULT',\n    ACTIVE: 'ACTIVE',\n    INACTIVE: 'INACTIVE',\n} as const;\n\nexport { ").concat(name, ", ").concat(name, "Values };\nexport type ").concat(name, "Type = keyof typeof ").concat(name, "Values;");
        case 'variable':
            // Better typed mutable variable
            return "\n/**\n * TODO: Initialize ".concat(name, " variable\n */\nlet ").concat(name, ": unknown = null;\n\n// Getter and setter for better control\nexport const get").concat(name[0].toUpperCase()).concat(name.slice(1), " = (): unknown => ").concat(name, ";\nexport const set").concat(name[0].toUpperCase()).concat(name.slice(1), " = (value: unknown): void => {\n    ").concat(name, " = value;\n};\n\nexport { ").concat(name, " };");
        case 'value':
            // Better constant with proper typing
            return "\n/**\n * TODO: Define ".concat(name, " constant value\n */\nconst ").concat(name, ": unknown = null; // TODO: Set actual value and type\n\nexport { ").concat(name, " };");
        case 'react_hook':
            // React custom hook template
            return "\n/**\n * TODO: Implement ".concat(name, " custom hook\n */\nfunction ").concat(name, "<T = unknown>(initialValue?: T): [T | undefined, (value: T) => void] {\n    const [state, setState] = React.useState<T | undefined>(initialValue);\n    \n    // TODO: Implement hook logic\n    React.useEffect(() => {\n        console.warn('").concat(name, " hook not fully implemented');\n    }, []);\n    \n    return [state, setState];\n}\n\nexport { ").concat(name, " };");
        default:
            // Better generic fallback
            return "\n/**\n * TODO: Implement ".concat(name, "\n * Context: ").concat(context, "\n * Unable to determine the exact type from usage context.\n * Please update the type and implementation based on actual requirements.\n */\nconst ").concat(name, ": unknown = (() => {\n    console.warn('").concat(name, " stub - please implement based on usage context');\n    return null;\n})();\n\nexport { ").concat(name, " };");
    }
}
/**
 * Add declaration to AST at appropriate location
 */
function addDeclarationToAST(ast, declaration) {
    try {
        // Parse the declaration as a statement
        var declarationAst = (0, ast_1.parseCode)(declaration);
        var declarationStatement = declarationAst.program.body[0];
        if (declarationStatement) {
            // Find the position after imports to insert the declaration
            var insertIndex = 0;
            for (var i = 0; i < ast.program.body.length; i++) {
                var statement = ast.program.body[i];
                if (t.isImportDeclaration(statement)) {
                    insertIndex = i + 1;
                }
                else {
                    break;
                }
            }
            // Insert the declaration
            ast.program.body.splice(insertIndex, 0, declarationStatement);
        }
    }
    catch (error) {
        // Fallback: just add as comment if parsing fails
        var commentStatement = t.expressionStatement(t.identifier("/* ".concat(declaration, " */")));
        ast.program.body.unshift(commentStatement);
    }
    return ast;
}
