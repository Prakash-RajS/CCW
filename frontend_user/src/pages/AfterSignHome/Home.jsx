import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import api from "../../utils/axiosConfig";
import Header from "../../component/Header";
import Footer from "../../component/Footer";
import HomeBg from "../../assets/AfterSign/HomeBg.png";
import Filter from "../../assets/AfterSign/Filter.png";
import Skill3 from "../../assets/Landing/Skill3.png";
import Dp1 from "../../assets/AfterSign/Dp1.jpg";
import Ind from "../../assets/AfterSign/Ind.jpg";
import Dp2 from "../../assets/AfterSign/Dp2.jpg";
import Dp3 from "../../assets/AfterSign/Dp3.jpg";
import Dp4 from "../../assets/AfterSign/Dp4.jpg";
import USAFlag from "../../assets/AfterSign/Usa.png";
import UKFlag from "../../assets/AfterSign/Chn.jpg";
import CanadaFlag from "../../assets/AfterSign/Trc.jpg";
import HomeSub from "../../assets/AfterSign/HomeSub.png";
import Folder from "../../assets/AfterSign/Folder.png";
import Cloud from "../../assets/AfterSign/Cloud.png";
import Cancel from "../../assets/AfterSign/Cancel.png";

const Home = () => {
  const [showMore, setShowMore] = useState({});
  const [removedSkills, setRemovedSkills] = useState({});
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userInfo, setUserInfo] = useState({
    name: 'User',
    role: 'Professional',
    profileCompletion: 75
  });
  const [userStats, setUserStats] = useState({
    totalJobs: 0,
    activeProjects: 0,
    completed: 0,
    canceled: 0
  });

  const [jobs, setJobs] = useState([]);
  const [showAllCollaborators, setShowAllCollaborators] = useState(false);
  const navigate = useNavigate();

  // Get user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await api.get("/auth/me");
        setCurrentUser(res.data);
        setUserInfo({
          name: res.data.first_name || res.data.name || 'User',
          role: res.data.role === 'creator' ? 'Creator' : 'Collaborator',
          profileCompletion: res.data.profile_completion || 75
        });
      } catch (err) {
        console.error("Failed to fetch user data", err);
      }
    };
    fetchUserData();
  }, []);

  // Fetch user's jobs for stats
  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchUserJobs = async () => {
      try {
        const employerId = currentUser.id;
        const res = await api.get(`/jobs/my-jobs/${employerId}`);
        const rawJobs = res.data.jobs || res.data || [];

        setJobs(rawJobs);

        setUserStats({
          totalJobs: rawJobs.length,
          activeProjects: rawJobs.filter(j => j.status === "posted" || j.status === "active").length,
          completed: rawJobs.filter(j => j.status === "completed").length,
          canceled: rawJobs.filter(j => j.status === "cancelled" || j.status === "canceled").length
        });
      } catch (err) {
        console.error("Failed to fetch user stats", err);
      }
    };

    fetchUserJobs();
  }, [currentUser]);

  // Fetch collaborators based on view (best matches or all)
  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchCollaborators = async () => {
      try {
        setLoading(true);
        let res;

        if (showAllCollaborators) {
          // ✅ Show ALL collaborators
          res = await api.get("/collaborator/search");
        } else {
          // ✅ Show BEST MATCHES (user-specific)
          res = await api.get(
            `/creator/collaborators/best-match/${currentUser.id}`
          );
        }

        setProfiles(transformBackendData(res.data));
      } catch (err) {
        console.error("Failed to fetch collaborators", err);
      } finally {
        setLoading(false);
      }
    };


    fetchCollaborators();
  }, [currentUser, showAllCollaborators]);

  // Transform backend data to frontend format
  const transformBackendData = (backendData) => {
    if (!backendData) return [];

    const data = Array.isArray(backendData)
      ? backendData
      : backendData?.data || backendData?.results || backendData?.collaborators || [];

    if (!Array.isArray(data)) return [];

    return data.map((item, index) => {
      // Parse skills properly
      const parseSkills = (skills) => {
        if (!skills) return [];
        if (Array.isArray(skills)) return skills;
        try {
          return JSON.parse(skills);
        } catch {
          if (typeof skills === 'string') {
            return skills.split(',').map(s => s.trim()).filter(s => s);
          }
          return [];
        }
      };

      // Determine job title from backend data
      let jobTitle = 'Professional, Expert';
      if (item.title) {
        jobTitle = item.title;
      } else if (item.role) {
        jobTitle = item.role;
      } else if (item.skill_category) {
        jobTitle = item.skill_category;
      } else if (item.profession) {
        jobTitle = item.profession;
      }

      // Determine hourly rate - use actual data from backend
      let hourlyRate = 20;
      if (item.pricing !== undefined) {
        hourlyRate = item.pricing;
      } else if (item.hourly_rate !== undefined) {
        hourlyRate = item.hourly_rate;
      } else if (item.rate_per_hour !== undefined) {
        hourlyRate = item.rate_per_hour;
      }

      // Determine location - use actual data from backend
      let location = 'Unknown Location';
      if (item.location) {
        location = item.location;
      } else if (item.city && item.country) {
        location = `${item.city}, ${item.country}`;
      } else if (item.user_location) {
        location = item.user_location;
      } else if (item.country) {
        location = item.country;
      }

      // Determine country flag based on location
      let countryFlag = Ind;
      if (location.includes('USA') || location.includes('United States') || location.includes('US')) {
        countryFlag = USAFlag;
      } else if (location.includes('China') || location.includes('CHN') || location.includes('CN')) {
        countryFlag = UKFlag;
      } else if (location.includes('Japan') || location.includes('JP') || location.includes('JPN')) {
        countryFlag = CanadaFlag;
      }

      // Determine skills
      let displaySkills = [];
      if (item.skills) {
        displaySkills = parseSkills(item.skills);
      } else if (item.skill_category) {
        displaySkills = item.skill_category.split(",").map(s => s.trim());
      } else if (item.expertise) {
        displaySkills = parseSkills(item.expertise);
      }

      // Limit skills to 8 for display
      displaySkills = displaySkills.slice(0, 8);

      // Determine profile image
      let dpImage = Dp1;
      const images = [Dp1, Dp2, Dp3, Dp4];
      if (item.profile_picture || item.profilePhoto || item.profileImage || item.avatar || item.profile_image) {
        dpImage = item.profile_picture || item.profilePhoto || item.profileImage || item.avatar || item.profile_image;
      } else {
        dpImage = images[index % images.length];
      }

      // Determine badge
      let badge = '';
      if (item.badges && item.badges.length > 0) {
        badge = item.badges[0];
      } else if (item.verified) {
        badge = 'Verified';
      } else if (item.top_rated) {
        badge = 'Top rated';
      } else if (item.is_top_rated) {
        badge = 'Top rated';
      } else {
        const badges = ['', 'Popular', 'Best match'];
        badge = badges[index % badges.length];
      }

      // Fetch actual ratings and reviews from backend
      // ---- Rating from skills_rating (0–100 → 0–5) ----
      const rawRating =
        item.skills_rating ??   // ✅ correct backend field
        item.rating ??          // fallback
        null;

      const rating =
        typeof rawRating === "number"
          ? Math.min(5, Math.max(0, rawRating / 20))
          : null;


      // ---- Reviews count (you DO NOT have reviews table yet) ----
      const reviewsCount = rating !== null ? 1 : 0; // placeholder


      return {
        id: item.user_id || item.id || item._id || index,
        name: item.name || item.full_name || item.first_name || "Collaborator",
        jobTitle: jobTitle,
        hourlyRate: `$${hourlyRate} /hr`,
        location: location,
        countryFlag,
        isOnline: item.is_online !== undefined ? item.is_online : true,
        skills: displaySkills,
        dpImage,
        badge,
        rating: rating,
        reviewsCount: rating !== null ? 1 : 0
      };
    });
  };

  // Handle filter button click - toggle between best matches and all collaborators
  const handleFilterClick = () => {
    setShowAllCollaborators(!showAllCollaborators);
  };

  // Handle remove skill
  const handleRemoveSkill = (profileId, skillIndex) => {
    setRemovedSkills(prev => ({
      ...prev,
      [`${profileId}-${skillIndex}`]: true
    }));
  };

  // Toggle show more skills
  const toggleShowMore = (profileId) => {
    setShowMore(prev => ({
      ...prev,
      [profileId]: !prev[profileId]
    }));
  };
  
  const handleInvite = async (collaboratorId) => {
  try {
    const activeJob =
      jobs.find(j => j.status === "posted" || j.status === "active");

    if (!activeJob) {
      alert("Please create a job first");
      return;
    }

    const formData = new FormData();
    formData.append("sender_id", currentUser.id);
    formData.append("receiver_id", collaboratorId);
    formData.append("job_id", activeJob.id);

    formData.append("client_name", currentUser.first_name || "Client");
    formData.append("project_name", activeJob.title || "Project");
    formData.append("date", new Date().toISOString().split("T")[0]);
    formData.append("revenue", activeJob.budget || 0);

    await api.post("/invitations/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    alert("Invitation sent successfully ✅");
  } catch (error) {
    console.error("Invitation failed:", error);
    alert(
      error.response?.data?.detail ||
      error.response?.data?.message ||
      "Invitation failed"
    );
  }
};



  // Get header text based on current view
  const getHeaderText = () => {
    if (loading) return "Loading...";
    if (showAllCollaborators) {
      return `Collaborators (${profiles.length})`;
    } else {
      return `Best matches for you (${profiles.length})`;
    }
  };

  return (
    <div className="w-full min-h-[2500px] flex flex-col overflow-x-hidden">
      <section className="w-full flex flex-col items-center justify-start px-4 relative min-w-0">
        {/* Background Image Container */}
        <div
          className="absolute top-[-104px] left-0 w-full h-[582px] z-0"
          style={{
            backgroundImage: `url(${HomeBg})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black opacity-30" />
        </div>

        {/* Welcome Text */}
        <div className="absolute top-[187px] w-full h-[120px] flex items-center justify-center z-10">
          <h1
            className="text-[48px] leading-[100%] text-center text-white font-normal"
            style={{ fontFamily: "Milonga" }}
          >
            Welcome back,<br />{currentUser?.first_name || currentUser?.name || userInfo.name}
          </h1>
        </div>

        <Header />

        {/* Container for the main content */}
        <div className="w-full flex flex-col lg:flex-row justify-start mt-[412px] pb-[100px] relative">
          <div className="w-full lg:w-[805px] lg:ml-[65px] opacity-100 relative">

            {/* ========== JOB POST CARD ========== */}
            <div
              className="w-full lg:w-[804px] h-[182px] mb-6 lg:mb-0 lg:absolute lg:top-[53px] lg:left-[1px] opacity-100 rounded-[10px] bg-white shadow-[0px_4px_45px_0px_#0000001F] overflow-hidden"
            >
              {/* Right image div with Skill3 image */}
              <div className="absolute w-[303px] h-[182px] top-0 right-0 opacity-100 rounded-r-[10px] overflow-hidden">
                <img
                  src={Skill3}
                  alt="Job illustration"
                  className="w-full h-full object-cover"
                />
              </div>


              {/* Left top text - "No job post" */}
              <div className="absolute w-[102px] h-[25px] top-[22px] left-[32px] opacity-100">
                <h3 className="font-outfit font-semibold text-[20px] leading-[100%] text-[#2A1E17] whitespace-nowrap">
                  {userStats.totalJobs === 0 ? 'No job post' : 'Your Jobs'}
                </h3>
              </div>

              {/* Bottom paragraph */}
              <div className="absolute w-[263px] h-[36px] top-[68px] left-[32px] opacity-100">
                <p className="font-outfit font-normal text-[14px] leading-[100%] text-[#000000]">
                  {userStats.totalJobs === 0
                    ? 'You have not posted any job, post your job and find world\'s best talent here.'
                    : `You have ${userStats.totalJobs} jobs posted. Create more to find talent.`
                  }
                </p>
              </div>

              {/* Button */}
              <button
                onClick={() => navigate("/created")}
                className="absolute w-[190px] h-[39px] top-[124px] left-[32px] 
                opacity-100 rounded-[100px] px-[10px] flex items-center justify-center 
                gap-[10px] bg-gradient-to-r from-[#51218F] to-[#170929] 
                text-white font-outfit font-normal text-[14px] leading-[100%] 
                hover:opacity-90 transition-opacity duration-200"
              >
                {userStats.totalJobs === 0 ? 'Post a new job' : 'Post another job'}
              </button>
            </div>

            {/* ========== FILTER AND HEADER SECTION ========== */}
            <div className="mt-[250px] lg:mt-[260px] flex flex-col space-y-4">

              {/* Filter section - Figma: Best matches LEFT, Filter RIGHT */}
              <div className="flex items-center justify-between">

                {/* Best matches text on LEFT */}
                <h3 className="font-outfit font-semibold text-[16px] text-black whitespace-nowrap">
                  {getHeaderText()}
                </h3>

                {/* Filter button on RIGHT */}
                <button
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity duration-200"
                  onClick={handleFilterClick}
                  disabled={loading}
                >
                  <span className="font-semibold text-[16px] text-[#51218F] whitespace-nowrap">
                    {loading
                      ? "Loading..."
                      : showAllCollaborators
                        ? "Show All"
                        : "Filter here"}
                  </span>

                  <img
                    src={Filter}
                    alt="Filter"
                    className="w-[18px] h-[18px]"
                  />
                </button>

              </div>
            </div>


            {/* ========== PROFILE CARDS ========== */}
            <div className="mt-8 space-y-6">
              {loading ? (
                <div className="flex justify-center items-center w-full h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
                </div>
              ) : profiles.length === 0 ? (
                <div className="flex justify-center items-center w-full h-64">
                  <p className="text-gray-500">
                    No {showAllCollaborators ? 'collaborators' : 'matches'} found.
                  </p>
                </div>
              ) : (
                profiles.map((profile) => {
                  const availableSkills = profile.skills.filter((_, index) =>
                    !removedSkills[`${profile.id}-${index}`]
                  );
                  const firstRowSkills = availableSkills.slice(0, 4);
                  const secondRowSkills = showMore[profile.id] ? availableSkills.slice(4) : [];

                  return (
                    <div
                      key={profile.id}
                      className="w-full h-auto min-h-[252px] opacity-100 rounded-[10px] bg-white shadow-[0px_4px_45px_0px_#0000001F] p-6 relative"
                      style={{
                        height: showMore[profile.id] ? '300px' : '252px',
                      }}
                    >
                      {/* Profile badge/box */}
                      {profile.badge && profile.badge.trim() !== "" && (
                        <div
                          className="absolute w-[104px] h-[25px] top-[-7px] left-[29px] opacity-100 rounded-[100px] flex items-center justify-center"
                          style={{
                            backgroundColor: '#51218F',
                          }}
                        >
                          <span className="font-outfit font-semibold text-[14px] leading-[100%] text-white whitespace-nowrap">
                            {profile.badge}
                          </span>
                        </div>
                      )}

                      {/* ========== PROFILE SECTION ========== */}

                      {/* Profile image */}
                      <div className="absolute w-[42px] h-[42px] top-[35px] left-[29px] opacity-100 rounded-full overflow-hidden">
                        <img
                          src={profile.dpImage}
                          alt={`${profile.name} profile`}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Online status circle */}
                      <div
                        className="absolute w-[14px] h-[14px] top-[36px] left-[61px] opacity-100 rounded-full border-[1px] border-white"
                        style={{
                          backgroundColor: profile.isOnline ? '#33BA04' : '#C4C4C4',
                        }}
                      />

                      {/* Name */}
                      <div className="absolute w-auto h-[17px] top-[35px] left-[79px] opacity-100">
                        <span className="font-bold text-[14px] leading-[100%] text-[#000000] whitespace-nowrap">
                          {profile.name}
                        </span>
                      </div>

                      {/* Job title */}
                      <div className="absolute w-[201px] h-[18px] top-[61px] left-[79px] opacity-100">
                        <span className="font-outfit font-normal text-[14px] leading-[100%] text-[#00000099] whitespace-nowrap">
                          {profile.jobTitle}
                        </span>
                      </div>

                      {/* Hourly rate */}
                      <div className="absolute w-auto h-[17px] top-[95px] left-[79px] opacity-100">
                        <span className="font-bold text-[14px] leading-[100%] text-[#000000] whitespace-nowrap">
                          {profile.hourlyRate}
                        </span>
                      </div>

                      {/* ========== INVITE BUTTON ========== */}
                      <button
                        className="absolute w-[147px] h-[39px] top-[35px] right-[29px] opacity-100 rounded-[100px] flex items-center justify-center px-[36px] py-[12px] gap-[10px] bg-transparent hover:bg-[#51218F] transition-all duration-200 cursor-pointer group border border-[#51218F]"
                        onClick={() => handleInvite(profile.id)}
                      >
                        <span className="font-bold text-[12px] leading-[100%] text-[#51218F] whitespace-nowrap group-hover:text-white">
                          Invite
                        </span>
                      </button>

                      {/* ========== FIRST ROW OF SKILLS ========== */}
                      {firstRowSkills.map((skill, index) => {
                        const leftPositions = [79, 220, 361, 502];
                        return (
                          <div
                            key={`${profile.id}-${index}`}
                            className="absolute w-[131px] h-[26px] top-[157px] opacity-100 rounded-[100px] flex items-center justify-between px-[12px] cursor-pointer hover:opacity-90 transition-opacity duration-200"
                            style={{
                              backgroundColor: '#51218FD9',
                              left: `${leftPositions[index]}px`,
                            }}
                            onClick={() => handleRemoveSkill(profile.id, index)}
                          >
                            <span className="font-outfit font-normal text-[14px] leading-[100%] text-white whitespace-nowrap">
                              {skill}
                            </span>
                            {/* Cross/X icon */}
                            <div className="w-[9px] h-[12px] opacity-100">
                              <svg
                                width="10"
                                height="12"
                                viewBox="0 0 10 12"
                                fill="none"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="1" y1="1" x2="9" y2="11" />
                                <line x1="9" y1="1" x2="1" y2="11" />
                              </svg>
                            </div>
                          </div>
                        );
                      })}

                      {/* ========== SECOND ROW OF SKILLS ========== */}
                      {secondRowSkills.map((skill, index) => {
                        const leftPositions = [79, 220, 361, 502];
                        return (
                          <div
                            key={`${profile.id}-second-${index}`}
                            className="absolute w-[131px] h-[26px] top-[195px] opacity-100 rounded-[100px] flex items-center justify-between px-[12px] cursor-pointer hover:opacity-90 transition-opacity duration-200"
                            style={{
                              backgroundColor: '#51218FD9',
                              left: `${leftPositions[index]}px`,
                            }}
                            onClick={() => handleRemoveSkill(profile.id, index + 4)}
                          >
                            <span className="font-outfit font-normal text-[14px] leading-[100%] text-white whitespace-nowrap">
                              {skill}
                            </span>
                            {/* Cross/X icon */}
                            <div className="w-[9px] h-[12px] opacity-100">
                              <svg
                                width="10"
                                height="12"
                                viewBox="0 0 10 12"
                                fill="none"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="1" y1="1" x2="9" y2="11" />
                                <line x1="9" y1="1" x2="1" y2="11" />
                              </svg>
                            </div>
                          </div>
                        );
                      })}

                      {/* "more/less" text button */}
                      {availableSkills.length > 4 && (
                        <button
                          className="absolute w-[50px] h-[26px] top-[157px] right-[29px] opacity-100 rounded-[100px] flex items-center justify-center px-[12px] bg-transparent hover:opacity-80 transition-opacity duration-200"
                          onClick={() => toggleShowMore(profile.id)}
                        >
                          <span className="font-outfit font-normal text-[14px] leading-[100%] text-[#51218F] whitespace-nowrap">
                            {showMore[profile.id] ? 'less' : 'more'}
                          </span>
                        </button>
                      )}

                      {/* ========== RATING AND COUNTRY SECTION ========== */}
                      <div
                        className="absolute w-[266px] h-[15px] opacity-100 flex items-center"
                        style={{
                          top: showMore[profile.id] ? '235px' : '214px',
                          left: '79px',
                        }}
                      >
                        {/* Rating stars */}
                        {typeof profile.rating === "number" ? (
                          <>
                            <div className="flex items-center gap-[2px]">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className={`text-[14px] ${star <= Math.floor(profile.rating)
                                    ? "text-[#51218F]"
                                    : "text-[#D9D9D9]"
                                    }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>

                            <span className="ml-1 font-outfit font-normal text-[12px] text-[#2A1E1780]">
                              {profile.rating.toFixed(1)} / 5
                            </span>
                          </>
                        ) : (
                          <span className="font-outfit font-normal text-[12px] text-[#2A1E1780]">
                            No rating yet
                          </span>
                        )}



                        {/* Country section */}
                        <div className="flex items-center">
                          {/* Country flag image */}
                          <div className="w-[18px] h-[12px] mr-[6px] rounded-[4px] overflow-hidden">
                            <img
                              src={profile.countryFlag}
                              alt={`${profile.location.split(',')[1]?.trim()} flag`}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Country text */}
                          <span className="font-outfit font-normal text-[12px] leading-[100%] text-[#2A1E1780] whitespace-nowrap">
                            {profile.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ========== RIGHT SIDEBAR ========== */}
          <div className="w-full lg:w-[392px] mt-8 lg:mt-0 lg:absolute lg:top-[0px] lg:right-4 lg:left-auto">
            <div className="flex flex-col gap-[30px]">

              {/* Find collaborator button - aligned right */}
              <div className="flex justify-end">
                <button
                  onClick={() => navigate("/finder")}
                  className="w-[190px] h-[39px] opacity-100 rounded-[100px] px-[10px] flex items-center justify-center gap-[10px] bg-gradient-to-r from-[#51218F] to-[#170929] hover:opacity-90 transition-opacity duration-200 cursor-pointer"
                >
                  <span className="font-bold text-[12px] leading-[100%] text-white whitespace-nowrap">
                    Find collaborator
                  </span>
                </button>
              </div>

              {/* Profile completion card */}
              <div
                className="w-full h-[266px] opacity-100 rounded-[10px] bg-white shadow-[0px_4px_45px_0px_#0000001F] flex flex-col items-center p-6"
              >
                {/* Top text - User Name */}
                <div className="w-full h-[27px] opacity-100 mb-2">
                  <h3 className="font-bold text-[22px] leading-[100%] text-[#2A1E17] text-center">
                    {userInfo.name}
                  </h3>
                </div>

                {/* Bottom para - User Role */}
                <div className="w-full h-[18px] opacity-100 mb-6">
                  <p className="font-medium text-[14px] leading-[100%] text-[#2A1E17E5] text-center">
                    {userInfo.role}
                  </p>
                </div>

                {/* Progress section */}
                <div className="w-full flex justify-between items-center mb-4">
                  {/* Left text - Set up your account */}
                  <div className="text-left">
                    <span className="font-bold text-[14px] leading-[100%] text-[#2A1E17]">
                      Set up your account
                    </span>
                  </div>

                  {/* Right text - Percentage */}
                  <div className="text-right">
                    <span className="font-bold text-[14px] leading-[100%] text-[#2A1E17]">
                      {userInfo.profileCompletion}%
                    </span>
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="w-full max-w-[341px] h-[6px] opacity-100 mb-8 rounded-full bg-gray-200 overflow-hidden">
                  {/* Progress bar fill */}
                  <div
                    className="h-full rounded-full border-0"
                    style={{
                      width: `${userInfo.profileCompletion}%`,
                      backgroundColor: '#51218F',
                    }}
                  />
                </div>

                {/* Complete your profile button */}
                <button
                  onClick={() => navigate("/edit-profile")}
                  className="w-full max-w-[210px] h-[39px] opacity-100 rounded-[100px] flex items-center justify-center px-[36px] py-[12px] gap-[10px] bg-transparent hover:bg-[#51218F] hover:text-white transition-all duration-200 cursor-pointer mb-3 group border border-[#51218F]"
                >
                  <span className="font-bold text-[12px] leading-[100%] text-[#51218F] group-hover:text-white">
                    {userInfo.profileCompletion === 100 ? 'Update Profile' : 'Complete your profile'}
                  </span>
                </button>

                {/* Last bottom para */}
                <div className="w-full max-w-[341px] opacity-100">
                  <p className="font-normal italic text-[12px] leading-[100%] text-[#2A1E17E5] text-center">
                    100% completion of your profile will help you get more reach.
                  </p>
                </div>
              </div>

              {/* ========== VERIFICATION CARD ========== */}
              <div className="w-full h-[242px] opacity-100 bg-white rounded-[10px] shadow-[0px_4px_45px_0px_#0000001F] p-6">
                {/* Top text - Verification */}
                <div className="w-full h-[24px] opacity-100 mb-2">
                  <h3 className="font-semibold text-[20px] leading-[100%] text-[#2A1E17]">
                    Verification
                  </h3>
                </div>

                {/* Line border */}
                <div
                  className="w-full h-[0px] opacity-100 mb-6"
                  style={{
                    borderBottom: '1px solid #0000001A'
                  }}
                />

                {/* Identity verified section */}
                <div className="w-full h-[20px] opacity-100 mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-[12px]">
                    <div className="w-[20px] h-[20px] opacity-100">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2A1E17" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <span className="font-outfit font-normal text-[16px] leading-[100%] text-[#2A1E17] whitespace-nowrap">
                      Identity verified
                    </span>
                  </div>
                  <button className="w-[46px] h-[20px] opacity-100 bg-transparent hover:opacity-80 transition-opacity duration-200 cursor-pointer">
                    <span className="font-medium text-[16px] leading-[100%] text-[#51218F] whitespace-nowrap">
                      Verify
                    </span>
                  </button>
                </div>

                {/* Phone verified section */}
                <div className="w-full h-[20px] opacity-100 mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-[12px]">
                    <div className="w-[20px] h-[20px] opacity-100">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2A1E17" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </div>
                    <span className="font-outfit font-normal text-[16px] leading-[100%] text-[#2A1E17] whitespace-nowrap">
                      Phone verified
                    </span>
                  </div>
                  <button className="w-[46px] h-[20px] opacity-100 bg-transparent hover:opacity-80 transition-opacity duration-200 cursor-pointer">
                    <span className="font-medium text-[16px] leading-[100%] text-[#51218F] whitespace-nowrap">
                      Verify
                    </span>
                  </button>
                </div>

                {/* Email verified section */}
                <div className="w-full h-[20px] opacity-100 flex items-center justify-between">
                  <div className="flex items-center gap-[12px]">
                    <div className="w-[20px] h-[20px] opacity-100">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2A1E17" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </div>
                    <span className="font-outfit font-normal text-[16px] leading-[100%] text-[#2A1E17] whitespace-nowrap">
                      Email verified
                    </span>
                  </div>
                  <button className="w-[46px] h-[20px] opacity-100 bg-transparent hover:opacity-80 transition-opacity duration-200 cursor-pointer">
                    <span className="font-medium text-[16px] leading-[100%] text-[#51218F] whitespace-nowrap">
                      Verify
                    </span>
                  </button>
                </div>
              </div>

              {/* ========== GRADIENT PROMO CARD ========== */}
              <div className="relative">
                <div className="w-full h-[98px] opacity-100 rounded-[10px] shadow-[0px_4px_45px_0px_#0000001F] overflow-hidden relative"
                  style={{
                    background: 'linear-gradient(266.38deg, #51218F 4.44%, #020202 100.18%)',
                  }}
                >
                  <div className="absolute inset-0 z-0 rounded-[10px] overflow-hidden">
                    <img
                      src={HomeSub}
                      alt="Promotional background"
                      className="w-full h-full object-cover opacity-30"
                    />
                  </div>
                  <div className="relative z-10 h-full flex items-center pl-6 pr-24">
                    <div>
                      <div className="font-medium text-[18px] leading-tight text-white whitespace-nowrap">
                        Get Subscription for getting
                      </div>
                      <div className="font-medium text-[18px] leading-tight text-white whitespace-nowrap">
                        more revenue in a month
                      </div>
                    </div>
                  </div>
                </div>
                <div onClick={() => navigate("/subscription")}
                  className="absolute w-[60px] h-[60px] lg:w-[98px] lg:h-[98px] top-1/2 right-[-15px] lg:right-[-30px] transform -translate-y-1/2 opacity-100 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200 z-10 shadow-lg"
                  style={{
                    background: 'linear-gradient(180deg, #FFA412 0%, #6C4343 100%)',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>

              {/* ========== JOBS SUMMARY CARD ========== */}
              <div className="w-full h-[287px] opacity-100 rounded-[10px] bg-white shadow-lg p-6">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="font-montserrat font-medium text-[20px] leading-[100%] text-[#2A1E17]">
                    All Job
                  </h3>
                  <div className="flex items-center gap-1">
                    <span className="font-montserrat font-medium text-[16px] leading-[100%] text-[#2A1E17]">
                      Total:
                    </span>
                    <span className="font-montserrat font-bold text-[20px] leading-[100%] text-[#2A1E17]">
                      {userStats.totalJobs}
                    </span>
                  </div>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="flex items-center">
                    <div className="w-[20px] h-[19px] mr-3 flex items-center justify-center">
                      <img src={Folder} alt="Active projects" />
                    </div>
                    <p className="font-montserrat text-[16px] leading-[100%] text-[#2A1E17E5]">
                      <span className="font-bold">Active projects:</span>
                      <span className="font-medium"> {userStats.activeProjects}</span>
                    </p>
                  </div>

                  <div className="flex items-center">
                    <div className="w-[20px] h-[19px] mr-3 flex items-center justify-center">
                      <img src={Cloud} alt="Completed projects" />
                    </div>
                    <p className="font-montserrat text-[16px] leading-[100%] text-[#2A1E17E5]">
                      <span className="font-bold">Completed:</span>
                      <span className="font-medium"> {userStats.completed}</span>
                    </p>
                  </div>

                  <div className="flex items-center">
                    <div className="w-[20px] h-[19px] mr-3 flex items-center justify-center">
                      <img src={Cancel} alt="Canceled projects" />
                    </div>
                    <p className="font-montserrat text-[16px] leading-[100%] text-[#2A1E17E5]">
                      <span className="font-bold">Canceled:</span>
                      <span className="font-medium"> {userStats.canceled}</span>
                    </p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => navigate('/my-jobs')}
                    className="w-[122px] h-[39px] opacity-100 rounded-[100px] flex items-center justify-center px-[36px] py-[12px] gap-[10px] bg-transparent hover:bg-[#51218F] hover:text-white transition-all duration-200 cursor-pointer group border border-[#51218F]"
                  >
                    <span className="font-montserrat font-bold text-[12px] leading-[100%] text-[#51218F] group-hover:text-white whitespace-nowrap">
                      View all
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default Home;