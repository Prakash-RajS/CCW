import React from "react";
import bgImage from "../../assets/Mywork/hero-bg.png";

import Footer from "../../component/Footer";
import flagIcon from "../../assets/Mywork/flag.png";


import ColHeader from "../../component/ColHeader";

const CollabrationFilter = () => {
  return (
    
    <div className="w-full min-h-screen">
          
<div className="absolute top-0 left-0 w-full z-50">
          <ColHeader />
        </div>

      {/* ================= HERO (TOP HALF ONLY) ================= */}
      <section
        className="relative w-full h-[420px]"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 pt-28">


{/* SEARCH BAR */}
<div className="flex items-center bg-white shadow-lg mb-2 mt-6 rounded-lg overflow-hidden">

  {/* INPUT — curve only on LEFT */}
  <input
    placeholder="Ux design"
    className="
      flex-1
      px-4 sm:px-6
      py-2.5 sm:py-4
      text-[13px] sm:text-sm
      text-black
      placeholder-gray-400
      outline-none
      rounded-l-lg
    "
  />

  {/* BUTTON — curve only on RIGHT */}
  <button
    className="
      px-4 sm:px-8
      py-2.5 sm:py-4
      text-[13px] sm:text-sm
      font-medium
      text-white
      flex
      items-center
      justify-center
      gap-1 sm:gap-2
      rounded-r-lg
      bg-gradient-to-r
      from-[#381763]
      to-[#722FC9]
      shrink-0
    "
  >
    {/* ICON */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
      />
    </svg>

    <span className="hidden sm:inline">Search</span>
  </button>

</div>




{/* TOP RESULTS + SORT — ABOVE RIGHT CARD */}
<div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 px-4 lg:px-0">
  
  {/* Desktop Spacer: Matches sidebar width */}
  <div className="hidden lg:block lg:w-[320px]" />

  {/* Adjusted Container: mt-16 pushes it up slightly compared to the previous mt-24 */}
  <div className="flex-1 flex flex-row items-center justify-between w-full lg:pl-8 mt-8 lg:mt-16">
    
    {/* Left Side: Results Count */}
    <div className="text-[14px] lg:text-[15px] text-white font-medium">
      Top results 
      <span className="opacity-70 font-normal ml-2">
        Showing 1–20 of 3291 results
      </span>
    </div>

    {/* Right Side: Sort Controls */}
    <div className="flex items-center gap-2 lg:gap-3">
      <span className="hidden sm:inline-block text-sm text-white font-medium">
        Sort by –
      </span>

      <button
        type="button"
        className="
          flex
          items-center
          gap-2
          px-4
          lg:px-5
          py-1.5
          lg:py-2
          text-[13px]
          lg:text-sm
          font-semibold
          text-white
          bg-transparent
          rounded-full
          ring-1
          ring-white/60
          hover:bg-white/10
          transition
        "
      >
        <span>Latest</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  </div>
</div>

        </div>
      </section>

{/* ================= WHITE BACKGROUND SECTION ================= */}
<section className="relative bg-white pt-20 pb-24">

  {/* CONTENT WRAPPER — pull up ONLY on desktop */}
  <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-6 lg:-mt-60">

    {/* STACK ON MOBILE, ROW ON DESKTOP */}
    <div className="flex flex-col lg:flex-row gap-8">



{/* ================= LEFT FILTER ================= */}
<div className="w-full lg:w-[280px] shrink-0">

  {/* ADVANCED SEARCH — ABOVE CARD */}
  <div className="w-full lg:w-[320px] px-4 lg:px-0">
    <p
      className="
        text-[13px]
        lg:text-sm
        font-semibold
        text-white
        mb-3 lg:mb-4
        cursor-pointer
        hover:underline
        transition-all
        inline-block
      "
    >
      Advanced Search
    </p>
  </div>

  {/* FILTER CARD */}
  <div className="bg-white rounded-2xl p-6 shadow-lg text-sm hidden lg:block" />

  {/* FILTER CARD — SLIGHTLY MORE UP ON MOBILE */}
  <div
    className="
      bg-white
      rounded-2xl
      p-5 lg:p-6
      shadow-lg
      text-sm
      -mt-45 sm:-mt-6 lg:-mt-10   /* ⬅ moved up a little more on mobile */
      min-h-[600px] lg:min-h-[900px]
      flex
      flex-col
    "
  >
    {/* TITLE */}
    <h3 className="font-semibold text-lg mb-5 lg:mb-6">
      Filters
    </h3>

    {/* ================= PROJECT TYPE ================= */}
    <div className="mb-7 lg:mb-8">
      <p className="font-medium mb-4">Project type</p>

      <label className="flex items-center gap-3 mb-4">
        <input type="checkbox" className="w-5 h-5 accent-blue-600" />
        Fixed Price
      </label>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          defaultChecked
          className="w-5 h-5 accent-blue-600"
        />
        Hourly Rate
      </label>
    </div>

    {/* ================= FIXED PRICE ================= */}
    <div className="mb-7 lg:mb-8">
      <p className="font-medium mb-2">Fixed price</p>

      <div className="flex justify-between text-xs text-gray-500 mb-2">
        <span>$0</span>
        <span>$1000k+</span>
      </div>

      <input type="range" className="w-full accent-blue-600" />
    </div>

    {/* ================= HOURLY PRICE ================= */}
    <div className="mb-7 lg:mb-8">
      <p className="font-medium mb-2">Hourly price</p>

      <div className="flex justify-between text-xs text-gray-500 mb-2">
        <span>$0</span>
        <span>$1000</span>
      </div>

      <input type="range" className="w-full accent-blue-600" />
    </div>

    {/* ================= SKILLS ================= */}
    <div className="mb-7 lg:mb-8">
      <div className="flex items-center justify-between mb-3">
        <p className="font-medium">Skills</p>
        <span className="text-blue-600 text-sm cursor-pointer">
          View All
        </span>
      </div>

      <div className="mb-4">
        <input
          placeholder="Search"
          className="
            w-full
            bg-white
            rounded-xl
            px-4
            py-2
            text-sm
            outline-none
            ring-2
            ring-black
            ring-offset-2
            ring-offset-white
          "
        />
      </div>

      {[
        { name: "Website Design", checked: false },
        { name: "Graphic Design", checked: true },
        { name: "Logo Design", checked: false },
        { name: "Illustrator", checked: true },
        { name: "Corporate Identity", checked: false },
        { name: "Photoshop Design", checked: true },
        { name: "UX design", checked: false },
        { name: "UI design", checked: true },
      ].map((skill) => (
        <label
          key={skill.name}
          className="flex items-center gap-3 mb-3"
        >
          <input
            type="checkbox"
            defaultChecked={skill.checked}
            className="w-5 h-5 accent-blue-600"
          />
          {skill.name}
        </label>
      ))}
    </div>

    {/* ================= PROJECT LOCATION ================= */}
    <div className="mb-7 lg:mb-8">
      <p className="font-semibold mb-2 tracking-wide text-[13px]">
        Project location
      </p>

      <div
        className="
          w-full
          h-[44px]
          rounded-xl
          ring-1
          ring-black
          bg-white
          flex
          items-center
          px-4
        "
      >
        <input
          className="
            w-full
            bg-transparent
            text-sm
            outline-none
          "
          placeholder=""
        />
      </div>
    </div>

    {/* ================= LANGUAGES ================= */}
    <div>
      <p className="font-medium mb-2">Languages</p>

      <div
        className="
          w-full
          h-[44px]
          rounded-xl
          ring-1
          ring-black
          bg-white
          flex
          items-center
          px-4
          mb-4
        "
      >
        <input
          placeholder="Search"
          className="
            w-full
            bg-transparent
            text-sm
            outline-none
          "
        />
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          defaultChecked
          className="w-5 h-5 accent-blue-600"
        />
        UI design
      </label>
    </div>
  </div>
</div>



{/* ================= RIGHT RESULTS CARD (MOVED DOWN) ================= */}
<div className="flex-1 mt-12">
  <div className="bg-white rounded-3xl shadow-xl p-8">

{Array.from({ length: 5 }).map((_, i) => (
  <div
    key={i}
     className="relative pb-6"
  >
    <div className="flex justify-between gap-6">

{/* ================= LEFT CONTENT ================= */}
<div className="pr-[160px] flex flex-col gap-3 min-h-[140px]">

      <div>
  </div>


{/* ================= FIRST CARD ================= */}
{i === 0 && (
  <>
    {/* TITLE - pr-20 protects the space for heart/action icons on mobile */}
    <h3 className="font-semibold text-[17px] mb-1 pr-20 sm:pr-0">
      UI / UX Designer
    </h3>

    {/* META */}
    <p className="text-[14px] text-gray-500 mb-1 leading-snug">
      Fixed-price · Intermediate · Est. Budget $2,000 · Posted 8 hours ago
    </p>

    {/* DESCRIPTION */}
    <p className="text-[16px] text-gray-600 leading-relaxed mb-3">
      Hi, “This post is to search for UI / UX Designer”! I am looking for someone
      who has good experience in designing platforms for formative years. We have
      a set of 100s of worksheets and designing for creating website and other the
      attached image as reference for style and structure, not an exact layout to
      copy. The final design should look modern, clean, and premium.
      <span className="text-[#6d28d9] font-medium cursor-pointer ml-1">
        more
      </span>
    </p>

    {/* ================= TAGLINE ================= */}
    <div className="mt-1 flex items-center gap-x-4 gap-y-2 text-[14px] text-gray-600 flex-wrap">
      <span className="text-[#6d28d9] font-semibold">
        {i >= 2 ? "$ Hourly Rate" : "$ Fixed Rate"}
      </span>

      <span className="text-[#6d28d9]">★★★★☆</span>

      <span>4/5 (12 Reviews)</span>

      <div className="flex items-center gap-2">
        <img
          src={flagIcon}
          alt="USA"
          className="w-[18px] h-[12px] rounded-[4px] object-cover"
        />
        <span>Manhattan, USA</span>
      </div>
    </div>

    {/* DIVIDER — Responsive Fix: w-full prevents side-scrolling on mobile */}
    <div className="w-full h-[1px] bg-gray-200 my-3" />
  </>
)}


{/* ================= SECOND CARD ================= */}
{i === 1 && (
  <>
    {/* TITLE - pr-20 protects the space for heart/action icons on mobile */}
    <h3 className="font-semibold text-[17px] mb-1 pr-20 sm:pr-0">
      UI designer
    </h3>

    {/* META - font size remains same, leading ensures neatness on wrap */}
    <p className="text-[14px] text-gray-500 mb-1 leading-snug">
      Fixed-price · Intermediate · Est. Budget $2,000 · Posted 8 hours ago
    </p>

    {/* DESCRIPTION */}
    <p className="text-[16px] text-gray-600 leading-relaxed mb-3">
      We are looking for a talented Web UX/UI Designer to design the core pages
      and visual system for a new online learning platform. You will be responsible
      for creating a polished, modern, responsive design in Figma that can be
      implemented inside Thinkific by our development team.
      <span className="text-[#6d28d9] font-medium cursor-pointer ml-1">
        more
      </span>
    </p>

    {/* ================= TAGLINE ================= */}
    {/* flex-wrap ensures items stack neatly on narrow screens */}
    <div className="mt-1 flex items-center gap-x-4 gap-y-2 text-[14px] text-gray-600 flex-wrap">
      <span className="text-[#6d28d9] font-semibold">
        $ Fixed Rate
      </span>

      <span className="text-[#6d28d9]">★★★★☆</span>

      <span>4/5 (12 Reviews)</span>

      <div className="flex items-center gap-2">
        <img
          src={flagIcon}
          alt="USA"
          className="w-[18px] h-[12px] rounded-[4px] object-cover"
        />
        <span>Manhattan, USA</span>
      </div>
    </div>

    {/* DIVIDER — Responsive Fix: Changed from 120% to w-full to avoid overflow */}
    <div className="w-full h-[1px] bg-gray-200 my-3" />
  </>
)}


{/* ================= THIRD CARD ================= */}
{i === 2 && (
  <>
    {/* TITLE */}
    <h3 className="font-semibold text-[16px] mb-1">
      UX Designer
    </h3>

    {/* META */}
    <p className="text-[14px] text-gray-500 mb-1">
      Hourly-rate · Intermediate · Est. Budget $2,000 · Posted 8 hours ago
    </p>

    {/* DESCRIPTION */}
    <p className="text-[16px] text-gray-600 leading-relaxed mb-3">
      This role is ideal for a designer who understands how learning platforms
      work, has strong UX instincts, and can translate business goals into
      intuitive, elegant interfaces. Design the visual identity and UI system
      for a learning-focused website, covering color palette, typography,
      components, spacing, iconography.
      <span className="text-[#6d28d9] font-medium cursor-pointer ml-1">
        more
      </span>
    </p>

    {/* ================= TAGLINE ================= */}
    <div className="mt-1 flex items-center gap-4 text-[14px] text-gray-600 flex-wrap">
      <span className="text-[#6d28d9] font-semibold">
        $ Hourly Rate
      </span>

      <span className="text-[#6d28d9]">★★★★☆</span>

      <span>4/5 (12 Reviews)</span>

      <div className="flex items-center gap-2">
        <img
          src={flagIcon}
          alt="USA"
          className="w-[18px] h-[12px] rounded-[4px] object-cover"
        />
        <span>Manhattan, USA</span>
      </div>
    </div>

    {/* DIVIDER — SAME AS CARD 1 */}
    <div className="w-[120%] h-[1px] bg-gray-200 my-3" />
  </>
)}
{/* ================= FOURTH CARD ================= */}
{i === 3 && (
  <>
    {/* TITLE - pr-20 on mobile ensures title doesn't crash into right-side icons */}
    <h3 className="font-semibold text-[16px] mb-1 pr-20 sm:pr-0">
      UI / UX designer Needed for SaaS Platform Dashboard
    </h3>

    {/* META - font-size stays 14px, leading-snug handles wraps neatly */}
    <p className="text-[14px] text-gray-500 mb-1 leading-snug">
      Hourly-rate · Intermediate · Est. Budget $2,000 · Posted 8 hours ago
    </p>

    {/* DESCRIPTION */}
    <p className="text-[16px] text-gray-600 leading-relaxed mb-3">
      We are seeking a talented UX/UI Designer to join our team for our SaaS
      platform. The ideal candidate will focus on designing user-friendly
      dashboards and customer-facing screens. This role requires approximately
      7–20 hours per week and is perfect for someone who can enhance our
      platform’s usability and visual appeal.
      <span className="text-[#6d28d9] font-medium cursor-pointer ml-1">
        more
      </span>
    </p>

    {/* ================= TAGLINE ================= */}
    {/* flex-wrap is the key to mobile responsiveness here */}
    <div className="mt-1 flex items-center gap-x-4 gap-y-2 text-[14px] text-gray-600 flex-wrap">
      <span className="text-[#6d28d9] font-semibold">
        $ Hourly Rate
      </span>

      <span className="text-[#6d28d9]">★★★★☆</span>

      <span>4/5 (12 Reviews)</span>

      <div className="flex items-center gap-2">
        <img
          src={flagIcon}
          alt="USA"
          className="w-[18px] h-[12px] rounded-[4px] object-cover"
        />
        <span>Manhattan, USA</span>
      </div>
    </div>

    {/* DIVIDER — Responsive Fix: w-full prevents side-scrolling on mobile devices */}
    <div className="w-full h-[1px] bg-gray-200 my-3" />
  </>
)}

{/* ================= FIFTH CARD ================= */}
{i === 4 && (
  <>
    {/* TITLE - pr-20 on mobile ensures title doesn't crash into right-side icons */}
    <h3 className="font-semibold text-[16px] mb-1 pr-20 sm:pr-0">
      UI / UX Designer
    </h3>

    {/* META - leading-snug handles wraps neatly for narrow screens */}
    <p className="text-[14px] text-gray-500 mb-1 leading-snug">
      Hourly-rate · Intermediate · Est. Budget $2,000 · Posted 8 hours ago
    </p>

    {/* DESCRIPTION */}
    <p className="text-[16px] text-gray-600 leading-relaxed mb-3">
      We are looking for a skilled UX/UI Designer who can help improve usability
      and refine visual consistency across our product. The ideal candidate will
      be able to identify UX gaps, enhance workflows, and deliver intuitive user
      experiences for our growing platform.
      <span className="text-[#6d28d9] font-medium cursor-pointer ml-1">
        more
      </span>
    </p>

    {/* ================= TAGLINE ================= */}
    {/* flex-wrap ensures items stack vertically if horizontal space is limited */}
    <div className="mt-1 flex items-center gap-x-4 gap-y-2 text-[14px] text-gray-600 flex-wrap">
      <span className="text-[#6d28d9] font-semibold">
        $ Hourly Rate
      </span>

      <span className="text-[#6d28d9]">★★★★☆</span>

      <span>4/5 (12 Reviews)</span>

      <div className="flex items-center gap-2">
        <img
          src={flagIcon}
          alt="USA"
          className="w-[18px] h-[12px] rounded-[4px] object-cover"
        />
        <span>Manhattan, USA</span>
      </div>
    </div>
    
    {/* NO DIVIDER HERE AS IT IS THE LAST CARD */}
  </>
)}

       
</div>


     

   {/* ================= RIGHT ICONS ================= */}
<div className="absolute top-4 right-4 flex items-center space-x-3">
  
  {/* Heart Icon SVG - Grey BG with Rounded Visible Outline */}
    <div className="flex items-center justify-center w-10 h-10 bg-[#E8E8E8] border-[3px] border-[#808080] rounded-full shadow-sm">
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="#FF5252" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </div>

    
    {/* Like Icon SVG - White BG with Rounded Visible Outline */}
<div className="flex items-center justify-center w-10 h-10 bg-white border-[3px] border-[#808080] rounded-full shadow-sm">
  <svg 
    width="22" 
    height="22" 
    viewBox="0 0 24 24" 
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M7 10V20
         M7 10L10.5 3C11.5 3 12.5 4 12.5 6V9H19.5
         C21 9 21.5 10.5 21.5 11.5
         L20 18.5C19.5 20 18.5 21 17 21H7
         M7 10H4C3 10 2 11 2 12V18
         C2 19 3 20 4 20H7"
      stroke="#808080"
      strokeWidth="3"              // ⬅ thicker
      strokeLinecap="round"        // ⬅ rounded ends (KEY)
      strokeLinejoin="round"       // ⬅ rounded corners (KEY)
    />
  </svg>
</div>


</div>

    </div>
  </div>
))}
       

   {/* ================= LOAD MORE ================= */}
<div className="flex justify-center mt-8">
  <button
    className="
      px-8
      py-2
      text-sm
      font-semibold
      text-[#6d28d9]
      bg-white
      rounded-lg
      ring-1
      ring-[#6d28d9]
      hover:bg-[#6d28d9]/10
      transition
    "
  >
    Load more
  </button>
</div>


  </div>
</div>




          </div>
        </div>
      </section>
    
{/* ================= FOOTER ================= */}
      <div className="-mx-4">
        <Footer />
      </div>

    </div>
  );
};

export default CollabrationFilter;