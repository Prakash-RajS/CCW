// src/pages/NotFound.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-md text-center">
        {/* 404 */}
        <h1 className="text-[120px] sm:text-[150px] md:text-[180px] font-bold leading-none mb-6 bg-gradient-to-r from-[#51218F] to-[#7B3FA0] bg-clip-text text-transparent">
          404
        </h1>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
            Page Not Found
          </h2>

          <p className="text-gray-500 text-sm mb-6">
            The page you're looking for doesn't exist or you don't have access
            to this page.
          </p>

          {/* Back Button */}
          <div className="flex justify-center">
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 text-black hover:text-black/80 transition-colors group"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-[#51218F] to-[#2a0e4a] group-hover:from-[#3d1768] group-hover:to-[#1a0830] transition-all shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 12H5M12 19l-7-7 7-7"
                  />
                </svg>
              </div>

              <span className="font-medium text-base">
                Back
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;