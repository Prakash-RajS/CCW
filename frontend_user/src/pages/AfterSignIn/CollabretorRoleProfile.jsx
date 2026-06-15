import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "../../component/Toast";
import { useUser } from "../../contexts/UserContext";
import { useDropdownOptions } from "../../hooks/useDropdownOptions";
import api from "../../utils/axiosConfig";
import bgImage from "../../assets/Landing/background.jpg";
import userImage from "../../assets/Landing/Profilepic.png";
import successIcon from "../../assets/Landing/successIcon.png";
import "../../App.css";

// Fetch countries dynamically from REST API
// Fetch countries dynamically from a CORS-friendly API
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

// Fetch languages using working API
const fetchLanguages = async () => {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/umpirsky/language-list/master/data/en_US/language.json",
    );
    if (!response.ok) throw new Error("Failed to fetch languages");
    const data = await response.json();

    const languages = Object.entries(data)
      .map(([code, name]) => ({
        value: name,
        label: name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return languages;
  } catch (error) {
    console.error("Error fetching languages:", error);
    return [
      { value: "English", label: "English" },
      { value: "Spanish", label: "Spanish" },
      { value: "French", label: "French" },
      { value: "German", label: "German" },
      { value: "Italian", label: "Italian" },
      { value: "Portuguese", label: "Portuguese" },
      { value: "Russian", label: "Russian" },
      { value: "Chinese", label: "Chinese" },
      { value: "Japanese", label: "Japanese" },
      { value: "Korean", label: "Korean" },
      { value: "Arabic", label: "Arabic" },
      { value: "Hindi", label: "Hindi" },
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
          the collaborator profile
        </p>

        <p className="text-[#6B6B6B] text-[14px] mb-10">
          This can be edited anytime on your dashboard screen
        </p>

        <button 
          onClick={onGoHome}
          className="
            w-full py-4 rounded-full text-white text-lg font-semibold
            bg-gradient-to-r from-[#6D2EFF] to-[#120026] hover:opacity-90 transition-opacity
          "
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

// Custom Dropdown Component
const CustomDropdown = ({ value, onChange, options, placeholder = "Select...", error, alwaysOpenUp = false }) => {
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
        buttonRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setDropdownPosition("top");
        if (spaceAbove < dropdownHeight) {
          buttonRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else {
        setDropdownPosition("bottom");
        if (spaceBelow < dropdownHeight) {
          buttonRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  };

  const handleToggle = () => {
    if (!isOpen) calculatePosition();
    setIsOpen(!isOpen);
    if (!isOpen) setSearchTerm("");
  };

  const handleSelect = (selectedValue, label) => {
    onChange(selectedValue);
    setSelectedLabel(label);
    setIsOpen(false);
    setSearchTerm("");
  };

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        ref={buttonRef}
        style={{ border: "1px solid #000000" }}
        className="w-full h-[56px] rounded-[12px] px-4 bg-white text-[#4C2E81] font-medium cursor-pointer flex items-center justify-between"
        onClick={handleToggle}
      >
        <span className={value ? "text-[#4C2E81]" : "text-gray-400"}>{selectedLabel}</span>
        <div className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
          <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
            <path d="M1 1L7 7L13 1" stroke="#4C2E81" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div
          className={`absolute ${dropdownPosition === "top" ? "bottom-full mb-1" : "top-full mt-1"} left-0 right-0 bg-white rounded-[12px] shadow-lg z-[1000] border-2 border-[#4C2E81] overflow-hidden`}
        >
          <div className="p-2 border-b border-gray-200 bg-white sticky top-0">
            <div className="flex items-center bg-gray-50 rounded-lg px-3 py-1.5">
              <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
                <button onClick={(e) => { e.stopPropagation(); setSearchTerm(""); }} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                    index !== filteredOptions.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                  onClick={() => handleSelect(option.value, option.label)}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-center text-gray-400 text-sm">No results found</div>
            )}
          </div>
        </div>
      )}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default function CollaboratorRoleProfile() {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { userData, fetchUserData } = useUser();
  const { getOptions, loading: optLoading } = useDropdownOptions();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [skills, setSkills] = useState("");
  const [skillRating, setSkillRating] = useState(80);
  const [language, setLanguage] = useState("");
  const [skillCategory, setSkillCategory] = useState("");
  const [experience, setExperience] = useState("");
  const [availability, setAvailability] = useState("");
  const [timing, setTiming] = useState("");
  const [portfolioCategory, setPortfolioCategory] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");
  const [badge, setBadge] = useState("");
  const [location, setLocation] = useState("");
  const [name, setName] = useState("");
  const [aboutWord, setAboutWord] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [languageOptions, setLanguageOptions] = useState([{ value: "", label: "Loading languages..." }]);
  const [locationOptions, setLocationOptions] = useState([{ value: "", label: "Loading countries..." }]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [bgImageLoaded, setBgImageLoaded] = useState(false);

  const profilePicInputRef = useRef(null);
  const nameRef = useRef(null);

  const ALLOWED_PORTFOLIO_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const MAX_PORTFOLIO_SIZE_MB = 10;
  const MAX_PORTFOLIO_SIZE_BYTES = MAX_PORTFOLIO_SIZE_MB * 1024 * 1024;

  // Modal handlers - same pattern as creator file
  const handleSuccessModalClose = async () => {
    setShowSuccessModal(false);
    await fetchUserData();
    navigate("/col-home");
  };

  const handleGoToHome = async () => {
    setShowSuccessModal(false);
    await fetchUserData();
    navigate("/col-home");
  };

  useEffect(() => {
    const initializePage = async () => {
      setIsPageLoading(true);
      try {
        await fetchExternalOptions();
      } catch (error) {
        console.error("Error initializing page:", error);
      } finally {
        setTimeout(() => setIsPageLoading(false), 500);
      }
    };
    initializePage();
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = bgImage;
    img.onload = () => setBgImageLoaded(true);
  }, []);

  const fetchExternalOptions = async () => {
    setLoadingOptions(true);
    try {
      const languages = await fetchLanguages();
      setLanguageOptions([{ value: "", label: "Select language" }, ...languages]);
      const countries = await fetchCountries();
      setLocationOptions([{ value: "", label: "Select location" }, ...countries]);
    } catch (error) {
      console.error("Error loading external options:", error);
      toast.error("Loading failed", "Failed to load languages and countries");
    } finally {
      setLoadingOptions(false);
    }
  };

  const skillCategoryOptions = getOptions("skill_category", "Select category");
  const portfolioOptions = getOptions("portfolio_category", "Select category");

  const experienceOptions = [
    { value: "", label: "Select experience" },
    { value: "expert", label: "Expert" },
    { value: "intermediate", label: "Intermediate" },
    { value: "beginner", label: "Beginner" },
  ];

  const availabilityOptions = [
    { value: "", label: "Select availability" },
    { value: "weekdays", label: "Monday to Friday" },
    { value: "weekends", label: "Weekends" },
    { value: "alldays", label: "All days" },
  ];

  const timingOptions = [
    { value: "", label: "Select timing" },
    { value: "9am - 6pm", label: "9am - 6pm" },
    { value: "10am - 7pm", label: "10am - 7pm" },
    { value: "11am - 8pm", label: "11am - 8pm" },
    { value: "Flexible", label: "Flexible Hours" },
  ];

  const badgeOptions = [
    { value: "", label: "Select badge" },
    { value: "top", label: "Top rated" },
    { value: "verified", label: "Verified" },
    { value: "popular", label: "Popular" },
    { value: "new", label: "New" },
  ];

  const MAX_IMAGE_SIZE_MB = 5;
  const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (isPageLoading) return <LoadingScreen message="Preparing your workspace..." />;
  if (optLoading || loadingOptions) return <LoadingScreen message="Loading your options..." />;

  const validateProfilePic = (file) => !file ? "Please upload a profile photo" : "";
  const validateName = (value) => {
    if (!value.trim()) return "Please enter your name";
    if (!/^[a-zA-Z\s]+$/.test(value)) return "Name should only contain letters and spaces";
    return "";
  };
  const validateSkills = (value) => !value.trim() ? "Please enter at least one skill" : "";
  const validateSkillCategory = (value) => !value ? "Please select a skill category" : "";
  const validateExperience = (value) => !value ? "Please select your experience level" : "";
  const validateAvailability = (value) => !value ? "Please select your availability" : "";
  const validatePortfolioCategory = (value) => !value ? "Please select a portfolio category" : "";
  const validateUploadedFile = (value) => !value ? "Please upload portfolio samples" : "";
  const validateLocation = (value) => !value ? "Please select your location" : "";
  const validatePortfolioLink = (value) => {
    if (!value.trim()) return "Please enter your portfolio link";
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(value)) return "Please enter a valid URL (e.g., https://dribbble.com/username)";
    return "";
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_PORTFOLIO_TYPES.includes(file.type)) {
      toast.error("Invalid file type", "Only JPG, JPEG, PNG, and WEBP images are allowed for portfolio");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_PORTFOLIO_SIZE_BYTES) {
      toast.error("File too large", `File size must be less than ${MAX_PORTFOLIO_SIZE_MB} MB`);
      e.target.value = "";
      return;
    }

    setUploadedFile(file);
    setErrors((prev) => ({ ...prev, uploadedFile: "" }));
    toast.success("File selected", `${file.name} is ready to upload`);
  };

  const onProfilePicChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Invalid file type", "Only JPG, JPEG, PNG, and WEBP images are allowed");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("File too large", "Image size must be less than or equal to 5 MB");
      e.target.value = "";
      return;
    }

    setProfilePicFile(file);
    setErrors((prev) => ({ ...prev, profilePic: "" }));

    const reader = new FileReader();
    reader.onload = (event) => setProfilePic(event.target.result);
    reader.readAsDataURL(file);
  };

  const handleStarClick = (starIndex) => setSkillRating(((starIndex + 1) / 5) * 100);
  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percentage = ((e.clientX - rect.left) / rect.width) * 100;
    setSkillRating(Math.min(Math.max(percentage, 0), 100));
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    setErrors((prev) => ({ ...prev, name: validateName(value) }));
  };

  const handleSkillsChange = (e) => {
    const value = e.target.value;
    setSkills(value);
    setErrors((prev) => ({ ...prev, skills: validateSkills(value) }));
  };

  const handleSkillCategoryChange = (value) => {
    setSkillCategory(value);
    setErrors((prev) => ({ ...prev, skillCategory: validateSkillCategory(value) }));
  };

  const handleExperienceChange = (value) => {
    setExperience(value);
    setErrors((prev) => ({ ...prev, experience: validateExperience(value) }));
  };

  const handleAvailabilityChange = (value) => {
    setAvailability(value);
    setErrors((prev) => ({ ...prev, availability: validateAvailability(value) }));
  };

  const handlePortfolioCategoryChange = (value) => {
    setPortfolioCategory(value);
    setErrors((prev) => ({ ...prev, portfolioCategory: validatePortfolioCategory(value) }));
  };

  const handleLocationChange = (value) => {
    setLocation(value);
    setErrors((prev) => ({ ...prev, location: validateLocation(value) }));
  };

  const handlePortfolioLinkChange = (e) => {
    const value = e.target.value;
    setPortfolioLink(value);
    setErrors((prev) => ({ ...prev, portfolioLink: validatePortfolioLink(value) }));
  };

  const validateForm = () => {
    const newErrors = {
      profilePic: validateProfilePic(profilePicFile),
      name: validateName(name),
      skills: validateSkills(skills),
      skillCategory: validateSkillCategory(skillCategory),
      experience: validateExperience(experience),
      availability: validateAvailability(availability),
      portfolioCategory: validatePortfolioCategory(portfolioCategory),
      uploadedFile: validateUploadedFile(uploadedFile),
      location: validateLocation(location),
      portfolioLink: validatePortfolioLink(portfolioLink),
    };
    Object.keys(newErrors).forEach((key) => newErrors[key] === "" && delete newErrors[key]);
    return newErrors;
  };

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Validation Error", "Please enter the required details");
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
      formData.append("name", name);
      if (language && language !== "") formData.append("language", language);
      formData.append("skill_category", skillCategory);
      formData.append("experience", experience);

      const skillsArray = skills.split(",").map((skill) => skill.trim()).filter((skill) => skill);
      formData.append("skills", skillsArray.join(","));
      formData.append("availability", availability);
      if (timing && timing !== "") formData.append("timing", timing);
      if (portfolioCategory && portfolioCategory !== "") formData.append("portfolio_category", portfolioCategory);
      
      if (portfolioLink && portfolioLink.trim()) {
        formData.append("portfolio_link", portfolioLink.trim());
      } else {
        toast.error("Validation Error", "Portfolio link is required");
        setIsSubmitting(false);
        return;
      }
      
      if (badge && badge !== "") formData.append("badges", badge);
      if (aboutWord && aboutWord.trim()) formData.append("about", aboutWord);
      formData.append("location", location);
      formData.append("skills_rating", Math.round(skillRating));

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

      const response = await api.post(`/collaborator/save/${userData.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
      });

      toast.success(response.data.message || "Profile created successfully!", "Your collaborator profile has been set up");

      // Show success modal (don't fetch user data here)
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error("Error creating profile:", error);
      let errorMessage = "Failed to create profile. Please try again.";

      if (error.code === "ECONNABORTED") {
        errorMessage = "Request timed out. Please check your connection and try again.";
      } else if (error.response) {
        if (error.response.status === 404) {
          errorMessage = "User not found. Please login again.";
        } else if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data?.message) {
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
      <div className="relative min-h-screen w-full overflow-x-auto bg-gradient-to-b from-[#3B0B59] to-[#120026]" style={{ fontFamily: "Poppins, sans-serif" }}>
        <div className="absolute top-0 left-0 w-full h-[400px] overflow-hidden z-0">
          {bgImageLoaded && <img src={bgImage} alt="background" className="w-full h-full object-cover opacity-90" />}
          {!bgImageLoaded && <div className="w-full h-full bg-gradient-to-b from-purple-900 to-purple-800"></div>}
        </div>

        <div className="relative z-10 w-full flex justify-center px-4 pt-[100px] pb-20">
          <div className="rounded-[40px] p-[3px] bg-gradient-to-b from-[#6D2EFF] to-[#431A85] w-full max-w-[834px]">
            <div className="bg-white w-full rounded-[42px] border border-black shadow-xl relative">
              <div className="relative w-full pt-[60px] pb-4 px-4 flex flex-col items-center">
                <button onClick={() => navigate("/role-section")} className="absolute left-4 top-6 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-[#6D2EFF] to-[#431A85] shadow-md text-white hover:scale-105 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 5 12 12 19" />
                  </svg>
                </button>
                <h1 className="text-[36px] font-bold text-[#4C2E81]" style={{ fontFamily: "Playfair Display, serif" }}>Talenta</h1>
                <p className="text-[28px] text-[#4C2E81] leading-tight text-center" style={{ fontFamily: "Playfair Display, serif" }}>Set-up your collaborator profile</p>
                <p className="text-[16px] text-[#6B6B6B] font-medium text-center">Complete your profile set up details and start <br />getting hired by creators</p>
              </div>

              <div className="relative flex flex-col items-center mt-2">
                <div className="relative">
                  <img src={profilePic || userImage} alt="profile" className={`w-[120px] h-[120px] rounded-full border-[4px] object-cover ${errors.profilePic ? "border-red-400" : "border-[#C8A7FF]"}`} />
                  <input ref={profilePicInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={onProfilePicChange} />
                  <div onClick={() => profilePicInputRef.current?.click()} className="absolute bottom-0 right-2 w-7 h-7 rounded-full bg-[#7A3EFF] text-white flex items-center justify-center text-sm cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 24 24">
                      <path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM21.71 6.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-sm text-center font-['Poppins'] text-gray-600">Upload a profile photo <span className="text-red-600">*</span><span className="font-medium"> (Max 5 MB)</span></p>
                <p className="text-xs text-center text-gray-500 mt-1">Allowed formats: JPG, JPEG, PNG, WEBP</p>
                {errors.profilePic && <p className="text-red-500 text-sm mt-1">{errors.profilePic}</p>}
              </div>

              <form onSubmit={handleSubmit} className="w-full max-w-[666px] mx-auto px-6 pb-10 mt-6">
                <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
                  <div className="w-full md:w-[48%]">
                    <p className="text-black font-semibold mb-2">Name <span className="text-red-600">*</span></p>
                    <input ref={nameRef} type="text" value={name} onChange={handleNameChange} placeholder="Enter Your Name" style={{ border: "1px solid #000000" }} className="w-full h-[56px] rounded-[12px] px-4 bg-white text-[#4C2E81] font-medium outline-none" />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>
                  <div className="w-full md:w-[48%]">
                    <p className="text-black font-semibold mb-2">Language</p>
                    <CustomDropdown value={language} onChange={setLanguage} options={languageOptions} />
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-black font-semibold mb-2">Skills (comma separated) <span className="text-red-600">*</span></p>
                  <input type="text" value={skills} onChange={handleSkillsChange} placeholder="e.g., Python, React, JavaScript, UI/UX Design" style={{ border: "1px solid #000000" }} className="w-full h-[56px] rounded-[12px] px-4 bg-white text-[#4C2E81] font-medium outline-none" />
                  {errors.skills && <p className="text-red-500 text-sm mt-1">{errors.skills}</p>}
                </div>

                <p className="text-black text-xl font-semibold mb-2">Skills & Expertise</p>
                <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
                  <div className="w-full md:w-[48%]">
                    <p className="text-[13px] text-black font-semibold mb-2">Skill Category <span className="text-red-600">*</span></p>
                    <CustomDropdown value={skillCategory} onChange={handleSkillCategoryChange} options={skillCategoryOptions} error={errors.skillCategory} />
                    <p className="text-[13px] text-[#6B6B6B] mt-1">This helps us about your skills and your experience</p>
                  </div>
                  <div className="w-full md:w-[48%]">
                    <p className="text-[13px] text-black font-semibold mb-2">Experience <span className="text-red-600">*</span></p>
                    <CustomDropdown value={experience} onChange={handleExperienceChange} options={experienceOptions} error={errors.experience} />
                  </div>
                </div>

                <p className="text-black text-xl font-semibold mb-1">Availability</p>
                <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
                  <div className="w-full md:w-[48%]">
                    <p className="text-[13px] font-semibold mb-2">Availability <span className="text-red-600">*</span></p>
                    <CustomDropdown value={availability} onChange={handleAvailabilityChange} options={availabilityOptions} error={errors.availability} />
                  </div>
                  <div className="w-full md:w-[48%]">
                    <p className="text-[13px] font-semibold mb-2">Timing</p>
                    <CustomDropdown value={timing} onChange={setTiming} options={timingOptions} />
                  </div>
                </div>

                <p className="text-black text-xl font-semibold mb-1">Portfolio</p>
                <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
                  <div className="w-full md:w-[48%]">
                    <p className="text-[13px] font-semibold mb-2">Portfolio category <span className="text-red-600">*</span></p>
                    <CustomDropdown value={portfolioCategory} onChange={handlePortfolioCategoryChange} options={portfolioOptions} error={errors.portfolioCategory} />
                  </div>
                  <div className="w-full md:w-[48%]">
                    <p className="text-[13px] font-semibold mb-2">
                      Upload <span className="text-red-600">*</span>
                    </p>
                    <input 
                      ref={fileInputRef} 
                      type="file" 
                      accept=".jpg,.jpeg,.png,.webp" 
                      className="hidden" 
                      onChange={handleFileChange} 
                    />
                    <button 
                      type="button" 
                      onClick={handleUploadClick} 
                      style={{ border: "1px solid #000000" }} 
                      className="w-full h-[56px] rounded-[12px] px-4 flex justify-between items-center bg-white text-[#4C2E81] font-medium hover:bg-gray-50 transition-colors group"
                    >
                      <span 
                        className="flex-1 text-left truncate pr-2"
                        title={uploadedFile ? uploadedFile.name : "Upload samples"}
                      >
                        {uploadedFile ? uploadedFile.name : "Upload samples"}
                      </span>
                      <span className="flex-shrink-0">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 5V15" stroke="#4C2E81" strokeWidth="2" strokeLinecap="round" />
                          <path d="M7 10L12 5L17 10" stroke="#4C2E81" strokeWidth="2" strokeLinecap="round" />
                          <path d="M6 19H18" stroke="#4C2E81" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </span>
                    </button>
                    
                    {uploadedFile && (
                      <p className="text-xs text-gray-400 mt-1 truncate" title={uploadedFile.name}>
                        Selected: {uploadedFile.name}
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-1">
                      Allowed formats: JPG, JPEG, PNG, WEBP (Max 10 MB)
                    </p>
                    {errors.uploadedFile && (
                      <p className="text-red-500 text-sm mt-1">{errors.uploadedFile}</p>
                    )}
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-black font-semibold mb-2">Portfolio link <span className="text-red-600">*</span></p>
                  <input type="text" value={portfolioLink} onChange={handlePortfolioLinkChange} placeholder="https://dribbble.com/username or https://linkedin.com/in/username" style={{ border: "1px solid #000000" }} className="w-full h-[56px] rounded-[12px] px-4 bg-white text-[#4C2E81] font-medium outline-none" />
                  {errors.portfolioLink && <p className="text-red-500 text-sm mt-1">{errors.portfolioLink}</p>}
                  <p className="text-xs text-gray-500 mt-1">Please provide a valid portfolio link (e.g., Dribbble, LinkedIn, Behance, personal website)</p>
                </div>

                <div className="flex flex-col md:flex-row justify-between mb-8 gap-6">
                  <div className="w-full md:w-[45%]">
                    <p className="text-black font-semibold mb-2">Badges</p>
                    <div className="space-y-2 text-[#4C2E81] text-[15px] font-medium">
                      {badgeOptions.filter((opt) => opt.value !== "").map((option) => (
                        <label key={option.value} className="flex items-center gap-2">
                          <input type="radio" name="badge" value={option.value} checked={badge === option.value} onChange={() => setBadge(option.value)} className="accent-[#4C2E81]" />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="w-full md:w-[50%]">
                    <p className="text-black font-semibold mb-2">Skills rating</p>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const currentStars = Math.round((skillRating / 100) * 5);
                          return (
                            <button key={star} type="button" className="text-[22px] text-[#4C2E81] leading-none p-1 hover:text-purple-700 transition-colors" onClick={() => handleStarClick(star - 1)}>
                              {currentStars >= star ? "★" : "☆"}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[#4C2E81] text-sm font-medium">{Math.round(skillRating)}%</p>
                    </div>
                    <div className="w-full h-[6px] bg-[#E3D5FF] rounded-full mb-4 cursor-pointer relative group" onClick={handleProgressClick}>
                      <div className="h-full bg-[#4C2E81] rounded-full transition-all duration-200" style={{ width: `${skillRating}%` }} />
                      <div className="absolute top-[-30px] left-1/2 transform -translate-x-1/2 bg-[#4C2E81] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        Click to adjust: {Math.round(skillRating)}%
                      </div>
                    </div>
                    <p className="text-black font-semibold mb-2">About you in one word</p>
                    <input type="text" value={aboutWord} onChange={(e) => setAboutWord(e.target.value)} placeholder="I am professional and very talented..." style={{ border: "1px solid #000000" }} className="w-full h-[56px] rounded-[12px] px-4 bg-white text-[#4C2E81] font-medium outline-none" />
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-black font-semibold mb-2">Location <span className="text-red-600">*</span></p>
                  <CustomDropdown value={location} onChange={handleLocationChange} options={locationOptions} error={errors.location} alwaysOpenUp={true} />
                </div>

                <button type="submit" disabled={isSubmitting || !userData?.id} style={{ border: "none" }} className={`w-full py-4 rounded-[24px] text-white text-lg font-semibold transition-all duration-300 ${isSubmitting || !userData?.id ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-[#6D2EFF] to-[#120026] hover:opacity-90"}`}>
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
                    <p className="text-amber-600 text-sm">User not found. Please login again.</p>
                  ) : (
                    <p className="text-gray-500 text-sm">Please fill all required fields (marked with *) to continue</p>
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