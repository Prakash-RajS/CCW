//src/routes/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

export default function ProtectedRoute({ allowedRoles }) {
  const { userData, loading } = useUser();
  const location = useLocation();

  if (loading) return null;

  // 🔒 Not logged in
  if (!userData?.id) {
    return <Navigate to="/login" replace />;
  }

  // 🧭 Logged in but role NOT selected
 // 🧭 Logged in but role NOT selected
if (!userData.role) {
  const allowedPaths = [
    "/role-section",
    "/creator-role-profile",
    "/creator-role-success",
    "/collaborator-role-profile",
    "/collaborator-role-success",
  ];

  if (allowedPaths.includes(location.pathname)) {
    return <Outlet />;
  }

  return <Navigate to="/role-section" replace />;
}


  // 🚫 Role not allowed
  if (allowedRoles && !allowedRoles.includes(userData.role)) {
    return userData.role === "creator"
      ? <Navigate to="/home" replace />
      : <Navigate to="/col-home" replace />;
  }

  // ✅ Allowed
  return <Outlet />;
}
