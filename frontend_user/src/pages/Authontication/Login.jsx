//login.jsx
import { useState } from "react";
import SignupSideBg from "../../assets/Auth/SignupSideBg.png";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/axiosConfig";
import { useUser } from "../../contexts/UserContext";
 
const Login = () => {
  const navigate = useNavigate();
  const { fetchUserData } = useUser(); // Get fetchUserData from context
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
 
  // ✅ MATCH BACKEND PASSWORD RULE
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
 
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
 
    if (!value.endsWith("@gmail.com")) {
      setEmailError("Email must be a Gmail address");
    } else {
      setEmailError("");
    }
  };
 
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
 
    if (!passwordRegex.test(value)) {
      setPasswordError(
        "must be at least 8 characters and include uppercase, lowercase, number & symbol"
      );
    } else {
      setPasswordError("");
    }
  };
 
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
 
  // 🔥 BACKEND LOGIN with UserContext integration
  const handleLogin = async () => {
  if (!email.endsWith("@gmail.com")) {
    toast.error("Please enter a valid Gmail address");
    return;
  }

  if (!passwordRegex.test(password)) {
    toast.error(
      "Password must be at least 8 characters with uppercase, lowercase, number and symbol"
    );
    return;
  }

  setIsLoading(true);

  try {
    // 1️⃣ Login (sets HttpOnly cookies)
    await api.post("/auth/login", null, {
      params: {
        email: email.toLowerCase().trim(),
        password,
      },
    });

    // 2️⃣ Sync user data
    const user = await fetchUserData();

    toast.success("Login successful 🎉");

    // 3️⃣ Decide redirect BASED ON ROLE
    if (!user?.role) {
      navigate("/role-section", { replace: true });
    } else if (user.role === "creator") {
      navigate("/home", { replace: true });
    } else if (user.role === "collaborator") {
      navigate("/col-home", { replace: true });
    }

  } catch (err) {
    const errorMessage =
      err.response?.data?.detail || "Invalid email or password";
    toast.error(errorMessage);
  } finally {
    setIsLoading(false);
  }
};
 
 
 
  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };
 
  return (
    <div className="fixed inset-0 overflow-hidden">
      <img
        src={SignupSideBg}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover opacity-80%"
      />
 
      <div className="relative w-screen h-screen flex justify-center items-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-[652px] min-h-[579px] rounded-[32px] border-[1.5px] border-white bg-white/70 shadow-[0_0_10px_0_#FFFFFF] flex flex-col items-center justify-center gap-6 p-6 sm:p-8 md:p-10">
 
          <div className="w-full max-w-[556px] flex flex-col gap-3">
 
            {/* Logo */}
            <div className="w-full flex items-center justify-center">
              <h1
                className="text-[32px] sm:text-[36px] md:text-[38px] font-[700] trochut-font leading-[100%] text-center
                 bg-gradient-to-l from-[#3D1768] to-[#030303] bg-clip-text text-transparent"
              >
                Talenta
              </h1>
            </div>
 
            <div className="w-full flex flex-col items-center">
              {/* Welcome */}
              <div className="w-full max-w-[460px] text-center space-y-2">
                <h2 className="text-[26px] sm:text-[30px] md:text-[32px] font-[500] poppins-font text-[#333333]">
                  Welcome back
                </h2>
                <p className="text-[14px] sm:text-[15px] md:text-[16px] font-[400] poppins-font text-[#3D1768]">
                  Collabrate with us. Explore with us
                </p>
              </div>
 
              {/* Email */}
              <div className="w-full mt-4 sm:mt-6">
                <p className="text-[15px] sm:text-[16px] font-[400] poppins-font text-[#000000] mb-2">
                  Email
                </p>
                <div
                  className="w-full h-[52px] sm:h-[56px] rounded-[12px] flex items-center px-4"
                  style={{ background: "#51218F4D" }}
                >
                  <input
                    type="text"
                    placeholder="Enter your email (must be @gmail.com)"
                    value={email}
                    onChange={handleEmailChange}
                    onKeyPress={handleKeyPress}
                    className="w-full bg-transparent outline-none text-[15px] sm:text-[16px] font-[Poppins] text-[#000000] placeholder:text-[#00000080]"
                  />
                </div>
                {emailError && (
                  <p className="text-[13px] sm:text-[14px] text-red-500 mt-1">
                    {emailError}
                  </p>
                )}
              </div>
 
              {/* Password */}
              <div className="w-full mt-4 sm:mt-6">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[15px] sm:text-[16px] font-[400] poppins-font text-[#030303]">
                    Password
                  </p>
 
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={togglePasswordVisibility}
                  >
                    <span className="text-[15px] sm:text-[18px] font-[400] poppins-font text-[#030303]">
                      {showPassword ? "Hide" : "Show"}
                    </span>
                  </div>
                </div>
 
                <div
                  className="w-full h-[52px] sm:h-[56px] rounded-[12px] flex items-center px-4"
                  style={{ background: "#51218F4D" }}
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={handlePasswordChange}
                    onKeyPress={handleKeyPress}
                    className="w-full bg-transparent outline-none text-[15px] sm:text-[16px] poppins-font text-[#030303] placeholder:text-[#03030380]"
                  />
                </div>
 
                <div className="flex justify-between items-center mt-2">
                  <p className="text-[13px] sm:text-[14px] text-red-500 min-h-[18px]">
                    {passwordError}
                  </p>
                  <Link
                    to="/forgot-password"
                    className="text-[14px] sm:text-[16px] poppins-font text-[#3D1768] cursor-pointer"
                  >
                    Forget password?
                  </Link>
                </div>
              </div>
 
              {/* LOGIN BUTTON */}
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className={`
                  group relative overflow-hidden
                  w-full max-w-[549px] h-[52px] sm:h-[56px]
                  rounded-[40px]
                  text-white poppins-font text-[16px] font-medium
                  mt-8 sm:mt-10
                  bg-gradient-to-r from-[#3D1768] to-[#030303]
                  hover:opacity-90 transition
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </div>
                ) : (
                  "Login"
                )}
              </button>
 
              {/* Sign up */}
              <div className="mt-4 text-center">
                <p className="text-[14px] sm:text-[16px] poppins-font text-[#030303]">
                  Don't have an account?{" "}
                  <Link
                    to="/signupac"
                    className="text-[#3D1768] font-medium hover:underline"
                  >
                    Sign up
                  </Link>
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