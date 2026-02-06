import  { useState, useEffect } from "react";
import TopBanner from "../../assets/Colabwork/banner.png";
import DefaultProfilePic from "../../assets/Colabwork/Rectangle71.png";
import FlagImg from "../../assets/Colabwork/usa-flag.png";
import ReviewUser1 from "../../assets/Colabwork/review-user-1.png";
import ReviewUser2 from "../../assets/Colabwork/review-user-2.png";
import EditIcon from "../../assets/Colabwork/edit-icon.png"; 
import Header from "../../component/Header";
import Footer from "../../component/Footer";
import { useUser } from "../../contexts/UserContext";
import api from "../../utils/axiosConfig";

export default function creatoreditprofile() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [MyProjectValue, setMyProjectValue] = useState("My Project");
  const [editOpen, setEditOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [fileName, setFileName] = useState("No file chosen");
  const [showEdit, setShowEdit] = useState(false);
  const [editingPortfolioItem, setEditingPortfolioItem] = useState(null);
  const allSkills = [ "User Interface Design", "Graphics Design", "Logo Design", "Animation", "Branding", ];
  const [selectedSkills, setSelectedSkills] = useState([ "User Interface Design", "Graphics Design", "Logo Design", "Animation", "Branding", "Graphics Design", "Logo Design", "Animation", "Branding", ]);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  
  // Profile states
  const [profileData, setProfileData] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  
  // Portfolio states
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userData } = useUser();

  // Reviews states
  const [reviewStats, setReviewStats] = useState({ avg_rating: 0, total_reviews: 0 });
  const [latestReviews, setLatestReviews] = useState([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);

  // Edit form state
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    description: '',
    state: '',
    country: '',
    profile_picture: null
  });

  const renderStars = (rating) => {
  const fullStars = Math.floor(rating); // 0-5
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <span className="flex items-center gap-[2px]">
      {/* Full stars */}
      {Array(fullStars)
        .fill(0)
        .map((_, i) => (
          <span key={`full-${i}`} className="text-[#5B2D8B] text-[16px]">
            ★
          </span>
        ))}

      {/* Half star */}
      {hasHalf && (
        <span className="text-[#5B2D8B] text-[16px]">
          ☆
        </span>
      )}

      {/* Empty stars */}
      {Array(emptyStars)
        .fill(0)
        .map((_, i) => (
          <span key={`empty-${i}`} className="text-[#E6E0EC] text-[16px]">
            ★
          </span>
        ))}
    </span>
  );
};


  const toggleDropdown = (menu) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  // Fetch profile data
  const fetchProfileData = async () => {
    if (!userData?.id) return;
    
    try {
      setIsProfileLoading(true);
      const response = await api.get(`/creator/get/${userData.id}`);
      setProfileData(response.data);
      
      // Set edit form with existing data
      setEditForm({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        description: response.data.description || '',
        state: response.data.state || '',
        country: response.data.country || '',
        profile_picture: null
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfileData(null);
    } finally {
      setIsProfileLoading(false);
    }
  };

  // Fetch portfolio items
  const fetchPortfolioItems = async () => {
    if (!userData?.id) return;
    
    try {
      setIsLoading(true);
      const response = await api.get(`/portfolio/list/${userData.id}`);
      setPortfolioItems(response.data.portfolios);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      setPortfolioItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviewStats = async () => {
  if (!userData?.id) return;

  try {
    const res = await api.get(`/creator/review-stats/${userData.id}`);
    setReviewStats(res.data);
  } catch (err) {
    console.error("Error fetching review stats:", err);
    setReviewStats({ avg_rating: 0, total_reviews: 0 });
  }
};

const fetchLatestReviews = async () => {
  if (!userData?.id) return;

  try {
    setIsReviewsLoading(true);
    const res = await api.get(`/creator/review-latest/${userData.id}`);
    setLatestReviews(res.data.reviews || []);
  } catch (err) {
    console.error("Error fetching latest reviews:", err);
    setLatestReviews([]);
  } finally {
    setIsReviewsLoading(false);
  }
};


  useEffect(() => {
    if (userData?.id) {
      fetchProfileData();
      fetchPortfolioItems();
      fetchReviewStats();
      fetchLatestReviews();
    }
  }, [userData?.id]);

  // Edit profile function
  const handleEditProfile = async (formData) => {
    try {
      const data = new FormData();
      
      if (formData.first_name !== profileData?.first_name) {
        data.append('first_name', formData.first_name);
      }
      if (formData.last_name !== profileData?.last_name) {
        data.append('last_name', formData.last_name);
      }
      if (formData.description !== profileData?.description) {
        data.append('description', formData.description);
      }
      if (formData.state !== profileData?.state) {
        data.append('state', formData.state);
      }
      if (formData.country !== profileData?.country) {
        data.append('country', formData.country);
      }
      
      if (formData.profile_picture) {
        data.append('profile_picture', formData.profile_picture);
      }

      await api.put(`/creator/edit/${userData.id}`, data);
      
      fetchProfileData();
      setEditOpen(false);
    } catch (error) {
      console.error("Error editing profile:", error);
      alert("Failed to update profile");
    }
  };

  // Handle profile picture change
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditForm(prev => ({ ...prev, profile_picture: file }));
    }
  };

  // Add portfolio item
  const handleAddPortfolio = async (formData) => {
    try {
      if (!userData?.id) {
        alert("User not loaded yet");
        return;
      }

      if (!formData.title.trim()) {
        alert("Work name is required");
        return;
      }

      const data = new FormData();
      data.append("title", formData.title);
      data.append("media_link", formData.media_link || "");
      data.append("description", formData.description || "");

      if (formData.file) {
        data.append("portfolio_uploads", formData.file);
      }

      await api.post(`/portfolio/add/${userData.id}`, data);

      fetchPortfolioItems();
      setActiveModal(null);
      setPortfolioForm({ title: "", media_link: "", description: "", file: null });
      setFileName("No file chosen");
    } catch (error) {
      console.error("Error adding portfolio:", error.response?.data?.detail || error);
      alert("Failed to add portfolio item");
    }
  };

  // Edit portfolio item
  const handleEditPortfolio = async (formData) => {
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('media_link', formData.media_link || '');
      data.append('description', formData.description || '');
      
      if (formData.file) {
        data.append("portfolio_uploads", formData.file);
      }

      await api.put(`/portfolio/edit/${editingPortfolioItem.id}`, data);
      
      fetchPortfolioItems();
      setShowEdit(false);
      setEditingPortfolioItem(null);
      setEditPortfolioForm({ title: '', media_link: '', description: '', file: null });
    } catch (error) {
      console.error("Error editing portfolio:", error);
      alert("Failed to update portfolio item");
    }
  };

  // Delete portfolio item
  const handleDeletePortfolio = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this portfolio item?")) return;
    
    try {
      await api.delete(`/portfolio/delete/${itemId}`);
      fetchPortfolioItems();
      setShowEdit(false);
      setEditingPortfolioItem(null);
    } catch (error) {
      console.error("Error deleting portfolio:", error);
      alert("Failed to delete portfolio item");
    }
  };

  // Handle file selection
  const handleFileChange = (e, setFormData, setFileNameState) => {
    const file = e.target.files[0];
    if (file) {
      if (setFileNameState) {
        setFileNameState(file.name);
      }
      setFormData(prev => ({ ...prev, file }));
    }
  };

  // Portfolio form state
  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    media_link: '',
    description: '',
    file: null
  });

  const [editPortfolioForm, setEditPortfolioForm] = useState({
    title: '',
    media_link: '',
    description: '',
    file: null
  });

  // Open edit modal with item data
  const openEditModal = (item) => {
    setEditingPortfolioItem(item);
    setEditPortfolioForm({
      title: item.title,
      media_link: item.media_link || '',
      description: item.description || '',
      file: null
    });
    setShowEdit(true);
  };

  // Open portfolio item link
  const openPortfolioLink = (item) => {
    if (item.media_link) {
      window.open(item.media_link, '_blank');
    }
  };

  const flagUrl = profileData?.country_code
  ? `https://flagcdn.com/w40/${profileData.country_code.toLowerCase()}.png`
  : FlagImg;


  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    if (portfolioItems.length > 0) {
      setCurrentIndex((prevIndex) => 
        prevIndex === portfolioItems.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevSlide = () => {
    if (portfolioItems.length > 0) {
      setCurrentIndex((prevIndex) => 
        prevIndex === 0 ? portfolioItems.length - 1 : prevIndex - 1
      );
    }
  };

  return (
    <div className="relative w-full bg-[#F2F2F2] flex justify-center overflow-hidden">
      {/* MOBILE FRAME — ONLY FOR MOBILE */}
      <div className="w-full sm:max-w-none max-sm:w-full max-sm:bg-white max-sm:shadow-xl max-sm:overflow-hidden">
        {/* ======================= BANNER + HEADER ========================== */}
        <div className="relative w-full h-[582px] max-sm:h-[260px]">
          <img
            src={TopBanner}
            alt="banner"
            className="absolute inset-0 w-full h-full object-cover blur-[1px]"
          />
          {/* ================= HEADER ================= */}
          <div className="fixed top-0 left-0 w-full z-[9999] sm:absolute sm:top-[24px] sm:left-1/2 sm:-translate-x-1/2 sm:max-w-[1280px] sm:px-6">
            <div className="flex items-center justify-between text-white px-4 sm:px-0">
              <Header />
            </div>
          </div>
        </div>

        {/* RESPONSIVE SCALE WRAPPER */}
        <div className="origin-top transition-all duration-300 lg:scale-[0.88] xl:scale-100">
          {/* ======================= MAIN CONTENT ========================== */}
          <div className="max-w-[1280px] mx-auto mt-[-260px] max-sm:mt-[-60px] pb-24 relative z-10 max-sm:mt-[-140px] max-sm:px-3 max-sm:pb-10">
            {/* ===== PROFILE + VERIFICATION ===== */}
            <div className="grid grid-cols-[804px_392px] max-sm:grid-cols-1 max-sm:gap-5 xl:grid-cols-[804px_392px] lg:grid-cols-[680px_320px] max-sm:grid-cols-1 max-sm:gap-6 gap-[31px] lg:gap-[24px] xl:gap-[31px] mt-6">
              {/* ===== DESKTOP / LAPTOP PROFILE  ===== */}
              <div className="hidden sm:block">
                <div className="bg-white shadow-lg flex gap-6 w-[804px] lg:w-[680px] xl:w-[804px] h-[380px] rounded-[10px] p-6 mb-4 max-sm:flex-col max-sm:w-full max-sm:h-auto max-sm:ml-0 max-sm:p-4 max-sm:rounded-[14px]">
                  {/* LEFT IMAGE + DETAILS */}
                  <div className="flex flex-col items-start max-sm:flex-row max-sm:gap-4">
                    {isProfileLoading ? (
                      <div className="w-[218px] h-[219px] rounded-[9px] bg-gray-200 animate-pulse"></div>
                    ) : (
                      <img
                        src={profileData?.profile_picture || DefaultProfilePic}
                        alt="profile"
                        className="w-[218px] h-[219px] rounded-[9px] object-cover max-sm:w-[88px] max-sm:h-[88px] max-sm:rounded-full"
                      />
                    )}
                    
                    {/* LOCATION */}
                    <div className="flex items-center gap-2 mt-3">
                      <img
  src={flagUrl}
  alt="flag"
  className="w-[18px] h-[12px] object-cover rounded-sm"
/>

<span className="text-[14px] font-medium">
  {profileData?.state && profileData?.country
    ? `${profileData.state}, ${profileData.country}`
    : "Location not set"}
</span>

                    </div>

                    <div className="flex items-center gap-2 mt-2">
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="#000" strokeWidth="1.5" />
    <path d="M12 6v6l4 2" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
  </svg>

  <span className="text-[14px] font-medium">
    {profileData?.local_time
      ? `It's currently ${profileData.local_time} here`
      : "Time not available"}
  </span>
</div>

                    
                    {/* JOINED */}
                    <div className="flex items-center gap-2 mt-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="4" width="18" height="18" rx="2" stroke="#000" strokeWidth="1.5" />
                        <path d="M8 2v4M16 2v4M3 10h18" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      <span className="text-[14px] font-medium">
  {isProfileLoading
    ? "Loading..."
    : `Joined ${profileData?.joined_date || "December 5, 2020"}`}
</span>

                    </div>
                  </div>

                  {/* RIGHT CONTENT */}
                  <div className="flex-1 max-sm:w-full">
                    <div className="flex justify-between max-sm:flex-col max-sm:gap-2">
                      <div>
                        {isProfileLoading ? (
                          <div className="h-[32px] w-[200px] bg-gray-200 animate-pulse rounded mb-2"></div>
                        ) : (
                          <h2 className="text-[22px] font-semibold">
                            {profileData?.first_name && profileData?.last_name 
                              ? `${profileData.first_name} ${profileData.last_name}`
                              : "Pradeep"}
                          </h2>
                        )}
                        
                        {/* Creator Type and Primary Niche */}
                        {isProfileLoading ? (
                          <div className="h-[20px] w-[300px] bg-gray-200 animate-pulse rounded mb-2"></div>
                        ) : (
                          <p style={{ fontFamily: "Montserrat", fontWeight: 500, fontSize: "14px", color: "#2A1E1780" }}>
                            {profileData?.creator_type && profileData?.primary_niche
                              ? `${profileData.creator_type}, ${profileData.primary_niche}`
                              : profileData?.creator_type || profileData?.primary_niche || "User Experience Designer, Graphic Designer"}
                          </p>
                        )}
                        
                        {/* BADGES */}
                        <div className="flex gap-3 mt-2 flex-wrap max-sm:gap-2">
                          {/* RATING ONLY - REMOVED PROJECTS COUNT AND HOURLY RATE */}
                          <svg width="140" height="40" viewBox="0 0 140 40">
                            <path d="M10 3L12.7 9.5H19.5L14 13.8L16.2 20L10 16L3.8 20L6 13.8L0.5 9.5H7.3L10 3Z" fill="#5B2D8B"/>
                            <path d="M30 3L32.7 9.5H39.5L34 13.8L36.2 20L30 16L23.8 20L26 13.8L20.5 9.5H27.3L30 3Z" fill="#5B2D8B"/>
                            <path d="M50 3L52.7 9.5H59.5L54 13.8L56.2 20L50 16L43.8 20L46 13.8L40.5 9.5H47.3L50 3Z" fill="#5B2D8B"/>
                            <path d="M70 3L72.7 9.5H79.5L74 13.8L76.2 20L70 16L63.8 20L66 13.8L60.5 9.5H67.3L70 3Z" fill="#5B2D8B"/>
                            <path d="M90 3L92.7 9.5H99.5L94 13.8L96.2 20L90 16L83.8 20L86 13.8L80.5 9.5H87.3L90 3Z" fill="#E6E0EC"/>
                            <text x="10" y="35" fontSize="12" fill="#3A2A1A">
  {reviewStats.avg_rating}/5{" "}
  <tspan opacity="0.6">({reviewStats.total_reviews} Reviews)</tspan>
</text>

                          </svg>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setEditOpen(true)}
                        className="h-[29px] px-[6px] py-[20px] !border border-[#51218F] rounded-[100px] text-[#6A3EA1] text-[14px] font-semibold font-['Montserrat'] flex items-center justify-center gap-[10px] hover:bg-[#6A3EA1]/10 transition">
                        Edit Profile
                      </button>

                      {editOpen && (
                        <div className="fixed inset-0 z-[99999] flex items-start justify-center bg-black/40">
                          <div className="bg-white rounded-[16px] shadow-xl w-[700px] p-6 ">
                            {/* PROFILE PICTURE WITH EDIT ICON */}
                            <div className="flex flex-col items-center mb-6 relative">
                              <img
                                src={editForm.profile_picture ? URL.createObjectURL(editForm.profile_picture) : (profileData?.profile_picture || DefaultProfilePic)}
                                alt="profile"
                                className="w-[120px] h-[120px] rounded-full object-cover mb-2"
                              />
                              {/* EDIT PENCIL ICON */}
                              <label className="absolute bottom-4 right-1/3 w-8 h-8 bg-[#51218F] rounded-full flex items-center justify-center cursor-pointer hover:opacity-90 transition">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                </svg>
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*"
                                  onChange={handleProfilePicChange}
                                />
                              </label>
                            </div>

                            {/* FIRST NAME */}
                            <div className="mb-4">
                              <label className="block text-[14px] font-semibold mb-2">First Name</label>
                              <input 
                                type="text" 
                                value={editForm.first_name}
                                onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                                className="w-full !border border-gray-300 rounded-[12px] px-4 py-3 text-[16px] focus:outline-none" 
                              />
                            </div>

                            {/* LAST NAME */}
                            <div className="mb-4">
                              <label className="block text-[14px] font-semibold mb-2">Last Name</label>
                              <input 
                                type="text" 
                                value={editForm.last_name}
                                onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                                className="w-full !border border-gray-300 rounded-[12px] px-4 py-3 text-[16px] focus:outline-none" 
                              />
                            </div>

                            {/* LOCATION */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-[14px] font-semibold mb-2">State</label>
                                <input 
                                  type="text" 
                                  value={editForm.state}
                                  onChange={(e) => setEditForm({...editForm, state: e.target.value})}
                                  className="w-full !border border-gray-300 rounded-[12px] px-4 py-3 text-[16px] focus:outline-none" 
                                />
                              </div>
                              <div>
                                <label className="block text-[14px] font-semibold mb-2">Country</label>
                                <input 
                                  type="text" 
                                  value={editForm.country}
                                  onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                                  className="w-full !border border-gray-300 rounded-[12px] px-4 py-3 text-[16px] focus:outline-none" 
                                />
                              </div>
                            </div>

                            {/* DESCRIPTION */}
                            <div className="mb-8">
                              <label className="block text-[14px] font-semibold mb-2">Description</label>
                              <textarea 
                                rows={6}
                                value={editForm.description}
                                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                className="w-full !border border-gray-300 rounded-[12px] px-4 py-3 text-[14px] leading-[22px] focus:outline-none resize-none" 
                              />
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="flex gap-6">
                              <button 
                                onClick={() => handleEditProfile(editForm)}
                                className="bg-[#51218F] text-white px-12 py-3 rounded-full font-semibold hover:opacity-90 transition">
                                Save
                              </button>
                              <button 
                                onClick={() => {
                                  setEditOpen(false);
                                  setEditForm({
                                    first_name: profileData?.first_name || '',
                                    last_name: profileData?.last_name || '',
                                    description: profileData?.description || '',
                                    state: profileData?.state || '',
                                    country: profileData?.country || '',
                                    profile_picture: null
                                  });
                                }}
                                className="!border border-gray-400 px-12 py-3 rounded-full font-semibold hover:bg-gray-100 transition">
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* DESCRIPTION */}
                    {isProfileLoading ? (
                      <div className="mt-5 space-y-2">
                        <div className="h-[20px] w-full bg-gray-200 animate-pulse rounded"></div>
                        <div className="h-[20px] w-3/4 bg-gray-200 animate-pulse rounded"></div>
                        <div className="h-[20px] w-2/3 bg-gray-200 animate-pulse rounded"></div>
                      </div>
                    ) : (
                      <p className="mt-5 text-black text-[14px] leading-[22px] font-medium font-['Montserrat']">
                        {profileData?.description || "I have one year of experience in UI Design, during which I have worked on creating modern, user-friendly interfaces for both web and mobile applications. My work focuses on clean layouts, consistent visual styles, and intuitive user flows. I am skilled in using design tools such as Figma and Adobe XD, and I have experience designing dashboards, landing pages, mobile app screens, and component libraries. I always aim to blend creativity with usability, ensuring that every design delivers a smooth and engaging user experience."}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ===== MOBILE PROFILE ===== */}
              <div className="block sm:hidden bg-white rounded-[16px] shadow-lg p-4 mb-4">
                {/* TOP ROW */}
                <div className="flex gap-3">
                  {/* PROFILE IMAGE */}
                  {isProfileLoading ? (
                    <div className="w-[82px] h-[132px] rounded-2 bg-gray-200 animate-pulse"></div>
                  ) : (
                    <img 
                      src={profileData?.profile_picture || DefaultProfilePic} 
                      className="w-[82px] h-[132px] rounded-2 object-cover" 
                      alt="profile" 
                    />
                  )}
                  
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-3">
                      {isProfileLoading ? (
                        <div className="h-[24px] w-[120px] bg-gray-200 animate-pulse rounded"></div>
                      ) : (
                        <h3 className="text-[20px] font-semibold text-[#2A1E17]">
                          {profileData?.first_name && profileData?.last_name 
                            ? `${profileData.first_name} ${profileData.last_name}`
                            : "Pradeep"}
                        </h3>
                      )}
                      
                      {/* Edit profile Button */}
                      <button onClick={() => setEditOpen(true)} className="!border border-[#51218F] text-[#51218F] text-[15px] px-3 py-[3px] rounded-full">Edit Profile</button>
                    </div>
                    
                    {isProfileLoading ? (
                      <div className="h-[16px] w-[200px] bg-gray-200 animate-pulse rounded mt-2"></div>
                    ) : (
                      <p className="text-[12px] text-[#6B6B6B] leading-tight mt-[2px]">
                        {profileData?.creator_type && profileData?.primary_niche
                          ? `${profileData.creator_type}, ${profileData.primary_niche}`
                          : profileData?.creator_type || profileData?.primary_niche || "I am Looking for Designer, Graphic Designer"}
                      </p>
                    )}
                    
                    {/* ================= BADGES ================= */}
                    <div className="flex items-center gap-2 mt-1 text-[12px] text-[#3A2A1A]">
                      {/* RATING ONLY - REMOVED PROJECTS COUNT AND HOURLY RATE */}
                      <div className="flex flex-col leading-tight">
                        <span className="text-[#5B2D8B] text-[14px]">★★★★☆</span>
                        <span className="text-[#3A2A1A] opacity-60 text-[11px]">(12 Reviews)</span>
                      </div>
                    </div>

                    {/* ================= META INFO ================= */}
                    <div className="flex gap-3 mt-2 text-[11px] text-[#6B6B6B]">
                      <div className="flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="4" width="18" height="18" rx="2" stroke="#6B6B6B" strokeWidth="1.5" />
                          <path d="M8 2v4M16 2v4M3 10h18" stroke="#6B6B6B" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <span>
                          {isProfileLoading ? "Loading..." : 
                            profileData?.joined_date || "Joined December 5, 2020"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <img src={FlagImg} alt="flag" className="w-3 h-2" />
                        <span>
                          {isProfileLoading ? "Loading..." : 
                            (profileData?.state && profileData?.country ? 
                              `${profileData.state}, ${profileData.country}` : 
                              "Chicago, USA")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* DESCRIPTION */}
                {isProfileLoading ? (
                  <div className="mt-3 space-y-2">
                    <div className="h-[16px] w-full bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-[16px] w-4/5 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-[16px] w-3/4 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                ) : (
                  <p className="mt-3 text-[12px] leading-[18px] text-[#3A2A1A]">
                    {profileData?.description || "I have one year of experience in UI Design, during which I have worked on creating modern, user-friendly interfaces for both web and mobile applications. My work focuses on clean layouts, consistent visual styles, and intuitive user flows. I am skilled in using design tools such as Figma and Adobe XD, and I have experience designing dashboards, landing pages, mobile app screens, and component libraries."}
                  </p>
                )}
              </div>
              
              {/* MOBILE EDIT PROFILE MODAL */}
              {editOpen && (
                <div className="fixed inset-0 block sm:hidden z-[99999] flex items-center justify-center bg-black/40">
                  <div className="bg-white rounded-[16px] shadow-xl w-[90%] p-6 mt-20">
                    {/* PROFILE PICTURE WITH EDIT ICON */}
                    <div className="flex flex-col items-center mb-6 relative">
                      <img
                        src={editForm.profile_picture ? URL.createObjectURL(editForm.profile_picture) : (profileData?.profile_picture || DefaultProfilePic)}
                        alt="profile"
                        className="w-[100px] h-[100px] rounded-full object-cover mb-2"
                      />
                      {/* EDIT PENCIL ICON */}
                      <label className="absolute bottom-4 right-1/3 w-8 h-8 bg-[#51218F] rounded-full flex items-center justify-center cursor-pointer hover:opacity-90 transition">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleProfilePicChange}
                        />
                      </label>
                    </div>

                    {/* FIRST NAME */}
                    <div className="mb-4">
                      <label className="block text-[14px] font-semibold mb-2">First Name</label>
                      <input 
                        type="text" 
                        value={editForm.first_name}
                        onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                        className="w-full !border border-gray-300 rounded-[12px] px-4 py-3 text-[16px] focus:outline-none" 
                      />
                    </div>

                    {/* LAST NAME */}
                    <div className="mb-4">
                      <label className="block text-[14px] font-semibold mb-2">Last Name</label>
                      <input 
                        type="text" 
                        value={editForm.last_name}
                        onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                        className="w-full !border border-gray-300 rounded-[12px] px-4 py-3 text-[16px] focus:outline-none" 
                      />
                    </div>

                    {/* LOCATION */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-[14px] font-semibold mb-2">State</label>
                        <input 
                          type="text" 
                          value={editForm.state}
                          onChange={(e) => setEditForm({...editForm, state: e.target.value})}
                          className="w-full !border border-gray-300 rounded-[12px] px-4 py-3 text-[16px] focus:outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-[14px] font-semibold mb-2">Country</label>
                        <input 
                          type="text" 
                          value={editForm.country}
                          onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                          className="w-full !border border-gray-300 rounded-[12px] px-4 py-3 text-[16px] focus:outline-none" 
                        />
                      </div>
                    </div>

                    {/* DESCRIPTION */}
                    <div className="mb-6">
                      <label className="block text-[14px] font-semibold mb-2">Description</label>
                      <textarea 
                        rows={4}
                        value={editForm.description}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        className="w-full !border border-gray-300 rounded-[12px] px-4 py-3 text-[14px] leading-[20px] focus:outline-none resize-none" 
                      />
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-4">
                      <button 
                        onClick={() => handleEditProfile(editForm)}
                        className="flex-1 bg-[#51218F] text-white py-3 rounded-full font-semibold hover:opacity-90 transition">
                        Save
                      </button>
                      <button 
                        onClick={() => {
                          setEditOpen(false);
                          setEditForm({
                            first_name: profileData?.first_name || '',
                            last_name: profileData?.last_name || '',
                            description: profileData?.description || '',
                            state: profileData?.state || '',
                            country: profileData?.country || '',
                            profile_picture: null
                          });
                        }}
                        className="flex-1 !border border-gray-400 py-3 rounded-full font-semibold hover:bg-gray-100 transition">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT FIXED COLUMN */}
            <div className="absolute top-0 left-[835px] max-sm:static max-sm:w-full lg:left-[705px] xl:left-[835px] w-[392px] lg:w-[320px] xl:w-[392px] space-y-6 shrink-0">
              {/* VERIFICATION */}
              <div className="bg-white rounded-xl shadow p-6 w-full">
                <h4 className="text-[18px] font-semibold mb-3">Verification</h4>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <span className="text-[18px] text-[#3A2A1A] font-medium">Phone Verified</span>
                  </div>
                  <span className="text-[#6A3EA1] font-medium cursor-pointer">Verify</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-[18px] text-[#3A2A1A] font-medium">Email Verified</span>
                  </div>
                  <span className="text-[#6A3EA1] font-medium cursor-pointer">Verify</span>
                </div>
              </div>

              {/* SKILLS */}
              <div className="bg-white rounded-xl shadow p-5 w-full">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-[18px] font-semibold">Skills Required</h4>
                  <button onClick={() => setShowSkillsModal(true)} className="!border border-[#51218F] px-4 py-1 rounded-full text-[#51218F] text-[13px]">Edit Skills</button>
                </div>
                <div className="h-[1px] bg-black/10 my-4" />
                <ul className="space-y-4 text-[16px] font-medium">
                  <li>User Interface Design</li>
                  <li>Graphics Design</li>
                  <li>Logo Design</li>
                  <li>Animation</li>
                  <li>Branding</li>
                </ul>
                <p className="text-[#6A3EA1] mt-6 cursor-pointer text-sm">See more</p>
              </div>
            </div>

            {/* ================= TOP SKILLS POPUP ================= */}
            {showSkillsModal && (
              <>
                {/* ================= DESKTOP MODAL ================= */}
                <div className="hidden md:flex mb-[104%] fixed inset-0 z-[99999] bg-black/40 items-center justify-center">
                  <div className="relative bg-white w-[820px] rounded-[16px] p-10 shadow-2xl">
                    <h2 className="text-[22px] font-semibold mb-6">Top Skills</h2>
                    <div className="!border border-gray-300 rounded-[10px] p-4 flex items-center justify-between">
                      <div className="flex flex-wrap gap-3">
                        {["User Interface Design", "Graphics Design", "Logo Design", "Animation", "Branding"].map(skill => (
                          <span key={skill} className="px-4 py-[6px] bg-[#CFCFCF] rounded-full text-[13px] font-medium">{skill}</span>
                        ))}
                      </div>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M6 9l6 6 6-6" stroke="#5B2D8B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex gap-6 mt-8">
                      <button onClick={() => setShowSkillsModal(false)} className="bg-[#51218F] text-white px-14 py-3 rounded-full font-semibold">Save</button>
                      <button onClick={() => setShowSkillsModal(false)} className="!border border-black px-14 py-3 rounded-full font-semibold">Cancel</button>
                    </div>
                  </div>
                </div>

                {/* ================= MOBILE MODAL ================= */}
                <div className="md:hidden fixed bottom-100 inset-0 z-[99999] bg-black/40 flex items-end justify-center">
                  <div className="bg-white w-full rounded-t-[24px] p-6 shadow-2xl">
                    <h2 className="text-[20px] font-semibold mb-4 text-center">Top Skills</h2>
                    <div className="!border border-gray-300 rounded-[10px] p-4 flex flex-wrap gap-3 justify-center mb-6">
                      {["User Interface Design", "Graphics Design", "Logo Design", "Animation", "Branding"].map(skill => (
                        <span key={skill} className="px-4 py-[6px] bg-[#CFCFCF] rounded-full text-[13px] font-medium">{skill}</span>
                      ))}
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => setShowSkillsModal(false)} className="flex-1 bg-[#51218F] text-white py-3 rounded-full font-semibold">Save</button>
                      <button onClick={() => setShowSkillsModal(false)} className="flex-1 !border border-black py-3 rounded-full font-semibold">Cancel</button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ================= DESKTOP PORTFOLIO ================= */}
<div className="bg-white shadow-lg hidden lg:block w-[804px] lg:w-[680px] xl:w-[804px] h-[337px] rounded-[10px] p-6">
  {/* HEADER */}
  <div className="flex justify-between items-center">
    <h3 className="text-[18px] font-semibold text-[#3A2A1A]">My Portfolio</h3>
    <div className="flex items-center gap-[10px]">
      {/* ADD PORTFOLIO BUTTON */}
      <button onClick={() => setActiveModal("portfolio")} className="h-[29px] px-[36px] !border border-[#51218F] rounded-full text-[#6A3EA1]">Add Portfolio</button>
    </div>
  </div>

  {/* DIVIDER */}
  <div className="h-[1px] bg-black/10 my-4" />
  
  {/* PORTFOLIO GRID - CAROUSEL REMOVED */}
  {isLoading ? (
    <div className="col-span-3 text-center py-10">Loading portfolio...</div>
  ) : portfolioItems.length === 0 ? (
    <div className="col-span-3 text-center py-10 text-gray-500">No portfolio items yet. Add your first project!</div>
  ) : (
    <div className="grid grid-cols-3 gap-4">
      {portfolioItems.slice(0, 3).map((item) => (
        <div 
          key={item.id} 
          className="relative rounded-[10px] overflow-hidden cursor-pointer"
          onClick={() => openPortfolioLink(item)}
        >
          {item.file ? (
            <img src={item.file} className="h-[174px] w-full object-cover" alt={item.title} />
          ) : (
            <div className="h-[174px] w-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
          
          {/* ✏️ EDIT ICON */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(item);
            }}
            className="absolute top-3 right-3 w-[46px] h-[46px] rounded-full bg-gradient-to-br from-[#7C3AED] to-[#2B0F4C] flex items-center justify-center shadow-[0_10px_30px_rgba(124,58,237,0.45)] cursor-pointer hover:scale-105 transition z-10"
          >
            <img src={EditIcon} alt="edit" className="w-[42px] h-[42px] object-contain" />
          </div>

          {item.title && (
            <div className="ml-8 mt-4 w-[213px] h-[17px] bg-white rounded-[4px] flex items-center px-2">
              <p className="text-[12px] font-semibold text-[#000000] whitespace-nowrap truncate">
                {item.title}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )}
</div>

{/* ================= ADD PORTFOLIO MODAL ================= */}
{activeModal === "portfolio" && (
  <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 mb-280">
    <div className="bg-white w-[720px] rounded-[22px] p-10 shadow-xl relative">
      {/* ❌ Close Button */}
      <div onClick={() => {
        setActiveModal(null);
        setPortfolioForm({ title: '', media_link: '', description: '', file: null });
        setFileName("No file chosen");
      }} className="absolute top-6 right-6 cursor-pointer text-gray-500 hover:text-black text-xl">✕</div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-[24px] font-semibold">Add Portfolio</h2>
      </div>

      {/* Work Name */}
      <label className="block text-sm mb-2">Work Name</label>
      <input 
        className="w-full h-[44px] !border rounded-[10px] px-4 mb-5" 
        value={portfolioForm.title}
        onChange={(e) => setPortfolioForm({...portfolioForm, title: e.target.value})}
      />

      {/* Media File Label */}
      <label className="block text-sm mb-2">Media File</label>
      <div className="w-full h-[64px] !border rounded-[10px] flex items-center px-4 gap-4 mb-6">
        <label className="!border px-5 py-2 rounded-full cursor-pointer text-sm">
          Choose File
          <input type="file" className="hidden" onChange={(e) => handleFileChange(e, setPortfolioForm, setFileName)} />
        </label>
        <span className="text-gray-500 text-sm">{portfolioForm.file?.name || fileName}</span>
      </div>

      {/* Work Link */}
      <label className="block text-sm mb-2">Work Link</label>
      <input 
        className="w-full h-[44px] !border rounded-[10px] px-4 mb-5" 
        value={portfolioForm.media_link}
        onChange={(e) => setPortfolioForm({...portfolioForm, media_link: e.target.value})}
        placeholder="https://example.com"
      />

      {/* Work Description */}
      <label className="block text-sm mb-2">Work Description</label>
      <textarea 
        className="w-full h-[100px] !border rounded-[10px] px-4 py-3 mb-8" 
        value={portfolioForm.description}
        onChange={(e) => setPortfolioForm({...portfolioForm, description: e.target.value})}
      />

      {/* Buttons */}
      <div className="flex gap-6">
        <button onClick={() => handleAddPortfolio(portfolioForm)} className="bg-[#51218F] text-white px-14 py-3 rounded-full font-semibold">Save</button>
        <button onClick={() => {
          setActiveModal(null);
          setPortfolioForm({ title: '', media_link: '', description: '', file: null });
          setFileName("No file chosen");
        }} className="!border px-14 py-3 rounded-full font-semibold">Cancel</button>
      </div>
    </div>
  </div>
)}

{/* ================= EDIT PORTFOLIO MODAL ================= */}
{showEdit && editingPortfolioItem && (
  <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center mb-280 ">
    <div className="bg-white w-[720px] rounded-[22px] p-10 shadow-xl relative">
      {/* ❌ Close Button */}
      <div onClick={() => setShowEdit(false)} className="absolute top-6 right-6 cursor-pointer text-gray-500 hover:text-black text-xl">✕</div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-[24px] font-semibold">Edit Portfolio</h2>
      </div>

      {/* Work Name */}
      <label className="block text-sm mb-2">Work Name</label>
      <input 
        className="w-full h-[44px] !border rounded-[10px] px-4 mb-5" 
        value={editPortfolioForm.title}
        onChange={(e) => setEditPortfolioForm({...editPortfolioForm, title: e.target.value})}
      />

      {/* Media File Label */}
      <label className="block text-sm mb-2">Media File</label>
      <div className="w-full h-[64px] !border rounded-[10px] flex items-center px-4 gap-4 mb-6">
        <label className="!border px-5 py-2 rounded-full cursor-pointer text-sm">
          Choose File
          <input type="file" className="hidden" onChange={(e) => handleFileChange(e, setEditPortfolioForm)} />
        </label>
        <span className="text-gray-500 text-sm">{editPortfolioForm.file?.name || "No file chosen"}</span>
      </div>

      {/* Work Link */}
      <label className="block text-sm mb-2">Work Link</label>
      <input 
        className="w-full h-[44px] !border rounded-[10px] px-4 mb-5" 
        value={editPortfolioForm.media_link}
        onChange={(e) => setEditPortfolioForm({...editPortfolioForm, media_link: e.target.value})}
        placeholder="https://example.com"
      />

      {/* Work Description */}
      <label className="block text-sm mb-2">Work Description</label>
      <textarea 
        className="w-full h-[100px] !border rounded-[10px] px-4 py-3 mb-8" 
        value={editPortfolioForm.description}
        onChange={(e) => setEditPortfolioForm({...editPortfolioForm, description: e.target.value})}
      />

      {/* Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex gap-6">
          <button onClick={() => handleEditPortfolio(editPortfolioForm)} className="bg-[#51218F] text-white px-14 py-3 rounded-full font-semibold">Save</button>
          <button onClick={() => setShowEdit(false)} className="!border px-14 py-3 rounded-full font-semibold">Cancel</button>
        </div>
        <button onClick={() => handleDeletePortfolio(editingPortfolioItem.id)} className="bg-red-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-red-700">Delete</button>
      </div>
    </div>
  </div>
)}

{/* ================= MOBILE PORTFOLIO ================= */}
<div className="block lg:hidden bg-white rounded-[14px] shadow mt-5 px-4 py-5">
  {/* Header */}
  <div className="flex justify-between items-center mb-3">
    <h3 className="text-[15px] font-semibold text-[#2A1E17]">My Portfolio</h3>
    {/* Add Portfolio Button */}
    <button onClick={() => setActiveModal("portfolio")} className="!border border-[#51218F] text-[#51218F] text-[12px] px-3 py-[3px] rounded-full">Add Portfolio</button>
  </div>

  {/* Images - CAROUSEL REMOVED */}
  <div className="flex gap-3 overflow-x-auto pb-2">
    {isLoading ? (
      <div className="text-center w-full py-4">Loading...</div>
    ) : portfolioItems.length === 0 ? (
      <div className="text-center w-full py-4 text-gray-500">No portfolio items</div>
    ) : (
      portfolioItems.map((item, i) => (
        <div 
          key={i} 
          className="relative min-w-[130px] h-[95px] rounded-[10px] overflow-hidden cursor-pointer"
          onClick={() => openPortfolioLink(item)}
        >
          {item.file ? (
            <img src={item.file} className="w-full h-full object-cover" alt={item.title} />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-xs">No Image</span>
            </div>
          )}
          
          {/* ✏️ Edit icon */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(item);
            }}
            className="absolute top-1 right-1 w-[28px] h-[28px] bg-[#51218F] text-white rounded-full flex items-center justify-center"
          >
            <img src={EditIcon} className="w-[18px] h-[18px]" alt="edit" />
          </div>
        </div>
      ))
    )}
  </div>
</div>

{/* ================= MOBILE ADD PORTFOLIO MODAL ================= */}
{activeModal === "portfolio" && (
  <div className="md:hidden fixed inset-0 z-[999] flex items-center justify-center bg-black/40 mb-2 block lg:hidden">
    <div className="bg-white w-[90%] max-h-[80vh] rounded-[20px] p-6 shadow-xl">
      {/* ❌ Close Button */}
      <div onClick={() => {
        setActiveModal(null);
        setPortfolioForm({ title: '', media_link: '', description: '', file: null });
        setFileName("No file chosen");
      }} className="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-black text-xl">✕</div>

      {/* TITLE */}
      <h2 className="text-[22px] font-semibold mb-4">Add Portfolio</h2>

      {/* WORK NAME */}
      <div className="mb-4">
        <label className="block text-[14px] font-medium mb-2">Work Name</label>
        <input
          type="text"
          className="w-full h-[44px] !border border-gray-300 rounded-[12px] px-4 focus:outline-none"
          value={portfolioForm.title}
          onChange={(e) => setPortfolioForm({...portfolioForm, title: e.target.value})}
        />
      </div>

      {/* MEDIA FILE LABEL */}
      <div className="mb-4">
        <label className="block text-[14px] font-medium mb-2">Media File</label>
        <div className="w-full h-[60px] !border border-gray-300 rounded-[12px] flex items-center px-4 gap-4">
          <label htmlFor="portfolioFileMobile" className="px-4 py-2 !border rounded-full cursor-pointer text-sm">Choose File</label>
          <input id="portfolioFileMobile" type="file" className="hidden" onChange={(e) => handleFileChange(e, setPortfolioForm, setFileName)} />
          <span className="text-sm text-gray-500 truncate flex-1">{portfolioForm.file?.name || fileName}</span>
        </div>
      </div>

      {/* WORK LINK */}
      <div className="mb-4">
        <label className="block text-[14px] font-medium mb-2">Work Link</label>
        <input
          type="text"
          className="w-full h-[44px] !border border-gray-300 rounded-[12px] px-4 focus:outline-none"
          value={portfolioForm.media_link}
          onChange={(e) => setPortfolioForm({...portfolioForm, media_link: e.target.value})}
          placeholder="https://example.com"
        />
      </div>

      {/* WORK DESCRIPTION */}
      <div className="mb-6">
        <label className="block text-[14px] font-medium mb-2">Work Description</label>
        <textarea
          rows={4}
          className="w-full !border border-gray-300 rounded-[12px] px-4 py-3 focus:outline-none"
          value={portfolioForm.description}
          onChange={(e) => setPortfolioForm({...portfolioForm, description: e.target.value})}
        />
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-4">
        <button onClick={() => handleAddPortfolio(portfolioForm)} className="flex-1 bg-[#51218F] text-white py-3 rounded-full font-semibold hover:opacity-90 transition">Save</button>
        <button onClick={() => {
          setActiveModal(null);
          setPortfolioForm({ title: '', media_link: '', description: '', file: null });
          setFileName("No file chosen");
        }} className="flex-1 !border border-black/10 py-3 rounded-full font-semibold hover:bg-gray-100 transition">Cancel</button>
      </div>
    </div>
  </div>
)}

{/* ================= MOBILE EDIT PORTFOLIO MODAL ================= */}
{showEdit && editingPortfolioItem && (
  <div className="md:hidden fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center mb-2 block lg:hidden ">
    <div className="bg-white w-[90%] max-h-[80vh] rounded-[22px] p-6 shadow-xl relative">
      {/* ❌ Close Button */}
      <div onClick={() => setShowEdit(false)} className="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-black text-xl">✕</div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-[20px] font-semibold">Edit Portfolio</h2>
      </div>

      {/* Work Name */}
      <label className="block text-sm mb-2">Work Name</label>
      <input 
        className="w-full h-[40px] !border rounded-[10px] px-4 mb-4" 
        value={editPortfolioForm.title}
        onChange={(e) => setEditPortfolioForm({...editPortfolioForm, title: e.target.value})}
      />

      {/* Media File Label */}
      <label className="block text-sm mb-2">Media File</label>
      <div className="w-full h-[50px] !border rounded-[10px] flex items-center px-4 gap-4 mb-4">
        <label className="!border px-4 py-2 rounded-full cursor-pointer text-sm">
          Choose File
          <input type="file" className="hidden" onChange={(e) => handleFileChange(e, setEditPortfolioForm)} />
        </label>
        <span className="text-gray-500 text-sm truncate flex-1">{editPortfolioForm.file?.name || "No file chosen"}</span>
      </div>

      {/* Work Link */}
      <label className="block text-sm mb-2">Work Link</label>
      <input 
        className="w-full h-[40px] !border rounded-[10px] px-4 mb-4" 
        value={editPortfolioForm.media_link}
        onChange={(e) => setEditPortfolioForm({...editPortfolioForm, media_link: e.target.value})}
        placeholder="https://example.com"
      />

      {/* Work Description */}
      <label className="block text-sm mb-2">Work Description</label>
      <textarea 
        className="w-full h-[80px] !border rounded-[10px] px-4 py-3 mb-6" 
        value={editPortfolioForm.description}
        onChange={(e) => setEditPortfolioForm({...editPortfolioForm, description: e.target.value})}
      />

      {/* Buttons */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <button onClick={() => handleEditPortfolio(editPortfolioForm)} className="flex-1 bg-[#51218F] text-white py-3 rounded-full font-semibold">Save</button>
          <button onClick={() => setShowEdit(false)} className="flex-1 !border px-4 py-3 rounded-full font-semibold">Cancel</button>
        </div>
        <button onClick={() => handleDeletePortfolio(editingPortfolioItem.id)} className="w-full bg-red-600 text-white py-3 rounded-full font-semibold hover:bg-red-700">Delete</button>
      </div>
    </div>
  </div>
)}

            {/* ================= DESKTOP REVIEWS ================= */}
            <div className="hidden sm:block bg-white shadow-lg mt-6" style={{ width: "802px", height: "367px", borderRadius: "10px", padding: "24px" }}>
              <h3 className="text-[18px] font-semibold text-[#3A2A1A] mb-4">Reviews</h3>
              <div className="w-full h-[1px] bg-black/10 mb-6"></div>
              <div className="flex gap-[21px]">
                {isReviewsLoading ? (
  <div className="text-center w-full py-10">Loading reviews...</div>
) : latestReviews.length === 0 ? (
  <div className="text-center w-full py-10 text-gray-500">No reviews yet</div>
) : (
  latestReviews.map((rev, index) => (
    <div
      key={rev.id || index}
      className="flex flex-col"
      style={{
        width: "348px",
        height: "206px",
        background: "#F3F3F3",
        border: "0.5px solid #00000033",
        borderRadius: "4px",
        padding: "14px"
      }}
    >
      <div className="flex items-start gap-3">
        <img
          src={rev.reviewer_profile_picture || DefaultProfilePic}
          className="w-[32px] h-[32px] rounded-full"
          alt=""
        />
        <div>
          <p className="text-[14px] text-[#6B6B6B] leading-[20px] mb-3">
            {rev.comment || "No comment"}
          </p>
          <p className="text-[14px] font-semibold text-[#3A2A1A]">
            {rev.reviewer_name || "Anonymous"}
          </p>
          <p className="text-[12px] text-[#6B6B6B]">
            {rev.reviewer_role || "Collaborator"}
          </p>
        </div>
      </div>
    </div>
  ))
)}

              </div>
              <p className="text-center mt-6 text-[#6A3EA1] text-[14px] font-medium cursor-pointer">View All</p>
            </div>

            {/* ================= MOBILE REVIEWS ================= */}
            <div className="block sm:hidden bg-white shadow-lg mt-4 rounded-[12px] p-4">
              {/* HEADER */}
              <h3 className="text-[16px] font-semibold text-[#3A2A1A] mb-3">Reviews</h3>
              <div className="w-full h-[1px] bg-black/10 mb-4"></div>
              {/* REVIEW CARD */}
              <div className="bg-[#F3F3F3] border border-black/10 rounded-[8px] p-3 mb-3">
                <div className="flex items-start gap-3">
                  <img src={ReviewUser1} className="w-[34px] h-[34px] rounded-full object-cover" alt="" />
                  <div>
                    <p className="text-[13px] text-[#6B6B6B] leading-[18px] mb-2">Great experience working with this freelancer. The work was delivered on time with excellent quality and clear communication throughout the project. Very professional and easy to collaborate with. Highly recommended!</p>
                    <p className="text-[13px] font-semibold text-[#3A2A1A]">Joe Sam</p>
                    <p className="text-[12px] text-[#6B6B6B]">UI Developer</p>
                  </div>
                </div>
              </div>
              {/* REVIEW CARD */}
              <div className="bg-[#F3F3F3] border border-black/10 rounded-[8px] p-3 mb-4">
                <div className="flex items-start gap-3">
                  <img src={ReviewUser2} className="w-[34px] h-[34px] rounded-full object-cover" alt="" />
                  <div>
                    <p className="text-[13px] text-[#6B6B6B] leading-[18px] mb-2">The freelancer did an amazing job and understood the requirements perfectly. The final output was creative, polished, and exceeded my expectations. Quick responses and smooth workflow. Would definitely work together again!</p>
                    <p className="text-[13px] font-semibold text-[#3A2A1A]">Jaya Surya</p>
                    <p className="text-[12px] text-[#6B6B6B]">Web Developer</p>
                  </div>
                </div>
              </div>
              <p className="text-center text-[#6A3EA1] text-[13px] font-medium cursor-pointer">View All</p>
            </div>
          </div>

          <div className="-mx-4">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}