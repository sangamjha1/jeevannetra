// Utility for request debouncing
export function useDebounce<T>(value: T, delay: number = 500) {
  const [debouncedValue, setDebouncedValue] = require("react").useState(value);

  require("react").useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Utility for request caching during a session
const requestCache = new Map<
  string,
  { data: any; timestamp: number; promise?: Promise<any> }
>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export async function cachedRequest<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: { cacheDuration?: number; skipCache?: boolean }
): Promise<T> {
  const now = Date.now();
  const cached = requestCache.get(key);

  // Return cached data if still valid
  if (cached && !options?.skipCache && now - cached.timestamp < (options?.cacheDuration || CACHE_DURATION)) {
    return cached.data as T;
  }

  // Return ongoing promise if already fetching
  if (cached?.promise && !options?.skipCache) {
    return cached.promise as Promise<T>;
  }

  // Fetch new data
  const promise = fetcher();
  requestCache.set(key, { data: null, timestamp: now, promise });

  try {
    const data = await promise;
    requestCache.set(key, { data, timestamp: now });
    return data;
  } catch (error) {
    requestCache.delete(key);
    throw error;
  }
}

export function clearRequestCache() {
  requestCache.clear();
}
