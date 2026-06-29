// frontend_admin/src/pages/Admin/Dashboard.jsx
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import api, { setRefreshNotificationsFunction } from "../../utils/axiosConfig";
import { toast } from "react-hot-toast";

import { Loader } from "lucide-react";
import sidebarBg from "../../assets/Adminimages/sidebar.png";
import {
  LayoutGrid,
  User,
  Ticket,
  LineChart,
  Settings,
  LogOut,
  Users,
  BookMarked,
  CheckCircle2,
  Contact,
  ChevronDown,
  TrendingUp,
  Bell,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  ListChecks,
  Sun,
  Moon,
} from "lucide-react";
import c1 from "../../assets/Adminimages/c1.png";
import c2 from "../../assets/Adminimages/c2.png";
import c3 from "../../assets/Adminimages/c3.png";
import c4 from "../../assets/Adminimages/c4.png";
import c5 from "../../assets/Adminimages/c5.png";
import user1 from "../../assets/Adminimages/user1.png";
import user2 from "../../assets/Adminimages/user2.png";
import user3 from "../../assets/Adminimages/user3.png";
import user4 from "../../assets/Adminimages/user4.png";
import user5 from "../../assets/Adminimages/user5.png";
import user6 from "../../assets/Adminimages/user6.png";
import user7 from "../../assets/Adminimages/user7.png";
import user8 from "../../assets/Adminimages/user8.png";
import user9 from "../../assets/Adminimages/user9.png";
import user10 from "../../assets/Adminimages/user10.png";
import user11 from "../../assets/Adminimages/user11.png";
import UserPage from "./User";
import SubscriptionPage from "./AdminSubscription";
import Analytics from "./Analytics";
import Setting from "./Setting";
import OptionsPage from "./Options";

// Create a global event emitter for real-time updates
class DataUpdateEmitter {
  constructor() {
    this.listeners = new Map();
  }

  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  emit(event, data = {}) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }
}

export const dataUpdateEmitter = new DataUpdateEmitter();

// Tooltip Component
const Tooltip = ({ children, text, isDarkMode }) => {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          className={`absolute z-50 px-2 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-all duration-200 ${isDarkMode
            ? 'bg-gray-800 text-white border border-gray-600'
            : 'bg-gray-900 text-white shadow-lg'
            }`}
          style={{
            top: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {text}
          <div
            className={`absolute w-2 h-2 rotate-45 left-1/2 -translate-x-1/2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-900'
              }`}
            style={{ top: '-4px' }}
          />
        </div>
      )}
    </div>
  );
};

// Custom Dropdown Component
const CustomDropdown = ({
  value,
  onChange,
  options,
  placeholder,
  isDarkMode,
  dropdownRef,
  showDropdown,
  setShowDropdown,
}) => {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all duration-200 cursor-pointer hover:scale-105"
        style={{
          backgroundColor: isDarkMode
            ? "rgba(255,255,255,0.15)"
            : "rgba(255,255,255,0.95)",
          color: isDarkMode ? "white" : "#3D1768",
          border: isDarkMode
            ? "1px solid rgba(255,255,255,0.3)"
            : "1px solid rgba(61, 23, 104, 0.3)",
        }}
      >
        <span>{selectedOption?.label || placeholder}</span>
        <ChevronDown
          size={12}
          style={{
            transform: showDropdown ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {showDropdown && (
        <div
          className={`absolute z-50 w-full mt-1 rounded-lg shadow-lg overflow-hidden min-w-[120px] ${isDarkMode
            ? "bg-gray-800 border border-gray-600"
            : "bg-gray-100 border border-gray-200 shadow-xl"
            }`}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setShowDropdown(false);
              }}
              className={`w-full px-3 py-2 text-left text-[12px] transition-all duration-150 ${isDarkMode
                ? "text-white hover:bg-gray-700 hover:pl-4"
                : "text-gray-700 hover:bg-purple-100 hover:pl-4"
                } ${value === option.value
                  ? isDarkMode
                    ? "bg-gray-700"
                    : "bg-purple-100 text-purple-700 font-semibold"
                  : ""
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Dropdown state wrapper component
const DropdownWrapper = ({ value, onChange, options, placeholder, isDarkMode }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <CustomDropdown
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      isDarkMode={isDarkMode}
      dropdownRef={dropdownRef}
      showDropdown={showDropdown}
      setShowDropdown={setShowDropdown}
    />
  );
};

// Truncated Text Component with Tooltip
const TruncatedText = ({ text, className = "", style = {}, as: Tag = "span", isDarkMode }) => {
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current) {
      setIsTruncated(textRef.current.scrollWidth > textRef.current.clientWidth);
    }
  }, [text]);

  return (
    <div className={`tooltip-trigger ${isTruncated ? "truncated" : ""}`} style={{ maxWidth: "100%", display: "inline-block" }}>
      <Tag
        ref={textRef}
        className={`truncate-cell ${className}`}
        style={{ ...style, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
      >
        {text}
      </Tag>
      {isTruncated && (
        <div className="tooltip-text" style={{
          visibility: "hidden",
          opacity: 0,
          position: "absolute",
          bottom: "calc(100% + 8px)",
          left: "50%",
          transform: "translateX(-50%)",
          background: isDarkMode ? "#1e1b2e" : "#1e1b2e",
          color: "#f3f0ff",
          fontSize: "12px",
          lineHeight: "1.4",
          padding: "6px 12px",
          borderRadius: "8px",
          whiteSpace: "normal",
          wordBreak: "break-word",
          maxWidth: "300px",
          minWidth: "120px",
          width: "max-content",
          pointerEvents: "none",
          zIndex: 10000,
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          transition: "opacity 0.2s ease, visibility 0.2s ease",
          textAlign: "center",
        }}>
          {text}
          <div style={{
            content: "",
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            border: "5px solid transparent",
            borderTopColor: isDarkMode ? "#1e1b2e" : "#1e1b2e",
          }} />
        </div>
      )}
    </div>
  );
};

// Revenue Chart Component – with pixel‑perfect Y‑axis alignment
const RevenueChart = ({ data, labels, isDarkMode }) => {
  const chartContainerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 100 });

  useEffect(() => {
    const updateDimensions = () => {
      if (chartContainerRef.current) {
        setDimensions({
          width: chartContainerRef.current.clientWidth,
          height: 100
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="h-32 w-full flex items-center justify-center text-white/50 text-sm">
        No data available
      </div>
    );
  }

  // Compute max value and round up
  const rawMax = Math.max(...data, 1);
  let maxVal;
  if (rawMax <= 100) maxVal = Math.ceil(rawMax / 10) * 10;
  else if (rawMax <= 500) maxVal = Math.ceil(rawMax / 50) * 50;
  else if (rawMax <= 1000) maxVal = Math.ceil(rawMax / 100) * 100;
  else if (rawMax <= 5000) maxVal = Math.ceil(rawMax / 500) * 500;
  else maxVal = Math.ceil(rawMax / 1000) * 1000;
  if (maxVal < rawMax) maxVal = rawMax;
  maxVal = Math.max(maxVal, 1);

  const chartHeight = 100;
  const chartWidth = dimensions.width || 400;

  // Data points for the line
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * chartWidth;
    const y = chartHeight - (value / maxVal) * chartHeight;
    return `${x},${y}`;
  }).join(' L ');
  const linePath = `M ${points}`;
  const areaPath = `${linePath} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`;

  // Generate Y‑axis labels (5 values)
  const getYAxisLabels = () => {
    const labels = [];
    for (let i = 4; i >= 0; i--) {
      const value = (maxVal / 4) * i;
      let roundedValue;
      if (maxVal <= 100) roundedValue = Math.round(value / 5) * 5;
      else if (maxVal <= 500) roundedValue = Math.round(value / 10) * 10;
      else if (maxVal <= 1000) roundedValue = Math.round(value / 25) * 25;
      else if (maxVal <= 5000) roundedValue = Math.round(value / 50) * 50;
      else roundedValue = Math.round(value / 100) * 100;
      labels.push(roundedValue);
    }
    return labels;
  };
  const yAxisLabels = getYAxisLabels();

  // Format label
  const formatYAxisLabel = (value) => {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return Math.round(value);
  };

  // Calculate the Y position (in %) for each label and grid line
  const getYPosition = (value) => {
    return (1 - value / maxVal) * 100;
  };

  return (
    <div className="w-full mt-4" ref={chartContainerRef}>
      {/* Y‑axis labels – absolutely positioned for perfect alignment */}
      <div className="relative h-[100px] w-full">
        <div className="absolute left-0 top-0 bottom-0 w-8">
          {yAxisLabels.map((value, index) => {
            const yPercent = getYPosition(value);
            return (
              <span
                key={index}
                className="absolute text-[9px] font-medium text-white/50 w-full text-right pr-1"
                style={{
                  top: `${yPercent}%`,
                  transform: 'translateY(-50%)',
                }}
              >
                {formatYAxisLabel(value)}
              </span>
            );
          })}
        </div>

        {/* SVG Chart */}
        <div className="absolute left-8 right-0 top-0 bottom-0">
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            preserveAspectRatio="none"
            style={{ overflow: 'visible' }}
          >
            {/* Grid lines */}
            {yAxisLabels.map((value, index) => {
              const yPosition = chartHeight - (value / maxVal) * chartHeight;
              return (
                <line
                  key={index}
                  x1="0"
                  y1={yPosition}
                  x2={chartWidth}
                  y2={yPosition}
                  stroke="white"
                  strokeOpacity="0.15"
                  strokeWidth="0.8"
                />
              );
            })}

            {/* Area fill */}
            <path d={areaPath} fill={isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(101,5,228,0.15)"} />

            {/* Line */}
            <path d={linePath} fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Data points (dots) */}
            {data.map((value, index) => {
              const x = (index / (data.length - 1)) * chartWidth;
              const y = chartHeight - (value / maxVal) * chartHeight;
              return <circle key={index} cx={x} cy={y} r="3" fill="white" />;
            })}
          </svg>
        </div>
      </div>

      {/* X‑axis labels – unchanged, already aligned */}
      <div className="flex justify-between w-full mt-2 pl-8">
        {labels.map((label, index) => (
          <div
            key={index}
            className="text-[9px] font-medium text-white/60 uppercase text-center"
            style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'visible' }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();

  // Refs for preventing double initialization and concurrent refreshes
  const hasInitializedRef = useRef(false);
  const isRefreshingRef = useRef(false);
  const autoRefreshIntervalRef = useRef(null);

  // ================= SIDEBAR & NAVIGATION STATES =================
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState(() => {
    const isFreshLogin = sessionStorage.getItem("justLoggedIn") === "true";
    if (isFreshLogin) {
      sessionStorage.removeItem("justLoggedIn");
      localStorage.removeItem("adminCurrentView");
      return "dashboard";
    }
    const savedView = localStorage.getItem("adminCurrentView");
    const validViews = ["dashboard", "users", "subscription", "analytics", "setting", "options"];
    return savedView && validViews.includes(savedView) ? savedView : "dashboard";
  });
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  // ================= PROFILE DROPDOWN STATE =================
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef(null);
  const mainContentRef = useRef(null);

  // ================= NOTIFICATION STATES =================
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const [isMarkedAll, setIsMarkedAll] = useState(false);
  const notificationRef = useRef(null);

  // ================= DROPDOWN STATES =================
  const [showRevenueDropdown, setShowRevenueDropdown] = useState(false);
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false);
  const revenueDropdownRef = useRef(null);
  const timeRangeDropdownRef = useRef(null);

  // ================= DASHBOARD DATA STATES =================
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    admin_name: "",
    total_users: 0,
    active_projects: 0,
    completed_tasks: 0,
    total_revenue: 0,
  });
  const [progressChartData, setProgressChartData] = useState({
    labels: [],
    data: [],
  });
  const [revenueChartData, setRevenueChartData] = useState({
    labels: [],
    data: [],
  });
  const [projectStatus, setProjectStatus] = useState({
    completed: 0,
    on_hold: 0,
    in_progress: 0,
    total: 0,
  });
  const [progressData, setProgressData] = useState({
    allTask: 0,
    done: 0,
    inProgress: 0,
  });
  const [activeProjects, setActiveProjects] = useState([]);
  const [revenueFilter, setRevenueFilter] = useState("Yearly");
  const [projectStatusTimeRange, setProjectStatusTimeRange] = useState("all");
  const [revenueGrowth, setRevenueGrowth] = useState(0);
  const [progressGrowth, setProgressGrowth] = useState(0);
  const [progressView, setProgressView] = useState("Month");
  const [profileImage, setProfileImage] = useState(null);
  const [adminName, setAdminName] = useState("");
  const [adminId, setAdminId] = useState(null);
  const [projectSearchTerm, setProjectSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // ================= ACTIVE PROJECTS PAGINATION =================
  const [activeProjectsCurrentPage, setActiveProjectsCurrentPage] = useState(1);
  const [activeProjectsPageSize] = useState(5);

  const paginatedActiveProjects = useMemo(() => {
    const start = (activeProjectsCurrentPage - 1) * activeProjectsPageSize;
    const end = start + activeProjectsPageSize;
    return activeProjects.slice(start, end);
  }, [activeProjects, activeProjectsCurrentPage, activeProjectsPageSize]);

  const totalActiveProjectsPages = Math.ceil(activeProjects.length / activeProjectsPageSize);

  // ================= THEME STATE =================
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") return true;
    if (savedTheme === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const isInitialMount = useRef(true);

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    const themeValue = newTheme ? "dark" : "light";
    localStorage.setItem("theme", themeValue);

    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    if (newTheme) {
      htmlElement.classList.add("dark");
      htmlElement.classList.remove("light");
      bodyElement.classList.add("dark");
      bodyElement.classList.remove("light");
    } else {
      htmlElement.classList.add("light");
      htmlElement.classList.remove("dark");
      bodyElement.classList.add("light");
      bodyElement.classList.remove("dark");
    }

    window.dispatchEvent(new Event("theme-change"));
    toast.success(`${newTheme ? "Dark" : "Light"} mode activated`);
  };

  // ================= CONSTANTS =================
  const userImages = [user1, user2, user3, user4, user5, user6, user7, user8, user9, user10, user11];

  // ================= NOTIFICATION FUNCTIONS =================
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get("/admin/notifications");
      setNotifications(response.data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, []);

  useEffect(() => {
    setRefreshNotificationsFunction(fetchNotifications);
    return () => setRefreshNotificationsFunction(null);
  }, [fetchNotifications]);

  const markNotificationRead = async (id) => {
    try {
      await api.post(`/admin/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification read:", error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await api.delete("/admin/notifications/clear-all");
      toast.success("Notifications cleared");
      fetchNotifications();
    } catch (error) {
      console.error("Error clearing notifications:", error);
      toast.error("Failed to clear notifications");
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.post("/admin/notifications/mark-all-read");
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all read:", error);
    }
  };

  const handleMarkAll = (e) => {
    e.stopPropagation();
    markAllNotificationsRead();
    setIsMarkedAll(true);
  };

  useEffect(() => {
    const hasUnreadNotifications = notifications.some((n) => !n.is_read);
    if (hasUnreadNotifications) setIsMarkedAll(false);
  }, [notifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  // ================= DASHBOARD FUNCTIONS =================
  const fetchAdminProfile = useCallback(async () => {
    try {
      const response = await api.get("/admin/profile");
      const firstName = response.data.first_name || "";
      const lastName = response.data.last_name || "";
      const fullName = `${firstName} ${lastName}`.trim();
      setAdminName(fullName || firstName || "Admin");
      setAdminId(response.data.id);
      setProfileImage(response.data.profile_image || null);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }, []);

  const refreshProfileImage = useCallback(async () => {
    await fetchAdminProfile();
  }, [fetchAdminProfile]);

  const fetchDashboardStats = useCallback(async () => {
    try {
      const response = await api.get("/admin/dashboard/stats");
      setStats({
        admin_name: response.data.admin_name || "",
        total_users: response.data.total_users || 0,
        active_projects: response.data.active_projects || 0,
        completed_tasks: response.data.completed_tasks || 0,
        total_revenue: response.data.total_revenue || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  const fetchRevenueChartData = useCallback(
    async (filter = revenueFilter) => {
      try {
        const response = await api.get("/admin/dashboard/charts/revenue", {
          params: { filter },
        });
        setRevenueChartData({
          labels: response.data.labels || [],
          data: response.data.data || [],
        });
        setRevenueGrowth(response.data.growth_percentage || 0);
      } catch (error) {
        console.error("Error fetching revenue chart:", error);
      }
    },
    [revenueFilter],
  );

  const fetchProjectStatus = useCallback(
    async (timeRange = projectStatusTimeRange) => {
      try {
        const response = await api.get("/admin/dashboard/charts/project-status", {
          params: { time_range: timeRange },
        });
        setProjectStatus({
          completed: response.data.completed || 0,
          on_hold: response.data.on_hold || 0,
          in_progress: response.data.in_progress || 0,
          total: response.data.total || 0,
        });
      } catch (error) {
        console.error("Error fetching project status:", error);
      }
    },
    [projectStatusTimeRange],
  );

  const fetchProgressData = useCallback(
    async (view = progressView) => {
      try {
        const response = await api.get("/admin/dashboard/charts/progress", {
          params: { filter: view },
        });
        setProgressChartData({
          labels: response.data.labels || [],
          data: response.data.data || [],
        });
        setProgressData({
          allTask: response.data.all_task || 0,
          done: response.data.done || 0,
          inProgress: response.data.in_progress || 0,
        });
        setProgressGrowth(response.data.growth_percentage || 0);
      } catch (error) {
        console.error("Error fetching progress data:", error);
      }
    },
    [progressView],
  );

  const getProfileImage = useCallback((index) => {
    const images = [c1, c2, c3, c4, c5];
    return images[index % images.length];
  }, []);

  const fetchActiveProjects = useCallback(
    async (searchTerm = "") => {
      try {
        // console.log("🟢 Fetching active projects with search term:", searchTerm);
        const params = searchTerm ? { search: searchTerm, limit: 100 } : { limit: 100 };
        const response = await api.get("/admin/dashboard/active-projects", { params });

        if (response.data && response.data.length > 0) {
          // Deduplicate by client_name + project_title
          const uniqueProjects = [];
          const seenKeys = new Set();

          for (const project of response.data) {
            const uniqueKey = `${project.client_name}-${project.project_title}`;

            if (!seenKeys.has(uniqueKey)) {
              seenKeys.add(uniqueKey);

              // Calculate progress for milestone projects
              let progressPercent = project.progress || 0;
              let completedMilestones = project.completed_milestones || 0;
              let totalMilestones = project.total_milestones || 0;

              if (
                project.is_milestone_based &&
                project.milestones_data &&
                project.milestones_data.length > 0
              ) {
                totalMilestones = project.milestones_data.length;
                completedMilestones = project.milestones_data.filter(
                  (m) => m.status === "paid",
                ).length;
                progressPercent =
                  totalMilestones > 0
                    ? (completedMilestones / totalMilestones) * 100
                    : 0;
              }

              uniqueProjects.push({
                name: project.client_name || "Unknown",
                id: project.client_id || `ID-${uniqueProjects.length + 1}`,
                project: project.project_title || "Untitled",
                price: project.price ? `₹${project.price.toLocaleString()}` : "₹0",
                time: project.delivered_in || "N/A",
                start_date: project.start_date || "Not set",
                end_date: project.end_date || "Not set",
                status: project.status || "In Progress",
                project_owner: project.project_owner || "",
                project_owner_type: project.project_owner_type || "",
                project_category: project.is_milestone_based
                  ? "Milestone Based"
                  : project.project_category || "General",
                progress: `${Math.round(progressPercent)}%`,
                img: project.client_profile_image || getProfileImage(uniqueProjects.length),
                is_milestone_based: project.is_milestone_based || false,
                milestones_data: project.milestones_data || [],
                completed_milestones: completedMilestones,
                total_milestones: totalMilestones,
              });
            }
          }

          setActiveProjects(uniqueProjects);
          setActiveProjectsCurrentPage(1);
        } else {
          setActiveProjects([]);
        }
      } catch (error) {
        console.error("🔴 Error fetching active projects:", error);
        setActiveProjects([]);
      }
    },
    [getProfileImage],
  );

  useEffect(() => {
    setActiveProjectsCurrentPage(1);
  }, [activeProjects.length]);

  const handleRevenueFilterChange = async (filter) => {
    setRevenueFilter(filter);
    await fetchRevenueChartData(filter);
  };

  const handleProgressViewChange = async (view) => {
    setProgressView(view);
    await fetchProgressData(view);
  };

  const handleProjectStatusTimeRangeChange = async (timeRange) => {
    setProjectStatusTimeRange(timeRange);
    await fetchProjectStatus(timeRange);
  };

  const handleNavigation = (viewName) => {
    setCurrentView(viewName);
    setIsSidebarOpen(false);
    localStorage.setItem("adminCurrentView", viewName);
    if (mainContentRef.current) mainContentRef.current.scrollTop = 0;
  };

  const handleProjectSearch = async () => {
    setIsSearching(true);
    await fetchActiveProjects(projectSearchTerm);
    setIsSearching(false);
  };

  useEffect(() => {
    if (mainContentRef.current) mainContentRef.current.scrollTop = 0;
  }, [currentView]);

  // ================= AUTO-REFRESH FUNCTION =================
  const refreshDashboardData = useCallback(
    async (options = {}) => {
      if (isRefreshingRef.current) return;
      if (currentView !== "dashboard" && !options.force) return;

      isRefreshingRef.current = true;
      try {
        await Promise.all([
          fetchDashboardStats(),
          fetchRevenueChartData(revenueFilter),
          fetchProjectStatus(projectStatusTimeRange),
          fetchProgressData(progressView),
          fetchActiveProjects(),
          fetchAdminProfile(),
          fetchNotifications(),
        ]);
        if (options.showToast) toast.success("Dashboard updated");
      } catch (error) {
        console.error("Error refreshing dashboard data:", error);
      } finally {
        setTimeout(() => {
          isRefreshingRef.current = false;
        }, 1000);
      }
    },
    [
      currentView,
      revenueFilter,
      projectStatusTimeRange,
      progressView,
      fetchDashboardStats,
      fetchRevenueChartData,
      fetchProjectStatus,
      fetchProgressData,
      fetchActiveProjects,
      fetchAdminProfile,
      fetchNotifications,
    ],
  );

  // Set up auto-refresh interval
  useEffect(() => {
    if (autoRefreshIntervalRef.current) clearInterval(autoRefreshIntervalRef.current);
    autoRefreshIntervalRef.current = setInterval(() => {
      if (!isRefreshingRef.current) refreshDashboardData();
    }, 30000);
    return () => {
      if (autoRefreshIntervalRef.current) clearInterval(autoRefreshIntervalRef.current);
    };
  }, [refreshDashboardData]);

  // Listen for real-time data updates
  useEffect(() => {
    const unsubscribeUserUpdate = dataUpdateEmitter.subscribe("userDataChanged", () => {
      refreshDashboardData({ force: true });
    });
    const unsubscribeSubscriptionUpdate = dataUpdateEmitter.subscribe("subscriptionDataChanged", () => {
      refreshDashboardData({ force: true });
    });
    const unsubscribeProjectUpdate = dataUpdateEmitter.subscribe("projectDataChanged", () => {
      refreshDashboardData({ force: true });
    });
    const unsubscribeTaskUpdate = dataUpdateEmitter.subscribe("taskDataChanged", () => {
      refreshDashboardData({ force: true });
    });
    const unsubscribeRevenueUpdate = dataUpdateEmitter.subscribe("revenueDataChanged", () => {
      refreshDashboardData({ force: true });
    });
    const unsubscribeGenericUpdate = dataUpdateEmitter.subscribe("dashboardDataUpdated", () => {
      refreshDashboardData({ force: true });
    });

    return () => {
      unsubscribeUserUpdate();
      unsubscribeSubscriptionUpdate();
      unsubscribeProjectUpdate();
      unsubscribeTaskUpdate();
      unsubscribeRevenueUpdate();
      unsubscribeGenericUpdate();
    };
  }, [refreshDashboardData]);

  // Listen for storage events
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "adminDataUpdated" || e.key === "dashboardRefresh" || e.key === "forceDashboardRefresh") {
        refreshDashboardData({ force: true });
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [refreshDashboardData]);

  // Listen for custom event
  useEffect(() => {
    const handleCustomRefresh = (event) => {
      refreshDashboardData({ force: true, showToast: event.detail?.showToast });
    };
    window.addEventListener("refreshDashboard", handleCustomRefresh);
    return () => window.removeEventListener("refreshDashboard", handleCustomRefresh);
  }, [refreshDashboardData]);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        fetchDashboardStats(),
        fetchRevenueChartData(),
        fetchProjectStatus(),
        fetchProgressData(),
        fetchActiveProjects(),
        fetchAdminProfile(),
        fetchNotifications(),
      ]);

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`🔴 API call ${index} failed:`, result.reason);
        }
      });
    } catch (error) {
      console.error("🔴 Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchDashboardStats, fetchRevenueChartData, fetchProjectStatus, fetchProgressData, fetchActiveProjects, fetchAdminProfile, fetchNotifications]);

  const handleLogout = async () => {
    try {
      await api.post("/admin/logout");
      localStorage.removeItem("adminCurrentView");
      sessionStorage.removeItem("justLoggedIn");
      if (autoRefreshIntervalRef.current) clearInterval(autoRefreshIntervalRef.current);
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  // ================= PROFILE DROPDOWN HANDLERS =================
  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
    if (showNotifications) setShowNotifications(false);
  };

  const handleSettingNavigation = () => {
    setShowProfileDropdown(false);
    handleNavigation("setting");
  };

  const handleLogoutFromDropdown = () => {
    setShowProfileDropdown(false);
    setShowLogoutPopup(true);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (revenueDropdownRef.current && !revenueDropdownRef.current.contains(event.target)) {
        setShowRevenueDropdown(false);
      }
      if (timeRangeDropdownRef.current && !timeRangeDropdownRef.current.contains(event.target)) {
        setShowTimeRangeDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Storage event listener for cross-tab navigation
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "adminCurrentView" && e.newValue) {
        const validViews = ["dashboard", "users", "subscription", "analytics", "setting", "options"];
        if (validViews.includes(e.newValue)) setCurrentView(e.newValue);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    window.refreshProfileImage = refreshProfileImage;
    window.refreshDashboardData = () => refreshDashboardData({ force: true, showToast: false });
    return () => {
      delete window.refreshProfileImage;
      delete window.refreshDashboardData;
    };
  }, [refreshProfileImage, refreshDashboardData]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const applyTheme = () => {
      const savedTheme = localStorage.getItem("theme");
      const isDark = savedTheme === "dark";
      
      setIsDarkMode(isDark);
      
      const htmlElement = document.documentElement;
      const bodyElement = document.body;
      
      if (isDark) {
        htmlElement.classList.add("dark");
        htmlElement.classList.remove("light");
        bodyElement.classList.add("dark");
        bodyElement.classList.remove("light");
      } else {
        htmlElement.classList.add("light");
        htmlElement.classList.remove("dark");
        bodyElement.classList.add("light");
        bodyElement.classList.remove("dark");
      }
    };
    
    applyTheme();
    isInitialMount.current = false;
    
    const handleThemeChange = () => {
      applyTheme();
      setIsDarkMode(prev => {
        const newMode = localStorage.getItem("theme") === "dark";
        return newMode;
      });
    };
    
    window.addEventListener("theme-change", handleThemeChange);
    
    const handleStorageChange = (e) => {
      if (e.key === 'theme') {
        handleThemeChange();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = () => {
      if (!localStorage.getItem("theme")) applyTheme();
    };
    mediaQuery.addEventListener("change", handleSystemChange);
    
    return () => {
      window.removeEventListener("theme-change", handleThemeChange);
      window.removeEventListener('storage', handleStorageChange);
      mediaQuery.removeEventListener("change", handleSystemChange);
    };
  }, []);

  // Verify authentication and load data - only once
  useEffect(() => {
    const initDashboard = async () => {
      if (hasInitializedRef.current) return;
      hasInitializedRef.current = true;
      try {
        await api.get("/admin/verify");
        await loadDashboardData();
      } catch (error) {
        console.error("Authentication failed:", error);
        toast.error("Session expired. Please login again.");
        navigate("/");
      }
    };
    initDashboard();
  }, [loadDashboardData, navigate]);

  // ================= RENDER FUNCTIONS =================
  const getSidebarLinkClass = (viewName) => {
    const isActive = currentView === viewName;
    return `
      flex items-center gap-3 px-4 py-3 rounded-full cursor-pointer transition-all duration-200
      ${isActive ? "bg-[#3b0764] text-white font-medium" : "text-white hover:bg-[#3b0764]"}
    `;
  };

  const renderDashboard = () => (
    <>
      <style>{`
        .truncate-cell {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .tooltip-trigger {
          position: relative;
          cursor: default;
          display: inline-block;
          max-width: 100%;
        }
        .tooltip-trigger.truncated:hover .tooltip-text {
          visibility: visible !important;
          opacity: 1 !important;
        }
      `}</style>

      <div className="flex-1 lg:pl-4 mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
          Welcome back, {adminName || "Admin"} 👋
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Users", value: stats.total_users.toLocaleString(), icon: <Users size={26} /> },
          { label: "Active Projects", value: stats.active_projects.toString(), icon: <BookMarked size={26} /> },
          { label: "Completed Task", value: stats.completed_tasks.toString(), icon: <CheckCircle2 size={26} /> },
          { label: "Total Revenue", value: `₹${stats.total_revenue.toLocaleString()}`, icon: <Contact size={26} /> },
        ].map((item, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 p-5 rounded-xl text-white border outline outline-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.9)] transition-all duration-300 hover:scale-105 ${isDarkMode
              ? "bg-gradient-to-r from-gray-900 to-gray-800 border-gray-700 shadow-xl"
              : ""
              }`}
            style={isDarkMode ? {} : { background: "linear-gradient(90deg, #3D1768 0%, #020202 100%)" }}
          >
            <div className="w-10 h-10 flex items-center justify-center">{item.icon}</div>
            <div>
              <h2 className="text-2xl font-semibold leading-none text-white">{item.value}</h2>
              <p className="text-xs mt-1 text-white/80 tracking-wide">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-8 w-full items-stretch transition-colors duration-300">
        {/* Revenue Card - Fixed X-axis labels */}
        <div
          className="rounded-[24px] p-7 flex flex-col justify-between w-full lg:w-1/3"
          style={{
            height: "auto",
            minHeight: "300px",
            fontFamily: "sans-serif",
            color: "white",
            ...(isDarkMode
              ? { background: "linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)" }
              : { background: "linear-gradient(135deg, #3D1768 0%, #3D1768CC 100%)", border: "1px solid rgba(61, 23, 104, 0.3)" }),
          }}
        >
          <div>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold tracking-tight text-white">Total Revenue</h3>
              <DropdownWrapper
                value={revenueFilter}
                onChange={handleRevenueFilterChange}
                options={[
                  { value: "Yearly", label: "Yearly" },
                  { value: "Monthly", label: "Monthly" },
                  { value: "Weekly", label: "Weekly" },
                ]}
                placeholder="Select"
                isDarkMode={isDarkMode}
              />
            </div>
            <p className="text-sm font-medium mt-4 text-white/70">
              {new Date().toLocaleString("default", { month: "long" })} {new Date().getFullYear()}
            </p>
            <div className="flex items-center gap-3 mt-2">
  <h3 className="text-4xl font-bold">₹{(stats.total_revenue / 1000).toFixed(1)}k</h3>
  {revenueGrowth !== 0 && (
    <div className="flex items-center gap-0.5 text-white font-bold mt-auto">
      <div className="w-2.5 h-2.5 rounded-full bg-gray-100 flex items-center justify-center">
        <TrendingUp size={5} className="text-[#3D1768]" />
      </div>
      <span className="text-[10px]">{revenueGrowth > 0 ? "+" : ""}{revenueGrowth}%</span>
    </div>
  )}
</div>
          </div>

          {/* Revenue Chart with fixed X-axis labels */}
          <RevenueChart 
            data={revenueChartData.data}
            labels={revenueChartData.labels}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Project Status Card */}
        <div
          className="rounded-[16px] flex flex-col overflow-hidden w-full lg:w-1/3 transition-colors duration-300"
          style={{
            height: "300px",
            fontFamily: "sans-serif",
            backgroundColor: isDarkMode ? "#1a1a1a" : "#FFFFFF",
            border: isDarkMode ? "1px solid rgba(255,255,255,0.2)" : "1px solid #e5e7eb",
            boxShadow: isDarkMode ? "0 1px 3px 0 rgba(0,0,0,0.3)" : "0 1px 3px 0 rgba(0,0,0,0.05)",
          }}
        >
          <div className="px-5 pt-4 pb-3">
            <h3 className="text-[18px] font-semibold mb-3" style={{ color: isDarkMode ? "white" : "#222529" }}>
              Project Status
            </h3>
            <div className="flex gap-2">
              <button
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors"
                style={{
                  backgroundColor: isDarkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.05)",
                  color: isDarkMode ? "white" : "#222529",
                  border: isDarkMode ? "1px solid rgba(255,255,255,0.3)" : "1px solid rgba(0,0,0,0.1)",
                }}
              >
                Metric
              </button>
              <DropdownWrapper
                value={projectStatusTimeRange}
                onChange={handleProjectStatusTimeRangeChange}
                options={[
                  { value: "today", label: "Today" },
                  { value: "yesterday", label: "Yesterday" },
                  { value: "week", label: "This Week" },
                  { value: "month", label: "This Month" },
                  { value: "all", label: "All Time" },
                ]}
                placeholder="Select"
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
          <div className="w-full h-px bg-gray-200 dark:bg-gray-700" />

          <div className="flex flex-1 items-center px-5 gap-6">
            <div className="relative flex items-center justify-center shrink-0" style={{ width: "120px", height: "120px" }}>
              <div className="relative w-full h-full">
                <div
                  className="absolute w-full h-full rounded-full"
                  style={{
                    background: isDarkMode
                      ? `conic-gradient(#34D399 0% ${projectStatus.completed}%, #FBBF24 ${projectStatus.completed}% ${projectStatus.completed + projectStatus.on_hold}%, #A78BFA ${projectStatus.completed + projectStatus.on_hold}% 100%)`
                      : `conic-gradient(#10B981 0% ${projectStatus.completed}%, #F59E0B ${projectStatus.completed}% ${projectStatus.completed + projectStatus.on_hold}%, #8B5CF6 ${projectStatus.completed + projectStatus.on_hold}% 100%)`,
                    borderRadius: "50%",
                  }}
                />
                <div
                  className="absolute rounded-full"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "calc(100% - 40px)",
                    height: "calc(100% - 40px)",
                    backgroundColor: isDarkMode ? "#1a1a1a" : "#FFFFFF",
                  }}
                />
              </div>
              <div
                className="absolute flex flex-col items-center justify-center rounded-full"
                style={{
                  width: "65px",
                  height: "65px",
                  backgroundColor: isDarkMode ? "#1a1a1a" : "#FFFFFF",
                  boxShadow: isDarkMode ? "0 0 0 1px rgba(255,255,255,0.2)" : "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <span className="text-[18px] font-bold" style={{ color: isDarkMode ? "#FFFFFF" : "#1F2937" }}>
                  {projectStatus.total}
                </span>
                <span className="text-[9px] font-medium text-center leading-tight" style={{ color: isDarkMode ? "#9CA3AF" : "#6B7280" }}>
                  Total Projects
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isDarkMode ? "#34D399" : "#10B981" }} />
                  <span className="text-[11px] font-medium whitespace-nowrap" style={{ color: isDarkMode ? "#FFFFFF" : "#374151" }}>
                    Completed
                  </span>
                </div>
                <span className="text-[11px] font-semibold whitespace-nowrap" style={{ color: isDarkMode ? "#FFFFFF" : "#374151" }}>
                  {projectStatus.completed}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isDarkMode ? "#FBBF24" : "#F59E0B" }} />
                  <span className="text-[11px] font-medium whitespace-nowrap" style={{ color: isDarkMode ? "#FFFFFF" : "#374151" }}>
                    On Hold
                  </span>
                </div>
                <span className="text-[11px] font-semibold whitespace-nowrap" style={{ color: isDarkMode ? "#FFFFFF" : "#374151" }}>
                  {projectStatus.on_hold}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isDarkMode ? "#A78BFA" : "#8B5CF6" }} />
                  <span className="text-[11px] font-medium whitespace-nowrap" style={{ color: isDarkMode ? "#FFFFFF" : "#374151" }}>
                    In Progress
                  </span>
                </div>
                <span className="text-[11px] font-semibold whitespace-nowrap" style={{ color: isDarkMode ? "#FFFFFF" : "#374151" }}>
                  {projectStatus.in_progress}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Card */}
        <div className="flex flex-col w-full lg:w-1/3 transition-colors duration-300 rounded-[8px]" style={{ height: "300px", fontFamily: "sans-serif" }}>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <h3 className={`text-[22px] font-bold ${isDarkMode ? "text-white" : "text-[#1e293b]"}`}>Progress</h3>
              <div className="flex items-center text-[#3CD4A0] text-xs font-bold gap-0.5">
                <TrendingUp size={12} strokeWidth={3} />
                <span>{progressGrowth > 0 ? "+" : ""}{progressGrowth}%</span>
              </div>
            </div>
            <div className={`border p-0.5 rounded-full flex items-center gap-1 transition-colors ${isDarkMode ? "bg-black border-white/30" : "bg-gray-100 border-gray-300"}`}>
              <button
                onClick={() => handleProgressViewChange("Month")}
                className={`text-[9px] px-3 py-1 rounded-full font-bold transition-all ${progressView === "Month"
                  ? isDarkMode ? "bg-gray-100 text-black" : "bg-[#31135E] text-white"
                  : isDarkMode ? "text-white/60 hover:bg-gray-100/10" : "text-[#64748B] hover:bg-black/5"
                  }`}
              >
                Month
              </button>
              <button
                onClick={() => handleProgressViewChange("Week")}
                className={`text-[9px] px-3 py-1 rounded-full font-bold transition-all ${progressView === "Week"
                  ? isDarkMode ? "bg-gray-100 text-black" : "bg-[#31135E] text-white"
                  : isDarkMode ? "text-white/60 hover:bg-gray-100/10" : "text-[#64748B] hover:bg-black/5"
                  }`}
              >
                Week
              </button>
            </div>
          </div>

          <div
            className={`rounded-[22px] p-4 flex gap-3 h-full overflow-hidden items-stretch shadow-sm transition-colors duration-300 ${isDarkMode ? "border border-white/20 bg-[#1a1a1a]" : "bg-gradient-to-br from-[#F8F5FF] to-[#F0EBFF]"
              }`}
          >
            <div className="flex flex-col justify-between py-1 w-20 shrink-0">
  {[
    ["All Task", progressData.allTask],
    ["Done", progressData.done],
    ["In Progress", progressData.inProgress],
  ].map(([l, v], i) => (
    <div key={i} className="flex flex-col">
      <span
        className={`text-[10px] font-bold ${
          isDarkMode ? "text-white/70" : "text-[#1e293b]"
        }`}
      >
        {l}
      </span>
      <span
        className={`text-[22px] font-bold leading-tight ${
          isDarkMode ? "text-white" : "text-[#6D28D9]"
        }`}
      >
        {v}
      </span>
    </div>
  ))}
</div>

            <div className="flex-1 flex items-end justify-between gap-1 pb-1 relative h-full">
              {progressChartData.labels.map((label, i) => {
                const value = progressChartData.data[i] || 0;
                const maxValue = Math.max(...progressChartData.data, 1);
                const height = `${(value / maxValue) * 100}%`;
                const isActive = i === 2;
                return (
                  <div key={i} className="flex flex-col items-center justify-end h-full w-full gap-2">
                    <div className="relative w-full flex flex-col items-center justify-end h-full">
                      <div
                        className={`w-full max-w-[22px] rounded-full ${isDarkMode ? (isActive ? "bg-gray-100" : "bg-gray-100/40") : isActive ? "bg-[#6D28D9]" : "bg-[#C4B5FD]"
                          }`}
                        style={{ height }}
                      />
                    </div>
                    <span className={`text-[9px] font-bold whitespace-nowrap ${isDarkMode ? "text-white/60" : "text-[#1e293b]"}`}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Active Projects Table */}
      <div className={`w-full mt-10 transition-colors duration-300`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <h3 className={`text-xl lg:text-[28px] font-bold tracking-tight ${isDarkMode ? "text-white" : "text-black"}`}>
              Active projects
            </h3>
            <span className={`text-lg font-medium pt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              ({activeProjects.length})
            </span>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by client or project..."
                value={projectSearchTerm}
                onChange={(e) => setProjectSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleProjectSearch()}
                className={`pl-10 pr-4 py-2 rounded-xl border-2 focus:outline-none focus:border-purple-500 transition-colors w-64 ${isDarkMode
                  ? "bg-gray-800 border-purple-500 text-white placeholder-gray-400"
                  : "bg-white border-purple-400 text-black placeholder-gray-500"
                  }`}
                style={{
                  boxShadow: isDarkMode
                    ? "0 0 0 1px rgba(139,92,246,0.4)"
                    : "0 0 0 1px rgba(139,92,246,0.25)",
                }}
              />
            </div>
            <button
              onClick={handleProjectSearch}
              disabled={isSearching}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${isDarkMode ? "bg-purple-600 hover:bg-purple-700 text-white" : "bg-[#3D1768] hover:bg-[#2D0D58] text-white"
                } disabled:opacity-50 disabled:hover:scale-100`}
            >
              {isSearching ? <Loader size={16} className="animate-spin" /> : "Search"}
            </button>
            {projectSearchTerm && (
              <button
                onClick={() => {
                  setProjectSearchTerm("");
                  fetchActiveProjects("");
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${isDarkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-black"
                  }`}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className={`border rounded-lg ${isDarkMode ? "bg-[#1a1a1a] border-white/20" : "bg-white border-gray-300"} shadow-lg overflow-x-auto`}>
          <div className="overflow-x-auto">
            <table
              className="w-full text-left min-w-[1000px]"
              style={{ tableLayout: "fixed", borderCollapse: "collapse" }}
            >
              <colgroup>
                <col style={{ width: "22%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "23%" }} />
                <col style={{ width: "17%" }} />
                <col style={{ width: "16%" }} />
              </colgroup>
              <thead>
                <tr
                  className={`text-[14px] font-semibold ${isDarkMode ? "text-white" : "text-white"}`}
                  style={isDarkMode ? { background: "linear-gradient(90deg, #3b0764 0%, #2e1065 100%)" } : { background: "linear-gradient(90deg, #4C1D95 0%, #5B21B6 100%)" }}
                >
                  <th className="py-3 pl-6 pr-2 text-left text-[13px] font-semibold whitespace-nowrap border-b-2" style={{ borderBottomColor: isDarkMode ? "rgba(255,255,255,0.3)" : "#9f7aea" }}>Project Details</th>
                  <th className="py-3 px-3 text-left text-[13px] font-semibold whitespace-nowrap border-b-2" style={{ borderBottomColor: isDarkMode ? "rgba(255,255,255,0.3)" : "#9f7aea" }}>Project Info</th>
                  <th className="py-3 px-3 text-left text-[13px] font-semibold whitespace-nowrap border-b-2" style={{ borderBottomColor: isDarkMode ? "rgba(255,255,255,0.3)" : "#9f7aea" }}>Budget</th>
                  <th className="py-3 px-3 text-left text-[13px] font-semibold whitespace-nowrap border-b-2" style={{ borderBottomColor: isDarkMode ? "rgba(255,255,255,0.3)" : "#9f7aea" }}>Timeline</th>
                  <th className="py-3 px-3 text-left text-[13px] font-semibold whitespace-nowrap border-b-2" style={{ borderBottomColor: isDarkMode ? "rgba(255,255,255,0.3)" : "#9f7aea" }}>Status</th>
                  <th className="py-3 pr-6 pl-3 text-left text-[13px] font-semibold whitespace-nowrap border-b-2" style={{ borderBottomColor: isDarkMode ? "rgba(255,255,255,0.3)" : "#9f7aea" }}>Progress</th>
                </tr>
              </thead>
              <tbody>
                {paginatedActiveProjects.length > 0 ? (
                  paginatedActiveProjects.map((row, i) => {
                    const progressNum = parseInt(row.progress) || 0;
                    const barColor =
                      progressNum >= 80 ? "#22c55e"
                        : progressNum >= 50 ? "#3b82f6"
                          : progressNum >= 20 ? "#f59e0b"
                            : "#8b5cf6";

                    const isOverdue = row.time?.toLowerCase().includes("overdue");
                    const isDue = !isOverdue && row.time?.toLowerCase().includes("due");

                    const statusStyle = (() => {
                      const s = row.status || "";
                      if (s === "Completed" || s === "All Milestones Completed")
                        return { dot: "#22c55e", bg: isDarkMode ? "#052e16" : "#f0fdf4", text: isDarkMode ? "#86efac" : "#15803d", border: isDarkMode ? "#166534" : "#86efac" };
                      if (s === "In Progress")
                        return { dot: "#3b82f6", bg: isDarkMode ? "#0c1a2e" : "#eff6ff", text: isDarkMode ? "#93c5fd" : "#1d4ed8", border: isDarkMode ? "#1e40af" : "#93c5fd" };
                      if (s?.includes("Milestones Done"))
                        return { dot: "#8b5cf6", bg: isDarkMode ? "#1e1040" : "#f5f3ff", text: isDarkMode ? "#c4b5fd" : "#5b21b6", border: isDarkMode ? "#4c1d95" : "#c4b5fd" };
                      if (s?.includes("Under Review"))
                        return { dot: "#f97316", bg: isDarkMode ? "#1c0f00" : "#fff7ed", text: isDarkMode ? "#fdba74" : "#c2410c", border: isDarkMode ? "#9a3412" : "#fdba74" };
                      if (s === "Awaiting")
                        return { dot: "#f59e0b", bg: isDarkMode ? "#1c1500" : "#fffbeb", text: isDarkMode ? "#fcd34d" : "#92400e", border: isDarkMode ? "#854d0e" : "#fcd34d" };
                      return { dot: "#6b7280", bg: isDarkMode ? "#111" : "#f9fafb", text: isDarkMode ? "#9ca3af" : "#374151", border: isDarkMode ? "#374151" : "#d1d5db" };
                    })();

                    const statusLabel = (() => {
                      const s = row.status || "";
                      if (s === "All Milestones Completed") return "All Milestones Done";
                      if (s?.includes("Under Review")) return "Under Review";
                      return s;
                    })();

                    const categoryStyle = (() => {
                      const c = row.project_category || "";
                      if (c === "Milestone Based")
                        return { bg: isDarkMode ? "#1e1040" : "#f5f3ff", text: isDarkMode ? "#c4b5fd" : "#5b21b6", border: isDarkMode ? "#4c1d95" : "#c4b5fd", dot: "#8b5cf6" };
                      if (c === "Small")
                        return { bg: isDarkMode ? "#0c1a2e" : "#eff6ff", text: isDarkMode ? "#93c5fd" : "#1d4ed8", border: isDarkMode ? "#1e40af" : "#93c5fd", dot: "#3b82f6" };
                      return { bg: isDarkMode ? "#1c1500" : "#fffbeb", text: isDarkMode ? "#fcd34d" : "#92400e", border: isDarkMode ? "#854d0e" : "#fcd34d", dot: "#f59e0b" };
                    })();

                    return (
                      <tr
                        key={`${row.id}-${i}`}
                        style={{
                          borderBottom: i === paginatedActiveProjects.length - 1
                            ? "none"
                            : isDarkMode
                              ? "1px solid #374151"
                              : "1px solid #9ca3af",
                          transition: "all 0.15s ease"
                        }}
                        className={`transition-all duration-150 ${isDarkMode
                          ? "text-gray-300 hover:bg-white/5"
                          : "text-gray-700 hover:bg-purple-50"
                          }`}
                      >
                        <td className="py-4 pl-6 pr-2">
                          <div className="flex items-start gap-3" style={{ minWidth: 0 }}>
                            <div
                              className="w-9 h-9 rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-sm font-medium"
                              style={{
                                background: isDarkMode ? "#1e1040" : "#f3ecff",
                                border: `1px solid ${isDarkMode ? "#4c1d95" : "#c4a8e8"}`,
                                color: isDarkMode ? "#c4b5fd" : "#3D1768",
                              }}
                            >
                              {typeof row.img === "string" && row.img.startsWith("http") ? (
                                <img
                                  src={row.img}
                                  alt={row.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.style.display = "none"; if (e.target.parentNode) e.target.parentNode.innerText = row.name?.charAt(0)?.toUpperCase(); }}
                                />
                              ) : (
                                row.name?.charAt(0)?.toUpperCase()
                              )}
                            </div>

                            <div style={{ minWidth: 0, flex: 1 }}>
                              <TruncatedText
                                text={row.name}
                                as="p"
                                isDarkMode={isDarkMode}
                                style={{ color: isDarkMode ? "#fff" : "#111827", fontWeight: 500, fontSize: "13px", lineHeight: "1.3", marginBottom: "4px" }}
                              />

                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                                style={{
                                  background: categoryStyle.bg,
                                  color: categoryStyle.text,
                                  border: `0.5px solid ${categoryStyle.border}`,
                                  maxWidth: "100%",
                                }}
                              >
                                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: categoryStyle.dot }} />
                                <span className="truncate">{row.project_category}</span>
                              </span>

                              <div style={{ display: "flex", alignItems: "center", gap: "3px", marginTop: "4px" }}>
                                <span style={{ color: isDarkMode ? "rgba(255,255,255,0.55)" : "#374151", fontWeight: 500, fontSize: "11px", flexShrink: 0 }}>Project:</span>
                                <TruncatedText
                                  text={row.project}
                                  as="span"
                                  isDarkMode={isDarkMode}
                                  style={{ color: isDarkMode ? "rgba(255,255,255,0.45)" : "#6b7280", fontSize: "11px" }}
                                />
                              </div>

                              {row.project_owner && (
                                <TruncatedText
                                  text={`👤 ${row.project_owner_type}: ${row.project_owner}`}
                                  as="p"
                                  isDarkMode={isDarkMode}
                                  style={{ color: isDarkMode ? "#a78bfa" : "#7c3aed", fontSize: "10px", marginTop: "2px" }}
                                />
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-3">
                          <TruncatedText
                            text={row.project}
                            as="p"
                            isDarkMode={isDarkMode}
                            style={{ color: isDarkMode ? "#fff" : "#111827", fontWeight: 500, fontSize: "13px", marginBottom: "6px" }}
                          />
                          <div>
                            <TruncatedText
                              text={row.project_owner_type || "General"}
                              as="span"
                              isDarkMode={isDarkMode}
                              style={{
                                display: "inline-block",
                                fontSize: "10px",
                                fontWeight: 500,
                                padding: "2px 8px",
                                borderRadius: "999px",
                                background: isDarkMode ? "rgba(255,255,255,0.08)" : "#f3f4f6",
                                color: isDarkMode ? "#d1d5db" : "#4b5563",
                                border: `0.5px solid ${isDarkMode ? "rgba(255,255,255,0.12)" : "#e5e7eb"}`,
                              }}
                            />
                          </div>
                        </td>
                        <td className="py-4 px-3">
                          <p className="text-[15px] font-semibold" style={{ color: isDarkMode ? "#4ade80" : "#16a34a" }}>
                            {row.price}
                          </p>
                          <p className="text-[10px] mt-0.5" style={{ color: isDarkMode ? "rgba(255,255,255,0.35)" : "#9ca3af" }}>
                            Total budget
                          </p>
                        </td>
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-1 mb-2">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, color: isDarkMode ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            <TruncatedText
                              text={row.start_date}
                              as="span"
                              isDarkMode={isDarkMode}
                              style={{ fontSize: "11px", color: isDarkMode ? "rgba(255,255,255,0.5)" : "#6b7280" }}
                            />
                            <span style={{ flexShrink: 0, fontSize: "11px", color: isDarkMode ? "rgba(255,255,255,0.25)" : "#d1d5db" }}>→</span>
                            <TruncatedText
                              text={row.end_date}
                              as="span"
                              isDarkMode={isDarkMode}
                              style={{ fontSize: "11px", color: isDarkMode ? "rgba(255,255,255,0.5)" : "#6b7280" }}
                            />
                          </div>

                          <div
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                            style={{
                              maxWidth: "100%",
                              ...(isOverdue
                                ? { background: isDarkMode ? "#1c0000" : "#fef2f2", color: isDarkMode ? "#fca5a5" : "#b91c1c", border: `0.5px solid ${isDarkMode ? "#991b1b" : "#fca5a5"}` }
                                : isDue
                                  ? { background: isDarkMode ? "#0c1a2e" : "#eff6ff", color: isDarkMode ? "#93c5fd" : "#1d4ed8", border: `0.5px solid ${isDarkMode ? "#1e40af" : "#93c5fd"}` }
                                  : { background: isDarkMode ? "rgba(255,255,255,0.05)" : "#f9fafb", color: isDarkMode ? "rgba(255,255,255,0.5)" : "#6b7280", border: `0.5px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "#e5e7eb"}` }),
                            }}
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <TruncatedText
                              text={row.time || "N/A"}
                              as="span"
                              isDarkMode={isDarkMode}
                              style={{ fontSize: "11px", fontWeight: 500 }}
                            />
                          </div>
                        </td>
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-2" style={{ minWidth: 0 }}>
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: statusStyle.dot }} />
                            <div style={{ maxWidth: "calc(100% - 24px)" }}>
                              <TruncatedText
                                text={statusLabel}
                                as="span"
                                isDarkMode={isDarkMode}
                                style={{
                                  display: "inline-block",
                                  padding: "4px 10px",
                                  borderRadius: "999px",
                                  fontSize: "11px",
                                  fontWeight: 500,
                                  background: statusStyle.bg,
                                  color: statusStyle.text,
                                  border: `0.5px solid ${statusStyle.border}`,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-6 pl-3">
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="rounded-full overflow-hidden"
                              style={{
                                flex: 1,
                                height: "6px",
                                background: isDarkMode ? "rgba(255,255,255,0.08)" : "#f3f4f6",
                                border: `0.5px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "#e5e7eb"}`,
                              }}
                            >
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: row.progress, background: barColor }}
                              />
                            </div>
                            <span
                              className="text-[12px] font-medium shrink-0"
                              style={{ color: isDarkMode ? "#fff" : "#374151", minWidth: "32px", textAlign: "right" }}
                            >
                              {row.progress}
                            </span>
                          </div>

                          {row.is_milestone_based && (
                            <div className="flex items-center gap-1 text-[10px]" style={{ color: isDarkMode ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>
                              <span style={{ color: "#22c55e", flexShrink: 0 }}>✓</span>
                              <TruncatedText
                                text={`${row.completed_milestones}/${row.total_milestones} milestones`}
                                as="span"
                                isDarkMode={isDarkMode}
                                style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                              />
                              <span className="w-1 h-1 rounded-full shrink-0" style={{ background: isDarkMode ? "#374151" : "#d1d5db" }} />
                              <span style={{ color: "#3b82f6", flexShrink: 0 }}>⚡</span>
                              <TruncatedText
                                text={`${row.total_milestones > 0 ? Math.round((row.completed_milestones / row.total_milestones) * 100) : 0}% done`}
                                as="span"
                                isDarkMode={isDarkMode}
                                style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                              />
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-gray-500">
                      {projectSearchTerm ? "No active projects match your search" : "No active projects found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Active Projects Pagination */}
          {totalActiveProjectsPages > 1 && (
            <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 px-4 py-3 text-sm font-medium ${isDarkMode ? "text-white" : "text-black"}`}>
              <div className={`flex items-center gap-2 order-2 sm:order-1 ${isDarkMode ? "text-white/80" : "text-gray-600"}`}>
                <span>Rows per page</span>
                <select
                  value={activeProjectsPageSize}
                  className={`bg-transparent px-3 py-1 rounded-full font-medium border-2 focus:outline-none cursor-pointer ${isDarkMode ? "text-white border-white hover:bg-white/10" : "text-black border-gray-400 hover:bg-gray-100"}`}
                >
                  <option className="text-black" value="5">5</option>
                </select>
                <span>{activeProjects.length > 0 ? `${(activeProjectsCurrentPage - 1) * activeProjectsPageSize + 1}-${Math.min(activeProjectsCurrentPage * activeProjectsPageSize, activeProjects.length)} of ${activeProjects.length} projects` : "0 projects"}</span>
              </div>
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <button
                  onClick={() => setActiveProjectsCurrentPage(1)}
                  disabled={activeProjectsCurrentPage === 1}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 ${isDarkMode ? "border-white text-white hover:bg-white/10" : "border-gray-400 text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <ChevronsLeft size={13} />
                </button>
                <button
                  onClick={() => setActiveProjectsCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={activeProjectsCurrentPage === 1}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 ${isDarkMode ? "border-white text-white hover:bg-white/10" : "border-gray-400 text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <ChevronLeft size={13} />
                </button>
                {totalActiveProjectsPages > 0 && [...Array(Math.min(5, totalActiveProjectsPages))].map((_, i) => {
                  let pageNum;
                  if (totalActiveProjectsPages <= 5) pageNum = i + 1;
                  else if (activeProjectsCurrentPage <= 3) pageNum = i + 1;
                  else if (activeProjectsCurrentPage >= totalActiveProjectsPages - 2) pageNum = totalActiveProjectsPages - 4 + i;
                  else pageNum = activeProjectsCurrentPage - 2 + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setActiveProjectsCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs transition-all duration-200 hover:scale-110 ${activeProjectsCurrentPage === pageNum
                        ? "text-white"
                        : isDarkMode ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"
                        }`}
                      style={activeProjectsCurrentPage === pageNum ? { background: "linear-gradient(90deg, #4C1D95 0%, #5B21B6 100%)" } : {}}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setActiveProjectsCurrentPage((prev) => Math.min(totalActiveProjectsPages, prev + 1))}
                  disabled={activeProjectsCurrentPage === totalActiveProjectsPages}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 ${isDarkMode ? "border-white text-white hover:bg-white/10" : "border-gray-400 text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <ChevronRight size={13} />
                </button>
                <button
                  onClick={() => setActiveProjectsCurrentPage(totalActiveProjectsPages)}
                  disabled={activeProjectsCurrentPage === totalActiveProjectsPages}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 ${isDarkMode ? "border-white text-white hover:bg-white/10" : "border-gray-400 text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <ChevronsRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className={`h-screen flex overflow-hidden ${isDarkMode ? "bg-black text-white" : "bg-gray-100 text-black"}`}>
      {/* Sidebar */}
      <div className="relative">
        <div className="absolute top-0 left-0 z-50 w-[260px] px-6 py-6">
          <h1 className={`font-bold trochut-font cursor-pointer text-[24px] md:text-[34px] leading-[100%] ${isDarkMode ? "text-white" : "text-[#3D1768]"}`} onClick={() => handleNavigation("dashboard")}>
            Talenta
          </h1>
        </div>

        <aside
          className={`fixed inset-y-0 left-0 z-40 w-[260px] pt-20 flex flex-col transform transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:h-screen`}
          style={{ backgroundImage: `url(${sidebarBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
        >
          {isDarkMode && <div className="absolute inset-0 bg-black/80 z-0" />}
          {!isDarkMode && <div className="absolute inset-0 bg-gray-100/30 backdrop-blur-[1px]" />}
          <div className={`absolute inset-0 ${isDarkMode ? "bg-black/10" : "bg-black/20"} backdrop-blur-[2px]`} />

          <div className="relative z-10 flex flex-col h-full">
            <button className="lg:hidden absolute top-4 right-4 text-white" onClick={() => setIsSidebarOpen(false)}>
              <X size={24} />
            </button>
            <div className="px-3 py-6 flex-1 overflow-y-auto mt-4">
              <nav className="space-y-2">
                <div onClick={() => handleNavigation("dashboard")} className={getSidebarLinkClass("dashboard")}>
                  <LayoutGrid size={20} /><span>Dashboard</span>
                </div>
                <div onClick={() => handleNavigation("users")} className={getSidebarLinkClass("users")}>
                  <User size={20} /><span>Users</span>
                </div>
                <div onClick={() => handleNavigation("subscription")} className={getSidebarLinkClass("subscription")}>
                  <Ticket size={20} /><span>Subscription</span>
                </div>
                <div onClick={() => handleNavigation("analytics")} className={getSidebarLinkClass("analytics")}>
                  <LineChart size={20} /><span>Analytics</span>
                </div>
                <div onClick={() => handleNavigation("options")} className={getSidebarLinkClass("options")}>
                  <ListChecks size={20} /><span>Options</span>
                </div>
                <div onClick={() => handleNavigation("setting")} className={getSidebarLinkClass("setting")}>
                  <Settings size={20} /><span>Settings</span>
                </div>
              </nav>
            </div>
          </div>
        </aside>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className={`sticky top-0 z-30 h-[80px] px-4 lg:px-8 flex items-center justify-between shrink-0 ${isDarkMode ? "bg-black/90 backdrop-blur-sm border-b border-white/10" : "bg-gray-100/90 backdrop-blur-sm border-b border-black/10"}`}>
          <button className="lg:hidden p-2 rounded-lg hover:bg-black/10 dark:hover:bg-gray-100/10 transition-colors" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} className={isDarkMode ? "text-white" : "text-black"} />
          </button>

          <div className="lg:hidden flex items-center">
            <span className={`text-sm font-medium ${isDarkMode ? "text-white/70" : "text-black/70"}`}>
              {currentView === "dashboard" ? "Dashboard" : currentView === "users" ? "User Management" : currentView === "subscription" ? "Subscriptions" : currentView === "analytics" ? "Analytics" : currentView === "options" ? "Manage Options" : "Settings"}
            </span>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {/* Theme Toggle Button */}
            <Tooltip text={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"} isDarkMode={isDarkMode}>
              <button
                onClick={toggleTheme}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ${isDarkMode
                  ? "bg-yellow-500/20 border border-yellow-500/50 hover:bg-yellow-500/30"
                  : "bg-purple-500/20 border border-purple-500/50 hover:bg-purple-500/30"
                  }`}
              >
                {isDarkMode ? (
                  <Sun size={20} className="text-yellow-400" />
                ) : (
                  <Moon size={20} className="text-purple-400" />
                )}
              </button>
            </Tooltip>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500/30 hover:border-purple-500 transition-all duration-200 hover:scale-110 flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600"
              >
                <Bell size={20} className="text-white" />
              </button>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-lg">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>

            {showNotifications && (
              <div ref={notificationRef} className="absolute right-6 top-16 w-[380px] rounded-xl shadow-lg z-[999] max-h-[450px] overflow-y-auto" style={{
                backgroundColor: document.documentElement.classList.contains("dark") ? "#1a1a1a" : "white",
                border: document.documentElement.classList.contains("dark") ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #e5e7eb",
                boxShadow: document.documentElement.classList.contains("dark") ? "0 10px 25px -5px rgba(0, 0, 0, 0.5)" : "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
              }}>
                <style>{`.notification-scroll { scrollbar-width: none; -ms-overflow-style: none; } .notification-scroll::-webkit-scrollbar { display: none; }`}</style>
                <div className="flex justify-between items-center px-4 py-3 border-b sticky top-0 z-10" style={{
                  backgroundColor: document.documentElement.classList.contains("dark") ? "#1a1a1a" : "white",
                  borderBottomColor: document.documentElement.classList.contains("dark") ? "rgba(255, 255, 255, 0.1)" : "#e5e7eb",
                }}>
                  <h3 className="font-semibold text-sm" style={{ color: document.documentElement.classList.contains("dark") ? "white" : "#1f2937" }}>
                    Notifications {unreadCount > 0 && <span className="ml-2 text-xs font-normal px-1.5 py-0.5 rounded-full bg-red-500 text-white">{unreadCount} new</span>}
                  </h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && <button onClick={handleMarkAll} className="text-xs px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-100/10 transition-colors" style={{ color: document.documentElement.classList.contains("dark") ? "white" : "#9333ea" }}>Mark all read</button>}
                    {notifications.length > 0 && <button onClick={clearAllNotifications} className="text-xs px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" style={{ color: document.documentElement.classList.contains("dark") ? "#f87171" : "#dc2626" }}>Clear all</button>}
                    <button onClick={() => setShowNotifications(false)} className="w-5 h-5 flex items-center justify-center rounded-full transition-colors cursor-pointer hover:scale-110" style={{ backgroundColor: document.documentElement.classList.contains("dark") ? "#333" : "#e5e7eb" }}>
                      <X size={12} className={isDarkMode ? "text-white" : "text-gray-600"} />
                    </button>
                  </div>
                </div>
                <div className="notification-scroll max-h-[380px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center"><Bell size={32} className="mx-auto mb-2 opacity-30" /><div className="text-sm font-medium">No notifications</div></div>
                  ) : (
                    notifications.map((n) => {
                      const isRead = n.is_read;
                      return (
                        <div key={n.id} onClick={() => !isRead && markNotificationRead(n.id)} className="flex gap-3 px-4 py-3 border-b cursor-pointer transition-all hover:bg-purple-50/10" style={{
                          borderBottomColor: document.documentElement.classList.contains("dark") ? "rgba(255, 255, 255, 0.05)" : "#f3f4f6",
                          backgroundColor: isRead ? "transparent" : document.documentElement.classList.contains("dark") ? "rgba(139, 92, 246, 0.1)" : "#faf5ff",
                          opacity: isRead ? 0.7 : 1,
                        }}>
                          <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: document.documentElement.classList.contains("dark") ? "rgba(255, 255, 255, 0.15)" : "#e9d5ff" }}>
                            <img src={n.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(n.title || "User")}&background=8b5cf6&color=ffffff`} alt="user" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="text-sm font-semibold truncate">{n.title}</div>
                              {!isRead && <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: document.documentElement.classList.contains("dark") ? "#a78bfa" : "#9333ea" }}></div>}
                            </div>
                            <div className="text-xs mt-0.5 line-clamp-2">{n.subtitle}</div>
                            <div className="text-[10px] mt-1.5 flex items-center gap-2">
                              <span>{new Date(n.time).toLocaleString()}</span>
                              {isRead && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-100/10">Read</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Profile Section */}
            <div className="relative" ref={profileDropdownRef}>
              <div className="flex items-center gap-3 cursor-pointer group" onClick={handleProfileClick}>
                <span className="font-medium hidden sm:inline transition-colors group-hover:text-purple-600 dark:group-hover:text-purple-400" style={{ color: isDarkMode ? "white" : "black" }}>{adminName || "Admin"}</span>
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500/30 group-hover:border-purple-500 transition-all duration-200 group-hover:scale-110 flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600">
                  {profileImage ? <img src={profileImage} className="w-full h-full object-cover" alt="Profile" /> : <User size={20} className="text-white" />}
                </div>
                <ChevronDown size={16} className={`transition-transform duration-200 ${showProfileDropdown ? "rotate-180" : ""} group-hover:text-purple-500 ${isDarkMode ? "text-white" : "text-black"}`} />
              </div>

              {showProfileDropdown && (
                <div className={`absolute right-0 mt-2 w-56 rounded-lg shadow-lg overflow-hidden z-50 ${isDarkMode ? "bg-[#1E1E1E] border border-white/20" : "bg-white border border-gray-200"}`}>
                  <div className={`px-4 py-3 border-b ${isDarkMode ? "border-white/10" : "border-gray-100"}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500/30 flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600">
                        {profileImage ? <img src={profileImage} className="w-full h-full object-cover" alt="Profile" /> : <User size={20} className="text-white" />}
                      </div>
                      <div><p className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{adminName || "Admin"}</p><p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p></div>
                    </div>
                  </div>
                  <div className="py-1">
                    <button onClick={handleSettingNavigation} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 ${isDarkMode ? "text-gray-300 hover:bg-gray-800 hover:pl-6" : "text-gray-700 hover:bg-gray-200 hover:pl-6"}`}><Settings size={18} /><span>Settings</span></button>
                    <button onClick={handleLogoutFromDropdown} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 ${isDarkMode ? "text-red-400 hover:bg-gray-800 hover:pl-6" : "text-red-600 hover:bg-gray-200 hover:pl-6"}`}><LogOut size={18} /><span>Logout</span></button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main ref={mainContentRef} className="flex-1 overflow-y-auto px-4 lg:px-8 py-6">
          {loading && currentView === "dashboard" && <div className="flex items-center justify-center h-64"><Loader size={40} className="animate-spin text-purple-600" /></div>}
          {!loading && currentView === "dashboard" && renderDashboard()}
          {currentView === "users" && <UserPage />}
          {currentView === "subscription" && <SubscriptionPage />}
          {currentView === "analytics" && <Analytics />}
          {currentView === "options" && <OptionsPage />}
          {currentView === "setting" && <Setting />}
        </main>
      </div>

      {/* Logout Modal */}
      {showLogoutPopup && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className={`rounded-2xl p-6 w-[360px] text-center ${isDarkMode ? "bg-black border border-white/20" : "bg-gray-100 border border-gray-200 shadow-lg"}`}>
            <div className="mx-auto mb-4 w-24 h-24 flex items-center justify-center">
              <svg className="w-20 h-20 animate-bounce" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11" stroke={isDarkMode ? "#9F7AEA" : "#3D1768"} strokeWidth="1.5" strokeDasharray="69" className="animate-spin" fill="none" />
                <circle cx="12" cy="8" r="4" fill={isDarkMode ? "#9F7AEA" : "#3D1768"} className="animate-pulse" />
                <path d="M4 20 Q4 14 12 14 Q20 14 20 20" fill={isDarkMode ? "#9F7AEA" : "#3D1768"} />
                <circle cx="10" cy="7" r="0.8" fill="white" />
                <circle cx="14" cy="7" r="0.8" fill="white" />
              </svg>
            </div>
            <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-black"}`}>Logout</h3>
            <p className={`mb-6 ${isDarkMode ? "text-white/60" : "text-gray-500"}`}>Are you sure you want to logout?</p>
            <div className="flex items-center justify-between gap-4 mt-6 w-full">
              <button
                onClick={() => setShowLogoutPopup(false)}
                className="flex-1 h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-[15px] border border-red-400 shadow-lg shadow-red-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white font-bold text-[15px] border border-purple-400 shadow-lg shadow-purple-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-95"
              >
                Confirm Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile overlay */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
    </div>
  );
};

export default Dashboard;