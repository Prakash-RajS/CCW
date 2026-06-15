
// src/App.jsx
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { ToastProvider } from "./component/Toast";
import AdminLogin from "./pages/Admin/AdminLogin";
import Dashboard from "./pages/Admin/Dashboard";
import ProtectedRoute from "./component/ProtectedRoute";
import ScrollToTop from "./component/ScrollToTop";

// Simplified PublicRoute - no auth check needed here
// The login page will handle redirect if already logged in
const PublicRoute = ({ children }) => {
  return children;
};

export default function App() {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <ToastProvider />
      <Routes>
        {/* Public Routes - No auth check needed */}
        <Route path="/" element={<PublicRoute><AdminLogin /></PublicRoute>} />
        <Route path="/admin-login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
        
        {/* Protected Routes - Auth check here */}
        <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/subscription" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}