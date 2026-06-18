// import Header from "../../component/Header";
// import Footer from "../../component/Footer";
// import BannerImg from "../../assets/myproject/banner.png";

// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import api from "../../utils/axiosConfig";
// import { useUser } from "../../contexts/UserContext";
// import toast from "../../component/Toast"; // ✅ Updated import

// // Character limit constants
// const MAX_JOB_TITLE_LENGTH = 50;
// const MAX_JOB_DESCRIPTION_LENGTH = 200;

// export default function Created() {
//   const navigate = useNavigate();
//   const { userData } = useUser();
//   const { jobId } = useParams();

//   // =========================================================
//   // STATE MANAGEMENT
//   // =========================================================
//   const [files, setFiles] = useState([]);
//   const [existingFiles, setExistingFiles] = useState([]);
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [budgetType, setBudgetType] = useState("Fixed");
//   const [budget, setBudget] = useState({
//     from: "",
//     to: "",
//   });
//   const [estimateLevel, setEstimateLevel] = useState("");
//   const [estimateTime, setEstimateTime] = useState("");
//   const [durationUnit, setDurationUnit] = useState("");
//   const [durationValue, setDurationValue] = useState("");
//   const [isDurationValueOpen, setIsDurationValueOpen] = useState(false);
//   const durationValueDropdownRef = useRef(null);
//   const [skills, setSkills] = useState([]);
//   const [currentSkill, setCurrentSkill] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [jobStatus, setJobStatus] = useState(null);

//   // Error states for all required fields
//   const [titleError, setTitleError] = useState("");
//   const [descriptionError, setDescriptionError] = useState("");
//   const [skillsError, setSkillsError] = useState("");
//   const [estimateTimeError, setEstimateTimeError] = useState("");
//   const [durationUnitError, setDurationUnitError] = useState("");
//   const [durationValueError, setDurationValueError] = useState("");
//   const [estimateLevelError, setEstimateLevelError] = useState("");
//   const [budgetFromError, setBudgetFromError] = useState("");
//   const [budgetToError, setBudgetToError] = useState("");
//   const [attachmentsError, setAttachmentsError] = useState("");

//   const [isDurationOpen, setIsDurationOpen] = useState(false);
//   const durationDropdownRef = useRef(null);

//   // Search functionality states
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [showResults, setShowResults] = useState(false);

//   // Predefined skills array for search
//   const predefinedSkills = [
//     "Web Design", "UI/UX Design", "Graphic Design", "Logo Design", "Branding",
//     "Frontend Development", "Backend Development", "Full Stack Development",
//     "React", "Angular", "Vue.js", "Node.js", "Python", "JavaScript", "TypeScript",
//     "Mobile Development", "iOS", "Android", "React Native", "Flutter",
//     "Data Science", "Machine Learning", "AI", "Database Design", "DevOps",
//     "Cloud Computing", "AWS", "Azure", "SEO", "Digital Marketing",
//     "Content Writing", "Copywriting", "Translation", "Video Editing",
//     "Photography", "Illustration", "3D Modeling", "Animation",
//     "Project Management", "Business Analysis", "QA Testing", "Cybersecurity"
//   ];

//   // Duration options
//   const durationOptions = [
//     { value: "", label: "Select Duration" },
//     { value: "days", label: "Days" },
//     { value: "weeks", label: "Weeks" },
//     { value: "months", label: "Months" },
//     { value: "years", label: "Years" },
//   ];

//   const getDurationValues = () => {
//     switch (durationUnit) {
//       case "days":
//         return [
//           "1 Day",
//           "2 Days",
//           "3 Days",
//           "4 Days",
//           "5 Days",
//           "6 Days",
//         ];

//       case "weeks":
//         return [
//           "1 Week",
//           "2 Weeks",
//           "3 Weeks",
//         ];

//       case "months":
//         return [
//           "1 Month",
//           "2 Months",
//           "3 Months",
//           "4 Months",
//           "5 Months",
//           "6 Months",
//           "7 Months",
//           "8 Months",
//           "9 Months",
//           "10 Months",
//           "11 Months",
//         ];

//       case "years":
//         return [
//           "1 Year",
//           "2 Years",
//           "3 Years",
//         ];

//       default:
//         return [];
//     }
//   };

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (durationDropdownRef.current && !durationDropdownRef.current.contains(event.target)) {
//         setIsDurationOpen(false);
//       }
//       if (
//         durationValueDropdownRef.current &&
//         !durationValueDropdownRef.current.contains(event.target)
//       ) {
//         setIsDurationValueOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   // =========================================================
//   // VALIDATION FUNCTIONS
//   // =========================================================

//   const validateTitle = (value) => {
//     if (!value.trim()) {
//       return "Job title is required";
//     }
//     if (value.trim().length < 3) {
//       return "Job title must be at least 3 characters long";
//     }
//     if (value.trim().length > MAX_JOB_TITLE_LENGTH) {
//       return `Job title must be less than ${MAX_JOB_TITLE_LENGTH} characters`;
//     }
//     return "";
//   };

//   const validateDescription = (value) => {
//     if (!value.trim()) {
//       return "Description is required";
//     }
//     if (value.trim().length < 10) {
//       return "Description must be at least 10 characters long";
//     }
//     if (value.trim().length > MAX_JOB_DESCRIPTION_LENGTH) {
//       return `Description must be less than ${MAX_JOB_DESCRIPTION_LENGTH} characters`;
//     }
//     return "";
//   };

//   const validateSkills = (value) => {
//     if (!value.length) {
//       return "Please add at least one skill";
//     }
//     return "";
//   };

//   const validateEstimateTime = (value) => {
//     if (!value) {
//       return "Please select project size (Small, Medium, or Large)";
//     }
//     return "";
//   };

//   const validateDurationUnit = (value) => {
//     if (!value) {
//       return "Please select project duration";
//     }
//     return "";
//   };
//   const validateDurationValue = (value) => {
//     if (!value) {
//       return "Please select duration time";
//     }
//     return "";
//   };

//   const validateEstimateLevel = (value) => {
//     if (!value) {
//       return "Please select expertise level";
//     }
//     return "";
//   };
//   const validateBudgetFrom = (value) => {
//     if (!value) {
//       return "Budget is required";
//     }

//     if (parseFloat(value) <= 0) {
//       return "Budget must be greater than 0";
//     }

//     return "";
//   };

//   const validateBudgetTo = (value) => {
//     // Fixed price does not need "to" budget
//     if (budgetType === "Fixed") {
//       return "";
//     }

//     if (!value) {
//       return "Budget to is required";
//     }

//     if (parseFloat(value) <= 0) {
//       return "Budget must be greater than 0";
//     }

//     if (parseFloat(value) < parseFloat(budget.from)) {
//       return "Budget to must be greater than budget from";
//     }

//     return "";
//   };

//   const validateAttachments = () => {
//     // Only validate attachments for new job creation (not for edit)
//     if (!jobId && files.length === 0 && existingFiles.length === 0) {
//       return "Please upload at least one attachment";
//     }
//     return "";
//   };

//   const validateFileSize = (fileList) => {
//     const MAX_SIZE_MB = 25;
//     const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

//     for (let i = 0; i < fileList.length; i++) {
//       if (fileList[i].size > MAX_SIZE_BYTES) {
//         return `File "${fileList[i].name}" exceeds the maximum 25MB limit`;
//       }
//     }
//     return "";
//   };

//   const handleTitleChange = (e) => {
//     let newValue = e.target.value;
//     // Prevent exceeding max length
//     if (newValue.length > MAX_JOB_TITLE_LENGTH) {
//       newValue = newValue.slice(0, MAX_JOB_TITLE_LENGTH);
//     }
//     setTitle(newValue);
//     const error = validateTitle(newValue);
//     setTitleError(error);
//   };

//   const handleDescriptionChange = (e) => {
//     let newValue = e.target.value;
//     // Prevent exceeding max length
//     if (newValue.length > MAX_JOB_DESCRIPTION_LENGTH) {
//       newValue = newValue.slice(0, MAX_JOB_DESCRIPTION_LENGTH);
//     }
//     setDescription(newValue);
//     const error = validateDescription(newValue);
//     setDescriptionError(error);
//   };

//   // =========================================================
//   // SKILL FUNCTIONALITY - SINGLE INPUT WITH SEARCH
//   // =========================================================

//   const handleSkillChange = (e) => {
//     const query = e.target.value;
//     setCurrentSkill(query);
//     setSearchQuery(query);

//     if (query.trim() === "") {
//       setSearchResults([]);
//       setShowResults(false);
//       return;
//     }

//     const filtered = predefinedSkills.filter(skill =>
//       skill.toLowerCase().includes(query.toLowerCase())
//     );

//     setSearchResults(filtered);
//     setShowResults(true);
//   };

//   const addSkill = (skill) => {
//   const trimmedSkill = skill.trim();

//   // Allow letters, spaces, forward slashes, dots, hyphens, and ampersands
//   // More permissive - allows most common skill name characters
// const skillRegex = /^[A-Za-z0-9\s\/\.\-&\+\(\)#]+$/;

//   // Empty validation
//   if (!trimmedSkill) {
//     toast.error("Invalid Skill", "Skill cannot be empty");
//     return;
//   }

//   // Invalid characters validation
//   if (!skillRegex.test(trimmedSkill)) {
//     toast.error(
//       "Invalid Skill",
//       "Skills can contain letters, spaces, forward slashes (/), dots (.), hyphens (-), and ampersands (&)"
//     );
//     return;
//   }

//   // Rest of your validation remains the same...
//   // Minimum length validation
//   if (trimmedSkill.length < 2) {
//     toast.error(
//       "Invalid Skill",
//       "Skill must be at least 2 characters"
//     );
//     return;
//   }

//   // Duplicate validation
//   if (skills.includes(trimmedSkill)) {
//     toast.error("Duplicate skill", "Skill already added");
//     return;
//   }

//   // Max limit validation
//   if (skills.length >= 15) {
//     toast.error("Maximum limit", "Maximum 15 skills allowed");
//     return;
//   }

//   // Add valid skill
//   setSkills([...skills, trimmedSkill]);
//   setSkillsError("");

//   toast.success("Skill added", `"${trimmedSkill}" added`);

//   setCurrentSkill("");
//   setSearchQuery("");
//   setSearchResults([]);
//   setShowResults(false);
// };

//   const handleSkillKeyDown = (e) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       const trimmed = currentSkill.trim();
//       if (trimmed) {
//         addSkill(trimmed);
//       }
//     } else if (e.key === "Escape") {
//       setShowResults(false);
//       setSearchResults([]);
//     }
//   };

//   const removeSkill = (skillToRemove) => {
//     setSkills(skills.filter((s) => s !== skillToRemove));
//     if (skills.length - 1 === 0) {
//       setSkillsError("Please add at least one skill");
//     }
//     toast.success(`Skill removed`, `"${skillToRemove}" removed`);
//   };

//   // =========================================================
//   // VALIDATE ALL FIELDS BEFORE SUBMISSION
//   // =========================================================
//   const validateAllFields = () => {
//     const titleErr = validateTitle(title);
//     const descErr = validateDescription(description);
//     const skillsErr = validateSkills(skills);
//     const estimateTimeErr = validateEstimateTime(estimateTime);
//     const durationErr = validateDurationUnit(durationUnit);
//     const durationValueErr = validateDurationValue(durationValue);
//     const estimateLevelErr = validateEstimateLevel(estimateLevel);
//     const budgetFromErr = validateBudgetFrom(budget.from);
//     const budgetToErr = validateBudgetTo(budget.to);
//     const attachmentsErr = validateAttachments();

//     setTitleError(titleErr);
//     setDescriptionError(descErr);
//     setSkillsError(skillsErr);
//     setEstimateTimeError(estimateTimeErr);
//     setDurationUnitError(durationErr);
//     setDurationValueError(durationValueErr);
//     setEstimateLevelError(estimateLevelErr);
//     setBudgetFromError(budgetFromErr);
//     setBudgetToError(budgetToErr);
//     setAttachmentsError(attachmentsErr);

//     return !(titleErr || descErr || skillsErr || estimateTimeErr || durationErr || durationValueErr ||
//       estimateLevelErr || budgetFromErr || budgetToErr || attachmentsErr);
//   };

//   // =========================================================
//   // FETCH JOB DATA IF IN EDIT MODE
//   // =========================================================
//   useEffect(() => {
//     const fetchJobForEdit = async () => {
//       if (jobId) {
//         setLoading(true);
//         try {
//           const me = await api.get("/auth/me");
//           const employerId = me.data.id;

//           let jobData = null;
//           let status = null;

//           try {
//             const draftResponse = await api.get(`/jobs/my-jobs/${employerId}?status=draft`);
//             const draftJobs = draftResponse.data.jobs || [];
//             jobData = draftJobs.find(job => job.id === parseInt(jobId));
//             if (jobData) status = "draft";
//           } catch (error) {
//             console.log("No drafts found or error fetching drafts");
//           }

//           if (!jobData) {
//             try {
//               const postedResponse = await api.get(`/jobs/my-jobs/${employerId}?status=posted`);
//               const postedJobs = postedResponse.data.jobs || [];
//               jobData = postedJobs.find(job => job.id === parseInt(jobId));
//               if (jobData) status = "posted";
//             } catch (error) {
//               console.log("No posted jobs found or error fetching posted jobs");
//             }
//           }

//           if (!jobData) {
//             try {
//               const directResponse = await api.get(`/jobs/${jobId}`);
//               jobData = directResponse.data;
//               if (jobData) {
//                 status = jobData.status || "unknown";
//               }
//             } catch (error) {
//               console.log("Direct job fetch failed");
//             }
//           }

//           if (!jobData) {
//             toast.error("Job not found", "The requested job could not be found");
//             setLoading(false);
//             return;
//           }

//           console.log("Fetched job data:", jobData);
//           setJobStatus(status);
          
//           // Truncate title and description if they exceed limits
//           let fetchedTitle = jobData.title || "";
//           let fetchedDescription = jobData.description || "";
          
//           if (fetchedTitle.length > MAX_JOB_TITLE_LENGTH) {
//             fetchedTitle = fetchedTitle.slice(0, MAX_JOB_TITLE_LENGTH);
//           }
//           if (fetchedDescription.length > MAX_JOB_DESCRIPTION_LENGTH) {
//             fetchedDescription = fetchedDescription.slice(0, MAX_JOB_DESCRIPTION_LENGTH);
//           }
          
//           setTitle(fetchedTitle);
//           setDescription(fetchedDescription);

//           const titleErr = validateTitle(fetchedTitle);
//           const descErr = validateDescription(fetchedDescription);
//           setTitleError(titleErr);
//           setDescriptionError(descErr);

//           if (jobData.skills) {
//             if (Array.isArray(jobData.skills)) {
//               setSkills(jobData.skills);
//             } else if (typeof jobData.skills === 'string') {
//               setSkills(jobData.skills.split(',').map(s => s.trim()).filter(s => s));
//             }
//           }

//           if (jobData.budget_type) {
//             setBudgetType(jobData.budget_type === "fixed" ? "Fixed" : "Hourly");
//           }

//           setBudget({
//             from: jobData.budget_from || "",
//             to: jobData.budget_to || "",
//           });

//           if (jobData.expertise_level) {
//             const level = jobData.expertise_level.charAt(0).toUpperCase() +
//               jobData.expertise_level.slice(1);
//             setEstimateLevel(level);
//           }

//           // Parse duration for edit mode
//           if (jobData.duration) {
//             // Expected format like "1 Day", "2 Weeks", etc.
//             setDurationValue(jobData.duration);
//             // Extract unit from the duration string
//             const parts = jobData.duration.split(' ');
//             if (parts.length >= 2) {
//               let unit = parts[1].toLowerCase();
//               // Handle plural to singular conversion for matching durationUnit
//               if (unit === 'days') unit = 'days';
//               else if (unit === 'weeks') unit = 'weeks';
//               else if (unit === 'months') unit = 'months';
//               else if (unit === 'years') unit = 'years';
//               setDurationUnit(unit);
//             }
//           }

//           if (jobData.timeline) {
//             const formattedSize =
//               jobData.timeline.charAt(0).toUpperCase() +
//               jobData.timeline.slice(1).toLowerCase();

//             setEstimateTime(formattedSize);
//           }

//           if (jobData.attachments && jobData.attachments.length > 0) {
//             setExistingFiles(jobData.attachments);
//           }

//         } catch (error) {
//           console.error("Error fetching job for edit:", error);
//           toast.error("Load failed", "Failed to load job data for editing. Please try again.");
//         } finally {
//           setLoading(false);
//         }
//       }
//     };

//     fetchJobForEdit();
//   }, [jobId]);

//   // =========================================================
//   // SUBMIT LOGIC
//   // =========================================================
//   const submitJob = async (status) => {
//     // Validate all fields before submission
//     const isValid = validateAllFields();

//     if (!isValid) {
//       // Show toast for the first error
//       if (titleError) {
//         toast.error(titleError);
//       } else if (descriptionError) {
//         toast.error(descriptionError);
//       } else if (skillsError) {
//         toast.error(skillsError);
//       } else if (estimateTimeError) {
//         toast.error(estimateTimeError);
//       } else if (durationUnitError) {
//         toast.error(durationUnitError);
//       }
//       else if (durationValueError) {
//         toast.error(durationValueError);
//       }
//       else if (estimateLevelError) {
//         toast.error(estimateLevelError);
//       } else if (budgetFromError) {
//         toast.error(budgetFromError);
//       } else if (budgetToError) {
//         toast.error(budgetToError);
//       } else if (attachmentsError) {
//         toast.error(attachmentsError);
//       }
//       return;
//     }

//     if (!userData?.id) {
//       toast.error("Authentication Error", "User not authenticated");
//       return;
//     }

//     const loadingToastId = toast.loading(jobId ? "Updating job..." : "Creating job...");

//     try {
//       const formData = new FormData();
//       formData.append("title", title.trim());
//       formData.append("description", description.trim());
//       formData.append("skills", skills.join(","));
//       // Updated duration submission
//       formData.append("duration", durationValue);
//       formData.append("expertise_level", estimateLevel.trim().toLowerCase());
//       formData.append("budget_type", budgetType === "Fixed" ? "fixed" : "hourly");
//       formData.append("project_size", estimateTime.toLowerCase());

//       const budgetFrom = parseFloat(budget.from);
//       const budgetTo = budgetType === "Fixed" ? budgetFrom : parseFloat(budget.to);

//       formData.append("budget_from", String(budgetFrom));
//       formData.append("budget_to", String(budgetTo));
//       formData.append("status", status === "posted" ? "posted" : "draft");

//       if (files.length > 0) {
//         files.forEach((file) => {
//           if (file.size > 0) {
//             formData.append("attachments", file);
//           }
//         });
//       }

//       if (jobId) {
//         await api.put(`/jobs/edit/${jobId}`, formData, {
//           headers: { "Content-Type": "multipart/form-data" },
//         });
//         toast.dismiss(loadingToastId);
//         toast.success("Job updated", "Job updated successfully!");

//         // After update, navigate based on status
//         if (status === "posted") {
//           navigate("/job-created");
//         } else {
//           navigate("/job-created");
//         }
//       } else {
//         await api.post(`/jobs/create/${userData.id}`, formData, {
//           headers: { "Content-Type": "multipart/form-data" },
//         });
//         toast.dismiss(loadingToastId);

//         // Show appropriate toast message based on status
//         if (status === "posted") {
//           toast.success("Job posted", "Job posted successfully!");
//           navigate("/job-created");
//         } else {
//           toast.success("Draft saved", "Job saved as draft successfully!");
//           navigate("/job-created");
//         }
//       }

//     } catch (err) {
//       toast.dismiss(loadingToastId);
//       console.error("Job submission failed", err);
//       const errorMsg = err.response?.data?.detail || "Failed to submit job";
//       toast.error("Submission Failed", typeof errorMsg === "string" ? errorMsg : "An error occurred");
//     }
//   };

//   const handleFiles = (fileList) => {
//     const newFiles = Array.from(fileList);

//     // Validate file sizes
//     const sizeError = validateFileSize(newFiles);
//     if (sizeError) {
//       toast.error("File too large", sizeError);
//       return;
//     }

//     const validFiles = newFiles.filter(file => file.size > 0);
//     setFiles((prev) => [...prev, ...validFiles]);
//     setAttachmentsError("");
//     if (validFiles.length > 0) {
//       toast.success("Files added", `${validFiles.length} file(s) added`);
//     }
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     handleFiles(e.dataTransfer.files);
//   };

//   const removeExistingFile = (indexToRemove) => {
//     setExistingFiles(existingFiles.filter((_, index) => index !== indexToRemove));
//     toast.success("File removed", "File has been removed");
//   };

//   const removeNewFile = (indexToRemove) => {
//     setFiles(files.filter((_, index) => index !== indexToRemove));
//     toast.success("File removed", "File has been removed");
//   };

//   if (loading) {
//     return (
//       <div className="w-full min-h-screen flex flex-col overflow-x-hidden edit-page">
//         <Header />
//         <section className="w-full flex-1 bg-white flex justify-center items-center py-[100px] px-4">
//           <div className="text-center">
//             <div className="w-16 h-16 border-4 border-[#51218F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//             <p className="text-[#51218F] font-semibold">Loading job data...</p>
//           </div>
//         </section>
//         <Footer />
//       </div>
//     );
//   }

//   return (
//     <div className="w-full min-h-screen bg-[#F5F5F5]">
//       <div className="absolute top-0 left-0 w-full z-50">
//         <Header />
//       </div>

//       {/* Banner Section */}
//       <div className="relative w-full h-[433px] overflow-hidden">
//         <div
//           className="absolute inset-0 w-full h-full"
//           style={{
//             backgroundImage: `url(${BannerImg})`,
//             backgroundRepeat: "no-repeat",
//             backgroundPosition: "center",
//             backgroundSize: "cover",
//           }}
//         >
//           <div className="absolute inset-0 bg-black opacity-30"></div>
//         </div>
//       </div>

//       <div className="relative mt-3 md:-mt-[150px] flex justify-center px-2 md:px-6 pb-20">
//         <div className="relative w-full max-w-[1163px] bg-white rounded-[10px] shadow-[0px_4px_45px_rgba(0,0,0,0.12)] p-6 md:p-[40px] flex flex-col h-fit">

//           {/* Back Button */}
//           <div className="flex justify-start mb-2 md:mb-4">
//             <button
//               onClick={() => navigate(-1)}
//               className="flex items-center gap-2 px-4 py-2 text-white hover:text-white/80 transition-colors group"
//             >
//               <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-[#51218F] to-[#2a0e4a] group-hover:from-[#3d1768] group-hover:to-[#1a0830] transition-all">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
//                   <path d="M19 12H5M12 19l-7-7 7-7" />
//                 </svg>
//               </div>
//               <span className="font-medium text-base text-black">Back</span>
//             </button>
//           </div>

//           {/* Edit Mode Indicator */}
//           {jobId && (
//             <div className="text-[#51218F] text-sm font-semibold mb-2">
//               Editing {jobStatus === "draft" ? "Draft" : "Job"}
//             </div>
//           )}

//           {/* Top Divider */}
//           <div className="w-full h-[1px] bg-[rgba(0,0,0,0.1)] "></div>

//           {/* Content Layout */}
//           <div className="flex flex-col">

//             {/* LEFT SIDE CONTENT - FULL WIDTH */}
//             <div className="flex-1 flex flex-col gap-8">

//               {/* Job Title Group */}
//               <div className="flex flex-col gap-3 mt-6">
//                 <label className="font-['Montserrat'] font-bold text-[16px] leading-none tracking-normal text-[#2A1E17]">
//                   Job title <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="ex, need Web developer for figma"
//                   value={title}
//                   onChange={handleTitleChange}
//                   maxLength={MAX_JOB_TITLE_LENGTH}
//                   className="w-full h-[45px] rounded-[10px] !border !border-black/30 text-[#040200] font-['Montserrat'] font-semibold text-[16px] px-4 outline-none placeholder-gray-400"
//                 />
//                 <div className="flex justify-between items-center">
//                   {titleError && (
//                     <p className="text-red-500 text-xs font-['Montserrat']">{titleError}</p>
//                   )}
//                   <p className={`text-xs font-['Montserrat'] ml-auto ${title.length > MAX_JOB_TITLE_LENGTH ? 'text-red-500' : 'text-gray-400'}`}>
//                     {title.length}/{MAX_JOB_TITLE_LENGTH} characters
//                   </p>
//                 </div>
//               </div>

//               {/* Description Group */}
//               <div className="flex flex-col gap-3">
//                 <label className="font-['Montserrat'] font-semibold text-[#2A1E17] text-[16px] leading-none tracking-normal">
//                   Describe about the project <span className="text-red-500">*</span>
//                 </label>
//                 <textarea
//                   placeholder="write here"
//                   value={description}
//                   onChange={handleDescriptionChange}
//                   maxLength={MAX_JOB_DESCRIPTION_LENGTH}
//                   className="w-full h-[287px] rounded-[10px] !border !border-black/30 p-4 resize-none font-['Montserrat'] text-[16px] outline-none placeholder-gray-400"
//                 />
//                 <div className="flex justify-between items-center">
//                   {descriptionError && (
//                     <p className="text-red-500 text-xs font-['Montserrat']">{descriptionError}</p>
//                   )}
//                   <p className={`text-xs font-['Montserrat'] ml-auto ${description.length > MAX_JOB_DESCRIPTION_LENGTH ? 'text-red-500' : 'text-gray-400'}`}>
//                     {description.length}/{MAX_JOB_DESCRIPTION_LENGTH} characters
//                   </p>
//                 </div>
//               </div>

//               {/* Skills Group - Single Input with Search */}
//               <div className="flex flex-col gap-3">
//                 <label className="font-['Montserrat'] font-bold text-[16px] leading-none tracking-normal text-[#2A1E17]">
//                   Skills <span className="text-red-500">*</span>
//                 </label>

//                 <div className="relative">
//                   <input
//                     type="text"
//                     placeholder="Type a skill and press Enter to add"
//                     value={currentSkill}
//                     onChange={handleSkillChange}
//                     onKeyDown={handleSkillKeyDown}
//                     className="w-full h-[45px] rounded-[10px] !border !border-black/30 px-4 font-['Montserrat'] font-semibold text-[16px] text-[#040200] outline-none placeholder-gray-400"
//                   />

//                   {/* Search Results as Purple Tags */}
//                   {showResults && searchResults.length > 0 && (
//                     <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-h-48 overflow-y-auto">
//                       <div className="flex flex-wrap gap-2">
//                         {searchResults.map((skill, index) => (
//                           <button
//                             key={index}
//                             onClick={() => addSkill(skill)}
//                             className="px-3 py-1.5 bg-[#51218F] text-white rounded-full text-[12px] font-medium hover:bg-[#3D1768] transition-colors"
//                           >
//                             {skill}
//                           </button>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Selected Skills Display */}
//                 <div className="w-full min-h-[45px] rounded-[10px] !border !border-black/30 flex flex-wrap items-center gap-2 px-3 py-1.5">
//                   {skills.map((skill, index) => (
//                     <span key={index} className="flex items-center gap-1 px-3 py-1 bg-[#51218F] text-white rounded-full text-[14px] font-['Montserrat'] font-medium">
//                       {skill}
//                       <button
//                         type="button"
//                         onClick={() => removeSkill(skill)}
//                         className="hover:text-gray-200 focus:outline-none rounded-full"
//                       >×</button>
//                     </span>
//                   ))}
//                   {skills.length === 0 && (
//                     <span className="text-gray-400 text-[14px] font-['Montserrat']">No skills added yet</span>
//                   )}
//                 </div>
//                 {skillsError && (
//                   <p className="text-red-500 text-xs font-['Montserrat'] mt-1">{skillsError}</p>
//                 )}
//                 <p className="text-right text-[16px] mt-2 font-['Montserrat'] font-regular text-gray-500">Add max 15 skills | Type and press Enter to add custom skills</p>
//               </div>

//               <div className="w-full h-[1px] bg-[rgba(0,0,0,0.1)]"></div>

//               {/* Estimate Time Section */}
//               <div className="flex flex-col gap-4 ">
//                 <label className="font-['Montserrat'] font-bold text-[16px] leading-none tracking-normal text-[#2A1E17]">
//                   Estimate your timeline here <span className="text-red-500">*</span>
//                 </label>
//                 <div className="flex flex-wrap gap-6 mb-2">
//                   {["Small", "Medium", "Large"].map((option) => (
//                     <label key={option} className="flex items-center gap-2 cursor-pointer group">
//                       <input
//                         type="radio"
//                         name="estimateTime"
//                         value={option}
//                         checked={estimateTime === option}
//                         onChange={(e) => {
//                           setEstimateTime(e.target.value);
//                           setEstimateTimeError("");
//                         }}
//                         className="hidden"
//                       />
//                       <div className={`w-4 h-4 rounded-full !border flex items-center justify-center transition-all ${estimateTime === option ? '!border-[#51218F]' : '!border-gray-400'}`}>
//                         {estimateTime === option && <div className="w-2.5 h-2.5 rounded-full bg-[#51218F]"></div>}
//                       </div>
//                       <span className={`font-['Montserrat'] text-[14px] ${estimateTime === option ? 'font-bold text-black' : 'font-medium text-[#040200]'}`}>{option}</span>
//                     </label>
//                   ))}
//                 </div>
//                 {estimateTimeError && (
//                   <p className="text-red-500 text-xs font-['Montserrat'] mt-1">{estimateTimeError}</p>
//                 )}

//                 <div className="flex flex-col gap-2">
//                   <label className="font-['Montserrat'] font-semibold text-[14px] text-[#2A1E17]">
//                     How long your work take? <span className="text-red-500">*</span>
//                   </label>

//                   {/* Two Dropdowns Section - UPDATED */}
//                   <div className="flex gap-4 flex-wrap">

//                     {/* First Dropdown */}
//                     <div className="relative" ref={durationDropdownRef}>
//                       <div
//                         onClick={() => setIsDurationOpen(!isDurationOpen)}
//                         className="w-full sm:w-[322px] h-[45px] rounded-[10px] !border !border-black/30 px-4 font-['Montserrat'] font-semibold text-[16px] bg-white flex items-center justify-between cursor-pointer"
//                       >
//                         <span className={durationUnit ? "text-[#040200]" : "text-gray-400"}>
//                           {durationOptions.find(opt => opt.value === durationUnit)?.label || "Select Duration"}
//                         </span>

//                         <svg
//                           className={`transform transition-transform duration-200 ${isDurationOpen ? 'rotate-180' : ''}`}
//                           width="12"
//                           height="8"
//                           viewBox="0 0 12 8"
//                           fill="none"
//                         >
//                           <path
//                             d="M1 1.5L6 6.5L11 1.5"
//                             stroke="black"
//                             strokeWidth="1.5"
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                           />
//                         </svg>
//                       </div>

//                       {isDurationOpen && (
//                         <div className="absolute z-50 w-full sm:w-[322px] mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
//                           {durationOptions.map((option) => (
//                             <div
//                               key={option.value}
//                               onClick={() => {
//                                 setDurationUnit(option.value);
//                                 setDurationValue("");
//                                 setDurationUnitError("");
//                                 setIsDurationOpen(false);
//                               }}
//                               className={`px-4 py-3 cursor-pointer transition-colors hover:bg-purple-50 font-['Montserrat'] text-[14px]
//                               ${durationUnit === option.value
//                                   ? 'bg-purple-50 text-[#51218F] font-semibold'
//                                   : 'text-gray-700'}
//                               ${option.value === '' ? 'text-gray-400' : ''}`}
//                             >
//                               {option.label}
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>

//                     {/* Second Dropdown */}
//                     {durationUnit && durationUnit !== "fixed" && (
//                       <div className="relative" ref={durationValueDropdownRef}>
//                         <div
//                           onClick={() => setIsDurationValueOpen(!isDurationValueOpen)}
//                           className="w-full sm:w-[322px] h-[45px] rounded-[10px] !border !border-black/30 px-4 font-['Montserrat'] font-semibold text-[16px] bg-white flex items-center justify-between cursor-pointer"
//                         >
//                           <span className={durationValue ? "text-[#040200]" : "text-gray-400"}>
//                             {durationValue || "Select Time"}
//                           </span>

//                           <svg
//                             className={`transform transition-transform duration-200 ${isDurationValueOpen ? 'rotate-180' : ''}`}
//                             width="12"
//                             height="8"
//                             viewBox="0 0 12 8"
//                             fill="none"
//                           >
//                             <path
//                               d="M1 1.5L6 6.5L11 1.5"
//                               stroke="black"
//                               strokeWidth="1.5"
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                             />
//                           </svg>
//                         </div>

//                         {isDurationValueOpen && (
//                           <div className="absolute z-50 w-full sm:w-[322px] mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-[250px] overflow-y-auto">
//                             {getDurationValues().map((item, index) => (
//                               <div
//                                 key={index}
//                                 onClick={() => {
//                                   setDurationValue(item);
//                                   setIsDurationValueOpen(false);
//                                 }}
//                                 className={`px-4 py-3 cursor-pointer transition-colors hover:bg-purple-50 font-['Montserrat'] text-[14px]
//                                 ${durationValue === item
//                                     ? 'bg-purple-50 text-[#51218F] font-semibold'
//                                     : 'text-gray-700'}`}
//                               >
//                                 {item}
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                     )}
//                   </div>

//                   {durationUnitError && (
//                     <p className="text-red-500 text-xs font-['Montserrat'] mt-1">{durationUnitError}</p>
//                   )}
//                   {durationValueError && (
//                     <p className="text-red-500 text-xs font-['Montserrat'] mt-1">
//                       {durationValueError}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               <div className="w-full h-[1px] bg-[rgba(0,0,0,0.1)]"></div>

//               {/* Expertise level section */}
//               <div className="flex flex-col gap-4">
//                 <label className="font-['Montserrat'] font-bold text-[16px] leading-none tracking-normal text-[#2A1E17]">
//                   Expertise level you want <span className="text-red-500">*</span>
//                 </label>
//                 <div className="flex flex-wrap gap-6 mb-2">
//                   {["Fresher", "Medium", "Experienced"].map((option) => (
//                     <label key={option} className="flex items-center gap-2 cursor-pointer group">
//                       <input
//                         type="radio"
//                         name="estimateLevel"
//                         value={option}
//                         checked={estimateLevel === option}
//                         onChange={(e) => {
//                           setEstimateLevel(e.target.value);
//                           setEstimateLevelError("");
//                         }}
//                         className="hidden"
//                       />
//                       <div className={`w-4 h-4 rounded-full !border flex items-center justify-center transition-all ${estimateLevel === option ? '!border-[#51218F]' : '!border-gray-400'}`}>
//                         {estimateLevel === option && <div className="w-2.5 h-2.5 rounded-full bg-[#51218F]"></div>}
//                       </div>
//                       <span className={`font-['Montserrat'] text-[14px] ${estimateLevel === option ? 'font-bold text-black' : 'font-medium text-[#040200]'}`}>{option}</span>
//                     </label>
//                   ))}
//                 </div>
//                 {estimateLevelError && (
//                   <p className="text-red-500 text-xs font-['Montserrat'] mt-1">{estimateLevelError}</p>
//                 )}
//               </div>

//               <div className="w-full h-[1px] bg-[rgba(0,0,0,0.1)]"></div>

//               {/* Budget Section */}
//               <div className="flex flex-col gap-6">
//                 <label className="font-['Montserrat'] font-bold text-[16px] leading-none tracking-normal text-[#2A1E17]">
//                   Tell us about your budget? <span className="text-red-500">*</span>
//                 </label>
//                 <div className="flex flex-wrap gap-6">
//                   {[{ key: "Fixed", label: "Fixed price", icon: "tag" }].map((item) => (
//                     <label key={item.key} className={`relative w-[190px] h-[94px] rounded-[12px] !border cursor-pointer flex items-center justify-center gap-3 transition-all ${budgetType === item.key ? "!border-[#51218F] text-[#51218F]" : "!border-gray-300 text-[#2A1E17]"}`}>
//                       <input
//                         type="radio"
//                         name="budgetType"
//                         value={item.key}
//                         checked={budgetType === item.key}
//                         onChange={() => setBudgetType(item.key)}
//                         className="hidden"
//                       />
//                       <div className={`absolute top-[10px] left-[10px] w-[18px] h-[18px] rounded-full !border flex items-center justify-center ${budgetType === item.key ? "!border-[#51218F]" : "!border-gray-400"}`}>
//                         {budgetType === item.key && <div className="w-[10px] h-[10px] rounded-full bg-[#51218F]" />}
//                       </div>
//                       {item.icon === "tag" ? (
//                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41L11 3H3v8l9.59 9.59a2 2 0 0 0 2.82 0l5.18-5.18a2 2 0 0 0 0-2.82z" /><circle cx="7.5" cy="7.5" r="1.5" /></svg>
//                       ) : (
//                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2h12M6 22h12M6 2c0 6 6 6 6 10s-6 4-6 10M18 2c0 6-6 6-6 10s6 4 6 10" /></svg>
//                       )}
//                       <span className="font-['Montserrat'] font-bold text-[20px]">{item.label}</span>
//                     </label>
//                   ))}
//                 </div>

//                 <div className="flex flex-wrap gap-10 mt-2">
//                   <div className="flex flex-col gap-2">
//                     <label className="font-['Montserrat'] font-semibold text-[16px] text-[#2A1E17] capitalize">
//                       Budget <span className="text-red-500">*</span>
//                     </label>
//                     <div className="flex items-center gap-2">
//                       <div className="flex items-center w-[165px] h-[45px] rounded-[10px] !border !border-gray-300 px-3">
//                         <span className="text-[18px] font-bold text-black">₹</span>
//                         <input
//                           type="number"
//                           value={budget.from}
//                           onWheel={(e) => {
//     e.preventDefault();
//     e.target.blur();  // Remove focus when scrolling
//   }}
//                           onChange={(e) => {
//                             setBudget({ ...budget, from: e.target.value });
//                             setBudgetFromError("");
//                           }}
//                           className="w-full text-right text-[18px] font-bold outline-none bg-transparent pl-2 no-spinner"
//                         />
//                       </div>
//                     </div>
//                     {budgetFromError && (
//                       <p className="text-red-500 text-xs font-['Montserrat'] mt-1">{budgetFromError}</p>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               <div className="w-full h-[1px] bg-[rgba(0,0,0,0.1)]"></div>

//               {/* Attachments Section */}
//               <div className="flex flex-col gap-4">
//                 <label className="font-['Montserrat'] font-semibold text-[16px] text-[#2A1E17]">
//                   Attachments {!jobId && <span className="text-red-500">*</span>}
//                 </label>
//                 <p className="text-xs text-gray-500 -mt-2">Max file size: 25MB per file</p>

//                 {/* Existing files display */}
//                 {existingFiles.length > 0 && (
//                   <div className="mb-2">
//                     <p className="text-sm text-gray-500 mb-1">Existing files:</p>
//                     <ul className="flex flex-col gap-1">
//                       {existingFiles.map((file, index) => (
//                         <li key={`existing-${index}`} className="flex items-center justify-between text-[14px] font-['Montserrat'] text-gray-600 bg-gray-50 p-2 rounded">
//                           <span>• {typeof file === 'string' ? file : file.name || 'Attachment'}</span>
//                           <button
//                             onClick={() => removeExistingFile(index)}
//                             className="text-red-500 hover:text-red-700 ml-2"
//                           >
//                             ✕
//                           </button>
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}

//                 {/* New files display */}
//                 {files.length > 0 && (
//                   <div className="mb-2">
//                     <p className="text-sm text-gray-500 mb-1">New files:</p>
//                     <ul className="flex flex-col gap-1">
//                       {files.map((file, index) => (
//                         <li key={`new-${index}`} className="flex items-center justify-between text-[14px] font-['Montserrat'] text-gray-600 bg-gray-50 p-2 rounded">
//                           <span>• {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
//                           <button
//                             onClick={() => removeNewFile(index)}
//                             className="text-red-500 hover:text-red-700 ml-2"
//                           >
//                             ✕
//                           </button>
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}

//                 {/* Upload new files */}
//                 <div
//                   onDrop={handleDrop}
//                   onDragOver={(e) => e.preventDefault()}
//                   className="w-full max-w-[789px] h-[76px] rounded-[14px] !border !border-[#51218F] flex items-center justify-center cursor-pointer hover:bg-purple-50/30 transition-colors"
//                 >
//                   <input
//                     type="file"
//                     multiple
//                     onChange={(e) => handleFiles(e.target.files)}
//                     className="hidden"
//                     id="fileUpload"
//                   />
//                   <label htmlFor="fileUpload" className="cursor-pointer font-['Montserrat'] text-[18px]">
//                     Drag or <span className="text-[#51218F] font-semibold">upload project </span>files
//                   </label>
//                 </div>

//                 {attachmentsError && (
//                   <p className="text-red-500 text-xs font-['Montserrat'] mt-1">{attachmentsError}</p>
//                 )}
//               </div>

//               {/* Action Buttons */}
//               <div className="flex flex-col sm:flex-row gap-4 mt-6">
//                 <button
//                   onClick={() => submitJob("posted")}
//                   className="w-full sm:w-[190px] h-[39px] cursor-pointer rounded-[100px] bg-gradient-to-r from-[#51218F] to-black text-white font-['Montserrat'] font-bold text-[14px] shadow-md hover:opacity-90 transition-opacity"
//                 >
//                   {jobId ? "Update Job" : "Post job now"}
//                 </button>
//                 <button
//                   onClick={() => submitJob("draft")}
//                   className="w-full sm:w-[190px] h-[39px] cursor-pointer rounded-[100px] !border !border-[rgba(38,50,56,1)] bg-white text-[rgba(38,50,56,1)] font-['Montserrat'] font-bold text-[14px] hover:bg-gray-50"
//                 >
//                   {jobId ? "Save as Draft" : "Save as draft"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <Footer />
//     </div>
//   );
// }

import Header from "../../component/Header";
import Footer from "../../component/Footer";
import BannerImg from "../../assets/myproject/banner.png";

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/axiosConfig";
import { useUser } from "../../contexts/UserContext";
import toast from "../../component/Toast";

// Character limit constants
const MAX_JOB_TITLE_LENGTH = 50;
const MAX_JOB_DESCRIPTION_LENGTH = 200;

export default function Created() {
  const navigate = useNavigate();
  const { userData } = useUser();
  const { jobId } = useParams();

  // =========================================================
  // STATE MANAGEMENT
  // =========================================================
  const [files, setFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budgetType, setBudgetType] = useState("Fixed");
  const [budget, setBudget] = useState({
    from: "",
    to: "",
  });
  const [estimateLevel, setEstimateLevel] = useState("");
  const [estimateTime, setEstimateTime] = useState("");
  const [durationUnit, setDurationUnit] = useState("");
  const [durationValue, setDurationValue] = useState("");
  const [isDurationValueOpen, setIsDurationValueOpen] = useState(false);
  const durationValueDropdownRef = useRef(null);
  const [skills, setSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobStatus, setJobStatus] = useState(null);

  // Error states for all required fields
  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [skillsError, setSkillsError] = useState("");
  const [estimateTimeError, setEstimateTimeError] = useState("");
  const [durationUnitError, setDurationUnitError] = useState("");
  const [durationValueError, setDurationValueError] = useState("");
  const [estimateLevelError, setEstimateLevelError] = useState("");
  const [budgetFromError, setBudgetFromError] = useState("");
  const [budgetToError, setBudgetToError] = useState("");
  const [attachmentsError, setAttachmentsError] = useState("");

  const [isDurationOpen, setIsDurationOpen] = useState(false);
  const durationDropdownRef = useRef(null);

  // Search functionality states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Predefined skills array for search
  const predefinedSkills = [
    "Web Design", "UI/UX Design", "Graphic Design", "Logo Design", "Branding",
    "Frontend Development", "Backend Development", "Full Stack Development",
    "React", "Angular", "Vue.js", "Node.js", "Python", "JavaScript", "TypeScript",
    "Mobile Development", "iOS", "Android", "React Native", "Flutter",
    "Data Science", "Machine Learning", "AI", "Database Design", "DevOps",
    "Cloud Computing", "AWS", "Azure", "SEO", "Digital Marketing",
    "Content Writing", "Copywriting", "Translation", "Video Editing",
    "Photography", "Illustration", "3D Modeling", "Animation",
    "Project Management", "Business Analysis", "QA Testing", "Cybersecurity"
  ];

  // Duration options
  const durationOptions = [
    { value: "", label: "Select Duration" },
    { value: "days", label: "Days" },
    { value: "weeks", label: "Weeks" },
    { value: "months", label: "Months" },
    { value: "years", label: "Years" },
  ];

  const getDurationValues = () => {
    switch (durationUnit) {
      case "days":
        return ["1 Day", "2 Days", "3 Days", "4 Days", "5 Days", "6 Days"];
      case "weeks":
        return ["1 Week", "2 Weeks", "3 Weeks"];
      case "months":
        return ["1 Month", "2 Months", "3 Months", "4 Months", "5 Months", "6 Months", "7 Months", "8 Months", "9 Months", "10 Months", "11 Months"];
      case "years":
        return ["1 Year", "2 Years", "3 Years"];
      default:
        return [];
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (durationDropdownRef.current && !durationDropdownRef.current.contains(event.target)) {
        setIsDurationOpen(false);
      }
      if (durationValueDropdownRef.current && !durationValueDropdownRef.current.contains(event.target)) {
        setIsDurationValueOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // =========================================================
  // VALIDATION FUNCTIONS
  // =========================================================

  const validateTitle = (value) => {
  if (!value || !value.trim()) {
    return "Job title is required";
  }
  if (value.trim().length < 3) {
    return "Job title must be at least 3 characters long";
  }
  if (value.trim().length > MAX_JOB_TITLE_LENGTH) {
    return `Job title must be less than ${MAX_JOB_TITLE_LENGTH} characters`;
  }
  
  // Check for invalid special characters (like @, #, $, %, etc.)
  // Only allow: letters, numbers, spaces, and basic punctuation . , ! ? ( ) - _ &
  const invalidCharsRegex = /[^A-Za-z0-9\s\-_.,!?()&]/;
  if (invalidCharsRegex.test(value.trim())) {
    return "Job title cannot contain special characters like @, #, $, %, etc. Only letters, numbers, spaces, and basic punctuation (.,!?()-_&) are allowed";
  }
  
  return "";
};

  const validateDescription = (value) => {
    if (!value || !value.trim()) {
      return "Description is required";
    }
    if (value.trim().length < 10) {
      return "Description must be at least 10 characters long";
    }
    if (value.trim().length > MAX_JOB_DESCRIPTION_LENGTH) {
      return `Description must be less than ${MAX_JOB_DESCRIPTION_LENGTH} characters`;
    }
    return "";
  };

  const validateSkills = (value) => {
    if (!value || !value.length) {
      return "Please add at least one skill";
    }
    return "";
  };

  const validateEstimateTime = (value) => {
    if (!value) {
      return "Please select project size (Small, Medium, or Large)";
    }
    return "";
  };

  const validateDurationUnit = (value) => {
    if (!value) {
      return "Please select project duration";
    }
    return "";
  };
  
  const validateDurationValue = (value) => {
    if (!value) {
      return "Please select duration time";
    }
    return "";
  };

  const validateEstimateLevel = (value) => {
    if (!value) {
      return "Please select expertise level";
    }
    return "";
  };
  
  const validateBudgetFrom = (value) => {
    if (!value) {
      return "Budget is required";
    }
    if (parseFloat(value) <= 0) {
      return "Budget must be greater than 0";
    }
    return "";
  };

  const validateBudgetTo = (value) => {
    // Fixed price does not need "to" budget
    if (budgetType === "Fixed") {
      return "";
    }
    if (!value) {
      return "Budget to is required";
    }
    if (parseFloat(value) <= 0) {
      return "Budget must be greater than 0";
    }
    if (parseFloat(value) < parseFloat(budget.from)) {
      return "Budget to must be greater than budget from";
    }
    return "";
  };

  const validateAttachments = () => {
    // Only validate attachments for new job creation (not for edit)
    if (!jobId && files.length === 0 && existingFiles.length === 0) {
      return "Please upload at least one attachment";
    }
    return "";
  };

  const validateFileSize = (fileList) => {
    const MAX_SIZE_MB = 25;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
    for (let i = 0; i < fileList.length; i++) {
      if (fileList[i].size > MAX_SIZE_BYTES) {
        return `File "${fileList[i].name}" exceeds the maximum 25MB limit`;
      }
    }
    return "";
  };

  // =========================================================
  // VALIDATE ALL FIELDS BEFORE SUBMISSION
  // =========================================================
  const validateAllFields = () => {
    const titleErr = validateTitle(title);
    const descErr = validateDescription(description);
    const skillsErr = validateSkills(skills);
    const estimateTimeErr = validateEstimateTime(estimateTime);
    const durationErr = validateDurationUnit(durationUnit);
    const durationValueErr = validateDurationValue(durationValue);
    const estimateLevelErr = validateEstimateLevel(estimateLevel);
    const budgetFromErr = validateBudgetFrom(budget.from);
    const budgetToErr = validateBudgetTo(budget.to);
    const attachmentsErr = validateAttachments();

    setTitleError(titleErr);
    setDescriptionError(descErr);
    setSkillsError(skillsErr);
    setEstimateTimeError(estimateTimeErr);
    setDurationUnitError(durationErr);
    setDurationValueError(durationValueErr);
    setEstimateLevelError(estimateLevelErr);
    setBudgetFromError(budgetFromErr);
    setBudgetToError(budgetToErr);
    setAttachmentsError(attachmentsErr);

    return !(titleErr || descErr || skillsErr || estimateTimeErr || durationErr || durationValueErr ||
      estimateLevelErr || budgetFromErr || budgetToErr || attachmentsErr);
  };

  const handleTitleChange = (e) => {
  let newValue = e.target.value;
  
  // Real-time filtering of invalid characters for job title
  const allowedCharsRegex = /[A-Za-z0-9\s\-_.,!?()&]/;
  let filteredValue = "";
  let hasInvalidChars = false;
  
  for (let i = 0; i < newValue.length; i++) {
    if (allowedCharsRegex.test(newValue[i])) {
      filteredValue += newValue[i];
    } else if (newValue[i] !== '') {
      hasInvalidChars = true;
    }
  }
  
  // Show error toast only once when invalid character is detected
  if (hasInvalidChars && !window.invalidCharShown) {
    toast.error("Invalid Character", "Only letters, numbers, spaces, and basic punctuation (.,!?()-_&) are allowed");
    window.invalidCharShown = true;
    setTimeout(() => { window.invalidCharShown = false; }, 1000);
  }
  
  // Prevent exceeding max length
  if (filteredValue.length > MAX_JOB_TITLE_LENGTH) {
    filteredValue = filteredValue.slice(0, MAX_JOB_TITLE_LENGTH);
  }
  
  setTitle(filteredValue);
  const error = validateTitle(filteredValue);
  setTitleError(error);
};

  const handleDescriptionChange = (e) => {
    let newValue = e.target.value;
    if (newValue.length > MAX_JOB_DESCRIPTION_LENGTH) {
      newValue = newValue.slice(0, MAX_JOB_DESCRIPTION_LENGTH);
    }
    setDescription(newValue);
    const error = validateDescription(newValue);
    setDescriptionError(error);
  };

  // =========================================================
  // SKILL FUNCTIONALITY - SINGLE INPUT WITH SEARCH
  // =========================================================

  const handleSkillChange = (e) => {
    const query = e.target.value;
    setCurrentSkill(query);
    setSearchQuery(query);
    if (query.trim() === "") {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    const filtered = predefinedSkills.filter(skill =>
      skill.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
    setShowResults(true);
  };

  const addSkill = (skill) => {
    const trimmedSkill = skill.trim();
    const skillRegex = /^[A-Za-z0-9\s\/\.\-&\+\(\)#]+$/;
    
    if (!trimmedSkill) {
      toast.error("Invalid Skill", "Skill cannot be empty");
      return;
    }
    if (!skillRegex.test(trimmedSkill)) {
      toast.error("Invalid Skill", "Skills can contain letters, spaces, forward slashes (/), dots (.), hyphens (-), and ampersands (&)");
      return;
    }
    if (trimmedSkill.length < 2) {
      toast.error("Invalid Skill", "Skill must be at least 2 characters");
      return;
    }
    if (skills.includes(trimmedSkill)) {
      toast.error("Duplicate skill", "Skill already added");
      return;
    }
    if (skills.length >= 15) {
      toast.error("Maximum limit", "Maximum 15 skills allowed");
      return;
    }
    
    setSkills([...skills, trimmedSkill]);
    setSkillsError("");
    toast.success("Skill added", `"${trimmedSkill}" added`);
    setCurrentSkill("");
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = currentSkill.trim();
      if (trimmed) {
        addSkill(trimmed);
      }
    } else if (e.key === "Escape") {
      setShowResults(false);
      setSearchResults([]);
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
    if (skills.length - 1 === 0) {
      setSkillsError("Please add at least one skill");
    }
    toast.success(`Skill removed`, `"${skillToRemove}" removed`);
  };

  // =========================================================
  // FETCH JOB DATA IF IN EDIT MODE
  // =========================================================
 useEffect(() => {
  const fetchJobForEdit = async () => {
    if (jobId) {
      setLoading(true);
      try {
        const me = await api.get("/auth/me");
        const employerId = me.data.id;

        let jobData = null;
        let status = null;

        try {
          const draftResponse = await api.get(`/jobs/my-jobs/${employerId}?status=draft`);
          const draftJobs = draftResponse.data.jobs || [];
          jobData = draftJobs.find(job => job.id === parseInt(jobId));
          if (jobData) status = "draft";
        } catch (error) {
          console.log("No drafts found or error fetching drafts");
        }

        if (!jobData) {
          try {
            const postedResponse = await api.get(`/jobs/my-jobs/${employerId}?status=posted`);
            const postedJobs = postedResponse.data.jobs || [];
            jobData = postedJobs.find(job => job.id === parseInt(jobId));
            if (jobData) status = "posted";
          } catch (error) {
            console.log("No posted jobs found or error fetching posted jobs");
          }
        }

        if (!jobData) {
          try {
            const directResponse = await api.get(`/jobs/${jobId}`);
            jobData = directResponse.data;
            if (jobData) {
              status = jobData.status || "unknown";
            }
          } catch (error) {
            console.log("Direct job fetch failed");
          }
        }

        if (!jobData) {
          toast.error("Job not found", "The requested job could not be found");
          setLoading(false);
          return;
        }

        console.log("Fetched job data:", jobData);
        setJobStatus(status);
        
        // Prepare all variables first
        // 1. Title
        let fetchedTitle = jobData.title || "";
        if (fetchedTitle.length > MAX_JOB_TITLE_LENGTH) {
          fetchedTitle = fetchedTitle.slice(0, MAX_JOB_TITLE_LENGTH);
        }
        
        // 2. Description
        let fetchedDescription = jobData.description || "";
        if (fetchedDescription.length > MAX_JOB_DESCRIPTION_LENGTH) {
          fetchedDescription = fetchedDescription.slice(0, MAX_JOB_DESCRIPTION_LENGTH);
        }
        
        // 3. Skills
        let fetchedSkills = [];
        if (jobData.skills) {
          if (Array.isArray(jobData.skills)) {
            fetchedSkills = jobData.skills;
          } else if (typeof jobData.skills === 'string') {
            fetchedSkills = jobData.skills.split(',').map(s => s.trim()).filter(s => s);
          }
        }
        
        // 4. Budget Type
        let fetchedBudgetType = "Fixed";
        if (jobData.budget_type) {
          fetchedBudgetType = jobData.budget_type === "fixed" ? "Fixed" : "Hourly";
        }
        
        // 5. Budget values
        const fetchedBudgetFrom = jobData.budget_from || "";
        const fetchedBudgetTo = jobData.budget_to || "";
        
        // 6. Expertise Level
        let fetchedEstimateLevel = "";
        if (jobData.expertise_level) {
          fetchedEstimateLevel = jobData.expertise_level.charAt(0).toUpperCase() +
            jobData.expertise_level.slice(1);
        }
        
        // 7. Duration
        let fetchedDurationUnit = "";
        let fetchedDurationValue = "";
        if (jobData.duration) {
          fetchedDurationValue = jobData.duration;
          const parts = jobData.duration.split(' ');
          if (parts.length >= 2) {
            let unit = parts[1].toLowerCase();
            if (unit === 'days') unit = 'days';
            else if (unit === 'weeks') unit = 'weeks';
            else if (unit === 'months') unit = 'months';
            else if (unit === 'years') unit = 'years';
            fetchedDurationUnit = unit;
          }
        }
        
        // 8. Timeline/Project Size
        let fetchedEstimateTime = "";
        if (jobData.timeline) {
          fetchedEstimateTime = jobData.timeline.charAt(0).toUpperCase() +
            jobData.timeline.slice(1).toLowerCase();
        }
        
        // 9. Attachments
        let fetchedAttachments = [];
        if (jobData.attachments && jobData.attachments.length > 0) {
          fetchedAttachments = jobData.attachments;
        }
        
        // Set all states
        setTitle(fetchedTitle);
        setDescription(fetchedDescription);
        setSkills(fetchedSkills);
        setBudgetType(fetchedBudgetType);
        setBudget({
          from: fetchedBudgetFrom,
          to: fetchedBudgetTo,
        });
        setEstimateLevel(fetchedEstimateLevel);
        setDurationValue(fetchedDurationValue);
        setDurationUnit(fetchedDurationUnit);
        setEstimateTime(fetchedEstimateTime);
        setExistingFiles(fetchedAttachments);
        
        // Validate all fields after setting values
        // Use setTimeout to ensure state updates are complete
        setTimeout(() => {
          // Validate title
          const titleErr = validateTitle(fetchedTitle);
          
          // Validate description
          const descErr = validateDescription(fetchedDescription);
          
          // Validate skills
          const skillsErr = validateSkills(fetchedSkills);
          
          // Validate estimate time
          const estimateTimeErr = validateEstimateTime(fetchedEstimateTime);
          
          // Validate duration unit
          const durationUnitErr = validateDurationUnit(fetchedDurationUnit);
          
          // Validate duration value
          const durationValueErr = validateDurationValue(fetchedDurationValue);
          
          // Validate estimate level
          const estimateLevelErr = validateEstimateLevel(fetchedEstimateLevel);
          
          // Validate budget from
          const budgetFromErr = validateBudgetFrom(fetchedBudgetFrom);
          
          // Validate budget to
          const budgetToErr = validateBudgetTo(fetchedBudgetTo);
          
          // Set all error states
          setTitleError(titleErr);
          setDescriptionError(descErr);
          setSkillsError(skillsErr);
          setEstimateTimeError(estimateTimeErr);
          setDurationUnitError(durationUnitErr);
          setDurationValueError(durationValueErr);
          setEstimateLevelError(estimateLevelErr);
          setBudgetFromError(budgetFromErr);
          setBudgetToError(budgetToErr);
          
          // Show error toast if there are validation issues
          if (titleErr || descErr || skillsErr || estimateTimeErr || durationUnitErr || 
              durationValueErr || estimateLevelErr || budgetFromErr || budgetToErr) {
            console.log("Validation errors found in loaded job data:", {
              titleErr, descErr, skillsErr, estimateTimeErr, 
              durationUnitErr, durationValueErr, estimateLevelErr, 
              budgetFromErr, budgetToErr
            });
          }
        }, 100);

      } catch (error) {
        console.error("Error fetching job for edit:", error);
        toast.error("Load failed", "Failed to load job data for editing. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  fetchJobForEdit();
}, [jobId]);

  // =========================================================
  // SUBMIT LOGIC
  // =========================================================
  const submitJob = async (status) => {
    // Validate all fields before submission
    const isValid = validateAllFields();

    if (!isValid) {
      // Show toast for the first error
      if (titleError) {
        toast.error(titleError);
      } else if (descriptionError) {
        toast.error(descriptionError);
      } else if (skillsError) {
        toast.error(skillsError);
      } else if (estimateTimeError) {
        toast.error(estimateTimeError);
      } else if (durationUnitError) {
        toast.error(durationUnitError);
      } else if (durationValueError) {
        toast.error(durationValueError);
      } else if (estimateLevelError) {
        toast.error(estimateLevelError);
      } else if (budgetFromError) {
        toast.error(budgetFromError);
      } else if (budgetToError) {
        toast.error(budgetToError);
      } else if (attachmentsError) {
        toast.error(attachmentsError);
      }
      return;
    }

    if (!userData?.id) {
      toast.error("Authentication Error", "User not authenticated");
      return;
    }

    const loadingToastId = toast.loading(jobId ? "Updating job..." : "Creating job...");

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("skills", skills.join(","));
      formData.append("duration", durationValue);
      formData.append("expertise_level", estimateLevel.trim().toLowerCase());
      formData.append("budget_type", budgetType === "Fixed" ? "fixed" : "hourly");
      formData.append("project_size", estimateTime.toLowerCase());

      const budgetFrom = parseFloat(budget.from);
      const budgetTo = budgetType === "Fixed" ? budgetFrom : parseFloat(budget.to);

      formData.append("budget_from", String(budgetFrom));
      formData.append("budget_to", String(budgetTo));
      formData.append("status", status === "posted" ? "posted" : "draft");

      if (files.length > 0) {
        files.forEach((file) => {
          if (file.size > 0) {
            formData.append("attachments", file);
          }
        });
      }

      if (jobId) {
        await api.put(`/jobs/edit/${jobId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.dismiss(loadingToastId);
        toast.success("Job updated", "Job updated successfully!");
        navigate("/job-created");
      } else {
        await api.post(`/jobs/create/${userData.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.dismiss(loadingToastId);
        if (status === "posted") {
          toast.success("Job posted", "Job posted successfully!");
          navigate("/job-created");
        } else {
          toast.success("Draft saved", "Job saved as draft successfully!");
          navigate("/job-created");
        }
      }

    } catch (err) {
      toast.dismiss(loadingToastId);
      console.error("Job submission failed", err);
      const errorMsg = err.response?.data?.detail || "Failed to submit job";
      toast.error("Submission Failed", typeof errorMsg === "string" ? errorMsg : "An error occurred");
    }
  };

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList);
    const sizeError = validateFileSize(newFiles);
    if (sizeError) {
      toast.error("File too large", sizeError);
      return;
    }
    const validFiles = newFiles.filter(file => file.size > 0);
    setFiles((prev) => [...prev, ...validFiles]);
    setAttachmentsError("");
    if (validFiles.length > 0) {
      toast.success("Files added", `${validFiles.length} file(s) added`);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

 const removeExistingFile = (indexToRemove) => {
  setExistingFiles(existingFiles.filter((_, index) => index !== indexToRemove));
  toast.success("File removed", "File has been removed");
};

  const removeNewFile = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
    toast.success("File removed", "File has been removed");
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col overflow-x-hidden edit-page">
        <Header />
        <section className="w-full flex-1 bg-white flex justify-center items-center py-[100px] px-4">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#51218F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#51218F] font-semibold">Loading job data...</p>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F5F5F5]">
      <div className="absolute top-0 left-0 w-full z-50">
        <Header />
      </div>

      {/* Banner Section */}
      <div className="relative w-full h-[433px] overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${BannerImg})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="absolute inset-0 bg-black opacity-30"></div>
        </div>
      </div>

      <div className="relative mt-3 md:-mt-[150px] flex justify-center px-2 md:px-6 pb-20">
        <div className="relative w-full max-w-[1163px]  2xl:max-w-[2160px] bg-white rounded-[10px] shadow-[0px_4px_45px_rgba(0,0,0,0.12)] p-6 md:p-[40px] flex flex-col h-fit">

          {/* Back Button */}
          <div className="flex justify-start mb-2 md:mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 text-white hover:text-white/80 transition-colors group"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-[#51218F] to-[#2a0e4a] group-hover:from-[#3d1768] group-hover:to-[#1a0830] transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </div>
              <span className="font-medium text-base text-black">Back</span>
            </button>
          </div>

          {/* Edit Mode Indicator */}
          {jobId && (
            <div className="text-[#51218F] text-sm font-semibold mb-2">
              Editing {jobStatus === "draft" ? "Draft" : "Job"}
            </div>
          )}

          {/* Top Divider */}
          <div className="w-full h-[1px] bg-[rgba(0,0,0,0.1)] "></div>

          {/* Content Layout */}
          <div className="flex flex-col">

            {/* LEFT SIDE CONTENT - FULL WIDTH */}
            <div className="flex-1 flex flex-col gap-8">

              {/* Job Title Group */}
              <div className="flex flex-col gap-3 mt-6">
                <label className="font-['Montserrat'] font-bold text-[16px] leading-none tracking-normal text-[#2A1E17]">
                  Job title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="ex, need Web developer for figma"
                  value={title}
                  onChange={handleTitleChange}
                  maxLength={MAX_JOB_TITLE_LENGTH}
                  className="w-full h-[45px] rounded-[10px] !border !border-black/30 text-[#040200] font-['Montserrat'] font-semibold text-[16px] px-4 outline-none placeholder-gray-400"
                />
                <div className="flex justify-between items-center">
                  {titleError && (
                    <p className="text-red-500 text-xs font-['Montserrat']">{titleError}</p>
                  )}
                  <p className={`text-xs font-['Montserrat'] ml-auto ${title.length > MAX_JOB_TITLE_LENGTH ? 'text-red-500' : 'text-gray-400'}`}>
                    {title.length}/{MAX_JOB_TITLE_LENGTH} characters
                  </p>
                </div>
              </div>

              {/* Description Group */}
              <div className="flex flex-col gap-3">
                <label className="font-['Montserrat'] font-semibold text-[#2A1E17] text-[16px] leading-none tracking-normal">
                  Describe about the project <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="write here"
                  value={description}
                  onChange={handleDescriptionChange}
                  maxLength={MAX_JOB_DESCRIPTION_LENGTH}
                  className="w-full h-[287px] rounded-[10px] !border !border-black/30 p-4 resize-none font-['Montserrat'] text-[16px] outline-none placeholder-gray-400"
                />
                <div className="flex justify-between items-center">
                  {descriptionError && (
                    <p className="text-red-500 text-xs font-['Montserrat']">{descriptionError}</p>
                  )}
                  <p className={`text-xs font-['Montserrat'] ml-auto ${description.length > MAX_JOB_DESCRIPTION_LENGTH ? 'text-red-500' : 'text-gray-400'}`}>
                    {description.length}/{MAX_JOB_DESCRIPTION_LENGTH} characters
                  </p>
                </div>
              </div>

              {/* Skills Group - Single Input with Search */}
              <div className="flex flex-col gap-3">
                <label className="font-['Montserrat'] font-bold text-[16px] leading-none tracking-normal text-[#2A1E17]">
                  Skills <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Type a skill and press Enter to add"
                    value={currentSkill}
                    onChange={handleSkillChange}
                    onKeyDown={handleSkillKeyDown}
                    className="w-full h-[45px] rounded-[10px] !border !border-black/30 px-4 font-['Montserrat'] font-semibold text-[16px] text-[#040200] outline-none placeholder-gray-400"
                  />

                  {/* Search Results as Purple Tags */}
                  {showResults && searchResults.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-h-48 overflow-y-auto">
                      <div className="flex flex-wrap gap-2">
                        {searchResults.map((skill, index) => (
                          <button
                            key={index}
                            onClick={() => addSkill(skill)}
                            className="px-3 py-1.5 bg-[#51218F] text-white rounded-full text-[12px] font-medium hover:bg-[#3D1768] transition-colors"
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Selected Skills Display */}
                <div className="w-full min-h-[45px] rounded-[10px] !border !border-black/30 flex flex-wrap items-center gap-2 px-3 py-1.5">
                  {skills.map((skill, index) => (
                    <span key={index} className="flex items-center gap-1 px-3 py-1 bg-[#51218F] text-white rounded-full text-[14px] font-['Montserrat'] font-medium">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:text-gray-200 focus:outline-none rounded-full"
                      >×</button>
                    </span>
                  ))}
                  {skills.length === 0 && (
                    <span className="text-gray-400 text-[14px] font-['Montserrat']">No skills added yet</span>
                  )}
                </div>
                {skillsError && (
                  <p className="text-red-500 text-xs font-['Montserrat'] mt-1">{skillsError}</p>
                )}
                <p className="text-right text-[16px] mt-2 font-['Montserrat'] font-regular text-gray-500">Add max 15 skills | Type and press Enter to add custom skills</p>
              </div>

              <div className="w-full h-[1px] bg-[rgba(0,0,0,0.1)]"></div>

              {/* Estimate Time Section */}
              <div className="flex flex-col gap-4 ">
                <label className="font-['Montserrat'] font-bold text-[16px] leading-none tracking-normal text-[#2A1E17]">
                  Estimate your timeline here <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-6 mb-2">
                  {["Small", "Medium", "Large"].map((option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="estimateTime"
                        value={option}
                        checked={estimateTime === option}
                        onChange={(e) => {
                          setEstimateTime(e.target.value);
                          setEstimateTimeError("");
                        }}
                        className="hidden"
                      />
                      <div className={`w-4 h-4 rounded-full !border flex items-center justify-center transition-all ${estimateTime === option ? '!border-[#51218F]' : '!border-gray-400'}`}>
                        {estimateTime === option && <div className="w-2.5 h-2.5 rounded-full bg-[#51218F]"></div>}
                      </div>
                      <span className={`font-['Montserrat'] text-[14px] ${estimateTime === option ? 'font-bold text-black' : 'font-medium text-[#040200]'}`}>{option}</span>
                    </label>
                  ))}
                </div>
                {estimateTimeError && (
                  <p className="text-red-500 text-xs font-['Montserrat'] mt-1">{estimateTimeError}</p>
                )}

                <div className="flex flex-col gap-2">
                  <label className="font-['Montserrat'] font-semibold text-[14px] text-[#2A1E17]">
                    How long your work take? <span className="text-red-500">*</span>
                  </label>

                  {/* Two Dropdowns Section - UPDATED */}
                  <div className="flex gap-4 flex-wrap">

                    {/* First Dropdown */}
                    <div className="relative" ref={durationDropdownRef}>
                      <div
                        onClick={() => setIsDurationOpen(!isDurationOpen)}
                        className="w-full sm:w-[322px] h-[45px] rounded-[10px] !border !border-black/30 px-4 font-['Montserrat'] font-semibold text-[16px] bg-white flex items-center justify-between cursor-pointer"
                      >
                        <span className={durationUnit ? "text-[#040200]" : "text-gray-400"}>
                          {durationOptions.find(opt => opt.value === durationUnit)?.label || "Select Duration"}
                        </span>

                        <svg
                          className={`transform transition-transform duration-200 ${isDurationOpen ? 'rotate-180' : ''}`}
                          width="12"
                          height="8"
                          viewBox="0 0 12 8"
                          fill="none"
                        >
                          <path
                            d="M1 1.5L6 6.5L11 1.5"
                            stroke="black"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>

                      {isDurationOpen && (
                        <div className="absolute z-50 w-full sm:w-[322px] mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                          {durationOptions.map((option) => (
                            <div
                              key={option.value}
                              onClick={() => {
                                setDurationUnit(option.value);
                                setDurationValue("");
                                setDurationUnitError("");
                                setIsDurationOpen(false);
                              }}
                              className={`px-4 py-3 cursor-pointer transition-colors hover:bg-purple-50 font-['Montserrat'] text-[14px]
                              ${durationUnit === option.value
                                  ? 'bg-purple-50 text-[#51218F] font-semibold'
                                  : 'text-gray-700'}
                              ${option.value === '' ? 'text-gray-400' : ''}`}
                            >
                              {option.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Second Dropdown */}
                    {durationUnit && durationUnit !== "fixed" && (
                      <div className="relative" ref={durationValueDropdownRef}>
                        <div
                          onClick={() => setIsDurationValueOpen(!isDurationValueOpen)}
                          className="w-full sm:w-[322px] h-[45px] rounded-[10px] !border !border-black/30 px-4 font-['Montserrat'] font-semibold text-[16px] bg-white flex items-center justify-between cursor-pointer"
                        >
                          <span className={durationValue ? "text-[#040200]" : "text-gray-400"}>
                            {durationValue || "Select Time"}
                          </span>

                          <svg
                            className={`transform transition-transform duration-200 ${isDurationValueOpen ? 'rotate-180' : ''}`}
                            width="12"
                            height="8"
                            viewBox="0 0 12 8"
                            fill="none"
                          >
                            <path
                              d="M1 1.5L6 6.5L11 1.5"
                              stroke="black"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>

                        {isDurationValueOpen && (
                          <div className="absolute z-50 w-full sm:w-[322px] mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-[250px] overflow-y-auto">
                            {getDurationValues().map((item, index) => (
                              <div
                                key={index}
                                onClick={() => {
                                  setDurationValue(item);
                                  setIsDurationValueOpen(false);
                                }}
                                className={`px-4 py-3 cursor-pointer transition-colors hover:bg-purple-50 font-['Montserrat'] text-[14px]
                                ${durationValue === item
                                    ? 'bg-purple-50 text-[#51218F] font-semibold'
                                    : 'text-gray-700'}`}
                              >
                                {item}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {durationUnitError && (
                    <p className="text-red-500 text-xs font-['Montserrat'] mt-1">{durationUnitError}</p>
                  )}
                  {durationValueError && (
                    <p className="text-red-500 text-xs font-['Montserrat'] mt-1">
                      {durationValueError}
                    </p>
                  )}
                </div>
              </div>

              <div className="w-full h-[1px] bg-[rgba(0,0,0,0.1)]"></div>

              {/* Expertise level section */}
              <div className="flex flex-col gap-4">
                <label className="font-['Montserrat'] font-bold text-[16px] leading-none tracking-normal text-[#2A1E17]">
                  Expertise level you want <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-6 mb-2">
                  {["Fresher", "Medium", "Experienced"].map((option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="estimateLevel"
                        value={option}
                        checked={estimateLevel === option}
                        onChange={(e) => {
                          setEstimateLevel(e.target.value);
                          setEstimateLevelError("");
                        }}
                        className="hidden"
                      />
                      <div className={`w-4 h-4 rounded-full !border flex items-center justify-center transition-all ${estimateLevel === option ? '!border-[#51218F]' : '!border-gray-400'}`}>
                        {estimateLevel === option && <div className="w-2.5 h-2.5 rounded-full bg-[#51218F]"></div>}
                      </div>
                      <span className={`font-['Montserrat'] text-[14px] ${estimateLevel === option ? 'font-bold text-black' : 'font-medium text-[#040200]'}`}>{option}</span>
                    </label>
                  ))}
                </div>
                {estimateLevelError && (
                  <p className="text-red-500 text-xs font-['Montserrat'] mt-1">{estimateLevelError}</p>
                )}
              </div>

              <div className="w-full h-[1px] bg-[rgba(0,0,0,0.1)]"></div>

              {/* Budget Section */}
              <div className="flex flex-col gap-6">
                <label className="font-['Montserrat'] font-bold text-[16px] leading-none tracking-normal text-[#2A1E17]">
                  Tell us about your budget? <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-6">
                  {[{ key: "Fixed", label: "Fixed price", icon: "tag" }].map((item) => (
                    <label key={item.key} className={`relative w-[190px] h-[94px] rounded-[12px] !border cursor-pointer flex items-center justify-center gap-3 transition-all ${budgetType === item.key ? "!border-[#51218F] text-[#51218F]" : "!border-gray-300 text-[#2A1E17]"}`}>
                      <input
                        type="radio"
                        name="budgetType"
                        value={item.key}
                        checked={budgetType === item.key}
                        onChange={() => setBudgetType(item.key)}
                        className="hidden"
                      />
                      <div className={`absolute top-[10px] left-[10px] w-[18px] h-[18px] rounded-full !border flex items-center justify-center ${budgetType === item.key ? "!border-[#51218F]" : "!border-gray-400"}`}>
                        {budgetType === item.key && <div className="w-[10px] h-[10px] rounded-full bg-[#51218F]" />}
                      </div>
                      {item.icon === "tag" ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41L11 3H3v8l9.59 9.59a2 2 0 0 0 2.82 0l5.18-5.18a2 2 0 0 0 0-2.82z" /><circle cx="7.5" cy="7.5" r="1.5" /></svg>
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2h12M6 22h12M6 2c0 6 6 6 6 10s-6 4-6 10M18 2c0 6-6 6-6 10s6 4 6 10" /></svg>
                      )}
                      <span className="font-['Montserrat'] font-bold text-[20px]">{item.label}</span>
                    </label>
                  ))}
                </div>

                <div className="flex flex-wrap gap-10 mt-2">
                  <div className="flex flex-col gap-2">
                    <label className="font-['Montserrat'] font-semibold text-[16px] text-[#2A1E17] capitalize">
                      Budget <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center w-[165px] h-[45px] rounded-[10px] !border !border-gray-300 px-3">
                        <span className="text-[18px] font-bold text-black">₹</span>
                        <input
                          type="number"
                          value={budget.from}
                          onWheel={(e) => {
                            e.preventDefault();
                            e.target.blur();
                          }}
                          onChange={(e) => {
                            setBudget({ ...budget, from: e.target.value });
                            setBudgetFromError("");
                          }}
                          className="w-full text-right text-[18px] font-bold outline-none bg-transparent pl-2 no-spinner"
                        />
                      </div>
                    </div>
                    {budgetFromError && (
                      <p className="text-red-500 text-xs font-['Montserrat'] mt-1">{budgetFromError}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full h-[1px] bg-[rgba(0,0,0,0.1)]"></div>

              {/* Attachments Section */}
              <div className="flex flex-col gap-4">
                <label className="font-['Montserrat'] font-semibold text-[16px] text-[#2A1E17]">
                  Attachments {!jobId && <span className="text-red-500">*</span>}
                </label>
                <p className="text-xs text-gray-500 -mt-2">Max file size: 25MB per file</p>

                {/* Existing files display */}
                {/* Existing files display - FIXED to show clean filenames */}
{existingFiles.length > 0 && (
  <div className="mb-2">
    <p className="text-sm text-gray-500 mb-1">Existing files:</p>
    <ul className="flex flex-col gap-1">
      {existingFiles.map((file, index) => {
        // ✅ Extract clean filename from URL or path
        let displayName = file;
        if (typeof file === 'string') {
          // Remove query parameters
          let clean = file.split('?')[0];
          // Get the last part after slash
          const parts = clean.split('/');
          displayName = parts[parts.length - 1] || file;
          
          // Clean up filename: remove ID prefixes like "123_456_filename.pdf" -> "filename.pdf"
          const nameParts = displayName.split('_');
          if (nameParts.length >= 3 && /^\d+$/.test(nameParts[0]) && /^\d+$/.test(nameParts[1])) {
            displayName = nameParts.slice(2).join('_');
          } else if (nameParts.length >= 2 && /^\d+$/.test(nameParts[0])) {
            displayName = nameParts.slice(1).join('_');
          }
          
          // Decode URL encoded characters (e.g., %20 -> space)
          try {
            displayName = decodeURIComponent(displayName);
          } catch (e) {
            // If decoding fails, keep as is
          }
        }
        
        return (
          <li key={`existing-${index}`} className="flex items-center justify-between text-[14px] font-['Montserrat'] text-gray-600 bg-gray-50 p-2 rounded">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <svg className="w-4 h-4 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <span className="truncate" title={displayName}>
                {displayName.length > 40 ? displayName.substring(0, 40) + '...' : displayName}
              </span>
            </div>
            <button
              onClick={() => removeExistingFile(index)}
              className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
            >
              ✕
            </button>
          </li>
        );
      })}
    </ul>
  </div>
)}

                {/* New files display */}
                {files.length > 0 && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-500 mb-1">New files:</p>
                    <ul className="flex flex-col gap-1">
                      {files.map((file, index) => (
                        <li key={`new-${index}`} className="flex items-center justify-between text-[14px] font-['Montserrat'] text-gray-600 bg-gray-50 p-2 rounded">
                          <span>• {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                          <button
                            onClick={() => removeNewFile(index)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Upload new files */}
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="w-full max-w-[789px] h-[76px] rounded-[14px] !border !border-[#51218F] flex items-center justify-center cursor-pointer hover:bg-purple-50/30 transition-colors"
                >
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                    id="fileUpload"
                  />
                  <label htmlFor="fileUpload" className="cursor-pointer font-['Montserrat'] text-[18px]">
                    Drag or <span className="text-[#51218F] font-semibold">upload project </span>files
                  </label>
                </div>

                {attachmentsError && (
                  <p className="text-red-500 text-xs font-['Montserrat'] mt-1">{attachmentsError}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button
                  onClick={() => submitJob("posted")}
                  className="w-full sm:w-[190px] h-[39px] cursor-pointer rounded-[100px] bg-gradient-to-r from-[#51218F] to-black text-white font-['Montserrat'] font-bold text-[14px] shadow-md hover:opacity-90 transition-opacity"
                >
                  {jobId ? "Update Job" : "Post job now"}
                </button>
                <button
                  onClick={() => submitJob("draft")}
                  className="w-full sm:w-[190px] h-[39px] cursor-pointer rounded-[100px] !border !border-[rgba(38,50,56,1)] bg-white text-[rgba(38,50,56,1)] font-['Montserrat'] font-bold text-[14px] hover:bg-gray-50"
                >
                  {jobId ? "Save as Draft" : "Save as draft"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}