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
exports.CodeReviewOperation = void 0;
var schemas_1 = require("../schemas");
var common_1 = require("../inferutils/common");
var infer_1 = require("../inferutils/infer");
var prompts_1 = require("../prompts");
var schemaFormatters_1 = require("../inferutils/schemaFormatters");
var zod_1 = require("zod");
var common_2 = require("../operations/common");
var SYSTEM_PROMPT = "You are a Senior Software Engineer at Cloudflare specializing in comprehensive React application analysis. Your mandate is to identify ALL critical issues across the ENTIRE codebase that could impact functionality, user experience, or deployment.\n\n## COMPREHENSIVE ISSUE DETECTION PRIORITIES:\n\n### 1. REACT RENDER LOOPS & INFINITE LOOPS (CRITICAL)\n**IMMEDIATELY FLAG THESE PATTERNS:**\n- \"Maximum update depth exceeded\" errors\n- \"Too many re-renders\" warnings  \n- useEffect without dependency arrays that set state\n- State updates during render phase\n- Unstable object/array dependencies in hooks\n- Infinite loops in event handlers or calculations\n\n### 2. RUNTIME ERRORS & CRASHES (CRITICAL)\n- Undefined/null variable access without proper guards\n- Import/export mismatches and missing imports\n- TypeScript compilation errors\n- Missing error boundaries around components\n- Unhandled promise rejections\n\n### 3. LOGIC ERRORS & BROKEN FUNCTIONALITY (HIGH)\n- Incorrect business logic implementation\n- Wrong conditional statements or boolean logic\n- Incorrect data transformations or calculations\n- State management bugs (stale closures, race conditions)\n- Event handlers not working as expected\n- Form validation logic errors\n\n### 4. UI RENDERING & LAYOUT ISSUES (HIGH)\n- Components not displaying correctly\n- CSS layout problems (flexbox, grid issues)\n- Responsive design breaking at certain breakpoints\n- Missing or incorrect styling classes\n- Accessibility violations (missing alt text, ARIA labels)\n- Loading states and error states not implemented\n\n### 5. DATA FLOW & STATE MANAGEMENT (MEDIUM-HIGH)\n- Props drilling where context should be used\n- Incorrect state updates (mutating state directly)\n- Missing state synchronization between components\n- Inefficient re-renders due to poor state structure\n- Missing loading/error states for async operations\n\n### 6. INCOMPLETE FEATURES & MISSING FUNCTIONALITY (MEDIUM)\n- Placeholder components that need implementation\n- TODO comments indicating missing functionality\n- Incomplete API integrations\n- Missing validation or error handling\n- Unfinished user flows or navigation\n\n### 7. STALE ERROR FILTERING\n**IGNORE these if no current evidence in codebase:**\n- Errors mentioning files that don't exist in current code\n- Errors about components/functions that have been removed\n- Errors with timestamps older than recent changes\n\n## COMPREHENSIVE ANALYSIS METHOD:\n1. **Scan ENTIRE codebase systematically** - don't just focus on reported errors\n2. **Analyze each component for completeness** - check if features are fully implemented\n3. **Cross-reference errors with current code** - validate issues exist\n4. **Check data flow and state management** - ensure proper state handling\n5. **Review UI/UX implementation** - verify user experience is correct\n6. **Validate business logic** - ensure functionality works as intended\n7. **Provide actionable, specific fixes** - not general suggestions\n\n".concat(prompts_1.PROMPT_UTILS.COMMANDS, "\n\n## COMMON PATTERNS TO AVOID:\n").concat(prompts_1.PROMPT_UTILS.COMMON_PITFALLS, "\n").concat(prompts_1.PROMPT_UTILS.REACT_RENDER_LOOP_PREVENTION, " \n\n<CLIENT REQUEST>\n\"{{query}}\"\n</CLIENT REQUEST>\n\n<BLUEPRINT>\n{{blueprint}}\n</BLUEPRINT>\n\n<DEPENDENCIES>\nThese are the dependencies that came installed in the environment:\n{{dependencies}}\n\nIf anything else is used in the project, make sure it is installed in the environment\n</DEPENDENCIES>\n\n{{template}}");
var USER_PROMPT = "\n<REPORTED_ISSUES>\n{{issues}}\n</REPORTED_ISSUES>\n\n<CURRENT_CODEBASE>\n{{context}}\n</CURRENT_CODEBASE>\n\n<ANALYSIS_INSTRUCTIONS>\n**Step 1: Filter Stale Errors**\n- Compare reported errors against current codebase\n- SKIP errors mentioning files/components that no longer exist\n- SKIP errors that don't match current code structure\n\n**Step 2: Prioritize React Render Loops**\n- Search for \"Maximum update depth exceeded\" patterns\n- Look for useEffect without dependencies that modify state\n- Identify unstable object/array references in hooks\n- Flag setState calls during render phase\n\n**Step 3: Comprehensive Codebase Analysis**\n- Scan each file for logic errors and broken functionality\n- Check UI components for rendering and layout issues\n- Validate state management patterns and data flow\n- Identify incomplete features and missing implementations\n- Review error handling and loading states\n\n**Step 4: Business Logic Validation**\n- Verify conditional logic and calculations are correct\n- Check form validation and user input handling\n- Ensure API calls and data transformations work properly\n- Validate user flows and navigation patterns\n\n**Step 5: UI/UX Issue Detection**\n- Check for broken layouts and styling issues\n- Identify missing responsive design implementations\n- Find accessibility violations and missing states\n- Validate component props and data binding\n\n**Step 6: Provide Parallel-Ready File Fixes**\nIMPORTANT: Your output will be used to run PARALLEL FileRegeneration operations - one per file. Structure your findings accordingly:\n\n- **Group issues by file path** - each file will be fixed independently\n- **Make each file's issues self-contained** - don't reference other files in the fix\n- **Avoid cross-file dependencies** in fixes - each file must be fixable in isolation\n- **Provide complete context per file** - include all necessary details for that file\n\nFor each file with issues, provide:\n- **FILE:** [exact file path]\n- **ISSUES:** [List of specific issues in this file only]\n- **PRIORITY:** Critical/High/Medium (for this file)\n- **FIX_SCOPE:** [What needs to be changed in this specific file]\n\n**PARALLEL OPERATION CONSTRAINTS:**\n- Each file will be processed by a separate FileRegeneration agent\n- Agents cannot communicate with each other during fixes\n- All issues for a file must be fixable without knowing other files' changes\n- Avoid fixes that require coordinated changes across multiple files\n- If a cross-file issue exists, break it down into independent file-specific fixes\n\n**ANALYSIS SCOPE:**\n- Analyze ALL files in the codebase systematically\n- Group discovered issues by the file they occur in\n- Ensure each file's issues are complete and self-contained\n- Prioritize issues that can be fixed independently\n- Flag any issues requiring coordinated multi-file changes separately\n</ANALYSIS_INSTRUCTIONS>";
var userPromptFormatter = function (issues, context) {
    var prompt = USER_PROMPT
        .replaceAll('{{issues}}', (0, prompts_1.issuesPromptFormatter)(issues))
        .replaceAll('{{context}}', context);
    return prompts_1.PROMPT_UTILS.verifyPrompt(prompt);
};
var CodeReviewOperation = /** @class */ (function (_super) {
    __extends(CodeReviewOperation, _super);
    function CodeReviewOperation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CodeReviewOperation.prototype.execute = function (inputs, options) {
        return __awaiter(this, void 0, void 0, function () {
            var issues, env, logger, context, filesContext, messages, reviewResult, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        issues = inputs.issues;
                        env = options.env, logger = options.logger, context = options.context;
                        logger.info("Performing code review");
                        logger.info("Running static code analysis via linting...");
                        // Log all types of issues for comprehensive analysis
                        if (issues.runtimeErrors.length > 0) {
                            logger.info("Found ".concat(issues.runtimeErrors.length, " runtime errors: ").concat(issues.runtimeErrors.map(function (e) { return e.message; }).join(', ')));
                        }
                        if (issues.staticAnalysis.lint.issues.length > 0) {
                            logger.info("Found ".concat(issues.staticAnalysis.lint.issues.length, " lint issues"));
                        }
                        if (issues.staticAnalysis.typecheck.issues.length > 0) {
                            logger.info("Found ".concat(issues.staticAnalysis.typecheck.issues.length, " typecheck issues"));
                        }
                        logger.info("Performing comprehensive codebase analysis for all issue types (runtime, logic, UI, state management, incomplete features)");
                        filesContext = getFilesContext(context);
                        messages = [
                            (0, common_1.createSystemMessage)((0, prompts_1.generalSystemPromptBuilder)(SYSTEM_PROMPT, {
                                query: context.query,
                                blueprint: context.blueprint,
                                templateDetails: context.templateDetails,
                                dependencies: context.dependencies,
                                forCodegen: true
                            })),
                            (0, common_1.createUserMessage)(userPromptFormatter(issues, filesContext)),
                        ];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, infer_1.executeInference)({
                                env: env,
                                messages: messages,
                                schema: schemas_1.CodeReviewOutput,
                                agentActionName: "codeReview",
                                context: options.inferenceContext,
                                reasoning_effort: issues.runtimeErrors.length || issues.staticAnalysis.lint.issues.length || issues.staticAnalysis.typecheck.issues.length > 0 ? undefined : 'low',
                                // format: 'markdown'
                            })];
                    case 2:
                        reviewResult = (_a.sent()).object;
                        if (!reviewResult) {
                            throw new Error("Failed to get code review result");
                        }
                        return [2 /*return*/, reviewResult];
                    case 3:
                        error_1 = _a.sent();
                        logger.error("Error during code review:", error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return CodeReviewOperation;
}(common_2.AgentOperation));
exports.CodeReviewOperation = CodeReviewOperation;
/**
 * Get files context for review
 */
function getFilesContext(context) {
    var files = context.allFiles;
    var filesObject = { files: files };
    return schemaFormatters_1.TemplateRegistry.markdown.serialize(filesObject, zod_1.z.object({
        files: zod_1.z.array(schemas_1.FileOutputSchema)
    }));
}
