import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BannerImg from "../../assets/myproject/banner.png";
import UserImg from "../../assets/myproject/user.png";
import FlagImg from "../../assets/myproject/usa-flag1.png";
import Footer from "../../component/Footer";
import Header from "../../component/Header";


export default function PendingContracts() {
  const [openProject, setOpenProject] = useState(false);
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
     {/* ================= CONTENT CARD ================= */}
<div className="relative -mt-[60px] md:-mt-[90px] - max-w-[1200px] mx-auto bg-white rounded-[18px] shadow-xl p-4 sm:p-6 space-y-6">

  {/* ================= CARD 1 ================= */}
<div className="relative !border border-bg-gray-300 rounded-[14px] p-4 sm:p-6 flex flex-col sm:flex-row justify-between gap-4 sm:gap-6">

    <div className="flex-1">
      <h3 className="text-[20px] font-semibold mb-2">
        UI / UX Designer
      </h3>

      <p className="text-gray-600 text-[14px] mb-3">
        Fixed-price · Intermediate · Est. Budget: $2,000 · Posted 8 hours ago
      </p>

      <p className="text-[15px] text-gray-700 leading-[26px] mb-3">
        Hi, *This post is to search for UI / UX Designer*
        I am looking for someone who has good <br className="hidden sm:block" />
        experience in designing plans for formative years. We have a set of 100s of works sheets and <br className="hidden sm:block" />
        desiginig for creating website and and other the attached image is a reference for style and <br className="hidden sm:block" />
        structure, not an exact layout to copy. The final design should look modern, clean, and <br className="hidden sm:block" />
        premium.{" "}
        <span className="text-[#5A1FA8] font-semibold cursor-pointer">
          more
        </span>
      </p>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[14px] text-gray-600">
        <span className="text-[#5A1FA8] font-semibold">$</span>
        <span>Fixed Rate</span>
        <span className="text-[#5A1FA8]">★★★★☆</span>
        <span>4/5 (12 Reviews)</span>
        <img src={FlagImg} alt="USA" className="w-5 h-5" />
        <span>Manhattan, USA</span>
      </div>
    </div>

    {/* BUTTON — unchanged on desktop */}
   <div className="absolute top-3 right-3">
  <button
    onClick={() => navigate("/pending")}
    className="px-8 py-2 rounded-full bg-[#5A1FA8] text-white font-semibold hover:opacity-90 transition"
  >
    Review
  </button>
</div>


  </div>

 {/* ================= CARD 2 ================= */}
<div className="relative !border border-[#D0D0D0] rounded-[14px] p-4 sm:p-6 flex flex-col sm:flex-row justify-between gap-4 sm:gap-6">

  <div className="flex-1">
    <h3 className="text-[20px] font-semibold mb-2">
      UI designer
    </h3>

    <p className="text-gray-600 text-[14px] mb-3">
      Fixed-price · Intermediate · Est. Budget: $2,000 · Posted 8 hours ago
    </p>

    <p className="text-[15px] text-gray-700 leading-[26px] mb-3">
      We are looking for a talented Web UX/UI Designer to design the core
      pages and visual <br className="hidden sm:block" />
      system for a new online learning platform. You
      will be responsible for creating a polished, <br className="hidden sm:block" />
      modern, responsive design in Figma that can be implemented inside Thinkific by our <br className="hidden sm:block" />
      development team.{" "}
      <span className="text-[#5A1FA8] font-semibold cursor-pointer">
        more
      </span>
    </p>

    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[14px] text-gray-600">
      <span className="text-[#5A1FA8] font-semibold">$</span>
      <span>Fixed Rate</span>
      <span className="text-[#5A1FA8]">★★★★☆</span>
      <span>4/5 (12 Reviews)</span>
      <img src={FlagImg} alt="USA" className="w-5 h-5" />
      <span>Manhattan, USA</span>
    </div>
  </div>

  {/* BUTTON — same as Card 1 */}
  <div className="absolute top-3 right-3">
    <button
      onClick={() => navigate("/pending")}
      className="px-8 py-2 rounded-full bg-[#5A1FA8] text-white font-semibold hover:opacity-90 transition"
    >
      Review
    </button>
  </div>

</div>


</div>


      <Footer />
    </div>
  );
}
