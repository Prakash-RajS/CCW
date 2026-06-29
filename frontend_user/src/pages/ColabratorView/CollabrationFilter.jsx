import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from '../../contexts/UserContext';
import api from "../../utils/axiosConfig";
import HomeBg from "../../assets/AfterSign/HomeBg.png";
import Footer from "../../component/Footer";
import USAFlag from "../../assets/AfterSign/Usa.png";
import ColHeader from "../../component/ColHeader";
import toast from "../../component/Toast";
import ReactCountryFlag from "react-country-flag"; // ✅ ADD THIS IMPORT

// ─── Country list ─────────────────────────────────────────────────────────────
const getFallbackCountries = () => {
  return [
    { value: "Afghanistan", label: "Afghanistan" },
    { value: "Albania", label: "Albania" },
    { value: "Algeria", label: "Algeria" },
    { value: "Andorra", label: "Andorra" },
    { value: "Angola", label: "Angola" },
    { value: "Argentina", label: "Argentina" },
    { value: "Armenia", label: "Armenia" },
    { value: "Australia", label: "Australia" },
    { value: "Austria", label: "Austria" },
    { value: "Azerbaijan", label: "Azerbaijan" },
    { value: "Bahamas", label: "Bahamas" },
    { value: "Bahrain", label: "Bahrain" },
    { value: "Bangladesh", label: "Bangladesh" },
    { value: "Barbados", label: "Barbados" },
    { value: "Belarus", label: "Belarus" },
    { value: "Belgium", label: "Belgium" },
    { value: "Belize", label: "Belize" },
    { value: "Benin", label: "Benin" },
    { value: "Bhutan", label: "Bhutan" },
    { value: "Bolivia", label: "Bolivia" },
    { value: "Bosnia and Herzegovina", label: "Bosnia and Herzegovina" },
    { value: "Botswana", label: "Botswana" },
    { value: "Brazil", label: "Brazil" },
    { value: "Brunei", label: "Brunei" },
    { value: "Bulgaria", label: "Bulgaria" },
    { value: "Burkina Faso", label: "Burkina Faso" },
    { value: "Burundi", label: "Burundi" },
    { value: "Cambodia", label: "Cambodia" },
    { value: "Cameroon", label: "Cameroon" },
    { value: "Canada", label: "Canada" },
    { value: "Cape Verde", label: "Cape Verde" },
    { value: "Central African Republic", label: "Central African Republic" },
    { value: "Chad", label: "Chad" },
    { value: "Chile", label: "Chile" },
    { value: "China", label: "China" },
    { value: "Colombia", label: "Colombia" },
    { value: "Comoros", label: "Comoros" },
    { value: "Congo", label: "Congo" },
    { value: "Costa Rica", label: "Costa Rica" },
    { value: "Croatia", label: "Croatia" },
    { value: "Cuba", label: "Cuba" },
    { value: "Cyprus", label: "Cyprus" },
    { value: "Czech Republic", label: "Czech Republic" },
    { value: "Denmark", label: "Denmark" },
    { value: "Djibouti", label: "Djibouti" },
    { value: "Dominican Republic", label: "Dominican Republic" },
    { value: "Ecuador", label: "Ecuador" },
    { value: "Egypt", label: "Egypt" },
    { value: "El Salvador", label: "El Salvador" },
    { value: "Equatorial Guinea", label: "Equatorial Guinea" },
    { value: "Eritrea", label: "Eritrea" },
    { value: "Estonia", label: "Estonia" },
    { value: "Eswatini", label: "Eswatini" },
    { value: "Ethiopia", label: "Ethiopia" },
    { value: "Fiji", label: "Fiji" },
    { value: "Finland", label: "Finland" },
    { value: "France", label: "France" },
    { value: "Gabon", label: "Gabon" },
    { value: "Gambia", label: "Gambia" },
    { value: "Georgia", label: "Georgia" },
    { value: "Germany", label: "Germany" },
    { value: "Ghana", label: "Ghana" },
    { value: "Greece", label: "Greece" },
    { value: "Guatemala", label: "Guatemala" },
    { value: "Guinea", label: "Guinea" },
    { value: "Guyana", label: "Guyana" },
    { value: "Haiti", label: "Haiti" },
    { value: "Honduras", label: "Honduras" },
    { value: "Hungary", label: "Hungary" },
    { value: "Iceland", label: "Iceland" },
    { value: "India", label: "India" },
    { value: "Indonesia", label: "Indonesia" },
    { value: "Iran", label: "Iran" },
    { value: "Iraq", label: "Iraq" },
    { value: "Ireland", label: "Ireland" },
    { value: "Israel", label: "Israel" },
    { value: "Italy", label: "Italy" },
    { value: "Jamaica", label: "Jamaica" },
    { value: "Japan", label: "Japan" },
    { value: "Jordan", label: "Jordan" },
    { value: "Kazakhstan", label: "Kazakhstan" },
    { value: "Kenya", label: "Kenya" },
    { value: "Kuwait", label: "Kuwait" },
    { value: "Kyrgyzstan", label: "Kyrgyzstan" },
    { value: "Laos", label: "Laos" },
    { value: "Latvia", label: "Latvia" },
    { value: "Lebanon", label: "Lebanon" },
    { value: "Lesotho", label: "Lesotho" },
    { value: "Liberia", label: "Liberia" },
    { value: "Libya", label: "Libya" },
    { value: "Liechtenstein", label: "Liechtenstein" },
    { value: "Lithuania", label: "Lithuania" },
    { value: "Luxembourg", label: "Luxembourg" },
    { value: "Madagascar", label: "Madagascar" },
    { value: "Malawi", label: "Malawi" },
    { value: "Malaysia", label: "Malaysia" },
    { value: "Maldives", label: "Maldives" },
    { value: "Mali", label: "Mali" },
    { value: "Malta", label: "Malta" },
    { value: "Mauritania", label: "Mauritania" },
    { value: "Mauritius", label: "Mauritius" },
    { value: "Mexico", label: "Mexico" },
    { value: "Moldova", label: "Moldova" },
    { value: "Monaco", label: "Monaco" },
    { value: "Mongolia", label: "Mongolia" },
    { value: "Montenegro", label: "Montenegro" },
    { value: "Morocco", label: "Morocco" },
    { value: "Mozambique", label: "Mozambique" },
    { value: "Myanmar", label: "Myanmar" },
    { value: "Namibia", label: "Namibia" },
    { value: "Nepal", label: "Nepal" },
    { value: "Netherlands", label: "Netherlands" },
    { value: "New Zealand", label: "New Zealand" },
    { value: "Nicaragua", label: "Nicaragua" },
    { value: "Niger", label: "Niger" },
    { value: "Nigeria", label: "Nigeria" },
    { value: "North Korea", label: "North Korea" },
    { value: "North Macedonia", label: "North Macedonia" },
    { value: "Norway", label: "Norway" },
    { value: "Oman", label: "Oman" },
    { value: "Pakistan", label: "Pakistan" },
    { value: "Panama", label: "Panama" },
    { value: "Paraguay", label: "Paraguay" },
    { value: "Peru", label: "Peru" },
    { value: "Philippines", label: "Philippines" },
    { value: "Poland", label: "Poland" },
    { value: "Portugal", label: "Portugal" },
    { value: "Qatar", label: "Qatar" },
    { value: "Romania", label: "Romania" },
    { value: "Russia", label: "Russia" },
    { value: "Rwanda", label: "Rwanda" },
    { value: "Saudi Arabia", label: "Saudi Arabia" },
    { value: "Senegal", label: "Senegal" },
    { value: "Serbia", label: "Serbia" },
    { value: "Sierra Leone", label: "Sierra Leone" },
    { value: "Singapore", label: "Singapore" },
    { value: "Slovakia", label: "Slovakia" },
    { value: "Slovenia", label: "Slovenia" },
    { value: "Somalia", label: "Somalia" },
    { value: "South Africa", label: "South Africa" },
    { value: "South Korea", label: "South Korea" },
    { value: "South Sudan", label: "South Sudan" },
    { value: "Spain", label: "Spain" },
    { value: "Sri Lanka", label: "Sri Lanka" },
    { value: "Sudan", label: "Sudan" },
    { value: "Suriname", label: "Suriname" },
    { value: "Sweden", label: "Sweden" },
    { value: "Switzerland", label: "Switzerland" },
    { value: "Syria", label: "Syria" },
    { value: "Taiwan", label: "Taiwan" },
    { value: "Tajikistan", label: "Tajikistan" },
    { value: "Tanzania", label: "Tanzania" },
    { value: "Thailand", label: "Thailand" },
    { value: "Togo", label: "Togo" },
    { value: "Trinidad and Tobago", label: "Trinidad and Tobago" },
    { value: "Tunisia", label: "Tunisia" },
    { value: "Turkey", label: "Turkey" },
    { value: "Turkmenistan", label: "Turkmenistan" },
    { value: "Uganda", label: "Uganda" },
    { value: "Ukraine", label: "Ukraine" },
    { value: "United Arab Emirates", label: "United Arab Emirates" },
    { value: "United Kingdom", label: "United Kingdom" },
    { value: "United States", label: "United States" },
    { value: "Uruguay", label: "Uruguay" },
    { value: "Uzbekistan", label: "Uzbekistan" },
    { value: "Vatican City", label: "Vatican City" },
    { value: "Venezuela", label: "Venezuela" },
    { value: "Vietnam", label: "Vietnam" },
    { value: "Yemen", label: "Yemen" },
    { value: "Zambia", label: "Zambia" },
    { value: "Zimbabwe", label: "Zimbabwe" },
  ].sort((a, b) => a.label.localeCompare(b.label));
};

const fetchCountries = async () => {
  try {
    // Try a more reliable API first
    const response = await fetch("https://countriesnow.space/api/v0.1/countries/positions");
    if (!response.ok) throw new Error("Failed to fetch countries");
    const data = await response.json();
    if (data.data && Array.isArray(data.data)) {
      return data.data
        .map((c) => ({ value: c.name, label: c.name }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }
    throw new Error("Invalid data format");
  } catch (error) {
    console.warn("Failed to fetch countries from API, using fallback:", error);
    return getFallbackCountries();
  }
};
// ─── Filter Sidebar Component ────────────────────────────────────────────────
const FilterSidebar = ({
  pendingFilters,
  budgetErrors,
  availableSkills,
  loadingFilters,
  countryOptions,
  showLocationDropdown,
  setShowLocationDropdown,
  locationDropdownRef,
  onMinBudgetChange,
  onMaxBudgetChange,
  onSkillChange,
  onPendingFilterChange,
  onApplyFilters,
  onClearFilters,
  isMobile = false,
  onCloseMobile,
}) => {
  const filteredSkills = availableSkills.filter((s) =>
    s.toLowerCase().includes((pendingFilters.skillSearch || "").toLowerCase())
  );

  const filteredCountries = countryOptions.filter((c) =>
    c.label.toLowerCase().includes((pendingFilters.locationSearch || "").toLowerCase())
  );

  // Calculate the height of the dropdown content - REDUCED
  const getDropdownHeight = () => {
    if (!showLocationDropdown) return 0;
    const itemHeight = 36;
    const headerHeight = 50;
    const padding = 12;
    const maxHeight = 250;
    const calculatedHeight = Math.min(filteredCountries.length * itemHeight + headerHeight + padding, maxHeight);
    return calculatedHeight;
  };

  const dropdownHeight = getDropdownHeight();

  // For desktop, we use a wrapper with dynamic height
  const shouldShowSpacer = !isMobile && showLocationDropdown && filteredCountries.length > 0;

  const content = (
    <>
      <div className="flex items-center justify-between mb-4 lg:mb-5">
        <h3 className="font-semibold text-lg text-gray-800">Filters</h3>
        <button
          onClick={onClearFilters}
          className="text-[12px] text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-full transition-colors font-medium shadow-md cursor-pointer"
        >
          Clear All
        </button>
      </div>

      {/* Budget Range */}
      <div className="mb-5">
        <p className="font-semibold text-gray-700 mb-2.5 text-[13px] tracking-wide">Budget Range (₹)</p>
        <div className="flex flex-col gap-2.5">
          <div>
            <label className="text-xs text-gray-500 mb-1 block font-medium">Min Budget</label>
            <input
              type="number"
              placeholder="Min ₹"
              value={pendingFilters.minBudget}
              onChange={onMinBudgetChange}
              style={{ border: "1.5px solid #d1d5db", outline: "none" }}
              onFocus={e => e.target.style.border = "2px solid #51218F"}
              onBlur={e => e.target.style.border = "1.5px solid #d1d5db"}
              className="w-full px-3 py-2 text-sm rounded-lg bg-white text-gray-800 placeholder-gray-400 transition-colors"
            />
            {budgetErrors.min && (
              <p className="text-red-500 text-xs mt-1">{budgetErrors.min}</p>
            )}
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block font-medium">Max Budget</label>
            <input
              type="number"
              placeholder="Max ₹"
              value={pendingFilters.maxBudget}
              onChange={onMaxBudgetChange}
              style={{ border: "1.5px solid #d1d5db", outline: "none" }}
              onFocus={e => e.target.style.border = "2px solid #51218F"}
              onBlur={e => e.target.style.border = "1.5px solid #d1d5db"}
              className="w-full px-3 py-2 text-sm rounded-lg bg-white text-gray-800 placeholder-gray-400 transition-colors"
            />
            {budgetErrors.max && (
              <p className="text-red-500 text-xs mt-1">{budgetErrors.max}</p>
            )}
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #f3f4f6", marginBottom: "1.25rem" }} />

      {/* Skills */}
      <div className="mb-5">
        <p className="font-semibold text-gray-700 mb-2.5 text-[13px] tracking-wide">Skills</p>
        <input
          placeholder="Search skills..."
          value={pendingFilters.skillSearch}
          onChange={(e) => onPendingFilterChange("skillSearch", e.target.value)}
          style={{ border: "1.5px solid #d1d5db", outline: "none" }}
          onFocus={e => e.target.style.border = "2px solid #51218F"}
          onBlur={e => e.target.style.border = "1.5px solid #d1d5db"}
          className="w-full px-3 py-2 text-sm rounded-lg bg-white text-gray-800 placeholder-gray-400 mb-2.5 transition-colors"
        />
        <div className="max-h-44 overflow-y-auto pr-1">
          {loadingFilters ? (
            <div className="text-center py-4 text-gray-400 text-xs">Loading skills...</div>
          ) : filteredSkills.length === 0 ? (
            <p className="text-xs text-gray-400 py-2">No skills found</p>
          ) : (
            filteredSkills.slice(0, 20).map((skill) => (
              <label key={skill} className="flex items-center gap-3 mb-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[#51218F] cursor-pointer shrink-0"
                  checked={pendingFilters.selectedSkills.has(skill)}
                  onChange={(e) => onSkillChange(skill, e.target.checked)}
                />
                <span className="text-sm text-gray-600 group-hover:text-[#51218F] transition-colors">{skill}</span>
              </label>
            ))
          )}
        </div>
      </div>

      <div style={{ borderTop: "1px solid #f3f4f6", marginBottom: "1.25rem" }} />

      {/* Location */}
      <div className="mb-4" ref={locationDropdownRef}>
        <p className="font-semibold text-gray-700 mb-2.5 text-[13px] tracking-wide">Location</p>
        <div 
          className="relative transition-all duration-300 ease-in-out"
          style={{ 
            marginBottom: shouldShowSpacer ? `${dropdownHeight}px` : '0px'
          }}
        >
          <div
            style={{ border: "1.5px solid #d1d5db" }}
            className="w-full h-[40px] rounded-lg bg-white flex items-center px-3 cursor-pointer hover:border-[#51218F] transition-colors"
            onClick={() => setShowLocationDropdown((v) => !v)}
          >
            <span className={`flex-1 text-sm truncate ${pendingFilters.location ? "text-[#51218F] font-medium" : "text-gray-400"}`}>
              {pendingFilters.location || "Select country..."}
            </span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${showLocationDropdown ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {showLocationDropdown && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border-2 border-[#51218F] rounded-xl shadow-2xl z-[200] overflow-hidden">
              <div className="p-2 border-b border-gray-100 bg-white sticky top-0">
                <input
                  autoFocus
                  placeholder="Search country..."
                  value={pendingFilters.locationSearch}
                  onChange={(e) => onPendingFilterChange("locationSearch", e.target.value)}
                  style={{ border: "1.5px solid #e5e7eb", outline: "none", backgroundColor: "#f9fafb" }}
                  onFocus={e => e.target.style.border = "1.5px solid #51218F"}
                  onBlur={e => e.target.style.border = "1.5px solid #e5e7eb"}
                  className="w-full rounded-lg px-3 py-1.5 text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="max-h-40 overflow-y-auto">
                <div
                  className="px-4 py-2 text-sm text-gray-400 hover:bg-gray-50 cursor-pointer border-b border-gray-50"
                  onClick={() => {
                    onPendingFilterChange("location", "");
                    onPendingFilterChange("locationSearch", "");
                    setShowLocationDropdown(false);
                  }}
                >
                  — Any location —
                </div>
                {filteredCountries.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-gray-400 text-center">No results</div>
                ) : (
                  filteredCountries.map((c) => (
                    <div
                      key={c.value}
                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-purple-50 transition-colors ${
                        pendingFilters.location === c.value
                          ? "text-[#51218F] font-semibold bg-purple-50"
                          : "text-gray-700"
                      }`}
                      onClick={() => {
                        onPendingFilterChange("location", c.value);
                        onPendingFilterChange("locationSearch", "");
                        setShowLocationDropdown(false);
                      }}
                    >
                      {c.label}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Apply Button - ONLY show on desktop (not mobile) */}
      {!isMobile && (
        <button
          onClick={() => {
            onApplyFilters();
            if (isMobile && onCloseMobile) onCloseMobile();
          }}
          className="w-full py-2.5 bg-gradient-to-r from-[#381763] to-[#722FC9] text-white font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all text-sm shadow-md mt-1"
        >
          Apply Filters
        </button>
      )}
    </>
  );

  if (isMobile) {
    return <div className="flex flex-col h-full">{content}</div>;
  }

  return (
    <div className="bg-white rounded-2xl p-4 lg:p-5 shadow-[0_0_25px_rgba(0,0,0,0.3)] text-sm flex flex-col h-full">
      {content}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const CollabrationFilter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData } = useUser();

  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [savedJobs, setSavedJobs] = useState(new Set());
  const [likedJobs, setLikedJobs] = useState(new Set());

  const [sortOption, setSortOption] = useState("latest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedJobs, setExpandedJobs] = useState(new Set());

  const [pendingFilters, setPendingFilters] = useState({
    minBudget: "",
    maxBudget: "",
    skillSearch: "",
    selectedSkills: new Set(),
    location: "",
    locationSearch: "",
  });

  const [budgetErrors, setBudgetErrors] = useState({ min: "", max: "" });

  const [appliedFilters, setAppliedFilters] = useState({
    minBudget: "",
    maxBudget: "",
    selectedSkills: new Set(),
    location: "",
  });

  const [countryOptions, setCountryOptions] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locationDropdownRef = useRef(null);

  const sortOptions = [
    { value: "latest", label: "Latest" },
    { value: "oldest", label: "Oldest" },
    { value: "budget_high", label: "Budget: High to Low" },
    { value: "budget_low", label: "Budget: Low to High" },
    { value: "rating_high", label: "Rating: High to Low" },
  ];

  const toggleDescription = (jobId, e) => {
    e.stopPropagation();
    setExpandedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) newSet.delete(jobId);
      else newSet.add(jobId);
      return newSet;
    });
  };

  useEffect(() => {
    fetchCountries().then(setCountryOptions);
  }, []);

  useEffect(() => {
    if (location.state?.searchQuery) {
      setSearchQuery(location.state.searchQuery);
    }
  }, [location.state]);

  useEffect(() => {
    const load = async () => {
      setLoadingFilters(true);
      try {
        const res = await api.get("/collaborator/jobs/skills-list");
        if (res.data) setAvailableSkills(res.data);
      } catch (e) {
        console.error("Error fetching skills:", e);
      } finally {
        setLoadingFilters(false);
      }
    };
    load();
  }, []);
// Add this useEffect to lock body scroll when mobile filter is open
useEffect(() => {
  if (showMobileFilters) {
    // Prevent scrolling on body
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${window.scrollY}px`;
  } else {
    // Restore scrolling
    const scrollY = document.body.style.top;
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.top = '';
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
  }

  // Cleanup
  return () => {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.top = '';
  };
}, [showMobileFilters]);
  useEffect(() => {
    const handler = (e) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target)) {
        setShowLocationDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Recently";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffHours < 1) return "Recently";
      if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
      if (diffDays === 1) return "1 day ago";
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch { return "Recently"; }
  };

  const formatBudget = (job) => {
    if (job.budget_from && job.budget_from > 0) return `₹${job.budget_from}`;
    if (job.budget_to && job.budget_to > 0) return `₹${job.budget_to}`;
    return "₹0";
  };

  const formatMeta = (job) => {
    const budget = formatBudget(job);
    return `Fixed-price - ${job.expertise_level || "Intermediate"} - Est. Budget: ${budget} - Posted ${formatTimeAgo(job.created_at)}`;
  };

  const getDisplayDescription = (job, isExpanded) => {
    if (!job.full_description) return "No description available";
    if (isExpanded || job.full_description.length <= 150) return job.full_description;
    return `${job.full_description.substring(0, 150)}...`;
  };

 const CountryFlag = ({ countryCode, country }) => {
  if (!countryCode) {
    return (
      <div className="w-[18px] h-[12px] bg-gray-200 rounded-[4px] flex-shrink-0" />
    );
  }
  return (
    <ReactCountryFlag
      countryCode={countryCode}
      svg
      style={{
        width: "18px",
        height: "12px",
        borderRadius: "4px",
        display: "block",
        flexShrink: 0,
      }}
      title={country || ""}
    />
  );
};

  const fetchFilteredJobs = useCallback(async (filters = appliedFilters, sort = sortOption, search = searchQuery) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (filters.minBudget) params.append("min_budget", filters.minBudget);
      if (filters.maxBudget) params.append("max_budget", filters.maxBudget);
      if (filters.location) params.append("location", filters.location);
      if (filters.selectedSkills.size > 0) {
        params.append("skills", Array.from(filters.selectedSkills).join(","));
      }
      params.append("sort_by", sort);
      if (userData?.id) params.append("user_id", userData.id);

      const response = await api.get(`/collaborator/jobs/filter?${params.toString()}`);

      const jobsWithDetails = response.data.map((job) => ({
        ...job,
        meta: formatMeta(job),
        full_description: job.description || "No description available",
        posted_at: job.created_at,
        budget_display: formatBudget(job),
        locationDisplay: job.creator_state && job.creator_state !== job.creator_country
          ? `${job.creator_state}, ${job.creator_country}`
          : job.creator_country || "Remote",
      }));

      setJobs(jobsWithDetails);
      setFilteredJobs(jobsWithDetails);
      setCurrentPage(1);
      setExpandedJobs(new Set());
    } catch (error) {
      console.error("Error fetching filtered jobs:", error);
      toast.error("Failed to load jobs");
      setJobs([]);
      setFilteredJobs([]);
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchFilteredJobs(appliedFilters, sortOption, searchQuery);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, sortOption, appliedFilters, fetchFilteredJobs]);

  useEffect(() => {
    if (!userData?.id) return;
    api.get(`/collaborator/jobs/saved/${userData.id}`)
      .then((res) => {
        if (res.data?.length) setSavedJobs(new Set(res.data.map((j) => j.id)));
      })
      .catch(console.error);
    api.get(`/jobs/liked-jobs/${userData.id}/`)
      .then((res) => {
        if (res.data.status === "success") setLikedJobs(new Set(res.data.liked_jobs || []));
      })
      .catch(console.error);
  }, [userData]);

  const validateBudget = (min, max) => {
    const errors = { min: "", max: "" };
    if (min !== "" && (isNaN(min) || Number(min) < 0)) errors.min = "Budget cannot be negative";
    if (max !== "" && (isNaN(max) || Number(max) < 0)) errors.max = "Budget cannot be negative";
    if (min !== "" && max !== "" && Number(min) > Number(max)) errors.max = "Max budget must be ≥ min budget";
    return errors;
  };

  const handleMinBudgetChange = useCallback((e) => {
    const val = e.target.value;
    setPendingFilters((prev) => ({ ...prev, minBudget: val }));
    setBudgetErrors((prev) => ({ ...prev, ...validateBudget(val, pendingFilters.maxBudget) }));
  }, [pendingFilters.maxBudget]);

  const handleMaxBudgetChange = useCallback((e) => {
    const val = e.target.value;
    setPendingFilters((prev) => ({ ...prev, maxBudget: val }));
    setBudgetErrors((prev) => ({ ...prev, ...validateBudget(pendingFilters.minBudget, val) }));
  }, [pendingFilters.minBudget]);

  const handleSkillChange = useCallback((skill, checked) => {
    setPendingFilters((prev) => {
      const s = new Set(prev.selectedSkills);
      checked ? s.add(skill) : s.delete(skill);
      return { ...prev, selectedSkills: s };
    });
  }, []);

  const handlePendingFilterChange = useCallback((key, value) => {
    setPendingFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    const errs = validateBudget(pendingFilters.minBudget, pendingFilters.maxBudget);
    setBudgetErrors(errs);
    if (errs.min || errs.max) return;
    const newApplied = {
      minBudget: pendingFilters.minBudget,
      maxBudget: pendingFilters.maxBudget,
      selectedSkills: new Set(pendingFilters.selectedSkills),
      location: pendingFilters.location,
    };
    setAppliedFilters(newApplied);
    fetchFilteredJobs(newApplied, sortOption, searchQuery);
    setShowMobileFilters(false);
  }, [pendingFilters, sortOption, searchQuery, fetchFilteredJobs]);

  const clearFilters = useCallback(() => {
    const empty = {
      minBudget: "",
      maxBudget: "",
      selectedSkills: new Set(),
      location: "",
      skillSearch: "",
      locationSearch: "",
    };
    setPendingFilters(empty);
    setBudgetErrors({ min: "", max: "" });
    const emptyApplied = { minBudget: "", maxBudget: "", selectedSkills: new Set(), location: "" };
    setAppliedFilters(emptyApplied);
    setSortOption("latest");
    fetchFilteredJobs(emptyApplied, "latest", searchQuery);
    setShowMobileFilters(false);
    toast.success("Filters cleared");
  }, [searchQuery, fetchFilteredJobs]);

  const hasActiveFilters = () =>
    appliedFilters.minBudget !== "" ||
    appliedFilters.maxBudget !== "" ||
    appliedFilters.selectedSkills.size > 0 ||
    appliedFilters.location !== "";

  const handleSaveJob = async (jobId, e) => {
    e.stopPropagation();
    if (!userData?.id) { toast.error("Please login to save jobs"); return; }
    try {
      const res = await api.post("/collaborator/jobs/toggle-save", null, {
        params: { user_id: userData.id, job_id: jobId },
      });
      if (res.data.status === "saved") {
        setSavedJobs((prev) => new Set([...prev, jobId]));
        toast.success("Job saved successfully");
      } else {
        setSavedJobs((prev) => { const s = new Set(prev); s.delete(jobId); return s; });
        toast.info("Job removed from saved");
      }
    } catch { toast.error("Failed to save job"); }
  };

  const handleLikeJob = async (jobId, e) => {
    e.stopPropagation();
    if (!userData?.id) { toast.error("Please login to like jobs"); return; }
    const wasLiked = likedJobs.has(jobId);
    setLikedJobs((prev) => {
      const s = new Set(prev);
      wasLiked ? s.delete(jobId) : s.add(jobId);
      return s;
    });
    try {
      const res = await api.post(`/jobs/toggle-like/${userData.id}/${jobId}`);
      if (res.data.status === "success") {
        setLikedJobs(new Set(res.data.liked_jobs || []));
        res.data.action === "liked" ? toast.success("Job liked!") : toast.info("Job unliked");
      }
    } catch {
      setLikedJobs((prev) => {
        const s = new Set(prev);
        wasLiked ? s.add(jobId) : s.delete(jobId);
        return s;
      });
      toast.error("Failed to like job");
    }
  };

  const handleTrackView = async (jobId) => {
    if (!userData?.id) return;
    try {
      await api.post("/collaborator/jobs/track-view", null, {
        params: { user_id: userData.id, job_id: jobId },
      });
    } catch { /* silent */ }
  };

  const handleJobClick = (jobId) => {
    handleTrackView(jobId);
    navigate("/ux", { state: { jobId } });
  };

  const handleSortChange = (option) => {
    setSortOption(option);
    setShowSortDropdown(false);
  };

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const sidebarProps = {
    pendingFilters,
    budgetErrors,
    availableSkills,
    loadingFilters,
    countryOptions,
    showLocationDropdown,
    setShowLocationDropdown,
    locationDropdownRef,
    onMinBudgetChange: handleMinBudgetChange,
    onMaxBudgetChange: handleMaxBudgetChange,
    onSkillChange: handleSkillChange,
    onPendingFilterChange: handlePendingFilterChange,
    onApplyFilters: handleApplyFilters,
    onClearFilters: clearFilters,
  };

  return (
    <div className="w-full min-h-screen overflow-x-hidden ">
      <div className="absolute top-0 left-0 w-full z-50">
        <ColHeader />
      </div>

      {/* HERO SECTION */}
      <section className="relative w-full min-h-[380px] sm:min-h-[420px] lg:min-h-[480px] pb-8">
        {/* Background - extends full height */}
        <div
          className="absolute  left-0 w-full h-[calc(100%+104px)] z-0"
          style={{
            backgroundImage: `url(${HomeBg})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center bottom", // Anchors at bottom
            backgroundSize: "cover",
          }}
        >
          <div className="absolute inset-0 bg-black opacity-30" />

        </div>

       <div className="relative z-10 max-w-[1200px] 2xl:max-w-[2000px] mx-auto px-4 sm:px-6 pt-28 sm:pt-32 lg:pt-56">
          {/* BACK BUTTON */}
          <div className="mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-[#51218F] hover:text-[#3d1768] transition-colors group"
            >
              <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-[#51218F] to-[#2a0e4a] group-hover:from-[#3d1768] group-hover:to-[#1a0830] transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </div>
              <span className="font-medium text-sm sm:text-base text-white">Back</span>
            </button>
          </div>

          {/* SEARCH BAR */}
          <div className="flex items-center bg-white shadow-lg mb-4 rounded-lg overflow-hidden">
            <input
              placeholder="Search Jobs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && fetchFilteredJobs(appliedFilters, sortOption, searchQuery)}
              className="flex-1 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base text-black placeholder-gray-400 outline-none rounded-l-lg"
            />
            <button
              onClick={() => fetchFilteredJobs(appliedFilters, sortOption, searchQuery)}
              className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base font-medium text-white flex items-center justify-center gap-2 rounded-r-lg bg-gradient-to-r from-[#381763] to-[#722FC9] shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
              </svg>
              <span className="hidden xs:inline">Search</span>
            </button>
          </div>

          {/* RESULTS COUNT + SORT + FILTER BUTTONS */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Results count */}
            <div className="text-white">
              <span className="text-sm sm:text-base font-medium">Top results</span>
              <span className="text-xs sm:text-sm opacity-70 ml-2">
                ({filteredJobs.length} results)
              </span>
            </div>

            {/* Action buttons group */}
            <div className="flex items-center gap-2">
              {/* FILTER BUTTON - ONLY ON MOBILE (hidden on lg and above) */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-purple-600 rounded-full hover:bg-purple-700 transition shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <span>Filter</span>
                {hasActiveFilters() && (
                  <span className="ml-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    !
                  </span>
                )}
              </button>

              {/* SORT DROPDOWN - Visible on all screens */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-transparent rounded-full ring-1 ring-white/70 hover:bg-white/10 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  <span className="hidden xs:inline">Sort:</span>
                  <span>{sortOptions.find((o) => o.value === sortOption)?.label || "Latest"}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`w-3 h-3 transition-transform ${showSortDropdown ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showSortDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-36 sm:w-40 bg-white rounded-lg shadow-xl z-50 py-1">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSortChange(option.value)}
                        className={`w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 transition ${sortOption === option.value ? "text-purple-600 font-semibold bg-purple-50" : "text-gray-700"
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="relative bg-gray-50 pt-6 pb-12">
        <div className="max-w-[2200px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-6">

            {/* LEFT FILTER – Desktop only */}
            <div className="hidden lg:block w-[280px] shrink-0 self-start sticky top-6">
              <FilterSidebar {...sidebarProps} isMobile={false} />
            </div>

            {/* RIGHT RESULTS */}
            <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.2)] p-4 sm:p-6">
                {loading ? (
                  <div className="flex flex-col justify-center items-center py-16 gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-[#51218F]"></div>
                    <p className="text-sm text-gray-400">Loading jobs...</p>
                  </div>
                ) : filteredJobs.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-base font-semibold text-gray-600 mb-1">No Jobs Found</h3>
                    <p className="text-sm text-gray-400 mb-4">Try adjusting your filters or search criteria.</p>
                    {hasActiveFilters() && (
                      <button onClick={clearFilters} className="px-5 py-2 bg-[#51218F] text-white rounded-lg hover:bg-[#3d1768] transition text-sm font-medium">
                        Clear Filters
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 lg:space-y-5">
                      {currentJobs.map((job, index) => {
                        const isExpanded = expandedJobs.has(job.id);
                        const displayDescription = getDisplayDescription(job, isExpanded);
                        const needsMoreButton = job.full_description && job.full_description.length > 150;
                        
                        return (
                          <div
                            key={job.id || index}
                            className={`relative ${index !== currentJobs.length - 1 ? "border-b border-gray-200 pb-6 mb-6" : ""} cursor-pointer`}
                            onClick={() => handleJobClick(job.id)}
                          >
                            {/* Job content */}
                            <div className="pr-20 sm:pr-28">
                              <h3 className="font-semibold text-base sm:text-lg mb-1.5 text-[#2A1E17]">{job.title}</h3>
                              <p className="text-xs sm:text-sm text-gray-500 mb-2">{job.meta}</p>
                              
                              {/* Description with More/Less */}
                              <div className="mb-2">
                                <p className="text-sm sm:text-base text-gray-600 leading-relaxed break-words">
                                  {displayDescription}
                                </p>
                                {needsMoreButton && (
                                  <button
                                    onClick={(e) => toggleDescription(job.id, e)}
                                    className="text-[#51218F] font-medium text-xs sm:text-sm hover:underline mt-1 inline-block"
                                  >
                                    {isExpanded ? "Show less" : "Read more"}
                                  </button>
                                )}
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm text-gray-500">
                                <span className="text-[#4B1D8C] font-medium">₹ Fixed Price</span>
                                <span className="text-yellow-500 text-xs sm:text-sm">
                                  {"★".repeat(Math.floor(job.creator_rating || 0))}
                                  {"☆".repeat(5 - Math.floor(job.creator_rating || 0))}
                                </span>
                                <span>
                                  {(job.creator_rating || 0).toFixed(1)}/5 ({job.creator_reviews_count || 0} reviews)
                                </span>
                                
<div className="flex items-center gap-1">
  {job.creator_country && job.creator_country !== "Remote" && job.creator_country_code ? (
    <CountryFlag 
      countryCode={job.creator_country_code} 
      country={job.creator_country} 
    />
  ) : (
    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )}
  <span className="text-xs sm:text-sm text-gray-500 truncate max-w-[120px] sm:max-w-[150px]">
    {job.locationDisplay || "Remote"}
  </span>
</div>
                              </div>
                            </div>

                            {/* Action buttons - Fixed position on the right */}
                            <div
                              className="absolute top-0 right-0 flex flex-col gap-2 sm:flex-row sm:gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Save Button */}
                              <div
                                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 group shadow-md"
                                style={{ backgroundColor: savedJobs.has(job.id) ? "#FF0000" : "#E5E7EB" }}
                                onClick={(e) => handleSaveJob(job.id, e)}
                              >
                                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill={savedJobs.has(job.id) ? "white" : "none"} stroke={savedJobs.has(job.id) ? "white" : "#51218F"} strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden sm:block">
                                  {savedJobs.has(job.id) ? "Remove" : "Save"}
                                </span>
                              </div>

                              {/* Like Button */}
                              <div
                                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 group shadow-md"
                                style={{ backgroundColor: likedJobs.has(job.id) ? "#51218F" : "#E5E7EB" }}
                                onClick={(e) => handleLikeJob(job.id, e)}
                              >
                                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill={likedJobs.has(job.id) ? "white" : "none"} stroke={likedJobs.has(job.id) ? "white" : "#51218F"} strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                </svg>
                                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden sm:block">
                                  {likedJobs.has(job.id) ? "Unlike" : "Like"}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-1.5 mt-6 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            currentPage === 1 ? "bg-gray-100 text-gray-300 cursor-not-allowed" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          ← Prev
                        </button>
                        <span className="text-sm text-gray-500 mx-2">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            currentPage === totalPages ? "bg-gray-100 text-gray-300 cursor-not-allowed" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          Next →
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MOBILE FILTER SIDEBAR - SLIDE-IN POPUP (only visible on mobile) */}
      {showMobileFilters && (
  <>
    <div
      className="fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity duration-300"
      onClick={() => setShowMobileFilters(false)}
    />
    <div className="fixed right-0 top-0 h-full w-[85%] max-w-[360px] bg-white z-50 lg:hidden shadow-2xl flex flex-col animate-slide-in">
      {/* Header - Sticky at top */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3.5 flex items-center justify-between z-10 shrink-0">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Filters</h2>
          <p className="text-xs text-gray-400">Narrow your job search</p>
        </div>
        <button
          onClick={() => setShowMobileFilters(false)}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scrollable Content Area - Takes remaining space */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <FilterSidebar 
          {...sidebarProps} 
          isMobile={true} 
          onCloseMobile={() => setShowMobileFilters(false)} 
        />
      </div>

      {/* Button - Fixed at bottom */}
      <div className="shrink-0 p-4 border-t border-gray-100 bg-white">
        <button
          onClick={() => {
            onApplyFilters();
            if (isMobile && onCloseMobile) onCloseMobile();
          }}
          className="w-full py-3 bg-gradient-to-r from-[#381763] to-[#722FC9] text-white font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all text-sm shadow-md"
        >
          Apply Filters
        </button>
      </div>
    </div>
  </>
)}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>

      <div className="-mx-4">
        <Footer />
      </div>
    </div>
  );
};

export default CollabrationFilter;