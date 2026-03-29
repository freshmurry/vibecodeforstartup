"use strict";
/**
 * Pure functions for dependency management
 * No side effects, handles package.json and dependency merging
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
exports.DependencyManagement = void 0;
var DependencyManagement = /** @class */ (function () {
    function DependencyManagement() {
    }
    /**
     * Merge dependencies from template and package.json
     * Preserves exact behavior from original implementation
     */
    DependencyManagement.mergeDependencies = function (templateDeps, lastPackageJson, logger) {
        if (templateDeps === void 0) { templateDeps = {}; }
        var deps = __assign({}, templateDeps);
        // Add additional dependencies from the last package.json
        if (lastPackageJson) {
            try {
                var parsedPackageJson = JSON.parse(lastPackageJson);
                var packageDeps = parsedPackageJson.dependencies;
                if (packageDeps) {
                    Object.assign(deps, packageDeps);
                    logger === null || logger === void 0 ? void 0 : logger.info("Adding dependencies from last package.json: ".concat(Object.keys(packageDeps).join(', ')));
                }
            }
            catch (error) {
                logger === null || logger === void 0 ? void 0 : logger.warn('Failed to parse lastPackageJson:', error);
            }
        }
        return deps;
    };
    /**
     * Extract dependencies from package.json string
     */
    DependencyManagement.extractDependenciesFromPackageJson = function (packageJson) {
        try {
            var parsed = JSON.parse(packageJson);
            return parsed.dependencies || {};
        }
        catch (_a) {
            return {};
        }
    };
    /**
     * Format dependency list for display
     */
    DependencyManagement.formatDependencyList = function (deps) {
        return Object.entries(deps)
            .map(function (_a) {
            var name = _a[0], version = _a[1];
            return "".concat(name, "@").concat(version);
        })
            .join(', ');
    };
    return DependencyManagement;
}());
exports.DependencyManagement = DependencyManagement;
