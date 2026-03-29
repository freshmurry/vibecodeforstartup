"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerationContext = void 0;
var DependencyManagement_1 = require("../pure/DependencyManagement");
var FileProcessing_1 = require("../pure/FileProcessing");
/**
 * Immutable context for code generation operations
 * Contains all necessary data for generating code
 */
var GenerationContext = /** @class */ (function () {
    function GenerationContext(query, blueprint, templateDetails, dependencies, allFiles, generatedPhases, commandsHistory) {
        this.query = query;
        this.blueprint = blueprint;
        this.templateDetails = templateDetails;
        this.dependencies = dependencies;
        this.allFiles = allFiles;
        this.generatedPhases = generatedPhases;
        this.commandsHistory = commandsHistory;
        // Freeze to ensure immutability
        Object.freeze(this);
        Object.freeze(this.dependencies);
        Object.freeze(this.allFiles);
        Object.freeze(this.generatedPhases);
        Object.freeze(this.commandsHistory);
    }
    /**
     * Create context from current state
     */
    GenerationContext.from = function (state, logger) {
        var _a;
        var dependencies = DependencyManagement_1.DependencyManagement.mergeDependencies(((_a = state.templateDetails) === null || _a === void 0 ? void 0 : _a.deps) || {}, state.lastPackageJson, logger);
        var allFiles = FileProcessing_1.FileProcessing.getAllFiles(state.templateDetails, state.generatedFilesMap);
        return new GenerationContext(state.query, state.blueprint, state.templateDetails, dependencies, allFiles, state.generatedPhases, state.commandsHistory || []);
    };
    /**
     * Get formatted phases for prompt generation
     */
    GenerationContext.prototype.getCompletedPhases = function () {
        return Object.values(this.generatedPhases.filter(function (phase) { return phase.completed; }));
    };
    return GenerationContext;
}());
exports.GenerationContext = GenerationContext;
