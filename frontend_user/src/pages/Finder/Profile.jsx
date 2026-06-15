import React, { useState } from "react";

/* ================== IMAGES ================== */
import UserImg from "../../assets/Landing/user.png";
import ManImg from "../../assets/Landing/man.png";
import HalfCircle from "../../assets/Landing/half-circle.png";
import SmallScribble from "../../assets/Landing/scribble-small.png";
import BigScribble from "../../assets/Landing/scribble-big.png";
import ServicesBG from "../../assets/Landing/services.png";

import Ui1 from "../../assets/Landing/ui1.png";
import Ui2 from "../../assets/Landing/ui2.png";
import Ui3 from "../../assets/Landing/ui3.png";
import Footer from '../../component/Footer';

/* ================= DATA ================= */
const serviceItems = [{ image: Ui1 }, { image: Ui2 }, { image: Ui3 }];

export default function Profile() {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="w-full bg-white overflow-x-hidden">

{/* ======================= HEADER ======================= */}
<header className="relative max-w-[1440px] mx-auto h-[100px] px-[70px] pt-[12px] flex items-start justify-between">

  {/* LEFT */}
  <div className="flex flex-col gap-1">
    <h1
      className="text-[50px] font-bold leading-none"
      style={{
        fontFamily: "Trochut, cursive",
        background:
          "linear-gradient(270deg, #51218F 22.62%, #030303 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      Talenta
    </h1>

    {/* BACK BUTTON */}
    <button
      onClick={() => window.history.back()}
      className="flex items-center mt-1 ml-3 text-[16px] text-black hover:opacity-70 w-fit"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M15 18L9 12L15 6"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Back
    </button>
  </div>

  {/* RIGHT ICONS */}
  <div className="flex items-center gap-6 ml-8">

    {/* user SVG */}
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className="w-[28px] h-[58px]"
    >
      <path
        d="M12 12.4C14.32 12.4 16.2 10.52 16.2 8.2C16.2 5.88 14.32 4 12 4C9.68 4 7.8 5.88 7.8 8.2C7.8 10.52 9.68 12.4 12 12.4Z"
        stroke="black"
        strokeWidth="1.8"
      />
      <path
        d="M19.2 20C19.2 16.9 15.92 14.6 12 14.6C8.08 14.6 4.8 16.9 4.8 20"
        stroke="black"
        strokeWidth="1.8"
      />
    </svg>

    {/* message SVG */}
    <svg
      width="28"
      height="24"
      viewBox="0 0 28 24"
      fill="none"
      className="w-[28px] h-[24px]"
    >
      <path
        d="M4 3H24C25.66 3 27 4.34 27 6V16C27 17.66 25.66 19 24 19H11L5 22V19H4C2.34 19 1 17.66 1 16V6C1 4.34 2.34 3 4 3Z"
        stroke="black"
        strokeWidth="1.8"
      />
      <path d="M7 8H21" stroke="black" strokeWidth="1.8" />
      <path d="M7 12H17" stroke="black" strokeWidth="1.8" />
    </svg>

    {/* User Name */}
    <span className="text-[18px] font-medium">Julie</span>

    {/* Profile Image */}
    <img
      src={UserImg}
      alt="profile"
      className="w-[48px] h-[48px] rounded-full object-cover"
    />
  </div>

</header>


          {/* ======================= HERO ============================ */}

 <section className="w-full h-[800px] relative flex items-center justify-center">

  {/* =================== CENTER TEXT BLOCK =================== */}
  <div className="text-center mb-100 w-[913px] h-[266px]">

<div className="relative inline-block mt-2  ml-10">
  {/* Hello Tag — STRONG visible outline */}
  <p
    className="
      text-[18px]
      bg-white
      px-6
      py-2
      inline-block
      rounded-full
      font-medium
      relative
      z-10
      border-[3px]
      border-black
      mb-2
    "
    style={{
      boxShadow: "0 0 0 2px black",
    }}
  >
    Hello!
  </p>

  {/* SCRIBBLE SVG — unchanged */}
 <svg
  className="absolute -top-10 -right-10 w-[55px] h-[55px] z-0"
  viewBox="0 0 60 60"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="
      M18 42 C20 32 18 22 16 14
      M30 45 C36 34 42 26 50 18
      M38 52 C45 48 52 44 58 40
    "
    stroke="#51218F"
    strokeWidth="5"
    strokeLinecap="round"
  />
</svg>

</div>




    {/* Heading */}
    <h1 className="text-[90px] font-bold leading-[100px] mt-6">
      I'm <span className="text-purple-600">Jenny</span>,
    </h1>

   <div className="relative inline-block">
  <h1 className="text-[90px] font-bold leading-[100px] -mt-2">
    UI / UX Designer
  </h1>

  {/* STROKE / SCRIBBLE BELOW UI TEXT */}
 <img
  src={BigScribble}
  alt="ui-scribble"
  className="
    absolute
    -left-[80px]   /* ⬅⬅ moved clearly more left */
    top-[100px]
    w-[65px]
  "
/>

</div>


    {/* Half Circle Background */}
    <img
      src={HalfCircle}
      alt="half bg"
      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[871px] h-[575px] opacity-90"
    />

    {/* Man Image */}
    <img
      src={ManImg}
      alt="man"
      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[600px] object-contain"
    />
{/* =================== COLLABORATE REQUEST BUTTON =================== */}
<div
  className="
    + absolute left-1/2 -translate-x-1/2 top-[330px]
    w-[367px] h-[82px]
    flex items-center justify-center
    relative
  "
>

{/* OUTER BORDER*/}
<div
  className="
    absolute inset-0 rounded-[50px]
    p-[5px]

    bg-[#FFFFFF1A] 
    !border !border-white
    border-[2px]                    
    [border-style:solid]

    [border-image-slice:1]
    [border-image-width:2]
    [border-image-repeat:stretch]

    [border-image-source:radial-gradient(
      150.36%_227.1%_at_8.75%_100%,
      #FFFFFF_0%,
      rgba(169, 163, 163, 0)_100%
    )]

    backdrop-blur-[1px]            
  "
></div>





  {/* THIN INNER WHITE BORDER */}
  <div
    className="
      absolute inset-[5px]
      rounded-[50px]
      border border-white/60
      p-[5px]
    "
  ></div>

  {/* INNER PANEL — UPDATED WITH YOUR NEW GRADIENT */}
<div
  className="
    absolute inset-[10px]
    rounded-[50px]

    !border !border-white
    shadow-[0_0_35px_#8A38F5]

    bg-[radial-gradient(50%_50%_at_50%_50%,#8A38F5_0%,#000000_100%)]
  "
></div>


{/* ================= BUTTON CONTENT ================= */}
<button
  className="
    relative z-10 w-full h-full rounded-[50px]
    flex items-center justify-center gap-4
    text-white text-[26px] font-semibold
    -mt-2
  "
>
  Collaborate request

  {/* ARROW ICON – EXACT MATCH */}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 17L17 7" />
    <path d="M7 7h10v10" />
  </svg>
</button>

</div>

  </div>

{/* =================== LEFT TESTIMONIAL =================== */}
<div className="absolute left-[40px] top-[600px] w-[328px] flex flex-col gap-[12px]">

  {/* QUOTE ICON */}
  <div className="text-[#2A3442] text-[48px] leading-none font-bold">
    “
  </div>

  {/* TESTIMONIAL TEXT — BOLD */}
  <p className="text-[#2A3442] text-[18px] leading-[26px] font-bold">
    Jenny’s Exceptional product design <br />
    ensure our website’s success. <br />
    Highly Recommended
  </p>

</div>


  {/* =================== RIGHT EXPERIENCE BLOCK =================== */}
  <div className="absolute right-[100px] top-[560px] w-[169px] h-[125px] flex flex-col items-center gap-[21px]">

    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <span key={i} className="text-[32px] text-orange-500">★</span>
      ))}
    </div>

    <div className="text-center">
      <h3 className="text-[40px] font-bold leading-none">10 Years</h3>
      <p className="text-[18px] text-[#444] -mt-1">Experience</p>
    </div>

  </div>

</section>
{/* ===================== SERVICES ========================== */}
<section
  className="relative w-full h-[900px] bg-cover bg-center rounded-[45px] -mt-4"
  style={{ backgroundImage: `url(${ServicesBG})` }}
>

  {/* ======= TOP GLOW LINE ======= */}
  <div className="absolute top-[40px] left-0 w-full h-[3px] bg-gradient-to-r from-[#a96bff] via-[#d8baff] to-[#9b4dff] opacity-80 blur-[1px]" />

  {/* ======= REFLECTION LINE BELOW CARDS ======= */}
  <div className="absolute bottom-[150px] left-0 w-full h-[6px] bg-gradient-to-r from-[#6d2cff] to-[#b57eff] opacity-60 blur-[6px]" />

  {/* =================== TITLE ROW =================== */}
  <div
    className="
      flex items-center justify-between 
      w-[1299px] h-[52px]
      mb-[40px]
      mx-auto
    "
  >
 
<h2 className="text-[48px] mt-44 ml-8 font-semibold text-white">
  My <span className="ml-1 text-[#51218F]">Services</span>
</h2>



<p className="text-white text-[16px] w-[480px] mt-40 leading-[26px] relative right-[60px]">
  Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
  Duis lacus nunc, posuere in justo vulputate, bibendum sodales.
</p>


 
  </div>

{/* =================== 3-GRID CARDS SECTION =================== */}
<div
  className="
    w-[1099px] 
    h-[462px]
    mx-auto
    flex
    justify-between
    gap-[29px]
    mt-[190px]
  "
>
  {serviceItems.map((item, index) => {
    let position =
      (index - currentIndex + serviceItems.length) %
      serviceItems.length;

    return (
      <div
        key={index}
        className={`
          transition-all duration-500 
          w-[413px]
          opacity-100
          ${position === 1 ? "z-20" : "z-10"}
        `}
      >
        {/* ===== CARD WRAPPER (FOR FULL OUTLINE) ===== */}
        <div className="relative w-full h-full rounded-[55px]">

          {/* OUTLINE LAYER — ALWAYS COMPLETE */}
          <div className="absolute inset-0 rounded-[55px] border border-white/40 pointer-events-none z-20" />

          {/* ===== CARD ===== */}
          <div
            className="
              relative z-10
              w-full h-full
              rounded-[55px]
              bg-white/5 backdrop-blur-s
              p-7
              shadow-[0_0_40px_rgba(162,95,255,0.25)]
            "
          >
            <h3 className="text-white text-[24px] font-medium mb-5">
              {item.title}
            </h3>

            {/* IMAGE STACK EFFECT */}
            <div className="relative w-full h-[350px]">
              <div className="absolute top-[10px] left-[10px] w-full h-full rounded-xl bg-white/10 blur-md" />

              <img
                src={item.image}
                alt=""
                className="relative rounded-xl shadow-xl w-full h-full object-cover"
              />
            </div>
          </div>

        </div>
      </div>
    );
  })}
</div>

{/* ===== DOTS ===== */}
<div className="flex gap-3 justify-center mt-[100px]">
  {serviceItems.map((_, i) => (
    <button
      key={i}
      onClick={() => setCurrentIndex(i)}
      className={`
        w-[10px] h-[10px] rounded-full transition-all 
        ${
          currentIndex === i
            ? "bg-white scale-150 shadow-[0_0_8px_white]"
            : "bg-white/40"
        }
      `}
    />
  ))}
</div>



</section>

    {/* ================= WORK EXPERIENCE ================= */}
<section className="w-full max-w-[1440px] mx-auto px-[70px] py-[120px] bg-white">

  {/* ===== TITLE ===== */}
  <h2 className="text-center text-[60px] font-semibold mb-[120px]">
    <span className="text-[#334155]">My </span>
    <span className="text-[#6D28D9]">Work Experince</span>
  </h2>

  {/* ===== GRID ===== */}
  <div className="grid grid-cols-[1fr_120px_1fr] items-start">

    {/* ================= LEFT ================= */}
    <div className="flex flex-col gap-[140px] text-left pr-10">

      <div>
        <h3 className="text-[42px] font-semibold text-[#334155]">
          Cognizant, Mumbai
        </h3>
        <p className="text-[#9CA3AF] text-[22px] mt-2">
          Sep 2016 – July 2020
        </p>
      </div>

      <div>
        <h3 className="text-[42px] font-semibold text-[#334155]">
          Sugee Pvt limited, Mumbai
        </h3>
        <p className="text-[#9CA3AF] text-[22px] mt-2">
          Sep 2020 – July 2023
        </p>
      </div>

      <div>
        <h3 className="text-[42px] font-semibold text-[#334155]">
          Cinetstox, Mumbai
        </h3>
        <p className="text-[#9CA3AF] text-[22px] mt-2">
          Sep 2023
        </p>
      </div>

    </div>
{/* ================= TIMELINE ================= */}
<div className="relative flex flex-col mt-3 items-center">

  {/* CONTINUOUS DASHED LINE */}
  <div
    className="absolute top-[80px] bottom-[80px] w-[3px]"
    style={{
      backgroundImage:
        "repeating-linear-gradient(to bottom, #6B7280 0, #6B7280 6px, transparent 6px, transparent 14px)",
    }}
  />

 {/* ================= TOP NODE ================= */}
<div className="relative w-[76px] h-[76px] flex items-center justify-center z-10">

  {/* SEGMENTED OUTER RING (VISIBLE LIKE IMAGE) */}
  <svg
    className="absolute inset-0"
    viewBox="0 0 100 100"
  >
    <circle
      cx="50"
      cy="50"
      r="46"
      fill="none"
      stroke="rgba(72, 33, 33, 1)"
      strokeWidth="4"
      strokeDasharray="10 12"
      strokeLinecap="round"
    />
  </svg>

  {/* white ring */}
  <div className="absolute inset-[12px] rounded-full bg-white" />

  {/* inner solid */}
  <div className="absolute inset-[22px] rounded-full bg-[#5B2CA1]" />

</div>


  <div className="h-[190px]" />

{/* ================= MIDDLE NODE ================= */}
<div className="relative w-[76px] h-[76px] flex items-center justify-center z-10">

  {/* SEGMENTED / DOT OUTER RING */}
  <svg
    className="absolute inset-0"
    viewBox="0 0 100 100"
  >
    <circle
      cx="50"
      cy="50"
      r="46"
      fill="none"
      stroke="rgba(72, 33, 33, 1)"
      strokeWidth="4"
      strokeDasharray="10 12"
      strokeLinecap="round"
    />
  </svg>

  {/* white ring */}
  <div className="absolute inset-[12px] rounded-full bg-white" />

  {/* inner solid */}
  <div className="absolute inset-[22px] rounded-full bg-[#5B2D2D]" />

</div>



  <div className="h-[190px]" />

{/* ================= NODE ================= */}
<div className="relative w-[76px] h-[76px] flex items-center justify-center z-10">

  {/* SEGMENTED / DOT OUTER RING */}
  <svg
    className="absolute inset-0"
    viewBox="0 0 100 100"
  >
    <circle
      cx="50"
      cy="50"
      r="46"
      fill="none"
      stroke="rgba(72, 33, 33, 1)"
      strokeWidth="4"
      strokeDasharray="10 12"
      strokeLinecap="round"
    />
  </svg>

  {/* white ring */}
  <div className="absolute inset-[12px] rounded-full bg-white" />

  {/* inner solid — UPDATED COLOR */}
  <div
    className="absolute inset-[22px] rounded-full"
    style={{ background: "rgba(81, 33, 143, 1)" }}
  />

</div>


</div>




    {/* ================= RIGHT ================= */}
    <div className="flex flex-col gap-[80px] text-right pl-10">

      <div>
  <h3 className="font-['Aclonica'] text-[42px] font-semibold text-[#334155]">
    Experience Designer
  </h3>
  <p className="text-[#9CA3AF] text-[22px] mt-3 leading-[34px] max-w-[540px] ml-auto">
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis lacus nunc,
    posuere in justo vulputate, bibendum sodales
  </p>
</div>

<div>
  <h3 className="font-['Aclonica'] text-[42px] mb-0 font-semibold text-[#334155]">
    UI / UX Designer
  </h3>
  <p className="text-[#9CA3AF] text-[22px] mt-3 leading-[34px] max-w-[540px] ml-auto">
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis lacus nunc,
    posuere in justo vulputate, bibendum sodales
  </p>
</div>

<div>
  <h3 className="font-['Aclonica'] text-[42px] font-semibold text-[#334155]">
    Lead UX Designer
  </h3>
</div>

    </div>

  </div>

</section>
      {/* ======================= DISCUSS ========================== */}

      <section className="w-full h-[420px] flex flex-col items-center justify-center mb-2">

  {/* ---------- HEADING ---------- */}
  <h1 className="text-[60px] font-extrabold leading-tight text-center">
    <span className="text-[#2A3442]">Have an Awsome Project </span>
    <br />
    <span className="text-[#2A3442]">Idea? </span>
    <span className="text-[#7A32DB]">Let’s Discuss</span>
  </h1>

  {/* ---------- OUTER WHITE ROUND BORDER ---------- */}
  <div className="w-[900px] h-[90px] !border border-gray rounded-full mt-10 flex items-center justify-center relative">

    {/* BUTTON */}
    <button className="w-[250px] h-[70px] bg-[#7A32DB] text-white rounded-full text-[22px] font-medium">
      Message me
    </button>

  </div>

 {/* ---------- ICONS WITH TEXT ON RIGHT (UPDATED) ---------- */}
<div className="flex justify-center gap-[60px] mt-7 items-center select-none">

  {/* ⭐ Design */}
  <div className="flex items-center gap-4">
    <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 24H2" stroke="#2A3442" strokeWidth="3" strokeLinecap="round"/>
      <path d="M10 15L6 13" stroke="#2A3442" strokeWidth="3" strokeLinecap="round"/>
      <path d="M10 33L6 35" stroke="#2A3442" strokeWidth="3" strokeLinecap="round"/>
      <path d="M24 14C18.48 14 14 18.48 14 24C14 29.52 18.48 34 24 34C29.52 34 34 29.52 34 24C34 18.48 29.52 14 24 14Z" 
            stroke="#2A3442" strokeWidth="3"/>
      <path d="M24 17L26.5 22H32L27.8 25.8L29.2 31.2L24 28L18.8 31.2L20.2 25.8L16 22H21.5L24 17Z" 
            fill="#2A3442"/>
    </svg>

    <p className="text-[#2A3442] text-[20px] font-medium">4.9/5 Average Ratings</p>
  </div>

  {/* ⚙ Development */}
  <div className="flex items-center gap-4">
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L19 6V14L12 18L5 14V6L12 2Z"
            stroke="#2A3442" strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="3" fill="#2A3442"/>
    </svg>

    <p className="text-[#2A3442] text-[20px] font-medium">25+ Winning Awards</p>
  </div>

  {/* ✔ Quality */}
  <div className="flex items-center gap-4">
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L19 6V14L12 18L5 14V6L12 2Z"
            stroke="#2A3442" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M9.5 12.2L12 14.2L15.5 10"
            stroke="#2A3442" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>

    <p className="text-[#2A3442] text-[20px] font-medium">Certified Product Desiginer</p>
  </div>

</div>





</section>

<Footer />

    </div>
  );
}
