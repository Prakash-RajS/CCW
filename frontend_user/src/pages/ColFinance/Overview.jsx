import React, { useState, useEffect } from 'react';
import ColHeader from "../../component/ColHeader";
import Footer from "../../component/Footer";
import HomeBg from "../../assets/AfterSign/HomeBg.png";
import Default from "../../assets/AfterSign/Default.png";
import successIcon from "../../assets/Financials/successIcon.png";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import api from "../../utils/axiosConfig";
import toast from "../../component/Toast";

// Helper: Levenshtein distance for email typo detection
function levenshtein(a, b) {
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  return matrix[b.length][a.length];
}

const Overview = () => {
  const { userData, updateUserData } = useUser();
  const [activeTab, setActiveTab] = useState('available');
  const navigate = useNavigate();

  // ---------- NEW: local user data (refreshed on mount) ----------
  const [localUserData, setLocalUserData] = useState(null);

  // ---------- Helper: use fresh local data if available, otherwise fallback to context ----------
  const effectiveUser = localUserData || userData;
  const hasPhone = effectiveUser && (effectiveUser.phone || effectiveUser.mobile || effectiveUser.phone_number);
  const hasEmail = effectiveUser && effectiveUser.email && effectiveUser.email.trim() !== "";

  // Wallet states
  const [walletBalance, setWalletBalance] = useState(0);
  const [loadingWallet, setLoadingWallet] = useState(true);

  // Contract states
  const [workInProgressContracts, setWorkInProgressContracts] = useState([]);
  const [inReviewContracts, setInReviewContracts] = useState([]);
  const [loadingContracts, setLoadingContracts] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Cashfree Wallet Status
  const [walletStatus, setWalletStatus] = useState({
    isReady: false,
    canWithdraw: false,
    hasBeneficiary: false,
    withdrawal_methods_count: 0,
    status: null,
    message: null,
    loading: true,
    error: null
  });

  // Withdrawal methods
  const [withdrawalMethods, setWithdrawalMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);

  // Modal States
  const [showWithdrawPopup, setShowWithdrawPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [showMethodsPopup, setShowMethodsPopup] = useState(false);
  const [methodType, setMethodType] = useState("bank");
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');

  // Frontend validation errors only
  const [validationErrors, setValidationErrors] = useState({
    account_holder: '',
    email: '',
    phone: '',
    bank_account: '',
    ifsc_code: '',
    upi_id: '',
  });

  // Beneficiary form states
  const [beneficiaryForm, setBeneficiaryForm] = useState({
    bank_account: '',
    ifsc_code: '',
    account_holder: '',
    upi_id: '',
    email: '',
    phone: ''
  });
  const [registeringBeneficiary, setRegisteringBeneficiary] = useState(false);
  const [beneficiaryError, setBeneficiaryError] = useState('');

  // ========== EMAIL VERIFICATION STATES (reused from Home/WithdrawFunds) ==========
  const [showEmailSetupPopup, setShowEmailSetupPopup] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [showOTPPopup, setShowOTPPopup] = useState(false);
  const [emailVerificationSuccess, setEmailVerificationSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTime, setResendTime] = useState(45);
  const [rateLimitError, setRateLimitError] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [cooldownToken, setCooldownToken] = useState("");
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  // Auto-close success popup after 2 seconds
  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => {
        setShowSuccessPopup(false);
        setWithdrawAmount('');
        setWithdrawError('');
        fetchWalletBalance();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup]);

  // Auto-close email verification success popup after 2 seconds
  useEffect(() => {
    if (emailVerificationSuccess) {
      const timer = setTimeout(() => {
        setEmailVerificationSuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [emailVerificationSuccess]);

  // OTP countdown timer
  useEffect(() => {
    let timer;
    if (showOTPPopup && resendTime > 0) {
      timer = setInterval(() => {
        setResendTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showOTPPopup, resendTime]);

  // Shared input style — always-visible gray border
  const inputStyle = {
    width: "100%",
    height: "40px",
    padding: "0 12px",
    borderRadius: "8px",
    border: "2px solid #9ca3af",
    outline: "none",
    fontSize: "14px",
    fontFamily: "Montserrat, sans-serif",
    backgroundColor: "#ffffff",
    boxSizing: "border-box",
  };

  const helperTextStyle = {
    fontSize: "11px",
    marginTop: "4px",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  };

  // Helper function to get character count for display
  const getCharCount = (value, maxLength) => {
    const length = value.length;
    return `${length}/${maxLength}`;
  };

  // Helper function to get digit count for phone
  const getPhoneDigitCount = (value) => {
    const digitsOnly = value.replace(/\D/g, '');
    return `${digitsOnly.length}/10`;
  };

  // Helper function to get digit count for bank account
  const getBankAccountDigitCount = (value) => {
    const digitsOnly = value.replace(/\s/g, '');
    return `${digitsOnly.length}/20`;
  };

  // ─────────────────────────────────────────────────────────
  // FRONTEND VALIDATION FUNCTIONS (regex only)
  // ─────────────────────────────────────────────────────────

  const validateAccountHolder = (value) => {
    if (!value) return '';
    const errors = [];

    if (!/^[A-Za-z\s]+$/.test(value)) {
      errors.push("Only alphabets and spaces are allowed");
    }

    if (value.length > 50) {  // Changed from 20 to 50
      errors.push("Account holder name cannot exceed 50 characters");
    }

    return errors.join(". ");
  };

  const validateBankAccount = (value) => {
    if (!value) return '';
    const errors = [];

    // Check for whitespace
    if (/\s/.test(value)) {
      errors.push("Spaces are not allowed");
    }

    const digitsOnly = value.replace(/\s/g, '');
    if (digitsOnly.length > 0 && !/^\d+$/.test(digitsOnly)) {
      errors.push("Bank account number should contain only digits");
    }
    if (digitsOnly.length > 0) {
      if (digitsOnly.length < 9) {
        errors.push("Bank account number must be at least 9 digits");
      }
      if (digitsOnly.length > 20) {
        errors.push("Bank account number cannot exceed 20 digits");
      }
    }
    return errors.join(". ");
  };

  const validatePhone = (value) => {
    if (!value) return '';

    if (!/^\d+$/.test(value)) {
      return "Phone number must contain only digits";
    }

    if (value.length !== 10) {
      return "Phone number must be 10 digits";
    }

    if (!/^[6-9]\d{9}$/.test(value)) {
      return "Invalid Indian mobile number";
    }

    return '';
  };

  const validateEmailFormat = (value) => {
    const email = value.trim().toLowerCase();

    if (!email) return "";

    // Basic email format
    const emailRegex =
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,10}$/;

    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }

    // Invalid patterns
    if (
      email.includes("..") ||
      email.includes(".@") ||
      email.includes("@.") ||
      email.startsWith(".") ||
      email.endsWith(".")
    ) {
      return "Invalid email format";
    }

    const [localPart, domain] = email.split("@");

    // Username validations
    if (localPart.length < 2) {
      return "Email username is too short";
    }

    if (/(.)\1{5,}/.test(localPart)) {
      return "Email appears to be invalid";
    }

    if (/(\.\.|__|--|\+\+)/.test(localPart)) {
      return "Email contains invalid characters";
    }

    // Disposable domains
    const invalidDomains = [
      "email.com",
      "example.com",
      "test.com",
      "domain.com",
      "mailinator.com",
      "tempmail.com",
      "guerrillamail.com",
      "10minutemail.com",
      "yopmail.com",
      "fakeemail.com",
      "temp-mail.org",
      "throwawayemail.com",
      "dispostable.com",
      "maildrop.cc"
    ];

    if (invalidDomains.includes(domain)) {
      return "Disposable or invalid email domains are not allowed";
    }

    // Provider typo detection
    const providers = [
      "gmail.com",
      "yahoo.com",
      "outlook.com",
      "hotmail.com",
      "icloud.com"
    ];

    for (const provider of providers) {
      const distance = levenshtein(domain, provider);

      if (distance > 0 && distance <= 2) {
        return `Did you mean ${localPart}@${provider}?`;
      }
    }

    // Validate TLD
    const validTlds = [
      "com",
      "in",
      "org",
      "net",
      "edu",
      "gov",
      "io",
      "ai",
      "co",
      "co.in"
    ];

    const domainParts = domain.split(".");
    const lastPart = domainParts[domainParts.length - 1];
    const lastTwoParts = domainParts.slice(-2).join(".");

    if (
      !validTlds.includes(lastPart) &&
      !validTlds.includes(lastTwoParts)
    ) {
      return "Please enter a valid domain extension";
    }

    return "";
  };
  const validateIfscFormat = (value) => {
    if (!value) return '';
    const ifscRegex = /^[A-Za-z]{4}0[A-Za-z0-9]{6}$/;
    if (!ifscRegex.test(value.toUpperCase())) {
      return "IFSC must be 11 characters, (e.g., SBIN0012345)";
    }
    return '';
  };

  const validateUpiFormat = (value) => {
    if (!value) return '';

    const upiRegex = /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/;
    if (!upiRegex.test(value)) {
      return "Invalid UPI ID (e.g., name@bank)";
    }

    const [localPart, domain] = value.split('@');
    if (localPart.length > 50) {
      return "UPI ID local part (before @) cannot exceed 50 characters";
    }
    if (domain.length > 20) {
      return "UPI ID domain (after @) cannot exceed 20 characters";
    }
    return '';
  };

  const validateField = (field, value) => {
    let error = "";
    switch (field) {
      case "account_holder": error = validateAccountHolder(value); break;
      case "email": error = validateEmailFormat(value); break;
      case "phone": error = validatePhone(value); break;
      case "bank_account": error = validateBankAccount(value); break;
      case "ifsc_code": error = validateIfscFormat(value); break;
      case "upi_id": error = validateUpiFormat(value); break;
      default: break;
    }
    setValidationErrors(prev => ({ ...prev, [field]: error }));
    return error === "";
  };

  const handleBeneficiaryChange = (field, value) => {
    setBeneficiaryForm(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  // ─────────────────────────────────────────────────────────
  // FRONTEND DUPLICATE CHECKS
  // ─────────────────────────────────────────────────────────

  const isFrontendDuplicateUpi = () => {
    const inputUpi = beneficiaryForm.upi_id.trim().toLowerCase();
    return withdrawalMethods.some(
      (m) => m.type === "upi" && m.account_detail?.toLowerCase() === inputUpi
    );
  };

  const isFrontendDuplicateBankAccount = () => {
    const inputBankAccount = beneficiaryForm.bank_account.replace(/\s/g, '').trim();
    if (!inputBankAccount) return false;

    const inputLast4 = inputBankAccount.slice(-4);
    return withdrawalMethods.some((m) => {
      if (m.type !== "bank") return false;
      const methodDetail = m.account_detail || "";
      const methodLast4 = methodDetail.slice(-4);
      const fullMatch = methodDetail === inputBankAccount;
      return fullMatch || (inputLast4 === methodLast4 && inputLast4.length === 4);
    });
  };

  // Lock body scroll when modals are open
  useEffect(() => {
    const isAnyModalOpen = showMethodModal || showWithdrawPopup || showMethodsPopup || showEmailSetupPopup || showEmailPopup || showOTPPopup || emailVerificationSuccess;

    if (isAnyModalOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Apply fixed positioning to body to prevent scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      // Return cleanup function
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [showMethodModal, showWithdrawPopup, showMethodsPopup, showEmailSetupPopup, showEmailPopup, showOTPPopup, emailVerificationSuccess]);

  // ---------- REFRESH USER DATA ON MOUNT ----------
  useEffect(() => {
    const refreshUserData = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data) {
          setLocalUserData(response.data);          // update local state
          if (updateUserData) {
            updateUserData(response.data);          // also update global context
          }
        }
      } catch (error) {
        console.error('Failed to refresh user data in Overview:', error);
      }
    };
    refreshUserData();
  }, []); // runs once on mount

  // Fetch wallet balance, contracts, and wallet status (depends on effectiveUser.id)
  useEffect(() => {
    const userId = effectiveUser?.id;
    if (!userId) return;

    fetchWalletBalance();
    fetchContracts();
    fetchWalletStatus();
    fetchWithdrawalMethods();
  }, [effectiveUser?.id]);

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const fetchWalletBalance = async () => {
    if (!effectiveUser?.id) return;
    try {
      setLoadingWallet(true);
      const response = await api.get(`/wallet/?user_id=${effectiveUser.id}`);
      if (response.data) {
        setWalletBalance(response.data.balance || 0);
      }
    } catch (err) {
      console.error("Error fetching wallet:", err);
      toast.error("Failed to load wallet balance", "Please refresh the page and try again.");
    } finally {
      setLoadingWallet(false);
    }
  };

  const fetchContracts = async () => {
    if (!effectiveUser?.id) return;
    try {
      setLoadingContracts(true);
      const response = await api.get(`/contracts/collaborator-contracts?user_id=${effectiveUser.id}`);
      const contracts = response.data || [];

      const inProgress = contracts.filter(c => c.status === "in_progress");
      const inReview = contracts.filter(c => c.status === "in_review");

      setWorkInProgressContracts(inProgress);
      setInReviewContracts(inReview);

    } catch (err) {
      console.error("Error fetching contracts:", err);
      toast.error("Failed to load contracts", "Please refresh the page and try again.");
    } finally {
      setLoadingContracts(false);
    }
  };

  const fetchWalletStatus = async () => {
    if (!effectiveUser?.id) return;
    try {
      setWalletStatus(prev => ({ ...prev, loading: true }));
      const response = await api.get(`/wallet/wallet-status?user_id=${effectiveUser.id}`);

      setWalletStatus({
        isReady: response.data.isReady ?? false,
        canWithdraw: response.data.canWithdraw ?? false,
        hasBeneficiary: response.data.hasBeneficiary ?? false,
        withdrawal_methods_count: response.data.withdrawal_methods_count ?? 0,
        status: response.data.status ?? null,
        message: response.data.message ?? null,
        loading: false,
        error: null
      });
    } catch (err) {
      console.error("Error fetching wallet status:", err);
      setWalletStatus(prev => ({
        ...prev,
        loading: false,
        error: err.response?.data?.detail || "Failed to load wallet status"
      }));
      toast.error("Failed to check wallet status", "Please refresh and try again.");
    }
  };

  const fetchWithdrawalMethods = async () => {
    try {
      const response = await api.get(`/wallet/withdrawal-methods?user_id=${effectiveUser.id}`);
      const methods = response.data.methods || [];
      setWithdrawalMethods(methods);

      const defaultMethod = methods.find(m => m.is_default);
      if (defaultMethod) {
        setSelectedMethod(defaultMethod);
      } else if (methods.length > 0) {
        setSelectedMethod(methods[0]);
      } else {
        setSelectedMethod(null);
      }
    } catch (err) {
      console.error("Error fetching withdrawal methods:", err);
      toast.error("Failed to load withdrawal methods", "Please refresh and try again.");
    }
  };

  const handleRemoveMethod = async (methodId) => {
    if (window.confirm("Are you sure you want to remove this withdrawal method?")) {
      try {
        await api.delete(`/wallet/withdrawal-method/${methodId}?user_id=${effectiveUser.id}`);
        toast.success("Method removed", "Your withdrawal method has been removed successfully.");
        await fetchWithdrawalMethods();
        await fetchWalletStatus();
      } catch (err) {
        console.error("Error removing method:", err);
        toast.error("Failed to remove method", "Please try again later.");
      }
    }
  };

  const handleSetDefaultMethod = async (methodId) => {
    try {
      await api.post(`/wallet/set-default-method/${methodId}?user_id=${effectiveUser.id}`);
      toast.success("Default method updated", "Your default withdrawal method has been updated.");
      await fetchWithdrawalMethods();
    } catch (err) {
      console.error("Error setting default method:", err);
      toast.error("Failed to update default method", "Please try again later.");
    }
  };

  // Register Beneficiary with Cashfree (frontend validation + duplicate check)
  const handleRegisterBeneficiary = async () => {
    let hasError = false;
    const fields = methodType === "bank"
      ? ['account_holder', 'bank_account', 'ifsc_code', 'email', 'phone']
      : ['account_holder', 'upi_id', 'email', 'phone'];

    for (const field of fields) {
      const value = beneficiaryForm[field];
      let error = "";
      if (field === 'account_holder') error = validateAccountHolder(value);
      else if (field === 'email') error = validateEmailFormat(value);
      else if (field === 'phone') error = validatePhone(value);
      else if (field === 'ifsc_code') error = validateIfscFormat(value);
      else if (field === 'upi_id') error = validateUpiFormat(value);
      else if (field === 'bank_account') error = validateBankAccount(value);

      if (error) {
        setValidationErrors(prev => ({ ...prev, [field]: error }));
        hasError = true;
      } else if (field === 'bank_account' && !value) {
        setValidationErrors(prev => ({ ...prev, [field]: "Bank account number required" }));
        hasError = true;
      } else if (field === 'account_holder' && !value) {
        setValidationErrors(prev => ({ ...prev, [field]: "Account holder name required" }));
        hasError = true;
      } else if (field === 'ifsc_code' && !value) {
        setValidationErrors(prev => ({ ...prev, [field]: "IFSC code required" }));
        hasError = true;
      } else if (field === 'upi_id' && !value) {
        setValidationErrors(prev => ({ ...prev, [field]: "UPI ID required" }));
        hasError = true;
      }
    }

    if (hasError) return;

    if (methodType === "upi" && isFrontendDuplicateUpi()) {
      toast.error("Duplicate UPI ID", "This UPI ID is already registered.");
      setBeneficiaryError("This UPI ID is already registered.");
      return;
    }

    if (methodType === "bank" && isFrontendDuplicateBankAccount()) {
      toast.error("Duplicate Bank Account", "This bank account is already registered.");
      setBeneficiaryError("This bank account is already registered.");
      return;
    }

    if (methodType === "bank") {
      if (!beneficiaryForm.account_holder.trim()) {
        setBeneficiaryError("Account holder name is required");
        toast.error("Account holder name required", "Please enter your full name as on bank account.");
        return;
      }
      if (!beneficiaryForm.bank_account.trim()) {
        setBeneficiaryError("Bank account number is required");
        toast.error("Bank account number required", "Please enter your bank account number.");
        return;
      }
      if (!beneficiaryForm.ifsc_code.trim()) {
        setBeneficiaryError("IFSC code is required");
        toast.error("IFSC code required", "Please enter your bank's IFSC code.");
        return;
      }
      if (beneficiaryForm.ifsc_code.replace(/\s/g, '').length !== 11) {
        setBeneficiaryError("IFSC code must be 11 characters");
        toast.error("Invalid IFSC code", "IFSC code must be exactly 11 characters.");
        return;
      }

      setRegisteringBeneficiary(true);
      setBeneficiaryError('');

      try {
        const response = await api.post('/wallet/register-bank-beneficiary', {
          user_id: effectiveUser.id,
          bank_account: beneficiaryForm.bank_account.replace(/\s/g, ''),
          ifsc_code: beneficiaryForm.ifsc_code.toUpperCase().replace(/\s/g, ''),
          account_holder: beneficiaryForm.account_holder,
          email: beneficiaryForm.email || effectiveUser.email,
          phone: beneficiaryForm.phone || effectiveUser.phone || ''
        });

        if (response.data.success) {
          toast.success("Bank account added", "Your bank account has been successfully registered.");
          setShowMethodModal(false);
          resetBeneficiaryForm();
          await fetchWithdrawalMethods();
          await fetchWalletStatus();
          toast.success("Ready to withdraw", "You can now withdraw funds from your wallet.");
        } else {
          toast.error("Registration failed", response.data.message || "Failed to add bank account");
          setBeneficiaryError(response.data.message || "Registration failed");
        }
      } catch (err) {
        console.error("Bank registration error:", err);
        const errorMsg = err.response?.data?.detail || "Failed to register bank account";
        toast.error("Bank registration failed", errorMsg);
        setBeneficiaryError(errorMsg);
      } finally {
        setRegisteringBeneficiary(false);
      }

    } else {
      if (!beneficiaryForm.account_holder.trim()) {
        setBeneficiaryError("Account holder name is required");
        toast.error("Account holder name required", "Please enter your full name.");
        return;
      }
      if (!beneficiaryForm.upi_id.trim()) {
        setBeneficiaryError("UPI ID is required");
        toast.error("UPI ID required", "Please enter your UPI ID.");
        return;
      }
      if (!beneficiaryForm.upi_id.includes('@')) {
        setBeneficiaryError("Please enter a valid UPI ID (e.g., name@bank)");
        toast.error("Invalid UPI ID", "Please enter a valid UPI ID (e.g., name@bank).");
        return;
      }

      setRegisteringBeneficiary(true);
      setBeneficiaryError('');

      try {
        const response = await api.post('/wallet/register-upi-beneficiary', {
          user_id: effectiveUser.id,
          upi_id: beneficiaryForm.upi_id,
          account_holder: beneficiaryForm.account_holder,
          email: beneficiaryForm.email || effectiveUser.email,
          phone: beneficiaryForm.phone || effectiveUser.phone || ''
        });

        if (response.data.success) {
          toast.success("UPI ID added", "Your UPI ID has been successfully registered.");
          setShowMethodModal(false);
          resetBeneficiaryForm();
          await fetchWithdrawalMethods();
          await fetchWalletStatus();
          toast.success("Ready to withdraw", "You can now withdraw funds from your wallet.");
        } else {
          toast.error("Registration failed", response.data.message || "Failed to add UPI ID");
          setBeneficiaryError(response.data.message || "Registration failed");
        }
      } catch (err) {
        console.error("UPI registration error:", err);
        const errorMsg = err.response?.data?.detail || "Failed to register UPI ID";
        toast.error("UPI registration failed", errorMsg);
        setBeneficiaryError(errorMsg);
      } finally {
        setRegisteringBeneficiary(false);
      }
    }
  };

  const resetBeneficiaryForm = () => {
    setBeneficiaryForm({
      bank_account: '',
      ifsc_code: '',
      account_holder: '',
      upi_id: '',
      email: '',
      phone: ''
    });
    setValidationErrors({
      account_holder: '', email: '', phone: '', bank_account: '', ifsc_code: '', upi_id: '',
    });
    setBeneficiaryError('');
  };

  // ========== EMAIL VERIFICATION FLOW (same as WithdrawFunds) ==========
  const isValidGmail = (email) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;
    return email.toLowerCase().split("@")[1] === "gmail.com";
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const startEmailVerificationFlow = () => {
    if (!hasEmail) {
      setShowEmailSetupPopup(true);
    } else {
      setEmail(effectiveUser.email);
      setShowEmailPopup(true);
    }
  };

  const handleSaveEmail = async () => {
    if (!isValidEmail(newEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setIsSavingEmail(true);
    try {
      const response = await api.put(`/collaborator/edit/${effectiveUser.id}`, {
        email: newEmail,
      });
      if (response.data.status === "success") {
        setEmail(newEmail);
        setShowEmailSetupPopup(false);
        toast.success("Email added successfully!");
        setShowEmailPopup(true);
      }
    } catch (error) {
      console.error("Error saving email:", error);
      toast.error(error.response?.data?.detail || "Failed to save email");
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleEmailSubmit = async () => {
    const registeredEmail = effectiveUser?.email;
    if (!registeredEmail) {
      toast.error("No registered email found. Please add an email first.");
      setShowEmailSetupPopup(true);
      return;
    }
    setEmail(registeredEmail);
    if (!isValidGmail(registeredEmail)) {
      toast.error("Your registered email must be a Gmail address");
      return;
    }
    if (isVerifying) return;
    setIsVerifying(true);
    try {
      const response = await api.post("/verification/email/send-otp", {
        email: registeredEmail,
      });
      if (response.data.status === "success") {
        setOtpToken(response.data.otp_token);
        setCooldownToken(response.data.cooldown_token);
        setShowEmailPopup(false);
        setShowOTPPopup(true);
        toast.success("OTP sent to your email");
        setResendTime(45);
        setOtp(["", "", "", "", "", ""]);
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      if (error.response?.status === 429) {
        const errorMessage = error.response?.data?.detail || "Too many requests. Please wait before trying again.";
        toast.error(errorMessage);
        const match = errorMessage.match(/(\d+)\s*seconds?/);
        if (match && match[1]) {
          const remainingSeconds = parseInt(match[1]);
          if (remainingSeconds > 0 && remainingSeconds <= 60)
            setResendTime(remainingSeconds);
        }
      } else if (error.response?.status === 400) {
        toast.error(error.response?.data?.detail || "Invalid email address");
      } else if (error.response?.status === 404) {
        toast.error("Email not found. Please sign up first.");
      } else {
        toast.error(error.response?.data?.detail || "Failed to send OTP. Please try again.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyOTP = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast.error("Please enter complete 6-digit OTP");
      return;
    }
    if (!otpToken) {
      toast.error("Invalid session. Please request a new OTP.");
      return;
    }
    setIsVerifying(true);
    try {
      const response = await api.post(
        `/verification/email/verify-otp?otp_token=${otpToken}`,
        { email: email, otp_code: otpString }
      );
      if (response.data.status === "success") {
        setShowOTPPopup(false);
        setEmailVerificationSuccess(true);
        setOtp(["", "", "", "", "", ""]);
        setResendTime(45);
        setOtpToken("");
        setCooldownToken("");
        toast.success("Email verified successfully!");
        setTimeout(() => {
          executeWithdrawal();
        }, 1500);
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error(error.response?.data?.detail || "Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (isVerifying) return;
    if (resendTime > 0) {
      toast.error(`Please wait ${resendTime} seconds before requesting another OTP`);
      return;
    }
    setIsVerifying(true);
    try {
      const registeredEmail = effectiveUser?.email;
      if (!registeredEmail) {
        toast.error("No registered email found");
        setIsVerifying(false);
        return;
      }
      const response = await api.post(
        "/verification/email/send-otp",
        { email: registeredEmail },
        {
          headers: cooldownToken ? { "X-Cooldown-Token": cooldownToken } : {},
        }
      );
      if (response.data.status === "success") {
        setOtpToken(response.data.otp_token);
        if (response.data.cooldown_token)
          setCooldownToken(response.data.cooldown_token);
        toast.success("OTP resent to your email!");
        setResendTime(45);
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => document.getElementById("otp-0")?.focus(), 100);
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      if (error.response?.status === 429) {
        const errorMessage = error.response?.data?.detail || "Please wait before requesting another OTP";
        toast.error(errorMessage);
        const match = errorMessage.match(/(\d+)\s*seconds?/);
        if (match && match[1]) {
          const remainingSeconds = parseInt(match[1]);
          if (remainingSeconds > 0 && remainingSeconds <= 60)
            setResendTime(remainingSeconds);
        }
      } else {
        toast.error(error.response?.data?.detail || "Failed to resend OTP. Please try again.");
      }
    } finally {
      setTimeout(() => setIsVerifying(false), 500);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5)
        document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  // ========== WITHDRAWAL FLOW WITH EMAIL VERIFICATION ==========
  const handleWithdrawClick = () => {
    if (!withdrawAmount) {
      setWithdrawError("Enter withdrawal amount");
      toast.error("Invalid amount", "Please enter a withdrawal amount.");
      return;
    }

    if (/^0\d+/.test(withdrawAmount)) {
      setWithdrawError("Amount cannot start with zero");
      toast.error("Invalid amount", "Amount cannot start with zero.");
      return;
    }

    if (Number(withdrawAmount) < 1) {
      setWithdrawError("Minimum withdrawal amount is ₹1");
      toast.error("Invalid amount", "Minimum withdrawal amount is ₹1.");
      return;
    }

    if (Number(withdrawAmount) > walletBalance) {
      setWithdrawError(
        `Entered amount exceeds available balance (₹${formatIndianRupee(walletBalance)})`
      );

      toast.error(
        "Insufficient balance",
        `Entered amount exceeds your available balance of ₹${formatIndianRupee(walletBalance)}`
      );

      return;
    }

    if (!selectedMethod) {
      setWithdrawError("Please select a withdrawal method");
      toast.error("No withdrawal method selected", "Please select a withdrawal method to continue.");
      return;
    }

    if (!hasPhone) {
      toast.error("Phone number required", "Please update your profile with a valid phone number.");
      return;
    }

    // Start email verification flow
    startEmailVerificationFlow();
  };

  const executeWithdrawal = async () => {
    setIsProcessing(true);
    try {
      const response = await api.post('/wallet/withdraw', {
        user_id: effectiveUser.id,
        amount: Number(withdrawAmount),
        method_id: selectedMethod.id
      });

      if (response.data.success && response.data.status === 'success') {
        setShowWithdrawPopup(false);
        setShowSuccessPopup(true);
        setWalletBalance(response.data.new_balance);
        toast.success("Withdrawal initiated", `₹${formatIndianRupee(withdrawAmount)} will be sent to your ${response.data.method_type}.`);
      } else {
        toast.error("Withdrawal failed", response.data.message || "Please try again.");
      }
    } catch (err) {
      console.error("Withdrawal error:", err);
      const errorDetail = err.response?.data?.detail || "Withdrawal failed";
      toast.error("Withdrawal failed", errorDetail);
    } finally {
      setIsProcessing(false);
    }
  };

  const validateWithdrawAmount = (value) => {
    if (value === '') {
      setWithdrawError('');
      return true;
    }

    const numValue = Number(value);

    if (isNaN(numValue)) {
      setWithdrawError('Please enter a valid amount');
      return false;
    }

    // Minimum ₹1
    if (numValue < 1) {
      setWithdrawError('Minimum withdrawal amount is ₹1');
      return false;
    }

    // Maximum ₹100000
    if (numValue > 100000) {
      setWithdrawError('Maximum withdrawal amount is ₹100000');
      return false;
    }

    if (numValue > walletBalance) {
      setWithdrawError(
        `Entered amount exceeds available balance (₹${formatIndianRupee(walletBalance)})`
      );
      return false;
    }

    setWithdrawError('');
    return true;
  };
  const handleWithdrawAmountChange = (e) => {
    let value = e.target.value;

    // Allow only numbers and decimal point
    value = value.replace(/[^0-9.]/g, "");

    // Prevent multiple decimal points
    const parts = value.split(".");
    if (parts.length > 2) return;

    // Allow max 2 digits after decimal
    if (parts[1] && parts[1].length > 2) return;

    // Prevent leading zero like 0123
    if (/^0\d+/.test(value)) return;

    setWithdrawAmount(value);
    validateWithdrawAmount(value);
  };

  const getCurrentItems = () => {
    const contracts = activeTab === 'work-in-progress' ? workInProgressContracts : inReviewContracts;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return contracts.slice(indexOfFirstItem, indexOfLastItem);
  };

  const getTotalPages = () => {
    const contracts = activeTab === 'work-in-progress' ? workInProgressContracts : inReviewContracts;
    return Math.ceil(contracts.length / itemsPerPage);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatIndianRupee = (amount) => {
    if (!amount && amount !== 0) return "0";
    const num = Number(amount);
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(num);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_review':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalWorkInProgress = workInProgressContracts.reduce((sum, contract) => sum + (contract.budget || 0), 0);
  const totalInReview = inReviewContracts.reduce((sum, contract) => sum + (contract.budget || 0), 0);
  const availableBalance = walletBalance;

  const renderTabContent = (label, price) => (
    <>
      <div className="h-[16px] opacity-100">
        <p className="font-outfit font-normal text-[12px] md:text-[14px] leading-[100%] whitespace-nowrap">
          {label}
        </p>
      </div>
      <div className="h-[16px] opacity-100 mt-1">
        <p className="font-outfit font-normal text-[12px] md:text-[14px] leading-[100%] whitespace-nowrap">
          ₹{formatIndianRupee(price)}
        </p>
      </div>
    </>
  );

  const renderWalletStatusBanner = () => {
    if (walletStatus.loading) {
      return (
        <div className="w-full mb-4">
          <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-lg shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 text-sm">Checking wallet status...</p>
            </div>
          </div>
        </div>
      );
    }

    if (walletStatus.error) {
      return (
        <div className="w-full mb-4">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-red-700 text-sm">{walletStatus.error}</p>
              <button onClick={fetchWalletStatus} className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200">Retry</button>
            </div>
          </div>
        </div>
      );
    }

    if (!walletStatus.hasBeneficiary) {
      return (
        <div className="w-full mb-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-md">
            <div className="flex flex-col gap-2">
              <div>
                <h3 className="text-yellow-800 font-semibold text-sm md:text-base">
                  ⚠️ No Withdrawal Method Added
                </h3>
                <p className="text-yellow-700 text-xs md:text-sm">
                  Please add a bank account or UPI ID to enable withdrawals via Cashfree Payouts.
                </p>
              </div>
              <button
                onClick={() => setShowMethodModal(true)}
                className="mt-2 px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors self-start"
              >
                + Add Withdrawal Method
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (!walletStatus.isReady || !walletStatus.canWithdraw) {
      return (
        <div className="w-full mb-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-md">
            <div className="flex flex-col gap-2">
              <div>
                <h3 className="text-yellow-800 font-semibold text-sm md:text-base">
                  ⚠️ Wallet Not Ready for Withdrawal
                </h3>
                <p className="text-yellow-700 text-xs md:text-sm">
                  {walletStatus.message || "Please contact support to enable withdrawals via Cashfree Payouts."}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full mb-4">
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-green-700 text-xs md:text-sm font-medium">
              Ready to withdraw funds via Cashfree Payouts
            </p>
            <button
              onClick={() => setShowMethodModal(true)}
              className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
            >
              + Add Method
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loadingWallet) {
    return (
      <div className="font-['Montserrat'] flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-[#51218F] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col overflow-x-hidden relative">
      <section className="w-full flex flex-col items-center justify-start px-4 relative min-w-0 pb-20">
        {/* Background Image Container */}
        <div
          className="absolute top-[-104px] left-0 w-full h-[582px] z-0"
          style={{
            backgroundImage: `url(${HomeBg})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="absolute inset-0 bg-white md:bg-black opacity-40 md:opacity-20" />
        </div>

        <ColHeader />

        {/* Back Button */}
        <div className="absolute top-[100px] left-4 md:top-[140px] md:left-1/2 md:transform md:-translate-x-1/2 md:w-[1215px] z-20">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/40 transition-all group"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-[#51218F] to-[#2a0e4a] group-hover:from-[#3d1768] group-hover:to-[#1a0830] transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </div>
            <span className="font-medium text-sm md:text-base text-white">Back</span>
          </button>
        </div>

        {/* Main Content Container - FIXED */}
        <div
          className="relative w-full md:w-[90%] lg:w-[95%] xl:w-[1215px]  mt-[120px] md:mt-[197px] mx-auto 
                     bg-white md:shadow-[0px_4px_4px_0px_#00000040] 
                     rounded-[16px] md:rounded-none pb-10 md:pb-16"
          style={{ minHeight: 'auto' }}
        >

          {/* Header Section */}
          <div className="px-4 md:px-[37px] pt-6 md:pt-[21px]">
            <h1 className="font-outfit font-normal text-[28px] md:text-[40px] leading-[100%] text-black">
              Overview
            </h1>

            {activeTab === 'available' && (
              <p className="font-outfit font-normal text-[14px] md:text-[16px] leading-[130%] text-black mt-2 md:mt-3">
                Transfer your wallet balance securely and track withdrawals in real time via Cashfree Payouts.
              </p>
            )}
          </div>

          {/* Wallet Status Banner (Cashfree) */}
          <div className="px-4 md:px-[37px] mt-4 md:mt-6">
            {renderWalletStatusBanner()}
          </div>

          {/* ✅ SINGLE HELPER CARD – missing phone and/or email (now using fresh localUserData) */}
          {effectiveUser && (!hasPhone || !hasEmail) && (
            <div className="px-4 md:px-[37px] mt-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="text-yellow-600 text-lg">⚠️</span>
                  <div className="flex-1">
                    <p className="text-yellow-800 text-sm font-medium">Missing contact information</p>
                    <div className="mt-2 space-y-1">
                      {!hasPhone && (
                        <p className="text-yellow-700 text-xs flex items-center gap-1">
                          <span>📞</span> Phone number missing – please add in your profile.
                        </p>
                      )}
                      {!hasEmail && (
                        <p className="text-yellow-700 text-xs flex items-center gap-1">
                          <span>✉️</span> Email address missing – please add in your profile.
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => navigate("/ColabProfile")}
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#51218F] to-[#2a0e4a] text-white rounded-lg text-xs font-semibold shadow-md hover:from-[#3d1768] hover:to-[#1a0830] hover:shadow-lg transition-all duration-300"
                    >
                      Update Profile
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Withdrawal Methods Button */}
          {withdrawalMethods.length > 0 && (
            <div className="px-4 md:px-[37px] mt-4">
              <button
                onClick={() => setShowMethodsPopup(true)}
                className="w-full p-4 rounded-lg border-2 border-[#51218F] bg-gradient-to-r from-[#51218F]/10 to-transparent hover:from-[#51218F]/20 transition-all text-left flex items-center justify-between group"
              >
                <div>
                  <h3 className="font-semibold text-sm md:text-base text-[#51218F]">Your Withdrawal Methods</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {withdrawalMethods.length} method(s) added • Click to view & manage
                  </p>
                </div>
                <svg className="w-5 h-5 text-[#51218F] group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* TABS SECTION */}
          <div className="px-4 md:px-[37px] mt-4 md:mt-8">
            {/* Mobile Tabs */}
            <div className="block md:hidden">
              <div className="w-full h-[60px] rounded-[12px] bg-[#D9D9D980] border-2 border-black flex items-center p-1">
                <button
                  onClick={() => setActiveTab('work-in-progress')}
                  className={`flex-1 h-full rounded-[12px] flex flex-col items-center justify-center transition-all duration-200
                    ${activeTab === 'work-in-progress' 
                      ? 'bg-white border-2 border-black shadow-md' 
                      : 'bg-transparent text-black/70'}`}
                >
                  {renderTabContent('Work in Progress', totalWorkInProgress)}
                </button>

                <button
                  onClick={() => setActiveTab('in-review')}
                  className={`flex-1 h-full rounded-[12px] flex flex-col items-center justify-center transition-all duration-200
                    ${activeTab === 'in-review' 
                      ? 'bg-white border-2 border-black shadow-md' 
                      : 'bg-transparent text-black/70'}`}
                >
                  {renderTabContent('In review', totalInReview)}
                </button>

                <button
                  onClick={() => setActiveTab('available')}
                  className={`flex-1 h-full rounded-[12px] flex flex-col items-center justify-center transition-all duration-200
                    ${activeTab === 'available' 
                      ? 'bg-white border-2 border-black shadow-md' 
                      : 'bg-transparent text-black/70'}`}
                >
                  {renderTabContent('Available', availableBalance)}
                </button>
              </div>
            </div>

            {/* Desktop Tabs */}
            <div className="hidden md:block w-full h-[101px] rounded-[16px] bg-[#D9D9D980] border-2 border-black relative">
              <button
                onClick={() => setActiveTab('work-in-progress')}
                className={`absolute w-[151px] h-[77px] left-[14px] top-1/2 transform -translate-y-1/2
                          rounded-[16px] flex flex-col items-center justify-center transition-all duration-200 cursor-pointer
                          ${activeTab === 'work-in-progress' 
                            ? 'bg-white shadow-md text-black border-2 border-black' 
                            : 'bg-transparent text-black hover:bg-white/40'}`}
              >
                {renderTabContent('Work in Progress', totalWorkInProgress)}
              </button>

              <button
                onClick={() => setActiveTab('in-review')}
                className={`absolute w-[151px] h-[77px] left-[180px] top-1/2 transform -translate-y-1/2
                          rounded-[16px] flex flex-col items-center justify-center transition-all duration-200 cursor-pointer
                          ${activeTab === 'in-review' 
                            ? 'bg-white shadow-md text-black border-2 border-black' 
                            : 'bg-transparent text-black hover:bg-white/40'}`}
              >
                {renderTabContent('In review', totalInReview)}
              </button>

              <button
                onClick={() => setActiveTab('available')}
                className={`absolute w-[151px] h-[77px] left-[346px] top-1/2 transform -translate-y-1/2
                          rounded-[16px] flex flex-col items-center justify-center transition-all duration-200 cursor-pointer
                          ${activeTab === 'available' 
                            ? 'bg-white shadow-md text-black border-2 border-black' 
                            : 'bg-transparent text-black hover:bg-white/40'}`}
              >
                {renderTabContent('Available', availableBalance)}
              </button>
            </div>
          </div>

          {/* CONTENT DISPLAY AREA */}
          <div className="px-4 md:px-[37px] mt-6 md:mt-8">
            {activeTab === 'available' ? (
              <div
                className="w-full rounded-[16px] p-6 md:p-8"
                style={{
                  background: 'linear-gradient(90deg, rgba(48, 1, 87, 0.75) 0%, rgba(104, 2, 189, 0.75) 100%)',
                }}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-8">
                  <div className="flex flex-col">
                    <p className="font-montserrat font-semibold text-[32px] md:text-[48px] leading-[100%] text-white">
                      ₹{formatIndianRupee(availableBalance)}
                    </p>
                    <button
                      onClick={() => navigate("/transaction")}
                      className="font-montserrat font-medium text-[14px] md:text-[20px] leading-[100%] text-white mt-4 md:mt-6 text-left hover:underline"
                    >
                      View All Transactions
                    </button>
                  </div>
                  <button
                    onClick={() => setShowWithdrawPopup(true)}
                    disabled={!walletStatus.canWithdraw || !hasPhone || !hasEmail}
                    className={`w-full md:w-[180px] h-[44px] md:h-[50px] rounded-[6px] 
                             font-montserrat font-medium text-[14px] md:text-[16px] text-white
                             transition-opacity
                             ${(walletStatus.canWithdraw && hasPhone && hasEmail)
                               ? 'bg-gradient-to-r from-[#51218F] to-black hover:opacity-90' 
                               : 'bg-gray-400 cursor-not-allowed'}`}
                  >
                    Withdraw
                  </button>
                </div>
                {(!walletStatus.canWithdraw || !hasPhone || !hasEmail) && !walletStatus.loading && !walletStatus.error && (
                  <p className="text-yellow-200 text-xs mt-3">
                    {!hasPhone || !hasEmail
                      ? 'Please update your contact information to withdraw'
                      : !walletStatus.hasBeneficiary 
                        ? 'Click "Add Withdrawal Method" above to enable withdrawals'
                        : 'Contact support to enable withdrawals via Cashfree Payouts'}
                  </p>
                )}
              </div>
            ) : (
              <div className="w-full">
                {loadingContracts ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="w-12 h-12 border-4 border-[#51218F] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <>
                    {(() => {
                      const contracts = activeTab === 'work-in-progress' ? workInProgressContracts : inReviewContracts;
                      const currentItems = getCurrentItems();
                      const totalPages = getTotalPages();

                      if (contracts.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-[180px] md:w-[295px] h-auto mb-6 md:mb-8">
                              <img
                                src={Default}
                                alt="No items"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <p className="font-outfit font-normal text-center text-[14px] md:text-[16px] text-black">
                              {activeTab === 'work-in-progress' 
                                ? "There is no Work in progress" 
                                : "There are no contracts in review"}
                            </p>
                          </div>
                        );
                      }

                      return (
                        <>
                          {/* Table View - Mobile Optimized with Enhanced Card Visibility */}
                          <div className="overflow-x-auto">
                            <div className="min-w-full md:min-w-0">
                              {/* Mobile Cards View */}
                              <div className="block md:hidden space-y-4">
                                {currentItems.map((contract, index) => (
                                  <div
                                    key={contract.id}
                                    className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-xl"
                                    style={{
                                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)'
                                    }}
                                  >
                                    <div className="bg-gradient-to-r from-[#51218F] to-[#7B2FBF] px-4 py-3">
                                      <div className="flex justify-between items-start">
                                        <h3 className="font-semibold text-white text-sm flex-1 pr-2 line-clamp-2">
                                          {contract.job_title || "Untitled Project"}
                                        </h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium shadow-sm ${
                                          contract.status === 'in_progress' 
                                            ? 'bg-yellow-400 text-yellow-900' 
                                            : 'bg-blue-400 text-blue-900'
                                        }`}>
                                          {contract.status === 'in_progress' ? 'In Progress' : 'In Review'}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="px-4 py-3 space-y-3 bg-white">
                                      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                        <span className="text-gray-500 text-sm font-medium">Budget</span>
                                        <span className="font-bold text-gray-900 text-lg">₹{formatIndianRupee(contract.budget || 0)}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-gray-500 text-sm font-medium">Start Date</span>
                                        <span className="text-gray-700 text-sm">{formatDate(contract.start_date)}</span>
                                      </div>
                                    </div>
                                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                                      <button
                                        onClick={() => navigate(`/all-contacts`)}
                                        className="w-full py-2.5 bg-gradient-to-r from-[#51218F] to-black text-white rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90 hover:shadow-md"
                                      >
                                        View Details →
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Desktop Table View */}
                              <div className="hidden md:block">
                                <table className="w-full border-collapse">
                                  <thead>
                                    <tr className="bg-gradient-to-r from-[#51218F] to-black text-white">
                                      <th className="px-4 py-3 text-left text-sm font-semibold">Job Title</th>
                                      <th className="px-4 py-3 text-left text-sm font-semibold">Budget</th>
                                      <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                                      <th className="px-4 py-3 text-left text-sm font-semibold">Start Date</th>
                                      <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {currentItems.map((contract) => (
                                      <tr key={contract.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                          {contract.job_title || "Untitled Project"}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                          ₹{formatIndianRupee(contract.budget || 0)}
                                        </td>
                                        <td className="px-4 py-3">
                                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(contract.status)}`}>
                                            {contract.status === 'in_progress' ? 'In Progress' : 'In Review'}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                          {formatDate(contract.start_date)}
                                        </td>
                                        <td className="px-4 py-3">
                                          <button
                                            onClick={() => navigate(`/all-contacts`)}
                                            className="text-[#51218F] hover:text-black text-sm font-medium transition-colors"
                                          >
                                            View Details
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>

                          {/* Pagination */}
                          {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
                              <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 rounded-md text-sm transition-colors
                                  ${currentPage === 1 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-[#51218F] hover:text-white'}`}
                              >
                                Previous
                              </button>

                              {[...Array(totalPages)].map((_, index) => {
                                const pageNumber = index + 1;
                                if (
                                  pageNumber === 1 ||
                                  pageNumber === totalPages ||
                                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                ) {
                                  return (
                                    <button
                                      key={pageNumber}
                                      onClick={() => handlePageChange(pageNumber)}
                                      className={`w-8 h-8 rounded-md text-sm transition-colors
                                        ${currentPage === pageNumber
                                          ? 'bg-[#51218F] text-white'
                                          : 'bg-gray-200 text-gray-700 hover:bg-[#51218F] hover:text-white'}`}
                                    >
                                      {pageNumber}
                                    </button>
                                  );
                                }
                                if (
                                  (pageNumber === 2 && currentPage > 3) ||
                                  (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
                                ) {
                                  return <span key={pageNumber} className="px-1">...</span>;
                                }
                                return null;
                              })}

                              <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1 rounded-md text-sm transition-colors
                                  ${currentPage === totalPages 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-[#51218F] hover:text-white'}`}
                              >
                                Next
                              </button>
                            </div>
                          )}

                          <div className="text-center text-sm text-gray-500 mt-4">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, contracts.length)} of {contracts.length} contracts
                          </div>
                        </>
                      );
                    })()}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Withdrawal Methods Popup */}
        {showMethodsPopup && (
          <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center px-4">
            <div className="relative w-full max-w-[500px] max-h-[90vh] bg-white rounded-[20px] flex flex-col overflow-hidden">
              <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
                <button
                  onClick={() => setShowMethodsPopup(false)}
                  className="w-8 h-8 rounded-full bg-[#51218F] flex items-center justify-center hover:bg-gradient-to-r hover:from-[#51218F] hover:to-black transition-all flex-shrink-0"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M20 12H4M4 12L10 6M4 12L10 18" stroke="white" strokeWidth="2" /></svg>
                </button>
                <h2 className="text-lg md:text-2xl font-bold" style={{ fontFamily: "Trochut" }}>Withdrawal Methods</h2>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-0">
                {withdrawalMethods.map((method) => (
                  <div key={method.id} className={`p-3 md:p-4 rounded-xl border-2 transition-all ${selectedMethod?.id === method.id ? 'border-[#51218F] bg-purple-50' : 'border-gray-200'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div onClick={() => { setSelectedMethod(method); setShowMethodsPopup(false); }} className="flex-1 cursor-pointer min-w-0">
                        <p className="font-medium text-sm">{method.type === 'bank' ? '🏦 Bank Account' : '📱 UPI ID'}</p>
                        <p className="text-xs text-gray-600 mt-0.5 truncate">{method.account_holder} • {method.account_detail}</p>
                        {method.is_default && <span className="inline-block mt-1 text-green-600 text-xs bg-green-50 px-2 py-0.5 rounded-full">Default</span>}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {!method.is_default && <button onClick={() => handleSetDefaultMethod(method.id)} className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors">Set Default</button>}
                        <button onClick={() => handleRemoveMethod(method.id)} className="text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex-shrink-0">
                <button onClick={() => { setShowMethodsPopup(false); setShowMethodModal(true); }} className="w-full h-11 rounded-xl bg-gradient-to-r from-[#51218F] to-black text-white font-medium hover:opacity-90 transition-all text-sm">+ Add New Method</button>
              </div>
            </div>
          </div>
        )}

        {/* Withdrawal Method Modal */}
        {showMethodModal && (
          <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center p-4">
            <div className="relative w-full max-w-[450px] max-h-[90vh] bg-white rounded-[20px] flex flex-col overflow-hidden">
              <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
                <button
                  onClick={() => {
                    setShowMethodModal(false);
                    resetBeneficiaryForm();
                  }}
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-[#51218F] to-[#2a0e4a] hover:from-[#3d1768] hover:to-[#1a0830] flex items-center justify-center transition-all shadow-md flex-shrink-0"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 12H5M12 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <h2 className="text-lg md:text-xl font-bold" style={{ fontFamily: "Trochut" }}>Add Withdrawal Method</h2>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
                <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-xl">
                  <button onClick={() => { setMethodType("bank"); resetBeneficiaryForm(); }} className={`flex-1 py-1.5 text-xs md:text-sm rounded-lg transition-all ${methodType === "bank" ? "bg-white shadow-md text-[#51218F] font-semibold" : "text-gray-600"}`}>🏦 Bank Account</button>
                  <button onClick={() => { setMethodType("upi"); resetBeneficiaryForm(); }} className={`flex-1 py-1.5 text-xs md:text-sm rounded-lg transition-all ${methodType === "upi" ? "bg-white shadow-md text-[#51218F] font-semibold" : "text-gray-600"}`}>📱 UPI ID</button>
                </div>

                <div className="space-y-4">
                  {methodType === "bank" ? (
                    <>
                      <div>
                        <label className="block text-gray-700 text-xs font-medium mb-1">Account Holder Name <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={beneficiaryForm.account_holder}
                          onChange={(e) => handleBeneficiaryChange('account_holder', e.target.value)}
                          placeholder="Full name as on bank account"
                          maxLength="50"
                          style={inputStyle}
                        />
                        <div style={helperTextStyle}>
                          <span className={`text-[10px] ${beneficiaryForm.account_holder.length > 50 ? 'text-red-500' : 'text-gray-400'}`}>
                            {getCharCount(beneficiaryForm.account_holder, 50)}
                          </span>
                        </div>
                        {validationErrors.account_holder && <p className="text-xs text-red-500 mt-1">{validationErrors.account_holder}</p>}
                      </div>
                      <div>
                        <label className="block text-gray-700 text-xs font-medium mb-1">Bank Account Number <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={beneficiaryForm.bank_account}
                          onChange={(e) => {
                            // Remove all whitespace
                            const valueWithoutSpaces = e.target.value.replace(/\s/g, '');
                            handleBeneficiaryChange('bank_account', valueWithoutSpaces);
                          }}
                          placeholder="Enter bank account number (no spaces)"
                          maxLength="20"
                          style={inputStyle}
                        />
                        <div style={helperTextStyle}>
                          <span className={`text-[10px] ${beneficiaryForm.bank_account.replace(/\s/g, '').length > 20 || (beneficiaryForm.bank_account.replace(/\s/g, '').length > 0 && beneficiaryForm.bank_account.replace(/\s/g, '').length < 9) ? 'text-red-500' : 'text-gray-400'}`}>
                            {getBankAccountDigitCount(beneficiaryForm.bank_account)}
                          </span>
                        </div>
                        {validationErrors.bank_account && <p className="text-xs text-red-500 mt-1">{validationErrors.bank_account}</p>}
                      </div>
                      <div>
                        <label className="block text-gray-700 text-xs font-medium mb-1">IFSC Code <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={beneficiaryForm.ifsc_code}
                          onChange={(e) => handleBeneficiaryChange('ifsc_code', e.target.value.toUpperCase())}
                          placeholder="e.g., SBIN0001234"
                          style={inputStyle}
                        />
                        <div style={helperTextStyle}>
                          <span className={`text-[10px] ${beneficiaryForm.ifsc_code.length !== 11 && beneficiaryForm.ifsc_code.length > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                            {getCharCount(beneficiaryForm.ifsc_code, 11)}
                          </span>
                        </div>
                        {validationErrors.ifsc_code && <p className="text-xs text-red-500 mt-1">{validationErrors.ifsc_code}</p>}
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-gray-700 text-xs font-medium mb-1">Account Holder Name <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={beneficiaryForm.account_holder}
                          onChange={(e) => handleBeneficiaryChange('account_holder', e.target.value)}
                          placeholder="Full name"
                          maxLength="50"
                          style={inputStyle}
                        />
                        <div style={helperTextStyle}>
                          <span className={`text-[10px] ${beneficiaryForm.account_holder.length > 50 ? 'text-red-500' : 'text-gray-400'}`}>
                            {getCharCount(beneficiaryForm.account_holder, 50)}
                          </span>
                        </div>
                        {validationErrors.account_holder && <p className="text-xs text-red-500 mt-1">{validationErrors.account_holder}</p>}
                      </div>
                      <div>
                        <label className="block text-gray-700 text-xs font-medium mb-1">UPI ID <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={beneficiaryForm.upi_id}
                          onChange={(e) => handleBeneficiaryChange('upi_id', e.target.value.toLowerCase())}
                          placeholder="e.g., username@okhdfcbank"
                          style={inputStyle}
                        />
                        <div style={helperTextStyle}>
                          <span className="text-gray-400 text-[10px]">
                            {beneficiaryForm.upi_id && beneficiaryForm.upi_id.includes('@') ? (
                              <>
                                {beneficiaryForm.upi_id.split('@')[0]?.length || 0}/50 •
                                {beneficiaryForm.upi_id.split('@')[1]?.length || 0}/20
                              </>
                            ) : (
                              '0/50 • 0/20'
                            )}
                          </span>
                        </div>
                        {validationErrors.upi_id && <p className="text-xs text-red-500 mt-1">{validationErrors.upi_id}</p>}
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-gray-700 text-xs font-medium mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      value={beneficiaryForm.email}
                      onChange={(e) => handleBeneficiaryChange('email', e.target.value)}
                      placeholder={effectiveUser?.email || "your@email.com"}
                      style={inputStyle}
                    />
                    {validationErrors.email && <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-gray-700 text-xs font-medium mb-1">Phone (Optional)</label>
                    <input
                      type="tel"
                      value={beneficiaryForm.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        handleBeneficiaryChange('phone', value);
                      }}
                      placeholder="9999999999"
                      style={inputStyle}
                    />
                    <div style={helperTextStyle}>
                      <span className={`text-[10px] ${beneficiaryForm.phone.replace(/\D/g, '').length !== 10 && beneficiaryForm.phone.replace(/\D/g, '').length > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                        {getPhoneDigitCount(beneficiaryForm.phone)}
                      </span>
                    </div>
                    {validationErrors.phone && <p className="text-xs text-red-500 mt-1">{validationErrors.phone}</p>}
                  </div>

                  {beneficiaryError && <div className="bg-red-50 border border-red-200 rounded-xl p-2"><p className="text-red-600 text-xs">{beneficiaryError}</p></div>}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-2">
                    <p className="text-blue-800 text-xs">🔒 Your {methodType === "bank" ? "bank details" : "UPI ID"} are securely stored with Cashfree. Funds will be transferred securely.</p>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex-shrink-0 space-y-3">
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowMethodModal(false);
                      resetBeneficiaryForm();
                    }}
                    className="flex-1 h-10 rounded-xl bg-white text-gray-700 !border-2 !border-[#B8C0CC] hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button onClick={handleRegisterBeneficiary} disabled={registeringBeneficiary} className={`flex-1 h-10 rounded-xl text-white font-medium transition-all text-sm ${registeringBeneficiary ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#51218F] to-black hover:opacity-90'}`}>
                    {registeringBeneficiary ? <div className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Registering...</div> : 'Add Method'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center">This will register your {methodType === "bank" ? "bank account" : "UPI ID"} with Cashfree</p>
              </div>
            </div>
          </div>
        )}

        {/* Withdraw Popup */}
        {showWithdrawPopup && (
          <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center px-4">
            <div className="relative w-full max-w-[450px] max-h-[90vh] bg-white rounded-[20px] flex flex-col overflow-hidden">
              <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
                <button onClick={() => { setShowWithdrawPopup(false); setWithdrawAmount(''); setWithdrawError(''); }} className="w-8 h-8 rounded-full bg-[#51218F] flex items-center justify-center hover:bg-gradient-to-r hover:from-[#51218F] hover:to-black transition-all flex-shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M20 12H4M4 12L10 6M4 12L10 18" stroke="white" strokeWidth="2" /></svg>
                </button>
                <h2 className="text-lg md:text-2xl font-bold" style={{ fontFamily: "Trochut" }}>Withdraw Funds</h2>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0 space-y-4">
                {withdrawalMethods.length > 0 && (
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Select Withdrawal Method <span className="text-red-500">*</span></label>
                    <div className="space-y-2">
                      {withdrawalMethods.map((method) => (
                        <div key={method.id} className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${selectedMethod?.id === method.id ? 'border-[#51218F] bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setSelectedMethod(method)}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full border-2 ${selectedMethod?.id === method.id ? 'border-[#51218F] bg-[#51218F]' : 'border-gray-400'}`}>
                                {selectedMethod?.id === method.id && <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{method.type === 'bank' ? '🏦 Bank Account' : '📱 UPI ID'}</p>
                                <p className="text-xs text-gray-600">{method.account_holder} • {method.account_detail}{method.is_default && <span className="ml-2 text-green-600 text-xs">(Default)</span>}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Available Balance: ₹{formatIndianRupee(availableBalance)}</label>
                  <input type="text" value={withdrawAmount} onChange={handleWithdrawAmountChange} placeholder="Enter amount" style={{ ...inputStyle, height: "48px", fontSize: "16px" }} />
                  {withdrawError && <p className="text-red-500 text-xs mt-1">{withdrawError}</p>}
                </div>
                {!walletStatus.canWithdraw && !walletStatus.loading && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                    <p className="text-yellow-800 text-sm font-medium">⚠️ Withdrawals Not Available</p>
                    <p className="text-yellow-700 text-xs mt-1">{!walletStatus.hasBeneficiary ? 'Please add a withdrawal method first' : walletStatus.message || "Please contact support to enable withdrawals via Cashfree Payouts."}</p>
                    {!walletStatus.hasBeneficiary && <button onClick={() => { setShowWithdrawPopup(false); setShowMethodModal(true); }} className="mt-2 text-yellow-800 text-xs font-medium underline">+ Add Withdrawal Method</button>}
                  </div>
                )}
              </div>
              <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex-shrink-0 space-y-3">
                <div className="flex gap-3">
                  <button onClick={() => { setShowWithdrawPopup(false); setWithdrawAmount(''); setWithdrawError(''); }} className="flex-1 h-11 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm">Cancel</button>
                  <button onClick={handleWithdrawClick} disabled={isProcessing || !walletStatus.canWithdraw || !selectedMethod || !withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > walletBalance || withdrawError !== '' || !hasPhone || !hasEmail} className={`flex-1 h-11 rounded-xl text-white font-medium transition-all text-sm ${(!walletStatus.canWithdraw || !selectedMethod || !withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > walletBalance || withdrawError !== '' || !hasPhone || !hasEmail) ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#51218F] to-black hover:opacity-90'}`}>
                    {isProcessing ? <div className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Processing...</div> : 'Withdraw'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center">Email verification is required before every withdrawal.</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Popup - auto closes in 2 seconds */}
        {showSuccessPopup && (
          <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center px-4">
            <div className="relative w-full max-w-[350px] md:max-w-[875px] bg-white rounded-[20px] md:rounded-[32px] overflow-hidden">
              <div className="px-5 py-6 md:px-10 md:py-10 flex flex-col items-center">
                <h1 className="text-[26px] md:text-[40px] font-bold text-center" style={{ fontFamily: "Trochut" }}>Talenta</h1>
                <div className="mt-5 md:mt-8 flex justify-center">
                  <img src={successIcon} alt="Withdrawal Success" className="w-16 h-16 md:w-28 md:h-28 object-contain" />
                </div>
                <p className="mt-5 md:mt-8 text-center text-[14px] md:text-[24px] leading-snug" style={{ fontFamily: "Milonga", background: "linear-gradient(270deg, #3D1768 22.62%, #030303 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Your withdrawal has been successfully processed.<br />₹{formatIndianRupee(withdrawAmount)} will be sent to your {selectedMethod?.type === 'bank' ? 'bank account' : 'UPI ID'} shortly.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========== EMAIL SETUP POPUP ========== */}
        {showEmailSetupPopup && (
          <>
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99998]"
              onClick={() => {
                if (!isSavingEmail) setShowEmailSetupPopup(false);
              }}
            />
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
              <div className="relative w-full max-w-[740px] min-h-[432px] rounded-[32px] border-[1.5px] border-white bg-white/70 shadow-[0_0_10px_0_#FFFFFF] flex flex-col items-center justify-center gap-4 md:gap-6 p-4 sm:p-6 md:p-8 my-8 mx-2 sm:mx-4">
                <div
                  className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 cursor-pointer select-none z-10"
                  onClick={() => {
                    if (!isSavingEmail) setShowEmailSetupPopup(false);
                  }}
                >
                  <div
                    className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(3,3,3,0.9) 0%, rgba(81,33,143,0.9) 100%)",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 md:h-4 md:w-4 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                  </div>
                  <span className="text-[#030303] poppins-font text-sm md:text-lg font-medium">
                    Back
                  </span>
                </div>

                <div className="w-full max-w-lg text-center mt-8 md:mt-10">
                  <h1 className="text-xl sm:text-2xl md:text-[32px] font-semibold text-[#000000] poppins-font">
                    Add Email Address
                  </h1>
                  <p className="text-[#3D1768] text-xs sm:text-sm md:text-base poppins-font mb-6 md:mb-10 px-3 sm:px-4">
                    No email found on your account. Please add an email address first to verify it.
                  </p>

                  <div className="mb-6 md:mb-8 px-2 sm:px-0">
                    <label className="block text-xs sm:text-sm font-medium text-[#030303] mb-2 md:mb-3 poppins-font text-left">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value.toLowerCase())}
                      placeholder="username@gmail.com"
                      disabled={isSavingEmail}
                      className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-[#3D1768] focus:border-[#3D1768] outline-none transition-all text-[#030303] poppins-font disabled:opacity-60"
                    />
                    <p className="text-[10px] sm:text-sm text-[#030303]/70 poppins-font mt-2 md:mt-3">
                      Enter a valid email address to proceed with verification
                    </p>
                  </div>

                  <button
                    onClick={handleSaveEmail}
                    disabled={!isValidEmail(newEmail) || isSavingEmail}
                    type="button"
                    className="group relative overflow-hidden w-full max-w-[554px] h-10 sm:h-12 md:h-[48px] rounded-[30px] bg-gradient-to-r from-[#3D1768] to-[#030303] px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-white text-sm sm:text-base md:text-lg font-medium poppins-font border border-white/10 shadow-lg hover:border-white/30 hover:shadow-2xl hover:shadow-purple-900/50 active:scale-95 transition-all duration-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 transition-transform duration-1000 ease-out group-hover:translate-x-[100%]" />
                    <span className="absolute inset-0 rounded-[30px] bg-white/10 scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative z-10 group-hover:scale-105 transition-transform duration-300">
                      {isSavingEmail ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs sm:text-sm">Saving...</span>
                        </div>
                      ) : (
                        "Save & Verify Email"
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ========== EMAIL VERIFICATION POPUP ========== */}
        {showEmailPopup && (
          <>
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99998]"
              onClick={() => {
                if (!isVerifying) {
                  setShowEmailPopup(false);
                }
              }}
            />
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
              <div className="relative w-full max-w-[740px] min-h-[432px] rounded-[32px] border-[1.5px] border-white bg-white/70 shadow-[0_0_10px_0_#FFFFFF] flex flex-col items-center justify-center gap-4 md:gap-6 p-4 sm:p-6 md:p-8 my-8 mx-2 sm:mx-4">
                {isVerifying && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-[32px]">
                    <div className="flex flex-col items-center gap-3 md:gap-4 p-4">
                      <div className="relative">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border-3 sm:border-4 border-gray-200 rounded-full"></div>
                        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border-3 sm:border-4 border-[#51218F] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                      </div>
                      <div className="text-center">
                        <p className="text-[#51218F] font-semibold text-sm sm:text-base md:text-lg">
                          Sending OTP...
                        </p>
                        <p className="text-gray-500 text-[10px] sm:text-xs md:text-sm mt-1 md:mt-2">
                          Please wait while we send the verification code
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div
                  className={`absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 cursor-pointer select-none z-10 ${isVerifying ? "opacity-50 pointer-events-none" : ""}`}
                  onClick={() => {
                    if (!isVerifying) {
                      setShowEmailPopup(false);
                    }
                  }}
                >
                  <div
                    className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(3,3,3,0.9) 0%, rgba(81,33,143,0.9) 100%)",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 md:h-4 md:w-4 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                  </div>
                  <span className="text-[#030303] poppins-font text-sm md:text-lg font-medium">
                    Back
                  </span>
                </div>

                <div className="w-full max-w-lg text-center mt-8 md:mt-10">
                  <h1 className="text-xl sm:text-2xl md:text-[32px] font-semibold text-[#000000] poppins-font">
                    Verify Email Address
                  </h1>
                  <p className="text-[#3D1768] text-xs sm:text-sm md:text-base poppins-font mb-6 md:mb-10 px-3 sm:px-4">
                    Enter your registered email address to receive a verification code
                  </p>

                  <div className="mb-4 p-2 sm:p-3 bg-purple-50 rounded-lg border border-purple-200 mx-2 sm:mx-0">
                    <div className="flex items-center gap-2 justify-center flex-wrap">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-[#51218F]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-xs sm:text-sm font-medium text-[#51218F]">
                        Registered email:{" "}
                        <span className="font-bold">
                          {effectiveUser?.email || "Not set"}
                        </span>
                      </p>
                    </div>
                    <p className="text-[10px] sm:text-xs text-[#51218F]/70 mt-1">
                      You must use this email for verification
                    </p>
                  </div>

                  <div className="mb-6 md:mb-8 px-2 sm:px-0">
                    <label className="block text-xs sm:text-sm font-medium text-[#030303] mb-2 md:mb-3 poppins-font text-left">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.toLowerCase())}
                      placeholder={effectiveUser?.email || "Enter your Gmail address"}
                      disabled={isVerifying}
                      className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border ${isValidGmail(email) ? "border-gray-300" : "border-red-300"} rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-[#3D1768] focus:border-[#3D1768] outline-none transition-all text-[#030303] poppins-font placeholder:text-[#030303]/50 ${isVerifying ? "opacity-50 cursor-not-allowed" : ""}`}
                    />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2 md:mt-3">
                      <p className="text-[10px] sm:text-sm text-[#030303]/70 poppins-font">
                        {isValidGmail(email)
                          ? "We'll send a 6-digit verification code to this email"
                          : "Please enter a valid Gmail address (@gmail.com)"}
                      </p>
                      {email && !isValidGmail(email) && (
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4 text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-red-500 text-[10px] sm:text-xs">
                            Invalid email
                          </span>
                        </div>
                      )}
                    </div>

                    {email &&
                      effectiveUser?.email &&
                      email.toLowerCase() !== effectiveUser.email.toLowerCase() && (
                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-[10px] sm:text-xs text-yellow-700">
                            ⚠️ This email doesn't match your registered email.
                            Please use your registered email for verification.
                          </p>
                        </div>
                      )}

                    {rateLimitError && (
                      <div className="mt-3 p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <p className="text-xs sm:text-sm text-yellow-800">
                            {rateLimitError}
                          </p>
                        </div>
                        {resendTime > 0 && (
                          <p className="text-[10px] sm:text-xs text-yellow-700 mt-2">
                            Please wait {resendTime} seconds before trying again
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleEmailSubmit}
                    disabled={
                      !isValidGmail(email) ||
                      isVerifying ||
                      (effectiveUser?.email &&
                        email.toLowerCase() !== effectiveUser.email.toLowerCase())
                    }
                    type="button"
                    className="group relative overflow-hidden w-full max-w-[554px] h-10 sm:h-12 md:h-[48px] rounded-[30px] bg-gradient-to-r from-[#3D1768] to-[#030303] px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-white text-sm sm:text-base md:text-lg font-medium poppins-font border border-white/10 shadow-lg hover:border-white/30 hover:shadow-2xl hover:shadow-purple-900/50 active:scale-95 transition-all duration-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 transition-transform duration-1000 ease-out group-hover:translate-x-[100%]" />
                    <span className="absolute inset-0 rounded-[30px] bg-white/10 scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative z-10 group-hover:scale-105 transition-transform duration-300">
                      {isVerifying ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs sm:text-sm">Sending...</span>
                        </div>
                      ) : (
                        "Send OTP"
                      )}
                    </span>
                  </button>

                  {resendTime > 0 && resendTime < 60 && (
                    <p className="text-center text-[10px] sm:text-xs text-gray-500 mt-4">
                      Please wait {resendTime} seconds before requesting another OTP
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ========== OTP POPUP ========== */}
        {showOTPPopup && (
          <>
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99998]"
              onClick={() => {
                setShowOTPPopup(false);
                setOtp(["", "", "", "", "", ""]);
                setResendTime(45);
                setShowEmailPopup(true);
              }}
            />
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
              <div className="relative w-full max-w-[740px] min-h-[432px] rounded-[32px] border-[1.5px] border-white bg-white/70 shadow-[0_0_10px_0_#FFFFFF] flex flex-col items-center justify-center gap-4 md:gap-6 p-4 sm:p-6 md:p-8 my-8 mx-2 sm:mx-4">
                <div
                  className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 cursor-pointer select-none z-10"
                  onClick={() => {
                    setShowOTPPopup(false);
                    setOtp(["", "", "", "", "", ""]);
                    setResendTime(45);
                    setShowEmailPopup(true);
                  }}
                >
                  <div
                    className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(3,3,3,0.9) 0%, rgba(81,33,143,0.9) 100%)",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 md:h-4 md:w-4 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                  </div>
                  <span className="text-[#030303] poppins-font text-sm md:text-lg font-medium">
                    Back
                  </span>
                </div>

                <div className="w-full max-w-lg text-center mt-8 md:mt-10">
                  <h1 className="text-xl sm:text-2xl md:text-[32px] font-semibold text-[#000000] poppins-font">
                    Enter OTP
                  </h1>
                  <p className="text-[#3D1768] text-xs sm:text-sm md:text-base poppins-font mb-6 md:mb-10 px-3 sm:px-4">
                    We've sent a 6-digit OTP to your{" "}
                    <span className="font-semibold text-[#51218F]">Email Address</span>.
                    Please enter it below to continue.
                  </p>

                  <div className="flex justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 mb-6 md:mb-8 px-2 sm:px-0">
                    {Array(6)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="relative flex-shrink-0">
                          <input
                            value={otp[i] || ""}
                            onChange={(e) => handleOtpChange(i, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Backspace" && !otp[i] && i > 0) {
                                document.getElementById(`otp-${i - 1}`)?.focus();
                              } else if (
                                e.key !== "Backspace" &&
                                /^[0-9]$/.test(e.key) &&
                                otp[i] &&
                                i < 5
                              ) {
                                setTimeout(() => {
                                  document
                                    .getElementById(`otp-${i + 1}`)
                                    ?.focus();
                                }, 10);
                              }
                            }}
                            id={`otp-${i}`}
                            maxLength={1}
                            inputMode="numeric"
                            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-[50px] lg:h-[70px] text-center text-base sm:text-xl md:text-2xl lg:text-4xl text-[#000000] bg-transparent outline-none leading-none pb-1 sm:pb-2"
                          />
                          <div
                            className={`absolute left-0 right-0 bottom-0 h-[2px] rounded-full transition-all duration-300 ${otp[i] ? "bg-[#3D1768]" : "bg-gray-400"
                              }`}
                          />
                        </div>
                      ))}
                  </div>

                  <button
                    onClick={verifyOTP}
                    disabled={otp.some((digit) => !digit) || isVerifying}
                    type="button"
                    className="group relative overflow-hidden w-full max-w-[554px] h-10 sm:h-12 md:h-[48px] rounded-[30px] bg-gradient-to-r from-[#3D1768] to-[#030303] px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-white text-sm sm:text-base md:text-lg font-medium poppins-font border border-white/10 shadow-lg hover:border-white/30 hover:shadow-2xl hover:shadow-purple-900/50 active:scale-95 transition-all duration-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 transition-transform duration-1000 ease-out group-hover:translate-x-[100%]" />
                    <span className="absolute inset-0 rounded-[30px] bg-white/10 scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative z-10 group-hover:scale-105 transition-transform duration-300">
                      {isVerifying ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs sm:text-sm md:text-base">
                            Verifying...
                          </span>
                        </div>
                      ) : (
                        "Verify OTP"
                      )}
                    </span>
                  </button>

                  <div className="mt-6 md:mt-8 text-center">
                    <p className="text-[#030303]/90 text-xs sm:text-sm md:text-base poppins-font mb-1">
                      Didn't receive the code?
                    </p>
                    {resendTime > 0 ? (
                      <div>
                        <p className="text-[#030303]/90 text-xs sm:text-sm md:text-base poppins-font">
                          Resend in{" "}
                          <span className="font-bold text-red-500 font-mono">
                            {String(Math.floor(resendTime / 60)).padStart(2, "0")}
                            :{String(resendTime % 60).padStart(2, "0")}
                          </span>
                        </p>
                        {rateLimitError && (
                          <p className="text-xs text-red-500 mt-2">
                            {rateLimitError}
                          </p>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={handleResendOTP}
                        disabled={isVerifying}
                        className="text-[#C22CA2] hover:text-[#3D1768] font-semibold text-xs sm:text-sm md:text-base poppins-font transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2 mx-auto px-3 sm:px-4 py-1 sm:py-2 rounded-full group"
                      >
                        {isVerifying ? (
                          <>
                            <svg
                              className="animate-spin h-3 w-3 sm:h-4 sm:w-4 text-[#C22CA2]"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            <span>Sending OTP...</span>
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-3 h-3 sm:w-4 sm:w-4 transition-transform group-hover:rotate-12"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            <span>Resend OTP</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ========== EMAIL VERIFICATION SUCCESS POPUP ========== */}
        {emailVerificationSuccess && (
          <>
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99998]"
              onClick={() => setEmailVerificationSuccess(false)}
            />
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
              <div className="relative w-full max-w-[652px] min-h-[300px] md:min-h-[398px] rounded-[32px] border-[1.5px] border-white bg-white/70 shadow-[0_0_10px_0_#FFFFFF] flex flex-col items-center justify-center gap-4 md:gap-6 p-5 md:p-8 my-8 mx-2 sm:mx-4">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/190/190411.png"
                  alt="Success"
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-[122px] md:h-[122px] max-w-[25%] max-h-[25%] object-contain"
                />
                <p className="w-[90%] max-w-[522px] text-center text-base sm:text-lg md:text-[24px] leading-[120%] sm:leading-[100%] font-normal poppins-font text-[#3D1768] px-2">
                  Your Email Address has been verified successfully!
                </p>
                <div
                  className="flex items-center mt-2 md:mt-4 gap-2 cursor-pointer"
                  onClick={() => setEmailVerificationSuccess(false)}
                >
                  <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full border border-white/20 bg-gradient-to-r from-[#3D1768] to-[#030303]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3 h-3 md:w-4 md:h-4 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="19" y1="12" x2="5" y2="12" />
                      <polyline points="12 19 5 12 12 5" />
                    </svg>
                  </div>
                  <span className="text-[#030303] poppins-font font-normal text-sm md:text-[18px] leading-[100%]">
                    Continue
                  </span>
                </div>
                <p className="text-xs md:text-sm text-[#3D1768]/80 poppins-font mt-1 md:mt-2">
                  Processing your withdrawal...
                </p>
              </div>
            </div>
          </>
        )}

      </section>

      <div className="w-full mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default Overview;