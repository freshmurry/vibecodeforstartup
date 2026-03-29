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
exports.ResourceProvisioner = void 0;
// @ts-ignore - Cloudflare runtime provides this
var cloudflare_workers_1 = require("cloudflare:workers");
var ResourceProvisioner = /** @class */ (function () {
    function ResourceProvisioner(logger) {
        this.logger = logger;
        this.accountId = cloudflare_workers_1.env.CLOUDFLARE_ACCOUNT_ID;
        this.apiToken = cloudflare_workers_1.env.CLOUDFLARE_API_TOKEN;
        if (!this.accountId || !this.apiToken) {
            this.logger.error('Missing required environment variables for resource provisioning', {
                hasAccountId: !!this.accountId,
                hasApiToken: !!this.apiToken
            });
            throw new Error('CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN must be set for resource provisioning');
        }
        this.logger.info('ResourceProvisioner initialized successfully', {
            accountId: this.accountId.substring(0, 8) + '...'
        });
    }
    ResourceProvisioner.prototype.getCloudflareHeaders = function () {
        return {
            'Authorization': "Bearer ".concat(this.apiToken),
            'Content-Type': 'application/json'
        };
    };
    ResourceProvisioner.prototype.createKVNamespace = function (projectName) {
        return __awaiter(this, void 0, void 0, function () {
            var namespaceName, url, response, errorText, result, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        this.logger.info("Creating KV namespace for project: ".concat(projectName));
                        namespaceName = "".concat(projectName, "-kv-").concat(Date.now());
                        url = "https://api.cloudflare.com/client/v4/accounts/".concat(this.accountId, "/storage/kv/namespaces");
                        return [4 /*yield*/, fetch(url, {
                                method: 'POST',
                                headers: this.getCloudflareHeaders(),
                                body: JSON.stringify({
                                    title: namespaceName
                                })
                            })];
                    case 1:
                        response = _b.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.text()];
                    case 2:
                        errorText = _b.sent();
                        this.logger.error("Failed to create KV namespace: HTTP ".concat(response.status), { errorText: errorText });
                        return [2 /*return*/, {
                                success: false,
                                error: "HTTP ".concat(response.status, ": ").concat(errorText)
                            }];
                    case 3: return [4 /*yield*/, response.json()];
                    case 4:
                        result = _b.sent();
                        if (!result.success || !((_a = result.result) === null || _a === void 0 ? void 0 : _a.id)) {
                            this.logger.error('KV namespace creation failed', result.errors);
                            return [2 /*return*/, {
                                    success: false,
                                    error: "API error: ".concat(JSON.stringify(result.errors))
                                }];
                        }
                        this.logger.info("Successfully created KV namespace: ".concat(result.result.id), {
                            namespaceName: namespaceName,
                            namespaceId: result.result.id
                        });
                        return [2 /*return*/, {
                                success: true,
                                resourceId: result.result.id
                            }];
                    case 5:
                        error_1 = _b.sent();
                        this.logger.error('Exception while creating KV namespace', error_1);
                        return [2 /*return*/, {
                                success: false,
                                error: error_1 instanceof Error ? error_1.message : 'Unknown error'
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ResourceProvisioner.prototype.createD1Database = function (projectName) {
        return __awaiter(this, void 0, void 0, function () {
            var databaseName, url, response, errorText, result, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        this.logger.info("Creating D1 database for project: ".concat(projectName));
                        databaseName = "".concat(projectName, "-db-").concat(Date.now());
                        url = "https://api.cloudflare.com/client/v4/accounts/".concat(this.accountId, "/d1/database");
                        return [4 /*yield*/, fetch(url, {
                                method: 'POST',
                                headers: this.getCloudflareHeaders(),
                                body: JSON.stringify({
                                    name: databaseName
                                })
                            })];
                    case 1:
                        response = _b.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.text()];
                    case 2:
                        errorText = _b.sent();
                        this.logger.error("Failed to create D1 database: HTTP ".concat(response.status), { errorText: errorText });
                        return [2 /*return*/, {
                                success: false,
                                error: "HTTP ".concat(response.status, ": ").concat(errorText)
                            }];
                    case 3: return [4 /*yield*/, response.json()];
                    case 4:
                        result = _b.sent();
                        if (!result.success || !((_a = result.result) === null || _a === void 0 ? void 0 : _a.uuid)) {
                            this.logger.error('D1 database creation failed', result.errors);
                            return [2 /*return*/, {
                                    success: false,
                                    error: "API error: ".concat(JSON.stringify(result.errors))
                                }];
                        }
                        this.logger.info("Successfully created D1 database: ".concat(result.result.uuid), {
                            databaseName: databaseName,
                            databaseId: result.result.uuid
                        });
                        return [2 /*return*/, {
                                success: true,
                                resourceId: result.result.uuid
                            }];
                    case 5:
                        error_2 = _b.sent();
                        this.logger.error('Exception while creating D1 database', error_2);
                        return [2 /*return*/, {
                                success: false,
                                error: error_2 instanceof Error ? error_2.message : 'Unknown error'
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ResourceProvisioner.prototype.provisionResource = function (resourceType, projectName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (resourceType) {
                    case 'KV':
                        return [2 /*return*/, this.createKVNamespace(projectName)];
                    case 'D1':
                        return [2 /*return*/, this.createD1Database(projectName)];
                    default:
                        return [2 /*return*/, {
                                success: false,
                                error: "Unsupported resource type: ".concat(resourceType)
                            }];
                }
                return [2 /*return*/];
            });
        });
    };
    return ResourceProvisioner;
}());
exports.ResourceProvisioner = ResourceProvisioner;
