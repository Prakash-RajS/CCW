import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../utils/axiosConfig";
import headerbg from "../../assets/AfterSign/HomeBg.png";
import cardphoto from "../../assets/Landing/cardphoto.png";
import Header from "../../component/Header";
import Footer from "../../component/Footer";

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};

const formatFollowers = (num) => {
  if (!num) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return num.toString();
};

const renderStars = (rating) => {
  const score = Math.max(0, Math.min(5, Math.round(rating || 0)));
  return (
    <span className="flex items-center justify-center gap-[2px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          style={{
            color: i < score ? "rgba(215,172,43,1)" : "rgba(180,180,180,0.5)",
            fontSize: "12px",
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
};

const getProfilePicUrl = (profilePic) => {
  if (!profilePic) return cardphoto;
  
  if (profilePic.startsWith("http://") || profilePic.startsWith("https://")) {
    return profilePic;
  }
  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  
  if (profilePic.startsWith("/collaborator/files/")) {
    return `${API_BASE_URL}${profilePic}`;
  }
  
  if (profilePic.startsWith("/media/") || profilePic.startsWith("media/")) {
    const cleanPath = profilePic.startsWith("/") ? profilePic : `/${profilePic}`;
    return `${API_BASE_URL}${cleanPath}`;
  }
  
  return `${API_BASE_URL}/${profilePic}`;
};

const toDisplayName = (name) => {
  if (!name) return "User";
  return name
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
};

const DESKTOP_PAGE_SIZE = 9;
const MOBILE_PAGE_SIZE = 9;

export default function UserList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState({
    name: "",
    profilePicture: null,
    role: "",
  });
  
  const [activeFilterDropdown, setActiveFilterDropdown] = useState(null);
  const buttonRefs = useRef({});
  const dropdownRefs = useRef({});

  const [filterCategory, setFilterCategory] = useState(
    searchParams.get("skill_category") || "Niche"
  );
  const [filterExperience, setFilterExperience] = useState(
    searchParams.get("experience") || "Experience"
  );
  const [filterLocation, setFilterLocation] = useState(
    searchParams.get("location") || "Location"
  );
  
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || ""
  );
  const debouncedSearch = useDebounce(searchInput, 500);

  const [nicheOptions, setNicheOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  // Removed "Advanced" from experience options
  const [experienceOptions] = useState([
    "Beginner",
    "Intermediate", 
    "Expert"
  ]);

  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);

  const isClearingAllRef = useRef(false);

  // Update URL when debounced search changes
  useEffect(() => {
    if (isClearingAllRef.current) return;
    
    const newParams = new URLSearchParams(searchParams);
    
    if (debouncedSearch && debouncedSearch.trim()) {
      newParams.set("search", debouncedSearch.trim());
    } else {
      newParams.delete("search");
    }
    
    if (newParams.get("search") !== searchParams.get("search")) {
      setSearchParams(newParams);
      setCurrentPage(1);
      setHasSearched(true);
    }
  }, [debouncedSearch, searchParams, setSearchParams]);

  const scrollToCollaboratorsSection = () => {
    const isDesktop = window.innerWidth >= 768;
    
    let titleElement;
    if (isDesktop) {
      titleElement = document.getElementById('collaborators-title-desktop');
      if (!titleElement) {
        titleElement = document.getElementById('collaborators-title-mobile');
      }
    } else {
      titleElement = document.getElementById('collaborators-title-mobile');
      if (!titleElement) {
        titleElement = document.getElementById('collaborators-title-desktop');
      }
    }
   
    if (titleElement) {
      const offset = 30;
      const elementPosition = titleElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
     
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    } else {
      const isDesktop = window.innerWidth >= 768;
      let resultsSection;
      
      if (isDesktop) {
        resultsSection = document.querySelector('.md\\:block .max-w-8xl');
      } else {
        resultsSection = document.querySelector('.md\\:hidden .flex.flex-col.items-center');
      }
      
      if (resultsSection) {
        const offset = 30;
        const elementPosition = resultsSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };
   
  const goToPage = (p) => {
    const newPage = Math.max(1, Math.min(totalPages, p));
    setCurrentPage(newPage);
    
    requestAnimationFrame(() => {
      setTimeout(() => {
        scrollToCollaboratorsSection();
      }, 100);
    });
  };
   
  const scrollToTop = () => {
    requestAnimationFrame(() => {
      scrollToCollaboratorsSection();
    });
  };
  
  // Sync searchInput with URL params
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    if (urlSearch !== searchInput) {
      setSearchInput(urlSearch);
    }
  }, [searchParams]);

  // GLOBAL: Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!activeFilterDropdown) return;
      
      const button = buttonRefs.current[activeFilterDropdown];
      const dropdown = dropdownRefs.current[activeFilterDropdown];
      
      if (button && button.contains(event.target)) return;
      if (dropdown && dropdown.contains(event.target)) return;
      
      setActiveFilterDropdown(null);
    };
    
    document.addEventListener("click", handleClickOutside, false);
    return () => document.removeEventListener("click", handleClickOutside, false);
  }, [activeFilterDropdown]);

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;
        try {
          const r = await api.get(`/creator/get/${userId}`);
          if (r.data) {
            setCurrentUser({ name: r.data.creator_name || "Creator", profilePicture: r.data.profile_picture, role: "creator" });
            return;
          }
        } catch (_) {}
        try {
          const r = await api.get(`/collaborator/get/${userId}`);
          if (r.data) setCurrentUser({ name: r.data.name || "Collaborator", profilePicture: r.data.profile_picture, role: "collaborator" });
        } catch (_) {}
      } catch (e) {
        console.error(e);
      }
    };
    fetchCurrentUser();
  }, []);

  // Filter helpers
  const updateFilterParam = (filterName, value) => {
    const newParams = new URLSearchParams(searchParams);
    const map = { 
      filter_category: "skill_category", 
      filter_experience: "experience",
      filter_location: "location" 
    };
    const key = map[filterName] || filterName;
    if (["Niche", "Experience", "Location"].includes(value)) newParams.delete(key);
    else newParams.set(key, value);
    setSearchParams(newParams);
    setHasSearched(true);
  };

  const handleClearFilter = (filterName) => {
    const map = { 
      filter_category: "skill_category", 
      filter_experience: "experience",
      filter_location: "location" 
    };
    const key = map[filterName] || filterName;
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(key);
    setSearchParams(newParams);
    if (filterName === "filter_category") setFilterCategory("Niche");
    if (filterName === "filter_experience") setFilterExperience("Experience");
    if (filterName === "filter_location") setFilterLocation("Location");
    setHasSearched(true);
  };

  // Clear ALL filters
  const clearAllFilters = useCallback(() => {
    isClearingAllRef.current = true;
    
    setFilterCategory("Niche");
    setFilterExperience("Experience");
    setFilterLocation("Location");
    setSearchInput("");
    setSearchParams(new URLSearchParams());
    setCurrentPage(1);
    setHasSearched(false);
    setActiveFilterDropdown(null);
    
    setTimeout(() => {
      isClearingAllRef.current = false;
    }, 100);
  }, [setSearchParams]);

  const hasActiveFilters =
    filterCategory !== "Niche" ||
    filterExperience !== "Experience" ||
    filterLocation !== "Location" ||
    searchInput.trim() !== "";

  // Search / navigate
  const handleSearch = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);
    
    if (filterCategory && filterCategory !== "Niche") {
      newParams.set("skill_category", filterCategory);
    } else {
      newParams.delete("skill_category");
    }
    
    if (filterExperience && filterExperience !== "Experience") {
      newParams.set("experience", filterExperience);
    } else {
      newParams.delete("experience");
    }
    
    if (filterLocation && filterLocation !== "Location") {
      newParams.set("location", filterLocation);
    } else {
      newParams.delete("location");
    }
    
    if (searchInput && searchInput.trim()) {
      newParams.set("search", searchInput.trim());
    } else {
      newParams.delete("search");
    }
    
    setSearchParams(newParams);
    setCurrentPage(1);
    setHasSearched(true);
  }, [filterCategory, filterExperience, filterLocation, searchInput, searchParams, setSearchParams]);

  // Fetch filters + collaborators when searchParams changes
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const r = await api.get(`/collaborator/filters`);
        if (r.data) {
          setNicheOptions(r.data.niches || []);
          setLocationOptions(r.data.locations || []);
        }
      } catch (e) {
        console.error(e);
      }
    };

    const fetchCollaborators = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(searchParams);
        const hasSearchParams = params.toString().length > 0;
        setHasSearched(hasSearchParams);
        const response = await api.get(`/collaborator/search?${params.toString()}`);
        setCollaborators(Array.isArray(response.data) ? response.data : []);
      } catch (e) {
        console.error("Error fetching collaborators:", e);
        setCollaborators([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
    fetchCollaborators();
  }, [searchParams]);

  // Pagination
  const [itemsPerPage, setItemsPerPage] = useState(DESKTOP_PAGE_SIZE);
  useEffect(() => {
    const upd = () => setItemsPerPage(window.innerWidth >= 1024 ? DESKTOP_PAGE_SIZE : MOBILE_PAGE_SIZE);
    upd();
    window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(collaborators.length / itemsPerPage));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [collaborators, totalPages, currentPage]);

  const startIdx = (currentPage - 1) * itemsPerPage;
  const visibleUsers = collaborators.slice(startIdx, startIdx + itemsPerPage);

  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, 5];
    if (currentPage >= totalPages - 2) return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
  };

  // Simple dropdown component - Fixed for mobile
  const SimpleDropdown = ({ value, setValue, options, name, className }) => {
    const isDefault = ["Niche", "Experience", "Location"].includes(value);
    const isOpen = activeFilterDropdown === name;
    
    const handleOptionClick = (option) => {
      if (value === option) {
        handleClearFilter(name);
      } else {
        setValue(option);
        updateFilterParam(name, option);
      }
      setActiveFilterDropdown(null);
    };
    
    const handleClearClick = (e) => {
      e.stopPropagation();
      handleClearFilter(name);
      setActiveFilterDropdown(null);
    };
    
    const toggleDropdown = (e) => {
      e.stopPropagation();
      setActiveFilterDropdown(isOpen ? null : name);
    };
    
    return (
      <div className={`relative ${className}`}>
        {/* Button - Fixed to handle long text on mobile */}
        <div
          ref={(el) => (buttonRefs.current[name] = el)}
          onClick={toggleDropdown}
          className="w-full h-[50px] rounded-[24px] border border-white px-2 lg:px-4 flex items-center justify-between text-white font-['Poppins'] text-[14px] lg:text-[22px] font-medium cursor-pointer hover:bg-white/10 transition-colors gap-1"
          style={{ background: "linear-gradient(90deg,rgba(10,10,10,0.5) 0%,rgba(11,11,11,0.4) 100%)" }}
        >
          <span className="truncate text-[13px] md:text-[16px] lg:text-[22px] flex-1 min-w-0">
            {value}
          </span>
          <div className="flex items-center gap-1 flex-shrink-0">
            {!isDefault && (
              <div
                className="text-white hover:text-red-300 text-[11px] lg:text-xs cursor-pointer"
                onClick={handleClearClick}
              >
                ✕
              </div>
            )}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-3 w-3 lg:h-5 lg:w-5 transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        {/* Dropdown */}
        {isOpen && (
          <div
            ref={(el) => (dropdownRefs.current[name] = el)}
            className="absolute top-[55px] left-0 w-full md:w-auto md:min-w-[200px]"
            style={{ zIndex: 50 }}
          >
            <div
              className="flex flex-col items-start shadow-2xl custom-scrollbar-dropdown"
              style={{
                borderRadius: "8px",
                padding: "12px 10px",
                gap: "6px",
                background: "linear-gradient(180deg, rgba(61,23,104,0.98) 0%, #030303 98%)",
                backdropFilter: "blur(20px)",
                maxHeight: "200px",
                overflowY: "auto",
                minWidth: "100%",
              }}
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearClick(e);
                }}
                className="w-full text-left text-white text-[13px] lg:text-[14px] font-['PT_Serif_Caption'] cursor-pointer hover:text-[#C8A7FF] transition-colors border-b border-white/20 pb-2 mb-1"
              >
                Clear
              </div>
              {options.map((opt) => (
                <div
                  key={opt}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOptionClick(opt);
                  }}
                  className={`w-full text-left text-white text-[13px] lg:text-[14px] font-['PT_Serif_Caption'] cursor-pointer hover:text-[#C8A7FF] transition-colors py-1 ${
                    value === opt ? "text-[#C8A7FF] font-bold" : ""
                  }`}
                >
                  {opt}
                </div>
              ))}
              
              {options.length > 4 && (
                <div className="w-full text-center text-white/40 text-[9px] pt-1 mt-1 border-t border-white/20">
                  {options.length} total options
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ProfileCard component
  const ProfileCard = ({ u }) => {
    const [imgError, setImgError] = useState(false);
    
    const profilePicUrl = u.profile_picture || u.profile_pic || u.profile_picture_url;
    
    return (
      <article className="relative w-full max-w-[320px] 2xl:max-w-[520px] mx-auto h-[380px] rounded-[24px] overflow-hidden bg-[#8E78A8] flex flex-col shadow-lg hover:shadow-xl transition-shadow">
        <div className="relative h-[180px] w-full">
          <img
            src={imgError ? cardphoto : getProfilePicUrl(profilePicUrl)}
            alt={u.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              setImgError(true);
              e.currentTarget.onerror = null;
              e.currentTarget.src = cardphoto;
            }}
          />
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 rounded-full px-2 py-1">
            <span className="text-[12px] font-semibold text-[#3D1768]">{formatFollowers(u.followers)}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="#3D1768" strokeWidth="2.5" className="w-[12px] h-[12px]">
              <path d="M23 6L13.5 15.5L8.5 10.5L1 18" strokeLinecap="round" />
              <path d="M17 6H23V12" strokeLinecap="round" />
            </svg>
          </div>
          <div className="absolute bottom-[-8px] w-full text-center">
            <h2
              className="text-[24px] text-white font-semibold tracking-wide drop-shadow-lg"
              style={{ fontFamily: "'Marcellus SC', serif" }}
            >
              {toDisplayName(u.name)}
            </h2>
          </div>
        </div>

        <div className="flex flex-col items-center text-center px-4 pt-[30px] pb-4 gap-2 flex-1">
          <p className="text-[16px] text-black font-semibold" style={{ fontFamily: "Jost" }}>
            {u.skill_category || u.role || "—"}
          </p>
          <div className="text-[14px] leading-none">{renderStars(u.rating || u.skills_rating)}</div>
          <p className="text-white text-[12px] leading-[16px] line-clamp-2 max-w-[240px]" style={{ fontFamily: "Jost" }}>
            {u.about || u.description || "Designer passionate about solving problems through thoughtful design."}
          </p>
          <button
            onClick={() => navigate(`/finder-profile/${u.user_id || u.id}`)}
            className="mt-2 px-6 py-1.5 rounded-full bg-white text-[#3D1768] text-[12px] font-semibold hover:bg-opacity-90 transition-all shadow-md"
          >
            View profile
          </button>
        </div>
      </article>
    );
  };

  // Pagination component
  const Pagination = () => {
    if (loading || collaborators.length <= itemsPerPage) return null;
    
    const pageNumbers = getPageNumbers();
    
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap px-4">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="font-['Poppins'] text-[14px] md:text-[16px] text-gray-500 hover:text-[#3D1768] disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            aria-label="Previous page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          
          <div className="flex items-center gap-1 md:gap-2">
            {pageNumbers.map((p) =>
              p === currentPage ? (
                <span
                  key={p}
                  className="font-['Poppins'] font-extrabold text-[16px] md:text-[22px] text-[rgba(61,23,104,1)] min-w-[36px] md:min-w-[40px] text-center py-1 bg-[rgba(61,23,104,0.1)] rounded-full"
                  aria-current="page"
                >
                  {p}
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className="font-['Poppins'] font-normal text-[14px] md:text-[18px] text-gray-500 hover:text-[#3D1768] min-w-[36px] md:min-w-[40px] text-center py-1 rounded-full transition-colors hover:bg-[rgba(61,23,104,0.05)]"
                  aria-label={`Go to page ${p}`}
                >
                  {p}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="font-['Poppins'] text-[14px] md:text-[16px] text-gray-500 hover:text-[#3D1768] disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            aria-label="Next page"
          >
            Next
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <button
          onClick={scrollToTop}
          className="flex items-center justify-center gap-2 text-sm text-[#3D1768] hover:text-[#5a2a9e] transition-colors font-['Poppins'] py-2 px-4 md:px-0"
          aria-label="Scroll to top of results"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          Scroll to top
        </button>
      </div>
    );
  };

  // Render
  return (
    <div className="w-full min-h-screen bg-white overflow-x-hidden">

      {/* Header */}
      <div className="absolute top-0 left-0 w-full z-50">
        <Header userData={currentUser} />
      </div>

      {/* Hero banner */}
      <div className="relative w-full h-[520px] md:h-[482px] overflow-visible">
        <div
          className="absolute top-[-104px] left-0 w-full h-[calc(100%+104px)]"
          style={{
            backgroundImage: `url(${headerbg})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="absolute inset-0 bg-black opacity-30" />
        </div>

        {/* Hero heading */}
        <>
          <h1 className="absolute w-full top-[100px] md:top-[154px] left-0 text-center text-white milonga-regular font-normal text-[24px] md:text-[40px] lg:text-[48px] leading-tight lg:leading-[60px] z-10 px-4">
            Find the right collaborator for your
            <br className="hidden md:block" />
            <span className="md:hidden"> </span>next projects
          </h1>
          <h2 className="absolute w-full top-[180px] md:top-[290px] left-0 text-center text-white poppins-font font-normal text-[12px] md:text-[24px] leading-[100%] z-10 px-4 py-2">
            Search Collaborator by Niche, Location, Experience, skills and more
          </h2>
        </>

        {/* Filter dropdowns */}
        <div className="absolute w-full flex flex-col md:flex-row md:flex-wrap md:justify-center top-[240px] md:top-[360px] gap-[12px] md:gap-[10px] lg:gap-[15px] xl:gap-[20px] px-4 md:px-8 overflow-visible">
          
          {/* Mobile layout */}
          <div className="w-full md:hidden flex flex-col gap-2 overflow-visible">
            <div className="flex gap-2 w-full overflow-visible">
              <SimpleDropdown name="filter_category" value={filterCategory} setValue={setFilterCategory} options={nicheOptions} className="flex-1 min-w-0" />
              <SimpleDropdown name="filter_experience" value={filterExperience} setValue={setFilterExperience} options={experienceOptions} className="flex-1 min-w-0" />
            </div>
            <div className="flex gap-2 w-full overflow-visible">
              <SimpleDropdown name="filter_location" value={filterLocation} setValue={setFilterLocation} options={locationOptions} className="flex-1 min-w-0" />
              <div className="flex-1 h-[50px] rounded-[24px] border border-white px-2 flex items-center gap-1 text-white font-['Poppins'] text-[13px] bg-[linear-gradient(90deg,#3D1768_0%,#030303_100%)] min-w-0">
                <div className="cursor-pointer flex-shrink-0" onClick={handleSearch}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="white" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                  className="bg-transparent outline-none text-white w-full placeholder-white font-['PT_Serif_Caption'] text-[12px] text-center min-w-0"
                />
                {searchInput && (
                  <div
                    className="text-white hover:text-red-300 text-[10px] cursor-pointer flex-shrink-0"
                    onClick={() => setSearchInput("")}
                  >
                    ✕
                  </div>
                )}
              </div>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="w-full h-[40px] px-3 rounded-[20px] border border-white text-white font-['Poppins'] text-[12px] font-medium flex items-center justify-center gap-2 transition-all"
                style={{ background: "linear-gradient(90deg, #3D1768 0%, #030303 100%)" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="white" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear all
              </button>
            )}
          </div>

          {/* Tablet and Desktop layout */}
          <div className="hidden md:flex md:flex-wrap md:justify-center md:items-center gap-3 lg:gap-4 overflow-visible">
            <SimpleDropdown name="filter_category" value={filterCategory} setValue={setFilterCategory} options={nicheOptions} className="w-[180px] lg:w-[200px]" />
            <SimpleDropdown name="filter_experience" value={filterExperience} setValue={setFilterExperience} options={experienceOptions} className="w-[180px] lg:w-[200px]" />
            <SimpleDropdown name="filter_location" value={filterLocation} setValue={setFilterLocation} options={locationOptions} className="w-[180px] lg:w-[200px]" />
            
            <div className="w-[180px] lg:w-[200px] h-[50px] rounded-[24px] border border-white px-3 flex items-center gap-2 text-white bg-[linear-gradient(90deg,rgba(10,10,10,0.5)_0%,rgba(11,11,11,0.4)_100%)]">
              <div className="cursor-pointer flex-shrink-0" onClick={handleSearch}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="white" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                className="bg-transparent outline-none text-white w-full placeholder-white font-['PT_Serif_Caption'] text-[14px] lg:text-[16px]"
              />
              {searchInput && (
                <div className="text-white hover:text-red-300 text-xs cursor-pointer" onClick={() => setSearchInput("")}>
                  ✕
                </div>
              )}
            </div>
            
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="h-[50px] px-5 rounded-[24px] border border-white text-white font-['Poppins'] text-[14px] lg:text-[16px] font-medium flex items-center justify-center gap-2 transition-all whitespace-nowrap"
                style={{ background: "linear-gradient(90deg, #3D1768 0%, #030303 100%)" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="white" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* "Find collaborator" button row */}
      <div className="relative w-full h-[100px] flex justify-center items-center">
        <div className="hidden md:block absolute top-[50px] left-0 w-[50%] h-[2px] bg-gradient-to-r from-[#3D1768] to-[#030303]" />
        <div className="hidden md:block absolute top-[50px] right-0 w-[50%] h-[2px] bg-gradient-to-l from-[#3D1768] to-[#030303]" />
        <div className="hidden md:block absolute top-[50px] left-1/2 -translate-x-1/2 w-[90%] max-w-[500px] h-[40px] bg-white rounded-b-full border-b-[2px] border-l-[2px] border-r-[2px] border-t-0 border-[#3D1768] shadow-[0px_8px_18px_rgba(0,0,0,0.25)]" />
        <div className="md:hidden absolute top-1/2 -translate-y-1/2 left-0 w-[45%] h-[1px] bg-gradient-to-r from-[#3D1768] to-[#030303]" />
        <div className="md:hidden absolute top-1/2 -translate-y-1/2 right-0 w-[45%] h-[1px] bg-gradient-to-l from-[#3D1768] to-[#030303]" />

        {/* Mobile find button */}
        <div className="md:hidden relative z-10 w-[180px] h-[44px] bg-white rounded-full p-[4px] shadow-[0px_4px_10px_rgba(0,0,0,0.25)] flex items-center justify-center">
          <button
            className="w-full h-full rounded-full text-[15px] font-['PT_Serif'] text-white font-normal flex items-center justify-center"
            style={{ background: "linear-gradient(90deg,#3D1768 0%,#030303 100%)" }}
          >
            Find collaborator
          </button>
        </div>

        {/* Desktop find button */}
        <button
          className="hidden md:flex absolute top-[15px] left-1/2 -translate-x-1/2 w-[80%] max-w-[450px] h-[60px] lg:h-[70px] text-[24px] lg:text-[32px] shadow-[0px_5px_10px_#757575] rounded-full border border-white font-['PT_Serif'] text-white font-normal cursor-pointer items-center justify-center"
          style={{ background: "linear-gradient(90deg,#3D1768 0%,#030303 100%)" }}
        >
          Find collaborator
        </button>
      </div>

      {/* Results section */}
      <>
        {/* Mobile: title */}
        <div id="collaborators-title-mobile" className="md:hidden w-full text-center text-[rgba(61,23,104,1)] font-['PT_Serif'] font-semibold text-[15px] leading-[30px] mt-6 mb-3 px-4">
          {hasSearched ? "Result of profile which matches for you" : "All Collaborators"}
        </div>

        {/* Mobile grid */}
        <div className="md:hidden flex flex-col items-center gap-5 px-4 mb-6">
          {loading ? (
            <div className="text-center py-10 text-lg font-bold text-[#3D1768]">Loading...</div>
          ) : collaborators.length === 0 ? (
            <div className="text-center py-10 text-base text-red-500">No collaborators found.</div>
          ) : (
            visibleUsers.map((u) => <ProfileCard key={u.id || u.user_id} u={u} />)
          )}
        </div>
        <div className="md:hidden"><Pagination /></div>
        

        {/* Desktop grid */}
        <div className="hidden md:block px-6 lg:px-12 xl:px-[78px] mt-8 pb-16">
          <div className="max-w-8xl mx-auto">
            <h2 id="collaborators-title-desktop" className="text-center text-[rgba(61,23,104,1)] font-['PT_Serif_Caption'] font-normal text-[28px] lg:text-[34px] leading-[60px] mb-4">
              {hasSearched ? "Result of profile which matches for you" : "All Collaborators"}
            </h2>

            {loading ? (
              <div className="text-center py-20 text-xl font-bold text-[#3D1768]">Loading...</div>
            ) : collaborators.length === 0 ? (
              <div className="text-center py-20 text-xl text-red-500">No collaborators found.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 justify-items-center">
                {visibleUsers.map((u) => <ProfileCard key={u.id || u.user_id} u={u} />)}
              </div>
            )}

            <div className="hidden md:block">
              <Pagination />
            </div>
          </div>
        </div>
        <style>
          {`
            .custom-scrollbar-dropdown::-webkit-scrollbar {
              width: 4px;
            }

            .custom-scrollbar-dropdown::-webkit-scrollbar-track {
              background: rgba(128, 90, 213, 0.2);
              border-radius: 10px;
              margin-block: 4px;
            }

            .custom-scrollbar-dropdown::-webkit-scrollbar-thumb {
              background: linear-gradient(135deg, #8B5CF6, #6D28D9);
              border-radius: 10px;
            }

            .custom-scrollbar-dropdown::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(135deg, #A78BFA, #7C3AED);
            }

            .custom-scrollbar-dropdown {
              scrollbar-width: thin;
              scrollbar-color: #8B5CF6 rgba(128, 90, 213, 0.2);
            }

            .custom-scrollbar-dropdown {
              -ms-overflow-style: -ms-autohiding-scrollbar;
            }
            
            .custom-scrollbar-dropdown {
              scroll-behavior: smooth;
            }
          `}
        </style>
      </>

      {/* Footer */}
      <Footer />
    </div>
  );
}