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
exports.selectTemplate = selectTemplate;
var logger_1 = require("../../logger");
var infer_1 = require("../inferutils/infer");
var errors_1 = require("../../../shared/types/errors");
var schemas_1 = require("../../agents/schemas");
var logger = (0, logger_1.createLogger)('TemplateSelector');
/**
 * Uses AI to select the most suitable template for a given query.
 */
function selectTemplate(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var templateDescriptions, systemPrompt, userPrompt, messages, selection, error_1;
        var env = _b.env, query = _b.query, availableTemplates = _b.availableTemplates, inferenceContext = _b.inferenceContext;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (availableTemplates.length === 0) {
                        logger.info("No templates available for selection.");
                        return [2 /*return*/, { selectedTemplateName: null, reasoning: "No templates were available to choose from.", useCase: null, complexity: null, styleSelection: null, projectName: '' }];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    logger.info("Asking AI to select a template", {
                        query: query,
                        queryLength: query.length,
                        availableTemplates: availableTemplates.map(function (t) { return t.name; }),
                        templateCount: availableTemplates.length
                    });
                    templateDescriptions = availableTemplates.map(function (t, index) { var _a; return "- Template #".concat(index + 1, " \n Name - ").concat(t.name, " \n Language: ").concat(t.language, ", Frameworks: ").concat(((_a = t.frameworks) === null || _a === void 0 ? void 0 : _a.join(', ')) || 'None', "\n ").concat(t.description.selection); }).join('\n\n');
                    systemPrompt = "You are an Expert Software Architect at Cloudflare specializing in template selection for rapid development. Your task is to select the most suitable starting template based on user requirements.\n\n## SELECTION EXAMPLES:\n\n**Example 1 - Game Request:**\nUser: \"Build a 2D puzzle game with scoring\"\nTemplates: [\"react-dashboard\", \"react-game-starter\", \"vue-blog\"]\nSelection: \"react-game-starter\"\ncomplexity: \"simple\"\nReasoning: \"Game starter template provides canvas setup, state management, and scoring systems\"\n\n**Example 2 - Business Dashboard:**\nUser: \"Create an analytics dashboard with charts\"\nTemplates: [\"react-dashboard\", \"nextjs-blog\", \"vanilla-js\"]\nSelection: \"react-dashboard\"\ncomplexity: \"simple\" // Because single page application\nReasoning: \"Dashboard template includes chart components, grid layouts, and data visualization setup\"\n\n**Example 3 - No Perfect Match:**\nUser: \"Build a recipe sharing app\"\nTemplates: [\"react-social\", \"vue-blog\", \"angular-todo\"]\nSelection: \"react-social\"\ncomplexity: \"simple\" // Because single page application\nReasoning: \"Social template provides user interactions, content sharing, and community features closest to recipe sharing needs\"\n\n## SELECTION CRITERIA:\n1. **Feature Alignment** - Templates with similar core functionality\n2. **Tech Stack Match** - Compatible frameworks and dependencies  \n3. **Architecture Fit** - Similar application structure and patterns\n4. **Minimal Modification** - Template requiring least changes\n\n## STYLE GUIDE:\n- **Minimalist Design**: Clean, simple interfaces\n- **Brutalism**: Bold, raw, industrial aesthetics\n- **Retro**: Vintage, nostalgic design elements\n- **Illustrative**: Rich graphics and visual storytelling\n- **Kid_Playful**: Colorful, fun, child-friendly interfaces\n\n## RULES:\n- ALWAYS select a template (never return null)\n- Ignore misleading template names - analyze actual features\n- Focus on functionality over naming conventions\n- Provide clear, specific reasoning for selection";
                    userPrompt = "**User Request:** \"".concat(query, "\"\n\n**Available Templates:**\n").concat(templateDescriptions, "\n\n**Task:** Select the most suitable template and provide:\n1. Template name (exact match from list)\n2. Clear reasoning for why it fits the user's needs\n3. Appropriate style for the project type. Try to come up with unique styles that might look nice and unique. Be creative about your choices.\n4. Descriptive project name\n\nAnalyze each template's features, frameworks, and architecture to make the best match.");
                    messages = [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt }
                    ];
                    return [4 /*yield*/, (0, infer_1.executeInference)({
                            env: env,
                            messages: messages,
                            agentActionName: "templateSelection",
                            schema: schemas_1.TemplateSelectionSchema,
                            context: inferenceContext,
                            maxTokens: 2000,
                        })];
                case 2:
                    selection = (_c.sent()).object;
                    logger.info("AI template selection result: ".concat(selection.selectedTemplateName || 'None', ", Reasoning: ").concat(selection.reasoning));
                    return [2 /*return*/, selection];
                case 3:
                    error_1 = _c.sent();
                    logger.error("Error during AI template selection:", error_1);
                    if (error_1 instanceof errors_1.RateLimitExceededError || error_1 instanceof errors_1.SecurityError) {
                        throw error_1;
                    }
                    // Fallback to no template selection in case of error
                    return [2 /*return*/, { selectedTemplateName: null, reasoning: "An error occurred during the template selection process.", useCase: null, complexity: null, styleSelection: null, projectName: '' }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
