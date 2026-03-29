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
exports.buildDeploymentConfig = buildDeploymentConfig;
exports.parseWranglerConfig = parseWranglerConfig;
exports.deployWorker = deployWorker;
exports.deployToDispatch = deployToDispatch;
var deployer_1 = require("./deployer");
var index_1 = require("./utils/index");
var jsonc_parser_1 = require("jsonc-parser");
/**
 * Pure deployment configuration builder
 * Transforms Wrangler config into deployment-ready configuration
 */
function buildDeploymentConfig(config, workerContent, accountId, apiToken, assetsManifest, compatibilityFlags) {
    var hasAssets = assetsManifest && Object.keys(assetsManifest).length > 0;
    var bindings = (0, index_1.buildWorkerBindings)(config, hasAssets);
    return {
        accountId: accountId,
        apiToken: apiToken,
        scriptName: config.name,
        compatibilityDate: config.compatibility_date,
        compatibilityFlags: compatibilityFlags || config.compatibility_flags,
        workerContent: workerContent,
        assets: assetsManifest,
        bindings: bindings.length > 0 ? bindings : undefined,
        vars: config.vars,
    };
}
/**
 * Pure function to parse wrangler configuration from content string
 */
function parseWranglerConfig(configContent) {
    var config = (0, jsonc_parser_1.parse)(configContent);
    (0, index_1.validateConfig)(config);
    return config;
}
/**
 * Deploy a Cloudflare Worker with the provided configuration and assets
 */
function deployWorker(deployConfig, fileContents, additionalModules, migrations, assetsConfig, dispatchNamespace) {
    return __awaiter(this, void 0, void 0, function () {
        var deployer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    deployer = new deployer_1.WorkerDeployer(deployConfig.accountId, deployConfig.apiToken);
                    if (!(deployConfig.assets && fileContents)) return [3 /*break*/, 2];
                    return [4 /*yield*/, deployer.deployWithAssets(deployConfig.scriptName, deployConfig.workerContent, deployConfig.compatibilityDate, deployConfig.assets, fileContents, deployConfig.bindings, deployConfig.vars, dispatchNamespace, assetsConfig, additionalModules, deployConfig.compatibilityFlags, migrations)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, deployer.deploySimple(deployConfig.scriptName, deployConfig.workerContent, deployConfig.compatibilityDate, deployConfig.bindings, deployConfig.vars, dispatchNamespace, additionalModules, deployConfig.compatibilityFlags, migrations)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Deploy to Workers for Platforms (Dispatch namespace)
 */
function deployToDispatch(deployConfig, fileContents, additionalModules, migrations, assetsConfig) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, deployWorker(deployConfig, fileContents, additionalModules, migrations, assetsConfig, deployConfig.dispatchNamespace)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
