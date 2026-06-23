import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import profilepic from "../assets/Landing/Profilepic.png";
import api, { setLoggingOut } from "../utils/axiosConfig";
import { useUser } from "../contexts/UserContext";
import { formatDistanceToNow } from 'date-fns';
import Bell from "../assets/AfterSign/Bell.png";
import Msg from "../assets/AfterSign/Msg.png";
import toast from "../component/Toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log("🔍 ColHeader API_BASE_URL:", API_BASE_URL);

const ColHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, loading, updateUserData, logout } = useUser();

  // NAVBAR STATE
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0, top: 0 });
  const [activeTab, setActiveTab] = useState("");

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);

  // Notification States
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeNotifyTab, setActiveNotifyTab] = useState("unread");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  
  // Message States
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const dropdownRef = useRef(null);
  const navItemRefs = useRef({});
  const mobileMenuRef = useRef(null);
  const mobileProfileRef = useRef(null);
  const notificationIntervalRef = useRef(null);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  // ❌ REMOVED local status state – now derived from userData

  const [notificationImageErrors, setNotificationImageErrors] = useState({});

  // Add a flag to track if component is mounted
  const isMounted = useRef(true);

  // Updated navItems
  const navItems = [
    { label: "Home", path: "/col-home" },
    { label: "My Work", path: "/project", hasDropdown: true },
    { label: "Financials", path: "/finance", hasDropdown: true },
  ];

  const myWorkDropdownItems = [
    { label: "All Contracts", path: "/all-contacts" },
    { label: "My Jobs", path: "/my-jobs" },
  ];

  const financialsDropdownItems = [
    { label: "Overview", path: "/finance-overview" },
    { label: "Transactions", path: "/transaction" },
  ];

  // Get dropdown items based on active dropdown
  const getDropdownItems = () => {
    if (openDropdown === "My Work") return myWorkDropdownItems;
    if (openDropdown === "Financials") return financialsDropdownItems;
    return [];
  };

  // Compute safe left position for dropdown
  const computeDropdownLeft = (width) => {
    if (typeof window === 'undefined') return dropdownPosition.left - width / 2;
    const headerRect = document.querySelector('header')?.getBoundingClientRect() || { left: 0, width: window.innerWidth };
    const left = dropdownPosition.left - width / 2;
    const min = 8;
    const max = Math.max(headerRect.width - width - 8, min);
    return Math.min(Math.max(left, min), max);
  };

  // Hide header on certain paths
  const hideHeaderPaths = [
    '/login', '/signup', '/signup-otp', '/forgot-password', '/'
  ];

  if (hideHeaderPaths.includes(location.pathname)) {
    return null;
  }

  // ❌ REMOVED: useEffect that syncs local status with context – no longer needed

  // ✅ Fetch notifications and messages when user ID is available
  useEffect(() => {
    if (userData?.id) {
      fetchNotifications(true);
      fetchUnreadMessageCount();

      notificationIntervalRef.current = setInterval(() => {
        fetchNotifications(false);
        fetchUnreadMessageCount();
      }, 10000);

      return () => {
        if (notificationIntervalRef.current) {
          clearInterval(notificationIntervalRef.current);
        }
      };
    }
  }, [userData?.id]);

  // Listen for manual refresh events from profile page
  useEffect(() => {
    const handleRefreshNotifications = () => {
      console.log("🔄 Refreshing notifications instantly...");
      if (userData?.id) {
        fetchNotifications(true);
        fetchUnreadMessageCount();
      }
    };
    
    window.addEventListener('refreshNotifications', handleRefreshNotifications);
    
    return () => {
      window.removeEventListener('refreshNotifications', handleRefreshNotifications);
    };
  }, [userData?.id]);

  // Update active tab based on location
  useEffect(() => {
    const currentItem = navItems.find(item => item.path === location.pathname);
    if (currentItem) {
      setActiveTab(currentItem.label);
    } else {
      const isMyWorkChild = myWorkDropdownItems.some(item => item.path === location.pathname);
      const isFinancialsChild = financialsDropdownItems.some(item => item.path === location.pathname);
      
      if (isMyWorkChild) {
        setActiveTab("My Work");
      } else if (isFinancialsChild) {
        setActiveTab("Financials");
      } else {
        setActiveTab("");
      }
    }
  }, [location.pathname]);

  // Close nav dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // Close Profile and Status Menu when clicking outside (desktop)
  useEffect(() => {
    const handleClickOutsideProfile = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
        setIsStatusMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutsideProfile);
    return () => {
      document.removeEventListener("click", handleClickOutsideProfile);
    };
  }, []);

  // Close mobile menus when clicking outside
  useEffect(() => {
    const handleClickOutsideMobile = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
      if (mobileProfileRef.current && !mobileProfileRef.current.contains(event.target)) {
        setIsMobileProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideMobile);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideMobile);
    };
  }, []);

  // Prevent body scroll when mobile menus are open
  useEffect(() => {
    if (isMobileMenuOpen || isMobileProfileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen, isMobileProfileOpen]);

  // Update dropdown position when scrolling or resizing
  useEffect(() => {
    if (!openDropdown) return;

    const updateDropdownPosition = () => {
      const navItem = navItemRefs.current[openDropdown];
      if (navItem) {
        const rect = navItem.getBoundingClientRect();
        const headerRect = document.querySelector('header')?.getBoundingClientRect() || { left: 0, top: 0 };
        const left = rect.left + (rect.width / 2) - headerRect.left;
        const top = rect.bottom - headerRect.top;
        setDropdownPosition({ left, top });
      }
    };

    window.addEventListener('scroll', updateDropdownPosition, true);
    window.addEventListener('resize', updateDropdownPosition);
    updateDropdownPosition();

    return () => {
      window.removeEventListener('scroll', updateDropdownPosition, true);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [openDropdown]);

  // ---- API functions ----
  const fetchNotifications = async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoadingNotifications(true);
      }
      const response = await api.get('/notifications/');

      if (response.data) {
        const formattedNotifications = response.data.map(notification => ({
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          subtitle: notification.subtitle || notification.message,
          time: notification.time || notification.created_at,
          created_at: notification.created_at,
          is_read: notification.is_read,
          url: notification.url,
          sender: notification.sender,
          job_id: notification.job_id,
          proposal_id: notification.proposal_id,
          contract_id: notification.contract_id,
          message_id: notification.message_id,
          invitation_id: notification.invitation_id,
          review_id: notification.review_id
        }));

        setNotifications(prev => {
          const oldData = JSON.stringify(prev);
          const newData = JSON.stringify(formattedNotifications);
          if (oldData === newData) {
            return prev;
          }
          return formattedNotifications;
        });

        const unread = formattedNotifications.filter(n => !n.is_read).length;
        setUnreadCount(prev => (prev === unread ? prev : unread));
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      if (showLoader) {
        setLoadingNotifications(false);
      }
    }
  };

  const fetchUnreadMessageCount = async () => {
    try {
      if (!userData?.id) return;
      const response = await api.get(`/message/unread-count?current_user_id=${userData.id}`);
      console.log("💬 ColHeader unread message count response:", response.data);
      
      if (response.data) {
        const count = response.data.count || 0;
        console.log(`💬 ColHeader setting unread message count to: ${count}`);
        setUnreadMessageCount(prev => (prev === count ? prev : count));
      }
    } catch (error) {
      console.error('❌ ColHeader error fetching unread message count:', error);
      setUnreadMessageCount(0);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');

      if (isMounted.current) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, is_read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.is_read) {
        await api.post(`/notifications/${notification.id}/read`);
      }

      setNotifications(prev =>
        prev.map(n =>
          n.id === notification.id ? { ...n, is_read: true } : n
        )
      );

      setUnreadCount(prev => Math.max(prev - 1, 0));

      setShowNotifications(false);
      setIsProfileMenuOpen(false);
      setIsStatusMenuOpen(false);
      setIsMobileMenuOpen(false);
      setIsMobileProfileOpen(false);

      if (notification.url) {
        if (notification.url.startsWith('http://') || notification.url.startsWith('https://')) {
          window.open(notification.url, '_blank');
        } else {
          navigate(notification.url);
        }
      } else {
        switch (notification.type) {
          case 'proposal_submitted':
          case 'proposal_accepted':
          case 'proposal_rejected':
          case 'proposal_pending':
            navigate('/proposalspage');
            break;
          case 'contract_updated':
            navigate('/all-contacts');
            break;
          case 'new_message':
            if (notification.message_id) {
              navigate(`/message?conversation=${notification.message_id}`);
            } else {
              navigate('/message');
            }
            break;
          case 'invitation_received':
          case 'invitation':
            navigate('/all-contacts');
            break;
          case 'subscription_updated':
            navigate('/collab-subscription');
            break;
          case 'payment_received':
            navigate('/finance-overview');
            break;
          case 'review_received':
            navigate('/Colabprofile');
            break;
          case 'system':
            if (notification.title?.toLowerCase().includes('profile')) {
              navigate('/ColabProfile');
            }
            break;
          default:
            console.log('No redirect for notification type:', notification.type);
            break;
        }
      }

    } catch (error) {
      console.error("Error handling notification click:", error);
      toast?.error("Failed to process notification");
    }
  };

  const formatNotificationTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };

  const getNotificationIcon = (notification) => {
    const getFirstLetterFromUser = (userData) => {
      if (userData?.full_name && userData.full_name.trim()) {
        return userData.full_name.charAt(0).toUpperCase();
      }
      if (userData?.email && userData.email.trim()) {
        return userData.email.charAt(0).toUpperCase();
      }
      return '?';
    };

    if (notification.sender) {
      if (notification.sender.profile_picture && !notificationImageErrors[notification.id]) {
        let imageUrl;

        if (notification.sender.profile_picture.startsWith('http://') ||
          notification.sender.profile_picture.startsWith('https://')) {
          imageUrl = notification.sender.profile_picture;
        }
        else if (notification.sender.profile_picture.startsWith('/media/')) {
          imageUrl = `${API_BASE_URL}${notification.sender.profile_picture}`;
        }
        else {
          imageUrl = `${API_BASE_URL}/media/${notification.sender.profile_picture}`;
        }

        return (
          <img
            src={imageUrl}
            alt={notification.sender.full_name || 'User'}
            className="w-6 h-6 rounded-full object-cover"
            onError={() => handleNotificationImageError(notification.id)}
          />
        );
      }

      const firstLetter = getFirstLetterFromUser(notification.sender);
      return (
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#51218F] to-[#7242B8] flex items-center justify-center text-white text-xs font-bold uppercase">
          {firstLetter}
        </div>
      );
    }

    if (userData?.profile_picture) {
      const userImageUrl = getUserImage();
      return (
        <img
          src={userImageUrl}
          alt={getUserName()}
          className="w-6 h-6 rounded-full object-cover"
          onError={(e) => {
            e.target.src = profilepic;
          }}
        />
      );
    }

    const userFirstLetter = getFirstLetterFromUser(userData);
    return (
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#51218F] to-[#7242B8] flex items-center justify-center text-white text-xs font-bold uppercase">
        {userFirstLetter}
      </div>
    );
  };

  const getFilteredNotifications = () => {
    let filtered;
    if (activeNotifyTab === "unread") {
      filtered = notifications.filter(n => !n.is_read);
    } else {
      filtered = notifications.filter(n => n.is_read);
    }
    return filtered;
  };

  const handleNavItemClick = (item, e) => {
    if (item.hasDropdown) {
      e.preventDefault();
      e.stopPropagation();

      const navItem = navItemRefs.current[item.label];
      if (navItem) {
        const rect = navItem.getBoundingClientRect();
        const headerRect = document.querySelector('header')?.getBoundingClientRect() || { left: 0, top: 0 };
        const left = rect.left + (rect.width / 2) - headerRect.left;
        const top = rect.bottom - headerRect.top;
        setDropdownPosition({ left, top });
      }

      setOpenDropdown(openDropdown === item.label ? null : item.label);
    } else {
      setActiveTab(item.label);
      navigate(item.path);
      setOpenDropdown(null);
    }
  };

  const handleDropdownArrowClick = (item, e) => {
    e.stopPropagation();

    if (item.hasDropdown) {
      const navItem = navItemRefs.current[item.label];
      if (navItem) {
        const rect = navItem.getBoundingClientRect();
        const headerRect = document.querySelector('header')?.getBoundingClientRect() || { left: 0, top: 0 };
        const left = rect.left + (rect.width / 2) - headerRect.left;
        const top = rect.bottom - headerRect.top;
        setDropdownPosition({ left, top });
      }

      setOpenDropdown(openDropdown === item.label ? null : item.label);
    }
  };

  const handleDropdownItemClick = (path) => {
    navigate(path);
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
    setIsMobileProfileOpen(false);
  };

  const setNavItemRef = (label, element) => {
    if (element) {
      navItemRefs.current[label] = element;
    }
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen((p) => !p);
    setIsStatusMenuOpen(false);
  };

  const toggleStatusMenu = (e) => {
    e.stopPropagation();
    setIsStatusMenuOpen((p) => !p);
  };

  // ✅ Updated changeStatus – uses backend status in context
  const changeStatus = async (newDisplayStatus) => {
    console.log("🔄 changeStatus called with:", newDisplayStatus);
    
    if (!userData?.id) {
      console.error("❌ No user ID available");
      toast.error("User data not loaded");
      return;
    }

    // Map display status to backend status
    const backendStatus = newDisplayStatus === "Available" ? "Active" : "Inactive";

    try {
      const response = await api.put(`/profile/update-status/${userData.id}/`, {
        status: backendStatus
      });
      
      console.log("✅ Status update response:", response.data);
      
      // Update context with the CORRECT backend status (not the display string)
      updateUserData({ status: backendStatus });
      
      setIsStatusMenuOpen(false);
      setIsProfileMenuOpen(false);
      setIsMobileProfileOpen(false);
      toast.success(`Status updated to ${newDisplayStatus}`);
      
    } catch (error) {
      console.error("❌ Error updating status:", error);
      toast.error("Failed to update status. Please try again.");
    }
  };

  const handleLogout = async () => {
    console.log("🚪 ColHeader Logout clicked");
    
    setIsProfileMenuOpen(false);
    setIsStatusMenuOpen(false);
    setIsMobileMenuOpen(false);
    setIsMobileProfileOpen(false);
    setShowNotifications(false);
    
    setLoggingOut(true);
    
    try {
      if (logout) {
        await logout();
      } else {
        console.warn("⚠️ Context logout not available, using fallback");
        try {
          await api.post("/auth/logout");
        } catch (error) {
          console.error("Logout error:", error);
        }
        if (updateUserData) {
          updateUserData(null);
        }
      }
      
      toast.success("Logout successfully!");
      
      setTimeout(() => {
        setLoggingOut(false);
        navigate("/login", { replace: true });
      }, 2000);
      
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
      toast.error("Logout failed. Please try again.");
      
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    }
  };

  const getUserName = () => {
    if (!userData) return "User";
    if (userData?.full_name) {
      return userData.full_name;
    } else if (userData?.email) {
      return userData.email.split('@')[0];
    }
    return "User";
  };

  const getDisplayName = () => {
    const fullName = getUserName();
    return fullName.length > 12 ? fullName.substring(0, 10) + '...' : fullName;
  };

  const getUserImage = () => {
    if (!userData?.profile_picture) return profilepic;

    let picture = userData.profile_picture;
    if (typeof picture === 'string') {
      if (picture.startsWith('http://') || picture.startsWith('https://')) {
        return picture;
      }
      if (picture.startsWith('/media/')) {
        return `${API_BASE_URL}${picture}`;
      }
      if (picture.startsWith('/')) {
        return `${API_BASE_URL}${picture}`;
      }
      if (picture.includes('media/')) {
        return `${API_BASE_URL}/${picture}`;
      }
      return `${API_BASE_URL}/media/${picture}`;
    }
    return profilepic;
  };

  // ✅ Derive display status from userData (single source of truth)
  const statusDisplay = userData?.status === "Active" ? "Available" : "Away";

  const filteredNotifications = getFilteredNotifications();

  // If not authenticated and not loading, don't render
  if (!userData && !loading && !location.pathname.includes('/login')) {
    return null;
  }

  return (
    <header className="w-full max-w-[1151px] h-[72px] mx-auto mt-6 flex items-center justify-between px-4 md:px-8 relative z-50">

      {/* MOBILE HAMBURGER ICON */}
      <div className="md:hidden flex items-center justify-start flex-1">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="text-white focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Left Logo */}
      <div className="flex-1 md:flex-none flex justify-center md:justify-start">
        <h1 
          className="font-bold text-[36px] md:text-[50px] leading-[100%] trochut-font bg-gradient-to-l from-[#51218F] to-[#030303] bg-clip-text text-[#030303]"
        >
          Talenta
        </h1>
      </div>

      {/* Middle Navbar (Desktop) */}
      <nav className="hidden md:flex w-[609px] 2xl:w-[1100px] h-[52px] items-center justify-between rounded-[50px] px-5 bg-[rgba(255,255,255,0.19)] backdrop-blur-[40px] relative z-50" style={{ border: "1px solid white" }}>
        {navItems.map((item) => (
          <div
            key={item.label}
            className="relative"
            ref={(el) => setNavItemRef(item.label, el)}
          >
            <div className="flex items-center">
              <button
                onClick={(e) => handleNavItemClick(item, e)}
                className={`
                  relative text-[16px] md:text-[16px] lg:text-[20px] leading-[100%] text-center poppins-font transition-all duration-300
                  py-3 px-1 z-10
                  ${activeTab === item.label
                    ? "text-[#51218F] font-bold"
                    : "text-white font-medium"
                  }
                  hover:text-[#51218F] hover:font-semibold
                `}
              >
                {item.label}
              </button>

              {item.hasDropdown && (
                <button
                  onClick={(e) => handleDropdownArrowClick(item, e)}
                  className="ml-1 focus:outline-none"
                >
                  <svg
                    className={`transition-transform duration-300 ${openDropdown === item.label ? 'rotate-180' : ''} ${activeTab === item.label ? 'text-[#51218F]' : 'text-white'} hover:text-[#51218F]`}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </nav>

      {/* Right Profile Section */}
      <div className="flex items-center gap-2 md:gap-4 flex-1 md:flex-none justify-end">
        {/* Message and Notification Icons */}
        <div className="w-auto md:w-[80px] h-[44px] flex items-center justify-between p-[10px] gap-2">
          {/* Message Icon with Badge */}
          <div
            className="w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity relative"
            onClick={() => navigate('/message')}
          >
            <img
              src={Msg}
              alt="Messages"
              className="w-full h-full object-contain"
            />
            {unreadMessageCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-medium">
                {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
              </span>
            )}
          </div>

          {/* Notification Icon with Badge */}
          <div
            className="w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <img
              src={Bell}
              alt="Notifications"
              className="w-full h-full object-contain"
            />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        </div>

        {/* Profile Button for Mobile */}
        <div className="md:hidden">
          <div
            onClick={() => setIsMobileProfileOpen(true)}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-white flex-shrink-0 cursor-pointer"
          >
            {loading ? (
              <div className="w-full h-full bg-gray-300 animate-pulse" />
            ) : (
              <img
                src={getUserImage()}
                alt={getUserName()}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = profilepic; }}
              />
            )}
          </div>
        </div>

        {/* Profile and Name Container for Desktop */}
        <div ref={profileRef} className="relative group hidden md:block">
          <div className="w-auto md:w-[140px] h-[64px] flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="text-white font-poppins font-normal text-[20px] leading-[100%] hidden sm:block max-w-[90px] truncate">
              {loading ? "Loading..." : getDisplayName()}
            </div>

            <div onClick={toggleProfileMenu} className="w-10 h-10 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-white flex-shrink-0">
              {loading ? (
                <div className="w-full h-full bg-gray-300 animate-pulse" />
              ) : (
                <img
                  src={getUserImage()}
                  alt={getUserName()}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = profilepic; }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= MOBILE MENU SLIDE PANEL (LEFT) ================= */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[9998] md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          <div
            ref={mobileMenuRef}
            className="fixed top-0 left-0 w-[280px] h-full z-[9999] md:hidden transition-transform duration-300 ease-in-out transform translate-x-0"
            style={{
              background: "linear-gradient(180deg, #51218F 0%, #020202 100%)",
              boxShadow: "4px 0 20px rgba(0,0,0,0.3)"
            }}
          >
            <div className="flex items-center justify-between p-5 border-b border-white/20">
              <h2 className="text-white text-xl font-bold">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white hover:opacity-70 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="flex flex-col p-3 gap-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.label;
                const isExpanded = openDropdown === item.label;

                return (
                  <div key={item.label} className="relative">
                    {item.hasDropdown ? (
                      <div>
                        <div
                          onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                          className={`
                            flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-200
                            ${isExpanded ? "bg-white/20" : "hover:bg-white/10"}
                          `}
                        >
                          <span className={`font-medium text-[16px] ${isActive ? "text-white font-semibold" : "text-white/90"}`}>
                            {item.label}
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? "rotate-90" : ""} text-white/70`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                        
                        {isExpanded && (
                          <div className="ml-4 mt-1 mb-2 pl-3 border-l-2 border-white/20">
                            {item.label === "My Work" &&
                              myWorkDropdownItems.map((subItem) => (
                                <div
                                  key={subItem.label}
                                  onClick={() => handleDropdownItemClick(subItem.path)}
                                  className="px-4 py-2.5 rounded-xl text-white/80 text-[14px] hover:bg-white/10 cursor-pointer transition-all duration-200"
                                >
                                  {subItem.label}
                                </div>
                              ))}
                            {item.label === "Financials" &&
                              financialsDropdownItems.map((subItem) => (
                                <div
                                  key={subItem.label}
                                  onClick={() => handleDropdownItemClick(subItem.path)}
                                  className="px-4 py-2.5 rounded-xl text-white/80 text-[14px] hover:bg-white/10 cursor-pointer transition-all duration-200"
                                >
                                  {subItem.label}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          navigate(item.path);
                          setIsMobileMenuOpen(false);
                          setActiveTab(item.label);
                        }}
                        className={`
                          px-4 py-3 rounded-xl cursor-pointer transition-all duration-200
                          ${isActive 
                            ? "bg-white/20 text-white font-semibold" 
                            : "text-white/90 hover:bg-white/10"
                          }
                        `}
                      >
                        <span className="font-medium text-[16px]">{item.label}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-white/20">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ================= MOBILE PROFILE SLIDE PANEL (RIGHT) ================= */}
      {isMobileProfileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[9998] md:hidden"
            onClick={() => setIsMobileProfileOpen(false)}
          />
          
          <div
            ref={mobileProfileRef}
            className="fixed top-0 right-0 w-[280px] h-full z-[9999] md:hidden transition-transform duration-300 ease-in-out transform translate-x-0"
            style={{
              background: "linear-gradient(180deg, #51218F 0%, #020202 100%)",
              boxShadow: "-4px 0 20px rgba(0,0,0,0.3)"
            }}
          >
            <div className="flex flex-col items-center p-6 border-b border-white/20">
              <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-white/30 mb-3">
                {loading ? (
                  <div className="w-full h-full bg-gray-300 animate-pulse" />
                ) : (
                  <img
                    src={getUserImage()}
                    alt={getUserName()}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = profilepic; }}
                  />
                )}
              </div>
              <h3 className="text-white text-lg font-semibold text-center">
                {getUserName()}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${statusDisplay === "Available" ? "bg-green-400" : "bg-yellow-400"}`}></span>
                <span className="text-white/70 text-sm">{statusDisplay}</span>
              </div>
              <button
                onClick={() => setIsMobileProfileOpen(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="flex flex-col p-3 gap-1">
              <button
                onClick={() => {
                  setIsMobileProfileOpen(false);
                  handleDropdownItemClick("/ColabProfile");
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/90 hover:bg-white/10 transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Profile</span>
              </button>

              <div className="px-4 py-2">
                <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Status</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => changeStatus("Available")}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      statusDisplay === "Available" 
                        ? "bg-green-500 text-white" 
                        : "bg-white/10 text-white/70 hover:bg-white/20"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    Available
                  </button>
                  <button
                    onClick={() => changeStatus("Away")}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      statusDisplay === "Away" 
                        ? "bg-yellow-500 text-white" 
                        : "bg-white/10 text-white/70 hover:bg-white/20"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                    Away
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsMobileProfileOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/20 transition-all duration-200 mt-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ================= COMBINED PROFILE DROPDOWN (DESKTOP) ================= */}
      {isProfileMenuOpen && (
        <div
          className="
            absolute
            right-0
            top-[74px] 
            w-[180px]
            rounded-[12px]
            overflow-hidden
            z-[60]
            py-2
          "
          style={{
            background: "linear-gradient(180deg, #7242B8 0%, #030016 100%)",
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)'
          }}
        >
          {/* Profile Button */}
          <button 
            onClick={() => handleDropdownItemClick("/ColabProfile")}
            type="button"
            className="w-full px-5 py-2.5 flex items-center gap-3 text-gray-200 hover:bg-white/10 hover:text-white transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm font-medium">View Profile</span>
          </button>

          {/* Status Section */}
          <div className="relative">
            <button
              type="button"
              onClick={toggleStatusMenu}
              className="w-full px-5 py-2.5 flex items-center justify-between text-gray-200 hover:bg-white/10 hover:text-white transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                {statusDisplay === "Available" ? (
                  <span className="w-4 h-4 rounded-full bg-green-400 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </span>
                ) : (
                  <span className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                    </svg>
                  </span>
                )}
                <span className="text-sm font-medium">{statusDisplay}</span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-300 ${isStatusMenuOpen ? 'rotate-90' : ''}`}
                fill="none"
              >
                <path d="M6 3L10 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {isStatusMenuOpen && (
              <div className="px-3 pb-2">
                <div className="rounded-xl p-1.5 bg-white/5">
                  <button
                    type="button"
                    onClick={() => changeStatus("Available")}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 mb-0.5
                      ${statusDisplay === "Available" ? 'bg-white/20 text-white font-medium' : 'text-gray-400 hover:bg-white/10'}
                    `}
                  >
                    <span className="relative">
                      <span className="w-4 h-4 rounded-full bg-green-400 flex items-center justify-center">
                        {statusDisplay === "Available" && (
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        )}
                      </span>
                      {statusDisplay === "Available" && (
                        <span className="absolute inset-0 w-4 h-4 rounded-full bg-green-400 animate-ping opacity-75"></span>
                      )}
                    </span>
                    <span className="text-sm">Available</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => changeStatus("Away")}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                      ${statusDisplay === "Away" ? 'bg-white/20 text-white font-medium' : 'text-gray-400 hover:bg-white/10'}
                    `}
                  >
                    <span className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
                      {statusDisplay === "Away" && (
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      )}
                    </span>
                    <span className="text-sm">Away</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="mx-4 my-1 border-t border-white/10"></div>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            type="button"
            className="w-full px-5 py-2.5 flex items-center gap-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </div>
      )}

      {/* ================= NOTIFICATION POPUP ================= */}
      {showNotifications && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[9998] md:hidden"
            onClick={() => setShowNotifications(false)}
          />
          
          <div
            ref={notificationRef}
            className={`
              absolute bg-white shadow-2xl z-[9999] flex flex-col overflow-hidden border border-gray-100
              md:right-4 rounded-xl
            `}
            style={{ 
              top: "74px",
              right: window.innerWidth < 768 ? "auto" : "1rem",
              left: window.innerWidth < 768 ? "50%" : "auto",
              transform: window.innerWidth < 768 ? "translateX(-50%)" : "none",
              width: window.innerWidth < 768 ? "calc(100% - 32px)" : "320px",
              maxWidth: "320px"
            }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveNotifyTab("unread")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                    activeNotifyTab === "unread"
                      ? "bg-[#51218F] text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Unread
                  {unreadCount > 0 && (
                    <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs bg-white text-[#51218F] rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveNotifyTab("read")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                    activeNotifyTab === "read"
                      ? "bg-[#51218F] text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Read
                </button>

                {activeNotifyTab === "unread" && unreadCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAllAsRead();
                    }}
                    className="ml-1 text-xs text-[#51218F] hover:text-[#7242B8] font-medium transition-colors"
                  >
                    Mark all
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowNotifications(false)}
                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: "320px" }}>
              <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                  width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: #e5e7eb;
                  border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: #d1d5db;
                }
              `}</style>

              {loadingNotifications ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#51218F] border-t-transparent"></div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  <p className="text-gray-400 text-xs font-medium">
                    No {activeNotifyTab === 'unread' ? 'new' : ''} notifications
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex items-start gap-2.5 px-4 py-2.5 cursor-pointer transition-all duration-200 group ${
                      !notification.is_read 
                        ? 'bg-purple-50/50 hover:bg-purple-100/50' 
                        : 'hover:bg-gray-50'
                    } ${index !== filteredNotifications.length - 1 ? 'border-b border-gray-50' : ''}`}
                  >
                    <div className="w-6 h-6 flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs leading-tight truncate ${
                          !notification.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                        }`}>
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <span className="w-1.5 h-1.5 bg-[#51218F] rounded-full flex-shrink-0 mt-1"></span>
                        )}
                      </div>
                      {notification.subtitle && (
                        <p className="text-[11px] text-gray-500 leading-tight mt-0.5 line-clamp-2">
                          {notification.subtitle}
                        </p>
                      )}
                      <p className="text-[10px] text-gray-400 mt-1 font-medium">
                        {formatNotificationTime(notification.time)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* My Work & Financials Dropdown (Desktop) */}
      {openDropdown && !isMobileMenuOpen && (
        <div
          ref={dropdownRef}
          className="absolute rounded-[8px] z-[9999] shadow-2xl mt-2 hidden md:block dropdown-mywork"
          style={{
            background: 'linear-gradient(180deg, rgba(81, 33, 143, 0.95) 0%, #020202 100%)',
            width: '188px',
            left: `${computeDropdownLeft(188)}px`,
            top: `${dropdownPosition.top}px`,
          }}
        >
          <div className="pt-6 pb-6 px-[15px] flex flex-col gap-[11px] h-full">
            {getDropdownItems().map((dropdownItem) => {
              const isActive = location.pathname === dropdownItem.path;
              return (
                <button
                  key={dropdownItem.label}
                  onClick={() => handleDropdownItemClick(dropdownItem.path)}
                  className={`
                    w-[158px] px-2 py-1 rounded
                    font-outfit font-normal text-[18px] leading-[100%] text-left 
                    transition-all duration-200
                    ${isActive
                      ? "bg-white text-black"
                      : "text-white hover:bg-white hover:text-black"
                    }
                  `}
                >
                  {dropdownItem.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

    </header>
  );
};

export default ColHeader;