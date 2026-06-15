import React, { useState } from "react";
import BannerImg from "../../assets/Landing/banner.png";
import UserImg from "../../assets/Landing/user.png";
import Footer from "../../component/Footer";

export default function AwatingContracts() {
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

            {/* MESSAGE SVG */}
                <svg
      width="28"
      height="24"
      viewBox="0 0 28 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-[20px] h-[20px] md:w-[24px] md:h-[24px] lg:w-[28px]"
    >
      <path
        d="M4 3H24C25.66 3 27 4.34 27 6V16C27 17.66 25.66 19 24 19H11L5 22V19H4C2.34 19 1 17.66 1 16V6C1 4.34 2.34 3 4 3Z"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 8H21"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M7 12H17"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
                {/* NOTIFICATION SVG */}
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] lg:w-[22px] lg:h-[22px]"
    >
      <path
        d="M14 22C14.828 22 15.5 21.328 15.5 20.5H12.5C12.5 21.328 13.172 22 14 22Z"
        fill="white"
      />
      <path
        d="M21 17V11C21 7.5 18.8 5 15.5 4.2V3.5C15.5 2.12 14.38 1 13 1C11.62 1 10.5 2.12 10.5 3.5V4.2C7.2 5 5 7.5 5 11V17L3 19V20H23V19L21 17Z"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="22" cy="5" r="3" fill="white" />
    </svg>
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

      {/* ================= CENTER WRAPPER ================= */}
      <div className="max-w-[1440px] mx-auto px-4">

      {/* ================= CONTENT CARD ================= */}
<div className="relative -mt-[140px] max-w-[1200px] mx-auto bg-white rounded-[18px] shadow-2xl p-8">

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

  {/* DIVIDER */}
  <div className="w-full h-[1px] bg-gray-300 mb-6" />

  {/* CONTRACT INFO */}
  <div className="mb-6">
    <div className="flex items-center gap-3 mb-3">
      <h3 className="text-[18px] font-semibold text-black">
        UI/UX Designer beginner
      </h3>

      <span className="px-4 py-1 rounded-full bg-[#5A1FA8] text-white text-[13px]">
        Fixed rate
      </span>
    </div>

    <p className="text-[15px] mb-2 text-black">
      <span className="font-semibold">Client name:</span>{" "}
      Anisur Rahman
    </p>

    <p className="text-[15px] text-black">
      <span className="font-semibold">Budget:</span>{" "}
      <span className="text-[20px] font-bold">$400</span>{" "}
      <span className="text-gray-500">| 2 contracts</span>
    </p>
  </div>

  {/* DIVIDER */}
  <div className="w-full h-[1px] bg-gray-300 mb-6" />

  {/* TABS */}
  <div className="flex gap-[120px] border-b border-gray-300 pb-4">

    {/* ACTIVE */}
    <button className="text-[18px] font-semibold text-black/80">
      Active contracts (02)
    </button>

    {/* AWAITING – ACTIVE */}
    <button className="relative text-[18px] font-semibold text-black">
      Awaiting contracts (00)
      <span className="absolute left-0 -bottom-[14px] w-full h-[3px] bg-[#5A1FA8] rounded-full" />
    </button>
    

  </div>
{/* EMPTY STATE – CONTRACTS (00) */}
<div
  className="
    w-[493px]
    h-[138px]
    flex
    items-center
    justify-center
    gap-[10px]
    rounded-[10px]
    !border-[0.5px]
    border-[#D0D0D0]
    bg-white
    px-[16px]
    py-[18px]
    text-[16px]
    font-medium
    text-black/10   
    opacity-100
    mt-4
   
  "
>
 <h4 className="text-black pb-22 pr-89">Contracts (00)</h4> 
</div>


</div>

      </div>

      <div className="mt-10">
        <Footer />
      </div>
    </div>
  );
}
