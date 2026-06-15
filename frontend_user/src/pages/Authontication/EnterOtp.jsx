import { useEffect, useRef, useState } from "react";
import toast from "../../component/Toast";
import SignupSideBg from "../../assets/Auth/SignupSideBg.png";

const EnterOtp = () => {
  const otpRefs = useRef([]);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(45); // 45 seconds starting
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) return; // Stop at zero

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer); // cleanup
  }, [timeLeft]);

  // Format MM:SS
  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // ---------------------------
  // Handle Verify Button
  // ---------------------------
  const handleVerify = async () => {
    if (otp.some((v) => v.trim() === "")) {
      toast.error("Invalid OTP", "Please enter all 6 digits!");
      return;
    }

    const finalOTP = otp.join("");
    
    setIsVerifying(true);
    const loadingToastId = toast.loading("Verifying OTP...");

    // Simulate verification (replace with actual API call)
    setTimeout(() => {
      toast.dismiss(loadingToastId);
      toast.success("OTP Verified!", `OTP Verified Successfully!`);
      setIsVerifying(false);
    }, 1500);
  };

  // ---------------------------
  // Handle Resend OTP
  // ---------------------------
  const handleResendOtp = () => {
    if (timeLeft > 0) return;
    
    setTimeLeft(45);
    setOtp(Array(6).fill(""));
    otpRefs.current[0]?.focus();
    toast.success("OTP Resent!", "A new OTP has been sent to your email.");
  };

  // ---------------------------
  // Handle OTP Box Typing
  // ---------------------------
  const handleInput = (index, e) => {
    let value = e.target.value.replace(/[^0-9]/g, "");

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // ---------------------------
  // Handle Backspace
  // ---------------------------
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
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

      {/* Main Card */}
      <div className="relative w-screen h-screen flex justify-center items-center p-4">
        <div className="relative w-full max-w-[580px] rounded-[28px] border-[1.5px] border-white bg-white/70 shadow-[0_0_10px_0_#FFFFFF] flex flex-col items-center justify-center p-6 sm:p-8">

          {/* Back Button */}
          <button
            onClick={() => {
              toast.dismiss();
              window.location.href = "/";
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
          <div className="w-full max-w-[500px] text-center mt-4 sm:mt-0">
            <h1 className="text-[24px] sm:text-[28px] md:text-[32px] font-[500] poppins-font text-[#333333] mb-2">
              Enter OTP
            </h1>
            
            <p className="text-[13px] sm:text-[14px] md:text-[15px] font-[400] poppins-font text-[#3D1768] mb-8 px-4">
              We've sent a 6-digit OTP to your email. Please enter it below to continue.
            </p>

            {/* OTP Inputs */}
            <div className="flex justify-center gap-2 sm:gap-3 mb-8">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="relative">
                    <input
                      ref={(el) => (otpRefs.current[i] = el)}
                      value={otp[i]}
                      onChange={(e) => handleInput(i, e)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      onPaste={i === 0 ? handlePaste : undefined}
                      maxLength={1}
                      disabled={isVerifying}
                      className="
                        w-[42px] sm:w-[48px] md:w-[52px] 
                        h-[50px] sm:h-[56px] md:h-[60px] 
                        text-center text-xl sm:text-2xl md:text-3xl font-bold
                        text-[#030303]
                        bg-transparent outline-none
                        disabled:opacity-50
                      "
                    />
                    {/* Underline centered */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-1 h-[2px] w-[40px] sm:w-[46px] md:w-[50px] bg-[#3D1768] rounded-full" />
                  </div>
                ))}
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={isVerifying || otp.some(v => !v)}
              type="button"
              className="
                group relative overflow-hidden
                w-full max-w-[500px] 
                h-[44px] sm:h-[48px]
                rounded-[35px] 
                bg-gradient-to-r from-[#3D1768] to-[#030303]
                text-white text-[14px] sm:text-[15px] font-medium poppins-font
                shadow-lg
                hover:opacity-90 transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed
                cursor-pointer
                flex items-center justify-center
              "
            >
              {isVerifying ? (
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
                <>
                  Resend in{" "}
                  <span className="font-bold text-[#C22CA2]">
                    {formatTime()}
                  </span>
                </>
              ) : (
                <button
                  onClick={handleResendOtp}
                  className="text-[#C22CA2] font-bold hover:underline cursor-pointer"
                >
                  Resend OTP
                </button>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterOtp;