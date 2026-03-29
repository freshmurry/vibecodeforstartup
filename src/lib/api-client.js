/**
 * Unified API Client - Premium quality abstraction for all worker API calls
 * Provides type-safe methods for all endpoints with proper error handling
 * Features 401 response interception to trigger authentication modals
 */
import { RateLimitExceededError, SecurityError, SecurityErrorType, } from '@/api-types';
import { toast } from 'sonner';
/**
 * Global auth modal trigger for 401 interception
 */
let globalAuthModalTrigger = null;
export function setGlobalAuthModalTrigger(trigger) {
    globalAuthModalTrigger = trigger;
}
/**
 * API Client Error class with proper error context
 */
export class ApiError extends Error {
    status;
    statusText;
    endpoint;
    constructor(status, statusText, message, endpoint) {
        super(message);
        this.status = status;
        this.statusText = statusText;
        this.endpoint = endpoint;
        this.name = 'ApiError';
    }
}
class ApiClient {
    baseUrl;
    defaultHeaders;
    csrfTokenInfo = null;
    constructor(config = {}) {
        this.baseUrl = config.baseUrl || '';
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            ...config.defaultHeaders,
        };
    }
    /**
     * Get authentication headers for API requests
     */
    getAuthHeaders() {
        const headers = {};
        // Add session token for anonymous users if not authenticated
        // This will be handled automatically by cookies/credentials for authenticated users
        const sessionToken = localStorage.getItem('anonymous_session_token');
        if (sessionToken && !document.cookie.includes('session=')) {
            headers['X-Session-Token'] = sessionToken;
        }
        // Add CSRF token for state-changing requests
        if (this.csrfTokenInfo && !this.isCSRFTokenExpired()) {
            headers['X-CSRF-Token'] = this.csrfTokenInfo.token;
        }
        return headers;
    }
    /**
     * Fetch CSRF token from server with expiration handling
     */
    async fetchCsrfToken() {
        try {
            const response = await fetch(`${this.baseUrl}/api/auth/csrf-token`, {
                method: 'GET',
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                if (data.data?.token) {
                    const expiresIn = data.data.expiresIn || 7200; // Default 2 hours
                    this.csrfTokenInfo = {
                        token: data.data.token,
                        expiresAt: Date.now() + (expiresIn * 1000)
                    };
                    return true;
                }
            }
            return false;
        }
        catch (error) {
            console.warn('Failed to fetch CSRF token:', error);
            return false;
        }
    }
    /**
     * Check if CSRF token is expired
     */
    isCSRFTokenExpired() {
        if (!this.csrfTokenInfo)
            return true;
        return Date.now() >= this.csrfTokenInfo.expiresAt;
    }
    /**
     * Ensure CSRF token exists and is valid for state-changing requests
     */
    async ensureCsrfToken(method) {
        if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase())) {
            return true;
        }
        // Fetch new token if none exists or current one is expired
        if (!this.csrfTokenInfo || this.isCSRFTokenExpired()) {
            return await this.fetchCsrfToken();
        }
        return true;
    }
    /**
     * Ensure session token exists for anonymous users
     */
    ensureSessionToken() {
        if (!localStorage.getItem('anonymous_session_token') &&
            !document.cookie.includes('session=')) {
            localStorage.setItem('anonymous_session_token', crypto.randomUUID());
        }
    }
    /**
     * Get authentication context message based on endpoint
     */
    getAuthContextForEndpoint(endpoint) {
        if (endpoint.includes('/api/agent'))
            return 'to create applications';
        if (endpoint.includes('/favorite'))
            return 'to favorite this app';
        if (endpoint.includes('/star'))
            return 'to star this app';
        // if (endpoint.includes('/fork')) return 'to fork this app';
        // if (endpoint.includes('/apps')) return 'to access your apps';
        if (endpoint.includes('/profile'))
            return 'to access your profile';
        if (endpoint.includes('/settings'))
            return 'to access settings';
        return 'to continue';
    }
    /**
     * Check if endpoint should trigger auth modal on 401
     * Auth checking endpoints should not auto-trigger modals
     */
    shouldTriggerAuthModal(endpoint) {
        // Don't trigger modal for auth state checking endpoints
        if (endpoint === '/api/auth/profile')
            return false;
        if (endpoint === '/api/auth/providers')
            return false;
        if (endpoint === '/api/auth/sessions')
            return false;
        return true;
    }
    async request(endpoint, options = {}, noToast = false) {
        const { data } = await this.requestRaw(endpoint, options, false, noToast);
        if (!data) {
            throw new ApiError(500, 'Internal Error', 'Unexpected null response data', endpoint);
        }
        return data;
    }
    async requestRaw(endpoint, options = {}, isRetry = false, noToast = false) {
        this.ensureSessionToken();
        if (!await this.ensureCsrfToken(options.method || 'GET')) {
            throw new ApiError(500, 'Internal Error', 'Failed to obtain CSRF token', endpoint);
        }
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            method: options.method || 'GET',
            headers: {
                ...this.defaultHeaders,
                ...this.getAuthHeaders(),
                ...options.headers,
            },
            credentials: options.credentials || 'include',
        };
        if (options.body) {
            config.body =
                typeof options.body === 'string'
                    ? options.body
                    : JSON.stringify(options.body);
        }
        try {
            const response = await fetch(url, config);
            // For streaming responses, skip JSON parsing if response is ok
            if (options.skipJsonParsing && response.ok) {
                return { response, data: null };
            }
            const data = await response.json();
            if (!response.ok) {
                // Try parsing error data
                try {
                    if (response.status === 401 &&
                        globalAuthModalTrigger &&
                        this.shouldTriggerAuthModal(endpoint)) {
                        const authContext = this.getAuthContextForEndpoint(endpoint);
                        globalAuthModalTrigger(authContext);
                    }
                    const errorData = data.error;
                    if (errorData && errorData.type) {
                        // Send a toast notification for typed errors
                        if (!noToast) {
                            toast.error(errorData.message);
                        }
                        switch (errorData.type) {
                            case SecurityErrorType.CSRF_VIOLATION:
                                // Handle CSRF failures with retry
                                if (response.status === 403 && !isRetry) {
                                    // Clear expired token and retry with fresh one
                                    this.csrfTokenInfo = null;
                                    return this.requestRaw(endpoint, options, true);
                                }
                                break;
                            case SecurityErrorType.RATE_LIMITED:
                                // Handle rate limiting
                                throw RateLimitExceededError.fromRateLimitError(errorData.details);
                            default:
                                // Security error
                                throw new SecurityError(errorData.type, errorData.message);
                        }
                    }
                    throw new ApiError(response.status, response.statusText, data.error?.message || data.message || 'Request failed', endpoint);
                }
                catch {
                    throw new ApiError(response.status, response.statusText, 'Request failed', endpoint);
                }
            }
            return { response, data };
        }
        catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(0, 'Network Error', error instanceof Error ? error.message : 'Unknown error', endpoint);
        }
    }
    // ===============================
    // Apps API Methods
    // ===============================
    /**
     * Get all apps for the current user
     */
    async getUserApps() {
        return this.request('/api/apps');
    }
    /**
     * Get recent apps (last 10)
     */
    async getRecentApps() {
        return this.request('/api/apps/recent');
    }
    /**
     * Get favorite apps
     */
    async getFavoriteApps() {
        return this.request('/api/apps/favorites');
    }
    /**
     * Get public apps feed with pagination
     */
    async getPublicApps(params) {
        const queryParams = new URLSearchParams();
        if (params?.page)
            queryParams.set('page', params.page.toString());
        if (params?.limit)
            queryParams.set('limit', params.limit.toString());
        if (params?.sort)
            queryParams.set('sort', params.sort);
        if (params?.order)
            queryParams.set('order', params.order);
        if (params?.period)
            queryParams.set('period', params.period);
        if (params?.framework)
            queryParams.set('framework', params.framework);
        if (params?.search)
            queryParams.set('search', params.search);
        if (params?.boardId)
            queryParams.set('boardId', params.boardId);
        const endpoint = `/api/apps/public${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        return this.request(endpoint);
    }
    /**
     * Create a new app
     */
    async createApp(data) {
        return this.request('/api/apps', {
            method: 'POST',
            body: data,
        });
    }
    /**
     * Toggle favorite status of an app
     */
    async toggleFavorite(appId) {
        return this.request(`/api/apps/${appId}/favorite`, {
            method: 'POST',
        });
    }
    /**
     * Update app visibility
     */
    async updateAppVisibility(appId, visibility) {
        return this.request(`/api/apps/${appId}/visibility`, {
            method: 'PUT',
            body: { visibility },
        });
    }
    /**
     * Delete an app
     */
    async deleteApp(appId) {
        return this.request(`/api/apps/${appId}`, {
            method: 'DELETE',
        });
    }
    // ===============================
    // App View API Methods
    // ===============================
    /**
     * Get detailed app information for viewing
     */
    async getAppDetails(appId) {
        return this.request(`/api/apps/${appId}`);
    }
    /**
     * Toggle star status of an app (different from favorite)
     */
    async toggleAppStar(appId) {
        return this.request(`/api/apps/${appId}/star`, {
            method: 'POST',
        });
    }
    // /**
    //  * Fork an app
    //  */
    // DISABLED: Has been disabled for initial alpha release, for security reasons
    // async forkApp(appId: string): Promise<ApiResponse<ForkAppData>> {
    // 	return this.request<ForkAppData>(`/api/apps/${appId}/fork`, {
    // 		method: 'POST',
    // 	});
    // }
    // ===============================
    // User API Methods
    // ===============================
    /**
     * Get user apps with pagination
     */
    async getUserAppsWithPagination(params) {
        const queryParams = new URLSearchParams();
        if (params?.page)
            queryParams.set('page', params.page.toString());
        if (params?.limit)
            queryParams.set('limit', params.limit.toString());
        if (params?.sort)
            queryParams.set('sort', params.sort);
        if (params?.order)
            queryParams.set('order', params.order);
        if (params?.period)
            queryParams.set('period', params.period);
        if (params?.framework)
            queryParams.set('framework', params.framework);
        if (params?.search)
            queryParams.set('search', params.search);
        if (params?.visibility)
            queryParams.set('visibility', params.visibility);
        if (params?.status)
            queryParams.set('status', params.status);
        if (params?.teamId)
            queryParams.set('teamId', params.teamId);
        const endpoint = `/api/user/apps${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        return this.request(endpoint);
    }
    async createAgentSession(args) {
        const { response } = await this.requestRaw('/api/agent', {
            method: 'POST',
            body: args,
            skipJsonParsing: true, // Don't parse JSON for streaming response
        });
        return {
            success: true,
            stream: response
        };
    }
    /**
     * Update user profile
     */
    async updateProfile(data) {
        return this.request('/api/user/profile', {
            method: 'PUT',
            body: data,
        });
    }
    // ===============================
    // Stats API Methods
    // ===============================
    /**
     * Get user statistics
     */
    async getUserStats() {
        return this.request('/api/stats/user');
    }
    /**
     * Get user activity timeline
     */
    async getUserActivity() {
        return this.request('/api/stats/activity');
    }
    // ===============================
    // Analytics API Methods
    // ===============================
    /**
     * Get user analytics (AI Gateway costs and usage)
     */
    async getUserAnalytics(userId, days) {
        const queryParams = days ? `?days=${days}` : '';
        return this.request(`/api/user/${userId}/analytics${queryParams}`);
    }
    /**
     * Get agent analytics (AI Gateway costs and usage for specific app/chat)
     */
    async getAgentAnalytics(agentId, days) {
        const queryParams = days ? `?days=${days}` : '';
        return this.request(`/api/agent/${agentId}/analytics${queryParams}`);
    }
    // ===============================
    // Model Config API Methods
    // ===============================
    /**
     * Get all model configurations
     */
    async getModelConfigs() {
        return this.request('/api/model-configs');
    }
    /**
     * Get BYOK providers and available models
     */
    async getByokProviders() {
        return this.request('/api/model-configs/byok-providers');
    }
    /**
     * Get BYOK templates for dynamic provider configuration
     */
    async getBYOKTemplates() {
        return this.request('/api/secrets/templates?category=byok');
    }
    /**
     * Reset model configuration to default
     */
    async resetModelConfig(agentAction) {
        return this.request(`/api/model-configs/${agentAction}`, {
            method: 'DELETE',
        });
    }
    /**
     * Reset all model configurations to defaults
     */
    async resetAllModelConfigs() {
        return this.request('/api/model-configs/reset-all', {
            method: 'POST',
        });
    }
    /**
     * Get specific model configuration
     */
    async getModelConfig(actionKey) {
        return this.request(`/api/model-configs/${actionKey}`);
    }
    /**
     * Update model configuration
     */
    async updateModelConfig(actionKey, config) {
        return this.request(`/api/model-configs/${actionKey}`, {
            method: 'PUT',
            body: config,
        });
    }
    /**
     * Test model configuration
     */
    async testModelConfig(actionKey, tempConfig) {
        return this.request('/api/model-configs/test', {
            method: 'POST',
            body: {
                agentActionName: actionKey,
                useUserKeys: true,
                ...(tempConfig && { tempConfig }),
            },
        });
    }
    /**
     * Reset all model configurations
     */
    async resetAllConfigs() {
        return this.request('/api/model-configs/reset-all', {
            method: 'POST',
        });
    }
    /**
     * Get default model configurations
     */
    async getModelDefaults() {
        return this.request('/api/model-configs/defaults');
    }
    /**
     * Delete model configuration
     */
    async deleteModelConfig(actionKey) {
        return this.request(`/api/model-configs/${actionKey}`, {
            method: 'DELETE',
        });
    }
    // ===============================
    // Model Providers API Methods
    // ===============================
    /**
     * Get all custom model providers
     */
    async getModelProviders() {
        return this.request('/api/user/providers');
    }
    /**
     * Create a new custom model provider
     */
    async createModelProvider(data) {
        return this.request('/api/user/providers', {
            method: 'POST',
            body: data,
        });
    }
    /**
     * Update an existing model provider
     */
    async updateModelProvider(providerId, data) {
        return this.request(`/api/user/providers/${providerId}`, {
            method: 'PUT',
            body: data,
        });
    }
    /**
     * Delete a model provider
     */
    async deleteModelProvider(providerId) {
        return this.request(`/api/user/providers/${providerId}`, {
            method: 'DELETE',
        });
    }
    /**
     * Test a model provider connection
     */
    async testModelProvider(data) {
        return this.request('/api/user/providers/test', {
            method: 'POST',
            body: data,
        });
    }
    // ===============================
    // Secrets API Methods
    // ===============================
    /**
     * Get all user secrets including inactive ones
     */
    async getAllSecrets() {
        return this.request('/api/secrets');
    }
    /**
     * Store a new secret
     */
    async storeSecret(data) {
        return this.request('/api/secrets', {
            method: 'POST',
            body: data,
        });
    }
    /**
     * Delete a secret
     */
    async deleteSecret(secretId) {
        return this.request(`/api/secrets/${secretId}`, {
            method: 'DELETE',
        });
    }
    /**
     * Toggle secret active status
     */
    async toggleSecret(secretId) {
        return this.request(`/api/secrets/${secretId}/toggle`, {
            method: 'PATCH',
        });
    }
    /**
     * Get secret templates
     */
    async getSecretTemplates() {
        return this.request('/api/secrets/templates');
    }
    /**
     * Initiate GitHub OAuth authorization for user repository access
     * This redirects to GitHub OAuth
     */
    initiateGitHubOAuth() {
        const oauthUrl = new URL('/api/github-app/authorize', window.location.origin);
        window.location.href = oauthUrl.toString();
    }
    /**
     * Initiate GitHub export with OAuth flow
     * Returns authorization URL for redirect
     */
    async initiateGitHubExport(data) {
        return this.request('/api/github-app/export', {
            method: 'POST',
            body: data,
        });
    }
    // ===============================
    // Agent/CodeGen API Methods
    // ===============================
    /**
     * Connect to existing agent
     */
    async connectToAgent(agentId) {
        return this.request(`/api/agent/${agentId}/connect`);
    }
    /**
     * Deploy preview
     */
    async deployPreview(agentId) {
        return this.request(`/api/agent/${agentId}/preview`);
    }
    // ===============================
    // Session Management API Methods
    // ===============================
    /**
     * Get active user sessions
     */
    async getActiveSessions() {
        return this.request('/api/auth/sessions');
    }
    /**
     * Revoke a specific session
     */
    async revokeSession(sessionId) {
        return this.request(`/api/auth/sessions/${sessionId}`, {
            method: 'DELETE',
        });
    }
    // ===============================
    // API Keys Management Methods
    // ===============================
    /**
     * Get user API keys
     */
    async getApiKeys() {
        return this.request('/api/auth/api-keys');
    }
    /**
     * Create a new API key
     */
    async createApiKey(data) {
        return this.request('/api/auth/api-keys', {
            method: 'POST',
            body: data,
        });
    }
    /**
     * Revoke an API key
     */
    async revokeApiKey(keyId) {
        return this.request(`/api/auth/api-keys/${keyId}`, {
            method: 'DELETE',
        });
    }
    // ===============================
    // Authentication API Methods
    // ===============================
    /**
     * Login with email and password
     */
    async loginWithEmail(credentials) {
        return this.request('/api/auth/login', {
            method: 'POST',
            body: credentials,
        });
    }
    /**
     * Register a new user
     */
    async register(data) {
        return this.request('/api/auth/register', {
            method: 'POST',
            body: data,
        });
    }
    /**
     * Verify email with OTP
     */
    async verifyEmail(data) {
        return this.request('/api/auth/verify-email', {
            method: 'POST',
            body: data,
        });
    }
    /**
     * Resend verification OTP
     */
    async resendVerificationOtp(email) {
        return this.request('/api/auth/resend-verification', {
            method: 'POST',
            body: { email },
        });
    }
    /**
     * Get CSRF token
     */
    async getCsrfToken() {
        return this.request('/api/auth/csrf-token');
    }
    /**
     * Get current user profile
     */
    async getProfile(noToast = false) {
        return this.request('/api/auth/profile', undefined, noToast);
    }
    /**
     * Logout current user
     */
    async logout() {
        return this.request('/api/auth/logout', {
            method: 'POST',
        });
    }
    /**
     * Get available authentication providers
     */
    async getAuthProviders() {
        return this.request('/api/auth/providers');
    }
    /**
     * Initiate OAuth flow (redirects to provider)
     */
    initiateOAuth(provider, redirectUrl) {
        const oauthUrl = new URL(`/api/auth/oauth/${provider}`, window.location.origin);
        if (redirectUrl) {
            oauthUrl.searchParams.set('redirect_url', redirectUrl);
        }
        // Redirect to OAuth provider
        window.location.href = oauthUrl.toString();
    }
}
// Export singleton instance
export const apiClient = new ApiClient();
// Export class for testing/custom instances
export { ApiClient };
