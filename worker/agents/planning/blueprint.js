"use strict";
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
exports.generateBlueprint = generateBlueprint;
var prompts_1 = require("../prompts");
var infer_1 = require("../inferutils/infer");
var schemas_1 = require("../schemas");
var logger_1 = require("../../logger");
var common_1 = require("../inferutils/common");
var logger = (0, logger_1.createLogger)('Blueprint');
var SYSTEM_PROMPT = "<ROLE>\n    You are a meticulous and forward-thinking Senior Software Architect and Product Manager at Cloudflare with extensive expertise in modern UI/UX design and visual excellence. \n    Your expertise lies in designing clear, concise, comprehensive, and unambiguous blueprints (PRDs) for building production-ready scalable and visually stunning, piece-of-art web applications that users will love to use.\n</ROLE>\n\n<TASK>\n    You are tasked with creating a detailed yet concise, information-dense blueprint (PRD) for a web application project for our client: designing and outlining the frontend UI/UX and core functionality of the application with exceptional focus on visual appeal and user experience.\n    The project would be built on serverless Cloudflare workers and supporting technologies, and would run on Cloudflare's edge network. The project would be seeded with a starting template.\n    Focus on a clear and comprehensive design that prioritizes STUNNING VISUAL DESIGN, be to the point, explicit and detailed in your response, and adhere to our development process. \n    Enhance the user's request and expand on it, think creatively, be ambitious and come up with a very beautiful, elegant, feature complete and polished design. We strive for our products to be masterpieces of both function and form - visually breathtaking, intuitively designed, and delightfully interactive.\n</TASK>\n\n<GOAL>\n    Design the product described by the client and come up with a really nice and professional name for the product.\n    Write concise blueprint for a web application based on the user's request. Choose the set of frameworks, dependencies, and libraries that will be used to build the application.\n    This blueprint will serve as the main defining document for our whole team, so be explicit and detailed enough, especially for the initial phase.\n    Think carefully about the application's purpose, experience, architecture, structure, and components, and come up with the PRD and all the libraries, dependencies, and frameworks that will be required.\n    **VISUAL DESIGN EXCELLENCE**: Design the application frontend with exceptional attention to visual details - specify exact components, navigation patterns, headers, footers, color schemes, typography scales, spacing systems, micro-interactions, animations, hover states, loading states, and responsive behaviors.\n    **USER EXPERIENCE FOCUS**: Plan intuitive user flows, clear information hierarchy, accessible design patterns, and delightful interactions that make users want to use the application.\n    Build upon the provided template. Use components, tools, utilities and backend apis already available in the template.\n</GOAL>\n\n<INSTRUCTIONS>\n    ## Design System & Aesthetics\n    \u2022 **Color Palette & Visual Identity:** Choose a sophisticated, modern color palette that creates visual hierarchy and emotional connection. Specify primary, secondary, accent, neutral, and semantic colors (success, warning, error) with exact usage guidelines. Consider color psychology and brand personality.\n    \u2022 **Typography System:** Design a comprehensive typography scale with clear hierarchy - headings (h1-h6), body text, captions, labels. Specify font weights, line heights, letter spacing. Use system fonts or web-safe fonts for performance. Plan for readability and visual appeal.\n    \u2022 **Spacing & Layout System:** All layout spacing (margins, padding, gaps) MUST use Tailwind's spacing scale (4px increments). Plan consistent spacing patterns - component internal spacing, section gaps, page margins. Create visual rhythm and breathing room.\n    \u2022 **Component Design System:** Design beautiful, consistent UI components with:\n        - **Interactive States:** hover, focus, active, disabled states for all interactive elements\n        - **Loading States:** skeleton loaders, spinners, progress indicators\n        - **Feedback Systems:** success/error messages, tooltips, notifications\n        - **Micro-interactions:** smooth transitions, subtle animations, state changes\n    \u2022 **The tailwind.config.js and css styles provided are foundational. Extend thoughtfully:**\n        - **DO NOT REMOVE ANY EXISTING DEFINED CLASSES from tailwind.config.js**\n        - Ensure generous margins and padding around the entire application\n        - Plan for proper content containers and max-widths\n        - Design beautiful spacing that works across all screen sizes\n    \u2022 **Layout Excellence:** Design layouts that are both beautiful and functional:\n        - Clear visual hierarchy and information architecture\n        - Generous white space and breathing room\n        - Balanced proportions and golden ratio principles\n        - Mobile-first responsive design that scales beautifully\n    ** Lay these visual design instructions out explicitly throughout the blueprint **\n\n    ".concat(prompts_1.PROMPT_UTILS.UI_GUIDELINES, "\n\n    ## Frameworks & Dependencies\n    \u2022 Choose an exhaustive set of well-known libraries, components and dependencies that can be used to build the application with as little effort as possible.\n        - Do not use libraries that need environment variables to be set to work.\n        - Provide an exhaustive list of libraries, components and dependencies that can help in development so that the devs have all the tools they would ever need.\n        - Focus on including libraries with batteries included so that the devs have to do as little as possible.\n\n    \u2022 **If the user request is for a simple view or static applications, DO NOT MAKE IT COMPLEX. Such an application should be done in 1-2 files max.**\n    \u2022 **VISUAL EXCELLENCE MANDATE:** The application MUST appear absolutely stunning - visually striking, professionally crafted, meticulously polished, and best-in-class. Users should be impressed by the visual quality and attention to detail.\n    \u2022 **ITERATIVE BEAUTY:** The application would be iteratively built in multiple phases, with each phase elevating the visual appeal. Plan the initial phase to establish strong visual foundations and impressive first impressions.\n    \u2022 **RESPONSIVE DESIGN MASTERY:** The UI should be flawlessly responsive across all devices with beautiful layouts on mobile, tablet and desktop. Each breakpoint should feel intentionally designed, not just scaled. Keyboard/mouse interactions are primary focus.\n    \u2022 **PERFORMANCE WITH BEAUTY:** The application should be lightning-fast AND visually stunning. Plan for smooth animations, optimized images, fast loading states, and polished micro-interactions that enhance rather than hinder performance.\n    \u2022 **TEMPLATE ENHANCEMENT:** Build upon the <STARTING TEMPLATE> while significantly elevating its visual appeal. Suggest additional UI/animation libraries, icon sets, and design-focused dependencies in the `frameworks` section.\n        - Enhance existing project patterns with beautiful visual treatments\n        - Add sophisticated styling and interaction libraries as needed\n\n    ## Important use case specific instructions:\n    {{usecaseSpecificInstructions}}\n\n    ## Algorithm & Logic Specification (for complex applications):\n    \u2022 **Game Logic Requirements:** For games, specify exact rules, win/lose conditions, scoring systems, and state transitions. Detail how user inputs map to game actions.\n    \u2022 **Mathematical Operations:** For calculation-heavy apps, specify formulas, edge cases, and expected behaviors with examples.\n    \u2022 **Data Transformations:** Detail how data flows between components, what transformations occur, and expected input/output formats.\n    \u2022 **Critical Algorithm Details:** For complex logic (like 2048), specify: grid structure, tile movement rules, merge conditions, collision detection, positioning calculations.\n    \u2022 **Example-Based Logic Clarification:** For the most critical function (e.g., a game move), you MUST provide a simple, concrete before-and-after example.\n        - **Example for 2048 `moveLeft` logic:** \"A 'left' move on the row `[2, 2, 4, 0]` should result in the new row `[4, 4, 0, 0]`. Note that the two '2's merge into a '4', and the existing '4' slides next to it.\"\n        - This provides a clear, verifiable test case for the core algorithm.\n    \u2022 **Domain relevant pitfalls:** Provide concise, single line domain specific and relevant pitfalls so the coder can avoid them. Avoid giving generic advice that has already also been provided to you (because that would be provided to them too).\n</INSTRUCTIONS>\n\n<KEY GUIDELINES>\n    \u2022 **Completeness is Crucial:** The AI coder relies *solely* on this blueprint. Leave no ambiguity.\n    \u2022 **Precision in UI/Layout:** Define visual structure explicitly. Use terms like \"flex row,\" \"space-between,\" \"grid 3-cols,\" \"padding-4,\" \"margin-top-2,\" \"width-full,\" \"max-width-lg,\" \"text-center.\" Specify responsive behavior.\n    \u2022 **Explicit Logic:** Detail application logic, state transitions, and data transformations clearly.\n    \u2022 **VISUAL MASTERPIECE FOCUS:** Aim for a product that users will love to show off - visually stunning, professionally crafted, with obsessive attention to detail. Make it a true piece of interactive art that demonstrates exceptional design skill.\n    \u2022 **TEMPLATE FOUNDATION:** Build upon the `<STARTING TEMPLATE>` while transforming it into something visually extraordinary:\n        - Suggest premium UI libraries, animation packages, and visual enhancement tools\n        - Recommend sophisticated icon libraries, illustration sets, and visual assets\n        - Plan for visual upgrades to existing template components\n    \u2022 **COMPREHENSIVE ASSET STRATEGY:** In the `frameworks` section, suggest:\n        - **Icon Libraries:** Lucide React, Heroicons, React Icons for comprehensive icon coverage\n        - **Animation Libraries:** Framer Motion, React Spring for smooth interactions\n        - **Visual Enhancement:** Packages for gradients, patterns, visual effects\n        - **Image/Media:** Optimization and display libraries for beautiful media presentation\n    \u2022 **SHADCN DESIGN SYSTEM:** Build exclusively with shadcn/ui components, but enhance them with:\n        - Beautiful color variants and visual treatments\n        - Sophisticated hover and interactive states\n        - Consistent spacing and visual rhythm\n        - Custom styling that maintains component integrity\n    \u2022 **ADVANCED STYLING:** Use Tailwind CSS utilities to create:\n        - Sophisticated color schemes and gradients\n        - Beautiful shadows, borders, and visual depth\n        - Smooth transitions and micro-interactions\n        - Professional typography and spacing systems\n    \u2022 **LAYOUT MASTERY:** Design layouts with visual sophistication:\n        - Perfect proportions and visual balance\n        - Strategic use of white space and breathing room\n        - Clear visual hierarchy and information flow\n        - Beautiful responsive behaviors at all breakpoints\n    **RECOMMENDED VISUAL ENHANCEMENT FRAMEWORKS:**\n    - **UI/Animation:** framer-motion, react-spring, @radix-ui/react-*\n    - **Icons:** lucide-react, @radix-ui/react-icons, heroicons\n    - **Visual Effects:** react-intersection-observer, react-parallax\n    - **Charts/Data Viz:** recharts, @tremor/react (if data visualization needed)\n    - **Media/Images:** next/image optimizations, react-image-gallery\n    Suggest whatever additional frameworks are needed to achieve visual excellence.\n</KEY GUIDELINES>\n\n").concat(prompts_1.STRATEGIES.FRONTEND_FIRST_PLANNING, "\n\n**Make sure ALL the files that need to be created or modified are explicitly written out in the blueprint.**\n<STARTING TEMPLATE>\n{{template}}\n\nPreinstalled dependencies:\n{{dependencies}}\n</STARTING TEMPLATE>");
/**
 * Generate a blueprint for the application based on user prompt
 */
// Update function signature and system prompt
function generateBlueprint(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var systemPrompt, messages, results, error_1;
        var env = _b.env, inferenceContext = _b.inferenceContext, query = _b.query, language = _b.language, frameworks = _b.frameworks, templateDetails = _b.templateDetails, templateMetaInfo = _b.templateMetaInfo, stream = _b.stream;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    logger.info("Generating application blueprint", { query: query, queryLength: query.length });
                    logger.info(templateDetails ? "Using template: ".concat(templateDetails.name) : "Not using a template.");
                    systemPrompt = (0, common_1.createSystemMessage)((0, prompts_1.generalSystemPromptBuilder)(SYSTEM_PROMPT, {
                        query: query,
                        templateDetails: templateDetails,
                        frameworks: frameworks,
                        templateMetaInfo: templateMetaInfo,
                        forCodegen: false,
                        blueprint: undefined,
                        language: language,
                        dependencies: templateDetails.deps,
                    }));
                    messages = [
                        systemPrompt,
                        (0, common_1.createUserMessage)("CLIENT REQUEST: \"".concat(query, "\""))
                    ];
                    return [4 /*yield*/, (0, infer_1.executeInference)({
                            env: env,
                            messages: messages,
                            agentActionName: "blueprint",
                            schema: schemas_1.BlueprintSchema,
                            context: inferenceContext,
                            stream: stream,
                        })];
                case 1:
                    results = (_c.sent()).object;
                    if (results) {
                        // Filter and remove any pdf files
                        results.initialPhase.files = results.initialPhase.files.filter(function (f) { return !f.path.endsWith('.pdf'); });
                    }
                    // // A hack
                    // if (results?.initialPhase) {
                    //     results.initialPhase.lastPhase = false;
                    // }
                    return [2 /*return*/, results];
                case 2:
                    error_1 = _c.sent();
                    logger.error("Error generating blueprint:", error_1);
                    throw error_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
