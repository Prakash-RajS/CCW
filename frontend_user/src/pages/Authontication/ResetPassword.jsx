import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "../../component/Toast"; 
import api from "../../utils/axiosConfig";
import SignupSideBg from "../../assets/Auth/SignupSideBg.png";

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const resetToken = location.state?.resetToken; // ✅ Get reset_token from state

  // ❌ Prevent direct access - validate both email and resetToken
  useEffect(() => {
    if (!email || !resetToken) {
      toast.error("Session Expired", "Session expired. Please try again.");
      navigate("/forgot-password");
    }
  }, [email, resetToken, navigate]);

  // Password validation
  const validatePassword = (pass) => {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(pass);
  };

  const isValidPassword = !password || validatePassword(password);
  const passwordsMatch = !confirmPassword || confirmPassword === password;

  // Handle password change
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    
    if (value && !validatePassword(value)) {
      setPasswordError("Min 8 chars with uppercase, lowercase, number & special character");
    } else {
      setPasswordError("");
    }

    // Check confirm password match
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
    } else if (confirmPassword && value === confirmPassword) {
      setConfirmPasswordError("");
    }
  };

  // Handle confirm password change
  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    
    if (value && value !== password) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  // Check if button should be disabled
  const isButtonDisabled = 
    loading || 
    !password || 
    !confirmPassword || 
    !!passwordError || 
    !!confirmPasswordError;

  // ---------------------------
  // Reset Password
  // ---------------------------
  const handleResetPassword = async () => {
    if (!password) {
      setPasswordError("Password is required");
      toast.error("Validation Error", "Please fill all fields");
      return;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password");
      toast.error("Validation Error", "Please fill all fields");
      return;
    }

    if (!validatePassword(password)) {
      setPasswordError("Min 8 chars with uppercase, lowercase, number & special character");
      toast.error("Weak Password", "Password must meet the requirements");
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      toast.error("Mismatch", "Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const loadingToastId = toast.loading("Resetting password...");

      // ✅ STATELESS: Send reset_token with password reset request
      await api.post(
        "/auth/forgot-password/reset",
        null,
        {
          params: {
            email,
            new_password: password,
            confirm_password: confirmPassword,
            reset_token: resetToken, // ✅ Send reset_token for verification
          },
        }
      );

      toast.dismiss(loadingToastId);
      toast.success("Password Reset!", "Password reset successful!");

      // Navigate to success page
      setTimeout(() => {
        toast.dismiss();
        navigate("/reset-succes");
      }, 1500);

    } catch (error) {
      toast.dismiss();
      
      const errorMessage = error?.response?.data?.detail || "Failed to reset password";
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        const msg = errorMessage.toLowerCase();
        if (msg.includes("expired")) {
          toast.error("Token Expired", "Reset token has expired. Please request a new OTP.");
          // Redirect to forgot password after expired token
          setTimeout(() => {
            toast.dismiss();
            navigate("/forgot-password");
          }, 2000);
        } else if (msg.includes("invalid")) {
          toast.error("Invalid Token", "Invalid reset token. Please try again.");
          setTimeout(() => {
            toast.dismiss();
            navigate("/forgot-password");
          }, 1500);
        } else {
          toast.error("Error", errorMessage);
        }
      } else {
        toast.error("Error", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isButtonDisabled) {
      handleResetPassword();
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
            onClick={() => {
              toast.dismiss();
              navigate("/otp-request");
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
          <div className="w-full max-w-[500px] flex flex-col items-center gap-6 mt-4 sm:mt-0">
            
            {/* Header */}
            <div className="text-center">
              <h1 className="text-[24px] sm:text-[28px] md:text-[32px] font-[500] poppins-font text-[#333333]">
                Reset Password
              </h1>
              <p className="mt-2 text-[13px] sm:text-[14px] md:text-[15px] font-[400] poppins-font text-[#3D1768]">
                Create a strong new password for your account.
              </p>
            </div>

            <div className="w-full space-y-5">

              {/* Password */}
              <div className="w-full">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[14px] sm:text-[15px] font-[400] poppins-font text-[#030303]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className={`flex items-center gap-1 text-[13px] sm:text-[14px] font-[400] poppins-font text-[#030303] ${loading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <div
                  className={`w-full h-[44px] sm:h-[48px] rounded-[10px] flex items-center px-4 ${
                    passwordError ? "border-2 border-red-500" : ""
                  }`}
                  style={{ background: "#51218F4D" }}
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={handlePasswordChange}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    className={`w-full bg-transparent outline-none text-[14px] sm:text-[15px] poppins-font text-[#030303] placeholder:text-[#03030380] ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                  />
                </div>
                {passwordError ? (
                  <p className="text-[11px] sm:text-[12px] text-red-500 mt-1">
                    {passwordError}
                  </p>
                ) : (
                  <p className="text-[11px] sm:text-[12px] text-[#51218F] mt-1">
                    Must be at least 8 characters with uppercase, lowercase, number, and special character.
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="w-full">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[14px] sm:text-[15px] font-[400] poppins-font text-[#030303]">
                    Re-type Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                    className={`flex items-center gap-1 text-[13px] sm:text-[14px] font-[400] poppins-font text-[#030303] ${loading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <div 
                  className={`w-full h-[44px] sm:h-[48px] rounded-[10px] flex items-center px-4 ${
                    confirmPasswordError ? "border-2 border-red-500" : 
                    password && confirmPassword && password === confirmPassword ? "border-2 border-green-500" : ""
                  }`}
                  style={{ background: "#51218F4D" }}
                >
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    className={`w-full bg-transparent outline-none text-[14px] sm:text-[15px] poppins-font text-[#030303] placeholder:text-[#03030380] ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                  />
                </div>
                {confirmPasswordError ? (
                  <p className="text-[11px] sm:text-[12px] text-red-500 mt-1">
                    {confirmPasswordError}
                  </p>
                ) : password && confirmPassword && password === confirmPassword ? (
                  <p className="text-[11px] sm:text-[12px] text-green-500 mt-1">
                    Passwords match ✓
                  </p>
                ) : (
                  <p className="text-[11px] sm:text-[12px] text-[#51218F] mt-1">
                    Re-enter the same password.
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="button"
                disabled={isButtonDisabled}
                onClick={handleResetPassword}
                className="
                  group relative overflow-hidden
                  w-full h-[44px] sm:h-[48px]
                  rounded-[35px] 
                  bg-gradient-to-r from-[#3D1768] to-[#030303]
                  text-white text-[14px] sm:text-[15px] font-medium poppins-font
                  shadow-lg
                  hover:opacity-90 transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed
                  cursor-pointer
                  mt-6
                "
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Resetting...
                  </div>
                ) : (
                  "Reset Password"
                )}
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;