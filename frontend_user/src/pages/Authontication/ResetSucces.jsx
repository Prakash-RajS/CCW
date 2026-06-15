import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SignupSideBg from "../../assets/Auth/SignupSideBg.png";
import Succes from "../../assets/Auth/Succes.png";

const ResetSuccess = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  // Countdown timer
  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, []);

  // Auto redirect to login after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Background */}
      <img
        src={SignupSideBg}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="relative w-screen h-screen flex justify-center items-center p-4">
        <div className="relative w-full max-w-[500px] rounded-[28px] border-[1.5px] border-white bg-white/70 shadow-[0_0_10px_0_#FFFFFF] flex flex-col items-center justify-center p-6 sm:p-8">

          {/* Success Icon with animation */}
          <div className="animate-bounce-in mb-4">
            <div className="relative">
              {/* Outer ring animation */}
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping-slow"></div>
              
              {/* Success Image */}
              <img
                src={Succes}
                alt="Success"
                className="w-[80px] h-[80px] sm:w-[90px] sm:h-[90px] object-contain relative z-10 animate-check-mark"
              />
            </div>
          </div>

          {/* Message with fade-in animation */}
          <p className="w-full max-w-[400px] text-center text-[18px] sm:text-[20px] md:text-[22px] font-[500] poppins-font text-[#333333] leading-tight animate-fade-in-up">
            Your password has been reset successfully!
          </p>

          {/* Back to Login Button */}
          <button
            onClick={() => navigate("/login")}
            className="mt-6 group flex items-center gap-2 cursor-pointer animate-fade-in-up-delayed"
          >
            <div
              className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full 
              bg-gradient-to-b from-[rgba(3,3,3,0.9)] to-[rgba(81,33,143,0.9)]
              border border-[#8A38F533]
              shadow-md transition-all duration-200
              group-hover:scale-110 group-active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white transition-transform duration-200 group-hover:-translate-x-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </div>

            <span className="text-[#030303] poppins-font font-[400] text-[14px] sm:text-[15px] group-hover:text-[#3D1768] transition-colors duration-200">
              Back to Login
            </span>
          </button>

          {/* Auto redirect hint with countdown */}
          <div className="mt-4 flex items-center gap-2 animate-fade-in-up-delayed-more">
            <svg 
              className="animate-spin h-3.5 w-3.5 text-[#3D1768]/60" 
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
              ></circle>
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-[11px] sm:text-[12px] text-[#3D1768]/70 poppins-font">
              Redirecting to login in {countdown}s...
            </p>
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        /* Bounce in animation for success icon */
        @keyframes bounceIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.15);
          }
          70% {
            transform: scale(0.95);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-bounce-in {
          animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }

        /* Slow ping animation for outer ring */
        @keyframes pingSlow {
          0% {
            transform: scale(1);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        .animate-ping-slow {
          animation: pingSlow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          border-radius: 50%;
        }

        /* Check mark draw animation */
        @keyframes checkMark {
          0% {
            transform: scale(0.8) rotate(-10deg);
            opacity: 0;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        .animate-check-mark {
          animation: checkMark 0.5s ease-out 0.2s both;
        }

        /* Fade in up animation */
        @keyframes fadeInUp {
          0% {
            transform: translateY(20px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out 0.4s both;
        }
        .animate-fade-in-up-delayed {
          animation: fadeInUp 0.5s ease-out 0.6s both;
        }
        .animate-fade-in-up-delayed-more {
          animation: fadeInUp 0.5s ease-out 0.8s both;
        }
      `}</style>
    </div>
  );
};

export default ResetSuccess;