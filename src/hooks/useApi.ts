import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useApi = <T = any>(
  apiCall: () => Promise<any>,
  options: UseApiOptions = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { immediate = false, onSuccess, onError } = options;

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall();
      
      if (response.success) {
        setData(response.data);
        onSuccess?.(response.data);
      } else {
        const errorMessage = response.error || 'An error occurred';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiCall, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
};

export const useApiMutation = <T = any>(
  apiCall: (...args: any[]) => Promise<any>,
  options: UseApiOptions = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { onSuccess, onError } = options;

  const mutate = useCallback(async (...args: any[]) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall(...args);
      
      if (response.success) {
        setData(response.data);
        onSuccess?.(response.data);
        return response.data;
      } else {
        const errorMessage = response.error || 'An error occurred';
        setError(errorMessage);
        onError?.(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    mutate,
    reset
  };
};

// Specific API hooks
export const useSchemes = (params = {}) => {
  return useApi(
    () => apiService.getSchemes(params),
    { immediate: true }
  );
};

export const useScheme = (id: string) => {
  return useApi(
    () => apiService.getScheme(id),
    { immediate: !!id }
  );
};

export const useDashboardAnalytics = (dateRange = 30) => {
  return useApi(
    () => apiService.getDashboardAnalytics(dateRange),
    { immediate: true }
  );
};

export const useUsers = (params = {}) => {
  return useApi(
    () => apiService.getUsers(params),
    { immediate: true }
  );
};