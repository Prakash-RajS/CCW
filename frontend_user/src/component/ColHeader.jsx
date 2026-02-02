import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import profilepic from "../assets/Landing/profilepic.png";
import NotiProfile from "../assets/AfterSign/profile.png";
import api from "../utils/axiosConfig"; // Import your axios config

const ColHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // NAVBAR STATE
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Notification States
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeNotifyTab, setActiveNotifyTab] = useState("unread");
  const notificationRef = useRef(null);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  
  // User Data State
  const [userData, setUserData] = useState({
    id: null,
    first_name: "",
    last_name: "",
    profile_picture: profilepic,
    email: "",
    status: "Available"
  });

  const [isLoading, setIsLoading] = useState(true);

  // --- NAVIGATION CONFIGURATION ---
  const navItems = [
    {
      label: "Home",
      path: "/collabration"
    },
    {
      label: "My Work",
      path: "/project",
      hasDropdown: true,
      dropdownStyle: { width: "158px", left: "-60px" },
      dropdownItems: [
        { label: "All Contracts", path: "/all-contacts" },
        { label: "My Jobs", path: "/my-jobs" },
      ]
    },
    {
      label: "Financials",
      path: "/finance",
      hasDropdown: true,
      dropdownStyle: { width: "158px", left: "-60px" },
      dropdownItems: [
        { label: "Overview", path: "/finance-overview" },
        { label: "Transactions", path: "/transaction" },
      ]
    },
  ];
  // ------------------------------------

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Function to fetch user data from /auth/me endpoint
  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/auth/me');
      if (response.data) {
        setUserData(prev => ({
          ...prev,
          id: response.data.id,
          first_name: response.data.first_name || "",
          last_name: response.data.last_name || "",
          profile_picture: response.data.profile_picture || profilepic,
          email: response.data.email || "",
          status: response.data.status || "Available"
        }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Use default profile image if fetch fails
      setUserData(prev => ({
        ...prev,
        profile_picture: profilepic
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Close Notifications when clicking outside
  useEffect(() => {
    const handleClickOutsideNotification = (e) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideNotification);
    return () => document.removeEventListener("mousedown", handleClickOutsideNotification);
  }, []);

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen((p) => !p);
    setIsStatusMenuOpen(false);
    setIsMobileMenuOpen(false); // Close mobile menu if profile opens
  };

  const toggleStatusMenu = (e) => {
    e.stopPropagation(); // Prevent closing profile menu
    setIsStatusMenuOpen((p) => !p);
  };

  // Function to update status via API
  const changeStatus = async (newStatus) => {
    if (!userData.id) {
      console.error("User ID missing, cannot update status");
      return;
    }

    try {
      // Send as JSON data
      await api.patch(`/profile/update-status/${userData.id}`, {
        status: newStatus
      });

      // Update local state
      setUserData(prev => ({ ...prev, status: newStatus }));
      setIsStatusMenuOpen(false);
      
      console.log('Status updated successfully to:', newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
      
      // Show more detailed error info
      if (error.response) {
        console.error('Response error:', error.response.data);
        console.error('Status code:', error.response.status);
      }
      
      // Refresh user data to get current status from server
      await fetchUserData();
    }
  };

  const toggleDropdown = (menu) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  // Helper to handle navigation
  const handleNavigation = (path) => {
    navigate(path);
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  // Helper to check if item is active based on current URL
  const isItemActive = (item) => {
    if (item.hasDropdown) {
      return item.dropdownItems?.some((sub) => sub.path === location.pathname);
    }
    return location.pathname === item.path;
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      navigate("/");
    } catch (error) {
      console.error('Logout error:', error);
      navigate("/");
    }
  };

  return (
    // Main Container
    <nav className="relative w-full mt-4 px-4 lg:px-4 max-w-[1201px] h-[74px] mx-auto flex items-center justify-between text-white z-20">
      
      {/* 0. MOBILE HAMBURGER ICON (Left) */}
      <div className="md:hidden flex items-center justify-start flex-1">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white focus:outline-none"
        >
          {isMobileMenuOpen ? (
             // Close Icon
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <line x1="18" y1="6" x2="6" y2="18"></line>
               <line x1="6" y1="6" x2="18" y2="18"></line>
             </svg>
          ) : (
             // Hamburger Icon
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <line x1="3" y1="12" x2="21" y2="12"></line>
               <line x1="3" y1="6" x2="21" y2="6"></line>
               <line x1="3" y1="18" x2="21" y2="18"></line>
             </svg>
          )}
        </button>
      </div>

      {/* 1. LOGO SECTION (Centered on Mobile, Left on Desktop) */}
      <div className="flex-1 md:flex-none flex justify-center md:justify-start">
        <h1
          className="trochut-font bg-gradient-to-l from-[#51218F] to-[#030303] bg-clip-text text-[#030303] md:text-transparent
            text-3xl
            sm:text-4xl
            md:text-5xl
            lg:text-[50px]
            font-bold leading-none
            flex-shrink-0
          "
        >
          Talenta
        </h1>
      </div>

      {/* 2. CENTER NAVIGATION MENU (Desktop Only) */}
      <div className="hidden md:flex flex-1 max-w-[609px] mx-4 h-[52px] items-center justify-between rounded-[50px] px-[20px] bg-[rgba(255,255,255,0.19)] backdrop-blur-[2px] relative">
        
        {navItems.map((item) => {
          const isActive = isItemActive(item);

          return (
            <div key={item.label} className="relative">
              {item.hasDropdown ? (
                // --- DROPDOWN ITEM ---
                <>
                  <button
                    onClick={() => toggleDropdown(item.label)}
                    className={`group relative flex items-center gap-1 text-[18px] outfit font-normal cursor-pointer outline-none transition-colors
                      ${isActive ? "text-[#51218F]" : "text-white hover:text-[#51218F]"} 
                    `}
                  >
                    {item.label}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 transition-transform duration-200 ${
                        activeDropdown === item.label ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    
                    <span 
                      className={`absolute -bottom-[4px] left-0 w-full h-[2px] bg-[#51218F] transform origin-left transition-transform duration-300 ease-out 
                      ${(activeDropdown === item.label || isActive) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
                    ></span>
                  </button>

                  {/* Dropdown Content */}
                  {activeDropdown === item.label && (
                    <div
                      className="absolute flex flex-col items-start z-50"
                      style={{
                        width: item.dropdownStyle?.width || "158px",
                        top: "45px",
                        left: item.dropdownStyle?.left || "-40px",
                        borderRadius: "8px",
                        paddingTop: "22px",
                        paddingBottom: "32px",
                        gap: "8px",
                        opacity: 1,
                        background: "linear-gradient(180deg, rgba(81, 33, 143, 0.8) 0%, #020202 100%)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      {item.dropdownItems.map((subItem) => {
                        const isSubActive = location.pathname === subItem.path;
                        return (
                          <div
                            key={subItem.label}
                            onClick={() => handleNavigation(subItem.path)}
                            className={`w-full text-left cursor-pointer px-4 py-1 text-[16px] outfit font-normal transition-colors
                              ${isSubActive ? "bg-white text-black" : "text-white hover:bg-white hover:text-black"}
                            `}
                          >
                            {subItem.label}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                // --- SIMPLE LINK ITEM ---
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`relative group text-[18px] outfit font-normal cursor-pointer transition-colors
                    ${isActive ? "text-[#51218F]" : "text-white hover:text-[#51218F]"}
                  `}
                >
                  {item.label}
                  <span className={`absolute -bottom-[4px] left-0 w-full h-[2px] bg-[#51218F] transform origin-left transition-transform duration-300 ease-out 
                    ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
                  ></span>
                </button>
              )}
            </div>
          );
        })}

      </div>

      {/* 3. RIGHT ICONS + USER PROFILE */}
      <div className="flex flex-1 md:flex-none justify-end items-center gap-1 md:gap-4 flex-shrink-0 relative">
        {/* Messenger SVG */}
        <svg
          width="28"
          height="24"
          viewBox="0 0 28 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[22px] h-[22px] md:w-[24px] md:h-[24px] lg:w-[28px] cursor-pointer"
        >
          <path d="M4 3H24C25.66 3 27 4.34 27 6V16C27 17.66 25.66 19 24 19H11L5 22V19H4C2.34 19 1 17.66 1 16V6C1 4.34 2.34 3 4 3Z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 8H21" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M7 12H17" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>

        {/* Notification SVG */}
        <div 
          className="cursor-pointer relative"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 26 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[24px] h-[24px] cursor-pointer"
          >
            <path d="M14 22C14.828 22 15.5 21.328 15.5 20.5H12.5C12.5 21.328 13.172 22 14 22Z" fill="white" />
            <path d="M21 17V11C21 7.5 18.8 5 15.5 4.2V3.5C15.5 2.12 14.38 1 13 1C11.62 1 10.5 2.12 10.5 3.5V4.2C7.2 5 5 7.5 5 11V17L3 19V20H23V19L21 17Z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"  fill="white" />
            <circle cx="22" cy="5" r="4" fill="white" />
          </svg>
        </div>

        {/* User Name */}
        <span
  className="
    text-[14px] md:text-[18px]
    font-medium
    hidden sm:block
    text-white
    max-w-[140px]
    truncate
    whitespace-nowrap
  "
  title={`${userData.first_name}`.trim()}
>
  {isLoading
    ? "Loading..."
    : `${userData.first_name}`.trim() || "User"}
</span>


        {/* Profile image */}
        <button
  type="button"
  onClick={toggleProfileMenu}
  className="relative outline-none cursor-pointer shrink-0"
>
  <img
    src={userData.profile_picture}
    alt="profile"
    className="
      w-[32px] h-[32px]
      md:w-[50px] md:h-[50px]
      lg:w-[58px] lg:h-[58px]
      min-w-[32px] min-h-[32px]
      md:min-w-[50px] md:min-h-[50px]
      lg:min-w-[58px] lg:min-h-[58px]
      rounded-full
      object-cover
    "
  />
</button>


        {/* PROFILE DROPDOWN */}
        {isProfileMenuOpen && (
  <div
    className="
      absolute
      right-0
      top-full
      mt-2
      w-[160px]
      rounded-[12px]
      overflow-hidden
      z-50
      pt-4
      pb-2
      shadow-2xl
    "
    style={{
      background: "linear-gradient(180deg, #7242B8 0%, #030016 100%)",
    }}
  >

            {/* Profile */}
            <button onClick={() => navigate("/CreatorviewProfile")}
              type="button"
              className="w-full px-[20px] md:px-[34px] py-2 text-left text-white text-[14px] md:text-[18px] outfit font-normal cursor-pointer flex items-center hover:bg-white hover:text-black transition-colors"
            >
              Profile
            </button>

            {/* AVAILABLE ROW (Styled like links now) */}
            <div className="relative px-0 py-0">
              <button
                type="button"
                onClick={toggleStatusMenu}
                className="w-full px-[10px] py-2 text-[14px] md:text-[18px] outfit font-normal cursor-pointer flex items-center justify-between gap-3 text-white hover:bg-white hover:text-black transition-colors group"
              >
                <span className="flex items-center gap-2">
                  {userData.status === "Available" ? (
                    <span className="w-[16px] h-[16px] md:w-[18px] md:h-[18px] rounded-full bg-[#00D27F] flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="w-3 h-3" fill="none">
                        <path d="M4 8.2L6.4 10.6L12 5" stroke="black" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  ) : (
                    <span className="w-[16px] h-[16px] md:w-[18px] md:h-[18px] rounded-full bg-[#E09E9E] flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="w-3 h-3" fill="none">
                        <circle cx="8" cy="8" r="5.5" stroke="black" strokeWidth="1.4" />
                        <path d="M8 4.5V8L10.5 9.5" stroke="black" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                  <span>{userData.status}</span>
                </span>

                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="w-4 h-4 stroke-current" fill="none">
                  <path d="M6 3L10 8L6 13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Log Out */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full px-[20px] md:px-[34px] py-2 text-left text-white text-[14px] md:text-[18px] outfit font-normal cursor-pointer flex items-center hover:bg-white hover:text-black transition-colors"
            >
              Log Out
            </button>
          </div>
        )}

        {/* STATUS DROPDOWN */}
        {isStatusMenuOpen && (
          <div
            // Mobile: positioned lower to sit under the profile card
            // Desktop: positioned to the left of the profile card
            className="
  absolute
  top-[140px]
  right-[70px]

  md:top-[120px]
  md:right-[-135px]

  w-[130px]
  rounded-[12px]
  overflow-hidden
  flex flex-col
  gap-0
  z-[60]
  shadow-xl
  py-2
"

            style={{
              background: "linear-gradient(180deg, #7242B8 0%, #030016 100%)",
            }}
          >
            <button
              type="button"
              onClick={() => changeStatus("Available")}
              className="w-full flex items-center gap-3 text-left text-white text-[14px] md:text-[16px] outfit font-normal cursor-pointer hover:bg-white hover:text-black px-4 py-2 transition-colors"
            >
              <span className="w-[16px] h-[16px] md:w-[18px] md:h-[18px] rounded-full bg-[#00D27F] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="w-3 h-3" fill="none">
                  <path d="M4 8.2L6.4 10.6L12 5" stroke="black" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span>Available</span>
            </button>

            <button
              type="button"
              onClick={() => changeStatus("Away")}
              className="w-full flex items-center gap-3 text-left text-white text-[14px] md:text-[16px] outfit font-normal cursor-pointer hover:bg-white hover:text-black px-4 py-2 transition-colors"
            >
              <span className="w-[16px] h-[16px] md:w-[18px] md:h-[18px] rounded-full bg-[#E09E9E] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="w-3 h-3" fill="none">
                  <circle cx="8" cy="8" r="5.5" stroke="black" strokeWidth="1.4" />
                  <path d="M8 4.5V8L10.5 9.5" stroke="black" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span>Away</span>
            </button>
          </div>
        )}

      </div>

      {/* ================= MOBILE MENU OVERLAY ================= */}
      {isMobileMenuOpen && (
        <div 
            // Reduced width (w-[170px]) and padding for a compact look
            className="absolute top-[80px] left-4 w-[170px] rounded-[16px] p-3 flex flex-col gap-2 z-40 shadow-2xl md:hidden"
            style={{
                background: "linear-gradient(180deg, rgba(81, 33, 143, 0.95) 0%, #020202 100%)",
                backdropFilter: "blur(10px)"
            }}
        >
            {navItems.map((item) => {
                const isActive = isItemActive(item);
                const isExpanded = activeDropdown === item.label;

                return (
                    <div key={item.label} className="relative group">
                        {/* Main Item */}
                        {item.hasDropdown ? (
                            <div 
                                onClick={() => toggleDropdown(item.label)}
                                className={`
                                    flex items-center justify-between text-[18px] outfit font-medium cursor-pointer px-3 py-2 rounded-[8px] transition-all
                                    ${isExpanded ? "bg-white text-black shadow-md" : "text-white hover:bg-white/10"}
                                `}
                            >
                                <span>{item.label}</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-90 text-[#51218F]" : "text-white"}`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        ) : (
                            <div 
                                onClick={() => handleNavigation(item.path)}
                                className={`
                                    flex items-center justify-between text-[18px] outfit font-medium cursor-pointer px-3 py-2 rounded-[8px] transition-all
                                    ${isActive ? "bg-white/20 text-white" : "text-white hover:bg-white/10"}
                                `}
                            >
                                <span>{item.label}</span>
                            </div>
                        )}

                        {/* Sub Items (Popping out to the RIGHT) */}
                        {item.hasDropdown && isExpanded && (
                            <div 
                              className="absolute top-0 left-[115%] w-[160px] rounded-[16px] p-3 flex flex-col gap-2 z-50 shadow-2xl"
                              style={{
                                  background: "linear-gradient(180deg, rgba(81, 33, 143, 0.95) 0%, #020202 100%)",
                                  backdropFilter: "blur(10px)"
                              }}
                            >
                                {item.dropdownItems.map((subItem) => (
                                    <div
                                        key={subItem.label}
                                        onClick={() => handleNavigation(subItem.path)}
                                        className="text-[16px] text-white/90 hover:text-white hover:bg-white/10 cursor-pointer py-1.5 px-3 rounded-[6px] transition-colors"
                                    >
                                        {subItem.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
      )}

      {/* ================= NOTIFICATION POPUP ================= */}
      {showNotifications && (
        <div
          ref={notificationRef}
          className="
            absolute
            bg-white
            shadow-2xl
            z-[9999]
            flex
            flex-col
            right-2
            md:right-0
            w-[60vw]
            max-w-[550px]
            md:w-[500px]
            rounded-[8px]
            overflow-hidden
          "
          style={{
            top: "74px",
            minHeight: "460px",
          }}
        >
          {/* Header Tabs + Close */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b">
            <div className="flex items-center gap-2">
              {/* UNREAD */}
              <button
                type="button"
                onClick={() => setActiveNotifyTab("unread")}
                className="px-3 py-1 text-sm flex items-center gap-2 cursor-pointer"
                style={{
                  background:
                    activeNotifyTab === "unread"
                      ? "rgba(81, 33, 143, 0.6)"
                      : "rgba(217, 217, 217, 1)",
                  color: "rgba(61, 23, 104, 1)",
                  borderRadius: "4px",
                }}
              >
                <span>Unread</span>
                <span
                  className="flex items-center justify-center text-xs font-medium"
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: "rgba(202, 217, 241, 1)",
                    color: "rgba(61, 23, 104, 1)",
                  }}
                >
                  9
                </span>
              </button>

              {/* READED */}
              <button
                type="button"
                onClick={() => setActiveNotifyTab("readed")}
                className="px-4 py-1 text-sm cursor-pointer"
                style={{
                  background:
                    activeNotifyTab === "readed"
                      ? "rgba(81, 33, 143, 0.6)"
                      : "rgba(217, 217, 217, 1)",
                  color:
                    activeNotifyTab === "readed"
                      ? "rgba(61, 23, 104, 1)"
                      : "rgba(94, 100, 110, 1)",
                  borderRadius: "4px",
                }}
              >
                Readed
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowNotifications(false)}
              className="w-8 h-8 flex items-center justify-center text-white text-lg font-bold cursor-pointer"
              style={{
                background: "rgba(81, 33, 143, 1)",
                borderRadius: "50%",
              }}
            >
              ×
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex flex-col gap-1 px-2 pb-2 overflow-y-auto overflow-x-hidden max-h-[calc(100vh-110px)]">
            {[
              {
                title: "You have updated your Profile Successfully",
                time: "11 seconds ago",
                type: "profile",
              },
              {
                title: "Your plan subscription for Upgraded",
                time: "52 seconds ago",
                type: "profile",
              },
              {
                title: "Jane wants your attention on Project",
                time: "1 minute ago",
                type: "initial",
              },
              {
                title: "Jane mentioned you in a comment in Recent works",
                desc: "@Samlee This is the folder for all interview progress.",
                time: "2 minutes ago",
                type: "initial",
              },
              {
                title: "Your plan subscription is going to Over",
                time: "3 minutes ago",
                type: "profile",
              },
              {
                title: "Jane mentioned you in a comment in Ai project",
                date: "12/07/2021",
                desc: "@Samlee One of the participant.",
                time: "3 minutes ago",
                type: "initial",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-2 px-2 py-1.5 pr-4 border-b last:border-b-0 relative overflow-hidden"
              >
                {/* LEFT ICON */}
                {item.type === "profile" ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img
                      src={NotiProfile}
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                    style={{ background: "rgba(81, 33, 143, 0.5)" }}
                  >
                    Ja
                  </div>
                )}

                {/* CONTENT */}
                <div className="flex-1">
                  {/* TITLE + DATE */}
                  <p className="text-[13px] font-medium text-gray-900 leading-tight break-words md:whitespace-nowrap md:overflow-hidden md:text-ellipsis">
                    {item.title}
                    {item.date && (
                      <span className="ml-1 text-gray-500 font-normal">
                        – {item.date}
                      </span>
                    )}
                  </p>

                  {/* COMMENT WITH GREY LINE */}
                  {item.desc && (
                    <div className="flex items-start gap-2 mt-0.5">
                      <span className="w-[2px] h-[16px] bg-gray-300 rounded-sm mt-[2px]"></span>
                      <p className="text-[12px] text-gray-500 leading-tight">
                        {item.desc}
                      </p>
                    </div>
                  )}

                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {item.time}
                  </p>
                </div>

                {/* UNREAD DOT */}
                <span className="w-1.5 h-1.5 bg-[#51218F] rounded-full absolute right-3 top-4"></span>
              </div>
            ))}
          </div>
        </div>
      )}

    </nav>
  );
}

export default ColHeader;