"use strict";
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
exports.FileProcessing = void 0;
var diff_formats_1 = require("../../../agents/diff-formats");
/**
 * File processing utilities
 * Handles content cleaning, diff application, and file metadata
 */
var FileProcessing = /** @class */ (function () {
    function FileProcessing() {
    }
    /**
     * Remove code block markers from file contents
     */
    FileProcessing.cleanFileContents = function (fileContents) {
        var cleanedContents = fileContents;
        if (fileContents.startsWith('```')) {
            // Ignore the first line if it starts with ```
            cleanedContents = fileContents.split('\n').slice(1).join('\n');
        }
        if (cleanedContents.endsWith('```')) {
            // Ignore the last line if it ends with ```
            cleanedContents = cleanedContents.split('\n').slice(0, -1).join('\n');
        }
        return cleanedContents;
    };
    /**
     * Process generated file contents
     * Applies diffs or returns cleaned content
     */
    FileProcessing.processGeneratedFileContents = function (generatedFile, originalContents, logger) {
        var cleanedContents = FileProcessing.cleanFileContents(generatedFile.fileContents);
        // File contents can either be raw or in unified diff format
        if (generatedFile.format === 'unified_diff') {
            logger === null || logger === void 0 ? void 0 : logger.info("Applying unified diff to file: ".concat(generatedFile.filePath));
            if (originalContents) {
                logger === null || logger === void 0 ? void 0 : logger.info("Valid file contents found for ".concat(generatedFile.filePath, ", applying diff"));
            }
            else {
                logger === null || logger === void 0 ? void 0 : logger.warn("No valid file contents found for ".concat(generatedFile.filePath, ", but diff was generated"));
            }
            logger === null || logger === void 0 ? void 0 : logger.info("Diff for ".concat(generatedFile.filePath, ": "), cleanedContents);
            try {
                return (0, diff_formats_1.applyUnifiedDiff)(originalContents, cleanedContents);
            }
            catch (error) {
                logger === null || logger === void 0 ? void 0 : logger.error("Error applying diff to file ".concat(generatedFile.filePath, ":"), error);
                return originalContents;
            }
        }
        logger === null || logger === void 0 ? void 0 : logger.info("Setting file contents to cleaned contents ".concat(generatedFile.filePath));
        return cleanedContents;
    };
    /**
     * Find file purpose from phase or generated files
     */
    FileProcessing.findFilePurpose = function (filePath, phase, generatedFilesMap) {
        // First search in the current phase
        var phaseFile = phase.files.find(function (file) { return file.path === filePath; });
        if (phaseFile === null || phaseFile === void 0 ? void 0 : phaseFile.purpose) {
            return phaseFile.purpose;
        }
        // Then search in previously generated files
        var generatedFile = generatedFilesMap[filePath];
        if (generatedFile) {
            return generatedFile.filePurpose;
        }
        return "";
    };
    /**
     * Get all files combining template and generated files
     * Template files are overridden by generated files with same path
     */
    FileProcessing.getAllFiles = function (templateDetails, generatedFilesMap) {
        var templateFiles = (templateDetails === null || templateDetails === void 0 ? void 0 : templateDetails.files.map(function (file) { return ({
            filePath: file.filePath,
            fileContents: file.fileContents,
            filePurpose: 'Boilerplate template file'
        }); })) || [];
        // Filter out template files that have been overridden by generated files
        var nonOverriddenTemplateFiles = templateFiles.filter(function (file) { return !generatedFilesMap[file.filePath]; });
        return __spreadArray(__spreadArray([], nonOverriddenTemplateFiles, true), Object.values(generatedFilesMap), true);
    };
    return FileProcessing;
}());
exports.FileProcessing = FileProcessing;
