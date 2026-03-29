"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateParser = void 0;
var TemplateParser = /** @class */ (function () {
    function TemplateParser(logger) {
        this.logger = logger;
    }
    TemplateParser.prototype.detectPlaceholders = function (wranglerContent) {
        var placeholders = [];
        for (var _i = 0, _a = Object.entries(TemplateParser.PLACEHOLDER_PATTERNS); _i < _a.length; _i++) {
            var _b = _a[_i], placeholder = _b[0], resourceType = _b[1];
            if (wranglerContent.includes(placeholder)) {
                this.logger.info("Found ".concat(resourceType, " placeholder: ").concat(placeholder));
                var binding = void 0;
                try {
                    binding = this.extractBindingName(wranglerContent, placeholder, resourceType);
                }
                catch (error) {
                    this.logger.warn("Could not extract binding name for ".concat(placeholder, ":"), error);
                }
                placeholders.push({
                    placeholder: placeholder,
                    resourceType: resourceType,
                    binding: binding
                });
            }
        }
        this.logger.info("Detected ".concat(placeholders.length, " placeholders in wrangler.jsonc"));
        return placeholders;
    };
    TemplateParser.prototype.extractBindingName = function (content, placeholder, resourceType) {
        try {
            var parsedContent = JSON.parse(content);
            if (resourceType === 'KV' && parsedContent.kv_namespaces) {
                for (var _i = 0, _a = parsedContent.kv_namespaces; _i < _a.length; _i++) {
                    var kvNamespace = _a[_i];
                    if (kvNamespace.id === placeholder) {
                        return kvNamespace.binding;
                    }
                }
            }
            else if (resourceType === 'D1' && parsedContent.d1_databases) {
                for (var _b = 0, _c = parsedContent.d1_databases; _b < _c.length; _b++) {
                    var d1Database = _c[_b];
                    if (d1Database.database_id === placeholder) {
                        return d1Database.binding;
                    }
                }
            }
        }
        catch (error) {
            this.logger.warn('Could not parse wrangler.jsonc as JSON to extract binding name:', error);
        }
        return undefined;
    };
    TemplateParser.prototype.replacePlaceholders = function (content, replacements) {
        var updatedContent = content;
        for (var _i = 0, _a = Object.entries(replacements); _i < _a.length; _i++) {
            var _b = _a[_i], placeholder = _b[0], resourceId = _b[1];
            if (updatedContent.includes(placeholder)) {
                updatedContent = updatedContent.replace(new RegExp(placeholder, 'g'), resourceId);
                this.logger.info("Replaced ".concat(placeholder, " with ").concat(resourceId));
            }
        }
        return updatedContent;
    };
    TemplateParser.prototype.parseWranglerConfig = function (content) {
        var placeholders = this.detectPlaceholders(content);
        return {
            hasPlaceholders: placeholders.length > 0,
            placeholders: placeholders,
            content: content
        };
    };
    TemplateParser.prototype.validateReplacements = function (content) {
        var remainingPlaceholders = this.detectPlaceholders(content);
        if (remainingPlaceholders.length > 0) {
            this.logger.warn("Still has ".concat(remainingPlaceholders.length, " unresolved placeholders:"), remainingPlaceholders.map(function (p) { return p.placeholder; }));
            return false;
        }
        this.logger.info('All placeholders have been successfully replaced');
        return true;
    };
    TemplateParser.prototype.createReplacementSummary = function (replacements) {
        var summary = Object.entries(replacements)
            .map(function (_a) {
            var placeholder = _a[0], id = _a[1];
            return "".concat(placeholder, " \u2192 ").concat(id);
        })
            .join(', ');
        return "Replaced ".concat(Object.keys(replacements).length, " placeholders: ").concat(summary);
    };
    TemplateParser.PLACEHOLDER_PATTERNS = {
        '{{KV_ID}}': 'KV',
        '{{D1_ID}}': 'D1'
    };
    return TemplateParser;
}());
exports.TemplateParser = TemplateParser;
