import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom"; // ← Added this import

import Slide from "./Slide";
import Steps from "./Steps";
import Features from "../Landing/Features"; 
import Creator from "./Creator";
import Pricing from "./Pricing";
import Skill from "./Skill";
import Grow from "./Grow";
import Footer from "../../component/Footer";
   import { Link } from "react-router-dom";
import Collab from "../../assets/Landing/Collab.png";
import Star from "../../assets/Landing/Star.png";
import Triangle from "../../assets/Landing/Triangle.png";
import Slide1 from "../../assets/Landing/Slide1.png";
import Slide2 from "../../assets/Landing/Slide2.png";
import Slide3 from "../../assets/Landing/Slide3.png";

// Fixed CountUp – works in .jsx (no TypeScript types)
const CountUp = ({ end, duration = 2000, suffix = "", formatK = false }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let startTime = null;

          const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percent = Math.min(progress / duration, 1);
            const ease = 1 - Math.pow(1 - percent, 4); // easeOutQuart
            const value = Math.floor(ease * end);

            setCount(value);

            if (percent < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(end);
            }
          };

          requestAnimationFrame(animate);
        } else {
          setCount(0); // reset so it counts again when you scroll back
        }
      },
      { threshold: 0.6, rootMargin: "0px 0px -100px 0px" }
    );

    observer.observe(node);
    return () => observer.unobserve(node);
  }, [end, duration]);

  const displayValue = formatK && count >= 1000 
    ? `${(count / 1000).toFixed(1)}k` 
    : count;

  return <span ref={ref}>{displayValue}{suffix}</span>;
};

const Testing = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isOpen, setIsOpen] = useState(false); // ← Added missing state
  const navigate = useNavigate(); // ← Added navigate hook

  // Card configurations
  const cards = [
    {
      id: 0,
      image: Slide1,
      alt: "Creators",
      defaultSize: "w-[470px] h-[294px]",
      hoverSize: "w-[470px] h-[294px]",
      textSize: {
        number: "text-[80px]",
        label: "text-[50px]",
        pl: "pl-12"
      },
      hoverTextSize: {
        number: "text-[80px]",
        label: "text-[50px]"
      },
      countProps: { end: 35, duration: 2200, suffix: "+" },
      label: "Creators",
      canExpand: false
    },
    {
      id: 1,
      image: Slide2,
      alt: "IT Pros",
      defaultSize: "w-[377px] h-[202px]",
      hoverSize: "w-[470px] h-[294px]",
      textSize: {
        number: "text-[40px]",
        label: "text-[30px]",
        pl: "pl-10"
      },
      hoverTextSize: {
        number: "text-[80px]",
        label: "text-[50px]",
        pl: "pl-12"
      },
      countProps: { end: 20, duration: 2000, suffix: "+" },
      label: "IT professional",
      canExpand: true
    },
    {
      id: 2,
      image: Slide3,
      alt: "Users",
      defaultSize: "w-[348px] h-[146px]",
      hoverSize: "w-[470px] h-[294px]",
      textSize: {
        number: "text-[35px]",
        label: "text-[25px]",
        pl: "pl-8"
      },
      hoverTextSize: {
        number: "text-[80px]",
        label: "text-[50px]",
        pl: "pl-12"
      },
      countProps: { end: 2000, duration: 2500, suffix: "+", formatK: true },
      label: "Registered user",
      canExpand: true
    }
  ];

  const handleMouseEnter = (cardId) => {
    setHoveredCard(cardId);
  };

  const handleMouseLeave = () => {
    setHoveredCard(null);
  };

  return (
    <>
      <section className="w-full h-[1150px] relative overflow-hidden">
    <header className="w-full z-50">
  <div className="mx-auto px-3 sm:px-6 lg:px-12">
    <div className="flex items-center justify-between h-14 sm:h-20">

      {/* LEFT: Logo */}
      <div className="flex-shrink-0">
        <h1
          className="
            text-[22px]      /* 320px */
            xs:text-[24px]   /* 375px */
            sm:text-4xl
            md:text-5xl
            lg:text-[50px]
            font-bold leading-none
          "
          style={{
            fontFamily: "Trochut, cursive",
            background: "linear-gradient(270deg, #51218F 22.62%, #030303 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Talenta
        </h1>
      </div>

      {/* CENTER NAV — DESKTOP ONLY */}
      <nav className="hidden sm:flex items-center gap-6 md:gap-10 lg:gap-16 flex-1 justify-center text-sm md:text-base lg:text-lg font-medium text-[#555555]">
        <Link to="/signup" className="hover:text-[#51218F] transition">How it works</Link>
        <Link to="/signup" className="hover:text-[#51218F] transition">For creators</Link>
        <Link to="/signup" className="hover:text-[#51218F] transition">For talents</Link>
      </nav>

      {/* RIGHT: Buttons — DESKTOP ONLY */}
      <div className="hidden sm:flex items-center gap-3 md:gap-4">
        <button
          onClick={() => navigate("/signup")}
          className="px-5 py-2.5 text-sm md:text-base font-semibold text-[#51218F] bg-white border border-[#51218F] rounded-full cursor-pointer"
        >
          Sign Up
        </button>

        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2.5 text-sm md:text-base font-medium text-white bg-gradient-to-r from-[#51218F] to-[#170929] rounded-full cursor-pointer"
        >
          Login
        </button>
      </div>

      {/* ✅ MOBILE — SINGLE LINE GUARANTEED */}
      <div
        className="
          sm:hidden
          flex
          items-center
          gap-2          /* tighter gap for 320px */
          xs:gap-3
          flex-nowrap
          text-[11px]    /* 320px */
          xs:text-[12px] /* 375px */
          font-medium
          text-[#4b4b4b]
        "
      >
        <Link
          to="/login"
          className="whitespace-nowrap hover:text-[#51218F]"
        >
          How its works
        </Link>

        <button
          onClick={() => navigate("/signupac")}
          className="
            px-2.5 py-1
            xs:px-3 xs:py-1
            text-[11px]
            xs:text-[12px]
            font-semibold
            text-[#51218F]
            border border-[#51218F]
            rounded-full
            whitespace-nowrap
          "
        >
          Sign UP
        </button>

        <button
          onClick={() => navigate("/login")}
          className="
            px-2.5 py-1
            xs:px-3 xs:py-1
            text-[11px]
            xs:text-[12px]
            font-medium
            text-white
            bg-gradient-to-r from-[#51218F] to-[#170929]
            rounded-full
            whitespace-nowrap
          "
        >
          Login
        </button>
      </div>

    </div>
  </div>
</header>



{/* Background Blob */}
<div
  className="
    absolute
    top-0
    right-0
    sm:right-[20px]
    h-[900px]
    flex
    justify-end
    items-center
    pointer-events-none
  "
>
{/* Glow Blob */}
<div className="absolute inset-0 flex justify-center items-center">
  <div
    className="
      w-[220px] h-[180px]        /* 📱 mobile glow */
      sm:w-[300px] sm:h-[200px]
      md:w-[420px] md:h-[280px]
      lg:w-[600px] lg:h-[280px]

      rounded-full
      bg-gradient-to-b from-[#170929] via-[#51218F] to-[#8421FF]
      blur-[120px]
      opacity-80

      /* 📱 MOBILE — MOVE UP & RIGHT */
      -translate-y-[200px]
      translate-x-[80px]

      /* 🖥 DESKTOP — UNCHANGED */
      sm:translate-x-0
      sm:translate-y-0
    "
  />
</div>


{/* Main Illustration */}
<img
  src={Collab}
  alt="Collab illustration"
  className="
    relative
    max-w-none
    object-contain

    /* SIZE */
    w-[85vw]
    xs:w-[80vw]
    sm:w-[40vw]
    lg:w-[600px]
    xl:w-[680px]

    h-[240px]
    xs:h-[260px]
    sm:h-[400px]
    lg:h-[400px]
    xl:h-[680px]

    /* 📱 MOBILE — moved more UP */
    translate-x-[52px]
    -translate-y-[260px]      /* ⬆️ increased from 220px → moves image up */

    /* 🖥 DESKTOP — UNCHANGED */
    sm:translate-x-0
    sm:-translate-y-[40px]
    lg:-translate-y-[60px]

    opacity-90
  "
/>

{/* ================= FLOATING SHAPES ================= */}
{[
  {
    top: "calc(50% - 180px)",
    left: "calc(50% + 160px)",
    rotate: "-60deg",
  },
  {
    top: "calc(50% - 160px)",
    left: "calc(50% - 180px)", // LEFT triangle
    rotate: "20deg",
  },
  {
    top: "calc(50% + 140px)",
    left: "calc(50% + 150px)",
    rotate: "110deg",
  },
  {
    top: "calc(50% + 160px)",
    left: "calc(50% - 170px)",
    rotate: "-140deg",
  },
].map((pos, i) => (
  <img
    key={i}
    src={Triangle}
    alt={`Triangle ${i + 1}`}
    className={`
      absolute
      w-[28px] h-[28px]
      sm:w-[36px] sm:h-[36px]
      lg:w-[50px] lg:h-[50px]
      opacity-80
      pointer-events-none

      /* 📱 MOBILE: hide bottom triangles */
      ${i > 1 ? "hidden sm:block" : "block"}
    `}
    style={{
      top: pos.top,

      /* ✅ FORCE RIGHT SIDE ON MOBILE FOR LEFT TRIANGLE */
      left:
        i === 1 && window.innerWidth < 640
          ? "auto"
          : pos.left,
      right:
        i === 1 && window.innerWidth < 640
          ? "24px"
          : "auto",

      transform: `rotate(${pos.rotate})`,
      animation: `float 6s ease-in-out infinite ${i * 0.4}s`,
    }}
  />
))}


</div>

{/* Hero Text */}
<div
  className="
    relative
    -mt-8                 /* 📱 move text UP */
    w-[55%]

    sm:absolute
    sm:top-[50px]
    sm:left-[85px]
    sm:w-[576px]

    flex
    flex-col
    gap-4
    sm:gap-6
    text-left
  "
>

<img
  src={Star}
  alt="Star Icon"
  className="
    /* 📱 Mobile size & position */
    w-[24px] h-[24px]
    relative
    translate-y-8
    translate-x-30

    /* 🖥 Desktop (UNCHANGED) */
    sm:w-[60px] sm:h-[60px]
    object-contain
    self-start
    sm:relative
    sm:translate-y-16
    sm:translate-x-[380px]
    sm:z-10
  "
  style={{ animation: 'spinZoom 4s linear infinite' }}
/>





  <h1
    className="
      text-[32px] leading-[115%]     /* 📱 320px */
      xs:text-[36px]                 /* 📱 375px */
      sm:text-[100px] sm:leading-[90%]
      trochut-font
      text-transparent
      bg-gradient-to-b from-[#170929] to-[#51218F]
      bg-clip-text
      whitespace-nowrap              /* ❌ no word break */
    "
  >
    The Future<br />
    of Creative<br />
    Collaboration.
  </h1>

  <p
    className="
      text-[14px] leading-[22px]     /* 📱 mobile */
      xs:text-[15px] xs:leading-[24px]
      sm:text-[28px] sm:leading-[45px]
      text-transparent
      bg-gradient-to-b from-[#170929] to-[#8421FF]
      bg-clip-text
      max-w-[260px]
      sm:max-w-none
    "
  >
    Join a trusted global network for<br />
    creative excellence and impactful<br />
    collaborations
  </p>
</div>


{/* Buttons */}
<div
  className="
    relative
    w-[55%]                  /* 📱 align with text */
    mt-4

    flex
    flex-row                 /* 📱 side-by-side */
    gap-3

    sm:absolute
    sm:top-[650px]
    sm:left-[80px]
    sm:w-[528px]
    sm:flex-row
    sm:gap-6

    z-20
  "
>
{/* Find collaborator */}
<button
  onClick={() => navigate("/login")}
  className="
    flex-1

    /* 📱 MOBILE */
    h-[32px]
    text-[11px]
    rounded-[8px]

    /* 📲 SMALL TABLET */
    xs:h-[36px]
    xs:text-[12px]
    xs:rounded-[10px]

    /* 💻 TABLET / DESKTOP */
    sm:w-[251px]
    sm:h-[58px]
    sm:text-[18px]
    sm:rounded-[15px]
    sm:translate-x-2      /* 👉 move a little to the right */

    bg-[#8A38F51A]
    border border-[#51218F]

    flex items-center justify-center
    text-[#51218F]
    font-medium

    transition-all duration-300
    hover:bg-gradient-to-r hover:from-[#51218F] hover:to-[#170929]
    hover:text-white hover:shadow-xl
  "
>
  Find collaborator
</button>



{/* Join as creator */}
<button
  onClick={() => navigate("/login")}
  className="
    flex-1

    /* 📱 MOBILE */
    h-[32px]
    text-[11px]
    rounded-[8px]

    /* 📲 SMALL TABLET */
    xs:h-[36px]
    xs:text-[12px]
    xs:rounded-[10px]

    /* 💻 TABLET / DESKTOP */
    sm:w-[251px]
    sm:h-[58px]
    sm:text-[18px]
    sm:rounded-[15px]

    bg-[#51218F]
    text-white
    border border-[#51218F]

    flex items-center justify-center
    font-medium

    transition-all duration-300
    hover:opacity-90 hover:shadow-xl
  "
>
  Join as creator
</button>

</div>



{/* Stats Cards */}
<div className="relative lg:absolute lg:top-[806px] left-1/2 -translate-x-1/2 w-full max-w-[1300px] px-4 md:px-6 mt-10 lg:mt-0">
  <div className="flex justify-center items-center gap-2 md:gap-10 flex-nowrap">
    {cards.map((card, index) => {
      const isHovered = card.id === hoveredCard;
      const animationDelay = 0.3 + (index * 0.3);
      
      const sizeClass = isHovered && card.canExpand 
        ? card.hoverSize 
        : card.defaultSize;

      // UPDATED: Fixed height to 160px for all cards on mobile
      const mobileSizes = [
        "w-[470px] h-[160px]", 
        "w-[377px] h-[160px]", 
        "w-[348px] h-[160px]"  
      ];

      const textSizeNumber = isHovered && card.canExpand 
        ? card.hoverTextSize.number 
        : card.textSize.number;
      
      const textSizeLabel = isHovered && card.canExpand 
        ? card.hoverTextSize.label 
        : card.textSize.label;
      
      const paddingClass = isHovered && card.canExpand 
        ? card.hoverTextSize.pl || card.textSize.pl
        : card.textSize.pl;
      
      return (
        <div
          key={card.id}
          className={`
            ${sizeClass} 
            max-lg:${mobileSizes[index]} 
            flex-shrink-1 min-w-0
            rounded-[15px] shadow-[10px_10px_30px_10px_#555555] overflow-hidden relative opacity-0 cursor-pointer transition-all duration-500 ease-in-out
          `}
          style={{ 
            animation: `slideUpFade 1s ease-out forwards ${animationDelay}s`,
            zIndex: isHovered ? 10 : 1
          }}
          onMouseEnter={() => handleMouseEnter(card.id)}
          onMouseLeave={handleMouseLeave}
        >
          {/* object-cover ensures image fits the 160px height without distortion */}
          <img 
            src={card.image} 
            alt={card.alt} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
          />
          <div className="absolute inset-0 flex items-center justify-start">
            <div className={`
              ${paddingClass} 
              max-lg:pl-3 
              max-lg:scale-[0.6] lg:scale-100 
              origin-left transition-all duration-300
            `}>
              <p className={`
                text-white font-semibold leading-tight whitespace-nowrap
                ${textSizeNumber} 
                max-lg:text-[14px] 
              `}>
                <CountUp {...card.countProps} />
              </p>
              <p className={`
                text-white font-semibold whitespace-nowrap
                ${textSizeLabel} 
                max-lg:text-[10px] 
              `}>
                {card.label}
              </p>
            </div>
          </div>
          
          <div className={`absolute inset-0 bg-gradient-to-t from-black/40 to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
        </div>
      );
    })}
  </div>
</div>



        {/* Animations */}
        <style>{`
          @keyframes slideUpFade {
            from { opacity: 0; transform: translateY(80px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes spinZoom {
            0%, 100% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(180deg) scale(1.3); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
        `}</style>
      </section>
      <Slide />
      <Steps />
      <Features />
      <Creator />
      <Pricing />
      <Skill />
      <Grow />
      <Footer />
    </>
  );
};

export default Testing;