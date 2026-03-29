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
exports.PhaseGenerationOperation = void 0;
var schemas_1 = require("../schemas");
var common_1 = require("../inferutils/common");
var infer_1 = require("../inferutils/infer");
var prompts_1 = require("../prompts");
var common_2 = require("../operations/common");
var config_1 = require("../inferutils/config");
var SYSTEM_PROMPT = "<ROLE>\n    You are a meticulous and seasoned senior software architect at Cloudflare with expertise in modern UI/UX design. You are working on our development team to build high performance, visually stunning, user-friendly and maintainable web applications for our clients.\n    You are responsible for planning and managing the core development process, laying out the development strategy and phases that prioritize exceptional user experience and beautiful, modern design.\n</ROLE>\n\n<TASK>\n    You are given the blueprint (PRD) and the client query. You will be provided with all previously implemented project phases, the current latest snapshot of the codebase, and any current runtime issues or static analysis reports.\n    \n    **Your primary task:** Design the next phase of the project as a deployable milestone leading to project completion.\n    \n    **Phase Planning Process:**\n    1. **ANALYZE** current codebase state and identify what's implemented vs. what remains\n    2. **PRIORITIZE** critical runtime errors that block deployment (render loops, undefined errors, import issues)\n    3. **DESIGN** next logical development milestone following our phase strategy with emphasis on:\n       - **Visual Excellence**: Modern, professional UI using Tailwind CSS best practices\n       - **User Experience**: Intuitive navigation, clear information hierarchy, responsive design\n       - **Interactive Elements**: Smooth animations, proper loading states, engaging micro-interactions\n       - **Accessibility**: Proper semantic HTML, ARIA labels, keyboard navigation\n    4. **VALIDATE** that the phase will be deployable with all views/pages working beautifully across devices\n    \n    The project needs to be fully ready to ship in a reasonable amount of time. Plan accordingly.\n    If no more phases are needed, conclude by putting blank fields in the response.\n    Follow the <PHASES GENERATION STRATEGY> as your reference policy for building and delivering projects.\n    You cannot suggest changes to core configuration files (package.json, tsconfig.json, etc.) except specific exceptions like tailwind.config.js.\n    **Never write image files! Never write jpeg, png, svg, etc files yourself! Always use some image url from the web.**\n</TASK>\n\n<STARTING TEMPLATE>\n{{template}}\n</STARTING TEMPLATE>\n\n<CLIENT REQUEST>\n\"{{query}}\"\n</CLIENT REQUEST>\n\n<BLUEPRINT>\n{{blueprint}}\n</BLUEPRINT>\n\n<DEPENDENCIES>\n**Available Dependencies:** You can ONLY import and use dependencies from the following==>\n\ntemplate dependencies:\n{{dependencies}}\n\nadditional dependencies/frameworks provided:\n{{blueprintDependencies}}\n\nThese are the only dependencies, components and plugins available for the project. No other plugin or component or dependency is available.\n</DEPENDENCIES>";
var NEXT_PHASE_USER_PROMPT = "**GENERATE THE PHASE**\n{{generateInstructions}}\nAdhere to the following guidelines: \n\n<SUGGESTING NEXT PHASE>\n\u2022   Suggest the next phase based on the current progress, the overall application architecture, suggested phases in the blueprint, current runtime errors/bugs and any user suggestions.\n\u2022   Please ignore non functional or non critical issues. Your primary task is to suggest project development phases. Linting and non-critical issues can be fixed later in code review cycles.\n\u2022   **CRITICAL RUNTIME ERROR PRIORITY**: If any runtime errors are present, they MUST be the primary focus of this phase. Runtime errors prevent deployment and user testing.\n    \n    **Priority Order for Critical Errors:**\n    1. **React Render Loops** - \"Maximum update depth exceeded\", \"Too many re-renders\", useEffect infinite loops\n    2. **Undefined Property Access** - \"Cannot read properties of undefined\", missing null checks\n    3. **Import/Export Errors** - Wrong import syntax (@xyflow/react named vs default, @/lib/utils)\n    4. **Tailwind Class Errors** - Invalid classes (border-border vs border)\n    5. **Component Definition Errors** - Missing exports, undefined components\n    \n    **Error Handling Protocol:**\n    - Name phase to reflect fixes: \"Fix Critical Runtime Errors and [Feature]\"\n    - Cross-reference error line numbers with current code structure\n    - Validate reported issues exist before planning fixes\n    - Focus on deployment-blocking issues over linting warnings\n\u2022   Thoroughly review all the previous phases and the current implementation snapshot. Verify the frontend elements, UI, and backend components.\n    - **Understand what has been implemented and what remains** We want a fully finished product eventually! No feature should be left unimplemented if its possible to implement it in the current project environment with purely open source tools and free tier services (i.e, without requiring any third party paid/API key service).\n    - Each phase should work towards achieving the final product. **ONLY** mark as last phase if you are sure the project is at least 90-95% finished.\n    - If a certain feature can't be implemented due to constraints, use mock data or best possible alternative that's still possible.\n    - Thoroughly review the current codebase and identify and fix any bugs, incomplete features or unimplemented stuff.\n\u2022   **BEAUTIFUL UI PRIORITY**: Next phase should cover fixes (if any), development, AND significant focus on creating visually stunning, professional-grade UI/UX with:\n    - Modern design patterns and visual hierarchy\n    - Smooth animations and micro-interactions  \n    - Beautiful color schemes and typography\n    - Proper spacing, shadows, and visual polish\n    - Engaging user interface elements\n\u2022   Use the <PHASES GENERATION STRATEGY> section to guide your phase generation.\n\u2022   Ensure the next phase logically and iteratively builds on the previous one.\n\u2022   Provide a clear, concise, to the point description of the next phase and the purpose and contents of each file in it.\n\u2022   Keep all the description fields very short and concise.\n\u2022   If there are any files that were supposed to be generated in the previous phase, but were not, please mention them in the phase description and suggest them in the phase.\n\u2022   Always suggest phases in sequential ordering - Phase 1 comes after Phase 0, Phase 2 comes after Phase 1 and so on.\n\u2022   **Every phase needs to be deployable with all the views/pages working properly AND looking absolutely beautiful!**\n\u2022   **VISUAL EXCELLENCE STANDARD**: Each phase should elevate the app's visual appeal with modern design principles, ensuring users are impressed by both functionality and aesthetics.\n\u2022   IF you need to get any file to be deleted or cleaned, please set the `changes` field to `delete` for that file.\n\u2022   **NEVER WRITE IMAGE FILES! NEVER WRITE JPEG, PNG, SVG, ETC FILES YOURSELF! ALWAYS USE SOME IMAGE URL FROM THE WEB.**\n</SUGGESTING NEXT PHASE>\n\nAlways remember our strategy for phase generation: \n".concat(prompts_1.STRATEGIES.FRONTEND_FIRST_PLANNING, "\n\n<DONT_TOUCH_FILES>\n**STRICTLY DO NOT TOUCH THESE FILES**\n- \"wrangler.jsonc\"\n- \"wrangler.toml\"\n- \"donttouch_files.json\"\n- \".important_files.json\"\n- \"worker/index.ts\"\n- \"worker/core-utils.ts\"\n\nThese files are very critical and redacted for security reasons. Don't modify the worker bindings the core-utils or the worker index file.\n</DONT_TOUCH_FILES>\n\n").concat(prompts_1.PROMPT_UTILS.COMMON_DEP_DOCUMENTATION, "\n\n{{issues}}\n\n{{userSuggestions}}");
var formatUserSuggestions = function (suggestions) {
    if (!suggestions || suggestions.length === 0) {
        return '';
    }
    return "\n<USER SUGGESTIONS>\nThe following client suggestions and feedback have been provided, relayed by our client conversation agent.\nPlease incorporate these suggestions **on priority** into your phase planning:\n\n**Client Feedback & Suggestions**:\n".concat(suggestions.map(function (suggestion, index) { return "".concat(index + 1, ". ").concat(suggestion); }).join('\n'), "\n\n**IMPORTANT**: These suggestions should be considered alongside the project's natural progression. If the project is mostly finished, just focus on implementing the suggestions.\nIf any suggestions conflict with architectural patterns or project goals, prioritize architectural consistency while finding creative ways to address user needs.\nConsider these suggestions when planning the files, components, and features for this phase.\nTry to make small targeted, isolated changes to the codebase to address the user's suggestions unless a complete rework is required.\n</USER SUGGESTIONS>");
};
var userPromptFormatter = function (issues, userSuggestions, isUserSuggestedPhase) {
    var prompt = NEXT_PHASE_USER_PROMPT
        .replaceAll('{{issues}}', (0, prompts_1.issuesPromptFormatter)(issues))
        .replaceAll('{{userSuggestions}}', formatUserSuggestions(userSuggestions));
    if (isUserSuggestedPhase) {
        prompt = prompt.replaceAll('{{generateInstructions}}', 'User requested some changes/modifications. Please thoroughly review the user suggestions and generate the next phase of the application accordingly');
    }
    else {
        prompt = prompt.replaceAll('{{generateInstructions}}', 'Generate the next phase of the application.');
    }
    return prompts_1.PROMPT_UTILS.verifyPrompt(prompt);
};
var PhaseGenerationOperation = /** @class */ (function (_super) {
    __extends(PhaseGenerationOperation, _super);
    function PhaseGenerationOperation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PhaseGenerationOperation.prototype.execute = function (inputs, options) {
        return __awaiter(this, void 0, void 0, function () {
            var issues, userSuggestions, isUserSuggestedPhase, env, logger, context, suggestionsInfo, messages, results, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        issues = inputs.issues, userSuggestions = inputs.userSuggestions, isUserSuggestedPhase = inputs.isUserSuggestedPhase;
                        env = options.env, logger = options.logger, context = options.context;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        suggestionsInfo = userSuggestions && userSuggestions.length > 0
                            ? "with ".concat(userSuggestions.length, " user suggestions")
                            : "without user suggestions";
                        logger.info("Generating next phase ".concat(suggestionsInfo));
                        messages = __spreadArray(__spreadArray([], (0, common_2.getSystemPromptWithProjectContext)(SYSTEM_PROMPT, context, false), true), [
                            (0, common_1.createUserMessage)(userPromptFormatter(issues, userSuggestions, isUserSuggestedPhase))
                        ], false);
                        return [4 /*yield*/, (0, infer_1.executeInference)({
                                env: env,
                                messages: messages,
                                agentActionName: "phaseGeneration",
                                schema: schemas_1.PhaseConceptGenerationSchema,
                                context: options.inferenceContext,
                                reasoning_effort: (userSuggestions || issues.runtimeErrors.length > 0) ? config_1.AGENT_CONFIG.phaseGeneration.reasoning_effort == 'low' ? 'medium' : 'high' : undefined,
                                format: 'markdown',
                            })];
                    case 2:
                        results = (_a.sent()).object;
                        logger.info("Generated next phase: ".concat(results.name, ", ").concat(results.description));
                        return [2 /*return*/, results];
                    case 3:
                        error_1 = _a.sent();
                        logger.error("Error generating next phase:", error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return PhaseGenerationOperation;
}(common_2.AgentOperation));
exports.PhaseGenerationOperation = PhaseGenerationOperation;
