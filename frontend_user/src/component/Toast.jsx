// src/components/Toast.jsx
import React from "react";
import { Toaster, toast as hotToast } from "react-hot-toast";

// Track current toast ID
let currentToastId = null;

// ✅ Toast Provider (use ONLY once in App.jsx)
export const ToastProvider = () => {
  return (
    <Toaster
      position="top-center"
      containerStyle={{
        zIndex: 999999, // Ensure it's above everything
      }}
      toastOptions={{
        style: { 
          fontSize: "14px",
          zIndex: 999999,
        },
        success: {
          style: { 
            background: "#4CAF50", 
            color: "white",
            zIndex: 999999,
          },
          duration: 2000,
        },
        error: {
          style: { 
            background: "#F44336", 
            color: "white",
            zIndex: 999999,
          },
          duration: 4000,
        },
        loading: {
          style: { 
            background: "#3D1768", 
            color: "white",
            zIndex: 999999,
          },
        },
      }}
    />
  );
};

// Helper function to dismiss current toast before showing new one
const showToastWithSingle = (type, message, description, options = {}) => {
  // Dismiss current toast if exists
  if (currentToastId) {
    hotToast.dismiss(currentToastId);
    currentToastId = null;
  }
  
  // Show new toast and store its ID
  let toastId;
  const content = (
    <div>
      <p className="font-semibold">{message}</p>
      {description && <p className="text-sm opacity-80">{description}</p>}
    </div>
  );
  
  // Merge options with high z-index
  const mergedOptions = {
    ...options,
    style: {
      zIndex: 999999,
      ...options.style,
    },
  };
  
  if (type === 'success') {
    toastId = hotToast.success(content, mergedOptions);
  } else if (type === 'error') {
    toastId = hotToast.error(content, mergedOptions);
  } else if (type === 'info') {
    toastId = hotToast(content, mergedOptions);
  } else if (type === 'loading') {
    toastId = hotToast.loading(message, mergedOptions);
  }
  
  currentToastId = toastId;
  
  // Clear the stored ID after toast disappears
  const duration = options.duration || (type === 'error' ? 4000 : 2000);
  setTimeout(() => {
    if (currentToastId === toastId) {
      currentToastId = null;
    }
  }, duration);
  
  return toastId;
};

// ✅ Custom Toast Helper (only one toast at a time)
export const toast = {
  success: (message, description, duration = 2000) =>
    showToastWithSingle('success', message, description, { duration }),

  error: (message, description, duration = 4000) =>
    showToastWithSingle('error', message, description, { duration }),

  info: (message, description, duration = 3000) =>
    showToastWithSingle('info', message, description, { duration }),

  loading: (message) => showToastWithSingle('loading', message, null, { duration: Infinity }),

  dismiss: (id) => {
    if (id) {
      hotToast.dismiss(id);
      if (currentToastId === id) {
        currentToastId = null;
      }
    } else {
      hotToast.dismiss();
      currentToastId = null;
    }
  },
  
  // Force dismiss current toast
  dismissAll: () => {
    hotToast.dismiss();
    currentToastId = null;
  },
};

// ✅ Optional default export
export default toast;