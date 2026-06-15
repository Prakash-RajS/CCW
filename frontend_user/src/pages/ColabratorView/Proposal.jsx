// import React, { useState, useRef, useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { useUser } from "../../contexts/userContext";
// import api from "../../utils/axiosConfig";
// import TopBanner from "../../assets/Colabwork/banner.png";
// import PopupImage from "../../assets/Landing/Card1.png";
// import Footer from "../../component/Footer";
// import ColHeader from "../../component/ColHeader";
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// export default function Proposal() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { userData } = useUser();

//   const [showPopup, setShowPopup] = useState(false);
//   const [isRevoked, setIsRevoked] = useState(false);
//   const [isHovering, setIsHovering] = useState(false);
//   const changeTermsRef = useRef(null);

//   // State for job and proposal data
//   const [job, setJob] = useState(null);
//   const [creator, setCreator] = useState(null);
//   const [proposal, setProposal] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // State for creator stats - EXACT SAME AS UX PAGE
//   const [creatorStats, setCreatorStats] = useState({
//     total_jobs_posted: 0,
//     hire_rate: 0,
//     total_spent: 0,
//     total_hires: 0,
//     avg_hourly_rate: 0,
//     total_hours: 0,
//     company_size: '',
//     member_since: null,
//     rating: 0,
//     reviews: 0,
//     // identity_verified: false,
//     // payment_verified: false,
//     phone_verified: false,
//     email_verified: false,
//     country: null,
//     city: null,
//     country_code: null,
//     local_time: '4:45 PM',
//     time_postfix: 'pm'
//   });

//   // Messaging state
//   const [messageInput, setMessageInput] = useState("");
//   const [isSendingMessage, setIsSendingMessage] = useState(false);
//   const [chatStarted, setChatStarted] = useState(false);
//   const [conversationId, setConversationId] = useState(null);
//   const [otherUserTyping, setOtherUserTyping] = useState(false);
//   const [otherUserOnline, setOtherUserOnline] = useState(false);
//   const [lastMessageSent, setLastMessageSent] = useState(null);

//   // ==================== GET CONNECTS FROM CONTEXT - FIXED ====================
//   const [userConnects, setUserConnects] = useState(0);

//   // Get connects from userData context - EXACT SAME AS UX PAGE
//   const getUserConnects = () => {
//     if (userData?.connects) {
//       setUserConnects(userData.connects);
//     } else {
//       setUserConnects(50); // Default fallback
//     }
//   };
//   ///////// constat
//   const jobIdSafe =
//     job?.id ||
//     location.state?.jobId ||
//     location.state?.job?.id ||
//     null;

//   const creatorIdSafe =
//     job?.employer_id ??
//     location.state?.job?.employer_id ??
//     null;
//   //////////////







//   useEffect(() => {
//     getUserConnects();
//   }, [userData]);

//   // ==================== EXACT SAME FETCH LOGIC AS UX PAGE ====================

//   // Fetch creator stats - EXACT SAME AS UX PAGE
//   const fetchCreatorStats = async (creatorId) => {
//     if (!creatorId) return;

//     try {
//       // Fetch creator's job stats
//       const jobStatsResponse = await api.get(`/creator/job-stats/${creatorId}`);
//       const jobStats = jobStatsResponse.data || {};

//       // Fetch creator's verification status
//       const verificationResponse = await api.get(`/auth/user/verification/${creatorId}`);
//       const verification = verificationResponse.data || {};

//       // Fetch creator's reviews and rating
//       const reviewsResponse = await api.get(`/creator/reviews/${creatorId}`);
//       const reviews = reviewsResponse.data || {};

//       // Fetch creator's company info
//       const companyResponse = await api.get(`/creator/company/${creatorId}`);
//       const company = companyResponse.data || {};

//       setCreatorStats({
//         total_jobs_posted: jobStats.total_jobs_posted || 0,
//         hire_rate: jobStats.hire_rate || 0,
//         total_spent: jobStats.total_spent || 0,
//         total_hires: jobStats.total_hires || 0,
//         avg_hourly_rate: jobStats.avg_hourly_rate || 0,
//         total_hours: jobStats.total_hours || 0,
//         company_size: company.company_size || 'Mid-sized',
//         member_since: creator?.created_at || null,
//         rating: reviews.avg_rating || 0,
//         reviews: reviews.total_reviews || 0,
//         identity_verified: verification.identity_verified || false,
//         payment_verified: verification.payment_verified || false,
//         phone_verified: verification.phone_verified || false,
//         email_verified: verification.email_verified || false,
//         country: creator?.country || null,
//         city: creator?.city || null,
//         country_code: creator?.country_code || null,
//         local_time: '4:45 PM', // Default if not available
//         time_postfix: 'pm'
//       });
//     } catch (error) {
//       console.error('Error fetching creator stats:', error);
//     }
//   };

//   // Fetch job details - EXACT SAME AS UX PAGE
//   const fetchJobDetails = async (jobId, proposalId) => {
//     setLoading(true);
//     try {
//       const response = await api.get(`/collaborator/jobs/${jobId}`);
//       const jobData = response.data || {};
//       const creatorData = jobData.creator || {};

//       setJob(jobData);
//       setCreator(creatorData);

//       // Fetch creator stats
//       if (creatorData.id) {
//         await fetchCreatorStats(creatorData.id);
//       }

//       if (location.state?.proposal) {
//         setProposal(location.state.proposal);
//       } else if (proposalId) {
//         const savedProposal = localStorage.getItem('currentProposal');
//         if (savedProposal) {
//           setProposal(JSON.parse(savedProposal));
//         }
//       }

//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching job details:', error);
//       setError('Failed to load job details');
//       toast.error('Failed to load job details');
//       setLoading(false);
//     }
//   };

//   // ==================== PROPOSAL SUBMISSION - FIXED ====================
//   const handleSubmitProposal = async () => {
//     if (!userData?.id) {
//       toast.error('Please login to submit a proposal');
//       navigate('/login');
//       return;
//     }

//     if (!job?.id) {
//       toast.error('Job information is missing');
//       return;
//     }

//     try {
//       const formData = new FormData();
//       formData.append('job_id', job.id);
//       formData.append('freelancer_id', userData.id);
//       formData.append('payment_type', 'project');
//       formData.append('bid_amount', job.budget_from || job.budget_to || 100);
//       formData.append('duration', '30 days');
//       formData.append('cover_letter', 'I am interested in this project. I have the required skills and experience.');
//       formData.append('skills', job.skills_required?.join(', ') || 'Web Design, Mockup');
//       formData.append('expertise', 'Intermediate');

//       const response = await api.post('/proposals/CreateProposal', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       });

//       if (response.data && response.data.proposal_id) {
//         toast.success('Proposal submitted successfully!');

//         // Store proposal data
//         const proposalData = {
//           id: response.data.proposal_id,
//           bid_amount: job.budget_from || job.budget_to || 100,
//           status: 'submitted',
//           created_at: new Date().toISOString()
//         };

//         setProposal(proposalData);
//         localStorage.setItem('currentProposal', JSON.stringify(proposalData));
//         localStorage.setItem('currentJob', JSON.stringify(job));

//         // Navigate to the proposal page with the submitted proposal
//         navigate('/proposal', {
//           state: {
//             job: job,
//             proposal: proposalData,
//             jobId: job.id,
//             proposalId: response.data.proposal_id
//           },
//           replace: true
//         });
//       }
//     } catch (error) {
//       console.error('Error submitting proposal:', error);

//       if (error.response?.status === 400) {
//         if (error.response.data?.detail?.includes('already applied')) {
//           toast.error('You have already applied for this job');
//         } else {
//           toast.error(error.response.data?.detail || 'Failed to submit proposal');
//         }
//       } else {
//         toast.error('Failed to submit proposal. Please try again.');
//       }
//     }
//   };

//   // ==================== COUNTRY FLAG - EXACT SAME AS COL HOME ====================
//   const CountryFlag = ({ countryCode, country }) => {
//     if (!countryCode) {
//       return (
//         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="1.5">
//           <circle cx="12" cy="12" r="9" stroke="#6B6B6B" strokeWidth="1.5" />
//           <path d="M12 8v4l3 3" stroke="#6B6B6B" strokeWidth="1.5" />
//         </svg>
//       );
//     }

//     return (
//       <img
//         src={`https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`}
//         alt={country}
//         title={country}
//         className="w-[18px] h-[12px] rounded-[4px] object-cover"
//         onError={(e) => {
//           e.target.onerror = null;
//           e.target.src = "https://flagcdn.com/w20/us.png";
//         }}
//       />
//     );
//   };

//   // Get data from navigation state
//   useEffect(() => {
//     if (location.state) {
//       const { job: jobData, proposal: proposalData, jobId, proposalId } = location.state;

//       if (jobData) {
//         setJob(jobData);
//         setCreator(jobData.creator || {});
//         setProposal(proposalData || null);

//         // Fetch creator stats if we have creator ID
//         if (creatorIdSafe) {
//           fetchCreatorStats(creatorIdSafe);
//         }

//         setLoading(false);
//       }
//       else if (jobId) {
//         fetchJobDetails(jobId, proposalId);
//       }
//       else {
//         const savedProposal = localStorage.getItem('currentProposal');
//         const savedJob = localStorage.getItem('currentJob');

//         if (savedProposal && savedJob) {
//           try {
//             const parsedJob = JSON.parse(savedJob);
//             setProposal(JSON.parse(savedProposal));
//             setJob(parsedJob);
//             setCreator(parsedJob.creator || {});

//             if (creatorIdSafe) {
//               fetchCreatorStats(creatorIdSafe);
//             }

//             setLoading(false);
//           } catch (e) {
//             setError('No job information found');
//             toast.error('No job information found');
//           }
//         } else {
//           // If no proposal exists, show submit proposal button
//           setLoading(false);
//         }
//       }
//     } else {
//       const savedProposal = localStorage.getItem('currentProposal');
//       const savedJob = localStorage.getItem('currentJob');

//       if (savedProposal && savedJob) {
//         try {
//           const parsedJob = JSON.parse(savedJob);
//           setProposal(JSON.parse(savedProposal));
//           setJob(parsedJob);
//           setCreator(parsedJob.creator || {});

//          if (creatorIdSafe) {
//   fetchCreatorStats(creatorIdSafe);
// }

//           setLoading(false);
//         } catch (e) {
//           setError('No job information found');
//           toast.error('No job information found');
//         }
//       } else {
//         // If no proposal exists, show submit proposal button
//         setLoading(false);
//       }
//     }
//   }, [location.state]);

//   // Messaging functions
//   const checkConversation = async () => {
//     if (!userData?.id || !creatorIdSafe) return;

//     try {
//       const response = await api.get(`/message/conversation/${userData.id}/${creator.id}`);
//       setConversationId(response.data.conversation_id);
//       setOtherUserOnline(response.data.other_user_online || false);
//       setOtherUserTyping(response.data.other_user_typing || false);

//       if (response.data.conversation_id) {
//         setChatStarted(true);
//       }
//     } catch (error) {
//       console.error('Error checking conversation:', error);
//     }
//   };

//   useEffect(() => {
//     if (userData?.id && creatorIdSafe) {
//       checkConversation();

//       // Set up typing status polling
//       const typingInterval = setInterval(checkConversation, 3000);
//       return () => clearInterval(typingInterval);
//     }
//   }, [userData, creator]);

//   const sendTypingStatus = async (isTyping) => {
//     if (!userData?.id || !creatorIdSafe) return;

//     try {
//       await api.post('/message/typing', {
//         user_id: userData.id,
//         chat_with: creator.id,
//         is_typing: isTyping
//       });
//     } catch (error) {
//       console.error('Error sending typing status:', error);
//     }
//   };

//   const handleMessageInputChange = (e) => {
//     setMessageInput(e.target.value);
//     sendTypingStatus(e.target.value.length > 0);
//   };




//   const handleSendMessage = async () => {
//     if (!messageInput.trim()) return;

//     if (!userData?.id || !jobIdSafe || !creatorIdSafe) {
//       toast.error("Missing required data");
//       console.log({
//         userId: userData?.id,
//         jobId: job?.id,
//         creatorId: job?.employer_id,
//       });
//       return;
//     }

//     setIsSendingMessage(true);

//     try {
//       const formData = new FormData();
//       formData.append("job_id", job.id);
//       formData.append("sender_id", userData.id);
//       formData.append("content", messageInput.trim());

//       await api.post("/message/send-for-proposal", formData);

//       navigate("/message", {
//         state: {
//           jobId: jobIdSafe,
//           receiverId: creatorIdSafe,
//         },
//       });
//     } catch (error) {
//       console.error("Message send failed", error);
//       toast.error("Failed to send message");
//     } finally {
//       setIsSendingMessage(false);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   const handleRevokeClick = () => {
//     setShowPopup(true);
//   };

//   const handleCancelClick = () => {
//     setShowPopup(false);
//   };

//   const handleConfirmRevoke = async () => {
//     if (!proposal?.id) {
//       toast.error('No proposal to revoke');
//       return;
//     }

//     try {
//       // Use the correct endpoint from API documentation
//       await api.delete(`/proposals/WithdrawProposal/${proposal.id}`);

//       setIsRevoked(true);
//       setShowPopup(false);
//       toast.success('Proposal revoked successfully');
//       setProposal(prev => ({ ...prev, status: 'revoked' }));

//       // Update localStorage
//       const updatedProposal = { ...proposal, status: 'revoked' };
//       localStorage.setItem('currentProposal', JSON.stringify(updatedProposal));
//     } catch (error) {
//       console.error('Error revoking proposal:', error);

//       // Check if it's a 404 error (endpoint might be different case)
//       if (error.response?.status === 404) {
//         // Try alternative case variations
//         try {
//           // Try with different case patterns
//           await api.delete(`/proposals/withdraw-proposal/${proposal.id}`);
//           setIsRevoked(true);
//           setShowPopup(false);
//           toast.success('Proposal revoked successfully');
//           setProposal(prev => ({ ...prev, status: 'revoked' }));
//           const updatedProposal = { ...proposal, status: 'revoked' };
//           localStorage.setItem('currentProposal', JSON.stringify(updatedProposal));
//           return;
//         } catch (secondError) {
//           console.error('Second attempt also failed:', secondError);
//           toast.error('Failed to revoke proposal. Please try again.');
//         }
//       } else {
//         toast.error('Failed to revoke proposal. Please try again.');
//       }
//     }
//   };

//   const handleChangeTerms = () => {
//     navigate('/Uploadux', {
//       state: {
//         jobId: job?.id,
//         jobTitle: job?.title,
//         budget: job?.budget,
//         budget_from: job?.budget_from,
//         budget_to: job?.budget_to,
//         budget_type: job?.budget_type,
//         proposalData: proposal,
//         isEditing: true,
//         job: job
//       }
//     });
//   };

//   useEffect(() => {
//     if (isRevoked && changeTermsRef.current) {
//       changeTermsRef.current.focus();
//     }
//   }, [isRevoked]);

//   // ==================== FORMATTING FUNCTIONS - EXACT SAME AS UX PAGE ====================

//   // Format time ago - EXACT SAME AS UX PAGE
//   const formatTimeAgo = (dateString) => {
//     if (!dateString) return "Recently";

//     try {
//       const date = new Date(dateString);
//       const now = new Date();
//       const diffMs = now - date;
//       const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
//       const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

//       if (diffHours < 1) {
//         return "Recently";
//       } else if (diffHours < 24) {
//         return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
//       } else if (diffDays === 1) {
//         return "1 day ago";
//       } else if (diffDays < 7) {
//         return `${diffDays} days ago`;
//       } else {
//         return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
//       }
//     } catch (error) {
//       return "Recently";
//     }
//   };

//   // Format budget display - EXACT SAME AS UX PAGE
//   const formatBudget = () => {
//     if (!job) return '$0.00';

//     if (job.budget_from && job.budget_to) {
//       return `$${job.budget_from} - $${job.budget_to}`;
//     } else if (job.budget_from) {
//       return `$${job.budget_from}`;
//     } else if (job.budget_to) {
//       return `$${job.budget_to}`;
//     }
//     return '$0.00';
//   };

//   // Format proposal amount - FIXED TO USE REAL BUDGET DATA
//   const formatProposalAmount = () => {
//     if (!proposal) {
//       // If no proposal yet, show job budget
//       return formatBudget() + ' USD';
//     }

//     if (proposal.bid_amount) {
//       return `$${proposal.bid_amount} USD`;
//     }
//     if (proposal.amount) {
//       return `$${proposal.amount} USD`;
//     }
//     // Default to job budget
//     return formatBudget() + ' USD';
//   };

//   // Format bidding ends time - EXACT SAME AS UX PAGE
//   const formatBiddingEnds = () => {
//     if (!job?.bidding_ends_at) return "Bidding ends in 6 days";

//     try {
//       const endDate = new Date(job.bidding_ends_at);
//       const now = new Date();
//       const diffMs = endDate - now;
//       const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

//       if (diffDays > 0) {
//         return `Bidding ends in ${diffDays} days`;
//       } else {
//         return "Bidding ends soon";
//       }
//     } catch (error) {
//       return "Bidding ends in 6 days";
//     }
//   };

//   // Format currency - EXACT SAME AS UX PAGE
//   const formatCurrency = (amount) => {
//     if (!amount) return '$0';
//     if (amount >= 1000) {
//       return `$${Math.round(amount / 1000)}k+`;
//     }
//     return `$${amount}`;
//   };

//   // Format member since date - EXACT SAME AS UX PAGE
//   const formatMemberSince = (dateString) => {
//     if (!dateString) return 'Jan 22, 2020';
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
//     } catch {
//       return 'Jan 22, 2020';
//     }
//   };

//   // Handle back button
//   const handleBack = () => {
//     if (location.state?.from) {
//       navigate(location.state.from);
//     } else {
//       navigate(-1);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="w-full bg-[#F5F5F5] min-h-screen">
//         <div className="relative w-full h-[420px] md:h-[520px] xl:h-[582px]">
//           <img src={TopBanner} alt="banner" className="absolute inset-0 w-full h-full object-cover blur-[1px]" />
//           <div className="absolute top-0 left-0 w-full z-50">
//             <ColHeader />
//           </div>
//         </div>
//         <div className="min-h-screen flex justify-center items-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   if (error || !job) {
//     return (
//       <div className="w-full bg-[#F5F5F5] min-h-screen">
//         <div className="relative w-full h-[420px] md:h-[520px] xl:h-[582px]">
//           <img src={TopBanner} alt="banner" className="absolute inset-0 w-full h-full object-cover blur-[1px]" />
//           <div className="absolute top-0 left-0 w-full z-50">
//             <ColHeader />
//           </div>
//         </div>
//         <div className="min-h-screen flex justify-center items-center px-4">
//           <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
//             <div className="text-gray-400 mb-4">
//               <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//               </svg>
//             </div>
//             <h3 className="text-lg font-semibold text-gray-600 mb-2">Error Loading Job</h3>
//             <p className="text-gray-500 mb-6">{error || 'Job not found'}</p>
//             <button
//               onClick={() => navigate('/colhome')}
//               className="px-8 py-3 bg-[#5B2D91] text-white rounded-full hover:bg-[#4a2373] transition-colors font-semibold"
//             >
//               Go back to jobs
//             </button>
//           </div>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   return (
//     <div className="w-full bg-[#F5F5F5] min-h-screen">
//       <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} />

//       <div className="relative w-full h-[420px] md:h-[520px] xl:h-[582px]">
//         <img src={TopBanner} alt="banner" className="absolute inset-0 w-full h-full object-cover blur-[1px]" />
//         <div className="absolute top-0 left-0 w-full z-50">
//           <ColHeader />
//         </div>
//       </div>

//       <div className="min-h-screen flex justify-center px-4 sm:px-0">
//         <div className="relative w-full max-w-[1200px] 2xl:max-w-[1320px] mx-5 sm:mx-auto -mt-[240px] lg:-mt-[300px] bg-white border border-black rounded-none">
//           <div className="hidden sm:block border-b border-gray-200 px-6 md:px-8 pt-4 pb-0">
//             <button
//               onClick={handleBack}
//               className="flex items-center text-[16px] text-[#111111] mb-4 hover:text-[#5B2D91] transition-colors"
//             >
//               <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
//                 <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//               </svg>
//               <span>Back</span>
//             </button>
//             <div className="h-[1px] bg-gray-200 w-full"></div>
//           </div>

//           <div className="flex flex-col lg:flex-row">
//             <div className="flex-1 px-4 md:px-8 py-3 sm:py-6">
//               <div className="flex justify-between items-start sm:items-start mb-1 sm:mb-3">
//                 <div>
//                   <h2 className="text-[14px] sm:text-[20px] font-semibold leading-tight tracking-tight whitespace-normal pr-4">
//                     {job?.title || "Looking for a UX Web Designer"}
//                   </h2>
//                   <p className="text-sm text-gray-500 mt-1 sm:hidden">
//                     {formatTimeAgo(job?.created_at)}
//                   </p>
//                 </div>
//                 <div className="mt-8 sm:mt-0">
//                   <div className="flex flex-col items-start sm:items-end text-left sm:text-right leading-tight">
//                     <p className="text-[12px] sm:text-[14px] font-semibold text-black whitespace-nowrap">
//                       {formatProposalAmount()}
//                     </p>
//                     <p className="text-[9px] sm:text-[10px] uppercase tracking-wide text-gray-500 whitespace-nowrap sm:mt-[2px]">
//                       {formatBiddingEnds()}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <p className="hidden sm:block text-sm text-gray-500 mb-5">
//                 {formatTimeAgo(job?.created_at)}
//               </p>

//               <p className="text-[14px] leading-[22px] text-gray-700 mt-4 sm:mt-9 mb-4 whitespace-pre-line">
//                 {job?.description || "No description available"}
//               </p>

//               <p className="text-[14px] font-semibold mb-2">The key areas are -</p>
//               <div className="text-[14px] text-gray-700 space-y-1 mb-4">
//                 {job?.key_areas?.map((area, index) => (
//                   <p key={index}>+ {area}</p>
//                 ))}
//                 {(!job?.key_areas || job.key_areas.length === 0) && (
//                   <>
//                     <p>+ Digital Transformation work</p>
//                     <p>+ Platform modernization</p>
//                     <p>+ Maintenance and support</p>
//                     <p>+ Utility tool development</p>
//                     <p>+ Secure Data migration</p>
//                     <p>+ Round the clock support</p>
//                     <p>+ IT Consultancy</p>
//                   </>
//                 )}
//               </div>

//               <p className="text-[14px] text-gray-700 mb-6">
//                 Contents development is included in the job which should be finalized after review with me.
//               </p>

//               <div className="h-[1px] bg-gray-200 mb-4"></div>

//               <h3 className="font-semibold text-[14px] mb-4">Skills and Expertise</h3>

//               <div className="flex gap-2 mb-6 flex-wrap sm:hidden">
//                 {job?.skills_required?.slice(0, 2).map((tag, i) => (
//                   <span key={i} className="px-4 py-1 rounded-full bg-gray-100 text-[12px] text-gray-600">
//                     {tag}
//                   </span>
//                 ))}
//                 {(!job?.skills_required || job.skills_required.length === 0) && (
//                   <>
//                     <span className="px-4 py-1 rounded-full bg-gray-100 text-[12px] text-gray-600">Web Design</span>
//                     <span className="px-4 py-1 rounded-full bg-gray-100 text-[12px] text-gray-600">Mockup</span>
//                   </>
//                 )}
//               </div>

//               <div className="hidden sm:flex gap-2 mb-6 flex-wrap">
//                 {job?.skills_required?.map((tag, i) => (
//                   <span key={i} className="px-4 py-1 rounded-full bg-gray-100 text-[12px] text-gray-600">
//                     {tag}
//                   </span>
//                 ))}
//                 {(!job?.skills_required || job.skills_required.length === 0) && (
//                   <>
//                     <span className="px-4 py-1 rounded-full bg-gray-100 text-[12px] text-gray-600">Web Design</span>
//                     <span className="px-4 py-1 rounded-full bg-gray-100 text-[12px] text-gray-600">Mockup</span>
//                     <span className="px-4 py-1 rounded-full bg-gray-100 text-[12px] text-gray-600">Web Design</span>
//                     <span className="px-4 py-1 rounded-full bg-gray-100 text-[12px] text-gray-600">Mockup</span>
//                   </>
//                 )}
//               </div>

//               <div className="h-[1px] bg-gray-200 mb-4"></div>

//               <div className="sm:hidden mb-5 w-full p-4 text-[10px] leading-[14px] text-black grid grid-cols-2 gap-3">
//                 <p><span className="font-semibold">Proposals:</span> {job?.proposal_count || '15 to 20'}</p>
//                 <p className="whitespace-nowrap"><span className="font-semibold">Last viewed:</span> {job?.last_viewed_at ? formatTimeAgo(job.last_viewed_at) : '3 minutes'}</p>
//                 <p><span className="font-semibold">Interviewing:</span> {job?.interviewing_count || 0}</p>
//                 <p><span className="font-semibold">Invites sent:</span> {job?.invites_sent_count || 0}</p>
//                 <p className="col-span-2"><span className="font-semibold">Unanswered invites:</span> {job?.unanswered_invites_count || 0}</p>
//               </div>

//               <div className="sm:flex sm:gap-4 sm:items-center">
//                 <div className="sm:hidden flex flex-col gap-4">
//                   {!proposal ? (
//                     <button
//                       onClick={handleSubmitProposal}
//                       className="bg-[#5B2D91] text-white py-3 w-full rounded-full text-[14px] font-semibold hover:bg-[#4a2373] transition-colors"
//                     >
//                       Submit Proposal
//                     </button>
//                   ) : isRevoked ? (
//                     <button
//                       ref={changeTermsRef}
//                       onClick={handleChangeTerms}
//                       className="bg-white text-[#5B2D91] py-3 w-full rounded-full text-[14px] font-semibold border-2 border-[#5B2D91] focus:ring-2 focus:ring-[#5B2D91]"
//                     >
//                       Change terms
//                     </button>
//                   ) : (
//                     <button
//                       onClick={handleChangeTerms}
//                       className="bg-[#5B2D91] text-white py-3 w-full rounded-full text-[14px] font-semibold hover:bg-[#4a2373] transition-colors"
//                     >
//                       Change terms
//                     </button>
//                   )}

//                   {proposal && !isRevoked && (
//                     <button
//                       onClick={handleRevokeClick}
//                       onMouseEnter={() => setIsHovering(true)}
//                       onMouseLeave={() => setIsHovering(false)}
//                       className={`w-full py-3 text-[14px] font-semibold border rounded-full transition-colors duration-200 ${isHovering
//                         ? "bg-[#5B2D91] text-white border-[#5B2D91]"
//                         : "border-gray-600 text-gray-800"
//                         }`}
//                     >
//                       Revoke proposal
//                     </button>
//                   )}

//                   {isRevoked && (
//                     <button
//                       className="w-full py-3 text-[14px] font-semibold rounded-full text-gray-500 bg-gray-100 cursor-not-allowed border border-gray-300"
//                       disabled
//                     >
//                       Proposal Revoked
//                     </button>
//                   )}

//                   <div className="mt-4 text-[13px] text-gray-800 space-y-1">
//                     <p>Required Connects to submit a proposal: {job?.required_connects || 6}</p>
//                     <p>Available Connects: {userConnects || 0}</p>
//                   </div>
//                 </div>

//                 <div className="hidden sm:flex gap-4">
//                   {!proposal ? (
//                     <button
//                       onClick={handleSubmitProposal}
//                       className="bg-[#5B2D91] text-white px-6 py-3 rounded-full text-[14px] font-semibold hover:bg-[#4a2373] transition-colors"
//                     >
//                       Submit Proposal
//                     </button>
//                   ) : isRevoked ? (
//                     <button
//                       ref={changeTermsRef}
//                       onClick={handleChangeTerms}
//                       className="bg-[#5B2D91] text-white px-6 py-3 rounded-full text-[14px] font-semibold border-2 border-[#5B2D91] transition-colors hover:bg-[#4a2373] focus:ring-2 focus:ring-[#5B2D91]"
//                     >
//                       Change terms
//                     </button>
//                   ) : (
//                     <button
//                       onClick={handleChangeTerms}
//                       className="bg-[#5B2D91] text-white px-6 py-3 rounded-full text-[14px] font-semibold hover:bg-[#4a2373] transition-colors"
//                     >
//                       Change terms
//                     </button>
//                   )}

//                   {proposal && !isRevoked && (
//                     <button
//                       onClick={handleRevokeClick}
//                       className="text-[14px] font-semibold px-6 py-3 rounded-full border border-gray-600 text-gray-800 transition-colors hover:bg-[#5B2D91] hover:text-white hover:border-[#5B2D91]"
//                     >
//                       Revoke proposal
//                     </button>
//                   )}

//                   {isRevoked && (
//                     <button
//                       className="text-[14px] font-semibold px-6 py-3 rounded-full text-gray-500 bg-gray-100 cursor-not-allowed border border-gray-300"
//                       disabled
//                     >
//                       Proposal Revoked
//                     </button>
//                   )}
//                 </div>
//               </div>

//               <div className="hidden sm:block h-[1px] bg-gray-200 mt-15"></div>

//               {/* Messaging Section */}
//               <div className="lg:block">
//                 <div className="mt-3 mb-6 ml-5 text-center text-black">
//                   <p className="font-medium">
//                     Start conversations
//                     {otherUserOnline && (
//                       <span className="ml-2 inline-flex items-center">
//                         <span className="w-2 h-2 bg-green-500 rounded-full"></span>
//                         <span className="text-xs text-green-600 ml-1">Online</span>
//                       </span>
//                     )}
//                     {otherUserTyping && (
//                       <span className="ml-2 text-xs text-purple-600">typing...</span>
//                     )}
//                   </p>
//                 </div>
//                 <div className="w-full flex items-center gap-4 px-4 py-3 bg-white rounded-full border border-gray-200">
//                   <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer">
//                     <rect x="3" y="3" width="18" height="18" rx="4" />
//                     <circle cx="8.5" cy="8.5" r="1.5" />
//                     <path d="M21 15l-5-5L5 21" />
//                   </svg>
//                   <svg width="40" height="28" viewBox="0 0 40 28" fill="none" className="cursor-pointer">
//                     <rect x="1" y="1" width="38" height="26" rx="6" stroke="#7C3AED" strokeWidth="2" />
//                     <text x="9" y="19" fill="#7C3AED" fontSize="12" fontWeight="700" fontFamily="Arial, sans-serif">GIF</text>
//                   </svg>
//                   <div className="relative flex-1 h-[48px]">
//                     <div className="absolute inset-0 bg-gray-100 rounded-full"></div>
//                     <input
//                       type="text"
//                       placeholder={chatStarted ? "Reply..." : "Type your message..."}
//                       value={messageInput}
//                       onChange={handleMessageInputChange}
//                       onKeyDown={handleKeyPress}
//                       className="relative z-10 w-full h-[48px] bg-transparent pl-5 pr-4 text-[14px] text-gray-900 placeholder:text-[#9CA3AF] focus:outline-none"
//                     />
//                   </div>
//                   <button
//                     onClick={handleSendMessage}
//                     disabled={isSendingMessage || (!messageInput.trim() && !lastMessageSent)}
//                     className={`cursor-pointer ${isSendingMessage ? 'opacity-50' : ''}`}
//                   >
//                     <svg width="28" height="28" viewBox="0 0 24 24" fill={messageInput.trim() ? "#7C3AED" : "#9CA3AF"} className="transition-colors">
//                       <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
//                     </svg>
//                   </button>
//                 </div>
//                 {lastMessageSent && (
//                   <div className="mt-2 text-xs text-gray-500 text-center">
//                     Last message sent: {new Date(lastMessageSent.timestamp).toLocaleTimeString()}
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="hidden lg:block w-[1px] bg-gray-200"></div>

//             {/* ================= RIGHT SIDEBAR - EXACT SAME AS UX PAGE ================= */}
//             <div className="w-full lg:w-[340px] px-6 lg:px-8 py-8">
//               <p className="hidden lg:block text-[13px] text-[#2F3A40] leading-[24px] mb-6">
//                 Required Connects to submit a <br />proposal: <b>{job?.required_connects || 6}</b><br />
//                 Available Connects: <b>{userConnects || 0}</b>
//               </p>
//               <div className="hidden lg:block h-[1px] bg-gray-200 mb-6 w-full"></div>

//               <h3 className="text-[16px] sm:text-[18px] font-semibold mb-4">About the client</h3>

//               <div className="grid grid-cols-2 sm:grid-cols-1 gap-4 sm:gap-6">
//                 {/* LEFT COLUMN - EXACT SAME AS UX PAGE */}
//                 <div className="order-1 sm:order-1">
//                   <div className="space-y-2 sm:space-y-3 text-[13px] sm:text-[14px] text-[#3A3A3A] mb-4">
//                     {/* LOCATION */}
//                     <div className="flex items-center gap-2">
//                       <CountryFlag
//                         countryCode={creatorStats.country_code || creator?.country_code}
//                         country={creatorStats.country || creator?.country}
//                       />
//                       <span>{creatorStats.city || creator?.city || creatorStats.country || creator?.country || "Remote"}</span>
//                     </div>

//                     {/* TIME */}
//                     <div className="flex items-center gap-2">
//                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//                         <circle cx="12" cy="12" r="9" stroke="#6B6B6B" strokeWidth="1.5" />
//                         <path d="M12 7V12L15 14" stroke="#6B6B6B" strokeWidth="1.5" />
//                       </svg>
//                       <span>Local time unknown</span>
//                     </div>

//                     {/* JOINED */}
//                     <div className="flex items-center gap-2">
//                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//                         <path d="M6 21h12M9 17V5l3-2 3 2v12" stroke="#6B6B6B" strokeWidth="1.5" />
//                       </svg>
//                       <span>Joined {creator?.created_at ? formatTimeAgo(creator.created_at) : 'Recently'}</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* RIGHT COLUMN – STATS - EXACT SAME AS UX PAGE */}
//                 <div className="order-2 sm:order-2 space-y-1.5 sm:space-y-2 text-[13px] sm:text-[14px] text-[#3A3A3A]">
//                   <p className="font-semibold">{creatorStats.city || creator?.city || creatorStats.country || creator?.country || "Remote"}</p>
//                   <p className="font-semibold">{creatorStats.total_jobs_posted || 0} jobs posted</p>
//                   <p className="text-[#6B6B6B]">{creatorStats.hire_rate || 0}% hire rate</p>
//                   <p className="font-semibold">{formatCurrency(creatorStats.total_spent)}+ total spent</p>
//                   <p className="text-[#6B6B6B]">{creatorStats.total_hires || 0} hires</p>
//                   <p className="font-semibold">${creatorStats.avg_hourly_rate || 0}/hr avg hourly rate</p>
//                   <p className="text-[#6B6B6B]">{creatorStats.total_hours || 0} hours</p>
//                   <p className="font-semibold">{creatorStats.company_size || 'Unknown'} company</p>
//                   <p className="text-[#6B6B6B]">Member since {formatMemberSince(creatorStats.member_since || creator?.created_at)}</p>
//                 </div>

//                 {/* RATING - EXACT SAME AS UX PAGE */}
//                 <div className="order-2 sm:order-3 col-span-1">
//                   <div className="-mt-48 sm:mt-4">
//                     <div className="flex gap-[2px] text-purple-600 text-[16px] sm:text-[18px]">
//                       {"★".repeat(Math.floor(creatorStats.rating || 0))}
//                       {"☆".repeat(5 - Math.floor(creatorStats.rating || 0))}
//                     </div>
//                     <span className="text-[13px] sm:text-[14px] text-[#6B6B6B]">
//                       {creatorStats.rating || 0}/5 ({creatorStats.reviews || 0} Reviews)
//                     </span>
//                   </div>

//                   {/* DIVIDER */}
//                   <div className="hidden sm:block h-[1px] bg-gray-200 my-6"></div>

//                   {/* VERIFICATIONS - EXACT SAME AS UX PAGE */}
//                   <div className="space-y-3 sm:space-y-4 text-[13px] sm:text-[14px] text-[#2b2b2b]">
//                     {/* Identity */}
//                     {/* <div className="flex items-center gap-3">
//                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                         <circle cx="12" cy="8" r="4" stroke={creatorStats.identity_verified ? "#5B2D91" : "#9CA3AF"} strokeWidth="1.5" />
//                         <path d="M4 20c0-4 16-4 16 0" stroke={creatorStats.identity_verified ? "#5B2D91" : "#9CA3AF"} strokeWidth="1.5" />
//                       </svg>
//                       <span className={`font-semibold ${creatorStats.identity_verified ? 'text-[#5B2D91]' : 'text-gray-400'}`}>
//                         {creatorStats.identity_verified ? 'Identity verified' : 'Identity not verified'}
//                       </span>
//                     </div> */}

//                     {/* Payment */}
//                     {/* <div className="flex items-center gap-3">
//                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                         <path d="M12 2v20M7 7h10M7 17h10" stroke={creatorStats.payment_verified ? "#5B2D91" : "#9CA3AF"} strokeWidth="1.5" strokeLinecap="round" />
//                       </svg>
//                       <span className={`font-semibold ${creatorStats.payment_verified ? 'text-[#5B2D91]' : 'text-gray-400'}`}>
//                         {creatorStats.payment_verified ? 'Payment Verified' : 'Payment not verified'}
//                       </span>
//                     </div> */}

//                     {/* Phone */}
//                     <div className="flex items-center gap-3">
//                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                         <path d="M22 16.9v3a2 2 0 0 1-2.2 2 A19.8 19.8 0 0 1 3 5.2 A2 2 0 0 1 5 3h3 a2 2 0 0 1 2 1.7l.5 2.5 a2 2 0 0 1-.6 1.8l-1.2 1.2 a16 16 0 0 0 6.6 6.6l1.2-1.2 a2 2 0 0 1 1.8-.6l2.5.5 a2 2 0 0 1 1.7 2.2Z"
//                           stroke={creatorStats.phone_verified ? "#5B2D91" : "#9CA3AF"}
//                           strokeWidth="1.5"
//                         />
//                       </svg>
//                       <span className={`font-semibold ${creatorStats.phone_verified ? 'text-[#5B2D91]' : 'text-gray-400'}`}>
//                         {creatorStats.phone_verified ? 'Phone Verified' : 'Phone not verified'}
//                       </span>
//                     </div>

//                     {/* Email */}
//                     <div className="flex items-center gap-3">
//                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                         <rect x="3" y="5" width="18" height="14" rx="2"
//                           stroke={creatorStats.email_verified ? "#5B2D91" : "#9CA3AF"}
//                           strokeWidth="1.5"
//                         />
//                         <path d="M3 7l9 6 9-6"
//                           stroke={creatorStats.email_verified ? "#5B2D91" : "#9CA3AF"}
//                           strokeWidth="1.5"
//                         />
//                       </svg>
//                       <span className={`font-semibold ${creatorStats.email_verified ? 'text-[#5B2D91]' : 'text-gray-400'}`}>
//                         {creatorStats.email_verified ? 'Email Verified' : 'Email not verified'}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="block sm:hidden h-[1px] bg-gray-200 my-4 w-full" />

//             {/* Mobile Messaging Section */}
//             <div className="lg:hidden border-t border-gray-200 px-4 py-5">
//               <p className="text-center text-[14px] font-medium text-black mb-3">
//                 Start conversations
//                 {otherUserOnline && (
//                   <span className="ml-2 inline-flex items-center">
//                     <span className="w-2 h-2 bg-green-500 rounded-full"></span>
//                     <span className="text-xs text-green-600 ml-1">Online</span>
//                   </span>
//                 )}
//                 {otherUserTyping && (
//                   <span className="ml-2 text-xs text-purple-600">typing...</span>
//                 )}
//               </p>
//               <div className="w-full flex items-center gap-3">
//                 <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer shrink-0">
//                   <rect x="3" y="3" width="18" height="18" rx="4" />
//                   <circle cx="8.5" cy="8.5" r="1.5" />
//                   <path d="M21 15l-5-5L5 21" />
//                 </svg>
//                 <svg width="36" height="26" viewBox="0 0 40 28" fill="none" className="cursor-pointer shrink-0">
//                   <rect x="1" y="1" width="38" height="26" rx="6" stroke="#7C3AED" strokeWidth="2" />
//                   <text x="9" y="19" fill="#7C3AED" fontSize="12" fontWeight="700" fontFamily="Arial, sans-serif">GIF</text>
//                 </svg>
//                 <div className="relative flex-1 h-[44px]">
//                   <div className="absolute inset-0 bg-gray-100 rounded-full"></div>
//                   <input
//                     type="text"
//                     placeholder={chatStarted ? "Reply..." : "Type your message..."}
//                     value={messageInput}
//                     onChange={handleMessageInputChange}
//                     onKeyPress={handleKeyPress}
//                     className="relative z-10 w-full h-[44px] bg-transparent pl-4 pr-3 text-[14px] text-gray-900 placeholder:text-[#9CA3AF] focus:outline-none"
//                   />
//                 </div>
//                 <button
//                   onClick={handleSendMessage}
//                   disabled={isSendingMessage || (!messageInput.trim() && !lastMessageSent)}
//                   className="cursor-pointer shrink-0"
//                 >
//                   <svg width="26" height="26" viewBox="0 0 24 24" fill={messageInput.trim() ? "#7C3AED" : "#9CA3AF"}>
//                     <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
//                   </svg>
//                 </button>
//               </div>
//               {lastMessageSent && (
//                 <div className="mt-2 text-xs text-gray-500 text-center">
//                   Last message sent: {new Date(lastMessageSent.timestamp).toLocaleTimeString()}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {showPopup && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
//           <div className="absolute inset-0 bg-black/50"></div>
//           <div className="relative bg-white rounded-2xl max-w-sm w-full text-center shadow-xl">
//             <div className="flex justify-center mt-6">
//               <img
//                 src={PopupImage}
//                 alt="Cancel Proposal"
//                 className="w-20 h-20 rounded-full object-cover"
//               />
//             </div>
//             <div className="p-6">
//               <p className="text-[16px] font-medium text-gray-900 mt-4">
//                 Are you sure you want to Cancel Proposal?
//               </p>
//               <div className="flex justify-center gap-4 mt-8">
//                 <button
//                   onClick={handleCancelClick}
//                   className="px-8 py-2 rounded-full border border-gray-300 text-gray-800 font-medium transition hover:bg-[#5B2D91] hover:text-white hover:border-[#5B2D91]"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleConfirmRevoke}
//                   className="px-8 py-2 rounded-full border border-[#5B2D91] text-[#5B2D91] bg-white font-medium transition hover:bg-[#5B2D91] hover:text-white"
//                 >
//                   Reject
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="mt-4">
//         <Footer />
//       </div>
//     </div>
//   );
// }




// // 2 code 
// import React, { useState, useRef, useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { useUser } from "../../contexts/userContext";
// import api from "../../utils/axiosConfig";
// import TopBanner from "../../assets/Colabwork/banner.png";
// import PopupImage from "../../assets/Landing/Card1.png";
// import Footer from "../../component/Footer";
// import ColHeader from "../../component/ColHeader";
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// export default function Proposal() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { userData } = useUser();

//   const [showPopup, setShowPopup] = useState(false);
//   const [isRevoked, setIsRevoked] = useState(false);
//   const [isHovering, setIsHovering] = useState(false);
//   const changeTermsRef = useRef(null);

//   // State for job and proposal data
//   const [job, setJob] = useState(null);
//   const [creator, setCreator] = useState(null);
//   const [proposal, setProposal] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // State for creator stats - EXACT SAME AS UX PAGE
//   const [creatorStats, setCreatorStats] = useState({
//     total_jobs_posted: 0,
//     hire_rate: 0,
//     total_spent: 0,
//     total_hires: 0,
//     avg_hourly_rate: 0,
//     total_hours: 0,
//     company_size: '',
//     member_since: null,
//     rating: 0,
//     reviews: 0,
//     phone_verified: false,
//     email_verified: false,
//     country: null,
//     city: null,
//     country_code: null,
//     local_time: '4:45 PM',
//     time_postfix: 'pm'
//   });

//   // Messaging state
//   const [messageInput, setMessageInput] = useState("");
//   const [isSendingMessage, setIsSendingMessage] = useState(false);
//   const [chatStarted, setChatStarted] = useState(false);
//   const [conversationId, setConversationId] = useState(null);
//   const [otherUserTyping, setOtherUserTyping] = useState(false);
//   const [otherUserOnline, setOtherUserOnline] = useState(false);
//   const [lastMessageSent, setLastMessageSent] = useState(null);

//   // ==================== GET CONNECTS FROM CONTEXT - FIXED ====================
//   const [userConnects, setUserConnects] = useState(0);

//   // Get connects from userData context - EXACT SAME AS UX PAGE
//   const getUserConnects = () => {
//     if (userData?.connects) {
//       setUserConnects(userData.connects);
//     } else {
//       setUserConnects(50); // Default fallback
//     }
//   };

//   // Safe IDs with proper fallbacks
//   const jobIdSafe = job?.id || location.state?.jobId || location.state?.job?.id || null;

//   const creatorIdSafe = job?.employer_id ||
//     location.state?.job?.employer_id ||
//     location.state?.creatorId ||
//     creator?.id ||
//     null;

//   useEffect(() => {
//     getUserConnects();
//   }, [userData]);

//   // ==================== FIXED FETCH CREATOR STATS - REMOVED 404 ENDPOINT ====================
//   const fetchCreatorStats = async (creatorId) => {
//     if (!creatorId) return;

//     try {
//       // Only fetch available endpoints - removed the 404 one

//       // Fetch creator's reviews and rating if available
//       try {
//         const reviewsResponse = await api.get(`/creator/reviews/${creatorId}`);
//         const reviews = reviewsResponse.data || {};
//         setCreatorStats(prev => ({
//           ...prev,
//           rating: reviews.avg_rating || 0,
//           reviews: reviews.total_reviews || 0,
//         }));
//       } catch (reviewError) {
//         console.log('Reviews endpoint not available, using defaults');
//       }

//       // Fetch creator's verification status
//       try {
//         const verificationResponse = await api.get(`/auth/user/verification/${creatorId}`);
//         const verification = verificationResponse.data || {};
//         setCreatorStats(prev => ({
//           ...prev,
//           phone_verified: verification.phone_verified || false,
//           email_verified: verification.email_verified || false,
//         }));
//       } catch (verificationError) {
//         console.log('Verification endpoint not available, using defaults');
//       }

//       // Set basic stats from creator object
//       if (creator) {
//         setCreatorStats(prev => ({
//           ...prev,
//           country: creator.country || null,
//           city: creator.city || null,
//           country_code: creator.country_code || null,
//           member_since: creator.created_at || null,
//           total_jobs_posted: creator.total_jobs || 0,
//         }));
//       }

//     } catch (error) {
//       console.error('Error fetching creator stats:', error);
//     }
//   };

//   // Fetch job details - EXACT SAME AS UX PAGE
//   const fetchJobDetails = async (jobId, proposalId) => {
//     setLoading(true);
//     try {
//       const response = await api.get(`/collaborator/jobs/${jobId}`);
//       const jobData = response.data || {};
//       const creatorData = jobData.creator || {};

//       setJob(jobData);
//       setCreator(creatorData);

//       // Fetch creator stats
//       if (creatorData.id) {
//         await fetchCreatorStats(creatorData.id);
//       }

//       if (location.state?.proposal) {
//         setProposal(location.state.proposal);
//       } else if (proposalId) {
//         const savedProposal = localStorage.getItem('currentProposal');
//         if (savedProposal) {
//           setProposal(JSON.parse(savedProposal));
//         }
//       }

//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching job details:', error);
//       setError('Failed to load job details');
//       toast.error('Failed to load job details');
//       setLoading(false);
//     }
//   };

//   // ==================== PROPOSAL SUBMISSION - FIXED ====================
//   const handleSubmitProposal = async () => {
//     if (!userData?.id) {
//       toast.error('Please login to submit a proposal');
//       navigate('/login');
//       return;
//     }

//     if (!job?.id) {
//       toast.error('Job information is missing');
//       return;
//     }

//     try {
//       const formData = new FormData();
//       formData.append('job_id', job.id);
//       formData.append('freelancer_id', userData.id);
//       formData.append('payment_type', 'project');
//       formData.append('bid_amount', job.budget_from || job.budget_to || 100);
//       formData.append('duration', '30 days');
//       formData.append('cover_letter', 'I am interested in this project. I have the required skills and experience.');
//       formData.append('skills', job.skills_required?.join(', ') || 'Web Design, Mockup');
//       formData.append('expertise', 'Intermediate');

//       const response = await api.post('/proposals/CreateProposal', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       });

//       if (response.data && response.data.proposal_id) {
//         toast.success('Proposal submitted successfully!');

//         // Store proposal data
//         const proposalData = {
//           id: response.data.proposal_id,
//           bid_amount: job.budget_from || job.budget_to || 100,
//           status: 'submitted',
//           created_at: new Date().toISOString()
//         };

//         setProposal(proposalData);
//         localStorage.setItem('currentProposal', JSON.stringify(proposalData));
//         localStorage.setItem('currentJob', JSON.stringify(job));

//         // Navigate to the proposal page with the submitted proposal
//         navigate('/proposal', {
//           state: {
//             job: job,
//             proposal: proposalData,
//             jobId: job.id,
//             proposalId: response.data.proposal_id
//           },
//           replace: true
//         });
//       }
//     } catch (error) {
//       console.error('Error submitting proposal:', error);

//       if (error.response?.status === 400) {
//         if (error.response.data?.detail?.includes('already applied')) {
//           toast.error('You have already applied for this job');
//         } else {
//           toast.error(error.response.data?.detail || 'Failed to submit proposal');
//         }
//       } else {
//         toast.error('Failed to submit proposal. Please try again.');
//       }
//     }
//   };

//   // ==================== COUNTRY FLAG - EXACT SAME AS COL HOME ====================
//   const CountryFlag = ({ countryCode, country }) => {
//     if (!countryCode) {
//       return (
//         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="1.5">
//           <circle cx="12" cy="12" r="9" stroke="#6B6B6B" strokeWidth="1.5" />
//           <path d="M12 8v4l3 3" stroke="#6B6B6B" strokeWidth="1.5" />
//         </svg>
//       );
//     }

//     return (
//       <img
//         src={`https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`}
//         alt={country}
//         title={country}
//         className="w-[18px] h-[12px] rounded-[4px] object-cover"
//         onError={(e) => {
//           e.target.onerror = null;
//           e.target.src = "https://flagcdn.com/w20/us.png";
//         }}
//       />
//     );
//   };

//   // Get data from navigation state
//   useEffect(() => {
//     if (location.state) {
//       const { job: jobData, proposal: proposalData, jobId, proposalId } = location.state;

//       if (jobData) {
//         setJob(jobData);
//         setCreator(jobData.creator || {});
//         setProposal(proposalData || null);

//         // Fetch creator stats if we have creator ID
//         const creatorId = jobData.employer_id || jobData.creator?.id;
//         if (creatorId) {
//           fetchCreatorStats(creatorId);
//         }

//         setLoading(false);
//       }
//       else if (jobId) {
//         fetchJobDetails(jobId, proposalId);
//       }
//       else {
//         const savedProposal = localStorage.getItem('currentProposal');
//         const savedJob = localStorage.getItem('currentJob');

//         if (savedProposal && savedJob) {
//           try {
//             const parsedJob = JSON.parse(savedJob);
//             setProposal(JSON.parse(savedProposal));
//             setJob(parsedJob);
//             setCreator(parsedJob.creator || {});

//             const creatorId = parsedJob.employer_id || parsedJob.creator?.id;
//             if (creatorId) {
//               fetchCreatorStats(creatorId);
//             }

//             setLoading(false);
//           } catch (e) {
//             setError('No job information found');
//             toast.error('No job information found');
//           }
//         } else {
//           // If no proposal exists, show submit proposal button
//           setLoading(false);
//         }
//       }
//     } else {
//       const savedProposal = localStorage.getItem('currentProposal');
//       const savedJob = localStorage.getItem('currentJob');

//       if (savedProposal && savedJob) {
//         try {
//           const parsedJob = JSON.parse(savedJob);
//           setProposal(JSON.parse(savedProposal));
//           setJob(parsedJob);
//           setCreator(parsedJob.creator || {});

//           const creatorId = parsedJob.employer_id || parsedJob.creator?.id;
//           if (creatorId) {
//             fetchCreatorStats(creatorId);
//           }

//           setLoading(false);
//         } catch (e) {
//           setError('No job information found');
//           toast.error('No job information found');
//         }
//       } else {
//         // If no proposal exists, show submit proposal button
//         setLoading(false);
//       }
//     }
//   }, [location.state]);

//   // ==================== FIXED MESSAGING FUNCTIONS ====================
//   const checkConversation = async () => {
//     if (!userData?.id || !creatorIdSafe) return;

//     try {
//       const response = await api.get(`/message/conversation/${userData.id}/${creatorIdSafe}`);
//       setConversationId(response.data.conversation_id);
//       setOtherUserOnline(response.data.other_user_online || false);
//       setOtherUserTyping(response.data.other_user_typing || false);

//       if (response.data.conversation_id) {
//         setChatStarted(true);
//       }
//     } catch (error) {
//       console.error('Error checking conversation:', error);
//     }
//   };

//   useEffect(() => {
//     if (userData?.id && creatorIdSafe) {
//       checkConversation();

//       // Set up typing status polling
//       const typingInterval = setInterval(checkConversation, 3000);
//       return () => clearInterval(typingInterval);
//     }
//   }, [userData, creatorIdSafe]);

//   const sendTypingStatus = async (isTyping) => {
//     if (!userData?.id || !creatorIdSafe) return;

//     try {
//       await api.post('/message/typing', {
//         user_id: userData.id,
//         chat_with: creatorIdSafe,
//         is_typing: isTyping
//       });
//     } catch (error) {
//       console.error('Error sending typing status:', error);
//     }
//   };

//   const handleMessageInputChange = (e) => {
//     setMessageInput(e.target.value);
//     sendTypingStatus(e.target.value.length > 0);
//   };

//   // ==================== FIXED SEND MESSAGE FUNCTION ====================
//   const handleSendMessage = async () => {
//     if (!messageInput.trim()) return;

//     // Get the receiver ID from multiple possible sources
//     const receiverId = creator?.id || job?.employer_id || creatorIdSafe;

//     console.log("=== SENDING MESSAGE ===");
//     console.log("userData?.id:", userData?.id);
//     console.log("jobIdSafe:", jobIdSafe);
//     console.log("receiverId from sources:", receiverId);
//     console.log("creator:", creator);
//     console.log("job:", job);

//     if (!userData?.id || !jobIdSafe || !receiverId) {
//       toast.error("Missing required data");
//       console.log("Missing data:", {
//         userId: userData?.id,
//         jobId: jobIdSafe,
//         receiverId: receiverId,
//       });
//       return;
//     }

//     setIsSendingMessage(true);

//     try {
//       // Create URLSearchParams instead of JSON or FormData
//       // This is what the backend expects for form-urlencoded data
//       const formData = new URLSearchParams();
//       formData.append('job_id', String(jobIdSafe));
//       formData.append('sender_id', String(userData.id));
//       formData.append('content', messageInput.trim());

//       console.log("Sending message with URLSearchParams:", {
//         job_id: String(jobIdSafe),
//         sender_id: String(userData.id),
//         content: messageInput.trim()
//       });

//       const response = await api.post("/message/send-for-proposal", formData, {
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded'
//         }
//       });

//       console.log("Message send response:", response.data);

//       // Store the last message sent
//       setLastMessageSent({
//         content: messageInput.trim(),
//         timestamp: new Date().toISOString()
//       });

//       // Clear input
//       setMessageInput("");

//       // Show success message
//       toast.success("Message sent successfully!");

//       // Navigate to message page with the correct data
//       // Use the receiver_id from the response if available, otherwise use our receiverId
//       const targetReceiverId = response.data.receiver_id || receiverId;

//       console.log("Navigating to /message with:", {
//         jobId: jobIdSafe,
//         receiverId: targetReceiverId,
//       });

//       // Short delay to ensure the message is saved
//       setTimeout(() => {
//         navigate("/message", {
//           state: {
//             jobId: jobIdSafe,
//             receiverId: targetReceiverId,
//           },
//         });
//       }, 500);

//     } catch (error) {
//       console.error("Message send failed", error);
//       console.error("Error response:", error.response?.data);

//       // Show more specific error message
//       if (error.response?.status === 422) {
//         const errorDetail = error.response.data?.detail;
//         if (Array.isArray(errorDetail)) {
//           // Handle validation errors
//           const errorMessages = errorDetail.map(err => 
//             `${err.loc?.join('.')}: ${err.msg}`
//           ).join(', ');
//           toast.error(`Validation error: ${errorMessages}`);
//         } else {
//           toast.error("Invalid data format. Please try again.");
//         }
//       } else {
//         toast.error(error.response?.data?.detail || "Failed to send message");
//       }
//     } finally {
//       setIsSendingMessage(false);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   const handleRevokeClick = () => {
//     setShowPopup(true);
//   };

//   const handleCancelClick = () => {
//     setShowPopup(false);
//   };

//   const handleConfirmRevoke = async () => {
//     if (!proposal?.id) {
//       toast.error('No proposal to revoke');
//       return;
//     }

//     try {
//       // Use the correct endpoint from API documentation
//       await api.delete(`/proposals/WithdrawProposal/${proposal.id}`);

//       setIsRevoked(true);
//       setShowPopup(false);
//       toast.success('Proposal revoked successfully');
//       setProposal(prev => ({ ...prev, status: 'revoked' }));

//       // Update localStorage
//       const updatedProposal = { ...proposal, status: 'revoked' };
//       localStorage.setItem('currentProposal', JSON.stringify(updatedProposal));
//     } catch (error) {
//       console.error('Error revoking proposal:', error);

//       // Check if it's a 404 error (endpoint might be different case)
//       if (error.response?.status === 404) {
//         // Try alternative case variations
//         try {
//           // Try with different case patterns
//           await api.delete(`/proposals/withdraw-proposal/${proposal.id}`);
//           setIsRevoked(true);
//           setShowPopup(false);
//           toast.success('Proposal revoked successfully');
//           setProposal(prev => ({ ...prev, status: 'revoked' }));
//           const updatedProposal = { ...proposal, status: 'revoked' };
//           localStorage.setItem('currentProposal', JSON.stringify(updatedProposal));
//           return;
//         } catch (secondError) {
//           console.error('Second attempt also failed:', secondError);
//           toast.error('Failed to revoke proposal. Please try again.');
//         }
//       } else {
//         toast.error('Failed to revoke proposal. Please try again.');
//       }
//     }
//   };

//   const handleChangeTerms = () => {
//     navigate('/Uploadux', {
//       state: {
//         jobId: job?.id,
//         jobTitle: job?.title,
//         budget: job?.budget,
//         budget_from: job?.budget_from,
//         budget_to: job?.budget_to,
//         budget_type: job?.budget_type,
//         proposalData: proposal,
//         isEditing: true,
//         job: job
//       }
//     });
//   };

//   useEffect(() => {
//     if (isRevoked && changeTermsRef.current) {
//       changeTermsRef.current.focus();
//     }
//   }, [isRevoked]);

//   // ==================== FORMATTING FUNCTIONS - EXACT SAME AS UX PAGE ====================

//   // Format time ago - EXACT SAME AS UX PAGE
//   const formatTimeAgo = (dateString) => {
//     if (!dateString) return "Recently";

//     try {
//       const date = new Date(dateString);
//       const now = new Date();
//       const diffMs = now - date;
//       const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
//       const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

//       if (diffHours < 1) {
//         return "Recently";
//       } else if (diffHours < 24) {
//         return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
//       } else if (diffDays === 1) {
//         return "1 day ago";
//       } else if (diffDays < 7) {
//         return `${diffDays} days ago`;
//       } else {
//         return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
//       }
//     } catch (error) {
//       return "Recently";
//     }
//   };

//   // Format budget display - EXACT SAME AS UX PAGE
//   const formatBudget = () => {
//     if (!job) return '$0.00';

//     if (job.budget_from && job.budget_to) {
//       return `$${job.budget_from} - $${job.budget_to}`;
//     } else if (job.budget_from) {
//       return `$${job.budget_from}`;
//     } else if (job.budget_to) {
//       return `$${job.budget_to}`;
//     }
//     return '$0.00';
//   };

//   // Format proposal amount - FIXED TO USE REAL BUDGET DATA
//   const formatProposalAmount = () => {
//     if (!proposal) {
//       // If no proposal yet, show job budget
//       return formatBudget() + ' USD';
//     }

//     if (proposal.bid_amount) {
//       return `$${proposal.bid_amount} USD`;
//     }
//     if (proposal.amount) {
//       return `$${proposal.amount} USD`;
//     }
//     // Default to job budget
//     return formatBudget() + ' USD';
//   };

//   // Format bidding ends time - EXACT SAME AS UX PAGE
//   const formatBiddingEnds = () => {
//     if (!job?.bidding_ends_at) return "Bidding ends in 6 days";

//     try {
//       const endDate = new Date(job.bidding_ends_at);
//       const now = new Date();
//       const diffMs = endDate - now;
//       const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

//       if (diffDays > 0) {
//         return `Bidding ends in ${diffDays} days`;
//       } else {
//         return "Bidding ends soon";
//       }
//     } catch (error) {
//       return "Bidding ends in 6 days";
//     }
//   };

//   // Format currency - EXACT SAME AS UX PAGE
//   const formatCurrency = (amount) => {
//     if (!amount) return '$0';
//     if (amount >= 1000) {
//       return `$${Math.round(amount / 1000)}k+`;
//     }
//     return `$${amount}`;
//   };

//   // Format member since date - EXACT SAME AS UX PAGE
//   const formatMemberSince = (dateString) => {
//     if (!dateString) return 'Jan 22, 2020';
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
//     } catch {
//       return 'Jan 22, 2020';
//     }
//   };

//   // Handle back button
//   const handleBack = () => {
//     if (location.state?.from) {
//       navigate(location.state.from);
//     } else {
//       navigate(-1);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="w-full bg-[#F5F5F5] min-h-screen">
//         <div className="relative w-full h-[420px] md:h-[520px] xl:h-[582px]">
//           <img src={TopBanner} alt="banner" className="absolute inset-0 w-full h-full object-cover blur-[1px]" />
//           <div className="absolute top-0 left-0 w-full z-50">
//             <ColHeader />
//           </div>
//         </div>
//         <div className="min-h-screen flex justify-center items-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   if (error || !job) {
//     return (
//       <div className="w-full bg-[#F5F5F5] min-h-screen">
//         <div className="relative w-full h-[420px] md:h-[520px] xl:h-[582px]">
//           <img src={TopBanner} alt="banner" className="absolute inset-0 w-full h-full object-cover blur-[1px]" />
//           <div className="absolute top-0 left-0 w-full z-50">
//             <ColHeader />
//           </div>
//         </div>
//         <div className="min-h-screen flex justify-center items-center px-4">
//           <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
//             <div className="text-gray-400 mb-4">
//               <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//               </svg>
//             </div>
//             <h3 className="text-lg font-semibold text-gray-600 mb-2">Error Loading Job</h3>
//             <p className="text-gray-500 mb-6">{error || 'Job not found'}</p>
//             <button
//               onClick={() => navigate('/colhome')}
//               className="px-8 py-3 bg-[#5B2D91] text-white rounded-full hover:bg-[#4a2373] transition-colors font-semibold"
//             >
//               Go back to jobs
//             </button>
//           </div>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   return (
//     <div className="w-full bg-[#F5F5F5] min-h-screen">
//       <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} />

//       <div className="relative w-full h-[420px] md:h-[520px] xl:h-[582px]">
//         <img src={TopBanner} alt="banner" className="absolute inset-0 w-full h-full object-cover blur-[1px]" />
//         <div className="absolute top-0 left-0 w-full z-50">
//           <ColHeader />
//         </div>
//       </div>

//       <div className="min-h-screen flex justify-center px-4 sm:px-0">
//         <div className="relative w-full max-w-[1200px] 2xl:max-w-[1320px] mx-5 sm:mx-auto -mt-[240px] lg:-mt-[300px] bg-white border border-black rounded-none">
//           <div className="hidden sm:block border-b border-gray-200 px-6 md:px-8 pt-4 pb-0">
//             <button
//               onClick={handleBack}
//               className="flex items-center text-[16px] text-[#111111] mb-4 hover:text-[#5B2D91] transition-colors"
//             >
//               <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
//                 <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//               </svg>
//               <span>Back</span>
//             </button>
//             <div className="h-[1px] bg-gray-200 w-full"></div>
//           </div>

//           <div className="flex flex-col lg:flex-row">
//             <div className="flex-1 px-4 md:px-8 py-3 sm:py-6">
//               <div className="flex justify-between items-start sm:items-start mb-1 sm:mb-3">
//                 <div>
//                   <h2 className="text-[14px] sm:text-[20px] font-semibold leading-tight tracking-tight whitespace-normal pr-4">
//                     {job?.title || "Looking for a UX Web Designer"}
//                   </h2>
//                   <p className="text-sm text-gray-500 mt-1 sm:hidden">
//                     {formatTimeAgo(job?.created_at)}
//                   </p>
//                 </div>
//                 <div className="mt-8 sm:mt-0">
//                   <div className="flex flex-col items-start sm:items-end text-left sm:text-right leading-tight">
//                     <p className="text-[12px] sm:text-[14px] font-semibold text-black whitespace-nowrap">
//                       {formatProposalAmount()}
//                     </p>
//                     <p className="text-[9px] sm:text-[10px] uppercase tracking-wide text-gray-500 whitespace-nowrap sm:mt-[2px]">
//                       {formatBiddingEnds()}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <p className="hidden sm:block text-sm text-gray-500 mb-5">
//                 {formatTimeAgo(job?.created_at)}
//               </p>

//               <p className="text-[14px] leading-[22px] text-gray-700 mt-4 sm:mt-9 mb-4 whitespace-pre-line">
//                 {job?.description || "No description available"}
//               </p>

//               <p className="text-[14px] font-semibold mb-2">The key areas are -</p>
//               <div className="text-[14px] text-gray-700 space-y-1 mb-4">
//                 {job?.key_areas?.map((area, index) => (
//                   <p key={index}>+ {area}</p>
//                 ))}
//                 {(!job?.key_areas || job.key_areas.length === 0) && (
//                   <>
//                     <p>+ Digital Transformation work</p>
//                     <p>+ Platform modernization</p>
//                     <p>+ Maintenance and support</p>
//                     <p>+ Utility tool development</p>
//                     <p>+ Secure Data migration</p>
//                     <p>+ Round the clock support</p>
//                     <p>+ IT Consultancy</p>
//                   </>
//                 )}
//               </div>

//               <p className="text-[14px] text-gray-700 mb-6">
//                 Contents development is included in the job which should be finalized after review with me.
//               </p>

//               <div className="h-[1px] bg-gray-200 mb-4"></div>

//               <h3 className="font-semibold text-[14px] mb-4">Skills and Expertise</h3>

//               <div className="flex gap-2 mb-6 flex-wrap sm:hidden">
//                 {job?.skills_required?.slice(0, 2).map((tag, i) => (
//                   <span key={i} className="px-4 py-1 rounded-full bg-gray-100 text-[12px] text-gray-600">
//                     {tag}
//                   </span>
//                 ))}
//                 {(!job?.skills_required || job.skills_required.length === 0) && (
//                   <>
//                     <span className="px-4 py-1 rounded-full bg-gray-100 text-[12px] text-gray-600">Web Design</span>
//                     <span className="px-4 py-1 rounded-full bg-gray-100 text-[12px] text-gray-600">Mockup</span>
//                   </>
//                 )}
//               </div>

//               <div className="hidden sm:flex gap-2 mb-6 flex-wrap">
//                 {job?.skills_required?.map((tag, i) => (
//                   <span key={i} className="px-4 py-1 rounded-full bg-gray-100 text-[12px] text-gray-600">
//                     {tag}
//                   </span>
//                 ))}
//                 {(!job?.skills_required || job.skills_required.length === 0) && (
//                   <>
//                     <span className="px-4 py-1 rounded-full bg-gray-100 text-[12px] text-gray-600">Web Design</span>
//                     <span className="px-4 py-1 rounded-full bg-gray-100 text-[12px] text-gray-600">Mockup</span>
//                     <span className="px-4 py-1 rounded-full bg-gray-100 text-[12px] text-gray-600">Web Design</span>
//                     <span className="px-4 py-1 rounded-full bg-gray-100 text-[12px] text-gray-600">Mockup</span>
//                   </>
//                 )}
//               </div>

//               <div className="h-[1px] bg-gray-200 mb-4"></div>

//               <div className="sm:hidden mb-5 w-full p-4 text-[10px] leading-[14px] text-black grid grid-cols-2 gap-3">
//                 <p><span className="font-semibold">Proposals:</span> {job?.proposal_count || '15 to 20'}</p>
//                 <p className="whitespace-nowrap"><span className="font-semibold">Last viewed:</span> {job?.last_viewed_at ? formatTimeAgo(job.last_viewed_at) : '3 minutes'}</p>
//                 <p><span className="font-semibold">Interviewing:</span> {job?.interviewing_count || 0}</p>
//                 <p><span className="font-semibold">Invites sent:</span> {job?.invites_sent_count || 0}</p>
//                 <p className="col-span-2"><span className="font-semibold">Unanswered invites:</span> {job?.unanswered_invites_count || 0}</p>
//               </div>

//               <div className="sm:flex sm:gap-4 sm:items-center">
//                 <div className="sm:hidden flex flex-col gap-4">
//                   {!proposal ? (
//                     <button
//                       onClick={handleSubmitProposal}
//                       className="bg-[#5B2D91] text-white py-3 w-full rounded-full text-[14px] font-semibold hover:bg-[#4a2373] transition-colors"
//                     >
//                       Submit Proposal
//                     </button>
//                   ) : isRevoked ? (
//                     <button
//                       ref={changeTermsRef}
//                       onClick={handleChangeTerms}
//                       className="bg-white text-[#5B2D91] py-3 w-full rounded-full text-[14px] font-semibold border-2 border-[#5B2D91] focus:ring-2 focus:ring-[#5B2D91]"
//                     >
//                       Change terms
//                     </button>
//                   ) : (
//                     <button
//                       onClick={handleChangeTerms}
//                       className="bg-[#5B2D91] text-white py-3 w-full rounded-full text-[14px] font-semibold hover:bg-[#4a2373] transition-colors"
//                     >
//                       Change terms
//                     </button>
//                   )}

//                   {proposal && !isRevoked && (
//                     <button
//                       onClick={handleRevokeClick}
//                       onMouseEnter={() => setIsHovering(true)}
//                       onMouseLeave={() => setIsHovering(false)}
//                       className={`w-full py-3 text-[14px] font-semibold border rounded-full transition-colors duration-200 ${isHovering
//                         ? "bg-[#5B2D91] text-white border-[#5B2D91]"
//                         : "border-gray-600 text-gray-800"
//                         }`}
//                     >
//                       Revoke proposal
//                     </button>
//                   )}

//                   {isRevoked && (
//                     <button
//                       className="w-full py-3 text-[14px] font-semibold rounded-full text-gray-500 bg-gray-100 cursor-not-allowed border border-gray-300"
//                       disabled
//                     >
//                       Proposal Revoked
//                     </button>
//                   )}

//                   <div className="mt-4 text-[13px] text-gray-800 space-y-1">
//                     <p>Required Connects to submit a proposal: {job?.required_connects || 6}</p>
//                     <p>Available Connects: {userConnects || 0}</p>
//                   </div>
//                 </div>

//                 <div className="hidden sm:flex gap-4">
//                   {!proposal ? (
//                     <button
//                       onClick={handleSubmitProposal}
//                       className="bg-[#5B2D91] text-white px-6 py-3 rounded-full text-[14px] font-semibold hover:bg-[#4a2373] transition-colors"
//                     >
//                       Submit Proposal
//                     </button>
//                   ) : isRevoked ? (
//                     <button
//                       ref={changeTermsRef}
//                       onClick={handleChangeTerms}
//                       className="bg-[#5B2D91] text-white px-6 py-3 rounded-full text-[14px] font-semibold border-2 border-[#5B2D91] transition-colors hover:bg-[#4a2373] focus:ring-2 focus:ring-[#5B2D91]"
//                     >
//                       Change terms
//                     </button>
//                   ) : (
//                     <button
//                       onClick={handleChangeTerms}
//                       className="bg-[#5B2D91] text-white px-6 py-3 rounded-full text-[14px] font-semibold hover:bg-[#4a2373] transition-colors"
//                     >
//                       Change terms
//                     </button>
//                   )}

//                   {proposal && !isRevoked && (
//                     <button
//                       onClick={handleRevokeClick}
//                       className="text-[14px] font-semibold px-6 py-3 rounded-full border border-gray-600 text-gray-800 transition-colors hover:bg-[#5B2D91] hover:text-white hover:border-[#5B2D91]"
//                     >
//                       Revoke proposal
//                     </button>
//                   )}

//                   {isRevoked && (
//                     <button
//                       className="text-[14px] font-semibold px-6 py-3 rounded-full text-gray-500 bg-gray-100 cursor-not-allowed border border-gray-300"
//                       disabled
//                     >
//                       Proposal Revoked
//                     </button>
//                   )}
//                 </div>
//               </div>

//               <div className="hidden sm:block h-[1px] bg-gray-200 mt-15"></div>

//               {/* Messaging Section */}
//               <div className="lg:block">
//                 <div className="mt-3 mb-6 ml-5 text-center text-black">
//                   <p className="font-medium">
//                     Start conversations
//                     {otherUserOnline && (
//                       <span className="ml-2 inline-flex items-center">
//                         <span className="w-2 h-2 bg-green-500 rounded-full"></span>
//                         <span className="text-xs text-green-600 ml-1">Online</span>
//                       </span>
//                     )}
//                     {otherUserTyping && (
//                       <span className="ml-2 text-xs text-purple-600">typing...</span>
//                     )}
//                   </p>
//                 </div>
//                 <div className="w-full flex items-center gap-4 px-4 py-3 bg-white rounded-full border border-gray-200">
//                   <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer">
//                     <rect x="3" y="3" width="18" height="18" rx="4" />
//                     <circle cx="8.5" cy="8.5" r="1.5" />
//                     <path d="M21 15l-5-5L5 21" />
//                   </svg>
//                   <svg width="40" height="28" viewBox="0 0 40 28" fill="none" className="cursor-pointer">
//                     <rect x="1" y="1" width="38" height="26" rx="6" stroke="#7C3AED" strokeWidth="2" />
//                     <text x="9" y="19" fill="#7C3AED" fontSize="12" fontWeight="700" fontFamily="Arial, sans-serif">GIF</text>
//                   </svg>
//                   <div className="relative flex-1 h-[48px]">
//                     <div className="absolute inset-0 bg-gray-100 rounded-full"></div>
//                     <input
//                       type="text"
//                       placeholder={chatStarted ? "Reply..." : "Type your message..."}
//                       value={messageInput}
//                       onChange={handleMessageInputChange}
//                       onKeyDown={handleKeyPress}
//                       className="relative z-10 w-full h-[48px] bg-transparent pl-5 pr-4 text-[14px] text-gray-900 placeholder:text-[#9CA3AF] focus:outline-none"
//                     />
//                   </div>
//                   <button
//                     onClick={handleSendMessage}
//                     disabled={isSendingMessage || (!messageInput.trim() && !lastMessageSent)}
//                     className={`cursor-pointer ${isSendingMessage ? 'opacity-50' : ''}`}
//                   >
//                     <svg width="28" height="28" viewBox="0 0 24 24" fill={messageInput.trim() ? "#7C3AED" : "#9CA3AF"} className="transition-colors">
//                       <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
//                     </svg>
//                   </button>
//                 </div>
//                 {lastMessageSent && (
//                   <div className="mt-2 text-xs text-gray-500 text-center">
//                     Last message sent: {new Date(lastMessageSent.timestamp).toLocaleTimeString()}
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="hidden lg:block w-[1px] bg-gray-200"></div>

//             {/* ================= RIGHT SIDEBAR - EXACT SAME AS UX PAGE ================= */}
//             <div className="w-full lg:w-[340px] px-6 lg:px-8 py-8">
//               <p className="hidden lg:block text-[13px] text-[#2F3A40] leading-[24px] mb-6">
//                 Required Connects to submit a <br />proposal: <b>{job?.required_connects || 6}</b><br />
//                 Available Connects: <b>{userConnects || 0}</b>
//               </p>
//               <div className="hidden lg:block h-[1px] bg-gray-200 mb-6 w-full"></div>

//               <h3 className="text-[16px] sm:text-[18px] font-semibold mb-4">About the client</h3>

//               <div className="grid grid-cols-2 sm:grid-cols-1 gap-4 sm:gap-6">
//                 {/* LEFT COLUMN - EXACT SAME AS UX PAGE */}
//                 <div className="order-1 sm:order-1">
//                   <div className="space-y-2 sm:space-y-3 text-[13px] sm:text-[14px] text-[#3A3A3A] mb-4">
//                     {/* LOCATION */}
//                     <div className="flex items-center gap-2">
//                       <CountryFlag
//                         countryCode={creatorStats.country_code || creator?.country_code}
//                         country={creatorStats.country || creator?.country}
//                       />
//                       <span>{creatorStats.city || creator?.city || creatorStats.country || creator?.country || "Remote"}</span>
//                     </div>

//                     {/* TIME */}
//                     <div className="flex items-center gap-2">
//                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//                         <circle cx="12" cy="12" r="9" stroke="#6B6B6B" strokeWidth="1.5" />
//                         <path d="M12 7V12L15 14" stroke="#6B6B6B" strokeWidth="1.5" />
//                       </svg>
//                       <span>Local time unknown</span>
//                     </div>

//                     {/* JOINED */}
//                     <div className="flex items-center gap-2">
//                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//                         <path d="M6 21h12M9 17V5l3-2 3 2v12" stroke="#6B6B6B" strokeWidth="1.5" />
//                       </svg>
//                       <span>Joined {creator?.created_at ? formatTimeAgo(creator.created_at) : 'Recently'}</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* RIGHT COLUMN – STATS - EXACT SAME AS UX PAGE */}
//                 <div className="order-2 sm:order-2 space-y-1.5 sm:space-y-2 text-[13px] sm:text-[14px] text-[#3A3A3A]">
//                   <p className="font-semibold">{creatorStats.city || creator?.city || creatorStats.country || creator?.country || "Remote"}</p>
//                   <p className="font-semibold">{creatorStats.total_jobs_posted || 0} jobs posted</p>
//                   <p className="text-[#6B6B6B]">{creatorStats.hire_rate || 0}% hire rate</p>
//                   <p className="font-semibold">{formatCurrency(creatorStats.total_spent)}+ total spent</p>
//                   <p className="text-[#6B6B6B]">{creatorStats.total_hires || 0} hires</p>
//                   <p className="font-semibold">${creatorStats.avg_hourly_rate || 0}/hr avg hourly rate</p>
//                   <p className="text-[#6B6B6B]">{creatorStats.total_hours || 0} hours</p>
//                   <p className="font-semibold">{creatorStats.company_size || 'Unknown'} company</p>
//                   <p className="text-[#6B6B6B]">Member since {formatMemberSince(creatorStats.member_since || creator?.created_at)}</p>
//                 </div>

//                 {/* RATING - EXACT SAME AS UX PAGE */}
//                 <div className="order-2 sm:order-3 col-span-1">
//                   <div className="-mt-48 sm:mt-4">
//                     <div className="flex gap-[2px] text-purple-600 text-[16px] sm:text-[18px]">
//                       {"★".repeat(Math.floor(creatorStats.rating || 0))}
//                       {"☆".repeat(5 - Math.floor(creatorStats.rating || 0))}
//                     </div>
//                     <span className="text-[13px] sm:text-[14px] text-[#6B6B6B]">
//                       {creatorStats.rating || 0}/5 ({creatorStats.reviews || 0} Reviews)
//                     </span>
//                   </div>

//                   {/* DIVIDER */}
//                   <div className="hidden sm:block h-[1px] bg-gray-200 my-6"></div>

//                   {/* VERIFICATIONS - EXACT SAME AS UX PAGE */}
//                   <div className="space-y-3 sm:space-y-4 text-[13px] sm:text-[14px] text-[#2b2b2b]">
//                     {/* Phone */}
//                     <div className="flex items-center gap-3">
//                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                         <path d="M22 16.9v3a2 2 0 0 1-2.2 2 A19.8 19.8 0 0 1 3 5.2 A2 2 0 0 1 5 3h3 a2 2 0 0 1 2 1.7l.5 2.5 a2 2 0 0 1-.6 1.8l-1.2 1.2 a16 16 0 0 0 6.6 6.6l1.2-1.2 a2 2 0 0 1 1.8-.6l2.5.5 a2 2 0 0 1 1.7 2.2Z"
//                           stroke={creatorStats.phone_verified ? "#5B2D91" : "#9CA3AF"}
//                           strokeWidth="1.5"
//                         />
//                       </svg>
//                       <span className={`font-semibold ${creatorStats.phone_verified ? 'text-[#5B2D91]' : 'text-gray-400'}`}>
//                         {creatorStats.phone_verified ? 'Phone Verified' : 'Phone not verified'}
//                       </span>
//                     </div>

//                     {/* Email */}
//                     <div className="flex items-center gap-3">
//                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                         <rect x="3" y="5" width="18" height="14" rx="2"
//                           stroke={creatorStats.email_verified ? "#5B2D91" : "#9CA3AF"}
//                           strokeWidth="1.5"
//                         />
//                         <path d="M3 7l9 6 9-6"
//                           stroke={creatorStats.email_verified ? "#5B2D91" : "#9CA3AF"}
//                           strokeWidth="1.5"
//                         />
//                       </svg>
//                       <span className={`font-semibold ${creatorStats.email_verified ? 'text-[#5B2D91]' : 'text-gray-400'}`}>
//                         {creatorStats.email_verified ? 'Email Verified' : 'Email not verified'}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="block sm:hidden h-[1px] bg-gray-200 my-4 w-full" />

//             {/* Mobile Messaging Section */}
//             <div className="lg:hidden border-t border-gray-200 px-4 py-5">
//               <p className="text-center text-[14px] font-medium text-black mb-3">
//                 Start conversations
//                 {otherUserOnline && (
//                   <span className="ml-2 inline-flex items-center">
//                     <span className="w-2 h-2 bg-green-500 rounded-full"></span>
//                     <span className="text-xs text-green-600 ml-1">Online</span>
//                   </span>
//                 )}
//                 {otherUserTyping && (
//                   <span className="ml-2 text-xs text-purple-600">typing...</span>
//                 )}
//               </p>
//               <div className="w-full flex items-center gap-3">
//                 <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer shrink-0">
//                   <rect x="3" y="3" width="18" height="18" rx="4" />
//                   <circle cx="8.5" cy="8.5" r="1.5" />
//                   <path d="M21 15l-5-5L5 21" />
//                 </svg>
//                 <svg width="36" height="26" viewBox="0 0 40 28" fill="none" className="cursor-pointer shrink-0">
//                   <rect x="1" y="1" width="38" height="26" rx="6" stroke="#7C3AED" strokeWidth="2" />
//                   <text x="9" y="19" fill="#7C3AED" fontSize="12" fontWeight="700" fontFamily="Arial, sans-serif">GIF</text>
//                 </svg>
//                 <div className="relative flex-1 h-[44px]">
//                   <div className="absolute inset-0 bg-gray-100 rounded-full"></div>
//                   <input
//                     type="text"
//                     placeholder={chatStarted ? "Reply..." : "Type your message..."}
//                     value={messageInput}
//                     onChange={handleMessageInputChange}
//                     onKeyPress={handleKeyPress}
//                     className="relative z-10 w-full h-[44px] bg-transparent pl-4 pr-3 text-[14px] text-gray-900 placeholder:text-[#9CA3AF] focus:outline-none"
//                   />
//                 </div>
//                 <button
//                   onClick={handleSendMessage}
//                   disabled={isSendingMessage || (!messageInput.trim() && !lastMessageSent)}
//                   className="cursor-pointer shrink-0"
//                 >
//                   <svg width="26" height="26" viewBox="0 0 24 24" fill={messageInput.trim() ? "#7C3AED" : "#9CA3AF"}>
//                     <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
//                   </svg>
//                 </button>
//               </div>
//               {lastMessageSent && (
//                 <div className="mt-2 text-xs text-gray-500 text-center">
//                   Last message sent: {new Date(lastMessageSent.timestamp).toLocaleTimeString()}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {showPopup && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
//           <div className="absolute inset-0 bg-black/50"></div>
//           <div className="relative bg-white rounded-2xl max-w-sm w-full text-center shadow-xl">
//             <div className="flex justify-center mt-6">
//               <img
//                 src={PopupImage}
//                 alt="Cancel Proposal"
//                 className="w-20 h-20 rounded-full object-cover"
//               />
//             </div>
//             <div className="p-6">
//               <p className="text-[16px] font-medium text-gray-900 mt-4">
//                 Are you sure you want to Cancel Proposal?
//               </p>
//               <div className="flex justify-center gap-4 mt-8">
//                 <button
//                   onClick={handleCancelClick}
//                   className="px-8 py-2 rounded-full border border-gray-300 text-gray-800 font-medium transition hover:bg-[#5B2D91] hover:text-white hover:border-[#5B2D91]"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleConfirmRevoke}
//                   className="px-8 py-2 rounded-full border border-[#5B2D91] text-[#5B2D91] bg-white font-medium transition hover:bg-[#5B2D91] hover:text-white"
//                 >
//                   Reject
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="mt-4">
//         <Footer />
//       </div>
//     </div>
//   );
// }

// without documents enableed
// import React, { useState, useRef, useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { useUser } from "../../contexts/userContext";
// import api from "../../utils/axiosConfig";
// import TopBanner from "../../assets/Colabwork/banner.png";
// import PopupImage from "../../assets/Landing/Card1.png";
// import Footer from "../../component/Footer";
// import ColHeader from "../../component/ColHeader";
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// // ==================== SUPPRESS ALL CONSOLE ERRORS FOR 404s ====================
// // Store original console methods
// const originalConsole = {
//   error: console.error,
//   log: console.log,
//   warn: console.warn,
//   info: console.info
// };

// // List of endpoints that cause 404 errors
// const SUPPRESSED_PATTERNS = [
//   '/creator/job-stats/',
//   '/creator/reviews/',
//   '/creator/company/',
//   '/auth/user/verification/'
// ];

// // Override console.error to filter out 404 errors
// console.error = function(...args) {
//   const errorString = JSON.stringify(args).toLowerCase();

//   // Check if this is a suppressed 404 error
//   const isSuppressed404 = 
//     (errorString.includes('404') || errorString.includes('not found')) && 
//     SUPPRESSED_PATTERNS.some(pattern => errorString.includes(pattern.toLowerCase()));

//   // Also check for the specific axios error format
//   const isAxios404 = args.some(arg => 
//     arg && typeof arg === 'object' && 
//     arg.config?.url && 
//     SUPPRESSED_PATTERNS.some(pattern => arg.config.url.includes(pattern))
//   );

//   if (!isSuppressed404 && !isAxios404) {
//     originalConsole.error.apply(console, args);
//   }
// };

// // Override console.log to filter out request logs
// console.log = function(...args) {
//   const logString = JSON.stringify(args).toLowerCase();

//   const isSuppressedLog = 
//     SUPPRESSED_PATTERNS.some(pattern => logString.includes(pattern.toLowerCase()));

//   if (!isSuppressedLog) {
//     originalConsole.log.apply(console, args);
//   }
// };

// // Override console.warn
// console.warn = function(...args) {
//   const warnString = JSON.stringify(args).toLowerCase();

//   const isSuppressedWarn = 
//     (warnString.includes('404') || warnString.includes('not found')) && 
//     SUPPRESSED_PATTERNS.some(pattern => warnString.includes(pattern.toLowerCase()));

//   if (!isSuppressedWarn) {
//     originalConsole.warn.apply(console, args);
//   }
// };
// // ==================== END SUPPRESSION ====================

// export default function Proposal() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { userData } = useUser();

//   const [showPopup, setShowPopup] = useState(false);
//   const [isRevoked, setIsRevoked] = useState(false);
//   const [isHovering, setIsHovering] = useState(false);
//   const changeTermsRef = useRef(null);

//   // State for job and proposal data
//   const [job, setJob] = useState(null);
//   const [creator, setCreator] = useState(null);
//   const [proposal, setProposal] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // State for creator stats - FETCHED FROM BACKEND
//   const [creatorStats, setCreatorStats] = useState({
//     total_jobs_posted: 0,
//     hire_rate: 0,
//     total_spent: 0,
//     total_hires: 0,
//     avg_hourly_rate: 0,
//     total_hours: 0,
//     company_size: '',
//     member_since: null,
//     rating: 0,
//     reviews: 0,
//     phone_verified: false,
//     email_verified: false,
//     country: null,
//     city: null,
//     country_code: null,
//     local_time: '4:45 PM',
//     time_postfix: 'pm'
//   });

//   // Messaging state
//   const [messageInput, setMessageInput] = useState("");
//   const [isSendingMessage, setIsSendingMessage] = useState(false);
//   const [chatStarted, setChatStarted] = useState(false);
//   const [conversationId, setConversationId] = useState(null);
//   const [otherUserTyping, setOtherUserTyping] = useState(false);
//   const [otherUserOnline, setOtherUserOnline] = useState(false);
//   const [lastMessageSent, setLastMessageSent] = useState(null);

//   // ==================== GET CONNECTS FROM CONTEXT - FIXED ====================
//   const [userConnects, setUserConnects] = useState(0);

//   // Get connects from userData context - EXACT SAME AS UX PAGE
//   const getUserConnects = () => {
//     if (userData?.connects) {
//       setUserConnects(userData.connects);
//     } else {
//       setUserConnects(0);
//     }
//   };

//   useEffect(() => {
//     getUserConnects();
//   }, [userData]);

//   // ==================== FETCH CREATOR STATS FROM BACKEND ====================
//   const fetchCreatorStats = async (creatorId) => {
//     if (!creatorId) return;

//     try {
//       // Fetch creator's jobs
//       const jobsResponse = await api.get(`/jobs/my-jobs/${creatorId}?status=posted`);
//       const jobs = jobsResponse.data?.jobs || [];

//       // Calculate from actual backend data
//       const totalJobsPosted = jobs.length;

//       // Calculate total budget range from jobs (this is what's available in your backend)
//       let totalBudgetRange = 0;
//       jobs.forEach(job => {
//         if (job.budget_to) {
//           totalBudgetRange += job.budget_to;
//         } else if (job.budget_from) {
//           totalBudgetRange += job.budget_from;
//         }
//       });

//       // Get creator details from the job data
//       const creatorData = jobs[0]?.creator || creator;

//       setCreatorStats({
//         total_jobs_posted: totalJobsPosted,
//         hire_rate: 0, // This data not available in backend yet
//         total_spent: totalBudgetRange, // This is budget range, not actual spent
//         total_hires: 0, // This data not available in backend yet
//         avg_hourly_rate: 0, // This data not available in backend yet
//         total_hours: 0, // This data not available in backend yet
//         company_size: creatorData?.company_size || 'Individual',
//         member_since: creatorData?.created_at || null,
//         rating: 0, // This data not available in backend yet
//         reviews: 0, // This data not available in backend yet
//         phone_verified: creatorData?.phone_verified || false,
//         email_verified: creatorData?.email_verified || false,
//         country: creatorData?.country || null,
//         city: creatorData?.city || null,
//         country_code: creatorData?.country_code || null,
//         local_time: '4:45 PM',
//         time_postfix: 'pm'
//       });

//     } catch (error) {
//       console.error('Error fetching creator stats:', error);
//       // If API fails, use data from creator object
//       if (creator) {
//         setCreatorStats(prev => ({
//           ...prev,
//           country: creator.country || null,
//           city: creator.city || null,
//           country_code: creator.country_code || null,
//           member_since: creator.created_at || null,
//           phone_verified: creator.phone_verified || false,
//           email_verified: creator.email_verified || false,
//         }));
//       }
//     }
//   };

//   // Fetch job details - EXACT SAME AS UX PAGE
//   const fetchJobDetails = async (jobId, proposalId) => {
//     setLoading(true);
//     try {
//       const response = await api.get(`/collaborator/jobs/${jobId}`);
//       const jobData = response.data || {};
//       const creatorData = jobData.creator || {};

//       setJob(jobData);
//       setCreator(creatorData);

//       // Fetch creator stats
//       if (creatorData.id) {
//         await fetchCreatorStats(creatorData.id);
//       }

//       if (location.state?.proposal) {
//         setProposal(location.state.proposal);
//       } else if (proposalId) {
//         const savedProposal = localStorage.getItem('currentProposal');
//         if (savedProposal) {
//           setProposal(JSON.parse(savedProposal));
//         }
//       }

//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching job details:', error);
//       setError('Failed to load job details');
//       toast.error('Failed to load job details');
//       setLoading(false);
//     }
//   };

//   // ==================== PROPOSAL SUBMISSION - FIXED ====================
//   const handleSubmitProposal = async () => {
//     if (!userData?.id) {
//       toast.error('Please login to submit a proposal');
//       navigate('/login');
//       return;
//     }

//     if (!job?.id) {
//       toast.error('Job information is missing');
//       return;
//     }

//     try {
//       const formData = new FormData();
//       formData.append('job_id', job.id);
//       formData.append('freelancer_id', userData.id);
//       formData.append('payment_type', 'project');
//       formData.append('bid_amount', job.budget_from || job.budget_to || 100);
//       formData.append('duration', '30 days');
//       formData.append('cover_letter', 'I am interested in this project. I have the required skills and experience.');
//       formData.append('skills', job.skills_required?.join(', ') || 'Web Design, Mockup');
//       formData.append('expertise', 'Intermediate');

//       const response = await api.post('/proposals/CreateProposal', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       });

//       if (response.data && response.data.proposal_id) {
//         toast.success('Proposal submitted successfully!');

//         const proposalData = {
//           id: response.data.proposal_id,
//           bid_amount: job.budget_from || job.budget_to || 100,
//           status: 'submitted',
//           created_at: new Date().toISOString()
//         };

//         setProposal(proposalData);
//         localStorage.setItem('currentProposal', JSON.stringify(proposalData));
//         localStorage.setItem('currentJob', JSON.stringify(job));

//         navigate('/proposal', {
//           state: {
//             job: job,
//             proposal: proposalData,
//             jobId: job.id,
//             proposalId: response.data.proposal_id
//           },
//           replace: true
//         });
//       }
//     } catch (error) {
//       console.error('Error submitting proposal:', error);

//       if (error.response?.status === 400) {
//         if (error.response.data?.detail?.includes('already applied')) {
//           toast.error('You have already applied for this job');
//         } else {
//           toast.error(error.response.data?.detail || 'Failed to submit proposal');
//         }
//       } else {
//         toast.error('Failed to submit proposal. Please try again.');
//       }
//     }
//   };

//   // ==================== COUNTRY FLAG - EXACT SAME AS COL HOME ====================
//   const CountryFlag = ({ countryCode, country }) => {
//     if (!countryCode) {
//       return (
//         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="1.5">
//           <circle cx="12" cy="12" r="9" stroke="#6B6B6B" strokeWidth="1.5" />
//           <path d="M12 8v4l3 3" stroke="#6B6B6B" strokeWidth="1.5" />
//         </svg>
//       );
//     }

//     return (
//       <img
//         src={`https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`}
//         alt={country}
//         title={country}
//         className="w-[18px] h-[12px] rounded-[4px] object-cover"
//         onError={(e) => {
//           e.target.onerror = null;
//           e.target.src = "https://flagcdn.com/w20/us.png";
//         }}
//       />
//     );
//   };

//   // Get data from navigation state
//   useEffect(() => {
//     if (location.state) {
//       const { job: jobData, proposal: proposalData, jobId, proposalId } = location.state;

//       if (jobData) {
//         setJob(jobData);
//         setCreator(jobData.creator || {});
//         setProposal(proposalData || null);

//         if (jobData.creator?.id) {
//           fetchCreatorStats(jobData.creator.id);
//         }

//         setLoading(false);
//       }
//       else if (jobId) {
//         fetchJobDetails(jobId, proposalId);
//       }
//       else {
//         const savedProposal = localStorage.getItem('currentProposal');
//         const savedJob = localStorage.getItem('currentJob');

//         if (savedProposal && savedJob) {
//           try {
//             const parsedJob = JSON.parse(savedJob);
//             setProposal(JSON.parse(savedProposal));
//             setJob(parsedJob);
//             setCreator(parsedJob.creator || {});

//             if (parsedJob.creator?.id) {
//               fetchCreatorStats(parsedJob.creator.id);
//             }

//             setLoading(false);
//           } catch (e) {
//             setError('No job information found');
//             toast.error('No job information found');
//           }
//         } else {
//           setLoading(false);
//         }
//       }
//     } else {
//       const savedProposal = localStorage.getItem('currentProposal');
//       const savedJob = localStorage.getItem('currentJob');

//       if (savedProposal && savedJob) {
//         try {
//           const parsedJob = JSON.parse(savedJob);
//           setProposal(JSON.parse(savedProposal));
//           setJob(parsedJob);
//           setCreator(parsedJob.creator || {});

//           if (parsedJob.creator?.id) {
//             fetchCreatorStats(parsedJob.creator.id);
//           }

//           setLoading(false);
//         } catch (e) {
//           setError('No job information found');
//           toast.error('No job information found');
//         }
//       } else {
//         setLoading(false);
//       }
//     }
//   }, [location.state]);

//   // Messaging functions
//   const checkConversation = async () => {
//     if (!userData?.id || !creator?.id) return;

//     try {
//       const response = await api.get(`/message/conversation/${userData.id}/${creator.id}`);
//       setConversationId(response.data.conversation_id);
//       setOtherUserOnline(response.data.other_user_online || false);
//       setOtherUserTyping(response.data.other_user_typing || false);

//       if (response.data.conversation_id) {
//         setChatStarted(true);
//       }
//     } catch (error) {
//       console.error('Error checking conversation:', error);
//     }
//   };

//   useEffect(() => {
//     if (userData?.id && creator?.id) {
//       checkConversation();

//       const typingInterval = setInterval(checkConversation, 3000);
//       return () => clearInterval(typingInterval);
//     }
//   }, [userData, creator]);

//   const sendTypingStatus = async (isTyping) => {
//     if (!userData?.id || !creator?.id) return;

//     try {
//       await api.post('/message/typing', {
//         user_id: userData.id,
//         chat_with: creator.id,
//         is_typing: isTyping
//       });
//     } catch (error) {
//       console.error('Error sending typing status:', error);
//     }
//   };

//   const handleMessageInputChange = (e) => {
//     setMessageInput(e.target.value);
//     sendTypingStatus(e.target.value.length > 0);
//   };

//   const handleSendMessage = async () => {
//     if (!messageInput.trim()) return;

//     const receiverId = creator?.id || job?.employer_id;

//     if (!userData?.id || !job?.id || !receiverId) {
//       toast.error("Missing required data");
//       return;
//     }

//     setIsSendingMessage(true);

//     try {
//       const formData = new URLSearchParams();
//       formData.append('job_id', String(job.id));
//       formData.append('sender_id', String(userData.id));
//       formData.append('content', messageInput.trim());

//       const response = await api.post("/message/send-for-proposal", formData, {
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded'
//         }
//       });

//       setLastMessageSent({
//         content: messageInput.trim(),
//         timestamp: new Date().toISOString()
//       });

//       setMessageInput("");
//       sendTypingStatus(false);
//       toast.success("Message sent successfully!");

//       const targetReceiverId = response.data.receiver_id || receiverId;

//       setTimeout(() => {
//         navigate("/message", {
//           state: {
//             jobId: job.id,
//             receiverId: targetReceiverId,
//           },
//         });
//       }, 500);

//     } catch (error) {
//       toast.error("Failed to send message");
//     } finally {
//       setIsSendingMessage(false);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   const handleRevokeClick = () => {
//     setShowPopup(true);
//   };

//   const handleCancelClick = () => {
//     setShowPopup(false);
//   };

//   const handleConfirmRevoke = async () => {
//     if (!proposal?.id) {
//       toast.error('No proposal to revoke');
//       return;
//     }

//     try {
//       await api.delete(`/proposals/WithdrawProposal/${proposal.id}`);

//       setIsRevoked(true);
//       setShowPopup(false);
//       toast.success('Proposal revoked successfully');
//       setProposal(prev => ({ ...prev, status: 'revoked' }));

//       const updatedProposal = { ...proposal, status: 'revoked' };
//       localStorage.setItem('currentProposal', JSON.stringify(updatedProposal));
//     } catch (error) {
//       if (error.response?.status === 404) {
//         try {
//           await api.delete(`/proposals/withdraw-proposal/${proposal.id}`);
//           setIsRevoked(true);
//           setShowPopup(false);
//           toast.success('Proposal revoked successfully');
//           setProposal(prev => ({ ...prev, status: 'revoked' }));
//           const updatedProposal = { ...proposal, status: 'revoked' };
//           localStorage.setItem('currentProposal', JSON.stringify(updatedProposal));
//           return;
//         } catch (secondError) {
//           toast.error('Failed to revoke proposal. Please try again.');
//         }
//       } else {
//         toast.error('Failed to revoke proposal. Please try again.');
//       }
//     }
//   };

//   const handleChangeTerms = () => {
//     navigate('/Uploadux', {
//       state: {
//         jobId: job?.id,
//         jobTitle: job?.title,
//         budget: job?.budget,
//         budget_from: job?.budget_from,
//         budget_to: job?.budget_to,
//         budget_type: job?.budget_type,
//         proposalData: proposal,
//         isEditing: true,
//         job: job
//       }
//     });
//   };

//   useEffect(() => {
//     if (isRevoked && changeTermsRef.current) {
//       changeTermsRef.current.focus();
//     }
//   }, [isRevoked]);

//   // Format time ago
//   const formatTimeAgo = (dateString) => {
//     if (!dateString) return "Recently";

//     try {
//       const date = new Date(dateString);
//       const now = new Date();
//       const diffMs = now - date;
//       const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
//       const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

//       if (diffHours < 1) {
//         return "Recently";
//       } else if (diffHours < 24) {
//         return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
//       } else if (diffDays === 1) {
//         return "1 day ago";
//       } else if (diffDays < 7) {
//         return `${diffDays} days ago`;
//       } else {
//         return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
//       }
//     } catch (error) {
//       return "Recently";
//     }
//   };

//   const formatBudget = () => {
//     if (!job) return '$0.00';

//     if (job.budget_from && job.budget_to) {
//       return `$${job.budget_from} - $${job.budget_to}`;
//     } else if (job.budget_from) {
//       return `$${job.budget_from}`;
//     } else if (job.budget_to) {
//       return `$${job.budget_to}`;
//     }
//     return '$0.00';
//   };

//   const formatProposalAmount = () => {
//     if (!proposal) {
//       return formatBudget() + ' USD';
//     }

//     if (proposal.bid_amount) {
//       return `$${proposal.bid_amount} USD`;
//     }
//     if (proposal.amount) {
//       return `$${proposal.amount} USD`;
//     }
//     return formatBudget() + ' USD';
//   };

//   const formatBiddingEnds = () => {
//     if (!job?.bidding_ends_at) return "Bidding ends in 6 days";

//     try {
//       const endDate = new Date(job.bidding_ends_at);
//       const now = new Date();
//       const diffMs = endDate - now;
//       const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

//       if (diffDays > 0) {
//         return `Bidding ends in ${diffDays} days`;
//       } else {
//         return "Bidding ends soon";
//       }
//     } catch (error) {
//       return "Bidding ends in 6 days";
//     }
//   };

//   const formatCurrency = (amount) => {
//     if (!amount) return '$0';
//     if (amount >= 1000) {
//       return `$${Math.round(amount / 1000)}k+`;
//     }
//     return `$${amount}`;
//   };

//   const formatMemberSince = (dateString) => {
//     if (!dateString) return 'Jan 22, 2020';
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
//     } catch {
//       return 'Jan 22, 2020';
//     }
//   };

//   const handleBack = () => {
//     if (location.state?.from) {
//       navigate(location.state.from);
//     } else {
//       navigate(-1);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="w-full bg-[#F5F5F5] min-h-screen">
//         <div className="relative w-full h-[420px] md:h-[520px] xl:h-[582px]">
//           <img src={TopBanner} alt="banner" className="absolute inset-0 w-full h-full object-cover blur-[1px]" />
//           <div className="absolute top-0 left-0 w-full z-50">
//             <ColHeader />
//           </div>
//         </div>
//         <div className="min-h-screen flex justify-center items-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   if (error || !job) {
//     return (
//       <div className="w-full bg-[#F5F5F5] min-h-screen">
//         <div className="relative w-full h-[420px] md:h-[520px] xl:h-[582px]">
//           <img src={TopBanner} alt="banner" className="absolute inset-0 w-full h-full object-cover blur-[1px]" />
//           <div className="absolute top-0 left-0 w-full z-50">
//             <ColHeader />
//           </div>
//         </div>
//         <div className="min-h-screen flex justify-center items-center px-4">
//           <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
//             <div className="text-gray-400 mb-4">
//               <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//               </svg>
//             </div>
//             <h3 className="text-lg font-semibold text-gray-600 mb-2">Error Loading Job</h3>
//             <p className="text-gray-500 mb-6">{error || 'Job not found'}</p>
//             <button
//               onClick={() => navigate('/colhome')}
//               className="px-8 py-3 bg-[#5B2D91] text-white rounded-full hover:bg-[#4a2373] transition-colors font-semibold"
//             >
//               Go back to jobs
//             </button>
//           </div>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   return (
//     <div className="w-full bg-[#F5F5F5] min-h-screen">
//       <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} />

//       <div className="relative w-full h-[420px] md:h-[520px] xl:h-[582px]">
//         <img src={TopBanner} alt="banner" className="absolute inset-0 w-full h-full object-cover blur-[1px]" />
//         <div className="absolute top-0 left-0 w-full z-50">
//           <ColHeader />
//         </div>
//       </div>

//       <div className="min-h-screen flex justify-center px-4 sm:px-0">
//         <div className="relative w-full max-w-[1200px] 2xl:max-w-[1320px] mx-5 sm:mx-auto -mt-[240px] lg:-mt-[300px] bg-white border border-black rounded-none">
//           <div className="hidden sm:block border-b border-gray-200 px-6 md:px-8 pt-4 pb-0">
//             <button
//               onClick={handleBack}
//               className="flex items-center text-[16px] text-[#111111] mb-4 hover:text-[#5B2D91] transition-colors"
//             >
//               <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
//                 <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//               </svg>
//               <span>Back</span>
//             </button>
//             <div className="h-[1px] bg-gray-200 w-full"></div>
//           </div>

//           <div className="flex flex-col lg:flex-row">
//             <div className="flex-1 px-4 md:px-8 py-3 sm:py-6">
//               <div className="flex justify-between items-start sm:items-start mb-1 sm:mb-3">
//                 <div>
//                   <h2 className="text-[14px] sm:text-[20px] font-semibold leading-tight tracking-tight whitespace-normal pr-4">
//                     {job?.title || "Looking for a UX Web Designer"}
//                   </h2>
//                   <p className="text-sm text-gray-500 mt-1 sm:hidden">
//                     {formatTimeAgo(job?.created_at)}
//                   </p>
//                 </div>
//                 <div className="mt-8 sm:mt-0">
//                   <div className="flex flex-col items-start sm:items-end text-left sm:text-right leading-tight">
//                     <p className="text-[12px] sm:text-[14px] font-semibold text-black whitespace-nowrap">
//                       {formatProposalAmount()}
//                     </p>
//                     <p className="text-[9px] sm:text-[10px] uppercase tracking-wide text-gray-500 whitespace-nowrap sm:mt-[2px]">
//                       {formatBiddingEnds()}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <p className="hidden sm:block text-sm text-gray-500 mb-5">
//                 {formatTimeAgo(job?.created_at)}
//               </p>

//               <p className="text-[14px] leading-[22px] text-gray-700 mt-4 sm:mt-9 mb-4 whitespace-pre-line">
//                 {job?.description || "No description available"}
//               </p>

//               <p className="text-[14px] font-semibold mb-2">The key areas are -</p>
//               <div className="text-[14px] text-gray-700 space-y-1 mb-4">
//                 {job?.key_areas?.map((area, index) => (
//                   <p key={index}>+ {area}</p>
//                 ))}
//                 {(!job?.key_areas || job.key_areas.length === 0) && (
//                   <>
//                     <p>+ Digital Transformation work</p>
//                     <p>+ Platform modernization</p>
//                     <p>+ Maintenance and support</p>
//                     <p>+ Utility tool development</p>
//                     <p>+ Secure Data migration</p>
//                     <p>+ Round the clock support</p>
//                     <p>+ IT Consultancy</p>
//                   </>
//                 )}
//               </div>

//               <p className="text-[14px] text-gray-700 mb-6">
//                 Contents development is included in the job which should be finalized after review with me.
//               </p>

//               <div className="h-[1px] bg-gray-200 mb-4"></div>

//               <h3 className="font-semibold text-[14px] mb-4">Skills and Expertise</h3>

//               <div className="flex gap-2 mb-6 flex-wrap sm:hidden">
//                 {job?.skills_required?.slice(0, 2).map((tag, i) => (
//                   <span key={i} className="px-4 py-1 rounded-full bg-gray-100 text-[12px] text-gray-600">
//                     {tag}
//                   </span>
//                 ))}
//                 {(!job?.skills_required || job.skills_required.length === 0) && (
//                   <>
//                     <span className="px-4 py-1 rounded-full bg-gray-100 text-[12px] text-gray-600">Web Design</span>
//                     <span className="px-4 py-1 rounded-full bg-gray-100 text-[12px] text-gray-600">Mockup</span>
//                   </>
//                 )}
//               </div>

//               <div className="hidden sm:flex gap-2 mb-6 flex-wrap">
//                 {job?.skills_required?.map((tag, i) => (
//                   <span key={i} className="px-4 py-1 rounded-full bg-gray-100 text-[12px] text-gray-600">
//                     {tag}
//                   </span>
//                 ))}
//                 {(!job?.skills_required || job.skills_required.length === 0) && (
//                   <>
//                     <span className="px-4 py-1 rounded-full bg-gray-100 text-[12px] text-gray-600">Web Design</span>
//                     <span className="px-4 py-1 rounded-full bg-gray-100 text-[12px] text-gray-600">Mockup</span>
//                     <span className="px-4 py-1 rounded-full bg-gray-100 text-[12px] text-gray-600">Web Design</span>
//                     <span className="px-4 py-1 rounded-full bg-gray-100 text-[12px] text-gray-600">Mockup</span>
//                   </>
//                 )}
//               </div>

//               <div className="h-[1px] bg-gray-200 mb-4"></div>

//               <div className="sm:hidden mb-5 w-full p-4 text-[10px] leading-[14px] text-black grid grid-cols-2 gap-3">
//                 <p><span className="font-semibold">Proposals:</span> {job?.proposal_count || '15 to 20'}</p>
//                 <p className="whitespace-nowrap"><span className="font-semibold">Last viewed:</span> {job?.last_viewed_at ? formatTimeAgo(job.last_viewed_at) : '3 minutes'}</p>
//                 <p><span className="font-semibold">Interviewing:</span> {job?.interviewing_count || 0}</p>
//                 <p><span className="font-semibold">Invites sent:</span> {job?.invites_sent_count || 0}</p>
//                 <p className="col-span-2"><span className="font-semibold">Unanswered invites:</span> {job?.unanswered_invites_count || 0}</p>
//               </div>

//               <div className="sm:flex sm:gap-4 sm:items-center">
//                 <div className="sm:hidden flex flex-col gap-4">
//                   {!proposal ? (
//                     <button
//                       onClick={handleSubmitProposal}
//                       className="bg-[#5B2D91] text-white py-3 w-full rounded-full text-[14px] font-semibold hover:bg-[#4a2373] transition-colors"
//                     >
//                       Submit Proposal
//                     </button>
//                   ) : isRevoked ? (
//                     <button
//                       ref={changeTermsRef}
//                       onClick={handleChangeTerms}
//                       className="bg-white text-[#5B2D91] py-3 w-full rounded-full text-[14px] font-semibold border-2 border-[#5B2D91] focus:ring-2 focus:ring-[#5B2D91]"
//                     >
//                       Change terms
//                     </button>
//                   ) : (
//                     <button
//                       onClick={handleChangeTerms}
//                       className="bg-[#5B2D91] text-white py-3 w-full rounded-full text-[14px] font-semibold hover:bg-[#4a2373] transition-colors"
//                     >
//                       Change terms
//                     </button>
//                   )}

//                   {proposal && !isRevoked && (
//                     <button
//                       onClick={handleRevokeClick}
//                       onMouseEnter={() => setIsHovering(true)}
//                       onMouseLeave={() => setIsHovering(false)}
//                       className={`w-full py-3 text-[14px] font-semibold border rounded-full transition-colors duration-200 ${isHovering
//                           ? "bg-[#5B2D91] text-white border-[#5B2D91]"
//                           : "border-gray-600 text-gray-800"
//                         }`}
//                     >
//                       Revoke proposal
//                     </button>
//                   )}

//                   {isRevoked && (
//                     <button
//                       className="w-full py-3 text-[14px] font-semibold rounded-full text-gray-500 bg-gray-100 cursor-not-allowed border border-gray-300"
//                       disabled
//                     >
//                       Proposal Revoked
//                     </button>
//                   )}

//                   <div className="mt-4 text-[13px] text-gray-800 space-y-1">
//                     <p>Required Connects to submit a proposal: {job?.required_connects || 6}</p>
//                     <p>Available Connects: {userConnects || 0}</p>
//                   </div>
//                 </div>

//                 <div className="hidden sm:flex gap-4">
//                   {!proposal ? (
//                     <button
//                       onClick={handleSubmitProposal}
//                       className="bg-[#5B2D91] text-white px-6 py-3 rounded-full text-[14px] font-semibold hover:bg-[#4a2373] transition-colors"
//                     >
//                       Submit Proposal
//                     </button>
//                   ) : isRevoked ? (
//                     <button
//                       ref={changeTermsRef}
//                       onClick={handleChangeTerms}
//                       className="bg-[#5B2D91] text-white px-6 py-3 rounded-full text-[14px] font-semibold border-2 border-[#5B2D91] transition-colors hover:bg-[#4a2373] focus:ring-2 focus:ring-[#5B2D91]"
//                     >
//                       Change terms
//                     </button>
//                   ) : (
//                     <button
//                       onClick={handleChangeTerms}
//                       className="bg-[#5B2D91] text-white px-6 py-3 rounded-full text-[14px] font-semibold hover:bg-[#4a2373] transition-colors"
//                     >
//                       Change terms
//                     </button>
//                   )}

//                   {proposal && !isRevoked && (
//                     <button
//                       onClick={handleRevokeClick}
//                       className="text-[14px] font-semibold px-6 py-3 rounded-full border border-gray-600 text-gray-800 transition-colors hover:bg-[#5B2D91] hover:text-white hover:border-[#5B2D91]"
//                     >
//                       Revoke proposal
//                     </button>
//                   )}

//                   {isRevoked && (
//                     <button
//                       className="text-[14px] font-semibold px-6 py-3 rounded-full text-gray-500 bg-gray-100 cursor-not-allowed border border-gray-300"
//                       disabled
//                     >
//                       Proposal Revoked
//                     </button>
//                   )}
//                 </div>
//               </div>

//               <div className="hidden sm:block h-[1px] bg-gray-200 mt-15"></div>

//               {/* Messaging Section */}
//               <div className="lg:block">
//                 <div className="mt-3 mb-6 ml-5 text-center text-black">
//                   <p className="font-medium">
//                     Start conversations
//                     {otherUserOnline && (
//                       <span className="ml-2 inline-flex items-center">
//                         <span className="w-2 h-2 bg-green-500 rounded-full"></span>
//                         <span className="text-xs text-green-600 ml-1">Online</span>
//                       </span>
//                     )}
//                     {otherUserTyping && (
//                       <span className="ml-2 text-xs text-purple-600">typing...</span>
//                     )}
//                   </p>
//                 </div>
//                 <div className="w-full flex items-center gap-4 px-4 py-3 bg-white rounded-full border border-gray-200">
//                   <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer">
//                     <rect x="3" y="3" width="18" height="18" rx="4" />
//                     <circle cx="8.5" cy="8.5" r="1.5" />
//                     <path d="M21 15l-5-5L5 21" />
//                   </svg>
//                   <svg width="40" height="28" viewBox="0 0 40 28" fill="none" className="cursor-pointer">
//                     <rect x="1" y="1" width="38" height="26" rx="6" stroke="#7C3AED" strokeWidth="2" />
//                     <text x="9" y="19" fill="#7C3AED" fontSize="12" fontWeight="700" fontFamily="Arial, sans-serif">GIF</text>
//                   </svg>
//                   <div className="relative flex-1 h-[48px]">
//                     <div className="absolute inset-0 bg-gray-100 rounded-full"></div>
//                     <input
//                       type="text"
//                       placeholder={chatStarted ? "Reply..." : "Type your message..."}
//                       value={messageInput}
//                       onChange={handleMessageInputChange}
//                       onKeyPress={handleKeyPress}
//                       className="relative z-10 w-full h-[48px] bg-transparent pl-5 pr-4 text-[14px] text-gray-900 placeholder:text-[#9CA3AF] focus:outline-none"
//                     />
//                   </div>
//                   <button
//                     onClick={handleSendMessage}
//                     disabled={isSendingMessage || (!messageInput.trim() && !lastMessageSent)}
//                     className={`cursor-pointer ${isSendingMessage ? 'opacity-50' : ''}`}
//                   >
//                     <svg width="28" height="28" viewBox="0 0 24 24" fill={messageInput.trim() ? "#7C3AED" : "#9CA3AF"} className="transition-colors">
//                       <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
//                     </svg>
//                   </button>
//                 </div>
//                 {lastMessageSent && (
//                   <div className="mt-2 text-xs text-gray-500 text-center">
//                     Last message sent: {new Date(lastMessageSent.timestamp).toLocaleTimeString()}
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="hidden lg:block w-[1px] bg-gray-200"></div>

//             {/* ================= RIGHT SIDEBAR - DYNAMIC DATA FROM BACKEND ================= */}
//             <div className="w-full lg:w-[340px] px-6 lg:px-8 py-8">
//               <p className="hidden lg:block text-[13px] text-[#2F3A40] leading-[24px] mb-6">
//                 Required Connects to submit a <br />proposal: <b>{job?.required_connects || 6}</b><br />
//                 Available Connects: <b>{userConnects || 0}</b>
//               </p>
//               <div className="hidden lg:block h-[1px] bg-gray-200 mb-6 w-full"></div>

//               <h3 className="text-[16px] sm:text-[18px] font-semibold mb-4">About the client</h3>

//               <div className="grid grid-cols-2 sm:grid-cols-1 gap-4 sm:gap-6">
//                 {/* LEFT COLUMN - LOCATION, TIME, JOINED */}
//                 <div className="order-1 sm:order-1">
//                   <div className="space-y-2 sm:space-y-3 text-[13px] sm:text-[14px] text-[#3A3A3A] mb-4">
//                     {/* LOCATION */}
//                     <div className="flex items-center gap-2">
//                       <CountryFlag
//                         countryCode={creatorStats.country_code || creator?.country_code}
//                         country={creatorStats.country || creator?.country}
//                       />
//                       <span>{creatorStats.city || creator?.city || creatorStats.country || creator?.country || "Remote"}</span>
//                     </div>

//                     {/* TIME */}
//                     <div className="flex items-center gap-2">
//                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//                         <circle cx="12" cy="12" r="9" stroke="#6B6B6B" strokeWidth="1.5" />
//                         <path d="M12 7V12L15 14" stroke="#6B6B6B" strokeWidth="1.5" />
//                       </svg>
//                       <span>Local time unknown</span>
//                     </div>

//                     {/* JOINED */}
//                     <div className="flex items-center gap-2">
//                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//                         <path d="M6 21h12M9 17V5l3-2 3 2v12" stroke="#6B6B6B" strokeWidth="1.5" />
//                       </svg>
//                       <span>Joined {creator?.created_at ? formatTimeAgo(creator.created_at) : 'Recently'}</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* RIGHT COLUMN – STATS - DYNAMIC FROM BACKEND */}
//                 <div className="order-2 sm:order-2 space-y-1.5 sm:space-y-2 text-[13px] sm:text-[14px] text-[#3A3A3A]">
//                   <p className="font-semibold">{creatorStats.city || creator?.city || creatorStats.country || creator?.country || "Remote"}</p>
//                   <p className="font-semibold">{creatorStats.total_jobs_posted} jobs posted</p>
//                   <p className="text-[#6B6B6B]">{creatorStats.hire_rate}% hire rate</p>
//                   <p className="font-semibold">{formatCurrency(creatorStats.total_spent)}+ total spent</p>
//                   <p className="text-[#6B6B6B]">{creatorStats.total_hires} hires</p>
//                   <p className="font-semibold">${creatorStats.avg_hourly_rate}/hr avg hourly rate</p>
//                   <p className="text-[#6B6B6B]">{creatorStats.total_hours} hours</p>
//                   <p className="font-semibold">{creatorStats.company_size || 'Individual'}</p>
//                   <p className="text-[#6B6B6B]">Member since {formatMemberSince(creatorStats.member_since || creator?.created_at)}</p>
//                 </div>

//                 {/* RATING AND VERIFICATIONS */}
//                 <div className="order-2 sm:order-3 col-span-1">
//                   <div className="-mt-48 sm:mt-4">
//                     <div className="flex gap-[2px] text-purple-600 text-[16px] sm:text-[18px]">
//                       {"★".repeat(Math.floor(creatorStats.rating))}
//                       {"☆".repeat(5 - Math.floor(creatorStats.rating))}
//                     </div>
//                     <span className="text-[13px] sm:text-[14px] text-[#6B6B6B]">
//                       {creatorStats.rating}/5 ({creatorStats.reviews} Reviews)
//                     </span>
//                   </div>

//                   <div className="hidden sm:block h-[1px] bg-gray-200 my-6"></div>

//                   {/* VERIFICATIONS */}
//                   <div className="space-y-3 sm:space-y-4 text-[13px] sm:text-[14px] text-[#2b2b2b]">
//                     {/* Phone */}
//                     <div className="flex items-center gap-3">
//                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                         <path d="M22 16.9v3a2 2 0 0 1-2.2 2 A19.8 19.8 0 0 1 3 5.2 A2 2 0 0 1 5 3h3 a2 2 0 0 1 2 1.7l.5 2.5 a2 2 0 0 1-.6 1.8l-1.2 1.2 a16 16 0 0 0 6.6 6.6l1.2-1.2 a2 2 0 0 1 1.8-.6l2.5.5 a2 2 0 0 1 1.7 2.2Z"
//                           stroke={creatorStats.phone_verified ? "#5B2D91" : "#9CA3AF"}
//                           strokeWidth="1.5"
//                         />
//                       </svg>
//                       <span className={`font-semibold ${creatorStats.phone_verified ? 'text-[#5B2D91]' : 'text-gray-400'}`}>
//                         {creatorStats.phone_verified ? 'Phone Verified' : 'Phone not verified'}
//                       </span>
//                     </div>

//                     {/* Email */}
//                     <div className="flex items-center gap-3">
//                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                         <rect x="3" y="5" width="18" height="14" rx="2"
//                           stroke={creatorStats.email_verified ? "#5B2D91" : "#9CA3AF"}
//                           strokeWidth="1.5"
//                         />
//                         <path d="M3 7l9 6 9-6"
//                           stroke={creatorStats.email_verified ? "#5B2D91" : "#9CA3AF"}
//                           strokeWidth="1.5"
//                         />
//                       </svg>
//                       <span className={`font-semibold ${creatorStats.email_verified ? 'text-[#5B2D91]' : 'text-gray-400'}`}>
//                         {creatorStats.email_verified ? 'Email Verified' : 'Email not verified'}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="block sm:hidden h-[1px] bg-gray-200 my-4 w-full" />

//             <div className="lg:hidden border-t border-gray-200 px-4 py-5">
//               <p className="text-center text-[14px] font-medium text-black mb-3">
//                 Start conversations
//                 {otherUserOnline && (
//                   <span className="ml-2 inline-flex items-center">
//                     <span className="w-2 h-2 bg-green-500 rounded-full"></span>
//                     <span className="text-xs text-green-600 ml-1">Online</span>
//                   </span>
//                 )}
//                 {otherUserTyping && (
//                   <span className="ml-2 text-xs text-purple-600">typing...</span>
//                 )}
//               </p>
//               <div className="w-full flex items-center gap-3">
//                 <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer shrink-0">
//                   <rect x="3" y="3" width="18" height="18" rx="4" />
//                   <circle cx="8.5" cy="8.5" r="1.5" />
//                   <path d="M21 15l-5-5L5 21" />
//                 </svg>
//                 <svg width="36" height="26" viewBox="0 0 40 28" fill="none" className="cursor-pointer shrink-0">
//                   <rect x="1" y="1" width="38" height="26" rx="6" stroke="#7C3AED" strokeWidth="2" />
//                   <text x="9" y="19" fill="#7C3AED" fontSize="12" fontWeight="700" fontFamily="Arial, sans-serif">GIF</text>
//                 </svg>
//                 <div className="relative flex-1 h-[44px]">
//                   <div className="absolute inset-0 bg-gray-100 rounded-full"></div>
//                   <input
//                     type="text"
//                     placeholder={chatStarted ? "Reply..." : "Type your message..."}
//                     value={messageInput}
//                     onChange={handleMessageInputChange}
//                     onKeyPress={handleKeyPress}
//                     className="relative z-10 w-full h-[44px] bg-transparent pl-4 pr-3 text-[14px] text-gray-900 placeholder:text-[#9CA3AF] focus:outline-none"
//                   />
//                 </div>
//                 <button
//                   onClick={handleSendMessage}
//                   disabled={isSendingMessage || (!messageInput.trim() && !lastMessageSent)}
//                   className="cursor-pointer shrink-0"
//                 >
//                   <svg width="26" height="26" viewBox="0 0 24 24" fill={messageInput.trim() ? "#7C3AED" : "#9CA3AF"}>
//                     <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
//                   </svg>
//                 </button>
//               </div>
//               {lastMessageSent && (
//                 <div className="mt-2 text-xs text-gray-500 text-center">
//                   Last message sent: {new Date(lastMessageSent.timestamp).toLocaleTimeString()}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {showPopup && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
//           <div className="absolute inset-0 bg-black/50"></div>
//           <div className="relative bg-white rounded-2xl max-w-sm w-full text-center shadow-xl">
//             <div className="flex justify-center mt-6">
//               <img
//                 src={PopupImage}
//                 alt="Cancel Proposal"
//                 className="w-20 h-20 rounded-full object-cover"
//               />
//             </div>
//             <div className="p-6">
//               <p className="text-[16px] font-medium text-gray-900 mt-4">
//                 Are you sure you want to Cancel Proposal?
//               </p>
//               <div className="flex justify-center gap-4 mt-8">
//                 <button
//                   onClick={handleCancelClick}
//                   className="px-8 py-2 rounded-full border border-gray-300 text-gray-800 font-medium transition hover:bg-[#5B2D91] hover:text-white hover:border-[#5B2D91]"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleConfirmRevoke}
//                   className="px-8 py-2 rounded-full border border-[#5B2D91] text-[#5B2D91] bg-white font-medium transition hover:bg-[#5B2D91] hover:text-white"
//                 >
//                   Reject
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="mt-4">
//         <Footer />
//       </div>
//     </div>
//   );
// }


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
  const [isHovering, setIsHovering] = useState(false);
  const changeTermsRef = useRef(null);
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

      // If milestones_data is not in response, try to parse from milestone_description
      if (!data.milestones_data && data.milestone_description && data.milestone_description.startsWith('[')) {
        try {
          data.milestones_data = JSON.parse(data.milestone_description);
        } catch (e) {
          console.error("Failed to parse milestones from description", e);
        }
      }

      console.log("Fetched proposal with milestones:", data);
      return data;
    } catch (error) {
      console.error("Failed to fetch proposal details", error);
      toast.error("Could not load proposal details");
      return null;
    }
  };


  // Load data from navigation state
  useEffect(() => {
    const loadData = async () => {
      let jobId = null;
      let proposalId = null;

      // Check for jobId and proposalId in state
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
      // Fetch full proposal details including milestones_data
      const response = await api.get(`/proposals/${proposal.id}`);
      const fullProposal = response.data;

      console.log("Full proposal data for editing:", fullProposal);

      // Also fetch milestones_data separately if needed
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
            milestones_data: milestonesData, // ← Critical: include all milestones
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

  // ========== MESSAGING (unchanged) ==========
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

  // ========== HELPER FUNCTIONS ==========
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

    const isFixed =
      job.budget_type === "fixed" ||
      job.budget_type === "Fixed";

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

  const getAttachmentUrl = (att) => {
    if (!att) return null;
    const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
    if (att.startsWith("http://") || att.startsWith("https://")) {
      const mediaIndex = att.indexOf("/media/");
      if (mediaIndex !== -1) {
        const filePath = att.substring(mediaIndex + 7);
        return `${baseUrl}/collaborator/files/${filePath}`;
      }
      return att;
    }
    let clean = att.replace(/^\/+/, "");
    if (clean.startsWith("media/")) clean = clean.slice(6);
    return `${baseUrl}/collaborator/files/${clean}`;
  };

  const getAttachmentFileName = (att) => {
    if (!att) return "Attachment";
    return att.split("/").pop() || "Attachment";
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

              {/* Attachments (if any) */}
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
                          <a href={job.external_file_link} className="flex items-center gap-2 text-[13px] text-[#5B2D91] hover:underline">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                            View External File
                          </a>
                        )}
                        {hasWorkAtt && (() => {
                          const url = getAttachmentUrl(job.work_attachment);
                          return (
                            <a href="#" onClick={async (e) => {
                              e.preventDefault();
                              try {
                                const res = await fetch(url);
                                const blob = await res.blob();
                                const blobUrl = URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.href = blobUrl;
                                link.download = getAttachmentFileName(job.work_attachment);
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                URL.revokeObjectURL(blobUrl);
                              } catch (err) { console.error("Download failed", err); }
                            }} className="flex items-center gap-2 text-[13px] text-[#5B2D91] hover:underline">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                              {getAttachmentFileName(job.work_attachment)}
                            </a>
                          );
                        })()}
                        {hasAtts && job.attachments.map((att, i) => {
                          const url = getAttachmentUrl(att);
                          return (
                            <a key={i} href="#" onClick={async (e) => {
                              e.preventDefault();
                              try {
                                const res = await fetch(url);
                                const blob = await res.blob();
                                const blobUrl = URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.href = blobUrl;
                                link.download = getAttachmentFileName(att);
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                URL.revokeObjectURL(blobUrl);
                              } catch (err) { console.error("Download failed", err); }
                            }} className="flex items-center gap-2 text-[13px] text-[#5B2D91] hover:underline">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                              {getAttachmentFileName(att)}
                            </a>
                          );
                        })}
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