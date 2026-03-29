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
exports.mcpManager = exports.MCPManager = void 0;
var index_js_1 = require("@modelcontextprotocol/sdk/client/index.js");
var sse_js_1 = require("@modelcontextprotocol/sdk/client/sse.js");
var logger_1 = require("../../logger");
var logger = (0, logger_1.createLogger)('MCPManager');
var MCP_SERVERS = [
// {
// 	name: 'cloudflare-docs',
// 	sseUrl: 'https://docs.mcp.cloudflare.com/sse',
// },
];
/**
 * MCP Manager - Based on the reference implementation from vite-cfagents-runner
 * Manages connections to multiple MCP servers and provides unified tool access
 */
var MCPManager = /** @class */ (function () {
    function MCPManager() {
        this.clients = new Map();
        this.toolMap = new Map();
        this.initialized = false;
    }
    MCPManager.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, MCP_SERVERS_1, serverConfig, transport, client, toolsResult, _a, _b, tool, error_1;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (this.initialized)
                            return [2 /*return*/];
                        logger.info('Initializing MCP manager...');
                        _i = 0, MCP_SERVERS_1 = MCP_SERVERS;
                        _d.label = 1;
                    case 1:
                        if (!(_i < MCP_SERVERS_1.length)) return [3 /*break*/, 7];
                        serverConfig = MCP_SERVERS_1[_i];
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 5, , 6]);
                        transport = new sse_js_1.SSEClientTransport(new URL(serverConfig.sseUrl));
                        client = new index_js_1.Client({
                            name: 'cloudflare-agent',
                            version: '1.0.0',
                        }, {
                            capabilities: {},
                        });
                        logger.info("Connecting to MCP server ".concat(serverConfig.name, ", ").concat(serverConfig.sseUrl));
                        return [4 /*yield*/, client.connect(transport, { timeout: 500, maxTotalTimeout: 500 })];
                    case 3:
                        _d.sent();
                        logger.info("Connected to MCP server ".concat(serverConfig.name));
                        this.clients.set(serverConfig.name, client);
                        return [4 /*yield*/, client.listTools()];
                    case 4:
                        toolsResult = _d.sent();
                        if (toolsResult === null || toolsResult === void 0 ? void 0 : toolsResult.tools) {
                            for (_a = 0, _b = toolsResult.tools; _a < _b.length; _a++) {
                                tool = _b[_a];
                                this.toolMap.set(tool.name, serverConfig.name);
                            }
                        }
                        logger.info("Connected to MCP server ".concat(serverConfig.name, ", found ").concat(((_c = toolsResult === null || toolsResult === void 0 ? void 0 : toolsResult.tools) === null || _c === void 0 ? void 0 : _c.length) || 0, " tools"));
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _d.sent();
                        logger.error("Failed to connect to MCP server ".concat(serverConfig.name, ":"), error_1);
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 1];
                    case 7:
                        this.initialized = true;
                        logger.info("MCP manager initialized with ".concat(this.clients.size, " active connections"));
                        return [2 /*return*/];
                }
            });
        });
    };
    MCPManager.prototype.getToolDefinitions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var allTools, _i, _a, _b, serverName, client, toolsResult, _c, _d, tool, error_2;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.initialize()];
                    case 1:
                        _e.sent();
                        allTools = [];
                        _i = 0, _a = this.clients.entries();
                        _e.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        _b = _a[_i], serverName = _b[0], client = _b[1];
                        _e.label = 3;
                    case 3:
                        _e.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, client.listTools()];
                    case 4:
                        toolsResult = _e.sent();
                        if (toolsResult === null || toolsResult === void 0 ? void 0 : toolsResult.tools) {
                            for (_c = 0, _d = toolsResult.tools; _c < _d.length; _c++) {
                                tool = _d[_c];
                                allTools.push({
                                    type: 'function',
                                    function: {
                                        name: tool.name,
                                        description: tool.description || '',
                                        parameters: tool.inputSchema || {
                                            type: 'object',
                                            properties: {},
                                            required: [],
                                        },
                                    },
                                });
                            }
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        error_2 = _e.sent();
                        logger.error("Error getting tools from ".concat(serverName, ":"), error_2);
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7: return [2 /*return*/, allTools];
                }
            });
        });
    };
    MCPManager.prototype.executeTool = function (toolName, args) {
        return __awaiter(this, void 0, void 0, function () {
            var serverName, client, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        serverName = this.toolMap.get(toolName);
                        if (!serverName) {
                            throw new Error("Tool ".concat(toolName, " not found in any MCP server"));
                        }
                        client = this.clients.get(serverName);
                        if (!client) {
                            throw new Error("Client for server ".concat(serverName, " not available"));
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, client.callTool({
                                name: toolName,
                                arguments: args,
                            })];
                    case 3:
                        result = _a.sent();
                        if (result.isError) {
                            throw new Error("Tool execution failed: ".concat(Array.isArray(result.content) ? result.content.map(function (c) { return c.text; }).join('\n') : 'Unknown error'));
                        }
                        if (Array.isArray(result.content)) {
                            return [2 /*return*/, result.content
                                    .filter(function (c) { return c.type === 'text'; })
                                    .map(function (c) { return c.text; })
                                    .join('\n')];
                        }
                        return [2 /*return*/, 'No content returned'];
                    case 4:
                        error_3 = _a.sent();
                        throw new Error("Tool execution failed: ".concat(String(error_3)));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    MCPManager.prototype.hasToolAvailable = function (toolName) {
        return this.toolMap.has(toolName);
    };
    MCPManager.prototype.getAvailableToolNames = function () {
        return Array.from(this.toolMap.keys());
    };
    MCPManager.prototype.shutdown = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                logger.info('Shutting down MCP manager...');
                // MCP SDK handles cleanup automatically
                this.clients.clear();
                this.toolMap.clear();
                this.initialized = false;
                logger.info('MCP manager shutdown complete');
                return [2 /*return*/];
            });
        });
    };
    return MCPManager;
}());
exports.MCPManager = MCPManager;
// Singleton instance
exports.mcpManager = new MCPManager();
