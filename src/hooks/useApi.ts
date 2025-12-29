import { useState, useEffect, useCallback } from 'react';

interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
}

/**
 * Custom hook for fetching data from API
 * @param fetcher - Function that returns a Promise
 * @param deps - Dependencies array for re-fetching
 */
export function useApi<T>(
    fetcher: () => Promise<T>,
    deps: unknown[] = []
): UseApiState<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

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
