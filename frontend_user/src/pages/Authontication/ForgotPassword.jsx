import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "../../component/Toast";
import api from "../../utils/axiosConfig";
import SignupSideBg from "../../assets/Auth/SignupSideBg.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError("");

    // Only allow @gmail.com emails
    if (value && !value.endsWith("@gmail.com")) {
      setEmailError("Email must be a Gmail address");
    }
  };

  const handleSendOTP = async () => {
    // Validate email
    if (!email) {
      setEmailError("Email is required");
      toast.error("Validation Error", "Email cannot be empty!");
      return;
    }

    if (!email.endsWith("@gmail.com")) {
      setEmailError("Email must be a Gmail address");
      toast.error("Validation Error", "Please enter a valid Gmail address");
      return;
    }

    try {
      setLoading(true);
      const loadingToastId = toast.loading("Sending OTP...");

      // ✅ STATELESS OTP: Send email and get otp_token
      const response = await api.post(
        "/auth/forgot-password/send-otp",
        null,
        {
          params: { email: email.toLowerCase().trim() },
        }
      );

      // ✅ Get otp_token from response
      const otpToken = response.data.otp_token;

      toast.dismiss(loadingToastId);
      toast.success("OTP Sent!", "OTP has been sent to your email successfully!");

      // ➡️ Navigate to OTP verification page with email and otp_token
      setTimeout(() => {
        toast.dismiss();
        navigate("/otp-request", {
          state: { 
            email: email.toLowerCase().trim(),
            otpToken,  // ✅ Pass otp_token for verification
            isForgotPassword: true 
          },
        });
      }, 1500);

    } catch (error) {
      toast.dismiss();
      
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to send OTP. Please try again.";

      // Handle specific error cases
      if (error.response?.status === 404 || message.toLowerCase().includes("not found")) {
        setEmailError("Email not found. Please check your email address.");
        toast.error("Email Not Found", "No account found with this email address.");
      } else if (error.response?.status === 429) {
        toast.error("Too Many Requests", "Please wait before requesting another OTP.");
      } else {
        toast.error("Error", message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading && email && !emailError) {
      handleSendOTP();
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Background */}
      <img
        src={SignupSideBg}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="relative w-screen h-screen flex justify-center items-center p-4">
        <div className="relative w-full max-w-[580px] rounded-[28px] border-[1.5px] border-white bg-white/70 shadow-[0_0_10px_0_#FFFFFF] flex flex-col items-center justify-center p-6 sm:p-8 md:p-10">

          {/* Back Button */}
          <button
            onClick={() => navigate("/login")}
            className="absolute top-4 left-4 sm:top-6 sm:left-6 
            flex items-center justify-center 
            w-8 h-8 sm:w-9 sm:h-9 rounded-full 
            bg-gradient-to-b from-[rgba(3,3,3,0.9)] to-[rgba(81,33,143,0.9)]
            border border-[#8A38F533]
            shadow-md transition-all duration-200 group cursor-pointer
            hover:scale-105 active:scale-95"
            aria-label="Go back to login"
            title="Back to Login"
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

          {/* Main Content */}
          <div className="w-full max-w-[500px] flex flex-col items-center gap-6 mt-4 sm:mt-0">

            {/* Header */}
            <div className="w-full text-center flex flex-col items-center gap-2">
              <h1 className="text-[24px] sm:text-[28px] md:text-[32px] font-[500] poppins-font text-[#333333]">
                Forgot your password?
              </h1>

              <p className="text-[13px] sm:text-[14px] md:text-[15px] font-[400] poppins-font text-[#3D1768] max-w-[420px]">
                No worries. Enter your email and we'll send you a one-time password (OTP) to reset it.
              </p>
            </div>

            <div className="w-full flex flex-col items-center gap-5">

              {/* Email Input */}
              <div className="w-full flex flex-col gap-1.5">
                <p className="text-[14px] sm:text-[15px] font-[400] poppins-font text-[#000000]">
                  Enter your email ID
                </p>

                <div
                  className={`
                    w-full h-[44px] sm:h-[48px]
                    flex items-center px-4 rounded-[10px]
                    bg-[#51218F4D]
                    ${emailError ? "border-2 border-red-500" : ""}
                    transition-all duration-200
                  `}
                >
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    placeholder="Enter your email (must be @gmail.com)"
                    className={`
                      w-full text-[14px] sm:text-[15px] font-[Poppins]
                      bg-transparent outline-none
                      text-[#000000] placeholder:text-[#00000080]
                      ${loading ? "opacity-70 cursor-not-allowed" : ""}
                    `}
                  />
                </div>

                {emailError && (
                  <p className="text-red-500 text-[11px] sm:text-[12px] mt-0.5">
                    {emailError}
                  </p>
                )}
              </div>

              {/* Send OTP Button */}
              <button
                onClick={handleSendOTP}
                disabled={loading || !email || !!emailError}
                type="button"
                className="
                  group relative overflow-hidden
                  w-full h-[44px] sm:h-[48px]
                  rounded-[35px] 
                  bg-gradient-to-r from-[#3D1768] to-[#030303]
                  text-white text-[14px] sm:text-[15px] font-medium poppins-font
                  shadow-lg
                  hover:opacity-90
                  transition-all duration-300
                  flex items-center justify-center
                  disabled:opacity-50 disabled:cursor-not-allowed
                  cursor-pointer
                "
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending OTP...
                  </div>
                ) : (
                  "Send OTP"
                )}
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;