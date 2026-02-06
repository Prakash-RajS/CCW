import Header from "../../component/Header";
import Footer from "../../component/Footer";
import HomeBg from "../../assets/AfterSign/HomeBg.png";
import Dp1 from "../../assets/AfterSign/Dp1.jpg";
import Dp2 from "../../assets/AfterSign/Dp2.jpg";
import Dp3 from "../../assets/AfterSign/Dp3.jpg";
import Dp4 from "../../assets/AfterSign/Dp4.jpg";
import HomeSub from "../../assets/AfterSign/HomeSub.png";
import Folder from "../../assets/AfterSign/Folder.png";
import Cloud from "../../assets/AfterSign/Cloud.png";
import Cancel from "../../assets/AfterSign/Cancel.png";
import flag from "../../assets/Mywork/flag.png"; // ADDED: import flag image
import { useNavigate } from "react-router-dom";
import SavedDraft from "./SavedDraft";
import { useEffect, useState } from "react";
import api from "../../utils/axiosConfig";

const JobCreated = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("discover");
  const [showAllJobsPopup, setShowAllJobsPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedDescJobId, setExpandedDescJobId] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [verifyType, setVerifyType] = useState(null);
  const [otp, setOtp] = useState("");
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [userData, setUserData] = useState(null);

  const avatars = [Dp1, Dp2, Dp3, Dp4];

  /* ================= FETCH USER DATA ================= */
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await api.get("/auth/me");
        setUserData(res.data);
      } catch (err) {
        console.error("Failed to fetch user data", err);
      }
    };
    fetchUserData();
  }, []);

  /* ================= FETCH JOBS - UPDATED WITH SAVEDDRAFT LOGIC ================= */
  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        setLoading(true);
        const me = await api.get("/auth/me");
        const employerId = me.data.id;

        // Fetch jobs - using the correct endpoint
        const res = await api.get(`/jobs/my-jobs/${employerId}?status=posted`);
        const rawJobs = res.data.jobs || [];

        // Process each job - UPDATED TO MATCH SAVEDDRAFT LOGIC
        const processedJobs = rawJobs.map((job) => {
          // Parse skills if needed
          const parseSkills = (skills) => {
            if (!skills) return [];
            if (Array.isArray(skills)) return skills;
            try {
              return JSON.parse(skills);
            } catch {
              if (typeof skills === 'string') {
                return skills.split(',').map(s => s.trim()).filter(s => s);
              }
              return [];
            }
          };

          const jobSkills = parseSkills(job.skills);

          // Calculate posted time
          const postedTime = job.created_at ? calculateTimeAgo(job.created_at) : "Posted";

          // Format expertise level
          const formatExpertiseLevel = (level) => {
            if (!level) return "Intermediate";
            return level.charAt(0).toUpperCase() + level.slice(1);
          };

          // Format budget - UPDATED TO MATCH SAVEDDRAFT LOGIC
          const formatBudget = (job) => {
            if (!job.budget_type) return "Budget not specified";

            if (job.budget_type?.toLowerCase() === "hourly" && job.budget_from && job.budget_to) {
              return `$${job.budget_from} – $${job.budget_to}/hr`;
            } else if (job.budget_type?.toLowerCase() === "hourly" && job.budget_from) {
              return `$${job.budget_from}/hr`;
            } else if (job.budget_type?.toLowerCase() === "fixed" && job.budget_from) {
              return `$${job.budget_from}`;
            }

            return "Budget not specified";
          };

          return {
            ...job,
            skills: jobSkills,
            posted_time: postedTime,
            // Location fields for flag display
            city: job.city || "",
            country: job.country || "",
            country_code: job.country_code || "",
            // Rating fields - using actual values if available
            rating: job.rating || 0,
            reviews: job.reviews || 0,
            formatted_expertise: formatExpertiseLevel(job.expertise_level),
            formatted_budget: formatBudget(job),
            // Default values for missing data
            proposals_count: job.proposals_count || 0,
            hired_count: job.hired_count || 0,
            posted_ago: postedTime // Added for consistency with SavedDraft
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

    fetchMyJobs();
  }, [userData]);

  // Helper function to calculate time ago
  const calculateTimeAgo = (dateString) => {
    try {
      if (!dateString) return "Posted";

      // FIX: make backend datetime ISO-compatible
      const jobDate = new Date(dateString.replace(" ", "T") + "Z");
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

  // Helper function to format budget - UPDATED TO MATCH SAVEDDRAFT
  const formatBudget = (job) => {
    if (!job.budget_type) return "Budget not specified";

    if (job.budget_type?.toLowerCase() === "hourly" && job.budget_from && job.budget_to) {
      return `$${job.budget_from} – $${job.budget_to}/hr`;
    } else if (job.budget_type?.toLowerCase() === "hourly" && job.budget_from) {
      return `$${job.budget_from}/hr`;
    } else if (job.budget_type?.toLowerCase() === "fixed" && job.budget_from) {
      return `$${job.budget_from}`;
    }

    return "Budget not specified";
  };

  // Helper function to format expertise level
  const formatExpertiseLevel = (level) => {
    if (!level) return "Intermediate";
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  /* ================= STATISTICS ================= */
  const latestJob = jobs.length > 0 ? jobs[0] : null;
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => j.status === "posted").length;
  const completedJobs = jobs.filter(j => j.status === "completed").length;
  const cancelledJobs = jobs.filter(j => j.status === "cancelled").length;

  // UPDATED: Render stars with actual rating - MATCHING SAVEDDRAFT LOGIC
  const renderStars = (rating) => {
    const roundedRating = Math.round(rating || 0);
    return (
      <span className="text-[#4B1D8C]">
        {"★".repeat(roundedRating)}
        {"☆".repeat(5 - roundedRating)}
      </span>
    );
  };

  // UPDATED: Format rating display - MATCHING SAVEDDRAFT LOGIC
  const formatRatingDisplay = (rating, reviews) => {
    const ratingValue = rating || 0;
    const reviewsCount = reviews || 0;

    if (reviewsCount === 0) {
      return "No reviews yet";
    }
    return `${ratingValue}/5 (${reviewsCount} Review${reviewsCount !== 1 ? 's' : ''})`;
  };

  /* ================= HANDLERS ================= */
  const sendOtp = async (type) => {
    try {
      setIsOtpModalOpen(true);
      setVerifyType(type);
      setIsSendingOtp(true);

      // Check if endpoints exist before calling
      const endpoint = type === "phone" ? "/verification/phone/send-otp" : "/verification/email/send-otp";
      await api.post(endpoint);

      alert("OTP sent successfully");
    } catch (error) {
      console.error("OTP send failed", error);
      alert("Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    try {
      if (!otp) {
        alert("Enter OTP");
        return;
      }

      const endpoint = verifyType === "phone" ? "/verification/phone/verify-otp" : "/verification/email/verify-otp";
      await api.post(endpoint, { otp });

      alert(`${verifyType} verified successfully`);
      setIsOtpModalOpen(false);
      setOtp("");
    } catch (err) {
      console.error("OTP verification failed", err);
      alert("Invalid OTP");
    }
  };

  // Handler for edit job
  const handleEditJob = (jobId) => {
    navigate(`/edit-job/${jobId}`);
  };

  // Handler for delete job
  const handleDeleteJob = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        // Try the correct endpoint structure
        await api.delete(`/jobs/${jobId}/delete`)

        // Remove job from state
        setJobs(jobs.filter(job => job.id !== jobId));
        alert("Job deleted successfully");
      } catch (err) {
        console.error("Failed to delete job", err);

        // Fallback: still remove from UI if API fails
        setJobs(jobs.filter(job => job.id !== jobId));
        alert("Job removed from view (API may have failed)");
      }
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col overflow-x-hidden relative bg-gray-50">
      <section className="w-full flex flex-col items-center justify-start px-4 relative min-w-0">

        {/* ================= BACKGROUND ================= */}
        <div
          className="absolute top-[-104px] left-0 w-full h-[382px] md:h-[582px] z-0"
          style={{
            backgroundImage: `url(${HomeBg})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="absolute inset-0 bg-black opacity-30" />
        </div>

        {/* ================= WELCOME ================= */}
        <div className="absolute top-[70px] lg:top-[187px] w-full flex items-center justify-center z-10">
          <h1
            className="text-[20px] lg:text-[48px] leading-tight text-center text-white font-normal"
            style={{ fontFamily: "Milonga" }}
          >
            Welcome back, {userData?.first_name || "User"}
          </h1>
        </div>

        <Header />

        {/* ================= MAIN ================= */}
        <div className="w-full max-w-[1400px] mx-auto mt-[240px] lg:mt-[412px] px-4 flex flex-col lg:flex-row gap-8">

          {/* ================= LEFT ================= */}
          <main className="w-full lg:w-[860px] flex flex-col gap-6">

            {/* ===== POSTED JOB SUMMARY ===== */}
            <div className="w-full rounded-[8px] bg-white shadow-md p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-[18px] text-[#2A1E17]">
                  Your Had Posted a Job
                </h3>
                <button
                  onClick={() => setShowAllJobsPopup(true)}
                  className="ring-1 ring-[#51218F] rounded-full px-3 py-1.5 text-[#51218F] text-[10px] font-bold hover:bg-[#51218F] hover:text-white transition"
                >
                  View all jobs
                </button>
              </div>

              {loading ? (
                <p className="text-gray-400">Loading...</p>
              ) : !latestJob ? (
                <p className="text-gray-500">You have not posted any job yet.</p>
              ) : (
                <div className="flex justify-between text-[12px]">
                  <div>
                    <p className="font-bold">{latestJob.title}</p>
                    <p className="text-gray-600">
                      {latestJob.budget_type === "fixed" ? "Fixed-price" : "Hourly"} · Est. Budget:{" "}
                      {latestJob.formatted_budget}
                    </p>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <p className="font-bold">Proposals</p>
                      <p className="text-gray-600">{latestJob.proposals_count}</p>
                    </div>
                    <div>
                      <p className="font-bold">Hired</p>
                      <p className="text-gray-600">{latestJob.hired_count}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ===== TABS ===== */}
            <div className="relative">
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200" />
              <div className="flex">
                {["discover", "saved"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative px-5 py-3 font-medium ${activeTab === tab
                      ? "text-[#51218F] font-semibold"
                      : "text-gray-600"
                      }`}
                  >
                    {tab === "discover" ? "View All Jobs" : "Saved Draft"}
                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#51218F]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ===== DISCOVER/JOB LIST ===== */}
            {activeTab === "discover" ? (
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading jobs...</p>
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-lg p-6">
                    <p className="text-gray-500 mb-4">You haven't posted any jobs yet.</p>
                    <button
                      onClick={() => navigate("/post-job")}
                      className="bg-[#51218F] text-white rounded-full px-6 py-2 text-sm font-semibold hover:bg-[#3f1872]"
                    >
                      Post Your First Job
                    </button>
                  </div>
                ) : (
                  jobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-white rounded-lg shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow"
                    >
                      {/* Job Title and Posted Time Row */}
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-[18px] text-[#2A1E17] mb-1">
                            {job.title}
                          </h4>
                          <p className="text-gray-500 text-[14px]">
                            {job.budget_type === "fixed" ? "Fixed-price" : "Hourly"} ·{" "}
                            {job.formatted_expertise} · Est. Budget: {job.formatted_budget} ·{" "}
                            {job.posted_time}
                          </p>
                        </div>
                      </div>

                      {/* Job Description */}
                      <p className="text-gray-600 text-[15px] mb-4 leading-relaxed">
                        {expandedDescJobId === job.id
                          ? job.description || "No description available"
                          : `${job.description?.slice(0, 150) || "No description available"}...`}

                        {job.description && job.description.length > 150 && (
                          <button
                            onClick={() => setExpandedDescJobId(expandedDescJobId === job.id ? null : job.id)}
                            className="text-[#51218F] ml-1 font-medium hover:underline"
                          >
                            {expandedDescJobId === job.id ? "Show less" : "more"}
                          </button>
                        )}
                      </p>

                      {/* Footer with Rating, Location, and Actions */}
                      <div className="flex justify-between items-center pt-4 border-t border-gray-100 flex-wrap gap-4">
                        {/* LEFT: Rating + Location - UPDATED TO MATCH SAVEDDRAFT */}
                        <div className="flex items-center gap-3 md:gap-5 text-[12px] md:text-[14px] text-gray-500 flex-wrap font-['Montserrat']">
                          {/* Budget Type */}
                          <span className="text-[#4B1D8C] font-medium">
                            {job.budget_type?.toLowerCase() === "fixed"
                              ? "$ Fixed Rate"
                              : "$ Hourly Rate"}
                          </span>

                          {/* Rating - UPDATED */}
                          <div className="flex items-center gap-2">
                            <span className="text-[#4B1D8C]">
                              {"★".repeat(Math.round(job.rating || 0))}
                              {"☆".repeat(5 - Math.round(job.rating || 0))}
                            </span>
                            <span>
                              {job.rating || 0}/5 ({job.reviews || 0} Review{job.reviews !== 1 ? 's' : ''})
                            </span>
                          </div>

                          {/* Location with Flag - UPDATED TO MATCH SAVEDDRAFT */}
                          <div className="flex items-center gap-2">
                            {job.country_code ? (
                              <img
                                src={`https://flagcdn.com/w20/${job.country_code.toLowerCase()}.png`}
                                alt={job.country}
                                className="w-[18px] h-[12px] rounded-[4px] object-cover"
                              />
                            ) : (
                              <img
                                src={flag}
                                alt="flag"
                                className="w-[18px] h-[12px] rounded-[4px] object-cover"
                              />
                            )}
                            <span>
                              {job.city}
                              {job.city && job.country ? ", " : ""}
                              {job.country}
                            </span>
                          </div>
                        </div>

                        {/* Edit and Delete Buttons */}
                        <div className="flex items-center gap-3">
                          {/* EDIT BUTTON */}
                          <button
                            onClick={() => handleEditJob(job.id)}
                            className="w-[25px] h-[25px] rounded-full flex items-center justify-center
                              bg-gradient-to-br from-[#51218F] to-[#2E0F55]
                              hover:opacity-90 transition"
                            title="Edit job"
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                          </button>

                          {/* DELETE BUTTON */}
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="w-[25px] h-[25px] rounded-full flex items-center justify-center
                              bg-[#FF3B3B] hover:bg-[#E02E2E] transition"
                            title="Delete job"
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <SavedDraft />
            )}
          </main>

          {/* ================= RIGHT SIDEBAR ================= */}
          <aside className="hidden lg:flex flex-col w-[420px] gap-8">
            <button
              onClick={() => navigate("/finder")}
              className="w-[190px] self-end h-[39px] rounded-full bg-gradient-to-r from-[#51218F] to-[#170929] text-white font-bold text-[12px]"
            >
              Find collaborator
            </button>

            {/* PROFILE CARD */}
            <div className="bg-white rounded-[10px] shadow-lg p-6 text-center">
              <h3 className="font-bold text-[22px]">
                {userData?.first_name || "User"}
              </h3>
              <p className="text-[14px] text-gray-600">
                {userData?.role === "creator" ? "Creator" : "Collaborator"}
              </p>

              <div className="mt-4">
                <div className="flex justify-between font-bold text-[14px]">
                  <span>Set up your account</span>
                  <span>75%</span>
                </div>
                <div className="w-full h-[6px] bg-gray-200 rounded-full mt-2">
                  <div className="h-full bg-[#51218F] w-[75%] rounded-full" />
                </div>
              </div>

              <button
                onClick={() => navigate("/profile")}
                className="w-full mt-6 rounded-full py-3 text-[#51218F] border border-[#51218F] font-bold text-[12px] hover:bg-[#51218F] hover:text-white transition-colors"
              >
                Complete your profile
              </button>
            </div>

            {/* ================= VERIFICATION ================= */}
            <div className="w-full bg-white rounded-[10px] shadow-lg p-6">
              <h3 className="font-semibold text-[20px] mb-4">Verification</h3>
              <div className="flex flex-col gap-5">
                <div className="flex justify-between items-center text-[16px] text-[#2A1E17]">
                  <span>Phone verified</span>
                  <button
                    onClick={() => sendOtp("phone")}
                    className="text-[#51218F] font-medium hover:underline"
                  >
                    {userData?.phone_verified ? "Verified" : "Verify"}
                  </button>
                </div>

                <div className="flex justify-between items-center text-[16px] text-[#2A1E17]">
                  <span>Email verified</span>
                  <button
                    onClick={() => sendOtp("email")}
                    className="text-[#51218F] font-medium hover:underline"
                  >
                    {userData?.email_verified ? "Verified" : "Verify"}
                  </button>
                </div>
              </div>
            </div>

            {/* ================= GRADIENT PROMO ================= */}
            <div className="relative">
              <div
                className="w-full h-[98px] rounded-[10px] shadow-[0px_4px_45px_0px_#0000001F] overflow-hidden relative"
                style={{
                  background: "linear-gradient(266.38deg, #51218F 4.44%, #020202 100.18%)",
                }}
              >
                <div className="absolute inset-0">
                  <img
                    src={HomeSub}
                    alt=""
                    className="w-full h-full object-cover opacity-30"
                  />
                </div>

                <div className="relative z-10 h-full flex items-center pl-6 pr-24">
                  <div>
                    <div className="font-medium text-[18px] text-white">
                      Get Subscription for getting
                    </div>
                    <div className="font-medium text-[18px] text-white">
                      more revenue in a month
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="absolute w-[65px] h-[65px] lg:w-[102px] lg:h-[102px] top-1/2 right-[-15px] lg:right-[-30px] -translate-y-1/2 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
                style={{
                  background: "linear-gradient(180deg, #FFA412 0%, #6C4343 100%)",
                }}
              >
                <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </div>

            {/* ================= JOB STATS ================= */}
            <div className="w-full h-[287px] rounded-[10px] bg-white shadow-lg p-6">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-[20px] font-medium text-[#2A1E17]">All Job</h3>
                <div className="flex gap-1">
                  <span className="text-[16px]">Total:</span>
                  <span className="font-bold text-[20px]">{totalJobs}</span>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                <div className="flex items-center">
                  <img src={Folder} className="w-5 mr-3" alt="Folder" />
                  <span>Active projects: {activeJobs}</span>
                </div>

                <div className="flex items-center">
                  <img src={Cloud} className="w-5 mr-3" alt="Cloud" />
                  <span>Completed projects: {completedJobs}</span>
                </div>

                <div className="flex items-center">
                  <img src={Cancel} className="w-5 mr-3" alt="Cancel" />
                  <span>Cancelled projects: {cancelledJobs}</span>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setShowAllJobsPopup(true)}
                  className="w-[122px] h-[39px] rounded-full border border-[#51218F] text-[#51218F] font-bold hover:bg-[#51218F] hover:text-white transition-colors"
                >
                  View all
                </button>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ================= VIEW ALL JOBS POPUP ================= */}
      {showAllJobsPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="relative bg-white w-full max-w-[760px] max-h-[85vh] rounded-[18px] shadow-2xl flex flex-col">

            {/* ===== HEADER ===== */}
            <div className="flex items-center justify-between px-6 py-5 border-b">
              <div>
                <h2 className="text-[22px] font-bold text-[#2A1E17]">
                  All Posted Jobs ({totalJobs})
                </h2>
                <p className="text-[13px] text-gray-500 mt-1">
                  Showing all jobs you have posted
                </p>
              </div>

              <button
                onClick={() => setShowAllJobsPopup(false)}
                className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition"
              >
                ✕
              </button>
            </div>

            {/* ===== CONTENT ===== */}
            <div className="px-6 py-6 overflow-y-auto space-y-6">
              {loading ? (
                <div className="text-center text-gray-500 py-12">
                  Loading jobs...
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No jobs found.</p>
                  <button
                    onClick={() => navigate("/post-job")}
                    className="bg-[#51218F] text-white rounded-full px-6 py-2 text-sm font-semibold hover:bg-[#3f1872]"
                  >
                    Post Your First Job
                  </button>
                </div>
              ) : (
                jobs.map((job) => (
                  <div key={job.id} className="pb-6 border-b last:border-none">
                    <h3 className="text-[18px] font-semibold text-[#2A1E17] mb-2">
                      {job.title}
                    </h3>

                    <p className="text-[14px] text-gray-500 mb-3">
                      {job.budget_type === "fixed" ? "Fixed-price" : "Hourly"} ·{" "}
                      {job.formatted_expertise} · Est. Budget: {job.formatted_budget} ·{" "}
                      {job.posted_time}
                    </p>

                    {job.description && (
                      <p className="text-[15px] text-gray-600 mb-4 leading-relaxed">
                        {expandedDescJobId === job.id
                          ? job.description
                          : `${job.description.slice(0, 120)}...`}

                        {job.description.length > 120 && (
                          <button
                            onClick={() =>
                              setExpandedDescJobId(
                                expandedDescJobId === job.id ? null : job.id
                              )
                            }
                            className="text-[#51218F] ml-1 font-medium hover:underline"
                          >
                            {expandedDescJobId === job.id ? "Show less" : "more"}
                          </button>
                        )}
                      </p>
                    )}

                    <div className="flex justify-between items-center">
                      {/* UPDATED: Rating and location display in popup */}
                      <div className="flex items-center gap-3 text-[12px] md:text-[14px] text-gray-500">
                        {/* Rating */}
                        <div className="flex items-center gap-2">
                          <span className="text-[#4B1D8C]">
                            {"★".repeat(Math.round(job.rating || 0))}
                            {"☆".repeat(5 - Math.round(job.rating || 0))}
                          </span>
                          <span>
                            {job.rating || 0}/5 ({job.reviews || 0} Review{job.reviews !== 1 ? 's' : ''})
                          </span>
                        </div>

                        {/* Location with Flag */}
                        <div className="flex items-center gap-2">
                          {job.country_code ? (
                            <img
                              src={`https://flagcdn.com/w20/${job.country_code.toLowerCase()}.png`}
                              alt={job.country}
                              className="w-[18px] h-[12px] rounded-[4px] object-cover"
                            />
                          ) : (
                            <img
                              src={flag}
                              alt="flag"
                              className="w-[18px] h-[12px] rounded-[4px] object-cover"
                            />
                          )}
                          <span>
                            {job.city}
                            {job.city && job.country ? ", " : ""}
                            {job.country}
                          </span>
                        </div>
                      </div>

                      {/* Edit and Delete Buttons */}
                      <div className="flex items-center gap-3">
                        {/* EDIT BUTTON */}
                        <button
                          onClick={() => handleEditJob(job.id)}
                          className="w-[25px] h-[25px] rounded-full flex items-center justify-center
                              bg-gradient-to-br from-[#51218F] to-[#2E0F55]
                              hover:opacity-90 transition"
                          title="Edit job"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                          </svg>
                        </button>

                        {/* DELETE BUTTON */}
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="w-[25px] h-[25px] rounded-full flex items-center justify-center
                              bg-[#FF3B3B] hover:bg-[#E02E2E] transition"
                          title="Delete job"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= OTP MODAL ================= */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-[12px] w-full max-w-sm p-6 relative">
            <button
              onClick={() => setIsOtpModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500"
            >
              ✕
            </button>

            <h3 className="text-[18px] font-bold mb-4">
              Verify {verifyType === "phone" ? "Phone" : "Email"}
            </h3>

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full border rounded-md px-3 py-2 mb-4"
            />

            <button
              onClick={verifyOtp}
              className="w-full bg-[#51218F] text-white rounded-full py-2 font-semibold hover:opacity-90"
            >
              Verify OTP
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default JobCreated;