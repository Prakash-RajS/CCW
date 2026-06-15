import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useUser } from '../../contexts/UserContext';
import api from "../../utils/axiosConfig";
import toast from "../../component/Toast";

import Header from "../../component/ColHeader";
import Footer from "../../component/Footer";
import HomeBg from "../../assets/AfterSign/HomeBg.png";
import Dp1 from "../../assets/AfterSign/Dp1.jpg";
import USAFlag from "../../assets/AfterSign/Usa.png";
import UKFlag from "../../assets/AfterSign/Chn.jpg";
import CanadaFlag from "../../assets/AfterSign/Trc.jpg";
import HomeSub from "../../assets/AfterSign/HomeSub.png";
import Folder from "../../assets/AfterSign/Folder.png";
import Cloud from "../../assets/AfterSign/Cloud.png";
import Cancel from "../../assets/AfterSign/Cancel.png";
import Success from "../../assets/Auth/Succes.png";

const ColHome = () => {
  const [activeTab, setActiveTab] = useState("recent");
  const navigate = useNavigate();
  const { userData } = useUser();

  // ========== VERIFICATION STATE ==========
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showPhonePopup, setShowPhonePopup] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [showOTPPopup, setShowOTPPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [currentVerificationType, setCurrentVerificationType] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTime, setResendTime] = useState(45);
  const [rateLimitError, setRateLimitError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  const [otpToken, setOtpToken] = useState('');
  const [cooldownToken, setCooldownToken] = useState('');

  const [showEmailSetupPopup, setShowEmailSetupPopup] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const expiryToastShown = useRef(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [popupCurrentPage, setPopupCurrentPage] = useState(1);
  const popupItemsPerPage = 4;

  const [savedJobs, setSavedJobs] = useState(new Set());
  const [likedJobs, setLikedJobs] = useState(new Set());
  const [expandedJobs, setExpandedJobs] = useState(new Set());
  const [showAllJobsPopup, setShowAllJobsPopup] = useState(false);
  const [expandedDescJobId, setExpandedDescJobId] = useState(null);

  // Updated contractStats to include all statuses
  const [contractStats, setContractStats] = useState({
    active: 0,
    completed: 0,
    awaiting: 0,
    pending: 0,
    inReview: 0,
    cancelled: 0,
    total: 0
  });

  // Proposal + Invitation stats
  const [proposalStats, setProposalStats] = useState({
    submitted: 0,
    invitations: 0
  });

  const getUserDisplayName = () => {
    if (!userData) return 'User';
    return userData.full_name || 'User';
  };

  // ========== FETCH CURRENT USER ==========
  const fetchUserData = async () => {
    try {
      const res = await api.get('/auth/me');
      setCurrentUser(res.data);
    } catch (err) {
      console.error('Failed to fetch user data', err);
    }
  };

  useEffect(() => {
    if (userData?.id) {
      fetchUserData();
    }
  }, [userData?.id]);

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      if (!userData?.id) return;

      let phoneVerifiedStatus = userData.phone_verified === true ||
        userData.phone_verified === 1 ||
        userData.phone_verified === "true";

      let emailVerifiedStatus = userData.email_verified === true ||
        userData.email_verified === 1 ||
        userData.email_verified === "true";

      if (phoneVerifiedStatus && emailVerifiedStatus) {
        setPhoneVerified(phoneVerifiedStatus);
        setEmailVerified(emailVerifiedStatus);
        return;
      }

      const userEmail = userData?.email;
      if (!userEmail) {
        setPhoneVerified(phoneVerifiedStatus);
        setEmailVerified(emailVerifiedStatus);
        return;
      }

      try {
        const response = await api.get(`/verification/debug/check-verification/${userEmail}`);
        if (response.data && response.data.record_exists) {
          phoneVerifiedStatus = response.data.phone_verified === true ||
            response.data.phone_verified === 1 ||
            response.data.phone_verified === "true";
          emailVerifiedStatus = response.data.email_verified === true ||
            response.data.email_verified === 1 ||
            response.data.email_verified === "true";
        }
        setPhoneVerified(phoneVerifiedStatus);
        setEmailVerified(emailVerifiedStatus);
      } catch (error) {
        console.error('Error fetching verification status:', error);
        setPhoneVerified(phoneVerifiedStatus);
        setEmailVerified(emailVerifiedStatus);
      }
    };

    fetchVerificationStatus();
  }, [userData]);

  // ========== PREVENT BODY SCROLL WHEN POPUPS ARE OPEN ==========
  useEffect(() => {
    const isAnyPopupOpen = showPhonePopup || showEmailPopup || showOTPPopup || showSuccessPopup || showEmailSetupPopup;
    
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
  }, [showPhonePopup, showEmailPopup, showOTPPopup, showSuccessPopup, showEmailSetupPopup]);

  useEffect(() => {
    let timer;
    if (showSuccessPopup) {
      timer = setTimeout(() => setShowSuccessPopup(false), 3000);
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [showSuccessPopup]);

  useEffect(() => {
    if (rateLimitError && resendTime === 0) {
      const timer = setTimeout(() => setRateLimitError(''), 1000);
      return () => clearTimeout(timer);
    }
  }, [rateLimitError, resendTime]);

  const [likedJobsLoading, setLikedJobsLoading] = useState(true);

  useEffect(() => {
    const loadLikedJobs = async () => {
      if (!userData?.id) return;
      try {
        setLikedJobsLoading(true);
        const response = await api.get(`/jobs/liked-jobs/${userData.id}/`);
        if (response.data.status === 'success') {
          setLikedJobs(new Set(response.data.liked_jobs || []));
        }
      } catch (error) {
        console.error('Error loading liked jobs:', error);
      } finally {
        setLikedJobsLoading(false);
      }
    };
    loadLikedJobs();
  }, [userData?.id]);

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
    return () => { if (timer) clearInterval(timer); };
  }, [showOTPPopup, resendTime]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    if (showAllJobsPopup) setPopupCurrentPage(1);
  }, [showAllJobsPopup]);

  // ========== SUBSCRIPTION EXPIRY TOAST ==========
  useEffect(() => {
    if (
      !userData?.email ||
      expiryToastShown.current
    ) return;

    const checkSubscriptionExpiry = async () => {
      try {
        const response = await api.get(
          "/payment/subscription-expiry-status",
          {
            params: {
              user_email: userData.email
            }
          }
        );

        const data = response.data;
        expiryToastShown.current = true;

        if (data.expired) {
          toast.error(
            "Your subscription has expired. Renew or buy a plan to enjoy more features."
          );
          return;
        }

        if ([3, 2, 1].includes(data.days_remaining)) {
          toast.info(
            `⚠️ Your plan is expiring in ${data.days_remaining} day${data.days_remaining > 1 ? "s" : ""}. Renew now to continue premium access.`
          );
        }
      } catch (error) {
        console.error(
          "Subscription expiry check failed:",
          error
        );
      }
    };

    checkSubscriptionExpiry();
  }, [userData]);

  // ========== HELPER FUNCTIONS ==========
  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Recently";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffHours < 1) return "Recently";
      else if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      else if (diffDays === 1) return "1 day ago";
      else if (diffDays < 7) return `${diffDays} days ago`;
      else return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (error) {
      return "Recently";
    }
  };

  const getFlagForCountry = (country) => {
    if (!country) return USAFlag;
    const countryLower = country.toLowerCase();
    if (countryLower.includes('usa') || countryLower.includes('united states') || countryLower.includes('manhattan')) return USAFlag;
    else if (countryLower.includes('uk') || countryLower.includes('united kingdom')) return UKFlag;
    else if (countryLower.includes('canada')) return CanadaFlag;
    return USAFlag;
  };

  const formatBudgetType = (budgetType) => {
    if (!budgetType) return 'Fixed-price';
    return budgetType === 'fixed' || budgetType === 'Fixed' ? 'Fixed-price' : 'Hourly';
  };

  const formatBudget = (job) => {
    const isFixed = job.budget_type === 'fixed' || job.budget_type === 'Fixed';
    
    if (isFixed) {
      if (job.budget_from !== null && job.budget_from > 0) {
        return `₹${job.budget_from}`;
      } else if (job.budget_to !== null && job.budget_to > 0) {
        return `₹${job.budget_to}`;
      }
      return '₹0';
    } else {
      if (job.budget_from !== null && job.budget_to !== null && job.budget_from !== job.budget_to) {
        return `₹${job.budget_from} - ₹${job.budget_to}`;
      } else if (job.budget_from !== null && job.budget_from > 0) {
        return `₹${job.budget_from}`;
      } else if (job.budget_to !== null && job.budget_to > 0) {
        return `₹${job.budget_to}`;
      }
      return '₹0';
    }
  };

  const formatRateType = (budgetType) => {
    if (!budgetType) return '₹ Fixed Rate';
    return budgetType === 'fixed' || budgetType === 'Fixed' ? '₹ Fixed Rate' : '₹ Hourly Rate';
  };

  const CountryFlag = ({ countryCode, country }) => {
    if (!countryCode) return (
      <img src={USAFlag} alt="USA" className="w-[18px] h-[12px] rounded-[4px] object-cover" />
    );
    return (
      <img
        src={`https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`}
        alt={country}
        title={country}
        className="w-[18px] h-[12px] rounded-[4px] object-cover"
        onError={(e) => { e.target.src = USAFlag; }}
      />
    );
  };

  const toggleDescription = (jobId, e) => {
    e.stopPropagation();
    setExpandedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) newSet.delete(jobId);
      else newSet.add(jobId);
      return newSet;
    });
  };

  const isValidGmail = (email) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;
    return email.toLowerCase().split('@')[1] === 'gmail.com';
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // ========== FETCH JOBS ==========
  useEffect(() => {
    if (!userData?.id) return;
    const fetchJobs = async () => {
      setLoading(true);
      try {
        let endpoint = '';
        switch (activeTab) {
          case "best": endpoint = `/collaborator/jobs/best-match/${userData.id}`; break;
          case "recent": endpoint = `/collaborator/jobs/recent/${userData.id}`; break;
          case "saved": endpoint = `/collaborator/jobs/saved/${userData.id}`; break;
          default: endpoint = `/collaborator/jobs/best-match/${userData.id}`;
        }
        const response = await api.get(endpoint);
        if (response.data && response.data.length > 0) {
          const jobsWithDetails = await Promise.all(
            response.data.map(async (job) => {
              try {
                let postedDate;
                if (activeTab === "saved") postedDate = job.saved_at || job.created_at;
                else if (activeTab === "recent") postedDate = job.viewed_at || job.created_at;
                else postedDate = job.created_at;

                const formattedBudget = formatBudget(job);
                const formattedBudgetType = formatBudgetType(job.budget_type);
                
                let country = job.creator_country || job.country || "Remote";
                let state = job.creator_state || job.state || "";
                let countryCode = job.creator_country_code || job.country_code;
                
                if (!country || country === "Unknown" || country === "null" || country === "") {
                  country = "Remote";
                  state = "";
                }
                
                const locationDisplay = state && state !== country && state.trim() 
                  ? `${state}, ${country}` 
                  : country;
                
                return {
                  ...job,
                  meta: `${formattedBudgetType} - ${job.expertise_level || 'Intermediate'} - Est. Budget: ${formattedBudget} - Posted ${formatTimeAgo(postedDate)}`,
                  rateType: formatRateType(job.budget_type),
                  rating: job.creator_rating || 0,
                  reviewsCount: job.creator_reviews_count || 0,
                  country: country,
                  state: state,
                  country_code: countryCode,
                  locationDisplay: locationDisplay,
                  posted_at: postedDate,
                  full_description: job.description || "No description available",
                  creator_name: job.employer_name || job.creator_name || "Anonymous",
                  status: job.status || 'active'
                };
              } catch (error) {
                console.error('Error processing job:', error);
                const formattedBudget = formatBudget(job);
                const formattedBudgetType = formatBudgetType(job.budget_type);
                
                return {
                  ...job,
                  meta: `${formattedBudgetType} - ${job.expertise_level || 'Intermediate'} - Est. Budget: ${formattedBudget} - Posted ${formatTimeAgo(job.created_at)}`,
                  rateType: formatRateType(job.budget_type),
                  rating: 0,
                  reviewsCount: 0,
                  country: "Remote",
                  state: null,
                  country_code: null,
                  locationDisplay: "Remote",
                  posted_at: job.created_at,
                  full_description: job.description || "No description available",
                  status: job.status || 'active'
                };
              }
            })
          );
          setJobs(jobsWithDetails);
        } else {
          setJobs([]);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast.error('Failed to load jobs');
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [activeTab, userData]);

  // ========== LOAD SAVED JOBS ==========
  useEffect(() => {
    if (!userData?.id) return;
    const loadSavedJobs = async () => {
      try {
        const response = await api.get(`/collaborator/jobs/saved/${userData.id}`);
        if (response.data && response.data.length > 0) {
          setSavedJobs(new Set(response.data.map(job => job.id)));
        }
      } catch (error) {
        console.error('Error loading saved jobs:', error);
      }
    };
    loadSavedJobs();
  }, [userData]);

  // ========== HANDLE SAVE JOB ==========
  const handleSaveJob = async (jobId, e) => {
    if (e) e.stopPropagation();
    if (!userData?.id) { toast.error('Please login to save jobs'); return; }
    try {
      const response = await api.post('/collaborator/jobs/toggle-save', null, {
        params: { user_id: userData.id, job_id: jobId }
      });
      if (response.data.status === 'saved') {
        setSavedJobs(prev => new Set([...prev, jobId]));
        toast.success('Job saved successfully');
      } else {
        setSavedJobs(prev => { const newSet = new Set(prev); newSet.delete(jobId); return newSet; });
        toast.info('Job removed from saved');
      }
    } catch (error) {
      console.error('Error toggling save job:', error);
      toast.error('Failed to save job');
    }
  };

  // ========== HANDLE LIKE JOB ==========
  const handleLikeJob = async (jobId, e) => {
    if (e) e.stopPropagation();
    if (!userData?.id) { toast.error('Please login to like jobs'); return; }

    const wasLiked = likedJobs.has(jobId);
    setLikedJobs(prev => {
      const newSet = new Set(prev);
      if (wasLiked) newSet.delete(jobId);
      else newSet.add(jobId);
      return newSet;
    });

    try {
      const response = await api.post(`/jobs/toggle-like/${userData.id}/${jobId}`);
      if (response.data.status === 'success') {
        setLikedJobs(new Set(response.data.liked_jobs || []));
        if (response.data.action === 'liked') toast.success('Job liked!');
        else toast.info('Job unliked');
      } else {
        setLikedJobs(prev => {
          const newSet = new Set(prev);
          if (wasLiked) newSet.add(jobId);
          else newSet.delete(jobId);
          return newSet;
        });
        toast.error(response.data.message || 'Failed to update like status');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      setLikedJobs(prev => {
        const newSet = new Set(prev);
        if (wasLiked) newSet.add(jobId);
        else newSet.delete(jobId);
        return newSet;
      });
      toast.error('Failed to like job. Please try again.');
    }
  };

  const handleTrackView = async (jobId) => {
    if (!userData?.id) return;
    try {
      await api.post('/collaborator/jobs/track-view', null, {
        params: { user_id: userData.id, job_id: jobId }
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const handleJobClick = (job) => {
    handleTrackView(job.id);
    navigate('/ux', {
      state: {
        jobId: job.id,
        job: job
      }
    });
  };

  // ========== SEARCH HANDLERS ==========
  const fetchSearchSuggestions = async (query) => {
    if (!query.trim()) {
      setSearchSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await api.get("/jobs/job-search-suggestions", {
        params: { search: query }
      });
      setSearchSuggestions(response.data || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSearchSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowSearchSuggestions(true);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchSearchSuggestions(query);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      const query = searchQuery.trim();
      if (query) {
        setShowSearchSuggestions(false);
        navigate('/collabration-filter', { state: { searchQuery: query } });
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSearchSuggestions(false);
    navigate('/collabration-filter', { state: { searchQuery: suggestion } });
  };

  const handleSearch = () => {
    const query = searchQuery.trim();
    if (!query) return;
    setShowSearchSuggestions(false);
    navigate('/collabration-filter', { state: { searchQuery: query } });
  };

  // ========== CONTRACT STATS (UPDATED) ==========
  const fetchContractStats = async () => {
    if (!userData?.id) return;
    try {
      // Fetch detailed status counts from /contracts/status-counts
      const statusCountsRes = await api.get(`/contracts/status-counts`, {
        params: { user_id: userData.id }
      });
      
      setContractStats({
        active: (statusCountsRes.data.in_progress || 0) + (statusCountsRes.data.awaiting || 0), // Active = in_progress + awaiting
        completed: statusCountsRes.data.completed || 0,
        awaiting: statusCountsRes.data.awaiting || 0,
        pending: statusCountsRes.data.pending || 0,
        inReview: statusCountsRes.data.in_review || 0,
        cancelled: statusCountsRes.data.cancelled || 0,
        total: statusCountsRes.data.total || 0
      });
    } catch (error) {
      console.error('Error fetching contract stats:', error);
      // Fallback: try the old endpoint if needed
      try {
        const statsRes = await api.get(`/jobs/contract-stats/${userData.id}/`);
        if (statsRes.data.status === 'success') {
          setContractStats(prev => ({
            ...prev,
            active: statsRes.data.active,
            completed: statsRes.data.completed,
            total: statsRes.data.total
          }));
        }
      } catch (fallbackError) {
        console.error('Fallback contract stats also failed:', fallbackError);
      }
    }
  };

  // ========== PROPOSAL + INVITATION STATS ==========
  const fetchProposalStats = async () => {
    if (!userData?.id) return;
    try {
      const [proposalsRes, invitationsRes] = await Promise.allSettled([
        api.get(`/proposals/GetMyProposals/${userData.id}`),
        api.get(`/invitations/list/${userData.id}`)
      ]);

      const submittedCount =
        proposalsRes.status === 'fulfilled'
          ? (proposalsRes.value.data?.proposals?.length || 0)
          : 0;

      const invitationsCount =
        invitationsRes.status === 'fulfilled'
          ? (invitationsRes.value.data?.count || invitationsRes.value.data?.invitations?.length || 0)
          : 0;

      setProposalStats({
        submitted: submittedCount,
        invitations: invitationsCount
      });
    } catch (error) {
      console.error('Error fetching proposal/invitation stats:', error);
    }
  };

  useEffect(() => {
    if (userData?.id) {
      fetchContractStats();
      fetchProposalStats();
    }
  }, [userData?.id]);

  const getDisplayDescription = (job) => {
    if (!job.full_description) return "No description available";
    if (expandedJobs.has(job.id) || job.full_description.length <= 200) return job.full_description;
    return `${job.full_description.substring(0, 200)}...`;
  };

  // ========== PAGINATION ==========
  const totalPages = Math.ceil(jobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentJobs = jobs.slice(startIndex, startIndex + itemsPerPage);

  const popupTotalPages = Math.ceil(jobs.length / popupItemsPerPage);
  const popupStartIndex = (popupCurrentPage - 1) * popupItemsPerPage;
  const currentPopupJobs = jobs.slice(popupStartIndex, popupStartIndex + popupItemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPopupPage = (page) => {
    if (page >= 1 && page <= popupTotalPages) setPopupCurrentPage(page);
  };

  // ========== VERIFICATION HANDLERS ==========
  const handleVerifyPhone = () => {
    const phone = userData?.phone_number || currentUser?.phone_number;
    if (!phone || !phone.trim()) {
      toast.error("Please add your phone number in profile settings first");
      setTimeout(() => navigate('/ColabProfile'), 2000);
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    setPhoneNumber(cleanPhone);
    setCurrentVerificationType('phone');
    setShowPhonePopup(true);
  };

  const handleVerifyEmail = () => {
    if (emailVerified) {
      toast.success('Email is already verified!');
      return;
    }
    const userEmail = userData?.email || currentUser?.email;
    if (!userEmail || !userEmail.trim()) {
      toast.error("Please add your email address in profile settings first");
      setTimeout(() => navigate('/ColabProfile'), 2000);
      return;
    }
    setEmail(userEmail);
    setCurrentVerificationType('email');
    setShowEmailPopup(true);
  };

  const handleSaveEmail = async () => {
    if (!isValidEmail(newEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    setIsSavingEmail(true);
    try {
      const response = await api.put(`/collaborator/edit/${userData.id}`, {
        email: newEmail,
      });
      if (response.data.status === 'success') {
        setEmail(newEmail);
        setShowEmailSetupPopup(false);
        toast.success('Email added successfully!');
        await fetchUserData();
        setCurrentVerificationType('email');
        setShowEmailPopup(true);
      }
    } catch (error) {
      console.error('Error saving email:', error);
      toast.error(error.response?.data?.detail || 'Failed to save email');
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handlePhoneSubmit = async () => {
    if (phoneNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    const userEmail = currentUser?.email || userData?.email;
    if (!userEmail) {
      toast.error('User email not found');
      return;
    }
    setIsVerifying(true);
    try {
      const fullPhoneNumber = `+91${phoneNumber}`;
      const response = await api.post('/verification/phone/send-otp', {
        email: userEmail,
        phone_number: fullPhoneNumber,
      });
      if (response.data.status === 'success') {
        setOtpToken(response.data.otp_token);
        setCooldownToken(response.data.cooldown_token);
        setShowPhonePopup(false);
        setShowOTPPopup(true);
        toast.success('OTP sent to your phone');
        setResendTime(45);
        setOtp(['', '', '', '', '', '']);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      if (error.response?.status === 429) {
        const errorMessage = error.response?.data?.detail || 'Please wait before requesting another OTP';
        toast.error(errorMessage);
        const match = errorMessage.match(/(\d+)\s*seconds?/);
        if (match && match[1]) {
          const remainingSeconds = parseInt(match[1]);
          if (remainingSeconds > 0 && remainingSeconds < 60) {
            setRateLimitError(`Please wait ${remainingSeconds} seconds before trying again`);
          }
        }
      } else if (error.response?.data?.detail) {
        if (error.response.data.detail.includes('Please add your phone number')) {
          toast.error(error.response.data.detail);
          setTimeout(() => navigate('/ColabProfile'), 2000);
        } else {
          toast.error(error.response.data.detail);
        }
      } else {
        toast.error('Failed to send OTP. Please try again.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleEmailSubmit = async () => {
    const registeredEmail = userData?.email || currentUser?.email;
    if (!registeredEmail) {
      toast.error('No registered email found. Please contact support.');
      return;
    }
    setEmail(registeredEmail);
    if (!isValidGmail(registeredEmail)) {
      toast.error('Your registered email must be a Gmail address');
      return;
    }
    if (isVerifying) return;
    setIsVerifying(true);
    try {
      const response = await api.post('/verification/email/send-otp', {
        email: registeredEmail,
      });
      if (response.data.status === 'success') {
        setOtpToken(response.data.otp_token);
        setCooldownToken(response.data.cooldown_token);
        setShowEmailPopup(false);
        setShowOTPPopup(true);
        toast.success('OTP sent to your email');
        setResendTime(45);
        setOtp(['', '', '', '', '', '']);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      if (error.response?.status === 429) {
        const errorMessage = error.response?.data?.detail || 'Too many requests. Please wait before trying again.';
        toast.error(errorMessage);
        const match = errorMessage.match(/(\d+)\s*seconds?/);
        if (match && match[1]) {
          const remainingSeconds = parseInt(match[1]);
          if (remainingSeconds > 0 && remainingSeconds <= 60) {
            setResendTime(remainingSeconds);
            setRateLimitError(errorMessage);
          }
        }
      } else if (error.response?.status === 400) {
        toast.error(error.response?.data?.detail || 'Invalid email address');
      } else if (error.response?.status === 404) {
        toast.error('Email not found. Please sign up first.');
      } else {
        toast.error(error.response?.data?.detail || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter complete 6-digit OTP');
      return;
    }
    if (!otpToken) {
      toast.error('Invalid session. Please request a new OTP.');
      return;
    }
    setIsVerifying(true);
    try {
      const endpoint = currentVerificationType === 'phone'
        ? '/verification/phone/verify-otp'
        : '/verification/email/verify-otp';
      const userEmail = currentUser?.email || userData?.email;
      const payload = currentVerificationType === 'phone'
        ? { email: userEmail, otp_code: otpString }
        : { email: email, otp_code: otpString };
      const response = await api.post(`${endpoint}?otp_token=${otpToken}`, payload);
      if (response.data.status === 'success') {
        if (currentVerificationType === 'phone') {
          setPhoneVerified(true);
          setCurrentUser((prev) => ({ ...prev, phone_verified: true }));
        } else {
          setEmailVerified(true);
          setCurrentUser((prev) => ({ ...prev, email_verified: true }));
          await fetchUserData();
        }
        setShowOTPPopup(false);
        setShowSuccessPopup(true);
        setOtp(['', '', '', '', '', '']);
        setResendTime(45);
        setOtpToken('');
        setCooldownToken('');
        toast.success(`${currentVerificationType === 'phone' ? 'Phone' : 'Email'} verified successfully!`);
      } else {
        toast.error('Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error(error.response?.data?.detail || 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (isVerifying) return;
    if (resendTime > 0) {
      toast.error(`Please wait ${resendTime} seconds before requesting another OTP`);
      return;
    }
    setIsVerifying(true);
    try {
      if (currentVerificationType === 'phone') {
        const fullPhoneNumber = `+91${phoneNumber}`;
        const userEmail = currentUser?.email || userData?.email;
        const response = await api.post('/verification/phone/send-otp', {
          email: userEmail,
          phone_number: fullPhoneNumber,
        }, {
          headers: cooldownToken ? { 'X-Cooldown-Token': cooldownToken } : {}
        });
        if (response.data.status === 'success') {
          setOtpToken(response.data.otp_token);
          if (response.data.cooldown_token) setCooldownToken(response.data.cooldown_token);
          toast.success('OTP resent to your phone!');
          setResendTime(45);
          setOtp(['', '', '', '', '', '']);
          setTimeout(() => document.getElementById('otp-0')?.focus(), 100);
        }
      } else {
        const registeredEmail = userData?.email || currentUser?.email;
        if (!registeredEmail) {
          toast.error('No registered email found');
          setIsVerifying(false);
          return;
        }
        const response = await api.post('/verification/email/send-otp', {
          email: registeredEmail,
        }, {
          headers: cooldownToken ? { 'X-Cooldown-Token': cooldownToken } : {}
        });
        if (response.data.status === 'success') {
          setOtpToken(response.data.otp_token);
          if (response.data.cooldown_token) setCooldownToken(response.data.cooldown_token);
          toast.success('OTP resent to your email!');
          setResendTime(45);
          setOtp(['', '', '', '', '', '']);
          setTimeout(() => document.getElementById('otp-0')?.focus(), 100);
        }
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      if (error.response?.status === 429) {
        const errorMessage = error.response?.data?.detail || 'Please wait before requesting another OTP';
        toast.error(errorMessage);
        const match = errorMessage.match(/(\d+)\s*seconds?/);
        if (match && match[1]) {
          const remainingSeconds = parseInt(match[1]);
          if (remainingSeconds > 0 && remainingSeconds <= 60) {
            setResendTime(remainingSeconds);
            setRateLimitError(errorMessage);
          }
        }
      } else if (error.response?.status === 404) {
        toast.error('Service unavailable. Please try again later.');
      } else if (error.response?.status === 400) {
        toast.error(error.response?.data?.detail || 'Invalid request. Please check your details.');
      } else {
        toast.error(error.response?.data?.detail || 'Failed to resend OTP. Please try again.');
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
      if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const getProfileCompletion = () => {
    if (!userData) return 0;
    let base = 80;
    if (phoneVerified) base += 10;
    if (emailVerified) base += 10;
    return Math.min(base, 100);
  };

  const profilePercent = getProfileCompletion();

  return (
    <div className="w-full min-h-screen flex flex-col overflow-x-hidden">
      <section className="w-full flex flex-col items-center justify-start relative">

        {/* Background */}
        <div
          className="absolute top-[-104px] left-0 w-full h-[500px] md:h-[582px] z-0"
          style={{
            backgroundImage: `url(${HomeBg})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="absolute inset-0 bg-black opacity-30" />
        </div>

        {/* Welcome + Search */}
        <div className="absolute top-[150px] md:top-[187px] w-full px-4 flex flex-col items-center justify-center gap-4 md:gap-[24px] z-10">
          <h1
            className="text-3xl sm:text-4xl md:text-[48px] leading-tight md:leading-[100%] text-center text-white font-normal"
            style={{ fontFamily: "Milonga" }}
          >
            Welcome back,<br />
            {getUserDisplayName()}
          </h1>

          {/* SEARCH BAR */}
          <div className="relative w-full max-w-[890px]">
            <div className="h-[44px] md:h-[48px] flex flex-row items-center bg-white border border-[#6D3BC1] rounded-[10px] overflow-hidden">
              <input
                type="text"
                placeholder="Search Jobs"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onFocus={() => setShowSearchSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                onKeyPress={handleKeyPress}
                className="flex-1 h-full px-4 md:px-6 text-[14px] md:text-[15px] text-gray-600 outline-none bg-transparent placeholder:text-gray-400"
              />
              <button
                onClick={handleSearch}
                className="h-full px-4 sm:px-6 md:px-10 text-[14px] md:text-[15px] font-medium text-white bg-gradient-to-br from-[#4B1D8C] to-[#2B0A4F] rounded-r-[10px] flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                </svg>
                <span className="hidden xs:inline sm:inline">Search</span>
              </button>
            </div>

            {showSearchSuggestions && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-80 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 mx-auto"></div>
                  </div>
                ) : searchSuggestions.length > 0 ? (
                  <>
                    {searchSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span>{suggestion}</span>
                      </button>
                    ))}
                    <div className="border-t border-gray-200 p-2 text-center">
                      <button onClick={handleSearch} className="text-sm text-purple-600 hover:text-purple-800">
                        Search for "{searchQuery}" →
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No suggestions found
                    <button onClick={handleSearch} className="block w-full mt-2 text-sm text-purple-600 hover:text-purple-800">
                      Search for "{searchQuery}"
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <Header />

        {/* Main Content */}
        <div className="w-full max-w-[2440px] mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8 mt-[350px] md:mt-[412px] pb-[100px] relative px-4 sm:px-6 lg:px-8">

          {/* Right Sidebar */}
          <div className="w-full lg:w-[400px] xl:w-[392px] flex-shrink-0 order-1 lg:order-2">
            <div className="flex flex-col gap-4 sm:gap-[30px]">

              {/* Profile Completion Card */}
              <div className="w-full h-auto opacity-100 rounded-[10px] bg-white shadow-[0px_4px_45px_0px_#0000001F] flex flex-col items-center p-4 sm:p-6">
                <div className="w-full flex items-center gap-3 mb-3 lg:hidden">
                  <div className="w-[45px] h-[45px] rounded-full overflow-hidden flex-shrink-0 border-2 border-[#51218F]">
                    <img src={userData?.profile_picture || Dp1} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[18px] leading-[120%] text-[#2A1E17]">{getUserDisplayName()}</h3>
                    <p className="font-medium text-[12px] leading-[100%] text-[#2A1E17E5] mt-1">Collaborator</p>
                  </div>
                </div>
                <div className="hidden lg:block w-full">
                  <div className="w-full mb-2">
                    <h3 className="font-bold text-[22px] leading-[100%] text-[#2A1E17] text-center">{getUserDisplayName()}</h3>
                  </div>
                  <div className="w-full mb-6">
                    <p className="font-medium text-[14px] leading-[100%] text-[#2A1E17E5] text-center">Collaborator</p>
                  </div>
                </div>
                <div className="w-full flex justify-between items-center mb-2 sm:mb-4">
                  <span className="font-bold text-[12px] sm:text-[14px] leading-[100%] text-[#2A1E17]">Set up your account</span>
                  <span className="font-bold text-[12px] sm:text-[14px] leading-[100%] text-[#2A1E17]">{profilePercent}%</span>
                </div>
                <div className="w-full h-[4px] sm:h-[6px] opacity-100 mb-4 sm:mb-8 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${profilePercent}%`, backgroundColor: '#51218F' }} />
                </div>
                <button
                  onClick={() => navigate('/ColabProfile')}
                  className={`w-full max-w-[180px] sm:max-w-[210px] h-[32px] sm:h-[39px] opacity-100 rounded-[100px] flex items-center justify-center px-[24px] sm:px-[36px] py-[8px] sm:py-[12px] gap-[8px] sm:gap-[10px] bg-transparent transition-all duration-200 cursor-pointer mb-2 sm:mb-3 group ${profilePercent === 100 ? 'border border-green-500 hover:bg-green-500' : 'border border-black hover:border-[#51218F]'}`}
                  style={{ backgroundColor: 'transparent', color: profilePercent === 100 ? '#10B981' : '#51218F' }}
                  onMouseEnter={(e) => {
                    if (profilePercent !== 100) { e.currentTarget.style.backgroundColor = '#51218F'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#51218F'; }
                    else { e.currentTarget.style.backgroundColor = '#10B981'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#10B981'; }
                  }}
                  onMouseLeave={(e) => {
                    if (profilePercent !== 100) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#51218F'; e.currentTarget.style.borderColor = 'black'; }
                    else { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#10B981'; e.currentTarget.style.borderColor = '#10B981'; }
                  }}
                >
                  <span className="font-bold text-[11px] sm:text-[12px] leading-[100%] whitespace-nowrap">
                    {profilePercent === 100 ? 'Completed successfully!' : 'Complete your profile'}
                  </span>
                </button>
                <div className="w-full opacity-100">
                  <p className="font-normal italic text-[10px] sm:text-[12px] leading-[120%] sm:leading-[100%] text-[#2A1E17E5] text-center px-2">
                    {profilePercent === 100 ? "🎉 Great! Your profile is now 100% complete!" : `${100 - profilePercent}% more to complete your profile will help you get more reach.`}
                  </p>
                </div>
              </div>

              {/* Promo Card - FIXED ARROW (perfectly round on all screens) */}
              <button
                className="relative w-full p-0 border-none bg-transparent cursor-pointer group overflow-visible"
                onClick={() => { navigate("/collab-subscription"); window.scrollTo(0, 0); }}
                style={{ animation: 'pulse 2s infinite', transition: 'all 0.3s ease' }}
              >
                <div className="relative w-full overflow-visible">
                  <div
                    className="w-full h-[80px] min-[400px]:h-[85px] sm:h-auto sm:min-h-[98px] opacity-100 rounded-[8px] sm:rounded-[10px] shadow-[0px_4px_45px_0px_#0000001F] overflow-visible relative p-2 sm:p-6 flex items-center"
                    style={{ background: 'linear-gradient(266.38deg, #51218F 4.44%, #020202 100.18%)' }}
                  >
                    <div className="absolute inset-0 z-0 rounded-[8px] sm:rounded-[10px] overflow-hidden">
                      <img src={HomeSub} alt="Promotional background" className="w-full h-full object-cover" style={{ opacity: '0.3' }} />
                    </div>
                    <div className="relative z-10 w-full flex items-center pr-[70px] min-[400px]:pr-[75px] sm:pr-[70px] lg:pr-[110px]">
                      <div>
                        <div className="font-medium text-[13px] min-[400px]:text-[14px] sm:text-[18px] leading-tight text-white">Get Subscription</div>
                        <div className="font-medium text-[13px] min-[400px]:text-[14px] sm:text-[18px] leading-tight text-white">more revenue in a month</div>
                      </div>
                    </div>
                  </div>
                  {/* Arrow – perfectly round, no overflow */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 right-[-6px] sm:right-[-8px] md:right-[-10px] lg:right-[-8px] w-[50px] h-[50px] min-[400px]:w-[60px] min-[400px]:h-[60px] sm:w-[70px] sm:h-[70px] md:w-[80px] md:h-[80px] lg:w-[90px] lg:h-[90px] rounded-full flex items-center justify-center z-20 shadow-lg"
                    style={{ background: 'linear-gradient(180deg, #FFA412 0%, #6C4343 100%)' }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </div>
                </div>
              </button>

              <style>{`
                @keyframes pulse {
                  0% { box-shadow: 0 0 0 0 rgba(81, 33, 143, 0.4); }
                  70% { box-shadow: 0 0 0 12px rgba(81, 33, 143, 0); }
                  100% { box-shadow: 0 0 0 0 rgba(81, 33, 143, 0); }
                }
              `}</style>

              {/* ===== MOBILE: Verification + Contracts (FIXED: vertical list for contracts) ===== */}
              <div className="flex flex-row gap-3 w-full lg:hidden">

                {/* Verification Card - Mobile */}
                <div className="w-1/2 h-auto opacity-100 bg-white rounded-[10px] shadow-[0px_4px_45px_0px_#0000001F] p-3">
                  <div className="w-full mb-1">
                    <h3 className="font-semibold text-[15px] leading-[100%] text-[#2A1E17]">Verification</h3>
                  </div>
                  <div className="w-full h-[0px] opacity-100 mb-3 border-b border-[#0000001A]" />
                  <div className="w-full mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-[14px] h-[14px]">
                        {phoneVerified ? (
                          <svg className="w-[14px] h-[14px]" fill="currentColor" viewBox="0 0 20 20">
                            <circle cx="10" cy="10" r="9" fill="#10B981" />
                            <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2A1E17" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                        )}
                      </div>
                      <span className="font-outfit font-normal text-[11px] leading-[100%] text-[#2A1E17]">Phone</span>
                    </div>
                    <div className="flex items-center">
                      {phoneVerified ? (
                        <span className="font-medium text-[11px] leading-[100%] text-green-600">Verified</span>
                      ) : (
                        <button onClick={handleVerifyPhone} className="bg-transparent hover:opacity-80 transition-opacity cursor-pointer">
                          <span className="font-medium text-[11px] leading-[100%] text-[#51218F] whitespace-nowrap">Verify</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-[14px] h-[14px]">
                        {emailVerified ? (
                          <svg className="w-[14px] h-[14px]" fill="currentColor" viewBox="0 0 20 20">
                            <circle cx="10" cy="10" r="9" fill="#10B981" />
                            <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2A1E17" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                        )}
                      </div>
                      <span className="font-outfit font-normal text-[11px] leading-[100%] text-[#2A1E17]">Email</span>
                    </div>
                    <div className="flex items-center">
                      {emailVerified ? (
                        <span className="font-medium text-[11px] leading-[100%] text-green-600">Verified</span>
                      ) : (
                        <button onClick={handleVerifyEmail} className="bg-transparent hover:opacity-80 transition-opacity cursor-pointer">
                          <span className="font-medium text-[11px] leading-[100%] text-[#51218F] whitespace-nowrap">Verify</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* ===== Contracts Stats Card - Mobile (FIXED: vertical list, all stats visible) ===== */}
                <div className="w-1/2 h-auto opacity-100 rounded-[10px] bg-white shadow-lg p-3">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-montserrat font-medium text-[15px] leading-[100%] text-[#2A1E17]">Contracts</h3>
                  </div>
                  <div className="flex flex-col gap-2 mb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-[14px] h-[14px] flex items-center justify-center">
                          <img src={Folder} alt="Active" className="w-full h-full object-contain" />
                        </div>
                        <p className="font-montserrat text-[11px] leading-[100%] text-[#2A1E17E5]">
                          <span className="font-bold">Active:</span>
                        </p>
                      </div>
                      <span className="font-montserrat font-semibold text-[11px] text-[#51218F]">{contractStats.active}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-[14px] h-[14px] flex items-center justify-center">
                          <img src={Cloud} alt="Completed" className="w-full h-full object-contain" />
                        </div>
                        <p className="font-montserrat text-[11px] leading-[100%] text-[#2A1E17E5]">
                          <span className="font-bold">Completed:</span>
                        </p>
                      </div>
                      <span className="font-montserrat font-semibold text-[11px] text-[#51218F]">{contractStats.completed}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-[14px] h-[14px] flex items-center justify-center">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#51218F" strokeWidth="2">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </div>
                        <p className="font-montserrat text-[11px] leading-[100%] text-[#2A1E17E5]">
                          <span className="font-bold">Awaiting:</span>
                        </p>
                      </div>
                      <span className="font-montserrat font-semibold text-[11px] text-[#51218F]">{contractStats.awaiting}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-[14px] h-[14px] flex items-center justify-center">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#51218F" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                        </div>
                        <p className="font-montserrat text-[11px] leading-[100%] text-[#2A1E17E5]">
                          <span className="font-bold">Pending:</span>
                        </p>
                      </div>
                      <span className="font-montserrat font-semibold text-[11px] text-[#51218F]">{contractStats.pending}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-[14px] h-[14px] flex items-center justify-center">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#51218F" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          </svg>
                        </div>
                        <p className="font-montserrat text-[11px] leading-[100%] text-[#2A1E17E5]">
                          <span className="font-bold">In Review:</span>
                        </p>
                      </div>
                      <span className="font-montserrat font-semibold text-[11px] text-[#51218F]">{contractStats.inReview}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-[14px] h-[14px] flex items-center justify-center">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#51218F" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </div>
                        <p className="font-montserrat text-[11px] leading-[100%] text-[#2A1E17E5]">
                          <span className="font-bold">Cancelled:</span>
                        </p>
                      </div>
                      <span className="font-montserrat font-semibold text-[11px] text-[#51218F]">{contractStats.cancelled}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-[14px] h-[14px] flex items-center justify-center">
                          <img src={Cancel} alt="Proposals" className="w-full h-full object-contain" />
                        </div>
                        <p className="font-montserrat text-[11px] leading-[100%] text-[#2A1E17E5]">
                          <span className="font-bold">Proposals:</span>
                        </p>
                      </div>
                      <span className="font-montserrat font-semibold text-[11px] text-[#51218F]">{proposalStats.submitted}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-[14px] h-[14px] flex items-center justify-center">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#51218F" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                        </div>
                        <p className="font-montserrat text-[11px] leading-[100%] text-[#2A1E17E5]">
                          <span className="font-bold">Invitations:</span>
                        </p>
                      </div>
                      <span className="font-montserrat font-semibold text-[11px] text-[#51218F]">{proposalStats.invitations}</span>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={() => navigate('/all-contacts')}
                      className="w-[90px] sm:w-[100px] md:w-[122px] h-[32px] sm:h-[35px] md:h-[39px] opacity-100 rounded-[100px] flex items-center justify-center px-[16px] sm:px-[24px] md:px-[36px] py-[8px] sm:py-[10px] md:py-[12px] bg-[#51218F] hover:bg-[#6D28D9] transition-all duration-200 cursor-pointer group border border-[#51218F]"
                    >
                      <span className="font-montserrat font-bold text-[10px] sm:text-[11px] md:text-[12px] leading-[100%] text-white whitespace-nowrap">
                        View all
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ===== DESKTOP: Verification + Contracts stacked (unchanged) ===== */}
              <div className="hidden lg:flex lg:flex-col gap-[30px]">

                {/* Verification Card - Desktop */}
                <div className="w-full h-auto min-h-[242px] opacity-100 bg-white rounded-[10px] shadow-[0px_4px_45px_0px_#0000001F] p-6">
                  <div className="w-full mb-2">
                    <h3 className="font-semibold text-[20px] leading-[100%] text-[#2A1E17]">Verification</h3>
                  </div>
                  <div className="w-full h-[0px] opacity-100 mb-6 border-b border-[#0000001A]" />
                  <div className="w-full mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-[12px]">
                      <div className="w-[20px] h-[20px]">
                        {phoneVerified ? (
                          <svg className="w-[20px] h-[20px]" fill="currentColor" viewBox="0 0 20 20">
                            <circle cx="10" cy="10" r="9" fill="#10B981" />
                            <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2A1E17" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                        )}
                      </div>
                      <span className="font-outfit font-normal text-[16px] leading-[100%] text-[#2A1E17]">Phone Verification</span>
                    </div>
                    {phoneVerified ? (
                      <span className="font-medium text-[16px] leading-[100%] text-green-600">Verified</span>
                    ) : (
                      <button onClick={handleVerifyPhone} className="bg-transparent hover:opacity-80 transition-opacity cursor-pointer">
                        <span className="font-medium text-[16px] leading-[100%] text-[#51218F] whitespace-nowrap">Verify</span>
                      </button>
                    )}
                  </div>
                  <div className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-[12px]">
                      <div className="w-[20px] h-[20px]">
                        {emailVerified ? (
                          <svg className="w-[20px] h-[20px]" fill="currentColor" viewBox="0 0 20 20">
                            <circle cx="10" cy="10" r="9" fill="#10B981" />
                            <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2A1E17" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                        )}
                      </div>
                      <span className="font-outfit font-normal text-[16px] leading-[100%] text-[#2A1E17]">Email Verification</span>
                    </div>
                    {emailVerified ? (
                      <span className="font-medium text-[16px] leading-[100%] text-green-600">Verified</span>
                    ) : (
                      <button onClick={handleVerifyEmail} className="bg-transparent hover:opacity-80 transition-opacity cursor-pointer">
                        <span className="font-medium text-[16px] leading-[100%] text-[#51218F] whitespace-nowrap">Verify</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* ===== Contracts Stats Card - Desktop ===== */}
                <div className="w-full h-auto opacity-100 rounded-[10px] bg-white shadow-lg p-6">
                  <div className="flex flex-wrap justify-between items-center mb-6">
                    <h3 className="font-montserrat font-medium text-[20px] leading-[100%] text-[#2A1E17]">My Contracts</h3>
                  </div>
                  <div className="space-y-5 mb-8">
                    {/* Active contracts */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-[20px] h-[19px] mr-3 flex items-center justify-center flex-shrink-0">
                          <img src={Folder} alt="Active contracts" className="w-full h-full object-contain" />
                        </div>
                        <p className="font-montserrat text-[16px] leading-[100%] text-[#2A1E17E5]">
                          <span className="font-bold">Active contracts</span>
                        </p>
                      </div>
                      <span className="font-montserrat font-bold text-[18px] leading-[100%] text-[#51218F]">{contractStats.active}</span>
                    </div>
                    {/* Completed */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-[20px] h-[19px] mr-3 flex items-center justify-center flex-shrink-0">
                          <img src={Cloud} alt="Completed" className="w-full h-full object-contain" />
                        </div>
                        <p className="font-montserrat text-[16px] leading-[100%] text-[#2A1E17E5]">
                          <span className="font-bold">Completed</span>
                        </p>
                      </div>
                      <span className="font-montserrat font-bold text-[18px] leading-[100%] text-[#51218F]">{contractStats.completed}</span>
                    </div>
                    {/* Awaiting */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-[20px] h-[19px] mr-3 flex items-center justify-center flex-shrink-0">
                          <svg width="20" height="19" viewBox="0 0 24 24" fill="none" stroke="#51218F" strokeWidth="2">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </div>
                        <p className="font-montserrat text-[16px] leading-[100%] text-[#2A1E17E5]">
                          <span className="font-bold">Awaiting</span>
                        </p>
                      </div>
                      <span className="font-montserrat font-bold text-[18px] leading-[100%] text-[#51218F]">{contractStats.awaiting}</span>
                    </div>
                    {/* Pending */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-[20px] h-[19px] mr-3 flex items-center justify-center flex-shrink-0">
                          <svg width="20" height="19" viewBox="0 0 24 24" fill="none" stroke="#51218F" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                        </div>
                        <p className="font-montserrat text-[16px] leading-[100%] text-[#2A1E17E5]">
                          <span className="font-bold">Pending</span>
                        </p>
                      </div>
                      <span className="font-montserrat font-bold text-[18px] leading-[100%] text-[#51218F]">{contractStats.pending}</span>
                    </div>
                    {/* In Review */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-[20px] h-[19px] mr-3 flex items-center justify-center flex-shrink-0">
                          <svg width="20" height="19" viewBox="0 0 24 24" fill="none" stroke="#51218F" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          </svg>
                        </div>
                        <p className="font-montserrat text-[16px] leading-[100%] text-[#2A1E17E5]">
                          <span className="font-bold">In Review</span>
                        </p>
                      </div>
                      <span className="font-montserrat font-bold text-[18px] leading-[100%] text-[#51218F]">{contractStats.inReview}</span>
                    </div>
                    {/* Cancelled */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-[20px] h-[19px] mr-3 flex items-center justify-center flex-shrink-0">
                          <svg width="20" height="19" viewBox="0 0 24 24" fill="none" stroke="#51218F" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </div>
                        <p className="font-montserrat text-[16px] leading-[100%] text-[#2A1E17E5]">
                          <span className="font-bold">Cancelled</span>
                        </p>
                      </div>
                      <span className="font-montserrat font-bold text-[18px] leading-[100%] text-[#51218F]">{contractStats.cancelled}</span>
                    </div>
                    {/* Proposals sent */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-[20px] h-[19px] mr-3 flex items-center justify-center flex-shrink-0">
                          <img src={Cancel} alt="Proposals" className="w-full h-full object-contain" />
                        </div>
                        <p className="font-montserrat text-[16px] leading-[100%] text-[#2A1E17E5]">
                          <span className="font-bold">Proposals sent</span>
                        </p>
                      </div>
                      <span className="font-montserrat font-bold text-[18px] leading-[100%] text-[#51218F]">{proposalStats.submitted}</span>
                    </div>
                    {/* Invitations */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-[20px] h-[19px] mr-3 flex items-center justify-center flex-shrink-0">
                          <svg width="20" height="19" viewBox="0 0 24 24" fill="none" stroke="#51218F" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                        </div>
                        <p className="font-montserrat text-[16px] leading-[100%] text-[#2A1E17E5]">
                          <span className="font-bold">Invitations</span>
                        </p>
                      </div>
                      <span className="font-montserrat font-bold text-[18px] leading-[100%] text-[#51218F]">{proposalStats.invitations}</span>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={() => navigate('/all-contacts')}
                      className="w-[122px] h-[39px] opacity-100 rounded-[100px] flex items-center justify-center px-[36px] py-[12px] gap-[10px] bg-[#51218F] hover:bg-[#6D28D9] transition-all duration-200 cursor-pointer group border border-[#51218F]"
                    >
                      <span className="font-montserrat font-bold text-[12px] leading-[100%] text-white whitespace-nowrap">
                        View all
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Left Column - Job Listings */}
          <div className="w-full lg:flex-1 min-w-0 order-2 lg:order-1">
            <div className="mb-6">
              <h2 className="font-['Montserrat'] font-bold text-[20px] leading-[100%] text-[#2A1E17]">Jobs you might like</h2>
            </div>

            {/* Tabs */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-6 sm:gap-8 md:gap-16 text-[14px] md:text-[15px]">
                {["recent", "best", "saved"].map((tab) => (
                  <span
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="cursor-pointer relative pb-3 font-semibold capitalize"
                  >
                    {tab === "best" ? "Best match" : tab === "saved" ? `Saved (${savedJobs.size})` : "Recent"}
                    <span className={`absolute left-0 -bottom-[6px] h-[3px] w-full rounded-full transition-all ${activeTab === tab ? "bg-red-500" : "bg-transparent"}`} />
                  </span>
                ))}
              </div>
              <div className="mt-1 h-[2px] bg-gray-200 w-full" />
            </div>

            {/* Job Cards */}
            <div className="w-full h-auto p-4 sm:p-6 md:p-[39px_47px] gap-[30px] opacity-100 rounded-[10px] shadow-[0_4px_45px_0_#0000001F] flex flex-col bg-white">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Jobs Found</h3>
                  <p className="text-gray-500">
                    {activeTab === "saved" ? "You haven't saved any jobs yet."
                      : activeTab === "recent" ? "You haven't viewed any jobs recently."
                        : "No matching jobs found for your profile."}
                  </p>
                </div>
              ) : (
                <>
                  {currentJobs.map((job, index) => (
  <div
    key={job.id || index}
    className={`
      ${index !== currentJobs.length - 1 ? 'mb-6 sm:mb-8' : ''}
      cursor-pointer
      transition-all duration-300
    `}
    onClick={() => handleJobClick(job)}
  >
    <div className={`
  relative flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-6
  p-4 sm:p-5 md:p-6
  rounded-[12px] sm:rounded-[16px]
  bg-white
  transition-all duration-300
  hover:shadow-[0_10px_35px_rgba(81,33,143,0.25)]
  hover:-translate-y-1
  shadow-[0_6px_20px_rgba(81,33,143,0.12)]
  ${index !== currentJobs.length - 1 ? 'mb-6 sm:mb-8' : ''}
`}>
      {/* Job Content - Takes full width on mobile, flex-1 on desktop */}
      <div className="flex-1 w-full pr-[70px] sm:pr-0">
        <h3 className="font-semibold text-[16px] sm:text-[17px] mb-2 text-[#2A1E17] break-words whitespace-normal">
          {job.title}
        </h3>
        <p className="text-[12px] sm:text-[14px] text-gray-500 mb-2 break-words">{job.meta}</p>
        <p className="text-[14px] sm:text-[16px] text-gray-600 mb-4 leading-relaxed break-words">
          {getDisplayDescription(job)}
          {job.full_description && job.full_description.length > 200 && (
            <span className="text-[#4B1D8C] font-medium cursor-pointer ml-1" onClick={(e) => toggleDescription(job.id, e)}>
              {expandedJobs.has(job.id) ? 'less' : 'more'}
            </span>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-[12px] sm:text-[14px] text-gray-500">
          <span className="text-[#4B1D8C] font-medium">{job.rateType}</span>
          <span className="text-yellow-500 text-[14px] whitespace-nowrap">
            {"★".repeat(Math.floor(job.rating || 0))}
            {"☆".repeat(5 - Math.floor(job.rating || 0))}
          </span>
          <span className="text-gray-600 whitespace-nowrap">
            {(job.rating || 0).toFixed(1)}/5 ({job.reviewsCount || 0} {job.reviewsCount === 1 ? 'review' : 'reviews'})
          </span>
          <div className="flex items-center gap-2">
            {job.country && job.country !== "Remote" && job.country_code ? (
              <CountryFlag countryCode={job.country_code} country={job.country} />
            ) : (
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="break-words">{job.locationDisplay || "Remote"}</span>
          </div>
        </div>
      </div>
      
      {/* Action Buttons - Positioned absolutely on mobile, relative on desktop */}
      <div className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 sm:flex-shrink-0 flex gap-1 sm:gap-2 md:gap-3" onClick={(e) => e.stopPropagation()}>
        {/* Save Button */}
        <div
          className="w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] md:w-[46px] md:h-[46px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 relative group shadow-md"
          style={{ backgroundColor: savedJobs.has(job.id) ? '#FF0000' : '#C4C4C466' }}
          onClick={(e) => handleSaveJob(job.id, e)}
        >
          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-5 md:h-5" fill={savedJobs.has(job.id) ? "white" : "none"} stroke={savedJobs.has(job.id) ? "white" : "#51218F"} strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden sm:block">
            {savedJobs.has(job.id) ? "Remove from saved" : "Save job"}
          </div>
        </div>
        
        {/* Like Button */}
        <div
          className="w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] md:w-[46px] md:h-[46px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 relative group shadow-md"
          style={{ backgroundColor: likedJobs.has(job.id) ? '#51218F' : '#C4C4C466' }}
          onClick={(e) => handleLikeJob(job.id, e)}
        >
          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-5 md:h-5" fill={likedJobs.has(job.id) ? "white" : "none"} stroke={likedJobs.has(job.id) ? "white" : "#51218F"} strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden sm:block">
            {likedJobs.has(job.id) ? "Unlike" : "Like"}
          </div>
        </div>
      </div>
    </div>
  </div>
))}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded-md transition-colors ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      >
                        Previous
                      </button>
                      {[...Array(totalPages)].map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => goToPage(idx + 1)}
                          className={`px-3 py-1 rounded-md transition-colors ${currentPage === idx + 1 ? 'bg-[#51218F] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded-md transition-colors ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========== ALL JOBS POPUP ========== */}
      {showAllJobsPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <button
              onClick={() => setShowAllJobsPopup(false)}
              className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#51218F] to-[#2a0e4a] text-white hover:opacity-90 transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="px-6 pt-12 pb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">All Jobs</h2>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center text-gray-500 py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
                    Loading jobs...
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No jobs found.</p>
                  </div>
                ) : (
                  <>
                    {currentPopupJobs.map((job, i) => (
                      <div key={job.id} className={`pb-3 ${i < currentPopupJobs.length - 1 ? "border-b border-gray-200" : ""}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-[16px] text-[#2A1E17] mb-1">{job.title}</h3>
                            <p className="text-xs text-gray-600 mb-1">{job.meta}</p>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${job.status === 'active' || job.status === 'posted' ? 'bg-green-100 text-green-700' : job.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                            {job.status === 'posted' ? 'Active' : job.status ? job.status.charAt(0).toUpperCase() + job.status.slice(1) : 'Active'}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed mt-2 mb-2 text-sm">
                          {expandedDescJobId === job.id
                            ? job.full_description || "No description available"
                            : `${job.full_description?.slice(0, 120) || "No description available"}...`}
                          {job.full_description && job.full_description.length > 120 && (
                            <button
                              onClick={() => setExpandedDescJobId(expandedDescJobId === job.id ? null : job.id)}
                              className="text-[#51218F] ml-1 font-medium text-xs hover:underline"
                            >
                              {expandedDescJobId === job.id ? "Show less" : "more"}
                            </button>
                          )}
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                          <span className="text-[#51218F] font-medium">{job.rateType}</span>
                          <span className="text-[#51218F] flex items-center gap-1">
                            <span className="text-yellow-500 text-xs">
                              {"★".repeat(Math.round(job.rating || 0))}
                              {"☆".repeat(5 - Math.round(job.rating || 0))}
                            </span>
                            <span>{job.rating || 0}/5 ({job.reviewsCount || 0} Review{job.reviewsCount !== 1 ? 's' : ''})</span>
                          </span>
                          <div className="flex items-center gap-1">
                            <CountryFlag countryCode={job.country_code} country={job.country} />
                            <span>{[job.state, job.country].filter(Boolean).join(", ") || "Remote"}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {popupTotalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-4 pt-3 border-t border-gray-200">
                        <button onClick={() => goToPopupPage(popupCurrentPage - 1)} disabled={popupCurrentPage === 1} className={`px-2.5 py-1 rounded-md transition-colors text-xs ${popupCurrentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Previous</button>
                        {[...Array(popupTotalPages)].map((_, idx) => (
                          <button key={idx} onClick={() => goToPopupPage(idx + 1)} className={`px-2.5 py-1 rounded-md transition-colors text-xs ${popupCurrentPage === idx + 1 ? 'bg-[#51218F] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{idx + 1}</button>
                        ))}
                        <button onClick={() => goToPopupPage(popupCurrentPage + 1)} disabled={popupCurrentPage === popupTotalPages} className={`px-2.5 py-1 rounded-md transition-colors text-xs ${popupCurrentPage === popupTotalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Next</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== EMAIL SETUP POPUP ========== */}
      {showEmailSetupPopup && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99998]" 
            onClick={() => { if (!isSavingEmail) setShowEmailSetupPopup(false); }} 
          />
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <div className="relative w-full max-w-[740px] min-h-[432px] rounded-[32px] border-[1.5px] border-white bg-white/70 shadow-[0_0_10px_0_#FFFFFF] flex flex-col items-center justify-center gap-4 md:gap-6 p-5 md:p-8 my-8">
              <div
                className={`absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 md:gap-2 cursor-pointer select-none ${isSavingEmail ? 'opacity-50 pointer-events-none' : ''}`}
                onClick={() => { if (!isSavingEmail) setShowEmailSetupPopup(false); }}
              >
                <div className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full bg-gradient-to-r from-[#3D1768] to-[#030303]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </div>
                <span className="text-[#030303] poppins-font text-xs md:text-base font-medium">Back</span>
              </div>
              
              <div className="w-full max-w-lg text-center mt-6 md:mt-10">
                <h1 className="text-xl md:text-3xl font-semibold text-[#000000] poppins-font">Add Email Address</h1>
                <p className="text-[#3D1768] text-xs md:text-sm poppins-font mb-6 md:mb-10 px-4">
                  No email found on your account. Add a Gmail address to enable email verification.
                </p>
                
                <div className="mb-6 md:mb-8">
                  <label className="block text-xs md:text-sm font-medium text-[#030303] mb-2 poppins-font text-left">Email Address</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value.toLowerCase())}
                    placeholder="username@gmail.com"
                    disabled={isSavingEmail}
                    className={`w-full px-3 py-2 md:px-4 md:py-3 border text-sm md:text-base ${isValidGmail(newEmail) ? 'border-gray-300' : newEmail ? 'border-red-300' : 'border-gray-300'} rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-[#3D1768] focus:border-[#3D1768] outline-none transition-all text-[#030303] poppins-font placeholder:text-[#030303]/50 ${isSavingEmail ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  <p className="text-xs md:text-sm text-[#030303]/70 poppins-font mt-2 text-left">
                    {newEmail && !isValidGmail(newEmail) ? 'Please enter a valid Gmail address (@gmail.com)' : 'Only Gmail addresses are supported for verification'}
                  </p>
                </div>
                
                <button
                  onClick={handleSaveEmail}
                  disabled={!isValidGmail(newEmail) || isSavingEmail}
                  type="button"
                  className="group relative overflow-hidden w-full max-w-[554px] h-10 md:h-12 rounded-[30px] bg-gradient-to-r from-[#3D1768] to-[#030303] px-6 md:px-8 py-2 md:py-3 text-white text-sm md:text-base font-medium poppins-font border border-white/10 shadow-lg hover:border-white/30 hover:shadow-2xl hover:shadow-purple-900/50 active:scale-95 transition-all duration-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 group-hover:scale-105 transition-transform duration-300">
                    {isSavingEmail ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </div>
                    ) : 'Save & Verify'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========== PHONE INPUT POPUP ========== */}
      {showPhonePopup && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99998]" 
            onClick={() => { setShowPhonePopup(false); setPhoneNumber(''); }} 
          />
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <div className="relative w-full max-w-[740px] min-h-[432px] rounded-[32px] border-[1.5px] border-white bg-white/70 shadow-[0_0_10px_0_#FFFFFF] flex flex-col items-center justify-center gap-4 md:gap-6 p-5 md:p-8 my-8">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 md:gap-2 cursor-pointer select-none z-10" onClick={() => { setShowPhonePopup(false); setPhoneNumber(''); }}>
                <div className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full bg-gradient-to-r from-[#3D1768] to-[#030303]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </div>
                <span className="text-[#030303] poppins-font text-xs md:text-base font-medium">Back</span>
              </div>
              
              <div className="w-full max-w-lg text-center mt-6 md:mt-10">
                <h1 className="text-xl md:text-3xl font-semibold text-[#000000] poppins-font">Verify Phone Number</h1>
                <p className="text-[#3D1768] text-xs md:text-sm poppins-font mb-6 md:mb-10 px-4">Enter your phone number to receive a verification code</p>
                
                {(currentUser?.phone_number || userData?.phone_number) && (
                  <div className="mb-4 p-2 md:p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 justify-center flex-wrap">
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-[#51218F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <p className="text-xs md:text-sm font-medium text-[#51218F]">Registered number: <span className="font-bold">{currentUser?.phone_number || userData?.phone_number}</span></p>
                    </div>
                    <p className="text-[10px] md:text-xs text-[#51218F]/70 mt-1">Please enter the same number for verification</p>
                  </div>
                )}
                
                <div className="mb-6 md:mb-8">
                  <label className="block text-xs md:text-sm font-medium text-[#030303] mb-2 poppins-font text-left">Phone Number</label>
                  <div className="flex mb-3 md:mb-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center px-2 md:px-4 py-2 md:py-3 border border-r-0 border-gray-300 rounded-l-xl bg-gray-50/70">
                        <span className="text-gray-700 font-medium poppins-font text-sm md:text-base">🇮🇳 +91</span>
                      </div>
                    </div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder={userData?.phone_number ? userData.phone_number.replace(/\D/g, '').slice(-10) : "12345 67890"}
                      maxLength={10}
                      className="flex-1 px-2 md:px-4 py-2 md:py-3 border border-gray-300 border-l-0 rounded-r-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-[#3D1768] focus:border-[#3D1768] outline-none transition-all text-[#030303] poppins-font text-sm md:text-base"
                    />
                  </div>
                  
                  <div className="flex justify-between items-center mt-2 md:mt-3">
                    <p className="text-xs md:text-sm text-[#030303]/70 poppins-font">Enter 10-digit mobile number</p>
                    <p className={`text-xs md:text-sm font-medium poppins-font ${phoneNumber.length === 10 ? 'text-[#3D1768]' : 'text-[#030303]/70'}`}>{phoneNumber.length}/10</p>
                  </div>
                </div>
                
                <button
                  onClick={handlePhoneSubmit}
                  disabled={phoneNumber.length !== 10 || isVerifying}
                  type="button"
                  className="group relative overflow-hidden w-full max-w-[554px] h-10 md:h-12 rounded-[30px] bg-gradient-to-r from-[#3D1768] to-[#030303] px-6 md:px-8 py-2 md:py-3 text-white text-sm md:text-base font-medium poppins-font border border-white/10 shadow-lg hover:border-white/30 hover:shadow-2xl hover:shadow-purple-900/50 active:scale-95 transition-all duration-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 transition-transform duration-1000 ease-out group-hover:translate-x-[100%]" />
                  <span className="relative z-10 group-hover:scale-105 transition-transform duration-300">
                    {isVerifying ? 'Sending...' : 'Send OTP'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========== EMAIL VERIFICATION POPUP ========== */}
      {showEmailPopup && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99998]" 
            onClick={() => { if (!isVerifying) { setShowEmailPopup(false); setEmail(''); } }} 
          />
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <div className="relative w-full max-w-[740px] min-h-[432px] rounded-[32px] border-[1.5px] border-white bg-white/70 shadow-[0_0_10px_0_#FFFFFF] flex flex-col items-center justify-center gap-4 md:gap-6 p-5 md:p-8 my-8">
              {isVerifying && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-[32px]">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-gray-200 rounded-full"></div>
                      <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-[#51218F] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-[#51218F] font-semibold text-base md:text-lg">Sending OTP...</p>
                      <p className="text-gray-500 text-xs md:text-sm mt-2">Please wait while we send the verification code</p>
                    </div>
                    <div className="flex gap-2 md:gap-3 mt-2">
                      <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-[#51218F] rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                      <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-[#51218F] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-[#51218F] rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 md:gap-2 cursor-pointer select-none z-10" onClick={() => { if (!isVerifying) { setShowEmailPopup(false); setEmail(''); } }}>
                <div className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full bg-gradient-to-r from-[#3D1768] to-[#030303]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </div>
                <span className="text-[#030303] poppins-font text-xs md:text-base font-medium">Back</span>
              </div>
              
              <div className="w-full max-w-lg text-center mt-6 md:mt-10">
                <h1 className="text-xl md:text-3xl font-semibold text-[#000000] poppins-font">Verify Email Address</h1>
                <p className="text-[#3D1768] text-xs md:text-sm poppins-font mb-6 md:mb-10 px-4">Enter your registered email address to receive a verification code</p>
                
                <div className="mb-4 p-2 md:p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 justify-center flex-wrap">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-[#51218F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs md:text-sm font-medium text-[#51218F]">Registered email: <span className="font-bold">{userData?.email || currentUser?.email || "Not set"}</span></p>
                  </div>
                  <p className="text-[10px] md:text-xs text-[#51218F]/70 mt-1">You must use this email for verification</p>
                </div>
                
                <div className="mb-6 md:mb-8">
                  <label className="block text-xs md:text-sm font-medium text-[#030303] mb-2 poppins-font text-left">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                    placeholder={userData?.email || currentUser?.email || "Enter your Gmail address"}
                    disabled={isVerifying}
                    className={`w-full px-3 py-2 md:px-4 md:py-3 border text-sm md:text-base ${isValidGmail(email) ? 'border-gray-300' : 'border-red-300'} rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-[#3D1768] focus:border-[#3D1768] outline-none transition-all text-[#030303] poppins-font placeholder:text-[#030303]/50 ${isVerifying ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  <div className="flex items-center justify-between mt-2 md:mt-3">
                    <p className="text-xs md:text-sm text-[#030303]/70 poppins-font">
                      {isValidGmail(email) ? "We'll send a 6-digit verification code to this email" : "Please enter a valid Gmail address (@gmail.com)"}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleEmailSubmit}
                  disabled={!isValidGmail(email) || isVerifying}
                  type="button"
                  className="group relative overflow-hidden w-full max-w-[554px] h-10 md:h-12 rounded-[30px] bg-gradient-to-r from-[#3D1768] to-[#030303] px-6 md:px-8 py-2 md:py-3 text-white text-sm md:text-base font-medium poppins-font border border-white/10 shadow-lg hover:border-white/30 hover:shadow-2xl hover:shadow-purple-900/50 active:scale-95 transition-all duration-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 transition-transform duration-1000 ease-out group-hover:translate-x-[100%]" />
                  <span className="relative z-10 group-hover:scale-105 transition-transform duration-300">
                    {isVerifying ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </div>
                    ) : 'Send OTP'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========== OTP POPUP ========== */}
      {showOTPPopup && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999]"
            onClick={() => {
              setShowOTPPopup(false);
              setOtp(['', '', '', '', '', '']);
              setResendTime(45);
              if (currentVerificationType === 'phone') setShowPhonePopup(true);
              else setShowEmailPopup(true);
            }}
          />
          <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4 py-4 sm:px-6 sm:py-6">
            <div className="relative w-full max-w-[740px] min-h-[432px] rounded-[32px] border-[1.5px] border-white bg-white/70 shadow-[0_0_10px_0_#FFFFFF] flex flex-col items-center justify-center gap-6 p-4 sm:p-6 md:p-10 mx-2 sm:mx-4">
              <div
                className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 cursor-pointer select-none z-10"
                onClick={() => {
                  setShowOTPPopup(false);
                  setOtp(['', '', '', '', '', '']);
                  setResendTime(45);
                  if (currentVerificationType === 'phone') setShowPhonePopup(true);
                  else setShowEmailPopup(true);
                }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "linear-gradient(180deg, rgba(3,3,3,0.9) 0%, rgba(81,33,143,0.9) 100%)", backdropFilter: "blur(12px)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                </div>
                <span className="text-[#030303] poppins-font text-base sm:text-lg font-medium">Back</span>
              </div>
              
              <div className="w-full max-w-lg text-center mt-10">
                <h1 className="text-2xl sm:text-3xl md:text-[32px] font-semibold text-[#000000] poppins-font">Enter OTP</h1>
                <p className="text-[#3D1768] text-xs sm:text-sm md:text-base poppins-font mb-6 sm:mb-8 md:mb-12 px-4">
                  We've sent a 6-digit OTP to your{' '}
                  <span className="font-semibold text-[#51218F]">
                    {currentVerificationType === 'phone' ? 'Phone Number' : 'Email Address'}
                  </span>. Please enter it below to continue.
                </p>
                
                {/* OTP Inputs */}
                <div className="flex justify-center gap-2 sm:gap-4 md:gap-8 mb-6 px-2 sm:px-0">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="relative flex-shrink-0">
                      <input
                        value={otp[i] || ''}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !otp[i] && i > 0) {
                            document.getElementById(`otp-${i - 1}`)?.focus();
                          } else if (e.key !== 'Backspace' && /^[0-9]$/.test(e.key) && otp[i] && i < 5) {
                            setTimeout(() => { document.getElementById(`otp-${i + 1}`)?.focus(); }, 10);
                          }
                        }}
                        id={`otp-${i}`}
                        maxLength={1}
                        inputMode="numeric"
                        className="w-8 h-8 sm:w-12 sm:h-14 md:w-[50px] md:h-[70px] text-center text-lg sm:text-2xl md:text-4xl text-[#000000] bg-transparent outline-none leading-none pb-1 sm:pb-2"
                      />
                      <div className={`absolute left-0 right-0 bottom-0 h-[2px] rounded-full transition-all duration-300 ${
                        otp[i] ? 'bg-[#3D1768]' : 'bg-gray-400'
                      }`} />
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
                        <span className="text-xs sm:text-sm md:text-base">Verifying...</span>
                      </div>
                    ) : 'Verify OTP'}
                  </span>
                </button>
                
                <div className="mt-6 sm:mt-8 text-center">
                  <p className="text-[#030303]/90 text-xs sm:text-sm md:text-base poppins-font mb-1">Didn't receive the code?</p>
                  {resendTime > 0 ? (
                    <div>
                      <p className="text-[#030303]/90 text-xs sm:text-sm md:text-base poppins-font">
                        Resend in{' '}
                        <span className="font-bold text-red-500 font-mono">
                          {String(Math.floor(resendTime / 60)).padStart(2, '0')}:{String(resendTime % 60).padStart(2, '0')}
                        </span>
                      </p>
                      {rateLimitError && <p className="text-xs text-red-500 mt-2">{rateLimitError}</p>}
                    </div>
                  ) : (
                    <button
                      onClick={handleResendOTP}
                      disabled={isVerifying}
                      className="text-[#C22CA2] hover:text-[#3D1768] font-semibold text-xs sm:text-sm md:text-base poppins-font transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2 mx-auto px-3 sm:px-4 py-1 sm:py-2 rounded-full group"
                    >
                      {isVerifying ? (
                        <>
                          <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4 text-[#C22CA2]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Sending OTP...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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

      {/* ========== SUCCESS POPUP ========== */}
      {showSuccessPopup && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99998]"
            onClick={() => setShowSuccessPopup(false)}
          />
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <div className="relative w-full max-w-[652px] min-h-[398px] rounded-[32px] border-[1.5px] border-white bg-white/70 shadow-[0_0_10px_0_#FFFFFF] flex flex-col items-center justify-center gap-4 md:gap-6 p-5 md:p-8 my-8">
              <img
                src={Success}
                alt="Success"
                className="w-20 h-20 md:w-[122px] md:h-[122px] max-w-[25%] max-h-[25%] object-contain"
              />
              <p className="w-[90%] max-w-[522px] text-center text-lg md:text-[24px] leading-[100%] font-normal poppins-font text-[#3D1768]">
                Your {currentVerificationType} has been verified successfully!
              </p>
              <div
                className="flex items-center mt-2 md:mt-4 gap-2 cursor-pointer"
                onClick={() => setShowSuccessPopup(false)}
              >
                <div
                  className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full border border-white/20 bg-gradient-to-r from-[#3D1768] to-[#030303]"
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
                <span className="text-[#030303] poppins-font font-normal text-base md:text-[18px] leading-[100%]">
                  Continue
                </span>
              </div>
              <p className="text-xs md:text-sm text-[#3D1768]/80 poppins-font mt-2">
                Closing automatically...
              </p>
            </div>
          </div>
        </>
      )}

      <div className="w-full mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default ColHome;