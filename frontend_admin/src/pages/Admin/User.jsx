import React, { useState, useEffect, useRef } from "react";
import {
  User, ChevronDown, X, Search, Plus, Pencil,
  Trash2, Award, Share, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, Loader2
} from "lucide-react";
import api from "../../utils/axiosConfig";
import toast from "../../component/Toast";
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
// Import the data update emitter from Dashboard
import { dataUpdateEmitter } from './Dashboard';

const UserPage = () => {
  const userImages = [
    user1, user2, user3, user4, user5, user6,
    user7, user8, user9, user10, user11,
  ];

  // Refs for dropdowns
  const roleDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);
  const addRoleDropdownRef = useRef(null);
  const addStatusDropdownRef = useRef(null);
  const editStatusDropdownRef = useRef(null);

  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userStats, setUserStats] = useState({
    total_users: 0,
    active_users: 0,
    suspended_users: 0
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Loading states for actions
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Add modal dropdown states
  const [showAddRoleDropdown, setShowAddRoleDropdown] = useState(false);
  const [showAddStatusDropdown, setShowAddStatusDropdown] = useState(false);

  // Edit modal dropdown states
  const [showEditStatusDropdown, setShowEditStatusDropdown] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  
  // Validation errors
  const [validationErrors, setValidationErrors] = useState({
    full_name: "",
    email: "",
    password: ""
  });

  // Form states for add/edit
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    role: "creator",
    status: "Active",
    password: ""
  });

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === "dark") return true;
    if (savedTheme === "light") return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Helper function to trigger dashboard updates
  const triggerDashboardUpdate = (action = 'update', userName = '') => {
    dataUpdateEmitter.emit('userDataChanged', { action, source: 'UserPage', userName });
    dataUpdateEmitter.emit('dashboardDataUpdated', { source: 'UserPage', action, userName });
    localStorage.setItem('dashboardRefresh', Date.now().toString());
    localStorage.setItem('adminDataUpdated', Date.now().toString());
    // console.log(`Dashboard update triggered: ${action} user - ${userName}`);
  };

  // Refresh function - fetches users and stats
  const refreshData = async () => {
    await Promise.all([
      fetchUsers(),
      fetchUserStats()
    ]);
  };

  const validateFullName = (name) => {
    const regex = /^[A-Za-z\s]*$/;
    if (!name) return "Full name is required";
    if (!regex.test(name)) return "Only alphabets and spaces allowed";
    return "";
  };

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|outlook\.com)$/;
    if (!email) return "";
    if (!regex.test(email)) return "Must be a valid email (gmail, yahoo, outlook)";
    return "";
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!password) return "";
    if (!regex.test(password)) return "Min 8 chars with uppercase, lowercase, number & special character";
    return "";
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setShowRoleDropdown(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
      }
      if (addRoleDropdownRef.current && !addRoleDropdownRef.current.contains(event.target)) {
        setShowAddRoleDropdown(false);
      }
      if (addStatusDropdownRef.current && !addStatusDropdownRef.current.contains(event.target)) {
        setShowAddStatusDropdown(false);
      }
      if (editStatusDropdownRef.current && !editStatusDropdownRef.current.contains(event.target)) {
        setShowEditStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdowns on escape key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setShowRoleDropdown(false);
        setShowStatusDropdown(false);
        setShowAddRoleDropdown(false);
        setShowAddStatusDropdown(false);
        setShowEditStatusDropdown(false);
      }
    };
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        page_size: pageSize,
      };

      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const response = await api.get('/admin/users', { params });

      if (!response.data.data || response.data.data.length === 0) {
        setUsers([]);
        setTotalUsers(response.data.total_users || 0);
        setTotalPages(1);
        return;
      }

      const transformedUsers = response.data.data.map((user, index) => ({
        id: user.id,
        name: user.full_name || "None None",
        email: user.email,
        user: user.username || user.email?.split('@')[0] || `user${index + 1}`,
        status: user.status === "Available" ? "Active" : user.status === "Away" ? "Inactive" : user.status || "Active",
        role: user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : "Pending",
        date: user.joined_date || new Date(user.created_at).toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric'
        }),
        active: user.last_active || "Recently",
        img: user.profile_image || userImages[index % userImages.length]
      }));

      setUsers(transformedUsers);
      setTotalUsers(response.data.total_users);
      const pages = Math.ceil(response.data.total_users / pageSize);
      setTotalPages(pages > 0 ? pages : 1);

    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(error.response?.data?.detail || "Failed to load users");
      setUsers([]);
      setTotalUsers(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user statistics
  const fetchUserStats = async () => {
    try {
      const [totalRes, activeRes, suspendedRes] = await Promise.all([
        api.get('/admin/users', { params: { page: 1, page_size: 1 } }),
        api.get('/admin/users', { params: { status: 'Active', page: 1, page_size: 1 } }),
        api.get('/admin/users', { params: { status: 'Banned', page: 1, page_size: 1 } }),
      ]);

      setUserStats({
        total_users: totalRes.data.total_users || 0,
        active_users: activeRes.data.total_users || 0,
        suspended_users: suspendedRes.data.total_users || 0
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  // Add user - send OTP first
  const handleAddUser = async (e) => {
    e.preventDefault();
    
    const fullNameError = validateFullName(formData.full_name);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    setValidationErrors({
      full_name: fullNameError,
      email: emailError,
      password: passwordError
    });

    if (fullNameError || emailError || passwordError) {
      toast.error("Please fix validation errors");
      return;
    }

    if (!formData.full_name) {
      toast.error("Full name is required");
      return;
    }

    setIsSendingOtp(true);
    try {
      const otpResponse = await api.post("/verification/signup/send-otp", {
        email: formData.email
      });

      if (otpResponse.data.status === "success") {
        toast.success("OTP sent to email");
        setShowOtpModal(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Create user after OTP verification
  const createUser = async () => {
    setIsCreatingUser(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("full_name", formData.full_name);
      formDataObj.append("email", formData.email);
      formDataObj.append("role", formData.role);
      formDataObj.append("status", formData.status);
      formDataObj.append("password", formData.password);

      const response = await api.post("/admin/users", formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.status === "success") {
        toast.success("User created successfully");
        setIsAddModalOpen(false);
        resetForm();
        await refreshData();
        triggerDashboardUpdate('create', formData.full_name);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create user");
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Verify OTP then create user
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    
    setIsVerifyingOtp(true);
    try {
      const response = await api.post("/verification/signup/verify-otp", {
        email: formData.email,
        otp_code: otp
      });

      if (response.data.status === "success") {
        toast.success("Email verified");
        setIsOtpVerified(true);
        setShowOtpModal(false);
        await createUser();
      }
    } catch (error) {
      toast.error("Invalid OTP");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Edit user
  const handleEditUser = async (e) => {
    e.preventDefault();
    
    const fullNameError = validateFullName(formData.full_name);

    if (fullNameError) {
      setValidationErrors({
        ...validationErrors,
        full_name: fullNameError
      });
      toast.error("Please fix validation errors");
      return;
    }

    setIsUpdatingUser(true);
    try {
      const response = await api.put(`/admin/users/${selectedUser.id}`, {
        name: formData.full_name,
        status: formData.status
      });

      if (response.data.status === 'success') {
        toast.success(`User ${formData.full_name} updated successfully`);
        setIsEditModalOpen(false);
        resetForm();
        await refreshData();
        triggerDashboardUpdate('edit', formData.full_name);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(error.response?.data?.detail || "Failed to update user");
    } finally {
      setIsUpdatingUser(false);
    }
  };

  // Delete user
  const handleDeleteUser = (userId) => {
    const user = users.find(u => u.id === userId);
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeletingUser(true);
    try {
      const response = await api.delete(`/admin/users/${userToDelete.id}`);

      if (response.data.status === 'success') {
        toast.success("User deleted successfully");
        setShowDeleteModal(false);
        setUserToDelete(null);
        await refreshData();
        triggerDashboardUpdate('delete', userToDelete.name);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to delete user");
      setShowDeleteModal(false);
      setUserToDelete(null);
    } finally {
      setIsDeletingUser(false);
    }
  };

  // Export users
  const handleExport = async (format = 'csv') => {
    setIsExporting(true);
    try {
      const response = await api.get('/admin/users/export', {
        params: {
          format,
          role: roleFilter || undefined,
          status: statusFilter || undefined,
          search: searchTerm || undefined
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users_export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`Users exported as ${format.toUpperCase()} successfully`);
    } catch (error) {
      console.error("Error exporting users:", error);
      toast.error("Failed to export users");
    } finally {
      setIsExporting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      role: "creator",
      status: "Active",
      password: ""
    });
    setValidationErrors({
      full_name: "",
      email: "",
      password: ""
    });
    setOtp("");
    setIsOtpVerified(false);
  };

  // Open edit modal with user data
  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      full_name: user.name,
      email: user.email,
      role: user.role.toLowerCase(),
      status: user.status || "Active",
      password: ""
    });
    setValidationErrors({
      full_name: "",
      email: "",
      password: ""
    });
    setIsEditModalOpen(true);
  };

  const applyFilters = () => {
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(Number(newSize));
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Fetch data when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize, roleFilter, statusFilter, searchTerm]);

  // Fetch stats on mount
  useEffect(() => {
    fetchUserStats();
  }, []);

  // Theme effect
  useEffect(() => {
    const applyTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      const currentTheme = savedTheme
        ? savedTheme
        : window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light";
      setIsDarkMode(currentTheme === "dark");
    };

    applyTheme();

    window.addEventListener("theme-change", applyTheme);
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (!localStorage.getItem("theme")) applyTheme();
    };
    mediaQuery.addEventListener('change', handleSystemChange);

    return () => {
      window.removeEventListener("theme-change", applyTheme);
      mediaQuery.removeEventListener('change', handleSystemChange);
    };
  }, []);

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalUsers);

  // Input style helper
  const getInputStyle = () => {
    return {
      width: '100%',
      backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
      border: isDarkMode ? '2px solid #6B7280' : '2px solid #9CA3AF',
      borderRadius: '12px',
      padding: '10px 16px',
      fontSize: '14px',
      color: isDarkMode ? '#FFFFFF' : '#000000',
      outline: 'none'
    };
  };

  // Custom Dropdown Component - MATCHING ADD USER POPUP STYLE
  const CustomPopupDropdown = ({ value, onChange, options, placeholder, isDarkMode, dropdownRef, showDropdown, setShowDropdown }) => {
    const selectedOption = options.find(opt => opt.value === value);
    
    return (
      <div className="relative w-full" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center justify-between w-full px-3 py-2 rounded-md text-[12px] font-medium transition-all duration-200 cursor-pointer hover:scale-[1.02]"
          style={{
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.15)' : '#FFFFFF',
            border: isDarkMode ? '2px solid #6B7280' : '2px solid #9CA3AF',
            borderRadius: '12px',
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: '500',
            color: isDarkMode ? '#FFFFFF' : '#000000',
          }}
        >
          <span className={!selectedOption ? "opacity-60" : ""}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown size={16} style={{ transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
        </button>
        
        {showDropdown && (
          <div className={`absolute z-50 w-full mt-1 rounded-lg shadow-lg overflow-hidden ${
            isDarkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white border border-gray-200 shadow-xl'
          }`}>
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setShowDropdown(false);
                }}
                className={`w-full px-4 py-2 text-left text-[14px] transition-all duration-150 ${
                  isDarkMode 
                    ? 'text-white hover:bg-gray-700 hover:pl-5' 
                    : 'text-gray-700 hover:bg-purple-50 hover:pl-5'
                } ${value === option.value ? (isDarkMode ? 'bg-gray-700' : 'bg-purple-100 text-purple-700 font-semibold') : ''}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Filter Dropdown Component - SAME STYLE AS ADD USER POPUP
  const FilterDropdown = ({ value, onChange, options, placeholder, isDarkMode, dropdownRef, showDropdown, setShowDropdown }) => {
    const selectedOption = options.find(opt => opt.value === value);
    const displayText = selectedOption?.label || placeholder || (value || "All");
    
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center justify-between gap-2 px-4 py-2 rounded-md text-[12px] font-medium transition-all duration-200 cursor-pointer hover:scale-[1.02] min-w-[120px]"
          style={{
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.15)' : '#FFFFFF',
            border: isDarkMode ? '2px solid #6B7280' : '2px solid #9CA3AF',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '500',
            color: isDarkMode ? '#FFFFFF' : '#000000',
          }}
        >
          <span className="flex items-center gap-2">
            {value === "creator" || value === "collaborator" ? <User size={14} /> : <Award size={14} />}
            {displayText}
          </span>
          <ChevronDown size={14} style={{ transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
        </button>
        
        {showDropdown && (
          <div className={`absolute z-50 mt-1 rounded-lg shadow-lg overflow-hidden min-w-[130px] ${
            isDarkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white border border-gray-200 shadow-xl'
          }`}>
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setShowDropdown(false);
                }}
                className={`w-full px-4 py-2 text-left text-[13px] transition-all duration-150 ${
                  isDarkMode 
                    ? 'text-white hover:bg-gray-700 hover:pl-5' 
                    : 'text-gray-700 hover:bg-purple-50 hover:pl-5'
                } ${value === option.value ? (isDarkMode ? 'bg-gray-700' : 'bg-purple-100 text-purple-700 font-semibold') : ''}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Loader Button Component
  const LoaderButton = ({ onClick, isLoading, children, className, style, type = "button", disabled = false }) => {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={isLoading || disabled}
        className={className}
        style={style}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            {children}
          </span>
        ) : children}
      </button>
    );
  };

  // Get status color class (plain text, no badge)
  const getStatusColor = (status) => {
    if (!status) return isDarkMode ? 'text-gray-400' : 'text-gray-500';
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'active') return isDarkMode ? 'text-green-400' : 'text-green-600';
    if (lowerStatus === 'inactive') return isDarkMode ? 'text-gray-400' : 'text-gray-500';
    if (lowerStatus === 'banned') return isDarkMode ? 'text-red-400' : 'text-red-600';
    return isDarkMode ? 'text-gray-300' : 'text-gray-700';
  };

  // Role options for filter dropdown
  const roleOptions = [
    { value: "", label: "All Roles" },
    { value: "creator", label: "Creator" },
    { value: "collaborator", label: "Collaborator" }
  ];

  // Status options for filter dropdown
  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
    { value: "Banned", label: "Banned" }
  ];

  return (
    <div className={`w-full h-full ${isDarkMode ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}>
      <div className="px-4 md:px-6 pt-0 pb-8 max-w-full mx-auto">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-6">
          <div className="flex flex-col flex-1">
            <h2 className={`text-2xl md:text-[32px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}>
              User Management
            </h2>
            <p className={`text-sm mt-1 max-w-[550px] ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>
              Manage all users in one place. Control access, assign roles, and monitor activity across your platform.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-row gap-2 md:gap-3">
              {[
                { label: "All Users", val: userStats.total_users.toString() },
                { label: "Active", val: userStats.active_users.toString(), dot: true },
                { label: "Suspended", val: userStats.suspended_users.toString() }
              ].map((item, i) => (
                <div
                  key={i}
                  className={`
                    flex-1 lg:flex-none lg:px-6 px-3 py-2 rounded-xl text-center bg-transparent
                    border-[2px] ${isDarkMode ? 'border-white shadow-[0_0_0_1px_rgba(255,255,255,0.9)]' : 'border-black shadow-[0_0_0_1px_rgba(0,0,0,0.9)]'}
                  `}
                >
                  <p className={`text-[9px] sm:text-[10px] md:text-[12px] font-bold flex items-center justify-center gap-1 whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    {item.label}
                    {item.dot && <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#05CD99] rounded-full shrink-0" />}
                  </p>
                  <p className={`text-lg sm:text-xl md:text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    {item.val}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FILTER BAR - SAME BACKGROUND AS TABLE HEADER */}
        <div className="mb-6">
          <div
            className={`rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 transition-colors duration-300`}
            style={isDarkMode ? { background: "linear-gradient(90deg, #3b0764 0%, #2e1065 100%)", border: '1px solid rgba(255,255,255,0.2)' } : { background: "linear-gradient(90deg, #4C1D95 0%, #5B21B6 100%)" }}
          >
            {/* SEARCH */}
            <div className="bg-white/90 rounded-full px-4 h-[38px] flex items-center flex-1 min-w-[200px] max-w-[300px]">
              <Search size={16} className="mr-2 text-[#4C1D95]" />
              <input
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                className="bg-transparent outline-none text-[13px] w-full font-medium text-[#4C1D95] placeholder-[#4C1D95]/60"
              />
            </div>

            {/* ROLE FILTER - UPDATED TO MATCH ADD USER POPUP STYLE */}
            <FilterDropdown
              value={roleFilter}
              onChange={(value) => { setRoleFilter(value); setCurrentPage(1); }}
              options={roleOptions}
              placeholder="All Roles"
              isDarkMode={isDarkMode}
              dropdownRef={roleDropdownRef}
              showDropdown={showRoleDropdown}
              setShowDropdown={setShowRoleDropdown}
            />

            {/* STATUS FILTER - UPDATED TO MATCH ADD USER POPUP STYLE */}
            <FilterDropdown
              value={statusFilter}
              onChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}
              options={statusOptions}
              placeholder="All Status"
              isDarkMode={isDarkMode}
              dropdownRef={statusDropdownRef}
              showDropdown={showStatusDropdown}
              setShowDropdown={setShowStatusDropdown}
            />

            <div className="flex-grow" />

            {/* ACTIONS - UPDATED BUTTON STYLES */}
            <div className="flex gap-2 shrink-0">
              <button
                onClick={clearFilters}
                className="bg-white/90 px-4 h-[38px] rounded-full text-[12px] font-bold flex items-center gap-2 text-[#4C1D95] hover:bg-white transition-all duration-200"
              >
                <X size={16} /> Clear Filters
              </button>
              <LoaderButton
                onClick={() => handleExport('csv')}
                isLoading={isExporting}
                className="bg-white/90 px-4 h-[38px] rounded-full text-[12px] font-bold flex items-center gap-2 text-[#4C1D95] hover:bg-white transition-all duration-200"
              >
                <Share size={16} /> Export
              </LoaderButton>
              
            </div>
          </div>
        </div>

        {/* TABLE - LARGER FONTS & BORDER BOTTOM LINES */}
        <div className={`mb-4 rounded-lg overflow-hidden border ${isDarkMode ? 'bg-[#1a1a1a] border-white/20' : 'bg-white border-gray-300'} shadow-lg`}>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin h-12 w-12 text-[#4C1D95]" />
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[800px] text-left" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    className={`text-[14px] font-semibold ${isDarkMode ? 'text-white border-b border-white/30' : 'text-white border-b border-purple-800'}`}
                    style={isDarkMode ? { background: "linear-gradient(90deg, #3b0764 0%, #2e1065 100%)" } : { background: "linear-gradient(90deg, #4C1D95 0%, #5B21B6 100%)" }}
                  >
                    <th className="py-3 pl-6 pr-2 w-[15%] text-left text-[13px] font-semibold whitespace-nowrap">Full Name</th>
                    <th className="py-3 px-3 w-[18%] text-left text-[13px] font-semibold whitespace-nowrap">Email</th>
                    <th className="py-3 px-3 w-[8%] text-left text-[13px] font-semibold whitespace-nowrap">Status</th>
                    <th className="py-3 px-3 w-[8%] text-left text-[13px] font-semibold whitespace-nowrap">Role</th>
                    <th className="py-3 px-3 w-[12%] text-left text-[13px] font-semibold whitespace-nowrap">Joined Date</th>
                    <th className="py-3 px-3 w-[10%] text-left text-[13px] font-semibold whitespace-nowrap">Last Active</th>
                    <th className="py-3 pr-6 pl-3 text-center w-[7%] text-left text-[13px] font-semibold whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
  {users.length > 0 ? (
    users.map((u, i) => (
      <tr
        key={u.id || i}
        style={{
          borderBottom: i === users.length - 1 
            ? "none" 
            : isDarkMode 
              ? "1px solid #374151"   // darker gray for dark mode
              : "1px solid #9ca3af",   // darker gray for light mode
          transition: "all 0.15s ease"
        }}
        className={`transition-all duration-150 ${
          isDarkMode 
            ? "text-gray-300 hover:bg-white/5" 
            : "text-gray-700 hover:bg-purple-50"
        }`}
      >
        {/* INCREASED PADDING AND LARGER FONTS - py-3 */}
        <td className="py-3 pl-6 pr-2">
          <div className="flex items-center gap-2 font-semibold">
            <img
              src={u.img || userImages[i % userImages.length]}
              className={`w-8 h-8 rounded-full shrink-0 border-2 object-cover ${isDarkMode ? 'border-white/30' : 'border-gray-200'}`}
              alt={u.name}
              onError={(e) => { e.target.src = userImages[i % userImages.length]; }}
            />
            <span className="truncate text-[13px] font-semibold">{u.name}</span>
          </div>
        </td>
        <td className="py-3 px-3 truncate text-[12px]">{u.email}</td>
        <td className={`py-3 px-3 text-[12px] font-medium ${getStatusColor(u.status)}`}>
          {u.status}
        </td>
        <td className="py-3 px-3 truncate text-[12px] font-medium">{u.role}</td>
        <td className="py-3 px-3 truncate text-[12px]">{u.date}</td>
        <td className="py-3 px-3 truncate text-[12px]">{u.active}</td>
        <td className="py-3 pr-6 pl-3">
          <div className="flex justify-start gap-3">
            <Pencil
              size={16}
              className="cursor-pointer hover:scale-125 transition-transform text-purple-600"
              onClick={() => openEditModal(u)}
            />
            <Trash2
              size={16}
              className="text-red-500 cursor-pointer hover:scale-125 transition-transform"
              onClick={() => handleDeleteUser(u.id)}
            />
          </div>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="7" className="text-center py-8 text-gray-500">
        No users found
      </td>
    </tr>
  )}
</tbody>
               </table>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        <div className={`flex flex-col md:flex-row justify-between items-center gap-4 px-2 py-4 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
          <div className={`flex items-center gap-2 order-2 md:order-1 ${isDarkMode ? 'text-white/80' : 'text-black/80'}`}>
            <span>Rows per page</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(e.target.value)}
              className={`bg-transparent px-3 py-1.5 rounded-full font-medium border-2 focus:outline-none ${isDarkMode ? 'text-white border-white' : 'text-black border-black'}`}
            >
              <option className="text-black" value="5">5</option>
              <option className="text-black" value="10">10</option>
              <option className="text-black" value="20">20</option>
              <option className="text-black" value="50">50</option>
            </select>
            <span>{totalUsers > 0 ? `${startIndex}-${endIndex} of ${totalUsers} rows` : '0 rows'}</span>
          </div>

          <div className="flex items-center gap-2 order-1 md:order-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1 || totalPages === 0}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 ${
                isDarkMode ? 'border-white text-white hover:bg-white/10' : 'border-gray-400 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || totalPages === 0}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 ${
                isDarkMode ? 'border-white text-white hover:bg-white/10' : 'border-gray-400 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft size={16} />
            </button>

            {totalPages > 0 && [...Array(Math.min(5, totalPages))].map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs transition-all duration-200 hover:scale-110 ${
                    currentPage === pageNum
                      ? 'text-white'
                      : isDarkMode 
                        ? 'text-white hover:bg-white/10' 
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={currentPage === pageNum ? { background: "linear-gradient(90deg, #4C1D95 0%, #5B21B6 100%)" } : {}}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 ${
                isDarkMode ? 'border-white text-white hover:bg-white/10' : 'border-gray-400 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 ${
                isDarkMode ? 'border-white text-white hover:bg-white/10' : 'border-gray-400 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* ADD USER MODAL - UPDATED DROPDOWN STYLES */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-[2px] p-4">
          <div className={`rounded-[20px] p-6 w-full max-w-[500px] shadow-2xl relative ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className={`text-xl md:text-[22px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>Add Users</h3>
              <button
                onClick={() => { setIsAddModalOpen(false); resetForm(); }}
                className="text-white rounded-full p-1 hover:opacity-90 transition-all duration-200 hover:scale-105"
                style={{ background: "linear-gradient(90deg, #4C1D95 0%, #5B21B6 100%)" }}
                disabled={isSendingOtp || isCreatingUser}
              >
                <X size={18} strokeWidth={3} />
              </button>
            </div>

            <form className="space-y-5" onSubmit={handleAddUser}>
              <div className="grid grid-cols-1 gap-x-6 gap-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className={`text-[14px] font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, full_name: value });
                      setValidationErrors({ ...validationErrors, full_name: validateFullName(value) });
                    }}
                    style={getInputStyle()}
                    placeholder="Enter full name (First Last)"
                    disabled={isSendingOtp || isCreatingUser}
                  />
                  {validationErrors.full_name && (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.full_name}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={`text-[14px] font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>Email Address <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, email: value });
                      setValidationErrors({ ...validationErrors, email: validateEmail(value) });
                    }}
                    style={getInputStyle()}
                    placeholder="example@gmail.com"
                    disabled={isSendingOtp || isCreatingUser}
                  />
                  {validationErrors.email && (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={`text-[14px] font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>Role</label>
                  <CustomPopupDropdown
                    value={formData.role}
                    onChange={(value) => setFormData({ ...formData, role: value })}
                    options={[
                      { value: "creator", label: "Creator" },
                      { value: "collaborator", label: "Collaborator" }
                    ]}
                    placeholder="Select role"
                    isDarkMode={isDarkMode}
                    dropdownRef={addRoleDropdownRef}
                    showDropdown={showAddRoleDropdown}
                    setShowDropdown={setShowAddRoleDropdown}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={`text-[14px] font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>Status</label>
                  <CustomPopupDropdown
                    value={formData.status}
                    onChange={(value) => setFormData({ ...formData, status: value })}
                    options={[
                      { value: "Active", label: "Active" },
                      { value: "Inactive", label: "Inactive" },
                      { value: "Banned", label: "Banned" }
                    ]}
                    placeholder="Select status"
                    isDarkMode={isDarkMode}
                    dropdownRef={addStatusDropdownRef}
                    showDropdown={showAddStatusDropdown}
                    setShowDropdown={setShowAddStatusDropdown}
                  />
                </div>
                <div className="flex flex-col gap-1.5 relative">
                  <label className={`text-[14px] font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>Password <span className="text-red-500">*</span></label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, password: value });
                      setValidationErrors({ ...validationErrors, password: validatePassword(value) });
                    }}
                    style={{
                      ...getInputStyle(),
                      paddingRight: '64px'
                    }}
                    placeholder="Enter password"
                    disabled={isSendingOtp || isCreatingUser}
                  />
                  <span
                    onClick={() => !isSendingOtp && !isCreatingUser && setShowPassword(!showPassword)}
                    className={`absolute right-4 top-[36px] text-[13px] font-semibold cursor-pointer ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-[#4C1D95] hover:text-black'} ${(isSendingOtp || isCreatingUser) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </span>
                  {validationErrors.password && (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.password}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <LoaderButton
                  type="submit"
                  isLoading={isSendingOtp}
                  className="w-full text-white px-6 py-2.5 rounded-[10px] text-[14px] font-bold hover:opacity-90 shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(90deg, #4C1D95 0%, #5B21B6 100%)" }}
                >
                  Send OTP
                </LoaderButton>
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); resetForm(); }}
                  disabled={isSendingOtp || isCreatingUser}
                  className={`w-full px-8 py-2.5 rounded-[10px] text-[14px] font-bold border-[3px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDarkMode 
                      ? 'bg-transparent text-white border-white hover:bg-gray-100/10' 
                      : 'bg-gray-100 text-black border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL - UPDATED DROPDOWN STYLES */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-[2px] p-4">
          <div className={`p-5 w-full max-w-3xl rounded-[24px] shadow-2xl relative ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold font-sans ${isDarkMode ? 'text-white' : 'text-black'}`}>Edit User</h2>
              <button
                onClick={() => { setIsEditModalOpen(false); resetForm(); }}
                className="text-white rounded-full p-1.5 hover:opacity-90 transition-all duration-200 hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(90deg, #4C1D95 0%, #5B21B6 100%)" }}
                disabled={isUpdatingUser}
              >
                <X size={18} strokeWidth={3} />
              </button>
            </div>

            <hr className={`mb-8 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`} />

            <form className="space-y-4" onSubmit={handleEditUser}>
              <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className={`text-[13px] font-semibold ${isDarkMode ? 'text-gray-400' : 'text-[#8E92BC]'}`}>Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, full_name: value });
                      setValidationErrors({ ...validationErrors, full_name: validateFullName(value) });
                    }}
                    style={getInputStyle()}
                    placeholder="Enter full name (First Last)"
                    disabled={isUpdatingUser}
                  />
                  {validationErrors.full_name && (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.full_name}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={`text-[13px] font-semibold ${isDarkMode ? 'text-gray-400' : 'text-[#8E92BC]'}`}>Status <span className="text-red-500">*</span></label>
                  <CustomPopupDropdown
                    value={formData.status}
                    onChange={(value) => setFormData({ ...formData, status: value })}
                    options={[
                      { value: "Active", label: "Active" },
                      { value: "Inactive", label: "Inactive" },
                      { value: "Banned", label: "Banned" }
                    ]}
                    placeholder="Select status"
                    isDarkMode={isDarkMode}
                    dropdownRef={editStatusDropdownRef}
                    showDropdown={showEditStatusDropdown}
                    setShowDropdown={setShowEditStatusDropdown}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={`text-[13px] font-semibold ${isDarkMode ? 'text-gray-400' : 'text-[#8E92BC]'}`}>Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    readOnly
                    style={{
                      width: '100%',
                      backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
                      border: isDarkMode ? '2px solid #4B5563' : '2px solid #D1D5DB',
                      borderRadius: '12px',
                      padding: '10px 16px',
                      fontSize: '14px',
                      color: isDarkMode ? '#9CA3AF' : '#6B7280',
                      cursor: 'not-allowed'
                    }}
                  />
                  <p className={`text-[10px] mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Email cannot be changed</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={`text-[13px] font-semibold ${isDarkMode ? 'text-gray-400' : 'text-[#8E92BC]'}`}>Role</label>
                  <input
                    type="text"
                    value={formData.role === "creator" ? "Creator" : "Collaborator"}
                    disabled
                    readOnly
                    style={{
                      width: '100%',
                      backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
                      border: isDarkMode ? '2px solid #4B5563' : '2px solid #D1D5DB',
                      borderRadius: '12px',
                      padding: '10px 16px',
                      fontSize: '14px',
                      color: isDarkMode ? '#9CA3AF' : '#6B7280',
                      cursor: 'not-allowed'
                    }}
                  />
                  <p className={`text-[10px] mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Role cannot be changed</p>
                </div>
              </div>

              <div className={`mt-3 p-3 rounded-xl border-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <h3 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>User Information (Read Only)</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>Username:</span>
                    <span className={`ml-2 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedUser?.user}</span>
                  </div>
                  <div>
                    <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>Joined:</span>
                    <span className={`ml-2 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedUser?.date}</span>
                  </div>
                  <div>
                    <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>Last Active:</span>
                    <span className={`ml-2 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedUser?.active}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <LoaderButton
                  type="submit"
                  isLoading={isUpdatingUser}
                  className="w-full text-white py-2.5 rounded-xl font-bold hover:opacity-90 shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(90deg, #4C1D95 0%, #5B21B6 100%)" }}
                >
                  Update User
                </LoaderButton>
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); resetForm(); }}
                  disabled={isUpdatingUser}
                  className={`w-full py-2.5 rounded-xl font-bold border-[3px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDarkMode 
                      ? 'bg-transparent text-white border-white hover:bg-gray-100/10' 
                      : 'bg-gray-100 text-black border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[200]">
          <div
            className="absolute inset-0 backdrop-blur-md bg-black/60"
            onClick={() => !isDeletingUser && setShowDeleteModal(false)}
          />
          <div className={`relative w-full max-w-md rounded-[24px] shadow-[0_0_20px_rgba(0,0,0,0.3)] p-6 text-center ${
            isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-100/95 backdrop-blur-lg'
          }`}>
            <h3 className={`text-2xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-black'}`}>Delete User</h3>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{userToDelete?.name}</span>?
              <br />This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => { setShowDeleteModal(false); setUserToDelete(null); }}
                disabled={isDeletingUser}
                className={`px-5 py-2 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-gray-400 text-white hover:bg-gray-500'
                }`}
              >
                Cancel
              </button>
              <LoaderButton
                onClick={confirmDelete}
                isLoading={isDeletingUser}
                className="px-5 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete
              </LoaderButton>
            </div>
          </div>
        </div>
      )}

      {/* OTP MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[300]">
          <div
            className="absolute inset-0 backdrop-blur-md bg-black/60"
            onClick={() => !isVerifyingOtp && !isCreatingUser && setShowOtpModal(false)}
          />
          <div className={`relative w-full max-w-md rounded-[24px] shadow-[0_0_20px_rgba(0,0,0,0.3)] p-6 text-center ${
            isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-100/95 backdrop-blur-lg'
          }`}>
            <h3 className={`text-2xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-black'}`}>Email Verification</h3>
            <p className={`mb-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Enter OTP sent to <br />
              <span className="font-semibold text-purple-600">{formData.email}</span>
            </p>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={isVerifyingOtp || isCreatingUser}
              style={{
                width: '100%',
                textAlign: 'center',
                fontSize: '18px',
                letterSpacing: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: isDarkMode ? '2px solid #6B7280' : '2px solid #9CA3AF',
                backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                color: isDarkMode ? '#FFFFFF' : '#000000',
                outline: 'none',
                marginBottom: '24px'
              }}
              placeholder="------"
            />
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowOtpModal(false)}
                disabled={isVerifyingOtp || isCreatingUser}
                className={`px-5 py-2 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-gray-400 text-white hover:bg-gray-500'
                }`}
              >
                Cancel
              </button>
              <LoaderButton
                onClick={handleVerifyOtp}
                isLoading={isVerifyingOtp || isCreatingUser}
                className="px-5 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingUser ? "Creating..." : "Verify"}
              </LoaderButton>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserPage;