//src/pages/Authontication/Login.jsx
import { useState, useRef } from "react";
import SignupSideBg from "../../assets/Auth/SignupSideBg.png";
import toast from "../../component/Toast";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/axiosConfig";
import { useUser } from "../../contexts/UserContext";

const Login = () => {
  const navigate = useNavigate();
  const { fetchUserData } = useUser();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialEmailRef = useRef("");
  const initialPasswordRef = useRef("");
  const hasAttemptedSubmitRef = useRef(false);

  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  const isEmailValid = email && email.endsWith("@gmail.com") && !emailError;

  const hasValidationErrors =
    (emailError && emailError !== "Email not found. Please check your email address.") ||
    (passwordError && passwordError !== "Invalid password. Please try again.");

  const isButtonDisabled = !email || !password || isLoading || isSubmitting || hasValidationErrors;

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value !== initialEmailRef.current) hasAttemptedSubmitRef.current = false;
    if (hasAttemptedSubmitRef.current && value !== initialEmailRef.current) {
      setIsSubmitting(false);
      hasAttemptedSubmitRef.current = false;
    }
    if (value && !value.endsWith("@gmail.com")) {
      setEmailError("Email must be a Gmail address");
    } else {
      setEmailError("");
    }
  };

  const handleEmailKeyPress = (e) => {
    if (e.key === "Enter" && isEmailValid && !isLoading) {
      e.preventDefault();
      if (passwordInputRef.current) passwordInputRef.current.focus();
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (hasAttemptedSubmitRef.current && value !== initialPasswordRef.current) {
      setIsSubmitting(false);
      hasAttemptedSubmitRef.current = false;
    }
    if (passwordError) setPasswordError("");
  };

  const handleBack = () => navigate("/", { replace: true });

  const handleLogin = async () => {
    if (!email) { setEmailError("Email is required"); return; }
    if (emailError && emailError !== "Email not found. Please check your email address.") return;
    if (!password) { setPasswordError("Password is required"); return; }
    if (passwordError && passwordError !== "Invalid password. Please try again.") return;

    initialEmailRef.current = email;
    initialPasswordRef.current = password;
    setIsSubmitting(true);
    setIsLoading(true);
    const loadingToastId = toast.loading("Logging you in...");

    try {
      const response = await api.post("/auth/login", null, {
        params: { email: email.toLowerCase().trim(), password },
      });

      if (response.status === 200) {
        const user = await fetchUserData();
        toast.dismiss(loadingToastId);

        let displayName;
        if (user?.full_name && user.full_name.trim() !== "") displayName = user.full_name;
        else if (response.data?.full_name && response.data.full_name.trim() !== "") displayName = response.data.full_name;
        else displayName = email.split("@")[0];

        toast.success("Login Successful!", `Welcome back, ${displayName}! 🎉`);

        setTimeout(() => {
          if (!user?.role) navigate("/role-section", { replace: true });
          else if (user.role === "creator") navigate("/home", { replace: true });
          else if (user.role === "collaborator") navigate("/col-home", { replace: true });
          else navigate("/", { replace: true });
        }, 2000);
      }
    } catch (err) {
      toast.dismiss(loadingToastId);
      hasAttemptedSubmitRef.current = true;

      const errorDetail = err.response?.data?.detail;
      const statusCode = err.response?.status;

      if (errorDetail === "email_not_found") {
        setPasswordError("");
        setEmailError("Email not found. Please check your email address.");
        toast.error("Login Failed", "Email not found. Please check your email address.");
      } else if (errorDetail === "invalid_password") {
        setEmailError("");
        setPasswordError("Invalid password. Please try again.");
        toast.error("Login Failed", "Invalid password. Please try again.");
      } else if (statusCode === 403) {
        setEmailError(""); setPasswordError("");
        toast.error("Account Banned", errorDetail || "Your account has been banned.");
      } else if (err.request && !err.response) {
        setEmailError(""); setPasswordError("");
        toast.error("Network Error", "Please check your connection and try again.");
      } else {
        setEmailError(""); setPasswordError("");
        toast.error("Error", errorDetail || "An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      <style>{`
        /*
          NUCLEAR iOS FIX:
          Input stays type="text" always — iOS NEVER blocks keyboard for text inputs.
          Visual dot-masking is done via CSS -webkit-text-security instead of type="password".
          Works on iOS Safari, Android Chrome, Desktop Chrome/Firefox/Safari — everywhere.
        */
        .password-masked {
          -webkit-text-security: disc !important;
          text-security: disc !important;
        }
        .password-visible {
          -webkit-text-security: none !important;
          text-security: none !important;
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-text-fill-color: #030303 !important;
          transition: background-color 5000s ease-in-out 0s;
        }
        input::-webkit-credentials-auto-fill-button,
        input::-webkit-caps-lock-indicator,
        input::-webkit-strong-password-auto-fill-button {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
        @media (pointer: coarse) {
          input { font-size: 16px !important; }
        }
        .input-container { pointer-events: auto; touch-action: manipulation; }
        button { touch-action: manipulation; }
      `}</style>

      <img src={SignupSideBg} alt="Background" className="absolute inset-0 w-full h-full object-cover" />

      <div className="relative w-screen h-screen flex justify-center items-center p-4 sm:p-6 md:p-8">
        <div className="relative w-full max-w-[580px] rounded-[28px] border-[1.5px] border-white bg-white/70 shadow-[0_0_10px_0_#FFFFFF] flex flex-col items-center justify-center p-6 sm:p-8 md:p-10">

          {/* Back Button */}
          <button
            onClick={handleBack}
            className="absolute top-3 left-3 sm:top-4 sm:left-4 md:top-5 md:left-5 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-b from-[rgba(3,3,3,0.9)] to-[rgba(81,33,143,0.9)] border border-[#8A38F533] shadow-md transition-all duration-200 group cursor-pointer hover:scale-105 active:scale-95"
            aria-label="Go back to home"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 text-white group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>

          <div className="w-full max-w-[500px] flex flex-col gap-2">
            {/* Logo */}
            <div className="w-full flex items-center justify-center">
              <h1 className="text-[28px] sm:text-[32px] md:text-[34px] font-[700] trochut-font leading-[100%] text-center bg-gradient-to-l from-[#3D1768] to-[#030303] bg-clip-text text-transparent">
                Talenta
              </h1>
            </div>

            <div className="w-full flex flex-col items-center">
              <div className="w-full max-w-[400px] text-center space-y-1">
                <h2 className="text-[22px] sm:text-[24px] md:text-[26px] font-[500] poppins-font text-[#333333]">Welcome back</h2>
                <p className="text-[12px] sm:text-[13px] md:text-[14px] font-[400] poppins-font text-[#3D1768]">Collaborate with us. Explore with us</p>
              </div>

              {/* Email */}
              <div className="w-full mt-3 sm:mt-4">
                <p className="text-[13px] sm:text-[14px] font-[400] poppins-font text-[#000000] mb-1.5">Email</p>
                <div
                  className={`input-container w-full h-[44px] sm:h-[48px] rounded-[10px] flex items-center px-3 ${emailError ? "border-2 border-red-500" : ""}`}
                  style={{ background: "#51218F4D" }}
                  onClick={() => { if (emailInputRef.current && !isLoading) emailInputRef.current.focus(); }}
                >
                  <input
                    ref={emailInputRef}
                    type="email"
                    placeholder="Enter your email (must be @gmail.com)"
                    value={email}
                    onChange={handleEmailChange}
                    onKeyPress={handleEmailKeyPress}
                    disabled={isLoading}
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    style={{ fontSize: "16px" }}
                    className={`w-full bg-transparent outline-none text-[14px] sm:text-[15px] font-[Poppins] text-[#000000] placeholder:text-[#00000080] ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                  />
                </div>
                {emailError && <p className="text-[11px] sm:text-[12px] text-red-500 mt-1">{emailError}</p>}
              </div>

              {/* Password — type="text" always, CSS masking */}
              <div className="w-full mt-3 sm:mt-4">
                <div className="flex justify-between items-center mb-1.5">
                  <p className="text-[13px] sm:text-[14px] font-[400] poppins-font text-[#030303]">Password</p>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => { if (!isLoading) setShowPassword((prev) => !prev); }}
                    className={`flex items-center gap-1.5 ${!isLoading ? "cursor-pointer" : "cursor-not-allowed opacity-70"}`}
                    style={{ touchAction: "manipulation" }}
                  >
                    <span className="text-[13px] sm:text-[14px] font-[400] poppins-font text-[#030303]">
                      {showPassword ? "Hide" : "Show"}
                    </span>
                  </button>
                </div>

                <div
                  className={`input-container w-full h-[44px] sm:h-[48px] rounded-[10px] flex items-center px-3 ${passwordError ? "border-2 border-red-500" : ""}`}
                  style={{ background: "#51218F4D" }}
                  onClick={() => { if (passwordInputRef.current && !isLoading) passwordInputRef.current.focus(); }}
                >
                  <input
                    ref={passwordInputRef}
                    type="text"
                    inputMode="text"
                    placeholder="Enter your password"
                    value={password}
                    onChange={handlePasswordChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isButtonDisabled) {
                        e.preventDefault();
                        handleLogin();
                      }
                    }}
                    disabled={isLoading}
                    autoComplete="current-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    className={`w-full bg-transparent outline-none text-[14px] sm:text-[15px] poppins-font text-[#030303] placeholder:text-[#00000080] ${showPassword ? "password-visible" : "password-masked"} ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                    style={{ fontSize: "16px" }}
                  />
                </div>

                {passwordError && <p className="text-[11px] sm:text-[12px] text-red-500 mt-1">{passwordError}</p>}

                <div className="mt-1.5 flex justify-end">
                  <Link to="/forgot-password" className="text-[11px] sm:text-[12px] md:text-[14px] poppins-font text-[#3D1768] hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Login Button */}
              <button
                onClick={handleLogin}
                disabled={isButtonDisabled}
                className="group relative overflow-hidden w-full max-w-[500px] h-[44px] sm:h-[48px] rounded-[35px] text-white poppins-font text-[14px] sm:text-[15px] font-medium mt-5 sm:mt-6 bg-gradient-to-r from-[#3D1768] to-[#030303] hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{ touchAction: "manipulation" }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Logging in...
                  </div>
                ) : "Login"}
              </button>

              {/* Sign up */}
              <div className="mt-3 text-center">
                <p className="text-[12px] sm:text-[14px] poppins-font text-[#030303]">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-[#3D1768] font-medium hover:underline cursor-pointer">Sign up</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;