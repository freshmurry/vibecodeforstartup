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
exports.PhaseImplementationOperation = exports.SYSTEM_PROMPT = void 0;
var schemas_1 = require("../schemas");
var common_1 = require("../inferutils/common");
var infer_1 = require("../inferutils/infer");
var prompts_1 = require("../prompts");
var FileProcessing_1 = require("../domain/pure/FileProcessing");
// import { RealtimeCodeFixer } from '../assistants/realtimeCodeFixer';
var common_2 = require("../operations/common");
var scof_1 = require("../streaming-formats/scof");
var schemaFormatters_1 = require("../inferutils/schemaFormatters");
var realtimeCodeFixer_1 = require("../assistants/realtimeCodeFixer");
var config_1 = require("../inferutils/config");
exports.SYSTEM_PROMPT = "<ROLE>\n    You are an Expert Senior Full-Stack Engineer at Cloudflare, renowned for working on mission critical infrastructure and crafting high-performance, visually stunning, robust, and maintainable web applications.\n    You are working on our special team that takes pride in rapid development and delivery of exceptionally beautiful, high quality projects that users love to interact with.\n    You have been tasked to build a project with obsessive attention to visual excellence based on specifications provided by our senior software architect.\n</ROLE>\n\n<GOAL>\n    **Primary Objective:** Build fully functional, production-ready web applications in phases following architect-designed specifications.\n    \n    **Implementation Process:**\n    1. **ANALYZE** current codebase snapshot and identify what needs to be built\n    2. **PRIORITIZE** critical runtime errors that must be fixed first (render loops, undefined errors)\n    3. **IMPLEMENT** phase requirements following blueprint specifications exactly with exceptional focus on:\n       - **Visual Excellence**: Beautiful, modern UI that impresses users\n       - **Interactive Polish**: Smooth animations, hover states, micro-interactions\n       - **Responsive Perfection**: Flawless layouts across all device sizes\n       - **User Experience**: Intuitive navigation, clear feedback, delightful interactions\n    4. **VALIDATE** that implementation is deployable, error-free, AND visually stunning\n    \n    **Success Criteria:**\n    - Application is demoable, deployable, AND visually impressive after this phase\n    - Zero runtime errors or deployment-blocking issues\n    - All phase requirements from architect are fully implemented\n    - Code meets Cloudflare's highest standards for robustness, performance, AND visual excellence\n    - Users are delighted by the interface design and smooth interactions\n    - Every UI element demonstrates professional-grade visual polish\n    \n    **One-Shot Implementation:** You have only one attempt to implement this phase successfully. Quality and reliability are paramount.\n</GOAL>\n\n<CONTEXT>\n    \u2022   You MUST adhere to the <BLUEPRINT> and the <CURRENT_PHASE> provided to implement the current phase. It is your primary specification.\n    \u2022   The project was started based on our standard boilerplate template. It comes preconfigured with certain components preinstalled. \n    \u2022   You will be provided with all of the current project code. Please go through it thoroughly, and understand it deeply before beginning your work. Use the components, utilities and APIs provided in the project.\n    \u2022   Due to security constraints, Only a fixed set of packages and dependencies are allowed for you to use which are preconfigured in the project and listed in <DEPENDENCIES>. Verify every import statement against them before using them.\n    \u2022   If you see any other dependency being referenced, Immediately correct it.\n</CONTEXT>\n\n<CLIENT REQUEST>\n\"{{query}}\"\n</CLIENT REQUEST>\n\n<BLUEPRINT>\n{{blueprint}}\n</BLUEPRINT>\n\n<DEPENDENCIES>\n**Available Dependencies:**\n\nInstalled packages in the project:\n{{dependencies}}\n\nadditional dependencies/frameworks **may** be provided:\n{{blueprintDependencies}}\n\nThese are the only dependencies, components and plugins available for the project\n</DEPENDENCIES>\n\n".concat(prompts_1.PROMPT_UTILS.UI_GUIDELINES, "\n\nWe follow the following strategy at our team for rapidly delivering projects:\n").concat(prompts_1.STRATEGIES.FRONTEND_FIRST_CODING, "\n\n{{template}}");
var USER_PROMPT = "**IMPLEMENT THE FOLLOWING PROJECT PHASE**\n<CURRENT_PHASE>\n{{phaseText}}\n</CURRENT_PHASE>\n\n<INSTRUCTIONS & CODE QUALITY STANDARDS>\nThese are the instructions and quality standards that must be followed to implement this phase.\n**CRITICAL ERROR PREVENTION (Fix These First):**\n    \n    1. **React Render Loop Prevention** - HIGHEST PRIORITY\n       - Never call setState during render phase\n       - Always use dependency arrays in useEffect\n       - Avoid unconditional setState in useEffect\n       - Stabilize object/array references with useMemo/useCallback\n    \n    2. **Variable Declaration Order** - CRITICAL\n       - Declare/import ALL variables before use\n       - Avoid Temporal Dead Zone (TDZ) errors\n       - Check function hoisting rules\n    \n    3. **Import Validation** - DEPLOYMENT BLOCKER\n       - Verify all imports against <DEPENDENCIES>\n       - Check file paths are correct (existing files or generating in this phase)\n       - Ensure named vs default import syntax is correct\n    \n    4. **Runtime Error Prevention**\n       - Add null checks before property access (user?.name)\n       - Validate array length before element access\n       - Use try-catch for async operations\n       - Handle undefined values gracefully\n    \n    **CODE QUALITY STANDARDS:**\n    \u2022   **Robustness:** Write fault-tolerant code with proper error handling and fallbacks\n    \u2022   **State Management:** Ensure UI reflects application state correctly, no infinite re-renders\n    \u2022   **Performance:** Use React.memo, useMemo, useCallback to prevent unnecessary re-renders\n    \u2022   **VISUAL EXCELLENCE & UI MASTERY:** Create stunning, professional-grade UI that exceeds user expectations:\n        - **Pixel-Perfect Layouts:** Ensure UI elements render exactly as per the blueprint with obsessive attention to spacing, alignment, and visual hierarchy\n        - **Beautiful Spacing Systems:** Use consistent, harmonious spacing that creates visual rhythm and breathing room\n        - **Interactive State Design:** Implement beautiful hover, focus, active, and loading states for all interactive elements\n        - **Smooth Animations:** Add subtle, professional micro-interactions and transitions that enhance user experience\n        - **Responsive Excellence:** Create layouts that look intentionally designed at every breakpoint, not just scaled\n        - **Visual Depth:** Use shadows, borders, gradients strategically to create beautiful visual depth and modern appeal\n        - **Typography Mastery:** Implement clear visual hierarchy with perfect font sizes, weights, and spacing\n        - **Color Harmony:** Use colors thoughtfully to create emotional connection and clear information hierarchy\n        - **Component Polish:** Every button, form, card, and interface element should look professionally crafted\n            - Mentally simulate the UI in multiple screen sizes and ensure it looks absolutely beautiful everywhere\n            - Pay special attention to centering, alignment, and visual balance in all components\n    \u2022   **Dependency Verification:** **ONLY** use libraries specified in <DEPENDENCIES>. No other libraries are allowed or exist.\n    \u2022   **Performance:** Write efficient code. Avoid unnecessary computations or re-renders.\n    \u2022   **Styling:** Use the specified CSS approach consistently (e.g., CSS Modules, Tailwind). Ensure class names match CSS definitions.\n    \u2022   **BUG FREE CODE:** Write good quality bug free code of the highest standards. Ensure all syntax is correct and all imports are valid. \n    \u2022   **Please thoroughly review the tailwind.config.js file and existing styling CSS files, and make sure you use only valid defined Tailwind classes in your CSS. Using a class that is not defined in tailwind.config.js will lead to a crash which is very bad.**\n    \u2022   **Ensure there are no syntax errors or typos such as `border-border` (undefined) in tailwind instead of `border` (real class)**\n    \u2022   **You are not permitted to directly interfere or overwrite any of the core config files such as package.json, linting configs, tsconfig etc. except some exceptions**\n    \u2022   **Refrain from writing any SVG from scratch. Use existing public svgs or from an asset library installed in the project. Do not use any asset libraries that are not already installed in the project.**\n    \u2022   **Don't have other exports with react components in the same file, move the exports to a separate file. Use a named function for your React component. Rename your component name to pascal case.**\n    \u2022   **Always review the whole codebase to identify and fix UI issues (spacing, alignment, margins, paddings, etc.), syntax errors, typos, and logical flaws**\n    \u2022   **Do not use any unicode characters in the code. Stick to only outputing valid ASCII characters. Close strings with appropriate quotes.**\n    \u2022   **Try to wrap all essential code in try-catch blocks to isolate errors and prevent application crashes. Treat this project as mission critical**\n    \u2022   **In the footer of pages, you can mention the following: \"Built with \u2764\uFE0F at Cloudflare\"**\n    \u2022   **VISUAL POLISH CHECKLIST:** For every component you create, ensure:\n        - \u2705 Beautiful hover and focus states that feel responsive and delightful\n        - \u2705 Proper visual hierarchy with clear information flow\n        - \u2705 Consistent spacing that follows a harmonious rhythm\n        - \u2705 Professional shadows, borders, and visual depth where appropriate\n        - \u2705 Smooth transitions and micro-interactions that enhance usability\n        - \u2705 Perfect responsive behavior that looks intentional at all screen sizes\n        - \u2705 Accessible design with proper contrast and semantic elements\n    \u2022   **Follow DRY principles by heart. Always research and understand the codebase before making changes. Understand the patterns used in the codebase. Do more in less code, be efficient with code**\n    \u2022   Make sure every component, variable, function, class, and type is defined before it is used. \n    \u2022   Make sure everything that is needed is exported correctly from relevant files. Do not put duplicate 'default' exports.\n    \u2022   You may need to rewrite a file from a *previous* phase *if* you identify a critical issue or runtime errors in it.\n    \u2022   If any previous phase files were not made correctly or were corrupt, You shall also rewrite them in this phase. You are to ensure that the entire codebase is correct and working as expected.\n    \u2022   **Write the whole, raw contents for every file (`full_content` format). Do not use diff format.**\n    \u2022   **Every phase needs to be deployable with all the views/pages working properly!**\n    \u2022   **If its the first phase, make sure you override the template pages in the boilerplate with actual application frontend page!**\n    \u2022   **Make sure the product after this phase is FUNCTIONAL, POLISHED, AND VISUALLY STUNNING**\n        - **Frontend Visual Excellence:** Write frontend code with obsessive attention to visual details:\n            - Perfect spacing, alignment, and proportions that create visual harmony\n            - Beautiful color combinations and thoughtful use of visual hierarchy\n            - Smooth transitions and delightful micro-interactions\n            - Professional-grade component styling that impresses users\n            - Flawless responsive behavior that feels intentionally designed at every breakpoint\n        - **Backend Logic Excellence:** Write backend code with correct logic, data flow and proper error handling\n        - **Design System Consistency:** Maintain consistent visual patterns and component behaviors throughout\n        - Always stick to best design practices, DRY principles and SOLID principles while prioritizing user delight\n    \u2022   **ALWAYS export ALL the components, variables, functions, classes, and types from each and every file**\n    \u2022   Some React specific guidelines:\n        - **Rendering Should Be a Pure Function of Props and State**: A component's render method should be predictable. Given the same inputs (props and state), it should always produce the same JSX output\n        - **Effects are Managed Lifecycles, Not Afterthoughts**: Use useEffect for side effects and state synchronization; never unconditionally update state in render or effects. Guard effect updates with proper dependency arrays and conditions.\n        - **The principle of having a \"single source of truth\" is paramount in React**\n\nAlso understand the following:\n\n".concat(prompts_1.PROMPT_UTILS.COMMON_PITFALLS, "\n\n</INSTRUCTIONS & CODE QUALITY STANDARDS>\n\nEvery single file listed in <CURRENT_PHASE> needs to be implemented in this phase, based on the provided <OUTPUT FORMAT>.\n\n**CRITICAL IMPLEMENTATION RULES:**\n\n\u26A0\uFE0F  **RENDER LOOP PREVENTION** - ZERO TOLERANCE\n- NEVER call setState during render phase\n- ALWAYS use proper dependency arrays in useEffect\n- Check for patterns causing infinite loops before submitting\n- If you write problematic code, REWRITE the entire file immediately\n\n\u26A0\uFE0F  **ZUSTAND SELECTOR POLICY** \u2014 ZERO TOLERANCE\n- Do NOT return objects/arrays from `useStore` selectors\n- Do NOT destructure from object-literal selectors (e.g., `const { a, b } = useStore((s) => ({ a: s.a, b: s.b }))`)\n- Always select primitives individually via separate `useStore` calls\n- If you absolutely must read multiple values in one call, pass zustand's shallow comparator: `useStore(selector, shallow)`. Avoid object literals.\n\n\u26A0\uFE0F  **BACKWARD COMPATIBILITY** - PRESERVE EXISTING FUNCTIONALITY  \n- Do NOT break anything from previous phases\n- Maintain all existing features and functionality\n- Test mentally that previous phase components still work\n- We have frequent regressions - be extra cautious\n\n").concat(prompts_1.PROMPT_UTILS.COMMON_DEP_DOCUMENTATION, "\n\n{{issues}}\n\n{{technicalInstructions}}");
var LAST_PHASE_PROMPT = "Finalization and Review phase. \nGoal: Thoroughly review the entire codebase generated in previous phases. Identify and fix any remaining critical issues (runtime errors, logic flaws, rendering bugs) before deployment.\n** YOU MUST HALT AFTER THIS PHASE **\n\n<REVIEW FOCUS & METHODOLOGY>\n    **Your primary goal is to find showstopper bugs and UI/UX problems. Prioritize:**\n    1.  **Runtime Errors & Crashes:** Any code that will obviously throw errors (Syntax errors, TDZ/Initialization errors, TypeErrors like reading property of undefined, incorrect API calls). **Analyze the provided `errors` carefully for root causes.**\n    2.  **Critical Logic Flaws:** Does the application logic *actually* implement the behavior described in the blueprint? (e.g., Simulate game moves mentally: Does moving left work? Does scoring update correctly? Are win/loss conditions accurate?).\n    3.  **UI Rendering Failures:** Will the UI render as expected? Check for:\n        * **Layout Issues:** Misalignment, Incorrect borders/padding/margins etc, overlapping elements, incorrect spacing/padding, broken responsiveness (test mentally against mobile/tablet/desktop descriptions in blueprint).\n        * **Styling Errors:** Missing or incorrect CSS classes, incorrect framework usage (e.g., wrong Tailwind class).\n        * **Missing Elements:** Are all UI elements described in the blueprint present?\n    4.  **State Management Bugs:** Does state update correctly? Do UI updates reliably reflect state changes? Are there potential race conditions or infinite update loops?\n    5.  **Data Flow & Integration Errors:** Is data passed correctly between components? Do component interactions work as expected? Are imports valid and do the imported files/functions exist?\n    6.  **Event Handling:** Do buttons, forms, and other interactions trigger the correct logic specified in the blueprint?\n    7. **Import/Dependency Issues:** Are all imports valid? Are there any missing or incorrectly referenced dependencies? Are they correct for the specific version installed?\n    8. **Library version issues:** Are you sure the code written is compatible with the installed version of the library? (e.g., Tailwind v3 vs. v4)\n    9. **Especially lookout for setState inside render or without dependencies**\n        - Mentally simulate the linting rule `react-hooks/exhaustive-deps`.\n\n    **Method:**\n    \u2022   Review file-by-file, considering its dependencies and dependents.\n    \u2022   Mentally simulate user flows described in the blueprint.\n    \u2022   Cross-reference implementation against the `description`, `userFlow`, `components`, `dataFlow`, and `implementationDetails` sections *constantly*.\n    \u2022   Pay *extreme* attention to declaration order within scopes.\n    \u2022   Check for any imports that are not defined, installed or are not in the template.\n    \u2022   Come up with a the most important and urgent issues to fix first. We will run code reviews in multiple iterations, so focus on the most important issues first.\n\n    IF there are any runtime errors or linting errors provided, focus on fixing them first and foremost. No need to provide any minor fixes or improvements to the code. Just focus on fixing the errors.\n\n</REVIEW FOCUS & METHODOLOGY>\n\n<ISSUES TO REPORT (Answer these based on your review):>\n    1.  **Functionality Mismatch:** Does the codebase *fail* to deliver any core functionality described in the blueprint? (Yes/No + Specific examples)\n    2.  **Logic Errors:** Are there flaws in the application logic (state transitions, calculations, game rules, etc.) compared to the blueprint? (Yes/No + Specific examples)\n    3.  **Interaction Failures:** Do user interactions (clicks, inputs) behave incorrectly based on blueprint requirements? (Yes/No + Specific examples)\n    4.  **Data Flow Problems:** Is data not flowing correctly between components or managed incorrectly? (Yes/No + Specific examples)\n    5.  **State Management Issues:** Does state management lead to incorrect application behavior or UI? (Yes/No + Specific examples)\n    6.  **UI Rendering Bugs:** Are there specific rendering issues (layout, alignment, spacing, overlap, responsiveness)? (Yes/No + Specific examples of files/components and issues)\n    7.  **Performance Bottlenecks:** Are there obvious performance issues (e.g., inefficient loops, excessive re-renders)? (Yes/No + Specific examples)\n    8.  **UI/UX Quality:** Is the UI significantly different from the blueprint's description or generally poor/unusable (ignoring minor aesthetics)? (Yes/No + Specific examples)\n    9.  **Runtime Error Potential:** Identify specific code sections highly likely to cause runtime errors (TDZ, undefined properties, bad imports, syntax errors etc.). (Yes/No + Specific examples)\n    10. **Dependency/Import Issues:** Are there any invalid imports or usage of non-existent/uninstalled dependencies? (Yes/No + Specific examples)\n\n    If issues pertain to just dependencies not being installed, please only suggest the necessary `bun add` commands to install them. Do not suggest file level fixes.\n</ISSUES TO REPORT (Answer these based on your review):>\n\n**Regeneration Rules:**\n    - Only regenerate files with **critical issues** causing runtime errors, significant logic flaws, or major rendering failures.\n    - **Exception:** Small UI/CSS files *can* be regenerated for styling/alignment fixes if needed.\n    - Do **not** regenerate for minor formatting or non-critical stylistic preferences.\n    - Do **not** make major refactors or architectural changes.\n\n<INSTRUCTIONS>\n    Do not spend much time on this phase. If you find any critical issues, just fix them and move on, we will have thorough code reviews in the next phases.\n    Do not make major changes to the code. Just focus on fixing the critical issues and bugs.\n</INSTRUCTIONS>\n\nThis phase prepares the code for final deployment.";
var README_GENERATION_PROMPT = "<TASK>\nGenerate a comprehensive README.md file for this project based on the provided blueprint and template information.\nThe README should be professional, well-structured, and provide clear instructions for users and developers.\n</TASK>\n\n<INSTRUCTIONS>\n- Create a professional README with proper markdown formatting\n- Do not add any images or screenshots\n- Include project title, description, and key features from the blueprint\n- Add technology stack section based on the template dependencies\n- Include setup/installation instructions using bun (not npm/yarn)\n- Add usage examples and development instructions\n- Include a deployment section with Cloudflare-specific instructions\n- **IMPORTANT**: Add a `[cloudflarebutton]` placeholder near the top and another in the deployment section for the Cloudflare deploy button. Write the **EXACT** string except the backticks and DON'T enclose it in any other button or anything. We will replace it with https://deploy.workers.cloudflare.com/?url=${repositoryUrl} when the repository is created.\n- Structure the content clearly with appropriate headers and sections\n- Be concise but comprehensive - focus on essential information\n- Use professional tone suitable for open source projects\n</INSTRUCTIONS>\n\nGenerate the complete README.md content in markdown format. \nDo not provide any additional text or explanation. \nAll your output will be directly saved in the README.md file. \nDo not provide and markdown fence ``` ``` around the content either! Just pure raw markdown content!";
var specialPhasePromptOverrides = {
    "Finalization and Review": LAST_PHASE_PROMPT,
};
var userPropmtFormatter = function (phaseConcept, issues) {
    var phaseText = schemaFormatters_1.TemplateRegistry.markdown.serialize(phaseConcept, schemas_1.PhaseConceptSchema);
    var prompt = prompts_1.PROMPT_UTILS.replaceTemplateVariables(specialPhasePromptOverrides[phaseConcept.name] || USER_PROMPT, {
        phaseText: phaseText,
        issues: (0, prompts_1.issuesPromptFormatter)(issues)
    });
    return prompts_1.PROMPT_UTILS.verifyPrompt(prompt);
};
var PhaseImplementationOperation = /** @class */ (function (_super) {
    __extends(PhaseImplementationOperation, _super);
    function PhaseImplementationOperation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PhaseImplementationOperation.prototype.execute = function (inputs, options) {
        return __awaiter(this, void 0, void 0, function () {
            var phase, issues, env, logger, context, codeGenerationFormat, messages, streamingState, fixedFilePromises, modelConfig, shouldEnableRealtimeCodeFixer, commands;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        phase = inputs.phase, issues = inputs.issues;
                        env = options.env, logger = options.logger, context = options.context;
                        logger.info("Generating files for phase: ".concat(phase.name), phase.description, "files:", phase.files.map(function (f) { return f.path; }));
                        codeGenerationFormat = new scof_1.SCOFFormat();
                        messages = (0, common_2.getSystemPromptWithProjectContext)(exports.SYSTEM_PROMPT, context, true);
                        messages.push((0, common_1.createUserMessage)(userPropmtFormatter(phase, issues) + codeGenerationFormat.formatInstructions()));
                        streamingState = {
                            accumulator: '',
                            completedFiles: new Map(),
                            parsingState: {}
                        };
                        fixedFilePromises = [];
                        modelConfig = config_1.AGENT_CONFIG.phaseImplementation;
                        if (inputs.isFirstPhase) {
                            modelConfig = config_1.AGENT_CONFIG.firstPhaseImplementation;
                        }
                        shouldEnableRealtimeCodeFixer = inputs.shouldAutoFix && (0, realtimeCodeFixer_1.IsRealtimeCodeFixerEnabled)(options.inferenceContext);
                        // Execute inference with streaming
                        return [4 /*yield*/, (0, infer_1.executeInference)({
                                env: env,
                                agentActionName: "phaseImplementation",
                                context: options.inferenceContext,
                                messages: messages,
                                modelConfig: modelConfig,
                                stream: {
                                    chunk_size: 256,
                                    onChunk: function (chunk) {
                                        codeGenerationFormat.parseStreamingChunks(chunk, streamingState, 
                                        // File generation started
                                        function (filePath) {
                                            logger.info("Starting generation of file: ".concat(filePath));
                                            inputs.fileGeneratingCallback(filePath, FileProcessing_1.FileProcessing.findFilePurpose(filePath, phase, context.allFiles.reduce(function (acc, f) {
                                                var _a;
                                                return (__assign(__assign({}, acc), (_a = {}, _a[f.filePath] = f, _a)));
                                            }, {})));
                                        }, 
                                        // Stream file content chunks
                                        function (filePath, fileChunk, format) {
                                            inputs.fileChunkGeneratedCallback(filePath, fileChunk, format);
                                        }, 
                                        // onFileClose callback
                                        function (filePath) {
                                            var _a;
                                            logger.info("Completed generation of file: ".concat(filePath));
                                            var completedFile = streamingState.completedFiles.get(filePath);
                                            if (!completedFile) {
                                                logger.error("Completed file not found: ".concat(filePath));
                                                return;
                                            }
                                            // Process the file contents
                                            var originalContents = ((_a = context.allFiles.find(function (f) { return f.filePath === filePath; })) === null || _a === void 0 ? void 0 : _a.fileContents) || '';
                                            completedFile.fileContents = FileProcessing_1.FileProcessing.processGeneratedFileContents(completedFile, originalContents, logger);
                                            var generatedFile = __assign(__assign({}, completedFile), { filePurpose: FileProcessing_1.FileProcessing.findFilePurpose(filePath, phase, context.allFiles.reduce(function (acc, f) {
                                                    var _a;
                                                    return (__assign(__assign({}, acc), (_a = {}, _a[f.filePath] = f, _a)));
                                                }, {})) });
                                            if (shouldEnableRealtimeCodeFixer && generatedFile.fileContents.split('\n').length > 50) {
                                                // Call realtime code fixer immediately - this is the "realtime" aspect
                                                var realtimeCodeFixer = new realtimeCodeFixer_1.RealtimeCodeFixer(env, options.inferenceContext);
                                                var fixPromise = realtimeCodeFixer.run(generatedFile, {
                                                    // previousFiles: previousFiles,
                                                    query: context.query,
                                                    template: context.templateDetails
                                                }, phase);
                                                fixedFilePromises.push(fixPromise);
                                            }
                                            else {
                                                fixedFilePromises.push(Promise.resolve(generatedFile));
                                            }
                                            inputs.fileClosedCallback(generatedFile, "Completed generation of ".concat(filePath));
                                        });
                                    }
                                }
                            })];
                    case 1:
                        // Execute inference with streaming
                        _a.sent();
                        commands = streamingState.parsingState.extractedInstallCommands;
                        logger.info("Files generated for phase:", phase.name, "with", fixedFilePromises.length, "files being fixed in real-time and extracted install commands:", commands);
                        // Return generated files for validation and deployment
                        return [2 /*return*/, {
                                // rawFiles: generatedFilesInPhase,
                                fixedFilePromises: fixedFilePromises,
                                deploymentNeeded: fixedFilePromises.length > 0,
                                commands: commands,
                            }];
                }
            });
        });
    };
    PhaseImplementationOperation.prototype.generateReadme = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var env, logger, context, readmePrompt, messages, results, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        env = options.env, logger = options.logger, context = options.context;
                        logger.info("Generating README.md for the project");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        readmePrompt = README_GENERATION_PROMPT;
                        messages = __spreadArray(__spreadArray([], (0, common_2.getSystemPromptWithProjectContext)(exports.SYSTEM_PROMPT, context, true), true), [(0, common_1.createUserMessage)(readmePrompt)], false);
                        return [4 /*yield*/, (0, infer_1.executeInference)({
                                env: env,
                                messages: messages,
                                agentActionName: "projectSetup",
                                context: options.inferenceContext,
                            })];
                    case 2:
                        results = _a.sent();
                        if (!results || !results.string) {
                            logger.error('Failed to generate README.md content');
                            throw new Error('Failed to generate README.md content');
                        }
                        logger.info('Generated README.md content successfully');
                        return [2 /*return*/, {
                                filePath: 'README.md',
                                fileContents: results.string,
                                filePurpose: 'Project documentation and setup instructions'
                            }];
                    case 3:
                        error_1 = _a.sent();
                        logger.error("Error generating README:", error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return PhaseImplementationOperation;
}(common_2.AgentOperation));
exports.PhaseImplementationOperation = PhaseImplementationOperation;
