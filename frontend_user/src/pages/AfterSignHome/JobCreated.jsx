import Header from "../../component/Header";
import Footer from "../../component/Footer";
import HomeBg from "../../assets/AfterSign/HomeBg.png";
import Dp1 from "../../assets/AfterSign/Dp1.jpg";
import Dp2 from "../../assets/AfterSign/Dp2.jpg";
import Dp3 from "../../assets/AfterSign/Dp3.jpg";
import Dp4 from "../../assets/AfterSign/Dp4.jpg";
import HomeSub from "../../assets/AfterSign/HomeSub.png";
import Folder from "../../assets/AfterSign/Folder.png";
import Skill3 from "../../assets/Landing/Skill3.png";
import Cloud from "../../assets/AfterSign/Cloud.png";
import Cancel from "../../assets/AfterSign/Cancel.png";
import flag from "../../assets/MyWork/flag.png";
import Success from "../../assets/Auth/Succes.png";
import { useNavigate } from "react-router-dom";
import SavedDraft from "./SavedDraft";
import { useEffect, useState, useRef } from "react";
import api from "../../utils/axiosConfig";
import toast from "../../component/Toast";
import ReactCountryFlag from "react-country-flag";

const JobCreated = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("discover");
  const [showAllJobsPopup, setShowAllJobsPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedDescJobId, setExpandedDescJobId] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [userData, setUserData] = useState(null);

  // Pagination state for popup
  const [popupCurrentPage, setPopupCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Pagination for main content (View Jobs)
  const [viewJobsCurrentPage, setViewJobsCurrentPage] = useState(1);
  const itemsPerPageMain = 5;

  // Pagination for Saved Draft
  const [savedDraftCurrentPage, setSavedDraftCurrentPage] = useState(1);
  const [savedDraftTotalPages, setSavedDraftTotalPages] = useState(1);
  const [savedDraftJobs, setSavedDraftJobs] = useState([]);

  // ========== REFS FOR ANIMATIONS ==========
  const mobileVerificationRef = useRef(null);
  const desktopVerificationRef = useRef(null);

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
  const [currentUser, setCurrentUser] = useState(null);
  const [showEmailSetupPopup, setShowEmailSetupPopup] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [loadingContracts, setLoadingContracts] = useState(true);
  
  // NEW: Store OTP tokens for stateless verification
  const [otpToken, setOtpToken] = useState("");
  const [cooldownToken, setCooldownToken] = useState("");

  const [profileCompletion, setProfileCompletion] = useState(0);
  const [loadingCompletion, setLoadingCompletion] = useState(false);

  // ========== DELETE CONFIRMATION POPUP STATE ==========
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [deleteDetails, setDeleteDetails] = useState({
    jobTitle: "",
    activeContracts: [],
    proposalsCount: 0,
    invitationsCount: 0,
    hasMilestones: false,
  });
  const [loadingDeleteDetails, setLoadingDeleteDetails] = useState(false);

  const avatars = [Dp1, Dp2, Dp3, Dp4];
  const [contracts, setContracts] = useState([]);
  const [contractStats, setContractStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    in_review: 0,
    awaiting: 0,
  });

  // Reset pagination when popup opens/closes
  useEffect(() => {
    if (showAllJobsPopup) {
      setPopupCurrentPage(1);
    }
  }, [showAllJobsPopup]);

  // Reset main content pagination when tab changes
  useEffect(() => {
    setViewJobsCurrentPage(1);
    setSavedDraftCurrentPage(1);
  }, [activeTab]);

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

  // Timer for OTP
  useEffect(() => {
    if (!showOTPPopup) return;

    const timer = setInterval(() => {
      setResendTime((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      if (!showOTPPopup) {
        setResendTime(45);
      }
    };
  }, [showOTPPopup]);

  // Auto-clear rate limit error after cooldown
  useEffect(() => {
    if (rateLimitError && resendTime === 0) {
      const timer = setTimeout(() => {
        setRateLimitError("");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [rateLimitError, resendTime]);

  // Timer for OTP resend (additional)
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

  /* ================= FETCH USER DATA ================= */
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await api.get("/auth/me");
        setCurrentUser(res.data);

        // Set verification status from backend if available
        if (res.data.phone_verified !== undefined) {
          setPhoneVerified(res.data.phone_verified);
        }
        if (res.data.email_verified !== undefined) {
          setEmailVerified(res.data.email_verified);
        }

        let enrichedUserData = { ...res.data };

        // If user is a creator, fetch creator profile
        if (res.data.role === "creator") {
          try {
            const creatorRes = await api.get(`/creator/get/${res.data.id}`);
            if (creatorRes.data) {
              enrichedUserData = {
                ...enrichedUserData,
                ...creatorRes.data,
                bio: creatorRes.data.bio || enrichedUserData.bio,
                skills: creatorRes.data.skills || enrichedUserData.skills,
                skill_category: creatorRes.data.skill_category,
                location: creatorRes.data.location || enrichedUserData.location,
                profile_picture:
                  creatorRes.data.profile_picture_url ||
                  enrichedUserData.profile_picture,
                title: creatorRes.data.title || creatorRes.data.role,
                professional_title: creatorRes.data.professional_title,
              };

              // Update verification status from creator profile
              if (creatorRes.data.phone_verified !== undefined) {
                setPhoneVerified(creatorRes.data.phone_verified);
              }
              if (creatorRes.data.email_verified !== undefined) {
                setEmailVerified(creatorRes.data.email_verified);
              }
            }
          } catch (creatorErr) {
            console.log("No creator profile yet");
          }
        }

        setUserData(enrichedUserData);
      } catch (err) {
        console.error("Failed to fetch user data", err);
      }
    };
    fetchUserData();
  }, []);

 const fetchContractStats = async () => {
  if (!userData?.id) {
    setLoadingContracts(false);
    return;
  }

  // Ensure loading is true before fetching
  setLoadingContracts(true);
  
  try {
    const response = await api.get("/contracts/status-counts", {
      params: {
        user_id: userData.id,
      },
    });

    const data = response.data;

    // Update all stats at once
    const newStats = {
      total: data.total || 0,
      pending: data.pending || 0,
      active: data.in_progress || 0,
      awaiting: data.awaiting || 0,
      in_review: data.in_review || 0,
      completed: data.completed || 0,
      cancelled: data.cancelled || 0,
    };
    
    setContractStats(newStats);
  } catch (error) {
    console.error("Error fetching contract stats:", error);
    setContractStats({
      total: 0,
      pending: 0,
      active: 0,
      awaiting: 0,
      in_review: 0,
      completed: 0,
      cancelled: 0,
    });
  } finally {
    // Small delay to ensure state updates are batched
    setTimeout(() => {
      setLoadingContracts(false);
    }, 100);
  }
};

 useEffect(() => {
  // Set loading to true when userData changes
  if (userData?.id) {
    // Reset loading to true before fetching
    setLoadingContracts(true);
    fetchContractStats();
  } else {
    setLoadingContracts(false);
  }
}, [userData?.id]);

  // ========== LOCK BODY SCROLL WHEN ANY POPUP IS OPEN ==========
  useEffect(() => {
    const isAnyPopupOpen = showPhonePopup || showEmailPopup || showOTPPopup || showSuccessPopup || showEmailSetupPopup || showAllJobsPopup || showDeletePopup;
    
    if (isAnyPopupOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [showPhonePopup, showEmailPopup, showOTPPopup, showSuccessPopup, showEmailSetupPopup, showAllJobsPopup, showDeletePopup]);

  useEffect(() => {
    if (!userData || !userData.id) return;

    const fetchProfileCompletion = async () => {
      setLoadingCompletion(true);
      try {
        const response = await api.get(
          `/creator/profile-completion/${userData.id}`
        );
        setProfileCompletion(response?.data?.completion ?? 0);
      } catch (error) {
        console.error("Failed to fetch profile completion:", error);
        setProfileCompletion(0);
      } finally {
        setLoadingCompletion(false);
      }
    };
    fetchProfileCompletion();
  }, [userData?.id]);

  const profilePercent = profileCompletion;

  /* ================= FETCH JOBS ================= */
  /* ================= FETCH JOBS ================= */
useEffect(() => {
  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      const employerId = userData?.id;
      
      // If no user ID, set loading to false and return
      if (!employerId) {
        setLoading(false);
        return;
      }

      const res = await api.get(`/jobs/my-jobs/${employerId}?status=posted`);
      const rawJobs = res.data.jobs || [];

      const processedJobs = rawJobs.map((job) => {
        const parseSkills = (skills) => {
          if (!skills) return [];
          if (Array.isArray(skills)) return skills;
          try {
            return JSON.parse(skills);
          } catch {
            if (typeof skills === "string") {
              return skills
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s);
            }
            return [];
          }
        };

        const jobSkills = parseSkills(job.skills);
        const postedTime = job.created_at
          ? calculateTimeAgo(job.created_at)
          : "Posted";

        const formatExpertiseLevel = (level) => {
          if (!level) return "Intermediate";
          return level.charAt(0).toUpperCase() + level.slice(1);
        };

        const formatBudget = (job) => {
          if (!job.budget_type) return "Budget not specified";
          if (
            job.budget_type?.toLowerCase() === "hourly" &&
            job.budget_from &&
            job.budget_to
          ) {
            return `₹${job.budget_from} – ₹${job.budget_to}/hr`;
          } else if (
            job.budget_type?.toLowerCase() === "hourly" &&
            job.budget_from
          ) {
            return `₹${job.budget_from}/hr`;
          } else if (
            job.budget_type?.toLowerCase() === "fixed" &&
            job.budget_from
          ) {
            return `₹${job.budget_from}`;
          }
          return "Budget not specified";
        };

        const ratingValue = job.rating || 0;
        const reviewsValue = job.reviews_count || job.reviews || 0;

        return {
          ...job,
          skills: jobSkills,
          posted_time: postedTime,
          city: job.city || "",
          country: job.country || "",
          country_code: job.country_code || "",
          rating: ratingValue,
          reviews: reviewsValue,
          formatted_expertise: formatExpertiseLevel(job.expertise_level),
          formatted_budget: formatBudget(job),
          proposals_count: job.proposals_count || 0,
          hired_count: job.hired_count || 0,
          has_completed_contract: job.has_completed_contract || false,
          posted_ago: postedTime,
        };
      });

      setJobs(processedJobs);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Only fetch if userData exists
  if (userData?.id) {
    fetchMyJobs();
  } else {
    // If no userData yet, keep loading true until userData loads
    // The fetch will be triggered when userData changes
    setLoading(true);
  }
}, [userData]);

  // Helper function to calculate time ago
  const calculateTimeAgo = (dateString) => {
    try {
      if (!dateString) return "Posted";
      const jobDate = new Date(dateString);
      const now = new Date();
      const diffMs = now - jobDate;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      if (diffMinutes < 1) return "Posted just now";
      if (diffMinutes < 60) return `Posted ${diffMinutes} min ago`;
      if (diffHours === 1) return "Posted 1 hour ago";
      if (diffHours < 24) return `Posted ${diffHours} hours ago`;
      if (diffDays === 1) return "Posted 1 day ago";
      if (diffDays < 30) return `Posted ${diffDays} days ago`;
      const diffMonths = Math.floor(diffDays / 30);
      if (diffMonths === 1) return "Posted 1 month ago";
      return `Posted ${diffMonths} months ago`;
    } catch {
      return "Posted";
    }
  };

  /* ================= STATISTICS ================= */
  const latestJob = jobs.length > 0 ? jobs[0] : null;
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j) => j.status === "posted").length;
  const completedJobs = jobs.filter((j) => j.status === "completed").length;
  const cancelledJobs = jobs.filter((j) => j.status === "cancelled").length;

  // Get current page jobs for popup
  const indexOfLastJob = popupCurrentPage * itemsPerPage;
  const indexOfFirstJob = indexOfLastJob - itemsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(jobs.length / itemsPerPage);

  // Pagination handlers for popup
  const goToNextPage = () => {
    if (popupCurrentPage < totalPages) {
      setPopupCurrentPage(popupCurrentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (popupCurrentPage > 1) {
      setPopupCurrentPage(popupCurrentPage - 1);
    }
  };

  // Pagination for View Jobs
  const indexOfLastViewJob = viewJobsCurrentPage * itemsPerPageMain;
  const indexOfFirstViewJob = indexOfLastViewJob - itemsPerPageMain;
  const currentViewJobs = jobs.slice(indexOfFirstViewJob, indexOfLastViewJob);
  const totalViewPages = Math.ceil(jobs.length / itemsPerPageMain);

  // Add this helper function to scroll to jobs section
  const scrollToJobsTop = () => {
    const jobsSection = document.querySelector('.space-y-6');
    if (jobsSection) {
      const offset = 100;
      const elementPosition = jobsSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    } else {
      const mainContent = document.querySelector('main');
      if (mainContent) {
        const offset = 80;
        const elementPosition = mainContent.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  const goToNextViewPage = () => {
    if (viewJobsCurrentPage < totalViewPages) {
      setViewJobsCurrentPage(viewJobsCurrentPage + 1);
      setTimeout(() => {
        scrollToJobsTop();
      }, 100);
    }
  };

  const goToPrevViewPage = () => {
    if (viewJobsCurrentPage > 1) {
      setViewJobsCurrentPage(viewJobsCurrentPage - 1);
      setTimeout(() => {
        scrollToJobsTop();
      }, 100);
    }
  };

  const goToNextSavedDraftPage = () => {
    if (savedDraftCurrentPage < savedDraftTotalPages) {
      setSavedDraftCurrentPage(savedDraftCurrentPage + 1);
      setTimeout(() => {
        scrollToJobsTop();
      }, 100);
    }
  };

  const goToPrevSavedDraftPage = () => {
    if (savedDraftCurrentPage > 1) {
      setSavedDraftCurrentPage(savedDraftCurrentPage - 1);
      setTimeout(() => {
        scrollToJobsTop();
      }, 100);
    }
  };

  // Function to update saved draft pagination from SavedDraft component
  const handleSavedDraftUpdate = (totalPages) => {
    setSavedDraftTotalPages(totalPages);
  };

  /* ================= VERIFICATION HANDLERS (STATELESS JWT) ================= */

  const isValidGmail = (email) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;
    const domain = email.toLowerCase().split("@")[1];
    return domain === "gmail.com";
  };

  const handleVerifyPhone = () => {
  if (phoneVerified) {
    toast.success("Phone is already verified!");
    return;
  }

  if (!userData?.phone_number || userData.phone_number.trim() === "") {
    toast.error("Phone number missing. Please add your phone number in your profile before verifying");
    setTimeout(() => navigate("/creator-edit-profile"), 2000);
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

  if (!userData?.email || userData.email.trim() === "") {
    toast.error("Email address missing. Please add your email address in your profile before verifying");
    setTimeout(() => navigate("/creator-edit-profile"), 2000);
    return;
  }

  setEmail(userData.email);
  setCurrentVerificationType("email");
  setRateLimitError("");
  setShowEmailPopup(true);
};
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
      const formData = new FormData();
      formData.append("phone_number", phoneNumber);

      await api.put(`/creator/edit/${userData.id}`, formData);

      const refreshRes = await api.get("/auth/me");
      if (refreshRes.data) {
        setCurrentUser(refreshRes.data);
        setUserData((prev) => ({
          ...prev,
          phone_number: phoneNumber,
        }));
      }

      const fullPhoneNumber = `+91${phoneNumber}`;

      const response = await api.post("/verification/phone/send-otp", {
        email: currentUser.email,
        phone_number: fullPhoneNumber,
      });

      if (response.data.status === "success") {
        setOtpToken(response.data.otp_token);
        setCooldownToken(response.data.cooldown_token);
        
        setShowPhonePopup(false);
        setShowOTPPopup(true);
        toast.success("OTP sent to your phone");
        setResendTime(45);
        setOtp(["", "", "", "", "", ""]);
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
      } else {
        toast.error(error.response?.data?.detail || "Failed to send OTP");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleEmailSubmit = async () => {
    const registeredEmail = userData?.email;

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
    setRateLimitError("");

    try {
      const response = await api.post("/verification/email/send-otp", {
        email: registeredEmail,
      });

      if (response.data.status === "success") {
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
            error.response?.data?.message ||
            "Failed to send OTP. Please try again."
        );
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSaveEmail = async () => {
    if (!isValidGmail(newEmail)) {
      toast.error("Please enter a valid Gmail address");
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

        const refreshRes = await api.get("/auth/me");
        if (refreshRes.data) {
          setUserData(refreshRes.data);
          setCurrentUser(refreshRes.data);
        }

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

    if (!currentUser?.email && currentVerificationType === "phone") {
      toast.error("User email not found");
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

      const response = await api.post(`${endpoint}?otp_token=${otpToken}`, payload);

      if (response.data.status === "success") {
        if (currentVerificationType === "phone") {
          setPhoneVerified(true);
          setCurrentUser((prev) => ({
            ...prev,
            phone_verified: true,
          }));
        } else {
          setEmailVerified(true);
          setCurrentUser((prev) => ({
            ...prev,
            email_verified: true,
          }));
        }

        setShowOTPPopup(false);
        setShowSuccessPopup(true);
        setOtp(["", "", "", "", "", ""]);
        setResendTime(45);
        setRateLimitError("");
        setOtpToken("");
        setCooldownToken("");

        toast.success(
          `${currentVerificationType === "phone" ? "Phone" : "Email"} verified successfully!`
        );

        const refreshRes = await api.get("/auth/me");
        if (refreshRes.data) {
          setUserData((prev) => ({
            ...prev,
            ...refreshRes.data,
          }));
          setCurrentUser(refreshRes.data);
        }
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error(
        error.response?.data?.detail ||
          "Verification failed. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (isVerifying || isResending) {
      return;
    }

    if (resendTime > 0) {
      toast.error(
        `Please wait ${resendTime} seconds before requesting another OTP`
      );
      return;
    }

    setIsResending(true);
    setRateLimitError("");

    try {
      if (currentVerificationType === "phone") {
        const fullPhoneNumber = `+91${phoneNumber}`;

        const response = await api.post("/verification/phone/send-otp", {
          email: currentUser?.email,
          phone_number: fullPhoneNumber,
        }, {
          headers: cooldownToken ? { "X-Cooldown-Token": cooldownToken } : {}
        });

        if (response.data.status === "success") {
          setOtpToken(response.data.otp_token);
          if (response.data.cooldown_token) setCooldownToken(response.data.cooldown_token);
          toast.success("OTP resent to your phone!");
          setResendTime(45);
          setOtp(["", "", "", "", "", ""]);
          setTimeout(() => document.getElementById("otp-0")?.focus(), 100);
        } else {
          toast.error(response.data.message || "Failed to resend OTP");
        }
      } else {
        const registeredEmail = userData?.email;

        if (!registeredEmail) {
          toast.error("No registered email found");
          setIsResending(false);
          return;
        }

        const response = await api.post("/verification/email/send-otp", {
          email: registeredEmail,
        }, {
          headers: cooldownToken ? { "X-Cooldown-Token": cooldownToken } : {}
        });

        if (response.data.status === "success") {
          setOtpToken(response.data.otp_token);
          if (response.data.cooldown_token) setCooldownToken(response.data.cooldown_token);
          toast.success("OTP resent to your email!");
          setResendTime(45);
          setOtp(["", "", "", "", "", ""]);
          setTimeout(() => document.getElementById("otp-0")?.focus(), 100);
        } else {
          toast.error(response.data.message || "Failed to resend OTP");
        }
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
            "Failed to resend OTP. Please try again."
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

  // Handler for edit job
  const handleEditJob = (jobId) => {
    navigate(`/edit-job/${jobId}`);
  };

  // ========== ENHANCED DELETE HANDLER ==========
  const fetchDeleteDetails = async (job) => {
    setLoadingDeleteDetails(true);
    try {
      const contractsRes = await api.get("/contracts/all-history");
      const allContracts = contractsRes.data || [];
      const jobContracts = allContracts.filter(c => c.job_id === job.id);
      
      const activeContracts = [];
      for (const contract of jobContracts) {
        const collaboratorName = contract.collaborator?.name || "Unknown Collaborator";
        
        let milestoneStatus = "No milestone data";
        if (contract.milestones_data && contract.milestones_data.length > 0) {
          const total = contract.milestones_data.length;
          const completed = contract.milestones_data.filter(m => m.status === "paid").length;
          milestoneStatus = `Milestone ${completed} of ${total} completed`;
        } else if (contract.status === "completed") {
          milestoneStatus = "Contract completed";
        } else if (contract.status === "in_progress") {
          milestoneStatus = "In progress (no milestones)";
        } else {
          milestoneStatus = `Status: ${contract.status}`;
        }
        
        activeContracts.push({
          collaborator_name: collaboratorName,
          milestone_status: milestoneStatus,
          contract_status: contract.status,
        });
      }
      
      setDeleteDetails({
        jobTitle: job.title,
        activeContracts: activeContracts,
        proposalsCount: job.proposals_count || 0,
        invitationsCount: 0,
        hasMilestones: jobContracts.some(c => c.milestones_data && c.milestones_data.length > 0),
      });
    } catch (error) {
      console.error("Error fetching delete details:", error);
      setDeleteDetails({
        jobTitle: job.title,
        activeContracts: [],
        proposalsCount: job.proposals_count || 0,
        invitationsCount: 0,
        hasMilestones: false,
      });
    } finally {
      setLoadingDeleteDetails(false);
    }
  };

  const handleDeleteJob = async (job) => {
    setJobToDelete(job);
    await fetchDeleteDetails(job);
    setShowDeletePopup(true);
  };

  const confirmDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      await api.delete(`/jobs/${jobToDelete.id}/delete`);
      const updatedJobs = jobs.filter((j) => j.id !== jobToDelete.id);
      setJobs(updatedJobs);
      toast.success("Job deleted successfully");
      setShowDeletePopup(false);
      setJobToDelete(null);
    } catch (err) {
      console.error("Failed to delete job", err);
      toast.error("Failed to delete job");
      setShowDeletePopup(false);
      setJobToDelete(null);
    }
  };

  // Function to handle scroll to verification section with animation
  const handleCompleteProfileClick = () => {
    const isMobile = window.innerWidth < 1024;
    const verificationSection = isMobile
      ? mobileVerificationRef.current
      : desktopVerificationRef.current;

    if (verificationSection) {
      verificationSection.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      setTimeout(() => {
        const verifyButtons = verificationSection.querySelectorAll(
          ".verify-btn-animation"
        );
        if (verifyButtons.length > 0) {
          verifyButtons.forEach((btn, index) => {
            setTimeout(() => {
              btn.classList.add("animate-zoom");
              if (isMobile) {
                btn.style.transition = "all 0.3s ease";
                btn.style.transform = "scale(1.2)";
                btn.style.backgroundColor = "#51218F";
                btn.style.color = "white";
                btn.style.borderColor = "#51218F";
                btn.style.zIndex = "10";
                btn.style.position = "relative";
                btn.style.boxShadow = "0 0 20px rgba(81, 33, 143, 0.6)";
              }
              setTimeout(() => {
                btn.classList.remove("animate-zoom");
                if (isMobile) {
                  btn.style.transform = "";
                  btn.style.backgroundColor = "";
                  btn.style.color = "";
                  btn.style.borderColor = "";
                  btn.style.zIndex = "";
                  btn.style.position = "";
                  btn.style.boxShadow = "";
                }
              }, 1000);
            }, index * 300);
          });
        }
      }, 500);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col overflow-x-hidden relative bg-gray-50">
      <section className="w-full flex flex-col items-center justify-start px-4 sm:px-6 lg:px-8 relative min-w-0">
        {/* Background Image */}
        <div
  className="
    absolute top-[-104px] left-0 w-full
    h-[382px]          /* Mobile */
    md:h-[400px]       /* Tablet - reduced */
    lg:h-[582px]       /* Desktop */
    z-0
  "
  style={{
    backgroundImage: `url(${HomeBg})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "cover",
  }}
>
          <div className="absolute inset-0 bg-black opacity-30" />
        </div>

        {/* Welcome Text */}
        <div className="absolute top-[130px] md:mt-[10px] max-[420px]:top-[120px] lg:top-[187px] w-full flex items-center justify-center z-10">
          <h1
            className="text-[20px] max-[420px]:text-[18px] lg:text-[48px] leading-tight text-center text-white font-normal"
            style={{ fontFamily: "Milonga" }}
          >
            Welcome back,
            <br className="sm:hidden" /> {userData?.full_name || "User"}
          </h1>
        </div>

        <Header />

        {/* ==================== MAIN LAYOUT ==================== */}
        <div
          className="w-full max-w-[1400px] mx-auto mt-[240px] max-[420px]:mt-[210px] lg:mt-[412px] pb-12 lg:pb-24"
        >
          <div className="flex flex-col lg:flex-row lg:gap-8 xl:gap-10 px-4 max-[420px]:px-3 sm:px-6 lg:px-8 xl:px-10">
            {/* ==================== MAIN CONTENT (LEFT on desktop) ==================== */}
            <main className="w-full lg:w-[780px] xl:w-[860px] flex flex-col gap-5 lg:gap-6 order-2 lg:order-1">
              {/* ========== YOUR JOBS SECTION ========== */}
              <div className="w-full bg-white rounded-[14px] shadow-[0px_8px_40px_rgba(0,0,0,0.12)] overflow-hidden">
                <div className="flex flex-row justify-between items-center p-3 sm:p-4 md:p-[16px_24px]">
                  <div className="flex-1">
                    <h3 className="font-outfit font-semibold text-[14px] sm:text-[16px] md:text-[18px] text-[#2A1E17] leading-tight">
                      {totalJobs === 0 ? "No job post" : "Your Jobs"}
                    </h3>
                    <p className="mt-1 font-outfit text-[11px] sm:text-[12px] md:text-[13px] text-black/70 leading-snug max-w-[400px]">
                      {totalJobs === 0
                        ? "You have not posted any job. Post your job and find world's best talent here."
                        : `You have ${totalJobs} jobs posted. Create more to find talent.`}
                    </p>
                    <button
                      onClick={() => navigate("/created")}
                      className="mt-2 w-[100px] sm:w-[120px] md:w-[160px] h-[28px] sm:h-[32px] md:h-[35px] rounded-[100px] bg-gradient-to-r from-[#51218F] to-[#170929] text-white font-outfit text-[10px] sm:text-[11px] md:text-[12px] hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      {totalJobs === 0 ? "Post a new job" : "Post another job"}
                    </button>
                  </div>
                  <div className="w-[90px] sm:w-[120px] md:w-[180px] h-[70px] sm:h-[80px] md:h-[90px]">
                    <img
                      src={Skill3}
                      alt="Job illustration"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Mobile Find Collaborator Button */}
              <div className="lg:hidden flex justify-center mt-6 mb-4">
                <button
                  onClick={() => navigate("/user-list")}
                  className="px-8 py-2.5 h-[42px] rounded-full bg-gradient-to-r from-[#51218F] to-[#170929] text-white font-semibold text-sm shadow-lg hover:opacity-90 transition-opacity"
                >
                  Find collaborator
                </button>
              </div>
{/* ==================== TABLET PROFILE CARD ==================== */}
<div className="hidden md:flex lg:hidden w-full bg-white rounded-[14px] shadow-[0px_3px_20px_0px_#0000001A] flex-col items-center p-5 mb-6">
  <div className="flex items-center gap-3 w-full mb-4">
    <div className="w-[50px] h-[50px] rounded-full overflow-hidden flex-shrink-0 border-2 border-[#51218F]">
      <img
  src={
    userData?.profile_picture ||
    userData?.profilePhoto ||
    userData?.avatar ||
    Dp1
  }
  alt={userData?.full_name || userData?.name || "User"}
  className="w-full h-full object-cover"
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = Dp1;
  }}
/>
    </div>
    <div className="flex-1">
      <h3 className="font-bold text-[18px] text-[#2A1E17]">
        {userData?.full_name || "User"}
      </h3>
      <p className="font-medium text-[12px] text-[#2A1E17E5]">
        {userData?.role === "creator" ? "Creator" : "Collaborator"}
      </p>
    </div>
  </div>

  <div className="w-full h-px bg-gray-200 mb-4" />

  <div className="w-full">
    <div className="w-full flex justify-between items-center mb-2">
      <span className="font-bold text-[12px] text-[#2A1E17]">Set up your account</span>
      <span className="font-bold text-[12px] text-[#2A1E17]">{profilePercent}%</span>
    </div>
    <div className="w-full h-[5px] mb-4 rounded-full bg-gray-200 overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${profilePercent}%`, backgroundColor: "#51218F" }} />
    </div>
    <button
      onClick={() => navigate("/creator-edit-profile")}
      className="w-full h-[39px] rounded-full flex items-center justify-center bg-gradient-to-r from-[#51218F] to-[#020202] text-white text-[12px] font-bold hover:opacity-90 transition-opacity mb-3"
    >
      {profilePercent === 100 ? "Update Profile" : "Complete your profile"}
    </button>
    <p className="text-[10px] italic text-[#2A1E17E5] text-center leading-tight">
      {profilePercent === 100
        ? "🎉 Great! Your profile is now 100% complete!"
        : `${100 - profilePercent}% more to complete your profile will help you get more reach.`}
    </p>
  </div>
</div>
              {/* Mobile Profile Card - UPDATED to match Home component */}
              <div className="w-full bg-white rounded-[14px] shadow-[0px_3px_20px_0px_#0000001A] flex flex-col items-center p-5 lg:p-6 md:hidden">
                <div className="flex items-center gap-3 w-full mb-4">
                  <div className="w-[50px] h-[50px] rounded-full overflow-hidden flex-shrink-0 border-2 border-[#51218F]">
                    <img
  src={
    userData?.profile_picture ||
    userData?.profilePhoto ||
    userData?.avatar ||
    Dp1
  }
  alt={userData?.full_name || userData?.name || "User"}
  className="w-full h-full object-cover"
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = Dp1;
  }}
/>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[18px] text-[#2A1E17]">
                      {userData?.full_name || "User"}
                    </h3>
                    <p className="font-medium text-[12px] text-[#2A1E17E5]">
                      {userData?.role === "creator" ? "Creator" : "Collaborator"}
                    </p>
                  </div>
                </div>

                <div className="w-full h-px bg-gray-200 mb-4" />

                <div className="w-full">
                  <div className="w-full flex justify-between items-center mb-2">
                    <span className="font-bold text-[12px] text-[#2A1E17]">Set up your account</span>
                    <span className="font-bold text-[12px] text-[#2A1E17]">{profilePercent}%</span>
                  </div>
                  <div className="w-full h-[5px] mb-4 rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${profilePercent}%`, backgroundColor: "#51218F" }} />
                  </div>
                  <button
                    onClick={() => navigate("/creator-edit-profile")}
                    className="w-full h-[35px] rounded-full flex items-center justify-center bg-gradient-to-r from-[#51218F] to-[#020202] text-white text-[11px] sm:text-[12px] font-bold hover:opacity-90 transition-opacity mb-2"
                  >
                    {profilePercent === 100 ? "Update Profile" : "Complete your profile"}
                  </button>
                  <p className="text-[10px] italic text-[#2A1E17E5] text-center leading-tight">
                    {profilePercent === 100
                      ? "🎉 Great! Your profile is now 100% complete!"
                      : `${100 - profilePercent}% more to complete your profile will help you get more reach.`}
                  </p>
                </div>
              </div>

              {/* Mobile Subscription Promo Card */}
              <div className="w-full lg:hidden">
                <button
                  className="relative w-full p-0 border-none bg-transparent cursor-pointer group"
                  onClick={() => {
                    navigate("/subscription");
                    window.scrollTo(0, 0);
                  }}
                >
                  <div className="relative w-full">
                    <div
                      className="w-full h-[80px] min-[400px]:h-[85px] sm:h-auto sm:min-h-[98px] opacity-100 rounded-[8px] sm:rounded-[10px] shadow-[0px_4px_45px_0px_#0000001F] overflow-visible relative p-2 sm:p-6 flex items-center"
                      style={{
                        background: "linear-gradient(266.38deg, #51218F 4.44%, #020202 100.18%)",
                      }}
                    >
                      <div className="absolute inset-0 z-0 rounded-[8px] sm:rounded-[10px] overflow-hidden">
                        <img
                          src={HomeSub}
                          alt="Promotional background"
                          className="w-full h-full object-cover"
                          style={{ opacity: "0.3" }}
                        />
                      </div>
                      <div className="relative z-10 w-full flex items-center pr-[70px] min-[400px]:pr-[75px] sm:pr-[70px] lg:pr-[110px]">
                        <div>
                          <div className="font-medium text-[13px] min-[400px]:text-[14px] sm:text-[18px] leading-tight text-white">
                            Get Subscription
                          </div>
                          <div className="font-medium text-[13px] min-[400px]:text-[14px] sm:text-[18px] leading-tight text-white">
                            more revenue in a month
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Fixed arrow position for tablet */}
                    <div
  className="absolute w-[60px] h-[60px] min-[400px]:w-[65px] min-[400px]:h-[65px] min-[480px]:w-[70px] min-[480px]:h-[70px] sm:w-[60px] sm:h-[60px] md:w-[70px] md:h-[70px] lg:w-[98px] lg:h-[98px] right-[-10px] sm:right-[-5px] md:right-[0px] opacity-100 rounded-full flex items-center justify-center z-20 shadow-lg"
  style={{
    background: "linear-gradient(180deg, #FFA412 0%, #6C4343 100%)",
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
  }}
>
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2.5"
    className="w-[28px] h-[28px] min-[400px]:w-[30px] min-[400px]:h-[30px] min-[480px]:w-[32px] min-[480px]:h-[32px] sm:w-[24px] sm:h-[24px] lg:w-[34px] lg:h-[34px]"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
</div>
                  </div>
                </button>
              </div>

              {/* Mobile Two Column Cards - Verification & Contracts side by side */}
              <div className="w-full lg:hidden flex flex-row gap-3">
                {/* Verification Card - Left Side */}
                <div
                  ref={mobileVerificationRef}
                  className="w-1/2 bg-white rounded-[10px] shadow-[0px_3px_20px_0px_#0000001A] p-3"
                >
                  <h3 className="font-semibold text-[14px] text-[#2A1E17] mb-2">
                    Verification
                  </h3>
                  <div className="w-full h-px bg-black/10 mb-3" />

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-[14px] h-[14px]">
                        {phoneVerified ? (
                          <svg
                            className="w-full h-full text-green-500"
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
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#9CA3AF"
                            strokeWidth="2"
                          >
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-[#2A1E17]">
                        Phone
                      </span>
                    </div>
                    {phoneVerified ? (
                      <span className="text-[10px] text-green-600 font-medium">
                        Verified
                      </span>
                    ) : (
                      <button
                        onClick={handleVerifyPhone}
                        className="text-[10px] text-[#51218F] font-medium verify-btn-animation"
                      >
                        Verify
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-[14px] h-[14px]">
                        {emailVerified ? (
                          <svg
                            className="w-full h-full text-green-500"
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
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#9CA3AF"
                            strokeWidth="2"
                          >
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-[#2A1E17]">
                        Email
                      </span>
                    </div>
                    {emailVerified ? (
                      <span className="text-[10px] text-green-600 font-medium">
                        Verified
                      </span>
                    ) : (
                      <button
                        onClick={handleVerifyEmail}
                        className="text-[10px] text-[#51218F] font-medium verify-btn-animation"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                </div>

{/* All Contract Stats Card - Mobile */}
<div className="w-1/2 bg-white rounded-[10px] shadow-[0px_3px_20px_0px_#0000001A] p-3">
  <div className="flex justify-between items-center mb-2">
    <h3 className="font-montserrat font-medium text-[14px] text-[#2A1E17]">
      Contracts
    </h3>
    <div className="flex items-center gap-0.5">
      <span className="text-[10px] text-[#2A1E17]">Total:</span>
      {loadingContracts ? (
        <div className="w-4 h-4 border-2 border-[#51218F] border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <span className="font-bold text-[13px] text-[#2A1E17]">
          {contractStats.total}
        </span>
      )}
    </div>
  </div>

  {loadingContracts ? (
    <div className="text-center py-4">
      <p className="text-gray-500 text-[11px]">Loading contracts...</p>
    </div>
  ) : (
    <div className="space-y-1.5 mb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <svg
            className="w-[12px] h-[12px] mr-1.5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <p className="text-[10px] text-[#2A1E17E5]">Pending:</p>
        </div>
        <span className="font-medium text-[10px]">{contractStats.pending}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img src={Folder} className="w-[12px] h-[12px] mr-1.5" alt="Active" />
          <p className="text-[10px] text-[#2A1E17E5]">Active:</p>
        </div>
        <span className="font-medium text-[10px]">{contractStats.active}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <svg
            className="w-[12px] h-[12px] mr-1.5 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <p className="text-[10px] text-[#2A1E17E5]">Awaiting:</p>
        </div>
        <span className="font-medium text-[10px]">{contractStats.awaiting}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img src={Cloud} className="w-[12px] h-[12px] mr-1.5" alt="Completed" />
          <p className="text-[10px] text-[#2A1E17E5]">Completed:</p>
        </div>
        <span className="font-medium text-[10px]">{contractStats.completed}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img src={Cancel} className="w-[12px] h-[12px] mr-1.5" alt="Canceled" />
          <p className="text-[10px] text-[#2A1E17E5]">Cancelled:</p>
        </div>
        <span className="font-medium text-[10px]">{contractStats.cancelled}</span>
      </div>
    </div>
  )}

  <div className="flex justify-center mt-1">
    <button
      onClick={() => navigate("/activecontracts")}
      className="w-[75px] h-[26px] rounded-full flex items-center justify-center bg-[#51218F] text-white text-[9px] font-medium hover:opacity-90 transition"
    >
      View all
    </button>
  </div>
</div>
              </div>

              {/* Tabs */}
              <div className="relative mt-4">
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200" />
                <div className="flex">
                  <button
                    onClick={() => setActiveTab("discover")}
                    className={`relative px-5 py-3 max-[420px]:py-2.5 text-[14px] max-[420px]:text-[13px] font-medium transition-all ${activeTab === "discover" ? "text-[#51218F] font-semibold" : "text-gray-600 hover:text-gray-800"}`}
                  >
                    View Jobs
                    {activeTab === "discover" && (
                      <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#51218F] rounded-t-sm" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("saved")}
                    className={`relative px-5 py-3 max-[420px]:py-2.5 text-[14px] max-[420px]:text-[13px] font-medium transition-all ${activeTab === "saved" ? "text-[#51218F] font-semibold" : "text-gray-600 hover:text-gray-800"}`}
                  >
                    Saved Draft
                    {activeTab === "saved" && (
                      <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#51218F] rounded-t-sm" />
                    )}
                  </button>
                </div>
              </div>

              {/* Tab content - View Jobs */}
              {activeTab === "discover" ? (
                <div className="space-y-6 max-[420px]:space-y-5">
                  <h3 className="font-semibold text-[18px] max-[420px]:text-[16px] text-[#2A1E17]">
                    Recent Jobs ({jobs.length})
                  </h3>

                  {loading ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Loading jobs...</p>
                    </div>
                  ) : jobs.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-lg p-6">
                      <p className="text-gray-500 mb-4">
                        You haven't posted any jobs yet.
                      </p>
                    </div>
                  ) : (
                    <>
                      {currentViewJobs.map((job) => (
                        <div
                          key={job.id}
                          className="bg-white rounded-[10px] shadow-lg p-4 sm:p-5 border border-gray-100 relative"
                        >
                          <div className="flex flex-wrap items-center gap-2 mb-3 pr-12 sm:pr-16">
                            <h3 className="font-semibold text-lg sm:text-xl text-gray-900">
                              {job.title}
                            </h3>

                            {job.has_contract && !job.has_completed_contract && (
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                Has Contract
                              </span>
                            )}

                            {job.has_completed_contract && (
                              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                Completed
                              </span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex gap-1.5 sm:gap-2">
                            <button
                              onClick={() => handleEditJob(job.id)}
                              title="Edit Job"
                              className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full shadow-md cursor-pointer transition-transform duration-200 hover:scale-105"
                              style={{
                                background: "linear-gradient(180deg, #51218F 0%, #020202 100%)",
                              }}
                            >
                              <svg
                                viewBox="0 0 24 24"
                                className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4"
                                fill="none"
                                stroke="white"
                                strokeWidth="2"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteJob(job)}
                              className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Job"
                            >
                              <svg
                                className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-red-500"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M3 6h18" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                              </svg>
                            </button>
                          </div>
                          
                          <p className="text-xs sm:text-sm text-gray-600 mb-2">
                            {job.budget_type === "fixed" ? "Fixed-price" : "Hourly"} · {job.formatted_expertise} · Est. Budget {job.formatted_budget} · {job.posted_time}
                          </p>
                          
                          <p className="text-gray-700 leading-relaxed mb-3 text-sm sm:text-[15px] break-words">
                            {expandedDescJobId === job.id
                              ? job.description || "No description available"
                              : `${job.description?.slice(0, 120) || "No description available"}...`}
                            {job.description && job.description.length > 120 && (
                              <button
                                onClick={() => setExpandedDescJobId(expandedDescJobId === job.id ? null : job.id)}
                                className="text-[#51218F] ml-1 font-medium hover:underline text-xs sm:text-sm"
                              >
                                {expandedDescJobId === job.id ? "Show less" : "more"}
                              </button>
                            )}
                          </p>
                          
                          <div className="flex flex-wrap gap-3 sm:gap-5 text-xs sm:text-sm text-gray-600 items-center">
                            <span className="text-[#51218F] font-bold text-sm sm:text-[15px]">
                              {job.budget_type?.toLowerCase() === "fixed" ? "₹ Fixed Rate" : "₹ Hourly Rate"}
                            </span>
                            <span className="text-[#51218F] flex items-center gap-1">
                              <span className="text-yellow-500 text-xs sm:text-sm">
                                {"★".repeat(Math.round(job.rating || 0))}
                                {"☆".repeat(5 - Math.round(job.rating || 0))}
                              </span>
                              <span className="text-xs sm:text-sm">
                                {job.rating || 0}/5 ({job.reviews || 0} Review{job.reviews !== 1 ? "s" : ""})
                              </span>
                            </span>
                            <div className="flex items-center gap-1.5">
                              {job.country_code && (
                                <ReactCountryFlag
                                  countryCode={job.country_code}
                                  svg
                                  style={{ width: "16px", height: "12px" }}
                                />
                              )}
                              <span className="text-xs sm:text-sm">
                                {job.state && job.country ? `${job.state}, ${job.country}` : job.country || "Remote"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {jobs.length > itemsPerPageMain && (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 pb-2">
                          <button
                            onClick={goToPrevViewPage}
                            disabled={viewJobsCurrentPage === 1}
                            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all text-sm ${
                              viewJobsCurrentPage === 1 
                                ? "text-gray-400 cursor-not-allowed bg-gray-100" 
                                : "text-[#51218F] hover:bg-purple-50 hover:shadow-md bg-white"
                            }`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="font-medium hidden sm:inline">Previous</span>
                            <span className="font-medium sm:hidden">Prev</span>
                          </button>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm text-gray-600">
                              Page {viewJobsCurrentPage} of {totalViewPages}
                            </span>
                            <span className="text-xs text-gray-300 hidden sm:inline">|</span>
                            <span className="text-xs sm:text-sm text-gray-500">
                              {indexOfFirstViewJob + 1}-{Math.min(indexOfLastViewJob, jobs.length)} of {jobs.length}
                            </span>
                          </div>
                          
                          <button
                            onClick={goToNextViewPage}
                            disabled={viewJobsCurrentPage === totalViewPages}
                            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all text-sm ${
                              viewJobsCurrentPage === totalViewPages 
                                ? "text-gray-400 cursor-not-allowed bg-gray-100" 
                                : "text-[#51218F] hover:bg-purple-50 hover:shadow-md bg-white"
                            }`}
                          >
                            <span className="font-medium hidden sm:inline">Next</span>
                            <span className="font-medium sm:hidden">Next</span>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div>
                  <SavedDraft
                    currentPage={savedDraftCurrentPage}
                    itemsPerPage={itemsPerPageMain}
                    onTotalPagesChange={handleSavedDraftUpdate}
                  />
                  {savedDraftTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 pt-6 pb-2 mt-4">
                      <button
                        onClick={goToPrevSavedDraftPage}
                        disabled={savedDraftCurrentPage === 1}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${savedDraftCurrentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-[#51218F] hover:bg-purple-50 hover:shadow-md"}`}
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
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                        <span className="font-medium">Previous</span>
                      </button>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">
                          Page {savedDraftCurrentPage} of {savedDraftTotalPages}
                        </span>
                      </div>
                      <button
                        onClick={goToNextSavedDraftPage}
                        disabled={savedDraftCurrentPage === savedDraftTotalPages}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${savedDraftCurrentPage === savedDraftTotalPages ? "text-gray-400 cursor-not-allowed" : "text-[#51218F] hover:bg-purple-50 hover:shadow-md"}`}
                      >
                        <span className="font-medium">Next</span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </main>

            {/* ==================== RIGHT SIDEBAR (Desktop only) ==================== */}
            <aside className="hidden lg:flex lg:flex-col lg:gap-8 xl:gap-10 w-full lg:w-[380px] xl:w-[420px] order-1 lg:order-2 lg:sticky lg:top-[140px] lg:self-start">
              <button
                onClick={() => navigate("/user-list")}
                className="w-[190px] self-end h-[39px] rounded-full bg-gradient-to-r from-[#51218F] to-[#170929] text-white font-bold text-[12px]"
              >
                Find collaborator
              </button>

              {/* Profile Card - UPDATED to match Home component */}
              <div className="w-full bg-white rounded-[14px] shadow-[0px_3px_20px_0px_#0000001A] flex flex-col items-center p-6">
                <h3 className="font-bold text-[22px] text-[#2A1E17]">
                  {userData?.full_name || "User"}
                </h3>
                <p className="font-medium text-[14px] text-[#2A1E17E5] mt-1">
                  {userData?.role === "creator" ? "Creator" : "Collaborator"}
                </p>

                <div className="w-full mt-4 mb-2">
                  <div className="w-full flex justify-between items-center mb-2">
                    <span className="font-bold text-[14px] text-[#2A1E17]">Set up your account</span>
                    <span className="font-bold text-[14px] text-[#2A1E17]">{profilePercent}%</span>
                  </div>
                  <div className="w-full h-[6px] mb-4 rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${profilePercent}%`, backgroundColor: "#51218F" }} />
                  </div>
                  <button
                    onClick={() => navigate("/creator-edit-profile")}
                    className="w-full h-[39px] rounded-full flex items-center justify-center bg-gradient-to-r from-[#51218F] to-[#020202] text-white text-[12px] font-bold hover:opacity-90 transition-opacity mb-3"
                  >
                    {profilePercent === 100 ? "Update Profile" : "Complete your profile"}
                  </button>
                  <p className="text-[11px] italic text-[#2A1E17E5] text-center leading-tight">
                    {profilePercent === 100
                      ? "🎉 Great! Your profile is now 100% complete!"
                      : `${100 - profilePercent}% more to complete your profile will help you get more reach.`}
                  </p>
                </div>
              </div>

              {/* Verification - Desktop */}
              <div
                ref={desktopVerificationRef}
                className="w-full bg-white rounded-[10px] shadow-[0px_3px_20px_0px_#0000001A] p-6"
              >
                <h3 className="font-semibold text-[18px] text-[#2A1E17] mb-4">Verification</h3>
                <div className="w-full h-px bg-black/10 mb-4" />
                <div className="flex flex-col gap-5">
                  <div className="flex justify-between items-center text-[16px] text-[#2A1E17]">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5">
                        {phoneVerified ? (
                          <svg
                            className="w-5 h-5 text-green-500"
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
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                          >
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                        )}
                      </div>
                      <span>Phone verification</span>
                    </div>
                    {phoneVerified ? (
                      <span className="text-green-600 font-medium">Verified</span>
                    ) : (
                      <button
                        onClick={handleVerifyPhone}
                        className="text-[#51218F] font-medium hover:opacity-80 verify-btn-animation"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-[16px] text-[#2A1E17]">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5">
                        {emailVerified ? (
                          <svg
                            className="w-5 h-5 text-green-500"
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
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                          >
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                        )}
                      </div>
                      <span>Email verification</span>
                    </div>
                    {emailVerified ? (
                      <span className="text-green-600 font-medium">Verified</span>
                    ) : (
                      <button
                        onClick={handleVerifyEmail}
                        className="text-[#51218F] font-medium hover:opacity-80 verify-btn-animation"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Subscription Promo Card - Desktop (fixed arrow position) */}
              <button
                className="relative w-full p-0 border-none bg-transparent cursor-pointer group"
                onClick={() => {
                  navigate("/subscription");
                  window.scrollTo(0, 0);
                }}
              >
                <div className="relative w-full">
                  <div
                    className="w-full h-[98px] rounded-[10px] shadow-[0px_4px_45px_0px_#0000001F] overflow-visible relative p-6 flex items-center"
                    style={{
                      background: "linear-gradient(266.38deg, #51218F 4.44%, #020202 100.18%)",
                    }}
                  >
                    <div className="absolute inset-0 z-0 rounded-[10px] overflow-hidden">
                      <img
                        src={HomeSub}
                        alt="Promotional background"
                        className="w-full h-full object-cover"
                        style={{ opacity: "0.3" }}
                      />
                    </div>
                    <div className="relative z-10 w-full flex items-center pr-[110px]">
                      <div>
                        <div className="font-medium text-[18px] leading-tight text-white">
                          Get Subscription
                        </div>
                        <div className="font-medium text-[18px] leading-tight text-white">
                          more revenue in a month
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className="absolute w-[98px] h-[98px] right-[-15px] xl:right-[-30px] top-25 -translate-y-1/2 opacity-100 rounded-full flex items-center justify-center z-20 shadow-lg"
                    style={{
                      background: "linear-gradient(180deg, #FFA412 0%, #6C4343 100%)",
                      transform: "translateY(-50%)",
                    }}
                  >
                    <svg
                      width="34"
                      height="34"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </div>
                </div>
              </button>

 {/* All Contracts Card - Desktop */}
<div className="w-full h-auto rounded-[10px] bg-white shadow-lg p-6">
  <div className="flex flex-wrap justify-between items-center mb-6">
    <h3 className="font-montserrat font-medium text-[20px] leading-[100%] text-[#2A1E17]">
      All Contracts
    </h3>
    <div className="flex items-center gap-1">
      <span className="font-montserrat font-medium text-[16px] leading-[100%] text-[#2A1E17]">
        Total:
      </span>
      {loadingContracts ? (
        <div className="w-5 h-5 border-2 border-[#51218F] border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <span className="font-montserrat font-bold text-[20px] leading-[100%] text-[#2A1E17]">
          {contractStats.total}
        </span>
      )}
    </div>
  </div>

  {loadingContracts ? (
    <div className="text-center py-8">
      <p className="text-gray-500">Loading contracts...</p>
    </div>
  ) : (
    <div className="space-y-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-[20px] h-[19px] mr-3 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M12 6v6l4 2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <p className="font-montserrat text-[15px] text-[#2A1E17E5]">
            <span className="font-bold">Pending:</span>
          </p>
        </div>
        <span className="font-montserrat font-semibold text-[#2A1E17]">
          {contractStats.pending}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-[20px] h-[19px] mr-3 flex items-center justify-center">
            <img
              src={Folder}
              alt="Active contracts"
              className="w-full h-full object-contain"
            />
          </div>
          <p className="font-montserrat text-[15px] text-[#2A1E17E5]">
            <span className="font-bold">Active:</span>
          </p>
        </div>
        <span className="font-montserrat font-semibold text-[#2A1E17]">
          {contractStats.active}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-[20px] h-[19px] mr-3 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M12 8v4l3 3"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <p className="font-montserrat text-[15px] text-[#2A1E17E5]">
            <span className="font-bold">Awaiting:</span>
          </p>
        </div>
        <span className="font-montserrat font-semibold text-[#2A1E17]">
          {contractStats.awaiting}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-[20px] h-[19px] mr-3 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <p className="font-montserrat text-[15px] text-[#2A1E17E5]">
            <span className="font-bold">In Review:</span>
          </p>
        </div>
        <span className="font-montserrat font-semibold text-[#2A1E17]">
          {contractStats.in_review}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-[20px] h-[19px] mr-3 flex items-center justify-center">
            <img
              src={Cloud}
              alt="Completed contracts"
              className="w-full h-full object-contain"
            />
          </div>
          <p className="font-montserrat text-[15px] text-[#2A1E17E5]">
            <span className="font-bold">Completed:</span>
          </p>
        </div>
        <span className="font-montserrat font-semibold text-[#2A1E17]">
          {contractStats.completed}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-[20px] h-[19px] mr-3 flex items-center justify-center">
            <img
              src={Cancel}
              alt="Canceled contracts"
              className="w-full h-full object-contain"
            />
          </div>
          <p className="font-montserrat text-[15px] text-[#2A1E17E5]">
            <span className="font-bold">Cancelled:</span>
          </p>
        </div>
        <span className="font-montserrat font-semibold text-[#2A1E17]">
          {contractStats.cancelled}
        </span>
      </div>
    </div>
  )}

  <div className="flex justify-center mt-2">
    <button
      onClick={() => navigate("/activecontracts")}
      className="w-[122px] h-[39px] rounded-[100px] flex items-center justify-center bg-[#51218F] text-white hover:opacity-90 transition-all duration-200 cursor-pointer"
    >
      <span className="font-montserrat font-bold text-[12px] whitespace-nowrap">
        View All
      </span>
    </button>
  </div>
</div>
            </aside>
          </div>
        </div>
      </section>

      {/* ==================== ALL JOBS POPUP ==================== */}
      {showAllJobsPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] shadow-2xl overflow-hidden">
            <button
              onClick={() => {
                setShowAllJobsPopup(false);
                setPopupCurrentPage(1);
              }}
              className="absolute top-4 left-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#51218F] to-[#2a0e4a] text-white hover:opacity-90 transition shadow-md"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path
                  d="M18 6L6 18M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="text-center pt-6 pb-3 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Recent Jobs</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                You have {jobs.length} job{jobs.length !== 1 ? "s" : ""} posted
              </p>
            </div>
            <div
              className="overflow-y-auto px-6 py-5 max-h-[calc(85vh-85px)]"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <div className="space-y-5">
                {loading ? (
                  <div className="text-center text-gray-500 py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-3"></div>
                    <p className="text-sm">Loading jobs...</p>
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">No jobs found</p>
                    <p className="text-gray-400 text-xs mt-1">
                      You haven't posted any jobs yet
                    </p>
                  </div>
                ) : (
                  currentJobs.map((job, i) => (
                    <div
                      key={job.id}
                      className={`pb-4 ${i < currentJobs.length - 1 ? "border-b border-gray-100" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-[#2A1E17] mb-1">
                            {job.title}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {job.budget_type === "fixed"
                              ? "Fixed-price"
                              : "Hourly"}{" "}
                            · {job.formatted_expertise || "Intermediate"} · Est.
                            Budget {job.formatted_budget} · {job.posted_time}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleEditJob(job.id)}
                            title="Edit Job"
                            className="w-7 h-7 flex items-center justify-center rounded-full shadow-sm hover:scale-105 transition bg-gradient-to-r from-[#51218F] to-[#2a0e4a]"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="white"
                              strokeWidth="2"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job)}
                            title="Delete Job"
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-50 transition cursor-pointer"
                          >
                            <svg
                              className="w-3.5 h-3.5 text-red-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth="2"
                            >
                              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed mb-3 text-[13px] mt-2">
                        {expandedDescJobId === job.id
                          ? job.description || "No description available"
                          : `${job.description?.slice(0, 120) || "No description available"}...`}
                        {job.description && job.description.length > 120 && (
                          <button
                            onClick={() =>
                              setExpandedDescJobId(
                                expandedDescJobId === job.id ? null : job.id
                              )
                            }
                            className="text-[#51218F] ml-1 font-medium hover:underline text-xs"
                          >
                            {expandedDescJobId === job.id ? "less" : "more"}
                          </button>
                        )}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                        <span className="text-[#51218F] font-medium">
                          {job.budget_type?.toLowerCase() === "fixed"
                            ? "₹ Fixed Rate"
                            : "₹ Hourly Rate"}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-yellow-500 text-sm">
                            {"★".repeat(Math.round(job.rating || 0))}
                            {"☆".repeat(5 - Math.round(job.rating || 0))}
                          </span>
                          <span className="text-gray-500">
                            {job.rating || 0}/5 ({job.reviews || 0})
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {job.country_code ? (
                            <ReactCountryFlag
                              countryCode={job.country_code}
                              svg
                              style={{
                                width: "16px",
                                height: "12px",
                                borderRadius: "2px",
                              }}
                            />
                          ) : (
                            <img
                              src={flag}
                              alt="flag"
                              className="w-4 h-3 rounded object-cover"
                            />
                          )}
                          <span className="text-gray-500 text-xs">
                            {job.country || "Remote"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {!loading && jobs.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      goToPrevPage();
                      setTimeout(() => {
                        const popupContent =
                          document.querySelector(".overflow-y-auto");
                        if (popupContent) popupContent.scrollTop = 0;
                      }, 100);
                    }}
                    disabled={popupCurrentPage === 1}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-all ${popupCurrentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#51218F] text-white hover:opacity-90 shadow-sm"}`}
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Prev
                  </button>
                  <div className="flex items-center gap-1.5">
                    {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                      let pageNum;
                      if (totalPages <= 5) pageNum = idx + 1;
                      else if (popupCurrentPage <= 3) pageNum = idx + 1;
                      else if (popupCurrentPage >= totalPages - 2)
                        pageNum = totalPages - 4 + idx;
                      else pageNum = popupCurrentPage - 2 + idx;
                      if (pageNum > totalPages) return null;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setPopupCurrentPage(pageNum);
                            setTimeout(() => {
                              const popupContent =
                                document.querySelector(".overflow-y-auto");
                              if (popupContent) popupContent.scrollTop = 0;
                            }, 100);
                          }}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${popupCurrentPage === pageNum ? "bg-[#51218F] text-white shadow-sm" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => {
                      goToNextPage();
                      setTimeout(() => {
                        const popupContent =
                          document.querySelector(".overflow-y-auto");
                        if (popupContent) popupContent.scrollTop = 0;
                      }, 100);
                    }}
                    disabled={popupCurrentPage === totalPages}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-all ${popupCurrentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#51218F] text-white hover:opacity-90 shadow-sm"}`}
                  >
                    Next
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========== ENHANCED & RESPONSIVE DELETE CONFIRMATION POPUP (no scrollbar visible) ========== */}
      {showDeletePopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="bg-gradient-to-r from-[#51218F] to-[#2a0e4a] p-6 text-center sticky top-0">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-white/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Delete Job Permanently</h3>
            </div>

            {loadingDeleteDetails ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#51218F] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading job details...</p>
              </div>
            ) : (
              <div className="p-4 sm:p-6">
                <div className="mb-4">
                  <p className="text-gray-800 font-semibold text-lg mb-1 break-words">{deleteDetails.jobTitle}</p>
                  <p className="text-sm text-red-600 font-medium">⚠️ This action cannot be undone.</p>
                </div>

                {/* Active Contracts Warning */}
                {deleteDetails.activeContracts.length > 0 && (
                  <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-red-700 font-semibold text-sm mb-2">⚠️ Active Contracts Found!</p>
                    <div className="space-y-1">
                      {deleteDetails.activeContracts.map((contract, idx) => (
                        <div key={idx} className="text-xs text-red-600">
                          • Collaborator: {contract.collaborator_name}
                          {contract.milestone_status && contract.milestone_status !== "No milestone data" && ` - ${contract.milestone_status}`}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-red-600 mt-2">
                      Deleting this job will also delete all associated contracts, proposals, and invitations.
                      Any work already submitted will be lost.
                    </p>
                  </div>
                )}

                {/* Stats */}
                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">Proposals:</span>
                    <span className="font-semibold text-gray-800">{deleteDetails.proposalsCount}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">Invitations:</span>
                    <span className="font-semibold text-gray-800">{deleteDetails.invitationsCount}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600">Active Contracts:</span>
                    <span className="font-semibold text-red-600">{deleteDetails.activeContracts.length}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setShowDeletePopup(false);
                      setJobToDelete(null);
                    }}
                    className="flex-1 px-4 py-3 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteJob}
                    className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-700 text-white font-medium hover:from-red-600 hover:to-red-800 transition-colors shadow-lg"
                  >
                    Yes, Delete Permanently
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== VERIFICATION POPUPS (unchanged – omitted for brevity) ========== */}
      {/* Phone Input Popup */}
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
            <div className="relative w-full max-w-[740px] min-h-[432px] rounded-[32px] border-[1.5px] border-white bg-white/70 shadow-[0_0_10px_0_#FFFFFF] flex flex-col items-center justify-center gap-4 md:gap-6 p-4 sm:p-6 md:p-8 my-8 mx-2 sm:mx-4">
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

              <div className="w-full max-w-lg text-center mt-8 md:mt-10">
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
                  <div className="flex flex-col sm:flex-row mb-3 md:mb-4">
                    <div className="flex w-full">
                      <div className="flex-shrink-0">
                        <div className="flex items-center px-3 py-2.5 sm:px-4 sm:py-3 border border-r-0 border-gray-300 rounded-l-xl bg-gray-50/70 backdrop-blur-sm h-full">
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
                        className="flex-1 min-w-0 px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 border-l-0 rounded-r-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-[#3D1768] focus:border-[#3D1768] outline-none transition-all text-[#030303] poppins-font"
                      />
                    </div>
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
                      className={`text-[10px] sm:text-sm font-medium poppins-font ${
                        phoneNumber.length === 10
                          ? "text-[#3D1768]"
                          : "text-[#030303]/70"
                      }`}
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
                  className="group relative overflow-hidden w-full max-w-[554px] h-10 sm:h-12 md:h-[48px] rounded-[30px] bg-gradient-to-r from-[#3D1768] to-[#030303] px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-white text-sm sm:text-base md:text-lg font-medium poppins-font border border-white/10 shadow-lg hover:border-white/30 hover:shadow-2xl hover:shadow-purple-900/50 active:scale-95 transition-all duration-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 mx-2 sm:mx-0">
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">
                      No phone number found in your profile
                    </p>
                    <button
                      onClick={() => {
                        setShowPhonePopup(false);
                        navigate("/creator-edit-profile");
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

      {/* Email Setup Popup */}
      {showEmailSetupPopup && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99998]"
            onClick={() => {
              if (!isSavingEmail) setShowEmailSetupPopup(false);
            }}
          />
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <div className="relative w-full max-w-[740px] min-h-[432px] rounded-[32px] border-[1.5px] border-white bg-white/70 shadow-[0_0_10px_0_#FFFFFF] flex flex-col items-center justify-center gap-4 md:gap-6 p-4 sm:p-6 md:p-8 my-8 mx-2 sm:mx-4">
              <div
                className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 cursor-pointer select-none z-10"
                onClick={() => {
                  if (!isSavingEmail) setShowEmailSetupPopup(false);
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

              <div className="w-full max-w-lg text-center mt-8 md:mt-10">
                <h1 className="text-xl sm:text-2xl md:text-[32px] font-semibold text-[#000000] poppins-font">
                  Add Email Address
                </h1>
                <p className="text-[#3D1768] text-xs sm:text-sm md:text-base poppins-font mb-6 md:mb-10 px-3 sm:px-4">
                  No email found on your account. Please add an email address
                  first to verify it.
                </p>

                <div className="mb-6 md:mb-8 px-2 sm:px-0">
                  <label className="block text-xs sm:text-sm font-medium text-[#030303] mb-2 md:mb-3 poppins-font text-left">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value.toLowerCase())}
                    placeholder="username@gmail.com"
                    disabled={isSavingEmail}
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-[#3D1768] focus:border-[#3D1768] outline-none transition-all text-[#030303] poppins-font disabled:opacity-60"
                  />
                  <p className="text-[10px] sm:text-sm text-[#030303]/70 poppins-font mt-2 md:mt-3 text-left">
                    Enter a valid email address to proceed with verification
                  </p>
                </div>

                <button
                  onClick={handleSaveEmail}
                  disabled={!isValidGmail(newEmail) || isSavingEmail}
                  type="button"
                  className="group relative overflow-hidden w-full max-w-[554px] h-10 sm:h-12 md:h-[48px] rounded-[30px] bg-gradient-to-r from-[#3D1768] to-[#030303] px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-white text-sm sm:text-base md:text-lg font-medium poppins-font border border-white/10 shadow-lg hover:border-white/30 hover:shadow-2xl hover:shadow-purple-900/50 active:scale-95 transition-all duration-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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
                      "Save & Verify Email"
                    )}
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
            <div className="relative w-full max-w-[740px] min-h-[432px] rounded-[32px] border-[1.5px] border-white bg-white/70 shadow-[0_0_10px_0_#FFFFFF] flex flex-col items-center justify-center gap-4 md:gap-6 p-4 sm:p-6 md:p-8 my-8 mx-2 sm:mx-4">
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
                className={`absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 cursor-pointer select-none z-10 ${
                  isVerifying ? "opacity-50 pointer-events-none" : ""
                }`}
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

              <div className="w-full max-w-lg text-center mt-8 md:mt-10">
                <h1 className="text-xl sm:text-2xl md:text-[32px] font-semibold text-[#000000] poppins-font">
                  Verify Email Address
                </h1>
                <p className="text-[#3D1768] text-xs sm:text-sm md:text-base poppins-font mb-6 md:mb-10 px-3 sm:px-4">
                  Enter your registered email address to receive a verification
                  code
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
                        {currentUser?.email || "Not set"}
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
                      currentUser?.email || "Enter your Gmail address"
                    }
                    disabled={isVerifying}
                    className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border ${
                      isValidGmail(email)
                        ? "border-gray-300"
                        : "border-red-300"
                    } rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-[#3D1768] focus:border-[#3D1768] outline-none transition-all text-[#030303] poppins-font placeholder:text-[#030303]/50 ${
                      isVerifying ? "opacity-50 cursor-not-allowed" : ""
                    }`}
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
                        <span className="text-red-500 text-[10px] sm:text-xs">
                          Invalid email
                        </span>
                      </div>
                    )}
                  </div>

                  {email &&
                    currentUser?.email &&
                    email.toLowerCase() !== currentUser.email.toLowerCase() && (
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
                    (currentUser?.email &&
                      email.toLowerCase() !== currentUser.email.toLowerCase())
                  }
                  type="button"
                  className="group relative overflow-hidden w-full max-w-[554px] h-10 sm:h-12 md:h-[48px] rounded-[30px] bg-gradient-to-r from-[#3D1768] to-[#030303] px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-white text-sm sm:text-base md:text-lg font-medium poppins-font border border-white/10 shadow-lg hover:border-white/30 hover:shadow-2xl hover:shadow-purple-900/50 active:scale-95 transition-all duration-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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
                    Please wait {resendTime} seconds before requesting another
                    OTP
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* OTP Verification Popup */}
      {showOTPPopup && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99998]"
            onClick={() => {
              setShowOTPPopup(false);
              setOtp(["", "", "", "", "", ""]);
              setResendTime(45);
              if (currentVerificationType === "phone")
                setShowPhonePopup(true);
              else setShowEmailPopup(true);
            }}
          />
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <div className="relative w-full max-w-[740px] min-h-[432px] rounded-[32px] border-[1.5px] border-white bg-white/70 shadow-[0_0_10px_0_#FFFFFF] flex flex-col items-center justify-center gap-4 md:gap-6 p-4 sm:p-6 md:p-8 my-8 mx-2 sm:mx-4">
              <div
                className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 cursor-pointer select-none z-10"
                onClick={() => {
                  setShowOTPPopup(false);
                  setOtp(["", "", "", "", "", ""]);
                  setResendTime(45);
                  if (currentVerificationType === "phone")
                    setShowPhonePopup(true);
                  else setShowEmailPopup(true);
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

              <div className="w-full max-w-lg text-center mt-8 md:mt-10">
                <h1 className="text-xl sm:text-2xl md:text-[32px] font-semibold text-[#000000] poppins-font">
                  Enter OTP
                </h1>
                <p className="text-[#3D1768] text-xs sm:text-sm md:text-base poppins-font mb-6 md:mb-10 px-3 sm:px-4">
                  We've sent a 6-digit OTP to your{" "}
                  <span className="font-semibold text-[#51218F]">
                    {currentVerificationType === "phone"
                      ? "Phone Number"
                      : "Email Address"}
                  </span>
                  . Please enter it below to continue.
                </p>

                <div className="flex justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 mb-6 md:mb-8 px-2 sm:px-0">
                  {Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="relative flex-shrink-0">
                        <input
                          value={otp[i] || ""}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Backspace" && !otp[i] && i > 0) {
                              document
                                .getElementById(`otp-${i - 1}`)
                                ?.focus();
                            } else if (
                              e.key !== "Backspace" &&
                              /^[0-9]$/.test(e.key) &&
                              otp[i] &&
                              i < 5
                            ) {
                              setTimeout(() => {
                                document
                                  .getElementById(`otp-${i + 1}`)
                                  ?.focus();
                              }, 10);
                            }
                          }}
                          id={`otp-${i}`}
                          maxLength={1}
                          inputMode="numeric"
                          className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-[50px] lg:h-[70px] text-center text-base sm:text-xl md:text-2xl lg:text-4xl text-[#000000] bg-transparent outline-none leading-none pb-1 sm:pb-2"
                        />
                        <div
                          className={`absolute left-0 right-0 bottom-0 h-[2px] rounded-full transition-all duration-300 ${
                            otp[i] ? "bg-[#3D1768]" : "bg-gray-400"
                          }`}
                        />
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
                  <span className="absolute inset-0 rounded-[30px] bg-white/10 scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative z-10 group-hover:scale-105 transition-transform duration-300">
                    {isVerifying ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs sm:text-sm md:text-base">
                          Verifying...
                        </span>
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
                        <p className="text-xs text-red-500 mt-2">
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

      {/* Success Popup */}
      {showSuccessPopup && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99998]"
            onClick={() => setShowSuccessPopup(false)}
          />
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <div className="relative w-full max-w-[652px] min-h-[300px] md:min-h-[398px] rounded-[32px] border-[1.5px] border-white bg-white/70 shadow-[0_0_10px_0_#FFFFFF] flex flex-col items-center justify-center gap-4 md:gap-6 p-5 md:p-8 my-8 mx-2 sm:mx-4">
              <img
                src={Success}
                alt="Success"
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-[122px] md:h-[122px] max-w-[25%] max-h-[25%] object-contain"
              />
              <p className="w-[90%] max-w-[522px] text-center text-base sm:text-lg md:text-[24px] leading-[120%] sm:leading-[100%] font-normal poppins-font text-[#3D1768] px-2">
                Your{" "}
                {currentVerificationType === "phone"
                  ? "Phone Number"
                  : "Email Address"}{" "}
                has been verified successfully!
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
              <p className="text-xs md:text-sm text-[#3D1768]/80 poppins-font mt-1 md:mt-2">
                Closing automatically...
              </p>
            </div>
          </div>
        </>
      )}

       <Footer />

      <style>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(81, 33, 143, 0.4);
          }
          70% {
            box-shadow: 0 0 0 12px rgba(81, 33, 143, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(81, 33, 143, 0);
          }
        }
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        @keyframes shine {
          0% {
            background-position: 200% 200%;
          }
          100% {
            background-position: -100% -100%;
          }
        }
        @keyframes float {
          0% {
            transform: translateY(-50%) translateY(0px);
          }
          50% {
            transform: translateY(-50%) translateY(-5px);
          }
          100% {
            transform: translateY(-50%) translateY(0px);
          }
        }
        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        @keyframes zoomInOut {
          0% {
            transform: scale(1);
            background-color: transparent;
            color: #51218f;
          }
          50% {
            transform: scale(1.3);
            background-color: #51218f !important;
            color: white !important;
            border-color: #51218f !important;
            box-shadow: 0 0 20px rgba(81, 33, 143, 0.6) !important;
          }
          100% {
            transform: scale(1);
            background-color: transparent;
            color: #51218f;
          }
        }
        .animate-zoom {
          animation: zoomInOut 0.8s ease-in-out !important;
          transition: all 0.3s ease;
          z-index: 10;
          position: relative;
        }
        .animate-bounce {
          animation: bounce 1s ease-in-out infinite;
        }

        /* Hide scrollbar while keeping scroll functionality */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        @media (max-width: 1023px) {
          .verify-btn-animation {
            transition: all 0.3s ease;
          }
          .verify-btn-animation.animate-zoom {
            background-color: #51218f !important;
            color: white !important;
            transform: scale(1.2) !important;
            box-shadow: 0 0 20px rgba(81, 33, 143, 0.6) !important;
            border-color: #51218f !important;
          }
        }
      `}</style>
    </div>
  );
};

export default JobCreated;