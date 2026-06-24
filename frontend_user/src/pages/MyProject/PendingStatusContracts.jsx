//frontend_user/src/pages/MyProject/PendingStatusContracts.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BannerImg from "../../assets/myproject/banner.png";
import Footer from "../../component/Footer";
import Header from "../../component/Header";
import api from "../../utils/axiosConfig";
import { useUser } from "../../contexts/UserContext";

export default function PendingStatusContracts() {
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [totalBudget, setTotalBudget] = useState("0.00");
  const [latestJob, setLatestJob] = useState(null);
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
      fetchLatestJob();
      fetchStatusCounts();
    }
  }, [userData]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/contracts/by-status", {
        params: { status: "pending", user_id: userData.id },
      });
      if (response.data && response.data.length > 0) {
        const contractsData = response.data;
        setContracts(contractsData);
        const total = contractsData.reduce((sum, c) => sum + (c.budget || 0), 0);
        setTotalBudget(total.toFixed(2));
      } else {
        setContracts([]);
        setTotalBudget("0.00");
      }
    } catch (error) {
      console.error("Error fetching pending contracts:", error);
      setContracts([]);
      setTotalBudget("0.00");
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestJob = async () => {
    try {
      const response = await api.get("/contracts/latest-job", {
        params: { user_id: userData.id },
      });
      setLatestJob(response.data);
    } catch (error) {
      setLatestJob(null);
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

  const getCollaboratorName = (contract) => {
    if (contract.collaborator?.name) return contract.collaborator.name;
    if (contract.collaborator?.email) return contract.collaborator.email.split("@")[0];
    return "Collaborator";
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F5F5]">
      <div className="absolute top-0 left-0 w-full z-50">
        <Header />
      </div>

      {/* BANNER — shared style */}
      <div className="relative w-full h-[260px] md:h-[433px] overflow-hidden">
        <img src={BannerImg} className="absolute inset-0 w-full h-full object-cover" alt="Banner" />
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
        <p className="text-[10px] sm:text-[11px] md:text-[12px] font-semibold px-1">
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
    <div className="flex justify-center text-[9px] sm:text-[10px] md:text-[13px] lg:text-[15px] xl:text-[17px] md:justify-center md:gap-1 lg:gap-2">
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
            {tab.name} ({tab.key === 'in_review' ? (statusCounts.in_review || 0) + (statusCounts.cancelled || 0) : statusCounts[tab.key] || 0})
            {isActive && (
              <span className="absolute bottom-0 left-1 right-1 lg:left-2 lg:right-2 h-[2px] md:h-[3px] bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] rounded-full" />
            )}
          </button>
        );
      })}
    </div>
    
    {/* Bottom row - remaining 2 tabs on mobile & tablet */}
    <div className="flex justify-center text-[9px] sm:text-[10px] md:text-[13px] lg:text-[15px] xl:text-[17px] border-t border-white/20 md:border-t-0 md:gap-1 lg:gap-2">
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
            {tab.name} ({tab.key === 'in_review' ? (statusCounts.in_review || 0) + (statusCounts.cancelled || 0) : statusCounts[tab.key] || 0})
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

      {/* CONTENT CARD */}
    <div className="relative -mt-[30px] md:-mt-[90px] max-w-[1200px] mx-auto bg-white rounded-[18px] shadow-2xl p-4 md:p-8">
  {loading ? (
    <div className="text-center py-6 md:py-10">
      <div className="inline-block animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-t-2 border-b-2 border-[#5A1FA8] mb-2 md:mb-3" />
      <p className="text-sm md:text-base text-gray-600">Loading contracts...</p>
    </div>
  ) : contracts.length === 0 ? (
    <div className="text-center py-6 md:py-10">
      <p className="text-sm md:text-base text-gray-600">No pending contracts found</p>
    </div>
  ) : (
    <>
      {latestJob && (
        <div className="mb-4 md:mb-6">
          <h3 className="text-base md:text-[20px] font-semibold text-[#1F1F1F] mb-2 md:mb-4">Your latest posted job</h3>
          <div className="bg-[#F8F5FF] p-3 md:p-5 rounded-xl border border-[#E5D5FF]">
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2 md:mb-3">
              <h4 className="text-sm md:text-[18px] font-semibold text-[#2D2D2D]">{latestJob.job.title}</h4>
              <span className="px-2 md:px-4 py-0.5 md:py-1 rounded-full bg-[#5A1FA8] text-white text-[10px] md:text-[13px]">
                {latestJob.job.budget_type === "hourly" ? "Hourly" : "Fixed"}
              </span>
            </div>
            <p className="text-xs md:text-[15px] mb-1 md:mb-2 text-[#4A4A4A]">
              <span className="font-semibold">Budget:</span>
              {latestJob.contract
                ? ` ₹${latestJob.contract.budget}`
                : latestJob.job.budget_from && latestJob.job.budget_to
                  ? ` ₹${latestJob.job.budget_from} - ₹${latestJob.job.budget_to}`
                  : latestJob.job.budget_from
                    ? ` ₹${latestJob.job.budget_from}+`
                    : latestJob.job.budget_to
                      ? ` Up to ₹${latestJob.job.budget_to}`
                      : ` No budget`}
              {latestJob.job.contracts_count > 0 && (
                <span className="ml-1"> • {latestJob.job.contracts_count} contract{latestJob.job.contracts_count !== 1 && "s"}</span>
              )}
            </p>
          </div>
        </div>
      )}

      <div className="w-full h-[1px] bg-gray-300 mb-4 md:mb-6" />

      <div className="grid grid-cols-1 gap-6 md:gap-8 md:grid-cols-3">
        {contracts.map((contract, i) => (
          <div key={contract.id} className="relative pb-6 md:pb-0 border-b border-gray-200 md:border-b-0 last:border-b-0 group hover:bg-gray-50 transition-all duration-200 rounded-lg p-4 -m-4">
            <h4 className="text-sm md:text-[18px] font-semibold mb-1 md:mb-2">{getCollaboratorName(contract)}</h4>
            <p className="text-xs md:text-[15px] text-gray-700 mb-1">
              <span className="font-semibold">Job:</span> {contract.job_title || "Not specified"}
            </p>
            <p className="text-xs md:text-sm">
              Amount: <b>₹{contract.budget}</b>
            </p>
            <p className="text-[10px] md:text-sm italic text-gray-500 mt-1 md:mt-2">Pending acceptance</p>

            <div className="flex gap-3 md:gap-4 mt-3 md:mt-6">
              <button
                onClick={() => navigate("/editwork", {
                  state: { contractId: contract.id, fromTab: "pendingstatuscontracts" },
                })}
                className="flex-1 md:w-[160px] py-2 md:py-3 rounded-full bg-[#5A1FA8] text-white text-sm md:text-base font-semibold hover:opacity-90 transition"
              >
                Review
              </button>
              <button
                onClick={() => {
                  const receiverId = contract.viewer_role === "creator"
                    ? contract.collaborator?.id
                    : contract.creator?.id;
                  navigate(`/message?user=${receiverId}`, {
                    state: { contractId: contract.id, jobTitle: contract.job_title },
                  });
                }}
                className="flex-1 md:w-[140px] py-2 md:py-3 rounded-full bg-[#5A1FA8] text-white text-sm md:text-base font-semibold hover:opacity-90 transition"
              >
                Message
              </button>
            </div>

            {i % 3 !== 2 && i < contracts.length - 1 && (
              <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 h-[138px] w-[1px] bg-gray-300" />
            )}
          </div>
        ))}
      </div>
    </>
  )}
</div>

      <div className="mt-10">
        <Footer />
      </div>
    </div>
  );
}