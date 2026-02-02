import { useState } from "react";
import { useNavigate } from "react-router-dom";

import ColHeader from "../../component/ColHeader";
import heroBg from "../../assets/Mywork/hero-bg.png";
import Footer from "../../component/Footer";
import card5 from "../../assets/Mywork/card5.png";

const Allcontacts = () => {
  const [activeSubTab, setActiveSubTab] = useState("submitted");
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [showEditCard, setShowEditCard] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
    const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-[#f5f6fa] overflow-x-hidden">
    
    <div className="absolute top-0 left-0 w-full z-50">
          <ColHeader />
        </div>

    {/* ================= HERO SECTION ================= */}
<section
  className="relative w-full h-[350px] md:h-[420px]"
  style={{
    backgroundImage: `url(${heroBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
  <div className="absolute inset-0 bg-black/40" />

  <div className="relative z-10 px-6 md:px-12 pt-[90px] text-white">

<button
  className="
    flex 
    items-center gap-2 
    text-[12px] md:text-[14px] 
    opacity-80 
    ml-0 md:ml-[15px] 
    mb-2 md:mb-4 
    hover:opacity-100 
    transition
  "
>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M20 12H4M4 12L10 6M4 12L10 18" stroke="white" strokeWidth="3" />
  </svg>
  Back
</button>

{/* Title — Desktop Only */}
<h1
  className="
    text-[20px] md:text-[28px] 
    font-semibold 
    mb-6 md:mb-8 
    ml-0 md:ml-[15px]
  "
>
  All contracts
</h1>



    {/* ================= SUB TABS ================= */}
    <div className="relative mt-8">

      {/* MOBILE PURPLE BAR */}
      <div className="block md:hidden bg-[#4A2A68] rounded-md px-0 pt-4 pb-2">

        <div className="grid grid-cols-4 text-white text-[14px] font-semibold text-center">
          {[
            { key: "submitted", label1: "Submitted", label2: "Proposal(06)" },
            { key: "invitation", label1: "Job", label2: "Invitation(02)" },
            { key: "current", label1: "Current", label2: "Contracts(02)" },
            { key: "completed", label1: "Completed", label2: "Contracts(02)" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key)}
              className="relative py-3"
            >
              <span className={activeSubTab === tab.key ? "text-white" : "text-white/70"}>
                {tab.label1}<br />{tab.label2}
              </span>

              {/* ACTIVE UNDERLINE (MOBILE) */}
              {activeSubTab === tab.key && (
                <span className="absolute left-[15%] right-[15%] -bottom-[2px] h-[5px] bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* DESKTOP TABS (UNCHANGED) */}
      <div className="hidden md:block">
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-400/40" />

        <div className="
          flex 
          overflow-x-auto 
          md:overflow-x-visible 
          no-scrollbar 
          items-center 
          justify-between 
          md:justify-start 
          lg:grid 
          lg:grid-cols-4 
          gap-5 
          md:gap-6 
          lg:gap-0 
          pb-3 
          text-[13px] 
          lg:text-[16px] 
          font-semibold 
          text-center
        ">
          {[
            { key: "submitted", label: "Submitted Proposal (06)" },
            { key: "invitation", label: "Job Invitation (02)" },
            { key: "current", label: "Current Contracts (04)" },
            { key: "completed", label: "Completed Contracts (04)" },
          ].map((tab) => (
            <span
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key)}
              className={`cursor-pointer whitespace-nowrap transition-all duration-200 ${
                activeSubTab === tab.key
                  ? "text-white font-semibold"
                  : "text-white/60 font-medium hover:text-white/90"
              }`}
            >
              <span className="relative inline-block pb-2 px-1">
                {tab.label}

                {activeSubTab === tab.key && (
                  <span className="
                    absolute 
                    -left-1 md:-left-1.5 
                    -right-1 md:-right-1.5 
                    -bottom-[3px] 
                    h-[3.5px] 
                    bg-purple-500 
                    rounded-full 
                    shadow-[0_0_8px_rgba(168,85,247,0.6)]
                  " />
                )}
              </span>
            </span>
          ))}
        </div>
      </div>

    </div>
  </div>
</section>


      {/* CONTENT AREA */}
      <section className="relative -mt-[60px] md:-mt-[85px] px-4 md:px-12 pb-16">
        
{/* ================= SUB TAB CONTENT ================= */}

{activeSubTab === "submitted" && (
  <>
  <div className="bg-white rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.12)] overflow-hidden">

  {/* ================= DESKTOP TABLE (UNCHANGED) ================= */}
<div className="hidden md:block overflow-x-auto">
  <div className="min-w-[900px]">

    <div className="grid grid-cols-5 px-6 md:px-10 py-6 text-[15px] font-semibold text-gray-800 text-center">
      <span>Client Name</span>
      <span>Project Name</span>
      <span>Date</span>
      <span>Revenue</span>
      <span>Action</span>
    </div>

    <div className="w-full h-[1px] bg-gray-300" />

    {[
      { name: "James", project: "HMS", amount: "$450", status: "Accepted" },
      { name: "Sebastian", project: "AI", amount: "$650", status: "Under Review" },
      { name: "Ezra", project: "HMS", amount: "$500", status: "Decline" },
      { name: "James kumar", project: "HMS", amount: "$450", status: "Under Review" },
      { name: "Sebastian", project: "AI", amount: "$650", status: "Accepted" },
      { name: "Ezra williams", project: "HMS", amount: "$500", status: "Under Review" },
    ].map((row, i) => (
      <div key={i}>
        <div className="grid grid-cols-5 px-6 md:px-10 py-6 text-[15px] text-gray-700 items-center text-center">
          <span>{row.name}</span>
          <span>{row.project}</span>
          <span>16-12-25</span>
          <span>{row.amount}</span>
          <div className="flex justify-center">
            <span
              className={`w-[156px] h-[35px] rounded-full flex items-center justify-center text-white text-[14px] font-medium ${
                row.status === "Accepted"
                  ? "bg-[rgba(72,158,136,1)]"
                  : row.status === "Under Review"
                  ? "bg-[rgba(43,97,187,1)]"
                  : "bg-[rgba(242,175,182,1)]"
              }`}
            >
              {row.status}
            </span>
          </div>
        </div>

        {i !== 5 && <div className="w-full h-[1px] bg-gray-300" />}
      </div>
    ))}
  </div>
</div>


   

  </div>

    {/* ================= MOBILE VERSION (FINAL TABLE) ================= */}
    <div className="block md:hidden bg-white">

      {/* ===== TABLE HEADER ===== */}
      <div className="flex text-[13px] font-semibold text-gray-800 px-3 py-3 border-t border-b border-gray-300">
        <span className="w-[90px]">Client</span>
        <span className="w-[55px] text-center">Project</span>
        <span className="w-[70px] text-center">Date</span>
        <span className="w-[60px] text-center">Revenue</span>
        <span className="flex-1 text-right">Action</span>
      </div>

      {/* ===== TABLE BODY ===== */}
      <div className="divide-y">
        {[
          { name: "James", project: "HMS", date: "16-12-25", amount: "$450", status: "Accepted" },
          { name: "Sebastian", project: "AI", date: "16-12-25", amount: "$650", status: "Under Review" },
          { name: "Ezra", project: "HMS", date: "16-12-25", amount: "$500", status: "Decline" },
          { name: "James kumar", project: "HMS", date: "16-12-25", amount: "$450", status: "Under Review" },
          { name: "Sebastian", project: "AI", date: "16-12-25", amount: "$650", status: "Accepted" },
          { name: "Ezra williams", project: "HMS", date: "16-12-25", amount: "$500", status: "Under Review" },
        ].map((row, i) => (
          <div key={i} className="flex items-center text-[13px] text-gray-700 px-3 py-3">
            <span className="w-[90px]">{row.name}</span>
            <span className="w-[55px] text-center">{row.project}</span>
            <span className="w-[70px] text-center">{row.date}</span>
            <span className="w-[60px] text-center">{row.amount}</span>

            <div className="flex-1 flex justify-end">
              <span
                className={`min-w-[92px] h-[26px] flex items-center justify-center rounded-full text-white text-[12px] font-medium ${
                  row.status === "Accepted"
                    ? "bg-[rgba(72,158,136,1)]"
                    : row.status === "Under Review"
                    ? "bg-[rgba(43,97,187,1)]"
                    : "bg-[rgba(242,175,182,1)]"
                }`}
              >
                {row.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </>
)}

{/* ================= JOB INVITATION ================= */}
{activeSubTab === "invitation" && (

  selectedInvitation ? (

    /* ================= DETAIL VIEW (DESKTOP + MOBILE SAME) ================= */
    <div className="bg-white rounded-2xl shadow-xl w-full min-h-[420px] p-5 md:p-8">

   {/* Back Button */}
<button
  onClick={() => setSelectedInvitation(null)}
  className="
    flex 
    items-center gap-2 
    text-[12px] md:text-[14px] 
    text-gray-700 
    opacity-80 
    ml-0 md:ml-[15px] 
    mb-2 md:mb-4 
    hover:opacity-100 
    transition
  "
>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M20 12H4M4 12L10 6M4 12L10 18"
      stroke="currentColor"
      strokeWidth="3"
    />
  </svg>
  Back
</button>


      {/* Top Controls */}
      <div className="flex items-center gap-4 mb-4">
        <span className="font-medium">Select contract</span>

        <select className="h-[32px] px-3 rounded-md !border border-gray-300 text-sm">
          <option>All</option>
        </select>
      </div>

      {/* Title Row */}
      <div className="flex items-center gap-3 mb-2">
        <h2 className="font-semibold text-lg">UI/UX Designer beginner</h2>
        <span className="px-3 py-1 text-xs rounded-full bg-[#5B2CA0] text-white">
          Fixed rate
        </span>
      </div>

      <p className="text-sm mb-1">
        <span className="font-semibold">Client name:</span> {selectedInvitation.client}
      </p>

      <p className="text-sm mb-4">
        <span className="font-semibold">Budget:</span> {selectedInvitation.budget} &nbsp;|&nbsp; 2 contracts
      </p>

      <div className="h-[1px] bg-gray-300 mb-5" />

      <h3 className="font-semibold mb-2">Describe about the project</h3>

      <div className="border rounded-xl p-4 text-sm leading-relaxed">
        <p className="font-semibold mb-2">UI / UX Designer</p>

        <p>
          Hi, <em>This post is to search for UI / UX Designer</em> I am looking for someone
          who has good experience in designing plans for formative years. We have a set of
          100s of works sheets and designing for creating website and and other the attached
          image is a reference for style and structure, not an exact layout to copy. The final
          design should look modern, clean, and premium.
          <span className="text-[#5B2CA0] font-medium"> more</span>
        </p>
      </div>

      <button
  onClick={() => navigate("/myprojectmessage")}
  className="px-5 py-1.5 text-[13px] rounded-full !border border-[#51218F] text-[#51218F] hover:bg-[#51218F]/10 transition"
>
  Message
</button>

    </div>

  ) : (

    /* ================= TABLE VIEW ================= */
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden min-h-[420px]">

      {/* ===== MOBILE ===== */}
      <div className="block md:hidden">

        <div className="flex text-xs font-semibold text-gray-800 px-3 py-3 border-b">
          <span className="w-[80px]">Client</span>
          <span className="w-[60px] text-center">Project</span>
          <span className="w-[60px] text-center">Date</span>
          <span className="w-[60px] text-center">Revenue</span>
          <span className="flex-1 text-right">Action</span>
        </div>

        {[{ name: "James", project: "HMS", amount: "$450" }, { name: "Sebastian", project: "AI", amount: "$650" }].map((row, i) => (
          <div key={i} className="flex items-center px-3 py-3 text-xs border-b">
            <span className="w-[80px]">{row.name}</span>
            <span className="w-[60px] text-center">{row.project}</span>
            <span className="w-[60px] text-center">16-12-25</span>
            <span className="w-[60px] text-center">{row.amount}</span>

            <div className="flex-1 flex justify-end">
              <button
                onClick={() => setSelectedInvitation({ client: row.name, budget: row.amount })}
                className="px-3 py-1 rounded-full bg-[#B388FF] text-white text-xs"
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden md:block overflow-x-auto">

        <div className="grid grid-cols-5 px-10 py-6 font-semibold text-gray-700 text-center">
          <span>Client Name</span>
          <span>Project Name</span>
          <span>Date</span>
          <span>Revenue</span>
          <span>Action</span>
        </div>

        <div className="h-[1px] bg-gray-300" />

        {[{ name: "James", project: "HMS", amount: "$450" }, { name: "Sebastian", project: "AI", amount: "$650" }].map((row, i) => (
          <div key={i}>
            <div className="grid grid-cols-5 px-10 py-6 text-center text-gray-700">
              <span>{row.name}</span>
              <span>{row.project}</span>
              <span>16-12-25</span>
              <span>{row.amount}</span>

              <div className="flex justify-center">
                <button
                  onClick={() => setSelectedInvitation({ client: row.name, budget: row.amount })}
                  className="w-[156px] h-[35px] rounded-full bg-[#B388FF] text-white text-sm"
                >
                  View
                </button>
              </div>
            </div>

            <div className="h-[1px] bg-gray-300" />
          </div>
        ))}
      </div>
    </div>
  )
)}




{/* ================= CURRENT CONTRACTS ================= */}
{activeSubTab === "current" && (
  <>
    {/* ================= DESKTOP VIEW — UNCHANGED ================= */}
    <div className="hidden md:block bg-white rounded-2xl shadow-xl overflow-hidden min-h-[420px]">
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-5 px-10 py-6 text-[15px] font-semibold text-gray-800 text-center">
            <span>Client Name</span>
            <span>Project Name</span>
            <span>Date</span>
            <span>Revenue</span>
            <span>Action</span>
          </div>

          <div className="w-full h-[1px] bg-gray-300" />

          {[
            { name: "James", project: "HMS", date: "16-12-25", amount: "$450" },
            { name: "Sebastian", project: "AI", date: "16-12-25", amount: "$650" },
            { name: "James", project: "HMS", date: "16-12-25", amount: "$450" },
          ].map((row, i) => (
            <div key={i}>
              <div className="grid grid-cols-5 px-10 py-6 items-center text-center text-[15px] text-gray-700">
                <span>{row.name}</span>
                <span>{row.project}</span>
                <span>{row.date}</span>
                <span>{row.amount}</span>

                <div className="flex items-center justify-center gap-4">
                  <span className="px-6 py-2 rounded-full bg-[#FF8F7A] text-white text-[14px] font-medium whitespace-nowrap">
                    in progress
                  </span>

                  <button
                    onClick={() => {
                      setSelectedContract(row);
                      setShowEditCard(true);
                    }}
                    className="w-[38px] h-[35px] rounded-full flex items-center justify-center bg-[linear-gradient(180deg,#51218F_0%,#020202_100%)]"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.3">
                      <path d="M4 9v9a2 2 0 0 0 2 2h9" />
                      <path d="M6.5 17.5l2.5-.6 9.9-9.9a2.2 2.2 0 0 0-3.1-3.1L5.9 13.8l-.6 2.5Z" />
                      <path d="M10.8 8.2l3.8 3.8" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="w-full h-[1px] bg-gray-300" />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* ================= MOBILE VIEW — MATCHES IMAGE ================= */}
    <div className="block md:hidden bg-white rounded-xl shadow overflow-hidden">
      {[
        { name: "James", project: "HMS", date: "16-12-25", amount: "$450" },
        { name: "Sebastian", project: "AI", date: "16-12-25", amount: "$650" },
        { name: "James", project: "HMS", date: "16-12-25", amount: "$450" },
      ].map((row, i) => (
        <div key={i} className="border-b px-4 py-4 flex justify-between items-center">
          <div>
            <h4 className="font-semibold text-sm">{row.name}</h4>
            <p className="text-xs text-gray-500">{row.project} • {row.date}</p>
            <p className="text-sm mt-1">{row.amount}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-[#FF8F7A] text-white text-xs">
              in progress
            </span>

            <button
                    onClick={() => {
                      setSelectedContract(row);
                      setShowEditCard(true);
                    }}
                    className="w-[38px] h-[35px] rounded-full flex items-center justify-center bg-[linear-gradient(180deg,#51218F_0%,#020202_100%)]"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.3">
                      <path d="M4 9v9a2 2 0 0 0 2 2h9" />
                      <path d="M6.5 17.5l2.5-.6 9.9-9.9a2.2 2.2 0 0 0-3.1-3.1L5.9 13.8l-.6 2.5Z" />
                      <path d="M10.8 8.2l3.8 3.8" />
                    </svg>
                  </button>
          </div>
        </div>
      ))}
    </div>

    {/* ================= EDIT POPUP (Desktop unchanged, Mobile matches image) ================= */}
   {showEditCard && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center px-3">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      onClick={() => setShowEditCard(false)}
    />

    {/* Popup Card */}
    <div className="relative bg-white w-full max-w-[520px] rounded-2xl shadow-2xl p-5 md:p-6">
      
      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-start mb-4">
        
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            <img
              src={card5}
              alt="profile"
              className="w-[44px] h-[44px] rounded-full object-cover"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          </div>

          {/* Name + Role */}
          <div>
            <h3 className="font-semibold text-[15px] leading-tight">
              {selectedContract?.name}
            </h3>
            <p className="text-[13px] text-gray-500">UX Designer,</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded-full bg-[#6D28D9] text-white text-[13px] font-medium">
            Submit
          </button>
          <button
            onClick={() => setShowEditCard(false)}
            className="px-3 py-1.5 rounded-full !border border-[#6D28D9] text-[#6D28D9] text-[13px] font-medium"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <p className="text-[14px] font-medium mb-2">
        web and mobile design Completed
      </p>

      <p className="text-[13px] text-gray-600 leading-relaxed mb-5">
        We have a set of 100s of works sheets and designing for creating website
        and and other the attached image is a reference for style and structure,
        not an exact layout to copy. The final design should look modern, clean,
        and premium.
      </p>

      {/* ===== ATTACHMENTS ===== */}
      <p className="font-semibold text-[14px] mb-2">Attachments</p>
{/* Upload Box */}
<label className="block cursor-pointer">
  <input
    type="file"
    multiple
    className="hidden"
    onChange={(e) => {
      const files = Array.from(e.target.files);
      console.log("Selected files:", files);
      // You can store files in state here if needed
    }}
  />

  <div className="!border border-[#6D28D9] rounded-xl py-3 text-center text-[14px] font-medium hover:bg-[#6D28D9]/5 transition">
    <span className="text-black">Drag or </span>
    <span className="text-[#6D28D9]">upload project</span>
    <span className="text-black"> files</span>
  </div>
</label>

    </div>
  </div>
)}

  </>
)}


{/* ================= COMPLETED CONTRACTS ================= */}
{activeSubTab === "completed" && (
  <>
    {/* ================= DESKTOP (UNCHANGED) ================= */}
    <div className="hidden md:block bg-white rounded-2xl shadow-xl overflow-hidden min-h-[420px]">
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">

          <div className="grid grid-cols-5 px-10 py-6 text-[15px] font-semibold text-gray-800 text-center">
            <span>Client Name</span>
            <span>Project Name</span>
            <span>Date</span>
            <span>Revenue</span>
            <span>Action</span>
          </div>

          <div className="w-full h-[1px] bg-gray-300" />

          {[
            { name: "James", project: "HMS", date: "16-12-25", amount: "$450" },
            { name: "Sebastian", project: "AI", date: "16-12-25", amount: "$650" },
            { name: "Ezra", project: "HMS", date: "16-12-25", amount: "$500" },
            { name: "James kumar", project: "HMS", date: "16-12-25", amount: "$450" },
          ].map((row, i) => (
            <div key={i}>
              <div className="grid grid-cols-5 px-10 py-6 items-center text-center text-[15px] text-gray-700">
                <span>{row.name}</span>
                <span>{row.project}</span>
                <span>{row.date}</span>
                <span>{row.amount}</span>

                <div className="flex justify-center">
                  <span className="px-8 py-2 rounded-full bg-[#3C8D4E] text-white text-[14px] font-medium">
                    Completed
                  </span>
                </div>
              </div>

              <div className="w-full h-[1px] bg-gray-300" />
            </div>
          ))}

          <div className="h-[84px]" />
          <div className="w-full h-[1px] bg-gray-300" />

        </div>
      </div>
    </div>

    {/* ================= MOBILE (MATCHES IMAGE) ================= */}
    <div className="block md:hidden bg-white rounded-xl shadow overflow-hidden">

      {/* Header */}
      <div className="grid grid-cols-5 px-3 py-3 text-[13px] font-semibold text-gray-800 text-center border-b">
        <span>Client</span>
        <span>Project</span>
        <span>Date</span>
        <span>Revenue</span>
        <span>Action</span>
      </div>

      {/* Rows */}
      {[
        { name: "James", project: "HMS", date: "16-12-25", amount: "$450" },
        { name: "Sebastian", project: "AI", date: "16-12-25", amount: "$650" },
        { name: "Ezra", project: "HMS", date: "16-12-25", amount: "$500" },
        { name: "James kumar", project: "HMS", date: "16-12-25", amount: "$450" },
      ].map((row, i) => (
        <div key={i} className="grid grid-cols-5 px-3 py-3 text-[13px] text-gray-700 text-center border-b">

          <span className="truncate">{row.name}</span>
          <span>{row.project}</span>
          <span>{row.date}</span>
          <span>{row.amount}</span>

          <div className="flex justify-center">
            <span className="px-3 py-1 rounded-full bg-[#3C8D4E] text-white text-[11px] font-medium">
              Completed
            </span>
          </div>

        </div>
      ))}

      <div className="h-[60px]" />
      <div className="border-b" />

    </div>
  </>
)}

      </section>

      <div className="-mx-4">
        <Footer />
      </div>
    </div>
  );
};

export default Allcontacts;