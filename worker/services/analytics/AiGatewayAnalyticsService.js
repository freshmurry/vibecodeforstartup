"use strict";
/**
 * AI Gateway Analytics Service
 * Provides analytics data from Cloudflare AI Gateway GraphQL API
 */
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
exports.AiGatewayAnalyticsService = void 0;
var logger_1 = require("../../logger");
var types_1 = require("./types");
var AiGatewayAnalyticsService = /** @class */ (function () {
    function AiGatewayAnalyticsService(env) {
        this.logger = (0, logger_1.createLogger)('AiGatewayAnalyticsService');
        this.config = this.initializeConfig(env);
        this.logger.info('AiGatewayAnalyticsService initialized', {
            endpoint: this.config.graphqlEndpoint,
            isStaging: this.config.isStaging,
            accountId: this.config.accountId,
            gateway: this.config.gateway
        });
    }
    /**
     * Initialize configuration from environment variables
     */
    AiGatewayAnalyticsService.prototype.initializeConfig = function (env) {
        var config = {
            accountId: '',
            gateway: '',
            graphqlEndpoint: 'https://api.cloudflare.com/client/v4/graphql',
            apiToken: '',
            isStaging: false
        };
        // If CLOUDFLARE_AI_GATEWAY_URL is set, parse it and use staging settings
        if (env.CLOUDFLARE_AI_GATEWAY_URL) {
            try {
                var _a = this.parseGatewayUrl(env.CLOUDFLARE_AI_GATEWAY_URL), accountId = _a.accountId, gateway = _a.gateway, isStaging = _a.isStaging;
                config.accountId = accountId;
                config.gateway = gateway;
                config.isStaging = isStaging;
                if (isStaging) {
                    config.graphqlEndpoint = 'https://api.staging.cloudflare.com/client/v4/graphql';
                    config.apiToken = env.CLOUDFLARE_AI_GATEWAY_TOKEN || '';
                }
                else {
                    config.apiToken = env.CLOUDFLARE_API_TOKEN || '';
                }
            }
            catch (error) {
                this.logger.warn('Failed to parse CLOUDFLARE_AI_GATEWAY_URL, falling back to direct env vars', { error: error });
                // Fall through to direct env vars
            }
        }
        // Use direct environment variables if gateway URL not set or parsing failed
        if (!config.accountId || !config.gateway || !config.apiToken) {
            config.accountId = env.CLOUDFLARE_ACCOUNT_ID || config.accountId;
            config.gateway = env.CLOUDFLARE_AI_GATEWAY || config.gateway;
            config.apiToken = env.CLOUDFLARE_API_TOKEN || config.apiToken;
        }
        // Validate required configuration
        if (!config.accountId || !config.gateway || !config.apiToken) {
            var missing = [];
            if (!config.accountId)
                missing.push('Account ID');
            if (!config.gateway)
                missing.push('Gateway name');
            if (!config.apiToken)
                missing.push('API token');
            throw new types_1.AnalyticsError("Missing required configuration: ".concat(missing.join(', ')), 'CONFIG_MISSING', 500);
        }
        return config;
    };
    /**
     * Parse AI Gateway URL to extract account ID and gateway name
     */
    AiGatewayAnalyticsService.prototype.parseGatewayUrl = function (url) {
        try {
            var parsedUrl = new URL(url);
            var isStaging = url.includes('staging');
            // URL format: https://staging.gateway.ai.cfdata.org/v1/{account_id}/{gateway_name}
            var pathParts = parsedUrl.pathname.split('/').filter(function (part) { return part; });
            if (pathParts.length >= 3 && pathParts[0] === 'v1') {
                return {
                    accountId: pathParts[1],
                    gateway: pathParts[2],
                    isStaging: isStaging
                };
            }
            throw new Error('Invalid gateway URL format');
        }
        catch (error) {
            throw new types_1.AnalyticsError("Failed to parse gateway URL: ".concat(error), 'INVALID_URL', 400, error);
        }
    };
    /**
     * Generate time range for analytics queries
     * If no days specified, returns maximum allowed range (30 days due to API limits)
     */
    AiGatewayAnalyticsService.prototype.getTimeRange = function (days) {
        var end = new Date();
        // Cloudflare AI Gateway API has a time range limit (~32 days max)
        // If no days specified, use 30 days to stay within limits
        var daysToQuery = days || 30;
        var start = new Date(end.getTime() - (daysToQuery * 24 * 60 * 60 * 1000));
        // Use the exact format from working examples
        var offsetMinutes = end.getTimezoneOffset();
        var offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
        var offsetMins = Math.abs(offsetMinutes) % 60;
        var offsetSign = offsetMinutes <= 0 ? '+' : '-';
        var offsetStr = "".concat(offsetSign).concat(offsetHours.toString().padStart(2, '0'), ":").concat(offsetMins.toString().padStart(2, '0'));
        // Set start time to beginning of the day
        var startOfDay = new Date(start);
        startOfDay.setHours(0, 0, 0, 0);
        return {
            start: startOfDay.toISOString().slice(0, 19) + offsetStr,
            end: end.toISOString().slice(0, 19) + offsetStr
        };
    };
    /**
     * Execute GraphQL query against Cloudflare Analytics API
     */
    AiGatewayAnalyticsService.prototype.executeQuery = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, response, responseTime, errorText, data, error, error_1, responseTime;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        startTime = Date.now();
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, fetch(this.config.graphqlEndpoint, {
                                method: 'POST',
                                headers: {
                                    'Authorization': "Bearer ".concat(this.config.apiToken),
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(query),
                            })];
                    case 2:
                        response = _c.sent();
                        responseTime = Date.now() - startTime;
                        if (!!response.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.text()];
                    case 3:
                        errorText = _c.sent();
                        throw new types_1.AnalyticsError("HTTP ".concat(response.status, ": ").concat(errorText), 'HTTP_ERROR', response.status);
                    case 4: return [4 /*yield*/, response.json()];
                    case 5:
                        data = _c.sent();
                        // Check for GraphQL errors
                        if (data.errors && data.errors.length > 0) {
                            error = data.errors[0];
                            throw new types_1.AnalyticsError(error.message || 'GraphQL query failed', ((_a = error.extensions) === null || _a === void 0 ? void 0 : _a.code) || 'GRAPHQL_ERROR', ((_b = error.extensions) === null || _b === void 0 ? void 0 : _b.code) === 'authz' ? 403 : 500);
                        }
                        return [2 /*return*/, {
                                data: data,
                                responseTime: responseTime,
                            }];
                    case 6:
                        error_1 = _c.sent();
                        responseTime = Date.now() - startTime;
                        if (error_1 instanceof types_1.AnalyticsError) {
                            return [2 /*return*/, {
                                    data: null,
                                    responseTime: responseTime,
                                    error: error_1.message
                                }];
                        }
                        return [2 /*return*/, {
                                data: null,
                                responseTime: responseTime,
                                error: error_1 instanceof Error ? error_1.message : String(error_1)
                            }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Build GraphQL query for specific filter type
     */
    AiGatewayAnalyticsService.prototype.buildQuery = function (type, timeRange, filterId) {
        var variables = {
            accountTag: this.config.accountId,
            gateway: this.config.gateway,
            start: timeRange.start,
            end: timeRange.end,
            limit: 1
        };
        var filterClause = '';
        switch (type) {
            case 'user':
                filterClause = 'metadataKeys_has: "userId",';
                break;
            case 'chat':
                filterClause = 'metadataKeys_has: "chatId",';
                break;
            case 'specific':
                if (!filterId)
                    throw new types_1.AnalyticsError('Filter ID required for specific queries', 'MISSING_FILTER_ID', 400);
                filterClause = "metadataValues_has: \"".concat(filterId, "\",");
                break;
            case 'total':
            default:
                // No additional filter for total analytics
                break;
        }
        return {
            operationName: null,
            variables: variables,
            query: "{\n        viewer {\n          scope: accounts(filter: {accountTag: $accountTag}) {\n            latestRequests: aiGatewayRequestsAdaptiveGroups(limit: $limit, filter: {gateway: $gateway, ".concat(filterClause, " datetimeHour_geq: $start, datetimeHour_leq: $end}) {\n              count\n              dimensions {\n                ts: datetimeHour\n                __typename\n              }\n              __typename\n            }\n            lastRequest: aiGatewayRequestsAdaptiveGroups(limit: 1, orderBy: [datetimeMinute_DESC], filter: {gateway: $gateway, ").concat(filterClause, " datetimeHour_geq: $start, datetimeHour_leq: $end}) {\n              dimensions {\n                ts: datetimeMinute\n                __typename\n              }\n              __typename\n            }\n            totalRequests: aiGatewayRequestsAdaptiveGroups(limit: $limit, filter: {gateway: $gateway, ").concat(filterClause, " datetimeHour_geq: $start, datetimeHour_leq: $end}) {\n              count\n              sum {\n                cost\n                cachedRequests\n                erroredRequests\n                uncachedTokensIn\n                uncachedTokensOut\n                cachedTokensIn\n                cachedTokensOut\n                __typename\n              }\n              __typename\n            }\n            __typename\n          }\n          __typename\n        }\n      }")
        };
    };
    /**
     * Process raw analytics response into structured data
     */
    AiGatewayAnalyticsService.prototype.processAnalyticsResponse = function (result, timeRange) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (result.error || !((_d = (_c = (_b = (_a = result.data) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.viewer) === null || _c === void 0 ? void 0 : _c.scope) === null || _d === void 0 ? void 0 : _d[0])) {
            throw new types_1.AnalyticsError(result.error || 'No analytics data available', 'NO_DATA', 404);
        }
        var scope = result.data.data.viewer.scope[0];
        var totalRequests = (_e = scope.totalRequests) === null || _e === void 0 ? void 0 : _e[0];
        var lastRequest = (_f = scope.lastRequest) === null || _f === void 0 ? void 0 : _f[0];
        var latestRequests = (_g = scope.latestRequests) === null || _g === void 0 ? void 0 : _g[0];
        if (!totalRequests) {
            throw new types_1.AnalyticsError('No request data available', 'NO_REQUEST_DATA', 404);
        }
        var _j = totalRequests.sum, cost = _j.cost, cachedRequests = _j.cachedRequests, erroredRequests = _j.erroredRequests, uncachedTokensIn = _j.uncachedTokensIn, uncachedTokensOut = _j.uncachedTokensOut, cachedTokensIn = _j.cachedTokensIn, cachedTokensOut = _j.cachedTokensOut;
        var totalTokensIn = uncachedTokensIn + cachedTokensIn;
        var totalTokensOut = uncachedTokensOut + cachedTokensOut;
        var errorRate = totalRequests.count > 0 ? ((erroredRequests / totalRequests.count) * 100) : 0;
        var cacheHitRate = totalRequests.count > 0 ? ((cachedRequests / totalRequests.count) * 100) : 0;
        return {
            totalRequests: totalRequests.count,
            totalCost: cost,
            tokensIn: totalTokensIn,
            tokensOut: totalTokensOut,
            errorRate: parseFloat(errorRate.toFixed(2)),
            cacheHitRate: parseFloat(cacheHitRate.toFixed(2)),
            cachedRequests: cachedRequests,
            erroredRequests: erroredRequests,
            lastRequestAt: ((_h = lastRequest === null || lastRequest === void 0 ? void 0 : lastRequest.dimensions) === null || _h === void 0 ? void 0 : _h.ts) || null,
            latestHourActivity: latestRequests ? {
                count: latestRequests.count,
                timestamp: latestRequests.dimensions.ts
            } : null,
            timeRange: timeRange,
            queryResponseTime: result.responseTime
        };
    };
    /**
     * Get analytics data for a specific user
     * @param userId - User ID to filter by
     * @param days - Number of days to query (optional, defaults to 30 days due to API limits)
     */
    AiGatewayAnalyticsService.prototype.getUserAnalytics = function (userId, days) {
        return __awaiter(this, void 0, void 0, function () {
            var timeRange, query, result, analyticsData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.info('Getting user analytics', { userId: userId, days: days || '30 days (default)' });
                        timeRange = this.getTimeRange(days);
                        query = this.buildQuery('specific', timeRange, userId);
                        return [4 /*yield*/, this.executeQuery(query)];
                    case 1:
                        result = _a.sent();
                        analyticsData = this.processAnalyticsResponse(result, timeRange);
                        return [2 /*return*/, __assign(__assign({}, analyticsData), { userId: userId })];
                }
            });
        });
    };
    /**
     * Get analytics data for a specific chat/agent
     * @param chatId - Chat/Agent ID to filter by
     * @param days - Number of days to query (optional, defaults to 30 days due to API limits)
     */
    AiGatewayAnalyticsService.prototype.getChatAnalytics = function (chatId, days) {
        return __awaiter(this, void 0, void 0, function () {
            var timeRange, query, result, analyticsData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.info('Getting chat analytics', { chatId: chatId, days: days || '30 days (default)' });
                        timeRange = this.getTimeRange(days);
                        query = this.buildQuery('specific', timeRange, chatId);
                        return [4 /*yield*/, this.executeQuery(query)];
                    case 1:
                        result = _a.sent();
                        analyticsData = this.processAnalyticsResponse(result, timeRange);
                        return [2 /*return*/, __assign(__assign({}, analyticsData), { chatId: chatId })];
                }
            });
        });
    };
    /**
     * Get total gateway analytics (for debugging/admin purposes)
     * @param days - Number of days to query (optional, defaults to 30 days due to API limits)
     */
    AiGatewayAnalyticsService.prototype.getTotalAnalytics = function (days) {
        return __awaiter(this, void 0, void 0, function () {
            var timeRange, query, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.info('Getting total analytics', { days: days || '30 days (default)' });
                        timeRange = this.getTimeRange(days);
                        query = this.buildQuery('total', timeRange);
                        return [4 /*yield*/, this.executeQuery(query)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, this.processAnalyticsResponse(result, timeRange)];
                }
            });
        });
    };
    return AiGatewayAnalyticsService;
}());
exports.AiGatewayAnalyticsService = AiGatewayAnalyticsService;
