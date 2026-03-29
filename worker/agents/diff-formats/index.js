"use strict";
/**
 * Diff Format Implementations for LLM-generated code changes
 *
 * This module provides two different diff format implementations,
 * each with the same API but different approaches to handling changes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchingStrategy = exports.validateSearchReplaceDiff = exports.createSearchReplaceDiff = exports.applySearchReplaceDiff = exports.applyUnifiedDiff = void 0;
var udiff_1 = require("./udiff");
Object.defineProperty(exports, "applyUnifiedDiff", { enumerable: true, get: function () { return udiff_1.applyDiff; } });
var search_replace_1 = require("./search-replace");
Object.defineProperty(exports, "applySearchReplaceDiff", { enumerable: true, get: function () { return search_replace_1.applyDiff; } });
Object.defineProperty(exports, "createSearchReplaceDiff", { enumerable: true, get: function () { return search_replace_1.createSearchReplaceDiff; } });
Object.defineProperty(exports, "validateSearchReplaceDiff", { enumerable: true, get: function () { return search_replace_1.validateDiff; } });
Object.defineProperty(exports, "MatchingStrategy", { enumerable: true, get: function () { return search_replace_1.MatchingStrategy; } });
