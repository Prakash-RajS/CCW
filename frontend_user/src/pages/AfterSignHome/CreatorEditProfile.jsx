import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import TopBanner from "../../assets/Colabwork/banner.png";
import DefaultProfilePic from "../../assets/Colabwork/Rectangle71.png";
import FlagImg from "../../assets/Colabwork/usa-flag.png";
import ReviewUser1 from "../../assets/Colabwork/review-user-1.png";
import ReviewUser2 from "../../assets/Colabwork/review-user-2.png";
// import EditIcon from "../../assets/Colabwork/edit-icon.png";
import Header from "../../component/Header";
import Footer from "../../component/Footer";
import { useUser } from "../../contexts/UserContext";
import api from "../../utils/axiosConfig";
import { useNavigate } from "react-router-dom";
import toast from "../../component/Toast";
import Success from "../../assets/Auth/Succes.png";

// ========== CUSTOM CONFIRM MODAL (same as ColabProfile) ==========
function ConfirmModal({ open, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999999]" onClick={onCancel} />
      <div className="fixed inset-0 z-[1000000] flex items-center justify-center p-4">
        <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[420px] p-8 flex flex-col items-center gap-5 border border-purple-100">
          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          {/* Title */}
          <h3 className="text-[20px] font-semibold text-[#2A1E17] text-center">Confirm Delete</h3>
          {/* Message */}
          <p className="text-[14px] text-gray-500 text-center leading-relaxed">{message}</p>
          {/* Buttons */}
          <div className="flex gap-3 w-full mt-1">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-2.5 rounded-full border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-2.5 rounded-full bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function CreatorEditProfile() {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [MyProjectValue, setMyProjectValue] = useState("My Project");
  const [editOpen, setEditOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [fileName, setFileName] = useState("No file chosen");
  const [showEdit, setShowEdit] = useState(false);
  const [editingPortfolioItem, setEditingPortfolioItem] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPortfolio, setIsSavingPortfolio] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); 
  const [rateLimitError, setRateLimitError] = useState("");

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState({ open: false, message: "", onConfirm: null });

  const showConfirm = (message, onConfirm) => {
    setConfirmModal({ open: true, message, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmModal({ open: false, message: "", onConfirm: null });
  };

  // Predefined skills array for search (expanded list)
  const allSkills = [
    "User Interface Design",
    "Graphics Design",
    "Logo Design",
    "Animation",
    "Branding",
    "Web Design",
    "UI/UX Design",
    "Graphic Design",
    "Logo Design",
    "Branding",
    "Frontend Development",
    "Backend Development",
    "Full Stack Development",
    "React",
    "Angular",
    "Vue.js",
    "Node.js",
    "Python",
    "JavaScript",
    "TypeScript",
    "Mobile Development",
    "iOS",
    "Android",
    "React Native",
    "Flutter",
    "Data Science",
    "Machine Learning",
    "AI",
    "Database Design",
    "DevOps",
    "Cloud Computing",
    "AWS",
    "Azure",
    "SEO",
    "Digital Marketing",
    "Content Writing",
    "Copywriting",
    "Translation",
    "Video Editing",
    "Photography",
    "Illustration",
    "3D Modeling",
    "Animation",
    "Project Management",
    "Business Analysis",
    "QA Testing",
    "Cybersecurity",
  ];

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [creatorSkills, setCreatorSkills] = useState([]);
  const [isSkillsLoading, setIsSkillsLoading] = useState(true);
  const [showPortfolioPopup, setShowPortfolioPopup] = useState(false);
  const [showReviewsPopup, setShowReviewsPopup] = useState(false);
  const [tempSelectedSkills, setTempSelectedSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState("");

  // SKILLS SEARCH STATE
  const [currentSkill, setCurrentSkill] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Portfolio pagination state
  const [portfolioCurrentPage, setPortfolioCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Portfolio validation states
  const [portfolioValidationErrors, setPortfolioValidationErrors] = useState({
    title: "",
    file: "",
    description: "",
  });

  // ========== LEVENSHTEIN DISTANCE FUNCTION FOR EMAIL VALIDATION ==========
function levenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function isSimilarEmail(email1, email2, threshold = 2) {
  if (!email1 || !email2) return false;
  const distance = levenshteinDistance(email1.toLowerCase(), email2.toLowerCase());
  return distance <= threshold;
}

  // Profile states
  const [profileData, setProfileData] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // Portfolio states
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userData, loading: userLoading, updateUserData } = useUser();

  // Reviews states
  const [reviewStats, setReviewStats] = useState({
    avg_rating: 0,
    total_reviews: 0,
  });
  const [latestReviews, setLatestReviews] = useState([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);
  const [allReviews, setAllReviews] = useState([]);

  // Edit form state
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "", 
    about: "",
    state: "",
    country: "",
    phone_number: "",
    profile_picture: null,
  });

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({
    full_name: "",
    email: "",
    state: "",
    country: "",
    phone_number: "",
    profile_picture: "",
    about: "",
  });

  // Track touched fields for validation
  const [touchedFields, setTouchedFields] = useState({
    full_name: false,
    email: false, 
    state: false,
    country: false,
    phone_number: false,
    profile_picture: false,
    about: false,
  });

  // ========== VERIFICATION STATES (UPDATED FOR STATELESS JWT) ==========
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showPhonePopup, setShowPhonePopup] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [showOTPPopup, setShowOTPPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [currentVerificationType, setCurrentVerificationType] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTime, setResendTime] = useState(45);
  const [currentUser, setCurrentUser] = useState(null);
  const [showEmailSetupPopup, setShowEmailSetupPopup] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  // NEW: Store OTP tokens for stateless verification
  const [otpToken, setOtpToken] = useState("");
  const [cooldownToken, setCooldownToken] = useState("");

  const toggleDropdown = (menu) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  // Character limit constants
  const MAX_NAME_LENGTH = 50;
  const MAX_LOCATION_LENGTH = 20;
  const MAX_DESCRIPTION_LENGTH = 200;

  // Validation functions
  const validateAlphabets = (value) => {
    if (!value) return true; // Empty is handled by required validation
    return /^[A-Za-z\s]+$/.test(value);
  };

  // ========== EMAIL VALIDATION WITH LEVENSHTEIN ==========
const validateEmailWithSuggestions = (
  emailValue
) => {
  if (!emailValue?.trim()) {
    return {
      isValid: true,
      error: "",
      suggestion: null,
    };
  }

  const trimmedEmail =
    emailValue.trim().toLowerCase();

  // User still typing
  if (
    !trimmedEmail.includes("@") ||
    trimmedEmail.endsWith("@") ||
    trimmedEmail.endsWith(".")
  ) {
    return {
      isValid: true,
      error: "",
      suggestion: null,
    };
  }

  const emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (emailRegex.test(trimmedEmail)) {
    return {
      isValid: true,
      error: "",
      suggestion: null,
    };
  }

  const [localPart, domain] =
    trimmedEmail.split("@");

  const commonDomains = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "icloud.com",
    "protonmail.com",
    "live.com",
  ];

  let bestMatch = null;
  let smallestDistance = Infinity;

  for (const commonDomain of commonDomains) {
    const distance =
      levenshteinDistance(
        domain,
        commonDomain
      );

    if (distance < smallestDistance) {
      smallestDistance = distance;
      bestMatch = commonDomain;
    }
  }

  if (
    bestMatch &&
    smallestDistance <= 2
  ) {
    return {
      isValid: false,
      error: "Invalid email format",
      suggestion: `${localPart}@${bestMatch}`,
    };
  }

  return {
    isValid: false,
    error: "Please enter a valid email address",
    suggestion: null,
  };
};

  const validateLength = (value, maxLength) => {
    if (!value) return "";
    if (value.length > maxLength) {
      return `Maximum ${maxLength} characters allowed`;
    }
    return "";
  };

  const validatePhoneNumber = (value) => {
    if (!value) return "";
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 0) return "";
    if (cleaned.length !== 10) {
      return "Please enter a valid 10-digit phone number";
    }
    return "";
  };

  const validateWorkName = (value) => {
    if (!value.trim()) return "Work name is required";
    if (value.length > MAX_NAME_LENGTH) {
      return `Work name should be less than ${MAX_NAME_LENGTH} characters`;
    }
    // Check for numbers and special characters
    if (!/^[A-Za-z\s]+$/.test(value)) {
      return "Work name should only contain letters and spaces";
    }
    return "";
  };

  const validateUrl = (url) => {
    if (!url || !url.trim()) return "";

    const trimmedUrl = url.trim();

    // Check if it's a valid URL format
    // More comprehensive regex that handles modern URLs
    const urlPattern = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+)(:[0-9]{1,5})?(\/[^\s]*)?(\?[^\s]*)?(#[^\s]*)?$/;

    if (!urlPattern.test(trimmedUrl)) {
      // Provide specific error messages based on common issues
      if (!trimmedUrl.includes('.')) {
        return "URL must contain a domain extension (e.g., .com, .org)";
      }
      if (trimmedUrl.includes(' ')) {
        return "URL cannot contain spaces";
      }
      if (trimmedUrl.match(/[^a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]/)) {
        return "URL contains invalid characters";
      }
      return "Please enter a valid URL (e.g., https://example.com)";
    }

    return "";
  };

  const isValidGmail = (email) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;
    const domain = email.toLowerCase().split("@")[1];
    return domain === "gmail.com";
  };
  const validateImageType = (file) => {
  if (!file) return "Please upload a media file";
  
  const fileExtension = file.name.split('.').pop().toLowerCase();
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const allowedExtensions = ["jpg", "jpeg", "png", "webp"];
  
  if (!allowedTypes.includes(file.type) || !allowedExtensions.includes(fileExtension)) {
    return "Only JPG, JPEG, PNG, and WEBP image files are allowed";
  }
  
  return "";
};
  const validateFileSize = (file) => {
  if (!file) return "Please upload a media file";

  // Check for empty file (0 bytes)
  if (file.size === 0) {
    return "File is empty. Please upload a valid file with minimum 100KB size";
  }

  // Check minimum size (100KB = 102400 bytes)
  const minSize = 100 * 1024; // 100KB in bytes
  if (file.size < minSize) {
    return `File size must be at least 100KB. Current file size: ${(file.size / 1024).toFixed(2)}KB`;
  }

  // Check maximum size (50MB = 52428800 bytes)
  const maxSize = 50 * 1024 * 1024; // 50MB in bytes
  if (file.size > maxSize) {
    return `File size must be less than 50MB. Current file size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`;
  }

  return "";
};

  const validateFileRequired = (file, existingFile = null) => {
    if (!file && !existingFile) return "Please upload a media file";
    return "";
  };

  const validateProfilePicture = (file) => {
    if (!file) return true;

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return false; // Will handle error message separately
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return false;
    }

    return true;
  };

  const validateRequired = (value) => {
    return value && value.trim().length > 0;
  };

  const isValidSkill = (value) => {
    return /^[A-Za-z\s]+$/.test(value);
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSaveEmail = async () => {
    if (!isValidEmail(newEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSavingEmail(true);
    try {
      const response = await api.put(`/creator/edit/${userData.id}`, {
        email: newEmail,
      });

      if (response.data.status === "success") {
        setEmail(newEmail);
        setShowEmailSetupPopup(false);
        toast.success("Email added successfully!");
        await fetchProfileData();
        await fetchUserData();
        setCurrentVerificationType("email");
        setShowEmailPopup(true);
      }
    } catch (error) {
      console.error("Error saving email:", error);
      toast.error(error.response?.data?.detail || "Failed to save email");
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleInputChange = (field, value) => {
  let error = "";

  if (field === "full_name") {
    if (!validateRequired(value)) {
      error = "Full name is required";
    } else if (value.length > MAX_NAME_LENGTH) {
      error = `Full name should be less than ${MAX_NAME_LENGTH} characters`;
    } else if (!validateAlphabets(value)) {
      error = "Full name should only contain letters and spaces";
    }
    } else if (field === "email") {
  error = "";
} else if (field === "state") {
    if (!validateRequired(value)) {
      error = "State is required";
    } else if (value.length > MAX_LOCATION_LENGTH) {
      error = `State should be less than ${MAX_LOCATION_LENGTH} characters`;
    } else if (!validateAlphabets(value)) {
      error = "State should only contain letters and spaces";
    }
  } else if (field === "country") {
    if (!validateRequired(value)) {
      error = "Country is required";
    } else if (value.length > MAX_LOCATION_LENGTH) {
      error = `Country should be less than ${MAX_LOCATION_LENGTH} characters`;
    } else if (!validateAlphabets(value)) {
      error = "Country should only contain letters and spaces";
    }
  } else if (field === "phone_number") {
    if (!validateRequired(value)) {
      error = "Phone number is required";
    } else {
      error = validatePhoneNumber(value);
    }
  } else if (field === "about") {
    error = validateLength(value, MAX_DESCRIPTION_LENGTH);
  }

  setEditForm({ ...editForm, [field]: value });
  setValidationErrors({ ...validationErrors, [field]: error });
  setTouchedFields((prev) => ({ ...prev, [field]: true }));
};

const handleEmailBlur = () => {
  const emailValue = editForm.email?.trim();

  if (!emailValue) {
    setValidationErrors(prev => ({
      ...prev,
      email: "",
    }));
    return;
  }

  const validation =
    validateEmailWithSuggestions(emailValue);

  setValidationErrors(prev => ({
    ...prev,
    email: validation.error,
  }));

  if (
    validation.suggestion &&
    validation.suggestion !== emailValue
  ) {
    toast.warning(
      `Did you mean "${validation.suggestion}"?`,
      {
        duration: 5000,
        action: {
          label: "Use this",
          onClick: () => {
            setEditForm(prev => ({
              ...prev,
              email: validation.suggestion,
            }));

            setValidationErrors(prev => ({
              ...prev,
              email: "",
            }));
          },
        },
      }
    );
  }
};

  const handlePortfolioTitleChange = (value, isEdit = false) => {
    const error = validateWorkName(value);
    if (isEdit) {
      setEditPortfolioForm((prev) => ({ ...prev, title: value }));
    } else {
      setPortfolioForm((prev) => ({ ...prev, title: value }));
    }
    setPortfolioValidationErrors((prev) => ({ ...prev, title: error }));
  };

  const handlePortfolioFileChange = (file, isEdit = false) => {
    if (isEdit) {
      setEditPortfolioForm((prev) => ({ ...prev, file }));
    } else {
      setPortfolioForm((prev) => ({ ...prev, file }));
    }
    setPortfolioValidationErrors((prev) => ({ ...prev, file: "" }));
  };

  const handlePortfolioDescriptionChange = (value, isEdit = false) => {
    let error = "";
    if (value && value.length > MAX_DESCRIPTION_LENGTH) {
      error = `Description should be less than ${MAX_DESCRIPTION_LENGTH} characters`;
    }
    if (isEdit) {
      setEditPortfolioForm((prev) => ({ ...prev, description: value }));
    } else {
      setPortfolioForm((prev) => ({ ...prev, description: value }));
    }
    setPortfolioValidationErrors((prev) => ({ ...prev, description: error }));
  };

  const getPortfolioImage = (item) => {
    // Check if file is a full URL (S3 presigned URL)
    if (item.file_url) {
      // If it starts with http, it's already a full URL
      if (item.file_url.startsWith('http://') || item.file_url.startsWith('https://')) {
        return item.file_url;
      }
      // Otherwise, it's a relative path
      return `${import.meta.env.VITE_API_BASE_URL}${item.file_url}`;
    }
    
    // Check file property (for backward compatibility)
    if (item.file) {
      if (item.file.startsWith('http://') || item.file.startsWith('https://')) {
        return item.file;
      }
      return `${import.meta.env.VITE_API_BASE_URL}${item.file}`;
    }
    
    // Use media_link if available
    if (item.media_link) {
      return item.media_link;
    }
    
    // Default fallback
    return DefaultProfilePic;
  };


  const handlePortfolioUrlChange = (value, isEdit = false) => {
    const error = validateUrl(value);
    if (isEdit) {
      setEditPortfolioForm((prev) => ({ ...prev, media_link: value }));
    } else {
      setPortfolioForm((prev) => ({ ...prev, media_link: value }));
    }
    setPortfolioValidationErrors((prev) => ({ ...prev, media_link: error }));
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

    return (
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <svg
            key={`full-${i}`}
            className="w-4 h-4 text-[#FFB800]"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        {hasHalf && (
          <svg
            className="w-4 h-4 text-[#FFB800]"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg
            key={`empty-${i}`}
            className="w-4 h-4 text-gray-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const handleBlur = (field) => {
    setTouchedFields({ ...touchedFields, [field]: true });
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type first
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        const error = "Only JPG, JPEG, and PNG files are allowed";
        setValidationErrors({ ...validationErrors, profile_picture: error });
        toast.error(error);
        e.target.value = ''; // Clear the input
        return;
      }

      // Check file size
      if (!validateProfilePicture(file)) {
        const error = "File size should be less than 5MB";
        setValidationErrors({ ...validationErrors, profile_picture: error });
        toast.error(error);
        e.target.value = ''; // Clear the input
        return;
      }

      setValidationErrors({ ...validationErrors, profile_picture: "" });
      setEditForm((prev) => ({ ...prev, profile_picture: file }));
      setTouchedFields({ ...touchedFields, profile_picture: true });
    }
  };

  const fetchUserData = async () => {
    try {
      const res = await api.get("/auth/me");
      setCurrentUser(res.data);
    } catch (err) {
      console.error("Failed to fetch user data", err);
    }
  };

  useEffect(() => {
    if (userData?.id) {
      fetchUserData();
    }
  }, [userData?.id]);

  useEffect(() => {
    let timer;
    if (showSuccessPopup) {
      timer = setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showSuccessPopup]);

  useEffect(() => {
    let timer;
    if (showOTPPopup && resendTime > 0) {
      timer = setInterval(() => {
        setResendTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showOTPPopup, resendTime]);

  const handleVerifyPhone = () => {
    // Try to get phone from multiple sources
    const userPhone = userData?.phone_number || profileData?.phone_number || currentUser?.phone_number;

    // Set verification type FIRST
    setCurrentVerificationType("phone");

    if (!userPhone || userPhone.trim() === "") {
      toast.error("Please add your phone number in profile first");
      setPhoneNumber("");
      setShowPhonePopup(true);
      return;
    }

    // Pre-fill the phone number (extract last 10 digits)
    const cleanPhone = userPhone.replace(/\D/g, '').slice(-10);
    setPhoneNumber(cleanPhone);
    setRateLimitError("");
    setShowPhonePopup(true);
  };

  const handleVerifyEmail = () => {
    if (emailVerified) {
      toast.success("Email is already verified!");
      return;
    }

    // Try to get email from multiple sources
    const userEmail = profileData?.email || userData?.email || currentUser?.email;

    if (!userEmail || userEmail.trim() === "") {
      // Show email setup popup instead of just opening edit profile
      setShowEmailSetupPopup(true);
      return;
    }

    setEmail(userEmail);
    setCurrentVerificationType("email");
    setShowEmailPopup(true);
  };

  // UPDATED: Phone Submit with stateless JWT
  const handlePhoneSubmit = async () => {
    if (phoneNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    if (!currentUser?.email) {
      toast.error("User email not found");
      return;
    }

    setIsVerifying(true);
    setRateLimitError("");

    try {
      // Save phone number to user profile
      const formData = new FormData();
      formData.append("phone_number", phoneNumber);
      await api.put(`/creator/edit/${userData.id}`, formData);

      // Update local state using updateUserData from context (if available)
      if (updateUserData) {
        updateUserData({ phone_number: phoneNumber });
      }

      // Refresh user data from server
      const refreshRes = await api.get("/auth/me");
      if (refreshRes.data) {
        setCurrentUser(refreshRes.data);
        // Don't need setUserData - it comes from context
      }

      const fullPhoneNumber = `+91${phoneNumber}`;

      // Send OTP - receives otp_token in response
      const response = await api.post("/verification/phone/send-otp", {
        email: currentUser.email,
        phone_number: fullPhoneNumber,
      });

      if (response.data.status === "success") {
        // Store tokens for verification
        setOtpToken(response.data.otp_token);
        setCooldownToken(response.data.cooldown_token);

        setShowPhonePopup(false);
        setShowOTPPopup(true);
        toast.success("OTP sent to your phone");
        setResendTime(45);
        setOtp(["", "", "", "", "", ""]);

        // Ensure verification type is still "phone"
        setCurrentVerificationType("phone");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      if (error.response?.status === 429) {
        const errorMessage = error.response?.data?.detail || "Please wait before requesting another OTP";
        setRateLimitError(errorMessage);
        toast.error(errorMessage);
        const match = errorMessage.match(/(\d+)\s*seconds?/);
        if (match && match[1]) {
          const remainingSeconds = parseInt(match[1]);
          if (remainingSeconds > 0 && remainingSeconds < 60) {
            setResendTime(remainingSeconds);
          }
        }
      } else {
        toast.error(error.response?.data?.detail || "Failed to send OTP");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // UPDATED: Email Submit with stateless JWT
  const handleEmailSubmit = async () => {
    const registeredEmail = profileData?.email || currentUser?.email;

    if (!registeredEmail) {
      toast.error("No registered email found. Please contact support.");
      return;
    }

    setEmail(registeredEmail);

    if (!isValidGmail(registeredEmail)) {
      toast.error("Your registered email must be a Gmail address");
      return;
    }

    if (isVerifying) return;

    setIsVerifying(true);

    try {
      const response = await api.post("/verification/email/send-otp", {
        email: registeredEmail,
      });

      if (response.data.status === "success") {
        // Store tokens for verification
        setOtpToken(response.data.otp_token);
        setCooldownToken(response.data.cooldown_token);

        setShowEmailPopup(false);
        setShowOTPPopup(true);
        toast.success("OTP sent to your email");
        setResendTime(45);
        setOtp(["", "", "", "", "", ""]);
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      if (error.response?.status === 429) {
        const errorMessage =
          error.response?.data?.detail ||
          "Too many requests. Please wait before trying again.";
        toast.error(errorMessage);
        const match = errorMessage.match(/(\d+)\s*seconds?/);
        if (match && match[1]) {
          const remainingSeconds = parseInt(match[1]);
          if (remainingSeconds > 0 && remainingSeconds <= 60) {
            setResendTime(remainingSeconds);
          }
        }
      } else if (error.response?.status === 400) {
        toast.error(error.response?.data?.detail || "Invalid email address");
      } else if (error.response?.status === 404) {
        toast.error("Email not found. Please sign up first.");
      } else {
        toast.error(
          error.response?.data?.detail ||
          "Failed to send OTP. Please try again.",
        );
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // UPDATED: Verify OTP with stateless JWT
  const verifyOTP = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast.error("Please enter complete 6-digit OTP");
      return;
    }

    if (!otpToken) {
      toast.error("Invalid session. Please request a new OTP.");
      return;
    }

    setIsVerifying(true);
    try {
      const endpoint =
        currentVerificationType === "phone"
          ? "/verification/phone/verify-otp"
          : "/verification/email/verify-otp";

      const payload =
        currentVerificationType === "phone"
          ? { email: currentUser.email, otp_code: otpString }
          : { email: email, otp_code: otpString };

      // Send OTP token as query parameter
      const response = await api.post(
        `${endpoint}?otp_token=${otpToken}`,
        payload,
      );

      if (response.data.status === "success") {
        if (currentVerificationType === "phone") {
          setPhoneVerified(true);
          setCurrentUser((prev) => ({ ...prev, phone_verified: true }));
        } else {
          setEmailVerified(true);
          setCurrentUser((prev) => ({ ...prev, email_verified: true }));
          await fetchProfileData();
          updateUserData({ phone_number: editForm.phone_number });
          await fetchUserData();
          setEditOpen(false);
        }

        setShowOTPPopup(false);
        setShowSuccessPopup(true);
        setOtp(["", "", "", "", "", ""]);
        setResendTime(45);
        setOtpToken(""); // Clear token after successful verification
        setCooldownToken("");

        toast.success(
          `${currentVerificationType === "phone" ? "Phone" : "Email"} verified successfully!`,
        );
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error(
        error.response?.data?.detail ||
        "Verification failed. Please try again.",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // UPDATED: Resend OTP with stateless JWT
  const handleResendOTP = async () => {
    if (isVerifying) return;

    if (resendTime > 0) {
      toast.error(
        `Please wait ${resendTime} seconds before requesting another OTP`,
      );
      return;
    }

    setIsVerifying(true);

    try {
      if (currentVerificationType === "phone") {
        const fullPhoneNumber = `+91${phoneNumber}`;

        const response = await api.post(
          "/verification/phone/send-otp",
          {
            email: currentUser?.email,
            phone_number: fullPhoneNumber,
          },
          {
            // Pass cooldown token if available
            headers: cooldownToken ? { "X-Cooldown-Token": cooldownToken } : {},
          },
        );

        if (response.data.status === "success") {
          setOtpToken(response.data.otp_token);
          if (response.data.cooldown_token)
            setCooldownToken(response.data.cooldown_token);
          toast.success("OTP resent to your phone!");
          setResendTime(45);
          setOtp(["", "", "", "", "", ""]);
          setTimeout(() => document.getElementById("otp-0")?.focus(), 100);
        }
      } else {
        const registeredEmail = profileData?.email || currentUser?.email;

        if (!registeredEmail) {
          toast.error("No registered email found");
          setIsVerifying(false);
          return;
        }

        const response = await api.post(
          "/verification/email/send-otp",
          {
            email: registeredEmail,
          },
          {
            headers: cooldownToken ? { "X-Cooldown-Token": cooldownToken } : {},
          },
        );

        if (response.data.status === "success") {
          setOtpToken(response.data.otp_token);
          if (response.data.cooldown_token)
            setCooldownToken(response.data.cooldown_token);
          toast.success("OTP resent to your email!");
          setResendTime(45);
          setOtp(["", "", "", "", "", ""]);
          setTimeout(() => document.getElementById("otp-0")?.focus(), 100);
        }
      }
    } catch (error) {
      console.error("Error resending OTP:", error);

      if (error.response?.status === 429) {
        const errorMessage =
          error.response?.data?.detail ||
          "Please wait before requesting another OTP";
        toast.error(errorMessage);
        const match = errorMessage.match(/(\d+)\s*seconds?/);
        if (match && match[1]) {
          const remainingSeconds = parseInt(match[1]);
          if (remainingSeconds > 0 && remainingSeconds <= 60) {
            setResendTime(remainingSeconds);
          }
        }
      } else if (error.response?.status === 404) {
        toast.error("Service unavailable. Please try again later.");
      } else if (error.response?.status === 400) {
        toast.error(
          error.response?.data?.detail ||
          "Invalid request. Please check your details.",
        );
      } else {
        toast.error(
          error.response?.data?.detail ||
          "Failed to resend OTP. Please try again.",
        );
      }
    } finally {
      setTimeout(() => setIsVerifying(false), 500);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  const fetchAllReviews = async () => {
    if (!userData?.id) return;

    try {
      const response = await api.get(`/creator/reviews/${userData.id}`);

      let reviews = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          reviews = response.data;
        } else if (
          response.data.reviews &&
          Array.isArray(response.data.reviews)
        ) {
          reviews = response.data.reviews;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          reviews = response.data.data;
        }
      }

      setAllReviews(reviews);
      return reviews;
    } catch (error) {
      console.error("Error fetching all reviews:", error);
      if (latestReviews.length > 0) {
        setAllReviews(latestReviews);
      } else {
        setAllReviews([]);
      }
      return [];
    }
  };

  const handleViewAllReviews = async () => {
    await fetchAllReviews();
    setShowReviewsPopup(true);
  };

  const handleSkillChange = (e) => {
    const query = e.target.value;
    setCurrentSkill(query);
    setSearchQuery(query);

    if (query.trim() === "") {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const filtered = allSkills.filter((skill) =>
      skill.toLowerCase().includes(query.toLowerCase()),
    );

    setSearchResults(filtered);
    setShowResults(true);
  };

  const addSkill = (skill) => {
  // Validate skill is not empty
  if (!skill || typeof skill !== 'string' || skill.trim() === "") {
    toast.error("Please enter a valid skill name");
    return;
  }

  const trimmedSkill = skill.trim();

  // Check for duplicates (case insensitive)
  if (selectedSkills.some(s => s.toLowerCase() === trimmedSkill.toLowerCase())) {
    toast.error(`"${trimmedSkill}" is already added`);
    return;
  }

  // Check maximum limit
  if (selectedSkills.length >= 15) {
    toast.error("Maximum 15 skills allowed");
    return;
  }

  // Add the skill (ANY skill is allowed)
  setSelectedSkills([...selectedSkills, trimmedSkill]);
  toast.success(`"${trimmedSkill}" added`);

  // Clear the input
  setCurrentSkill("");
  setSearchQuery("");
  setSearchResults([]);
  setShowResults(false);
};

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = currentSkill.trim();

      if (!trimmed) {
        toast.error("Please enter a skill name");
        return;
      }

      // Allow adding ANY skill (no need to check against predefined list)
      addSkill(trimmed);
    } else if (e.key === "Escape") {
      setShowResults(false);
      setSearchResults([]);
    }
  };

  // Keep ONLY ONE removeSkill function - this is the one
  const removeSkill = (skillToRemove) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skillToRemove));
    toast.success(`Skill "${skillToRemove}" removed`);
  };




  const fetchCreatorSkills = async () => {
    if (!userData?.id) return;

    try {
      setIsSkillsLoading(true);
      const response = await api.get(`/creator/get/${userData.id}`);

      if (
        response.data &&
        response.data.skills_required &&
        Array.isArray(response.data.skills_required)
      ) {
        const savedSkills = response.data.skills_required;
        setSelectedSkills(savedSkills);
      } else {
        setSelectedSkills([]);
      }
    } catch (error) {
      console.error("Error fetching skills:", error);
      setSelectedSkills([]);
    } finally {
      setIsSkillsLoading(false);
    }
  };

  const fetchProfileData = async () => {
    if (!userData?.id) return;

    try {
      setIsProfileLoading(true);
      const response = await api.get(`/creator/get/${userData.id}`);
      setProfileData(response.data);

      if (response.data.phone_verified !== undefined) {
        setPhoneVerified(response.data.phone_verified);
      }
      if (response.data.email_verified !== undefined) {
        setEmailVerified(response.data.email_verified);
      }

      if (response.data.phone_number) {
        setPhoneNumber(
          response.data.phone_number.replace(/\D/g, "").slice(-10),
        );
      }

      setEditForm({
        full_name: response.data.full_name || "",
        email: response.data.email || currentUser?.email || "",
        about: response.data.about || "",
        state: response.data.state || "",
        country: response.data.country || "",
        phone_number: response.data.phone_number || "",
        profile_picture: null,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfileData(null);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const fetchPortfolioItems = async () => {
    if (!userData?.id) return;

    try {
      setIsLoading(true);
      const response = await api.get(`/portfolio/list/${userData.id}`);
      setPortfolioItems(response.data || []);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      setPortfolioItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviewStats = async () => {
    if (!userData?.id) return;

    try {
      const res = await api.get(`/creator/review-stats/${userData.id}`);
      let stats = { avg_rating: 0, total_reviews: 0 };

      if (res.data) {
        if (typeof res.data === "object") {
          stats.avg_rating =
            res.data.avg_rating || res.data.average_rating || 0;
          stats.total_reviews =
            res.data.total_reviews || res.data.review_count || 0;
        }
      }

      setReviewStats(stats);
    } catch (err) {
      console.error("Error fetching review stats:", err);
      setReviewStats({ avg_rating: 0, total_reviews: 0 });
    }
  };

  const fetchLatestReviews = async () => {
    if (!userData?.id) return;

    try {
      setIsReviewsLoading(true);
      const res = await api.get(
        `/creator/review-latest/${userData.id}?limit=3`,
      );

      let reviews = [];
      if (res.data) {
        if (Array.isArray(res.data)) {
          reviews = res.data;
        } else if (res.data.reviews && Array.isArray(res.data.reviews)) {
          reviews = res.data.reviews;
        } else if (res.data.data && Array.isArray(res.data.data)) {
          reviews = res.data.data;
        }
      }

      setLatestReviews(reviews);
    } catch (err) {
      console.error("Error fetching latest reviews:", err);
      setLatestReviews([]);
    } finally {
      setIsReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (rateLimitError && resendTime === 0) {
      const timer = setTimeout(() => {
        setRateLimitError("");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [rateLimitError, resendTime]);

  useEffect(() => {
    if (userData?.id) {
      fetchProfileData();
      fetchPortfolioItems();
      fetchReviewStats();
      fetchLatestReviews();
      fetchCreatorSkills();
    }
  }, [userData?.id]);

  const handleUpdateSkills = async () => {
  // Create a local variable to track skills after potential addition
  let updatedSkills = [...selectedSkills];

  // FIRST: Check if there's text in the input field that hasn't been added
  if (currentSkill && currentSkill.trim() !== "") {
    const trimmedSkill = currentSkill.trim();

    // Check if skill already exists
    if (updatedSkills.some(s => s.toLowerCase() === trimmedSkill.toLowerCase())) {
      toast.error(`"${trimmedSkill}" is already added`);
      setCurrentSkill("");
      setSearchQuery("");
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Check maximum limit
    if (updatedSkills.length >= 15) {
      toast.error("Maximum 15 skills allowed");
      setCurrentSkill("");
      return;
    }

    // Add the skill to local array
    updatedSkills = [...updatedSkills, trimmedSkill];
    setSelectedSkills(updatedSkills); // Update state immediately
    toast.success(`"${trimmedSkill}" added`);
    setCurrentSkill("");
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    // IMPORTANT: Continue to save after adding the skill
  }

  // SECOND: Check if no skills are selected (empty array) - USE updatedSkills, not selectedSkills
  if (!updatedSkills || updatedSkills.length === 0) {
    toast.error("❌ Please add at least one skill before saving");
    return;
  }

  // THIRD: Get the original skills from profileData
  const originalSkills = profileData?.skills_required || [];

  // Compare if skills have actually changed
  const skillsChanged =
    updatedSkills.length !== originalSkills.length ||
    updatedSkills.some(skill => !originalSkills.includes(skill)) ||
    originalSkills.some(skill => !updatedSkills.includes(skill));

  // If no changes, don't make the API call
  if (!skillsChanged) {
    toast.info("No changes to save");
    return;
  }

  // FOURTH: Save if both conditions pass
  try {
    await api.put(`/creator/update-skills/${userData.id}`, {
      skills_required: updatedSkills,
    });

    toast.success(`${updatedSkills.length} skill(s) updated successfully!`);

    // Refresh profile data to get updated skills
    await fetchProfileData();
  } catch (error) {
    console.error("Error updating skills:", error);
    if (error.response?.status === 422) {
      toast.error("Invalid data format. Please try again.");
    } else {
      toast.error("Failed to update skills. Please try again.");
    }
  }
};
  const handleEditProfile = async (formData) => {
    let hasError = false;
    const errors = {};

    // Full name validation
    if (!validateRequired(formData.full_name)) {
      errors.full_name = "Full name is required";
      hasError = true;
    } else if (formData.full_name.length > MAX_NAME_LENGTH) {
      errors.full_name = `Full name should be less than ${MAX_NAME_LENGTH} characters`;
      hasError = true;
    } else if (!validateAlphabets(formData.full_name)) {
      errors.full_name = "Full name should only contain letters and spaces";
      hasError = true;
    }

    // State validation
    if (!validateRequired(formData.state)) {
      errors.state = "State is required";
      hasError = true;
    } else if (formData.state.length > MAX_LOCATION_LENGTH) {
      errors.state = `State should be less than ${MAX_LOCATION_LENGTH} characters`;
      hasError = true;
    } else if (!validateAlphabets(formData.state)) {
      errors.state = "State should only contain letters and spaces";
      hasError = true;
    }

    // Country validation
    if (!validateRequired(formData.country)) {
      errors.country = "Country is required";
      hasError = true;
    } else if (formData.country.length > MAX_LOCATION_LENGTH) {
      errors.country = `Country should be less than ${MAX_LOCATION_LENGTH} characters`;
      hasError = true;
    } else if (!validateAlphabets(formData.country)) {
      errors.country = "Country should only contain letters and spaces";
      hasError = true;
    }

    // About validation
    if (formData.about && formData.about.length > MAX_DESCRIPTION_LENGTH) {
      errors.about = `About should be less than ${MAX_DESCRIPTION_LENGTH} characters`;
      hasError = true;
    }

    // Phone validation (Required)
    if (!validateRequired(formData.phone_number)) {
      errors.phone_number = "Phone number is required";
      hasError = true;
    } else {
      const phoneError = validatePhoneNumber(formData.phone_number);
      if (phoneError) {
        errors.phone_number = phoneError;
        hasError = true;
      }
    }
    // Email validation
if (formData.email && formData.email.trim() !== "") {
  const emailValidation =
    validateEmailWithSuggestions(formData.email);

  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
    hasError = true;
  }
}

    if (hasError) {
      setValidationErrors(errors);
      setTouchedFields({
        full_name: true,
        email: true, 
        state: true,
        country: true,
        phone_number: !!formData.phone_number,
        about: true,
      });

      // Show first error message as toast
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return;
    }

    setIsSavingProfile(true);

    try {
      const data = new FormData();
      data.append("full_name", formData.full_name.trim());
      if (
  formData.email &&
  formData.email.trim() !== ""
) {
  data.append(
    "email",
    formData.email.trim().toLowerCase()
  );
}
      data.append("about", formData.about || "");
      data.append("state", formData.state.trim());
      data.append("country", formData.country.trim());

      if (formData.phone_number) {
        data.append("phone_number", formData.phone_number);
      }

      if (formData.profile_picture) {
        data.append("profile_picture", formData.profile_picture);
      }

      await api.put(`/creator/edit/${userData.id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchProfileData();
      await fetchUserData();

      setEditOpen(false);
      toast.success("Profile updated successfully!");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error editing profile:", error);
      toast.error(
        "Failed to update profile: " +
        (error.response?.data?.detail || error.message),
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddPortfolio = async (formData) => {
    let hasError = false;
    const errors = {};

    // Title validation
    const titleError = validateWorkName(formData.title);
    if (titleError) {
      errors.title = titleError;
      hasError = true;
    }

    // File validation - REQUIRED for new portfolio items
    if (!formData.file) {
      errors.file = "Please upload a media file";
      hasError = true;
    } else {
      const fileError = validateFileSize(formData.file);
      if (fileError) {
        errors.file = fileError;
        hasError = true;
      }
    }

    // URL validation (optional)
    if (formData.media_link && formData.media_link.trim() !== "") {
      const urlError = validateUrl(formData.media_link);
      if (urlError) {
        errors.media_link = urlError;
        hasError = true;
      }
    }

    // Description validation
    if (formData.description && formData.description.length > MAX_DESCRIPTION_LENGTH) {
      errors.description = `Description should be less than ${MAX_DESCRIPTION_LENGTH} characters`;
      hasError = true;
    }

    if (hasError) {
      setPortfolioValidationErrors(errors);
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return;
    }

    setIsSavingPortfolio(true);

    try {
      if (!userData?.id) {
        toast.error("User not loaded yet");
        return;
      }

      const data = new FormData();
      data.append("user_id", userData.id);
      data.append("title", formData.title.trim());
      data.append("media_link", formData.media_link?.trim() || "");
      data.append("description", formData.description || "");

      if (formData.file) {
        data.append("file", formData.file);
      }

      await api.post(`/portfolio/add`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchPortfolioItems();
      setActiveModal(null);
      setPortfolioForm({
        title: "",
        media_link: "",
        description: "",
        file: null,
      });
      setFileName("No file chosen");
      setPortfolioValidationErrors({ title: "", file: "", media_link: "", description: "" });
      toast.success("Portfolio item added successfully!");
    } catch (error) {
      console.error("Error adding portfolio:", error);
      toast.error(
        "Failed to add portfolio item: " +
        (error.response?.data?.detail || error.message),
      );
    } finally {
      setIsSavingPortfolio(false);
    }
  };

  const handleEditPortfolio = async (formData) => {
    let hasError = false;
    const errors = {};

    // Title validation
    const titleError = validateWorkName(formData.title);
    if (titleError) {
      errors.title = titleError;
      hasError = true;
    }

    // File validation - only validate if a new file is being uploaded
    if (formData.file) {
      const fileError = validateFileSize(formData.file);
      if (fileError) {
        errors.file = fileError;
        hasError = true;
      }
    }

    // URL validation (optional)
    if (formData.media_link && formData.media_link.trim() !== "") {
      const urlError = validateUrl(formData.media_link);
      if (urlError) {
        errors.media_link = urlError;
        hasError = true;
      }
    }

    // Description validation
    if (formData.description && formData.description.length > MAX_DESCRIPTION_LENGTH) {
      errors.description = `Description should be less than ${MAX_DESCRIPTION_LENGTH} characters`;
      hasError = true;
    }

    if (hasError) {
      setPortfolioValidationErrors(errors);
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return;
    }

    try {
      const data = new FormData();
      data.append("title", formData.title.trim());
      data.append("media_link", formData.media_link?.trim() || "");
      data.append("description", formData.description || "");

      if (formData.file) {
        data.append("file", formData.file);
      }

      await api.put(`/portfolio/edit/${editingPortfolioItem.id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchPortfolioItems();
      setShowEdit(false);
      setEditingPortfolioItem(null);
      setEditPortfolioForm({
        title: "",
        media_link: "",
        description: "",
        file: null,
      });
      setPortfolioValidationErrors({ title: "", file: "", media_link: "", description: "" });
      toast.success("Portfolio item updated successfully!");
    } catch (error) {
      console.error("Error editing portfolio:", error);
      toast.error(
        "Failed to update portfolio item: " +
        (error.response?.data?.detail || error.message),
      );
    }
  };

  // UPDATED: Delete handler with custom confirm modal
  const handleDeletePortfolio = (itemId) => {
  showConfirm("Are you sure you want to delete this portfolio item?", async () => {
    closeConfirm();
    setIsDeleting(true); // Add this
    try {
      await api.delete(`/portfolio/delete/${itemId}`);
      await fetchPortfolioItems();
      setShowEdit(false);
      setEditingPortfolioItem(null);
      setShowPortfolioPopup(false);
      toast.success("Portfolio item deleted successfully!");
    } catch (error) {
      console.error("Error deleting portfolio:", error);
      toast.error("Failed to delete portfolio item");
    } finally {
      setIsDeleting(false); // Add this
    }
  });
};

 const handleFileChange = (e, setFormData, setFileNameState) => {
  const file = e.target.files[0];

  if (file) {
    // Get file extension
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    // Define allowed file types and extensions
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const allowedExtensions = ["jpg", "jpeg", "png", "webp"];

    // Check by MIME type and extension
    if (!allowedTypes.includes(file.type) || !allowedExtensions.includes(fileExtension)) {
      const errorMessage = "Only JPG, JPEG, PNG, and WEBP image files are allowed";
      toast.error(errorMessage);
      setPortfolioValidationErrors((prev) => ({
        ...prev,
        file: errorMessage,
      }));
      e.target.value = "";
      return;
    }

    // Validate file size (minimum 100KB, maximum 50MB)
    const sizeError = validateFileSize(file);
    if (sizeError) {
      toast.error(sizeError);
      setPortfolioValidationErrors((prev) => ({
        ...prev,
        file: sizeError,
      }));
      e.target.value = "";
      return;
    }

    if (setFileNameState) {
      setFileNameState(file.name);
    }

    setFormData((prev) => ({
      ...prev,
      file,
    }));

    setPortfolioValidationErrors((prev) => ({
      ...prev,
      file: "",
    }));
  }
};

  const [portfolioForm, setPortfolioForm] = useState({
    title: "",
    media_link: "",
    description: "",
    file: null,
  });

  const [editPortfolioForm, setEditPortfolioForm] = useState({
    title: "",
    media_link: "",
    description: "",
    file: null,
  });

  const openEditModal = (item) => {
    setShowPortfolioPopup(false);
    setEditingPortfolioItem(item);
    setEditPortfolioForm({
      title: item.title || "",
      media_link: item.media_link || "",
      description: item.description || "",
      file: null,
    });
    setPortfolioValidationErrors({ title: "", file: "", media_link: "", description: "" });
    setShowEdit(true);
  };

  const openPortfolioLink = (item) => {
    if (item.media_link) {
      window.open(item.media_link, "_blank");
    }
  };

  const flagUrl = profileData?.country_code
    ? `https://flagcdn.com/w40/${profileData.country_code.toLowerCase()}.png?${Date.now()}`
    : FlagImg;

  const displayLocation = () => {
    if (profileData?.state && profileData?.country) {
      return `${profileData.state}, ${profileData.country}`;
    }
    if (profileData?.country) {
      return profileData.country;
    }
    return "Location not set";
  };

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    if (portfolioItems.length > 0) {
      setCurrentIndex((prevIndex) =>
        prevIndex === portfolioItems.length - 1 ? 0 : prevIndex + 1,
      );
    }
  };

  const prevSlide = () => {
    if (portfolioItems.length > 0) {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? portfolioItems.length - 1 : prevIndex - 1,
      );
    }
  };

  useEffect(() => {
    const modalOpen =
      editOpen ||
      showSkillsModal ||
      activeModal ||
      showPortfolioPopup ||
      showReviewsPopup ||
      showPhonePopup ||
      showEmailPopup ||
      showOTPPopup ||
      showSuccessPopup ||
      showEdit ||
      confirmModal.open ||
      showEmailSetupPopup;

    if (modalOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = scrollBarWidth + "px";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [
    editOpen,
    showSkillsModal,
    activeModal,
    showPortfolioPopup,
    showReviewsPopup,
    showPhonePopup,
    showEmailPopup,
    showOTPPopup,
    showSuccessPopup,
    showEdit,
    confirmModal.open,
    showEmailSetupPopup,
  ]);

  const [showAllSkills, setShowAllSkills] = useState(false);
  const displayedSkills = showAllSkills
    ? selectedSkills
    : selectedSkills.slice(0, 3);

  const totalPages = Math.ceil(portfolioItems.length / itemsPerPage);
  const paginatedPortfolioItems = portfolioItems.slice(
    (portfolioCurrentPage - 1) * itemsPerPage,
    portfolioCurrentPage * itemsPerPage,
  );

  const handlePortfolioPageChange = (newPage) => {
    setPortfolioCurrentPage(newPage);
  };

  // Cancel button component
  const CancelButton = ({ onClick, disabled = false }) => (
    <div className="flex justify-center">
      <button
        onClick={onClick}
        disabled={disabled}
        className="w-[122px] h-[48px] rounded-full bg-[#51218F] hover:bg-[#6D28D9] transition-all duration-200 flex items-center justify-center font-semibold text-white text-[14px] shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Cancel
      </button>
    </div>
  );

  return (
    <div className="relative w-full bg-[#F2F2F2] flex justify-center overflow-x-hidden">
      {/* Custom Confirm Modal */}
      <ConfirmModal
        open={confirmModal.open}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
      />

      <div className="w-full sm:max-w-none max-sm:w-full max-sm:bg-white max-sm:shadow-xl max-sm:overflow-hidden">
        {/* BANNER + HEADER */}
        <div className="relative w-full h-[582px] max-sm:h-[260px]">
          <img
            src={TopBanner}
            alt="banner"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute top-0 left-0 w-full z-[100] sm:top-[24px] sm:left-1/2 sm:-translate-x-1/2 sm:max-w-[1280px] sm:px-6">
            <div className="flex items-center justify-between text-white px-4 sm:px-0">
              <Header />
            </div>
          </div>
        </div>

        <div className="origin-top transition-all duration-300">
          <div className="max-w-[1280px] mx-auto mt-[-260px] max-sm:mt-[-60px] pb-24 relative z-10 max-sm:mt-[-140px] max-sm:px-3 max-sm:pb-10">
            {/* ===== PROFILE + VERIFICATION ===== */}
<div className="grid md:px-0 lg:px-0 grid-cols-1 lg:grid-cols-[680px_320px]  xl:grid-cols-[804px_392px] gap-6 lg:gap-[24px] xl:gap-[31px] mt-6 mb-6">       
         {/* ===== DESKTOP / LAPTOP PROFILE ===== */}
<div className="hidden sm:block bg-white shadow-lg mt-6 rounded-[10px] p-6 md:w-[calc(100%-48px)] md:mx-6 lg:w-[680px] lg:mx-0 xl:w-[804px]">
 <div className="flex flex-col items-start md:flex-row md:items-start gap-3 md:gap-4 lg:gap-6 xl:gap-6 w-full">
      {/* Profile Image Section */}
      <div className="flex flex-col items-start w-full md:w-auto">
        {isProfileLoading ? (
          <div className="w-[160px] h-[160px] md:w-[180px] md:h-[180px] lg:w-[250px] lg:h-[180px] xl:w-[218px] xl:h-[219px] rounded-[9px] bg-gray-200 animate-pulse">
            
          </div>
        ) : (
          <img
            src={profileData?.profile_picture || DefaultProfilePic}
            alt="profile"
            className="w-[160px] h-[160px] md:w-[180px] md:h-[180px] lg:w-[250px] lg:h-[180px] xl:w-[218px] xl:h-[219px] rounded-[9px] object-cover"
          />
        )}

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <img
            src={flagUrl}
            alt="flag"
            className="w-[18px] h-[12px] object-cover rounded-sm"
            onError={(e) => {
              e.target.src = FlagImg;
            }}
          />
          <span className="text-[12px] md:text-[13px] lg:text-[14px] xl:text-[14px] font-medium">
            {displayLocation()}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="#000"
              strokeWidth="1.5"
            />
            <path
              d="M12 6v6l4 2"
              stroke="#000"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] font-medium">
            {profileData?.local_time
              ? `It's currently ${profileData.local_time} here`
              : "Time not available"}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
          >
            <rect
              x="3"
              y="4"
              width="18"
              height="18"
              rx="2"
              stroke="#000"
              strokeWidth="1.5"
            />
            <path
              d="M8 2v4M16 2v4M3 10h18"
              stroke="#000"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] font-medium">
            {isProfileLoading
              ? "Loading..."
              : `Joined ${profileData?.joined_date || "December 5, 2020"}`}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 min-w-0 w-full">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 md:gap-3 lg:gap-4 xl:gap-4">
          <div className="flex-1 min-w-0 w-full">
            {isProfileLoading ? (
              <div className="h-[28px] md:h-[30px] lg:h-[32px] xl:h-[32px] w-[160px] md:w-[180px] lg:w-[200px] xl:w-[200px] bg-gray-200 animate-pulse rounded mb-2"></div>
            ) : (
              <h2 className="text-[18px] md:text-[20px] lg:text-[22px] xl:text-[22px] font-semibold truncate">
                {profileData?.full_name || "User"}
              </h2>
            )}

            {isProfileLoading ? (
              <div className="h-[16px] md:h-[18px] lg:h-[20px] xl:h-[20px] w-[200px] md:w-[220px] lg:w-[250px] xl:w-[300px] bg-gray-200 animate-pulse rounded mb-2"></div>
            ) : (
              <p
                style={{
                  fontFamily: "Montserrat",
                  fontWeight: 500,
                  fontSize: "12px",
                  color: "#2A1E1780",
                }}
                className="md:text-[13px] lg:text-[14px] xl:text-[14px] truncate"
              >
                {profileData?.creator_type &&
                  profileData?.primary_niche
                  ? `${profileData.creator_type}, ${profileData.primary_niche}`
                  : profileData?.creator_type ||
                  profileData?.primary_niche ||
                  "User Experience Designer, Graphic Designer"}
              </p>
            )}

            <div className="flex gap-2 md:gap-3 mt-2 flex-wrap">
              <svg width="120" height="35" viewBox="0 0 120 35" className="md:w-[130px] md:h-[38px] lg:w-[140px] lg:h-[40px] xl:w-[140px] xl:h-[40px]">
                <path
                  d="M10 3L12.7 9.5H19.5L14 13.8L16.2 20L10 16L3.8 20L6 13.8L0.5 9.5H7.3L10 3Z"
                  fill={
                    reviewStats.avg_rating >= 1
                      ? "#5B2D8B"
                      : "#E6E0EC"
                  }
                />
                <path
                  d="M30 3L32.7 9.5H39.5L34 13.8L36.2 20L30 16L23.8 20L26 13.8L20.5 9.5H27.3L30 3Z"
                  fill={
                    reviewStats.avg_rating >= 2
                      ? "#5B2D8B"
                      : "#E6E0EC"
                  }
                />
                <path
                  d="M50 3L52.7 9.5H59.5L54 13.8L56.2 20L50 16L43.8 20L46 13.8L40.5 9.5H47.3L50 3Z"
                  fill={
                    reviewStats.avg_rating >= 3
                      ? "#5B2D8B"
                      : "#E6E0EC"
                  }
                />
                <path
                  d="M70 3L72.7 9.5H79.5L74 13.8L76.2 20L70 16L63.8 20L66 13.8L60.5 9.5H67.3L70 3Z"
                  fill={
                    reviewStats.avg_rating >= 4
                      ? "#5B2D8B"
                      : "#E6E0EC"
                  }
                />
                <path
                  d="M90 3L92.7 9.5H99.5L94 13.8L96.2 20L90 16L83.8 20L86 13.8L80.5 9.5H87.3L90 3Z"
                  fill={
                    reviewStats.avg_rating >= 5
                      ? "#5B2D8B"
                      : "#E6E0EC"
                  }
                />
                <text x="10" y="30" fontSize="10" fill="#3A2A1A" className="md:text-[11px] lg:text-[12px] xl:text-[12px]">
                  {reviewStats.avg_rating.toFixed(1)}/5{" "}
                  <tspan opacity="0.6">
                    ({reviewStats.total_reviews}{" "}
                    {reviewStats.total_reviews === 1
                      ? "Review"
                      : "Reviews"}
                    )
                  </tspan>
                </text>
              </svg>
            </div>
          </div>

          {/* Edit Profile Button - Tablet Optimized */}
          <button
            onClick={() => setEditOpen(true)}
            className="h-[29px] px-[20px] md:px-[25px] lg:px-[30px] xl:px-[40px] !border border-[#51218F] rounded-full text-[#6A3EA1] whitespace-nowrap flex-shrink-0 text-[12px] md:text-[13px] lg:text-[14px] xl:text-[14px] self-start md:self-start lg:self-start xl:self-start mt-0 md:mt-0 lg:mt-1 xl:mt-0"
          >
            Edit Profile
          </button>
        </div>

        {isProfileLoading ? (
          <div className="mt-3 md:mt-4 lg:mt-5 xl:mt-5 space-y-2">
            <div className="h-[16px] md:h-[18px] lg:h-[20px] xl:h-[20px] w-full bg-gray-200 animate-pulse rounded"></div>
            <div className="h-[16px] md:h-[18px] lg:h-[20px] xl:h-[20px] w-3/4 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-[16px] md:h-[18px] lg:h-[20px] xl:h-[20px] w-2/3 bg-gray-200 animate-pulse rounded"></div>
          </div>
        ) : (
          <p className="mt-3 md:mt-4 lg:mt-5 xl:mt-5 text-[12px] md:text-[13px] lg:text-[14px] xl:text-[14px] leading-[18px] md:leading-[20px] lg:leading-[22px] xl:leading-[22px] text-black font-medium font-['Montserrat'] break-words overflow-hidden [overflow-wrap:anywhere]">
            {profileData?.about || "No description available"}
          </p>
        )}
      </div>
    </div>
  </div>

              {/* ===== MOBILE PROFILE ===== */}
{/* MOBILE PROFILE */}
  <div className="h-[1px] bg-black/10 mt-3"></div>

<div
  className="
    block sm:hidden
    bg-white rounded-[14px]
    shadow mt-5
    px-4 py-4
    w-full
  "
>   <div className="flex gap-2">
    {isProfileLoading ? (
                    <div className="w-[82px] h-[132px] rounded-2 bg-gray-200 animate-pulse"></div>
    ) : (
      <img
        src={profileData?.profile_picture || DefaultProfilePic}
        className="w-[82px] h-[132px] rounded-2 object-cover flex-shrink-0"
        alt="profile"
      />
    )}

    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-start gap-2 mb-2">
        {isProfileLoading ? (
          <div className="h-[20px] w-[100px] bg-gray-200 animate-pulse rounded flex-shrink-0"></div>
        ) : (
          <h3 className="text-[16px] font-semibold text-[#2A1E17] truncate flex-1">
            {profileData?.full_name || "User"}
          </h3>
        )}

        <button
          onClick={() => setEditOpen(true)}
          className="!border border-[#51218F] text-[#51218F] text-[11px] px-4 py-[2px] rounded-full flex-shrink-0 whitespace-nowrap"
        >
          Edit profile
        </button>
      </div>

      {isProfileLoading ? (
        <div className="h-[14px] w-[140px] bg-gray-200 animate-pulse rounded mt-1"></div>
      ) : (
        <p className="text-[11px] text-[#6B6B6B] leading-tight truncate">
          {profileData?.creator_type && profileData?.primary_niche
            ? `${profileData.creator_type}, ${profileData.primary_niche}`
            : profileData?.creator_type ||
            profileData?.primary_niche ||
            "Designer, Graphic Designer"}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
        <div className="flex items-center gap-1">
          <div className="flex">
            {renderStars(reviewStats.avg_rating)}
          </div>
          <span className="text-[10px] text-gray-600 whitespace-nowrap">
            {reviewStats.avg_rating.toFixed(1)} ({reviewStats.total_reviews})
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] text-[#6B6B6B]">
        <div className="flex items-center gap-1">
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
          >
            <rect
              x="3"
              y="4"
              width="18"
              height="18"
              rx="2"
              stroke="#6B6B6B"
              strokeWidth="1.5"
            />
            <path
              d="M8 2v4M16 2v4M3 10h18"
              stroke="#6B6B6B"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="truncate max-w-[100px]">
            {isProfileLoading
              ? "Loading..."
              : profileData?.joined_date ||
              "Joined Dec 5, 2020"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <img
            src={flagUrl}
            alt="flag"
            className="w-2.5 h-2 object-cover"
            onError={(e) => {
              e.target.src = FlagImg;
            }}
          />
          <span className="truncate max-w-[80px]">
            {isProfileLoading ? "Loading..." : displayLocation()}
          </span>
        </div>
      </div>
    </div>
  </div>

  {isProfileLoading ? (
    <div className="mt-2 space-y-1.5">
      <div className="h-[12px] w-full bg-gray-200 animate-pulse rounded"></div>
      <div className="h-[12px] w-4/5 bg-gray-200 animate-pulse rounded"></div>
      <div className="h-[12px] w-3/4 bg-gray-200 animate-pulse rounded"></div>
    </div>
  ) : (
    <p className="mt-2 text-[11px] leading-[16px] text-[#3A2A1A] line-clamp-3">
      {profileData?.about || "No description available"}
    </p>
  )}
</div>

              {/* EDIT PROFILE MODAL */}
              {editOpen && createPortal(
  <>
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-md z-[99999]"
      onClick={() => {
        setEditOpen(false);
        setEditForm({
          full_name: profileData?.full_name || "",
          email: profileData?.email || "",
          about: profileData?.about || "",
          state: profileData?.state || "",
          country: profileData?.country || "",
          phone_number: profileData?.phone_number || "",
          profile_picture: null,
        });
        setValidationErrors({});
        setTouchedFields({});
      }}
    ></div>

    <div className="fixed inset-0 z-[100000] flex items-start sm:items-center justify-center p-2 sm:p-4 md:px-6 overflow-y-auto">
      <div
        className="bg-white rounded-[16px] sm:rounded-[24px] shadow-xl w-full max-w-[800px] max-h-[calc(100vh-20px)] sm:max-h-[calc(100vh-140px)] overflow-y-auto hide-scrollbar my-2 sm:my-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", isolation: "isolate" }}
      >
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold">Edit Profile</h2>
            <button
              onClick={() => {
                setEditOpen(false);
                setEditForm({
                  full_name: profileData?.full_name || "",
                  email: profileData?.email || "",
                  about: profileData?.about || "",
                  state: profileData?.state || "",
                  country: profileData?.country || "",
                  phone_number: profileData?.phone_number || "",
                  profile_picture: null,
                });
                setValidationErrors({});
                setTouchedFields({});
              }}
              className="text-gray-500 hover:text-black text-lg sm:text-xl p-1"
            >
              ✕
            </button>
          </div>

          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-4 sm:mb-6 relative">
            {editForm.profile_picture ? (
              <img
                src={URL.createObjectURL(editForm.profile_picture)}
                alt="profile"
                className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[120px] md:h-[120px] rounded-full object-cover mb-2 sm:mb-3"
              />
            ) : profileData?.profile_picture ? (
              <img
                src={profileData.profile_picture}
                alt="profile"
                className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[120px] md:h-[120px] rounded-full object-cover mb-2 sm:mb-3"
              />
            ) : (
              <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[120px] md:h-[120px] rounded-full bg-gray-100 flex items-center justify-center mb-2 sm:mb-3">
                <svg width="50%" height="50%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                  <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="#9CA3AF" />
                  <path d="M12 14C8.13401 14 5 16.6863 5 20V22H19V20C19 16.6863 15.866 14 12 14Z" fill="#9CA3AF" />
                </svg>
              </div>
            )}
            <label className="absolute bottom-2 sm:bottom-3 md:bottom-4 right-[calc(50%-40px)] sm:right-[calc(50%-50px)] md:right-[calc(50%-60px)] w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-[#51218F] rounded-full flex items-center justify-center cursor-pointer hover:opacity-90 transition">
              <svg width="14" height="14" className="sm:w-[16px] sm:h-[16px] md:w-[18px] md:h-[18px]" viewBox="0 0 24 24" fill="white">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
              </svg>
              <input type="file" className="hidden" accept="image/*" onChange={handleProfilePicChange} />
            </label>
            {validationErrors.profile_picture && touchedFields.profile_picture && (
              <p className="text-red-500 text-xs mt-2">{validationErrors.profile_picture}</p>
            )}
          </div>

          {/* Full Name */}
          <div className="mb-4 sm:mb-5">
            <label className="block text-[13px] sm:text-[15px] font-semibold mb-1.5 sm:mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editForm.full_name}
              onChange={(e) => handleInputChange("full_name", e.target.value)}
              onBlur={() => handleBlur("full_name")}
              maxLength={MAX_NAME_LENGTH}
              className={`w-full !border rounded-[10px] sm:rounded-[12px] px-3 sm:px-4 py-2.5 sm:py-3 text-[13px] sm:text-[15px] focus:outline-none focus:ring-2 focus:ring-[#51218F] focus:border-transparent ${validationErrors.full_name && touchedFields.full_name ? "border-red-500" : "border-gray-300"}`}
              placeholder="Enter full name"
            />
            <div className="flex justify-between items-center mt-1">
              {validationErrors.full_name && touchedFields.full_name && (
                <p className="text-red-500 text-xs">{validationErrors.full_name}</p>
              )}
              <p className="text-xs text-gray-400 ml-auto">{editForm.full_name.length}/{MAX_NAME_LENGTH}</p>
            </div>
          </div>

          {/* Email Field - NEW */}
      
<div className="mb-4 sm:mb-5">
  <label className="block text-[13px] sm:text-[15px] font-semibold mb-1.5 sm:mb-2">
    Email Address <span className="text-red-500">*</span>
  </label>
  <div className="relative">
    <input
      type="text"
      value={editForm.email}
      onChange={(e) => handleInputChange("email", e.target.value)}
      onBlur={handleEmailBlur}
      readOnly={profileData?.email && profileData.email.trim() !== ""}
      className={`w-full !border rounded-[10px] sm:rounded-[12px] px-3 sm:px-4 py-2.5 sm:py-3 text-[13px] sm:text-[15px] focus:outline-none focus:ring-2 focus:ring-[#51218F] focus:border-transparent ${
        validationErrors.email && touchedFields.email ? "border-red-500" : "border-gray-300"
      } ${profileData?.email && profileData.email.trim() !== "" ? "bg-gray-100 cursor-not-allowed" : ""}`}
      placeholder={profileData?.email ? "Email already set" : "Enter your email address"}
    />
    {profileData?.email && editForm.email === profileData.email && (
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Current Email</span>
      </div>
    )}
  </div>
  <div className="flex justify-between items-center mt-1">
    {validationErrors.email && touchedFields.email && (
      <p className="text-red-500 text-xs">{validationErrors.email}</p>
    )}
    <p className="text-[10px] text-gray-400 ml-auto">
      {profileData?.email 
        ? "Email cannot be changed once set" 
        : "This email will be used for login and notifications"}
    </p>
  </div>
</div>

          {/* State & Country Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-5">
            <div>
              <label className="block text-[13px] sm:text-[15px] font-semibold mb-1.5 sm:mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editForm.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                onBlur={() => handleBlur("state")}
                maxLength={MAX_NAME_LENGTH}
                className={`w-full !border rounded-[10px] sm:rounded-[12px] px-3 sm:px-4 py-2.5 sm:py-3 text-[13px] sm:text-[15px] focus:outline-none focus:ring-2 focus:ring-[#51218F] focus:border-transparent ${validationErrors.state && touchedFields.state ? "border-red-500" : "border-gray-300"}`}
                placeholder="Enter state"
              />
              <div className="flex justify-between items-center mt-1">
                {validationErrors.state && touchedFields.state && (
                  <p className="text-red-500 text-xs">{validationErrors.state}</p>
                )}
                <p className="text-xs text-gray-400 ml-auto">{editForm.state.length}/{MAX_LOCATION_LENGTH}</p>
              </div>
            </div>
            <div>
              <label className="block text-[13px] sm:text-[15px] font-semibold mb-1.5 sm:mb-2">
                Country <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editForm.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                onBlur={() => handleBlur("country")}
                maxLength={MAX_NAME_LENGTH}
                className={`w-full !border rounded-[10px] sm:rounded-[12px] px-3 sm:px-4 py-2.5 sm:py-3 text-[13px] sm:text-[15px] focus:outline-none focus:ring-2 focus:ring-[#51218F] focus:border-transparent ${validationErrors.country && touchedFields.country ? "border-red-500" : "border-gray-300"}`}
                placeholder="Enter country"
              />
              <div className="flex justify-between items-center mt-1">
                {validationErrors.country && touchedFields.country && (
                  <p className="text-red-500 text-xs">{validationErrors.country}</p>
                )}
                <p className="text-xs text-gray-400 ml-auto">{editForm.country.length}/{MAX_LOCATION_LENGTH}</p>
              </div>
            </div>
          </div>

          {/* Phone Number */}
          <div className="mb-4 sm:mb-5">
            <div className="flex justify-between items-center mb-1.5 sm:mb-2">
              <label className="block text-[14px] font-semibold mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center px-3 sm:px-4 py-2.5 sm:py-3 border border-r-0 border-gray-300 rounded-l-lg sm:rounded-l-xl bg-gray-50">
                  <span className="text-gray-700 font-medium text-[13px] sm:text-[15px]">🇮🇳 +91</span>
                </div>
              </div>
              <input
                type="tel"
                value={editForm.phone_number ? editForm.phone_number.replace(/\D/g, "").slice(0, 10) : ""}
                onChange={(e) => {
                  const numbersOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                  handleInputChange("phone_number", numbersOnly);
                }}
                onBlur={() => handleBlur("phone_number")}
                className={`flex-1 !border rounded-r-lg sm:rounded-r-xl px-3 sm:px-4 py-2.5 sm:py-3 text-[13px] sm:text-[15px] focus:outline-none focus:ring-2 focus:ring-[#51218F] focus:border-transparent ${validationErrors.phone_number && touchedFields.phone_number ? "border-red-500" : "border-gray-300"}`}
                placeholder="Enter 10-digit mobile number"
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-1.5 sm:mt-2 gap-1">
              {editForm.phone_number && (
                <p className={`text-[10px] sm:text-xs font-medium ${editForm.phone_number.length === 10 ? "text-green-600" : "text-gray-500"}`}>
                  {editForm.phone_number.length}/10 digits
                </p>
              )}
            </div>
            {validationErrors.phone_number && touchedFields.phone_number && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.phone_number}</p>
            )}
            <p className="text-[10px] sm:text-xs text-blue-600 mt-1">
              💡 This number will be used for verification and notifications
            </p>
          </div>

          {/* About */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-[13px] sm:text-[15px] font-semibold mb-1.5 sm:mb-2">About</label>
            <textarea
              rows={4}
              className="w-full !border border-gray-300 rounded-[10px] sm:rounded-[12px] px-3 sm:px-4 py-2.5 sm:py-3 text-[13px] sm:text-[15px] leading-[20px] sm:leading-[22px] focus:outline-none focus:ring-2 focus:ring-[#51218F] focus:border-transparent resize-none"
              placeholder="Tell us about yourself..."
              value={editForm.about}
              onChange={(e) => handleInputChange("about", e.target.value)}
              onBlur={() => handleBlur("about")}
              maxLength={MAX_DESCRIPTION_LENGTH}
            />
            <div className="flex justify-between items-center mt-1">
              {validationErrors.about && touchedFields.about && (
                <p className="text-red-500 text-xs">{validationErrors.about}</p>
              )}
              <p className="text-xs text-gray-400 ml-auto">{editForm.about.length}/{MAX_DESCRIPTION_LENGTH}</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center">
            <button
              onClick={() => handleEditProfile(editForm)}
              disabled={isSavingProfile}
              className={`bg-[#51218F] text-white px-8 sm:px-12 py-2.5 sm:py-3 rounded-full font-semibold hover:opacity-90 transition w-full sm:w-auto min-w-[120px] text-[13px] sm:text-[15px] order-1 sm:order-none ${isSavingProfile ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isSavingProfile ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </div>
              ) : (
                "Save"
              )}
            </button>
            <CancelButton
              onClick={() => {
                setEditOpen(false);
                setEditForm({
                  full_name: profileData?.full_name || "",
                  email: profileData?.email || "",
                  about: profileData?.about || "",
                  state: profileData?.state || "",
                  country: profileData?.country || "",
                  phone_number: profileData?.phone_number || "",
                  profile_picture: null,
                });
                setValidationErrors({});
                setTouchedFields({});
              }}
              disabled={isSavingProfile}
            />
          </div>
        </div>
      </div>
    </div>
  </>,
  document.getElementById("modal-root")
)}
            </div>

            {/* RIGHT FIXED COLUMN */}
            
<div className="w-full md:px-6 lg:px-0 lg:absolute mt-[16px] lg:top-[5px] lg:left-[705px] lg:w-[320px] xl:left-[835px] xl:w-[392px] space-y-6">   <div className="bg-white rounded-xl shadow p-6 w-full">
                <h4 className="text-[18px] font-semibold mb-3">Verification</h4>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-[18px] h-[18px]">
                      {phoneVerified ? (
                        <svg
                          className="w-[18px] h-[18px] text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <circle cx="10" cy="10" r="9" fill="#10B981" />
                          <path
                            d="M6 10L9 13L14 7"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#2A1E17"
                          strokeWidth="2"
                        >
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      )}
                    </div>
                    <span className="text-[14px] text-[#3A2A1A] font-medium">
                      Phone Verification
                    </span>
                  </div>
                  {!phoneVerified ? (
                    <span
                      onClick={() => {
                        if (!userData?.phone_number && !profileData?.phone_number) {
                          toast.error("Please add your phone number in profile first");
                          setEditOpen(true);
                          return;
                        }
                        handleVerifyPhone();
                      }}
                      className="text-[#6A3EA1] font-medium cursor-pointer"
                    >
                      Verify
                    </span>
                  ) : (
                    <span className="text-green-600 font-medium text-sm">Verified</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-[18px] h-[18px]">
                      {emailVerified ? (
                        <svg
                          className="w-[18px] h-[18px] text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <circle cx="10" cy="10" r="9" fill="#10B981" />
                          <path
                            d="M6 10L9 13L14 7"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#2A1E17"
                          strokeWidth="2"
                        >
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      )}
                    </div>
                    <span className="text-[14px] text-[#3A2A1A] font-medium">
                      Email Verification
                    </span>
                  </div>
                  {emailVerified ? (
                    <span className="text-green-600 font-medium text-sm">
                      Verified
                    </span>
                  ) : (
                    <span
                      onClick={handleVerifyEmail}
                      className="text-[#6A3EA1] font-medium cursor-pointer"
                    >
                      Verify
                    </span>
                  )}
                </div>
              </div>

              {/* SKILLS SECTION */}
              <div className="bg-white rounded-xl shadow p-5 w-full">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-[18px] font-semibold">Skills Required</h4>
                </div>
                <div className="h-[1px] bg-black/10 my-4" />

                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Type a skill and press Enter to add"
                    value={currentSkill}
                    onChange={handleSkillChange}
                    onKeyDown={handleSkillKeyDown}
                    maxLength={30}
                    className="w-full h-[45px] rounded-[10px] !border !border-black/30 px-4 font-['Montserrat'] font-semibold text-[16px] text-[#040200] outline-none placeholder-gray-400"
                  />
                  {showResults && searchResults.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-h-48 overflow-y-auto">
                      <div className="flex flex-wrap gap-2">
                        {searchResults.map((skill, index) => (
                          <button
                            key={index}
                            onClick={() => addSkill(skill)}
                            className="px-3 py-1.5 bg-[#51218F] text-white rounded-full text-[12px] font-medium hover:bg-[#3D1768] transition-colors"
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-full min-h-[45px] rounded-[10px] !border !border-black/30 flex flex-wrap items-center gap-2 px-3 py-1.5 mt-2">
                  {selectedSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-1 px-3 py-1 bg-[#51218F] text-white rounded-full text-[14px] font-['Montserrat'] font-medium"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:text-gray-200 focus:outline-none rounded-full"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {selectedSkills.length === 0 && (
                    <span className="text-gray-400 text-[14px] font-['Montserrat']">
                      No skills added yet
                    </span>
                  )}
                </div>

                <div className="flex justify-center items-center gap-4 mt-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleUpdateSkills}
                      className={`border border-[#51218F] px-5 py-2 rounded-full text-[12px] font-['Montserrat'] font-semibold transition ${"text-[#51218F] bg-[#F6F0FF] hover:bg-[#51218F] hover:text-white"
                        }`}
                    >
                      Save Skills
                    </button>
                    {selectedSkills && selectedSkills.length > 0 && (
                      <p className="text-right text-[12px] font-['Montserrat'] text-[#51218F] whitespace-nowrap">
                        {selectedSkills.length}/15 skills added
                      </p>
                    )}
                  </div>
                </div>

              </div>
            </div>

           {/* DESKTOP PORTFOLIO - FIXED TABLET SPACING */}
<div
  className="
    hidden sm:block
    bg-white shadow-lg mt-6 rounded-[10px] p-6

    md:w-auto md:mx-6
    lg:w-[680px] lg:mx-0
    xl:w-[804px]

    w-[804px]
  "
>   <div className="flex justify-between items-center">
    <h3 className="text-[18px] font-semibold text-[#3A2A1A]">
      My Portfolio
    </h3>
    <div className="flex items-center gap-[10px]">
      <button
        onClick={() => setActiveModal("portfolio")}
        className="h-[29px] px-[36px] !border border-[#51218F] rounded-full text-[#6A3EA1]"
      >
        Add Portfolio
      </button>
    </div>
  </div>

  <div className="h-[1px] bg-black/10 my-4" />

  {isLoading ? (
    <div className="text-center py-10">Loading portfolio...</div>
  ) : portfolioItems.length === 0 ? (
    <div className="text-center py-10 text-gray-500">
      No portfolio items yet. Add your first project!
    </div>
  ) : (
    <div className="grid grid-cols-3 gap-4 flex-grow">
      {portfolioItems.slice(0, 3).map((item) => (
        <div
          key={item.id}
          className="relative rounded-[10px] overflow-hidden cursor-pointer group"
          onClick={() => openPortfolioLink(item)}
        >
          <img
            src={getPortfolioImage(item)}
            alt={item.title}
            className="h-[174px] w-full object-cover"
            onError={(e) => {
              e.target.src = DefaultProfilePic;
            }}
          />

          <div
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(item);
            }}
            className="absolute top-3 right-3 w-[46px] h-[46px] rounded-full bg-gradient-to-br from-[#7C3AED] to-[#2B0F4C] flex items-center justify-center shadow-[0_10px_30px_rgba(124,58,237,0.45)] cursor-pointer hover:scale-105 transition z-10"
          >
            <div className="w-[42px] h-[42px] flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="animate-pulse"
              >
                <path
                  d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polygon
                  points="18 2 22 6 12 16 8 16 8 12 18 2"
                  fill="white"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {item.title && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-3 py-2">
              <p className="text-[12px] font-semibold text-white text-center truncate">
                {item.title}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )}

  <div className="flex justify-center mt-auto pt-6">
    <button
      onClick={() => setShowPortfolioPopup(true)}
      className="text-[#6A3EA1] text-[15px] font-semibold hover:underline transition"
    >
      View All
    </button>
  </div>
</div>

            {/* ADD PORTFOLIO MODAL */}
            {activeModal === "portfolio" && (
              <>
                <div
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999]"
                  onClick={() => {
                    setActiveModal(null);
                    setPortfolioForm({
                      title: "",
                      media_link: "",
                      description: "",
                      file: null,
                    });
                    setFileName("No file chosen");
                    setPortfolioValidationErrors({
                      title: "",
                      file: "",
                      media_link: "",
                      description: "",
                    });
                  }}
                ></div>

                <div className="fixed inset-0 z-[99999] flex items-start sm:items-center justify-center p-2 sm:p-4 md:px-6 overflow-y-auto">
                  <div
                    className="bg-white rounded-[16px] sm:rounded-[24px] shadow-xl w-full max-w-[800px] max-h-[calc(100vh-20px)] sm:max-h-[calc(100vh-140px)] overflow-y-auto hide-scrollbar my-2 sm:my-0"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    <div className="p-4 sm:p-6 md:p-8">
                      <div className="flex justify-between items-center mb-4 sm:mb-6">
                        <h2 className="text-xl sm:text-[24px] font-semibold">
                          Add Portfolio
                        </h2>
                        <button
                          onClick={() => {
                            setActiveModal(null);
                            setPortfolioForm({
                              title: "",
                              media_link: "",
                              description: "",
                              file: null,
                            });
                            setFileName("No file chosen");
                            setPortfolioValidationErrors({
                              title: "",
                              file: "",
                              media_link: "",
                              description: "",
                            });
                          }}
                          className="text-gray-500 hover:text-black text-lg sm:text-xl p-1"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="mb-4 sm:mb-5">
                        <label className="block text-[13px] sm:text-[15px] font-semibold mb-1.5 sm:mb-2">
                          Work Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={portfolioForm.title}
                          onChange={(e) =>
                            handlePortfolioTitleChange(e.target.value, false)
                          }
                          maxLength={MAX_NAME_LENGTH}
                          className={`w-full !border rounded-[10px] sm:rounded-[12px] px-3 sm:px-4 py-2.5 sm:py-3 text-[13px] sm:text-[15px] focus:outline-none focus:ring-2 focus:ring-[#51218F] focus:border-transparent ${portfolioValidationErrors.title ? "border-red-500" : "border-gray-300"}`}
                          placeholder="Enter work name"
                        />
                        <div className="flex justify-between items-center mt-1">
                          {portfolioValidationErrors.title && (
                            <p className="text-red-500 text-xs">
                              {portfolioValidationErrors.title}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 ml-auto">
                            {portfolioForm.title.length}/{MAX_NAME_LENGTH}
                          </p>
                        </div>
                      </div>

                      {/* <div className="mb-4 sm:mb-5">
                        <label className="block text-[13px] sm:text-[15px] font-semibold mb-1.5 sm:mb-2">
                          Media File <span className="text-red-500">*</span>
                        </label>
                        <div className="w-full !border border-gray-300 rounded-[10px] sm:rounded-[12px] flex flex-col sm:flex-row items-start sm:items-center px-3 sm:px-4 py-3 gap-3 sm:gap-4">
                          <label className="!border border-gray-400 px-4 sm:px-5 py-2 sm:py-2 rounded-full cursor-pointer text-[13px] sm:text-[14px] hover:bg-gray-50 transition whitespace-nowrap">
                            Choose File
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                handlePortfolioFileChange(file, false);
                                if (file) setFileName(file.name);
                              }}
                            />
                          </label>
                          <span className="text-gray-500 text-[13px] sm:text-[14px] truncate w-full">
                            {portfolioForm.file?.name || fileName}
                          </span>
                        </div>
                        {portfolioValidationErrors.file && (
                          <p className="text-red-500 text-xs mt-1">
                            {portfolioValidationErrors.file}
                          </p>
                        )}
                      </div> */}
                     <div className="mb-4 sm:mb-5">
  <label className="block text-[13px] sm:text-[15px] font-semibold mb-1.5 sm:mb-2">
    Media File <span className="text-red-500">*</span>
  </label>
  <div className="w-full !border border-gray-300 rounded-[10px] sm:rounded-[12px] flex flex-col sm:flex-row items-start sm:items-center px-3 sm:px-4 py-3 gap-3 sm:gap-4">
    <label className="!border border-gray-400 px-4 sm:px-5 py-2 sm:py-2 rounded-full cursor-pointer text-[13px] sm:text-[14px] hover:bg-gray-50 transition whitespace-nowrap">
      Choose File
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            // Validate file type and size immediately
            const fileExtension = file.name.split('.').pop().toLowerCase();
            const allowedExtensions = ["jpg", "jpeg", "png", "webp"];
            
            if (!allowedExtensions.includes(fileExtension)) {
              toast.error("Only JPG, JPEG, PNG, and WEBP images are allowed");
              setPortfolioValidationErrors((prev) => ({ ...prev, file: "Only JPG, JPEG, PNG, and WEBP images are allowed" }));
              e.target.value = '';
              return;
            }
            
            // Validate file size
            const sizeError = validateFileSize(file);
            if (sizeError) {
              toast.error(sizeError);
              setPortfolioValidationErrors((prev) => ({ ...prev, file: sizeError }));
              e.target.value = '';
              return;
            }
            
            handlePortfolioFileChange(file, false);
            setFileName(file.name);
          }
        }}
      />
    </label>
    <span className="text-gray-500 text-[13px] sm:text-[14px] truncate w-full">
      {portfolioForm.file?.name || fileName}
    </span>
  </div>
  {portfolioValidationErrors.file && (
    <p className="text-red-500 text-xs mt-1">{portfolioValidationErrors.file}</p>
  )}
  {/* Helper text */}
  <p className="text-[11px] text-gray-400 mt-2">
    Only JPG, JPEG, PNG, WEBP images allowed
    Minimum file size: 100KB | Maximum file size: 50MB
  </p>
</div>

                      <div className="mb-4 sm:mb-5">
                        <label className="block text-[13px] sm:text-[15px] font-semibold mb-1.5 sm:mb-2">
                          Work Link (optional)
                        </label>
                        <input
                          type="text"
                          value={portfolioForm.media_link}
                          onChange={(e) =>
                            handlePortfolioUrlChange(e.target.value, false)
                          }
                          className={`w-full !border rounded-[10px] sm:rounded-[12px] px-3 sm:px-4 py-2.5 sm:py-3 text-[13px] sm:text-[15px] focus:outline-none focus:ring-2 focus:ring-[#51218F] focus:border-transparent ${portfolioValidationErrors.media_link ? "border-red-500" : "border-gray-300"}`}
                          placeholder="https://example.com"
                        />
                        {portfolioValidationErrors.media_link && (
                          <p className="text-red-500 text-xs mt-1">
                            {portfolioValidationErrors.media_link}
                          </p>
                        )}
                      </div>

                      <div className="mb-4 sm:mb-6">
                        <label className="block text-[13px] sm:text-[15px] font-semibold mb-1.5 sm:mb-2">
                          Work Description
                        </label>
                        <textarea
                          rows={3}
                          className="w-full !border border-gray-300 rounded-[10px] sm:rounded-[12px] px-3 sm:px-4 py-2.5 sm:py-3 text-[13px] sm:text-[15px] leading-[20px] sm:leading-[22px] focus:outline-none focus:ring-2 focus:ring-[#51218F] focus:border-transparent resize-none"
                          placeholder="Describe your work..."
                          value={portfolioForm.description}
                          onChange={(e) =>
                            handlePortfolioDescriptionChange(e.target.value, false)
                          }
                          maxLength={MAX_DESCRIPTION_LENGTH}
                        />
                        <div className="flex justify-between items-center mt-1">
                          {portfolioValidationErrors.description && (
                            <p className="text-red-500 text-xs">
                              {portfolioValidationErrors.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 ml-auto">
                            {portfolioForm.description.length}/{MAX_DESCRIPTION_LENGTH}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center">
                        <button
                          onClick={() => handleAddPortfolio(portfolioForm)}
                          disabled={
                            isSavingPortfolio ||
                            !!portfolioValidationErrors.title ||
                            !!portfolioValidationErrors.file
                          }
                          className={`bg-[#51218F] text-white px-8 sm:px-12 py-2.5 sm:py-3 rounded-full font-semibold hover:opacity-90 transition w-full sm:w-auto min-w-[120px] text-[13px] sm:text-[15px] order-1 sm:order-none ${isSavingPortfolio || portfolioValidationErrors.title || portfolioValidationErrors.file ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {isSavingPortfolio ? (
                            <div className="flex items-center justify-center gap-2">
                              <svg
                                className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              <span>Saving...</span>
                            </div>
                          ) : (
                            "Save"
                          )}
                        </button>
                        <CancelButton
                          onClick={() => {
                            setActiveModal(null);
                            setPortfolioForm({
                              title: "",
                              media_link: "",
                              description: "",
                              file: null,
                            });
                            setFileName("No file chosen");
                            setPortfolioValidationErrors({
                              title: "",
                              file: "",
                              media_link: "",
                              description: "",
                            });
                          }}
                          disabled={isSavingPortfolio}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* EDIT PORTFOLIO MODAL */}
            {showEdit && editingPortfolioItem && (
              <>
                <div
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999]"
                  onClick={() => {
                    setShowEdit(false);
                    setEditingPortfolioItem(null);
                    setEditPortfolioForm({
                      title: "",
                      media_link: "",
                      description: "",
                      file: null,
                    });
                    setPortfolioValidationErrors({
                      title: "",
                      file: "",
                      media_link: "",
                      description: "",
                    });
                  }}
                ></div>
                <div className="fixed inset-0 z-[99999] flex items-start sm:items-center justify-center p-2 sm:p-4 md:px-6 overflow-y-auto">
                  <div
                    className="bg-white rounded-[16px] sm:rounded-[24px] shadow-xl w-full max-w-[800px] max-h-[calc(100vh-20px)] sm:max-h-[calc(100vh-140px)] overflow-y-auto my-2 sm:my-0"
                    style={{
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                      WebkitOverflowScrolling: "touch",
                    }}
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                  >
                    <div className="p-4 sm:p-6 md:p-8">
                      <div className="flex justify-between items-center mb-4 sm:mb-6">
                        <h2 className="text-xl sm:text-[24px] font-semibold">
                          Edit Portfolio
                        </h2>
                        <button
                          onClick={() => {
                            setShowEdit(false);
                            setEditingPortfolioItem(null);
                            setEditPortfolioForm({
                              title: "",
                              media_link: "",
                              description: "",
                              file: null,
                            });
                            setPortfolioValidationErrors({
                              title: "",
                              file: "",
                              media_link: "",
                              description: "",
                            });
                          }}
                          className="text-gray-500 hover:text-black text-lg sm:text-xl p-1"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="mb-4 sm:mb-5">
                        <label className="block text-[13px] sm:text-[15px] font-semibold mb-1.5 sm:mb-2">
                          Work Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editPortfolioForm.title}
                          onChange={(e) =>
                            handlePortfolioTitleChange(e.target.value, true)
                          }
                          maxLength={MAX_NAME_LENGTH}
                          className={`w-full !border rounded-[10px] sm:rounded-[12px] px-3 sm:px-4 py-2.5 sm:py-3 text-[13px] sm:text-[15px] focus:outline-none focus:ring-2 focus:ring-[#51218F] focus:border-transparent ${portfolioValidationErrors.title ? "border-red-500" : "border-gray-300"}`}
                          placeholder="Enter work name"
                        />
                        <div className="flex justify-between items-center mt-1">
                          {portfolioValidationErrors.title && (
                            <p className="text-red-500 text-xs">
                              {portfolioValidationErrors.title}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 ml-auto">
                            {editPortfolioForm.title.length}/{MAX_NAME_LENGTH}
                          </p>
                        </div>
                      </div>

                      {/* <div className="mb-4 sm:mb-5">
                        <label className="block text-[13px] sm:text-[15px] font-semibold mb-1.5 sm:mb-2">
                          Media File{" "}
                          {!editingPortfolioItem?.file && (
                            <span className="text-red-500">*</span>
                          )}
                        </label>
                        <div className="w-full !border border-gray-300 rounded-[10px] sm:rounded-[12px] flex flex-col sm:flex-row items-start sm:items-center px-3 sm:px-4 py-3 gap-3 sm:gap-4">
                          <label className="!border border-gray-400 px-4 sm:px-5 py-2 sm:py-2 rounded-full cursor-pointer text-[13px] sm:text-[14px] hover:bg-gray-50 transition whitespace-nowrap text-center w-full sm:w-auto">
                            Choose File
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                handlePortfolioFileChange(file, true);
                              }}
                            />
                          </label>
                          <span className="text-gray-500 text-[13px] sm:text-[14px] truncate w-full break-all">
                            {editPortfolioForm.file?.name ||
                              (editingPortfolioItem?.file
                                ? "Current file retained"
                                : "No file chosen")}
                          </span>
                        </div>
                        {portfolioValidationErrors.file && (
                          <p className="text-red-500 text-xs mt-1">
                            {portfolioValidationErrors.file}
                          </p>
                        )}
                      </div> */}
                      <div className="mb-4 sm:mb-5">
  <label className="block text-[13px] sm:text-[15px] font-semibold mb-1.5 sm:mb-2">
    Media File{" "}
    {!editingPortfolioItem?.file && (
      <span className="text-red-500">*</span>
    )}
  </label>
  <div className="w-full !border border-gray-300 rounded-[10px] sm:rounded-[12px] flex flex-col sm:flex-row items-start sm:items-center px-3 sm:px-4 py-3 gap-3 sm:gap-4">
    <label className="!border border-gray-400 px-4 sm:px-5 py-2 sm:py-2 rounded-full cursor-pointer text-[13px] sm:text-[14px] hover:bg-gray-50 transition whitespace-nowrap text-center w-full sm:w-auto">
      Choose File
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            // Validate file type and size immediately
            const fileExtension = file.name.split('.').pop().toLowerCase();
            const allowedExtensions = ["jpg", "jpeg", "png", "webp"];
            
            if (!allowedExtensions.includes(fileExtension)) {
              toast.error("Only JPG, JPEG, PNG, and WEBP images are allowed");
              setPortfolioValidationErrors((prev) => ({ ...prev, file: "Only JPG, JPEG, PNG, and WEBP images are allowed" }));
              e.target.value = '';
              return;
            }
            
            // Validate file size
            const sizeError = validateFileSize(file);
            if (sizeError) {
              toast.error(sizeError);
              setPortfolioValidationErrors((prev) => ({ ...prev, file: sizeError }));
              e.target.value = '';
              return;
            }
            
            handlePortfolioFileChange(file, true);
          }
        }}
      />
    </label>
    <span className="text-gray-500 text-[13px] sm:text-[14px] truncate w-full break-all">
      {editPortfolioForm.file?.name ||
        (editingPortfolioItem?.file
          ? "Current file retained"
          : "No file chosen")}
    </span>
  </div>
  {portfolioValidationErrors.file && (
    <p className="text-red-500 text-xs mt-1">{portfolioValidationErrors.file}</p>
  )}
  {/* Helper text */}
  <p className="text-[11px] text-gray-400 mt-2">
    Minimum file size: 100KB | Maximum file size: 50MB
  </p>
</div>

                      <div className="mb-4 sm:mb-5">
                        <label className="block text-[13px] sm:text-[15px] font-semibold mb-1.5 sm:mb-2">
                          Work Link (optional)
                        </label>
                        <input
                          type="text"
                          value={editPortfolioForm.media_link}
                          onChange={(e) =>
                            handlePortfolioUrlChange(e.target.value, true)
                          }
                          className={`w-full !border rounded-[10px] sm:rounded-[12px] px-3 sm:px-4 py-2.5 sm:py-3 text-[13px] sm:text-[15px] focus:outline-none focus:ring-2 focus:ring-[#51218F] focus:border-transparent ${portfolioValidationErrors.media_link ? "border-red-500" : "border-gray-300"}`}
                          placeholder="https://example.com"
                        />
                        {portfolioValidationErrors.media_link && (
                          <p className="text-red-500 text-xs mt-1">
                            {portfolioValidationErrors.media_link}
                          </p>
                        )}
                      </div>

                      <div className="mb-5 sm:mb-6">
                        <label className="block text-[13px] sm:text-[15px] font-semibold mb-1.5 sm:mb-2">
                          Work Description
                        </label>
                        <textarea
                          rows={3}
                          value={editPortfolioForm.description}
                          onChange={(e) =>
                            handlePortfolioDescriptionChange(e.target.value, true)
                          }
                          maxLength={MAX_DESCRIPTION_LENGTH}
                          className="w-full !border border-gray-300 rounded-[10px] sm:rounded-[12px] px-3 sm:px-4 py-2.5 sm:py-3 text-[13px] sm:text-[15px] leading-[20px] sm:leading-[22px] focus:outline-none focus:ring-2 focus:ring-[#51218F] focus:border-transparent resize-none"
                          placeholder="Describe your work..."
                        />
                        <div className="flex justify-between items-center mt-1">
                          {portfolioValidationErrors.description && (
                            <p className="text-red-500 text-xs">
                              {portfolioValidationErrors.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 ml-auto">
                            {editPortfolioForm.description.length}/{MAX_DESCRIPTION_LENGTH}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                        <button
  onClick={() => handleEditPortfolio(editPortfolioForm)}
  disabled={
    isSavingPortfolio ||
    !!portfolioValidationErrors.title ||
    !!portfolioValidationErrors.file
  }
  className={`bg-[#51218F] text-white px-4 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold hover:opacity-90 transition w-full sm:w-auto min-w-[100px] text-[14px] sm:text-[15px] order-1 sm:order-none ${isSavingPortfolio || portfolioValidationErrors.title || portfolioValidationErrors.file ? "opacity-50 cursor-not-allowed" : ""}`}
>
  {isSavingPortfolio ? (
    <div className="flex items-center justify-center gap-2">
      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Saving...</span>
    </div>
  ) : (
    "Save"
  )}
</button>
                        <CancelButton
                          onClick={() => {
                            setShowEdit(false);
                            setEditingPortfolioItem(null);
                            setEditPortfolioForm({
                              title: "",
                              media_link: "",
                              description: "",
                              file: null,
                            });
                            setPortfolioValidationErrors({
                              title: "",
                              file: "",
                              media_link: "",
                              description: "",
                            });
                          }}
                        />
                        <button
  onClick={() => handleDeletePortfolio(editingPortfolioItem.id)}
  disabled={isDeleting}
  className={`bg-red-600 text-white px-4 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-red-700 transition w-full sm:w-auto min-w-[100px] text-[14px] sm:text-[15px] order-3 sm:order-none ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
>
  {isDeleting ? (
    <div className="flex items-center justify-center gap-2">
      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Deleting...</span>
    </div>
  ) : (
    "Delete"
  )}
</button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

{/* MOBILE PORTFOLIO */}

<div className="block sm:hidden  rounded-[14px] shadow mt-8 ...">  <div className="flex justify-between items-center mb-3">
    <h3 className="text-[14px] sm:text-[15px] md:text-[16px] font-semibold text-[#2A1E17]">
      My Portfolio
    </h3>
    <button
      onClick={() => setActiveModal("portfolio")}
      className="!border border-[#51218F] text-[#51218F] text-[11px] sm:text-[12px] md:text-[13px] px-3 sm:px-4 md:px-5 py-[2px] sm:py-[3px] md:py-[4px] rounded-full whitespace-nowrap"
    >
      Add Portfolio
    </button>
  </div>

  <div className="flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto pb-2 md:pb-3 scrollbar-hide">
    {isLoading ? (
      <div className="text-center w-full py-4 text-[13px] sm:text-[14px] md:text-[15px]">Loading...</div>
    ) : portfolioItems.length === 0 ? (
      <div className="text-center w-full py-4 text-gray-500 text-[13px] sm:text-[14px] md:text-[15px]">
        No portfolio items
      </div>
    ) : (
      portfolioItems.slice(0, 3).map((item, i) => (
        <div
          key={i}
          className="relative min-w-[110px] sm:min-w-[130px] md:min-w-[160px] lg:min-w-[180px] h-[80px] sm:h-[95px] md:h-[110px] rounded-[10px] overflow-hidden cursor-pointer group flex-shrink-0"
          onClick={() => openPortfolioLink(item)}
        >
          <img
            src={getPortfolioImage(item)}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = DefaultProfilePic;
            }}
          />

          {/* Edit Button - Top Right */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(item);
            }}
            className="absolute top-1 right-1 w-[24px] h-[24px] sm:w-[28px] sm:h-[28px] md:w-[32px] md:h-[32px] bg-[#51218F] text-white rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition z-10"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="sm:w-[14px] sm:h-[14px] md:w-[16px] md:h-[16px]"
            >
              <path
                d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polygon
                points="18 2 22 6 12 16 8 16 8 12 18 2"
                fill="white"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Title Overlay - Bottom Center */}
          {item.title && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-1.5 py-1 sm:px-2 sm:py-1 md:px-2.5 md:py-1.5">
              <p className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] font-semibold text-white text-center truncate">
                {item.title}
              </p>
            </div>
          )}
        </div>
      ))
    )}
  </div>

  {/* View All Button */}
  {portfolioItems.length > 0 && (
    <div className="flex justify-center mt-3 sm:mt-4 md:mt-5 pt-2">
      <button
        onClick={() => setShowPortfolioPopup(true)}
        className="text-[#6A3EA1] text-[12px] sm:text-[13px] md:text-[14px] font-semibold hover:underline transition flex items-center gap-1"
      >
        View All ({portfolioItems.length} {portfolioItems.length === 1 ? 'item' : 'items'})
        <svg
          className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  )}
</div>

            {/* DESKTOP REVIEWS - SAME WIDTH AS PROFILE (804px) */}
<div
  className="
    hidden sm:block
    bg-white shadow-lg mt-6 rounded-[10px] p-6

    md:w-auto md:mx-6
    lg:w-[680px] lg:mx-0
    xl:w-[804px]

    w-[804px]
  "
>              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[18px] font-semibold text-[#3A2A1A]">
                  Reviews
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {renderStars(reviewStats.avg_rating)}
                  </div>
                  <span className="text-[14px] text-gray-600">
                    {reviewStats.avg_rating.toFixed(1)} (
                    {reviewStats.total_reviews}{" "}
                    {reviewStats.total_reviews === 1 ? "review" : "reviews"})
                  </span>
                </div>
              </div>

              <div className="w-full h-[1px] bg-black/10 mb-6"></div>

              {isReviewsLoading ? (
                <div className="text-center py-10">
                  <div className="animate-pulse space-y-4">
                    <div className="h-20 bg-gray-200 rounded-lg"></div>
                    <div className="h-20 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              ) : latestReviews.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <svg
                    className="w-12 h-12 mx-auto mb-3 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p>No reviews yet</p>
                  <p className="text-sm mt-1">
                    Be the first to leave a review!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {latestReviews.map((rev, index) => (
                    <div
                      key={rev.id || index}
                      className="bg-[#F8F9FA] rounded-lg p-4 transition-all hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={
                            rev.reviewer_profile_picture || DefaultProfilePic
                          }
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                          alt="reviewer"
                          onError={(e) => {
                            e.target.src = DefaultProfilePic;
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                            <div>
                              <p className="font-semibold text-[#3A2A1A] text-[14px]">
                                {rev.reviewer_name || "Anonymous"}
                              </p>
                              <p className="text-[11px] text-gray-500">
                                {rev.reviewer_role || "Collaborator"}
                              </p>
                            </div>
                            <div className="flex items-center">
                              {renderStars(rev.rating || 5)}
                            </div>
                          </div>
                          <p className="text-[13px] text-gray-600 leading-relaxed">
                            {rev.comment ||
                              "Great experience working with this freelancer."}
                          </p>
                          {rev.created_at && (
                            <p className="text-[10px] text-gray-400 mt-2">
                              {new Date(rev.created_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {latestReviews.length > 0 && (
                <div className="flex justify-center mt-6 pt-2">
                  <button
                    onClick={handleViewAllReviews}
                    className="text-[#6A3EA1] text-[14px] font-semibold hover:text-[#51218F] transition-colors flex items-center gap-1"
                  >
                    View All Reviews{" "}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* PORTFOLIO VIEW ALL POPUP */}
            {showPortfolioPopup && (
              <>
                <div
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999]"
                  onClick={() => setShowPortfolioPopup(false)}
                ></div>
                <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4 py-4">
                  <div className="bg-white rounded-[24px] shadow-xl w-full max-w-4xl mx-4 overflow-hidden">
                    <div className="p-4 sm:p-6">
                      <div className="flex justify-between items-center mb-4 sm:mb-6">
                        <h2 className="text-[20px] sm:text-[24px] font-semibold text-[#2A1E17]">
                          My Portfolio
                        </h2>
                        <button
                          onClick={() => setShowPortfolioPopup(false)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-lg transition flex-shrink-0"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Scrollable Grid - Removed pagination buttons */}
                      <div
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4 pr-1"
                        style={{
                          maxHeight: '70vh',
                          overflowY: 'auto',
                          scrollbarWidth: 'thin',
                          msOverflowStyle: 'auto'
                        }}
                      >
                        {portfolioItems.map((item) => (
                          <div
                            key={item.id}
                            className="group relative bg-white rounded-[12px] overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                            onClick={() => openPortfolioLink(item)}
                          >
                            <div className="relative h-[140px] sm:h-[160px] overflow-hidden">
                              <img
                                src={getPortfolioImage(item)}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                  e.target.src = DefaultProfilePic;
                                }}
                              />
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditModal(item);
                                }}
                                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition z-10"
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="hover:animate-none"
                                >
                                  <path
                                    d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"
                                    stroke="#51218F"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <polygon
                                    points="18 2 22 6 12 16 8 16 8 12 18 2"
                                    fill="#51218F"
                                    stroke="#51218F"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>

                              {/* Title Overlay - Bottom Center */}
                              {item.title && (
                                <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5" style={{
                                  background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.5), transparent)'
                                }}>
                                  <p className="text-[10px] sm:text-[11px] font-semibold text-white text-center truncate">
                                    {item.title}
                                  </p>
                                </div>
                              )}
                            </div>
                            {item.description && (
                              <div className="p-2">
                                <p className="text-[10px] text-gray-500 line-clamp-2" style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}>
                                  {item.description}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Portfolio Count Display */}
                      {portfolioItems.length > 0 && (
                        <div className="text-center mt-4 pt-2">
                          <p className="text-[12px] text-gray-500">
                            Showing all {portfolioItems.length} {portfolioItems.length === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* MOBILE REVIEWS */}
            <div className="block sm:hidden  shadow-lg mt-15 rounded-[12px] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[16px] font-semibold text-[#3A2A1A]">
                  Reviews
                </h3>
                <div className="flex items-center gap-1">
                  <div className="flex items-center">
                    {renderStars(reviewStats.avg_rating)}
                  </div>
                  <span className="text-[12px] text-gray-600">
                    ({reviewStats.total_reviews})
                  </span>
                </div>
              </div>
              <div className="w-full h-[1px] bg-black/10 mb-4"></div>
              {isReviewsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-pulse space-y-3">
                    <div className="h-16 bg-gray-200 rounded-lg"></div>
                    <div className="h-16 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              ) : latestReviews.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <svg
                    className="w-10 h-10 mx-auto mb-2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p className="text-sm">No reviews yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {latestReviews.slice(0, 2).map((rev, index) => (
                    <div
                      key={rev.id || index}
                      className="bg-[#F8F9FA] rounded-lg p-3"
                    >
                      <div className="flex items-start gap-2">
                        <img
                          src={
                            rev.reviewer_profile_picture || DefaultProfilePic
                          }
                          className="w-8 h-8 rounded-full object-cover"
                          alt=""
                          onError={(e) => {
                            e.target.src = DefaultProfilePic;
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-[13px] text-[#3A2A1A]">
                              {rev.reviewer_name || "Anonymous"}
                            </p>
                            <div className="flex items-center">
                              {renderStars(rev.rating || 5)}
                            </div>
                          </div>
                          <p className="text-[12px] text-gray-600 leading-relaxed line-clamp-2">
                            {rev.comment ||
                              "Great experience working with this freelancer."}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {latestReviews.length > 0 && (
                <p
                  onClick={handleViewAllReviews}
                  className="text-center text-[#6A3EA1] text-[12px] font-medium cursor-pointer hover:underline mt-4 pt-1"
                >
                  View All ({reviewStats.total_reviews})
                </p>
              )}
            </div>
          </div>

          <div className="-mx-4">
            <Footer />
          </div>
        </div>

        {/* REVIEWS VIEW ALL POPUP - REMOVED CLOSE BUTTON, ONLY KEPT X */}
        {showReviewsPopup && (
          <>
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999]"
              onClick={() => setShowReviewsPopup(false)}
            ></div>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4 py-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                  <div>
                    <h2 className="text-xl font-semibold text-[#2A1E17]">
                      All Reviews
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center">
                        {renderStars(reviewStats.avg_rating)}
                      </div>
                      <span className="text-sm text-gray-600">
                        {reviewStats.avg_rating.toFixed(1)} ·{" "}
                        {reviewStats.total_reviews}{" "}
                        {reviewStats.total_reviews === 1 ? "review" : "reviews"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowReviewsPopup(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {allReviews.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <svg
                        className="w-16 h-16 mx-auto mb-4 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <p>No reviews yet</p>
                      <p className="text-sm mt-1">
                        Be the first to leave a review!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {allReviews.map((rev, index) => (
                        <div
                          key={rev.id || index}
                          className="bg-[#F8F9FA] rounded-xl p-4 transition-all hover:shadow-md"
                        >
                          <div className="flex gap-3">
                            <img
                              src={
                                rev.reviewer_profile_picture ||
                                DefaultProfilePic
                              }
                              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                              alt="reviewer"
                              onError={(e) => {
                                e.target.src = DefaultProfilePic;
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                                <div>
                                  <h4 className="font-semibold text-[14px] text-[#2A1E17]">
                                    {rev.reviewer_name || "Anonymous"}
                                  </h4>
                                  <p className="text-[11px] text-gray-500">
                                    {rev.reviewer_role || "Collaborator"}
                                  </p>
                                </div>
                                <div className="flex items-center">
                                  {renderStars(rev.rating || 5)}
                                </div>
                              </div>
                              <p className="text-[13px] text-gray-600 leading-relaxed">
                                {rev.comment ||
                                  "Great experience working with this freelancer."}
                              </p>
                              {rev.created_at && (
                                <p className="text-[10px] text-gray-400 mt-2">
                                  {new Date(rev.created_at).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    },
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Removed Close button, only X button remains */}
              </div>
            </div>
          </>
        )}
      </div>

      {/* PHONE INPUT POPUP - FIXED FOR MOBILE */}
      {showPhonePopup && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99998]"
            onClick={() => {
              setShowPhonePopup(false);
              setPhoneNumber("");
            }}
          />
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <div className="relative w-full max-w-[500px] sm:max-w-[600px] md:max-w-[740px] min-h-[400px] rounded-[32px] border-[1.5px] border-white bg-white/70 shadow-[0_0_10px_0_#FFFFFF] flex flex-col items-center justify-center gap-4 md:gap-6 p-4 sm:p-6 md:p-8 my-8 mx-2 sm:mx-4">
              <div
                className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 cursor-pointer select-none z-10"
                onClick={() => {
                  setShowPhonePopup(false);
                  setPhoneNumber("");
                }}
              >
                <div
                  className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(3,3,3,0.9) 0%, rgba(81,33,143,0.9) 100%)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 md:h-4 md:w-4 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </div>
                <span className="text-[#030303] poppins-font text-sm md:text-lg font-medium">
                  Back
                </span>
              </div>

              <div className="w-full max-w-md text-center mt-8 md:mt-10">
                <h1 className="text-xl sm:text-2xl md:text-[32px] font-semibold text-[#000000] poppins-font">
                  Verify Phone Number
                </h1>
                <p className="text-[#3D1768] text-xs sm:text-sm md:text-base poppins-font mb-6 md:mb-10 px-3 sm:px-4">
                  Enter your phone number to receive a verification code
                </p>

                {currentUser?.phone_number && (
                  <div className="mb-4 p-2 sm:p-3 bg-purple-50 rounded-lg border border-purple-200 mx-2 sm:mx-0">
                    <div className="flex items-center gap-2 justify-center flex-wrap">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-[#51218F]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <p className="text-xs sm:text-sm font-medium text-[#51218F]">
                        Registered number:{" "}
                        <span className="font-bold">
                          {currentUser.phone_number}
                        </span>
                      </p>
                    </div>
                    <p className="text-[10px] sm:text-xs text-[#51218F]/70 mt-1">
                      Please enter the same number for verification
                    </p>
                  </div>
                )}

                <div className="mb-6 md:mb-8 px-2 sm:px-0">
                  <label className="block text-xs sm:text-sm font-medium text-[#030303] mb-2 md:mb-3 poppins-font text-left">
                    Phone Number
                  </label>
                  <div className="flex items-stretch mb-3 md:mb-4">
                    <div className="flex-shrink-0">
                      <div className="h-[42px] sm:h-[48px] md:h-[52px] flex items-center px-3 sm:px-4 border border-r-0 border-gray-300 rounded-l-xl bg-gray-50/70 backdrop-blur-sm">
                        <span className="text-gray-700 font-medium poppins-font text-xs sm:text-sm">
                          🇮🇳 +91
                        </span>
                      </div>
                    </div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        const numbersOnly = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                        setPhoneNumber(numbersOnly);
                      }}
                      placeholder={
                        currentUser?.phone_number
                          ? currentUser.phone_number
                            .replace(/\D/g, "")
                            .slice(-10)
                          : "12345 67890"
                      }
                      maxLength={10}
                      className="flex-1 h-[42px] sm:h-[48px] md:h-[52px] px-3 sm:px-4 text-sm sm:text-base border border-gray-300 border-l-0 rounded-r-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-[#3D1768] focus:border-[#3D1768] outline-none transition-all text-[#030303] poppins-font"
                    />
                  </div>

                  {currentUser?.phone_number && (
                    <button
                      onClick={() => {
                        const cleanPhone = currentUser.phone_number
                          .replace(/\D/g, "")
                          .slice(-10);
                        setPhoneNumber(cleanPhone);
                        toast.success("Phone number auto-filled");
                      }}
                      className="text-[10px] sm:text-xs text-[#51218F] hover:text-[#3D1768] font-medium mb-3 underline"
                    >
                      Use registered number
                    </button>
                  )}

                  <div className="flex justify-between items-center mt-2 md:mt-3">
                    <p className="text-[10px] sm:text-sm text-[#030303]/70 poppins-font">
                      Enter 10-digit mobile number
                    </p>
                    <p
                      className={`text-[10px] sm:text-sm font-medium poppins-font ${phoneNumber.length === 10 ? "text-[#3D1768]" : "text-[#030303]/70"}`}
                    >
                      {phoneNumber.length}/10
                    </p>
                  </div>

                  {currentUser?.phone_number &&
                    phoneNumber.length === 10 &&
                    phoneNumber !==
                    currentUser.phone_number.replace(/\D/g, "").slice(-10) && (
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-[10px] sm:text-xs text-yellow-700">
                          ⚠️ This number doesn't match your registered phone
                          number. Please use your registered number for
                          verification.
                        </p>
                      </div>
                    )}
                </div>

                <button
                  onClick={handlePhoneSubmit}
                  disabled={phoneNumber.length !== 10 || isVerifying}
                  type="button"
                  className="group relative overflow-hidden w-full max-w-[400px] sm:max-w-[500px] h-10 sm:h-12 md:h-[48px] rounded-[30px] bg-gradient-to-r from-[#3D1768] to-[#030303] px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-white text-sm sm:text-base md:text-lg font-medium poppins-font border border-white/10 shadow-lg hover:border-white/30 hover:shadow-2xl hover:shadow-purple-900/50 active:scale-95 transition-all duration-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
                >
                  <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 transition-transform duration-1000 ease-out group-hover:translate-x-[100%]" />
                  <span className="absolute inset-0 rounded-[30px] bg-white/10 scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative z-10 group-hover:scale-105 transition-transform duration-300">
                    {isVerifying ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs sm:text-sm">Sending...</span>
                      </div>
                    ) : (
                      "Send OTP"
                    )}
                  </span>
                </button>

                {!currentUser?.phone_number && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">
                      No phone number found in your profile
                    </p>
                    <button
                      onClick={() => {
                        setShowPhonePopup(false);
                        setEditOpen(true);
                      }}
                      className="text-[#51218F] hover:text-[#3D1768] text-xs sm:text-sm font-semibold underline"
                    >
                      Add phone number in profile settings →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* EMAIL VERIFICATION POPUP - FIXED FOR MOBILE */}
      {showEmailPopup && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99998]"
            onClick={() => {
              if (!isVerifying) {
                setShowEmailPopup(false);
                setEmail("");
              }
            }}
          />
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <div className="relative w-full max-w-[500px] sm:max-w-[600px] md:max-w-[740px] min-h-[400px] rounded-[32px] border-[1.5px] border-white bg-white/70 shadow-[0_0_10px_0_#FFFFFF] flex flex-col items-center justify-center gap-4 md:gap-6 p-4 sm:p-6 md:p-8 my-8 mx-2 sm:mx-4">
              {isVerifying && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-[32px]">
                  <div className="flex flex-col items-center gap-3 md:gap-4 p-4">
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border-3 sm:border-4 border-gray-200 rounded-full"></div>
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border-3 sm:border-4 border-[#51218F] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-[#51218F] font-semibold text-sm sm:text-base md:text-lg">
                        Sending OTP...
                      </p>
                      <p className="text-gray-500 text-[10px] sm:text-xs md:text-sm mt-1 md:mt-2">
                        Please wait while we send the verification code
                      </p>
                    </div>
                    <div className="flex gap-2 md:gap-3 mt-1 md:mt-2">
                      <div
                        className="w-2 h-2 md:w-2.5 md:h-2.5 bg-[#51218F] rounded-full animate-bounce"
                        style={{ animationDelay: "0s" }}
                      ></div>
                      <div
                        className="w-2 h-2 md:w-2.5 md:h-2.5 bg-[#51218F] rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 md:w-2.5 md:h-2.5 bg-[#51218F] rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div
                className={`absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 cursor-pointer select-none z-10 ${isVerifying ? "opacity-50 pointer-events-none" : ""}`}
                onClick={() => {
                  if (!isVerifying) {
                    setShowEmailPopup(false);
                    setEmail("");
                  }
                }}
              >
                <div
                  className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(3,3,3,0.9) 0%, rgba(81,33,143,0.9) 100%)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 md:h-4 md:w-4 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </div>
                <span className="text-[#030303] poppins-font text-sm md:text-lg font-medium">
                  Back
                </span>
              </div>

              <div className="w-full max-w-md text-center mt-8 md:mt-10">
                <h1 className="text-xl sm:text-2xl md:text-[32px] font-semibold text-[#000000] poppins-font">
                  Verify Email Address
                </h1>
                <p className="text-[#3D1768] text-xs sm:text-sm md:text-base poppins-font mb-6 md:mb-10 px-3 sm:px-4">
                  Enter your registered email address to receive a verification code
                </p>

                <div className="mb-4 p-2 sm:p-3 bg-purple-50 rounded-lg border border-purple-200 mx-2 sm:mx-0">
                  <div className="flex items-center gap-2 justify-center flex-wrap">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-[#51218F]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-xs sm:text-sm font-medium text-[#51218F]">
                      Registered email:{" "}
                      <span className="font-bold">
                        {profileData?.email || currentUser?.email || "Not set"}
                      </span>
                    </p>
                  </div>
                  <p className="text-[10px] sm:text-xs text-[#51218F]/70 mt-1">
                    You must use this email for verification
                  </p>
                </div>

                <div className="mb-6 md:mb-8 px-2 sm:px-0">
                  <label className="block text-xs sm:text-sm font-medium text-[#030303] mb-2 md:mb-3 poppins-font text-left">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                    placeholder={
                      profileData?.email ||
                      currentUser?.email ||
                      "Enter your Gmail address"
                    }
                    disabled={isVerifying}
                    className={`w-full h-[42px] sm:h-[48px] md:h-[52px] px-3 sm:px-4 text-sm sm:text-base border ${isValidGmail(email) ? "border-gray-300" : "border-red-300"} rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-[#3D1768] focus:border-[#3D1768] outline-none transition-all text-[#030303] poppins-font placeholder:text-[#030303]/50 ${isVerifying ? "opacity-50 cursor-not-allowed" : ""}`}
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2 md:mt-3">
                    <p className="text-[10px] sm:text-sm text-[#030303]/70 poppins-font">
                      {isValidGmail(email)
                        ? "We'll send a 6-digit verification code to this email"
                        : "Please enter a valid Gmail address (@gmail.com)"}
                    </p>
                    {email && !isValidGmail(email) && (
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-red-500 text-[10px] sm:text-xs">Invalid email</span>
                      </div>
                    )}
                  </div>

                  {email &&
                    profileData?.email &&
                    email.toLowerCase() !== profileData.email.toLowerCase() && (
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-[10px] sm:text-xs text-yellow-700">
                          ⚠️ This email doesn't match your registered email.
                          Please use your registered email for verification.
                        </p>
                      </div>
                    )}

                  {rateLimitError && (
                    <div className="mt-3 p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-xs sm:text-sm text-yellow-800">
                          {rateLimitError}
                        </p>
                      </div>
                      {resendTime > 0 && (
                        <p className="text-[10px] sm:text-xs text-yellow-700 mt-2">
                          Please wait {resendTime} seconds before trying again
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleEmailSubmit}
                  disabled={
                    !isValidGmail(email) ||
                    isVerifying ||
                    (profileData?.email &&
                      email.toLowerCase() !== profileData.email.toLowerCase())
                  }
                  type="button"
                  className="group relative overflow-hidden w-full max-w-[400px] sm:max-w-[500px] h-10 sm:h-12 md:h-[48px] rounded-[30px] bg-gradient-to-r from-[#3D1768] to-[#030303] px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-white text-sm sm:text-base md:text-lg font-medium poppins-font border border-white/10 shadow-lg hover:border-white/30 hover:shadow-2xl hover:shadow-purple-900/50 active:scale-95 transition-all duration-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
                >
                  <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 transition-transform duration-1000 ease-out group-hover:translate-x-[100%]" />
                  <span className="absolute inset-0 rounded-[30px] bg-white/10 scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative z-10 group-hover:scale-105 transition-transform duration-300">
                    {isVerifying ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs sm:text-sm">Sending...</span>
                      </div>
                    ) : (
                      "Send OTP"
                    )}
                  </span>
                </button>

                {resendTime > 0 && resendTime < 60 && (
                  <p className="text-center text-[10px] sm:text-xs text-gray-500 mt-4">
                    Please wait {resendTime} seconds before requesting another OTP
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* EMAIL SETUP POPUP (when no email exists) */}
      {showEmailSetupPopup && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99998]"
            onClick={() => setShowEmailSetupPopup(false)}
          />
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <div className="relative w-full max-w-[500px] sm:max-w-[600px] md:max-w-[740px] min-h-[400px] rounded-[32px] border-[1.5px] border-white bg-white/70 shadow-[0_0_10px_0_#FFFFFF] flex flex-col items-center justify-center gap-4 md:gap-6 p-4 sm:p-6 md:p-8 my-8 mx-2 sm:mx-4">
              <div
                className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 cursor-pointer select-none z-10"
                onClick={() => setShowEmailSetupPopup(false)}
              >
                <div
                  className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(3,3,3,0.9) 0%, rgba(81,33,143,0.9) 100%)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 md:h-4 md:w-4 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </div>
                <span className="text-[#030303] poppins-font text-sm md:text-lg font-medium">
                  Back
                </span>
              </div>

              <div className="w-full max-w-md text-center mt-8 md:mt-10">
                <h1 className="text-xl sm:text-2xl md:text-[32px] font-semibold text-[#000000] poppins-font">
                  Add Email Address
                </h1>
                <p className="text-[#3D1768] text-xs sm:text-sm md:text-base poppins-font mb-6 md:mb-10 px-3 sm:px-4">
                  Please add your email address before verification
                </p>

                <div className="mb-6 md:mb-8 px-2 sm:px-0">
                  <label className="block text-xs sm:text-sm font-medium text-[#030303] mb-2 md:mb-3 poppins-font text-left">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter your email address"
                    disabled={isSavingEmail}
                    className={`w-full h-[42px] sm:h-[48px] md:h-[52px] px-3 sm:px-4 text-sm sm:text-base border ${isValidEmail(newEmail) ? "border-gray-300" : "border-red-300"} rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-[#3D1768] focus:border-[#3D1768] outline-none transition-all text-[#030303] poppins-font placeholder:text-[#030303]/50 ${isSavingEmail ? "opacity-50 cursor-not-allowed" : ""}`}
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2 md:mt-3">
                    <p className="text-[10px] sm:text-sm text-[#030303]/70 poppins-font">
                      We'll send a 6-digit verification code to this email
                    </p>
                    {newEmail && !isValidEmail(newEmail) && (
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-red-500 text-[10px] sm:text-xs">Invalid email</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleSaveEmail}
                  disabled={!isValidEmail(newEmail) || isSavingEmail}
                  type="button"
                  className="group relative overflow-hidden w-full max-w-[400px] sm:max-w-[500px] h-10 sm:h-12 md:h-[48px] rounded-[30px] bg-gradient-to-r from-[#3D1768] to-[#030303] px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-white text-sm sm:text-base md:text-lg font-medium poppins-font border border-white/10 shadow-lg hover:border-white/30 hover:shadow-2xl hover:shadow-purple-900/50 active:scale-95 transition-all duration-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
                >
                  <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 transition-transform duration-1000 ease-out group-hover:translate-x-[100%]" />
                  <span className="absolute inset-0 rounded-[30px] bg-white/10 scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative z-10 group-hover:scale-105 transition-transform duration-300">
                    {isSavingEmail ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs sm:text-sm">Saving...</span>
                      </div>
                    ) : (
                      "Save & Continue"
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* OTP VERIFICATION POPUP - FIXED FOR MOBILE */}
      {showOTPPopup && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99998]"
            onClick={() => {
              setShowOTPPopup(false);
              setOtp(["", "", "", "", "", ""]);
              setResendTime(45);
              if (currentVerificationType === "phone") {
                setShowPhonePopup(true);
              } else {
                setShowEmailPopup(true);
              }
            }}
          />
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <div className="relative w-full max-w-[500px] sm:max-w-[600px] md:max-w-[740px] min-h-[400px] rounded-[32px] border-[1.5px] border-white bg-white/70 shadow-[0_0_10px_0_#FFFFFF] flex flex-col items-center justify-center gap-4 md:gap-6 p-4 sm:p-6 md:p-8 my-8 mx-2 sm:mx-4">
              <div
                className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 cursor-pointer select-none z-10"
                onClick={() => {
                  setShowOTPPopup(false);
                  setOtp(["", "", "", "", "", ""]);
                  setResendTime(45);
                  if (currentVerificationType === "phone") {
                    setShowPhonePopup(true);
                  } else {
                    setShowEmailPopup(true);
                  }
                }}
              >
                <div
                  className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(3,3,3,0.9) 0%, rgba(81,33,143,0.9) 100%)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 md:h-4 md:w-4 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </div>
                <span className="text-[#030303] poppins-font text-sm md:text-lg font-medium">
                  Back
                </span>
              </div>

              <div className="w-full max-w-md text-center mt-8 md:mt-10">
                <h1 className="text-xl sm:text-2xl md:text-[32px] font-semibold text-[#000000] poppins-font">
                  Enter OTP
                </h1>
                <p className="text-[#3D1768] text-xs sm:text-sm md:text-base poppins-font mb-6 md:mb-10 px-3 sm:px-4">
                  We've sent a 6-digit OTP to your{" "}
                  <span className="font-semibold text-[#51218F]">
                    {currentVerificationType === "phone" ? "Phone Number" : "Email Address"}
                  </span>
                  . Please enter it below to continue.
                </p>

                {rateLimitError && (
                  <div className="mb-4 p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg mx-2 sm:mx-0">
                    <p className="text-[10px] sm:text-xs text-yellow-800">{rateLimitError}</p>
                  </div>
                )}

                <div className="flex justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 mb-6 md:mb-8 px-2 sm:px-0">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="relative flex-shrink-0">
                      <input
                        value={otp[i] || ""}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !otp[i] && i > 0) {
                            document.getElementById(`otp-${i - 1}`)?.focus();
                          } else if (e.key !== "Backspace" && /^[0-9]$/.test(e.key) && otp[i] && i < 5) {
                            setTimeout(() => {
                              document.getElementById(`otp-${i + 1}`)?.focus();
                            }, 10);
                          }
                        }}
                        id={`otp-${i}`}
                        maxLength={1}
                        inputMode="numeric"
                        className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-[50px] lg:h-[70px] text-center text-base sm:text-xl md:text-2xl lg:text-4xl text-[#000000] bg-transparent outline-none leading-none pb-1 sm:pb-2"
                      />
                      <div className={`absolute left-0 right-0 bottom-0 h-[2px] rounded-full transition-all duration-300 ${otp[i] ? "bg-[#3D1768]" : "bg-gray-400"}`} />
                    </div>
                  ))}
                </div>

                <button
                  onClick={verifyOTP}
                  disabled={otp.some((digit) => !digit) || isVerifying}
                  type="button"
                  className="group relative overflow-hidden w-full max-w-[400px] sm:max-w-[500px] h-10 sm:h-12 md:h-[48px] rounded-[30px] bg-gradient-to-r from-[#3D1768] to-[#030303] px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-white text-sm sm:text-base md:text-lg font-medium poppins-font border border-white/10 shadow-lg hover:border-white/30 hover:shadow-2xl hover:shadow-purple-900/50 active:scale-95 transition-all duration-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
                >
                  <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 transition-transform duration-1000 ease-out group-hover:translate-x-[100%]" />
                  <span className="absolute inset-0 rounded-[30px] bg-white/10 scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative z-10 group-hover:scale-105 transition-transform duration-300">
                    {isVerifying ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs sm:text-sm">Verifying...</span>
                      </div>
                    ) : (
                      "Verify OTP"
                    )}
                  </span>
                </button>

                <div className="mt-6 md:mt-8 text-center">
                  <p className="text-[#030303]/90 text-xs sm:text-sm md:text-base poppins-font mb-1">
                    Didn't receive the code?
                  </p>
                  {resendTime > 0 ? (
                    <div>
                      <p className="text-[#030303]/90 text-xs sm:text-sm md:text-base poppins-font">
                        Resend in{" "}
                        <span className="font-bold text-red-500 font-mono">
                          {String(Math.floor(resendTime / 60)).padStart(2, "0")}
                          :{String(resendTime % 60).padStart(2, "0")}
                        </span>
                      </p>
                      {rateLimitError && (
                        <p className="text-[10px] sm:text-xs text-red-500 mt-2">
                          {rateLimitError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={handleResendOTP}
                      disabled={isVerifying}
                      className="text-[#C22CA2] hover:text-[#3D1768] font-semibold text-xs sm:text-sm md:text-base poppins-font transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2 mx-auto px-3 sm:px-4 py-1 sm:py-2 rounded-full group"
                    >
                      {isVerifying ? (
                        <>
                          <svg
                            className="animate-spin h-3 w-3 sm:h-4 sm:w-4 text-[#C22CA2]"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          <span>Sending OTP...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:rotate-12"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          <span>Resend OTP</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* SUCCESS POPUP - FIXED FOR MOBILE */}
      {showSuccessPopup && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99998]"
            onClick={() => setShowSuccessPopup(false)}
          />
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <div className="relative w-full max-w-[500px] sm:max-w-[600px] md:max-w-[652px] min-h-[300px] md:min-h-[398px] rounded-[32px] border-[1.5px] border-white bg-white/70 shadow-[0_0_10px_0_#FFFFFF] flex flex-col items-center justify-center gap-4 md:gap-6 p-5 md:p-8 my-8 mx-2 sm:mx-4">
              <img
                src={Success}
                alt="Success"
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-[122px] md:h-[122px] max-w-[25%] max-h-[25%] object-contain"
              />
              <p className="w-[90%] max-w-[522px] text-center text-base sm:text-lg md:text-[24px] leading-[120%] sm:leading-[100%] font-normal poppins-font text-[#3D1768] px-2">
                Your {currentVerificationType === 'phone' ? 'Phone Number' : 'Email Address'} has been verified successfully!
              </p>
              <div
                className="flex items-center mt-2 md:mt-4 gap-2 cursor-pointer"
                onClick={() => setShowSuccessPopup(false)}
              >
                <div
                  className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full border border-white/20"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(3,3,3,0.9) 0%, rgba(81,33,143,0.9) 100%)",
                    backdropFilter: "blur(90px)",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3 h-3 md:w-4 md:h-4 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                </div>
                <span className="text-[#030303] poppins-font font-normal text-sm md:text-[18px] leading-[100%]">
                  Continue
                </span>
              </div>
              <p className="text-[10px] sm:text-xs md:text-sm text-[#3D1768]/80 poppins-font mt-1 md:mt-2">
                Closing automatically...
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}         