import React, { useState, useEffect } from "react";
import Card1 from "../../assets/Landing/Card1.png";
import Card2 from "../../assets/Landing/Card2.png";
import Card3 from "../../assets/Landing/Card3.png";
import Card4 from "../../assets/Landing/Card4.png";
import Card5 from "../../assets/Landing/Card5.png";
import Card6 from "../../assets/Landing/Card6.png";

const Slide = () => {
  const [activeIndex, setActiveIndex] = useState(2);
  const [isMobile, setIsMobile] = useState(false);
  const [isUltraWide, setIsUltraWide] = useState(false);

  // Handle Resize to switch views safely
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      setIsUltraWide(window.innerWidth >= 1536); // Track 2xl screens
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Helper to scale pixel values to vw on ultra-wide screens based on 1440px reference
  const uw = (val) => (isUltraWide ? `${(val / 1440) * 100}vw` : `${val}px`);

  const [cards] = useState([
    {
      id: 1,
      heading: "Video Editor",
      paragraph: "Transform raw footage into compelling stories with professional editing techniques and creative vision.",
      gradient: "rgba(6, 182, 212, 0.2), rgba(168, 85, 247, 0.2)",
      image: Card1,
      category: "Boost your brand with cinematic storytelling.",
      rotation: -60,
      rating: 4.5
    },
    {
      id: 2,
      heading: "Content Creator",
      paragraph: "Craft engaging content that resonates with audiences and builds meaningful connections across platforms.",
      gradient: "rgba(249, 115, 22, 0.2), rgba(236, 72, 153, 0.2)",
      image: Card4,
      category: "Content that makes your audience stop and engage.",
      rotation: -30,
      rating: 4.8
    },
    {
      id: 3,
      heading: "Graphic Design",
      paragraph: "Design is a formal response to a strategic question",
      gradient: "rgba(168, 85, 247, 0.1), rgba(59, 130, 246, 0.1)",
      image: Card5,
      category: "Creative designs that make brands unforgettable.",
      rotation: 0,
      rating: 5.0
    },
    {
      id: 4,
      heading: "Content Creator",
      paragraph: "Develop authentic narratives that inspire action and foster community engagement through creative storytelling.",
      gradient: "rgba(234, 179, 8, 0.2), rgba(239, 68, 68, 0.2)",
      image: Card6,
      category: "Content that grows your presence, naturally.",
      rotation: 30,
      rating: 4.3
    },
    {
      id: 5,
      heading: "Video Editor",
      paragraph: "Bring ideas to life through seamless editing, visual effects, and cinematic storytelling techniques.",
      gradient: "rgba(59, 130, 246, 0.2), rgba(34, 197, 94, 0.2)",
      image: Card2,
      category: "Perfect cuts. Clean transitions. Stunning results",
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
   * CORE LOGIC: Determines style based on Mobile vs Desktop vs UltraWide
   */
  const getCardStyle = (index) => {
    let diff = index - activeIndex;
    if (diff > cards.length / 2) diff -= cards.length;
    if (diff < -cards.length / 2) diff += cards.length;

    // --- MOBILE STYLES (COMPLETELY UNCHANGED) ---
    if (isMobile) {
      const baseMobile = {
        top: '0px',
        width: '180px',
        height: '340px',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.1)',
        transition: 'all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)',
      };

      if (diff === 0) {
        return {
          ...baseMobile,
          left: '50%',
          zIndex: 20,
          opacity: 1,
          transform: 'translateX(-50%) scale(1) rotateY(0deg)',
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 10px 25px -8px rgba(0,0,0,0.4)', // Reduced shadow for mobile active card
        };
      } else if (diff === -1) {
        return {
          ...baseMobile,
          left: '22%',
          zIndex: 10,
          opacity: 0.9,
          transform: 'translateX(-65%) scale(0.9) rotateY(70deg)',
          filter: 'brightness(0.6)',
          boxShadow: '0 5px 15px -5px rgba(0,0,0,0.3)', // Reduced shadow for mobile side cards
        };
      } else if (diff === 1) {
        return {
          ...baseMobile,
          left: '78%',
          zIndex: 10,
          opacity: 0.9,
          transform: 'translateX(-35%) scale(0.9) rotateY(-70deg)',
          filter: 'brightness(0.6)',
          boxShadow: '0 5px 15px -5px rgba(0,0,0,0.3)', // Reduced shadow for mobile side cards
        };
      } else if (diff === -2) {
        return {
          ...baseMobile,
          width: '145px',
          left: '8%',
          zIndex: 5,
          opacity: 0.5,
          transform: 'translateX(-86%) scale(0.85) rotateY(78deg)',
          filter: 'brightness(0.4)',
          boxShadow: '0 3px 10px -3px rgba(0,0,0,0.2)', // Reduced shadow for mobile far cards
        };
      } else if (diff === 2) {
        return {
          ...baseMobile,
          width: '145px',
          left: '92%',
          zIndex: 5,
          opacity: 0.5,
          transform: 'translateX(-15%) scale(0.85) rotateY(-78deg)',
          filter: 'brightness(0.4)',
          boxShadow: '0 3px 10px -3px rgba(0,0,0,0.2)', // Reduced shadow for mobile far cards
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

    // --- DESKTOP / ULTRA-WIDE STYLES ---
    const len = cards.length;
    const prevIndex = (activeIndex - 1 + len) % len;
    const prevPrevIndex = (activeIndex - 2 + len) % len;
    const nextIndex = (activeIndex + 1) % len;
    const nextNextIndex = (activeIndex + 2) % len;

    if (index === activeIndex) {
      return {
        left: '50%',
        width: uw(388),
        height: uw(497),
        top: '0px',
        opacity: 1,
        zIndex: 3,
        transform: 'translateX(-50%)',
        borderRadius: uw(32.7),
        border: `${uw(1.09)} solid #000000`,
        rotation: 0,
        transformOrigin: 'center center',
        boxShadow: `0px 0px ${uw(7)} ${uw(6)} #2F2F2F, 0 ${uw(25)} ${uw(50)} -${uw(12)} rgba(0, 0, 0, 0.25)`
      };
    } else if (index === prevIndex) {
      return {
        left: '18%',
        width: uw(188),
        height: uw(400),
        top: uw(48),
        opacity: 1,
        zIndex: 2,
        transform: 'none',
        borderRadius: uw(30),
        border: `${uw(1)} solid rgba(255, 255, 255, 0.3)`,
        rotation: 30,
        transformOrigin: 'right center',
        boxShadow: `0 ${uw(25)} ${uw(50)} -${uw(12)} rgba(0, 0, 0, 0.3)`
      };
    } else if (index === prevPrevIndex) {
      return {
        left: '1%',
        width: uw(188),
        height: uw(400),
        top: uw(48),
        opacity: 0.5,
        zIndex: 1,
        transform: 'none',
        borderRadius: uw(30),
        border: `${uw(1)} solid rgba(255, 255, 255, 0.3)`,
        rotation: 60,
        transformOrigin: 'right center',
        boxShadow: `0 ${uw(25)} ${uw(50)} -${uw(12)} rgba(0, 0, 0, 0.3)`
      };
    } else if (index === nextIndex) {
      return {
        left: '68%',
        width: uw(188),
        height: uw(400),
        top: uw(48),
        opacity: 1,
        zIndex: 2,
        transform: 'none',
        borderRadius: uw(30),
        border: `${uw(1)} solid rgba(255, 255, 255, 0.3)`,
        rotation: -30,
        transformOrigin: 'left center',
        boxShadow: `0 ${uw(25)} ${uw(50)} -${uw(12)} rgba(0, 0, 0, 0.3)`
      };
    } else if (index === nextNextIndex) {
      return {
        left: '85%',
        width: uw(188),
        height: uw(400),
        top: uw(48),
        opacity: 0.5,
        zIndex: 1,
        transform: 'none',
        borderRadius: uw(30),
        border: `${uw(1)} solid rgba(255, 255, 255, 0.3)`,
        rotation: -60,
        transformOrigin: 'left center',
        boxShadow: `0 ${uw(25)} ${uw(50)} -${uw(12)} rgba(0, 0, 0, 0.3)`
      };
    } else {
      return {
        left: '50%',
        width: uw(188),
        height: uw(400),
        top: uw(48),
        opacity: 0,
        zIndex: 0,
        transform: 'translateX(-50%) scale(0)',
        pointerEvents: 'none'
      };
    }
  };

  // --- 3D Star Rating Component ---
  const StarRating = ({ rating, className, size }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    const uniqueId = `halfFill-${rating}-${Math.random().toString(36).substr(2, 9)}`;
    const starSpacing = isUltraWide ? uw(6) : "6px";
    
    return (
      <div className={className} style={{ display: 'flex', alignItems: 'center', gap: starSpacing }}>
        {Array(fullStars).fill(0).map((_, i) => (
          <svg key={`full-${i}`} width={size} height={size} viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }}>
            <path 
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
              fill="url(#goldGradient)" 
              stroke="#B8860B" 
              strokeWidth="0.5" 
            />
            <path 
              d="M12 4l2.5 5.1L20 9.8l-4 3.9.9 5.3L12 16.5l-4.9 2.5.9-5.3-4-3.9 5.5-.7L12 4z" 
              fill="rgba(255, 255, 255, 0.3)"
            />
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
          <svg key="half" width={size} height={size} viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }}>
            <defs>
              <linearGradient id={uniqueId}>
                <stop offset="50%" stopColor="#FFD700" />
                <stop offset="50%" stopColor="#444444" />
              </linearGradient>
              <linearGradient id={`halfHighlight-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.4)" />
                <stop offset="50%" stopColor="rgba(255, 255, 255, 0.1)" />
                <stop offset="50%" stopColor="transparent" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path 
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
              fill={`url(#${uniqueId})`} 
              stroke="#B8860B" 
              strokeWidth="0.5" 
            />
            <path 
              d="M12 4l2.5 5.1L20 9.8l-4 3.9.9 5.3L12 16.5l-4.9 2.5.9-5.3-4-3.9 5.5-.7L12 4z" 
              fill={`url(#halfHighlight-${uniqueId})`} 
            />
          </svg>
        )}
        {Array(emptyStars).fill(0).map((_, i) => (
          <svg key={`empty-${i}`} width={size} height={size} viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))' }}>
            <path 
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
              fill="rgba(255, 215, 0, 0.1)" 
              stroke="#DAA520" 
              strokeWidth="0.8" 
            />
            <path 
              d="M12 4l2.5 5.1L20 9.8l-4 3.9.9 5.3L12 16.5l-4.9 2.5.9-5.3-4-3.9 5.5-.7L12 4z" 
              fill="rgba(255, 215, 0, 0.05)" 
            />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <section className="
      w-full h-auto md:h-[870px] 2xl:h-[60.4vw] flex flex-col items-center justify-start
      mt-[20px] md:mt-0 pt-0 md:pt-[40px] 2xl:pt-[2.7vw] px-4 relative overflow-hidden
    ">
     
      {/* ================= HEADER SECTION ================= */}
      <div className="w-full max-w-[1200px] 2xl:max-w-[83.3vw] mb-8 md:mb-12 2xl:mb-[3.3vw] px-4 mx-auto">
  <div className="flex flex-col gap-2 2xl:gap-[0.5vw] text-center md:text-left items-center md:items-start">
    <h2 className="poppins-font font-bold text-3xl md:text-4xl lg:text-[32px] 2xl:text-[2.22vw] leading-[140%] bg-gradient-to-r from-[#51218F] to-[#170929] bg-clip-text text-transparent">
      Explore millions of creators
    </h2>
    <p className="font-inter font-normal text-base md:text-lg 2xl:text-[1.25vw] leading-[140%] text-[#030303] max-w-[771px] 2xl:max-w-[53.5vw]">
      Whether you're looking for a best creator here you can explore with the creator
    </p>
  </div>
</div>

      {/* ================= CARDS CONTAINER ================= */}
      <div
        className="relative w-full max-w-[1299px] 2xl:max-w-[90.2vw] h-[420px] md:h-[600px] 2xl:h-[41.6vw] mt-4 md:mt-10 2xl:mt-[2.7vw] mx-auto"
        style={{ perspective: isMobile ? '1000px' : isUltraWide ? '83vw' : '1200px' }}
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
                  zIndex: 1,
                  borderRadius: style.borderRadius
                }}
              />

              {/* Image with perspective correction */}
              <div style={{
                position: 'absolute',
                inset: 0,
                transform: `rotateY(${-style.rotation * 0.3}deg)`,
                transformOrigin: 'center',
                transition: 'transform 0.6s ease',
              }}>
                <img
                  src={card.image}
                  alt={card.heading}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: style.borderRadius,
                    filter: !isMobile && !isActive ? 'brightness(0.8)' : 'none',
                  }}
                />
              </div>

              {/* Dark Overlay Gradient - Desktop specific */}
              {!isMobile && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: isActive 
                      ? 'linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0) 100%)'
                      : 'linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0) 100%)',
                    zIndex: 2,
                    borderRadius: style.borderRadius
                  }}
                />
              )}

              {/* Mobile Dark Overlay */}
              {isMobile && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.9) 100%)',
                    zIndex: 2
                  }}
                />
              )}

              {/* ================= STARS ================= */}
              {!isMobile && isActive && (
                <div style={{
                  position: 'absolute',
                  top: uw(20),
                  right: uw(20),
                  transform: `rotateY(${-style.rotation * 0.5}deg)`,
                  transformOrigin: 'center',
                  zIndex: 10,
                  borderRadius: uw(20),
                  padding: `${uw(8)} ${uw(12)}`,
                }}>
                  <StarRating rating={card.rating} size={isUltraWide ? `${(22 / 1440) * 100}vw` : "22"} />
                </div>
              )}

              {(isActive && isMobile) && (
                <div style={{ 
                  position: 'absolute', 
                  top: '24px', 
                  width: '100%', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  zIndex: 10 
                }}>
                  <StarRating rating={card.rating} size="22" />
                </div>
              )}

              {/* Content */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: !isMobile 
                    ? (isActive ? uw(32) : uw(16))
                    : (isMobile ? '24px 16px' : '16px'),
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: !isMobile ? (isActive ? uw(12) : uw(8)) : '6px',
                  zIndex: 20,
                  background: !isMobile && isActive 
                    ? 'linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0) 100%)'
                    : !isMobile && !isActive
                      ? 'linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0) 100%)'
                      : 'none',
                  borderRadius: style.borderRadius
                }}
              >
                <h3
                  className="poppins-font"
                  style={{
                    color: 'white',
                    fontSize: !isMobile
                      ? (isActive ? uw(24) : uw(16))
                      : (isMobile ? '24px' : '16px'),
                    fontWeight: !isMobile ? (isActive ? '700' : '600') : 700,
                    margin: 0,
                    lineHeight: isActive ? '1.3' : '1.2',
                    textShadow: `0 ${uw(2)} ${uw(4)} rgba(0,0,0,0.5)`,
                    letterSpacing: !isMobile && isActive ? '0.02em' : '0.01em'
                  }}
                >
                  {card.heading}
                </h3>

                {/* Desktop Paragraph */}
                {!isMobile && isActive && (
                  <p
                    className="poppins-font"
                    style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: uw(14),
                      fontWeight: 400,
                      lineHeight: '1.5',
                      margin: 0,
                      maxWidth: uw(320),
                      textShadow: `0 ${uw(1)} ${uw(2)} rgba(0, 0, 0, 0.5)`,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {card.paragraph}
                  </p>
                )}

                {/* Mobile Paragraph */}
                {isMobile && (isActive || style.opacity > 0.6) && (
                  <p
                    style={{
                      color: 'rgba(255,255,255,0.95)',
                      fontSize: '15px',
                      maxWidth: '100%',
                      margin: 0,
                      lineHeight: 1.4,
                      fontWeight: 400
                    }}
                  >
                    {card.paragraph}
                  </p>
                )}

                {/* Desktop Category Badge */}
                {!isMobile && !isActive && (
                  <span
                    className="poppins-font"
                    style={{
                      color: 'white',
                      fontSize: uw(12),
                      fontWeight: 600,
                      letterSpacing: '0.025em',
                      backdropFilter: 'blur(4px)',
                      padding: `${uw(4)} ${uw(12)}`,
                      borderRadius: '9999px',
                      display: 'inline-block',
                      marginTop: uw(4),
                      boxShadow: `0 ${uw(2)} ${uw(8)} rgba(0, 0, 0, 0.3)`,
                      background: 'rgba(0,0,0,0.3)'
                    }}
                  >
                    {card.category}
                  </span>
                )}
              </div>

              {/* Desktop Direction Indicator */}
              {!isMobile && !isActive && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  [style.rotation < 0 ? 'right' : 'left']: uw(15),
                  transform: `translateY(-50%) rotateY(${-style.rotation * 0.5}deg)`,
                  color: 'white',
                  fontSize: uw(24),
                  opacity: 0.6,
                  fontWeight: 'bold',
                  pointerEvents: 'none',
                  zIndex: 25
                }}>
                  {style.rotation < 0 ? '→' : '←'}
                </div>
              )}
            </div>
          );
        })}

        {/* ================= GROUND SHADOW ================= */}
      <div
  className="absolute"
  style={{
    width: isMobile ? '220px' : uw(320),
    height: isMobile ? '30px' : uw(35),
    top: isMobile ? 'auto' : uw(517),
    bottom: isMobile ? '25px' : 'auto',
    left: '50%',
    transform: 'translateX(-50%)' + (isMobile ? '' : ' scaleY(0.3)'),
    background: isMobile 
      ? 'radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 40%, transparent 80%)'
      : '#444444CC',
    filter: `blur(${isMobile ? '6px' : uw(8)})`,
    opacity: 0.9,
    zIndex: 1,
    pointerEvents: 'none',
    borderRadius: '50%',
    boxShadow: isMobile ? '0 0 10px rgba(0,0,0,0.3)' : 'none',
  }}
/>
      </div>

      {/* ================= NAVIGATION CONTROLS ================= */}
     <div className="flex items-center justify-center gap-4 sm:gap-12 2xl:gap-[3.3vw] z-50 -mt-4 md:mt-0 md:absolute md:bottom-[7px] 2xl:bottom-[0.5vw] md:left-1/2 md:transform md:-translate-x-1/2">
  <style>{`
    .nav-button {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1px solid #999999;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      color: #666666;
    }
    
    @media (min-width: 640px) {
      .nav-button {
        width: 56px;
        height: 56px;
      }
    }
    
    @media (min-width: 1536px) {
      .nav-button {
        width: 3.88vw;
        height: 3.88vw;
      }
    }
    
    .nav-button svg {
      width: 16px;
      height: 16px;
    }
    
    @media (min-width: 640px) {
      .nav-button svg {
        width: 30px;
        height: 30px;
      }
    }
    
    @media (min-width: 1536px) {
      .nav-button svg {
        width: 2.08vw;
        height: 2.08vw;
      }
    }
    
    .nav-button:hover {
      background: linear-gradient(180deg, rgba(81, 33, 143, 0.8) 0%, rgba(23, 9, 41, 0.8) 100%);
      border-color: transparent;
      color: white;
      transform: scale(1.1);
      box-shadow: 0 10px 25px rgba(128, 0, 128, 0.3);
    }
    
    .nav-button:active {
      transform: scale(0.95);
    }
  `}</style>

  <div className="flex items-center gap-4 sm:gap-12 2xl:gap-[3.3vw]">
    <button
      onClick={handlePrev}
      className="nav-button"
      aria-label="Previous card"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="20" y1="12" x2="4" y2="12" />
        <polyline points="10 6 4 12 10 18" />
      </svg>
    </button>
    
    <div className="flex items-center gap-3 sm:gap-6 2xl:gap-[1.66vw]">
      {cards.map((_, index) => (
        <button
          key={index}
          onClick={() => handleCardClick(index)}
          className={`transition-all duration-300 ${
            index === activeIndex 
              ? 'rounded-full shadow-md' 
              : 'bg-gray-400 hover:bg-gray-300 rounded-full'
          }`}
          style={{
            width: index === activeIndex ? '20px' : '10px',
            height: '3px',
            background: index === activeIndex 
              ? 'linear-gradient(180deg, rgba(81, 33, 143, 0.8) 0%, rgba(23, 9, 41, 0.8) 100%)'
              : undefined
          }}
          aria-label={`Go to card ${index + 1}`}
        />
      ))}
    </div>
    
    <button
      onClick={handleNext}
      className="nav-button"
      aria-label="Next card"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="12" x2="20" y2="12" />
        <polyline points="14 6 20 12 14 18" />
      </svg>
    </button>
  </div>
</div>
    </section>
  );
};

export default Slide;