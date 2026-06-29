

// /src/utils/axiosConfig.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const isDevelopment = import.meta.env.DEV;

// ✅ FIX: Public paths — /role-section is NOT public
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/signupac',
  '/signup-otp',
  '/forgot-password',
  '/auth-callback',
  '/reset-password',
  '/enter-otp',
  '/otp-request',
  '/reset-succes',
  '/post-project',
  '/complete-project',
  '/Findwork',
  '/contact',
];

const isPublicPath = (path) =>
  PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + '/'));

let isLoggingOut = false;
export const setLoggingOut = (value) => { 
  isLoggingOut = value; 
  // console.log(`🔄 Axios logout flag set to: ${value}`);
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise = null;

// ---------------- Request Interceptor ----------------
api.interceptors.request.use(
  (config) => {
    if (isDevelopment) {
      // console.log(`🌐 ${config.method?.toUpperCase()} ${config.url}`);
    }

    if (config.method === 'get' && !config.url.includes('/auth/')) {
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
      // console.log(`✅ ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    const skipRetryUrls = [
      '/auth/login',
      '/auth/signup',
      '/auth/logout',
      '/auth/refresh',
      '/auth/check-email',
      '/auth/check-phone',
      '/auth/session-handshake',
      '/verification/',
    ];

    if (skipRetryUrls.some((url) => originalRequest.url.includes(url))) {
      // console.log(`⏭ Skipping retry for: ${originalRequest.url}`);
      return Promise.reject(error);
    }

    if (isDevelopment) {
      console.error(`❌ ${error.response?.status || 'Network'} Error:`, {
        url: originalRequest.url,
        status: error.response?.status,
      });
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      
      if (isLoggingOut) {
        // console.log("⏭ Skipping refresh - logout in progress");
        return Promise.reject(error);
      }
      
      originalRequest._retry = true;

      const currentPath = window.location.pathname;
      if (isPublicPath(currentPath)) {
        // console.log(`🌐 On public path (${currentPath}) - not attempting refresh`);
        return Promise.reject(error);
      }

      if (isDevelopment) {
        // console.log('🔑 Access token expired, attempting refresh...');
      }

      try {
        if (!refreshPromise) {
          refreshPromise = api.post('/auth/refresh', {});
        }

        await refreshPromise;
        refreshPromise = null;

        if (isDevelopment) {
          // console.log('✅ Token refreshed successfully');
        }

        return api(originalRequest);

      } catch (refreshError) {
        refreshPromise = null;

        if (isDevelopment) {
          console.error('❌ Token refresh failed');
        }

        localStorage.removeItem('rememberedUsername');

        const pathAfterFail = window.location.pathname;
        if (!isPublicPath(pathAfterFail)) {
          // console.log('🔒 Redirecting to /login after failed refresh');
          window.location.href = '/login';
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
    // console.log('🔄 Starting session monitor...');
  }

  const monitorInterval = setInterval(async () => {
    const currentPath = window.location.pathname;

    if (isPublicPath(currentPath) || currentPath === '/') {
      return;
    }

    if (isLoggingOut) {
      return;
    }

    try {
      await api.get('/auth/health');
    } catch (error) {
      if (error.response?.status === 401) {
        // console.log('🔒 Session monitor detected 401');
        localStorage.removeItem('rememberedUsername');
        if (!isPublicPath(window.location.pathname)) {
          window.location.href = '/login';
        }
      }
    }
  }, 2 * 60 * 1000);

  return monitorInterval;
};

// ---------------- Multi-tab Logout Sync ----------------
window.addEventListener('storage', (event) => {
  if (event.key === 'rememberedUsername' && !event.newValue) {
    // console.log('📡 Multi-tab logout detected');
    const currentPath = window.location.pathname;
    if (!isPublicPath(currentPath)) {
      window.location.href = '/login';
    }
  }
});

export default api;