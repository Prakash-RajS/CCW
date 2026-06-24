// src/routes/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

const roleRouteMap = {
  creator: [
    "/home", "/job-created", "/edit-job", "/user-list", 
    "/finder-profile", "/activecontracts", "/awaitingcontracts", 
    "/pendingcontracts", "/pendingstatuscontracts", "/completedcontracts", 
    "/editwork", "/pending", "/choose-payment", "/creator-profile",
    "/creator-edit-profile", "/creator-success", "/created", "/subscription", "/proposalspage", "/myprojectmessage", "/hiredfreelancers"
  ],
  collaborator: [
    "/col-home", "/all-contacts", "/my-jobs", "/ux", 
    "/Uploadux", "/collab-subscription", "/ColabProfile",
    "/finance-overview", "/collaborator-profile", "/my-jobs", "collaborator-edit-profile",
    "/collaborator-success", "/transaction", "/collabration-filter", "/proposal",
  ],
  common: [
    "/message", "/post-project", "/complete-project", "/Findwork",
    "/contact", "/pro-file",
    "/collabration-recent", "/collabration-saved",
  ]
};

const isRouteAccessible = (pathname, role) => {
  if (!role) return false;
  
  if (pathname === "/creator-role-profile") return true;
  if (pathname === "/collaborator-role-profile") return true;
  
  const isCreatorRoute = roleRouteMap.creator.some(route => 
    pathname === route || pathname.startsWith(route + "/") || pathname.startsWith(route + "?")
  );
  
  const isCollaboratorRoute = roleRouteMap.collaborator.some(route => 
    pathname === route || pathname.startsWith(route + "/") || pathname.startsWith(route + "?")
  );
  
  const isCommonRoute = roleRouteMap.common.some(route => 
    pathname === route || pathname.startsWith(route + "/") || pathname.startsWith(route + "?")
  );
  
  if (role === "creator") {
    return isCreatorRoute || isCommonRoute;
  } else if (role === "collaborator") {
    return isCollaboratorRoute || isCommonRoute;
  }
  
  return false;
};

export default function ProtectedRoute({ allowedRoles }) {
  const { userData, loading, isAuthenticated, isLoggingOut } = useUser();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#51218F] border-t-transparent"></div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoggingOut) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role selection pages - require authentication but not role
  if (location.pathname === "/role-section" || 
      location.pathname === "/creator-role-profile" || 
      location.pathname === "/collaborator-role-profile") {
    // If user already has a role, redirect them away from role selection
    if (userData.role) {
      return userData.role === "creator" 
        ? <Navigate to="/home" replace /> 
        : <Navigate to="/col-home" replace />;
    }
    return <Outlet />;
  }

  // Logged in but role NOT yet selected - redirect to role-section
  if (!userData.role) {
    return <Navigate to="/role-section" replace />;
  }

  // Role not permitted for this route
  if (allowedRoles && !allowedRoles.includes(userData.role)) {
    console.log(`🚫 Role mismatch: ${userData.role} not in [${allowedRoles}]`);
    return userData.role === "creator"
      ? <Navigate to="/home" replace />
      : <Navigate to="/col-home" replace />;
  }

  // Check route accessibility
  if (!isRouteAccessible(location.pathname, userData.role)) {
    console.log(`🚫 Access denied: ${userData.role} cannot access ${location.pathname}`);
    return <Navigate to="/404" replace />;
  }

  return <Outlet />;
}