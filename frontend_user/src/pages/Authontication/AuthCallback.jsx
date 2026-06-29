// src/pages/Authontication/AuthCallback.jsx
// ✅ NEW FILE — handles /auth-callback route after Auth0 redirect
//
// Flow:
//   1. Auth0 redirects to backend /auth/auth0/callback
//   2. Backend creates handshake token, redirects here with ?token=xxx
//   3. This page POSTs to /auth/session-handshake → backend sets HttpOnly cookies
//   4. fetchUserData() populates UserContext
//   5. Navigate based on role: "" → /role-section, creator → /home, collaborator → /col-home

import React, { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../utils/axiosConfig";
import { useUser } from "../../contexts/UserContext";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchUserData } = useUser();
  const hasRun = useRef(false); // Prevent double-run in React StrictMode

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const handleCallback = async () => {
      const token = searchParams.get("token");

      if (!token) {
        console.error("❌ No handshake token in URL");
        navigate("/login", { replace: true });
        return;
      }

      try {
        // ✅ Exchange handshake token for real HttpOnly cookies
        // Direct POST — cookies are set on the correct origin
        const response = await api.post("/auth/session-handshake", null, {
          params: { token },
        });

        const role = response.data?.role || "";
        // console.log(`✅ Session established, role: '${role}'`);

        // ✅ Populate UserContext now that cookies are set
        await fetchUserData();

        // ✅ Role-based redirect
        const roleLower = role.trim().toLowerCase();
        if (!roleLower) {
          navigate("/role-section", { replace: true });
        } else if (roleLower === "creator") {
          navigate("/home", { replace: true });
        } else if (roleLower === "collaborator") {
          navigate("/col-home", { replace: true });
        } else {
          navigate("/role-section", { replace: true });
        }

      } catch (error) {
        console.error("❌ Session handshake failed:", error);
        // Handshake expired or invalid — send back to login
        navigate("/login", { replace: true });
      }
    };

    handleCallback();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #3D1768 0%, #8B3EFF 100%)",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      {/* Spinner */}
      <div
        style={{
          width: 56,
          height: 56,
          border: "4px solid rgba(255,255,255,0.3)",
          borderTopColor: "white",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          marginBottom: 24,
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Signing you in...</p>
      <p style={{ fontSize: 14, opacity: 0.7, marginTop: 8 }}>Please wait a moment</p>
    </div>
  );
};

export default AuthCallback;        