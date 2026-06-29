

// src/component/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../utils/axiosConfig";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const verifyAuth = async () => {
      try {
        await api.get('/admin/verify');
        if (isMounted) setIsAuthenticated(true);
      } catch {
        if (isMounted) setIsAuthenticated(false);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    verifyAuth();

    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#D9D9D9]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#2B145A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#2B145A] font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;