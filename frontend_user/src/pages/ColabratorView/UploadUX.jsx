import React, { useState } from "react";

import TopBanner from "../../assets/Colabwork/banner.png";
import UserImg from "../../assets/Colabwork/user.png";
import Footer from "../../component/Footer";
import ColHeader from "../../component/ColHeader";

export default function UploadUX() {
  const [showMilestones, setShowMilestones] = useState(false);

  
  return (
    <div className="w-full bg-[#F5F5F5] min-h-screen">
      <div className="absolute top-0 left-0 w-full z-50">
          <ColHeader />
        </div>

        

      {/* ======================= BANNER + HEADER ======================= */}
      <div className="relative w-full h-[420px] md:h-[520px] xl:h-[582px]">
        <img
          src={TopBanner}
          alt="banner"
          className="absolute inset-0 w-full h-full object-cover blur-[1px]"
        />

      </div>

{/* ======================= CENTER WRAPPER ======================= */}
<div className="min-h-screen flex justify-center">
<div
  className="
    relative
    w-full
    max-w-[1200px] 2xl:max-w-[1320px]
    mx-4 sm:mx-auto
    -mt-[240px] lg:-mt-[300px]
    bg-white border border-black
    rounded-none
  "
>




          {/* TOP BAR */}
             {/* ================= TOP BORDER ================= */}
          <div className="border-b border-gray-200 px-6 md:px-8 pt-4 pb-0">

{/* BACK — DESKTOP ONLY */}
<button className="hidden sm:flex items-center text-[16px] text-[#111111] mb-4">
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M15 18L9 12L15 6"
      stroke="#111111"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
  <span>Back</span>
</button>

{/* DIVIDER — DESKTOP ONLY */}
<div className="hidden sm:block h-[1px] bg-gray-200 w-full"></div>

          </div>

          {/* CONTENT */}
          <div className="px-6 py-6">

            {/* TITLE */}
            <h2 className="text-[18px] font-semibold mb-2">
              Looking for a UX Web Designer
            </h2>
            <p className="text-[13px] text-gray-500 mb-4">Posted 3 hours ago</p>

            {/* DESCRIPTION */}
            <p className="text-[14px] text-gray-700 mb-4">
              I need a website for a software development and services company.<br></br>
              The company is a new startup, so the focus is on what we offer to<br></br>
              provide, than what we did in the past.
            </p>

            <p className="text-[14px] font-semibold mb-2">The key areas are -</p>

            <div className="text-[14px] text-gray-700 space-y-1 mb-4">
              <p>+ Digital Transformation work</p>
              <p>+ Platform modernization</p>
              <p>+ Maintenance and support</p>
              <p>+ Utility tool development</p>
              <p>+ Secure Data migration</p>
              <p>+ Round the clock support</p>
              <p>+ IT Consultancy</p>
            </div>

            <p className="text-[14px] text-black-700 mb-6">
              Contents development is included in the job which should be
              finalized after review<br></br> with me.
            </p>
            <div className="h-[1px] bg-gray-200 w-full"></div>

{/* SKILLS */}
<h3 className="text-[14px] font-semibold mt-2 mb-4">
  Skills and Expertise
</h3>

<div className="flex gap-2 mb-6 flex-wrap">
  {["Web Design", "Mockup", "Web Design", "Mockup"].map((tag, i) => (
    <button
      key={i}
      type="button"
      className={`
        px-4 py-1
        rounded-full
        bg-gray-100
        text-[12px]
        text-gray-600
        hover:bg-gray-200
        transition
        cursor-pointer
        ${i > 1 ? "hidden sm:inline-flex" : ""}
      `}
    >
      {tag}
    </button>
  ))}
</div>

             <div className="h-[1px] bg-gray-200 w-full"></div>


            <div className="border-t pt-6 mb-1">

              {/* TERMS */}
              <div className="flex justify-between  mb-7">
                <h4 className="font-semibold text-[14px]">Terms</h4>
                <p className="text-[14px]">
                  Client's budget: <b>$10.00 USD</b>
                </p>
              </div>
                          <div className="h-[1px] bg-gray-200 w-full"></div>


<div className="mt-39">
  <button
    onClick={() => setShowMilestones(prev => !prev)}
    className="text-[#5B2D91] text-[14px] mb-6 font-medium"
  >
    {showMilestones ? "+ Add milestones" : "+ Add milestones"}
  </button>
</div>

{showMilestones && (
 <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">

  {/* ================= PAYMENT TYPE ================= */}
  <h3 className="text-[16px] font-semibold mb-5 text-gray-900">
    How do you want to be paid?
  </h3>

  <div className="space-y-5 mb-8">

    {/* BY MILESTONE */}
    <label className="flex items-start gap-4 cursor-pointer">
      <input
        type="radio"
        name="payment"
        defaultChecked
        className="mt-1 accent-[#5B2D91]"
      />
      <div>
        <p className="font-medium text-[14px] text-gray-900">
          By milestone
        </p>
        <p className="text-[13px] text-gray-500 leading-relaxed">
          Divide the project into smaller segments, called milestones.
          You'll be paid for milestones as they are completed and approved.
        </p>
      </div>
    </label>

    {/* BY PROJECT */}
    <label className="flex items-start gap-4 cursor-pointer">
      <input
        type="radio"
        name="payment"
        className="mt-1 accent-[#5B2D91]"
      />
      <div>
        <p className="font-medium text-[14px] text-gray-900">
          By project
        </p>
        <p className="text-[13px] text-gray-500 leading-relaxed">
          Get your entire payment at the end, when all work has been delivered.
        </p>
      </div>
    </label>

  </div>

  {/* ================= MILESTONE HEADER ================= */}
  <h4 className="text-[15px] font-semibold text-gray-900 mb-4">
    How many milestones do you want to include?
  </h4>

  {/* ================= TABLE HEADER (DESKTOP ONLY) ================= */}
  <div className="hidden sm:grid grid-cols-12 gap-3 text-[13px] font-semibold text-black mb-2">
    <div className="col-span-6 pl-3">Description</div>
    <div className="col-span-3 -ml-20">Due date</div>
    <div className="col-span-2 -ml-15">Amount</div>
  </div>

  {/* ================= ROW ================= */}
  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-3">

    {/* INDEX — DESKTOP ONLY */}
    <div className="hidden sm:block col-span-1 text-[14px] text-gray-700">
      1
    </div>

    {/* DESCRIPTION */}
    <div className="sm:col-span-4 sm:-ml-[60px]">
      <label className="sm:hidden block text-[13px] font-medium mb-1">
        Description
      </label>
      <input
        className="
          w-full sm:w-[420px]
          h-[45px]
          px-4
          text-[14px]
          rounded-[10px]
          bg-white
          border border-gray-400/30
          ring-1 ring-gray-400/30
          outline-none
          focus:border-[#5B2D91]
          focus:ring-2 focus:ring-[#5B2D91]/30
        "
        placeholder="Write descriptions"
      />
    </div>

    {/* DUE DATE */}
    <div className="sm:col-span-3">
      <label className="sm:hidden block text-[13px] font-medium mb-1">
        Due date
      </label>
      <input
        type="date"
        className="
          w-full sm:w-[282px]
          h-[45px]
          px-4
          text-[14px]
          rounded-[10px]
          border border-gray-400/30
          ring-1 ring-gray-400/30
          outline-none
          focus:border-[#5B2D91]
          focus:ring-2 focus:ring-[#5B2D91]/30
        "
      />
    </div>

    {/* AMOUNT */}
    <div className="sm:col-span-2 relative sm:ml-6">
      <label className="sm:hidden block text-[13px] font-medium mb-1">
        Amount
      </label>

      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black text-[18px] font-semibold">
        $
      </span>

      <input
        className="
          w-full sm:w-[220px]
          h-[45px]
          px-4 pl-10
          text-[14px]
          text-right
          rounded-[10px]
          bg-white
          border border-gray-400/30
          ring-1 ring-gray-400/30
          outline-none
          focus:border-[#5B2D91]
          focus:ring-2 focus:ring-[#5B2D91]/30
        "
        placeholder="0.00"
      />
    </div>

  </div>

</div>
)}

<div className="h-px bg-gray-200 w-full mt-3 sm:mt-0"></div>




{/* DURATION */}
<div className="mb-6">
  <label className="block text-[14px] font-semibold mt-4 mb-2">
    How long it will take?
  </label>

  <div className="relative w-[220px]">
    <select
      className="
        w-full
        h-[40px]
        appearance-none
        !border border-gray-300
        rounded-md
        px-3 pr-10
        text-[14px]
        focus:outline-none
      "
    >
      <option>eg - 6 months</option>
      <option>1 month</option>
      <option>3 months</option>
      <option>6 months</option>
    </select>

    {/* SVG ARROW */}
    <svg
      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="#555"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
</div>
 <div className="hidden sm:block h-px bg-gray-200 w-full mt-14"></div>



<div className="text-[18px] mt-1 sm:mt-3 mb-2 sm:mb-4">
  <h4>Additional details</h4>
</div>

<div className="h-px bg-gray-200 w-full mb-4 sm:mb-14"></div>



{/* COVER LETTER */}
<div className="mb-4 sm:mb-6">
  <label className="block text-[14px] font-semibold mb-2">
    Write cover letter
  </label>
  <textarea
    placeholder="writer here"
    className="w-full h-[200px] sm:h-[240px] !border rounded-md p-3 text-[14px]"
  />
</div>


            {/* ATTACHMENTS */}
<div className="mb-8">
  <label className="block text-[14px] font-semibold mb-2">
    Attachments
  </label>

  {/* Hidden file input */}
  <input
    type="file"
    id="projectUpload"
    multiple
    className="hidden"
    onChange={(e) => {
      console.log(e.target.files); // selected files
    }}
  />

  {/* Upload box */}
  <div
    className="
      !border
      rounded-md
      py-6
      text-center
      text-[14px]
      cursor-pointer
      hover:bg-gray-50
    "
    onClick={() => document.getElementById("projectUpload").click()}
  >
    Drag or{" "}
    <b className="text-purple-500 underline">
      upload project
    </b>{" "}
    files
  </div>
</div>


              {/* ACTIONS */}
              <div className="flex gap-4">
                <button className="bg-[#5B2D91] text-white px-6 py-3 rounded-full text-[14px] font-semibold">
                  Submit a proposal
                </button>
                <button className="text-[14px]">Cancel</button>
              </div>

            </div>
          </div>
        </div>
      </div>
     

 <div className="-mx-4 mt-4">
  <Footer />
</div>
      
    </div>
  );
}
