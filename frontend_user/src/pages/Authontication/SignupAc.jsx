import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import SignupSideBg from "../../assets/Auth/SignupSideBg.png";

// Requested Imports
import api from "../../utils/axiosConfig";
import { useUser } from "../../contexts/userContext";
import { useNavigate } from "react-router-dom";

const SignupAc = () => {
  const { updateUserData } = useUser();

  const [showPassword, setShowPassword] = useState(false);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(false);

  // INPUT STATES
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");


  const navigate = useNavigate();

  // ------------ AUTO SCALE ---------------
  useEffect(() => {
    const updateScale = () => {
      const height = window.innerHeight;
      if (height < 700) {
        setScale(Math.max(height / 900, 0.75));
      } else {
        setScale(1);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // ------------ FORM SUBMIT ---------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    setPhoneError("");
    if (!email.trim().endsWith("@gmail.com")) {
      toast.error("Email must end with @gmail.com");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }

    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!strongPasswordRegex.test(password)) {
      toast.error(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
      );
      return;
    }


    const loadingToast = toast.loading("Creating account...");
    setLoading(true);


    try {
      const response = await api.post(
        "/auth/signup",
        null,
        {
          params: {
            email: email.trim(),
            phone,
            password,
          },
        }
      );



      toast.dismiss(loadingToast);
      toast.success("Account created successfully!");

      if (response.data?.user_id) {
        updateUserData({
          id: response.data.user_id,
          email: email.trim(),
          role: "user",
        });
      }

      navigate("/role-section", { replace: true });

      setEmail("");
      setPhone("");
      setPassword("");
    } catch (error) {
      toast.dismiss(loadingToast);

      setEmailError("");
      setPhoneError("");

      const backendError = error.response?.data?.detail;

      if (typeof backendError === "string") {
        if (backendError.toLowerCase().includes("email")) {
          setEmailError(backendError);
        }
        else if (backendError.toLowerCase().includes("phone")) {
          setPhoneError(backendError);
        }
        else {
          toast.error(backendError);
        }
      } else {
        toast.error("Signup failed. Please try again.");
      }

    }
    finally {
      setLoading(false);
    }

  };

  return (
    <div className="min-h-screen w-full overflow-y-auto">

      <Toaster
        position="top-center"
        toastOptions={{ duration: 4000, style: { fontSize: "15px" } }}
      />

      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${SignupSideBg})` }}
      />

      <div className="fixed inset-0 -z-10 bg-black/30" />


      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6">
        <div
          className="
            relative
            w-full max-w-[600px]
            rounded-[32px]
            border-[1.5px] border-white
            bg-white/70 backdrop-blur-2xl
            shadow-[0_0_10px_0_#FFFFFF]
            flex flex-col items-center
            origin-center
            transition-all duration-300
            p-6 sm:p-8 md:p-10 lg:p-12
          "
          style={{ transform: `scale(${scale})` }}
        >
          {/* BACK BUTTON */}
          {/* Back Button */}
          <button
            onClick={() => navigate("/signup")}
            className="
    absolute top-6 left-6
    w-11 h-11
    rounded-full
    bg-[#4B1D7A]
    flex items-center justify-center
    cursor-pointer
    shadow-md
    hover:scale-105
    transition
  "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>


          {/* Header */}
          <div className="relative w-full text-center">
            <h1 className="text-[36px] sm:text-[44px] md:text-[52px] lg:text-[58px] font-bold leading-none bg-gradient-to-l from-[#3D1768] to-[#030303] bg-clip-text text-transparent trochut-font mb-4 sm:mb-6">
              Talenta
            </h1>
          </div>

          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-[30px] sm:text-[34px] font-medium text-[#2E2E2E] poppins-font mb-1">
              Create an account
            </h2>
            <p className="text-[15px] text-[#3D1768] mt-1 poppins-font">
              Collaborate with us. Explore with us
            </p>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-[556px] space-y-5 sm:space-y-6"
          >
            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-black">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}

                className="w-full px-5 py-4 rounded-[12px] border-[1.5px] border-black
ring-1 ring-black
focus:ring-2 focus:ring-black text-base"
              />
              {emailError && (
                <p className="text-red-600 text-[13px] mt-1">
                  {emailError}
                </p>
              )}

            </div>

            {/* Phone */}
            <div className="space-y-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-black">
                  Phone
                </label>

                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                    setPhoneError("");
                  }}

                  maxLength="10"
                  className="
        w-full px-5 py-4
        rounded-[12px]
        border-[1.5px] border-black
ring-1 ring-black
focus:ring-2 focus:ring-black
        text-base
      "
                />
                {phoneError && (
                  <p className="text-red-600 text-[13px] mt-1">
                    {phoneError}
                  </p>
                )}
              </div>

              {/* Helper text — THIS IS THE PART YOU WANT */}
              <p className="text-[13px] text-black text-center leading-tight px-6 poppins-font">
                We strongly recommend adding a phone number. This will help verify your
                account and keep it safe.
              </p>
            </div>


            {/* Password */}
            {/* Password */}
            <div className="w-full">
              {/* Label + Show/Hide */}
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-black">
                  Password
                </label>

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex items-center gap-2 text-sm text-black font-medium poppins-font"
                >
                  {showPassword ? (
                    <>
                      {/* Eye closed */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                        <line x1="2" y1="2" x2="22" y2="22" />
                      </svg>

                      Hide
                    </>
                  ) : (
                    <>
                      {/* Eye open */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>

                      Show
                    </>
                  )}
                </button>
              </div>

              {/* Password input */}
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="
      w-full px-5 py-4
      rounded-[12px]
      border-[1.5px] border-black
      ring-1 ring-black
      focus:outline-none
      focus:ring-2 focus:ring-black
      text-base
    "
              />
            </div>


            <p
              onClick={() => navigate("/forgot-password")}
              className="text-right text-[14px] text-[#51218F] font-medium cursor-pointer mt-2"
            >
              Forget password?
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="
                group relative overflow-hidden cursor-pointer
                w-full mt-8 py-[18px] rounded-full
                bg-gradient-to-r from-[#3D1768] to-[#8B3EFF]
                text-white font-bold poppins-font text-lg
                shadow-xl hover:shadow-2xl transition
                disabled:opacity-70
              "
            >
              <span className="absolute inset-0 -translate-x-[120%] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 transition-transform duration-[1200ms] ease-out group-hover:translate-x-[120%]" />
              <span className="absolute inset-0 rounded-full bg-white/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="relative z-10 group-hover:scale-105 transition-transform duration-300">
                Sign Up
              </span>
            </button>

            <p className="text-[13px] text-black leading-relaxed px-8 mt-4 poppins-font">
              By creating an account, you agree to the{" "}
              <a href="#" className="underline text-black">Terms of use</a> and{" "}
              <a href="#" className="underline text-black">Privacy Policy</a>.
            </p>


            <p className="text-center text-[15px] font-medium poppins-font">
              Already have an account?{" "}
              <a href="/login" className="text-[#3D1768] underline font-semibold">
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
