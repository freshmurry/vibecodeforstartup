/**
 * GitHub Service - Provides secure API-based GitHub repository operations
 * Handles repository creation, file management, and commit synchronization
 */
import { CreateRepositoryOptions, CreateRepositoryResult } from './types';
import { GitHubPushRequest, GitHubPushResponse } from '../sandbox/sandboxTypes';
interface FileContent {
    filePath: string;
    fileContents: string;
}
interface LocalCommit {
    hash: string;
    message: string;
    timestamp: string;
}
interface GitContext {
    localCommits: LocalCommit[];
    hasUncommittedChanges: boolean;
}
export declare class GitHubService {
    private static readonly logger;
    private static readonly DEFAULT_BOT_NAME;
    private static readonly DEFAULT_BOT_EMAIL;
    private static readonly README_CONTENT;
    private static createAuthorInfo;
    private static createHeaders;
    private static createOctokit;
    /**
     * Creates a new GitHub repository with optional auto-initialization
     */
    static createUserRepository(options: CreateRepositoryOptions): Promise<CreateRepositoryResult>;
    /**
     * Pushes files to GitHub repository with intelligent commit strategy based on local and remote state
     */
    static pushFilesToRepository(files: FileContent[], request: GitHubPushRequest, gitContext?: GitContext): Promise<GitHubPushResponse>;
    /**
     * Fetches commit history from remote GitHub repository
     */
    private static fetchRemoteCommits;
    /**
     * Determines optimal commit strategy based on local and remote repository state
     */
    private static planCommitStrategy;
    /**
     * Executes the planned commit strategy for the given repository
     */
    private static executeCommitStrategy;
    /**
     * Extracts owner and repository name from GitHub URL
     */
    private static extractRepoInfo;
}
export {};
