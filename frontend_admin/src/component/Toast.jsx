//src/component/Toast.jsx
import React from "react";
import { Toaster, toast as hotToast } from "react-hot-toast";

// ✅ Toast Provider (use ONLY once in App.jsx)
export const ToastProvider = () => {
  // Get theme from localStorage (your existing logic)
  const isDarkMode =
    localStorage.getItem("theme") === "dark" ||
    (!localStorage.getItem("theme") &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <Toaster
  position="top-center"
  reverseOrder={false}
  gutter={8}
  toastOptions={{
    duration: 3000,

    // ✅ Default style
    style: {
      background: isDarkMode ? "#1f2937" : "#ffffff",
      color: isDarkMode ? "#f9fafb" : "#111827",
      padding: "14px 18px",
      borderRadius: "12px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
      fontSize: "14px",
      fontWeight: "500",
      minWidth: "260px",
      maxWidth: "380px",
    },

    // ✅ SUCCESS STYLE (green bg + white text)
    success: {
      style: {
        background: "#22c55e", // green
        color: "#ffffff",
      },
      iconTheme: {
        primary: "#ffffff",
        secondary: "#22c55e",
      },
    },

    // ✅ ERROR STYLE (red bg + white text)
    error: {
      style: {
        background: "#ef4444",
        color: "#ffffff",
      },
      iconTheme: {
        primary: "#ffffff",
        secondary: "#ef4444",
      },
    },
  }}
/>
  );
};


// ✅ Custom Toast Helper (clean usage everywhere)
export const toast = {
  success: (title, message) =>
    hotToast.success(
      <div>
        <p className="font-semibold">{title}</p>
        {message && <p className="text-sm opacity-80">{message}</p>}
      </div>
    ),

  error: (title, message) =>
    hotToast.error(
      <div>
        <p className="font-semibold">{title}</p>
        {message && <p className="text-sm opacity-80">{message}</p>}
      </div>
    ),

  info: (title, message) =>
    hotToast(
      <div>
        <p className="font-semibold">{title}</p>
        {message && <p className="text-sm opacity-80">{message}</p>}
      </div>
    ),

  loading: (message) => hotToast.loading(message),

  dismiss: (id) => hotToast.dismiss(id),
};


// ✅ Optional default export
export default toast;