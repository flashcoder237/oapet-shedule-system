// src/hooks/useApiStable.ts
import { useState, useCallback, useRef } from 'react';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useApi<T>(options?: UseApiOptions) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  // Utiliser des refs pour éviter les dépendances changeantes
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
      optionsRef.current?.onSuccess?.(data);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      optionsRef.current?.onError?.(errorMessage);
      throw error;
    }
  }, []); // Pas de dépendances changeantes

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}