

// // src/contexts/UserContext.jsx
// import React, {
//   createContext,
//   useState,
//   useContext,
//   useEffect,
//   useRef,
// } from "react";
// import api from "../utils/axiosConfig";

// const UserContext = createContext();
// export const useUser = () => useContext(UserContext);

// const EMPTY_USER = {
//   id: null,
//   email: "",
//   role: "",
//   // first_name: "",
//   // last_name: "",
//   full_name: "",
//   profile_picture: null,
//   phone_number: "",
//   status: "",
//   location: "",
//   provider: "",
// };

// // ✅ FIX: Complete public routes list — must stay in sync with axiosConfig PUBLIC_PATHS
// // Any route missing from here will trigger fetchUserData() → 401 → redirect to /login
// const PUBLIC_ROUTES = [
//   "/",
//   "/login",
//   "/signup",
//   "/signupac",
//   "/signup-otp",      // ← was missing — caused redirect to /login after OTP page
//   "/role-section",    // ← was missing — caused redirect to /login after signup
//   "/forgot-password",
//   "/auth-callback",   // ← was missing — caused redirect to /login after Auth0
// ];

// const isPublicRoute = (path) =>
//   PUBLIC_ROUTES.some((route) => path === route || path.startsWith(route + "/"));

// export const UserProvider = ({ children }) => {
//   const [userData, setUserData] = useState(EMPTY_USER);
//   const [loading, setLoading] = useState(true);
//   const [isAuthenticated, setIsAuthenticated] = useState(false); // ✅ clean auth flag

//   /* =====================================================
//      BroadcastChannel (created once)
//   ===================================================== */
//   const broadcastChannelRef = useRef(null);

//   if (!broadcastChannelRef.current) {
//     broadcastChannelRef.current = new BroadcastChannel("user_data_channel");
//   }

//   const broadcastChannel = broadcastChannelRef.current;

//   /* =====================================================
//      Fetch user data from backend (/auth/me)
//   ===================================================== */
//   const fetchUserData = async () => {
//     try {
//       const response = await api.get("/auth/me");

//       const user = {
//         id: response.data.id,
//         email: response.data.email,
//         role: response.data.role || "",
//         // first_name: response.data.first_name || "",
//         // last_name: response.data.last_name || "",
//         full_name: response.data.full_name || "",
//         profile_picture: response.data.profile_picture || null,
//         phone_number: response.data.phone_number || "",
//         status: response.data.status || "",
//         location: response.data.location || "",
//         provider: response.data.provider || "",
//       };

//       setUserData(user);
//       setIsAuthenticated(true); // ✅
//       return user;
//     } catch (error) {
//       // ✅ FIX: Only reset state on explicit 401, not network errors
//       if (error.response?.status === 401) {
//         setUserData(EMPTY_USER);
//         setIsAuthenticated(false);
//       }
//       return null;
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* =====================================================
//      Update user data manually
//   ===================================================== */
//   const updateUserData = (newData) => {
//     setUserData((prev) => ({ ...prev, ...newData }));
//     broadcastChannel.postMessage({ type: "userDataUpdated" });
//   };

//   /* =====================================================
//      Initial Load
//   ===================================================== */
//   useEffect(() => {
//     const path = window.location.pathname;

//     // ✅ FIX: Use isPublicRoute() — covers all public paths including subpaths
//     if (isPublicRoute(path)) {
//       setLoading(false);
//       return;
//     }

//     // Protected routes → fetch user
//     fetchUserData();

//     // Multi-tab sync
//     const handleBroadcast = (event) => {
//       if (event.data?.type === "userDataUpdated") {
//         fetchUserData();
//       }
//     };

//     broadcastChannel.addEventListener("message", handleBroadcast);

//     return () => {
//       broadcastChannel.removeEventListener("message", handleBroadcast);
//     };
//   }, []);

//   return (
//     <UserContext.Provider
//       value={{
//         userData,
//         loading,
//         isAuthenticated, // ✅ expose for route guards
//         fetchUserData,
//         updateUserData,
//       }}
//     >
//       {children}
//     </UserContext.Provider>
//   );
// };

// src/contexts/UserContext.jsx
// src/contexts/UserContext.jsx
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import api from "../utils/axiosConfig";

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

const EMPTY_USER = {
  id: null,
  email: "",
  role: "",
  full_name: "",
  profile_picture: null,
  phone_number: "",
  status: "",
  location: "",
  provider: "",
};

// ✅ FIX: Public routes - only truly public pages
// Role-section is NOT public - it requires authentication
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/signupac",
  "/signup-otp",
  "/forgot-password",
  "/auth-callback",
  "/reset-password",
  "/enter-otp",
  "/otp-request",
  "/reset-succes",
  "/post-project",
  "/complete-project",
  "/Findwork",
  "/contact",
];

const isPublicRoute = (path) =>
  PUBLIC_ROUTES.some((route) => path === route || path.startsWith(route + "/"));

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(EMPTY_USER);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const broadcastChannelRef = useRef(null);

  if (!broadcastChannelRef.current) {
    broadcastChannelRef.current = new BroadcastChannel("user_data_channel");
  }

  const broadcastChannel = broadcastChannelRef.current;

  /* =====================================================
     Fetch user data from backend (/auth/me)
  ===================================================== */
  const fetchUserData = async () => {
    if (isLoggingOut) {
      console.log("⏭ Skipping fetch - logout in progress");
      setLoading(false);
      return null;
    }

    try {
      const response = await api.get("/auth/me");

      const user = {
        id: response.data.id,
        email: response.data.email,
        role: response.data.role || "",
        full_name: response.data.full_name || "",
        profile_picture: response.data.profile_picture || null,
        phone_number: response.data.phone_number || "",
        status: response.data.status || "",
        location: response.data.location || "",
        provider: response.data.provider || "",
      };

      setUserData(user);
      setIsAuthenticated(true);
      return user;
    } catch (error) {
      if (error.response?.status === 401) {
        console.log("🔒 401 received - clearing user state");
        setUserData(EMPTY_USER);
        setIsAuthenticated(false);
      } else {
        console.log("⚠️ Non-401 error - keeping user state:", error.message);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     Update user data manually
  ===================================================== */
  const updateUserData = (newData) => {
    setUserData((prev) => ({ ...prev, ...newData }));
    broadcastChannel.postMessage({ type: "userDataUpdated" });
  };

  /* =====================================================
     Logout function
  ===================================================== */
  const logout = async () => {
    console.log("🚪 Starting logout process");
    
    setIsLoggingOut(true);
    setUserData(EMPTY_USER);
    setIsAuthenticated(false);

    try {
      await api.post("/auth/logout");
      console.log("✅ Logout API call successful");
    } catch (error) {
      console.error("❌ Logout API error:", error);
    } finally {
      setTimeout(() => {
        setIsLoggingOut(false);
        console.log("🔄 Logout flag reset");
      }, 1000);
    }

    broadcastChannel.postMessage({ type: "userLoggedOut" });
    localStorage.removeItem('rememberedUsername');
  };

  /* =====================================================
     Initial Load
  ===================================================== */
  useEffect(() => {
    const path = window.location.pathname;

    // Only skip auth check for truly public routes
    if (isPublicRoute(path)) {
      console.log(`🌐 Public route (${path}) - skipping auth check`);
      setLoading(false);
      return;
    }

    // Protected routes → fetch user
    console.log(`🔒 Protected route (${path}) - fetching user data`);
    fetchUserData();

    // Multi-tab sync
    const handleBroadcast = (event) => {
      if (event.data?.type === "userDataUpdated") {
        console.log("📡 Broadcast: userDataUpdated - refetching");
        fetchUserData();
      }
      if (event.data?.type === "userLoggedOut") {
        console.log("📡 Broadcast: userLoggedOut - clearing state");
        setUserData(EMPTY_USER);
        setIsAuthenticated(false);
      }
    };

    broadcastChannel.addEventListener("message", handleBroadcast);

    return () => {
      broadcastChannel.removeEventListener("message", handleBroadcast);
    };
  }, []);

  return (
    <UserContext.Provider
      value={{
        userData,
        loading,
        isAuthenticated,
        isLoggingOut,
        fetchUserData,
        updateUserData,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};