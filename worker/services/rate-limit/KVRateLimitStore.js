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
exports.KVRateLimitStore = void 0;
var logger_1 = require("../../logger");
var KVRateLimitStore = /** @class */ (function () {
    function KVRateLimitStore() {
    }
    KVRateLimitStore.increment = function (kv, key, config) {
        return __awaiter(this, void 0, void 0, function () {
            var now, bucketSize, burstWindow, mainWindow, currentBucket, mainBuckets, burstBuckets, allBucketKeys, bucketResults, bucketMap_1, mainCount, burstCount, currentBucketKey, maxTtlSeconds, error_1;
            var _this = this;
            var _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        now = Date.now();
                        bucketSize = ((_b = config.bucketSize) !== null && _b !== void 0 ? _b : 10) * 1000;
                        burstWindow = ((_c = config.burstWindow) !== null && _c !== void 0 ? _c : 60) * 1000;
                        mainWindow = config.period * 1000;
                        currentBucket = Math.floor(now / bucketSize) * bucketSize;
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 4, , 5]);
                        mainBuckets = this.generateBucketKeys(key, now, mainWindow, bucketSize);
                        burstBuckets = config.burst
                            ? this.generateBucketKeys(key, now, burstWindow, bucketSize)
                            : [];
                        allBucketKeys = __spreadArray([], new Set(__spreadArray(__spreadArray([], mainBuckets, true), burstBuckets, true)), true);
                        return [4 /*yield*/, Promise.all(allBucketKeys.map(function (bucketKey) { return __awaiter(_this, void 0, void 0, function () {
                                var value;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, kv.get(bucketKey)];
                                        case 1:
                                            value = _b.sent();
                                            return [2 /*return*/, { key: bucketKey, count: value ? parseInt(value, 10) || 0 : 0 }];
                                    }
                                });
                            }); }))];
                    case 2:
                        bucketResults = _f.sent();
                        bucketMap_1 = new Map(bucketResults.map(function (r) { return [r.key, r.count]; }));
                        mainCount = mainBuckets.reduce(function (sum, bucketKey) { return sum + (bucketMap_1.get(bucketKey) || 0); }, 0);
                        burstCount = burstBuckets.reduce(function (sum, bucketKey) { return sum + (bucketMap_1.get(bucketKey) || 0); }, 0);
                        if (mainCount >= config.limit) {
                            return [2 /*return*/, { success: false, remainingLimit: 0 }];
                        }
                        if (config.burst && burstCount >= config.burst) {
                            return [2 /*return*/, { success: false, remainingLimit: 0 }];
                        }
                        currentBucketKey = "ratelimit:".concat(key, ":").concat(currentBucket);
                        maxTtlSeconds = Math.max(config.period, (_d = config.burstWindow) !== null && _d !== void 0 ? _d : 60) + ((_e = config.bucketSize) !== null && _e !== void 0 ? _e : 10);
                        return [4 /*yield*/, this.incrementBucketWithRetry(kv, currentBucketKey, maxTtlSeconds)];
                    case 3:
                        _f.sent();
                        return [2 /*return*/, { success: true, remainingLimit: Math.max(0, config.limit - mainCount - 1) }];
                    case 4:
                        error_1 = _f.sent();
                        this.logger.error('Failed to enforce KV rate limit', {
                            key: key,
                            error: error_1 instanceof Error ? error_1.message : 'Unknown error',
                        });
                        // Fail open
                        return [2 /*return*/, { success: true }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    KVRateLimitStore.getRemainingLimit = function (kv, key, config) {
        return __awaiter(this, void 0, void 0, function () {
            var now, bucketSize, mainWindow, mainBuckets, counts, mainCount;
            var _this = this;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        now = Date.now();
                        bucketSize = ((_b = config.bucketSize) !== null && _b !== void 0 ? _b : 10) * 1000;
                        mainWindow = config.period * 1000;
                        mainBuckets = this.generateBucketKeys(key, now, mainWindow, bucketSize);
                        return [4 /*yield*/, Promise.all(mainBuckets.map(function (bucketKey) { return __awaiter(_this, void 0, void 0, function () {
                                var value;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, kv.get(bucketKey)];
                                        case 1:
                                            value = _b.sent();
                                            return [2 /*return*/, value ? parseInt(value, 10) || 0 : 0];
                                    }
                                });
                            }); }))];
                    case 1:
                        counts = _c.sent();
                        mainCount = counts.reduce(function (sum, c) { return sum + c; }, 0);
                        return [2 /*return*/, Math.max(0, config.limit - mainCount)];
                }
            });
        });
    };
    KVRateLimitStore.generateBucketKeys = function (key, now, windowMs, bucketSizeMs) {
        var buckets = [];
        var windowStart = now - windowMs;
        for (var time = Math.floor(windowStart / bucketSizeMs) * bucketSizeMs; time <= now; time += bucketSizeMs) {
            buckets.push("ratelimit:".concat(key, ":").concat(time));
        }
        return buckets;
    };
    KVRateLimitStore.incrementBucketWithRetry = function (kv_1, bucketKey_1, ttlSeconds_1) {
        return __awaiter(this, arguments, void 0, function (kv, bucketKey, ttlSeconds, maxRetries) {
            var _loop_1, attempt, state_1;
            if (maxRetries === void 0) { maxRetries = 3; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _loop_1 = function (attempt) {
                            var current, newCount, error_2;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _c.trys.push([0, 3, , 6]);
                                        return [4 /*yield*/, kv.get(bucketKey)];
                                    case 1:
                                        current = _c.sent();
                                        newCount = (current ? parseInt(current, 10) : 0) + 1;
                                        return [4 /*yield*/, kv.put(bucketKey, newCount.toString(), { expirationTtl: ttlSeconds })];
                                    case 2:
                                        _c.sent();
                                        return [2 /*return*/, { value: void 0 }];
                                    case 3:
                                        error_2 = _c.sent();
                                        if (!(error_2 instanceof Error && error_2.message.includes('429') && attempt < maxRetries - 1)) return [3 /*break*/, 5];
                                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, Math.pow(2, attempt) * 100); })];
                                    case 4:
                                        _c.sent();
                                        return [2 /*return*/, "continue"];
                                    case 5: throw error_2;
                                    case 6: return [2 /*return*/];
                                }
                            });
                        };
                        attempt = 0;
                        _b.label = 1;
                    case 1:
                        if (!(attempt < maxRetries)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(attempt)];
                    case 2:
                        state_1 = _b.sent();
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
                        _b.label = 3;
                    case 3:
                        attempt++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    var _a;
    _a = KVRateLimitStore;
    KVRateLimitStore.logger = (0, logger_1.createObjectLogger)(_a, 'KVRateLimitStore');
    return KVRateLimitStore;
}());
exports.KVRateLimitStore = KVRateLimitStore;
