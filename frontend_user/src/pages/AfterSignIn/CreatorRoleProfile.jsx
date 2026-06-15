import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "../../component/Toast";
import { useUser } from "../../contexts/UserContext";
import { useDropdownOptions } from "../../hooks/useDropdownOptions";
import api from "../../utils/axiosConfig";
import Slide1 from "../../assets/Landing/Slide1.png";
import userImage from "../../assets/Landing/Profilepic.png";
import successIcon from "../../assets/Landing/successIcon.png";
import "../../App.css";

// Fetch countries dynamically from REST API
const fetchCountries = async () => {
  try {
    // Using CountriesNow API - supports CORS natively
    const response = await fetch("https://countriesnow.space/api/v0.1/countries/positions");
    
    if (!response.ok) throw new Error("Failed to fetch countries");
    const result = await response.json();

    const countries = result.data
      .filter((country) => country.iso2 && country.name)
      .map((country) => ({
        value: country.name,
        label: country.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return countries;
  } catch (error) {
    console.error("Error fetching countries:", error);
    // Return fallback data if API fails
    return [
      { value: "United States", label: "United States" },
      { value: "United Kingdom", label: "United Kingdom" },
      { value: "Canada", label: "Canada" },
      { value: "Australia", label: "Australia" },
      { value: "Germany", label: "Germany" },
      { value: "France", label: "France" },
      { value: "India", label: "India" },
      { value: "Japan", label: "Japan" },
      { value: "China", label: "China" },
      { value: "Brazil", label: "Brazil" },
    ];
  }
};

// Loading Screen Component
const LoadingScreen = ({ message = "Loading..." }) => (
  <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mb-4"></div>
    <p className="text-gray-600 text-lg font-medium">{message}</p>
  </div>
);

// Success Modal Component
const SuccessModal = ({ onClose, onGoHome }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-[90%] md:w-[700px] bg-white rounded-[32px] border border-[#C8A7FF] shadow-xl text-center py-12 px-6 md:px-10">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* TITLE */}
        <h1
          className="text-[32px] text-[#4C2E81] font-bold mb-6"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Talenta
        </h1>

        {/* SUCCESS IMAGE */}
        <div className="flex justify-center mb-6">
          <img
            src={successIcon}
            alt="success"
            className="w-[120px] h-[120px] object-contain"
          />
        </div>

        {/* MAIN MESSAGE */}
        <p
          className="text-[26px] md:text-[30px] text-[#4C2E81] font-semibold leading-snug mb-4"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          You are successfully created <br />
          the creator profile
        </p>

        <p className="text-[#6B6B6B] text-[14px] mb-10 text-[rgba(81,33,143,1)]">
          This can be edit anytime on your dashboard screen 
        </p>

        <button 
          onClick={onGoHome}
          className="
            w-full py-4 rounded-full text-white text-lg font-semibold
            bg-gradient-to-r from-[#6D2EFF] to-[#120026] cursor-pointer hover:opacity-90 transition-opacity
          "
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

// Custom Dropdown Component with Smart Positioning
const CustomDropdown = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  error,
  alwaysOpenUp = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState("bottom");
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const selectedOption = options.find((opt) => opt.value === value);
    setSelectedLabel(selectedOption ? selectedOption.label : placeholder);
  }, [value, options, placeholder]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 100);
    }
  }, [isOpen]);

  const calculatePosition = () => {
    if (!buttonRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    const dropdownHeight = 250;

    if (alwaysOpenUp) {
      setDropdownPosition("top");
      if (spaceAbove < dropdownHeight) {
        buttonRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    } else {
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setDropdownPosition("top");
        if (spaceAbove < dropdownHeight) {
          buttonRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      } else {
        setDropdownPosition("bottom");
        if (spaceBelow < dropdownHeight) {
          buttonRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      calculatePosition();
    }
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm("");
    }
  };

  const handleSelect = (selectedValue, label) => {
    onChange(selectedValue);
    setSelectedLabel(label);
    setIsOpen(false);
    setSearchTerm("");
  };

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        ref={buttonRef}
        style={{ border: "1px solid #000000" }}
        className="w-full h-[56px] rounded-[12px] px-4 bg-white text-[#4C2E81] font-medium cursor-pointer flex items-center justify-between"
        onClick={handleToggle}
      >
        <span className={value ? "text-[#4C2E81]" : "text-gray-400"}>
          {selectedLabel}
        </span>
        <div
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
            <path
              d="M1 1L7 7L13 1"
              stroke="#4C2E81"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div
          className={`absolute ${
            dropdownPosition === "top" ? "bottom-full mb-1" : "top-full mt-1"
          } left-0 right-0 bg-white rounded-[12px] shadow-lg z-[1000] border-2 border-[#4C2E81] overflow-hidden`}
        >
          <div className="p-2 border-b border-gray-200 bg-white sticky top-0">
            <div className="flex items-center bg-gray-50 rounded-lg px-3 py-1.5">
              <svg
                className="w-4 h-4 text-gray-400 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent outline-none text-sm w-full text-gray-700"
                onClick={(e) => e.stopPropagation()}
              />
              {searchTerm && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchTerm("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value || `option-${index}`}
                  className={`px-4 py-3 cursor-pointer transition-colors duration-200 font-medium text-[16px] hover:bg-[rgba(76,46,129,0.1)] ${
                    option.value === "" ? "text-gray-400" : "text-[#4C2E81]"
                  } ${value === option.value ? "bg-[rgba(76,46,129,0.1)]" : ""} ${
                    index !== filteredOptions.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                  onClick={() => handleSelect(option.value, option.label)}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-center text-gray-400 text-sm">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default function CreatorRoleProfile() {
  const navigate = useNavigate();
  const { userData, fetchUserData } = useUser();

  const { getOptions, loading: optLoading } = useDropdownOptions();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const [name, setName] = useState("");
  const [creatorCategory, setCreatorCategory] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [primaryNiche, setPrimaryNiche] = useState("");
  const [secondaryNiche, setSecondaryNiche] = useState("");
  const [platform, setPlatform] = useState("");
  const [followers, setFollowers] = useState("");
  const [portfolioCategory, setPortfolioCategory] = useState("");
  const [location, setLocation] = useState("");
  const [collabType, setCollabType] = useState("");
  const [projectType, setProjectType] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");

  const [locationOptions, setLocationOptions] = useState([
    { value: "", label: "Loading countries..." },
  ]);
  const [loadingLocation, setLoadingLocation] = useState(true);

  const creatorCategoryOptions = getOptions(
    "creator_category",
    "Select category",
  );
  const experienceOptions = [
    { value: "", label: "Select experience" },
    { value: "expert", label: "Expert" },
    { value: "intermediate", label: "Intermediate" },
    { value: "beginner", label: "Beginner" },
  ];
  const primaryNicheOptions = getOptions("primary_niche", "Select primary");
  const secondaryNicheOptions = getOptions("secondary_niche", "None");
  const platformOptions = getOptions("platform", "Select platform");
  const followersOptions = getOptions("followers_range", "Select range");
  const portfolioOptions = getOptions("portfolio_category", "Select portfolio");

  const fileInputRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const profilePicInputRef = useRef(null);
  const nameRef = useRef(null);

  const MAX_IMAGE_SIZE_MB = 5;
  const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
  const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];
  
  // Allowed portfolio file types - ONLY IMAGES
  const ALLOWED_PORTFOLIO_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];
  const MAX_PORTFOLIO_SIZE_MB = 10;
  const MAX_PORTFOLIO_SIZE_BYTES = MAX_PORTFOLIO_SIZE_MB * 1024 * 1024;

  // Modal handlers
  // Modal handlers - update these functions
const handleSuccessModalClose = async () => {
  setShowSuccessModal(false);
  // Fetch user data before navigating
  await fetchUserData();
  navigate("/home");
};

const handleGoToHome = async () => {
  setShowSuccessModal(false);
  // Fetch user data before navigating
  await fetchUserData();
  navigate("/home");
};

  // Validation functions
  const validateProfilePic = (file) =>
    !file ? "Please upload a profile photo" : "";
  const validateName = (value) => {
    if (!value.trim()) return "Please enter your name";
    if (!/^[a-zA-Z\s]+$/.test(value))
      return "Name should only contain letters and spaces";
    return "";
  };
  const validateCreatorCategory = (value) =>
    !value ? "Please select a creator category" : "";
  const validateExperienceLevel = (value) =>
    !value ? "Please select your experience level" : "";
  const validatePrimaryNiche = (value) =>
    !value ? "Please select a primary niche" : "";
  const validatePlatform = (value) =>
    !value ? "Please select a platform" : "";
  const validateFollowers = (value) =>
    !value ? "Please select your follower range" : "";
  const validatePortfolioCategory = (value) =>
    !value ? "Please select a portfolio category" : "";
  const validateUploadedFile = (value) =>
    !value ? "Please upload at least one portfolio file" : "";
  const validateCollabType = (value) =>
    !value ? "Please select a collaboration type" : "";
  const validateProjectType = (value) =>
    !value ? "Please select a project type preference" : "";
  const validateLocation = (value) =>
    !value ? "Please select your location" : "";
  const validatePortfolioLink = (value) => {
    if (!value.trim()) return "Please enter your portfolio link";
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(value)) return "Please enter a valid URL (e.g., https://behance.net/username)";
    return "";
  };

  useEffect(() => {
    const initializePage = async () => {
      setIsPageLoading(true);
      try {
        await fetchCountriesData();
      } catch (error) {
        console.error("Error initializing page:", error);
      } finally {
        setTimeout(() => setIsPageLoading(false), 500);
      }
    };

    initializePage();
  }, []);

  const fetchCountriesData = async () => {
    setLoadingLocation(true);
    try {
      const countries = await fetchCountries();
      setLocationOptions([
        { value: "", label: "Select location" },
        ...countries,
      ]);
    } catch (error) {
      console.error("Error loading countries:", error);
      toast.error("Error", "Failed to load countries");
    } finally {
      setLoadingLocation(false);
    }
  };

  // Real-time validation handlers
  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    setErrors((prev) => ({ ...prev, name: validateName(value) }));
  };

  const handleCreatorCategoryChange = (value) => {
    setCreatorCategory(value);
    setErrors((prev) => ({
      ...prev,
      creatorCategory: validateCreatorCategory(value),
    }));
  };

  const handleExperienceLevelChange = (value) => {
    setExperienceLevel(value);
    setErrors((prev) => ({
      ...prev,
      experienceLevel: validateExperienceLevel(value),
    }));
  };

  const handlePrimaryNicheChange = (value) => {
    setPrimaryNiche(value);
    setErrors((prev) => ({
      ...prev,
      primaryNiche: validatePrimaryNiche(value),
    }));
  };

  const handlePlatformChange = (value) => {
    setPlatform(value);
    setErrors((prev) => ({ ...prev, platform: validatePlatform(value) }));
  };

  const handleFollowersChange = (value) => {
    setFollowers(value);
    setErrors((prev) => ({ ...prev, followers: validateFollowers(value) }));
  };

  const handlePortfolioCategoryChange = (value) => {
    setPortfolioCategory(value);
    setErrors((prev) => ({
      ...prev,
      portfolioCategory: validatePortfolioCategory(value),
    }));
  };

  const handleLocationChange = (value) => {
    setLocation(value);
    setErrors((prev) => ({ ...prev, location: validateLocation(value) }));
  };

  const handlePortfolioLinkChange = (e) => {
    const value = e.target.value;
    setPortfolioLink(value);
    setErrors((prev) => ({
      ...prev,
      portfolioLink: validatePortfolioLink(value),
    }));
  };

  // Show loading screen while page is initializing
  if (isPageLoading) {
    return <LoadingScreen message="Preparing your workspace..." />;
  }

  if (optLoading || loadingLocation) {
    return <LoadingScreen message="Loading your options..." />;
  }

  function onFileChange(e) {
    const file = e.target.files && e.target.files[0];
    
    if (!file) return;

    // Validate file type - Only images allowed
    if (!ALLOWED_PORTFOLIO_TYPES.includes(file.type)) {
      toast.error(
        "Invalid file type",
        "Only JPG, JPEG, PNG, and WEBP images are allowed for portfolio"
      );
      e.target.value = "";
      return;
    }

    // Validate file size
    if (file.size > MAX_PORTFOLIO_SIZE_BYTES) {
      toast.error(
        "File too large",
        `File size must be less than ${MAX_PORTFOLIO_SIZE_MB} MB`
      );
      e.target.value = "";
      return;
    }

    setUploadedFile(file);
    setErrors((prev) => ({ ...prev, uploadedFile: "" }));
    toast.success("File selected", `${file.name} is ready to upload`);
  }

  function onProfilePicChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error(
        "Invalid file type",
        "Only JPG, JPEG, PNG, and WEBP images are allowed"
      );
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error(
        "File too large",
        "Image size must be less than or equal to 5 MB"
      );
      e.target.value = "";
      return;
    }

    setProfilePicFile(file);
    setErrors((prev) => ({ ...prev, profilePic: "" }));

    const reader = new FileReader();
    reader.onload = (event) => {
      setProfilePic(event.target.result);
    };
    reader.readAsDataURL(file);
  }

  const validateForm = () => {
    const newErrors = {
      profilePic: validateProfilePic(profilePicFile),
      name: validateName(name),
      creatorCategory: validateCreatorCategory(creatorCategory),
      experienceLevel: validateExperienceLevel(experienceLevel),
      primaryNiche: validatePrimaryNiche(primaryNiche),
      platform: validatePlatform(platform),
      followers: validateFollowers(followers),
      portfolioCategory: validatePortfolioCategory(portfolioCategory),
      uploadedFile: validateUploadedFile(uploadedFile),
      collabType: validateCollabType(collabType),
      projectType: validateProjectType(projectType),
      location: validateLocation(location),
      portfolioLink: validatePortfolioLink(portfolioLink),
    };

    Object.keys(newErrors).forEach(
      (key) => newErrors[key] === "" && delete newErrors[key]
    );
    return newErrors;
  };

  async function handleSubmit(e) {
  e.preventDefault();

  const validationErrors = validateForm();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    toast.error("Validation Error", "Please fill all required fields");
    return;
  }

  if (!userData || !userData.id) {
    toast.error("User Error", "User not found. Please login again.");
    return;
  }

  setIsSubmitting(true);

  try {
    toast.info("Setting up your profile...", "Please wait while we create your profile");

    const formData = new FormData();

    formData.append("creator_name", name);
    formData.append("creator_type", creatorCategory);
    formData.append("experience_level", experienceLevel);
    formData.append("primary_niche", primaryNiche);
    if (secondaryNiche && secondaryNiche !== "") {
      formData.append("secondary_niche", secondaryNiche);
    }
    formData.append("platforms", platform);
    formData.append("followers", parseInt(followers) || 0);
    formData.append("portfolio_category", portfolioCategory);
    formData.append("collaboration_type", collabType);
    formData.append("project_type", projectType);
    formData.append("location", location);

    if (portfolioLink && portfolioLink.trim()) {
      formData.append("portfolio_link", portfolioLink.trim());
    }

    if (uploadedFile) {
      const cleanFileName = uploadedFile.name.replace(/[()\s]/g, '_');
      const cleanedFile = new File([uploadedFile], cleanFileName, { type: uploadedFile.type });
      formData.append("portfolio_uploads", cleanedFile);
    }

    if (profilePicFile) {
      const cleanPicName = profilePicFile.name.replace(/[()\s]/g, '_');
      const cleanedPic = new File([profilePicFile], cleanPicName, { type: profilePicFile.type });
      formData.append("profile_picture", cleanedPic);
    }

    const response = await api.post(
      `/creator/save/${userData.id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      },
    );

    toast.success(
      response.data.message || "Profile created successfully!",
      "Your creator profile has been set up"
    );

    // Show success modal
    setShowSuccessModal(true);
    
  } catch (error) {
    console.error("Error creating profile:", error);

    let errorMessage = "Failed to create profile. Please try again.";

    if (error.code === "ECONNABORTED") {
      errorMessage = "Request timed out. Please check your connection and try again.";
    } else if (error.response) {
      if (error.response.status === 404) {
        errorMessage = "User not found. Please login again.";
      } else if (error.response.data && error.response.data.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.request) {
      errorMessage = "No response from server. Please check your connection.";
    }

    toast.error("Submission Failed", errorMessage);
  } finally {
    setIsSubmitting(false);
  }
}
  return (
    <>
      <div
        className="relative min-h-screen w-full overflow-x-auto"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        {/* ORIGINAL BACKGROUND IMAGE - Slide1 */}
        <img
          src={Slide1}
          alt=""
          className="absolute inset-0 w-full h-[1180px] -top-16 z-10 opacity-100 object-cover"
        />

        {/* Background Overlay */}
        <div className="absolute w-full h-full bg-[linear-gradient(180deg,#3D1768_0%,#030303_100%)] opacity-100 z-0" />

        {/* OUTER PURPLE BORDER */}
        <div className="relative z-20 w-full flex justify-center px-4 pt-[150px] md:pt-[382px] pb-20">
          <div className="rounded-[40px] p-[3px] bg-gradient-to-b from-[#6D2EFF] to-[#431A85] w-full max-w-[834px]">
            {/* WHITE MAIN CARD */}
            <div className="bg-white w-full rounded-[42px] border border-black shadow-xl relative">
              {/* HEADER SECTION */}
              <div className="relative w-full pt-[60px] pb-4 px-4 flex flex-col items-center">
                <button
                  onClick={() => navigate("/role-section")}
                  className="absolute left-4 top-6 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-[#6D2EFF] to-[#431A85] shadow-md text-white hover:scale-105 transition-transform"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 5 12 12 19" />
                  </svg>
                </button>

                <h1
                  className="text-[36px] font-bold text-[#4C2E81]"
                  style={{ fontFamily: "Playfair Display, serif" }}
                >
                  Talenta
                </h1>

                <p
                  className="text-[28px] text-[#4C2E81] leading-tight text-center"
                  style={{ fontFamily: "Playfair Display, serif" }}
                >
                  Set-up your creator profile
                </p>

                <p className="text-[16px] text-[#6B6B6B] font-medium text-center">
                  Tell us more about your work so we can personalize the <br />
                  collaboration for you
                </p>
              </div>

              {/* PROFILE PHOTO */}
              <div className="relative flex flex-col items-center mt-2">
                <div className="relative">
                  <img
                    src={profilePic || userImage}
                    alt="profile"
                    className={`w-[120px] h-[120px] rounded-full border-[4px] object-cover ${
                      errors.profilePic ? "border-red-400" : "border-[#C8A7FF]"
                    }`}
                  />
                  <input
                    ref={profilePicInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={onProfilePicChange}
                  />
                  <div
                    onClick={() => profilePicInputRef.current?.click()}
                    className="absolute bottom-0 right-2 w-7 h-7 rounded-full bg-[#7A3EFF] text-white flex items-center justify-center text-sm cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="white"
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM21.71 6.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-sm text-center font-['Poppins'] text-gray-600">
                  Upload a profile photo <span className="text-red-600">*</span>
                  <span className="font-medium"> (Max 5 MB)</span>
                </p>
                <p className="text-xs text-center text-gray-500 mt-1">
                  Allowed formats: JPG, JPEG, PNG, WEBP
                </p>
                {errors.profilePic && (
                  <p className="text-red-500 text-sm mt-1">{errors.profilePic}</p>
                )}
              </div>

              {/* FORM SECTION */}
              <form
                onSubmit={handleSubmit}
                className="w-full max-w-[666px] mx-auto px-6 pb-10 mt-6"
              >
                {/* 1) Creator name */}
                <div className="mb-6">
                  <p className="text-black font-semibold mb-2">
                    Creator name <span className="text-red-600">*</span>
                  </p>
                  <input
                    ref={nameRef}
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="Enter your creator name"
                    style={{ border: "1px solid #000000" }}
                    className="w-full h-[56px] rounded-[12px] px-4 bg-white text-[#4C2E81] font-medium outline-none"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* 2) Creator Type */}
                <div className="mb-6">
                  <p className="text-black font-semibold text-xl mb-3">
                    Creator Type
                  </p>
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="w-full md:w-[48%]">
                      <p className="text-black font-medium mb-2">
                        Creator Category <span className="text-red-600">*</span>
                      </p>
                      <CustomDropdown
                        value={creatorCategory}
                        onChange={handleCreatorCategoryChange}
                        options={creatorCategoryOptions}
                        error={errors.creatorCategory}
                      />
                    </div>

                    <div className="w-full md:w-[48%]">
                      <p className="text-black font-medium mb-2">
                        Experience level <span className="text-red-600">*</span>
                      </p>
                      <CustomDropdown
                        value={experienceLevel}
                        onChange={handleExperienceLevelChange}
                        options={experienceOptions}
                        error={errors.experienceLevel}
                      />
                    </div>
                  </div>
                  <p className="text-[13px] text-[#6B6B6B] mt-3">
                    This helps us to personalize your experience
                  </p>
                </div>

                {/* 3) Niche / Specialty */}
                <div className="mb-6">
                  <p className="text-black font-semibold text-xl mb-3">
                    Niche / Specialty
                  </p>
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="w-full md:w-[48%]">
                      <p className="text-black font-medium mb-2">
                        Primary Niche <span className="text-red-600">*</span>
                      </p>
                      <CustomDropdown
                        value={primaryNiche}
                        onChange={handlePrimaryNicheChange}
                        options={primaryNicheOptions}
                        error={errors.primaryNiche}
                      />
                    </div>

                    <div className="w-full md:w-[48%]">
                      <p className="text-black font-medium mb-2">
                        Secondary Niche (opt)
                      </p>
                      <CustomDropdown
                        value={secondaryNiche}
                        onChange={setSecondaryNiche}
                        options={secondaryNicheOptions}
                      />
                    </div>
                  </div>
                  <p className="text-[13px] text-[#6B6B6B] mt-3">
                    This helps us to know where your content is focused
                  </p>
                </div>

                {/* 4) Audience stats */}
                <div className="mb-6">
                  <p className="text-black font-semibold text-xl mb-3">
                    Audience stats
                  </p>
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="w-full md:w-[48%]">
                      <p className="text-black font-medium mb-2">
                        Platforms <span className="text-red-600">*</span>
                      </p>
                      <CustomDropdown
                        value={platform}
                        onChange={handlePlatformChange}
                        options={platformOptions}
                        error={errors.platform}
                      />
                    </div>

                    <div className="w-full md:w-[48%]">
                      <p className="text-black font-medium mb-2">
                        Follower/subscribers <span className="text-red-600">*</span>
                      </p>
                      <CustomDropdown
                        value={followers}
                        onChange={handleFollowersChange}
                        options={followersOptions}
                        error={errors.followers}
                      />
                    </div>
                  </div>
                  <p className="text-[13px] text-[#6B6B6B] mt-3">
                    This helps collaborators understand your reach - you can
                    update it anytime
                  </p>
                </div>

                {/* 5) Portfolio */}
                <div className="mb-6">
                  <p className="text-black font-semibold text-xl mb-3">
                    Portfolio
                  </p>
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="w-full md:w-[48%]">
                      <p className="text-black font-medium mb-2">
                        Portfolio category <span className="text-red-600">*</span>
                      </p>
                      <CustomDropdown
                        value={portfolioCategory}
                        onChange={handlePortfolioCategoryChange}
                        options={portfolioOptions}
                        error={errors.portfolioCategory}
                      />
                    </div>

                    <div className="w-full md:w-[48%]">
                      <p className="text-black font-medium mb-2">
                        Upload <span className="text-red-600">*</span>
                      </p>
                      <input
                        ref={fileInputRef}
                        id="portfolio-upload"
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        className="hidden"
                        onChange={onFileChange}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          border: "1px solid #000000",
                        }}
                        className="w-full h-[56px] rounded-[12px] px-4 flex justify-between items-center bg-white text-[#4C2E81] font-medium hover:bg-gray-50 transition-colors"
                      >
                        <span className="flex-1 text-left truncate pr-2">
                          {uploadedFile ? uploadedFile.name : "Upload samples"}
                        </span>
                        <span className="flex-shrink-0">
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 5V15"
                              stroke="#4C2E81"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            <path
                              d="M7 10L12 5L17 10"
                              stroke="#4C2E81"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            <path
                              d="M6 19H18"
                              stroke="#4C2E81"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        </span>
                      </button>
                      
                      {/* Show truncated filename with full name on hover */}
                      {uploadedFile && (
                        <p className="text-xs text-gray-400 mt-1 truncate" title={uploadedFile.name}>
                          Selected: {uploadedFile.name}
                        </p>
                      )}
                      
                      <p className="text-xs text-gray-500 mt-1">
                        Allowed formats: JPG, JPEG, PNG, WEBP (Max 10 MB)
                      </p>
                      {errors.uploadedFile && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.uploadedFile}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Portfolio Link - Now Mandatory */}
                  <div className="mt-4">
                    <p className="text-black font-medium mb-2">
                      Portfolio link <span className="text-red-600">*</span>
                    </p>
                    <input
                      type="text"
                      value={portfolioLink}
                      onChange={handlePortfolioLinkChange}
                      placeholder="https://behance.net/yourprofile or https://dribbble.com/yourprofile"
                      style={{ border: "1px solid #000000" }}
                      className="w-full h-[56px] rounded-[12px] px-4 bg-white text-[#4C2E81] font-medium outline-none"
                    />
                    {errors.portfolioLink && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.portfolioLink}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Please provide a valid portfolio link (e.g., Behance, Dribbble, personal website)
                    </p>
                  </div>
                </div>

                {/* 6) Preferences & Project type */}
                <div className="mb-6">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="w-full md:w-[48%]">
                      <p className="text-black font-semibold text-xl mb-2">
                        Preferences
                      </p>
                      <p className="text-black font-medium mb-2">
                        Collaboration type <span className="text-red-600">*</span>
                      </p>
                      {errors.collabType && (
                        <p className="text-red-500 text-sm mb-2">
                          {errors.collabType}
                        </p>
                      )}
                      <div className="space-y-2">
                        <label className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="collab"
                            value="paid"
                            checked={collabType === "paid"}
                            onChange={() => {
                              setCollabType("paid");
                              setErrors((prev) => ({
                                ...prev,
                                collabType: "",
                              }));
                            }}
                            className="accent-[#4C2E81]"
                          />
                          Paid projects
                        </label>
                        <label className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="collab"
                            value="skills"
                            checked={collabType === "skills"}
                            onChange={() => {
                              setCollabType("skills");
                              setErrors((prev) => ({
                                ...prev,
                                collabType: "",
                              }));
                            }}
                            className="accent-[#4C2E81]"
                          />
                          Skills Exchange
                        </label>
                        <label className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="collab"
                            value="longterm"
                            checked={collabType === "longterm"}
                            onChange={() => {
                              setCollabType("longterm");
                              setErrors((prev) => ({
                                ...prev,
                                collabType: "",
                              }));
                            }}
                            className="accent-[#4C2E81]"
                          />
                          Long-Term Partnerships
                        </label>
                      </div>
                    </div>

                    <div className="w-full md:w-[48%]">
                      <p className="text-black font-medium text-xl mb-2 md:mt-9">
                        Project type you prefer{" "}
                        <span className="text-red-600">*</span>
                      </p>
                      {errors.projectType && (
                        <p className="text-red-500 text-sm mb-2">
                          {errors.projectType}
                        </p>
                      )}
                      <div className="space-y-2">
                        <label className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="project"
                            value="long"
                            checked={projectType === "long"}
                            onChange={() => {
                              setProjectType("long");
                              setErrors((prev) => ({
                                ...prev,
                                projectType: "",
                              }));
                            }}
                            className="accent-[#4C2E81]"
                          />
                          Long term project
                        </label>
                        <label className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="project"
                            value="short"
                            checked={projectType === "short"}
                            onChange={() => {
                              setProjectType("short");
                              setErrors((prev) => ({
                                ...prev,
                                projectType: "",
                              }));
                            }}
                            className="accent-[#4C2E81]"
                          />
                          Short term project
                        </label>
                        <label className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="project"
                            value="one"
                            checked={projectType === "one"}
                            onChange={() => {
                              setProjectType("one");
                              setErrors((prev) => ({
                                ...prev,
                                projectType: "",
                              }));
                            }}
                            className="accent-[#4C2E81]"
                          />
                          One-Time task
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 7) Location */}
                <div className="mb-8">
                  <p className="text-black font-semibold mb-2">
                    Location <span className="text-red-600">*</span>
                  </p>
                  <CustomDropdown
                    value={location}
                    onChange={handleLocationChange}
                    options={locationOptions}
                    error={errors.location}
                    alwaysOpenUp={true}
                  />
                </div>

                {/* 8) Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !userData?.id}
                  style={{ border: "none" }}
                  className={`w-full py-4 rounded-[24px] text-white text-lg font-semibold transition-all duration-300 ${
                    isSubmitting || !userData?.id
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#6D2EFF] to-[#120026] hover:opacity-90"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Setting up...
                    </div>
                  ) : (
                    "Set up your profile"
                  )}
                </button>

                <div className="mt-2 text-center">
                  {!userData?.id ? (
                    <p className="text-amber-600 text-sm">
                      User not found. Please login again.
                    </p>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Please fill all required fields (marked with *) to continue
                    </p>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal 
          onClose={handleSuccessModalClose}
          onGoHome={handleGoToHome}
        />
      )}
    </>
  );
}