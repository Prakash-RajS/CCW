import React from 'react'
import { useNavigate } from "react-router-dom";
import Skills from "../../assets/Landing/Skills.png";

import Group1 from "../../assets/Landing/Group1.png";
import Group2 from "../../assets/Landing/Group2.png";
import Group3 from "../../assets/Landing/Group3.png";
import Group4 from "../../assets/Landing/Group4.png";
import Group5 from "../../assets/Landing/Group5.png";
import Group6 from "../../assets/Landing/Group6.png";
import Ball from "../../assets/Landing/Ball.png";

// Add the animation styles in a proper style tag or in your global CSS
const zoomAnimation = `
  @keyframes zoomInOut {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.3);
    }
  }
  .animate-zoom {
    animation: zoomInOut 2s ease-in-out infinite;
  }
`;

const Features = () => {
  const navigate = useNavigate();

  const FeatureCard = ({ title, description, buttonText, align = 'left', position = 'left' }) => {
    const getPositionClasses = () => {
      switch(position) {
        case 'left':
          return 'left-0 top-1/2 -translate-y-1/2';
        case 'right':
          return 'right-0 top-1/2 -translate-y-1/2';
        case 'top':
          return 'left-1/2 -translate-x-1/2 top-0';
        default:
          return '';
      }
    };

    const getTextAlign = () => {
      if (position === 'right') return 'text-right items-end';
      if (position === 'top') return 'text-center items-center';
      return 'text-left items-start';
    };

    // Determine underline position based on card position
    const getUnderlinePosition = () => {
      if (position === 'right') return 'right-0';
      if (position === 'top') return 'left-1/2 -translate-x-1/2';
      return 'left-0';
    };

    return (
      <div className={`
        absolute
        ${getPositionClasses()}
        w-[160px] xs:w-[180px] sm:w-[200px] lg:w-[250px] xl:w-[280px]
        flex flex-col
        ${getTextAlign()}
        z-10
      `}>
        <h3 className="
          poppins-font font-semibold
          text-[10px] xs:text-xs sm:text-sm lg:text-lg xl:text-xl
          leading-[135%]
          relative
          inline-block
          mb-1 sm:mb-2
        ">
          <span className="bg-gradient-to-r from-[#170929] to-[#170929] bg-clip-text text-transparent">
            {title}
          </span>
          {/* Underline - hidden on mobile, visible on desktop */}
          <div className={`
            absolute hidden lg:block
            h-[3px] w-[105px]
            bg-[#3D1768]
            rounded-full
            opacity-80
            blur-[4px]
            scale-y-[0.3]
            ${getUnderlinePosition()}
            bottom-[-8px]
          `}/>
        </h3>
        
        <p className="
          font-inter font-medium
          text-[8px] xs:text-[9px] sm:text-xs lg:text-sm
          leading-[130%] lg:leading-[140%]
          text-[#030303]
          mt-1 sm:mt-2 mb-1.5 sm:mb-2
          max-w-[140px] xs:max-w-[160px] sm:max-w-[180px] lg:max-w-[240px]
        ">
          {description}
        </p>
        
        <button
          onClick={() => navigate('/signup', { state: { returnTo: 'features-section' } })}
          className="
            px-2 xs:px-3 sm:px-4 lg:px-5
            py-0.5 xs:py-1 sm:py-1.5
            rounded-[4px] xs:rounded-[6px] sm:rounded-[8px] lg:rounded-[10px]
            text-[7px] xs:text-[8px] sm:text-[10px] lg:text-xs
            text-white
            font-medium
            poppins-font
            transition-all duration-300
            hover:scale-105 hover:shadow-lg
            cursor-pointer
            whitespace-nowrap
          "
          style={{
            background: 'radial-gradient(50% 50% at 50% 50%, #693B93 0%, #3D1768 100%)',
          }}
        >
          {buttonText}
        </button>
      </div>
    );
  };

  return (
    <div id="features-section">
      <section className="
        w-full 
        min-h-[430px] sm:min-h-[650px] md:min-h-[700px] lg:min-h-[620px] xl:min-h-[580px]
        py-6 sm:py-8 lg:py-12 
        px-2 xs:px-3 sm:px-4 
        relative overflow-hidden bg-white
      ">
        {/* Add style tag for animations */}
        <style>
          {zoomAnimation}
        </style>

        {/* Header Section */}
        <div className="max-w-[1200px] mx-auto mb-4 xs:mb-5 sm:mb-6 lg:mb-8 px-2 xs:px-3 sm:px-4">
          <div className="flex flex-col gap-0.5 sm:gap-1 lg:gap-2 text-center md:text-left items-center md:items-start">
            <h2 className="
              poppins-font font-bold
              text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl
              leading-[140%]
              bg-gradient-to-r from-[#51218F] to-[#170929]
              bg-clip-text text-transparent
            ">
              Key features
            </h2>
            <p className="
              font-inter font-normal
              text-[10px] xs:text-xs sm:text-sm lg:text-base
              leading-[140%]
              text-[#030303]
              max-w-[771px]
            ">
              Here are the steps to follow in the creative collaborator
            </p>
          </div>
        </div>

        {/* Floating Icons - Responsive sizes with zoom animation */}
        <div className="absolute inset-0 pointer-events-none max-w-[1400px] mx-auto">
          <img src={Group1} alt="" className="absolute w-[8px] xs:w-[12px] sm:w-[20px] lg:w-[44px] top-[15%] left-[5%] lg:left-[8%] animate-pulse" />
          <img src={Group2} alt="" className="absolute w-[8px] xs:w-[12px] sm:w-[20px] lg:w-[44px] top-[12%] right-[5%] lg:right-[10%] animate-pulse" />
          <img src={Group3} alt="" className="absolute w-[8px] xs:w-[12px] sm:w-[20px] lg:w-[44px] top-[25%] right-[15%] lg:right-[20%] animate-pulse" />
          <img src={Group4} alt="" className="absolute w-[8px] xs:w-[12px] sm:w-[20px] lg:w-[44px] top-[20%] left-[15%] lg:left-[18%] animate-pulse" />
          <img src={Group5} alt="" className="absolute w-[8px] xs:w-[12px] sm:w-[20px] lg:w-[44px] bottom-[25%] right-[10%] lg:right-[15%] animate-pulse" />
          <img src={Group6} alt="" className="absolute w-[8px] xs:w-[12px] sm:w-[20px] lg:w-[44px] bottom-[30%] left-[12%] lg:left-[15%] animate-pulse" />
        </div>

        {/* Main Content - Responsive height for mobile */}
        <div className="relative max-w-[1200px] mx-auto h-[320px] xs:h-[360px] sm:h-[420px] md:h-[480px] lg:h-[550px] xl:h-[600px] translate-y-16 sm:translate-y-0">
          {/* Left Column - Collaboration Workspace */}
          <FeatureCard
            title="Collaboration Workspace"
            description="Manage your projects in a shared space where teams can chat, share files, assign tasks, and track progress all in one organized dashboard."
            buttonText="Start collaborating"
            position="left"
          />

          {/* Right Column - Revenue Splits & Payments */}
          <FeatureCard
            title="Revenue Splits & Payments"
            description="Automate revenue sharing based on pre-agreed splits. Get paid securely through integrated payment systems, with transparent tracking."
            buttonText="Set up payments"
            position="right"
          />

          {/* Top Center - Start a project */}
          <FeatureCard
            title="Start a project"
            description="Creators can easily launch new projects, invite collaborators, and manage every stage from idea to completion with transparent workflows."
            buttonText="Create a project"
            position="top"
          />

          {/* Center Image - Adjusted position for mobile */}
          <div className="
            absolute 
            left-1/2 
            -translate-x-1/2 
            -translate-y-1/2 
            w-[140px] xs:w-[160px] sm:w-[200px] md:w-[240px] lg:w-[350px] xl:w-[450px]
            z-0
            top-[220px] xs:top-[250px] sm:top-[300px] md:top-[350px] lg:top-[400px] xl:top-[450px]
          ">
            <div className="relative">
              <img
                src={Skills}
                alt="Skills"
                className="w-full h-auto"
              />
              
              {/* Ball decorations with zoom in/out animation */}
              <img 
                src={Ball} 
                alt="" 
                className="absolute -top-2 xs:-top-3 sm:-top-4 left-[50%] w-[6px] xs:w-[8px] sm:w-[12px] lg:w-[18px] xl:w-[22px] animate-zoom" 
                style={{ animationDelay: '0s' }}
              />
              <img 
                src={Ball} 
                alt="" 
                className="absolute top-[15%] left-[20%] w-[6px] xs:w-[8px] sm:w-[12px] lg:w-[18px] xl:w-[22px] animate-zoom" 
                style={{ animationDelay: '0.3s' }}
              />
              <img 
                src={Ball} 
                alt="" 
                className="absolute top-0 right-[51%] w-[6px] xs:w-[8px] sm:w-[12px] lg:w-[18px] xl:w-[22px] animate-zoom" 
                style={{ animationDelay: '0.6s' }}
              />
              <img 
                src={Ball} 
                alt="" 
                className="absolute bottom-[64%] right-[75%] w-[6px] xs:w-[8px] sm:w-[12px] lg:w-[18px] xl:w-[22px] animate-zoom" 
                style={{ animationDelay: '0.9s' }}
              />
              <img 
                src={Ball} 
                alt="" 
                className="absolute top-[20%] right-[18%] w-[6px] xs:w-[8px] sm:w-[12px] lg:w-[18px] xl:w-[22px] animate-zoom" 
                style={{ animationDelay: '1.2s' }}
              />
              <img 
                src={Ball} 
                alt="" 
                className="absolute bottom-[83%] right-[17%] w-[8px] xs:w-[10px] sm:w-[14px] lg:w-[22px] xl:w-[28px] animate-zoom" 
                style={{ animationDelay: '1.5s' }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Features;