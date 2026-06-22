import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from '../../contexts/UserContext';
import api from "../../utils/axiosConfig";
import TopBanner from "../../assets/Colabwork/banner.png";
import Footer from "../../component/Footer";
import ColHeader from "../../component/ColHeader";
import toast from "../../component/Toast"

export default function UX() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData } = useUser();
  const passedUserName = location.state?.userName;
  const passedProfilePicture = location.state?.profilePicture;

  const [job, setJob] = useState(null);
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creatorLoading, setCreatorLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState(new Set());
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

  // ✅ Reviews state
  const [creatorRating, setCreatorRating] = useState(0);
  const [creatorReviewsCount, setCreatorReviewsCount] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [downloadingFiles, setDownloadingFiles] = useState(new Set());
  const [downloadProgress, setDownloadProgress] = useState({});

  useEffect(() => {
    // INSTANT RENDER
    if (location.state?.job) {
      const jobData = location.state.job;
      setJob(jobData);
      setCreator(
        jobData.creator ||
        jobData.employer ||
        null
      );
      setLoading(false);
      setCreatorLoading(false);

      // OPTIONAL background refresh
      setTimeout(() => {
        fetchJobDetails(jobData.id);
      }, 100);

      return;
    }

    // fallback direct URL access
    if (location.state?.jobId) {
      fetchJobDetails(location.state.jobId);
    }
  }, [location.state]);

  const fetchJobDetails = async (jobId) => {
    setLoading(true);
    setCreatorLoading(true);
    try {
      const response = await api.get(`/collaborator/jobs/${jobId}`);
      const jobData = response.data || {};
      const creatorData = jobData.creator || {};
      console.log('[UX] raw job data:', JSON.stringify({ work_attachment: jobData.work_attachment, attachments: jobData.attachments, external_file_link: jobData.external_file_link }));
      setJob(jobData);
      setCreator(creatorData);
      if (creatorData.country) setCreatorLocationName(creatorData.country);
      if (creatorData.country_code) setCreatorCountryCode(creatorData.country_code);
      if (creatorData.full_name) setCreatorName(creatorData.full_name);
      const creatorId = jobData.employer_id || creatorData.id;
      if (creatorId) await fetchCreatorDetails(creatorId);
    } catch (error) {
      console.error('Error fetching job details:', error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
      setCreatorLoading(false);
    }
  };

  // ✅ FIXED: Use the same approach as Proposal.jsx
  const downloadFile = async (attachmentPath, filename) => {
    let loadingToast = null;
    try {
      loadingToast = toast.loading("Preparing download...");
      
      // Add to downloading set
      setDownloadingFiles(prev => new Set([...prev, filename]));

      // ✅ Get the download URL from backend (same as Proposal.jsx)
      const response = await api.get(`/jobs/download-attachment/${job?.id}/${filename}`);
      
      toast.dismiss(loadingToast);

      // ✅ Handle S3 response with download_url
      if (response.data && response.data.download_url) {
        const downloadUrl = response.data.download_url;
        const isViewable = /\.(pdf|jpg|jpeg|png|gif|webp|svg)$/i.test(filename);
        
        if (isViewable) {
          // For viewable files, open in new tab
          window.open(downloadUrl, '_blank');
          toast.success('Opening file...');
        } else {
          // For other files, download directly
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast.success('Download started!');
        }
        return;
      }

      // ✅ Handle blob response (local mode)
      if (response.data instanceof Blob || response.data instanceof ArrayBuffer) {
        const blob = new Blob([response.data]);
        const url = URL.createObjectURL(blob);
        const isViewable = /\.(pdf|jpg|jpeg|png|gif|webp|svg)$/i.test(filename);
        
        if (isViewable) {
          window.open(url, '_blank');
          setTimeout(() => URL.revokeObjectURL(url), 5000);
          toast.success('Opening file...');
        } else {
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          link.remove();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          toast.success('Download started!');
        }
        return;
      }

      toast.error('Unexpected response format');

    } catch (error) {
      if (loadingToast) toast.dismiss(loadingToast);
      console.error('Download error:', error);
      
      // ✅ Fallback: Try direct URL approach
      try {
        // If it's a relative path, construct the full URL
        let fallbackUrl = attachmentPath;
        if (!fallbackUrl.startsWith('http://') && !fallbackUrl.startsWith('https://')) {
          const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
          fallbackUrl = `${baseUrl}/jobs/download-attachment/${job?.id}/${filename}`;
        }
        
        toast.info('Trying alternative download...');
        window.open(fallbackUrl, '_blank');
      } catch (fallbackError) {
        toast.error('Failed to download file');
      }
    } finally {
      // Remove from downloading set after a delay
      setTimeout(() => {
        setDownloadingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(filename);
          return newSet;
        });
        setDownloadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[filename];
          return newProgress;
        });
      }, 1000);
    }
  };

  const fetchCreatorDetails = async (creatorId) => {
    if (!creatorId) {
      setCreatorLoading(false);
      return;
    }
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

      // ✅ Rating & reviews from creator endpoint
      setCreatorRating(d.rating || d.skills_rating || 0);
      setCreatorReviewsCount(d.reviews_count || d.review_count || 0);
      if (d.reviews && Array.isArray(d.reviews)) {
        setReviews(d.reviews);
      } else if (d.review_data && Array.isArray(d.review_data)) {
        setReviews(d.review_data);
      } else {
        setReviews([]);
      }

      setCreatorJobsCount(d.total_jobs_posted || d.jobs_count || 0);

      try {
        const jobsRes = await api.get(`/jobs/my-jobs/${creatorId}?status=posted`);
        if (jobsRes.data?.count !== undefined) {
          setCreatorJobsCount(jobsRes.data.count);
        } else if (Array.isArray(jobsRes.data?.jobs)) {
          setCreatorJobsCount(jobsRes.data.jobs.length);
        }
      } catch (_) { }

      try {
        const statsRes = await api.get(`/contracts/status-counts?user_id=${creatorId}`);
        setHiredCount(statsRes.data?.completed || 0);
        setCompletedProjects(statsRes.data?.completed || 0);
      } catch (_) { }
    } catch (error) {
      console.error('Error fetching creator details:', error);
    } finally {
      setCreatorLoading(false);
    }
  };

  useEffect(() => {
    if (!userData?.id) return;
    const load = async () => {
      try {
        const r = await api.get(`/collaborator/jobs/saved/${userData.id}`);
        if (r.data?.length > 0) setSavedJobs(new Set(r.data.map(j => j.id)));
      } catch (e) { console.error(e); }
    };
    load();
  }, [userData]);

  const handleSaveJob = async () => {
    if (!userData?.id || !job?.id) { toast.error('Please login to save jobs'); return; }
    try {
      const r = await api.post('/collaborator/jobs/toggle-save', null, {
        params: { user_id: userData.id, job_id: job.id }
      });
      if (r.data.status === 'saved') {
        setSavedJobs(prev => new Set([...prev, job.id]));
        toast.success('Job saved successfully');
      } else {
        setSavedJobs(prev => { const s = new Set(prev); s.delete(job.id); return s; });
        toast.info('Job removed from saved');
      }
    } catch { toast.error('Failed to save job'); }
  };

  const handleSubmitProposal = () => {
    navigate('/Uploadux', {
      state: {
        jobId: job?.id, jobTitle: job?.title, budget: job?.budget,
        budget_type: job?.budget_type, budget_from: job?.budget_from, budget_to: job?.budget_to
      }
    });
  };

  const handleMessage = () => {
    const creatorId = job?.employer_id || creator?.id;

    if (!creatorId) {
      toast.error("Cannot open chat");
      return;
    }

    navigate(`/message?user=${creatorId}`, {
      state: {
        receiverId: creatorId,
        userName: displayName,
        profilePicture: creatorProfilePic,
      },
    });
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Recently";
    try {
      const diffMs = new Date() - new Date(dateString);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      if (diffHours < 1) return "Recently";
      if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      if (diffDays === 1) return "1 day ago";
      if (diffDays < 7) return `${diffDays} days ago`;
      return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return "Recently"; }
  };

  const formatBudget = () => {
    if (!job) return '₹0.00';

    const isFixed = job.budget_type === 'fixed' || job.budget_type === 'Fixed';

    if (isFixed) {
      if (job.budget_from !== null && job.budget_from > 0) {
        return `₹${job.budget_from}`;
      } else if (job.budget_to !== null && job.budget_to > 0) {
        return `₹${job.budget_to}`;
      } else if (job.budget) {
        return job.budget;
      }
      return '₹0.00';
    } else {
      if (job.budget_from && job.budget_to && job.budget_from !== job.budget_to) {
        return `₹${job.budget_from} - ₹${job.budget_to}`;
      } else if (job.budget_from) {
        return `₹${job.budget_from}`;
      } else if (job.budget_to) {
        return `₹${job.budget_to}`;
      } else if (job.budget) {
        return job.budget;
      }
      return '₹0.00';
    }
  };

  const formatDate = (d) => {
    if (!d) return null;
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return null; }
  };

  const calculateEndDate = () => {
    if (job?.end_date) return formatDate(job.end_date);
    const startDate = job?.start_date ? new Date(job.start_date) : (job?.created_at ? new Date(job.created_at) : null);
    if (!startDate || !job?.duration) return null;
    const duration = job.duration.toLowerCase();
    const numbers = duration.match(/\d+/);
    if (!numbers) return null;
    const value = parseInt(numbers[0]);
    let daysToAdd = 30;
    if (duration.includes('day')) daysToAdd = value;
    else if (duration.includes('week')) daysToAdd = value * 7;
    else if (duration.includes('month')) daysToAdd = value * 30;
    else if (duration.includes('year')) daysToAdd = value * 365;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + daysToAdd);
    return formatDate(endDate);
  };

  const getJobSkills = () => {
    if (!job) return [];
    const skills = job.skills || job.skills_required || job.required_skills || [];
    if (typeof skills === 'string') {
      try { const p = JSON.parse(skills); return Array.isArray(p) ? p : [skills]; }
      catch { return skills.split(',').map(s => s.trim()).filter(Boolean); }
    }
    return Array.isArray(skills) ? skills : [];
  };

  // ✅ Get attachment filename - same as Proposal.jsx
  const getAttachmentFileName = (att) => {
    if (!att) return 'Attachment';
    // Handle both URL formats
    let filename = att.split('/').pop() || 'Attachment';
    // Remove query parameters if present
    return filename.split('?')[0];
  };

  // ✅ Get attachment URL - same as Proposal.jsx
  const getAttachmentUrl = (att) => {
    if (!att) return null;
    
    // If it's already a fully-qualified URL (S3 presigned URL), use it as-is
    if (att.startsWith('http://') || att.startsWith('https://')) {
      return att;
    }
    
    // Otherwise, return the path as-is (will be handled by download endpoint)
    return att;
  };

  if (loading && !job) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <div className="animate-pulse">
          <div className="h-[350px] bg-gray-200 w-full"></div>
          <div className="max-w-[1100px] mx-auto p-6">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="h-8 bg-gray-200 rounded w-2/3 mb-5"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const jobSkills = getJobSkills();
  const displayLocation = creatorLocationName || creator?.country || "Remote";
  const displayName = creatorName || creator?.full_name || creator?.name || "Client";
  const calculatedEndDate = calculateEndDate();
  const displayStartDate = formatDate(job?.start_date) || formatDate(job?.created_at) || "—";

  return (
    <div className="w-full bg-[#F5F5F5] min-h-screen">
      {/* Banner */}
      <div className="relative w-full h-[380px] md:h-[460px] xl:h-[500px]">
        <div className="absolute top-0 left-0 w-full z-50">
          <ColHeader />
        </div>
        <img src={TopBanner} alt="banner" className="absolute inset-0 w-full h-full object-cover blur-[1px]" />
      </div>

      {/* Page wrapper */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-[1100px] mx-4 sm:mx-6 -mt-[210px] lg:-mt-[260px] bg-white border border-gray-200 shadow-sm mb-10">

          {/* Back Button */}
          <div className="border-b border-gray-100 px-6 md:px-8 pt-4 pb-3">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 group">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-r from-[#51218F] to-[#2a0e4a] group-hover:opacity-80 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </div>
              <span className="font-semibold text-[14px] text-[#51218F] group-hover:text-[#3d1768]">Back</span>
            </button>
          </div>

          <div className="flex flex-col lg:flex-row">

            {/* ── LEFT COLUMN ── */}
            <div className="flex-1 min-w-0 px-6 md:px-8 py-6">

              {/* Title + Budget */}
              <div className="flex justify-between items-start gap-4 mb-1">
                <h2 className="text-[22px] sm:text-[26px] font-bold leading-snug text-gray-900">
                  {job?.title || "Job Title"}
                </h2>
                <div className="text-right shrink-0">
                  <p className="text-[18px] font-bold text-gray-900">{formatBudget()}</p>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide mt-0.5">
                    {job?.budget_type === 'fixed' ? 'Fixed Price' : (job?.budget_type || 'Hourly Rate')}
                  </p>
                </div>
              </div>

              <p className="text-[13px] text-gray-400 mb-5">Posted {formatTimeAgo(job?.created_at)}</p>

              {/* Description */}
              <p className="text-[15px] leading-[26px] text-gray-700 mb-5 whitespace-pre-wrap">
                {job?.description || "No description available"}
              </p>

              {/* Skills */}
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

              {/* Details Grid */}
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

              {/* ✅ Attachments - Using same approach as Proposal.jsx */}
              {(() => {
                const hasWorkAtt = !!job?.work_attachment;
                const hasExtLink = !!job?.external_file_link;
                const hasAtts = Array.isArray(job?.attachments) && job.attachments.length > 0;
                
                if (!hasWorkAtt && !hasExtLink && !hasAtts) return null;
                
                return (
                  <>
                    <div className="h-px bg-gray-100 mb-4"></div>
                    <div className="mb-4">
                      <p className="text-[14px] font-semibold text-gray-700 mb-2">Attachments</p>
                      <div className="flex flex-col gap-2">

                        {hasExtLink && (
                          <a
                            href={job.external_file_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-[13px] text-[#5B2D91] hover:underline"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                            View External File
                          </a>
                        )}

                        {hasWorkAtt && (() => {
                          const fileName = getAttachmentFileName(job.work_attachment);
                          const isDownloading = downloadingFiles.has(fileName);
                          const progress = downloadProgress[fileName] || 0;

                          return (
                            <button
                              onClick={() => downloadFile(job.work_attachment, fileName)}
                              className="flex items-center gap-2 text-[13px] text-[#5B2D91] hover:underline text-left"
                              disabled={isDownloading}
                            >
                              {isDownloading ? (
                                <>
                                  <div className="relative w-4 h-4">
                                    <svg className="w-4 h-4 animate-spin text-[#5B2D91]" viewBox="0 0 24 24" fill="none">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    {progress > 0 && progress < 100 && (
                                      <div
                                        className="absolute inset-0 rounded-full border-2 border-[#5B2D91]"
                                        style={{
                                          background: `conic-gradient(#5B2D91 ${progress}%, transparent ${progress}%)`,
                                          clipPath: 'circle(50%)'
                                        }}
                                      />
                                    )}
                                  </div>
                                  <span className="text-[#5B2D91]">
                                    {progress > 0 && progress < 100 ? `${Math.round(progress)}%` : 'Downloading...'}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                  </svg>
                                  {fileName}
                                </>
                              )}
                            </button>
                          );
                        })()}

                        {hasAtts && job.attachments.map((att, i) => {
                          const fileName = getAttachmentFileName(att);
                          const isDownloading = downloadingFiles.has(fileName);
                          const progress = downloadProgress[fileName] || 0;

                          return (
                            <button
                              key={`job-att-${i}`}
                              onClick={() => downloadFile(att, fileName)}
                              className="flex items-center gap-2 text-[13px] text-[#5B2D91] hover:underline text-left"
                              disabled={isDownloading}
                            >
                              {isDownloading ? (
                                <>
                                  <div className="relative w-4 h-4">
                                    <svg className="w-4 h-4 animate-spin text-[#5B2D91]" viewBox="0 0 24 24" fill="none">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    {progress > 0 && progress < 100 && (
                                      <div
                                        className="absolute inset-0 rounded-full border-2 border-[#5B2D91]"
                                        style={{
                                          background: `conic-gradient(#5B2D91 ${progress}%, transparent ${progress}%)`,
                                          clipPath: 'circle(50%)'
                                        }}
                                      />
                                    )}
                                  </div>
                                  <span className="text-[#5B2D91]">
                                    {progress > 0 && progress < 100 ? `${Math.round(progress)}%` : 'Downloading...'}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                  </svg>
                                  {fileName}
                                </>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Vertical divider */}
            <div className="hidden lg:block w-px bg-gray-100 shrink-0"></div>

            {/* ── RIGHT SIDEBAR ── */}
            <div className="w-full lg:w-[270px] shrink-0 px-6 py-6 border-t lg:border-t-0 border-gray-100">

              {/* CTA Buttons */}
              <button onClick={handleSubmitProposal}
                className="w-full bg-[#5B2D91] text-white py-3 rounded-full text-[14px] font-semibold mb-3 hover:bg-[#4a2373] transition-colors">
                Submit a Proposal
              </button>

              <button onClick={handleSaveJob}
                className="w-full bg-[#5B2D91] text-white py-3 rounded-full text-[14px] font-semibold mb-3 hover:bg-[#4a2373] transition-colors">
                {savedJobs.has(job?.id) ? 'Saved ✓' : 'Save Project'}
              </button>

              <button onClick={handleMessage}
                className="w-full bg-gray-200 border border-gray-400 text-black py-3 rounded-full text-[14px] font-semibold mb-5 hover:bg-gray-300 transition-colors flex items-center justify-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Message Client
              </button>

              <div className="h-px bg-gray-100 mb-5"></div>

              {/* About the Client */}
              <div>
                <h3 className="text-[15px] font-bold mb-3 text-gray-800">About the Client</h3>

                {/* Purple loader for client details */}
                {creatorLoading ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-10 h-10 border-4 border-[#51218F] border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-xs text-gray-500">Loading client details...</p>
                  </div>
                ) : (
                  <>
                    {/* Creator Profile Picture + Name */}
                    <div className="flex items-center gap-3 mb-3">
                      {creatorProfilePic ? (
                        <img src={creatorProfilePic} alt={displayName}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                          onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#5B2D91] flex items-center justify-center text-white font-bold text-[15px]">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <p className="text-[15px] font-bold text-gray-900">{displayName}</p>
                    </div>

                    {/* Location + Joined */}
                    <div className="space-y-2 text-[13px] text-gray-600 mb-5">
                      <div className="flex items-center gap-2">
                        {creatorCountryCode ? (
                          <img src={`https://flagcdn.com/w20/${creatorCountryCode.toLowerCase()}.png`}
                            alt={displayLocation} className="w-[16px] h-[11px] rounded-sm object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                            <circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 3" />
                          </svg>
                        )}
                        <span className="font-medium">{displayLocation}</span>
                      </div>

                      {creatorJoinedDate && (
                        <div className="flex items-center gap-2">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          <span>Joined {formatDate(creatorJoinedDate)}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats — 3 equal columns */}
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

                    {/* Rating summary */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex text-[#51218F] text-sm">
                        {"★".repeat(Math.floor(creatorRating))}
                        {"☆".repeat(5 - Math.floor(creatorRating))}
                      </div>
                      <span className="text-[13px] text-gray-600">
                        {creatorRating.toFixed(1)} ({creatorReviewsCount} {creatorReviewsCount === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>

                    <div className="h-px bg-gray-100 mb-4"></div>

                    {/* Verifications */}
                    <div className="space-y-2.5 text-[13px]">
                      <div className="flex items-center gap-2">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                          <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7l.5 2.5a2 2 0 0 1-.6 1.8l-1.2 1.2a16 16 0 0 0 6.6 6.6l1.2-1.2a2 2 0 0 1 1.8-.6l2.5.5a2 2 0 0 1 1.7 2.2Z"
                            stroke={creatorPhoneVerified ? "#10B981" : "#D1D5DB"} strokeWidth="1.5" />
                        </svg>
                        <span className={creatorPhoneVerified ? "text-green-600 font-medium" : "text-gray-400"}>
                          {creatorPhoneVerified ? "Phone Verified" : "Phone not verified"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="5" width="18" height="14" rx="2"
                            stroke={creatorEmailVerified ? "#10B981" : "#D1D5DB"} strokeWidth="1.5" />
                          <path d="M3 7l9 6 9-6" stroke={creatorEmailVerified ? "#10B981" : "#D1D5DB"} strokeWidth="1.5" />
                        </svg>
                        <span className={creatorEmailVerified ? "text-green-600 font-medium" : "text-gray-400"}>
                          {creatorEmailVerified ? "Email Verified" : "Email not verified"}
                        </span>
                      </div>
                    </div>

                    {/* ========== REVIEWS SECTION ========== */}
                    {reviews.length > 0 && (
                      <div className="mt-6">
                        <div className="h-px bg-gray-100 mb-4"></div>
                        <h4 className="text-[14px] font-bold mb-3 text-gray-800">Client Reviews</h4>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                          {reviews.slice(0, 5).map((review, idx) => (
                            <div key={idx} className="border-b border-gray-100 pb-3 last:border-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[13px] font-medium text-gray-800">
                                  {review.reviewer_name || "Anonymous"}
                                </span>
                                <span className="text-[11px] text-gray-400">
                                  {review.date || formatDate(review.created_at)}
                                </span>
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
                          <button
                            onClick={() => navigate(`/creator-reviews/${creator?.id}`)}
                            className="text-[12px] text-[#5B2D91] hover:underline mt-2"
                          >
                            See all {creatorReviewsCount} reviews →
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}