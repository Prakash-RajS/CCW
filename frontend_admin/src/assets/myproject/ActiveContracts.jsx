import React, { useState } from "react";
import BannerImg from "../../assets/Landing/banner.png"; // 👈 CHANGE PATH IF NEEDED
import UserImg from "../../assets/Landing/user.png";

import Footer from "../../component/Footer";

export default function ActiveContracts() {
  const [filter, setFilter] = useState("All");
  const [tab, setTab] = useState("active");
const [openProject, setOpenProject] = useState(false);

  return (
    <div className="w-full min-h-screen bg-[#F5F5F5]">

      {/* ================= HEADER BG ================= */}
      <div className="relative w-full h-[433px] overflow-hidden">

        {/* BACKGROUND IMAGE */}
        <img
          src={BannerImg}
          alt="banner"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* DARK GRADIENT OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2B003A]/85 via-[#4B0066]/75 to-[#2B003A]/85" />

        {/* ================= TOP NAV ================= */}
        <div className="relative z-10 max-w-[1440px] mx-auto px-8 pt-6 flex items-center justify-between text-white">
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

          <div className="hidden md:flex flex-1 max-w-[610px] mx-6 h-[52px] items-center justify-between rounded-[50px] px-[20px] bg-[rgba(255,255,255,0.19)] backdrop-blur-sm">
            <span>Home</span>
            <span>Find Collaborator</span>

            {/* MY PROJECT DROPDOWN */}
<div className="relative">

  {/* CLICK BUTTON */}
  <button
  onClick={(e) => {
    e.stopPropagation();
    setOpenProject(!openProject);
  }}
  className="text-[#C9A6FF] font-semibold cursor-pointer"
>
  My Project ▾
</button>

{/* DROPDOWN */}
{openProject && (
  <div
    className="
      absolute top-8 left-0
      bg-[#2B003A]
      rounded-[10px]
      shadow-lg
      w-[180px]
      overflow-hidden
      z-50
    "
  >
    {[
      "All Contracts",
      "Proposal",
      "Hired freelancers",
    ].map((item) => (
      <div
        key={item}
        className="
          px-4 py-3
          text-sm text-white
          hover:bg-[#5A1FA8]
          transition
          cursor-pointer
        "
        onClick={(e) => {
          e.stopPropagation();  
          console.log(item);    
        }}
      >
        {item}
      </div>
    ))}
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
<div
  className="
    relative z-10
    mx-auto
    text-white
  "
  style={{
    width: "1221px",
    height: "132px",
    marginTop: "31px",
  }}
>
  {/* TOP ROW */}
  <div className="flex justify-between items-start mb-[26px]">
    <div>
      <button className="flex items-center gap-2 text-[14px] opacity-80 mb-[14px]">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 18L9 12L15 6"
            stroke="#ECE2E2"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back
      </button>

      <h2 className="text-[28px] font-semibold leading-none">
        My contracts
      </h2>
    </div>

    <p className="text-[22px] font-semibold">
      Total Budget: $10.00 USD
    </p>
  </div>

  {/* TABS */}
  <div className="flex gap-[120px] !border-b border-white/10">
    {/* ACTIVE */}
    <button className="relative pb-[14px] text-[20px] font-semibold">
      Active contracts (02)
      <span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#8B5CF6] rounded-full" />
    </button>

    <button className="pb-[14px] text-[20px] font-semibold opacity-70">
      Pending contracts (07)
    </button>

    <button className="pb-[14px] text-[20px] font-semibold opacity-70">
      Completed contracts (07)
    </button>
  </div>
</div>


      </div>

{/* ================= CONTENT CARD ================= */}
<div className="relative -mt-[140px] max-w-[1200px] mx-auto bg-white rounded-[18px] shadow-2xl p-8">

  {/* FILTER ROW */}
  <div className="flex items-center gap-6 mb-8">
    <span className="text-[16px] font-medium">Select contract</span>

    <select
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      className="h-[44px] w-[220px] px-4 rounded-[12px] !border border-gray-300 outline-none font-medium"
    >
      <option>All</option>
      <option>Active</option>
      <option>Completed</option>
    </select>
  </div>

  {/* HORIZONTAL LINE */}
  <div className="w-full h-[1px] bg-gray-300 mb-6" />

  {/* CONTRACT INFO */}
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
      <span className="font-semibold">Client name:</span> Anisur Rahman
    </p>

    <p className="text-[15px]">
      <span className="font-semibold">Budget:</span>{" "}
      <span className="text-[20px] font-bold">$400</span>{" "}
      <span className="text-gray-500">| 2 contracts</span>
    </p>
  </div>

  {/* HORIZONTAL LINE */}
  <div className="w-full h-[1px] bg-gray-300 mb-6" />

  {/* TABS */}
  <div className="flex gap-14 mb-8 border-b border-gray-300">
    <button className="relative pb-4 text-[16px] font-semibold">
      Active contracts (02)
      <span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#5A1FA8] rounded-full" />
    </button>

    <button className="pb-4 text-[16px] font-medium text-gray-500">
      Awaiting contracts (0)
    </button>
  </div>

  {/* HORIZONTAL LINE */}
  <div className="w-full h-[1px] bg-gray-300 mb-8" />

{/* ================= CONTRACTS GRID ================= */}
<div className="grid grid-cols-3 relative">

  {/* ================= CARD 1 ================= */}
  <div className="relative px-10 py-8">
    <h4 className="text-[18px] font-semibold mb-3">James</h4>

    <p className="text-[15px] mb-2">
      Next contracts to be paid: <span className="font-semibold">$200</span>
    </p>

    <p className="italic text-[15px] text-gray-600 mb-8">
      Submit work for next contracts
    </p>

    <div className="flex gap-6">
      <button className="w-[160px] py-3 rounded-full bg-[#5A1FA8] text-white font-semibold">
        Submit work
      </button>
      <button className="w-[140px] py-3 rounded-full bg-[#5A1FA8] text-white font-semibold">
        Message
      </button>
    </div>

    {/* VERTICAL LINE */}
    <div
      className="absolute right-0 top-[50%] -translate-y-1/2
                 h-[138px] w-[1px] bg-gray-300"
    />
  </div>

  {/* ================= CARD 2 ================= */}
  <div className="relative px-10 py-8">
    <h4 className="text-[18px] font-semibold mb-3">Sebastian</h4>

    <p className="text-[15px] mb-2">
      Next contracts to be paid: <span className="font-semibold">$100</span>
    </p>

    <p className="italic text-[15px] text-gray-600 mb-8">
      Submit work for next contracts
    </p>

    <div className="flex gap-6">
      <button className="w-[160px] py-3 rounded-full bg-[#5A1FA8] text-white font-semibold">
        Submit work
      </button>
      <button className="w-[140px] py-3 rounded-full bg-[#5A1FA8] text-white font-semibold">
        Message
      </button>
    </div>

    {/* VERTICAL LINE */}
    <div
      className="absolute right-0 top-[50%] -translate-y-1/2
                 h-[138px] w-[1px] bg-gray-300"
    />
  </div>

  {/* ================= CARD 3 ================= */}
  <div className="px-10 py-8">
    <h4 className="text-[18px] font-semibold mb-3">Ezra</h4>

    <p className="text-[15px] mb-2">
      Next contracts to be paid: <span className="font-semibold">$2000</span>
    </p>

    <p className="italic text-[15px] text-gray-600 mb-8">
      Submit work for next contracts
    </p>

    <div className="flex gap-6">
      <button className="w-[160px] py-3 rounded-full bg-[#5A1FA8] text-white font-semibold">
        Submit work
      </button>
      <button className="w-[140px] py-3 rounded-full bg-[#5A1FA8] text-white font-semibold">
        Message
      </button>
    </div>
  </div>

</div>

</div>
<div className="-mx-4 mt-4">
       <Footer />
     </div>

    </div>
  );
}
