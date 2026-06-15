import React, { useState, useRef, useEffect } from 'react';
import { BarChart3, User, ChevronRight, ChevronDown, X, RefreshCw } from 'lucide-react';
import api from "../../utils/axiosConfig";
import toast from "../../component/Toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const version = import.meta.env.VITE_APP_VERSION;

const validateNameField = (value) => {
  const regex = /^[A-Za-z\s]*$/;
  return regex.test(value);
};

/* ================== CUSTOM DROPDOWN ================== */
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
          w-full p-3 pl-4 pr-10 rounded-full cursor-pointer relative flex items-center h-10 outline-none transition-all duration-200
          ${isDark
            ? 'bg-gray-800 !border !border-gray-600 text-white hover:bg-gray-700'
            : 'bg-purple-700 text-white hover:bg-purple-800'
          }
        `}
      >
        <span className="truncate font-outfit">{selected}</span>
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 transition-transform duration-200 ${open ? 'rotate-180' : ''} text-white`}
          size={20}
        />
      </div>

      {open && (
        <div
          className={`
            absolute z-50 w-full mt-2 rounded-md shadow-lg overflow-hidden border
            ${isDark
              ? 'bg-gray-800 border-gray-700 text-white'
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
                    ? (selected === opt ? 'bg-gray-700 font-medium' : 'hover:bg-gray-700')
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
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") return "Dark";
    if (savedTheme === "light") return "Light";
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? "Dark" : "Light";
  });

  const isDark = theme === 'Dark';

  useEffect(() => {
    const handleThemeChange = () => {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark") {
        setTheme("Dark");
      } else if (savedTheme === "light") {
        setTheme("Light");
      }
    };

    // Listen for custom theme-change event
    window.addEventListener('theme-change', handleThemeChange);

    // Also listen for storage events (in case theme changes in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'theme') {
        if (e.newValue === 'dark') {
          setTheme("Dark");
        } else if (e.newValue === 'light') {
          setTheme("Light");
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('theme-change', handleThemeChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  useEffect(() => {
    const darkMode = theme === "Dark";
    const htmlElement = document.documentElement;
    const bodyElement = document.body;

    if (darkMode) {
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

    localStorage.setItem("theme", darkMode ? "dark" : "light");
    window.dispatchEvent(new Event("theme-change"));
  }, [theme]);

  const [activeSetting, setActiveSetting] = useState(() => {
    const savedSetting = localStorage.getItem('activeSetting');
    return savedSetting === 'dashboard' || savedSetting === 'profile' ? savedSetting : 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('activeSetting', activeSetting);
    window.scrollTo({ top: 0, behavior: 'instant' });
    const main = document.querySelector('main');
    if (main) main.scrollTo({ top: 0, behavior: 'instant' });
    const scrollables = document.querySelectorAll('.overflow-y-auto, .overflow-y-scroll');
    scrollables.forEach(el => el.scrollTo({ top: 0, behavior: 'instant' }));
  }, [activeSetting]);

  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);
  const weatherFetched = useRef(false);

  const themes = ["Dark", "Light"];

  // =============================================
  // profile.profileImage = saved backend URL
  // selectedImage        = raw File object
  // previewImage         = local blob URL
  // imgTimestamp         = cache-buster after upload
  // =============================================
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    twoFactor: false,
    profileImage: null
  });
  const [showingNoPictureToast, setShowingNoPictureToast] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [imgTimestamp, setImgTimestamp] = useState(Date.now()); // cache-buster
  const [imgError, setImgError] = useState(false);              // track load failure

  const [emailError, setEmailError] = useState("");
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [nameErrors, setNameErrors] = useState({ firstName: false, lastName: false });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [preferences, setPreferences] = useState({ theme: "Light" });

  useEffect(() => {
    loadProfile();
    loadPreferences();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/profile`);
      setProfile({
        firstName: response.data.first_name || "",
        lastName: response.data.last_name || "",
        email: response.data.email || "",
        role: response.data.role || "Admin",
        twoFactor: response.data.two_factor_enabled || false,
        profileImage: response.data.profile_image || null
      });
      setImgError(false);
      setImgTimestamp(Date.now());
    } catch (err) {
      console.error('Error loading profile:', err);
      if (err.response?.status === 401) {
        toast.error("Session Expired", "Please login again.");
        setTimeout(() => { window.location.href = '/'; }, 2000);
      } else {
        toast.error("Error", "Failed to load profile. Please refresh the page.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      const response = await api.get(`/admin/preferences`);
      setPreferences(response.data);
      // IMPORTANT: Do NOT update theme from preferences at all
      // The theme should only be controlled by localStorage and user actions
      // Remove any code that sets theme from response.data.theme
    } catch (err) {
      console.error('Error loading preferences:', err);
    }
  };

  /* ================== WEATHER ================== */
  const getWeatherIcon = (description) => {
    const weatherMap = {
      'clear sky': '☀️', 'sunny': '☀️', 'mainly clear': '🌤️',
      'partly cloudy': '⛅', 'overcast': '☁️', 'cloudy': '☁️',
      'foggy': '🌫️', 'fog': '🌫️', 'light drizzle': '🌧️',
      'moderate drizzle': '🌧️', 'dense drizzle': '🌧️',
      'slight rain': '🌧️', 'moderate rain': '🌧️', 'heavy rain': '🌧️',
      'rain': '🌧️', 'slight snow fall': '❄️', 'moderate snow fall': '❄️',
      'heavy snow fall': '❄️', 'snow': '❄️', 'thunderstorm': '⛈️', 'thunder': '⛈️'
    };
    const desc = description.toLowerCase();
    for (const [key, icon] of Object.entries(weatherMap)) {
      if (desc.includes(key)) return icon;
    }
    return '🌡️';
  };

  const getWeatherData = async () => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      if (!navigator.geolocation) {
        setWeatherError("Geolocation is not supported by your browser.");
        setWeatherLoading(false);
        return;
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 300000
        });
      });

      const { latitude, longitude } = position.coords;

      // Updated API URL without allorigins (direct call)
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=temperature_2m,relative_humidity_2m&timezone=auto`;

      const response = await fetch(weatherUrl);
      if (!response.ok) throw new Error(`Weather API returned ${response.status}`);

      const data = await response.json();

      // Check if data and current property exists
      if (!data || !data.current) {
        throw new Error("Invalid weather data received");
      }

      const weatherCodes = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Foggy",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        56: "Freezing drizzle",
        57: "Freezing drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        66: "Freezing rain",
        67: "Freezing rain",
        71: "Slight snow fall",
        73: "Moderate snow fall",
        75: "Heavy snow fall",
        77: "Snow grains",
        80: "Slight rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        85: "Slight snow showers",
        86: "Heavy snow showers",
        95: "Thunderstorm",
        96: "Thunderstorm with hail",
        99: "Thunderstorm with hail"
      };

      const weatherCode = data.current.weather_code;
      const description = weatherCodes[weatherCode] || "Unknown";

      let locationName = "";
      try {
        const geoResponse = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        const geoData = await geoResponse.json();
        locationName = geoData.city || geoData.locality || geoData.principalSubdivision || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
      } catch {
        locationName = `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
      }

      setWeatherData({
        location: locationName,
        temp: Math.round(data.current.temperature_2m),
        feels_like: Math.round(data.current.temperature_2m),
        temp_min: Math.round(data.current.temperature_2m),
        temp_max: Math.round(data.current.temperature_2m),
        humidity: data.current.relative_humidity_2m || "N/A",
        pressure: "N/A",
        wind_speed: Math.round(data.current.wind_speed_10m || 0),
        description,
        icon: weatherCode === 0 ? "01d" : weatherCode <= 3 ? "03d" : "09d",
        latitude,
        longitude
      });

    } catch (err) {
      console.error("Weather error:", err);
      if (err.code === 1) setWeatherError("location_denied");
      else if (err.code === 2) setWeatherError("location_unavailable");
      else if (err.code === 3) setWeatherError("location_timeout");
      else if (err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")) setWeatherError("network_error");
      else setWeatherError("unknown_error");
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    if (!weatherFetched.current) {
      weatherFetched.current = true;
      getWeatherData();
    }
  }, []);

  /* ================== PROFILE HANDLERS ================== */
  const handleEmailChange = (e) => {
    setProfile({ ...profile, email: e.target.value });
    setEmailError("");
  };

  const handleFirstNameChange = (e) => {
    const value = e.target.value;
    const filteredValue = value.replace(/[^A-Za-z\s]/g, '');
    setProfile({ ...profile, firstName: filteredValue });
    if (value !== filteredValue && filteredValue.length > 0) {
      setNameErrors({ ...nameErrors, firstName: true });
      toast.error("Validation Error", "First name should only contain letters and spaces");
    } else {
      setNameErrors({ ...nameErrors, firstName: false });
    }
  };

  const handleLastNameChange = (e) => {
    const value = e.target.value;
    const filteredValue = value.replace(/[^A-Za-z\s]/g, '');
    setProfile({ ...profile, lastName: filteredValue });
    if (value !== filteredValue && filteredValue.length > 0) {
      setNameErrors({ ...nameErrors, lastName: true });
      toast.error("Validation Error", "Last name should only contain letters and spaces");
    } else {
      setNameErrors({ ...nameErrors, lastName: false });
    }
  };

  // =============================================
  // FIX: handleSaveProfile — single upload block,
  // proper state update after upload
  // =============================================
  const handleSaveProfile = async () => {
    if (!profile.firstName || !profile.lastName || !profile.email || !profile.role) {
      setShowValidationErrors(true);
      toast.error("Validation Error", "Please fill in all required fields");
      return;
    }

    if (!validateNameField(profile.firstName)) {
      setNameErrors({ ...nameErrors, firstName: true });
      setShowValidationErrors(true);
      toast.error("Validation Error", "First name should only contain letters and spaces");
      return;
    }

    if (!validateNameField(profile.lastName)) {
      setNameErrors({ ...nameErrors, lastName: true });
      setShowValidationErrors(true);
      toast.error("Validation Error", "Last name should only contain letters and spaces");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profile.email)) {
      setEmailError("Please enter a valid email address");
      setShowValidationErrors(true);
      return;
    }

    setLoading(true);
    setLoadingMessage('Saving profile...');

    try {
      // Step 1: Save profile text fields
      await api.put(`/admin/profile`, {
        first_name: profile.firstName,
        last_name: profile.lastName,
        email: profile.email,
        role: profile.role
      });

      // Step 2: Upload image ONCE if a new one was selected
      if (selectedImage) {
        setLoadingMessage('Uploading profile picture...');

        const formData = new FormData();
        formData.append('file', selectedImage);

        const imageResponse = await api.post(
          `/admin/profile/upload-image`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        // Update profile.profileImage with the backend-returned URL
        setProfile(prev => ({
          ...prev,
          profileImage: imageResponse.data.image_url
        }));

        // Bust cache so browser fetches the new image even if URL is similar
        setImgTimestamp(Date.now());
        setImgError(false);

        // Clear temporary preview states
        setSelectedImage(null);
        setPreviewImage(null);

        // Notify other parts of the app (e.g. navbar) to refresh
        window.dispatchEvent(new Event("profile-image-updated"));
      }

      toast.success("Success", "Profile updated successfully!");
      setShowValidationErrors(false);
      setNameErrors({ firstName: false, lastName: false });
      setTimeout(() => {
        window.location.reload();
      }, 300);

    } catch (err) {
      console.error('Error saving profile:', err);
      if (err.response?.data?.detail) {
        toast.error("Error", err.response.data.detail);
      } else {
        toast.error("Error", "Failed to save profile. Please try again.");
      }
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword === passwordData.currentPassword) {
      setPasswordError("New password cannot be the same as your current password");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    if (!passwordData.currentPassword) {
      setPasswordError("Current password is required");
      return;
    }
    if (!passwordData.newPassword) {
      setPasswordError("New password is required");
      return;
    }

    setLoading(true);
    setLoadingMessage('Changing password...');
    setPasswordError('');

    try {
      await api.post(`/admin/profile/change-password`, {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      });
      toast.success("Success", "Password changed successfully!");
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Error changing password:', err);
      if (err.response?.data?.detail) {
        setPasswordError(err.response.data.detail);
      } else {
        toast.error("Error", "Failed to change password. Please try again.");
      }
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  // =============================================
  // FIX: handleFileChange — only set local state,
  // do NOT upload here. Upload happens on Save.
  // =============================================
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Invalid File", "Please upload an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File Too Large", "File size must be less than 2MB");
      return;
    }

    // Store raw file for upload on Save
    setSelectedImage(file);

    // Create a local blob URL just for preview
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);

    toast.success("Image Selected", "Click Save Changes to upload your new profile picture");
  };

  // =============================================
  // FIX: handleRemovePicture — if preview exists,
  // just clear local state. Otherwise call API.
  // =============================================
  const handleRemovePicture = async () => {
    if (previewImage || selectedImage) {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }

      setPreviewImage(null);
      setSelectedImage(null);

      toast.success(
        "Removed",
        "Selected image removed. Your current profile picture is unchanged."
      );

      return;
    }

    // NEW VALIDATION
    if (!profile.profileImage) {

      if (showingNoPictureToast) return;

      setShowingNoPictureToast(true);

      toast.error(
        "No Profile Picture",
        "No profile picture to remove."
      );

      setTimeout(() => {
        setShowingNoPictureToast(false);
      }, 3000);

      return;
    }

    setLoading(true);
    setLoadingMessage("Removing image...");

    try {
      await api.delete(`/admin/profile/remove-image`);
      setProfile(prev => ({
        ...prev,
        profileImage: null,
      }));

      setPreviewImage(null);
      setSelectedImage(null);
      toast.success(
        "Success",
        "Profile image removed successfully!"
      );
      setTimeout(() => {
        window.location.reload();
      }, 300);
    } catch (err) {
      console.error("Error removing image:", err);

      toast.error(
        "Error",
        "Failed to remove image. Please try again."
      );
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const handleThemeChange = async (selectedTheme) => {
    // Update local state
    setTheme(selectedTheme);

    // Update preferences
    const newPreferences = { ...preferences, theme: selectedTheme };
    setPreferences(newPreferences);

    try {
      await api.put(`/admin/preferences`, newPreferences);
      toast.success("Success", "Theme preference saved!");
    } catch (err) {
      console.error('Error saving theme preference:', err);
    }
  };


  const handleExportData = async () => {
    setLoading(true);
    setLoadingMessage('Exporting data...');
    try {
      const response = await api.get(`/admin/users/export`, {
        params: { format: 'csv' },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Success", "Export downloaded successfully!");
    } catch (err) {
      console.error('Error exporting data:', err);
      toast.error("Error", "Failed to export data. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleDownloadReport = async () => {
    setLoading(true);
    setLoadingMessage('Downloading report...');
    try {
      const response = await api.get(`/admin/users/export`, {
        params: { format: 'excel' },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Success", "Report downloaded successfully!");
    } catch (err) {
      console.error('Error downloading report:', err);
      toast.error("Error", "Failed to download report. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    setLoadingMessage('Deleting account...');
    try {
      await api.delete(`/admin/profile`);
      localStorage.removeItem('theme');
      localStorage.removeItem('activeSetting');
      toast.success("Account Deleted", "Your account has been deleted.");
      setTimeout(() => { window.location.href = '/'; }, 1500);
    } catch (err) {
      console.error('Error deleting account:', err);
      if (err.response?.data?.detail) {
        toast.error("Error", err.response.data.detail);
      } else {
        toast.error("Error", "Failed to delete account. Please try again.");
      }
    } finally {
      setLoading(false);
      setLoadingMessage('');
      setShowDeleteModal(false);
    }
  };

  /* ================== EYE ICON SVG ================== */
  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke={isDark ? "#9ca3af" : "#6b7280"} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );

  const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke={isDark ? "#9ca3af" : "#6b7280"} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 0 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );

  /* ================== RENDER ================== */
  return (
    <div className={`flex gap-8 font-outfit p-4 items-start min-h-screen mt-[-20px] mb-[30px] transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-gray-100'}`}>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-gray-100/30 dark:bg-black/30 backdrop-blur-sm" />
          <div className={`relative rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 min-w-[200px] ${isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-purple-200 dark:border-purple-900" />
              <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-purple-600 dark:border-t-purple-400 animate-spin" />
            </div>
            <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {loadingMessage || 'Loading...'}
            </p>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-[2px] p-4">
          <div className={`rounded-[20px] p-6 w-full max-w-md shadow-2xl relative ${isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className={`text-xl md:text-[22px] font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-white rounded-full p-1 hover:opacity-90"
                style={{ background: "linear-gradient(90deg, #3D1768 0%, #020202 100%)" }}
              >
                <X size={18} strokeWidth={3} />
              </button>
            </div>

            {passwordError && (
              <div className="mb-4 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                {passwordError}
              </div>
            )}

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }}>
              {[
                { label: "Current Password", key: "currentPassword", show: showCurrentPassword, toggle: setShowCurrentPassword },
                { label: "New Password", key: "newPassword", show: showNewPassword, toggle: setShowNewPassword },
                { label: "Confirm New Password", key: "confirmPassword", show: showConfirmPassword, toggle: setShowConfirmPassword }
              ].map(({ label, key, show, toggle }) => (
                <div className="flex flex-col gap-1.5" key={key}>
                  <label className={`text-[14px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {label} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={show ? "text" : "password"}
                      value={passwordData[key]}
                      onChange={(e) => setPasswordData({ ...passwordData, [key]: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none transition-all duration-200 ${isDark
                        ? 'bg-gray-800 text-white border border-gray-600 focus:border-purple-500'
                        : 'bg-gray-50 text-gray-900 border border-gray-300 focus:border-purple-500'
                        }`}
                      placeholder={`Enter ${label.toLowerCase()}`}
                    />
                    <button type="button" onClick={() => toggle(!show)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {show ? <EyeIcon /> : <EyeOffIcon />}
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button type="submit"
                  className="w-full text-white px-6 py-2.5 rounded-xl text-[14px] font-bold hover:opacity-90 shadow-lg transition-all duration-200"
                  style={{ background: "linear-gradient(90deg, #3D1768 0%, #020202 100%)" }}>
                  Change Password
                </button>
                <button type="button" onClick={() => setShowPasswordModal(false)}
                  className={`w-full px-8 py-2.5 rounded-xl text-[14px] font-bold border-2 transition-all duration-200 ${isDark ? 'bg-transparent text-white border-gray-600 hover:bg-gray-800' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    }`}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-[2px] p-4">
          <div className={`rounded-[20px] p-6 w-full max-w-md shadow-2xl relative text-center ${isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <h3 className={`text-2xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Delete Account</h3>
            <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2 rounded-full bg-gray-500 text-white hover:bg-gray-600 transition">
                Cancel
              </button>
              <button onClick={handleDeleteAccount}
                className="px-5 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEFT: Settings Menu */}
      <div className={`w-[400px] p-4 rounded-2xl shadow-lg shrink-0 transition-colors duration-300 sticky top-4 self-start ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
        <h2 className={`font-outfit mb-8 mt-2 text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Settings Menu
        </h2>

        <div className="flex flex-col gap-4">
          {[
            {
              key: 'dashboard',
              icon: <BarChart3 size={24} strokeWidth={1.5} />,
              label: 'Dashboard & Visualization',
              sub: 'Preferences'
            },
            {
              key: 'profile',
              icon: <User size={24} strokeWidth={1.5} />,
              label: 'User Profile & Account',
              sub: 'Account settings and profile'
            }
          ].map(({ key, icon, label, sub }) => (
            <div key={key}
              onClick={() => setActiveSetting(key)}
              className={`flex items-center justify-between w-full p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${activeSetting === key
                ? (isDark ? 'bg-purple-900/30 text-white border-purple-500' : 'bg-purple-100 text-purple-900 border-purple-500 shadow-md')
                : (isDark ? 'bg-transparent text-gray-300 border-transparent hover:bg-gray-800 hover:border-gray-700' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300')
                }`}>
              <div className="flex items-center gap-4">
                {icon}
                <div className="flex flex-col">
                  <span className="font-medium text-lg">{label}</span>
                  <span className={`text-xs mt-1 ${activeSetting === key ? (isDark ? 'text-purple-300' : 'text-purple-600') : (isDark ? 'text-gray-500' : 'text-gray-500')}`}>
                    {sub}
                  </span>
                </div>
              </div>
              <ChevronRight size={20} className={activeSetting === key ? (isDark ? 'text-purple-400' : 'text-purple-600') : ''} />
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Content */}
      <aside className={`w-[620px] min-h-[740px] rounded-2xl shadow-lg p-4 transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white border border-gray-800' : 'bg-white text-gray-800 border border-gray-200'}`}>

        {/* ===== DASHBOARD TAB ===== */}
        {activeSetting === 'dashboard' && (
          <div>
            <h2 className={`flex items-center justify-between gap-2 mb-6 mt-2 w-full text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              <div className="flex items-center gap-2">
                <BarChart3 size={20} strokeWidth={1.5} className={isDark ? "text-purple-400" : "text-purple-600"} />
                Dashboard & Visualization
              </div>
              <span className="text-xs opacity-60">(Version {version})</span>
            </h2>

            <div className="flex flex-col gap-6">
              {/* Theme */}
              <div className={`p-6 rounded-xl border-2 transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700 shadow-lg' : 'bg-gray-50 border-gray-200 shadow-sm'}`}>
                <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Theme</h3>
                <p className={`text-sm mb-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Choose your preferred color scheme</p>
                <CustomDropdown
                  options={themes}
                  defaultSelected={theme}  // Use only theme state, not preferences.theme
                  onSelect={handleThemeChange}
                  theme={theme}
                />
              </div>

              {/* Clock */}
              <div className={`p-6 rounded-xl border-2 transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700 shadow-lg' : 'bg-gray-50 border-gray-200 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Current Time & Date</h3>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Real-time clock showing your local time</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
                    <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-center mb-6">
                  <div className={`text-5xl md:text-6xl font-bold font-mono tracking-wider mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {currentDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Your Local Time</div>
                </div>
                <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-700 border border-gray-600' : 'bg-purple-50 border border-purple-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-purple-900/50' : 'bg-purple-200'}`}>
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>TODAY'S DATE</div>
                        <div className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          {currentDateTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                        {currentDateTime.toLocaleDateString('en-US', { day: 'numeric' })}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {currentDateTime.toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`mt-4 pt-3 text-center text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  <div className="flex items-center justify-center gap-4">
                    <span>🕐 {currentDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>📅 Week {Math.ceil((currentDateTime - new Date(currentDateTime.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000))}</span>
                  </div>
                </div>
              </div>

              {/* Weather */}
              <div className={`p-6 rounded-xl border-2 transition-all duration-300 overflow-hidden relative ${isDark ? 'bg-gray-800 border-gray-700 shadow-lg' : 'bg-gray-50 border-gray-200 shadow-sm'}`}>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${isDark ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Weather</h3>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Live weather conditions</p>
                      </div>
                    </div>
                    <button onClick={getWeatherData} disabled={weatherLoading}
                      className={`p-2 rounded-full transition-all duration-300 hover:rotate-180 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} ${weatherLoading ? 'animate-spin' : ''}`}>
                      <RefreshCw size={16} className="text-blue-500" />
                    </button>
                  </div>

                  {weatherLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="text-center">
                        <div className="relative w-12 h-12 mx-auto mb-3">
                          <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-900"></div>
                          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
                        </div>
                        <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Fetching weather data...</p>
                      </div>
                    </div>
                  ) : weatherError ? (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                        style={{ background: weatherError === 'location_denied' ? 'rgba(239,68,68,0.1)' : 'rgba(234,179,8,0.1)' }}>
                        {weatherError === 'location_denied' ? (
                          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M6.343 17.657a9 9 0 010-12.728M9.172 15.536a5 5 0 010-7.072M12 12h.01" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        )}
                      </div>
                      <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {weatherError === 'location_denied' && 'Location Access Denied'}
                        {weatherError === 'location_unavailable' && 'Location Unavailable'}
                        {weatherError === 'location_timeout' && 'Location Request Timed Out'}
                        {weatherError === 'network_error' && 'Network Error'}
                        {weatherError === 'unknown_error' && 'Unable to Load Weather'}
                      </p>
                      <p className={`text-xs mb-3 px-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {weatherError === 'location_denied' && 'Allow location access in your browser settings, then click retry.'}
                        {weatherError === 'location_unavailable' && 'Could not detect your location. Please check your GPS.'}
                        {weatherError === 'location_timeout' && 'The location request took too long. Please try again.'}
                        {weatherError === 'network_error' && 'Check your internet connection and try again.'}
                        {weatherError === 'unknown_error' && 'Something went wrong fetching weather data.'}
                      </p>
                      <button onClick={getWeatherData}
                        className="px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:scale-105 transition-all duration-300">
                        Retry
                      </button>
                    </div>
                  ) : weatherData && (
                    <>
                      <div className="mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className={`font-semibold text-base ${isDark ? 'text-white' : 'text-gray-800'}`}>{weatherData.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <div className="text-5xl font-bold font-mono tracking-tighter bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                            {weatherData.temp}°
                          </div>
                          <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Feels like {weatherData.feels_like}°</div>
                        </div>
                        <div className="text-right">
                          <div className="text-4xl mb-1">{getWeatherIcon(weatherData.description)}</div>
                          <div className="text-sm font-semibold capitalize bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {weatherData.description}
                          </div>
                          <div className="flex items-center gap-3 justify-end mt-2">
                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>💧 {weatherData.humidity}%</span>
                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>💨 {weatherData.wind_speed} km/h</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 pt-3">
                        {[
                          { label: 'Min', value: `${weatherData.temp_min}°` },
                          { label: 'Max', value: `${weatherData.temp_max}°` },
                          { label: 'Pressure', value: weatherData.pressure }
                        ].map(({ label, value }) => (
                          <div key={label} className={`text-center p-2 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</div>
                            <div className="text-lg font-bold">{value}</div>
                          </div>
                        ))}
                      </div>
                      <div className={`mt-4 pt-3 text-center flex items-center justify-center gap-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Live • Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== PROFILE TAB ===== */}
        {activeSetting === 'profile' && (
          <div>
            <h2 className={`flex items-center gap-2 mb-6 mt-2 text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              <User size={20} strokeWidth={1.5} className={isDark ? "text-purple-400" : "text-purple-600"} />
              User Profile & Account
            </h2>

            <div className="flex flex-col gap-6">

              {/* Profile Details Card */}
              <div className={`p-5 rounded-xl border-2 transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700 shadow-lg' : 'bg-gray-50 border-gray-200 shadow-sm'}`}>
                <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>Profile Details</h3>
                <p className={`text-sm mb-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Update your personal information and profile picture
                </p>

                {/* =============================================
                    FIX: Show previewImage (new local selection)
                    OR profile.profileImage (saved backend URL).
                    Avatar fallback shows when neither exists.
                    ============================================= */}
                <div className="flex flex-col items-center gap-4 mb-6">
                  {(previewImage || profile.profileImage) ? (
                    <img
                      src={previewImage || profile.profileImage}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-2 border-purple-500"
                      onError={(e) => {
                        // If image fails to load, fall back to avatar
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center border-2 border-purple-300">
                      <svg className="w-12 h-12 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}

                  {/* Show hint text when a new image is staged */}
                  {previewImage && (
                    <p className={`text-xs text-center ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                      ⚠ New image selected — click <strong>Save Changes</strong> to upload
                    </p>
                  )}

                  <div className="flex items-center gap-3">
                    <label className={`px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 border-2 bg-purple-600 border-purple-500 text-white hover:bg-purple-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {previewImage ? 'Change Selection' : 'Change Picture'}
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
                      disabled={loading}
                      className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {previewImage ? 'Cancel Selection' : 'Remove Picture'}
                    </button>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {[
                    { label: 'First Name', key: 'firstName', handler: handleFirstNameChange, error: nameErrors.firstName, errMsg: 'Only letters and spaces allowed' },
                    { label: 'Last Name', key: 'lastName', handler: handleLastNameChange, error: nameErrors.lastName, errMsg: 'Only letters and spaces allowed' }
                  ].map(({ label, key, handler, error, errMsg }) => (
                    <div key={key}>
                      <label className={`font-medium mb-1.5 block text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {label} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={profile[key]}
                        onChange={handler}
                        className={`w-full !border rounded-[12px] px-4 py-3 text-[15px]
  focus:outline-none focus:ring-2 focus:ring-[#51218F] focus:border-transparent
  ${isDark
                            ? 'bg-gray-700 text-white border-gray-600'
                            : 'bg-white text-gray-900 border-gray-300'
                          }
  ${(showValidationErrors && !profile[key]) || error ? 'border-red-500' : ''}
`}
                        disabled={loading}
                        placeholder={`Enter ${label.toLowerCase()}`}
                      />
                      {showValidationErrors && !profile[key] && (
                        <p className="text-red-500 text-xs mt-1">{label} is required</p>
                      )}
                      {error && <p className="text-red-500 text-xs mt-1">{errMsg}</p>}
                    </div>
                  ))}
                </div>

                {/* Email */}
                <div className="mb-4">
                  <label className={`font-medium mb-1.5 block text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={handleEmailChange}
                    readOnly
                    className={`w-full !border rounded-[12px] px-4 py-3 text-[15px]
  focus:outline-none focus:ring-2 focus:ring-[#51218F] focus:border-transparent
  cursor-not-allowed
  ${isDark
                        ? 'bg-gray-800 text-gray-400 border-gray-600'
                        : 'bg-gray-100 text-gray-500 border-gray-300'
                      }
  ${showValidationErrors && (!profile.email || emailError) ? 'border-red-500' : ''}
`}
                    disabled={loading}
                    placeholder="Enter email address"
                  />
                  {showValidationErrors && !profile.email && <p className="text-red-500 text-xs mt-1">Email is required</p>}
                  {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                </div>

                {/* Role */}
                <div className="mb-5">
                  <label className={`font-medium mb-1.5 block text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Role <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={profile.role}
                    readOnly
                    className={`w-full !border rounded-[12px] px-4 py-3 text-[15px]
  focus:outline-none focus:ring-2 focus:ring-[#51218F] focus:border-transparent
  cursor-not-allowed
  ${isDark
                        ? 'bg-gray-800 text-gray-400 border-gray-600'
                        : 'bg-gray-100 text-gray-500 border-gray-300'
                      }
  ${showValidationErrors && !profile.role ? 'border-red-500' : ''}
`}
                  />
                  {showValidationErrors && !profile.role && <p className="text-red-500 text-xs mt-1">Role is required</p>}
                </div>

                <button
                  onClick={handleSaveProfile}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 border-2 bg-purple-600 border-purple-500 text-white hover:bg-purple-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loading}
                >
                  Save Changes
                </button>
              </div>

              {/* Password & Security */}
              <div className={`p-5 rounded-xl border-2 transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700 shadow-lg' : 'bg-gray-50 border-gray-200 shadow-sm'}`}>
                <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>Password & Security</h3>
                <p className={`text-sm mb-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Manage your password and enable two-factor authentication
                </p>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className={`w-full py-2.5 cursor-pointer rounded-lg text-sm font-semibold transition-all duration-200 border-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' : 'bg-gray-200 border-gray-300 text-gray-800 hover:bg-gray-300'}`}
                  disabled={loading}
                >
                  Change Password
                </button>
              </div>

              {/* Account Actions */}
              <div className={`p-5 rounded-xl border-2 transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700 shadow-lg' : 'bg-gray-50 border-gray-200 shadow-sm'}`}>
                <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>Account Actions</h3>
                <p className={`text-sm mb-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Manage your account settings and preferences
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleDownloadReport}
                    className={`w-full py-2.5 cursor-pointer rounded-lg text-sm font-semibold transition-all duration-200 border-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' : 'bg-gray-200 border-gray-300 text-gray-800 hover:bg-gray-300'}`}
                  >
                    Download Account Report
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full cursor-pointer bg-red-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700 transition-all duration-200"
                    disabled={loading}
                  >
                    Delete Account
                  </button>
                </div>
                <p className={`text-[10px] mt-3 text-left ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
              </div>

            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default Setting;