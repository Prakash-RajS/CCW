import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom"; // Added useLocation
import SignupSideBg from "../../assets/Auth/SignupSideBg.png";
import { useUser } from "../../contexts/UserContext";
import toast from "../../component/Toast";

// Terms and Privacy Modal Component
const TermsModal = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-[500px] h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-5 py-3 flex justify-between items-center rounded-t-2xl">
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

        {/* Modal Content */}
        <div 
          className="flex-1 p-5 text-gray-700 text-sm space-y-4"
          style={{
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            maxHeight: 'calc(80vh - 120px)'
          }}
        >
          {content}
        </div>

        {/* Modal Footer */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200 px-5 py-3 flex justify-end rounded-b-2xl">
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

const SignUp = () => {
  const navigate = useNavigate();
  const location = useLocation(); // ADD THIS
  const [searchParams] = useSearchParams();
  const { fetchUserData, userData } = useUser() || {};
  
  // Modal states
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // ADD THIS FUNCTION - Handle back navigation
  const handleBackNavigation = () => {
    // Get the returnTo section from location state or default to 'hero-section'
    const returnToSection = location.state?.returnTo || 'hero-section';
    
    // Navigate to home page with state containing the section to scroll to
    navigate('/', { 
      state: { 
        scrollToSection: returnToSection 
      } 
    });
  };

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

  // Check for error from Auth0 callback redirect
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      const decodedError = decodeURIComponent(error);
      toast.error("Sign In Failed", decodedError);
      
      // Clean URL without reloading
      window.history.replaceState({}, "", "/signup");
    }
  }, [searchParams]);

  // Check if user is already logged in
  useEffect(() => {
    if (userData?.id) {
      navigate("/home");
    }
  }, [userData, navigate]);

  // 🔥 SOCIAL LOGIN HANDLER (Google, Facebook, Apple)
  const handleSocialSignup = (connection) => {
    const backendBaseUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/auth0/login`;
    window.location.href = `${backendBaseUrl}?provider=${connection}`;
  };

  return (
    <section className="flex h-screen w-full overflow-hidden bg-[#D9D9D9]">
      
      {/* Terms of Use Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="Terms of Use"
        content={termsContent}
      />

      {/* Privacy Policy Modal */}
      <TermsModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        title="Privacy Policy"
        content={privacyContent}
      />

      {/* ================= LEFT IMAGE SIDE ================= */}
      <div className="relative hidden lg:flex w-1/2 h-full flex-col">

        {/* Talenta on LEFT IMAGE */}
        <div className="absolute top-0 left-0 w-full px-6 py-4 z-20">
          <h1
            className="font-bold text-[32px]"
            style={{
              fontFamily: "Trochut, cursive",
              background:
                "linear-gradient(270deg, rgba(153,153,153,0.7) 22.62%, #FFFFFF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Talenta
          </h1>
        </div>

        <img
          src={SignupSideBg}
          alt="Signup Side Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* ================= RIGHT PANEL ================= */}
      <div className="relative w-full lg:w-1/2 h-full flex flex-col overflow-y-auto lg:overflow-y-hidden">

        {/* Back button on RIGHT - Desktop - CHANGED to use handleBackNavigation */}
        <div className="hidden lg:flex w-full justify-end px-6 py-3 flex-shrink-0">
          <button
            onClick={handleBackNavigation}
            className="w-[100px] h-[34px] rounded-[30px] cursor-pointer bg-gradient-to-r from-[#030303] to-[#51218F] hover:opacity-90 transition-opacity"
          >
            <span className="text-white font-semibold text-[13px]">
              Back
            </span>
          </button>
        </div>

        {/* ===== MOBILE BACKGROUND IMAGE ===== */}
        <div className="lg:hidden absolute inset-0 z-0 pointer-events-none group overflow-hidden">
          <img
            src={SignupSideBg}
            className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:-translate-x-[8%]"
            alt="background"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-y-0 right-0 w-[55%] bg-gradient-to-l from-white/80 via-white/50 to-transparent backdrop-blur-[10px] opacity-0 transition-opacity duration-700 ease-in-out group-hover:opacity-100" />
        </div>

        {/* ================= MOBILE HEADER ================= */}
        <div className="lg:hidden fixed top-0 left-0 w-full px-4 py-3 flex items-center justify-between z-30 bg-transparent">
          <h1
            className="font-bold text-[20px] sm:text-[24px]"
            style={{
              fontFamily: "Trochut, cursive",
              background: "linear-gradient(270deg, rgba(153,153,153,0.7) 22.62%, #FFFFFF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Talenta
          </h1>

          {/* Mobile Back button - CHANGED to use handleBackNavigation */}
          <button
            onClick={handleBackNavigation}
            className="w-[70px] h-[28px] sm:w-[80px] sm:h-[32px] rounded-[20px] cursor-pointer bg-gradient-to-r from-[#030303] to-[#51218F] hover:opacity-90 transition-opacity"
          >
            <span className="text-white font-semibold text-[11px] sm:text-[13px]">
              Back
            </span>
          </button>
        </div>

        {/* Main content - Centered vertically with reduced sizes */}
        <div className="flex-1 flex items-center justify-center px-4 lg:px-6 py-4 lg:py-0 min-h-0">
          <div className="relative w-full max-w-[360px] sm:max-w-[420px] md:max-w-[480px] lg:max-w-[500px]">

            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(61,23,104,0.5)] to-[rgba(61,23,104,0.5)] blur-[50px] sm:blur-[60px] lg:blur-[70px] rounded-[15px] sm:rounded-[20px]" />

            {/* Card - Reduced padding */}
            <div className="relative z-10 p-4 sm:p-5 md:p-6 lg:p-8">

              <div className="flex flex-col items-center gap-2 sm:gap-3 text-white">

                {/* Reduced heading size */}
                <h2 className="milonga-regular font-bold text-center text-[16px] xs:text-[18px] sm:text-[22px] md:text-[26px] lg:text-[30px] leading-tight text-purple-200 sm:bg-gradient-to-b sm:from-[#030303] sm:to-[#3D1768] sm:bg-clip-text sm:text-transparent">
                  Explore the world to<br />
                  experience the<br />
                  Collaboration
                </h2>

                {/* Reduced paragraph size */}
                <p className="text-[11px] sm:text-[12px] md:text-[13px] text-center opacity-80 px-2 sm:px-0 font-normal">
                  Collaborate for Clarity. Design for Delight.<br />
                  Better Ideas, Together.
                </p>

                {/* Reduced button sizes and gaps */}
                <div className="w-full space-y-2 sm:space-y-2.5 mt-2 sm:mt-3">
                  {/* GOOGLE BUTTON */}
                  <button 
                    onClick={() => handleSocialSignup('google')}
                    className="w-full h-[38px] sm:h-[42px] md:h-[44px] rounded-[35px] sm:rounded-[40px] border border-[#51218F] bg-gradient-to-r from-[rgba(23,9,41,0.8)] to-[rgba(61,23,104,0.8)] flex items-center justify-center gap-2 sm:gap-3 cursor-pointer hover:opacity-90 transition-opacity group relative"
                    title="Only @gmail.com accounts are accepted"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <g clipPath="url(#clip0_36_40)">
                        <path d="M8.36055 0.789371C5.96258 1.62125 3.89457 3.20018 2.46029 5.29425C1.026 7.38832 0.301037 9.88714 0.391883 12.4237C0.482728 14.9602 1.38459 17.4008 2.96501 19.3869C4.54543 21.373 6.72109 22.7999 9.17243 23.4581C11.1598 23.9709 13.2419 23.9934 15.2399 23.5237C17.0499 23.1172 18.7233 22.2476 20.0962 21C21.5251 19.6619 22.5622 17.9596 23.0962 16.0762C23.6765 14.0281 23.7798 11.8742 23.3981 9.78H12.2381V14.4094H18.7012C18.572 15.1477 18.2952 15.8524 17.8873 16.4813C17.4795 17.1102 16.9489 17.6503 16.3274 18.0694C15.5382 18.5914 14.6485 18.9427 13.7156 19.1006C12.7798 19.2746 11.82 19.2746 10.8843 19.1006C9.93591 18.9045 9.03874 18.5131 8.24993 17.9512C6.98271 17.0542 6.0312 15.7799 5.53118 14.31C5.02271 12.8126 5.02271 11.1893 5.53118 9.69187C5.8871 8.64228 6.47549 7.68663 7.25243 6.89625C8.14154 5.97515 9.26718 5.31674 10.5058 4.99326C11.7445 4.66979 13.0484 4.69374 14.2743 5.0625C15.232 5.35648 16.1078 5.87013 16.8318 6.5625C17.5606 5.8375 18.2881 5.11062 19.0143 4.38187C19.3893 3.99 19.7981 3.61687 20.1674 3.21562C19.0622 2.18714 17.765 1.38685 16.3499 0.860622C13.7731 -0.0750226 10.9536 -0.100167 8.36055 0.789371Z" fill="white" />
                        <path d="M8.3607 0.789367C10.9536 -0.100776 13.7731 -0.0762934 16.3501 0.858742C17.7654 1.38855 19.062 2.19269 20.1657 3.22499C19.7907 3.62624 19.3951 4.00124 19.0126 4.39124C18.2851 5.11749 17.5582 5.84124 16.832 6.56249C16.1079 5.87012 15.2321 5.35648 14.2745 5.06249C13.0489 4.69244 11.7451 4.66711 10.5061 4.98926C9.26712 5.31141 8.14079 5.96861 7.2507 6.88874C6.47377 7.67912 5.88538 8.63477 5.52945 9.68437L1.64258 6.67499C3.03384 3.91604 5.44273 1.80566 8.3607 0.789367Z" fill="#E33629" />
                        <path d="M0.611157 9.65624C0.820072 8.62085 1.16691 7.61816 1.64241 6.67499L5.52928 9.69186C5.02081 11.1892 5.02081 12.8126 5.52928 14.31C4.23428 15.31 2.93866 16.315 1.64241 17.325C0.452064 14.9556 0.0890305 12.2559 0.611157 9.65624Z" fill="#F8BD00" />
                        <path d="M12.2381 9.77814H23.3981C23.7799 11.8724 23.6766 14.0263 23.0963 16.0744C22.5623 17.9578 21.5252 19.66 20.0963 20.9981C18.8419 20.0194 17.5819 19.0481 16.3275 18.0694C16.9494 17.6499 17.4802 17.1092 17.8881 16.4796C18.296 15.8501 18.5726 15.1447 18.7013 14.4056H12.2381C12.2363 12.8644 12.2381 11.3213 12.2381 9.77814Z" fill="#587DBD" />
                        <path d="M1.64062 17.325C2.93687 16.325 4.2325 15.32 5.5275 14.31C6.02851 15.7804 6.98138 17.0548 8.25 17.9512C9.04127 18.5105 9.94037 18.8987 10.89 19.0912C11.8257 19.2652 12.7855 19.2652 13.7213 19.0912C14.6542 18.9333 15.5439 18.5821 16.3331 18.06C17.5875 19.0387 18.8475 20.01 20.1019 20.9887C18.7292 22.237 17.0558 23.1073 15.2456 23.5144C13.2476 23.9841 11.1655 23.9616 9.17813 23.4487C7.60632 23.0291 6.13814 22.2892 4.86563 21.2756C3.51874 20.2063 2.41867 18.8587 1.64062 17.325Z" fill="#319F43" />
                      </g>
                      <defs>
                        <clipPath id="clip0_36_40">
                          <rect width="24" height="24" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                    <span className="text-[12px] sm:text-[13px] md:text-[14px] font-medium">Continue with Google</span>
                    
                    {/* @gmail badge */}
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-medium">
                      @gmail
                    </span>
                  </button>

                  {/* FACEBOOK BUTTON */}
                  <button 
                    onClick={() => handleSocialSignup('facebook')}
                    className="w-full h-[38px] sm:h-[42px] md:h-[44px] rounded-[35px] sm:rounded-[40px] border border-[#51218F] bg-gradient-to-r from-[rgba(23,9,41,0.8)] to-[rgba(61,23,104,0.8)] flex items-center justify-center gap-2 sm:gap-3 cursor-pointer hover:opacity-90 transition-opacity group"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <g clipPath="url(#clip0_36_50)">
                        <mask id="mask0_36_50" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                          <path d="M0 0H24V24H0V0Z" fill="white" />
                        </mask>
                        <g mask="url(#mask0_36_50)">
                          <path fillRule="evenodd" clipRule="evenodd" d="M0 12.067C0 18.034 4.333 22.994 10 24V15.333H7V12H10V9.333C10 6.333 11.933 4.667 14.667 4.667C15.533 4.667 16.467 4.8 17.333 4.933V8H15.8C14.333 8 14 8.733 14 9.667V12H17.2L16.667 15.333H14V24C19.667 22.994 24 18.034 24 12.067C24 5.43 18.6 0 12 0C5.4 0 0 5.43 0 12.067Z" fill="#1877F2" />
                        </g>
                      </g>
                      <defs>
                        <clipPath id="clip0_36_50">
                          <rect width="24" height="24" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                    <span className="text-[12px] sm:text-[13px] md:text-[14px] font-medium">Continue with Facebook</span>
                  </button>

                  {/* APPLE BUTTON */}
                  <button 
                    onClick={() => handleSocialSignup('apple')}
                    className="w-full h-[38px] sm:h-[42px] md:h-[44px] rounded-[35px] sm:rounded-[40px] border border-[#51218F] bg-gradient-to-r from-[rgba(23,9,41,0.8)] to-[rgba(61,23,104,0.8)] flex items-center justify-center gap-2 sm:gap-3 cursor-pointer hover:opacity-90 transition-opacity group"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path d="M18.7026 12.7535C18.6719 9.71361 21.2398 8.25549 21.354 8.18348C19.911 6.11931 17.6636 5.83729 16.8629 5.80488C14.9508 5.61527 13.1308 6.90538 12.1594 6.90538C11.1916 6.90538 9.69339 5.83249 8.1067 5.86129C6.02388 5.89129 4.10193 7.04459 3.02858 8.86874C0.862246 12.541 2.47349 17.9835 4.58456 20.9621C5.61615 22.4203 6.84669 24.0584 8.46162 23.9984C10.0164 23.9384 10.6046 23.0155 12.4848 23.0155C14.365 23.0155 14.8943 23.9996 16.5399 23.9696C18.2138 23.9384 19.2737 22.4827 20.2979 21.021C21.483 19.3288 21.9705 17.6907 22 17.6067C21.9632 17.5911 18.7358 16.3826 18.7038 12.7523L18.7026 12.7535ZM15.6103 3.83312C16.4675 2.81663 17.0459 1.40652 16.8875 0C15.6533 0.048004 14.1562 0.804067 13.2708 1.81815C12.4762 2.71823 11.7799 4.15235 11.9666 5.53126C13.3445 5.63687 14.7519 4.84720 15.6103 3.83312Z" fill="white" />
                    </svg>
                    <span className="text-[12px] sm:text-[13px] md:text-[14px] font-medium">Continue with Apple</span>
                  </button>
                </div>

                {/* Reduced OR divider spacing */}
                <div className="w-full flex items-center gap-2 sm:gap-3 my-2 sm:my-3">
                  <span className="flex-1 h-px bg-white/30" />
                  <span className="text-xs sm:text-sm text-white/80">OR</span>
                  <span className="flex-1 h-px bg-white/30" />
                </div>

                {/* Reduced email signup button */}
                <button
                  onClick={() => navigate("/signupac")}
                  className="w-full h-[38px] sm:h-[42px] md:h-[44px] rounded-[35px] sm:rounded-[40px] cursor-pointer bg-gradient-to-r from-[#030303] via-[#2C114A] to-[#030303] font-semibold text-[12px] sm:text-[13px] md:text-[14px] hover:opacity-90 transition-opacity text-white"
                >
                  Sign up with email
                </button>

                {/* Reduced terms text size and margin - Updated with clickable links */}
                <p className="text-[9px] sm:text-[10px] md:text-[11px] text-center opacity-80 mt-2 sm:mt-3 px-2 sm:px-0">
                  By signing up, you agree to the{" "}
                  <button 
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-yellow-500 sm:text-[#170929] underline cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button 
                    type="button"
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-yellow-500 sm:text-[#170929] underline cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    Privacy Policy
                  </button>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignUp;