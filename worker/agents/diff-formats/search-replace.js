"use strict";
/**
 * Search/Replace Diff Format Implementation
 *
 * This format is designed to be simple and reliable for LLM-generated diffs.
 * Each edit is specified as a search block followed by a replace block.
 *
 * Format:
 * ```
 * <<<<<<< SEARCH
 * content to find
 * =======
 * content to replace with
 * >>>>>>> REPLACE
 * ```
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
exports.MatchingStrategy = void 0;
exports.applyDiff = applyDiff;
exports.createSearchReplaceDiff = createSearchReplaceDiff;
exports.validateDiff = validateDiff;
exports.runParserTests = runParserTests;
var MatchingStrategy;
(function (MatchingStrategy) {
    MatchingStrategy["EXACT"] = "exact";
    MatchingStrategy["WHITESPACE_INSENSITIVE"] = "whitespace-insensitive";
    MatchingStrategy["INDENTATION_PRESERVING"] = "indentation-preserving";
    MatchingStrategy["FUZZY"] = "fuzzy";
})(MatchingStrategy || (exports.MatchingStrategy = MatchingStrategy = {}));
/**
 * Enhanced search/replace diff parser with robust error handling
 * Implements a clean state machine to handle malformed blocks, code fences, and edge cases
 */
function parseSearchReplaceDiff(diffContent) {
    var blocks = [];
    var errors = [];
    // Normalize line endings
    var normalizedDiff = diffContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    var lines = normalizedDiff.split('\n');
    // State machine states
    var ParserState;
    (function (ParserState) {
        ParserState[ParserState["OUTSIDE"] = 0] = "OUTSIDE";
        ParserState[ParserState["IN_SEARCH"] = 1] = "IN_SEARCH";
        ParserState[ParserState["IN_REPLACE"] = 2] = "IN_REPLACE";
        ParserState[ParserState["MALFORMED"] = 3] = "MALFORMED"; // Block is malformed, skip to next
    })(ParserState || (ParserState = {}));
    var state = ParserState.OUTSIDE;
    var currentBlock = null;
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        switch (state) {
            case ParserState.OUTSIDE:
                if (line === '<<<<<<< SEARCH') {
                    // Start new search block
                    currentBlock = {
                        search: [],
                        replace: [],
                        startLine: i
                    };
                    state = ParserState.IN_SEARCH;
                }
                // Ignore all other lines when outside blocks
                break;
            case ParserState.IN_SEARCH:
                if (line === '<<<<<<< SEARCH') {
                    // Another SEARCH without REPLACE - previous block is orphaned
                    if (currentBlock) {
                        errors.push("Block at line ".concat(currentBlock.startLine + 1, ": SEARCH block without corresponding REPLACE (followed by another SEARCH)"));
                    }
                    // Start new search block
                    currentBlock = {
                        search: [],
                        replace: [],
                        startLine: i
                    };
                    // Stay in IN_SEARCH state
                }
                else if (line === '=======' || line === '```') {
                    // Found separator - transition to replace collection
                    if (currentBlock) {
                        currentBlock.separatorType = line;
                        state = ParserState.IN_REPLACE;
                    }
                }
                else {
                    // Collect search content
                    if (currentBlock) {
                        currentBlock.search.push(lines[i]);
                    }
                }
                break;
            case ParserState.IN_REPLACE:
                if (!currentBlock) {
                    state = ParserState.OUTSIDE;
                    break;
                }
                if (line === '>>>>>>> REPLACE') {
                    // Found proper end marker
                    completeBlock(currentBlock, blocks, errors);
                    currentBlock = null;
                    state = ParserState.OUTSIDE;
                }
                else if (currentBlock.separatorType === '```' && line === '```') {
                    // Found code fence end
                    completeBlock(currentBlock, blocks, errors);
                    currentBlock = null;
                    state = ParserState.OUTSIDE;
                }
                else if (line === '<<<<<<< SEARCH') {
                    // New search block without proper end - complete current block first
                    errors.push("Block at line ".concat(currentBlock.startLine + 1, ": REPLACE block ended prematurely (no end marker found)"));
                    completeBlock(currentBlock, blocks, errors);
                    // Start new search block
                    currentBlock = {
                        search: [],
                        replace: [],
                        startLine: i
                    };
                    state = ParserState.IN_SEARCH;
                }
                else if (line === '=======') {
                    // Additional separator in replace section - this is always malformed
                    // Once we're in IN_REPLACE state, we shouldn't see another separator
                    errors.push("Block at line ".concat(currentBlock.startLine + 1, ": Malformed block with multiple separators - block ignored"));
                    state = ParserState.MALFORMED;
                }
                else {
                    // Collect replace content
                    currentBlock.replace.push(lines[i]);
                }
                break;
            case ParserState.MALFORMED:
                if (line === '<<<<<<< SEARCH') {
                    // Found next valid block - reset
                    currentBlock = {
                        search: [],
                        replace: [],
                        startLine: i
                    };
                    state = ParserState.IN_SEARCH;
                }
                else if (line === '```') {
                    // Code fence might end malformed block - go back to outside state
                    state = ParserState.OUTSIDE;
                    currentBlock = null;
                }
                // Skip all other lines in malformed state
                break;
        }
    }
    // Handle incomplete blocks at end of file
    if (currentBlock) {
        switch (state) {
            case ParserState.IN_SEARCH:
                errors.push("Block at line ".concat(currentBlock.startLine + 1, ": SEARCH block without corresponding REPLACE (end of file reached)"));
                break;
            case ParserState.IN_REPLACE:
                errors.push("Block at line ".concat(currentBlock.startLine + 1, ": REPLACE block ended prematurely (end of file reached)"));
                break;
        }
    }
    return { blocks: blocks, errors: errors };
    /**
     * Helper function to complete and validate a block
     */
    function completeBlock(block, blocks, errors) {
        var cleanedSearch = block.search.join('\n').replace(/\n+$/, '');
        var cleanedReplace = block.replace.join('\n').replace(/\n+$/, '');
        // Allow empty search for pure additions (when search is just whitespace/newlines)
        // But reject truly empty search sections (no content at all)
        if (block.search.length === 0) {
            errors.push("Block at line ".concat(block.startLine + 1, ": Empty SEARCH section"));
            return;
        }
        blocks.push({
            search: cleanedSearch,
            replace: cleanedReplace,
            lineNumber: block.startLine + 1
        });
    }
}
/**
 * Normalize whitespace by converting multiple whitespace chars to single spaces
 * and trimming line ends, while preserving line structure
 */
function normalizeWhitespace(text) {
    return text
        .split('\n')
        .map(function (line) { return line.replace(/\s+/g, ' ').trim(); })
        .join('\n')
        .trim();
}
/**
 * Extract indentation pattern from text (preserves relative indentation)
 */
function extractIndentationPattern(text) {
    var lines = text.split('\n');
    var indentedLines = lines.map(function (line) {
        var match = line.match(/^(\s*)(.*$)/);
        return match ? { indent: match[1], content: match[2] } : { indent: '', content: line };
    });
    var pattern = indentedLines.map(function (_a) {
        var indent = _a.indent, content = _a.content;
        return content.trim() ? "".concat(indent.length, ":").concat(content.trim()) : '';
    }).join('\n');
    return { pattern: pattern, lines: indentedLines.map(function (l) { return l.content.trim(); }) };
}
/**
 * Simple fuzzy matching using Levenshtein distance ratio
 */
function calculateSimilarity(a, b) {
    if (a === b)
        return 1.0;
    if (a.length === 0 || b.length === 0)
        return 0.0;
    var maxLen = Math.max(a.length, b.length);
    var distance = levenshteinDistance(a, b);
    return 1 - (distance / maxLen);
}
function levenshteinDistance(a, b) {
    var matrix = Array(b.length + 1).fill(null).map(function () { return Array(a.length + 1).fill(null); });
    for (var i = 0; i <= a.length; i++)
        matrix[0][i] = i;
    for (var j = 0; j <= b.length; j++)
        matrix[j][0] = j;
    for (var j = 1; j <= b.length; j++) {
        for (var i = 1; i <= a.length; i++) {
            var substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(matrix[j][i - 1] + 1, // insertion
            matrix[j - 1][i] + 1, // deletion
            matrix[j - 1][i - 1] + substitutionCost // substitution
            );
        }
    }
    return matrix[b.length][a.length];
}
/**
 * Find text match using specified strategy
 */
function findMatch(content, searchText, strategy) {
    switch (strategy) {
        case MatchingStrategy.EXACT:
            return findExactMatch(content, searchText);
        case MatchingStrategy.WHITESPACE_INSENSITIVE:
            return findWhitespaceInsensitiveMatch(content, searchText);
        case MatchingStrategy.INDENTATION_PRESERVING:
            return findIndentationPreservingMatch(content, searchText);
        case MatchingStrategy.FUZZY:
            return findFuzzyMatch(content, searchText);
        default:
            return findExactMatch(content, searchText);
    }
}
function findExactMatch(content, searchText) {
    var index = content.indexOf(searchText);
    if (index === -1) {
        return { found: false, startIndex: -1, endIndex: -1, matchedText: '', strategy: MatchingStrategy.EXACT };
    }
    return {
        found: true,
        startIndex: index,
        endIndex: index + searchText.length,
        matchedText: searchText,
        strategy: MatchingStrategy.EXACT
    };
}
function findWhitespaceInsensitiveMatch(content, searchText) {
    var normalizedContent = normalizeWhitespace(content);
    var normalizedSearch = normalizeWhitespace(searchText);
    var index = normalizedContent.indexOf(normalizedSearch);
    if (index === -1) {
        return { found: false, startIndex: -1, endIndex: -1, matchedText: '', strategy: MatchingStrategy.WHITESPACE_INSENSITIVE };
    }
    // Find the actual text boundaries in the original content
    var actualMatch = findActualMatchBoundaries(content, searchText, normalizedContent, normalizedSearch, index);
    return {
        found: true,
        startIndex: actualMatch.start,
        endIndex: actualMatch.end,
        matchedText: content.slice(actualMatch.start, actualMatch.end),
        strategy: MatchingStrategy.WHITESPACE_INSENSITIVE
    };
}
function findIndentationPreservingMatch(content, searchText) {
    var contentPattern = extractIndentationPattern(content);
    var searchPattern = extractIndentationPattern(searchText);
    // Look for pattern match in content
    var patternIndex = contentPattern.pattern.indexOf(searchPattern.pattern);
    if (patternIndex === -1) {
        return { found: false, startIndex: -1, endIndex: -1, matchedText: '', strategy: MatchingStrategy.INDENTATION_PRESERVING };
    }
    // Find actual boundaries in original content
    var actualMatch = findPatternMatchBoundaries(content, searchText, contentPattern, searchPattern);
    return {
        found: actualMatch.found,
        startIndex: actualMatch.start,
        endIndex: actualMatch.end,
        matchedText: actualMatch.found ? content.slice(actualMatch.start, actualMatch.end) : '',
        strategy: MatchingStrategy.INDENTATION_PRESERVING
    };
}
function findFuzzyMatch(content, searchText, threshold) {
    if (threshold === void 0) { threshold = 0.8; }
    var searchLines = searchText.split('\n');
    var contentLines = content.split('\n');
    // IMPROVED: Analyze search quality and adjust threshold dynamically
    var quality = analyzeSearchBlockQuality(searchText, content);
    var adjustedThreshold = Math.max(threshold, quality.recommendedThreshold);
    // Use sliding window to find best match with context validation
    var bestMatch = { similarity: 0, contextScore: 0, startLine: -1, endLine: -1, overallScore: 0 };
    for (var i = 0; i <= contentLines.length - searchLines.length; i++) {
        var candidate = contentLines.slice(i, i + searchLines.length).join('\n');
        var similarity = calculateSimilarity(normalizeWhitespace(candidate), normalizeWhitespace(searchText));
        if (similarity >= adjustedThreshold) {
            // IMPROVED: Validate context for matches above threshold
            var contextScore = validateMatchContext(content, candidate, i, i + searchLines.length);
            var overallScore = similarity * 0.7 + contextScore * 0.3; // Weight similarity higher but include context
            if (overallScore > bestMatch.overallScore) {
                bestMatch = { similarity: similarity, contextScore: contextScore, startLine: i, endLine: i + searchLines.length, overallScore: overallScore };
            }
        }
    }
    if (bestMatch.overallScore === 0) {
        return { found: false, startIndex: -1, endIndex: -1, matchedText: '', strategy: MatchingStrategy.FUZZY };
    }
    // Convert line indices to character indices
    var beforeLines = contentLines.slice(0, bestMatch.startLine);
    var matchLines = contentLines.slice(bestMatch.startLine, bestMatch.endLine);
    var startIndex = beforeLines.join('\n').length + (beforeLines.length > 0 ? 1 : 0);
    var matchedText = matchLines.join('\n');
    var endIndex = startIndex + matchedText.length;
    return {
        found: true,
        startIndex: startIndex,
        endIndex: endIndex,
        matchedText: matchedText,
        strategy: MatchingStrategy.FUZZY
    };
}
// Helper functions for boundary detection
function findActualMatchBoundaries(content, searchText, _normalizedContent, normalizedSearch, _normalizedIndex) {
    // This is a simplified approach - in practice you'd want more sophisticated mapping
    // For now, we'll use the normalized positions as approximations
    var lines = content.split('\n');
    var searchLines = searchText.split('\n');
    // Find the line that contains our match
    for (var i = 0; i <= lines.length - searchLines.length; i++) {
        var candidate = lines.slice(i, i + searchLines.length).join('\n');
        if (normalizeWhitespace(candidate) === normalizedSearch) {
            var beforeLines = lines.slice(0, i);
            var startIndex = beforeLines.join('\n').length + (beforeLines.length > 0 ? 1 : 0);
            return { start: startIndex, end: startIndex + candidate.length };
        }
    }
    // Fallback to approximate positions
    return { start: _normalizedIndex, end: _normalizedIndex + normalizedSearch.length };
}
function findPatternMatchBoundaries(content, searchText, _contentPattern, searchPattern) {
    // Simplified pattern matching - could be enhanced
    var lines = content.split('\n');
    var searchLines = searchText.split('\n');
    for (var i = 0; i <= lines.length - searchLines.length; i++) {
        var candidate = lines.slice(i, i + searchLines.length).join('\n');
        var candidatePattern = extractIndentationPattern(candidate);
        if (candidatePattern.pattern === searchPattern.pattern) {
            var beforeLines = lines.slice(0, i);
            var startIndex = beforeLines.join('\n').length + (beforeLines.length > 0 ? 1 : 0);
            return { found: true, start: startIndex, end: startIndex + candidate.length };
        }
    }
    return { found: false, start: -1, end: -1 };
}
/**
 * Apply a single search/replace block to content with robust matching
 */
function applySearchReplaceBlock(content, block, options) {
    if (options === void 0) { options = {}; }
    // Handle empty search (pure additions)
    if (block.search.trim() === '') {
        // Append to end of content
        if (content === '') {
            return { result: block.replace };
        }
        var separator = content.endsWith('\n') ? '' : '\n';
        return { result: content + separator + block.replace };
    }
    // Default matching strategies in order of preference
    var strategies = options.matchingStrategies || [
        MatchingStrategy.EXACT,
        MatchingStrategy.WHITESPACE_INSENSITIVE,
        MatchingStrategy.INDENTATION_PRESERVING,
        MatchingStrategy.FUZZY
    ];
    // Try each strategy until one succeeds
    for (var _i = 0, strategies_1 = strategies; _i < strategies_1.length; _i++) {
        var strategy = strategies_1[_i];
        var matchResult = findMatch(content, block.search, strategy);
        if (!matchResult.found) {
            continue;
        }
        // Check for ambiguous matches (multiple occurrences) - CRITICAL SAFETY CHECK
        if (strategy === MatchingStrategy.EXACT) {
            var occurrences = content.split(block.search).length - 1;
            if (occurrences > 1) {
                return {
                    result: null,
                    error: "Search block found ".concat(occurrences, " times (ambiguous)")
                };
            }
        }
        else {
            // For non-exact strategies, check if there are multiple similar matches
            var potentialMatches = countSimilarMatches(content, block.search, strategy, options.fuzzyThreshold);
            if (potentialMatches > 1) {
                return {
                    result: null,
                    error: "Search block found ".concat(potentialMatches, " similar matches (ambiguous) using ").concat(strategy, " matching")
                };
            }
        }
        // Apply the replacement
        var before = content.slice(0, matchResult.startIndex);
        var after = content.slice(matchResult.endIndex);
        var result = before + block.replace + after;
        return {
            result: result,
            strategy: matchResult.strategy
        };
    }
    // No strategy succeeded
    return {
        result: null,
        error: "Search block not found using any matching strategy. Tried: ".concat(strategies.join(', '))
    };
}
/**
 * Analyze search block quality to prevent ambiguity
 */
function analyzeSearchBlockQuality(searchText, targetContent) {
    var warnings = [];
    var uniquenessScore = 1.0;
    var specificity = 1.0;
    // Check for overly common patterns that cause ambiguity
    var commonPatterns = [
        'const ', 'let ', 'if (', 'for (', '} else {', 'return ',
        'break;', 'continue;', '&&', '||', '===', '!=='
    ];
    for (var _i = 0, commonPatterns_1 = commonPatterns; _i < commonPatterns_1.length; _i++) {
        var pattern = commonPatterns_1[_i];
        if (searchText.includes(pattern)) {
            try {
                var escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                var occurrences = (targetContent.match(new RegExp(escapedPattern, 'g')) || []).length;
                if (occurrences > 3) {
                    uniquenessScore *= 0.85;
                }
            }
            catch (e) {
                // Skip regex errors
            }
        }
    }
    // Check for repetitive mathematical/algorithmic patterns (your specific issue)
    var mathPatterns = ['Math.sqrt', 'Math.pow', 'getBoundingClientRect', 'distance', 'minDistance', 'bestCandidate'];
    var mathPatternCount = 0;
    for (var _a = 0, mathPatterns_1 = mathPatterns; _a < mathPatterns_1.length; _a++) {
        var pattern = mathPatterns_1[_a];
        if (searchText.includes(pattern)) {
            mathPatternCount++;
            try {
                var escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                var occurrences = (targetContent.match(new RegExp(escapedPattern, 'g')) || []).length;
                if (occurrences > 2) {
                    uniquenessScore *= 0.7;
                    specificity *= 0.8;
                    warnings.push("Mathematical pattern \"".concat(pattern, "\" may cause ambiguity (").concat(occurrences, " occurrences)"));
                }
            }
            catch (e) {
                // Skip regex errors
            }
        }
    }
    // Check for case/switch statement context (your specific ArrowDown/ArrowUp issue)
    var hasCaseStatement = /case\s+['"`][^'"`]*['"`]:/.test(searchText);
    if (hasCaseStatement) {
        try {
            var caseCount = (targetContent.match(/case\s+['"`][^'"`]*['"`]:/g) || []).length;
            if (caseCount > 2) {
                uniquenessScore *= 0.6;
                warnings.push('Switch case detected with multiple similar cases - high ambiguity risk');
            }
        }
        catch (e) {
            // Skip regex errors
        }
    }
    // Calculate recommended threshold
    var recommendedThreshold = 0.8; // Default
    if (uniquenessScore < 0.4) {
        recommendedThreshold = 0.95; // Very high threshold for ambiguous content
    }
    else if (uniquenessScore < 0.6) {
        recommendedThreshold = 0.9; // High threshold for moderately ambiguous content
    }
    else if (mathPatternCount > 2) {
        recommendedThreshold = 0.88; // Slightly higher for mathematical patterns
    }
    return {
        uniquenessScore: Math.max(0.1, uniquenessScore),
        specificity: Math.max(0.1, specificity),
        recommendedThreshold: recommendedThreshold,
        warnings: warnings
    };
}
/**
 * Enhanced context-aware ambiguity detection
 * IMPROVED: Now includes quality analysis and smart threshold adjustment
 */
function countSimilarMatches(content, searchText, strategy, fuzzyThreshold) {
    var count = 0;
    // Use direct matching logic based on strategy to avoid recursion
    switch (strategy) {
        case MatchingStrategy.EXACT:
            // Count exact occurrences
            count = content.split(searchText).length - 1;
            break;
        case MatchingStrategy.WHITESPACE_INSENSITIVE:
            {
                // Count whitespace-normalized matches
                var normalizedContent = normalizeWhitespace(content);
                var normalizedSearch = normalizeWhitespace(searchText);
                count = normalizedContent.split(normalizedSearch).length - 1;
                break;
            }
        case MatchingStrategy.INDENTATION_PRESERVING:
            {
                // Count indentation pattern matches
                var contentPattern = extractIndentationPattern(content);
                var searchPattern = extractIndentationPattern(searchText);
                if (searchPattern.pattern) {
                    count = contentPattern.pattern.split(searchPattern.pattern).length - 1;
                }
                break;
            }
        case MatchingStrategy.FUZZY:
            {
                // Enhanced fuzzy counting with smart threshold adjustment
                var quality = analyzeSearchBlockQuality(searchText, content);
                var adjustedThreshold = Math.max(fuzzyThreshold || 0.85, quality.recommendedThreshold);
                var lines = content.split('\n');
                var searchLines = searchText.split('\n');
                // Use higher standards for counting matches in ambiguous scenarios
                for (var i = 0; i <= lines.length - searchLines.length; i++) {
                    var candidate = lines.slice(i, i + searchLines.length).join('\n');
                    var similarity = calculateSimilarity(normalizeWhitespace(candidate), normalizeWhitespace(searchText));
                    // Additional context validation for fuzzy matches
                    if (similarity >= adjustedThreshold) {
                        // Validate that the match doesn't span inappropriate boundaries
                        var contextScore = validateMatchContext(content, candidate, i, i + searchLines.length);
                        if (contextScore > 0.6) { // Only count matches with good context
                            count++;
                        }
                    }
                }
                break;
            }
        default:
            count = 0;
    }
    return count;
}
/**
 * Validate match context to prevent spanning inappropriate boundaries
 */
function validateMatchContext(_content, matchText, _startLine, _endLine) {
    var contextScore = 1.0;
    // Check for problematic boundary patterns
    var problematicPatterns = [
        { pattern: /^\s*case\s+['"`][^'"`]*['"`]:/, penalty: 0.4 }, // Case boundaries
        { pattern: /^\s*function\s+\w+/, penalty: 0.3 }, // Function boundaries
        { pattern: /^\s*}/, penalty: 0.5 }, // Closing brace boundaries
        { pattern: /{\s*$/, penalty: 0.5 } // Opening brace boundaries
    ];
    var matchLines = matchText.split('\n');
    for (var i = 0; i < matchLines.length; i++) {
        var line = matchLines[i];
        for (var _i = 0, problematicPatterns_1 = problematicPatterns; _i < problematicPatterns_1.length; _i++) {
            var _a = problematicPatterns_1[_i], pattern = _a.pattern, penalty = _a.penalty;
            try {
                if (pattern.test(line)) {
                    if (i === 0 || i === matchLines.length - 1) {
                        // Boundary at start/end is less problematic
                        contextScore *= (1 - penalty * 0.5);
                    }
                    else {
                        // Boundary in middle is very problematic
                        contextScore *= (1 - penalty);
                    }
                }
            }
            catch (e) {
                // Skip regex errors
            }
        }
    }
    // Check indentation consistency
    var indentations = matchLines.map(function (line) { return (line.match(/^\s*/) || [''])[0].length; });
    var minIndent = Math.min.apply(Math, indentations);
    var maxIndent = Math.max.apply(Math, indentations);
    var indentRange = maxIndent - minIndent;
    if (indentRange > 8) {
        contextScore *= 0.7; // Inconsistent indentation suggests spanning contexts
    }
    return Math.max(0.1, contextScore);
}
/**
 * Apply search/replace diff with enhanced error handling and telemetry
 */
function applyDiff(originalContent, diffContent, options) {
    var _a;
    if (options === void 0) { options = {}; }
    // Set sensible defaults
    var defaultOptions = {
        strict: true, // Default to strict mode for better error handling
        enableTelemetry: false,
        matchingStrategies: [
            MatchingStrategy.EXACT,
            MatchingStrategy.WHITESPACE_INSENSITIVE,
            MatchingStrategy.INDENTATION_PRESERVING,
            MatchingStrategy.FUZZY
        ],
        fuzzyThreshold: 0.80 // 85% similarity threshold - good balance of flexibility and precision
    };
    // Merge user options with defaults
    var mergedOptions = __assign(__assign({}, defaultOptions), options);
    var startTime = Date.now();
    var result = {
        content: originalContent,
        results: {
            blocksTotal: 0,
            blocksApplied: 0,
            blocksFailed: 0,
            errors: [],
            warnings: [],
            failedBlocks: []
        }
    };
    try {
        // Validate inputs
        if (typeof originalContent !== 'string') {
            result.results.errors.push('Original content must be a string');
            if (mergedOptions.strict)
                throw new Error('Original content must be a string');
            return result;
        }
        if (typeof diffContent !== 'string') {
            result.results.errors.push('Diff content must be a string');
            if (mergedOptions.strict)
                throw new Error('Diff content must be a string');
            return result;
        }
        // Handle empty diff
        if (!diffContent || diffContent.trim().length === 0) {
            return result;
        }
        // Parse the diff
        var _b = parseSearchReplaceDiff(diffContent), blocks = _b.blocks, parseErrors = _b.errors;
        if (parseErrors.length > 0) {
            (_a = result.results.errors).push.apply(_a, parseErrors);
            if (mergedOptions.strict) {
                throw new Error("Parse errors: ".concat(parseErrors.join('; ')));
            }
        }
        result.results.blocksTotal = blocks.length;
        if (blocks.length === 0) {
            if (mergedOptions.strict && parseErrors.length > 0) {
                throw new Error('No valid search/replace blocks found');
            }
            return result;
        }
        // Apply blocks sequentially
        var currentContent = originalContent;
        var failedBlocks = [];
        for (var _i = 0, blocks_1 = blocks; _i < blocks_1.length; _i++) {
            var block = blocks_1[_i];
            var _c = applySearchReplaceBlock(currentContent, block, {
                matchingStrategies: mergedOptions.matchingStrategies,
                fuzzyThreshold: mergedOptions.fuzzyThreshold
            }), blockResult = _c.result, error = _c.error, strategy = _c.strategy;
            if (blockResult !== null) {
                currentContent = blockResult;
                result.results.blocksApplied++;
                // Log which strategy was used for telemetry
                if (mergedOptions.enableTelemetry && strategy) {
                    result.results.warnings.push("Block at line ".concat(block.lineNumber, ": Applied using ").concat(strategy, " matching"));
                }
            }
            else {
                result.results.blocksFailed++;
                var errorMsg = "Block at line ".concat(block.lineNumber, ": ").concat(error);
                result.results.errors.push(errorMsg);
                failedBlocks.push({ block: block, error: errorMsg });
                // Add complete failed block information to results
                result.results.failedBlocks.push({
                    search: block.search,
                    replace: block.replace,
                    error: errorMsg,
                    lineNumber: block.lineNumber
                });
                if (mergedOptions.strict) {
                    throw new Error(errorMsg);
                }
            }
        }
        // If all blocks failed, add error even in non-strict mode
        if (result.results.blocksApplied === 0 && result.results.blocksTotal > 0) {
            var errorDetails = failedBlocks.map(function (_a) {
                var block = _a.block, error = _a.error;
                var preview = block.search.substring(0, 100);
                return "".concat(error, "\nSearch: \"").concat(preview).concat(block.search.length > 100 ? '...' : '', "\"");
            }).join('\n\n');
            var allFailedError = "All search/replace blocks failed:\n".concat(errorDetails);
            result.results.errors.push(allFailedError);
            if (mergedOptions.strict) {
                throw new Error(allFailedError);
            }
        }
        result.content = currentContent;
        return result;
    }
    finally {
        var processingTimeMs = Date.now() - startTime;
        if (mergedOptions.enableTelemetry) {
            console.debug('Search/Replace Diff Telemetry:', __assign(__assign({}, result.results), { processingTimeMs: processingTimeMs }));
        }
    }
}
/**
 * Utility to create a search/replace diff from before/after content
 */
function createSearchReplaceDiff(beforeContent, afterContent, options) {
    if (options === void 0) { options = {}; }
    var _a = options.contextLines, contextLines = _a === void 0 ? 3 : _a, _b = options.maxSearchSize, maxSearchSize = _b === void 0 ? 500 : _b;
    // Simple line-based diff
    var beforeLines = beforeContent.split('\n');
    var afterLines = afterContent.split('\n');
    // Find the first difference
    var firstDiff = -1;
    for (var i = 0; i < Math.min(beforeLines.length, afterLines.length); i++) {
        if (beforeLines[i] !== afterLines[i]) {
            firstDiff = i;
            break;
        }
    }
    // Find the last difference
    var lastDiff = -1;
    for (var i = 0; i < Math.min(beforeLines.length, afterLines.length); i++) {
        var beforeIdx = beforeLines.length - 1 - i;
        var afterIdx = afterLines.length - 1 - i;
        if (beforeLines[beforeIdx] !== afterLines[afterIdx]) {
            lastDiff = Math.max(beforeIdx, afterIdx);
            break;
        }
    }
    // Handle identical content
    if (firstDiff === -1 && beforeLines.length === afterLines.length) {
        return ''; // No changes
    }
    // Handle pure addition
    if (firstDiff === -1 && beforeLines.length < afterLines.length) {
        firstDiff = beforeLines.length;
        lastDiff = afterLines.length - 1;
    }
    // Create search/replace block
    var searchStart = Math.max(0, firstDiff - contextLines);
    var searchEnd = Math.min(beforeLines.length - 1, (lastDiff >= 0 ? lastDiff : firstDiff) + contextLines);
    var replaceStart = searchStart;
    var replaceEnd = Math.min(afterLines.length - 1, searchEnd + (afterLines.length - beforeLines.length));
    var searchBlock = beforeLines.slice(searchStart, searchEnd + 1).join('\n');
    var replaceBlock = afterLines.slice(replaceStart, replaceEnd + 1).join('\n');
    // Check size limit
    if (searchBlock.length > maxSearchSize) {
        // Reduce context
        var reducedContext = Math.max(0, contextLines - 1);
        return createSearchReplaceDiff(beforeContent, afterContent, __assign(__assign({}, options), { contextLines: reducedContext }));
    }
    return "<<<<<<< SEARCH\n".concat(searchBlock, "\n=======\n").concat(replaceBlock, "\n>>>>>>> REPLACE");
}
/**
 * Validate a search/replace diff without applying it
 */
function validateDiff(content, diffContent) {
    var _a = parseSearchReplaceDiff(diffContent), blocks = _a.blocks, parseErrors = _a.errors;
    var errors = __spreadArray([], parseErrors, true);
    for (var _i = 0, blocks_2 = blocks; _i < blocks_2.length; _i++) {
        var block = blocks_2[_i];
        var occurrences = content.split(block.search).length - 1;
        if (occurrences === 0) {
            errors.push("Block at line ".concat(block.lineNumber, ": Search pattern not found"));
        }
        else if (occurrences > 1) {
            errors.push("Block at line ".concat(block.lineNumber, ": Search pattern found ").concat(occurrences, " times (ambiguous)"));
        }
    }
    return {
        valid: errors.length === 0,
        errors: errors
    };
}
/**
 * Test cases for the enhanced search/replace parser
 * These tests cover all the edge cases mentioned in the requirements
 */
function runParserTests() {
    var tests = [
        // Test 1: Normal well-formed block
        {
            name: "Well-formed block",
            input: "<<<<<<< SEARCH\nold content\n=======\nnew content\n>>>>>>> REPLACE",
            expectedBlocks: 1,
            expectedErrors: 0
        },
        // Test 2: Block within code fences (the main issue from logs)
        {
            name: "Block within code fences",
            input: "# Comment\n```\n<<<<<<< SEARCH\nimport { ErrorBoundary } from './components/ErrorBoundary';\n=======\n// import { ErrorBoundary } from './components/ErrorBoundary';\n```",
            expectedBlocks: 1,
            expectedErrors: 0
        },
        // Test 3: SEARCH followed by another SEARCH (invalid)
        {
            name: "SEARCH followed by another SEARCH",
            input: "<<<<<<< SEARCH\nfirst search\n<<<<<<< SEARCH\nsecond search\n=======\nreplacement\n>>>>>>> REPLACE",
            expectedBlocks: 1,
            expectedErrors: 1
        },
        // Test 4: SEARCH without REPLACE at end of file
        {
            name: "SEARCH without REPLACE at EOF",
            input: "<<<<<<< SEARCH\norphaned search content",
            expectedBlocks: 0,
            expectedErrors: 1
        },
        // Test 5: Multiple separators (malformed)
        {
            name: "Multiple separators in replace section",
            input: "<<<<<<< SEARCH\nsearch content\n=======\nreplace content\n=======\nextra separator\n>>>>>>> REPLACE",
            expectedBlocks: 1,
            expectedErrors: 0
        },
        // Test 6: Mixed code fences and standard markers
        {
            name: "Mixed code fences and standard markers",
            input: "Text before\n```\n<<<<<<< SEARCH\nold code\n=======\nnew code\n```\nText after",
            expectedBlocks: 1,
            expectedErrors: 0
        },
        // Test 7: Empty search section
        {
            name: "Empty search section",
            input: "<<<<<<< SEARCH\n=======\nnew content\n>>>>>>> REPLACE",
            expectedBlocks: 1,
            expectedErrors: 0
        },
        // Test 8: Empty replace section
        {
            name: "Empty replace section",
            input: "<<<<<<< SEARCH\nold content\n=======\n>>>>>>> REPLACE",
            expectedBlocks: 1,
            expectedErrors: 0
        },
        // Test 9: Stray separators (should be ignored)
        {
            name: "Stray separators",
            input: "=======\nSome text\n```\nMore text",
            expectedBlocks: 0,
            expectedErrors: 0
        },
        // Test 10: The specific malformed case from the logs
        {
            name: "Specific malformed case from logs",
            input: "Looking at the provided main.tsx file, I need to analyze it for potential issues:\n\n# Missing ErrorBoundary component - will cause import error\n\n```\n<<<<<<< SEARCH\nimport { ErrorBoundary } from './components/ErrorBoundary';\nimport { RouteErrorBoundary } from './components/RouteErrorBoundary';\n=======\n// import { ErrorBoundary } from './components/ErrorBoundary';\n// import { RouteErrorBoundary } from './components/RouteErrorBoundary';\n=======\n```\n\n# Remove ErrorBoundary wrapper since component doesn't exist\n\n```\n<<<<<<< SEARCH\nconst router = createBrowserRouter([\n  {\n    path: \"/\",\n    element: <App />,\n    errorElement: <RouteErrorBoundary />,\n    children: [\n      {\n        path: \"/\",\n        element: <EditorPage />,\n      }\n    ]\n  },\n]);\n=======\nconst router = createBrowserRouter([\n  {\n    path: \"/\",\n    element: <App />,\n    children: [\n      {\n        path: \"/\",\n        element: <EditorPage />,\n      }\n    ]\n  },\n]);\n>>>>>>> REPLACE\n```",
            expectedBlocks: 2,
            expectedErrors: 0
        }
    ];
    var results = [];
    var passed = 0;
    var failed = 0;
    for (var _i = 0, tests_1 = tests; _i < tests_1.length; _i++) {
        var test_1 = tests_1[_i];
        try {
            var _a = parseSearchReplaceDiff(test_1.input), blocks = _a.blocks, errors = _a.errors;
            var blocksMatch = blocks.length === test_1.expectedBlocks;
            var errorsMatch = errors.length === test_1.expectedErrors;
            if (blocksMatch && errorsMatch) {
                passed++;
                results.push("\u2705 ".concat(test_1.name, ": PASSED (").concat(blocks.length, " blocks, ").concat(errors.length, " errors)"));
            }
            else {
                failed++;
                results.push("\u274C ".concat(test_1.name, ": FAILED"));
                results.push("   Expected: ".concat(test_1.expectedBlocks, " blocks, ").concat(test_1.expectedErrors, " errors"));
                results.push("   Actual: ".concat(blocks.length, " blocks, ").concat(errors.length, " errors"));
                if (errors.length > 0) {
                    results.push("   Errors: ".concat(errors.join(', ')));
                }
            }
        }
        catch (error) {
            failed++;
            results.push("\u274C ".concat(test_1.name, ": EXCEPTION - ").concat(error instanceof Error ? error.message : String(error)));
        }
    }
    return { passed: passed, failed: failed, details: results };
}
