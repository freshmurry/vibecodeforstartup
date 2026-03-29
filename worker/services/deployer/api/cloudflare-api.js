"use strict";
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
exports.CloudflareAPI = void 0;
var index_1 = require("../utils/index");
/**
 * Cloudflare API client for Worker deployment operations
 */
var CloudflareAPI = /** @class */ (function () {
    function CloudflareAPI(accountId, apiToken) {
        this.baseUrl = 'https://api.cloudflare.com/client/v4';
        this.accountId = accountId;
        this.apiToken = apiToken;
    }
    /**
     * Generate request headers with authorization
     */
    CloudflareAPI.prototype.getHeaders = function (contentType) {
        var headers = {
            Authorization: "Bearer ".concat(this.apiToken),
        };
        if (contentType) {
            headers['Content-Type'] = contentType;
        }
        return headers;
    };
    /**
     * Create an asset upload session with Cloudflare
     * Returns JWT token and list of files that need uploading
     */
    CloudflareAPI.prototype.createAssetUploadSession = function (scriptName, manifest, dispatchNamespace) {
        return __awaiter(this, void 0, void 0, function () {
            var url, response, error, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = dispatchNamespace
                            ? "".concat(this.baseUrl, "/accounts/").concat(this.accountId, "/workers/dispatch/namespaces/").concat(dispatchNamespace, "/scripts/").concat(scriptName, "/assets-upload-session")
                            : "".concat(this.baseUrl, "/accounts/").concat(this.accountId, "/workers/scripts/").concat(scriptName, "/assets-upload-session");
                        return [4 /*yield*/, fetch(url, {
                                method: 'POST',
                                headers: this.getHeaders('application/json'),
                                body: JSON.stringify({ manifest: manifest }),
                            })];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.text()];
                    case 2:
                        error = _a.sent();
                        throw new Error("Failed to create asset upload session: ".concat(response.status, " - ").concat(error));
                    case 3: return [4 /*yield*/, response.json()];
                    case 4:
                        data = (_a.sent());
                        return [2 /*return*/, data.result];
                }
            });
        });
    };
    /**
     * Upload a batch of assets to Cloudflare
     * Returns completion token if this is the last batch
     */
    CloudflareAPI.prototype.uploadAssetBatch = function (uploadToken, fileHashesToUpload, fileContents, hashToPath) {
        return __awaiter(this, void 0, void 0, function () {
            var url, formData, _i, fileHashesToUpload_1, hash, content, base64Content, filePath, mimeType, blob, response, error, data;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        url = "".concat(this.baseUrl, "/accounts/").concat(this.accountId, "/workers/assets/upload?base64=true");
                        formData = new FormData();
                        // Add each file as base64 string with proper MIME type
                        for (_i = 0, fileHashesToUpload_1 = fileHashesToUpload; _i < fileHashesToUpload_1.length; _i++) {
                            hash = fileHashesToUpload_1[_i];
                            content = fileContents.get(hash);
                            if (!content) {
                                throw new Error("Content not found for hash: ".concat(hash));
                            }
                            base64Content = content.toString('base64');
                            filePath = hashToPath.get(hash);
                            mimeType = filePath
                                ? (0, index_1.getMimeType)(filePath)
                                : 'application/octet-stream';
                            blob = new Blob([base64Content], { type: mimeType });
                            formData.append(hash, blob, hash);
                        }
                        return [4 /*yield*/, fetch(url, {
                                method: 'POST',
                                headers: {
                                    Authorization: "Bearer ".concat(uploadToken),
                                },
                                body: formData,
                            })];
                    case 1:
                        response = _b.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.text()];
                    case 2:
                        error = _b.sent();
                        throw new Error("Failed to upload assets: ".concat(response.status, " - ").concat(error));
                    case 3:
                        if (!(response.status === 201)) return [3 /*break*/, 5];
                        return [4 /*yield*/, response.json()];
                    case 4:
                        data = (_b.sent());
                        return [2 /*return*/, ((_a = data.result) === null || _a === void 0 ? void 0 : _a.jwt) || null];
                    case 5: return [2 /*return*/, null];
                }
            });
        });
    };
    /**
     * Deploy a Worker script to Cloudflare
     * Includes metadata, bindings, and assets configuration
     */
    CloudflareAPI.prototype.deployWorker = function (scriptName, metadata, workerContent, dispatchNamespace, additionalModules, durableObjectClasses) {
        return __awaiter(this, void 0, void 0, function () {
            var url, formData, metadataWithExports, finalWorkerContent, workerBlob, _i, _a, _b, moduleName, moduleContent, moduleBlob, response, error, errorObj, errorMessage, existingClassMatch, existingClass_1, migrations, retryFormData, _c, _d, _e, moduleName, moduleContent, moduleBlob, retryResponse, retryError, retryErrorObj;
            var _f, _g, _h, _j;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        url = dispatchNamespace
                            ? "".concat(this.baseUrl, "/accounts/").concat(this.accountId, "/workers/dispatch/namespaces/").concat(dispatchNamespace, "/scripts/").concat(scriptName)
                            : "".concat(this.baseUrl, "/accounts/").concat(this.accountId, "/workers/scripts/").concat(scriptName);
                        formData = new FormData();
                        metadataWithExports = __assign({}, metadata);
                        if (durableObjectClasses && durableObjectClasses.length > 0) {
                            metadataWithExports.exported_handlers = durableObjectClasses;
                        }
                        finalWorkerContent = workerContent;
                        formData.append('metadata', JSON.stringify(metadataWithExports));
                        workerBlob = new Blob([finalWorkerContent], {
                            type: 'application/javascript+module',
                        });
                        formData.append('index.js', workerBlob, 'index.js');
                        // Add any additional modules (e.g., from Vite build)
                        if (additionalModules) {
                            for (_i = 0, _a = additionalModules.entries(); _i < _a.length; _i++) {
                                _b = _a[_i], moduleName = _b[0], moduleContent = _b[1];
                                moduleBlob = new Blob([moduleContent], {
                                    type: 'application/javascript+module',
                                });
                                formData.append(moduleName, moduleBlob, moduleName);
                            }
                        }
                        return [4 /*yield*/, fetch(url, {
                                method: 'PUT',
                                headers: {
                                    Authorization: "Bearer ".concat(this.apiToken),
                                },
                                body: formData,
                            })];
                    case 1:
                        response = _k.sent();
                        if (!!response.ok) return [3 /*break*/, 7];
                        return [4 /*yield*/, response.text()];
                    case 2:
                        error = _k.sent();
                        errorObj = JSON.parse(error);
                        if (!(((_g = (_f = errorObj.errors) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.code) === 10074)) return [3 /*break*/, 6];
                        errorMessage = errorObj.errors[0].message;
                        existingClassMatch = errorMessage.match(/class '([^']+)'/);
                        existingClass_1 = existingClassMatch
                            ? existingClassMatch[1]
                            : null;
                        console.log("\n\u26A0\uFE0F  Durable Object class '".concat(existingClass_1, "' already exists"));
                        // Filter out the existing class from migrations
                        if (metadataWithExports.migrations && existingClass_1) {
                            migrations = metadataWithExports.migrations;
                            // Remove the existing class from new_classes and new_sqlite_classes
                            if (migrations.new_classes) {
                                migrations.new_classes = migrations.new_classes.filter(function (c) { return c !== existingClass_1; });
                                if (migrations.new_classes.length === 0)
                                    delete migrations.new_classes;
                            }
                            if (migrations.new_sqlite_classes) {
                                migrations.new_sqlite_classes =
                                    migrations.new_sqlite_classes.filter(function (c) { return c !== existingClass_1; });
                                if (migrations.new_sqlite_classes.length === 0)
                                    delete migrations.new_sqlite_classes;
                            }
                            // If no migrations left, remove the field entirely
                            if (!migrations.new_classes &&
                                !migrations.new_sqlite_classes &&
                                !migrations.renamed_classes &&
                                !migrations.deleted_classes) {
                                delete metadataWithExports.migrations;
                                console.log('📝 All Durable Objects already exist, deploying without migrations');
                            }
                            else {
                                console.log("\uD83D\uDCDD Retrying with migrations for new classes only");
                            }
                        }
                        retryFormData = new FormData();
                        retryFormData.append('metadata', JSON.stringify(metadataWithExports));
                        retryFormData.append('index.js', workerBlob, 'index.js');
                        if (additionalModules) {
                            for (_c = 0, _d = additionalModules.entries(); _c < _d.length; _c++) {
                                _e = _d[_c], moduleName = _e[0], moduleContent = _e[1];
                                moduleBlob = new Blob([moduleContent], {
                                    type: 'application/javascript+module',
                                });
                                retryFormData.append(moduleName, moduleBlob, moduleName);
                            }
                        }
                        return [4 /*yield*/, fetch(url, {
                                method: 'PUT',
                                headers: {
                                    Authorization: "Bearer ".concat(this.apiToken),
                                },
                                body: retryFormData,
                            })];
                    case 3:
                        retryResponse = _k.sent();
                        if (!!retryResponse.ok) return [3 /*break*/, 5];
                        return [4 /*yield*/, retryResponse.text()];
                    case 4:
                        retryError = _k.sent();
                        retryErrorObj = JSON.parse(retryError);
                        // If still failing with same error, recursively handle it
                        if (((_j = (_h = retryErrorObj.errors) === null || _h === void 0 ? void 0 : _h[0]) === null || _j === void 0 ? void 0 : _j.code) === 10074) {
                            // Recursive call to handle multiple existing classes
                            return [2 /*return*/, this.deployWorker(scriptName, metadataWithExports, finalWorkerContent, dispatchNamespace, additionalModules, durableObjectClasses)];
                        }
                        throw new Error("Failed to deploy worker: ".concat(retryResponse.status, " - ").concat(retryError));
                    case 5:
                        console.log('✅ Successfully deployed');
                        return [2 /*return*/];
                    case 6: throw new Error("Failed to deploy worker: ".concat(response.status, " - ").concat(error));
                    case 7:
                        console.log("\u2705 Worker deployed successfully: ".concat(scriptName));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Test a deployed Worker by making a request to its endpoint
     */
    CloudflareAPI.prototype.testWorkerEndpoint = function (workerUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var response, text, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch(workerUrl)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.text()];
                    case 2:
                        text = _a.sent();
                        console.log("\n\uD83D\uDCE1 Worker Response (".concat(response.status, "):"));
                        console.log(text.substring(0, 200) + (text.length > 200 ? '...' : ''));
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('❌ Failed to test worker endpoint:', error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return CloudflareAPI;
}());
exports.CloudflareAPI = CloudflareAPI;
