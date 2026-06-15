import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../../utils/axiosConfig";
import { toast } from "react-hot-toast"
import { Loader } from 'lucide-react';
import sidebarBg from "../../assets/Adminimages/sidebar.png";
import {
  LayoutGrid, User, Ticket, LineChart, Settings,
  LogOut, Users, BookMarked, CheckCircle2, Contact,
  ChevronDown, TrendingUp, Bell, Menu, X
} from 'lucide-react';
import c1 from "../../assets/Adminimages/c1.png";
import c2 from "../../assets/Adminimages/c2.png";
import c3 from "../../assets/Adminimages/c3.png";
import c4 from "../../assets/Adminimages/c4.png";
import c5 from "../../assets/Adminimages/c5.png";
import topProfile from "../../assets/Adminimages/topprofile.png";
import logoutpic from "../../assets/Adminimages/logoutpic.png";
import UserPage from './User';
import SubscriptionPage from './AdminSubscription';
import Analytics from './Analytics';
import Setting from './Setting';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [progressView, setProgressView] = useState("month"); // "month" | "week"

  // API Data States - All initialized with empty/default values
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_users: 0,
    active_projects: 0,
    completed_tasks: 0,
    total_revenue: 0
  });

  const [progressChartData, setProgressChartData] = useState({
    labels: [],
    data: []
  });

  const [revenueChartData, setRevenueChartData] = useState({
    labels: [],
    data: []
  });

  const [projectStatus, setProjectStatus] = useState({
    completed: 0,
    on_hold: 0,
    in_progress: 0,
    total: 0
  });
  const [profileImage, setProfileImage] = useState(null);
  // Fetch admin profile (including profile image)
  const fetchAdminProfile = async () => {
    try {
      const response = await api.get('/admin/profile', {
        headers: { user_id: adminId }
      });

      // Get first name, or full name if first name is empty
      let displayName = response.data.first_name || "";

      // If first name is empty, try to get from full name
      if (!displayName && response.data.full_name) {
        displayName = response.data.full_name.split(' ')[0] || "Admin";
      }

      // If still empty, use "Admin"
      if (!displayName) {
        displayName = "Admin";
      }

      setAdminName(displayName);

      // Set profile image if exists
      if (response.data.profile_image) {
        setProfileImage(response.data.profile_image);
      } else {
        setProfileImage(null);
      }

    } catch (error) {
      console.error("Error fetching profile:", error);
      setAdminName("Admin");
    }
  };

  // Function to refresh profile from settings component
  const refreshProfileImage = async () => {
    await fetchAdminProfile();
  };

  // Make it available to child components via window
  useEffect(() => {
    window.refreshProfileImage = refreshProfileImage;

    return () => {
      delete window.refreshProfileImage;
    };
  }, []);

  const [progressData, setProgressData] = useState({
    allTask: 0,
    done: 0,
    inProgress: 0
  });

  const [activeProjects, setActiveProjects] = useState([]);

  const [revenueFilter, setRevenueFilter] = useState("yearly");
  const [projectStatusTimeRange, setProjectStatusTimeRange] = useState("today");
  const [revenueGrowth, setRevenueGrowth] = useState(0);
  const [progressGrowth, setProgressGrowth] = useState(0);

  const [adminName, setAdminName] = useState("");

  // Track theme locally
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") return true;
    if (savedTheme === "light") return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Get adminId from localStorage
  const adminId = localStorage.getItem("adminId");

  const handleNavigation = (viewName) => {
    setCurrentView(viewName);
    setIsSidebarOpen(false);
  };

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/admin/dashboard/stats', {
        headers: { user_id: adminId }
      });

      setStats({
        total_users: response.data.total_users || 0,
        active_projects: response.data.active_projects || 0,
        completed_tasks: response.data.completed_tasks || 0,
        total_revenue: response.data.total_revenue || 0
      });

    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load dashboard statistics");
    }
  };

  // Fetch revenue chart data
  const fetchRevenueChartData = async (filter = revenueFilter) => {
    try {
      const response = await api.get('/admin/dashboard/charts/revenue', {
        params: { filter },
        headers: { user_id: adminId }
      });

      setRevenueChartData({
        labels: response.data.labels || [],
        data: response.data.data || []
      });

      // Calculate growth percentage
      const growth = response.data.growth_percentage || 0;
      setRevenueGrowth(growth);

    } catch (error) {
      console.error("Error fetching revenue chart:", error);
    }
  };

  // Fetch project status
  const fetchProjectStatus = async (timeRange = projectStatusTimeRange) => {
    try {
      const response = await api.get('/admin/dashboard/charts/project-status', {
        params: { time_range: timeRange },
        headers: { user_id: adminId }
      });

      setProjectStatus({
        completed: response.data.completed || 0,
        on_hold: response.data.on_hold || 0,
        in_progress: response.data.in_progress || 0,
        total: response.data.total || 0
      });

    } catch (error) {
      console.error("Error fetching project status:", error);
    }
  };

  // Fetch progress data
  const fetchProgressData = async (view = progressView) => {
    try {
      const response = await api.get('/admin/dashboard/charts/progress', {
        params: { filter: view },
        headers: { user_id: adminId }
      });

      setProgressChartData({
        labels: response.data.labels || [],
        data: response.data.data || []
      });

      setProgressData({
        allTask: response.data.all_task || 0,
        done: response.data.done || 0,
        inProgress: response.data.in_progress || 0
      });

      const growth = response.data.growth_percentage || 0;
      setProgressGrowth(growth);

    } catch (error) {
      console.error("Error fetching progress data:", error);
    }
  };

  // Fetch active projects
  const fetchActiveProjects = async () => {
    try {
      const response = await api.get('/admin/dashboard/active-projects', {
        headers: { user_id: adminId }
      });

      // Map API data to component format with images
      const mappedProjects = response.data.map((project, index) => ({
        name: project.client_name || "Unknown",
        id: project.client_id || `ID-${index + 1}`,
        project: project.project_title || "Untitled",
        price: project.price ? `$${project.price}` : "$0",
        time: project.delivered_in || "N/A",
        progress: `${project.progress || 0}%`,
        img: getProfileImage(index)
      }));

      setActiveProjects(mappedProjects);

    } catch (error) {
      console.error("Error fetching active projects:", error);
    }
  };

  // Helper for profile images (cycling through available images)
  const getProfileImage = (index) => {
    const images = [c1, c2, c3, c4, c5];
    return images[index % images.length];
  };

  // Handle revenue filter change
  const handleRevenueFilterChange = async (filter) => {
    setRevenueFilter(filter);
    await fetchRevenueChartData(filter);
  };

  // Handle progress view change
  const handleProgressViewChange = async (view) => {
    setProgressView(view);
    await fetchProgressData(view);
  };

  // Handle project status time range change
  const handleProjectStatusTimeRangeChange = async (timeRange) => {
    setProjectStatusTimeRange(timeRange);
    await fetchProjectStatus(timeRange);
  };

  // Load all dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchRevenueChartData(),
        fetchProjectStatus(),
        fetchProgressData(),
        fetchActiveProjects(),
        fetchAdminProfile()
      ]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Theme management
  useEffect(() => {
    const applyTheme = () => {
      const savedTheme = localStorage.getItem("theme");
      const isDark = savedTheme === "dark" ||
        (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);

      setIsDarkMode(isDark);

      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    applyTheme();

    const handleThemeChange = () => applyTheme();
    window.addEventListener("theme-change", handleThemeChange);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (!localStorage.getItem("theme")) {
        applyTheme();
      }
    };
    mediaQuery.addEventListener('change', handleSystemChange);

    return () => {
      window.removeEventListener("theme-change", handleThemeChange);
      mediaQuery.removeEventListener('change', handleSystemChange);
    };
  }, []);

  // Check login and load data on mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
    const adminId = localStorage.getItem("adminId");

    if (!isLoggedIn || !adminId) {
      toast.error("Please login to access dashboard");
      navigate("/");
      return;
    }

    loadDashboardData();
  }, []);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminId");
    localStorage.removeItem("adminEmail");
    toast.success("Logged out successfully");
    navigate("/");
  };

  // Sidebar link class
  const getSidebarLinkClass = (viewName) => {
    const isActive = currentView === viewName;

    return `
      flex items-center gap-3 px-4 py-3 rounded-full cursor-pointer transition-all duration-200
      ${isActive
        ? "bg-[#3b0764] text-white font-medium"
        : isDarkMode
          ? "text-white/80 hover:bg-white/10 hover:text-white"
          : "text-black/80 hover:bg-black/10 hover:text-black"
      }
    `;
  };

  return (
    <div className={`h-screen flex overflow-hidden ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* ================= SIDEBAR ================= */}
      <div className="relative">
        {/* Logo */}
        <div className="absolute top-0 left-0 z-50 w-[260px] px-6 py-6">
          <h1
            className={`
              font-bold trochut-font cursor-pointer
              text-[24px] md:text-[34px] leading-[100%]
              ${isDarkMode ? 'text-white' : 'text-[#3D1768]'}
            `}
            onClick={() => handleNavigation("dashboard")}
          >
            Talenta
          </h1>
        </div>

        <aside
          className={`fixed inset-y-0 left-0 z-40 w-[260px] pt-20 flex flex-col justify-between
            transform transition-transform duration-300
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 lg:static lg:h-screen`}
          style={{
            backgroundImage: `url(${sidebarBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          {/* Dark Mode Overlay */}
          {isDarkMode && (
            <div className="absolute inset-0 bg-black/70 z-0" />
          )}

          {/* Glass Overlay */}
          <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" />

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full">
            {/* Close button for mobile */}
            <button
              className="lg:hidden absolute top-4 right-4 text-white"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={24} />
            </button>

            {/* MENU */}
            <div className="px-4 py-6 flex-1 overflow-y-auto mt-8">
              <nav className="space-y-2">
                <div onClick={() => handleNavigation("dashboard")} className={getSidebarLinkClass("dashboard")}>
                  <LayoutGrid size={20} /> Dashboard
                </div>
                <div onClick={() => handleNavigation("users")} className={getSidebarLinkClass("users")}>
                  <User size={20} /> Users
                </div>
                <div onClick={() => handleNavigation("subscription")} className={getSidebarLinkClass("subscription")}>
                  <Ticket size={20} /> Subscription
                </div>
                <div onClick={() => handleNavigation("analytics")} className={getSidebarLinkClass("analytics")}>
                  <LineChart size={20} /> Analytics
                </div>
                <div onClick={() => handleNavigation("setting")} className={getSidebarLinkClass("setting")}>
                  <Settings size={20} /> Settings
                </div>
              </nav>
            </div>

            {/* LOGOUT */}
            <div
              onClick={() => setShowLogoutPopup(true)}
              className="px-6 py-4 text-red-400 cursor-pointer mb-20 hover:bg-white/10 flex items-center gap-3 transition-colors"
            >
              <LogOut className="rotate-180" size={20} /> Log Out
            </div>
          </div>
        </aside>
      </div>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ================= TOP HEADER ================= */}
        <header className={`sticky top-0 z-30 h-[80px] px-4 lg:px-8 flex items-center justify-between shrink-0
          ${isDarkMode ? 'bg-black/90 backdrop-blur-sm border-b border-white/10' : 'bg-white/90 backdrop-blur-sm border-b border-black/10'}`}>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} className={isDarkMode ? 'text-white' : 'text-black'} />
          </button>

          {/* Welcome message - visible on mobile */}
          <div className="lg:hidden flex items-center">
            <span className={`text-sm font-medium ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>
              Dashboard
            </span>
          </div>

          {/* Profile section */}
          <div className="flex items-center gap-4 ml-auto">
            <button className="relative p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
              <Bell size={20} className={isDarkMode ? 'text-white' : 'text-black'} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3">
              <span className="font-medium hidden sm:inline">
                {adminName || "Admin"}
              </span>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500/30">
                <img
                  src={profileImage || topProfile}
                  className="w-full h-full object-cover"
                  alt="Profile"
                  onError={(e) => {
                    e.target.src = topProfile; // Fallback to default if image fails to load
                  }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* ================= SCROLLABLE CONTENT AREA ================= */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6">
          {/* Loading State */}
          {loading && currentView === "dashboard" && (
            <div className="flex items-center justify-center h-64">
              <Loader size={40} className="animate-spin text-purple-600" />
            </div>
          )}

          {/* Dashboard Content */}
          {!loading && currentView === "dashboard" && (
            <>
              {/* Welcome message */}
              <div className="flex-1 lg:pl-4 mb-6">
                <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
                  Welcome back, {adminName || "Admin"} 👋
                </h1>
              </div>

              {/* ================= STATS CARDS ================= */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  { label: "Total Users", value: stats.total_users.toLocaleString(), icon: <Users size={26} /> },
                  { label: "Active Projects", value: stats.active_projects.toString(), icon: <BookMarked size={26} /> },
                  { label: "Completed Task", value: stats.completed_tasks.toString(), icon: <CheckCircle2 size={26} /> },
                  { label: "Total Revenue", value: `$${stats.total_revenue.toLocaleString()}`, icon: <Contact size={26} /> },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`
                      flex items-center gap-4 p-5 rounded-xl
                      text-white border outline outline-1
                      shadow-[inset_0_0_0_1px_rgba(255,255,255,0.9)]
                      transition-all duration-300 hover:scale-105
                      ${isDarkMode ? "bg-black" : ""}
                    `}
                    style={
                      isDarkMode
                        ? {}
                        : {
                          background: "linear-gradient(90deg, #3D1768 0%, #020202 100%)",
                        }
                    }
                  >
                    <div className="w-10 h-10 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold leading-none">
                        {item.value}
                      </h2>
                      <p className="text-xs mt-1 text-white/70 tracking-wide">
                        {item.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ================= CHARTS ROW ================= */}
              <div className={`flex flex-col lg:flex-row gap-4 mb-8 w-full items-stretch transition-colors duration-300`}>

                {/* 1. TOTAL REVENUE CARD */}
                <div
                  className="rounded-[24px] p-7 flex flex-col justify-between w-full lg:w-1/3 text-white"
                  style={{
                    height: "300px",
                    fontFamily: "sans-serif",
                    ...(isDarkMode
                      ? {
                        background: "linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)"
                      }
                      : {
                        background: "linear-gradient(180deg, #8e4de8 0%, #8a46ee 100%)",
                      }),
                  }}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-2xl font-semibold tracking-tight">
                        Total Revenue
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-white/70 font-medium">
                        <select
                          value={revenueFilter}
                          onChange={(e) => handleRevenueFilterChange(e.target.value)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-medium bg-white/20 text-white border border-white/30 hover:bg-white/30 transition-colors"
                          style={{ backgroundImage: "none" }}
                        >
                          <option value="yearly" className="text-black">Yearly</option>
                          <option value="monthly" className="text-black">Monthly</option>
                          <option value="weekly" className="text-black">Weekly</option>
                        </select>
                      </div>
                    </div>

                    <p className="text-sm font-medium mt-4 text-white/70">
                      {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                      <h3 className="text-4xl font-bold">
                        ${(stats.total_revenue / 1000).toFixed(1)}k
                      </h3>

                      <div className="flex items-center gap-1.5 text-white font-bold">
                        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                          <TrendingUp size={10} className="text-[#3D1768]" />
                        </div>
                        <span className="text-lg">{revenueGrowth > 0 ? '+' : ''}{revenueGrowth}%</span>
                      </div>
                    </div>
                  </div>

                  {/* CHART */}
                  <div className="relative h-32 w-full mt-4 flex items-end">
                    {revenueChartData.data.length > 0 && (
                      <>
                        <div className="absolute right-0 h-full flex flex-col justify-between text-[10px] font-bold py-1 text-white/50">
                          {(() => {
                            const maxVal = Math.max(...revenueChartData.data, 100);
                            return (
                              <>
                                <span>{Math.round(maxVal)}k</span>
                                <span>{Math.round(maxVal * 0.8)}k</span>
                                <span>{Math.round(maxVal * 0.6)}k</span>
                                <span>{Math.round(maxVal * 0.4)}k</span>
                                <span>{Math.round(maxVal * 0.2)}k</span>
                                <span>0</span>
                              </>
                            );
                          })()}
                        </div>

                        <svg viewBox="0 0 400 100" className="w-[92%] h-full" preserveAspectRatio="none">
                          {[0, 20, 40, 60, 80].map((line) => (
                            <line
                              key={line}
                              x1="0"
                              y1={line}
                              x2="400"
                              y2={line}
                              stroke="white"
                              opacity="0.15"
                            />
                          ))}

                          <path
                            d={`M0,${100 - (revenueChartData.data[0] / Math.max(...revenueChartData.data, 100) * 70 || 0)} ${revenueChartData.data.map((value, i) => {
                              const x = (i / (revenueChartData.data.length - 1)) * 400;
                              const y = 100 - (value / Math.max(...revenueChartData.data, 100) * 70 || 0);
                              return `L${x},${y}`;
                            }).join(' ')} L400,100 L0,100 Z`}
                            fill="rgba(101, 5, 228, 0.15)"
                          />
                          <path
                            d={`M0,${100 - (revenueChartData.data[0] / Math.max(...revenueChartData.data, 100) * 70 || 0)} ${revenueChartData.data.map((value, i) => {
                              const x = (i / (revenueChartData.data.length - 1)) * 400;
                              const y = 100 - (value / Math.max(...revenueChartData.data, 100) * 70 || 0);
                              return `L${x},${y}`;
                            }).join(' ')}`}
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                          />
                        </svg>
                      </>
                    )}
                  </div>

                  <div className="flex justify-between w-[92%] text-[9px] font-bold uppercase mt-4 text-white/60">
                    {revenueChartData.labels.map((m, i) => (
                      <div key={i}>{m}</div>
                    ))}
                  </div>
                </div>

                {/* 2. PROJECT STATUS CARD */}
                <div
                  className="rounded-[16px] flex flex-col overflow-hidden w-full lg:w-1/3 transition-colors duration-300"
                  style={{
                    height: "300px",
                    fontFamily: "sans-serif",
                    ...(isDarkMode
                      ? {
                        background: "linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)"
                      }
                      : {
                        background: "linear-gradient(180deg, #8e4de8 0%, #8a46ee 100%)",
                      }),
                  }}
                >
                  {/* HEADER */}
                  <div className="px-5 pt-4 pb-3">
                    <h3 className="text-[18px] font-semibold text-white mb-3">
                      Project Status
                    </h3>

                    <div className="flex gap-2">
                      <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-medium bg-white/20 text-white border border-white/30 hover:bg-white/30 transition-colors">
                        Metric
                      </button>

                      <select
                        value={projectStatusTimeRange}
                        onChange={(e) => handleProjectStatusTimeRangeChange(e.target.value)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-medium bg-white/20 text-white border border-white/30 hover:bg-white/30 transition-colors"
                      >
                        <option value="today" className="text-black">Today</option>
                        <option value="yesterday" className="text-black">Yesterday</option>
                        <option value="week" className="text-black">This Week</option>
                        <option value="month" className="text-black">This Month</option>
                        <option value="all" className="text-black">All Time</option>
                      </select>
                    </div>
                  </div>

                  {/* DIVIDER */}
                  <div className="w-full h-px bg-white/20" />

                  {/* BODY */}
                  <div className="flex flex-1 items-center px-5 gap-6">
                    {/* DONUT CHART */}
                    <div className="relative flex items-center justify-center shrink-0" style={{ width: '180px', height: '180px' }}>
                      <div className="relative w-full h-full">
                        {/* Background circle */}
                        <div
                          className="absolute w-full h-full rounded-full"
                          style={{
                            border: '32.4px solid',
                            borderColor: isDarkMode ? '#4A4A4A' : '#F1F0F5',
                            boxSizing: 'border-box',
                          }}
                        />

                        {/* Completed segment */}
                        {projectStatus.completed > 0 && (
                          <div
                            className="absolute w-full h-full rounded-full"
                            style={{
                              border: '32.4px solid transparent',
                              borderTopColor: isDarkMode ? '#FFFFFF' : '#700edf9e',
                              borderRightColor: isDarkMode ? '#FFFFFF' : '#dae6d89e',
                              borderBottomColor: isDarkMode ? '#FFFFFF' : '#3D17689E',
                              borderLeftColor: isDarkMode ? '#FFFFFF' : '#c69c669e',
                              transform: 'rotate(-90deg)',
                              clipPath: `polygon(0 0, 100% 0, 100% ${projectStatus.completed}%, 0 ${projectStatus.completed}%)`,
                              boxSizing: 'border-box',
                            }}
                          />
                        )}

                        {/* On Hold segment */}
                        {projectStatus.on_hold > 0 && (
                          <div
                            className="absolute w-full h-full rounded-full"
                            style={{
                              border: '32.4px solid transparent',
                              borderTopColor: isDarkMode ? '#A0A0A0' : '#e5e8e3',
                              borderRightColor: isDarkMode ? '#A0A0A0' : '#e5e8e3',
                              borderBottomColor: isDarkMode ? '#A0A0A0' : '#e5e8e3',
                              borderLeftColor: isDarkMode ? '#A0A0A0' : '#e5e8e3',
                              transform: `rotate(${-90 + projectStatus.completed * 3.6}deg)`,
                              clipPath: `polygon(0 0, 100% 0, 100% ${projectStatus.on_hold}%, 0 ${projectStatus.on_hold}%)`,
                              boxSizing: 'border-box',
                            }}
                          />
                        )}
                      </div>

                      {/* CENTER TEXT */}
                      <div className="absolute flex flex-col items-center justify-center bg-white dark:bg-black rounded-full"
                        style={{ width: '100px', height: '100px' }}>
                        <span className="text-[24px] font-bold text-[#111827] dark:text-white">
                          {projectStatus.total}
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium text-center leading-tight">
                          Total Projects
                        </span>
                      </div>
                    </div>

                    {/* LEGEND */}
                    <div className="flex flex-col gap-3 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${isDarkMode ? 'bg-white' : 'bg-[#3D1768]'}`} />
                          <span className="text-[12px] text-white font-medium">Completed</span>
                        </div>
                        <span className="text-[12px] font-semibold text-white">{projectStatus.completed}%</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${isDarkMode ? 'bg-[#A0A0A0]' : 'bg-[#8B6FB3]'}`} />
                          <span className="text-[12px] text-white font-medium">On Hold</span>
                        </div>
                        <span className="text-[12px] font-semibold text-white">{projectStatus.on_hold}%</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${isDarkMode ? 'bg-[#4A4A4A]' : 'bg-[#F1F0F5]'}`} />
                          <span className="text-[12px] text-white font-medium">In Progress</span>
                        </div>
                        <span className="text-[12px] font-semibold text-white">{projectStatus.in_progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. PROGRESS CARD */}
                <div
                  className="flex flex-col w-full lg:w-1/3 transition-colors duration-300 rounded-[8px]"
                  style={{ height: "300px", fontFamily: "sans-serif" }}
                >
                  {/* HEADER */}
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-[22px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1e293b]'}`}>
                        Progress
                      </h3>
                      <div className="flex items-center text-[#3CD4A0] text-xs font-bold gap-0.5">
                        <TrendingUp size={12} strokeWidth={3} />
                        <span>{progressGrowth > 0 ? '+' : ''}{progressGrowth}%</span>
                      </div>
                    </div>

                    <div className={`border p-0.5 rounded-full flex items-center gap-1 transition-colors ${isDarkMode ? 'bg-black border-white' : 'bg-white border-gray-300'}`}>
                      <button
                        onClick={() => handleProgressViewChange("month")}
                        className={`
                          text-[9px] px-3 py-1 rounded-full font-bold transition-all
                          ${progressView === "month"
                            ? isDarkMode ? 'bg-white text-black' : 'bg-[#31135E] text-white'
                            : isDarkMode ? 'text-white/60 hover:bg-white/10' : 'text-[#64748B] hover:bg-black/5'
                          }
                        `}
                      >
                        Month
                      </button>
                      <button
                        onClick={() => handleProgressViewChange("week")}
                        className={`
                          text-[9px] px-3 py-1 rounded-full font-bold transition-all
                          ${progressView === "week"
                            ? isDarkMode ? 'bg-white text-black' : 'bg-[#31135E] text-white'
                            : isDarkMode ? 'text-white/60 hover:bg-white/10' : 'text-[#64748B] hover:bg-black/5'
                          }
                        `}
                      >
                        Week
                      </button>
                    </div>
                  </div>

                  {/* BODY */}
                  <div
                    className={`
                      rounded-[22px] p-4 flex gap-3 h-full
                      overflow-hidden items-stretch shadow-sm
                      transition-colors duration-300
                      ${isDarkMode
                        ? 'border border-white/20 bg-black/50'
                        : 'bg-gradient-to-br from-[#F8F5FF] to-[#F0EBFF]'
                      }
                    `}
                  >
                    {/* LEFT STATS */}
                    <div className="flex flex-col justify-between py-1 w-20 shrink-0">
                      {[
                        ["All Task", progressData.allTask, "#3CD4A0"],
                        ["Done", progressData.done, "#FF8B66"],
                        ["In Progress", progressData.inProgress, "#3CD4A0"],
                      ].map(([l, v, c], i) => (
                        <div key={i} className="flex flex-col">
                          <span className={`text-[10px] font-bold ${isDarkMode ? 'text-white/70' : 'text-[#1e293b]'}`}>
                            {l}
                          </span>
                          <span className={`text-[22px] font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-[#6D28D9]'}`}>
                            {v}
                          </span>
                          <span className="text-[8px] font-bold flex items-center gap-0.5" style={{ color: c }}>
                            <TrendingUp size={8} strokeWidth={3} /> +{progressGrowth}%
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* BAR CHART */}
                    <div className="flex-1 flex items-end justify-between gap-1 pb-1 relative h-full">
                      {progressChartData.labels.map((label, i) => {
                        const value = progressChartData.data[i] || 0;
                        const maxValue = Math.max(...progressChartData.data, 100);
                        const height = `${(value / maxValue) * 100}%`;
                        const isActive = i === 2; // Highlight middle bar

                        return (
                          <div key={i} className="flex flex-col items-center justify-end h-full w-full gap-2">
                            <div className="relative w-full flex flex-col items-center justify-end h-full">
                              <div
                                className={`
                                  w-full max-w-[22px] rounded-full
                                  ${isDarkMode
                                    ? (isActive ? 'bg-white' : 'bg-white/40')
                                    : (isActive ? 'bg-[#6D28D9]' : 'bg-[#C4B5FD]')
                                  }
                                `}
                                style={{ height }}
                              />
                            </div>
                            <span className={`text-[9px] font-bold whitespace-nowrap ${isDarkMode ? 'text-white/60' : 'text-[#1e293b]'}`}>
                              {label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= ACTIVE PROJECTS ================= */}
              <div className={`w-full mt-10 ${isDarkMode ? 'bg-black/50 rounded-[24px] p-6 border border-white/10' : ''} transition-colors duration-300`}>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className={`text-xl lg:text-[28px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    Active projects
                  </h3>
                  <span className="text-gray-400 text-lg font-medium pt-1">({activeProjects.length})</span>
                </div>

                <div className={`w-full border-t-2 ${isDarkMode ? 'border-white/30' : 'border-gray-300'} mb-5`} />

                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[800px] table-fixed border-collapse">
                    <thead>
                      <tr className={`${isDarkMode ? 'bg-black text-white/70' : 'bg-[#f7f7f7] text-[#6B6B6B]'} text-left text-[14px] font-medium`}>
                        <th className="py-5 pl-6 pr-2 w-[25%] rounded-l-xl">Client Name</th>
                        <th className="py-5 px-4 w-[20%]">Project</th>
                        <th className="py-5 px-4 w-[12%]">Price</th>
                        <th className="py-5 px-4 w-[20%]">Delivered in</th>
                        <th className="py-5 pr-6 pl-4 w-[23%] rounded-r-xl">Progress</th>
                      </tr>
                    </thead>

                    <tbody>
                      {activeProjects.length > 0 ? (
                        activeProjects.map((row, i) => (
                          <tr key={i} className={`transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                            <td className={`py-6 pl-4 pr-2 border-b ${isDarkMode ? 'border-white/15' : 'border-gray-200'}`}>
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full overflow-hidden shrink-0 shadow-sm border ${isDarkMode ? 'border-white/30' : 'border-gray-100'}`}>
                                  <img src={row.img} alt={row.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col truncate">
                                  <span className={`font-bold text-[15px] truncate ${isDarkMode ? 'text-white' : 'text-black'}`}>
                                    {row.name}
                                  </span>
                                  <span className={`text-[10px] font-bold opacity-80 ${isDarkMode ? 'text-white/60' : 'text-[#3D1768]'}`}>
                                    {row.id}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className={`py-6 px-4 border-b ${isDarkMode ? 'border-white/15' : 'border-gray-200'} font-medium text-[15px] truncate ${isDarkMode ? 'text-white/80' : 'text-black'}`}>
                              {row.project}
                            </td>

                            <td className={`py-6 px-4 border-b ${isDarkMode ? 'border-white/15' : 'border-gray-200'} font-bold text-[15px] ${isDarkMode ? 'text-white' : 'text-black'}`}>
                              {row.price}
                            </td>

                            <td className={`py-6 px-4 border-b ${isDarkMode ? 'border-white/15' : 'border-gray-200'} font-medium text-[14px] whitespace-nowrap ${isDarkMode ? 'text-white/70' : 'text-black'}`}>
                              {row.time}
                            </td>

                            <td className={`py-6 pr-4 pl-4 border-b ${isDarkMode ? 'border-white/15' : 'border-gray-200'}`}>
                              <div className="flex items-center gap-3">
                                <div className={`flex-1 min-w-[60px] max-w-[120px] h-[6px] rounded-full overflow-hidden ${isDarkMode ? 'bg-white/20' : 'bg-[#F1F0F5]'}`}>
                                  <div className={`h-full rounded-full ${isDarkMode ? 'bg-white' : 'bg-[#3D1768]'}`} style={{ width: row.progress }} />
                                </div>
                                <span className={`font-bold text-xs min-w-[30px] ${isDarkMode ? 'text-white' : 'text-black'}`}>
                                  {row.progress}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center py-8 text-gray-500">
                            No active projects found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Other Views */}
          {currentView === 'users' && <UserPage />}
          {currentView === 'subscription' && <SubscriptionPage />}
          {currentView === 'analytics' && <Analytics />}
          {currentView === 'setting' && <Setting />}
        </main>
      </div>

      {/* ================= LOGOUT MODAL ================= */}
      {showLogoutPopup && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className={`rounded-2xl p-6 w-[360px] text-center ${isDarkMode ? 'bg-black border border-white/20' : 'bg-white'}`}>
            <img src={logoutpic} className="mx-auto mb-4 w-24 h-24" alt="Logout" />
            <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Logout</h3>
            <p className={`mb-6 ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>Are you sure you want to logout?</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutPopup(false)}
                className={`flex-1 border rounded-full py-2 transition-colors
                  ${isDarkMode
                    ? 'border-white/30 text-white hover:bg-white/10'
                    : 'border-gray-300 text-black hover:bg-gray-50'}`}
              >
                Cancel
              </button>
              <button
                className="flex-1 text-white rounded-full py-2 transition-colors hover:opacity-90"
                style={{ background: "linear-gradient(90deg,#020202,#792ECE)" }}
                onClick={handleLogout}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;