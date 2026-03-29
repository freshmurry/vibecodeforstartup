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
exports.DORateLimitStore = void 0;
// @ts-ignore - Cloudflare runtime provides this
var cloudflare_workers_1 = require("cloudflare:workers");
/**
 * DORateLimitStore - Durable Object-based rate limiting store
 *
 * Provides distributed rate limiting using bucketed sliding window algorithm
 * similar to the KV implementation but with better scalability, consistency and cost-effectiveness
 */
var DORateLimitStore = /** @class */ (function (_super) {
    __extends(DORateLimitStore, _super);
    function DORateLimitStore(ctx, env) {
        var _this = _super.call(this, ctx, env) || this;
        _this.state = {
            buckets: new Map(),
            lastCleanup: Date.now()
        };
        _this.initialized = false;
        return _this;
    }
    DORateLimitStore.prototype.increment = function (key, config) {
        return __awaiter(this, void 0, void 0, function () {
            var now, bucketSize, burstWindow, mainWindow, currentBucket, bucketKey, mainBuckets, burstBuckets, mainCount, burstCount, existing, newCount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureInitialized()];
                    case 1:
                        _a.sent();
                        now = Date.now();
                        bucketSize = (config.bucketSize || 10) * 1000;
                        burstWindow = (config.burstWindow || 60) * 1000;
                        mainWindow = config.period * 1000;
                        currentBucket = Math.floor(now / bucketSize) * bucketSize;
                        bucketKey = "".concat(key, ":").concat(currentBucket);
                        if (!(now - this.state.lastCleanup > 5 * 60 * 1000)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.cleanup(now, Math.max(mainWindow, burstWindow))];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        mainBuckets = this.getBucketsInWindow(key, now, mainWindow, bucketSize);
                        burstBuckets = config.burst ? this.getBucketsInWindow(key, now, burstWindow, bucketSize) : [];
                        mainCount = mainBuckets.reduce(function (sum, bucket) { return sum + bucket.count; }, 0);
                        burstCount = burstBuckets.reduce(function (sum, bucket) { return sum + bucket.count; }, 0);
                        // Check limits
                        if (mainCount >= config.limit) {
                            return [2 /*return*/, { success: false, remainingLimit: 0 }];
                        }
                        if (config.burst && burstCount >= config.burst) {
                            return [2 /*return*/, { success: false, remainingLimit: 0 }];
                        }
                        existing = this.state.buckets.get(bucketKey);
                        newCount = ((existing === null || existing === void 0 ? void 0 : existing.count) || 0) + 1;
                        this.state.buckets.set(bucketKey, {
                            count: newCount,
                            timestamp: now
                        });
                        return [4 /*yield*/, this.persistState()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                remainingLimit: config.limit - mainCount - 1
                            }];
                }
            });
        });
    };
    DORateLimitStore.prototype.getRemainingLimit = function (key, config) {
        return __awaiter(this, void 0, void 0, function () {
            var now, bucketSize, mainWindow, mainBuckets, mainCount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureInitialized()];
                    case 1:
                        _a.sent();
                        now = Date.now();
                        bucketSize = (config.bucketSize || 10) * 1000;
                        mainWindow = config.period * 1000;
                        mainBuckets = this.getBucketsInWindow(key, now, mainWindow, bucketSize);
                        mainCount = mainBuckets.reduce(function (sum, bucket) { return sum + bucket.count; }, 0);
                        return [2 /*return*/, Math.max(0, config.limit - mainCount)];
                }
            });
        });
    };
    DORateLimitStore.prototype.resetLimit = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var keysToDelete, _i, keysToDelete_1, bucketKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureInitialized()];
                    case 1:
                        _a.sent();
                        if (key) {
                            keysToDelete = Array.from(this.state.buckets.keys())
                                .filter(function (bucketKey) { return bucketKey.startsWith("".concat(key, ":")); });
                            for (_i = 0, keysToDelete_1 = keysToDelete; _i < keysToDelete_1.length; _i++) {
                                bucketKey = keysToDelete_1[_i];
                                this.state.buckets.delete(bucketKey);
                            }
                        }
                        else {
                            // Reset all buckets
                            this.state.buckets.clear();
                        }
                        return [4 /*yield*/, this.persistState()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DORateLimitStore.prototype.getBucketsInWindow = function (key, now, windowMs, bucketSizeMs) {
        var buckets = [];
        var windowStart = now - windowMs;
        for (var time = Math.floor(windowStart / bucketSizeMs) * bucketSizeMs; time <= now; time += bucketSizeMs) {
            var bucketKey = "".concat(key, ":").concat(time);
            var bucket = this.state.buckets.get(bucketKey);
            if (bucket) {
                buckets.push(bucket);
            }
        }
        return buckets;
    };
    DORateLimitStore.prototype.cleanup = function (now, maxWindow) {
        return __awaiter(this, void 0, void 0, function () {
            var cutoff, needsUpdate, _i, _a, _b, bucketKey, bucket;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        cutoff = now - maxWindow;
                        needsUpdate = false;
                        for (_i = 0, _a = this.state.buckets; _i < _a.length; _i++) {
                            _b = _a[_i], bucketKey = _b[0], bucket = _b[1];
                            if (bucket.timestamp < cutoff) {
                                this.state.buckets.delete(bucketKey);
                                needsUpdate = true;
                            }
                        }
                        if (!needsUpdate) return [3 /*break*/, 2];
                        this.state.lastCleanup = now;
                        return [4 /*yield*/, this.persistState()];
                    case 1:
                        _c.sent();
                        _c.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    DORateLimitStore.prototype.ensureInitialized = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stored;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.initialized) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.ctx.storage.get('state')];
                    case 1:
                        stored = _a.sent();
                        if (stored) {
                            this.state = {
                                buckets: new Map(stored.buckets),
                                lastCleanup: stored.lastCleanup
                            };
                        }
                        this.initialized = true;
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    DORateLimitStore.prototype.persistState = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ctx.storage.put('state', {
                            buckets: Array.from(this.state.buckets.entries()),
                            lastCleanup: this.state.lastCleanup
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return DORateLimitStore;
}(cloudflare_workers_1.DurableObject));
exports.DORateLimitStore = DORateLimitStore;
