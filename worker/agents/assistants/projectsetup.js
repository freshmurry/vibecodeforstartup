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
exports.ProjectSetupAssistant = void 0;
var logger_1 = require("../../logger");
var prompts_1 = require("../prompts");
var common_1 = require("../inferutils/common");
var infer_1 = require("../inferutils/infer");
var assistant_1 = require("./assistant");
var config_types_1 = require("../inferutils/config.types");
var common_2 = require("../utils/common");
var SYSTEM_PROMPT = "You are an Expert DevOps Engineer at Cloudflare specializing in project setup and dependency management. Your task is to analyze project requirements and generate precise installation commands for missing dependencies.";
var SETUP_USER_PROMPT = "## TASK\nAnalyze the blueprint and generate exact `bun add` commands for missing dependencies. Only suggest packages that are NOT already in the starting template.\n\n## EXAMPLES\n\n**Example 1 - Game Project:**\nBlueprint mentions: \"2D Canvas game with score persistence\"\nStarting template has: react, typescript, tailwindcss\nOutput:\n```bash\nbun add zustand@^4.5.0\nbun add canvas-confetti@^1.9.0\n```\n\n**Example 2 - Dashboard with Charts:**\nBlueprint mentions: \"Analytics dashboard with interactive charts\"\nStarting template has: react, typescript, vite\nOutput:\n```bash\nbun add recharts@^2.12.0\nbun add date-fns@^3.6.0\nbun add @headlessui/react@^2.0.0\n```\n\n**Example 3 - Already Complete:**\nBlueprint mentions: \"Simple todo app\"\nStarting template has: react, typescript, tailwindcss, lucide-react\nOutput:\n```bash\n# No additional dependencies needed\n```\n\n## RULES\n- Use ONLY `bun add` commands\n- Include specific version constraints (e.g., ^4.5.0)\n- Check version compatibility (React 18 vs 19)\n- Skip dependencies already in starting template\n- Include common companion packages when needed\n- Focus on blueprint requirements only\n\n".concat(prompts_1.PROMPT_UTILS.COMMANDS, "\n\n<INPUT DATA>\n<QUERY>\n{{query}}\n</QUERY>\n\n<BLUEPRINT>\n{{blueprint}}\n</BLUEPRINT>\n\n<STARTING TEMPLATE>\n{{template}}\n\nThese are the only dependencies installed currently\n{{dependencies}}\n</STARTING TEMPLATE>\n\nYou need to make sure **ALL THESE** are installed at the least:\n{{blueprintDependencies}}\n\n</INPUT DATA>");
var ProjectSetupAssistant = /** @class */ (function (_super) {
    __extends(ProjectSetupAssistant, _super);
    function ProjectSetupAssistant(_a) {
        var env = _a.env, inferenceContext = _a.inferenceContext, query = _a.query, blueprint = _a.blueprint, template = _a.template;
        var _this = this;
        var systemPrompt = (0, common_1.createSystemMessage)(SYSTEM_PROMPT);
        _this = _super.call(this, env, inferenceContext, systemPrompt) || this;
        _this.save([(0, common_1.createUserMessage)((0, prompts_1.generalSystemPromptBuilder)(SETUP_USER_PROMPT, {
                query: query,
                blueprint: blueprint,
                templateDetails: template,
                dependencies: template.deps,
                forCodegen: false
            }))]);
        _this.query = query;
        _this.logger = (0, logger_1.createObjectLogger)(_this, 'ProjectSetupAssistant');
        return _this;
    }
    ProjectSetupAssistant.prototype.generateSetupCommands = function (error) {
        return __awaiter(this, void 0, void 0, function () {
            var userPrompt, messages, results, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.info("Generating setup commands", { query: this.query, queryLength: this.query.length });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        userPrompt = (0, common_1.createUserMessage)("Now please suggest required setup commands for the project, inside markdown code fence");
                        if (error) {
                            this.logger.info("Regenerating setup commands after error: ".concat(error));
                            userPrompt = (0, common_1.createUserMessage)("Some of the previous commands you generated might not have worked. Please review these and generate new commands if required, maybe try a different version or correct the name?\n                    \n".concat(error));
                            this.logger.info("Regenerating setup commands with new prompt: ".concat(userPrompt.content));
                        }
                        messages = this.save([userPrompt]);
                        return [4 /*yield*/, (0, infer_1.executeInference)({
                                env: this.env,
                                messages: messages,
                                agentActionName: "projectSetup",
                                context: this.inferenceContext,
                                modelName: error ? config_types_1.AIModels.GEMINI_2_5_FLASH : undefined,
                            })];
                    case 2:
                        results = _a.sent();
                        if (!results || typeof results !== 'string') {
                            this.logger.info("Failed to generate setup commands, results: ".concat(results));
                            return [2 /*return*/, { commands: [] }];
                        }
                        this.logger.info("Generated setup commands: ".concat(results));
                        this.save([(0, common_1.createAssistantMessage)(results)]);
                        return [2 /*return*/, { commands: (0, common_2.extractCommands)(results) }];
                    case 3:
                        error_1 = _a.sent();
                        this.logger.error("Error generating setup commands:", error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return ProjectSetupAssistant;
}(assistant_1.default));
exports.ProjectSetupAssistant = ProjectSetupAssistant;
