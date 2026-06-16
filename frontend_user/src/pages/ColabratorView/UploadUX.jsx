// src/pages/ColabratorView/UploadUX.jsx
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from '../../contexts/UserContext';
import api from "../../utils/axiosConfig";
import TopBanner from "../../assets/Colabwork/banner.png";
import Footer from "../../component/Footer";
import ColHeader from "../../component/ColHeader";
import toast from "../../component/Toast";

// ─── Custom Tooltip Component ───────────────────────────────────────────────
function MilestoneTooltip({ visible, anchorRef }) {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (visible && anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top: rect.top + window.scrollY - 44,
        left: rect.left + window.scrollX + rect.width / 2,
      });
    }
  }, [visible, anchorRef]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: pos.top,
        left: pos.left,
        transform: 'translateX(-50%)',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <div style={{
        background: '#1f1235',
        color: '#fff',
        fontSize: '13px',
        fontWeight: '600',
        padding: '8px 16px',
        borderRadius: '8px',
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 16px rgba(91,45,145,0.35)',
        letterSpacing: '0.01em',
        border: '1.5px solid #7c3aed',
      }}>
        ⚠️ At least one milestone is required
        <div style={{
          position: 'absolute',
          bottom: '-7px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '7px solid transparent',
          borderRight: '7px solid transparent',
          borderTop: '7px solid #1f1235',
        }} />
      </div>
    </div>
  );
}

export default function UploadUX() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData } = useUser();

  const [showMilestones, setShowMilestones] = useState(false);
  const [paymentType, setPaymentType] = useState('project');
  const [milestones, setMilestones] = useState([{ description: '', due_date: '', amount: '' }]);
  const [coverLetter, setCoverLetter] = useState('');
  const [durationUnit, setDurationUnit] = useState("");
  const [durationValue, setDurationValue] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingJob, setFetchingJob] = useState(true);

  const [bidAmount, setBidAmount] = useState('');
  const [bidAmountError, setBidAmountError] = useState('');
  const [milestoneErrors, setMilestoneErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [durationComparison, setDurationComparison] = useState(null);
  const [milestoneBreakdown, setMilestoneBreakdown] = useState([]);

  const [descErrors, setDescErrors] = useState({});
  const [amountFieldErrors, setAmountFieldErrors] = useState({});
  const [attachmentError, setAttachmentError] = useState('');
  const [coverLetterError, setCoverLetterError] = useState('');
  const [dateErrors, setDateErrors] = useState({});

  const [isEditing, setIsEditing] = useState(false);
  const [editingProposalId, setEditingProposalId] = useState(null);
  const [originalProposal, setOriginalProposal] = useState(null);

  const [isDurationOpen, setIsDurationOpen] = useState(false);
  const [isDurationValueOpen, setIsDurationValueOpen] = useState(false);

  const durationDropdownRef = useRef(null);
  const durationValueDropdownRef = useRef(null);

  const [durationUnitError, setDurationUnitError] = useState("");
  const [durationValueError, setDurationValueError] = useState("");

  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipAnchor, setTooltipAnchor] = useState(null);
  const tooltipAnchorRef = useRef(null);
  const tooltipTimeout = useRef(null);

  const durationOptions = [
    { value: "", label: "Select Duration" },
    { value: "days", label: "Days" },
    { value: "weeks", label: "Weeks" },
    { value: "months", label: "Months" },
    { value: "years", label: "Years" },
  ];

  const getDurationValues = () => {
    switch (durationUnit) {
      case "days": return ["1 Day", "2 Days", "3 Days", "4 Days", "5 Days", "6 Days", "7 Days", "8 Days", "9 Days", "10 Days", "11 Days", "12 Days", "13 Days", "14 Days", "15 Days", "16 Days", "17 Days", "18 Days", "19 Days", "20 Days", "21 Days", "22 Days", "23 Days", "24 Days", "25 Days", "26 Days", "27 Days", "28 Days", "29 Days", "30 Days"];
      case "weeks": return ["1 Week", "2 Weeks", "3 Weeks", "4 Weeks"];
      case "months": return ["1 Month", "2 Months", "3 Months", "4 Months", "5 Months", "6 Months", "7 Months", "8 Months", "9 Months", "10 Months", "11 Months", "12 Months"];
      case "years": return ["1 Year", "2 Years", "3 Years", "4 Years", "5 Years"];
      default: return [];
    }
  };

  const parseDurationToDays = (durationStr) => {
    if (!durationStr) return null;
    const str = durationStr.toLowerCase();
    const match = str.match(/(\d+)\s*(day|week|month|year)/i);
    if (!match) return null;
    const value = parseInt(match[1]);
    const unit = match[2];
    if (unit === 'day') return value;
    if (unit === 'week') return value * 7;
    if (unit === 'month') return value * 30;
    if (unit === 'year') return value * 365;
    return null;
  };

  // Convert days to best duration unit
  const daysToDuration = (days) => {
    if (days <= 30) {
      return { value: days, unit: 'days', label: `${days} Day${days > 1 ? 's' : ''}` };
    } else if (days <= 52) {
      const weeks = Math.round(days / 7);
      return { value: weeks, unit: 'weeks', label: `${weeks} Week${weeks > 1 ? 's' : ''}` };
    } else if (days <= 365) {
      const months = Math.round(days / 30);
      return { value: months, unit: 'months', label: `${months} Month${months > 1 ? 's' : ''}` };
    } else {
      const years = Math.round(days / 365);
      return { value: years, unit: 'years', label: `${years} Year${years > 1 ? 's' : ''}` };
    }
  };

  // Calculate proposed duration based on milestone due dates
  const calculateDurationFromMilestones = () => {
    if (!paymentType === 'milestone' || milestones.length === 0) return null;

    const validDates = milestones
      .map(m => m.due_date)
      .filter(date => date);

    if (validDates.length === 0) return null;

    const latestDate = new Date(Math.max(...validDates.map(date => new Date(date))));
    const startDate = jobDetails?.start_date
      ? new Date(jobDetails.start_date)
      : jobDetails?.created_at
        ? new Date(jobDetails.created_at)
        : new Date();

    const diffTime = Math.abs(latestDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return null;

    return daysToDuration(diffDays);
  };

  // Auto-update proposed duration when milestones change
  useEffect(() => {
    if (paymentType === 'milestone' && showMilestones) {
      const calculatedDuration = calculateDurationFromMilestones();
      if (calculatedDuration) {
        setDurationUnit(calculatedDuration.unit);
        setDurationValue(calculatedDuration.label);
        setDurationValueError("");
      }
    }
  }, [milestones, paymentType, showMilestones, jobDetails]);

  const getMinDateForMilestone = (index) => {
    if (index === 0) {
      const today = new Date();
      return today.toISOString().split('T')[0];
    } else {
      const previousDate = milestones[index - 1].due_date;
      if (previousDate) {
        const minDate = new Date(previousDate);
        minDate.setDate(minDate.getDate() + 1);
        return minDate.toISOString().split('T')[0];
      }
      return new Date().toISOString().split('T')[0];
    }
  };

  const validateMilestoneDates = (index, newDate) => {
    if (index > 0) {
      const previousDate = milestones[index - 1].due_date;
      if (previousDate && newDate <= previousDate) {
        setDateErrors(prev => ({
          ...prev,
          [index]: `Due date must be after ${previousDate}`
        }));
        return false;
      }
    }

    if (index < milestones.length - 1) {
      const nextDate = milestones[index + 1].due_date;
      if (nextDate && newDate >= nextDate) {
        setDateErrors(prev => ({
          ...prev,
          [index]: `Due date must be before ${nextDate}`
        }));
        return false;
      }
    }

    setDateErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });
    return true;
  };

  const compareDurations = (proposedDuration, jobDuration) => {
    if (!proposedDuration || !jobDuration) return null;
    const proposedDays = parseDurationToDays(proposedDuration);
    const jobDays = parseDurationToDays(jobDuration);
    if (!proposedDays || !jobDays) return null;
    if (proposedDays > jobDays) {
      return { type: 'longer', message: `⚠️ Your proposed duration (${proposedDuration}) is LONGER than client's expected duration (${jobDuration})`, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' };
    } else if (proposedDays < jobDays) {
      return { type: 'shorter', message: `ℹ️ Your proposed duration (${proposedDuration}) is SHORTER than client's expected duration (${jobDuration})`, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
    } else {
      return { type: 'equal', message: `✓ Your proposed duration (${proposedDuration}) matches client's expectation`, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
    }
  };

  const validateMilestones = () => {
    const errors = {};
    let totalAmount = 0;

    milestones.forEach((milestone, index) => {
      const amount = parseFloat(milestone.amount);
      totalAmount += isNaN(amount) ? 0 : amount;

      if (!milestone.description || !milestone.description.trim()) {
        errors[`desc_${index}`] = 'Description required';
      }
      if (!milestone.due_date) {
        errors[`date_${index}`] = 'Due date required';
      }
      if (isNaN(amount) || amount <= 0) {
        errors[`amount_${index}`] = 'Amount must be greater than 0';
      }
    });

    const bid = parseFloat(bidAmount);
    if (bid > 0 && Math.abs(totalAmount - bid) > 0.01) {
      errors['total'] = `Total milestone amount (₹${totalAmount.toFixed(2)}) must equal bid amount (₹${bid.toFixed(2)})`;
    }

    setMilestoneErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculateMilestoneBreakdown = () => {
    if (paymentType !== 'milestone' || milestones.length === 0) return [];
    const totalAmount = milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);
    return milestones.map((milestone, idx) => ({
      id: idx,
      description: milestone.description,
      due_date: milestone.due_date,
      amount: parseFloat(milestone.amount) || 0,
      percentage: totalAmount > 0 ? ((parseFloat(milestone.amount) || 0) / totalAmount * 100).toFixed(1) : 0
    }));
  };

  // Auto-update bid amount when milestones change - FIXED
  useEffect(() => {
    if (paymentType === 'milestone' && milestones.length > 0) {
      const totalAmount = milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);
      // Always update bid amount, even if total is 0
      setBidAmount(totalAmount.toString());
      setBidAmountError('');
    }
  }, [milestones, paymentType]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (durationDropdownRef.current && !durationDropdownRef.current.contains(event.target)) setIsDurationOpen(false);
      if (durationValueDropdownRef.current && !durationValueDropdownRef.current.contains(event.target)) setIsDurationValueOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (durationValue && jobDetails?.duration) {
      setDurationComparison(compareDurations(durationValue, jobDetails.duration));
    }
  }, [durationValue, jobDetails]);

  useEffect(() => {
    if (paymentType === 'milestone') {
      setMilestoneBreakdown(calculateMilestoneBreakdown());
      if (submitAttempted) {
        validateMilestones();
      }
    }
  }, [milestones, paymentType, bidAmount, submitAttempted]);

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Recently";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      else if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      else if (diffDays === 1) return "1 day ago";
      else if (diffDays < 7) return `${diffDays} days ago`;
      else return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (error) { return "Recently"; }
  };

  const formatDate = (d) => {
    if (!d) return null;
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return null; }
  };

  const calculateEndDate = () => {
    if (!jobDetails) return null;
    if (jobDetails.end_date) return formatDate(jobDetails.end_date);
    const startDate = jobDetails.start_date ? new Date(jobDetails.start_date) : jobDetails.created_at ? new Date(jobDetails.created_at) : null;
    if (!startDate || !jobDetails.duration) return null;
    const days = parseDurationToDays(jobDetails.duration);
    if (!days) return null;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);
    return formatDate(endDate);
  };

  const handleDescriptionChange = (index, value) => {
    let filtered = value;
    filtered = filtered.replace(/[0-9]/g, '');
    if (filtered.length > 100) {
      filtered = filtered.slice(0, 100);
    }
    filtered = filtered.replace(/[^a-zA-Z\s\-_,.!?'"()]/g, '');
    handleMilestoneChange(index, 'description', filtered);

    if (/\d/.test(value)) {
      setDescErrors(prev => ({ ...prev, [index]: 'Numbers are not allowed in milestone description' }));
    } else if (value !== filtered && value.length > 100) {
      setDescErrors(prev => ({ ...prev, [index]: 'Description cannot exceed 100 characters' }));
    } else if (value !== filtered && /[^a-zA-Z\s\-_,.!?'"()]/.test(value)) {
      setDescErrors(prev => ({ ...prev, [index]: 'Only letters, spaces, and punctuation (. , - _ ! ? \' " ( )) are allowed' }));
    } else if (filtered.length > 0 && filtered.length < 3) {
      setDescErrors(prev => ({ ...prev, [index]: 'Description must be at least 3 characters' }));
    } else {
      setDescErrors(prev => { const next = { ...prev }; delete next[index]; return next; });
    }
  };

  const handleAmountChange = (index, value) => {
    if (value === '') {
      handleMilestoneChange(index, 'amount', '');
      setAmountFieldErrors(prev => ({ ...prev, [index]: '' }));
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num) && num < 0) {
      setAmountFieldErrors(prev => ({ ...prev, [index]: 'Amount cannot be negative' }));
      handleMilestoneChange(index, 'amount', value);
    } else if (!isNaN(num) && num === 0) {
      setAmountFieldErrors(prev => ({ ...prev, [index]: 'Amount must be greater than 0' }));
      handleMilestoneChange(index, 'amount', value);
    } else {
      setAmountFieldErrors(prev => { const next = { ...prev }; delete next[index]; return next; });
      handleMilestoneChange(index, 'amount', value);
    }
  };

  const handleDateChange = (index, value) => {
    if (validateMilestoneDates(index, value)) {
      handleMilestoneChange(index, 'due_date', value);
    } else {
      handleMilestoneChange(index, 'due_date', value);
    }
  };

  const handleBidAmountChange = (value) => {
    if (paymentType === 'milestone') return;
    setBidAmount(value);
    if (value === '') {
      setBidAmountError('');
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num) && num < 0) {
      setBidAmountError('Amount cannot be negative');
    } else if (!isNaN(num) && num === 0) {
      setBidAmountError('Amount must be greater than 0');
    } else {
      setBidAmountError('');
    }
  };

  const handleCoverLetterChange = (value) => {
    let filtered = value;
    if (filtered.length > 300) {
      filtered = filtered.slice(0, 300);
    }
    filtered = filtered.replace(/[^a-zA-Z\s.,'?!-]/g, '');
    setCoverLetter(filtered);

    if (value !== filtered && value.length > 300) {
      setCoverLetterError('Cover letter cannot exceed 300 characters');
    } else if (value !== filtered && /[^a-zA-Z\s.,'?!-]/.test(value)) {
      setCoverLetterError('Cover letter can only contain letters, spaces, and punctuation (. , \' ? ! -)');
    } else if (filtered.trim().length > 0 && filtered.trim().length < 10) {
      setCoverLetterError('Cover letter must be at least 10 characters');
    } else {
      setCoverLetterError('');
    }
  };

  const validateCoverLetter = () => {
    if (!coverLetter.trim()) {
      setCoverLetterError('Cover letter is required');
      return false;
    }
    if (coverLetter.trim().length < 10) {
      setCoverLetterError('Cover letter must be at least 10 characters');
      return false;
    }
    if (coverLetter.length > 300) {
      setCoverLetterError('Cover letter cannot exceed 300 characters');
      return false;
    }
    if (/\d/.test(coverLetter)) {
      setCoverLetterError('Numbers are not allowed in cover letter');
      return false;
    }
    setCoverLetterError('');
    return true;
  };

  const validateBidAmount = () => {
    if (!bidAmount) {
      setBidAmountError('Please enter your bid amount');
      return false;
    }
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      setBidAmountError('Please enter a valid amount greater than 0');
      return false;
    }
    setBidAmountError('');
    return true;
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const MAX_SIZE = 25 * 1024 * 1024;
    const oversized = files.filter(f => f.size > MAX_SIZE);
    if (oversized.length > 0) {
      setAttachmentError(`File(s) too large: ${oversized.map(f => f.name).join(', ')}. Maximum size is 25MB per file.`);
      const valid = files.filter(f => f.size <= MAX_SIZE);
      setAttachments(prev => [...prev, ...valid]);
    } else {
      setAttachmentError('');
      setAttachments(prev => [...prev, ...files]);
    }
    e.target.value = '';
  };

  const prefillFormData = (proposalData) => {
    if (proposalData.cover_letter) setCoverLetter(proposalData.cover_letter);
    if (proposalData.bid_amount) setBidAmount(proposalData.bid_amount.toString());

    if (proposalData.duration) {
      setDurationValue(proposalData.duration);
      const match = proposalData.duration.match(/(\d+)\s*(day|week|month|year)/i);
      if (match) {
        const unit = match[2].toLowerCase();
        if (unit === 'day') setDurationUnit('days');
        else if (unit === 'week') setDurationUnit('weeks');
        else if (unit === 'month') setDurationUnit('months');
        else if (unit === 'year') setDurationUnit('years');
      }
    }

    if (proposalData.payment_type === 'milestone') {
      setPaymentType('milestone');
      setShowMilestones(true);

      if (proposalData.milestones_data && proposalData.milestones_data.length > 0) {
        const formattedMilestones = proposalData.milestones_data.map(m => ({
          description: m.description || '',
          due_date: m.due_date || '',
          amount: m.amount ? m.amount.toString() : ''
        }));
        setMilestones(formattedMilestones);
      } else if (proposalData.milestone_description) {
        let desc = proposalData.milestone_description;
        let dueDate = proposalData.milestone_due_date || '';
        let amount = proposalData.milestone_amount || '';

        if (typeof desc === 'string' && desc.startsWith('[') && desc.endsWith(']')) {
          try {
            const parsed = JSON.parse(desc);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const formatted = parsed.map(m => ({
                description: m.description || '',
                due_date: m.due_date || '',
                amount: m.amount ? m.amount.toString() : ''
              }));
              setMilestones(formatted);
              return;
            }
          } catch (e) { }
        }

        setMilestones([{
          description: desc || '',
          due_date: dueDate ? dueDate.split('T')[0] : '',
          amount: amount ? amount.toString() : ''
        }]);
      }
    } else {
      setPaymentType('project');
      setShowMilestones(false);
      setMilestones([{ description: '', due_date: '', amount: '' }]);
    }

    setAttachments([]);
  };

  useEffect(() => {
    if (location.state?.isEditing && location.state?.proposalData) {
      setIsEditing(true);
      setEditingProposalId(location.state.proposalData.id);
      setOriginalProposal(location.state.proposalData);
      prefillFormData(location.state.proposalData);
    }

    if (location.state?.jobId) {
      fetchFullJobDetails(location.state.jobId);
    } else if (!location.state?.isEditing) {
      toast.error('Job information missing');
      navigate('/col-home');
    }
  }, [location.state, navigate]);

  const fetchFullJobDetails = async (jobId) => {
    setFetchingJob(true);
    try {
      const response = await api.get(`/collaborator/jobs/${jobId}`);
      const jobData = response.data || {};
      const creatorData = jobData.creator || {};
      setJobDetails({
        ...jobData,
        jobId: jobData.id,
        jobTitle: jobData.title,
        description: jobData.description,
        skills_required: jobData.skills_required || [],
        budget_from: jobData.budget_from,
        budget_to: jobData.budget_to,
        budget_type: jobData.budget_type,
        expertise_level: jobData.expertise_level,
        created_at: jobData.created_at,
        start_date: jobData.start_date,
        end_date: jobData.end_date,
        duration: jobData.duration,
        proposal_count: jobData.proposal_count || 0,
        required_connects: jobData.required_connects || 6
      });
      setCreator(creatorData);
    } catch (error) {
      console.error('Error fetching job details:', error);
      toast.error('Failed to load job details');
      navigate('/col-home');
    } finally {
      setFetchingJob(false);
    }
  };

  const handleMilestoneChange = (index, field, value) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  const addMilestone = () => {
    setMilestones([...milestones, { description: '', due_date: '', amount: '' }]);
  };

  const removeMilestone = (index, btnRef) => {
    if (milestones.length > 1) {
      const updated = milestones.filter((_, i) => i !== index);
      setMilestones(updated);
    } else {
      tooltipAnchorRef.current = btnRef;
      setTooltipVisible(true);
      clearTimeout(tooltipTimeout.current);
      tooltipTimeout.current = setTimeout(() => setTooltipVisible(false), 2200);
    }
  };

  const removeFile = (index) => {
    const updated = attachments.filter((_, i) => i !== index);
    setAttachments(updated);
  };

  const formatBudget = () => {
    if (!jobDetails) return '₹0.00';
    const isFixed = jobDetails.budget_type === 'fixed' || jobDetails.budget_type === 'Fixed';
    if (isFixed) {
      const amount = jobDetails.budget_to || jobDetails.budget_from;
      return amount ? `₹${amount}` : '₹0.00';
    }
    if (jobDetails.budget_from && jobDetails.budget_to) return `₹${jobDetails.budget_from} – ₹${jobDetails.budget_to}`;
    else if (jobDetails.budget_from) return `₹${jobDetails.budget_from}`;
    else if (jobDetails.budget_to) return `₹${jobDetails.budget_to}`;
    return '₹0.00';
  };

  const formatBudgetType = (budgetType) => {
    if (!budgetType) return 'Fixed-price';
    return budgetType === 'fixed' || budgetType === 'Fixed' ? 'Fixed-price' : 'Hourly';
  };

  const handleSubmitProposal = async () => {
    setSubmitAttempted(true);

    let hasErrors = false;

    if (!validateCoverLetter()) hasErrors = true;

    if (!durationUnit || !durationValue) {
      toast.error('Please fill all the required fields');
      hasErrors = true;
    }

    if (!validateBidAmount()) hasErrors = true;

    if (paymentType === 'milestone') {
      const isValid = validateMilestones();
      if (!isValid) {
        toast.error('Please fix all the validation errors');
        hasErrors = true;
      }
    }

    if (hasErrors) {
      toast.error('Please fill all the required fields and fix all validation errors');
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Submitting proposal...');

    try {
      const formData = new FormData();
      formData.append('job_id', jobDetails.jobId);
      formData.append('freelancer_id', userData.id);
      formData.append('bid_amount', parseFloat(bidAmount));
      formData.append('cover_letter', coverLetter);
      formData.append('duration', durationValue);
      formData.append('payment_type', paymentType);

      if (jobDetails?.skills_required?.length > 0) {
        formData.append('skills', jobDetails.skills_required.join(', '));
      }

      if (paymentType === 'milestone') {
        const milestonesData = milestones.map(m => ({
          description: m.description,
          due_date: m.due_date,
          amount: parseFloat(m.amount)
        }));
        formData.append('milestones_json', JSON.stringify(milestonesData));
      }

      attachments.forEach(file => { formData.append('attachments', file); });

      const response = await api.post('/proposals/CreateProposal', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data && response.data.proposal_id) {
        toast.dismiss(loadingToast);
        toast.success('Proposal submitted successfully!');
        setTimeout(() => {
          navigate('/proposal', {
            state: {
              proposalId: response.data.proposal_id,
              jobId: jobDetails.jobId,
              jobTitle: jobDetails.jobTitle
            }
          });
        }, 500);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      const detail = error.response?.data?.detail || 'Failed to submit proposal';
      toast.error(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProposal = async () => {
    setSubmitAttempted(true);

    let hasErrors = false;

    if (!validateCoverLetter()) hasErrors = true;

    if (!durationUnit || !durationValue) {
      toast.error('Please fill all the required fields');
      hasErrors = true;
    }

    if (!validateBidAmount()) hasErrors = true;

    if (paymentType === 'milestone') {
      const isValid = validateMilestones();
      if (!isValid) {
        toast.error('Please fix all the validation errors');
        hasErrors = true;
      }
    }

    if (hasErrors) {
      toast.error('Please fill all the required fields and fix all validation errors');
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Updating proposal...');

    try {
      const formData = new FormData();
      formData.append('bid_amount', parseFloat(bidAmount));
      formData.append('cover_letter', coverLetter);
      formData.append('duration', durationValue);
      formData.append('payment_type', paymentType);

      if (paymentType === 'milestone') {
        const milestonesData = milestones.map(m => ({
          description: m.description,
          due_date: m.due_date,
          amount: parseFloat(m.amount)
        }));
        formData.append('milestones_json', JSON.stringify(milestonesData));
      }

      attachments.forEach(file => { formData.append('attachments', file); });

      const response = await api.put(`/proposals/EditProposal/${editingProposalId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.status === 200) {
        toast.dismiss(loadingToast);
        toast.success('Proposal updated successfully!');
        setTimeout(() => {
          navigate('/proposal', {
            state: {
              proposalId: editingProposalId,
              updated: true,
              jobId: jobDetails?.jobId
            }
          });
        }, 500);
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error updating proposal:', error);
      const detail = error.response?.data?.detail || 'Failed to update proposal';
      toast.error(detail);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingJob) {
    return (
      <div className="w-full bg-[#F5F5F5] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const calculatedEndDate = calculateEndDate();
  const displayStartDate = formatDate(jobDetails?.start_date) || formatDate(jobDetails?.created_at) || "—";
  const totalMilestoneAmount = milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);
  const isFixed = jobDetails?.budget_type === 'fixed' || jobDetails?.budget_type === 'Fixed';

  const inputBase = {
    border: '2px solid #9CA3AF',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '14px',
    outline: 'none',
    background: 'white',
    width: '100%',
  };

  // Check if duration should be disabled (auto-calculated from milestones)
  const isDurationDisabled = paymentType === 'milestone' && showMilestones && milestones.some(m => m.due_date);

  return (
    <div className="w-full bg-[#F5F5F5] min-h-screen">
      <MilestoneTooltip visible={tooltipVisible} anchorRef={tooltipAnchorRef} />

      <div className="absolute top-0 left-0 w-full z-50"><ColHeader /></div>

      <div className="relative w-full h-[420px] md:h-[520px] xl:h-[582px]">
        <img src={TopBanner} alt="banner" className="absolute inset-0 w-full h-full object-cover blur-[1px]" />
      </div>

      <div className="flex justify-center px-4 sm:px-6">
        <div className="relative w-full max-w-[1100px] -mt-[240px] lg:-mt-[300px] bg-white border border-black mb-10">
          <div className="px-6 md:px-8 pt-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 group mb-4"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-[#51218F] to-[#2a0e4a]">
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

              <span className="font-semibold text-[14px] text-[#51218F]">
                Back
              </span>
            </button>
          </div>

          <div className="px-6 md:px-8 py-6">
            <h2 className="text-[22px] font-bold mb-1 text-gray-900">{jobDetails?.jobTitle || "Job Title"}</h2>
            <p className="text-[13px] text-gray-400 mb-4">Posted {formatTimeAgo(jobDetails?.created_at)}</p>

            {jobDetails?.description && (
              <div className="mb-5">
                <p className="text-[15px] leading-[26px] text-gray-700 whitespace-pre-line">{jobDetails.description}</p>
              </div>
            )}

            {(displayStartDate !== "—" || calculatedEndDate) && (
              <div className="flex gap-6 mb-5 flex-wrap">
                <div><p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Start Date</p><p className="text-[15px] font-semibold text-gray-800">{displayStartDate}</p></div>
                {calculatedEndDate && <div><p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">End Date</p><p className="text-[15px] font-semibold text-gray-800">{calculatedEndDate}</p></div>}
                {jobDetails?.duration && <div><p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Client's Expected Duration</p><p className="text-[15px] font-semibold text-gray-800">{jobDetails.duration}</p></div>}
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg mb-5 border border-gray-100">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[15px]">Client's budget:</span>
                <span className="text-[#5B2D91] font-bold text-[15px]">{formatBudgetType(jobDetails?.budget_type)} — {formatBudget()}</span>
              </div>
              {creator && (
                <div className="flex justify-between items-center mt-2 text-[13px] text-gray-600">
                  <span>Client:</span>
                  <span className="font-medium">{creator?.full_name || creator?.email || 'Client'}</span>
                </div>
              )}
            </div>

            <div className="h-px bg-gray-200 w-full mb-4"></div>

            <button onClick={() => setShowMilestones(prev => !prev)} className="text-[#5B2D91] text-[14px] mb-5 font-medium">
              {showMilestones ? "− Hide milestones" : "+ Add milestones"}
            </button>

            {showMilestones && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-5">
                <h3 className="text-[16px] font-semibold mb-5 text-gray-900">How do you want to be paid?</h3>

                <div className="space-y-5 mb-8">
                  <label className="flex items-start gap-4 cursor-pointer">
                    <input type="radio" name="payment" checked={paymentType === 'milestone'} onChange={() => setPaymentType('milestone')} className="mt-1 accent-[#5B2D91]" />
                    <div>
                      <p className="font-medium text-[14px] text-gray-900">By milestone</p>
                      <p className="text-[13px] text-gray-500 leading-relaxed">Divide the project into smaller segments, called milestones. You'll be paid for milestones as they are completed and approved.</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-4 cursor-pointer">
                    <input type="radio" name="payment" checked={paymentType === 'project'} onChange={() => setPaymentType('project')} className="mt-1 accent-[#5B2D91]" />
                    <div>
                      <p className="font-medium text-[14px] text-gray-900">By project</p>
                      <p className="text-[13px] text-gray-500 leading-relaxed">Get your entire payment at the end, when all work has been delivered.</p>
                    </div>
                  </label>
                </div>

                {paymentType === 'milestone' && (
                  <>
                    <div className="mb-5 flex items-start gap-3 px-4 py-3 bg-[#F7F3FD] border border-[#D4B8F0] rounded-lg">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#5B2D91] flex items-center justify-center mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#3d1768]">
                          Client's budget: {formatBudget()}
                        </p>
                        <p className="text-[12px] text-[#6B3FA8] mt-0.5">
                          You can propose any amount you feel is fair. The creator will review and decide.
                        </p>
                      </div>
                    </div>

                    {milestoneBreakdown.length > 0 && milestoneBreakdown.some(m => m.amount > 0) && (
                      <div className="mb-6 overflow-x-auto rounded-lg border-2 border-[#5B2D91]">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-[#5B2D91]">
                              <th className="px-4 py-2.5 text-center text-sm font-semibold text-white border-r border-[#7a45b0]">#</th>
                              <th className="px-4 py-2.5 text-center text-sm font-semibold text-white border-r border-[#7a45b0]">Description</th>
                              <th className="px-4 py-2.5 text-center text-sm font-semibold text-white border-r border-[#7a45b0]">Due Date</th>
                              <th className="px-4 py-2.5 text-center text-sm font-semibold text-white">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {milestoneBreakdown.map((milestone, idx) => (
                              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF7FF]'}>
                                <td className="px-4 py-2.5 text-sm text-gray-700 text-center border border-[#E2D4F5]">{idx + 1}</td>
                                <td className="px-4 py-2.5 text-sm text-gray-700 text-center border border-[#E2D4F5]">{milestone.description || '–'}</td>
                                <td className="px-4 py-2.5 text-sm text-gray-700 text-center border border-[#E2D4F5]">{milestone.due_date || '–'}</td>
                                <td className="px-4 py-2.5 text-sm font-semibold text-[#5B2D91] text-center border border-[#E2D4F5]">₹{milestone.amount.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-[#F0E8FB]">
                              <td colSpan="3" className="px-4 py-2.5 text-sm font-bold text-[#3d1768] text-center border border-[#D4B8F0]">Total</td>
                              <td className="px-4 py-2.5 text-sm font-bold text-[#5B2D91] text-center border border-[#D4B8F0]">₹{totalMilestoneAmount.toFixed(2)}</td>
                            </tr>
                          </tfoot>
                        </table>
                        {/* {bidAmount && Math.abs(totalMilestoneAmount - parseFloat(bidAmount)) > 0.01 && (
                          <p className="text-red-500 text-xs mt-2 mb-1 px-4 text-right">
                            ⚠️ Total (₹{totalMilestoneAmount.toFixed(2)}) must equal bid amount (₹{parseFloat(bidAmount).toFixed(2)})
                          </p>
                        )} */}
                      </div>
                    )}

                    <h4 className="text-[15px] font-semibold text-gray-900 mb-4">Add Milestones</h4>

                    <div className="overflow-x-auto rounded-lg border-2 border-[#5B2D91]">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-[#5B2D91]">
                            <th className="px-3 py-2.5 text-center text-sm font-semibold text-white border-r border-[#7a45b0] w-10">#</th>
                            <th className="px-3 py-2.5 text-center text-sm font-semibold text-white border-r border-[#7a45b0]">Description</th>
                            <th className="px-3 py-2.5 text-center text-sm font-semibold text-white border-r border-[#7a45b0] w-44">Due Date</th>
                            <th className="px-3 py-2.5 text-center text-sm font-semibold text-white border-r border-[#7a45b0] w-36">Amount (₹)</th>
                            <th className="px-3 py-2.5 text-center text-sm font-semibold text-white w-16">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {milestones.map((milestone, index) => {
                            const minDate = getMinDateForMilestone(index);
                            return (
                              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-[#FAF7FF]'}>
                                <td className="px-3 py-2.5 text-sm text-gray-600 border border-[#E2D4F5] text-center font-semibold">
                                  {index + 1}
                                </td>
                                <td className="px-3 py-2.5 border border-[#E2D4F5]">
                                  <input
                                    type="text"
                                    value={milestone.description}
                                    onChange={(e) => handleDescriptionChange(index, e.target.value)}
                                    style={inputBase}
                                    placeholder="e.g., Design Phase, Development, Testing (no numbers)"
                                    maxLength={100}
                                  />
                                  {descErrors[index] && (
                                    <p className="text-red-500 text-[11px] mt-1 font-medium">{descErrors[index]}</p>
                                  )}
                                  {submitAttempted && milestoneErrors[`desc_${index}`] && !descErrors[index] && (
                                    <p className="text-red-500 text-[10px] mt-1 font-medium">{milestoneErrors[`desc_${index}`]}</p>
                                  )}
                                </td>
                                <td className="px-3 py-2.5 border border-[#E2D4F5]">
                                  <input
                                    type="date"
                                    value={milestone.due_date}
                                    min={minDate}
                                    onChange={(e) => handleDateChange(index, e.target.value)}
                                    style={inputBase}
                                  />
                                  {dateErrors[index] && (
                                    <p className="text-red-500 text-[11px] mt-1 font-medium">{dateErrors[index]}</p>
                                  )}
                                  {submitAttempted && milestoneErrors[`date_${index}`] && !dateErrors[index] && (
                                    <p className="text-red-500 text-[10px] mt-1 font-medium">{milestoneErrors[`date_${index}`]}</p>
                                  )}
                                </td>
                                <td className="px-3 py-2.5 border border-[#E2D4F5]">
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm font-semibold">₹</span>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={milestone.amount}
                                      onChange={(e) => handleAmountChange(index, e.target.value)}
                                      onWheel={(e) => {
                                        e.preventDefault();
                                        e.target.blur();
                                      }}
                                      style={{
                                        ...inputBase,
                                        paddingLeft: '28px',
                                        textAlign: 'right',
                                      }}
                                      placeholder="0.00"
                                    />
                                  </div>
                                  {amountFieldErrors[index] && (
                                    <p className="text-red-500 text-[11px] mt-1 font-medium">{amountFieldErrors[index]}</p>
                                  )}
                                  {submitAttempted && milestoneErrors[`amount_${index}`] && !amountFieldErrors[index] && (
                                    <p className="text-red-500 text-[10px] mt-1 font-medium">{milestoneErrors[`amount_${index}`]}</p>
                                  )}
                                </td>
                                <td className="px-3 py-2.5 text-center border border-[#E2D4F5]">
                                  <button
                                    ref={milestones.length === 1 ? tooltipAnchorRef : undefined}
                                    onClick={(e) => removeMilestone(index, e.currentTarget)}
                                    className={`p-1.5 rounded-full transition-colors ${milestones.length === 1
                                      ? 'text-gray-300 cursor-not-allowed'
                                      : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                                      }`}
                                    title=""
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {submitAttempted && milestoneErrors['total'] && (
                      <p className="text-red-500 text-[11px] mt-2 font-medium">{milestoneErrors['total']}</p>
                    )}

                    <button
                      onClick={addMilestone}
                      className="mt-4 text-[#5B2D91] text-[14px] font-medium flex items-center gap-1 hover:underline transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      + Add another milestone
                    </button>
                  </>
                )}
              </div>
            )}

            <div className="h-px bg-gray-200 w-full mb-5"></div>

            <div className="flex flex-col gap-2 mb-6">
              <label className="font-semibold text-[15px] text-[#2A1E17]">Your Proposed Duration <span className="text-red-500">*</span></label>
              {jobDetails?.duration && (
                <div className="mb-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500">Client's expected duration:</p>
                  <p className="text-sm font-semibold text-gray-800">{jobDetails.duration}</p>
                </div>
              )}

              {isDurationDisabled ? (
                <div className="bg-gray-100 p-3 rounded-lg border border-gray-300">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Auto-calculated from milestones: </span>
                    {durationValue || "Not calculated yet"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Duration is automatically calculated based on your milestone due dates</p>
                </div>
              ) : (
                <div className="flex gap-4 flex-wrap">
                  <div className="relative" ref={durationDropdownRef}>
                    <div
                      onClick={() => setIsDurationOpen(!isDurationOpen)}
                      style={{ width: '220px', height: '45px', border: '2px solid #9CA3AF', borderRadius: '10px', padding: '0 16px', fontSize: '14px', fontWeight: '600', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                    >
                      <span style={{ color: durationUnit ? '#040200' : '#9CA3AF' }}>{durationOptions.find(opt => opt.value === durationUnit)?.label || "Select Duration"}</span>
                      <svg style={{ transform: isDurationOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1.5L6 6.5L11 1.5" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    {isDurationOpen && (
                      <div style={{ position: 'absolute', zIndex: 50, width: '220px', marginTop: '4px', background: 'white', border: '2px solid #D1D5DB', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                        {durationOptions.map((option) => (
                          <div key={option.value} onClick={() => { setDurationUnit(option.value); setDurationValue(""); setDurationUnitError(""); setIsDurationOpen(false); }} style={{ padding: '12px 16px', cursor: 'pointer', fontSize: '14px', background: durationUnit === option.value ? '#F5F3FF' : 'white', color: option.value === '' ? '#9CA3AF' : durationUnit === option.value ? '#51218F' : '#374151', fontWeight: durationUnit === option.value ? '600' : '400' }}>{option.label}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  {durationUnit && (
                    <div className="relative" ref={durationValueDropdownRef}>
                      <div
                        onClick={() => setIsDurationValueOpen(!isDurationValueOpen)}
                        style={{ width: '220px', height: '45px', border: '2px solid #9CA3AF', borderRadius: '10px', padding: '0 16px', fontSize: '14px', fontWeight: '600', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                      >
                        <span style={{ color: durationValue ? '#040200' : '#9CA3AF' }}>{durationValue || "Select Time"}</span>
                        <svg style={{ transform: isDurationValueOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1.5L6 6.5L11 1.5" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                      {isDurationValueOpen && (
                        <div style={{ position: 'absolute', zIndex: 50, width: '220px', marginTop: '4px', background: 'white', border: '2px solid #D1D5DB', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden', maxHeight: '220px', overflowY: 'auto' }}>
                          {getDurationValues().map((item, index) => (
                            <div key={index} onClick={() => { setDurationValue(item); setDurationValueError(""); setIsDurationValueOpen(false); }} style={{ padding: '12px 16px', cursor: 'pointer', fontSize: '14px', background: durationValue === item ? '#F5F3FF' : 'white', color: durationValue === item ? '#51218F' : '#374151', fontWeight: durationValue === item ? '600' : '400' }}>{item}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {durationComparison && (
                <div className={`mt-2 p-3 rounded-lg ${durationComparison.bgColor} border ${durationComparison.borderColor}`}>
                  <p className={`text-sm font-medium ${durationComparison.color}`}>{durationComparison.message}</p>
                </div>
              )}
            </div>

            {/* BID AMOUNT SECTION */}
            <div className="flex flex-col gap-2 mb-6">
              <label className="font-semibold text-[15px] text-[#2A1E17]">
                Your Total Bid Amount <span className="text-red-500">*</span>
              </label>

              <div className="w-full sm:w-[300px]">
                <div
                  className="flex items-center w-full h-[50px] rounded-[10px] bg-white"
                  style={{
                    border: "2px solid #9CA3AF",
                    overflow: "hidden",
                  }}
                >
                  <div className="flex items-center justify-center pl-4 pr-2 h-full">
                    <span className="text-black text-[18px] font-semibold leading-none">
                      ₹
                    </span>
                  </div>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={bidAmount}
                    onChange={(e) => handleBidAmountChange(e.target.value)}
                    onWheel={(e) => {
                      e.preventDefault();
                      e.target.blur();
                    }}
                    onBlur={validateBidAmount}
                    readOnly={paymentType === 'milestone'}
                    placeholder="Enter your total bid amount"
                    className="flex-1 h-full bg-transparent outline-none text-[16px] font-semibold text-[#1a1a1a]"
                    style={{
                      border: "none",
                      boxShadow: "none",
                      outline: "none",
                      appearance: "none",
                      WebkitAppearance: "none",
                      MozAppearance: "textfield",
                      paddingRight: "16px",
                    }}
                  />
                </div>

                {paymentType === 'milestone' && (
                  <p className="text-xs text-green-600 mt-1">
                    Auto-calculated from milestone amounts
                  </p>
                )}
              </div>

              {bidAmountError && (
                <p className="text-red-500 text-xs font-medium">
                  {bidAmountError}
                </p>
              )}

              {jobDetails && (jobDetails.budget_from || jobDetails.budget_to) && (
                <div className="mt-1">
                  <p className="text-xs text-gray-500">
                    Client's budget: {formatBudget()}
                    {isFixed ? ' (Fixed price)' : ''}
                  </p>

                  {bidAmount &&
                    !isFixed &&
                    parseFloat(bidAmount) >
                    parseFloat(jobDetails.budget_to || 0) && (
                      <p className="text-xs text-red-500 font-medium mt-1">
                        ⚠️ Your bid is higher than client's maximum budget.
                        They may still accept if they see value.
                      </p>
                    )}

                  {bidAmount &&
                    isFixed &&
                    parseFloat(bidAmount) >
                    parseFloat(
                      jobDetails.budget_to || jobDetails.budget_from || 0
                    ) && (
                      <p className="text-xs text-red-500 font-medium mt-1">
                        ⚠️ Your bid is higher than the client's fixed price.
                        They may still accept if they see value.
                      </p>
                    )}
                </div>
              )}
            </div>

            <div className="h-px bg-gray-200 w-full mb-5"></div>

            <div className="mb-6">
              <label className="block text-[15px] font-semibold mb-2">Write cover letter <span className="text-red-500">*</span></label>
              <textarea
                value={coverLetter}
                onChange={(e) => handleCoverLetterChange(e.target.value)}
                placeholder="Write your cover letter here... (max 300 characters, no numbers allowed)"
                style={{ border: '2px solid #D1D5DB', borderRadius: '8px', padding: '16px', width: '100%', height: '180px', fontSize: '15px', outline: 'none', resize: 'none' }}
                required
              />
              <div className="flex justify-between items-center mt-1">
                {coverLetterError && <p className="text-red-500 text-xs font-medium">{coverLetterError}</p>}
                <p className={`text-xs ml-auto ${coverLetter.length > 280 ? 'text-red-500' : 'text-gray-400'}`}>
                  {coverLetter.length}/300 characters
                </p>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-[15px] font-semibold mb-2">Attachments</label>
              <input type="file" id="projectUpload" multiple className="hidden" onChange={handleFileUpload} />
              <div
                style={{ border: '2px solid #D1D5DB', borderRadius: '8px', padding: '40px 20px', textAlign: 'center', fontSize: '15px', cursor: 'pointer', backgroundColor: 'white' }}
                onClick={() => document.getElementById("projectUpload").click()}
              >
                Drag or <b className="text-purple-500 underline">upload project</b> files
              </div>
              {attachmentError && (
                <p className="text-red-500 text-[12px] mt-2 font-medium">⚠️ {attachmentError}</p>
              )}
              <p className="text-[11px] text-gray-400 mt-1">Maximum file size: 25MB per file</p>
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] text-gray-700">{file.name}</span>
                        <span className="text-[11px] text-gray-400">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                      </div>
                      <button onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={isEditing ? handleUpdateProposal : handleSubmitProposal}
                disabled={loading}
                className="bg-[#5B2D91] text-white px-6 py-3 rounded-full text-[14px] font-semibold hover:bg-[#4a2373] transition-colors disabled:opacity-50 w-full sm:w-auto"
              >
                {loading ? (isEditing ? 'Updating...' : 'Submitting...') : (isEditing ? 'Update Proposal' : 'Submit Proposal')}
              </button>
              <button
                onClick={() => navigate(-1)}
                className="bg-red-600 text-white px-6 py-3 rounded-full text-[14px] font-semibold hover:bg-red-700 transition-colors w-full sm:w-auto"
              >
                Cancel
              </button>
            </div>

            {isEditing && (
              <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-200">
                Editing existing proposal (ID: {editingProposalId})
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}