"use strict";
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
exports.FileManager = void 0;
var FileProcessing_1 = require("../../domain/pure/FileProcessing");
/**
 * Manages file operations for code generation
 * Handles both template and generated files
 */
var FileManager = /** @class */ (function () {
    function FileManager(stateManager) {
        this.stateManager = stateManager;
    }
    FileManager.prototype.getTemplateFile = function (path) {
        var _a, _b;
        var state = this.stateManager.getState();
        return ((_b = (_a = state.templateDetails) === null || _a === void 0 ? void 0 : _a.files) === null || _b === void 0 ? void 0 : _b.find(function (file) { return file.filePath === path; })) || null;
    };
    FileManager.prototype.getGeneratedFile = function (path) {
        var state = this.stateManager.getState();
        return state.generatedFilesMap[path] || null;
    };
    FileManager.prototype.getAllFiles = function () {
        var state = this.stateManager.getState();
        return FileProcessing_1.FileProcessing.getAllFiles(state.templateDetails, state.generatedFilesMap);
    };
    FileManager.prototype.saveGeneratedFile = function (file) {
        var _a;
        var state = this.stateManager.getState();
        this.stateManager.setState(__assign(__assign({}, state), { generatedFilesMap: __assign(__assign({}, state.generatedFilesMap), (_a = {}, _a[file.filePath] = __assign(__assign({}, file), { last_hash: '', last_modified: Date.now(), unmerged: [] }), _a)) }));
    };
    FileManager.prototype.saveGeneratedFiles = function (files) {
        var state = this.stateManager.getState();
        var newFilesMap = __assign({}, state.generatedFilesMap);
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            newFilesMap[file.filePath] = __assign(__assign({}, file), { last_hash: '', last_modified: Date.now(), unmerged: [] });
        }
        this.stateManager.setState(__assign(__assign({}, state), { generatedFilesMap: newFilesMap }));
    };
    FileManager.prototype.deleteFiles = function (filePaths) {
        var state = this.stateManager.getState();
        var newFilesMap = __assign({}, state.generatedFilesMap);
        for (var _i = 0, filePaths_1 = filePaths; _i < filePaths_1.length; _i++) {
            var filePath = filePaths_1[_i];
            delete newFilesMap[filePath];
        }
        this.stateManager.setState(__assign(__assign({}, state), { generatedFilesMap: newFilesMap }));
    };
    FileManager.prototype.getFile = function (path) {
        var generatedFile = this.getGeneratedFile(path);
        if (generatedFile) {
            return generatedFile;
        }
        var templateFile = this.getTemplateFile(path);
        if (!templateFile) {
            return null;
        }
        return __assign(__assign({}, templateFile), { filePurpose: 'Template file' });
    };
    FileManager.prototype.getFileContents = function (path) {
        var generatedFile = this.getGeneratedFile(path);
        if (generatedFile) {
            return generatedFile.fileContents;
        }
        var templateFile = this.getTemplateFile(path);
        return (templateFile === null || templateFile === void 0 ? void 0 : templateFile.fileContents) || '';
    };
    FileManager.prototype.fileExists = function (path) {
        return !!this.getGeneratedFile(path) || !!this.getTemplateFile(path);
    };
    FileManager.prototype.getGeneratedFilePaths = function () {
        var state = this.stateManager.getState();
        return Object.keys(state.generatedFilesMap);
    };
    FileManager.prototype.getTemplateDetails = function () {
        var state = this.stateManager.getState();
        return state.templateDetails;
    };
    FileManager.prototype.getGeneratedFilesMap = function () {
        var state = this.stateManager.getState();
        return state.generatedFilesMap;
    };
    FileManager.prototype.getGeneratedFiles = function () {
        var state = this.stateManager.getState();
        return Object.values(state.generatedFilesMap);
    };
    return FileManager;
}());
exports.FileManager = FileManager;
