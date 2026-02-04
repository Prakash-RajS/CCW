import { useNavigate } from "react-router-dom";

import BannerImg from "../../assets/myproject/banner.png";
import UserImg from "../../assets/myproject/user.png";

import Footer from "../../component/Footer";
import Header from "../../component/Header";
import { useEffect, useState } from "react";
import api from "../../utils/axiosConfig";
import { useUser } from "../../contexts/UserContext"; // Import useUser hook

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
  const { userData } = useUser(); // Get userData from context
  const [hiredFreelancers, setHiredFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHiredFreelancers = async () => {
      try {
        setLoading(true);

        // Use userData from context instead of calling /auth/me
        const userId = userData.id;
        
        if (!userId) {
          console.error("User ID not found");
          setLoading(false);
          return;
        }

        const res = await api.get("/contracts", {
          params: {
            status: "in_progress",
            user_id: userId, // Use user ID from context
          },
        });

        const freelancers = res.data.map((contract) => ({
          id: contract.id,
          name: contract.collaborator.name,
          role: contract.collaborator.skill_category, // From collaboratorprofile.skill_category
          rate: contract.collaborator.rate_display || "Rate not set",
          
          // Location data from UserData
          city: contract.collaborator.city,
          state: contract.collaborator.state,
          country: contract.collaborator.country,
          country_code: contract.collaborator.country_code,

          rating: contract.collaborator.rating || 0,
          reviews: contract.collaborator.reviews || 0,
          total_earnings: contract.collaborator.total_earnings || 0,

          skills: contract.collaborator.skills || [], // From collaboratorprofile.skills
          profile_picture: contract.collaborator.profile_picture,
        }));

        setHiredFreelancers(freelancers);
      } catch (err) {
        console.error("Failed to load hired freelancers", err);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if userData is available
    if (userData.id) {
      fetchHiredFreelancers();
    }
  }, [userData.id]); // Add dependency


  const CountryFlag = ({ countryCode, countryName }) => {
  if (!countryCode) {
    return <span title="Unknown country">🌍</span>;
  }

  return (
    <img
      src={`https://flagcdn.com/${countryCode.toLowerCase()}.svg`}
      alt={countryName || countryCode}
      title={countryName || countryCode}
      className="w-[18px] h-[12px] rounded-[3px] object-cover"
      loading="lazy"
      onError={(e) => {
        // fallback to emoji if SVG fails
        e.target.onerror = null;
        e.target.replaceWith(
          document.createTextNode(codeToFlag(countryCode))
        );
      }}
    />
  );
};


  // Format location display
  const formatLocation = (freelancer) => {
    const locationParts = [];
    if (freelancer.city) locationParts.push(freelancer.city);
    if (freelancer.state && freelancer.state !== freelancer.city) {
      locationParts.push(freelancer.state);
    }
    if (freelancer.country) locationParts.push(freelancer.country);
    
    return locationParts.length > 0 ? locationParts.join(", ") : "Unknown";
  };

  // Format skills display
  const formatSkill = (skill) => {
    if (!skill) return "";
    // Capitalize first letter and add emoji/icon
    return skill.charAt(0).toUpperCase() + skill.slice(1);
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F5F5]">
      <div className="absolute top-0 left-0 w-full z-50">
        <Header />
      </div>

      <div className="w-full min-h-screen bg-[#F5F5F5]">
        {/* HEADER */}
        <div className="relative w-full h-[433px] overflow-hidden">
          <img src={BannerImg} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2B003A]/85 via-[#4B0066]/75 to-[#2B003A]/85" />
        </div>

        {/* MAIN WRAPPER */}
        <div className="relative -mt-[120px] flex justify-center px-3 sm:px-6">
          <div className="w-full max-w-[1440px] bg-white rounded-[18px] shadow-xl overflow-hidden flex flex-col md:flex-row">
            {/* SIDEBAR */}
            <div className="hidden md:block w-[280px] border-r">
              <div className="flex items-center gap-3 px-6 py-4 border-b">
                <button
                  onClick={() => navigate(-1)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-[#6b4fa3] text-white"
                >
                  ←
                </button>
                <span className="font-semibold">Back</span>
              </div>

              <div className="w-full h-[1px] bg-gray-300 mt-10" />

              <div className="px-4 py-6">
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-[#3f1b74] to-[#1a0b35] text-white">
                  <svg width="24" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="7" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <span className="text-[20px] font-medium tracking-wide">Hired Freelancers</span>
                </div>
              </div>
            </div>

            {/* ================= MOBILE HEADER ================= */}
            <div className="md:hidden bg-white px-4 pt-4 pb-3 border-b space-y-3">
              {/* Top Row */}
              <div className="flex items-start gap-3">
                {/* Back */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(-1)}
                    className="w-9 h-9 rounded-full bg-[#6B4FA3] text-white flex items-center justify-center text-lg shrink-0"
                  >
                    ←
                  </button>
                  <span className="text-[14px]">Back</span>
                </div>

                {/* Title */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-[44px] h-[44px] rounded-[10px] bg-gradient-to-br from-[#6D28D9] to-[#2B0F4C]
                      flex items-center justify-center shadow-md shrink-0">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                      <path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z" />
                      <path d="M8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3z" />
                      <path d="M8 13c-2.67 0-8 1.34-8 4v2h10v-2c0-1.07.34-2.06.92-2.88C10.07 13.42 9.04 13 8 13z" />
                      <path d="M16 13c-1.04 0-2.07.42-2.92 1.12.58.82.92 1.81.92 2.88v2h10v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-[20px] font-semibold text-[#0F0F0F] truncate">
                      My Hired Freelancers
                    </h3>
                    <p className="text-[13px] text-[#4B5563] mt-1 truncate">
                      Manage your team and active contracts
                    </p>
                  </div>
                </div>
              </div>

              {/* Search + Stats */}
              <div className="flex items-start gap-3 w-full">
                {/* Search */}
                <div className="flex items-center gap-2 border rounded-full px-3 py-2 
                    text-gray-500 text-[12px] leading-[14px] shrink-0">
                  <span className="text-[14px]">🔍</span>
                  <div className="flex flex-col">
                    <span>Hired</span>
                    <span>Freelancers</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-3 flex-1 min-w-0">
                  <div className="flex items-center gap-3 px-3 py-2 rounded-xl !border bg-white shadow-sm
                      w-1/2 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#6D28D9] to-[#2B0F4C]
                text-white flex items-center justify-center font-semibold shrink-0">
                      {hiredFreelancers.length}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold truncate">Total Hired</p>
                      <p className="text-[11px] text-gray-500 truncate">Active Freelancers</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 px-3 py-2 rounded-xl !border bg-white shadow-sm
                      w-1/2 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#6D28D9] to-[#2B0F4C]
                        text-white flex items-center justify-center shrink-0">
                      ✓
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold truncate">Contracts</p>
                      <p className="text-[11px] text-gray-500 truncate">All time</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 bg-[#FAFAFA] px-5 py-6 md:px-8 md:py-8 space-y-8">
              {/* HEADER BAR */}
              <div className="hidden md:flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:mt-[-20px] ">
                {/* LEFT */}
                <div className="flex items-center gap-4">
                  <div className="w-[44px] h-[44px] rounded-[10px] bg-gradient-to-br from-[#6D28D9] to-[#2B0F4C] flex items-center justify-center shadow-md">
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

                {/* RIGHT */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* TOTAL HIRED */}
                  <div className="flex items-center gap-4 px-4 py-2 rounded-[14px] !border border-[#B9B9B9] bg-white shadow-[0_6px_20px_rgba(0,0,0,0.04)]">
                    <div className="w-[40px] h-[40px] rounded-[10px]
                bg-gradient-to-br from-[#6D28D9] to-[#2B0F4C]
                flex items-center justify-center text-white text-[20px] font-semibold">
                      {hiredFreelancers.length}
                    </div>
                    <div>
                      <span className="text-[18px] md:text-[22px] font-semibold text-[#0F0F0F]">Total Hired</span>
                      <p className="text-[13px] md:text-[15px] text-[#4B5563]">Active Freelancers</p>
                    </div>
                  </div>

                  {/* CONTRACTS */}
                  <div className="flex items-center gap-4 px-6 py-2 rounded-[14px] !border border-[#B9B9B9] bg-white shadow-[0_6px_20px_rgba(0,0,0,0.04)]">
                    <div className="w-[40px] h-[40px] rounded-[10px] bg-gradient-to-br from-[#6D28D9] to-[#2B0F4C] flex items-center justify-center">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-[18px] md:text-[22px] font-semibold text-[#0F0F0F]">Contracts</span>
                      <p className="text-[13px] md:text-[15px] text-[#4B5563]">All time</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full h-[1px] bg-gray-300" />

              {/* CARDS */}
              {loading ? (
                <p className="text-center text-gray-400 py-10">
                  Loading hired freelancers...
                </p>
              ) : hiredFreelancers.length === 0 ? (
                <p className="text-center text-gray-400 py-10">
                  No hired freelancers yet.
                </p>
              ) : hiredFreelancers.map((item) => {
                const rating = Math.min(5, Math.max(0, item.rating));
                const fullStars = Math.floor(rating);
                const emptyStars = 5 - fullStars;

                return (
                  <div key={item.id} className="bg-white rounded-[22px] shadow-[0_18px_50px_rgba(0,0,0,0.06)] px-5 py-6 md:px-10 md:py-8 space-y-5 md:space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                      <div className="flex items-center justify-between gap-3 w-full flex-nowrap">
                        {/* Left Info */}
                        <div className="flex items-center gap-4 min-w-0">
                          <img
                            src={item.profile_picture || UserImg}
                            className="w-12 h-12 rounded-full object-cover shrink-0"
                            alt={item.name}
                            onError={(e) => {
                              e.target.src = UserImg;
                            }}
                          />
                          <div className="min-w-0">
                            <h4 className="font-semibold text-[16px] truncate">{item.name}</h4>
                            {/* Display skill_category as role */}
                            <p className="text-[13px] text-gray-400 truncate">
                              {item.role || "No role specified"}
                            </p>
                          </div>
                        </div>

                        {/* Message Button */}
                        <div className="w-[100px] h-[40px] flex items-center justify-end shrink-0">
                          <button
                            onClick={() =>
                              navigate("/myprojectmessage", {
                                state: {
                                  collaboratorId: item.id,
                                  name: item.name,
                                  profile_picture: item.profile_picture,
                                },
                              })
                            }
                            className="
        px-8 py-[6px] rounded-full font-semibold
        !border border-[#51218F] text-[#51218F]
        hover:bg-[#51218F]/10 transition
        text-[13px] md:text-[14px]
        px-4 md:px-8
      "
                          >
                            Message
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {/* Rate - Display from rate_display */}
                      <p className="font-semibold text-[16px] text-black">
                        {item.rate}
                      </p>

                      {/* Earnings */}
                      <p className="text-[13px] text-gray-500">
                        Total earnings{" "}
                        <span className="font-semibold text-black">
                          ${item.total_earnings.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>{" "}
                        on {item.role}
                      </p>
                    </div>

                    {/* Skills - Display from collaboratorprofile.skills */}
                    <div className="flex flex-wrap gap-2">
                      {item.skills && item.skills.slice(0, 4).map((tag, i) => (
                        <span
                          key={i}
                          className="
        bg-[#6B4FA3]
        text-white
        text-[11px]
        px-4
        py-[6px]
        rounded-full
        flex items-center gap-2
      "
                        >
                          {formatSkill(tag)}
                          <span className="opacity-70 cursor-pointer">✕</span>
                        </span>
                      ))}

                      {item.skills && item.skills.length > 4 && (
                        <span className="text-[#6B4FA3] text-[12px] font-semibold cursor-pointer">
                          more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t text-[13px] text-gray-400">
                      <div className="flex items-center gap-3 text-[13px] text-gray-500">
                        {/* ⭐ Stars */}
                        <span className="text-[#6B4FA3]">
                          {"★".repeat(Math.floor(item.rating))}
                          {"☆".repeat(5 - Math.floor(item.rating))}
                        </span>

                        {/* Rating */}
                        <span>
                          {item.rating}/5 ({item.reviews} Reviews)
                        </span>

                        {/* 📍 Location - Display from UserData fields */}
                        <span className="flex items-center gap-2">
  <CountryFlag
    countryCode={item.country_code}
    countryName={item.country}
  />
  {formatLocation(item)}
</span>

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}