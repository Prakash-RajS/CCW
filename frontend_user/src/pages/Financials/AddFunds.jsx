import React, { useState, useEffect, useRef } from "react";
import { useUser } from "../../contexts/UserContext";
import api from "../../utils/axiosConfig";
import toast from "../../component/Toast";

export default function AddFunds({ onWalletSelect }) {
  const { userData, loading: userLoading, refreshUser } = useUser();
  const [depositAmount, setDepositAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSummaryTable, setShowSummaryTable] = useState(false);
  const [cashfreeReady, setCashfreeReady] = useState(false);
  const cashfreeInitialized = useRef(false);

  // Amount validation error
  const [amountError, setAmountError] = useState("");
  const MAX_AMOUNT = 100000; // ₹1,00,000

  // Email verification states (reused from Home)
  const [showEmailSetupPopup, setShowEmailSetupPopup] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [showOTPPopup, setShowOTPPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTime, setResendTime] = useState(45);
  const [rateLimitError, setRateLimitError] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [cooldownToken, setCooldownToken] = useState("");
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  const platformFee = 0;
  const transactionFee = 0;
  const totalToPay = (Number(depositAmount) || 0) + platformFee + transactionFee;

  const addFundsSummary = [
    { label: "Amount to Deposit", value: `₹${(Number(depositAmount) || 0).toFixed(2)}` },
    { label: "Payment Method", value: "Cashfree (UPI/Card/NetBanking)" },
    { label: "Platform Fee", value: "₹0.00" },
    { label: "Transaction Fee", value: "₹0.00" },
    { label: "Total to pay", value: `₹${totalToPay.toFixed(2)}` },
  ];

  // Helper: does user have a phone number?
  const hasPhone = userData && (userData.phone || userData.mobile || userData.phone_number);
  // Helper: does user have an email?
  const hasEmail = userData && userData.email && userData.email.trim() !== "";

  // Load Cashfree script once
  useEffect(() => {
    if (cashfreeInitialized.current) return;
    const loadCashfreeScript = () => {
      return new Promise((resolve) => {
        if (window.Cashfree) {
          resolve(true);
          return;
        }
        const script = document.createElement("script");
        script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };
    loadCashfreeScript().then((loaded) => {
      setCashfreeReady(loaded);
      cashfreeInitialized.current = true;
      if (!loaded) {
        toast.error("Payment gateway failed to load", "Please refresh the page and try again.");
      }
    });
  }, []);

  useEffect(() => {
    setShowSummaryTable(!!(depositAmount && Number(depositAmount) > 0 && !amountError));
  }, [depositAmount, amountError]);

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

  // Auto-close success popup after 3 seconds
  useEffect(() => {
    let timer;
    if (showSuccessPopup) {
      timer = setTimeout(() => setShowSuccessPopup(false), 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showSuccessPopup]);

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

  // ---------- Email Verification Flow (same as Home) ----------
  const startVerificationFlow = () => {
    if (!hasEmail) {
      setShowEmailSetupPopup(true);
    } else {
      setEmail(userData.email);
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
        setEmail(newEmail);
        setShowEmailSetupPopup(false);
        toast.success("Email added successfully!");
        if (refreshUser) await refreshUser();
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
        { email: email, otp_code: otpString }
      );
      if (response.data.status === "success") {
        setShowOTPPopup(false);
        setShowSuccessPopup(true);
        setOtp(["", "", "", "", "", ""]);
        setResendTime(45);
        setOtpToken("");
        setCooldownToken("");
        toast.success("Email verified successfully!");
        // After successful verification, proceed to add funds
        setTimeout(() => {
          handleAddFunds();
        }, 1500);
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

  // ---------- Main flow: always verify email first ----------
  const handleProceedToPayment = () => {
    if (userLoading || !userData) {
      toast.error("User data not ready", "Please wait a moment and try again.");
      return;
    }
    // Re-validate amount before proceeding (safety)
    const amountNum = Number(depositAmount);
    if (amountError) {
      toast.error(amountError);
      return;
    }
    if (/^0\d+/.test(depositAmount)) {
      toast.error("Invalid amount", "Amount cannot start with zero.");
      return;
    }
    if (!depositAmount || isNaN(amountNum) || amountNum <= 0) {
      toast.error("Invalid amount", "Please enter a valid deposit amount.");
      return;
    }
    if (amountNum < 1) {
      toast.error("Minimum amount is ₹1.00", "Please enter an amount of ₹1 or more.");
      return;
    }
    if (amountNum > MAX_AMOUNT) {
      toast.error(`Maximum amount is ₹${MAX_AMOUNT.toLocaleString()}`, `Please enter an amount up to ₹${MAX_AMOUNT.toLocaleString()}.`);
      return;
    }
    // Phone number is still required
    if (!hasPhone) {
      toast.error(
        "Phone Number Required",
        "Please update your profile with a valid phone number before adding funds to your wallet."
      );
      return;
    }
    // Start email verification flow
    startVerificationFlow();
  };

  // Actual fund addition after successful email verification
  const handleAddFunds = async () => {
    toast.dismissAll();

    if (!cashfreeReady && !window.Cashfree) {
      toast.error("Payment gateway loading", "Please wait a moment and try again.");
      return;
    }

    setIsLoading(true);

    try {
      sessionStorage.setItem("pendingWalletAmount", depositAmount);
      sessionStorage.setItem("pendingWalletUserId", userData.id);

      const formData = new FormData();
      formData.append("user_id", userData.id);
      formData.append("amount", depositAmount);
      formData.append("user_phone", userData.phone || userData.mobile || userData.phone_number || "");
      formData.append("user_email", userData.email || "");

      const response = await api.post("/wallet/add-funds", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { payment_session_id, cashfree_env } = response.data;

      if (!payment_session_id) {
        throw new Error("Invalid Cashfree response");
      }

      const cashfree = window.Cashfree({
        mode: cashfree_env === "production" ? "production" : "sandbox",
      });

      const checkoutOptions = {
        paymentSessionId: payment_session_id,
        redirectTarget: "_self",
      };

      cashfree.checkout(checkoutOptions).then((result) => {
        if (result.error) {
          console.error("Cashfree error:", result.error);
          let errorMessage = "Payment failed";
          let errorDetails = "Please try again or contact support.";
          if (result.error.message) {
            if (result.error.message.includes("customer_phone_missing")) {
              errorMessage = "Phone Number Required";
              errorDetails = "Please update your profile with a valid phone number before adding funds.";
            } else if (result.error.message.includes("customer_did_not_match")) {
              errorMessage = "Customer Information Mismatch";
              errorDetails = "Please verify your contact details in profile settings.";
            } else {
              errorMessage = result.error.message;
            }
          }
          toast.error(errorMessage, errorDetails);
          setIsLoading(false);
          sessionStorage.removeItem("pendingWalletAmount");
          sessionStorage.removeItem("pendingWalletUserId");
        }
        if (result.redirect) {
          console.log("Redirecting to payment page...");
        }
        if (result.paymentDetails) {
          toast.success("Payment Successful", `₹${depositAmount} has been added to your wallet.`);
          setIsLoading(false);
          sessionStorage.removeItem("pendingWalletAmount");
          sessionStorage.removeItem("pendingWalletUserId");
        }
      }).catch((error) => {
        console.error("Cashfree checkout error:", error);
        toast.error("Payment Error", "Unable to process payment. Please try again.");
        setIsLoading(false);
        sessionStorage.removeItem("pendingWalletAmount");
        sessionStorage.removeItem("pendingWalletUserId");
      });
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || "Failed to process payment";
      toast.error("Payment Failed", errorMessage);
      setIsLoading(false);
      sessionStorage.removeItem("pendingWalletAmount");
      sessionStorage.removeItem("pendingWalletUserId");
    }
  };

  if (userLoading) {
    return (
      <div className="font-['Montserrat'] text-center py-8">
        <div className="inline-block w-8 h-8 border-4 border-[#51218F] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-gray-600">Loading user data...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="font-['Montserrat'] text-center py-8 text-red-500">
        <p>Unable to load user data. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="font-['Montserrat']">
      <h2 className="font-semibold text-[16px] md:text-[24px]">Add Funds to Your Wallet</h2>
      <p className="mt-0.5 md:mt-1 font-medium text-[12px] md:text-[16px] text-black">
        Enter the amount you want to add to your wallet. You'll be redirected to Cashfree for secure payment.
      </p>

      <div className="w-full h-[1px] bg-black/10 my-2 md:my-3"></div>

      <h3 className="font-semibold text-[16px] md:text-[24px] mb-1.5 md:mb-4">Enter Amount</h3>

      <label className="block font-medium text-[12px] md:text-[16px] mb-1 md:mb-2">Amount (INR)</label>

      {/* Input wrapper with guaranteed border */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "240px",
          height: "48px",
          border: "2px solid #9ca3af",
          borderRadius: "6px",
          overflow: "hidden",
          boxSizing: "border-box",
          backgroundColor: "#ffffff",
        }}
        className="w-[200px] md:w-[240px] h-[36px] md:h-[48px]"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            padding: "0 12px",
            borderRight: "2px solid #9ca3af",
            backgroundColor: "#f3f4f6",
            fontWeight: "600",
            fontSize: "16px",
            color: "#111827",
            flexShrink: 0,
            userSelect: "none",
          }}
        >
          ₹
        </div>

        <input
          placeholder="Enter amount"
          type="text"
          inputMode="decimal"
          value={depositAmount}
          disabled={isLoading}
          onWheel={(e) => e.target.blur()}
          onKeyDown={(e) => {
            if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
            const allowed = [
              "Backspace", "Delete", "Tab", "Enter", "Escape",
              "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", ".",
            ];
            if (!allowed.includes(e.key) && !/^[0-9]$/.test(e.key)) e.preventDefault();
            if (e.key === "." && depositAmount?.includes(".")) e.preventDefault();
          }}
          onChange={(e) => {
            let value = e.target.value;
            // Remove non-numeric except decimal
            value = value.replace(/[^0-9.]/g, "");
            // Prevent leading zeros
            if (value === "0") return;
            if (/^0\d+/.test(value)) return;
            // Allow only one decimal point
            const parts = value.split(".");
            if (parts.length > 2) return;
            // Limit to 2 decimal places
            if (parts[1] && parts[1].length > 2) {
              value = parts[0] + "." + parts[1].slice(0, 2);
            }
            setDepositAmount(value);

            // --- Validation logic ---
            const num = Number(value);
            if (value === "") {
              setAmountError("");
              return;
            }
            if (isNaN(num) || num <= 0) {
              setAmountError("Please enter a valid positive amount.");
              return;
            }
            if (/^0\d+/.test(value)) {
              setAmountError("Amount cannot start with zero.");
              return;
            }
            if (value.includes(".")) {
              const decimalPart = value.split(".")[1];
              if (decimalPart && decimalPart.length > 2) {
                setAmountError("Only 2 decimal places are allowed.");
                return;
              }
            }
            if (num > MAX_AMOUNT) {
              setAmountError(`Maximum amount is ₹${MAX_AMOUNT.toLocaleString()}.`);
              return;
            }
            // All valid
            setAmountError("");
          }}
          style={{
            flex: 1,
            height: "100%",
            padding: "0 12px",
            outline: "none",
            border: "none",
            background: "transparent",
            fontFamily: "Montserrat, sans-serif",
            fontWeight: "500",
            fontSize: "15px",
            color: "#111827",
          }}
          className={`placeholder-gray-400 disabled:bg-gray-100 ${amountError ? "border-red-500" : ""}`}
        />
      </div>

      {/* Warning message below input */}
      {amountError && (
        <div className="mt-1 text-red-500 text-sm font-medium">
          ⚠️ {amountError}
        </div>
      )}

      {/* Warning if phone number is missing (still required) */}
      {!hasPhone && (
        <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-yellow-600 text-lg">⚠️</span>
            <div className="flex-1">
              <p className="text-yellow-800 text-sm font-medium">Phone number missing</p>
              <p className="text-yellow-700 text-xs mt-1">
                Please add your phone number in your profile before adding funds.
              </p>
              <button
                onClick={() => window.location.href = "/creator-edit-profile"}
                className="mt-3 px-3 py-1.5 bg-white text-yellow-800 border border-yellow-300 rounded-lg text-xs font-medium hover:bg-yellow-100 transition"
              >
                Update Profile →
              </button>
            </div>
          </div>
        </div>
      )}

      {showSummaryTable && (
        <div className="mt-6 md:mt-8 w-full md:max-w-[520px]">
          <h3 className="font-semibold text-[16px] md:text-[20px] mb-3">Payment Summary</h3>
          <table className="w-full border border-[#d9d9d9] rounded-lg overflow-hidden">
            <thead>
              <tr className="border-b border-[#d9d9d9] bg-gradient-to-r from-[#51218F] to-black text-white">
                <th className="px-2 py-1.5 md:px-4 md:py-3 text-left font-semibold text-[12px] md:text-[16px] border-r border-white/20">
                  Field
                </th>
                <th className="px-2 py-1.5 md:px-4 md:py-3 text-left font-semibold text-[12px] md:text-[16px]">
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              {addFundsSummary.map((row, idx) => (
                <tr key={idx} className="border-t border-[#d9d9d9]">
                  <td className="px-2 py-1.5 md:px-4 md:py-3 font-medium text-[11px] md:text-[14px] border-r border-[#d9d9d9] bg-gray-50">
                    {row.label}
                  </td>
                  <td className="px-2 py-1.5 md:px-4 md:py-3 font-medium text-[11px] md:text-[14px]">
                    {row.value}
                  </td>
                 </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!cashfreeReady && !window.Cashfree && (
        <p className="text-yellow-600 text-sm mt-2">⏳ Loading payment gateway...</p>
      )}

      <button
        onClick={handleProceedToPayment}
        disabled={isLoading || !cashfreeReady || userLoading || !hasPhone || !!amountError}
        className="mt-6 px-6 py-3 bg-gradient-to-r from-[#51218F] to-black text-white rounded-[10px] font-semibold text-[14px] md:text-[16px] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Processing..." : "Proceed to Payment"}
      </button>

      <div className="mt-4 text-sm text-gray-600">
        <p>You'll be redirected to Cashfree's secure payment page.</p>
        <p className="mt-1">Minimum amount: ₹1.00</p>
        <p className="mt-1 text-green-600">✓ Supports UPI, Credit/Debit Cards, NetBanking</p>
        <p className="mt-1 text-amber-600">⚠️ Email verification is required before every payment.</p>
      </div>

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
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                    placeholder={userData?.email || "Enter your Gmail address"}
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
                    userData?.email &&
                    email.toLowerCase() !== userData.email.toLowerCase() && (
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
                    (userData?.email &&
                      email.toLowerCase() !== userData.email.toLowerCase())
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
                            className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:rotate-12"
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

      {/* ========== SUCCESS POPUP ========== */}
      {showSuccessPopup && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99998]"
            onClick={() => setShowSuccessPopup(false)}
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
                onClick={() => setShowSuccessPopup(false)}
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
                Closing automatically...
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}