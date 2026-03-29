"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProtocolForHost = void 0;
exports.getPreviewDomain = getPreviewDomain;
exports.buildUserWorkerUrl = buildUserWorkerUrl;
var getProtocolForHost = function (host) {
    if (host.startsWith('localhost') || host.startsWith('127.0.0.1') || host.startsWith('0.0.0.0') || host.startsWith('::1')) {
        return 'http';
    }
    else {
        return 'https';
    }
};
exports.getProtocolForHost = getProtocolForHost;
function getPreviewDomain(env) {
    if (env.CUSTOM_PREVIEW_DOMAIN && env.CUSTOM_PREVIEW_DOMAIN.trim() !== '') {
        return env.CUSTOM_PREVIEW_DOMAIN;
    }
    return env.CUSTOM_DOMAIN;
}
function buildUserWorkerUrl(env, deploymentId) {
    var domain = getPreviewDomain(env);
    var protocol = (0, exports.getProtocolForHost)(domain);
    return "".concat(protocol, "://").concat(deploymentId, ".").concat(domain);
}
