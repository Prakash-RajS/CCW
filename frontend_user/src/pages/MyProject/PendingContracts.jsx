// frontend_user/src/pages/MyProject/PendingContracts.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BannerImg from "../../assets/myproject/banner.png";
import Footer from "../../component/Footer";
import Header from "../../component/Header";
import api from "../../utils/axiosConfig";
import { useUser } from "../../contexts/UserContext";

export default function PendingContracts() {
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [totalBudget, setTotalBudget] = useState("0.00");
  const [statusCounts, setStatusCounts] = useState({
    accepted: 0, awaiting: 0, in_progress: 0,
    pending: 0, completed: 0, in_review: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useUser();

  const tabs = [
    { name: "Active contracts",    path: "/activecontracts",        key: "in_progress" },
    { name: "Awaiting contracts",  path: "/awaitingcontracts",      key: "awaiting"    },
    { name: "In Review",           path: "/pendingcontracts",       key: "in_review"   },
    { name: "Pending contracts",   path: "/pendingstatuscontracts", key: "pending"     },
    { name: "Completed contracts", path: "/completedcontracts",     key: "completed"   },
  ];

  useEffect(() => {
    if (userData?.id) {
      fetchContracts();
      fetchStatusCounts();
    }
  }, [userData]);

  useEffect(() => { setCurrentPage(1); }, [contracts.length]);

  // Refresh contracts when page comes into focus
  useEffect(() => {
    const handleFocus = () => {
      if (userData?.id) {
        fetchContracts();
        fetchStatusCounts();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [userData?.id]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/contracts/by-status", {
        params: { status: "in_review", user_id: userData.id },
      });
      if (response.data?.length > 0) {
        setContracts(response.data);
        setTotalBudget(
          response.data.reduce((s, c) => s + (c.budget || 0), 0).toFixed(2)
        );
      } else {
        setContracts([]);
        setTotalBudget("0.00");
      }
    } catch (error) {
      console.error("Error fetching contracts:", error);
      setContracts([]);
      setTotalBudget("0.00");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusCounts = async () => {
    try {
      const response = await api.get("/contracts/status-counts", {
        params: { user_id: userData.id },
      });
      setStatusCounts(response.data);
    } catch (error) {
      console.error("Error fetching status counts:", error);
    }
  };

  const isCancelled = (c) => c.status?.toLowerCase() === "cancelled";

  // ✅ FIXED: Render milestone under review - only shows milestone info if milestones exist
  const renderReviewMilestone = (contract) => {
    // ✅ If contract has milestones_data with length > 0, show milestone info
    if (contract.milestones_data && contract.milestones_data.length > 0) {
      const milestones = contract.milestones_data;
      const submittedMilestone = milestones.find(m => m.status === 'submitted');
      
      if (submittedMilestone) {
        const milestoneIndex = milestones.findIndex(m => m.status === 'submitted');
        const completedCount = milestones.filter(m => m.status === 'paid').length;
        
        return (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              <p className="text-xs font-medium text-yellow-600">
                Milestone {milestoneIndex + 1} Under Review ({completedCount}/{milestones.length} Completed)
              </p>
            </div>
            <p className="text-sm font-semibold text-gray-800 mt-1">{submittedMilestone.description}</p>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">Amount: ₹{submittedMilestone.amount}</p>
              {submittedMilestone.submission?.submitted_at && (
                <p className="text-xs text-gray-400">
                  Submitted: {new Date(submittedMilestone.submission.submitted_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        );
      }
      
      // If no submitted milestone but has in_progress
      const inProgressMilestone = milestones.find(m => m.status === 'in_progress');
      if (inProgressMilestone) {
        return (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <p className="text-xs font-medium text-blue-600">Milestone In Progress</p>
            </div>
            <p className="text-sm font-medium mt-1">{inProgressMilestone.description}</p>
            <p className="text-xs text-gray-500">Amount: ₹{inProgressMilestone.amount}</p>
          </div>
        );
      }
      
      return null;
    }
    
    // ✅ Fallback for contracts without milestones (regular project-based contracts)
    if (contract.work_submitted_at) {
      return (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <p className="text-xs font-medium text-yellow-600">Work Submitted for Review</p>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Submitted on: {new Date(contract.work_submitted_at).toLocaleDateString()}
          </p>
        </div>
      );
    }
    
    return null;
  };

  const totalPages = Math.ceil(contracts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedContracts = contracts.slice(startIndex, startIndex + itemsPerPage);

  const getBudgetDisplay = (c) => c.budget ? `₹${c.budget}` : "No budget set";
  const getExpertiseLevel = (c) => {
    const map = { fresher: "Entry Level", medium: "Intermediate", experienced: "Expert" };
    return map[c.job_expertise_level?.toLowerCase()] || "Intermediate";
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex justify-center items-center gap-2 py-6 pt-8 border-t border-gray-200 mt-4">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-lg text-sm font-medium ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white border border-gray-300 text-gray-700 hover:border-[#5A1FA8]"
          }`}
        >
          Previous
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              currentPage === i + 1
                ? "bg-[#5A1FA8] text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:border-[#5A1FA8]"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-lg text-sm font-medium ${
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white border border-gray-300 text-gray-700 hover:border-[#5A1FA8]"
          }`}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F5F5]">
      <div className="absolute top-0 left-0 w-full z-50"><Header /></div>

      <div className="relative w-full h-[260px] md:h-[433px] overflow-hidden">
        <img src={BannerImg} className="absolute inset-0 w-full h-full object-cover" alt="Banner" />
        <div className="absolute inset-0 bg-black opacity-35" />

      <div className="relative z-10 text-white max-w-[1221px] mx-auto px-2 sm:px-3 md:px-0 pt-6 md:pt-[131px]">
 <div className="flex justify-between items-start md:items-center mb-1 px-2 sm:px-3 md:px-4">
  {/* Desktop version */}
  <div className="hidden md:block">
    <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 text-white hover:text-white/80 transition-colors group mt-14 md:mb-4">
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
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 px-2 py-1 text-white hover:text-white/80 transition-colors group">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-[#51218F] to-[#2a0e4a] group-hover:from-[#3d1768] group-hover:to-[#1a0830] transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </div>
        <span className="font-medium text-sm">Back</span>
      </button>
      <p className="text-[10px] sm:text-[11px] md:text-[12px] font-semibold px-1">Total Budget: ₹{totalBudget} INR</p>
    </div>
    <h2 className="text-[16px] sm:text-[17px] md:text-[18px] font-semibold text-center mt-2">My contracts</h2>
  </div>
  
  {/* Desktop total budget */}
  <p className="text-[14px] md:text-[22px] mt-20 font-semibold hidden md:block">
    Total Budget: ₹{totalBudget} INR
  </p>
</div>

  <div className="flex flex-col md:flex-row md:justify-center border-b border-white/20 font-semibold">
    {/* Top row - first 3 tabs on mobile & tablet */}
    <div className="flex justify-center text-[9px] sm:text-[10px] md:text-[13px] lg:text-[15px] xl:text-[17px] md:justify-center md:gap-1 lg:gap-2">
      {tabs.slice(0, 3).map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <button key={tab.path} onClick={() => navigate(tab.path)}
            className={`relative pb-2 pt-1 px-1 sm:px-1.5 md:px-2 lg:px-3 xl:px-4 whitespace-nowrap transition-colors duration-150 flex-1 md:flex-none ${
              isActive
                ? "text-white font-bold [text-shadow:0_1px_8px_rgba(0,0,0,0.8)]"
                : "text-white font-normal [text-shadow:0_1px_8px_rgba(0,0,0,0.8)] opacity-80 hover:opacity-100"
            }`}
          >
            {tab.name} ({statusCounts[tab.key] || 0})
            {isActive && <span className="absolute bottom-0 left-1 right-1 lg:left-2 lg:right-2 h-[2px] md:h-[3px] bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] rounded-full" />}
          </button>
        );
      })}
    </div>
    
    {/* Bottom row - remaining 2 tabs on mobile & tablet */}
    <div className="flex justify-center text-[9px] sm:text-[10px] md:text-[13px] lg:text-[15px] xl:text-[17px] border-t border-white/20 md:border-t-0 md:gap-1 lg:gap-2">
      {tabs.slice(3).map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <button key={tab.path} onClick={() => navigate(tab.path)}
            className={`relative pb-2 pt-1 px-1 sm:px-1.5 md:px-2 lg:px-3 xl:px-4 whitespace-nowrap transition-colors duration-150 flex-1 md:flex-none ${
              isActive
                ? "text-white font-bold [text-shadow:0_1px_8px_rgba(0,0,0,0.8)]"
                : "text-white font-normal [text-shadow:0_1px_8px_rgba(0,0,0,0.8)] opacity-80 hover:opacity-100"
            }`}
          >
            {tab.name} ({statusCounts[tab.key] || 0})
            {isActive && <span className="absolute bottom-0 left-1 right-1 lg:left-2 lg:right-2 h-[2px] md:h-[3px] bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] rounded-full" />}
          </button>
        );
      })}
    </div>
  </div>
</div>
 </div>


     <div id="contracts-content" className="relative -mt-[40px] mb-10 md:-mt-[90px] max-w-[1200px] mx-auto bg-white rounded-[18px] shadow-xl p-4 sm:p-6">
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5A1FA8]" />
            <p className="text-gray-600 mt-3">Loading contracts...</p>
          </div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600">No contracts in review</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedContracts.map((contract) => {
                const cancelled = isCancelled(contract);
                const hasMilestones = contract.milestones_data && contract.milestones_data.length > 0;
                
                return (
                  <div
                    key={contract.id}
                    onClick={() => navigate(`/pending/${contract.id}`)}
                    className={`border rounded-[14px] p-4 sm:p-6 flex flex-col sm:flex-row justify-between gap-4 shadow-md transition-all duration-200 cursor-pointer ${
                      cancelled
                        ? "border-gray-300 bg-white hover:shadow-xl hover:border-red-300"
                        : "border-gray-300 bg-white hover:shadow-xl hover:border-[#5A1FA8]"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-[18px] sm:text-[20px] font-semibold">
                          {contract.job_title || "Untitled Project"}
                        </h3>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3 text-[13px] sm:text-[14px] text-gray-600">
                        <span>{contract.job_budget_type === "hourly" ? "Hourly" : "Fixed-price"}</span>
                        <span className="text-gray-400">·</span>
                        <span>{getExpertiseLevel(contract)}</span>
                        <span className="text-gray-400">·</span>
                        <span>Budget: {getBudgetDisplay(contract)}</span>
                      </div>

                      {/* Collaborator info */}
                      {contract.collaborator && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>
                            {cancelled ? "Cancelled by: " : "Collaborator: "}
                            <span className="font-medium">
                              {contract.collaborator.name || contract.collaborator.email}
                            </span>
                          </span>
                        </div>
                      )}

                      {/* Milestone Review Display */}
                      {renderReviewMilestone(contract)}
                    </div>

                    {/* Right side badge/status */}
                    <div className="flex flex-col items-end justify-between gap-3 shrink-0">
                      {cancelled ? (
                        <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium border border-red-200">
                          Cancelled by collaborator
                        </span>
                      ) : (
                        <div className="flex flex-col items-end gap-2">
                          <span className="px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">
                            In Review
                          </span>
                          {hasMilestones && contract.milestones_data?.some(m => m.status === 'submitted') && (
                            <span className="text-xs text-purple-600">
                              Milestone pending approval
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-4 border-t border-gray-200">
              {contracts.length > 0 && (
                <div className="text-sm text-gray-500 text-center mb-4">
                  Showing {startIndex + 1} – {Math.min(startIndex + itemsPerPage, contracts.length)} of {contracts.length} contracts
                </div>
              )}
              {renderPagination()}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}