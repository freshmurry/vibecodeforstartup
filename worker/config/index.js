"use strict";
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
exports.getGlobalConfigurableSettings = getGlobalConfigurableSettings;
exports.getUserConfigurableSettings = getUserConfigurableSettings;
var security_1 = require("./security");
var logger_1 = require("../logger");
var logger = (0, logger_1.createLogger)('GlobalConfigurableSettings');
var cachedConfig = null;
// Per-invocation cache to avoid multiple KV calls within single worker invocation
var invocationUserCache = new Map();
/**
 * Type guard to check if a value should be recursively merged
 */
function isPlainObject(value) {
    return (value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        Object.prototype.toString.call(value) === '[object Object]');
}
/**
 * Deep merge implementation with full type safety
 */
function deepMerge(target, source) {
    // Handle null/undefined source
    if (source === null || source === undefined) {
        return target;
    }
    // Handle non-object targets or sources
    if (!isPlainObject(target) || !isPlainObject(source)) {
        return (source !== undefined ? source : target);
    }
    // Safe type assertion after guard checks
    var targetObj = target;
    var sourceObj = source;
    var result = __assign({}, targetObj);
    // Merge properties
    Object.entries(sourceObj).forEach(function (_a) {
        var key = _a[0], sourceValue = _a[1];
        // Skip undefined - means "use default"
        if (sourceValue === undefined) {
            return;
        }
        var targetValue = targetObj[key];
        // Recursive merge for nested objects
        if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
            result[key] = deepMerge(targetValue, sourceValue);
        }
        else {
            // Direct assignment for primitives, arrays, null, or empty values
            result[key] = sourceValue;
        }
    });
    return result;
}
var CONFIG_KEY = 'platform_configs';
function getGlobalConfigurableSettings(env) {
    return __awaiter(this, void 0, void 0, function () {
        var defaultConfig, storedConfigJson, storedConfig, mergedConfig, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (cachedConfig) {
                        return [2 /*return*/, cachedConfig];
                    }
                    defaultConfig = {
                        security: (0, security_1.getConfigurableSecurityDefaults)()
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, env.VibecoderStore.get(CONFIG_KEY)];
                case 2:
                    storedConfigJson = _a.sent();
                    if (!storedConfigJson) {
                        // No stored config, use defaults
                        return [2 /*return*/, defaultConfig];
                    }
                    storedConfig = JSON.parse(storedConfigJson);
                    mergedConfig = deepMerge(defaultConfig, storedConfig);
                    logger.info('Loaded configuration with overrides from KV', { storedConfig: storedConfig, mergedConfig: mergedConfig });
                    cachedConfig = mergedConfig;
                    return [2 /*return*/, mergedConfig];
                case 3:
                    error_1 = _a.sent();
                    logger.error('Failed to load configuration from KV, using defaults', error_1);
                    // On error, fallback to default configuration
                    return [2 /*return*/, defaultConfig];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function getUserConfigurableSettings(env, userId, globalConfig) {
    return __awaiter(this, void 0, void 0, function () {
        var storedConfigJson, storedConfig, mergedConfig, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!userId) {
                        return [2 /*return*/, globalConfig];
                    }
                    if (invocationUserCache.has(userId)) {
                        logger.info("Using cached configuration for user ".concat(userId));
                        return [2 /*return*/, invocationUserCache.get(userId)];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, env.VibecoderStore.get("user_config:".concat(userId))];
                case 2:
                    storedConfigJson = _a.sent();
                    if (!storedConfigJson) {
                        // No stored config, use defaults
                        return [2 /*return*/, globalConfig];
                    }
                    storedConfig = JSON.parse(storedConfigJson);
                    mergedConfig = deepMerge(globalConfig, storedConfig);
                    logger.info("Loaded configuration with overrides from KV for user ".concat(userId), { globalConfig: globalConfig, storedConfig: storedConfig, mergedConfig: mergedConfig });
                    invocationUserCache.set(userId, mergedConfig);
                    return [2 /*return*/, mergedConfig];
                case 3:
                    error_2 = _a.sent();
                    logger.error("Failed to load configuration from KV for user ".concat(userId, ", using defaults"), error_2);
                    // On error, fallback to default configuration
                    return [2 /*return*/, globalConfig];
                case 4: return [2 /*return*/];
            }
        });
    });
}
