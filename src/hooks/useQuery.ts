// src/hooks/useQuery.ts
import { useState, useEffect, useCallback, useRef } from 'react';

interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetching: boolean;
}

interface UseQueryOptions<T> {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchInterval?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  select?: (data: any) => T;
}

export function useQuery<T = any>(
  queryKey: string | string[],
  queryFn: () => Promise<T>,
  options: UseQueryOptions<T> = {}
) {
  const {
    enabled = true,
    refetchOnWindowFocus = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
    refetchInterval,
    onSuccess,
    onError,
    select
  } = options;

  const [state, setState] = useState<QueryState<T>>({
    data: null,
    loading: false,
    error: null,
    refetching: false,
  });

  const cacheRef = useRef<Map<string, { data: any; timestamp: number }>>(new Map());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const key = Array.isArray(queryKey) ? queryKey.join(':') : queryKey;

  const getCachedData = useCallback(() => {
    const cached = cacheRef.current.get(key);
    if (cached && Date.now() - cached.timestamp < staleTime) {
      return cached.data;
    }
    return null;
  }, [key, staleTime]);

  const fetchData = useCallback(async (isRefetch = false) => {
    if (!enabled) return;

    // Annuler la requête précédente
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      loading: !isRefetch,
      refetching: isRefetch,
      error: null,
    }));

    try {
      const result = await queryFn();
      const finalData = select ? select(result) : result;

      // Mettre en cache
      cacheRef.current.set(key, {
        data: finalData,
        timestamp: Date.now(),
      });

      setState({
        data: finalData,
        loading: false,
        error: null,
        refetching: false,
      });

      onSuccess?.(finalData);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      setState(prev => ({
        ...prev,
        loading: false,
        refetching: false,
        error: errorMessage,
      }));

      onError?.(errorMessage);
    }
  }, [enabled, queryFn, select, onSuccess, onError, key]);

  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Effet principal
  useEffect(() => {
    if (!enabled) return;

    // Vérifier le cache
    const cachedData = getCachedData();
    if (cachedData) {
      setState({
        data: cachedData,
        loading: false,
        error: null,
        refetching: false,
      });
    } else {
      fetchData();
    }
  }, [enabled, fetchData, getCachedData]);

  // Refetch interval
  useEffect(() => {
    if (refetchInterval && enabled) {
      intervalRef.current = setInterval(() => {
        fetchData(true);
      }, refetchInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refetchInterval, enabled, fetchData]);

  // Window focus refetch
  useEffect(() => {
    if (!refetchOnWindowFocus || !enabled) return;

    const handleFocus = () => {
      const cachedData = getCachedData();
      if (!cachedData) {
        fetchData(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, enabled, fetchData, getCachedData]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    refetch,
    isStale: () => {
      const cached = cacheRef.current.get(key);
      return !cached || Date.now() - cached.timestamp > staleTime;
    },
  };
}