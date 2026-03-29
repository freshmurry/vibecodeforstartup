"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareCloudflareButton = prepareCloudflareButton;
function prepareCloudflareButton(repositoryUrl, format) {
    var url = "https://deploy.workers.cloudflare.com/?url=".concat(repositoryUrl);
    if (format === 'markdown') {
        return "[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](".concat(url, ")");
    }
    else if (format === 'html') {
        return "<a href=\"".concat(url, "\"><img src=\"https://deploy.workers.cloudflare.com/button\" alt=\"Deploy to Cloudflare\" /></a>");
    }
    else {
        return url;
    }
}
