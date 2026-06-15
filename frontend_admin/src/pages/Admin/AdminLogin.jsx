// frontend_admin/src/pages/Admin/AdminLogin.jsx
import React, { useState, useEffect, useRef } from "react";
import toast from "../../component/Toast";
import { useNavigate } from "react-router-dom";
import SignupSideBg from "../../assets/Auth/SignupSideBg.png";
import api from "../../utils/axiosConfig";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent multiple submissions
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  // Refs to track initial values for change detection
  const initialEmailRef = useRef("");
  const initialPasswordRef = useRef("");
  const hasAttemptedSubmitRef = useRef(false);

  /* -------------------- Load Remembered Email on Mount -------------------- */
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true,
      }));
      initialEmailRef.current = rememberedEmail;
    }
  }, []);

  /* -------------------- Check if button should be disabled -------------------- */
  const hasValidationErrors = errors.email || errors.password;
  const isButtonDisabled = !formData.email || !formData.password || loading || isSubmitting || hasValidationErrors;

  /* -------------------- Input Change with Inline Validation -------------------- */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Reset submission state when user changes input after a failed attempt
    if (hasAttemptedSubmitRef.current) {
      if ((name === "email" && value !== initialEmailRef.current) || 
          (name === "password" && value !== initialPasswordRef.current)) {
        setIsSubmitting(false);
        hasAttemptedSubmitRef.current = false;
      }
    }

    // Clear error when user starts typing
    if (name === "email" && errors.email) {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
    if (name === "password" && errors.password) {
      setErrors((prev) => ({ ...prev, password: "" }));
    }

    // Validate inline only while user is actively typing and field has value
    if (name === "email" && value) {
      setErrors((prev) => ({
        ...prev,
        email: validateEmail(value),
      }));
    }
    if (name === "password" && value) {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(value),
      }));
    }
  };

  /* -------------------- Validations -------------------- */
  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!regex.test(email)) return "Only @gmail.com emails are allowed";
    return "";
  };

  const validatePassword = (password) => {
    const regex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!regex.test(password))
      return "Min 8 chars with letters, numbers & special characters";
    return "";
  };

  /* -------------------- Submit -------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isSubmitting || loading) {
      return;
    }

    // Guard: empty fields
    if (!formData.email) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      toast.error("Email is required");
      return;
    }
    if (!formData.password) {
      setErrors((prev) => ({ ...prev, password: "Password is required" }));
      toast.error("Password is required");
      return;
    }

    // Guard: format errors (client-side)
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (emailError) {
      setErrors((prev) => ({ ...prev, email: emailError }));
      toast.error("Invalid email format");
      return;
    }
    if (passwordError) {
      setErrors((prev) => ({ ...prev, password: passwordError }));
      toast.error("Invalid password format");
      return;
    }

    // Store current values to detect changes later
    initialEmailRef.current = formData.email;
    initialPasswordRef.current = formData.password;
    
    setIsSubmitting(true);
    setLoading(true);

    try {
      const response = await api.post("/admin/login", {
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      if (response.data) {
        // No localStorage for auth anymore - cookies handle everything
        if (formData.rememberMe) {
          localStorage.setItem("rememberedEmail", formData.email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        // Clear any saved view from previous session
        localStorage.removeItem('adminCurrentView');
        
        // Set flag for fresh login
        sessionStorage.setItem('justLoggedIn', 'true');

        toast.success("Login successful!");
        navigate("/admin/dashboard");
      }
    } catch (error) {
      setErrors({ email: "", password: "" });
      hasAttemptedSubmitRef.current = true;

      if (error.response) {
        const responseData = error.response.data?.detail;

        if (responseData && typeof responseData === 'object') {
          const errorType = responseData.error_type;

          if (errorType === "user_not_found") {
            setErrors((prev) => ({ ...prev, email: "Email address not found" }));
            toast.error("Email not found");
          } else if (errorType === "wrong_password") {
            setErrors((prev) => ({ ...prev, password: "Password is incorrect" }));
            toast.error("Incorrect password");
            setFormData((prev) => ({ ...prev, password: "" }));
            initialPasswordRef.current = ""; // Reset password ref since we cleared it
          } else {
            toast.error(responseData.message || "Login failed");
          }
        } else if (error.response.status === 401) {
          toast.error("Invalid email or password");
          setErrors((prev) => ({
            ...prev,
            email: "Invalid credentials",
            password: "Invalid credentials"
          }));
          setFormData((prev) => ({ ...prev, password: "" }));
          initialPasswordRef.current = "";
        } else {
          toast.error(error.response.data?.detail || "Login failed. Please try again.");
        }
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
      // Keep isSubmitting true to prevent further submissions until user changes input
    }
  };

  return (
    <section
      style={{ overflow: "hidden", height: "100dvh" }}
      className="flex bg-[#D9D9D9]"
    >
      {/* LEFT IMAGE */}
      <div className="hidden lg:flex w-1/2 h-full">
        <img
          src={SignupSideBg}
          className="w-full h-full object-cover"
          alt="Signup Background"
        />
      </div>

      {/* RIGHT SIDE */}
      <div className="relative w-full lg:w-1/2 flex items-center justify-center px-4 h-full">
        <div className="w-full max-w-[420px]">
          <form onSubmit={handleSubmit} className="rounded-[12px] px-6 py-8">
            <h1 className="text-center text-[45px] text-[#2B145A] trochut-font">
              Talenta
            </h1>

            <p className="text-center text-[20px] font-semibold mt-3">
              Hello Admin!
            </p>

            <p className="text-center text-sm text-[#3D1768] mb-6">
              Sign in to your account
            </p>

            {/* Email */}
            <div className="mb-4">
              <label className="text-sm">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className={`w-full h-[44px] rounded-[8px] bg-[#B9A9CE] px-3 outline-none ${
                  errors.email ? "border-2 border-red-500" : ""
                } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                placeholder="admin@gmail.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-5">
              <div className="flex justify-between">
                <label className="text-sm">Password</label>
                <button
                  type="button"
                  className="text-xs hover:underline"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  style={!showPassword ? { WebkitTextSecurity: 'disc' } : {}}
                  className={`w-full h-[44px] rounded-[8px] bg-[#B9A9CE] px-3 outline-none ${
                    errors.password ? "border-2 border-red-500" : ""
                  } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Remember Me */}
            <div 
              className={`mb-5 flex items-center ${!loading ? "cursor-pointer" : "cursor-not-allowed opacity-70"}`} 
              onClick={() => {
                if (!loading) {
                  setFormData(prev => ({ ...prev, rememberMe: !prev.rememberMe }));
                  // Reset submission state when remember me is toggled
                  if (hasAttemptedSubmitRef.current) {
                    setIsSubmitting(false);
                    hasAttemptedSubmitRef.current = false;
                  }
                }
              }}
            >
              <div
                className="w-[18px] h-[18px] rounded-[4px] mr-2 flex items-center justify-center flex-shrink-0 transition-all duration-200"
                style={{
                  background: formData.rememberMe
                    ? "linear-gradient(to right, #3B136F, #000000)"
                    : "#B9A9CE",
                  border: formData.rememberMe ? "none" : "1.5px solid #7c5aab",
                }}
              >
                {formData.rememberMe && (
                  <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                    <path
                      d="M1 3.5L4 6.5L10 1"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                name="rememberMe"
                id="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={loading}
                className="sr-only"
              />
              <label htmlFor="rememberMe" className="text-sm cursor-pointer select-none">
                Remember me for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={isButtonDisabled}
              className="w-full h-[45px] rounded-full text-white bg-gradient-to-r from-[#3B136F] to-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Add global styles to hide browser's password eye icon in all browsers */}
      <style>{`
  /* Hide Edge's password reveal button */
  input[type="password"]::-ms-reveal,
  input[type="password"]::-ms-clear {
    display: none !important;
  }

  /* Hide password reveal button for all browsers */
  input[type="password"]::-webkit-credentials-auto-fill-button,
  input[type="password"]::-webkit-caps-lock-indicator,
  input[type="password"]::-webkit-contacts-auto-fill-button,
  input[type="password"]::-webkit-credentials-auto-fill-button,
  input[type="password"]::-webkit-textfield-decoration-container {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }

  /* For Firefox */
  input[type="password"] {
    -moz-appearance: textfield;
  }

  /* Additional Edge specific */
  ::-ms-reveal {
    display: none !important;
  }

  /* Additional Chrome/Safari specific */
  ::-webkit-credentials-auto-fill-button {
    display: none !important;
    visibility: hidden !important;
  }

  /* Hide Firefox password reveal button */
  input[type="password"]::-moz-reveal {
    display: none !important;
  }

  /* ===== FIX BROWSER AUTOFILL STYLES ===== */
  
  /* Target autofilled inputs and override default styles */
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px #B9A9CE inset !important;
    -webkit-text-fill-color: #000000 !important;
    transition: background-color 5000s ease-in-out 0s !important;
  }

  /* For Firefox autofill */
  input:-moz-autofill,
  input:-moz-autofill-preview {
    background-color: #B9A9CE !important;
    color: #000000 !important;
  }

  /* For standard autofill */
  input:autofill {
    background-color: #B9A9CE !important;
    color: #000000 !important;
  }

  /* Optional: If you want to remove the yellow background completely and match your design */
  input:-webkit-autofill::first-line {
    color: #000000 !important;
  }

  /* Ensure your custom classes still apply even with autofill */
  .bg-\\[\\#B9A9CE\\] {
    background-color: #B9A9CE !important;
  }
`}</style>
    </section>
  );
};

export default AdminLogin;