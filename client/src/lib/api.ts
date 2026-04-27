import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
});

// Simple cache for GET requests (2 minute TTL)
const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

// Cacheable endpoints (profiles, settings, etc.)
const CACHEABLE_ENDPOINTS = ['/patients/profile', '/auth/profile', '/doctors/profile', '/hospitals/profile'];

// Request interceptor to add the JWT token to headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token expiration/refresh + caching
api.interceptors.response.use(
  (response) => {
    // Cache GET requests for specific endpoints
    if (response.config.method === 'get' && CACHEABLE_ENDPOINTS.some(ep => response.config.url?.includes(ep))) {
      const cacheKey = `${response.config.method}:${response.config.url}`;
      requestCache.set(cacheKey, { data: response.data, timestamp: Date.now() });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/refresh`, {
            refreshToken,
          });
          
          const { accessToken } = response.data;
          localStorage.setItem('token', accessToken);
          api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh token also failed, logout
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          requestCache.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Add cache check interceptor for GET requests
const originalGet = api.get;
api.get = function(url: string, config?: any) {
  const cacheKey = `get:${url}`;
  
  // Check if this endpoint is cacheable
  if (CACHEABLE_ENDPOINTS.some(ep => url.includes(ep))) {
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      // Return cached response
      return Promise.resolve({ data: cached.data, config, status: 200, statusText: 'OK (cached)' } as any);
    }
  }
  
  return originalGet.call(this, url, config);
};

export default api;
