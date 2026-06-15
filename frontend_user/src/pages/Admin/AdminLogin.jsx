import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import SignupSideBg from "../../assets/Auth/SignupSideBg.png";
import api from "../../utils/axiosConfig";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  /* -------------------- Input Change -------------------- */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /* -------------------- Validations -------------------- */
  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!email) return "Email is required";
    if (!regex.test(email)) return "Only @gmail.com emails allowed";
    return "";
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!password) return "Password is required";
    if (!regex.test(password))
      return "Min 8 chars with letters, numbers & special characters";
    return "";
  };

  /* -------------------- Submit -------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    setErrors({ email: emailError, password: passwordError });

    if (emailError || passwordError) {
      toast.error("Please fix the form errors");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/admin/login', {
        email: formData.email,
        password: formData.password
      });

      console.log("Login response:", response.data);

      if (response.data) {
        // Store admin data in localStorage
        localStorage.setItem("adminLoggedIn", "true");
        localStorage.setItem("adminEmail", response.data.email);
        localStorage.setItem("adminName", response.data.name);
        localStorage.setItem("adminRole", response.data.role);

        // ✅ CRITICAL: Store the admin ID
        if (response.data.user_id) {
          localStorage.setItem("adminId", response.data.user_id);
          console.log("✅ Admin ID stored:", response.data.user_id);
        } else if (response.data.id) {
          localStorage.setItem("adminId", response.data.id);
          console.log("✅ Admin ID stored:", response.data.id);
        }

        // If you have a token, store it
        if (response.data.token) {
          localStorage.setItem("adminToken", response.data.token);
        }

        toast.success("Login successful!");
        navigate("/admin/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);

      // Handle different error responses
      if (error.response) {
        // Server responded with error
        const status = error.response.status;
        const data = error.response.data;

        if (status === 401) {
          toast.error("Invalid email or password");
        } else if (status === 404) {
          toast.error("Admin not found");
        } else if (status === 400) {
          toast.error(data.detail || "Invalid request");
        } else {
          toast.error(data.detail || "Login failed");
        }
      } else if (error.request) {
        // Request made but no response
        toast.error("Network error. Please check your connection.");
      } else {
        // Something else happened
        toast.error("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- Auto Redirect if Logged In -------------------- */
  useEffect(() => {
    if (localStorage.getItem("adminLoggedIn") === "true") {
      navigate("/admin/dashboard");
    }
  }, [navigate]);

  return (
    <section className="flex min-h-screen bg-[#D9D9D9]">
      <Toaster position="top-right" />

      {/* LEFT IMAGE */}
      <div className="hidden lg:flex w-1/2">
        <img src={SignupSideBg} className="w-full h-full object-cover" />
      </div>

      {/* RIGHT SIDE */}
      <div className="relative w-full lg:w-1/2 flex items-center justify-center px-4">
        <div className="w-full max-w-[420px]">
          <form
            onSubmit={handleSubmit}
            className=" rounded-[12px] px-6 py-8 "
          >
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
                className={`w-full h-[44px] rounded-[8px] bg-[#B9A9CE] px-3 outline-none ${errors.email && "border border-red-500"
                  }`}
                placeholder="admin@gmail.com"
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-5">
              <div className="flex justify-between">
                <label className="text-sm">Password</label>
                <button
                  type="button"
                  className="text-xs"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full h-[44px] rounded-[8px] bg-[#B9A9CE] px-3 outline-none ${errors.password && "border border-red-500"
                  }`}
              />
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!formData.email || !formData.password || loading}
              className="w-full h-[45px] rounded-full text-white bg-gradient-to-r from-[#3B136F] to-black disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>

            {/* Demo */}
          </form>
        </div>
      </div>
    </section>
  );
};

export default AdminLogin;
