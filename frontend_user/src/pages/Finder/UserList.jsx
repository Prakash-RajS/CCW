import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import headerbg from "../../assets/AfterSign/HomeBg.png";
import cardphoto from "../../assets/Landing/cardphoto.png";
import profilepic from "../../assets/Landing/profilepic.png";
import Header from "../../component/Header";
import Footer from "../../component/Footer";

// --- NEW COMPONENT: EXTRACTED TO FIX HOOKS ERROR ---
const ScalableName = ({ name }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    // Reset scale to 1 to get accurate measurements
    textEl.style.transform = "scale(1)";
    
    const availableWidth = container.clientWidth;
    const textWidth = textEl.scrollWidth;

    if (textWidth > availableWidth) {
      setScale(availableWidth / textWidth);
    } else {
      setScale(1);
    }
  }, [name]);

  return (
    <div
      ref={containerRef}
      className="
        absolute
        left-1/2
        -translate-x-1/2
        /* MOBILE: Position at bottom of image area */
        bottom-[2px]
        /* DESKTOP: Keep original top positioning */
        md:bottom-auto md:top-[144px]
        px-2 md:px-4
        py-1
        rounded-full
        overflow-hidden
        max-w-[90%]
        flex
        items-center
        justify-center
        z-20
      "
    >
      <span
        ref={textRef}
        style={{ transform: `scale(${scale})` }}
        className="
          marcellus-sc-regular
          font-normal
          text-[22px] md:text-[46px] /* Adjusted font size for mobile */
          leading-[100%]
          tracking-[0px]
          text-black
          whitespace-nowrap
          origin-center
          transition-transform
          duration-200
          block
        "
      >
        {name.toUpperCase()}
      </span>
    </div>
  );
};
// ---------------------------------------------------

const sampleUsers = [
  {
    id: 1,
    name: "Maxwell",
    role: "UI/UX designer",
    starrating: "★★★★★",
    avatar: cardphoto,
    priceTag: "100k",
    description:
      "UI/UX Designer passionate about solving problems through thoughtful design.",
  },
  {
    id: 2,
    name: "Maxwell",
    role: "Video editor",
    starrating: "★★★★★",
    avatar: cardphoto,
    priceTag: "100k",
    description:
      "UI/UX Designer passionate about solving problems through thoughtful design.",
  },
  {
    id: 3,
    name: "Princy",
    role: "Content creator",
    starrating: "★★★★★",
    avatar: cardphoto,
    priceTag: "100k",
    description:
      "UI/UX Designer passionate about solving problems through thoughtful design.",
  },
  {
    id: 4,
    name: "Watson",
    role: "UI/UX designer",
    starrating: "★★★★★",
    avatar: cardphoto,
    priceTag: "100k",
    description:
      "UI/UX Designer passionate about solving problems through thoughtful design.",
  },
  {
    id: 5,
    name: "Danial",
    role: "Video editor",
    starrating: "★★★★★",
    avatar: cardphoto,
    priceTag: "100k",
    description:
      "UI/UX Designer passionate about solving problems through thoughtful design.",
  },
  {
    id: 6,
    name: "Julie",
    role: "Content creator",
    starrating: "★★★★★",
    avatar: cardphoto,
    priceTag: "100k",
    description:
      "UI/UX Designer passionate about solving problems through thoughtful design.",
  },
  {
    id: 7,
    name: "Julie",
    role: "Content creator",
    starrating: "★★★★★",
    avatar: cardphoto,
    priceTag: "100k",
    description:
      "UI/UX Designer passionate about solving problems through thoughtful design.",
  },
  {
    id: 8,
    name: "Julie",
    role: "Content creator",
    starrating: "★★★★★",
    avatar: cardphoto,
    priceTag: "100k",
    description:
      "UI/UX Designer passionate about solving problems through thoughtful design.",
  },
  {
    id: 9,
    name: "Julie",
    role: "Content creator",
    starrating: "★★★★★",
    avatar: cardphoto,
    priceTag: "100k",
    description:
      "UI/UX Designer passionate about solving problems through thoughtful design.",
  },
  {
    id: 10,
    name: "Julie",
    role: "Content creator",
    starrating: "★★★★★",
    avatar: cardphoto,
    priceTag: "100k",
    description:
      "UI/UX Designer passionate about solving problems through thoughtful design.",
  },
  {
    id: 11,
    name: "Julie",
    role: "Content creator",
    starrating: "★★★★★",
    avatar: cardphoto,
    priceTag: "100k",
    description:
      "UI/UX Designer passionate about solving problems through thoughtful design.",
  },
  {
    id: 12,
    name: "Maxwell",
    role: "UI/UX designer",
    starrating: "★★★★★",
    avatar: cardphoto,
    priceTag: "100k",
    description:
      "UI/UX Designer passionate about solving problems through thoughtful design.",
  },
  {
    id: 13,
    name: "Maxwell",
    role: "Video editor",
    starrating: "★★★★★",
    avatar: cardphoto,
    priceTag: "100k",
    description:
      "UI/UX Designer passionate about solving problems through thoughtful design.",
  },
  {
    id: 14,
    name: "Princy",
    role: "Content creator",
    starrating: "★★★★★",
    avatar: cardphoto,
    priceTag: "100k",
    description:
      "UI/UX Designer passionate about solving problems through thoughtful design.",
  },
  {
    id: 15,
    name: "Watson",
    role: "UI/UX designer",
    starrating: "★★★★★",
    avatar: cardphoto,
    priceTag: "100k",
    description:
      "UI/UX Designer passionate about solving problems through thoughtful design.",
  },
  {
    id: 16,
    name: "Danial",
    role: "Video editor",
    starrating: "★★★★★",
    avatar: cardphoto,
    priceTag: "100k",
    description:
      "UI/UX Designer passionate about solving problems through thoughtful design.",
  },
  {
    id: 17,
    name: "Julie",
    role: "Content creator",
    starrating: "★★★★★",
    avatar: cardphoto,
    priceTag: "100k",
    description:
      "UI/UX Designer passionate about solving problems through thoughtful design.",
  },
  {
    id: 18,
    name: "Julie",
    role: "Content creator",
    starrating: "★★★★★",
    avatar: cardphoto,
    priceTag: "100k",
    description:
      "UI/UX Designer passionate about solving problems through thoughtful design.",
  },
  {
    id: 19,
    name: "Julie",
    role: "Content creator",
    starrating: "★★★★★",
    avatar: cardphoto,
    priceTag: "100k",
    description:
      "UI/UX Designer passionate about solving problems through thoughtful design.",
  },
  {
    id: 20,
    name: "Julie",
    role: "Content creator",
    starrating: "★★★★★",
    avatar: cardphoto,
    priceTag: "100k",
    description:
      "UI/UX Designer passionate about solving problems through thoughtful design.",
  },
  {
    id: 21,
    name: "Julie",
    role: "Content creator",
    starrating: "★★★★★",
    avatar: cardphoto,
    priceTag: "100k",
    description:
      "UI/UX Designer passionate about solving problems through thoughtful design.",
  },
];

export default function UserList() {
  // ==========================================
  // 0. MOBILE SIDEBAR STATE
  // ==========================================
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // ==========================================
  // 1. FILTER STATE
  // ==========================================
  const [activeFilterDropdown, setActiveFilterDropdown] = useState(null);

  const [filterCategory, setFilterCategory] = useState("Niche");
  const [filterRange, setFilterRange] = useState("Audience");
  const [filterLocation, setFilterLocation] = useState("Location");

  const toggleFilterDropdown = (name) => {
    setActiveFilterDropdown(activeFilterDropdown === name ? null : name);
  };

  // ==========================================
  // 3. REUSABLE FILTER DROPDOWN COMPONENT
  // ==========================================
  const FilterDropdown = ({ value, setValue, options, name, className }) => (
    <div className={`relative ${className} h-[50px] z-30`}>
      <div
        onClick={() => toggleFilterDropdown(name)}
        className="w-full h-full rounded-[24px] border border-[#FFFFFF] px-2 lg:px-4 flex items-center justify-between text-white font-['Poppins'] text-[16px] lg:text-[22px] font-medium cursor-pointer hover:bg-white/10 transition-colors"
        style={{
          background:
            "linear-gradient(90deg, rgba(10, 10, 10, 0.5) 0%, rgba(11, 11, 11, 0.4) 100%)",
        }}
      >
        <span className="truncate">{value}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 lg:h-5 lg:w-5 transition-transform duration-200 ${
            activeFilterDropdown === name ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {activeFilterDropdown === name && (
        <div
          className="absolute top-[60px] left-0 w-full flex flex-col items-start z-50 shadow-2xl"
          style={{
            borderRadius: "8px",
            padding: "24px 15px",
            gap: "11px",
            background:
              "linear-gradient(180deg, rgba(81, 33, 143, 0.95) 0%, #020202 100%)",
            backdropFilter: "blur(10px)",
          }}
        >
          {options.map((option) => (
            <div
              key={option}
              onClick={() => {
                setValue(option);
                toggleFilterDropdown(null);
              }}
              className="w-full text-left text-white text-[16px] lg:text-[20px] font-['PT_Serif_Caption'] cursor-pointer hover:text-[#C8A7FF] transition-colors"
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const INITIAL_NICHE = 6;
  const INITIAL_LOCATION = 6;
  const INITIAL_COLLAB = 4;
  const INITIAL_AUDIENCE = 5;

  const [nicheCount, setNicheCount] = useState(INITIAL_NICHE);
  const [locationCount, setLocationCount] = useState(INITIAL_LOCATION);
  const [collabCount, setCollabCount] = useState(INITIAL_COLLAB);
  const [audienceCount, setAudienceCount] = useState(INITIAL_AUDIENCE);

  // ==========================================
  // 4. PAGINATION & RESPONSIVE GRID COUNT
  // ==========================================
  const [itemsPerPage, setItemsPerPage] = useState(9); // Default init

  // Dynamic itemsPerPage based on screen width (Mobile vs Desktop)
  useEffect(() => {
    const handleResize = () => {
      // If width >= 1024px (Desktop/LG), show 9 cards. Else (Mobile/Tablet), show 6 cards.
      if (window.innerWidth >= 1024) {
        setItemsPerPage(9);
      } else {
        setItemsPerPage(6);
      }
    };

    // Initialize on mount
    handleResize();

    // Listen for resize
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(sampleUsers.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const startIdx = (currentPage - 1) * itemsPerPage;
  const visibleUsers = sampleUsers.slice(startIdx, startIdx + itemsPerPage);

  const goToPage = (p) => {
    const page = Math.max(1, Math.min(totalPages, p));
    setCurrentPage(page);
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Removed body scroll lock useEffect to allow scrolling to bottom of absolute filter

  return (
    <section
      className="w-full max-w-[1440px] mx-auto min-h-[2496px] h-auto relative bg-[rgba(255,255,255,1)] overflow-x-hidden"
      aria-label="Header section"
    >
      <div className="absolute top-0 left-0 w-full z-50">
        <Header />
      </div>

      {/* Background image block */}
      <div className="absolute left-0 w-full h-[482px] md:h-[482px] lg:h-[482px] bg-cover bg-center">
        <img
          src={headerbg}
          alt="banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-[#3D1768]/60 to-[#030303]/60 md:hidden"></div>

        <h1 className="absolute w-full top-[100px] md:top-[154px] left-0 text-center text-white milonga-regular font-normal text-[24px] md:text-[40px] lg:text-[48px] leading-tight lg:leading-[60px] tracking-[0px] z-10 px-4">
          Find the right collaborator for your
          <br className="hidden md:block" />
          <span className="md:hidden"> </span>next projects
        </h1>

        <h2 className="absolute w-full top-[180px] md:top-[290px] left-0 text-center text-white poppins-font font-normal text-[12px] md:text-[24px] leading-[100%] tracking-[0px] z-10 px-4 py-2">
          Search creator by Niche, Location, audience, skills and more
        </h2>

        {/* Search Bar & Filters Row */}
<div className="absolute w-full flex flex-col md:flex-row flex-wrap justify-center top-[220px] md:top-[360px] gap-[15px] md:gap-[10px] lg:gap-[15px] xl:gap-[20px] px-12 md:px-8 z-20">
  
  {/* Mobile Filter Layout */}
<div className="w-full md:w-auto flex flex-col gap-4 md:hidden">
  
  {/* FIX: Wrapped in a div with z-50 so it sits ON TOP of the row below */}
  <div className="relative z-50 w-full">
    <FilterDropdown
      name="filter_category"
      value={filterCategory}
      setValue={setFilterCategory}
      options={["Art & design", "Fitness", "Fashion", "Technology"]}
      className="w-full"
    />
  </div>

  {/* FIX: Added relative z-40 (lower than z-50) so it stays BEHIND the top one */}
  <div className="flex gap-4 w-full relative z-40">
    <FilterDropdown
      name="filter_range"
      value={filterRange}
      setValue={setFilterRange}
      options={["1k-5k", "5k-10k", "10k+", "50k+"]}
      className="w-1/2"
    />
    <FilterDropdown
      name="filter_location"
      value={filterLocation}
      setValue={setFilterLocation}
      options={["USA", "India", "China", "UK"]}
      className="w-1/2"
    />
  </div>

</div>

  {/* Desktop Filter Layout - FIX APPLIED BELOW */}
  {/* Changed lg:w-[283px] to lg:w-[22%] and added xl:w-[283px] */}
  
  <FilterDropdown
    name="filter_category"
    value={filterCategory}
    setValue={setFilterCategory}
    options={["Art & design", "Fitness", "Fashion", "Technology"]}
    className="hidden md:block w-[48%] lg:w-[22%] xl:w-[283px]" 
  />
  <FilterDropdown
    name="filter_range"
    value={filterRange}
    setValue={setFilterRange}
    options={["1k-5k", "5k-10k", "10k+", "50k+"]}
    className="hidden md:block w-[48%] lg:w-[22%] xl:w-[283px]"
  />
  <FilterDropdown
    name="filter_location"
    value={filterLocation}
    setValue={setFilterLocation}
    options={["USA", "India", "China", "UK"]}
    className="hidden md:block w-[48%] lg:w-[22%] xl:w-[283px]"
  />

  {/* Search Input Block - FIX APPLIED BELOW */}
  <div
    className="w-full md:w-[48%] lg:w-[22%] xl:w-[283px] h-[50px] rounded-[24px] border border-[#FFFFFF] px-2 lg:px-4 flex items-center justify-center gap-2 md:justify-between text-white font-['Poppins'] text-[16px] lg:text-[22px]
    bg-[linear-gradient(90deg,#3D1768_0%,#030303_100%)]
    md:bg-[linear-gradient(90deg,rgba(10,10,10,0.5)_0%,rgba(11,11,11,0.4)_100%)]"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="white"
      className="w-5 h-5 lg:w-6 lg:h-6 order-1 md:order-last md:ml-2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
      />
    </svg>
    <input
      type="text"
      placeholder="Search"
      className="bg-transparent outline-none text-white w-full placeholder-white font-['PT_Serif_Caption'] text-[16px] lg:text-[18px] xl:text-[20px] text-center md:text-left order-2 md:order-first placeholder-white/100 md:placeholder-white/70 min-w-0"
    />
  </div>
</div>
      </div>

   {/* FIND COLLABORATOR SECTION - UPDATED FOR MOBILE */}
      {/* Adjusted mt-[405px] to pull button up into the dark background area to match the image */}
      <div className="relative w-full h-[100px] mt-[405px] md:mt-[440px] z-10 flex justify-center items-center mb-8">
        
        {/* MOBILE DECORATIVE LINES - Lighter color to be visible on dark background */}
        <div className="md:hidden absolute mt-[35px] top-1/2 -translate-y-1/2 left-0 w-[50%] h-[1px] bg-gradient-to-r from-[#3D1768] to-[#030303]" />
        <div className="md:hidden absolute mt-[35px] top-1/2 -translate-y-1/2 right-0 w-[50%] h-[1px] bg-gradient-to-l from-[#3D1768] to-[#030303]" />

        {/* DESKTOP DECORATIVE LINES - Darker color for white background */}
        <div className="hidden md:block absolute top-[50px] left-0 w-[50%] h-[2px] bg-gradient-to-r from-[#3D1768] to-[#030303]" />
        <div className="hidden md:block absolute top-[50px] right-0 w-[50%] h-[2px] bg-gradient-to-l from-[#3D1768] to-[#030303]" />

        {/* Desktop tab background - hidden on mobile */}
        <div className="hidden md:block absolute top-[50px] left-1/2 -translate-x-1/2 w-[90%] max-w-[500px] h-[40px] bg-white rounded-b-full rounded-t-none !border-b-[2px] !border-l-[2px] !border-r-[2px] !border-t-0 border-[#3D1768] shadow-[0px_8px_18px_rgba(0,0,0,0.25)]"></div>
        
        {/* MOBILE BUTTON - White Pill Container + Gradient Button */}
        <div className="md:hidden relative z-20 top-[30px] w-[220px] h-[50px] bg-white rounded-full p-[6px] shadow-[0px_4px_10px_rgba(0,0,0,0.25)] flex items-center justify-center">
          <button
            className="
              w-full h-full
              rounded-full 
              text-[20px] 
              font-['PT_Serif'] text-white font-normal
              flex items-center justify-center
            "
            style={{
              background: "linear-gradient(90deg, #3D1768 0%, #030303 100%)",
            }}
          >
            Find collaborator
          </button>
        </div>

        {/* Desktop-specific button (hidden on mobile) */}
        <button
          className="
            hidden md:flex
            relative 
            md:absolute md:top-[6px] md:left-1/2 md:-translate-x-1/2 
            md:w-[80%] md:max-w-[450px] md:h-[60px] lg:h-[70px] 
            md:text-[24px] lg:text-[32px]
            md:shadow-[0px_5px_10px_#757575]
            rounded-full 
            !border !border-[#FFFFFF] font-['PT_Serif'] text-white font-normal font-['Poppins'] cursor-pointer items-center justify-center
            "
          style={{
            background: "linear-gradient(90deg, #3D1768 0%, #030303 100%)",
          }}
        >
          Find collaborator
        </button>
      </div>

      {/* Mobile profiles grid title - MOVED UP */}
      <div className="md:hidden w-full text-center text-[rgba(61,23,104,1)] pt-serif font-semibold text-[15px] leading-[30px] mt-8 mb-4 px-4 relative z-10">
        Result of profile which matches for you
      </div>

      {/* MOBILE ONLY: Filter Toggle Button and Heading - MOVED DOWN & STYLED */}
      <div className="md:hidden w-full flex justify-end items-center gap-4 px-6 mb-6 relative z-20">
         <div className="text-[rgba(61,23,104,1)] font-['PT_Serif_Caption'] text-[20px] font-semibold">
           Filters
         </div>
         <button onClick={() => setIsMobileFilterOpen(true)} className="p-2">
            {/* Filter Icon SVG based on filter1.jpg */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" stroke="#3D1768" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
         </button>
      </div>

      {/* Desktop "Filters" Heading - Hidden on Mobile */}
      <div className="hidden md:block absolute top-[620px] left-[92px] text-[rgba(61,23,104,1)] pt-serif-caption-regular font-normal text-[34px] leading-[60px] tracking-[0px] ">
        Filters
      </div>

      {/* MOBILE POPUP BACKDROP */}
      {isMobileFilterOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-[90] transition-opacity duration-300"
          onClick={() => setIsMobileFilterOpen(false)}
        />
      )}

      {/* MAIN FILTER ASIDE - REFACTORED FOR POPUP ON MOBILE, FIXED ON DESKTOP */}
      <aside className={`
        // --- MOBILE POPUP STYLES (Applied only when open on small screens) ---
        ${isMobileFilterOpen ? `
            absolute top-[750px] left-1/2 -translate-x-1/2
            w-[60%] max-w-[280px]
            h-auto
            z-[100] shadow-[0px_0px_20px_rgba(0,0,0,0.3)]
            rounded-[20px] pb-3 ml-[30px]
        ` : 'hidden'}

        // --- DESKTOP STYLES (Override mobile, always visible in correct pos) ---
        md:block
        md:absolute md:top-[680px] md:left-[78px]
        md:w-[324px] md:h-fit md:min-h-[1364px] md:max-h-none md:overflow-visible
        md:translate-x-0 md:translate-y-0 md:shadow-none md:z-auto
        md:rounded-[50px] md:pb-10

        // --- SHARED VISUAL STYLES (Desktop look applied everywhere) ---
        bg-[linear-gradient(90deg,#FFFFFF_0%,rgba(61,23,104,0.7)_100%)]
        border border-[1px] [border-image-source:linear-gradient(270deg,#3D1768_0%,rgba(255,255,255,0)_100%)] [border-image-slice:1]
      `}>
        
        {/* Inner Content Container - Adjusted padding for popup mode */}
        <div className="relative w-full md:w-[239px] h-fit min-h-fit md:min-h-[1264px] px-4 py-4 md:px-0 md:py-0 md:mt-[35px] md:ml-[30px] opacity-100 flex flex-col gap-[4px]">
          {/* Niche */}
          <div className="mb-2 md:mb-6">
            <h3 className="font-['Poppins'] font-semibold text-[18px] md:text-[24px] mb-2 md:mb-3 md:text-black text-black">
              Niche
            </h3>
            <ul className="space-y-1">
              {[
                "Art & design",
                "Fashion",
                "Travel",
                "Finance",
                "Music",
                "Food & Nutrition",
                "sports",
                "photography",
              ]
                .slice(0, nicheCount)
                .map((n) => (
                  <li key={n} className="flex items-center gap-2 md:gap-3">
                    <input
                      type="radio"
                      name="niche"
                      className="w-3 h-3 md:w-4 md:h-4 accent-[#3D1768] md:accent-[rgba(61,23,104,1)]"
                    />
                    <label className="text-[14px] md:text-[20px] font-['Poppins'] md:text-black text-black">{n}</label>
                  </li>
                ))}
            </ul>
            {nicheCount < 8 && (
              <div
                onClick={() => setNicheCount((prev) => prev + 2)}
                className="mt-1 md:mt-2 pt-[4px] md:pt-[12px] font-semibold text-[12px] md:text-[16px] cursor-pointer text-right md:text-black text-black"
              >
                More
              </div>
            )}
          </div>

          <div className="hidden md:block relative w-full md:w-[240px] h-0 md:left-[20px] opacity-100 !border !border-[rgba(102,102,102,0.8)] md:border-gray-500 border-black/20"></div>

          {/* Location */}
          <div className="mb-2 md:mb-6 mt-1 md:mt-0">
            <h3 className="font-semibold text-[18px] md:text-[24px] mb-2 md:mb-3 md:text-black text-black">Location</h3>
            <ul className="space-y-1">
              {[
                "India",
                "USA",
                "Australia",
                "Pakistan",
                "South Africa",
                "Ireland",
                "India",
                "USA",
                "Australia",
              ]
                .slice(0, locationCount)
                .map((loc, i) => (
                  <li key={`${loc}-${i}`} className="flex items-center gap-2 md:gap-3">
                    <input
                      type="radio"
                      className="w-3 h-3 md:w-4 md:h-4 accent-[#3D1768] md:accent-[rgba(61,23,104,1)]"
                    />
                    <label className="text-[14px] md:text-[20px] md:text-black text-black">{loc}</label>
                  </li>
                ))}
            </ul>
            {locationCount < 9 && (
              <div
                onClick={() => setLocationCount((prev) => prev + 2)}
                className="mt-1 md:mt-2 pt-[4px] md:pt-[12px] text-[12px] md:text-[16px] font-semibold cursor-pointer text-right md:text-black text-black"
              >
                More
              </div>
            )}
          </div>

          <div className="hidden md:block relative w-full md:w-[240px] h-0 md:left-[20px] opacity-100 !border !border-[rgba(102,102,102,0.8)] md:border-gray-500 border-black/20"></div>

          {/* Collaboration */}
          <div className="mb-2 md:mb-6 mt-1 md:mt-0">
            <h3 className="font-['Poppins'] font-semibold text-[18px] md:text-[24px] leading-[100%] tracking-[0px] text-black mb-2 md:mb-3">
              Collaboration type
            </h3>
            <ul className="space-y-1 text-sm">
              {[
                "Long term",
                "Short term",
                "Daily task",
                "Hourly Task",
                "Long term",
                "Short term",
              ]
                .slice(0, collabCount)
                .map((t, i) => (
                  <li key={`${t}-${i}`} className="flex items-center gap-2 md:gap-3">
                    <input
                      type="radio"
                      className="w-3 h-3 md:w-4 md:h-4 accent-[#3D1768] md:accent-[rgba(61,23,104,1)]"
                    />
                    <label className="text-[14px] md:text-[20px] text-black">{t}</label>
                  </li>
                ))}
            </ul>
            {collabCount < 6 && (
              <div
                onClick={() => setCollabCount((prev) => prev + 2)}
                className="mt-1 md:mt-2 pt-[4px] md:pt-[12px] text-[12px] md:text-[16px] font-semibold cursor-pointer text-right text-black"
              >
                More
              </div>
            )}
          </div>

          <div className="hidden md:block relative w-full md:w-[240px] h-0 md:left-[20px] opacity-100 !border !border-[rgba(102,102,102,0.8)] md:border-gray-500 border-black/20"></div>

          {/* Audience */}
          <div className="mb-2 md:mb-6 mt-1 md:mt-0">
            <h3 className="font-['Poppins'] font-semibold text-[18px] md:text-[24px] leading-[100%] tracking-[0px] text-black mb-2 md:mb-3">
              Audience size
            </h3>
            <ul className="space-y-1 text-sm">
              {[
                "0k - 1k",
                "1k - 10k",
                "10k - 50k",
                "50k - 100k",
                "100k+",
                "100k+",
                "100k+",
              ]
                .slice(0, audienceCount)
                .map((a, i) => (
                  <li key={`${a}-${i}`} className="flex items-center gap-2 md:gap-3">
                    <input
                      type="radio"
                      className="w-3 h-3 md:w-4 md:h-4 accent-[#3D1768] md:accent-[rgba(61,23,104,1)]"
                    />
                    <label className="text-[14px] md:text-[20px] text-black">{a}</label>
                  </li>
                ))}
            </ul>
            {audienceCount < 7 && (
              <div
                onClick={() => setAudienceCount((prev) => prev + 2)}
                className="mt-1 md:mt-2 pt-[4px] md:pt-[12px] text-[12px] md:text-[16px] font-semibold cursor-pointer text-right text-black"
              >
                More
              </div>
            )}
          </div>

          {/* "Apply filter" button container - Updated background */}
          <div className=" relative w-full md:w-[239px] h-[40px] md:h-[50px] flex items-center justify-center md:justify-between opacity-100 rounded-[65px] md:pt-[11.7px] md:pr-[33.8px] md:pb-[11.7px] md:pl-[60px] 
          bg-[linear-gradient(90deg,#3D1768_0%,#030303_100%)]
          shadow-[0_5.2px_5.2px_0_rgba(117,117,117,1)] cursor-pointer mt-1 md:mt-0 mb-0">
            <button className="font-['Reddit_Sans'] font-normal text-[16px] md:text-[20px] leading-[100%] tracking-[0px] text-center text-[rgba(255,255,255,1)] bg-clip-padding cursor-pointer" onClick={() => setIsMobileFilterOpen(false)}>
              Apply filter
            </button>
          </div>
        </div>
      </aside>

      {/* Desktop profiles grid title - Hidden on Mobile */}
      <div className="hidden md:block absolute top-[620px] left-[444px]  text-[rgba(61,23,104,1)]  pt-serif-caption-regular  font-normal  text-[34px]  leading-[60px]  tracking-[0px] ">
        Result of profile which matches for you
      </div>
      
      {/* profiles grid - Updated container styles for mobile flow */}
      <div
        className="
          relative md:absolute
          w-full md:w-[936px]
          h-auto md:h-[1250px]
          top-0 md:top-[705px]
          left-0 md:left-[444px]
          opacity-100
          z-10
          
          /* Mobile Grid Layout (2 cols) */
          grid grid-cols-2 gap-6 px-6
          
          /* Desktop Flex Layout */
          md:flex md:flex-wrap md:justify-start md:gap-[16px] md:px-0 md:grid-cols-none
        "
      >
        {visibleUsers.map((u) => (
          <article
            key={u.id}
            className="flex flex-col
              relative
              w-[180px] md:w-[287px]
              h-[260px] md:h-[398px] /* Smaller height for mobile */
              opacity-100
              border
              rounded-[20px] md:rounded-[27px]
              bg-[linear-gradient(rgba(142,120,168,1)_100%)]  
              overflow-hidden
            "
          >
           {/* top image area */}
            <div
              className="
                h-[110px] md:h-[140px] 
                relative 
                
                
               
                
                
              "
            >
              <img
                src={u.avatar || cardphoto}
                alt={u.name}
                className="absolute 
                /* Mobile: Smaller centered image to show purple border */
                w-[100%] h-[100%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[20px] md:opacity-100 md:object-cover
                /* Desktop: Full size image */
                md:w-[288px] md:h-[192px] md:top-0 md:left-0 md:translate-x-0 md:translate-y-0 md:rounded-[27px] 
                opacity-100 object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = cardphoto;
                }}
              />

              {/* NAME OVERLAY - USING THE EXTRACTED COMPONENT */}
              <ScalableName name={u.name} />

              {/* price badge */}
              <div
                className="
                  absolute
                  right-2 md:right-3
                  top-2 md:top-3
                  px-2 md:px-3
                  py-1
                  rounded-full
                  font-['Jost']
                  font-bold
                  text-[12px] md:text-[16px]
                  leading-none
                  text-[rgba(61,23,104,1)]
                  flex
                  flex-row
                  items-center
                  gap-1
                  whitespace-nowrap
                  z-10
                "
              >
                <span>{u.priceTag}</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-[rgba(61,23,104,1)] stroke-[3] w-[10px] h-[10px] md:w-[12px] md:h-[12px]"
                >
                  <path
                    d="M23 6L13.5 15.5L8.5 10.5L1 18"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M17 6H23V12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* bottom info area */}
            <div
              className="
                flex-1
                flex
                flex-col
                items-center
                justify-center
                gap-2 md:gap-4
                px-1 md:px-2
                py-2 md:py-3
                bg-[linear-gradient(rgba(142,120,168,1)_100%)] 
                text-center
              "
            >
              <div
                className="
                  font-['Jost']
                  font-medium
                  text-[14px] md:text-[18px]
                  leading-[100%]
                  tracking-[0px]
                  text-center
                  text-[linear-gradient(180deg,#000000_0%,#3D1768_57.22%)]
                "
              >
                {u.role}
                <div className="text-[10px] md:text-[14px] text-[rgba(215,172,43,1)]">
                  {u.starrating}
                </div>
              </div>

              <div
                className="
                  font-['Jost']
                  font-medium
                  text-[12px] md:text-[16px]
                  leading-[16px] md:leading-[20px]
                  tracking-[0px]
                  text-center
                  text-[rgba(255,255,255,1)]
                  line-clamp-3 md:line-clamp-none
                "
              >
                {u.description}
              </div>

              <button
                className="
                  w-[90px] md:w-[107px]
                  h-[20px] md:h-[24px]
                  relative md:absolute
                  md:top-[355px]
                  opacity-100
                  rounded-[35px]
                  font-['Katibeh']
                  font-normal
                  text-[12px] md:text-[14px]
                  leading-[100%]
                  tracking-[0px]
                  text-center
                  cursor-pointer
                  text-[rgba(61,23,104,1)]
                  group
                  z-10
                  mt-auto md:mt-0
                "
              >
                <div className="absolute inset-0 bg-white rounded-[35px] blur-[4px] opacity-80"></div>
                <span className="relative z-10">View profile</span>
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* pagination - Updated container styles for mobile flow */}
      <div className="relative md:absolute w-full md:w-[936px] top-0 md:top-[1955px] left-0 md:left-[444px] mb-10 md:mb-0 z-10">
        <div className="mt-10 flex items-center gap-4 justify-center text-gray-500">
          <button
            className="px-3 py-1"
            onClick={() => goToPage(currentPage - 1)}
            aria-disabled={currentPage === 1}
          >
            Previous
          </button>

          {pageNumbers.map((p) =>
            p === currentPage ? (
              <div key={p} className="font-bold text-xl">
                {p}
              </div>
            ) : (
              <button
                key={p}
                className="px-3 py-1"
                onClick={() => goToPage(p)}
                aria-label={`Go to page ${p}`}
              >
                {p}
              </button>
            )
          )}
        </div>
      </div>

      <div className="relative md:mt-[1580px] z-10">
        <Footer />
      </div>
    </section>
  );
}