// frontend_user/src/pages/MyProject/Pending.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import BannerImg from "../../assets/myproject/banner.png";
import Footer from "../../component/Footer";
import Header from "../../component/Header";
import api from "../../utils/axiosConfig";
import { useUser } from "../../contexts/UserContext";
import toast from "../../component/Toast";

export default function Pending() {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusCounts, setStatusCounts] = useState({
    accepted: 0,
    awaiting: 0,
    in_progress: 0,
    pending: 0,
    completed: 0,
    in_review: 0,
  });
  const [processingPayment, setProcessingPayment] = useState(false);
  const [reposting, setReposting] = useState(false);

  // Milestone states
  const [milestones, setMilestones] = useState([]);
  const [selectedMilestoneForReview, setSelectedMilestoneForReview] = useState(null);
  const [showMilestoneReviewModal, setShowMilestoneReviewModal] = useState(false);
  const [reviewComments, setReviewComments] = useState("");

  // Milestone revision states
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionDescription, setRevisionDescription] = useState("");
  const [submittingRevision, setSubmittingRevision] = useState(false);

  // Full project revision states
  const [showFullProjectRevisionModal, setShowFullProjectRevisionModal] = useState(false);
  const [fullProjectRevisionDesc, setFullProjectRevisionDesc] = useState("");
  const [submittingFullRevision, setSubmittingFullRevision] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { contractId } = useParams();
  const { userData } = useUser();

  const tabs = [
    { name: "Active contracts", path: "/activecontracts", key: "in_progress" },
    { name: "Awaiting contracts", path: "/awaitingcontracts", key: "awaiting" },
    { name: "In Review", path: "/pendingcontracts", key: "in_review" },
    { name: "Pending contracts", path: "/pendingstatuscontracts", key: "pending" },
    { name: "Completed contracts", path: "/completedcontracts", key: "completed" },
  ];

  useEffect(() => {
    if (contractId && userData?.id) {
      fetchContractDetails();
      fetchStatusCounts();
    }
  }, [contractId, userData]);

  // Parse milestones when contract loads
  useEffect(() => {
    if (contract?.milestones_data && contract.milestones_data.length > 0) {
      setMilestones(contract.milestones_data);
    } else {
      setMilestones([]);
    }
  }, [contract]);

  const fetchStatusCounts = async () => {
    try {
      const response = await api.get("/contracts/status-counts", {
        params: { user_id: userData.id },
      });
      setStatusCounts(response.data);
    } catch (error) {
      console.error("Error fetching status counts:", error);
    }
  };

  const fetchContractDetails = async () => {
    try {
      setLoading(true);
      
      try {
        const directResponse = await api.get(`/contracts/${contractId}/details`, {
          params: { user_id: userData.id }
        });
        if (directResponse.data) {
          setContract(directResponse.data);
          if (directResponse.data.milestones_data && directResponse.data.milestones_data.length > 0) {
            setMilestones(directResponse.data.milestones_data);
          } else {
            setMilestones([]);
          }
          setLoading(false);
          return;
        }
      } catch (directError) {
        console.log("Direct fetch failed, trying list fetch...", directError.message);
      }
      
      const [reviewRes, cancelledRes] = await Promise.all([
        api.get("/contracts/by-status", {
          params: { status: "in_review", user_id: userData.id },
        }),
        api.get("/contracts/by-status", {
          params: { status: "cancelled", user_id: userData.id },
        }).catch(() => ({ data: [] })),
      ]);

      const all = [
        ...(Array.isArray(reviewRes.data) ? reviewRes.data : []),
        ...(Array.isArray(cancelledRes.data) ? cancelledRes.data : []),
      ];

      const found = all.find((c) => c.id === parseInt(contractId));
      if (found) {
        setContract(found);
        if (found.milestones_data && found.milestones_data.length > 0) {
          setMilestones(found.milestones_data);
        } else {
          setMilestones([]);
        }
      } else {
        console.error("Contract not found in list");
      }
    } catch (error) {
      console.error("Error fetching contract details:", error);
      toast.error("Failed to load contract details");
    } finally {
      setLoading(false);
    }
  };

  const isCancelled = contract?.status?.toLowerCase() === "cancelled";

  const handleApproveMilestone = (milestoneIndex) => {
    const milestone = milestones[milestoneIndex];
    if (!milestone) {
      toast.error("Milestone not found");
      return;
    }

    navigate("/choose-payment", {
      state: {
        openTransferModal: true,
        contractId: contract.id,
        collaboratorEmail: contract.collaborator?.email,
        collaboratorName: contract.collaborator?.name,
        collaboratorId: contract.collaborator?.id,
        amount: milestone.amount,
        jobTitle: `${contract.job_title} - Milestone ${milestoneIndex + 1}: ${milestone.description}`,
        fromPage: "pending",
        isMilestonePayment: true,
        milestoneIndex: milestoneIndex,
        milestoneDescription: milestone.description,
        isOverdue: false,
        overdueDays: 0,
      },
    });
  };

  const handleRequestMilestoneRevision = async (milestoneIndex) => {
    if (!revisionDescription.trim()) {
      toast.error("Please provide revision comments");
      return;
    }

    setSubmittingRevision(true);
    try {
      const formData = new FormData();
      formData.append('revision_comments', revisionDescription);
      
      const response = await api.post(
        `/contracts/${contract.id}/milestones/${milestoneIndex}/request-revision?user_id=${userData.id}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      if (response.data.success) {
        toast.success("Revision requested successfully");
        setShowRevisionModal(false);
        setRevisionDescription("");
        setSelectedMilestoneForReview(null);
        await fetchContractDetails();
      } else {
        throw new Error(response.data.message || "Failed to request revision");
      }
    } catch (error) {
      console.error("Revision error:", error);
      const errorMsg = error.response?.data?.detail || error.message || "Please try again";
      toast.error("Failed to request revision", errorMsg);
    } finally {
      setSubmittingRevision(false);
    }
  };

  const handleRequestFullProjectRevision = async () => {
    if (!fullProjectRevisionDesc.trim()) {
      toast.error("Please provide revision comments");
      return;
    }

    if (!contract?.id) {
      toast.error("Contract not found");
      return;
    }

    setSubmittingFullRevision(true);
    try {
      const formData = new FormData();
      formData.append('description', fullProjectRevisionDesc);

      const response = await api.post(
        `/contracts/${contract.id}/request-revision?user_id=${userData.id}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      if (response.data) {
        toast.success("Revision requested successfully");
        setShowFullProjectRevisionModal(false);
        setFullProjectRevisionDesc("");
        await fetchContractDetails();
        await fetchStatusCounts();
      } else {
        throw new Error(response.data?.message || "Failed to request revision");
      }
    } catch (error) {
      console.error("Full project revision error:", error);
      const errorMsg = error.response?.data?.detail || error.message || "Please try again";
      toast.error("Failed to request revision", errorMsg);
    } finally {
      setSubmittingFullRevision(false);
    }
  };

  const handleApproveAndPay = () => {
    if (!contract?.id) return;

    let isOverdue = false;
    let overdueDays = 0;
    if (contract.end_date && contract.work_submitted_at) {
      const endDate = new Date(contract.end_date);
      const submittedDate = new Date(contract.work_submitted_at);
      if (submittedDate > endDate) {
        isOverdue = true;
        overdueDays = Math.ceil(
          (submittedDate - endDate) / (1000 * 60 * 60 * 24),
        );
      }
    }

    navigate("/choose-payment", {
      state: {
        openTransferModal: true,
        contractId: contract.id,
        collaboratorEmail: contract.collaborator?.email,
        collaboratorName: contract.collaborator?.name,
        collaboratorId: contract.collaborator?.id,
        amount: contract.budget,
        jobTitle: contract.job_title,
        fromPage: "pending",
        isOverdue,
        overdueDays,
      },
    });
  };

  const handleRepostJob = async () => {
    if (!contract?.id || !userData?.id) return;
    try {
      setReposting(true);
      await api.post(`/contracts/${contract.id}/repost-job`, null, {
        params: { user_id: userData.id },
      });
      toast.success(
        "Job re-posted",
        "Your job is live again and open for new proposals.",
      );
      navigate("/activecontracts");
    } catch (error) {
      console.error("Repost error:", error);
      toast.error(
        "Failed to re-post job",
        error.response?.data?.detail || "Please try again",
      );
    } finally {
      setReposting(false);
    }
  };

  const handleDownloadWork = async () => {
    if (!contract?.id) return;
    try {
      setLoading(true);
      const response = await api.get(
        `/contracts/${contract.id}/download-work`,
        {
          params: { user_id: userData.id },
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `work_submission_${contract.id}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Download started");
    } catch (error) {
      console.error("Error downloading work:", error);
      toast.error(
        "Download failed",
        error.response?.data?.detail || "Could not retrieve file",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contractId && userData?.id) {
      fetchContractDetails();
      fetchStatusCounts();
    }
  }, [contractId, userData?.id, location.state?.refreshed]);

  const handleMessageClick = () => {
    const collaboratorId = contract?.collaborator?.id;
    if (collaboratorId) {
      navigate(`/message?user=${collaboratorId}`);
    } else {
      toast.error("Cannot message", "Collaborator information not available");
    }
  };

  const getClientName = () => contract?.creator?.name || "Client";
  const getCollaboratorName = () => contract?.collaborator?.name || "N/A";
  const getCollaboratorEmail = () => contract?.collaborator?.email || "N/A";

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleString();
  };

  const renderMilestonesReview = () => {
    if (!milestones || milestones.length === 0) {
      return null;
    }

    const completedCount = milestones.filter((m) => m.status === "paid").length;
    const totalAmount = milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
    const paidAmount = milestones
      .filter((m) => m.status === "paid")
      .reduce((sum, m) => sum + (m.amount || 0), 0);

    return (
      <div>
        <div className="flex justify-between items-center mb-3 md:mb-4">
          <h3 className="text-base md:text-lg font-semibold text-[#5A1FA8] flex items-center gap-1.5 md:gap-2">
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Milestone Progress
          </h3>
          <div className="text-xs md:text-sm text-gray-600">
            <span className="font-semibold text-green-600">₹{paidAmount}</span>{" "}
            paid of <span className="font-semibold">₹{totalAmount}</span>
          </div>
        </div>

        <div className="space-y-3 md:space-y-4">
          {milestones.map((milestone, idx) => {
            const isSubmitted = milestone.status === "submitted";
            const isPaid = milestone.status === "paid";
            const isInProgress = milestone.status === "in_progress";
            const isRevisionRequested = milestone.status === "revision_requested";

            return (
              <div
                key={idx}
                className={`p-3 md:p-4 rounded-xl border ${
                  isPaid
                    ? "bg-green-50 border-green-200"
                    : isSubmitted
                      ? "bg-yellow-50 border-yellow-200"
                      : isInProgress
                        ? "bg-blue-50 border-blue-200"
                        : isRevisionRequested
                          ? "bg-orange-50 border-orange-200"
                          : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          isPaid
                            ? "bg-green-500"
                            : isSubmitted
                              ? "bg-yellow-500"
                              : isInProgress
                                ? "bg-blue-500"
                                : isRevisionRequested
                                  ? "bg-orange-500"
                                  : "bg-gray-400"
                        }`}
                      />
                      <h4 className="font-semibold text-gray-800 text-sm md:text-base truncate">
                        Milestone {idx + 1}: {milestone.description}
                      </h4>
                    </div>

                    <div className="flex flex-wrap gap-2 md:gap-3 text-xs md:text-sm text-gray-600 mb-1.5 md:mb-2">
                      <span>
                        Amount:{" "}
                        <span className="font-semibold text-purple-700">
                          ₹{milestone.amount}
                        </span>
                      </span>
                      {milestone.due_date && (
                        <span>Due: {milestone.due_date}</span>
                      )}
                    </div>

                    {isSubmitted && milestone.submission && (
                      <div className="mt-2 md:mt-3 p-2.5 md:p-3 bg-white rounded-lg border border-yellow-100">
                        <p className="text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Submitted Work:</p>
                        {milestone.submission.description && (
                          <p className="text-xs md:text-sm text-gray-600 mb-1.5 md:mb-2">{milestone.submission.description}</p>
                        )}
                        
                        {milestone.submission.external_link && (
                          <div className="mb-1.5 md:mb-2">
                            <p className="text-[10px] md:text-xs font-semibold text-gray-500 mb-0.5 md:mb-1">External Link:</p>
                            <a 
                              href={milestone.submission.external_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-purple-600 text-xs md:text-sm underline break-all hover:text-purple-800"
                            >
                              {milestone.submission.external_link}
                            </a>
                          </div>
                        )}
                        
                        {milestone.submission.attachment && (
                          <div className="mb-1.5 md:mb-2">
                            <p className="text-[10px] md:text-xs font-semibold text-gray-500 mb-0.5 md:mb-1">Attachment:</p>
                            <button
                              onClick={async () => {
                                try {
                                  const response = await api.get(
                                    `/contracts/${contract.id}/milestones/${idx}/download-attachment`,
                                    {
                                      params: { user_id: userData.id },
                                      responseType: "blob"
                                    }
                                  );
                                  const url = window.URL.createObjectURL(new Blob([response.data]));
                                  const a = document.createElement("a");
                                  a.href = url;
                                  a.download = milestone.submission.attachment_name || `milestone_${idx + 1}_work`;
                                  document.body.appendChild(a);
                                  a.click();
                                  setTimeout(() => {
                                    window.URL.revokeObjectURL(url);
                                    document.body.removeChild(a);
                                  }, 100);
                                } catch (error) {
                                  console.error("Download error:", error);
                                  toast.error("Download failed", "Could not retrieve file.");
                                }
                              }}
                              className="text-blue-600 text-xs md:text-sm underline hover:text-blue-800 flex items-center gap-1"
                            >
                              <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Download {milestone.submission.attachment_name || "Attachment"}
                            </button>
                          </div>
                        )}
                        
                        {milestone.submission.submitted_at && (
                          <p className="text-[10px] md:text-xs text-gray-400 mt-1.5 md:mt-2">
                            Submitted: {formatDateTime(milestone.submission.submitted_at)}
                          </p>
                        )}

                        {!isCancelled && milestones.length > 0 && (
                          <div className="flex gap-2 md:gap-3 mt-2 md:mt-3">
                            <button
                              onClick={() => handleApproveMilestone(idx)}
                              className="px-3 py-1.5 md:px-4 md:py-1.5 rounded-full bg-green-600 text-white text-xs md:text-sm hover:bg-green-700"
                            >
                              Approve & Pay ₹{milestone.amount}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedMilestoneForReview({ index: idx, ...milestone });
                                setRevisionDescription("");
                                setShowRevisionModal(true);
                              }}
                              className="px-3 py-1.5 md:px-4 md:py-1.5 rounded-full border border-amber-500 text-amber-600 text-xs md:text-sm hover:bg-amber-50 transition"
                            >
                              Request Revision
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {isRevisionRequested && milestone.review && (
                      <div className="mt-2 md:mt-3 p-2.5 md:p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-xs md:text-sm font-medium text-orange-700 mb-0.5 md:mb-1">
                          Revision Requested:
                        </p>
                        <p className="text-xs md:text-sm text-orange-600">
                          {milestone.review.comments || "No additional comments"}
                        </p>
                        <p className="text-[10px] md:text-xs text-orange-400 mt-0.5 md:mt-1">
                          Awaiting resubmission
                        </p>
                      </div>
                    )}

                    {isPaid && milestone.payment && (
                      <div className="mt-1.5 md:mt-2 text-[10px] md:text-xs text-green-600">
                        Paid on: {formatDateTime(milestone.payment.paid_at)}
                        {milestone.payment.transaction_id &&
                          ` • TXN: ${milestone.payment.transaction_id}`}
                      </div>
                    )}
                  </div>

                  <span
                    className={`ml-2 md:ml-3 px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                      isPaid
                        ? "bg-green-100 text-green-700"
                        : isSubmitted
                          ? "bg-yellow-100 text-yellow-700"
                          : isInProgress
                            ? "bg-blue-100 text-blue-700"
                            : isRevisionRequested
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {isPaid
                      ? "Paid ✓"
                      : isSubmitted
                        ? "Under Review"
                        : isInProgress
                          ? "In Progress"
                          : isRevisionRequested
                            ? "Revision Needed"
                            : milestone.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#F5F5F5] overflow-x-hidden">
        <div className="absolute top-0 left-0 w-full z-50">
          <Header />
        </div>
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#5A1FA8] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 text-sm">Loading contract...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="w-full min-h-screen bg-[#F5F5F5] overflow-x-hidden">
        <div className="absolute top-0 left-0 w-full z-50">
          <Header />
        </div>
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-600">Contract not found</p>
        </div>
      </div>
    );
  }

  const calculateOverdue = () => {
    if (!contract?.end_date || !contract?.work_submitted_at) return null;
    const endDate = new Date(contract.end_date);
    const submittedDate = new Date(contract.work_submitted_at);
    if (submittedDate > endDate) {
      const diffDays = Math.ceil(
        (submittedDate - endDate) / (1000 * 60 * 60 * 24),
      );
      return { overdue: true, extraDays: diffDays };
    }
    return { overdue: false, extraDays: 0 };
  };

  const overdueInfo = calculateOverdue();
  const hasMilestones = milestones && milestones.length > 0;
  const isInReview = contract?.status?.toLowerCase() === "in_review";

  return (
    <div className="w-full min-h-screen bg-[#F5F5F5] overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full z-50">
        <Header />
      </div>

      {/* BANNER */}
      <div className="relative w-full h-[260px] md:h-[433px] overflow-hidden">
        <img
          src={BannerImg}
          className="absolute inset-0 w-full h-full object-cover"
          alt="Banner"
        />
        <div className="absolute inset-0 bg-black opacity-35" />

        <div className="relative z-10 text-white max-w-[1221px] mx-auto px-3 md:px-4 pt-6 md:pt-[131px] overflow-x-hidden">
          <div className="flex justify-between items-start md:items-center mb-1 w-full">
            {/* Desktop version */}
            <div className="hidden md:block">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-4 py-2 text-white hover:text-white/80 transition-colors group mt-14 md:mb-4"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-[#51218F] to-[#2a0e4a] group-hover:from-[#3d1768] group-hover:to-[#1a0830] transition-all">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </div>
                <span className="font-medium text-base">Back</span>
              </button>
              <h2 className="text-[28px] font-semibold">
                My contracts
              </h2>
            </div>
            
            {/* Mobile version */}
            <div className="block md:hidden w-full">
              <div className="flex justify-between items-center mt-14">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-1 px-2 py-1 text-white hover:text-white/80 transition-colors group"
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-[#51218F] to-[#2a0e4a] group-hover:from-[#3d1768] group-hover:to-[#1a0830] transition-all">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                  </div>
                  <span className="font-medium text-xs">Back</span>
                </button>
                <p className="text-[11px] font-semibold">Budget: ₹{contract?.budget || "0"} INR</p>
              </div>
              <h2 className="text-[16px] font-semibold text-center mt-2">
                My contracts
              </h2>
            </div>
            
            {/* Desktop total budget */}
            <p className="text-[22px] mt-20 font-semibold hidden md:block">
              Budget: ₹{contract?.budget || "0"} INR
            </p>
          </div>

          {/* TABS */}
         <div className="flex flex-col md:flex-row md:justify-center border-b border-white/20 font-semibold">
  {/* Top row - first 3 tabs on mobile & tablet */}
  <div className="flex justify-center text-[9px] sm:text-[11px] md:text-[13px] lg:text-[16px] xl:text-[17px] md:justify-center md:gap-1 lg:gap-2">
    {tabs.slice(0, 3).map((tab) => {
      const isActive =
        location.pathname === tab.path ||
        (tab.path === "/pendingcontracts" &&
          location.pathname.startsWith("/pending/"));
      return (
        <button
          key={tab.path}
          onClick={() => navigate(tab.path)}
          className={`relative pb-1.5 md:pb-2 pt-1 px-1 sm:px-1.5 md:px-2.5 lg:px-3 xl:px-4 whitespace-nowrap transition-colors duration-150 flex-1 md:flex-none ${
            isActive
              ? "text-white font-bold [text-shadow:0_1px_8px_rgba(0,0,0,0.8)]"
              : "text-white font-normal [text-shadow:0_1px_8px_rgba(0,0,0,0.8)] opacity-80 hover:opacity-100"
          }`}
        >
          {tab.name} ({statusCounts[tab.key] || 0})
          {isActive && (
            <span className="absolute bottom-0 left-1 right-1 lg:left-2 lg:right-2 h-[2px] md:h-[3px] bg-[#A855F7] rounded-full [box-shadow:0_0_8px_2px_rgba(168,85,247,0.8)]" />
          )}
        </button>
      );
    })}
  </div>

  {/* Bottom row - remaining 2 tabs on mobile & tablet */}
  <div className="flex justify-center text-[9px] sm:text-[11px] md:text-[13px] lg:text-[16px] xl:text-[17px] md:justify-center border-t border-white/20 md:border-t-0 md:gap-1 lg:gap-2">
    {tabs.slice(3).map((tab) => {
      const isActive =
        location.pathname === tab.path ||
        (tab.path === "/pendingcontracts" &&
          location.pathname.startsWith("/pending/"));
      return (
        <button
          key={tab.path}
          onClick={() => navigate(tab.path)}
          className={`relative pb-1.5 md:pb-2 pt-1 px-1 sm:px-1.5 md:px-2.5 lg:px-3 xl:px-4 whitespace-nowrap transition-colors duration-150 flex-1 md:flex-none ${
            isActive
              ? "text-white font-bold [text-shadow:0_1px_8px_rgba(0,0,0,0.8)]"
              : "text-white font-normal [text-shadow:0_1px_8px_rgba(0,0,0,0.8)] opacity-80 hover:opacity-100"
          }`}
        >
          {tab.name} ({statusCounts[tab.key] || 0})
          {isActive && (
            <span className="absolute bottom-0 left-1 right-1 lg:left-2 lg:right-2 h-[2px] md:h-[3px] bg-[#A855F7] rounded-full [box-shadow:0_0_8px_2px_rgba(168,85,247,0.8)]" />
          )}
        </button>
      );
    })}
  </div>
</div>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="relative -mt-[40px] md:-mt-[90px] max-w-[1200px] mx-auto px-2 sm:px-3 md:px-4 pb-10">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-3 sm:p-4 md:p-8 space-y-4 md:space-y-6">
            {/* Header: title + status badge + message button */}
            <div className="flex flex-wrap items-center justify-between gap-2 md:gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">
                  {contract?.job_title || "Untitled Project"}
                </h3>
                {isCancelled ? (
                  <span className="px-2.5 py-0.5 md:px-4 md:py-1.5 rounded-full bg-red-100 text-red-700 text-[10px] md:text-sm font-medium border border-red-200">
                    Cancelled by collaborator
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 md:px-4 md:py-1.5 rounded-full bg-amber-100 text-amber-700 text-[10px] md:text-sm font-medium shadow-sm">
                    In Review
                  </span>
                )}
              </div>

              <button
                onClick={handleMessageClick}
                className="inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-5 md:py-2.5 rounded-full bg-gradient-to-r from-[#5A1FA8] to-[#8B5CF6] text-white text-xs md:text-sm font-medium shadow-md hover:shadow-lg transition-all"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="md:w-[18px] md:h-[18px]"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <path d="M8 10h.01M12 10h.01M16 10h.01" strokeLinecap="round" />
                </svg>
                Message
              </button>
            </div>

            {/* Cancellation alert banner */}
            {isCancelled && (
              <div className="p-3 md:p-5 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-2 md:gap-3">
                  <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" className="md:w-[18px] md:h-[18px]">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-red-700 font-semibold text-xs md:text-sm mb-1">
                      This contract was cancelled by the collaborator
                    </p>
                    {contract.status_reason ? (
                      <>
                        <p className="text-red-600 text-[10px] md:text-xs mb-1.5 md:mb-2">Reason provided:</p>
                        <div className="bg-white border border-red-200 rounded-lg p-2 md:p-3">
                          <p className="text-red-800 text-xs md:text-sm leading-relaxed">
                            {contract.status_reason}
                          </p>
                        </div>
                      </>
                    ) : (
                      <p className="text-red-600 text-[10px] md:text-xs">No reason was provided.</p>
                    )}
                    <p className="text-red-500 text-[10px] md:text-xs mt-2 md:mt-3">
                      You can re-post the job to open it for new proposals.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 bg-gray-50 p-3 md:p-5 rounded-xl">
              <div>
                <p className="text-gray-500 text-[10px] md:text-sm">Client name</p>
                <p className="font-semibold text-gray-800 text-xs md:text-base">{getClientName()}</p>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] md:text-sm">Budget</p>
                <p className="text-xl md:text-2xl font-bold text-[#5A1FA8]">
                  ₹{contract?.budget}
                </p>
              </div>
              {(contract.start_date || contract.end_date) && (
                <div className="md:col-span-2">
                  <p className="text-gray-500 text-[10px] md:text-sm">Contract period</p>
                  <p className="font-medium text-gray-800 text-xs md:text-base">
                    {formatDate(contract.start_date)} — {formatDate(contract.end_date)}
                  </p>
                </div>
              )}
            </div>

            {/* Overdue warning */}
            {!isCancelled && overdueInfo?.overdue && (
              <div className="p-3 md:p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <p className="text-red-700 font-semibold flex items-center gap-1.5 md:gap-2 text-xs md:text-base">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md:w-[18px] md:h-[18px]">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  Work submitted {overdueInfo.extraDays} day(s) after deadline
                </p>
                <p className="text-red-600 text-[10px] md:text-sm mt-1">
                  The collaborator took {overdueInfo.extraDays} extra day(s) beyond the agreed end date.
                </p>
              </div>
            )}

            <div className="border-t border-gray-200" />

            {/* Collaborator Details */}
            {contract?.collaborator && (
              <>
                <div>
                  <h3 className="text-sm md:text-lg font-semibold text-[#5A1FA8] mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Collaborator Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 bg-gray-50 p-3 md:p-5 rounded-xl">
                    <div>
                      <p className="text-gray-500 text-[10px] md:text-sm">Name</p>
                      <p className="font-medium text-gray-800 text-xs md:text-base">{getCollaboratorName()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-[10px] md:text-sm">Email</p>
                      <p className="font-medium text-gray-800 text-xs md:text-base break-all">{getCollaboratorEmail()}</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200" />
              </>
            )}

            {/* Milestone Review Section */}
            {!isCancelled && renderMilestonesReview()}

            {/* Fallback for regular contracts without milestones */}
            {!isCancelled && !hasMilestones && contract?.work_submitted_at && (
              <div>
                <h3 className="text-sm md:text-lg font-semibold text-[#5A1FA8] mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2">
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Submitted Work
                </h3>
                <div className="bg-gray-50 p-3 md:p-5 rounded-xl space-y-2 md:space-y-3">
                  {contract?.work_description ? (
                    <p className="text-gray-700 whitespace-pre-wrap text-xs md:text-sm">{contract.work_description}</p>
                  ) : (
                    <p className="text-gray-500 italic text-xs md:text-sm">No work description provided.</p>
                  )}
                  {contract?.external_file_link && (
                    <div>
                      <p className="text-[10px] md:text-sm font-semibold text-gray-700 mb-0.5 md:mb-1">External Link</p>
                      <a
                        href={contract.external_file_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#5A1FA8] underline break-all hover:text-purple-700 text-xs md:text-sm"
                      >
                        {contract.external_file_link}
                      </a>
                    </div>
                  )}
                  {contract.work_submitted_at && (
                    <p className="text-[10px] md:text-sm text-gray-500">
                      Submitted on: {formatDateTime(contract.work_submitted_at)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap gap-2 md:gap-4 pt-2">
              {isCancelled ? (
                <>
                  <button
                    onClick={handleRepostJob}
                    disabled={reposting}
                    className="px-4 py-2 md:px-8 md:py-3 rounded-full bg-gradient-to-r from-[#5A1FA8] to-[#8B5CF6] text-white text-xs md:text-base font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-1.5 md:gap-2"
                  >
                    {reposting ? (
                      <>
                        <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Re-posting...
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md:w-[18px] md:h-[18px]">
                          <polyline points="17 1 21 5 17 9" />
                          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                          <polyline points="7 23 3 19 7 15" />
                          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                        </svg>
                        Re-post Job
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleMessageClick}
                    className="px-4 py-2 md:px-6 md:py-3 rounded-full border-2 border-[#5A1FA8] text-[#5A1FA8] text-xs md:text-base font-semibold hover:bg-[#5A1FA8] hover:text-white transition-all flex items-center gap-1.5 md:gap-2"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md:w-[18px] md:h-[18px]">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Message
                  </button>
                </>
              ) : (
                <>
                  {contract?.has_attachment && !hasMilestones && (
                    <button
                      onClick={handleDownloadWork}
                      disabled={loading}
                      className="px-4 py-2 md:px-6 md:py-3 rounded-full border-2 border-[#5A1FA8] text-[#5A1FA8] text-xs md:text-base font-semibold hover:bg-[#5A1FA8] hover:text-white transition-all disabled:opacity-50"
                    >
                      Download Work
                    </button>
                  )}

                  {!hasMilestones && isInReview && (
                    <button
                      onClick={() => setShowFullProjectRevisionModal(true)}
                      className="px-4 py-2 md:px-6 md:py-3 rounded-full border-2 border-amber-500 text-amber-600 text-xs md:text-base font-semibold hover:bg-amber-50 transition-all flex items-center gap-1.5 md:gap-2"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md:w-[18px] md:h-[18px]">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Request Revision
                    </button>
                  )}

                  {!hasMilestones && (
                    <button
                      onClick={handleApproveAndPay}
                      disabled={processingPayment}
                      className="px-4 py-2 md:px-8 md:py-3 rounded-full bg-gradient-to-r from-[#5A1FA8] to-[#8B5CF6] text-white text-xs md:text-base font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-1.5 md:gap-2"
                    >
                      {processingPayment ? (
                        <>
                          <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Approve & Pay"
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Milestone Approval Modal */}
      {showMilestoneReviewModal && selectedMilestoneForReview && milestones.length > 0 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
            <div className="bg-gradient-to-r from-green-600 to-green-800 px-4 md:px-6 py-3 md:py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-white">Approve Milestone</h3>
                  <p className="text-white/80 text-xs md:text-sm">Confirm payment for completed work</p>
                </div>
                <button
                  onClick={() => {
                    setShowMilestoneReviewModal(false);
                    setSelectedMilestoneForReview(null);
                  }}
                  className="text-white/80 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-4 md:p-6 space-y-3 md:space-y-4">
              <div className="bg-gray-50 p-2.5 md:p-3 rounded-lg">
                <p className="text-xs md:text-sm font-medium text-gray-700">
                  Milestone: {selectedMilestoneForReview.description}
                </p>
                <p className="text-base md:text-lg font-bold text-green-600 mt-1">
                  Amount: ₹{selectedMilestoneForReview.amount}
                </p>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                  Comments (optional)
                </label>
                <textarea
                  rows={3}
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="Add any feedback for the collaborator..."
                  className="w-full px-3 md:px-4 py-2 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none resize-none text-xs md:text-sm"
                />
              </div>

              <div className="flex gap-2 md:gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowMilestoneReviewModal(false);
                    setSelectedMilestoneForReview(null);
                    setReviewComments("");
                  }}
                  className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-xs md:text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApproveMilestone(selectedMilestoneForReview.index)}
                  disabled={processingPayment}
                  className="flex-1 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-1.5 md:gap-2 text-xs md:text-sm"
                >
                  {processingPayment ? (
                    <>
                      <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Approve & Pay ₹${selectedMilestoneForReview.amount}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Milestone Revision Modal */}
      {showRevisionModal && selectedMilestoneForReview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
            <div className="bg-gradient-to-r from-[#5A1FA8] to-[#8B5CF6] px-4 md:px-6 py-4 md:py-5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="md:w-[20px] md:h-[20px]">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-white">Request Revision</h3>
                    <p className="text-white/80 text-[10px] md:text-sm mt-0.5">Tell the collaborator what needs to be changed</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowRevisionModal(false);
                    setRevisionDescription("");
                  }}
                  className="text-white/80 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6 space-y-3 md:space-y-4">
              <div className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 bg-purple-50 rounded-lg border border-purple-100">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#5A1FA8]/10 flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5A1FA8" strokeWidth="2" className="md:w-[16px] md:h-[16px]">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] md:text-xs text-gray-500">Milestone</p>
                  <p className="text-xs md:text-sm font-semibold text-gray-800 truncate">
                    {selectedMilestoneForReview.description}
                  </p>
                </div>
                <span className="text-[10px] md:text-xs bg-amber-100 text-amber-700 px-2 py-0.5 md:py-1 rounded-full font-medium flex-shrink-0">
                  Under Review
                </span>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                  Revision Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={5}
                  value={revisionDescription}
                  onChange={(e) => setRevisionDescription(e.target.value)}
                  placeholder="Describe exactly what needs to be revised..."
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl border border-gray-300 focus:border-[#5A1FA8] focus:ring-2 focus:ring-[#5A1FA8]/20 outline-none resize-none text-xs md:text-sm leading-relaxed transition"
                />
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-2.5 md:p-3 flex items-start gap-2 md:gap-2.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5A1FA8" strokeWidth="2" className="flex-shrink-0 mt-0.5 md:w-[16px] md:h-[16px]">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <p className="text-purple-800 text-[10px] md:text-xs leading-relaxed">
                  This will mark the milestone as <strong>Revision Needed</strong>. The collaborator will see your notes and can resubmit their work.
                </p>
              </div>

              <div className="flex gap-2 md:gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowRevisionModal(false);
                    setRevisionDescription("");
                  }}
                  className="flex-1 py-2 md:py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium text-xs md:text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRequestMilestoneRevision(selectedMilestoneForReview.index)}
                  disabled={submittingRevision || !revisionDescription.trim()}
                  className="flex-1 py-2 md:py-2.5 rounded-xl bg-gradient-to-r from-[#5A1FA8] to-[#8B5CF6] text-white hover:shadow-lg transition font-medium text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 md:gap-2"
                >
                  {submittingRevision ? (
                    <>
                      <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="md:w-[15px] md:h-[15px]">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      Send Revision Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Project Revision Modal */}
      {showFullProjectRevisionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
            <div className="bg-gradient-to-r from-[#5A1FA8] to-[#8B5CF6] px-4 md:px-6 py-4 md:py-5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="md:w-[20px] md:h-[20px]">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-white">Request Revision</h3>
                    <p className="text-white/80 text-[10px] md:text-sm mt-0.5">Tell the collaborator what needs to be changed</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowFullProjectRevisionModal(false);
                    setFullProjectRevisionDesc("");
                  }}
                  className="text-white/80 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6 space-y-3 md:space-y-4">
              <div className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 bg-purple-50 rounded-lg border border-purple-100">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#5A1FA8]/10 flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5A1FA8" strokeWidth="2" className="md:w-[16px] md:h-[16px]">
                    <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] md:text-xs text-gray-500">Contract</p>
                  <p className="text-xs md:text-sm font-semibold text-gray-800 truncate">
                    {contract?.job_title || "Untitled Project"}
                  </p>
                </div>
                <span className="text-[10px] md:text-xs bg-amber-100 text-amber-700 px-2 py-0.5 md:py-1 rounded-full font-medium flex-shrink-0">
                  In Review
                </span>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                  Revision Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={5}
                  value={fullProjectRevisionDesc}
                  onChange={(e) => setFullProjectRevisionDesc(e.target.value)}
                  placeholder="Describe exactly what needs to be changed or fixed..."
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl border border-gray-300 focus:border-[#5A1FA8] focus:ring-2 focus:ring-[#5A1FA8]/20 outline-none resize-none text-xs md:text-sm leading-relaxed transition"
                />
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-2.5 md:p-3 flex items-start gap-2 md:gap-2.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5A1FA8" strokeWidth="2" className="flex-shrink-0 mt-0.5 md:w-[16px] md:h-[16px]">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <p className="text-purple-800 text-[10px] md:text-xs leading-relaxed">
                  Requesting revision will mark the contract back to <strong>In Progress</strong>. 
                  The collaborator will need to resubmit their work for approval.
                </p>
              </div>

              <div className="flex gap-2 md:gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowFullProjectRevisionModal(false);
                    setFullProjectRevisionDesc("");
                  }}
                  className="flex-1 py-2 md:py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium text-xs md:text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestFullProjectRevision}
                  disabled={submittingFullRevision || !fullProjectRevisionDesc.trim()}
                  className="flex-1 py-2 md:py-2.5 rounded-xl bg-gradient-to-r from-[#5A1FA8] to-[#8B5CF6] text-white hover:shadow-lg transition font-medium text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 md:gap-2"
                >
                  {submittingFullRevision ? (
                    <>
                      <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="md:w-[15px] md:h-[15px]">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      Send Revision Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96) translateY(-8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </div>
  );
}