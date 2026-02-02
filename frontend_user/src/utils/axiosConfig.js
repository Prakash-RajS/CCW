// /src/utils/axiosConfig.js
import axios from 'axios';
 
const API_BASE = import.meta.env.VITE_API_BASE_URL;
 
// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;
 
// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
 
// ---------------- Request Interceptor ----------------
api.interceptors.request.use(
  (config) => {
    if (isDevelopment) {
      console.log(`🌐 ${config.method?.toUpperCase()} ${config.url}`);
    }
   
    // Add timestamp to prevent caching
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }
 
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);
 
// ---------------- Response Interceptor ----------------
api.interceptors.response.use(
  (response) => {
    if (isDevelopment) {
      console.log(`✅ ${response.status} ${response.config.url}`);
    }
   
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
   
    // Only log errors in development
    if (isDevelopment) {
      console.error(`❌ ${error.response?.status || 'Network'} Error:`, {
        url: originalRequest.url,
        status: error.response?.status,
      });
    }
 
    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
     
      if (isDevelopment) {
        console.log('🔑 Access token expired, attempting refresh...');
      }
     
      try {
        await api.post("/auth/refresh", {});
       
        if (isDevelopment) {
          console.log('✅ Token refreshed successfully');
        }
       
        return api(originalRequest);
       
      } catch (refreshError) {
        if (isDevelopment) {
          console.error('❌ Token refresh failed');
        }
       
        // Clear non-sensitive data
        localStorage.removeItem("rememberedUsername");
       
        // Redirect to login
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
       
        return Promise.reject(refreshError);
      }
    }
   
    return Promise.reject(error);
  }
);
 
// ---------------- Session Monitor ----------------
export const startSessionMonitor = () => {
  if (isDevelopment) {
    console.log('🔄 Starting session monitor...');
  }
 
  const monitorInterval = setInterval(async () => {
    try {
      const currentPath = window.location.pathname;
      if (currentPath === '/' || currentPath === '/login') {
        return;
      }
     
      await api.get("/auth/health");
     
    } catch (error) {
      if (error.response?.status === 401) {
        // Session expired
        localStorage.removeItem("rememberedUsername");
       
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
    }
  }, 2 * 60 * 1000);
 
  return monitorInterval;
};
 
// ---------------- Multi-tab Logout Sync ----------------
window.addEventListener("storage", (event) => {
  if (event.key === "rememberedUsername" && !event.newValue) {
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
  }
});
 
export default api;