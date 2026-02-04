import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BannerImg from "../../assets/myproject/banner.png";
import Footer from "../../component/Footer";
import Header from "../../component/Header";
import DownloadSuccessImg from "../../assets/myproject/downloadsuccess.png";
import api from "../../utils/axiosConfig";
import { useUser } from "../../contexts/UserContext";

export default function CompletedContracts() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [totalBudget, setTotalBudget] = useState("0.00");
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
      fetchStatusCounts();
    }
  }, [userData]);

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


  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/contracts/by-status", {
        params: {
          status: "completed",
          user_id: userData.id
        }
      });

      if (response.data && response.data.length > 0) {
        const contractsData = response.data;
        setContracts(contractsData);
        
        // Calculate total budget from all completed contracts
        const total = contractsData.reduce((sum, contract) => {
          return sum + contract.budget;
        }, 0);
        setTotalBudget(total.toFixed(2));
      } else {
        setContracts([]);
      }
    } catch (error) {
      console.error("Error fetching contracts:", error);
      setContracts([]);
    } finally {
      setLoading(false);
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

  const formatJobTitle = (jobTitle) => {
    return jobTitle || "Untitled Project";
  };

  const formatJobDescription = (description) => {
    if (!description) return "No description provided";
    
    // Truncate description to first 150 characters
    if (description.length > 150) {
      return description.substring(0, 150) + "...";
    }
    return description;
  };

  const formatPostedTime = (createdAt) => {
    if (!createdAt) return "Posted recently";
    
    const postedDate = new Date(createdAt);
    const now = new Date();
    const diffInHours = Math.floor((now - postedDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Posted just now";
    if (diffInHours === 1) return "Posted 1 hour ago";
    if (diffInHours < 24) return `Posted ${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Posted 1 day ago";
    return `Posted ${diffInDays} days ago`;
  };

  const getBudgetDisplay = (contract) => {
    if (contract.job_budget_from && contract.job_budget_to) {
      return `$${contract.job_budget_from} - $${contract.job_budget_to}`;
    } else if (contract.job_budget_from) {
      return `$${contract.job_budget_from}+`;
    } else if (contract.job_budget_to) {
      return `Up to $${contract.job_budget_to}`;
    } else {
      return "No budget set";
    }
  };

  const getExpertiseLevel = (contract) => {
    if (!contract.job_expertise_level) return "Intermediate";
    
    // Map expertise levels to display values
    const expertiseMap = {
      "fresher": "Entry Level",
      "medium": "Intermediate",
      "experienced": "Expert",
      "beginner": "Beginner"
    };
    
    const level = contract.job_expertise_level.toLowerCase();
    return expertiseMap[level] || 
           level.charAt(0).toUpperCase() + level.slice(1);
  };

  const formatCountryName = (country) => {
    if (!country) return "USA";
    
    const countryMap = {
      "usa": "USA",
      "united states": "USA",
      "us": "USA",
      "australia": "Australia",
      "uk": "UK",
      "united kingdom": "UK",
      "canada": "Canada",
      "india": "India",
      "germany": "Germany",
      "france": "France",
      "japan": "Japan",
      "china": "China",
      "brazil": "Brazil",
      "mexico": "Mexico",
      "spain": "Spain",
      "italy": "Italy",
      "russia": "Russia",
      "south korea": "South Korea",
    };
    
    const normalized = country.toLowerCase().trim();
    return countryMap[normalized] || 
           country.split(' ')
             .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
             .join(' ');
  };

  const getDisplayLocation = (contract) => {
    // Always show creator's location (job poster)
    const creator = contract.creator;
    
    let city = creator.city || "";
    let state = creator.state || "";
    let country = creator.location ? formatCountryName(creator.location) : "USA";
    
    // Build location string
    const locationParts = [];
    if (city) locationParts.push(city);
    if (state && state !== city) locationParts.push(state);
    
    let locationString = "";
    if (locationParts.length > 0) {
      locationString = `${locationParts.join(", ")}`;
    }
    
    return {
      country: country,
      location: locationString || country,
      fullLocation: locationString ? `${locationString}, ${country}` : country,
      city: city,
      state: state,
      rawLocation: creator.location
    };
  };

  const getRateType = (budgetType) => {
    return budgetType === "hourly" ? "Hourly Rate" : "Fixed Rate";
  };

  const downloadFile = async (contractId, hasAttachment) => {
  if (!hasAttachment) {
    alert("No file available for download");
    return;
  }

  try {
    const response = await api.get(
      `/contracts/${contractId}/work-attachment`,
      {
        params: { user_id: userData.id },
        responseType: "blob",
      }
    );

    const blob = new Blob(
      [response.data],
      { type: response.headers["content-type"] }
    );

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    // 👇 filename from backend
    let filename = `contract-${contractId}-work`;
    const contentDisposition = response.headers["content-disposition"];

    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setShowSuccess(true);
    }, 100);

  } catch (error) {
    console.error("Download failed:", error);
    alert("Failed to download file");
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
                {tab.name} ({statusCounts[tab.key] || 0})
                {location.pathname === tab.path && (
                  <span className="absolute left-0 -bottom-[3px] w-full h-[3px] bg-[#8B5CF6] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="relative -mt-[60px] md:-mt-[90px] max-w-[1200px] mx-auto bg-white rounded-[18px] shadow-xl p-6 space-y-6">
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-600">Loading completed contracts...</p>
          </div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600">No completed contracts found</p>
          </div>
        ) : (
          contracts.map(contract => {
            const locationInfo = getDisplayLocation(contract);
            
            return (
              <div key={contract.id} className="relative !border border-gray-200 rounded-[14px] p-6 flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  {/* DYNAMIC JOB TITLE */}
                  <h3 className="text-[20px] font-semibold mb-2">
                    {formatJobTitle(contract.job_title)}
                  </h3>

                  {/* DYNAMIC SUBTITLE: Hourly · Intermediate · Est. Budget: $500 - $700 · Posted 3 days ago */}
                  <p className="text-gray-600 text-[14px] mb-3">
                    {contract.job_budget_type === "hourly" ? "Hourly" : "Fixed-price"} · 
                    {getExpertiseLevel(contract)} · 
                    Est. Budget: {getBudgetDisplay(contract)} · 
                    {formatPostedTime(contract.job_created_at)}
                  </p>

                  {/* DYNAMIC DESCRIPTION */}
                  <p className="text-[15px] text-gray-700 leading-[26px] mb-3">
                    {formatJobDescription(contract.job_description || contract.description)}
                    {(contract.job_description && contract.job_description.length > 150) || 
                     (contract.description && contract.description.length > 150) ? (
                      <span className="text-[#5A1FA8] font-semibold cursor-pointer">
                        {" "}more
                      </span>
                    ) : null}
                  </p>

                  {/* DYNAMIC FOOTER INFO */}
                  <div className="flex flex-wrap items-center gap-4 text-[14px] text-gray-600">
                    <span className="text-[#5A1FA8] font-semibold">$</span>
                    <span>{getRateType(contract.job_budget_type)}</span>
                    {/* ⭐ Rating */}
<span className="text-[#5A1FA8]">
  {"★".repeat(Math.floor(contract.creator.rating || 0))}
  {"☆".repeat(5 - Math.floor(contract.creator.rating || 0))}
</span>

<span>
  {(contract.creator.rating || 0)}/5 ({contract.creator.reviews || 0} Reviews)
</span>

{/* 📍 Location + Flag */}
<div className="flex items-center gap-2">
  <CountryFlag
    countryCode={contract.creator.country_code}
    country={contract.creator.country}
  />
  <span>
    {[contract.creator.state, contract.creator.country]
      .filter(Boolean)
      .join(", ")}
  </span>
</div>

                  </div>
                </div>

                {/* DOWNLOAD BUTTON */}
                <div
                  onClick={() => downloadFile(contract.id, contract.has_attachment)}
                  className={`
                    absolute top-4 right-1
                    w-[52px] h-[52px] rounded-full
                    bg-gradient-to-br from-[#7C3AED] to-[#2B0F4C]
                    flex items-center justify-center
                    shadow-[0_10px_30px_rgba(124,58,237,0.45)]
                    cursor-pointer hover:opacity-90 transition
                    ${!contract.has_attachment ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  title={contract.has_attachment ? "Download work submission" : "No file available"}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3v12" />
                    <path d="M7 10l5 5 5-5" />
                    <path d="M5 21h14" />
                  </svg>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Footer />

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="relative w-[90%] max-w-[520px] h-[360px] bg-white rounded-[26px] flex flex-col items-center justify-center">
            <div
              onClick={() => setShowSuccess(false)}
              className="absolute top-6 left-6 w-[44px] h-[44px] rounded-full
                bg-gradient-to-br from-[#7C3AED] to-[#2B0F4C]
                flex items-center justify-center cursor-pointer hover:opacity-90 transition"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M20 12H4M4 12L10 6M4 12L10 18" stroke="white" strokeWidth="3" />
              </svg>
            </div>

            <h1 className="text-[40px] font-bold mb-6" style={{ fontFamily: "Trochut", color: "#2B0F4C" }}>
              Talenta
            </h1>

            <img src={DownloadSuccessImg} className="w-[140px] h-[140px] mb-6" alt="Download Success" />

            <p className="text-[26px] md:text-[30px] font-semibold" style={{ fontFamily: "Milonga", color: "#2B0F4C" }}>
              Download successfully
            </p>
          </div>
        </div>
      )}
    </div>
  );
}