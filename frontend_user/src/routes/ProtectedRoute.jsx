
// src/routes/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

// Define which routes belong to which roles
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

// Helper function to check if a route is accessible for a given role
const isRouteAccessible = (pathname, role) => {
  if (!role) return false;
  
  // Creator role profile routes - always accessible during profile setup
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

  // While context is still resolving, show loading spinner
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

  // Don't redirect during logout process
  if (isLoggingOut) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but role NOT yet selected
  if (!userData.role) {
    const allowedPaths = [
      "/role-section",
      "/creator-role-profile",
      "/collaborator-role-profile",
    ];

    if (allowedPaths.includes(location.pathname)) {
      return <Outlet />;
    }

    return <Navigate to="/role-section" replace />;
  }

  // Role not permitted for this route (additional check from allowedRoles prop)
  if (allowedRoles && !allowedRoles.includes(userData.role)) {
    console.log(`🚫 Role mismatch: ${userData.role} not in [${allowedRoles}]`);
    return userData.role === "creator"
      ? <Navigate to="/home" replace />
      : <Navigate to="/col-home" replace />;
  }

  // Check if the current route is accessible for the user's role
  // Skip this check for the role profile pages (they should always be accessible after role is set? No, they should redirect to home)
  if (location.pathname === "/creator-role-profile" && userData.role === "creator") {
    return <Navigate to="/home" replace />;
  }
  if (location.pathname === "/collaborator-role-profile" && userData.role === "collaborator") {
    return <Navigate to="/col-home" replace />;
  }
  
  if (!isRouteAccessible(location.pathname, userData.role)) {
    console.log(`🚫 Access denied: ${userData.role} cannot access ${location.pathname}`);
    return <Navigate to="/404" replace />;
  }

  // Authenticated and authorised
  return <Outlet />;
}