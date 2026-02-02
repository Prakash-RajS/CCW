import React from "react";
import TopBanner from "../../assets/Colabwork/banner.png";
import UserImg from "../../assets/Colabwork/user.png";
import FlagImg from "../../assets/Colabwork/usa-flag1.png";
import Footer from "../../component/Footer";
import ColHeader from "../../component/ColHeader";

export default function UX() {
  return (
    <div className="w-full bg-[#F5F5F5] min-h-screen">

      {/* ======================= BANNER + HEADER ======================= */}
      <div className="relative w-full h-[420px] md:h-[520px] xl:h-[582px]">
        <div className="absolute top-0 left-0 w-full z-50">
          <ColHeader />
        </div>
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
    relative w-full
    max-w-[1200px]
    2xl:max-w-[1320px]
    mx-4 sm:mx-auto
    -mt-[240px] lg:-mt-[300px]
    bg-white
    border border-black
    rounded-none
  "
>

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


   <div className="hidden sm:block h-px bg-gray-200 w-full"></div>

          </div>

{/* ================= CONTENT ================= */}
<div className="flex flex-col lg:flex-row">

{/* ================= LEFT ================= */}
<div className="flex-1 px-4 md:px-8 py-3 sm:py-6">

  {/* TITLE + META ROW */}
  <div className="flex justify-between items-start sm:items-start mb-1 sm:mb-3">

    {/* LEFT TEXT */}
    <div>
      <h2
        className="
          text-[14px] sm:text-[20px]
          font-semibold
          leading-tight
          tracking-tight
          whitespace-nowrap
        "
      >
        Looking for a UX Web Designer
      </h2>

      {/* POSTED — MOBILE POSITION */}
      <p className="text-sm text-gray-500 mt-1 sm:hidden">
        Posted 3 hours ago
      </p>
    </div>

{/* RIGHT TEXT */}
<div className="text-right mt-3 sm:mt-0">
 <p className="text-[16px] font-semibold text-left sm:text-right">
  $10.00 USD
</p>


  <p className="text-[11px] text-gray-400 uppercase mt-1">
    Bidding ends in 6 days
  </p>
</div>



  </div>

  {/* POSTED — DESKTOP POSITION (unchanged) */}
  <p className="hidden sm:block text-sm text-gray-500 mb-5">
    Posted 3 hours ago
  </p>



{/* DESCRIPTION */}
<p className="text-[14px] leading-[22px] text-gray-700 mt-9 sm:mt-0 mb-4">
  I need a website for a software development and services company.<br />
  The company is a new startup, so the focus is on what we offer to <br />
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

              <p className="text-[14px] text-gray-700 mb-6">
                Contents development is included in the job which should be finalized
                after review with me.
              </p>

              <div className="h-[1px] bg-gray-200 mb-4"></div>

{/* SKILLS */}
<h3 className="font-semibold text-[14px] mb-4">
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


              <div className="h-[1px] bg-gray-200 mb-4"></div>

                {/* JOB ACTIVITY */}
      <h3 className="font-semibold text-[14px] mb-3">Skills and Expertise</h3>

<div className="grid grid-cols-2 gap-y-3 gap-x-6 sm:grid-cols-1 text-[13px] text-gray-700">
  <p><b>Proposals:</b> 15 to 20</p>
  <p><b>Last viewed by client:</b> 3 minutes ago</p>

  <p><b>Interviewing:</b> 0</p>
  <p><b>Invites sent:</b> 0</p>

  <p className="col-span-2 sm:col-span-1">
    <b>Unanswered invites:</b> 0
  </p>
</div>

    </div>
            

            {/* DIVIDER */}
            <div className="hidden lg:block w-[1px] bg-gray-200"></div>

             {/* ================= RIGHT SIDEBAR ================= */}
<div className="w-[340px] px-8 py-8">

{/* BUTTONS */}
<button
  className="
    w-full
    bg-[#5B2D91]
    text-white
    py-3
    rounded-full
    text-[14px] sm:text-[15px]
    font-semibold
    mb-4 sm:mb-4        /* ⬅ a bit more space on mobile */
  "
>
  Submit a proposal
</button>

<button
  className="
    w-full
    border border-[#2F3A40]
    text-[#2F3A40]
    py-3
    rounded-full
    text-[14px] sm:text-[15px]
    font-semibold
    mb-5 sm:mb-6        /* ⬅ a bit more space on mobile */
  "
>
  Saved the project
</button>

{/* CONNECTS */}
<div className="text-[13px] text-[#2F3A40] leading-[22px] sm:leading-[24px] mt-2">
  <p>
    Required Connects to submit a proposal: <b>6</b>
  </p>
  <p className="mt-1">
    Available Connects: <b>50</b>
  </p>
</div>


  {/* DIVIDER 1 */}
  <div className="h-[1px] bg-gray-200 mb-6 mr-10 w-77 "></div>

{/* ABOUT CLIENT */}
<div className="bg-white rounded-xl p-4 sm:p-0 ml-0 sm:ml-auto">

  {/* TITLE */}
  <h3 className="text-[16px] sm:text-[18px] font-semibold mb-3 sm:mb-4">
    About the client
  </h3>

  {/* CONTENT GRID */}
  {/* MOBILE = 2 COLUMNS | DESKTOP = 1 COLUMN */}
  <div className="grid grid-cols-2 sm:grid-cols-1 gap-4 sm:gap-6">

    {/* LEFT COLUMN */}
    <div className="order-1 sm:order-1">

      {/* BASIC INFO */}
      <div className="space-y-2 sm:space-y-3 text-[13px] sm:text-[14px] text-[#3A3A3A] mb-4">

        {/* LOCATION */}
        <div className="flex items-center gap-2">
          <img
            src={FlagImg}
            alt="USA"
            className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]"
          />
          <span>Manhattan, USA</span>
        </div>

        {/* TIME */}
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#6B6B6B" strokeWidth="1.5"/>
            <path d="M12 7V12L15 14" stroke="#6B6B6B" strokeWidth="1.5"/>
          </svg>
          <span>It's currently 4:45 PM here</span>
        </div>

        {/* JOINED */}
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M6 21h12M9 17V5l3-2 3 2v12" stroke="#6B6B6B" strokeWidth="1.5"/>
          </svg>
          <span>Joined September 1, 2013</span>
        </div>

      </div>
    </div>

    {/* RIGHT COLUMN – STATS */}
    {/* ⬅ Moves UP on desktop */}
    <div className="order-2 sm:order-2 space-y-1.5 sm:space-y-2 text-[13px] sm:text-[14px] text-[#3A3A3A]">

      <p className="font-semibold">Manhattan 7:03 pm</p>

      <p className="font-semibold">47 jobs posted</p>
      <p className="text-[#6B6B6B]">45% hire rate, 2 open jobs</p>

      <p className="font-semibold">$5k+ total spent</p>
      <p className="text-[#6B6B6B]">27 hires, 0 active</p>

      <p className="font-semibold">24.53 /hr avg hourly rate paid</p>
      <p className="text-[#6B6B6B]">210 hours</p>

      <p className="font-semibold">Mid-sized company (10–99 people)</p>
      <p className="text-[#6B6B6B]">Member since Jan 22, 2020</p>

    </div>

   {/* RATING */}
{/* Mobile: moves UP | Desktop: stays BELOW stats */}
<div className="order-2 sm:order-3 col-span-1">

<div className="-mt-48 sm:mt-4">



    <div className="flex gap-[2px] text-purple-600 text-[16px] sm:text-[18px]">
      ★★★★☆
    </div>
    <span className="text-[13px] sm:text-[14px] text-[#6B6B6B]">
      4/5 (12 Reviews)
    </span>
  </div>




      {/* DIVIDER – DESKTOP ONLY */}
      <div className="hidden sm:block h-[1px] bg-gray-200 my-6"></div>

      {/* VERIFICATIONS */}
<div className="space-y-3 sm:space-y-4 text-[13px] sm:text-[14px] text-[#2b2b2b]">

  {/* Identity */}
  <div className="flex items-center gap-3">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="#5B2D91" strokeWidth="1.5" />
      <path
        d="M4 20c0-4 16-4 16 0"
        stroke="#5B2D91"
        strokeWidth="1.5"
      />
    </svg>
    <span className="font-semibold">Identity verified</span>
  </div>

  {/* Payment */}
  <div className="flex items-center gap-3">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2v20M7 7h10M7 17h10"
        stroke="#5B2D91"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
    <span className="font-semibold">Payment Verified</span>
  </div>

  {/* Phone */}
  <div className="flex items-center gap-3">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M22 16.9v3a2 2 0 0 1-2.2 2
           A19.8 19.8 0 0 1 3 5.2
           A2 2 0 0 1 5 3h3
           a2 2 0 0 1 2 1.7l.5 2.5
           a2 2 0 0 1-.6 1.8l-1.2 1.2
           a16 16 0 0 0 6.6 6.6l1.2-1.2
           a2 2 0 0 1 1.8-.6l2.5.5
           a2 2 0 0 1 1.7 2.2Z"
        stroke="#5B2D91"
        strokeWidth="1.5"
      />
    </svg>
    <span className="font-semibold">Phone Verified</span>
  </div>

  {/* Email */}
  <div className="flex items-center gap-3">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="#5B2D91"
        strokeWidth="1.5"
      />
      <path
        d="M3 7l9 6 9-6"
        stroke="#5B2D91"
        strokeWidth="1.5"
      />
    </svg>
    <span className="font-semibold">Email Verified</span>
  </div>

  {/* Facebook */}
  <div className="flex items-center gap-3">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7
           a1 1 0 0 1 1-1h3V2Z"
        stroke="#5B2D91"
        strokeWidth="1.5"
      />
    </svg>
    <span className="font-semibold">Facebook Verified</span>
  </div>



      </div>
    </div>

  </div>
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
