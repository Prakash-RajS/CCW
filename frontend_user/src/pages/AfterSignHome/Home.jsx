import React, { useState ,  useEffect } from 'react';
import { useNavigate } from "react-router-dom";

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
  const [showFiltered, setShowFiltered] = useState(false);
  const navigate = useNavigate();
  
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  // Initial profiles data
  const initialProfiles = [
    {
      id: 1,
      name: "James",
      jobTitle: "UX Designer, Graphic Designer",
      hourlyRate: "$10.00 /hr",
      totalEarnings: "Total earnings $36k on web and mobile design",
      rating: "4/5 (12 Reviews)",
      location: "Chennai, India",
      countryFlag: Ind,
      isOnline: true,
      skills: ["Web design", "Wire Frame", "Prototypes", "Layout Design", "UI/UX Design", "Figma", "Adobe XD", "Sketch"],
      dpImage: Dp1,
      badge: "Top rated",
    },
    {
      id: 2,
      name: "Sarah",
      jobTitle: "Frontend Developer, React Specialist",
      hourlyRate: "$25.00 /hr",
      totalEarnings: "Total earnings $52k on React applications",
      rating: "4.8/5 (28 Reviews)",
      location: "Manhattan, USA",
      countryFlag: USAFlag,
      isOnline: true,
      skills: ["React.js", "JavaScript", "TypeScript", "Next.js", "HTML/CSS", "Redux", "Tailwind CSS", "Git"],
      dpImage: Dp2,
      badge: "Popular",
    },
    {
      id: 3,
      name: "Michael",
      jobTitle: "Backend Developer, Node.js Expert",
      hourlyRate: "$30.00 /hr",
      totalEarnings: "Total earnings $68k on API development",
      rating: "4.5/5 (18 Reviews)",
      location: "Beijing, CHINA",
      countryFlag: UKFlag,
      isOnline: false,
      skills: ["Node.js", "Express.js", "MongoDB", "PostgreSQL", "AWS", "Docker", "REST APIs", "Python"],
      dpImage: Dp3,
      badge: "Best match",
    },
    {
      id: 4,
      name: "Emma",
      jobTitle: "Full Stack Developer, MERN Stack",
      hourlyRate: "$35.00 /hr",
      totalEarnings: "Total earnings $75k on full stack projects",
      rating: "4.9/5 (35 Reviews)",
      location: "Tokyo, Japan",
      countryFlag: CanadaFlag,
      isOnline: true,
      skills: ["MERN Stack", "JavaScript", "React.js", "Node.js", "MongoDB", "GraphQL", "Firebase", "Heroku"],
      dpImage: Dp4,
      badge: "",
    }
  ];

  // Additional profiles for when filter is clicked
  const filteredProfiles = [
    {
      id: 5,
      name: "David",
      jobTitle: "Mobile App Developer",
      hourlyRate: "$28.00 /hr",
      totalEarnings: "Total earnings $45k on mobile apps",
      rating: "4.3/5 (15 Reviews)",
      location: "Berlin, Germany",
      countryFlag: Ind,
      isOnline: true,
      skills: ["React Native", "Flutter", "iOS", "Android", "Firebase", "Swift", "Kotlin"],
      dpImage: Dp1,
      badge: "Trending",
    },
    {
      id: 6,
      name: "Lisa",
      jobTitle: "DevOps Engineer",
      hourlyRate: "$40.00 /hr",
      totalEarnings: "Total earnings $80k on infrastructure",
      rating: "4.7/5 (22 Reviews)",
      location: "Sydney, Australia",
      countryFlag: USAFlag,
      isOnline: false,
      skills: ["Kubernetes", "AWS", "CI/CD", "Terraform", "Docker", "Linux", "Jenkins"],
      dpImage: Dp2,
      badge: "Verified",
    },
    {
      id: 7,
      name: "Robert",
      jobTitle: "Data Scientist",
      hourlyRate: "$45.00 /hr",
      totalEarnings: "Total earnings $90k on data projects",
      rating: "4.6/5 (20 Reviews)",
      location: "Paris, France",
      countryFlag: UKFlag,
      isOnline: true,
      skills: ["Python", "Machine Learning", "TensorFlow", "SQL", "Pandas", "Statistics", "R"],
      dpImage: Dp3,
      badge: "Expert",
    },
    {
      id: 8,
      name: "Sophia",
      jobTitle: "Product Manager",
      hourlyRate: "$50.00 /hr",
      totalEarnings: "Total earnings $100k on product launches",
      rating: "4.9/5 (30 Reviews)",
      location: "Tokyo, Japan",
      countryFlag: CanadaFlag,
      isOnline: true,
      skills: ["Agile", "Scrum", "Product Strategy", "User Research", "Roadmapping", "Analytics"],
      dpImage: Dp4,
      badge: "Recommended",
    }
  ];

  // Determine which profiles to show based on filter state
  const profilesToShow = showFiltered ? filteredProfiles : initialProfiles;

  const handleRemoveSkill = (profileId, skillIndex) => {
    setRemovedSkills(prev => ({
      ...prev,
      [`${profileId}-${skillIndex}`]: true
    }));
  };

  const toggleShowMore = (profileId) => {
    setShowMore(prev => ({
      ...prev,
      [profileId]: !prev[profileId]
    }));
  };

  const handleFilterClick = () => {
    setShowFiltered(!showFiltered);
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
          {/* White Overlay */}
          <div className="absolute inset-0 bg-black opacity-30" />
        </div>

        {/* Welcome Text */}
        <div className="absolute top-[187px] w-full h-[120px] flex items-center justify-center z-10">
          <h1
            className="text-[48px] leading-[100%] text-center text-white font-normal"
            style={{ fontFamily: "Milonga" }}
          >
            Welcome back,<br />
            Pradeep
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
                  No job post
                </h3>
              </div>
              
              {/* Bottom paragraph */}
              <div className="absolute w-[263px] h-[36px] top-[68px] left-[32px] opacity-100">
                <p className="font-outfit font-normal text-[14px] leading-[100%] text-[#000000]">
                  You have not posted any job, post your job 
                  and find world's best talent here.
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
  Post a new job
</button>

            </div>

            {/* ========== BEST MATCHES HEADER ========== */}
            <div className="w-full lg:w-[195px] h-[20px] mb-4 lg:mb-0 lg:absolute lg:top-[331px] lg:left-0 opacity-100">
              <h3 className="font-outfit font-semibold text-[16px] leading-[100%] text-black whitespace-nowrap">
                Best matches for you (200)
              </h3>
            </div>
            
            {/* ========== FILTER BUTTON ========== */}
            <button 
              className="absolute flex items-center gap-[8px] top-[330px] right-4 lg:right-auto lg:left-[690px] opacity-100 cursor-pointer hover:opacity-80 transition-opacity duration-200 bg-transparent p-0"
              onClick={handleFilterClick}
            >
              {/* Filter icon */}
              <div className="w-[18px] h-[19px]">
                <img 
                  src={Filter} 
                  alt="Filter icon" 
                  className="w-full h-full object-contain border-2 border-[#51218F]"
                />
              </div>
              
              {/* "Filter here" text */}
              <span className="font-semibold text-[16px] leading-[100%] text-[#51218F] whitespace-nowrap">
                {showFiltered ? 'Show All' : 'Filter here'}
              </span>
            </button>

            {/* ========== PROFILE CARDS ========== */}
            <div className="mt-20 lg:mt-0 lg:absolute lg:top-[380px] lg:left-0 space-y-6 lg:space-y-0">
              {profilesToShow.map((profile, profileIndex) => {
                const topPosition = profileIndex * 300;
                const availableSkills = profile.skills.filter((_, index) => 
                  !removedSkills[`${profile.id}-${index}`]
                );
                const firstRowSkills = availableSkills.slice(0, 4);
                const secondRowSkills = showMore[profile.id] ? availableSkills.slice(4) : [];
                
                return (
                  <div 
                    key={profile.id}
                    className="w-full lg:w-[805px] h-auto min-h-[252px] opacity-100 rounded-[10px] bg-white shadow-[0px_4px_45px_0px_#0000001F] p-4 lg:p-0 lg:absolute"
                    style={{
                      top: `${topPosition}px`,
                      height: showMore[profile.id] ? '300px' : '252px',
                    }}
                  >
                    {/* Profile badge/box - Only show for profiles 1 and 3 in initial view */}
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
                    
                    {/* Total earnings */}
                    <div className="absolute w-[284px] h-[18px] top-[123px] left-[79px] opacity-100">
                      <span className="font-outfit font-normal text-[14px] leading-[100%] text-[#00000099] whitespace-nowrap">
                        {profile.totalEarnings}
                      </span>
                    </div>
                    
                    {/* ========== INVITE BUTTON ========== */}
                    <button 
                      className="absolute w-[147px] h-[39px] top-[35px] right-[29px] opacity-100 rounded-[100px] flex items-center justify-center px-[36px] py-[12px] gap-[10px] bg-transparent hover:bg-[#51218F] transition-all duration-200 cursor-pointer group border border-[#51218F]"
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
                      {/* Star rating section */}
                      <div className="flex items-center mr-[12px]">
                        {/* Star icons container */}
                        <div className="w-[53px] h-[7px] mr-[6px] flex items-center">
                          <svg width="7.8" height="7.3" viewBox="0 0 12 12" className="mr-[2px]">
                            <path d="M6 1L7.545 4.13L11 4.635L8.5 7.07L9.09 10.51L6 8.885L2.91 10.51L3.5 7.07L1 4.635L4.455 4.13L6 1Z" 
                                  fill="#51218F" stroke="#51218F" strokeWidth="0.5" />
                          </svg>
                          <svg width="7.8" height="7.3" viewBox="0 0 12 12" className="mr-[2px]">
                            <path d="M6 1L7.545 4.13L11 4.635L8.5 7.07L9.09 10.51L6 8.885L2.91 10.51L3.5 7.07L1 4.635L4.455 4.13L6 1Z" 
                                  fill="#51218F" stroke="#51218F" strokeWidth="0.5" />
                          </svg>
                          <svg width="7.8" height="7.3" viewBox="0 0 12 12" className="mr-[2px]">
                            <path d="M6 1L7.545 4.13L11 4.635L8.5 7.07L9.09 10.51L6 8.885L2.91 10.51L3.5 7.07L1 4.635L4.455 4.13L6 1Z" 
                                  fill="#51218F" stroke="#51218F" strokeWidth="0.5" />
                          </svg>
                          <svg width="7.8" height="7.3" viewBox="0 0 12 12" className="mr-[2px]">
                            <path d="M6 1L7.545 4.13L11 4.635L8.5 7.07L9.09 10.51L6 8.885L2.91 10.51L3.5 7.07L1 4.635L4.455 4.13L6 1Z" 
                                  fill="#51218F" stroke="#51218F" strokeWidth="0.5" />
                          </svg>
                          <svg width="7.8" height="7.3" viewBox="0 0 12 12">
                            <path d="M6 1L7.545 4.13L11 4.635L8.5 7.07L9.09 10.51L6 8.885L2.91 10.51L3.5 7.07L1 4.635L4.455 4.13L6 1Z" 
                                  fill="#C4C4C4" stroke="#51218F" strokeWidth="0.5" />
                          </svg>
                        </div>
                        
                        {/* Rating text */}
                        <span className="font-outfit font-normal text-[12px] leading-[100%] text-[#2A1E1780] whitespace-nowrap">
                          {profile.rating}
                        </span>
                      </div>
                      
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
              })}
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
                {/* Top text - Pradeep */}
                <div className="w-full h-[27px] opacity-100 mb-2">
                  <h3 className="font-bold text-[22px] leading-[100%] text-[#2A1E17] text-center">
                    Pradeep
                  </h3>
                </div>

                {/* Bottom para - UI/UX designer */}
                <div className="w-full h-[18px] opacity-100 mb-6">
                  <p className="font-medium text-[14px] leading-[100%] text-[#2A1E17E5] text-center">
                    UI/UX designer
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

                  {/* Right text - 75% */}
                  <div className="text-right">
                    <span className="font-bold text-[14px] leading-[100%] text-[#2A1E17]">
                      75%
                    </span>
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="w-full max-w-[341px] h-[6px] opacity-100 mb-8 rounded-full bg-gray-200 overflow-hidden">
                  {/* Progress bar fill - 75% of 341px = 276px */}
                  <div
                    className="h-full rounded-full border-0"
                    style={{
                      width: '75%',
                      backgroundColor: '#51218F',
                    }}
                  />
                </div>

                {/* Complete your profile button */}
                <button
                  className="w-full max-w-[210px] h-[39px] opacity-100 rounded-[100px] flex items-center justify-center px-[36px] py-[12px] gap-[10px] bg-transparent hover:bg-[#51218F] hover:text-white transition-all duration-200 cursor-pointer mb-3 group border border-[#51218F]"
                >
                  <span className="font-bold text-[12px] leading-[100%] text-[#51218F] group-hover:text-white">
                    Complete your profile
                  </span>
                </button>

                {/* Last bottom para */}
                <div className="w-full max-w-[341px] opacity-100">
                  <p className="font-normal italic text-[12px] leading-[100%] text-[#2A1E17E5] text-center">
                    100% completion of your profile will help you get more reach.
                  </p>
                </div>
              </div>

              {/* ========== RIGHT SIDEBAR - VERIFICATION CARD ========== */}
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
                  {/* Left side with icon and text */}
                  <div className="flex items-center gap-[12px]">
                    {/* User SVG icon */}
                    <div className="w-[20px] h-[20px] opacity-100">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2A1E17"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>

                    {/* Text */}
                    <span className="font-outfit font-normal text-[16px] leading-[100%] text-[#2A1E17] whitespace-nowrap">
                      Identity verified
                    </span>
                  </div>

                  {/* Right verify button */}
                  <button className="w-[46px] h-[20px] opacity-100 bg-transparent hover:opacity-80 transition-opacity duration-200 cursor-pointer">
                    <span className="font-medium text-[16px] leading-[100%] text-[#51218F] whitespace-nowrap">
                      Verify
                    </span>
                  </button>
                </div>

                {/* Phone verified section */}
                <div className="w-full h-[20px] opacity-100 mb-6 flex items-center justify-between">
                  {/* Left side with icon and text */}
                  <div className="flex items-center gap-[12px]">
                    {/* Phone SVG icon */}
                    <div className="w-[20px] h-[20px] opacity-100">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2A1E17"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </div>

                    {/* Text */}
                    <span className="font-outfit font-normal text-[16px] leading-[100%] text-[#2A1E17] whitespace-nowrap">
                      Phone verified
                    </span>
                  </div>

                  {/* Right verify button */}
                  <button className="w-[46px] h-[20px] opacity-100 bg-transparent hover:opacity-80 transition-opacity duration-200 cursor-pointer">
                    <span className="font-medium text-[16px] leading-[100%] text-[#51218F] whitespace-nowrap">
                      Verify
                    </span>
                  </button>
                </div>

                {/* Email verified section */}
                <div className="w-full h-[20px] opacity-100 flex items-center justify-between">
                  {/* Left side with icon and text */}
                  <div className="flex items-center gap-[12px]">
                    {/* Email SVG icon */}
                    <div className="w-[20px] h-[20px] opacity-100">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2A1E17"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </div>

                    {/* Text */}
                    <span className="font-outfit font-normal text-[16px] leading-[100%] text-[#2A1E17] whitespace-nowrap">
                      Email verified
                    </span>
                  </div>

                  {/* Right verify button */}
                  <button className="w-[46px] h-[20px] opacity-100 bg-transparent hover:opacity-80 transition-opacity duration-200 cursor-pointer">
                    <span className="font-medium text-[16px] leading-[100%] text-[#51218F] whitespace-nowrap">
                      Verify
                    </span>
                  </button>
                </div>
              </div>

            {/* ========== RIGHT SIDEBAR - GRADIENT PROMO CARD ========== */}
<div className="relative">
  {/* Main card with overflow-hidden */}
  <div className="w-full h-[98px] opacity-100 rounded-[10px] shadow-[0px_4px_45px_0px_#0000001F] overflow-hidden relative"
    style={{
      background: 'linear-gradient(266.38deg, #51218F 4.44%, #020202 100.18%)',
    }}
  >
    {/* Background image */}
    <div className="absolute inset-0 z-0 rounded-[10px] overflow-hidden">
      <img 
        src={HomeSub} 
        alt="Promotional background" 
        className="w-full h-full object-cover opacity-30"
      />
    </div>

    {/* Text content container */}
    <div className="relative z-10 h-full flex items-center pl-6 pr-24">
      {/* Text with proper padding - exactly two lines */}
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
  
  {/* Circle with arrow - positioned outside the card */}
  <div onClick={() => navigate("/subscription")} 
    className="absolute w-[60px] h-[60px] lg:w-[98px] lg:h-[98px] top-1/2 right-[-15px] lg:right-[-30px] transform -translate-y-1/2 opacity-100 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200 z-10 shadow-lg"
    style={{
      background: 'linear-gradient(180deg, #FFA412 0%, #6C4343 100%)',
    }}
  >
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="white" 
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  </div>
</div>

              {/* ============Right side bottom div============ */}
              <div className="w-full h-[287px] opacity-100 rounded-[10px] bg-white shadow-lg p-6">
                {/* Top section with "All Job" and "Total: 10" */}
                <div className="flex justify-between items-center mb-8">
                  {/* "All Job" text */}
                  <div>
                    <h3 className="font-montserrat font-medium text-[20px] leading-[100%] text-[#2A1E17]">
                      All Job
                    </h3>
                  </div>
                  
                  {/* "Total: 10" text */}
                  <div className="flex items-center gap-1">
                    <span className="font-montserrat font-medium text-[16px] leading-[100%] text-[#2A1E17]">
                      Total:
                    </span>
                    <span className="font-montserrat font-bold text-[20px] leading-[100%] text-[#2A1E17]">
                      10
                    </span>
                  </div>
                </div>
                
                {/* Status items container */}
                <div className="space-y-6 mb-8">
                  {/* Active projects item */}
                  <div className="flex items-center">
                    {/* Icon/image */}
                    <div className="w-[20px] h-[19px] mr-3 flex items-center justify-center">
                      <img 
                        src={Folder} 
                        alt="Active projects" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    {/* Text */}
                    <div>
                      <p className="font-montserrat text-[16px] leading-[100%] text-[#2A1E17E5]">
                        <span className="font-bold">Active projects:</span>
                        <span className="font-medium"> 02</span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Completed projects item */}
                  <div className="flex items-center">
                    {/* Icon/image */}
                    <div className="w-[20px] h-[19px] mr-3 flex items-center justify-center">
                      <img 
                        src={Cloud} 
                        alt="Completed projects" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    {/* Text */}
                    <div>
                      <p className="font-montserrat text-[16px] leading-[100%] text-[#2A1E17E5]">
                        <span className="font-bold">Completed:</span>
                        <span className="font-medium"> 05</span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Canceled projects item */}
                  <div className="flex items-center">
                    {/* Icon/image */}
                    <div className="w-[20px] h-[19px] mr-3 flex items-center justify-center">
                      <img 
                        src={Cancel} 
                        alt="Canceled projects" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    {/* Text */}
                    <div>
                      <p className="font-montserrat text-[16px] leading-[100%] text-[#2A1E17E5]">
                        <span className="font-bold">Canceled:</span>
                        <span className="font-medium"> 03</span>
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Bottom button */}
                <div className="flex justify-center">
                  <button
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