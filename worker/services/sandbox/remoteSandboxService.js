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
exports.RemoteSandboxServiceClient = void 0;
exports.runnerFetch = runnerFetch;
var sandboxTypes_1 = require("./sandboxTypes");
var BaseSandboxService_1 = require("./BaseSandboxService");
// @ts-ignore - Cloudflare runtime provides this
var cloudflare_workers_1 = require("cloudflare:workers");
function runnerFetch(url, method, headers, body) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch(url, { method: method, headers: headers, body: body })];
                case 1: 
                // Use direct fetch for runner service communication
                return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 * Client for interacting with the Runner Service API.
 */
var RemoteSandboxServiceClient = /** @class */ (function (_super) {
    __extends(RemoteSandboxServiceClient, _super);
    function RemoteSandboxServiceClient(sandboxId) {
        var _this = _super.call(this, sandboxId) || this;
        _this.logger.info('RemoteSandboxServiceClient initialized', { sandboxId: _this.sandboxId });
        return _this;
    }
    RemoteSandboxServiceClient.init = function (sandboxServiceUrl, token) {
        RemoteSandboxServiceClient.sandboxServiceUrl = sandboxServiceUrl;
        RemoteSandboxServiceClient.token = token;
    };
    RemoteSandboxServiceClient.prototype.makeRequest = function (endpoint_1, method_1, schema_1, body_1) {
        return __awaiter(this, arguments, void 0, function (endpoint, method, schema, body, resetPrevious) {
            var url, headers, response, errorText, responseData, validation, error_1;
            if (resetPrevious === void 0) { resetPrevious = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = "".concat(RemoteSandboxServiceClient.sandboxServiceUrl).concat(endpoint);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        headers = new Headers();
                        headers.set('Content-Type', 'application/json');
                        headers.set('Authorization', "Bearer ".concat(RemoteSandboxServiceClient.token));
                        headers.set('x-session-id', this.sandboxId);
                        if (resetPrevious) {
                            headers.set('x-container-action', 'reset');
                        }
                        return [4 /*yield*/, runnerFetch(url, method, headers, body ? JSON.stringify(body) : undefined)];
                    case 2:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.text()];
                    case 3:
                        errorText = _a.sent();
                        this.logger.error('Runner service request failed', {
                            status: response.status,
                            statusText: response.statusText,
                            errorText: errorText,
                            url: url
                        });
                        return [2 /*return*/, {
                                success: false,
                                error: errorText
                            }];
                    case 4: return [4 /*yield*/, response.json()];
                    case 5:
                        responseData = _a.sent();
                        if (!schema)
                            return [2 /*return*/, responseData];
                        validation = schema.safeParse(responseData);
                        if (!validation.success) {
                            this.logger.error('Failed to validate response', validation.error.errors, { url: url });
                            return [2 /*return*/, {
                                    success: false,
                                    error: "Failed to validate response"
                                }];
                        }
                        // this.logger.info('Response validated', { url });
                        return [2 /*return*/, validation.data];
                    case 6:
                        error_1 = _a.sent();
                        this.logger.error('Error making request to runner service', error_1, { url: url });
                        return [2 /*return*/, {
                                success: false,
                                error: "Failed to validate response"
                            }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get details for a specific template.
     */
    RemoteSandboxServiceClient.prototype.getTemplateDetails = function (templateName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.makeRequest("/templates/".concat(templateName), 'GET', sandboxTypes_1.TemplateDetailsResponseSchema)];
            });
        });
    };
    /**
     * Create a new runner instance.
     */
    RemoteSandboxServiceClient.prototype.createInstance = function (templateName, projectName, webhookUrl, localEnvVars) {
        return __awaiter(this, void 0, void 0, function () {
            var requestBody;
            return __generator(this, function (_a) {
                requestBody = __assign(__assign({ templateName: templateName, projectName: projectName }, (webhookUrl && { webhookUrl: webhookUrl })), (localEnvVars && { envVars: localEnvVars }));
                return [2 /*return*/, this.makeRequest('/instances', 'POST', sandboxTypes_1.BootstrapResponseSchema, requestBody)];
            });
        });
    };
    /**
     * Get details for a specific runner instance.
     */
    RemoteSandboxServiceClient.prototype.getInstanceDetails = function (instanceId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.makeRequest("/instances/".concat(instanceId), 'GET', sandboxTypes_1.GetInstanceResponseSchema)];
            });
        });
    };
    /**
     * Get status for a specific runner instance.
     */
    RemoteSandboxServiceClient.prototype.getInstanceStatus = function (instanceId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.makeRequest("/instances/".concat(instanceId, "/status"), 'GET', sandboxTypes_1.BootstrapStatusResponseSchema)];
            });
        });
    };
    /**
     * Write files to a runner instance.
     */
    RemoteSandboxServiceClient.prototype.writeFiles = function (instanceId, files, commitMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var requestBody;
            return __generator(this, function (_a) {
                requestBody = { files: files, commitMessage: commitMessage };
                return [2 /*return*/, this.makeRequest("/instances/".concat(instanceId, "/files"), 'POST', sandboxTypes_1.WriteFilesResponseSchema, requestBody)];
            });
        });
    };
    /**
     * Get specific files from a runner instance.
     * @param instanceId The ID of the runner instance.
     * @param filePaths An optional array of file paths to retrieve.
     */
    RemoteSandboxServiceClient.prototype.getFiles = function (instanceId, filePaths) {
        return __awaiter(this, void 0, void 0, function () {
            var queryParams;
            return __generator(this, function (_a) {
                queryParams = filePaths && filePaths.length > 0 ? "?filePaths=".concat(encodeURIComponent(JSON.stringify(filePaths))) : '';
                return [2 /*return*/, this.makeRequest("/instances/".concat(instanceId, "/files").concat(queryParams), 'GET', sandboxTypes_1.GetFilesResponseSchema)];
            });
        });
    };
    /**
     * Execute commands in a runner instance.
     */
    RemoteSandboxServiceClient.prototype.executeCommands = function (instanceId, commands, timeout) {
        return __awaiter(this, void 0, void 0, function () {
            var requestBody;
            return __generator(this, function (_a) {
                requestBody = { commands: commands, timeout: timeout };
                return [2 /*return*/, this.makeRequest("/instances/".concat(instanceId, "/commands"), 'POST', sandboxTypes_1.ExecuteCommandsResponseSchema, requestBody)];
            });
        });
    };
    /**
     * Get runtime errors from a runner instance.
     */
    RemoteSandboxServiceClient.prototype.getInstanceErrors = function (instanceId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.makeRequest("/instances/".concat(instanceId, "/errors"), 'GET', sandboxTypes_1.RuntimeErrorResponseSchema)];
            });
        });
    };
    RemoteSandboxServiceClient.prototype.clearInstanceErrors = function (instanceId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.makeRequest("/instances/".concat(instanceId, "/errors"), 'DELETE', sandboxTypes_1.ClearErrorsResponseSchema)];
            });
        });
    };
    /**
     * Perform static code analysis on a runner instance to find potential issues.
     * @param instanceId The ID of the runner instance
     * @param files Optional comma-separated list of specific files to lint
     */
    RemoteSandboxServiceClient.prototype.runStaticAnalysisCode = function (instanceId, lintFiles) {
        return __awaiter(this, void 0, void 0, function () {
            var queryParams;
            return __generator(this, function (_a) {
                queryParams = (lintFiles === null || lintFiles === void 0 ? void 0 : lintFiles.length) ? "?files=".concat(lintFiles.join(',')) : '';
                return [2 /*return*/, this.makeRequest("/instances/".concat(instanceId, "/analysis").concat(queryParams), 'GET', sandboxTypes_1.StaticAnalysisResponseSchema)];
            });
        });
    };
    /**
     * Deploy a runner instance to Cloudflare Workers.
     * @param instanceId The ID of the runner instance to deploy
     * @param credentials Optional Cloudflare deployment credentials
     */
    RemoteSandboxServiceClient.prototype.deployToCloudflareWorkers = function (instanceId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.makeRequest("/instances/".concat(instanceId, "/deploy"), 'POST', sandboxTypes_1.DeploymentResultSchema)];
            });
        });
    };
    /**
     * Shutdown a runner instance.
     */
    RemoteSandboxServiceClient.prototype.shutdownInstance = function (instanceId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.makeRequest("/instances/".concat(instanceId), 'DELETE', sandboxTypes_1.ShutdownResponseSchema)];
            });
        });
    };
    /**
     * Export generated app to GitHub (creates repository if needed, then pushes files)
     */
    RemoteSandboxServiceClient.prototype.exportToGitHub = function (instanceId, request) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.makeRequest("/instances/".concat(instanceId, "/github/export"), 'POST', undefined, request)];
            });
        });
    };
    /**
     * Push instance files to existing GitHub repository
     */
    RemoteSandboxServiceClient.prototype.pushToGitHub = function (instanceId, request) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.makeRequest("/instances/".concat(instanceId, "/github/push"), 'POST', sandboxTypes_1.GitHubPushResponseSchema, request)];
            });
        });
    };
    /**
     * Initialize the client (no-op for remote client)
     */
    RemoteSandboxServiceClient.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // No initialization needed for remote client
                this.logger.info('Remote sandbox service client initialized', { sandboxId: this.sandboxId });
                return [2 /*return*/];
            });
        });
    };
    /**
     * List all instances across all sessions
     */
    RemoteSandboxServiceClient.prototype.listAllInstances = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.makeRequest('/instances', 'GET')];
            });
        });
    };
    /**
     * Get logs from a runner instance
     */
    RemoteSandboxServiceClient.prototype.getLogs = function (instanceId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.makeRequest("/instances/".concat(instanceId, "/logs"), 'GET')];
            });
        });
    };
    // temp, debug
    RemoteSandboxServiceClient.prototype.writeFileLogs = function (logName, log) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.makeRequest('/logs', 'POST', undefined, { logName: logName, log: log })];
            });
        });
    };
    return RemoteSandboxServiceClient;
}(BaseSandboxService_1.BaseSandboxService));
exports.RemoteSandboxServiceClient = RemoteSandboxServiceClient;
RemoteSandboxServiceClient.init(cloudflare_workers_1.env.SANDBOX_SERVICE_URL, cloudflare_workers_1.env.SANDBOX_SERVICE_API_KEY);
