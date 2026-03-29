"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.RealtimeCodeFixer = void 0;
exports.IsRealtimeCodeFixerEnabled = IsRealtimeCodeFixerEnabled;
var common_1 = require("../inferutils/common");
var logger_1 = require("../../logger");
var infer_1 = require("../inferutils/infer");
var prompts_1 = require("../prompts");
var assistant_1 = require("./assistant");
var diff_formats_1 = require("../diff-formats");
var core_1 = require("../inferutils/core");
var search_replace_1 = require("../diff-formats/search-replace");
var config_types_1 = require("../inferutils/config.types");
var config_1 = require("../inferutils/config");
// import { analyzeTypeScriptFile } from "../../services/code-fixer/analyzer";
// Constants for magic numbers
var DEFAULT_PASSES = 5;
var MAX_RETRIES = 3;
var FUZZY_THRESHOLD = 0.87;
var SYSTEM_PROMPT = "You are a seasoned, highly experienced code inspection officer and senior full-stack engineer specializing in React and TypeScript. Your task is to review and verify if the provided TypeScript code file wouldn't cause any runtime infinite rendering loops or critical failures, and provide fixes if any. \nYou would only be provided with a single file to review at a time. You are to simulate its runtime behavior and analyze it for listed issues. Your analysis should be thorough but concise, focusing on critical issues and effective fixes.";
/*
<previous_files>
{{previousFiles}}
</previous_files>


 */
var USER_PROMPT = "================================\nHere is some relevant context:\n<user_query>\n{{query}}\n</user_query>\n\nCurrent project phase **being implemented:**\n{{phaseConcept}}\n\n================================\n\nHere's the file you need to review:\n<file_to_review>\n<file_info>\nPath: {{filePath}}\nPurpose: {{filePurpose}}\n</file_info>\n\n<fileContents>\n{{fileContents}}\n</fileContents>\n\n{{issues}}\n\nYou are only provided with this file to review. Assume all imports are correct and exist.\nPlease ignore the formatting, indentation, spacing and comments.\n</file_to_review>\n\nReview Process:\n1. Review **THE FILE PROVIDED FOR REVIEW** i.e <file_to_review>.\n2. Analyze the code structure, components, and dependencies.\n3. Check code for **only these** critical issues in this priority order:\n   a. \"Maximum update depth exceeded\" errors or infinite rendering loops\n      - setState called during render: setCount(count + 1) in component body\n      - useEffect without dependencies: useEffect(() => setState(...))\n      - Object dependencies in useEffect: useEffect(..., [objectRef])\n      - Zustand selector anti-patterns that cause unstable references:\n        - Object-literal selectors with destructuring: const { a, b } = useStore((s) => ({ a: s.a, b: s.b }))\n        - Fix required: select primitives individually with separate useStore(...) calls for each value\n   b. Import/Export integrity errors\n      - @xyflow/react: Must use { ReactFlow }, not default import\n      - Missing @/lib/utils import for cn function\n      - Components not properly exported\n   c. Undefined variable access that causes runtime crashes\n      - user.name without user?.name check\n      - array.map without array?.length check\n      - Accessing properties of undefined objects\n   d. Syntax errors and JSX/TSX tag mismatches\n   e. Tailwind class errors (border-border instead of border)\n   f. Duplicate definitions\n   g. Nested Router components\n   h. UI rendering and alignment issues\n   i. Incomplete code\n   j. Logical issues in business logic\n\n4. Pay special attention to React hooks, particularly useEffect, to prevent infinite loops or excessive re-renders.\n5. For each issue, provide a fix that addresses the problem without altering existing behavior, definitions, or parameters.\n6. Check if critical well known external imports are correct - for example 'React' being undefined or 'useEffect' being undefined.\n7. Assume all internal imports are correct and exist. Do not modify imported code, and assume it's behavior from patterns.\n8. If you lack context about a part of the code, do not modify it.\n9. Ignore indentation, spacing, comments, unused imports/variables/functions, or any code that doesn't affect the functionality of the file. No need to waste time on such things.\n10. If a change wouldn't fix anything or change any behaviour, i.e, its unnecessary, Don't suggest it.\n\nBefore providing fixes, conduct your analysis in <code_review> tags inside your thinking block. Be concise but thorough:\n\n<code_review>\n1. Code structure and components\n   - List key components and their purposes\n2. Critical issues identified:\n   - For each issue, write out the problematic code snippet\n3. React hooks analysis:\n   - For each useEffect, list out its dependencies\n4. Proposed fixes rationale\n</code_review>\n\nAfter your analysis, format each fix as follows:\n\n<fix>\n# Brief, one-line comment on the issue\n\n```\n<<<<<<< SEARCH\n[exact lines from current file]\n=======\n[your intended replacement]\n>>>>>>> REPLACE\n```\n\n# Brief, one-line comment on the fix\n</fix>\n\nImportant reminders:\n- Include all necessary fixes in your output.\n- Only provide fixes for the file provided for review i.e <file_to_review>.\n- The SEARCH section must exactly match a unique existing block of lines, including white space.\n- **Every SEARCH section should be followed by a REPLACE section. The SEARCH section begins with <<<<<<< SEARCH and ends with ===== after which the REPLACE section automatically begins and ends with >>>>>>> REPLACE.**\n- Assume internal imports (like shadcn components or ErrorBoundaries) exist.\n- Please ignore non functional or non critical issues. You are not doing a code quality check, You are performing code validation and issues that can cause runtime errors.\n- Pay extra attention to potential \"Maximum update depth exceeded\" errors, runtime error causing bugs, JSX/TSX Tag mismatches, logical issues and issues that can cause misalignment of UI components.\n- Do not suggest changes about stuff that you are not given context about, and might break downstream code. \n\nIf no issues are found, return a blank response.\n\nYour final output should consist only of the fixes formatted as shown, without duplicating or rehashing any of the work you did in the code review section.\n{{appendix}}";
var EXTRA_JSX_SPECIFIC = "\n<appendix>\nThe most important class of errors is the \"Maximum update depth exceeded\" error which you definitely need to identify and fix. \n".concat(prompts_1.PROMPT_UTILS.REACT_RENDER_LOOP_PREVENTION, "\n</appendix>\n");
var DIFF_FIXER_PROMPT = "You made mistakes in generating the diffs and they failed to match. You need to regenerate them properly.\n\n{{failedBlocksCount}} SEARCH/REPLACE block(s) failed to match!\n\n{{failedBlocks}}\n\nThe SEARCH section must exactly match an existing block of lines including all white space, comments, indentation, docstrings, etc.\n\n# The other {{successfulBlocksCount}} SEARCH/REPLACE blocks were applied successfully.\nDon't re-send them. Just reply with fixed versions of the failed blocks.\n\nCRITICAL REQUIREMENTS:\n- The SEARCH section must EXACTLY match existing lines in the current file\n- Include all whitespace, comments, indentation exactly as they appear\n- Find the exact text that exists NOW (after successful blocks were applied)\n- Don't change the intended functionality of the REPLACE section\n- You may make additional fixes if needed to the current content\n\nJust reply with the corrected SEARCH/REPLACE blocks in this format:\n\n<<<<<<< SEARCH\n[exact lines from current file]\n=======\n[your intended replacement]\n>>>>>>> REPLACE";
var userPromptFormatter = function (user_prompt, query, file, previousFiles, currentPhase, issues) {
    var variables = {
        query: query,
        previousFiles: previousFiles ? prompts_1.PROMPT_UTILS.serializeFiles(previousFiles) : '',
        filePath: file.filePath,
        filePurpose: file.filePurpose,
        fileContents: file.fileContents,
        phaseConcept: currentPhase ? "\nCurrent project phase overview:\n<current_phase>\n".concat(JSON.stringify(currentPhase, null, 2), "\n</current_phase>") : '',
        issues: issues ? "\n<issues>\nHere are some issues that were found via static analysis. These may or may not be false positives:\n".concat(issues.join('\n'), "\n</issues>") : '',
        appendix: (file.filePath.endsWith('.tsx') || file.filePath.endsWith('.jsx')) ? EXTRA_JSX_SPECIFIC : ''
    };
    var prompt = prompts_1.PROMPT_UTILS.replaceTemplateVariables(user_prompt, variables);
    return prompts_1.PROMPT_UTILS.verifyPrompt(prompt);
};
var diffPromptFormatter = function (currentContent, failedBlocks, failedBlocksCount, successfulBlocksCount) {
    var prompt = prompts_1.PROMPT_UTILS.replaceTemplateVariables(DIFF_FIXER_PROMPT, {
        currentContent: currentContent,
        failedBlocks: failedBlocks,
        failedBlocksCount: failedBlocksCount.toString(),
        successfulBlocksCount: successfulBlocksCount.toString()
    });
    return prompts_1.PROMPT_UTILS.verifyPrompt(prompt);
};
var RealtimeCodeFixer = /** @class */ (function (_super) {
    __extends(RealtimeCodeFixer, _super);
    function RealtimeCodeFixer(env, inferenceContext, lightMode, altPassModelOverride, // = AIModels.GEMINI_2_5_FLASH,
    modelConfigOverride, systemPrompt, userPrompt) {
        if (lightMode === void 0) { lightMode = false; }
        if (systemPrompt === void 0) { systemPrompt = SYSTEM_PROMPT; }
        if (userPrompt === void 0) { userPrompt = USER_PROMPT; }
        var _this = _super.call(this, env, inferenceContext) || this;
        _this.logger = (0, logger_1.createObjectLogger)(_this, 'RealtimeCodeFixer');
        _this.lightMode = lightMode;
        _this.altPassModelOverride = altPassModelOverride;
        _this.userPrompt = userPrompt;
        _this.systemPrompt = systemPrompt;
        _this.modelConfigOverride = modelConfigOverride;
        return _this;
    }
    RealtimeCodeFixer.prototype.run = function (generatedFile_1, context_1, currentPhase_1) {
        return __awaiter(this, arguments, void 0, function (generatedFile, context, currentPhase, issues, passes) {
            var content, startTime, searchBlocks, i, messages, fixResult, contentMatch, endTime, error_1;
            var _a, _b;
            if (issues === void 0) { issues = []; }
            if (passes === void 0) { passes = DEFAULT_PASSES; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 5, , 6]);
                        // Ignore css or json files or *.config.js
                        if (generatedFile.filePath.endsWith('.css') || generatedFile.filePath.endsWith('.json') || generatedFile.filePath.endsWith('.config.js')) {
                            this.logger.info("Skipping realtime code fixer for file: ".concat(generatedFile.filePath));
                            return [2 /*return*/, generatedFile];
                        }
                        content = generatedFile.fileContents;
                        this.save([(0, common_1.createSystemMessage)(this.systemPrompt)]);
                        startTime = Date.now();
                        searchBlocks = -1;
                        i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(searchBlocks !== 0 && i < passes)) return [3 /*break*/, 4];
                        // Do a static analysis of the file
                        // const analysis = await analyzeTypeScriptFile(generatedFile.filePath, content);
                        // issues = [...issues, ...analysis.issues.map(issue => JSON.stringify(issue, null, 2))];
                        this.logger.info("Running realtime code fixer for file: ".concat(generatedFile.filePath, " (pass ").concat(i + 1, "/").concat(passes, "), issues: ").concat(JSON.stringify(issues, null, 2)));
                        messages = this.save([
                            i === 0 ? (0, common_1.createUserMessage)(userPromptFormatter(this.userPrompt, context.query, generatedFile, context.previousFiles, currentPhase, issues)) :
                                (0, common_1.createUserMessage)("\nPlease quickly re-review the entire code for another pass to ensure there are no **critical** issues or bugs remaining and there are no weird unapplied changes or residues (e.g, malformed search/replace blocks or diffs).\n**Look out for serious issues that can cause runtime errors, rendering issues, logical bugs, or things that got broken by previous fixes**\n**Indentations do not cause issues, Please ignore indentation issues**\n**Thoroughly look for `Maximum update depth exceeded` and other issues that can crash the app on priority**\n**No need to be verbose or descriptive if you dont see any issues! We need to commit this file as soon as possible so don't waste time nit-picking! But it shouldn't break at any cost!**\n\n```\n".concat(content, "\n```\n\nIf you think the file is corrupted or too broken, you can completely rewrite it from scratch and provide the raw code inside the commented out <content> tags as follows:\n```\n//<content>\n...raw, full code...\n//</content>\n```\n**MAKE SURE TO COMMENT THE TAGS AND THERE SHOULD ONLY BE ONE <content> TAG AND IT SHOULD BE CLOSED PROPERLY BY </content> TAG**\nThis would completely replace the original file contents. Otherwise if you just want to add more patches, You can use the SEARCH-REPLACE blocks as previously described.\nDon't be nitpicky, If there are no actual issues, just say \"No issues found\".\n")),
                        ]);
                        return [4 /*yield*/, (0, infer_1.executeInference)({
                                env: this.env,
                                agentActionName: "realtimeCodeFixer",
                                context: this.inferenceContext,
                                messages: messages,
                                modelName: (i !== 0 && this.altPassModelOverride) || this.lightMode ? this.altPassModelOverride : undefined,
                                temperature: (i !== 0 && this.altPassModelOverride) || this.lightMode ? 0.0 : undefined,
                                reasoning_effort: (i !== 0 && this.altPassModelOverride) || this.lightMode ? 'low' : undefined,
                                modelConfig: this.modelConfigOverride,
                            })];
                    case 2:
                        fixResult = _c.sent();
                        if (!fixResult) {
                            this.logger.warn("Realtime code fixer returned no fix for file: ".concat(generatedFile.filePath));
                            return [2 /*return*/, generatedFile];
                        }
                        this.save([(0, common_1.createAssistantMessage)(fixResult.string)]);
                        if (fixResult.string.includes('<content>')) {
                            contentMatch = fixResult.string.match(/<content>([\s\S]*?)<\/content>/);
                            if (contentMatch) {
                                content = contentMatch[1].trim();
                            }
                            searchBlocks = 0;
                            return [3 /*break*/, 1];
                        }
                        // Search the number of search blocks in fixResult
                        searchBlocks = (_b = (_a = fixResult.string.match(/<<<\s+SEARCH/g)) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
                        this.logger.info("Applied search replace diff to file: ".concat(generatedFile.filePath, "\n================================================================================\nRaw content (pass ").concat(i + 1, ", found ").concat(searchBlocks, " search blocks): \n").concat(content, "\n-------------------------\nDiff:\n").concat(fixResult.string, "\n-------------------------"));
                        return [4 /*yield*/, this.applyDiffSafely(content, fixResult.string)];
                    case 3:
                        content = _c.sent();
                        this.logger.info("\n-------------------------\nfinal content (pass ".concat(i + 1, "): \n").concat(content, "\n================================================================================\n"));
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        endTime = Date.now();
                        this.logger.info("Realtime code fixer completed for file: ".concat(generatedFile.filePath, " in ").concat(endTime - startTime, "ms, found ").concat(searchBlocks, " search blocks"));
                        return [2 /*return*/, __assign(__assign({}, generatedFile), { fileContents: content })];
                    case 5:
                        error_1 = _c.sent();
                        this.logger.error("Error during realtime code fixer for file ".concat(generatedFile.filePath, ":"), error_1);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/, generatedFile];
                }
            });
        });
    };
    /**
     * Smart diff applier with automatic error correction
     * Simple approach: applies diff, if blocks fail, gives all failed blocks to LLM to fix
     */
    RealtimeCodeFixer.prototype.applyDiffSafely = function (originalContent_1, originalDiff_1) {
        return __awaiter(this, arguments, void 0, function (originalContent, originalDiff, maxRetries) {
            var currentContent, currentDiff, attempt, searchBlocks, replaceBlocks, correctedDiff_1, result, _a, blocksApplied, blocksTotal, blocksFailed, failedBlocks, correctedDiff, error_2;
            var _this = this;
            var _b, _c, _d, _e;
            if (maxRetries === void 0) { maxRetries = MAX_RETRIES; }
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        if (!originalContent || !(originalDiff === null || originalDiff === void 0 ? void 0 : originalDiff.trim())) {
                            this.logger.warn('Empty content or diff provided to applyDiffSafely');
                            return [2 /*return*/, originalContent];
                        }
                        this.logger.info('Starting smart diff application...');
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 8, , 9]);
                        currentContent = originalContent;
                        currentDiff = originalDiff;
                        attempt = 0;
                        _f.label = 2;
                    case 2:
                        if (!(attempt <= maxRetries)) return [3 /*break*/, 7];
                        currentDiff = currentDiff.replaceAll(/^={7}\s*$\n^`{3}\s*$/gm, '>>>>>>> REPLACE\n\`\`\`\n'); // A hack cuz LLM often returns =7 and `3 instead of >>>>> REPLACE
                        searchBlocks = (_c = (_b = currentDiff.match(/<<<\s+SEARCH/g)) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0;
                        replaceBlocks = (_e = (_d = currentDiff.match(/\s+REPLACE/g)) === null || _d === void 0 ? void 0 : _d.length) !== null && _e !== void 0 ? _e : 0;
                        if (!(searchBlocks !== replaceBlocks)) return [3 /*break*/, 4];
                        this.logger.warn("Realtime code fixer returned mismatched search and replace blocks for file, ".concat(searchBlocks, " search blocks and ").concat(replaceBlocks, " replace blocks"));
                        return [4 /*yield*/, this.getLLMCorrectedDiff(currentContent, [], ["Mismatched search and replace blocks in current diff: ".concat(searchBlocks, " search blocks and ").concat(replaceBlocks, " replace blocks. Current diff: \n").concat(currentDiff)], 0)];
                    case 3:
                        correctedDiff_1 = _f.sent();
                        if (!correctedDiff_1) {
                            this.logger.warn("\u274C Failed to get LLM correction on attempt ".concat(attempt + 1));
                            return [2 /*return*/, currentContent]; // Return what we have so far
                        }
                        // Use the corrected diff for the next iteration
                        currentDiff = correctedDiff_1;
                        return [3 /*break*/, 6];
                    case 4:
                        result = (0, diff_formats_1.applySearchReplaceDiff)(currentContent, currentDiff, {
                            strict: false,
                            matchingStrategies: [search_replace_1.MatchingStrategy.EXACT, search_replace_1.MatchingStrategy.WHITESPACE_INSENSITIVE, search_replace_1.MatchingStrategy.INDENTATION_PRESERVING, search_replace_1.MatchingStrategy.FUZZY],
                            fuzzyThreshold: FUZZY_THRESHOLD
                        });
                        _a = result.results, blocksApplied = _a.blocksApplied, blocksTotal = _a.blocksTotal, blocksFailed = _a.blocksFailed, failedBlocks = _a.failedBlocks;
                        this.logger.info("".concat(attempt === 0 ? 'Initial' : "Retry ".concat(attempt), " application: ").concat(blocksApplied, "/").concat(blocksTotal, " blocks applied"));
                        // Success - all blocks applied
                        if (blocksFailed === 0) {
                            this.logger.info('✅ All blocks applied successfully');
                            return [2 /*return*/, result.content];
                        }
                        else {
                            this.logger.warn("\u26A0\uFE0F ".concat(blocksFailed, " blocks still failed after ").concat(attempt, " retries.\n                        Failed blocks:\n                        ").concat(failedBlocks.map(function (block, i) { return "   ".concat(i + 1, ". ").concat(block); }).join('\n'), "\n-------------------------\nFailing Diff:\n").concat(currentDiff, "\n-------------------------"));
                        }
                        // If this was the last attempt, return what we have
                        if (attempt === maxRetries) {
                            this.logger.warn("\u26A0\uFE0F ".concat(blocksFailed, " blocks still failed after ").concat(maxRetries, " retries"));
                            failedBlocks.forEach(function (block, i) {
                                _this.logger.warn("   ".concat(i + 1, ". ").concat(block.error));
                            });
                            return [2 /*return*/, result.content];
                        }
                        // Update current content with any successful changes
                        currentContent = result.content;
                        // Ask LLM to fix all failed blocks
                        this.logger.info("\uD83D\uDD04 Getting LLM correction for ".concat(blocksFailed, " failed blocks..."));
                        return [4 /*yield*/, this.getLLMCorrectedDiff(currentContent, failedBlocks, result.results.errors, blocksApplied)];
                    case 5:
                        correctedDiff = _f.sent();
                        if (!correctedDiff) {
                            this.logger.warn("\u274C Failed to get LLM correction on attempt ".concat(attempt + 1));
                            return [2 /*return*/, result.content]; // Return what we have so far
                        }
                        // Use the corrected diff for the next iteration
                        currentDiff = correctedDiff;
                        _f.label = 6;
                    case 6:
                        attempt++;
                        return [3 /*break*/, 2];
                    case 7: return [2 /*return*/, currentContent];
                    case 8:
                        error_2 = _f.sent();
                        this.logger.error('❌ Error in smart diff application:', error_2);
                        return [2 /*return*/, originalContent];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get corrected diff from LLM using the new simplified DIFF_FIXER prompt
     */
    RealtimeCodeFixer.prototype.getLLMCorrectedDiff = function (currentContent, failedBlocks, allErrors, successfullyAppliedCount) {
        return __awaiter(this, void 0, void 0, function () {
            var failedBlocksText, allErrorsText, diffFixerPrompt, messages, llmResponse, trimmed, searchCount, replaceCount, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        failedBlocksText = failedBlocks.map(function (block) {
                            return "## SearchReplaceNoExactMatch: This SEARCH block failed to exactly match lines in the file\n<<<<<<< SEARCH\n".concat(block.search, "\n=======\n").concat(block.replace, "\n>>>>>>> REPLACE\n\n").concat(block.error, "\n");
                        }).join('\n\n');
                        allErrorsText = allErrors.length > 0 ?
                            "\n\nAll cumulative errors from diff application:\n".concat(allErrors.map(function (err) { return "- ".concat(err); }).join('\n')) :
                            '';
                        diffFixerPrompt = diffPromptFormatter(currentContent, failedBlocksText + allErrorsText, failedBlocks.length, successfullyAppliedCount);
                        this.logger.info("Getting corrected diff from LLM...".concat(failedBlocksText));
                        messages = this.save([(0, common_1.createUserMessage)(diffFixerPrompt)]);
                        return [4 /*yield*/, (0, core_1.infer)({
                                env: this.env,
                                metadata: this.inferenceContext,
                                modelName: config_types_1.AIModels.GEMINI_2_5_FLASH,
                                reasoning_effort: 'low',
                                temperature: 0.0,
                                maxTokens: 10000,
                                messages: messages,
                            })];
                    case 1:
                        llmResponse = _a.sent();
                        if (!llmResponse) {
                            this.logger.warn("❌ No LLM response received");
                            return [2 /*return*/, null];
                        }
                        this.logger.info("LLM response received: ".concat(llmResponse.string));
                        this.save([(0, common_1.createAssistantMessage)(llmResponse.string)]);
                        trimmed = llmResponse.string.trim();
                        searchCount = (trimmed.match(/<<<<<<< SEARCH/g) || []).length;
                        replaceCount = (trimmed.match(/>>>>>>> REPLACE/g) || []).length;
                        if (searchCount !== replaceCount) {
                            this.logger.warn("\u274C Mismatched markers: ".concat(searchCount, " SEARCH vs ").concat(replaceCount, " REPLACE"), trimmed);
                            return [2 /*return*/, null];
                        }
                        if (searchCount === 0) {
                            this.logger.warn("❌ No valid search/replace blocks found in LLM response", trimmed);
                            return [2 /*return*/, null];
                        }
                        this.logger.info("\uD83D\uDD04 LLM provided ".concat(searchCount, " corrected blocks"));
                        return [2 /*return*/, trimmed];
                    case 2:
                        error_3 = _a.sent();
                        this.logger.error('❌ Error getting LLM correction:', error_3);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return RealtimeCodeFixer;
}(assistant_1.default));
exports.RealtimeCodeFixer = RealtimeCodeFixer;
function IsRealtimeCodeFixerEnabled(inferenceContext) {
    var _a;
    if (config_1.AGENT_CONFIG.realtimeCodeFixer.name !== config_types_1.AIModels.DISABLED) {
        console.log("Realtime code fixer enabled");
        return true;
    }
    if (((_a = inferenceContext.userModelConfigs) === null || _a === void 0 ? void 0 : _a['realtimeCodeFixer']) && inferenceContext.userModelConfigs['realtimeCodeFixer'].name !== config_types_1.AIModels.DISABLED) {
        console.log("Realtime code fixer enabled by user");
        return true;
    }
    console.log("Realtime code fixer disabled", inferenceContext.userModelConfigs);
    return false;
}
