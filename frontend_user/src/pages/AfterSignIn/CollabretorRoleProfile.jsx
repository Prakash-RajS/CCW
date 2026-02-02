import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";  
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUser } from "../../contexts/userContext";
import api from "../../utils/axiosConfig";
import bgImage from "../../assets/landing/background.jpg";
import userImage from "../../assets/Landing/Profilepic.png";
import "../../App.css";

// Custom Dropdown Component with SVG and useEffect
const CustomDropdown = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select...",
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const dropdownRef = useRef(null);

  // Update selected label when value changes
  useEffect(() => {
    const selectedOption = options.find(opt => opt.value === value);
    setSelectedLabel(selectedOption ? selectedOption.label : placeholder);
  }, [value, options, placeholder]);

  // Close dropdown when clicking outside
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

  const handleSelect = (selectedValue, label) => {
    onChange(selectedValue);
    setSelectedLabel(label);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <div
        style={{
          border: error ? '2px solid #ef4444' : '1px solid #000000'
        }}
        className="w-full h-[56px] rounded-[12px] px-4 bg-white text-[#4C2E81] font-medium cursor-pointer flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? 'text-[#4C2E81]' : 'text-gray-400'}>
          {selectedLabel}
        </span>
        
        {/* SVG Arrow with rotation */}
        <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
            <path
              d="M1 1L7 7L13 1"
              stroke={error ? "#ef4444" : "#4C2E81"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-[12px] shadow-lg z-[1000] border-2 border-[#4C2E81] max-h-60 overflow-y-auto">
          {options.map((option, index) => (
            <div
              key={option.value || `option-${index}`}
              className={`px-4 py-3 cursor-pointer transition-colors duration-200 font-medium text-[16px] hover:bg-[rgba(76,46,129,0.1)] ${
                option.value === '' ? 'text-gray-400' : 'text-[#4C2E81]'
              } ${
                value === option.value ? 'bg-[rgba(76,46,129,0.1)]' : ''
              } ${
                index !== options.length - 1 ? 'border-b border-gray-100' : ''
              }`}
              onClick={() => handleSelect(option.value, option.label)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
      
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default function CollabretorRoleProfile() {
  const fileInputRef = React.useRef(null);
  const navigate = useNavigate(); 
  const { userData, fetchUserData } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [skills, setSkills] = useState("");
  
  // Add skill rating state
  const [skillRating, setSkillRating] = useState(80); // Initial 80%

  // State for all dropdowns
  const [language, setLanguage] = useState("");
  const [skillCategory, setSkillCategory] = useState("");
  const [experience, setExperience] = useState("");
  const [pricingType, setPricingType] = useState("");
  const [availability, setAvailability] = useState("");
  const [timing, setTiming] = useState("");
  const [portfolioCategory, setPortfolioCategory] = useState("");
  const [badge, setBadge] = useState("");
  const [location, setLocation] = useState("");
  
  // State for other fields
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [socialLink, setSocialLink] = useState("");
  const [aboutWord, setAboutWord] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);

  // Profile picture input ref
  const profilePicInputRef = useRef(null);

  // Dropdown options
  const languageOptions = [
    { value: "", label: "Select language" },
    { value: "english", label: "English" },
    { value: "hindi", label: "Hindi" },
    { value: "telugu", label: "Telugu" },
    { value: "tamil", label: "Tamil" },
  ];

  const skillCategoryOptions = [
    { value: "", label: "Select category" },
    { value: "ui", label: "UI designs" },
    { value: "frontend", label: "Front-end" },
    { value: "backend", label: "Back-end" },
    { value: "fullstack", label: "Full-stack" },
  ];

  const experienceOptions = [
    { value: "", label: "Select experience" },
    { value: "expert", label: "Expert" },
    { value: "intermediate", label: "Intermediate" },
    { value: "beginner", label: "Beginner" },
  ];

  const pricingTypeOptions = [
    { value: "", label: "Select type" },
    { value: "hourly", label: "Hourly" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  const availabilityOptions = [
    { value: "", label: "Select availability" },
    { value: "weekdays", label: "Monday to Friday" },
    { value: "weekends", label: "Weekends" },
    { value: "alldays", label: "All days" },
  ];

  const timingOptions = [
    { value: "", label: "Select timing" },
    { value: "9to6", label: "9:30am to 6:00pm IST" },
    { value: "10to7", label: "10:00am to 7:00pm IST" },
    { value: "11to8", label: "11:30am to 8:00pm IST" },
  ];

  const portfolioOptions = [
    { value: "", label: "Select category" },
    { value: "ui", label: "UI design" },
    { value: "web", label: "Web design" },
    { value: "branding", label: "Branding" },
  ];

  const badgeOptions = [
    { value: "", label: "Select badge" },
    { value: "top", label: "Top rated" },
    { value: "verified", label: "Verified" },
    { value: "popular", label: "Popular" },
    { value: "new", label: "New" },
  ];

  const locationOptions = [
    { value: "", label: "Select location" },
    { value: "india", label: "India" },
    { value: "usa", label: "USA" },
    { value: "uk", label: "UK" },
    { value: "canada", label: "Canada" },
  ];

  const MAX_IMAGE_SIZE_MB = 5;
  const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;


  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    setUploadedFile(file || null);
    if (file) {
      setErrors(prev => ({ ...prev, uploadedFile: "" }));
    }
  };

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


  // Handle star click
  const handleStarClick = (starIndex) => {
    const newStars = starIndex + 1; // starIndex is 0-4, we want 1-5
    const newPercentage = (newStars / 5) * 100;
    setSkillRating(newPercentage);
  };

  // Handle progress bar click
  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percentage = ((e.clientX - rect.left) / rect.width) * 100;
    setSkillRating(Math.min(Math.max(percentage, 0), 100));
  };

  // Validate form function
  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = "Please enter your name";
    }
    if (!skillCategory) {
      newErrors.skillCategory = "Please select a skill category";
    }
    if (!experience) {
      newErrors.experience = "Please select your experience level";
    }
    if (!pricingType) {
      newErrors.pricingType = "Please select a pricing type";
    }
    if (!price.trim()) {
      newErrors.price = "Please enter your price";
    }
    if (!portfolioCategory) {
      newErrors.portfolioCategory = "Please select a portfolio category";
    }
    if (!uploadedFile) {
      newErrors.uploadedFile = "Please upload portfolio samples";
    }
    if (!location) {
      newErrors.location = "Please select your location";
    }
    
    return newErrors;
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      name.trim() &&
      skillCategory &&
      experience &&
      pricingType &&
      price.trim() &&
      portfolioCategory &&
      uploadedFile &&
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
    
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      
      const firstErrorKey = Object.keys(validationErrors)[0];
      toast.error(validationErrors[firstErrorKey], {
        position: "top-center",
        autoClose: 3000,
      });
      
      return;
    }
    
    setErrors({});
    setIsSubmitting(true);
    
    try {
      toast.info("Setting up your profile...", {
        position: "top-center",
        autoClose: false,
        toastId: "loading-toast",
      });
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add all form fields
      formData.append('name', name);
      if (language) {
        formData.append('language', language);
      }
      formData.append('skill_category', skillCategory);
      formData.append('experience', experience);
      
      // Parse skills from skills input field
      if (skills.trim()) {
        const skillsArray = skills.split(',').map(skill => skill.trim()).filter(skill => skill);
        formData.append('skills', skillsArray.join(','));
      }
      
      formData.append('pricing_unit', pricingType);
      formData.append('pricing_amount', parseFloat(price) || 0);
      
      if (availability) {
        formData.append('availability', availability);
      }
      if (timing) {
        formData.append('timing', timing);
      }
      if (portfolioCategory) {
        formData.append('portfolio_category', portfolioCategory);
      }
      if (socialLink) {
        formData.append('social_link', socialLink);
      }
      if (badge) {
        formData.append('badges', badge);
      }
      if (aboutWord) {
        formData.append('about', aboutWord);
      }
      formData.append('location', location);
      formData.append('skills_rating', Math.round(skillRating));
      
      // Add portfolio file
      if (uploadedFile) {
        formData.append('portfolio_uploads', uploadedFile);
      }
      
      // Add profile picture if selected
      if (profilePicFile) {
        formData.append('profile_picture', profilePicFile);
      }
      
      // Make API call
      const response = await api.post(`/collaborator/save/${userData.id}`, formData, {
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

navigate("/collaborator-role-success");

      
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
    <div
      className="relative mx-auto overflow-hidden w-full h-[2293px]"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <ToastContainer />
      
      {/* BACKGROUND IMAGE */}
      <img
        src={bgImage}
        alt="bg"
        className="absolute top-[-16px] w-full h-[993px] object-cover"
      />

      {/* BOTTOM GRADIENT */}
      <div className="absolute top-[977px] w-full h-[1428px] bg-gradient-to-b from-[#3B0B59] to-[#120026]" />

      {/* OUTER PURPLE BORDER */}
      <div className="absolute top-[268px] w-full flex justify-center px-4">
        <div className="rounded-[40px] p-[3px] bg-gradient-to-b from-[#6D2EFF] to-[#431A85] w-[834px]">

          {/* WHITE MAIN CARD */}
          <div className="bg-white w-[812px] h-[1703px] ml-2 mr-20 mt-2 mb-2 rounded-[42px] border border-black shadow-xl relative">

            {/* HEADER SECTION */}
            <div className="absolute w-[666px] top-[60px] left-[84px] flex flex-col items-center">
              
              <button
                onClick={() => navigate("/role-section")}
                className="absolute left-[-60px] top-[-5px] w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-[#6D2EFF] to-[#431A85] shadow-md text-white hover:scale-105 transition-transform"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 5 12 12 19" />
                </svg>
              </button>

              <h1 className="text-[36px] font-bold text-[#4C2E81]" style={{ fontFamily: "Playfair Display, serif" }}>
                Talenta
              </h1>

              <p className="text-[28px] text-[#4C2E81] leading-tight" style={{ fontFamily: "Playfair Display, serif" }}>
                Set-up your collaborate profile
              </p>

              <p className="text-[16px] text-[#6B6B6B] font-medium text-center">
                Complete your profile set up details and start <br />
                getting hired by creators
              </p>
            </div>

            {/* PROFILE PHOTO */}
<div className="absolute top-[220px] left-1/2 transform -translate-x-1/2">
  <div className="relative flex flex-col items-center">
    
    <div className="relative">
      <img 
        src={profilePic || userImage} 
        alt="profile" 
        className="w-[120px] h-[120px] rounded-full border-[4px] border-[#C8A7FF] object-cover" 
      />

      <input 
        ref={profilePicInputRef}
        id="editImageInput" 
        type="file" 
        accept="image/*"
        className="hidden"
        onChange={onProfilePicChange}
      />

      <div 
        onClick={() => profilePicInputRef.current?.click()} 
        className="absolute bottom-0 right-2 w-7 h-7 rounded-full bg-[#7A3EFF] text-white flex items-center justify-center text-sm cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 24 24">
          <path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM21.71 6.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" />
        </svg>
      </div>
    </div>

    {/* ✅ HELP TEXT */}
    <p className="mt-2 text-sm text-center font-['Poppins'] text-gray-600">
      Upload a profile photo (max <span className="font-medium">5 MB</span>)
    </p>

  </div>
</div>


            {/* FORM SECTION */}
            <form onSubmit={handleSubmit} className="absolute top-[380px] w-full left-0 px-[68px] pb-10">
              
              <div className="flex justify-between mb-8 gap-4">
                {/* NAME (Required) */}
                <div className="w-[48%]">
                  <p className="text-black font-semibold mb-2">
                    Name <span className="text-red-600">*</span>
                  </p>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      // Allow only letters and spaces
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                      setName(value);
                      if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
                    }}
                    placeholder="Sandeep"
                    style={{ 
                      border: errors.name ? '2px solid #ef4444' : '1px solid #000000'
                    }}
                    className="w-full h-[56px] rounded-[12px] px-4 bg-white text-[#4C2E81] font-medium outline-none"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* LANGUAGE */}
                <div className="w-[48%]">
                  <p className="text-black font-semibold mb-2">Language</p>
                  <CustomDropdown
                    value={language}
                    onChange={setLanguage}
                    options={languageOptions}
                  />
                </div>
              </div>

              {/* SKILLS INPUT */}
              <div className="mb-4">
                <p className="text-black font-semibold mb-2">Skills (comma separated)</p>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g., Python, React, JavaScript, UI/UX Design"
                  style={{ 
                    border: '1px solid #000000'
                  }}
                  className="w-full h-[56px] rounded-[12px] px-4 bg-white text-[#4C2E81] font-medium outline-none"
                />
              </div>

              {/* SKILLS & EXPERTISE */}
              <p className="text-black text-xl font-semibold mb-2">Skills & Expertise</p>
              <div className="flex justify-between mb-8">
                <div className="w-[48%]">
                  <p className="text-[13px] text-black font-semibold mb-2">Skill Category <span className="text-red-600">*</span></p>
                  <CustomDropdown
                    value={skillCategory}
                    onChange={(value) => {
                      setSkillCategory(value);
                      if (errors.skillCategory) setErrors(prev => ({ ...prev, skillCategory: "" }));
                    }}
                    options={skillCategoryOptions}
                    error={errors.skillCategory}
                  />
                  <p className="text-[13px] text-[#6B6B6B] mt-1">
                    This helps us about your skills and your experience
                  </p>
                </div>

                <div className="w-[48%]">
                  <p className="text-[13px] text-black font-semibold mb-2">Experience <span className="text-red-600">*</span></p>
                  <CustomDropdown
                    value={experience}
                    onChange={(value) => {
                      setExperience(value);
                      if (errors.experience) setErrors(prev => ({ ...prev, experience: "" }));
                    }}
                    options={experienceOptions}
                    error={errors.experience}
                  />
                </div>
              </div>

              <p className="text-black text-lg font-semibold mb-2">
                Pricing <span className="text-red-600">*</span>
              </p>
              <div className="flex justify-between gap-4 mb-4 w-full">
                <div className="w-[48%]">
                  <CustomDropdown
                    value={pricingType}
                    onChange={(value) => {
                      setPricingType(value);
                      if (errors.pricingType) setErrors(prev => ({ ...prev, pricingType: "" }));
                    }}
                    options={pricingTypeOptions}
                    error={errors.pricingType}
                  />
                </div>

                {/* PRICE INPUT REQUIRED */}
                <div className="w-[48%]">
                  <div style={{ 
                    border: errors.price ? '2px solid #ef4444' : '1px solid #000000'
                  }} className="w-full h-[56px] rounded-[12px] px-4 flex items-center justify-between bg-white text-[#4C2E81] font-medium">
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => {
                        setPrice(e.target.value);
                        if (errors.price) setErrors(prev => ({ ...prev, price: "" }));
                      }}
                      placeholder="300"
                      style={{ border: 'none' }}
                      className="w-[70%] outline-none bg-transparent text-[#4C2E81]"
                    />
                    <span>{pricingType === 'hourly' ? '/hour' : pricingType === 'weekly' ? '/week' : '/month'}</span>
                  </div>
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>
              </div>
              <p className="text-[13px] text-[#6B6B6B] mb-8">This helps us to know the pricing</p>

              {/* AVAILABILITY */}
              <p className="text-black text-xl font-semibold mb-1">Availability</p>
              <div className="flex justify-between mb-8">
                <div className="w-[48%]">
                  <p className="text-[13px] font-semibold mb-2">Availability</p>
                  <CustomDropdown
                    value={availability}
                    onChange={setAvailability}
                    options={availabilityOptions}
                  />
                </div>

                <div className="w-[48%]">
                  <p className="text-[13px] font-semibold mb-2">Timing</p>
                  <CustomDropdown
                    value={timing}
                    onChange={setTiming}
                    options={timingOptions}
                  />
                </div>
              </div>

              {/* SOCIAL */}
              <p className="text-black text-xl font-semibold mb-1">Social / Portfolio</p>
              <div className="flex justify-between mb-6">
                <div className="w-[48%]">
                  <p className="text-[13px] font-semibold mb-2">Portfolio category <span className="text-red-600">*</span></p>
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

                <div className="w-[48%]">
                  <p className="text-[13px] font-semibold mb-2">
                    Upload <span className="text-red-600">*</span>
                  </p>

                  <input
                    ref={fileInputRef}
                    id="fileUploadInput"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <button
                    type="button"
                    onClick={handleUploadClick}
                    style={{
                      border: errors.uploadedFile ? '2px solid #ef4444' : '1px solid #000000',
                    }}
                    className="w-full h-[56px] rounded-[12px] px-4 flex justify-between items-center bg-white text-[#4C2E81] font-medium"
                  >
                    {uploadedFile ? uploadedFile.name : "Upload samples"}

                    {/* Upload SVG - NOT BOLD */}
                    <span className="ml-3">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M12 5V15" stroke="#4C2E81" strokeWidth="2" strokeLinecap="round" />
                        <path d="M7 10L12 5L17 10" stroke="#4C2E81" strokeWidth="2" strokeLinecap="round" />
                        <path d="M6 19H18" stroke="#4C2E81" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </span>
                  </button>

                  {errors.uploadedFile && (
                    <p className="text-red-500 text-sm mt-1">{errors.uploadedFile}</p>
                  )}
                </div>
              </div>

              {/* LINK */}
              <div className="mb-8">
                <p className="text-black font-semibold mb-2">Social media / Portfolio link</p>
                <input
                  type="text"
                  value={socialLink}
                  onChange={(e) => setSocialLink(e.target.value)}
                  placeholder="https://dribbble.com/"
                  style={{ 
                    border: '1px solid #000000'
                  }}
                  className="w-full h-[56px] rounded-[12px] px-4 bg-white text-[#4C2E81] font-medium outline-none"
                />
              </div>

              {/* BADGES + SKILLS */}
              <div className="flex justify-between mb-8">
                <div className="w-[45%]">
                  <p className="text-black font-semibold mb-2">Badges</p>
                  <div className="space-y-2 text-[#4C2E81] text-[15px] font-medium">
                    {badgeOptions.filter(opt => opt.value !== "").map((option) => (
                      <label key={option.value} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="badge"
                          value={option.value}
                          checked={badge === option.value}
                          onChange={() => setBadge(option.value)}
                          className="accent-[#4C2E81]"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* SKILL RATING - CLICKABLE VERSION */}
                <div className="w-[50%]">
                  <p className="text-black font-semibold mb-2">Skills rating</p>

                  {/* Clickable Stars */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const currentStars = Math.round((skillRating / 100) * 5);
                        const isFilled = currentStars >= star;
                        
                        return (
                          <button
                            key={star}
                            type="button"
                            className="text-[22px] text-[#4C2E81] leading-none p-1 hover:text-purple-700 transition-colors"
                            onClick={() => handleStarClick(star - 1)}
                            aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                          >
                            {isFilled ? '★' : '☆'}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[#4C2E81] text-sm font-medium">{Math.round(skillRating)}%</p>
                  </div>

                  {/* Clickable Progress Bar */}
                  <div 
                    className="w-full h-[6px] bg-[#E3D5FF] rounded-full mb-4 cursor-pointer relative group"
                    onClick={handleProgressClick}
                  >
                    <div 
                      className="h-full bg-[#4C2E81] rounded-full transition-all duration-200"
                      style={{ width: `${skillRating}%` }}
                    />
                    
                    {/* Hover Tooltip */}
                    <div className="absolute top-[-30px] left-1/2 transform -translate-x-1/2 bg-[#4C2E81] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      Click to adjust: {Math.round(skillRating)}%
                    </div>
                  </div>

                  <p className="text-black font-semibold mb-2">About you in one word</p>
                  <input
                    type="text"
                    value={aboutWord}
                    onChange={(e) => setAboutWord(e.target.value)}
                    placeholder="I am professional and very talented..."
                    style={{ 
                      border: '1px solid #000000'
                    }}
                    className="w-full h-[56px] rounded-[12px] px-4 bg-white text-[#4C2E81] font-medium outline-none"
                  />
                </div>
              </div>

              {/* LOCATION (Required) */}
              <div className="mb-10">
                <p className="text-black font-semibold mb-2">
                  Location <span className="text-red-600">*</span>
                </p>
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

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={!isFormValid() || isSubmitting || !userData.id}
                style={{
                  border: 'none'
                }}
                className={`w-full py-4 rounded-[24px] text-white text-lg font-semibold transition-all duration-300 ${
                  !isFormValid() || isSubmitting || !userData.id
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#6D2EFF] to-[#120026] hover:opacity-90'
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

              {/* Validation status */}
              <div className="mt-2 text-center">
                {!userData.id ? (
                  <p className="text-amber-600 text-sm">
                    User not found. Please login again.
                  </p>
                ) : !isFormValid() ? (
                  <p className="text-amber-600 text-sm">
                    Please fill all required fields (marked with *) to continue
                  </p>
                ) : (
                  <p className="text-green-600 text-sm">
                    All required fields are filled! You can now submit your profile.
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}