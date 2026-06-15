//src/pages/MyProject/ProposalsPage.jsx
import React, { useEffect, useState } from "react";
import BannerImg from "../../assets/myproject/banner.png";
import UserImg from "../../assets/myproject/user.png";
import api from "../../utils/axiosConfig";
import ReactCountryFlag from "react-country-flag";
import toast from "../../component/Toast"; 
import Footer from "../../component/Footer";
import Header from "../../component/Header";
import { useUser } from "../../contexts/UserContext";

// ─── Global style injected once to hide scrollbars everywhere they're used ───
const scrollbarHideStyle = `
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
`;

// ─── Mobile-specific styles ───
const mobileResponsiveStyle = `
  @media (max-width: 768px) {
    .mobile-text-xs { font-size: 11px !important; }
    .mobile-text-sm { font-size: 12px !important; }
    .mobile-text-base { font-size: 13px !important; }
    .mobile-text-lg { font-size: 15px !important; }
    .mobile-text-xl { font-size: 17px !important; }
    .mobile-p-xs { padding: 2px 6px !important; }
    .mobile-p-sm { padding: 4px 8px !important; }
    .mobile-p-md { padding: 6px 10px !important; }
    .mobile-gap-sm { gap: 4px !important; }
    .mobile-gap-md { gap: 6px !important; }
    .mobile-mb-sm { margin-bottom: 6px !important; }
    .mobile-mb-md { margin-bottom: 10px !important; }
    .mobile-mt-sm { margin-top: 6px !important; }
    .mobile-mt-md { margin-top: 10px !important; }
    .mobile-w-full { width: 100% !important; }
    .mobile-grid-cols-2 { grid-template-columns: repeat(2, 1fr) !important; }
    .mobile-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
    .badge-mobile { font-size: 9px !important; padding: 2px 6px !important; }
    .btn-mobile { padding: 4px 10px !important; font-size: 11px !important; }
  }
`;

export default function ProposalsPage() {
  const { userData, loading: userLoading } = useUser();
  const [proposals, setProposals] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [activeTab, setActiveTab] = useState("proposals");
  const [loading, setLoading] = useState(true);
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  const [error, setError] = useState("");
  const [invitationsError, setInvitationsError] = useState("");
  const [expandedSkills, setExpandedSkills] = useState({});
  const [expandedMilestones, setExpandedMilestones] = useState({});
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [showInvitationPopup, setShowInvitationPopup] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [revokingProposal, setRevokingProposal] = useState(null);
  const [revokingInvitation, setRevokingInvitation] = useState(null);
  const [showRevokeInviteConfirm, setShowRevokeInviteConfirm] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [invCurrentPage, setInvCurrentPage] = useState(1);
  const [invItemsPerPage] = useState(5);
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProposals = proposals.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(proposals.length / itemsPerPage);
  
  const invIndexOfLastItem = invCurrentPage * invItemsPerPage;
  const invIndexOfFirstItem = invIndexOfLastItem - invItemsPerPage;
  const currentInvitations = invitations.slice(invIndexOfFirstItem, invIndexOfLastItem);
  const invTotalPages = Math.ceil(invitations.length / invItemsPerPage);
  
  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const paginateInvitations = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= invTotalPages) {
      setInvCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formatEarnings = (amount) => {
    if (!amount) return "₹0";
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}k`;
    return `₹${amount}`;
  };

  // ─── FIXED: Robust skills parser that handles all data shapes ───────────────
  const parseSkills = (skillsData) => {
    if (!skillsData) return [];

    // Already a non-empty array
    if (Array.isArray(skillsData)) {
      return skillsData.filter(Boolean).map((s) => String(s).trim()).filter(Boolean);
    }

    // String – could be JSON, comma-separated, or a single value
    if (typeof skillsData === "string") {
      const trimmed = skillsData.trim();
      if (!trimmed) return [];

      // Try JSON parse first
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.filter(Boolean).map((s) => String(s).trim()).filter(Boolean);
        }
        if (parsed && typeof parsed === "object") {
          return Object.values(parsed).map(String).filter(Boolean);
        }
        return [String(parsed).trim()].filter(Boolean);
      } catch {
        // Not JSON – split on common delimiters
        return trimmed
          .split(/[,;|]/)
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    // Object / number / etc. – convert to string as last resort
    return [String(skillsData).trim()].filter(Boolean);
  };

  // ─── FIXED: Proper milestone parser ─────────────────────────────────────────
  const parseMilestones = (milestonesData) => {
    if (!milestonesData) return [];
    if (Array.isArray(milestonesData)) return milestonesData;
    if (typeof milestonesData === "string") {
      try {
        const parsed = JSON.parse(milestonesData);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error("Error parsing milestones:", e);
        return [];
      }
    }
    return [];
  };

  const buildProfileImageUrl = (profileImage) => {
    if (!profileImage) return UserImg;
    if (profileImage.startsWith("http")) return profileImage;
    if (profileImage.startsWith("/")) return profileImage;
    return `/${profileImage}`;
  };

  const compareDurations = (proposedDuration, jobDuration) => {
    if (!proposedDuration || !jobDuration) return null;
    const parseDurationToDays = (durationStr) => {
      const str = durationStr.toLowerCase();
      const match = str.match(/(\d+)\s*(day|week|month|year)/i);
      if (!match) return null;
      const value = parseInt(match[1]);
      const unit = match[2];
      if (unit === "day") return value;
      if (unit === "week") return value * 7;
      if (unit === "month") return value * 30;
      if (unit === "year") return value * 365;
      return null;
    };
    const proposedDays = parseDurationToDays(proposedDuration);
    const jobDays = parseDurationToDays(jobDuration);
    if (!proposedDays || !jobDays) return null;
    if (proposedDays > jobDays)
      return { type: "longer", color: "text-orange-600", bgColor: "bg-orange-50", icon: "⚠️", message: "Proposed duration is longer than expected" };
    if (proposedDays < jobDays)
      return { type: "shorter", color: "text-blue-600", bgColor: "bg-blue-50", icon: "ℹ️", message: "Proposed duration is shorter than expected" };
    return { type: "equal", color: "text-green-600", bgColor: "bg-green-50", icon: "✓", message: "Duration matches client's expectation" };
  };

  const calculateMilestonePercentages = (milestones, totalBid) => {
    if (!milestones || milestones.length === 0) return [];
    return milestones.map((m) => ({
      ...m,
      percentage: totalBid > 0 ? ((m.amount / totalBid) * 100).toFixed(1) : 0,
    }));
  };

  const downloadAttachment = async (proposalId, attachmentUrl) => {
    let loadingToast = null;
    try {
      let filename = attachmentUrl.split('/').pop();
      filename = filename.split('?')[0];
      
      loadingToast = toast.loading("Downloading attachment...");
      
      const response = await api.get(`/proposals/download-attachment/${proposalId}/${filename}`, {
        responseType: 'blob',
        timeout: 30000
      });
      
      toast.dismiss(loadingToast);
      
      let downloadedFilename = filename;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          downloadedFilename = match[1].replace(/['"]/g, '');
        }
      }
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', downloadedFilename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("File downloaded successfully");
    } catch (err) {
      if (loadingToast) toast.dismiss(loadingToast);
      console.error("Download error:", err);
      const errorMsg = err.response?.data?.detail || err.message || "Failed to download attachment";
      toast.error(errorMsg);
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch(ext) {
      case 'pdf':
        return (
          <svg className="w-4 h-4 text-red-500 mobile-text-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'doc':
      case 'docx':
        return (
          <svg className="w-4 h-4 text-blue-500 mobile-text-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return (
          <svg className="w-4 h-4 text-green-500 mobile-text-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-500 mobile-text-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };
  
  // ─── API actions ─────────────────────────────────────────────────────────────
  const acceptProposal = async (proposalId) => {
    const loadingToast = toast.loading("Accepting proposal...");
    try {
      await api.post(`/proposals/AcceptProposal/${proposalId}`, null, { params: { creator_id: userData.id } });
      const res = await api.get(`/proposals/GetProposalsForCreator/${userData.id}`);
      setProposals(res.data.proposals || []);
      setShowReviewPopup(false);
      setSelectedProposal(null);
      setCurrentPage(1);
      toast.dismiss(loadingToast);
      toast.success("Proposal accepted successfully! Contract created.");
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.detail || "Failed to accept proposal");
    }
  };

  const rejectProposal = async (proposalId) => {
    const loadingToast = toast.loading("Rejecting proposal...");
    try {
      await api.post(`/proposals/RejectProposal/${proposalId}`, null, { params: { creator_id: userData.id } });
      setProposals((prev) => prev.map((p) => (p.id === proposalId ? { ...p, status: "rejected" } : p)));
      setShowReviewPopup(false);
      setSelectedProposal(null);
      toast.dismiss(loadingToast);
      toast.success("Proposal rejected successfully");
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.detail || "Failed to reject proposal");
    }
  };

  const revokeAcceptance = async (proposalId) => {
    const loadingToast = toast.loading("Revoking acceptance...");
    try {
      await api.post(`/proposals/RevokeAcceptance/${proposalId}`, null, { params: { creator_id: userData.id } });
      const res = await api.get(`/proposals/GetProposalsForCreator/${userData.id}`);
      setProposals(res.data.proposals || []);
      setShowRevokeConfirm(false);
      setRevokingProposal(null);
      setCurrentPage(1);
      toast.dismiss(loadingToast);
      toast.success("Acceptance revoked and contract deleted successfully");
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.detail || "Failed to revoke acceptance");
    }
  };

  const revokeInvitation = async (invitationId) => {
    const loadingToast = toast.loading("Revoking invitation...");
    try {
      await api.put(`/invitations/update-status`, null, { params: { invitation_id: invitationId, status: "revoked" } });
      await fetchInvitations();
      setShowRevokeInviteConfirm(false);
      setRevokingInvitation(null);
      setShowInvitationPopup(false);
      setSelectedInvitation(null);
      toast.dismiss(loadingToast);
      toast.success("Invitation revoked successfully");
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.detail || "Failed to revoke invitation");
    }
  };

  const openReviewPopup    = (proposal)   => { setSelectedProposal(proposal);     setShowReviewPopup(true);    };
  const openInvitationPopup= (invitation) => { setSelectedInvitation(invitation); setShowInvitationPopup(true);};
  const openRevokeConfirm  = (proposalId) => { setRevokingProposal(proposalId);   setShowRevokeConfirm(true);  };
  const openRevokeInviteConfirm = (invId) => { setRevokingInvitation(invId);      setShowRevokeInviteConfirm(true); };

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/proposals/GetProposalsForCreator/${userData.id}`);
      setProposals(res.data.proposals || []);
      setError("");
      setCurrentPage(1);
    } catch (err) {
      setError("Database Connection Error. Check backend logs for 500 status.");
      toast.error("Failed to load proposals");
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      setLoadingInvitations(true);
      const res = await api.get(`/invitations/sent/${userData.id}`);
      const invitationsList = res.data.invitations || [];
      const invitationsWithDetails = await Promise.all(
        invitationsList.map(async (inv) => {
          try {
            const detailRes = await api.get(`/invitations/${inv.id}?user_id=${userData.id}`);
            return { ...inv, ...detailRes.data };
          } catch {
            return inv;
          }
        })
      );
      const activeInvitations = invitationsWithDetails
        .filter((inv) => inv.status?.toLowerCase() !== "revoked")
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setInvitations(activeInvitations);
      setInvitationsError("");
      setInvCurrentPage(1);
    } catch (err) {
      setInvitationsError("Failed to load invitations");
      toast.error("Failed to load invitations");
    } finally {
      setLoadingInvitations(false);
    }
  };

  useEffect(() => {
    if (userLoading || !userData?.id) return;
    fetchProposals();
    fetchInvitations();
  }, [userData, userLoading]);

  // ─── Pagination components ────────────────────────────────────────────────────
  const PaginationUI = ({ currentPage: cp, totalPages: tp, onPageChange }) => {
    if (tp <= 1) return null;
    const maxVisible = 5;
    let start = Math.max(1, cp - Math.floor(maxVisible / 2));
    let end = Math.min(tp, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);

    const btn = (label, disabled, onClick, extra = "") => (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`px-2 md:px-3 py-1 md:py-2 rounded-lg flex items-center gap-1 transition text-xs md:text-sm ${
          disabled
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : `bg-white border border-gray-300 text-gray-700 hover:bg-purple-50 hover:border-purple-300 ${extra}`
        }`}
      >
        {label}
      </button>
    );

    return (
      <div className="flex items-center justify-center gap-1 md:gap-2 mt-6 md:mt-8 pt-4 border-t border-gray-200">
        {btn(
          <><svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg><span className="hidden sm:inline">Previous</span></>,
          cp === 1, () => onPageChange(cp - 1)
        )}
        {start > 1 && (
          <>
            <button onClick={() => onPageChange(1)} className="w-8 h-8 md:w-10 md:h-10 rounded-lg border border-gray-300 text-gray-700 hover:bg-purple-50 hover:border-purple-300 transition text-xs md:text-sm">1</button>
            {start > 2 && <span className="text-gray-500 text-xs md:text-sm">…</span>}
          </>
        )}
        {pages.map((n) => (
          <button
            key={n}
            onClick={() => onPageChange(n)}
            className={`w-8 h-8 md:w-10 md:h-10 rounded-lg transition text-xs md:text-sm ${
              cp === n
                ? "bg-gradient-to-r from-[#51218F] to-[#2a0e4a] text-white font-semibold shadow-md"
                : "border border-gray-300 text-gray-700 hover:bg-purple-50 hover:border-purple-300"
            }`}
          >
            {n}
          </button>
        ))}
        {end < tp && (
          <>
            {end < tp - 1 && <span className="text-gray-500 text-xs md:text-sm">…</span>}
            <button onClick={() => onPageChange(tp)} className="w-8 h-8 md:w-10 md:h-10 rounded-lg border border-gray-300 text-gray-700 hover:bg-purple-50 hover:border-purple-300 transition text-xs md:text-sm">{tp}</button>
          </>
        )}
        {btn(
          <><span className="hidden sm:inline">Next</span><svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg></>,
          cp === tp, () => onPageChange(cp + 1)
        )}
      </div>
    );
  };

  // ─── Reusable skills badge strip ─────────────────────────────────────────────
  const SkillsBadges = ({ skills, variant = "purple", max = 4, itemId, expanded, onToggle }) => {
    const parsed = parseSkills(skills);
    if (parsed.length === 0)
      return <div className="text-gray-400 text-[8px] md:text-[10px] px-1 py-1">No skills specified</div>;

    const colorMap = {
      purple: "bg-[#6b4fa3] text-white",
      gray: "bg-gray-100 text-gray-700",
    };
    const shown = expanded ? parsed : parsed.slice(0, max);

    return (
      <div className="flex flex-wrap gap-1 md:gap-1.5">
        {shown.map((skill, i) => (
          <span key={i} className={`text-[8px] md:text-[10px] px-2 md:px-3 py-0.5 md:py-1 rounded-full ${colorMap[variant]} badge-mobile`}>
            {skill}
          </span>
        ))}
        {parsed.length > max && (
          <button
            onClick={() => onToggle && onToggle(itemId)}
            className="text-[#6b4fa3] text-[9px] md:text-[11px] font-semibold ml-1 hover:underline"
          >
            {expanded ? "less" : `+${parsed.length - max} more`}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F5F5]">
      {/* Inject styles */}
      <style>{scrollbarHideStyle}</style>
      <style>{mobileResponsiveStyle}</style>

      <div className="absolute top-0 left-0 w-full z-50">
        <Header />
      </div>

      <div className="relative w-full h-[300px] md:h-[433px] overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full"
          style={{ backgroundImage: `url(${BannerImg})`, backgroundRepeat: "no-repeat", backgroundPosition: "center", backgroundSize: "cover" }}
        >
          <div className="absolute inset-0 bg-black opacity-30" />
        </div>
      </div>

      <div className="relative -mt-32 sm:-mt-36 md:-mt-40 lg:-mt-[150px] flex justify-center px-2 md:px-6 pb-20">
        <div className="w-full max-w-[1200px] bg-white rounded-[18px] shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[550px]">

          {/* ── Sidebar ── */}
          <div className="hidden md:block w-[280px] border-r bg-white">
            <div className="flex items-center gap-3 px-6 py-5 border-b cursor-pointer" onClick={() => window.history.back()}>
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#6b4fa3] text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                </svg>
              </div>
              <span className="font-semibold text-[#111]">Back</span>
            </div>
            <div className="px-4 py-6 space-y-2">
              {[
                { key: "proposals",   icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", label: `Proposals (${proposals.length})` },
                { key: "invitations", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", label: `Invitations (${invitations.length})` },
              ].map(({ key, icon, label }) => (
                <div
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-3 px-4 py-4 rounded-lg cursor-pointer transition ${
                    activeTab === key
                      ? "bg-gradient-to-r from-[#51218F] to-[#2a0e4a] text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-purple-50 border border-gray-200"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon}/>
                  </svg>
                  <span className="font-semibold">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Main content ── */}
          <div className="flex-1 bg-white p-4 md:p-10">
            {/* Mobile tab switcher */}
            <div className="flex gap-2 mb-4 md:hidden">
              {["proposals","invitations"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 rounded-lg font-semibold capitalize transition text-sm ${
                    activeTab === tab ? "bg-gradient-to-r from-[#51218F] to-[#2a0e4a] text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tab === "proposals" ? `Proposals (${proposals.length})` : `Invitations (${invitations.length})`}
                </button>
              ))}
            </div>

            {/* ══════════════════ PROPOSALS TAB ══════════════════ */}
            {activeTab === "proposals" && (
              <>
                <div className="mb-4 md:mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg md:text-[22px] font-bold text-[#111] mobile-text-lg">Proposals</h3>
                    {proposals.length > 0 && (
                      <p className="text-xs md:text-sm text-gray-500 mobile-text-xs">
                        Showing {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, proposals.length)} of {proposals.length}
                      </p>
                    )}
                  </div>
                  <p className="text-gray-900 text-xs md:text-[14px] font-semibold mobile-text-xs">Review and manage proposals from freelancers.</p>
                </div>

                <div className="space-y-3 md:space-y-4">
                  {loading ? (
                    <div className="text-center py-20 text-gray-400 italic font-medium text-sm md:text-base">Loading proposals...</div>
                  ) : error ? (
                    <div className="bg-red-50 border border-red-100 p-6 md:p-8 rounded-xl text-center">
                      <p className="text-red-500 font-semibold text-sm md:text-base">{error}</p>
                    </div>
                  ) : proposals.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 italic text-sm md:text-base">No proposals found.</div>
                  ) : (
                    <>
                      {currentProposals.map((item) => {
                        let milestones = [];
                        if (item.milestones_data) {
                          milestones = parseMilestones(item.milestones_data);
                        } else if (item.milestone_description) {
                          try {
                            const p = JSON.parse(item.milestone_description);
                            milestones = Array.isArray(p) ? p : [{ description: item.milestone_description, due_date: item.milestone_due_date, amount: item.milestone_amount }];
                          } catch {
                            milestones = [{ description: item.milestone_description, due_date: item.milestone_due_date, amount: item.milestone_amount }];
                          }
                        }
                        const milestonePercentages = calculateMilestonePercentages(milestones, item.bid_amount);
                        const durationComparison = compareDurations(item.duration, item.job_details?.duration);

                        // ── Collect skills: proposal skills first, fall back to collaborator profile skills
                        const proposalSkills = parseSkills(item.skills);
                        const profileSkills  = parseSkills(item.collaborator_skills || item.profile_skills || item.freelancer_skills || []);
                        const displaySkills  = proposalSkills.length > 0 ? proposalSkills : profileSkills;

                        return (
                          <div key={item.id} className="bg-white rounded-[15px] border border-gray-100 p-3 md:p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-md transition-all">

                            {/* Header */}
                            <div className="flex items-start justify-between mb-2 md:mb-3">
                              <div className="flex items-center gap-2 md:gap-3">
                                <img src={buildProfileImageUrl(item.profile_image)} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover bg-gray-50 border border-gray-100" alt="Freelancer" />
                                <div>
                                  <h4 className="font-bold text-sm md:text-[16px] text-[#111] mobile-text-sm">{item.freelancer_name}</h4>
                                  <p className="text-gray-400 text-[10px] md:text-[12px] mobile-text-xs">{item.profession || item.expertise || "Expert"}</p>
                                </div>
                              </div>
                              {item.status === "submitted" ? (
                                <button onClick={() => openReviewPopup(item)} className="px-3 md:px-5 py-0.5 md:py-1 rounded-full text-[10px] md:text-[12px] font-semibold bg-[#6b4fa3] text-white hover:bg-[#5a3e8a] transition btn-mobile">Review</button>
                              ) : item.status === "accepted" ? (
                                <div className="flex gap-1 md:gap-2">
                                  <span className="px-2 md:px-5 py-0.5 md:py-1 rounded-full text-[10px] md:text-[12px] font-semibold border border-[#6b4fa3] text-[#6b4fa3] btn-mobile">Accepted</span>
                                  <button onClick={() => openRevokeConfirm(item.id)} className="px-2 md:px-5 py-0.5 md:py-1 rounded-full text-[10px] md:text-[12px] font-semibold border border-orange-500 text-orange-500 hover:bg-orange-50 transition btn-mobile">Revoke</button>
                                </div>
                              ) : (
                                <span className="px-2 md:px-5 py-0.5 md:py-1 rounded-full text-[10px] md:text-[12px] font-semibold capitalize border border-red-400 text-red-400 btn-mobile">{item.status}</span>
                              )}
                            </div>

                            {/* Bid */}
                            <div className="mb-2 md:mb-3">
                              <div className="flex items-baseline gap-1 md:gap-2">
                                <p className="text-base md:text-[20px] font-bold text-[#111] mobile-text-base">₹{item.bid_amount?.toFixed(2)}</p>
                                {item.payment_type === "hourly" && <span className="text-[10px] md:text-xs text-gray-500 mobile-text-xs">/hr</span>}
                                {item.payment_type === "project" && <span className="text-[10px] md:text-xs text-gray-500 mobile-text-xs">fixed price</span>}
                              </div>
                              {item.job_details && (item.job_details.budget_from || item.job_details.budget_to) && (
                                <div className="mt-0.5 md:mt-1">
                                  {parseFloat(item.bid_amount) > parseFloat(item.job_details.budget_to) && (
                                    <p className="text-[9px] md:text-[11px] text-orange-600 bg-orange-50 inline-block px-1 md:px-2 py-0.5 rounded mobile-text-xs">⚠️ Bid higher than budget</p>
                                  )}
                                  {parseFloat(item.bid_amount) < parseFloat(item.job_details.budget_from) && (
                                    <p className="text-[9px] md:text-[11px] text-blue-600 bg-blue-50 inline-block px-1 md:px-2 py-0.5 rounded mobile-text-xs">ℹ️ Bid lower than budget</p>
                                  )}
                                  {parseFloat(item.bid_amount) >= parseFloat(item.job_details.budget_from) &&
                                   parseFloat(item.bid_amount) <= parseFloat(item.job_details.budget_to) && (
                                    <p className="text-[9px] md:text-[11px] text-green-600 bg-green-50 inline-block px-1 md:px-2 py-0.5 rounded mobile-text-xs">✓ Within budget range</p>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Duration */}
                            <div className="mb-2 md:mb-3 p-2 md:p-3 bg-gray-50 rounded-lg">
                              <div className="grid grid-cols-2 gap-2 md:gap-3 mb-1 md:mb-2">
                                <div>
                                  <p className="text-[8px] md:text-[10px] text-gray-500 uppercase tracking-wide mobile-text-xs">Client's Expected</p>
                                  <p className="text-[11px] md:text-sm font-semibold text-gray-800 mobile-text-xs">{item.job_details?.duration || "Not specified"}</p>
                                </div>
                                <div>
                                  <p className="text-[8px] md:text-[10px] text-gray-500 uppercase tracking-wide mobile-text-xs">Proposed Duration</p>
                                  <p className="text-[11px] md:text-sm font-semibold text-gray-800 mobile-text-xs">{item.duration || "Not specified"}</p>
                                </div>
                              </div>
                              {durationComparison && (
                                <div className={`mt-1 md:mt-2 p-1 md:p-2 rounded ${durationComparison.bgColor}`}>
                                  <p className={`text-[9px] md:text-xs font-medium ${durationComparison.color} mobile-text-xs`}>{durationComparison.icon} {durationComparison.message}</p>
                                </div>
                              )}
                            </div>

                            {/* Milestones */}
                            {item.payment_type === "milestone" && milestones.length > 0 && (
                              <div className="mb-2 md:mb-3 p-2 md:p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <div className="flex items-center justify-between mb-2 md:mb-3">
                                  <div className="flex items-center gap-1 md:gap-2">
                                    <svg className="w-3 h-3 md:w-4 md:h-4 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                    </svg>
                                    <p className="font-semibold text-purple-900 text-[11px] md:text-sm mobile-text-xs">Milestone Payment</p>
                                  </div>
                                  <button onClick={() => setExpandedMilestones((p) => ({ ...p, [item.id]: !p[item.id] }))} className="text-purple-600 text-[9px] md:text-xs hover:underline mobile-text-xs">
                                    {expandedMilestones[item.id] ? "Hide" : `View ${milestones.length}`}
                                  </button>
                                </div>
                                {expandedMilestones[item.id] ? (
                                  <div className="overflow-x-auto scrollbar-hide">
                                    <table className="w-full border-collapse text-[10px] md:text-sm">
                                      <thead>
                                        <tr className="bg-white">
                                          {["#","Description","Due Date","Amount","%"].map((h,i) => (
                                            <th key={i} className={`px-1 md:px-3 py-1 md:py-2 text-[9px] md:text-xs font-semibold text-purple-700 border border-purple-200 ${i>=3?"text-right":"text-left"}`}>{h}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {milestonePercentages.map((m, idx) => (
                                          <tr key={idx} className="hover:bg-purple-100">
                                            <td className="px-1 md:px-3 py-1 md:py-2 text-[9px] md:text-xs text-gray-700 border border-purple-100">{idx+1}</td>
                                            <td className="px-1 md:px-3 py-1 md:py-2 text-[9px] md:text-xs text-gray-700 border border-purple-100 truncate max-w-[100px] md:max-w-none">{m.description||"-"}</td>
                                            <td className="px-1 md:px-3 py-1 md:py-2 text-[9px] md:text-xs text-gray-700 border border-purple-100">{m.due_date||"-"}</td>
                                            <td className="px-1 md:px-3 py-1 md:py-2 text-[9px] md:text-xs font-medium text-purple-700 text-right border border-purple-100">₹{(m.amount||0).toFixed(0)}</td>
                                            <td className="px-1 md:px-3 py-1 md:py-2 text-[9px] md:text-xs text-gray-600 text-right border border-purple-100">{m.percentage}%</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                      <tfoot className="bg-white">
                                        <tr>
                                          <td colSpan="3" className="px-1 md:px-3 py-1 md:py-2 text-[9px] md:text-xs font-semibold text-gray-800 border border-purple-200">Total</td>
                                          <td className="px-1 md:px-3 py-1 md:py-2 text-[9px] md:text-xs font-bold text-purple-800 text-right border border-purple-200">₹{item.bid_amount?.toFixed(0)}</td>
                                          <td className="px-1 md:px-3 py-1 md:py-2 text-[9px] md:text-xs font-semibold text-purple-800 text-right border border-purple-200">100%</td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>
                                ) : (
                                  <div className="flex flex-wrap gap-1">
                                    {milestones.slice(0,2).map((m,idx) => (
                                      <span key={idx} className="text-[9px] md:text-xs bg-white px-1 md:px-2 py-0.5 rounded-full border border-purple-200 mobile-text-xs">{m.description}: ₹{(m.amount||0).toFixed(0)}</span>
                                    ))}
                                    {milestones.length > 2 && <span className="text-[9px] md:text-xs text-purple-500 mobile-text-xs">+{milestones.length-2} more</span>}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Job details */}
                            {item.job_details && (
                              <div className="mb-2 md:mb-3 p-2 md:p-2.5 bg-blue-50 rounded-lg">
                                <p className="text-[9px] md:text-[11px] font-semibold text-blue-700 mb-0.5 md:mb-1 mobile-text-xs">Job Details</p>
                                <p className="text-[11px] md:text-sm font-medium text-gray-800 mobile-text-xs">{item.job_details.title||"Job Title"}</p>
                                <p className="text-[9px] md:text-[11px] text-gray-600 mt-0.5 md:mt-1 line-clamp-2 mobile-text-xs">{item.job_details.description||"No description"}</p>
                                {item.job_details.skills?.length > 0 && (
                                  <div className="flex flex-wrap gap-0.5 md:gap-1 mt-1 md:mt-2">
                                    {item.job_details.skills.slice(0,3).map((s,i)=>(
                                      <span key={i} className="text-[8px] md:text-[9px] bg-blue-200 text-blue-800 px-1 md:px-2 py-0.5 rounded-full mobile-text-xs">{s}</span>
                                    ))}
                                    {item.job_details.skills.length > 3 && <span className="text-[8px] md:text-[9px] text-blue-600 mobile-text-xs">+{item.job_details.skills.length-3}</span>}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Skills badges */}
                            <div className="flex flex-wrap gap-1 mb-2 md:mb-4">
                              <SkillsBadges
                                skills={displaySkills}
                                variant="purple"
                                max={3}
                                itemId={item.id}
                                expanded={expandedSkills[item.id]}
                                onToggle={(id) => setExpandedSkills((p) => ({ ...p, [id]: !p[id] }))}
                              />
                            </div>

                            {/* Footer */}
                            <div className="flex items-center gap-2 md:gap-4 text-[9px] md:text-[11px] text-gray-400 pt-2 md:pt-3 border-t border-gray-50">
                              <div className="flex items-center gap-0.5 md:gap-1">
                                {item.reviews > 0 ? (
                                  <>
                                    <span className="text-[#6b4fa3] text-[10px] md:text-[13px]">{"★".repeat(Math.round(item.rating||0))}</span>
                                    <span className="text-gray-200 text-[10px] md:text-[13px]">{"★".repeat(5-Math.round(item.rating||0))}</span>
                                    <span className="ml-0.5 md:ml-1 text-gray-500 font-medium text-[9px] md:text-xs">{item.rating||"0"}/5</span>
                                  </>
                                ) : (
                                  <span className="text-gray-500 font-medium text-[9px] md:text-xs">No reviews</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 md:gap-2 border-l pl-1 md:pl-4">
                                {item.country_code && <ReactCountryFlag countryCode={item.country_code} svg style={{width:"12px",height:"10px"}}/>}
                                <span className="text-[9px] md:text-xs mobile-text-xs">{item.city && item.country ? `${item.city}, ${item.country}` : item.country||"Location not specified"}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <PaginationUI currentPage={currentPage} totalPages={totalPages} onPageChange={paginate}/>
                    </>
                  )}
                </div>
              </>
            )}

            {/* ══════════════════ INVITATIONS TAB ══════════════════ */}
            {activeTab === "invitations" && (
              <>
                <div className="mb-4 md:mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg md:text-[22px] font-bold text-[#111] mobile-text-lg">Sent Invitations</h3>
                    {invitations.length > 0 && (
                      <p className="text-xs md:text-sm text-gray-500 mobile-text-xs">
                        Showing {invIndexOfFirstItem+1}–{Math.min(invIndexOfLastItem,invitations.length)} of {invitations.length}
                      </p>
                    )}
                  </div>
                  <p className="text-gray-900 text-xs md:text-[14px] font-semibold mobile-text-xs">Track and manage invitations sent to collaborators.</p>
                </div>

                <div className="space-y-3 md:space-y-4">
                  {loadingInvitations ? (
                    <div className="text-center py-20 text-gray-400 italic font-medium text-sm md:text-base">Loading invitations...</div>
                  ) : invitationsError ? (
                    <div className="bg-red-50 border border-red-100 p-6 md:p-8 rounded-xl text-center"><p className="text-red-500 font-semibold text-sm md:text-base">{invitationsError}</p></div>
                  ) : invitations.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 italic text-sm md:text-base">No active invitations found.</div>
                  ) : (
                    <>
                      {currentInvitations.map((invitation) => {
                        const collabSkills = parseSkills(
                          invitation.receiver_skills ||
                          invitation.collaborator_skills ||
                          invitation.receiver_profile_skills ||
                          []
                        );

                        return (
                          <div key={invitation.id} className="bg-white rounded-[15px] border border-gray-100 p-3 md:p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-2 md:mb-3">
                              <div className="flex items-center gap-2 md:gap-3">
                                <img
                                  src={buildProfileImageUrl(invitation.receiver_profile_pic)}
                                  className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover bg-gray-50 border border-gray-100"
                                  alt={invitation.receiver_name}
                                  onError={(e)=>{e.target.src=UserImg;}}
                                />
                                <div>
                                  <h4 className="font-bold text-sm md:text-[16px] text-[#111] mobile-text-sm">{invitation.receiver_name||"Collaborator"}</h4>
                                  <p className="text-gray-400 text-[10px] md:text-[12px] mobile-text-xs">{invitation.receiver_skill_category||"Collaborator"}</p>
                                </div>
                              </div>
                              {invitation.status?.toLowerCase() === "pending" ? (
                                <button onClick={()=>openInvitationPopup(invitation)} className="px-2 md:px-5 py-0.5 md:py-1 rounded-full text-[10px] md:text-[12px] font-semibold bg-[#6b4fa3] text-white hover:bg-[#5a3e8a] transition btn-mobile">Review</button>
                              ) : invitation.status?.toLowerCase() === "accepted" ? (
                                <span className="px-2 md:px-5 py-0.5 md:py-1 rounded-full text-[10px] md:text-[12px] font-semibold border border-green-500 text-green-500 btn-mobile">Accepted</span>
                              ) : (
                                <span className="px-2 md:px-5 py-0.5 md:py-1 rounded-full text-[10px] md:text-[12px] font-semibold capitalize border border-gray-400 text-gray-500 btn-mobile">{invitation.status||"Pending"}</span>
                              )}
                            </div>

                            <div className="mb-2 md:mb-3">
                              <p className="text-sm md:text-[15px] font-bold text-[#111] mobile-text-sm">{formatEarnings(invitation.revenue)}</p>
                              <p className="text-gray-500 text-[10px] md:text-[12px] mt-0.5 mobile-text-xs">Budget for {invitation.project_name}</p>
                            </div>

                            {collabSkills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2 md:mb-3">
                                <SkillsBadges skills={collabSkills} variant="gray" max={3}/>
                              </div>
                            )}

                            {invitation.job_details && (
                              <div className="mb-2 md:mb-3 p-2 md:p-2.5 bg-purple-50 rounded-lg">
                                <p className="text-[9px] md:text-[11px] font-semibold text-purple-700 mb-0.5 md:mb-1 mobile-text-xs">Job Details</p>
                                <p className="text-[11px] md:text-sm font-medium text-gray-800 mobile-text-xs">{invitation.job_details.title||invitation.project_name}</p>
                                <p className="text-[9px] md:text-[11px] text-gray-600 mt-0.5 md:mt-1 line-clamp-2 mobile-text-xs">{invitation.job_details.description||"No description"}</p>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-2 md:gap-4 mb-3 md:mb-4">
                              <div>
                                <p className="text-gray-400 text-[8px] md:text-[10px] uppercase tracking-wide mobile-text-xs">Date</p>
                                <p className="text-gray-700 text-[11px] md:text-[13px] font-medium mobile-text-xs">{invitation.date||"Not specified"}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-[8px] md:text-[10px] uppercase tracking-wide mobile-text-xs">Job ID</p>
                                <p className="text-gray-700 text-[11px] md:text-[13px] font-medium mobile-text-xs">#{invitation.job_id||"N/A"}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 md:gap-4 text-[9px] md:text-[11px] text-gray-400 pt-2 md:pt-3 border-t border-gray-50">
                              <span className={`inline-flex items-center gap-0.5 md:gap-1 px-1 md:px-2 py-0.5 rounded-full text-[8px] md:text-[9px] font-semibold ${
                                invitation.status?.toLowerCase()==="accepted"?"bg-green-100 text-green-700":
                                invitation.status?.toLowerCase()==="pending"?"bg-yellow-100 text-yellow-700":"bg-gray-100 text-gray-600"
                              }`}>
                                <span className={`w-1 h-1 rounded-full ${
                                  invitation.status?.toLowerCase()==="accepted"?"bg-green-500":
                                  invitation.status?.toLowerCase()==="pending"?"bg-yellow-500":"bg-gray-500"
                                }`}/>
                                {invitation.status||"Pending"}
                              </span>
                              <div className="flex items-center gap-1 md:gap-2 border-l pl-1 md:pl-4">
                                <svg className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>
                                <span className="text-[9px] md:text-xs mobile-text-xs">Sent {invitation.created_at ? new Date(invitation.created_at).toLocaleDateString() : "recently"}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <PaginationUI currentPage={invCurrentPage} totalPages={invTotalPages} onPageChange={paginateInvitations}/>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer/>

      {/* ══════════════════════════════════════════════════════════════════════
          PROPOSAL REVIEW POPUP  — scrollbar hidden via .scrollbar-hide class
      ══════════════════════════════════════════════════════════════════════ */}
      {showReviewPopup && selectedProposal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 md:p-4">
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-hide">

            <div className="bg-gradient-to-r from-[#51218F] to-[#2a0e4a] px-3 md:px-5 py-2 sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base md:text-lg font-bold text-white">Review Proposal</h3>
                  <p className="text-purple-200 text-[10px] md:text-xs">Review freelancer's complete proposal details</p>
                </div>
                <button onClick={()=>{setShowReviewPopup(false);setSelectedProposal(null);}} className="text-white hover:bg-white/20 rounded-full p-1 transition">
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>

            <div className="p-3 md:p-5">
              {/* Profile */}
              <div className="flex items-center gap-2 md:gap-4 mb-3 md:mb-4">
                <img src={buildProfileImageUrl(selectedProposal.profile_image)} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-purple-200" alt="Freelancer" onError={(e)=>{e.target.src=UserImg;}}/>
                <div className="flex-1">
                  <h4 className="font-bold text-base md:text-lg text-gray-900 mobile-text-base">{selectedProposal.freelancer_name}</h4>
                  <p className="text-[11px] md:text-sm text-gray-600 mobile-text-xs">{selectedProposal.profession||"Expert"}</p>
                  <div className="flex items-center gap-2 md:gap-3 mt-0.5 md:mt-1">
                    <div className="flex items-center gap-0.5 md:gap-1">
                      <span className="text-yellow-500 text-[10px] md:text-sm">{"★".repeat(Math.round(selectedProposal.rating||0))}{"☆".repeat(5-Math.round(selectedProposal.rating||0))}</span>
                      <span className="text-[9px] md:text-xs text-gray-500">({selectedProposal.reviews||0})</span>
                    </div>
                    <div className="flex items-center gap-0.5 md:gap-1">
                      {selectedProposal.country_code && <ReactCountryFlag countryCode={selectedProposal.country_code} svg style={{width:"12px",height:"10px"}}/>}
                      <span className="text-[9px] md:text-xs text-gray-500">{selectedProposal.city&&selectedProposal.country?`${selectedProposal.city}, ${selectedProposal.country}`:selectedProposal.country||"Location"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-1 md:gap-2 mb-3 md:mb-4 mobile-stats-grid">
                <div className="bg-purple-50 p-1.5 md:p-2 rounded-lg text-center">
                  <p className="text-[9px] md:text-xs text-purple-600 font-semibold">Bid Amount</p>
                  <p className="text-sm md:text-base font-bold text-gray-900 mobile-text-sm">₹{selectedProposal.bid_amount?.toFixed(2)}</p>
                </div>
                <div className="bg-green-50 p-1.5 md:p-2 rounded-lg text-center">
                  <p className="text-[9px] md:text-xs text-green-600 font-semibold">Total Earnings</p>
                  <p className="text-sm md:text-base font-bold text-gray-900 mobile-text-sm">{formatEarnings(selectedProposal.total_earnings)}</p>
                </div>
                <div className="bg-blue-50 p-1.5 md:p-2 rounded-lg text-center">
                  <p className="text-[9px] md:text-xs text-blue-600 font-semibold">Payment Type</p>
                  <p className="text-[11px] md:text-sm font-bold text-blue-700 mobile-text-xs">{selectedProposal.payment_type==="milestone"?"Milestone":"Project"}</p>
                </div>
                <div className="bg-gray-50 p-1.5 md:p-2 rounded-lg text-center">
                  <p className="text-[9px] md:text-xs text-gray-600 font-semibold">Submitted</p>
                  <p className="text-[11px] md:text-sm font-medium text-gray-700 mobile-text-xs">{selectedProposal.date}</p>
                </div>
              </div>

              {/* Duration comparison */}
              <div className="mb-3 md:mb-4 p-2 md:p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-[9px] md:text-xs font-semibold text-gray-600 mb-1 md:mb-2">Duration Comparison</p>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <div>
                    <p className="text-[8px] md:text-[10px] text-gray-500">Client's Expected</p>
                    <p className="text-[10px] md:text-sm font-semibold text-gray-800 mobile-text-xs">{selectedProposal.job_details?.duration||"Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-[8px] md:text-[10px] text-gray-500">Proposed Duration</p>
                    <p className="text-[10px] md:text-sm font-semibold text-gray-800 mobile-text-xs">{selectedProposal.duration||"Not specified"}</p>
                  </div>
                </div>
              </div>

              {/* Milestone breakdown */}
              {selectedProposal.payment_type === "milestone" && (() => {
                let ms = [];
                if (selectedProposal.milestones_data) {
                  ms = parseMilestones(selectedProposal.milestones_data);
                } else if (selectedProposal.milestone_description) {
                  try { const p=JSON.parse(selectedProposal.milestone_description); ms=Array.isArray(p)?p:[{description:selectedProposal.milestone_description,due_date:selectedProposal.milestone_due_date,amount:selectedProposal.milestone_amount}]; }
                  catch { ms=[{description:selectedProposal.milestone_description,due_date:selectedProposal.milestone_due_date,amount:selectedProposal.milestone_amount}]; }
                }
                if (!ms.length) return null;
                return (
                  <div className="mb-3 md:mb-4 p-2 md:p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-1 md:gap-2 mb-2 md:mb-3">
                      <svg className="w-3 h-3 md:w-4 md:h-4 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                      <p className="font-semibold text-purple-900 text-[11px] md:text-sm">Milestone Structure ({ms.length})</p>
                    </div>
                    <div className="overflow-x-auto scrollbar-hide">
                      <table className="w-full border-collapse text-[10px] md:text-sm">
                        <thead>
                          <tr className="bg-white">
                            {["#","Description","Due Date","Amount","%"].map((h,i)=>(
                              <th key={i} className={`px-1 md:px-3 py-1 md:py-2 text-[9px] md:text-xs font-semibold text-purple-700 border border-purple-200 ${i>=3?"text-right":"text-left"}`}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {ms.map((m,idx)=>{
                            const pct=selectedProposal.bid_amount?((m.amount/selectedProposal.bid_amount)*100).toFixed(1):0;
                            return(
                              <tr key={idx} className="hover:bg-purple-100">
                                <td className="px-1 md:px-3 py-1 md:py-2 text-[9px] md:text-xs text-gray-700 border border-purple-100">{idx+1}</td>
                                <td className="px-1 md:px-3 py-1 md:py-2 text-[9px] md:text-xs text-gray-700 border border-purple-100 truncate max-w-[120px]">{m.description||"-"}</td>
                                <td className="px-1 md:px-3 py-1 md:py-2 text-[9px] md:text-xs text-gray-700 border border-purple-100">{m.due_date||"-"}</td>
                                <td className="px-1 md:px-3 py-1 md:py-2 text-[9px] md:text-xs font-medium text-purple-700 text-right border border-purple-100">₹{(m.amount||0).toFixed(0)}</td>
                                <td className="px-1 md:px-3 py-1 md:py-2 text-[9px] md:text-xs text-gray-600 text-right border border-purple-100">{pct}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-white">
                          <tr>
                            <td colSpan="3" className="px-1 md:px-3 py-1 md:py-2 text-[9px] md:text-xs font-semibold text-gray-800 border border-purple-200">Total</td>
                            <td className="px-1 md:px-3 py-1 md:py-2 text-[9px] md:text-xs font-bold text-purple-800 text-right border border-purple-200">₹{selectedProposal.bid_amount?.toFixed(0)}</td>
                            <td className="px-1 md:px-3 py-1 md:py-2 text-[9px] md:text-xs font-semibold text-purple-800 text-right border border-purple-200">100%</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                );
              })()}

              {/* Job details */}
              {selectedProposal.job_details && (
                <div className="mb-3 md:mb-4 p-2 md:p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    <p className="font-semibold text-purple-900 text-[11px] md:text-sm">Job Details</p>
                  </div>
                  <p className="text-[11px] md:text-sm font-bold text-gray-900 mobile-text-xs">{selectedProposal.job_details.title||"Job Title"}</p>
                  <p className="text-[9px] md:text-xs text-gray-700 mt-0.5 md:mt-1 line-clamp-2">{selectedProposal.job_details.description||"No description"}</p>
                  {selectedProposal.job_details.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 md:gap-1 mt-1 md:mt-2">
                      {selectedProposal.job_details.skills.slice(0,3).map((s,i)=>(
                        <span key={i} className="bg-white text-purple-700 text-[8px] md:text-[10px] px-1 md:px-2 py-0.5 rounded-full border border-purple-200">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Freelancer skills in popup */}
              <div className="mb-2 md:mb-3">
                <p className="text-[9px] md:text-xs font-semibold text-gray-700 mb-1 md:mb-2">Freelancer Skills</p>
                <SkillsBadges
                  skills={
                    parseSkills(selectedProposal.skills).length > 0
                      ? selectedProposal.skills
                      : (selectedProposal.collaborator_skills || selectedProposal.profile_skills || selectedProposal.freelancer_skills || [])
                  }
                  variant="purple"
                  max={999}
                />
              </div>

              {/* Payment / cover letter */}
              <div className="grid grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-4">
                {selectedProposal.payment_type === "milestone" ? (
                  <div className="border border-purple-200 rounded-lg p-1.5 md:p-2 bg-purple-50">
                    <div className="flex items-center gap-0.5 md:gap-1 mb-0.5 md:mb-1">
                      <svg className="w-2.5 h-2.5 md:w-3 md:h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                      <p className="font-semibold text-purple-900 text-[9px] md:text-xs">Milestones</p>
                    </div>
                    <p className="text-[8px] md:text-xs text-gray-600">
                      {(() => {
                        let count = 0;
                        if (selectedProposal.milestones_data) { count = parseMilestones(selectedProposal.milestones_data).length; }
                        else if (selectedProposal.milestone_description) { try { const p=JSON.parse(selectedProposal.milestone_description); count=Array.isArray(p)?p.length:1; } catch { count=1; } }
                        return `${count} · ₹${selectedProposal.bid_amount}`;
                      })()}
                    </p>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-1.5 md:p-2 bg-gray-50 flex items-center justify-center">
                    <p className="text-[8px] md:text-xs text-gray-500">Project based</p>
                  </div>
                )}
                {selectedProposal.cover_letter ? (
                  <div className="border border-gray-200 rounded-lg p-1.5 md:p-2 bg-gray-50">
                    <div className="flex items-center gap-0.5 md:gap-1 mb-0.5 md:mb-1">
                      <svg className="w-2.5 h-2.5 md:w-3 md:h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                      <p className="font-semibold text-gray-700 text-[9px] md:text-xs">Cover Letter</p>
                    </div>
                    <p className="text-[8px] md:text-xs text-gray-700 leading-relaxed line-clamp-2">{selectedProposal.cover_letter}</p>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-1.5 md:p-2 bg-gray-50 flex items-center justify-center">
                    <p className="text-[8px] md:text-xs text-gray-500">No cover letter</p>
                  </div>
                )}
              </div>

              {/* Attachments Section */}
              {selectedProposal.attachments && selectedProposal.attachments.length > 0 && (
                <div className="mb-3 md:mb-4">
                  <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <p className="font-semibold text-gray-700 text-[11px] md:text-sm">Attachments ({selectedProposal.attachments.length})</p>
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    {selectedProposal.attachments.map((attachment, idx) => {
                      const fullFilename = attachment.split('/').pop();
                      let displayName = fullFilename;
                      const parts = fullFilename.split('_');
                      if (parts.length >= 3 && parts[0] === String(selectedProposal.id)) {
                        displayName = parts.slice(2).join('_');
                      }
                      
                      return (
                        <div 
                          key={idx} 
                          className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all group"
                        >
                          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                            {getFileIcon(displayName)}
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] md:text-sm font-medium text-gray-800 truncate" title={displayName}>
                                {displayName.length > 20 ? displayName.substring(0, 20) + '...' : displayName}
                              </p>
                              <p className="text-[8px] md:text-xs text-gray-400">Attachment</p>
                            </div>
                          </div>
                          <button
                            onClick={() => downloadAttachment(selectedProposal.id, attachment)}
                            className="ml-2 md:ml-3 px-2 md:px-3 py-1 text-[9px] md:text-xs font-medium text-blue-600 bg-white rounded-md border border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition flex items-center gap-1"
                          >
                            <svg className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 md:gap-3 pt-2 md:pt-3 border-t border-gray-200">
                <button onClick={()=>acceptProposal(selectedProposal.id)} className="flex-1 py-1.5 md:py-2 rounded-lg bg-gradient-to-r from-[#51218F] to-[#2a0e4a] text-white font-semibold text-[11px] md:text-sm hover:shadow-lg transition btn-mobile">Accept</button>
                <button onClick={()=>rejectProposal(selectedProposal.id)} className="flex-1 py-1.5 md:py-2 rounded-lg border-2 border-red-500 text-red-500 font-semibold text-[11px] md:text-sm hover:bg-red-50 transition btn-mobile">Reject</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          INVITATION REVIEW POPUP  — scrollbar hidden
      ══════════════════════════════════════════════════════════════════════ */}
      {showInvitationPopup && selectedInvitation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 md:p-4">
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-hide">

            <div className="bg-gradient-to-r from-[#51218F] to-[#2a0e4a] px-3 md:px-5 py-2 sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base md:text-lg font-bold text-white">Invitation Details</h3>
                  <p className="text-purple-200 text-[10px] md:text-xs">Review invitation sent to collaborator</p>
                </div>
                <button onClick={()=>{setShowInvitationPopup(false);setSelectedInvitation(null);}} className="text-white hover:bg-white/20 rounded-full p-1 transition">
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>

            <div className="p-3 md:p-5">
              {/* Profile */}
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <img src={buildProfileImageUrl(selectedInvitation.receiver_profile_pic)} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-purple-200" alt={selectedInvitation.receiver_name} onError={(e)=>{e.target.src=UserImg;}}/>
                <div className="flex-1">
                  <h4 className="font-bold text-base md:text-lg text-gray-900 mobile-text-base">{selectedInvitation.receiver_name||"Collaborator"}</h4>
                  <p className="text-[11px] md:text-sm text-gray-600 mobile-text-xs">{selectedInvitation.receiver_skill_category||"Collaborator"}</p>
                  <span className={`inline-flex items-center gap-0.5 md:gap-1 px-1 md:px-2 py-0.5 rounded-full text-[8px] md:text-[10px] font-semibold mt-0.5 md:mt-1 ${
                    selectedInvitation.status?.toLowerCase()==="accepted"?"bg-green-100 text-green-700":
                    selectedInvitation.status?.toLowerCase()==="pending"?"bg-yellow-100 text-yellow-700":"bg-gray-100 text-gray-600"
                  }`}>
                    <span className={`w-1 h-1 rounded-full ${
                      selectedInvitation.status?.toLowerCase()==="accepted"?"bg-green-500":
                      selectedInvitation.status?.toLowerCase()==="pending"?"bg-yellow-500":"bg-gray-500"
                    }`}/>
                    {selectedInvitation.status||"Pending"}
                  </span>
                </div>
              </div>

              {/* Collaborator skills in popup */}
              {(() => {
                const collabSkills = parseSkills(
                  selectedInvitation.receiver_skills ||
                  selectedInvitation.collaborator_skills ||
                  selectedInvitation.receiver_profile_skills ||
                  []
                );
                return collabSkills.length > 0 ? (
                  <div className="mb-2 md:mb-3">
                    <p className="text-[9px] md:text-xs font-semibold text-gray-700 mb-1 md:mb-2">Collaborator Skills</p>
                    <SkillsBadges skills={collabSkills} variant="gray" max={999}/>
                  </div>
                ) : null;
              })()}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-1 md:gap-2 mb-3 md:mb-4">
                <div className="bg-purple-50 p-1.5 md:p-2 rounded-lg text-center">
                  <p className="text-[9px] md:text-xs text-purple-600 font-semibold">Budget</p>
                  <p className="text-sm md:text-base font-bold text-gray-900 mobile-text-sm">{formatEarnings(selectedInvitation.revenue)}</p>
                </div>
                <div className="bg-blue-50 p-1.5 md:p-2 rounded-lg text-center">
                  <p className="text-[9px] md:text-xs text-blue-600 font-semibold">Invitation Date</p>
                  <p className="text-[10px] md:text-sm font-bold text-blue-700 mobile-text-xs">{selectedInvitation.date||"Not specified"}</p>
                </div>
                <div className="bg-gray-50 p-1.5 md:p-2 rounded-lg text-center">
                  <p className="text-[9px] md:text-xs text-gray-600 font-semibold">Job ID</p>
                  <p className="text-[10px] md:text-sm font-bold text-gray-700 mobile-text-xs">#{selectedInvitation.job_id||"N/A"}</p>
                </div>
              </div>

              {/* Job details */}
              {selectedInvitation.job_details && (
                <div className="mb-3 md:mb-4 p-2 md:p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    <p className="font-semibold text-purple-900 text-[11px] md:text-sm">Job Details</p>
                  </div>
                  <p className="text-[11px] md:text-sm font-bold text-gray-900 mobile-text-xs">{selectedInvitation.job_details.title||selectedInvitation.project_name}</p>
                  <p className="text-[9px] md:text-xs text-gray-700 mt-0.5 md:mt-1 line-clamp-2">{selectedInvitation.job_details.description||"No description"}</p>
                  {selectedInvitation.job_details.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 md:gap-1 mt-1 md:mt-2">
                      {selectedInvitation.job_details.skills.slice(0,3).map((s,i)=>(
                        <span key={i} className="bg-white text-purple-700 text-[8px] md:text-[10px] px-1 md:px-2 py-0.5 rounded-full border border-purple-200">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Meta */}
              <div className="grid grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-4">
                <div className="border border-gray-200 rounded-lg p-1.5 md:p-2">
                  <p className="text-[8px] md:text-xs text-gray-500 flex items-center gap-0.5 md:gap-1">
                    <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    Sent Date
                  </p>
                  <p className="text-[10px] md:text-sm font-medium text-gray-700 mt-0.5">{selectedInvitation.created_at?new Date(selectedInvitation.created_at).toLocaleDateString():"N/A"}</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-1.5 md:p-2">
                  <p className="text-[8px] md:text-xs text-gray-500 flex items-center gap-0.5 md:gap-1">
                    <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    Invited By
                  </p>
                  <p className="text-[10px] md:text-sm font-medium text-gray-700 mt-0.5">{selectedInvitation.client_name||"Client"}</p>
                </div>
              </div>

              {selectedInvitation.status?.toLowerCase() === "pending" && (
                <div className="flex gap-2 md:gap-3 pt-2 md:pt-3 border-t border-gray-200">
                  <button onClick={()=>openRevokeInviteConfirm(selectedInvitation.id)} className="flex-1 py-1.5 md:py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-[11px] md:text-sm hover:shadow-lg transition btn-mobile">Revoke Invitation</button>
                </div>
              )}
              {selectedInvitation.status?.toLowerCase() === "accepted" && (
                <div className="pt-2 md:pt-3 border-t border-gray-200">
                  <div className="py-1.5 md:py-2 rounded-lg bg-green-100 text-green-700 font-semibold text-[11px] md:text-sm text-center">✓ Invitation Accepted — Contract Created</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════ REVOKE ACCEPTANCE CONFIRM ══════════ */}
      {showRevokeConfirm && revokingProposal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 md:p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#51218F] to-[#2a0e4a] p-4 md:p-5 text-center">
              <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-1 md:mb-2 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white">Revoke Acceptance</h3>
              <p className="text-purple-200 text-[11px] md:text-sm mt-0.5 md:mt-1">This action cannot be undone</p>
            </div>
            <div className="p-4 md:p-5">
              <p className="text-gray-700 text-center mb-1 md:mb-2 font-medium text-sm md:text-base">Are you sure you want to revoke this acceptance?</p>
              <p className="text-[11px] md:text-sm text-gray-500 text-center mb-4 md:mb-5">The contract will be deleted and the proposal will be marked as submitted again.</p>
              <div className="flex gap-2 md:gap-3">
                <button onClick={()=>{setShowRevokeConfirm(false);setRevokingProposal(null);}} className="flex-1 px-3 md:px-4 py-1.5 md:py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold text-[11px] md:text-sm hover:bg-gray-50 transition btn-mobile">Cancel</button>
                <button onClick={()=>revokeAcceptance(revokingProposal)} className="flex-1 px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-[11px] md:text-sm hover:shadow-lg transition btn-mobile">Yes, Revoke</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ REVOKE INVITATION CONFIRM ══════════ */}
      {showRevokeInviteConfirm && revokingInvitation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 md:p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#51218F] to-[#2a0e4a] p-4 md:p-5 text-center">
              <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-1 md:mb-2 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white">Revoke Invitation</h3>
              <p className="text-purple-200 text-[11px] md:text-sm mt-0.5 md:mt-1">This action cannot be undone</p>
            </div>
            <div className="p-4 md:p-5">
              <p className="text-gray-700 text-center mb-1 md:mb-2 font-medium text-sm md:text-base">Are you sure you want to revoke this invitation?</p>
              <p className="text-[11px] md:text-sm text-gray-500 text-center mb-4 md:mb-5">The collaborator will no longer be able to accept this invitation.</p>
              <div className="flex gap-2 md:gap-3">
                <button onClick={()=>{setShowRevokeInviteConfirm(false);setRevokingInvitation(null);}} className="flex-1 px-3 md:px-4 py-1.5 md:py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold text-[11px] md:text-sm hover:bg-gray-50 transition btn-mobile">Cancel</button>
                <button onClick={()=>revokeInvitation(revokingInvitation)} className="flex-1 px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-[11px] md:text-sm hover:shadow-lg transition btn-mobile">Yes, Revoke</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}