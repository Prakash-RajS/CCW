import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import SignupSideBg from "../../assets/Auth/SignupSideBg.png";

const AdminLogin = () => {
  const navigate = useNavigate();

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
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!password) return "Password is required";
    if (!regex.test(password))
      return "Min 8 chars with letters & numbers";
    return "";
  };

  /* -------------------- Submit -------------------- */
  const handleSubmit = (e) => {
    e.preventDefault();

    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    setErrors({ email: emailError, password: passwordError });

    if (emailError || passwordError) {
      toast.error("Please fix the form errors");
      return;
    }

    toast.promise(
      new Promise((resolve, reject) => {
        setTimeout(() => {
          if (
            formData.email === "admin@gmail.com" &&
            formData.password === "Admin123"
          ) {
            resolve();
          } else {
            reject(new Error("Invalid credentials"));
          }
        }, 1200);
      }),
      {
        loading: "Logging in...",
        success: () => {
          localStorage.setItem("adminLoggedIn", "true");
          return "Login successful!";
        },
        error: (err) => err.message,
      }
    ).then(() => {
      navigate("/admin/dashboard");
    });
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
                className={`w-full h-[44px] rounded-[8px] bg-[#B9A9CE] px-3 outline-none ${
                  errors.email && "border border-red-500"
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
                className={`w-full h-[44px] rounded-[8px] bg-[#B9A9CE] px-3 outline-none ${
                  errors.password && "border border-red-500"
                }`}
              />
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={!formData.email || !formData.password}
              className="w-full h-[45px] rounded-full text-white bg-gradient-to-r from-[#3B136F] to-black disabled:opacity-50"
            >
              Login
            </button>

            {/* Demo */}
            <div className="mt-5 text-xs bg-gray-100 p-3 rounded">
              <p>Email: admin@gmail.com</p>
              <p>Password: Admin123</p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AdminLogin;
