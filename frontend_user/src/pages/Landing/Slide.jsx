import React, { useState, useEffect } from "react";
import Card1 from "../../assets/Landing/Card1.png";
import Card2 from "../../assets/Landing/Card2.png";
import Card3 from "../../assets/Landing/Card3.png";

const Slide = () => {
  const [activeIndex, setActiveIndex] = useState(2);
  const [isMobile, setIsMobile] = useState(false);

  // Handle Resize to switch views safely
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [cards] = useState([
    { 
      id: 1, 
      heading: "Video Editor",
      paragraph: "Transform raw footage into compelling stories with professional editing techniques.",
      gradient: "rgba(6, 182, 212, 0.2), rgba(168, 85, 247, 0.2)", 
      image: Card1, 
      rotation: -60,
      rating: 4.5
    },
    { 
      id: 2, 
      heading: "Content Creator",
      paragraph: "Craft engaging content that resonates with audiences and builds meaningful connections.",
      gradient: "rgba(249, 115, 22, 0.2), rgba(236, 72, 153, 0.2)", 
      image: Card2, 
      rotation: -30,
      rating: 4.8
    },
    { 
      id: 3, 
      heading: "Graphic Design",
      paragraph: "Design is a formal response to a strategic question",
      gradient: "rgba(168, 85, 247, 0.1), rgba(59, 130, 246, 0.1)", 
      image: Card3, 
      rotation: 0,
      rating: 5.0
    },
    { 
      id: 4, 
      heading: "Content Creator",
      paragraph: "Develop authentic narratives that inspire action and foster community engagement.",
      gradient: "rgba(234, 179, 8, 0.2), rgba(239, 68, 68, 0.2)", 
      image: Card1, 
      rotation: 30,
      rating: 4.3
    },
    { 
      id: 5, 
      heading: "Video Editor",
      paragraph: "Bring ideas to life through seamless editing, visual effects, and cinematic storytelling.",
      gradient: "rgba(59, 130, 246, 0.2), rgba(34, 197, 94, 0.2)", 
      image: Card2, 
      rotation: 60,
      rating: 4.7
    }
  ]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleCardClick = (index) => {
    setActiveIndex(index);
  };

  /**
   * CORE LOGIC: Determines style based on Mobile vs Desktop
   */
  const getCardStyle = (index) => {
    let diff = index - activeIndex;
    if (diff > cards.length / 2) diff -= cards.length;
    if (diff < -cards.length / 2) diff += cards.length;

    // --- MOBILE STYLES (Replicating the reference image) ---
    if (isMobile) {
      const baseMobile = {
        top: '0px',
        width: '180px', // Increased width to match image proportions better
        height: '380px',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.1)',
        transition: 'all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)',
      };

      if (diff === 0) {
        // ACTIVE CARD: Center, large, on top
        return {
          ...baseMobile,
          left: '50%',
          zIndex: 20,
          opacity: 1,
          transform: 'translateX(-50%) scale(1) rotateY(0deg)',
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)',
        };
      } else if (diff === -1) {
        // PREV CARD: Tucked to the left, angled in
        return {
          ...baseMobile,
          left: '22%', // Positioned to create overlap
          zIndex: 10,
          opacity: 0.9, 
          transform: 'translateX(-65%) scale(0.9) rotateY(70deg)', // Positive rotation for left side
          filter: 'brightness(0.6)', 
        };
      } else if (diff === 1) {
        // NEXT CARD: Tucked to the right, angled in
        return {
          ...baseMobile,
          left: '78%', // Positioned to create overlap
          zIndex: 10,
          opacity: 0.9,
          transform: 'translateX(-35%) scale(0.9) rotateY(-70deg)', // Negative rotation for right side
          filter: 'brightness(0.6)',
        };
      } else if (diff === -2) {
        // FAR PREV: Background left
        return {
          ...baseMobile,
          width: '145px',
          left: '8%', 
          zIndex: 5,
          opacity: 0.5,
          transform: 'translateX(-86%) scale(0.85) rotateY(78deg)',
          filter: 'brightness(0.4)',
        };
      } else if (diff === 2) {
        // FAR NEXT: Background right
        return {
          ...baseMobile,
          width: '145px',
          left: '92%', 
          zIndex: 5,
          opacity: 0.5,
          transform: 'translateX(-15%) scale(0.85) rotateY(-78deg)',
          filter: 'brightness(0.4)',
        };
      } else {
        return {
          ...baseMobile,
          left: '50%',
          opacity: 0,
          transform: 'translateX(-50%) scale(0)',
          pointerEvents: 'none'
        };
      }
    }

    // --- DESKTOP STYLES (Unchanged) ---
    const len = cards.length;
    const prevIndex = (activeIndex - 1 + len) % len;
    const prevPrevIndex = (activeIndex - 2 + len) % len;
    const nextIndex = (activeIndex + 1) % len;

    const desktopBase = {
        width: '188px',
        height: '400px',
        top: '48px',
        borderRadius: '30px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        transformOrigin: 'center center'
    };

    if (index === activeIndex) {
      return {
        left: '50%',
        width: '388px',
        height: '497px',
        top: '0px',
        opacity: 1,
        zIndex: 3,
        transform: 'translateX(-50%)',
        borderRadius: '32.7px',
        border: '1.09px solid #000000',
        rotation: 0,
        transformOrigin: 'center center'
      };
    } else if (index === prevIndex) {
      return {
        ...desktopBase,
        left: '18%',
        opacity: 1,
        zIndex: 2,
        transform: 'none',
        rotation: 30,
        transformOrigin: 'right center'
      };
    } else if (index === prevPrevIndex) {
      return {
        ...desktopBase,
        left: '1%',
        opacity: 0.5,
        zIndex: 1,
        transform: 'none',
        rotation: 60,
        transformOrigin: 'right center'
      };
    } else if (index === nextIndex) {
      return {
        ...desktopBase,
        left: '68%',
        opacity: 1,
        zIndex: 2,
        transform: 'none',
        rotation: -30,
        transformOrigin: 'left center'
      };
    } else {
      return {
        ...desktopBase,
        left: '85%',
        opacity: 0.5,
        zIndex: 1,
        transform: 'none',
        rotation: -60,
        transformOrigin: 'left center'
      };
    }
  };

  // --- 3D Star Rating Component ---
  const StarRating = ({ rating, className }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    const uniqueId = `halfFill-${rating}-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className={className} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {Array(fullStars).fill(0).map((_, i) => (
          <svg key={`full-${i}`} width="20" height="20" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#goldGradient)" stroke="#B8860B" strokeWidth="0.5" />
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="40%" stopColor="#FFC800" />
                <stop offset="70%" stopColor="#DAA520" />
                <stop offset="100%" stopColor="#B8860B" />
              </linearGradient>
            </defs>
          </svg>
        ))}
        {hasHalfStar && (
          <svg key="half" width="20" height="20" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }}>
            <defs>
              <linearGradient id={uniqueId}>
                <stop offset="50%" stopColor="#FFD700" />
                <stop offset="50%" stopColor="#444444" />
              </linearGradient>
            </defs>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={`url(#${uniqueId})`} stroke="#B8860B" strokeWidth="0.5" />
          </svg>
        )}
        {Array(emptyStars).fill(0).map((_, i) => (
          <svg key={`empty-${i}`} width="20" height="20" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))' }}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="rgba(255, 215, 0, 0.2)" stroke="#DAA520" strokeWidth="0.8" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <section className="
      w-full h-auto md:h-[870px] flex flex-col items-center justify-start 
      mt-[20px] md:mt-0 pt-0 md:pt-[40px] px-4 relative overflow-hidden
    ">
      
      {/* ================= HEADER SECTION ================= */}
      <div className="w-full max-w-[1200px] mb-8 md:mb-12 px-4 mx-auto">
        <div className="flex flex-col gap-1.5 text-left items-start md:text-left md:items-start">
          <h2 className="poppins-font font-bold text-[24px] leading-[32px] md:text-4xl lg:text-[32px] md:leading-[140%] bg-gradient-to-r from-[#51218F] to-[#170929] bg-clip-text text-transparent">
            Explore millions of creators
          </h2>
          <p className="font-inter font-normal text-[14px] leading-[20px] max-w-[300px] md:text-lg md:leading-[140%] md:max-w-[771px] text-[#030303]">
            Whether you're looking for a best creator here you can explore with the creator
          </p>
        </div>
      </div>

      {/* ================= CARDS CONTAINER ================= */}
      <div
        className="relative w-[300px] sm:w-[900px] md:w-[1000px] lg:w-[1440px] h-[420px] md:h-[600px] mt-4 md:mt-10"
        style={{ perspective: isMobile ? '1000px' : '1200px' }}
      >
        {cards.map((card, index) => {
          const style = getCardStyle(index);
          const isActive = index === activeIndex;

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(index)}
              style={{
                position: 'absolute',
                width: style.width,
                height: style.height,
                top: style.top,
                left: style.left,
                transform: isMobile 
                  ? style.transform 
                  : style.transform === 'none' 
                    ? `rotateY(${style.rotation}deg)` 
                    : `${style.transform} rotateY(${style.rotation}deg)`,
                
                transformOrigin: style.transformOrigin || 'center center',
                opacity: style.opacity,
                borderRadius: style.borderRadius,
                overflow: 'hidden',
                boxShadow: style.boxShadow,
                border: style.border,
                zIndex: style.zIndex,
                cursor: 'pointer',
                transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transformStyle: 'preserve-3d',
                filter: style.filter || 'none'
              }}
              className="hover:scale-[1.02] transition-all duration-300"
            >
              {/* Card gradient overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(135deg, ${card.gradient})`,
                  zIndex: 1
                }}
              />

              {/* Image */}
              <div style={{ position: 'absolute', inset: 0, transition: 'transform 0.6s ease' }}>
                <img
                  src={card.image}
                  alt={card.heading}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>

              {/* Dark Overlay Gradient */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.9) 100%)',
                  zIndex: 2
                }}
              />

              {/* ================= STARS (Positioned Top Center for Mobile) ================= */}
              {(isActive && isMobile) && (
                 <div style={{ position: 'absolute', top: '24px', width: '100%', display: 'flex', justifyContent: 'center', zIndex: 10 }}>
                    <StarRating rating={card.rating} />
                 </div>
              )}

              {/* Content */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: isMobile ? '24px 16px' : isActive ? '32px' : '16px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  zIndex: 20
                }}
              >
                {!isMobile && isActive && <StarRating rating={card.rating} className="mb-2"/>}

                <h3
                  className="poppins-font"
                  style={{
                    color: 'white',
                    fontSize: isMobile ? '24px' : isActive ? '24px' : '16px',
                    fontWeight: 700,
                    margin: 0,
                    lineHeight: 1.2,
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                  }}
                >
                  {card.heading}
                </h3>

                {(isActive || (isMobile && style.opacity > 0.6)) && (
                  <p
                    style={{
                      color: 'rgba(255,255,255,0.95)',
                      fontSize: '15px',
                      maxWidth: isMobile ? '100%' : '320px',
                      margin: 0,
                      lineHeight: 1.4,
                      fontWeight: 400
                    }}
                  >
                    {card.paragraph}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* ================= GROUND SHADOW ================= */}
        <div
          className="absolute"
          style={{
            width: isMobile ? '180px' : '420px',
            height: isMobile ? '25px' : '50px',
            bottom: isMobile ? '-10px' : '30px', 
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, transparent 70%)',
            filter: 'blur(8px)',
            opacity: 0.8,
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* ================= NAVIGATION CONTROLS ================= */}
      <div className={`
        flex items-center gap-4 mt-6
        z-50
      `}>
        {/* PREV BUTTON (Purple Circle) */}
        <button
          onClick={handlePrev}
          className="
            w-10 h-10 md:w-14 md:h-14 rounded-full border border-transparent
            bg-white shadow-lg flex items-center justify-center
            text-[#51218F]
            active:scale-95 transition-all duration-300
          "
        >
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
             <line x1="19" y1="12" x2="5" y2="12" />
             <polyline points="12 19 5 12 12 5" />
           </svg>
        </button>

        {/* DOTS */}
        <div className="flex items-center gap-2">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => handleCardClick(index)}
              className={`transition-all duration-300 rounded-full ${
                index === activeIndex
                  ? 'w-8 h-2'
                  : 'w-3 h-2 bg-gray-300'
              }`}
              style={{
                background: index === activeIndex
                  ? '#51218F'
                  : undefined,
              }}
            />
          ))}
        </div>

        {/* NEXT BUTTON (Purple Circle filled) */}
        <button
          onClick={handleNext}
          className="
            w-10 h-10 md:w-14 md:h-14 rounded-full border border-transparent
            bg-[#51218F] shadow-lg flex items-center justify-center
            text-white
            active:scale-95 transition-all duration-300
          "
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default Slide;