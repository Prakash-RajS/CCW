
// // src/utils/axiosConfig.js
// import axios from "axios";

// const API_BASE = import.meta.env.VITE_API_BASE_URL;

// const api = axios.create({
//   baseURL: API_BASE,
//   withCredentials: true, // ← crucial for cookies
//   headers: { "Content-Type": "application/json" },
// });

// let isRefreshing = false;
// let failedQueue = [];

// const processQueue = (error) => {
//   failedQueue.forEach(prom => error ? prom.reject(error) : prom.resolve());
//   failedQueue = [];
// };

// api.interceptors.response.use(
//   response => response,
//   async (error) => {
//     const originalRequest = error.config;
    
//     // Don't try to refresh for verify endpoint - just reject
//     const isVerifyEndpoint = originalRequest.url?.includes('/admin/verify');
//     if (isVerifyEndpoint) {
//       return Promise.reject(error);
//     }
    
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       const isLoginEndpoint = originalRequest.url?.includes('/admin/login');
//       if (isLoginEndpoint) return Promise.reject(error);
      
//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         }).then(() => api(originalRequest)).catch(err => Promise.reject(err));
//       }
      
//       originalRequest._retry = true;
//       isRefreshing = true;
      
//       try {
//         await api.post("/admin/refresh");
//         processQueue(null);
//         return api(originalRequest);
//       } catch (refreshError) {
//         processQueue(refreshError);
//         // Don't redirect for verify endpoint
//         if (!isVerifyEndpoint) {
//           window.location.href = "/";
//         }
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }
    
//     return Promise.reject(error);
//   }
// );

// export default api;

// src/utils/axiosConfig.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // ← crucial for cookies
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let failedQueue = [];

// 🔔 Store reference to notification refresh function
let refreshNotificationsFn = null;

// 🔔 Export function to set the notification refresh callback
export const setRefreshNotificationsFunction = (fn) => {
  refreshNotificationsFn = fn;
};

const processQueue = (error) => {
  failedQueue.forEach(prom => error ? prom.reject(error) : prom.resolve());
  failedQueue = [];
};

api.interceptors.response.use(
  response => {
    // 🔔 After successful POST/PUT/PATCH/DELETE to admin endpoints, refresh notifications
    const method = response.config.method?.toLowerCase();
    const url = response.config.url || '';
    
    if (
      ['post', 'put', 'patch', 'delete'].includes(method) &&
      url.includes('/admin/') &&
      !url.includes('/admin/notifications') && // Don't refresh for notification endpoints themselves
      !url.includes('/admin/verify') && // Skip verify endpoint
      !url.includes('/admin/refresh') && // Skip token refresh
      refreshNotificationsFn
    ) {
      // Small delay to let the database settle
      setTimeout(() => {
        refreshNotificationsFn();
      }, 300);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Don't try to refresh for verify endpoint - just reject
    const isVerifyEndpoint = originalRequest.url?.includes('/admin/verify');
    if (isVerifyEndpoint) {
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      const isLoginEndpoint = originalRequest.url?.includes('/admin/login');
      if (isLoginEndpoint) return Promise.reject(error);
      
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest)).catch(err => Promise.reject(err));
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        await api.post("/admin/refresh");
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // Don't redirect for verify endpoint
        if (!isVerifyEndpoint) {
          window.location.href = "/admin/";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;