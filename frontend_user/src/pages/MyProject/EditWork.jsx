import React, { useState } from "react";
import BannerImg from "../../assets/myproject/banner.png";
import Footer from "../../component/Footer";
import Header from "../../component/Header";
import { useNavigate, useLocation } from "react-router-dom";

export default function EditWork() {
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="w-full min-h-screen bg-[#F5F5F5]">

    {/* ================= DESKTOP HEADER ================= */}
 {/* HEADER */}
      <div className="absolute top-0 left-0 w-full z-50">
          <Header />
        </div>

{/* ================= BANNER ================= */}
<div className="relative w-full h-[260px] md:h-[433px] overflow-hidden">

  {/* Background Image */}
  <img
    src={BannerImg}
    alt="banner"
    className="absolute inset-0 w-full h-full object-cover"
  />

  {/* Dark Overlay */}
  <div className="absolute inset-0 bg-gradient-to-r from-[#2B003A]/85 via-[#4B0066]/75 to-[#2B003A]/85" />

  {/* Content */}
  <div className="relative z-10 text-white max-w-[1221px] mx-auto px-4 md:px-0 pt-6 md:pt-[131px]">

    {/* Top Row */}
    <div className="flex justify-between items-start md:items-center mb-1 md:mb-1">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[12px] md:text-[14px] opacity-80 mt-14 md:mb-4 hover:opacity-100 transition"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 12H4M4 12L10 6M4 12L10 18" stroke="white" strokeWidth="3" />
          </svg>
          Back
        </button>

        <h2 className="text-[18px] md:text-[28px] font-semibold">
          My contracts
        </h2>
      </div>

      <p className="text-[14px] md:text-[22px] mt-20 font-semibold">
        Total Budget: $10.00 USD
      </p>
    </div>

    {/* ================= TOP TABS ================= */}
    <div className="flex gap-6 md:gap-[120px] border-b border-white/10 text-[14px] md:text-[20px] font-semibold">
      {["/activecontracts", "/pendingcontracts", "/completedcontracts"].map((path, i) => (
        <button
          key={path}
          onClick={() => navigate(path)}
          className="relative pb-3"
        >
          {["Active contracts (02)", "Pending contracts (07)", "Completed contracts (07)"][i]}

          {location.pathname === path && (
            <span className="absolute left-0 -bottom-[3px] w-full h-[3px] bg-[#8B5CF6] rounded-full" />
          )}
        </button>
      ))}
    </div>

  </div>
</div>

      {/* CONTENT CARD */}
      <div className="relative -mt-[60px] md:-mt-[90px] max-w-[1200px] mx-auto bg-white rounded-[18px] shadow-2xl p-6 md:p-8">

        {/* FILTER */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-6">
          <span className="text-[14px] md:text-[16px] font-medium">Select contract</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-[34px] md:h-[44px] w-full md:w-[220px] px-3 md:px-4 rounded-[10px] md:rounded-[12px] !border border-gray-300 text-[13px] md:text-base"
          >
            <option>All</option>
            <option>Active</option>
            <option>Completed</option>
          </select>
        </div>

        <div className="h-[1px] bg-gray-300 mb-6" />

        {/* PROJECT INFO */}
        <div className="mb-6 space-y-2 text-[13px] md:text-[15px]">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <h3 className="text-[15px] md:text-[18px] font-semibold">UI/UX Designer beginner</h3>
            <span className="px-3 md:px-4 py-[3px] md:py-1 rounded-full bg-[#5A1FA8] text-white text-[11px] md:text-[13px]">
              Fixed rate
            </span>
          </div>

          <p><b>Client name:</b> Anisur Rahman</p>

          <p>
            <b>Budget:</b> <span className="font-semibold md:text-[20px]">$400</span>{" "}
            <span className="text-gray-500">| 2 contracts</span>
          </p>
        </div>

        <div className="h-[1px] bg-gray-300 mb-6" />

        {/* DESCRIPTION */}
        <div className="mb-6">
          <h3 className="text-[14px] md:text-[18px] font-semibold mb-2">
            Describe about the project
          </h3>

          <textarea
            placeholder="Write here..."
            className="w-full h-[150px] md:h-[290px] !border border-gray-400 rounded-[12px] p-3 md:p-4 resize-none text-[13px] md:text-base"
          />
        </div>

        {/* ATTACHMENTS */}
        <div className="mb-8 space-y-2">
          <label className="text-[14px] md:text-[16px] font-semibold block">Attachments</label>

          <input type="file" id="upload" className="hidden" multiple />

          <div
            onClick={() => document.getElementById("upload").click()}
            className="!border border-[#5A1FA8] md:border-gray-300 rounded-full md:rounded-md py-2 md:py-6 text-center cursor-pointer hover:bg-gray-50 text-[13px] md:text-base"
          >
            Drag or <span className="text-[#5A1FA8] font-semibold underline">upload project</span> files
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 md:gap-4">
          <button className="flex-1 md:flex-none md:px-8 py-2 md:py-3 rounded-full bg-[#5A1FA8] text-white font-semibold text-[13px] md:text-base">
            Submit work
          </button>

                 <button
  onClick={() => navigate("/myprojectmessage")}
  className="w-[140px] py-3 rounded-full bg-[#5A1FA8] text-white font-semibold hover:opacity-90 transition"
>
  Message
</button>
        </div>

      </div>

      <div className="mt-10">
        <Footer />
      </div>
    </div>
  );
}
