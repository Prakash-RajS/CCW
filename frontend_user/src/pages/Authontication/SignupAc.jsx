import React, { useState, useEffect, useRef } from "react";
import toast from "../../component/Toast";
import SignupSideBg from "../../assets/Auth/SignupSideBg.png";

// Requested Imports
import api from "../../utils/axiosConfig";
import { useUser } from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";

// Terms and Privacy Modal Component
const TermsModal = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-3 flex justify-between items-center z-10">
          <h3 className="text-lg font-semibold text-[#3D1768]">{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content with custom scrollbar */}
        <div 
          className="p-5 overflow-y-auto max-h-[calc(80vh-60px)] text-gray-700 text-sm space-y-4"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#3D1768 #E5E7EB',
          }}
        >
          <style>
            {`
              .overflow-y-auto::-webkit-scrollbar {
                width: 6px;
              }
              .overflow-y-auto::-webkit-scrollbar-track {
                background: #E5E7EB;
                border-radius: 10px;
              }
              .overflow-y-auto::-webkit-scrollbar-thumb {
                background: #3D1768;
                border-radius: 10px;
              }
              .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                background: #2D1158;
              }
            `}
          </style>
          {content}
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-5 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-[#3D1768] to-[#8B3EFF] text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const SignupAc = () => {
  const userContext = useUser();
  const updateUserData = userContext?.updateUserData;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);

  // Modal states
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Add scale state for responsiveness
  const [scale, setScale] = useState(1);

  // INPUT STATES
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ERROR STATES
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Refs to track toast state
  const toastTimeoutRef = useRef(null);
  const currentToastIdRef = useRef(null);

  // Input refs for iOS keyboard focus
  const emailInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);

  // Force update for iOS
  const [forceUpdate, setForceUpdate] = useState(0);

  const navigate = useNavigate();

  // Detect iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  // Terms of Use content
  const termsContent = (
    <>
      <div>
        <h4 className="font-semibold text-base text-[#3D1768] mb-2">1. Introduction</h4>
        <p>Welcome to Talenta. These Terms of Use govern your access and use of our platform, which enables creators and freelancers to collaborate, manage projects, and monetize their work. By creating an account or using our services, you agree to these Terms.</p>
      </div>
      <div>
        <h4 className="font-semibold text-base text-[#3D1768] mb-2">2. User Eligibility</h4>
        <p>You must be at least 18 years old or meet the legal age in your country. You agree to provide accurate and complete information. You are responsible for maintaining the confidentiality of your account.</p>
      </div>
      <div>
        <h4 className="font-semibold text-base text-[#3D1768] mb-2">3. User Roles</h4>
        <p>Users may register as:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li><strong>Creators</strong> — to find collaborators and manage projects</li>
          <li><strong>Freelancers</strong> — to offer services and get hired</li>
        </ul>
        <p className="mt-1">You are responsible for all activities under your account.</p>
      </div>
      <div>
        <h4 className="font-semibold text-base text-[#3D1768] mb-2">4. Platform Usage</h4>
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>Use the platform for illegal or harmful activities</li>
          <li>Share false or misleading information</li>
          <li>Violate intellectual property rights</li>
          <li>Abuse or harass other users</li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-base text-[#3D1768] mb-2">5. Collaboration and Payments</h4>
        <p>The platform may facilitate project collaboration and communication. Payments, revenue splits, and commissions are processed via third-party providers such as Stripe. We are not responsible for disputes between users but may assist in moderation.</p>
      </div>
      <div>
        <h4 className="font-semibold text-base text-[#3D1768] mb-2">6. Marketplace Services</h4>
        <p>Freelancers are responsible for the quality and delivery of services. Creators must review service details before purchasing.</p>
      </div>
      <div>
        <h4 className="font-semibold text-base text-[#3D1768] mb-2">7. Account Suspension</h4>
        <p>We reserve the right to suspend or terminate accounts for violations. We may remove content that breaches guidelines.</p>
      </div>
      <div>
        <h4 className="font-semibold text-base text-[#3D1768] mb-2">8. Limitation of Liability</h4>
        <p>We are not liable for loss of data, revenue, or business. We are not responsible for disputes between users. We are not responsible for third-party service failures.</p>
      </div>
      <div>
        <h4 className="font-semibold text-base text-[#3D1768] mb-2">9. Changes to Terms</h4>
        <p>We may update these Terms at any time. Continued use of the platform means you accept the updated Terms.</p>
      </div>
      <div>
        <h4 className="font-semibold text-base text-[#3D1768] mb-2">10. Contact</h4>
        <p>For questions, contact: support@talenta.com</p>
      </div>
      <div>
        <h4 className="font-semibold text-base text-[#3D1768] mb-2">Thank You</h4>
        <p></p>
      </div>
    </>
  );

  // Privacy Policy content
  const privacyContent = (
    <>
      <div>
        <h4 className="font-semibold text-base text-[#3D1768] mb-2">1. Information We Collect</h4>
        <p>We collect personal details such as name, email, and phone number. We collect profile data such as portfolio, niche, and audience stats. We collect usage data such as activity and interactions.</p>
      </div>
      <div>
        <h4 className="font-semibold text-base text-[#3D1768] mb-2">2. How We Use Your Information</h4>
        <p>We use your data to provide and improve our services. We use your data to match creators with collaborators. We use your data to process payments and subscriptions. We use your data to send updates and notifications.</p>
      </div>
      <div>
        <h4 className="font-semibold text-base text-[#3D1768] mb-2">3. Sharing of Information</h4>
        <p>We may share data with payment providers such as Stripe or PayPal. We may share data with authentication services such as Firebase. We may share data with analytics tools. We do not sell your personal data.</p>
      </div>
      <div>
        <h4 className="font-semibold text-base text-[#3D1768] mb-2">4. Data Security</h4>
        <p>We use industry-standard security measures to protect your data. However, no system is completely secure.</p>
      </div>
      <div>
        <h4 className="font-semibold text-base text-[#3D1768] mb-2">5. Cookies and Tracking</h4>
        <p>We use cookies to improve user experience. We use cookies to analyze usage. We use cookies to personalize content.</p>
      </div>
      <div>
        <h4 className="font-semibold text-base text-[#3D1768] mb-2">6. User Rights</h4>
        <p>You can access your data. You can update or delete your account. You can opt out of communications.</p>
      </div>
      <div>
        <h4 className="font-semibold text-base text-[#3D1768] mb-2">7. Data Retention</h4>
        <p>We retain data only as long as necessary for platform operations and legal compliance.</p>
      </div>
      <div>
        <h4 className="font-semibold text-base text-[#3D1768] mb-2">8. Third-Party Services</h4>
        <p>Our platform integrates with services such as Firebase, Stripe, and AWS. Each service has its own privacy policy.</p>
      </div>
      <div>
        <h4 className="font-semibold text-base text-[#3D1768] mb-2">9. Updates to Policy</h4>
        <p>We may update this Privacy Policy. Changes will be notified via the platform.</p>
      </div>
      <div>
        <h4 className="font-semibold text-base text-[#3D1768] mb-2">10. Contact</h4>
        <p>For privacy concerns: privacy@talenta.com</p>
      </div>
      <div>
        <h4 className="font-semibold text-base text-[#3D1768] mb-2">Thank you</h4>
        <p></p>
      </div>
    </>
  );

  // Auto-scale based on screen height
  useEffect(() => {
    const updateScale = () => {
      const height = window.innerHeight;
      if (height < 750) {
        setScale(Math.max(height / 850, 0.85));
      } else {
        setScale(1);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // Cleanup toast on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      if (currentToastIdRef.current) {
        toast.dismiss(currentToastIdRef.current);
      }
    };
  }, []);

  // ------------ VALIDATION FUNCTIONS ---------------
  const validateEmail = (email) => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailRegex.test(email);
  };

  const validatePhone = (phone) => {
    return /^\d{10}$/.test(phone);
  };

  const validatePassword = (pass) => {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(pass);
  };

  const doPasswordsMatch = () => {
    return password && confirmPassword && password === confirmPassword;
  };

  // Sequential field enablement checks
  const isEmailCompleted = email.trim().length > 0 && !emailError && validateEmail(email.trim());
const isPhoneCompleted = phone.trim().length === 10 && !phoneError;
const isPasswordCompleted = password.trim().length > 0 && !passwordError && validatePassword(password);

  // iOS focus management with click simulation
  const focusWithIOSWorkaround = (inputRef) => {
    if (!inputRef.current) return;
    
    if (isIOS) {
      // Create and dispatch a click event for iOS
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      inputRef.current.dispatchEvent(clickEvent);
      inputRef.current.focus();
      // Force keyboard on iOS by simulating a touch
      inputRef.current.click();
      setForceUpdate(prev => prev + 1);
    } else {
      inputRef.current.focus();
    }
  };

  // iOS focus management - Auto focus next field when previous field is completed
  useEffect(() => {
    if (isEmailCompleted && phoneInputRef.current && !phone && !phoneError) {
      const timer = setTimeout(() => {
        if (phoneInputRef.current && !phoneInputRef.current.disabled) {
          focusWithIOSWorkaround(phoneInputRef);
        }
      }, isIOS ? 300 : 100);
      return () => clearTimeout(timer);
    }
  }, [isEmailCompleted, phone, phoneError, isIOS]);

  useEffect(() => {
    if (isPhoneCompleted && passwordInputRef.current && !password && !passwordError) {
      const timer = setTimeout(() => {
        if (passwordInputRef.current && !passwordInputRef.current.disabled) {
          focusWithIOSWorkaround(passwordInputRef);
        }
      }, isIOS ? 300 : 100);
      return () => clearTimeout(timer);
    }
  }, [isPhoneCompleted, password, passwordError, isIOS]);

  useEffect(() => {
    if (isPasswordCompleted && confirmPasswordInputRef.current && !confirmPassword && !confirmPasswordError) {
      const timer = setTimeout(() => {
        if (confirmPasswordInputRef.current && !confirmPasswordInputRef.current.disabled) {
          focusWithIOSWorkaround(confirmPasswordInputRef);
        }
      }, isIOS ? 300 : 100);
      return () => clearTimeout(timer);
    }
  }, [isPasswordCompleted, confirmPassword, confirmPasswordError, isIOS]);

  // Check if button should be disabled
  const isButtonDisabled = 
    !email || 
    !phone || 
    !password || 
    !confirmPassword || 
    loading || 
    checkingEmail || 
    checkingPhone || 
    !!emailError || 
    !!phoneError || 
    !!passwordError || 
    !!confirmPasswordError;

  // Function to show single toast at a time
  const showSingleToast = (type, title, message) => {
    // Clear any pending timeout
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    
    // Dismiss current toast if exists
    if (currentToastIdRef.current) {
      toast.dismiss(currentToastIdRef.current);
      currentToastIdRef.current = null;
    }
    
    // Show new toast based on type
    if (type === 'info') {
      currentToastIdRef.current = toast.info(title, message);
    } else if (type === 'error') {
      currentToastIdRef.current = toast.error(title, message);
    } else if (type === 'success') {
      currentToastIdRef.current = toast.success(title, message);
    } else if (type === 'loading') {
      currentToastIdRef.current = toast.loading(message);
    }
    
    // Clear the toast ID after 3 seconds
    toastTimeoutRef.current = setTimeout(() => {
      if (currentToastIdRef.current) {
        toast.dismiss(currentToastIdRef.current);
        currentToastIdRef.current = null;
      }
      toastTimeoutRef.current = null;
    }, 3000);
  };

  // Handle email change
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError("");

    if (value && !validateEmail(value)) {
      setEmailError("Only @gmail.com emails are allowed");
    }
  };

  // Handle email key press for iOS
  const handleEmailKeyPress = (e) => {
    if (e.key === 'Enter' && isEmailCompleted && !loading && !checkingEmail) {
      e.preventDefault();
      if (phoneInputRef.current && !phoneInputRef.current.disabled) {
        focusWithIOSWorkaround(phoneInputRef);
      }
    }
  };

  // Handle phone change
  const handlePhoneChange = (e) => {
    if (!isEmailCompleted) {
      showSingleToast('info', "Complete Email First", "Please complete the email field first before entering phone number");
      return;
    }
    
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(value);
    setPhoneError("");

    if (value && value.length > 0 && value.length < 10) {
      setPhoneError("Phone number must be exactly 10 digits");
    } else if (value && value.length === 10) {
      setPhoneError("");
    }
  };

  // Handle phone key press for iOS
  const handlePhoneKeyPress = (e) => {
    if (e.key === 'Enter' && isPhoneCompleted && !loading && !checkingPhone) {
      e.preventDefault();
      if (passwordInputRef.current && !passwordInputRef.current.disabled) {
        focusWithIOSWorkaround(passwordInputRef);
      }
    }
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    if (!isPhoneCompleted) {
      showSingleToast('info', "Complete Phone First", "Please complete the phone number field first before creating password");
      return;
    }
    
    const newPassword = e.target.value;
    setPassword(newPassword);

    if (newPassword && !validatePassword(newPassword)) {
      setPasswordError(
        "Min 8 chars with uppercase, lowercase, number & special character"
      );
    } else {
      setPasswordError("");
    }

    // Check confirm password match
    if (confirmPassword) {
      if (newPassword !== confirmPassword) {
        setConfirmPasswordError("Passwords do not match");
      } else {
        setConfirmPasswordError("");
      }
    }
  };

  // Handle password key press for iOS
  const handlePasswordKeyPress = (e) => {
    if (e.key === 'Enter' && isPasswordCompleted && !loading) {
      e.preventDefault();
      if (confirmPasswordInputRef.current && !confirmPasswordInputRef.current.disabled) {
        focusWithIOSWorkaround(confirmPasswordInputRef);
      }
    }
  };

  // Handle confirm password change
  const handleConfirmPasswordChange = (e) => {
    if (!isPasswordCompleted) {
      showSingleToast('info', "Create Password First", "Please create and validate your password first");
      return;
    }
    
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);

    if (password && newConfirmPassword && password !== newConfirmPassword) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  // Handle confirm password key press for iOS
  const handleConfirmPasswordKeyPress = (e) => {
    if (e.key === 'Enter' && !isButtonDisabled) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Toast reminder functions for clicking on disabled field containers
  const handlePhoneContainerClick = () => {
    if (!isEmailCompleted) {
      showSingleToast('info', "Complete Email First", "Please complete the email field first before entering phone number");
    } else if (phoneInputRef.current && !phoneInputRef.current.disabled) {
      focusWithIOSWorkaround(phoneInputRef);
    }
  };

  const handlePasswordContainerClick = () => {
    if (!isPhoneCompleted) {
      showSingleToast('info', "Complete Phone First", "Please complete the phone number field first before creating password");
    } else if (passwordInputRef.current && !passwordInputRef.current.disabled) {
      focusWithIOSWorkaround(passwordInputRef);
    }
  };

  const handleConfirmPasswordContainerClick = () => {
    if (!isPasswordCompleted) {
      showSingleToast('info', "Create Password First", "Please create and validate your password first");
    } else if (confirmPasswordInputRef.current && !confirmPasswordInputRef.current.disabled) {
      focusWithIOSWorkaround(confirmPasswordInputRef);
    }
  };

  // Check email exists
  const checkEmailExists = async (emailToCheck) => {
    try {
      setCheckingEmail(true);
      const response = await api.get("/auth/check-email", {
        params: { email: emailToCheck }
      });
      return response.data.exists;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    } finally {
      setCheckingEmail(false);
    }
  };

  const checkPhoneExists = async (phoneToCheck) => {
    try {
      setCheckingPhone(true);
      const response = await api.get("/auth/check-phone", {
        params: { phone: phoneToCheck }
      });
      return response.data.exists;
    } catch (error) {
      console.error("Error checking phone:", error);
      return false;
    } finally {
      setCheckingPhone(false);
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    setEmailError("");
    setPhoneError("");
    setPasswordError("");
    setConfirmPasswordError("");
    
    // Dismiss any existing toast
    if (currentToastIdRef.current) {
      toast.dismiss(currentToastIdRef.current);
      currentToastIdRef.current = null;
    }
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }

    if (!validateEmail(email.trim())) {
      setEmailError("Only @gmail.com emails are allowed");
      showSingleToast('error', "Validation Error", "Only @gmail.com emails are allowed");
      return;
    }

    if (!validatePhone(phone)) {
      setPhoneError("Phone number must be exactly 10 digits");
      showSingleToast('error', "Validation Error", "Phone number must be exactly 10 digits");
      return;
    }

    if (!validatePassword(password)) {
      setPasswordError(
        "Min 8 chars with uppercase, lowercase, number & special character"
      );
      showSingleToast('error', "Validation Error", "Password must meet the requirements");
      return;
    }

    if (!doPasswordsMatch()) {
      setConfirmPasswordError("Passwords do not match");
      showSingleToast('error', "Validation Error", "Passwords do not match");
      return;
    }

    const emailExists = await checkEmailExists(email.trim());
    if (emailExists) {
      setEmailError("This email is already registered");
      showSingleToast('error', "Registration Error", "This email is already registered. Please use a different email or login.");
      return;
    }

    const phoneExists = await checkPhoneExists(phone);
    if (phoneExists) {
      setPhoneError("This phone number is already registered");
      showSingleToast('error', "Registration Error", "This phone number is already registered. Please use a different phone number.");
      return;
    }

    showSingleToast('loading', null, "Sending verification code...");
    setLoading(true);

    try {
      const response = await api.post("/auth/signup/send-otp", null, {
        params: {
          email: email.trim()
        }
      });

      const otpToken = response.data.otp_token;

      // Dismiss loading toast
      if (currentToastIdRef.current) {
        toast.dismiss(currentToastIdRef.current);
        currentToastIdRef.current = null;
      }
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = null;
      }
      
      showSingleToast('success', "Code Sent!", "Verification code sent to your email!");

      setTimeout(() => {
        if (currentToastIdRef.current) {
          toast.dismiss(currentToastIdRef.current);
          currentToastIdRef.current = null;
        }
        navigate("/signup-otp", {
          state: {
            email: email.trim(),
            phone: phone,
            password: password,
            otpToken: otpToken,
            isSignup: true
          },
          replace: true
        });
      }, 1500);

      setEmail("");
      setPhone("");
      setPassword("");
      setConfirmPassword("");

    } catch (error) {
      // Dismiss loading toast
      if (currentToastIdRef.current) {
        toast.dismiss(currentToastIdRef.current);
        currentToastIdRef.current = null;
      }
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = null;
      }

      const backendError = error.response?.data?.detail;

      if (backendError) {
        if (Array.isArray(backendError)) {
          const errorMessages = backendError.map(err => err.msg).join(", ");
          showSingleToast('error', "Error", errorMessages);
        } else {
          showSingleToast('error', "Error", backendError);
        }
      } else if (error.response?.status === 422) {
        showSingleToast('error', "Invalid Email", "Invalid email format. Please check your email address.");
      } else {
        showSingleToast('error', "Error", "Failed to send verification code. Please try again.");
      }

      console.error("Send OTP error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#D9D9D9]">
      <style>{`
  /* Safari and iOS specific password field fixes */
  input[type="password"] {
    -webkit-text-security: disc !important;
    -webkit-appearance: none !important;
    appearance: none !important;
    font-family: monospace !important;
    letter-spacing: 2px !important;
  }

  /* Ensure password dots are visible */
  input[type="password"]::placeholder {
    font-family: inherit;
    letter-spacing: normal;
    color: #00000080;
  }

  /* Fix for Safari autofill */
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-text-fill-color: #030303 !important;
  }

  /* Hide autofill icons in Safari */
  input::-webkit-credentials-auto-fill-button,
  input::-webkit-caps-lock-indicator {
    display: none !important;
    visibility: hidden !important;
    pointer-events: none !important;
  }

  /* Ensure password field displays dots when typing */
  input[type="password"]:focus {
    outline: none;
  }

  /* iOS-specific fixes */
  @media (pointer: coarse) {
    input, input[type="email"], input[type="tel"], input[type="password"], input[type="text"] {
      font-size: 16px !important;
    }
  }
`}</style>
      
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="Terms of Use"
        content={termsContent}
      />

      <TermsModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        title="Privacy Policy"
        content={privacyContent}
      />

      <img
        src={SignupSideBg}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="relative w-full h-full flex items-center justify-center p-3 sm:p-4">
        <div
          className="relative w-full max-w-[620px] sm:max-w-[640px] rounded-[30px] border-[1.5px] border-white bg-white/70 shadow-[0_0_10px_0_#FFFFFF] flex flex-col items-center p-5 sm:p-6"
          style={{
            transform: `scale(${scale})`,
          }}
        >
          {/* Back Button */}
          <button
            onClick={() => navigate("/signup")}
            className="absolute top-3 left-3 
            flex items-center justify-center 
            w-8 h-8 sm:w-9 sm:h-9 rounded-full 
            bg-gradient-to-b from-[rgba(3,3,3,0.9)] to-[rgba(81,33,143,0.9)]
            border border-[#8A38F533]
            shadow-md transition-all duration-200 group cursor-pointer z-10
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>

          {/* Logo */}
          <div className="w-full flex items-center justify-center mb-1.5">
            <h1
              className="text-[34px] sm:text-[38px] font-[700] trochut-font leading-[100%] text-center
               bg-gradient-to-l from-[#3D1768] to-[#030303] bg-clip-text text-transparent"
            >
              Talenta
            </h1>
          </div>

          {/* Header */}
          <div className="w-full text-center mb-3">
            <h2 className="text-[24px] sm:text-[26px] font-[500] poppins-font text-[#333333] mb-1">
              Create an account
            </h2>
            <p className="text-[14px] sm:text-[15px] font-[400] poppins-font text-[#3D1768]">
              Collaborate with us. Explore with us
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="w-full space-y-2.5">
            {/* Email - Always enabled */}
            <div className="w-full">
              <label className="text-[14px] sm:text-[15px] font-[500] poppins-font text-[#000000] mb-1 block">
                Email
              </label>
              <div
                className={`input-container w-full h-[46px] sm:h-[50px] rounded-[12px] flex items-center px-4 ${emailError ? 'border-2 border-red-500' : ''}`}
                style={{ background: "#51218F4D" }}
                onClick={() => {
                  if (emailInputRef.current && !isLoading && !checkingEmail) {
                    emailInputRef.current.focus();
                  }
                }}
              >
                <input
                  ref={emailInputRef}
                  type="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  onKeyPress={handleEmailKeyPress}
                  disabled={loading || checkingEmail}
                  placeholder="Enter your email (must be @gmail.com)"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className={`w-full bg-transparent outline-none text-[15px] sm:text-[16px] font-[Poppins] text-[#000000] placeholder:text-[#00000080] ${loading || checkingEmail ? "opacity-70 cursor-not-allowed" : ""}`}
                  style={{ fontSize: '16px' }}
                />
              </div>
              {emailError && (
                <p className="text-[12px] sm:text-[13px] text-red-500 mt-1">
                  {emailError}
                </p>
              )}
            </div>

            {/* Phone - Enabled only after email is completed */}
            <div className="w-full">
              <label className="text-[14px] sm:text-[15px] font-[500] poppins-font text-[#000000] mb-1 block">
                Phone
              </label>
              <div
                className={`input-container w-full h-[46px] sm:h-[50px] rounded-[12px] flex items-center px-4 ${phoneError ? 'border-2 border-red-500' : ''} ${!isEmailCompleted ? 'opacity-60 cursor-pointer' : ''}`}
                style={{ background: "#51218F4D" }}
                onClick={handlePhoneContainerClick}
              >
                <input
                  ref={phoneInputRef}
                  type="tel"
                  required
                  value={phone}
                  onChange={handlePhoneChange}
                  onKeyPress={handlePhoneKeyPress}
                  disabled={loading || checkingPhone || !isEmailCompleted}
                  maxLength="10"
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                  className={`w-full bg-transparent outline-none text-[15px] sm:text-[16px] font-[Poppins] text-[#000000] placeholder:text-[#00000080] ${loading || checkingPhone || !isEmailCompleted ? "opacity-70 cursor-not-allowed" : ""}`}
                  style={{ fontSize: '16px' }}
                />
              </div>
              {phoneError && (
                <p className="text-[12px] sm:text-[13px] text-red-500 mt-1">
                  {phoneError}
                </p>
              )}
           <p className="text-[11px] sm:text-[12px] font-bold text-black/80 text-center mt-1 whitespace-normal sm:whitespace-nowrap">
  We strongly recommend adding a phone number. This will help verify your account and keep it safe.
</p>
            </div>

            {/* Password - Enabled only after phone is completed */}
            <div className="w-full">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[14px] sm:text-[15px] font-[500] poppins-font text-[#030303]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isPhoneCompleted) {
                      handlePasswordContainerClick();
                    } else {
                      setShowPassword(!showPassword);
                      // Maintain focus on iOS when toggling visibility
                      if (isIOS && passwordInputRef.current) {
                        setTimeout(() => {
                          focusWithIOSWorkaround(passwordInputRef);
                        }, 50);
                      }
                    }
                  }}
                  disabled={loading || !isPhoneCompleted}
                  className={`flex items-center gap-1.5 text-[13px] sm:text-[14px] font-[400] poppins-font text-[#030303] ${loading || !isPhoneCompleted ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
                  style={{ touchAction: 'manipulation' }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <div
                className={`input-container w-full h-[46px] sm:h-[50px] rounded-[12px] flex items-center px-4 ${passwordError ? 'border-2 border-red-500' : ''} ${!isPhoneCompleted ? 'opacity-60 cursor-pointer' : ''}`}
                style={{ background: "#51218F4D" }}
                onClick={handlePasswordContainerClick}
              >
                <input
  ref={passwordInputRef}
  type={showPassword ? "text" : "password"}
  required
  value={password}
  onChange={handlePasswordChange}
  onKeyPress={handlePasswordKeyPress}
  disabled={loading || !isPhoneCompleted}
  placeholder="Enter your password"
  autoComplete="new-password"
  autoCapitalize="none"
  autoCorrect="off"
  spellCheck={false}
  style={{
    fontSize: '16px',

    letterSpacing: showPassword ? 'normal' : '2px',
    WebkitTextFillColor: '#030303'
  }}
  className={`w-full bg-transparent outline-none text-[15px] sm:text-[16px] t text-[#030303] placeholder:text-[#03030380] ${loading || !isPhoneCompleted ? "opacity-70 cursor-not-allowed" : ""}`}
/>
              </div>

              {passwordError && (
                <p className="text-[11px] sm:text-[12px] text-red-500 mt-1 leading-tight">
                  {passwordError}
                </p>
              )}
            </div>

            {/* Confirm Password - Enabled only after password is completed */}
            <div className="w-full">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[14px] sm:text-[15px] font-[500] poppins-font text-[#030303]">
                  Confirm Password
                </label>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isPasswordCompleted) {
                      handleConfirmPasswordContainerClick();
                    } else {
                      setShowConfirmPassword(!showConfirmPassword);
                      // Maintain focus on iOS when toggling visibility
                      if (isIOS && confirmPasswordInputRef.current) {
                        setTimeout(() => {
                          focusWithIOSWorkaround(confirmPasswordInputRef);
                        }, 50);
                      }
                    }
                  }}
                  disabled={loading || !isPasswordCompleted}
                  className={`flex items-center gap-1.5 text-[13px] sm:text-[14px] font-[400] text-[#030303] ${loading || !isPasswordCompleted ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
                  style={{ touchAction: 'manipulation' }}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>

              <div
                className={`input-container w-full h-[46px] sm:h-[50px] rounded-[12px] flex items-center px-4 ${
                  confirmPasswordError ? 'border-2 border-red-500' : 
                  password && confirmPassword && password === confirmPassword && isPasswordCompleted ? 'border-2 border-green-500' : ''
                } ${!isPasswordCompleted ? 'opacity-60 cursor-pointer' : ''}`}
                style={{ background: "#51218F4D" }}
                onClick={handleConfirmPasswordContainerClick}
              >
                <input
                  ref={confirmPasswordInputRef}
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  onKeyPress={handleConfirmPasswordKeyPress}
                  disabled={loading || !isPasswordCompleted}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className={`w-full bg-transparent outline-none text-[15px] sm:text-[16px] poppins-font text-[#030303] placeholder:text-[#03030380] ${loading || !isPasswordCompleted ? "opacity-70 cursor-not-allowed" : ""}`}
                  style={{ fontSize: '16px' }}
                />
              </div>

              {confirmPasswordError ? (
                <p className="text-[11px] sm:text-[12px] text-red-500 mt-1">
                  {confirmPasswordError}
                </p>
              ) : password && confirmPassword && password === confirmPassword && isPasswordCompleted ? (
                <p className="text-[11px] sm:text-[12px] text-green-500 mt-1">
                  Passwords match ✓
                </p>
              ) : null}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isButtonDisabled}
              className={`
                group relative overflow-hidden
                w-full mt-5 py-[14px] rounded-full
                bg-gradient-to-r from-[#3D1768] to-[#8B3EFF]
                text-white font-bold poppins-font text-[15px] sm:text-[16px]
                shadow-xl hover:shadow-2xl transition
                disabled:opacity-50 disabled:cursor-not-allowed
                ${!isButtonDisabled ? 'cursor-pointer' : 'cursor-not-allowed'}
              `}
              style={{ touchAction: 'manipulation' }}
            >
              <span className="absolute inset-0 -translate-x-[120%] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 transition-transform duration-[1200ms] ease-out group-hover:translate-x-[120%]" />
              <span className="absolute inset-0 rounded-full bg-white/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="relative z-10 group-hover:scale-105 transition-transform duration-300">
                {loading ? "Sending Code..." : checkingEmail ? "Checking Email..." : checkingPhone ? "Checking Phone..." : "Send Verification Code"}
              </span>
            </button>

            {/* Terms */}
           <p className="text-[11px] sm:text-[12px] text-black/70 text-center mt-1.5 leading-tight font-bold">
  By creating an account, you agree to the{" "}
  <button 
    type="button"
    onClick={() => setShowTermsModal(true)}
    className="underline text-black/80 hover:text-[#3D1768] transition-colors cursor-pointer font-bold"
    style={{ touchAction: 'manipulation' }}
  >
    Terms of use
  </button>{" "}
  and{" "}
  <button 
    type="button"
    onClick={() => setShowPrivacyModal(true)}
    className="underline text-black/80 hover:text-[#3D1768] transition-colors cursor-pointer font-bold"
    style={{ touchAction: 'manipulation' }}
  >
    Privacy Policy
  </button>
  .
</p>

            {/* Login Link */}
           <p className="text-center text-[13px] sm:text-[14px] poppins-font text-[#030303] pb-1 font-bold">
  Already have an account?{" "}
  <a
    href="/login"
    onClick={(e) => {
      e.preventDefault();
      if (currentToastIdRef.current) {
        toast.dismiss(currentToastIdRef.current);
        currentToastIdRef.current = null;
      }
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = null;
      }
      navigate("/login");
    }}
    className="text-[#3D1768] font-bold hover:underline cursor-pointer"
    style={{ touchAction: 'manipulation' }}
  >
    Log In
  </a>
</p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupAc;