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
exports.ScreenshotAnalysisOperation = void 0;
var schemas_1 = require("../schemas");
var common_1 = require("../inferutils/common");
var infer_1 = require("../inferutils/infer");
var prompts_1 = require("../prompts");
var common_2 = require("./common");
var operationError_1 = require("../utils/operationError");
var SYSTEM_PROMPT = "You are a UI/UX Quality Assurance Specialist at Cloudflare. Your task is to analyze application screenshots against blueprint specifications and identify visual issues.\n\n## ANALYSIS PRIORITIES:\n1. **Missing Elements** - Blueprint components not visible\n2. **Layout Issues** - Misaligned, overlapping, or broken layouts\n3. **Responsive Problems** - Mobile/desktop rendering issues\n4. **Visual Bugs** - Broken styling, incorrect colors, missing images\n\n## EXAMPLE ANALYSES:\n\n**Example 1 - Game UI:**\nBlueprint: \"Score display in top-right, game board centered, control buttons below\"\nScreenshot: Shows score in top-left, buttons missing\nAnalysis:\n- hasIssues: true\n- issues: [\"Score positioned incorrectly\", \"Control buttons not visible\"]\n- matchesBlueprint: false\n- deviations: [\"Score placement\", \"Missing controls\"]\n\n**Example 2 - Dashboard:**\nBlueprint: \"3-column layout with sidebar, main content, and metrics panel\"\nScreenshot: Shows proper 3-column layout, all elements visible\nAnalysis:\n- hasIssues: false\n- issues: []\n- matchesBlueprint: true\n- deviations: []\n\n## OUTPUT FORMAT:\nReturn JSON with exactly these fields:\n- hasIssues: boolean\n- issues: string[] (specific problems found)\n- uiCompliance: { matchesBlueprint: boolean, deviations: string[] }\n- suggestions: string[] (improvement recommendations)";
var USER_PROMPT = "Analyze this screenshot against the blueprint requirements.\n\n**Blueprint Context:**\n{{blueprint}}\n\n**Viewport:** {{viewport}}\n\n**Analysis Required:**\n- Compare visible elements against blueprint specifications\n- Check layout, spacing, and component positioning\n- Identify any missing or broken UI elements\n- Assess responsive design for the given viewport size\n- Note any visual bugs or rendering issues\n\nProvide specific, actionable feedback focused on blueprint compliance.";
var userPromptFormatter = function (screenshotData, blueprint) {
    var prompt = prompts_1.PROMPT_UTILS.replaceTemplateVariables(USER_PROMPT, {
        blueprint: JSON.stringify(blueprint, null, 2),
        viewport: "".concat(screenshotData.viewport.width, "x").concat(screenshotData.viewport.height)
    });
    return prompts_1.PROMPT_UTILS.verifyPrompt(prompt);
};
var ScreenshotAnalysisOperation = /** @class */ (function (_super) {
    __extends(ScreenshotAnalysisOperation, _super);
    function ScreenshotAnalysisOperation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ScreenshotAnalysisOperation.prototype.execute = function (input, options) {
        return __awaiter(this, void 0, void 0, function () {
            var screenshotData, env, context, logger, messages, analysisResult, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        screenshotData = input.screenshotData;
                        env = options.env, context = options.context, logger = options.logger;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        logger.info('Analyzing screenshot from preview', {
                            url: screenshotData.url,
                            viewport: screenshotData.viewport,
                            hasScreenshotData: !!screenshotData.screenshot,
                            screenshotDataLength: ((_a = screenshotData.screenshot) === null || _a === void 0 ? void 0 : _a.length) || 0
                        });
                        if (!screenshotData.screenshot) {
                            throw new Error('No screenshot data available for analysis');
                        }
                        messages = [
                            (0, common_1.createSystemMessage)(SYSTEM_PROMPT),
                            (0, common_1.createMultiModalUserMessage)(userPromptFormatter(screenshotData, context.blueprint), screenshotData.screenshot, // The base64 data URL or image URL
                            'high' // Use high detail for better analysis
                            )
                        ];
                        return [4 /*yield*/, (0, infer_1.executeInference)({
                                env: env,
                                messages: messages,
                                schema: schemas_1.ScreenshotAnalysisSchema,
                                agentActionName: 'screenshotAnalysis',
                                context: options.inferenceContext,
                                retryLimit: 3
                            })];
                    case 2:
                        analysisResult = (_b.sent()).object;
                        if (!analysisResult) {
                            logger.warn('Screenshot analysis returned no result');
                            throw new Error('No analysis result');
                        }
                        logger.info('Screenshot analysis completed', {
                            hasIssues: analysisResult.hasIssues,
                            issueCount: analysisResult.issues.length,
                            matchesBlueprint: analysisResult.uiCompliance.matchesBlueprint
                        });
                        // Log detected UI issues
                        if (analysisResult.hasIssues) {
                            logger.warn('UI issues detected in screenshot', {
                                issues: analysisResult.issues,
                                deviations: analysisResult.uiCompliance.deviations
                            });
                        }
                        return [2 /*return*/, analysisResult];
                    case 3:
                        error_1 = _b.sent();
                        operationError_1.OperationError.logAndThrow(logger, "screenshot analysis", error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return ScreenshotAnalysisOperation;
}(common_2.AgentOperation));
exports.ScreenshotAnalysisOperation = ScreenshotAnalysisOperation;
