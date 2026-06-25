import React, { useState, useEffect, useRef } from "react";
import {
  CheckCircle,
  ChevronsUpDown,
  Users,
  BookMarked,
  CheckCircle2,
  Contact,
  Download,
  Loader,
  Plus,
  Edit,
  Trash2,
  User,
  Users2,
  X,
  Eye,
  FileText,
  Mail,
  FileSignature,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Search,
} from "lucide-react";
import toast from "../../component/Toast";
import api from "../../utils/axiosConfig";
// Import the data update emitter from Dashboard
import { dataUpdateEmitter } from "./Dashboard";

// In your component or API config file
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

// API Configuration
const PAYMENT_API_URL = `${API_BASE_URL}/payment`;
const ADMIN_API_URL = `${API_BASE_URL}/admin`;
const PLANS_API_URL = `${API_BASE_URL}/plans`;

// Custom Dropdown Component
const CustomDropdown = ({
  value,
  onChange,
  options,
  placeholder,
  isDarkMode,
  disabled = false,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {label && (
        <label
          className={`text-sm mb-2 block font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
        >
          {label} <span className="text-red-500">*</span>
        </label>
      )}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          width: "100%",
          backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
          border: isDarkMode ? "2px solid #6B7280" : "2px solid #9CA3AF",
          borderRadius: "12px",
          padding: "10px 16px",
          fontSize: "14px",
          fontWeight: "500",
          color: isDarkMode ? "#FFFFFF" : "#000000",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
      >
        <span className={!selectedOption ? "opacity-60" : ""}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          size={16}
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {isOpen && !disabled && (
        <div
          className={`absolute z-50 w-full mt-1 rounded-lg shadow-lg overflow-hidden ${
            isDarkMode
              ? "bg-gray-800 border border-gray-600"
              : "bg-gray-100 border border-gray-200"
          }`}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-[14px] transition-colors ${
                isDarkMode
                  ? "text-white hover:bg-gray-700"
                  : "text-black hover:bg-gray-100"
              } ${value === option.value ? (isDarkMode ? "bg-gray-700" : "bg-gray-100") : ""}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Avatar component with fallback
const Avatar = ({ user }) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(user.full_name);
  const avatarColor = user.avatar_color || "#8B5CF6";
  const imageUrl = user.profile_image;

  if (imageUrl && !imageError) {
    return (
      <img
        src={imageUrl}
        alt={user.full_name}
        className="w-full h-full object-cover rounded-full"
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      className="w-full h-full flex items-center justify-center text-white font-semibold text-sm rounded-full"
      style={{ backgroundColor: avatarColor }}
    >
      {initials}
    </div>
  );
};

// Input style helper
const getInputStyle = (isDarkMode) => {
  return {
    width: "100%",
    backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
    border: isDarkMode ? "2px solid #6B7280" : "2px solid #9CA3AF",
    borderRadius: "12px",
    padding: "10px 16px",
    fontSize: "14px",
    color: isDarkMode ? "#FFFFFF" : "#000000",
    outline: "none",
  };
};

// Textarea style helper
const getTextareaStyle = (isDarkMode) => {
  return {
    width: "100%",
    backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
    border: isDarkMode ? "2px solid #6B7280" : "2px solid #9CA3AF",
    borderRadius: "12px",
    padding: "10px 16px",
    fontSize: "14px",
    color: isDarkMode ? "#FFFFFF" : "#000000",
    outline: "none",
    resize: "vertical",
  };
};

// Sortable Table Header Component - UPDATED
const SortableHeader = ({
  label,
  sortKey,
  currentSort,
  onSort,
  isDarkMode,
}) => {
  const isActive = currentSort.key === sortKey;
  const direction = currentSort.direction;

  return (
    <th
      className="py-3 px-4 cursor-pointer hover:bg-white/10 transition-colors"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center justify-between min-w-[100px]">
        <span className="text-[13px] font-semibold">{label}</span>
        <div className="flex flex-col">
          {isActive && direction === "asc" ? (
            <ArrowUp size={14} className="text-white/70" />
          ) : isActive && direction === "desc" ? (
            <ArrowDown size={14} className="text-white/70" />
          ) : (
            <ChevronsUpDown size={14} className="text-white/70" />
          )}
        </div>
      </div>
    </th>
  );
};

const SubscriptionPage = () => {
  const modalContentRef = useRef(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planRoleFilter, setPlanRoleFilter] = useState("all");
  const [historyPlanFilter, setHistoryPlanFilter] = useState("all");
  const [isLoading, setIsLoading] = useState({
    stats: false,
    plans: false,
    history: false,
    action: false,
  });
  const [hoveredPlanId, setHoveredPlanId] = useState(null);
  const [showAllPlans, setShowAllPlans] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [touchedFields, setTouchedFields] = useState({
    name: false,
    price: false,
    description: false,
    discount_percentage: false,
    discount_description: false,
    features: false,
  });

  // Search state for subscription history
  const [historySearchTerm, setHistorySearchTerm] = useState("");

  // Validation errors
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    price: "",
    description: "",
    discount_percentage: "",
    discount_description: "",
    features: "",
  });

  // Pagination states
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
  const [historyRowsPerPage, setHistoryRowsPerPage] = useState(5);
  const [plansCurrentPage, setPlansCurrentPage] = useState(1);
  const [plansRowsPerPage, setPlansRowsPerPage] = useState(6);

  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });

  // Form state
  const [planForm, setPlanForm] = useState({
    name: "",
    price: "",
    duration: "monthly",
    role: "creator",
    description: "",
    features: [""],
    discount_percentage: "",
    discount_description: "",
    is_popular: false,
    max_users: 10,
    max_upload_storage_gb: 10,
    max_proposals: 10,
    max_job_posts: 10,
    max_invitations: 10,
    max_contracts: 10,
  });

  const [stats, setStats] = useState({
    total_subscribers: 0,
    users_without_subscription: 0,
    plans: [], // Dynamic plans array
  });

  const [dynamicPlanCards, setDynamicPlanCards] = useState([]); // NEW: For stats cards
  const [pricingPlans, setPricingPlans] = useState([]);
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") return true;
    if (savedTheme === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Helper function to trigger dashboard updates
  const triggerDashboardUpdate = (action = "update", planName = "") => {
    dataUpdateEmitter.emit("subscriptionDataChanged", {
      action,
      source: "SubscriptionPage",
      planName,
    });
    dataUpdateEmitter.emit("dashboardDataUpdated", {
      source: "SubscriptionPage",
      action,
      planName,
    });
    localStorage.setItem("dashboardRefresh", Date.now().toString());
    localStorage.setItem("adminDataUpdated", Date.now().toString());
    console.log(
      `Dashboard update triggered: ${action} subscription plan - ${planName}`,
    );
  };

  // ======================================================
  // Helper to detect if a plan is Basic or Free (case-insensitive)
  // ======================================================
  const isBasicOrFreePlan = (planName) => {
    const lowerName = (planName || "").toLowerCase().trim();
    return lowerName === "basic" || lowerName === "free";
  };

  // ======================================================
  // UPDATED: Check for duplicate plan (same name OR same price for same role)
  // ======================================================
  const checkDuplicatePlan = (
    planName,
    planPrice,
    planRole,
    planDuration,
    excludePlanId = null,
  ) => {
    const duplicateByName = pricingPlans.find(
      (plan) =>
        plan.name.toLowerCase().trim() === planName.toLowerCase().trim() &&
        plan.role.toLowerCase() === planRole.toLowerCase() &&
        plan.duration === planDuration &&
        (excludePlanId === null || plan.id !== excludePlanId),
    );

    const duplicateByPrice = pricingPlans.find(
      (plan) =>
        Number(plan.price_value) === Number(planPrice) &&
        plan.role.toLowerCase() === planRole.toLowerCase() &&
        plan.duration === planDuration &&
        (excludePlanId === null || plan.id !== excludePlanId),
    );

    return {
      duplicateByName: !!duplicateByName,
      duplicateByPrice: !!duplicateByPrice,
    };
  };

  // ======================================================
  // Validate that Basic/Free plans are MONTHLY only
  // ======================================================
  const validateBasicFreeDuration = (planName, duration) => {
    if (isBasicOrFreePlan(planName) && duration === "yearly") {
      return false;
    }
    return true;
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortData = (data) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === "date") {
        aValue = new Date(aValue).getTime() || 0;
        bValue = new Date(bValue).getTime() || 0;
      } else if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      } else if (sortConfig.key === "plan") {
        aValue = aValue?.toLowerCase() || "";
        bValue = bValue?.toLowerCase() || "";
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

  const validateName = (name) => {
    if (!name || name.trim() === "") return "Plan name is required";
    if (name.length > 25) return "Plan name must be 25 characters or less";
    const regex = /^[A-Za-z\s]+$/;
    if (!regex.test(name))
      return "Only alphabets and spaces allowed (no numbers or special characters)";
    return "";
  };

  const validateDiscountPercentage = (value) => {
    if (value === "" || value === null) {
      return "";
    }

    // numbers only
    if (!/^\d+$/.test(value)) {
      return "Only numbers are allowed";
    }

    const num = parseInt(value, 10);

    if (num < 0) {
      return "Discount percentage cannot be negative";
    }

    if (num > 100) {
      return "Discount percentage cannot exceed 100";
    }

    return "";
  };

  const validateDiscountDescription = (description) => {
    if (!description || description.trim() === "") {
      return "";
    }
    if (description.length > 50)
      return "Discount description must be 50 characters or less";
    return "";
  };

  const validatePrice = (price) => {
    if (price === "" || price === null) return "Price is required";
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return "Must be a valid number";
    if (numPrice < 0) return "Price cannot be negative";
    if (numPrice === 0) return "";
    return "";
  };

  const validateDescription = (description) => {
    if (!description || description.trim() === "") {
      return "";
    }
    if (description.length > 30)
      return "Description must be 30 characters or less";
    const regex = /^[A-Za-z\s]+$/;
    if (!regex.test(description)) {
      return "Only alphabets and spaces allowed (no numbers or special characters like @, #, $, etc.)";
    }
    return "";
  };

  const validateFeatures = (features) => {
    const nonEmptyFeatures = features.filter((f) => f && f.trim() !== "");
    if (nonEmptyFeatures.length === 0)
      return "At least one feature is required";
    for (let i = 0; i < features.length; i++) {
      if (features[i] && features[i].trim() !== "") {
        if (features[i].length > 100) {
          return `Feature ${i + 1} must be 100 characters or less`;
        }
        const regex = /^[A-Za-z0-9\s]+$/;
        if (!regex.test(features[i])) {
          return `Feature ${i + 1} contains invalid characters. Only alphabets, numbers and spaces allowed`;
        }
      }
    }
    return "";
  };

  const sanitizeNumericInput = (value) => {
    if (value === "" || value === null) return "";
    const stringValue = String(value);
    const sanitized = stringValue.replace(/[^0-9]/g, "");
    if (sanitized === "") return "";
    return String(parseInt(sanitized, 10));
  };

  const handleFieldBlur = (field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    if (field === "description") {
      setValidationErrors({
        ...validationErrors,
        description: validateDescription(planForm.description),
      });
    } else if (field === "name") {
      setValidationErrors({
        ...validationErrors,
        name: validateName(planForm.name),
      });
    } else if (field === "price") {
      setValidationErrors({
        ...validationErrors,
        price: validatePrice(planForm.price),
      });
    }
  };

  // UPDATED: fetchStats with dynamic plan cards
  const fetchStats = async () => {
    setIsLoading((prev) => ({ ...prev, stats: true }));
    try {
      const response = await api.get(`${ADMIN_API_URL}/subscriptions/stats`);
      console.log("📊 Dynamic Stats API Response:", response.data);

      setStats({
        total_subscribers: response.data.total_subscribers || 0,
        users_without_subscription:
          response.data.users_without_subscription || 0,
        plans: response.data.plans || [],
      });

      // ✅ Create cards directly from the plans array
      const cards = [];
      if (response.data.plans && response.data.plans.length > 0) {
        response.data.plans.forEach((plan) => {
          // Get the actual counts
          const creatorCount = plan.creator_count || 0;
          const collaboratorCount = plan.collaborator_count || 0;

          // Add Creator card if plan supports creator role
          if (plan.role === "creator" || plan.role === "both") {
            cards.push({
              id: `${plan.name}_creator`,
              name: plan.name,
              role: "creator",
              users: creatorCount, // ✅ This will show 1 for JE CJA
              price_value: 0,
              duration: "monthly",
              features: [],
              is_basic_or_free:
                plan.name.toLowerCase() === "basic" ||
                plan.name.toLowerCase() === "free",
            });
          }

          // Add Collaborator card if plan supports collaborator role
          if (plan.role === "collaborator" || plan.role === "both") {
            cards.push({
              id: `${plan.name}_collaborator`,
              name: plan.name,
              role: "collaborator",
              users: collaboratorCount, // ✅ This will show 1 for afd
              price_value: 0,
              duration: "monthly",
              features: [],
              is_basic_or_free:
                plan.name.toLowerCase() === "basic" ||
                plan.name.toLowerCase() === "free",
            });
          }
        });
      }

      setDynamicPlanCards(cards);
      console.log("✅ Dynamic Plan Cards created:", cards);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to fetch subscription statistics");
    } finally {
      setIsLoading((prev) => ({ ...prev, stats: false }));
    }
  };

  // Add this function before deletePlan
  const checkPlanSubscribers = async (planId, planName) => {
    try {
      const response = await api.get(
        `${ADMIN_API_URL}/subscriptions/plan-subscribers/${planId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error checking plan subscribers:", error);
      return { count: 0, users: [] };
    }
  };

  // Update the deletePlan function
  const deletePlan = async (planId, planName, isBasicOrFree) => {
    if (isBasicOrFree) {
      toast.error(
        "You cannot delete a Basic or Free plan. These plans are mandatory and required for the system to function properly.",
      );
      return;
    }

    // First check if plan has subscribers
    try {
      const response = await api.get(
        `${ADMIN_API_URL}/subscriptions/plan-subscribers/${planId}`,
      );
      const activeCount = response.data.active_count || 0;

      if (activeCount > 0) {
        // Show error with subscriber list
        const userList = response.data.users
          .map((u) => `• ${u.full_name || u.email}`)
          .join("\n");

        toast.error(
          `❌ Cannot delete "${planName}" plan!\n\n` +
            `This plan has ${activeCount} active subscriber(s):\n\n${userList}\n\n` +
            `Please expire or migrate these subscribers before deleting the plan.`,
        );
        return;
      }

      // No subscribers, proceed with deletion
      setPlanToDelete({
        id: planId,
        name: planName,
        hasSubscribers: false,
      });
      setShowDeleteModal(true);
    } catch (error) {
      console.error("Error checking subscribers:", error);
      // If check fails, show error and don't proceed
      toast.error("Failed to check plan subscribers. Please try again.");
    }
  };

  // Update confirmDeletePlan to handle force deletion
  const confirmDeletePlan = async () => {
    if (!planToDelete) return;

    setIsLoading((prev) => ({ ...prev, action: true }));

    try {
      const response = await api.delete(
        `${PLANS_API_URL}/admin/delete-plan/${planToDelete.id}`,
      );

      toast.success(`Plan "${planToDelete.name}" deleted successfully!`);
      await fetchPlans();
      await fetchStats();
      triggerDashboardUpdate("delete", planToDelete.name);
    } catch (error) {
      console.error("Error deleting plan:", error);

      // Handle error response with subscriber details
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data
      ) {
        const errorData = error.response.data;
        if (errorData.detail && typeof errorData.detail === "object") {
          const subscribers = errorData.detail.subscribers || [];
          const subscriberList = subscribers
            .map((u) => `• ${u.name} (${u.email})`)
            .join("\n");

          toast.error(
            `❌ Cannot delete "${planToDelete.name}" plan!\n\n` +
              `${errorData.detail.message}\n\n` +
              `${subscriberList}` +
              (errorData.detail.more_count > 0
                ? `\n... and ${errorData.detail.more_count} more`
                : ""),
            {
              duration: 10000,
            },
          );
        } else {
          toast.error(errorData.detail || "Failed to delete plan");
        }
      } else {
        toast.error(error.response?.data?.detail || "Failed to delete plan");
      }
    } finally {
      setShowDeleteModal(false);
      setPlanToDelete(null);
      setIsLoading((prev) => ({ ...prev, action: false }));
    }
  };
  const fetchPlans = async () => {
    setIsLoading((prev) => ({ ...prev, plans: true }));

    try {
      // Fetch both plans and stats in parallel
      const [plansResponse, statsResponse] = await Promise.all([
        api.get(`${PLANS_API_URL}/admin/list-all`),
        api.get(`${ADMIN_API_URL}/subscriptions/stats`),
      ]);

      console.log("📊 Plans API Response:", plansResponse.data);
      console.log("📊 Stats API Response:", statsResponse.data);

      if (plansResponse.data && plansResponse.data.plans) {
        // ✅ FIX: Create stats map with correct keys
        const statsMap = {};
        if (statsResponse.data && statsResponse.data.plans) {
          statsResponse.data.plans.forEach((plan) => {
            // ✅ Use the plan name directly (no billing cycle needed)
            const creatorKey = `${plan.name}_creator`;
            const collaboratorKey = `${plan.name}_collaborator`;

            statsMap[creatorKey] = plan.creator_count || 0;
            statsMap[collaboratorKey] = plan.collaborator_count || 0;
          });
        }

        console.log("📊 Stats Map:", statsMap);

        // Transform plans with REAL user counts
        const transformedPlans = [];

        plansResponse.data.plans.forEach((plan) => {
          // ✅ Get real counts from stats using simple keys
          const creatorKey = `${plan.name}_creator`;
          const collaboratorKey = `${plan.name}_collaborator`;

          const creatorCount = statsMap[creatorKey] || 0;
          const collaboratorCount = statsMap[collaboratorKey] || 0;

          // For role-specific plans, use the appropriate count
          let userCount = 0;
          if (plan.role === "creator") {
            userCount = creatorCount;
          } else if (plan.role === "collaborator") {
            userCount = collaboratorCount;
          } else if (plan.role === "both") {
            userCount = creatorCount + collaboratorCount;
          } else {
            userCount = creatorCount + collaboratorCount;
          }

          transformedPlans.push({
            id: plan.id,
            name: plan.name,
            price_display:
              plan.price === 0
                ? "Free"
                : plan.billing_cycle === "yearly"
                  ? `₹${plan.price}/year`
                  : `₹${plan.price}/month`,
            price_value: plan.price,
            users: userCount, // ✅ REAL COUNT from database
            features: plan.features.map((f) =>
              typeof f === "string" ? f : f.title || f.description || "",
            ),
            duration: plan.billing_cycle,
            role: plan.role || "creator",
            discount_percentage: plan.discount_percentage,
            discount_description: plan.discount_description,
            original_price: plan.price,
            description: plan.description,
            max_users: plan.max_users,
            max_upload_storage_gb: plan.max_upload_storage_gb,
            max_proposals: plan.max_proposals,
            max_job_posts: plan.max_job_posts,
            max_invitations: plan.max_invitations,
            max_contracts: plan.max_contracts,
            is_popular: plan.is_popular,
            is_basic_or_free: isBasicOrFreePlan(plan.name),
            is_active: plan.is_active !== undefined ? plan.is_active : true,
          });
        });

        console.log("✅ Transformed Plans with real counts:", transformedPlans);
        setPricingPlans(transformedPlans);
        setPlansCurrentPage(1);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to fetch subscription plans");
    } finally {
      setIsLoading((prev) => ({ ...prev, plans: false }));
    }
  };
  const fetchSubscriptionHistory = async () => {
    setIsLoading((prev) => ({ ...prev, history: true }));

    try {
      const response = await api.get(`${ADMIN_API_URL}/subscriptions/history`, {
        params: { limit: 200 },
      });

      let historyData = [];
      if (response.data?.history) {
        historyData = response.data.history;
      } else if (Array.isArray(response.data)) {
        historyData = response.data;
      }

      const processedData = historyData
        .filter(
          (item) =>
            item && item.action && item.action.toLowerCase() === "created",
        )
        .map((item, index) => ({
          ...item,
          frontend_id:
            item.id ||
            item.history_id ||
            `${item.stripe_event_id || "event"}_${index}`,
          is_basic:
            item.plan &&
            (item.plan.toLowerCase() === "basic" ||
              item.plan.toLowerCase() === "free" ||
              item.plan.toLowerCase().includes("basic") ||
              item.plan.toLowerCase().includes("free")),
          stripe_subscription_id:
            item.stripe_subscription_id || item.subscription_id || null,
          invoice_number:
            item.invoice_number || item.last_invoice_number || null,
          last_invoice_number:
            item.last_invoice_number || item.invoice_number || null,
          billing_cycle: item.duration || item.billing_cycle || "monthly",
          status: item.status || "active",
          start_date: item.start_date || null,
          end_date: item.end_date || null,
        }))
        .sort(
          (a, b) =>
            new Date(b.date || b.created_at) - new Date(a.date || a.created_at),
        );

      console.log("Processed history:", processedData.length);
      setSubscriptionHistory(processedData);
      setHistoryCurrentPage(1);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Failed to fetch subscription history");
      setSubscriptionHistory([]);
    } finally {
      setIsLoading((prev) => ({ ...prev, history: false }));
    }
  };

  const downloadInvoice = async (row) => {
    try {
      setIsLoading((prev) => ({ ...prev, action: true }));
      setSelectedRow(row);

      const invoiceNumber = row.invoice_number || row.last_invoice_number;
      const subscriptionId = row.stripe_subscription_id || row.subscription_id;

      // Check if it's a Basic/Free plan (no invoice)
      if (
        row.is_basic ||
        row.plan?.toLowerCase() === "basic" ||
        row.plan?.toLowerCase() === "free"
      ) {
        toast.info("Basic/Free plans do not have invoices");
        setIsLoading((prev) => ({ ...prev, action: false }));
        setSelectedRow(null);
        return;
      }

      const identifier = invoiceNumber || subscriptionId;

      if (!identifier) {
        toast.error("No invoice number or subscription ID available");
        setIsLoading((prev) => ({ ...prev, action: false }));
        setSelectedRow(null);
        return;
      }

      const token = localStorage.getItem("access_token") || "";
      const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:8000";

      // ✅ Use force_download=true to get the file directly
      const url = `${API_BASE_URL}/payment/invoice/${encodeURIComponent(identifier)}?force_download=true`;

      console.log("📄 Downloading invoice from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/pdf",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.detail || errorMessage;
        } catch (e) {
          // If response is not JSON, try text
          try {
            errorMessage = await response.text();
          } catch (e2) {
            // Fallback to status text
            errorMessage = response.statusText || errorMessage;
          }
        }
        throw new Error(errorMessage);
      }

      // ✅ Get the blob from response
      const blob = await response.blob();

      // Check if we got a valid PDF
      if (
        blob.type !== "application/pdf" &&
        blob.type !== "application/octet-stream"
      ) {
        console.warn("Unexpected content type:", blob.type);
        // Try to read as text to see if it's an error message
        if (blob.type.includes("json")) {
          const text = await blob.text();
          try {
            const errorData = JSON.parse(text);
            throw new Error(
              errorData.error ||
                errorData.detail ||
                "Failed to download invoice",
            );
          } catch (e) {
            // If not JSON, just show the text
            if (text) throw new Error(text);
          }
        }
      }

      // Check if blob is empty
      if (blob.size === 0) {
        throw new Error("Downloaded file is empty");
      }

      // Create download link
      const link = document.createElement("a");
      const objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = `Talenta_Invoice_${invoiceNumber || identifier}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object after a short delay
      setTimeout(() => URL.revokeObjectURL(objectUrl), 100);

      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error(error.message || "Failed to download invoice");
    } finally {
      setIsLoading((prev) => ({ ...prev, action: false }));
      setSelectedRow(null);
    }
  };
  const openCreateModal = () => {
    setModalMode("create");
    setSelectedPlan(null);
    resetPlanForm();
    setIsPlanModalOpen(true);
  };

  const openEditModal = (plan) => {
    setModalMode("edit");
    setSelectedPlan(plan);

    setPlanForm({
      name: plan.name,
      price:
        plan.price_value ||
        plan.original_price ||
        plan.price_display.replace(/[^0-9.]/g, ""),
      duration: plan.duration || "monthly",
      role: plan.role || "creator",
      description: plan.description || "",
      features: plan.features.length > 0 ? plan.features : [""],
      discount_percentage: plan.discount_percentage || "",
      discount_description: plan.discount_description || "",
      is_popular: plan.is_popular || false,
      max_users: plan.max_users || 10,
      max_upload_storage_gb: plan.max_upload_storage_gb || 10,
      max_proposals: plan.max_proposals || 10,
      max_job_posts: plan.max_job_posts || 10,
      max_invitations: plan.max_invitations || 10,
      max_contracts: plan.max_contracts || 10,
    });
    setValidationErrors({
      name: "",
      price: "",
      description: "",
      features: "",
    });
    setTouchedFields({
      name: false,
      price: false,
      description: false,
      discount_percentage: false,
      features: false,
    });
    setIsPlanModalOpen(true);
  };

  const validateAllFields = () => {
    const nameError = validateName(planForm.name);
    const priceError = validatePrice(planForm.price);
    const descriptionError = validateDescription(planForm.description);

    const discountPercentageError = validateDiscountPercentage(
      planForm.discount_percentage,
    );

    const discountDescriptionError = validateDiscountDescription(
      planForm.discount_description,
    );

    const featuresError = validateFeatures(planForm.features);

    setValidationErrors({
      name: nameError,
      price: priceError,
      description: descriptionError,
      discount_percentage: discountPercentageError,
      discount_description: discountDescriptionError,
      features: featuresError,
    });

    setTouchedFields({
      name: true,
      price: true,
      description: true,
      discount_percentage: true,
      discount_description: true,
      features: true,
    });

    return !(
      nameError ||
      priceError ||
      descriptionError ||
      discountPercentageError ||
      discountDescriptionError ||
      featuresError
    );
  };

  const createPlan = async () => {
    if (!validateAllFields()) {
      toast.error("Please fix all validation errors");
      return;
    }

    if (!validateBasicFreeDuration(planForm.name, planForm.duration)) {
      toast.error(
        "Basic and Free plans can only be monthly (not yearly). Please change the billing cycle to Monthly.",
      );
      return;
    }

    const { duplicateByName, duplicateByPrice } = checkDuplicatePlan(
      planForm.name,
      planForm.price,
      planForm.role,
      planForm.duration,
    );
    if (duplicateByName) {
      const roleText = planForm.role === "creator" ? "Creator" : "Collaborator";
      toast.error(
        `A plan named "${planForm.name}" for ${roleText} already exists! Please choose a different name.`,
      );
      return;
    }

    if (duplicateByPrice) {
      const roleText = planForm.role === "creator" ? "Creator" : "Collaborator";
      toast.error(
        `A plan with price ₹${planForm.price} for ${roleText} already exists! Please choose a different price.`,
      );
      return;
    }

    setIsLoading((prev) => ({ ...prev, action: true }));
    try {
      const formattedFeatures = planForm.features
        .filter((f) => f && f.trim() !== "")
        .map((f) => ({
          title: f,
          description: f,
          is_active: true,
        }));

      const planData = {
        name: planForm.name,
        price: parseFloat(planForm.price) || 0,
        billing_cycle: planForm.duration,
        role: planForm.role,
        max_users: parseInt(planForm.max_users) || 10,
        max_upload_storage_gb: parseInt(planForm.max_upload_storage_gb) || 10,
        max_proposals: parseInt(planForm.max_proposals) || 10,
        max_job_posts: parseInt(planForm.max_job_posts) || 10,
        max_invitations: parseInt(planForm.max_invitations) || 10,
        max_contracts: parseInt(planForm.max_contracts) || 10,
        description: planForm.description,
        is_popular: planForm.is_popular,
        status: "active",
        features: formattedFeatures,
        discount_percentage: planForm.discount_percentage
          ? parseInt(planForm.discount_percentage)
          : 0,
        discount_description: planForm.discount_description || null,
      };

      await api.post(`${PLANS_API_URL}/admin/create-plan`, planData);
      toast.success("Plan created successfully!");
      setIsPlanModalOpen(false);
      resetPlanForm();
      await fetchPlans();
      await fetchStats();
      triggerDashboardUpdate("create", planForm.name);
    } catch (error) {
      console.error("Error creating plan:", error);
      toast.error(error.response?.data?.detail || "Failed to create plan");
    } finally {
      setIsLoading((prev) => ({ ...prev, action: false }));
    }
  };

  const updatePlan = async () => {
    if (!validateAllFields()) {
      toast.error("Please fix all validation errors");
      return;
    }

    if (!validateBasicFreeDuration(planForm.name, planForm.duration)) {
      toast.error(
        "Basic and Free plans can only be monthly (not yearly). Please change the billing cycle to Monthly.",
      );
      return;
    }

    const { duplicateByName, duplicateByPrice } = checkDuplicatePlan(
      planForm.name,
      planForm.price,
      planForm.role,
      planForm.duration,
      selectedPlan?.id,
    );
    if (duplicateByName) {
      const roleText = planForm.role === "creator" ? "Creator" : "Collaborator";
      toast.error(
        `A plan named "${planForm.name}" for ${roleText} already exists! Please choose a different name.`,
      );
      return;
    }

    if (duplicateByPrice) {
      const roleText = planForm.role === "creator" ? "Creator" : "Collaborator";
      toast.error(
        `A plan with price ₹${planForm.price} for ${roleText} already exists! Please choose a different price.`,
      );
      return;
    }

    setIsLoading((prev) => ({ ...prev, action: true }));
    try {
      const formattedFeatures = planForm.features
        .filter((f) => f && f.trim() !== "")
        .map((f) => ({
          title: f,
          description: f,
          is_active: true,
        }));

      const planData = {
        name: planForm.name,
        price: parseFloat(planForm.price) || 0,
        billing_cycle: planForm.duration,
        role: planForm.role,
        max_users: parseInt(planForm.max_users) || 10,
        max_upload_storage_gb: parseInt(planForm.max_upload_storage_gb) || 10,
        max_proposals: parseInt(planForm.max_proposals) || 10,
        max_job_posts: parseInt(planForm.max_job_posts) || 10,
        max_invitations: parseInt(planForm.max_invitations) || 10,
        max_contracts: parseInt(planForm.max_contracts) || 10,
        description: planForm.description,
        is_popular: planForm.is_popular,
        status: "active",
        features: formattedFeatures,
        discount_percentage: planForm.discount_percentage
          ? parseInt(planForm.discount_percentage)
          : 0,
        discount_description: planForm.discount_description || null,
      };

      await api.put(
        `${PLANS_API_URL}/admin/edit-plan/${selectedPlan.id}`,
        planData,
      );
      toast.success("Plan updated successfully!");
      setIsPlanModalOpen(false);
      resetPlanForm();
      await fetchPlans();
      await fetchStats();
      triggerDashboardUpdate("edit", planForm.name);
    } catch (error) {
      console.error("Error updating plan:", error);
      toast.error(error.response?.data?.detail || "Failed to update plan");
    } finally {
      setIsLoading((prev) => ({ ...prev, action: false }));
    }
  };

  const resetPlanForm = () => {
    setPlanForm({
      name: "",
      price: "",
      duration: "monthly",
      role: "creator",
      description: "",
      features: [""],
      discount_percentage: "",
      discount_description: "",
      is_popular: false,
      max_users: 10,
      max_upload_storage_gb: 10,
      max_proposals: 10,
      max_job_posts: 10,
      max_invitations: 10,
      max_contracts: 10,
    });
    setValidationErrors({
      name: "",
      price: "",
      description: "",
      features: "",
    });
    setTouchedFields({
      name: false,
      price: false,
      description: false,
      discount_percentage: false,
      features: false,
    });
  };

  const addFeature = () => {
    setPlanForm({
      ...planForm,
      features: [...planForm.features, ""],
    });
    if (validationErrors.features) {
      setValidationErrors((prev) => ({ ...prev, features: "" }));
    }
  };

  const removeFeature = (index) => {
    if (planForm.features.length <= 1) {
      toast.error("At least one feature is required");
      return;
    }
    const newFeatures = planForm.features.filter((_, i) => i !== index);
    setPlanForm({ ...planForm, features: newFeatures });
    const featuresError = validateFeatures(newFeatures);
    setValidationErrors((prev) => ({ ...prev, features: featuresError }));
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...planForm.features];
    newFeatures[index] = value;
    setPlanForm({ ...planForm, features: newFeatures });
    const featuresError = validateFeatures(newFeatures);
    setValidationErrors((prev) => ({ ...prev, features: featuresError }));
  };

  const getFilteredPlans = () => {
    const filtered =
      planRoleFilter === "all"
        ? pricingPlans
        : pricingPlans.filter(
            (plan) => plan.role === planRoleFilter || plan.role === "both",
          );
    return [...filtered].sort(
      (a, b) => (a.price_value ?? 0) - (b.price_value ?? 0),
    );
  };

  const getVisiblePlanStats = () => {
    if (showAllPlans) return pricingPlans;
    return pricingPlans.slice(0, 3);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "creator":
        return "bg-blue-500";
      case "collaborator":
        return "bg-green-500";
      default:
        return "bg-purple-500";
    }
  };

  const getRoleDisplay = (role) => {
    switch (role) {
      case "creator":
        return "👤 Creator";
      case "collaborator":
        return "👥 Collaborator";
      default:
        return "⭐ Both";
    }
  };

  const getFilteredHistory = () => {
    let filtered = subscriptionHistory;
    if (historyPlanFilter === "paid") {
      filtered = filtered.filter((item) => !item.is_basic);
    } else if (historyPlanFilter === "basic") {
      filtered = filtered.filter((item) => item.is_basic);
    }
    return filtered;
  };

  const getSearchedHistory = () => {
    let filtered = getFilteredHistory();
    if (historySearchTerm.trim() === "") {
      return filtered;
    }
    const searchLower = historySearchTerm.toLowerCase();
    return filtered.filter((item) => {
      const name = (item.full_name || "").toLowerCase();
      const role = (item.role || "").toLowerCase();
      const plan = (item.plan || "").toLowerCase();
      const cycleValue = item.billing_cycle || item.duration || "monthly";
      const isYearly =
        cycleValue === "yearly" ||
        cycleValue === "Yearly" ||
        cycleValue === "annual" ||
        cycleValue === "Annual" ||
        cycleValue === "year";
      const billingCycle = isYearly ? "yearly" : "monthly";

      return (
        name.includes(searchLower) ||
        role.includes(searchLower) ||
        plan.includes(searchLower) ||
        billingCycle.includes(searchLower)
      );
    });
  };

  const filteredPlans = getFilteredPlans();
  const visiblePlanStats = getVisiblePlanStats();
  const totalPlansPages = Math.ceil(filteredPlans.length / plansRowsPerPage);
  const paginatedPlans = filteredPlans.slice(
    (plansCurrentPage - 1) * plansRowsPerPage,
    plansCurrentPage * plansRowsPerPage,
  );

  const searchedHistory = getSearchedHistory();
  const sortedHistory = sortData(searchedHistory);
  const totalHistoryPages = Math.ceil(
    sortedHistory.length / historyRowsPerPage,
  );
  const paginatedHistory = sortedHistory.slice(
    (historyCurrentPage - 1) * historyRowsPerPage,
    historyCurrentPage * historyRowsPerPage,
  );

  const handlePlansPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPlansPages) {
      setPlansCurrentPage(newPage);
    }
  };

  const handleHistoryPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalHistoryPages) {
      setHistoryCurrentPage(newPage);
    }
  };

  const handleHistoryRowsPerPageChange = (newSize) => {
    setHistoryRowsPerPage(Number(newSize));
    setHistoryCurrentPage(1);
  };

  const handlePlansRowsPerPageChange = (newSize) => {
    setPlansRowsPerPage(Number(newSize));
    setPlansCurrentPage(1);
  };

  useEffect(() => {
    fetchStats();
    fetchPlans();
    fetchSubscriptionHistory();
  }, []);

  useEffect(() => {
    const handleThemeChange = () => {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark") {
        setIsDarkMode(true);
      } else if (savedTheme === "light") {
        setIsDarkMode(false);
      } else {
        setIsDarkMode(
          window.matchMedia("(prefers-color-scheme: dark)").matches,
        );
      }
    };

    window.addEventListener("theme-change", handleThemeChange);
    return () => window.removeEventListener("theme-change", handleThemeChange);
  }, []);

  const startHistoryIndex = (historyCurrentPage - 1) * historyRowsPerPage + 1;
  const endHistoryIndex = Math.min(
    historyCurrentPage * historyRowsPerPage,
    sortedHistory.length,
  );
  const startPlansIndex = (plansCurrentPage - 1) * plansRowsPerPage + 1;
  const endPlansIndex = Math.min(
    plansCurrentPage * plansRowsPerPage,
    filteredPlans.length,
  );

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  return (
    <div
      className={`w-full h-full ${isDarkMode ? "bg-black text-white" : "bg-gray-100 text-black"}`}
    >
      <div className="px-0 pt-0 pb-8 max-w-[2600px] mx-auto">
        {/* Header with Create Plan Button */}
        <div className="mt-2 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1
            className={`text-2xl lg:text-[32px] font-semibold ${isDarkMode ? "text-white" : "text-black"}`}
          >
            Subscription Management
          </h1>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition"
            style={{
              background: "linear-gradient(90deg, #51218F 0%, #020202 100%)",
            }}
          >
            <Plus size={20} />
            Create New Plan
          </button>
        </div>

        {/* Stats Cards - IMPROVED DARK MODE VISIBILITY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Subscribers Card - Always First */}
          <div
            className={`flex items-center gap-4 px-6 py-5 rounded-xl shadow-xl transition-all duration-300 ${
              isDarkMode
                ? "bg-gradient-to-r from-purple-900/40 to-purple-800/20 border border-purple-500/30"
                : "text-white"
            }`}
            style={
              isDarkMode
                ? {}
                : {
                    background:
                      "linear-gradient(90deg, #37264a 0%, #020202 100%)",
                  }
            }
          >
            <div className="flex-shrink-0">
              <Users
                size={26}
                className={isDarkMode ? "text-purple-400" : "text-white"}
              />
            </div>
            <div className="flex flex-col items-start">
              <h2 className="text-3xl font-medium leading-none tracking-tight">
                {isLoading.stats ? (
                  <Loader className="animate-spin" size={24} />
                ) : (
                  stats.total_subscribers
                )}
              </h2>
              <p
                className="text-[13px] mt-1 capitalize opacity-90"
                style={{ fontFamily: "'Old Standard TT', serif" }}
              >
                Total Subscribers
              </p>
            </div>
          </div>

          {/* Dynamic Plan Cards - Maximum 4 per row with View All/Show Less */}
 {/* Dynamic Plan Cards - Maximum 4 per row with View All/Show Less */}
{isLoading.stats ? (
  <div className="col-span-3 flex justify-center py-12">
    <Loader className="animate-spin" size={40} />
  </div>
) : dynamicPlanCards.length > 0 ? (
  <>
    {(showAllPlans ? dynamicPlanCards : dynamicPlanCards.slice(0, 3)).map((plan, index) => {
      // ✅ Helper to get duration string safely
      const getDurationDisplay = (duration) => {
        if (!duration) return "Monthly";
        if (typeof duration === 'string') {
          return duration === "yearly" ? "Yearly" : "Monthly";
        }
        if (typeof duration === 'object') {
          return duration?.duration === "yearly" ? "Yearly" : "Monthly";
        }
        return "Monthly";
      };
      
      return (
        <div
          key={plan.id}
          className={`flex items-center gap-4 px-6 py-5 rounded-xl shadow-xl transition-all duration-300 ${
            isDarkMode 
              ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700" 
              : "text-white"
          }`}
          style={
            isDarkMode ? {} :
              index === 0 ? { background: "linear-gradient(90deg, #7d54af 0%, #8264a7 100%)" } :
                index === 1 ? { background: "linear-gradient(90deg, #7A5C97 0%, #6A4E87 100%)" } :
                  index === 2 ? { background: "linear-gradient(90deg, #5a3e7a 0%, #4a2e6a 100%)" } :
                    index === 3 ? { background: "linear-gradient(90deg, #6B46C1 0%, #553C9A 100%)" } :
                      { background: "linear-gradient(90deg, #805AD5 0%, #6B46C1 100%)" }
          }
        >
          <div className="flex-shrink-0">
            {plan.role === "creator" ? (
              <User size={26} className={isDarkMode ? "text-blue-400" : "text-white"} />
            ) : (
              <Users2 size={26} className={isDarkMode ? "text-green-400" : "text-white"} />
            )}
          </div>
          <div className="flex flex-col items-start flex-1">
            <div className="flex justify-between w-full items-center">
              <h2 className="text-3xl font-medium leading-none tracking-tight text-white">{plan.users}</h2>
              <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(plan.role)} text-white`}>
                {plan.role === "creator" ? "Creator" : "Collaborator"}
              </span>
            </div>
            <p className="text-[13px] mt-1 capitalize opacity-90 text-white" style={{ fontFamily: "'Old Standard TT', serif" }}>
              {plan.name}
              {" "}
              (
              {getDurationDisplay(plan.duration)}
              )
            </p>
          </div>
        </div>
      );
    })}
    
    {/* View All Button - only show if there are more than 3 cards and not showing all */}
    {dynamicPlanCards.length > 3 && !showAllPlans && (
      <button
        onClick={() => setShowAllPlans(true)}
        className={`flex items-center justify-center gap-2 px-4 py-5 rounded-xl shadow-xl transition-all duration-300 ${
          isDarkMode 
            ? "bg-gray-800 text-white border border-gray-700 hover:bg-gray-700" 
            : "bg-gray-200 text-black hover:bg-gray-300"
        }`}
      >
        <Eye size={20} />
        <span className="font-medium">View All ({dynamicPlanCards.length})</span>
      </button>
    )}
    
    {/* Show Less button - only show when showing all cards and there are more than 3 */}
    {dynamicPlanCards.length > 3 && showAllPlans && (
      <button
        onClick={() => setShowAllPlans(false)}
        className={`flex items-center justify-center gap-2 px-4 py-5 rounded-xl shadow-xl transition-all duration-300 ${
          isDarkMode 
            ? "bg-gray-800 text-white border border-gray-700 hover:bg-gray-700" 
            : "bg-gray-200 text-black hover:bg-gray-300"
        }`}
      >
        <Eye size={20} />
        <span className="font-medium">Show Less</span>
      </button>
    )}
  </>
) : (
  <div className="col-span-3 text-center py-12">
    <p className="text-gray-500">No active subscriptions</p>
  </div>
)}

        </div>

        {/* Rest of your component remains the same */}
        {/* Role Filter Tabs */}
        {!isLoading.plans && pricingPlans.length > 0 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            <button
              onClick={() => setPlanRoleFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                planRoleFilter === "all"
                  ? "bg-purple-600 text-white"
                  : isDarkMode
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All Plans
            </button>
            <button
              onClick={() => setPlanRoleFilter("creator")}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                planRoleFilter === "creator"
                  ? "bg-blue-600 text-white"
                  : isDarkMode
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <User size={16} />
              Creator Plans
            </button>
            <button
              onClick={() => setPlanRoleFilter("collaborator")}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                planRoleFilter === "collaborator"
                  ? "bg-green-600 text-white"
                  : isDarkMode
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <Users2 size={16} />
              Collaborator Plans
            </button>
          </div>
        )}

        {/* Pricing Cards - Keep as is for plan management */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 w-full">
          {isLoading.plans ? (
            <div className="col-span-3 flex justify-center py-12">
              <Loader className="animate-spin" size={40} />
            </div>
          ) : paginatedPlans.length > 0 ? (
            paginatedPlans.map((plan, idx) => (
              <div
                key={plan.id || idx}
                className={`relative rounded-[24px] p-6 flex flex-col min-h-[400px] transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                  isDarkMode
                    ? "bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-purple-500/40 shadow-lg"
                    : "text-white"
                }`}
                style={
                  isDarkMode
                    ? {}
                    : {
                        background:
                          "linear-gradient(180deg, #7A5C97 0%, #6A4E87 100%)",
                      }
                }
                onMouseEnter={() => setHoveredPlanId(plan.id)}
                onMouseLeave={() => setHoveredPlanId(null)}
              >
                <div
                  className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white ${getRoleBadgeColor(plan.role)}`}
                >
                  {getRoleDisplay(plan.role)}
                </div>

                {hoveredPlanId === plan.id && (
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => openEditModal(plan)}
                      className="w-8 h-8 rounded-full bg-gray-100 text-black flex items-center justify-center hover:scale-110 transition shadow-lg"
                      title="Edit Plan"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() =>
                        deletePlan(plan.id, plan.name, plan.is_basic_or_free)
                      }
                      className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition shadow-lg"
                      title="Delete Plan"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
<div className="flex justify-between items-start mb-4 mt-8">
  <div className={`px-4 py-1 rounded-lg text-sm font-bold ${isDarkMode ? "bg-purple-600 text-white" : "bg-[#C9A7FF] text-black"}`}>
    {plan.name} (
    {(() => {
      // ✅ Helper to get duration string safely
      const duration = plan.duration;
      if (!duration) return "Monthly";
      if (typeof duration === 'string') {
        return duration === "yearly" ? "Yearly" : "Monthly";
      }
      if (typeof duration === 'object') {
        return duration?.duration === "yearly" ? "Yearly" : "Monthly";
      }
      return "Monthly";
    })()}
    )
  </div>
  <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
    (() => {
      const duration = plan.duration;
      if (!duration) return false;
      if (typeof duration === 'string') return duration === "yearly";
      if (typeof duration === 'object') return duration?.duration === "yearly";
      return false;
    })()
      ? "bg-amber-500 text-white"
      : "bg-emerald-500 text-white"
  }`}>
    {(() => {
      const duration = plan.duration;
      if (!duration) return "Monthly";
      if (typeof duration === 'string') return duration === "yearly" ? "Yearly" : "Monthly";
      if (typeof duration === 'object') return duration?.duration === "yearly" ? "Yearly" : "Monthly";
      return "Monthly";
    })()}
  </div>
</div>

                <div className="mb-4">
                  {plan.price_display !== "Free" ? (
                    <div className="text-2xl font-bold text-white">
                      {plan.price_display}
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-white">Free</div>
                  )}
                </div>

                <div className="flex-grow overflow-hidden">
                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                    {plan.features &&
                      plan.features.map((feature, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2">
                          <div
                            className={`w-4 h-4 min-w-[16px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isDarkMode ? "border-2 border-purple-400" : "border border-white"}`}
                          >
                            <CheckCircle
                              size={10}
                              className={
                                isDarkMode ? "text-purple-400" : "text-white"
                              }
                            />
                          </div>
                          <span
                            className={`text-xs leading-relaxed break-words hyphens-auto ${isDarkMode ? "text-gray-300" : "text-white"}`}
                          >
                            {typeof feature === "string"
                              ? feature
                              : feature.title || feature.description || ""}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/20">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Mail size={12} className="opacity-70 text-white" />
                      <span className="text-xs opacity-70 text-white">
                        Invites:
                      </span>
                      <span className="text-sm font-bold text-white">
                        {plan.max_invitations || "∞"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileSignature
                        size={12}
                        className="opacity-70 text-white"
                      />
                      <span className="text-xs opacity-70 text-white">
                        Contracts:
                      </span>
                      <span className="text-sm font-bold text-white">
                        {plan.max_contracts || "∞"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-bold text-white">
                      {plan.users || "0"}
                    </span>
                    <span className="text-xs opacity-70 text-white">
                      Active User
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-500 mb-4">
                {pricingPlans.length === 0
                  ? "No subscription plans available"
                  : `No ${planRoleFilter} plans available`}
              </p>
              <button
                onClick={openCreateModal}
                className="px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition"
                style={{
                  background:
                    "linear-gradient(90deg, #51218F 0%, #020202 100%)",
                }}
              >
                Create Your First Plan
              </button>
            </div>
          )}
        </div>

        {/* Plans Pagination */}
        {!isLoading.plans && filteredPlans.length > plansRowsPerPage && (
          <div
            className={`flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 px-2 py-3 text-sm font-medium ${isDarkMode ? "text-white" : "text-black"}`}
          >
            <div
              className={`flex items-center gap-2 order-2 sm:order-1 ${isDarkMode ? "text-white/80" : "text-black/80"}`}
            >
              <span>Rows per page</span>
              <select
                value={plansRowsPerPage}
                onChange={(e) => handlePlansRowsPerPageChange(e.target.value)}
                className={`bg-transparent px-3 py-1.5 rounded-full font-medium border-2 focus:outline-none ${isDarkMode ? "text-white border-white" : "text-black border-black"}`}
              >
                <option className="text-black" value="6">
                  6
                </option>
                <option className="text-black" value="12">
                  12
                </option>
                <option className="text-black" value="18">
                  18
                </option>
                <option className="text-black" value="24">
                  24
                </option>
              </select>
              <span>
                {filteredPlans.length > 0
                  ? `${startPlansIndex}-${endPlansIndex} of ${filteredPlans.length} plans`
                  : "0 plans"}
              </span>
            </div>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <button
                onClick={() => handlePlansPageChange(plansCurrentPage - 1)}
                disabled={plansCurrentPage === 1 || totalPlansPages === 0}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? "border-white text-white hover:bg-gray-100/10" : "border-black text-black hover:bg-black/10"}`}
              >
                <ChevronLeft size={16} />
              </button>
              {totalPlansPages > 0 &&
                [...Array(Math.min(5, totalPlansPages))].map((_, i) => {
                  let pageNum;
                  if (totalPlansPages <= 5) {
                    pageNum = i + 1;
                  } else if (plansCurrentPage <= 3) {
                    pageNum = i + 1;
                  } else if (plansCurrentPage >= totalPlansPages - 2) {
                    pageNum = totalPlansPages - 4 + i;
                  } else {
                    pageNum = plansCurrentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePlansPageChange(pageNum)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${plansCurrentPage === pageNum ? "text-white" : isDarkMode ? "text-white hover:bg-gray-100/10" : "text-black hover:bg-black/10"}`}
                      style={
                        plansCurrentPage === pageNum
                          ? {
                              background:
                                "linear-gradient(90deg, #51218F 0%, #020202 100%)",
                            }
                          : {}
                      }
                    >
                      {pageNum}
                    </button>
                  );
                })}
              <button
                onClick={() => handlePlansPageChange(plansCurrentPage + 1)}
                disabled={
                  plansCurrentPage === totalPlansPages || totalPlansPages === 0
                }
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? "border-white text-white hover:bg-gray-100/10" : "border-black text-black hover:bg-black/10"}`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Create/Edit Plan Modal - Keep as is */}
        {isPlanModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-[2px] p-4">
            <div
              className={`rounded-[20px] p-6 w-full max-w-2xl shadow-2xl relative ${isDarkMode ? "bg-gray-900" : "bg-gray-100"}`}
            >
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-200 dark:border-gray-700">
                <h3
                  className={`text-xl md:text-[22px] font-bold ${isDarkMode ? "text-white" : "text-[#1B2559]"}`}
                >
                  {modalMode === "create"
                    ? "Create New Plan"
                    : `Edit ${selectedPlan?.name || ""} Plan`}
                </h3>
                <button
                  onClick={() => {
                    setIsPlanModalOpen(false);
                    resetPlanForm();
                  }}
                  className="text-white rounded-full p-1 hover:opacity-90"
                  style={{
                    background:
                      "linear-gradient(90deg, #51218F 0%, #020202 100%)",
                  }}
                >
                  <X size={18} strokeWidth={3} />
                </button>
              </div>

              <div
                ref={modalContentRef}
                className="space-y-6 overflow-y-auto"
                style={{
                  maxHeight: "calc(85vh - 140px)",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {/* Plan Name */}
                <div className="flex flex-col gap-1.5">
                  <label
                    className={`text-[14px] font-semibold ${isDarkMode ? "text-white" : "text-black"}`}
                  >
                    Plan Name <span className="text-red-500">*</span>
                    <span
                      className={`text-xs ml-2 ${planForm.name.length > 25 ? "text-red-500" : "text-gray-500"}`}
                    >
                      ({planForm.name.length}/25)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={planForm.name}
                    onChange={(e) => {
                      const value = e.target.value.slice(0, 25);
                      setPlanForm({ ...planForm, name: value });
                      if (touchedFields.name) {
                        setValidationErrors({
                          ...validationErrors,
                          name: validateName(value),
                        });
                      }
                    }}
                    onBlur={() => {
                      handleFieldBlur("name");
                      setValidationErrors({
                        ...validationErrors,
                        name: validateName(planForm.name),
                      });
                    }}
                    style={getInputStyle(isDarkMode)}
                    placeholder="e.g., Pro, Agent, Basic"
                    maxLength={25}
                  />
                  {touchedFields.name && validationErrors.name && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <span>⚠️</span> {validationErrors.name}
                    </p>
                  )}
                </div>

                {/* Price and Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      className={`text-[14px] font-semibold ${isDarkMode ? "text-white" : "text-black"}`}
                    >
                      Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={planForm.price}
                      onChange={(e) => {
                        let value = e.target.value;
                        value = value.replace(/[^0-9.]/g, "");
                        const parts = value.split(".");
                        if (parts.length > 2) value = parts[0] + "." + parts[1];
                        if (value.startsWith("00"))
                          value = value.replace(/^0+/, "0");
                        setPlanForm({ ...planForm, price: value });
                        if (touchedFields.price) {
                          setValidationErrors({
                            ...validationErrors,
                            price: validatePrice(value),
                          });
                        }
                      }}
                      onBlur={() => {
                        handleFieldBlur("price");
                        setValidationErrors({
                          ...validationErrors,
                          price: validatePrice(planForm.price),
                        });
                      }}
                      style={getInputStyle(isDarkMode)}
                      placeholder="0.00"
                    />
                    {touchedFields.price && validationErrors.price && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <span>⚠️</span> {validationErrors.price}
                      </p>
                    )}
                  </div>
                  <div>
                    <CustomDropdown
                      value={planForm.duration}
                      onChange={(value) =>
                        setPlanForm({ ...planForm, duration: value })
                      }
                      options={[
                        { value: "monthly", label: "Monthly" },
                        { value: "yearly", label: "Yearly" },
                      ]}
                      placeholder="Select billing cycle"
                      isDarkMode={isDarkMode}
                      label="Billing Cycle"
                    />
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <CustomDropdown
                    value={planForm.role}
                    onChange={(value) =>
                      setPlanForm({ ...planForm, role: value })
                    }
                    options={[
                      { value: "creator", label: "Creator Only" },
                      { value: "collaborator", label: "Collaborator Only" },
                    ]}
                    placeholder="Select target role"
                    isDarkMode={isDarkMode}
                    label="Target Role"
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label
                    className={`text-[14px] font-semibold ${isDarkMode ? "text-white" : "text-black"}`}
                  >
                    Description
                    <span
                      className={`text-xs ml-2 ${planForm.description.length > 100 ? "text-red-500" : "text-gray-500"}`}
                    >
                      ({planForm.description.length}/30)
                    </span>
                  </label>
                  <textarea
                    value={planForm.description}
                    onChange={(e) => {
                      const newValue = e.target.value.slice(0, 30);
                      setPlanForm({ ...planForm, description: newValue });
                      if (touchedFields.description) {
                        setValidationErrors({
                          ...validationErrors,
                          description: validateDescription(newValue),
                        });
                      }
                    }}
                    onBlur={() => {
                      setTouchedFields((prev) => ({
                        ...prev,
                        description: true,
                      }));
                      setValidationErrors({
                        ...validationErrors,
                        description: validateDescription(planForm.description),
                      });
                    }}
                    style={getTextareaStyle(isDarkMode)}
                    placeholder="Enter description for the plan Like (Billing Monthly or Billing Yearly)"
                    rows="3"
                    maxLength={30}
                  />
                  {touchedFields.description &&
                    validationErrors.description && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <span>⚠️</span> {validationErrors.description}
                      </p>
                    )}
                </div>

                {/* Features */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label
                      className={`text-[14px] font-semibold ${isDarkMode ? "text-white" : "text-black"}`}
                    >
                      Features <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={addFeature}
                      className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
                    >
                      <Plus size={16} /> Add Feature
                    </button>
                  </div>
                  {planForm.features.map((feature, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => {
                            const value = e.target.value.slice(0, 100);
                            updateFeature(index, value);
                          }}
                          placeholder={`Feature ${index + 1}`}
                          style={{
                            ...getInputStyle(isDarkMode),
                            width: "100%",
                          }}
                          maxLength={100}
                        />
                        <span
                          className={`absolute right-2 bottom-1 text-xs ${feature.length > 100 ? "text-red-500" : "text-gray-500"}`}
                        >
                          ({feature.length}/100)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="px-3 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  {(touchedFields.features || validationErrors.features) &&
                    validationErrors.features && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <span>⚠️</span> {validationErrors.features}
                      </p>
                    )}
                </div>

                {/* Limits Section */}
                <div className="border-t pt-4 border-gray-200 dark:border-gray-700">
                  <h3
                    className={`text-lg font-medium mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                  >
                    Plan Limits
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label
                        className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Max Users
                      </label>
                      <input
                        type="text"
                        value={planForm.max_users}
                        onChange={(e) => {
                          const sanitized = sanitizeNumericInput(
                            e.target.value,
                          );
                          setPlanForm({
                            ...planForm,
                            max_users: sanitized || "",
                          });
                        }}
                        style={getInputStyle(isDarkMode)}
                        placeholder="Enter number"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label
                        className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Storage (GB)
                      </label>
                      <input
                        type="text"
                        value={planForm.max_upload_storage_gb}
                        onChange={(e) => {
                          const sanitized = sanitizeNumericInput(
                            e.target.value,
                          );
                          setPlanForm({
                            ...planForm,
                            max_upload_storage_gb: sanitized || "",
                          });
                        }}
                        style={getInputStyle(isDarkMode)}
                        placeholder="Enter number"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label
                        className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Max Proposals
                      </label>
                      <input
                        type="text"
                        value={planForm.max_proposals}
                        onChange={(e) => {
                          const sanitized = sanitizeNumericInput(
                            e.target.value,
                          );
                          setPlanForm({
                            ...planForm,
                            max_proposals: sanitized || "",
                          });
                        }}
                        style={getInputStyle(isDarkMode)}
                        placeholder="Enter number"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label
                        className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Max Job Posts
                      </label>
                      <input
                        type="text"
                        value={planForm.max_job_posts}
                        onChange={(e) => {
                          const sanitized = sanitizeNumericInput(
                            e.target.value,
                          );
                          setPlanForm({
                            ...planForm,
                            max_job_posts: sanitized || "",
                          });
                        }}
                        style={getInputStyle(isDarkMode)}
                        placeholder="Enter number"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label
                        className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Max Invitations
                      </label>
                      <input
                        type="text"
                        value={planForm.max_invitations}
                        onChange={(e) => {
                          const sanitized = sanitizeNumericInput(
                            e.target.value,
                          );
                          setPlanForm({
                            ...planForm,
                            max_invitations: sanitized || "",
                          });
                        }}
                        style={getInputStyle(isDarkMode)}
                        placeholder="Enter number"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label
                        className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Max Contracts
                      </label>
                      <input
                        type="text"
                        value={planForm.max_contracts}
                        onChange={(e) => {
                          const sanitized = sanitizeNumericInput(
                            e.target.value,
                          );
                          setPlanForm({
                            ...planForm,
                            max_contracts: sanitized || "",
                          });
                        }}
                        style={getInputStyle(isDarkMode)}
                        placeholder="Enter number"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Discount Percentage (%)
                  </label>

                  <input
                    type="text"
                    min="0"
                    max="100"
                    value={planForm.discount_percentage}
                    onChange={(e) => {
                      let value = e.target.value;

                      if (
                        value === "" ||
                        (Number(value) >= 0 && Number(value) <= 100)
                      ) {
                        setPlanForm({
                          ...planForm,
                          discount_percentage: value,
                        });

                        if (touchedFields.discount_percentage) {
                          setValidationErrors({
                            ...validationErrors,
                            discount_percentage:
                              validateDiscountPercentage(value),
                          });
                        }
                      }
                    }}
                    className="w-full"
                    style={getInputStyle(isDarkMode)}
                    placeholder="0 - 100"
                  />

                  {validationErrors.discount_percentage && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.discount_percentage}
                    </p>
                  )}
                </div>

                {/* Discount Description */}
                <div className="mt-4 flex flex-col gap-1.5">
                  <label
                    className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Discount Description
                    <span
                      className={`text-xs ml-2 ${planForm.discount_description.length > 50 ? "text-red-500" : "text-gray-500"}`}
                    >
                      ({planForm.discount_description.length}/50)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={planForm.discount_description}
                    onChange={(e) => {
                      const value = e.target.value.slice(0, 50);
                      setPlanForm({ ...planForm, discount_description: value });
                    }}
                    placeholder="e.g., 20% off for first year"
                    style={getInputStyle(isDarkMode)}
                    maxLength={50}
                  />
                  {planForm.discount_description.length > 50 && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <span>⚠️</span> Discount description must be 50 characters
                      or less
                    </p>
                  )}
                </div>

                {/* Popular Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_popular"
                    checked={planForm.is_popular}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, is_popular: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-2 border-gray-400"
                  />
                  <label
                    htmlFor="is_popular"
                    className={`text-sm ${isDarkMode ? "text-white" : "text-gray-700"}`}
                  >
                    Mark as Popular Plan
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={modalMode === "create" ? createPlan : updatePlan}
                  disabled={isLoading.action}
                  className="w-full text-white px-6 py-2.5 rounded-[10px] text-[14px] font-bold hover:opacity-90 shadow-lg"
                  style={{
                    background:
                      "linear-gradient(90deg, #51218F 0%, #020202 100%)",
                  }}
                >
                  {isLoading.action ? (
                    <Loader className="animate-spin mx-auto" size={20} />
                  ) : modalMode === "create" ? (
                    "Create Plan"
                  ) : (
                    "Update Plan"
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsPlanModalOpen(false);
                    resetPlanForm();
                  }}
                  className={`w-full px-8 py-2.5 rounded-[10px] text-[14px] font-bold border-[3px] transition ${isDarkMode ? "bg-gray-500 text-white border-white" : "bg-gray-400 text-white border-black"}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subscription History - Keep as is */}
        <div className="mt-8">
          <h2
            className={`text-2xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-black"}`}
          >
            Subscription History
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap mb-4">
            <div className="flex gap-2 flex-wrap flex-1">
              <button
                onClick={() => setHistoryPlanFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${historyPlanFilter === "all" ? "bg-purple-600 text-white" : isDarkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              >
                All ({subscriptionHistory.length})
              </button>
              <button
                onClick={() => setHistoryPlanFilter("paid")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${historyPlanFilter === "paid" ? "bg-green-600 text-white" : isDarkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              >
                <Download size={14} /> Paid Plans (
                {subscriptionHistory.filter((i) => !i.is_basic).length})
              </button>
              <button
                onClick={() => setHistoryPlanFilter("basic")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${historyPlanFilter === "basic" ? "bg-gray-600 text-white" : isDarkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              >
                <User size={14} /> Basic/Free (
                {subscriptionHistory.filter((i) => i.is_basic).length})
              </button>
            </div>

            <div className="relative w-full sm:w-72 flex-shrink-0">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by name, role, plan and billing cycle"
                value={historySearchTerm}
                onChange={(e) => {
                  setHistorySearchTerm(e.target.value);
                  setHistoryCurrentPage(1);
                }}
                className={`w-full pl-10 pr-4 py-2 rounded-xl border-2 focus:outline-none focus:border-purple-500 transition-colors ${
                  isDarkMode
                    ? "bg-gray-800 border-purple-500 text-white placeholder-gray-400"
                    : "bg-gray-100 border-purple-400 text-black placeholder-gray-500"
                }`}
                style={{
                  boxShadow: isDarkMode
                    ? "0 0 0 1px rgba(139,92,246,0.4)"
                    : "0 0 0 1px rgba(139,92,246,0.25)",
                }}
              />
            </div>
          </div>

          <div
            className={`rounded-lg overflow-hidden border ${isDarkMode ? "bg-[#1a1a1a] border-white/20" : "bg-white border-gray-300"} shadow-lg`}
          >
            {isLoading.history ? (
              <div className="flex justify-center py-12">
                <Loader className="animate-spin" size={40} />
              </div>
            ) : sortedHistory.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table
                    className="w-full text-left min-w-[1100px]"
                    style={{ borderCollapse: "collapse" }}
                  >
                    <thead>
                      <tr
                        className={`text-[13px] font-semibold ${isDarkMode ? "text-white border-b border-white/30" : "text-white border-b border-purple-800"}`}
                        style={
                          isDarkMode
                            ? {
                                background:
                                  "linear-gradient(90deg, #3b0764 0%, #2e1065 100%)",
                              }
                            : {
                                background:
                                  "linear-gradient(90deg, #4C1D95 0%, #5B21B6 100%)",
                              }
                        }
                      >
                        <th className="py-3 px-4 text-[13px] font-semibold">
                          S.No
                        </th>
                        <SortableHeader
                          label="Name"
                          sortKey="full_name"
                          currentSort={sortConfig}
                          onSort={handleSort}
                          isDarkMode={isDarkMode}
                        />
                        <th className="py-3 px-4 text-[13px] font-semibold">
                          Email
                        </th>
                        <th className="py-3 px-4 text-[13px] font-semibold">
                          Role
                        </th>
                        <SortableHeader
                          label="Plan"
                          sortKey="plan"
                          currentSort={sortConfig}
                          onSort={handleSort}
                          isDarkMode={isDarkMode}
                        />
                        <th className="py-3 px-4 text-[13px] font-semibold">
                          Billing Cycle
                        </th>
                        <th className="py-3 px-4 text-[13px] font-semibold">
                          Start Date
                        </th>
                        <th className="py-3 px-4 text-[13px] font-semibold">
                          End Date
                        </th>
                        <th className="py-3 px-4 text-[13px] font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedHistory.map((user, idx) => {
                        const globalIndex =
                          (historyCurrentPage - 1) * historyRowsPerPage +
                          idx +
                          1;
                        const cycleValue =
                          user.billing_cycle || user.duration || "monthly";
                        const isYearly =
                          cycleValue === "yearly" ||
                          cycleValue === "Yearly" ||
                          cycleValue === "annual" ||
                          cycleValue === "Annual" ||
                          cycleValue === "year";
                        const cycleDisplay = isYearly ? "Yearly" : "Monthly";
                        return (
                          <tr
                            key={user.frontend_id}
                            style={{
                              borderBottom:
                                idx === paginatedHistory.length - 1
                                  ? "none"
                                  : isDarkMode
                                    ? "1px solid #374151"
                                    : "1px solid #9ca3af",
                              transition: "all 0.15s ease",
                            }}
                            className={`transition-all duration-150 ${
                              isDarkMode
                                ? "text-gray-300 hover:bg-white/5"
                                : "text-gray-700 hover:bg-purple-50"
                            }`}
                          >
                            <td className="py-3 px-4 font-medium text-[13px]">
                              {globalIndex}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-full border overflow-hidden shrink-0 ${isDarkMode ? "border-white/50" : "border-gray-200"}`}
                                >
                                  <Avatar user={user} />
                                </div>
                                <span className="font-semibold whitespace-nowrap text-[13px]">
                                  {user.full_name}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-[13px]">
                              {user.email}
                            </td>
                            <td className="py-3 px-4 text-[13px]">
                              {user.role}
                            </td>
                            <td className="py-3 px-4 font-bold text-[13px]">
                              <div className="flex items-center gap-2">
                                {user.plan}
                                {user.is_basic && (
                                  <span
                                    className={`text-[10px] px-2 py-0.5 rounded-full ${isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"}`}
                                  >
                                    Free
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-[13px]">
                              <span
                                className={`px-2 py-1 rounded-full text-[11px] font-medium ${isYearly ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}
                              >
                                {cycleDisplay}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-[13px]">
                              {formatDate(user.start_date)}
                            </td>
                            <td className="py-3 px-4 text-[13px]">
                              {formatDate(user.end_date)}
                            </td>
                            <td className="py-3 px-4">
                              {!user.is_basic ? (
                                <button
                                  onClick={() => downloadInvoice(user)}
                                  disabled={isLoading.action}
                                  className={`cursor-pointer hover:scale-125 transition-transform p-2 rounded-lg ${isDarkMode ? "text-white hover:text-gray-300 hover:bg-gray-100/10" : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"} ${isLoading.action ? "opacity-50 cursor-not-allowed" : ""}`}
                                  title="Download Invoice"
                                >
                                  {isLoading.action &&
                                  selectedRow?.id === user.id ? (
                                    <Loader
                                      className="animate-spin"
                                      size={18}
                                    />
                                  ) : (
                                    <Download size={18} />
                                  )}
                                </button>
                              ) : (
                                <span className="text-gray-400 text-[11px] italic px-2">
                                  No invoice
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div
                  className={`flex flex-col sm:flex-row justify-between items-center gap-4 px-4 py-4 text-sm font-medium ${isDarkMode ? "text-white" : "text-black"}`}
                >
                  <div
                    className={`flex items-center gap-2 order-2 sm:order-1 ${isDarkMode ? "text-white/80" : "text-gray-600"}`}
                  >
                    <span>Rows per page</span>
                    <select
                      value={historyRowsPerPage}
                      onChange={(e) =>
                        handleHistoryRowsPerPageChange(e.target.value)
                      }
                      className={`bg-transparent px-3 py-1.5 rounded-full font-medium border-2 focus:outline-none cursor-pointer ${isDarkMode ? "text-white border-white hover:bg-white/10" : "text-black border-gray-400 hover:bg-gray-100"}`}
                    >
                      <option className="text-black" value="5">
                        5
                      </option>
                      <option className="text-black" value="10">
                        10
                      </option>
                      <option className="text-black" value="20">
                        20
                      </option>
                      <option className="text-black" value="50">
                        50
                      </option>
                    </select>
                    <span>
                      {sortedHistory.length > 0
                        ? `${startHistoryIndex}-${endHistoryIndex} of ${sortedHistory.length} rows`
                        : "0 rows"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 order-1 sm:order-2">
                    <button
                      onClick={() =>
                        handleHistoryPageChange(historyCurrentPage - 1)
                      }
                      disabled={
                        historyCurrentPage === 1 || totalHistoryPages === 0
                      }
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 ${isDarkMode ? "border-white text-white hover:bg-white/10" : "border-gray-400 text-gray-700 hover:bg-gray-100"}`}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {totalHistoryPages > 0 &&
                      [...Array(Math.min(5, totalHistoryPages))].map((_, i) => {
                        let pageNum;
                        if (totalHistoryPages <= 5) pageNum = i + 1;
                        else if (historyCurrentPage <= 3) pageNum = i + 1;
                        else if (historyCurrentPage >= totalHistoryPages - 2)
                          pageNum = totalHistoryPages - 4 + i;
                        else pageNum = historyCurrentPage - 2 + i;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handleHistoryPageChange(pageNum)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs transition-all duration-200 hover:scale-110 ${
                              historyCurrentPage === pageNum
                                ? "text-white"
                                : isDarkMode
                                  ? "text-white hover:bg-white/10"
                                  : "text-gray-700 hover:bg-gray-100"
                            }`}
                            style={
                              historyCurrentPage === pageNum
                                ? {
                                    background:
                                      "linear-gradient(90deg, #4C1D95 0%, #5B21B6 100%)",
                                  }
                                : {}
                            }
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    <button
                      onClick={() =>
                        handleHistoryPageChange(historyCurrentPage + 1)
                      }
                      disabled={
                        historyCurrentPage === totalHistoryPages ||
                        totalHistoryPages === 0
                      }
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 ${isDarkMode ? "border-white text-white hover:bg-white/10" : "border-gray-400 text-gray-700 hover:bg-gray-100"}`}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                {historySearchTerm
                  ? `No results found for "${historySearchTerm}"`
                  : historyPlanFilter !== "all"
                    ? `No ${historyPlanFilter} plan subscriptions found`
                    : "No subscription history available"}
              </div>
            )}
          </div>
        </div>

        {/* Delete Plan Modal - Simplified */}
{showDeleteModal && (
  <div className="fixed inset-0 flex items-center justify-center z-[999]">
    <div className="absolute inset-0 backdrop-blur-md bg-black/60" onClick={() => setShowDeleteModal(false)} />
    <div className={`relative w-full max-w-md rounded-[24px] shadow-[0_0_20px_rgba(0,0,0,0.3)] p-6 text-center ${isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-gray-100/95 backdrop-blur-lg"}`}>
      <h3 className={`text-2xl font-semibold mb-3 ${isDarkMode ? "text-white" : "text-black"}`}>
        Delete Plan
      </h3>
      
      <p className={`mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
        Are you sure you want to delete <span className="font-semibold">{planToDelete?.name}</span> plan?
        <br />This action cannot be undone.
      </p>
      
      <div className="flex justify-center gap-4">
        <button
          onClick={() => { setShowDeleteModal(false); setPlanToDelete(null); }}
          className={`px-5 py-2 rounded-full transition ${isDarkMode ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-gray-400 text-white hover:bg-gray-500"}`}
        >
          Cancel
        </button>
        <button
          onClick={confirmDeletePlan}
          className="px-5 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default SubscriptionPage;
