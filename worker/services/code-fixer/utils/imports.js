"use strict";
/**
 * Import/export analysis utilities using Babel AST traversal
 * Extracted from working ImportExportAnalyzer to preserve exact functionality
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
exports.findImportAtLocation = findImportAtLocation;
exports.getAllImports = getAllImports;
exports.getFileExports = getFileExports;
exports.analyzeImportUsage = analyzeImportUsage;
exports.analyzeNameUsage = analyzeNameUsage;
exports.getFileContent = getFileContent;
exports.getFileAST = getFileAST;
exports.updateImportPath = updateImportPath;
exports.fixImportExportMismatch = fixImportExportMismatch;
var t = require("@babel/types");
var ast_1 = require("./ast");
var logger_1 = require("../../../logger");
var logger = (0, logger_1.createObjectLogger)({ name: 'ImportUtils' }, 'ImportUtils');
// ============================================================================
// IMPORT ANALYSIS
// ============================================================================
/**
 * Find import information at a specific line number in the AST
 * Enhanced to support dynamic imports
 */
function findImportAtLocation(ast, line) {
    var _a, _b, _c, _d, _e, _f, _g;
    logger.debug("Finding import at line ".concat(line));
    var foundImport = null;
    var allImports = [];
    // First check for static imports
    var body = (_b = (_a = ast.program) === null || _a === void 0 ? void 0 : _a.body) !== null && _b !== void 0 ? _b : [];
    for (var _i = 0, body_1 = body; _i < body_1.length; _i++) {
        var node = body_1[_i];
        if (t.isImportDeclaration(node)) {
            var moduleSpecifier = t.isStringLiteral(node.source) ? node.source.value : '';
            var defaultImport = (_c = node.specifiers.find(function (s) { return t.isImportDefaultSpecifier(s); })) === null || _c === void 0 ? void 0 : _c.local.name;
            var namedImports = node.specifiers
                .filter(function (s) { return t.isImportSpecifier(s); })
                .map(function (s) { return (t.isImportSpecifier(s) && t.isIdentifier(s.imported)) ? s.imported.name : ''; })
                .filter(Boolean);
            var startLine = (_e = (_d = node.loc) === null || _d === void 0 ? void 0 : _d.start.line) !== null && _e !== void 0 ? _e : 0;
            var endLine = (_g = (_f = node.loc) === null || _f === void 0 ? void 0 : _f.end.line) !== null && _g !== void 0 ? _g : startLine;
            allImports.push({ line: startLine, moduleSpecifier: moduleSpecifier, defaultImport: defaultImport, namedImports: namedImports });
            if (startLine <= line && endLine >= line) {
                foundImport = {
                    specifier: moduleSpecifier,
                    moduleSpecifier: moduleSpecifier,
                    defaultImport: defaultImport,
                    namedImports: namedImports,
                    filePath: '',
                };
                break;
            }
        }
    }
    // If no static import found, check for dynamic imports
    if (!foundImport) {
        (0, ast_1.traverseAST)(ast, {
            CallExpression: function (path) {
                var _a, _b, _c, _d;
                // Check for dynamic import() calls
                if (t.isImport(path.node.callee)) {
                    var arg = path.node.arguments[0];
                    if (t.isStringLiteral(arg)) {
                        var startLine = (_b = (_a = path.node.loc) === null || _a === void 0 ? void 0 : _a.start.line) !== null && _b !== void 0 ? _b : 0;
                        var endLine = (_d = (_c = path.node.loc) === null || _c === void 0 ? void 0 : _c.end.line) !== null && _d !== void 0 ? _d : startLine;
                        if (startLine <= line && endLine >= line) {
                            // Found a dynamic import at the target line
                            foundImport = {
                                specifier: arg.value,
                                moduleSpecifier: arg.value,
                                defaultImport: undefined,
                                namedImports: [],
                                filePath: '',
                            };
                            path.stop();
                        }
                    }
                }
            },
            // Handle await import() patterns
            AwaitExpression: function (path) {
                var _a, _b, _c, _d;
                if (t.isCallExpression(path.node.argument) && t.isImport(path.node.argument.callee)) {
                    var arg = path.node.argument.arguments[0];
                    if (t.isStringLiteral(arg)) {
                        var startLine = (_b = (_a = path.node.loc) === null || _a === void 0 ? void 0 : _a.start.line) !== null && _b !== void 0 ? _b : 0;
                        var endLine = (_d = (_c = path.node.loc) === null || _c === void 0 ? void 0 : _c.end.line) !== null && _d !== void 0 ? _d : startLine;
                        if (startLine <= line && endLine >= line) {
                            foundImport = {
                                specifier: arg.value,
                                moduleSpecifier: arg.value,
                                defaultImport: undefined,
                                namedImports: [],
                                filePath: '',
                            };
                            path.stop();
                        }
                    }
                }
            },
            // Handle const module = await import() patterns
            VariableDeclarator: function (path) {
                var _a, _b, _c, _d;
                if (t.isAwaitExpression(path.node.init) &&
                    t.isCallExpression(path.node.init.argument) &&
                    t.isImport(path.node.init.argument.callee)) {
                    var arg = path.node.init.argument.arguments[0];
                    if (t.isStringLiteral(arg) && t.isIdentifier(path.node.id)) {
                        var startLine = (_b = (_a = path.node.loc) === null || _a === void 0 ? void 0 : _a.start.line) !== null && _b !== void 0 ? _b : 0;
                        var endLine = (_d = (_c = path.node.loc) === null || _c === void 0 ? void 0 : _c.end.line) !== null && _d !== void 0 ? _d : startLine;
                        if (startLine <= line && endLine >= line) {
                            foundImport = {
                                specifier: arg.value,
                                moduleSpecifier: arg.value,
                                defaultImport: path.node.id.name,
                                namedImports: [],
                                filePath: '',
                            };
                            path.stop();
                        }
                    }
                }
            }
        });
    }
    if (foundImport) {
        logger.debug("Found import at line ".concat(line, ": ").concat(JSON.stringify(foundImport)));
    }
    else {
        logger.debug("No import found at line ".concat(line, ". Available imports: ").concat(allImports.map(function (i) { return "".concat(i.moduleSpecifier, ":").concat(i.line); }).join(', ')));
    }
    logger.debug("All imports found: count=".concat(allImports.length, ", first few: ").concat(allImports.slice(0, 5).map(function (i) { return "".concat(i.moduleSpecifier, ":").concat(i.line); }).join(', ')).concat(allImports.length > 5 ? ', ...' : ''));
    return foundImport;
}
/**
 * Get all imports from a file AST
 */
function getAllImports(ast) {
    var imports = [];
    (0, ast_1.traverseAST)(ast, {
        ImportDeclaration: function (path) {
            var _a;
            var moduleSpecifier = t.isStringLiteral(path.node.source) ? path.node.source.value : '';
            var defaultImport = (_a = path.node.specifiers.find(function (s) { return t.isImportDefaultSpecifier(s); })) === null || _a === void 0 ? void 0 : _a.local.name;
            var namedImports = path.node.specifiers
                .filter(function (s) { return t.isImportSpecifier(s); })
                .map(function (s) { return t.isImportSpecifier(s) && t.isIdentifier(s.imported) ? s.imported.name : ''; })
                .filter(Boolean);
            imports.push({
                specifier: moduleSpecifier,
                moduleSpecifier: moduleSpecifier,
                defaultImport: defaultImport,
                namedImports: namedImports,
                filePath: '',
            });
        }
    });
    return imports;
}
// ============================================================================
// EXPORT ANALYSIS
// ============================================================================
/**
 * Get exports information from a file AST
 * Preserves exact logic from working implementation
 */
function getFileExports(ast) {
    logger.debug("Analyzing exports in file");
    var defaultExport = undefined;
    var namedExports = [];
    var reExports = [];
    (0, ast_1.traverseAST)(ast, {
        ExportNamedDeclaration: function (path) {
            // Handle re-exports (export * from './module' or export { x } from './module')
            if (path.node.source) {
                // This is a re-export
                if (path.node.specifiers.length === 0) {
                    // export * from './module' - we can't determine specific exports without analyzing the source
                    reExports.push('*');
                }
                else {
                    // export { specific } from './module'
                    for (var _i = 0, _a = path.node.specifiers; _i < _a.length; _i++) {
                        var spec = _a[_i];
                        if (t.isExportSpecifier(spec) && t.isIdentifier(spec.exported)) {
                            namedExports.push(spec.exported.name);
                        }
                    }
                }
            }
            else if (path.node.specifiers.length > 0) {
                // Handle regular named exports
                for (var _b = 0, _c = path.node.specifiers; _b < _c.length; _b++) {
                    var spec = _c[_b];
                    if (t.isExportSpecifier(spec) && t.isIdentifier(spec.exported)) {
                        namedExports.push(spec.exported.name);
                    }
                }
            }
            else {
                // Handle export const/function/class declarations
                if (t.isVariableDeclaration(path.node.declaration)) {
                    for (var _d = 0, _e = path.node.declaration.declarations; _d < _e.length; _d++) {
                        var declarator = _e[_d];
                        if (t.isIdentifier(declarator.id)) {
                            namedExports.push(declarator.id.name);
                        }
                    }
                }
                else if (t.isFunctionDeclaration(path.node.declaration) && path.node.declaration.id) {
                    namedExports.push(path.node.declaration.id.name);
                }
                else if (t.isClassDeclaration(path.node.declaration) && path.node.declaration.id) {
                    namedExports.push(path.node.declaration.id.name);
                }
                else if (t.isTSTypeAliasDeclaration(path.node.declaration) && path.node.declaration.id) {
                    // Handle TypeScript type exports
                    namedExports.push(path.node.declaration.id.name);
                }
                else if (t.isTSInterfaceDeclaration(path.node.declaration) && path.node.declaration.id) {
                    // Handle TypeScript interface exports
                    namedExports.push(path.node.declaration.id.name);
                }
            }
        },
        ExportDefaultDeclaration: function (path) {
            // Handle default exports
            if (t.isIdentifier(path.node.declaration)) {
                defaultExport = path.node.declaration.name;
            }
            else if (t.isFunctionDeclaration(path.node.declaration) && path.node.declaration.id) {
                defaultExport = path.node.declaration.id.name;
            }
            else if (t.isClassDeclaration(path.node.declaration) && path.node.declaration.id) {
                defaultExport = path.node.declaration.id.name;
            }
            else {
                defaultExport = 'default';
            }
        },
        ExportAllDeclaration: function (path) {
            // Handle export * from './module'
            if (path.node.source) {
                reExports.push('*');
            }
        }
    });
    // If there are wildcard re-exports, we can't know all exports without analyzing the source modules
    // For now, we'll indicate that with a special marker
    if (reExports.includes('*')) {
        // Add a marker to indicate there may be more exports via re-export
        namedExports.push('...re-exported');
    }
    return {
        defaultExport: defaultExport,
        namedExports: namedExports,
        filePath: '',
    };
}
// ============================================================================
// USAGE ANALYSIS
// ============================================================================
/**
 * Analyze how imported names are used in the source file AST
 * Preserves exact logic from working implementation
 */
function analyzeImportUsage(ast, importNames) {
    var usages = [];
    for (var _i = 0, importNames_1 = importNames; _i < importNames_1.length; _i++) {
        var importName = importNames_1[_i];
        var usage = analyzeNameUsage(ast, importName);
        if (usage) {
            usages.push(usage);
        }
    }
    return usages;
}
/**
 * Analyze how a specific imported name is used in the AST
 * Preserves exact logic from working implementation
 */
function analyzeNameUsage(ast, name) {
    var usage = null;
    var properties = [];
    (0, ast_1.traverseAST)(ast, {
        // Check for JSX component usage: <Name prop="value" />
        JSXElement: function (path) {
            if (t.isJSXIdentifier(path.node.openingElement.name) &&
                path.node.openingElement.name.name === name) {
                // Extract prop names from JSX attributes
                var propNames = path.node.openingElement.attributes
                    .filter(function (attr) { return t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name); })
                    .map(function (attr) {
                    var jsxAttr = attr;
                    return t.isJSXIdentifier(jsxAttr.name) ? jsxAttr.name.name : '';
                })
                    .filter(function (name) { return name !== ''; });
                properties.push.apply(properties, propNames);
                usage = {
                    name: name,
                    type: 'jsx-component',
                    properties: __spreadArray([], new Set(properties), true) // Remove duplicates
                };
            }
        },
        // Check for function call usage: Name(arg1, arg2)
        CallExpression: function (path) {
            if (t.isIdentifier(path.node.callee) && path.node.callee.name === name) {
                // Analyze parameters
                var argTypes = path.node.arguments.map(function (arg) {
                    if (t.isStringLiteral(arg))
                        return 'string';
                    if (t.isNumericLiteral(arg))
                        return 'number';
                    if (t.isBooleanLiteral(arg))
                        return 'boolean';
                    if (t.isObjectExpression(arg))
                        return 'object';
                    if (t.isArrayExpression(arg))
                        return 'array';
                    return 'unknown';
                });
                usage = {
                    name: name,
                    type: 'function-call',
                    parameters: argTypes
                };
            }
        },
        // Check for object property access: Name.property
        MemberExpression: function (path) {
            if (t.isIdentifier(path.node.object) && path.node.object.name === name) {
                if (t.isIdentifier(path.node.property)) {
                    properties.push(path.node.property.name);
                }
                usage = {
                    name: name,
                    type: 'object-access',
                    properties: __spreadArray([], new Set(properties), true) // Remove duplicates
                };
            }
        },
        // Check for simple variable reference: const x = Name;
        Identifier: function (path) {
            if (path.node.name === name &&
                !path.isBindingIdentifier() &&
                !usage) { // Only set as fallback if no specific usage found
                usage = {
                    name: name,
                    type: 'variable-reference'
                };
            }
        }
    });
    return usage;
}
// ============================================================================
// FILE READING WITH AST CACHING
// ============================================================================
/**
 * Get file content from FileMap or fetch it if not available
 */
function getFileContent(filePath, files, fileFetcher, fetchedFiles) {
    return __awaiter(this, void 0, void 0, function () {
        var file, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger.info("ImportUtils: Getting content for file: ".concat(filePath));
                    file = files.get(filePath);
                    if (file) {
                        logger.info("ImportUtils: Found file in context: ".concat(filePath));
                        return [2 /*return*/, file.content];
                    }
                    if (!(fileFetcher && fetchedFiles && !fetchedFiles.has(filePath))) return [3 /*break*/, 5];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    logger.info("ImportUtils: Fetching file: ".concat(filePath));
                    fetchedFiles.add(filePath); // Mark as attempted
                    return [4 /*yield*/, fileFetcher(filePath)];
                case 2:
                    result = _a.sent();
                    if (result && (0, ast_1.isScriptFile)(result.filePath)) {
                        logger.info("ImportUtils: Successfully fetched ".concat(filePath, ", storing in files map"));
                        // Store the fetched file in the mutable files map
                        files.set(filePath, {
                            filePath: filePath,
                            content: result.fileContents,
                            ast: undefined
                        });
                        return [2 /*return*/, result.fileContents];
                    }
                    else {
                        logger.info("ImportUtils: File ".concat(filePath, " was fetched but is not a script file or result is null"));
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    logger.warn("ImportUtils: Failed to fetch file ".concat(filePath, ": ").concat(error_1 instanceof Error ? error_1.message : 'Unknown error'));
                    return [3 /*break*/, 4];
                case 4: return [3 /*break*/, 6];
                case 5:
                    logger.info("ImportUtils: Not fetching ".concat(filePath, " - fileFetcher: ").concat(!!fileFetcher, ", fetchedFiles: ").concat(!!fetchedFiles, ", alreadyFetched: ").concat(fetchedFiles === null || fetchedFiles === void 0 ? void 0 : fetchedFiles.has(filePath)));
                    _a.label = 6;
                case 6: return [2 /*return*/, null];
            }
        });
    });
}
/**
 * Get file AST from FileMap with caching, or parse it if needed
 */
function getFileAST(filePath, files, fileFetcher, fetchedFiles) {
    return __awaiter(this, void 0, void 0, function () {
        var file, content, ast, existing;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger.info("ImportUtils: Getting AST for file: ".concat(filePath));
                    file = files.get(filePath);
                    if (file === null || file === void 0 ? void 0 : file.ast) {
                        logger.info("ImportUtils: Using cached AST for ".concat(filePath));
                        return [2 /*return*/, file.ast];
                    }
                    return [4 /*yield*/, getFileContent(filePath, files, fileFetcher, fetchedFiles)];
                case 1:
                    content = _a.sent();
                    if (!content) {
                        logger.info("ImportUtils: No content available for ".concat(filePath));
                        return [2 /*return*/, null];
                    }
                    logger.info("ImportUtils: Attempting to parse AST for ".concat(filePath, " (").concat(content.length, " characters)"));
                    logger.info("ImportUtils: First 200 characters: ".concat(content.substring(0, 200)));
                    try {
                        ast = (0, ast_1.parseCode)(content);
                        logger.info("ImportUtils: Successfully parsed AST for ".concat(filePath));
                        existing = files.get(filePath);
                        if (existing) {
                            existing.ast = ast;
                        }
                        else {
                            files.set(filePath, { filePath: filePath, content: content, ast: ast });
                        }
                        return [2 /*return*/, ast];
                    }
                    catch (error) {
                        logger.warn("ImportUtils: Failed to parse AST for ".concat(filePath, ": ").concat(error instanceof Error ? error.message : 'Unknown error'));
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
// ============================================================================
// IMPORT PATH UPDATING
// ============================================================================
/**
 * Update import path in AST by modifying the source value
 */
function updateImportPath(ast, oldPath, newPath) {
    var _a, _b;
    var body = (_b = (_a = ast.program) === null || _a === void 0 ? void 0 : _a.body) !== null && _b !== void 0 ? _b : [];
    for (var _i = 0, body_2 = body; _i < body_2.length; _i++) {
        var node = body_2[_i];
        if (t.isImportDeclaration(node) && t.isStringLiteral(node.source) && node.source.value === oldPath) {
            node.source.value = newPath;
        }
    }
    return ast;
}
/**
 * Fix import/export mismatches by converting between default and named imports
 * Enhanced to handle complex partial matches while preserving valid imports
 */
function fixImportExportMismatch(ast, moduleSpecifier, exports) {
    var fixed = false;
    var changes = [];
    (0, ast_1.traverseAST)(ast, {
        ImportDeclaration: function (path) {
            if (t.isStringLiteral(path.node.source) && path.node.source.value === moduleSpecifier) {
                var defaultImport = path.node.specifiers.find(function (s) { return t.isImportDefaultSpecifier(s); });
                var namedImports = path.node.specifiers.filter(function (s) { return t.isImportSpecifier(s); });
                var namespaceImport = path.node.specifiers.find(function (s) { return t.isImportNamespaceSpecifier(s); });
                // Build new specifiers list to preserve valid imports
                var newSpecifiers = [];
                // Handle namespace imports
                if (namespaceImport && t.isImportNamespaceSpecifier(namespaceImport)) {
                    // If module only has default export, convert namespace to default
                    if (exports.defaultExport && exports.namedExports.length === 0) {
                        newSpecifiers.push(t.importDefaultSpecifier(namespaceImport.local));
                        changes.push("Converted namespace import '* as ".concat(namespaceImport.local.name, "' to default import"));
                        fixed = true;
                    }
                    else {
                        // Keep namespace for mixed or named-only exports
                        newSpecifiers.push(namespaceImport);
                    }
                }
                else {
                    // Handle default import
                    if (defaultImport) {
                        var localName_1 = defaultImport.local.name;
                        if (exports.defaultExport) {
                            // Default export exists, keep it
                            newSpecifiers.push(defaultImport);
                        }
                        else {
                            // No default export, try to convert to named
                            var targetNamed = exports.namedExports.find(function (n) {
                                return n === localName_1 || n.toLowerCase() === localName_1.toLowerCase();
                            }) || exports.namedExports[0];
                            if (targetNamed) {
                                newSpecifiers.push(t.importSpecifier(t.identifier(localName_1), t.identifier(targetNamed)));
                                changes.push("Changed default import '".concat(localName_1, "' to named import '").concat(targetNamed, "'"));
                                fixed = true;
                            }
                        }
                    }
                    // Handle named imports - preserve valid ones, fix invalid ones
                    var processedNames = new Set();
                    var _loop_1 = function (namedImport) {
                        if (t.isImportSpecifier(namedImport) && t.isIdentifier(namedImport.imported)) {
                            var namedImportName_1 = namedImport.imported.name;
                            var localAlias = t.isIdentifier(namedImport.local) ? namedImport.local.name : namedImportName_1;
                            // Avoid duplicate processing
                            if (processedNames.has(namedImportName_1))
                                return "continue";
                            processedNames.add(namedImportName_1);
                            if (exports.namedExports.includes(namedImportName_1)) {
                                // Valid named export, keep it
                                newSpecifiers.push(namedImport);
                            }
                            else if (exports.defaultExport === namedImportName_1) {
                                // This should be a default import
                                if (!newSpecifiers.some(function (s) { return t.isImportDefaultSpecifier(s); })) {
                                    newSpecifiers.unshift(t.importDefaultSpecifier(t.identifier(localAlias)));
                                    changes.push("Changed named import '".concat(namedImportName_1, "' to default import"));
                                    fixed = true;
                                }
                            }
                            else {
                                // Try case-insensitive match
                                var caseInsensitiveMatch = exports.namedExports.find(function (n) {
                                    return n.toLowerCase() === namedImportName_1.toLowerCase();
                                });
                                if (caseInsensitiveMatch) {
                                    newSpecifiers.push(t.importSpecifier(t.identifier(localAlias), t.identifier(caseInsensitiveMatch)));
                                    changes.push("Fixed case mismatch: '".concat(namedImportName_1, "' \u2192 '").concat(caseInsensitiveMatch, "'"));
                                    fixed = true;
                                }
                                else {
                                    // Import doesn't exist, skip it with warning
                                    changes.push("Removed invalid import '".concat(namedImportName_1, "' (not found in exports)"));
                                    fixed = true;
                                }
                            }
                        }
                    };
                    for (var _i = 0, namedImports_1 = namedImports; _i < namedImports_1.length; _i++) {
                        var namedImport = namedImports_1[_i];
                        _loop_1(namedImport);
                    }
                }
                // Update specifiers if we made changes
                if (fixed && newSpecifiers.length > 0) {
                    path.node.specifiers = newSpecifiers;
                }
            }
        }
    });
    return { fixed: fixed, changes: changes };
}
