import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "../../component/Toast";
import api from "../../utils/axiosConfig";
import SignupSideBg from "../../assets/Auth/SignupSideBg.png";

const OtpRequest = () => {
  const otpRefs = useRef([]);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(60); // ✅ 60 seconds cooldown
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Get data from navigation state
  const email = location.state?.email;
  const otpToken = location.state?.otpToken; // ✅ For forgot password
  const signupOtpToken = location.state?.signupOtpToken; // ✅ For signup (if different)
  const isForgotPassword = location.state?.isForgotPassword || false;
  const isSignup = location.state?.isSignup || false;
  
  // Additional signup data
  const phone = location.state?.phone;
  const password = location.state?.password;
  
  // ✅ Store cooldown token for rate limiting
  const [cooldownToken, setCooldownToken] = useState(null);

  // ✅ Use the appropriate token based on flow
  const [currentOtpToken, setCurrentOtpToken] = useState(
    isForgotPassword ? otpToken : signupOtpToken
  );

  // ❌ Prevent direct access - validate required data
  useEffect(() => {
    if (!email) {
      toast.error("Error", "Email missing. Please try again.");
      navigate("/forgot-password");
      return;
    }
    
    if (!currentOtpToken) {
      toast.error("Session Expired", "Session expired. Please request a new OTP.");
      navigate(isForgotPassword ? "/forgot-password" : "/signupac");
      return;
    }
  }, [email, currentOtpToken, navigate, isForgotPassword]);

  // ---------------------------
  // Countdown Timer
  // ---------------------------
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // ---------------------------
  // Verify OTP
  // ---------------------------
  const handleVerify = async () => {
    if (otp.some((v) => v.trim() === "")) {
      toast.error("Invalid OTP", "Please enter all 6 digits!");
      return;
    }

    const finalOTP = otp.join("");

    try {
      setLoading(true);
      const loadingToastId = toast.loading("Verifying OTP...");

      if (isForgotPassword) {
        // ✅ FORGOT PASSWORD FLOW
        const verifyResponse = await api.post(
          "/auth/forgot-password/verify-otp",
          null,
          {
            params: {
              email,
              otp: parseInt(finalOTP),
              otp_token: currentOtpToken, // ✅ Send otp_token
            },
          }
        );

        // ✅ Get reset_token from response
        const resetToken = verifyResponse.data.reset_token;

        toast.dismiss(loadingToastId);
        toast.success("OTP Verified!", "OTP verified successfully!");

        // Navigate to reset password with reset_token
        setTimeout(() => {
          toast.dismiss();
          navigate("/reset-password", {
            state: { 
              email,
              resetToken, // ✅ Pass reset_token for password reset
            },
          });
        }, 1000);
        
      } else if (isSignup) {
        // ✅ SIGNUP FLOW
        const verifyResponse = await api.post(
          "/auth/signup/verify-otp",
          null,
          {
            params: {
              email,
              otp: parseInt(finalOTP),
              otp_token: currentOtpToken, // ✅ Send otp_token
            },
          }
        );

        // ✅ Get signup_token from response
        const signupToken = verifyResponse.data.signup_token;

        toast.dismiss(loadingToastId);
        const signupLoadingId = toast.loading("Creating your account...");

        // ✅ Create account with signup_token
        const signupResponse = await api.post("/auth/signup", null, {
          params: {
            email,
            phone,
            password,
            signup_token: signupToken, // ✅ Send signup_token
          },
        });

        toast.dismiss(signupLoadingId);
        toast.success("Account Created!", "Your account has been created successfully!");

        const role = signupResponse.data?.role || "";
        
        setTimeout(() => {
          toast.dismiss();
          const roleLower = role.trim().toLowerCase();
          if (!roleLower) {
            navigate("/role-section", { replace: true });
          } else if (roleLower === "creator") {
            navigate("/home", { replace: true });
          } else if (roleLower === "collaborator") {
            navigate("/col-home", { replace: true });
          } else {
            navigate("/role-section", { replace: true });
          }
        }, 1500);
      }

    } catch (error) {
      toast.dismiss();
      
      const errorMessage = error?.response?.data?.detail || "Invalid or expired OTP";
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        const msg = errorMessage.toLowerCase();
        if (msg.includes("expired")) {
          toast.error("OTP Expired", "OTP has expired. Please request a new one.");
        } else if (msg.includes("invalid") || msg.includes("wrong")) {
          toast.error("Invalid OTP", "Invalid OTP. Please check and try again.");
        } else {
          toast.error("Error", errorMessage);
        }
      } else {
        toast.error("Error", errorMessage);
      }
      
      // Clear OTP inputs on error
      setOtp(Array(6).fill(""));
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Resend OTP
  // ---------------------------
  const handleResendOtp = async () => {
    if (timeLeft > 0) return;

    setResendLoading(true);
    const loadingToastId = toast.loading("Resending OTP...");

    try {
      let response;
      
      if (isForgotPassword) {
        // ✅ Forgot password resend
        response = await api.post(
          "/auth/forgot-password/resend-otp",
          null,
          {
            params: { 
              email,
              cooldown_token: cooldownToken
            },
          }
        );
        
        // ✅ CRITICAL: Update the OTP token with the new one from resend
        if (response?.data?.otp_token) {
          setCurrentOtpToken(response.data.otp_token);
          console.log("✅ Updated OTP token after resend");
        }
        
      } else if (isSignup) {
        // ✅ Signup resend
        response = await api.post(
          "/auth/signup/resend-otp",
          null,
          {
            params: { 
              email,
              cooldown_token: cooldownToken
            },
          }
        );
        
        // ✅ CRITICAL: Update the OTP token with the new one from resend
        if (response?.data?.otp_token) {
          setCurrentOtpToken(response.data.otp_token);
          console.log("✅ Updated OTP token after resend");
        }
      }

      toast.dismiss(loadingToastId);
      toast.success("OTP Resent!", "OTP has been resent successfully!");
      
      // ✅ Store new cooldown token
      if (response?.data?.cooldown_token) {
        setCooldownToken(response.data.cooldown_token);
      }
      
      setTimeLeft(60); // Reset timer to 60 seconds
      setOtp(Array(6).fill(""));
      otpRefs.current[0]?.focus();

    } catch (error) {
      toast.dismiss(loadingToastId);
      
      const errorMessage = error?.response?.data?.detail || "Please wait before resending OTP";
      
      // Handle rate limiting error
      if (error.response?.status === 429) {
        toast.error("Too Many Requests", errorMessage);
        const waitTimeMatch = errorMessage.match(/\d+/);
        if (waitTimeMatch) {
          setTimeLeft(parseInt(waitTimeMatch[0]));
        }
      } else {
        toast.error("Error", errorMessage);
      }
    } finally {
      setResendLoading(false);
    }
  };

  // ---------------------------
  // OTP Input Handling
  // ---------------------------
  const handleInput = (index, e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste functionality
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length; i++) {
      if (i < 6) {
        newOtp[i] = pastedData[i];
      }
    }
    
    setOtp(newOtp);
    
    // Focus on next empty input or last input
    const nextIndex = Math.min(pastedData.length, 5);
    otpRefs.current[nextIndex]?.focus();
  };

  // Focus first input on mount
  useEffect(() => {
    otpRefs.current[0]?.focus();
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Background */}
      <img
        src={SignupSideBg}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="relative w-screen h-screen flex justify-center items-center p-4">
        <div className="relative w-full max-w-[500px] rounded-[28px] border-[1.5px] border-white bg-white/70 shadow-[0_0_10px_0_#FFFFFF] flex flex-col items-center justify-center p-6 sm:p-8 md:p-10">
          {/* Back Button */}
          <button
            onClick={() => {
              toast.dismiss();
              navigate(isForgotPassword ? "/forgot-password" : "/signupac");
            }}
            className="absolute top-4 left-4 sm:top-6 sm:left-6 
            flex items-center justify-center 
            w-8 h-8 sm:w-9 sm:h-9 rounded-full 
            bg-gradient-to-b from-[rgba(3,3,3,0.9)] to-[rgba(81,33,143,0.9)]
            border border-[#8A38F533]
            shadow-md transition-all duration-200 group cursor-pointer
            hover:scale-105 active:scale-95"
            aria-label="Go back"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-white group-hover:scale-110 transition-transform duration-200" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2.5} 
                d="M19 12H5M12 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Content */}
          <div className="w-full max-w-[400px] text-center mt-4 sm:mt-0">
            <h1 className="text-[24px] sm:text-[28px] md:text-[32px] font-[500] poppins-font text-[#333333] mb-2">
              Enter OTP
            </h1>

            <p className="text-[13px] sm:text-[14px] md:text-[15px] font-[400] poppins-font text-[#3D1768] mb-8 px-4 break-words">
              We've sent a 6-digit OTP to <b>{email}</b>. Please enter it below.
            </p>

            {/* OTP Inputs */}
            <div className="flex justify-center gap-1.5 sm:gap-2 md:gap-3 mb-8 px-2">
              {otp.map((value, i) => (
                <div key={i} className="relative flex flex-col items-center">
                  <input
                    ref={(el) => (otpRefs.current[i] = el)}
                    value={value}
                    onChange={(e) => handleInput(i, e)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    maxLength={1}
                    disabled={loading || resendLoading}
                    className="
                      w-[32px] min-[360px]:w-[36px] sm:w-[44px] md:w-[48px] 
                      h-[44px] min-[360px]:h-[48px] sm:h-[54px] md:h-[58px] 
                      text-center text-lg min-[360px]:text-xl sm:text-2xl md:text-3xl font-bold
                      bg-transparent outline-none
                      disabled:opacity-50
                      text-[#030303]
                      pb-1 min-[360px]:pb-2
                    "
                  />
                  {/* Bottom line - responsive width */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-1 min-[360px]:bottom-2 h-[2px] w-[24px] min-[360px]:w-[28px] sm:w-[34px] md:w-[38px] bg-[#3D1768] rounded-full" />
                </div>
              ))}
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={loading || resendLoading || otp.some(v => !v)}
              className="
                group relative overflow-hidden
                w-full h-[44px] sm:h-[48px] 
                rounded-[35px] 
                bg-gradient-to-r from-[#3D1768] to-[#030303] 
                text-white text-[14px] sm:text-[15px] font-medium poppins-font
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:opacity-90 transition-all duration-300
                cursor-pointer
              "
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </div>
              ) : (
                "Verify OTP"
              )}
            </button>

            {/* Resend */}
            <p className="mt-6 text-[12px] sm:text-[13px] poppins-font text-[#030303]">
              Didn't receive the code?{" "}
              {timeLeft > 0 ? (
                <>Resend in <b className="text-[#C22CA2]">{formatTime()}</b></>
              ) : (
                <button
                  onClick={handleResendOtp}
                  disabled={resendLoading}
                  className="text-[#C22CA2] font-bold hover:underline disabled:opacity-50 cursor-pointer"
                >
                  {resendLoading ? "Resending..." : "Resend OTP"}
                </button>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpRequest;