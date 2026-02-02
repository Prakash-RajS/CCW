import React, { useState } from "react";
import BannerImg from "../../assets/Landing/banner.png";
import UserImg from "../../assets/Landing/user.png";
import Footer from "../../component/Footer";

export default function EditWork() {
  const [filter, setFilter] = useState("All");
  const [openProject, setOpenProject] = useState(false);

  return (
    <div className="w-full min-h-screen bg-[#F5F5F5]">

      {/* ================= HEADER BG ================= */}
      <div className="relative w-full h-[433px] overflow-hidden">
        <img
          src={BannerImg}
          alt="banner"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#2B003A]/85 via-[#4B0066]/75 to-[#2B003A]/85" />

        {/* ================= TOP NAV ================= */}
        <div className="relative z-10 max-w-[1440px] mx-auto px-4 md:px-8 pt-6 flex items-center justify-between text-white">
          <h1
            className="text-[36px] font-bold"
            style={{
              fontFamily: "Trochut, cursive",
              background:
                "linear-gradient(270deg, #FFFFFF 22.62%, #BFA6FF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Talenta
          </h1>

          <div className="hidden md:flex flex-1 max-w-[610px] mx-6 h-[52px] items-center justify-between rounded-[50px] px-5 bg-white/20 backdrop-blur-sm">
            <span>Home</span>
            <span>Find Collaborator</span>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenProject(!openProject);
                }}
                className="text-[#C9A6FF] font-semibold"
              >
                My Project ▾
              </button>

              {openProject && (
                <div className="absolute top-8 left-0 bg-[#2B003A] rounded-[10px] shadow-lg w-[180px] z-50">
                  {["All Contracts", "Proposal", "Hired freelancers"].map(
                    (item) => (
                      <div
                        key={item}
                        className="px-4 py-3 text-sm text-white hover:bg-[#5A1FA8] cursor-pointer"
                      >
                        {item}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            <span>Financials</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm">Julie</span>
            <img
              src={UserImg}
              alt="User"
              className="w-9 h-9 rounded-full object-cover border border-white/20"
            />
          </div>
        </div>

        {/* ================= PAGE TITLE ================= */}
        <div className="relative z-10 max-w-[1221px] mx-auto mt-8 px-4 text-white">
          <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
            <div>
              <button className="flex items-center gap-2 text-sm opacity-80 mb-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="#ECE2E2"
                    strokeWidth="2"
                  />
                </svg>
                Back
              </button>

              <h2 className="text-[28px] font-semibold">My contracts</h2>
            </div>

            <p className="text-[22px] font-semibold">
              Total Budget: $10.00 USD
            </p>
          </div>

          <div className="flex gap-12 md:gap-[120px] border-b border-white/10">
            <button className="relative pb-4 text-[20px] font-semibold">
              Active contracts (02)
              <span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#8B5CF6] rounded-full" />
            </button>

            <button className="pb-4 text-[20px] font-semibold opacity-70">
              Pending contracts (07)
            </button>

            <button className="pb-4 text-[20px] font-semibold opacity-70">
              Completed contracts (07)
            </button>
          </div>
        </div>
      </div>

      {/* ================= CENTER WRAPPER (ONLY FIX) ================= */}
      <div className="max-w-[1440px] mx-auto px-4">

        {/* ================= CONTENT CARD ================= */}
        <div className="relative -mt-[140px] max-w-[1200px] mx-auto bg-white rounded-[18px] shadow-2xl p-6 md:p-8">

          {/* FILTER */}
          <div className="flex flex-wrap items-center gap-6 mb-8">
            <span className="text-[16px] font-medium">Select contract</span>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-[44px] w-[220px] px-4 rounded-[12px] !border border-gray-300"
            >
              <option>All</option>
              <option>Active</option>
              <option>Completed</option>
            </select>
          </div>

          <div className="h-[1px] bg-gray-300 mb-6" />

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-[18px] font-semibold">
                UI/UX Designer beginner
              </h3>
              <span className="px-4 py-1 rounded-full bg-[#5A1FA8] text-white text-[13px]">
                Fixed rate
              </span>
            </div>

            <p className="text-[15px] mb-2">
              <b>Client name:</b> Anisur Rahman
            </p>

            <p className="text-[15px]">
              <b>Budget:</b>{" "}
              <span className="text-[20px] font-bold">$400</span>{" "}
              <span className="text-gray-500">| 2 contracts</span>
            </p>
          </div>

          <div className="h-[1px] bg-gray-300 mb-6" />

          <div className="max-w-[795px] w-full flex flex-col gap-3 mb-6">
            <h3 className="text-[18px] font-semibold">
              Describe about the project
            </h3>

            <textarea className="w-full h-[290px] !border border-gray-700 rounded-[12px] p-4 resize-none" />
          </div>

          <div className="mb-10">
            <label className="text-[16px] font-semibold mb-2 block">
              Attachments
            </label>

            <input type="file" id="upload" className="hidden" multiple />

            <div
              onClick={() => document.getElementById("upload").click()}
              className="w-200 !border rounded-md py-6 text-center cursor-pointer hover:bg-gray-50"
            >
              Drag or <b className="text-purple-500 underline">upload project</b>{" "}
              files
            </div>
          </div>

          <div className="flex gap-4">
            <button className="px-8 py-3 rounded-full bg-[#5A1FA8] text-white font-semibold">
              Submit work
            </button>
            <button className="px-8 py-3 rounded-full bg-[#5A1FA8] text-white font-semibold">
              Message
            </button>
          </div>
        </div>
        
      </div>
      

      <div className="mt-10">
        <Footer />
      </div>
    </div>
  );
}
