import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SignupSideBg from "../../assets/Auth/SignupSideBg.png";
import Succes from "../../assets/Auth/Succes.png";

const ResetSuccess = () => {
  const navigate = useNavigate();

  // Auto redirect to login after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Background */}
      <img
        src={SignupSideBg}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover opacity-80%"
      />

      <div className="relative w-screen h-screen flex justify-center items-center overflow-hidden">
        <div className="w-[90%] max-w-[652px] min-h-[398px] rounded-[32px] border-[1.5px] border-white bg-white/70 shadow-[0_0_10px_0_#FFFFFF] flex flex-col items-center justify-center gap-6 p-6">

          {/* Success Image */}
          <img
            src={Succes}
            alt="Success"
            className="w-[122px] h-[122px] max-w-[25%] max-h-[25%] object-contain"
          />

          {/* Message */}
          <p className="w-[90%] max-w-[522px] text-center text-[24px] leading-[100%] font-normal poppins-font text-[#3D1768]">
            Your password has been reset successfully!
          </p>

          {/* Back to Login */}
          <div
            className="flex items-center mt-4 gap-2 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            <div
              className="flex items-center justify-center w-8 h-8 rounded-full border border-white/20"
              style={{
                background:
                  "linear-gradient(180deg, rgba(3,3,3,0.9) 0%, rgba(81,33,143,0.9) 100%)",
                backdropFilter: "blur(90px)",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-white"
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

            <span className="text-[#030303] poppins-font font-normal text-[18px] leading-[100%]">
              Back to Login
            </span>
          </div>

          {/* Auto redirect hint */}
          <p className="text-sm text-[#3D1768]/80 poppins-font mt-2">
            Redirecting to login…
          </p>
        </div>
      </div>
    </section>
  );
};

export default ResetSuccess;
