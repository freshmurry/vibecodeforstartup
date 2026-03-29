"use strict";
/**
 * Module detection and validation utilities
 * Centralized logic for determining external vs internal modules
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
exports.isExternalModule = isExternalModule;
exports.canModifyFile = canModifyFile;
exports.resolveModuleFile = resolveModuleFile;
exports.canModifyTargetFile = canModifyTargetFile;
exports.validateModuleOperation = validateModuleOperation;
exports.getModuleType = getModuleType;
var imports_1 = require("./imports");
var paths_1 = require("./paths");
// ============================================================================
// EXTERNAL MODULE DETECTION
// ============================================================================
/**
 * Determine if a module specifier is an external package (npm module)
 * that we should NOT attempt to modify
 */
function isExternalModule(moduleSpecifier) {
    // Local module patterns (relative paths and path aliases)
    if (moduleSpecifier.startsWith('./') ||
        moduleSpecifier.startsWith('../') ||
        moduleSpecifier.startsWith('@/') ||
        moduleSpecifier.startsWith('src/')) {
        return false;
    }
    // Check if it looks like a file path (has extension or path segments within src)
    if (moduleSpecifier.includes('/') &&
        (moduleSpecifier.includes('.') || moduleSpecifier.includes('src/'))) {
        return false;
    }
    // Everything else is considered an external package
    return true;
}
/**
 * Check if a file path is within the project boundaries and can be modified
 */
function canModifyFile(filePath) {
    // Only allow modification of files in the project directory
    // Exclude node_modules and other external directories
    if (filePath.includes('node_modules/') ||
        filePath.includes('.git/') ||
        filePath.startsWith('/') && !filePath.startsWith('/app/') && !filePath.startsWith('/Users/')) {
        return false;
    }
    // Must be a script file we can modify
    var scriptExtensions = ['.ts', '.tsx', '.js', '.jsx'];
    return scriptExtensions.some(function (ext) { return filePath.endsWith(ext); });
}
// ============================================================================
// MODULE FILE RESOLUTION
// ============================================================================
/**
 * Resolve a module specifier to an actual file path within the project
 * Unified resolution logic used by all fixers
 */
function resolveModuleFile(moduleSpecifier, fromFilePath, context) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Skip external modules - we cannot modify them
                    if (isExternalModule(moduleSpecifier)) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, (0, paths_1.findModuleFile)(moduleSpecifier, fromFilePath, context.files, context.fileFetcher, context.fetchedFiles)];
                case 1: 
                // Use existing findModuleFile logic for internal modules
                return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 * Check if a target file exists and can be modified
 */
function canModifyTargetFile(targetFilePath, context) {
    return __awaiter(this, void 0, void 0, function () {
        var content, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!canModifyFile(targetFilePath)) {
                        return [2 /*return*/, false];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, imports_1.getFileContent)(targetFilePath, context.files, context.fileFetcher, context.fetchedFiles)];
                case 2:
                    content = _b.sent();
                    return [2 /*return*/, content !== null];
                case 3:
                    _a = _b.sent();
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// ============================================================================
// VALIDATION HELPERS
// ============================================================================
/**
 * Validate that a module operation is safe and allowed
 */
function validateModuleOperation(moduleSpecifier, targetFilePath) {
    // Check if it's an external module we shouldn't touch
    if (isExternalModule(moduleSpecifier)) {
        return {
            valid: false,
            reason: "External package \"".concat(moduleSpecifier, "\" should be handled by package manager")
        };
    }
    // Check if target file is within allowed boundaries
    if (targetFilePath && !canModifyFile(targetFilePath)) {
        return {
            valid: false,
            reason: "Target file \"".concat(targetFilePath, "\" is outside project boundaries")
        };
    }
    return { valid: true };
}
/**
 * Get module type for logging and error reporting
 */
function getModuleType(moduleSpecifier) {
    if (isExternalModule(moduleSpecifier)) {
        return 'external';
    }
    if (moduleSpecifier.startsWith('./') || moduleSpecifier.startsWith('../')) {
        return 'relative';
    }
    if (moduleSpecifier.startsWith('@/')) {
        return 'alias';
    }
    return 'absolute';
}
