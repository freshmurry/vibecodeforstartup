import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient, ApiError } from '@/lib/api-client';
import { appEvents } from '@/lib/app-events';
export function usePaginatedApps(options) {
    const hasInitialized = useRef(false);
    const currentPageRef = useRef(1);
    const [filterState, setFilterState] = useState({
        searchQuery: '',
        filterFramework: options.defaultFramework || 'all',
        filterVisibility: options.defaultVisibility || 'all',
        sortBy: options.defaultSort || 'recent',
        period: options.defaultPeriod || 'all'
    });
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [paginationState, setPaginationState] = useState({
        currentPage: 1,
        totalCount: 0,
        hasMore: false
    });
    const limit = options.limit || 20;
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearchQuery(filterState.searchQuery);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [filterState.searchQuery]);
    const fetchApps = useCallback(async (append = false, targetPage) => {
        try {
            if (!append) {
                setLoading(true);
                setError(null);
            }
            else {
                setLoadingMore(true);
            }
            const page = targetPage ?? (append ? currentPageRef.current + 1 : 1);
            const params = {
                page,
                limit,
                sort: filterState.sortBy,
                period: filterState.period,
                framework: filterState.filterFramework === 'all' ? undefined : filterState.filterFramework,
                search: debouncedSearchQuery || undefined,
                visibility: (options.includeVisibility && filterState.filterVisibility !== 'all') ? filterState.filterVisibility : undefined,
            };
            const cleanParams = Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined));
            const response = options.type === 'user'
                ? await apiClient.getUserAppsWithPagination(cleanParams)
                : await apiClient.getPublicApps(cleanParams);
            if (response.success && response.data) {
                const responseData = response.data;
                const newApps = responseData.apps;
                const newPagination = responseData.pagination;
                if (append) {
                    setApps(prev => [...prev, ...newApps]);
                }
                else {
                    setApps(newApps);
                }
                currentPageRef.current = page;
                setPaginationState({
                    currentPage: page,
                    totalCount: newPagination.total,
                    hasMore: newPagination.hasMore
                });
            }
            else {
                throw new Error(response.error?.message || 'Failed to fetch apps');
            }
        }
        catch (err) {
            console.error('Error fetching apps:', err);
            const errorMessage = err instanceof ApiError
                ? `${err.message} (${err.status})`
                : err instanceof Error
                    ? err.message
                    : 'Failed to fetch apps';
            setError(errorMessage);
        }
        finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [
        options.type,
        options.includeVisibility,
        limit,
        filterState.sortBy,
        filterState.period,
        filterState.filterFramework,
        filterState.filterVisibility,
        debouncedSearchQuery
    ]);
    const loadMore = useCallback(async () => {
        if (paginationState.hasMore && !loadingMore) {
            await fetchApps(true);
        }
    }, [paginationState.hasMore, loadingMore, fetchApps]);
    const refetch = useCallback(async () => {
        await fetchApps(false, 1);
    }, [fetchApps]);
    const removeApp = useCallback((appId) => {
        setApps(prev => prev.filter(app => app.id !== appId));
        setPaginationState(prev => ({
            ...prev,
            totalCount: Math.max(0, prev.totalCount - 1)
        }));
    }, []);
    const setSearchQuery = useCallback((query) => {
        setFilterState(prev => ({ ...prev, searchQuery: query }));
    }, []);
    const handleSearchSubmit = useCallback((e) => {
        e.preventDefault();
        // Force immediate search by setting debounced value and triggering fetch
        setDebouncedSearchQuery(filterState.searchQuery);
    }, [filterState.searchQuery]);
    const handleSortChange = useCallback((newSort) => {
        const sort = newSort;
        setFilterState(prev => ({ ...prev, sortBy: sort }));
    }, []);
    const handlePeriodChange = useCallback((newPeriod) => {
        setFilterState(prev => ({ ...prev, period: newPeriod }));
    }, []);
    const handleFrameworkChange = useCallback((framework) => {
        setFilterState(prev => ({ ...prev, filterFramework: framework }));
    }, []);
    const handleVisibilityChange = useCallback((visibility) => {
        setFilterState(prev => ({ ...prev, filterVisibility: visibility }));
    }, []);
    // Initial fetch on mount
    useEffect(() => {
        if (options.autoFetch !== false && !hasInitialized.current) {
            hasInitialized.current = true;
            fetchApps(false, 1);
        }
    }, [fetchApps, options.autoFetch]);
    // Trigger refetch when filters change (sort, period, framework, visibility)
    useEffect(() => {
        if (hasInitialized.current) {
            fetchApps(false, 1);
        }
    }, [
        filterState.sortBy,
        filterState.period,
        filterState.filterFramework,
        filterState.filterVisibility,
        fetchApps
    ]);
    // Trigger refetch when debounced search query changes
    useEffect(() => {
        if (hasInitialized.current) {
            fetchApps(false, 1);
        }
    }, [debouncedSearchQuery, fetchApps]);
    useEffect(() => {
        const unsubscribe = appEvents.on('app-deleted', (event) => {
            removeApp(event.appId);
        });
        return unsubscribe;
    }, [removeApp]);
    const pagination = {
        limit,
        offset: (paginationState.currentPage - 1) * limit,
        total: paginationState.totalCount,
        hasMore: paginationState.hasMore
    };
    return {
        searchQuery: filterState.searchQuery,
        filterFramework: filterState.filterFramework,
        filterVisibility: options.includeVisibility ? filterState.filterVisibility : 'all',
        sortBy: filterState.sortBy,
        period: filterState.period,
        apps,
        loading,
        loadingMore,
        error,
        pagination,
        hasMore: paginationState.hasMore,
        totalCount: paginationState.totalCount,
        setSearchQuery,
        handleSearchSubmit,
        handleSortChange,
        handlePeriodChange,
        handleFrameworkChange,
        handleVisibilityChange,
        refetch,
        loadMore,
        removeApp,
    };
}
