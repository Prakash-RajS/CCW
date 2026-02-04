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


  useEffect(() => {
    if (userData?.id) {
      fetchContracts();
      fetchStatusCounts();
    }
  }, [userData]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/contracts/by-status", {
        params: {
          status: "pending",
          user_id: userData.id
        }
      });

      if (response.data && response.data.length > 0) {
        const contractsData = response.data;
        setContracts(contractsData);
        
        // Calculate total budget from all returned contracts
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
    
    // Map your expertise levels to display values
    const expertiseMap = {
      "fresher": "Entry Level",
      "medium": "Intermediate",
      "experienced": "Expert",
      "beginner": "Beginner"
    };
    
    return expertiseMap[contract.job_expertise_level] || contract.job_expertise_level;
  };

  const formatCountryName = (country) => {
    if (!country) return "USA";
    
    // Format country name properly
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
      // Add more as needed
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
      state: state
    };
  };

  // Static flag function - always returns USA flag for now
  const getFlagImage = () => {
    return USAFlag;
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

      {/* ================= CONTENT CARD ================= */}
      <div className="relative -mt-[60px] md:-mt-[90px] max-w-[1200px] mx-auto bg-white rounded-[18px] shadow-xl p-4 sm:p-6 space-y-6">
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-600">Loading contracts...</p>
          </div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600">No pending contracts found</p>
          </div>
        ) : (
          contracts.map(contract => {
            const locationInfo = getDisplayLocation(contract);
            
            return (
              <div key={contract.id} className="relative !border border-[#D0D0D0] rounded-[14px] p-4 sm:p-6 flex flex-col sm:flex-row justify-between gap-4 sm:gap-6">
                <div className="flex-1">
                  <h3 className="text-[20px] font-semibold mb-2">
                    {formatJobTitle(contract.job_title)}
                  </h3>

                  <p className="text-gray-600 text-[14px] mb-3">
                    {contract.job_budget_type === "hourly" ? "Hourly" : "Fixed-price"} · 
                    {getExpertiseLevel(contract)} · 
                    Est. Budget: {getBudgetDisplay(contract)} · 
                    {formatPostedTime(contract.job_created_at)}
                  </p>

                  <p className="text-[15px] text-gray-700 leading-[26px] mb-3">
                    {formatJobDescription(contract.job_description || contract.description)}
                    {(contract.job_description && contract.job_description.length > 150) || 
                     (contract.description && contract.description.length > 150) ? (
                      <span className="text-[#5A1FA8] font-semibold cursor-pointer">
                        {" "}more
                      </span>
                    ) : null}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[14px] text-gray-600">
                    <span className="text-[#5A1FA8] font-semibold">$</span>
                    <span>{contract.job_budget_type === "hourly" ? "Hourly Rate" : "Fixed Rate"}</span>
                    {/* ⭐ Rating */}
<span className="text-[#5A1FA8]">
  {"★".repeat(Math.floor(contract.creator.rating))}
  {"☆".repeat(5 - Math.floor(contract.creator.rating))}
</span>

<span>
  {contract.creator.rating}/5 ({contract.creator.reviews} Reviews)
</span>

{/* 📍 Location */}
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

                {/* REVIEW BUTTON */}
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => navigate(`/pending/${contract.id}`)}
                    className="px-8 py-2 rounded-full bg-[#5A1FA8] text-white font-semibold hover:opacity-90 transition"
                  >
                    Review
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Footer />
    </div>
  );
}