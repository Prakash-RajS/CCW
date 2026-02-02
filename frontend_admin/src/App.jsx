import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { Toaster } from "react-hot-toast";

import AdminLogin from "./pages/Admin/AdminLogin";
import Dashboard from "./pages/Admin/Dashboard";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("adminLoggedIn") === "true";
  
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

export default function App() {
  return (
    <Router>
      {/* Global Toast */}
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        {/* Show login page first when opening the site */}
        <Route path="/" element={<AdminLogin />} />
        
        {/* Alternative login route */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Protected Admin Dashboard */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* Redirect all unknown routes to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}