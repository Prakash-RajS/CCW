import React, { useState, useEffect } from "react";
import Creator1 from "../../assets/Landing/Creator1.png";
import Creator2 from "../../assets/Landing/Creator2.jpg";
import Creator3 from "../../assets/Landing/Creator3.jpg";
import Creator4 from "../../assets/Landing/Creator4.jpg";
import Creator5 from "../../assets/Landing/Creator5.jpg";
import Creator6 from "../../assets/Landing/Creator6.jpg";
import Creator7 from "../../assets/Landing/Creator7.jpg";

const Creator = () => {
  const [currentPosition, setCurrentPosition] = useState(3);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const allImages = [
    { 
      id: 0, 
      src: Creator2, 
      alt: "Alex Morgan", 
      name: "Alex Morgan",
      role: "Content Creator",
      description: "As a content creator, I've discovered that creative collaboration is essential for producing engaging material that truly connects with audiences. This platform has transformed how I brainstorm ideas, co-create content with other talented individuals, and manage multiple projects simultaneously. The seamless workflow and real-time feedback system have doubled my productivity. I can now easily collaborate with videographers, editors, and other creators to produce high-quality content that stands out in a crowded digital landscape. The analytics dashboard helps me track engagement and optimize my content strategy for maximum impact."
    },
    { 
      id: 1, 
      src: Creator4, 
      alt: "Sarah Chen", 
      name: "Sarah Chen",
      role: "Graphic Designer",
      description: "As a graphic designer, creative collaboration is the lifeblood of my work. This platform has revolutionized how I interact with clients and other designers. The ability to share designs in real-time, receive instant feedback, and iterate on concepts has cut my revision time by 60%. I can now easily manage multiple brand identities, collaborate with copywriters and marketing specialists, and ensure visual consistency across all deliverables. The version control feature is a game-changer - I never lose track of design iterations. The platform's intuitive interface allows me to focus on what I do best: creating stunning visuals that tell compelling stories and drive results for my clients."
    },
    { 
      id: 2, 
      src: Creator7, 
      alt: "Marcus Lee", 
      name: "Marcus Lee",
      role: "Video Editor",
      description: "Video editing requires seamless collaboration between directors, sound designers, colorists, and motion graphics artists. This platform has streamlined our entire post-production workflow. The ability to share large video files instantly, leave timestamped comments, and review edits in real-time has transformed how my team works. We've reduced project turnaround times by 45% while maintaining higher quality standards. The cloud-based rendering capabilities allow us to work from anywhere, and the integrated approval system ensures all stakeholders are aligned before final export. This platform has become an indispensable tool for every video project I undertake, from corporate videos to creative passion projects."
    },
    { 
      id: 3, 
      src: Creator1, 
      alt: "Paul Jessie", 
      name: "Paul Jessie",
      role: "UI/UX Designer",
      description: "As a UI/UX designer, I've found that creative collaboration is not just beneficial—it's absolutely critical to the success of my work. When I share my prototypes and flows, working closely with developers helps me understand technical constraints, which prevents me from designing features that can't be built efficiently. Simultaneously, sessions with product managers ensure the design stays aligned with core business goals. This platform has eliminated the back-and-forth email chains and disjointed feedback. Now all stakeholders can view, comment, and approve designs in one centralized space. The result is a 70% faster design-to-development handoff and products that truly meet user needs. The collaborative whiteboarding feature has also sparked some of our most innovative solutions during brainstorming sessions."
    },
    { 
      id: 4, 
      src: Creator5, 
      alt: "Jamie Rivera", 
      name: "Jamie Rivera",
      role: "Animator",
      description: "Animation is inherently collaborative, requiring input from storyboard artists, voice actors, sound designers, and creative directors. This platform has transformed our animation pipeline from a fragmented process to a streamlined workflow. The frame-accurate feedback tool allows directors to pinpoint exactly which frames need adjustments, eliminating vague comments like 'make it more dynamic.' The version history ensures we never lose previous iterations, and the asset library keeps all character models, backgrounds, and props organized and accessible. Since adopting this platform, our team has increased output by 50% while maintaining the high quality standards our clients expect. The community features have also connected me with talented collaborators I would never have found otherwise."
    },
    { 
      id: 5, 
      src: Creator6, 
      alt: "Taylor Kim", 
      name: "Taylor Kim",
      role: "Illustrator",
      description: "Finding clients who appreciate my unique illustrative style was challenging until I joined this platform. Now I'm consistently booked months in advance with exciting projects that challenge and inspire me. The platform's portfolio showcase features have connected me with art directors, publishers, and brands seeking original illustration work. Beyond client work, the creative community here is incredible - I've formed mastermind groups with other illustrators who provide constructive feedback on my techniques and help me push my artistic boundaries. The ability to share high-resolution files, track project milestones, and manage contracts all in one place has professionalized my freelance business. I've doubled my income while spending less time on administrative tasks."
    },
    { 
      id: 6, 
      src: Creator3, 
      alt: "Jordan Patel", 
      name: "Jordan Patel",
      role: "Photographer",
      description: "The portfolio showcase features have helped me land major commercial clients that were previously out of reach. Fortune 500 companies, fashion brands, and editorial publications now regularly commission my work after discovering me through this platform. Beyond exposure, the collaboration tools have transformed how I work with art directors, stylists, and retouchers. We can review shoots together in real-time, even when working remotely across different time zones. The integrated gallery system allows clients to select their favorite shots, leave specific edit requests, and approve final images without endless email chains. The platform also provides valuable analytics that help me understand which types of images resonate most with potential clients, allowing me to tailor my portfolio for maximum impact and continuously grow my photography business."
    }
  ];

  const getDisplayOrder = () => {
    const result = [];
    const total = allImages.length;
    
    if (isMobile) {
      const centerIndex = 3;
      for (let i = 0; i < total; i++) {
        const offset = i - centerIndex;
        const imageIndex = (currentPosition + offset + total) % total;
        if (i >= 2 && i <= 4) {
          result.push({
            ...allImages[imageIndex],
            displayIndex: i
          });
        }
      }
    } else {
      for (let i = 0; i < total; i++) {
        const offset = i - 3;
        const imageIndex = (currentPosition + offset + total) % total;
        result.push({
          ...allImages[imageIndex],
          displayIndex: i
        });
      }
    }
    
    return result;
  };

  const handleImageClick = (clickedImageId) => {
    setCurrentPosition(clickedImageId);
    if (isAutoRotating) {
      setIsAutoRotating(false);
      setTimeout(() => setIsAutoRotating(true), 3000);
    }
  };

  useEffect(() => {
    if (!isAutoRotating) return;
    const interval = setInterval(() => {
      setCurrentPosition((prev) => (prev + 1) % allImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [allImages.length, isAutoRotating]);

  const getPositionStyles = (displayIndex) => {
    // Mobile styles
    if (isMobile) {
      if (displayIndex === 3) {
        return {
          width: "130px",
          height: "170px",
          shadow: "shadow-[0px_0px_12px_4px_#51218F]",
          rounded: "rounded-[14px]",
          hasOverlay: false,
          cursor: "default"
        };
      }
      return {
        width: "80px",
        height: "110px",
        rounded: "rounded-[10px]",
        hasOverlay: true,
        overlayClass: "bg-[#3D1768]/40",
        cursor: "pointer"
      };
    }
    
    // Desktop styles - REDUCED BLUR GRADIENT SIZE
    if (displayIndex === 3) {
      return {
        width: "240px",
        height: "340px",
        shadow: "shadow-[0px_0px_15px_5px_#51218F]",
        rounded: "rounded-[20px]",
        margin: "mx-2",
        hasOverlay: false,
        cursor: "default"
      };
    }
    
    if (displayIndex === 2 || displayIndex === 4) {
      return {
        width: "160px",
        height: "230px",
        rounded: "rounded-[16px]",
        hasOverlay: true,
        overlayClass: "bg-[#3D1768]/40",
        cursor: "pointer"
      };
    }
    
    if (displayIndex === 1 || displayIndex === 5) {
      return {
        width: "120px",
        height: "170px",
        rounded: "rounded-[14px]",
        hasOverlay: true,
        overlayClass: "bg-[#3D1768]/40",
        cursor: "pointer"
      };
    }
    
    return {
      width: "80px",
      height: "120px",
      rounded: "rounded-[12px]",
      hasOverlay: true,
      overlayClass: "bg-[#3D1768]/20",
      cursor: "pointer"
    };
  };

  const displayOrder = getDisplayOrder();

  // Mobile view
  if (isMobile) {
    const centerImage = displayOrder.find(img => img.displayIndex === 3);
    const sideImages = displayOrder.filter(img => img.displayIndex !== 3);
    
    return (
      <section className="w-full flex flex-col items-center py-4 px-4 bg-white overflow-x-hidden">
        <div className="w-full max-w-md mx-auto flex flex-col gap-2">
          <div className="text-center">
            <h2 className="poppins-font font-bold text-xl bg-gradient-to-r from-[#51218F] to-[#170929] bg-clip-text text-transparent mb-1">
              What Our Creators Say
            </h2>
            <p className="font-inter text-xs text-gray-700 px-2">
              Real experience from the creators and talents who we build, connected and grow together
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 my-1">
            {sideImages[0] && (
              <div 
                className="relative cursor-pointer transition-transform hover:scale-105"
                style={{ width: "80px", height: "110px" }}
                onClick={() => handleImageClick(sideImages[0].id)}
              >
                <img 
                  src={sideImages[0].src} 
                  alt={sideImages[0].alt}
                  className="w-full h-full object-cover rounded-[10px] opacity-50"
                />
                <div className="absolute inset-0 bg-[#3D1768]/40 rounded-[10px]" />
              </div>
            )}

            {centerImage && (
              <div 
                className="relative transition-transform"
                style={{ width: "130px", height: "170px" }}
              >
                <img 
                  src={centerImage.src} 
                  alt={centerImage.alt}
                  className="w-full h-full object-cover rounded-[14px] shadow-[0px_0px_12px_4px_#51218F]"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 rounded-b-[14px]">
                  <p className="text-white text-xs font-semibold">{centerImage.name}</p>
                  <p className="text-white/80 text-[10px]">{centerImage.role}</p>
                </div>
              </div>
            )}

            {sideImages[1] && (
              <div 
                className="relative cursor-pointer transition-transform hover:scale-105"
                style={{ width: "80px", height: "110px" }}
                onClick={() => handleImageClick(sideImages[1].id)}
              >
                <img 
                  src={sideImages[1].src} 
                  alt={sideImages[1].alt}
                  className="w-full h-full object-cover rounded-[10px] opacity-50"
                />
                <div className="absolute inset-0 bg-[#3D1768]/40 rounded-[10px]" />
              </div>
            )}
          </div>

          {centerImage && (
            <div className="text-center">
              <h3 className="poppins-font font-semibold text-lg text-[#3D1768] mb-0">
                {centerImage.name}
              </h3>
              <p className="poppins-font text-xs text-[#693B93] mb-0.5">
                {centerImage.role}
              </p>
              <p className="font-inter text-[11px] text-[#170929] leading-relaxed px-2">
                {centerImage.description.length > 150 
                  ? centerImage.description.substring(0, 150) + "..." 
                  : centerImage.description}
              </p>
            </div>
          )}

          <div className="flex justify-center gap-1.5 mt-1">
            {allImages.map((_, idx) => (
              <button
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  currentPosition === idx ? 'w-4 bg-[#51218F]' : 'w-1.5 bg-gray-300'
                }`}
                onClick={() => handleImageClick(idx)}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Desktop view - REDUCED BLUR GRADIENT ON CENTER CARD
  return (
    <section className="w-full flex flex-col items-center justify-center py-12 bg-white overflow-x-hidden">
      <div className="w-full max-w-[1200px] mx-auto px-4 flex flex-col gap-8 items-center">
        {/* Header */}
        <div className="w-full text-center flex flex-col gap-3">
          <h2 className="poppins-font font-bold text-4xl bg-gradient-to-r from-[#51218F] to-[#170929] bg-clip-text text-transparent">
            What Our Creators Say
          </h2>
          <p className="font-inter text-lg text-[#030303] max-w-3xl mx-auto">
            Real experience from the creators and talents who we build, connected and grow together through our platform
          </p>
        </div>
      
        {/* Image Carousel - REDUCED BLUR ON CENTER CARD */}
        <div className="w-full flex items-center justify-center gap-2 flex-wrap md:flex-nowrap">
          {displayOrder.map((image) => {
            const styles = getPositionStyles(image.displayIndex);
            const isCenter = image.displayIndex === 3;

            return (
              <div
                key={`${image.id}-${image.displayIndex}`}
                className={`relative overflow-hidden transition-all duration-500 hover:scale-105 flex-shrink-0
                  ${styles.shadow} ${styles.rounded} ${styles.margin || ''}`}
                style={{
                  width: styles.width,
                  height: styles.height,
                  opacity: isCenter ? 1 : 0.5,
                  zIndex: isCenter ? 30 : 20 - Math.abs(image.displayIndex - 3),
                  cursor: styles.cursor
                }}
                onClick={() => !isCenter && handleImageClick(image.id)}
              >
                {/* Reduced blur gradient overlay on center card */}
                {isCenter && (
                  <div className="absolute inset-0 pointer-events-none rounded-[20px] bg-gradient-to-t from-[#51218F]/10 via-transparent to-transparent" />
                )}
                
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                  style={{
                    objectPosition: image.id === 3 && isCenter ? '15% 50%' : 
                                   (image.id === 2 || image.id === 4) ? '46% 50%' : 'center'
                  }}
                />

                {styles.hasOverlay && !isCenter && (
                  <div className={`absolute inset-0 pointer-events-none ${styles.rounded} ${styles.overlayClass}`} />
                )}

                {!isCenter && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-black/50 rounded-full p-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                        />
                      </svg>
                    </div>
                  </div>
                )}

                {isCenter && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 rounded-b-[20px]">
                    <p className="text-white text-sm font-semibold">
                      {image.name}
                    </p>
                    <p className="text-white/80 text-xs">
                      {image.role}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Creator Description */}
        <div className="w-full max-w-[900px] mx-auto text-center flex flex-col py-4">
          <h3 className="poppins-font font-medium text-3xl text-[#3D1768] shadow-[0px_4px_8px_0px_#D9D9D9] py-2 px-3 mb-0">
            {displayOrder[3].name}
          </h3>
          <p className="poppins-font font-semibold text-xl text-[#693B93] mt-1 mb-2">
            {displayOrder[3].role}
          </p>
          <p className="poppins-font font-normal text-base text-[#170929] leading-relaxed max-w-3xl mx-auto px-4 mt-0">
            {displayOrder[3].description}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Creator;