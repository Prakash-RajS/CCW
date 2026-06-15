import React, { useState } from "react";

import BannerImg from "../../assets/Landing/banner.png";
import UserImg from "../../assets/Landing/user.png";

import SebastianImg from "../../assets/Landing/sebastian.jpg";
import BhuveshImg from "../../assets/Landing/bhuvesh.jpg";
import EzraImg from "../../assets/Landing/ezra.jpg";

import USAFlag from "../../assets/Landing/usa.png";
import JapanFlag from "../../assets/Landing/japan.png";
import ChinaFlag from "../../assets/Landing/china.png";

import Footer from "../../component/Footer";

export default function Hiredfreelancers() {
  const [openProject, setOpenProject] = useState(false);

  const proposals = [
    {
      name: "Sebastian",
      role: "Graphic Designer",
      rate: "$50.00 /hr",
      earnings: "$76k",
      status: "message",
      image: SebastianImg,
      location: "Manhattan, USA",
      flag: USAFlag,
      tags: ["Poster design", "Mobile design", "Photoshop", "Illustrator"],
    },
    {
      name: "Bhuvesh Singh",
      role: "Video Editor",
      rate: "$40.00 /hr",
      earnings: "$56k",
      status: "messsage",
      image: BhuveshImg,
      location: "Tokyo, Japan",
      flag: JapanFlag,
      tags: ["Video Effects", "Color Grad", "Adds Edits", "Graphics"],
    },


    {
      name: "Ezra",
      role: "UI Designer",
      rate: "$10.00 /hr",
      earnings: "$36k",
      status: "message",
      image: EzraImg,
      location: "Beijing, CHINA",
      flag: ChinaFlag,
      tags: ["Figma", "Social Media", "Web design", "App design"],
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#F5F5F5]">

      {/* HEADER */}
      <div className="relative w-full h-[433px] overflow-hidden">
        <img src={BannerImg} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2B003A]/85 via-[#4B0066]/75 to-[#2B003A]/85" />

        {/* NAV */}
        <div className="relative z-10 max-w-[1440px] mx-auto px-8 pt-6 flex items-center justify-between text-white">
          <h1 className="text-[36px] font-bold"
            style={{
              fontFamily: "Trochut, cursive",
              background: "linear-gradient(270deg, #FFFFFF 22.62%, #BFA6FF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
            Talenta
          </h1>

          <div className="hidden md:flex flex-1 max-w-[610px] mx-6 h-[52px] items-center justify-between rounded-full px-5 bg-white/20 backdrop-blur-sm">
            <span>Home</span>
            <span>Find Collaborator</span>

            <div className="relative">
              <button onClick={() => setOpenProject(!openProject)} className="text-[#C9A6FF] font-semibold">
                My Project ▾
              </button>

              {openProject && (
                <div className="absolute top-8 left-0 bg-[#2B003A] rounded-[10px] shadow-lg w-[180px] z-50">
                  {["All Contracts", "Proposal", "Hired freelancers"].map(item => (
                    <div key={item} className="px-4 py-3 text-sm text-white hover:bg-[#5A1FA8] cursor-pointer">
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
            <img src={UserImg} className="w-9 h-9 rounded-full border border-white/20" />
          </div>
        </div>
      </div>

      {/* MAIN WRAPPER */}
      <div className="relative -mt-[120px] flex justify-center px-6">
        <div className="w-full max-w-[1440px] bg-white rounded-[18px] shadow-xl overflow-hidden flex">

          {/* SIDEBAR */}
          <div className="w-[280px] border-r">
            <div className="flex items-center gap-3 px-6 py-4 border-b">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#6b4fa3] text-white">←</div>
              <span className="font-semibold">Back</span>
            </div>
  <div className="w-full h-[1px] bg-gray-300 mt-10" />

            <div className="px-4 py-6">
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-[#3f1b74] to-[#1a0b35] text-white">
                
   {/* Search Icon */}
      <svg width="24" height="22" viewBox="0 0 24 24" fill="none"
        stroke="white" strokeWidth="2.3"
        strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <span className="text-[20px] font-medium tracking-wide text-white">
        Hired Freelancers
      </span>              </div>
            </div>
          </div>
          

      {/* ================= CONTENT ================= */}
<div className="flex-1 bg-[#FAFAFA] px-8 py-8 space-y-8">

{/* ======= HEADER BAR ======= */}
<div className="flex items-center justify-between mt-[-20px]">

{/* HEADER LEFT */}
<div className="flex items-center gap-4">

  {/* Icon */}
  <div className="w-[44px] h-[44px] rounded-[10px] bg-gradient-to-br from-[#6D28D9] to-[#2B0F4C] flex items-center justify-center shadow-md">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
      <path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z"/>
      <path d="M8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3z"/>
      <path d="M8 13c-2.67 0-8 1.34-8 4v2h10v-2c0-1.07.34-2.06.92-2.88C10.07 13.42 9.04 13 8 13z"/>
      <path d="M16 13c-1.04 0-2.07.42-2.92 1.12.58.82.92 1.81.92 2.88v2h10v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  </div>

  {/* Title Text */}
  <div className="flex flex-col">

    <h3 className="text-[26px] font-semibold text-[#0F0F0F] leading-[32px] tracking-[-0.2px]">
      My Hired Freelancers
    </h3>

    <p className="text-[15px] text-[#4B5563] leading-[20px] mt-[2px]">
      Manage your team and active contracts
    </p>

  </div>

</div>


  {/* RIGHT PANEL */}
<div className="flex items-center gap-3 ">

  {/* TOTAL HIRED CARD */}
  <div className="flex items-center gap-4 px-4 py-2 rounded-[14px]
    !border border-[#B9B9B9] bg-white
    shadow-[0_6px_20px_rgba(0,0,0,0.04)]
  ">

    {/* Purple count icon */}
    <div className="w-[40px] h-[40px] rounded-[10px]
      bg-gradient-to-br from-[#6D28D9] to-[#2B0F4C]
      flex items-center justify-center
      text-white text-[20px] font-semibold
    ">
      4
    </div>

    <div className="flex flex-col leading-tight">
      <span className="text-[22px] font-semibold text-[#0F0F0F]">
        Total Hired
      </span>
      <span className="text-[15px] text-[#4B5563]">
        Active Freelancers
      </span>
    </div>
  </div>


  {/* CONTRACTS CARD */}
  <div className="flex items-center gap-4 px-6 py-2 rounded-[14px]
    !border border-[#B9B9B9] bg-white
    shadow-[0_6px_20px_rgba(0,0,0,0.04)]
  ">

    {/* Check icon */}
    <div className="w-[40px] h-[40px] rounded-[10px]
      bg-gradient-to-br from-[#6D28D9] to-[#2B0F4C]
      flex items-center justify-center
    ">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="white" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>

    <div className="flex flex-col leading-tight">
      <span className="text-[22px] font-semibold text-[#0F0F0F]">
        Contracts
      </span>
      <span className="text-[15px] text-[#4B5563]">
        All time
      </span>
    </div>
  </div>

</div>

</div>


  <div className="w-full h-[1px] bg-gray-300 " />

  {/* ======= CARDS ======= */}
  {proposals.map((item, index) => (
    <div
      key={index}
      className="bg-white rounded-[22px] shadow-[0_18px_50px_rgba(0,0,0,0.06)] px-10 py-8 space-y-6"
    >

      {/* Top row */}
      <div className="flex justify-between items-start">

        <div className="flex items-center gap-4">
          <img src={item.image} className="w-12 h-12 rounded-full object-cover" />
          <div>
            <h4 className="font-semibold text-[16px]">{item.name}</h4>
            <p className="text-[13px] text-gray-400">{item.role}</p>
          </div>
        </div>

        <span
          className={`px-8 py-[6px] rounded-full text-[14px] font-semibold transition
          ${
            item.status === "message"
              ? "!border border-[#51218F] text-[#51218F]"
              :  "!border border-[#51218F] text-[#51218F]"

          }`}
        >
          {item.status}
        </span>

      </div>

      {/* Price */}
      <div>
        <p className="font-semibold text-[15px]">{item.rate}</p>
        <p className="text-[13px] text-gray-400 mt-1">
          Total earnings <span className="font-semibold text-black">{item.earnings}</span> on web and mobile design
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-3">
        {item.tags.map((tag, i) => (
          <span
            key={i}
            className="bg-[#6B4FA3] text-white text-[11px] px-5 py-[6px] rounded-full flex items-center gap-2"
          >
            {tag} <span className="opacity-70">✕</span>
          </span>
        ))}
        <span className="text-[#6B4FA3] text-[12px] font-semibold cursor-pointer">more</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-5 border-t text-[14px] text-gray-400">

        <div className="flex items-center gap-1">
          <span className="text-[#6B4FA3]">★★★★☆</span>
          <span>4/5 (12 Reviews)</span>
        </div>

        <div className="flex items-center gap-2 mr-180">
          <img src={item.flag} className="w-5 h-3 rounded-sm object-cover" />
          {item.location}
        </div>

      </div>

    </div>
  ))}
</div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
