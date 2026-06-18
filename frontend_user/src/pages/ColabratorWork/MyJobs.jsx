import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactCountryFlag from "react-country-flag";
import ColHeader from "../../component/ColHeader";
import Footer from "../../component/Footer";
import api from "../../utils/axiosConfig";
import { useUser } from "../../contexts/UserContext";
import toast from "../../component/Toast";

import heroBg from "../../assets/MyWork/hero-bg.png";
import manageIcon from "../../assets/MyWork/manageicon.png";
import jobIcon from "../../assets/MyWork/job.png";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

function resolveProfilePicUrl(raw) {
  if (!raw) return null;
  const str = String(raw).trim();
  if (!str) return null;
  if (str.startsWith("http://") || str.startsWith("https://")) return str;
  return `${API_BASE}/${str.replace(/^\/+/, "")}`;
}

// Helper function to get country code from location name
const getCountryCodeFromLocation = (location) => {
  if (!location) return null;

  const loc = location.toLowerCase();

  // Common country mappings
  const countryMap = {
    india: "IN",
    bharat: "IN",
    usa: "US",
    "united states": "US",
    america: "US",
    uk: "GB",
    "united kingdom": "GB",
    england: "GB",
    britain: "GB",
    canada: "CA",
    australia: "AU",
    germany: "DE",
    france: "FR",
    japan: "JP",
    china: "CN",
    singapore: "SG",
    malaysia: "MY",
    thailand: "TH",
    vietnam: "VN",
    korea: "KR",
    "south korea": "KR",
    brazil: "BR",
    mexico: "MX",
    italy: "IT",
    spain: "ES",
    netherlands: "NL",
    sweden: "SE",
    norway: "NO",
    denmark: "DK",
    finland: "FI",
    poland: "PL",
    russia: "RU",
    turkey: "TR",
    "south africa": "ZA",
    egypt: "EG",
    nigeria: "NG",
    kenya: "KE",
    argentina: "AR",
    chile: "CL",
    colombia: "CO",
    peru: "PE",
    venezuela: "VE",
    "new zealand": "NZ",
    ireland: "IE",
    portugal: "PT",
    belgium: "BE",
    switzerland: "CH",
    austria: "AT",
    greece: "GR",
    "czech republic": "CZ",
    hungary: "HU",
    romania: "RO",
    ukraine: "UA",
    israel: "IL",
    "saudi arabia": "SA",
    uae: "AE",
    pakistan: "PK",
    bangladesh: "BD",
    "sri lanka": "LK",
    nepal: "NP",
    indonesia: "ID",
    philippines: "PH",
  };

  for (const [country, code] of Object.entries(countryMap)) {
    if (loc.includes(country)) {
      return code;
    }
  }

  // Try to extract from last part of location (e.g., "New York, USA" -> "USA")
  const parts = loc.split(",").map((p) => p.trim());
  const lastPart = parts[parts.length - 1];
  for (const [country, code] of Object.entries(countryMap)) {
    if (lastPart.includes(country)) {
      return code;
    }
  }

  return null;
};

const MyJobs = () => {
  const navigate = useNavigate();
  const { userData, loading: userLoading } = useUser();

  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ totalJobs: 0, totalContracts: 0 });
  const [expandedCardIndex, setExpandedCardIndex] = useState(null);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (userData?.id && !hasFetched.current) {
      hasFetched.current = true;
      fetchMyWorkingJobs();
    } else if (!userLoading && !userData?.id) {
      navigate("/login");
    }
  }, [userData, userLoading, navigate]);

  const handleMoreClick = (e, index) => {
    e.stopPropagation();
    setExpandedCardIndex(expandedCardIndex === index ? null : index);
  };

  const fetchMyWorkingJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/jobs/working/${userData.id}`);
      console.log("Working jobs response:", response.data);

      if (response.data?.contracts && Array.isArray(response.data.contracts)) {
        const workingContracts = response.data.contracts;
        setContracts(workingContracts);
        setStats({
          totalJobs: workingContracts.length,
          totalContracts: workingContracts.length,
        });

        if (workingContracts.length > 0) {
          toast.success(
            `You have ${workingContracts.length} active job${workingContracts.length > 1 ? "s" : ""}`
          );
        }
      } else {
        setContracts([]);
        setStats({ totalJobs: 0, totalContracts: 0 });
      }
    } catch (err) {
      console.error("Error fetching working jobs:", err);
      const status = err.response?.status;
      if (status === 404) toast.error("Working jobs endpoint not found");
      else if (status === 500) toast.error("Server error while fetching jobs");
      else toast.error("Failed to load your working jobs");
      setContracts([]);
      setStats({ totalJobs: 0, totalContracts: 0 });
    } finally {
      setLoading(false);
    }
  };

  const CreatorAvatar = ({ contract, size = 60 }) => {
    const [imgError, setImgError] = useState(false);
    const picUrl = resolveProfilePicUrl(contract?.creator?.profile_picture);
    const name = contract?.creator?.name || contract?.job_title || "C";
    const initial = name.charAt(0).toUpperCase();

    const baseStyle = {
      width: size,
      height: size,
      borderRadius: "50%",
      flexShrink: 0,
    };

    if (picUrl && !imgError) {
      return (
        <img
          src={picUrl}
          alt={name}
          style={{
            ...baseStyle,
            objectFit: "cover",
            border: "2px solid #e5e7eb",
          }}
          onError={() => {
            console.warn("Profile picture failed to load:", picUrl);
            setImgError(true);
          }}
        />
      );
    }

    return (
      <div
        style={{
          ...baseStyle,
          background: "linear-gradient(135deg, #51218F, #2a0e4a)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: 600,
          fontSize: size * 0.38,
          border: "2px solid #e5e7eb",
        }}
      >
        {initial}
      </div>
    );
  };

  const handleMessage = (e, contract) => {
    e.stopPropagation();
    const receiverId = contract.creator?.id || contract.creator_id;
    const receiverName = contract.creator?.name || "Client";

    if (!receiverId) {
      toast.error("Unable to start conversation: No user ID found");
      return;
    }

    navigate("/message", {
      state: {
        receiverId,
        userName: receiverName,
        contractId: contract.contract_id || contract.id,
        jobTitle: contract.job_title || contract.title || "Project",
        openConversation: true,
      },
    });
  };

  const handleContractsClick = () => navigate("/all-contacts");

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "in_progress":
      case "in-progress":
      case "in progress":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "in_review":
      case "in-review":
      case "in review":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "in_progress":
      case "in-progress":
      case "in progress":
        return "In Progress";
      case "in_review":
      case "in-review":
      case "in review":
        return "In Review";
      default:
        return status
          ? status.charAt(0).toUpperCase() + status.slice(1)
          : "Unknown";
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹0.00";

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getSkills = (contract, index) => {
    const fromJob = contract?.job_details?.skills;
    if (Array.isArray(fromJob) && fromJob.length > 0) return fromJob;
    const fallback = [
      ["Poster design", "Mobile design", "Photoshop", "Illustrator"],
      ["UI/UX Design", "Figma", "Wireframing", "Prototyping"],
      ["Web Development", "React", "Node.js", "MongoDB"],
      ["Content Writing", "SEO", "Blog Posts", "Copywriting"],
      ["Video Editing", "Premiere Pro", "After Effects", "Motion Graphics"],
    ];
    return fallback[index % fallback.length];
  };

  return (
    <div
      className="w-full min-h-screen overflow-x-hidden"
      style={{ background: "linear-gradient(180deg, #b7bde4 0%, #0a0515 100%)" }}
    >
      <div className="absolute top-0 left-0 w-full z-50">
        <ColHeader />
      </div>

      {/* HERO SECTION - Responsive */}
      <div
        className="relative w-full h-[220px] sm:h-[260px] md:h-[320px] pt-[80px] sm:pt-[100px]"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/10" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 text-white">
          <div className="pt-2 pb-3 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-white hover:text-white/80 transition-colors group"
            >
              <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-[#51218F] to-[#2a0e4a] group-hover:from-[#3d1768] group-hover:to-[#1a0830] transition-all">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </div>
              <span className="font-medium text-sm sm:text-base">Back</span>
            </button>
            <h1 className="text-2xl sm:text-[26px] md:text-[28px] font-semibold">My Jobs</h1>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT - Fully Responsive */}
      <section className="px-3 sm:px-6 md:px-8 lg:px-12 -mt-[60px] sm:-mt-[80px] pb-16 sm:pb-20 md:pb-24 relative z-20">
        <div className="max-w-[1200px] mx-auto">
          <div className="bg-white rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.08)] p-4 sm:p-5 md:p-6">
            {/* HEADER ROW - Responsive */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6 mb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <img src={manageIcon} className="w-7 h-7 sm:w-[32px] sm:h-[32px]" alt="manage" />
                <p className="text-sm sm:text-[15px] font-medium text-gray-700">
                  Manage your team and active contracts
                </p>
              </div>

              {/* STATS CARDS - Responsive */}
              <div className="flex flex-row gap-3 sm:gap-4 md:gap-6">
                <div className="flex-1 flex items-center gap-2 sm:gap-3 rounded-lg px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-200 shadow-sm">
                  <div className="w-8 h-8 sm:w-[36px] sm:h-[36px] border border-gray-200 flex items-center justify-center rounded-md bg-gray-50">
                    <img src={jobIcon} className="w-4 h-4 sm:w-[20px] sm:h-[20px]" alt="jobs" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-[20px] font-bold text-gray-900">{stats.totalJobs}</p>
                    <p className="text-[10px] sm:text-[13px] text-gray-600 whitespace-nowrap">Total Jobs</p>
                  </div>
                </div>

                <div
                  onClick={handleContractsClick}
                  className="flex-1 flex items-center gap-2 sm:gap-3 rounded-lg px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="w-8 h-8 sm:w-[36px] sm:h-[36px] border border-gray-200 flex items-center justify-center rounded-md bg-gray-50">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#51218F"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="sm:w-5 sm:h-5"
                    >
                      <rect x="2" y="7" width="20" height="14" rx="2" />
                      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                      <line x1="12" y1="12" x2="12" y2="17" />
                      <line x1="9" y1="14.5" x2="15" y2="14.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm sm:text-[20px] font-bold text-gray-900">{stats.totalContracts}</p>
                    <p className="text-[10px] sm:text-[13px] text-gray-600 whitespace-nowrap">Contracts</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTRACTS LIST - Fully Responsive Cards */}
            <div className="flex flex-col gap-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#51218F] mx-auto" />
                  <p className="mt-2 text-gray-500 text-sm sm:text-base">Loading your jobs...</p>
                </div>
              ) : contracts.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <p className="text-gray-500 text-base sm:text-lg">No jobs found</p>
                  <p className="text-gray-400 text-xs sm:text-sm mt-2">Your active jobs will appear here</p>
                </div>
              ) : (
                contracts.map((contract, index) => {
                  const skills = getSkills(contract, index);
                  // Location now comes from the creator's CreatorProfile (via backend),
                  // not from the raw UserData record.
                  const location = contract.creator?.location || "";
                  const countryCode = getCountryCodeFromLocation(location);
                  const contractDescription =
                    contract.work_description?.trim() ||
                    contract.description?.trim() ||
                    "No description provided yet.";

                  return (
                    <div
                      key={contract.contract_id || contract.id || `contract-${index}`}
                      className="
  bg-white
  rounded-xl
  border-2 border-[#E2D7F3]
  shadow-sm
  p-4 sm:p-5 md:p-6
  hover:shadow-lg
  hover:border-[#51218F]
  transition-all duration-200
"
                    >
                      <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                        {/* LEFT SIDE - Avatar and Details */}
                        <div className="flex gap-3 sm:gap-4 flex-1">
                          {/* Avatar - Responsive size */}
                          <div className="flex-shrink-0">
                            <CreatorAvatar contract={contract} size={window.innerWidth < 640 ? 50 : 60} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-[18px] font-semibold text-gray-900 truncate">
                              {contract.job_title || contract.title || "Project"}
                            </h3>
                            <p className="text-xs sm:text-[14px] text-gray-500 mb-2 truncate">
                              {contract.job_details?.expertise_level || "Graphic Designer"}
                            </p>

                            {contract.creator?.name && (
                              <p className="text-xs sm:text-[13px] text-purple-700 font-medium mb-1 truncate">
                                {contract.creator.name}
                              </p>
                            )}

                            {/* Price and Status - Responsive row */}
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="text-sm sm:text-[16px] font-bold text-gray-900">
                                {formatCurrency(contract.budget || contract.amount || 50)}
                              </span>

                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium ${getStatusBadge(contract.status)}`}
                              >
                                {getStatusText(contract.status)}
                              </span>
                            </div>

                            {/* DESCRIPTION + DATES (replaces earnings display) */}
                            <p className="text-xs sm:text-[13px] text-gray-600 mb-2 line-clamp-2">
  <span className="font-semibold text-[#51218F]">
    Description:
  </span>{" "}
  {contractDescription}
</p>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-[13px] text-gray-600 mb-3">
  <span>
    <span className="font-semibold text-[#51218F]">
      Start Date:
    </span>{" "}
    {formatDate(contract.start_date) || "Not set"}
  </span>

  <span>
    <span className="font-semibold text-[#51218F]">
      End Date:
    </span>{" "}
    {formatDate(contract.end_date) || "Not set"}
  </span>
</div>

                            {/* SKILLS - Responsive wrapping */}
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3">
                              {(expandedCardIndex === index ? skills : skills.slice(0, 3)).map(
                                (skill, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#6A3FA0] text-white text-[10px] sm:text-[12px] font-medium"
                                  >
                                    {skill}
                                  </span>
                                )
                              )}
                              {skills.length > 3 && (
                                <button
                                  onClick={(e) => handleMoreClick(e, index)}
                                  className="text-[#6A3FA0] text-[11px] sm:text-[13px] font-medium cursor-pointer hover:underline"
                                >
                                  {expandedCardIndex === index ? "Show less" : `+${skills.length - 3} more`}
                                </button>
                              )}
                            </div>

                            {/* RATING + LOCATION - Responsive with flag */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] sm:text-[13px]">
                              <div className="flex items-center gap-1">
                                <div className="flex text-yellow-500 text-xs sm:text-[14px]">
                                  {(() => {
                                    const ratingValue = contract.creator?.rating || 0;
                                    const fullStars = Math.floor(ratingValue);
                                    const hasHalfStar = ratingValue - fullStars >= 0.5;
                                    return (
                                      <>
                                        {"★".repeat(fullStars)}
                                        {hasHalfStar && "½"}
                                        {"☆".repeat(5 - fullStars - (hasHalfStar ? 1 : 0))}
                                      </>
                                    );
                                  })()}
                                </div>
                                <span className="text-gray-600">
                                  {(contract.creator?.rating || 0).toFixed(1)}/5
                                </span>
                                <span className="text-gray-400 hidden xs:inline">
                                  ({contract.creator?.reviews_count || 0} Reviews)
                                </span>
                              </div>

                              {/* Dynamic Flag Display */}
                              <div className="flex items-center gap-1">
                                {countryCode ? (
                                  <ReactCountryFlag
                                    countryCode={countryCode}
                                    svg
                                    style={{
                                      width: "14px",
                                      height: "10px",
                                      borderRadius: "2px",
                                      display: "block",
                                    }}
                                    title={location}
                                  />
                                ) : (
                                  <div className="w-[14px] h-[10px] bg-gray-200 rounded-sm" />
                                )}
                                <span className="text-gray-600 truncate max-w-[150px] sm:max-w-none">
                                  {location || "Location not specified"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* RIGHT SIDE - Message Button - Responsive */}
                        <div className="flex items-start sm:items-center sm:justify-end sm:flex-shrink-0">
                          <button
                            onClick={(e) => handleMessage(e, contract)}
                            className="w-full sm:w-auto px-4 sm:px-6 py-1.5 sm:py-2 text-[13px] sm:text-[14px] font-medium rounded-full bg-[#51218F] text-white hover:bg-[#3d1768] transition-colors"
                          >
                            Message
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER - Responsive */}
      <div className="-mx-3 sm:-mx-4">
        <Footer />
      </div>
    </div>
  );
};

export default MyJobs;