import React, { useState, useEffect, useRef } from "react";
import toast from "../../component/Toast";
import SignupSideBg from "../../assets/Auth/SignupSideBg.png";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../utils/axiosConfig";
import { useUser } from "../../contexts/UserContext";

const SignupOtp = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // ✅ FIX: Use fetchUserData to populate context after cookies are set
    const { fetchUserData } = useUser();

    const email = location.state?.email || "";
    const phone = location.state?.phone || "";
    const password = location.state?.password || "";
    const initialOtpToken = location.state?.otpToken || "";  // ✅ Get otp_token from state
    
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [scale, setScale] = useState(1);
    
    // ✅ Store OTP token and update it when resending
    const [otpToken, setOtpToken] = useState(initialOtpToken);
    
    // ✅ Store cooldown token for rate limiting
    const [cooldownToken, setCooldownToken] = useState(null);

    const inputRefs = useRef([]);
    const autoSubmitTriggered = useRef(false);

    // ------------ AUTO SCALE ---------------
    useEffect(() => {
        const updateScale = () => {
            const height = window.innerHeight;
            if (height < 700) {
                setScale(Math.max(height / 900, 0.75));
            } else {
                setScale(1);
            }
        };
        updateScale();
        window.addEventListener("resize", updateScale);
        return () => window.removeEventListener("resize", updateScale);
    }, []);

    // ------------ DISABLE SCROLLING ---------------
    useEffect(() => {
        // Save original overflow
        const originalOverflow = document.body.style.overflow;
        // Disable scrolling
        document.body.style.overflow = "hidden";
        
        // Restore on unmount
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    // ------------ REDIRECT IF NO EMAIL OR OTP TOKEN ---------------
    useEffect(() => {
        if (!email || !otpToken) {
            toast.error("Session Expired", "Please try again.");
            navigate("/signup");
        }
    }, [email, otpToken, navigate]);

    // ------------ TIMER ---------------
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Focus first input on mount
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    // Auto-submit when all 6 digits are entered
    useEffect(() => {
        const allDigitsFilled = otp.every(digit => digit !== "");
        if (allDigitsFilled && !isVerifying && !autoSubmitTriggered.current) {
            autoSubmitTriggered.current = true;
            handleVerifyOtp();
        } else if (!allDigitsFilled) {
            autoSubmitTriggered.current = false;
        }
    }, [otp]);

    // Handle OTP input change
    const handleOtpChange = (index, value) => {
        if (value && !/^\d+$/.test(value)) return;

        if (value.length > 1) {
            // Handle paste
            const pastedValue = value.slice(0, 6).split("");
            const newOtp = [...otp];
            pastedValue.forEach((char, i) => {
                if (i < 6) newOtp[i] = char;
            });
            setOtp(newOtp);
            const lastFilledIndex = Math.min(pastedValue.length - 1, 5);
            if (inputRefs.current[lastFilledIndex + 1]) {
                inputRefs.current[lastFilledIndex + 1].focus();
            }
        } else {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
            if (value && index < 5 && inputRefs.current[index + 1]) {
                inputRefs.current[index + 1].focus();
            }
        }
    };

    // Handle backspace
    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace") {
            if (!otp[index] && index > 0) {
                inputRefs.current[index - 1].focus();
            } else if (otp[index]) {
                const newOtp = [...otp];
                newOtp[index] = "";
                setOtp(newOtp);
            }
        }
    };

    const handleVerifyOtp = async () => {
        const otpValue = otp.join("");

        if (otpValue.length !== 6) {
            toast.error("Invalid OTP", "Please enter complete 6-digit OTP");
            return;
        }

        setIsVerifying(true);
        const loadingToastId = toast.loading("Verifying OTP...");

        try {
            // ✅ STATELESS OTP: Send CURRENT otp_token with verification request
            const verifyResponse = await api.post("/auth/signup/verify-otp", null, {
                params: {
                    email: email,
                    otp: parseInt(otpValue),
                    otp_token: otpToken  // ✅ Send CURRENT otp_token
                }
            });

            // ✅ Get signup_token from response
            const signupToken = verifyResponse.data.signup_token;

            toast.dismiss(loadingToastId);
            const signupLoadingId = toast.loading("Creating your account...");

            // ✅ Step 2: Create account with signup_token
            const signupResponse = await api.post("/auth/signup", null, {
                params: {
                    email: email,
                    phone: phone,
                    password: password,
                    signup_token: signupToken
                },
            });

            toast.dismiss(signupLoadingId);
            const role = signupResponse.data?.role || "";

            await fetchUserData();
            toast.success("Account Created!", "Your account has been created successfully!");

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

        } catch (error) {
            toast.dismiss(loadingToastId);

            const errorMessage = error.response?.data?.detail || "Verification failed. Please try again.";

            // Handle specific error cases
            if (error.response?.status === 400) {
                const msg = errorMessage.toLowerCase();
                if (msg.includes("invalid") || msg.includes("wrong")) {
                    toast.error("Invalid OTP", "Invalid OTP. Please check and try again.");
                }
                else if (msg.includes("expired")) {
                    toast.error("OTP Expired", "OTP has expired. Please request a new one.");
                }
                else {
                    toast.error("Error", errorMessage);
                }
            } else {
                toast.error("Error", errorMessage);
            }

            setOtp(["", "", "", "", "", ""]);
            autoSubmitTriggered.current = false;
            if (inputRefs.current[0]) {
                inputRefs.current[0].focus();
            }
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendOtp = async () => {
        if (!canResend) return;

        setIsResending(true);
        const loadingToastId = toast.loading("Resending OTP...");

        try {
            // ✅ STATELESS OTP: Send cooldown_token for rate limiting
            const response = await api.post("/auth/signup/resend-otp", null, {
                params: {
                    email: email,
                    cooldown_token: cooldownToken
                }
            });

            toast.dismiss(loadingToastId);
            toast.success("OTP Resent!", "OTP has been resent successfully!");

            // ✅ CRITICAL: Update the OTP token with the new one from resend response
            if (response.data.otp_token) {
                setOtpToken(response.data.otp_token);
                console.log("✅ Updated OTP token after resend:", response.data.otp_token);
            }

            // ✅ Store new cooldown token for future rate limiting
            if (response.data.cooldown_token) {
                setCooldownToken(response.data.cooldown_token);
            }

            setTimer(60);
            setCanResend(false);
            setOtp(["", "", "", "", "", ""]);
            autoSubmitTriggered.current = false;
            if (inputRefs.current[0]) {
                inputRefs.current[0].focus();
            }
        } catch (error) {
            toast.dismiss(loadingToastId);

            const errorMessage = error.response?.data?.detail || "Failed to resend OTP. Please try again.";

            // Handle rate limiting error
            if (error.response?.status === 429) {
                toast.error("Too Many Requests", errorMessage);
                // Extract wait time from error message if possible
                const waitTimeMatch = errorMessage.match(/\d+/);
                if (waitTimeMatch) {
                    setTimer(parseInt(waitTimeMatch[0]));
                    setCanResend(false);
                }
            } else {
                toast.error("Error", errorMessage);
            }
        } finally {
            setIsResending(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    return (
        <div className="fixed inset-0 overflow-hidden">
            <img
                src={SignupSideBg}
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="relative w-full h-full flex items-center justify-center p-3 sm:p-6">
                <div
                    className="
                        relative
                        w-full max-w-[500px]
                        rounded-[28px]
                        border-[1.5px] border-white
                        bg-white/70 shadow-[0_0_10px_0_#FFFFFF]
                        flex flex-col items-center
                        origin-center
                        transition-all duration-300
                        p-4 sm:p-8
                    "
                    style={{ transform: `scale(${scale})` }}
                >
                    {/* Back Button */}
                    <button
                        onClick={() => { 
                            toast.dismiss(); 
                            navigate("/signupac"); 
                        }}
                        className="
                            absolute top-2 left-2 sm:top-3 sm:left-3 
                            flex items-center justify-center 
                            w-7 h-7 sm:w-8 sm:h-8 rounded-full 
                            bg-gradient-to-b from-[rgba(3,3,3,0.9)] to-[rgba(81,33,143,0.9)]
                            border border-[#8A38F533]
                            shadow-md transition-all duration-200 group cursor-pointer z-10
                            hover:scale-105 active:scale-95
                        "
                        aria-label="Go back"
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white group-hover:scale-110 transition-transform duration-200" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2.5} 
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>

                    {/* Logo */}
                    <div className="w-full flex items-center justify-center mb-3 sm:mb-4">
                        <h1 className="text-[28px] sm:text-[36px] font-[700] trochut-font leading-[100%] text-center bg-gradient-to-l from-[#3D1768] to-[#030303] bg-clip-text text-transparent">
                            Talenta
                        </h1>
                    </div>

                    {/* OTP Icon */}
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-b from-[#3D1768] to-[#8B3EFF] rounded-full flex items-center justify-center mb-3 sm:mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                        </svg>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-4 sm:mb-5">
                        <h2 className="text-[20px] sm:text-[24px] font-[500] poppins-font text-[#333333] mb-1">
                            Verify Your Email
                        </h2>
                        <p className="text-[12px] sm:text-[14px] font-[400] poppins-font text-[#3D1768]">
                            We've sent a verification code to
                        </p>
                        <p className="text-[13px] sm:text-[15px] font-[600] poppins-font text-[#51218F] mt-0.5 break-all px-2">
                            {email}
                        </p>
                    </div>

                    {/* OTP Input Boxes - Responsive with min-width breakpoint */}
                    <div className="flex justify-center gap-1.5 min-[360px]:gap-2 sm:gap-3 mb-6 w-full px-2">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                maxLength={6}
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="
                                    w-[38px] min-[360px]:w-[44px] sm:w-[52px] md:w-[56px]
                                    h-[44px] min-[360px]:h-[50px] sm:h-[56px] md:h-[60px]
                                    text-center text-lg min-[360px]:text-xl sm:text-2xl font-bold
                                    rounded-[8px] min-[360px]:rounded-[10px]
                                    border-[1.5px] border-[#51218F]
                                    bg-white/90
                                    focus:outline-none focus:ring-2 focus:ring-[#51218F]
                                    transition-all
                                "
                                disabled={isVerifying || isResending}
                            />
                        ))}
                    </div>

                    {/* Timer & Resend link */}
                    <div className="text-center mb-5 w-full">
                        {canResend ? (
                            <div className="flex flex-col items-center gap-1.5">
                                <p className="text-[11px] sm:text-[13px] text-gray-600 poppins-font">
                                    Didn't receive the code?
                                </p>
                                <button
                                    onClick={handleResendOtp}
                                    disabled={isResending}
                                    className="text-[13px] sm:text-[14px] text-[#51218F] font-[600] hover:underline focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isResending ? "Resending..." : "Click to resend"}
                                </button>
                            </div>
                        ) : (
                            <p className="text-[11px] sm:text-[13px] text-gray-600 poppins-font">
                                Resend code in{" "}
                                <span className="text-[#51218F] font-[600]">
                                    {formatTime(timer)}
                                </span>
                            </p>
                        )}
                    </div>

                    {/* Verify Button */}
                    <button
                        onClick={handleVerifyOtp}
                        disabled={isVerifying || otp.join("").length !== 6}
                        className="
                            group relative overflow-hidden
                            w-full py-[12px] sm:py-[14px] rounded-full
                            bg-gradient-to-r from-[#3D1768] to-[#8B3EFF]
                            text-white font-bold poppins-font text-sm sm:text-base
                            shadow-xl hover:shadow-2xl transition
                            disabled:opacity-50 disabled:cursor-not-allowed
                            cursor-pointer
                        "
                    >
                        <span className="absolute inset-0 -translate-x-[120%] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 transition-transform duration-[1200ms] ease-out group-hover:translate-x-[120%]" />
                        <span className="absolute inset-0 rounded-full bg-white/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        <span className="relative z-10 group-hover:scale-105 transition-transform duration-300">
                            {isVerifying ? "Verifying..." : "Verify Email"}
                        </span>
                    </button>

                    {/* Help Text */}
                    <p className="text-[10px] sm:text-[12px] text-gray-500 text-center mt-4 poppins-font px-2">
                        Enter the 6-digit code sent to your email address
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupOtp;