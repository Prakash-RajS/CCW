import React, { useEffect, useState } from "react";
import BannerImg from "../../assets/myproject/banner.png";
import UserImg from "../../assets/myproject/user.png";
import api from "../../utils/axiosConfig";

import Footer from "../../component/Footer";
import Header from "../../component/Header";
import { useUser } from "../../contexts/UserContext";

export default function ProposalsPage() {
  const { userData, loading: userLoading } = useUser();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedSkills, setExpandedSkills] = useState({});


  const formatEarnings = (amount) => {
    if (!amount) return "$0";
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}k`;
    return `$${amount}`;
  };

  const parseSkills = (skillsData) => {
    if (!skillsData) return [];
    try {
      // Handles JSON string format seen in your DB snap: ["skill1.skill2"]
      const parsed = typeof skillsData === 'string' ? JSON.parse(skillsData) : skillsData;
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      return String(skillsData).split(/[.,]/);
    }
  };

  const acceptProposal = async (proposalId) => {
    try {
      await api.post(
        `/proposals/AcceptProposal/${proposalId}`,
        null,
        {
          params: { creator_id: userData.id }
        }
      );

      // Backend auto-rejects others → refetch
      const res = await api.get(
        `/proposals/GetProposalsForCreator/${userData.id}`
      );
      setProposals(res.data.proposals || []);

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to accept proposal");
    }
  };

  const rejectProposal = async (proposalId) => {
    try {
      await api.post(
        `/proposals/RejectProposal/${proposalId}`,
        null,
        {
          params: { creator_id: userData.id }
        }
      );

      setProposals(prev =>
        prev.map(p =>
          p.id === proposalId ? { ...p, status: "rejected" } : p
        )
      );

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to reject proposal");
    }
  };

  useEffect(() => {
    if (userLoading || !userData?.id) return;

    const fetchProposals = async () => {
      try {
        setLoading(true);
        // Using dynamic creator ID from context
        const res = await api.get(`/proposals/GetProposalsForCreator/${userData.id}`);
        setProposals(res.data.proposals || []);
        setError("");
      } catch (err) {
        setError("Database Connection Error. Check backend logs for 500 status.");
        console.error("Failed to load proposals", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, [userData, userLoading]);

  return (
    <div className="w-full min-h-screen bg-[#F5F5F5]">
      <div className="absolute top-0 left-0 w-full z-50">
        <Header />
      </div>

      {/* BANNER */}
      <div className="relative w-full h-[433px] overflow-hidden">
        <img src={BannerImg} className="absolute inset-0 w-full h-full object-cover" alt="Banner" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2B003A]/85 via-[#4B0066]/75 to-[#2B003A]/85" />
      </div>

      <div className="relative mt-3 md:-mt-[150px] flex justify-center px-2 md:px-6 pb-20">
        <div className="w-full max-w-[1200px] bg-white rounded-[18px] shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[550px]">

          {/* SIDEBAR */}
          <div className="hidden md:block w-[280px] border-r bg-white">
            <div className="flex items-center gap-3 px-6 py-5 border-b cursor-pointer" onClick={() => window.history.back()}>
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#6b4fa3] text-white">←</div>
              <span className="font-semibold text-[#111]">Back</span>
            </div>
            <div className="px-4 py-6">
              <div className="flex items-center gap-3 px-4 py-4 rounded-lg bg-[#43187a] text-white">
                <i className="bi bi-wallet2 text-lg"></i>
                <span className="font-semibold">Proposals ({proposals.length})</span>
              </div>
            </div>
          </div>

          {/* CONTENT AREA */}
          <div className="flex-1 bg-white p-6 md:p-10">
            <div className="mb-8">
              <h3 className="text-[22px] font-bold text-[#111]">Proposals</h3>
              <p className="text-gray-900 text-[14px] font-semibold">
Select wallet for free-free transactions or card for secure payments.</p>
            </div>

            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-20 text-gray-400 italic font-medium">Loading from database...</div>
              ) : error ? (
                <div className="bg-red-50 border border-red-100 p-8 rounded-xl text-center">
                  <p className="text-red-500 font-semibold">{error}</p>
                  <p className="text-xs text-red-400 mt-2 italic">Ensure your backend query includes freelancer_name, rating, and reviews.</p>
                </div>
              ) : proposals.length === 0 ? (
                <div className="text-center py-20 text-gray-400 italic">No proposals found in database for this creator.</div>
              ) : (
                proposals.map((item) => (
                  <div key={item.id} className="bg-white rounded-[15px] border border-gray-100 p-6 md:p-8 shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-md transition-all">

                    {/* TOP INFO ROW */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={item.profile_image || UserImg}
                          className="w-12 h-12 rounded-full object-cover bg-gray-50 border border-gray-100"
                          alt="Freelancer"
                        />
                        <div>
                          <h4 className="font-bold text-[17px] text-[#111]">{item.freelancer_name}</h4>
                          <p className="text-gray-400 text-[13px]">{item.profession || item.expertise || "Expert"}</p>
                        </div>
                      </div>

                      {/* DYNAMIC STATUS */}
                      {item.status === "submitted" ? (
                        <div className="flex gap-3">
                          <button
                            onClick={() => acceptProposal(item.id)}
                            className="px-6 py-1.5 rounded-full text-[13px] font-semibold
  border border-[#6b4fa3] text-[#6b4fa3] hover:bg-purple-50 transition"
                          >
                            Accept
                          </button>

                          <button
                            onClick={() => rejectProposal(item.id)}
                            className="px-6 py-1.5 rounded-full text-[13px] font-semibold
  border border-red-400 text-red-400 hover:bg-red-50 transition"
                          >
                            Reject
                          </button>

                        </div>
                      ) : (
                        <span
                          className={`px-6 py-1.5 rounded-full text-[13px] font-semibold capitalize
    ${item.status === "accepted"
                              ? "border border-[#6b4fa3] text-[#6b4fa3]"
                              : "border border-red-400 text-red-400"
                            }`}
                        >
                          {item.status}
                        </span>
                      )}

                    </div>

                    {/* DYNAMIC BID & EARNINGS */}
                    <div className="mb-4">
                      <p className="text-[16px] font-bold text-[#111]">${item.bid_amount?.toFixed(2)} /hr</p>
                      <p className="text-gray-500 text-[13px] mt-1">
                        Total earnings <span className="font-bold text-black">{formatEarnings(item.total_earnings)}</span> on web and mobile design
                      </p>
                    </div>

                    {/* DYNAMIC SKILLS TAGS */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {(expandedSkills[item.id]
                        ? parseSkills(item.skills)
                        : parseSkills(item.skills).slice(0, 4)
                      ).map((skill, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 bg-[#6b4fa3] text-white text-[11px] px-4 py-1.5 rounded-full"
                        >
                          {skill.trim()}
                        </div>
                      ))}

                      {/* SHOW MORE ONLY IF SKILLS > 4 */}
                      {parseSkills(item.skills).length > 4 && (
                        <span
                          onClick={() =>
                            setExpandedSkills(prev => ({
                              ...prev,
                              [item.id]: !prev[item.id],
                            }))
                          }
                          className="text-[#6b4fa3] text-[13px] font-bold cursor-pointer ml-2 hover:underline"
                        >
                          {expandedSkills[item.id] ? "less" : "more"}
                        </span>
                      )}
                    </div>


                    {/* FULLY DYNAMIC RATINGS & LOCATION (FROM DATABASE) */}
                    <div className="flex items-center gap-4 text-[12px] text-gray-400 pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-1">
                        {/* Rating stars derived from database rating field */}
                        <span className="text-[#6b4fa3] text-[14px]">
                          {"★".repeat(Math.round(item.rating || 0))}
                        </span>
                        <span className="text-gray-200">
                          {"★".repeat(5 - Math.round(item.rating || 0))}
                        </span>
                        {/* Dynamic reviews count from database */}
                        <span className="ml-1 text-gray-500 font-medium">
                          {item.rating || "0"}/5 ({item.reviews || "0"} Reviews)
                        </span>
                      </div>

                      {/* Dynamic Location Details */}
                      <div className="flex items-center gap-2 border-l pl-4">
                        {item.country_code && (
                          <img
                            src={`https://flagcdn.com/w20/${item.country_code.toLowerCase()}.png`}
                            className="w-4 h-3 object-cover rounded-sm"
                            alt="flag"
                          />
                        )}
                        <span>{item.city}{item.city && item.country ? ", " : ""}{item.country}</span>
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}