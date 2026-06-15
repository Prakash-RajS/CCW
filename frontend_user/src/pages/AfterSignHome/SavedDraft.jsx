import React, { useEffect, useState } from "react";
import flag from "../../assets/MyWork/flag.png";
import api from "../../utils/axiosConfig";
import { useUser } from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import toast from "../../component/Toast";
import ReactCountryFlag from "react-country-flag";

const SavedDraft = () => {
  const { userData } = useUser();
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDescId, setExpandedDescId] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);

  useEffect(() => {
    if (!userData?.id) return;

    const fetchDrafts = async () => {
      setLoading(true);
      try {
        const res = await api.get(
          `/jobs/my-jobs/${userData.id}?status=draft`
        );
        
        // Process each draft to match the format of View Jobs
        const processedDrafts = (res.data.jobs || []).map((job) => {
          // Calculate posted time
          const calculateTimeAgo = (dateString) => {
            try {
              if (!dateString) return "Saved";
              const jobDate = new Date(dateString);
              const now = new Date();
              const diffMs = now - jobDate;
              const diffMinutes = Math.floor(diffMs / (1000 * 60));
              const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
              const diffDays = Math.floor(diffHours / 24);

              if (diffMinutes < 1) return "Saved just now";
              if (diffMinutes < 60) return `Saved ${diffMinutes} min ago`;
              if (diffHours === 1) return "Saved 1 hour ago";
              if (diffHours < 24) return `Saved ${diffHours} hours ago`;
              if (diffDays === 1) return "Saved 1 day ago";
              if (diffDays < 30) return `Saved ${diffDays} days ago`;
              const diffMonths = Math.floor(diffDays / 30);
              if (diffMonths === 1) return "Saved 1 month ago";
              return `Saved ${diffMonths} months ago`;
            } catch {
              return "Saved";
            }
          };

          // Format expertise level
          const formatExpertiseLevel = (level) => {
            if (!level) return "Intermediate";
            return level.charAt(0).toUpperCase() + level.slice(1);
          };

          // Format budget
          const formatBudget = (job) => {
            if (!job.budget_type) return "Budget not specified";
            if (job.budget_type?.toLowerCase() === "hourly" && job.budget_from && job.budget_to) {
              return `₹${job.budget_from} – ₹${job.budget_to}/hr`;
            } else if (job.budget_type?.toLowerCase() === "hourly" && job.budget_from) {
              return `₹${job.budget_from}/hr`;
            } else if (job.budget_type?.toLowerCase() === "fixed" && job.budget_from) {
              return `₹${job.budget_from}`;
            }
            return "Budget not specified";
          };

          return {
            ...job,
            posted_time: calculateTimeAgo(job.created_at),
            formatted_expertise: formatExpertiseLevel(job.expertise_level),
            formatted_budget: formatBudget(job),
            city: job.city || "",
            country: job.country || "",
            country_code: job.country_code || "",
            rating: job.rating || 0,
            reviews: job.reviews || 0,
            posted_ago: calculateTimeAgo(job.created_at)
          };
        });
        
        setDrafts(processedDrafts);
      } catch (err) {
        console.error("Failed to fetch drafts", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, [userData?.id]);

  // Handler for edit job
  const handleEditJob = (jobId) => {
    navigate(`/edit-job/${jobId}`);
  };

  // Handler for delete job - shows custom popup
  const handleDeleteJob = (jobId) => {
    setJobToDelete(jobId);
    setShowDeletePopup(true);
  };

  // Perform the actual deletion after confirmation
  const confirmDeleteJob = async () => {
    if (!jobToDelete) return;
    
    try {
      await api.delete(`/jobs/${jobToDelete}/delete`);
      setDrafts(drafts.filter(job => job.id !== jobToDelete));
      toast.success("Deleted", "Draft deleted successfully");
      setShowDeletePopup(false);
      setJobToDelete(null);
    } catch (err) {
      console.error("Failed to delete draft", err);
      toast.error("Delete failed", "Failed to delete draft");
      setShowDeletePopup(false);
      setJobToDelete(null);
    }
  };

  return (
    <>
      <div className="space-y-6 max-[420px]:space-y-5">
        <h3 className="font-semibold text-[18px] max-[420px]:text-[16px] text-[#2A1E17]">
          Saved Drafts ({drafts.length})
        </h3>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading drafts...</p>
          </div>
        ) : drafts.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg p-6">
            <p className="text-gray-500 mb-4">No saved drafts yet.</p>
          </div>
        ) : (
          drafts.map((job) => (
  <div
    key={job.id}
    className="bg-white rounded-[10px] shadow-lg p-5 max-[420px]:p-4 border border-gray-100 relative"
  >
    {/* Edit and Delete Icons - Smaller size matching JobCreated */}
    <div className="absolute top-4 right-4 flex gap-1.5 sm:gap-2 z-10">
      {/* Edit Icon */}
      <button
        onClick={() => handleEditJob(job.id)}
        title="Edit Draft"
        className="
          w-6 h-6 sm:w-7 sm:h-7
          flex items-center justify-center
          rounded-full
          shadow-md
          cursor-pointer
          transition-transform duration-200
          hover:scale-105
        "
        style={{
          background: "linear-gradient(180deg, #51218F 0%, #020202 100%)",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-3 h-3 sm:w-3.5 sm:h-3.5"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
      
      {/* Delete Icon */}
      <button
        onClick={() => handleDeleteJob(job.id)}
        className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-50 transition-colors cursor-pointer"
        title="Delete Draft"
      >
        <svg
          className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      </button>
    </div>

    {/* Title Section - with padding to prevent overlap */}
    <div className="pr-20 sm:pr-24 md:pr-28">
      <h3 className="font-semibold text-xl max-[420px]:text-[18px] text-gray-900 mb-2 break-words">
        {job.title}
      </h3>
    </div>

    <p className="text-sm text-gray-600 mb-3">
      {job.budget_type === "fixed" ? "Fixed-price" : "Hourly"} · {job.formatted_expertise} · Est. Budget {job.formatted_budget} · {job.posted_time}
    </p>
    
    <p className="text-gray-700 leading-relaxed mb-4 text-[15px] max-[420px]:text-[14px]">
      {expandedDescId === job.id
        ? job.description || "No description available"
        : `${job.description?.slice(0, 150) || "No description available"}...`}
      
      {job.description && job.description.length > 150 && (
        <button
          onClick={() => setExpandedDescId(expandedDescId === job.id ? null : job.id)}
          className="text-[#51218F] ml-1 font-medium hover:underline"
        >
          {expandedDescId === job.id ? "Show less" : "more"}
        </button>
      )}
    </p>
    
    <div className="flex flex-wrap gap-5 text-sm text-gray-600 items-center">
      <span className="text-[#51218F] font-bold text-[15px]">
        {job.budget_type?.toLowerCase() === "fixed" ? "₹ Fixed Rate" : "₹ Hourly Rate"}
      </span>
      <span className="text-[#51218F] flex items-center gap-1">
        <span className="text-yellow-500">
          {"★".repeat(Math.round(job.rating || 0))}
          {"☆".repeat(5 - Math.round(job.rating || 0))}
        </span>
        <span>{job.rating || 0}/5 ({job.reviews || 0} Review{job.reviews !== 1 ? 's' : ''})</span>
      </span>
      <div className="flex items-center gap-2">
        {job.country_code && (
          <ReactCountryFlag
            countryCode={job.country_code}
            svg
            style={{ width: "18px", height: "14px" }}
          />
        )}
        <span>
          {job.state && job.country
            ? `${job.state}, ${job.country}`
            : job.country || "Remote"}
        </span>
      </div>
    </div>
  </div>
))
        )}
      </div>

      {/* Custom Delete Confirmation Popup */}
      {showDeletePopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-[#51218F] to-[#2a0e4a] p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Delete Draft</h3>
            </div>
            
            {/* Content */}
            <div className="p-6 text-center">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete this draft?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                This action cannot be undone.
              </p>
              
              {/* Buttons */}
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
    </>
  );
};

export default SavedDraft;