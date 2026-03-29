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
exports.calculateFileHash = calculateFileHash;
exports.getMimeType = getMimeType;
exports.validateConfig = validateConfig;
exports.createAssetManifest = createAssetManifest;
exports.mergeMigrations = mergeMigrations;
exports.extractDurableObjectClasses = extractDurableObjectClasses;
exports.buildWorkerBindings = buildWorkerBindings;
/**
 * Calculate SHA256 hash of content (first 32 chars)
 * This matches Cloudflare's expected hash format
 */
function calculateFileHash(content) {
    return __awaiter(this, void 0, void 0, function () {
        var hashBuffer, hashArray, hashHex;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, crypto.subtle.digest('SHA-256', content)];
                case 1:
                    hashBuffer = _a.sent();
                    hashArray = Array.from(new Uint8Array(hashBuffer));
                    hashHex = hashArray
                        .map(function (b) { return b.toString(16).padStart(2, '0'); })
                        .join('');
                    return [2 /*return*/, hashHex.substring(0, 32)];
            }
        });
    });
}
/**
 * Determine MIME type based on file extension
 * Critical for proper asset serving in browsers
 */
function getMimeType(filePath) {
    var _a;
    var ext = ((_a = filePath.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
    var mimeTypes = {
        // HTML
        html: 'text/html',
        htm: 'text/html',
        // Styles
        css: 'text/css',
        // JavaScript
        js: 'application/javascript',
        mjs: 'application/javascript',
        jsx: 'application/javascript',
        ts: 'application/typescript',
        tsx: 'application/typescript',
        // Data
        json: 'application/json',
        xml: 'application/xml',
        txt: 'text/plain',
        csv: 'text/csv',
        // Images
        svg: 'image/svg+xml',
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
        ico: 'image/x-icon',
        webp: 'image/webp',
        avif: 'image/avif',
        // Fonts
        woff: 'font/woff',
        woff2: 'font/woff2',
        ttf: 'font/ttf',
        otf: 'font/otf',
        eot: 'application/vnd.ms-fontobject',
        // Documents
        pdf: 'application/pdf',
        // Media
        webm: 'video/webm',
        mp4: 'video/mp4',
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
        ogg: 'audio/ogg',
    };
    return mimeTypes[ext] || 'application/octet-stream';
}
/**
 * Validate required configuration fields
 */
function validateConfig(config) {
    if (!config.name) {
        throw new Error('Worker name is required in configuration');
    }
    if (!config.compatibility_date) {
        throw new Error('Compatibility date is required in configuration');
    }
}
/**
 * Create an asset manifest from file data
 */
function createAssetManifest(files) {
    return __awaiter(this, void 0, void 0, function () {
        var manifest, _i, _a, _b, path, content, hash;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    manifest = {};
                    _i = 0, _a = files.entries();
                    _c.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    _b = _a[_i], path = _b[0], content = _b[1];
                    return [4 /*yield*/, calculateFileHash(content)];
                case 2:
                    hash = _c.sent();
                    manifest[path] = {
                        hash: hash,
                        size: content.byteLength,
                    };
                    _c.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, manifest];
            }
        });
    });
}
/**
 * Merge migration configurations
 */
function mergeMigrations(migrations) {
    var _a, _b;
    if (!migrations || migrations.length === 0) {
        return null;
    }
    var mergedMigration = {
        tag: migrations[migrations.length - 1].tag, // Use latest tag
        new_classes: [],
        new_sqlite_classes: [],
    };
    // Collect all classes from all migrations
    for (var _i = 0, migrations_1 = migrations; _i < migrations_1.length; _i++) {
        var migration = migrations_1[_i];
        if (migration.new_classes) {
            (_a = mergedMigration.new_classes).push.apply(_a, migration.new_classes);
        }
        if (migration.new_sqlite_classes) {
            (_b = mergedMigration.new_sqlite_classes).push.apply(_b, migration.new_sqlite_classes);
        }
    }
    // Remove empty arrays
    if (mergedMigration.new_classes.length === 0)
        delete mergedMigration.new_classes;
    if (mergedMigration.new_sqlite_classes.length === 0)
        delete mergedMigration.new_sqlite_classes;
    // Return null if no migrations to apply
    if (!mergedMigration.new_classes && !mergedMigration.new_sqlite_classes) {
        return null;
    }
    return mergedMigration;
}
/**
 * Extract Durable Object class names from merged migration
 */
function extractDurableObjectClasses(mergedMigration) {
    if (!mergedMigration)
        return [];
    return __spreadArray(__spreadArray([], (mergedMigration.new_classes || []), true), (mergedMigration.new_sqlite_classes || []), true);
}
/**
 * Build worker bindings from Wrangler configuration
 * DRY implementation to avoid code duplication
 */
function buildWorkerBindings(config, hasAssets) {
    var _a, _b;
    if (hasAssets === void 0) { hasAssets = false; }
    var bindings = [];
    // Add asset binding if assets are present
    if (hasAssets) {
        bindings.push({
            name: ((_a = config.assets) === null || _a === void 0 ? void 0 : _a.binding) || 'ASSETS',
            type: 'assets',
        });
    }
    // Add Durable Object bindings
    if ((_b = config.durable_objects) === null || _b === void 0 ? void 0 : _b.bindings) {
        for (var _i = 0, _c = config.durable_objects.bindings; _i < _c.length; _i++) {
            var binding = _c[_i];
            bindings.push({
                name: binding.name,
                type: 'durable_object_namespace',
                class_name: binding.class_name,
            });
        }
    }
    // Add KV namespace bindings
    if (config.kv_namespaces) {
        for (var _d = 0, _e = config.kv_namespaces; _d < _e.length; _d++) {
            var kv = _e[_d];
            bindings.push({
                name: kv.binding,
                type: 'kv_namespace',
                namespace_id: kv.id,
            });
        }
    }
    // Add D1 database bindings
    if (config.d1_databases) {
        for (var _f = 0, _g = config.d1_databases; _f < _g.length; _f++) {
            var d1 = _g[_f];
            bindings.push({
                name: d1.binding,
                type: 'd1',
                database_id: d1.database_id,
            });
        }
    }
    // Add R2 bucket bindings
    if (config.r2_buckets) {
        for (var _h = 0, _j = config.r2_buckets; _h < _j.length; _h++) {
            var r2 = _j[_h];
            bindings.push({
                name: r2.binding,
                type: 'r2_bucket',
                bucket_name: r2.bucket_name,
            });
        }
    }
    return bindings;
}
