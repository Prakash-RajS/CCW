import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../utils/axiosConfig";
import SignupSideBg from "../../assets/Auth/SignupSideBg.png";

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  // ❌ Prevent direct access
  useEffect(() => {
    if (!email) {
      toast.error("Session expired. Please try again.");
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const isValidPassword = password.length >= 8 && /\d/.test(password);
  const passwordsMatch = confirmPassword && confirmPassword === password;

  // ---------------------------
  // Reset Password
  // ---------------------------
  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (!isValidPassword) {
      toast.error("Password must be at least 8 characters and include a number");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await api.post(
        "/auth/forgot-password/reset",
        null,
        {
          params: {
            email,
            new_password: password,
            confirm_password: confirmPassword,
          },
        }
      );

      toast.success("Password reset successful!");

      navigate("/reset-succes");

    } catch (error) {
      toast.error(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Background */}
      <img
        src={SignupSideBg}
        alt="Background"
        className="absolute inset-0 h-full w-full object-cover opacity-80%"
      />

      <div className="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
        <div
          className="relative w-full max-w-[740px] rounded-[32px] border-[1.5px] border-white 
                     bg-white/70 shadow-[0_0_10px_0_#FFFFFF] backdrop-blur-sm
                     p-8 sm:p-10 lg:p-12 xl:p-[60px]"
          style={{ minHeight: "595px", maxHeight: "95vh" }}
        >
          {/* Back Button */}
          <div
            className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 cursor-pointer select-none"
            onClick={() => navigate("/forgot-password")}
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20"
              style={{
                background:
                  "linear-gradient(180deg, rgba(3,3,3,0.9) 0%, rgba(81,33,143,0.9) 100%)",
                backdropFilter: "blur(90px)",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </div>
            <span className="text-[#030303] poppins-font text-lg">Back</span>
          </div>

          {/* Content */}
          <div className="flex flex-col items-center justify-center gap-8 pt-10">
            <div className="text-center">
              <h1 className="poppins-font text-[28px] font-normal text-[#030303]">
                Reset Password
              </h1>
              <p className="mt-3 text-[16px] text-[#3D1768] poppins-font">
                Create a strong new password for your account.
              </p>
            </div>

            <div className="w-full max-w-[554px] space-y-8">

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-[16px] text-[#030303]">
                  Password
                </label>
                <div
                  className={`relative flex items-center rounded-xl border bg-[#51218F4D]
                  ${password && !isValidPassword ? "border-red-500" : "border-white/40"}`}
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent px-4 py-3 text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-white"
                  >
                    👁
                  </button>
                </div>
                <p className="text-[14px] text-[#51218F]">
                  Must be at least 8 characters, including a number.
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-[16px] text-[#030303]">
                  Re-type Password
                </label>
                <div className="relative flex items-center rounded-xl border border-white/40 bg-[#51218F4D]">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-transparent px-4 py-3 text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-4 text-white"
                  >
                    👁
                  </button>
                </div>
                <p className="text-[14px] text-[#51218F]">
                  Re-enter the same password.
                </p>
              </div>

              {/* Submit */}
              <button
                type="button"
                disabled={loading}
                onClick={handleResetPassword}
                className="w-full rounded-[30px] bg-gradient-to-r from-[#3D1768] to-[#030303]
                           px-8 py-3 text-white font-medium disabled:opacity-60"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
