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
  first_name: "",
  last_name: "",
};

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(EMPTY_USER);
  const [loading, setLoading] = useState(true);

  /* =====================================================
     BroadcastChannel (created once)
  ===================================================== */
  const broadcastChannelRef = useRef(null);

  if (!broadcastChannelRef.current) {
    broadcastChannelRef.current = new BroadcastChannel("user_data_channel");
  }

  const broadcastChannel = broadcastChannelRef.current;

  /* =====================================================
     Fetch user data from backend (/auth/me)
  ===================================================== */
  const fetchUserData = async () => {
    try {
      const response = await api.get("/auth/me");

      const user = {
        id: response.data.id,
        email: response.data.email,
        role: response.data.role || "",
        first_name: response.data.first_name || "",
        last_name: response.data.last_name || "",
      };

      setUserData(user);
      return user;
    } catch (error) {
      setUserData(EMPTY_USER);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     Update user data manually (rare use)
  ===================================================== */
  const updateUserData = (newData) => {
    setUserData((prev) => ({ ...prev, ...newData }));
    broadcastChannel.postMessage({ type: "userDataUpdated" });
  };

  /* =====================================================
     Initial Load
  ===================================================== */
  useEffect(() => {
    const path = window.location.pathname;

    // Public routes (NO auth check)
    const publicRoutes = ["/", "/login", "/signup", "/signupac", "/forgot-password","/role-section"];

    if (publicRoutes.includes(path)) {
      setLoading(false);
      return;
    }

    // Protected routes → fetch user
    fetchUserData();

    // Multi-tab sync
    const handleBroadcast = (event) => {
      if (event.data?.type === "userDataUpdated") {
        fetchUserData();
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
        fetchUserData,
        updateUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

 