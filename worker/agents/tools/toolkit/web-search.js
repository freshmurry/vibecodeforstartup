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
exports.toolWebSearchDefinition = void 0;
// @ts-ignore - Cloudflare runtime provides this
var cloudflare_workers_1 = require("cloudflare:workers");
var createSearchUrl = function (query, apiKey, numResults) {
    var url = new URL('https://serpapi.com/search');
    url.searchParams.set('engine', 'google');
    url.searchParams.set('q', query);
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('num', Math.min(numResults, 10).toString());
    return url.toString();
};
var formatSearchResults = function (data, query, numResults) {
    var _a, _b, _c, _d;
    var results = [];
    // Knowledge graph
    if (((_a = data.knowledge_graph) === null || _a === void 0 ? void 0 : _a.title) && data.knowledge_graph.description) {
        results.push("**".concat(data.knowledge_graph.title, "**\n").concat(data.knowledge_graph.description));
        if ((_b = data.knowledge_graph.source) === null || _b === void 0 ? void 0 : _b.link)
            results.push("Source: ".concat(data.knowledge_graph.source.link));
    }
    // Answer box
    if (data.answer_box) {
        var _e = data.answer_box, answer = _e.answer, snippet = _e.snippet, title = _e.title, link = _e.link;
        if (answer)
            results.push("**Answer**: ".concat(answer));
        else if (snippet)
            results.push("**".concat(title || 'Answer', "**: ").concat(snippet));
        if (link)
            results.push("Source: ".concat(link));
    }
    // Organic results
    if ((_c = data.organic_results) === null || _c === void 0 ? void 0 : _c.length) {
        results.push('\n**Search Results:**');
        data.organic_results.slice(0, numResults).forEach(function (result, index) {
            if (result.title && result.link) {
                var text = ["".concat(index + 1, ". **").concat(result.title, "**")];
                if (result.snippet)
                    text.push("   ".concat(result.snippet));
                text.push("   Link: ".concat(result.link));
                results.push(text.join('\n'));
            }
        });
    }
    // Local results
    if ((_d = data.local_results) === null || _d === void 0 ? void 0 : _d.length) {
        results.push('\n**Local Results:**');
        data.local_results.slice(0, 3).forEach(function (result, index) {
            if (result.title) {
                var text = ["".concat(index + 1, ". **").concat(result.title, "**")];
                if (result.address)
                    text.push("   Address: ".concat(result.address));
                if (result.phone)
                    text.push("   Phone: ".concat(result.phone));
                if (result.rating)
                    text.push("   Rating: ".concat(result.rating, " stars"));
                results.push(text.join('\n'));
            }
        });
    }
    return results.length
        ? "\uD83D\uDD0D Search results for \"".concat(query, "\":\n\n").concat(results.join('\n\n'))
        : "No results found for \"".concat(query, "\". Try: https://www.google.com/search?q=").concat(encodeURIComponent(query));
};
function performWebSearch(query_1) {
    return __awaiter(this, arguments, void 0, function (query, numResults) {
        var apiKey, response, data, error_1, isTimeout, fallback;
        if (numResults === void 0) { numResults = 5; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiKey = cloudflare_workers_1.env.SERPAPI_KEY;
                    if (!apiKey) {
                        return [2 /*return*/, "\uD83D\uDD0D Web search requires SerpAPI key. Get one at https://serpapi.com/\nFallback: https://www.google.com/search?q=".concat(encodeURIComponent(query))];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch(createSearchUrl(query, apiKey, numResults), {
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (compatible; WebBot/1.0)',
                                Accept: 'application/json',
                            },
                            signal: AbortSignal.timeout(15000),
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok)
                        throw new Error("SerpAPI returned ".concat(response.status));
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (data.error)
                        throw new Error("SerpAPI error: ".concat(data.error));
                    return [2 /*return*/, formatSearchResults(data, query, numResults)];
                case 4:
                    error_1 = _a.sent();
                    isTimeout = error_1 instanceof Error && error_1.message.includes('timeout');
                    fallback = "https://www.google.com/search?q=".concat(encodeURIComponent(query));
                    return [2 /*return*/, "Search failed: ".concat(isTimeout ? 'timeout' : 'API error', ". Try: ").concat(fallback)];
                case 5: return [2 /*return*/];
            }
        });
    });
}
var extractTextFromHtml = function (html) {
    return html
        .replace(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};
function fetchWebContent(url) {
    return __awaiter(this, void 0, void 0, function () {
        var response, contentType, html, text, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    new URL(url); // Validate
                    return [4 /*yield*/, fetch(url, {
                            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebBot/1.0)' },
                            signal: AbortSignal.timeout(10000),
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok)
                        throw new Error("HTTP ".concat(response.status));
                    contentType = response.headers.get('content-type') || '';
                    if (!contentType.includes('text/'))
                        throw new Error('Unsupported content type');
                    return [4 /*yield*/, response.text()];
                case 2:
                    html = _a.sent();
                    text = extractTextFromHtml(html);
                    return [2 /*return*/, text.length
                            ? "Content from ".concat(url, ":\n\n").concat(text.slice(0, 4000)).concat(text.length > 4000 ? '...' : '')
                            : "No readable content found at ".concat(url)];
                case 3:
                    error_2 = _a.sent();
                    throw new Error("Failed to fetch: ".concat(error_2 instanceof Error ? error_2.message : 'Unknown error'));
                case 4: return [2 /*return*/];
            }
        });
    });
}
var toolWebSearch = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var query, url, _a, num_results, content, content;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                query = args.query, url = args.url, _a = args.num_results, num_results = _a === void 0 ? 5 : _a;
                if (!(typeof url === 'string')) return [3 /*break*/, 2];
                return [4 /*yield*/, fetchWebContent(url)];
            case 1:
                content = _b.sent();
                return [2 /*return*/, { content: content }];
            case 2:
                if (!(typeof query === 'string')) return [3 /*break*/, 4];
                return [4 /*yield*/, performWebSearch(query, num_results)];
            case 3:
                content = _b.sent();
                return [2 /*return*/, { content: content }];
            case 4: return [2 /*return*/, { error: 'Either query or url parameter is required' }];
        }
    });
}); };
exports.toolWebSearchDefinition = {
    implementation: toolWebSearch,
    type: 'function',
    function: {
        name: 'web_search',
        description: 'Search the web using Google or fetch content from a specific URL',
        parameters: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'Search query for Google search',
                },
                url: {
                    type: 'string',
                    description: 'Specific URL to fetch content from (alternative to search)',
                },
                num_results: {
                    type: 'number',
                    description: 'Number of search results to return (default: 5, max: 10)',
                    default: 5,
                },
            },
            required: [],
        },
    },
};
