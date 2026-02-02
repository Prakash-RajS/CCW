import React, { useState } from "react";
import BannerImg from "../../assets/myproject/banner.png";
import Header from "../../component/Header";
import { useNavigate, useLocation } from "react-router-dom";
import Footer from "../../component/Footer";

export default function ActiveContracts() {
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { name: "Active contracts (02)", path: "/activecontracts" },
    { name: "Pending contracts (07)", path: "/pendingcontracts" },
    { name: "Completed contracts (07)", path: "/completedcontracts" }
  ];

  return (
    <div className="w-full min-h-screen bg-[#F5F5F5]">

      {/* HEADER */}
      <div className="absolute top-0 left-0 w-full z-50">
          <Header />
        </div>

      {/* BANNER */}
      <div className="relative w-full h-[260px] md:h-[433px] overflow-hidden">
        <img src={BannerImg} className="absolute  inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2B003A]/85 via-[#4B0066]/75 to-[#2B003A]/85  " />

        <div className="relative z-10 text-white max-w-[1221px] mx-auto px-4 md:px-0 pt-6 md:pt-[131px]">
          <div className="flex justify-between items-start md:items-center mb-1 md:mb-1">
            <div>
       <button className="flex items-center gap-2 text-[12px] md:text-[14px] opacity-80 mt-14 md:mb-4 hover:opacity-100 transition">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M20 12H4M4 12L10 6M4 12L10 18" stroke="white" strokeWidth="3" />
              </svg>
  Back
</button>       
       <h2 className="text-[18px] md:text-[28px] font-semibold">My contracts</h2>
            </div>
            <p className="text-[14px] md:text-[22px] mt-20   font-semibold">Total Budget: $10.00 USD</p>
          </div>

          {/* TOP TABS */}
          <div className="flex gap-6 md:gap-[120px] border-b border-white/10 text-[14px] md:text-[20px] font-semibold">
            {tabs.map(tab => (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="relative pb-3"
              >
                {tab.name}
                {location.pathname === tab.path && (
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
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-8">
          <span className="text-[16px] font-medium">Select contract</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-[44px] w-full md:w-[220px] px-4 rounded-[12px] !border"
          >
            <option>All</option>
            <option>Active</option>
            <option>Completed</option>
          </select>
        </div>

        {/* CONTRACT INFO */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h3 className="text-[18px] font-semibold">UI/UX Designer beginner</h3>
            <span className="px-4 py-1 rounded-full bg-[#5A1FA8] text-white text-[13px]">
              Fixed rate
            </span>
          </div>

          <p className="text-[15px] mb-1"><b>Client name:</b> Anisur Rahman</p>
          <p className="text-[15px]"><b>Budget:</b> $400 | 2 contracts</p>
        </div>

        <div className="w-full h-[1px] bg-gray-300 mb-6" />

        {/* INNER TABS */}
        <div className="flex gap-10 text-[16px] md:text-[20px] font-semibold mb-6 border-b border-gray-300">
          {["/activecontracts", "/watingcontracts"].map((path, i) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="relative pb-4"
            >
              {i === 0 ? "Active contracts (02)" : "Awaiting contracts (00)"}
              {location.pathname === path && (
                <span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#8B5CF6] rounded-full" />
              )}
            </button>
          ))}
        </div>
                <div className="w-full h-[1px] bg-gray-300 mb-6" />


      {/* CONTRACT GRID */}
<div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">

  {[
    { name: "James", amount: "$200" },
    { name: "Sebastian", amount: "$100" },
    { name: "Ezra", amount: "$2000" }
  ].map((item, i) => (
    
    <div key={i} className="relative pr-8">

      <h4 className="text-[18px] font-semibold mb-2">{item.name}</h4>
      <p>Next contracts to be paid: <b>{item.amount}</b></p>
      <p className="italic text-gray-500 mt-2">Submit work for next contracts</p>

      <div className="flex gap-4 mt-6">
        <button
          onClick={() => navigate("/editwork")}
          className="w-[160px] py-3 rounded-full bg-[#5A1FA8] text-white font-semibold hover:opacity-90 transition"
        >
          Select
        </button>

        <button
          onClick={() => navigate("/myprojectmessage")}
          className="w-[140px] py-3 rounded-full bg-[#5A1FA8] text-white font-semibold hover:opacity-90 transition"
        >
          Message
        </button>
      </div>

      {/* VERTICAL LINE (desktop only, except last column) */}
      {i < 2 && (
        <div
          className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2
                     h-[138px] w-[1px] bg-gray-300"
        />
      )}

    </div>
  ))}

</div>

      </div>

      {/* FOOTER */}
      <div className="mt-6">
        <Footer />
      </div>
    </div>
  );
}
