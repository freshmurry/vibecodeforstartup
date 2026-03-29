"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemSettings = exports.userModelProviders = exports.userModelConfigs = exports.userSecrets = exports.auditLogs = exports.verificationOtps = exports.emailVerificationTokens = exports.passwordResetTokens = exports.authAttempts = exports.oauthStates = exports.appViews = exports.appComments = exports.commentLikes = exports.appLikes = exports.stars = exports.favorites = exports.apps = exports.apiKeys = exports.sessions = exports.users = void 0;
var drizzle_orm_1 = require("drizzle-orm");
var sqlite_core_1 = require("drizzle-orm/sqlite-core");
// Schema enum arrays derived from config types  
var REASONING_EFFORT_VALUES = ['low', 'medium', 'high'];
var PROVIDER_OVERRIDE_VALUES = ['cloudflare', 'direct'];
// ========================================
// CORE USER AND IDENTITY MANAGEMENT
// ========================================
/**
 * Users table - Core user identity and profile information
 * Supports OAuth providers and user preferences
 */
exports.users = (0, sqlite_core_1.sqliteTable)('users', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    email: (0, sqlite_core_1.text)('email').notNull().unique(),
    username: (0, sqlite_core_1.text)('username').unique(), // Optional username for public identity
    displayName: (0, sqlite_core_1.text)('display_name').notNull(),
    avatarUrl: (0, sqlite_core_1.text)('avatar_url'),
    bio: (0, sqlite_core_1.text)('bio'),
    // OAuth and Authentication
    provider: (0, sqlite_core_1.text)('provider').notNull(), // 'github', 'google', 'email'
    providerId: (0, sqlite_core_1.text)('provider_id').notNull(),
    emailVerified: (0, sqlite_core_1.integer)('email_verified', { mode: 'boolean' }).default(false),
    passwordHash: (0, sqlite_core_1.text)('password_hash'), // Only for provider: 'email'
    // Security enhancements
    failedLoginAttempts: (0, sqlite_core_1.integer)('failed_login_attempts').default(0),
    lockedUntil: (0, sqlite_core_1.integer)('locked_until', { mode: 'timestamp' }),
    passwordChangedAt: (0, sqlite_core_1.integer)('password_changed_at', { mode: 'timestamp' }),
    // User Preferences and Settings
    preferences: (0, sqlite_core_1.text)('preferences', { mode: 'json' }).default('{}'),
    theme: (0, sqlite_core_1.text)('theme', { enum: ['light', 'dark', 'system'] }).default('system'),
    timezone: (0, sqlite_core_1.text)('timezone').default('UTC'),
    // Account Status
    isActive: (0, sqlite_core_1.integer)('is_active', { mode: 'boolean' }).default(true),
    isSuspended: (0, sqlite_core_1.integer)('is_suspended', { mode: 'boolean' }).default(false),
    // Metadata
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).default((0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).default((0, drizzle_orm_1.sql)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
    lastActiveAt: (0, sqlite_core_1.integer)('last_active_at', { mode: 'timestamp' }),
    // Soft delete
    deletedAt: (0, sqlite_core_1.integer)('deleted_at', { mode: 'timestamp' }),
}, function (table) { return ({
    emailIdx: (0, sqlite_core_1.index)('users_email_idx').on(table.email),
    providerIdx: (0, sqlite_core_1.uniqueIndex)('users_provider_unique_idx').on(table.provider, table.providerId),
    usernameIdx: (0, sqlite_core_1.index)('users_username_idx').on(table.username),
    failedLoginAttemptsIdx: (0, sqlite_core_1.index)('users_failed_login_attempts_idx').on(table.failedLoginAttempts),
    lockedUntilIdx: (0, sqlite_core_1.index)('users_locked_until_idx').on(table.lockedUntil),
    isActiveIdx: (0, sqlite_core_1.index)('users_is_active_idx').on(table.isActive),
    lastActiveAtIdx: (0, sqlite_core_1.index)('users_last_active_at_idx').on(table.lastActiveAt),
}); });
/**
 * Sessions table - JWT session management with refresh token support
 */
exports.sessions = (0, sqlite_core_1.sqliteTable)('sessions', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    userId: (0, sqlite_core_1.text)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    // Session Details
    deviceInfo: (0, sqlite_core_1.text)('device_info'),
    userAgent: (0, sqlite_core_1.text)('user_agent'),
    ipAddress: (0, sqlite_core_1.text)('ip_address'),
    // Security metadata
    isRevoked: (0, sqlite_core_1.integer)('is_revoked', { mode: 'boolean' }).default(false),
    revokedAt: (0, sqlite_core_1.integer)('revoked_at', { mode: 'timestamp' }),
    revokedReason: (0, sqlite_core_1.text)('revoked_reason'),
    // Token Management
    accessTokenHash: (0, sqlite_core_1.text)('access_token_hash').notNull(),
    refreshTokenHash: (0, sqlite_core_1.text)('refresh_token_hash').notNull(),
    // Timing
    expiresAt: (0, sqlite_core_1.integer)('expires_at', { mode: 'timestamp' }).notNull(),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).default((0, drizzle_orm_1.sql)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
    lastActivity: (0, sqlite_core_1.integer)('last_activity', { mode: 'timestamp' }),
}, function (table) { return ({
    userIdIdx: (0, sqlite_core_1.index)('sessions_user_id_idx').on(table.userId),
    expiresAtIdx: (0, sqlite_core_1.index)('sessions_expires_at_idx').on(table.expiresAt),
    accessTokenHashIdx: (0, sqlite_core_1.index)('sessions_access_token_hash_idx').on(table.accessTokenHash),
    refreshTokenHashIdx: (0, sqlite_core_1.index)('sessions_refresh_token_hash_idx').on(table.refreshTokenHash),
    lastActivityIdx: (0, sqlite_core_1.index)('sessions_last_activity_idx').on(table.lastActivity),
    isRevokedIdx: (0, sqlite_core_1.index)('sessions_is_revoked_idx').on(table.isRevoked),
}); });
/**
 * API Keys table - Manage user API keys for programmatic access
 */
exports.apiKeys = (0, sqlite_core_1.sqliteTable)('api_keys', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    userId: (0, sqlite_core_1.text)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    // Key Details
    name: (0, sqlite_core_1.text)('name').notNull(), // User-friendly name for the API key
    keyHash: (0, sqlite_core_1.text)('key_hash').notNull().unique(), // Hashed API key for security
    keyPreview: (0, sqlite_core_1.text)('key_preview').notNull(), // First few characters for display (e.g., "sk_prod_1234...")
    // Security and Access Control
    scopes: (0, sqlite_core_1.text)('scopes').notNull(), // JSON array of allowed scopes
    isActive: (0, sqlite_core_1.integer)('is_active', { mode: 'boolean' }).default(true),
    // Usage Tracking
    lastUsed: (0, sqlite_core_1.integer)('last_used', { mode: 'timestamp' }),
    requestCount: (0, sqlite_core_1.integer)('request_count').default(0), // Track usage
    // Timing
    expiresAt: (0, sqlite_core_1.integer)('expires_at', { mode: 'timestamp' }), // Optional expiration
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).default((0, drizzle_orm_1.sql)(templateObject_4 || (templateObject_4 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).default((0, drizzle_orm_1.sql)(templateObject_5 || (templateObject_5 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
}, function (table) { return ({
    userIdIdx: (0, sqlite_core_1.index)('api_keys_user_id_idx').on(table.userId),
    keyHashIdx: (0, sqlite_core_1.index)('api_keys_key_hash_idx').on(table.keyHash),
    isActiveIdx: (0, sqlite_core_1.index)('api_keys_is_active_idx').on(table.isActive),
    expiresAtIdx: (0, sqlite_core_1.index)('api_keys_expires_at_idx').on(table.expiresAt),
}); });
// ========================================
// CORE APP AND GENERATION SYSTEM
// ========================================
/**
 * Apps table - Generated applications with comprehensive metadata
 */
exports.apps = (0, sqlite_core_1.sqliteTable)('apps', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    // App Identity
    title: (0, sqlite_core_1.text)('title').notNull(),
    description: (0, sqlite_core_1.text)('description'),
    iconUrl: (0, sqlite_core_1.text)('icon_url'), // App icon URL
    // Original Generation Data
    originalPrompt: (0, sqlite_core_1.text)('original_prompt').notNull(), // The user's original request
    finalPrompt: (0, sqlite_core_1.text)('final_prompt'), // The processed/refined prompt used for generation
    // Generated Content  
    framework: (0, sqlite_core_1.text)('framework'), // 'react', 'vue', 'svelte', etc.
    // Ownership and Context
    userId: (0, sqlite_core_1.text)('user_id').references(function () { return exports.users.id; }, { onDelete: 'cascade' }), // Null for anonymous
    sessionToken: (0, sqlite_core_1.text)('session_token'), // For anonymous users
    // Visibility and Sharing
    visibility: (0, sqlite_core_1.text)('visibility', { enum: ['private', 'public'] }).notNull().default('private'),
    // Status and State
    status: (0, sqlite_core_1.text)('status', { enum: ['generating', 'completed'] }).notNull().default('generating'),
    // Deployment Information
    deploymentId: (0, sqlite_core_1.text)('deployment_id'), // Deployment ID (extracted from deployment URL)
    // GitHub Repository Integration
    githubRepositoryUrl: (0, sqlite_core_1.text)('github_repository_url'), // GitHub repository URL
    githubRepositoryVisibility: (0, sqlite_core_1.text)('github_repository_visibility', { enum: ['public', 'private'] }), // Repository visibility
    // App Metadata
    isArchived: (0, sqlite_core_1.integer)('is_archived', { mode: 'boolean' }).default(false),
    isFeatured: (0, sqlite_core_1.integer)('is_featured', { mode: 'boolean' }).default(false), // Featured by admins
    // Versioning (for future support)
    version: (0, sqlite_core_1.integer)('version').default(1),
    parentAppId: (0, sqlite_core_1.text)('parent_app_id'), // If forked from another app
    // Screenshot Information
    screenshotUrl: (0, sqlite_core_1.text)('screenshot_url'), // URL to saved screenshot image
    screenshotCapturedAt: (0, sqlite_core_1.integer)('screenshot_captured_at', { mode: 'timestamp' }), // When screenshot was last captured
    // Metadata
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).default((0, drizzle_orm_1.sql)(templateObject_6 || (templateObject_6 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).default((0, drizzle_orm_1.sql)(templateObject_7 || (templateObject_7 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
    lastDeployedAt: (0, sqlite_core_1.integer)('last_deployed_at', { mode: 'timestamp' }),
}, function (table) { return ({
    userIdx: (0, sqlite_core_1.index)('apps_user_idx').on(table.userId),
    statusIdx: (0, sqlite_core_1.index)('apps_status_idx').on(table.status),
    visibilityIdx: (0, sqlite_core_1.index)('apps_visibility_idx').on(table.visibility),
    sessionTokenIdx: (0, sqlite_core_1.index)('apps_session_token_idx').on(table.sessionToken),
    parentAppIdx: (0, sqlite_core_1.index)('apps_parent_app_idx').on(table.parentAppId),
    // Performance indexes for common queries
    searchIdx: (0, sqlite_core_1.index)('apps_search_idx').on(table.title, table.description),
    frameworkStatusIdx: (0, sqlite_core_1.index)('apps_framework_status_idx').on(table.framework, table.status),
    visibilityStatusIdx: (0, sqlite_core_1.index)('apps_visibility_status_idx').on(table.visibility, table.status),
    createdAtIdx: (0, sqlite_core_1.index)('apps_created_at_idx').on(table.createdAt),
    updatedAtIdx: (0, sqlite_core_1.index)('apps_updated_at_idx').on(table.updatedAt),
}); });
/**
 * Favorites table - Track user favorite apps
 */
exports.favorites = (0, sqlite_core_1.sqliteTable)('favorites', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    userId: (0, sqlite_core_1.text)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    appId: (0, sqlite_core_1.text)('app_id').notNull().references(function () { return exports.apps.id; }, { onDelete: 'cascade' }),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).default((0, drizzle_orm_1.sql)(templateObject_8 || (templateObject_8 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
}, function (table) { return ({
    userAppIdx: (0, sqlite_core_1.uniqueIndex)('favorites_user_app_idx').on(table.userId, table.appId),
    userIdx: (0, sqlite_core_1.index)('favorites_user_idx').on(table.userId),
    appIdx: (0, sqlite_core_1.index)('favorites_app_idx').on(table.appId),
}); });
/**
 * Stars table - Track app stars (like GitHub stars)
 */
exports.stars = (0, sqlite_core_1.sqliteTable)('stars', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    userId: (0, sqlite_core_1.text)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    appId: (0, sqlite_core_1.text)('app_id').notNull().references(function () { return exports.apps.id; }, { onDelete: 'cascade' }),
    starredAt: (0, sqlite_core_1.integer)('starred_at', { mode: 'timestamp' }).default((0, drizzle_orm_1.sql)(templateObject_9 || (templateObject_9 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
}, function (table) { return ({
    userAppIdx: (0, sqlite_core_1.uniqueIndex)('stars_user_app_idx').on(table.userId, table.appId),
    userIdx: (0, sqlite_core_1.index)('stars_user_idx').on(table.userId),
    appIdx: (0, sqlite_core_1.index)('stars_app_idx').on(table.appId),
}); });
// ========================================
// COMMUNITY INTERACTIONS
// ========================================
/**
 * AppLikes table - User likes/reactions on apps
 */
exports.appLikes = (0, sqlite_core_1.sqliteTable)('app_likes', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    appId: (0, sqlite_core_1.text)('app_id').notNull().references(function () { return exports.apps.id; }, { onDelete: 'cascade' }),
    userId: (0, sqlite_core_1.text)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    // Reaction Details
    reactionType: (0, sqlite_core_1.text)('reaction_type').notNull().default('like'), // 'like', 'love', 'helpful', etc.
    // Metadata
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).default((0, drizzle_orm_1.sql)(templateObject_10 || (templateObject_10 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
}, function (table) { return ({
    appUserIdx: (0, sqlite_core_1.uniqueIndex)('app_likes_app_user_idx').on(table.appId, table.userId),
    userIdx: (0, sqlite_core_1.index)('app_likes_user_idx').on(table.userId),
}); });
/**
 * CommentLikes table - User likes on comments
 */
exports.commentLikes = (0, sqlite_core_1.sqliteTable)('comment_likes', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    commentId: (0, sqlite_core_1.text)('comment_id').notNull().references(function () { return exports.appComments.id; }, { onDelete: 'cascade' }),
    userId: (0, sqlite_core_1.text)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    // Reaction Details
    reactionType: (0, sqlite_core_1.text)('reaction_type').notNull().default('like'), // 'like', 'love', 'helpful', etc.
    // Metadata
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).default((0, drizzle_orm_1.sql)(templateObject_11 || (templateObject_11 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
}, function (table) { return ({
    commentUserIdx: (0, sqlite_core_1.uniqueIndex)('comment_likes_comment_user_idx').on(table.commentId, table.userId),
    userIdx: (0, sqlite_core_1.index)('comment_likes_user_idx').on(table.userId),
    commentIdx: (0, sqlite_core_1.index)('comment_likes_comment_idx').on(table.commentId),
}); });
/**
 * AppComments table - Comments and discussions on apps
 */
exports.appComments = (0, sqlite_core_1.sqliteTable)('app_comments', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    appId: (0, sqlite_core_1.text)('app_id').notNull().references(function () { return exports.apps.id; }, { onDelete: 'cascade' }),
    userId: (0, sqlite_core_1.text)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    // Comment Content
    content: (0, sqlite_core_1.text)('content').notNull(),
    parentCommentId: (0, sqlite_core_1.text)('parent_comment_id'), // For threaded comments
    // Moderation
    isEdited: (0, sqlite_core_1.integer)('is_edited', { mode: 'boolean' }).default(false),
    isDeleted: (0, sqlite_core_1.integer)('is_deleted', { mode: 'boolean' }).default(false),
    // Removed likeCount and replyCount - use COUNT() queries with proper indexes instead
    // Metadata
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).default((0, drizzle_orm_1.sql)(templateObject_12 || (templateObject_12 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).default((0, drizzle_orm_1.sql)(templateObject_13 || (templateObject_13 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
}, function (table) { return ({
    appIdx: (0, sqlite_core_1.index)('app_comments_app_idx').on(table.appId),
    userIdx: (0, sqlite_core_1.index)('app_comments_user_idx').on(table.userId),
    parentIdx: (0, sqlite_core_1.index)('app_comments_parent_idx').on(table.parentCommentId),
}); });
// ========================================
// ANALYTICS AND TRACKING
// ========================================
/**
 * AppViews table - Track app views for analytics
 */
exports.appViews = (0, sqlite_core_1.sqliteTable)('app_views', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    appId: (0, sqlite_core_1.text)('app_id').notNull().references(function () { return exports.apps.id; }, { onDelete: 'cascade' }),
    // Viewer Information
    userId: (0, sqlite_core_1.text)('user_id').references(function () { return exports.users.id; }, { onDelete: 'cascade' }), // Null for anonymous
    sessionToken: (0, sqlite_core_1.text)('session_token'), // For anonymous tracking
    ipAddressHash: (0, sqlite_core_1.text)('ip_address_hash'), // Hashed IP for privacy
    // View Context
    referrer: (0, sqlite_core_1.text)('referrer'),
    userAgent: (0, sqlite_core_1.text)('user_agent'),
    deviceType: (0, sqlite_core_1.text)('device_type'), // 'desktop', 'mobile', 'tablet'
    // Timing
    viewedAt: (0, sqlite_core_1.integer)('viewed_at', { mode: 'timestamp' }).default((0, drizzle_orm_1.sql)(templateObject_14 || (templateObject_14 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
    durationSeconds: (0, sqlite_core_1.integer)('duration_seconds'), // How long they viewed
}, function (table) { return ({
    appIdx: (0, sqlite_core_1.index)('app_views_app_idx').on(table.appId),
    userIdx: (0, sqlite_core_1.index)('app_views_user_idx').on(table.userId),
    viewedAtIdx: (0, sqlite_core_1.index)('app_views_viewed_at_idx').on(table.viewedAt),
}); });
// ========================================
// OAUTH AND EXTERNAL INTEGRATIONS
// ========================================
/**
 * OAuthStates table - Manage OAuth flow states securely
 */
exports.oauthStates = (0, sqlite_core_1.sqliteTable)('oauth_states', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    state: (0, sqlite_core_1.text)('state').notNull().unique(), // OAuth state parameter
    provider: (0, sqlite_core_1.text)('provider').notNull(), // 'github', 'google', etc.
    // Flow Context
    redirectUri: (0, sqlite_core_1.text)('redirect_uri'),
    scopes: (0, sqlite_core_1.text)('scopes', { mode: 'json' }).default('[]'),
    userId: (0, sqlite_core_1.text)('user_id').references(function () { return exports.users.id; }), // If linking to existing account
    // Security
    codeVerifier: (0, sqlite_core_1.text)('code_verifier'), // For PKCE
    nonce: (0, sqlite_core_1.text)('nonce'),
    // Metadata
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).default((0, drizzle_orm_1.sql)(templateObject_15 || (templateObject_15 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
    expiresAt: (0, sqlite_core_1.integer)('expires_at', { mode: 'timestamp' }).notNull(),
    isUsed: (0, sqlite_core_1.integer)('is_used', { mode: 'boolean' }).default(false),
}, function (table) { return ({
    stateIdx: (0, sqlite_core_1.uniqueIndex)('oauth_states_state_idx').on(table.state),
    expiresAtIdx: (0, sqlite_core_1.index)('oauth_states_expires_at_idx').on(table.expiresAt),
}); });
// ========================================
// NORMALIZED RELATIONSHIPS
// ========================================
/**
 * Auth Attempts table - Security monitoring and rate limiting
 */
exports.authAttempts = (0, sqlite_core_1.sqliteTable)('auth_attempts', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    identifier: (0, sqlite_core_1.text)('identifier').notNull(),
    attemptType: (0, sqlite_core_1.text)('attempt_type', {
        enum: ['login', 'register', 'oauth_google', 'oauth_github', 'refresh', 'reset_password']
    }).notNull(),
    success: (0, sqlite_core_1.integer)('success', { mode: 'boolean' }).notNull(),
    ipAddress: (0, sqlite_core_1.text)('ip_address').notNull(),
    userAgent: (0, sqlite_core_1.text)('user_agent'),
    attemptedAt: (0, sqlite_core_1.integer)('attempted_at', { mode: 'timestamp' }).default((0, drizzle_orm_1.sql)(templateObject_16 || (templateObject_16 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
}, function (table) { return ({
    lookupIdx: (0, sqlite_core_1.index)('auth_attempts_lookup_idx').on(table.identifier, table.attemptedAt),
    ipIdx: (0, sqlite_core_1.index)('auth_attempts_ip_idx').on(table.ipAddress, table.attemptedAt),
    successIdx: (0, sqlite_core_1.index)('auth_attempts_success_idx').on(table.success, table.attemptedAt),
    attemptTypeIdx: (0, sqlite_core_1.index)('auth_attempts_type_idx').on(table.attemptType, table.attemptedAt),
}); });
/**
 * Password Reset Tokens table - Secure password reset functionality
 */
exports.passwordResetTokens = (0, sqlite_core_1.sqliteTable)('password_reset_tokens', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    userId: (0, sqlite_core_1.text)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    tokenHash: (0, sqlite_core_1.text)('token_hash').notNull().unique(),
    expiresAt: (0, sqlite_core_1.integer)('expires_at', { mode: 'timestamp' }).notNull(),
    used: (0, sqlite_core_1.integer)('used', { mode: 'boolean' }).default(false),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).default((0, drizzle_orm_1.sql)(templateObject_17 || (templateObject_17 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
}, function (table) { return ({
    lookupIdx: (0, sqlite_core_1.index)('password_reset_tokens_lookup_idx').on(table.tokenHash),
    expiryIdx: (0, sqlite_core_1.index)('password_reset_tokens_expiry_idx').on(table.expiresAt),
}); });
/**
 * Email Verification Tokens table - Email verification functionality
 */
exports.emailVerificationTokens = (0, sqlite_core_1.sqliteTable)('email_verification_tokens', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    userId: (0, sqlite_core_1.text)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    tokenHash: (0, sqlite_core_1.text)('token_hash').notNull().unique(),
    email: (0, sqlite_core_1.text)('email').notNull(),
    expiresAt: (0, sqlite_core_1.integer)('expires_at', { mode: 'timestamp' }).notNull(),
    used: (0, sqlite_core_1.integer)('used', { mode: 'boolean' }).default(false),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).default((0, drizzle_orm_1.sql)(templateObject_18 || (templateObject_18 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
}, function (table) { return ({
    lookupIdx: (0, sqlite_core_1.index)('email_verification_tokens_lookup_idx').on(table.tokenHash),
    expiryIdx: (0, sqlite_core_1.index)('email_verification_tokens_expiry_idx').on(table.expiresAt),
}); });
/**
 * Verification OTPs table - Store OTP codes for email verification
 */
exports.verificationOtps = (0, sqlite_core_1.sqliteTable)('verification_otps', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    email: (0, sqlite_core_1.text)('email').notNull(),
    otp: (0, sqlite_core_1.text)('otp').notNull(), // Hashed OTP code
    expiresAt: (0, sqlite_core_1.integer)('expires_at', { mode: 'timestamp' }).notNull(),
    used: (0, sqlite_core_1.integer)('used', { mode: 'boolean' }).default(false),
    usedAt: (0, sqlite_core_1.integer)('used_at', { mode: 'timestamp' }),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).default((0, drizzle_orm_1.sql)(templateObject_19 || (templateObject_19 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
}, function (table) { return ({
    emailIdx: (0, sqlite_core_1.index)('verification_otps_email_idx').on(table.email),
    expiresAtIdx: (0, sqlite_core_1.index)('verification_otps_expires_at_idx').on(table.expiresAt),
    usedIdx: (0, sqlite_core_1.index)('verification_otps_used_idx').on(table.used),
}); });
/**
 * AuditLogs table - Track important changes for compliance
 */
exports.auditLogs = (0, sqlite_core_1.sqliteTable)('audit_logs', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    userId: (0, sqlite_core_1.text)('user_id').references(function () { return exports.users.id; }, { onDelete: 'set null' }),
    entityType: (0, sqlite_core_1.text)('entity_type').notNull(),
    entityId: (0, sqlite_core_1.text)('entity_id').notNull(),
    action: (0, sqlite_core_1.text)('action').notNull(),
    oldValues: (0, sqlite_core_1.text)('old_values', { mode: 'json' }),
    newValues: (0, sqlite_core_1.text)('new_values', { mode: 'json' }),
    ipAddress: (0, sqlite_core_1.text)('ip_address'),
    userAgent: (0, sqlite_core_1.text)('user_agent'),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).default((0, drizzle_orm_1.sql)(templateObject_20 || (templateObject_20 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
}, function (table) { return ({
    userIdx: (0, sqlite_core_1.index)('audit_logs_user_idx').on(table.userId),
    entityIdx: (0, sqlite_core_1.index)('audit_logs_entity_idx').on(table.entityType, table.entityId),
    createdAtIdx: (0, sqlite_core_1.index)('audit_logs_created_at_idx').on(table.createdAt),
}); });
// ========================================
// USER SECRETS AND API KEYS
// ========================================
/**
 * User Secrets table - Stores encrypted API keys and secrets for code generation
 * Used by code generator to access external services (Stripe, OpenAI, etc.)
 */
exports.userSecrets = (0, sqlite_core_1.sqliteTable)('user_secrets', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    userId: (0, sqlite_core_1.text)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    // Secret identification
    name: (0, sqlite_core_1.text)('name').notNull(), // User-friendly name (e.g., "My Stripe API Key")
    provider: (0, sqlite_core_1.text)('provider').notNull(), // Service provider (stripe, openai, etc.)
    secretType: (0, sqlite_core_1.text)('secret_type').notNull(), // api_key, account_id, secret_key, token, etc.
    // Encrypted secret data
    encryptedValue: (0, sqlite_core_1.text)('encrypted_value').notNull(), // AES-256 encrypted secret
    keyPreview: (0, sqlite_core_1.text)('key_preview').notNull(), // First/last few chars for identification
    // Configuration and metadata
    description: (0, sqlite_core_1.text)('description'), // Optional user description
    expiresAt: (0, sqlite_core_1.integer)('expires_at', { mode: 'timestamp' }), // Optional expiration
    // Usage tracking
    lastUsed: (0, sqlite_core_1.integer)('last_used', { mode: 'timestamp' }),
    usageCount: (0, sqlite_core_1.integer)('usage_count').default(0),
    // Status and security
    isActive: (0, sqlite_core_1.integer)('is_active', { mode: 'boolean' }).default(true),
    // Metadata
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).default((0, drizzle_orm_1.sql)(templateObject_21 || (templateObject_21 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).default((0, drizzle_orm_1.sql)(templateObject_22 || (templateObject_22 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
}, function (table) { return ({
    userIdx: (0, sqlite_core_1.index)('user_secrets_user_idx').on(table.userId),
    providerIdx: (0, sqlite_core_1.index)('user_secrets_provider_idx').on(table.provider),
    userProviderIdx: (0, sqlite_core_1.index)('user_secrets_user_provider_idx').on(table.userId, table.provider, table.secretType),
    activeIdx: (0, sqlite_core_1.index)('user_secrets_active_idx').on(table.isActive),
}); });
// ========================================
// USER MODEL CONFIGURATIONS
// ========================================
/**
 * User Model Configurations table - User-specific AI model settings that override defaults
 */
exports.userModelConfigs = (0, sqlite_core_1.sqliteTable)('user_model_configs', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    userId: (0, sqlite_core_1.text)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    // Configuration Details
    agentActionName: (0, sqlite_core_1.text)('agent_action_name').notNull(), // Maps to AgentActionKey from config.ts
    modelName: (0, sqlite_core_1.text)('model_name'), // Override for AIModels - null means use default
    maxTokens: (0, sqlite_core_1.integer)('max_tokens'), // Override max tokens - null means use default
    temperature: (0, sqlite_core_1.real)('temperature'), // Override temperature - null means use default
    reasoningEffort: (0, sqlite_core_1.text)('reasoning_effort', { enum: REASONING_EFFORT_VALUES }), // Override reasoning effort  
    providerOverride: (0, sqlite_core_1.text)('provider_override', { enum: PROVIDER_OVERRIDE_VALUES }), // Override provider
    fallbackModel: (0, sqlite_core_1.text)('fallback_model'), // Override fallback model
    // Status and Metadata
    isActive: (0, sqlite_core_1.integer)('is_active', { mode: 'boolean' }).default(true),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).default((0, drizzle_orm_1.sql)(templateObject_23 || (templateObject_23 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).default((0, drizzle_orm_1.sql)(templateObject_24 || (templateObject_24 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
}, function (table) { return ({
    userAgentIdx: (0, sqlite_core_1.uniqueIndex)('user_model_configs_user_agent_idx').on(table.userId, table.agentActionName),
    userIdx: (0, sqlite_core_1.index)('user_model_configs_user_idx').on(table.userId),
    isActiveIdx: (0, sqlite_core_1.index)('user_model_configs_is_active_idx').on(table.isActive),
}); });
/**
 * User Model Providers table - Custom OpenAI-compatible providers
 */
exports.userModelProviders = (0, sqlite_core_1.sqliteTable)('user_model_providers', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    userId: (0, sqlite_core_1.text)('user_id').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    // Provider Details
    name: (0, sqlite_core_1.text)('name').notNull(), // User-friendly name (e.g., "My Local Ollama")
    baseUrl: (0, sqlite_core_1.text)('base_url').notNull(), // OpenAI-compatible API base URL
    secretId: (0, sqlite_core_1.text)('secret_id').references(function () { return exports.userSecrets.id; }), // API key stored in userSecrets
    // Status and Metadata
    isActive: (0, sqlite_core_1.integer)('is_active', { mode: 'boolean' }).default(true),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).default((0, drizzle_orm_1.sql)(templateObject_25 || (templateObject_25 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).default((0, drizzle_orm_1.sql)(templateObject_26 || (templateObject_26 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
}, function (table) { return ({
    userNameIdx: (0, sqlite_core_1.uniqueIndex)('user_model_providers_user_name_idx').on(table.userId, table.name),
    userIdx: (0, sqlite_core_1.index)('user_model_providers_user_idx').on(table.userId),
    isActiveIdx: (0, sqlite_core_1.index)('user_model_providers_is_active_idx').on(table.isActive),
}); });
// ========================================
// SYSTEM CONFIGURATION
// ========================================
/**
 * SystemSettings table - Global system configuration
 */
exports.systemSettings = (0, sqlite_core_1.sqliteTable)('system_settings', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    key: (0, sqlite_core_1.text)('key').notNull().unique(),
    value: (0, sqlite_core_1.text)('value', { mode: 'json' }),
    description: (0, sqlite_core_1.text)('description'),
    // Metadata
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).default((0, drizzle_orm_1.sql)(templateObject_27 || (templateObject_27 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
    updatedBy: (0, sqlite_core_1.text)('updated_by').references(function () { return exports.users.id; }),
}, function (table) { return ({
    keyIdx: (0, sqlite_core_1.uniqueIndex)('system_settings_key_idx').on(table.key),
}); });
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11, templateObject_12, templateObject_13, templateObject_14, templateObject_15, templateObject_16, templateObject_17, templateObject_18, templateObject_19, templateObject_20, templateObject_21, templateObject_22, templateObject_23, templateObject_24, templateObject_25, templateObject_26, templateObject_27;
