import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Bell from "../assets/AfterSign/Bell.png";
import Msg from "../assets/AfterSign/Msg.png";
import Profile from "../assets/Landing/Card3.png";
import { useUser } from "../contexts/UserContext";
import api from "../utils/axiosConfig";
import { formatDistanceToNow } from 'date-fns';
import toast from "../component/Toast";

const Header = ({ variant = "default" }) => {
  // ========== HOOKS ==========
  const location = useLocation();
  const navigate = useNavigate();
  const { userData, loading, updateUserData, logout } = useUser();

  const dropdownRef = useRef();
  const navItemRefs = useRef({});
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileProfileRef = useRef(null);
  const notificationIntervalRef = useRef(null);

  // ========== LOCAL STATE ==========
  const [activeTab, setActiveTab] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeNotifyTab, setActiveNotifyTab] = useState("unread");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  // Removed local status state – now derived from userData
  const [imageError, setImageError] = useState(false);
  const [notificationImageErrors, setNotificationImageErrors] = useState({});

  // ========== DERIVED ==========
  const isLightVariant = variant === "light";
  const isFinderProfile = location.pathname.startsWith('/finder-profile/');
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Derive display status from userData (single source of truth)
  const statusDisplay = userData?.status === "Active" ? "Available" : "Away";

  // ========== HELPERS ==========
  const getFullName = () => {
    if (userData?.full_name) return userData.full_name;
    if (userData?.email) return userData.email.split('@')[0];
    return "User";
  };

  const getDisplayName = () => {
    const name = getFullName();
    return name.length > 12 ? name.substring(0, 10) + '...' : name;
  };

  const getUserImage = () => {
    if (imageError) return Profile;
    if (!userData?.profile_picture) return Profile;

    let picture = userData.profile_picture;
    if (typeof picture === 'string') {
      // Google image URL
      if (picture.includes('googleusercontent.com')) {
        try {
          let decoded = decodeURIComponent(picture);
          decoded = decoded.replace(/^media\//, '');
          if (decoded.startsWith('https:')) return decoded;
          if (decoded.includes('googleusercontent.com')) {
            return `https://${decoded.replace(/^https?:\/\//, '')}`;
          }
        } catch (e) {
          console.error("Error decoding Google URL:", e);
        }
      }

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
    return Profile;
  };

  const handleImageError = () => setImageError(true);
  const retryImageLoad = () => setImageError(false);

  // ========== NAVIGATION ==========
  const navItems = [
    { label: "Home", path: "/home" },
    { label: "Find Collaborator", path: "/user-list" },
    { label: "My Project", path: "/project", hasDropdown: true },
    { label: "Financials", path: "/choose-payment" },
  ];

  const projectDropdownItems = [
    { label: "All Contracts", path: "/activecontracts" },
    { label: "Proposal", path: "/proposalspage" },
    { label: "Hired freelancers", path: "/hiredfreelancers" },
  ];

  const hideHeaderPaths = [
    '/creator-profile', '/signup', '/signup-otp',
    '/my-jobs', '/all-contacts', '/ux', '/Uploadux', '/Proposal',
    '/message', '/collabration', '/collabration-filter', '/collabration-recent',
    '/collabration-saved', '/', '/login', '/forgot-password'
  ];

  if (hideHeaderPaths.includes(location.pathname)) return null;

  // ========== EFFECTS ==========

  // 🔹 REMOVED: useEffect that synced local status with context – no longer needed

  // Fetch notifications & messages when user ID is available
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

  // Update active tab based on route
  useEffect(() => {
    const homePaths = ['/home', '/created', '/job-created', '/subscription', '/my-projects'];
    const findCollaboratorPaths = ['/user-list'];
    const myProjectPaths = ['/project', '/activecontracts', '/awaitingcontracts', '/pendingcontracts', '/completedcontracts', '/hiredfreelancers', '/pendingstatuscontracts', '/editwork', "/proposalspage"];
    const financialsPaths = ['/choose-payment'];

    const currentPath = location.pathname;

    if (homePaths.includes(currentPath)) {
      setActiveTab("Home");
    } else if (findCollaboratorPaths.includes(currentPath)) {
      setActiveTab("Find Collaborator");
    } else if (myProjectPaths.includes(currentPath)) {
      setActiveTab("My Project");
    } else if (financialsPaths.includes(currentPath)) {
      setActiveTab("Financials");
    } else {
      const currentItem = navItems.find(item => item.path === currentPath);
      if (currentItem) {
        setActiveTab(currentItem.label);
      } else {
        const isProjectChild = projectDropdownItems.some(item => item.path === currentPath);
        if (isProjectChild) setActiveTab("My Project");
      }
    }
  }, [location.pathname]);

  // Click‑outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutsideNotification = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideNotification);
    return () => document.removeEventListener("mousedown", handleClickOutsideNotification);
  }, []);

  useEffect(() => {
    const handleClickOutsideProfile = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
        setIsStatusMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutsideProfile);
    return () => document.removeEventListener("click", handleClickOutsideProfile);
  }, []);

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
    return () => document.removeEventListener("mousedown", handleClickOutsideMobile);
  }, []);

  // Prevent body scroll when mobile panels are open
  useEffect(() => {
    if (isMobileMenuOpen || isMobileProfileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen, isMobileProfileOpen]);

  // ========== API FUNCTIONS ==========

  const fetchNotifications = async (showLoader = false) => {
    try {
      if (showLoader) setLoadingNotifications(true);
      const response = await api.get('/notifications/');
      if (response.data) {
        const formatted = response.data.map(n => ({
          id: n.id,
          type: n.type || 'system',
          title: n.title || 'Notification',
          message: n.message || '',
          subtitle: n.subtitle || n.message || '',
          time: n.time || n.created_at || new Date().toISOString(),
          created_at: n.created_at,
          is_read: n.is_read || false,
          url: n.url || null,
          sender: n.sender || null,
          job_id: n.job_id || null,
          proposal_id: n.proposal_id || null,
          contract_id: n.contract_id || null,
          message_id: n.message_id || null,
          invitation_id: n.invitation_id || null,
          review_id: n.review_id || null
        }));
        setNotifications(formatted);
        const unread = formatted.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      if (showLoader) setLoadingNotifications(false);
    }
  };

  const fetchUnreadMessageCount = async () => {
    try {
      const response = await api.get(`/message/unread-count?current_user_id=${userData.id}`);
      if (response.data) {
        setUnreadMessageCount(response.data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread message count:', error);
      setUnreadMessageCount(0);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.post(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.is_read) {
        await api.post(`/notifications/${notification.id}/read`);
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(prev - 1, 0));
      }

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
          case 'system':
          case 'proposal_submitted':
          case 'proposal_accepted':
          case 'proposal_rejected':
          case 'proposal_pending':
            navigate('/proposalspage');
            break;
          case 'profile_updated':
            navigate('/creator-edit-profile');
            break;
          case 'contract_updated':
            navigate('/activecontracts');
            break;
          case 'new_message':
            navigate(`/message?conversation=${notification.message_id}`);
            break;
          case 'invitation_received':
            navigate('/all-contacts');
            break;
          case 'subscription_updated':
            navigate('/subscription');
            break;
          case 'payment_received':
            navigate('/choose-payment');
            break;
          case 'review_received':
            navigate('/reviews');
            break;
          default:
            break;
        }
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
      toast?.error("Failed to process notification");
    }
  };

  const formatNotificationTime = (timestamp) => {
    if (!timestamp) return "recently";
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  const getFilteredNotifications = () => {
    if (activeNotifyTab === "unread") {
      return notifications.filter(n => !n.is_read);
    } else {
      return notifications.filter(n => n.is_read);
    }
  };

  // ========== STATUS & LOGOUT ==========

  const changeStatus = async (newDisplayStatus) => {
    if (!userData?.id) {
      toast.error("User data not loaded");
      return;
    }

    // Map display status to backend status
    const backendStatus = newDisplayStatus === "Available" ? "Active" : "Inactive";

    try {
      await api.put(`/profile/update-status/${userData.id}/`, { status: backendStatus });
      
      // Update context with the CORRECT backend status (not the display string)
      updateUserData({ status: backendStatus });
      
      setIsStatusMenuOpen(false);
      setIsProfileMenuOpen(false);
      setIsMobileProfileOpen(false);
      toast.success(`Status updated to ${newDisplayStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    setIsStatusMenuOpen(false);
    setIsMobileMenuOpen(false);
    setIsMobileProfileOpen(false);
    setShowNotifications(false);
    await logout(); // use context logout
    toast.success("Logout successfully!");
    navigate("/login", { replace: true });
  };

  // ========== NOTIFICATION ICON RENDERER ==========

  const handleNotificationImageError = (notificationId) => {
    setNotificationImageErrors(prev => ({ ...prev, [notificationId]: true }));
  };

  const getNotificationIcon = (notification) => {
    const getFirstLetterFromUser = (user) => {
      if (user.full_name?.trim()) return user.full_name.charAt(0).toUpperCase();
      if (user.email?.trim()) return user.email.charAt(0).toUpperCase();
      return '?';
    };
    const getProfilePictureUrl = (user) => {
      if (!user?.profile_picture) return null;
      let imageUrl = user.profile_picture;
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
      }
      if (imageUrl.startsWith('/media/')) {
        return `${API_BASE_URL}${imageUrl}`;
      }
      return `${API_BASE_URL}/media/${imageUrl}`;
    };

    if (notification.sender) {
      if (notification.sender.profile_picture && !notificationImageErrors[notification.id]) {
        const imageUrl = getProfilePictureUrl(notification.sender);
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

    if (userData?.profile_picture && !imageError) {
      return (
        <img
          src={getUserImage()}
          alt={getFullName()}
          className="w-6 h-6 rounded-full object-cover"
          onError={handleImageError}
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

  // ========== EVENT HANDLERS ==========

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(p => !p);
    setIsStatusMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const toggleStatusMenu = (e) => {
    e.stopPropagation();
    setIsStatusMenuOpen(p => !p);
  };

  const toggleMobileDropdown = (label) => {
    setOpenDropdown(prev => prev === label ? null : label);
  };

  const handleNavItemClick = (item, e) => {
    if (item.hasDropdown) {
      e.preventDefault();
      e.stopPropagation();
      setOpenDropdown(prev => prev === item.label ? null : item.label);
    } else {
      setActiveTab(item.label);
      navigate(item.path);
      setOpenDropdown(null);
    }
  };

  const handleDropdownArrowClick = (item, e) => {
    e.stopPropagation();
    setOpenDropdown(prev => prev === item.label ? null : item.label);
  };

  const handleDropdownItemClick = (path) => {
    navigate(path);
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
    setIsMobileProfileOpen(false);
  };

  const setNavItemRef = (label, element) => {
    if (element) navItemRefs.current[label] = element;
  };

  // ========== RENDER ==========

  const filteredNotifications = getFilteredNotifications();

  return (
    <header className="w-full max-w-[1251px] h-[72px] mx-auto mt-6 flex items-center justify-between px-4 md:px-8 relative z-50">
      {/* Mobile Hamburger */}
      <div className="md:hidden flex items-center justify-start flex-1">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className={isLightVariant ? "text-gray-800 focus:outline-none" : "text-white focus:outline-none"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {/* Logo */}
      <div className="flex-1 md:flex-none flex justify-center md:justify-start">
        <h1 className="font-bold text-[24px] sm:text-[28px] md:text-[32px] lg:text-[40px] xl:text-[50px] leading-[100%] trochut-font bg-gradient-to-l from-[#51218F] to-[#030303] bg-clip-text text-transparent whitespace-nowrap">
          Talenta
        </h1>
      </div>

      {/* Desktop Nav */}
      <nav className={`hidden md:flex w-auto lg:w-[609px] h-[52px] items-center justify-between rounded-[50px] px-2 lg:px-5 relative z-50 ${isLightVariant ? 'bg-white/90 backdrop-blur-[40px] border border-gray-200' : 'bg-[rgba(255,255,255,0.19)] backdrop-blur-[40px] border border-white'}`}>
        {navItems.map((item) => (
          <div key={item.label} className="relative" ref={(el) => setNavItemRef(item.label, el)}>
            <div className="flex items-center whitespace-nowrap">
              <button
                onClick={(e) => handleNavItemClick(item, e)}
                className={`
                  relative text-[13px] sm:text-[14px] md:text-[13px] lg:text-[16px] xl:text-[18px] leading-[100%] text-center poppins-font transition-all duration-300
                  py-2 px-1 z-10 whitespace-nowrap
                  ${activeTab === item.label
                    ? "text-[#51218F] font-bold"
                    : (isLightVariant ? "text-gray-700 font-medium" : "text-white font-medium")
                  }
                  hover:text-[#51218F]
                `}
              >
                {item.label}
              </button>
              {item.hasDropdown && (
                <button
                  onClick={(e) => handleDropdownArrowClick(item, e)}
                  className="ml-0.5 lg:ml-1 focus:outline-none"
                >
                  <svg
                    className={`transition-transform duration-300 ${openDropdown === item.label ? 'rotate-180' : ''} ${activeTab === item.label ? 'text-[#51218F]' : (isLightVariant ? 'text-gray-700' : 'text-white')} hover:text-[#51218F]`}
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              )}
            </div>

            {item.label === 'My Project' && openDropdown === 'My Project' && !isMobileMenuOpen && (
              <div
                ref={dropdownRef}
                className="absolute left-1/2 transform -translate-x-1/2 mt-2 rounded-[8px] z-[9999] shadow-2xl hidden md:block min-w-[140px] lg:min-w-[160px]"
                style={{
                  background: isFinderProfile
                    ? 'rgba(255, 255, 255, 0.98)'
                    : isLightVariant
                      ? 'rgba(255, 255, 255, 0.95)'
                      : 'linear-gradient(180deg, rgba(81, 33, 143, 0.95) 0%, #020202 100%)',
                  backdropFilter: (isFinderProfile || isLightVariant) ? 'blur(8px)' : 'none',
                  border: isFinderProfile
                    ? '1px solid rgba(209, 213, 219, 0.8)'
                    : isLightVariant
                      ? '1px solid rgba(81, 33, 143, 0.2)'
                      : 'none',
                  boxShadow: isFinderProfile
                    ? '0 4px 20px rgba(0,0,0,0.1)'
                    : isLightVariant
                      ? '0 4px 20px rgba(0,0,0,0.15)'
                      : 'none'
                }}
              >
                <div className="py-3 lg:py-4 px-2 lg:px-3 flex flex-col gap-1 lg:gap-2">
                  {projectDropdownItems.map((dropdownItem) => {
                    const isActive = location.pathname === dropdownItem.path;
                    return (
                      <button
                        key={dropdownItem.label}
                        onClick={() => handleDropdownItemClick(dropdownItem.path)}
                        className={`
                          px-2 lg:px-3 py-1.5 rounded whitespace-nowrap
                          font-outfit font-normal text-[12px] lg:text-[14px] xl:text-[16px] leading-[100%] text-left 
                          transition-all duration-200
                          ${isActive
                            ? "bg-[#51218F] text-white"
                            : (isFinderProfile || isLightVariant
                                ? "text-gray-700 hover:bg-gray-200"
                                : "text-white hover:bg-white hover:text-black"
                              )
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
          </div>
        ))}
      </nav>

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-3 lg:gap-4 flex-1 md:flex-none justify-end">
        <div className="w-auto md:w-[70px] lg:w-[80px] h-[40px] lg:h-[44px] flex items-center justify-between p-[8px] lg:p-[10px] gap-1 lg:gap-2">
          <div
            className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 cursor-pointer hover:opacity-80 transition-opacity relative"
            onClick={() => navigate('/message')}
          >
            <img src={Msg} alt="Messages" className="w-full h-full object-contain" />
            {unreadMessageCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] lg:text-[10px] rounded-full min-w-[14px] h-[14px] lg:min-w-[16px] lg:h-[16px] flex items-center justify-center px-1 font-medium">
                {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
              </span>
            )}
          </div>

          <div
            className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 cursor-pointer hover:opacity-80 transition-opacity relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <img src={Bell} alt="Notifications" className="w-full h-full object-contain" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] lg:text-[10px] rounded-full min-w-[14px] h-[14px] lg:min-w-[16px] lg:h-[16px] flex items-center justify-center px-1 font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        </div>

        {/* Mobile Profile Trigger */}
        <div className="md:hidden">
          <div
            onClick={() => setIsMobileProfileOpen(true)}
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-white flex-shrink-0 cursor-pointer"
          >
            {loading ? (
              <div className="w-full h-full bg-gray-300 animate-pulse" />
            ) : (
              <img
                src={getUserImage()}
                alt={getFullName()}
                className="w-full h-full object-cover"
                onError={handleImageError}
                onLoad={retryImageLoad}
              />
            )}
          </div>
        </div>

        {/* Desktop Profile */}
        <div ref={profileRef} className="relative group hidden md:block">
          <div className="w-auto md:w-[120px] lg:w-[140px] h-[56px] lg:h-[64px] flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className={`font-poppins font-normal text-[13px] md:text-[14px] lg:text-[18px] xl:text-[20px] leading-[100%] hidden sm:block max-w-[70px] md:max-w-[80px] lg:max-w-[90px] truncate ${isLightVariant ? 'text-gray-800' : 'text-white'}`}>
              {loading ? "Loading..." : getDisplayName()}
            </div>
            <div onClick={toggleProfileMenu} className="w-8 h-8 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 rounded-full overflow-hidden border-2 border-white flex-shrink-0">
              {loading ? (
                <div className="w-full h-full bg-gray-300 animate-pulse" />
              ) : (
                <img
                  src={getUserImage()}
                  alt={getFullName()}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                  onLoad={retryImageLoad}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[9998] md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
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
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:opacity-70">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
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
                          onClick={() => toggleMobileDropdown(item.label)}
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
                            {projectDropdownItems.map((subItem) => (
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
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Mobile Profile Panel */}
      {isMobileProfileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[9998] md:hidden" onClick={() => setIsMobileProfileOpen(false)} />
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
                    alt={getFullName()}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                )}
              </div>
              <h3 className="text-white text-lg font-semibold text-center">{getFullName()}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${statusDisplay === "Available" ? "bg-green-400" : "bg-yellow-400"}`} />
                <span className="text-white/70 text-sm">{statusDisplay}</span>
              </div>
              <button onClick={() => setIsMobileProfileOpen(false)} className="absolute top-4 right-4 text-white/70 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col p-3 gap-1">
              <button
                onClick={() => {
                  setIsMobileProfileOpen(false);
                  navigate("/creator-edit-profile");
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/90 hover:bg-white/10 transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
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
                    <span className="w-2 h-2 rounded-full bg-green-400" />
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
                    <span className="w-2 h-2 rounded-full bg-yellow-400" />
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
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Desktop Combined Profile & Status Dropdown */}
      {isProfileMenuOpen && (
        <div
          className="absolute right-0 top-[74px] w-[180px] rounded-[12px] overflow-hidden z-[60] py-2"
          style={{
            background: isFinderProfile
              ? 'rgba(255, 255, 255, 0.98)'
              : 'linear-gradient(180deg, #7242B8 0%, #030016 100%)',
            backdropFilter: isFinderProfile ? 'blur(20px)' : 'none',
            border: isFinderProfile
              ? '1px solid rgba(209, 213, 219, 0.3)'
              : '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: isFinderProfile
              ? '0 20px 40px rgba(0,0,0,0.08)'
              : '0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)'
          }}
        >
          <button
            onClick={() => {
              navigate("/creator-edit-profile");
              setIsProfileMenuOpen(false);
            }}
            className={`w-full px-5 py-2.5 flex items-center gap-3 transition-all duration-200 ${
              isFinderProfile || isLightVariant
                ? 'text-gray-700 hover:bg-gray-200'
                : 'text-gray-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm font-medium">View Profile</span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={toggleStatusMenu}
              className={`
                w-full px-5 py-2.5 flex items-center justify-between transition-all duration-200
                ${isFinderProfile || isLightVariant 
                  ? 'text-gray-700 hover:bg-gray-200' 
                  : 'text-gray-200 hover:bg-white/10 hover:text-white'
                }
              `}
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
                className={`w-3.5 h-3.5 transition-transform duration-300 ${isStatusMenuOpen ? 'rotate-90' : ''} ${isFinderProfile || isLightVariant ? 'text-gray-400' : 'text-gray-500'}`}
                fill="none"
              >
                <path d="M6 3L10 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Status Sub-options */}
            {isStatusMenuOpen && (
              <div className="px-3 pb-2">
                <div className={`rounded-xl p-1.5 ${isFinderProfile || isLightVariant ? 'bg-gray-50' : 'bg-white/5'}`}>
                  <button
                    type="button"
                    onClick={() => changeStatus("Available")}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 mb-0.5
                      ${statusDisplay === "Available"
                        ? (isFinderProfile || isLightVariant ? 'bg-white shadow-sm text-gray-900 font-medium' : 'bg-white/20 text-white font-medium')
                        : (isFinderProfile || isLightVariant ? 'text-gray-600 hover:bg-white/50' : 'text-gray-400 hover:bg-white/10')
                      }
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
                      ${statusDisplay === "Away"
                        ? (isFinderProfile || isLightVariant ? 'bg-white shadow-sm text-gray-900 font-medium' : 'bg-white/20 text-white font-medium')
                        : (isFinderProfile || isLightVariant ? 'text-gray-600 hover:bg-white/50' : 'text-gray-400 hover:bg-white/10')
                      }
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

          <div className={`mx-4 my-1 border-t ${isFinderProfile || isLightVariant ? 'border-gray-100' : 'border-white/10'}`} />

          <button
            onClick={handleLogout}
            className={`w-full px-5 py-2.5 flex items-center gap-3 transition-all duration-200 ${
              isFinderProfile || isLightVariant
                ? 'text-red-500 hover:bg-red-50 hover:text-red-600'
                : 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </div>
      )}

      {/* Notification Popup */}
      {showNotifications && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[9998] md:hidden" onClick={() => setShowNotifications(false)} />
          <div
            ref={notificationRef}
            className={`
              absolute bg-white shadow-2xl z-[9999] flex flex-col overflow-hidden border border-gray-100
              md:right-4 w-[320px] rounded-xl
              mobile-notification-popup
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
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white flex-shrink-0 flex-wrap md:flex-nowrap gap-2">
              <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                <button
                  onClick={() => setActiveNotifyTab("unread")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 whitespace-nowrap ${
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
                  onClick={() => setActiveNotifyTab("read")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 whitespace-nowrap ${
                    activeNotifyTab === "read"
                      ? "bg-[#51218F] text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Read
                </button>
                {activeNotifyTab === "unread" && unreadCount > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                    className="ml-1 text-xs text-[#51218F] hover:text-[#7242B8] font-medium transition-colors whitespace-nowrap"
                  >
                    Mark all
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: "320px" }}>
              <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
              `}</style>
              {loadingNotifications ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#51218F] border-t-transparent" />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
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
                        <p className={`text-xs leading-tight truncate ${!notification.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <span className="w-1.5 h-1.5 bg-[#51218F] rounded-full flex-shrink-0 mt-1" />
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
    </header>
  );
};

export default Header;