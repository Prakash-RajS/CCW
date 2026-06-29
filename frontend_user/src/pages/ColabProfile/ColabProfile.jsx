import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import TopBanner from "../../assets/AfterSign/HomeBg.png";
import Rectangle from "../../assets/Colabwork/Rectangle71.png";
import Portfolio1 from "../../assets/Colabwork/portfolio1.png";
import Portfolio2 from "../../assets/Colabwork/portfolio2.png";
import Portfolio3 from "../../assets/Colabwork/portfolio3.png";
import ReviewUser1 from "../../assets/Colabwork/review-user-1.png";
import ReviewUser2 from "../../assets/Colabwork/review-user-2.png";
import EditIcon from "../../assets/Colabwork/edit-icon.png";
import ColHeader from "../../component/ColHeader";
import Footer from "../../component/Footer";
import api from "../../utils/axiosConfig";
import { useUser } from "../../contexts/UserContext";
import toast from "../../component/Toast";
import Success from "../../assets/Auth/Succes.png";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Predefined skills array for search
const allSkills = [
  "User Interface Design",
  "Graphics Design",
  "Logo Design",
  "Animation",
  "Branding",
  "Web Design",
  "UI/UX Design",
  "Graphic Design",
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
  "Project Management",
  "Business Analysis",
  "QA Testing",
  "Cybersecurity",
];

// ========== LEVENSHTEIN DISTANCE FUNCTION ==========
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

// ========== CUSTOM CONFIRM MODAL ==========
function ConfirmModal({ open, message, onConfirm, onCancel }) {
  if (!open) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999999]" onClick={onCancel} />
      <div className="fixed inset-0 z-[1000000] flex items-center justify-center p-4">
        <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[420px] p-8 flex flex-col items-center gap-5 border border-purple-100">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="text-[20px] font-semibold text-[#2A1E17] text-center">Confirm Delete</h3>
          <p className="text-[14px] text-gray-500 text-center leading-relaxed">{message}</p>
          <div className="flex gap-3 w-full mt-1">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-2.5 rounded-full border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
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

export default function ColabProfile() {
  const { userData, loading: userLoading, updateUserData } = useUser();

  // UI State
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [fileName, setFileName] = useState("No file chosen");
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0,
  );

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState({ open: false, message: "", onConfirm: null });

  const showConfirm = (message, onConfirm) => {
    setConfirmModal({ open: true, message, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmModal({ open: false, message: "", onConfirm: null });
  };

  // SKILLS SEARCH STATE
  const [currentSkill, setCurrentSkill] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Loading states
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPortfolio, setIsSavingPortfolio] = useState(false);
  const [isSavingWork, setIsSavingWork] = useState(false);
  const [isSavingEducation, setIsSavingEducation] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // flags
  const formatLocation = (location) => {
    if (!location) return "";

    let loc = location
      .toLowerCase()
      .replace(/^in\s+/i, "")
      .trim();

    if (loc.includes("hyderabad")) return "Telangana, India";
    if (loc.includes("bangalore")) return "Karnataka, India";
    if (loc.includes("chennai")) return "Tamil Nadu, India";

    return loc
      .split(",")
      .map((word) => word.trim().charAt(0).toUpperCase() + word.trim().slice(1))
      .join(", ");
  };

  // Pagination and View All States
  const [showAllWork, setShowAllWork] = useState(false);
  const [showAllEducation, setShowAllEducation] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showPortfolioPopup, setShowPortfolioPopup] = useState(false);
  const [showReviewsPopup, setShowReviewsPopup] = useState(false);
  const [portfolioCurrentPage, setPortfolioCurrentPage] = useState(1);
  const [reviewsCurrentPage, setReviewsCurrentPage] = useState(1);
  const portfolioItemsPerPage = 6;
  const reviewsItemsPerPage = 5;

  // Data States
  const [profileData, setProfileData] = useState(null);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [workExperiences, setWorkExperiences] = useState([]);
  const [educations, setEducations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [completedProjects, setCompletedProjects] = useState(0);
  const [verificationData, setVerificationData] = useState({
    phone_verified: false,
    email_verified: false,
  });

  // Items per page for initial view
  const initialItemsToShow = 3;
  const initialReviewsToShow = 2;

  // ========== VERIFICATION STATES ==========
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
  const [isResending, setIsResending] = useState(false);
  const [resendTime, setResendTime] = useState(45);
  const [rateLimitError, setRateLimitError] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // NEW: Store OTP tokens for stateless verification
  const [otpToken, setOtpToken] = useState("");
  const [cooldownToken, setCooldownToken] = useState("");

  // Portfolio validation errors
  const [portfolioValidationErrors, setPortfolioValidationErrors] = useState({
    title: "",
    file: "",
    media_link: "",
    description: "",
  });

  // Edit Form
  const [editFormData, setEditFormData] = useState({
    name: "",
    language: "",
    email: "",
    skill_category: "",
    experience: "",
    skills: [],
    pricing_amount: "",
    pricing_unit: "₹",
    pricing_type: "hourly",
    availability: "",
    timing: "",
    badges: "",
    about: "",
    location: "",
    // collaboration_type: "",   // REMOVED
    // followers: "",             // REMOVED
    skills_rating: "",
    phone_number: "",
    address: "",
    city: "",
    state: "",
    status: "",
  });

  // Edit Form Validation Errors
  const [editFormErrors, setEditFormErrors] = useState({
    name: "",
    language: "",
    location: "",
    experience: "",
    availability: "",
    timing: "",
    about: "",
    skill_category: "",
    badges: "",
    // collaboration_type: "",   // REMOVED
    // followers: "",             // REMOVED
    skills_rating: "",
    phone_number: "",
    email: "",
  });

  // Portfolio form state
  const [portfolioForm, setPortfolioForm] = useState({
    id: null,
    heading: "",
    description: "",
    media_link: "",
    file: null,
  });

  // Work experience form state
  const [workForm, setWorkForm] = useState({
    id: null,
    company_name: "",
    role: "",
    description: "",
    location: "",
    start_year: "",
    end_year: "",
    is_current: false,
  });

  // Work experience validation errors
  const [workFormErrors, setWorkFormErrors] = useState({
    company_name: "",
    role: "",
    location: "",
    description: "",
    start_year: "",
    end_year: "",
    date_range: "",
  });

  // Education form state
  const [educationForm, setEducationForm] = useState({
    id: null,
    institution_name: "",
    degree: "",
    field_of_study: "",
    description: "",
    location: "",
    start_year: "",
    end_year: "",
    is_current: false,
  });

  // Education validation errors
  const [educationFormErrors, setEducationFormErrors] = useState({
    institution_name: "",
    degree: "",
    field_of_study: "",
    location: "",
    description: "",
    start_year: "",
    end_year: "",
    date_range: "",
  });

  // ========== VALIDATION FUNCTIONS ==========


  // Description for Work & Education: only alphabets, spaces, and punctuation (no numbers)
  const validateTextDescription = (value, maxLength = 200) => {
    if (!value.trim()) return "";
    const allowedPattern = /^[A-Za-z\s.,!?\-_:;"'()\/&@#$%*]+$/;
    if (!allowedPattern.test(value)) {
      return "Description can only contain letters, spaces, and punctuation (no numbers)";
    }
    if (value.length > maxLength) {
      return `Description should be less than ${maxLength} characters`;
    }
    return "";
  };

  const validateSkillCategory = (value) => {
    if (!value.trim()) return "";
    if (!/^[A-Za-z\s\-_/]+$/.test(value)) {
      return "Only letters, spaces, -, _, and / are allowed (no numbers)";
    }
    if (value.length > 50) {
      return "Skill category should be less than 50 characters";
    }
    return "";
  };

  // Timing: flexible – allow letters, numbers, spaces, and basic punctuation
  const validateTimingFlexible = (value) => {
    if (!value.trim()) return "Timing is required";
    if (!/^[A-Za-z0-9\s\-_:;,.()/]+$/.test(value)) {
      return "Only letters, numbers, spaces, and basic punctuation are allowed";
    }
    if (value.length > 100) {
      return "Timing should be less than 100 characters";
    }
    return "";
  };

  // Portfolio Description: only letters, spaces, and punctuation (no numbers)
  const validatePortfolioDescription = (value, maxLength = 200) => {
    if (!value.trim()) return "";
    // Allow letters (A-Z a-z), spaces, and common punctuation only
    const allowedPattern = /^[A-Za-z\s.,!?\-_:;"'()\/&@#$%*]+$/;
    if (!allowedPattern.test(value)) {
      return "Description can only contain letters, spaces, and punctuation (no numbers)";
    }
    if (value.length > maxLength) {
      return `Description should be less than ${maxLength} characters`;
    }
    return "";
  };

  // About: allow letters, spaces, and basic punctuation (NO numbers)
  const validateAbout = (value) => {
    if (!value.trim()) return "";
    if (!/^[A-Za-z\s.,!?;:'"()\-]+$/.test(value)) {
      return "Only letters, spaces, and basic punctuation are allowed (no numbers)";
    }
    if (value.length > 200) {
      return "About should be less than 200 characters";
    }
    return "";
  };

  const validatePhoneRequired = (value) => {
    if (!value || value.trim() === "") {
      return "Phone number is required";
    }
    if (!/^\d{10}$/.test(value)) {
      return "Please enter a valid 10-digit phone number";
    }
    return "";
  };

  // ========== VALIDATION FUNCTIONS (existing) ==========
  const validateTiming = (value) => {
    if (!value || typeof value !== 'string') return "";
    if (!value.trim()) return "Timing is required";
    const val = value.toLowerCase().trim();
    const regex24 =
      /^([01]?\d|2[0-3])(:[0-5]\d)?\s*-\s*([01]?\d|2[0-3])(:[0-5]\d)?$/;
    const regex12 = /^(1[0-2]|[1-9])\s*(am|pm)\s*-\s*(1[0-2]|[1-9])\s*(am|pm)$/;
    if (!regex24.test(val) && !regex12.test(val)) {
      return "Enter valid timing (e.g., 9am - 6pm)";
    }
    return "";
  };

  const validateAlphabetsSpacesHyphen = (value) => {
    if (!value.trim()) return "";
    if (!/^[A-Za-z\s-]+$/.test(value)) {
      return "Only alphabets, spaces, and hyphens (-) are allowed";
    }
    return "";
  };

  // Get user ID from context
  const userId = userData?.id;

  // Get user display name from userData.full_name
  const getUserDisplayName = () => {
    if (!userData) return "User";
    if (userData.full_name && userData.full_name.trim()) {
      const name = userData.full_name;
      return name.length > 50 ? name.substring(0, 47) + "..." : name;
    }
    return userData.email?.split("@")[0] || "User";
  };

  const calculateCompletionPercentage = () => {
    let basePercentage = 80;
    let verificationPercentage = 0;
    if (phoneVerified) verificationPercentage += 10;
    if (emailVerified) verificationPercentage += 10;
    return Math.min(basePercentage + verificationPercentage, 100);
  };

  const completionPercentage = calculateCompletionPercentage();

  // Validation functions with updated character limits
  const validateAlphabetsOnly = (value) => {
    if (!value.trim()) return "";
    if (!/^[A-Za-z\s]+$/.test(value)) {
      return "Only alphabets and spaces are allowed";
    }
    return "";
  };

  const validateAlphabetsNumbersSpaces = (value) => {
    if (!value.trim()) return "";
    if (!/^[A-Za-z\s]+$/.test(value)) {
      return "Only alphabets and spaces are allowed";
    }
    return "";
  };

  const validateNumbersOnly = (value) => {
    const stringValue =
      value !== null && value !== undefined ? String(value).trim() : "";
    if (!stringValue) return "";
    if (!/^\d+$/.test(stringValue)) {
      return "Only numbers are allowed";
    }
    return "";
  };

  const validateDecimalNumbers = (value) => {
    if (value === null || value === undefined) return "";
    const stringValue = String(value).trim();
    if (!stringValue) return "";
    if (!/^\d+(\.\d+)?$/.test(stringValue)) {
      return "Only numbers and decimal points are allowed";
    }
    const numValue = parseFloat(stringValue);
    if (numValue < 0 || numValue > 5) {
      return "Rating must be between 0 and 5";
    }
    return "";
  };

  const validateTextRequired = (value, fieldName) => {
    if (!value.trim()) return `${fieldName} is required`;
    if (value.length > 200)
      return `${fieldName} should be less than 200 characters`;
    return "";
  };

  const validateTextRequiredAlphabets = (value, fieldName) => {
    if (!value.trim()) return `${fieldName} is required`;
    const alphabetsError = validateAlphabetsOnly(value);
    if (alphabetsError) return alphabetsError;
    if (value.length > 50)
      return `${fieldName} should be less than 50 characters`;
    return "";
  };

  const validateName = (value) => {
    if (!value.trim()) return "Name is required";
    if (!/^[A-Za-z\s]+$/.test(value)) {
      return "Name should only contain alphabets and spaces";
    }
    if (value.length > 50) return "Name should be less than 50 characters";
    return "";
  };

  const validateWorkName = (value) => {
    if (!value.trim()) return "Work name is required";
    if (!/^[A-Za-z\s]+$/.test(value)) {
      return "Work name should only contain alphabets and spaces";
    }
    if (value.length > 50)
      return "Work name should be less than 50 characters";
    return "";
  };

  const validateUrl = (url) => {
    if (!url.trim()) return "";
    const urlPattern =
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(url)) {
      return "Please enter a valid URL (e.g., https://example.com)";
    }
    return "";
  };

  const validateFileRequired = (file, existingFile = null) => {
    if (!file && !existingFile) return "Please upload a media file";
    return "";
  };

  const validateYear = (value) => {
    if (!value) return "";
    if (!/^\d{4}$/.test(value)) return "Please enter a valid 4-digit year";
    const year = parseInt(value);
    if (year < 0) return "Year cannot be negative";
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear + 10)
      return "Please enter a valid year";
    return "";
  };

  const validateDateRange = (startYear, endYear, isCurrent) => {
    if (isCurrent) return "";
    if (!startYear || !endYear) return "";
    const start = parseInt(startYear);
    const end = parseInt(endYear);
    if (start > end) {
      return "Start year cannot be greater than end year";
    }
    if (end < start) {
      return "End year cannot be smaller than start year";
    }
    return "";
  };

  const validateCompanyName = (value) => {
    if (!value.trim()) return "Company name is required";
    if (!/^[A-Za-z0-9\s&.-]+$/.test(value)) {
      return "Only alphabets, numbers, spaces, &, -, and . are allowed";
    }
    if (value.length > 50) {
      return "Company name should be less than 50 characters";
    }
    return "";
  };

  const validateRole = (value) => {
    if (!value.trim()) return "Role is required";
    const alphabetsError = validateAlphabetsOnly(value);
    if (alphabetsError) return alphabetsError;
    if (value.length > 50) return "Role should be less than 50 characters";
    return "";
  };

  const validateLocation = (value) => {
    if (!value.trim()) return "";
    const alphabetsError = validateAlphabetsOnly(value);
    if (alphabetsError) return alphabetsError;
    if (value.length > 50)
      return "Location should be less than 50 characters";
    return "";
  };

  const validateDescription = (value, maxLength = 200) => {
    if (!value.trim()) return "";
    // Allow letters, numbers, spaces, and common punctuation
    const allowedPattern = /^[A-Za-z0-9\s.,!?\-_:;"'()\/&@#$%*]+$/;
    if (!allowedPattern.test(value)) {
      return "Description contains invalid characters";
    }
    if (value.length > maxLength) {
      return `Description should be less than ${maxLength} characters`;
    }
    return "";
  };

  const validateInstitutionName = (value) => {
    if (!value.trim()) return "Institution name is required";
    const alphabetsError = validateAlphabetsOnly(value);
    if (alphabetsError) return alphabetsError;
    if (value.length > 50)
      return "Institution name should be less than 50 characters";
    return "";
  };

  const validateDegree = (value) => {
    if (!value.trim()) return "Degree is required";
    const alphabetsError = validateAlphabetsOnly(value);
    if (alphabetsError) return alphabetsError;
    if (value.length > 50) return "Degree should be less than 50 characters";
    return "";
  };

  const validateFieldOfStudy = (value) => {
    if (!value.trim()) return "";
    const alphabetsError = validateAlphabetsOnly(value);
    if (alphabetsError) return alphabetsError;
    if (value.length > 50)
      return "Field of study should be less than 50 characters";
    return "";
  };

  const validatePhoneNumber = (value) => {
    if (!value) return "";
    if (!/^\d{10}$/.test(value)) {
      return "Please enter a valid 10-digit phone number";
    }
    return "";
  };

  // Email validation with Levenshtein suggestions
  const validateEmailWithSuggestions = (emailValue) => {
    if (!emailValue || emailValue.trim() === "") {
      return {
        isValid: false,
        error: "Email is required",
        suggestion: null,
      };
    }

    const trimmedEmail = emailValue.trim().toLowerCase();

    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const commonDomains = [
      "gmail.com",
      "yahoo.com",
      "hotmail.com",
      "outlook.com",
      "protonmail.com",
    ];

    const [localPart, domain] = trimmedEmail.split("@");

    if (!emailRegex.test(trimmedEmail)) {
      return {
        isValid: false,
        error: "Please enter a valid email address",
        suggestion: null,
      };
    }

    if (domain) {
      for (const commonDomain of commonDomains) {
        const distance = levenshteinDistance(
          domain,
          commonDomain
        );

        if (distance > 0 && distance <= 2) {
          return {
            isValid: false,
            error: `Did you mean ${localPart}@${commonDomain}?`,
            suggestion: `${localPart}@${commonDomain}`,
          };
        }
      }
    }

    return {
      isValid: true,
      error: "",
      suggestion: null,
    };
  };
  // Track screen width
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Timer for OTP
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

  // Auto redirect for success popup
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

  // Add body scroll lock when modal is open
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
      confirmModal.open;

    if (modalOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
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
    confirmModal.open,
  ]);

  // Sync editFormData with profileData when profileData loads
  useEffect(() => {
    if (profileData) {
      let locationString = profileData.location || "";

      setEditFormData({
        name: profileData.full_name || profileData.name || "",
        about: profileData.about || "",
        location: locationString,
        phone_number: profileData.phone_number || "",
        email: profileData.email || userData?.email || "",
        language: profileData.language || "",
        skill_category: profileData.skill_category || "",
        experience: profileData.experience || "",
        skills: profileData.skills
          ? Array.isArray(profileData.skills)
            ? profileData.skills
            : profileData.skills.split(",")
          : [],
        pricing_amount: profileData.pricing_amount || "",
        pricing_unit: profileData.pricing_unit || "$",
        pricing_type: profileData.pricing_type || "hourly",
        availability: profileData.availability || "",
        timing: profileData.timing || "",
        badges: profileData.badges || "",
        // collaboration_type: profileData.collaboration_type || "",
        // followers: profileData.followers || "",
        skills_rating: profileData.skills_rating || "",
      });

      if (profileData.skills) {
        const skillsArray = Array.isArray(profileData.skills)
          ? profileData.skills
          : profileData.skills.split(",");
        setSelectedSkills(skillsArray);
      }
    }
  }, [profileData]);

  // Fetch user data from /auth/me
  const fetchUserData = async () => {
    try {
      const res = await api.get("/auth/me");
      // console.log("Fetched user data:", res.data);
      // console.log("User full_name from auth:", res.data.full_name);

      setCurrentUser(res.data);

      if (updateUserData) {
        updateUserData(res.data);
      }

      if (res.data.email_verified !== undefined) {
        setEmailVerified(
          res.data.email_verified === true ||
          res.data.email_verified === 1 ||
          res.data.email_verified === "true",
        );
      }

      if (res.data.phone_verified !== undefined) {
        setPhoneVerified(
          res.data.phone_verified === true ||
          res.data.phone_verified === 1 ||
          res.data.phone_verified === "true",
        );
      }

      if (res.data.email) {
        setEmail(res.data.email);
      }
    } catch (err) {
      console.error("Failed to fetch user data", err);
    }
  };

  // ========== VERIFICATION FUNCTIONS ==========

  const fetchVerificationStatus = async () => {
    if (!userId) return;
    const userEmail = profileData?.email || userData?.email;
    if (!userEmail) return;

    setVerificationLoading(true);
    try {
      const response = await api.get(
        `${API_BASE_URL}/verification/debug/check-verification/${userEmail}`,
      );
      if (response.data.status === "success") {
        const phoneVerifiedStatus = response.data.phone_verified === true;
        const emailVerifiedStatus = response.data.email_verified === true;
        setPhoneVerified(phoneVerifiedStatus);
        setEmailVerified(emailVerifiedStatus);
        setVerificationData({
          phone_verified: phoneVerifiedStatus,
          email_verified: emailVerifiedStatus,
        });
      }
    } catch (error) {
      console.error("Error fetching verification status:", error);
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleVerifyPhone = () => {
  if (phoneVerified) {
    toast.success("Phone number is already verified!");
    return;
  }

  const userPhoneNumber =
    userData?.phone_number ||
    profileData?.phone_number ||
    editFormData.phone_number;

  if (!userPhoneNumber || userPhoneNumber.trim() === "") {
    toast.error("Phone number missing. Please add your phone number in your profile before verifying");
    return;
  }

  setCurrentVerificationType("phone");
  setRateLimitError("");
  setShowPhonePopup(true);
};

  const handleVerifyEmail = () => {
  if (emailVerified) {
    toast.success("Email is already verified!");
    return;
  }

  const userEmail = profileData?.email || userData?.email;

  if (!userEmail || userEmail.trim() === "") {
    toast.error("Email address missing. Please add your email address in your profile before verifying.");
    return;
  }

  setCurrentVerificationType("email");
  setEmail(userEmail);
  setRateLimitError("");
  setShowEmailPopup(true);
};

  const handlePhoneSubmit = async () => {
    if (phoneNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    const userEmail = profileData?.email || userData?.email;
    if (!userEmail) {
      toast.error("User email not found");
      return;
    }

    const fullPhoneNumber = `+91${phoneNumber}`;

    setIsVerifying(true);
    setRateLimitError("");

    try {
      const response = await api.post(
        `${API_BASE_URL}/verification/phone/send-otp`,
        {
          email: userEmail,
          phone_number: fullPhoneNumber,
        },
      );

      if (response.data.status === "success") {
        setOtpToken(response.data.otp_token);
        setCooldownToken(response.data.cooldown_token);

        setShowPhonePopup(false);
        setShowOTPPopup(true);
        setResendTime(45);
        setOtp(["", "", "", "", "", ""]);
        toast.success("OTP sent to your phone");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);

      if (error.response?.status === 429) {
        const errorMessage =
          error.response?.data?.detail ||
          "Please wait before requesting another OTP";
        setRateLimitError(errorMessage);
        toast.error(errorMessage);
        const match = errorMessage.match(/(\d+)\s*seconds?/);
        if (match && match[1]) {
          const remainingSeconds = parseInt(match[1]);
          if (remainingSeconds > 0 && remainingSeconds <= 60) {
            setResendTime(remainingSeconds);
          }
        }
      } else if (error.response?.status === 400) {
        const errorDetail = error.response?.data?.detail;
        if (errorDetail === "Phone number does not match registered number") {
          toast.error(
            "Phone number doesn't match the one in your profile. Please update your profile first.",
          );
          setShowPhonePopup(false);
          setEditOpen(true);
        } else if (
          errorDetail === "Please add your phone number in profile to verify"
        ) {
          toast.error("Please add your phone number in profile first");
          setShowPhonePopup(false);
          setEditOpen(true);
        } else {
          toast.error(errorDetail || "Failed to send OTP");
        }
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

  const handleEmailSubmit = async () => {
    if (!isValidGmail(email)) {
      toast.error("Please enter a valid Gmail address");
      return;
    }

    setIsVerifying(true);
    setRateLimitError("");

    try {
      const response = await api.post(
        `${API_BASE_URL}/verification/email/send-otp`,
        {
          email: email,
        },
      );

      if (response.data.status === "success") {
        setOtpToken(response.data.otp_token);
        setCooldownToken(response.data.cooldown_token);

        setShowEmailPopup(false);
        setShowOTPPopup(true);
        setResendTime(45);
        setOtp(["", "", "", "", "", ""]);
        toast.success("OTP sent to your email");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);

      if (error.response?.status === 429) {
        const errorMessage =
          error.response?.data?.detail ||
          "Too many requests. Please wait before trying again.";
        setRateLimitError(errorMessage);
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
          ? { email: currentUser?.email || email, otp_code: otpString }
          : { email: email, otp_code: otpString };

      const response = await api.post(
        `${endpoint}?otp_token=${otpToken}`,
        payload,
      );

      if (response.data.status === "success") {
        if (currentVerificationType === "phone") {
          setPhoneVerified(true);
          if (updateUserData) {
            updateUserData({ phone_verified: true });
          }
        } else {
          setEmailVerified(true);
          if (updateUserData) {
            updateUserData({ email_verified: true });
          }
        }

        await Promise.all([fetchProfileData(), fetchAuthData()]);

        setShowOTPPopup(false);
        setShowSuccessPopup(true);
        setOtp(["", "", "", "", "", ""]);
        setResendTime(45);
        setRateLimitError("");
        setOtpToken("");
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

  const handleResendOTP = async () => {
    if (isVerifying || isResending) return;

    if (resendTime > 0) {
      toast.error(
        `Please wait ${resendTime} seconds before requesting another OTP`,
      );
      return;
    }

    setIsResending(true);
    setRateLimitError("");

    try {
      let response;

      if (currentVerificationType === "phone") {
        const fullPhoneNumber = `+91${phoneNumber}`;
        const userEmail = profileData?.email || userData?.email;
        response = await api.post(
          `${API_BASE_URL}/verification/phone/send-otp`,
          {
            email: userEmail,
            phone_number: fullPhoneNumber,
          },
          {
            headers: cooldownToken ? { "X-Cooldown-Token": cooldownToken } : {},
          },
        );
      } else {
        response = await api.post(
          `${API_BASE_URL}/verification/email/send-otp`,
          {
            email: email,
          },
          {
            headers: cooldownToken ? { "X-Cooldown-Token": cooldownToken } : {},
          },
        );
      }

      if (response.data.status === "success") {
        setOtpToken(response.data.otp_token);
        if (response.data.cooldown_token)
          setCooldownToken(response.data.cooldown_token);
        toast.success(`OTP resent to your ${currentVerificationType}`);
        setResendTime(45);
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => document.getElementById("otp-0")?.focus(), 100);
      }
    } catch (error) {
      console.error("Error resending OTP:", error);

      if (error.response?.status === 429) {
        const errorMessage =
          error.response?.data?.detail ||
          "Please wait before requesting another OTP";
        setRateLimitError(errorMessage);
        toast.error(errorMessage);
        const match = errorMessage.match(/(\d+)\s*seconds?/);
        if (match && match[1]) {
          const remainingSeconds = parseInt(match[1]);
          if (remainingSeconds > 0 && remainingSeconds <= 60) {
            setResendTime(remainingSeconds);
          }
        }
      } else {
        toast.error(
          error.response?.data?.detail ||
          "Failed to resend OTP. Please try again.",
        );
      }
    } finally {
      setIsResending(false);
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

  const isValidGmail = (email) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;
    const domain = email.toLowerCase().split("@")[1];
    return domain === "gmail.com";
  };

  // ========== API CALLS ==========

  const fetchProfileData = async () => {
    try {
      const response = await api.get(`/collaborator/get/${userId}`);
      const profile = response.data;

      // console.log("📦 Profile data from backend:", profile);

      setProfileData(profile);

      setTotalEarnings(profile.total_earnings || 0);
      setCompletedProjects(profile.completed_projects_count || profile.completed_projects || 0);

      let locationString = profile.location || "";

      const emailVerifiedStatus =
        profile.email_verified === true ||
        profile.email_verified === 1 ||
        profile.email_verified === "true" ||
        profile.email_verified === "1";

      const phoneVerifiedStatus =
        profile.phone_verified === true ||
        profile.phone_verified === 1 ||
        profile.phone_verified === "true" ||
        profile.phone_verified === "1";

      setEmailVerified(emailVerifiedStatus);
      setPhoneVerified(phoneVerifiedStatus);

      setEditFormData({
        name: profile.full_name || profile.name || "",
        about: profile.about || "",
        location: locationString,
        phone_number: profile.phone_number || "",
        email: profile.email || userData?.email || "",
        language: profile.language || "",
        skill_category: profile.skill_category || "",
        experience: profile.experience || "",
        skills: profile.skills
          ? typeof profile.skills === "string"
            ? profile.skills.split(",")
            : profile.skills
          : [],
        pricing_amount: profile.pricing_amount || "",
        pricing_unit: profile.pricing_unit || "$",
        pricing_type: profile.pricing_type || "hourly",
        availability: profile.availability || "",
        timing: profile.timing || "",
        badges: profile.badges || "",
        // collaboration_type: profile.collaboration_type || "",
        // followers: profile.followers || "",
        skills_rating: profile.skills_rating || "",
      });

      if (profile.skills) {
        const skillsArray =
          typeof profile.skills === "string"
            ? profile.skills.split(",")
            : profile.skills;
        setSelectedSkills(skillsArray);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const fetchAuthData = async () => {
    try {
      const response = await api.get("/auth/me");
      const authData = response.data;

      if (authData.email_verified !== undefined) {
        const emailVerified =
          authData.email_verified === true ||
          authData.email_verified === 1 ||
          authData.email_verified === "true";
        setEmailVerified(emailVerified);
      }

      if (authData.phone_verified !== undefined) {
        const phoneVerified =
          authData.phone_verified === true ||
          authData.phone_verified === 1 ||
          authData.phone_verified === "true";
        setPhoneVerified(phoneVerified);
      }

      if (authData.email) {
        setEmail(authData.email);
      }

      if (authData.phone_number) {
        setPhoneNumber(authData.phone_number.replace(/\D/g, "").slice(-10));
      }

      setCurrentUser(authData);
    } catch (err) {
      console.error("Failed to fetch auth data", err);
    }
  };

  const fetchReviews = async () => {
    if (!userId) return;
    try {
      const response = await api.get(
        `${API_BASE_URL}/collaborator/reviews/list/${userId}`,
      );
      // console.log("🔍 Full reviews response:", response.data);
      setReviews(response.data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setReviews([]);
    }
  };

  const fetchPortfolioItems = async () => {
    if (!userId) return;
    try {
      const response = await api.get(
        `${API_BASE_URL}/collaborator/portfolio/list/${userId}`,
      );
      // console.log("Portfolio items from backend:", response.data);

      const items = response.data.map(item => ({
        ...item,
        heading: item.heading || item.title,
        title: item.heading || item.title,
        description: item.description || "",
      }));
      setPortfolioItems(items);
    } catch (err) {
      console.error("Error fetching portfolio:", err);
      setPortfolioItems([]);
    }
  };

  const fetchWorkExperiences = async () => {
    if (!userId) return;
    try {
      const response = await api.get(
        `${API_BASE_URL}/collaborator/work-experience/list/${userId}`,
      );
      setWorkExperiences(response.data);
    } catch (err) {
      console.error("Error fetching work:", err);
      setWorkExperiences([]);
    }
  };

  const fetchEducations = async () => {
    if (!userId) return;
    try {
      const response = await api.get(
        `${API_BASE_URL}/collaborator/education/list/${userId}`,
      );
      setEducations(response.data);
    } catch (err) {
      console.error("Error fetching education:", err);
      setEducations([]);
    }
  };

  // Initial data fetch
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        await fetchProfileData();
        await fetchAuthData();
        await fetchPortfolioItems();
        await fetchWorkExperiences();
        await fetchEducations();
        await fetchReviews();
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load profile data. Please refresh the page.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, [userId]);

  // ========== HELPER FUNCTIONS ==========

  const getCountryFlag = (location) => {
    if (!location) return "🇺🇸";
    const locationLower = location.toLowerCase().trim();
    const countryFlags = {
      india: "🇮🇳",
      indian: "🇮🇳",
      bharat: "🇮🇳",
      usa: "🇺🇸",
      "united states": "🇺🇸",
      america: "🇺🇸",
      us: "🇺🇸",
      uk: "🇬🇧",
      "united kingdom": "🇬🇧",
      britain: "🇬🇧",
      england: "🇬🇧",
      canada: "🇨🇦",
      australia: "🇦🇺",
      germany: "🇩🇪",
      france: "🇫🇷",
      japan: "🇯🇵",
      china: "🇨🇳",
      singapore: "🇸🇬",
      malaysia: "🇲🇾",
      thailand: "🇹🇭",
      vietnam: "🇻🇳",
      korea: "🇰🇷",
      "south korea": "🇰🇷",
    };
    for (const [country, flag] of Object.entries(countryFlags)) {
      if (locationLower.includes(country)) return flag;
    }
    return "🇺🇸";
  };

  // Replace the getProfilePictureUrl function with this:
  const getProfilePictureUrl = () => {
    if (profilePicturePreview) return profilePicturePreview;
    if (profileData?.profile_picture_url) {
      // Check if it's already a full URL (S3)
      if (profileData.profile_picture_url.startsWith('http')) {
        return profileData.profile_picture_url;
      }
      // If it's a relative path, prepend API_BASE_URL
      return `${API_BASE_URL}${profileData.profile_picture_url}`;
    }
    if (profileData?.profile_picture) {
      if (profileData.profile_picture.startsWith('http')) {
        return profileData.profile_picture;
      }
      return `${API_BASE_URL}${profileData.profile_picture}`;
    }
    return Rectangle;
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024;

      if (file.size > maxSize) {
        toast.error("File size exceeds 5MB. Please choose a smaller image.");
        e.target.value = "";
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a valid image file (JPEG, PNG, GIF, or WEBP)");
        e.target.value = "";
        return;
      }

      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePortfolioFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setPortfolioValidationErrors((prev) => ({
      ...prev,
      file: "",
    }));

    const fileExtension = file.name.split('.').pop().toLowerCase();

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const allowedExtensions = ["jpg", "jpeg", "png", "webp"];

    if (!allowedTypes.includes(file.type) || !allowedExtensions.includes(fileExtension)) {
      const errorMessage = "Only JPG, JPEG, PNG, and WEBP image files are allowed";
      toast.error(errorMessage);
      e.target.value = "";
      setFileName("No file chosen");

      setPortfolioValidationErrors((prev) => ({
        ...prev,
        file: errorMessage,
      }));

      setPortfolioForm((prev) => ({
        ...prev,
        file: null,
      }));

      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      const errorMessage = "Image size must be less than 5 MB";
      toast.error(errorMessage);
      e.target.value = "";
      setFileName("No file chosen");

      setPortfolioValidationErrors((prev) => ({
        ...prev,
        file: errorMessage,
      }));

      setPortfolioForm((prev) => ({
        ...prev,
        file: null,
      }));

      return;
    }

    setPortfolioForm((prev) => ({
      ...prev,
      file,
    }));

    setFileName(file.name);

    setPortfolioValidationErrors((prev) => ({
      ...prev,
      file: "",
    }));
  };

  const validateEditForm = () => {
    const errors = {
      name: validateName(editFormData.name),
      language: validateTextRequiredAlphabets(editFormData.language, "Language"),
      location: validateLocationField(editFormData.location),
      experience: validateExperience(editFormData.experience),
      availability: validateTextRequiredAlphabets(editFormData.availability, "Availability"),
      timing: validateTimingFlexible(editFormData.timing),
      about: validateAbout(editFormData.about),
      skill_category: validateSkillCategory(editFormData.skill_category),
      badges: validateAlphabetsNumbersSpaces(editFormData.badges),
      // collaboration_type: validateAlphabetsNumbersSpaces(editFormData.collaboration_type),
      // followers: validateNumbersOnly(editFormData.followers),
      skills_rating: validateDecimalNumbers(editFormData.skills_rating),
      phone_number: validatePhoneRequired(editFormData.phone_number),
      email: !profileData?.email ? validateEmailWithSuggestions(editFormData.email).error : "",
    };
    setEditFormErrors(errors);
    return !Object.values(errors).some((error) => error !== "");
  };

  const validateExperience = (value) => {
    if (!value.trim()) return "Experience is required";
    const regex = /^[A-Za-z0-9\s]+$/;
    if (!regex.test(value)) {
      return "Only alphabets, numbers and spaces are allowed";
    }
    if (value.length > 50) {
      return "Experience should be less than 50 characters";
    }
    return "";
  };

  const validateLocationField = (value) => {
    if (!value.trim()) return "Location is required";
    const regex = /^[A-Za-z\s,]+$/;
    if (!regex.test(value)) {
      return "Only alphabets, spaces, and comma are allowed";
    }
    if (value.length > 100) {
      return "Location should be less than 100 characters";
    }
    return "";
  };

  const resetEditForm = () => {
    if (profileData) {
      let locationString = profileData.location || "";

      setEditFormData({
        name: profileData.full_name || profileData.name || "",
        about: profileData.about || "",
        location: locationString,
        phone_number: profileData.phone_number || "",
        email: profileData.email || userData?.email || "",
        language: profileData.language || "",
        skill_category: profileData.skill_category || "",
        experience: profileData.experience || "",
        skills: profileData.skills
          ? typeof profileData.skills === "string"
            ? profileData.skills.split(",")
            : profileData.skills
          : [],
        pricing_amount: profileData.pricing_amount || "",
        pricing_unit: profileData.pricing_unit || "$",
        pricing_type: profileData.pricing_type || "hourly",
        availability: profileData.availability || "",
        timing: profileData.timing || "",
        badges: profileData.badges || "",
        // collaboration_type: profileData.collaboration_type || "",
        // followers: profileData.followers || "",
        skills_rating: profileData.skills_rating || "",
      });

      if (profileData.skills) {
        const skillsArray = typeof profileData.skills === "string"
          ? profileData.skills.split(",")
          : profileData.skills;
        setSelectedSkills(skillsArray);
      }

      setProfilePictureFile(null);
      setProfilePicturePreview(null);

      setEditFormErrors({
        name: "",
        language: "",
        location: "",
        experience: "",
        availability: "",
        timing: "",
        about: "",
        skill_category: "",
        badges: "",
        // collaboration_type: "",
        // followers: "",
        skills_rating: "",
        phone_number: "",
        email: "",
      });
    }
  };

  const handleEditProfile = async () => {
    if (!userId) return;
    if (!validateEditForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    // console.log("=== SAVING PROFILE ===");
    // console.log("New name being saved:", editFormData.name);

    setIsSavingProfile(true);

    const fixedData = {
      ...editFormData,
      name: editFormData.name?.trim(),
      language: editFormData.language?.trim(),
      location: editFormData.location?.trim(),
      // followers: editFormData.followers ? parseInt(editFormData.followers) : 0,
      skills_rating: editFormData.skills_rating ? parseFloat(editFormData.skills_rating) : 0,
      pricing_amount: editFormData.pricing_amount ? parseFloat(editFormData.pricing_amount) : 0,
      phone_number: editFormData.phone_number || "",
    };

    const formData = new FormData();
    Object.keys(fixedData).forEach((key) => {
      if (key === "skills" && Array.isArray(fixedData[key])) {
        formData.append(key, fixedData[key].join(","));
      } else if (
        fixedData[key] !== null &&
        fixedData[key] !== undefined
      ) {
        formData.append(key, fixedData[key]);
      }
    });
    if (editFormData.email && editFormData.email !== profileData?.email) {
      formData.append("email", editFormData.email.trim().toLowerCase());
    }

    if (profilePictureFile) {
      formData.append("profile_picture", profilePictureFile);
    }

    try {
      await api.put(`${API_BASE_URL}/collaborator/edit/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setEditOpen(false);
      setProfilePictureFile(null);
      setProfilePicturePreview(null);

      await fetchProfileData();
      await fetchUserData();

      if (updateUserData) {
        updateUserData({
          ...userData,
          full_name: editFormData.name.trim()
        });
      }

      toast.success("Profile updated successfully!");

      window.dispatchEvent(new CustomEvent("refreshNotifications"));
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const getPricingAbbreviation = (type) => {
    const map = {
      hourly: "hr",
      daily: "day",
      weekly: "wk",
      monthly: "mo",
      yearly: "yr",
      project: "project",
    };
    return map[type?.toLowerCase()] || "hr";
  };

  // ========== SKILLS FUNCTIONALITY ==========

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
    if (!skill || typeof skill !== 'string' || skill.trim() === "") {
      toast.error("Please enter a valid skill name");
      return;
    }

    const trimmedSkill = skill.trim();

    if (selectedSkills.some(s => s.toLowerCase() === trimmedSkill.toLowerCase())) {
      toast.error(`"${trimmedSkill}" is already added`);
      return;
    }

    if (selectedSkills.length >= 15) {
      toast.error("Maximum 15 skills allowed");
      return;
    }

    setSelectedSkills([...selectedSkills, trimmedSkill]);
    toast.success(`"${trimmedSkill}" added`);

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

      addSkill(trimmed);
    } else if (e.key === "Escape") {
      setShowResults(false);
      setSearchResults([]);
    }
  };

  const removeSkill = (skillToRemove) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skillToRemove));
    toast.success(`Skill "${skillToRemove}" removed`);
  };

  const handleSaveSkills = async () => {
    if (!userId) return;

    let updatedSkills = [...selectedSkills];

    if (currentSkill && currentSkill.trim() !== "") {
      const trimmedSkill = currentSkill.trim();

      if (updatedSkills.some(s => s.toLowerCase() === trimmedSkill.toLowerCase())) {
        toast.error(`"${trimmedSkill}" is already added`);
        setCurrentSkill("");
        setSearchQuery("");
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      if (updatedSkills.length >= 15) {
        toast.error("Maximum 15 skills allowed");
        return;
      }

      updatedSkills = [...updatedSkills, trimmedSkill];
      setSelectedSkills(updatedSkills);
      toast.success(`"${trimmedSkill}" added`);
      setCurrentSkill("");
      setSearchQuery("");
      setSearchResults([]);
      setShowResults(false);
    }

    if (!updatedSkills || updatedSkills.length === 0) {
      toast.error("❌ Please add at least one skill before saving");
      return;
    }

    const originalSkills = profileData?.skills
      ? (typeof profileData.skills === "string" ? profileData.skills.split(",") : profileData.skills)
      : [];

    const skillsChanged =
      updatedSkills.length !== originalSkills.length ||
      updatedSkills.some(skill => !originalSkills.includes(skill)) ||
      originalSkills.some(skill => !updatedSkills.includes(skill));

    if (!skillsChanged) {
      toast.info("No changes to save");
      return;
    }

    setIsSavingProfile(true);

    setEditFormData({ ...editFormData, skills: updatedSkills });

    const formData = new FormData();
    formData.append("skills", updatedSkills.join(","));

    try {
      await api.put(`${API_BASE_URL}/collaborator/edit/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(`${updatedSkills.length} skill(s) updated successfully!`);
      await fetchProfileData();
    } catch (err) {
      console.error("Error saving skills:", err);
      toast.error("Failed to save skills");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ========== PORTFOLIO CRUD ==========

  const handleAddPortfolio = async (e) => {
    e.preventDefault();

    const titleError = validateWorkName(portfolioForm.heading);
    if (titleError) {
      toast.error(titleError);
      setPortfolioValidationErrors((prev) => ({ ...prev, title: titleError }));
      return;
    }

    const fileError = validateFileRequired(portfolioForm.file);
    if (fileError) {
      toast.error(fileError);
      setPortfolioValidationErrors((prev) => ({ ...prev, file: fileError }));
      return;
    }

    const urlError = validateUrl(portfolioForm.media_link);
    if (urlError) {
      toast.error(urlError);
      setPortfolioValidationErrors((prev) => ({
        ...prev,
        media_link: urlError,
      }));
      return;
    }

    const descError = validatePortfolioDescription(portfolioForm.description, 200);
    if (descError) {
      toast.error(descError);
      setPortfolioValidationErrors((prev) => ({ ...prev, description: descError }));
      return;
    }

    if (!userId) return;

    setIsSavingPortfolio(true);

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("heading", portfolioForm.heading);
    formData.append("description", portfolioForm.description || "");
    formData.append("media_link", portfolioForm.media_link || "");
    if (portfolioForm.file) {
      formData.append("file", portfolioForm.file);
    }

    try {
      const response = await api.post(`${API_BASE_URL}/collaborator/portfolio/add`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // console.log("Response:", response.data);

      toast.success("Portfolio item added successfully!");
      setActiveModal(null);
      setPortfolioForm({
        heading: "",
        description: "",
        media_link: "",
        file: null,
        id: null,
      });
      setFileName("No file chosen");
      setPortfolioValidationErrors({ title: "", file: "", media_link: "", description: "" });
      await fetchPortfolioItems();
    } catch (err) {
      console.error("Error saving portfolio:", err);
      console.error("Error response:", err.response?.data);
      toast.error(err.response?.data?.detail || "Failed to save portfolio item");
    } finally {
      setIsSavingPortfolio(false);
    }
  };

  const handleEditPortfolio = async (e) => {
    e.preventDefault();
    if (!portfolioForm.id) return;

    const titleError = validateWorkName(portfolioForm.heading);
    if (titleError) {
      toast.error(titleError);
      setPortfolioValidationErrors((prev) => ({ ...prev, title: titleError }));
      return;
    }

    const existingItem = portfolioItems.find(
      (item) => item.id === portfolioForm.id,
    );
    const fileError = validateFileRequired(
      portfolioForm.file,
      existingItem?.file_url,
    );
    if (fileError) {
      toast.error(fileError);
      setPortfolioValidationErrors((prev) => ({ ...prev, file: fileError }));
      return;
    }

    const urlError = validateUrl(portfolioForm.media_link);
    if (urlError) {
      toast.error(urlError);
      setPortfolioValidationErrors((prev) => ({
        ...prev,
        media_link: urlError,
      }));
      return;
    }

    const descError = validatePortfolioDescription(portfolioForm.description, 200);
    if (descError) {
      toast.error(descError);
      setPortfolioValidationErrors((prev) => ({ ...prev, description: descError }));
      return;
    }

    setIsSavingPortfolio(true);

    const formData = new FormData();
    formData.append("heading", portfolioForm.heading);
    formData.append("description", portfolioForm.description || "");
    formData.append("media_link", portfolioForm.media_link || "");
    if (portfolioForm.file) {
      formData.append("file", portfolioForm.file);
    }

    try {
      const response = await api.put(
        `${API_BASE_URL}/collaborator/portfolio/item/${portfolioForm.id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      // console.log("Update response:", response.data);

      toast.success("Portfolio item updated successfully!");
      setActiveModal(null);
      setPortfolioForm({
        heading: "",
        description: "",
        media_link: "",
        file: null,
        id: null,
      });
      setFileName("No file chosen");
      setPortfolioValidationErrors({ title: "", file: "", media_link: "", description: "" });
      await fetchPortfolioItems();
    } catch (err) {
      console.error("Error updating portfolio:", err);
      console.error("Error response:", err.response?.data);
      toast.error(err.response?.data?.detail || "Failed to update portfolio item");
    } finally {
      setIsSavingPortfolio(false);
    }
  };

  // ========== UPDATED DELETE HANDLERS using showConfirm ==========

  const handleDeletePortfolio = () => {
    if (!portfolioForm.id) return;
    showConfirm("Are you sure you want to delete this portfolio item?", async () => {
      try {
        await api.delete(
          `${API_BASE_URL}/collaborator/portfolio/item/${portfolioForm.id}?user_id=${userId}`,
        );
        toast.success("Portfolio item deleted successfully!");
        setActiveModal(null);
        setPortfolioForm({
          heading: "",
          description: "",
          media_link: "",
          file: null,
          id: null,
        });
        setFileName("No file chosen");
        setPortfolioValidationErrors({ title: "", file: "", media_link: "", description: "" });
        await fetchPortfolioItems();
      } catch (err) {
        console.error("Error deleting portfolio:", err);
        toast.error("Failed to delete portfolio item");
      } finally {
        closeConfirm();
      }
    });
  };

  const handleDeleteWorkExperience = (itemId) => {
    showConfirm("Are you sure you want to delete this work experience?", async () => {
      try {
        await api.delete(
          `${API_BASE_URL}/collaborator/work-experience/delete/${itemId}`,
        );
        await fetchWorkExperiences();
        toast.success("Work experience deleted successfully!");
        closeConfirm();
      } catch (err) {
        console.error("Error deleting work experience:", err);
        toast.error("Failed to delete work experience");
        closeConfirm();
      }
    });
  };

  const handleDeleteEducation = (itemId) => {
    showConfirm("Are you sure you want to delete this education?", async () => {
      try {
        await api.delete(
          `${API_BASE_URL}/collaborator/education/delete/${itemId}`,
        );
        await fetchEducations();
        toast.success("Education deleted successfully!");
        closeConfirm();
      } catch (err) {
        console.error("Error deleting education:", err);
        toast.error("Failed to delete education");
        closeConfirm();
      }
    });
  };

  const openEditModal = (item) => {
    setPortfolioForm({
      id: item.id,
      heading: item.heading || item.title,
      description: item.description || "",
      media_link: item.media_link || "",
      file: null,
    });
    setPortfolioValidationErrors({ title: "", file: "", media_link: "", description: "" });
    setActiveModal("portfolio");
  };

  // Replace the getPortfolioImage function with this:
  const getPortfolioImage = (item) => {
    if (item.file_url) {
      // Check if it's already a full URL (S3)
      if (item.file_url.startsWith('http')) {
        return item.file_url;
      }
      // If it's a relative path, prepend API_BASE_URL
      return `${API_BASE_URL}${item.file_url}`;
    }
    if (item.media_link) {
      if (item.media_link.startsWith('http')) {
        return item.media_link;
      }
      return `${API_BASE_URL}${item.media_link}`;
    }
    return Portfolio1;
  };

  const openPortfolioLink = (item) => {
    if (item.media_link) {
      window.open(item.media_link, "_blank");
    }
  };

  const portfolioTotalPages = Math.ceil(
    portfolioItems.length / portfolioItemsPerPage,
  );
  const paginatedPortfolioItems = portfolioItems.slice(
    (portfolioCurrentPage - 1) * portfolioItemsPerPage,
    portfolioCurrentPage * portfolioItemsPerPage,
  );

  const handlePortfolioPageChange = (newPage) => {
    setPortfolioCurrentPage(newPage);
  };

  const reviewsTotalPages = Math.ceil(reviews.length / reviewsItemsPerPage);
  const paginatedReviews = reviews.slice(
    (reviewsCurrentPage - 1) * reviewsItemsPerPage,
    reviewsCurrentPage * reviewsItemsPerPage,
  );

  const handleReviewsPageChange = (newPage) => {
    setReviewsCurrentPage(newPage);
  };

  // ========== WORK EXPERIENCE CRUD ==========

  const validateWorkForm = () => {
    const dateRangeError = validateDateRange(
      workForm.start_year,
      workForm.end_year,
      workForm.is_current,
    );
    const errors = {
      company_name: validateCompanyName(workForm.company_name),
      role: validateRole(workForm.role),
      location: validateLocation(workForm.location),
      description: workForm.description ? validateTextDescription(workForm.description, 200) : "",
      start_year: validateYear(workForm.start_year),
      end_year:
        !workForm.is_current && workForm.end_year
          ? validateYear(workForm.end_year)
          : "",
      date_range: dateRangeError,
    };
    setWorkFormErrors(errors);
    return !Object.values(errors).some((error) => error !== "");
  };

  const handleAddWorkExperience = async (e) => {
    e.preventDefault();
    if (!validateWorkForm()) {
      toast.error("Please fix the validation errors");
      return;
    }
    if (!userId) return;

    setIsSavingWork(true);

    const formData = new FormData();
    Object.keys(workForm).forEach((key) => {
      if (workForm[key] !== null && workForm[key] !== undefined) {
        formData.append(key, String(workForm[key]));
      }
    });

    try {
      if (workForm.id) {
        await api.put(
          `${API_BASE_URL}/collaborator/work-experience/update/${workForm.id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        toast.success("Work experience updated successfully!");
      } else {
        await api.post(
          `${API_BASE_URL}/collaborator/work-experience/add/${userId}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        toast.success("Work experience added successfully!");
      }
      setActiveModal(null);
      setWorkForm({
        company_name: "",
        role: "",
        description: "",
        location: "",
        start_year: "",
        end_year: "",
        is_current: false,
        id: null,
      });
      setWorkFormErrors({
        company_name: "",
        role: "",
        location: "",
        description: "",
        start_year: "",
        end_year: "",
        date_range: "",
      });
      await fetchWorkExperiences();
    } catch (err) {
      console.error("Error saving work experience:", err);
      toast.error("Failed to save work experience");
    } finally {
      setIsSavingWork(false);
    }
  };

  const handleEditWorkExperience = (item) => {
    setWorkForm({
      id: item.id,
      company_name: item.company_name,
      role: item.role,
      description: item.description,
      location: item.location || "",
      start_year: item.start_year,
      end_year: item.end_year || "",
      is_current: item.is_current || false,
    });
    setWorkFormErrors({
      company_name: "",
      role: "",
      location: "",
      description: "",
      start_year: "",
      end_year: "",
      date_range: "",
    });
    setActiveModal("experience");
  };

  // ========== EDUCATION CRUD ==========

  const validateEducationForm = () => {
    const dateRangeError = validateDateRange(
      educationForm.start_year,
      educationForm.end_year,
      educationForm.is_current,
    );
    const errors = {
      institution_name: validateInstitutionName(educationForm.institution_name),
      degree: validateDegree(educationForm.degree),
      field_of_study: validateFieldOfStudy(educationForm.field_of_study),
      location: validateLocation(educationForm.location),
      description: educationForm.description ? validateTextDescription(educationForm.description, 200) : "",
      start_year: validateYear(educationForm.start_year),
      end_year:
        !educationForm.is_current && educationForm.end_year
          ? validateYear(educationForm.end_year)
          : "",
      date_range: dateRangeError,
    };
    setEducationFormErrors(errors);
    return !Object.values(errors).some((error) => error !== "");
  };

  const handleAddEducation = async (e) => {
    e.preventDefault();
    if (!validateEducationForm()) {
      toast.error("Please fix the validation errors");
      return;
    }
    if (!userId) return;

    setIsSavingEducation(true);

    const formData = new FormData();
    Object.keys(educationForm).forEach((key) => {
      if (educationForm[key] !== null && educationForm[key] !== undefined) {
        formData.append(key, String(educationForm[key]));
      }
    });

    try {
      if (educationForm.id) {
        await api.put(
          `${API_BASE_URL}/collaborator/education/update/${educationForm.id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        toast.success("Education updated successfully!");
      } else {
        await api.post(
          `${API_BASE_URL}/collaborator/education/add/${userId}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        toast.success("Education added successfully!");
      }
      setActiveModal(null);
      setEducationForm({
        institution_name: "",
        degree: "",
        field_of_study: "",
        description: "",
        location: "",
        start_year: "",
        end_year: "",
        is_current: false,
        id: null,
      });
      setEducationFormErrors({
        institution_name: "",
        degree: "",
        field_of_study: "",
        location: "",
        description: "",
        start_year: "",
        end_year: "",
        date_range: "",
      });
      await fetchEducations();
    } catch (err) {
      console.error("Error saving education:", err);
      toast.error("Failed to save education");
    } finally {
      setIsSavingEducation(false);
    }
  };

  const handleEditEducation = (item) => {
    setEducationForm({
      id: item.id,
      institution_name: item.institution_name,
      degree: item.degree,
      field_of_study: item.field_of_study || "",
      description: item.description || "",
      location: item.location || "",
      start_year: item.start_year,
      end_year: item.end_year || "",
      is_current: item.is_current || false,
    });
    setEducationFormErrors({
      institution_name: "",
      degree: "",
      field_of_study: "",
      location: "",
      description: "",
      start_year: "",
      end_year: "",
      date_range: "",
    });
    setActiveModal("education");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Unknown";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Unknown";
    }
  };

  // Check if user is logged in
  if (!userId && !userLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#F2F2F2]">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <div className="text-[#51218F] mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-xl font-semibold text-gray-800 mb-2">Authentication Required</p>
          <p className="text-gray-600 mb-6">Please log in to view your profile.</p>
          <button onClick={() => (window.location.href = "/login")} className="px-8 py-3 bg-[#51218F] text-white rounded-full font-semibold">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading || userLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#F2F2F2]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#51218F] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#F2F2F2]">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xl font-semibold text-gray-800 mb-2">Error</p>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="px-8 py-3 bg-[#51218F] text-white rounded-full font-semibold">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#F2F2F2]">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <div className="text-[#51218F] mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="text-xl font-semibold text-gray-800 mb-2">No Profile Found</p>
          <p className="text-gray-600 mb-6">You haven't created your collaborator profile yet.</p>
          <button onClick={() => { resetEditForm(); setEditOpen(true); }} className="px-8 py-3 bg-[#51218F] text-white rounded-full font-semibold">
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  const displayedWork = showAllWork ? workExperiences : workExperiences.slice(0, initialItemsToShow);
  const displayedEducation = showAllEducation ? educations : educations.slice(0, initialItemsToShow);
  const displayedReviews = reviews.slice(0, initialReviewsToShow);

  return (
    <div className="relative w-full min-h-screen bg-[#F2F2F2] flex flex-col overflow-x-hidden">
      {/* Custom Confirm Modal */}
      <ConfirmModal
        open={confirmModal.open}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
      />

      <div className="flex-1 w-full sm:max-w-none max-sm:w-full max-sm:bg-white max-sm:shadow-xl">
        {/* BANNER + HEADER */}
        <div className="relative w-full h-[582px] max-sm:h-[260px] sm:h-[380px] xl:h-[582px]">
          <img src={TopBanner} alt="banner" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute top-0 left-0 w-full z-[100] sm:top-[24px] sm:left-1/2 sm:-translate-x-1/2 sm:max-w-[1280px] sm:px-6">
            <div className="flex items-center justify-between text-white px-4 sm:px-0">
              <ColHeader />
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="origin-top transition-all duration-300">
          <div className="max-w-[1280px] mx-auto mt-[-260px] max-sm:mt-0 relative px-3 sm:px-4 md:px-6 xl:px-0">
            {/* PROFILE SECTION */}
            <div className="grid grid-cols-1 xl:grid-cols-[804px_392px] gap-[31px] mt-6">
              {/* DESKTOP PROFILE */}
              <div className="hidden xl:block">
                <div className="bg-white shadow-lg flex gap-6 w-full xl:w-[804px] rounded-[10px] p-6">
                  <div className="flex flex-col items-start w-[218px] flex-shrink-0">
                    <img
                      src={getProfilePictureUrl()}
                      alt="profile"
                      className="w-[218px] h-[219px] rounded-[9px] object-cover"
                      onError={(e) => {
                        e.target.src = Rectangle;
                      }}
                    />
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-lg">{getCountryFlag(profileData?.location)}</span>
                      <span className="text-[14px] font-medium">{formatLocation(profileData?.location)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="#000" strokeWidth="1.5" />
                        <path d="M12 6v6l4 2" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      <span className="text-[14px] font-medium">
                        It's currently {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} here
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="4" width="18" height="18" rx="2" stroke="#000" strokeWidth="1.5" />
                        <path d="M8 2v4M16 2v4M3 10h18" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      <span className="text-[14px] font-medium">
                        Joined {profileData?.created_at ? formatDate(profileData.created_at) : "Unknown"}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-[22px] font-semibold break-words">{getUserDisplayName()}</h2>
                        <p className="text-[14px] text-[#2A1E1780] font-medium">{profileData?.skill_category}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                            <span className="text-[#5B2D8B] font-semibold text-sm">
                              {reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "0.0"}/5
                            </span>
                            <span className="text-xs text-gray-600">({reviews.length} Reviews)</span>
                          </div>
                          <div className="bg-gray-100 px-3 py-1 rounded-full">
                            <span className="text-xs font-medium">
                              Total earnings: ₹{totalEarnings.toLocaleString()}
                            </span>
                          </div>
                          <div className="bg-gray-100 px-3 py-1 rounded-full">
                            <span className="text-xs font-medium">{completedProjects || 0} projects completed</span>
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-gray-600 space-y-1">
                          {profileData?.language && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Language:</span> {profileData.language}
                            </div>
                          )}
                          {profileData?.availability && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Availability:</span> {profileData.availability}
                            </div>
                          )}
                          {profileData?.timing && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Timing:</span> {profileData.timing}
                            </div>
                          )}
                          {editFormData.followers !== undefined && editFormData.followers !== null && editFormData.followers !== "" && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Followers:</span>
                              {parseInt(editFormData.followers).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => { resetEditForm(); setEditOpen(true); }}
                        className="px-6 py-2 rounded-full text-[#6A3EA1] text-sm font-semibold hover:bg-[#6A3EA1]/10 transition whitespace-nowrap flex-shrink-0"
                        style={{ border: '1px solid #51218F' }}
                      >
                        Edit Profile
                      </button>
                    </div>

                    {/* About section with scroll */}
                    <div className="mt-5">
                      <div className="max-h-[100px] overflow-y-auto pr-2 [scrollbar-width:thin]">
                        <p className="text-black text-[14px] leading-[22px] font-medium whitespace-pre-wrap break-words">
                          {profileData?.about}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* MOBILE PROFILE */}
              <div className="block xl:hidden bg-white rounded-[16px] shadow-lg p-4">
                <div className="flex gap-3">
                  <div className="relative">
                    <img src={getProfilePictureUrl()} className="w-[82px] h-[132px] rounded-lg object-cover" alt="profile" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-[20px] font-semibold text-[#2A1E17]">{getUserDisplayName()}</h3>
                      <button
                        onClick={() => setEditOpen(true)}
                        className="border border-[#51218F] text-[#51218F] text-[9px] xs:text-[10px] sm:text-xs px-2 xs:px-3 py-0.5 xs:py-1 rounded-full hover:bg-[#51218F]/10 transition whitespace-nowrap"
                        style={{
                          border: '1px solid #51218F'
                        }}
                      >
                        Edit Profile
                      </button>
                    </div>
                    <p className="text-xs text-[#6B6B6B] mt-1">{profileData?.skill_category}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs">
                      <span className="text-[#5B2D8B] font-semibold">
                        {reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "0.0"}/5
                      </span>
                      <span className="text-gray-500">({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs flex-wrap">
                      <span className="bg-gray-100 px-2 py-1 rounded-full">
                        Earnings: ₹{totalEarnings.toLocaleString()}
                      </span>
                      <span className="bg-gray-100 px-2 py-1 rounded-full">{completedProjects || 0} projects</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {profileData?.language && <div>Language: {profileData.language}</div>}
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-lg">{getCountryFlag(profileData?.location)}</span>
                        <span>{profileData?.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-gray-600">{profileData?.about?.substring(0, 150)}...</p>
                <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="1.5" />
                    <path d="M8 2v4M16 2v4M3 10h18" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span>Joined {profileData?.created_at ? formatDate(profileData.created_at) : "Unknown"}</span>
                </div>
              </div>

              {/* EDIT PROFILE MODAL */}
              {editOpen && (
                <>
                  <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-lg z-[99999]"
                    onClick={() => { resetEditForm(); setEditOpen(false); setProfilePictureFile(null); setProfilePicturePreview(null); }}
                  ></div>

                  <div className="fixed inset-0 z-[99999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-2 xs:p-4 overflow-y-auto">
                    <div className="bg-white rounded-[20px] xs:rounded-[24px] shadow-xl w-full max-w-[820px] max-h-[calc(100vh-100px)] xs:max-h-[calc(100vh-120px)] sm:max-h-[calc(100vh-140px)] overflow-y-auto mx-2 xs:mx-4 sm:mx-6 pr-1 xs:pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                      <div className="p-3 xs:p-4 sm:p-6 md:p-8">
                        <div className="flex justify-between items-center mb-3 xs:mb-4 sm:mb-6">
                          <h2 className="text-lg xs:text-xl sm:text-2xl font-semibold">Edit Profile</h2>
                          <button
                            onClick={() => { resetEditForm(); setEditOpen(false); setProfilePictureFile(null); setProfilePicturePreview(null); }}
                            className="text-gray-500 hover:text-black text-base xs:text-lg sm:text-xl"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="space-y-3 xs:space-y-4">
                          {/* Profile Picture - bigger size */}
                          <div>
                            <label className="block text-[11px] xs:text-xs sm:text-sm font-medium mb-1.5 xs:mb-2">Profile Picture</label>
                            <div className="flex items-center gap-3 xs:gap-4 justify-center">
                              <div className="relative group">
                                <img
                                  src={getProfilePictureUrl()}
                                  className="w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-gray-300"
                                  alt="profile"
                                />
                                {/* Pencil edit icon overlay - bigger icon */}
                                <label
                                  htmlFor="profile-pic-input"
                                  className="absolute bottom-0 right-0 p-1.5 bg-[#51218F] rounded-full border-2 border-white cursor-pointer shadow-md hover:bg-[#6D28D9] transition-all duration-200 hover:scale-110"
                                  style={{ transform: 'translate(10%, 10%)' }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5 xs:w-6 xs:h-6 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                </label>
                                <input
                                  id="profile-pic-input"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleProfilePictureChange}
                                  className="hidden"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Name with validation */}
                          <div>
                            <label className="block text-[11px] xs:text-xs sm:text-sm font-medium mb-1.5 xs:mb-2">Full Name <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              value={editFormData.name}
                              onChange={(e) => {
                                let value = e.target.value;
                                value = value.replace(/[^A-Za-z\s]/g, '');
                                if (value.length <= 50) {
                                  setEditFormData({ ...editFormData, name: value });
                                  setEditFormErrors({ ...editFormErrors, name: validateName(value) });
                                }
                              }}
                              onBlur={() => {
                                const trimmed = editFormData.name.trim();
                                if (trimmed !== editFormData.name) {
                                  setEditFormData({ ...editFormData, name: trimmed });
                                  setEditFormErrors({ ...editFormErrors, name: validateName(trimmed) });
                                }
                              }}
                              maxLength={50}
                              style={{ border: "2px solid #9ca3af", backgroundColor: "#ffffff" }}
                              className="w-full px-3 xs:px-4 py-2 xs:py-3 text-[11px] xs:text-xs sm:text-sm rounded-lg text-gray-900 outline-none"
                              placeholder="Your professional display name"
                            />
                            {editFormErrors.name && <p className="text-red-500 text-[9px] xs:text-[10px] sm:text-xs mt-1">{editFormErrors.name}</p>}
                            <p className="text-[9px] xs:text-[10px] text-gray-400 mt-1 text-right">{editFormData.name.length}/50 characters</p>
                          </div>

                          {/* Phone Number with validation */}
                          <div>
                            <label className="block text-[11px] xs:text-xs sm:text-sm font-medium mb-1.5 xs:mb-2">Phone Number <span className="text-red-500">*</span></label>
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <div className="flex items-center px-2 xs:px-3 sm:px-4 py-2 xs:py-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50">
                                  <span className="text-gray-700 font-medium text-[11px] xs:text-xs sm:text-sm">🇮🇳 +91</span>
                                </div>
                              </div>
                              <input
                                type="tel"
                                value={editFormData.phone_number?.replace(/\D/g, "").slice(0, 10) || ""}
                                onChange={(e) => {
                                  const numbersOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                                  setEditFormData({ ...editFormData, phone_number: numbersOnly });
                                  setEditFormErrors({ ...editFormErrors, phone_number: validatePhoneRequired(numbersOnly) });
                                }}
                                placeholder="12345 67890"
                                maxLength={10}
                                style={{ border: "2px solid #9ca3af", backgroundColor: "#ffffff" }}
                                className="flex-1 px-3 xs:px-4 py-2 xs:py-3 text-[11px] xs:text-xs sm:text-sm border border-l-0 rounded-r-lg text-gray-900 outline-none"
                              />
                            </div>
                            {editFormErrors.phone_number && <p className="text-red-500 text-[9px] xs:text-[10px] sm:text-xs mt-1">{editFormErrors.phone_number}</p>}
                            <p className="text-[10px] xs:text-xs text-blue-600 mt-1">💡 This number will be used for verification and notifications</p>
                          </div>

                          {/* Email Field - Editable only if not set */}
                          <div>
                            <label className="block text-[11px] xs:text-xs sm:text-sm font-medium mb-1.5 xs:mb-2">
                              Email Address {!profileData?.email && <span className="text-red-500">*</span>}
                            </label>
                            <div className="relative">
                              <input
                                type="email"
                                value={editFormData.email}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setEditFormData({ ...editFormData, email: value });
                                  if (!profileData?.email && value.trim()) {
                                    const validation = validateEmailWithSuggestions(value);
                                    setEditFormErrors(prev => ({ ...prev, email: validation.error }));
                                    if (validation.suggestion && validation.suggestion !== value.toLowerCase()) {
                                      toast.warning(`Did you mean "${validation.suggestion}"?`, {
                                        duration: 5000,
                                        action: {
                                          label: "Use this",
                                          onClick: () => setEditFormData({ ...editFormData, email: validation.suggestion })
                                        }
                                      });
                                    }
                                  } else {
                                    setEditFormErrors(prev => ({ ...prev, email: "" }));
                                  }
                                }}
                                onBlur={() => {
                                  if (!profileData?.email && editFormData.email.trim()) {
                                    const validation = validateEmailWithSuggestions(editFormData.email);
                                    setEditFormErrors(prev => ({ ...prev, email: validation.error }));
                                  }
                                }}
                                readOnly={!!profileData?.email}
                                style={{
                                  border: profileData?.email ? "2px solid #d1d5db" : "2px solid #9ca3af",
                                  backgroundColor: profileData?.email ? "#f3f4f6" : "#ffffff",
                                }}
                                className={`w-full px-3 xs:px-4 py-2 xs:py-3 text-[11px] xs:text-xs sm:text-sm rounded-lg text-gray-900 outline-none ${profileData?.email ? "cursor-not-allowed" : ""}`}
                                placeholder={profileData?.email ? "Email already set" : "Enter your email address"}
                              />
                              {profileData?.email && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                  <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Current Email</span>
                                </div>
                              )}
                            </div>
                            {!profileData?.email && editFormErrors.email && (
                              <p className="text-red-500 text-[9px] xs:text-[10px] sm:text-xs mt-1">{editFormErrors.email}</p>
                            )}
                            {!profileData?.email && (
                              <p className="text-[10px] text-gray-400 mt-1">This email will be used for login and verification</p>
                            )}
                          </div>

                          {/* Skill Category - allow numbers */}
                          <div>
                            <label className="block text-[11px] xs:text-xs sm:text-sm font-medium mb-1.5 xs:mb-2">Skill Category</label>
                            <input
                              type="text"
                              value={editFormData.skill_category}
                              onChange={(e) => {
                                const value = e.target.value;
                                setEditFormData({ ...editFormData, skill_category: value });
                                setEditFormErrors({ ...editFormErrors, skill_category: validateSkillCategory(value) });
                              }}
                              maxLength={50}
                              style={{ border: "2px solid #9ca3af", backgroundColor: "#ffffff" }}
                              className="w-full px-3 xs:px-4 py-2 xs:py-3 text-[11px] xs:text-xs sm:text-sm rounded-lg text-gray-900 outline-none"
                              placeholder="e.g., Web Developer / UI-Designer"
                            />
                            {editFormErrors.skill_category && <p className="text-red-500 text-[9px] xs:text-[10px] sm:text-xs mt-1">{editFormErrors.skill_category}</p>}
                          </div>

                          {/* Location with validation */}
                          <div>
                            <label className="block text-[11px] xs:text-xs sm:text-sm font-medium mb-1.5 xs:mb-2">Location <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              value={editFormData.location}
                              onChange={(e) => {
                                setEditFormData({ ...editFormData, location: e.target.value });
                                setEditFormErrors({ ...editFormErrors, location: validateTextRequiredAlphabets(e.target.value, "Location") });
                              }}
                              maxLength={100}
                              style={{ border: "2px solid #9ca3af", backgroundColor: "#ffffff" }}
                              className="w-full px-3 xs:px-4 py-2 xs:py-3 text-[11px] xs:text-xs sm:text-sm rounded-lg text-gray-900 outline-none"
                              placeholder="e.g., New York, USA"
                            />
                            {editFormErrors.location && <p className="text-red-500 text-[9px] xs:text-[10px] sm:text-xs mt-1">{editFormErrors.location}</p>}
                          </div>

                          {/* Language with validation */}
                          <div>
                            <label className="block text-[11px] xs:text-xs sm:text-sm font-medium mb-1.5 xs:mb-2">Language <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              value={editFormData.language}
                              onChange={(e) => {
                                setEditFormData({ ...editFormData, language: e.target.value });
                                setEditFormErrors({ ...editFormErrors, language: validateTextRequiredAlphabets(e.target.value, "Language") });
                              }}
                              maxLength={50}
                              style={{ border: "2px solid #9ca3af", backgroundColor: "#ffffff" }}
                              className="w-full px-3 xs:px-4 py-2 xs:py-3 text-[11px] xs:text-xs sm:text-sm rounded-lg text-gray-900 outline-none"
                              placeholder="e.g., English, Spanish"
                            />
                            {editFormErrors.language && <p className="text-red-500 text-[9px] xs:text-[10px] sm:text-xs mt-1">{editFormErrors.language}</p>}
                          </div>

                          {/* Experience with validation */}
                          <div>
                            <label className="block text-[11px] xs:text-xs sm:text-sm font-medium mb-1.5 xs:mb-2">Experience <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              value={editFormData.experience}
                              onChange={(e) => {
                                setEditFormData({ ...editFormData, experience: e.target.value });
                                setEditFormErrors({ ...editFormErrors, experience: validateExperience(e.target.value) });
                              }}
                              maxLength={50}
                              style={{ border: "2px solid #9ca3af", backgroundColor: "#ffffff" }}
                              className="w-full px-3 xs:px-4 py-2 xs:py-3 text-[11px] xs:text-xs sm:text-sm rounded-lg text-gray-900 outline-none"
                              placeholder="e.g., 5 years"
                            />
                            {editFormErrors.experience && <p className="text-red-500 text-[9px] xs:text-[10px] sm:text-xs mt-1">{editFormErrors.experience}</p>}
                          </div>

                          {/* Availability with validation */}
                          <div>
                            <label className="block text-[11px] xs:text-xs sm:text-sm font-medium mb-1.5 xs:mb-2">Availability <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              value={editFormData.availability}
                              onChange={(e) => {
                                setEditFormData({ ...editFormData, availability: e.target.value });
                                setEditFormErrors({ ...editFormErrors, availability: validateAlphabetsSpacesHyphen(e.target.value) });
                              }}
                              maxLength={50}
                              style={{ border: "2px solid #9ca3af", backgroundColor: "#ffffff" }}
                              className="w-full px-3 xs:px-4 py-2 xs:py-3 text-[11px] xs:text-xs sm:text-sm rounded-lg text-gray-900 outline-none"
                              placeholder="e.g., Full-time, Part-time"
                            />
                            {editFormErrors.availability && <p className="text-red-500 text-[9px] xs:text-[10px] sm:text-xs mt-1">{editFormErrors.availability}</p>}
                          </div>

                          {/* Timing with validation */}
                          <div>
                            <label className="block text-[11px] xs:text-xs sm:text-sm font-medium mb-1.5 xs:mb-2">Timing <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              value={editFormData.timing}
                              onChange={(e) => {
                                setEditFormData({ ...editFormData, timing: e.target.value });
                                setEditFormErrors({ ...editFormErrors, timing: validateTimingFlexible(e.target.value) });
                              }}
                              style={{ border: "2px solid #9ca3af", backgroundColor: "#ffffff" }}
                              className="w-full px-3 xs:px-4 py-2 xs:py-3 text-[11px] xs:text-xs sm:text-sm rounded-lg text-gray-900 outline-none"
                              placeholder="e.g., Flexible, 9 AM - 5 PM"
                            />
                            {editFormErrors.timing && <p className="text-red-500 text-[9px] xs:text-[10px] sm:text-xs mt-1">{editFormErrors.timing}</p>}
                          </div>

                          {/* Badges with validation */}
                          <div>
                            <label className="block text-[11px] xs:text-xs sm:text-sm font-medium mb-1.5 xs:mb-2">Badges</label>
                            <input
                              type="text"
                              value={editFormData.badges}
                              onChange={(e) => {
                                setEditFormData({ ...editFormData, badges: e.target.value });
                                setEditFormErrors({ ...editFormErrors, badges: validateAlphabetsNumbersSpaces(e.target.value) });
                              }}
                              maxLength={50}
                              style={{ border: "2px solid #9ca3af", backgroundColor: "#ffffff" }}
                              className="w-full px-3 xs:px-4 py-2 xs:py-3 text-[11px] xs:text-xs sm:text-sm rounded-lg text-gray-900 outline-none"
                              placeholder="e.g., Top Rated, Verified"
                            />
                            {editFormErrors.badges && <p className="text-red-500 text-[9px] xs:text-[10px] sm:text-xs mt-1">{editFormErrors.badges}</p>}
                          </div>

                          {/* Projects Completed - Read Only */}
                          <div>
                            <label className="block text-[11px] xs:text-xs sm:text-sm font-medium mb-1.5 xs:mb-2">Projects Completed</label>
                            <input
                              type="number"
                              value={completedProjects}
                              disabled
                              className="w-full px-3 xs:px-4 py-2 xs:py-3 text-[11px] xs:text-xs sm:text-sm border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed outline-none"
                            />
                            <p className="text-[9px] xs:text-[10px] sm:text-xs text-gray-500 mt-1">Auto-calculated from completed contracts</p>
                          </div>

                          {/* Skills Rating with validation */}
                          <div>
                            <label className="block text-[11px] xs:text-xs sm:text-sm font-medium mb-1.5 xs:mb-2">Skills Rating (0-5)</label>
                            <input
                              type="text"
                              value={editFormData.skills_rating}
                              onChange={(e) => {
                                setEditFormData({ ...editFormData, skills_rating: e.target.value });
                                setEditFormErrors({ ...editFormErrors, skills_rating: e.target.value ? validateDecimalNumbers(e.target.value) : "" });
                              }}
                              style={{ border: "2px solid #9ca3af", backgroundColor: "#ffffff" }}
                              className="w-full px-3 xs:px-4 py-2 xs:py-3 text-[11px] xs:text-xs sm:text-sm rounded-lg text-gray-900 outline-none"
                              placeholder="e.g., 4.5"
                            />
                            {editFormErrors.skills_rating && <p className="text-red-500 text-[9px] xs:text-[10px] sm:text-xs mt-1">{editFormErrors.skills_rating}</p>}
                          </div>

                          {/* About - allow numbers */}
                          <div>
                            <label className="block text-[11px] xs:text-xs sm:text-sm font-medium mb-1.5 xs:mb-2">About</label>
                            <textarea
                              rows={3}
                              value={editFormData.about}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value.length <= 200) {
                                  setEditFormData({ ...editFormData, about: value });
                                  setEditFormErrors({ ...editFormErrors, about: validateAbout(value) });
                                }
                              }}
                              maxLength={200}
                              style={{ border: "2px solid #9ca3af", backgroundColor: "#ffffff" }}
                              className="w-full px-3 xs:px-4 py-2 xs:py-3 text-[11px] xs:text-xs sm:text-sm rounded-lg text-gray-900 outline-none"
                              placeholder="Tell us about yourself..."
                            />
                            {editFormErrors.about && <p className="text-red-500 text-[9px] xs:text-[10px] sm:text-xs mt-1">{editFormErrors.about}</p>}
                            <p className="text-[9px] xs:text-[10px] text-gray-400 mt-1 text-right">{editFormData.about.length}/200 characters</p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 xs:gap-3 sm:gap-4 pt-3 xs:pt-4 justify-center">
                            <button
                              onClick={handleEditProfile}
                              disabled={isSavingProfile}
                              className={`w-[122px] h-[39px] opacity-100 rounded-[100px] flex items-center justify-center px-[36px] py-[12px] gap-[10px] transition-all duration-200 cursor-pointer group ${isSavingProfile
                                ? "opacity-50 cursor-not-allowed bg-gray-400"
                                : "bg-[#51218F] hover:bg-[#6D28D9]"
                                }`}
                            >
                              <span className="font-montserrat font-bold text-[12px] leading-[100%] text-white whitespace-nowrap flex items-center gap-2">
                                {isSavingProfile ? (
                                  <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                  </>
                                ) : (
                                  "Save Changes"
                                )}
                              </span>
                            </button>

                            <button
                              onClick={() => {
                                resetEditForm();
                                setEditOpen(false);
                                setProfilePictureFile(null);
                                setProfilePicturePreview(null);
                              }}
                              disabled={isSavingProfile}
                              className={`w-[122px] h-[39px] opacity-100 rounded-[100px] flex items-center justify-center px-[36px] py-[12px] gap-[10px] transition-all duration-200 cursor-pointer group ${isSavingProfile
                                ? "opacity-50 cursor-not-allowed bg-gray-400"
                                : "bg-[#5B2D8B] hover:bg-[#4A2575] border border-[#6A3EA1]"
                                }`}
                            >
                              <span className="font-montserrat font-bold text-[12px] leading-[100%] text-white whitespace-nowrap">
                                Cancel
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* RIGHT SIDEBAR */}
              <div className="w-full xl:w-[392px] xl:max-w-[392px] space-y-4 sm:space-y-6 px-3 sm:px-0 xl:ml-4 xl:relative">
                {/* Verification Section */}
                <div className="bg-white rounded-xl shadow p-4 sm:p-6">
                  <div className="flex items-center mb-4">
                    <h4 className="text-base sm:text-lg font-semibold">Verification</h4>
                  </div>
                  <div className="w-full h-px bg-black/10 mb-4" />

                  {/* Phone Verification */}
                  <div className="flex items-center justify-between mb-4 gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                      <div className="w-[16px] xs:w-[18px] h-[16px] xs:h-[18px] flex-shrink-0">
                        {phoneVerified ? (
                          <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                            <circle cx="10" cy="10" r="9" fill="#10B981" />
                            <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2A1E17" strokeWidth="2" className="w-full h-full">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                        )}
                      </div>
                      <span className="text-[11px] xs:text-[13px] sm:text-[14px] text-[#2A1E17] whitespace-nowrap">
                        Phone Verification
                      </span>
                    </div>
                    {!phoneVerified ? (
                      <button
                        onClick={handleVerifyPhone}
                        className="text-[11px] xs:text-[13px] sm:text-[14px] text-[#51218F] font-medium hover:opacity-80 whitespace-nowrap flex-shrink-0"
                      >
                        Verify
                      </button>
                    ) : (
                      <span className="text-[11px] xs:text-[13px] sm:text-[14px] text-green-600 font-medium whitespace-nowrap flex-shrink-0">
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Email Verification */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                      <div className="w-[16px] xs:w-[18px] h-[16px] xs:h-[18px] flex-shrink-0">
                        {emailVerified ? (
                          <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                            <circle cx="10" cy="10" r="9" fill="#10B981" />
                            <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2A1E17" strokeWidth="2" className="w-full h-full">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                        )}
                      </div>
                      <span className="text-[11px] xs:text-[13px] sm:text-[14px] text-[#2A1E17] whitespace-nowrap">
                        Email Verification
                      </span>
                    </div>
                    {!emailVerified ? (
                      <button
                        onClick={handleVerifyEmail}
                        className="text-[11px] xs:text-[13px] sm:text-[14px] text-[#51218F] font-medium hover:opacity-80 whitespace-nowrap flex-shrink-0"
                      >
                        Verify
                      </button>
                    ) : (
                      <span className="text-[11px] xs:text-[13px] sm:text-[14px] text-green-600 font-medium whitespace-nowrap flex-shrink-0">
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* TOP SKILLS Section */}
                <div className="bg-white rounded-xl shadow p-4 sm:p-5 w-full">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-[16px] xs:text-[18px] font-semibold">Skills Required</h4>
                  </div>
                  <div className="h-[1px] bg-black/10 my-3 sm:my-4" />

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
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 xs:p-3 max-h-48 overflow-y-auto">
                        <div className="flex flex-wrap gap-1.5 xs:gap-2">
                          {searchResults.map((skill, index) => (
                            <button
                              key={index}
                              onClick={() => addSkill(skill)}
                              className="px-2 xs:px-3 py-1 xs:py-1.5 bg-[#51218F] text-white rounded-full text-[10px] xs:text-[12px] font-medium hover:bg-[#3D1768] transition-colors whitespace-nowrap"
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="w-full min-h-[40px] xs:min-h-[45px] rounded-[10px] !border !border-black/30 flex flex-wrap items-center gap-1.5 xs:gap-2 px-2 xs:px-3 py-1.5 mt-2">
                    {selectedSkills.map((skill, index) => (
                      <span key={index} className="flex items-center gap-1 px-2 xs:px-3 py-0.5 xs:py-1 bg-[#51218F] text-white rounded-full text-[11px] xs:text-[14px] font-['Montserrat'] font-medium">
                        {skill.length > 12 ? `${skill.substring(0, 12)}...` : skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="hover:text-gray-200 focus:outline-none rounded-full text-sm xs:text-base">
                          ×
                        </button>
                      </span>
                    ))}
                    {selectedSkills.length === 0 && (
                      <span className="text-gray-400 text-[12px] xs:text-[14px] font-['Montserrat']">No skills added yet</span>
                    )}
                  </div>

                  <div className="flex justify-center items-center gap-2 xs:gap-4 mt-3">
                    <div className="flex items-center gap-2 xs:gap-3 flex-wrap justify-center">
                      <button
                        onClick={handleSaveSkills}
                        disabled={isSavingProfile}
                        className="!border border-[#51218F] px-3 xs:px-4 py-0.5 xs:py-1 rounded-full text-[#51218F] text-[11px] xs:text-[12px] hover:bg-[#51218F] hover:text-white transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSavingProfile ? (
                          <>
                            <svg className="animate-spin h-3 w-3 text-[#51218F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </>
                        ) : (
                          "Save Skills"
                        )}
                      </button>
                      {selectedSkills.length > 0 && (
                        <p className="text-right text-[11px] xs:text-[12px] font-['Montserrat'] text-[#51218F] whitespace-nowrap">
                          {selectedSkills.length}/15 skills added
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PORTFOLIO SECTION */}
            <div className="mt-8 bg-white shadow-lg rounded-xl p-6 w-full xl:w-[804px] xl:max-w-[804px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base xs:text-lg sm:text-xl font-semibold">My Portfolio</h3>
                <button
                  onClick={() => {
                    setPortfolioForm({ heading: "", description: "", media_link: "", file: null, id: null });
                    setPortfolioValidationErrors({ title: "", file: "", media_link: "", description: "" });
                    setFileName("No file chosen");
                    setActiveModal("portfolio");
                  }}
                  className="px-3 xs:px-4 sm:px-6 py-1 xs:py-1.5 sm:py-2 rounded-full text-[#6A3EA1] text-[11px] xs:text-xs sm:text-sm hover:bg-[#6A3EA1]/10 transition whitespace-nowrap flex items-center gap-2"
                  style={{ border: '1px solid #51218F' }}
                  disabled={isSavingPortfolio}
                >
                  {isSavingPortfolio ? (
                    <>
                      <svg className="animate-spin h-3 w-3 text-[#6A3EA1]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </>
                  ) : (
                    "Add Portfolio"
                  )}
                </button>
              </div>
              <div className="h-px bg-gray-200 my-4" />

              {/* Desktop View - Grid */}
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {portfolioItems.slice(0, 3).map((item, index) => (
                  <div
                    key={item.id || index}
                    className="relative rounded-lg overflow-hidden border-2 border-gray-200 cursor-pointer group hover:border-[#51218F] hover:shadow-xl transition-all duration-300"
                    onClick={() => openPortfolioLink(item)}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={getPortfolioImage(item)}
                        alt={item.heading || "portfolio"}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          const index = portfolioItems.indexOf(item);
                          e.target.src = index === 0 ? Portfolio1 : index === 1 ? Portfolio2 : Portfolio3;
                        }}
                      />
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(item);
                        }}
                        className="absolute top-3 right-3 flex items-center justify-center cursor-pointer hover:scale-105 transition z-10"
                      >
                        <div className="bg-[#51218F] rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:scale-110 transition-transform hover:bg-[#6A3EA1]">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
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
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="text-white text-sm font-semibold px-3 py-1 bg-black/50 rounded-full">
                          View Project
                        </span>
                      </div>
                    </div>
                    {item.heading && item.heading.trim() !== "" && (
                      <div className="p-3 bg-white border-t border-gray-100">
                        <p className="text-[13px] font-semibold text-gray-800 text-center line-clamp-2">
                          {item.heading}
                        </p>
                        {item.description && (
                          <p className="text-[11px] text-gray-500 mt-1 text-center line-clamp-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Mobile View - Horizontal Scroll */}
              <div className="md:hidden flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
                {portfolioItems.slice(0, 3).map((item, index) => (
                  <div
                    key={item.id || index}
                    className="relative min-w-[140px] flex-shrink-0 cursor-pointer group"
                    onClick={() => openPortfolioLink(item)}
                  >
                    <div className="relative h-[100px] rounded-t-lg overflow-hidden border-2 border-gray-200 group-hover:border-[#51218F] transition-all duration-300">
                      <img
                        src={getPortfolioImage(item)}
                        alt={item.heading || "portfolio"}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => { e.target.src = index === 0 ? Portfolio1 : index === 1 ? Portfolio2 : Portfolio3; }}
                      />
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(item);
                        }}
                        className="absolute top-1 right-1 flex items-center justify-center cursor-pointer hover:scale-105 transition z-10"
                      >
                        <div className="bg-[#51218F] rounded-full w-6 h-6 flex items-center justify-center shadow-sm hover:scale-110 transition-transform hover:bg-[#6A3EA1]">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="text-white text-[10px] font-semibold px-2 py-0.5 bg-black/50 rounded-full">
                          View
                        </span>
                      </div>
                    </div>
                    {item.heading && item.heading.trim() !== "" && (
                      <div className="p-2 bg-white border border-t-0 border-gray-200 rounded-b-lg">
                        <p className="text-[10px] font-semibold text-gray-800 text-center truncate">
                          {item.heading}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {portfolioItems.length === 0 && (
                <p className="text-center text-gray-500 py-8">No portfolio items yet.</p>
              )}

              {/* View All Button */}
              {portfolioItems.length > 0 && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setShowPortfolioPopup(true)}
                    className="px-6 py-2 rounded-full border-2 border-[#51218F] text-[#51218F] text-sm font-semibold hover:bg-[#51218F] hover:text-white transition-all duration-300 hover:shadow-lg"
                  >
                    View All ({portfolioItems.length} {portfolioItems.length === 1 ? 'item' : 'items'})
                  </button>
                </div>
              )}
            </div>

            {/* ADD/EDIT PORTFOLIO MODAL */}
            {activeModal === "portfolio" && (
              <>
                <div
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999]"
                  onClick={() => {
                    setActiveModal(null);
                    setPortfolioForm({ heading: "", description: "", media_link: "", file: null, id: null });
                    setFileName("No file chosen");
                    setPortfolioValidationErrors({ title: '', file: '', media_link: '', description: '' });
                  }}
                ></div>

                <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4 py-10">
                  <div className="bg-white rounded-[24px] shadow-xl w-full max-w-[820px] max-h-[calc(100vh-140px)] overflow-y-auto mx-6 pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <div className="p-8">
                      <div className="flex justify-between items-center mb-4 gap-2">
                        <h3 className="text-[16px] xs:text-lg sm:text-xl font-semibold whitespace-nowrap">
                          {portfolioForm.id ? 'Edit' : 'Add'} Portfolio Item
                        </h3>
                        <button
                          onClick={() => {
                            setActiveModal(null);
                            setPortfolioForm({ heading: "", description: "", media_link: "", file: null, id: null });
                            setFileName("No file chosen");
                            setPortfolioValidationErrors({ title: '', file: '', media_link: '', description: '' });
                          }}
                          className="text-gray-500 hover:text-black text-sm xs:text-lg sm:text-xl flex-shrink-0 leading-none"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={portfolioForm.id ? handleEditPortfolio : handleAddPortfolio}>
                        <div className="mb-3">
                          <label className="block text-sm font-medium mb-2">Work Name <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            value={portfolioForm.heading}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.length <= 50) {
                                setPortfolioForm({ ...portfolioForm, heading: value });
                                const error = validateWorkName(value);
                                setPortfolioValidationErrors(prev => ({ ...prev, title: error }));
                              }
                            }}
                            maxLength={50}
                            style={{ border: '2px solid #9ca3af', backgroundColor: '#ffffff' }}
                            className="w-full px-4 py-3 text-sm rounded-lg outline-none"
                            placeholder="Enter work name"
                            required
                          />
                          {portfolioValidationErrors.title && <p className="text-red-500 text-xs mt-1">{portfolioValidationErrors.title}</p>}
                          <p className="text-[10px] text-gray-400 mt-1 text-right">{portfolioForm.heading.length}/50 characters</p>
                        </div>

                        {/* Portfolio Modal - Media File section */}
                        <div className="mb-3">
                          <label className="block text-sm font-medium mb-2">
                            Media File {!portfolioForm.id && <span className="text-red-500">*</span>}
                          </label>
                          <div style={{ border: '2px solid #9ca3af', backgroundColor: '#ffffff' }} className="w-full flex items-center px-4 py-2 gap-4 rounded-lg">
                            <label
                              className="px-5 py-2 rounded-full cursor-pointer text-sm font-medium transition-all duration-200 hover:scale-105"
                              style={{
                                background: 'linear-gradient(135deg, #51218F 0%, #6A3EA1 100%)',
                                color: 'white',
                                boxShadow: '0 2px 8px rgba(81, 33, 143, 0.3)',
                                border: 'none'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(81, 33, 143, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 2px 8px rgba(81, 33, 143, 0.3)';
                              }}
                            >
                              Choose File
                              <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/jpg,image/png,image/webp"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const fileExtension = file.name.split('.').pop().toLowerCase();
                                    const allowedExtensions = ["jpg", "jpeg", "png", "webp"];
                                    const maxSize = 5 * 1024 * 1024;

                                    if (!allowedExtensions.includes(fileExtension)) {
                                      toast.error("Only JPG, JPEG, PNG, and WEBP images are allowed");
                                      e.target.value = "";
                                      setFileName("No file chosen");
                                      setPortfolioValidationErrors(prev => ({ ...prev, file: "Only JPG, JPEG, PNG, and WEBP images are allowed" }));
                                      return;
                                    }

                                    if (file.size > maxSize) {
                                      toast.error("Image size must be less than 5 MB");
                                      e.target.value = "";
                                      setFileName("No file chosen");
                                      setPortfolioValidationErrors(prev => ({ ...prev, file: "Image size must be less than 5 MB" }));
                                      return;
                                    }

                                    setPortfolioForm({ ...portfolioForm, file });
                                    setFileName(file.name);
                                    setPortfolioValidationErrors(prev => ({ ...prev, file: "" }));
                                  }
                                }}
                              />
                            </label>
                            <span className="text-gray-500 text-sm truncate flex-1">
                              {portfolioForm.file?.name || (portfolioForm.id ? "Current file retained" : fileName)}
                            </span>
                          </div>
                          {portfolioValidationErrors.file && <p className="text-red-500 text-xs mt-1">{portfolioValidationErrors.file}</p>}
                        </div>

                        <div className="mb-3">
                          <label className="block text-sm font-medium mb-2">Work Link (optional)</label>
                          <input
                            type="url"
                            value={portfolioForm.media_link}
                            onChange={(e) => {
                              setPortfolioForm({ ...portfolioForm, media_link: e.target.value });
                              const error = validateUrl(e.target.value);
                              setPortfolioValidationErrors(prev => ({ ...prev, media_link: error }));
                            }}
                            style={{ border: '2px solid #9ca3af', backgroundColor: '#ffffff' }}
                            className="w-full px-4 py-3 text-sm rounded-lg outline-none"
                            placeholder="https://example.com"
                          />
                          {portfolioValidationErrors.media_link && <p className="text-red-500 text-xs mt-1">{portfolioValidationErrors.media_link}</p>}
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-2">Work Description</label>
                          <textarea
                            rows={3}
                            value={portfolioForm.description}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.length <= 200) {
                                setPortfolioForm({ ...portfolioForm, description: value });
                                const descError = validatePortfolioDescription(value, 200);
                                setPortfolioValidationErrors(prev => ({ ...prev, description: descError }));
                              }
                            }}
                            maxLength={200}
                            style={{ border: '2px solid #9ca3af', backgroundColor: '#ffffff' }}
                            className="w-full px-4 py-3 text-sm rounded-lg outline-none"
                            placeholder="Describe your work..."
                          />
                          {portfolioValidationErrors.description && (
                            <p className="text-red-500 text-xs mt-1">{portfolioValidationErrors.description}</p>
                          )}
                          <p className="text-[10px] text-gray-400 mt-1 text-right">{portfolioForm.description.length}/200 characters</p>
                        </div>

                        <div className="flex gap-4 justify-center mt-6">
                          <button
                            type="submit"
                            disabled={
                              !!portfolioValidationErrors.title ||
                              (!portfolioForm.id && !!portfolioValidationErrors.file) ||
                              !!portfolioValidationErrors.description ||
                              isSavingPortfolio
                            }
                            className={`w-[122px] h-[39px] rounded-[100px] font-montserrat font-bold text-[12px] leading-[100%] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${(portfolioValidationErrors.title || (!portfolioForm.id && portfolioValidationErrors.file) || portfolioValidationErrors.description || isSavingPortfolio)
                              ? "opacity-50 cursor-not-allowed bg-gray-400 text-white"
                              : "bg-[#51218F] hover:bg-[#6D28D9] text-white"
                              }`}
                          >
                            {isSavingPortfolio ? (
                              <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                              </>
                            ) : (
                              "Save"
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveModal(null);
                              setPortfolioForm({ heading: "", description: "", media_link: "", file: null, id: null });
                              setFileName("No file chosen");
                              setPortfolioValidationErrors({ title: '', file: '', media_link: '', description: '' });
                            }}
                            className="w-[122px] h-[39px] rounded-[100px] font-montserrat font-bold text-[12px] leading-[100%] transition-all duration-200 cursor-pointer bg-[#5B2D8B] hover:bg-[#4A2575] border border-[#6A3EA1] text-white"
                          >
                            Cancel
                          </button>

                          {portfolioForm.id && (
                            <button
                              type="button"
                              onClick={handleDeletePortfolio}
                              className="w-[122px] h-[39px] rounded-[100px] font-montserrat font-bold text-[12px] leading-[100%] transition-all duration-200 cursor-pointer bg-red-600 hover:bg-red-700 text-white"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* PORTFOLIO VIEW ALL POPUP */}
            {showPortfolioPopup && (
              <>
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999]" onClick={() => setShowPortfolioPopup(false)}></div>

                <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4 py-4">
                  <div className="bg-white rounded-[32px] shadow-xl w-full max-w-4xl mx-4 overflow-hidden">
                    <div className="p-4 xs:p-6">
                      <div className="flex justify-between items-center mb-4 xs:mb-6 gap-2">
                        <h2 className="text-[16px] xs:text-2xl sm:text-[24px] font-semibold text-[#2A1E17] whitespace-nowrap">My Portfolio</h2>
                        <button
                          onClick={() => setShowPortfolioPopup(false)}
                          className="w-5 h-5 xs:w-8 xs:h-8 sm:w-9 sm:h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-xs xs:text-lg sm:text-xl transition flex-shrink-0"
                        >
                          ✕
                        </button>
                      </div>

                      <div
                        className="overflow-y-auto max-h-[70vh] pr-2"
                        style={{
                          scrollbarWidth: 'thin',
                          scrollbarColor: '#51218F #e5e7eb',
                          WebkitOverflowScrolling: 'touch'
                        }}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {portfolioItems.map((item) => (
                            <div
                              key={item.id}
                              className="group relative bg-white rounded-[16px] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                              onClick={() => openPortfolioLink(item)}
                            >
                              <div className="relative h-[140px] sm:h-[160px] overflow-hidden">
                                <img
                                  src={getPortfolioImage(item)}
                                  alt={item.heading}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  onError={(e) => { e.target.src = Portfolio1; }}
                                />
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowPortfolioPopup(false);
                                    openEditModal(item);
                                  }}
                                  className="absolute top-2 right-2 flex items-center justify-center cursor-pointer hover:scale-110 transition z-10"
                                >
                                  <div className="bg-[#51218F] rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center shadow-sm transition-transform hover:scale-110">
                                    <svg
                                      width="10"
                                      height="10"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="sm:w-3 sm:h-3"
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
                              </div>
                              <div className="p-3">
                                {item.heading && (
                                  <h3 className="text-[12px] sm:text-[14px] font-semibold text-[#2A1E17] mb-1 line-clamp-1">
                                    {item.heading}
                                  </h3>
                                )}
                                {item.description && (
                                  <p className="text-[10px] sm:text-[12px] text-gray-600 line-clamp-2">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* WORK EXPERIENCE SECTION */}
            <div className="mt-8 bg-white shadow-lg rounded-xl p-6 w-full xl:w-[804px] xl:max-w-[804px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base xs:text-lg sm:text-xl font-semibold">Work Experience</h3>
                <div className="flex items-center gap-2">
                  {workExperiences.length > initialItemsToShow && (
                    <button onClick={() => setShowAllWork(!showAllWork)} className="text-[#6A3EA1] text-sm hover:underline">
                      {showAllWork ? "Show Less" : "View All"}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setWorkForm({ company_name: "", role: "", description: "", location: "", start_year: "", end_year: "", is_current: false, id: null });
                      setWorkFormErrors({ company_name: "", role: "", location: "", description: "", start_year: "", end_year: "", date_range: "" });
                      setActiveModal("experience");
                    }}
                    className="px-3 xs:px-4 sm:px-6 py-1 xs:py-1.5 sm:py-2 rounded-full text-[#6A3EA1] text-[11px] xs:text-xs sm:text-sm hover:bg-[#6A3EA1]/10 transition whitespace-nowrap flex items-center gap-2"
                    style={{
                      border: '1px solid #51218F'
                    }}
                    disabled={isSavingWork}
                  >
                    {isSavingWork ? (
                      <>
                        <svg className="animate-spin h-3 w-3 text-[#6A3EA1]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding...
                      </>
                    ) : (
                      "Add Experience"
                    )}
                  </button>
                </div>
              </div>
              <div className="h-px bg-gray-200 my-4" />
              <div className="space-y-6">
                {displayedWork.map((exp, index) => (
                  <div key={exp.id || index} className="border-b border-gray-100 pb-4 last:border-0 group relative">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0"> {/* Add min-w-0 to allow flex child to shrink */}
                        <h4 className="font-semibold break-words">{exp.role} | {exp.company_name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{exp.start_year} – {exp.end_year || "Present"}</p>
                        {/* Fix: Add proper word wrapping and overflow handling */}
                        <p className="text-sm text-gray-600 mt-2 break-words overflow-wrap-anywhere whitespace-pre-wrap">
                          {exp.description}
                        </p>
                      </div>
                      <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex-shrink-0 ml-4">
                        <button
                          onClick={() => handleEditWorkExperience(exp)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <div className="bg-[#51218F] rounded-full w-6 h-6 lg:w-7 lg:h-7 flex items-center justify-center shadow-sm transition-transform hover:scale-110">
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="lg:w-[16px] lg:h-[16px]"
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
                        </button>
                        <button
                          onClick={() => handleDeleteWorkExperience(exp.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <svg
                            className="w-5 h-5 lg:w-6 lg:h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {workExperiences.length === 0 && <p className="text-center text-gray-500 py-4">No work experience added yet.</p>}
            </div>

            {/* ADD/EDIT WORK EXPERIENCE MODAL */}
            {activeModal === "experience" && (
              <>
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999]" onClick={() => setActiveModal(null)}></div>

                <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4 py-10">
                  <div className="bg-white rounded-[24px] shadow-xl w-full max-w-[820px] max-h-[calc(100vh-140px)] overflow-y-auto mx-6 pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <div className="p-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base xs:text-lg sm:text-xl font-semibold">{workForm.id ? 'Edit' : 'Add'} Work Experience</h3>
                        <button onClick={() => setActiveModal(null)} className="text-gray-500 hover:text-black text-base xs:text-lg sm:text-xl leading-none">✕</button>
                      </div>

                      <form onSubmit={handleAddWorkExperience}>
                        <div className="mb-3">
                          <label className="block text-[11px] xs:text-xs sm:text-sm font-medium mb-1.5 xs:mb-2">
                            Company Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={workForm.company_name}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.length <= 50) {
                                setWorkForm({ ...workForm, company_name: value });
                                setWorkFormErrors({ ...workFormErrors, company_name: validateCompanyName(value) });
                              }
                            }}
                            maxLength={50}
                            style={{ border: '2px solid #9ca3af', backgroundColor: '#ffffff' }}
                            className="w-full rounded-lg px-3 xs:px-4 py-2 xs:py-3 text-[11px] xs:text-xs sm:text-sm outline-none"
                            placeholder="Enter company name"
                            required
                          />
                          {workFormErrors.company_name && <p className="text-red-500 text-[10px] xs:text-xs mt-1">{workFormErrors.company_name}</p>}
                          <p className="text-[10px] text-gray-400 mt-1 text-right">{workForm.company_name.length}/50 characters</p>
                        </div>

                        <div className="mb-3">
                          <label className="block text-[11px] xs:text-xs sm:text-sm font-medium mb-1.5 xs:mb-2">
                            Role <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={workForm.role}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.length <= 50) {
                                setWorkForm({ ...workForm, role: value });
                                setWorkFormErrors({ ...workFormErrors, role: validateRole(value) });
                              }
                            }}
                            maxLength={50}
                            style={{ border: '2px solid #9ca3af', backgroundColor: '#ffffff' }}
                            className="w-full rounded-lg px-3 xs:px-4 py-2 xs:py-3 text-[11px] xs:text-xs sm:text-sm outline-none"
                            placeholder="Enter your role"
                            required
                          />
                          {workFormErrors.role && <p className="text-red-500 text-[10px] xs:text-xs mt-1">{workFormErrors.role}</p>}
                          <p className="text-[10px] text-gray-400 mt-1 text-right">{workForm.role.length}/50 characters</p>
                        </div>

                        <div className="mb-3">
                          <label className="block text-[11px] xs:text-xs sm:text-sm font-medium mb-1.5 xs:mb-2">Location</label>
                          <input
                            type="text"
                            value={workForm.location}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.length <= 50) {
                                setWorkForm({ ...workForm, location: value });
                                setWorkFormErrors({ ...workFormErrors, location: validateLocation(value) });
                              }
                            }}
                            maxLength={50}
                            style={{ border: '2px solid #9ca3af', backgroundColor: '#ffffff' }}
                            className="w-full rounded-lg px-3 xs:px-4 py-2 xs:py-3 text-[11px] xs:text-xs sm:text-sm outline-none"
                            placeholder="Enter location (optional)"
                          />
                          {workFormErrors.location && <p className="text-red-500 text-[10px] xs:text-xs mt-1">{workFormErrors.location}</p>}
                        </div>

                        <div className="mb-3">
                          <label className="block text-[11px] xs:text-xs sm:text-sm font-medium mb-1.5 xs:mb-2">
                            Start Year <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., 2019"
                            value={workForm.start_year}
                            onChange={(e) => {
                              setWorkForm({ ...workForm, start_year: e.target.value });
                              setWorkFormErrors({ ...workFormErrors, start_year: validateYear(e.target.value) });
                              const dateRangeError = validateDateRange(e.target.value, workForm.end_year, workForm.is_current);
                              setWorkFormErrors(prev => ({ ...prev, date_range: dateRangeError }));
                            }}
                            style={{ border: '2px solid #9ca3af', backgroundColor: '#ffffff' }}
                            className="w-full rounded-lg px-3 xs:px-4 py-2 xs:py-3 text-[11px] xs:text-xs sm:text-sm outline-none"
                            required
                          />
                          {workFormErrors.start_year && <p className="text-red-500 text-[10px] xs:text-xs mt-1">{workFormErrors.start_year}</p>}
                        </div>

                        <div className="mb-3">
                          <label className="block text-[11px] xs:text-xs sm:text-sm font-medium mb-1.5 xs:mb-2">End Year (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g., 2021"
                            value={workForm.end_year}
                            onChange={(e) => {
                              setWorkForm({ ...workForm, end_year: e.target.value });
                              if (!workForm.is_current) {
                                setWorkFormErrors({ ...workFormErrors, end_year: validateYear(e.target.value) });
                                const dateRangeError = validateDateRange(workForm.start_year, e.target.value, workForm.is_current);
                                setWorkFormErrors(prev => ({ ...prev, date_range: dateRangeError }));
                              }
                            }}
                            style={{ border: '2px solid #9ca3af', backgroundColor: '#ffffff' }}
                            className="w-full rounded-lg px-3 xs:px-4 py-2 xs:py-3 text-[11px] xs:text-xs sm:text-sm outline-none"
                            disabled={workForm.is_current}
                          />
                          {!workForm.is_current && workFormErrors.end_year && <p className="text-red-500 text-[10px] xs:text-xs mt-1">{workFormErrors.end_year}</p>}
                          {workFormErrors.date_range && <p className="text-red-500 text-[10px] xs:text-xs mt-1">{workFormErrors.date_range}</p>}
                        </div>

                        <div className="mb-3">
                          <label className="flex items-center gap-1.5 xs:gap-2">
                            <input
                              type="checkbox"
                              checked={workForm.is_current}
                              onChange={(e) => {
                                setWorkForm({ ...workForm, is_current: e.target.checked, end_year: e.target.checked ? "" : workForm.end_year });
                                if (e.target.checked) setWorkFormErrors({ ...workFormErrors, end_year: "", date_range: "" });
                              }}
                              className="rounded w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5"
                              style={{ accentColor: '#51218F' }}
                            />
                            <span className="text-[11px] xs:text-xs sm:text-sm text-gray-700">I currently work here</span>
                          </label>
                        </div>

                        <div className="mb-4">
                          <label className="block text-[11px] xs:text-xs sm:text-sm font-medium mb-1.5 xs:mb-2">Description</label>
                          <textarea
                            rows={3}
                            value={workForm.description}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.length <= 200) {
                                setWorkForm({ ...workForm, description: value });
                                setWorkFormErrors({ ...workFormErrors, description: validateTextDescription(value, 200) });
                              }
                            }}
                            maxLength={200}
                            style={{ border: '2px solid #9ca3af', backgroundColor: '#ffffff' }}
                            className="w-full rounded-lg px-3 xs:px-4 py-2 xs:py-3 text-[11px] xs:text-xs sm:text-sm outline-none"
                            placeholder="Describe your responsibilities and achievements..."
                          />
                          {workFormErrors.description && <p className="text-red-500 text-[10px] xs:text-xs mt-1">{workFormErrors.description}</p>}
                          <p className="text-[10px] text-gray-400 mt-1 text-right">{workForm.description.length}/200 characters</p>
                        </div>

                        <div className="flex gap-2 sm:gap-4 justify-center">
                          <button
                            type="submit"
                            disabled={
                              isSavingWork ||
                              !!workFormErrors.company_name ||
                              !!workFormErrors.role ||
                              !!workFormErrors.location ||
                              !!workFormErrors.description ||
                              !!workFormErrors.start_year ||
                              !!workFormErrors.end_year ||
                              !!workFormErrors.date_range
                            }
                            className="px-4 sm:px-8 py-2 sm:py-3 rounded-full font-bold text-white transition-all duration-300 text-sm sm:text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                              background: 'linear-gradient(135deg, #51218F 0%, #6A3EA1 100%)',
                              boxShadow: '0 2px 8px rgba(81, 33, 143, 0.3)',
                              border: 'none'
                            }}
                            onMouseEnter={(e) => {
                              if (!isSavingWork) {
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(81, 33, 143, 0.4)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = '0 2px 8px rgba(81, 33, 143, 0.3)';
                            }}
                          >
                            {isSavingWork ? (
                              <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                              </>
                            ) : (
                              "Save"
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveModal(null);
                              setPortfolioForm({ heading: "", description: "", media_link: "", file: null, id: null });
                              setFileName("No file chosen");
                              setPortfolioValidationErrors({ title: '', file: '', media_link: '', description: '' });
                            }}
                            className="px-4 sm:px-8 py-2 sm:py-3 rounded-full font-bold transition-all duration-300 text-sm sm:text-base"
                            style={{
                              background: '#5B2D8B',
                              color: 'white',
                              border: '1px solid #6A3EA1'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = '#4A2575';
                              e.target.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = '#5B2D8B';
                              e.target.style.transform = 'translateY(0)';
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* EDUCATION SECTION */}
            <div className="mt-8 bg-white shadow-lg rounded-xl p-6 w-full xl:w-[804px] xl:max-w-[804px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base xs:text-lg sm:text-xl font-semibold">Education</h3>
                <div className="flex items-center gap-2">
                  {educations.length > initialItemsToShow && (
                    <button onClick={() => setShowAllEducation(!showAllEducation)} className="text-[#6A3EA1] text-sm hover:underline">
                      {showAllEducation ? "Show Less" : "View All"}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEducationForm({ institution_name: "", degree: "", field_of_study: "", description: "", location: "", start_year: "", end_year: "", is_current: false, id: null });
                      setEducationFormErrors({ institution_name: "", degree: "", field_of_study: "", location: "", description: "", start_year: "", end_year: "", date_range: "" });
                      setActiveModal("education");
                    }}
                    className="px-3 xs:px-4 sm:px-6 py-1 xs:py-1.5 sm:py-2 rounded-full text-[#6A3EA1] text-[11px] xs:text-xs sm:text-sm hover:bg-[#6A3EA1]/10 transition whitespace-nowrap flex items-center gap-2"
                    style={{
                      border: '1px solid #51218F'
                    }}
                    disabled={isSavingEducation}
                  >
                    {isSavingEducation ? (
                      <>
                        <svg className="animate-spin h-3 w-3 text-[#6A3EA1]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding...
                      </>
                    ) : (
                      "Add Education"
                    )}
                  </button>
                </div>
              </div>
              <div className="h-px bg-gray-200 my-4" />
              <div className="space-y-6">
                {displayedEducation.map((edu, index) => (
                  <div key={edu.id || index} className="border-b border-gray-100 pb-4 last:border-0 group relative">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold">{edu.degree} | {edu.institution_name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{edu.start_year} – {edu.end_year || "Present"}</p>
                        <p className="text-sm text-gray-600 mt-2">{edu.field_of_study || edu.description}</p>
                      </div>
                      <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditEducation(edu)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <div className="bg-[#51218F] rounded-full w-6 h-6 lg:w-7 lg:h-7 flex items-center justify-center shadow-sm transition-transform hover:scale-110">
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="lg:w-[16px] lg:h-[16px]"
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
                        </button>
                        <button
                          onClick={() => handleDeleteEducation(edu.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <svg
                            className="w-5 h-5 lg:w-6 lg:h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {educations.length === 0 && <p className="text-center text-gray-500 py-4">No education added yet.</p>}
            </div>

            {/* ADD/EDIT EDUCATION MODAL */}
            {activeModal === "education" && (
              <>
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999]" onClick={() => setActiveModal(null)}></div>

                <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4 py-10">
                  <div className="bg-white rounded-[24px] shadow-xl w-full max-w-[820px] max-h-[calc(100vh-140px)] overflow-y-auto mx-6 pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <div className="p-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[15px] xs:text-lg sm:text-xl font-semibold">{educationForm.id ? 'Edit' : 'Add'} Education</h3>
                        <button onClick={() => setActiveModal(null)} className="text-gray-500 hover:text-black text-[15px] xs:text-lg sm:text-xl leading-none">✕</button>
                      </div>

                      <form onSubmit={handleAddEducation}>
                        <div className="mb-3">
                          <label className="block text-[11px] xs:text-xs sm:text-sm font-medium mb-1.5 xs:mb-2">
                            Institution Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={educationForm.institution_name}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.length <= 50) {
                                setEducationForm({ ...educationForm, institution_name: value });
                                setEducationFormErrors({ ...educationFormErrors, institution_name: validateInstitutionName(value) });
                              }
                            }}
                            maxLength={50}
                            style={{ border: '2px solid #9ca3af', backgroundColor: '#ffffff' }}
                            className="w-full rounded-lg px-3 xs:px-4 py-2 xs:py-3 text-[11px] xs:text-xs sm:text-sm outline-none"
                            placeholder="Enter institution name"
                            required
                          />
                          {educationFormErrors.institution_name && <p className="text-red-500 text-[10px] xs:text-xs mt-1">{educationFormErrors.institution_name}</p>}
                          <p className="text-[10px] text-gray-400 mt-1 text-right">{educationForm.institution_name.length}/50 characters</p>
                        </div>

                        <div className="mb-3">
                          <label className="block text-[11px] xs:text-xs sm:text-sm font-medium mb-1.5 xs:mb-2">
                            Degree <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., Bachelor of Science"
                            value={educationForm.degree}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.length <= 50) {
                                setEducationForm({ ...educationForm, degree: value });
                                setEducationFormErrors({ ...educationFormErrors, degree: validateDegree(value) });
                              }
                            }}
                            maxLength={50}
                            style={{ border: '2px solid #9ca3af', backgroundColor: '#ffffff' }}
                            className="w-full rounded-lg px-3 xs:px-4 py-2 xs:py-3 text-[11px] xs:text-xs sm:text-sm outline-none"
                            required
                          />
                          {educationFormErrors.degree && <p className="text-red-500 text-[10px] xs:text-xs mt-1">{educationFormErrors.degree}</p>}
                          <p className="text-[10px] text-gray-400 mt-1 text-right">{educationForm.degree.length}/50 characters</p>
                        </div>

                        <div className="mb-3">
                          <label className="block text-[11px] xs:text-xs sm:text-sm font-medium mb-1.5 xs:mb-2">Field of Study</label>
                          <input
                            type="text"
                            value={educationForm.field_of_study}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.length <= 50) {
                                setEducationForm({ ...educationForm, field_of_study: value });
                                setEducationFormErrors({ ...educationFormErrors, field_of_study: validateFieldOfStudy(value) });
                              }
                            }}
                            maxLength={50}
                            style={{ border: '2px solid #9ca3af', backgroundColor: '#ffffff' }}
                            className="w-full rounded-lg px-3 xs:px-4 py-2 xs:py-3 text-[11px] xs:text-xs sm:text-sm outline-none"
                            placeholder="e.g., Computer Science"
                          />
                          {educationFormErrors.field_of_study && <p className="text-red-500 text-[10px] xs:text-xs mt-1">{educationFormErrors.field_of_study}</p>}
                        </div>

                        <div className="mb-3">
                          <label className="block text-[11px] xs:text-xs sm:text-sm font-medium mb-1.5 xs:mb-2">Location</label>
                          <input
                            type="text"
                            value={educationForm.location}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.length <= 50) {
                                setEducationForm({ ...educationForm, location: value });
                                setEducationFormErrors({ ...educationFormErrors, location: validateLocation(value) });
                              }
                            }}
                            maxLength={50}
                            style={{ border: '2px solid #9ca3af', backgroundColor: '#ffffff' }}
                            className="w-full rounded-lg px-3 xs:px-4 py-2 xs:py-3 text-[11px] xs:text-xs sm:text-sm outline-none"
                            placeholder="Enter location (optional)"
                          />
                          {educationFormErrors.location && <p className="text-red-500 text-[10px] xs:text-xs mt-1">{educationFormErrors.location}</p>}
                        </div>

                        <div className="mb-3">
                          <label className="block text-[11px] xs:text-xs sm:text-sm font-medium mb-1.5 xs:mb-2">
                            Start Year <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., 2019"
                            value={educationForm.start_year}
                            onChange={(e) => {
                              setEducationForm({ ...educationForm, start_year: e.target.value });
                              setEducationFormErrors({ ...educationFormErrors, start_year: validateYear(e.target.value) });
                              const dateRangeError = validateDateRange(e.target.value, educationForm.end_year, educationForm.is_current);
                              setEducationFormErrors(prev => ({ ...prev, date_range: dateRangeError }));
                            }}
                            style={{ border: '2px solid #9ca3af', backgroundColor: '#ffffff' }}
                            className="w-full rounded-lg px-3 xs:px-4 py-2 xs:py-3 text-[11px] xs:text-xs sm:text-sm outline-none"
                            required
                          />
                          {educationFormErrors.start_year && <p className="text-red-500 text-[10px] xs:text-xs mt-1">{educationFormErrors.start_year}</p>}
                        </div>

                        <div className="mb-3">
                          <label className="block text-[11px] xs:text-xs sm:text-sm font-medium mb-1.5 xs:mb-2">End Year (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g., 2021"
                            value={educationForm.end_year}
                            onChange={(e) => {
                              setEducationForm({ ...educationForm, end_year: e.target.value });
                              if (!educationForm.is_current) {
                                setEducationFormErrors({ ...educationFormErrors, end_year: validateYear(e.target.value) });
                                const dateRangeError = validateDateRange(educationForm.start_year, e.target.value, educationForm.is_current);
                                setEducationFormErrors(prev => ({ ...prev, date_range: dateRangeError }));
                              }
                            }}
                            style={{ border: '2px solid #9ca3af', backgroundColor: '#ffffff' }}
                            className="w-full rounded-lg px-3 xs:px-4 py-2 xs:py-3 text-[11px] xs:text-xs sm:text-sm outline-none"
                            disabled={educationForm.is_current}
                          />
                          {!educationForm.is_current && educationFormErrors.end_year && <p className="text-red-500 text-[10px] xs:text-xs mt-1">{educationFormErrors.end_year}</p>}
                          {educationFormErrors.date_range && <p className="text-red-500 text-[10px] xs:text-xs mt-1">{educationFormErrors.date_range}</p>}
                        </div>

                        <div className="mb-3">
                          <label className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={educationForm.is_current}
                              onChange={(e) => {
                                setEducationForm({ ...educationForm, is_current: e.target.checked, end_year: e.target.checked ? "" : educationForm.end_year });
                                if (e.target.checked) setEducationFormErrors({ ...educationFormErrors, end_year: "", date_range: "" });
                              }}
                              className="rounded w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4"
                              style={{ accentColor: '#51218F' }}
                            />
                            <span className="text-[9px] xs:text-[10px] sm:text-sm text-gray-700">
                              <span className="hidden xs:inline">I am currently studying here</span>
                              <span className="xs:hidden">Currently studying</span>
                            </span>
                          </label>
                        </div>

                        <div className="mb-4">
                          <label className="block text-[11px] xs:text-xs sm:text-sm font-medium mb-1.5 xs:mb-2">Description</label>
                          <div className="mb-4">
                            <textarea
                              rows={3}
                              value={educationForm.description}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value.length <= 200) {
                                  setEducationForm({ ...educationForm, description: value });
                                  setEducationFormErrors({ ...educationFormErrors, description: validateTextDescription(value, 200) });
                                }
                              }}
                              maxLength={200}
                              style={{ border: '2px solid #9ca3af', backgroundColor: '#ffffff' }}
                              className="w-full rounded-lg px-3 xs:px-4 py-2 xs:py-3 text-[11px] xs:text-xs sm:text-sm outline-none"
                              placeholder="Describe your education..."
                            />
                            {educationFormErrors.description && (
                              <p className="text-red-500 text-[10px] xs:text-xs mt-1">
                                {educationFormErrors.description}
                              </p>
                            )}
                            <p className="text-[10px] text-gray-400 mt-1 text-right">
                              {educationForm.description.length}/200 characters
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 sm:gap-4 justify-center">
                          <button
                            type="submit"
                            disabled={
                              isSavingEducation ||
                              !!educationFormErrors.institution_name ||
                              !!educationFormErrors.degree ||
                              !!educationFormErrors.field_of_study ||
                              !!educationFormErrors.location ||
                              !!educationFormErrors.description ||
                              !!educationFormErrors.start_year ||
                              !!educationFormErrors.end_year ||
                              !!educationFormErrors.date_range
                            }
                            className="px-3 xs:px-4 sm:px-8 py-1.5 xs:py-2 sm:py-3 rounded-full font-bold text-white transition-all duration-300 text-[11px] xs:text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                              background: 'linear-gradient(135deg, #51218F 0%, #6A3EA1 100%)',
                              boxShadow: '0 2px 8px rgba(81, 33, 143, 0.3)',
                              border: 'none'
                            }}
                            onMouseEnter={(e) => {
                              if (!isSavingEducation) {
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(81, 33, 143, 0.4)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = '0 2px 8px rgba(81, 33, 143, 0.3)';
                            }}
                          >
                            {isSavingEducation ? (
                              <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                              </>
                            ) : (
                              "Save"
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveModal(null)}
                            className="px-3 xs:px-4 sm:px-8 py-1.5 xs:py-2 sm:py-3 rounded-full font-bold transition-all duration-300 text-[11px] xs:text-xs sm:text-sm"
                            style={{
                              background: 'linear-gradient(135deg, #51218F 0%, #6A3EA1 100%)',
                              color: 'white',
                              border: 'none',
                              boxShadow: '0 2px 8px rgba(81, 33, 143, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'translateY(-1px)';
                              e.target.style.boxShadow = '0 4px 12px rgba(81, 33, 143, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = '0 2px 8px rgba(81, 33, 143, 0.3)';
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* REVIEWS SECTION */}
            <div className="mt-8 mb-4 bg-white shadow-lg rounded-xl p-6 w-full xl:w-[804px] xl:max-w-[804px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base xs:text-lg sm:text-xl font-semibold">Reviews</h3>
              </div>
              <div className="h-px bg-gray-200 my-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedReviews.map((review, index) => {
                  const getReviewerProfilePic = () => {
                    if (review.reviewer_profile_picture) {
                      if (review.reviewer_profile_picture.startsWith("http")) return review.reviewer_profile_picture;
                      if (review.reviewer_profile_picture.includes("/media/")) return `${API_BASE_URL}${review.reviewer_profile_picture}`;
                      return `${API_BASE_URL}/media${review.reviewer_profile_picture}`;
                    }
                    return index % 2 === 0 ? ReviewUser1 : ReviewUser2;
                  };

                  const getReviewerName = () => {
                    if (review.reviewer_name) return review.reviewer_name;
                    if (review.reviewer?.full_name) return review.reviewer.full_name;
                    if (review.reviewer?.name) return review.reviewer.name;
                    return `User ${index + 1}`;
                  };

                  return (
                    <div key={index} className="bg-[#F3F3F3] border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <img
                          src={getReviewerProfilePic()}
                          className="w-10 h-10 rounded-full object-cover"
                          alt={getReviewerName()}
                          onError={(e) => { e.target.src = index % 2 === 0 ? ReviewUser1 : ReviewUser2; }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">{getReviewerName()}</span>
                            <span className="text-xs text-gray-500">{review.date || "Recent"}</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <span className="text-[#5B2D8B] mr-1">{review.rating?.toFixed(1) || "0.0"}</span>
                            <div className="flex">
                              {Array(5).fill(0).map((_, star) => (
                                <svg key={star} className={`w-4 h-4 ${star + 1 <= (review.rating || 0) ? "text-[#5B2D8B]" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-xs text-gray-500 ml-1">/5</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">{review.comment || review.review_text || "No comment provided"}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {reviews.length === 0 && <p className="text-center text-gray-500 py-4">No reviews yet.</p>}
              {reviews.length > 0 && (
                <div className="flex justify-center mt-6">
                  <button onClick={() => { setReviewsCurrentPage(1); setShowReviewsPopup(true); }} className="text-[#6A3EA1] text-sm font-semibold hover:underline transition">
                    View All
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer - full width, outside max-w container */}
        <div className="w-full mt-8">
          <Footer />
        </div>
      </div>

      {/* ========== VERIFICATION POPUPS ========== */}

      {/* Phone Input Popup */}
      {showPhonePopup && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99998]" onClick={() => { setShowPhonePopup(false); setPhoneNumber(""); }} />
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <div className="relative w-full max-w-[500px] sm:max-w-[600px] md:max-w-[740px] min-h-[400px] rounded-[32px] border-[1.5px] border-white bg-white/70 backdrop-blur-md shadow-[0_0_10px_0_#FFFFFF] flex flex-col items-center justify-center gap-4 md:gap-6 p-4 sm:p-6 md:p-8 my-8 mx-2 sm:mx-4">
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 cursor-pointer select-none z-10" onClick={() => { setShowPhonePopup(false); setPhoneNumber(""); }}>
                <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full" style={{ background: "linear-gradient(180deg, rgba(3,3,3,0.9) 0%, rgba(81,33,143,0.9) 100%)", backdropFilter: "blur(12px)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                </div>
                <span className="text-[#030303] poppins-font text-sm md:text-lg font-medium">Back</span>
              </div>
              <div className="w-full max-w-md text-center mt-8 md:mt-10">
                <h1 className="text-xl sm:text-2xl md:text-[32px] font-semibold text-[#000000] poppins-font">Verify Phone Number</h1>
                <p className="text-[#3D1768] text-xs sm:text-sm md:text-base poppins-font mb-6 md:mb-10 px-3 sm:px-4">Enter your phone number to receive a verification code</p>

                {currentUser?.phone_number && (
                  <div className="mb-4 p-2 sm:p-3 bg-purple-50 rounded-lg border border-purple-200 mx-2 sm:mx-0">
                    <div className="flex items-center gap-2 justify-center flex-wrap">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#51218F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <p className="text-xs sm:text-sm font-medium text-[#51218F]">Registered number: <span className="font-bold">{currentUser.phone_number}</span></p>
                    </div>
                    <p className="text-[10px] sm:text-xs text-[#51218F]/70 mt-1">Please enter the same number for verification</p>
                  </div>
                )}

                <div className="mb-6 md:mb-8 px-2 sm:px-0">
                  <label className="block text-xs sm:text-sm font-medium text-[#030303] mb-2 md:mb-3 poppins-font text-left">Phone Number</label>

                  <div className="flex items-stretch mb-3 md:mb-4">
                    <div className="flex-shrink-0">
                      <div className="h-[42px] sm:h-[48px] md:h-[52px] flex items-center px-3 sm:px-4 border border-r-0 border-gray-300 rounded-l-xl bg-gray-50/70 backdrop-blur-sm">
                        <span className="text-gray-700 font-medium poppins-font text-xs sm:text-sm">🇮🇳 +91</span>
                      </div>
                    </div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => { const numbersOnly = e.target.value.replace(/\D/g, "").slice(0, 10); setPhoneNumber(numbersOnly); }}
                      placeholder={currentUser?.phone_number ? currentUser.phone_number.replace(/\D/g, "").slice(-10) : "12345 67890"}
                      maxLength={10}
                      className="flex-1 h-[42px] sm:h-[48px] md:h-[52px] px-3 sm:px-4 text-sm sm:text-base border border-gray-300 border-l-0 rounded-r-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-[#3D1768] focus:border-[#3D1768] outline-none transition-all text-[#030303] poppins-font"
                    />
                  </div>

                  {currentUser?.phone_number && (
                    <button onClick={() => { const cleanPhone = currentUser.phone_number.replace(/\D/g, "").slice(-10); setPhoneNumber(cleanPhone); toast.success("Phone number auto-filled"); }} className="text-[10px] sm:text-xs text-[#51218F] hover:text-[#3D1768] font-medium mb-3 underline">
                      Use registered number
                    </button>
                  )}

                  <div className="flex justify-between items-center mt-2 md:mt-3">
                    <p className="text-[10px] sm:text-sm text-[#030303]/70 poppins-font">Enter 10-digit mobile number</p>
                    <p className={`text-[10px] sm:text-sm font-medium poppins-font ${phoneNumber.length === 10 ? "text-[#3D1768]" : "text-[#030303]/70"}`}>{phoneNumber.length}/10</p>
                  </div>
                </div>

                <button
                  onClick={handlePhoneSubmit}
                  disabled={phoneNumber.length !== 10 || isVerifying}
                  type="button"
                  className="group relative overflow-hidden w-full max-w-[400px] sm:max-w-[500px] h-10 sm:h-12 md:h-[48px] rounded-[30px] bg-gradient-to-r from-[#3D1768] to-[#030303] px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-white text-sm sm:text-base md:text-lg font-medium poppins-font border border-white/10 shadow-lg hover:border-white/30 hover:shadow-2xl hover:shadow-purple-900/50 active:scale-95 transition-all duration-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
                >
                  <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 transition-transform duration-1000 ease-out group-hover:translate-x-[100%]" />
                  <span className="relative z-10 group-hover:scale-105 transition-transform duration-300 flex items-center gap-2">
                    {isVerifying ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-xs sm:text-sm">Sending...</span>
                      </>
                    ) : "Send OTP"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Email Verification Popup */}
      {showEmailPopup && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99998]" onClick={() => { if (!isVerifying) { setShowEmailPopup(false); setEmail(""); } }} />
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <div className="relative w-full max-w-[740px] min-h-[432px] rounded-[32px] border-[1.5px] border-white bg-white/70 backdrop-blur-md shadow-[0_0_10px_0_#FFFFFF] flex flex-col items-center justify-center gap-4 md:gap-6 p-4 sm:p-6 md:p-8 my-8 mx-2 sm:mx-4">
              {isVerifying && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-[32px]">
                  <div className="flex flex-col items-center gap-3 md:gap-4 p-4">
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border-3 sm:border-4 border-gray-200 rounded-full"></div>
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border-3 sm:border-4 border-[#51218F] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-[#51218F] font-semibold text-sm sm:text-base md:text-lg">Sending OTP...</p>
                      <p className="text-gray-500 text-[10px] sm:text-xs md:text-sm mt-1 md:mt-2">Please wait while we send the verification code</p>
                    </div>
                  </div>
                </div>
              )}
              <div className={`absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 cursor-pointer select-none z-10 ${isVerifying ? "opacity-50 pointer-events-none" : ""}`} onClick={() => { if (!isVerifying) { setShowEmailPopup(false); setEmail(""); } }}>
                <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full" style={{ background: "linear-gradient(180deg, rgba(3,3,3,0.9) 0%, rgba(81,33,143,0.9) 100%)", backdropFilter: "blur(12px)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                </div>
                <span className="text-[#030303] poppins-font text-sm md:text-lg font-medium">Back</span>
              </div>
              <div className="w-full max-w-lg text-center mt-8 md:mt-10">
                <h1 className="text-xl sm:text-2xl md:text-[32px] font-semibold text-[#000000] poppins-font">Verify Email Address</h1>
                <p className="text-[#3D1768] text-xs sm:text-sm md:text-base poppins-font mb-6 md:mb-10 px-3 sm:px-4">Enter your registered email address to receive a verification code</p>
                <div className="mb-4 p-2 sm:p-3 bg-purple-50 rounded-lg border border-purple-200 mx-2 sm:mx-0">
                  <div className="flex items-center gap-2 justify-center flex-wrap">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#51218F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs sm:text-sm font-medium text-[#51218F]">Registered email: <span className="font-bold">{profileData?.email || userData?.email || "Not set"}</span></p>
                  </div>
                  <p className="text-[10px] sm:text-xs text-[#51218F]/70 mt-1">You must use this email for verification</p>
                </div>
                <div className="mb-6 md:mb-8 px-2 sm:px-0">
                  <label className="block text-xs sm:text-sm font-medium text-[#030303] mb-2 md:mb-3 poppins-font text-left">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                    placeholder={profileData?.email || userData?.email || "Enter your Gmail address"}
                    disabled={isVerifying}
                    className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border ${isValidGmail(email) ? "border-gray-300" : "border-red-300"} rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-[#3D1768] focus:border-[#3D1768] outline-none transition-all text-[#030303] poppins-font placeholder:text-[#030303]/50 ${isVerifying ? "opacity-50 cursor-not-allowed" : ""}`}
                  />
                  {rateLimitError && (
                    <div className="mt-3 p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-[10px] sm:text-xs text-yellow-700">{rateLimitError}</p>
                      {resendTime > 0 && <p className="text-[10px] sm:text-xs text-yellow-700 mt-1">Please wait {resendTime} seconds before trying again</p>}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleEmailSubmit}
                  disabled={!isValidGmail(email) || isVerifying || (profileData?.email && email.toLowerCase() !== profileData.email.toLowerCase())}
                  type="button"
                  className="group relative overflow-hidden w-full max-w-[554px] h-10 sm:h-12 md:h-[48px] rounded-[30px] bg-gradient-to-r from-[#3D1768] to-[#030303] px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-white text-sm sm:text-base md:text-lg font-medium poppins-font border border-white/10 shadow-lg hover:border-white/30 hover:shadow-2xl hover:shadow-purple-900/50 active:scale-95 transition-all duration-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 transition-transform duration-1000 ease-out group-hover:translate-x-[100%]" />
                  <span className="relative z-10 group-hover:scale-105 transition-transform duration-300 flex items-center gap-2">
                    {isVerifying ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-xs sm:text-sm">Sending...</span>
                      </>
                    ) : "Send OTP"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* OTP Verification Popup */}
      {showOTPPopup && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99998]" onClick={() => { setShowOTPPopup(false); setOtp(["", "", "", "", "", ""]); setResendTime(45); if (currentVerificationType === "phone") { setShowPhonePopup(true); } else { setShowEmailPopup(true); } }} />
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <div className="relative w-full max-w-[740px] min-h-[432px] rounded-[32px] border-[1.5px] border-white bg-white/70 backdrop-blur-md shadow-[0_0_10px_0_#FFFFFF] flex flex-col items-center justify-center gap-4 md:gap-6 p-4 sm:p-6 md:p-8 my-8 mx-2 sm:mx-4">
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 cursor-pointer select-none z-10" onClick={() => { setShowOTPPopup(false); setOtp(["", "", "", "", "", ""]); setResendTime(45); if (currentVerificationType === "phone") { setShowPhonePopup(true); } else { setShowEmailPopup(true); } }}>
                <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full" style={{ background: "linear-gradient(180deg, rgba(3,3,3,0.9) 0%, rgba(81,33,143,0.9) 100%)", backdropFilter: "blur(12px)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                </div>
                <span className="text-[#030303] poppins-font text-sm md:text-lg font-medium">Back</span>
              </div>
              <div className="w-full max-w-lg text-center mt-8 md:mt-10">
                <h1 className="text-xl sm:text-2xl md:text-[32px] font-semibold text-[#000000] poppins-font">Enter OTP</h1>
                <p className="text-[#3D1768] text-xs sm:text-sm md:text-base poppins-font mb-6 md:mb-10 px-3 sm:px-4">
                  We've sent a 6-digit OTP to your <span className="font-semibold text-[#51218F]">{currentVerificationType === "phone" ? "Phone Number" : "Email Address"}</span>. Please enter it below to continue.
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
                          if (e.key === "Backspace" && !otp[i] && i > 0) { document.getElementById(`otp-${i - 1}`)?.focus(); }
                          else if (e.key !== "Backspace" && /^[0-9]$/.test(e.key) && otp[i] && i < 5) { setTimeout(() => { document.getElementById(`otp-${i + 1}`)?.focus(); }, 10); }
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
                  className="group relative overflow-hidden w-full max-w-[554px] h-10 sm:h-12 md:h-[48px] rounded-[30px] bg-gradient-to-r from-[#3D1768] to-[#030303] px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-white text-sm sm:text-base md:text-lg font-medium poppins-font border border-white/10 shadow-lg hover:border-white/30 hover:shadow-2xl hover:shadow-purple-900/50 active:scale-95 transition-all duration-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 transition-transform duration-1000 ease-out group-hover:translate-x-[100%]" />
                  <span className="relative z-10 group-hover:scale-105 transition-transform duration-300 flex items-center gap-2">
                    {isVerifying ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-xs sm:text-sm">Verifying...</span>
                      </>
                    ) : "Verify OTP"}
                  </span>
                </button>
                <div className="mt-6 md:mt-8 text-center">
                  <p className="text-[#030303]/90 text-xs sm:text-sm md:text-base poppins-font mb-1">Didn't receive the code?</p>
                  {resendTime > 0 ? (
                    <p className="text-[#030303]/90 text-xs sm:text-sm md:text-base poppins-font">
                      Resend in <span className="font-bold text-red-500 font-mono">{String(Math.floor(resendTime / 60)).padStart(2, "0")}:{String(resendTime % 60).padStart(2, "0")}</span>
                    </p>
                  ) : (
                    <button
                      onClick={handleResendOTP}
                      disabled={isVerifying || isResending}
                      className="text-[#C22CA2] hover:text-[#3D1768] font-semibold text-xs sm:text-sm md:text-base poppins-font transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2 mx-auto px-3 sm:px-4 py-1 sm:py-2 rounded-full group"
                    >
                      {isResending ? (
                        <>
                          <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        "Resend OTP"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99998]" onClick={() => setShowSuccessPopup(false)} />
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <div className="relative w-full max-w-[652px] min-h-[300px] md:min-h-[398px] rounded-[32px] border-[1.5px] border-white bg-white/70 shadow-[0_0_10px_0_#FFFFFF] flex flex-col items-center justify-center gap-4 md:gap-6 p-5 md:p-8 my-8 mx-2 sm:mx-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-[122px] md:h-[122px] rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-16 md:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="w-[90%] max-w-[522px] text-center text-base sm:text-lg md:text-[24px] leading-[120%] sm:leading-[100%] font-normal poppins-font text-[#3D1768] px-2">
                Your {currentVerificationType === 'phone' ? 'Phone Number' : 'Email Address'} has been verified successfully!
              </p>
              <div className="flex items-center mt-2 md:mt-4 gap-2 cursor-pointer" onClick={() => setShowSuccessPopup(false)}>
                <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full border border-white/20 bg-gradient-to-r from-[#3D1768] to-[#030303]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 md:w-4 md:h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                </div>
                <span className="text-[#030303] poppins-font font-normal text-sm md:text-[18px] leading-[100%]">Continue</span>
              </div>
              <p className="text-[10px] sm:text-xs md:text-sm text-[#3D1768]/80 poppins-font mt-1 md:mt-2">Closing automatically...</p>
            </div>
          </div>
        </>
      )}

      {/* Reviews Popup Modal - 5 per page */}
      {showReviewsPopup && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999]" onClick={() => setShowReviewsPopup(false)} />
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[700px] flex flex-col" style={{ maxHeight: '90vh' }}>
              {/* Sticky header */}
              <div className="flex-shrink-0 bg-white rounded-t-2xl border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">All Reviews</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</p>
                </div>
                <button onClick={() => setShowReviewsPopup(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Scrollable reviews list - hidden scrollbar */}
              <div className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-6 py-4">
                <div className="space-y-4">
                  {paginatedReviews.map((review, index) => {
                    const globalIndex = (reviewsCurrentPage - 1) * reviewsItemsPerPage + index;
                    const getReviewerProfilePic = () => {
                      if (review.reviewer_profile_picture) {
                        if (review.reviewer_profile_picture.startsWith("http")) return review.reviewer_profile_picture;
                        if (review.reviewer_profile_picture.includes("/media/")) return `${API_BASE_URL}${review.reviewer_profile_picture}`;
                        return `${API_BASE_URL}/media${review.reviewer_profile_picture}`;
                      }
                      return globalIndex % 2 === 0 ? ReviewUser1 : ReviewUser2;
                    };
                    const getReviewerName = () => {
                      if (review.reviewer_name) return review.reviewer_name;
                      if (review.reviewer?.full_name) return review.reviewer.full_name;
                      if (review.reviewer?.name) return review.reviewer.name;
                      return `User ${globalIndex + 1}`;
                    };
                    return (
                      <div key={globalIndex} className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-start gap-3">
                          <img
                            src={getReviewerProfilePic()}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-100 flex-shrink-0"
                            alt={getReviewerName()}
                            onError={(e) => { e.target.src = globalIndex % 2 === 0 ? ReviewUser1 : ReviewUser2; }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <span className="font-semibold text-gray-900 truncate">{getReviewerName()}</span>
                              <span className="text-xs text-gray-400 flex-shrink-0">{review.date || "Recent"}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <div className="flex items-center">
                                <span className="text-sm font-semibold text-purple-700 mr-1">{review.rating?.toFixed(1) || "0.0"}</span>
                                <div className="flex">
                                  {[...Array(5)].map((_, star) => (
                                    <svg key={star} className={`w-3.5 h-3.5 ${star + 1 <= (review.rating || 0) ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                              </div>
                              <span className="text-xs text-gray-400">·</span>
                              <span className="text-xs text-gray-500">{review.rating === 5 ? "Excellent" : review.rating >= 4 ? "Very Good" : review.rating >= 3 ? "Good" : "Average"}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2.5 leading-relaxed">{review.comment || review.review_text || "No comment provided"}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {reviews.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">No reviews yet</p>
                  </div>
                )}
              </div>

              {/* Sticky pagination footer */}
              {reviewsTotalPages > 1 && (
                <div className="flex-shrink-0 bg-white rounded-b-2xl border-t border-gray-100 px-6 py-4 flex justify-center items-center gap-3">
                  <button
                    onClick={() => handleReviewsPageChange(reviewsCurrentPage - 1)}
                    disabled={reviewsCurrentPage === 1}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Prev
                  </button>
                  <div className="flex items-center gap-1">
                    {[...Array(reviewsTotalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      if (reviewsTotalPages > 5) {
                        if (
                          pageNum === 1 ||
                          pageNum === reviewsTotalPages ||
                          (pageNum >= reviewsCurrentPage - 1 && pageNum <= reviewsCurrentPage + 1)
                        ) {
                          return (
                            <button
                              key={i}
                              onClick={() => handleReviewsPageChange(pageNum)}
                              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${reviewsCurrentPage === pageNum ? "bg-[#51218F] text-white shadow-md" : "hover:bg-gray-100 text-gray-600"}`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (
                          pageNum === reviewsCurrentPage - 2 ||
                          pageNum === reviewsCurrentPage + 2
                        ) {
                          return <span key={i} className="text-gray-400 text-sm">…</span>;
                        }
                        return null;
                      }
                      return (
                        <button
                          key={i}
                          onClick={() => handleReviewsPageChange(pageNum)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${reviewsCurrentPage === pageNum ? "bg-[#51218F] text-white shadow-md" : "hover:bg-gray-100 text-gray-600"}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => handleReviewsPageChange(reviewsCurrentPage + 1)}
                    disabled={reviewsCurrentPage === reviewsTotalPages}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1"
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}