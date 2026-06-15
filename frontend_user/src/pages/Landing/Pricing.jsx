import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import FreeIcon from "../../assets/Landing/flashIcon.png";
import ProIcon from "../../assets/Landing/flashProIcon.png";
import AgentIcon from "../../assets/Landing/flashAgentIcon.png";

// Custom hook to detect when element is in viewport (triggers every time)
const useInView = (options = { threshold: 0.3 }) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      // Update state whenever intersection changes
      setIsInView(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [options]);

  return [ref, isInView];
};

// Animated list item component - resets animation when coming back into view
const AnimatedListItem = ({ children, delay, isInView }) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  
  useEffect(() => {
    if (isInView) {
      // Small timeout to ensure animation triggers after component mounts
      const timer = setTimeout(() => setHasAnimated(true), 10);
      return () => clearTimeout(timer);
    } else {
      setHasAnimated(false);
    }
  }, [isInView]);

  return (
    <li 
      className="flex items-center gap-2 transition-all duration-700 ease-out"
      style={{
        opacity: hasAnimated ? 1 : 0,
        transform: hasAnimated ? 'translateX(0)' : 'translateX(-20px)',
        transitionDelay: `${delay}ms`
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9 12l2 2l4 -4"/>
      </svg>
      {children}
    </li>
  );
};

export default function Pricing() {
  const [billing, setBilling] = useState("monthly");
  const [hovered, setHovered] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [sectionRef, isSectionInView] = useInView({ threshold: 0.2 });

  const [users, setUsers] = useState({
    free: 1,
    pro: 2,
    agent: 5,
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const changeUser = (type, delta, e) => {
    e.stopPropagation();
    setUsers((prev) => ({
      ...prev,
      [type]: Math.max(1, prev[type] + delta),
    }));
  };

  const pricingData = {
    free: billing === "monthly" ? "₹0" : "₹0",
    pro: billing === "monthly" ? "₹100" : "₹1000",
    agent: billing === "monthly" ? "₹500" : "₹5000",
};

  const getCardStyle = (index) => {
    const isActive = hovered === index;
    return isActive
      ? "bg-[radial-gradient(circle_at_20%_40%,#8A46FF_0%,#5B1EB5_40%,#2C1450_80%)] border-2 border-[#D7AC2B] shadow-[0_0_20px_7px_#D7AC2B] scale-[1.02] z-10"
      : "bg-[radial-gradient(circle_at_25%_40%,#7A3ACF_0%,#3A2E4B_35%,#1A191C_80%)] border border-transparent scale-100 z-0";
  };

  const isButtonActive = (index) => {
    return hovered === index;
  };

  const scrollToSlide = (index) => {
    setCurrentSlide(index);
    if (scrollContainerRef.current && isMobile) {
      const card = scrollContainerRef.current.children[index];
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  };

  const handlePrev = () => scrollToSlide(currentSlide > 0 ? currentSlide - 1 : 2);
  const handleNext = () => scrollToSlide(currentSlide < 2 ? currentSlide + 1 : 0);

  const cards = [1, 2, 3];

  // Mobile: Show only one card at a time
  if (isMobile) {
    const plans = [
      { id: 0, name: "Basic Plan", icon: FreeIcon, type: "free", userType: "free" },
      { id: 1, name: "Pro plan", icon: ProIcon, type: "pro", userType: "pro" },
      { id: 2, name: "Agent plan", icon: AgentIcon, type: "agent", userType: "agent" }
    ];

    const currentPlan = plans[currentSlide];

    return (
      <div id="pricing-section" ref={sectionRef}>
        <div className="w-full flex flex-col items-center justify-center bg-white">
          {/* TOP SECTION */}
          <div className="w-full max-w-[1200px] mx-auto px-4 py-6 text-center">
            <h1 
              className="text-2xl font-semibold mb-3"
              style={{ fontFamily: 'Poppins, sans-serif', color: '#000000E0' }}
            >
              Simple Pricing, <br className="hidden sm:block" /> Powerful Features
            </h1>

            <p 
              className="text-sm mb-6"
              style={{ fontFamily: 'Poppins, sans-serif', color: '#5A2D91' }}
            >
              Simple, transparent pricing that grows with you. Try any plan free for 30 days.
            </p>

            {/* BILLING TOGGLE */}
            <div className="flex items-center justify-center gap-1 bg-[#2B0F63] p-1 rounded-full w-fit mx-auto mb-6">
              <button
                onClick={() => setBilling('monthly')}
                className={`px-4 py-1.5 rounded-full font-semibold text-xs transition-all duration-300
                  ${billing === 'monthly' ? 'bg-white text-[#2B0F63]' : 'text-white'}`}
              >
                Monthly billing
              </button>
              <button
                onClick={() => setBilling('annual')}
                className={`px-4 py-1.5 rounded-full font-semibold text-xs transition-all duration-300
                  ${billing === 'annual' ? 'bg-white text-[#2B0F63]' : 'text-white'}`}
              >
                Annual billing
              </button>
            </div>
          </div>

          {/* SINGLE CARD - MOBILE */}
          <div className="w-full max-w-[320px] mx-auto px-4">
            <div
              className={`
                relative rounded-2xl transition-all duration-500
                p-4 min-h-[480px] flex flex-col
                overflow-visible
              `}
              style={{
                background: 'radial-gradient(circle at 20% 40%, #8A46FF 0%, #5B1EB5 40%, #2C1450 80%)',
                border: '2px solid #D7AC2B',
                boxShadow: '0 0 20px 7px #D7AC2B'
              }}
            >
              {/* Golden border indicator */}
              <div className="absolute -top-0.5 left-0 right-0 h-1 bg-gradient-to-r from-[#D7AC2B] to-[#F5E6A3] rounded-t-2xl shadow-[0_0_10px_#D7AC2B]" />

              {/* BEST VALUE BADGE - Only for Pro plan */}
              {currentPlan.id === 1 && (
                <div className="absolute top-2 right-2 w-10 h-10 transition-transform duration-300 z-20">
                  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <defs>
                      <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00A65A" />
                        <stop offset="100%" stopColor="#09e77fff" />
                      </linearGradient>
                    </defs>
                    <path d="M100 10 L122 28 L150 30 L165 55 L190 65 L180 95 L190 125 L165 135 L150 160 L122 162 L100 180 L78 162 L50 160 L35 135 L10 125 L20 95 L10 65 L35 55 L50 30 L78 28 Z" fill="url(#greenGradient)"/>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-[8px] font-bold text-center">
                    Best<br />Value
                  </div>
                </div>
              )}

              <div className="w-12 h-12 bg-[#3D1768] rounded-full flex items-center justify-center mx-auto mb-3">
                <img src={currentPlan.icon} alt={`${currentPlan.name} icon`} className="w-6 h-6" />
              </div>
              
              <h2 className="text-white text-center text-lg font-semibold mb-1">{currentPlan.name}</h2>

              <p className="text-white text-3xl font-bold text-center mb-1">
                {pricingData[currentPlan.type]}
                <span className="text-xs font-normal">/month</span>
              </p>

              <p className="text-gray-300 text-center text-xs mb-3">Billed annually.</p>

              {/* FEATURES LIST - MOBILE WITH ANIMATION */}
              <ul className="space-y-3 text-sm text-white mb-4">
                {currentPlan.id === 0 && (
                  <>
                    <AnimatedListItem delay={0} isInView={isSectionInView}>
                      Basic messaging (Twilio)
                    </AnimatedListItem>
                    <AnimatedListItem delay={150} isInView={isSectionInView}>
                      Upload files up to 1 GB total storage
                    </AnimatedListItem>
                    <AnimatedListItem delay={300} isInView={isSectionInView}>
                      Email support (standard)
                    </AnimatedListItem>
                    <AnimatedListItem delay={450} isInView={isSectionInView}>
                      Join 1 active collaboration workspace
                    </AnimatedListItem>
                    <AnimatedListItem delay={600} isInView={isSectionInView}>
                      Access collaboration search (limited results)
                    </AnimatedListItem>
                  </>
                )}

                {currentPlan.id === 1 && (
                  <>
                    <AnimatedListItem delay={0} isInView={isSectionInView}>
                      Unlimited collaboration invites
                    </AnimatedListItem>
                    <AnimatedListItem delay={150} isInView={isSectionInView}>
                      Access to resource marketplace
                    </AnimatedListItem>
                    <AnimatedListItem delay={300} isInView={isSectionInView}>
                      Join or create up to 5 active workspaces
                    </AnimatedListItem>
                    <AnimatedListItem delay={450} isInView={isSectionInView}>
                      10 GB storage for workspace uploads
                    </AnimatedListItem>
                    <AnimatedListItem delay={600} isInView={isSectionInView}>
                      Task boards (Trello-style)
                    </AnimatedListItem>
                  </>
                )}

                {currentPlan.id === 2 && (
                  <>
                    <AnimatedListItem delay={0} isInView={isSectionInView}>
                      Unlimited team members
                    </AnimatedListItem>
                    <AnimatedListItem delay={150} isInView={isSectionInView}>
                      Unlimited workspaces
                    </AnimatedListItem>
                    <AnimatedListItem delay={300} isInView={isSectionInView}>
                      Unlimited storage
                    </AnimatedListItem>
                    <AnimatedListItem delay={450} isInView={isSectionInView}>
                      Advanced analytics dashboard
                    </AnimatedListItem>
                    <AnimatedListItem delay={600} isInView={isSectionInView}>
                      Custom roles & permissions
                    </AnimatedListItem>
                  </>
                )}
              </ul>

              <button
                onClick={() => navigate("/signup", { state: { returnTo: 'pricing-section' } })}
                className={`mt-2 w-full py-1.5 rounded-full text-xs font-medium transition-all duration-300 hover:scale-105 border-2 border-white bg-white text-black`}
              >
                {currentPlan.id === 0 ? "Active" : "Upgrade to " + currentPlan.name}
              </button>
            </div>
          </div>

          {/* NAVIGATION CONTROLS - MOBILE */}
          <div className="flex items-center justify-center gap-4 mt-6 mb-8">
            <button
              onClick={handlePrev}
              className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center hover:bg-purple-800 hover:text-white hover:border-transparent transition-all"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                <line x1="20" y1="12" x2="4" y2="12" />
                <polyline points="10 6 4 12 10 18" />
              </svg>
            </button>
            
            <div className="flex items-center gap-2">
              {cards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToSlide(index)}
                  className={`transition-all duration-300 h-1 rounded-full ${
                    index === currentSlide ? 'w-5 bg-purple-800' : 'w-1.5 bg-gray-400'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={handleNext}
              className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center hover:bg-purple-800 hover:text-white hover:border-transparent transition-all"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                <line x1="4" y1="12" x2="20" y2="12" />
                <polyline points="14 6 20 12 14 18" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // DESKTOP VIEW - Show all 3 cards
  return (
    <div id="pricing-section" ref={sectionRef}>
      <div className="w-full flex flex-col items-center justify-center bg-white">

        {/* TOP SECTION */}
        <div className="w-full max-w-[1200px] mx-auto px-4 py-6 sm:py-8 text-center">
          <h1 
            className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-3 sm:mb-4"
            style={{ fontFamily: 'Poppins, sans-serif', color: '#000000E0' }}
          >
            Simple Pricing, <br className="hidden sm:block" /> Powerful Features
          </h1>

          <p 
            className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8"
            style={{ fontFamily: 'Poppins, sans-serif', color: '#5A2D91' }}
          >
            Simple, transparent pricing that grows with you. Try any plan free for 30 days.
          </p>

          {/* BILLING TOGGLE */}
          <div className="flex items-center justify-center gap-1 sm:gap-2 bg-[#2B0F63] p-1 rounded-full w-fit mx-auto mb-6 sm:mb-8">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-4 sm:px-6 md:px-8 py-1.5 sm:py-2 rounded-full font-semibold text-xs sm:text-sm md:text-base transition-all duration-300
                ${billing === 'monthly' ? 'bg-white text-[#2B0F63]' : 'text-white'}`}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={`px-4 sm:px-6 md:px-8 py-1.5 sm:py-2 rounded-full font-semibold text-xs sm:text-sm md:text-base transition-all duration-300
                ${billing === 'annual' ? 'bg-white text-[#2B0F63]' : 'text-white'}`}
            >
              Annual billing
            </button>
          </div>
        </div>

        {/* DESKTOP CARDS GRID */}
        <div className="w-full max-w-[1200px] mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
          {/* FREE PLAN CARD */}
          <div
            onMouseEnter={() => setHovered(1)}
            onMouseLeave={() => setHovered(null)}
            className={`
              relative rounded-2xl cursor-pointer transition-all duration-500
              p-6 min-h-[580px] flex flex-col
              ${getCardStyle(1)}
            `}
          >
            <div className="w-16 h-16 bg-[#3D1768] rounded-full flex items-center justify-center mx-auto mb-4">
              <img src={FreeIcon} alt="free icon" className="w-8 h-8" />
            </div>
            
            <h2 className="text-white text-center text-xl font-semibold mb-2">Basic Plan</h2>
            <p className="text-white text-4xl font-bold text-center mb-1">
              {pricingData.free}
              <span className="text-base font-normal">/month</span>
            </p>
            <p className="text-gray-300 text-center text-sm mb-6">Billed annually.</p>

            <ul className="space-y-4 text-white text-base mb-6">
              <AnimatedListItem delay={0} isInView={isSectionInView}>
                Basic messaging (Twilio)
              </AnimatedListItem>
              <AnimatedListItem delay={150} isInView={isSectionInView}>
                Upload files up to 1 GB total storage
              </AnimatedListItem>
              <AnimatedListItem delay={300} isInView={isSectionInView}>
                Email support (standard)
              </AnimatedListItem>
              <AnimatedListItem delay={450} isInView={isSectionInView}>
                Join 1 active collaboration workspace
              </AnimatedListItem>
              <AnimatedListItem delay={600} isInView={isSectionInView}>
                Access collaboration search (limited results)
              </AnimatedListItem>
            </ul>

            <button 
              onClick={() => navigate("/signup", { state: { returnTo: 'pricing-section' } })} 
              className={`mt-auto w-full py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 border-2 border-white ${isButtonActive(1) ? "bg-white text-black" : "text-white"}`}
            >
              Active
            </button>
          </div>

          {/* PRO PLAN CARD */}
          <div
            onMouseEnter={() => setHovered(2)}
            onMouseLeave={() => setHovered(null)}
            className={`relative group rounded-2xl cursor-pointer transition-all duration-500 p-6 min-h-[580px] flex flex-col ${getCardStyle(2)}`}
          >
            <div className="absolute top-2 right-2 w-14 h-14 transition-transform duration-300 group-hover:scale-110">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <defs><linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00A65A" /><stop offset="100%" stopColor="#09e77fff" /></linearGradient></defs>
                <path d="M100 10 L122 28 L150 30 L165 55 L190 65 L180 95 L190 125 L165 135 L150 160 L122 162 L100 180 L78 162 L50 160 L35 135 L10 125 L20 95 L10 65 L35 55 L50 30 L78 28 Z" fill="url(#greenGradient)"/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-[10px] font-bold text-center">Best<br />Value</div>
            </div>
            <div className="w-16 h-16 bg-[#3D1768] rounded-full flex items-center justify-center mx-auto mb-4"><img src={ProIcon} alt="pro icon" className="w-8 h-8" /></div>
            <h2 className="text-white text-center text-xl font-semibold mb-2">Pro plan</h2>
            <p className="text-white text-4xl font-bold text-center mb-1">{pricingData.pro}<span className="text-base font-normal">/month</span></p>
            <p className="text-gray-300 text-center text-sm mb-6">Billed annually.</p>
            <ul className="space-y-4 text-white text-base mb-6">
              <AnimatedListItem delay={0} isInView={isSectionInView}>
                Unlimited collaboration invites
              </AnimatedListItem>
              <AnimatedListItem delay={150} isInView={isSectionInView}>
                Access to resource marketplace
              </AnimatedListItem>
              <AnimatedListItem delay={300} isInView={isSectionInView}>
                Join or create up to 5 active workspaces
              </AnimatedListItem>
              <AnimatedListItem delay={450} isInView={isSectionInView}>
                10 GB storage for workspace uploads
              </AnimatedListItem>
              <AnimatedListItem delay={600} isInView={isSectionInView}>
                Task boards (Trello-style)
              </AnimatedListItem>
            </ul>
            <button 
              onClick={() => navigate("/signup", { state: { returnTo: 'pricing-section' } })} 
              className={`mt-auto w-full py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 border-2 border-white ${isButtonActive(2) ? "bg-white text-black" : "text-white"}`}
            >
              Upgrade to Pro
            </button>
          </div>

          {/* AGENT PLAN CARD */}
          <div
            onMouseEnter={() => setHovered(3)}
            onMouseLeave={() => setHovered(null)}
            className={`relative rounded-2xl cursor-pointer transition-all duration-500 p-6 min-h-[580px] flex flex-col ${getCardStyle(3)}`}
          >
            <div className="w-16 h-16 bg-[#3D1768] rounded-full flex items-center justify-center mx-auto mb-4"><img src={AgentIcon} alt="agent icon" className="w-8 h-8" /></div>
            <h2 className="text-white text-center text-xl font-semibold mb-2">Agent plan</h2>
            <p className="text-white text-4xl font-bold text-center mb-1">{pricingData.agent}<span className="text-base font-normal">/month</span></p>
            <p className="text-gray-300 text-center text-sm mb-6">Billed annually.</p>
            <ul className="space-y-4 text-white text-base mb-6">
              <AnimatedListItem delay={0} isInView={isSectionInView}>
                Unlimited team members
              </AnimatedListItem>
              <AnimatedListItem delay={150} isInView={isSectionInView}>
                Unlimited workspaces
              </AnimatedListItem>
              <AnimatedListItem delay={300} isInView={isSectionInView}>
                Unlimited storage
              </AnimatedListItem>
              <AnimatedListItem delay={450} isInView={isSectionInView}>
                Advanced analytics dashboard
              </AnimatedListItem>
              <AnimatedListItem delay={600} isInView={isSectionInView}>
                Custom roles & permissions
              </AnimatedListItem>
            </ul>
            <button 
              onClick={() => navigate("/signup", { state: { returnTo: 'pricing-section' } })} 
              className={`mt-auto w-full py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 border-2 border-white ${isButtonActive(3) ? "bg-white text-black" : "text-white"}`}
            >
              Upgrade to Agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}