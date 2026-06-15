import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axiosConfig";
import toast from "../../component/Toast";
import ReactCountryFlag from "react-country-flag";

import Header from "../../component/Header";
import Footer from "../../component/Footer";
import HomeBg from "../../assets/AfterSign/HomeBg.png";
import Filter from "../../assets/AfterSign/Filter.png";
import Skill3 from "../../assets/Landing/Skill3.png";
import Dp1 from "../../assets/AfterSign/Dp1.jpg";
import Ind from "../../assets/AfterSign/Ind.jpg";
import Dp2 from "../../assets/AfterSign/Dp2.jpg";
import Dp3 from "../../assets/AfterSign/Dp3.jpg";
import Dp4 from "../../assets/AfterSign/Dp4.jpg";
import USAFlag from "../../assets/AfterSign/Usa.png";
import UKFlag from "../../assets/AfterSign/Chn.jpg";
import CanadaFlag from "../../assets/AfterSign/Trc.jpg";
import HomeSub from "../../assets/AfterSign/HomeSub.png";
import Folder from "../../assets/AfterSign/Folder.png";
import Cloud from "../../assets/AfterSign/Cloud.png";
import Cancel from "../../assets/AfterSign/Cancel.png";
import Success from "../../assets/Auth/Succes.png";

// ========== FILTER POPUP COMPONENT ==========
const FilterPopup = ({
  isOpen,
  onClose,
  onApplyFilter,
  currentFilters,
  collaboratorCount,
}) => {
  const [filters, setFilters] = useState({
    minHourlyRate: "",
    maxHourlyRate: "",
    minRating: "",
    location: "",
    skills: "",
  });

  const [isRatingDropdownOpen, setIsRatingDropdownOpen] = useState(false);
  const ratingDropdownRef = useRef(null);

  useEffect(() => {
    if (currentFilters && Object.keys(currentFilters).length > 0) {
      setFilters({
        minHourlyRate: currentFilters.minHourlyRate || "",
        maxHourlyRate: currentFilters.maxHourlyRate || "",
        minRating: currentFilters.minRating || "",
        location: currentFilters.location || "",
        skills: currentFilters.skills || "",
      });
    } else {
      setFilters({
        minHourlyRate: "",
        maxHourlyRate: "",
        minRating: "",
        location: "",
        skills: "",
      });
    }
  }, [currentFilters]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        ratingDropdownRef.current &&
        !ratingDropdownRef.current.contains(event.target)
      ) {
        setIsRatingDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const ratingOptions = [
    { value: "", label: "Any rating" },
    { value: "4.5", label: "4.5+ stars" },
    { value: "4.0", label: "4.0+ stars" },
    { value: "3.5", label: "3.5+ stars" },
    { value: "3.0", label: "3.0+ stars" },
  ];

  const getRatingLabel = (value) => {
    const option = ratingOptions.find((opt) => opt.value === value);
    return option ? option.label : "Any rating";
  };

  const handleFilterChange = (field, value) => {
    const safeValue = value === undefined || value === null ? "" : value;

    if (safeValue === "") {
      setFilters((prev) => ({ ...prev, [field]: "" }));
      return;
    }

    const numericFields = ["minHourlyRate", "maxHourlyRate"];

    if (numericFields.includes(field)) {
      let num = Number(safeValue);
      if (isNaN(num)) return;
      if (num < 0) num = 0;
      setFilters((prev) => ({ ...prev, [field]: num }));
    } else if (field === "minRating") {
      setFilters((prev) => ({ ...prev, [field]: safeValue }));
      setIsRatingDropdownOpen(false);
    } else {
      let sanitizedValue = safeValue;
      if (field === "location") {
        sanitizedValue = safeValue.replace(/[^a-zA-Z0-9,\-\s]/g, "");
      }
      if (field === "skills") {
        sanitizedValue = safeValue.replace(/[^a-zA-Z0-9,\s]/g, "");
      }
      setFilters((prev) => ({ ...prev, [field]: sanitizedValue }));
    }
  };


 


  const handleApply = () => {
    const min = Number(filters.minHourlyRate);
    const max = Number(filters.maxHourlyRate);
    const isValidLocation = (location) => {
      return /^[a-zA-Z\s,-]+$/.test(location) && /[a-zA-Z]/.test(location);
    };
    const isValidSkills = (skills) => {
      const skillList = skills.split(",").map((s) => s.trim());
      return skillList.every(
        (skill) => /^[a-zA-Z\s]+$/.test(skill) && skill.length >= 2,
      );
    };

    if (min < 0 || max < 0) {
      toast.error("Hourly rate cannot be negative");
      return;
    }
    if (min && max && min > max) {
      toast.error("Min rate cannot be greater than max rate");
      return;
    }
    if (filters.location) {
      if (!isValidLocation(filters.location.trim())) {
        toast.error("Enter valid location (only letters allowed)");
        return;
      }
    }
    if (filters.skills) {
      if (!isValidSkills(filters.skills.trim())) {
        toast.error("Enter valid skills (e.g., React, Python)");
        return;
      }
    }

    const activeFilters = {};
    Object.keys(filters).forEach((key) => {
      const value = filters[key];
      if (value && value.toString().trim() !== "") {
        activeFilters[key] = value;
      }
    });

    onApplyFilter(activeFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      minHourlyRate: "",
      maxHourlyRate: "",
      minRating: "",
      location: "",
      skills: "",
    };
    setFilters(resetFilters);
    onApplyFilter({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#51218F] to-[#2a0e4a] px-5 py-3">
          <h3 className="text-lg font-bold text-white text-center">
            Filter Collaborators
          </h3>
          <p className="text-white/80 text-center text-xs mt-0.5">
            {collaboratorCount} collaborators available
          </p>
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>

        <div className="p-5">
          <div className="space-y-4">
            {/* <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Hourly Rate (₹)
              </label>
              <div className="flex flex-row items-center gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    onWheel={(e) => {
                      e.preventDefault();
                      e.target.blur();
                    }}
                    placeholder="Min"
                    value={filters.minHourlyRate || ""}
                    onChange={(e) =>
                      handleFilterChange("minHourlyRate", e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e") e.preventDefault();
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-400 rounded-lg focus:outline-none focus:border-gray-600 bg-white"
                    style={{ border: "1px solid #9CA3AF" }}
                  />
                </div>
                <span className="text-gray-500 text-sm font-medium flex-shrink-0">
                  —
                </span>
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    onWheel={(e) => {
                      e.preventDefault();
                      e.target.blur();
                    }}
                    placeholder="Max"
                    value={filters.maxHourlyRate || ""}
                    onChange={(e) =>
                      handleFilterChange("maxHourlyRate", e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e") e.preventDefault();
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-400 rounded-lg focus:outline-none focus:border-gray-600 bg-white"
                    style={{ border: "1px solid #9CA3AF" }}
                  />
                </div>
              </div>
            </div> */}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Minimum Rating
              </label>
              <div className="relative" ref={ratingDropdownRef}>
                <div
                  onClick={() => setIsRatingDropdownOpen(!isRatingDropdownOpen)}
                  className="w-full px-3 py-2 text-sm border border-gray-400 rounded-lg bg-white flex items-center justify-between cursor-pointer"
                  style={{ border: "1px solid #9CA3AF" }}
                >
                  <span
                    className={
                      filters.minRating ? "text-gray-900" : "text-gray-500"
                    }
                  >
                    {getRatingLabel(filters.minRating || "")}
                  </span>
                  <svg
                    className={`transform transition-transform duration-200 ${isRatingDropdownOpen ? "rotate-180" : ""}`}
                    width="12"
                    height="8"
                    viewBox="0 0 12 8"
                    fill="none"
                  >
                    <path
                      d="M1 1.5L6 6.5L11 1.5"
                      stroke="#6B7280"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                {isRatingDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
                    {ratingOptions.map((option) => (
                      <div
                        key={option.value}
                        onClick={() =>
                          handleFilterChange("minRating", option.value)
                        }
                        className={`px-3 py-2 cursor-pointer transition-colors hover:bg-gray-100 text-sm ${filters.minRating === option.value ? "bg-purple-50 text-[#51218F] font-semibold" : "text-gray-700"} ${option.value === "" ? "text-gray-500" : ""}`}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Location
              </label>
              <input
                type="text"
                placeholder="City, Country, or Remote"
                value={filters.location || ""}
                onChange={(e) => handleFilterChange("location", e.target.value)}
                onKeyDown={(e) => {
                  const allowed = /^[a-zA-Z0-9,\-\s]$/;
                  if (!allowed.test(e.key) && e.key !== "Backspace")
                    e.preventDefault();
                }}
                className="w-full px-3 py-2 text-sm border border-gray-400 rounded-lg focus:outline-none focus:border-gray-600 bg-white"
                style={{ border: "1px solid #9CA3AF" }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Skills
              </label>
              <input
                type="text"
                placeholder="e.g., React, Python, UI/UX"
                value={filters.skills || ""}
                onChange={(e) => handleFilterChange("skills", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-400 rounded-lg focus:outline-none focus:border-gray-600 bg-white"
                style={{ border: "1px solid #9CA3AF" }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple skills with commas
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-5 pt-3 border-t border-gray-200">
            <button
              onClick={handleReset}
              className="flex-1 px-3 py-2 rounded-lg !border !border-[rgba(38,50,56,1)] bg-white text-[rgba(38,50,56,1)] text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-[#51218F] to-[#2a0e4a] text-white text-sm font-medium hover:from-[#6a2ec2] hover:to-[#3a1a5a] transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== INVITE POPUP COMPONENT ==========
const InvitePopup = ({
  isOpen,
  onClose,
  collaborator,
  currentUser,
  jobs,
  onInvite,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [invitedJobs, setInvitedJobs] = useState({});
  const [isCheckingInvites, setIsCheckingInvites] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [jobSearch, setJobSearch] = useState("");
  const dropdownRef = useRef(null);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);

  const resetForm = () => {
    setSearchTerm("");
    setJobSearch("");
    setFilteredJobs([]);
    setInvitedJobs({});
    setSelectedJobId(null);
    setHasStartedTyping(false);
    setIsSubmitting(false);
    setIsCheckingInvites(false);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const checkInvitedJobs = async () => {
      if (!isOpen || !collaborator?.id || !currentUser?.id) return;
      setIsCheckingInvites(true);
      try {
        const response = await api.get(`/invitations/list/${collaborator.id}`);
        if (response.data && response.data.invitations) {
          const sentByMe = response.data.invitations.filter(
            (inv) => inv.sender_id === currentUser.id,
          );
          const invitedMap = {};

          sentByMe
            .filter((inv) => ["Pending", "Accepted"].includes(inv.status))
            .forEach((inv) => {
              invitedMap[inv.job_id] = true;
            });
        }
      } catch (error) {
        console.error("Error checking invited jobs:", error);
        setInvitedJobs({});
      } finally {
        setIsCheckingInvites(false);
      }
    };
    if (isOpen) checkInvitedJobs();
  }, [isOpen, collaborator, currentUser]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredJobs([]);
      setHasStartedTyping(false);
      return;
    }
    setHasStartedTyping(true);
    const timer = setTimeout(() => {
      const activeJobs = jobs.filter(
        (job) => job.status === "posted" || job.status === "active",
      );
      const searchLower = searchTerm.toLowerCase();
      const filtered = activeJobs.filter(
        (job) =>
          job.title?.toLowerCase().includes(searchLower) ||
          job.description?.toLowerCase().includes(searchLower),
      );
      setFilteredJobs(filtered);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, jobs]);

  const handleInviteClick = async () => {
    if (!selectedJobId) {
      toast.error("Please select a job to invite");
      return;
    }
    const selectedJob = jobs.find((j) => j.id === selectedJobId);
    if (!selectedJob) {
      toast.error("Selected job not found");
      return;
    }
    if (selectedJob.has_contract === true) {
      toast.error(
        `Cannot send invitation: "${selectedJob.title}" already has a contract.`,
      );
      return;
    }
    if (invitedJobs[selectedJobId]) {
      toast.error(
        `Cannot send invitation: ${collaborator.name.split(" ")[0]} has already been invited to "${selectedJob.title}".`,
      );
      return;
    }
    setIsSubmitting(true);
    try {
      const success = await onInvite(collaborator.id, selectedJobId);
      if (success) {
        setInvitedJobs((prev) => ({ ...prev, [selectedJobId]: true }));
        setSelectedJobId(null);
        toast.success(
          `Invitation sent successfully to ${collaborator.name.split(" ")[0]} for "${selectedJob.title}"!`,
        );
        setTimeout(() => {
          resetForm();
          onClose();
        }, 1500);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJobSelect = (jobId, hasContract, isInvited) => {
    const job = jobs.find((j) => j.id === jobId);
    if (hasContract) {
      toast.error(`"${job?.title || "This job"}" already has a contract.`);
      return;
    }
    if (isInvited) {
      toast.info(
        `${collaborator.name.split(" ")[0]} has already been invited to "${job?.title || "this job"}".`,
      );
      return;
    }
    setSelectedJobId(selectedJobId === jobId ? null : jobId);
    if (selectedJobId !== jobId)
      toast.success(`"${job?.title}" selected for invitation`);
  };

  const activeJobs = jobs.filter(
    (job) =>
      job.status === "posted" ||
      job.status === "active"
  );

  const searchableJobs = activeJobs.filter(
    (job) =>
      job.title
        ?.toLowerCase()
        .includes(jobSearch.toLowerCase()) ||
      job.description
        ?.toLowerCase()
        .includes(jobSearch.toLowerCase())
  );

  if (!isOpen || !collaborator) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#51218F] to-[#2a0e4a] p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white flex-shrink-0">
              <img
                src={collaborator.dpImage || Dp1}
                alt={collaborator.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white truncate">
                {collaborator.name}
              </h3>
              <p className="text-white/80 text-xs truncate">
                {collaborator.jobTitle}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-0.5 mt-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((_, i) => (
                      <svg key={i} width="10" height="10" viewBox="0 0 12 12">
                        <path
                          d="M6 1L7.545 4.13L11 4.635L8.5 7.07L9.09 10.51L6 8.885L2.91 10.51L3.5 7.07L1 4.635L4.455 4.13L6 1Z"
                          fill={
                            i < Math.floor(collaborator.ratingValue || 0)
                              ? "#FFD700"
                              : "#C4C4C4"
                          }
                          stroke="#51218F"
                          strokeWidth="0.3"
                        />
                      </svg>
                    ))}
                  </div>

                  <span className="text-white/80 text-[10px]">
                    ({collaborator.reviewsCount || 0})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            resetForm();
            onClose();
          }}
          className="absolute top-3 right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>

        <div className="p-4">
          <h4 className="text-base font-semibold text-[#2A1E17] mb-1">
            Select a job to invite
          </h4>
          <p className="text-xs text-gray-600 mb-3">
            Search for a job to invite {collaborator.name.split(" ")[0]} to
            collaborate on.
          </p>

          <div
            className="relative mb-4"
            ref={dropdownRef}
          >
            <div
              onClick={() =>
                setIsDropdownOpen(!isDropdownOpen)
              }
              className="w-full !border border-gray-300 rounded-lg px-3 py-2 cursor-pointer flex justify-between items-center"
            >
              <span>
                {selectedJobId
                  ? jobs.find(
                    (j) => j.id === selectedJobId
                  )?.title
                  : "Select Job"}
              </span>

              <svg
                className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            {isDropdownOpen && (
              <div className="relative z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">

                <div className="p-2 border-b">
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={jobSearch}
                    onChange={(e) =>
                      setJobSearch(e.target.value)
                    }
                    className="w-full !border rounded px-2 py-1 text-sm"
                  />
                </div>

                <div
                  className="max-h-52 overflow-y-auto !border-1 !border-gray-300 rounded-b-lg"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  {searchableJobs.length === 0 ? (
                    <div className="p-3 text-center text-gray-500 text-sm">
                      No jobs found
                    </div>
                  ) : (
                    searchableJobs.map((job) => (
                      <div
                        key={job.id}
                        onClick={() => {
                          setSelectedJobId(job.id);
                          setIsDropdownOpen(false);
                        }}
                        className="px-3 py-2 hover:bg-purple-50 cursor-pointer shadow-xl rounded "
                      >
                        <div className="font-medium s">
                          {job.title}
                        </div>

                        <div className="text-xs text-gray-500  ">
                          {job.budget_type === "fixed"
                            ? `₹${job.budget_from}`
                            : `₹${job.budget_from}/hr`}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2 ">
            <button
              onClick={() => {
                resetForm();
                onClose();
              }}
              disabled={isSubmitting}
              className="flex-1 px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleInviteClick}
              disabled={!selectedJobId || isCheckingInvites || isSubmitting}
              className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-[#51218F] to-[#020202] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                "Send Invite"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== MAIN HOME COMPONENT ==========
const Home = () => {
  const [showMore, setShowMore] = useState({});
  const [removedSkills, setRemovedSkills] = useState({});
  const [viewMode, setViewMode] = useState("bestMatch");
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const [isSwitchingViewMode, setIsSwitchingViewMode] = useState(false);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [allProfiles, setAllProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);
  const [loading, setLoading] = useState(true);
  const expiryToastShown = useRef(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userInfo, setUserInfo] = useState({
    name: "User",
    role: "Professional",
  });
  const [userStats, setUserStats] = useState({
    totalJobs: 0,
    activeProjects: 0,
    completed: 0,
    canceled: 0,
  });
  const [jobs, setJobs] = useState([]);

  // ========== CONTRACT STATES (from JobCreated) ==========
  const [contractStats, setContractStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    in_review: 0,
    awaiting: 0,
  });

  const [invitePopup, setInvitePopup] = useState({
    isOpen: false,
    collaborator: null,
  });
  const [expandedDescJobId, setExpandedDescJobId] = useState(null);

  const mobileVerificationRef = useRef(null);
  const desktopVerificationRef = useRef(null);

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
  const [rateLimitError, setRateLimitError] = useState("");

  const [otpToken, setOtpToken] = useState("");
  const [cooldownToken, setCooldownToken] = useState("");

  const [showEmailSetupPopup, setShowEmailSetupPopup] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);

  const [screenWidth, setScreenWidth] = React.useState(
    typeof window !== "undefined" ? window.innerWidth : 0,
  );

  const [profileCompletion, setProfileCompletion] = useState(0);
  const [loadingCompletion, setLoadingCompletion] = useState(false);
  const [collaboratorRatings, setCollaboratorRatings] = useState({});

  const latestJob = jobs.length > 0 ? jobs[0] : null;
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(
    (j) => j.status === "posted" || j.status === "active",
  ).length;
  const completedJobs = jobs.filter((j) => j.status === "completed").length;
  const cancelledJobs = jobs.filter(
    (j) => j.status === "cancelled" || j.status === "canceled",
  ).length;

  // ========== FETCH CREATOR CONTRACTS (from JobCreated) ==========
  const fetchContractStats = async () => {
    if (!currentUser?.id) return;

    try {
      const response = await api.get("/contracts/status-counts", {
        params: {
          user_id: currentUser.id,
        },
      });

      const data = response.data;

      setContractStats({
        total: data.total || 0,
        pending: data.pending || 0,
        active: data.in_progress || 0,
        awaiting: data.awaiting || 0,
        in_review: data.in_review || 0,
        completed: data.completed || 0,
        cancelled: data.cancelled || 0,
      });
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
    }
  };
  const calculateTimeAgo = (dateString) => {
    if (!dateString) return "Recently";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffHours < 1) return "Recently";
      else if (diffHours < 24)
        return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
      else if (diffDays === 1) return "1 day ago";
      else if (diffDays < 7) return `${diffDays} days ago`;
      else
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
    } catch (error) {
      return "Recently";
    }
  };

  const isValidGmail = (email) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;
    return email.toLowerCase().split("@")[1] === "gmail.com";
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const fetchUserData = async () => {
    try {
      const authRes = await api.get("/auth/me");
      const authUser = authRes.data;
      const profileRes = await api.get(`/creator/get/${authUser.id}`);
      const profileData = profileRes.data;
      setCurrentUser({
        ...authUser,
        ...profileData,
        id: authUser.id,
        phone_number: profileData.phone_number || authUser.phone_number || null,
      });
      setUserInfo({
        name:
          profileData.full_name ||
          authUser.full_name ||
          authUser.name ||
          "User",
        role: authUser.role === "creator" ? "Creator" : "Collaborator",
      });
      setPhoneVerified(profileData.phone_verified || false);
      setEmailVerified(profileData.email_verified || false);
    } catch (err) {
      console.error("Failed to fetch user data", err);
      try {
        const authRes = await api.get("/auth/me");
        setCurrentUser(authRes.data);
        setUserInfo({
          name: authRes.data.full_name || authRes.data.name || "User",
          role: authRes.data.role === "creator" ? "Creator" : "Collaborator",
        });
      } catch (fallbackErr) {
        console.error("Failed to fetch auth user", fallbackErr);
      }
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchProfileCompletion = async () => {
      if (!currentUser?.id) return;
      setLoadingCompletion(true);
      try {
        const response = await api.get(
          `/creator/profile-completion/${currentUser.id}`,
        );
        if (response.data) setProfileCompletion(response.data.completion);
      } catch (error) {
        console.error("Failed to fetch profile completion:", error);
        setProfileCompletion(0);
      } finally {
        setLoadingCompletion(false);
      }
    };
    fetchProfileCompletion();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.email || expiryToastShown.current) return;
    const checkSubscriptionExpiry = async () => {
      try {
        const response = await api.get("/payment/subscription-expiry-status", {
          params: { user_email: currentUser.email },
        });
        const data = response.data;
        expiryToastShown.current = true;
        if (data.expired) {
          toast.error(
            "Your subscription has expired. Renew or buy a plan to enjoy more features.",
          );
          return;
        }
        if ([3, 2, 1].includes(data.days_remaining)) {
          toast.info(
            `⚠️ Your plan is expiring in ${data.days_remaining} day${data.days_remaining > 1 ? "s" : ""}. Renew now to continue premium access.`,
          );
        }
      } catch (error) {
        console.error("Subscription expiry check failed:", error);
      }
    };
    checkSubscriptionExpiry();
  }, [currentUser]);

  useEffect(() => {
    let timer;
    if (showSuccessPopup) {
      timer = setTimeout(() => setShowSuccessPopup(false), 3000);
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

  useEffect(() => {
    if (rateLimitError && resendTime === 0) {
      const timer = setTimeout(() => setRateLimitError(""), 1000);
      return () => clearTimeout(timer);
    }
  }, [rateLimitError, resendTime]);

  // Fetch contracts when currentUser is available
  useEffect(() => {
    if (currentUser?.id) {
      fetchContractStats();
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser?.id) return;
    const fetchUserJobs = async () => {
      try {
        const res = await api.get(`/jobs/my-jobs/${currentUser.id}`);
        const rawJobs = res.data.jobs || res.data || [];
        const processedJobs = rawJobs.map((job) => {
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
            )
              return `₹${job.budget_from} – ₹${job.budget_to}/hr`;
            else if (
              job.budget_type?.toLowerCase() === "hourly" &&
              job.budget_from
            )
              return `₹${job.budget_from}/hr`;
            else if (
              job.budget_type?.toLowerCase() === "fixed" &&
              job.budget_from
            )
              return `₹${job.budget_from}`;
            return "Budget not specified";
          };
          return {
            ...job,
            posted_time: postedTime,
            formatted_expertise: formatExpertiseLevel(job.expertise_level),
            formatted_budget: formatBudget(job),
            proposals_count: job.proposals_count || 0,
            hired_count: job.hired_count || 0,
          };
        });
        setJobs(processedJobs);
        setUserStats({
          totalJobs: processedJobs.length,
          activeProjects: processedJobs.filter(
            (j) => j.status === "posted" || j.status === "active",
          ).length,
          completed: processedJobs.filter((j) => j.status === "completed")
            .length,
          canceled: processedJobs.filter(
            (j) => j.status === "cancelled" || j.status === "canceled",
          ).length,
        });
      } catch (err) {
        console.error("Failed to fetch user stats", err);
        setJobs([]);
      }
    };
    fetchUserJobs();
  }, [currentUser]);

  const fetchCollaboratorRating = async (collaboratorId) => {
    try {
      const response = await api.get(
        `/collaborator/reviews/list/${collaboratorId}`,
      );
      if (response.data && response.data.length > 0) {
        const totalRating = response.data.reduce(
          (sum, review) => sum + review.rating,
          0,
        );
        return {
          rating: totalRating / response.data.length,
          count: response.data.length,
        };
      }
      return { rating: 0, count: 0 };
    } catch (error) {
      return { rating: 0, count: 0 };
    }
  };
 const scrollToBestMatchTop = () => {
  const bestMatchSection = document.querySelector('.flex.flex-col.gap-4');
  if (bestMatchSection) {
    const offset = 70; // Adjust this value for better positioning
    const elementPosition = bestMatchSection.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  } else {
    // Fallback - scroll to top of the main content area
    const mainContent = document.querySelector('.w-full.lg\\:flex-1');
    if (mainContent) {
      const offset = 100;
      const elementPosition = mainContent.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }
};
  const fetchCollaborators = async () => {
    if (!currentUser?.id) return;
    try {
      setLoading(true);
      let res;
      if (viewMode === "all") {
        res = await api.get("/collaborator/list");
      } else {
        res = await api.get(
          `/creator/collaborators/best-match/${currentUser.id}`,
        );
      }
      const transformedData = transformBackendData(res.data);
      const ratingsEntries = await Promise.all(
  transformedData.map(async (collaborator) => {
    if (!collaborator.ratingValue && collaborator.id) {
      const rating =
        await fetchCollaboratorRating(
          collaborator.id
        );

      return [collaborator.id, rating];
    }

    return [collaborator.id, null];
  })
);

const ratingsMap =
  Object.fromEntries(ratingsEntries);
      setCollaboratorRatings(ratingsMap);
      const profilesWithRatings = transformedData.map((profile) => ({
        ...profile,
        ratingValue: ratingsMap[profile.id]?.rating || profile.ratingValue || 0,
        reviewsCount:
          ratingsMap[profile.id]?.count || profile.reviewsCount || 0,
      }));
      setAllProfiles(profilesWithRatings);
      applyFilters(profilesWithRatings, activeFilters);
    } catch (err) {
      console.error("Failed to fetch collaborators", err);
      setAllProfiles([]);
      setFilteredProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaborators();
  }, [currentUser, viewMode]);

  const applyFilters = (profiles, filters) => {
    if (!profiles.length) {
      setFilteredProfiles([]);
      return;
    }
    let filtered = [...profiles];
    if (filters.minHourlyRate) {
      const minRate = parseFloat(filters.minHourlyRate);
      filtered = filtered.filter(
        (p) =>
          parseFloat(p.hourlyRate.replace("₹", "").replace("/hr", "")) >=
          minRate,
      );
    }
    if (filters.maxHourlyRate) {
      const maxRate = parseFloat(filters.maxHourlyRate);
      filtered = filtered.filter(
        (p) =>
          parseFloat(p.hourlyRate.replace("₹", "").replace("/hr", "")) <=
          maxRate,
      );
    }
    if (filters.minRating) {
      const minRating = parseFloat(filters.minRating);
      filtered = filtered.filter((p) => p.ratingValue >= minRating);
    }
    if (filters.location) {
      const loc = filters.location.toLowerCase();
      filtered = filtered.filter((p) =>
        p.location?.toLowerCase().includes(loc),
      );
    }
    if (filters.skills) {
      const keywords = filters.skills
        .toLowerCase()
        .split(",")
        .map((s) => s.trim());
      filtered = filtered.filter((p) =>
        keywords.some((kw) =>
          p.skills.some((s) => s.toLowerCase().includes(kw)),
        ),
      );
    }
    setFilteredProfiles(filtered);
    setHasActiveFilters(Object.keys(filters).length > 0);
  };

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
    applyFilters(allProfiles, filters);
    setCurrentPage(1);
  };

  const handleViewModeChange = async (mode) => {
    if (mode === viewMode) return;
    setIsSwitchingViewMode(true);
    setViewMode(mode);
    setActiveFilters({});
    setHasActiveFilters(false);
    setCurrentPage(1);
    handleApplyFilters({});
    setTimeout(() => {
      setIsSwitchingViewMode(false);
    }, 500);
  };

  const getCountryCodeFromLocation = (location) => {
    if (!location) return null;
    const loc = location.toLowerCase();
    if (
      loc.includes("usa") ||
      loc.includes("united states") ||
      loc.includes("america")
    )
      return "US";
    if (loc.includes("india") || loc.includes("bharat")) return "IN";
    if (
      loc.includes("uk") ||
      loc.includes("united kingdom") ||
      loc.includes("england")
    )
      return "GB";
    if (loc.includes("canada")) return "CA";
    if (loc.includes("australia")) return "AU";
    if (loc.includes("germany")) return "DE";
    if (loc.includes("france")) return "FR";
    if (loc.includes("japan")) return "JP";
    if (loc.includes("china")) return "CN";
    if (loc.includes("brazil")) return "BR";
    return null;
  };

  const transformBackendData = (backendData) => {
    if (!backendData) return [];
    const data = Array.isArray(backendData)
      ? backendData
      : backendData?.data ||
      backendData?.results ||
      backendData?.collaborators ||
      [];
    if (!Array.isArray(data)) return [];

    return data.map((item, index) => {
      const parseSkills = (skills) => {
        if (!skills) return [];
        if (Array.isArray(skills)) return skills;
        try {
          return JSON.parse(skills);
        } catch {
          return typeof skills === "string"
            ? skills
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s)
            : [];
        }
      };

      let jobTitle = "Professional, Expert";
      if (item.job_title) jobTitle = item.job_title;
      else if (item.title) jobTitle = item.title;
      else if (item.role) jobTitle = item.role;
      else if (item.skill_category) jobTitle = item.skill_category;
      else if (item.profession) jobTitle = item.profession;

      const platform =
        item.skill_category || item.profession || item.creator_type || "";
      const about = item.about || item.description || item.bio || "";
      const followers =
        item.followers !== undefined && item.followers !== null
          ? Number(item.followers)
          : 0;

      let hourlyRate = "₹0.00 /hr";
      if (item.formatted_rate) {
        hourlyRate = item.formatted_rate;
      } else if (
        item.pricing_amount !== undefined &&
        item.pricing_amount !== null
      ) {
        const amount = Number(item.pricing_amount);
        const pricingType = (
          item.pricing_type ||
          item.pricing_unit ||
          "hourly"
        ).toLowerCase();
        switch (pricingType) {
          case "hourly":
          case "hour":
            hourlyRate = `₹${amount.toFixed(2)}/hr`;
            break;
          case "daily":
          case "day":
            hourlyRate = `₹${amount.toFixed(2)}/day`;
            break;
          case "weekly":
          case "week":
            hourlyRate = `₹${amount.toFixed(2)}/week`;
            break;
          case "monthly":
          case "month":
            hourlyRate = `₹${amount.toFixed(2)}/month`;
            break;
          case "project":
            hourlyRate = `₹${amount.toFixed(2)}/project`;
            break;
          default:
            hourlyRate = `₹${amount.toFixed(2)}/${pricingType}`;
        }
      } else if (item.hourly_rate !== undefined && item.hourly_rate !== null) {
        hourlyRate = `₹${Number(item.hourly_rate).toFixed(2)}/hr`;
      } else if (item.rate_per_hour !== undefined) {
        hourlyRate = `₹${Number(item.rate_per_hour).toFixed(2)}/hr`;
      }

      let location = "Unknown Location";
      if (item.location) location = item.location;
      else if (item.city && item.country)
        location = `${item.city}, ${item.country}`;
      else if (item.user_location) location = item.user_location;
      else if (item.country) location = item.country;

      let countryCode =
        item.country_code || getCountryCodeFromLocation(location) || "IN";

      let displaySkills = [];
      if (item.skills) displaySkills = parseSkills(item.skills);
      else if (item.skill_category)
        displaySkills = item.skill_category.split(",").map((s) => s.trim());
      else if (item.expertise) displaySkills = parseSkills(item.expertise);
      displaySkills = displaySkills.slice(0, 8);
      if (displaySkills.length === 0)
        displaySkills = ["Web design", "UI/UX", "Development"];

      const images = [Dp1, Dp2, Dp3, Dp4];
      let dpImage =
        item.profile_picture ||
        item.user?.profile_picture ||
        item.profilePhoto ||
        item.profileImage ||
        item.avatar ||
        images[index % images.length];

      let badge = "";
      if (item.badge) badge = item.badge;
      else if (item.badges?.length > 0) badge = item.badges[0];
      else if (item.verified) badge = "Verified";
      else if (item.is_top_rated || item.top_rated) badge = "Top rated";
      else {
        const badges = ["", "Popular", "Best match", "Trending", "Expert"];
        badge = badges[index % badges.length];
      }

      let ratingValue = 0;
      let reviewsCount = 0;
      if (
        item.reviews &&
        Array.isArray(item.reviews) &&
        item.reviews.length > 0
      ) {
        ratingValue =
          item.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
          item.reviews.length;
        reviewsCount = item.reviews.length;
      } else if (item.rating !== undefined && item.rating !== null) {
        if (typeof item.rating === "object" && item.rating.avg_rating) {
          ratingValue = Number(item.rating.avg_rating);
          reviewsCount = Number(item.rating.total_reviews || 0);
        } else ratingValue = Number(item.rating);
      } else if (
        item.skills_rating !== undefined &&
        item.skills_rating !== null
      ) {
        ratingValue =
          item.skills_rating > 5
            ? Number(item.skills_rating) / 20
            : Number(item.skills_rating);
      }
      if (item.reviews_count !== undefined)
        reviewsCount = Number(item.reviews_count);
      else if (item.total_reviews !== undefined)
        reviewsCount = Number(item.total_reviews);
      else if (item.review_count !== undefined)
        reviewsCount = Number(item.review_count);
      ratingValue = Math.round(Math.min(5, Math.max(0, ratingValue)) * 10) / 10;

      const skillRatingRaw =
        item.skill_rating !== undefined && item.skill_rating !== null
          ? Number(item.skill_rating)
          : item.skills_rating !== undefined && item.skills_rating !== null
            ? Number(item.skills_rating)
            : 0;
      const skillRatingOutOf100 = Math.round(
        Math.min(100, Math.max(0, skillRatingRaw)),
      );

      return {
        id: item.user_id || item.id || item._id || index + 100,
        name: item.full_name || item.name || "Collaborator",
        jobTitle,
        hourlyRate,
        about,
        followers,
        platform,
        ratingValue,
        reviewsCount,
        location,
        countryCode,
        isOnline:
          item.is_online !== undefined ? item.is_online : Math.random() > 0.3,
        skills: displaySkills,
        dpImage,
        badge,
        rawData: item,
        skillRatingOutOf100,
      };
    });
  };

  const handleInvite = async (collaboratorId, jobId) => {
    try {
      const formData = new FormData();
      formData.append("sender_id", currentUser.id);
      formData.append("receiver_id", collaboratorId);
      formData.append("job_id", jobId);
      formData.append("client_name", currentUser.full_name || "Client");
      formData.append(
        "project_name",
        jobs.find((j) => j.id === jobId)?.title || "Project",
      );
      formData.append("date", new Date().toISOString().split("T")[0]);
      formData.append(
        "revenue",
        jobs.find((j) => j.id === jobId)?.budget_from || 0,
      );
      await api.post("/invitations/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Invitation sent successfully ✅");
      return true;
    } catch (error) {
      console.error("Invitation failed:", error);
      if (error.response?.data?.detail?.includes("already been invited"))
        toast.error("This collaborator has already been invited for this job");
      else
        toast.error(
          error.response?.data?.detail ||
          error.response?.data?.message ||
          "Invitation failed",
        );
      return false;
    }
  };

  const openInvitePopup = (collaborator) => {
    const hasActiveJobs = jobs.some(
      (j) => j.status === "posted" || j.status === "active",
    );
    if (!hasActiveJobs) {
      toast.info("Please create a job first before inviting collaborators");
      navigate("/created");
      return;
    }
    setInvitePopup({ isOpen: true, collaborator });
  };

  const handleSaveEmail = async () => {
    if (!isValidEmail(newEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setIsSavingEmail(true);
    try {
      const response = await api.put(`/creator/edit/${currentUser.id}`, {
        email: newEmail,
      });
      if (response.data.status === "success") {
        setEmail(newEmail);
        setShowEmailSetupPopup(false);
        toast.success("Email added successfully!");
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

  const handleVerifyPhone = () => {
    if (!currentUser?.phone_number || !currentUser.phone_number.trim()) {
      toast.error("Please add your phone number in profile settings first");
      setTimeout(() => navigate("/creator-edit-profile"), 2000);
      return;
    }
    const cleanPhone = currentUser.phone_number.replace(/\D/g, "").slice(-10);
    setPhoneNumber(cleanPhone);
    setCurrentVerificationType("phone");
    setShowPhonePopup(true);
  };

  const handleVerifyEmail = () => {
    if (emailVerified) {
      toast.success("Email is already verified!");
      return;
    }
    if (!currentUser?.email || currentUser.email.trim() === "") {
      setShowEmailSetupPopup(true);
      return;
    }
    setEmail(currentUser.email);
    setCurrentVerificationType("email");
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
    try {
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
        toast.error(errorMessage);
        const match = errorMessage.match(/(\d+)\s*seconds?/);
        if (match && match[1]) {
          const remainingSeconds = parseInt(match[1]);
          if (remainingSeconds > 0 && remainingSeconds < 60)
            setRateLimitError(
              `Please wait ${remainingSeconds} seconds before trying again`,
            );
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
    const registeredEmail = currentUser?.email;
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
          if (remainingSeconds > 0 && remainingSeconds <= 60)
            setResendTime(remainingSeconds);
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
          ? { email: currentUser.email, otp_code: otpString }
          : { email: email, otp_code: otpString };
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
          await fetchUserData();
        }
        setShowOTPPopup(false);
        setShowSuccessPopup(true);
        setOtp(["", "", "", "", "", ""]);
        setResendTime(45);
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
          { email: currentUser?.email, phone_number: fullPhoneNumber },
          {
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
        const registeredEmail = currentUser?.email;
        if (!registeredEmail) {
          toast.error("No registered email found");
          setIsVerifying(false);
          return;
        }
        const response = await api.post(
          "/verification/email/send-otp",
          { email: registeredEmail },
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
          if (remainingSeconds > 0 && remainingSeconds <= 60)
            setResendTime(remainingSeconds);
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
      if (value && index < 5)
        document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleDeleteJob = (jobId) => {
    setJobToDelete(jobId);
    setShowDeletePopup(true);
  };

  const confirmDeleteJob = async () => {
    if (!jobToDelete) return;
    try {
      await api.delete(`/jobs/${jobToDelete}/delete`);
      const updatedJobs = jobs.filter((job) => job.id !== jobToDelete);
      setJobs(updatedJobs);
      setUserStats({
        totalJobs: updatedJobs.length,
        activeProjects: updatedJobs.filter(
          (j) => j.status === "posted" || j.status === "active",
        ).length,
        completed: updatedJobs.filter((j) => j.status === "completed").length,
        canceled: updatedJobs.filter(
          (j) => j.status === "cancelled" || j.status === "canceled",
        ).length,
      });
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

  const handleRemoveSkill = (profileId, skillIndex) => {
    setRemovedSkills((prev) => ({
      ...prev,
      [`${profileId}-${skillIndex}`]: true,
    }));
  };

  const toggleShowMore = (profileId) => {
    setShowMore((prev) => ({ ...prev, [profileId]: !prev[profileId] }));
  };

  React.useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const profilesToShow = filteredProfiles.slice(indexOfFirst, indexOfLast);
  const completionPercentage = profileCompletion;

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
          ".verify-btn-animation",
        );
        if (verifyButtons.length > 0) {
          verifyButtons.forEach((btn, index) => {
            setTimeout(() => {
              btn.classList.add("animate-zoom");
              setTimeout(() => btn.classList.remove("animate-zoom"), 1000);
            }, index * 300);
          });
        }
      }, 500);
    }
  };

  const formatFollowers = (count) => {
    if (count === null || count === undefined) return null;
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getSkillStars = (skillRatingOutOf100) => {
    const starRating = skillRatingOutOf100 / 20;
    return Math.round(starRating * 10) / 10;
  };

  return (
    <div className="w-full min-h-screen flex flex-col overflow-x-hidden">
      <section className="w-full flex flex-col items-center justify-start px-4 sm:px-6 lg:px-8 relative">
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

        <div className="absolute top-[150px] md:top-[187px] w-full px-4 flex flex-col items-center justify-center z-10">
          <h1
            className="text-3xl sm:text-4xl md:text-[48px] leading-tight md:leading-[100%] text-center text-white font-normal"
            style={{ fontFamily: "Milonga" }}
          >
            Welcome back,
            <br />
            {currentUser?.full_name ||
              currentUser?.name ||
              userInfo.name ||
              "User"}
          </h1>
        </div>

        <Header />

        <div className="w-full flex flex-col lg:flex-row gap-6 lg:gap-8 mt-[350px] md:mt-[412px] pb-[100px] relative">
          {/* ===== LEFT MAIN CONTENT ===== */}
          <div className="w-full lg:flex-1 opacity-100 order-2 lg:order-1">
            {/* YOUR POSTED JOB SECTION */}
            <div className="w-full rounded-[8px] bg-white shadow-md p-4 sm:p-5 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                <h3 className="font-semibold text-[15px] sm:text-[16px] lg:text-[18px] text-[#2A1E17]">
                  You have posted a job..!
                </h3>
                <button
                  onClick={() => navigate("/job-created")}
                  className="rounded-full px-3 py-1.5 text-white text-[10px] font-bold hover:opacity-90 transition-opacity whitespace-nowrap bg-gradient-to-r from-[#51218F] to-[#020202]"
                >
                  View all jobs
                </button>
              </div>
              <div className="w-full h-px bg-gray-200 mb-3" />
              {loading ? (
                <p className="text-gray-400">Loading...</p>
              ) : !latestJob ? (
                <p className="text-gray-500">
                  You have not posted any job yet.
                </p>
              ) : (
                <div className="flex flex-col sm:flex-row justify-between gap-3 text-[12px]">
                  <div>
                    <p className="font-bold">{latestJob.title}</p>
                    <p className="text-gray-600 mt-0.5">
                      {latestJob.budget_type === "fixed"
                        ? "Fixed-price"
                        : "Hourly"}{" "}
                      · {latestJob.formatted_expertise} · Est. Budget{" "}
                      {latestJob.formatted_budget} · {latestJob.posted_time}
                    </p>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <p className="font-bold">Proposals</p>
                      <p className="text-gray-600">
                        {latestJob.proposals_count}
                      </p>
                    </div>
                    <div>
                      <p className="font-bold">Hired</p>
                      <p className="text-gray-600">{latestJob.hired_count}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* FILTER BUTTONS */}
            <div className="flex items-center justify-between gap-3 mb-4 px-2">
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewModeChange("bestMatch")}
                  disabled={isSwitchingViewMode}
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 ${viewMode === "bestMatch"
                    ? "bg-gradient-to-r from-[#51218F] to-[#2a0e4a] text-white shadow-md"
                    : "border border-[#51218F] text-[#51218F] hover:bg-purple-50"
                    } ${isSwitchingViewMode ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {isSwitchingViewMode && viewMode !== "bestMatch" ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : null}
                  Best Match
                </button>
                <button
                  onClick={() => handleViewModeChange("all")}
                  disabled={isSwitchingViewMode}
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 ${viewMode === "all"
                    ? "bg-gradient-to-r from-[#51218F] to-[#2a0e4a] text-white shadow-md"
                    : "border border-[#51218F] text-[#51218F] hover:bg-purple-50"
                    } ${isSwitchingViewMode ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {isSwitchingViewMode && viewMode !== "all" ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : null}
                  Show All
                </button>
              </div>
              <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 ${hasActiveFilters ? "bg-[#51218F] text-white" : "border border-[#51218F] text-[#51218F] hover:bg-purple-50"}`}
                onClick={() => setShowFilterPopup(true)}
              >
                <div className="w-[14px] h-[15px] sm:w-[16px] sm:h-[17px]">
                  <img
                    src={Filter}
                    alt="Filter icon"
                    className={`w-full h-full object-contain ${hasActiveFilters ? "brightness-0 invert" : ""}`}
                  />
                </div>
                <span className="font-semibold text-[13px] sm:text-[14px] whitespace-nowrap">
                  Filter {hasActiveFilters && `(${filteredProfiles.length})`}
                </span>
              </button>
            </div>

            {/* COLLABORATORS LIST */}
            {loading || isSwitchingViewMode ? (
              <div className="flex justify-center items-center w-full h-64">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
                  <p className="text-gray-500 text-sm">
                    Loading{" "}
                    {viewMode === "bestMatch"
                      ? "best matches"
                      : "collaborators"}
                    ...
                  </p>
                </div>
              </div>
            ) : profilesToShow.length === 0 ? (
              <div className="flex justify-center items-center w-full h-64 bg-white rounded-[8px] shadow-[0px_4px_45px_0px_#0000001F] p-8">
                <p className="text-gray-500 text-center">
                  {hasActiveFilters ? (
                    <>
                      <svg
                        className="w-16 h-16 text-gray-400 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM3 10h18"
                        />
                      </svg>
                      <p className="text-gray-500 text-center mb-3">
                        No collaborators match your filters.
                      </p>
                      <button
                        onClick={() => {
                          setActiveFilters({});
                          setHasActiveFilters(false);
                          handleApplyFilters({});
                          setCurrentPage(1);
                        }}
                        className="px-4 py-2 bg-[#51218F] text-white rounded-full text-sm font-medium hover:bg-[#3D1768] transition-colors"
                      >
                        Clear All Filters
                      </button>
                    </>
                  ) : viewMode === "all" ? (
                    <p className="text-gray-500 text-center">
                      No collaborators found.
                    </p>
                  ) : (
                    <p className="text-gray-500 text-center">
                      No best matches found. Try switching to "Show All" or
                      adjusting your profile for better matches.
                    </p>
                  )}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {profilesToShow.map((profile) => {
                  const availableSkills = profile.skills.filter(
                    (_, index) => !removedSkills[`${profile.id}-${index}`],
                  );
                  const firstRowSkills = availableSkills.slice(0, 4);
                  const secondRowSkills = showMore[profile.id]
                    ? availableSkills.slice(4, 8)
                    : [];
                  const skillStarRating = getSkillStars(
                    profile.skillRatingOutOf100 || 0,
                  );

                  return (
                    <div
                      key={profile.id}
                      className="w-full bg-white rounded-[8px] shadow-[0px_4px_45px_0px_#0000001F] p-4 sm:p-5 lg:p-6 relative"
                    >
                      {profile.badge && profile.badge.trim() !== "" && (
                        <div className="absolute top-[-5px] left-[18px] lg:top-[-7px] lg:left-[29px] w-[70px] lg:w-[104px] h-[18px] lg:h-[25px] rounded-[100px] flex items-center justify-center bg-[#51218F]">
                          <span className="font-outfit font-semibold text-[10px] lg:text-[14px] text-white whitespace-nowrap">
                            {profile.badge}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row">
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <div className="relative">
                              <div className="w-[42px] h-[42px] lg:w-[52px] lg:h-[52px] rounded-full overflow-hidden">
                                <img
                                  src={profile.dpImage}
                                  alt={profile.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div
                                className="absolute w-[10px] h-[10px] lg:w-[14px] lg:h-[14px] bottom-0 right-0 rounded-full border-2 border-white"
                                style={{
                                  backgroundColor: profile.isOnline
                                    ? "#33BA04"
                                    : "#C4C4C4",
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-[14px] lg:text-[16px] text-black">
                                {profile.name}
                              </h4>
                              <p className="font-outfit text-[12px] lg:text-[14px] text-black/60 mt-0.5">
                                {profile.jobTitle}
                              </p>
                              {/* Improved About, Followers, Skill Rating Section */}
                              {/* Improved About, Followers, Skill Rating Section */}
                              <div className="mt-3 space-y-2">
                                {/* About Section */}
                                {profile.about &&
                                  profile.about.trim() !== "" && (
                                    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
                                      <span className="text-[11px] lg:text-[12px] font-semibold text-[#51218F] sm:min-w-[70px] shrink-0">
                                        About:
                                      </span>
                                      <p className="text-[11px] lg:text-[12px] text-black/70 leading-relaxed flex-1 break-words">
                                        {profile.about.length > 120
                                          ? `${profile.about.substring(0, 120)}...`
                                          : profile.about}
                                      </p>
                                    </div>
                                  )}

                                {/* Followers Section */}
                                {profile.followers > 0 && (
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                    <span className="text-[11px] lg:text-[12px] font-semibold text-[#51218F] sm:min-w-[70px] shrink-0">
                                      Followers:
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 text-[11px] lg:text-[12px] text-black/70">
                                      <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                      >
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                      </svg>
                                      <span className="font-medium">
                                        {formatFollowers(profile.followers)}{" "}
                                        followers
                                      </span>
                                    </span>
                                  </div>
                                )}

                                {/* Skill Rating Section */}
                                {profile.skillRatingOutOf100 > 0 && (
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                    <span className="text-[11px] lg:text-[12px] font-semibold text-[#51218F] sm:min-w-[70px] shrink-0">
                                      Skill Rating:
                                    </span>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((_, i) => (
                                          <svg
                                            key={i}
                                            width="12"
                                            height="12"
                                            viewBox="0 0 12 12"
                                          >
                                            <defs>
                                              <linearGradient
                                                id={`half-skill-${profile.id}-${i}`}
                                                x1="0%"
                                                y1="0%"
                                                x2="100%"
                                                y2="0%"
                                              >
                                                <stop
                                                  offset="50%"
                                                  stopColor="#FFD700"
                                                />
                                                <stop
                                                  offset="50%"
                                                  stopColor="#E5E7EB"
                                                />
                                              </linearGradient>
                                            </defs>
                                            <path
                                              d="M6 1L7.545 4.13L11 4.635L8.5 7.07L9.09 10.51L6 8.885L2.91 10.51L3.5 7.07L1 4.635L4.455 4.13L6 1Z"
                                              fill={
                                                i < Math.floor(skillStarRating)
                                                  ? "#FFD700"
                                                  : i <
                                                    Math.ceil(
                                                      skillStarRating,
                                                    ) &&
                                                    skillStarRating % 1 !== 0
                                                    ? `url(#half-skill-${profile.id}-${i})`
                                                    : "#E5E7EB"
                                              }
                                              stroke="#FFD700"
                                              strokeWidth="0.3"
                                            />
                                          </svg>
                                        ))}
                                      </div>
                                      <span className="text-[10px] lg:text-[11px] text-gray-600 font-medium">
                                        {skillStarRating.toFixed(1)} ★
                                      </span>
                                      <span className="text-[10px] lg:text-[11px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                                        {profile.skillRatingOutOf100}/100
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 sm:mt-0 sm:ml-4 flex justify-end">
                          <button
                            onClick={() => openInvitePopup(profile)}
                            className="w-[100px] sm:w-[120px] lg:w-[147px] h-[32px] sm:h-[35px] lg:h-[39px] rounded-[100px] flex items-center justify-center bg-gradient-to-r from-[#51218F] to-[#020202] hover:opacity-90 transition-opacity"
                          >
                            <span className="font-bold text-[11px] lg:text-[12px] text-white whitespace-nowrap">
                              Invite
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {firstRowSkills.map((skill, index) => (
                            <div
                              key={`${profile.id}-${index}`}
                              className="h-[26px] px-3 rounded-full bg-[#51218FD9] flex items-center gap-1"
                            >
                              <span className="text-[11px] lg:text-[13px] text-white font-outfit">
                                {skill}
                              </span>
                            </div>
                          ))}
                          {availableSkills.length > 4 && (
                            <button
                              className="h-[26px] px-3 rounded-full bg-transparent hover:bg-gray-100 transition-colors"
                              onClick={() => toggleShowMore(profile.id)}
                            >
                              <span className="text-[11px] lg:text-[13px] text-[#51218F] font-medium">
                                {showMore[profile.id] ? "less" : "more"}
                              </span>
                            </button>
                          )}
                        </div>
                        {secondRowSkills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {secondRowSkills.map((skill, index) => (
                              <div
                                key={`${profile.id}-second-${index}`}
                                className="h-[26px] px-3 rounded-full bg-[#51218FD9] flex items-center gap-1"
                              >
                                <span className="text-[11px] lg:text-[13px] text-white font-outfit">
                                  {skill}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((_, i) => {
                              const rv = profile.ratingValue || 0;
                              const starValue = i + 1;
                              const isFullStar = starValue <= Math.floor(rv);
                              const isHalfStar =
                                !isFullStar && starValue - 0.5 <= rv;
                              return (
                                <svg
                                  key={i}
                                  width="12"
                                  height="12"
                                  viewBox="0 0 12 12"
                                >
                                  <defs>
                                    <linearGradient
                                      id={`half-${profile.id}-${i}`}
                                      x1="0%"
                                      y1="0%"
                                      x2="100%"
                                      y2="0%"
                                    >
                                      <stop offset="50%" stopColor="#FFD700" />
                                      <stop offset="50%" stopColor="#C4C4C4" />
                                    </linearGradient>
                                  </defs>
                                  <path
                                    d="M6 1L7.545 4.13L11 4.635L8.5 7.07L9.09 10.51L6 8.885L2.91 10.51L3.5 7.07L1 4.635L4.455 4.13L6 1Z"
                                    fill={
                                      isFullStar
                                        ? "#FFD700"
                                        : isHalfStar
                                          ? `url(#half-${profile.id}-${i})`
                                          : "#C4C4C4"
                                    }
                                    stroke="#FFD700"
                                    strokeWidth="0.3"
                                  />
                                </svg>
                              );
                            })}
                          </div>
                          <span className="font-outfit text-[11px] lg:text-[12px] text-[#2A1E1780]">
                            {(profile.ratingValue || 0).toFixed(1)}/5 (
                            {profile.reviewsCount || 0}{" "}
                            {profile.reviewsCount === 1 ? "Review" : "Reviews"})
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-[18px] h-[12px] lg:w-[18px] lg:h-[12px] rounded-[3px] overflow-visible">
                            <ReactCountryFlag
                              countryCode={profile.countryCode}
                              svg
                              style={{
                                width: "18px",
                                height: "12px",
                                borderRadius: "3px",
                                display: "block",
                              }}
                            />
                          </div>
                          <span className="font-outfit text-[11px] lg:text-[12px] text-[#2A1E1780]">
                            {profile.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* PAGINATION */}
            {!loading &&
              !isSwitchingViewMode &&
              filteredProfiles.length > itemsPerPage && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
  onClick={() => {
    setCurrentPage(1);
    setTimeout(() => {
      scrollToBestMatchTop();
    }, 100);
  }}
  disabled={currentPage === 1}
  className="px-2 py-1 text-gray-500 disabled:opacity-40"
>
  «
</button>
                  <button
  onClick={() => {
    setCurrentPage((prev) => prev - 1);
    setTimeout(() => {
      scrollToBestMatchTop();
    }, 100);
  }}
  disabled={currentPage === 1}
  className="px-2 py-1 text-gray-500 disabled:opacity-40"
>
  ‹
</button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
  let pageNum;
  if (totalPages <= 5) {
    pageNum = i + 1;
  } else if (currentPage <= 3) {
    pageNum = i + 1;
  } else if (currentPage >= totalPages - 2) {
    pageNum = totalPages - 4 + i;
  } else {
    pageNum = currentPage - 2 + i;
  }
  return (
    <button
      key={i}
      onClick={() => {
        setCurrentPage(pageNum);
        setTimeout(() => {
          scrollToBestMatchTop();
        }, 100);
      }}
      className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${currentPage === pageNum ? "bg-[#51218F] text-white shadow-md" : "text-gray-700 hover:bg-gray-200"}`}
    >
      {pageNum}
    </button>
  );
})}
                  <button
  onClick={() => {
    setCurrentPage((prev) => prev + 1);
    setTimeout(() => {
      scrollToBestMatchTop();
    }, 100);
  }}
  disabled={currentPage === totalPages}
  className="px-2 py-1 text-gray-500 disabled:opacity-40"
>
  ›
</button>
                  <button
  onClick={() => {
    setCurrentPage(totalPages);
    setTimeout(() => {
      scrollToBestMatchTop();
    }, 100);
  }}
  disabled={currentPage === totalPages}
  className="px-2 py-1 text-gray-500 disabled:opacity-40"
>
  »
</button>
                </div>
              )}
          </div>

          {/* ===== RIGHT SIDEBAR ===== */}
          <div className="w-full lg:w-[380px] xl:w-[420px] opacity-100 order-1 lg:order-2 lg:sticky lg:top-[140px] lg:self-start">
            <div className="flex flex-col gap-5">
              <button
                onClick={() => navigate("/user-list")}
                className="hidden lg:flex w-full h-[45px] lg:h-[39px] rounded-full items-center justify-center text-white font-bold text-[14px] lg:text-[12px] hover:opacity-90 transition-opacity cursor-pointer bg-gradient-to-r from-[#51218F] to-[#020202]"
              >
                Find collaborator
              </button>
              <button
                onClick={() => navigate("/job-created")}
                className="hidden lg:flex w-full h-[45px] lg:h-[39px] rounded-full items-center justify-center text-white font-bold text-[14px] lg:text-[12px] hover:opacity-90 transition-opacity cursor-pointer bg-gradient-to-r from-[#51218F] to-[#020202]"
              >
                View Jobs
              </button>

              <div className="w-full bg-white rounded-[14px] shadow-[0px_3px_20px_0px_#0000001A] flex flex-col items-center p-5 lg:p-6">
                <div className="flex items-center gap-3 w-full lg:hidden mb-4">
                  <div className="w-[50px] h-[50px] rounded-full overflow-hidden flex-shrink-0 border-2 border-[#51218F]">
                    <img
                      src={
                        currentUser?.profile_picture ||
                        currentUser?.profilePhoto ||
                        currentUser?.avatar ||
                        Dp1
                      }
                      alt={userInfo.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[18px] text-[#2A1E17]">
                      {userInfo.name}
                    </h3>
                    <p className="font-medium text-[12px] text-[#2A1E17E5]">
                      {userInfo.role}
                    </p>
                  </div>
                </div>

                <div className="hidden lg:block w-full text-center mb-2">
                  <h3 className="font-bold text-[22px] text-[#2A1E17]">
                    {userInfo.name}
                  </h3>
                  <p className="font-medium text-[14px] text-[#2A1E17E5] mt-1">
                    {userInfo.role}
                  </p>
                </div>

                <div className="flex items-center justify-between w-full lg:hidden mb-4">
                  <button
                    onClick={() => navigate("/user-list")}
                    className="w-[48%] h-[32px] rounded-[100px] flex items-center justify-center text-white text-[11px] font-bold bg-gradient-to-r from-[#51218F] to-[#020202] hover:opacity-90 transition-opacity"
                  >
                    Find collaborator
                  </button>
                  <button
                    onClick={() => navigate("/job-created")}
                    className="w-[48%] h-[32px] rounded-[100px] flex items-center justify-center text-white text-[11px] font-bold bg-gradient-to-r from-[#51218F] to-[#020202] hover:opacity-90 transition-opacity"
                  >
                    View Jobs
                  </button>
                </div>

                <div className="w-full h-px bg-gray-200 lg:hidden mb-4" />

                <div className="w-full">
                  <div className="w-full flex justify-between items-center mb-2">
                    <span className="font-bold text-[12px] sm:text-[14px] text-[#2A1E17]">
                      Set up your account
                    </span>
                    <span className="font-bold text-[12px] sm:text-[14px] text-[#2A1E17]">
                      {completionPercentage}%
                    </span>
                  </div>
                  <div className="w-full h-[5px] mb-4 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${completionPercentage}%`,
                        backgroundColor: "#51218F",
                      }}
                    />
                  </div>
                  <button
                    onClick={() => navigate("/creator-edit-profile")}
                    className="w-full h-[35px] rounded-full flex items-center justify-center bg-gradient-to-r from-[#51218F] to-[#020202] text-white text-[11px] sm:text-[12px] font-bold hover:opacity-90 transition-opacity mb-2"
                  >
                    {completionPercentage === 100
                      ? "Update Profile"
                      : "Complete your profile"}
                  </button>
                  <p className="hidden lg:block text-[10px] sm:text-[11px] italic text-[#2A1E17E5] text-center leading-tight">
                    {completionPercentage === 100
                      ? "🎉 Great! Your profile is now 100% complete!"
                      : `${100 - completionPercentage}% more to complete your profile will help you get more reach.`}
                  </p>
                </div>
              </div>

              {/* SUBSCRIPTION BUTTON */}
              <button
                className="relative w-full p-0 border-none bg-transparent cursor-pointer group"
                onClick={() => {
                  navigate("/subscription");
                  window.scrollTo(0, 0);
                }}
              >
                <div className="relative w-full">
                  {/* Background Card */}
                  <div
                    className="w-full h-[80px] min-[400px]:h-[85px] sm:h-auto sm:min-h-[98px] opacity-100 rounded-[8px] sm:rounded-[10px] shadow-[0px_4px_45px_0px_#0000001F] overflow-visible relative p-2 sm:p-6 flex items-center"
                    style={{
                      background:
                        "linear-gradient(266.38deg, #51218F 4.44%, #020202 100.18%)",
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

                  {/* Arrow Button – FIXED: Circle on all screens */}
                  <div
                    className="absolute w-[60px] h-[60px] min-[400px]:w-[65px] min-[400px]:h-[65px] sm:w-[70px] sm:h-[70px] md:w-[80px] md:h-[80px] lg:w-[98px] lg:h-[98px] right-[2px] opacity-100 rounded-full flex items-center justify-center z-20 shadow-lg"
                    style={{
                      background:
                        "linear-gradient(180deg, #FFA412 0%, #6C4343 100%)",
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
                      className="w-[24px] h-[24px] min-[400px]:w-[26px] min-[400px]:h-[26px] sm:w-[28px] sm:h-[28px] md:w-[32px] md:h-[32px] lg:w-[34px] lg:h-[34px]"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* MOBILE VERIFICATION SECTION */}
              <div className="flex flex-row gap-3 w-full lg:hidden">
                <div
                  ref={mobileVerificationRef}
                  className="w-1/2 bg-white rounded-[10px] shadow-[0px_3px_20px_0px_#0000001A] p-3"
                >
                  <h3 className="font-semibold text-[14px] text-[#2A1E17] mb-2">
                    Verification
                  </h3>
                  <div className="w-full h-px bg-black/10 mb-3" />
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-[16px] h-[16px]">
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
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#9CA3AF"
                              strokeWidth="2"
                            >
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                          )}
                        </div>
                        <span className="text-[12px] font-medium text-[#2A1E17]">
                          Phone
                        </span>
                      </div>
                      {phoneVerified ? (
                        <span className="text-[11px] text-green-600 font-medium">
                          Verified
                        </span>
                      ) : (
                        <button
                          onClick={handleVerifyPhone}
                          className="text-[11px] text-[#51218F] font-medium hover:opacity-80 verify-btn-animation"
                        >
                          Verify
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-[16px] h-[16px]">
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
                              width="16"
                              height="16"
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
                        <span className="text-[12px] font-medium text-[#2A1E17]">
                          Email
                        </span>
                      </div>
                      {emailVerified ? (
                        <span className="text-[11px] text-green-600 font-medium">
                          Verified
                        </span>
                      ) : (
                        <button
                          onClick={handleVerifyEmail}
                          className="text-[11px] text-[#51218F] font-medium hover:opacity-80 verify-btn-animation"
                        >
                          Verify
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* REPLACED: All Contracts Card - Mobile (from JobCreated) */}

                <div className="w-1/2 bg-white rounded-[10px] shadow-[0px_3px_20px_0px_#0000001A] p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-montserrat font-medium text-[14px] text-[#2A1E17]">
                      Contracts
                    </h3>
                    <div className="flex items-center gap-0.5">
                      <span className="text-[10px] text-[#2A1E17]">Total:</span>
                      <span className="font-bold text-[13px] text-[#2A1E17]">
                        {contractStats.total}
                      </span>
                    </div>
                  </div>

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
                    {/* ADDED: In Review Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg
                          className="w-[12px] h-[12px] mr-1.5 text-orange-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                        <p className="text-[10px] text-[#2A1E17E5]">In Review:</p>
                      </div>
                      <span className="font-medium text-[10px]">{contractStats.in_review || 0}</span>
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

                  <div className="flex justify-center mt-1">
                    <button
                      onClick={() => navigate("/activecontracts")}
                      className="px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap bg-gradient-to-r from-[#51218F] to-[#2a0e4a] text-white shadow-md"
                    >
                      View all
                    </button>
                  </div>
                </div>
              </div>

              {/* DESKTOP VERIFICATION + CONTRACTS SECTION (from JobCreated) */}
              <div className="hidden lg:flex lg:flex-col lg:gap-5">
                <div
                  ref={desktopVerificationRef}
                  className="w-full bg-white rounded-[10px] shadow-[0px_3px_20px_0px_#0000001A] p-4 lg:p-6"
                >
                  <h3 className="font-semibold text-[16px] lg:text-[18px] text-[#2A1E17] mb-3 lg:mb-4">
                    Verification
                  </h3>
                  <div className="w-full h-px bg-black/10 mb-4" />
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-[20px] h-[20px]">
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
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#9CA3AF"
                              strokeWidth="2"
                            >
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                          )}
                        </div>
                        <span className="text-[14px] lg:text-[15px] font-medium text-[#2A1E17]">
                          Phone Verification
                        </span>
                      </div>
                      {phoneVerified ? (
                        <span className="text-[13px] lg:text-[14px] text-green-600 font-medium">
                          Verified
                        </span>
                      ) : (
                        <button
                          onClick={handleVerifyPhone}
                          className="text-[13px] lg:text-[14px] text-[#51218F] font-medium hover:opacity-80 verify-btn-animation"
                        >
                          Verify
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-[20px] h-[20px]">
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
                              width="20"
                              height="20"
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
                        <span className="text-[14px] lg:text-[15px] font-medium text-[#2A1E17]">
                          Email Verification
                        </span>
                      </div>
                      {emailVerified ? (
                        <span className="text-[13px] lg:text-[14px] text-green-600 font-medium">
                          Verified
                        </span>
                      ) : (
                        <button
                          onClick={handleVerifyEmail}
                          className="text-[13px] lg:text-[14px] text-[#51218F] font-medium hover:opacity-80 verify-btn-animation"
                        >
                          Verify
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* REPLACED: All Contracts Card - Desktop (from JobCreated) */}
                <div className="w-full h-auto rounded-[10px] bg-white shadow-lg p-4 lg:p-6">
                  <div className="flex flex-wrap justify-between items-center mb-4 lg:mb-6">
                    <h3 className="font-montserrat font-medium text-[16px] lg:text-[20px] leading-[100%] text-[#2A1E17]">
                      All Contracts
                    </h3>
                    <div className="flex items-center gap-1">
                      <span className="font-montserrat font-medium text-[14px] lg:text-[16px] leading-[100%] text-[#2A1E17]">
                        Total:
                      </span>
                      <span className="font-montserrat font-bold text-[18px] lg:text-[20px] leading-[100%] text-[#2A1E17]">
                        {contractStats.total}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3 lg:space-y-4 mb-4 lg:mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-[18px] h-[18px] lg:w-[20px] lg:h-[19px] mr-2 lg:mr-3 flex items-center justify-center">
                          <svg
                            className="w-3 h-3 lg:w-4 lg:h-4 text-gray-500"
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
                        <p className="font-montserrat text-[12px] lg:text-[15px] text-[#2A1E17E5]">
                          <span className="font-bold">Pending:</span>
                        </p>
                      </div>
                      <span className="font-montserrat font-semibold text-[#2A1E17] text-[12px] lg:text-[15px]">
                        {contractStats.pending}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-[18px] h-[18px] lg:w-[20px] lg:h-[19px] mr-2 lg:mr-3 flex items-center justify-center">
                          <img
                            src={Folder}
                            alt="Active contracts"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="font-montserrat text-[12px] lg:text-[15px] text-[#2A1E17E5]">
                          <span className="font-bold">Active:</span>
                        </p>
                      </div>
                      <span className="font-montserrat font-semibold text-[#2A1E17] text-[12px] lg:text-[15px]">
                        {contractStats.active}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-[18px] h-[18px] lg:w-[20px] lg:h-[19px] mr-2 lg:mr-3 flex items-center justify-center">
                          <svg
                            className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-500"
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
                        <p className="font-montserrat text-[12px] lg:text-[15px] text-[#2A1E17E5]">
                          <span className="font-bold">Awaiting:</span>
                        </p>
                      </div>
                      <span className="font-montserrat font-semibold text-[#2A1E17] text-[12px] lg:text-[15px]">
                        {contractStats.awaiting}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-[18px] h-[18px] lg:w-[20px] lg:h-[19px] mr-2 lg:mr-3 flex items-center justify-center">
                          <svg
                            className="w-3 h-3 lg:w-4 lg:h-4 text-orange-500"
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
                        <p className="font-montserrat text-[12px] lg:text-[15px] text-[#2A1E17E5]">
                          <span className="font-bold">In Review:</span>
                        </p>
                      </div>
                      <span className="font-montserrat font-semibold text-[#2A1E17] text-[12px] lg:text-[15px]">
                        {contractStats.in_review}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-[18px] h-[18px] lg:w-[20px] lg:h-[19px] mr-2 lg:mr-3 flex items-center justify-center">
                          <img
                            src={Cloud}
                            alt="Completed contracts"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="font-montserrat text-[12px] lg:text-[15px] text-[#2A1E17E5]">
                          <span className="font-bold">Completed:</span>
                        </p>
                      </div>
                      <span className="font-montserrat font-semibold text-[#2A1E17] text-[12px] lg:text-[15px]">
                        {contractStats.completed}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-[18px] h-[18px] lg:w-[20px] lg:h-[19px] mr-2 lg:mr-3 flex items-center justify-center">
                          <img
                            src={Cancel}
                            alt="Canceled contracts"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="font-montserrat text-[12px] lg:text-[15px] text-[#2A1E17E5]">
                          <span className="font-bold">Cancelled:</span>
                        </p>
                      </div>
                      <span className="font-montserrat font-semibold text-[#2A1E17] text-[12px] lg:text-[15px]">
                        {contractStats.cancelled}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-center mt-2">
                    <button
                      onClick={() => navigate("/activecontracts")}
                      className="px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap bg-gradient-to-r from-[#51218F] to-[#2a0e4a] text-white shadow-md"
                    >
                      <span className="font-montserrat font-bold text-[12px] whitespace-nowrap">
                        View All
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FILTER POPUP ===== */}
      <FilterPopup
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        onApplyFilter={handleApplyFilters}
        currentFilters={activeFilters}
        collaboratorCount={allProfiles.length}
      />

      {/* ===== INVITE POPUP ===== */}
      <InvitePopup
        isOpen={invitePopup.isOpen}
        onClose={() => setInvitePopup({ isOpen: false, collaborator: null })}
        collaborator={invitePopup.collaborator}
        currentUser={currentUser}
        jobs={jobs}
        onInvite={handleInvite}
      />

      {/* ===== PHONE INPUT POPUP ===== */}
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
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="flex items-center px-3 py-2.5 sm:px-4 sm:py-3 border border-r-0 border-gray-300 rounded-l-xl bg-gray-50/70 backdrop-blur-sm">
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
                        className="flex-1 px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 border-l-0 rounded-r-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-[#3D1768] focus:border-[#3D1768] outline-none transition-all text-[#030303] poppins-font"
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
                      className={`text-[10px] sm:text-sm font-medium poppins-font ${phoneNumber.length === 10 ? "text-[#3D1768]" : "text-[#030303]/70"}`}
                    >
                      {phoneNumber.length}/10
                    </p>
                  </div>

                  {currentUser?.phone_number &&
                    phoneNumber.length === 10 &&
                    phoneNumber !==
                    currentUser.phone_number
                      .replace(/\D/g, "")
                      .slice(-10) && (
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

      {/* ===== EMAIL SETUP POPUP ===== */}
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
                  <p className="text-[10px] sm:text-sm text-[#030303]/70 poppins-font mt-2 md:mt-3">
                    Enter a valid email address to proceed with verification
                  </p>
                </div>

                <button
                  onClick={handleSaveEmail}
                  disabled={!isValidEmail(newEmail) || isSavingEmail}
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

      {/* ===== EMAIL VERIFICATION POPUP ===== */}
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
                    className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border ${isValidGmail(email) ? "border-gray-300" : "border-red-300"} rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-[#3D1768] focus:border-[#3D1768] outline-none transition-all text-[#030303] poppins-font placeholder:text-[#030303]/50 ${isVerifying ? "opacity-50 cursor-not-allowed" : ""}`}
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

      {showOTPPopup && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99998]"
            onClick={() => {
              setShowOTPPopup(false);
              setOtp(["", "", "", "", "", ""]);
              setResendTime(45);
              if (currentVerificationType === "phone") setShowPhonePopup(true);
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
                              document.getElementById(`otp-${i - 1}`)?.focus();
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
                          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-[50px] lg:h-[70px] text-center text-base sm:text-xl md:text-2xl lg:text-4xl text-[#000000] bg-transparent outline-none leading-none pb-1 sm:pb-2"
                        />
                        <div
                          className={`absolute left-0 right-0 bottom-0 h-[2px] rounded-full transition-all duration-300 ${otp[i] ? "bg-[#3D1768]" : "bg-gray-400"
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

      {/* ========== SUCCESS POPUP ========== */}
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
                <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full border border-white/20 bg-gradient-to-r from-[#3D1768] to-[#030303]">
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

      {/* ===== DELETE JOB CONFIRMATION POPUP ===== */}
      {showDeletePopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#51218F] to-[#2a0e4a] p-6 text-center">
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
              <h3 className="text-xl font-bold text-white">Delete Job</h3>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete this job?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeletePopup(false);
                    setJobToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteJob}
                  className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-700 text-white font-medium hover:from-red-600 hover:to-red-800 transition-colors shadow-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full mt-auto">
        <Footer />
      </div>

      <style>{`
        @keyframes zoomInOut {
          0% {
            transform: scale(1);
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
          }
        }
        .animate-zoom {
          animation: zoomInOut 0.8s ease-in-out !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #51218f;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3d1768;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @media (max-width: 640px) {
          .flex.gap-2 button {
            white-space: nowrap;
            font-size: 11px;
            padding-left: 8px;
            padding-right: 8px;
          }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-bounce {
          animation: bounce 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;