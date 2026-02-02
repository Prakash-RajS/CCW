import React, { useState, useEffect } from "react";
import Creator1 from "../../assets/Landing/Creator1.png";
import Creator2 from "../../assets/Landing/Creator2.png";
import Creator3 from "../../assets/Landing/Creator3.png";
import Creator4 from "../../assets/Landing/Creator4.png";
import Creator5 from "../../assets/Landing/Creator5.png";

const Creator = () => {
  const [currentPosition, setCurrentPosition] = useState(3); // Start with Creator1 (Paul Jessie) in center
  const [isAutoRotating, setIsAutoRotating] = useState(true); // Auto-rotation state
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;


  // Define all images with their properties
  const allImages = [
    { 
      id: 0, 
      src: Creator5, 
      alt: "Alex Morgan", 
      name: "Alex Morgan",
      role: "Content Creator",
      description: "The platform has revolutionized how I connect with my audience. The analytics tools help me understand what content resonates best."
    },
    { 
      id: 1, 
      src: Creator4, 
      alt: "Sarah Chen", 
      name: "Sarah Chen",
      role: "Graphic Designer",
      description: "As a graphic designer, this platform has given me access to clients worldwide. The collaboration tools are exceptional."
    },
    { 
      id: 2, 
      src: Creator3, 
      alt: "Marcus Lee", 
      name: "Marcus Lee",
      role: "Video Editor",
      description: "The rendering capabilities and client feedback system have streamlined my workflow tremendously."
    },
    { 
      id: 3, 
      src: Creator1, 
      alt: "Paul Jessie", 
      name: "Paul Jessie",
      role: "UI/UX Designer",
      description: "As a UI/UX designer, I've found that creative collaboration is not just beneficial—it's absolutely critical to the success of my work. When I share my prototypes and flows, working closely with developers helps me understand technical constraints, which prevents me from designing features that can't be built efficiently. Simultaneously, sessions with product managers ensure the design stays aligned with core business goals."
    },
    { 
      id: 4, 
      src: Creator3, 
      alt: "Jamie Rivera", 
      name: "Jamie Rivera",
      role: "Animator",
      description: "The animation tools and timeline features have cut my production time in half. The community feedback is invaluable."
    },
    { 
      id: 5, 
      src: Creator2, 
      alt: "Taylor Kim", 
      name: "Taylor Kim",
      role: "Illustrator",
      description: "Finding clients who appreciate my unique style was challenging until I joined this platform. Now I'm booked months in advance."
    },
    { 
      id: 6, 
      src: Creator4, 
      alt: "Jordan Patel", 
      name: "Jordan Patel",
      role: "Photographer",
      description: "The portfolio showcase features have helped me land major commercial clients. The exposure is unparalleled."
    }
  ];

  // Calculate the display order - center image is always at position 3 (index 3)
  const getDisplayOrder = () => {
    const result = [];
    const total = allImages.length;
    
    // The center position is index 3
    for (let i = 0; i < total; i++) {
      const offset = i - 3; // How far from center
      const imageIndex = (currentPosition + offset + total) % total;
      result.push({
        ...allImages[imageIndex],
        displayIndex: i // Track display position
      });
    }
    
    return result;
  };

  // Function to handle image click - FIXED VERSION
  const handleImageClick = (clickedImageId) => {
    // Directly set the clicked image as the center
    setCurrentPosition(clickedImageId);
    
    // Pause auto-rotation for a bit when user manually clicks
    if (isAutoRotating) {
      setIsAutoRotating(false);
      setTimeout(() => {
        setIsAutoRotating(true);
      }, 5000); // Resume auto-rotation after 5 seconds
    }
  };

  // Auto rotate every 15 seconds
  useEffect(() => {
    if (!isAutoRotating) return;
    
    const interval = setInterval(() => {
      setCurrentPosition((prev) => (prev + 1) % allImages.length);
    }, 15000); // 15 seconds

    return () => clearInterval(interval);
  }, [allImages.length, isAutoRotating]);

  // Get styles for each position in the display
  const getPositionStyles = (displayIndex) => {
    // Position 3 is always the center
    if (displayIndex === 3) {
      return {
        width: "238px",
        height: "330px",
        opacity: "100",
        zIndex: "30",
        shadow: "shadow-[0px_0px_30px_10px_#51218F]",
        rounded: "rounded-[20px]",
        margin: "mx-4",
        hasOverlay: false,
        transition: "all 0.8s ease-in-out",
        cursor: "default"
      };
    }
    
    // Positions 2 and 4 (adjacent to center)
    if (displayIndex === 2 || displayIndex === 4) {
      return {
        width: "170px",
        height: "212px",
        opacity: "50",
        zIndex: "20",
        shadow: "",
        rounded: "rounded-[20px]",
        margin: "",
        hasOverlay: true,
        overlayClass: "shadow-[inset_0_0_100px_#3D1768] bg-[#3D1768]/40",
        transition: "all 0.8s ease-in-out",
        cursor: "pointer"
      };
    }
    
    // Positions 1 and 5
    if (displayIndex === 1 || displayIndex === 5) {
      const isRounded30 = displayIndex === 1 || displayIndex === 5;
      return {
        width: "130px",
        height: "162px",
        opacity: "100",
        zIndex: "10",
        shadow: "",
        rounded: isRounded30 ? "rounded-[30px]" : "rounded-[20px]",
        margin: "",
        hasOverlay: true,
        overlayClass: "shadow-[inset_0px_0px_100px_#3D1768] bg-[#3D1768]/40",
        transition: "all 0.8s ease-in-out",
        cursor: "pointer"
      };
    }
    
    // Positions 0 and 6 (edges)
    return {
      width: "90px",
      height: "112px",
      opacity: "100",
      zIndex: "5",
      shadow: "",
      rounded: "rounded-[20px]",
      margin: "",
      hasOverlay: true,
      overlayClass: displayIndex === 0 
        ? "shadow-[inset_0px_0px_80px_#3D1768] bg-[#3D1768]/10"
        : "shadow-[inset_0px_0px_80px_#3D1768] bg-[#3D1768]/40",
      transition: "all 0.8s ease-in-out",
      cursor: "pointer"
    };
  };

  // Get object-fit class based on image and position
  const getObjectFitClass = (imageId, displayIndex) => {
    if (displayIndex === 3 && imageId === 3) return "object-cover object-[15%_50%]"; // Creator1 center
    if ((displayIndex === 2 || displayIndex === 4) && (imageId === 2 || imageId === 4)) return "object-cover object-[46%_50%]"; // Creator3
    if (displayIndex === 5 && imageId === 5) return "brightness-90 saturate-150 object-cover"; // Creator2
    return "object-cover";
  };

  const displayOrder = getDisplayOrder();

  return (
<section className="
  w-full
  h-[780px]
  flex flex-col
  items-center
  justify-start

  pt-0 sm:pt-[40px]
  px-4
  relative
  overflow-hidden

  -translate-y-70 sm:translate-y-0   /* 👈 STRONG pull up */
">

  <div className="w-full sm:w-[1254px] h-[752px] opacity-100 mx-auto flex flex-col gap-[20px] items-center">

    <div className="w-full sm:w-[774px] opacity-100 flex flex-col items-center gap-[4px]">

      <h3 className="
        w-full sm:w-[616px]          /* 👈 full width on mobile */
        text-center                 /* 👈 centered on mobile */
        poppins-font font-bold
        text-[22px] sm:text-[32px]
        leading-[140%]
        bg-gradient-to-r from-[#51218F] to-[#170929]
        text-transparent bg-clip-text
      ">
        What Our Creators Say
      </h3>

      <p className="
        w-full sm:w-[494px]          /* 👈 full width on mobile */
        text-center                 /* 👈 centered on mobile */
        font-inter
        text-[14px] sm:text-[18px]
        font-normal
        leading-[140%]
        text-[#030303]
      ">
        Real experience from the creators and talents who we build, connected and grow together through our platform
      </p>

    </div>
  
        {/* Image Carousel - Images physically move positions */}
        <div className="w-[1254px] h-[362px] opacity-100 flex items-center justify-evenly relative">
          {displayOrder.map((image) => {
            const styles = getPositionStyles(image.displayIndex);
            const isCenter = image.displayIndex === 3;
            const objectFitClass = getObjectFitClass(image.id, image.displayIndex);
            
            return (
              <div 
                key={`${image.id}-${image.displayIndex}`}
                className={`relative overflow-hidden flex-shrink-0 ${styles.shadow} ${styles.rounded} ${styles.margin} ${styles.transition} hover:scale-105 hover:z-40`}
                style={{
                  width: styles.width,
                  height: styles.height,
                  opacity: styles.opacity,
                  zIndex: styles.zIndex,
                  cursor: styles.cursor
                }}
                onClick={() => !isCenter && handleImageClick(image.id)}
              >
                <img 
                  src={image.src} 
                  alt={image.alt} 
                  className={`w-full h-full ${objectFitClass}`}
                />
                
                {/* Overlay for non-center images */}
                {styles.hasOverlay && (
                  <div className={`absolute inset-0 pointer-events-none ${styles.rounded} ${styles.overlayClass}`}></div>
                )}
                
                {/* Click indicator for non-center images */}
                {!isCenter && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-black/50 rounded-full p-2">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-6 w-6 text-white" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                      </svg>
                    </div>
                  </div>
                )}
                
                {/* Name overlay for center image */}
                {isCenter && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="text-white text-sm font-semibold">{image.name}</p>
                    <p className="text-white/80 text-xs">{image.role}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

       {/* Creator Description for center image */}
<div className="
  w-full sm:w-[601px]
  h-auto sm:h-[251px]
  opacity-100
  flex flex-col
  gap-[8px]
  pt-[6px] pr-[10px] pb-[10px] pl-[10px]
">

  <h3 className="
    w-full sm:w-[581px]
    h-auto sm:h-[39px]
    poppins-font font-medium
    text-[18px] sm:text-[28px]
    leading-[140%]
    text-center
    text-[#3D1768]
    shadow-[0px_6px_10px_0px_#D9D9D9]
  ">
    {displayOrder[3].name}
  </h3>

  <p className="
    w-full sm:w-[581px]
    h-auto sm:h-[22px]
    poppins-font font-semibold
    text-[13px] sm:text-[16px]
    leading-[140%]
    text-center
    text-[#693B93]
  ">
    {displayOrder[3].role}
  </p>

  {/* 👇 Description (fully visible on mobile) */}
  <p className="
    w-full sm:w-[581px]
    h-auto sm:h-[166px]
    poppins-font font-normal
    text-[11px] sm:text-[14px]
    leading-[140%]
    text-center
    text-[#170929]
    overflow-visible sm:overflow-y-auto
  ">
    {displayOrder[3].description}
  </p>

</div>


       

      </div>
    </section>
  );
};

export default Creator;