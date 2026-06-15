​import React, { useState, useEffect, useMemo } from "react";
import {
  User, ChevronDown, X, Search, Plus, Pencil,
  Trash2, Calendar, Award, Share, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, Bell, CheckCircle, AlertCircle, Info
} from "lucide-react";
import api from "../../utils/axiosConfig";
import { toast } from "react-hot-toast";
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

const UserPage = () => {
  const userImages = [
    user1, user2, user3, user4, user5, user6,
    user7, user8, user9, user10, user11,
  ];

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

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  // Form states for add/edit
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "Creator",
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

  // Add notification
  const addNotification = (type, title, message) => {
    const newNotification = {
      id: Date.now(),
      type: type,
      title: title,
      message: message,
      timestamp: new Date().toLocaleTimeString(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 50));
    setUnreadCount(prev => prev + 1);
    
    switch(type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'warning':
        toast(message, { icon: '⚠️' });
        break;
      default:
        toast(message);
    }
  };

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Remove single notification
  const removeNotification = (notificationId) => {
    setNotifications(prev => {
      const filtered = prev.filter(notif => notif.id !== notificationId);
      const newUnreadCount = filtered.filter(n => !n.read).length;
      setUnreadCount(newUnreadCount);
      return filtered;
    });
  };

  // Fetch users with filters
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const adminId = localStorage.getItem("adminId");
      if (!adminId) {
        addNotification('error', 'Authentication Error', 'Please login again');
        return;
      }

      const timestamp = new Date().getTime();
      
      const response = await api.get('/admin/users', {
        params: {
          page: currentPage,
          page_size: pageSize,
          role: roleFilter || undefined,
          status: statusFilter || undefined,
          search: searchTerm || undefined,
          _t: timestamp
        },
        headers: { user_id: adminId }
      });

      console.log("Users response:", response.data);
      
      const transformedUsers = response.data.data.map((user, index) => ({
        id: user.id,
        name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || "None None",
        email: user.email,
        user: user.username || user.email?.split('@')[0] || `user${index + 1}`,
        status: user.status || "Active",
        role: user.role || "creator",
        date: user.joined_date || new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        active: user.last_active || "Recently",
        img: userImages[index % userImages.length]
      }));

      setUsers(transformedUsers);
      setTotalUsers(response.data.total_users);
      setTotalPages(Math.ceil(response.data.total_users / pageSize));

      await fetchUserStats();

      addNotification('success', 'Data Loaded', `Successfully loaded ${response.data.data.length} users`);

    } catch (error) {
      console.error("Error fetching users:", error);
      addNotification('error', 'Fetch Failed', error.response?.data?.detail || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user statistics
  const fetchUserStats = async () => {
    try {
      const adminId = localStorage.getItem("adminId");
      
      const totalResponse = await api.get('/admin/users', {
        params: { page: 1, page_size: 1 },
        headers: { user_id: adminId }
      });
      
      const activeResponse = await api.get('/admin/users', {
        params: { status: 'Active', page_size: 1 },
        headers: { user_id: adminId }
      });
      
      const suspendedResponse = await api.get('/admin/users', {
        params: { status: 'Banned', page_size: 1 },
        headers: { user_id: adminId }
      });

      setUserStats({
        total_users: totalResponse.data.total_users || 0,
        active_users: activeResponse.data.total_users || 0,
        suspended_users: suspendedResponse.data.total_users || 0
      });

    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  // Add new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const adminId = localStorage.getItem("adminId");
      const formDataObj = new FormData();
      formDataObj.append('first_name', formData.first_name);
      formDataObj.append('last_name', formData.last_name);
      formDataObj.append('email', formData.email);
      formDataObj.append('role', formData.role);
      formDataObj.append('status', formData.status);
      formDataObj.append('password', formData.password);

      const response = await api.post('/admin/users', formDataObj, {
        headers: { 
          user_id: adminId,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.status === 'success') {
        addNotification('success', 'User Added', `User ${formData.first_name} ${formData.last_name} created successfully with status: ${formData.status}`);
        setIsAddModalOpen(false);
        resetForm();
        fetchUsers();
      }
    } catch (error) {
      console.error("Error adding user:", error);
      addNotification('error', 'Add Failed', error.response?.data?.detail || "Failed to add user");
    }
  };

  // Edit user - UPDATED TO MATCH BACKEND
  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      const adminId = localStorage.getItem("adminId");
      
      const fullName = `${formData.first_name} ${formData.last_name}`.trim();
      
      const updateData = {
        name: fullName,
        status: formData.status
      };
      
      console.log("Sending update data:", updateData);

      const response = await api.put(`/admin/users/${selectedUser.id}`, updateData, {
        headers: { user_id: adminId }
      });

      console.log("Update response:", response.data);

      if (response.data.status === 'success') {
        addNotification('success', 'User Updated', 
          `User ${fullName} updated successfully. Status: ${formData.status}`);
        
        setIsEditModalOpen(false);
        resetForm();
        
        // Update local state immediately
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === selectedUser.id 
              ? { ...user, name: fullName, status: formData.status }
              : user
          )
        );
        
        await fetchUsers();
        await fetchUserStats();
      }
    } catch (error) {
      console.error("Error updating user:", error);
      addNotification('error', 'Update Failed', 
        error.response?.data?.detail || "Failed to update user");
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      const adminId = localStorage.getItem("adminId");
      const user = users.find(u => u.id === userId);
      
      const response = await api.delete(`/admin/users/${userId}`, {
        headers: { user_id: adminId }
      });

      if (response.data.status === 'success') {
        addNotification('warning', 'User Deleted', `User ${user?.name || userId} has been deleted`);
        fetchUsers();
        await fetchUserStats();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      addNotification('error', 'Delete Failed', error.response?.data?.detail || "Failed to delete user");
    }
  };

  // Export users
  const handleExport = async (format = 'csv') => {
    try {
      const adminId = localStorage.getItem("adminId");
      const response = await api.get(`/admin/users/export`, {
        params: {
          format: format,
          role: roleFilter || undefined,
          status: statusFilter || undefined,
          search: searchTerm || undefined
        },
        headers: { user_id: adminId },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users_export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      addNotification('success', 'Export Complete', `Users exported as ${format.toUpperCase()} successfully`);

    } catch (error) {
      console.error("Error exporting users:", error);
      addNotification('error', 'Export Failed', "Failed to export users");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      role: "Creator",
      status: "Active",
      password: ""
    });
  };

  // Open edit modal with user data
  const openEditModal = (user) => {
    setSelectedUser(user);
    const nameParts = user.name.split(' ');
    setFormData({
      first_name: nameParts[0] || "",
      last_name: nameParts.slice(1).join(' ') || "",
      email: user.email,
      role: user.role,
      status: user.status || "Active",
      password: ""
    });
    setIsEditModalOpen(true);
  };

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1);
    fetchUsers();
    addNotification('info', 'Filters Applied', `Filtering by: ${roleFilter || 'All Roles'}, ${statusFilter || 'All Status'}`);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("");
    setStatusFilter("");
    setDateFilter("");
    setCurrentPage(1);
    fetchUsers();
    addNotification('info', 'Filters Cleared', 'All filters have been reset');
  };

  // Filtered users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;

    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // Pagination calculations
  const startIndex = (currentPage - 1) * pageSize;
  const currentItems = filteredUsers.slice(startIndex, startIndex + pageSize);

  // Initial load and when filters/pagination change
  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize, roleFilter, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Theme effect
  useEffect(() => {
    const applyTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      let currentTheme;

      if (savedTheme) {
        currentTheme = savedTheme;
      } else {
        currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light";
      }

      setIsDarkMode(currentTheme === "dark");
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

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'success':
        return <CheckCircle size={18} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={18} className="text-red-500" />;
      case 'warning':
        return <AlertCircle size={18} className="text-yellow-500" />;
      default:
        return <Info size={18} className="text-blue-500" />;
    }
  };

  return (
    <div className={`w-full h-full ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <div className="px-4 md:px-6 pt-0 pb-8 max-w-full mx-auto">
        
        {/* USER MANAGEMENT HEADER WITH NOTIFICATIONS */}
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
            {/* Stats Cards */}
            <div className="flex flex-row gap-2 md:gap-3">
              {[
                { label: "All Users", val: userStats.total_users.toString() },
                { label: "Active", val: userStats.active_users.toString(), dot: true },
                { label: "Suspended", val: userStats.suspended_users.toString() }
              ].map((item, i) => (
                <div
                  key={i}
                  className={`
                    flex-1 lg:flex-none lg:px-6 px-3 py-2 rounded-xl text-center
                    bg-transparent
                    border-[2px] ${isDarkMode ? 'border-white shadow-[0_0_0_1px_rgba(255,255,255,0.9)]' : 'border-black shadow-[0_0_0_1px_rgba(0,0,0,0.9)]'}
                  `}
                >
                  <p className={`text-[9px] sm:text-[10px] md:text-[12px] font-bold flex items-center justify-center gap-1 whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    {item.label}
                    {item.dot && (
                      <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#05CD99] rounded-full shrink-0" />
                    )}
                  </p>
                  <p className={`text-lg sm:text-xl md:text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    {item.val}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="mb-6">
          <div
            className={`
              rounded-xl
              px-4 py-3 flex flex-wrap items-center gap-3
              transition-colors duration-300
              ${isDarkMode ? "bg-black" : ""}
            `}
            style={
              isDarkMode
                ? {}
                : {
                    background:
                      "linear-gradient(90deg, #3D1768 0%, #020202 100%)",
                    backgroundBlendMode: "darken",
                  }
            }
          >
            {/* SEARCH */}
            <div className="bg-white rounded-full px-4 h-[38px] flex items-center flex-1 min-w-[200px] max-w-[300px]">
              <Search size={16} className="mr-2 text-[#3D1768]" />
              <input
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                className="bg-transparent outline-none text-[13px] w-full font-medium text-[#3D1768] placeholder-[#3D1768]/60"
              />
            </div>

            {/* ROLE FILTER */}
            <div className="relative">
              <button 
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="bg-white px-4 h-[38px] rounded-full text-[12px] font-bold flex items-center gap-2 shrink-0 text-[#3D1768]"
              >
                <User size={16} /> {roleFilter || "All Roles"} <ChevronDown size={14} />
              </button>
              {showRoleDropdown && (
                <div className="absolute top-full mt-1 bg-white rounded-lg shadow-lg z-10 min-w-[150px]">
                  {["", "Creator", "Collaborator"].map((role) => (
                    <div
                      key={role || "all"}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-black"
                      onClick={() => {
                        setRoleFilter(role);
                        setShowRoleDropdown(false);
                        applyFilters();
                      }}
                    >
                      {role || "All Roles"}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* STATUS FILTER */}
            <div className="relative">
              <button 
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="bg-white px-4 h-[38px] rounded-full text-[12px] font-bold flex items-center gap-2 shrink-0 text-[#3D1768]"
              >
                <Award size={16} /> {statusFilter || "All Status"} <ChevronDown size={14} />
              </button>
              {showStatusDropdown && (
                <div className="absolute top-full mt-1 bg-white rounded-lg shadow-lg z-10 min-w-[150px]">
                  {["", "Active", "Inactive", "Banned"].map((status) => (
                    <div
                      key={status || "all"}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-black"
                      onClick={() => {
                        setStatusFilter(status);
                        setShowStatusDropdown(false);
                        applyFilters();
                      }}
                    >
                      {status || "All Status"}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DATE FILTER */}
            <div className="relative">
              <button 
                onClick={() => setShowDateDropdown(!showDateDropdown)}
                className="bg-white px-4 h-[38px] rounded-full text-[12px] font-bold flex items-center gap-2 shrink-0 text-[#3D1768]"
              >
                <Calendar size={16} /> {dateFilter || "All Time"} <ChevronDown size={14} />
              </button>
              {showDateDropdown && (
                <div className="absolute top-full mt-1 bg-white rounded-lg shadow-lg z-10 min-w-[150px]">
                  {["", "Today", "This Week", "This Month", "This Year"].map((date) => (
                    <div
                      key={date || "all"}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-black"
                      onClick={() => {
                        setDateFilter(date);
                        setShowDateDropdown(false);
                        applyFilters();
                      }}
                    >
                      {date || "All Time"}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-grow" />

            {/* ACTIONS */}
            <div className="flex gap-2 shrink-0">
              <button 
                onClick={() => handleExport('csv')}
                className="bg-white px-4 h-[38px] rounded-full text-[12px] font-bold flex items-center gap-2 text-[#3D1768] hover:opacity-90 transition"
              >
                <Share size={16} /> Export
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-white px-4 h-[38px] rounded-full text-[12px] font-bold flex items-center gap-2 text-[#3D1768] hover:opacity-90 transition"
              >
                <Plus size={16} /> Add User
              </button>
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className={`mb-4 ${isDarkMode ? 'bg-black' : 'bg-white'} overflow-hidden`}>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3D1768]"></div>
            </div>
          ) : (
            <div className="w-full">
              <table className="w-full table-fixed text-left border-collapse">
                {/* TABLE HEAD */}
                <thead className={`text-[12px] font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  <tr className="shadow-[inset_0_-2px_0_#ffffff]">
                    <th className="px-2 py-3 w-[15%]">Full Name</th>
                    <th className="px-2 py-3 w-[18%]">Email</th>
                    <th className="px-2 py-3 w-[12%]">Username</th>
                    <th className="px-2 py-3 w-[8%]">Status</th>
                    <th className="px-2 py-3 w-[8%]">Role</th>
                    <th className="px-2 py-3 w-[12%]">Joined Date</th>
                    <th className="px-2 py-3 w-[10%]">Last Active</th>
                    <th className="px-2 py-3 text-center w-[7%]">Actions</th>
                  </tr>
                </thead>

                {/* TABLE BODY */}
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((u, i) => (
                      <tr
                        key={u.id || i}
                        className={`
                          text-[11px] lg:text-[13px]
                          shadow-[inset_0_-2px_0_#ffffff]
                          hover:bg-white/5
                          transition-colors
                          ${isDarkMode ? 'text-white' : 'text-black'}
                        `}
                      >
                        {/* Full Name */}
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-2 font-semibold truncate">
                            <img
                              src={u.img || userImages[i % userImages.length]}
                              className={`w-6 h-6 lg:w-7 lg:h-7 rounded-full shrink-0 border-2 object-cover ${isDarkMode ? 'border-white' : 'border-black'}`}
                              alt={u.name}
                            />
                            <span className="truncate">{u.name}</span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-2 py-3 truncate">{u.email}</td>

                        {/* Username */}
                        <td className="px-2 py-3 truncate">{u.user}</td>

                        {/* Status */}
                        <td className="px-2 py-3">
                          <span
                            className={`text-[11px] lg:text-[12px] font-bold
                              ${
                                u.status?.toLowerCase() === 'active'
                                  ? 'text-green-500'
                                  : u.status?.toLowerCase() === 'inactive'
                                  ? 'text-gray-400'
                                  : 'text-red-500'
                              }`}
                          >
                            {u.status}
                          </span>
                        </td>

                        {/* Role */}
                        <td className="px-2 py-3 truncate">{u.role}</td>

                        {/* Joined Date */}
                        <td className="px-2 py-3 truncate">{u.date}</td>

                        {/* Last Active */}
                        <td className={`px-2 py-3 truncate ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>{u.active}</td>

                        {/* Actions */}
                        <td className="px-2 py-3">
                          <div className="flex justify-center gap-2">
                            <Pencil
                              size={15}
                              className="cursor-pointer hover:scale-125 transition-transform"
                              onClick={() => openEditModal(u)}
                            />
                            <Trash2
                              size={15}
                              className="text-red-500 cursor-pointer hover:scale-125 transition-transform"
                              onClick={() => handleDeleteUser(u.id)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-8 text-gray-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PAGINATION SECTION */}
        <div className={`flex flex-col md:flex-row justify-between items-center gap-4 px-2 py-4 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>

          {/* ROWS INFO */}
          <div className={`flex items-center gap-2 order-2 md:order-1 ${isDarkMode ? 'text-white/80' : 'text-black/80'}`}>
            Rows per page
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className={`
                bg-transparent
                px-3 py-1.5
                rounded-full
                font-medium
                border-2 focus:outline-none
                ${isDarkMode ? 'text-white border-white' : 'text-black border-black'}
              `}
            >
              <option className="text-black" value="5">5</option>
              <option className="text-black" value="10">10</option>
              <option className="text-black" value="20">20</option>
              <option className="text-black" value="50">50</option>
            </select>
            of {filteredUsers.length} rows
          </div>

          {/* PAGINATION */}
          <div className="flex items-center gap-2 order-1 md:order-2">

            {/* First page */}
            <button 
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center hover:bg-black/10 disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'border-white text-white hover:bg-white/10' : 'border-black text-black hover:bg-white/10'}`}
            >
              <ChevronsLeft size={16} />
            </button>

            {/* Previous page */}
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center hover:bg-black/10 disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'border-white text-white hover:bg-white/10' : 'border-black text-black hover:bg-white/10'}`}
            >
              <ChevronLeft size={16} />
            </button>

            {/* Page numbers */}
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
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
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    currentPage === pageNum
                      ? isDarkMode ? 'bg-white text-black' : 'bg-[#3D1768] text-white'
                      : isDarkMode ? 'text-white hover:bg-white/10' : 'text-black hover:bg-black/10'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next page */}
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center hover:bg-black/10 disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'border-white text-white hover:bg-white/10' : 'border-black text-black hover:bg-white/10'}`}
            >
              <ChevronRight size={16} />
            </button>

            {/* Last page */}
            <button 
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center hover:bg-black/10 disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'border-white text-white hover:bg-white/10' : 'border-black text-black hover:bg-white/10'}`}
            >
              <ChevronsRight size={16} />
            </button>

          </div>
        </div>

      </div>

      {/* ADD USER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div className="bg-white rounded-[20px] p-6 w-full max-w-[500px] shadow-2xl relative">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <h3 className="text-xl md:text-[22px] font-bold text-[#1B2559]">Add Users</h3>
              <button 
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }} 
                className="text-white rounded-full p-1 hover:opacity-90"
                style={{ background: "linear-gradient(90deg, #3D1768 0%, #020202 100%)" }}
              >
                <X size={18} strokeWidth={3} />
              </button>
            </div>

            <form className="space-y-5" onSubmit={handleAddUser}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] font-semibold text-black">First Name</label>
                  <input 
                    type="text" 
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    required
                    className="w-full bg-[#F4F7FE] border-none rounded-[12px] px-4 py-2.5 text-[14px] text-black outline-none" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] font-semibold text-black">Last Name</label>
                  <input 
                    type="text" 
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className="w-full bg-[#F4F7FE] border-none rounded-[12px] px-4 py-2.5 text-[14px] text-black outline-none" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] font-semibold text-black">Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="w-full bg-[#F4F7FE] border-none rounded-[12px] px-4 py-2.5 text-[14px] text-black outline-none" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] font-semibold text-black">Role</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full bg-[#F4F7FE] border-none rounded-[12px] px-4 py-2.5 text-[14px] text-black outline-none"
                  >
                    <option>Creator</option>
                    <option>Collaborator</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] font-semibold text-black">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-[#F4F7FE] border-none rounded-[12px] px-4 py-2.5 text-[14px] text-black outline-none"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Banned</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[14px] font-semibold text-black">Password</label>
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    className="w-full bg-[#F4F7FE] border-none rounded-[12px] px-4 py-2.5 text-[14px] text-black outline-none" 
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  className="w-full text-white px-6 py-2.5 rounded-[10px] text-[14px] font-bold hover:opacity-90 shadow-lg"
                  style={{ background: "linear-gradient(90deg, #3D1768 0%, #020202 100%)" }}
                >
                  Save Change
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                  }}
                  className="w-full bg-white text-black px-8 py-2.5 rounded-[10px] text-[14px] font-bold border-[3px] border-black hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL - WITH STATUS EDITABLE */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div className="bg-white p-8 w-full max-w-lg rounded-[24px] shadow-2xl relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-black font-sans">Edit User</h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  resetForm();
                }}
                className="text-white rounded-full p-1.5 hover:opacity-90 transition-opacity flex items-center justify-center"
                style={{ background: "linear-gradient(90deg, #3D1768 0%, #020202 100%)" }}
              >
                <X size={18} strokeWidth={3} />
              </button>
            </div>

            <hr className="border-gray-100 mb-8" />

            <form className="space-y-6" onSubmit={handleEditUser}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                {/* FIRST NAME - EDITABLE */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#8E92BC] text-[13px] font-semibold">First Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3D1768] text-black text-sm font-medium bg-white"
                    placeholder="Enter first name"
                  />
                </div>

                {/* LAST NAME - EDITABLE */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#8E92BC] text-[13px] font-semibold">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3D1768] text-black text-sm font-medium bg-white"
                    placeholder="Enter last name"
                  />
                </div>

                {/* STATUS - EDITABLE */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#8E92BC] text-[13px] font-semibold">Status <span className="text-red-500">*</span></label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3D1768] text-black text-sm font-medium bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Banned">Banned</option>
                  </select>
                </div>

                {/* EMAIL - READ ONLY */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#8E92BC] text-[13px] font-semibold">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    readOnly
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 text-sm font-medium cursor-not-allowed"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed</p>
                </div>

                {/* ROLE - READ ONLY */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#8E92BC] text-[13px] font-semibold">Role</label>
                  <input
                    type="text"
                    value={formData.role}
                    disabled
                    readOnly
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 text-sm font-medium cursor-not-allowed"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Role cannot be changed</p>
                </div>
              </div>

              {/* Additional Info - Read Only Display */}
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">User Information (Read Only)</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500">Username:</span>
                    <span className="ml-2 font-medium text-gray-700">{selectedUser?.user}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Joined:</span>
                    <span className="ml-2 font-medium text-gray-700">{selectedUser?.date}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Last Active:</span>
                    <span className="ml-2 font-medium text-gray-700">{selectedUser?.active}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  className="w-full text-white py-3 rounded-xl font-bold hover:opacity-90 shadow-lg transition-all"
                  style={{ background: "linear-gradient(90deg, #3D1768 0%, #020202 100%)" }}
                >
                  Update User
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    resetForm();
                  }}
                  className="w-full bg-white text-black py-3 rounded-xl font-bold border-[3px] border-black ring-[3px] ring-black ring-offset-0 shadow-[0_0_0_2px_#000] hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;