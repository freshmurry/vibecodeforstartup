"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSandboxService = getSandboxService;
var sandboxSdkClient_1 = require("./sandboxSdkClient");
var remoteSandboxService_1 = require("./remoteSandboxService");
// @ts-ignore - Cloudflare runtime provides this
var cloudflare_workers_1 = require("cloudflare:workers");
function getSandboxService(sessionId, hostname) {
    if (cloudflare_workers_1.env.SANDBOX_SERVICE_TYPE == 'runner') {
        console.log("[getSandboxService] Using runner service for sandboxing");
        return new remoteSandboxService_1.RemoteSandboxServiceClient(sessionId);
    }
    console.log("[getSandboxService] Using sandboxsdk service for sandboxing");
    return new sandboxSdkClient_1.SandboxSdkClient(sessionId, hostname);
}
