import { useNavigate } from "react-router-dom";
import BannerImg from "../../assets/myproject/banner.png";
import UserImg from "../../assets/myproject/user.png";
import Footer from "../../component/Footer";
import Header from "../../component/Header";
import { useEffect, useState } from "react";
import api from "../../utils/axiosConfig";
import { useUser } from "../../contexts/UserContext";

const codeToFlag = (code) =>
  code
    ? String.fromCodePoint(
      ...[...code.toUpperCase()].map(
        (c) => 127397 + c.charCodeAt()
      )
    )
    : "🌍";

export default function Hiredfreelancers() {
  const navigate = useNavigate();
  const { userData } = useUser();
  const [activeFreelancers, setActiveFreelancers] = useState([]);
  const [allTimeFreelancers, setAllTimeFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [itemsPerPageMobile] = useState(3);
  const [expandedSkills, setExpandedSkills] = useState({});

  // Responsive items per page
  const isMobile = window.innerWidth < 768;
  const effectiveItemsPerPage = isMobile ? itemsPerPageMobile : itemsPerPage;

  const currentData = activeTab === "active" ? activeFreelancers : allTimeFreelancers;
  const totalItems = currentData.length;

  const indexOfLastItem = currentPage * effectiveItemsPerPage;
  const indexOfFirstItem = indexOfLastItem - effectiveItemsPerPage;
  const currentItems = currentData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(totalItems / effectiveItemsPerPage);

  // Fetch active contracts
  const fetchActiveContracts = async (userId) => {
    try {
      const res = await api.get("/contracts", {
        params: {
          status: "in_progress",
          user_id: userId,
        },
      });
      return res.data;
    } catch (err) {
      console.error("Failed to fetch active contracts", err);
      return [];
    }
  };

  // Fetch all contracts for a specific collaborator
  const fetchCollaboratorAllContracts = async (collaboratorId, userId) => {
    try {
      const res = await api.get("/contracts/collaborator-all-contracts", {
        params: {
          collaborator_id: collaboratorId,
          user_id: userId
        }
      });
      return res.data.count || 0;
    } catch (err) {
      console.error(`Failed to fetch all-time contracts for collaborator ${collaboratorId}`, err);
      return 0;
    }
  };

  // Fetch all contracts history
  const fetchAllContractsHistory = async (userId) => {
    try {
      const res = await api.get("/contracts/all-history", {
        params: {
          user_id: userId,
        },
      });
      return res.data;
    } catch (err) {
      console.error("Failed to fetch all contracts history", err);
      return [];
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const userId = userData.id;

        if (!userId) {
          console.error("User ID not found");
          setLoading(false);
          return;
        }

        const activeContracts = await fetchActiveContracts(userId);

        const active = await Promise.all(activeContracts.map(async (contract) => {
          const allTimeCount = await fetchCollaboratorAllContracts(contract.collaborator.id, userId);

          return {
            id: contract.id,
            collaboratorId: contract.collaborator.id,
            name: contract.collaborator.name,
            role: contract.collaborator.skill_category,
            rate: contract.collaborator.rate_display || "Rate not set",
            city: contract.collaborator.city,
            state: contract.collaborator.state,
            country: contract.collaborator.country,
            country_code: contract.collaborator.country_code,
            rating: contract.collaborator.rating || 0,
            reviews: contract.collaborator.reviews || 0,
            total_earnings: contract.collaborator.total_earnings || 0,
            all_time_contracts: allTimeCount,
            skills: contract.collaborator.skills || [],
            profile_picture: contract.collaborator.profile_picture,
          };
        }));

        setActiveFreelancers(active);

        const allContractsHistory = await fetchAllContractsHistory(userId);
        const uniqueCollaborators = new Map();

        allContractsHistory.forEach(contract => {
          const collaboratorId = contract.collaborator.id;
          if (!uniqueCollaborators.has(collaboratorId)) {
            uniqueCollaborators.set(collaboratorId, {
              collaboratorId: collaboratorId,
              name: contract.collaborator.name,
              role: contract.collaborator.skill_category,
              rate: contract.collaborator.rate_display || "Rate not set",
              city: contract.collaborator.city,
              state: contract.collaborator.state,
              country: contract.collaborator.country,
              country_code: contract.collaborator.country_code,
              rating: contract.collaborator.rating || 0,
              reviews: contract.collaborator.reviews || 0,
              total_earnings: contract.collaborator.total_earnings || 0,
              skills: contract.collaborator.skills || [],
              profile_picture: contract.collaborator.profile_picture,
              all_time_contracts: 0,
            });
          }
        });

        const allTime = await Promise.all(
          Array.from(uniqueCollaborators.values()).map(async (collaborator) => {
            const allTimeCount = await fetchCollaboratorAllContracts(collaborator.collaboratorId, userId);
            return {
              ...collaborator,
              all_time_contracts: allTimeCount,
            };
          })
        );

        setAllTimeFreelancers(allTime);

      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };

    if (userData.id) {
      fetchAllData();
    }
  }, [userData.id]);

  const CountryFlag = ({ countryCode, countryName }) => {
    if (!countryCode) {
      return <span title="Unknown country">🌍</span>;
    }

    return (
      <img
        src={`https://flagcdn.com/${countryCode.toLowerCase()}.svg`}
        alt={countryName || countryCode}
        title={countryName || countryCode}
        className="w-[14px] h-[10px] md:w-[18px] md:h-[12px] rounded-[3px] object-cover"
        loading="lazy"
        onError={(e) => {
          e.target.onerror = null;
          e.target.replaceWith(
            document.createTextNode(codeToFlag(countryCode))
          );
        }}
      />
    );
  };

  const formatLocation = (freelancer) => {
    const locationParts = [];
    if (freelancer.city) locationParts.push(freelancer.city);
    if (freelancer.state && freelancer.state !== freelancer.city) {
      locationParts.push(freelancer.state);
    }
    if (freelancer.country) locationParts.push(freelancer.country);

    return locationParts.length > 0 ? locationParts.join(", ") : "Unknown";
  };

  const formatSkill = (skill) => {
    if (!skill) return "";
    return skill.charAt(0).toUpperCase() + skill.slice(1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleMessageClick = (collaboratorId, name, profilePicture) => {
    navigate(`/message?user=${collaboratorId}`, {
      state: {
        receiverId: collaboratorId,
        receiverName: name,
        receiverProfilePicture: profilePicture,
      },
    });
  };

  const totalContractsAllTime = allTimeFreelancers.reduce((sum, freelancer) => sum + freelancer.all_time_contracts, 0);

  return (
    <div className="w-full min-h-screen bg-[#F5F5F5]">
      <div className="absolute top-0 left-0 w-full z-50">
        <Header />
      </div>

      <div className="w-full min-h-screen bg-[#F5F5F5]">
        {/* HEADER - Reduced height for mobile */}
        <div className="relative w-full h-[200px] md:h-[433px] overflow-hidden">
          <div
            className="absolute top-[-104px] left-0 w-full h-[calc(100%+104px)] z-0"
            style={{
              backgroundImage: `url(${BannerImg})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
          >
            <div className="absolute inset-0 bg-black opacity-50"></div>
          </div>
        </div>

        {/* MAIN WRAPPER */}
        <div className="relative -mt-[80px] md:-mt-[120px] flex justify-center px-3 sm:px-6">
          <div className="w-full max-w-[1440px] bg-white rounded-[18px] shadow-xl overflow-hidden flex flex-col md:flex-row">
            {/* SIDEBAR - Hidden on mobile */}
            <div className="hidden md:block w-[280px] border-r">
              <div className="flex items-center gap-3 px-6 py-4 border-b">
                <button
                  onClick={() => navigate(-1)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-[#51218F] to-[#2a0e4a] border border-[#E1E6EF] text-white shadow-xl hover:from-[#3d1768] hover:to-[#1a0830] transition-all"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="font-semibold">Back</span>
              </div>
              <div className="w-full h-[1px] bg-gray-300 mt-10" />
              <div className="px-4 py-6">
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-[#3f1b74] to-[#1a0b35] text-white">
                  <svg width="24" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.3">
                    <circle cx="11" cy="11" r="7" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <span className="text-[20px] font-medium tracking-wide">Hired Freelancers</span>
                </div>
              </div>
            </div>

            {/* MOBILE HEADER - Compact */}
            <div className="md:hidden bg-white px-3 pt-3 pb-2 border-b space-y-2">
              <div className="flex items-start gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => navigate(-1)}
                    className="w-7 h-7 rounded-full bg-gradient-to-r from-[#51218F] to-[#2a0e4a] border border-[#E1E6EF] text-white flex items-center justify-center shrink-0 shadow-xl hover:from-[#3d1768] hover:to-[#1a0830] transition-all"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-xs">Back</span>
                </div>

                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#6D28D9] to-[#2B0F4C] flex items-center justify-center shadow-xl shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                      <path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z" />
                      <path d="M8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3z" />
                      <path d="M8 13c-2.67 0-8 1.34-8 4v2h10v-2c0-1.07.34-2.06.92-2.88C10.07 13.42 9.04 13 8 13z" />
                      <path d="M16 13c-1.04 0-2.07.42-2.92 1.12.58.82.92 1.81.92 2.88v2h10v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-[#0F0F0F] truncate">
                      Hired Freelancers
                    </h3>
                    <p className="text-[11px] text-[#4B5563] mt-0.5 truncate">
                      Manage your team
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 bg-[#FAFAFA] px-3 py-4 md:px-8 md:py-8 space-y-4 md:space-y-8">
              {/* DESKTOP TABS - Hidden on mobile */}
              <div className="hidden md:flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:mt-[-20px]">
                <div className="flex items-center gap-4">
                  <div className="w-[44px] h-[44px] rounded-[10px] bg-gradient-to-br from-[#6D28D9] to-[#2B0F4C] flex items-center justify-center shadow-xl">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                      <path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z" />
                      <path d="M8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3z" />
                      <path d="M8 13c-2.67 0-8 1.34-8 4v2h10v-2c0-1.07.34-2.06.92-2.88C10.07 13.42 9.04 13 8 13z" />
                      <path d="M16 13c-1.04 0-2.07.42-2.92 1.12.58.82.92 1.81.92 2.88v2h10v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-[24px] md:text-[26px] font-semibold text-[#0F0F0F]">My Hired Freelancers</h3>
                    <p className="text-[14px] md:text-[15px] text-[#4B5563] mt-1">Manage your team and active contracts</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => handleTabChange("active")}
                    className={`flex items-center gap-4 px-6 py-2 rounded-[14px] border transition-all duration-200 ${activeTab === "active"
                      ? "bg-gradient-to-r from-[#6D28D9] to-[#2B0F4C] border-transparent shadow-lg"
                      : "border-[#B9B9B9] bg-white hover:shadow-md"
                      }`}
                  >
                    <div className={`w-[40px] h-[40px] rounded-[10px] flex items-center justify-center text-[20px] font-semibold ${activeTab === "active"
                      ? "bg-white/20 text-white"
                      : "bg-gradient-to-br from-[#6D28D9] to-[#2B0F4C] text-white"
                      }`}>
                      {activeFreelancers.length}
                    </div>
                    <div className="text-left">
                      <span className={`text-[18px] md:text-[22px] font-semibold ${activeTab === "active" ? "text-white" : "text-[#0F0F0F]"
                        }`}>
                        Hired Freelancers
                      </span>
                      <p className={`text-[13px] md:text-[15px] ${activeTab === "active" ? "text-white/80" : "text-[#4B5563]"
                        }`}>
                        Active
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleTabChange("allTime")}
                    className={`flex items-center gap-4 px-6 py-2 rounded-[14px] border transition-all duration-200 ${activeTab === "allTime"
                      ? "bg-gradient-to-r from-[#6D28D9] to-[#2B0F4C] border-transparent shadow-lg"
                      : "border-[#B9B9B9] bg-white hover:shadow-md"
                      }`}
                  >
                    <div className={`w-[40px] h-[40px] rounded-[10px] flex items-center justify-center text-[20px] font-semibold ${activeTab === "allTime"
                      ? "bg-white/20 text-white"
                      : "bg-gradient-to-br from-[#6D28D9] to-[#2B0F4C] text-white"
                      }`}>
                      {totalContractsAllTime}
                    </div>
                    <div className="text-left">
                      <span className={`text-[18px] md:text-[22px] font-semibold ${activeTab === "allTime" ? "text-white" : "text-[#0F0F0F]"
                        }`}>
                        All Time
                      </span>
                      <p className={`text-[13px] md:text-[15px] ${activeTab === "allTime" ? "text-white/80" : "text-[#4B5563]"
                        }`}>
                        Total Contracts
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* MOBILE TABS - Compact */}
              <div className="md:hidden flex gap-2">
                <button
                  onClick={() => handleTabChange("active")}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 ${activeTab === "active"
                    ? "bg-gradient-to-r from-[#6D28D9] to-[#2B0F4C] text-white shadow-lg"
                    : "bg-white border border-gray-200 text-gray-700"
                    }`}
                >
                  <span className="text-sm font-semibold">Hired</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === "active" ? "bg-white/20" : "bg-gray-100"
                    }`}>
                    {activeFreelancers.length}
                  </span>
                </button>
                <button
                  onClick={() => handleTabChange("allTime")}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 ${activeTab === "allTime"
                    ? "bg-gradient-to-r from-[#6D28D9] to-[#2B0F4C] text-white shadow-lg"
                    : "bg-white border border-gray-200 text-gray-700"
                    }`}
                >
                  <span className="text-sm font-semibold">All Time</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === "allTime" ? "bg-white/20" : "bg-gray-100"
                    }`}>
                    {totalContractsAllTime}
                  </span>
                </button>
              </div>

              <div className="w-full h-[1px] bg-gray-300" />

              {/* CARDS */}
              {loading ? (
                <p className="text-center text-gray-400 py-6 md:py-10 text-sm md:text-base">
                  Loading...
                </p>
              ) : currentItems.length === 0 ? (
                <p className="text-center text-gray-400 py-6 md:py-10 text-sm md:text-base">
                  {activeTab === "active"
                    ? "No active freelancers hired."
                    : "No freelancers in your history."}
                </p>
              ) : (
                <>
                  {currentItems.map((item) => {
                    const rating = Math.min(5, Math.max(0, item.rating));

                    return (
                      <div key={item.id || item.collaboratorId} className="bg-white rounded-2xl md:rounded-[22px] shadow-[0_16px_40px_rgba(0,0,0,0.14)] p-3 md:px-10 md:py-6 space-y-2 md:space-y-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                          <div className="flex items-center justify-between gap-2 w-full">
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={item.profile_picture || UserImg}
                                className="w-9 h-9 md:w-12 md:h-12 rounded-full object-cover shrink-0"
                                alt={item.name}
                                onError={(e) => {
                                  e.target.src = UserImg;
                                }}
                              />
                              <div className="min-w-0">
                                <h4 className="font-semibold text-sm md:text-[16px] truncate">{item.name}</h4>
                                <p className="text-[11px] md:text-[13px] text-gray-400 truncate">
                                  {item.role || "No role"}
                                </p>
                              </div>
                            </div>

                            <div className="shrink-0">
                              <button
                                onClick={() =>
                                  handleMessageClick(
                                    item.collaboratorId,
                                    item.name,
                                    item.profile_picture
                                  )
                                }
                                className="px-3 md:px-8 py-1 md:py-[6px] rounded-full font-semibold bg-[#51218F] border border-[#51218F] text-white hover:bg-[#3d1768] transition text-[11px] md:text-[14px] shadow-md"
                              >
                                Message
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-0.5 md:space-y-1">
                          {/* <p className="font-semibold text-sm md:text-[16px] text-black">
                            ₹{parseFloat(item.rate?.replace(/[^\d.]/g, "")) || 0}
                          </p> */}

                          <p className="text-[11px] md:text-[13px] text-gray-500">
                            Earnings <span className="font-semibold text-black">
                              ₹{item.total_earnings?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || 0}
                            </span>
                          </p>

                          <p className="text-[11px] md:text-[13px] text-gray-500">
                            Contracts <span className="font-semibold text-[#6B4FA3]">
                              {item.all_time_contracts}
                            </span>
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {(expandedSkills[item.collaboratorId]
                            ? item.skills
                            : item.skills?.slice(0, 3)
                          )?.map((tag, i) => (
                            <span
                              key={i}
                              className="bg-[#6B4FA3] text-white text-[9px] md:text-[11px] px-2 md:px-4 py-1 md:py-[6px] rounded-full"
                            >
                              {formatSkill(tag)}
                            </span>
                          ))}

                          {item.skills?.length > 3 && !expandedSkills[item.collaboratorId] && (
                            <button
                              onClick={() =>
                                setExpandedSkills(prev => ({
                                  ...prev,
                                  [item.collaboratorId]: true,
                                }))
                              }
                              className="bg-gray-100 text-[#6B4FA3] text-[10px] md:text-[12px] font-semibold px-2 py-1 rounded-full"
                            >
                              +{item.skills.length - 3}
                            </button>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 md:pt-3 border-t text-[11px] md:text-[13px] text-gray-400">
                          <div className="flex items-center gap-2 md:gap-3 text-[11px] md:text-[13px] text-gray-500 flex-wrap">
                            <span className="text-[#FFD700] text-xs md:text-sm">
                              {"★".repeat(Math.floor(item.rating))}
                              <span className="text-gray-300">
                                {"☆".repeat(5 - Math.floor(item.rating))}
                              </span>
                            </span>

                            <span>
                              {item.rating}/5 ({item.reviews})
                            </span>

                            <span className="flex items-center gap-1 md:gap-2">
                              <CountryFlag
                                countryCode={item.country_code}
                                countryName={item.country}
                              />
                              <span className="hidden sm:inline">{formatLocation(item)}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Pagination Controls - Compact on mobile */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-1 md:gap-2 py-4 md:py-8">
                      <button
                        onClick={goToPrevPage}
                        disabled={currentPage === 1}
                        className={`px-2 md:px-3 py-1 md:py-2 rounded-md text-xs md:text-sm ${currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-[#6B4FA3] text-white hover:bg-[#5a3e8a]"
                          } transition`}
                      >
                        Prev
                      </button>

                      <div className="flex gap-1 md:gap-2">
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
                              key={pageNum}
                              onClick={() => goToPage(pageNum)}
                              className={`w-6 h-6 md:w-8 md:h-8 rounded-md text-xs md:text-sm ${currentPage === pageNum
                                ? "bg-[#6B4FA3] text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                } transition`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className={`px-2 md:px-3 py-1 md:py-2 rounded-md text-xs md:text-sm ${currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-[#6B4FA3] text-white hover:bg-[#5a3e8a]"
                          } transition`}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}