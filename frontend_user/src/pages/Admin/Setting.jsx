import React, { useState, useRef, useEffect } from 'react';
import { BarChart3, User, ChevronRight, ChevronDown } from 'lucide-react';
import api from "../../utils/axiosConfig"; // Import configured axios instance
import user2 from "../../assets/Adminimages/user2.png";

/* ================== CUSTOM DROPDOWN (ADAPTIVE THEME) ================== */
const CustomDropdown = ({ options, defaultSelected, onSelect, theme }) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(defaultSelected || options[0]);
  const ref = useRef(null);

  useEffect(() => {
    if (defaultSelected) setSelected(defaultSelected);
  }, [defaultSelected]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (opt) => {
    setSelected(opt);
    setOpen(false);
    if (onSelect) onSelect(opt);
  };

  const isDark = theme === 'Dark';

  return (
    <div className="relative" ref={ref}>
      <div
        onClick={() => setOpen(!open)}
        className={`
          w-full p-3 pl-4 pr-10 rounded-full cursor-pointer relative flex items-center h-10 outline-none
          ${isDark
            ? 'bg-transparent !border !border-white text-white'
            : 'bg-[#c0a6d3] text-white'
          }
        `}
      >
        <span className="truncate font-outfit">{selected}</span>
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 transition-transform ${open ? 'rotate-180' : ''
            } ${isDark ? 'text-white' : 'text-white'}`}
          size={20}
        />
      </div>

      {open && (
        <div
          className={`
            absolute z-50 w-full mt-2 rounded-md shadow-lg overflow-hidden border-2
            ${isDark
              ? 'bg-black border-gray-700 text-white'
              : 'bg-white border-purple-200 text-black'
            }
          `}
        >
          <div className="max-h-56 overflow-y-auto">
            {options.map((opt, i) => (
              <div
                key={i}
                onClick={() => handleSelect(opt)}
                className={`
                  px-4 py-2 cursor-pointer text-sm transition-colors font-outfit
                  ${isDark
                    ? (selected === opt ? 'bg-gray-800 font-medium' : 'hover:bg-gray-900')
                    : (selected === opt ? 'bg-purple-100 font-medium' : 'hover:bg-purple-50')
                  }
                `}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Setting = () => {
  // Get admin ID from localStorage/session (set during login)
  const [adminId, setAdminId] = useState(() => {
    // Try different possible keys where admin ID might be stored
    return localStorage.getItem('admin_id') ||
      localStorage.getItem('adminId') ||
      '1'; // Default to 1 for testing
  });

  /* ================== API INTEGRATION ================== */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  /* ================== GLOBAL DARK MODE CONTROLLER ================== */
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") return "Dark";
    if (savedTheme === "light") return "Light";
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? "Dark"
      : "Light";
  });

  const isDark = theme === 'Dark';

  useEffect(() => {
    const darkMode = theme === "Dark";
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    window.dispatchEvent(new Event("theme-change"));
  }, [theme]);

  // --- State ---
  const [activeSetting, setActiveSetting] = useState(() => {
    // Remember last active tab from localStorage
    return localStorage.getItem('activeSetting') || 'dashboard';
  });

  // Save active setting to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('activeSetting', activeSetting);
  }, [activeSetting]);

  // --- Static Data ---
  const themes = ["Dark", "Light"];
  const timeZones = [
    "UTC (Coordinated Universal Time)",
    "EST (Eastern Standard Time)",
    "PST (Pacific Standard Time)",
    "IST (Indian Standard Time)"
  ];
  const dateFormats = [
    "ISO Format (YYYY-MM-DD)",
    "DD/MM/YYYY",
    "MM/DD/YYYY",
    "DD-MMM-YYYY"
  ];
  const dashboards = [
    "Overview Dashboard",
    "Analytics Dashboard",
    "Financial Dashboard"
  ];

  // --- Profile State ---
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    twoFactor: false,
    profileImage: null
  });
  const [emailError, setEmailError] = useState("");

  // --- Password State ---
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // --- Preferences State ---
  const [preferences, setPreferences] = useState({
    theme: "Light",
    time_zone: "UTC (Coordinated Universal Time)",
    date_format: "ISO Format (YYYY-MM-DD)",
    default_dashboard: "Overview Dashboard"
  });

  // --- API Headers ---
  const getHeaders = () => ({
    'user_id': adminId
    // Content-Type is automatically handled by axiosConfig
  });

  // --- Load Profile Data ---
  useEffect(() => {
    loadProfile();
    loadPreferences();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/profile', {
        headers: getHeaders()
      });

      setProfile({
        firstName: response.data.first_name || "",
        lastName: response.data.last_name || "",
        email: response.data.email || "",
        role: response.data.role || "Admin",
        twoFactor: response.data.two_factor_enabled || false,
        profileImage: response.data.profile_image || null
      });
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      const response = await api.get('/admin/preferences', {
        headers: getHeaders()
      });
      setPreferences(response.data);
      // Update theme if preference loaded
      if (response.data.theme) {
        setTheme(response.data.theme);
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
    }
  };

  // --- Profile Handlers ---
  const handleEmailChange = (e) => {
    const val = e.target.value;
    setProfile({ ...profile, email: val });
    setEmailError("");
  };

  const handleSaveProfile = async () => {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profile.email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      const response = await api.put('/admin/profile', {
        first_name: profile.firstName,
        last_name: profile.lastName,
        email: profile.email,
        role: profile.role
      }, {
        headers: getHeaders()
      });

      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Update local storage if email changed
      if (response.data.user?.email) {
        localStorage.setItem('admin_email', response.data.user.email);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to save profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Password Change Handler ---
  const handleChangePassword = async () => {
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setPasswordError('');
    setError(null);

    try {
      await api.post('/admin/profile/change-password', {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      }, {
        headers: getHeaders()
      });

      setSuccessMessage('Password changed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Error changing password:', err);
      if (err.response?.data?.detail) {
        setPasswordError(err.response.data.detail);
      } else {
        setPasswordError('Failed to change password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- 2FA Toggle Handler ---
  const handleToggle2FA = async () => {
    setLoading(true);
    try {
      const newState = !profile.twoFactor;
      await api.post(`/admin/profile/toggle-2fa?enabled=${newState}`, {}, {
        headers: getHeaders()
      });

      setProfile({ ...profile, twoFactor: newState });
      setSuccessMessage(`2FA ${newState ? 'enabled' : 'disabled'} successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error toggling 2FA:', err);
      setError('Failed to toggle 2FA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- File Upload Handler ---
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/admin/profile/upload-image', formData, {
        headers: {
          'user_id': adminId,
          'Content-Type': 'multipart/form-data'
        }
      });

      // UPDATE THE PROFILE STATE WITH NEW IMAGE URL
      setProfile({
        ...profile,
        profileImage: response.data.image_url
      });

      if (window.parent && window.parent.refreshProfileImage) {
        window.parent.refreshProfileImage();
      }

      setSuccessMessage('Profile image uploaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePicture = async () => {
    setLoading(true);
    try {
      await api.delete('/admin/profile/remove-image', {
        headers: getHeaders()
      });

      // CLEAR THE PROFILE IMAGE FROM STATE
      setProfile({
        ...profile,
        profileImage: null
      });
      if (window.parent && window.parent.refreshProfileImage) {
        window.parent.refreshProfileImage();
      }

      setSuccessMessage('Profile image removed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error removing image:', err);
      setError('Failed to remove image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- Preferences Handlers ---
  const handleThemeChange = async (selectedTheme) => {
    setTheme(selectedTheme);

    const newPreferences = { ...preferences, theme: selectedTheme };
    setPreferences(newPreferences);

    try {
      await api.put('/admin/preferences', newPreferences, {
        headers: getHeaders()
      });
    } catch (err) {
      console.error('Error saving theme preference:', err);
    }
  };

  const handleTimeZoneChange = async (selected) => {
    const newPreferences = { ...preferences, time_zone: selected };
    setPreferences(newPreferences);

    try {
      await api.put('/admin/preferences', newPreferences, {
        headers: getHeaders()
      });
    } catch (err) {
      console.error('Error saving timezone preference:', err);
    }
  };

  const handleDateFormatChange = async (selected) => {
    const newPreferences = { ...preferences, date_format: selected };
    setPreferences(newPreferences);

    try {
      await api.put('/admin/preferences', newPreferences, {
        headers: getHeaders()
      });
    } catch (err) {
      console.error('Error saving date format preference:', err);
    }
  };

  const handleDashboardChange = async (selected) => {
    const newPreferences = { ...preferences, default_dashboard: selected };
    setPreferences(newPreferences);

    try {
      await api.put('/admin/preferences', newPreferences, {
        headers: getHeaders()
      });
    } catch (err) {
      console.error('Error saving dashboard preference:', err);
    }
  };

  // --- Account Actions ---
  const handleExportData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users/export', {
        params: { format: 'csv' },
        headers: getHeaders(),
        responseType: 'blob' // Important for file download
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSuccessMessage('Export downloaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error exporting data:', err);
      setError('Failed to export data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users/export', {
        params: { format: 'excel' },
        headers: getHeaders(),
        responseType: 'blob' // Important for file download
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSuccessMessage('Report downloaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error downloading report:', err);
      setError('Failed to download report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      // Add your delete account API call here
      // await api.delete('/admin/profile', { headers: getHeaders() });

      // Clear local storage and redirect to login
      localStorage.clear();
      window.location.href = '/login';
    } catch (err) {
      console.error('Error deleting account:', err);
      setError('Failed to delete account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`
        flex gap-8 font-outfit p-4 items-start min-h-screen mt-[-20px] mb-[30px] transition-colors duration-300
        ${isDark ? 'bg-black' : 'bg-white'}
      `}
    >
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700 mx-auto"></div>
            <p className="mt-2 text-purple-700">Loading...</p>
          </div>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <span>{error}</span>
          <button className="ml-2 font-bold" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
          <span>{successMessage}</span>
          <button className="ml-2 font-bold" onClick={() => setSuccessMessage('')}>×</button>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg max-w-md w-full ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="text-xl font-bold mb-4">Change Password</h3>

            {passwordError && (
              <div className="mb-4 text-red-600 text-sm">{passwordError}</div>
            )}

            <div className="mb-4">
              <label className="block mb-2">Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className={`w-full p-2 rounded border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className={`w-full p-2 rounded border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
            </div>

            <div className="mb-6">
              <label className="block mb-2">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className={`w-full p-2 rounded border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                disabled={loading}
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEFT COLUMN: MENU */}
      <main
        className={`
          w-[400px] h-[780px] p-2 rounded-2xl shadow-sm shrink-0 transition-colors duration-300
          ${isDark ? 'bg-black border-none' : 'bg-white'}
        `}
      >
        <h2
          className={`font-outfit mb-10 mt-2 ${isDark ? 'text-white' : 'text-black'}`}
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 400,
            fontSize: '24px',
            lineHeight: '100%',
            letterSpacing: '0%'
          }}
        >
          Settings Menu
        </h2>

        <div className="flex flex-col gap-8">
          {/* Dashboard Menu Item */}
          <div
            onClick={() => setActiveSetting('dashboard')}
            className={`
              flex items-center justify-between
              w-full p-5 rounded-xl cursor-pointer transition-all border
              ${activeSetting === 'dashboard'
                ? (isDark
                  ? 'bg-transparent text-white !border-white !border-[1px]'
                  : 'bg-[#3b0764] text-white shadow-md border-transparent'
                )
                : (isDark
                  ? 'bg-transparent text-white border-transparent hover:bg-gray-900'
                  : 'bg-white text-black hover:bg-gray-50 border-transparent'
                )
              }
            `}
          >
            <div className="flex items-center gap-4">
              <BarChart3 size={24} strokeWidth={1.5} />
              <div className="flex flex-col">
                <span style={{ fontWeight: 400, fontSize: '20px', lineHeight: '100%', fontFamily: 'Outfit, sans-serif' }}>
                  Dashboard & Visualization
                </span>
                <span className={`text-[14px] font-outfit font-light mt-2 ${activeSetting === 'dashboard' ? 'opacity-80' : (isDark ? 'text-gray-400' : 'text-black')}`}>
                  Preferences
                </span>
              </div>
            </div>
            <ChevronRight size={20} />
          </div>

          {/* Profile Menu Item */}
          <div
            onClick={() => setActiveSetting('profile')}
            className={`
              flex items-center justify-between
              w-full p-5 rounded-xl cursor-pointer transition-all border
              ${activeSetting === 'profile'
                ? (isDark
                  ? 'bg-transparent text-white !border-white !border-[1px]'
                  : 'bg-[#3b0764] text-white shadow-md border-transparent'
                )
                : (isDark
                  ? 'bg-transparent text-white border-transparent hover:bg-gray-900'
                  : 'bg-white text-black hover:bg-gray-50 border-transparent'
                )
              }
            `}
          >
            <div className="flex items-center gap-4">
              <User size={24} strokeWidth={1.5} />
              <div className="flex flex-col">
                <span style={{ fontWeight: 400, fontSize: '20px', lineHeight: '100%', fontFamily: 'Outfit, sans-serif' }}>
                  User Profile & Account
                </span>
                <span className={`text-[14px] font-outfit font-light mt-2 ${activeSetting === 'profile' ? 'opacity-80' : (isDark ? 'text-gray-400' : 'text-black')}`}>
                  Account settings and profile
                </span>
              </div>
            </div>
            <ChevronRight size={20} />
          </div>
        </div>
      </main>

      {/* RIGHT COLUMN: CONTENT */}
      <aside
        className={`
          w-[620px] min-h-[740px] rounded-2xl shadow-sm p-3 transition-colors duration-300
          ${isDark ? 'bg-black text-white' : 'bg-white text-black'}
        `}
      >
        {activeSetting === 'dashboard' && (
          <div>
            <h2
              className={`flex items-center gap-3 mb-8 mt-2 ${isDark ? 'text-white' : 'text-black'}`}
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 400,
                fontSize: '27px',
                lineHeight: '100%',
                letterSpacing: '0%',
              }}
            >
              <BarChart3 size={28} strokeWidth={1.5} className={isDark ? "text-white" : "text-black"} />
              Dashboard & Visualization
            </h2>
            <div className="flex flex-col gap-6">

              {/* Theme Card */}
              <div className={`
                  p-6 rounded-2xl !border-2 transition-colors
                  ${isDark
                  ? 'bg-black border-white text-white'
                  : 'bg-white border-[#c0a6d3] text-black'
                }
              `}>
                <h3 className="text-2xl font-outfit font-medium mb-2">Theme</h3>
                <p className={`text-base font-outfit mb-6 ${isDark ? 'text-gray-300' : 'text-black'}`}>
                  Choose your preferred color scheme
                </p>
                <CustomDropdown
                  options={themes}
                  defaultSelected={preferences.theme || theme}
                  onSelect={handleThemeChange}
                  theme={theme}
                />
              </div>

              {/* Time & Date Card */}
              <div className={`
                  p-6 rounded-2xl !border-2 transition-colors
                  ${isDark
                  ? 'bg-black border-white text-white'
                  : 'bg-white border-[#c0a6d3] text-black'
                }
              `}>
                <h3 className="text-2xl font-outfit font-medium mb-2">Time Zone & Date Format</h3>
                <p className={`text-base font-outfit mb-6 ${isDark ? 'text-gray-300' : 'text-black'}`}>
                  Configure time and date display preferences
                </p>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-lg font-outfit font-medium block mb-2">Time Zone</label>
                    <CustomDropdown
                      options={timeZones}
                      defaultSelected={preferences.time_zone}
                      onSelect={handleTimeZoneChange}
                      theme={theme}
                    />
                  </div>
                  <div>
                    <label className="text-lg font-outfit font-medium block mb-2">Date Format</label>
                    <CustomDropdown
                      options={dateFormats}
                      defaultSelected={preferences.date_format}
                      onSelect={handleDateFormatChange}
                      theme={theme}
                    />
                  </div>
                </div>
              </div>

              {/* Default Dashboard Card */}
              <div className={`
                  p-6 rounded-2xl !border-2 transition-colors
                  ${isDark
                  ? 'bg-black border-white text-white'
                  : 'bg-white border-[#c0a6d3] text-black'
                }
              `}>
                <h3 className="text-2xl font-outfit font-medium mb-2">Default Dashboard</h3>
                <p className={`text-base font-outfit mb-6 ${isDark ? 'text-gray-300' : 'text-black'}`}>
                  Choose which analytics screen loads first
                </p>
                <CustomDropdown
                  options={dashboards}
                  defaultSelected={preferences.default_dashboard}
                  onSelect={handleDashboardChange}
                  theme={theme}
                />
              </div>
            </div>
          </div>
        )}

        {activeSetting === 'profile' && (
          <div>
            <h2 className={`flex items-center gap-3 mb-8 mt-2 ${isDark ? 'text-white' : 'text-black'}`} style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400, fontSize: '27px', lineHeight: '100%' }}>
              <User size={28} strokeWidth={1.5} className={isDark ? "text-white" : "text-black"} />
              User Profile & Account
            </h2>

            <div className="flex flex-col gap-6">

              {/* Profile Details Card */}
              <div className={`
                p-4 rounded-sm shadow-sm !border transition-colors
                ${isDark
                  ? 'bg-black !border-white text-white'
                  : 'bg-white border-gray-500 text-black'
                }
              `}>
                <h3 className="text-xl font-outfit font-normal mb-1">Profile Details</h3>
                <p className={`text-sm font-outfit mb-6 font-light ${isDark ? 'text-gray-300' : 'text-black'}`}>Update your personal information and profile picture</p>

                <div className="flex flex-col items-center gap-4 mb-6">
                  <img
                    src={profile.profileImage || user2}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      e.target.src = user2;
                    }}
                  />
                  <div className="flex items-center gap-4">
                    <label className={`
                      px-4 py-1 rounded text-sm font-outfit font-normal cursor-pointer transition-colors border
                      ${isDark
                        ? 'bg-transparent !border !border-white text-white hover:bg-gray-800'
                        : 'bg-[#b794f4] border-transparent text-white hover:bg-[#a782e5]'
                      }
                    `}>
                      Change Picture
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept="image/*"
                        disabled={loading}
                      />
                    </label>
                    <button
                      onClick={handleRemovePicture}
                      className={`text-sm font-outfit cursor-pointer font-normal ${isDark ? 'text-white hover:text-gray-300' : 'text-black hover:text-black'}`}
                      disabled={loading}
                    >
                      Remove Picture
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={`font-outfit font-medium mb-1.5 block ${isDark ? 'text-white' : 'text-black'}`}>First Name</label>
                    <input
                      type="text"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      className={`w-full p-2 rounded-full outline-none border
                        ${isDark
                          ? 'bg-transparent !border !border-white text-white placeholder-gray-400'
                          : 'bg-[#9871c5] border-transparent text-white'
                        }
                      `}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className={`font-outfit font-medium mb-1.5 block ${isDark ? 'text-white' : 'text-black'}`}>Last Name</label>
                    <input
                      type="text"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      className={`w-full p-2 rounded-full outline-none border
                        ${isDark
                          ? 'bg-transparent !border !border-white text-white placeholder-gray-400'
                          : 'bg-[#9871c5] border-transparent text-white'
                        }
                      `}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className={`font-outfit font-medium mb-1.5 block ${isDark ? 'text-white' : 'text-black'}`}>Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={handleEmailChange}
                    className={`w-full p-2 rounded-full outline-none border
                      ${isDark
                        ? 'bg-transparent !border !border-white text-white placeholder-gray-400'
                        : 'bg-[#9871c5] border-transparent text-white'
                      }
                    `}
                    disabled={loading}
                  />
                  {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                </div>

                <div className="mb-6">
                  <label className={`font-outfit font-medium mb-1.5 block ${isDark ? 'text-white' : 'text-black'}`}>Role</label>
                  <input
                    type="text"
                    value={profile.role}
                    readOnly
                    className={`w-full p-2 rounded-full outline-none border
                      ${isDark
                        ? 'bg-transparent !border !border-white text-white'
                        : 'bg-[#9871c5] border-transparent text-white'
                      }
                    `}
                  />
                </div>

                <button
                  onClick={handleSaveProfile}
                  className={`
                    px-4 py-1 rounded transition-colors text-sm font-outfit font-normal cursor-pointer border
                    ${isDark
                      ? 'bg-transparent !border !border-white text-white hover:bg-gray-800'
                      : 'bg-[#b794f4] border-transparent text-white hover:bg-[#a782e5]'
                    }
                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  disabled={loading}
                >
                  Save Changes
                </button>
              </div>

              {/* Password & Security Card */}
              <div className={`
                p-4 rounded-sm shadow-sm !border transition-colors
                ${isDark
                  ? 'bg-black !border !border-white text-white'
                  : 'bg-white border-gray-500 text-black'
                }
              `}>
                <h3 className="text-xl font-outfit font-normal mb-1">Password & Security</h3>
                <p className={`text-sm font-outfit mb-6 font-light ${isDark ? 'text-gray-300' : 'text-black'}`}>Manage your password and enable two-factor authentication</p>

                <button
                  onClick={() => setShowPasswordModal(true)}
                  className={`
                    w-full py-2 cursor-pointer rounded-full mb-6 text-sm font-outfit font-normal transition-colors border
                    ${isDark
                      ? 'bg-transparent !border !border-white text-white hover:bg-gray-800'
                      : 'bg-[#9871c5] border-transparent text-white hover:bg-[#8861b5]'
                    }
                  `}
                  disabled={loading}
                >
                  Change Password
                </button>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-outfit text-base font-normal">Two-Factor Authentication</h4>
                    <p className={`text-sm font-sm font-outfit mt-1 ${isDark ? 'text-gray-300' : 'text-black'}`}>Add an extra layer of security to your account</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium font-outfit ${isDark ? 'text-white' : 'text-black'}`}>
                      {profile.twoFactor ? 'Enabled' : 'Disabled'}
                    </span>
                    <div
                      onClick={handleToggle2FA}
                      className={`
                        w-10 h-5 rounded-full relative cursor-pointer transition-colors border border-gray-300
                        ${isDark
                          ? (profile.twoFactor ? 'bg-white' : 'bg-transparent')
                          : (profile.twoFactor ? 'bg-[#3b0764]' : 'bg-gray-200')
                        }
                        ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <div className={`
                        w-4 h-4 rounded-full absolute top-0.5 transition-all
                        ${isDark
                          ? (profile.twoFactor ? 'bg-black left-5' : 'bg-white left-0.5')
                          : (profile.twoFactor ? 'bg-white left-5' : 'bg-white left-0.5')
                        }
                      `}></div>
                    </div>
                  </div>
                </div>

                <button
                  className={`
                    px-5 py-1 cursor-pointer rounded text-sm font-normal transition-colors border
                    ${isDark
                      ? 'bg-transparent !border !border-white text-white hover:bg-gray-800'
                      : 'bg-[#b794f4] border-transparent text-white hover:bg-[#a782e5]'
                    }
                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  disabled={loading}
                >
                  Manage Settings
                </button>
              </div>

              {/* Account Actions Card */}
              <div className={`
                p-4 rounded-sm shadow-sm !border transition-colors
                ${isDark
                  ? 'bg-black !border-white text-white'
                  : 'bg-white !border-gray-500 text-black'
                }
              `}>
                <h3 className="text-xl font-outfit font-normal mb-1">Account Actions</h3>
                <p className={`text-sm font-outfit mb-6 font-sm ${isDark ? 'text-gray-300' : 'text-black'}`}>Manage your account settings and preferences</p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleExportData}
                    className={`
                      w-full py-2 cursor-pointer rounded-full text-sm font-outfit font-normal transition-colors border
                      ${isDark
                        ? 'bg-transparent !border !border-white text-white hover:bg-gray-800'
                        : 'bg-[#9871c5] border-transparent text-white hover:bg-[#8861b5]'
                      }
                    `}
                  >
                    Export Account Data
                  </button>
                  <button
                    onClick={handleDownloadReport}
                    className={`
                      w-full py-2 cursor-pointer rounded-full text-sm font-outfit font-normal transition-colors border
                      ${isDark
                        ? 'bg-transparent !border !border-white text-white hover:bg-gray-800'
                        : 'bg-[#9871c5] border-transparent text-white hover:bg-[#8861b5]'
                      }
                    `}
                  >
                    Download Account Report
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="w-full cursor-pointer bg-red-600 text-white py-2 rounded-full text-sm font-outfit font-normal hover:bg-red-700 transition-colors"
                    disabled={loading}
                  >
                    Delete Account
                  </button>
                </div>
                <p className={`text-[10px] mt-3 text-left ${isDark ? 'text-gray-400' : 'text-black'}`}>This action cannot be undone. All your data will be permanently deleted.</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default Setting;