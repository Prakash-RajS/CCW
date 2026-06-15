// frontend_user/src/pages/MyProject/EditWork.jsx
import React, { useState, useEffect } from "react";
import BannerImg from "../../assets/myproject/banner.png";
import Footer from "../../component/Footer";
import Header from "../../component/Header";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../utils/axiosConfig";
import { useUser } from "../../contexts/UserContext";
import toast from "../../component/Toast";

export default function EditWork() {
  const [contract, setContract] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [milestones, setMilestones] = useState([]);
  const [expandedMilestones, setExpandedMilestones] = useState({});
  const [statusCounts, setStatusCounts] = useState({
    accepted: 0,
    awaiting: 0,
    in_progress: 0,
    pending: 0,
    completed: 0,
    in_review: 0,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useUser();

  const contractId = location.state?.contractId;
  const fromTab = location.state?.fromTab || "activecontracts";

  const TAB_STATUS_MAP = {
    activecontracts:        "in_progress",
    awaitingcontracts:      "awaiting",
    pendingcontracts:       "in_review",
    pendingstatuscontracts: "pending",
    completedcontracts:     "completed",
  };

  const tabs = [
    { name: "Active contracts",    path: "/activecontracts",        key: "in_progress" },
    { name: "Awaiting contracts",  path: "/awaitingcontracts",      key: "awaiting"    },
    { name: "In Review",           path: "/pendingcontracts",       key: "in_review"   },
    { name: "Pending contracts",   path: "/pendingstatuscontracts", key: "pending"     },
    { name: "Completed contracts", path: "/completedcontracts",     key: "completed"   },
  ];

  useEffect(() => {
    if (contractId && userData?.id) {
      fetchContractFromList();
      fetchStatusCounts();
    } else if (!contractId) {
      navigate(-1);
    }
  }, [contractId, userData]);

  // Parse milestones when contract loads
  useEffect(() => {
    if (contract?.milestones_data) {
      setMilestones(contract.milestones_data);
    }
  }, [contract]);

  const fetchStatusCounts = async () => {
    try {
      const r = await api.get("/contracts/status-counts", { params: { user_id: userData.id } });
      setStatusCounts(r.data);
    } catch (e) { console.error(e); }
  };

  const fetchContractFromList = async () => {
    try {
      setLoading(true);
      const status = TAB_STATUS_MAP[fromTab] || "in_progress";
      const response = await api.get("/contracts/by-status", { 
        params: { status, user_id: userData.id } 
      });

      if (response.data && response.data.length > 0) {
        const foundContract = response.data.find((c) => c.id === contractId);
        if (foundContract) {
          setContract(foundContract);
          setJob({
            title: foundContract.job_title,
            description: foundContract.job_description,
            budget_type: foundContract.job_budget_type,
            budget_from: foundContract.job_budget_from,
            budget_to: foundContract.job_budget_to,
            expertise_level: foundContract.job_expertise_level,
            created_at: foundContract.job_created_at,
            contracts_count: 1,
          });
        } else {
          navigate(-1);
        }
      } else {
        navigate(-1);
      }
    } catch (error) {
      console.error("Error fetching contracts:", error);
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get milestone status badge
  const getMilestoneStatusBadge = (status) => {
    switch(status) {
      case 'paid':
        return <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">Paid ✓</span>;
      case 'submitted':
        return <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">Under Review</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 text-xs font-medium">In Progress</span>;
      case 'revision_requested':
        return <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-xs font-medium">Revision Needed</span>;
      case 'pending':
        return <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">Pending</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">{status || 'Pending'}</span>;
    }
  };

  // Render milestone timeline
  const renderMilestoneTimeline = () => {
    if (!milestones || milestones.length === 0) {
      return null;
    }

    const totalAmount = milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
    const paidAmount = milestones.filter(m => m.status === 'paid').reduce((sum, m) => sum + (m.amount || 0), 0);
    const completedCount = milestones.filter(m => m.status === 'paid').length;

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-[#5A1FA8] mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Milestone Timeline
        </h3>
        
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{completedCount}/{milestones.length} milestones completed • ₹{paidAmount} / ₹{totalAmount} paid</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${(paidAmount / totalAmount) * 100}%` }}
            />
          </div>
        </div>

        {/* Milestone list */}
        <div className="space-y-3">
          {milestones.map((milestone, idx) => {
            const isExpanded = expandedMilestones[idx];
            const isPaid = milestone.status === 'paid';
            const isSubmitted = milestone.status === 'submitted';
            const isInProgress = milestone.status === 'in_progress';
            const isRevisionRequested = milestone.status === 'revision_requested';
            
            return (
              <div 
                key={idx} 
                className={`border rounded-xl overflow-hidden transition-all ${
                  isPaid ? 'border-green-200 bg-green-50/30' :
                  isSubmitted ? 'border-yellow-200 bg-yellow-50/30' :
                  isInProgress ? 'border-blue-200 bg-blue-50/30' :
                  isRevisionRequested ? 'border-orange-200 bg-orange-50/30' :
                  'border-gray-200'
                }`}
              >
                <div 
                  className="p-4 cursor-pointer hover:bg-white/50 transition"
                  onClick={() => setExpandedMilestones(prev => ({ ...prev, [idx]: !prev[idx] }))}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isPaid ? 'bg-green-100' :
                        isSubmitted ? 'bg-yellow-100' :
                        isInProgress ? 'bg-blue-100' :
                        isRevisionRequested ? 'bg-orange-100' :
                        'bg-gray-100'
                      }`}>
                        <span className={`text-sm font-bold ${
                          isPaid ? 'text-green-600' :
                          isSubmitted ? 'text-yellow-600' :
                          isInProgress ? 'text-blue-600' :
                          isRevisionRequested ? 'text-orange-600' :
                          'text-gray-500'
                        }`}>{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-800">{milestone.description}</p>
                          {getMilestoneStatusBadge(milestone.status)}
                        </div>
                        <div className="flex gap-3 text-xs text-gray-500 mt-1">
                          <span>Amount: <span className="font-medium">₹{milestone.amount}</span></span>
                          {milestone.due_date && <span>Due: {milestone.due_date}</span>}
                        </div>
                      </div>
                      <svg 
                        className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-gray-100 mt-2">
                    {isSubmitted && milestone.submission && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-yellow-100">
                        <p className="text-sm font-medium text-gray-700 mb-2">Submitted Work:</p>
                        {milestone.submission.description && (
                          <p className="text-sm text-gray-600 mb-2">{milestone.submission.description}</p>
                        )}
                        {milestone.submission.external_link && (
                          <a href={milestone.submission.external_link} target="_blank" rel="noopener noreferrer" 
                             className="text-purple-600 text-sm underline inline-block">
                            View External Link →
                          </a>
                        )}
                        {milestone.submission.submitted_at && (
                          <p className="text-xs text-gray-400 mt-2">
                            Submitted: {new Date(milestone.submission.submitted_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {isRevisionRequested && milestone.review && (
                      <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-sm font-medium text-orange-700 mb-1">Revision Requested:</p>
                        <p className="text-sm text-orange-600">{milestone.review.comments || 'No additional comments'}</p>
                      </div>
                    )}
                    
                    {isPaid && milestone.payment && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-700">Payment Details</p>
                        <p className="text-sm text-green-600">Amount: ₹{milestone.payment.amount || milestone.amount}</p>
                        <p className="text-xs text-green-500">
                          Paid on: {new Date(milestone.payment.paid_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                    
                    {isInProgress && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">Awaiting work submission from collaborator</p>
                        <p className="text-xs text-blue-600 mt-1">This milestone is currently active</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getCollaboratorName = () => {
    if (!contract) return "Collaborator";
    return contract.collaborator?.name || contract.collaborator?.email?.split("@")[0] || "Collaborator";
  };

  const getCreatorName = () => {
    if (!contract) return "Creator";
    return contract.creator?.name || contract.creator?.email?.split("@")[0] || "Creator";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Not set";
    return new Date(dateStr).toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#F5F5F5]">
        <div className="absolute top-0 left-0 w-full z-50"><Header /></div>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#5A1FA8] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading contract details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="w-full min-h-screen bg-[#F5F5F5]">
        <div className="absolute top-0 left-0 w-full z-50"><Header /></div>
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-600">Contract not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F5F5F5]">
      <div className="absolute top-0 left-0 w-full z-50"><Header /></div>

      {/* BANNER */}
      <div className="relative w-full h-[260px] md:h-[433px] overflow-hidden">
        <img src={BannerImg} className="absolute inset-0 w-full h-full object-cover" alt="banner" />
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
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </div>
        <span className="font-medium text-base">Back</span>
      </button>
      <h2 className="text-[18px] md:text-[28px] font-semibold">My contracts</h2>
    </div>
    
    {/* Mobile & Tablet version */}
    <div className="block md:hidden w-full">
      <div className="flex justify-between items-center mt-14">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 px-2 py-1 text-white hover:text-white/80 transition-colors group"
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-[#51218F] to-[#2a0e4a] group-hover:from-[#3d1768] group-hover:to-[#1a0830] transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </div>
          <span className="font-medium text-sm">Back</span>
        </button>
        <p className="text-[9px] sm:text-[10px] md:text-[10px] font-semibold">
          Total Budget: ₹{contract?.budget || "0.00"} INR
        </p>
      </div>
      <h2 className="text-[15px] sm:text-[16px] md:text-[16px] font-semibold text-center mt-2">
        My contracts
      </h2>
    </div>
    
    {/* Desktop total budget */}
    <p className="text-[14px] md:text-[22px] mt-20 font-semibold hidden md:block">
      Total Budget: ₹{contract?.budget || "0.00"} INR
    </p>
  </div>

  {/* TABS */}
  <div className="relative">
    {/* Mobile & Tablet layout: 3 top, 2 bottom */}
    <div className="md:hidden">
      {/* Top row - first 3 tabs */}
      <div className="flex border-b border-white/20 font-semibold">
        {tabs.slice(0, 3).map((tab) => {
          const tabKey = tab.path.replace("/", "");
          const isActive = tabKey === fromTab;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`relative flex-1 pb-2 pt-1 px-0.5 whitespace-nowrap transition-colors duration-150 ${
                isActive
                  ? "text-white font-bold [text-shadow:0_1px_8px_rgba(0,0,0,0.8)]"
                  : "text-white font-normal [text-shadow:0_1px_8px_rgba(0,0,0,0.8)] opacity-80 hover:opacity-100"
              }`}
            >
              <span className="text-[8px] sm:text-[9px] md:text-[9px]">{tab.name}</span>
              <span className="text-[7px] sm:text-[8px] md:text-[8px] ml-0.5">({statusCounts[tab.key] || 0})</span>
              {isActive && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#8B5CF6] rounded-full" />}
            </button>
          );
        })}
      </div>
      
      {/* Bottom row - remaining 2 tabs */}
      <div className="flex border-b border-white/20 font-semibold">
        {tabs.slice(3, 5).map((tab) => {
          const tabKey = tab.path.replace("/", "");
          const isActive = tabKey === fromTab;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`relative flex-1 pb-2 pt-1 px-0.5 whitespace-nowrap transition-colors duration-150 ${
                isActive
                  ? "text-white font-bold [text-shadow:0_1px_8px_rgba(0,0,0,0.8)]"
                  : "text-white font-normal [text-shadow:0_1px_8px_rgba(0,0,0,0.8)] opacity-80 hover:opacity-100"
              }`}
            >
              <span className="text-[8px] sm:text-[9px] md:text-[9px]">{tab.name}</span>
              <span className="text-[7px] sm:text-[8px] md:text-[8px] ml-0.5">({statusCounts[tab.key] || 0})</span>
              {isActive && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#8B5CF6] rounded-full" />}
            </button>
          );
        })}
      </div>
    </div>

    {/* Desktop layout: centered tabs */}
    <div className="hidden md:flex justify-center">
      <div className="flex border-b border-white/20 font-semibold">
        {tabs.map((tab) => {
          const tabKey = tab.path.replace("/", "");
          const isActive = tabKey === fromTab;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`relative pb-3 pt-1 px-3 lg:px-4 whitespace-nowrap transition-colors duration-150 text-[12px] md:text-[14px] lg:text-[17px] ${
                isActive
                  ? "text-white font-bold [text-shadow:0_1px_8px_rgba(0,0,0,0.8)]"
                  : "text-white font-normal [text-shadow:0_1px_8px_rgba(0,0,0,0.8)] opacity-80 hover:opacity-100"
              }`}
            >
              {tab.name} ({statusCounts[tab.key] || 0})
              {isActive && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#8B5CF6] rounded-full" />}
            </button>
          );
        })}
      </div>
    </div>
  </div>
</div>
      </div>

      {/* MAIN CARD */}
    <div className="relative -mt-[40px] md:-mt-[90px] max-w-[1200px] mx-auto px-3 sm:px-4 pb-10">
  <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
    <div className="p-4 sm:p-6 md:p-8">
      {job && contract && (
        <div className="mb-6 md:mb-8 space-y-3 md:space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 md:gap-3">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">{job.title || "Untitled Project"}</h3>
            <span className="px-2.5 py-1 md:px-4 md:py-1.5 rounded-full bg-[#5A1FA8] text-white text-[10px] sm:text-xs md:text-sm font-medium shadow-sm">
              {job.budget_type === "hourly" ? "Hourly rate" : "Fixed rate"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 bg-gray-50 p-3 sm:p-4 rounded-xl">
            <div>
              <p className="text-gray-500 text-[11px] sm:text-sm">Collaborator</p>
              <p className="font-semibold text-gray-800 text-sm sm:text-base">{getCollaboratorName()}</p>
            </div>
            <div>
              <p className="text-gray-500 text-[11px] sm:text-sm">Creator</p>
              <p className="font-semibold text-gray-800 text-sm sm:text-base">{getCreatorName()}</p>
            </div>
            <div>
              <p className="text-gray-500 text-[11px] sm:text-sm">Contract amount</p>
              <p className="text-xl sm:text-2xl font-bold text-[#5A1FA8]">₹{contract.budget}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
              <div>
                <p className="text-gray-500 text-[11px] sm:text-sm">Start date</p>
                <p className="font-medium text-gray-800 text-sm sm:text-base">{formatDate(contract.start_date)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-[11px] sm:text-sm">End date</p>
                <p className="font-medium text-gray-800 text-sm sm:text-base">{formatDate(contract.end_date)}</p>
              </div>
            </div>
          </div>

          {job.description && (
            <div>
              <p className="text-gray-500 text-[11px] sm:text-sm mb-1">Project description</p>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{job.description}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-3 md:gap-4 text-[11px] sm:text-sm">
            <p>
              <span className="text-gray-500">Status:</span>{" "}
              <span className="capitalize font-medium text-[#5A1FA8]">{contract.status}</span>
            </p>
            <p>
              <span className="text-gray-500">Work submitted:</span>{" "}
              {contract.has_attachment ? "Yes" : "No"}
              {contract.work_submitted_at && ` on ${new Date(contract.work_submitted_at).toLocaleDateString()}`}
            </p>
          </div>

          {/* Milestone Timeline - Main Feature */}
          {renderMilestoneTimeline()}

          {/* Pending status reason banner */}
          {contract.status === "pending" && contract.status_reason && (
            <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-amber-50 border border-amber-300 rounded-xl">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="14" height="14" sm:width="18" sm:height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" />
                  <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-semibold text-amber-800 mb-0.5 sm:mb-1">Reason for Pending Status</p>
                <p className="text-xs sm:text-sm text-amber-700 leading-relaxed whitespace-pre-wrap">
                  {contract.status_reason}
                </p>
              </div>
            </div>
          )}

          {/* Cancelled status reason banner */}
          {contract.status === "cancelled" && contract.status_reason && (
            <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-red-50 border border-red-300 rounded-xl">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="14" height="14" sm:width="18" sm:height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" strokeLinecap="round" />
                  <line x1="9" y1="9" x2="15" y2="15" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-semibold text-red-800 mb-0.5 sm:mb-1">Reason for Cancellation</p>
                <p className="text-xs sm:text-sm text-red-700 leading-relaxed whitespace-pre-wrap">
                  {contract.status_reason}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="border-t border-gray-200 my-4 md:my-6" />

      <div className="mb-4 md:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-[#5A1FA8] mb-2 md:mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Contract Details
        </h3>
        <div className="bg-gray-50 p-3 sm:p-5 rounded-xl space-y-1.5 sm:space-y-2 text-[11px] sm:text-sm">
          <p><span className="font-semibold text-gray-700">Contract ID:</span> <span className="text-gray-600">{contract.id}</span></p>
          {contract.description && (
            <p><span className="font-semibold text-gray-700">Contract Description:</span> <span className="text-gray-600">{contract.description}</span></p>
          )}
          <p><span className="font-semibold text-gray-700">Created:</span> <span className="text-gray-600">{contract.job_created_at ? new Date(contract.job_created_at).toLocaleDateString() : "N/A"}</span></p>
          <p><span className="font-semibold text-gray-700">Expertise Level:</span> <span className="text-gray-600 capitalize">{contract.job_expertise_level || "Not specified"}</span></p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => {
            const receiverId = contract.viewer_role === "creator" ? contract.collaborator?.id : contract.creator?.id;
            navigate(`/message?user=${receiverId}`, { state: { contractId, jobTitle: job?.title } });
          }}
          className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-[#5A1FA8] to-[#8B5CF6] text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Message {contract.viewer_role === "creator" ? "Collaborator" : "Creator"}
        </button>
      </div>
    </div>
  </div>
</div>

      <Footer />
    </div>
  );
}