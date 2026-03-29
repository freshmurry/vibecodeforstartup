"use strict";
/**
 * GitHub Service - Provides secure API-based GitHub repository operations
 * Handles repository creation, file management, and commit synchronization
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
exports.GitHubService = void 0;
var rest_1 = require("@octokit/rest");
var logger_1 = require("../../logger");
var types_1 = require("./types");
var GitHubService = /** @class */ (function () {
    function GitHubService() {
    }
    GitHubService.createAuthorInfo = function (request, timestamp) {
        return __assign({ name: request.username || GitHubService.DEFAULT_BOT_NAME, email: request.email || GitHubService.DEFAULT_BOT_EMAIL }, (timestamp && { date: timestamp }));
    };
    GitHubService.createHeaders = function (token, includeContentType) {
        if (includeContentType === void 0) { includeContentType = false; }
        var headers = {
            Authorization: "token ".concat(token),
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'vibecodeforstartup/1.0',
        };
        if (includeContentType) {
            headers['Content-Type'] = 'application/json';
        }
        return headers;
    };
    GitHubService.createOctokit = function (token) {
        if (!(token === null || token === void 0 ? void 0 : token.trim())) {
            throw new types_1.GitHubServiceError('No GitHub token provided', 'NO_TOKEN');
        }
        return new rest_1.Octokit({ auth: token });
    };
    /**
     * Creates a new GitHub repository with optional auto-initialization
     */
    GitHubService.createUserRepository = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var autoInit, response, error, repository, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        autoInit = (_a = options.auto_init) !== null && _a !== void 0 ? _a : true;
                        GitHubService.logger.info('Creating GitHub repository', {
                            name: options.name,
                            private: options.private,
                            auto_init: autoInit,
                            description: options.description ? 'provided' : 'none'
                        });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, fetch('https://api.github.com/user/repos', {
                                method: 'POST',
                                headers: GitHubService.createHeaders(options.token, true),
                                body: JSON.stringify({
                                    name: options.name,
                                    description: options.description,
                                    private: options.private,
                                    auto_init: autoInit,
                                }),
                            })];
                    case 2:
                        response = _b.sent();
                        if (!!response.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.text()];
                    case 3:
                        error = _b.sent();
                        GitHubService.logger.error('Repository creation failed', {
                            status: response.status,
                            statusText: response.statusText,
                            error: error,
                            endpoint: 'https://api.github.com/user/repos'
                        });
                        if (response.status === 403) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'GitHub App lacks required permissions. Please ensure the app has Contents: Write and Metadata: Read permissions, then re-install it.'
                                }];
                        }
                        return [2 /*return*/, {
                                success: false,
                                error: "Failed to create repository: ".concat(error)
                            }];
                    case 4: return [4 /*yield*/, response.json()];
                    case 5:
                        repository = (_b.sent());
                        GitHubService.logger.info("Successfully created repository: ".concat(repository.html_url));
                        return [2 /*return*/, {
                                success: true,
                                repository: repository
                            }];
                    case 6:
                        error_1 = _b.sent();
                        GitHubService.logger.error('Failed to create user repository', error_1);
                        return [2 /*return*/, {
                                success: false,
                                error: error_1 instanceof Error ? error_1.message : 'Unknown error'
                            }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Pushes files to GitHub repository with intelligent commit strategy based on local and remote state
     */
    GitHubService.pushFilesToRepository = function (files, request, gitContext) {
        return __awaiter(this, void 0, void 0, function () {
            var octokit, repoInfo, owner, repo, repository, defaultBranch, remoteCommits, parentCommitSha, commitStrategy, finalCommitSha, error_2, errorMessage;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        GitHubService.logger.info('Initiating GitHub push operation', {
                            repositoryUrl: request.repositoryHtmlUrl,
                            fileCount: files.length,
                            localCommitCount: ((_a = gitContext === null || gitContext === void 0 ? void 0 : gitContext.localCommits) === null || _a === void 0 ? void 0 : _a.length) || 0,
                            hasUncommittedChanges: (gitContext === null || gitContext === void 0 ? void 0 : gitContext.hasUncommittedChanges) || false
                        });
                        octokit = GitHubService.createOctokit(request.token);
                        repoInfo = GitHubService.extractRepoInfo(request.cloneUrl || request.repositoryHtmlUrl);
                        if (!repoInfo) {
                            throw new types_1.GitHubServiceError('Invalid repository URL format', 'INVALID_REPO_URL');
                        }
                        owner = repoInfo.owner, repo = repoInfo.repo;
                        return [4 /*yield*/, octokit.rest.repos.get({ owner: owner, repo: repo })];
                    case 1:
                        repository = (_b.sent()).data;
                        defaultBranch = repository.default_branch || 'main';
                        return [4 /*yield*/, GitHubService.fetchRemoteCommits(octokit, owner, repo, defaultBranch)];
                    case 2:
                        remoteCommits = _b.sent();
                        parentCommitSha = remoteCommits.length > 0 ? remoteCommits[0].sha : '';
                        GitHubService.logger.info('Repository state analyzed', {
                            defaultBranch: defaultBranch,
                            remoteCommitCount: remoteCommits.length,
                            hasParentCommit: !!parentCommitSha,
                            repositoryEmpty: remoteCommits.length === 0
                        });
                        commitStrategy = GitHubService.planCommitStrategy(gitContext, remoteCommits, files);
                        GitHubService.logger.info('Commit strategy planned', {
                            strategy: commitStrategy.type,
                            commitsToCreate: commitStrategy.commits.length,
                            remoteCommitCount: remoteCommits.length
                        });
                        if (files.length === 0) {
                            GitHubService.logger.warn('No files to commit');
                            return [2 /*return*/, { success: true, commitSha: parentCommitSha }];
                        }
                        if (commitStrategy.commits.length === 0) {
                            GitHubService.logger.info('No commits needed - repository is already in sync');
                            return [2 /*return*/, { success: true, commitSha: parentCommitSha }];
                        }
                        return [4 /*yield*/, GitHubService.executeCommitStrategy(octokit, owner, repo, defaultBranch, commitStrategy, parentCommitSha, request)];
                    case 3:
                        finalCommitSha = _b.sent();
                        GitHubService.logger.info('GitHub push completed', {
                            repositoryUrl: request.repositoryHtmlUrl,
                            finalCommitSha: finalCommitSha,
                            strategy: commitStrategy.type,
                            commitsCreated: commitStrategy.commits.length
                        });
                        return [2 /*return*/, {
                                success: true,
                                commitSha: finalCommitSha
                            }];
                    case 4:
                        error_2 = _b.sent();
                        errorMessage = error_2 instanceof Error ? error_2.message : 'Unknown error';
                        GitHubService.logger.error('Failed to push files to GitHub', {
                            error: errorMessage,
                            repositoryUrl: request.repositoryHtmlUrl,
                            fileCount: files.length
                        });
                        return [2 /*return*/, {
                                success: false,
                                error: "GitHub push failed: ".concat(errorMessage),
                                details: {
                                    operation: 'intelligent_push',
                                    stderr: errorMessage
                                }
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fetches commit history from remote GitHub repository
     */
    GitHubService.fetchRemoteCommits = function (octokit, owner, repo, branch) {
        return __awaiter(this, void 0, void 0, function () {
            var commits, error_3, githubError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, octokit.rest.repos.listCommits({
                                owner: owner,
                                repo: repo,
                                sha: branch,
                                per_page: 100 // Get recent history
                            })];
                    case 1:
                        commits = (_a.sent()).data;
                        return [2 /*return*/, commits.map(function (commit) {
                                var _a;
                                return ({
                                    sha: commit.sha,
                                    message: commit.commit.message,
                                    date: ((_a = commit.commit.author) === null || _a === void 0 ? void 0 : _a.date) || new Date().toISOString()
                                });
                            })];
                    case 2:
                        error_3 = _a.sent();
                        githubError = error_3;
                        if (githubError.status === 409 || githubError.status === 404) {
                            // Empty repository or branch doesn't exist
                            GitHubService.logger.info('Remote repository is empty or branch does not exist');
                            return [2 /*return*/, []];
                        }
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Determines optimal commit strategy based on local and remote repository state
     */
    GitHubService.planCommitStrategy = function (gitContext, remoteCommits, files) {
        var localCommits = (gitContext === null || gitContext === void 0 ? void 0 : gitContext.localCommits) || [];
        // Strategy 1: No local history - single commit
        if (localCommits.length === 0) {
            return {
                type: 'single_commit',
                commits: [{
                        message: 'Generated app',
                        timestamp: new Date().toISOString(),
                        files: files
                    }]
            };
        }
        // Strategy 2: Remote is empty - push all local commits
        if (remoteCommits.length === 0) {
            return {
                type: 'multi_commit',
                commits: localCommits.map(function (commit) { return ({
                    message: commit.message,
                    timestamp: commit.timestamp,
                    files: files // All files in final commit (simplified)
                }); })
            };
        }
        // Strategy 3: Both exist - find what's new and create incremental commits
        var newLocalCommits = localCommits.filter(function (local) {
            return !remoteCommits.some(function (remote) { return remote.message === local.message; });
        });
        if (newLocalCommits.length > 0) {
            return {
                type: 'incremental',
                commits: newLocalCommits.map(function (commit) { return ({
                    message: commit.message,
                    timestamp: commit.timestamp,
                    files: files
                }); })
            };
        }
        // Strategy 4: Everything is in sync - only commit if there are uncommitted changes
        if (gitContext === null || gitContext === void 0 ? void 0 : gitContext.hasUncommittedChanges) {
            return {
                type: 'single_commit',
                commits: [{
                        message: 'Update generated app',
                        timestamp: new Date().toISOString(),
                        files: files
                    }]
            };
        }
        // Strategy 5: Everything is perfectly in sync - no commit needed
        return {
            type: 'single_commit',
            commits: []
        };
    };
    /**
     * Executes the planned commit strategy for the given repository
     */
    GitHubService.executeCommitStrategy = function (octokit, owner, repo, branch, strategy, initialParentSha, request) {
        return __awaiter(this, void 0, void 0, function () {
            var parentCommitSha, _i, _a, commitPlan, readmeCommit, treeEntries, tree, commit;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        parentCommitSha = initialParentSha;
                        _i = 0, _a = strategy.commits;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 8];
                        commitPlan = _a[_i];
                        if (!!parentCommitSha) return [3 /*break*/, 3];
                        // Empty repository - create README to bootstrap, then use normal flow
                        GitHubService.logger.info('Bootstrapping empty repository with README', {
                            owner: owner,
                            repo: repo,
                            branch: branch
                        });
                        return [4 /*yield*/, octokit.rest.repos.createOrUpdateFileContents({
                                owner: owner,
                                repo: repo,
                                path: 'README.md',
                                message: 'Initial commit',
                                content: Buffer.from(GitHubService.README_CONTENT, 'utf8').toString('base64'),
                                branch: branch,
                                author: GitHubService.createAuthorInfo(request),
                                committer: GitHubService.createAuthorInfo(request)
                            })];
                    case 2:
                        readmeCommit = (_b.sent()).data;
                        if (!readmeCommit.commit.sha) {
                            throw new types_1.GitHubServiceError('Failed to get commit SHA from README creation', 'COMMIT_SHA_MISSING');
                        }
                        parentCommitSha = readmeCommit.commit.sha;
                        GitHubService.logger.info('Repository bootstrapped successfully', {
                            owner: owner,
                            repo: repo,
                            bootstrapCommitSha: parentCommitSha
                        });
                        _b.label = 3;
                    case 3:
                        // Repository has commits (either existing or just bootstrapped) - use tree-based approach
                        GitHubService.logger.info('Creating tree-based commit', {
                            owner: owner,
                            repo: repo,
                            baseTreeSha: parentCommitSha,
                            fileCount: commitPlan.files.length
                        });
                        treeEntries = commitPlan.files.map(function (file) { return ({
                            path: file.filePath,
                            mode: '100644',
                            type: 'blob',
                            content: file.fileContents
                        }); });
                        return [4 /*yield*/, octokit.rest.git.createTree({
                                owner: owner,
                                repo: repo,
                                tree: treeEntries,
                                base_tree: parentCommitSha
                            })];
                    case 4:
                        tree = (_b.sent()).data;
                        return [4 /*yield*/, octokit.rest.git.createCommit({
                                owner: owner,
                                repo: repo,
                                message: commitPlan.message,
                                tree: tree.sha,
                                parents: [parentCommitSha],
                                author: GitHubService.createAuthorInfo(request, commitPlan.timestamp),
                                committer: GitHubService.createAuthorInfo(request, commitPlan.timestamp)
                            })];
                    case 5:
                        commit = (_b.sent()).data;
                        parentCommitSha = commit.sha;
                        // Update branch reference
                        return [4 /*yield*/, octokit.rest.git.updateRef({
                                owner: owner,
                                repo: repo,
                                ref: "heads/".concat(branch),
                                sha: parentCommitSha,
                                force: true
                            })];
                    case 6:
                        // Update branch reference
                        _b.sent();
                        _b.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 1];
                    case 8: return [2 /*return*/, parentCommitSha];
                }
            });
        });
    };
    /**
     * Extracts owner and repository name from GitHub URL
     */
    GitHubService.extractRepoInfo = function (url) {
        try {
            // Normalize SSH format to HTTPS
            var cleanUrl = url;
            if (url.startsWith('git@github.com:')) {
                cleanUrl = url.replace('git@github.com:', 'https://github.com/');
            }
            var urlObj = new URL(cleanUrl);
            var pathParts = urlObj.pathname.split('/').filter(function (part) { return part; });
            if (pathParts.length >= 2) {
                var owner = pathParts[0];
                var repo = pathParts[1].replace('.git', '');
                return { owner: owner, repo: repo };
            }
            return null;
        }
        catch (error) {
            GitHubService.logger.error('Failed to parse repository URL', { url: url, error: error });
            return null;
        }
    };
    GitHubService.logger = (0, logger_1.createLogger)('GitHubService');
    GitHubService.DEFAULT_BOT_NAME = 'vibecodeforstartup-bot';
    GitHubService.DEFAULT_BOT_EMAIL = 'noreply@vibecodeforstartup.com';
    GitHubService.README_CONTENT = '# Generated App\n\nGenerated with VibeCode for Startup';
    return GitHubService;
}());
exports.GitHubService = GitHubService;
