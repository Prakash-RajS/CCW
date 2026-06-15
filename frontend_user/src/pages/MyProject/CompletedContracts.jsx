// frontend_user/src/pages/MyProject/CompletedContracts.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BannerImg from "../../assets/myproject/banner.png";
import Footer from "../../component/Footer";
import Header from "../../component/Header";
import DownloadSuccessImg from "../../assets/myproject/downloadsuccess.png";
import api from "../../utils/axiosConfig";
import { useUser } from "../../contexts/UserContext";
import toast from "../../component/Toast";

export default function CompletedContracts() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [totalBudget, setTotalBudget] = useState("0.00");
  const [statusCounts, setStatusCounts] = useState({
    accepted: 0,
    awaiting: 0,
    in_progress: 0,
    pending: 0,
    completed: 0,
    in_review: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [selectedReviewContract, setSelectedReviewContract] = useState(null);
  const [reviewedContracts, setReviewedContracts] = useState(new Set());
  const [expandedMilestones, setExpandedMilestones] = useState({});

  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useUser();

  const tabs = [
    { name: "Active contracts", path: "/activecontracts", key: "in_progress" },
    { name: "Awaiting contracts", path: "/awaitingcontracts", key: "awaiting" },
    { name: "In Review", path: "/pendingcontracts", key: "in_review" },
    {
      name: "Pending contracts",
      path: "/pendingstatuscontracts",
      key: "pending",
    },
    {
      name: "Completed contracts",
      path: "/completedcontracts",
      key: "completed",
    },
  ];

  useEffect(() => {
    if (userData?.id) {
      fetchContracts();
      fetchStatusCounts();
      fetchReviewedContracts();
    }
  }, [userData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [contracts.length]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/contracts/by-status", {
        params: { status: "completed", user_id: userData.id },
      });
      if (response.data && response.data.length > 0) {
        setContracts(response.data);
        setTotalBudget(
          response.data.reduce((sum, c) => sum + c.budget, 0).toFixed(2),
        );
      } else {
        setContracts([]);
        setTotalBudget("0.00");
      }
    } catch (error) {
      toast.error(
        "Failed to load contracts",
        error.response?.data?.detail || "Please try again later.",
      );
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusCounts = async () => {
    try {
      const r = await api.get("/contracts/status-counts", {
        params: { user_id: userData.id },
      });
      setStatusCounts(r.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReviewedContracts = async () => {
    if (!userData?.id) return;
    try {
      const r = await api.get(`/reviews/given/${userData.id}`);
      setReviewedContracts(
        new Set(
          (r.data?.reviews || [])
            .filter((x) => x.contract_id)
            .map((x) => x.contract_id),
        ),
      );
    } catch (e) {
      console.error(e);
    }
  };

const downloadMilestoneWork = async (contract, milestoneIndex) => {
  const milestone = contract.milestones_data?.[milestoneIndex];
  if (!milestone || !milestone.submission?.attachment) {
    toast.error("No file", "No work attachment available for this milestone.");
    return;
  }
  
  try {
    const response = await api.get(`/contracts/${contract.id}/milestones/${milestoneIndex}/download-attachment`, {
      params: { user_id: userData.id },
      responseType: "blob"
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = milestone.submission.attachment_name || `milestone_${milestoneIndex + 1}_work.zip`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setShowSuccess(true);
    }, 100);
  } catch (error) {
    console.error("Download error:", error);
    toast.error("Download failed", "Could not retrieve file.");
  }
};

  const getRecipient = (c) =>
    c.viewer_role === "creator" ? c.collaborator : c.creator;
  const getRecipientName = (c) => {
    const r = getRecipient(c);
    if (!r) return "Other Party";
    return r.full_name || r.name || r.email?.split("@")[0] || "Other Party";
  };
  const getRecipientId = (c) => getRecipient(c)?.id;

  const handleReviewClick = (contract) => {
    setSelectedReviewContract(contract);
    setReviewRating(5);
    setReviewComment("");
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    const recipientId = getRecipientId(selectedReviewContract);
    if (!recipientId) {
      toast.error("Cannot review", "Other party information missing");
      return;
    }
    setReviewSubmitting(true);
    try {
      await api.post("/reviews/create", null, {
        params: {
          reviewer_id: userData.id,
          recipient_id: recipientId,
          contract_id: selectedReviewContract.id,
          rating: reviewRating,
          comment: reviewComment,
        },
      });
      toast.success("Review submitted", "Thank you for your feedback!");
      setShowReviewModal(false);
      await fetchReviewedContracts();
    } catch (err) {
      toast.error(
        "Submission failed",
        err.response?.data?.detail || "Please try again.",
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Render milestone summary for completed contracts
  const renderMilestoneSummary = (contract) => {
  if (!contract.milestones_data || contract.milestones_data.length === 0) {
    return null;
  }

  const milestones = contract.milestones_data;
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(m => m.status === 'paid').length;
  const totalAmount = milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
  const isExpanded = expandedMilestones[contract.id];

  if (totalMilestones === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpandedMilestones(prev => ({ ...prev, [contract.id]: !prev[contract.id] }))}
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-sm font-medium text-gray-700">
            Milestone Summary: {completedMilestones}/{totalMilestones} completed
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">Total: ₹{totalAmount}</span>
          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {isExpanded && (
  <div className="mt-3 space-y-3">
    {milestones.map((milestone, idx) => (
      <div key={idx} className="flex flex-col p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <span className={`w-2 h-2 rounded-full ${milestone.status === 'paid' ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-gray-700 font-medium">Milestone {idx + 1}: {milestone.description}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-600">₹{milestone.amount}</span>
            {milestone.status === 'paid' && (
              <span className="text-green-600 text-xs">✓ Paid</span>
            )}
          </div>
        </div>
        
        {/* Show submission details for this milestone */}
        {milestone.submission && (
          <div className="mt-2 pl-6 space-y-1">
            {milestone.submission.description && (
              <p className="text-xs text-gray-600">{milestone.submission.description}</p>
            )}
            {milestone.submission.external_link && (
              <a
                href={milestone.submission.external_link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-purple-600 text-xs underline break-all hover:text-purple-800 inline-flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {milestone.submission.external_link.length > 50 
                  ? milestone.submission.external_link.substring(0, 50) + "..." 
                  : milestone.submission.external_link}
              </a>
            )}
            {milestone.submission.attachment && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadMilestoneWork(contract, idx);
                }}
                className="text-blue-600 text-xs underline hover:text-blue-800 inline-flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download {milestone.submission.attachment_name || "Attachment"}
              </button>
            )}
            {milestone.submission.submitted_at && (
              <p className="text-xs text-gray-400">
                Submitted: {new Date(milestone.submission.submitted_at).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
        
        {/* Show payment date if paid */}
        {milestone.payment && milestone.payment.paid_at && (
          <div className="mt-1 pl-6 text-xs text-green-600">
            Paid on: {new Date(milestone.payment.paid_at).toLocaleDateString()}
          </div>
        )}
      </div>
    ))}
  </div>
)}
    </div>
  );
};


  const CountryFlag = ({ countryCode, country }) => {
    if (!countryCode) return <span>🌍</span>;
    return (
      <img
        src={`https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`}
        alt={country}
        title={country}
        className="w-5 h-4 rounded-[4px] object-cover"
        loading="lazy"
      />
    );
  };

  const formatJobTitle = (t) => t || "Untitled Project";
  const formatJobDescription = (d) => {
    if (!d) return "No description provided";
    return d.length > 150 ? d.substring(0, 150) + "..." : d;
  };
  const formatPostedTime = (createdAt) => {
    if (!createdAt) return "Posted recently";
    const diff = Math.floor(
      (Date.now() - new Date(createdAt)) / (1000 * 60 * 60),
    );
    if (diff < 1) return "Posted just now";
    if (diff === 1) return "Posted 1 hour ago";
    if (diff < 24) return `Posted ${diff} hours ago`;
    const days = Math.floor(diff / 24);
    return days === 1 ? "Posted 1 day ago" : `Posted ${days} days ago`;
  };
  const getBudgetDisplay = (c) => {
    if (c.job_budget_from && c.job_budget_to)
      return `₹${c.job_budget_from} - ₹${c.job_budget_to}`;
    if (c.job_budget_from) return `₹${c.job_budget_from}+`;
    if (c.job_budget_to) return `Up to ₹${c.job_budget_to}`;
    return "No budget set";
  };
  const getExpertiseLevel = (c) => {
    const map = {
      fresher: "Entry Level",
      medium: "Intermediate",
      experienced: "Expert",
      beginner: "Beginner",
    };
    const l = c.job_expertise_level?.toLowerCase();
    return l
      ? map[l] || l.charAt(0).toUpperCase() + l.slice(1)
      : "Intermediate";
  };
  const getRateType = (t) => (t === "hourly" ? "Hourly Rate" : "Fixed Rate");
  const formatDate = (d) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const downloadFile = async (contractId, hasAttachment) => {
    if (!hasAttachment) {
      toast.error("No file", "No work attachment available.");
      return;
    }
    try {
      const response = await api.get(
        `/contracts/${contractId}/work-attachment`,
        {
          params: { user_id: userData.id },
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: response.headers["content-type"] }),
      );
      const a = document.createElement("a");
      a.href = url;
      let filename = `contract-${contractId}-work`;
      const cd = response.headers["content-disposition"];
      if (cd) {
        const m = cd.match(/filename="?([^"]+)"?/);
        if (m?.[1]) filename = m[1];
      }
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setShowSuccess(true);
      }, 100);
    } catch {
      toast.error("Download failed", "Could not retrieve file.");
    }
  };

  const openExternalLink = (externalLink) => {
    if (externalLink) {
      window.open(externalLink, "_blank", "noopener,noreferrer");
    } else {
      toast.error(
        "No external link",
        "This contract does not have an external file link.",
      );
    }
  };

  const totalPages = Math.ceil(contracts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentContracts = contracts.slice(indexOfFirstItem, indexOfLastItem);
  const goToPage = (p) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-md text-sm transition-colors ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-200 text-gray-700 hover:bg-[#51218F] hover:text-white"}`}
        >
          Previous
        </button>
        {[...Array(totalPages)].map((_, idx) => {
          const page = idx + 1;
          if (
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 1 && page <= currentPage + 1)
          )
            return (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`w-8 h-8 rounded-md text-sm transition-colors ${currentPage === page ? "bg-[#51218F] text-white" : "bg-gray-200 text-gray-700 hover:bg-[#51218F] hover:text-white"}`}
              >
                {page}
              </button>
            );
          if (page === 2 && currentPage > 3) return <span key="s">...</span>;
          if (page === totalPages - 1 && currentPage < totalPages - 2)
            return <span key="e">...</span>;
          return null;
        })}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-md text-sm transition-colors ${currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-200 text-gray-700 hover:bg-[#51218F] hover:text-white"}`}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F5F5]">
      <div className="absolute top-0 left-0 w-full z-50">
        <Header />
      </div>

      {/* BANNER */}
      <div className="relative w-full h-[260px] md:h-[433px] overflow-hidden">
        <img
          src={BannerImg}
          className="absolute inset-0 w-full h-full object-cover"
          alt="Banner"
        />
        <div className="absolute inset-0 bg-black opacity-35" />
       <div className="relative z-10 text-white max-w-[1221px] mx-auto px-2 sm:px-3 md:px-4 pt-6 md:pt-[131px]">
  <div className="flex justify-between items-start md:items-center mb-1">
    {/* Desktop version */}
    <div className="hidden md:block">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-4 py-2 text-white hover:text-white/80 transition-colors group mt-14 md:mb-4"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-[#51218F] to-[#2a0e4a] group-hover:from-[#3d1768] group-hover:to-[#1a0830] transition-all">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </div>
        <span className="font-medium text-base">Back</span>
      </button>
      <h2 className="text-[18px] md:text-[28px] font-semibold">
        My contracts
      </h2>
    </div>

    {/* Mobile & Tablet version */}
    <div className="block md:hidden w-full">
      <div className="flex justify-between items-center mt-14">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 px-2 py-1 text-white hover:text-white/80 transition-colors group"
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-[#51218F] to-[#2a0e4a] group-hover:from-[#3d1768] group-hover:to-[#1a0830] transition-all">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </div>
          <span className="font-medium text-sm">Back</span>
        </button>
        <p className="text-[10px] sm:text-[11px] md:text-[12px] font-semibold">
          Total Budget: ₹{totalBudget} INR
        </p>
      </div>
      <h2 className="text-[16px] sm:text-[17px] md:text-[18px] font-semibold text-center mt-2">
        My contracts
      </h2>
    </div>

    {/* Desktop total budget */}
    <p className="text-[14px] md:text-[22px] mt-20 font-semibold hidden md:block">
      Total Budget: ₹{totalBudget} INR
    </p>
  </div>

  {/* TABS */}
  <div className="flex flex-col md:flex-row md:justify-center border-b border-white/20 font-semibold">
    {/* Top row - first 3 tabs on mobile & tablet */}
    <div className="flex justify-center text-[9px] sm:text-[10px] md:text-[13px] lg:text-[16px] xl:text-[17px] md:justify-center md:gap-1 lg:gap-2">
      {tabs.slice(0, 3).map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`relative pb-2 pt-1 px-1 sm:px-1.5 md:px-2 lg:px-3 xl:px-4 whitespace-nowrap transition-colors duration-150 flex-1 md:flex-none ${
              isActive
                ? "text-white font-bold [text-shadow:0_1px_8px_rgba(0,0,0,0.8)]"
                : "text-white font-normal [text-shadow:0_1px_8px_rgba(0,0,0,0.8)] opacity-80 hover:opacity-100"
            }`}
          >
            {tab.name} ({statusCounts[tab.key] || 0})
            {isActive && (
              <span className="absolute bottom-0 left-1 right-1 lg:left-2 lg:right-2 h-[2px] md:h-[3px] bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] rounded-full" />
            )}
          </button>
        );
      })}
    </div>
    
    {/* Bottom row - remaining 2 tabs on mobile & tablet */}
    <div className="flex justify-center text-[9px] sm:text-[10px] md:text-[13px] lg:text-[16px] xl:text-[17px] border-t border-white/20 md:border-t-0 md:gap-1 lg:gap-2">
      {tabs.slice(3).map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`relative pb-2 pt-1 px-1 sm:px-1.5 md:px-2 lg:px-3 xl:px-4 whitespace-nowrap transition-colors duration-150 flex-1 md:flex-none ${
              isActive
                ? "text-white font-bold [text-shadow:0_1px_8px_rgba(0,0,0,0.8)]"
                : "text-white font-normal [text-shadow:0_1px_8px_rgba(0,0,0,0.8)] opacity-80 hover:opacity-100"
            }`}
          >
            {tab.name} ({statusCounts[tab.key] || 0})
            {isActive && (
              <span className="absolute bottom-0 left-1 right-1 lg:left-2 lg:right-2 h-[2px] md:h-[3px] bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  </div>
</div>
      </div>

   <div className="relative -mt-[30px] mb-10 md:-mt-[90px] max-w-[1200px] mx-auto bg-white rounded-[18px] shadow-xl p-4 md:p-6 space-y-4 md:space-y-6">
  {loading ? (
    <div className="text-center py-6 md:py-10">
      <div className="inline-block animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-t-2 border-b-2 border-purple-600 mb-2 md:mb-3" />
      <p className="text-sm md:text-base text-gray-600">Loading completed contracts...</p>
    </div>
  ) : contracts.length === 0 ? (
    <div className="text-center py-6 md:py-10">
      <p className="text-sm md:text-base text-gray-600">No completed contracts found</p>
    </div>
  ) : (
    <>
      {currentContracts.map((contract) => {
        const alreadyReviewed = reviewedContracts.has(contract.id);
        const isCreator = contract.viewer_role === "creator";
        const otherParty = isCreator
          ? contract.collaborator
          : contract.creator;
        const otherPartyName =
          otherParty?.full_name ||
          otherParty?.name ||
          otherParty?.email?.split("@")[0] ||
          "Other Party";
        const otherPartyRole = isCreator ? "Freelancer" : "Client";
        const completionDate = contract.completed_at || contract.end_date;
        const completedByText = isCreator
          ? `Completed by: ${otherPartyName}`
          : `Worked with: ${otherPartyName}`;

        return (
          <div
            key={contract.id}
            className="relative border-2 border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col gap-4 md:gap-6 transition-all duration-200 hover:shadow-lg hover:border-purple-300 bg-white shadow-sm"
          >
            <div className="flex-1">
              <h3 className="text-base md:text-[20px] font-semibold mb-1 md:mb-2 pr-24 md:pr-14">
                {formatJobTitle(contract.job_title)}
              </h3>
              <p className="text-gray-600 text-[11px] md:text-[14px] mb-2 md:mb-3">
                {contract.job_budget_type === "hourly"
                  ? "Hourly"
                  : "Fixed"}{" "}
                · {getExpertiseLevel(contract)} · ₹{getBudgetDisplay(contract)} ·{" "}
                {formatPostedTime(contract.job_created_at)}
              </p>
              <p className="text-xs md:text-[15px] text-gray-700 leading-[20px] md:leading-[26px] mb-3 md:mb-4 line-clamp-2 md:line-clamp-none">
                {formatJobDescription(
                  contract.job_description || contract.description,
                )}
              </p>

              {/* Milestone Summary */}
              {renderMilestoneSummary(contract)}

              <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-700 mb-2 bg-gray-50 p-1.5 md:p-2 rounded-lg w-fit mt-2 md:mt-3">
                <svg
                  className="w-3 h-3 md:w-4 md:h-4 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="font-medium text-xs md:text-sm">{completedByText}</span>
              </div>
              {completionDate && (
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 mb-2 md:mb-3 bg-green-50 p-1.5 md:p-2 rounded-lg w-fit">
                  <svg
                    className="w-3 h-3 md:w-4 md:h-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="font-medium text-xs md:text-sm">Completed:</span>
                  <span className="text-xs md:text-sm">{formatDate(completionDate)}</span>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2 md:gap-4 text-[11px] md:text-[14px] text-gray-600 mb-3 md:mb-4">
                <span className="text-[#5A1FA8] font-semibold text-sm md:text-base">
                  ₹{contract.budget}
                </span>
                <span>{getRateType(contract.job_budget_type)}</span>
                <span className="text-[#5A1FA8] text-xs md:text-sm">
                  {"★".repeat(Math.floor(contract.creator?.rating || 0))}
                  {"☆".repeat(
                    5 - Math.floor(contract.creator?.rating || 0),
                  )}
                </span>
                <span className="text-xs md:text-sm">
                  {contract.creator?.rating || 0}/5 ({contract.creator?.reviews || 0})
                </span>
                <div className="flex items-center gap-1 md:gap-2">
                  <CountryFlag
                    countryCode={contract.creator?.country_code}
                    country={contract.creator?.country}
                  />
                  <span className="text-xs md:text-sm truncate max-w-[120px] md:max-w-none">
                    {[contract.creator?.state, contract.creator?.country]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              </div>
              {alreadyReviewed ? (
                <span className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-4 py-1 md:py-2 rounded-full bg-gray-100 text-gray-500 text-[11px] md:text-sm font-medium">
                  ✓ Reviewed
                </span>
              ) : (
                <button
                  onClick={() => handleReviewClick(contract)}
                  className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-1.5 md:py-2 rounded-full bg-[#51218F] text-white text-[11px] md:text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    className="md:w-[15px] md:h-[15px]"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  Review
                </button>
              )}
            </div>

            {/* Action buttons */}
          <div className="absolute top-2 right-2 md:top-4 md:right-4 flex gap-1.5 md:gap-3">
  <div
    onClick={() => downloadFile(contract.id, contract.has_attachment)}
    className={`w-7 h-7 md:w-[52px] md:h-[52px] rounded-full bg-gradient-to-br from-[#7C3AED] to-[#2B0F4C] flex items-center justify-center shadow-[0_6px_20px_rgba(124,58,237,0.35)] cursor-pointer hover:opacity-90 transition ${!contract.has_attachment ? "opacity-50 cursor-not-allowed" : ""}`}
    title={contract.has_attachment ? "Download work submission" : "No file available"}
  >
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2.6"
      className="md:w-[22px] md:h-[22px]"
    >
      <path d="M12 3v12" />
      <path d="M7 10l5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  </div>
  <div
    onClick={() => openExternalLink(contract.external_file_link)}
    className="w-7 h-7 md:w-[52px] md:h-[52px] rounded-full bg-gradient-to-br from-[#3B82F6] to-[#1E3A8A] flex items-center justify-center shadow-[0_6px_20px_rgba(59,130,246,0.35)] cursor-pointer hover:opacity-90 transition"
    title={contract.external_file_link ? "Open external link" : "No external link"}
  >
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      className="md:w-[22px] md:h-[22px]"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  </div>
</div>
          </div>
        );
      })}
      {renderPagination()}
      <div className="text-center text-[11px] md:text-sm text-gray-500 mt-1 md:mt-2">
        Showing {indexOfFirstItem + 1} to{" "}
        {Math.min(indexOfLastItem, contracts.length)} of{" "}
        {contracts.length} contracts
      </div>
    </>
  )}
</div>

      <Footer />

      {/* Download Success Modal */}
     {showSuccess && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="relative w-[80%] max-w-[520px] h-[280px] md:h-[360px] bg-white rounded-[20px] md:rounded-[26px] flex flex-col items-center justify-center">
      <div
        onClick={() => setShowSuccess(false)}
        className="absolute top-4 left-4 md:top-6 md:left-6 w-8 h-8 md:w-[44px] md:h-[44px] rounded-full bg-gradient-to-br from-[#7C3AED] to-[#2B0F4C] flex items-center justify-center cursor-pointer hover:opacity-90 transition"
      >
        <svg width="16" height="16" md:width="24" md:height="24" viewBox="0 0 24 24" fill="none" className="md:w-6 md:h-6">
          <path
            d="M20 12H4M4 12L10 6M4 12L10 18"
            stroke="white"
            strokeWidth="3"
          />
        </svg>
      </div>
      <h1
        className="text-[28px] md:text-[40px] font-bold mb-4 md:mb-6"
        style={{ fontFamily: "Trochut", color: "#2B0F4C" }}
      >
        Talenta
      </h1>
      <img
        src={DownloadSuccessImg}
        className="w-[100px] h-[100px] md:w-[140px] md:h-[140px] mb-4 md:mb-6"
        alt="Download Success"
      />
      <p
        className="text-[20px] md:text-[30px] font-semibold text-center px-4"
        style={{ fontFamily: "Milonga", color: "#2B0F4C" }}
      >
        Download successful
      </p>
    </div>
  </div>
)}

      {/* Review Modal */}
     {showReviewModal && selectedReviewContract && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-3">
    <div className="bg-white w-full max-w-[90%] md:max-w-md rounded-xl md:rounded-2xl shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-[#51218F] to-black px-4 py-3 md:px-6 md:py-4">
        <h3 className="text-base md:text-xl font-bold text-white">
          Review{" "}
          {selectedReviewContract.viewer_role === "creator"
            ? "Freelancer"
            : "Client"}
        </h3>
        <p className="text-white/80 text-xs md:text-sm">
          Share your experience with{" "}
          {getRecipientName(selectedReviewContract)}
        </p>
      </div>
      <div className="p-4 md:p-6 space-y-3 md:space-y-4">
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
            Rating (1–5)
          </label>
          <div className="flex gap-1.5 md:gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setReviewRating(star)}
                className="text-xl md:text-2xl focus:outline-none transition-transform hover:scale-110"
              >
                {star <= reviewRating ? (
                  <span className="text-yellow-500">★</span>
                ) : (
                  <span className="text-gray-300">★</span>
                )}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
            Comment (optional)
          </label>
          <textarea
            rows={3}
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder={
              selectedReviewContract.viewer_role === "creator"
                ? "What was it like working with this freelancer?"
                : "What was it like working with this client?"
            }
            className="w-full px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base rounded-lg md:rounded-xl border border-gray-300 focus:border-[#51218F] focus:ring-1 focus:ring-[#51218F] outline-none resize-none"
          />
        </div>
        <div className="flex gap-2 md:gap-3 pt-1 md:pt-2">
          <button
            onClick={() => setShowReviewModal(false)}
            className="flex-1 py-1.5 md:py-2 text-sm md:text-base rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitReview}
            disabled={reviewSubmitting}
            className="flex-1 py-1.5 md:py-2 text-sm md:text-base rounded-lg bg-[#51218F] text-white hover:opacity-90 disabled:opacity-50"
          >
            {reviewSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
