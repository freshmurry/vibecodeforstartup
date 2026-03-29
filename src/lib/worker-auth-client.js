/**
 * Worker Authentication API Client
 * Handles communication with backend auth endpoints
 */
class WorkerAuthClient {
    baseUrl;
    constructor() {
        // Use current origin for API calls
        this.baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    }
    /**
     * Register a new user via worker endpoint
     */
    async register(data) {
        try {
            const response = await fetch(`${this.baseUrl}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || result.message || 'Registration failed');
            }
            return result;
        }
        catch (error) {
            console.error('Worker registration error:', error);
            throw error;
        }
    }
    /**
     * Login user via worker endpoint
     */
    async login(data) {
        try {
            const response = await fetch(`${this.baseUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || result.message || 'Login failed');
            }
            return result;
        }
        catch (error) {
            console.error('Worker login error:', error);
            throw error;
        }
    }
    /**
     * Logout user via worker endpoint
     */
    async logout() {
        try {
            const response = await fetch(`${this.baseUrl}/api/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            const result = await response.json();
            return result;
        }
        catch (error) {
            console.error('Worker logout error:', error);
            // Return success even if logout fails (clear local state)
            return { success: true };
        }
    }
    /**
     * Get current user session
     */
    async getCurrentUser() {
        try {
            const response = await fetch(`${this.baseUrl}/api/auth/profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            if (response.status === 401) {
                return null; // Not authenticated
            }
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Failed to get user session');
            }
            return result;
        }
        catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    }
    /**
     * Check if worker auth is available
     */
    async isWorkerAuthAvailable() {
        try {
            const response = await fetch(`${this.baseUrl}/api/auth/check`, {
                method: 'GET',
            });
            return response.ok;
        }
        catch {
            return false;
        }
    }
}
export const workerAuthClient = new WorkerAuthClient();
