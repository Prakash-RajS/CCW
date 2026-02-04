import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUser} from "../../contexts/UserContext";
import api from "../../utils/axiosConfig";
import Slide1 from "../../assets/Landing/Slide1.png";
import Profilepic from "../../assets/Landing/Profilepic.png";
import Penicon from "../../assets/Landing/Penicon.png";

// Custom Dropdown Component
const CustomDropdown = ({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder = "Select...",
  error,
  required = false,
  refProp 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (selectedValue) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        className={`relative w-full h-[56px] rounded-[12px] bg-white 
          ring-1 ${error ? 'ring-red-500' : 'ring-black'} ring-inset cursor-pointer
          flex items-center justify-between px-4`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`font-['Poppins'] font-medium text-[16px] ${
          value ? 'text-[rgba(81,33,143,1)]' : 'text-gray-400'
        }`}>
          {selectedLabel}
        </span>
        
        <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
            <path
              d="M1 1L7 7L13 1"
              stroke="#51218F"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 
          bg-white rounded-[12px] shadow-lg z-50
          ring-1 ring-black ring-inset max-h-60 overflow-y-auto">
          
          {options.map((option, index) => (
            <div
              key={option.value}
              className={`px-4 py-3 cursor-pointer transition-colors duration-200
                font-['Poppins'] font-medium text-[16px]
                hover:bg-[rgba(81,33,143,0.1)] ${
                  option.value === '' ? 'text-gray-400' : 'text-[rgba(81,33,143,1)]'
                } ${
                  value === option.value ? 'bg-[rgba(81,33,143,0.1)]' : ''
                } ${
                  index !== options.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
      {error && (
        <p className="text-red-500 text-sm mt-1 font-['Poppins']">{error}</p>
      )}
    </div>
  );
};

export default function CreatorRoleProfile() {
  const navigate = useNavigate();
  const { userData, fetchUserData } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);

  // State for all fields
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

  // Dropdown options
  const creatorCategoryOptions = [
    { value: "", label: "Select category" },
    { value: "uiux", label: "UI/UX designer" },
    { value: "photography", label: "Photography" },
    { value: "writing", label: "Writing" },
  ];

  const experienceOptions = [
    { value: "", label: "Select experience" },
    { value: "expert", label: "Expert" },
    { value: "intermediate", label: "Intermediate" },
    { value: "beginner", label: "Beginner" },
  ];

  const primaryNicheOptions = [
    { value: "", label: "Select primary" },
    { value: "art", label: "Art & design" },
    { value: "fashion", label: "Fashion" },
    { value: "tech", label: "Tech" },
  ];

  const secondaryNicheOptions = [
    { value: "", label: "None" },
    { value: "fashion", label: "Fashion" },
    { value: "lifestyle", label: "Lifestyle" },
    { value: "food", label: "Food" },
  ];

  const platformOptions = [
    { value: "", label: "Select platform" },
    { value: "instagram", label: "Instagram" },
    { value: "youtube", label: "YouTube" },
    { value: "tiktok", label: "TikTok" },
  ];

  const followersOptions = [
    { value: "", label: "Select range" },
    { value: "10000", label: "10000+" },
    { value: "5000", label: "5k–10k" },
    { value: "1000", label: "1k–5k" },
  ];

  const portfolioOptions = [
    { value: "", label: "Select portfolio" },
    { value: "ui", label: "UI designs" },
    { value: "branding", label: "Branding" },
    { value: "illustration", label: "Illustration" },
  ];

  const locationOptions = [
    { value: "", label: "Select location" },
    { value: "india", label: "India" },
    { value: "usa", label: "United States" },
    { value: "uk", label: "United Kingdom" },
    { value: "canada", label: "Canada" },
    { value: "australia", label: "Australia" },
    { value: "germany", label: "Germany" },
    { value: "france", label: "France" },
  ];

  const fileInputRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const profilePicInputRef = useRef(null);

  // Refs for focusing
  const nameRef = useRef(null);

  const MAX_IMAGE_SIZE_MB = 5;
  const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;


  function onFileChange(e) {
    const file = e.target.files && e.target.files[0];
    setUploadedFile(file || null);
    // Clear file upload error if file is selected
    if (file) {
      setErrors(prev => ({ ...prev, uploadedFile: "" }));
    }
  }

  function onProfilePicChange(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  // ✅ Size validation only (5 MB)
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    toast.error("Image size must be less than 5 MB", {
      position: "top-center",
      autoClose: 3000,
    });
    e.target.value = "";
    return;
  }

  // ✅ Valid file → preview & save
  setProfilePicFile(file);

  const reader = new FileReader();
  reader.onload = (event) => {
    setProfilePic(event.target.result);
  };
  reader.readAsDataURL(file);
}


  // Validate form function
  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = "Please enter your name";
    }
    if (!creatorCategory) {
      newErrors.creatorCategory = "Please select a creator category";
    }
    if (!experienceLevel) {
      newErrors.experienceLevel = "Please select your experience level";
    }
    if (!primaryNiche) {
      newErrors.primaryNiche = "Please select a primary niche";
    }
    if (!platform) {
      newErrors.platform = "Please select a platform";
    }
    if (!followers) {
      newErrors.followers = "Please select your follower range";
    }
    if (!portfolioCategory) {
      newErrors.portfolioCategory = "Please select a portfolio category";
    }
    if (!uploadedFile) {
      newErrors.uploadedFile = "Please upload at least one portfolio file";
    }
    if (!collabType) {
      newErrors.collabType = "Please select a collaboration type";
    }
    if (!projectType) {
      newErrors.projectType = "Please select a project type preference";
    }
    if (!location) {
      newErrors.location = "Please select your location";
    }
    
    return newErrors;
  };

  // Check if form is valid (for button state)
  const isFormValid = () => {
    return (
      name.trim() &&
      creatorCategory &&
      experienceLevel &&
      primaryNiche &&
      platform &&
      followers &&
      portfolioCategory &&
      uploadedFile &&
      collabType &&
      projectType &&
      location
    );
  };

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!userData || !userData.id) {
      toast.error("User not found. Please login again.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    
    // Validate form
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      
      // Show error toast for first error
      const firstErrorKey = Object.keys(validationErrors)[0];
      toast.error(validationErrors[firstErrorKey], {
        position: "top-center",
        autoClose: 3000,
      });
      
      // Scroll to first error field
      if (firstErrorKey === "name") {
        nameRef.current?.focus();
      }
      
      return;
    }
    
    // Clear errors
    setErrors({});
    
    // Set submitting state
    setIsSubmitting(true);
    
    try {
      // Show loading toast
      toast.info("Setting up your profile...", {
        position: "top-center",
        autoClose: false,
        toastId: "loading-toast",
      });
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add all form fields
      formData.append('creator_name', name);
      formData.append('creator_type', creatorCategory);
      formData.append('experience_level', experienceLevel);
      formData.append('primary_niche', primaryNiche);
      if (secondaryNiche && secondaryNiche !== "") {
        formData.append('secondary_niche', secondaryNiche);
      }
      if (platform) {
        formData.append('platforms', platform);
      }
      formData.append('followers', parseInt(followers) || 0);
      formData.append('portfolio_category', portfolioCategory);
      formData.append('collaboration_type', collabType);
      formData.append('project_type', projectType);
      if (location) {
        formData.append('location', location);
      }
      
      // Add portfolio file
      if (uploadedFile) {
        formData.append('portfolio_uploads', uploadedFile);
      }
      
      // Add profile picture if selected
      if (profilePicFile) {
        formData.append('profile_picture', profilePicFile);
      }
      
      // Make API call
      const response = await api.post(`/creator/save/${userData.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Close loading toast
      toast.dismiss("loading-toast");
      
      // Show success toast
      toast.success(response.data.message || "Profile created successfully!", {
  position: "top-center",
  autoClose: 1200,
});

// 🔥 IMPORTANT — refresh user context so role = creator is loaded
await fetchUserData();

navigate("/creator-role-success");

      
    } catch (error) {
      console.error('Error creating profile:', error);
      
      // Close loading toast
      toast.dismiss("loading-toast");
      
      let errorMessage = "Failed to create profile. Please try again.";
      
      if (error.response) {
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
      
      // Show error toast
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="relative mx-auto overflow-hidden w-full min-h-screen ">
      <ToastContainer />
      
      {/* Background image */}
      <img
        src={Slide1}
        alt=""
        className="absolute inset-0 w-full h-[1180px] -top-16 z-10 opacity-100 object-cover"
      />

      {/* Background Overlay */}
      <div className="absolute w-full h-full bg-[linear-gradient(180deg,#3D1768_0%,#030303_100%)] opacity-100 z-0" />

      {/* Centered card Container */}
      <div className="relative z-20 w-[95%] max-w-[878px] mx-auto mt-[150px] md:mt-[382px] shadow-xl rounded-[32px] p-[14px] bg-gradient-to-b from-[#6D2EFF]/70 to-[#431A85]/70">
        
        {/* Inner Card White Background */}
        <div className="w-full h-auto min-h-[1765px] rounded-[32px] bg-[rgba(255,255,255,1)] border border-black shadow-xl relative overflow-hidden pb-10">
          
          {/* Arrow button */}
          <button 
            onClick={() => navigate("/role-section")}
            className="absolute flex items-center justify-center w-[48px] h-[48px] top-[34px] left-[31px] rounded-[30px] border border-[rgba(138,56,245,0.2)] bg-[linear-gradient(180deg,rgba(3,3,3,0.9)_0%,rgba(81,33,143,0.9)_100%)] backdrop-blur-[90px] text-white cursor-pointer z-50"
          >
            <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
              <path d="M6 3L1 8L6 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 8H21" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          {/* HEADER SECTION */}
          <div className="flex flex-col items-center pt-24 md:pt-[28px] px-4">
            <h1 className="w-full text-3xl md:text-[48px] trochut-font font-bold leading-tight text-center bg-[linear-gradient(270deg,#3D1768_22.62%,#030303_100%)] bg-clip-text text-transparent">
              Talenta
            </h1>
            <h2 className="w-full text-2xl md:text-[42px] milonga-regular font-normal text-center bg-[linear-gradient(270deg,#3D1768_22.62%,#030303_100%)] bg-clip-text text-transparent">
              Set-up your creator profile
            </h2>
            <p className="w-full max-w-[666px] text-base md:text-[20px] poppins-font font-normal text-center leading-relaxed bg-[linear-gradient(270deg,#3D1768_22.62%,#030303_100%)] bg-clip-text text-transparent">
              Tell us more about your work so we can personalize the <br className="hidden md:block" /> collaboration for you
            </p>

            {/* Profile Image Section */}
            <div className="relative mt-4 md:mt-8 w-[200px] h-[200px]">
              <img 
                src={profilePic || Profilepic} 
                alt="profile" 
                className="w-full h-full rounded-full border-[3px] border-[#C8A7FF] object-cover"
              />
              <input 
                ref={profilePicInputRef}
                id="editImageInput" 
                type="file" 
                accept="image/*" 
                className="hidden"
                onChange={onProfilePicChange}
              />
              <button 
                onClick={() => profilePicInputRef.current?.click()} 
                className="absolute bottom-4 right-4 w-[24px] h-[24px] rounded-full flex items-center justify-center bg-white shadow-md hover:bg-gray-50"
              >
                <img src={Penicon} className="w-[24px] h-[24px]" alt="edit" />
              </button>
              <p className="mt-2 text-sm text-center font-['Poppins'] text-gray-600">
  Upload a profile picture. Max size: <span className="font-medium">5 MB</span>
</p>

            </div>
          </div>

          {/* FORM SECTION */}
          <form onSubmit={handleSubmit} className="w-full max-w-[636px] mx-auto mt-12 flex flex-col gap-[19px] px-4 md:px-0 z-[21]">
            
            {/* 1) Creator name */}
            <div className="w-full">
              <p className="font-['Poppins'] font-semibold text-xl md:text-[28px] leading-[100%] text-black mb-2">
                Creator name
              </p>
              <input
                ref={nameRef}
                type="text"
                placeholder="Enter your creator name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
                }}
                style={{
                  border: errors.name ? '2px solid #ef4444' : '1px solid #000'
                }}
                className="w-full h-[56px] rounded-[12px] px-4 font-['Poppins'] font-medium text-[16px] bg-white text-[rgba(81,33,143,1)] outline-none"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1 font-['Poppins']">{errors.name}</p>
              )}
            </div>

            {/* 2) Creator Type */}
            <div className="w-full mt-4">
              <div className="font-['Poppins'] font-semibold text-xl md:text-[28px] leading-[100%] text-black">
                Creator Type
              </div>
              <div className="flex flex-col md:flex-row items-start justify-between w-full mt-3 gap-4 md:gap-0">
                <div className="w-full md:w-[48%]">
                  <div className="font-['Poppins'] font-medium text-lg md:text-[24px] leading-[100%] text-black">
                    Creator Category
                  </div>
                  <div className="mt-2">
                    <CustomDropdown
                      value={creatorCategory}
                      onChange={(value) => {
                        setCreatorCategory(value);
                        if (errors.creatorCategory) setErrors(prev => ({ ...prev, creatorCategory: "" }));
                      }}
                      options={creatorCategoryOptions}
                      error={errors.creatorCategory}
                    />
                  </div>
                </div>

                <div className="w-full md:w-[48%]">
                  <div className="font-['Poppins'] font-medium text-lg md:text-[24px] leading-[100%] text-black">
                    Experience level
                  </div>
                  <div className="mt-2">
                    <CustomDropdown
                      value={experienceLevel}
                      onChange={(value) => {
                        setExperienceLevel(value);
                        if (errors.experienceLevel) setErrors(prev => ({ ...prev, experienceLevel: "" }));
                      }}
                      options={experienceOptions}
                      error={errors.experienceLevel}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <div className="font-['Poppins'] font-normal text-sm md:text-[17px] text-[rgba(81,33,143,1)]">
                  This helps us to personalize you experience
                </div>
              </div>
            </div>

            {/* 3) Niche / Specialty */}
            <div className="w-full mt-4">
              <div className="font-['Poppins'] font-semibold text-xl md:text-[28px] leading-[100%] text-black">
                Niche / Specialty
              </div>
              <div className="flex flex-col md:flex-row items-start justify-between w-full mt-3 gap-4 md:gap-0">
                <div className="w-full md:w-[48%]">
                  <div className="font-['Poppins'] font-medium text-lg md:text-[24px] leading-[100%] text-black">
                    Primary Niche
                  </div>
                  <div className="mt-2">
                    <CustomDropdown
                      value={primaryNiche}
                      onChange={(value) => {
                        setPrimaryNiche(value);
                        if (errors.primaryNiche) setErrors(prev => ({ ...prev, primaryNiche: "" }));
                      }}
                      options={primaryNicheOptions}
                      error={errors.primaryNiche}
                    />
                  </div>
                </div>

                <div className="w-full md:w-[48%]">
                  <div className="font-['Poppins'] font-medium text-lg md:text-[24px] leading-[100%] text-black">
                    Secondary Niche (opt)
                  </div>
                  <div className="mt-2">
                    <CustomDropdown
                      value={secondaryNiche}
                      onChange={setSecondaryNiche}
                      options={secondaryNicheOptions}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <p className="font-['Poppins'] text-sm md:text-[15px] text-[rgba(81,33,143,1)]">
                  This helps us to know where your content is focused
                </p>
              </div>
            </div>

            {/* 4) Audience stats */}
            <div className="w-full mt-4">
              <div className="font-['Poppins'] font-semibold text-xl md:text-[28px] leading-[100%] text-black">
                Audience stats
              </div>
              <div className="flex flex-col md:flex-row items-start justify-between w-full mt-3 gap-4 md:gap-0">
                <div className="w-full md:w-[48%]">
                  <div className="font-['Poppins'] font-medium text-lg md:text-[24px] leading-[100%] text-black">
                    Platforms
                  </div>
                  <div className="mt-2">
                    <CustomDropdown
                      value={platform}
                      onChange={(value) => {
                        setPlatform(value);
                        if (errors.platform) setErrors(prev => ({ ...prev, platform: "" }));
                      }}
                      options={platformOptions}
                      error={errors.platform}
                    />
                  </div>
                </div>

                <div className="w-full md:w-[48%]">
                  <div className="font-['Poppins'] font-medium text-lg md:text-[24px] leading-[100%] text-black">
                    Follower/subscribers
                  </div>
                  <div className="mt-2">
                    <CustomDropdown
                      value={followers}
                      onChange={(value) => {
                        setFollowers(value);
                        if (errors.followers) setErrors(prev => ({ ...prev, followers: "" }));
                      }}
                      options={followersOptions}
                      error={errors.followers}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <p className="font-['Poppins'] text-sm md:text-[15px] text-[rgba(81,33,143,1)]">
                  This helps collaborator under your reach you can update it anytime
                </p>
              </div>
            </div>

            {/* 5) Portfolio */}
            <div className="w-full mt-4">
              <div className="font-['Poppins'] font-semibold text-xl md:text-[28px] leading-[100%] text-black">
                Portfolio
              </div>
              <div className="flex flex-col md:flex-row items-start justify-between w-full mt-3 gap-4 md:gap-0">
                <div className="w-full md:w-[48%]">
                  <div className="font-['Poppins'] font-medium text-lg md:text-[24px] leading-[100%] text-black">
                    Portfolio category
                  </div>
                  <div className="mt-2">
                    <CustomDropdown
                      value={portfolioCategory}
                      onChange={(value) => {
                        setPortfolioCategory(value);
                        if (errors.portfolioCategory) setErrors(prev => ({ ...prev, portfolioCategory: "" }));
                      }}
                      options={portfolioOptions}
                      error={errors.portfolioCategory}
                    />
                  </div>
                </div>

                <div className="w-full md:w-[48%]">
                  <div className="font-['Poppins'] font-medium text-lg md:text-[24px] leading-[100%] text-black">
                    Upload
                  </div>

                  <div className="mt-2">
                    <input
                      ref={fileInputRef}
                      id="portfolio-upload"
                      type="file"
                      className="hidden"
                      onChange={onFileChange}
                    />
                    <label
                      htmlFor="portfolio-upload"
                      style={{
                        border: errors.uploadedFile ? '2px solid #ef4444' : '1px solid #000000'
                      }}
                      className="w-full h-[56px] rounded-[12px] font-['Poppins'] font-medium text-[16px] bg-white text-[rgba(81,33,143,1)] flex items-center px-4 cursor-pointer"
                    >
                      {uploadedFile ? uploadedFile.name : "Upload samples"}

                      {/* Upload SVG */}
                      <span className="ml-auto">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M12 4V16" stroke="#51218F" strokeWidth="2" strokeLinecap="round" />
                          <path d="M6 10L12 4L18 10" stroke="#51218F" strokeWidth="2" strokeLinecap="round" />
                          <path d="M6 20H18" stroke="#51218F" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </span>
                    </label>

                    {errors.uploadedFile && (
                      <p className="text-red-500 text-sm mt-1 font-['Poppins']">{errors.uploadedFile}</p>
                    )}
                  </div>
                </div>

              </div>
              <div className="mt-3">
                <p className="font-['Poppins'] text-sm md:text-[15px] text-[rgba(81,33,143,1)]">
                  This helps collaborator under your reach you can update it anytime
                </p>
              </div>
            </div>

            {/* 6) Preferences & Project type */}
            <div className="w-full flex flex-col md:flex-row items-start justify-between mt-4 gap-6 md:gap-0">
              <div className="w-full md:w-[48%]">
                <div className="font-['Poppins'] font-semibold text-xl md:text-[28px] leading-[100%] text-black">
                  Preferences
                </div>
                <div className="font-['Poppins'] font-medium text-lg md:text-[24px] leading-[100%] text-black mt-2">
                  Collaboration type
                </div>
                {errors.collabType && (
                  <p className="text-red-500 text-sm mt-1 font-['Poppins']">{errors.collabType}</p>
                )}
                <div className="mt-3 space-y-2">
                  <label className="flex items-center gap-3 font-['Poppins'] text-[16px]">
                    <input 
                      type="radio" 
                      name="collab" 
                      value="paid" 
                      checked={collabType === "paid"} 
                      onChange={() => {
                        setCollabType("paid");
                        if (errors.collabType) setErrors(prev => ({ ...prev, collabType: "" }));
                      }} 
                      className="accent-[#6F2DBD]"
                    />
                    Paid projects
                  </label>
                  <label className="flex items-center gap-3 font-['Poppins'] text-[16px]">
                    <input 
                      type="radio" 
                      name="collab" 
                      value="skills" 
                      checked={collabType === "skills"} 
                      onChange={() => {
                        setCollabType("skills");
                        if (errors.collabType) setErrors(prev => ({ ...prev, collabType: "" }));
                      }} 
                      className="accent-[#6F2DBD]"
                    />
                    Skills Exchange
                  </label>
                  <label className="flex items-center gap-3 font-['Poppins'] text-[16px]">
                    <input 
                      type="radio" 
                      name="collab" 
                      value="longterm" 
                      checked={collabType === "longterm"} 
                      onChange={() => {
                        setCollabType("longterm");
                        if (errors.collabType) setErrors(prev => ({ ...prev, collabType: "" }));
                      }} 
                      className="accent-[#6F2DBD]"
                    />
                    Long-Terms Partnerships
                  </label>
                </div>
              </div>

              <div className="w-full md:w-[48%]">
                <div className="font-['Poppins'] font-medium text-lg md:text-[24px] leading-[100%] text-black md:mt-9">
                  Project type you prefer
                </div>
                {errors.projectType && (
                  <p className="text-red-500 text-sm mt-1 font-['Poppins']">{errors.projectType}</p>
                )}
                <div className="mt-3 space-y-2">
                  <label className="flex items-center gap-3 font-['Poppins'] text-[16px]">
                    <input 
                      type="radio" 
                      name="project" 
                      value="long" 
                      checked={projectType === "long"} 
                      onChange={() => {
                        setProjectType("long");
                        if (errors.projectType) setErrors(prev => ({ ...prev, projectType: "" }));
                      }} 
                      className="accent-[#6F2DBD]"
                    />
                    Long term project
                  </label>
                  <label className="flex items-center gap-3 font-['Poppins'] text-[16px]">
                    <input 
                      type="radio" 
                      name="project" 
                      value="short" 
                      checked={projectType === "short"} 
                      onChange={() => {
                        setProjectType("short");
                        if (errors.projectType) setErrors(prev => ({ ...prev, projectType: "" }));
                      }} 
                      className="accent-[#6F2DBD]"
                    />
                    Short term project
                  </label>
                  <label className="flex items-center gap-3 font-['Poppins'] text-[16px]">
                    <input 
                      type="radio" 
                      name="project" 
                      value="one" 
                      checked={projectType === "one"} 
                      onChange={() => {
                        setProjectType("one");
                        if (errors.projectType) setErrors(prev => ({ ...prev, projectType: "" }));
                      }} 
                      className="accent-[#6F2DBD]"
                    />
                    One-Time task
                  </label>
                </div>
              </div>
            </div>

            {/* 7) Location */}
            <div className="w-full mt-4">
              <div className="font-['Poppins'] font-medium text-xl md:text-[24px] leading-[100%] text-black mb-2">
                Location
              </div>
              <div className="mt-2">
                <CustomDropdown
                  value={location}
                  onChange={(value) => {
                    setLocation(value);
                    if (errors.location) setErrors(prev => ({ ...prev, location: "" }));
                  }}
                  options={locationOptions}
                  error={errors.location}
                />
              </div>
            </div>

            {/* 8) Submit button */}
            <div className="w-full mt-4 mb-8">
              <button 
                type="submit" 
                disabled={!isFormValid() || isSubmitting || !userData.id}
                className={`w-full h-[48px] rounded-[24px] text-white font-['Poppins'] font-medium shadow-lg transition-all duration-300 ${
                  !isFormValid() || isSubmitting || !userData.id
                    ? 'bg-gray-400 cursor-not-allowed opacity-70'
                    : 'bg-gradient-to-r from-[#3D1768] via-[#5A2A86] to-[#000000] hover:opacity-90 hover:shadow-xl'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Setting up...
                  </div>
                ) : (
                  "Set up Your profile"
                )}
              </button>
              
              {/* Helper text showing validation status */}
              <div className="mt-2 text-center">
                {!userData.id ? (
                  <p className="text-amber-600 text-sm font-['Poppins']">
                    User not found. Please login again.
                  </p>
                ) : !isFormValid() ? (
                  <p className="text-amber-600 text-sm font-['Poppins']">
                    Please fill all required fields to continue
                  </p>
                ) : (
                  <p className="text-green-600 text-sm font-['Poppins']">
                    All fields are filled! You can now submit your profile.
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}