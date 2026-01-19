import { useState, useEffect, useCallback } from 'react';
import { getApiUrl } from '../config/api';

// Cache layer đơn giản
const cache = new Map();
const CACHE_TIME = 5 * 60 * 1000; // 5 phút

/**
 * Custom hook để fetch API với caching
 * @param {string} endpoint - API endpoint
 * @param {object} options - Tùy chọn
 * @returns {object} { data, loading, error, refetch }
 */
export function useAPI(endpoint, options = {}) {
  const { 
    dependencies = [], 
    skipCache = false,
    transform = (data) => data,
    autoFetch = true
  } = options;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    const cacheKey = endpoint;
    const now = Date.now();
    
    // Check cache
    if (!skipCache && !forceRefresh && cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (now - cached.timestamp < CACHE_TIME) {
        setData(transform(cached.data));
        setLoading(false);
        return cached.data;
      }
    }

    setLoading(true);
    try {
      const cacheBuster = forceRefresh ? `${endpoint.includes('?') ? '&' : '?'}_t=${now}` : '';
      const res = await fetch(getApiUrl(endpoint + cacheBuster));
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const json = await res.json();
      const transformed = transform(json);
      
      // Cache response
      if (!skipCache) {
        cache.set(cacheKey, { data: json, timestamp: now });
      }
      
      setData(transformed);
      setError(null);
      return json;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [endpoint, skipCache, transform]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook đặc biệt cho batch requests (gọi nhiều API cùng lúc)
 * @param {array} endpoints - Mảng các endpoint cần fetch
 * @param {object} options - Tùy chọn
 * @returns {object} { data, loading, errors, refetch }
 */
export function useBatchAPI(endpoints, options = {}) {
  const { autoFetch = true, dependencies = [] } = options;
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(autoFetch);
  const [errors, setErrors] = useState({});

  const fetchAll = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    const now = Date.now();
    
    try {
      // Check cache cho từng endpoint
      const promises = endpoints.map(async (endpoint) => {
        const cacheKey = endpoint;
        
        // Nếu không force refresh, check cache trước
        if (!forceRefresh && cache.has(cacheKey)) {
          const cached = cache.get(cacheKey);
          if (now - cached.timestamp < CACHE_TIME) {
            return { endpoint, data: cached.data, fromCache: true };
          }
        }
        
        // Nếu không có trong cache hoặc expired, fetch mới
        const cacheBuster = forceRefresh ? `${endpoint.includes('?') ? '&' : '?'}_t=${now}` : '';
        const res = await fetch(getApiUrl(`${endpoint}${cacheBuster}`));
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const json = await res.json();
        
        // Cache response
        cache.set(cacheKey, { data: json, timestamp: now });
        
        return { endpoint, data: json, fromCache: false };
      });

      const results = await Promise.allSettled(promises);

      const newData = {};
      const newErrors = {};
      
      results.forEach((result, index) => {
        const key = endpoints[index];
        if (result.status === 'fulfilled') {
          newData[key] = result.value.data;
        } else {
          newErrors[key] = result.reason;
        }
      });

      setData(newData);
      setErrors(newErrors);
    } catch (err) {
      console.error('Batch API Error:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(endpoints)]);

  useEffect(() => {
    if (autoFetch) {
      fetchAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAll, autoFetch, JSON.stringify(dependencies)]);

  return { data, loading, errors, refetch: fetchAll };
}

/**
 * Clear toàn bộ cache
 */
export function clearCache() {
  cache.clear();
}

/**
 * Clear cache cho một endpoint cụ thể
 */
export function clearCacheFor(endpoint) {
  cache.delete(endpoint);
}
