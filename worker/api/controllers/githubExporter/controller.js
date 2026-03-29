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
exports.GitHubExporterController = void 0;
var baseController_1 = require("../baseController");
var github_1 = require("../../../services/github");
var github_exporter_1 = require("../../../services/oauth/github-exporter");
var agents_1 = require("../../../agents");
var logger_1 = require("../../../logger");
var GitHubExporterController = /** @class */ (function (_super) {
    __extends(GitHubExporterController, _super);
    function GitHubExporterController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GitHubExporterController.handleOAuthCallback = function (request, env, _ctx, context) {
        return __awaiter(this, void 0, void 0, function () {
            var code, stateParam, error, parsedState, userId, purpose, agentId, exportData, returnUrl, baseUrl, oauthProvider, tokenResult, createResult, agentStub, pushRequest, pushResult, pushError_1, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 11, , 12]);
                        code = context.queryParams.get('code');
                        stateParam = context.queryParams.get('state');
                        error = context.queryParams.get('error');
                        if (error) {
                            this.logger.error('OAuth authorization error', { error: error });
                            return [2 /*return*/, Response.redirect("".concat(new URL(request.url).origin, "/settings?integration=github&status=error&reason=").concat(encodeURIComponent(error)), 302)];
                        }
                        if (!code) {
                            return [2 /*return*/, Response.redirect("".concat(new URL(request.url).origin, "/settings?integration=github&status=error&reason=missing_code"), 302)];
                        }
                        parsedState = null;
                        if (stateParam) {
                            try {
                                parsedState = JSON.parse(Buffer.from(stateParam, 'base64').toString());
                            }
                            catch (error) {
                                this.logger.error('Failed to parse OAuth state parameter', error);
                            }
                        }
                        if (!parsedState || !parsedState.userId) {
                            return [2 /*return*/, Response.redirect("".concat(new URL(request.url).origin, "/settings?integration=github&status=error&reason=invalid_state"), 302)];
                        }
                        userId = parsedState.userId, purpose = parsedState.purpose, agentId = parsedState.agentId, exportData = parsedState.exportData, returnUrl = parsedState.returnUrl;
                        baseUrl = new URL(request.url).origin;
                        oauthProvider = github_exporter_1.GitHubExporterOAuthProvider.create(env, "".concat(baseUrl, "/api/github-exporter/callback"));
                        return [4 /*yield*/, oauthProvider.exchangeCodeForTokens(code)];
                    case 1:
                        tokenResult = _a.sent();
                        if (!tokenResult || !tokenResult.accessToken) {
                            this.logger.error('Failed to exchange OAuth code', { userId: userId });
                            return [2 /*return*/, Response.redirect("".concat(returnUrl, "?github_export=error&reason=token_exchange_failed"), 302)];
                        }
                        this.logger.info('OAuth authorization successful', {
                            userId: userId,
                            purpose: purpose
                        });
                        if (!(purpose === 'repository_export' && exportData)) return [3 /*break*/, 10];
                        return [4 /*yield*/, github_1.GitHubService.createUserRepository({
                                name: exportData.repositoryName,
                                description: exportData.description,
                                private: exportData.isPrivate || false,
                                token: tokenResult.accessToken
                            })];
                    case 2:
                        createResult = _a.sent();
                        if (!createResult.success || !createResult.repository) {
                            this.logger.error('Failed to create repository during export', {
                                error: createResult.error,
                                userId: userId,
                                repositoryName: exportData.repositoryName
                            });
                            return [2 /*return*/, Response.redirect("".concat(returnUrl, "?github_export=error&reason=").concat(encodeURIComponent(createResult.error || 'repository_creation_failed')), 302)];
                        }
                        this.logger.info('Repository created successfully, now pushing files', {
                            userId: userId,
                            repositoryUrl: createResult.repository.html_url,
                            repositoryName: exportData.repositoryName,
                            agentId: agentId
                        });
                        if (!agentId) return [3 /*break*/, 8];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 6, , 7]);
                        return [4 /*yield*/, (0, agents_1.getAgentStub)(env, agentId, true, this.logger)];
                    case 4:
                        agentStub = _a.sent();
                        pushRequest = {
                            cloneUrl: createResult.repository.clone_url,
                            repositoryHtmlUrl: createResult.repository.html_url,
                            isPrivate: createResult.repository.private,
                            token: tokenResult.accessToken,
                            email: 'noreply@vibecodeforstartup.com',
                            username: 'vibecodeforstartup-bot',
                            commitMessage: "Initial commit - Generated app\n\n\uD83E\uDD16 Generated with VibeCode for Startup\nRepository: ".concat(exportData.repositoryName)
                        };
                        this.logger.info('Pushing files to repository via agent', {
                            agentId: agentId,
                            repositoryUrl: createResult.repository.html_url
                        });
                        return [4 /*yield*/, agentStub.pushToGitHub(pushRequest)];
                    case 5:
                        pushResult = _a.sent();
                        if (!(pushResult === null || pushResult === void 0 ? void 0 : pushResult.success)) {
                            this.logger.error('Failed to push files to repository', {
                                error: pushResult === null || pushResult === void 0 ? void 0 : pushResult.error,
                                agentId: agentId,
                                repositoryUrl: createResult.repository.html_url
                            });
                            return [2 /*return*/, Response.redirect("".concat(returnUrl, "?github_export=error&reason=").concat(encodeURIComponent((pushResult === null || pushResult === void 0 ? void 0 : pushResult.error) || 'file_push_failed')), 302)];
                        }
                        this.logger.info('Successfully completed GitHub export with files', {
                            userId: userId,
                            agentId: agentId,
                            repositoryUrl: createResult.repository.html_url,
                            repositoryName: exportData.repositoryName
                        });
                        return [3 /*break*/, 7];
                    case 6:
                        pushError_1 = _a.sent();
                        this.logger.error('Error during file push', {
                            error: pushError_1,
                            agentId: agentId,
                            repositoryUrl: createResult.repository.html_url
                        });
                        return [2 /*return*/, Response.redirect("".concat(returnUrl, "?github_export=error&reason=").concat(encodeURIComponent('file_push_error')), 302)];
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        this.logger.warn('No agentId provided - repository created but files not pushed', {
                            repositoryUrl: createResult.repository.html_url
                        });
                        _a.label = 9;
                    case 9: return [2 /*return*/, Response.redirect("".concat(returnUrl, "?github_export=success&repository_url=").concat(encodeURIComponent(createResult.repository.html_url)), 302)];
                    case 10: return [2 /*return*/, Response.redirect("".concat(returnUrl, "?integration=github&status=oauth_success"), 302)];
                    case 11:
                        error_1 = _a.sent();
                        this.logger.error('Failed to handle OAuth callback', error_1);
                        return [2 /*return*/, Response.redirect("".concat(new URL(request.url).origin, "/settings?integration=github&status=error"), 302)];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    GitHubExporterController.initiateGitHubExport = function (request, env, _ctx, context) {
        return __awaiter(this, void 0, void 0, function () {
            var body, state, baseUrl, oauthProvider, authUrl, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (!context.user) {
                            return [2 /*return*/, GitHubExporterController.createErrorResponse('Authentication required', 401)];
                        }
                        return [4 /*yield*/, request.json()];
                    case 1:
                        body = _a.sent();
                        if (!body.repositoryName) {
                            return [2 /*return*/, GitHubExporterController.createErrorResponse('Repository name is required', 400)];
                        }
                        if (!body.agentId) {
                            return [2 /*return*/, GitHubExporterController.createErrorResponse('Instance ID is required for file pushing', 400)];
                        }
                        state = {
                            userId: context.user.id,
                            timestamp: Date.now(),
                            purpose: 'repository_export',
                            agentId: body.agentId,
                            exportData: {
                                repositoryName: body.repositoryName,
                                description: body.description,
                                isPrivate: body.isPrivate
                            },
                            returnUrl: request.headers.get('referer') || "".concat(new URL(request.url).origin, "/chat"),
                        };
                        baseUrl = new URL(request.url).origin;
                        oauthProvider = github_exporter_1.GitHubExporterOAuthProvider.create(env, "".concat(baseUrl, "/api/github-exporter/callback"));
                        return [4 /*yield*/, oauthProvider.getAuthorizationUrl(Buffer.from(JSON.stringify(state)).toString('base64'))];
                    case 2:
                        authUrl = _a.sent();
                        this.logger.info('Initiating GitHub export with OAuth', {
                            userId: context.user.id,
                            repositoryName: body.repositoryName,
                        });
                        return [2 /*return*/, GitHubExporterController.createSuccessResponse({
                                authUrl: authUrl
                            })];
                    case 3:
                        error_2 = _a.sent();
                        this.logger.error('Failed to initiate GitHub export', error_2);
                        return [2 /*return*/, GitHubExporterController.createErrorResponse('Failed to initiate GitHub export', 500)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    GitHubExporterController.logger = (0, logger_1.createLogger)('GitHubExporterController');
    return GitHubExporterController;
}(baseController_1.BaseController));
exports.GitHubExporterController = GitHubExporterController;
