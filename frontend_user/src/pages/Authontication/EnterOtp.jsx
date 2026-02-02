import { useEffect,useRef, useState } from "react";
import toast from "react-hot-toast";
import SignupSideBg from "../../assets/Auth/SignupSideBg.png";

const EnterOtp = () => {
  const otpRefs = useRef([]);
  const [otp, setOtp] = useState(Array(6).fill(""));

  const [timeLeft, setTimeLeft] = useState(45); // 45 seconds starting

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
  const handleVerify = () => {
    if (otp.some((v) => v.trim() === "")) {
      return toast.error("Please enter all 6 digits!");
    }

    const finalOTP = otp.join("");
    toast.success(`OTP Verified Successfully! (${finalOTP})`);
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

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Background */}
      <img
        src={SignupSideBg}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover opacity-80%"
      />

      {/* Main Card */}
      <div className="relative w-screen h-screen flex justify-center items-center p-4">
        <div className="w-full max-w-[740px] min-h-[432px] rounded-[32px] border-[1.5px] border-white bg-white/70 shadow-[0_0_10px_0_#FFFFFF] flex flex-col items-center justify-center gap-6 p-6 sm:p-8 md:p-10 relative">

        {/* Back Button */}
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 cursor-pointer select-none"
          onClick={() => (window.location.href = "/")}
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
          <p className="text-[#3D1768] text-sm sm:text-base poppins-font mb-10 sm:mb-12 px-4">
            We’ve sent a 6-digit OTP to your email. Please enter it below to
            continue.
          </p>

          {/* OTP Inputs */}
          <div className="flex justify-center gap-4 sm:gap-8 mb-8 sm:mb-10">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="relative">
              <input
  ref={(el) => (otpRefs.current[i] = el)}
  value={otp[i]}
  onChange={(e) => handleInput(i, e)}
  onKeyDown={(e) => handleKeyDown(i, e)}
  maxLength={1}
  className="
    w-[45px] h-[24px] 
    sm:w-[50px] sm:h-[70px]
    text-center 
    text-2xl sm:text-4xl 
    text-[#000000]
    bg-transparent outline-none
    leading-none caret-[#3D1768]
  "
/>


                  {/* Underline centered */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-1 h-[2px] w-[50px] bg-[#3D1768] rounded-full" />
                </div>
              ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            type="button"
            className="
              group relative overflow-hidden
              w-full max-w-[554px] 
              h-12 sm:h-[48px]
              rounded-[30px] 
              bg-gradient-to-r from-[#3D1768] to-[#030303]
              px-8 py-3
              text-white text-base sm:text-lg font-medium poppins-font
              border border-white/10 
              shadow-lg
              hover:border-white/30 
              hover:shadow-2xl hover:shadow-purple-900/50
              active:scale-95
              transition-all duration-500
              flex items-center justify-center
            "
          >
            {/* Shine */}
            <span
              className="
                absolute inset-0 
                translate-x-[-100%] 
                bg-gradient-to-r from-transparent via-white/25 to-transparent
                skew-x-12
                transition-transform duration-1000 ease-out
                group-hover:translate-x-[100%]
              "
            />

            {/* Glow */}
            <span
              className="
                absolute inset-0 rounded-[30px] 
                bg-white/10 scale-125 opacity-0 
                group-hover:opacity-100 
                transition-opacity duration-500
              "
            />

            <span className="relative z-10 group-hover:scale-105 transition-transform duration-300">
              Verify OTP
            </span>
          </button>

          {/* Resend */}
         <p className="mt-8 text-[#030303]/90 text-sm sm:text-base poppins-font">
  Didn’t receive the code? Resend in{" "}
  <span className="font-bold text-[#C22CA2]">
    {formatTime()}
  </span>
</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterOtp;
