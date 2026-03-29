"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssueReport = void 0;
/**
 * Immutable report of issues found during code generation
 * Includes runtime errors, static analysis results, and client errors
 */
var IssueReport = /** @class */ (function () {
    function IssueReport(runtimeErrors, staticAnalysis, clientErrors) {
        this.runtimeErrors = runtimeErrors;
        this.staticAnalysis = staticAnalysis;
        this.clientErrors = clientErrors;
        // Freeze to ensure immutability
        Object.freeze(this);
        Object.freeze(this.runtimeErrors);
        Object.freeze(this.staticAnalysis);
        Object.freeze(this.clientErrors);
    }
    /**
     * Create report from all issues
     */
    IssueReport.from = function (issues) {
        return new IssueReport(issues.runtimeErrors || [], issues.staticAnalysis || { success: false, lint: { issues: [] }, typecheck: { issues: [] } }, issues.clientErrors || []);
    };
    /**
     * Check if there are any issues
     */
    IssueReport.prototype.hasIssues = function () {
        return this.hasRuntimeErrors() || this.hasStaticAnalysisIssues() || this.hasClientErrors();
    };
    /**
     * Check if there are runtime errors
     */
    IssueReport.prototype.hasRuntimeErrors = function () {
        return this.runtimeErrors.length > 0;
    };
    /**
     * Check if there are static analysis issues
     */
    IssueReport.prototype.hasStaticAnalysisIssues = function () {
        var _a, _b, _c, _d;
        var lintIssues = ((_b = (_a = this.staticAnalysis.lint) === null || _a === void 0 ? void 0 : _a.issues) === null || _b === void 0 ? void 0 : _b.length) || 0;
        var typecheckIssues = ((_d = (_c = this.staticAnalysis.typecheck) === null || _c === void 0 ? void 0 : _c.issues) === null || _d === void 0 ? void 0 : _d.length) || 0;
        return lintIssues > 0 || typecheckIssues > 0;
    };
    /**
     * Check if there are client errors
     */
    IssueReport.prototype.hasClientErrors = function () {
        return this.clientErrors.length > 0;
    };
    /**
     * Get total issue count
     */
    IssueReport.prototype.getTotalIssueCount = function () {
        var _a, _b, _c, _d;
        var runtimeCount = this.runtimeErrors.length;
        var lintCount = ((_b = (_a = this.staticAnalysis.lint) === null || _a === void 0 ? void 0 : _a.issues) === null || _b === void 0 ? void 0 : _b.length) || 0;
        var typecheckCount = ((_d = (_c = this.staticAnalysis.typecheck) === null || _c === void 0 ? void 0 : _c.issues) === null || _d === void 0 ? void 0 : _d.length) || 0;
        var clientCount = this.clientErrors.length;
        return runtimeCount + lintCount + typecheckCount + clientCount;
    };
    /**
     * Get a summary of all issues
     */
    IssueReport.prototype.getSummary = function () {
        var _a, _b, _c, _d;
        var parts = [];
        if (this.runtimeErrors.length > 0) {
            parts.push("".concat(this.runtimeErrors.length, " runtime errors"));
        }
        var lintCount = ((_b = (_a = this.staticAnalysis.lint) === null || _a === void 0 ? void 0 : _a.issues) === null || _b === void 0 ? void 0 : _b.length) || 0;
        if (lintCount > 0) {
            parts.push("".concat(lintCount, " lint issues"));
        }
        var typecheckCount = ((_d = (_c = this.staticAnalysis.typecheck) === null || _c === void 0 ? void 0 : _c.issues) === null || _d === void 0 ? void 0 : _d.length) || 0;
        if (typecheckCount > 0) {
            parts.push("".concat(typecheckCount, " type errors"));
        }
        if (this.clientErrors.length > 0) {
            parts.push("".concat(this.clientErrors.length, " client errors"));
        }
        return parts.length > 0 ? parts.join(', ') : 'No issues found';
    };
    /**
     * Create an empty issue report
     */
    IssueReport.empty = function () {
        return new IssueReport([], { success: true, lint: { issues: [] }, typecheck: { issues: [] } }, []);
    };
    return IssueReport;
}());
exports.IssueReport = IssueReport;
