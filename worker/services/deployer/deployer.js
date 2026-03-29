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
exports.WorkerDeployer = void 0;
var logger_1 = require("../../logger");
var cloudflare_api_1 = require("./api/cloudflare-api");
var index_1 = require("./utils/index");
var logger = (0, logger_1.createObjectLogger)('WorkerDeployer');
/**
 * Main deployment orchestrator for Cloudflare Workers
 * Handles both simple deployments and deployments with static assets
 */
var WorkerDeployer = /** @class */ (function () {
    function WorkerDeployer(accountId, apiToken) {
        this.api = new cloudflare_api_1.CloudflareAPI(accountId, apiToken);
    }
    /**
     * Deploy a Worker with static assets
     * Handles asset upload session, batch uploads, and final deployment
     * @param fileContents Map of file paths to their contents as Buffer
     */
    WorkerDeployer.prototype.deployWithAssets = function (scriptName, workerContent, compatibilityDate, assetsManifest, fileContents, bindings, vars, dispatchNamespace, assetsConfig, additionalModules, compatibilityFlags, migrations) {
        return __awaiter(this, void 0, void 0, function () {
            var uploadSession, hashToPath, hashToContent, _i, _a, _b, path, info, content, completionToken, totalFiles, i, bucket, token, metadata, mergedMigration, doClasses, durableObjectClasses;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        logger.info('🚀 Starting deployment process...');
                        logger.info("\uD83D\uDCE6 Worker: ".concat(scriptName));
                        if (dispatchNamespace) {
                            logger.info("\uD83C\uDFAF Dispatch Namespace: ".concat(dispatchNamespace));
                        }
                        // Step 1: Create asset upload session
                        logger.info('\n📤 Creating asset upload session...');
                        return [4 /*yield*/, this.api.createAssetUploadSession(scriptName, assetsManifest, dispatchNamespace)];
                    case 1:
                        uploadSession = _c.sent();
                        logger.info("\u2705 Upload session created with JWT token");
                        hashToPath = new Map();
                        hashToContent = new Map();
                        for (_i = 0, _a = Object.entries(assetsManifest); _i < _a.length; _i++) {
                            _b = _a[_i], path = _b[0], info = _b[1];
                            hashToPath.set(info.hash, path);
                            content = fileContents.get(path);
                            if (!content) {
                                throw new Error("File content not found for path: ".concat(path));
                            }
                            hashToContent.set(info.hash, content);
                        }
                        completionToken = uploadSession.jwt;
                        if (!(uploadSession.buckets && uploadSession.buckets.length > 0)) return [3 /*break*/, 6];
                        totalFiles = uploadSession.buckets.flat().length;
                        logger.info("\n\uD83D\uDCC1 Uploading ".concat(totalFiles, " assets in ").concat(uploadSession.buckets.length, " batch(es)..."));
                        i = 0;
                        _c.label = 2;
                    case 2:
                        if (!(i < uploadSession.buckets.length)) return [3 /*break*/, 5];
                        bucket = uploadSession.buckets[i];
                        logger.info("  Batch ".concat(i + 1, "/").concat(uploadSession.buckets.length, ": ").concat(bucket.length, " file(s)"));
                        return [4 /*yield*/, this.api.uploadAssetBatch(uploadSession.jwt, bucket, hashToContent, hashToPath)];
                    case 3:
                        token = _c.sent();
                        if (token) {
                            completionToken = token;
                        }
                        _c.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5:
                        logger.info('✅ All assets uploaded');
                        return [3 /*break*/, 7];
                    case 6:
                        logger.info('ℹ️  No new assets to upload (using cached assets)');
                        _c.label = 7;
                    case 7:
                        // Step 3: Deploy worker with assets and configuration
                        logger.info('\n🔧 Deploying worker script...');
                        metadata = {
                            main_module: 'index.js',
                            compatibility_date: compatibilityDate,
                            compatibility_flags: compatibilityFlags,
                            assets: {
                                jwt: completionToken,
                                config: {
                                    not_found_handling: assetsConfig === null || assetsConfig === void 0 ? void 0 : assetsConfig.not_found_handling,
                                },
                            },
                            bindings: bindings || [],
                        };
                        mergedMigration = (0, index_1.mergeMigrations)(migrations);
                        if (mergedMigration) {
                            metadata.migrations = mergedMigration;
                            doClasses = (0, index_1.extractDurableObjectClasses)(mergedMigration);
                            if (doClasses.length > 0) {
                                metadata.exported_handlers = doClasses;
                            }
                        }
                        if (vars && Object.keys(vars).length > 0) {
                            metadata.vars = vars;
                        }
                        durableObjectClasses = bindings === null || bindings === void 0 ? void 0 : bindings.filter(function (b) { return b.type === 'durable_object_namespace' && b.class_name; }).map(function (b) { return b.class_name; });
                        return [4 /*yield*/, this.api.deployWorker(scriptName, metadata, workerContent, dispatchNamespace, additionalModules, durableObjectClasses)];
                    case 8:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Deploy a Worker without static assets
     * Simple deployment with just the worker script
     */
    WorkerDeployer.prototype.deploySimple = function (scriptName, workerContent, compatibilityDate, bindings, vars, dispatchNamespace, additionalModules, compatibilityFlags, migrations) {
        return __awaiter(this, void 0, void 0, function () {
            var metadata, mergedMigration, doClasses, durableObjectClasses;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger.info('🚀 Starting simple deployment (no assets)...');
                        logger.info("\uD83D\uDCE6 Worker: ".concat(scriptName));
                        if (dispatchNamespace) {
                            logger.info("\uD83C\uDFAF Dispatch Namespace: ".concat(dispatchNamespace));
                        }
                        metadata = {
                            main_module: 'index.js',
                            compatibility_date: compatibilityDate,
                            compatibility_flags: compatibilityFlags,
                            bindings: bindings || [],
                        };
                        mergedMigration = (0, index_1.mergeMigrations)(migrations);
                        if (mergedMigration) {
                            metadata.migrations = mergedMigration;
                            doClasses = (0, index_1.extractDurableObjectClasses)(mergedMigration);
                            if (doClasses.length > 0) {
                                metadata.exported_handlers = doClasses;
                            }
                        }
                        if (vars && Object.keys(vars).length > 0) {
                            metadata.vars = vars;
                        }
                        durableObjectClasses = bindings === null || bindings === void 0 ? void 0 : bindings.filter(function (b) { return b.type === 'durable_object_namespace' && b.class_name; }).map(function (b) { return b.class_name; });
                        return [4 /*yield*/, this.api.deployWorker(scriptName, metadata, workerContent, dispatchNamespace, additionalModules, durableObjectClasses)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return WorkerDeployer;
}());
exports.WorkerDeployer = WorkerDeployer;
