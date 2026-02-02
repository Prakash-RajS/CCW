import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


import FreeIcon from "../../assets/Landing/flashIcon.png";
import ProIcon from "../../assets/Landing/flashProIcon.png";
import AgentIcon from "../../assets/Landing/flashAgentIcon.png";

export default function Pricing() {
  const [billing, setBilling] = useState("monthly");
  const [hovered, setHovered] = useState(null);
  const [activeButton, setActiveButton] = useState(null);
  const navigate = useNavigate();

  const [users, setUsers] = useState({
    free: 1,
    pro: 2,
    agent: 5,
  });

  const changeUser = (type, delta) => {
    setUsers((prev) => ({
      ...prev,
      [type]: Math.max(1, prev[type] + delta),
    }));
  };

  const pricingData = {
    free: billing === "monthly" ? "$10" : "$100",
    pro: billing === "monthly" ? "$20" : "$200",
    agent: billing === "monthly" ? "$40" : "$400",
  };

  const getCardStyle = (index) =>
    hovered === index
      ? "bg-[radial-gradient(circle_at_20%_40%,#8A46FF_0%,#5B1EB5_40%,#2C1450_80%)] border border-[#E2E2E2] shadow-[0_0_20px_7px_#D7AC2B] scale-[1.02]"
      : "bg-[radial-gradient(circle_at_25%_40%,#7A3ACF_0%,#3A2E4B_35%,#1A191C_80%)]";

  const handleTouch = (index, buttonName) => {
    if (hovered === index) {
      setHovered(null);
      setActiveButton(null);
    } else {
      setHovered(index);
      setActiveButton(buttonName);
    }
  };

  return (
<div className="w-full flex flex-col items-center justify-center">

  {/* ---------------- TOP SECTION ---------------- */}
  <div
    className="
      w-full
      max-w-[1460px]
      h-auto md:h-[344px]
      px-4 md:px-[10px]

      -mt-95 sm:mt-10     /* 👈 STRONG visible gap removal on mobile */

      text-center
    "
  >
    <h1
      className="text-[34px] sm:text-[42px] lg:text-[60px] font-semibold leading-tight"
      style={{ fontFamily: 'Poppins, sans-serif', color: '#000000E0' }}
    >
      Simple Pricing, <br className="hidden sm:block" /> Powerful Features
    </h1>

    <p
      className="text-[16px] sm:text-[18px] lg:text-[22px] mt-4 px-2"
      style={{ fontFamily: 'Poppins, sans-serif', color: '#5A2D91' }}
    >
      Simple, transparent pricing that grows with you. Try any plan free for 30 days.
    </p>

    {/* BILLING TOGGLE */}
    <div className="flex items-center justify-center gap-2 sm:gap-4 mt-10 sm:mt-16 bg-[#2B0F63] p-1 sm:p-2 rounded-full w-fit mx-auto">
      <button
        onClick={() => setBilling('monthly')}
        className={`px-6 sm:px-10 py-2 sm:py-3 rounded-full font-semibold text-[14px] sm:text-[18px] transition-all duration-300
          ${billing === 'monthly' ? 'bg-white text-[#2B0F63]' : 'text-white'}`}
      >
        Monthly billing
      </button>

      <button
        onClick={() => setBilling('annual')}
        className={`px-6 sm:px-10 py-2 sm:py-3 rounded-full font-semibold text-[14px] sm:text-[18px] transition-all duration-300
          ${billing === 'annual' ? 'bg-white text-[#2B0F63]' : 'text-white'}`}
      >
        Annual billing
      </button>
    </div>

  </div>



{/* PRICING CARDS WRAPPER */}
<div
  className="
    w-full
    max-w-[1200px]
    mx-auto

    mt-6 sm:mt-8

    /* 📱 MOBILE — HORIZONTAL SNAP */
    flex
    flex-row
    gap-4
    overflow-x-auto
    px-[50vw]                /* 👈 centers middle card */
    snap-x snap-mandatory
    scroll-smooth

    [&>*]:snap-center        /* 👈 each card snaps to center */
    [&>*]:min-w-[260px]      /* 👈 compact mobile card width */

    /* 🖥 DESKTOP */
    lg:px-0
    lg:grid
    lg:grid-cols-3
    lg:gap-8
    lg:overflow-visible
  "
>




        {/* -------- FREE PLAN CARD -------- */}
        <div
          onMouseEnter={() => {
            setHovered(1);
            setActiveButton("free");
          }}
          onMouseLeave={() => {
            setHovered(null);
            setActiveButton(null);
          }}
          onTouchStart={() => handleTouch(1, "free")}
          className={`
            rounded-[20px] cursor-pointer transition-all duration-500
            p-6 sm:p-8 lg:p-10 min-h-[653px]
            ${getCardStyle(1)}
          `}
        >
<div className="w-12 h-12 bg-[#3D1768] rounded-full flex items-center justify-center mx-auto">
  <img src={FreeIcon} alt="free icon" className="w-6 h-6" />
</div>
          <h2 className="text-white text-center text-[20px] sm:text-[22px] mt-4">Free plan</h2>

          <p className="text-white text-[34px] sm:text-[48px] font-bold text-center mt-3">
            {pricingData.free}
            <span className="text-[16px] sm:text-[20px] font-normal">/month</span>
          </p>

          <p className="text-gray-300 text-center mt-2">Billed annually.</p>

          {/* USERS */}
         <div className="flex justify-center mt-6">
  <div className="
    flex items-center bg-white rounded-full

    /* 📱 MOBILE */
    px-3 py-1.5 gap-3 text-[13px]

    /* 🖥 DESKTOP */
    sm:px-6 sm:py-3 sm:gap-6 sm:text-base
  ">
    <button onClick={() => changeUser('free', -1)}>−</button>
    <span className="font-semibold">{users.free} USER</span>
    <button onClick={() => changeUser('free', +1)}>＋</button>
  </div>
</div>

<ul className="mt-6 space-y-6 text-white text-[14px] sm:text-[18px]">

  <li className="flex items-center gap-4">
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2l4 -4" /></svg>
    Basic messaging (Twilio)
  </li>

  <li className="flex items-center gap-4">
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2l4 -4" /></svg>
    Upload files up to 1 GB total storage
  </li>

  <li className="flex items-center gap-4">
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2l4 -4" /></svg>
    Email support (standard)
  </li>

  <li className="flex items-center gap-4">
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2l4 -4" /></svg>
    Join 1 active collaboration workspace
  </li>

  <li className="flex items-center gap-4">
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2l4 -4" /></svg>
    Access collaboration search (limited results)
  </li>

</ul>
<button
  onClick={() => navigate("/login")}
  className={`
    mt-8 w-full py-4 rounded-full text-[16px] !border !border-[#FFFFFF]
    font-medium transition-all duration-300
    ${activeButton === "free" ? "bg-white text-black" : "text-white"}
  `}
>
  Active
</button>

        </div>



        {/* -------- PRO PLAN CARD -------- */}
<div
  onMouseEnter={() => {
    setHovered(2);
    setActiveButton("pro");
  }}
  onMouseLeave={() => {
    setHovered(null);
    setActiveButton(null);
  }}
  onTouchStart={() => handleTouch(2, "pro")}
  className={`
    relative group
    rounded-[20px] cursor-pointer transition-all duration-500
    p-6 sm:p-8 lg:p-10 min-h-[653px]
    ${getCardStyle(2)}`}>
  
{/* ⭐ BEST VALUE STATIC SVG WITH HOVER ANIMATION */}
<div
  className="
    absolute top-[10px] right-[10px] w-[50px] h-[50px]
    transition-transform duration-300 ease-out
    group-hover:scale-125 group-hover:animate-pulse
  "
>
  <svg
    width="70"
    height="70"
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <defs>
      <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#00A65A" />
        <stop offset="100%" stopColor="#09e77fff" />
      </linearGradient>
    </defs>

    <path
      d="M100 10 
      L122 28 L150 30 L165 55 L190 65 
      L180 95 L190 125 L165 135 L150 160 
      L122 162 L100 180 L78 162 L50 160 
      L35 135 L10 125 L20 95 L10 65 
      L35 55 L50 30 L78 28 Z"
      fill="url(#greenGradient)"
    />
  </svg>

  <div className="absolute inset-0 flex flex-col items-center justify-center 
                  text-white text-[9px] font-bold leading-[9px] text-center">
    Best<br />Value
  </div>
</div>



  {/* Purple Circle Icon */}
  <div className="w-12 h-12 bg-[#3D1768] rounded-full flex items-center justify-center mx-auto">
    <img src={ProIcon} alt="pro icon" className="w-6 h-6" />
  </div>

  <h2 className="text-white text-center text-[20px] sm:text-[22px] mt-4">Pro plan</h2>

  <p className="text-white text-[34px] sm:text-[48px] font-bold text-center mt-3">
    {pricingData.pro}
    <span className="text-[16px] sm:text-[20px] font-normal">/month</span>
  </p>

  <p className="text-gray-300 text-center mt-2">Billed annually.</p>

{/* USERS */}
<div className="flex justify-center mt-6">
  <div
    className="
      flex items-center bg-white rounded-full

      /* 📱 MOBILE */
      px-3 py-1.5 gap-3 text-[13px]

      /* 🖥 DESKTOP */
      sm:px-6 sm:py-3 sm:gap-6 sm:text-base
    "
  >
    <button onClick={() => changeUser('pro', -1)}>−</button>
    <span className="font-semibold">{users.pro} USER</span>
    <button onClick={() => changeUser('pro', +1)}>＋</button>
  </div>
</div>


  {/* FEATURES */}
  <ul className="mt-6 space-y-6 text-white text-[14px] sm:text-[18px]">
    <li className="flex items-center gap-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9 12l2 

    2l4 -4" /></svg>
      Unlimited collaboration invites
    </li>

    <li className="flex items-center gap-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2l4 -4" /></svg>
      Access to resource marketplace
    </li>

    <li className="flex items-center gap-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2l4 -4" /></svg>
      Join or create up to 5 active workspaces
    </li>

    <li className="flex items-center gap-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2l4 -4" /></svg>
      10 GB storage for workspace uploads
    </li>

    <li className="flex items-center gap-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2l4 -4" /></svg>
      Task boards (Trello-style)
    </li>
  </ul>
<button
  onClick={() => navigate("/login")}
  className={`
    mt-8 w-full py-4 rounded-full text-[16px] !border !border-[#FFFFFF]
    font-medium transition-all duration-300
    ${activeButton === "pro" ? "bg-white text-black" : "text-white"}
  `}
>
  Upgrade to Pro
</button>


</div>

        {/* -------- AGENT PLAN CARD -------- */}
        <div
          onMouseEnter={() => {
            setHovered(3);
            setActiveButton("agent");
          }}
          onMouseLeave={() => {
            setHovered(null);
            setActiveButton(null);
          }}
          onTouchStart={() => handleTouch(3, "agent")}
          className={`
            rounded-[20px] cursor-pointer transition-all duration-500
            p-6 sm:p-8 lg:p-10 min-h-[653px]
            ${getCardStyle(3)}
          `}
        >
<div className=" w-12 h-12  bg-[#3D1768] rounded-full flex items-center justify-center ml-29 mt-0">
  <img src={AgentIcon} alt="icon" className="w-6 h-6" />
</div>
          <h2 className="text-white text-center text-[20px] sm:text-[22px] mt-4">Agent plan</h2>

          <p className="text-white text-[34px] sm:text-[48px] font-bold text-center mt-3">
            {pricingData.agent}
            <span className="text-[16px] sm:text-[20px] font-normal">/month</span>
          </p>

          <p className="text-gray-300 text-center mt-2">Billed annually.</p>

{/* USERS */}
<div className="flex justify-center mt-6">
  <div
    className="
      flex items-center bg-white rounded-full

      /* 📱 MOBILE */
      px-3 py-1.5 gap-3 text-[13px]

      /* 🖥 DESKTOP */
      sm:px-6 sm:py-3 sm:gap-6 sm:text-base
    "
  >
    <button onClick={() => changeUser('agent', -1)}>−</button>
    <span className="font-semibold">{users.agent} USER</span>
    <button onClick={() => changeUser('agent', +1)}>＋</button>
  </div>
</div>

<ul className="mt-8 space-y-6 text-gray-200 text-[14px] sm:text-[18px]">

  <li className="flex items-center gap-4">
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9 

12l2 2l4 -4" /></svg>
    Unlimited team members
  </li>

  <li className="flex items-center gap-4">
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2l4 -4" /></svg>
    Unlimited workspaces
  </li>

  <li className="flex items-center gap-4">
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2l4 -4" /></svg>
    Unlimited storage
  </li>

  <li className="flex items-center gap-4">
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2l4 -4" /></svg>
    Advanced analytics dashboard
  </li>

  <li className="flex items-center gap-4">
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2l4 -4" /></svg>
    Custom roles & permissions
  </li>

</ul>


        <button
  onClick={() => navigate("/login")}
  className={`
    mt-25 w-full py-4 rounded-full text-[16px] !border !border-[#FFFFFF]
    font-medium transition-all duration-300
    ${activeButton === "agent" ? "bg-white text-black" : "text-white"}
  `}
>
  Upgrade to Agent
</button>

        </div>
      </div>
    </div>
  );
}
