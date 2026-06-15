import React, { useState } from "react";

import BannerImg from "../../assets/Landing/banner.png";
import UserImg from "../../assets/Landing/user.png";

import SebastianImg from "../../assets/Landing/sebastian.jpg";
import BhuveshImg from "../../assets/Landing/bhuvesh.jpg";
import JonesImg from "../../assets/Landing/jones.jpg";
import SmithImg from "../../assets/Landing/smith.jpg";
import EzraImg from "../../assets/Landing/ezra.jpg";

import USAFlag from "../../assets/Landing/usa.png";
import JapanFlag from "../../assets/Landing/japan.png";
import ChinaFlag from "../../assets/Landing/china.png";

import Footer from "../../component/Footer";

export default function ProposalsPage() {
  const [openProject, setOpenProject] = useState(false);

  const proposals = [
    {
      name: "Sebastian",
      role: "Graphic Designer",
      rate: "$50.00 /hr",
      earnings: "$76k",
      status: "Accepted",
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
      status: "Rejected",
      image: BhuveshImg,
      location: "Tokyo, Japan",
      flag: JapanFlag,
      tags: ["Video Effects", "Color Grad", "Adds Edits", "Graphics"],
    },
    {
      name: "Jones",
      role: "Video Editor",
      rate: "$10.00 /hr",
      earnings: "$36k",
      status: "Accepted",
      image: JonesImg,
      location: "Tokyo, Japan",
      flag: JapanFlag,
      tags: ["Video Effects", "Color Grad", "Adds Edits", "Graphics"],
    },
    {
      name: "Smith",
      role: "Video Editor",
      rate: "$150.00 /hr",
      earnings: "$95k",
      status: "Accepted",
      image: SmithImg,
      location: "Tokyo, Japan",
      flag: JapanFlag,
      tags: ["Video Effects", "Color Grad", "Adds Edits", "Graphics"],
    },
    {
      name: "Ezra",
      role: "UI Designer",
      rate: "$10.00 /hr",
      earnings: "$36k",
      status: "Rejected",
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
  <div className="w-full h-[1px] bg-gray-300 mt-6" />

            <div className="px-4 py-6">
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-[#3f1b74] to-[#1a0b35] text-white">
                <div className="w-4 h-4 bg-white/30 rounded-sm"></div>
                <span className="font-semibold">Proposals (6)</span>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="flex-1 bg-[#fafafa] p-1 space-y-6">

            <div>
              <h3 className="text-[24px] font-bold text-[#111]">Proposals</h3>
              <p className="text-gray-800  text-[14px] mt-1">
                Select wallet for free-free transactions or card for secure payments.
              </p>
            </div>
              <div className="w-full h-[1px] bg-gray-300 mb-6" />


            {proposals.map((item, index) => (
              <div key={index}
                className="bg-white rounded-[22px] shadow-[0_18px_50px_rgba(0,0,0,0.06)] px-10 py-8 space-y-6">

                <div className="flex justify-between">
                  <div className="flex items-center gap-4">
                    <img src={item.image} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h4 className="font-semibold text-[16px]">{item.name}</h4>
                      <p className="text-gray-400 text-[13px]">{item.role}</p>
                    </div>
                  </div>

                <span
  className={`
    px-7 py-[8px]
    rounded-full
    text-[16px]
    font-semibold
    transition
    ${
      item.status === "Accepted"
        ? "text-[#51218F] !border border-[#51218F] bg-transparent"
        : "text-[#FF4C4A] !border border-[#FF4C4A] bg-transparent"
    }
  `}
>
  {item.status}
</span>

                </div>

                <div>
                  <p className="font-semibold text-[15px]">{item.rate}</p>
                  <p className="text-[13px] text-gray-400">
                    Total earnings <span className="font-semibold text-black">{item.earnings}</span> on web and mobile design
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {item.tags.map((tag, i) => (
                    <span key={i}
                      className="bg-[#6b4fa3] text-white text-[11px] px-5 py-[6px] rounded-full flex items-center gap-2">
                      {tag} <span className="opacity-70">✕</span>
                    </span>
                  ))}
                  <span className="text-[#6b4fa3] text-[12px] font-semibold cursor-pointer">more</span>
                </div>

                <div className="flex items-center justify-between pt-5 border-t text-[12px] text-gray-400">
                  <div className="flex items-center gap-1">
                    <span className="text-[#6b4fa3]">★★★★☆</span>
                    <span>4/5 (12 Reviews)</span>
                  </div>

                  <div className="flex items-center gap-2 mr-200">
                    <img src={item.flag} className="w-5 h-3  rounded-sm object-cover" />
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
