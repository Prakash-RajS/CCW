import React, { useState, useEffect } from "react";
import BannerImg from "../../assets/myproject/banner.png";
import Footer from "../../component/Footer";
import Header from "../../component/Header";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../utils/axiosConfig";
import { useUser } from "../../contexts/UserContext";

export default function AwatingContracts() {
  const [filter, setFilter] = useState("All");
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalBudget, setTotalBudget] = useState("0.00");
  const [activeContracts, setActiveContracts] = useState([]); // Changed from awaitingContracts
  const [latestJob, setLatestJob] = useState(null);
  const [statusCounts, setStatusCounts] = useState({
    accepted: 0,
    active: 0,
    in_progress: 0,
    pending: 0,
    completed: 0
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useUser();
  
  const tabs = [
    { name: "Active contracts", path: "/activecontracts", key: "accepted" },
    { name: "Pending contracts", path: "/pendingcontracts", key: "pending" },
    { name: "Completed contracts", path: "/completedcontracts", key: "completed" }
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
        params: {
          status: "accepted",
          user_id: userData.id
        }
      });

      if (response.data && response.data.length > 0) {
        const contractsData = response.data;
        setContracts(contractsData);
        
        // Filter active contracts (status = "active") - CHANGED
        const active = contractsData.filter(contract => contract.status === "active");
        setActiveContracts(active);
        
        // Calculate total budget from all returned contracts
        const total = contractsData.reduce((sum, contract) => {
          return sum + contract.budget;
        }, 0);
        setTotalBudget(total.toFixed(2));
      } else {
        setContracts([]);
        setActiveContracts([]);
      }
    } catch (error) {
      console.error("Error fetching contracts:", error);
      setContracts([]);
      setActiveContracts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestJob = async () => {
    try {
      const response = await api.get("/contracts/latest-job", {
        params: {
          user_id: userData.id
        }
      });
      setLatestJob(response.data);
    } catch (error) {
      console.error("Error fetching latest job:", error);
      setLatestJob(null);
    }
  };

  const fetchStatusCounts = async () => {
    try {
      const response = await api.get("/contracts/status-counts", {
        params: {
          user_id: userData.id
        }
      });
      setStatusCounts(response.data);
    } catch (error) {
      console.error("Error fetching status counts:", error);
    }
  };

  const getClientName = (contract) => {
    if (contract.viewer_role === "creator") {
      return contract.collaborator?.name || contract.collaborator?.email?.split('@')[0] || "Client";
    } else {
      return contract.creator?.name || contract.creator?.email?.split('@')[0] || "Client";
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F5F5]">
      {/* HEADER */}
      <div className="absolute top-0 left-0 w-full z-50">
        <Header />
      </div>

      {/* BANNER */}
      <div className="relative w-full h-[260px] md:h-[433px] overflow-hidden">
        <img src={BannerImg} className="absolute inset-0 w-full h-full object-cover" alt="Banner" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2B003A]/85 via-[#4B0066]/75 to-[#2B003A]/85" />

        <div className="relative z-10 text-white max-w-[1221px] mx-auto px-4 md:px-0 pt-6 md:pt-[131px]">
          <div className="flex justify-between items-start md:items-center mb-1 md:mb-1">
            <div>
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-[12px] md:text-[14px] opacity-80 mt-14 md:mb-4 hover:opacity-100 transition"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M20 12H4M4 12L10 6M4 12L10 18" stroke="white" strokeWidth="3" />
                </svg>
                Back
              </button>       
              <h2 className="text-[18px] md:text-[28px] font-semibold">My contracts</h2>
            </div>
            <p className="text-[14px] md:text-[22px] mt-20 font-semibold">Total Budget: ${totalBudget} USD</p>
          </div>

          {/* TOP TABS */}
          <div className="flex gap-6 md:gap-[120px] border-b border-white/10 text-[14px] md:text-[20px] font-semibold">
            {tabs.map(tab => (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="relative pb-3"
              >
                {tab.path === "/activecontracts" 
                  ? `Active contracts (${statusCounts.accepted || contracts.length})`
                  : `${tab.name.split('(')[0].trim()} (${statusCounts[tab.key] || 0})`
                }
                {location.pathname === tab.path && (
                  <span className="absolute left-0 -bottom-[3px] w-full h-[3px] bg-[#8B5CF6] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT CARD */}
      <div className="relative -mt-[60px] md:-mt-[90px] max-w-[1200px] mx-auto bg-white rounded-[18px] shadow-2xl p-6 md:p-8">
        {/* FILTER */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-8">
          <span className="text-[16px] font-medium">Select contract</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-[44px] w-full md:w-[220px] px-4 rounded-[12px] border"
          >
            <option>All</option>
            <option>Active</option>
            <option>Completed</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-600">Loading contracts...</p>
          </div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600">No contracts found</p>
          </div>
        ) : (
          <>
            {/* LATEST JOB SECTION */}
            {latestJob && (
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h3 className="text-[18px] font-semibold">{latestJob.job.title}</h3>
                  <span className="px-4 py-1 rounded-full bg-[#5A1FA8] text-white text-[13px]">
                    {latestJob.job.budget_type === "hourly" ? "Hourly rate" : "Fixed rate"}
                  </span>
                  <span className="px-4 py-1 rounded-full bg-[#10B981] text-white text-[13px]">
                    Latest
                  </span>
                </div>

                <p className="text-[15px] mb-1"><b>Project description:</b> {latestJob.job.description || "No description provided"}</p>
                <p className="text-[15px]">
                  <b>Budget:</b> 
                  {latestJob.contract 
                    ? ` $${latestJob.contract.budget} | ` 
                    : latestJob.job.budget_from && latestJob.job.budget_to
                      ? ` $${latestJob.job.budget_from} - $${latestJob.job.budget_to} | `
                      : latestJob.job.budget_from
                      ? ` $${latestJob.job.budget_from}+ | `
                      : latestJob.job.budget_to
                      ? ` Up to $${latestJob.job.budget_to} | `
                      : ` No budget set | `}
                  {latestJob.job.contracts_count} contract{latestJob.job.contracts_count !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            <div className="w-full h-[1px] bg-gray-300 mb-6" />

            {/* INNER TABS */}
            <div className="flex gap-10 text-[16px] md:text-[20px] font-semibold mb-6 border-b border-gray-300">
              <button
                onClick={() => navigate("/activecontracts")}
                className="relative pb-4"
              >
                Active contracts ({statusCounts.in_progress || contracts.filter(c => c.status === "in_progress").length}) {/* CHANGED */}
              </button>
              <button
                onClick={() => navigate("/awaitingcontracts")}
                className="relative pb-4"
              >
                Awaiting contracts ({statusCounts.active || activeContracts.length}) {/* CHANGED */}
                <span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#8B5CF6] rounded-full" />
              </button>
            </div>

            <div className="w-full h-[1px] bg-gray-300 mb-6" />

            {/* ACTIVE CONTRACTS GRID - CHANGED */}
            {activeContracts.length === 0 ? (
              <div className="w-full md:w-[493px] h-[138px] flex items-center justify-center rounded-[10px] border border-[#D0D0D0] text-[16px] font-medium text-black/30">
                Contracts (00)
              </div>
            ) : (
              <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
                {activeContracts.map((contract, i) => (
                  <div key={contract.id} className="relative pr-8">
                    <h4 className="text-[18px] font-semibold mb-2">{getClientName(contract)}</h4>
                    <p>Contract amount: <b>${contract.budget}</b></p>
                    <p className="italic text-gray-500 mt-2">
                      {contract.has_attachment 
                        ? "Work submitted - Awaiting review" 
                        : "Awaiting work submission"}
                    </p>

                    <div className="flex gap-4 mt-6">
                      <button
                        onClick={() => navigate("/editwork")}
                        className="w-[160px] py-3 rounded-full bg-[#5A1FA8] text-white font-semibold hover:opacity-90 transition"
                      >
                        {contract.has_attachment ? "Review" : "Submit"}
                      </button>

                      <button
                        onClick={() => navigate("/myprojectmessage")}
                        className="w-[140px] py-3 rounded-full bg-[#5A1FA8] text-white font-semibold hover:opacity-90 transition"
                      >
                        Message
                      </button>
                    </div>

                    {/* VERTICAL LINE (desktop only, except last column) */}
                    {i < 2 && activeContracts.length > 1 && (
                      <div
                        className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2
                                   h-[138px] w-[1px] bg-gray-300"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* FOOTER */}
      <div className="mt-10">
        <Footer />
      </div>
    </div>
  );
}