
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/axiosConfig";
import toast from "../../component/Toast";

/* ================== IMAGES ================== */
import ManImg from "../../assets/Landing/man.png";
import HalfCircle from "../../assets/Landing/half-circle.png";
import BigScribble from "../../assets/Landing/scribble-big.png";
import ServicesBG from "../../assets/Landing/services.png";
import Ui1 from "../../assets/Landing/ui1.png";
import Ui2 from "../../assets/Landing/ui2.png";
import Ui3 from "../../assets/Landing/ui3.png";
import Footer from "../../component/Footer";
import Header from "../../component/Header";

/* ================= API CONFIG ================= */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ================= TIMELINE NODE ================= */
const TimelineNode = ({ color }) => (
  <div className="relative w-[48px] h-[48px] flex items-center justify-center z-10">
    <svg className="absolute inset-0" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(72,33,33,1)" strokeWidth="4" strokeDasharray="10 12" strokeLinecap="round" />
    </svg>
    <div className="absolute inset-[8px] rounded-full bg-white" />
    <div className="absolute inset-[16px] rounded-full" style={{ background: color }} />
  </div>
);

/* ================= SUCCESS POPUP ================= */
const SuccessPopup = ({ isOpen, onClose, collaboratorName, jobTitle }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-[scaleIn_0.3s_ease-out]">
        <div className="bg-gradient-to-r from-[#10B981] to-[#059669] p-6 text-center">
          <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center mb-3">
            <svg className="w-12 h-12 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">Invitation Sent!</h3>
          <p className="text-white/90 text-sm">Your collaboration request has been sent successfully</p>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Sent to</p>
                <p className="font-semibold text-gray-800">{collaboratorName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Project</p>
                <p className="font-semibold text-gray-800">{jobTitle}</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 text-center mb-6">
            {collaboratorName.split(' ')[0]} will be notified about your invitation.
            You'll receive a notification when they respond.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-xl font-medium hover:from-[#059669] hover:to-[#047857] transition-all shadow-lg shadow-green-200"
            >
              Done
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

/* ================= INVITE POPUP ================= */
const InvitePopup = ({ isOpen, onClose, collaborator, currentUser, jobs, onInvite }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [invitedJobs, setInvitedJobs] = useState({});
  const [isCheckingInvites, setIsCheckingInvites] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successData, setSuccessData] = useState({ collaboratorName: '', jobTitle: '' });
  const [jobSearch, setJobSearch] = useState("");
  const dropdownRef = useRef(null);

  const activeJobs = jobs.filter(
    (job) =>
      job.status === "posted" ||
      job.status === "active"
  );

  const searchableJobs = activeJobs.filter(
    (job) =>
      job.title
        ?.toLowerCase()
        .includes(jobSearch.toLowerCase()) ||
      job.description
        ?.toLowerCase()
        .includes(jobSearch.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  // ADD THIS useEffect TO PREVENT BACKGROUND SCROLLING
  useEffect(() => {
    if (isOpen || showSuccessPopup) {
      // Lock scroll when popup is open
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      // Restore scroll when popup is closed
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen, showSuccessPopup]);

  useEffect(() => { if (!isOpen) resetForm(); }, [isOpen]);

  const resetForm = () => {
    setSearchTerm(''); setJobSearch(""); setFilteredJobs([]); setInvitedJobs({});
    setSelectedJobId(null); setIsDropdownOpen(false);
    setIsSubmitting(false); setIsCheckingInvites(false); setIsDropdownOpen(false);
  };

  const getCollaboratorId = () => collaborator?.id || collaborator?.user_id || collaborator?.userId;

  useEffect(() => {
    const checkInvitedJobs = async () => {
      const collaboratorId = getCollaboratorId();
      if (!isOpen || !collaboratorId || !currentUser?.id) return;
      setIsCheckingInvites(true);
      try {
        const response = await api.get(`/invitations/list/${collaboratorId}`);
        if (response.data?.invitations) {
          const sentByMe = response.data.invitations.filter(inv => inv.sender_id === currentUser.id);
          const invitedMap = {};
          sentByMe.forEach(inv => { if (inv.job_id) invitedMap[inv.job_id] = true; });
          setInvitedJobs(invitedMap);
        }
      } catch (error) {
        console.error("Error checking invited jobs:", error);
        setInvitedJobs({});
      } finally { setIsCheckingInvites(false); }
    };
    if (isOpen) checkInvitedJobs();
  }, [isOpen, collaborator, currentUser]);

  useEffect(() => {
    const activeJobs = jobs.filter(
      job => job.status === "posted" || job.status === "active"
    );

    if (!searchTerm.trim()) {
      setFilteredJobs(activeJobs);
      return;
    }

    const timer = setTimeout(() => {
      const searchLower = searchTerm.toLowerCase();

      setFilteredJobs(
        activeJobs.filter(
          (job) =>
            job.title?.toLowerCase().includes(searchLower) ||
            job.description?.toLowerCase().includes(searchLower)
        )
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, jobs]);

  const clearSearch = () => { setSearchTerm(''); setFilteredJobs([]); setIsDropdownOpen(false); };

  const handleInviteClick = async () => {
    const collaboratorId = getCollaboratorId();
    if (!selectedJobId) { toast.error("Please select a job to invite"); return; }
    if (!collaboratorId) { toast.error("Unable to identify collaborator. Please try again."); return; }
    const selectedJob = jobs.find(j => j.id === selectedJobId);
    if (!selectedJob) { toast.error("Selected job not found"); return; }
    if (selectedJob.has_contract === true) { toast.error(`Cannot send invitation: "${selectedJob.title}" already has a contract.`); return; }
    if (invitedJobs[selectedJobId]) { toast.error(`Cannot send invitation: ${collaborator.name?.split(' ')[0] || 'User'} has already been invited to "${selectedJob.title}".`); return; }
    setIsSubmitting(true);
    try {
      const success = await onInvite(collaboratorId, selectedJobId);
      if (success) {
        setInvitedJobs(prev => ({ ...prev, [selectedJobId]: true }));
        setSelectedJobId(null);
        setSuccessData({ collaboratorName: collaborator.name || 'Collaborator', jobTitle: selectedJob.title || 'Project' });
        setShowSuccessPopup(true);
        setTimeout(() => { resetForm(); onClose(); }, 500);
      }
    } finally { setIsSubmitting(false); }
  };

  const handleSuccessClose = () => { setShowSuccessPopup(false); onClose(); };

  const handleJobSelect = (jobId, hasContract, isInvited) => {
    const job = jobs.find(j => j.id === jobId);
    if (hasContract) { toast.error(`"${job?.title || 'This job'}" already has a contract.`); return; }
    if (isInvited) { toast.info(`${collaborator.name?.split(' ')[0] || 'User'} already invited to "${job?.title}".`); return; }
    setSelectedJobId(selectedJobId === jobId ? null : jobId);
    if (selectedJobId !== jobId) toast.success(`"${job?.title}" selected for invitation`);
  };

  const handleClose = () => { resetForm(); onClose(); };

  if (!isOpen && !showSuccessPopup) return null;

  const getPopupProfileImage = () => {
    if (collaborator.profile_picture_url) {
      let url = collaborator.profile_picture_url;
      if (!url.startsWith('http')) url = `${API_BASE_URL}${url}`;
      return url;
    }
    return ManImg;
  };

  return (
    <>
      <SuccessPopup isOpen={showSuccessPopup} onClose={handleSuccessClose} collaboratorName={successData.collaboratorName} jobTitle={successData.jobTitle} />
      {isOpen && !showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center  bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
<div className="relative z-10 w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">            <div className="bg-gradient-to-r from-[#51218F] to-[#2a0e4a] p-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white flex-shrink-0 bg-gray-300">
                  <img src={getPopupProfileImage()} alt={collaborator.name} className="w-full h-full object-cover object-top" onError={(e) => { e.target.src = ManImg; }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">{collaborator.name}</h3>
                  <p className="text-white/80 text-xs truncate">{collaborator.skill_category}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {/* Removed earnings display - only show rating */}
                    <div className="flex items-center gap-0.5">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((_, i) => (
                          <svg key={i} width="10" height="10" viewBox="0 0 12 12">
                            <path d="M6 1L7.545 4.13L11 4.635L8.5 7.07L9.09 10.51L6 8.885L2.91 10.51L3.5 7.07L1 4.635L4.455 4.13L6 1Z"
                              fill={i < Math.floor(collaborator.skills_rating || 0) ? "#FFD700" : "#C4C4C4"}
                              stroke="#51218F" strokeWidth="0.3" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-white/80 text-[10px]">({collaborator.review_count || 0})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={handleClose} className="absolute top-3 right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
            <div className="p-4">
              <h4 className="text-base font-semibold text-[#2A1E17] mb-1 border-b border-gray-200 pb-2">
                Select a job to invite
              </h4>

              <p className="text-xs text-gray-600 mb-2 border-b !border-gray-200 pb-2">
                Search for a job to invite {collaborator.name?.split(' ')[0] || 'User'} to collaborate on.
              </p>

              <div
                className="relative mb-4"
                ref={dropdownRef}
              >

                <div
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full !border border-gray-300 rounded-lg px-3 py-2 cursor-pointer flex justify-between items-center"
                >
                  <span className="text-sm">
                    {selectedJobId
                      ? jobs.find(j => j.id === selectedJobId)?.title
                      : "Select Job"}
                  </span>

                  <svg
                    className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {isDropdownOpen && (
                  <div className="relative z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">

                    <div className="p-2 border-b">
                      <input
                        type="text"
                        placeholder="Search jobs..."
                        value={jobSearch}
                        onChange={(e) => setJobSearch(e.target.value)}
                        className="w-full !border rounded px-2 py-1 text-sm"
                      />
                    </div>

                    <div
                  className="max-h-52 overflow-y-auto !border-1 !border-gray-300 rounded-b-lg"
                      style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      }}
                    >
                      {searchableJobs.map((job) => {
                        const isInvited = invitedJobs[job.id];
                        const hasContract = job.has_contract === true;

                        return (
                          <div
                            key={job.id}
                            onClick={() => {
                              setSelectedJobId(job.id);
                              setIsDropdownOpen(false);
                            }}
                        className="px-3 py-2 hover:bg-purple-50 cursor-pointer shadow-xl rounded "
                          >
                            <div className="font-medium text-sm border rounded px-2 py-1">
                              {job.title}
                            </div>

                            <div className="text-xs text-gray-500">
                              {job.budget_type === "fixed"
                                ? `₹${job.budget_from}`
                                : `₹${job.budget_from}/hr`}
                            </div>
                          </div>
                        );
                      })}

                    </div>
                  </div>
                )}

              </div>

              <div className="flex gap-2">
                <button onClick={handleClose} disabled={isSubmitting}
                  className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium hover:from-red-700 hover:to-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
                  Cancel
                </button>
                <button onClick={handleInviteClick} disabled={!selectedJobId || isCheckingInvites || isSubmitting}
                  className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-[#51218F] to-[#2a0e4a] text-white text-sm font-medium hover:from-[#6a2ec2] hover:to-[#3a1a5a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
                  {isSubmitting ? (
                    <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Sending...</span></>
                  ) : 'Send Invite'}
                </button>
              </div>
            </div>
          </div>
          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #51218F; border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3d1768; }
          `}</style>
        </div>
      )}
    </>
  );
};

/* ================= PORTFOLIO HELPERS ================= */
/* ================= PORTFOLIO HELPERS ================= */
const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

const PortfolioActions = ({ item, loggedInUser }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const fileUrl = item.is_fallback ? null : getFullUrl(item.file_url);
  const mediaLink = item.media_link || null;

  const handleDownload = async (e) => {
    e.stopPropagation();
    
    if (!item.id) { 
      toast.info("No file available to download"); 
      return; 
    }
    
    if (isDownloading) return;
    
    setIsDownloading(true);
    
    // ✅ Show "Download started" immediately
    toast.success("Download started");
    
    try {
      const response = await api.get(`/collaborator/portfolio/download/${item.id}`, {
        params: { user_id: loggedInUser?.id || userData?.id },
        responseType: "blob"
      });
      
      // Get filename from Content-Disposition header if available
      const contentDisposition = response.headers['content-disposition'];
      let filename = item.original_filename || item.title || 'portfolio-file';
      
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match && match[1]) {
          filename = match[1];
        }
      }
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Download failed", error.response?.data?.detail || "Could not retrieve file");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleNavigate = (e) => {
    e.stopPropagation(); 
    e.preventDefault();
    if (!mediaLink) { 
      toast.info("No link provided for this portfolio item"); 
      return; 
    }
    const a = document.createElement('a');
    a.href = mediaLink; 
    a.target = '_blank'; 
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a); 
    a.click(); 
    document.body.removeChild(a);
  };

  const canDownload = !!fileUrl && !!item.id && !item.is_fallback;
  if (!canDownload && !mediaLink) return null;

  return (
    <div className="absolute top-3 right-3 z-30 flex gap-1.5">
      {canDownload && (
        <button 
          onClick={handleDownload} 
          title="Download file"
          disabled={isDownloading}
          className="w-8 h-8 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          )}
        </button>
      )}
      {(mediaLink || canDownload) && (
        <button 
          onClick={handleNavigate} 
          title={mediaLink ? "Open link" : "No link provided"}
          className="w-8 h-8 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </button>
      )}
    </div>
  );
};

const PortfolioMedia = ({ item, index, className = "" }) => {
  const [imgError, setImgError] = useState(false);
  const fallbacks = [Ui1, Ui2, Ui3];

  if (item.is_fallback) {
    return <img src={item.file_url} alt={item.title} className={`w-full h-full object-cover ${className}`} onError={(e) => { e.target.src = fallbacks[index % 3]; }} />;
  }

  const fileUrl = getFullUrl(item.file_url);
  const isVideo = item.file_type === "video";
  const isImage = item.file_type === "image";
  const isDocument = !isVideo && !isImage && !!fileUrl;

  if (isVideo && fileUrl) {
    return <video src={fileUrl} className={`w-full h-full object-cover ${className}`} controls={false} muted preload="metadata" onError={(e) => { e.target.style.display = 'none'; }} />;
  }
  if (isImage && fileUrl && !imgError) {
    return <img src={fileUrl} alt={item.title} className={`w-full h-full object-cover ${className}`} onError={() => setImgError(true)} />;
  }
  if (isDocument) {
    return (
      <div className="relative w-full h-full">
        <img src={fallbacks[index % 3]} alt={item.title} className={`w-full h-full object-cover opacity-40 ${className}`} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <svg className="w-12 h-12 text-white drop-shadow-lg mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-white text-xs font-medium drop-shadow uppercase tracking-wider">{item.file_type || 'File'}</span>
        </div>
      </div>
    );
  }
  return <img src={fallbacks[index % 3]} alt={item.title} className={`w-full h-full object-cover ${className}`} />;
};

/* ================= MAIN COMPONENT ================= */
export default function FinderProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collaboratorData, setCollaboratorData] = useState(null);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [workExperiences, setWorkExperiences] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [invitePopup, setInvitePopup] = useState({ isOpen: false, collaborator: null });

  useEffect(() => {
    const fetchLoggedInUser = async () => {
      try {
        const response = await api.get(`/auth/me`, { withCredentials: true });
        setLoggedInUser(response.data);
      } catch (err) { console.error("Error fetching logged in user:", err); }
    };
    fetchLoggedInUser();
  }, []);

  useEffect(() => {
    const fetchUserJobs = async () => {
      if (!loggedInUser?.id) return;
      try {
        const res = await api.get(`/jobs/my-jobs/${loggedInUser.id}`);
        const rawJobs = res.data.jobs || res.data || [];
        setJobs(rawJobs.map((job) => ({ ...job, proposals_count: job.proposals_count || 0 })));
      } catch (err) { console.error("Failed to fetch user jobs", err); setJobs([]); }
    };
    fetchUserJobs();
  }, [loggedInUser]);

  useEffect(() => {
    const fetchCollaboratorData = async () => {
      try {
        setLoading(true);
        if (!id) throw new Error("No user ID provided");
        const response = await api.get(`/collaborator/get/${id}`);
        if (response.data) {
          setCollaboratorData({ ...response.data, id, skills: response.data.skills || response.data.skill_set || [] });
          if (response.data.portfolio_items?.length > 0) {
            setPortfolioItems(
              response.data.portfolio_items
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((item, index) => ({
                  id: item.id,
                  title: item.heading || `Portfolio ${index + 1}`,
                  file_url: item.file_url,
                  file_type: item.file_type || "unknown",
                  original_filename: item.original_filename,
                  media_link: item.media_link || null,
                  order: item.order || index
                }))
            );
          } else {
            setPortfolioItems([
              { id: 1, file_url: Ui1, title: "UI/UX Design", file_type: "image", is_fallback: true },
              { id: 2, file_url: Ui2, title: "Product Design", file_type: "image", is_fallback: true },
              { id: 3, file_url: Ui3, title: "Brand Identity", file_type: "image", is_fallback: true }
            ]);
          }
          setWorkExperiences(response.data.work_experiences?.length > 0 ? response.data.work_experiences : []);
          if (response.data.reviews?.length > 0) setReviews(response.data.reviews);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching collaborator profile:", err);
        setError("Failed to load profile data. Please try again.");
        setCollaboratorData({ id, name: "Jenny", skill_category: "UI/UX Designer", experience_years: 10, skills_rating: 4.9, about: "Experienced UI/UX designer.", profile_picture_url: null, pricing_amount: 50, review_count: 5, skills: [] });
        setPortfolioItems([
          { id: 1, file_url: Ui1, title: "UI/UX Design", file_type: "image", is_fallback: true },
          { id: 2, file_url: Ui2, title: "Product Design", file_type: "image", is_fallback: true },
          { id: 3, file_url: Ui3, title: "Brand Identity", file_type: "image", is_fallback: true }
        ]);
        setWorkExperiences([]);
      } finally { setLoading(false); }
    };
    fetchCollaboratorData();
  }, [id]);

  const nextSlide = () => {
    if (portfolioItems.length <= 3) return;
    setCurrentIndex(prev => prev + 3 >= portfolioItems.length ? 0 : prev + 3);
  };
  const prevSlide = () => {
    if (portfolioItems.length <= 3) return;
    setCurrentIndex(prev => prev - 3 < 0 ? portfolioItems.length - 3 : prev - 3);
  };
  const getCurrentItems = () => {
    if (portfolioItems.length <= 3) return portfolioItems;
    const endIndex = currentIndex + 3;
    if (endIndex > portfolioItems.length) return portfolioItems.slice(-3);
    return portfolioItems.slice(currentIndex, endIndex);
  };

  const handleMessageClick = () => {
    if (loggedInUser?.id) navigate(`/message?user=${id}`);
    else alert("Please log in to send messages");
  };

  const handleInvite = async (collaboratorId, jobId) => {
    try {
      if (!loggedInUser?.id) { toast.error("Please log in to send invitations"); return false; }
      if (!collaboratorId) { toast.error("No collaborator selected"); return false; }
      if (!jobId) { toast.error("Please select a job"); return false; }
      const selectedJob = jobs.find(j => j.id === jobId);
      if (!selectedJob) { toast.error("Selected job not found"); return false; }
      const formData = new FormData();
      formData.append("sender_id", loggedInUser.id);
      formData.append("receiver_id", collaboratorId);
      formData.append("job_id", jobId);
      formData.append("client_name", loggedInUser.full_name || loggedInUser.name || "Client");
      formData.append("project_name", selectedJob.title || "Project");
      formData.append("date", new Date().toISOString().split("T")[0]);
      formData.append("revenue", selectedJob.budget_from || 0);
      await api.post("/invitations/create", formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(`🎉 Invitation sent to ${collaboratorData?.name?.split(' ')[0] || 'collaborator'}!`);
      return true;
    } catch (error) {
      console.error("Invitation failed:", error);
      if (error.response?.data?.detail?.includes("already been invited")) {
        toast.error("This collaborator has already been invited for this job");
      } else {
        toast.error(error.response?.data?.detail || error.response?.data?.message || "Invitation failed. Please try again.");
      }
      return false;
    }
  };

  const openInvitePopup = () => {
    const hasActiveJobs = jobs.some(j => j.status === "posted" || j.status === "active");
    if (!hasActiveJobs) { toast.info("Please create a job first before inviting collaborators"); navigate("/created"); return; }
    setInvitePopup({ isOpen: true, collaborator: { ...collaboratorData, id: collaboratorData?.id || id } });
  };
  const closeInvitePopup = () => setInvitePopup({ isOpen: false, collaborator: null });
  const handleCollaborateRequest = () => {
    if (loggedInUser?.id) openInvitePopup();
    else alert("Please log in to send a collaborate request");
  };
  const handleProfileClick = () => navigate("/pro-file");

  const getStarRating = () => {
    // If we have review data, compute directly from reviews
    if (reviews && reviews.length > 0) {
      const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
      const avg = total / reviews.length;
      return Math.min(Math.max(avg, 0), 5);
    }
    // No reviews → return 0 (or fallback to skills_rating only if explicitly set > 0)
    // After backend fix, skills_rating will be 0 anyway, but keep this as safety
    if (collaboratorData?.skills_rating && collaboratorData.skills_rating > 0) {
      return Math.min(Math.max(parseFloat(collaboratorData.skills_rating), 0), 5);
    }
    return 0;
  };

  const getExperienceDisplay = () => {
    if (!collaboratorData?.experience_years || collaboratorData.experience_years === 0) return "Fresher";
    const years = collaboratorData.experience_years;
    return `${years} Year${years > 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col edit-page">
        <Header variant="light" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !collaboratorData) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col edit-page">
        <Header variant="light" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-gray-600 mb-4">User ID: {id || "Not provided"}</p>
            <button onClick={() => navigate(-1)} className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition">Go Back</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentItems = getCurrentItems();
  const showCarouselControls = portfolioItems.length > 3;
  const starRating = getStarRating();
  const experienceDisplay = getExperienceDisplay();
  const isFresher = !collaboratorData?.experience_years || collaboratorData.experience_years === 0;

  return (
    <div className="w-full bg-white overflow-x-hidden edit-page">
      <Header variant="light" />

      {/* BACK BUTTON */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 lg:pt-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 text-[#51218F] hover:text-[#3d1768] transition-colors group">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-[#51218F] to-[#2a0e4a] group-hover:from-[#3d1768] group-hover:to-[#1a0830] transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </div>
          <span className="font-medium text-base">Back</span>
        </button>
      </div>

      {/* ================= DESKTOP VERSION ================= */}
      <div className="hidden lg:block">

        {/* HERO SECTION */}
        <section className="w-full h-[800px] relative flex items-center justify-center">
          <div className="text-center mb-160 w-[913px] h-[266px]">
            <div className="relative inline-block mt-2 ml-10">
              <p className="text-[18px] bg-white px-6 py-2 inline-block rounded-full font-medium relative z-10 border-[3px] border-black mb-2" style={{ boxShadow: "0 0 0 2px black" }}>Hello!</p>
              <svg className="absolute -top-10 -right-10 w-[55px] h-[55px] z-0" viewBox="0 0 60 60" fill="none">
                <path d="M18 42 C20 32 18 22 16 14 M30 45 C36 34 42 26 50 18 M38 52 C45 48 52 44 58 40" stroke="#51218F" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-[90px] font-bold leading-[100px] mt-6">I'm <span className="text-purple-600">{collaboratorData?.name || "Sivaselvam"}</span>,</h1>
            <div className="relative inline-block">
              <h1 className="text-[90px] font-bold leading-[100px] -mt-2">{collaboratorData?.skill_category || "Software"}</h1>
              <img src={BigScribble} alt="ui-scribble" className="absolute -left-[70px] top-[90px] w-[55px]" />
            </div>
            <img src={HalfCircle} alt="half bg" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[871px] h-[575px] opacity-90" />
            <img src={ManImg} alt="man" className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[600px] object-contain" />
            <div className="absolute left-1/2 -translate-x-1/2 top-[470px] w-[367px] h-[82px] flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-[50px] p-[5px] bg-[#FFFFFF1A] !border !border-white border-[2px] backdrop-blur-[1px]"></div>
              <div className="absolute inset-[5px] rounded-[50px] border border-white/60 p-[5px]"></div>
              <div className="absolute inset-[10px] rounded-[50px] !border !border-white shadow-[0_0_35px_#8A38F5] bg-[radial-gradient(50%_50%_at_50%_50%,#8A38F5_0%,#000000_100%)]"></div>
              <button className="relative z-10 w-full h-full rounded-[50px] flex items-center justify-center gap-4 text-white text-[26px] font-semibold -mt-2 hover:opacity-90 transition-opacity" onClick={handleCollaborateRequest}>
                Collaborate request
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M7 17L17 7" /><path d="M7 7h10v10" />
                </svg>
              </button>
            </div>
          </div>

          {/* LEFT QUOTE */}
          <div className="absolute left-[25px] top-[440px] w-[328px] flex flex-col gap-[12px]">
            <div className="text-[#2A3442] text-[48px] leading-none font-bold">''</div>
            <p className="text-[#2A3442] text-[18px] leading-[26px] font-bold">
              {collaboratorData?.skills_rating >= 4 ? (
                <>{collaboratorData?.name || "Professional"}'s exceptional {collaboratorData?.skill_category?.toLowerCase() || "product design"}<br />ensures our website's success.<br />Highly Recommended</>
              ) : collaboratorData?.skills_rating >= 3 ? (
                <>{collaboratorData?.name || "Professional"}'s professional {collaboratorData?.skill_category?.toLowerCase() || "design"}<br />delivered quality work on time.<br />Would recommend</>
              ) : (
                <>{collaboratorData?.name || "Professional"} completed the {collaboratorData?.skill_category?.toLowerCase() || "project"}<br />as per the requirements.<br />Satisfactory work</>
              )}
            </p>
          </div>

          {/* ===== RIGHT: STARS + EXPERIENCE LEVEL (SINGLE BLOCK) ===== */}
          <div className="absolute right-[20px] top-[520px] w-[169px] flex flex-col items-center gap-[16px]">
            {/* Stars — only show if rated */}
            {starRating > 0 && (
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-[32px] ${i < Math.floor(starRating) ? "text-orange-500"
                    : i === Math.floor(starRating) && starRating % 1 >= 0.5 ? "text-orange-500"
                      : "text-gray-300"
                    }`}>★</span>
                ))}
              </div>
            )}
            {/* Single label: "Fresher" OR "X Year(s) Exp." */}
            <div className="text-center">
              <h3 className="text-[40px] font-bold leading-none">{experienceDisplay}</h3>
              {!isFresher && <p className="text-[18px] text-[#444] mt-1">Experience</p>}
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        {collaboratorData?.about && (
          <section className="w-full max-w-[1440px] mx-auto px-[70px] py-[48px]">
            <div className="bg-gradient-to-br from-purple-50 via-white to-indigo-50 rounded-[32px] px-[60px] py-[44px] border border-purple-100 shadow-sm">
              <h2 className="text-[28px] font-semibold text-[#334155] mb-1">About <span className="text-[#6D28D9]">{collaboratorData.name?.split(' ')[0] || 'Me'}</span></h2>
              <p className="text-[13px] text-gray-400 mb-5">A brief introduction from the collaborator</p>
              <p className="text-[17px] text-[#475569] leading-[30px] max-w-[900px]">{collaboratorData.about}</p>
            </div>
          </section>
        )}

        {/* PORTFOLIO SECTION */}
          <section className="relative w-full min-h-[600px] xl:min-h-[700px] 2xl:h-[900px] bg-cover bg-center rounded-[45px] -mt-4" style={{ backgroundImage: `url(${ServicesBG})` }}>
          <div className="absolute top-[40px] left-0 w-full h-[3px] bg-gradient-to-r from-[#a96bff] via-[#d8baff] to-[#9b4dff] opacity-80 blur-[1px]" />
          <div className="absolute bottom-[150px] left-0 w-full h-[6px] bg-gradient-to-r from-[#6d2cff] to-[#b57eff] opacity-60 blur-[6px]" />
          <div className="flex items-center justify-between w-full max-w-[1299px] h-[52px] mb-[40px] mx-auto px-6 xl:px-8">
          <h2 className="text-[32px] xl:text-[48px] mt-24 xl:mt-44 font-semibold text-white">
  My <span className="ml-1 text-[#D8B4FE] drop-shadow-[0_0_10px_rgba(216,180,254,0.5)] [text-shadow:_0_0_20px_rgba(168,85,247,0.3)]">Portfolio</span>
</h2>
          </div>
          <div className="relative w-full max-w-[1099px] mx-auto px-4 xl:px-0 mt-12 xl:mt-[190px]">
            {showCarouselControls && (
              <>
                <button onClick={prevSlide} className="absolute left-[-20px] xl:left-[-60px] top-1/2 -translate-y-1/2 z-30 w-10 h-10 xl:w-12 xl:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all">
                  <svg className="w-5 h-5 xl:w-6 xl:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={nextSlide} className="absolute right-[-20px] xl:right-[-60px] top-1/2 -translate-y-1/2 z-30 w-10 h-10 xl:w-12 xl:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all">
                  <svg className="w-5 h-5 xl:w-6 xl:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-[29px]">
              {currentItems.map((item, index) => (
                <div key={item.id} className="transition-all duration-300 opacity-100 transform hover:scale-[1.02]">
                  <div className="relative w-full rounded-[35px] xl:rounded-[55px]">
                    <div className="absolute inset-0 rounded-[35px] xl:rounded-[55px] border border-white/40 pointer-events-none z-20" />
                    <div className="relative z-10 w-full rounded-[35px] xl:rounded-[55px] bg-white/5 backdrop-blur-sm p-4 xl:p-7 shadow-[0_0_40px_rgba(162,95,255,0.25)] hover:shadow-[0_0_60px_rgba(162,95,255,0.4)] transition-shadow">
                      <h3 className="text-white text-[18px] xl:text-[24px] font-medium mb-3 xl:mb-5">{item.title || "Portfolio Item"}</h3>
                      <div className="relative w-full h-[200px] xl:h-[260px]">
                        <div className="absolute top-[10px] left-[10px] w-full h-full rounded-xl bg-white/10 blur-md" />
                        <PortfolioActions item={item} loggedInUser={loggedInUser} />
                        <div className="relative rounded-xl shadow-xl w-full h-full overflow-hidden cursor-pointer">
                          <PortfolioMedia item={item} index={index} className="rounded-xl" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {showCarouselControls && (
            <div className="flex gap-3 justify-center mt-8 xl:mt-[100px] pb-8 xl:pb-0">
              {Array.from({ length: Math.ceil(portfolioItems.length / 3) }).map((_, i) => (
                <button key={i} onClick={() => setCurrentIndex(i * 3)} className={`w-[10px] h-[10px] rounded-full transition-all cursor-pointer ${currentIndex === i * 3 ? "bg-white scale-150 shadow-[0_0_8px_white]" : "bg-white/40 hover:bg-white/60"}`} />
              ))}
            </div>
          )}
        </section>

        {/* SKILLS SECTION */}
        <section className="w-full max-w-[1440px] mx-auto px-[70px] py-[60px] bg-white">
          <h2 className="text-center text-[48px] font-semibold mb-[60px]">
            <span className="text-[#334155]">Skills & </span><span className="text-[#6D28D9]">Expertise</span>
          </h2>
          {collaboratorData?.skills && collaboratorData.skills.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
              {collaboratorData.skills.map((skill, index) => (
                <div key={index} className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-full px-6 py-3 shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
                  <span className="text-purple-700 font-medium text-[18px]">{skill}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 text-[20px]">No skills listed yet</div>
          )}
        </section>

        {/* WORK EXPERIENCE SECTION */}
        <section className="w-full max-w-[1440px] mx-auto px-[70px] py-[120px] bg-white">
          <h2 className="text-center text-[60px] font-semibold mb-[120px]">
            <span className="text-[#334155]">My </span><span className="text-[#6D28D9]">Work Experience</span>
          </h2>
          {workExperiences.length > 0 ? (
            <div className="grid grid-cols-[1fr_120px_1fr] items-start">
              <div className="flex flex-col gap-[140px] text-left pr-10">
                {workExperiences.map((exp, idx) => (
                  <div key={exp.id || idx}>
                    <h3 className="text-[42px] font-semibold text-[#334155]">{exp.company_name}</h3>
                    {exp.location && <p className="text-[22px] mt-2 text-[#9CA3AF]">{exp.location}</p>}
                    <p className="text-[22px] mt-2 text-[#9CA3AF]">{exp.start_year} – {exp.end_year || (exp.is_current ? "Present" : "")}</p>
                  </div>
                ))}
              </div>
              <div className="relative flex flex-col mt-3 items-center">
                <div className="absolute top-[80px] bottom-[80px] w-[3px]" style={{ backgroundImage: "repeating-linear-gradient(to bottom, #6B7280 0, #6B7280 6px, transparent 6px, transparent 14px)" }} />
                {workExperiences.map((exp, idx) => {
                  const colors = ["#5B2CA1", "#5B2D2D", "#51218F"];
                  return (
                    <React.Fragment key={exp.id || idx}>
                      <div className="relative w-[76px] h-[76px] flex items-center justify-center z-10">
                        <svg className="absolute inset-0" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(72,33,33,1)" strokeWidth="4" strokeDasharray="10 12" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-[12px] rounded-full bg-white" />
                        <div className="absolute inset-[22px] rounded-full" style={{ background: colors[idx % colors.length] }} />
                      </div>
                      {idx < workExperiences.length - 1 && <div className="h-[190px]" />}
                    </React.Fragment>
                  );
                })}
              </div>
              <div className="flex flex-col gap-[80px] text-right pl-10">
                {workExperiences.map((exp, idx) => (
                  <div key={exp.id || idx}>
                    <h3 className="font-['Aclonica'] text-[42px] font-semibold text-[#334155]">{exp.role}</h3>
                    {exp.description && <p className="text-[#9CA3AF] text-[22px] mt-3 leading-[34px] max-w-[540px] ml-auto">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-[32px] font-medium text-[#9CA3AF] py-20">No work experience yet</div>
          )}
        </section>

        {/* DISCUSS SECTION */}
        <section className="w-full h-[420px] flex flex-col items-center justify-center mb-2">
          <h1 className="text-[60px] font-extrabold leading-tight text-center">
            <span className="text-[#2A3442]">Have an Awesome Project </span><br />
            <span className="text-[#2A3442]">Idea? </span><span className="text-[#7A32DB]">Let's Discuss</span>
          </h1>
          <div className="w-[900px] h-[90px] !border border-gray rounded-full mt-10 flex items-center justify-center relative">
            <button className="w-[250px] h-[70px] bg-[#7A32DB] text-white rounded-full text-[22px] font-medium hover:bg-[#6a27c5] transition" onClick={handleMessageClick}>Message me</button>
          </div>
          <div className="flex justify-center gap-[60px] mt-7 items-center select-none">
            <div className="flex items-center gap-4">
              <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
                <path d="M6 24H2" stroke="#2A3442" strokeWidth="3" strokeLinecap="round" />
                <path d="M10 15L6 13" stroke="#2A3442" strokeWidth="3" strokeLinecap="round" />
                <path d="M10 33L6 35" stroke="#2A3442" strokeWidth="3" strokeLinecap="round" />
                <path d="M24 14C18.48 14 14 18.48 14 24C14 29.52 18.48 34 24 34C29.52 34 34 29.52 34 24C34 18.48 29.52 14 24 14Z" stroke="#2A3442" strokeWidth="3" />
                <path d="M24 17L26.5 22H32L27.8 25.8L29.2 31.2L24 28L18.8 31.2L20.2 25.8L16 22H21.5L24 17Z" fill="#2A3442" />
              </svg>
              <p className="text-[#2A3442] text-[20px] font-medium">{starRating.toFixed(1)}/5 Average Ratings</p>
            </div>
            <div className="flex items-center gap-4">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L19 6V14L12 18L5 14V6L12 2Z" stroke="#2A3442" strokeWidth="2" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="3" fill="#2A3442" />
              </svg>
              <p className="text-[#2A3442] text-[20px] font-medium">{collaboratorData?.review_count || 0}+ Reviews</p>
            </div>
            <div className="flex items-center gap-4">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L19 6V14L12 18L5 14V6L12 2Z" stroke="#2A3442" strokeWidth="2" strokeLinejoin="round" />
                <path d="M9.5 12.2L12 14.2L15.5 10" stroke="#2A3442" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-[#2A3442] text-[20px] font-medium">Certified Professional</p>
            </div>
          </div>
        </section>
      </div>

      {/* ================= MOBILE VERSION ================= */}
      <div className="block lg:hidden">
        {/* MOBILE HERO */}
        <section className="w-full relative bg-white overflow-hidden pb-8">
          <div className="relative text-center pt-6 mb-17">
            <div className="relative inline-block mb-4">
              <p className="text-[16px] bg-white px-6 py-2 rounded-full font-medium border-[2.5px] border-black inline-block" style={{ boxShadow: "0 0 0 2px black" }}>Hello!</p>
              <svg className="absolute -top-6 -right-8 w-[40px]" viewBox="0 0 60 60" fill="none">
                <path d="M18 42 C20 32 18 22 16 14 M30 45 C36 34 42 26 50 18 M38 52 C45 48 52 44 58 40" stroke="#51218F" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-[26px] font-bold leading-[42px]">I'm <span className="text-[#6D28D9]">{collaboratorData?.name || "Sivaselvam"}</span>,</h1>
            <div className="relative inline-block mt-1">
              <h2 className="text-[26px] font-bold leading-[38px]">{collaboratorData?.skill_category || "Software"}</h2>
              <img src={BigScribble} className="absolute -left-[30px] -top-[-25px] w-[32px]" alt="scribble" />
            </div>
          </div>

          <div className="relative mt-8 flex justify-center px-4">
           <div className="absolute left-2 top-[-50px] sm:top-[-40px] md:top-[-30px] lg:top-2 w-[110px] text-left z-20">
  <div className="text-[24px] sm:text-[28px] md:text-[32px] font-bold leading-none text-[#2A3442] drop-shadow-sm">''</div>
  <p className="text-[8px] xs:text-[9px] sm:text-[10px] md:text-[11px] leading-[10px] xs:leading-[11px] sm:leading-[13px] md:leading-[14px] font-bold text-[#2A3442] mt-0 bg-white/80 backdrop-blur-sm px-1 rounded">
    {collaboratorData?.skills_rating >= 4
      ? `${collaboratorData?.name?.split(' ')[0] || "Professional"}'s exceptional work`
      : collaboratorData?.skills_rating >= 3
        ? `${collaboratorData?.name?.split(' ')[0] || "Professional"}'s quality work`
        : `Completed work satisfactorily`}
  </p>
</div>
            <div className="relative w-full h-[320px] flex justify-center">
             <img 
  src={HalfCircle} 
  alt="half-circle" 
  className="absolute bottom-[120px] w-[280px] sm:w-[300px] md:w-[310px] lg:w-[320px] h-[220px] sm:h-[240px] md:h-[250px] lg:h-[260px]" 
/>
              <img src={ManImg} alt="man" className="absolute w-[170px] bottom-[140px] z-20" />
            </div>

            {/* ===== MOBILE RIGHT: STARS + EXPERIENCE (SINGLE BLOCK) ===== */}
            <div className="absolute right-0 top-[-10px] sm:top-0 md:top-4 lg:top-10 w-[80px] sm:w-[90px] md:w-[100px] lg:w-[110px] text-center z-20">
              {starRating > 0 && (
                <div className="flex justify-center gap-[1px] sm:gap-[2px] mb-1 sm:mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-[10px] xs:text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] ${i < Math.floor(starRating) ? "text-orange-500"
                      : i === Math.floor(starRating) && starRating % 1 >= 0.5 ? "text-orange-500"
                        : "text-gray-300"
                      }`}>★</span>
                  ))}
                </div>
              )}
              <h3 className="text-[12px] xs:text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] font-bold leading-tight">
                {experienceDisplay}
              </h3>
              {!isFresher && (
                <p className="text-[8px] xs:text-[9px] sm:text-[10px] md:text-[10px] lg:text-[11px] text-gray-500">
                  Experience
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-center mt-[-140px] mb-0">
            <div className="relative w-[200px] h-[52px]">
              <div className="absolute inset-0 rounded-full !border !border-[#E5D9FF] bg-white/10 backdrop-blur-sm" />
              <div className="absolute inset-[3px] rounded-full !border !border-white/40" />
              <div className="absolute inset-[7px] rounded-full bg-[radial-gradient(circle_at_30%_0%,#9D5CFF,#1A082F)] shadow-[0_0_25px_rgba(157,92,255,0.9)]" />
              <button className="relative z-10 w-full h-full flex items-center justify-center gap-2 text-white text-[14px] font-semibold tracking-wide hover:opacity-90" onClick={handleCollaborateRequest}>
                Collaborate
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.3">
                  <path d="M7 17L17 7" /><path d="M7 7h10v10" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* MOBILE ABOUT */}
        {collaboratorData?.about && (
          <section className="px-5 py-6">
            <div className="bg-gradient-to-br from-purple-50 via-white to-indigo-50 rounded-[20px] px-5 py-5 border border-purple-100 shadow-sm">
              <h3 className="text-[16px] font-semibold text-[#334155] mb-0.5">About <span className="text-[#6D28D9]">{collaboratorData.name?.split(' ')[0] || 'Me'}</span></h3>
              <p className="text-[10px] text-gray-400 mb-3">A brief introduction from the collaborator</p>
              <p className="text-[13px] text-[#475569] leading-[21px]">{collaboratorData.about}</p>
            </div>
          </section>
        )}

        {/* MOBILE PORTFOLIO */}
        <section className="relative w-full mt-2 px-4 py-8 rounded-[32px] overflow-hidden" style={{ backgroundImage: `url(${ServicesBG})`, backgroundSize: "cover" }}>
          <div className="absolute top-4 left-0 w-full h-[2px] bg-gradient-to-r from-[#a96bff] via-[#d8baff] to-[#9b4dff] opacity-70" />
          <div className="absolute bottom-[80px] left-0 w-full h-[4px] bg-gradient-to-r from-[#6d2cff] to-[#b57eff] opacity-60 blur-[4px]" />
          <div className="relative z-10 flex items-start justify-between text-white mb-6">
           <h2 className="text-[26px] font-semibold">
  My <span className="text-[#D8B4FE] drop-shadow-[0_0_10px_rgba(216,180,254,0.5)] [text-shadow:_0_0_20px_rgba(168,85,247,0.3)]">Portfolio</span>
</h2>
          </div>
          <div className="relative z-10">
            <div className="flex overflow-x-auto pb-5 gap-4 snap-x snap-mandatory">
              {portfolioItems.map((item, index) => (
                <div key={item.id} className="min-w-[85%] snap-start rounded-[24px] p-4 bg-white/10 backdrop-blur-sm">
                  <div className="rounded-[18px]">
                    <h3 className="text-white text-[16px] font-medium mb-3 text-center truncate px-2">{item.title || "Portfolio Item"}</h3>
                    <div className="relative w-full h-[200px] rounded-[16px] overflow-hidden">
                      <PortfolioActions item={item} loggedInUser={loggedInUser} />
                      <PortfolioMedia item={item} index={index} className="rounded-[16px]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MOBILE SKILLS */}
        {collaboratorData?.skills && collaboratorData.skills.length > 0 && (
          <section className="w-full px-5 py-10 bg-white">
            <h2 className="text-center text-[26px] font-semibold mb-6">
              <span className="text-[#334155]">Skills & </span><span className="text-[#6D28D9]">Expertise</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-2.5">
              {collaboratorData.skills.map((skill, index) => (
                <span key={index} className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-full px-5 py-2.5 shadow-sm border border-purple-200">
                  <span className="text-purple-700 font-medium text-[14px]">{skill}</span>
                </span>
              ))}
            </div>
          </section>
        )}

        {/* MOBILE WORK EXPERIENCE */}
        <section className="w-full px-5 pt-10 pb-14 bg-white">
          <h2 className="text-center text-[28px] font-semibold mb-10">My <span className="text-[#6D28D9]">Work Experience</span></h2>
          {workExperiences.length > 0 ? (
            <div className="relative">
              <div className="absolute left-1/2 -translate-x-1/2 top-[40px] bottom-[40px] w-[2px]" style={{ backgroundImage: "repeating-linear-gradient(to bottom, #6B7280 0, #6B7280 6px, transparent 6px, transparent 14px)" }} />
              {workExperiences.map((exp, idx) => {
                const colors = ["#5B2CA1", "#5B2D2D", "#51218F"];
                return (
                  <div key={exp.id || idx} className="grid grid-cols-[1fr_55px_1fr] items-start mb-10">
                    <div className="text-right pr-3">
                      <h3 className="text-[14px] font-semibold text-[#334155] leading-tight">{exp.company_name}</h3>
                      {exp.location && <p className="text-[10px] mt-1 text-[#9CA3AF]">{exp.location}</p>}
                      <p className="text-[10px] text-[#9CA3AF] mt-1">{exp.start_year} – {exp.end_year || (exp.is_current ? "Present" : "")}</p>
                    </div>
                    <div className="flex justify-center"><TimelineNode color={colors[idx % colors.length]} /></div>
                    <div className="text-left pl-3">
                      <h4 className="text-[14px] font-semibold text-[#334155]">{exp.role}</h4>
                      {exp.description && <p className="text-[11px] text-[#9CA3AF] mt-1 leading-[16px]">{exp.description.substring(0, 90)}{exp.description.length > 90 ? "..." : ""}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-[20px] font-medium text-[#9CA3AF] py-10">No work experience yet</div>
          )}
        </section>

        {/* MOBILE DISCUSS */}
        <div className="px-5 pb-12 text-center">
          <h2 className="text-[20px] font-bold leading-tight">Have an Awesome Project Idea?<br /><span className="text-purple-600">Let's Discuss</span></h2>
          <div className="mt-6 flex justify-center">
            <div className="relative w-[230px] h-[52px]">
              <div className="absolute inset-0 rounded-full !border border-white/70 bg-white/10 backdrop-blur-sm"></div>
              <div className="absolute inset-[4px] rounded-full border !border-white/40"></div>
              <div className="absolute inset-[8px] rounded-full bg-[radial-gradient(circle_at_top,#8A38F5,#2A0A4F)] shadow-[0_0_20px_#8A38F5]"></div>
              <button className="relative z-10 w-full h-full flex items-center justify-center text-white text-[15px] font-semibold hover:opacity-90" onClick={handleMessageClick}>Message me</button>
            </div>
          </div>
          <div className="flex justify-between items-center mt-8 px-2">
            <div className="flex items-center gap-2">
              <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
                <path d="M6 24H2" stroke="#2A3442" strokeWidth="3" strokeLinecap="round" />
                <path d="M10 15L6 13" stroke="#2A3442" strokeWidth="3" strokeLinecap="round" />
                <path d="M10 33L6 35" stroke="#2A3442" strokeWidth="3" strokeLinecap="round" />
                <path d="M24 14C18.48 14 14 18.48 14 24C14 29.52 18.48 34 24 34C29.52 34 34 29.52 34 24C34 18.48 29.52 14 24 14Z" stroke="#2A3442" strokeWidth="3" />
                <path d="M24 17L26.5 22H32L27.8 25.8L29.2 31.2L24 28L18.8 31.2L20.2 25.8L16 22H21.5L24 17Z" fill="#2A3442" />
              </svg>
              <p className="text-[#2A3442] text-[11px] font-medium">{starRating.toFixed(1)}/5</p>
            </div>
            <div className="flex items-center gap-2">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L19 6V14L12 18L5 14V6L12 2Z" stroke="#2A3442" strokeWidth="2" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="3" fill="#2A3442" />
              </svg>
              <p className="text-[#2A3442] text-[11px] font-medium">{collaboratorData?.review_count || 0}+ Reviews</p>
            </div>
            <div className="flex items-center gap-2">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L19 6V14L12 18L5 14V6L12 2Z" stroke="#2A3442" strokeWidth="2" strokeLinejoin="round" />
                <path d="M9.5 12.2L12 14.2L15.5 10" stroke="#2A3442" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-[#2A3442] text-[11px] font-medium">Certified</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Popup */}
      <InvitePopup
        isOpen={invitePopup.isOpen}
        onClose={closeInvitePopup}
        collaborator={invitePopup.collaborator}
        currentUser={loggedInUser}
        jobs={jobs}
        onInvite={handleInvite}
      />

      <Footer />
    </div>
  );
}