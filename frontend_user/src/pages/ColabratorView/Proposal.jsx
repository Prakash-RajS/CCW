import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import api from "../../utils/axiosConfig";
import TopBanner from "../../assets/Colabwork/banner.png";
import Footer from "../../component/Footer";
import ColHeader from "../../component/ColHeader";
import toast from "../../component/Toast";

export default function Proposal() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData } = useUser();

  // Job & proposal state
  const [job, setJob] = useState(null);
  const [creator, setCreator] = useState(null);
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);

  // Creator details
  const [creatorJobsCount, setCreatorJobsCount] = useState(0);
  const [creatorJoinedDate, setCreatorJoinedDate] = useState(null);
  const [creatorCountryCode, setCreatorCountryCode] = useState(null);
  const [creatorLocationName, setCreatorLocationName] = useState(null);
  const [creatorPhoneVerified, setCreatorPhoneVerified] = useState(false);
  const [creatorEmailVerified, setCreatorEmailVerified] = useState(false);
  const [creatorName, setCreatorName] = useState(null);
  const [creatorProfilePic, setCreatorProfilePic] = useState(null);
  const [hiredCount, setHiredCount] = useState(0);
  const [completedProjects, setCompletedProjects] = useState(0);
  const [creatorRating, setCreatorRating] = useState(0);
  const [creatorReviewsCount, setCreatorReviewsCount] = useState(0);
  const [reviews, setReviews] = useState([]);

  // Proposal revocation popup
  const [showPopup, setShowPopup] = useState(false);
  const [isRevoked, setIsRevoked] = useState(false);

  // Messaging state
  const [messageInput, setMessageInput] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [lastMessageSent, setLastMessageSent] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const fileInputRef = useRef(null);
  const gifInputRef = useRef(null);

  // ========== POPUP OVERFLOW HANDLING ==========
  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [showPopup]);

  // ========== FETCH JOB & CREATOR DETAILS ==========
  const fetchJobDetails = async (jobId) => {
    setLoading(true);
    try {
      const response = await api.get(`/collaborator/jobs/${jobId}`);
      const jobData = response.data || {};
      const creatorData = jobData.creator || {};
      setJob(jobData);
      setCreator(creatorData);
      if (creatorData.country) setCreatorLocationName(creatorData.country);
      if (creatorData.country_code) setCreatorCountryCode(creatorData.country_code);
      if (creatorData.full_name) setCreatorName(creatorData.full_name);
      const creatorId = jobData.employer_id || creatorData.id;
      if (creatorId) await fetchCreatorDetails(creatorId);
    } catch (error) {
      console.error("Error fetching job details:", error);
      toast.error("Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  const fetchCreatorDetails = async (creatorId) => {
    if (!creatorId) return;
    try {
      const response = await api.get(`/creator/get/${creatorId}`);
      const d = response.data;
      if (d.joined_date) setCreatorJoinedDate(d.joined_date);
      else if (d.created_at) setCreatorJoinedDate(d.created_at);
      if (!creatorLocationName) {
        if (d.country) setCreatorLocationName(d.country);
        else if (d.location) setCreatorLocationName(d.location);
      }
      if (!creatorCountryCode && d.country_code) setCreatorCountryCode(d.country_code);
      if (d.full_name) setCreatorName(d.full_name);
      if (d.phone_verified !== undefined) setCreatorPhoneVerified(d.phone_verified);
      if (d.email_verified !== undefined) setCreatorEmailVerified(d.email_verified);
      if (d.profile_picture) setCreatorProfilePic(d.profile_picture);
      setCreatorRating(d.rating || 0);
      setCreatorReviewsCount(d.reviews_count || 0);
      if (d.reviews && Array.isArray(d.reviews)) setReviews(d.reviews);
      else if (d.review_data && Array.isArray(d.review_data)) setReviews(d.review_data);
      else setReviews([]);
      setCreatorJobsCount(d.total_jobs_posted || d.jobs_count || 0);

      try {
        const jobsRes = await api.get(`/jobs/my-jobs/${creatorId}?status=posted`);
        if (jobsRes.data?.count !== undefined) setCreatorJobsCount(jobsRes.data.count);
        else if (Array.isArray(jobsRes.data?.jobs)) setCreatorJobsCount(jobsRes.data.jobs.length);
      } catch (_) { }

      try {
        const statsRes = await api.get(`/contracts/status-counts?user_id=${creatorId}`);
        setHiredCount(statsRes.data?.completed || 0);
        setCompletedProjects(statsRes.data?.completed || 0);
      } catch (_) { }
    } catch (error) {
      console.error("Error fetching creator details:", error);
    }
  };

  const fetchFullProposal = async (proposalId) => {
    try {
      const response = await api.get(`/proposals/${proposalId}`);
      const data = response.data;
      if (!data.milestones_data && data.milestone_description && data.milestone_description.startsWith('[')) {
        try {
          data.milestones_data = JSON.parse(data.milestone_description);
        } catch (e) {
          console.error("Failed to parse milestones from description", e);
        }
      }
      return data;
    } catch (error) {
      console.error("Failed to fetch proposal details", error);
      toast.error("Could not load proposal details");
      return null;
    }
  };

  // ========== ATTACHMENT HANDLER ==========
 const handleAttachmentDownload = async (att, type = 'job') => {
  try {
    const filename = getAttachmentFileName(att);
    const loadingToast = toast.loading("Preparing download...");
    
    // ✅ Get the download URL from backend
    let response;
    
    if (type === 'job' || att.includes('job_attachments/')) {
      response = await api.get(`/jobs/download-attachment/${job?.id}/${filename}`);
    } else if (type === 'proposal' || att.includes('proposal_attachments/')) {
      response = await api.get(`/proposals/download-attachment/${proposal?.id}/${filename}`);
    } else {
      if (proposal?.id) {
        response = await api.get(`/proposals/download-attachment/${proposal?.id}/${filename}`);
      } else if (job?.id) {
        response = await api.get(`/jobs/download-attachment/${job?.id}/${filename}`);
      } else {
        toast.dismiss(loadingToast);
        toast.error("No ID found for attachment");
        return;
      }
    }
    
    toast.dismiss(loadingToast);
    
    if (response.data && response.data.download_url) {
      // ✅ SIMPLE APPROACH: Just open the URL in a new tab
      // The browser will handle download/view
      window.open(response.data.download_url, '_blank');
      toast.success('Opening file...');
      return;
    }
    
    // ✅ Handle blob response (local mode)
    if (response.data instanceof Blob) {
      const blobUrl = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      toast.success(`Downloaded ${filename}`);
      return;
    }
    
    toast.error('Unexpected response format');
    
  } catch (error) {
    console.error('Download error:', error);
    toast.error('Failed to download file');
  }
};

  // ========== HELPER FUNCTIONS ==========
  const getAttachmentUrl = (att) => {
    if (!att) return null;
    if (att.startsWith('http://') || att.startsWith('https://')) {
      return att;
    }
    const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
    let clean = att.replace(/^\/+/, "");
    if (clean.startsWith('media/')) {
      return `${baseUrl}/${clean}`;
    }
    if (clean.startsWith('job_attachments/')) {
      const filename = clean.split('/').pop();
      return `${baseUrl}/jobs/download-attachment/${job?.id}/${filename}`;
    }
    if (clean.startsWith('proposal_attachments/')) {
      const filename = clean.split('/').pop();
      return `${baseUrl}/proposals/download-attachment/${proposal?.id || job?.id}/${filename}`;
    }
    return `${baseUrl}/media/${clean}`;
  };

  const getAttachmentFileName = (att) => {
    if (!att) return "Attachment";
    if (att.startsWith('http://') || att.startsWith('https://')) {
      const urlParts = att.split('/');
      const filename = urlParts[urlParts.length - 1];
      return filename.split('?')[0] || "Attachment";
    }
    return att.split("/").pop() || "Attachment";
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Recently";
    try {
      const diffMs = new Date() - new Date(dateString);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      if (diffHours < 1) return "Recently";
      if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
      if (diffDays === 1) return "1 day ago";
      if (diffDays < 7) return `${diffDays} days ago`;
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  const formatBudget = () => {
    if (!job) return "₹0.00";
    const isFixed = job.budget_type === "fixed" || job.budget_type === "Fixed";
    if (isFixed) {
      const amount = job.budget_to || job.budget_from;
      return amount ? `₹${amount}` : "₹0.00";
    }
    if (job.budget_from && job.budget_to) {
      return `₹${job.budget_from} - ₹${job.budget_to}`;
    }
    if (job.budget_from) return `₹${job.budget_from}`;
    if (job.budget_to) return `₹${job.budget_to}`;
    return "₹0.00";
  };

  const formatDate = (d) => {
    if (!d) return null;
    try {
      return new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return null;
    }
  };

  const calculateEndDate = () => {
    if (job?.end_date) return formatDate(job.end_date);
    const startDate = job?.start_date
      ? new Date(job.start_date)
      : job?.created_at
        ? new Date(job.created_at)
        : null;
    if (!startDate || !job?.duration) return null;
    const duration = job.duration.toLowerCase();
    const numbers = duration.match(/\d+/);
    if (!numbers) return null;
    const value = parseInt(numbers[0]);
    let daysToAdd = 30;
    if (duration.includes("day")) daysToAdd = value;
    else if (duration.includes("week")) daysToAdd = value * 7;
    else if (duration.includes("month")) daysToAdd = value * 30;
    else if (duration.includes("year")) daysToAdd = value * 365;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + daysToAdd);
    return formatDate(endDate);
  };

  const getJobSkills = () => {
    if (!job) return [];
    const skills = job.skills || job.skills_required || job.required_skills || [];
    if (typeof skills === "string") {
      try {
        const p = JSON.parse(skills);
        return Array.isArray(p) ? p : [skills];
      } catch {
        return skills.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }
    return Array.isArray(skills) ? skills : [];
  };

  // ========== LOAD DATA ==========
  useEffect(() => {
    const loadData = async () => {
      let jobId = null;
      let proposalId = null;
      if (location.state?.jobId) {
        jobId = location.state.jobId;
        proposalId = location.state.proposalId || null;
      } else if (location.state?.job) {
        const jobData = location.state.job;
        setJob(jobData);
        setCreator(jobData.creator || jobData.employer || null);
        proposalId = location.state.proposalId || null;
        const id = jobData.employer_id || jobData.creator?.id;
        if (id) await fetchCreatorDetails(id);
        else setLoading(false);
        if (proposalId) {
          const fullProposal = await fetchFullProposal(proposalId);
          if (fullProposal) setProposal(fullProposal);
        }
        setLoading(false);
        return;
      } else {
        toast.error("No job information found");
        navigate("/col-home");
        return;
      }
      if (jobId) await fetchJobDetails(jobId);
      if (proposalId) {
        const fullProposal = await fetchFullProposal(proposalId);
        if (fullProposal) setProposal(fullProposal);
      }
      setLoading(false);
    };
    loadData();
  }, [location.state, navigate]);

  // ========== PROPOSAL ACTIONS ==========
  const handleSubmitProposal = () => {
    navigate("/Uploadux", {
      state: {
        jobId: job?.id,
        jobTitle: job?.title,
        budget: job?.budget,
        budget_type: job?.budget_type,
        budget_from: job?.budget_from,
        budget_to: job?.budget_to,
      },
    });
  };

  const handleChangeTerms = async () => {
    if (!proposal?.id) {
      toast.error("No proposal found");
      return;
    }
    try {
      const response = await api.get(`/proposals/${proposal.id}`);
      const fullProposal = response.data;
      let milestonesData = [];
      if (fullProposal.milestones_data) {
        milestonesData = fullProposal.milestones_data;
      } else if (
        fullProposal.milestone_description &&
        fullProposal.milestone_description.startsWith("[")
      ) {
        try {
          milestonesData = JSON.parse(fullProposal.milestone_description);
        } catch (e) {
          console.error("Failed to parse milestones", e);
        }
      }
      navigate("/Uploadux", {
        state: {
          jobId: job?.id,
          jobTitle: job?.title,
          budget: job?.budget,
          budget_from: job?.budget_from,
          budget_to: job?.budget_to,
          budget_type: job?.budget_type,
          isEditing: true,
          proposalData: {
            id: fullProposal.id,
            cover_letter: fullProposal.cover_letter,
            bid_amount: fullProposal.bid_amount,
            duration: fullProposal.duration,
            payment_type: fullProposal.payment_type,
            milestones_data: milestonesData,
            milestone_description: fullProposal.milestone_description,
            milestone_due_date: fullProposal.milestone_due_date,
            milestone_amount: fullProposal.milestone_amount,
            job_id: job?.id,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching proposal for edit:", error);
      toast.error("Failed to load proposal data for editing");
    }
  };

  const handleRevokeClick = () => setShowPopup(true);
  const handleCancelClick = () => setShowPopup(false);

  const handleConfirmRevoke = async () => {
    if (!proposal?.id) {
      toast.error("No proposal to revoke");
      return;
    }
    try {
      await api.delete(`/proposals/WithdrawProposal/${proposal.id}`);
      setIsRevoked(true);
      setShowPopup(false);
      toast.success("Proposal revoked successfully");
      setProposal((prev) => ({ ...prev, status: "revoked" }));
    } catch (error) {
      console.error("Revoke error:", error);
      toast.error("Failed to revoke proposal");
    }
  };

  // ========== MESSAGING ==========
  const checkConversation = async () => {
    if (!userData?.id || !creator?.id) return;
    try {
      const response = await api.get(`/message/conversation/${userData.id}/${creator.id}`);
      setConversationId(response.data.conversation_id);
      setOtherUserOnline(response.data.other_user_online || false);
      setOtherUserTyping(response.data.other_user_typing || false);
      if (response.data.conversation_id) setChatStarted(true);
    } catch (error) {
      console.error("Error checking conversation:", error);
    }
  };

  useEffect(() => {
    if (userData?.id && creator?.id) {
      checkConversation();
      const interval = setInterval(checkConversation, 3000);
      return () => clearInterval(interval);
    }
  }, [userData, creator]);

  const sendTypingStatus = async (isTyping) => {
    if (!userData?.id || !creator?.id) return;
    try {
      await api.post("/message/typing", {
        user_id: userData.id,
        chat_with: creator.id,
        is_typing: isTyping,
      });
    } catch (error) {
      console.error("Typing status error:", error);
    }
  };

  const handleFileSelect = () => fileInputRef.current?.click();
  const handleGifSelect = () => gifInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size should be less than 10MB");
      return;
    }
    setSelectedFile(file);
    setSelectedFileName(file.name);
    toast.info(`File selected: ${file.name}. Click send to upload.`);
    e.target.value = "";
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setSelectedFileName("");
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() && !selectedFile) return;
    const receiverId = creator?.id || job?.employer_id;
    if (!userData?.id || !job?.id || !receiverId) {
      toast.error("Missing required data");
      return;
    }

    setIsSendingMessage(true);
    try {
      let response;
      if (selectedFile) {
        const formData = new FormData();
        formData.append("job_id", String(job.id));
        formData.append("sender_id", String(userData.id));
        formData.append("file", selectedFile);
        if (messageInput.trim()) formData.append("content", messageInput.trim());
        response = await api.post("/message/send-for-proposal", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setLastMessageSent({
          content: messageInput.trim() || `Sent a file: ${selectedFile.name}`,
          timestamp: new Date().toISOString(),
          file: selectedFile.name,
        });
        clearSelectedFile();
      } else {
        const formData = new URLSearchParams();
        formData.append("job_id", String(job.id));
        formData.append("sender_id", String(userData.id));
        formData.append("content", messageInput.trim());
        response = await api.post("/message/send-for-proposal", formData, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        setLastMessageSent({
          content: messageInput.trim(),
          timestamp: new Date().toISOString(),
        });
      }
      setMessageInput("");
      sendTypingStatus(false);
      toast.success("Message sent successfully!");
      const targetReceiverId = response.data.receiver_id || receiverId;
      setTimeout(() => {
        navigate("/message", { state: { jobId: job.id, receiverId: targetReceiverId } });
      }, 500);
    } catch (error) {
      console.error("Send failed", error);
      toast.error("Failed to send message");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleMessageInputChange = (e) => {
    setMessageInput(e.target.value);
    sendTypingStatus(e.target.value.length > 0);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const displayLocation = creatorLocationName || creator?.country || "Remote";
  const displayName = creatorName || creator?.full_name || creator?.name || "Client";
  const calculatedEndDate = calculateEndDate();
  const displayStartDate = formatDate(job?.start_date) || formatDate(job?.created_at) || "—";
  const jobSkills = getJobSkills();

  if (loading) {
    return (
      <div className="w-full bg-[#F5F5F5] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#F5F5F5] min-h-screen">
      <div className="relative w-full h-[380px] md:h-[460px] xl:h-[500px]">
        <div className="absolute top-0 left-0 w-full z-50"><ColHeader /></div>
        <img src={TopBanner} alt="banner" className="absolute inset-0 w-full h-full object-cover blur-[1px]" />
      </div>

      <div className="flex justify-center">
        <div className="relative w-full max-w-[1100px] mx-4 sm:mx-6 -mt-[210px] lg:-mt-[260px] bg-white border border-gray-200 shadow-sm mb-10">
          <div className="border-b border-gray-100 px-6 md:px-8 pt-4 pb-3">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 group">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-r from-[#51218F] to-[#2a0e4a] group-hover:opacity-80 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </div>
              <span className="font-semibold text-[14px] text-[#51218F] group-hover:text-[#3d1768]">Back</span>
            </button>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* LEFT COLUMN */}
            <div className="flex-1 min-w-0 px-6 md:px-8 py-6">
              <div className="flex justify-between items-start gap-4 mb-1">
                <h2 className="text-[22px] sm:text-[26px] font-bold leading-snug text-gray-900">
                  {job?.title || "Job Title"}
                </h2>
                <div className="text-right shrink-0">
                  <p className="text-[18px] font-bold text-gray-900">{formatBudget()} USD</p>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide mt-0.5">
                    {job?.budget_type === "fixed" ? "Fixed Price" : job?.budget_type || "Hourly Rate"}
                  </p>
                </div>
              </div>

              {proposal && (
                <div className="mt-2 mb-3 inline-flex items-center gap-2">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    ✓ Proposal Submitted
                  </span>
                  {proposal.status === 'submitted' && (
                    <span className="text-xs text-gray-500">Pending client review</span>
                  )}
                </div>
              )}

              <p className="text-[13px] text-gray-400 mb-5">Posted {formatTimeAgo(job?.created_at)}</p>
              <p className="text-[15px] leading-[26px] text-gray-700 mb-5 whitespace-pre-wrap">
                {job?.description || "No description available"}
              </p>

              {jobSkills.length > 0 && (
                <div className="mb-6">
                  <p className="text-[14px] font-semibold text-gray-700 mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {jobSkills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-[13px] text-gray-700 border border-gray-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-x-8 gap-y-5 mb-6 p-5 bg-gray-50 rounded-lg border border-gray-100">
                {job?.expertise_level && (
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Experience Level</p>
                    <p className="text-[15px] font-semibold text-gray-800 capitalize">{job.expertise_level}</p>
                  </div>
                )}
                {job?.duration && (
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Duration</p>
                    <p className="text-[15px] font-semibold text-gray-800">{job.duration}</p>
                  </div>
                )}
                {job?.timeline && (
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Project Size</p>
                    <p className="text-[15px] font-semibold text-gray-800 capitalize">{job.timeline}</p>
                  </div>
                )}
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Start Date</p>
                  <p className="text-[15px] font-semibold text-gray-800">{displayStartDate}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">End Date</p>
                  <p className="text-[15px] font-semibold text-gray-800">{calculatedEndDate || "—"}</p>
                </div>
                {job?.created_at && (
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Posted On</p>
                    <p className="text-[15px] font-semibold text-gray-800">{formatDate(job.created_at)}</p>
                  </div>
                )}
                {job?.updated_at && (
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Last Updated</p>
                    <p className="text-[15px] font-semibold text-gray-800">{formatDate(job.updated_at)}</p>
                  </div>
                )}
              </div>

{(() => {
  const hasWorkAtt = !!job?.work_attachment;
  const hasExtLink = !!job?.external_file_link;
  const hasAtts = Array.isArray(job?.attachments) && job.attachments.length > 0;
  
  // ✅ REMOVED: hasProposalAtts - we don't want to show proposal attachments
  
  if (!hasWorkAtt && !hasExtLink && !hasAtts) return null;
  
  return (
    <>
      <div className="h-px bg-gray-100 mb-4"></div>
      <div className="mb-4">
        <p className="text-[14px] font-semibold text-gray-700 mb-2">Attachments</p>
        <div className="flex flex-col gap-2">
          {hasExtLink && (
            <a href={job.external_file_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[13px] text-[#5B2D91] hover:underline">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              View External File
            </a>
          )}
          
          {hasWorkAtt && (
            <button 
              onClick={() => handleAttachmentDownload(job.work_attachment, 'job')}
              className="flex items-center gap-2 text-[13px] text-[#5B2D91] hover:underline text-left"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {getAttachmentFileName(job.work_attachment)}
            </button>
          )}
          
          {hasAtts && job.attachments.map((att, i) => (
            <button 
              key={`job-att-${i}`} 
              onClick={() => handleAttachmentDownload(att, 'job')}
              className="flex items-center gap-2 text-[13px] text-[#5B2D91] hover:underline text-left"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {getAttachmentFileName(att)}
            </button>
          ))}
        </div>
      </div>
    </>
  );
})()}

              {/* PROPOSAL ACTION BUTTONS */}
              <div className="hidden sm:flex gap-4 mt-6">
                {!proposal ? (
                  <button onClick={handleSubmitProposal} className="bg-[#5B2D91] text-white px-6 py-3 rounded-full text-[14px] font-semibold hover:bg-[#4a2373] transition-colors">
                    Submit Proposal
                  </button>
                ) : (
                  <button onClick={handleChangeTerms} className="bg-[#5B2D91] text-white px-6 py-3 rounded-full text-[14px] font-semibold hover:bg-[#4a2373] transition-colors">
                    Change terms
                  </button>
                )}
                {proposal && !isRevoked && (
                  <button
                    onClick={handleRevokeClick}
                    className="bg-red-600 text-white px-6 py-3 rounded-full text-[14px] font-semibold hover:bg-red-700 transition-colors"
                  >
                    Revoke proposal
                  </button>
                )}
                {isRevoked && (
                  <button className="text-[14px] font-semibold px-6 py-3 rounded-full text-gray-500 bg-gray-100 cursor-not-allowed border border-gray-300" disabled>
                    Proposal Revoked
                  </button>
                )}
              </div>

              {/* Mobile action buttons */}
              <div className="sm:hidden flex flex-col gap-4 mt-6">
                {!proposal ? (
                  <button onClick={handleSubmitProposal} className="bg-[#5B2D91] text-white py-3 w-full rounded-full text-[14px] font-semibold">
                    Submit Proposal
                  </button>
                ) : (
                  <button onClick={handleChangeTerms} className="bg-[#5B2D91] text-white py-3 w-full rounded-full text-[14px] font-semibold">
                    Change terms
                  </button>
                )}
                {proposal && !isRevoked && (
                  <button
                    onClick={handleRevokeClick}
                    className="bg-red-600 text-white w-full py-3 rounded-full text-[14px] font-semibold hover:bg-red-700 transition-colors"
                  >
                    Revoke proposal
                  </button>
                )}
                {isRevoked && (
                  <button className="w-full py-3 text-[14px] font-semibold rounded-full text-gray-500 bg-gray-100 cursor-not-allowed border border-gray-300" disabled>
                    Proposal Revoked
                  </button>
                )}
              </div>
            </div>

            {/* Vertical divider */}
            <div className="hidden lg:block w-px bg-gray-100 shrink-0"></div>

            {/* RIGHT SIDEBAR */}
            <div className="w-full lg:w-[270px] shrink-0 px-6 py-6 border-t lg:border-t-0 border-gray-100">
              <div>
                <h3 className="text-[15px] font-bold mb-3 text-gray-800">About the Client</h3>
                <div className="flex items-center gap-3 mb-3">
                  {creatorProfilePic ? (
                    <img src={creatorProfilePic} alt={displayName} className="w-10 h-10 rounded-full object-cover border border-gray-200" onError={(e) => (e.target.style.display = "none")} />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#5B2D91] flex items-center justify-center text-white font-bold text-[15px]">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <p className="text-[15px] font-bold text-gray-900">{displayName}</p>
                </div>
                <div className="space-y-2 text-[13px] text-gray-600 mb-5">
                  <div className="flex items-center gap-2">
                    {creatorCountryCode ? (
                      <img src={`https://flagcdn.com/w20/${creatorCountryCode.toLowerCase()}.png`} alt={displayLocation} className="w-[16px] h-[11px] rounded-sm object-cover" onError={(e) => (e.target.style.display = "none")} />
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 8v4l3 3" />
                      </svg>
                    )}
                    <span className="font-medium">{displayLocation}</span>
                  </div>
                  {creatorJoinedDate && (
                    <div className="flex items-center gap-2">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span>Joined {formatDate(creatorJoinedDate)}</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {[
                    { label: "Jobs Posted", value: creatorJobsCount },
                    { label: "Hired", value: hiredCount },
                    { label: "Completed", value: completedProjects },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                      <p className="text-[17px] font-bold text-[#51218F]">{value}</p>
                      <p className="text-[9px] text-gray-500 mt-0.5 leading-tight">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex text-[#51218F] text-sm">
                    {"★".repeat(Math.floor(creatorRating))}
                    {"☆".repeat(5 - Math.floor(creatorRating))}
                  </div>
                  <span className="text-[13px] text-gray-600">{creatorRating.toFixed(1)} ({creatorReviewsCount} reviews)</span>
                </div>
                <div className="h-px bg-gray-100 mb-4"></div>
                <div className="space-y-2.5 text-[13px]">
                  <div className="flex items-center gap-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7l.5 2.5a2 2 0 0 1-.6 1.8l-1.2 1.2a16 16 0 0 0 6.6 6.6l1.2-1.2a2 2 0 0 1 1.8-.6l2.5.5a2 2 0 0 1 1.7 2.2Z" stroke={creatorPhoneVerified ? "#10B981" : "#D1D5DB"} strokeWidth="1.5" />
                    </svg>
                    <span className={creatorPhoneVerified ? "text-green-600 font-medium" : "text-gray-400"}>
                      {creatorPhoneVerified ? "Phone Verified" : "Phone not verified"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="5" width="18" height="14" rx="2" stroke={creatorEmailVerified ? "#10B981" : "#D1D5DB"} strokeWidth="1.5" />
                      <path d="M3 7l9 6 9-6" stroke={creatorEmailVerified ? "#10B981" : "#D1D5DB"} strokeWidth="1.5" />
                    </svg>
                    <span className={creatorEmailVerified ? "text-green-600 font-medium" : "text-gray-400"}>
                      {creatorEmailVerified ? "Email Verified" : "Email not verified"}
                    </span>
                  </div>
                </div>

                {reviews.length > 0 && (
                  <div className="mt-6">
                    <div className="h-px bg-gray-100 mb-4"></div>
                    <h4 className="text-[14px] font-bold mb-3 text-gray-800">Client Reviews</h4>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                      {reviews.slice(0, 5).map((review, idx) => (
                        <div key={idx} className="border-b border-gray-100 pb-3 last:border-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[13px] font-medium text-gray-800">{review.reviewer_name || "Anonymous"}</span>
                            <span className="text-[11px] text-gray-400">{review.date || formatDate(review.created_at)}</span>
                          </div>
                          <div className="flex text-[11px] text-[#51218F] mb-1">
                            {"★".repeat(Math.floor(review.rating))}
                            {"☆".repeat(5 - Math.floor(review.rating))}
                          </div>
                          <p className="text-[12px] text-gray-600 line-clamp-3">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                    {creatorReviewsCount > 5 && (
                      <button onClick={() => navigate(`/creator-reviews/${creator?.id}`)} className="text-[12px] text-[#5B2D91] hover:underline mt-2">
                        See all {creatorReviewsCount} reviews →
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messaging Section */}
          <div className="border-t border-gray-200 px-6 md:px-8 py-5">
            <p className="text-center text-[14px] font-medium text-black mb-3">
              Start conversations
              {otherUserOnline && (
                <span className="ml-2 inline-flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-xs text-green-600 ml-1">Online</span>
                </span>
              )}
              {otherUserTyping && <span className="ml-2 text-xs text-purple-600">typing...</span>}
            </p>

            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf,.doc,.docx,.txt" />
            <input type="file" ref={gifInputRef} onChange={handleFileChange} className="hidden" accept="image/gif" />

            {selectedFileName && (
              <div className="mb-2 px-4 py-2 bg-purple-50 rounded-full flex items-center justify-between">
                <span className="text-sm text-purple-700 truncate max-w-[200px]">📎 {selectedFileName}</span>
                <button onClick={clearSelectedFile} className="text-purple-700 hover:text-purple-900 ml-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <div className="w-full flex items-center gap-4">
              <button onClick={handleFileSelect} disabled={isSendingMessage} className="cursor-pointer focus:outline-none disabled:opacity-50" title="Attach file">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </button>
              <button onClick={handleGifSelect} disabled={isSendingMessage} className="cursor-pointer focus:outline-none disabled:opacity-50" title="Send GIF">
                <svg width="40" height="28" viewBox="0 0 40 28" fill="none">
                  <rect x="1" y="1" width="38" height="26" rx="6" stroke="#7C3AED" strokeWidth="2" />
                  <text x="9" y="19" fill="#7C3AED" fontSize="12" fontWeight="700" fontFamily="Arial, sans-serif">GIF</text>
                </svg>
              </button>
              <div className="relative flex-1 h-[48px]">
                <div className="absolute inset-0 bg-gray-100 rounded-full"></div>
                <input type="text" placeholder={chatStarted ? "Reply..." : "Type your message..."} value={messageInput} onChange={handleMessageInputChange} onKeyPress={handleKeyPress} disabled={isSendingMessage} className="relative z-10 w-full h-[48px] bg-transparent pl-5 pr-4 text-[14px] text-gray-900 placeholder:text-[#9CA3AF] focus:outline-none disabled:opacity-50" />
              </div>
              <button onClick={handleSendMessage} disabled={isSendingMessage || (!messageInput.trim() && !selectedFile)} className="cursor-pointer focus:outline-none disabled:opacity-50">
                <svg width="28" height="28" viewBox="0 0 24 24" fill={messageInput.trim() || selectedFile ? "#7C3AED" : "#9CA3AF"}>
                  <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
                </svg>
              </button>
            </div>
            {isSendingMessage && <div className="mt-2 text-xs text-purple-600 text-center">Sending...</div>}
            {lastMessageSent && (
              <div className="mt-2 text-xs text-gray-500 text-center">
                Last message sent: {new Date(lastMessageSent.timestamp).toLocaleTimeString()}
                {lastMessageSent.file && ` (${lastMessageSent.file})`}
              </div>
            )}
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md"></div>
          <div className="relative bg-white rounded-2xl max-w-sm w-full text-center shadow-xl">
            <div className="p-6">
              <p className="text-[16px] font-medium text-gray-900 mt-4">
                Are you sure you want to Revoke the proposal?
              </p>
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={handleCancelClick}
                  className="bg-[#5B2D91] text-white px-8 py-3 rounded-full text-[14px] font-semibold hover:bg-[#4a2373] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRevoke}
                  className="bg-red-600 text-white px-8 py-3 rounded-full text-[14px] font-semibold hover:bg-red-700 transition-colors"
                >
                  Revoke
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}