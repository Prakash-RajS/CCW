// src/pages/Financials/WalletOverview.jsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import api from "../../utils/axiosConfig";
import toast from "../../component/Toast";

export default function WalletOverview() {
  const { userData } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [transferStatus, setTransferStatus] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [walletData, setWalletData] = useState({
    balance: 0,
    pending: 0,
    totalDeposits: 0,
    currency: "USD",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verifyingCollaborator, setVerifyingCollaborator] = useState(false);
  const [contractData, setContractData] = useState(null);
  const [isOverdue, setIsOverdue] = useState(false);
  const [overdueDays, setOverdueDays] = useState(0);
  const [milestoneIndex, setMilestoneIndex] = useState(null);

  // ========== EMAIL VERIFICATION STATES ==========
  const [showEmailSetupPopup, setShowEmailSetupPopup] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [showOTPPopup, setShowOTPPopup] = useState(false);
  const [emailVerificationSuccess, setEmailVerificationSuccess] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTime, setResendTime] = useState(45);
  const [rateLimitError, setRateLimitError] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [cooldownToken, setCooldownToken] = useState("");
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [awaitingContinueAfterVerification, setAwaitingContinueAfterVerification] = useState(false);

  let loadingToastId = null;

  const hasPhone = userData && (userData.phone || userData.mobile || userData.phone_number);
  const hasEmail = userData && userData.email && userData.email.trim() !== "";

  // Auto-close email verification success popup after 2 seconds
  useEffect(() => {
    if (emailVerificationSuccess) {
      const timer = setTimeout(() => {
        setEmailVerificationSuccess(false);
        // Proceed to collaborator verification after email verification
        if (awaitingContinueAfterVerification) {
          setAwaitingContinueAfterVerification(false);
          handleContinueAfterEmailVerification();
        }
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

  useEffect(() => {
    const state = location.state;
    if (state?.openTransferModal && state?.contractId) {
      setEmail(state.collaboratorEmail || "");
      setAmount(state.amount?.toString() || "");
      setMilestoneIndex(state.milestoneIndex ?? null);
      setContractData({
        budget: state.amount,
        contractId: state.contractId,
        isPaid: false,
        jobTitle: state.jobTitle,
        collaboratorId: state.collaboratorId,
        collaboratorName: state.collaboratorName,
        isMilestonePayment: state.isMilestonePayment || false,
        milestoneIndex: state.milestoneIndex ?? null,
      });
      setIsOverdue(state.isOverdue || false);
      setOverdueDays(state.overdueDays || 0);
      setShowTransferModal(true);
      setPaymentStep(1);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (showTransferModal) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
     
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [showTransferModal]);

  useEffect(() => {
    if (userData?.id) {
      fetchWalletData();
    }
  }, [userData]);

  const fetchWalletData = async () => {
  try {
    setLoading(true);
    const response = await api.get(`/wallet/?user_id=${userData.id}`);
    const txResponse = await api.get(
      `/wallet/transactions?user_id=${userData.id}`,
    );
    
    // FIX: Check if transaction type starts with "Deposit" instead of exact match
    const deposits = txResponse.data
      .filter((tx) => tx.type && tx.type.startsWith("Deposit"))
      .reduce((sum, tx) => sum + tx.amount, 0);

    setWalletData({
      balance: response.data.balance || 0,
      pending: 0,
      totalDeposits: deposits,
      currency: response.data.currency || "USD",
    });
    setError("");
  } catch (err) {
    console.error("Error fetching wallet:", err);
    setError("Failed to load wallet data");
    toast.error(
      "Failed to load wallet data",
      "Please refresh the page and try again.",
    );
  } finally {
    setLoading(false);
  }
};

  const completeMilestoneAfterPayment = async (contractId, milestoneIdx) => {
    try {
      const response = await api.post(
        `/contracts/${contractId}/milestones/${milestoneIdx}/approve-work`,
        null,
        {
          params: { user_id: userData.id },
        },
      );
      return response.data.success;
    } catch (error) {
      console.error("Error completing milestone:", error);
      return false;
    }
  };

  const completeContractAfterPayment = async (contractId) => {
    try {
      const response = await api.post(
        `/contracts/${contractId}/approve-work`,
        null,
        {
          params: { user_id: userData.id },
        },
      );
      return true;
    } catch (error) {
      console.error("Error completing contract:", error);
      return false;
    }
  };

  const walletSummary = [
    {
      key: "available",
      label: "Available Balance",
      amount: walletData.balance,
      bg: "bg-[#7F3FBF]",
    },
    {
      key: "pending",
      label: "Pending Payment",
      amount: walletData.pending,
      bg: "bg-[#5A00A3]",
    },
    {
      key: "total",
      label: "Total Deposits",
      amount: walletData.totalDeposits,
      bg: "bg-[#6A2E9B]",
    },
  ];

  const validateWalletForm = () => {
    if (!email?.trim()) {
      setFormError("Email is required");
      toast.error(
        "Email is required",
        "Please enter a collaborator email address.",
      );
      return false;
    }
    if (!amount || Number(amount) <= 0) {
      setFormError("Enter valid amount");
      toast.error(
        "Enter valid amount",
        "Please enter a positive amount to transfer.",
      );
      return false;
    }
    if (Number(amount) > walletData.balance) {
      setFormError("Insufficient balance");
      toast.error(
        "Insufficient balance",
        `Your available balance is ₹${walletData.balance.toFixed(2)}.`,
      );
      return false;
    }
    if (isOverdue && contractData && Number(amount) > contractData.budget) {
      setFormError(
        `Amount cannot exceed the milestone budget of ₹${contractData.budget}`,
      );
      toast.error(
        "Amount exceeds budget",
        `The maximum you can pay is ₹${contractData.budget}.`,
      );
      return false;
    }
    return true;
  };

  // ========== EMAIL VERIFICATION FUNCTIONS (reused from AddFunds/WithdrawFunds) ==========
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
      setEmailForVerification(userData.email);
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
      const response = await api.put(`/creator/edit/${userData.id}`, {
        email: newEmail,
      });
      if (response.data.status === "success") {
        setEmailForVerification(newEmail);
        setShowEmailSetupPopup(false);
        toast.success("Email added successfully!");
        // After adding email, proceed to send OTP
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
    const registeredEmail = userData?.email;
    if (!registeredEmail) {
      toast.error("No registered email found. Please add an email first.");
      setShowEmailSetupPopup(true);
      return;
    }
    setEmailForVerification(registeredEmail);
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
        const errorMessage =
          error.response?.data?.detail ||
          "Too many requests. Please wait before trying again.";
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
        toast.error(
          error.response?.data?.detail ||
          "Failed to send OTP. Please try again."
        );
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
        { email: emailForVerification, otp_code: otpString }
      );
      if (response.data.status === "success") {
        setShowOTPPopup(false);
        setEmailVerificationSuccess(true);
        setOtp(["", "", "", "", "", ""]);
        setResendTime(45);
        setOtpToken("");
        setCooldownToken("");
        toast.success("Email verified successfully!");
        // The success popup will auto-close and trigger handleContinueAfterEmailVerification
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error(
        error.response?.data?.detail ||
        "Verification failed. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (isVerifying) return;
    if (resendTime > 0) {
      toast.error(
        `Please wait ${resendTime} seconds before requesting another OTP`
      );
      return;
    }
    setIsVerifying(true);
    try {
      const registeredEmail = userData?.email;
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
        const errorMessage =
          error.response?.data?.detail ||
          "Please wait before requesting another OTP";
        toast.error(errorMessage);
        const match = errorMessage.match(/(\d+)\s*seconds?/);
        if (match && match[1]) {
          const remainingSeconds = parseInt(match[1]);
          if (remainingSeconds > 0 && remainingSeconds <= 60)
            setResendTime(remainingSeconds);
        }
      } else {
        toast.error(
          error.response?.data?.detail ||
          "Failed to resend OTP. Please try again."
        );
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

  // Original collaborator verification logic
  const checkCollaboratorStatus = async () => {
    setVerifyingCollaborator(true);
    setFormError("");
    setTransferStatus(null);

    loadingToastId = toast.loading("Verifying collaborator...");

    try {
      const verifyResponse = await api.post("/wallet/verify-collaborator", {
        email: email,
      });

      if (!verifyResponse.data.exists) {
        toast.dismiss(loadingToastId);
        toast.error(
          "Collaborator not found",
          "Please check the email address and try again.",
        );
        setFormError("Collaborator not found. Please check the email.");
        return false;
      }

      const statusResponse = await api.get(`/wallet/collaborator-status`, {
        params: { 
          email: email, 
          creator_id: userData.id,
          contract_id: contractData?.contractId
        },
      });

      const {
        isReadyForPayment,
        contractExists,
        contractBudget,
        isPaid,
        message,
      } = statusResponse.data;

      if (isPaid) {
        toast.dismiss(loadingToastId);
        toast.error(
          "Contract already paid",
          "This contract has already been paid. Duplicate payments are not allowed.",
        );
        setFormError(
          "This collaborator has already been paid for the contract. Duplicate payments are not allowed.",
        );
        return false;
      }

      if (!isReadyForPayment || !contractExists) {
        toast.dismiss(loadingToastId);
        toast.error(
          "Not ready for payment",
          message || "Collaborator is not ready to receive payments.",
        );
        setTransferStatus({
          type: "not_ready",
          message: message || "Collaborator is not ready to receive payments",
        });
        return false;
      }

      setContractData((prev) => ({
        ...prev,
        budget: contractBudget,
        isPaid: isPaid,
        jobTitle: prev?.jobTitle || "",
      }));

      toast.dismiss(loadingToastId);
      toast.success("Collaborator verified", `Ready to pay ₹${contractBudget}`);
      setTransferStatus({
        type: "ready",
        message: `Ready to pay ₹${contractBudget}`,
      });
      return true;

    } catch (err) {
      console.error("Error checking collaborator:", err);
      toast.dismiss(loadingToastId);
      const errorMsg = err.response?.data?.detail || "Failed to verify collaborator";
      toast.error("Verification failed", errorMsg);
      setFormError(errorMsg);
      return false;
    } finally {
      setVerifyingCollaborator(false);
      loadingToastId = null;
    }
  };

  // This is the original handleContinue logic (collaborator verification)
  const handleContinueAfterEmailVerification = async () => {
    if (!email?.trim()) {
      setFormError("Email is required");
      toast.error(
        "Email is required",
        "Please enter a collaborator email address.",
      );
      return;
    }

    setFormError("");
    const isReady = await checkCollaboratorStatus();

    if (isReady) {
      setPaymentStep(2);
    }
  };

  // Modified: first verify email, then proceed to collaborator verification
  const handleVerifyAndContinue = () => {
    // Basic validation for email and amount
    if (!email?.trim()) {
      setFormError("Email is required");
      toast.error("Email is required", "Please enter a collaborator email address.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setFormError("Enter valid amount");
      toast.error("Enter valid amount", "Please enter a positive amount to transfer.");
      return;
    }
    if (Number(amount) > walletData.balance) {
      setFormError("Insufficient balance");
      toast.error("Insufficient balance", `Your available balance is ₹${walletData.balance.toFixed(2)}.`);
      return;
    }

    // Start email verification flow
    setAwaitingContinueAfterVerification(true);
    startEmailVerificationFlow();
  };

  const handleConfirmTransfer = async () => {
    if (contractData && contractData.isMilestonePayment) {
      if (Number(amount) > contractData.budget) {
        setFormError(
          `Amount cannot exceed milestone budget: ₹${contractData.budget}`,
        );
        toast.error(
          "Amount exceeds budget",
          `Maximum allowed is ₹${contractData.budget}`,
        );
        return;
      }
    }
    else if (
      contractData &&
      !isOverdue &&
      Number(amount) !== contractData.budget
    ) {
      setFormError(
        `Amount must match contract budget: ₹${contractData.budget}`,
      );
      toast.error(
        "Amount mismatch",
        `Amount must match contract budget: ₹${contractData.budget}`,
      );
      return;
    }
    if (isOverdue && contractData && Number(amount) > contractData.budget) {
      setFormError(
        `Amount cannot exceed contract budget: ₹${contractData.budget}`,
      );
      toast.error(
        "Amount exceeds budget",
        `Maximum allowed is ₹${contractData.budget}`,
      );
      return;
    }

    if (!validateWalletForm()) return;
    await processTransfer();
  };

  const processTransfer = async () => {
    setPaymentProcessing(true);
    let processingToastId = toast.loading("Processing transfer...");

    const milestoneIdx = contractData?.milestoneIndex;
    
    const requestBody = {
      creator_id: userData.id,
      collaborator_email: email,
      amount: Number(amount),
      contract_id: contractData?.contractId,
      is_milestone_payment: contractData?.isMilestonePayment || false,
      milestone_index: milestoneIdx !== undefined ? milestoneIdx : null,
    };

    try {
      const response = await api.post("/wallet/internal-transfer", requestBody);

      if (response.data.success) {
        toast.dismiss(processingToastId);

        if (contractData?.isMilestonePayment && contractData?.contractId) {
          const milestoneNum = (milestoneIdx || 0) + 1;
          toast.success(`Milestone ${milestoneNum} payment of ₹${amount} completed!`);

          handleCloseModal();

          const allMilestonesPaid = response.data.all_milestones_paid;
          const contractStatus = response.data.contract_status;

          if (allMilestonesPaid || contractStatus === "completed") {
            navigate("/completedcontracts");
          } else {
            navigate("/activecontracts");
          }
        } else if (contractData?.contractId) {
          const contractCompleted = await completeContractAfterPayment(contractData.contractId);
          if (contractCompleted) {
            toast.success("Payment successful!", "Payment completed and contract finalized!");
          }
          handleCloseModal();
          navigate("/completedcontracts");
        } else {
          toast.success("Transfer completed!", `₹${amount} transferred successfully to ${email}`);
          handleCloseModal();
        }

        await fetchWalletData();
      }
    } catch (err) {
      toast.dismiss(processingToastId);
      console.error("Transfer error details:", err.response?.data);
      const errorMsg = err.response?.data?.detail || "Transfer failed";
      setFormError(errorMsg);
      toast.error("Transfer failed", errorMsg);
    } finally {
      setPaymentProcessing(false);
      processingToastId = null;
    }
  };

  const handleCloseModal = () => {
    setShowTransferModal(false);
    setPaymentStep(1);
    setAmount("");
    setEmail("");
    setContractData(null);
    setTransferStatus(null);
    setFormError("");
    setIsOverdue(false);
    setOverdueDays(0);
    setMilestoneIndex(null);
    setAwaitingContinueAfterVerification(false);

    window.history.replaceState({}, document.title);

    if (loadingToastId) {
      toast.dismiss(loadingToastId);
      loadingToastId = null;
    }
  };

  if (loading) {
    return (
      <div className="font-['Montserrat'] flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-[#51218F] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="font-['Montserrat'] text-center text-red-500 p-8">
        <p>{error}</p>
        <button
          onClick={() => {
            fetchWalletData();
          }}
          className="mt-4 px-4 py-2 bg-[#51218F] text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="font-['Montserrat'] relative px-2 sm:px-3 md:px-0">
      <h2 className="font-['Montserrat'] font-semibold text-[15px] sm:text-[16px] md:text-[18px] lg:text-[24px]">
        Manage Your Wallet - Secure, Fast, Flexible
      </h2>
      <p className="mt-0.5 md:mt-1 font-['Montserrat'] font-medium text-[10px] sm:text-[11px] md:text-[12px] lg:text-[16px] text-black">
        Track your balances, manage payment, and deposit or withdraw funds
        seamlessly and securely.
      </p>

      <div className="w-full h-[1px] bg-black/10 my-3"></div>

      {/* Wallet Summary Cards - Responsive with reduced tablet size */}
      <div className="mt-6 md:mt-0 flex flex-wrap gap-2 sm:gap-3 md:gap-3 lg:gap-6">
        {walletSummary.map((item) => (
          <div
            key={item.key}
            className={`
              flex-1 min-w-[90px] sm:min-w-[100px] md:min-w-[120px] lg:min-w-[180px]
              h-[65px] sm:h-[70px] md:h-[80px] lg:h-[120px]
              rounded-[6px] md:rounded-[8px] lg:rounded-[12px]
              text-white
              flex
              flex-col
              justify-center
              items-center
              p-2 sm:p-2 md:p-3 lg:p-4
              ${item.bg}
            `}
          >
            <p className="font-['Montserrat'] font-medium text-[13px] sm:text-[14px] md:text-[16px] lg:text-[24px]">
              ₹{item.amount.toFixed(2)}
            </p>
            <p className="font-['Montserrat'] font-medium text-[8px] sm:text-[9px] md:text-[11px] lg:text-[16px] text-center leading-tight">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <p className="font-['Montserrat'] font-medium text-[10px] sm:text-[11px] md:text-[12px] lg:text-[16px] text-black md:max-w-[70%]">
          Your funds are securely stored and protected by Cashfree's
          industry-standard encryption. Withdraw anytime if not used for
          payments.
        </p>
      </div>

      {/* Transfer Modal - Responsive with reduced tablet size */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
          <div className="bg-white w-full max-w-[90%] sm:max-w-[450px] md:max-w-[480px] lg:max-w-[540px] rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
            {paymentStep === 3 ? (
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scroll">
                <div className="max-w-[260px] sm:max-w-[280px] md:max-w-[300px] w-full mx-auto">
                  <div className="flex justify-center items-center bg-[#DDF3E6] w-[80px] h-[80px] sm:w-[90px] sm:h-[90px] md:w-[100px] md:h-[100px] lg:w-[120px] lg:h-[120px] mx-auto rounded-[16px] sm:rounded-[20px] md:rounded-[24px]">
                    <svg width="50" height="50" sm:width="60" sm:height="60" md:width="70" md:height="70" lg:width="90" lg:height="90" viewBox="0 0 100 100" fill="none">
                      <defs>
                        <mask id="cutoutIcon">
                          <rect width="100" height="100" fill="white" />
                          <circle cx="70" cy="76" r="23" fill="black" />
                        </mask>
                      </defs>
                      <g mask="url(#cutoutIcon)">
                        <rect
                          x="10"
                          y="25"
                          width="75"
                          height="50"
                          rx="8"
                          stroke="#00A651"
                          strokeWidth="4"
                        />
                        <line
                          x1="10"
                          y1="38"
                          x2="85"
                          y2="38"
                          stroke="#00A651"
                          strokeWidth="4"
                        />
                        <circle
                          cx="22"
                          cy="60"
                          r="4"
                          stroke="#00A651"
                          strokeWidth="4"
                        />
                      </g>
                      <line
                        x1="10"
                        y1="50"
                        x2="85"
                        y2="50"
                        stroke="#00A651"
                        strokeWidth="4"
                        strokeLinecap="butt"
                      />
                      <circle
                        cx="70"
                        cy="76"
                        r="19"
                        stroke="#00A651"
                        strokeWidth="4"
                        fill="#DDF3E6"
                      />
                      <path
                        d="M61 76L67 82L79 70"
                        stroke="#00A651"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h2 className="text-green-600 text-sm sm:text-base md:text-lg font-semibold mb-1 text-center">
                    Payment Successful!
                  </h2>
                  <p className="text-gray-500 text-[10px] sm:text-[11px] md:text-[12px] mb-5 text-center">
                    {contractData?.isMilestonePayment
                      ? `Milestone payment of ₹${amount} completed!`
                      : contractData?.contractId
                        ? "Payment completed and contract finalized!"
                        : "Your transfer has been processed successfully."}
                  </p>
                  <div className="bg-[#F3F4F6] rounded-[14px] sm:rounded-[16px] md:rounded-[18px] p-3 sm:p-4 text-[10px] sm:text-[11px] md:text-[12px] text-gray-700 space-y-2">
                    <div className="flex justify-between border-b pb-2 flex-wrap gap-1">
                      <span className="text-gray-500">Amount</span>
                      <span className="text-[11px] sm:text-[12px] md:text-[14px] font-semibold">
                        ₹{amount}
                      </span>
                    </div>
                    <div className="h-[1px] w-full bg-gray-300 my-2"></div>
                    <div className="flex justify-between flex-wrap gap-1">
                      <span className="text-gray-500">To Email</span>
                      <span className="text-[10px] sm:text-[11px] md:text-[12px] break-all text-right">{email}</span>
                    </div>
                    {contractData && (
                      <>
                        <div className="flex justify-between flex-wrap gap-1">
                          <span className="text-gray-500">Contract ID</span>
                          <span className="text-[8px] sm:text-[9px] md:text-[10px] bg-gray-200 px-2 py-1 rounded">
                            #{contractData.contractId}
                          </span>
                        </div>
                        {contractData.isMilestonePayment &&
                          contractData.milestoneIndex !== null && (
                            <div className="flex justify-between flex-wrap gap-1">
                              <span className="text-gray-500">Milestone</span>
                              <span className="text-[8px] sm:text-[9px] md:text-[10px] bg-gray-200 px-2 py-1 rounded">
                                #{contractData.milestoneIndex + 1}
                              </span>
                            </div>
                          )}
                        <div className="flex justify-between flex-wrap gap-1">
                          <span className="text-gray-500">Status</span>
                          <span className="text-[8px] sm:text-[9px] md:text-[10px] text-green-600 font-medium">
                            Completed ✓
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between flex-wrap gap-1">
                      <span className="text-gray-500">Transaction ID</span>
                      <span className="text-[8px] sm:text-[9px] md:text-[10px] bg-gray-200 px-2 py-1 rounded">
                        TXN-{Math.floor(Math.random() * 100000000)}
                      </span>
                    </div>
                    <div className="flex justify-between flex-wrap gap-1">
                      <span className="text-gray-500">Date</span>
                      <span className="text-[10px] sm:text-[11px] md:text-[12px]">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        handleCloseModal();
                        if (contractData?.contractId) {
                          navigate("/completedcontracts");
                        }
                      }}
                      className="w-full py-2 rounded-lg bg-[#51218F] text-white text-[11px] sm:text-[12px] md:text-[13px] hover:opacity-90 transition-colors"
                    >
                      {contractData?.contractId
                        ? "View Completed Contracts"
                        : "Close"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Fixed header - reduced tablet size */}
                <div className="bg-gradient-to-r from-[#51218F] to-black px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 flex-shrink-0">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={handleCloseModal}
                      className="flex items-center gap-2 text-white hover:text-white/80 transition-colors group"
                    >
                      <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-[#51218F] to-[#2a0e4a] group-hover:from-[#3d1768] group-hover:to-[#1a0830] transition-all shadow-md">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white"
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
                      </div>
                    </button>
                    <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white tracking-tight">
                      Talenta
                    </h1>
                  </div>
                  <p className="text-white/80 text-[9px] sm:text-[10px] md:text-xs lg:text-sm mt-1 sm:mt-2">
                    {contractData?.isMilestonePayment
                      ? "Pay Milestone & Continue Contract"
                      : contractData?.contractId
                        ? "Pay Collaborator & Complete Contract"
                        : "Transfer to Collaborator"}
                  </p>
                  <p className="text-white/60 text-[8px] sm:text-[9px] md:text-[10px] mt-0.5">
                    Email verification required before each transfer
                  </p>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 custom-scroll">
                  {contractData?.contractId && (
                    <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-purple-800 text-[11px] sm:text-xs md:text-sm font-medium break-words">
                        Contract #{contractData.contractId}
                      </p>
                      {contractData.jobTitle && (
                        <p className="text-purple-600 text-[9px] sm:text-[10px] md:text-xs mt-1 break-words">
                          {contractData.jobTitle}
                        </p>
                      )}
                      {contractData.isMilestonePayment ? (
                        <>
                          <p className="text-purple-600 text-[9px] sm:text-[10px] md:text-xs mt-1">
                            Milestone Amount:{" "}
                            <span className="font-bold">
                              ₹{contractData.budget}
                            </span>
                          </p>
                          <p className="text-purple-600 text-[9px] sm:text-[10px] md:text-xs mt-1">
                            Milestone #{(contractData.milestoneIndex || 0) + 1}{" "}
                            of contract
                          </p>
                        </>
                      ) : (
                        <p className="text-purple-600 text-[9px] sm:text-[10px] md:text-xs mt-1">
                          Original Budget:{" "}
                          <span className="font-bold">
                            ₹{contractData.budget}
                          </span>
                        </p>
                      )}
                      <p className="text-purple-600 text-[9px] sm:text-[10px] md:text-xs mt-1">
                        Payment will be processed securely
                      </p>
                    </div>
                  )}

                  {isOverdue && (
                    <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 md:p-4 bg-red-50 border border-red-200 rounded-xl">
                      <div className="flex items-start gap-1.5 sm:gap-2">
                        <span className="text-red-600 text-sm sm:text-base md:text-lg">⚠️</span>
                        <div>
                          <p className="text-red-800 text-[11px] sm:text-xs md:text-sm font-medium">
                            Overdue Submission
                          </p>
                          <p className="text-red-700 text-[9px] sm:text-[10px] md:text-xs mt-1">
                            The collaborator submitted work {overdueDays} day(s)
                            after the deadline. You may deduct a penalty from
                            the payment. Note: You cannot pay more than the
                            milestone amount.
                          </p>
                          <p className="text-red-600 text-[9px] sm:text-[10px] md:text-xs mt-2 font-medium">
                            Suggested deduction: ₹
                            {Math.min(
                              contractData?.budget * 0.1 * overdueDays,
                              contractData?.budget * 0.5,
                            )}{" "}
                            (10% per day up to 50%)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {transferStatus?.type === "not_ready" && (
                    <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 md:p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <div className="flex items-start gap-1.5 sm:gap-2">
                        <span className="text-yellow-600 text-sm sm:text-base md:text-lg">⚠️</span>
                        <div>
                          <p className="text-yellow-800 text-[11px] sm:text-xs md:text-sm font-medium">
                            Not Ready for Payment
                          </p>
                          <p className="text-yellow-700 text-[9px] sm:text-[10px] md:text-xs mt-1 break-words">
                            {transferStatus.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {transferStatus?.type === "ready" && (
                    <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 text-[11px] sm:text-xs md:text-sm">
                        ✅ {transferStatus.message}
                      </p>
                    </div>
                  )}

                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-[11px] sm:text-xs md:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Collaborator Email
                      </label>
                      <input
                        type="email"
                        placeholder="Enter collaborator email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setFormError("");
                          setTransferStatus(null);
                          if (!contractData) {
                            setContractData(null);
                            setAmount("");
                          }
                        }}
                        className="w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-xl bg-[#F5F6F8] !border-2 !border-gray-400 focus:!border-[#51218F] focus:ring-2 focus:ring-[#51218F]/20 outline-none transition-all text-[11px] sm:text-xs md:text-sm lg:text-base"
                        disabled={
                          paymentStep === 2 ||
                          verifyingCollaborator ||
                          !!contractData
                        }
                      />
                    </div>

                                        <div>
  <label className="block text-[11px] sm:text-xs md:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
    Amount to Transfer
  </label>
  <input
    type="text"
    placeholder="Enter amount"
    value={amount}
    onChange={(e) => {
      let value = e.target.value.replace(/[^0-9.]/g, "");
      const parts = value.split(".");
      if (parts.length > 2)
        value = parts[0] + "." + parts[1];
      setAmount(value);
      setFormError("");
    }}
    className={`w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-xl bg-[#F5F6F8] !border-2 outline-none transition-all text-[11px] sm:text-xs md:text-sm lg:text-base ${
      contractData &&
      amount &&
      (isOverdue
        ? Number(amount) > contractData.budget
        : Number(amount) !== contractData.budget)
        ? "!border-yellow-400 focus:!border-yellow-500"
        : "!border-gray-400 focus:!border-[#51218F]"
    } focus:ring-2 focus:ring-[#51218F]/20`}
    disabled={paymentStep === 2 || verifyingCollaborator}
  />

  {/* ✅ SIMPLE INSUFFICIENT BALANCE WARNING - NO RED BORDER */}
  {Number(amount) > walletData.balance && amount !== "" && (
    <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs md:text-sm text-red-600">
      ⚠️ Insufficient balance. Available: ₹{walletData.balance.toFixed(2)}
    </p>
  )}

  {/* Contract info messages */}
  {contractData && (
    <>
      <p
        className={`text-[9px] sm:text-[10px] md:text-xs mt-1 ${!isOverdue && Number(amount) === contractData.budget ? "text-green-600" : "text-yellow-600"}`}
      >
        {contractData.isMilestonePayment ? (
          <>
            {Number(amount) === contractData.budget &&
              `✓ Amount matches milestone: ₹${contractData.budget}`}
            {Number(amount) !== contractData.budget &&
              Number(amount) < contractData.budget &&
              `ℹ️ Partial payment: ₹${amount} of ₹${contractData.budget}`}
            {Number(amount) !== contractData.budget &&
              Number(amount) > contractData.budget &&
              `⚠️ Cannot exceed milestone amount: ₹${contractData.budget}`}
          </>
        ) : (
          <>
            {!isOverdue &&
              Number(amount) === contractData.budget &&
              `✓ Amount matches: ₹${contractData.budget}`}
            {!isOverdue &&
              Number(amount) !== contractData.budget &&
              `⚠️ Contract amount: ₹${contractData.budget}`}
            {isOverdue &&
              Number(amount) === contractData.budget &&
              `Original budget: ₹${contractData.budget} (no deduction)`}
            {isOverdue &&
              Number(amount) < contractData.budget &&
              `✓ Deducted amount: ₹${(contractData.budget - Number(amount)).toFixed(2)}`}
            {isOverdue &&
              Number(amount) > contractData.budget &&
              `⚠️ Cannot exceed original budget: ₹${contractData.budget}`}
          </>
        )}
      </p>
      {isOverdue && (
        <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 mt-1">
          You can enter any amount up to ₹{contractData.budget}. The difference will be
          considered a penalty for late submission.
        </p>
      )}
    </>
  )}

  {!contractData && walletData.balance > 0 && (
    <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 mt-1">
      Available: ₹{walletData.balance.toFixed(2)}
    </p>
  )}
</div>

                    {paymentStep === 2 && (
                      <div className="bg-blue-50 p-2.5 sm:p-3 md:p-4 rounded-xl border border-blue-200">
                        <p className="text-[11px] sm:text-xs md:text-sm text-blue-800 font-medium break-words">
                          Transfer ₹{amount} to {email}
                        </p>
                        {contractData && (
                          <>
                            <p className="text-[9px] sm:text-[10px] md:text-xs text-blue-600 mt-1">
                              Contract #{contractData.contractId}
                            </p>
                            {contractData.isMilestonePayment && (
                              <p className="text-[9px] sm:text-[10px] md:text-xs text-blue-600 mt-1">
                                Milestone #
                                {(contractData.milestoneIndex || 0) + 1} Payment
                              </p>
                            )}
                            {isOverdue &&
                              Number(amount) < contractData.budget && (
                                <p className="text-[9px] sm:text-[10px] md:text-xs text-red-600 mt-1 font-medium">
                                  Penalty deduction: ₹
                                  {(
                                    contractData.budget - Number(amount)
                                  ).toFixed(2)}
                                </p>
                              )}
                            <p className="text-[9px] sm:text-[10px] md:text-xs text-blue-600 font-medium mt-1">
                              {contractData.isMilestonePayment
                                ? "⚡ Milestone will be marked as PAID after successful payment"
                                : "⚡ Contract will be marked as COMPLETED after successful payment"}
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {formError && (
                    <div className="mt-3 p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-[11px] sm:text-xs md:text-sm break-words">
                        {formError}
                      </p>
                    </div>
                  )}
                </div>

                {/* Fixed footer */}
                <div className="p-3 sm:p-4 md:p-6 pt-2 sm:pt-3 md:pt-0 flex-shrink-0">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={handleCloseModal}
                      className="w-full sm:flex-1 py-2 sm:py-2.5 md:py-3 rounded-xl text-gray-700 font-medium bg-gray-100 !border-2 !border-gray-400 hover:bg-gray-200 transition-colors text-[11px] sm:text-xs md:text-sm lg:text-base order-2 sm:order-1"
                    >
                      Cancel
                    </button>
                    {paymentStep === 1 ? (
                      <button
                        onClick={handleVerifyAndContinue}
                        disabled={verifyingCollaborator || !email.trim() || !amount || Number(amount) <= 0 || Number(amount) > walletData.balance}
                        className="w-full sm:flex-1 py-2 sm:py-2.5 md:py-3 rounded-xl text-white font-medium bg-gradient-to-r from-[#51218F] to-black hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-[11px] sm:text-xs md:text-sm lg:text-base order-1 sm:order-2"
                      >
                        {verifyingCollaborator ? (
                          <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Verifying...
                          </span>
                        ) : (
                          "Verify Email & Continue"
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={handleConfirmTransfer}
                        disabled={
                          !amount || Number(amount) <= 0 || paymentProcessing
                        }
                        className="w-full sm:flex-1 py-2 sm:py-2.5 md:py-3 rounded-xl text-white font-medium bg-gradient-to-r from-[#51218F] to-black hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-[11px] sm:text-xs md:text-sm lg:text-base order-1 sm:order-2"
                      >
                        {paymentProcessing ? (
                          <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                          </span>
                        ) : (
                          `Confirm & Pay ₹${amount}`
                        )}
                      </button>
                    )}
                  </div>
                  <p className="text-[8px] sm:text-[9px] md:text-[10px] text-gray-500 mt-3 sm:mt-4 text-center leading-relaxed">
                    By proceeding, you authorize us to transfer funds to the
                    specified collaborator. All transfers are final and secure.
                    <br />
                    Email verification is required before each transfer.
                  </p>
                </div>
              </>
            )}
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
                        {userData?.email || "Not set"}
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
                    value={emailForVerification}
                    onChange={(e) => setEmailForVerification(e.target.value.toLowerCase())}
                    placeholder={userData?.email || "Enter your Gmail address"}
                    disabled={isVerifying}
                    className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border ${isValidGmail(emailForVerification) ? "border-gray-300" : "border-red-300"} rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-[#3D1768] focus:border-[#3D1768] outline-none transition-all text-[#030303] poppins-font placeholder:text-[#030303]/50 ${isVerifying ? "opacity-50 cursor-not-allowed" : ""}`}
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2 md:mt-3">
                    <p className="text-[10px] sm:text-sm text-[#030303]/70 poppins-font">
                      {isValidGmail(emailForVerification)
                        ? "We'll send a 6-digit verification code to this email"
                        : "Please enter a valid Gmail address (@gmail.com)"}
                    </p>
                    {emailForVerification && !isValidGmail(emailForVerification) && (
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

                  {emailForVerification &&
                    userData?.email &&
                    emailForVerification.toLowerCase() !== userData.email.toLowerCase() && (
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
                    !isValidGmail(emailForVerification) ||
                    isVerifying ||
                    (userData?.email &&
                      emailForVerification.toLowerCase() !== userData.email.toLowerCase())
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
                Proceeding to collaborator verification...
              </p>
            </div>
          </div>
        </>
      )}

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scroll {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
        .custom-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}