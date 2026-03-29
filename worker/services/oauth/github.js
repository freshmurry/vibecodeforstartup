"use strict";
/**
 * GitHub OAuth Provider
 * Implements GitHub OAuth 2.0 authentication
 */
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
exports.GitHubOAuthProvider = void 0;
var base_1 = require("./base");
var logger_1 = require("../../logger");
var githubUtils_1 = require("../../utils/githubUtils");
var logger = (0, logger_1.createLogger)('GitHubOAuth');
/**
 * GitHub OAuth Provider implementation
 */
var GitHubOAuthProvider = /** @class */ (function (_super) {
    __extends(GitHubOAuthProvider, _super);
    function GitHubOAuthProvider() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.provider = 'github';
        _this.authorizationUrl = 'https://github.com/login/oauth/authorize';
        _this.tokenUrl = 'https://github.com/login/oauth/access_token';
        _this.userInfoUrl = 'https://api.github.com/user';
        _this.emailsUrl = 'https://api.github.com/user/emails';
        // Minimal scopes for authentication only - NO repo access
        _this.scopes = [
            'read:user',
            'user:email'
        ];
        return _this;
    }
    /**
     * Get user info from GitHub
     */
    GitHubOAuthProvider.prototype.getUserInfo = function (accessToken) {
        return __awaiter(this, void 0, void 0, function () {
            var userResponse, error, userData, email, emailsResponse, emails, primaryEmail, verifiedEmail, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, fetch(this.userInfoUrl, {
                                headers: (0, githubUtils_1.createGitHubHeaders)(accessToken)
                            })];
                    case 1:
                        userResponse = _a.sent();
                        if (!!userResponse.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, githubUtils_1.extractGitHubErrorText)(userResponse)];
                    case 2:
                        error = _a.sent();
                        logger.error('Failed to get user info', {
                            status: userResponse.status,
                            error: error.substring(0, 200) // Log only first 200 chars
                        });
                        throw new Error('Failed to retrieve user information from GitHub');
                    case 3: return [4 /*yield*/, userResponse.json()];
                    case 4:
                        userData = _a.sent();
                        email = userData.email;
                        if (!!email) return [3 /*break*/, 7];
                        return [4 /*yield*/, fetch(this.emailsUrl, {
                                headers: (0, githubUtils_1.createGitHubHeaders)(accessToken)
                            })];
                    case 5:
                        emailsResponse = _a.sent();
                        if (!emailsResponse.ok) return [3 /*break*/, 7];
                        return [4 /*yield*/, emailsResponse.json()];
                    case 6:
                        emails = _a.sent();
                        primaryEmail = emails.find(function (e) { return e.primary; });
                        if (primaryEmail) {
                            email = primaryEmail.email;
                        }
                        else if (emails.length > 0) {
                            verifiedEmail = emails.find(function (e) { return e.verified; });
                            email = (verifiedEmail === null || verifiedEmail === void 0 ? void 0 : verifiedEmail.email) || emails[0].email;
                        }
                        _a.label = 7;
                    case 7:
                        if (!email) {
                            throw new Error('Could not retrieve user email from GitHub');
                        }
                        return [2 /*return*/, {
                                id: String(userData.id),
                                email: email,
                                name: userData.name || userData.login,
                                picture: userData.avatar_url,
                                emailVerified: true // GitHub verifies emails
                            }];
                    case 8:
                        error_1 = _a.sent();
                        logger.error('Error getting user info', error_1);
                        throw error_1;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create GitHub OAuth provider instance
     */
    GitHubOAuthProvider.create = function (env, baseUrl) {
        if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
            throw new Error('GitHub OAuth credentials not configured');
        }
        var redirectUri = "".concat(baseUrl, "/api/auth/callback/github");
        return new GitHubOAuthProvider(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET, redirectUri);
    };
    return GitHubOAuthProvider;
}(base_1.BaseOAuthProvider));
exports.GitHubOAuthProvider = GitHubOAuthProvider;
