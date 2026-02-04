import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useUser } from '../../contexts/UserContext';
import api from "../../utils/axiosConfig";
import Header from "../../component/colHeader";
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
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ColHome = () => {
  const [activeTab, setActiveTab] = useState("best");
  const navigate = useNavigate();
  const { userData } = useUser();

  // State for jobs
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // State for saved jobs interactions
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [likedJobs, setLikedJobs] = useState(new Set());

  // Format time ago
  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Recently";

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffHours < 1) {
        return "Recently";
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      } else if (diffDays === 1) {
        return "1 day ago";
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } catch (error) {
      return "Recently";
    }
  };

  // Get flag based on country
  const getFlagForCountry = (country) => {
    if (!country) return USAFlag;

    const countryLower = country.toLowerCase();
    if (countryLower.includes('usa') || countryLower.includes('united states') || countryLower.includes('manhattan')) {
      return USAFlag;
    } else if (countryLower.includes('uk') || countryLower.includes('united kingdom')) {
      return UKFlag;
    } else if (countryLower.includes('canada')) {
      return CanadaFlag;
    }
    return USAFlag;
  };

  // Format budget type for display
  const formatBudgetType = (budgetType) => {
    if (!budgetType) return 'Fixed-price';
    return budgetType === 'fixed' || budgetType === 'Fixed' ? 'Fixed-price' : 'Hourly';
  };

  // Format budget for display
  const formatBudget = (job) => {
    if (job.budget_from !== null && job.budget_to !== null) {
      return `$${job.budget_from} - $${job.budget_to}`;
    } else if (job.budget_from !== null) {
      return `$${job.budget_from}`;
    } else if (job.budget_to !== null) {
      return `$${job.budget_to}`;
    }
    return '$2,000';
  };

  // Format rate type for display
  const formatRateType = (budgetType) => {
    if (!budgetType) return '$ Fixed Rate';
    return budgetType === 'fixed' || budgetType === 'Fixed' ? '$ Fixed Rate' : '$ Hourly Rate';
  };

  const CountryFlag = ({ countryCode, country }) => {
    if (!countryCode) return <span>🌍</span>;

    return (
      <img
        src={`https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`}
        alt={country}
        title={country}
        className="w-[18px] h-[12px] rounded-[4px] object-cover"
        onError={(e) => {
          e.target.replaceWith(
            document.createTextNode(
              String.fromCodePoint(
                ...[...countryCode.toUpperCase()].map(
                  (c) => 127397 + c.charCodeAt()
                )
              )
            )
          );
        }}
      />
    );
  };


  // Fetch jobs based on active tab
  useEffect(() => {
    if (!userData?.id) return;

    const fetchJobs = async () => {
      setLoading(true);
      try {
        let response;

        switch (activeTab) {
          case "best":
            response = await api.get(`/collaborator/jobs/best-match/${userData.id}`);
            if (response.data && response.data.length > 0) {
              const jobsWithCreatorDetails = await Promise.all(
                response.data.map(async (job) => {
                  try {
                    // Get creator details from job's employer_id
                    const creatorResponse = await api.get(`/collaborator/jobs/${job.id}`);
                    const jobData = creatorResponse.data || {};
                    const creatorData = jobData.creator || {};

                    return {
                      ...job,
                      // Display raw DB values
                      meta: `${formatBudgetType(job.budget_type)} - ${job.expertise_level || 'Intermediate'} - Est. Budget: ${formatBudget(job)} - Posted ${formatTimeAgo(job.created_at)}`,
                      rateType: formatRateType(job.budget_type),
                      rating: creatorData.rating || 0,
                      reviews: creatorData.reviews || 0,
                      country: creatorData.country,
  state: creatorData.state,
  country_code: creatorData.country_code,
                      posted_at: job.created_at,
                      full_description: job.description || "No description available"
                    };
                  } catch (error) {
                    console.error(`Error fetching job ${job.id}:`, error);
                    return {
                      ...job,
                      meta: `${formatBudgetType(job.budget_type)} - ${job.expertise_level || 'Intermediate'} - Est. Budget: ${formatBudget(job)} - Posted ${formatTimeAgo(job.created_at)}`,
                      rateType: formatRateType(job.budget_type),
                      rating: creatorData.rating || 0,
                      reviews: creatorData.reviews || 0,
                      country: creatorData.country,
                      state: creatorData.state,
                      country_code: creatorData.country_code,

                      posted_at: job.created_at,
                      full_description: job.description || "No description available"
                    };
                  }
                })
              );
              setJobs(jobsWithCreatorDetails);
            } else {
              setJobs([]);
            }
            break;

          case "saved":
            response = await api.get(`/collaborator/jobs/saved/${userData.id}`);
            if (response.data && response.data.length > 0) {
              const jobsWithCreatorDetails = await Promise.all(
                response.data.map(async (job) => {
                  try {
                    const creatorResponse = await api.get(`/collaborator/jobs/${job.id}`);
                    const jobData = creatorResponse.data || {};
                    const creatorData = jobData.creator || {};

                    return {
                      ...job,
                      meta: `${formatBudgetType(job.budget_type)} - ${job.expertise_level || 'Intermediate'} - Est. Budget: ${formatBudget(job)} - Posted ${formatTimeAgo(job.saved_at || job.created_at)}`,
                      rateType: formatRateType(job.budget_type),
                      rating: creatorData.rating || 0,
                      reviews: creatorData.reviews || 0,
                      country: creatorData.country,
                      state: creatorData.state,
                      country_code: creatorData.country_code,

                      posted_at: job.saved_at || job.created_at,
                      full_description: job.description || "No description available"
                    };
                  } catch (error) {
                    console.error(`Error fetching job ${job.id}:`, error);
                    return {
                      ...job,
                      meta: `${formatBudgetType(job.budget_type)} - ${job.expertise_level || 'Intermediate'} - Est. Budget: ${formatBudget(job)} - Posted ${formatTimeAgo(job.saved_at || job.created_at)}`,
                      rateType: formatRateType(job.budget_type),
                      rating: "★★★★☆",
                      reviews: "4/5 (12 Reviews)",
                      flag: USAFlag,
                      location: "Remote",
                      creator_name: "Anonymous",
                      posted_at: job.saved_at || job.created_at,
                      full_description: job.description || "No description available"
                    };
                  }
                })
              );
              setJobs(jobsWithCreatorDetails);
            } else {
              setJobs([]);
            }
            break;

          case "recent":
            response = await api.get(`/collaborator/jobs/recent/${userData.id}`);
            if (response.data && response.data.length > 0) {
              const jobsWithCreatorDetails = await Promise.all(
                response.data.map(async (job) => {
                  try {
                    const creatorResponse = await api.get(`/collaborator/jobs/${job.id}`);
                    const jobData = creatorResponse.data || {};
                    const creatorData = jobData.creator || {};

                    return {
                      ...job,
                      meta: `${formatBudgetType(job.budget_type)} - ${job.expertise_level || 'Intermediate'} - Est. Budget: ${formatBudget(job)} - Posted ${formatTimeAgo(job.viewed_at || job.created_at)}`,
                      rateType: formatRateType(job.budget_type),
                      rating: creatorData.rating || 0,
reviews: creatorData.reviews || 0,
                      country: creatorData.country,
                      state: creatorData.state,
                      country_code: creatorData.country_code,

                      posted_at: job.viewed_at || job.created_at,
                      full_description: job.description || "No description available"
                    };
                  } catch (error) {
                    console.error(`Error fetching job ${job.id}:`, error);
                    return {
                      ...job,
                      meta: `${formatBudgetType(job.budget_type)} - ${job.expertise_level || 'Intermediate'} - Est. Budget: ${formatBudget(job)} - Posted ${formatTimeAgo(job.viewed_at || job.created_at)}`,
                      rateType: formatRateType(job.budget_type),
                      rating: "★★★★☆",
                      reviews: "4/5 (12 Reviews)",
                      flag: USAFlag,
                      location: "Remote",
                      creator_name: "Anonymous",
                      posted_at: job.viewed_at || job.created_at,
                      full_description: job.description || "No description available"
                    };
                  }
                })
              );
              setJobs(jobsWithCreatorDetails);
            } else {
              setJobs([]);
            }
            break;

          default:
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

  // Load saved jobs on component mount
  useEffect(() => {
    if (!userData?.id) return;

    const loadSavedJobs = async () => {
      try {
        const response = await api.get(`/collaborator/jobs/saved/${userData.id}`);
        if (response.data && response.data.length > 0) {
          const savedJobIds = new Set(response.data.map(job => job.id));
          setSavedJobs(savedJobIds);
        }
      } catch (error) {
        console.error('Error loading saved jobs:', error);
      }
    };

    loadSavedJobs();
  }, [userData]);

  // Handle save/unsave job
  const handleSaveJob = async (jobId) => {
    if (!userData?.id) {
      toast.error('Please login to save jobs');
      return;
    }

    try {
      const response = await api.post('/collaborator/jobs/toggle-save', null, {
        params: {
          user_id: userData.id,
          job_id: jobId
        }
      });

      if (response.data.status === 'saved') {
        setSavedJobs(prev => new Set([...prev, jobId]));
        toast.success('Job saved successfully');
      } else {
        setSavedJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
        toast.info('Job removed from saved');
      }
    } catch (error) {
      console.error('Error toggling save job:', error);
      toast.error('Failed to save job');
    }
  };

  // Handle like job (local only)
  const handleLikeJob = (jobId) => {
    if (likedJobs.has(jobId)) {
      setLikedJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    } else {
      setLikedJobs(prev => new Set([...prev, jobId]));
    }
  };

  // Track job view
  const handleTrackView = async (jobId) => {
    if (!userData?.id) return;

    try {
      await api.post('/collaborator/jobs/track-view', null, {
        params: {
          user_id: userData.id,
          job_id: jobId
        }
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  // Handle job click to track view
  const handleJobClick = (jobId) => {
    handleTrackView(jobId);
  };

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) return;

    setLoading(true);

    try {
      const response = await api.get("/collaborator/job-search", {
        params: { search: query }
      });

      if (!response.data || response.data.length === 0) {
        setJobs([]);
        toast.info("No jobs found");
        return;
      }

      const jobsWithDisplayFields = response.data.map(job => ({
        ...job,

        meta: `${formatBudgetType(job.budget_type)} - ${job.expertise_level || "Intermediate"
          } - Est. Budget: ${formatBudget(job)} - Posted ${formatTimeAgo(
            job.created_at
          )}`,

        rateType: formatRateType(job.budget_type),

        rating: "★★★★☆",
        reviews: "4/5 (12 Reviews)",


        flag: getFlagForCountry(job.location),


        full_description: job.description || "No description available",
        posted_at: job.created_at
      }));

      setJobs(jobsWithDisplayFields);

    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const getProfileCompletion = () => {
    if (!userData) return 0;

    const fields = [
      userData.first_name,
      userData.last_name,
      userData.email,
      userData.profile_picture,
      userData.status
    ];

    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  const profilePercent = getProfileCompletion();


  return (
    <div className="w-full min-h-[2500px] flex flex-col overflow-x-hidden">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} />
      <section className="w-full flex flex-col items-center justify-start px-4 relative min-w-0">
        {/* Background Image Container */}
        <div
          className="absolute top-[-104px] left-0 w-full h-[582px] z-0"
          style={{
            backgroundImage: `url(${HomeBg})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          {/* White Overlay */}
          <div className="absolute inset-0 bg-black opacity-30" />
        </div>

        {/* Welcome Text */}
        <div className="absolute top-[187px] w-full flex flex-col items-center justify-center gap-[24px] z-10">
          {/* TEXT */}
          <h1
            className="text-[48px] leading-[100%] text-center text-white font-normal"
            style={{ fontFamily: "Milonga" }}
          >
            Welcome back,<br />
            {userData?.first_name || "User"}
          </h1>

          {/* SEARCH BAR */}
          <div
            className="
              w-full max-w-[890px]
              h-[48px]
              flex items-center
              bg-white
              border border-[#6D3BC1]
              rounded-[10px]
              overflow-hidden
            "
          >
            {/* INPUT */}
            <input
              type="text"
              placeholder="Search Jobs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 h-full px-6 text-[15px] text-gray-600 outline-none bg-transparent"
            />


            {/* SEARCH BUTTON */}
            <button
              onClick={handleSearch}
              className="
                h-full
                px-10
                text-[15px]
                font-medium
                text-white
                bg-gradient-to-br from-[#4B1D8C] to-[#2B0A4F]
                rounded-r-[10px]
                flex items-center justify-center gap-2
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                />
              </svg>
              Search
            </button>
          </div>
        </div>

        <Header />

        {/* Container for the main content */}
        <div className="w-full flex flex-col lg:flex-row justify-start mt-[412px] pb-[100px] relative">
          <div className="w-full lg:w-[805px] lg:ml-[65px] opacity-100 relative">
            {/* ========== JOB POST CARD ========== */}
            <div className="absolute w-[205px] h-[24px] top-0 left-[46px] opacity-100 font-['Montserrat'] font-bold text-[20px] leading-[100%] tracking-[0%] text-[#2A1E17]">
              Jobs you might like
            </div>

            <div className="absolute w-[804px] h-[35px] px-[10px] left-[33px] opacity-100">
              <div className="flex gap-16 text-[15px] relative mt-12">
                {/* BEST MATCH */}
                <span
                  onClick={() => setActiveTab("best")}
                  className="cursor-pointer relative pb-3 font-semibold"
                >
                  Best match
                  <span
                    className={`absolute left-0 -bottom-[6px] h-[3px] w-full rounded-full transition-all ${activeTab === "best" ? "bg-red-500" : "bg-transparent"
                      }`}
                  />
                </span>

                {/* RECENT */}
                <span
                  onClick={() => setActiveTab("recent")}
                  className="cursor-pointer relative pb-3 font-semibold"
                >
                  Recent
                  <span
                    className={`absolute left-0 -bottom-[6px] h-[3px] w-full rounded-full transition-all ${activeTab === "recent" ? "bg-red-500" : "bg-transparent"
                      }`}
                  />
                </span>

                {/* SAVED */}
                <span
                  onClick={() => setActiveTab("saved")}
                  className="cursor-pointer relative pb-3 font-semibold"
                >
                  Saved ({savedJobs.size})
                  <span
                    className={`absolute left-0 -bottom-[6px] h-[3px] w-full rounded-full transition-all ${activeTab === "saved" ? "bg-red-500" : "bg-transparent"
                      }`}
                  />
                </span>
              </div>

              {/* BASE DIVIDER (GREY LINE) */}
              <div className="mt-1 h-[2px] bg-gray-200 w-[700px] relative z-0" />
            </div>

            {/* ========== CONTENT BOX ========== */}
            <div className="absolute w-[805px] h-auto p-[39px_47px] gap-[30px] top-[150px] left-[32px] opacity-100 rounded-[10px] shadow-[0_4px_45px_0_#0000001F] flex flex-col">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Jobs Found</h3>
                  <p className="text-gray-500">
                    {activeTab === "saved"
                      ? "You haven't saved any jobs yet. Click the heart icon on jobs to save them."
                      : activeTab === "recent"
                        ? "You haven't viewed any jobs recently. Click on jobs to view them."
                        : "No matching jobs found for your profile."}
                  </p>
                </div>
              ) : (
                jobs.map((job, index) => (
                  <div
                    key={job.id || index}
                    className={`${index !== jobs.length - 1 ? 'border-b border-gray-200 pb-8 mb-8' : ''} cursor-pointer`}
                    onClick={() => handleJobClick(job.id)}
                  >
                    <div className="flex justify-between items-start gap-6">
                      {/* LEFT CONTENT */}
                      <div className="flex-1">
                        {/* TITLE */}
                        <h3 className="font-semibold text-[17px] mb-2 text-[#2A1E17]">
                          {job.title}
                        </h3>

                        {/* META */}
                        <p className="text-[14px] text-gray-500 mb-3">
                          {job.meta}
                        </p>

                        {/* DESCRIPTION */}
                        <p className="text-[15px] text-gray-600 mb-4 leading-relaxed">
                          {job.full_description}
                          <span className="text-[#4B1D8C] font-medium cursor-pointer ml-1">
                            more
                          </span>
                        </p>

                        {/* FOOTER - Creator name after flag */}
                        <div className="flex items-center gap-5 text-[14px] text-gray-500 flex-wrap">
                          <span className="text-[#4B1D8C] font-medium">{job.rateType}</span>
                          {/* ⭐ Rating */}
                          <span className="text-[#4B1D8C]">
                            {"★".repeat(Math.floor(job.rating))}
                            {"☆".repeat(5 - Math.floor(job.rating))}
                          </span>

                          <span>
                            {job.rating}/5 ({job.reviews} reviews)
                          </span>

                          {/* 📍 Location */}
                          <div className="flex items-center gap-2">
                            <CountryFlag
                              countryCode={job.country_code}
                              country={job.country}
                            />
                            <span className="text-gray-500">
                              {[job.state, job.country].filter(Boolean).join(", ")}
                            </span>
                          </div>

                        </div>
                      </div>

                      {/* RIGHT ICONS */}
                      <div className="flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-3">
                          {/* Heart Circle - For saving jobs */}
                          <div
                            className="w-[46px] h-[46px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 relative group"
                            style={{
                              opacity: 1,
                              backgroundColor: savedJobs.has(job.id) ? '#FF0000' : '#C4C4C466',
                            }}
                            onClick={() => handleSaveJob(job.id)}
                          >
                            {/* Heart SVG */}
                            <svg
                              className="w-5 h-5"
                              fill={savedJobs.has(job.id) ? "white" : "none"}
                              stroke={savedJobs.has(job.id) ? "white" : "#51218F"}
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                              />
                            </svg>
                            {/* Tooltip */}
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              {savedJobs.has(job.id) ? "Remove from saved" : "Save job"}
                            </div>
                          </div>

                          {/* Like Circle */}
                          <div
                            className="w-[46px] h-[46px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 relative group"
                            style={{
                              opacity: 1,
                              backgroundColor: likedJobs.has(job.id) ? '#51218F' : '#C4C4C466',
                            }}
                            onClick={() => handleLikeJob(job.id)}
                          >
                            {/* Like/Thumbs Up SVG */}
                            <svg
                              className="w-5 h-5"
                              fill={likedJobs.has(job.id) ? "white" : "none"}
                              stroke={likedJobs.has(job.id) ? "white" : "#51218F"}
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                              />
                            </svg>
                            {/* Tooltip */}
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              {likedJobs.has(job.id) ? "Unlike" : "Like"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ========== RIGHT SIDEBAR ========== */}
          <div className="w-full lg:w-[392px] mt-8 lg:mt-0 lg:absolute lg:top-[0px] lg:right-4 lg:left-auto">
            <div className="flex flex-col gap-[30px]">


              {/* Profile completion card */}
              <div
                className="w-full h-[266px] opacity-100 rounded-[10px] bg-white shadow-[0px_4px_45px_0px_#0000001F] flex flex-col items-center p-6"
              >
                {/* Top text - User name */}
                <div className="w-full h-[27px] opacity-100 mb-2">
                  <h3 className="font-bold text-[22px] leading-[100%] text-[#2A1E17] text-center">
                    {userData?.first_name || "User"}
                  </h3>
                </div>

                {/* Bottom para - UI/UX designer */}
                <div className="w-full h-[18px] opacity-100 mb-6">
                  <p className="font-medium text-[14px] leading-[100%] text-[#2A1E17E5] text-center">
                    Collaborator
                  </p>
                </div>

                {/* Progress section */}
                <div className="w-full flex justify-between items-center mb-4">
                  {/* Left text - Set up your account */}
                  <div className="text-left">
                    <span className="font-bold text-[14px] leading-[100%] text-[#2A1E17]">
                      Set up your account
                    </span>
                  </div>

                  {/* Right text - 75% */}
                  <div className="text-right">
                    <span className="font-bold text-[14px] leading-[100%] text-[#2A1E17]">
                      {profilePercent}%
                    </span>
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="w-full max-w-[341px] h-[6px] opacity-100 mb-8 rounded-full bg-gray-200 overflow-hidden">
                  {/* Progress bar fill - 75% of 341px = 276px */}
                  <div
                    className="h-full rounded-full border-0"
                    style={{
                      width: `${profilePercent}%`,
                      backgroundColor: '#51218F',
                    }}
                  />

                </div>

                {/* Complete your profile button */}
                <button
                  onClick={() => navigate('/collaborator-role-profile')}
                  className="w-full max-w-[210px] h-[39px] opacity-100 rounded-[100px] flex items-center justify-center px-[36px] py-[12px] gap-[10px] bg-transparent hover:bg-[#51218F] hover:text-white transition-all duration-200 cursor-pointer mb-3 group border border-[#51218F]"
                >
                  <span className="font-bold text-[12px] leading-[100%] text-[#51218F] group-hover:text-white">
                    Complete your profile
                  </span>
                </button>

                {/* Last bottom para */}
                <div className="w-full max-w-[341px] opacity-100">
                  <p className="font-normal italic text-[12px] leading-[100%] text-[#2A1E17E5] text-center">
                    100% completion of your profile will help you get more reach.
                  </p>
                </div>
              </div>

              {/* ========== RIGHT SIDEBAR - VERIFICATION CARD ========== */}
              <div className="w-full h-[242px] opacity-100 bg-white rounded-[10px] shadow-[0px_4px_45px_0px_#0000001F] p-6">
                {/* Top text - Verification */}
                <div className="w-full h-[24px] opacity-100 mb-2">
                  <h3 className="font-semibold text-[20px] leading-[100%] text-[#2A1E17]">
                    Verification
                  </h3>
                </div>

                {/* Line border */}
                <div
                  className="w-full h-[0px] opacity-100 mb-6"
                  style={{
                    borderBottom: '1px solid #0000001A'
                  }}
                />
                {/* Phone verified section */}
                <div className="w-full h-[20px] opacity-100 mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-[12px]">
                    <div className="w-[20px] h-[20px] opacity-100">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2A1E17"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </div>
                    <span className="font-outfit font-normal text-[16px] leading-[100%] text-[#2A1E17] whitespace-nowrap">
                      Phone verified
                    </span>
                  </div>
                  <button className="w-[46px] h-[20px] opacity-100 bg-transparent hover:opacity-80 transition-opacity duration-200 cursor-pointer">
                    <span className="font-medium text-[16px] leading-[100%] text-[#51218F] whitespace-nowrap">
                      Verify
                    </span>
                  </button>
                </div>

                {/* Email verified section */}
                <div className="w-full h-[20px] opacity-100 flex items-center justify-between">
                  <div className="flex items-center gap-[12px]">
                    <div className="w-[20px] h-[20px] opacity-100">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2A1E17"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </div>
                    <span className="font-outfit font-normal text-[16px] leading-[100%] text-[#2A1E17] whitespace-nowrap">
                      Email verified
                    </span>
                  </div>
                  <button className="w-[46px] h-[20px] opacity-100 bg-transparent hover:opacity-80 transition-opacity duration-200 cursor-pointer">
                    <span className="font-medium text-[16px] leading-[100%] text-[#51218F] whitespace-nowrap">
                      Verify
                    </span>
                  </button>
                </div>
              </div>

              {/* ========== RIGHT SIDEBAR - GRADIENT PROMO CARD ========== */}
              <div className="relative">
                <div className="w-full h-[98px] opacity-100 rounded-[10px] shadow-[0px_4px_45px_0px_#0000001F] overflow-hidden relative"
                  style={{
                    background: 'linear-gradient(266.38deg, #51218F 4.44%, #020202 100.18%)',
                  }}
                >
                  <div className="absolute inset-0 z-0 rounded-[10px] overflow-hidden">
                    <img
                      src={HomeSub}
                      alt="Promotional background"
                      className="w-full h-full object-cover opacity-30"
                    />
                  </div>
                  <div className="relative z-10 h-full flex items-center pl-6 pr-24">
                    <div>
                      <div className="font-medium text-[18px] leading-tight text-white whitespace-nowrap">
                        Get Subscription for getting
                      </div>
                      <div className="font-medium text-[18px] leading-tight text-white whitespace-nowrap">
                        more revenue in a month
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="absolute w-[60px] h-[60px] lg:w-[98px] lg:h-[98px] top-1/2 right-[5px] lg:right-[-0px] transform -translate-y-1/2 opacity-100 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200 z-10 shadow-lg"
                  style={{
                    background: 'linear-gradient(180deg, #FFA412 0%, #6C4343 100%)',
                  }}
                >
                  <svg
                    width="34"
                    height="34"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>

              {/* ============Right side bottom div============ */}
              <div className="w-full h-[287px] opacity-100 rounded-[10px] bg-white shadow-lg p-6">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="font-montserrat font-medium text-[20px] leading-[100%] text-[#2A1E17]">
                      All Job
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-montserrat font-medium text-[16px] leading-[100%] text-[#2A1E17]">
                      Total:
                    </span>
                    <span className="font-montserrat font-bold text-[20px] leading-[100%] text-[#2A1E17]">
                      {jobs.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="flex items-center">
                    <div className="w-[20px] h-[19px] mr-3 flex items-center justify-center">
                      <img
                        src={Folder}
                        alt="Active projects"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <p className="font-montserrat text-[16px] leading-[100%] text-[#2A1E17E5]">
                        <span className="font-bold">Active projects:</span>
                        <span className="font-medium"> 02</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-[20px] h-[19px] mr-3 flex items-center justify-center">
                      <img
                        src={Cloud}
                        alt="Completed projects"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <p className="font-montserrat text-[16px] leading-[100%] text-[#2A1E17E5]">
                        <span className="font-bold">Completed:</span>
                        <span className="font-medium"> 05</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-[20px] h-[19px] mr-3 flex items-center justify-center">
                      <img
                        src={Cancel}
                        alt="Canceled projects"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <p className="font-montserrat text-[16px] leading-[100%] text-[#2A1E17E5]">
                        <span className="font-bold">Canceled:</span>
                        <span className="font-medium"> 03</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => setActiveTab("best")}
                    className="w-[122px] h-[39px] opacity-100 rounded-[100px] flex items-center justify-center px-[36px] py-[12px] gap-[10px] bg-transparent hover:bg-[#51218F] hover:text-white transition-all duration-200 cursor-pointer group border border-[#51218F]"
                  >
                    <span className="font-montserrat font-bold text-[12px] leading-[100%] text-[#51218F] group-hover:text-white whitespace-nowrap">
                      View all
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default ColHome;