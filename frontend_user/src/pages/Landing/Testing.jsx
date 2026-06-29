import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Slide from "./Slide";
import Steps from "./Steps";
import Features from "../Landing/Features";
import Creator from "./Creator";
import Pricing from "./Pricing";
import Skill from "./Skill";
import Grow from "./Grow";
import Footer from "../../component/Footer";
import Collab from "../../assets/Landing/Collab.png";
import Star from "../../assets/Landing/Star.png";
import Triangle from "../../assets/Landing/Triangle.png";
import Slide1 from "../../assets/Landing/Slide1.png";
import Slide2 from "../../assets/Landing/Slide2.png";
import Slide3 from "../../assets/Landing/Slide3.png";

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
            const ease = 1 - Math.pow(1 - percent, 4);
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
          setCount(0);
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
  // const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // ========== SCROLL TO SECTION ON BACK NAVIGATION ==========
  useEffect(() => {
    const scrollToSection = async () => {
      if (!location.state?.scrollToSection) return;

      const sectionId = location.state.scrollToSection;
      // console.log("Attempting to scroll to section:", sectionId);

      // Function to perform scroll
      const performScroll = (id) => {
        const element = document.getElementById(id);
        if (element) {
          // console.log("Found element, scrolling to:", id);
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          return true;
        }
        return false;
      };

      // Try immediately
      if (performScroll(sectionId)) {
        // Clear the state after successful scroll
        window.history.replaceState({}, document.title);
        return;
      }

      // If not found, wait for DOM to load with multiple retries
      let attempts = 0;
      const maxAttempts = 10;
      const interval = setInterval(() => {
        attempts++;
        if (performScroll(sectionId)) {
          clearInterval(interval);
          window.history.replaceState({}, document.title);
        } else if (attempts >= maxAttempts) {
          // console.log("Max attempts reached, could not find element:", sectionId);
          clearInterval(interval);
        }
      }, 200);

      // Cleanup interval on component unmount
      return () => clearInterval(interval);
    };

    scrollToSection();
  }, [location.state, retryCount]);

  // Force re-check when components are mounted
  useEffect(() => {
    // Small delay to ensure all components are mounted
    const timer = setTimeout(() => {
      setRetryCount(prev => prev + 1);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // ========== TAB CLOSE / REOPEN → AUTO LOGOUT ==========
  // useEffect(() => {
  //   const tabAlive = sessionStorage.getItem('tab_alive');

  //   if (!tabAlive) {
  //     const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  //     fetch(`${apiBaseUrl}/auth/logout`, {
  //       method: 'POST',
  //       credentials: 'include',
  //     }).catch(() => { });

  //     localStorage.removeItem('user');
  //     localStorage.removeItem('token');
  //     localStorage.removeItem('userRole');
  //   }

  //   sessionStorage.setItem('tab_alive', 'true');
  // }, []);

  // ========== AUTH CHECK + ROLE-BASED REDIRECT ==========
  // useEffect(() => {
  //   const checkAuth = async () => {
  //     try {
  //       const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  //       const response = await fetch(`${apiBaseUrl}/auth/me`, {
  //         credentials: 'include',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //       });

  //       if (response.ok) {
  //         const userData = await response.json();
  //         setIsAuthenticated(true);

  //         if (userData.role === 'collaborator') {
  //           navigate("/col-home", { replace: true });
  //           return;
  //         } else if (userData.role === 'creator') {
  //           navigate("/home", { replace: true });
  //           return;
  //         }
  //       } else {
  //         setIsAuthenticated(false);
  //       }
  //     } catch (error) {
  //       setIsAuthenticated(false);
  //     } finally {
  //       setIsCheckingAuth(false);
  //     }
  //   };

  //   const urlParams = new URLSearchParams(location.search);
  //   const isLogout = urlParams.get('logout');

  //   if (!isLogout) {
  //     checkAuth();
  //   } else {
  //     window.history.replaceState({}, document.title, window.location.pathname);
  //     setIsCheckingAuth(false);
  //     setIsAuthenticated(false);
  //   }
  // }, [navigate, location]);

  // ========== NAVIGATION HELPER ==========
  const handleNavigate = (path) => {
    navigate(path);
  };

  // ========== LOGOUT ==========
  // const handleLogout = async () => {
  //   try {
  //     const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  //     await fetch(`${apiBaseUrl}/auth/logout`, {
  //       method: 'POST',
  //       credentials: 'include',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     localStorage.removeItem('user');
  //     localStorage.removeItem('token');
  //     localStorage.removeItem('userRole');
  //     sessionStorage.clear();

  //     setTimeout(() => {
  //       window.location.href = "/?logout=" + Date.now();
  //     }, 100);

  //   } catch (error) {
  //     console.error("Logout failed:", error);
  //     localStorage.clear();
  //     sessionStorage.clear();
  //     window.location.href = "/?logout=" + Date.now();
  //   }
  // };

  // ========== CARD CONFIG ==========
  const cards = [
    {
      id: 0,
      image: Slide1,
      alt: "Creators",
      countProps: { end: 35, duration: 2200, suffix: "+" },
      label: "Creators",
      canExpand: false
    },
    {
      id: 1,
      image: Slide2,
      alt: "IT Pros",
      countProps: { end: 20, duration: 2000, suffix: "+" },
      label: "IT professional",
      canExpand: true
    },
    {
      id: 2,
      image: Slide3,
      alt: "Users",
      countProps: { end: 2000, duration: 2500, suffix: "+", formatK: true },
      label: "Registered user",
      canExpand: true
    }
  ];

  const handleMouseEnter = (cardId) => setHoveredCard(cardId);
  const handleMouseLeave = () => setHoveredCard(null);

  const handleHowItWorksClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleNavigate("/signup");
  };

  // ========== LOADING STATE ==========
  // if (isCheckingAuth) {
  //   return (
  //     <div className="flex justify-center items-center h-screen">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
  //     </div>
  //   );
  // }

  return (
    <>
      {/* Hero Section with ID */}
      <div id="hero-section">
        {/* TABLET (md, 768–1023px): compact height so there's no dead space below the cards.
            Laptop (lg) restores 1150px; mobile stays h-auto. */}
        <section className="w-full h-auto md:h-[720px] lg:h-[1150px] relative overflow-hidden bg-white">
          {/* HEADER */}
          <header className="w-full z-50 relative">
            <div className="mx-auto px-3 sm:px-6 lg:px-12">
              <div className="flex items-center justify-between h-14 sm:h-20">

                {/* LEFT: Logo */}
                <div className="flex-shrink-0">
                  <h1
                    className="text-[22px] xs:text-[24px] sm:text-4xl md:text-5xl lg:text-[50px] font-bold leading-none cursor-pointer"
                    style={{
                      fontFamily: "'Trochut', 'Trochut Bold', cursive",
                      background: "linear-gradient(270deg, #51218F 22.62%, #030303 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                    onClick={() => handleNavigate("/")}
                  >
                    Talenta
                  </h1>
                </div>

                {/* DESKTOP NAV */}
                <nav className="hidden sm:flex items-center justify-center flex-1 z-[100] relative">
                  <button
                    onClick={handleHowItWorksClick}
                    className="hover:text-[#51218F] transition cursor-pointer bg-transparent border-none p-0 text-sm md:text-base lg:text-lg font-medium text-[#555555]"
                  >
                    How it works
                  </button>
                </nav>

                {/* RIGHT: Buttons — DESKTOP */}
                <div className="hidden sm:flex items-center gap-3 md:gap-4 z-[100] relative">
                  {isAuthenticated ? (
                    <button
                      // onClick={handleLogout}
                      className="px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-all duration-300 !border border-red-500 text-red-500 bg-white hover:bg-red-500 hover:text-white hover:shadow-md cursor-pointer"
                    >
                      Logout
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleNavigate("/login")}
                        className="px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-all duration-300 !border border-[#51218F] text-[#51218F] bg-white hover:bg-gradient-to-r hover:from-[#51218F] hover:to-[#170929] hover:text-white hover:shadow-md cursor-pointer"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => handleNavigate("/signup")}
                        className="px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-all duration-300 !border border-[#51218F] text-[#51218F] bg-white hover:bg-gradient-to-r hover:from-[#51218F] hover:to-[#170929] hover:text-white hover:shadow-md cursor-pointer"
                      >
                        Sign UP
                      </button>
                    </>
                  )}
                </div>

                {/* MOBILE VERSION */}
                <div className="sm:hidden flex items-center justify-between w-full">
                  <button
                    onClick={handleHowItWorksClick}
                    className="text-[10px] xs:text-[14px] font-medium text-[#555555] hover:text-[#51218F] transition cursor-pointer bg-transparent border-none p-0 whitespace-nowrap flex-1 text-center"
                  >
                    How it works
                  </button>
                  <div className="flex items-center gap-2 xs:gap-3">
                    {isAuthenticated ? (
                      <button
                        // onClick={handleLogout}
                        className="px-2.5 py-1 xs:px-3 xs:py-1 text-[11px] xs:text-[12px] font-medium rounded-full whitespace-nowrap transition-all duration-300 !border border-red-500 text-red-500 bg-white hover:bg-red-500 hover:text-white hover:shadow-md"
                      >
                        Logout
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleNavigate("/login")}
                          className="px-2.5 py-1 xs:px-3 xs:py-1 text-[11px] xs:text-[12px] font-medium rounded-full whitespace-nowrap transition-all duration-300 !border border-[#51218F] text-[#51218F] bg-white hover:bg-gradient-to-r hover:from-[#51218F] hover:to-[#170929] hover:text-white hover:shadow-md"
                        >
                          Login
                        </button>
                        <button
                          onClick={() => handleNavigate("/signup")}
                          className="px-2.5 py-1 xs:px-3 xs:py-1 text-[11px] xs:text-[12px] font-semibold rounded-full whitespace-nowrap transition-all duration-300 !border border-[#51218F] text-[#51218F] bg-white hover:bg-gradient-to-r hover:from-[#51218F] hover:to-[#170929] hover:text-white hover:shadow-md"
                        >
                          Sign UP
                        </button>
                      </>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </header>

          {/* Rest of your hero section content - keep as is */}
          {/* TABLET: illustration lowered (sm:top-[70px]) and smaller (md:w-[40vw]) so it clears the
              heading and the nav; lg restores originals. */}
          <div className="absolute top-8 sm:top-[70px] lg:top-0 right-[2%] sm:right-[3%] md:right-[10%] lg:right-[3%] xl:right-[5%] h-[400px] xs:h-[500px] sm:h-[400px] lg:h-[900px] flex justify-end items-center pointer-events-none">
            <div className="absolute top-8 sm:top-0 right-[15%] sm:right-[14%] lg:right-[20%] xl:right-[25%] h-[400px] xs:h-[500px] sm:h-[400px] lg:h-[900px] flex justify-end items-center pointer-events-none">
              <div className="relative inline-block -translate-y-[100px] xs:-translate-y-[120px] sm:-translate-y-0 lg:-translate-y-[100px] xl:-translate-y-[60px] pointer-events-none">
                <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                  <div className="w-[180px] h-[140px] xs:w-[220px] xs:h-[180px] sm:w-[300px] sm:h-[200px] md:w-[420px] md:h-[280px] lg:w-[420px] lg:h-[260px] xl:w-[600px] xl:h-[280px] rounded-full bg-gradient-to-b from-[#170929] via-[#51218F] to-[#8421FF] blur-[80px] sm:blur-[120px] opacity-80" />
                </div>

                {/* TABLET: smaller image (md:w-[40vw]); lg sized for 1024-1279px; xl restores originals. */}
                <img
                  src={Collab}
                  alt="Collab illustration"
                  className="relative max-w-none object-contain w-[70vw] xs:w-[65vw] sm:w-[46vw] md:w-[40vw] lg:w-[380px] xl:w-[600px] h-[180px] xs:h-[220px] sm:h-[400px] lg:h-[340px] xl:h-[550px] translate-x-[20px] sm:translate-x-0 opacity-90"
                />

                <svg
                  viewBox="0 0 258 23"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute pointer-events-none opacity-50 top-full left-[58%] -translate-x-[50%] sm:left-1/2 sm:-translate-x-1/2 w-[100px] h-[10px] xs:w-[120px] xs:h-[12px] sm:w-[200px] sm:h-[18px] lg:w-[185px] lg:h-[18px] xl:w-[218px] xl:h-[23px]"
                >
                  <ellipse cx="129" cy="11.5" rx="129" ry="11.5" fill="#0f0f10" fillOpacity="0." />
                </svg>

                {/* FLOATING TRIANGLES — MOBILE */}
                {[
                  { top: "calc(70% - 100px)", left: "calc(50% + 80px)", rotate: "-60deg" },
                  { top: "calc(100% - 80px)", left: "calc(50% - 50px)", rotate: "20deg" },
                  { top: "calc(50% + 70px)", left: "calc(50% + 75px)", rotate: "110deg" },
                  { top: "calc(40% + 80px)", left: "calc(50% - 45px)", rotate: "-140deg" },
                ].map((pos, i) => (
                  <img
                    key={`m-${i}`}
                    src={Triangle}
                    alt={`Triangle mobile ${i + 1}`}
                    className="absolute sm:hidden w-[12px] h-[12px] xs:w-[14px] xs:h-[14px] opacity-80 pointer-events-none"
                    style={{ top: pos.top, left: pos.left, transform: `rotate(${pos.rotate})`, animation: `float 6s ease-in-out infinite ${i * 0.4}s` }}
                  />
                ))}

                {/* FLOATING TRIANGLES*/}
                {[
                  { top: "16%", left: "-4%", rotate: "20deg" },
                  { top: "18%", left: "90%", rotate: "-60deg" },
                  { top: "80%", left: "-2%", rotate: "-140deg" },
                  { top: "86%", left: "86%", rotate: "110deg" },
                ].map((pos, i) => (
                  <img
                    key={`t-${i}`}
                    src={Triangle}
                    alt={`Triangle tablet ${i + 1}`}
                    className="absolute hidden md:block lg:hidden w-[24px] h-[24px] opacity-80 pointer-events-none"
                    style={{ top: pos.top, left: pos.left, transform: `rotate(${pos.rotate})`, animation: `float 6s ease-in-out infinite ${i * 0.4}s` }}
                  />
                ))}

                {/* FLOATING TRIANGLES — LAPTOP (lg, 1024-1279px)*/}
                {[
                  { top: "calc(40% - 135px)", left: "calc(50% + 120px)", rotate: "-60deg" },
                  { top: "calc(40% - 120px)", left: "calc(50% - 135px)", rotate: "20deg" },
                  { top: "calc(70% + 105px)", left: "calc(50% + 112px)", rotate: "110deg" },
                  { top: "calc(70% + 120px)", left: "calc(50% - 128px)", rotate: "-140deg" },
                ].map((pos, i) => (
                  <img
                    key={`l-${i}`}
                    src={Triangle}
                    alt={`Triangle laptop ${i + 1}`}
                    className="absolute hidden lg:block xl:hidden w-[32px] h-[32px] opacity-80 pointer-events-none"
                    style={{ top: pos.top, left: pos.left, transform: `rotate(${pos.rotate})`, animation: `float 6s ease-in-out infinite ${i * 0.4}s` }}
                  />
                ))}

                {/* FLOATING TRIANGLES — DESKTOP (xl, 1280px+) */}
                {[
                  { top: "calc(40% - 180px)", left: "calc(50% + 160px)", rotate: "-60deg" },
                  { top: "calc(40% - 160px)", left: "calc(50% - 180px)", rotate: "20deg" },
                  { top: "calc(70% + 140px)", left: "calc(50% + 150px)", rotate: "110deg" },
                  { top: "calc(70% + 160px)", left: "calc(50% - 170px)", rotate: "-140deg" },
                ].map((pos, i) => (
                  <img
                    key={`d-${i}`}
                    src={Triangle}
                    alt={`Triangle desktop ${i + 1}`}
                    className="absolute hidden xl:block w-[50px] h-[50px] opacity-80 pointer-events-none"
                    style={{ top: pos.top, left: pos.left, transform: `rotate(${pos.rotate})`, animation: `float 6s ease-in-out infinite ${i * 0.4}s` }}
                  />
                ))}

                {/* DESIGN & VIDEO TAGS */}
                {[
                  {
                    top: "calc(69% - 0px)",
                    left: "calc(65% + 60px)",
                    rotate: "45deg",
                    text: "Video editing",
                    mobile: "mt-2 -ml-8 w-auto h-auto",
                  },
                  {
                    top: "calc(79% + 40px)",
                    left: "calc(40% - 100px)",
                    rotate: "45deg",
                    text: "Design",
                    mobile: "mt-[-40px] ml-[30%] w-auto h-auto",
                  },
                ].map((pos, i) => (
                  <div
                    key={`pill-${i}`}
                    className={`absolute px-1.5 py-0.5 lg:px-3 lg:py-1 xl:px-4 xl:py-1.5 text-[6px] xs:text-[7px] lg:text-[11px] xl:text-[13px] font-medium text-white whitespace-nowrap pointer-events-none rounded-full bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] shadow-[0_6px_16px_rgba(124,58,237,0.45)] backdrop-blur-md flex items-center justify-center ${pos.mobile} md:mt-0 md:ml-0 lg:mt-0 lg:ml-0 lg:w-auto lg:h-auto`}
                    style={{ top: pos.top, left: pos.left, transform: `rotate(${pos.rotate})`, animation: `float 7s ease-in-out infinite ${i * 0.4}s` }}
                  >
                    {pos.text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hero Text */}
          <div className="relative -mt-2 xs:-mt-8 w-[65%] xs:w-[60%] pl-5 xs:pl-8 sm:mt-0 sm:pl-0 sm:absolute sm:top-[105px] md:top-[105px] lg:top-[50px] sm:left-[3%] lg:left-[4%] xl:left-[5%] sm:w-[576px] flex flex-col gap-2.5 sm:gap-6 text-left z-10">
            <img
              src={Star}
              alt="Star Icon"
              className="w-[16px] h-[16px] xs:w-[18px] xs:h-[18px] sm:w-[50px] sm:h-[50px] md:w-[52px] md:h-[52px] lg:w-[60px] lg:h-[60px] relative sm:absolute lg:relative translate-y-5 translate-x-[10px] xs:translate-y-6 xs:translate-x-0 object-contain self-center sm:self-start sm:translate-y-10 sm:translate-x-[300px] md:translate-x-[250px] md:-translate-y-[28px] lg:translate-y-16 lg:translate-x-[420px] sm:z-10"
              style={{ animation: "spinZoom 4s linear infinite" }}
            />

            <h1 className="text-[24px] leading-[110%] xs:text-[28px] sm:text-[52px] md:text-[60px] lg:text-[100px] sm:leading-[100%] lg:leading-[90%] text-transparent bg-gradient-to-b from-[#170929] to-[#51218F] bg-clip-text whitespace-nowrap" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              The Future<br />
              of Creative<br />
              Collaboration.
            </h1>

            <p className="text-[8px] leading-[12px] xs:text-[11px] xs:leading-[16px] sm:text-[16px] md:text-[18px] lg:text-[28px] sm:leading-[24px] lg:leading-[45px] text-transparent bg-gradient-to-b from-[#170929] to-[#8421FF] bg-clip-text max-w-[160px] xs:max-w-[200px] sm:max-w-none pr-4 sm:pr-0" style={{ fontFamily: "'Times New Roman', Times, serif", fontWeight: "normal", fontStyle: "normal" }}>
              Join a trusted global network for<br />
              creative excellence and impactful<br />
              collaborations
            </p>
          </div>

          {/* CTA Button */}
         <div className="relative w-[65%] xs:w-[60%]  mt-3 pl-5 xs:pl-8 sm:mt-0 sm:pl-0 flex flex-row gap-3 sm:absolute sm:top-[405px] md:top-[420px] lg:top-[650px] sm:left-[3%] lg:left-[4%] xl:left-[5%] sm:w-[528px] sm:flex-row sm:gap-6 z-20">
            <button
              onClick={() => handleNavigate('/signup')}
              className="h-[28px] px-4 text-[10px] rounded-full xs:h-[32px] xs:px-5 xs:text-[11px] sm:h-[58px] sm:px-10 sm:text-[20px] sm:rounded-[18px] md:max-lg:h-[48px] md:max-lg:px-7 md:max-lg:text-[16px] md:max-lg:rounded-[14px] font-medium flex items-center justify-center transition-all duration-300 bg-white text-[#51218F] !border border-[#51218F] hover:bg-gradient-to-r hover:from-[#51218F] hover:to-[#170929] hover:text-white hover:shadow-xl active:scale-95"
            >
              Join as Talenta
            </button>
          </div>

          {/* Stats Cards */}
          
          <div className="relative md:absolute md:top-[540px] lg:top-[806px] left-1/2 -translate-x-1/2 w-[96%] lg:w-[calc(100%-96px)] max-w-none mt-10 md:mt-0 lg:mt-0 z-30 max-sm:mt-20">
            <div className="flex flex-row justify-center items-center gap-1.5 xs:gap-2 md:gap-6 lg:gap-10 flex-nowrap w-full">
              {cards.map((card, index) => {
                const isHovered = card.id === hoveredCard;
                const animationDelay = 0.3 + (index * 0.3);

                return (
                  <div
                    key={card.id}
                    className={`
                      w-[32%] h-[60px] xs:h-[75px] sm:w-[220px] sm:h-[130px] lg:flex-1 lg:max-w-none lg:h-[240px] xl:h-[294px]
                      flex-shrink-0 min-w-0
                      rounded-[8px] sm:rounded-[15px] shadow-[3px_5px_10px_0px_rgba(85,85,85,0.5)] md:shadow-[10px_10px_30px_10px_#555555] lg:shadow-[10px_10px_30px_10px_#555555] overflow-hidden relative opacity-0 cursor-pointer transition-all duration-500 ease-in-out
                    `}
                    style={{
                      animation: `slideUpFade 1s ease-out forwards ${animationDelay}s`,
                      zIndex: isHovered ? 10 : 1
                    }}
                    onMouseEnter={() => handleMouseEnter(card.id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <img
                      src={card.image}
                      alt={card.alt}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-start">
                      <div className="pl-2 xs:pl-3 sm:pl-6 lg:pl-8 xl:pl-12 origin-left transition-all duration-300">
                        <p className="text-white font-bold leading-tight text-[16px] xs:text-[20px] sm:text-[36px] lg:text-[60px] xl:text-[80px]">
                          <CountUp {...card.countProps} />
                        </p>
                        <p className="text-white font-medium text-[7px] xs:text-[8.5px] sm:text-[14px] lg:text-[32px] xl:text-[50px] leading-[1.1] mt-0.5 lg:mt-2">
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
      </div>

      {/* Other Sections with proper IDs */}
      <div id="slide-section">
        <Slide />
      </div>

      <div id="steps-section">
        <Steps />
      </div>

      <div id="features-section">
        <Features />
      </div>

      <div id="creator-section">
        <Creator />
      </div>

      <div id="pricing-section">
        <Pricing />
      </div>

      <div id="skill-section">
        <Skill />
      </div>

      <div id="grow-section">
        <Grow />
      </div>

      <Footer />
    </>
  );
};

export default Testing;