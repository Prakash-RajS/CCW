// // frontend_user/src/pages/MyWork/Allcontacts.jsx
// import { useNavigate } from "react-router-dom";
// import { useUser } from "../../contexts/UserContext";
// import api from "../../utils/axiosConfig";
// import ColHeader from "../../component/ColHeader";
// import heroBg from "../../assets/MyWork/hero-bg.png";
// import Footer from "../../component/Footer";
// import toast from "../../component/Toast";
// import { useState, useEffect, useRef } from "react";

// const Allcontacts = () => {
//   const [activeSubTab, setActiveSubTab] = useState("submitted");
//   const [selectedInvitation, setSelectedInvitation] = useState(null);
//   const [showEditCard, setShowEditCard] = useState(false);
//   const [selectedContract, setSelectedContract] = useState(null);
//   const [selectedMilestone, setSelectedMilestone] = useState(null);
//   const [showMilestoneModal, setShowMilestoneModal] = useState(false);
//   const [showMilestoneDetailsModal, setShowMilestoneDetailsModal] =
//     useState(false);
//   const [selectedContractForMilestones, setSelectedContractForMilestones] =
//     useState(null);
//   const [loading, setLoading] = useState(false);
//   const [proposals, setProposals] = useState([]);
//   const [invitations, setInvitations] = useState([]);
//   const [allContracts, setAllContracts] = useState([]);
//   const [expandedDescription, setExpandedDescription] = useState(false);
//   const [workDescription, setWorkDescription] = useState("");
//   const [externalFileLink, setExternalFileLink] = useState("");
//   const [selectedStatus, setSelectedStatus] = useState("");
//   const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
//   const [expandedMilestones, setExpandedMilestones] = useState({});
//   const statusDropdownRef = useRef(null);
//   const contentContainerRef = useRef(null);
//   const popupRef = useRef(null);
//   const modalRef = useRef(null);
//   const [statusReason, setStatusReason] = useState("");

//   // Pagination states
//   const [proposalsPage, setProposalsPage] = useState(1);
//   const [invitationsPage, setInvitationsPage] = useState(1);
//   const [currentContractsPage, setCurrentContractsPage] = useState(1);
//   const [completedContractsPage, setCompletedContractsPage] = useState(1);
//   const itemsPerPage = 5;

//   // Review modal states
//   const [showReviewModal, setShowReviewModal] = useState(false);
//   const [reviewRating, setReviewRating] = useState(5);
//   const [reviewComment, setReviewComment] = useState("");
//   const [reviewSubmitting, setReviewSubmitting] = useState(false);
//   const [selectedReviewContract, setSelectedReviewContract] = useState(null);

//   // Revision modal states
//   const [showRevisionModal, setShowRevisionModal] = useState(false);
//   const [revisionText, setRevisionText] = useState("");

//   // Full project revision modal states
//   const [showFullProjectRevisionModal, setShowFullProjectRevisionModal] =
//     useState(false);
//   const [fullProjectRevisionText, setFullProjectRevisionText] = useState("");

//   // Track reviewed contracts
//   const [reviewedContracts, setReviewedContracts] = useState(new Set());

//   const { userData } = useUser();
//   const navigate = useNavigate();
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const [isDragging, setIsDragging] = useState(false);
//   const dragCounter = useRef(0);
//   const MAX_FILE_SIZE = 25 * 1024 * 1024;

//   const statusOptions = [
//     { value: "pending", label: "Pending" },
//     { value: "awaiting", label: "Awaiting" },
//     { value: "in_progress", label: "In Progress" },
//     { value: "completed", label: "Completed" },
//     { value: "cancelled", label: "Cancelled" },
//   ];

//   // Close dropdown on outside click
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         statusDropdownRef.current &&
//         !statusDropdownRef.current.contains(event.target)
//       ) {
//         setIsStatusDropdownOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // Close popup on outside click
//   useEffect(() => {
//     const handleClickOutsidePopup = (event) => {
//       if (popupRef.current && !popupRef.current.contains(event.target)) {
//         setShowEditCard(false);
//         setShowMilestoneModal(false);
//         setSelectedFiles([]);
//         setWorkDescription("");
//         setSelectedStatus("");
//         setStatusReason("");
//         setSelectedMilestone(null);
//         setIsStatusDropdownOpen(false);
//       }
//       if (modalRef.current && !modalRef.current.contains(event.target)) {
//         setShowMilestoneDetailsModal(false);
//         setSelectedContractForMilestones(null);
//       }
//     };
//     if (showEditCard || showMilestoneModal || showMilestoneDetailsModal) {
//       document.addEventListener("mousedown", handleClickOutsidePopup);
//     }
//     return () =>
//       document.removeEventListener("mousedown", handleClickOutsidePopup);
//   }, [showEditCard, showMilestoneModal, showMilestoneDetailsModal]);

//   // Lock body scroll when popup open
//  // Replace your existing useEffect with this one
// useEffect(() => {
//   const isAnyPopupOpen = 
//     showEditCard ||
//     showMilestoneModal ||
//     showMilestoneDetailsModal ||
//     showFullProjectRevisionModal ||
//     showReviewModal ||
//     showRevisionModal;

//   if (isAnyPopupOpen) {
//     // Save current scroll position
//     const scrollY = window.scrollY;
//     document.body.style.position = 'fixed';
//     document.body.style.top = `-${scrollY}px`;
//     document.body.style.width = '100%';
//     document.body.style.overflow = 'hidden';
//   } else {
//     // Restore scrolling
//     const scrollY = document.body.style.top;
//     document.body.style.position = '';
//     document.body.style.top = '';
//     document.body.style.width = '';
//     document.body.style.overflow = '';
//     if (scrollY) {
//       window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
//     }
//   }

//   // Cleanup function
//   return () => {
//     document.body.style.position = '';
//     document.body.style.top = '';
//     document.body.style.width = '';
//     document.body.style.overflow = '';
//   };
// }, [
//   showEditCard,
//   showMilestoneModal,
//   showMilestoneDetailsModal,
//   showFullProjectRevisionModal,
//   showReviewModal,
//   showRevisionModal,
// ]);

//   const getSelectedStatusLabel = () => {
//     const found = statusOptions.find((opt) => opt.value === selectedStatus);
//     return found ? found.label : "Select Status";
//   };

//   // Check if contract has revision feedback (full project)
//   const hasRevisionFeedback = (contract) => {
//     return (
//       contract?.status?.toLowerCase() === "in_progress" &&
//       contract?.revision_description &&
//       contract.revision_description.trim() !== ""
//     );
//   };

//   // Show revision modal with feedback
//   const handleViewRevision = (contract) => {
//     setFullProjectRevisionText(
//       contract.revision_description || "No revision details provided.",
//     );
//     setShowFullProjectRevisionModal(true);
//   };

//   // Check if any milestone has revision requested
//   const hasMilestoneRevision = (contract) => {
//     if (!contract.milestones_data || contract.milestones_data.length === 0)
//       return false;
//     return contract.milestones_data.some(
//       (m) => m.status === "revision_requested",
//     );
//   };

//   // Get milestone revision count
//   const getMilestoneRevisionCount = (contract) => {
//     if (!contract.milestones_data) return 0;
//     return contract.milestones_data.filter(
//       (m) => m.status === "revision_requested",
//     ).length;
//   };

//   // Get overall contract status display
//   const getContractStatusDisplay = (contract) => {
//     if (hasRevisionFeedback(contract)) {
//       return { text: "Revision Needed", color: "bg-orange-500", icon: "↻" };
//     }
//     if (hasMilestoneRevision(contract)) {
//       const count = getMilestoneRevisionCount(contract);
//       return {
//         text: `${count} Milestone${count > 1 ? "s" : ""} Need Revision`,
//         color: "bg-orange-500",
//         icon: "↻",
//       };
//     }
//     const status = contract.status?.toLowerCase();
//     if (status === "in_review")
//       return { text: "In Review", color: "bg-[#FF8C00]", icon: "⏳" };
//     if (status === "in_progress")
//       return { text: "In Progress", color: "bg-[#FF8F7A]", icon: "▶" };
//     if (status === "awaiting")
//       return { text: "Awaiting", color: "bg-[#FFA500]", icon: "⏰" };
//     if (status === "completed")
//       return { text: "Completed", color: "bg-[#3C8D4E]", icon: "✓" };
//     if (status === "cancelled")
//       return { text: "Cancelled", color: "bg-[#FF6B6B]", icon: "✗" };
//     return { text: "Pending", color: "bg-[rgba(43,97,187,1)]", icon: "○" };
//   };

//   // Check if contract is in review (action should be disabled)
//   const isContractInReview = (contract) => {
//     return contract?.status?.toLowerCase() === "in_review";
//   };

//   // Check if contract has milestones
//   const hasMilestones = (contract) => {
//     return contract.milestones_data && contract.milestones_data.length > 0;
//   };

//   // Fetch proposals
//   const fetchProposals = async () => {
//     if (!userData?.id) return;
//     try {
//       setLoading(true);
//       const response = await api.get(`proposals/GetMyProposals/${userData.id}`);
//       if (response.data?.proposals) {
//         setProposals(response.data.proposals);
//       }
//     } catch (error) {
//       console.error("Error fetching proposals:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Update contract status
//   const updateContractStatus = async (contractId, newStatus, reason = null) => {
//     if (!contractId) {
//       toast.error("No contract ID found");
//       return false;
//     }
//     if (!userData?.id) {
//       toast.error("User not found");
//       return false;
//     }
//     if (!newStatus) {
//       toast.error("Please select a status");
//       return false;
//     }
//     try {
//       const params = { user_id: userData.id, status: newStatus };
//       if (reason && reason.trim()) {
//         params.status_reason = reason.trim();
//       }
//       await api.put(`/contracts/${contractId}/status`, null, { params });
//       toast.success(`Contract status updated to ${newStatus}`);
//       await fetchAllContracts();
//       return true;
//     } catch (error) {
//       console.error("Error updating contract status:", error);
//       toast.error(
//         error.response?.data?.detail || "Failed to update contract status",
//       );
//       return false;
//     }
//   };

//   // Submit milestone work (supports both initial and resubmission)
//   const handleSubmitMilestoneWork = async () => {
//     if (!selectedContract || !selectedMilestone) return;

//     if (
//       !workDescription.trim() &&
//       selectedFiles.length === 0 &&
//       !externalFileLink.trim()
//     ) {
//       toast.error("Please add work description or attachments");
//       return;
//     }

//     setLoading(true);
//     const loadingToast = toast.loading("Submitting milestone work...");

//     try {
//       const formData = new FormData();
//       formData.append(
//         "description",
//         workDescription.trim() || "Work submission",
//       );
//       if (externalFileLink.trim())
//         formData.append("external_link", externalFileLink);
//       if (selectedFiles.length > 0) {
//         formData.append("attachment", selectedFiles[0]);
//       }

//       const response = await api.post(
//         `/contracts/${selectedContract.id}/milestones/${selectedMilestone.id}/submit-work`,
//         formData,
//         {
//           params: { user_id: userData.id },
//           headers: { "Content-Type": "multipart/form-data" },
//           timeout: 300000,
//         },
//       );

//       if (response.data.success) {
//         toast.dismiss(loadingToast);
//         toast.success(
//           `Milestone "${selectedMilestone.description}" work ${selectedMilestone.status === "revision_requested" ? "resubmitted" : "submitted"}!`,
//         );
//         setShowMilestoneModal(false);
//         setSelectedMilestone(null);
//         setWorkDescription("");
//         setExternalFileLink("");
//         setSelectedFiles([]);
//         await fetchAllContracts();
//       }
//     } catch (error) {
//       toast.dismiss(loadingToast);
//       console.error("Error submitting milestone work:", error);
//       toast.error(
//         error.response?.data?.detail || "Failed to submit milestone work",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmitClick = async () => {
//     if (!selectedContract) return;

//     if (selectedStatus === "completed") {
//       const oversizedFile = selectedFiles.find((f) => f.size > MAX_FILE_SIZE);
//       if (oversizedFile) {
//         toast.error(
//           `${oversizedFile.name} exceeds 25MB. Please use external link.`,
//         );
//         return;
//       }
//       if (selectedFiles.length === 0 && !externalFileLink.trim()) {
//         toast.error("Please upload a file or provide an external file link");
//         return;
//       }
//       await handleSubmitWork(selectedContract.id);
//       return;
//     } else if (selectedStatus && selectedStatus !== selectedContract.status) {
//       if (selectedStatus === "pending" || selectedStatus === "cancelled" || selectedStatus === "awaiting") {
//         if (!statusReason.trim()) {
//           toast.error(`Please provide a reason for ${selectedStatus} status`);
//           return;
//         }
//       }
//       const success = await updateContractStatus(
//         selectedContract.id,
//         selectedStatus,
//         statusReason,
//       );
//       if (success) {
//         setShowEditCard(false);
//         setSelectedContract(null);
//         setSelectedFiles([]);
//         setWorkDescription("");
//         setExternalFileLink("");
//         setSelectedStatus("");
//         setStatusReason("");
//       }
//     } else {
//       toast.info("No changes to submit");
//     }
//   };

//   const scrollToTop = () => {
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   useEffect(() => {
//     setTimeout(() => scrollToTop(), 100);
//   }, [activeSubTab]);

//   // Submit work for entire contract (legacy)
//   const handleSubmitWork = async (contractId) => {
//     if (!contractId) {
//       toast.error("No contract ID found");
//       return;
//     }
//     if (!selectedFiles.length && !externalFileLink.trim()) {
//       toast.error("Please upload a file or provide an external file link");
//       return;
//     }
//     if (!userData?.id) {
//       toast.error("User not found");
//       return;
//     }
//     try {
//       setLoading(true);
//       const formData = new FormData();
//       formData.append(
//         "description",
//         workDescription.trim() || "Work submission",
//       );
//       if (externalFileLink.trim())
//         formData.append("external_file_link", externalFileLink);
//       if (selectedFiles.length > 0) {
//         formData.append("attachment", selectedFiles[0]);
//       }
//       await api.post(`/contracts/${contractId}/submit-work`, formData, {
//         params: { user_id: userData.id },
//         headers: { "Content-Type": "multipart/form-data" },
//         timeout: 300000,
//       });
//       toast.success("Work submitted successfully!");
//       setShowEditCard(false);
//       setSelectedContract(null);
//       setSelectedFiles([]);
//       setWorkDescription("");
//       setExternalFileLink("");
//       setSelectedStatus("");
//       setStatusReason("");
//       await fetchAllContracts();
//     } catch (error) {
//       console.error("Error submitting work:", error);
//       toast.error(error.response?.data?.detail || "Failed to submit work");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFileSelection = (e) => {
//     const files = Array.from(e.target.files);
//     const validFiles = [];
//     files.forEach((file) => {
//       if (file.size > MAX_FILE_SIZE) {
//         toast.error(`${file.name} exceeds 25MB. Please use external link.`);
//       } else {
//         validFiles.push(file);
//       }
//     });
//     if (validFiles.length > 0) {
//       setSelectedFiles((prev) => [...prev, ...validFiles]);
//     }
//     e.target.value = "";
//   };

//   const removeSelectedFile = (indexToRemove) => {
//     setSelectedFiles((prev) =>
//       prev.filter((_, index) => index !== indexToRemove),
//     );
//   };

//   const handleDragEnter = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     dragCounter.current++;
//     if (e.dataTransfer.items && e.dataTransfer.items.length > 0)
//       setIsDragging(true);
//   };
//   const handleDragLeave = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     dragCounter.current--;
//     if (dragCounter.current === 0) setIsDragging(false);
//   };
//   const handleDragOver = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//   };
//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragging(false);
//     dragCounter.current = 0;
//     const files = Array.from(e.dataTransfer.files);
//     const validFiles = [];
//     files.forEach((file) => {
//       if (file.size > MAX_FILE_SIZE) {
//         toast.error(`${file.name} exceeds 25MB. Please use external link.`);
//       } else {
//         validFiles.push(file);
//       }
//     });
//     if (validFiles.length > 0) {
//       setSelectedFiles((prev) => [...prev, ...validFiles]);
//     }
//   };

//   // Fetch invitations
//   const fetchInvitations = async () => {
//     if (!userData?.id) return;
//     try {
//       const response = await api.get(`/invitations/list/${userData.id}`);
//       if (response.data?.invitations) {
//         setInvitations(response.data.invitations);
//       }
//     } catch (error) {
//       console.error("Error fetching invitations:", error);
//     }
//   };

//   const fetchInvitationDetails = async (invitationId) => {
//     if (!userData?.id) return null;
//     try {
//       const response = await api.get(`/invitations/${invitationId}`, {
//         params: { user_id: userData.id },
//       });

//       const data = response.data;

//       // Extract from job_details if available
//       const jobDetails = data.job_details || {};

//       return {
//         id: data.id,
//         project_name: data.project_name || jobDetails.title || "Project",
//         description: jobDetails.description || data.description || "No description available.",
//         duration: jobDetails.duration || data.duration || "Not specified",
//         client_name: data.client_name || data.sender_name || "Client",
//         revenue: data.revenue,
//         budget_from: jobDetails.budget_from || data.budget_from,
//         budget_to: jobDetails.budget_to || data.budget_to,
//         status: data.status,
//         created_at: data.created_at,
//         date: data.date,
//         skills: jobDetails.skills || data.receiver_skills || [],
//         job_id: data.job_id || jobDetails.id,
//       };
//     } catch (error) {
//       console.error("Error fetching invitation details:", error);
//       toast.error("Failed to load invitation details");
//       return null;
//     }
//   };

//   // Fetch contracts
//   const fetchAllContracts = async () => {
//     if (!userData?.id) return [];
//     try {
//       const response = await api.get("/contracts/collaborator-contracts");
//       const contracts = Array.isArray(response.data) ? response.data : [];
//       setAllContracts(contracts);
//       return contracts;
//     } catch (error) {
//       console.error("Error fetching all contracts:", error);
//       return [];
//     }
//   };

//   // Fetch reviewed contracts
//   const fetchReviewedContracts = async () => {
//     if (!userData?.id) return;
//     try {
//       const response = await api.get(`/reviews/given/${userData.id}`);
//       const reviews = response.data?.reviews || [];
//       const reviewedContractIds = new Set(
//         reviews.filter((r) => r.contract_id).map((r) => r.contract_id),
//       );
//       setReviewedContracts(reviewedContractIds);
//     } catch (error) {
//       console.error("Error fetching given reviews:", error);
//     }
//   };

//   useEffect(() => {
//     if (userData?.id) {
//       fetchProposals();
//       fetchInvitations();
//       fetchAllContracts();
//       fetchReviewedContracts();
//     }
//   }, [userData?.id]);

//   // Filter helpers
//   const getContractsByStatus = (status) => {
//     return allContracts.filter((contract) => {
//       const contractStatus = contract.status?.toLowerCase();
//       if (status === "current") {
//         return (
//           contractStatus === "active" ||
//           contractStatus === "in_progress" ||
//           contractStatus === "pending" ||
//           contractStatus === "awaiting" ||
//           contractStatus === "in_review"
//         );
//       } else if (status === "completed") {
//         return contractStatus === "completed";
//       }
//       return false;
//     });
//   };

//   const currentContracts = getContractsByStatus("current");
//   const completedContracts = getContractsByStatus("completed");

//   const getPaginatedData = (data, page) => {
//     const startIndex = (page - 1) * itemsPerPage;
//     return data.slice(startIndex, startIndex + itemsPerPage);
//   };
//   const getTotalPages = (dataLength) => Math.ceil(dataLength / itemsPerPage);

//   const renderPagination = (currentPage, totalPages, onPageChange) => {
//   if (totalPages <= 1) return null;

//   const handlePageChange = (newPage) => {
//     onPageChange(newPage);
//     // Wait for the new page content to render before scrolling
//     setTimeout(() => {
//       if (contentContainerRef.current) {
//         const yOffset = 80; // Positive offset to go below header
//         const element = contentContainerRef.current;
//         const elementPosition = element.getBoundingClientRect().top;
//         const offsetPosition = elementPosition + window.pageYOffset - yOffset;

//         window.scrollTo({
//           top: offsetPosition,
//           behavior: 'smooth'
//         });
//       } else {
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//       }
//     }, 150); // Delay to allow DOM to update
//   };

//   return (
//     <div className="flex justify-center items-center gap-1 sm:gap-2 py-3 sm:py-4">
//       <button
//         onClick={() => handlePageChange(currentPage - 1)}
//         disabled={currentPage === 1}
//         className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-md transition text-[11px] sm:text-sm ${
//           currentPage === 1
//             ? "bg-gray-200 text-gray-500 cursor-not-allowed"
//             : "bg-purple-600 text-white hover:bg-purple-700"
//         }`}
//       >
//         Previous
//       </button>
//       <span className="px-2 sm:px-4 py-0.5 sm:py-1 text-gray-700 text-[10px] sm:text-sm">
//         <span className="hidden xs:inline">Page </span>{currentPage}<span className="hidden xs:inline"> of {totalPages}</span>
//         <span className="xs:hidden">/{totalPages}</span>
//       </span>
//       <button
//         onClick={() => handlePageChange(currentPage + 1)}
//         disabled={currentPage === totalPages}
//         className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-md transition text-[11px] sm:text-sm ${
//           currentPage === totalPages
//             ? "bg-gray-200 text-gray-500 cursor-not-allowed"
//             : "bg-purple-600 text-white hover:bg-purple-700"
//         }`}
//       >
//         Next
//       </button>
//     </div>
//   );
// };

//   // Formatters
//   const formatDate = (dateString) => {
//     if (!dateString) return "";
//     try {
//       const date = new Date(dateString);
//       const day = String(date.getDate()).padStart(2, "0");
//       const month = String(date.getMonth() + 1).padStart(2, "0");
//       const year = String(date.getFullYear()).slice(-2);
//       return `${day}-${month}-${year}`;
//     } catch {
//       return "";
//     }
//   };

//   const getStatusColor = (status) => {
//     if (!status) return "bg-[rgba(43,97,187,1)]";
//     const s = status.toLowerCase();
//     if (s === "accepted") return "bg-[rgba(72,158,136,1)]";
//     if (s === "under review" || s === "under_review" || s === "pending")
//       return "bg-[rgba(43,97,187,1)]";
//     if (s === "in_review") return "bg-[#FF8C00]";
//     if (s === "declined" || s === "rejected") return "bg-[rgba(242,175,182,1)]";
//     if (s === "completed") return "bg-[#3C8D4E]";
//     if (s === "active" || s === "in_progress") return "bg-[#FF8F7A]";
//     if (s === "awaiting") return "bg-[#FFA500]";
//     if (s === "cancelled") return "bg-[#FF6B6B]";
//     return "bg-[rgba(43,97,187,1)]";
//   };

//   const getStatusText = (status) => {
//     if (!status) return "Pending";
//     const s = status.toLowerCase();
//     if (s === "in_progress") return "in progress";
//     if (s === "under_review") return "Pending";
//     if (s === "in_review") return "In Review";
//     if (s === "active") return "in progress";
//     if (s === "awaiting") return "Awaiting";
//     if (s === "cancelled") return "Cancelled";
//     if (s === "revision_requested") return "Revision Needed";
//     return status;
//   };

//   // Consistent input classes
//   const inputClasses = "w-full rounded-lg p-2.5 text-sm border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white";
//   const textareaClasses = "w-full rounded-lg p-2.5 text-sm border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none bg-white";
//   const labelClasses = "block text-xs font-semibold text-gray-700 mb-1.5";
//   const buttonPrimaryClasses = "px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 bg-gradient-to-r from-[#51218F] to-[#2a0e4a] hover:opacity-90";
//   const buttonSecondaryClasses = "px-4 py-2 rounded-lg border border-gray-300 text-white bg-gray-500 hover:bg-gray-600 font-medium transition-all duration-200";
//   const buttonOutlineClasses = "px-4 py-2 rounded-lg border border-[#51218F] text-[#51218F] bg-white hover:bg-purple-50 font-medium transition-all duration-200";

//   // Get milestone status display for modal
//   const getMilestoneStatusIcon = (status) => {
//     switch (status) {
//       case "paid":
//         return (
//           <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">
//             ✓
//           </span>
//         );
//       case "submitted":
//         return (
//           <span className="w-5 h-5 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-xs">
//             ⏳
//           </span>
//         );
//       case "in_progress":
//         return (
//           <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
//             ▶
//           </span>
//         );
//       case "revision_requested":
//         return (
//           <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs">
//             ↻
//           </span>
//         );
//       default:
//         return (
//           <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs">
//             ○
//           </span>
//         );
//     }
//   };

//   // Milestone Details Modal Component
//   const MilestoneDetailsModal = () => {
//     if (!showMilestoneDetailsModal || !selectedContractForMilestones)
//       return null;

//     const contract = selectedContractForMilestones;
//     const milestones = contract.milestones_data || [];
//     const totalAmount = milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
//     const paidAmount = milestones
//       .filter((m) => m.status === "paid")
//       .reduce((sum, m) => sum + (m.amount || 0), 0);
//     const currentMilestoneIndex = contract.current_milestone || 0;

//     return (
//       <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
//         <div
//           ref={modalRef}
//           className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto scrollbar-hide"
//         >
//           {/* Header - Sticky */}
//           <div className="sticky top-0 z-10 bg-gradient-to-r from-[#51218F] to-[#2a0e4a] px-6 py-4">
//             <div className="flex justify-between items-center">
//               <div>
//                 <h3 className="text-xl font-bold text-white">
//                   Milestone Progress
//                 </h3>
//                 <p className="text-purple-200 text-sm mt-1">
//                   {contract.job_title}
//                 </p>
//               </div>
//               <button
//                 onClick={() => {
//                   setShowMilestoneDetailsModal(false);
//                   setSelectedContractForMilestones(null);
//                 }}
//                 className="text-white/80 hover:text-white transition text-2xl"
//               >
//                 ×
//               </button>
//             </div>
//           </div>

//           {/* Summary Stats */}
//           <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 border-b">
//             <div className="text-center">
//               <p className="text-2xl font-bold text-purple-700">
//                 ₹{totalAmount}
//               </p>
//               <p className="text-xs text-gray-500">Total Budget</p>
//             </div>
//             <div className="text-center">
//               <p className="text-2xl font-bold text-green-600">₹{paidAmount}</p>
//               <p className="text-xs text-gray-500">Paid Amount</p>
//             </div>
//             <div className="text-center">
//               <p className="text-2xl font-bold text-blue-600">
//                 {milestones.filter((m) => m.status === "paid").length}/
//                 {milestones.length}
//               </p>
//               <p className="text-xs text-gray-500">Milestones Completed</p>
//             </div>
//           </div>

//           {/* Milestone List */}
//           <div className="p-6 space-y-4">
//             {milestones.map((milestone, idx) => {
//               const isActive = idx === currentMilestoneIndex;
//               const isPaid = milestone.status === "paid";
//               const isSubmitted = milestone.status === "submitted";
//               const isInProgress = milestone.status === "in_progress";
//               const isRevision = milestone.status === "revision_requested";

//               return (
//                 <div
//                   key={idx}
//                   className={`relative rounded-xl border-2 transition-all ${
//                     isActive
//                       ? "border-purple-300 bg-purple-50/30 shadow-md"
//                       : isPaid
//                         ? "border-green-200 bg-green-50/30"
//                         : isSubmitted
//                           ? "border-yellow-200 bg-yellow-50/30"
//                           : isRevision
//                             ? "border-orange-200 bg-orange-50/30"
//                             : "border-gray-200 bg-white"
//                   }`}
//                 >
//                   <div className="p-4">
//                     <div className="flex items-start gap-3">
//                       {/* Status Icon */}
//                       <div className="flex-shrink-0">
//                         {getMilestoneStatusIcon(milestone.status)}
//                       </div>

//                       {/* Content */}
//                       <div className="flex-1">
//                         <div className="flex items-center justify-between flex-wrap gap-2">
//                           <div>
//                             <h4 className="font-semibold text-gray-800">
//                               Milestone {idx + 1}: {milestone.description}
//                             </h4>
//                             <div className="flex gap-3 text-xs text-gray-500 mt-1">
//                               <span>
//                                 Amount:{" "}
//                                 <span className="font-medium text-purple-600">
//                                   ₹{milestone.amount}
//                                 </span>
//                               </span>
//                               {milestone.due_date && (
//                                 <span>Due: {milestone.due_date}</span>
//                               )}
//                             </div>
//                           </div>
//                           <span
//                             className={`px-2 py-1 rounded-full text-xs font-medium ${
//                               isPaid
//                                 ? "bg-green-100 text-green-700"
//                                 : isSubmitted
//                                   ? "bg-yellow-100 text-yellow-700"
//                                   : isInProgress
//                                     ? "bg-blue-100 text-blue-700"
//                                     : isRevision
//                                       ? "bg-orange-100 text-orange-700"
//                                       : "bg-gray-100 text-gray-500"
//                             }`}
//                           >
//                             {isPaid
//                               ? "✓ Paid"
//                               : isSubmitted
//                                 ? "Under Review"
//                                 : isInProgress
//                                   ? "In Progress"
//                                   : isRevision
//                                     ? "Revision Needed"
//                                     : "Pending"}
//                           </span>
//                         </div>

//                         {/* Submission Details (if submitted) */}
//                         {isSubmitted && milestone.submission && (
//                           <div className="mt-3 p-3 bg-white rounded-lg border border-yellow-100">
//                             <p className="text-xs font-medium text-gray-700 mb-1">
//                               Submitted Work:
//                             </p>
//                             {milestone.submission.description && (
//                               <p className="text-xs text-gray-600">
//                                 {milestone.submission.description}
//                               </p>
//                             )}
//                             {milestone.submission.external_link && (
//                               <a
//                                 href={milestone.submission.external_link}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="text-purple-600 text-xs underline mt-1 inline-block"
//                               >
//                                 View External Link →
//                               </a>
//                             )}
//                             {milestone.submission.attachment && (
//                               <button
//                                 onClick={async () => {
//                                   try {
//                                     const response = await api.get(
//                                       `/contracts/${contract.id}/milestones/${idx}/download-attachment`,
//                                       {
//                                         params: { user_id: userData.id },
//                                         responseType: "blob",
//                                       },
//                                     );
//                                     const url = window.URL.createObjectURL(
//                                       new Blob([response.data]),
//                                     );
//                                     const a = document.createElement("a");
//                                     a.href = url;
//                                     a.download =
//                                       milestone.submission.attachment_name ||
//                                       `milestone_${idx + 1}_work`;
//                                     document.body.appendChild(a);
//                                     a.click();
//                                     setTimeout(() => {
//                                       window.URL.revokeObjectURL(url);
//                                       document.body.removeChild(a);
//                                     }, 100);
//                                   } catch (error) {
//                                     console.error("Download error:", error);
//                                     toast.error(
//                                       "Download failed",
//                                       "Could not retrieve file.",
//                                     );
//                                   }
//                                 }}
//                                 className="text-blue-600 text-xs underline mt-1 inline-block flex items-center gap-1"
//                               >
//                                 <svg
//                                   className="w-3 h-3"
//                                   fill="none"
//                                   stroke="currentColor"
//                                   viewBox="0 0 24 24"
//                                 >
//                                   <path
//                                     strokeLinecap="round"
//                                     strokeLinejoin="round"
//                                     strokeWidth="2"
//                                     d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
//                                   />
//                                 </svg>
//                                 Download Attachment
//                               </button>
//                             )}
//                             {milestone.submission.submitted_at && (
//                               <p className="text-xs text-gray-400 mt-1">
//                                 Submitted:{" "}
//                                 {new Date(
//                                   milestone.submission.submitted_at,
//                                 ).toLocaleString()}
//                               </p>
//                             )}
//                           </div>
//                         )}

//                         {/* Revision Feedback */}
//                         {isRevision && milestone.review && (
//                           <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
//                             <p className="text-xs font-medium text-orange-700">
//                               Revision Requested:
//                             </p>
//                             <p className="text-xs text-orange-600 mt-1">
//                               {milestone.review.comments ||
//                                 "No additional comments"}
//                             </p>
//                           </div>
//                         )}

//                         {/* Payment Details (if paid) */}
//                         {isPaid && milestone.payment && (
//                           <div className="mt-2 text-xs text-green-600">
//                             Paid on:{" "}
//                             {new Date(
//                               milestone.payment.paid_at,
//                             ).toLocaleDateString()}
//                           </div>
//                         )}

//                         {/* Submit/Resubmit button for active milestone */}
//                         {(isInProgress || isRevision) && isActive && (
//                           <button
//                             onClick={() => {
//                               setShowMilestoneDetailsModal(false);
//                               setSelectedContract(contract);
//                               setSelectedMilestone({ id: idx, ...milestone });
//                               setShowMilestoneModal(true);
//                               setWorkDescription("");
//                               setExternalFileLink("");
//                               setSelectedFiles([]);
//                             }}
//                             className="mt-3 px-4 py-1.5 rounded-full text-white text-xs font-medium transition"
//                             style={{
//                               backgroundColor: isRevision
//                                 ? "#EA580C"
//                                 : "#7C3AED",
//                             }}
//                             onMouseEnter={(e) => {
//                               e.target.style.backgroundColor = isRevision
//                                 ? "#C2410C"
//                                 : "#6D28D9";
//                             }}
//                             onMouseLeave={(e) => {
//                               e.target.style.backgroundColor = isRevision
//                                 ? "#EA580C"
//                                 : "#7C3AED";
//                             }}
//                           >
//                             {isRevision ? "🔄 Resubmit Work" : "📤 Submit Work"}
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Footer */}
//           <div className="sticky bottom-0 px-6 py-4 bg-gray-50 border-t flex justify-end">
//             <button
//               onClick={() => {
//                 setShowMilestoneDetailsModal(false);
//                 setSelectedContractForMilestones(null);
//               }}
//               className={buttonSecondaryClasses}
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Invitation handlers
//   const handleAcceptInvitation = async (invitationId) => {
//     if (!invitationId) {
//       toast.error("No invitation ID found");
//       return;
//     }
//     try {
//       setLoading(true);
//       await api.put("/invitations/update-status", null, {
//         params: { invitation_id: invitationId, status: "accepted" },
//       });
//       toast.success("Invitation accepted successfully!");
//       setInvitations((prev) =>
//         prev.map((inv) =>
//           inv.id === invitationId ? { ...inv, status: "accepted" } : inv,
//         ),
//       );
//       setSelectedInvitation(null);
//       await fetchInvitations();
//     } catch (error) {
//       toast.error(
//         error.response?.data?.detail || "Failed to accept invitation",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Name helpers
//   const getClientName = (contract) =>
//     contract?.creator?.full_name ||
//     contract?.creator?.name ||
//     contract?.creator?.email?.split("@")[0] ||
//     "Client";
//   const getClientInitial = (contract) =>
//     getClientName(contract)?.charAt(0)?.toUpperCase() || "C";
//   const getClientNameFromProposal = (proposal) =>
//     proposal?.client_name || "Client";
//   const getProjectNameFromProposal = (proposal) =>
//     proposal.job_title || "Project";
//   const getRevenue = (amount) =>
//     amount !== undefined && amount !== null ? `₹${amount}` : "₹0";
//   const getSenderId = (invitation) =>
//     invitation.sender_id || invitation.sender?.id || invitation.client_id;

//   const handleMessageClick = (
//     receiverId,
//     userName,
//     jobId = null,
//     projectName = null,
//   ) => {
//     if (!receiverId) {
//       toast.error("Unable to start conversation");
//       return;
//     }
//     localStorage.setItem("currentReceiverId", receiverId);
//     localStorage.setItem("currentReceiverName", userName || "User");
//     if (jobId) {
//       localStorage.setItem("currentJobId", jobId);
//       localStorage.setItem("currentJobTitle", projectName || "");
//     }
//     navigate(`/message?user=${receiverId}`, {
//       state: { receiverId, userName, senderId: userData.id },
//     });
//   };

//   const handleReviewProposal = (proposal) => {
//     const jobId = proposal.job_id;
//     if (!jobId) {
//       toast.error("Cannot review this proposal");
//       return;
//     }
//     navigate("/proposal", {
//       state: { jobId, proposalId: proposal.id, fromProposal: true, proposal },
//     });
//   };

//   const getContractRevenue = (contract) =>
//     contract?.budget !== undefined ? `₹${contract.budget}` : "₹0";
//   const getInvitationRevenue = (invitation) =>
//     invitation?.revenue ? `₹${invitation.revenue}` : "₹0";
//   const getDisplayRevenue = (invitation) => {
//     if (invitation?.revenue) return `₹${invitation.revenue}`;
//     if (invitation?.budget_from && invitation?.budget_to)
//       return `₹${invitation.budget_from} - ₹${invitation.budget_to}`;
//     return "₹0";
//   };

//   // Review handlers
//   const handleReviewClick = (contract) => {
//     setSelectedReviewContract(contract);
//     setReviewRating(5);
//     setReviewComment("");
//     setShowReviewModal(true);
//   };

//   const handleSubmitReview = async () => {
//     if (!selectedReviewContract?.creator?.id) {
//       toast.error("Cannot review: client information missing");
//       return;
//     }
//     setReviewSubmitting(true);
//     try {
//       await api.post("/reviews/create", null, {
//         params: {
//           reviewer_id: userData.id,
//           recipient_id: selectedReviewContract.creator.id,
//           contract_id: selectedReviewContract.id,
//           rating: reviewRating,
//           comment: reviewComment,
//         },
//       });
//       toast.success("Review submitted!");
//       setShowReviewModal(false);
//       await fetchAllContracts();
//       await fetchReviewedContracts();
//     } catch (err) {
//       toast.error(err.response?.data?.detail || "Failed to submit review");
//     } finally {
//       setReviewSubmitting(false);
//     }
//   };

//   // Derived counts
//   const proposalCount = proposals.length;
//   const invitationCount = invitations.length;
//   const currentCount = currentContracts.length;
//   const completedCount = completedContracts.length;

//   const paginatedProposals = getPaginatedData(proposals, proposalsPage);
//   const paginatedInvitations = getPaginatedData(invitations, invitationsPage);
//   const paginatedCurrentContracts = getPaginatedData(
//     currentContracts,
//     currentContractsPage,
//   );
//   const paginatedCompletedContracts = getPaginatedData(
//     completedContracts,
//     completedContractsPage,
//   );

//   const CreatorAvatar = ({ contract, size = "w-10 h-10" }) => {
//     const [imgError, setImgError] = useState(false);
//     const picUrl = contract?.creator?.profile_picture;
//     const initial = getClientInitial(contract);
//     if (picUrl && !imgError) {
//       return (
//         <img
//           src={picUrl}
//           alt="Client profile"
//           className={`${size} rounded-full object-cover border-2 border-purple-200`}
//           onError={() => setImgError(true)}
//         />
//       );
//     }
//     return (
//       <div
//         className={`${size} rounded-full bg-purple-100 border-2 border-purple-200 flex items-center justify-center text-purple-700 font-semibold text-sm`}
//       >
//         {initial}
//       </div>
//     );
//   };

//   return (
//     <div
//       className="w-full min-h-screen overflow-x-hidden"
//       style={{
//         background: "linear-gradient(180deg, #b8b2c4 100%, #0a0515 100%)",
//       }}
//     >
//       <div className="absolute top-0 left-0 w-full z-50">
//         <ColHeader />
//       </div>

//       {/* Hero Section */}
//       <section
//         className="relative w-full h-[350px] md:h-[420px]"
//         style={{
//           backgroundImage: `url(${heroBg})`,
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//         }}
//       >
//         <div className="absolute inset-0 bg-white/1" />
//         <div className="relative z-10 px-6 md:px-12 pt-[90px] text-white">
//           <div className="flex justify-between items-center mt-16 sm:mt-12 md:mt-16 mb-8 md:mb-6">
//   <button
//     onClick={() => navigate(-1)}
//     className="flex items-center gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-white hover:text-white/80 transition-colors group"
//   >
//     <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-[#51218F] to-[#2a0e4a] group-hover:from-[#3d1768] group-hover:to-[#1a0830] transition-all">
//       <svg
//         xmlns="http://www.w3.org/2000/svg"
//         className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white"
//         viewBox="0 0 24 24"
//         fill="none"
//         stroke="currentColor"
//         strokeWidth={2.5}
//       >
//         <path d="M19 12H5M12 19l-7-7 7-7" />
//       </svg>
//     </div>
//     <span className="font-medium text-sm sm:text-base">Back</span>
//   </button>
//   <h1 className="text-xl sm:text-[24px] md:text-[28px] font-semibold">
//     All contracts
//   </h1>
// </div>
//           {/* Tabs */}
//        <div className="relative mt-4 sm:mt-6 md:mt-8">
//   {/* Mobile Tabs - Full Text Compact */}
//   <div className="block md:hidden">
//     <div className="bg-[#4A2A68] rounded-md">
//       <div className="overflow-x-auto overflow-y-hidden scrollbar-hide">
//         <div className="flex gap-1.5 p-1.5 min-w-max">
//           {[
//             {
//               key: "submitted",
//               label: "Submitted Proposals",
//               count: proposalCount,
//             },
//             {
//               key: "invitation",
//               label: "Job Invitations",
//               count: invitationCount,
//             },
//             {
//               key: "current",
//               label: "Current Contracts",
//               count: currentCount,
//             },
//             {
//               key: "completed",
//               label: "Completed Contracts",
//               count: completedCount,
//             },
//           ].map((tab) => {
//             const isActive = activeSubTab === tab.key;
//             return (
//               <button
//                 key={tab.key}
//                 onClick={() => setActiveSubTab(tab.key)}
//                 className={`relative px-3 py-1.5 rounded-lg transition-all duration-200 ${
//                   isActive
//                     ? "bg-white/20 text-white"
//                     : "text-white/70 hover:bg-white/5"
//                 }`}
//               >
//                 <div className="flex items-center gap-1.5">
//                   <span className={`font-medium whitespace-nowrap ${
//                     isActive ? "text-[12px]" : "text-[10px]"
//                   }`}>
//                     {tab.label}
//                   </span>
//                   <span className={`font-semibold whitespace-nowrap ${
//                     isActive ? "text-[11px] text-yellow-200" : "text-[9px] text-white/60"
//                   }`}>
//                     ({tab.count})
//                   </span>
//                 </div>
//                 {isActive && (
//                   <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-white rounded-full" />
//                 )}
//               </button>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   </div>

//   {/* Desktop Tabs - Unchanged */}
//   <div className="hidden md:block">
//     <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-400/40" />
//     <div className="flex overflow-x-auto no-scrollbar items-center justify-between md:justify-start lg:grid lg:grid-cols-4 gap-5 md:gap-6 lg:gap-0 pb-3 text-[13px] lg:text-[16px] font-semibold text-center">
//       {[
//         {
//           key: "submitted",
//           label: `Submitted Proposal (${proposalCount.toString().padStart(2, "0")})`,
//         },
//         {
//           key: "invitation",
//           label: `Job Invitation (${invitationCount.toString().padStart(2, "0")})`,
//         },
//         {
//           key: "current",
//           label: `Current Contracts (${currentCount.toString().padStart(2, "0")})`,
//         },
//         {
//           key: "completed",
//           label: `Completed Contracts (${completedCount.toString().padStart(2, "0")})`,
//         },
//       ].map((tab) => (
//         <span
//           key={tab.key}
//           onClick={() => setActiveSubTab(tab.key)}
//           className={`cursor-pointer whitespace-nowrap transition-all duration-200 ${
//             activeSubTab === tab.key
//               ? "text-white font-semibold"
//               : "text-white/60 font-medium hover:text-white/90"
//           }`}
//         >
//           <span className="relative inline-block pb-2 px-1">
//             {tab.label}
//             {activeSubTab === tab.key && (
//               <span className="absolute -left-1 md:-left-1.5 -right-1 md:-right-1.5 -bottom-[3px] h-[3.5px] bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
//             )}
//           </span>
//         </span>
//       ))}
//     </div>
//   </div>
// </div>

// <style>{`
//   .scrollbar-hide::-webkit-scrollbar {
//     display: none;
//   }
//   .scrollbar-hide {
//     -ms-overflow-style: none;
//     scrollbar-width: none;
//   }
// `}</style>
//         </div>
//       </section>

//       {/* Content */}
//       <section
//         ref={contentContainerRef}
//         className="relative -mt-[60px] md:-mt-[85px] px-4 md:px-12 pb-16"
//       >
//         {loading && (
//           <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
//           </div>
//         )}

//         {/* SUBMITTED PROPOSALS */}
//        {activeSubTab === "submitted" && !loading && (
//   <div className="bg-white rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.12)] overflow-hidden">
//     {/* Desktop View */}
//     <div className="hidden md:block overflow-x-auto">
//       <div className="min-w-[900px]">
//         <div className="grid grid-cols-6 px-6 md:px-10 py-4 text-[13px] font-semibold text-gray-800 text-center">
//           <span>Client Name</span>
//           <span>Project Name</span>
//           <span>Date</span>
//           <span>Revenue</span>
//           <span>Status</span>
//           <span>Action</span>
//         </div>
//         <div className="w-full h-[1px] bg-gray-300" />
//         {paginatedProposals.length > 0 ? (
//           paginatedProposals.map((proposal, i) => {
//             const isSubmitted = proposal.status?.toLowerCase() === "submitted";
//             return (
//               <div key={proposal.id || i}>
//                 <div className="grid grid-cols-6 px-6 md:px-10 py-4 text-[13px] text-gray-700 items-center text-center">
//                   <span className="truncate">{getClientNameFromProposal(proposal)}</span>
//                   <span className="truncate">{getProjectNameFromProposal(proposal)}</span>
//                   <span>{formatDate(proposal.created_at)}</span>
//                   <span>{getRevenue(proposal.bid_amount)}</span>
//                   <div className="flex justify-center">
//                     <span
//                       className={`w-[90px] h-[30px] rounded-full flex items-center justify-center text-white text-[11px] font-medium ${getStatusColor(proposal.status)}`}
//                     >
//                       {getStatusText(proposal.status)}
//                     </span>
//                   </div>
//                   <div className="flex justify-center">
//                     {isSubmitted ? (
//                       <button
//                         onClick={() => handleReviewProposal(proposal)}
//                         className="w-[80px] h-[30px] rounded-full flex items-center justify-center bg-[#51218F] text-white text-[11px] font-medium hover:bg-purple-700 transition"
//                       >
//                         Review
//                       </button>
//                     ) : (
//                       <span className="w-[80px] h-[30px] rounded-full flex items-center justify-center bg-gray-300 text-gray-500 text-[11px] font-medium cursor-not-allowed">
//                         Disabled
//                       </span>
//                     )}
//                   </div>
//                 </div>
//                 {i !== paginatedProposals.length - 1 && (
//                   <div className="w-full h-[1px] bg-gray-300" />
//                 )}
//               </div>
//             );
//           })
//         ) : (
//           <div className="py-10 text-center text-gray-500 text-sm">
//             No proposals found
//           </div>
//         )}
//       </div>
//     </div>

//     {/* Mobile View - Card Layout with Scroll Animation */}
//     <div className="block md:hidden bg-white max-h-[500px] overflow-y-auto">
//       <div className="space-y-2 p-2">
//         {paginatedProposals.length > 0 ? (
//           paginatedProposals.map((proposal, i) => {
//             const isSubmitted = proposal.status?.toLowerCase() === "submitted";
//             return (
//               <div
//                 key={proposal.id || i}
//                 className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-all duration-300 animate-fadeIn"
//               >
//                 {/* Client and Project Row */}
//                 <div className="flex justify-between items-start mb-2">
//                   <div className="flex-1">
//                     <div className="flex items-center gap-2 mb-1">
//                       <span className="text-[10px] text-gray-400 uppercase tracking-wide">Client</span>
//                     </div>
//                     <p className="text-[13px] font-semibold text-gray-800 truncate">
//                       {getClientNameFromProposal(proposal)}
//                     </p>
//                   </div>
//                   <div className="flex-1 text-right">
//                     <div className="flex justify-end gap-2 mb-1">
//                       <span className="text-[10px] text-gray-400 uppercase tracking-wide">Project</span>
//                     </div>
//                     <p className="text-[12px] text-gray-600 truncate">
//                       {getProjectNameFromProposal(proposal)}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Date and Revenue Row */}
//                 <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
//                   <div>
//                     <span className="text-[9px] text-gray-400 uppercase tracking-wide">Date</span>
//                     <p className="text-[11px] text-gray-500">
//                       {formatDate(proposal.created_at)}
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <span className="text-[9px] text-gray-400 uppercase tracking-wide">Revenue</span>
//                     <p className="text-[14px] font-bold text-green-600">
//                       {getRevenue(proposal.bid_amount)}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Status and Action Row */}
//                 <div className="flex justify-between items-center">
//                   <span
//                     className={`px-2.5 py-1 rounded-full text-white text-[10px] font-medium ${getStatusColor(proposal.status)}`}
//                   >
//                     {getStatusText(proposal.status)}
//                   </span>
//                   {isSubmitted ? (
//                     <button
//                       onClick={() => handleReviewProposal(proposal)}
//                       className="px-3 py-1.5 rounded-full bg-[#51218F] text-white text-[11px] font-medium hover:bg-purple-700 transition transform active:scale-95"
//                     >
//                       Review Proposal
//                     </button>
//                   ) : (
//                     <span className="px-3 py-1.5 rounded-full bg-gray-200 text-gray-400 text-[11px] font-medium">
//                       Disabled
//                     </span>
//                   )}
//                 </div>
//               </div>
//             );
//           })
//         ) : (
//           <div className="py-8 text-center text-gray-400 text-sm">
//             No proposals found
//           </div>
//         )}
//       </div>
//     </div>

//     {renderPagination(
//       proposalsPage,
//       getTotalPages(proposals.length),
//       setProposalsPage,
//     )}
//   </div>
// )}

// <style jsx>{`
//   @keyframes fadeIn {
//     from {
//       opacity: 0;
//       transform: translateY(10px);
//     }
//     to {
//       opacity: 1;
//       transform: translateY(0);
//     }
//   }
//   .animate-fadeIn {
//     animation: fadeIn 0.3s ease-out;
//   }
// `}</style>

//         {/* JOB INVITATIONS */}
//        {activeSubTab === "invitation" && !loading && (
//   <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//     {selectedInvitation ? (
//       <div className="p-4 md:p-8">
//   {/* Back Button */}
// <button
//   onClick={() => {
//     setSelectedInvitation(null);
//     setExpandedDescription(false);
//     // Scroll to top when navigating back
//     setTimeout(() => {
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     }, 100);
//   }}
//   className="flex items-center gap-2 text-[11px] md:text-[14px] text-gray-700 opacity-80 mb-4 md:mb-4 hover:opacity-100 transition group"
// >
//   <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#51218F] to-[#2a0e4a] flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:from-[#3d1768] group-hover:to-[#1a0830] transition-all">
//     <svg 
//       width="18" 
//       height="18" 
//       viewBox="0 0 24 24" 
//       fill="none" 
//       xmlns="http://www.w3.org/2000/svg"
//       className="text-white group-hover:-translate-x-0.5 transition-transform"
//     >
//       <path
//         d="M18 12H6M6 12L10 8M6 12L10 16"
//         stroke="currentColor"
//         strokeWidth="2.5"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//     </svg>
//   </div>
//   <span className="font-medium">Back to Invitations</span>
// </button>
//   {/* Header with Project Name and Badge */}
//   <div className="mb-5">
//     <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
//       <h2 className="font-bold text-lg sm:text-xl md:text-2xl text-gray-800 flex-1">
//         {selectedInvitation.project_name || "Project Invitation"}
//       </h2>
//       <span className="px-3 py-1 text-[10px] md:text-sm rounded-full bg-[#5B2CA0] text-white font-medium whitespace-nowrap">
//         Fixed Rate
//       </span>
//     </div>
//   </div>

//   {/* Info Cards - Modern Card Design */}
//   <div className="space-y-3 mb-5">
//     {/* Client and Budget Row */}
//     <div className="grid grid-cols-2 gap-3">
//       <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-3 border border-purple-100">
//         <div className="flex items-center gap-2 mb-1">
//           <svg className="w-3.5 h-3.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//           </svg>
//           <p className="text-[10px] font-semibold text-purple-600 uppercase tracking-wide">Client</p>
//         </div>
//         <p className="text-sm font-semibold text-gray-800 break-words">
//           {selectedInvitation.client_name || "Client"}
//         </p>
//       </div>

//       <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-3 border border-green-100">
//         <div className="flex items-center gap-2 mb-1">
//           <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//           </svg>
//           <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wide">Budget</p>
//         </div>
//         <p className="text-sm font-bold text-green-600">
//           {getDisplayRevenue(selectedInvitation)}
//         </p>
//       </div>
//     </div>

//     {/* Date and Duration Row */}
//     <div className="grid grid-cols-2 gap-3">
//       <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
//         <div className="flex items-center gap-2 mb-1">
//           <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//           </svg>
//           <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Invited</p>
//         </div>
//         <p className="text-xs text-gray-700">
//           {selectedInvitation.date || formatDate(selectedInvitation.created_at)}
//         </p>
//       </div>

//       <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
//         <div className="flex items-center gap-2 mb-1">
//           <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//           </svg>
//           <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Duration</p>
//         </div>
//         <p className="text-xs text-gray-700 capitalize">
//           {selectedInvitation.duration || "Not specified"}
//         </p>
//       </div>
//     </div>

//     {/* Status Card */}
//     <div className="bg-gradient-to-br from-yellow-50 to-white rounded-xl p-3 border border-yellow-100">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-[10px] font-semibold text-yellow-600 uppercase tracking-wide">Status</p>
//           <p className="text-sm font-medium text-gray-800 mt-0.5">
//             {selectedInvitation.status || "Pending"}
//           </p>
//         </div>
//         <div className={`w-2 h-2 rounded-full animate-pulse ${
//           selectedInvitation.status?.toLowerCase() === "accepted" ? "bg-green-500" : "bg-yellow-500"
//         }`} />
//       </div>
//     </div>
//   </div>

//   {/* Job Description Section */}
//   <div className="mb-5">
//     <div className="flex items-center gap-2 mb-3">
//       <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//       </svg>
//       <h3 className="font-semibold text-sm md:text-lg text-gray-800">Job Description</h3>
//     </div>
//     <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
//       <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-wrap break-words">
//         {selectedInvitation.description || "No description available."}
//       </p>
//     </div>
//   </div>

//   {/* Required Skills Section */}
//   {selectedInvitation.skills && selectedInvitation.skills.length > 0 && (
//     <div className="mb-5">
//       <div className="flex items-center gap-2 mb-3">
//         <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
//         </svg>
//         <h4 className="font-semibold text-xs md:text-sm text-gray-700">Required Skills</h4>
//       </div>
//       <div className="flex flex-wrap gap-2">
//         {selectedInvitation.skills.slice(0, 8).map((skill, idx) => (
//           <span
//             key={idx}
//             className="px-2.5 py-1 bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 rounded-full text-[10px] font-medium border border-purple-200"
//           >
//             {skill}
//           </span>
//         ))}
//         {selectedInvitation.skills.length > 8 && (
//           <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-medium">
//             +{selectedInvitation.skills.length - 8} more
//           </span>
//         )}
//       </div>
//     </div>
//   )}

//   {/* Action Buttons */}
//   <div className="flex flex-col gap-3 mt-6 pt-4 border-t border-gray-200 md:max-w-md md:mx-auto">
//   <button
//     onClick={() => handleAcceptInvitation(selectedInvitation.id)}
//     disabled={loading || selectedInvitation.status?.toLowerCase() === "accepted"}
//     className={`w-full py-2.5 px-4 text-sm rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
//       loading || selectedInvitation.status?.toLowerCase() === "accepted"
//         ? "bg-gray-300 cursor-not-allowed text-gray-500"
//         : "bg-gradient-to-r from-[#51218F] to-[#2a0e4a] text-white hover:shadow-lg active:scale-98"
//     }`}
//   >
//     {loading ? (
//       <>
//         <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
//           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//         </svg>
//         Processing...
//       </>
//     ) : selectedInvitation.status?.toLowerCase() === "accepted" ? (
//       <>
//         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
//         </svg>
//         Accepted
//       </>
//     ) : (
//       <>
//         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//         </svg>
//         Accept Invitation
//       </>
//     )}
//   </button>

//   <button
//     onClick={() =>
//       handleMessageClick(
//         getSenderId(selectedInvitation),
//         selectedInvitation.client_name,
//         selectedInvitation.job_id,
//         selectedInvitation.project_name,
//       )
//     }
//     className="w-full py-2.5 px-4 text-sm rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 border-2 border-[#51218F] text-[#51218F] bg-white hover:bg-purple-50 active:scale-98"
//   >
//     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
//     </svg>
//     Message Client
//   </button>
// </div>
// </div>
//     ) : (
//       <>
//         {/* Mobile View - Fixed Table Layout with Proper Alignment */}
//         <div className="block md:hidden">
//           {/* Header - Single Row */}
//           <div className="grid grid-cols-4 gap-0 text-[9px] font-semibold text-gray-600 bg-gray-50 border-b">
//             <div className="px-2 py-2 text-left">Client</div>
//             <div className="px-2 py-2 text-left">Project</div>
//             <div className="px-2 py-2 text-left">Date</div>
//             <div className="px-2 py-2 text-center">Action</div>
//           </div>

//           {/* List Items - Single Row per Item */}
//           <div className="divide-y divide-gray-100">
//             {paginatedInvitations.length > 0 ? (
//               paginatedInvitations.map((invitation) => (
//                 <div
//                   key={invitation.id}
//                   className="grid grid-cols-4 gap-0 items-center hover:bg-gray-50 transition"
//                 >
//                   {/* Client Name */}
//                   <div className="px-2 py-2">
//                     <p className="text-[10px] font-medium text-gray-800 truncate">
//                       {invitation.client_name}
//                     </p>
//                   </div>

//                   {/* Project Name */}
//                   <div className="px-2 py-2">
//                     <p className="text-[9px] text-gray-600 truncate">
//                       {invitation.project_name}
//                     </p>
//                   </div>

//                   {/* Date */}
//                   <div className="px-2 py-2">
//                     <p className="text-[9px] text-gray-500">
//                       {formatDate(invitation.date)}
//                     </p>
//                   </div>

//                   {/* Action Button */}
//                   <div className="px-2 py-2 flex justify-center">
//                     <button
//                       onClick={async () => {
//                         const details = await fetchInvitationDetails(invitation.id);
//                         if (details) {
//                           setSelectedInvitation(details);
//                         }
//                       }}
//                       className="px-2.5 py-1 rounded-full bg-[#B388FF] text-white text-[8px] font-medium whitespace-nowrap"
//                     >
//                       View
//                     </button>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="py-8 text-center text-gray-400 text-xs">
//                 No invitations found
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Desktop View - Table */}
//         <div className="hidden md:block overflow-x-auto">
//           <div className="min-w-[900px]">
//             <div className="grid grid-cols-5 px-8 py-5 font-semibold text-gray-700 text-center text-sm border-b">
//               <span className="text-left">Client Name</span>
//               <span className="text-left">Project Name</span>
//               <span className="text-center">Date</span>
//               <span className="text-center">Revenue</span>
//               <span className="text-center">Action</span>
//             </div>
//             <div className="divide-y divide-gray-100">
//               {paginatedInvitations.length > 0 ? (
//                 paginatedInvitations.map((invitation) => (
//                   <div
//                     key={invitation.id}
//                     className="grid grid-cols-5 px-8 py-4 text-sm text-gray-700 items-center hover:bg-gray-50 transition"
//                   >
//                     <span className="text-left truncate pr-2">{invitation.client_name}</span>
//                     <span className="text-left truncate pr-2">{invitation.project_name}</span>
//                     <span className="text-center">{formatDate(invitation.date)}</span>
//                     <span className="text-center font-semibold text-green-600">
//                       {getInvitationRevenue(invitation)}
//                     </span>
//                     <div className="flex justify-center">
//                       <button
//                         onClick={async () => {
//                           const details = await fetchInvitationDetails(invitation.id);
//                           if (details) {
//                             setSelectedInvitation(details);
//                           }
//                         }}
//                         className="px-4 py-1.5 rounded-full bg-[#B388FF] text-white text-xs hover:bg-[#9B6EE8] transition"
//                       >
//                         View Details
//                       </button>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="py-12 text-center text-gray-500">
//                   No invitations found
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {renderPagination(
//           invitationsPage,
//           getTotalPages(invitations.length),
//           setInvitationsPage,
//         )}
//       </>
//     )}
//   </div>
// )}

//         {/* CURRENT CONTRACTS - Modern Table Design */}
//        {activeSubTab === "current" && !loading && (
//   <>
//     {/* Desktop View - No Horizontal Scroll */}
//     <div className="hidden md:block bg-white rounded-2xl shadow-xl overflow-x-auto">
//       <div className="min-w-[900px] lg:min-w-full">
//         {/* Table Header */}
//         <div className="grid grid-cols-12 gap-2 px-3 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
//           <div className="col-span-3 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wide">
//             Project & Client
//           </div>
//           <div className="col-span-2 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wide">
//             Timeline
//           </div>
//           <div className="col-span-2 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wide">
//             Budget
//           </div>
//           <div className="col-span-2 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wide">
//             Progress
//           </div>
//           <div className="col-span-2 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wide">
//             Status
//           </div>
//           <div className="col-span-1 text-center text-[11px] font-semibold text-gray-700 uppercase tracking-wide">
//             Action
//           </div>
//         </div>

//         <div className="divide-y divide-gray-100">
//           {paginatedCurrentContracts.length > 0 ? (
//             paginatedCurrentContracts.map((contract) => {
//               const statusDisplay = getContractStatusDisplay(contract);
//               const hasRevision = hasRevisionFeedback(contract);
//               const hasMilestoneRevisionFlag = hasMilestoneRevision(contract);
//               const needsAction = (hasRevision || hasMilestoneRevisionFlag) && !isContractInReview(contract);
//               const isInReview = isContractInReview(contract);
//               const isMilestoneContract = hasMilestones(contract);

//               return (
//                 <div key={contract.id} className="hover:bg-gray-50 transition-colors">
//                   {/* Main Contract Row */}
//                   <div className="grid grid-cols-12 gap-2 px-3 py-3 items-center">
//                     {/* Project & Client */}
//                     <div className="col-span-3">
//                       <div className="flex items-center gap-2">
//                         <CreatorAvatar contract={contract} size="w-8 h-8" />
//                         <div className="min-w-0">
//                           <p className="font-semibold text-gray-800 truncate text-xs">
//                             {contract.job_title?.length > 25 ? contract.job_title.substring(0, 25) + '...' : contract.job_title}
//                           </p>
//                           <p className="text-[10px] text-gray-500 truncate">
//                             with {getClientName(contract)}
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Timeline - Single line */}
//                     <div className="col-span-2">
//                       <div className="text-[11px] text-gray-700">
//                         {contract.start_date ? formatDate(contract.start_date) : "--"}
//                         <span className="text-gray-400 mx-1">→</span>
//                         {contract.end_date ? formatDate(contract.end_date) : "--"}
//                       </div>
//                     </div>

//                     {/* Budget */}
//                     <div className="col-span-2">
//                       <p className="text-sm font-bold text-purple-700">
//                         {getContractRevenue(contract)}
//                       </p>
//                     </div>

//                     {/* Progress */}
//                     <div className="col-span-2">
//                       {isMilestoneContract ? (
//                         <div className="w-full">
//                           <div className="flex justify-between text-[9px] text-gray-500 mb-0.5">
//                             <span>
//                               {contract.milestones_data.filter(m => m.status === "paid").length}
//                               /{contract.milestones_data.length}
//                             </span>
//                             <span className="text-purple-600 font-medium">
//                               ₹{contract.milestones_data.filter(m => m.status === "paid").reduce((s, m) => s + (m.amount || 0), 0)}
//                             </span>
//                           </div>
//                           <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
//                             <div
//                               className={`h-full rounded-full transition-all duration-300 ${hasMilestoneRevisionFlag ? "bg-orange-500" : "bg-gradient-to-r from-purple-500 to-purple-700"}`}
//                               style={{
//                                 width: `${(contract.milestones_data.filter(m => m.status === "paid").length / contract.milestones_data.length) * 100}%`,
//                               }}
//                             />
//                           </div>
//                           {hasMilestoneRevisionFlag && (
//                             <p className="text-[9px] text-orange-600 mt-0.5 flex items-center gap-0.5">
//                               <span>↻</span> {getMilestoneRevisionCount(contract)} need revision
//                             </p>
//                           )}
//                         </div>
//                       ) : (
//                         <div>
//                           {hasRevision ? (
//                             <p className="text-orange-600 text-[10px] font-medium">Revision requested</p>
//                           ) : (
//                             <p className="text-gray-500 text-[10px]">Standard contract</p>
//                           )}
//                         </div>
//                       )}
//                     </div>

//                     {/* Status */}
//                     <div className="col-span-2">
//                       <span
//                         className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-[10px] font-medium ${statusDisplay.color}`}
//                       >
//                         <span className="text-[9px]">{statusDisplay.icon}</span>
//                         <span className="text-[10px]">{statusDisplay.text}</span>
//                       </span>
//                     </div>

//                     {/* Action Buttons */}
//                     <div className="col-span-1 flex justify-center">
//                       {isInReview ? (
//                         <button
//                           disabled
//                           className="px-2 py-1 rounded-lg bg-gray-300 text-gray-500 text-[10px] font-medium cursor-not-allowed flex items-center gap-0.5"
//                         >
//                           <span>⏳</span> Review
//                         </button>
//                       ) : needsAction ? (
//                         <button
//                           onClick={() => {
//                             if (hasRevision) {
//                               handleViewRevision(contract);
//                             } else if (hasMilestoneRevisionFlag) {
//                               setSelectedContractForMilestones(contract);
//                               setShowMilestoneDetailsModal(true);
//                             }
//                           }}
//                           className="px-2 py-1 rounded-lg bg-orange-500 text-white text-[10px] font-medium hover:bg-orange-600 transition flex items-center gap-0.5"
//                         >
//                           <span>↻</span> Action
//                         </button>
//                       ) : isMilestoneContract ? (
//                         <button
//                           onClick={() => {
//                             setSelectedContractForMilestones(contract);
//                             setShowMilestoneDetailsModal(true);
//                           }}
//                           className="px-2 py-1 rounded-lg bg-purple-600 text-white text-[10px] font-medium hover:bg-purple-700 transition flex items-center gap-0.5"
//                         >
//                           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                           </svg>
//                           Details
//                         </button>
//                       ) : (
//                         <button
//                           onClick={() => {
//                             setSelectedContract(contract);
//                             setSelectedStatus(contract.status || "");
//                             setStatusReason("");
//                             setShowEditCard(true);
//                           }}
//                           className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition flex items-center justify-center"
//                           title="Update Status"
//                         >
//                           <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                             <path d="M4 9v9a2 2 0 0 0 2 2h9" />
//                             <path d="M6.5 17.5l2.5-.6 9.9-9.9a2.2 2.2 0 0 0-3.1-3.1L5.9 13.8l-.6 2.5Z" />
//                             <path d="M10.8 8.2l3.8 3.8" />
//                           </svg>
//                         </button>
//                       )}
//                     </div>
//                   </div>

//                   {/* Revision Preview */}
//                   {hasRevision && contract.revision_description && (
//                     <div className="mx-3 mb-2 p-1.5 bg-orange-50 border-l-4 border-orange-500 rounded">
//                       <p className="text-[9px] text-orange-700 font-medium">Revision Feedback:</p>
//                       <p className="text-[9px] text-orange-600 mt-0.5 line-clamp-2">
//                         {contract.revision_description}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               );
//             })
//           ) : (
//             <div className="py-12 text-center text-gray-500 text-sm">
//               No current contracts found
//             </div>
//           )}
//         </div>
//       </div>
//     </div>

//     {/* Mobile View */}
//    {/* Mobile View - Reduced Text Sizes */}
// <div className="block md:hidden space-y-3">
//   {paginatedCurrentContracts.length > 0 ? (
//     paginatedCurrentContracts.map((contract) => {
//       const statusDisplay = getContractStatusDisplay(contract);
//       const hasRevision = hasRevisionFeedback(contract);
//       const hasMilestoneRevisionFlag = hasMilestoneRevision(contract);
//       const needsAction = (hasRevision || hasMilestoneRevisionFlag) && !isContractInReview(contract);
//       const isInReview = isContractInReview(contract);
//       const isMilestoneContract = hasMilestones(contract);

//       return (
//         <div key={contract.id} className="bg-white rounded-xl shadow-md overflow-hidden">
//           <div className="p-3 space-y-2.5">
//             {/* Header */}
//             <div className="flex justify-between items-start">
//               <div className="flex items-center gap-2 flex-1 min-w-0">
//                 <CreatorAvatar contract={contract} size="w-8 h-8" />
//                 <div className="min-w-0 flex-1">
//                   <h4 className="font-semibold text-gray-800 text-xs truncate">
//                     {contract.job_title}
//                   </h4>
//                   <p className="text-[9px] text-gray-500 truncate">
//                     {getClientName(contract)}
//                   </p>
//                 </div>
//               </div>
//               <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-white text-[9px] font-medium ml-2 flex-shrink-0 ${statusDisplay.color}`}>
//                 <span className="text-[8px]">{statusDisplay.icon}</span>
//                 <span className="text-[9px]">{statusDisplay.text}</span>
//               </span>
//             </div>

//             {/* Details Grid */}
//             <div className="grid grid-cols-2 gap-2">
//               <div>
//                 <p className="text-[8px] text-gray-500 uppercase tracking-wide">Timeline</p>
//                 <p className="text-gray-700 text-[10px]">
//                   {contract.start_date ? formatDate(contract.start_date) : "--"} 
//                   <span className="text-gray-400 mx-0.5">-</span>
//                   {contract.end_date ? formatDate(contract.end_date) : "--"}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-[8px] text-gray-500 uppercase tracking-wide">Budget</p>
//                 <p className="text-xs font-bold text-purple-700">
//                   {getContractRevenue(contract)}
//                 </p>
//               </div>
//             </div>

//             {/* Progress for Milestones */}
//             {isMilestoneContract && (
//               <div>
//                 <div className="flex justify-between text-[8px] text-gray-500 mb-0.5">
//                   <span>Progress</span>
//                   <span>
//                     {contract.milestones_data.filter(m => m.status === "paid").length}
//                     /{contract.milestones_data.length}
//                   </span>
//                 </div>
//                 <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
//                   <div
//                     className={`h-full rounded-full transition-all duration-300 ${hasMilestoneRevisionFlag ? "bg-orange-500" : "bg-gradient-to-r from-purple-500 to-purple-700"}`}
//                     style={{
//                       width: `${(contract.milestones_data.filter(m => m.status === "paid").length / contract.milestones_data.length) * 100}%`,
//                     }}
//                   />
//                 </div>
//                 {hasMilestoneRevisionFlag && (
//                   <p className="text-[8px] text-orange-600 mt-0.5 flex items-center gap-0.5">
//                     <span>↻</span> {getMilestoneRevisionCount(contract)} need revision
//                   </p>
//                 )}
//               </div>
//             )}

//             {/* Revision Preview */}
//             {hasRevision && contract.revision_description && (
//               <div className="p-1.5 bg-orange-50 border-l-3 border-orange-500 rounded">
//                 <p className="text-[8px] text-orange-700 font-medium">Feedback:</p>
//                 <p className="text-[8px] text-orange-600 mt-0.5 line-clamp-2">
//                   {contract.revision_description}
//                 </p>
//               </div>
//             )}

//             {/* Action Button */}
//             {isInReview ? (
//               <button disabled className="w-full py-1.5 rounded-lg bg-gray-300 text-gray-500 text-[10px] font-medium cursor-not-allowed flex items-center justify-center gap-1">
//                 <span>⏳</span> In Review
//               </button>
//             ) : needsAction ? (
//               <button
//                 onClick={() => {
//                   if (hasRevision) {
//                     handleViewRevision(contract);
//                   } else if (hasMilestoneRevisionFlag) {
//                     setSelectedContractForMilestones(contract);
//                     setShowMilestoneDetailsModal(true);
//                   }
//                 }}
//                 className="w-full py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-medium hover:bg-orange-600 transition"
//               >
//                 ↻ Take Action
//               </button>
//             ) : isMilestoneContract ? (
//               <button
//                 onClick={() => {
//                   setSelectedContractForMilestones(contract);
//                   setShowMilestoneDetailsModal(true);
//                 }}
//                 className="w-full py-1.5 rounded-lg bg-purple-600 text-white text-[10px] font-medium hover:bg-purple-700 transition flex items-center justify-center gap-1.5"
//               >
//                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                 </svg>
//                 View Details
//               </button>
//             ) : (
//               <button
//                 onClick={() => {
//                   setSelectedContract(contract);
//                   setSelectedStatus(contract.status || "");
//                   setStatusReason("");
//                   setShowEditCard(true);
//                 }}
//                 className="w-full py-1.5 rounded-lg bg-purple-600 text-white text-[10px] font-medium hover:bg-purple-700 transition"
//               >
//                 ✎ Update Status
//               </button>
//             )}
//           </div>
//         </div>
//       );
//     })
//   ) : (
//     <div className="bg-white rounded-xl p-6 text-center text-gray-400 text-xs">
//       No current contracts found
//     </div>
//   )}
// </div>

//     {renderPagination(
//       currentContractsPage,
//       getTotalPages(currentContracts.length),
//       setCurrentContractsPage,
//     )}
//   </>
// )}

//         {/* COMPLETED CONTRACTS */}
//        {activeSubTab === "completed" && !loading && (
//   <>
//     {/* Desktop View */}
//     <div className="hidden md:block bg-white rounded-2xl shadow-xl overflow-hidden">
//       <div className="overflow-x-auto">
//         <div className="min-w-[900px]">
//           <div className="grid grid-cols-6 px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 text-sm font-semibold text-gray-700 text-center">
//             <span>Client Name</span>
//             <span>Project Name</span>
//             <span>Completed Date</span>
//             <span>Revenue</span>
//             <span>Status</span>
//             <span>Action</span>
//           </div>
//           <div className="divide-y divide-gray-100">
//             {paginatedCompletedContracts.length > 0 ? (
//               paginatedCompletedContracts.map((contract, i) => (
//                 <div
//                   key={contract.id || i}
//                   className="hover:bg-gray-50 transition-colors"
//                 >
//                   <div className="grid grid-cols-6 px-6 py-4 items-center text-center text-sm text-gray-700">
//                     <span className="font-medium truncate">
//                       {getClientName(contract)}
//                     </span>
//                     <span className="truncate">{contract.job_title}</span>
//                     <span>{formatDate(contract.end_date)}</span>
//                     <span className="font-semibold text-green-600">
//                       {getContractRevenue(contract)}
//                     </span>
//                     <div className="flex justify-center">
//                       <span
//                         className={`px-3 py-1 rounded-full text-white text-xs font-medium ${getStatusColor(contract.status)}`}
//                       >
//                         {getStatusText(contract.status)}
//                       </span>
//                     </div>
//                     <div className="flex justify-center">
//                       {reviewedContracts.has(contract.id) ? (
//                         <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-500 text-xs font-medium">
//                           Reviewed
//                         </span>
//                       ) : (
//                         <button
//                           onClick={() => handleReviewClick(contract)}
//                           className="px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 transition"
//                         >
//                           Review Client
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="py-12 text-center text-gray-500">
//                 No completed contracts found
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>

//     {/* Mobile View - Ultra Compact Card Layout */}
//     <div className="block md:hidden space-y-2">
//       {paginatedCompletedContracts.length > 0 ? (
//         paginatedCompletedContracts.map((contract, i) => (
//           <div
//             key={contract.id || i}
//             className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
//           >
//             <div className="p-2.5">
//               {/* Row 1: Project Name and Status */}
//               <div className="flex justify-between items-start gap-2 mb-1.5">
//                 <h4 className="font-medium text-gray-800 text-[11px] truncate flex-1">
//                   {contract.job_title}
//                 </h4>
//                 <span
//                   className={`px-1.5 py-0.5 rounded-full text-white text-[7px] font-medium ${getStatusColor(contract.status)}`}
//                 >
//                   {getStatusText(contract.status)}
//                 </span>
//               </div>

//               {/* Row 2: Client Name */}
//               <p className="text-[8px] text-gray-500 truncate mb-1.5">
//                 {getClientName(contract)}
//               </p>

//               {/* Row 3: Completed Date and Revenue */}
//               <div className="flex justify-between items-center mb-2">
//                 <div>
//                   <span className="text-[7px] text-gray-400">Completed</span>
//                   <p className="text-[9px] text-gray-600">
//                     {formatDate(contract.end_date)}
//                   </p>
//                 </div>
//                 <div className="text-right">
//                   <span className="text-[7px] text-gray-400">Revenue</span>
//                   <p className="text-[11px] font-bold text-green-600">
//                     {getContractRevenue(contract)}
//                   </p>
//                 </div>
//               </div>

//               {/* Row 4: Action */}
//               {reviewedContracts.has(contract.id) ? (
//                 <div className="text-center pt-0.5">
//                   <span className="text-[8px] text-gray-400">✓ Reviewed</span>
//                 </div>
//               ) : (
//                 <button
//                   onClick={() => handleReviewClick(contract)}
//                   className="w-full py-1 rounded-lg bg-purple-600 text-white text-[9px] font-medium hover:bg-purple-700 transition"
//                 >
//                   Review Client
//                 </button>
//               )}
//             </div>
//           </div>
//         ))
//       ) : (
//         <div className="bg-white rounded-xl p-6 text-center text-gray-400 text-xs">
//           No completed contracts found
//         </div>
//       )}
//     </div>

//     {renderPagination(
//       completedContractsPage,
//       getTotalPages(completedContracts.length),
//       setCompletedContractsPage,
//     )}
//   </>
// )}
//       </section>

//       <div className="-mx-4">
//         <Footer />
//       </div>

//       {/* Milestone Details Modal */}
//       <MilestoneDetailsModal />

//       {/* EDIT CONTRACT POPUP */}
//       {showEditCard &&
//         selectedContract &&
//         !isContractInReview(selectedContract) && (
//           <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6">
//             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
//             <div
//               ref={popupRef}
//               className="relative bg-white w-full max-w-[500px] md:max-w-[520px] rounded-xl shadow-2xl p-5 animate-fadeIn"
//             >
//               <div className="flex justify-between items-start mb-4">
//                 <div className="flex items-center gap-3">
//                   <CreatorAvatar contract={selectedContract} size="w-10 h-10" />
//                   <div>
//                     <h3 className="font-semibold text-sm text-gray-800">
//                       {getClientName(selectedContract)}
//                     </h3>
//                     <p className="text-xs text-gray-500">Client</p>
//                   </div>
//                 </div>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={handleSubmitClick}
//                     disabled={loading}
//                     className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${loading ? "bg-gray-300 cursor-not-allowed text-gray-500" : buttonPrimaryClasses}`}
//                   >
//                     {loading ? "Processing..." : "Submit"}
//                   </button>
//                   <button
//                     onClick={() => {
//                       setShowEditCard(false);
//                       setSelectedFiles([]);
//                       setWorkDescription("");
//                       setSelectedStatus("");
//                       setStatusReason("");
//                       setIsStatusDropdownOpen(false);
//                     }}
//                     className={buttonSecondaryClasses}
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//               <p className="text-sm font-semibold mb-2 text-gray-800 border-l-[3px] border-purple-500 pl-2">
//                 {selectedContract.job_title}
//               </p>
//               <div className="h-px bg-gray-200 my-3" />

//               <div className="mb-4" ref={statusDropdownRef}>
//                 <label className={labelClasses}>
//                   Update Contract Status
//                 </label>
//                 <div className="relative">
//                   <button
//                     type="button"
//                     onClick={() =>
//                       setIsStatusDropdownOpen(!isStatusDropdownOpen)
//                     }
//                     className="w-full flex items-center justify-between bg-white rounded-lg px-3 py-2.5 text-sm border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
//                   >
//                     <span
//                       className={selectedStatus ? "text-gray-900" : "text-gray-400"}
//                     >
//                       {getSelectedStatusLabel()}
//                     </span>
//                     <svg
//                       className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
//                         isStatusDropdownOpen ? "rotate-180" : ""
//                       }`}
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth="2"
//                         d="M19 9l-7 7-7-7"
//                       />
//                     </svg>
//                   </button>
//                   {isStatusDropdownOpen && (
//                     <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
//                       {statusOptions.map((option) => (
//                         <button
//                           key={option.value}
//                           onClick={() => {
//                             setSelectedStatus(option.value);
//                             setStatusReason("");
//                             setIsStatusDropdownOpen(false);
//                           }}
//                           className={`w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition ${
//                             selectedStatus === option.value
//                               ? "bg-purple-50 text-purple-700 font-medium"
//                               : "text-gray-700"
//                           }`}
//                         >
//                           {option.label}
//                           {selectedStatus === option.value && (
//                             <span className="float-right text-purple-500">
//                               ✓
//                             </span>
//                           )}
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {(selectedStatus === "pending" || selectedStatus === "cancelled" || selectedStatus === "awaiting") && (
//                 <div className="mb-4">
//                   <label className={labelClasses}>
//                     {selectedStatus === "cancelled"
//                       ? "Reason for cancellation"
//                       : selectedStatus === "awaiting"
//                         ? "Reason for awaiting"
//                         : "Reason for pending"}
//                   </label>
//                   <textarea
//                     placeholder={
//                       selectedStatus === "cancelled"
//                         ? "Please explain why you are cancelling this contract..."
//                         : selectedStatus === "awaiting"
//                           ? "Please explain why this contract is awaiting..."
//                           : "Please explain why this contract is pending..."
//                     }
//                     value={statusReason}
//                     onChange={(e) => setStatusReason(e.target.value)}
//                     rows={2}
//                     className={textareaClasses}
//                   />
//                   <p className="text-xs text-gray-400 mt-1">
//                     This reason will be shared with the client.
//                   </p>
//                 </div>
//               )}

//               {selectedStatus === "completed" && (
//                 <>
//                   <div className="mb-4">
//                     <label className={labelClasses}>
//                       Work Description
//                     </label>
//                     <textarea
//                       placeholder="Describe the work you're submitting..."
//                       value={workDescription}
//                       onChange={(e) => setWorkDescription(e.target.value)}
//                       rows={2}
//                       className={textareaClasses}
//                     />
//                   </div>
//                   <div className="mb-4">
//                     <label className={labelClasses}>
//                       External File Link
//                     </label>
//                     <input
//                       type="url"
//                       value={externalFileLink}
//                       onChange={(e) => setExternalFileLink(e.target.value)}
//                       placeholder="Paste Google Drive / Dropbox link"
//                       className={inputClasses}
//                     />
//                     <p className="text-xs text-gray-400 mt-1">
//                       For files exceeding 25MB, use cloud storage link
//                     </p>
//                   </div>
//                 </>
//               )}

//               <p className={labelClasses}>Attachments</p>
//               {selectedFiles.length > 0 && (
//                 <div className="mb-3 space-y-1.5 max-h-28 overflow-y-auto">
//                   {selectedFiles.map((file, index) => (
//                     <div
//                       key={index}
//                       className="flex items-center justify-between p-1.5 rounded-lg border border-gray-200 bg-gray-50"
//                     >
//                       <div className="flex items-center gap-1.5 flex-1 min-w-0">
//                         <svg
//                           className="w-3.5 h-3.5 text-gray-500 flex-shrink-0"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//                           />
//                         </svg>
//                         <span className="text-xs truncate flex-1">
//                           {file.name}
//                         </span>
//                         <span className="text-xs text-gray-500 flex-shrink-0">
//                           ({(file.size / (1024 * 1024)).toFixed(1)} MB)
//                         </span>
//                       </div>
//                       <button
//                         onClick={() => removeSelectedFile(index)}
//                         className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
//                       >
//                         <svg
//                           className="w-3.5 h-3.5"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M6 18L18 6M6 6l12 12"
//                           />
//                         </svg>
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {selectedStatus === "completed" && (
//                 <div
//                   className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
//                     isDragging
//                       ? "border-purple-500 bg-purple-50"
//                       : "border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-50/30"
//                   }`}
//                   onDragEnter={handleDragEnter}
//                   onDragLeave={handleDragLeave}
//                   onDragOver={handleDragOver}
//                   onDrop={handleDrop}
//                   onClick={() =>
//                     document.getElementById("file-upload-input").click()
//                   }
//                 >
//                   <input
//                     id="file-upload-input"
//                     type="file"
//                     multiple
//                     className="hidden"
//                     onChange={handleFileSelection}
//                   />
//                   <svg
//                     className="w-6 h-6 mx-auto text-gray-400"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={1.5}
//                       d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
//                     />
//                   </svg>
//                   <div className="text-xs">
//                     <span className="text-purple-600 font-medium">
//                       Click to upload
//                     </span>
//                     <span className="text-gray-500"> or drag and drop</span>
//                   </div>
//                   <p className="text-xs text-gray-400">Max file size: 25MB</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//       {/* MILESTONE SUBMISSION MODAL */}
//       {showMilestoneModal && selectedContract && selectedMilestone && (
//         <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6">
//           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
//           <div
//             ref={popupRef}
//             className="relative bg-white w-full max-w-[500px] rounded-xl shadow-2xl p-5 animate-fadeIn"
//           >
//             <div className="flex justify-between items-start mb-4">
//               <div>
//                 <h3 className="font-semibold text-lg text-gray-800">
//                   {selectedMilestone.status === "revision_requested"
//                     ? "Resubmit Milestone Work"
//                     : "Submit Milestone Work"}
//                 </h3>
//                 <p className="text-sm text-gray-500 mt-0.5">
//                   Milestone: {selectedMilestone.description}
//                 </p>
//                 <p className="text-xs text-purple-600 font-medium mt-0.5">
//                   Amount: ₹{selectedMilestone.amount}
//                 </p>
//                 {selectedMilestone.status === "revision_requested" &&
//                   selectedMilestone.review && (
//                     <div className="mt-2 p-2 bg-orange-50 rounded text-xs text-orange-700 border border-orange-200">
//                       <span className="font-medium">Revision Feedback:</span>{" "}
//                       {selectedMilestone.review.comments}
//                     </div>
//                   )}
//               </div>
//               <button
//                 onClick={() => {
//                   setShowMilestoneModal(false);
//                   setSelectedMilestone(null);
//                   setSelectedFiles([]);
//                   setWorkDescription("");
//                   setExternalFileLink("");
//                 }}
//                 className="text-gray-400 hover:text-gray-600 text-2xl"
//               >
//                 &times;
//               </button>
//             </div>

//             <div className="space-y-4">
//               <div>
//                 <label className={labelClasses}>
//                   Work Description
//                 </label>
//                 <textarea
//                   value={workDescription}
//                   onChange={(e) => setWorkDescription(e.target.value)}
//                   rows="3"
//                   className={textareaClasses}
//                   placeholder="Describe what you've completed for this milestone..."
//                 />
//               </div>

//               <div>
//                 <label className={labelClasses}>
//                   External Link (Google Drive, Dropbox, etc.)
//                 </label>
//                 <input
//                   type="url"
//                   value={externalFileLink}
//                   onChange={(e) => setExternalFileLink(e.target.value)}
//                   className={inputClasses}
//                   placeholder="https://drive.google.com/..."
//                 />
//               </div>

//               <div>
//                 <label className={labelClasses}>
//                   Attachments (Max 25MB each)
//                 </label>
//                 <div
//                   className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
//                     isDragging
//                       ? "border-purple-500 bg-purple-50"
//                       : "border-gray-300 hover:border-purple-400 hover:bg-purple-50/30"
//                   }`}
//                   onDragEnter={handleDragEnter}
//                   onDragLeave={handleDragLeave}
//                   onDragOver={handleDragOver}
//                   onDrop={handleDrop}
//                   onClick={() =>
//                     document.getElementById("milestone-file-input").click()
//                   }
//                 >
//                   <input
//                     id="milestone-file-input"
//                     type="file"
//                     multiple
//                     className="hidden"
//                     onChange={handleFileSelection}
//                   />
//                   <svg
//                     className="mx-auto h-8 w-8 text-gray-400"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
//                     />
//                   </svg>
//                   <p className="text-sm text-gray-600">
//                     Click or drag files to upload
//                   </p>
//                 </div>
//                 {selectedFiles.length > 0 && (
//                   <div className="mt-2 space-y-1">
//                     {selectedFiles.map((file, idx) => (
//                       <div
//                         key={idx}
//                         className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded border border-gray-200"
//                       >
//                         <span className="truncate">{file.name}</span>
//                         <button
//                           onClick={() => removeSelectedFile(idx)}
//                           className="text-red-500 hover:text-red-700"
//                         >
//                           &times;
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="flex gap-3 mt-6">
//               <button
//                 onClick={() => {
//                   setShowMilestoneModal(false);
//                   setSelectedMilestone(null);
//                   setSelectedFiles([]);
//                   setWorkDescription("");
//                   setExternalFileLink("");
//                 }}
//                 className="flex-1 px-4 py-2 rounded-lg text-white bg-gray-500 hover:bg-gray-600 transition"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSubmitMilestoneWork}
//                 disabled={loading}
//                 className={`flex-1 px-4 py-2 rounded-lg text-white transition ${
//                   loading ? "bg-purple-400 cursor-not-allowed" : buttonPrimaryClasses
//                 }`}
//               >
//                 {loading
//                   ? "Submitting..."
//                   : selectedMilestone.status === "revision_requested"
//                     ? "Resubmit Work"
//                     : "Submit Milestone Work"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* REVIEW MODAL */}
//       {showReviewModal && selectedReviewContract && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
//           <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
//             <div className="bg-gradient-to-r from-[#51218F] to-black px-6 py-4">
//               <h3 className="text-xl font-bold text-white">Review Client</h3>
//               <p className="text-white/80 text-sm">
//                 Share your experience with{" "}
//                 {getClientName(selectedReviewContract)}
//               </p>
//             </div>
//             <div className="p-6 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Rating (1–5)
//                 </label>
//                 <div className="flex gap-2">
//                   {[1, 2, 3, 4, 5].map((star) => (
//                     <button
//                       key={star}
//                       onClick={() => setReviewRating(star)}
//                       className="text-2xl focus:outline-none transition-transform hover:scale-110"
//                     >
//                       {star <= reviewRating ? (
//                         <span className="text-yellow-500">★</span>
//                       ) : (
//                         <span className="text-gray-300">★</span>
//                       )}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Comment (optional)
//                 </label>
//                 <textarea
//                   rows={3}
//                   value={reviewComment}
//                   onChange={(e) => setReviewComment(e.target.value)}
//                   placeholder="What was it like working with this client?"
//                   className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-[#51218F] focus:ring-1 focus:ring-[#51218F] outline-none resize-none"
//                 />
//               </div>
//               <div className="flex gap-3 pt-2">
//                 <button
//                   onClick={() => setShowReviewModal(false)}
//                   className="flex-1 py-2 rounded-lg border border-gray-300 text-white bg-gray-500 hover:bg-gray-600 transition"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSubmitReview}
//                   disabled={reviewSubmitting}
//                   className="flex-1 py-2 rounded-lg bg-[#51218F] text-white hover:opacity-90 disabled:opacity-50 transition"
//                 >
//                   {reviewSubmitting ? "Submitting..." : "Submit Review"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* FULL PROJECT REVISION MODAL */}
//       {showFullProjectRevisionModal && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
//           <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
//             <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-5 sticky top-0">
//               <div className="flex items-start justify-between">
//                 <div className="flex items-center gap-3">
//                   <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
//                     <svg
//                       width="22"
//                       height="22"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       stroke="white"
//                       strokeWidth="2"
//                     >
//                       <path d="M12 8v4m0 4h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
//                     </svg>
//                   </div>
//                   <div>
//                     <h3 className="text-xl font-bold text-white">
//                       Revision Required
//                     </h3>
//                     <p className="text-white/70 text-sm mt-0.5">
//                       Client requested changes to your work
//                     </p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => setShowFullProjectRevisionModal(false)}
//                   className="text-white/70 hover:text-white transition"
//                 >
//                   <svg
//                     width="24"
//                     height="24"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                   >
//                     <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
//                   </svg>
//                 </button>
//               </div>
//             </div>
//             <div className="p-6 max-h-[60vh] overflow-y-auto">
//               <div className="flex items-start gap-3 mb-4">
//                 <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
//                   <svg
//                     width="16"
//                     height="16"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="#D97706"
//                     strokeWidth="2"
//                   >
//                     <path d="M20 12H4M12 4v16" />
//                   </svg>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-amber-700">
//                     Client's Revision Feedback
//                   </p>
//                   <p className="text-xs text-gray-500 mt-0.5">
//                     Please review the comments below and update your work
//                     accordingly
//                   </p>
//                 </div>
//               </div>

//               <div className="bg-amber-50 p-5 rounded-xl border border-amber-200">
//                 <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
//                   {fullProjectRevisionText}
//                 </p>
//               </div>

//               <div className="mt-6 flex gap-3">
//                 <button
//                   onClick={() => setShowFullProjectRevisionModal(false)}
//                   className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-white font-medium bg-gray-500 hover:bg-gray-600 transition"
//                 >
//                   Close
//                 </button>
//                 <button
//                   onClick={() => {
//                     setShowFullProjectRevisionModal(false);
//                     const contractWithRevision = currentContracts.find((c) =>
//                       hasRevisionFeedback(c),
//                     );
//                     if (contractWithRevision) {
//                       setSelectedContract(contractWithRevision);
//                       setSelectedStatus("completed");
//                       setShowEditCard(true);
//                     }
//                   }}
//                   className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#51218F] to-[#2a0e4a] text-white font-medium hover:opacity-90 transition"
//                 >
//                   Resubmit Work
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* REVISION NOTIFICATION MODAL (legacy) */}
//       {showRevisionModal && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
//           <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
//             <div className="bg-gradient-to-r from-[#51218F] to-[#2a0e4a] px-6 py-5">
//               <div className="flex items-start justify-between">
//                 <div className="flex items-center gap-3">
//                   <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
//                     <svg
//                       width="22"
//                       height="22"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       stroke="white"
//                       strokeWidth="2"
//                     >
//                       <path d="M12 8v4m0 4h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
//                     </svg>
//                   </div>
//                   <div>
//                     <h3 className="text-xl font-bold text-white">
//                       Revision Required
//                     </h3>
//                     <p className="text-white/70 text-sm mt-0.5">
//                       Please review and update your work
//                     </p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => setShowRevisionModal(false)}
//                   className="text-white/70 hover:text-white"
//                 >
//                   <svg
//                     width="24"
//                     height="24"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                   >
//                     <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
//                   </svg>
//                 </button>
//               </div>
//             </div>
//             <div className="p-6">
//               <div className="flex items-start gap-3 mb-4">
//                 <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
//                   <svg
//                     width="16"
//                     height="16"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="#D97706"
//                     strokeWidth="2"
//                   >
//                     <path d="M20 12H4M12 4v16" />
//                   </svg>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-amber-700">
//                     Client requested changes
//                   </p>
//                   <p className="text-xs text-gray-500 mt-0.5">
//                     Please address the following feedback
//                   </p>
//                 </div>
//               </div>
//               <div className="bg-amber-50 p-5 rounded-xl max-h-80 overflow-y-auto border border-amber-200">
//                 <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
//                   {revisionText || "No revision details provided."}
//                 </p>
//               </div>
//               <div className="mt-6">
//                 <button
//                   onClick={() => setShowRevisionModal(false)}
//                   className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#51218F] to-[#2a0e4a] text-white font-medium hover:opacity-90"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <style>{`
//         @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
//         .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
//         .scrollbar-hide::-webkit-scrollbar { display: none; }
//         .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
//       `}</style>
//     </div>
//   );
// };

// export default Allcontacts;

// frontend_user/src/pages/MyWork/Allcontacts.jsx
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import api from "../../utils/axiosConfig";
import ColHeader from "../../component/ColHeader";
import heroBg from "../../assets/MyWork/hero-bg.png";
import Footer from "../../component/Footer";
import toast from "../../component/Toast";
import { useState, useEffect, useRef } from "react";

const Allcontacts = () => {
  const [activeSubTab, setActiveSubTab] = useState("submitted");
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [showEditCard, setShowEditCard] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showMilestoneDetailsModal, setShowMilestoneDetailsModal] = useState(false);
  const [selectedContractForMilestones, setSelectedContractForMilestones] = useState(null);
  const [loading, setLoading] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [allContracts, setAllContracts] = useState([]);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [workDescription, setWorkDescription] = useState("");
  const [externalFileLink, setExternalFileLink] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [expandedMilestones, setExpandedMilestones] = useState({});
  const statusDropdownRef = useRef(null);
  const contentContainerRef = useRef(null);
  const popupRef = useRef(null);
  const modalRef = useRef(null);
  const [statusReason, setStatusReason] = useState("");

  // Pagination states
  const [proposalsPage, setProposalsPage] = useState(1);
  const [invitationsPage, setInvitationsPage] = useState(1);
  const [currentContractsPage, setCurrentContractsPage] = useState(1);
  const [completedContractsPage, setCompletedContractsPage] = useState(1);
  const itemsPerPage = 5;

  const [pageLoading, setPageLoading] = useState(true);
  // Review modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [selectedReviewContract, setSelectedReviewContract] = useState(null);

  // Revision modal states
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionText, setRevisionText] = useState("");

  // Full project revision modal states
  const [showFullProjectRevisionModal, setShowFullProjectRevisionModal] = useState(false);
  const [fullProjectRevisionText, setFullProjectRevisionText] = useState("");

  // Track reviewed contracts
  const [reviewedContracts, setReviewedContracts] = useState(new Set());

  const { userData } = useUser();
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const MAX_FILE_SIZE = 25 * 1024 * 1024;

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "awaiting", label: "Awaiting" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  // ---------- Styling constants ----------
  const tableHeaderClass =
    "bg-gradient-to-r from-[#51218F] to-[#2a0e4a] text-white text-[12px] font-semibold uppercase tracking-wide";
  const inputClasses =
    "w-full rounded-lg px-3 py-2.5 text-sm bg-white transition";
  const textareaClasses =
    "w-full rounded-lg px-3 py-2.5 text-sm resize-none bg-white transition";
  const selectTriggerClasses =
    "w-full flex items-center justify-between bg-white rounded-lg px-3 py-2.5 text-sm transition";
  const labelClasses = "block text-xs font-semibold text-gray-700 mb-1.5";
  const btnPrimary =
    "px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all duration-200 bg-gradient-to-r from-[#51218F] to-[#2a0e4a] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed";
  const btnDanger =
    "px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all duration-200 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed";
  const btnOutline =
    "px-4 py-2 rounded-lg border border-[#51218F] text-[#51218F] bg-white text-sm font-semibold hover:bg-purple-50 transition-all duration-200";
  const badgeBase =
    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold";

  // Helper to add bottom border except last row (ensured visible)
  const rowBorderClass = (isLast) => (isLast ? "" : "border-b border-gray-200");

  // ---------- Helper functions ----------
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutsidePopup = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowEditCard(false);
        setShowMilestoneModal(false);
        setSelectedFiles([]);
        setWorkDescription("");
        setSelectedStatus("");
        setStatusReason("");
        setSelectedMilestone(null);
        setIsStatusDropdownOpen(false);
      }
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowMilestoneDetailsModal(false);
        setSelectedContractForMilestones(null);
      }
    };
    if (showEditCard || showMilestoneModal || showMilestoneDetailsModal) {
      document.addEventListener("mousedown", handleClickOutsidePopup);
    }
    return () => document.removeEventListener("mousedown", handleClickOutsidePopup);
  }, [showEditCard, showMilestoneModal, showMilestoneDetailsModal]);

  useEffect(() => {
    const isAnyPopupOpen =
      showEditCard ||
      showMilestoneModal ||
      showMilestoneDetailsModal ||
      showFullProjectRevisionModal ||
      showReviewModal ||
      showRevisionModal;
    if (isAnyPopupOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
      }
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
    };
  }, [
    showEditCard,
    showMilestoneModal,
    showMilestoneDetailsModal,
    showFullProjectRevisionModal,
    showReviewModal,
    showRevisionModal,
  ]);

  const getSelectedStatusLabel = () => {
    const found = statusOptions.find((opt) => opt.value === selectedStatus);
    return found ? found.label : "Select Status";
  };

  const handleRejectInvitation = async (invitationId) => {
    if (!invitationId) {
      toast.error("No invitation ID found");
      return;
    }
    try {
      setLoading(true);
      await api.put("/invitations/update-status", null, {
        params: { invitation_id: invitationId, status: "rejected" },
      });
      toast.success("Invitation rejected");
      setInvitations((prev) =>
        prev.map((inv) =>
          inv.id === invitationId ? { ...inv, status: "rejected" } : inv
        )
      );
      setSelectedInvitation((prev) =>
        prev?.id === invitationId ? { ...prev, status: "rejected" } : prev
      );
      await fetchInvitations();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to reject invitation");
    } finally {
      setLoading(false);
    }
  };

  const hasRevisionFeedback = (contract) =>
    contract?.status?.toLowerCase() === "in_progress" &&
    contract?.revision_description &&
    contract.revision_description.trim() !== "";

  const handleViewRevision = (contract) => {
    setFullProjectRevisionText(contract.revision_description || "No revision details provided.");
    setShowFullProjectRevisionModal(true);
  };

  const hasMilestoneRevision = (contract) => {
    if (!contract.milestones_data || contract.milestones_data.length === 0) return false;
    return contract.milestones_data.some((m) => m.status === "revision_requested");
  };

  const getMilestoneRevisionCount = (contract) => {
    if (!contract.milestones_data) return 0;
    return contract.milestones_data.filter((m) => m.status === "revision_requested").length;
  };

  const getContractStatusDisplay = (contract) => {
    if (hasRevisionFeedback(contract))
      return { text: "Revision Needed", color: "bg-orange-500", icon: "↻" };
    if (hasMilestoneRevision(contract)) {
      const count = getMilestoneRevisionCount(contract);
      return {
        text: `${count} Milestone${count > 1 ? "s" : ""} Need Revision`,
        color: "bg-orange-500",
        icon: "↻",
      };
    }
    const status = contract.status?.toLowerCase();
    if (status === "in_review") return { text: "In Review", color: "bg-amber-500", icon: "⏳" };
    if (status === "in_progress") return { text: "In Progress", color: "bg-blue-500", icon: "▶" };
    if (status === "awaiting") return { text: "Awaiting", color: "bg-yellow-500", icon: "⏰" };
    if (status === "completed") return { text: "Completed", color: "bg-emerald-600", icon: "✓" };
    if (status === "cancelled") return { text: "Cancelled", color: "bg-red-500", icon: "✗" };
    return { text: "Pending", color: "bg-[#51218F]", icon: "○" };
  };

  const isContractInReview = (contract) => contract?.status?.toLowerCase() === "in_review";
  const hasMilestones = (contract) => contract.milestones_data && contract.milestones_data.length > 0;

  // API calls
  const fetchProposals = async () => {
    if (!userData?.id) return;
    try {
      setLoading(true);
      const response = await api.get(`proposals/GetMyProposals/${userData.id}`);
      if (response.data?.proposals) setProposals(response.data.proposals);
    } catch (error) {
      console.error("Error fetching proposals:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateContractStatus = async (contractId, newStatus, reason = null) => {
    if (!contractId) {
      toast.error("No contract ID found");
      return false;
    }
    if (!userData?.id) {
      toast.error("User not found");
      return false;
    }
    if (!newStatus) {
      toast.error("Please select a status");
      return false;
    }
    try {
      const params = { user_id: userData.id, status: newStatus };
      if (reason && reason.trim()) params.status_reason = reason.trim();
      await api.put(`/contracts/${contractId}/status`, null, { params });
      toast.success(`Contract status updated to ${newStatus}`);
      await fetchAllContracts();
      return true;
    } catch (error) {
      console.error("Error updating contract status:", error);
      toast.error(error.response?.data?.detail || "Failed to update contract status");
      return false;
    }
  };

  const handleSubmitMilestoneWork = async () => {
    if (!selectedContract || !selectedMilestone) return;
    if (!workDescription.trim() && selectedFiles.length === 0 && !externalFileLink.trim()) {
      toast.error("Please add work description or attachments");
      return;
    }
    setLoading(true);
    const loadingToast = toast.loading("Submitting milestone work...");
    try {
      const formData = new FormData();
      formData.append("description", workDescription.trim() || "Work submission");
      if (externalFileLink.trim()) formData.append("external_link", externalFileLink);
      if (selectedFiles.length > 0) formData.append("attachment", selectedFiles[0]);
      const response = await api.post(
        `/contracts/${selectedContract.id}/milestones/${selectedMilestone.id}/submit-work`,
        formData,
        {
          params: { user_id: userData.id },
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 300000,
        }
      );
      if (response.data.success) {
        toast.dismiss(loadingToast);
        toast.success(
          `Milestone "${selectedMilestone.description}" work ${selectedMilestone.status === "revision_requested" ? "resubmitted" : "submitted"
          }!`
        );
        setShowMilestoneModal(false);
        setSelectedMilestone(null);
        setWorkDescription("");
        setExternalFileLink("");
        setSelectedFiles([]);
        await fetchAllContracts();
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.detail || "Failed to submit milestone work");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitClick = async () => {
    if (!selectedContract) return;
    if (selectedStatus === "completed") {
      if (!workDescription.trim()) {
        toast.error("Work Description is required");
        return;
      }
      const oversizedFile = selectedFiles.find((f) => f.size > MAX_FILE_SIZE);
      if (oversizedFile) {
        toast.error(`${oversizedFile.name} exceeds 25MB.`);
        return;
      }
      if (selectedFiles.length === 0 && !externalFileLink.trim()) {
        toast.error("Please upload a file or provide an external file link");
        return;
      }
      await handleSubmitWork(selectedContract.id);
    } else if (selectedStatus && selectedStatus !== selectedContract.status) {
      if (["pending", "cancelled", "awaiting"].includes(selectedStatus)) {
        if (!statusReason.trim()) {
          toast.error(`Please provide a reason for ${selectedStatus} status`);
          return;
        }
      }
      const success = await updateContractStatus(selectedContract.id, selectedStatus, statusReason);
      if (success) {
        setShowEditCard(false);
        setSelectedContract(null);
        setSelectedFiles([]);
        setWorkDescription("");
        setExternalFileLink("");
        setSelectedStatus("");
        setStatusReason("");
      }
    } else {
      toast.info("No changes to submit");
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  useEffect(() => {
    setTimeout(() => scrollToTop(), 100);
  }, [activeSubTab]);

  const handleSubmitWork = async (contractId) => {
    if (!contractId) {
      toast.error("No contract ID found");
      return;
    }
    if (!selectedFiles.length && !externalFileLink.trim()) {
      toast.error("Please upload a file or provide an external file link");
      return;
    }
    if (!userData?.id) {
      toast.error("User not found");
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("description", workDescription.trim() || "Work submission");
      if (externalFileLink.trim()) formData.append("external_file_link", externalFileLink);
      if (selectedFiles.length > 0) formData.append("attachment", selectedFiles[0]);
      await api.post(`/contracts/${contractId}/submit-work`, formData, {
        params: { user_id: userData.id },
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 300000,
      });
      toast.success("Work submitted successfully!");
      setShowEditCard(false);
      setSelectedContract(null);
      setSelectedFiles([]);
      setWorkDescription("");
      setExternalFileLink("");
      setSelectedStatus("");
      setStatusReason("");
      await fetchAllContracts();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to submit work");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelection = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    files.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) toast.error(`${file.name} exceeds 25MB.`);
      else validFiles.push(file);
    });
    if (validFiles.length > 0) setSelectedFiles((prev) => [...prev, ...validFiles]);
    e.target.value = "";
  };

  const removeSelectedFile = (indexToRemove) =>
    setSelectedFiles((prev) => prev.filter((_, i) => i !== indexToRemove));

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items?.length > 0) setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    const files = Array.from(e.dataTransfer.files);
    const validFiles = [];
    files.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) toast.error(`${file.name} exceeds 25MB.`);
      else validFiles.push(file);
    });
    if (validFiles.length > 0) setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const fetchInvitations = async () => {
    if (!userData?.id) return;
    try {
      const response = await api.get(`/invitations/list/${userData.id}`);
      if (response.data?.invitations) setInvitations(response.data.invitations);
    } catch (error) {
      console.error("Error fetching invitations:", error);
    }
  };

  const fetchInvitationDetails = async (invitationId) => {
    if (!userData?.id) return null;
    try {
      const response = await api.get(`/invitations/${invitationId}`, { params: { user_id: userData.id } });
      const data = response.data;
      const jobDetails = data.job_details || {};
      return {
        id: data.id,
        sender_id: data.sender_id,
        project_name: data.project_name || jobDetails.title || "Project",
        description: jobDetails.description || data.description || "No description available.",
        duration: jobDetails.duration || data.duration || "Not specified",
        client_name: data.client_name || data.sender_name || "Client",
        revenue: data.revenue,
        budget_from: jobDetails.budget_from || data.budget_from,
        budget_to: jobDetails.budget_to || data.budget_to,
        status: data.status,
        created_at: data.created_at,
        date: data.date,
        skills: jobDetails.skills || data.receiver_skills || [],
        job_id: data.job_id || jobDetails.id,
      };
    } catch (error) {
      toast.error("Failed to load invitation details");
      return null;
    }
  };

  const fetchAllContracts = async () => {
    if (!userData?.id) return [];
    try {
      const response = await api.get("/contracts/collaborator-contracts");
      const contracts = Array.isArray(response.data) ? response.data : [];
      setAllContracts(contracts);
      return contracts;
    } catch (error) {
      console.error("Error fetching all contracts:", error);
      return [];
    }
  };

  const fetchReviewedContracts = async () => {
    if (!userData?.id) return;
    try {
      const response = await api.get(`/reviews/given/${userData.id}`);
      const reviews = response.data?.reviews || [];
      const reviewedContractIds = new Set(reviews.filter((r) => r.contract_id).map((r) => r.contract_id));
      setReviewedContracts(reviewedContractIds);
    } catch (error) {
      console.error("Error fetching given reviews:", error);
    }
  };

  useEffect(() => {
    if (!userData?.id) return;

    const loadPageData = async () => {
      try {
        setPageLoading(true);

        await Promise.all([
          fetchProposals(),
          fetchInvitations(),
          fetchAllContracts(),
          fetchReviewedContracts(),
        ]);
      } catch (error) {
        console.error("Error loading page data:", error);
      } finally {
        setPageLoading(false);
      }
    };

    loadPageData();
  }, [userData?.id]);

  const getContractsByStatus = (status) =>
    allContracts.filter((contract) => {
      const s = contract.status?.toLowerCase();
      if (status === "current")
        return ["active", "in_progress", "pending", "awaiting", "in_review"].includes(s);
      if (status === "completed") return s === "completed";
      return false;
    });

  const currentContracts = getContractsByStatus("current");
  const completedContracts = getContractsByStatus("completed");

  const getPaginatedData = (data, page) => {
    const startIndex = (page - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };
  const getTotalPages = (dataLength) => Math.ceil(dataLength / itemsPerPage);

  const renderPagination = (currentPage, totalPages, onPageChange) => {
    if (totalPages <= 1) return null;
    const handlePageChange = (newPage) => {
      onPageChange(newPage);
      setTimeout(() => {
        if (contentContainerRef.current) {
          const yOffset = 80;
          const element = contentContainerRef.current;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - yOffset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 150);
    };
    return (
      <div className="flex justify-center items-center gap-2 py-4 border-t border-gray-200">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${currentPage === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-[#51218F] to-[#2a0e4a] text-white hover:opacity-90"
            }`}
        >
          Previous
        </button>
        <span className="px-3 py-1.5 text-sm text-gray-600 font-medium">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${currentPage === totalPages
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-[#51218F] to-[#2a0e4a] text-white hover:opacity-90"
            }`}
        >
          Next
        </button>
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = String(date.getFullYear()).slice(-2);
      return `${day}-${month}-${year}`;
    } catch {
      return "—";
    }
  };

  const getStatusColor = (status) => {
    if (!status) return "bg-[#51218F]";
    const s = status.toLowerCase();
    if (s === "accepted") return "bg-emerald-600";
    if (["under review", "under_review", "pending", "submitted"].includes(s)) return "bg-[#51218F]";
    if (s === "in_review") return "bg-amber-500";
    if (["declined", "rejected"].includes(s)) return "bg-red-500";
    if (s === "completed") return "bg-emerald-600";
    if (["active", "in_progress"].includes(s)) return "bg-blue-500";
    if (s === "awaiting") return "bg-yellow-500";
    if (s === "cancelled") return "bg-red-500";
    if (s === "revision_requested") return "bg-orange-500";
    return "bg-[#51218F]";
  };

  const getStatusText = (status) => {
    if (!status) return "Pending";
    const s = status.toLowerCase();
    if (s === "in_progress" || s === "active") return "In Progress";
    if (s === "under_review" || s === "submitted") return "Pending";
    if (s === "in_review") return "In Review";
    if (s === "awaiting") return "Awaiting";
    if (s === "cancelled") return "Cancelled";
    if (s === "revision_requested") return "Revision Needed";
    if (s === "accepted") return "Accepted";
    if (s === "declined" || s === "rejected") return "Rejected";
    if (s === "completed") return "Completed";
    return status;
  };

  const getMilestoneStatusIcon = (status) => {
    const base = "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0";
    switch (status) {
      case "paid":
        return <span className={`${base} bg-emerald-100 text-emerald-600`}>✓</span>;
      case "submitted":
        return <span className={`${base} bg-amber-100 text-amber-600`}>⏳</span>;
      case "in_progress":
        return <span className={`${base} bg-blue-100 text-blue-600`}>▶</span>;
      case "revision_requested":
        return <span className={`${base} bg-orange-100 text-orange-600`}>↻</span>;
      default:
        return <span className={`${base} bg-gray-100 text-gray-400`}>○</span>;
    }
  };

  const MilestoneDetailsModal = () => {
    if (!showMilestoneDetailsModal || !selectedContractForMilestones) return null;
    const contract = selectedContractForMilestones;
    const milestones = contract.milestones_data || [];
    const totalAmount = milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
    const paidAmount = milestones
      .filter((m) => m.status === "paid")
      .reduce((sum, m) => sum + (m.amount || 0), 0);
    const currentMilestoneIndex = contract.current_milestone || 0;

    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div
          ref={modalRef}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide"
        >
          <div className="sticky top-0 z-10 bg-gradient-to-r from-[#51218F] to-[#2a0e4a] px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">Milestone Progress</h3>
                <p className="text-purple-200 text-sm mt-0.5">{contract.job_title}</p>
              </div>
              <button
                onClick={() => {
                  setShowMilestoneDetailsModal(false);
                  setSelectedContractForMilestones(null);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition text-lg"
              >
                ×
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 p-5 bg-gray-50 border-b border-gray-200">
            {[
              { label: "Total Budget", value: `₹${totalAmount}`, color: "text-[#51218F]" },
              { label: "Paid Amount", value: `₹${paidAmount}`, color: "text-emerald-600" },
              {
                label: "Completed",
                value: `${milestones.filter((m) => m.status === "paid").length}/${milestones.length}`,
                color: "text-blue-600",
              },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="p-5 space-y-3">
            {milestones.map((milestone, idx) => {
              const isActive = idx === currentMilestoneIndex;
              const isPaid = milestone.status === "paid";
              const isSubmitted = milestone.status === "submitted";
              const isInProgress = milestone.status === "in_progress";
              const isRevision = milestone.status === "revision_requested";
              return (
                <div
                  key={idx}
                  className={`relative rounded-xl border-2 transition-all ${isActive
                    ? "border-purple-300 bg-purple-50/30 shadow-sm"
                    : isPaid
                      ? "border-emerald-200 bg-emerald-50/30"
                      : isSubmitted
                        ? "border-amber-200 bg-amber-50/30"
                        : isRevision
                          ? "border-orange-200 bg-orange-50/30"
                          : "border-gray-200 bg-white"
                    }`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {getMilestoneStatusIcon(milestone.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between flex-wrap gap-2">
                          <div>
                            <h4 className="font-semibold text-gray-800 text-sm">
                              Milestone {idx + 1}: {milestone.description}
                            </h4>
                            <div className="flex gap-3 text-xs text-gray-500 mt-1">
                              <span>
                                Amount:{" "}
                                <span className="font-semibold text-[#51218F]">₹{milestone.amount}</span>
                              </span>
                              {milestone.due_date && <span>Due: {milestone.due_date}</span>}
                            </div>
                          </div>
                          <span className={`${badgeBase} text-white ${getStatusColor(milestone.status)}`}>
                            {isPaid
                              ? "✓ Paid"
                              : isSubmitted
                                ? "Under Review"
                                : isInProgress
                                  ? "In Progress"
                                  : isRevision
                                    ? "Revision Needed"
                                    : "Pending"}
                          </span>
                        </div>

                        {isSubmitted && milestone.submission && (
                          <div className="mt-3 p-3 bg-white rounded-lg border border-amber-100">
                            <p className="text-xs font-semibold text-gray-700 mb-1">Submitted Work:</p>
                            {milestone.submission.description && (
                              <p className="text-xs text-gray-600">{milestone.submission.description}</p>
                            )}
                            {milestone.submission.external_link && (
                              <a
                                href={milestone.submission.external_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#51218F] text-xs underline mt-1 inline-block"
                              >
                                View External Link →
                              </a>
                            )}
                            {milestone.submission.attachment && (
                              <button
                                onClick={async () => {
                                  try {
                                    const response = await api.get(
                                      `/contracts/${contract.id}/milestones/${idx}/download-attachment`,
                                      { params: { user_id: userData.id }, responseType: "blob" }
                                    );
                                    const url = window.URL.createObjectURL(new Blob([response.data]));
                                    const a = document.createElement("a");
                                    a.href = url;
                                    a.download =
                                      milestone.submission.attachment_name || `milestone_${idx + 1}_work`;
                                    document.body.appendChild(a);
                                    a.click();
                                    setTimeout(() => {
                                      window.URL.revokeObjectURL(url);
                                      document.body.removeChild(a);
                                    }, 100);
                                  } catch {
                                    toast.error("Download failed");
                                  }
                                }}
                                className="text-blue-600 text-xs underline mt-1 inline-flex items-center gap-1"
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                  />
                                </svg>
                                Download Attachment
                              </button>
                            )}
                            {milestone.submission.submitted_at && (
                              <p className="text-[10px] text-gray-400 mt-1">
                                Submitted: {new Date(milestone.submission.submitted_at).toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}

                        {isRevision && milestone.review && (
                          <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <p className="text-xs font-semibold text-orange-700">Revision Requested:</p>
                            <p className="text-xs text-orange-600 mt-1">
                              {milestone.review.comments || "No additional comments"}
                            </p>
                          </div>
                        )}

                        {isPaid && milestone.payment && (
                          <p className="mt-2 text-xs text-emerald-600 font-medium">
                            Paid on: {new Date(milestone.payment.paid_at).toLocaleDateString()}
                          </p>
                        )}

                        {(isInProgress || isRevision) && isActive && (
                          <button
                            onClick={() => {
                              setShowMilestoneDetailsModal(false);
                              setSelectedContract(contract);
                              setSelectedMilestone({ id: idx, ...milestone });
                              setShowMilestoneModal(true);
                              setWorkDescription("");
                              setExternalFileLink("");
                              setSelectedFiles([]);
                            }}
                            className={`mt-3 px-4 py-1.5 rounded-full text-white text-xs font-semibold transition ${isRevision ? "bg-orange-500 hover:bg-orange-600" : "bg-[#51218F] hover:bg-purple-800"
                              }`}
                          >
                            {isRevision ? "↻ Resubmit Work" : "📤 Submit Work"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="sticky bottom-0 px-5 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button
              onClick={() => {
                setShowMilestoneDetailsModal(false);
                setSelectedContractForMilestones(null);
              }}
              className={btnDanger}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleAcceptInvitation = async (invitationId) => {
    if (!invitationId) {
      toast.error("No invitation ID found");
      return;
    }
    try {
      setLoading(true);
      await api.put("/invitations/update-status", null, {
        params: { invitation_id: invitationId, status: "accepted" },
      });
      toast.success("Invitation accepted successfully!");
      setInvitations((prev) =>
        prev.map((inv) => (inv.id === invitationId ? { ...inv, status: "accepted" } : inv))
      );
      setSelectedInvitation(null);
      await fetchInvitations();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to accept invitation");
    } finally {
      setLoading(false);
    }
  };

  const getClientName = (contract) =>
    contract?.creator?.full_name ||
    contract?.creator?.name ||
    contract?.creator?.email?.split("@")[0] ||
    "Client";
  const getClientInitial = (contract) => getClientName(contract)?.charAt(0)?.toUpperCase() || "C";
  const getClientNameFromProposal = (proposal) => proposal?.client_name || "Client";
  const getProjectNameFromProposal = (proposal) => proposal.job_title || "Project";
  const getRevenue = (amount) => (amount !== undefined && amount !== null ? `₹${amount}` : "₹0");
  const getSenderId = (invitation) => invitation.sender_id || invitation.sender?.id || invitation.client_id;

  const handleMessageClick = (receiverId, userName, jobId = null, projectName = null) => {
    if (!receiverId) {
      toast.error("Unable to start conversation");
      return;
    }
    localStorage.setItem("currentReceiverId", receiverId);
    localStorage.setItem("currentReceiverName", userName || "User");
    if (jobId) {
      localStorage.setItem("currentJobId", jobId);
      localStorage.setItem("currentJobTitle", projectName || "");
    }
    navigate(`/message?user=${receiverId}`, { state: { receiverId, userName, senderId: userData.id } });
  };

  const handleReviewProposal = (proposal) => {
    const jobId = proposal.job_id;
    if (!jobId) {
      toast.error("Cannot review this proposal");
      return;
    }
    navigate("/proposal", {
      state: { jobId, proposalId: proposal.id, fromProposal: true, proposal },
    });
  };

  const getContractRevenue = (contract) => (contract?.budget !== undefined ? `₹${contract.budget}` : "₹0");
  const getInvitationRevenue = (invitation) => (invitation?.revenue ? `₹${invitation.revenue}` : "₹0");
  const getDisplayRevenue = (invitation) => {
    if (invitation?.revenue) return `₹${invitation.revenue}`;
    if (invitation?.budget_from && invitation?.budget_to)
      return `₹${invitation.budget_from} – ₹${invitation.budget_to}`;
    return "₹0";
  };

  const handleReviewClick = (contract) => {
    setSelectedReviewContract(contract);
    setReviewRating(5);
    setReviewComment("");
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedReviewContract?.creator?.id) {
      toast.error("Cannot review: client information missing");
      return;
    }
    setReviewSubmitting(true);
    try {
      await api.post("/reviews/create", null, {
        params: {
          reviewer_id: userData.id,
          recipient_id: selectedReviewContract.creator.id,
          contract_id: selectedReviewContract.id,
          rating: reviewRating,
          comment: reviewComment,
        },
      });
      toast.success("Review submitted!");
      setShowReviewModal(false);
      await fetchAllContracts();
      await fetchReviewedContracts();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to submit review");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const proposalCount = proposals.length;
  const invitationCount = invitations.length;
  const currentCount = currentContracts.length;
  const completedCount = completedContracts.length;

  const paginatedProposals = getPaginatedData(proposals, proposalsPage);
  const paginatedInvitations = getPaginatedData(invitations, invitationsPage);
  const paginatedCurrentContracts = getPaginatedData(currentContracts, currentContractsPage);
  const paginatedCompletedContracts = getPaginatedData(completedContracts, completedContractsPage);

  const CreatorAvatar = ({ contract, size = "w-10 h-10" }) => {
    const [imgError, setImgError] = useState(false);
    const picUrl = contract?.creator?.profile_picture;
    const initial = getClientInitial(contract);
    if (picUrl && !imgError) {
      return (
        <img
          src={picUrl}
          alt="Client profile"
          className={`${size} rounded-full object-cover border-2 border-purple-200`}
          onError={() => setImgError(true)}
        />
      );
    }
    return (
      <div
        className={`${size} rounded-full bg-purple-100 border-2 border-purple-200 flex items-center justify-center text-[#51218F] font-bold text-sm`}
      >
        {initial}
      </div>
    );
  };

  const TableWrapper = ({ children }) => (
    <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(81,33,143,0.10)] overflow-hidden border border-purple-100">
      {children}
    </div>
  );

  const EmptyState = ({ message }) => (
    <div className="py-14 text-center">
      <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-3">
        <svg className="w-7 h-7 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6M5 8h14M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
        </svg>
      </div>
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );

  const FileDropZone = ({ inputId }) => (
    <div
      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${isDragging
        ? "border-[#51218F] bg-purple-50"
        : "border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-50/30"
        }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => document.getElementById(inputId).click()}
    >
      <input id={inputId} type="file" multiple className="hidden" onChange={handleFileSelection} />
      <svg className="w-7 h-7 mx-auto text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>
      <p className="text-xs text-gray-500">
        <span className="text-[#51218F] font-semibold">Click to upload</span> or drag and drop
      </p>
      <p className="text-[10px] text-gray-400 mt-0.5">Max file size: 25MB</p>
    </div>
  );

  const FileList = () =>
    selectedFiles.length > 0 ? (
      <div className="mt-2 space-y-1.5 max-h-28 overflow-y-auto">
        {selectedFiles.map((file, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded-lg border border-gray-200 bg-gray-50">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs text-gray-700 truncate flex-1">{file.name}</span>
              <span className="text-[10px] text-gray-400 flex-shrink-0">
                ({(file.size / (1024 * 1024)).toFixed(1)} MB)
              </span>
            </div>
            <button onClick={() => removeSelectedFile(index)} className="ml-2 text-red-400 hover:text-red-600 flex-shrink-0">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    ) : null;

  const tabs = [
    { key: "submitted", label: "Submitted Proposals", count: proposalCount },
    { key: "invitation", label: "Job Invitations", count: invitationCount },
    { key: "current", label: "Current Contracts", count: currentCount },
    { key: "completed", label: "Completed Contracts", count: completedCount },
  ];

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-purple-200 border-t-[#51218F] rounded-full animate-spin" />
          <p className="text-[#51218F] font-medium">
            Loading contracts...
          </p>
        </div>
      </div>
    );
  }

  // ---------- Main render ----------
  return (
    <div className="w-full min-h-screen flex flex-col overflow-x-hidden" style={{ background: "linear-gradient(180deg, #b8b2c4 100%, #0a0515 100%)" }}>
      {/* GLOBAL STYLES */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        /* Ensure bottom borders are visible */
        .border-b { border-bottom-width: 1px; border-bottom-style: solid; border-bottom-color: #e5e7eb; }
      `}</style>

      <div className="absolute top-0 left-0 w-full z-50">
        <ColHeader />
      </div>

      {/* Hero Section */}
      <section
        className="relative w-full h-[350px] md:h-[420px] flex-shrink-0"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-white/1" />
        <div className="relative z-10 px-6 md:px-12 pt-[90px] text-white">
          <div className="flex justify-between items-center mt-16 sm:mt-12 md:mt-16 mb-8 md:mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-white hover:text-white/80 transition-colors group"
            >
              <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-[#51218F] to-[#2a0e4a] group-hover:from-[#3d1768] group-hover:to-[#1a0830] transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </div>
              <span className="font-medium text-sm sm:text-base">Back</span>
            </button>
            <h1 className="text-xl sm:text-[24px] md:text-[28px] font-semibold">All contracts</h1>
          </div>

          {/* Tabs */}
          <div className="relative mt-4 sm:mt-6 md:mt-8">
            <div className="block md:hidden">
              <div className="bg-[#4A2A68] rounded-md">
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="flex gap-1.5 p-1.5 min-w-max">
                    {tabs.map((tab) => {
                      const isActive = activeSubTab === tab.key;
                      return (
                        <button
                          key={tab.key}
                          onClick={() => setActiveSubTab(tab.key)}
                          className={`relative px-3 py-1.5 rounded-lg transition-all duration-200 ${isActive ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/5"
                            }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className={`font-medium whitespace-nowrap ${isActive ? "text-[12px]" : "text-[10px]"}`}>
                              {tab.label}
                            </span>
                            <span
                              className={`font-semibold whitespace-nowrap ${isActive ? "text-[11px] text-yellow-200" : "text-[9px] text-white/60"
                                }`}
                            >
                              ({tab.count})
                            </span>
                          </div>
                          {isActive && <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-white rounded-full" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-400/40" />
              <div className="flex overflow-x-auto no-scrollbar items-center justify-between md:justify-start lg:grid lg:grid-cols-4 gap-5 md:gap-6 lg:gap-0 pb-3 text-[13px] lg:text-[16px] font-semibold text-center">
                {tabs.map((tab) => (
                  <span
                    key={tab.key}
                    onClick={() => setActiveSubTab(tab.key)}
                    className={`cursor-pointer whitespace-nowrap transition-all duration-200 ${activeSubTab === tab.key ? "text-white font-semibold" : "text-white/60 font-medium hover:text-white/90"
                      }`}
                  >
                    <span className="relative inline-block pb-2 px-1">
                      {tab.label} ({tab.count.toString().padStart(2, "0")})
                      {activeSubTab === tab.key && (
                        <span className="absolute -left-1 md:-left-1.5 -right-1 md:-right-1.5 -bottom-[3px] h-[3.5px] bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                      )}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section ref={contentContainerRef} className="relative -mt-[60px] md:-mt-[85px] px-4 md:px-12 pb-16 flex-1">
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
          </div>
        )}

        {/* SUBMITTED PROPOSALS */}
        {activeSubTab === "submitted" && !loading && (
          <TableWrapper>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <div className="min-w-[800px]">
                <div className={`grid grid-cols-6 px-8 py-4 ${tableHeaderClass}`}>
                  {["Client Name", "Project Name", "Date", "Revenue", "Status", "Action"].map((h) => (
                    <span key={h} className="text-center">{h}</span>
                  ))}
                </div>
                <div className="border-t border-gray-300">
                  {paginatedProposals.map((proposal, i) => {
                    const isSubmitted = proposal.status?.toLowerCase() === "submitted";
                    const isLast = i === paginatedProposals.length - 1;
                    return (
                      <div key={proposal.id || i} className="hover:bg-purple-50/20 transition">
                        <div className={`grid grid-cols-6 px-8 py-4 text-[13px] text-gray-700 items-center text-center ${rowBorderClass(isLast)}`}>
                          <span className="truncate font-medium">{getClientNameFromProposal(proposal)}</span>
                          <span className="truncate">{getProjectNameFromProposal(proposal)}</span>
                          <span>{formatDate(proposal.created_at)}</span>
                          <span className="font-semibold text-emerald-600">{getRevenue(proposal.bid_amount)}</span>
                          <div className="flex justify-center">
                            <span className={`${badgeBase} text-white ${getStatusColor(proposal.status)}`}>
                              {getStatusText(proposal.status)}
                            </span>
                          </div>
                          <div className="flex justify-center">
                            {isSubmitted ? (
                              <button onClick={() => handleReviewProposal(proposal)} className={`${btnPrimary} !px-3 !py-1.5 !text-xs`}>
                                Review
                              </button>
                            ) : (
                              <span className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-400 text-xs font-medium cursor-not-allowed">
                                Disabled
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {paginatedProposals.length === 0 && <EmptyState message="No proposals found" />}
                </div>
              </div>
            </div>
            {/* Mobile */}
            <div className="block md:hidden">
              <div className={`grid grid-cols-4 ${tableHeaderClass} border-b border-purple-900/30`}>
                {["Client", "Project", "Date", "Action"].map((h) => (
                  <div key={h} className="px-2 py-3 text-center">{h}</div>
                ))}
              </div>
              <div>
                {paginatedProposals.map((proposal, i) => {
                  const isSubmitted = proposal.status?.toLowerCase() === "submitted";
                  const isLast = i === paginatedProposals.length - 1;
                  return (
                    <div key={proposal.id || i} className={`grid grid-cols-4 items-center hover:bg-purple-50/20 transition ${rowBorderClass(isLast)}`}>
                      <div className="px-2 py-3">
                        <p className="text-[11px] font-semibold text-gray-800 truncate">{getClientNameFromProposal(proposal)}</p>
                        <span className={`${badgeBase} text-white mt-1 ${getStatusColor(proposal.status)}`} style={{ fontSize: 9 }}>
                          {getStatusText(proposal.status)}
                        </span>
                      </div>
                      <div className="px-2 py-3">
                        <p className="text-[10px] text-gray-600 truncate">{getProjectNameFromProposal(proposal)}</p>
                        <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">{getRevenue(proposal.bid_amount)}</p>
                      </div>
                      <div className="px-2 py-3">
                        <p className="text-[10px] text-gray-500">{formatDate(proposal.created_at)}</p>
                      </div>
                      <div className="px-2 py-3 flex justify-center">
                        {isSubmitted ? (
                          <button onClick={() => handleReviewProposal(proposal)} className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#51218F] to-[#2a0e4a] text-white text-[9px] font-semibold">
                            Review
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-400 text-[9px] font-medium">N/A</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {paginatedProposals.length === 0 && <EmptyState message="No proposals found" />}
              </div>
            </div>
            {renderPagination(proposalsPage, getTotalPages(proposals.length), setProposalsPage)}
          </TableWrapper>
        )}

        {/* JOB INVITATIONS */}
        {activeSubTab === "invitation" && !loading && (
          <TableWrapper>
            {selectedInvitation ? (
              <div className="p-5 md:p-8">
                <button
                  onClick={() => {
                    setSelectedInvitation(null);
                    setExpandedDescription(false);
                    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
                  }}
                  className="flex items-center gap-2 text-gray-700 text-sm font-medium mb-5 hover:text-[#51218F] transition group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#51218F] to-[#2a0e4a] flex items-center justify-center group-hover:from-[#3d1768] group-hover:to-[#1a0830] transition-all">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                      <path d="M18 12H6M6 12L10 8M6 12L10 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  Back to Invitations
                </button>

                <div className="mb-5">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <h2 className="font-bold text-lg sm:text-xl md:text-2xl text-gray-800 flex-1">
                      {selectedInvitation.project_name || "Project Invitation"}
                    </h2>
                    <span className={`${badgeBase} text-white bg-[#51218F]`}>Fixed Rate</span>
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                      <p className="text-[10px] font-semibold text-purple-600 uppercase tracking-wide mb-1">Client</p>
                      <p className="text-sm font-semibold text-gray-800">{selectedInvitation.client_name || "Client"}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                      <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide mb-1">Budget</p>
                      <p className="text-sm font-bold text-emerald-600">{getDisplayRevenue(selectedInvitation)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Invited</p>
                      <p className="text-xs text-gray-700">{selectedInvitation.date || formatDate(selectedInvitation.created_at)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Duration</p>
                      <p className="text-xs text-gray-700 capitalize">{selectedInvitation.duration || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide">Status</p>
                      <p className="text-sm font-semibold text-gray-800 mt-0.5">{selectedInvitation.status || "Pending"}</p>
                    </div>
                    <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${selectedInvitation.status?.toLowerCase() === "accepted" ? "bg-emerald-500" : "bg-amber-400"}`} />
                  </div>
                </div>

                <div className="mb-5">
                  <h3 className="font-semibold text-sm text-gray-800 mb-2">Job Description</h3>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-wrap">
                      {selectedInvitation.description || "No description available."}
                    </p>
                  </div>
                </div>

                {selectedInvitation.skills?.length > 0 && (
                  <div className="mb-5">
                    <h4 className="font-semibold text-xs text-gray-700 mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedInvitation.skills.slice(0, 8).map((skill, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-purple-50 text-[#51218F] rounded-full text-[10px] font-semibold border border-purple-200">
                          {skill}
                        </span>
                      ))}
                      {selectedInvitation.skills.length > 8 && (
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-medium">
                          +{selectedInvitation.skills.length - 8} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 mt-6 pt-4 border-t border-gray-200 md:max-w-md md:mx-auto">
                  {selectedInvitation.status?.toLowerCase() === "pending" && (
                    <>
                      <button
                        onClick={() => handleAcceptInvitation(selectedInvitation.id)}
                        disabled={loading}
                        className={`w-full py-2.5 flex items-center justify-center gap-2 ${btnPrimary}`}
                      >
                        {loading ? "Processing..." : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Accept Invitation
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleRejectInvitation(selectedInvitation.id)}
                        disabled={loading}
                        className={`w-full py-2.5 flex items-center justify-center gap-2 ${btnDanger}`}
                      >
                        {loading ? "Processing..." : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reject Invitation
                          </>
                        )}
                      </button>
                    </>
                  )}
                  {selectedInvitation.status?.toLowerCase() === "accepted" && (
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-green-700 font-semibold">✓ You have accepted this invitation</p>
                    </div>
                  )}
                  {selectedInvitation.status?.toLowerCase() === "rejected" && (
                    <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-red-700 font-semibold">✗ Invitation Rejected</p>
                    </div>
                  )}
                  <button
                    onClick={() =>
                      handleMessageClick(
                        getSenderId(selectedInvitation),
                        selectedInvitation.client_name,
                        selectedInvitation.job_id,
                        selectedInvitation.project_name
                      )
                    }
                    className={`w-full py-2.5 flex items-center justify-center gap-2 ${btnOutline}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Message Client
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop Invitations - View Details always enabled */}
                <div className="hidden md:block overflow-x-auto">
                  <div className="min-w-[800px]">
                    <div className={`grid grid-cols-5 px-8 py-4 ${tableHeaderClass}`}>
                      {["Client Name", "Project Name", "Date", "Revenue", "Action"].map((h, i) => (
                        <span key={h} className={i < 2 ? "text-left" : "text-center"}>{h}</span>
                      ))}
                    </div>
                    <div className="border-t border-gray-300">
                      {paginatedInvitations.map((invitation, idx) => {
                        const isLast = idx === paginatedInvitations.length - 1;
                        return (
                          <div key={invitation.id} className={`grid grid-cols-5 px-8 py-4 text-[13px] text-gray-700 items-center hover:bg-purple-50/20 transition ${rowBorderClass(isLast)}`}>
                            <span className="text-left font-medium truncate pr-2">{invitation.client_name}</span>
                            <span className="text-left truncate pr-2">{invitation.project_name}</span>
                            <span className="text-center">{formatDate(invitation.date)}</span>
                            <span className="text-center font-semibold text-emerald-600">{getInvitationRevenue(invitation)}</span>
                            <div className="flex justify-center">
                              <button
                                onClick={async () => {
                                  const d = await fetchInvitationDetails(invitation.id);
                                  if (d) setSelectedInvitation(d);
                                }}
                                className={`${btnPrimary} !px-4 !py-1.5 !text-xs`}
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {paginatedInvitations.length === 0 && <EmptyState message="No invitations found" />}
                    </div>
                  </div>
                </div>
                {/* Mobile Invitations */}
                <div className="block md:hidden">
                  <div className={`grid grid-cols-5 ${tableHeaderClass} border-b border-purple-900/30`}>
                    <div className="px-2 py-3 text-left text-[10px] font-semibold">Client</div>
                    <div className="px-2 py-3 text-left text-[10px] font-semibold">Project</div>
                    <div className="px-2 py-3 text-left text-[10px] font-semibold">Date</div>
                    <div className="px-2 py-3 text-left text-[10px] font-semibold">Revenue</div>
                    <div className="px-2 py-3 text-center text-[10px] font-semibold">Action</div>
                  </div>
                  <div>
                    {paginatedInvitations.map((invitation, idx) => {
                      const isLast = idx === paginatedInvitations.length - 1;
                      return (
                        <div key={invitation.id} className={`grid grid-cols-5 items-center hover:bg-purple-50/20 transition ${rowBorderClass(isLast)}`}>
                          <div className="px-2 py-3">
                            <p className="text-[11px] font-semibold text-gray-800 truncate">{invitation.client_name || "—"}</p>
                          </div>
                          <div className="px-2 py-3">
                            <p className="text-[10px] text-gray-600 truncate">{invitation.project_name || "—"}</p>
                          </div>
                          <div className="px-2 py-3">
                            <p className="text-[10px] text-gray-500">{formatDate(invitation.date)}</p>
                          </div>
                          <div className="px-2 py-3">
                            <p className="text-[10px] font-semibold text-emerald-600">{getInvitationRevenue(invitation)}</p>
                          </div>
                          <div className="px-2 py-3 flex justify-center">
                            <button
                              onClick={async () => {
                                const d = await fetchInvitationDetails(invitation.id);
                                if (d) setSelectedInvitation(d);
                              }}
                              className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#51218F] to-[#2a0e4a] text-white text-[9px] font-semibold whitespace-nowrap"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {paginatedInvitations.length === 0 && <EmptyState message="No invitations found" />}
                  </div>
                </div>
                {renderPagination(invitationsPage, getTotalPages(invitations.length), setInvitationsPage)}
              </>
            )}
          </TableWrapper>
        )}

        {/* CURRENT CONTRACTS */}
        {activeSubTab === "current" && !loading && (
          <>
            <div className="hidden md:block">
              <TableWrapper>
                <div className="overflow-x-auto">
                  <div className="min-w-[960px]">
                    <div className={`grid grid-cols-12 gap-2 px-4 py-4 ${tableHeaderClass}`}>
                      <div className="col-span-3 text-left">Project & Client</div>
                      <div className="col-span-2 text-left">Timeline</div>
                      <div className="col-span-2 text-left">Budget</div>
                      <div className="col-span-2 text-left">Progress</div>
                      <div className="col-span-2 text-left">Status</div>
                      <div className="col-span-1 text-center">Action</div>
                    </div>
                    <div className="border-t border-gray-300">
                      {paginatedCurrentContracts.map((contract, idx) => {
                        const isLast = idx === paginatedCurrentContracts.length - 1;
                        const statusDisplay = getContractStatusDisplay(contract);
                        const hasRevision = hasRevisionFeedback(contract);
                        const hasMilestoneRevisionFlag = hasMilestoneRevision(contract);
                        const needsAction = (hasRevision || hasMilestoneRevisionFlag) && !isContractInReview(contract);
                        const isInReview = isContractInReview(contract);
                        const isMilestoneContract = hasMilestones(contract);
                        return (
                          <div key={contract.id} className={`hover:bg-purple-50/20 transition ${rowBorderClass(isLast)}`}>
                            <div className="grid grid-cols-12 gap-2 px-4 py-3 items-center">
                              <div className="col-span-3 flex items-center gap-2">
                                <CreatorAvatar contract={contract} size="w-8 h-8" />
                                <div className="min-w-0">
                                  <p className="font-semibold text-gray-800 truncate text-[13px]">
                                    {contract.job_title?.length > 28 ? contract.job_title.substring(0, 28) + "…" : contract.job_title}
                                  </p>
                                  <p className="text-[11px] text-gray-500 truncate">with {getClientName(contract)}</p>
                                </div>
                              </div>
                              <div className="col-span-2 text-[12px] text-gray-600">
                                {contract.start_date ? formatDate(contract.start_date) : "—"}
                                <span className="text-gray-400 mx-1">→</span>
                                {contract.end_date ? formatDate(contract.end_date) : "—"}
                              </div>
                              <div className="col-span-2">
                                <p className="text-[14px] font-bold text-[#51218F]">{getContractRevenue(contract)}</p>
                              </div>
                              <div className="col-span-2">
                                {isMilestoneContract ? (
                                  <div className="w-full">
                                    <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                      <span>
                                        {contract.milestones_data.filter((m) => m.status === "paid").length}/
                                        {contract.milestones_data.length} done
                                      </span>
                                      <span className="text-[#51218F] font-semibold">
                                        ₹
                                        {contract.milestones_data
                                          .filter((m) => m.status === "paid")
                                          .reduce((s, m) => s + (m.amount || 0), 0)}
                                      </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all ${hasMilestoneRevisionFlag ? "bg-orange-500" : "bg-gradient-to-r from-[#51218F] to-purple-400"
                                          }`}
                                        style={{
                                          width: `${(contract.milestones_data.filter((m) => m.status === "paid").length /
                                            contract.milestones_data.length) * 100
                                            }%`,
                                        }}
                                      />
                                    </div>
                                    {hasMilestoneRevisionFlag && (
                                      <p className="text-[10px] text-orange-600 mt-0.5">
                                        ↻ {getMilestoneRevisionCount(contract)} need revision
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <p className={`text-[11px] ${hasRevision ? "text-orange-600 font-medium" : "text-gray-400"}`}>
                                    {hasRevision ? "↻ Revision needed" : "Standard contract"}
                                  </p>
                                )}
                              </div>
                              <div className="col-span-2">
                                <span className={`${badgeBase} text-white ${statusDisplay.color}`}>
                                  <span className="text-[10px]">{statusDisplay.icon}</span>
                                  <span>{statusDisplay.text}</span>
                                </span>
                              </div>
                              <div className="col-span-1 flex justify-center">
                                {isInReview ? (
                                  <span className="px-2 py-1 rounded-lg bg-gray-100 text-gray-400 text-[10px] font-medium cursor-not-allowed">
                                    ⏳ Review
                                  </span>
                                ) : needsAction ? (
                                  <button
                                    onClick={() => {
                                      if (hasRevision) handleViewRevision(contract);
                                      else if (hasMilestoneRevisionFlag) {
                                        setSelectedContractForMilestones(contract);
                                        setShowMilestoneDetailsModal(true);
                                      }
                                    }}
                                    className="px-2 py-1 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600 transition"
                                  >
                                    ↻ Action
                                  </button>
                                ) : isMilestoneContract ? (
                                  <button
                                    onClick={() => {
                                      setSelectedContractForMilestones(contract);
                                      setShowMilestoneDetailsModal(true);
                                    }}
                                    className="px-2 py-1 rounded-lg bg-gradient-to-r from-[#51218F] to-[#2a0e4a] text-white text-[10px] font-semibold hover:opacity-90 transition"
                                  >
                                    Details
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setSelectedContract(contract);
                                      setSelectedStatus(contract.status || "");
                                      setStatusReason("");
                                      setShowEditCard(true);
                                    }}
                                    className="w-7 h-7 rounded-full bg-purple-100 text-[#51218F] hover:bg-purple-200 transition flex items-center justify-center"
                                    title="Update Status"
                                  >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M4 9v9a2 2 0 0 0 2 2h9" />
                                      <path d="M6.5 17.5l2.5-.6 9.9-9.9a2.2 2.2 0 0 0-3.1-3.1L5.9 13.8l-.6 2.5Z" />
                                      <path d="M10.8 8.2l3.8 3.8" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>
                            {hasRevision && contract.revision_description && (
                              <div className="mx-4 mb-2 p-2 bg-orange-50 border-l-4 border-orange-500 rounded-r-lg">
                                <p className="text-[10px] text-orange-700 font-semibold">Revision Feedback:</p>
                                <p className="text-[10px] text-orange-600 mt-0.5 line-clamp-2">{contract.revision_description}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {paginatedCurrentContracts.length === 0 && <EmptyState message="No current contracts found" />}
                    </div>
                  </div>
                </div>
                {renderPagination(currentContractsPage, getTotalPages(currentContracts.length), setCurrentContractsPage)}
              </TableWrapper>
            </div>

            <div className="block md:hidden space-y-3">
              {paginatedCurrentContracts.map((contract, idx) => {
                const isLast = idx === paginatedCurrentContracts.length - 1;
                const statusDisplay = getContractStatusDisplay(contract);
                const hasRevision = hasRevisionFeedback(contract);
                const hasMilestoneRevisionFlag = hasMilestoneRevision(contract);
                const needsAction = (hasRevision || hasMilestoneRevisionFlag) && !isContractInReview(contract);
                const isInReview = isContractInReview(contract);
                const isMilestoneContract = hasMilestones(contract);
                return (
                  <div key={contract.id} className="bg-white rounded-xl shadow-[0_2px_12px_rgba(81,33,143,0.10)] border border-purple-100 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-[#51218F] to-[#2a0e4a]" />
                    <div className="p-3 space-y-2.5">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <CreatorAvatar contract={contract} size="w-8 h-8" />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-gray-800 text-[12px] truncate">{contract.job_title}</h4>
                            <p className="text-[10px] text-gray-500 truncate">{getClientName(contract)}</p>
                          </div>
                        </div>
                        <span className={`${badgeBase} text-white ml-2 flex-shrink-0 ${statusDisplay.color}`} style={{ fontSize: 9 }}>
                          {statusDisplay.icon} {statusDisplay.text}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 rounded-lg p-2">
                          <p className="text-[9px] text-gray-400 uppercase tracking-wide">Timeline</p>
                          <p className="text-[10px] text-gray-700 mt-0.5">
                            {contract.start_date ? formatDate(contract.start_date) : "—"} →{" "}
                            {contract.end_date ? formatDate(contract.end_date) : "—"}
                          </p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-2">
                          <p className="text-[9px] text-gray-400 uppercase tracking-wide">Budget</p>
                          <p className="text-[12px] font-bold text-[#51218F] mt-0.5">{getContractRevenue(contract)}</p>
                        </div>
                      </div>
                      {isMilestoneContract && (
                        <div>
                          <div className="flex justify-between text-[9px] text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>
                              {contract.milestones_data.filter((m) => m.status === "paid").length}/
                              {contract.milestones_data.length}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${hasMilestoneRevisionFlag ? "bg-orange-500" : "bg-gradient-to-r from-[#51218F] to-purple-400"
                                }`}
                              style={{
                                width: `${(contract.milestones_data.filter((m) => m.status === "paid").length /
                                  contract.milestones_data.length) * 100
                                  }%`,
                              }}
                            />
                          </div>
                          {hasMilestoneRevisionFlag && (
                            <p className="text-[9px] text-orange-600 mt-0.5">
                              ↻ {getMilestoneRevisionCount(contract)} need revision
                            </p>
                          )}
                        </div>
                      )}
                      {hasRevision && contract.revision_description && (
                        <div className="p-2 bg-orange-50 border-l-3 border-orange-500 rounded-r-lg">
                          <p className="text-[9px] text-orange-700 font-semibold">Feedback:</p>
                          <p className="text-[9px] text-orange-600 mt-0.5 line-clamp-2">{contract.revision_description}</p>
                        </div>
                      )}
                      {isInReview ? (
                        <div className="w-full py-1.5 rounded-lg bg-gray-100 text-gray-400 text-[10px] font-medium text-center">
                          ⏳ In Review
                        </div>
                      ) : needsAction ? (
                        <button
                          onClick={() => {
                            if (hasRevision) handleViewRevision(contract);
                            else if (hasMilestoneRevisionFlag) {
                              setSelectedContractForMilestones(contract);
                              setShowMilestoneDetailsModal(true);
                            }
                          }}
                          className="w-full py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600 transition"
                        >
                          ↻ Take Action
                        </button>
                      ) : isMilestoneContract ? (
                        <button
                          onClick={() => {
                            setSelectedContractForMilestones(contract);
                            setShowMilestoneDetailsModal(true);
                          }}
                          className="w-full py-1.5 rounded-lg bg-gradient-to-r from-[#51218F] to-[#2a0e4a] text-white text-[10px] font-semibold hover:opacity-90 transition"
                        >
                          View Details
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedContract(contract);
                            setSelectedStatus(contract.status || "");
                            setStatusReason("");
                            setShowEditCard(true);
                          }}
                          className="w-full py-1.5 rounded-lg bg-gradient-to-r from-[#51218F] to-[#2a0e4a] text-white text-[10px] font-semibold hover:opacity-90 transition"
                        >
                          ✎ Update Status
                        </button>
                      )}
                    </div>
                    {!isLast && <div className="border-b border-gray-200" />}
                  </div>
                );
              })}
              {paginatedCurrentContracts.length === 0 && (
                <div className="bg-white rounded-xl p-8 text-center"><EmptyState message="No current contracts found" /></div>
              )}
              {renderPagination(currentContractsPage, getTotalPages(currentContracts.length), setCurrentContractsPage)}
            </div>
          </>
        )}

        {/* COMPLETED CONTRACTS */}
        {activeSubTab === "completed" && !loading && (
          <>
            <div className="hidden md:block">
              <TableWrapper>
                <div className="overflow-x-auto">
                  <div className="min-w-[800px]">
                    <div className={`grid grid-cols-6 px-8 py-4 ${tableHeaderClass}`}>
                      {["Client Name", "Project Name", "Completed Date", "Revenue", "Status", "Action"].map((h) => (
                        <span key={h} className="text-center">{h}</span>
                      ))}
                    </div>
                    <div className="border-t border-gray-300">
                      {paginatedCompletedContracts.map((contract, idx) => {
                        const isLast = idx === paginatedCompletedContracts.length - 1;
                        return (
                          <div key={contract.id || idx} className={`grid grid-cols-6 px-8 py-4 items-center text-center text-[13px] text-gray-700 hover:bg-purple-50/20 transition ${rowBorderClass(isLast)}`}>
                            <span className="font-medium truncate">{getClientName(contract)}</span>
                            <span className="truncate">{contract.job_title}</span>
                            <span>{formatDate(contract.end_date)}</span>
                            <span className="font-bold text-emerald-600">{getContractRevenue(contract)}</span>
                            <div className="flex justify-center">
                              <span className={`${badgeBase} text-white ${getStatusColor(contract.status)}`}>
                                {getStatusText(contract.status)}
                              </span>
                            </div>
                            <div className="flex justify-center">
                              {reviewedContracts.has(contract.id) ? (
                                <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-medium">
                                  ✓ Reviewed
                                </span>
                              ) : (
                                <button onClick={() => handleReviewClick(contract)} className={`${btnPrimary} !px-3 !py-1.5 !text-xs`}>
                                  Review Client
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {paginatedCompletedContracts.length === 0 && <EmptyState message="No completed contracts found" />}
                    </div>
                  </div>
                </div>
                {renderPagination(completedContractsPage, getTotalPages(completedContracts.length), setCompletedContractsPage)}
              </TableWrapper>
            </div>

            <div className="block md:hidden space-y-3">
              {paginatedCompletedContracts.map((contract, idx) => {
                const isLast = idx === paginatedCompletedContracts.length - 1;
                return (
                  <div key={contract.id || idx} className="bg-white rounded-xl shadow-[0_2px_12px_rgba(81,33,143,0.10)] border border-purple-100 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-[#51218F] to-[#2a0e4a]" />
                    <div className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-800 text-[12px] truncate flex-1">{contract.job_title}</h4>
                        <span className={`${badgeBase} text-white ml-2 flex-shrink-0 ${getStatusColor(contract.status)}`} style={{ fontSize: 9 }}>
                          {getStatusText(contract.status)}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 mb-2">{getClientName(contract)}</p>
                      <div className="flex justify-between items-center mb-2.5">
                        <div>
                          <p className="text-[9px] text-gray-400 uppercase tracking-wide">Completed</p>
                          <p className="text-[10px] text-gray-600">{formatDate(contract.end_date)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-gray-400 uppercase tracking-wide">Revenue</p>
                          <p className="text-[13px] font-bold text-emerald-600">{getContractRevenue(contract)}</p>
                        </div>
                      </div>
                      {reviewedContracts.has(contract.id) ? (
                        <div className="text-center py-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-medium">
                            ✓ Reviewed
                          </span>
                        </div>
                      ) : (
                        <button onClick={() => handleReviewClick(contract)} className="w-full py-1.5 rounded-lg bg-gradient-to-r from-[#51218F] to-[#2a0e4a] text-white text-[10px] font-semibold hover:opacity-90 transition">
                          Review Client
                        </button>
                      )}
                    </div>
                    {!isLast && <div className="border-b border-gray-200" />}
                  </div>
                );
              })}
              {paginatedCompletedContracts.length === 0 && (
                <div className="bg-white rounded-xl p-8 text-center"><EmptyState message="No completed contracts found" /></div>
              )}
              {renderPagination(completedContractsPage, getTotalPages(completedContracts.length), setCompletedContractsPage)}
            </div>
          </>
        )}
      </section>

      <div className="-mx-4 mt-auto">
        <Footer />
      </div>

      <MilestoneDetailsModal />

      {/* EDIT CONTRACT POPUP */}
      {showEditCard && selectedContract && !isContractInReview(selectedContract) && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            ref={popupRef}
            className="relative bg-white w-full max-w-[500px] rounded-2xl shadow-2xl overflow-visible max-h-[90vh] scrollbar-hide animate-fadeIn"
          >
            <div className="bg-gradient-to-r from-[#51218F] to-[#2a0e4a] px-5 py-4 sticky top-0 z-10 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <CreatorAvatar contract={selectedContract} size="w-9 h-9" />
                  <div>
                    <h3 className="font-semibold text-sm text-white">{getClientName(selectedContract)}</h3>
                    <p className="text-xs text-purple-200">{selectedContract.job_title}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowEditCard(false);
                    setSelectedFiles([]);
                    setWorkDescription("");
                    setSelectedStatus("");
                    setStatusReason("");
                    setIsStatusDropdownOpen(false);
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition text-lg"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div ref={statusDropdownRef} className="relative z-[9999]">
                <label className={labelClasses}>Update Contract Status</label>
                <button
                  type="button"
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className={selectTriggerClasses}
                  style={{ border: "2px solid #6b7280" }}
                >
                  <span className={selectedStatus ? "text-gray-800" : "text-gray-400"}>
                    {getSelectedStatusLabel()}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${isStatusDropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isStatusDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-[99999] max-h-64 overflow-y-auto">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedStatus(option.value);
                          setStatusReason("");
                          setIsStatusDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 transition ${selectedStatus === option.value ? "bg-purple-50 text-[#51218F] font-semibold" : "text-gray-700"
                          }`}
                      >
                        {option.label}
                        {selectedStatus === option.value && <span className="float-right text-[#51218F]">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {["pending", "cancelled", "awaiting"].includes(selectedStatus) && (
                <div>
                  <label className={labelClasses}>
                    {selectedStatus === "cancelled"
                      ? "Reason for cancellation"
                      : selectedStatus === "awaiting"
                        ? "Reason for awaiting"
                        : "Reason for pending"}
                    <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <textarea
                    placeholder={`Please explain why you are ${selectedStatus === "cancelled"
                      ? "cancelling"
                      : selectedStatus === "awaiting"
                        ? "setting to awaiting"
                        : "setting to pending"
                      } this contract...`}
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    rows={3}
                    className={textareaClasses}
                    style={{ border: "2px solid #6b7280" }}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">This reason will be shared with the client.</p>
                </div>
              )}

              {selectedStatus === "completed" && (
                <>
                  <div>
                    <label className={labelClasses}>
                      Work Description
                      <span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <textarea
                      placeholder="Describe the work you're submitting..."
                      value={workDescription}
                      onChange={(e) => setWorkDescription(e.target.value)}
                      rows={3}
                      className={textareaClasses}
                      style={{ border: "2px solid #6b7280" }}
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>External File Link</label>
                    <input
                      type="url"
                      value={externalFileLink}
                      onChange={(e) => setExternalFileLink(e.target.value)}
                      placeholder="Paste Google Drive / Dropbox link"
                      className={inputClasses}
                      style={{ border: "2px solid #6b7280" }}
                    />
                    <p className="text-[10px] text-gray-400 mt-1">For files exceeding 25MB, use cloud storage link.</p>
                  </div>
                </>
              )}
              {selectedStatus === "completed" && (
                <div>
                  <label className={labelClasses}>
                    Attachments
                    <span className="text-red-500 ml-0.5">*</span>
                  </label>

                  <div className="mt-2">
                    <FileDropZone inputId="file-upload-input" />
                  </div>

                  <FileList />
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-gray-200 flex gap-3 justify-end bg-gray-50 sticky bottom-0 rounded-b-2xl">
              <button
                onClick={() => {
                  setShowEditCard(false);
                  setSelectedFiles([]);
                  setWorkDescription("");
                  setSelectedStatus("");
                  setStatusReason("");
                  setIsStatusDropdownOpen(false);
                }}
                className={btnDanger}
              >
                Cancel
              </button>
              <button onClick={handleSubmitClick} disabled={loading} className={btnPrimary}>
                {loading ? "Processing…" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MILESTONE SUBMISSION MODAL */}
      {showMilestoneModal && selectedContract && selectedMilestone && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div ref={popupRef} className="relative bg-white w-full max-w-[500px] rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
            <div className="bg-gradient-to-r from-[#51218F] to-[#2a0e4a] px-5 py-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-base text-white">
                    {selectedMilestone.status === "revision_requested" ? "Resubmit Milestone Work" : "Submit Milestone Work"}
                  </h3>
                  <p className="text-sm text-purple-200 mt-0.5">{selectedMilestone.description}</p>
                  <p className="text-xs text-yellow-200 font-semibold mt-0.5">Amount: ₹{selectedMilestone.amount}</p>
                </div>
                <button
                  onClick={() => {
                    setShowMilestoneModal(false);
                    setSelectedMilestone(null);
                    setSelectedFiles([]);
                    setWorkDescription("");
                    setExternalFileLink("");
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition text-lg"
                >
                  ×
                </button>
              </div>
            </div>

            {selectedMilestone.status === "revision_requested" && selectedMilestone.review && (
              <div className="mx-5 mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-xs font-semibold text-orange-700">Revision Feedback:</p>
                <p className="text-xs text-orange-600 mt-0.5">{selectedMilestone.review.comments}</p>
              </div>
            )}

            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className={labelClasses}>
                  Work Description
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <textarea
                  value={workDescription}
                  onChange={(e) => setWorkDescription(e.target.value)}
                  rows={3}
                  className={textareaClasses}
                  style={{ border: "2px solid #6b7280" }}
                  placeholder="Describe what you've completed for this milestone…"
                />
              </div>
              <div>
                <label className={labelClasses}>External Link (Google Drive, Dropbox, etc.)</label>
                <input
                  type="url"
                  value={externalFileLink}
                  onChange={(e) => setExternalFileLink(e.target.value)}
                  className={inputClasses}
                  style={{ border: "2px solid #6b7280" }}
                  placeholder="https://drive.google.com/…"
                />
              </div>
              <div>
                <label className={labelClasses}>Attachments (Max 25MB each)</label>
                <FileDropZone inputId="milestone-file-input" />
                <FileList />
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-200 flex gap-3 justify-end bg-gray-50">
              <button
                onClick={() => {
                  setShowMilestoneModal(false);
                  setSelectedMilestone(null);
                  setSelectedFiles([]);
                  setWorkDescription("");
                  setExternalFileLink("");
                }}
                className={btnDanger}
              >
                Cancel
              </button>
              <button onClick={handleSubmitMilestoneWork} disabled={loading} className={btnPrimary}>
                {loading ? "Submitting…" : selectedMilestone.status === "revision_requested" ? "Resubmit Work" : "Submit Milestone Work"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {showReviewModal && selectedReviewContract && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
            <div className="bg-gradient-to-r from-[#51218F] to-[#2a0e4a] px-6 py-5">
              <h3 className="text-lg font-bold text-white">Review Client</h3>
              <p className="text-purple-200 text-sm mt-0.5">Share your experience with {getClientName(selectedReviewContract)}</p>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className={labelClasses}>Rating (1–5)</label>
                <div className="flex gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setReviewRating(star)} className="text-2xl focus:outline-none transition-transform hover:scale-110">
                      {star <= reviewRating ? <span className="text-yellow-400">★</span> : <span className="text-gray-200">★</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClasses}>Comment (optional)</label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="What was it like working with this client?"
                  className={textareaClasses}
                  style={{ border: "2px solid #6b7280" }}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowReviewModal(false)} className={`flex-1 ${btnDanger}`}>
                  Cancel
                </button>
                <button onClick={handleSubmitReview} disabled={reviewSubmitting} className={`flex-1 ${btnPrimary}`}>
                  {reviewSubmitting ? "Submitting…" : "Submit Review"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL PROJECT REVISION MODAL */}
      {showFullProjectRevisionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M12 8v4m0 4h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Revision Required</h3>
                    <p className="text-white/70 text-sm mt-0.5">Client requested changes to your work</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFullProjectRevisionModal(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition text-lg"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="bg-amber-50 p-5 rounded-xl border border-amber-200">
                <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide mb-2">Client's Revision Feedback</p>
                <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{fullProjectRevisionText}</p>
              </div>
              <div className="mt-5 flex gap-3">
                <button onClick={() => setShowFullProjectRevisionModal(false)} className={`flex-1 ${btnDanger}`}>
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowFullProjectRevisionModal(false);
                    const contractWithRevision = currentContracts.find((c) => hasRevisionFeedback(c));
                    if (contractWithRevision) {
                      setSelectedContract(contractWithRevision);
                      setSelectedStatus("completed");
                      setShowEditCard(true);
                    }
                  }}
                  className={`flex-1 ${btnPrimary}`}
                >
                  Resubmit Work
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LEGACY REVISION MODAL */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
            <div className="bg-gradient-to-r from-[#51218F] to-[#2a0e4a] px-6 py-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M12 8v4m0 4h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Revision Required</h3>
                    <p className="text-white/70 text-sm mt-0.5">Please review and update your work</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRevisionModal(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition text-lg"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-amber-50 p-5 rounded-xl max-h-80 overflow-y-auto border border-amber-200">
                <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{revisionText || "No revision details provided."}</p>
              </div>
              <div className="mt-5">
                <button onClick={() => setShowRevisionModal(false)} className={`w-full ${btnDanger}`}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Allcontacts;