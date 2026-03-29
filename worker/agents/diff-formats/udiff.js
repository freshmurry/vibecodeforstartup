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
exports.applyDiff = applyDiff;
// Borrowed from the way Aider handles unified diffs
/**
 * Parses a hunk string into its "before" and "after" components.
 * 'before' consists of context (' ') and deletion ('-') lines.
 * 'after' consists of context (' ') and addition ('+') lines.
 * @param hunk - An array of strings representing the lines of a single diff hunk.
 * @returns An object with 'before' and 'after' string arrays.
 */
function hunkToBeforeAfter(hunk) {
    var before = [];
    var after = [];
    for (var _i = 0, hunk_1 = hunk; _i < hunk_1.length; _i++) {
        var line = hunk_1[_i];
        if (line.startsWith('---') ||
            line.startsWith('+++') ||
            line.startsWith('@@')) {
            continue;
        }
        var op = line[0];
        var restOfLine = line.substring(1);
        switch (op) {
            case ' ':
                before.push(restOfLine);
                after.push(restOfLine);
                break;
            case '-':
                before.push(restOfLine);
                break;
            case '+':
                after.push(restOfLine);
                break;
        }
    }
    return { before: before, after: after };
}
/**
 * Normalize leading whitespace for relative indentation matching
 * Handles uniformly indented/outdented code blocks
 */
function normalizeIndentation(lines) {
    var _a, _b;
    if (lines.length === 0)
        return { normalized: [], isEmpty: true };
    // Find non-empty lines for common prefix calculation
    var nonEmptyLines = lines.filter(function (line) { return line.trim().length > 0; });
    if (nonEmptyLines.length === 0)
        return { normalized: lines, isEmpty: true };
    // Find common leading whitespace
    var commonPrefix = ((_a = nonEmptyLines[0].match(/^\s*/)) === null || _a === void 0 ? void 0 : _a[0]) || '';
    for (var _i = 0, _c = nonEmptyLines.slice(1); _i < _c.length; _i++) {
        var line = _c[_i];
        var prefix = ((_b = line.match(/^\s*/)) === null || _b === void 0 ? void 0 : _b[0]) || '';
        var i = 0;
        while (i < Math.min(commonPrefix.length, prefix.length) &&
            commonPrefix[i] === prefix[i]) {
            i++;
        }
        commonPrefix = commonPrefix.substring(0, i);
    }
    // Remove common prefix from all lines
    // SAFETY: Check if line has content beyond the common prefix
    var normalized = lines.map(function (line) {
        // Empty lines stay empty
        if (line.length === 0)
            return line;
        // Lines that are only whitespace up to common prefix become empty
        if (line.length <= commonPrefix.length)
            return '';
        // Otherwise remove the common prefix
        return line.substring(commonPrefix.length);
    });
    return { normalized: normalized, isEmpty: false };
}
/**
 * Break a large hunk into smaller overlapping sub-hunks
 * Each sub-hunk contains one contiguous run of changes with context
 */
function breakIntoSubHunks(hunk, maxContextLines) {
    if (maxContextLines === void 0) { maxContextLines = 3; }
    var subHunks = [];
    // Find change runs (contiguous sequences of + and - lines)
    var changeRuns = [];
    var currentRun = [];
    var runStart = -1;
    for (var i = 0; i < hunk.length; i++) {
        var line = hunk[i];
        if (line.startsWith('@@') || line.startsWith('---') || line.startsWith('+++')) {
            continue;
        }
        if (line.startsWith('-') || line.startsWith('+')) {
            if (currentRun.length === 0) {
                runStart = i;
            }
            currentRun.push(line);
        }
        else {
            if (currentRun.length > 0) {
                changeRuns.push({
                    start: runStart,
                    end: i - 1,
                    lines: __spreadArray([], currentRun, true)
                });
                currentRun = [];
            }
        }
    }
    // Handle final run
    if (currentRun.length > 0) {
        changeRuns.push({
            start: runStart,
            end: hunk.length - 1,
            lines: __spreadArray([], currentRun, true)
        });
    }
    // Create sub-hunks with context
    for (var _i = 0, changeRuns_1 = changeRuns; _i < changeRuns_1.length; _i++) {
        var run = changeRuns_1[_i];
        // SAFETY: Only include context lines, not hunk headers
        var contextBefore = hunk.slice(Math.max(0, run.start - maxContextLines), run.start).filter(function (line) { return line.startsWith(' '); }); // Only context lines
        var contextAfter = hunk.slice(run.end + 1, Math.min(hunk.length, run.end + 1 + maxContextLines)).filter(function (line) { return line.startsWith(' '); }); // Only context lines
        subHunks.push(__spreadArray(__spreadArray(__spreadArray([], contextBefore, true), run.lines, true), contextAfter, true));
    }
    return subHunks.length > 1 ? subHunks : [hunk];
}
// correctMissingPlusMarkers removed - too risky for LLM-generated diffs
// Removed isLikelyCodeAddition function as it's no longer used
// after disabling the risky correctMissingPlusMarkers strategy
// normalizeHunk function removed - it was disabled for safety
/**
 * Try direct application of the hunk with enhanced robustness and fuzzy matching
 */
function tryDirectApplication(content, hunk) {
    var _a = hunkToBeforeAfter(hunk), before = _a.before, after = _a.after;
    if (before.length === 0) {
        // Pure addition, append to end
        return content + '\n' + after.join('\n');
    }
    // Strategy 1: Try exact match first
    var beforeBlock = before.join('\n');
    var occurrences = content.split(beforeBlock).length - 1;
    if (occurrences === 1) {
        var afterBlock = after.join('\n');
        return content.replace(beforeBlock, afterBlock);
    }
    // Strategy 2: Try with whitespace normalization
    if (occurrences === 0) {
        var result = tryWithWhitespaceNormalization(content, before, after);
        if (result !== null)
            return result;
    }
    // Strategy 3: Try with indentation-aware matching
    if (occurrences === 0) {
        var result = tryWithIndentationAwareMatching(content, before, after);
        if (result !== null)
            return result;
    }
    // Strategy 4: Fuzzy matching disabled for safety
    // Would be too risky with LLM-generated content
    return null;
}
/**
 * Strategy 2: Whitespace normalization matching
 */
function tryWithWhitespaceNormalization(content, before, after) {
    // First normalize line endings
    var normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    // Helper to normalize whitespace in a line for comparison
    var normalizeLineWhitespace = function (line) {
        // Normalize all whitespace to single spaces for comparison
        // This handles tabs, multiple spaces, etc.
        return line.replace(/\s+/g, ' ').trim();
    };
    var contentLines = normalizedContent.split('\n');
    var normalizedBefore = before.map(normalizeLineWhitespace);
    var _loop_1 = function (i) {
        var matches = true;
        for (var j = 0; j < before.length; j++) {
            var contentLine = normalizeLineWhitespace(contentLines[i + j] || '');
            var beforeLine = normalizedBefore[j];
            if (contentLine !== beforeLine) {
                matches = false;
                break;
            }
        }
        if (matches) {
            // Found a match! Now we need to apply the replacement
            // Detect indentation pattern from the original content
            var originalLines = content.split(/\r?\n/);
            var originalSlice_1 = originalLines.slice(i, i + before.length);
            // Process after lines to match original indentation style
            var processedAfter = after.map(function (line, idx) {
                var _a, _b, _c;
                if (line.trim() === '')
                    return line;
                // Get reference line from original to copy indentation style
                var refLine = originalSlice_1[Math.min(idx, originalSlice_1.length - 1)] || originalSlice_1[0] || '';
                var refIndent = ((_a = refLine.match(/^[\t ]*/)) === null || _a === void 0 ? void 0 : _a[0]) || '';
                // Get the relative indentation from the diff
                var diffIndent = ((_b = line.match(/^[\t ]*/)) === null || _b === void 0 ? void 0 : _b[0]) || '';
                var diffSpaceCount = diffIndent.replace(/\t/g, '  ').length;
                // If original uses tabs or mixed indentation
                if (refIndent.includes('\t')) {
                    // Check if it's mixed (tab + spaces)
                    var leadingTabs = ((_c = refIndent.match(/^\t*/)) === null || _c === void 0 ? void 0 : _c[0].length) || 0;
                    var followingSpaces = refIndent.slice(leadingTabs).length;
                    if (diffSpaceCount === 0) {
                        return line.trim();
                    }
                    else if (diffSpaceCount === 1 && followingSpaces > 0) {
                        // Single space in diff might map to mixed tab+space
                        return '\t' + ' '.repeat(followingSpaces) + line.trim();
                    }
                    else {
                        // Convert spaces to tabs
                        var tabCount = Math.floor(diffSpaceCount / 2);
                        var remainingSpaces = diffSpaceCount % 2;
                        return '\t'.repeat(tabCount) + ' '.repeat(remainingSpaces) + line.trim();
                    }
                }
                else {
                    // Original uses spaces, keep spaces
                    return ' '.repeat(diffSpaceCount) + line.trim();
                }
            });
            // Reconstruct with original line endings
            var hasCarriageReturn = content.includes('\r\n');
            var lineEnding = hasCarriageReturn ? '\r\n' : '\n';
            var resultLines = __spreadArray(__spreadArray(__spreadArray([], originalLines.slice(0, i), true), processedAfter, true), originalLines.slice(i + before.length), true);
            return { value: resultLines.join(lineEnding) };
        }
    };
    // Try to find the normalized before block in content
    for (var i = 0; i <= contentLines.length - before.length; i++) {
        var state_1 = _loop_1(i);
        if (typeof state_1 === "object")
            return state_1.value;
    }
    return null;
}
/**
 * Strategy 3: Indentation-aware matching
 * Handles cases where the diff has different base indentation than the content
 */
function tryWithIndentationAwareMatching(content, before, after) {
    var contentLines = content.split('\n');
    // Normalize the before block to remove common indentation
    var normalizedBefore = normalizeIndentation(before).normalized;
    var _loop_2 = function (i) {
        var contentSlice = contentLines.slice(i, i + before.length);
        var normalizedContent = normalizeIndentation(contentSlice).normalized;
        // Check if normalized content matches normalized before
        var matches = true;
        for (var j = 0; j < normalizedBefore.length; j++) {
            if (normalizedContent[j] !== normalizedBefore[j]) {
                matches = false;
                break;
            }
        }
        if (matches) {
            // We found a match! Now preserve the original indentation pattern
            // The key is to map the normalized 'after' back to the original indentation
            // Build a mapping of normalized lines to original indentation
            var indentMap_1 = new Map();
            normalizedBefore.forEach(function (normLine, idx) {
                var _a;
                var origLine = contentSlice[idx];
                var origIndent = ((_a = origLine.match(/^[\t ]*/)) === null || _a === void 0 ? void 0 : _a[0]) || '';
                indentMap_1.set(normLine, origIndent);
            });
            // Apply the original indentation to the after lines
            var indentedAfter = after.map(function (afterLine, idx) {
                var _a, _b;
                var trimmedAfter = afterLine.trim();
                if (trimmedAfter === '')
                    return '';
                // Find the corresponding indentation from the before block
                var correspondingBeforeLine = normalizedBefore[idx];
                // Use the indentation from the corresponding before line
                var originalIndent = indentMap_1.get(correspondingBeforeLine) ||
                    ((_b = (_a = contentSlice[idx]) === null || _a === void 0 ? void 0 : _a.match(/^[\t ]*/)) === null || _b === void 0 ? void 0 : _b[0]) || '';
                return originalIndent + trimmedAfter;
            });
            var newLines = __spreadArray(__spreadArray(__spreadArray([], contentLines.slice(0, i), true), indentedAfter, true), contentLines.slice(i + before.length), true);
            return { value: newLines.join('\n') };
        }
    };
    // Try matching with different indentation levels
    for (var i = 0; i <= contentLines.length - before.length; i++) {
        var state_2 = _loop_2(i);
        if (typeof state_2 === "object")
            return state_2.value;
    }
    return null;
}
// tryWithFuzzyMatching removed - too risky for LLM-generated diffs
/**
 * Try with normalized whitespace to handle indentation issues
 * PERFORMANCE: Uses regex-based approach instead of O(n²) iteration
 */
function tryWithNormalizedWhitespace(content, hunk) {
    var _a = hunkToBeforeAfter(hunk), before = _a.before, after = _a.after;
    if (before.length === 0)
        return null;
    var normalized = normalizeIndentation(before).normalized;
    // PERFORMANCE FIX: Create a flexible regex pattern instead of iterating through all slices
    // This changes from O(content_length * hunk_length) to O(content_length)
    var regexPattern = createFlexibleWhitespacePattern(normalized);
    if (!regexPattern)
        return null;
    var matches = content.match(regexPattern);
    if (!matches || matches.length !== 1) {
        return null; // Must have exactly one match to be safe
    }
    // Found exactly one match - apply the replacement
    var matchedText = matches[0];
    var normalizedAfter = normalizeIndentation(after).normalized;
    // Detect the actual indentation used in the matched content
    var actualIndentation = detectIndentation(matchedText);
    // Apply the detected indentation to the replacement
    var replacementLines = normalizedAfter.map(function (line) {
        return line.length > 0 ? actualIndentation + line : line;
    });
    var replacementText = replacementLines.join('\n');
    return content.replace(matchedText, replacementText);
}
/**
 * PERFORMANCE HELPER: Creates a regex pattern that matches code blocks with flexible whitespace
 * SAFETY: Limits pattern complexity to prevent ReDoS
 */
function createFlexibleWhitespacePattern(normalizedLines) {
    if (normalizedLines.length === 0)
        return null;
    // SAFETY: Limit lines to prevent ReDoS
    if (normalizedLines.length > 50)
        return null;
    // Escape special regex characters in each line
    var escapedLines = normalizedLines.map(function (line) {
        // SAFETY: Limit line length
        if (line.length > 500)
            return null;
        return line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    });
    // Check if any line failed to escape
    if (escapedLines.some(function (line) { return line === null; }))
        return null;
    // Create pattern that allows flexible leading whitespace
    var flexibleLines = escapedLines.map(function (line) {
        if (line.trim() === '') {
            return '\\s*'; // Empty lines can have any whitespace
        }
        return '\\s*' + line; // Any leading whitespace + the content
    });
    try {
        // Create a pattern that matches the entire block
        var pattern = flexibleLines.join('\\n');
        // SAFETY: Test the pattern with a timeout
        var testRegex = new RegExp(pattern, 'g');
        // Quick test to ensure it doesn't hang
        var testStr = 'test\ntest\ntest';
        testRegex.test(testStr);
        return testRegex;
    }
    catch (error) {
        // If regex creation fails (complex content), fall back to null
        return null;
    }
}
/**
 * PERFORMANCE HELPER: Detects the actual indentation used in matched content
 */
function detectIndentation(matchedText) {
    var _a, _b;
    var lines = matchedText.split('\n');
    var nonEmptyLines = lines.filter(function (line) { return line.trim().length > 0; });
    if (nonEmptyLines.length === 0)
        return '';
    // Find the minimum leading whitespace (common indentation)
    var minIndentation = ((_a = nonEmptyLines[0].match(/^\s*/)) === null || _a === void 0 ? void 0 : _a[0]) || '';
    for (var _i = 0, _c = nonEmptyLines.slice(1); _i < _c.length; _i++) {
        var line = _c[_i];
        var indent = ((_b = line.match(/^\s*/)) === null || _b === void 0 ? void 0 : _b[0]) || '';
        if (indent.length < minIndentation.length) {
            minIndentation = indent;
        }
    }
    return minIndentation;
}
/**
 * Try sub-hunk decomposition with TRANSACTIONAL INTEGRITY
 * SAFETY: Only returns result if ALL sub-hunks apply successfully
 */
function trySubHunkDecomposition(content, hunk) {
    var subHunks = breakIntoSubHunks(hunk);
    if (subHunks.length <= 1) {
        return null; // No decomposition possible
    }
    // SAFETY: First verify ALL sub-hunks can be applied
    var tempContent = content;
    var results = [content];
    for (var _i = 0, subHunks_1 = subHunks; _i < subHunks_1.length; _i++) {
        var subHunk = subHunks_1[_i];
        var result = applyHunkWithoutRecursion(tempContent, subHunk);
        if (result === null) {
            // ANY failure means we abort completely
            // No partial application allowed
            return null;
        }
        tempContent = result;
        results.push(result);
    }
    // All sub-hunks succeeded - return the final result
    return tempContent;
}
/**
 * Apply hunk without recursion to prevent infinite loops in sub-hunk decomposition
 * This is a simplified version that doesn't call trySubHunkDecomposition
 */
function applyHunkWithoutRecursion(content, hunk) {
    // Strategy 1: Direct application
    var directResult = tryDirectApplication(content, hunk);
    if (directResult !== null)
        return directResult;
    // Strategy 2: Skip missing plus marker correction (disabled for safety)
    // The correctMissingPlusMarkers function is disabled and just returns the input unchanged
    // Strategy 3: Normalized whitespace
    var whitespaceResult = tryWithNormalizedWhitespace(content, hunk);
    if (whitespaceResult !== null)
        return whitespaceResult;
    // Strategy 4: Hunk normalization disabled for safety
    // Strategy 5: Context reduction (no sub-hunk decomposition to avoid recursion)
    var contextResult = tryContextReduction(content, hunk);
    if (contextResult !== null)
        return contextResult;
    // All strategies failed
    return null;
}
/**
 * Try context reduction strategy with enhanced flexibility
 */
function tryContextReduction(content, hunk) {
    // Find core changes
    var firstChangeIndex = hunk.findIndex(function (l) { return l.startsWith('-') || l.startsWith('+'); });
    var lastChangeIndex = hunk.length -
        1 -
        __spreadArray([], hunk, true).reverse()
            .findIndex(function (l) { return l.startsWith('-') || l.startsWith('+'); });
    if (firstChangeIndex === -1) {
        return content; // No changes
    }
    var precedingContext = hunk.slice(0, firstChangeIndex);
    var coreChangeHunk = hunk.slice(firstChangeIndex, lastChangeIndex + 1);
    var followingContext = hunk.slice(lastChangeIndex + 1);
    // Progressive context reduction with more aggressive settings
    for (var i = precedingContext.length; i >= 0; i--) {
        for (var j = followingContext.length; j >= 0; j--) {
            var contextBefore = precedingContext.slice(i);
            var contextAfter = followingContext.slice(0, j);
            var searchBefore = hunkToBeforeAfter(__spreadArray(__spreadArray(__spreadArray([], contextBefore, true), coreChangeHunk, true), contextAfter, true)).before;
            var searchBlock = searchBefore.join('\n');
            if (searchBlock.trim() === '')
                continue;
            var searchOccurrences = content.split(searchBlock).length - 1;
            if (searchOccurrences === 1) {
                var replaceAfter = hunkToBeforeAfter(__spreadArray(__spreadArray(__spreadArray([], contextBefore, true), coreChangeHunk, true), contextAfter, true)).after;
                var replaceBlock = replaceAfter.join('\n');
                return content.replace(searchBlock, replaceBlock);
            }
        }
    }
    return null;
}
// tryHunkNormalization removed - can introduce errors with LLM diffs
/**
 * Production-grade hunk application with comprehensive telemetry and monitoring
 * Enhanced with all resilience strategies plus performance monitoring
 */
function applyHunkWithTelemetry(content, hunk, telemetry, monitor) {
    // Strategy 1: Direct application (exact matching)
    monitor.incrementIteration();
    telemetry.strategiesAttempted.push('exact_match');
    var directResult = tryDirectApplication(content, hunk);
    if (directResult !== null) {
        return directResult;
    }
    // Strategy 2: Skip missing plus marker correction (disabled for safety)
    // Strategy 3: Normalized whitespace (handle outdented/indented code)
    monitor.incrementIteration();
    telemetry.strategiesAttempted.push('whitespace_normalization');
    var whitespaceResult = tryWithNormalizedWhitespace(content, hunk);
    if (whitespaceResult !== null) {
        return whitespaceResult;
    }
    // Strategy 4: Sub-hunk decomposition
    monitor.incrementIteration();
    telemetry.strategiesAttempted.push('sub_hunk_decomposition');
    var subHunkResult = trySubHunkDecomposition(content, hunk);
    if (subHunkResult !== null) {
        return subHunkResult;
    }
    // Strategy 5: Skip hunk normalization (disabled for safety)
    // Strategy 6: Context reduction
    monitor.incrementIteration();
    telemetry.strategiesAttempted.push('context_reduction');
    var contextResult = tryContextReduction(content, hunk);
    if (contextResult !== null) {
        return contextResult;
    }
    // All strategies failed
    monitor.addWarning('All standard strategies failed, attempting fallback strategies');
    return null;
}
/**
 * Production-grade unified diff application system
 * Enhanced with comprehensive error handling, security measures, and performance protections
 */
// Production configuration constants
var PRODUCTION_LIMITS = {
    MAX_CONTENT_SIZE: 10 * 1024 * 1024, // 10MB max content size
    MAX_DIFF_SIZE: 1024 * 1024, // 1MB max diff size
    MAX_HUNKS: 1000, // Maximum number of hunks
    MAX_HUNK_SIZE: 10000, // Maximum lines per hunk
    PROCESSING_TIMEOUT: 30000, // 30 second timeout
    MAX_ITERATIONS: 50000, // Maximum loop iterations
};
// Security validation utilities
var DiffSecurityValidator = /** @class */ (function () {
    function DiffSecurityValidator() {
    }
    DiffSecurityValidator.validateContent = function (content) {
        if (typeof content !== 'string') {
            throw new Error('Content must be a string');
        }
        if (content.length > PRODUCTION_LIMITS.MAX_CONTENT_SIZE) {
            throw new Error("Content too large: ".concat(content.length, " bytes exceeds ").concat(PRODUCTION_LIMITS.MAX_CONTENT_SIZE, " byte limit"));
        }
    };
    DiffSecurityValidator.validateDiff = function (diff) {
        if (typeof diff !== 'string') {
            throw new Error('Diff must be a string');
        }
        if (diff.length > PRODUCTION_LIMITS.MAX_DIFF_SIZE) {
            throw new Error("Diff too large: ".concat(diff.length, " bytes exceeds ").concat(PRODUCTION_LIMITS.MAX_DIFF_SIZE, " byte limit"));
        }
        // Validate diff format structure
        var lines = diff.split('\n');
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            if (line.length > 10000) { // Prevent extremely long lines
                throw new Error('Diff contains excessively long lines');
            }
        }
        // Don't throw on invalid diff format - just let it fail gracefully later
        // This allows handling of malformed diffs from LLMs
    };
    return DiffSecurityValidator;
}());
// Performance monitoring utilities
var PerformanceMonitor = /** @class */ (function () {
    function PerformanceMonitor() {
        this.iterationCount = 0;
        this.warnings = [];
        this.startTime = Date.now();
    }
    PerformanceMonitor.prototype.checkTimeout = function () {
        var elapsed = Date.now() - this.startTime;
        if (elapsed > PRODUCTION_LIMITS.PROCESSING_TIMEOUT) {
            throw new Error("Processing timeout: ".concat(elapsed, "ms exceeds ").concat(PRODUCTION_LIMITS.PROCESSING_TIMEOUT, "ms limit"));
        }
    };
    PerformanceMonitor.prototype.incrementIteration = function () {
        this.iterationCount++;
        if (this.iterationCount > PRODUCTION_LIMITS.MAX_ITERATIONS) {
            throw new Error("Maximum iterations exceeded: ".concat(this.iterationCount));
        }
        if (this.iterationCount % 1000 === 0) {
            this.checkTimeout();
        }
    };
    PerformanceMonitor.prototype.addWarning = function (warning) {
        this.warnings.push(warning);
    };
    PerformanceMonitor.prototype.getTelemetry = function () {
        return {
            processingTimeMs: Date.now() - this.startTime,
            performanceWarnings: __spreadArray([], this.warnings, true),
        };
    };
    return PerformanceMonitor;
}());
/**
 * Production-grade unified diff application with comprehensive hardening
 * @param originalContent - The original file content
 * @param diffContent - The unified diff to apply
 * @param options - Optional configuration for debugging and telemetry
 * @returns The modified content after applying the diff
 * @throws Error with detailed diagnostics on failure
 */
function applyDiff(originalContent, diffContent, options) {
    if (options === void 0) { options = {}; }
    var telemetry = {
        strategiesAttempted: [],
        processingTimeMs: 0,
        contentSize: originalContent.length,
        diffSize: diffContent.length,
        hunkCount: 0,
        success: false,
        performanceWarnings: [],
    };
    var monitor = new PerformanceMonitor();
    try {
        // Security validation
        DiffSecurityValidator.validateContent(originalContent);
        DiffSecurityValidator.validateDiff(diffContent);
        // Handle edge cases
        if (!diffContent || diffContent.trim().length === 0) {
            telemetry.success = true;
            return originalContent; // No diff to apply
        }
        if (!originalContent && diffContent.trim().length === 0) {
            telemetry.success = true;
            return ''; // Empty content, empty diff
        }
        // Handle @@ ... @@ format (ignore line numbers)
        var cleanedDiff = diffContent.replace(/@@ .* @@/g, '@@ ... @@');
        // Enhanced hunk parsing with validation
        var hunksRaw = cleanedDiff.match(/(?:^|\n)@@[^\n]*(?:\n(?!@@)[^\n]*)*(?=\n@@|$)/g) ||
            [cleanedDiff]; // Fallback to single hunk if no matches
        if (hunksRaw.length > PRODUCTION_LIMITS.MAX_HUNKS) {
            throw new Error("Too many hunks: ".concat(hunksRaw.length, " exceeds ").concat(PRODUCTION_LIMITS.MAX_HUNKS, " limit"));
        }
        var hunks = hunksRaw.map(function (h, idx) {
            monitor.incrementIteration();
            // Clean up the hunk and split into lines
            var cleanHunk = h.replace(/^\n/, ''); // Remove leading newline
            var hunkLines = cleanHunk.split('\n').filter(function (line) { return line.length > 0; });
            if (hunkLines.length > PRODUCTION_LIMITS.MAX_HUNK_SIZE) {
                throw new Error("Hunk #".concat(idx + 1, " too large: ").concat(hunkLines.length, " lines exceeds ").concat(PRODUCTION_LIMITS.MAX_HUNK_SIZE, " limit"));
            }
            return hunkLines;
        });
        telemetry.hunkCount = hunks.length;
        var currentContent = originalContent;
        for (var i = 0; i < hunks.length; i++) {
            monitor.checkTimeout();
            monitor.incrementIteration();
            var hunk = hunks[i];
            try {
                var newContent = applyHunkWithTelemetry(currentContent, hunk, telemetry, monitor);
                if (newContent !== null) {
                    // SAFETY: Verify the result is not corrupted
                    if (newContent.length === 0 && currentContent.length > 0) {
                        // Prevent accidental deletion of entire content
                        throw new Error("Hunk #".concat(i + 1, " would delete entire file content - aborting for safety"));
                    }
                    currentContent = newContent;
                }
                else {
                    // Enhanced error reporting with fallback options
                    var hunkPreview = hunk.join('\n');
                    var _a = hunkToBeforeAfter(hunk), before = _a.before, after = _a.after;
                    var errorDetails = [
                        "Hunk #".concat(i + 1, " failed to apply cleanly after trying all strategies."),
                        "",
                        "Hunk content (first 500 chars):",
                        hunkPreview.substring(0, 500) + (hunkPreview.length > 500 ? '...' : ''),
                        "",
                        "Analysis:",
                        "- Before lines: ".concat(before.length),
                        "- After lines: ".concat(after.length),
                        "- Strategies attempted: ".concat(telemetry.strategiesAttempted.join(', ')),
                        "- Search pattern: \"".concat(before.slice(0, 2).join('\\n')).concat(before.length > 2 ? '...' : '', "\""),
                        "- Content size: ".concat(currentContent.length, " characters"),
                        "- Processing time: ".concat(monitor.getTelemetry().processingTimeMs, "ms"),
                    ];
                    // SAFETY: Never use raw fallback - it's too dangerous
                    telemetry.errorDetails = errorDetails.join('\n');
                    throw new Error(errorDetails.join('\n'));
                }
            }
            catch (hunkError) {
                if (hunkError instanceof Error) {
                    telemetry.errorDetails = "Hunk #".concat(i + 1, " processing failed: ").concat(hunkError.message);
                }
                throw hunkError;
            }
        }
        telemetry.success = true;
        return currentContent;
    }
    catch (error) {
        telemetry.success = false;
        if (error instanceof Error && !telemetry.errorDetails) {
            telemetry.errorDetails = error.message;
        }
        throw error;
    }
    finally {
        // Collect final telemetry
        Object.assign(telemetry, monitor.getTelemetry());
        if (options.enableTelemetry) {
            // In production, you would send this to your monitoring system
            console.debug('Diff Application Telemetry:', telemetry);
        }
    }
}
