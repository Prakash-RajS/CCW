import React, { useState } from "react";

import BannerImg from "../../assets/myproject/banner.png";
import UserImg from "../../assets/myproject/user.png";

import SebastianImg from "../../assets/myproject/sebastian.jpg";
import BhuveshImg from "../../assets/myproject/bhuvesh.jpg";
import JonesImg from "../../assets/myproject/jones.jpg";
import SmithImg from "../../assets/myproject/smith.jpg";
import EzraImg from "../../assets/myproject/ezra.jpg";

import USAFlag from "../../assets/myproject/usa.png";
import JapanFlag from "../../assets/myproject/japan.png";
import ChinaFlag from "../../assets/myproject/china.png";

import Footer from "../../component/Footer";
import Header from "../../component/Header";

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

    {/* DESKTOP HEADER */}
    <div className="absolute top-0 left-0 w-full z-50">
          <Header />
        </div>

    {/* BANNER */}
    <div className="relative w-full h-[433px] overflow-hidden">
      <img src={BannerImg} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#2B003A]/85 via-[#4B0066]/75 to-[#2B003A]/85" />
    </div>

    {/* MOBILE HEADER */}
    <div className="md:hidden bg-white px-4 py-3 border-b">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#6b4fa3] text-white">←</div>
        <div>
          <h3 className="font-semibold text-[16px]">Proposals</h3>
          <p className="text-[12px] text-gray-600 leading-tight">
            Select wallet for free-free transactions or card for secure payments.
          </p>
        </div>
      </div>
    </div>
    {/* MOBILE PURPLE STRIP */}
<div className="md:hidden bg-gradient-to-r from-[#3f1b74] to-[#1a0b35]  text-white px-4 py-3">
  <div className="flex items-center gap-3">
    <div className="w-4 h-4 bg-white/30 rounded-sm"></div>
    <span className="font-semibold">Proposals (4)</span>
  </div>
</div>


    {/* ================= MAIN WRAPPER ================= */}
    <div className="relative mt-3 md:-mt-[90px] flex justify-center px-2 md:px-6">
      <div className="w-full max-w-[1440px] bg-white rounded-[18px] shadow-xl overflow-hidden flex flex-col md:flex-row">

        {/* SIDEBAR (DESKTOP ONLY) */}
        <div className="hidden md:block w-[280px] border-r">

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
<div className="flex-1 bg-[#fafafa] px-3 pt-2 pb-5 md:p-1 space-y-6">

          {/* DESKTOP PAGE HEADER */}
          <div className="hidden md:block">
            <h3 className="text-[24px] font-bold text-[#111]">Proposals</h3>
            <p className="text-gray-800 text-[14px] mt-1">
              Select wallet for free-free transactions or card for secure payments.
            </p>
          </div>

          <div className="w-full h-[1px] bg-gray-300 mb-6 hidden md:block" />

          {/* PROPOSAL CARDS */}
          {proposals.map((item, index) => (
            <div
              key={index}
              className="relative bg-white rounded-[22px] shadow-[0_18px_50px_rgba(0,0,0,0.06)]
                         px-5 py-6 md:px-10 md:py-8 space-y-6"
            >

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img src={item.image} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <h4 className="font-semibold text-[16px]">{item.name}</h4>
                    <p className="text-gray-400 text-[13px]">{item.role}</p>
                  </div>
                </div>

                <span
                  className={`absolute md:static top-4 right-4
                    px-5 py-[6px] rounded-full text-[13px] md:text-[16px]
                    font-semibold whitespace-nowrap
                    ${
                      item.status === "Accepted"
                        ? "text-[#51218F] !border border-[#51218F]"
                        : "text-[#FF4C4A] !border border-[#FF4C4A]"
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
                  <span
                    key={i}
                    className="bg-[#6b4fa3] text-white text-[11px] px-5 py-[6px] rounded-full flex items-center gap-2"
                  >
                    {tag} <span className="opacity-70">✕</span>
                  </span>
                ))}
                <span className="text-[#6b4fa3] text-[12px] font-semibold cursor-pointer">more</span>
              </div>

         <div className="flex items-center justify-between pt-5 border-t text-[14px] text-gray-400">
  
  <div className="flex items-center gap-1">
    <span className="text-[#6b4fa3]">★★★★☆</span>
    <span>4/5 (12 Reviews)</span>
 

  <div className="flex items-center gap-2">
    <img src={item.flag} className="w-5 h-3 rounded-sm object-cover" />
    <span>{item.location}</span>
  </div>
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











