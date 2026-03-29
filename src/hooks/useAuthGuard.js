/**
 * Authentication Guard Hooks
 * Provides easy authentication checks and login prompts for protected actions
 */
import React, { useCallback } from 'react';
import { useAuth } from '../contexts/auth-context';
import { useAuthModal } from '../components/auth/AuthModalProvider';
/**
 * Hook that provides authentication guard functionality
 */
export function useAuthGuard() {
    const { isAuthenticated, user } = useAuth();
    const { showAuthModal } = useAuthModal();
    const requireAuth = useCallback((options = {}) => {
        // If already authenticated, check if anonymous users are allowed
        if (isAuthenticated) {
            if (options.requireFullAuth && user?.isAnonymous) {
                showAuthModal(options.actionContext, options.onSuccess, options.intendedUrl);
                return false;
            }
            // User is authenticated and meets requirements, execute success callback immediately
            if (options.onSuccess) {
                options.onSuccess();
            }
            return true;
        }
        // Show login modal with context, pending action, and intended URL
        showAuthModal(options.actionContext, options.onSuccess, options.intendedUrl);
        return false;
    }, [isAuthenticated, user?.isAnonymous, showAuthModal]);
    return {
        isAuthenticated,
        user,
        requireAuth,
    };
}
/**
 * Hook for action-based authentication guards with configurable context
 */
export function useActionGuard() {
    const authGuard = useAuthGuard();
    /**
     * Create a guarded action with custom context message
     */
    const createGuardedAction = useCallback((actionContext, requireFullAuth = true) => {
        return (callback) => {
            return async () => {
                if (authGuard.requireAuth({
                    requireFullAuth,
                    actionContext
                })) {
                    await callback();
                }
            };
        };
    }, [authGuard]);
    /**
     * Execute an action with authentication guard
     */
    const executeWithAuth = useCallback(async (callback, options = {}) => {
        const { actionContext = '', requireFullAuth = true } = options;
        if (authGuard.requireAuth({ requireFullAuth, actionContext })) {
            await callback();
        }
    }, [authGuard]);
    return {
        ...authGuard,
        createGuardedAction,
        executeWithAuth,
    };
}
/**
 * Higher-order component wrapper for authentication guards
 */
export function withAuthGuard(Component, options = {}) {
    return function AuthGuardWrapper(props) {
        const { requireAuth } = useAuthGuard();
        // Check auth on mount
        const canRender = requireAuth(options);
        if (!canRender) {
            return null; // Modal will be shown by useAuthGuard
        }
        return React.createElement(Component, props);
    };
}
