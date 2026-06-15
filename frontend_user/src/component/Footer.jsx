//this is my new footer
import React from "react";
import Uparrow from "../assets/Landing/Uparrow.png";
import { useNavigate } from "react-router-dom";
/* ================= SOCIAL ICONS (UPDATED COMPACT STYLE) ================= */

const SocialWrapper = ({ children, onClick }) => (
  <div 
    onClick={onClick}
    className="flex items-center justify-center w-6 h-6 rounded-full bg-[#3a1d6e] border border-white/10 hover:bg-[#4c268f] transition-all cursor-pointer shadow-sm"
  >
    <div className="scale-[0.6]">
      {children}
    </div>
  </div>
);

const FacebookIcon = () => (
  <SocialWrapper onClick={() => window.open("https://www.facebook.com", "_blank")}>
    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.373 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  </SocialWrapper>
);

const XIcon = () => (
  <SocialWrapper onClick={() => window.open("https://www.twitter.com", "_blank")}>
    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zM17.61 20.644h2.039L6.486 3.24H4.298l13.312 17.404z" />
    </svg>
  </SocialWrapper>
);

const InstagramIcon = () => (
  <SocialWrapper onClick={() => window.open("https://www.instagram.com", "_blank")}>
    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
    </svg>
  </SocialWrapper>
);

const PinterestIcon = () => (
  <SocialWrapper onClick={() => window.open("https://www.pinterest.com", "_blank")}>
    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.965 1.406-5.965s-.359-.718-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.653 2.567-.992 3.992-.285 1.193.581 2.167 1.749 2.167 2.098 0 3.711-2.211 3.711-5.402 0-2.824-2.03-4.801-4.924-4.801-3.356 0-5.326 2.518-5.326 5.115 0 1.014.391 2.102.88 2.701.096.12.11.223.08.347-.089.366-.289 1.176-.327 1.332-.05.213-.165.258-.379.158-1.416-.659-2.299-2.724-2.299-4.384 0-3.571 2.593-6.852 7.479-6.852 3.926 0 6.977 2.798 6.977 6.533 0 3.9-2.454 7.038-5.859 7.038-1.144 0-2.22-.594-2.588-1.294l-.705 2.684c-.254.975-.945 2.196-1.408 2.95 1.107.342 2.278.528 3.494.528 6.621 0 12-5.378 12-12s-5.379-12-12-12z" />
    </svg>
  </SocialWrapper>
);

const Footer = () => {
  const gradientStyle = {
    background: "linear-gradient(to right, #FFFFFF, #D9D9D9)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    
  };
  const navigate = useNavigate();

  const version = import.meta.env.VITE_APP_VERSION;

  // App store redirect handlers
  const handleAppStoreClick = () => {
    window.open("https://www.apple.com/app-store/", "_blank");
  };

  const handlePlayStoreClick = () => {
    window.open("https://play.google.com/store", "_blank");
  };

  return (
    <footer
      className="w-full flex flex-col"
      style={{
        background: "linear-gradient(90deg, #20073C 0%, #300157 100%)",
      }}
    >
      {/* Main container with proper responsive layout */}
      <div className="max-w-[3440px] mx-auto w-full px-6 md:px-12 lg:px-24 pt-6 lg:pt-8">
        
        {/* MOBILE LAYOUT */}
        <div className="lg:hidden text-white">
          {/* FULL WIDTH BRAND */}
          <div className="mb-6">
            <h3
              style={{
                fontFamily: "'Trochut', serif",
                fontWeight: 700,
                fontSize: "32px",
                lineHeight: "100%",
                letterSpacing: "0%",
                background: "linear-gradient(270deg, #FFFFFF 0%, #D9D9D9 77.38%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                margin: 0,
                padding: 0,
              }}
            >
              Talenta
            </h3>

            <p
              className="italic text-[14px] mt-3 max-w-[600px]"
              style={gradientStyle}
            >
              Collaborate for Clarity. Design for Delight. Better Ideas, Together.
            </p>
          </div>

          {/* TWO COLUMN SECTION */}
          <div className="grid grid-cols-2 gap-6">
            {/* LEFT COLUMN */}
          <div className="flex flex-col gap-6 uppercase tracking-[2px] text-[9px] max-[375px]:text-[7px]">
              {/* FOR CREATOR */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-1">
                  <div className="inline-flex flex-col items-start">
                    <span className="inline-block whitespace-nowrap" style={gradientStyle}>
                      For Creator
                    </span>
                    <div className="h-px bg-white mt-1 w-full" />
                  </div>
                  <img src={Uparrow} alt="arrow" className="w-4 h-4 opacity-95" />
                </div>
                
                <div className="flex flex-col items-start">
                  <div
                    className="inline-flex flex-col items-start cursor-pointer"
                    onClick={() => {
                      navigate("/post-project");
                      requestAnimationFrame(() => {
                        window.scrollTo(0, 0);
                      });
                    }}
                  >
                    <span
                      className="inline-block whitespace-nowrap"
                      style={gradientStyle}
                    >
                      How to Post a Project
                    </span>
                    <div className="h-px bg-white mt-1 w-full" />
                  </div>
                </div>
                
                <div className="flex flex-col items-start">
                  <div
                    className="inline-flex flex-col items-start cursor-pointer"
                    onClick={() => {
                      navigate("/complete-project");
                      requestAnimationFrame(() => {
                        window.scrollTo(0, 0);
                      });
                    }}
                  >
                    <span
                      className="inline-block whitespace-nowrap"
                      style={gradientStyle}
                    >
                      Assign a Complete Project
                    </span>
                    <div className="h-px bg-white mt-1 w-full" />
                  </div>
                </div>
              </div>

              {/* FOR COLLABORATOR */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-1">
                  <div className="inline-flex flex-col items-start">
                    <span className="inline-block whitespace-nowrap" style={gradientStyle}>
                      For Collaborator
                    </span>
                    <div className="h-px bg-white mt-1 w-full" />
                  </div>
                  <img src={Uparrow} alt="arrow" className="w-4 h-4 opacity-95" />
                </div>
                
                <div
                  className="flex flex-col items-start cursor-pointer"
                  onClick={() => {
                    navigate("/Findwork");
                    requestAnimationFrame(() => {
                      window.scrollTo(0, 0);
                    });
                  }}
                >
                  <div className="inline-flex flex-col items-start">
                    <span
                      className="inline-block whitespace-nowrap"
                      style={gradientStyle}
                    >
                      How to Find Work
                    </span>
                    <div className="h-px bg-white mt-1 w-full" />
                  </div>
                </div>
                
                <div className="flex flex-col items-start">
                  <div
                    className="inline-flex flex-col items-start cursor-pointer"
                    onClick={() => {
                      navigate("/contact");
                      requestAnimationFrame(() => {
                        window.scrollTo(0, 0);
                      });
                    }}
                  >
                    <span
                      className="inline-block whitespace-nowrap"
                      style={gradientStyle}
                    >
                      CONTACT US
                    </span>
                    <div className="h-px bg-white mt-1 w-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
           <div className="flex flex-col gap-2 sm:gap-3 ml-auto sm:ml-auto mr-0">
  {/* EMAIL */}
  <div className="text-right sm:text-right">
    <p className="uppercase tracking-[2px] sm:tracking-[3px] text-[10px] sm:text-[12px] mb-0.5 sm:mb-1" style={gradientStyle}>
      Email
    </p>
    <p className="text-[10px] sm:text-[12px] tracking-wide" style={gradientStyle}>
      www.Talenta.com
    </p>
  </div>
  
  {/* CONTACT NO */}
  <div className="text-right sm:text-right">
    <p className="uppercase tracking-[2px] sm:tracking-[3px] text-[10px] sm:text-[12px] mb-0.5 sm:mb-1" style={gradientStyle}>
      Contact No
    </p>
    <p className="text-[10px] sm:text-[12px] tracking-wide" style={gradientStyle}>
      +123-8364-7357
    </p>
  </div>
  
  {/* LET'S CONNECT */}
  <div className="text-right sm:text-right">
    <p className="uppercase tracking-[2px] sm:tracking-[3px] text-[10px] sm:text-[12px] mb-1.5 sm:mb-2" style={gradientStyle}>
      Let's Connect
    </p>
    <div className="flex items-center gap-0.5 sm:gap-1 justify-end">
      <FacebookIcon />
      <XIcon />
      <InstagramIcon />
      <PinterestIcon />
    </div>
  </div>
  
  {/* DOWNLOAD OUR APP */}
  {/* <div className="text-right sm:text-right">
    <p className="uppercase tracking-[1.5px] sm:tracking-[2px] text-[9px] sm:text-[11px] mb-1.5 sm:mb-2" style={gradientStyle}>
      Download Our App
    </p>
    <div className="flex items-center gap-1.5 sm:gap-2 justify-end">
      <svg 
        onClick={handleAppStoreClick}
        className="w-5 h-5 sm:w-6 sm:h-6 text-white cursor-pointer hover:scale-110 transition-transform active:scale-95" 
        viewBox="0 0 24 24" 
        fill="currentColor"
      >
        <path d="M3.609 1.814L13.792 12 3.609 22.186c-.18.18-.359.135-.359-.135V1.949c0-.27.179-.315.359-.135z" />
        <path d="M19.149 10.544l-3.322-1.89-2.738 2.738 2.738 2.738 3.322-1.89c.718-.405.718-1.08 0-1.496z" />
        <path d="M4.507 1.095l10.264 5.85-2.694 2.694L4.507 1.095z" fillOpacity="0.8" />
        <path d="M4.507 22.905l10.264-5.85-2.694-2.694-7.57 8.544z" fillOpacity="0.6" />
      </svg>
      <svg 
        onClick={handlePlayStoreClick}
        className="w-6 h-6 sm:w-8 sm:h-8 text-white cursor-pointer hover:scale-110 transition-all active:scale-90" 
        viewBox="0 0 24 24" 
        fill="none"
      >
        <g stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 18.5L10 6.5" />
          <path d="M12 18.5L7.5 10.5" />
          <path d="M6 8L5 6.5" />
          <path d="M1.5 14.5H13.5" />
        </g>
      </svg>
    </div>
  </div> */}
</div>
          </div>
        </div>

        {/* DESKTOP LAYOUT - 4 COLUMNS (OPTIMIZED FOR HEIGHT) */}
        <div className="hidden lg:grid grid-cols-4 gap-8 lg:gap-12 text-white">
          
          {/* COLUMN 1: BRAND */}
          <div className="lg:-ml-4">
            <h3
              style={{
                fontFamily: "'Trochut', serif",
                fontWeight: 700,
                fontSize: "42px",
                lineHeight: "100%",
                letterSpacing: "0%",
                background: "linear-gradient(270deg, #FFFFFF 0%, #D9D9D9 77.38%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                margin: 0,
                padding: 0,
              }}
            >
              Talenta
            </h3>

            <p
              className="italic text-[14px] mt-3 max-w-[240px]"
              style={gradientStyle}
            >
              Collaborate for Clarity. Design for Delight. Better Ideas, Together.
            </p>
          </div>

          {/* COLUMN 2: LINKS */}
          <div className="flex flex-col gap-4 uppercase tracking-[1.5px] text-[13px] lg:-ml-6">
            {/* FOR CREATOR */}
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <div className="inline-flex flex-col items-start">
                  <span className="inline-block whitespace-nowrap" style={gradientStyle}>
                    For Creator
                  </span>
                  <div className="h-px bg-white mt-1 w-full" />
                </div>
                <img src={Uparrow} alt="arrow" className="w-5 h-5 opacity-95" />
              </div>
            </div>
            {/* HOW TO POST A PROJECT */}
            <div className="flex flex-col items-start">
              <div
                className="inline-flex flex-col items-start cursor-pointer"
                onClick={() => {
                  navigate("/post-project");
                  requestAnimationFrame(() => {
                    window.scrollTo(0, 0);
                  });
                }}
              >
                <span
                  className="inline-block whitespace-nowrap"
                  style={gradientStyle}
                >
                  How to Post a Project
                </span>
                <div className="h-px bg-white mt-1 w-full" />
              </div>
            </div>
            {/* ASSIGN A COMPLETE PROJECT */}
            <div className="flex flex-col items-start">
              <div
                className="inline-flex flex-col items-start cursor-pointer"
                onClick={() => {
                  navigate("/complete-project");
                  requestAnimationFrame(() => {
                    window.scrollTo(0, 0);
                  });
                }}
              >
                <span
                  className="inline-block whitespace-nowrap"
                  style={gradientStyle}
                >
                  Assign a Complete Project
                </span>
                <div className="h-px bg-white mt-1 w-full" />
              </div>
            </div>
          </div>

          {/* COLUMN 3: POLICIES */}
        <div className="flex flex-col gap-4 uppercase tracking-[1.5px] text-[13px] ml-2 sm:ml-4">
  {/* FOR COLLABORATOR */}
  <div className="flex flex-col items-start">
    <div className="flex items-center gap-2">
      <div className="inline-flex flex-col items-start">
        <span className="inline-block whitespace-nowrap" style={gradientStyle}>
          For Collaborator
        </span>
        <div className="h-px bg-white mt-1 w-full" />
      </div>
      <img src={Uparrow} alt="arrow" className="w-5 h-5 opacity-95" />
    </div>
  </div>
  {/* HOW TO FIND WORK */}
  <div className="flex flex-col items-start">
    <div
      className="inline-flex flex-col items-start cursor-pointer"
      onClick={() => {
        navigate("/Findwork");
        requestAnimationFrame(() => {
          window.scrollTo(0, 0);
        });
      }}
    >
      <span
        className="inline-block whitespace-nowrap"
        style={gradientStyle}
      >
        How to Find Work
      </span>
      <div className="h-px bg-white mt-1 w-full" />
    </div>
  </div>
  {/* DIRECT CONTRACT */}
  <div className="flex flex-col items-start">
    <div
      className="inline-flex flex-col items-start cursor-pointer"
      onClick={() => {
        navigate("/contact");
        requestAnimationFrame(() => {
          window.scrollTo(0, 0);
        });
      }}
    >
      <span
        className="inline-block whitespace-nowrap"
        style={gradientStyle}
      >
        CONTACT US
      </span>
      <div className="h-px bg-white mt-1 w-full" />
    </div>
  </div>
</div>

          {/* COLUMN 4: CONTACT */}
          <div
            className="flex flex-col items-start lg:ml-auto lg:pl-16"
            style={{
              maxWidth: "200px",
              gap: "24px",
            }}
          >
            <div className="flex flex-col gap-6 text-white">
              {/* EMAIL */}
              <div>
                <p className="uppercase tracking-[3px] text-[13px] mb-1" style={gradientStyle}>
                  Email
                </p>
                <p className="text-[16px] tracking-wide" style={gradientStyle}>
                  www.Talenta.com
                </p>
              </div>
              {/* CONTACT NO */}
              <div>
                <p className="uppercase tracking-[3px] text-[13px] mb-1" style={gradientStyle}>
                  Contact No
                </p>
                <p className="text-[16px] tracking-wide" style={gradientStyle}>
                  +123-8364-7357
                </p>
              </div>
              {/* LET'S CONNECT */}
              <div>
                <p className="uppercase tracking-[3px] text-[13px] mb-2" style={gradientStyle}>
                  Let's Connect
                </p>
                <div className="flex items-center gap-2">
                  <FacebookIcon />
                  <XIcon />
                  <InstagramIcon />
                  <PinterestIcon />
                </div>
              </div>
              {/* DOWNLOAD OUR APP */}
              {/* <div>
                <p className="uppercase tracking-[2px] text-[13px] whitespace-nowrap mb-2" style={gradientStyle}>
                  Download Our App
                </p>
                <div className="flex items-center gap-3">
                  <svg 
                    onClick={handleAppStoreClick}
                    className="w-7 h-7 text-white cursor-pointer hover:scale-110 transition-transform active:scale-95" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <path d="M3.609 1.814L13.792 12 3.609 22.186c-.18.18-.359.135-.359-.135V1.949c0-.27.179-.315.359-.135z" />
                    <path d="M19.149 10.544l-3.322-1.89-2.738 2.738 2.738 2.738 3.322-1.89c.718-.405.718-1.08 0-1.496z" />
                    <path d="M4.507 1.095l10.264 5.85-2.694 2.694L4.507 1.095z" fillOpacity="0.8" />
                    <path d="M4.507 22.905l10.264-5.85-2.694-2.694-7.57 8.544z" fillOpacity="0.6" />
                  </svg>
                  <svg 
                    onClick={handlePlayStoreClick}
                    className="w-9 h-9 text-white cursor-pointer hover:scale-110 transition-all active:scale-90" 
                    viewBox="0 0 24 24" 
                    fill="none"
                  >
                    <g stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 18.5L10 6.5" />
                      <path d="M12 18.5L7.5 10.5" />
                      <path d="M6 8L5 6.5" />
                      <path d="M1.5 14.5H13.5" />
                    </g>
                  </svg>
                   
                </div>
              </div> */}
              
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-6 md:px-16 mt-6 lg:mt-8">
        <div className="h-px bg-white/40" />
      </div>

      <p className="text-center text-white/80 py-4 text-xs lg:text-sm">
  © 2026 Talenta |  Version 
  <span className="text-[10px] lg:text-xs text-purple-300 ml-1">
    {version} {" "}
  </span> 
   | All Rights Reserved
</p>
    </footer>
  );
};

export default Footer;