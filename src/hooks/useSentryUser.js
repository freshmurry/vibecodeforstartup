import { useEffect } from 'react';
import { setSentryUser, clearSentryUser } from '@/utils/sentry';
/**
 * Hook to automatically sync user context with Sentry
 * Use this in your app's root or authentication provider
 */
export function useSentryUser(user) {
    useEffect(() => {
        if (user) {
            setSentryUser({
                id: user.id,
                email: user.email,
                username: user.displayName,
            });
        }
        else {
            clearSentryUser();
        }
    }, [user]);
}
/**
 * Hook to track user actions as breadcrumbs
 */
export function useSentryBreadcrumb() {
    return (message, data) => {
        import('@/utils/sentry').then(({ addBreadcrumb }) => {
            addBreadcrumb(message, 'user-action', 'info', data);
        });
    };
}
