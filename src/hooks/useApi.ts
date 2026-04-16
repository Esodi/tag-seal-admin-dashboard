import { useState, useEffect, useCallback } from 'react';

interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refetch: (options?: { force?: boolean }) => void;
}

interface UseApiOptions {
    cacheKey?: string;
    ttl?: number; // milliseconds
}

const apiCache = new Map<string, { data: any; timestamp: number }>();
const inFlightRequests = new Map<string, Promise<any>>();

/**
 * Custom hook for fetching data from API
 * @param fetcher - Function that returns a Promise
 * @param deps - Dependencies array for re-fetching
 * @param options - Optional configuration for caching
 */
export function useApi<T>(
    fetcher: () => Promise<T>,
    deps: unknown[] = [],
    options: UseApiOptions = {}
): UseApiState<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async (refetchOptions?: { force?: boolean }) => {
        const forceRefresh = refetchOptions?.force ?? false;

        // Check cache first
        if (options.cacheKey && !forceRefresh) {
            const cached = apiCache.get(options.cacheKey);
            const ttl = options.ttl || 5 * 60 * 1000; // Default 5 minutes

            if (cached && Date.now() - cached.timestamp < ttl) {
                setData(cached.data);
                setLoading(false);
                setError(null);
                return;
            }

            // Reuse in-flight request to avoid duplicate calls (e.g. React StrictMode in dev).
            const inFlight = inFlightRequests.get(options.cacheKey);
            if (inFlight) {
                try {
                    const result = await inFlight;
                    setData(result);
                    setError(null);
                } catch (err) {
                    setError(err instanceof Error ? err : new Error('An unknown error occurred'));
                } finally {
                    setLoading(false);
                }
                return;
            }
        }

        setLoading(true);
        setError(null);
        try {
            const requestPromise = fetcher();

            if (options.cacheKey) {
                inFlightRequests.set(options.cacheKey, requestPromise);
            }

            const result = await requestPromise;

            // Update cache
            if (options.cacheKey) {
                apiCache.set(options.cacheKey, {
                    data: result,
                    timestamp: Date.now()
                });
            }

            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        } finally {
            if (options.cacheKey) {
                inFlightRequests.delete(options.cacheKey);
            }
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps, options.cacheKey, options.ttl]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
}

/**
 * Custom hook for lazy loading data (fetch on demand)
 * @param fetcher - Function that returns a Promise
 */
export function useLazyApi<T>(): {
    data: T | null;
    loading: boolean;
    error: Error | null;
    execute: (fetcher: () => Promise<T>) => Promise<void>;
} {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const execute = useCallback(async (fetcher: () => Promise<T>) => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetcher();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, execute };
}

/**
 * Custom hook for combining multiple API calls
 * @param fetchers - Object of fetcher functions
 */
export function useMultipleApi<T extends Record<string, unknown>>(
    fetchers: { [K in keyof T]: () => Promise<T[K]> }
): {
    data: { [K in keyof T]: T[K] | null };
    loading: boolean;
    error: Error | null;
    refetch: () => void;
} {
    const [data, setData] = useState<{ [K in keyof T]: T[K] | null }>(
        Object.keys(fetchers).reduce((acc, key) => ({ ...acc, [key]: null }), {} as { [K in keyof T]: T[K] | null })
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const entries = Object.entries(fetchers) as [keyof T, () => Promise<T[keyof T]>][];
            const results = await Promise.all(
                entries.map(async ([key, fetcher]) => {
                    const result = await fetcher();
                    return [key, result] as const;
                })
            );
            const newData = results.reduce(
                (acc, [key, value]) => ({ ...acc, [key]: value }),
                {} as { [K in keyof T]: T[K] | null }
            );
            setData(newData);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return { data, loading, error, refetch: fetchAll };
}

export default useApi;
