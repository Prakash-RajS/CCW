import React, { useState } from "react";
import BannerImg from "../../assets/Landing/banner.png";
import UserImg from "../../assets/Landing/user.png";
import FlagImg from "../../assets/Landing/usa-flag1.png";
import Footer from "../../component/Footer";

export default function PendingContracts() {
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

          <div className="hidden md:flex flex-1 max-w-[610px] mx-6 h-[52px] items-center justify-between rounded-full px-5 bg-white/20 backdrop-blur-sm">
            <span>Home</span>
            <span>Find Collaborator</span>

            <div className="relative">
              <button
                onClick={() => setOpenProject(!openProject)}
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
            <span className="text-sm">Julie</span>
            <img
              src={UserImg}
              alt="user"
              className="w-9 h-9 rounded-full border border-white/20"
            />
          </div>
        </div>

 {/* ================= PAGE TITLE ================= */}
<div className="relative z-10 max-w-[1221px] mx-auto mt-10 px-4 text-white">

  {/* TOP ROW */}
  <div className="flex justify-between mb-6">
    <h2 className="text-[28px] font-semibold">
      My contracts
    </h2>

    <p className="text-[22px] font-semibold">
      Total Budget: $10.00 USD
    </p>
  </div>

  {/* TABS */}
  <div className="relative flex gap-[120px] pb-4">

    {/* ACTIVE CONTRACTS */}
    <button className="text-[20px] font-semibold opacity-70">
      Active contracts (02)
    </button>

    {/* PENDING – ACTIVE */}
    <button className="relative text-[20px] font-semibold">
      Pending contracts (07)

      {/* ACTIVE TAB UNDERLINE */}
      <span className="absolute left-0 -bottom-[18px] w-full h-[3px] bg-[#8B5CF6] rounded-full" />
    </button>

    {/* COMPLETED */}
    <button className="text-[20px] font-semibold opacity-70">
      Completed contracts (07)
    </button>

    {/* FULL WIDTH VIOLET LINE */}
    <div
      className="
        absolute
        left-0
        bottom-0
        w-[1181px]
        h-[2px]
        bg-white/20
        opacity-100
      "
    />
  </div>
</div>


      </div>

      {/* ================= CONTENT CARD ================= */}
      <div className="relative -mt-[120px] max-w-[1200px]  mx-auto bg-white rounded-[18px] shadow-xl p-6 space-y-6">

        {/* ================= CARD 1 ================= */}
        <div className="!border border-gray-300 rounded-[14px] p-6 flex justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-[20px] font-semibold mb-2">
              UI / UX Designer
            </h3>

            <p className="text-gray-600 text-[14px] mb-3">
              Fixed-price · Intermediate · Est. Budget: $2,000 · Posted 8 hours ago
            </p>

            <p className="text-[15px] text-gray-700 leading-[26px] mb-3">
              Hi, *This post is to search for UI / UX Designer*
              I am looking for someone who has good <br></br>experience in designing plans
              for formative years. We have a set of 100s of works sheets and<br></br>
              desiginig for creating website and and other the attached image is a
              reference for style and <br></br> structure, not an exact layout to copy. The
              final design should look modern, clean, and<br></br> premium.{" "}
              <span className="text-[#5A1FA8] font-semibold cursor-pointer">
                more
              </span>
            </p>

            <div className="flex items-center gap-4 text-[14px] text-gray-600">
              <span className="text-[#5A1FA8] font-semibold">$</span>
              <span>Fixed Rate</span>
              <span className="text-[#5A1FA8]">★★★★☆</span>
              <span>4/5 (12 Reviews)</span>
              <img src={FlagImg} alt="USA" className="w-5 h-5" />
              <span>Manhattan, USA</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button className="px-10 py-3 rounded-full bg-[#5A1FA8] text-white font-semibold">
              Accept
            </button>
            <button className="px-10 py-3 rounded-full bg-[#5A1FA8] text-white font-semibold">
              Review
            </button>
          </div>
        </div>

        {/* ================= CARD 2 ================= */}
        <div className="!border border-gray-300 rounded-[14px] p-6 flex justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-[20px] font-semibold mb-2">
              UI designer
            </h3>

            <p className="text-gray-600 text-[14px] mb-3">
              Fixed-price · Intermediate · Est. Budget: $2,000 · Posted 8 hours ago
            </p>

            <p className="text-[15px] text-gray-700 leading-[26px] mb-3">
              We are looking for a talented Web UX/UI Designer to design the core
              pages and visual <br></br>system for a new online learning platform. You
              will be responsible for creating a polished,<br></br> modern, responsive
              design in Figma that can be implemented inside Thinkific by our<br></br>
              development team.{" "}
              <span className="text-[#5A1FA8] font-semibold cursor-pointer">
                more
              </span>
            </p>

            <div className="flex items-center gap-4 text-[14px] text-gray-00">
              <span className="text-[#5A1FA8] font-semibold">$</span>
              <span>Fixed Rate</span>
              <span className="text-[#5A1FA8]">★★★★☆</span>
              <span>4/5 (12 Reviews)</span>
              <img src={FlagImg} alt="USA" className="w-5 h-5" />
              <span>Manhattan, USA</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button className="px-10 py-3 rounded-full bg-[#5A1FA8] text-white font-semibold">
              Accept
            </button>
            <button className="px-10 py-3 rounded-full bg-[#5A1FA8] text-white font-semibold">
              Review
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
