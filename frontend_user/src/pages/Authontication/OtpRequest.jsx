import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../utils/axiosConfig";
import SignupSideBg from "../../assets/Auth/SignupSideBg.png";

const OtpRequest = () => {
  const otpRefs = useRef([]);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(45);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  // ❌ Prevent direct access
  useEffect(() => {
    if (!email) {
      toast.error("Email missing. Please try again.");
      navigate("/forgot-password");
    }
  }, [email, navigate]);

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
      return toast.error("Please enter all 6 digits!");
    }

    const finalOTP = otp.join("");

    try {
      setLoading(true);

      await api.post(
        "/auth/forgot-password/verify-otp",
        null,
        {
          params: {
            email,
            otp: finalOTP,
          },
        }
      );

      toast.success("OTP verified successfully!");

      navigate("/reset-password", {
        state: { email },
      });

    } catch (error) {
      toast.error(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Invalid or expired OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Resend OTP
  // ---------------------------
  const handleResendOtp = async () => {
    try {
      await api.post(
        "/auth/forgot-password/resend-otp",
        null,
        {
          params: { email },
        }
      );

      toast.success("OTP resent successfully!");
      setTimeLeft(45);
      setOtp(Array(6).fill(""));
      otpRefs.current[0]?.focus();

    } catch (error) {
      toast.error(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Please wait before resending OTP"
      );
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

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Background */}
      <img
        src={SignupSideBg}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover opacity-80%"
      />

      <div className="relative w-screen h-screen flex justify-center items-center p-4">
        <div className="w-full max-w-[740px] min-h-[432px] rounded-[32px] border-[1.5px] border-white bg-white/70 shadow-[0_0_10px_0_#FFFFFF] flex flex-col items-center justify-center gap-6 p-6 sm:p-8 md:p-10 relative">

          {/* Back Button */}
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 cursor-pointer select-none"
            onClick={() => navigate("/forgot-password")}
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{
                background:
                  "linear-gradient(180deg, rgba(3,3,3,0.9) 0%, rgba(81,33,143,0.9) 100%)",
                backdropFilter: "blur(12px)",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </div>
            <span className="text-[#030303] poppins-font text-base sm:text-lg font-medium">
              Back
            </span>
          </div>

          {/* Content */}
          <div className="w-full max-w-lg text-center mt-10">
            <h1 className="text-3xl sm:text-[32px] font-semibold text-[#000000] poppins-font">
              Enter OTP
            </h1>

            <p className="text-[#3D1768] text-sm sm:text-base poppins-font mb-10 px-4">
              We’ve sent a 6-digit OTP to <b>{email}</b>. Please enter it below.
            </p>

            {/* OTP Inputs */}
            <div className="flex justify-center gap-4 sm:gap-8 mb-10">
              {otp.map((value, i) => (
                <div key={i} className="relative">
                  <input
                    ref={(el) => (otpRefs.current[i] = el)}
                    value={value}
                    onChange={(e) => handleInput(i, e)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    maxLength={1}
                    className="w-[45px] sm:w-[50px] h-[24px] sm:h-[70px] text-center text-2xl sm:text-4xl bg-transparent outline-none"
                  />
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-1 h-[2px] w-[50px] bg-[#3D1768] rounded-full" />
                </div>
              ))}
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full h-12 rounded-[30px] bg-gradient-to-r from-[#3D1768] to-[#030303] text-white font-medium disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            {/* Resend */}
            <p className="mt-8 text-sm poppins-font">
              Didn’t receive the code?{" "}
              {timeLeft > 0 ? (
                <>Resend in <b className="text-[#C22CA2]">{formatTime()}</b></>
              ) : (
                <span
                  className="text-[#C22CA2] cursor-pointer font-bold"
                  onClick={handleResendOtp}
                >
                  Resend OTP
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpRequest;
