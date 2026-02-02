import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import BannerImg from "../../assets/myproject/banner.png";
import FlagImg from "../../assets/myproject/usa-flag1.png";
import Footer from "../../component/Footer";
import Header from "../../component/Header";
import DownloadSuccessImg from "../../assets/myproject/downloadsuccess.png";

export default function CompletedContracts() {
  const [showSuccess, setShowSuccess] = useState(false);
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
</button>              <h2 className="text-[18px] md:text-[28px] font-semibold">My contracts</h2>
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


      {/* CONTENT */}
      <div className="relative -mt-[60px] md:-mt-[90px] max-w-[1200px] mx-auto bg-white rounded-[18px] shadow-xl p-6 space-y-6">

        {[1,2].map(i => (
<div key={i} className="relative !border border-gray-200 rounded-[14px] p-6 flex flex-col md:flex-row justify-between gap-6">

            <div className="flex-1">
              <h3 className="text-[20px] font-semibold mb-2">
                {i === 1 ? "UI / UX Designer" : "UI designer"}
              </h3>

              <p className="text-gray-600 text-[14px] mb-3">
                Fixed-price · Intermediate · Est. Budget: $2,000 · Posted 8 hours ago
              </p>

             <p className="text-[15px] text-gray-700 leading-[26px] mb-3">
  {i === 1 ? (
    <>
      Hi, *This post is to search for UI / UX Designer* I am looking for someone who has good experience in designing plans for formative years. We have a set of 100s of works sheets and desiginig for creating website and and other the attached image is a reference for style and structure, not an exact layout to copy. The final design should look modern, clean, and premium.
    </>
  ) : (
    <>
      We are looking for a talented Web UX/UI Designer to design the core pages and visual system for a new online learning platform. You will be responsible for creating a polished, modern, responsive design in Figma that can be implemented inside Thinkific by our development team.
    </>
  )}
  <span className="text-[#5A1FA8] font-semibold cursor-pointer"> more</span>
</p>


              <div className="flex flex-wrap items-center gap-4 text-[14px] text-gray-600">
                <span className="text-[#5A1FA8] font-semibold">$</span>
                <span>Fixed Rate</span>
                <span className="text-[#5A1FA8]">★★★★☆</span>
                <span>4/5 (12 Reviews)</span>
                <img src={FlagImg} className="w-5 h-5" />
                <span>Manhattan, USA</span>
              </div>
            </div>
<div
  onClick={() => setShowSuccess(true)}
  className="
    absolute top-4 right-1
    w-[52px] h-[52px] rounded-full
    bg-gradient-to-br from-[#7C3AED] to-[#2B0F4C]
    flex items-center justify-center
    shadow-[0_10px_30px_rgba(124,58,237,0.45)]
    cursor-pointer
  "
>
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3v12" />
    <path d="M7 10l5 5 5-5" />
    <path d="M5 21h14" />
  </svg>
</div>


          </div>
        ))}
      </div>

      <Footer />

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="relative w-[90%] max-w-[520px] h-[360px] bg-white rounded-[26px] flex flex-col items-center justify-center">

            <div
              onClick={() => setShowSuccess(false)}
              className="absolute top-6 left-6 w-[44px] h-[44px] rounded-full
                bg-gradient-to-br from-[#7C3AED] to-[#2B0F4C]
                flex items-center justify-center cursor-pointer"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M20 12H4M4 12L10 6M4 12L10 18" stroke="white" strokeWidth="3" />
              </svg>
            </div>

            <h1 className="text-[40px] font-bold mb-6" style={{ fontFamily: "Trochut", color: "#2B0F4C" }}>
              Talenta
            </h1>

            <img src={DownloadSuccessImg} className="w-[140px] h-[140px] mb-6" />

            <p className="text-[26px] md:text-[30px] font-semibold" style={{ fontFamily: "Milonga", color: "#2B0F4C" }}>
              Download successfully
            </p>

          </div>
        </div>
      )}

    </div>
  );
}
