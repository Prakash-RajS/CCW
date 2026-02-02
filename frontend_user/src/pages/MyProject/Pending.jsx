import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BannerImg from "../../assets/myproject/banner.png";
import UserImg from "../../assets/myproject/user.png";
import FlagImg from "../../assets/myproject/usa-flag1.png";
import Footer from "../../component/Footer";
import Header from "../../component/Header";


export default function Pending() {
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
      <div className="relative -mt-[60px] md:-mt-[90px]  max-w-[1200px]  mx-auto bg-white rounded-[18px] shadow-xl p-6 space-y-6">
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
              <div className="h-[1px] bg-gray-200 w-full"></div>

{/* ================= PROJECT DESCRIPTION ================= */}
<div className="pt-4 space-y-3">

  <h3 className="text-[18px] font-semibold text-black">
    Describe about the project
  </h3>

  <div className="!border border-black/80 rounded-[12px] p-5 text-[15px] leading-[26px] text-gray-700">

    <p className="font-semibold mb-2">UI / UX Designer</p>

    <p>
      Hi, <b>*This post is to search for UI / UX Designer*</b> I am looking for someone
      who has good<br></br> experience in designing plans for formative years. We have a set of
      100s of works sheets and<br></br> desiginig for creating website and and other the attached
      image is a reference for style and <br></br>structure, not an exact layout to copy. The final
      design should look modern, clean, and premium.{" "}
      <span className="text-[#5A1FA8] font-semibold cursor-pointer">
        more
      </span>
    </p>

  </div>

</div>

{/* ================= ACTION BUTTON ================= */}
<div className="pt-6">
        <button
  onClick={() => navigate("/myprojectmessage")}
  className="w-[140px] py-3 rounded-full bg-[#5A1FA8] text-white font-semibold hover:opacity-90 transition"
>
  Message
</button>

</div>

       

      </div>

      <Footer />
    </div>
  );
}
