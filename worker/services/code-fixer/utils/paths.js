"use strict";
/**
 * Path resolution utilities for import specifiers
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
exports.resolvePathAlias = resolvePathAlias;
exports.resolveImportPath = resolveImportPath;
exports.findModuleFile = findModuleFile;
exports.makeRelativeImport = makeRelativeImport;
exports.resolveImportToFilePath = resolveImportToFilePath;
exports.isValidScriptPath = isValidScriptPath;
exports.normalizePath = normalizePath;
exports.getDirectory = getDirectory;
exports.getFilename = getFilename;
exports.getExtension = getExtension;
var ast_1 = require("./ast");
var imports_1 = require("./imports");
// ============================================================================
// PATH ALIAS RESOLUTION
// ============================================================================
/**
 * Resolve path aliases like @/components/ui/button to src/components/ui/button
 * Preserves exact logic from working implementation
 */
function resolvePathAlias(importSpecifier) {
    if (importSpecifier.startsWith('@/')) {
        // Convert @/components/ui/button to src/components/ui/button
        return importSpecifier.replace('@/', 'src/');
    }
    return importSpecifier;
}
// ============================================================================
// RELATIVE PATH RESOLUTION
// ============================================================================
/**
 * Resolve relative import paths to absolute paths within the project
 * Preserves exact logic from working implementation
 */
function resolveImportPath(importSpecifier, currentFilePath, files, fileFetcher, fetchedFiles) {
    return __awaiter(this, void 0, void 0, function () {
        var currentDirParts, importParts, combinedParts, normalizedParts, _i, combinedParts_1, part, resolvedPath, _a, _b, ext, withExt, fileContent, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!(importSpecifier.startsWith('./') || importSpecifier.startsWith('../'))) return [3 /*break*/, 7];
                    currentDirParts = currentFilePath.split('/').slice(0, -1);
                    importParts = importSpecifier.split('/');
                    combinedParts = __spreadArray(__spreadArray([], currentDirParts, true), importParts, true);
                    normalizedParts = [];
                    // Normalize path (handle ../ and ./)
                    for (_i = 0, combinedParts_1 = combinedParts; _i < combinedParts_1.length; _i++) {
                        part = combinedParts_1[_i];
                        if (part === '..') {
                            normalizedParts.pop();
                        }
                        else if (part !== '.' && part !== '') {
                            normalizedParts.push(part);
                        }
                    }
                    resolvedPath = normalizedParts.join('/');
                    _a = 0, _b = ['.ts', '.tsx', '.js', '.jsx'];
                    _d.label = 1;
                case 1:
                    if (!(_a < _b.length)) return [3 /*break*/, 6];
                    ext = _b[_a];
                    if (!!resolvedPath.endsWith(ext)) return [3 /*break*/, 5];
                    withExt = resolvedPath + ext;
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, imports_1.getFileContent)(withExt, files, fileFetcher, fetchedFiles)];
                case 3:
                    fileContent = _d.sent();
                    if (fileContent)
                        return [2 /*return*/, withExt];
                    return [3 /*break*/, 5];
                case 4:
                    _c = _d.sent();
                    return [3 /*break*/, 5];
                case 5:
                    _a++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/, resolvedPath];
                case 7: 
                // Absolute import - return as is for now
                return [2 /*return*/, importSpecifier];
            }
        });
    });
}
// ============================================================================
// MODULE FILE FINDING
// ============================================================================
/**
 * Find a module file using fuzzy matching and file fetching
 * Preserves exact logic from working ImportExportAnalyzer.findModuleFile
 */
function findModuleFile(importSpecifier, currentFilePath, files, fileFetcher, fetchedFiles) {
    return __awaiter(this, void 0, void 0, function () {
        var resolvedSpecifier, exactMatch, allFiles_3, allFiles, _i, allFiles_1, file, extensionsToTry, _a, extensionsToTry_1, ext, candidatePath, content, _b, searchTerm, _c, allFiles_2, file, fileName;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    resolvedSpecifier = resolvePathAlias(importSpecifier);
                    return [4 /*yield*/, resolveImportPath(resolvedSpecifier, currentFilePath, files, fileFetcher, fetchedFiles)];
                case 1:
                    exactMatch = _e.sent();
                    if (exactMatch) {
                        allFiles_3 = Array.from(files.keys());
                        if (allFiles_3.some(function (file) { return file === exactMatch; })) {
                            return [2 /*return*/, exactMatch];
                        }
                    }
                    allFiles = Array.from(files.keys());
                    // Try direct path matching for aliases
                    for (_i = 0, allFiles_1 = allFiles; _i < allFiles_1.length; _i++) {
                        file = allFiles_1[_i];
                        if (file === resolvedSpecifier ||
                            file === resolvedSpecifier + '.ts' ||
                            file === resolvedSpecifier + '.tsx' ||
                            file === resolvedSpecifier + '.js' ||
                            file === resolvedSpecifier + '.jsx') {
                            return [2 /*return*/, file];
                        }
                    }
                    extensionsToTry = ['.tsx', '.ts', '.jsx', '.js'];
                    _a = 0, extensionsToTry_1 = extensionsToTry;
                    _e.label = 2;
                case 2:
                    if (!(_a < extensionsToTry_1.length)) return [3 /*break*/, 7];
                    ext = extensionsToTry_1[_a];
                    candidatePath = resolvedSpecifier + ext;
                    _e.label = 3;
                case 3:
                    _e.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, (0, imports_1.getFileContent)(candidatePath, files, fileFetcher, fetchedFiles)];
                case 4:
                    content = _e.sent();
                    if (content) {
                        return [2 /*return*/, candidatePath];
                    }
                    return [3 /*break*/, 6];
                case 5:
                    _b = _e.sent();
                    return [3 /*break*/, 6];
                case 6:
                    _a++;
                    return [3 /*break*/, 2];
                case 7:
                    searchTerm = resolvedSpecifier.replace(/^\.\/|^\.\.\/|^\//, '').replace(/\.(ts|tsx|js|jsx)$/, '');
                    for (_c = 0, allFiles_2 = allFiles; _c < allFiles_2.length; _c++) {
                        file = allFiles_2[_c];
                        fileName = ((_d = file.split('/').pop()) === null || _d === void 0 ? void 0 : _d.replace(/\.(ts|tsx|js|jsx)$/, '')) || '';
                        // Check if filename matches or contains the search term
                        if (fileName === searchTerm || fileName.includes(searchTerm) || searchTerm.includes(fileName)) {
                            return [2 /*return*/, file];
                        }
                    }
                    return [2 /*return*/, null];
            }
        });
    });
}
// ============================================================================
// RELATIVE IMPORT CREATION
// ============================================================================
/**
 * Create a relative import path from one file to another
 * Preserves exact logic from working implementation
 */
function makeRelativeImport(fromFile, toFile) {
    var _a;
    var fromParts = fromFile.split('/').slice(0, -1); // Remove filename
    var toParts = toFile.split('/').slice(0, -1); // Remove filename
    var toFileName = ((_a = toFile.split('/').pop()) === null || _a === void 0 ? void 0 : _a.replace(/\.(ts|tsx|js|jsx)$/, '')) || '';
    // Find common prefix
    var commonLength = 0;
    while (commonLength < fromParts.length &&
        commonLength < toParts.length &&
        fromParts[commonLength] === toParts[commonLength]) {
        commonLength++;
    }
    // Build relative path
    var upLevels = fromParts.length - commonLength;
    var downPath = toParts.slice(commonLength);
    var relativePath = '';
    if (upLevels > 0) {
        relativePath = '../'.repeat(upLevels);
    }
    else {
        relativePath = './';
    }
    if (downPath.length > 0) {
        relativePath += downPath.join('/') + '/';
    }
    relativePath += toFileName;
    return relativePath;
}
// ============================================================================
// IMPORT TO FILE PATH RESOLUTION
// ============================================================================
/**
 * Resolve an import specifier to a target file path for stub creation
 * Preserves exact logic from working implementation
 */
function resolveImportToFilePath(importSpecifier, currentFilePath) {
    if (importSpecifier.startsWith('./') || importSpecifier.startsWith('../')) {
        var currentDir = currentFilePath.split('/').slice(0, -1).join('/');
        // Resolve the path manually
        var pathParts = currentDir.split('/').concat(importSpecifier.split('/'));
        var normalizedParts = [];
        for (var _i = 0, pathParts_1 = pathParts; _i < pathParts_1.length; _i++) {
            var part = pathParts_1[_i];
            if (part === '..') {
                normalizedParts.pop();
            }
            else if (part !== '.' && part !== '') {
                normalizedParts.push(part);
            }
        }
        var resolvedPath = normalizedParts.join('/');
        // Add appropriate extension if not present
        if (!resolvedPath.match(/\.(ts|tsx|js|jsx)$/)) {
            return resolvedPath + '.tsx'; // Default to .tsx for React components
        }
        return resolvedPath;
    }
    else if (importSpecifier.startsWith('@/')) {
        // Handle path aliases - convert @/ to src/
        var withoutAlias = importSpecifier.replace('@/', 'src/');
        if (!withoutAlias.match(/\.(ts|tsx|js|jsx)$/)) {
            return withoutAlias + '.tsx';
        }
        return withoutAlias;
    }
    else {
        // For other absolute imports, create in src directory by default
        var fileName = importSpecifier.split('/').pop() || 'index';
        return "src/".concat(fileName, ".tsx");
    }
}
// ============================================================================
// PATH VALIDATION
// ============================================================================
/**
 * Check if a path is a valid script file path
 */
function isValidScriptPath(filePath) {
    return (0, ast_1.isScriptFile)(filePath);
}
/**
 * Normalize a file path by removing redundant parts
 */
function normalizePath(filePath) {
    var parts = filePath.split('/').filter(function (part) { return part !== ''; });
    var normalized = [];
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        if (part === '..') {
            normalized.pop();
        }
        else if (part !== '.') {
            normalized.push(part);
        }
    }
    return normalized.join('/');
}
/**
 * Get the directory part of a file path
 */
function getDirectory(filePath) {
    return filePath.split('/').slice(0, -1).join('/');
}
/**
 * Get the filename part of a file path (without extension)
 */
function getFilename(filePath) {
    var _a;
    return ((_a = filePath.split('/').pop()) === null || _a === void 0 ? void 0 : _a.replace(/\.(ts|tsx|js|jsx)$/, '')) || '';
}
/**
 * Get the file extension
 */
function getExtension(filePath) {
    var match = filePath.match(/\.(ts|tsx|js|jsx)$/);
    return match ? match[1] : '';
}
