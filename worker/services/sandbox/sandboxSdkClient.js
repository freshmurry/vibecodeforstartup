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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SandboxSdkClient = exports.AllocationStrategy = exports.DeployerService = exports.UserAppSandboxService = void 0;
var sandbox_1 = require("@cloudflare/sandbox");
var logger_1 = require("../../logger");
// @ts-ignore - Cloudflare runtime provides this
var cloudflare_workers_1 = require("cloudflare:workers");
var BaseSandboxService_1 = require("./BaseSandboxService");
var deploy_1 = require("../deployer/deploy");
var index_1 = require("../deployer/utils/index");
var code_fixer_1 = require("../code-fixer");
var idGenerator_1 = require("../../utils/idGenerator");
var resourceProvisioner_1 = require("./resourceProvisioner");
var templateParser_1 = require("./templateParser");
var GitHubService_1 = require("../github/GitHubService");
// Export the Sandbox class in your Worker
var sandbox_2 = require("@cloudflare/sandbox");
Object.defineProperty(exports, "UserAppSandboxService", { enumerable: true, get: function () { return sandbox_2.Sandbox; } });
Object.defineProperty(exports, "DeployerService", { enumerable: true, get: function () { return sandbox_2.Sandbox; } });
var AllocationStrategy;
(function (AllocationStrategy) {
    AllocationStrategy["MANY_TO_ONE"] = "many_to_one";
    AllocationStrategy["ONE_TO_ONE"] = "one_to_one";
})(AllocationStrategy || (exports.AllocationStrategy = AllocationStrategy = {}));
function getAutoAllocatedSandbox(sessionId) {
    // Distribute sessions across available containers using consistent hashing
    // Convert session ID to hash for deterministic assignment
    var hash = 0;
    for (var i = 0; i < sessionId.length; i++) {
        var char = sessionId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    hash = Math.abs(hash);
    var max_instances = cloudflare_workers_1.env.MAX_SANDBOX_INSTANCES ? Number(cloudflare_workers_1.env.MAX_SANDBOX_INSTANCES) : 10;
    var containerIndex = hash % max_instances;
    var containerId = "container-pool-".concat(containerIndex);
    console.log("Session mapped to container", { sessionId: sessionId, containerId: containerId, hash: hash, containerIndex: containerIndex });
    return containerId;
}
var SandboxSdkClient = /** @class */ (function (_super) {
    __extends(SandboxSdkClient, _super);
    function SandboxSdkClient(sandboxId, hostname, envVars) {
        var _this = this;
        if (cloudflare_workers_1.env.ALLOCATION_STRATEGY === AllocationStrategy.MANY_TO_ONE) {
            sandboxId = getAutoAllocatedSandbox(sandboxId);
        }
        _this = _super.call(this, sandboxId) || this;
        _this.metadataCache = new Map();
        _this.sandbox = _this.getSandbox();
        _this.hostname = hostname;
        _this.envVars = envVars;
        // Set environment variables FIRST, before any other operations
        // SHOULD NEVER SEND SECRETS TO SANDBOX!
        if (_this.envVars && Object.keys(_this.envVars).length > 0) {
            _this.logger.info('Configuring environment variables', { envVars: Object.keys(_this.envVars) });
            _this.sandbox.setEnvVars(_this.envVars);
        }
        _this.logger = (0, logger_1.createObjectLogger)(_this, 'SandboxSdkClient');
        _this.logger.setFields({
            sandboxId: _this.sandboxId
        });
        _this.logger.info('SandboxSdkClient initialized', { sandboxId: _this.sandboxId });
        return _this;
    }
    SandboxSdkClient.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var echoResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sandbox.exec('echo "Hello World"')];
                    case 1:
                        echoResult = _a.sent();
                        if (echoResult.exitCode !== 0) {
                            throw new Error("Failed to run echo command: ".concat(echoResult.stderr));
                        }
                        this.logger.info('Sandbox initialization complete');
                        return [2 /*return*/];
                }
            });
        });
    };
    SandboxSdkClient.prototype.getWranglerKVKey = function (instanceId) {
        return "wrangler-".concat(instanceId);
    };
    SandboxSdkClient.prototype.getSandbox = function () {
        if (!this.sandbox) {
            this.sandbox = (0, sandbox_1.getSandbox)(cloudflare_workers_1.env.Sandbox, this.sandboxId);
        }
        return this.sandbox;
    };
    SandboxSdkClient.prototype.getInstanceMetadataFile = function (instanceId) {
        return "".concat(instanceId, "-metadata.json");
    };
    SandboxSdkClient.prototype.executeCommand = function (instanceId, command, timeout) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getSandbox().exec("cd ".concat(instanceId, " && ").concat(command), { timeout: timeout })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SandboxSdkClient.prototype.getInstanceMetadata = function (instanceId) {
        return __awaiter(this, void 0, void 0, function () {
            var metadataFile, metadata, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Check cache first
                        if (this.metadataCache.has(instanceId)) {
                            return [2 /*return*/, this.metadataCache.get(instanceId)];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.getSandbox().readFile(this.getInstanceMetadataFile(instanceId))];
                    case 2:
                        metadataFile = _b.sent();
                        metadata = JSON.parse(metadataFile.content);
                        this.metadataCache.set(instanceId, metadata); // Cache it
                        return [2 /*return*/, metadata];
                    case 3:
                        _a = _b.sent();
                        throw new Error('Failed to read instance metadata');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SandboxSdkClient.prototype.storeInstanceMetadata = function (instanceId, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getSandbox().writeFile(this.getInstanceMetadataFile(instanceId), JSON.stringify(metadata))];
                    case 1:
                        _a.sent();
                        this.metadataCache.set(instanceId, metadata); // Update cache
                        return [2 /*return*/];
                }
            });
        });
    };
    SandboxSdkClient.prototype.invalidateMetadataCache = function (instanceId) {
        this.metadataCache.delete(instanceId);
    };
    SandboxSdkClient.prototype.allocateAvailablePort = function () {
        return __awaiter(this, arguments, void 0, function (excludedPorts) {
            var startTime, excludeList, findPortCmd, result, endTime, duration, port;
            if (excludedPorts === void 0) { excludedPorts = [3000]; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        excludeList = excludedPorts.join(' ');
                        findPortCmd = "\n            for port in $(seq 8001 8999); do\n                if ! echo \"".concat(excludeList, "\" | grep -q \"\\\\b$port\\\\b\" && \n                   ! netstat -tuln 2>/dev/null | grep -q \":$port \" && \n                   ! ss -tuln 2>/dev/null | grep -q \":$port \"; then\n                    echo $port\n                    exit 0\n                fi\n            done\n            exit 1\n        ");
                        return [4 /*yield*/, this.getSandbox().exec(findPortCmd.trim())];
                    case 1:
                        result = _a.sent();
                        endTime = Date.now();
                        duration = (endTime - startTime) / 1000;
                        this.logger.info("Port allocation took ".concat(duration, " seconds"));
                        if (result.exitCode === 0 && result.stdout.trim()) {
                            port = parseInt(result.stdout.trim());
                            this.logger.info("Allocated available port: ".concat(port));
                            return [2 /*return*/, port];
                        }
                        throw new Error('No available ports found in range 8001-8999');
                }
            });
        });
    };
    SandboxSdkClient.prototype.checkTemplateExists = function (templateName) {
        return __awaiter(this, void 0, void 0, function () {
            var sandbox, checkResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sandbox = this.getSandbox();
                        return [4 /*yield*/, sandbox.exec("test -f ".concat(templateName, "/package.json && echo \"exists\" || echo \"missing\""))];
                    case 1:
                        checkResult = _a.sent();
                        return [2 /*return*/, checkResult.exitCode === 0 && checkResult.stdout.trim() === "exists"];
                }
            });
        });
    };
    SandboxSdkClient.prototype.downloadTemplate = function (templateName, downloadDir) {
        return __awaiter(this, void 0, void 0, function () {
            var downloadUrl, r2Object, zipData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        downloadUrl = downloadDir ? "".concat(downloadDir, "/").concat(templateName, ".zip") : "".concat(templateName, ".zip");
                        this.logger.info("Fetching object: ".concat(downloadUrl, " from R2 bucket"));
                        return [4 /*yield*/, cloudflare_workers_1.env.TEMPLATES_BUCKET.get(downloadUrl)];
                    case 1:
                        r2Object = _a.sent();
                        if (!r2Object) {
                            throw new Error("Object '".concat(downloadUrl, "' not found in bucket"));
                        }
                        return [4 /*yield*/, r2Object.arrayBuffer()];
                    case 2:
                        zipData = _a.sent();
                        this.logger.info("Downloaded zip file (".concat(zipData.byteLength, " bytes)"));
                        return [2 /*return*/, zipData];
                }
            });
        });
    };
    SandboxSdkClient.prototype.ensureTemplateExists = function (templateName_1, downloadDir_1) {
        return __awaiter(this, arguments, void 0, function (templateName, downloadDir, isInstance) {
            var zipData, zipBuffer, binaryString, chunkSize, i, chunk, base64Data, setupResult;
            if (isInstance === void 0) { isInstance = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkTemplateExists(templateName)];
                    case 1:
                        if (!!(_a.sent())) return [3 /*break*/, 6];
                        // Download and extract template
                        this.logger.info("Template doesnt exist, Downloading template from: ".concat(templateName));
                        return [4 /*yield*/, this.downloadTemplate(templateName, downloadDir)];
                    case 2:
                        zipData = _a.sent();
                        zipBuffer = new Uint8Array(zipData);
                        binaryString = '';
                        chunkSize = 0x8000;
                        for (i = 0; i < zipBuffer.length; i += chunkSize) {
                            chunk = zipBuffer.subarray(i, i + chunkSize);
                            binaryString += String.fromCharCode.apply(String, chunk);
                        }
                        base64Data = btoa(binaryString);
                        return [4 /*yield*/, this.getSandbox().writeFile("".concat(templateName, ".zip.b64"), base64Data)];
                    case 3:
                        _a.sent();
                        // Convert base64 back to binary zip file
                        return [4 /*yield*/, this.getSandbox().exec("base64 -d ".concat(templateName, ".zip.b64 > ").concat(templateName, ".zip"))];
                    case 4:
                        // Convert base64 back to binary zip file
                        _a.sent();
                        this.logger.info("Wrote and converted zip file to sandbox: ".concat(templateName, ".zip"));
                        return [4 /*yield*/, this.getSandbox().exec("unzip -o -q ".concat(templateName, ".zip -d ").concat(isInstance ? '.' : templateName))];
                    case 5:
                        setupResult = _a.sent();
                        if (setupResult.exitCode !== 0) {
                            throw new Error("Failed to download/extract template: ".concat(setupResult.stderr));
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        this.logger.info("Template already exists");
                        _a.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    SandboxSdkClient.prototype.getTemplateDetails = function (templateName) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, fileTree, catalogInfo, dontTouchFiles, redactedFiles, filesResponse, dependencies, packageJsonFile, packageJson, templateDetails, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        this.logger.info('Retrieving template details', { templateName: templateName });
                        return [4 /*yield*/, this.ensureTemplateExists(templateName)];
                    case 1:
                        _b.sent();
                        this.logger.info('Template setup complete');
                        return [4 /*yield*/, Promise.all([
                                this.buildFileTree(templateName),
                                this.getTemplateFromCatalog(templateName),
                                this.fetchDontTouchFiles(templateName),
                                this.fetchRedactedFiles(templateName)
                            ])];
                    case 2:
                        _a = _b.sent(), fileTree = _a[0], catalogInfo = _a[1], dontTouchFiles = _a[2], redactedFiles = _a[3];
                        if (!fileTree) {
                            throw new Error("Failed to build file tree for template ".concat(templateName));
                        }
                        return [4 /*yield*/, this.getFiles(templateName, undefined, true, redactedFiles)];
                    case 3:
                        filesResponse = _b.sent();
                        this.logger.info('Template files retrieved');
                        dependencies = {};
                        try {
                            packageJsonFile = filesResponse.files.find(function (file) { return file.filePath === 'package.json'; });
                            if (!packageJsonFile) {
                                throw new Error('package.json not found');
                            }
                            packageJson = JSON.parse(packageJsonFile.fileContents);
                            dependencies = __assign(__assign({}, packageJson.dependencies || {}), packageJson.devDependencies || {});
                        }
                        catch (_c) {
                            this.logger.info('No package.json found', { templateName: templateName });
                        }
                        templateDetails = {
                            name: templateName,
                            description: {
                                selection: (catalogInfo === null || catalogInfo === void 0 ? void 0 : catalogInfo.description.selection) || '',
                                usage: (catalogInfo === null || catalogInfo === void 0 ? void 0 : catalogInfo.description.usage) || ''
                            },
                            fileTree: fileTree,
                            files: filesResponse.files,
                            language: catalogInfo === null || catalogInfo === void 0 ? void 0 : catalogInfo.language,
                            deps: dependencies,
                            dontTouchFiles: dontTouchFiles,
                            redactedFiles: redactedFiles,
                            frameworks: (catalogInfo === null || catalogInfo === void 0 ? void 0 : catalogInfo.frameworks) || []
                        };
                        this.logger.info('Template files retrieved', { templateName: templateName, fileCount: filesResponse.files.length });
                        return [2 /*return*/, {
                                success: true,
                                templateDetails: templateDetails
                            }];
                    case 4:
                        error_1 = _b.sent();
                        this.logger.error('getTemplateDetails', error_1, { templateName: templateName });
                        return [2 /*return*/, {
                                success: false,
                                error: "Failed to get template details: ".concat(error_1 instanceof Error ? error_1.message : 'Unknown error')
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SandboxSdkClient.prototype.getTemplateFromCatalog = function (templateName) {
        return __awaiter(this, void 0, void 0, function () {
            var templatesResponse, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, SandboxSdkClient.listTemplates()];
                    case 1:
                        templatesResponse = _b.sent();
                        if (templatesResponse.success) {
                            return [2 /*return*/, templatesResponse.templates.find(function (t) { return t.name === templateName; }) || null];
                        }
                        return [2 /*return*/, null];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SandboxSdkClient.prototype.buildFileTree = function (instanceId) {
        return __awaiter(this, void 0, void 0, function () {
            var EXCLUDED_DIRS, excludedDirsFind, excludedFileTypes, excludedFilesFind, buildTreeCmd, filesResult, output, sections, fileSection, dirSection, files, dirs, fileSet_1, allPaths, root_1, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        EXCLUDED_DIRS = [
                            ".github",
                            "node_modules",
                            ".git",
                            "dist",
                            ".wrangler",
                            ".vscode",
                            ".next",
                            ".cache",
                            ".idea",
                            ".DS_Store"
                        ];
                        excludedDirsFind = EXCLUDED_DIRS.map(function (dir) { return "-name \"".concat(dir, "\""); }).join(" -o ");
                        excludedFileTypes = [
                            "*.jpg",
                            "*.jpeg",
                            "*.png",
                            "*.gif",
                            "*.svg",
                            "*.ico",
                            "*.webp",
                            "*.bmp"
                        ];
                        excludedFilesFind = excludedFileTypes.map(function (ext) { return "-not -name \"".concat(ext, "\""); }).join(" ");
                        buildTreeCmd = "echo \"===FILES===\"; find . -type d \\( ".concat(excludedDirsFind, " \\) -prune -o \\( -type f ").concat(excludedFilesFind, " \\) -print; echo \"===DIRS===\"; find . -type d \\( ").concat(excludedDirsFind, " \\) -prune -o -type d -print");
                        return [4 /*yield*/, this.executeCommand(instanceId, buildTreeCmd)];
                    case 1:
                        filesResult = _a.sent();
                        if (filesResult.exitCode === 0) {
                            output = filesResult.stdout.trim();
                            sections = output.split('===DIRS===');
                            fileSection = sections[0].replace('===FILES===', '').trim();
                            dirSection = sections[1] ? sections[1].trim() : '';
                            files = fileSection.split('\n').filter(function (line) { return line.trim() && line !== '.'; });
                            dirs = dirSection.split('\n').filter(function (line) { return line.trim() && line !== '.'; });
                            fileSet_1 = new Set(files.map(function (f) { return f.startsWith('./') ? f.substring(2) : f; }));
                            allPaths = __spreadArray(__spreadArray([], files, true), dirs, true).map(function (path) {
                                return path.startsWith('./') ? path.substring(2) : path;
                            }).filter(function (path) { return path && path !== '.'; });
                            root_1 = {
                                path: '',
                                type: 'directory',
                                children: []
                            };
                            allPaths.forEach(function (filePath) {
                                var parts = filePath.split('/').filter(function (part) { return part; });
                                var current = root_1;
                                parts.forEach(function (_, index) {
                                    var _a;
                                    var path = parts.slice(0, index + 1).join('/');
                                    var isFile = fileSet_1.has(path);
                                    var child = (_a = current.children) === null || _a === void 0 ? void 0 : _a.find(function (c) { return c.path === path; });
                                    if (!child) {
                                        child = {
                                            path: path,
                                            type: isFile ? 'file' : 'directory',
                                            children: isFile ? undefined : []
                                        };
                                        current.children = current.children || [];
                                        current.children.push(child);
                                    }
                                    if (!isFile) {
                                        current = child;
                                    }
                                });
                            });
                            return [2 /*return*/, root_1];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        this.logger.warn('Failed to build file tree', error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/, undefined];
                }
            });
        });
    };
    // ==========================================
    // INSTANCE LIFECYCLE
    // ==========================================
    SandboxSdkClient.prototype.listAllInstances = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sandbox, bulkResult, instances, sections, _i, sections_1, section, lines, filePath, jsonContent, instanceId, metadata, instanceDetails, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.logger.info('Retrieving instance metadata');
                        sandbox = this.getSandbox();
                        return [4 /*yield*/, sandbox.exec("find . -maxdepth 1 -name \"*-metadata.json\" -type f -exec sh -c 'echo \"===FILE:$1===\"; cat \"$1\"' _ {} \\;")];
                    case 1:
                        bulkResult = _a.sent();
                        if (bulkResult.exitCode !== 0) {
                            return [2 /*return*/, {
                                    success: true,
                                    instances: [],
                                    count: 0
                                }];
                        }
                        instances = [];
                        sections = bulkResult.stdout.split('===FILE:').filter(function (section) { return section.trim(); });
                        for (_i = 0, sections_1 = sections; _i < sections_1.length; _i++) {
                            section = sections_1[_i];
                            try {
                                lines = section.trim().split('\n');
                                if (lines.length < 2)
                                    continue;
                                filePath = lines[0].replace('===', '');
                                jsonContent = lines.slice(1).join('\n');
                                instanceId = filePath.replace('./', '').replace('-metadata.json', '');
                                metadata = JSON.parse(jsonContent);
                                // Update cache with the metadata we just read
                                this.metadataCache.set(instanceId, metadata);
                                instanceDetails = {
                                    runId: instanceId,
                                    templateName: metadata.templateName,
                                    startTime: new Date(metadata.startTime),
                                    uptime: Math.floor((Date.now() - new Date(metadata.startTime).getTime()) / 1000),
                                    directory: instanceId,
                                    serviceDirectory: instanceId,
                                    previewURL: metadata.previewURL,
                                    processId: metadata.processId,
                                    tunnelURL: metadata.tunnelURL,
                                    // Skip file tree
                                    fileTree: undefined,
                                    runtimeErrors: undefined
                                };
                                instances.push(instanceDetails);
                            }
                            catch (error) {
                                this.logger.warn("Failed to process metadata section", error);
                            }
                        }
                        this.logger.info('Instance list retrieved', { instanceCount: instances.length });
                        return [2 /*return*/, {
                                success: true,
                                instances: instances,
                                count: instances.length
                            }];
                    case 2:
                        error_3 = _a.sent();
                        this.logger.error('listAllInstances', error_3);
                        return [2 /*return*/, {
                                success: false,
                                instances: [],
                                count: 0,
                                error: "Failed to list instances: ".concat(error_3 instanceof Error ? error_3.message : 'Unknown error')
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Waits for the development server to be ready by monitoring logs for readiness indicators
     */
    SandboxSdkClient.prototype.waitForServerReady = function (instanceId_1, processId_1) {
        return __awaiter(this, arguments, void 0, function (instanceId, processId, maxWaitTimeMs) {
            var startTime, pollIntervalMs, maxAttempts, readinessPatterns, attempt, logsResult, logs, _i, readinessPatterns_1, pattern, elapsedTime_1, error_4, elapsedTime;
            if (maxWaitTimeMs === void 0) { maxWaitTimeMs = 10000; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        pollIntervalMs = 500;
                        maxAttempts = Math.ceil(maxWaitTimeMs / pollIntervalMs);
                        readinessPatterns = [
                            /http:\/\/[^\s]+/, // Any HTTP URL (most reliable)
                            /ready in \d+/i, // Vite "ready in X ms"
                            /Local:\s+http/i, // Vite local server line
                            /Network:\s+http/i, // Vite network server line
                            /server running/i, // Generic server running message
                            /listening on/i // Generic listening message
                        ];
                        this.logger.info('Waiting for development server', { instanceId: instanceId, processId: processId, timeoutMs: maxWaitTimeMs });
                        attempt = 1;
                        _a.label = 1;
                    case 1:
                        if (!(attempt <= maxAttempts)) return [3 /*break*/, 10];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 9]);
                        return [4 /*yield*/, this.getLogs(instanceId, true)];
                    case 3:
                        logsResult = _a.sent();
                        if (logsResult.success && logsResult.logs.stdout) {
                            logs = logsResult.logs.stdout;
                            // Check for any readiness pattern
                            for (_i = 0, readinessPatterns_1 = readinessPatterns; _i < readinessPatterns_1.length; _i++) {
                                pattern = readinessPatterns_1[_i];
                                if (pattern.test(logs)) {
                                    elapsedTime_1 = Date.now() - startTime;
                                    this.logger.info('Development server ready', { instanceId: instanceId, elapsedTimeMs: elapsedTime_1, attempts: "".concat(attempt, "/").concat(maxAttempts) });
                                    return [2 /*return*/, true];
                                }
                            }
                        }
                        if (!(attempt < maxAttempts)) return [3 /*break*/, 5];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, pollIntervalMs); })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [3 /*break*/, 9];
                    case 6:
                        error_4 = _a.sent();
                        this.logger.warn("Error checking server readiness for ".concat(instanceId, " (attempt ").concat(attempt, "):"), error_4);
                        if (!(attempt < maxAttempts)) return [3 /*break*/, 8];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, pollIntervalMs); })];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [3 /*break*/, 9];
                    case 9:
                        attempt++;
                        return [3 /*break*/, 1];
                    case 10:
                        elapsedTime = Date.now() - startTime;
                        this.logger.warn('Development server readiness timeout', { instanceId: instanceId, elapsedTimeMs: elapsedTime, totalAttempts: maxAttempts });
                        return [2 /*return*/, false];
                }
            });
        });
    };
    SandboxSdkClient.prototype.startDevServer = function (instanceId, port) {
        return __awaiter(this, void 0, void 0, function () {
            var process_1, isReady, readinessError_1, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.getSandbox().startProcess("monitor-cli process start --instance-id ".concat(instanceId, " --port ").concat(port, " -- bun run dev"), { cwd: instanceId })];
                    case 1:
                        process_1 = _a.sent();
                        this.logger.info('Development server started', { instanceId: instanceId, processId: process_1.id });
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.waitForServerReady(instanceId, process_1.id, 10000)];
                    case 3:
                        isReady = _a.sent();
                        if (isReady) {
                            this.logger.info('Development server is ready', { instanceId: instanceId });
                        }
                        else {
                            this.logger.warn('Development server may not be fully ready', { instanceId: instanceId });
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        readinessError_1 = _a.sent();
                        this.logger.warn("Error during readiness check for ".concat(instanceId, ":"), readinessError_1);
                        this.logger.info('Continuing with server startup despite readiness check error', { instanceId: instanceId });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/, process_1.id];
                    case 6:
                        error_5 = _a.sent();
                        this.logger.warn('Failed to start dev server', error_5);
                        throw error_5;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Provisions Cloudflare resources for template placeholders in wrangler.jsonc
     */
    SandboxSdkClient.prototype.provisionTemplateResources = function (instanceId, projectName) {
        return __awaiter(this, void 0, void 0, function () {
            var sandbox, wranglerFile, templateParser, parseResult, resourceProvisioner, provisioned, failed, replacements, _i, _a, placeholderInfo, provisionResult, wranglerUpdated, updatedContent, writeResult, result, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 8, , 9]);
                        sandbox = this.getSandbox();
                        return [4 /*yield*/, sandbox.readFile("".concat(instanceId, "/wrangler.jsonc"))];
                    case 1:
                        wranglerFile = _b.sent();
                        if (!wranglerFile.success) {
                            this.logger.info("No wrangler.jsonc found for ".concat(instanceId, ", skipping resource provisioning"));
                            return [2 /*return*/, {
                                    success: true,
                                    provisioned: [],
                                    failed: [],
                                    replacements: {},
                                    wranglerUpdated: false
                                }];
                        }
                        templateParser = new templateParser_1.TemplateParser(this.logger);
                        parseResult = templateParser.parseWranglerConfig(wranglerFile.content);
                        if (!parseResult.hasPlaceholders) {
                            this.logger.info('No placeholders found in wrangler configuration', { instanceId: instanceId });
                            return [2 /*return*/, {
                                    success: true,
                                    provisioned: [],
                                    failed: [],
                                    replacements: {},
                                    wranglerUpdated: false
                                }];
                        }
                        this.logger.info('Placeholders found for provisioning', { instanceId: instanceId, count: parseResult.placeholders.length });
                        resourceProvisioner = void 0;
                        try {
                            resourceProvisioner = new resourceProvisioner_1.ResourceProvisioner(this.logger);
                        }
                        catch (error) {
                            this.logger.warn("Cannot initialize resource provisioner: ".concat(error instanceof Error ? error.message : 'Unknown error'));
                            return [2 /*return*/, {
                                    success: true,
                                    provisioned: [],
                                    failed: parseResult.placeholders.map(function (p) { return ({
                                        placeholder: p.placeholder,
                                        resourceType: p.resourceType,
                                        error: 'Missing Cloudflare credentials',
                                        binding: p.binding
                                    }); }),
                                    replacements: {},
                                    wranglerUpdated: false
                                }];
                        }
                        provisioned = [];
                        failed = [];
                        replacements = {};
                        _i = 0, _a = parseResult.placeholders;
                        _b.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        placeholderInfo = _a[_i];
                        this.logger.info("Provisioning ".concat(placeholderInfo.resourceType, " resource for placeholder ").concat(placeholderInfo.placeholder));
                        return [4 /*yield*/, resourceProvisioner.provisionResource(placeholderInfo.resourceType, projectName)];
                    case 3:
                        provisionResult = _b.sent();
                        if (provisionResult.success && provisionResult.resourceId) {
                            provisioned.push({
                                placeholder: placeholderInfo.placeholder,
                                resourceType: placeholderInfo.resourceType,
                                resourceId: provisionResult.resourceId,
                                binding: placeholderInfo.binding
                            });
                            replacements[placeholderInfo.placeholder] = provisionResult.resourceId;
                        }
                        else {
                            failed.push({
                                placeholder: placeholderInfo.placeholder,
                                resourceType: placeholderInfo.resourceType,
                                error: provisionResult.error || 'Unknown error',
                                binding: placeholderInfo.binding
                            });
                            this.logger.warn("Failed to provision ".concat(placeholderInfo.resourceType, " for ").concat(placeholderInfo.placeholder, ": ").concat(provisionResult.error));
                        }
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        wranglerUpdated = false;
                        if (!(Object.keys(replacements).length > 0)) return [3 /*break*/, 7];
                        updatedContent = templateParser.replacePlaceholders(wranglerFile.content, replacements);
                        return [4 /*yield*/, sandbox.writeFile("".concat(instanceId, "/wrangler.jsonc"), updatedContent)];
                    case 6:
                        writeResult = _b.sent();
                        if (writeResult.success) {
                            wranglerUpdated = true;
                            this.logger.info("Updated wrangler.jsonc with ".concat(Object.keys(replacements).length, " resource IDs for ").concat(instanceId));
                            this.logger.info(templateParser.createReplacementSummary(replacements));
                        }
                        else {
                            this.logger.error("Failed to update wrangler.jsonc for ".concat(instanceId));
                        }
                        _b.label = 7;
                    case 7:
                        result = {
                            success: failed.length === 0,
                            provisioned: provisioned,
                            failed: failed,
                            replacements: replacements,
                            wranglerUpdated: wranglerUpdated
                        };
                        if (failed.length > 0) {
                            this.logger.warn("Resource provisioning completed with ".concat(failed.length, " failures for ").concat(instanceId));
                        }
                        else {
                            this.logger.info("Resource provisioning completed successfully for ".concat(instanceId));
                        }
                        return [2 /*return*/, result];
                    case 8:
                        error_6 = _b.sent();
                        this.logger.error("Exception during resource provisioning for ".concat(instanceId, ":"), error_6);
                        return [2 /*return*/, {
                                success: false,
                                provisioned: [],
                                failed: [],
                                replacements: {},
                                wranglerUpdated: false
                            }];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Updates project configuration files with the specified project name
     */
    SandboxSdkClient.prototype.updateProjectConfiguration = function (instanceId, projectName) {
        return __awaiter(this, void 0, void 0, function () {
            var sandbox, packageJsonResult, wranglerResult, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        sandbox = this.getSandbox();
                        // Update package.json with new project name (top-level only)
                        this.logger.info("Updating package.json with project name: ".concat(projectName));
                        return [4 /*yield*/, sandbox.exec("cd ".concat(instanceId, " && sed -i '1,10s/^[ \t]*\"name\"[ ]*:[ ]*\"[^\"]*\"/  \"name\": \"").concat(projectName, "\"/' package.json"))];
                    case 1:
                        packageJsonResult = _a.sent();
                        if (packageJsonResult.exitCode !== 0) {
                            this.logger.warn('Failed to update package.json', packageJsonResult.stderr);
                        }
                        // Update wrangler.jsonc with new project name (top-level only)
                        this.logger.info("Updating wrangler.jsonc with project name: ".concat(projectName));
                        return [4 /*yield*/, sandbox.exec("cd ".concat(instanceId, " && sed -i '0,/\"name\":/s/\"name\"[ ]*:[ ]*\"[^\"]*\"/\"name\": \"").concat(projectName, "\"/' wrangler.jsonc"))];
                    case 2:
                        wranglerResult = _a.sent();
                        if (wranglerResult.exitCode !== 0) {
                            this.logger.warn('Failed to update wrangler.jsonc', wranglerResult.stderr);
                        }
                        this.logger.info('Project configuration updated successfully');
                        return [3 /*break*/, 4];
                    case 3:
                        error_7 = _a.sent();
                        this.logger.error("Error updating project configuration: ".concat(error_7));
                        throw error_7;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SandboxSdkClient.prototype.setupInstance = function (instanceId, projectName, _localEnvVars) {
        return __awaiter(this, void 0, void 0, function () {
            var sandbox, resourceProvisioningResult, wranglerConfigFile, error_8, allocatedPort, installResult, processId, previewResult, previewURL, error_9, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 20, , 21]);
                        sandbox = this.getSandbox();
                        // Update project configuration with the specified project name
                        return [4 /*yield*/, this.updateProjectConfiguration(instanceId, projectName)];
                    case 1:
                        // Update project configuration with the specified project name
                        _a.sent();
                        return [4 /*yield*/, this.provisionTemplateResources(instanceId, projectName)];
                    case 2:
                        resourceProvisioningResult = _a.sent();
                        if (!resourceProvisioningResult.success && resourceProvisioningResult.failed.length > 0) {
                            this.logger.warn("Some resources failed to provision for ".concat(instanceId, ", but continuing setup process"));
                        }
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 8, , 9]);
                        return [4 /*yield*/, sandbox.readFile("".concat(instanceId, "/wrangler.jsonc"))];
                    case 4:
                        wranglerConfigFile = _a.sent();
                        if (!wranglerConfigFile.success) return [3 /*break*/, 6];
                        return [4 /*yield*/, cloudflare_workers_1.env.VibecoderStore.put(this.getWranglerKVKey(instanceId), wranglerConfigFile.content)];
                    case 5:
                        _a.sent();
                        this.logger.info('Wrangler configuration stored in KV', { instanceId: instanceId });
                        return [3 /*break*/, 7];
                    case 6:
                        this.logger.warn('Could not read wrangler.jsonc for KV storage', { instanceId: instanceId });
                        _a.label = 7;
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        error_8 = _a.sent();
                        this.logger.warn('Failed to store wrangler config in KV', { instanceId: instanceId, error: error_8 instanceof Error ? error_8.message : 'Unknown error' });
                        return [3 /*break*/, 9];
                    case 9: return [4 /*yield*/, this.allocateAvailablePort()];
                    case 10:
                        allocatedPort = _a.sent();
                        // Start cloudflared tunnel using the same port as dev server
                        // const tunnelPromise = this.startCloudflaredTunnel(instanceId, allocatedPort);
                        this.logger.info('Installing dependencies', { instanceId: instanceId });
                        return [4 /*yield*/, this.executeCommand(instanceId, "bun install")];
                    case 11:
                        installResult = _a.sent();
                        this.logger.info('Dependencies installed', { instanceId: instanceId });
                        if (!(installResult.exitCode === 0)) return [3 /*break*/, 18];
                        _a.label = 12;
                    case 12:
                        _a.trys.push([12, 16, , 17]);
                        // Set local environment variables if provided
                        // if (localEnvVars) {
                        //     await this.setLocalEnvVars(instanceId, localEnvVars);
                        // }
                        // Initialize git repository
                        return [4 /*yield*/, this.executeCommand(instanceId, "git init")];
                    case 13:
                        // Set local environment variables if provided
                        // if (localEnvVars) {
                        //     await this.setLocalEnvVars(instanceId, localEnvVars);
                        // }
                        // Initialize git repository
                        _a.sent();
                        this.logger.info('Git repository initialized', { instanceId: instanceId });
                        return [4 /*yield*/, this.startDevServer(instanceId, allocatedPort)];
                    case 14:
                        processId = _a.sent();
                        this.logger.info('Instance created successfully', { instanceId: instanceId, processId: processId, port: allocatedPort });
                        return [4 /*yield*/, sandbox.exposePort(allocatedPort, { hostname: this.hostname })];
                    case 15:
                        previewResult = _a.sent();
                        previewURL = previewResult.url;
                        // Wait for tunnel URL (tunnel forwards to same port)
                        // const tunnelURL = await tunnelPromise;
                        this.logger.info('Preview URL exposed', { instanceId: instanceId, previewURL: previewURL });
                        return [2 /*return*/, { previewURL: previewURL, tunnelURL: '', processId: processId, allocatedPort: allocatedPort }];
                    case 16:
                        error_9 = _a.sent();
                        this.logger.warn('Failed to start dev server', error_9);
                        return [2 /*return*/, undefined];
                    case 17: return [3 /*break*/, 19];
                    case 18:
                        this.logger.warn('Failed to install dependencies', installResult.stderr);
                        _a.label = 19;
                    case 19: return [3 /*break*/, 21];
                    case 20:
                        error_10 = _a.sent();
                        this.logger.warn('Failed to setup instance', error_10);
                        return [3 /*break*/, 21];
                    case 21: return [2 /*return*/, undefined];
                }
            });
        });
    };
    SandboxSdkClient.prototype.fetchDontTouchFiles = function (templateName) {
        return __awaiter(this, void 0, void 0, function () {
            var donttouchFiles, donttouchFile, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        donttouchFiles = [];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.getSandbox().readFile("".concat(templateName, "/.donttouch_files.json"))];
                    case 2:
                        donttouchFile = _a.sent();
                        if (donttouchFile.exitCode !== 0) {
                            this.logger.warn("Failed to read .donttouch_files.json: ".concat(donttouchFile.content));
                        }
                        donttouchFiles = JSON.parse(donttouchFile.content);
                        return [3 /*break*/, 4];
                    case 3:
                        error_11 = _a.sent();
                        this.logger.warn("Failed to read .donttouch_files.json: ".concat(error_11 instanceof Error ? error_11.message : 'Unknown error'));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, donttouchFiles];
                }
            });
        });
    };
    SandboxSdkClient.prototype.fetchRedactedFiles = function (templateName) {
        return __awaiter(this, void 0, void 0, function () {
            var redactedFiles, redactedFile, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        redactedFiles = [];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.getSandbox().readFile("".concat(templateName, "/.redacted_files.json"))];
                    case 2:
                        redactedFile = _a.sent();
                        if (redactedFile.exitCode !== 0) {
                            this.logger.warn("Failed to read .redacted_files.json: ".concat(redactedFile.content));
                        }
                        redactedFiles = JSON.parse(redactedFile.content);
                        return [3 /*break*/, 4];
                    case 3:
                        error_12 = _a.sent();
                        this.logger.warn("Failed to read .redacted_files.json: ".concat(error_12 instanceof Error ? error_12.message : 'Unknown error'));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, redactedFiles];
                }
            });
        });
    };
    SandboxSdkClient.prototype.createInstance = function (templateName, projectName, webhookUrl, localEnvVars) {
        return __awaiter(this, void 0, void 0, function () {
            var instanceId_1, results, _a, donttouchFiles, redactedFiles, moveTemplateResult, setupPromise, setupResult, metadata, error_13;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        instanceId_1 = "i-".concat((0, idGenerator_1.generateId)());
                        this.logger.info('Creating sandbox instance', { instanceId: instanceId_1, templateName: templateName, projectName: projectName });
                        results = void 0;
                        return [4 /*yield*/, this.ensureTemplateExists(templateName)];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, Promise.all([
                                this.fetchDontTouchFiles(templateName),
                                this.fetchRedactedFiles(templateName)
                            ])];
                    case 2:
                        _a = _b.sent(), donttouchFiles = _a[0], redactedFiles = _a[1];
                        return [4 /*yield*/, this.getSandbox().exec("mv ".concat(templateName, " ").concat(instanceId_1))];
                    case 3:
                        moveTemplateResult = _b.sent();
                        if (moveTemplateResult.exitCode !== 0) {
                            throw new Error("Failed to move template: ".concat(moveTemplateResult.stderr));
                        }
                        setupPromise = function () { return _this.setupInstance(instanceId_1, projectName, localEnvVars); };
                        return [4 /*yield*/, setupPromise()];
                    case 4:
                        setupResult = _b.sent();
                        if (!setupResult) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Failed to setup instance'
                                }];
                        }
                        results = setupResult;
                        metadata = {
                            templateName: templateName,
                            projectName: projectName,
                            startTime: new Date().toISOString(),
                            webhookUrl: webhookUrl,
                            previewURL: results === null || results === void 0 ? void 0 : results.previewURL,
                            processId: results === null || results === void 0 ? void 0 : results.processId,
                            tunnelURL: results === null || results === void 0 ? void 0 : results.tunnelURL,
                            allocatedPort: results === null || results === void 0 ? void 0 : results.allocatedPort,
                            donttouch_files: donttouchFiles,
                            redacted_files: redactedFiles,
                        };
                        return [4 /*yield*/, this.storeInstanceMetadata(instanceId_1, metadata)];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                runId: instanceId_1,
                                message: "Successfully created instance from template ".concat(templateName),
                                previewURL: results === null || results === void 0 ? void 0 : results.previewURL,
                                tunnelURL: results === null || results === void 0 ? void 0 : results.tunnelURL,
                                processId: results === null || results === void 0 ? void 0 : results.processId,
                            }];
                    case 6:
                        error_13 = _b.sent();
                        this.logger.error('createInstance', error_13, { templateName: templateName, projectName: projectName });
                        return [2 /*return*/, {
                                success: false,
                                error: "Failed to create instance: ".concat(error_13 instanceof Error ? error_13.message : 'Unknown error')
                            }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    SandboxSdkClient.prototype.getInstanceDetails = function (instanceId) {
        return __awaiter(this, void 0, void 0, function () {
            var metadata, startTime, uptime, _a, fileTree, runtimeErrors, instanceDetails, error_14;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getInstanceMetadata(instanceId)];
                    case 1:
                        metadata = _b.sent();
                        if (!metadata) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: "Instance ".concat(instanceId, " not found or metadata corrupted")
                                }];
                        }
                        startTime = new Date(metadata.startTime);
                        uptime = Math.floor((Date.now() - startTime.getTime()) / 1000);
                        return [4 /*yield*/, Promise.all([
                                this.buildFileTree(instanceId),
                                this.getInstanceErrors(instanceId)
                            ])];
                    case 2:
                        _a = _b.sent(), fileTree = _a[0], runtimeErrors = _a[1];
                        instanceDetails = {
                            runId: instanceId,
                            templateName: metadata.templateName,
                            startTime: startTime,
                            uptime: uptime,
                            directory: instanceId,
                            serviceDirectory: instanceId,
                            fileTree: fileTree,
                            runtimeErrors: runtimeErrors.errors,
                            previewURL: metadata.previewURL,
                            processId: metadata.processId,
                            tunnelURL: metadata.tunnelURL,
                        };
                        return [2 /*return*/, {
                                success: true,
                                instance: instanceDetails
                            }];
                    case 3:
                        error_14 = _b.sent();
                        this.logger.error('getInstanceDetails', error_14, { instanceId: instanceId });
                        return [2 /*return*/, {
                                success: false,
                                error: "Failed to get instance details: ".concat(error_14 instanceof Error ? error_14.message : 'Unknown error')
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SandboxSdkClient.prototype.getInstanceStatus = function (instanceId) {
        return __awaiter(this, void 0, void 0, function () {
            var metadata, isHealthy, process_2, _a, _b, error_15;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 9, , 10]);
                        return [4 /*yield*/, this.getInstanceMetadata(instanceId)];
                    case 1:
                        metadata = _c.sent();
                        if (!metadata) {
                            return [2 /*return*/, {
                                    success: false,
                                    pending: false,
                                    isHealthy: false,
                                    error: "Instance ".concat(instanceId, " not found")
                                }];
                        }
                        isHealthy = true;
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 7, , 8]);
                        if (!metadata.processId) return [3 /*break*/, 6];
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.getSandbox().getProcess(metadata.processId)];
                    case 4:
                        process_2 = _c.sent();
                        isHealthy = !!(process_2 && process_2.status === 'running');
                        return [3 /*break*/, 6];
                    case 5:
                        _a = _c.sent();
                        isHealthy = false; // Process not found or not running
                        return [3 /*break*/, 6];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        _b = _c.sent();
                        // No preview available
                        isHealthy = false;
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/, {
                            success: true,
                            pending: false,
                            isHealthy: isHealthy,
                            message: isHealthy ? 'Instance is running normally' : 'Instance may have issues',
                            previewURL: metadata.previewURL,
                            tunnelURL: metadata.tunnelURL,
                            processId: metadata.processId
                        }];
                    case 9:
                        error_15 = _c.sent();
                        this.logger.error('getInstanceStatus', error_15, { instanceId: instanceId });
                        return [2 /*return*/, {
                                success: false,
                                pending: false,
                                isHealthy: false,
                                error: "Failed to get instance status: ".concat(error_15 instanceof Error ? error_15.message : 'Unknown error')
                            }];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    SandboxSdkClient.prototype.shutdownInstance = function (instanceId) {
        return __awaiter(this, void 0, void 0, function () {
            var metadata, sandbox, processes, _i, processes_1, process_3, error_16, exposedPorts, _a, exposedPorts_1, port, _b, error_17;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 20, , 21]);
                        return [4 /*yield*/, this.getInstanceMetadata(instanceId)];
                    case 1:
                        metadata = _c.sent();
                        if (!metadata) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: "Instance ".concat(instanceId, " not found")
                                }];
                        }
                        this.logger.info("Shutting down instance: ".concat(instanceId));
                        sandbox = this.getSandbox();
                        return [4 /*yield*/, sandbox.listProcesses()];
                    case 2:
                        processes = _c.sent();
                        _i = 0, processes_1 = processes;
                        _c.label = 3;
                    case 3:
                        if (!(_i < processes_1.length)) return [3 /*break*/, 6];
                        process_3 = processes_1[_i];
                        return [4 /*yield*/, sandbox.killProcess(process_3.id)];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6:
                        if (!metadata.allocatedPort) return [3 /*break*/, 11];
                        _c.label = 7;
                    case 7:
                        _c.trys.push([7, 9, , 10]);
                        return [4 /*yield*/, sandbox.unexposePort(metadata.allocatedPort)];
                    case 8:
                        _c.sent();
                        this.logger.info("Unexposed port ".concat(metadata.allocatedPort, " for instance ").concat(instanceId));
                        return [3 /*break*/, 10];
                    case 9:
                        error_16 = _c.sent();
                        this.logger.warn("Failed to unexpose port ".concat(metadata.allocatedPort), error_16);
                        return [3 /*break*/, 10];
                    case 10: return [3 /*break*/, 18];
                    case 11:
                        _c.trys.push([11, 17, , 18]);
                        return [4 /*yield*/, sandbox.getExposedPorts('localhost')];
                    case 12:
                        exposedPorts = _c.sent();
                        _a = 0, exposedPorts_1 = exposedPorts;
                        _c.label = 13;
                    case 13:
                        if (!(_a < exposedPorts_1.length)) return [3 /*break*/, 16];
                        port = exposedPorts_1[_a];
                        return [4 /*yield*/, sandbox.unexposePort(port.port)];
                    case 14:
                        _c.sent();
                        _c.label = 15;
                    case 15:
                        _a++;
                        return [3 /*break*/, 13];
                    case 16: return [3 /*break*/, 18];
                    case 17:
                        _b = _c.sent();
                        return [3 /*break*/, 18];
                    case 18: 
                    // Clean up files
                    return [4 /*yield*/, sandbox.exec('rm -rf /app/*')];
                    case 19:
                        // Clean up files
                        _c.sent();
                        // Invalidate cache since instance is being shutdown
                        this.invalidateMetadataCache(instanceId);
                        return [2 /*return*/, {
                                success: true,
                                message: "Successfully shutdown instance ".concat(instanceId)
                            }];
                    case 20:
                        error_17 = _c.sent();
                        this.logger.error('shutdownInstance', error_17, { instanceId: instanceId });
                        return [2 /*return*/, {
                                success: false,
                                error: "Failed to shutdown instance: ".concat(error_17 instanceof Error ? error_17.message : 'Unknown error')
                            }];
                    case 21: return [2 /*return*/];
                }
            });
        });
    };
    // ==========================================
    // FILE OPERATIONS
    // ==========================================
    SandboxSdkClient.prototype.writeFiles = function (instanceId, files, commitMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var sandbox_3, results_1, metadata, donttouchFiles_1, filteredFiles, writePromises, writeResults, _i, writeResults_1, writeResult, wereDontTouchFiles, successCount, commitResult, error_18, error_19;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        sandbox_3 = this.getSandbox();
                        results_1 = [];
                        return [4 /*yield*/, this.getInstanceMetadata(instanceId)];
                    case 1:
                        metadata = _a.sent();
                        donttouchFiles_1 = new Set(metadata.donttouch_files);
                        filteredFiles = files.filter(function (file) { return !donttouchFiles_1.has(file.filePath); });
                        writePromises = filteredFiles.map(function (file) { return sandbox_3.writeFile("".concat(instanceId, "/").concat(file.filePath), file.fileContents); });
                        return [4 /*yield*/, Promise.all(writePromises)];
                    case 2:
                        writeResults = _a.sent();
                        for (_i = 0, writeResults_1 = writeResults; _i < writeResults_1.length; _i++) {
                            writeResult = writeResults_1[_i];
                            if (writeResult.success) {
                                results_1.push({
                                    file: writeResult.path,
                                    success: true
                                });
                                this.logger.info('File written', { filePath: writeResult.path });
                            }
                            else {
                                this.logger.error('File write failed', { filePath: writeResult.path });
                                results_1.push({
                                    file: writeResult.path,
                                    success: false,
                                    error: 'Unknown error'
                                });
                            }
                        }
                        wereDontTouchFiles = files.filter(function (file) { return donttouchFiles_1.has(file.filePath); });
                        wereDontTouchFiles.forEach(function (file) {
                            results_1.push({
                                file: file.filePath,
                                success: false,
                                error: 'File is forbidden to be modified'
                            });
                        });
                        if (wereDontTouchFiles.length > 0) {
                            this.logger.warn('Files were not written (protected by donttouch_files)', { files: wereDontTouchFiles.map(function (f) { return f.filePath; }) });
                        }
                        successCount = results_1.filter(function (r) { return r.success; }).length;
                        if (!(successCount > 0 && filteredFiles.some(function (file) { return file.filePath.endsWith('.ts') || file.filePath.endsWith('.tsx'); }))) return [3 /*break*/, 4];
                        return [4 /*yield*/, sandbox_3.exec("touch ".concat(instanceId, "/vite.config.ts"))];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.createLatestCommit(instanceId, commitMessage || 'Initial commit')];
                    case 5:
                        commitResult = _a.sent();
                        this.logger.info('Files committed to git', { result: commitResult });
                        return [3 /*break*/, 7];
                    case 6:
                        error_18 = _a.sent();
                        this.logger.error('Git commit failed', { error: error_18 instanceof Error ? error_18.message : 'Unknown error' });
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/, {
                            success: true,
                            results: results_1,
                            message: "Successfully wrote ".concat(successCount, "/").concat(files.length, " files")
                        }];
                    case 8:
                        error_19 = _a.sent();
                        this.logger.error('writeFiles', error_19, { instanceId: instanceId });
                        return [2 /*return*/, {
                                success: false,
                                results: files.map(function (f) { return ({ file: f.filePath, success: false, error: 'Instance error' }); }),
                                error: "Failed to write files: ".concat(error_19 instanceof Error ? error_19.message : 'Unknown error')
                            }];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    SandboxSdkClient.prototype.getFiles = function (templateOrInstanceId_1, filePaths_1) {
        return __awaiter(this, arguments, void 0, function (templateOrInstanceId, filePaths, applyFilter, redactedFiles) {
            var sandbox_4, importantFiles, redactedPaths, metadata, error_20, files, errors, readPromises, readResults, _i, readResults_1, readResult, _a, result, filePath, error_21;
            var _this = this;
            if (applyFilter === void 0) { applyFilter = true; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 8, , 9]);
                        sandbox_4 = this.getSandbox();
                        if (!!filePaths) return [3 /*break*/, 2];
                        return [4 /*yield*/, sandbox_4.exec("cd ".concat(templateOrInstanceId, " && jq -r '.[]' .important_files.json | while read -r path; do if [ -d \"$path\" ]; then find \"$path\" -type f; elif [ -f \"$path\" ]; then echo \"$path\"; fi; done"))];
                    case 1:
                        importantFiles = _b.sent();
                        this.logger.info("Read important files: stdout: ".concat(importantFiles.stdout, ", stderr: ").concat(importantFiles.stderr));
                        filePaths = importantFiles.stdout.split('\n').filter(function (path) { return path; });
                        if (!filePaths) {
                            return [2 /*return*/, {
                                    success: false,
                                    files: [],
                                    error: 'Failed to read important files'
                                }];
                        }
                        this.logger.info("Successfully read important files: ".concat(filePaths));
                        applyFilter = true;
                        _b.label = 2;
                    case 2:
                        redactedPaths = new Set();
                        if (!applyFilter) return [3 /*break*/, 6];
                        if (!redactedFiles) return [3 /*break*/, 3];
                        redactedPaths = new Set(redactedFiles);
                        return [3 /*break*/, 6];
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.getInstanceMetadata(templateOrInstanceId)];
                    case 4:
                        metadata = _b.sent();
                        redactedPaths = new Set(metadata.redacted_files);
                        return [3 /*break*/, 6];
                    case 5:
                        error_20 = _b.sent();
                        this.logger.warn('Failed to get redacted files', { templateOrInstanceId: templateOrInstanceId });
                        return [3 /*break*/, 6];
                    case 6:
                        files = [];
                        errors = [];
                        readPromises = filePaths.map(function (filePath) { return __awaiter(_this, void 0, void 0, function () {
                            var result, error_22;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, sandbox_4.readFile("".concat(templateOrInstanceId, "/").concat(filePath))];
                                    case 1:
                                        result = _a.sent();
                                        return [2 /*return*/, {
                                                result: result,
                                                filePath: filePath
                                            }];
                                    case 2:
                                        error_22 = _a.sent();
                                        return [2 /*return*/, {
                                                result: null,
                                                filePath: filePath,
                                                error: error_22
                                            }];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); });
                        return [4 /*yield*/, Promise.allSettled(readPromises)];
                    case 7:
                        readResults = _b.sent();
                        for (_i = 0, readResults_1 = readResults; _i < readResults_1.length; _i++) {
                            readResult = readResults_1[_i];
                            if (readResult.status === 'fulfilled') {
                                _a = readResult.value, result = _a.result, filePath = _a.filePath;
                                if (result && result.success) {
                                    files.push({
                                        filePath: filePath,
                                        fileContents: (applyFilter && redactedPaths.has(filePath)) ? '[REDACTED]' : result.content
                                    });
                                    this.logger.info('File read successfully', { filePath: filePath });
                                }
                                else {
                                    this.logger.error('File read failed', { filePath: filePath });
                                    errors.push({
                                        file: filePath,
                                        error: 'Failed to read file'
                                    });
                                }
                            }
                            else {
                                this.logger.error("Promise rejected for file read");
                                errors.push({
                                    file: 'unknown',
                                    error: 'Promise rejected'
                                });
                            }
                        }
                        return [2 /*return*/, {
                                success: true,
                                files: files,
                                errors: errors.length > 0 ? errors : undefined
                            }];
                    case 8:
                        error_21 = _b.sent();
                        this.logger.error('getFiles', error_21, { templateOrInstanceId: templateOrInstanceId });
                        return [2 /*return*/, {
                                success: false,
                                files: [],
                                error: "Failed to get files: ".concat(error_21 instanceof Error ? error_21.message : 'Unknown error')
                            }];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    // ==========================================
    // LOG RETRIEVAL
    // ==========================================
    SandboxSdkClient.prototype.getLogs = function (instanceId, onlyRecent) {
        return __awaiter(this, void 0, void 0, function () {
            var cmd, result, error_23;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.logger.info('Retrieving instance logs', { instanceId: instanceId });
                        cmd = "timeout 10s monitor-cli logs get -i ".concat(instanceId, " --format raw ").concat(onlyRecent ? '--reset' : '');
                        return [4 /*yield*/, this.executeCommand(instanceId, cmd, 15000)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                logs: {
                                    stdout: result.stdout,
                                    stderr: result.stderr,
                                },
                                error: undefined
                            }];
                    case 2:
                        error_23 = _a.sent();
                        this.logger.error('getLogs', error_23, { instanceId: instanceId });
                        return [2 /*return*/, {
                                success: false,
                                logs: {
                                    stdout: '',
                                    stderr: '',
                                },
                                error: "Failed to get logs: ".concat(error_23 instanceof Error ? error_23.message : 'Unknown error')
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ==========================================
    // COMMAND EXECUTION
    // ==========================================
    SandboxSdkClient.prototype.executeCommands = function (instanceId, commands, timeout) {
        return __awaiter(this, void 0, void 0, function () {
            var results, _i, commands_1, command, result, error, error_24, successCount, error_25;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        results = [];
                        _i = 0, commands_1 = commands;
                        _a.label = 1;
                    case 1:
                        if (!(_i < commands_1.length)) return [3 /*break*/, 6];
                        command = commands_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.executeCommand(instanceId, command, timeout)];
                    case 3:
                        result = _a.sent();
                        results.push({
                            command: command,
                            success: result.exitCode === 0,
                            output: result.stdout,
                            error: result.stderr || undefined,
                            exitCode: result.exitCode
                        });
                        if (result.exitCode !== 0) {
                            error = {
                                timestamp: new Date(),
                                message: "Command failed: ".concat(command),
                                stack: result.stderr,
                                severity: 'error',
                                source: 'command_execution',
                                rawOutput: "Command: ".concat(command, "\nExit code: ").concat(result.exitCode, "\nSTDOUT: ").concat(result.stdout, "\nSTDERR: ").concat(result.stderr)
                            };
                            this.logger.error('Command execution failed', { command: command, error: error });
                        }
                        this.logger.info('Command executed', { command: command, exitCode: result.exitCode });
                        return [3 /*break*/, 5];
                    case 4:
                        error_24 = _a.sent();
                        this.logger.error('Command execution failed with error', { command: command, error: error_24 });
                        results.push({
                            command: command,
                            success: false,
                            output: '',
                            error: error_24 instanceof Error ? error_24.message : 'Execution error'
                        });
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        successCount = results.filter(function (r) { return r.success; }).length;
                        return [2 /*return*/, {
                                success: true,
                                results: results,
                                message: "Executed ".concat(successCount, "/").concat(commands.length, " commands successfully")
                            }];
                    case 7:
                        error_25 = _a.sent();
                        this.logger.error('executeCommands', error_25, { instanceId: instanceId });
                        return [2 /*return*/, {
                                success: false,
                                results: commands.map(function (cmd) { return ({
                                    command: cmd,
                                    success: false,
                                    output: '',
                                    error: 'Instance error'
                                }); }),
                                error: "Failed to execute commands: ".concat(error_25 instanceof Error ? error_25.message : 'Unknown error')
                            }];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    // ==========================================
    // ERROR MANAGEMENT
    // ==========================================
    SandboxSdkClient.prototype.getInstanceErrors = function (instanceId, clear) {
        return __awaiter(this, void 0, void 0, function () {
            var errors, cmd, result, response, error_26;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        errors = [];
                        cmd = "timeout 3s monitor-cli errors list -i ".concat(instanceId, " --format json");
                        return [4 /*yield*/, this.executeCommand(instanceId, cmd, 15000)];
                    case 1:
                        result = _a.sent();
                        if (result.exitCode === 0) {
                            response = void 0;
                            try {
                                response = JSON.parse(result.stdout);
                                this.logger.info('getInstanceErrors', result.stdout);
                            }
                            catch (parseError) {
                                this.logger.warn('Failed to parse CLI output as JSON', { stdout: result.stdout });
                                throw new Error('Invalid JSON response from CLI tools');
                            }
                            if (response.success && response.errors) {
                                // Convert StoredError objects to RuntimeError format
                                // CLI returns StoredError objects with snake_case field names
                                errors = response.errors.map(function (err) { return ({
                                    timestamp: err.last_occurrence || err.created_at,
                                    message: String(err.message || ''),
                                    // stack: err.stack_trace ? String(err.stack_trace) : undefined, // Commented out to save memory
                                    // source: undefined, // Commented out - not needed for now
                                    filePath: err.source_file ? String(err.source_file) : undefined,
                                    lineNumber: typeof err.line_number === 'number' ? err.line_number : undefined,
                                    columnNumber: typeof err.column_number === 'number' ? err.column_number : undefined,
                                    severity: _this.mapSeverityToLegacy(String(err.severity || 'error')),
                                    rawOutput: err.raw_output ? String(err.raw_output) : undefined
                                }); });
                                // Auto-clear if requested
                                if (clear && errors.length > 0) {
                                    this.clearInstanceErrors(instanceId); // Call in the background
                                }
                                return [2 /*return*/, {
                                        success: true,
                                        errors: errors,
                                        hasErrors: errors.length > 0
                                    }];
                            }
                        }
                        this.logger.error("Failed to get errors for instance ".concat(instanceId, ": STDERR: ").concat(result.stderr, ", STDOUT: ").concat(result.stdout));
                        return [2 /*return*/, {
                                success: false,
                                errors: [],
                                hasErrors: false,
                                error: "Failed to get errors for instance ".concat(instanceId, ": STDERR: ").concat(result.stderr, ", STDOUT: ").concat(result.stdout)
                            }];
                    case 2:
                        error_26 = _a.sent();
                        this.logger.error('getInstanceErrors', error_26, { instanceId: instanceId });
                        return [2 /*return*/, {
                                success: false,
                                errors: [],
                                hasErrors: false,
                                error: "Failed to get errors: ".concat(error_26 instanceof Error ? error_26.message : 'Unknown error')
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SandboxSdkClient.prototype.clearInstanceErrors = function (instanceId) {
        return __awaiter(this, void 0, void 0, function () {
            var clearedCount, cmd, result, response, enhancedError_1, error_27;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        clearedCount = 0;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        cmd = "timeout 10s monitor-cli errors clear -i ".concat(instanceId, " --confirm");
                        return [4 /*yield*/, this.executeCommand(instanceId, cmd, 15000)];
                    case 2:
                        result = _a.sent();
                        if (result.exitCode === 0) {
                            response = void 0;
                            try {
                                response = JSON.parse(result.stdout);
                            }
                            catch (parseError) {
                                this.logger.warn('Failed to parse CLI output as JSON', { stdout: result.stdout });
                                throw new Error('Invalid JSON response from CLI tools');
                            }
                            if (response.success) {
                                return [2 /*return*/, {
                                        success: true,
                                        message: response.message || "Cleared ".concat(response.clearedCount || 0, " errors")
                                    }];
                            }
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        enhancedError_1 = _a.sent();
                        this.logger.warn('Error clearing unavailable, falling back to legacy', enhancedError_1);
                        return [3 /*break*/, 4];
                    case 4:
                        this.logger.info("Cleared ".concat(clearedCount, " errors for instance ").concat(instanceId));
                        return [2 /*return*/, {
                                success: true,
                                message: "Cleared ".concat(clearedCount, " errors")
                            }];
                    case 5:
                        error_27 = _a.sent();
                        this.logger.error('clearInstanceErrors', error_27, { instanceId: instanceId });
                        return [2 /*return*/, {
                                success: false,
                                error: "Failed to clear errors: ".concat(error_27 instanceof Error ? error_27.message : 'Unknown error')
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    // ==========================================
    // CODE ANALYSIS & FIXING
    // ==========================================
    SandboxSdkClient.prototype.runStaticAnalysisCode = function (instanceId) {
        return __awaiter(this, void 0, void 0, function () {
            var lintIssues, typecheckIssues, _a, lintResult, tscResult, results, lintData, _i, lintData_1, fileResult, _b, _c, message, output, lines, currentError, _d, lines_1, line, match, error_28;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 2, , 3]);
                        lintIssues = [];
                        typecheckIssues = [];
                        return [4 /*yield*/, Promise.allSettled([
                                this.executeCommand(instanceId, 'bun run lint'),
                                this.executeCommand(instanceId, 'bunx tsc -b --incremental --noEmit --pretty false')
                            ])];
                    case 1:
                        _a = _e.sent(), lintResult = _a[0], tscResult = _a[1];
                        results = {
                            success: true,
                            lint: {
                                issues: [],
                                summary: {
                                    errorCount: 0,
                                    warningCount: 0,
                                    infoCount: 0
                                },
                                rawOutput: ''
                            },
                            typecheck: {
                                issues: [],
                                summary: {
                                    errorCount: 0,
                                    warningCount: 0,
                                    infoCount: 0
                                },
                                rawOutput: ''
                            }
                        };
                        // Process ESLint results
                        if (lintResult.status === 'fulfilled') {
                            try {
                                lintData = JSON.parse(lintResult.value.stdout);
                                for (_i = 0, lintData_1 = lintData; _i < lintData_1.length; _i++) {
                                    fileResult = lintData_1[_i];
                                    for (_b = 0, _c = fileResult.messages || []; _b < _c.length; _b++) {
                                        message = _c[_b];
                                        lintIssues.push({
                                            message: message.message,
                                            filePath: fileResult.filePath,
                                            line: message.line || 0,
                                            column: message.column,
                                            severity: this.mapESLintSeverity(message.severity),
                                            ruleId: message.ruleId,
                                            source: 'eslint'
                                        });
                                    }
                                }
                            }
                            catch (error) {
                                this.logger.warn('Failed to parse ESLint output', error);
                            }
                            results.lint.issues = lintIssues;
                            results.lint.summary = {
                                errorCount: lintIssues.filter(function (issue) { return issue.severity === 'error'; }).length,
                                warningCount: lintIssues.filter(function (issue) { return issue.severity === 'warning'; }).length,
                                infoCount: lintIssues.filter(function (issue) { return issue.severity === 'info'; }).length
                            };
                            results.lint.rawOutput = "STDOUT: ".concat(lintResult.value.stdout, "\nSTDERR: ").concat(lintResult.value.stderr);
                        }
                        else if (lintResult.status === 'rejected') {
                            this.logger.warn('ESLint analysis failed', lintResult.reason);
                        }
                        // Process TypeScript check results
                        if (tscResult.status === 'fulfilled') {
                            try {
                                output = tscResult.value.stderr || tscResult.value.stdout;
                                if (!output || output.trim() === '') {
                                    this.logger.info('No TypeScript output to parse');
                                }
                                else {
                                    this.logger.info("Parsing TypeScript output: ".concat(output.substring(0, 200), "..."));
                                    lines = output.split('\n');
                                    currentError = null;
                                    for (_d = 0, lines_1 = lines; _d < lines_1.length; _d++) {
                                        line = lines_1[_d];
                                        match = line.match(/^(.+?)\((\d+),(\d+)\): error TS(\d+): (.*)$/);
                                        if (match) {
                                            // If we have a previous error being built, add it
                                            if (currentError) {
                                                typecheckIssues.push(currentError);
                                            }
                                            // Start building new error
                                            currentError = {
                                                message: match[5].trim(),
                                                filePath: match[1].trim(),
                                                line: parseInt(match[2]),
                                                column: parseInt(match[3]),
                                                severity: 'error',
                                                source: 'typescript',
                                                ruleId: "TS".concat(match[4])
                                            };
                                            this.logger.info("Found TypeScript error: ".concat(currentError.filePath, ":").concat(currentError.line, " - ").concat(currentError.ruleId));
                                        }
                                        else if (currentError && line.trim() && !line.startsWith('src/') && !line.includes(': error TS')) {
                                            // This might be a continuation of the error message
                                            currentError.message += ' ' + line.trim();
                                        }
                                    }
                                    // Add the last error if it exists
                                    if (currentError) {
                                        typecheckIssues.push(currentError);
                                    }
                                    this.logger.info("Parsed ".concat(typecheckIssues.length, " TypeScript errors"));
                                }
                            }
                            catch (error) {
                                this.logger.warn('Failed to parse TypeScript output', error);
                            }
                            results.typecheck.issues = typecheckIssues;
                            results.typecheck.summary = {
                                errorCount: typecheckIssues.filter(function (issue) { return issue.severity === 'error'; }).length,
                                warningCount: typecheckIssues.filter(function (issue) { return issue.severity === 'warning'; }).length,
                                infoCount: typecheckIssues.filter(function (issue) { return issue.severity === 'info'; }).length
                            };
                            results.typecheck.rawOutput = "STDOUT: ".concat(tscResult.value.stdout, "\nSTDERR: ").concat(tscResult.value.stderr);
                        }
                        else if (tscResult.status === 'rejected') {
                            this.logger.warn('TypeScript analysis failed', tscResult.reason);
                        }
                        this.logger.info("Analysis completed: ".concat(lintIssues.length, " lint issues, ").concat(typecheckIssues.length, " typecheck issues"));
                        return [2 /*return*/, __assign({}, results)];
                    case 2:
                        error_28 = _e.sent();
                        this.logger.error('runStaticAnalysisCode', error_28, { instanceId: instanceId });
                        return [2 /*return*/, {
                                success: false,
                                lint: { issues: [] },
                                typecheck: { issues: [] },
                                error: "Failed to run analysis: ".concat(error_28 instanceof Error ? error_28.message : 'Unknown error')
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Development utility method for fixing code issues
    SandboxSdkClient.prototype.fixCodeIssues = function (instanceId, allFiles) {
        return __awaiter(this, void 0, void 0, function () {
            var analysisResult, files, _a, fileFetcher, fixResult, error_29;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        this.logger.info("Fixing code issues for ".concat(instanceId));
                        return [4 /*yield*/, this.runStaticAnalysisCode(instanceId)];
                    case 1:
                        analysisResult = _b.sent();
                        this.logger.info("Static analysis completed for ".concat(instanceId));
                        _a = allFiles;
                        if (_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.getFiles(instanceId)];
                    case 2:
                        _a = (_b.sent()).files;
                        _b.label = 3;
                    case 3:
                        files = _a;
                        this.logger.info("Files retrieved for ".concat(instanceId));
                        fileFetcher = function (filePath) { return __awaiter(_this, void 0, void 0, function () {
                            var result, error_30;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, this.getSandbox().readFile("".concat(instanceId, "/").concat(filePath))];
                                    case 1:
                                        result = _a.sent();
                                        if (result.success) {
                                            this.logger.info("Successfully fetched file: ".concat(filePath));
                                            return [2 /*return*/, {
                                                    filePath: filePath,
                                                    fileContents: result.content,
                                                    filePurpose: "Fetched file: ".concat(filePath)
                                                }];
                                        }
                                        else {
                                            this.logger.debug("File not found: ".concat(filePath));
                                        }
                                        return [3 /*break*/, 3];
                                    case 2:
                                        error_30 = _a.sent();
                                        this.logger.debug("Failed to fetch file ".concat(filePath, ": ").concat(error_30 instanceof Error ? error_30.message : 'Unknown error'));
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/, null];
                                }
                            });
                        }); };
                        return [4 /*yield*/, (0, code_fixer_1.fixProjectIssues)(files.map(function (file) { return ({
                                filePath: file.filePath,
                                fileContents: file.fileContents,
                                filePurpose: ''
                            }); }), analysisResult.typecheck.issues, fileFetcher)];
                    case 4:
                        fixResult = _b.sent();
                        fixResult.modifiedFiles.forEach(function (file) {
                            _this.getSandbox().writeFile("".concat(instanceId, "/").concat(file.filePath), file.fileContents);
                        });
                        this.logger.info("Code fix completed for ".concat(instanceId));
                        return [2 /*return*/, fixResult];
                    case 5:
                        error_29 = _b.sent();
                        this.logger.error('fixCodeIssues', error_29, { instanceId: instanceId });
                        return [2 /*return*/, {
                                fixedIssues: [],
                                unfixableIssues: [],
                                modifiedFiles: []
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    SandboxSdkClient.prototype.mapESLintSeverity = function (severity) {
        switch (severity) {
            case 1: return 'warning';
            case 2: return 'error';
            default: return 'info';
        }
    };
    // ==========================================
    // DEPLOYMENT
    // ==========================================
    SandboxSdkClient.prototype.deployToCloudflareWorkers = function (instanceId) {
        return __awaiter(this, void 0, void 0, function () {
            var metadata, projectName, accountId, apiToken, sandbox, buildResult, wranglerBuildResult, wranglerConfigContent, config, workerPath, workerFile, workerContent, assetsPath, assetsManifest, fileContents, assetDirResult, hasAssets, assetProcessResult, dispatchConfig, deployConfig, deployedUrl, deploymentId, error_31;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 13, , 14]);
                        this.logger.info('Starting deployment', { instanceId: instanceId });
                        return [4 /*yield*/, this.getInstanceMetadata(instanceId)];
                    case 1:
                        metadata = _a.sent();
                        projectName = (metadata === null || metadata === void 0 ? void 0 : metadata.projectName) || instanceId;
                        accountId = cloudflare_workers_1.env.CLOUDFLARE_ACCOUNT_ID;
                        apiToken = cloudflare_workers_1.env.CLOUDFLARE_API_TOKEN;
                        if (!accountId || !apiToken) {
                            throw new Error('CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN must be set in environment');
                        }
                        sandbox = this.getSandbox();
                        this.logger.info('Processing deployment', { instanceId: instanceId });
                        // Step 1: Run build commands (bun run build && bunx wrangler build)
                        this.logger.info('Building project');
                        return [4 /*yield*/, this.executeCommand(instanceId, 'bun run build')];
                    case 2:
                        buildResult = _a.sent();
                        if (buildResult.exitCode !== 0) {
                            this.logger.warn('Build step failed or not available', buildResult.stdout, buildResult.stderr);
                            throw new Error("Build failed: ".concat(buildResult.stderr));
                        }
                        return [4 /*yield*/, this.executeCommand(instanceId, 'bunx wrangler build')];
                    case 3:
                        wranglerBuildResult = _a.sent();
                        if (wranglerBuildResult.exitCode !== 0) {
                            this.logger.warn('Wrangler build failed', wranglerBuildResult.stdout, wranglerBuildResult.stderr);
                            // Continue anyway - some projects might not need wrangler build
                        }
                        // Step 2: Parse wrangler config from KV
                        this.logger.info('Reading wrangler configuration from KV');
                        return [4 /*yield*/, cloudflare_workers_1.env.VibecoderStore.get(this.getWranglerKVKey(instanceId))];
                    case 4:
                        wranglerConfigContent = _a.sent();
                        if (!wranglerConfigContent) {
                            // This should never happen unless KV itself has some issues
                            throw new Error("Wrangler config not found in KV for ".concat(instanceId));
                        }
                        else {
                            this.logger.info('Using wrangler configuration from KV');
                        }
                        config = (0, deploy_1.parseWranglerConfig)(wranglerConfigContent);
                        this.logger.info('Worker configuration', { scriptName: config.name });
                        this.logger.info('Worker compatibility', { compatibilityDate: config.compatibility_date });
                        // Step 3: Read worker script from dist
                        this.logger.info('Reading worker script');
                        workerPath = "".concat(instanceId, "/dist/index.js");
                        return [4 /*yield*/, sandbox.readFile(workerPath)];
                    case 5:
                        workerFile = _a.sent();
                        if (!workerFile.success) {
                            throw new Error("Worker script not found at ".concat(workerPath, ". Please build the project first."));
                        }
                        workerContent = workerFile.content;
                        this.logger.info('Worker script loaded', { sizeKB: (workerContent.length / 1024).toFixed(2) });
                        assetsPath = "".concat(instanceId, "/dist/client");
                        assetsManifest = void 0;
                        fileContents = void 0;
                        return [4 /*yield*/, sandbox.exec("test -d ".concat(assetsPath, " && echo \"exists\" || echo \"missing\""))];
                    case 6:
                        assetDirResult = _a.sent();
                        hasAssets = assetDirResult.exitCode === 0 && assetDirResult.stdout.trim() === "exists";
                        if (!hasAssets) return [3 /*break*/, 8];
                        this.logger.info('Processing assets', { assetsPath: assetsPath });
                        return [4 /*yield*/, this.processAssetsInSandbox(instanceId, assetsPath)];
                    case 7:
                        assetProcessResult = _a.sent();
                        assetsManifest = assetProcessResult.assetsManifest;
                        fileContents = assetProcessResult.fileContents;
                        return [3 /*break*/, 9];
                    case 8:
                        this.logger.info('No assets found, deploying worker only');
                        _a.label = 9;
                    case 9:
                        dispatchConfig = __assign(__assign({}, config), { name: config.name });
                        deployConfig = (0, deploy_1.buildDeploymentConfig)(dispatchConfig, workerContent, accountId, apiToken, assetsManifest, config.compatibility_flags);
                        // Step 7: Deploy using pure function
                        this.logger.info('Deploying to Cloudflare');
                        if (!('DISPATCH_NAMESPACE' in cloudflare_workers_1.env)) return [3 /*break*/, 11];
                        this.logger.info('Using dispatch namespace', { dispatchNamespace: cloudflare_workers_1.env.DISPATCH_NAMESPACE });
                        return [4 /*yield*/, (0, deploy_1.deployToDispatch)(__assign(__assign({}, deployConfig), { dispatchNamespace: cloudflare_workers_1.env.DISPATCH_NAMESPACE }), fileContents, undefined, // additionalModules
                            config.migrations, config.assets)];
                    case 10:
                        _a.sent();
                        return [3 /*break*/, 12];
                    case 11: throw new Error('DISPATCH_NAMESPACE not found in environment variables, cannot deploy without dispatch namespace');
                    case 12:
                        deployedUrl = "".concat(this.getProtocolForHost(), "://").concat(projectName, ".").concat(this.hostname);
                        deploymentId = projectName;
                        this.logger.info('Deployment successful', {
                            instanceId: instanceId,
                            deployedUrl: deployedUrl,
                            deploymentId: deploymentId,
                            mode: 'dispatch-namespace'
                        });
                        return [2 /*return*/, {
                                success: true,
                                message: "Successfully deployed ".concat(instanceId, " using secure API deployment"),
                                deployedUrl: deployedUrl,
                                deploymentId: deploymentId,
                                output: "Deployed"
                            }];
                    case 13:
                        error_31 = _a.sent();
                        this.logger.error('deployToCloudflareWorkers', error_31, { instanceId: instanceId });
                        return [2 /*return*/, {
                                success: false,
                                message: "Deployment failed: ".concat(error_31 instanceof Error ? error_31.message : 'Unknown error'),
                                error: error_31 instanceof Error ? error_31.message : 'Unknown error'
                            }];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Process assets in sandbox and create manifest for deployment
     */
    SandboxSdkClient.prototype.processAssetsInSandbox = function (_instanceId, assetsPath) {
        return __awaiter(this, void 0, void 0, function () {
            var sandbox, findResult, filePaths, fileContents, filesAsArrayBuffer, _i, filePaths_1, fullPath, relativePath, fileResult, buffer, arrayBuffer, view, i, error_32, assetsManifest, assetCount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sandbox = this.getSandbox();
                        return [4 /*yield*/, sandbox.exec("find ".concat(assetsPath, " -type f"))];
                    case 1:
                        findResult = _a.sent();
                        if (findResult.exitCode !== 0) {
                            throw new Error("Failed to list assets: ".concat(findResult.stderr));
                        }
                        filePaths = findResult.stdout.trim().split('\n').filter(function (path) { return path; });
                        this.logger.info('Asset files found', { count: filePaths.length });
                        fileContents = new Map();
                        filesAsArrayBuffer = new Map();
                        _i = 0, filePaths_1 = filePaths;
                        _a.label = 2;
                    case 2:
                        if (!(_i < filePaths_1.length)) return [3 /*break*/, 7];
                        fullPath = filePaths_1[_i];
                        relativePath = fullPath.replace("".concat(assetsPath, "/"), '/');
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, sandbox.readFile(fullPath)];
                    case 4:
                        fileResult = _a.sent();
                        if (fileResult.success) {
                            buffer = Buffer.from(fileResult.content, 'binary');
                            fileContents.set(relativePath, buffer);
                            arrayBuffer = new ArrayBuffer(buffer.length);
                            view = new Uint8Array(arrayBuffer);
                            for (i = 0; i < buffer.length; i++) {
                                view[i] = buffer[i];
                            }
                            filesAsArrayBuffer.set(relativePath, arrayBuffer);
                            this.logger.info('Asset file processed', { path: relativePath, sizeBytes: buffer.length });
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        error_32 = _a.sent();
                        this.logger.warn("Failed to read asset file ".concat(fullPath, ":"), error_32);
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7: return [4 /*yield*/, (0, index_1.createAssetManifest)(filesAsArrayBuffer)];
                    case 8:
                        assetsManifest = _a.sent();
                        assetCount = Object.keys(assetsManifest).length;
                        this.logger.info('Asset manifest created', { assetCount: assetCount });
                        return [2 /*return*/, { assetsManifest: assetsManifest, fileContents: fileContents }];
                }
            });
        });
    };
    /**
     * Get protocol for host (utility method)
     */
    SandboxSdkClient.prototype.getProtocolForHost = function () {
        // Simple heuristic - use https for production-like domains
        if (this.hostname.includes('localhost') || this.hostname.includes('127.0.0.1')) {
            return 'http';
        }
        return 'https';
    };
    // ==========================================
    // GITHUB INTEGRATION
    // ==========================================
    SandboxSdkClient.prototype.createLatestCommit = function (instanceId, commitMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var addResult, commitResult, hashResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.executeCommand(instanceId, "git add .")];
                    case 1:
                        addResult = _a.sent();
                        if (addResult.exitCode !== 0) {
                            throw new Error("Git add failed: ".concat(addResult.stderr));
                        }
                        return [4 /*yield*/, this.executeCommand(instanceId, "git commit -m \"".concat(commitMessage.replace(/"/g, '\\"'), "\""))];
                    case 2:
                        commitResult = _a.sent();
                        if (commitResult.exitCode !== 0) {
                            throw new Error("Git commit failed: ".concat(commitResult.stderr));
                        }
                        return [4 /*yield*/, this.executeCommand(instanceId, "git rev-parse HEAD")];
                    case 3:
                        hashResult = _a.sent();
                        if (hashResult.exitCode === 0) {
                            return [2 /*return*/, hashResult.stdout.trim()];
                        }
                        throw new Error("Git rev-parse failed: ".concat(hashResult.stderr));
                }
            });
        });
    };
    /**
     * Export generated app to GitHub (creates repository if needed, then pushes files)
     */
    SandboxSdkClient.prototype.exportToGitHub = function (instanceId, request) {
        return __awaiter(this, void 0, void 0, function () {
            var pushRequest_1, pushResult_1, createResult, pushRequest, pushResult, error_33, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        this.logger.info("Starting GitHub export for instance ".concat(instanceId));
                        if (!(request.cloneUrl && request.repositoryHtmlUrl)) return [3 /*break*/, 2];
                        this.logger.info('Using existing repository URLs');
                        pushRequest_1 = {
                            cloneUrl: request.cloneUrl,
                            repositoryHtmlUrl: request.repositoryHtmlUrl,
                            token: request.token,
                            email: request.email,
                            username: request.username,
                            isPrivate: request.isPrivate
                        };
                        return [4 /*yield*/, this.pushToGitHub(instanceId, pushRequest_1)];
                    case 1:
                        pushResult_1 = _a.sent();
                        return [2 /*return*/, {
                                success: pushResult_1.success,
                                repositoryUrl: request.repositoryHtmlUrl,
                                cloneUrl: request.cloneUrl,
                                commitSha: pushResult_1.commitSha,
                                error: pushResult_1.error
                            }];
                    case 2:
                        // Create new repository via GitHubService
                        this.logger.info("Creating repository: ".concat(request.repositoryName));
                        return [4 /*yield*/, GitHubService_1.GitHubService.createUserRepository({
                                name: request.repositoryName,
                                description: request.description || "Generated app: ".concat(request.repositoryName),
                                private: request.isPrivate,
                                token: request.token
                            })];
                    case 3:
                        createResult = _a.sent();
                        if (!createResult.success || !createResult.repository) {
                            this.logger.error('Repository creation failed', createResult.error);
                            return [2 /*return*/, {
                                    success: false,
                                    error: createResult.error || 'Failed to create repository'
                                }];
                        }
                        this.logger.info("Repository created: ".concat(createResult.repository.html_url));
                        pushRequest = {
                            cloneUrl: createResult.repository.clone_url,
                            repositoryHtmlUrl: createResult.repository.html_url,
                            token: request.token,
                            email: request.email,
                            username: request.username,
                            isPrivate: request.isPrivate
                        };
                        return [4 /*yield*/, this.pushToGitHub(instanceId, pushRequest)];
                    case 4:
                        pushResult = _a.sent();
                        return [2 /*return*/, {
                                success: pushResult.success,
                                repositoryUrl: createResult.repository.html_url,
                                cloneUrl: createResult.repository.clone_url,
                                commitSha: pushResult.commitSha,
                                error: pushResult.error
                            }];
                    case 5:
                        error_33 = _a.sent();
                        errorMessage = error_33 instanceof Error ? error_33.message : 'Unknown error';
                        this.logger.error('GitHub export failed', { instanceId: instanceId, error: errorMessage });
                        return [2 /*return*/, {
                                success: false,
                                error: "GitHub export failed: ".concat(errorMessage)
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Push files to GitHub using secure API-based approach
     * Extracts git context from sandbox and delegates to GitHubService
     */
    SandboxSdkClient.prototype.pushToGitHub = function (instanceId, request) {
        return __awaiter(this, void 0, void 0, function () {
            var gitContext, finalGitContext, error_34, filesToUse, files, result, error_35, errorMessage;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        // Validate required parameters
                        if (!(instanceId === null || instanceId === void 0 ? void 0 : instanceId.trim())) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Instance ID is required'
                                }];
                        }
                        if (!((_a = request === null || request === void 0 ? void 0 : request.cloneUrl) === null || _a === void 0 ? void 0 : _a.trim())) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Clone URL is required'
                                }];
                        }
                        if (!((_b = request === null || request === void 0 ? void 0 : request.token) === null || _b === void 0 ? void 0 : _b.trim())) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'GitHub token is required'
                                }];
                        }
                        if (!((_c = request === null || request === void 0 ? void 0 : request.email) === null || _c === void 0 ? void 0 : _c.trim()) || !((_d = request === null || request === void 0 ? void 0 : request.username) === null || _d === void 0 ? void 0 : _d.trim())) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Git user email and username are required'
                                }];
                        }
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 10, , 11]);
                        this.logger.info("Starting GitHub push for instance ".concat(instanceId));
                        return [4 /*yield*/, this.extractGitContext(instanceId)];
                    case 2:
                        gitContext = _e.sent();
                        if (!gitContext.isGitRepo) {
                            this.logger.error('No git repository found in sandbox');
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'No git repository found in sandbox instance'
                                }];
                        }
                        finalGitContext = gitContext;
                        if (!(gitContext.hasUncommittedChanges || gitContext.hasUntrackedFiles)) return [3 /*break*/, 7];
                        this.logger.info('Auto-committing changes before GitHub push', {
                            hasUncommittedChanges: gitContext.hasUncommittedChanges,
                            hasUntrackedFiles: gitContext.hasUntrackedFiles,
                            untrackedFileCount: gitContext.untrackedFiles.length
                        });
                        _e.label = 3;
                    case 3:
                        _e.trys.push([3, 6, , 7]);
                        // Auto-commit all changes
                        return [4 /*yield*/, this.createLatestCommit(instanceId, 'Auto-commit before GitHub push')];
                    case 4:
                        // Auto-commit all changes
                        _e.sent();
                        return [4 /*yield*/, this.extractGitContext(instanceId)];
                    case 5:
                        // Re-extract git context after commit
                        finalGitContext = _e.sent();
                        this.logger.info('Auto-commit successful', {
                            newCommitCount: finalGitContext.localCommits.length
                        });
                        return [3 /*break*/, 7];
                    case 6:
                        error_34 = _e.sent();
                        this.logger.error('Auto-commit failed', error_34);
                        return [2 /*return*/, {
                                success: false,
                                error: "Failed to auto-commit changes: ".concat(error_34 instanceof Error ? error_34.message : 'Unknown error')
                            }];
                    case 7:
                        filesToUse = finalGitContext.allFiles.length > 0 ? finalGitContext.allFiles : finalGitContext.trackedFiles;
                        return [4 /*yield*/, this.getGitTrackedFiles(instanceId, filesToUse)];
                    case 8:
                        files = _e.sent();
                        if (files.length === 0) {
                            this.logger.warn('No files found to push');
                            return [2 /*return*/, {
                                    success: true,
                                    commitSha: undefined
                                }];
                        }
                        return [4 /*yield*/, GitHubService_1.GitHubService.pushFilesToRepository(files, request, {
                                localCommits: finalGitContext.localCommits,
                                hasUncommittedChanges: finalGitContext.hasUncommittedChanges
                            })];
                    case 9:
                        result = _e.sent();
                        this.logger.info('GitHub push completed', {
                            instanceId: instanceId,
                            success: result.success,
                            commitSha: result.commitSha,
                            localCommitCount: finalGitContext.localCommits.length,
                            fileCount: files.length
                        });
                        return [2 /*return*/, result];
                    case 10:
                        error_35 = _e.sent();
                        this.logger.error('pushToGitHub failed', error_35, { instanceId: instanceId, repositoryUrl: request.repositoryHtmlUrl });
                        errorMessage = error_35 instanceof Error ? error_35.message : 'Unknown error';
                        return [2 /*return*/, {
                                success: false,
                                error: "Secure GitHub push failed: ".concat(errorMessage),
                                details: {
                                    operation: 'secure_api_push',
                                    stderr: errorMessage
                                }
                            }];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Extract git history and file tracking information from local repository
     */
    SandboxSdkClient.prototype.extractGitContext = function (instanceId) {
        return __awaiter(this, void 0, void 0, function () {
            var gitCheckResult, logResult, localCommits, commitLines, _i, commitLines_1, line, _a, hash, message, timestamp, lsFilesResult, trackedFiles, untrackedResult, untrackedFiles, allFiles, statusResult, hasUncommittedChanges, hasUntrackedFiles, error_36;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.executeCommand(instanceId, 'git status')];
                    case 1:
                        gitCheckResult = _c.sent();
                        if (gitCheckResult.exitCode !== 0) {
                            this.logger.warn('Not a git repository or git not initialized', { instanceId: instanceId });
                            return [2 /*return*/, {
                                    localCommits: [],
                                    trackedFiles: [],
                                    untrackedFiles: [],
                                    allFiles: [],
                                    hasUncommittedChanges: false,
                                    hasUntrackedFiles: false,
                                    isGitRepo: false
                                }];
                        }
                        return [4 /*yield*/, this.executeCommand(instanceId, 'git log --oneline --reverse --pretty=format:"%H|%s|%cI"')];
                    case 2:
                        logResult = _c.sent();
                        localCommits = [];
                        if (logResult.exitCode === 0 && logResult.stdout.trim()) {
                            commitLines = logResult.stdout.trim().split('\n');
                            for (_i = 0, commitLines_1 = commitLines; _i < commitLines_1.length; _i++) {
                                line = commitLines_1[_i];
                                _a = line.split('|'), hash = _a[0], message = _a[1], timestamp = _a[2];
                                if (hash && message) {
                                    localCommits.push({
                                        hash: hash.trim(),
                                        message: message.trim(),
                                        timestamp: (timestamp === null || timestamp === void 0 ? void 0 : timestamp.trim()) || new Date().toISOString()
                                    });
                                }
                            }
                        }
                        return [4 /*yield*/, this.executeCommand(instanceId, 'git ls-files')];
                    case 3:
                        lsFilesResult = _c.sent();
                        trackedFiles = lsFilesResult.exitCode === 0
                            ? lsFilesResult.stdout.trim().split('\n').filter(function (f) { return f.trim(); })
                            : [];
                        return [4 /*yield*/, this.executeCommand(instanceId, 'git ls-files --others --exclude-standard')];
                    case 4:
                        untrackedResult = _c.sent();
                        untrackedFiles = untrackedResult.exitCode === 0
                            ? untrackedResult.stdout.trim().split('\n').filter(function (f) { return f.trim(); })
                            : [];
                        allFiles = __spreadArray(__spreadArray([], trackedFiles, true), untrackedFiles, true);
                        return [4 /*yield*/, this.executeCommand(instanceId, 'git status --porcelain')];
                    case 5:
                        statusResult = _c.sent();
                        hasUncommittedChanges = statusResult.exitCode === 0 && statusResult.stdout.trim().length > 0;
                        hasUntrackedFiles = untrackedFiles.length > 0;
                        this.logger.info('Full git context extracted', {
                            instanceId: instanceId,
                            localCommitCount: localCommits.length,
                            trackedFileCount: trackedFiles.length,
                            untrackedFileCount: untrackedFiles.length,
                            totalFileCount: allFiles.length,
                            hasUncommittedChanges: hasUncommittedChanges,
                            hasUntrackedFiles: hasUntrackedFiles,
                            latestCommit: (_b = localCommits[localCommits.length - 1]) === null || _b === void 0 ? void 0 : _b.message
                        });
                        return [2 /*return*/, {
                                localCommits: localCommits,
                                trackedFiles: trackedFiles,
                                untrackedFiles: untrackedFiles,
                                allFiles: allFiles,
                                hasUncommittedChanges: hasUncommittedChanges,
                                hasUntrackedFiles: hasUntrackedFiles,
                                isGitRepo: true
                            }];
                    case 6:
                        error_36 = _c.sent();
                        this.logger.warn('Failed to extract git context, using defaults', error_36);
                        return [2 /*return*/, {
                                localCommits: [],
                                trackedFiles: [],
                                untrackedFiles: [],
                                allFiles: [],
                                hasUncommittedChanges: false,
                                hasUntrackedFiles: false,
                                isGitRepo: false
                            }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Read contents of git files (both tracked and untracked)
     */
    SandboxSdkClient.prototype.getGitTrackedFiles = function (instanceId, filePaths) {
        return __awaiter(this, void 0, void 0, function () {
            var files, _i, filePaths_2, filePath, readResult, error_37;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        files = [];
                        this.logger.info("Reading ".concat(filePaths.length, " files for GitHub push"), { instanceId: instanceId });
                        _i = 0, filePaths_2 = filePaths;
                        _a.label = 1;
                    case 1:
                        if (!(_i < filePaths_2.length)) return [3 /*break*/, 6];
                        filePath = filePaths_2[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.getSandbox().readFile("".concat(instanceId, "/").concat(filePath))];
                    case 3:
                        readResult = _a.sent();
                        if (readResult.success && readResult.content) {
                            files.push({
                                filePath: filePath,
                                fileContents: readResult.content
                            });
                            this.logger.debug("Successfully read file: ".concat(filePath), { sizeBytes: readResult.content.length });
                        }
                        else {
                            this.logger.warn("File read failed or empty: ".concat(filePath));
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_37 = _a.sent();
                        this.logger.warn("Failed to read file ".concat(filePath), error_37);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        this.logger.info("Successfully read ".concat(files.length, "/").concat(filePaths.length, " files for GitHub push"));
                        return [2 /*return*/, files];
                }
            });
        });
    };
    /**
     * Map enhanced severity levels to legacy format for backward compatibility
     */
    SandboxSdkClient.prototype.mapSeverityToLegacy = function (severity) {
        switch (severity) {
            case 'fatal':
                return 'fatal';
            case 'error':
                return 'error';
            case 'warning':
            case 'info':
            default:
                return 'warning';
        }
    };
    return SandboxSdkClient;
}(BaseSandboxService_1.BaseSandboxService));
exports.SandboxSdkClient = SandboxSdkClient;
