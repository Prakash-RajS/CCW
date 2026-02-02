import React, { useState } from 'react';
import Header from "../../component/Header";
import Footer from "../../component/Footer";
import HomeBg from "../../assets/AfterSign/HomeBg.png";
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
import flag from "../../assets/Mywork/flag.png";
import { useNavigate } from "react-router-dom";
import SavedDraft from "./SavedDraft";

const JobCreated = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const [showAllJobsPopup, setShowAllJobsPopup] = useState(false);

  const navigate = useNavigate();

  const initialProfiles = [
    {
      id: 1,
      name: "James",
      jobTitle: "UX Designer, Graphic Designer",
      hourlyRate: "$10.00 /hr",
      totalEarnings: "Total earnings $36k on web & mobile design",
      rating: "4/5 (12 Reviews)",
      location: "Chennai, India",
      countryFlag: Ind,
      isOnline: true,
      skills: ["Web design", "Wireframe", "Prototype"],
      dpImage: Dp1,
      badge: "Top rated",
    },
    {
      id: 2,
      name: "Sebastian",
      jobTitle: "Graphic Designer",
      hourlyRate: "$50.00 /hr",
      totalEarnings: "Total earnings $76k on web & mobile design",
      rating: "4/5 (12 Reviews)",
      location: "Manhattan, USA",
      countryFlag: USAFlag,
      isOnline: true,
      skills: ["Poster design", "Mobile design", "Photoshop"],
      dpImage: Dp2,
      badge: "",
    },
    {
      id: 3,
      name: "Ezra",
      jobTitle: "UI Designer",
      hourlyRate: "$10.00 /hr",
      totalEarnings: "Total earnings $36k on web & mobile design",
      rating: "4/5 (12 Reviews)",
      location: "Beijing, CHINA",
      countryFlag: UKFlag,
      isOnline: false,
      skills: ["Figma", "Social media", "Web design"],
      dpImage: Dp3,
      badge: "",
    },
    {
      id: 4,
      name: "Bhuvesh Singh",
      jobTitle: "Video Editor",
      hourlyRate: "$40.00 /hr",
      totalEarnings: "Total earnings $56k on web & mobile design",
      rating: "4/5 (12 Reviews)",
      location: "Tokyo, JAPAN",
      countryFlag: CanadaFlag,
      isOnline: true,
      skills: ["Video effects", "Colour grad", "Graphics"],
      dpImage: Dp4,
      badge: "",
    }
  ];

  return (
    <div className="w-full min-h-screen flex flex-col overflow-x-hidden relative bg-gray-50">
      <section className="w-full flex flex-col items-center justify-start px-4 relative min-w-0">
        {/* Background Image */}
        <div
          className="absolute top-[-104px] left-0 w-full h-[382px] md:h-[582px] z-0"
          style={{
            backgroundImage: `url(${HomeBg})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="absolute inset-0 bg-black opacity-30" />
        </div>

        {/* Welcome Text */}
        <div className="absolute top-[70px] max-[420px]:top-[60px] lg:top-[187px] w-full flex items-center justify-center z-10">
          <h1
            className="text-[20px] max-[420px]:text-[18px] lg:text-[48px] leading-tight text-center text-white font-normal"
            style={{ fontFamily: "Milonga" }}
          >
            Welcome back,<br className="sm:hidden" /> Pradeep
          </h1>
        </div>

        <Header />

        {/* ==================== MAIN LAYOUT ==================== */}
        <div className="
          w-full max-w-[1400px] mx-auto
          mt-[240px] max-[420px]:mt-[210px] lg:mt-[412px]
          pb-12 lg:pb-24
          px-4 max-[420px]:px-3 sm:px-6 lg:px-8 xl:px-10
          flex flex-col lg:flex-row lg:gap-8 xl:gap-10
        ">
          {/* ==================== MAIN CONTENT (LEFT on desktop) ==================== */}
          <main className="w-full lg:w-[780px] xl:w-[860px] flex flex-col gap-5 lg:gap-6 order-2 lg:order-1">
            {/* Job Posted Card */}
           <div className="w-full rounded-[8px] bg-white shadow-md p-4 max-[420px]:p-3">
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 max-[420px]:mb-2">
    <h3 className="font-semibold text-[15px] max-[420px]:text-[13px] sm:text-[16px] lg:text-[18px] text-[#2A1E17]">
      Your Had Posted a Job
    </h3>
    <button
      onClick={() => setShowAllJobsPopup(true)}
      className="ring-1 ring-[#51218F] rounded-full px-3 py-1.5 max-[420px]:px-2.5 max-[420px]:py-1 text-[#51218F] text-[10px] max-[420px]:text-[9px] font-bold hover:bg-[#51218F] hover:text-white transition-all whitespace-nowrap"
    >
      View all jobs
    </button>
  </div>
  <div className="w-full h-px bg-gray-200 mb-3 max-[420px]:mb-2" />
  <div className="flex flex-col sm:flex-row justify-between gap-3 text-[12px] max-[420px]:text-[11px]">
    <div>
      <p className="font-bold">Hospital Management - Home Page</p>
      <p className="text-gray-600 mt-0.5 max-[420px]:mt-0">
        Fixed-price · Intermediate · Est. Budget $2,000 · 8h ago
      </p>
    </div>
    <div className="flex gap-6 max-[420px]:gap-4">
      <div>
        <p className="font-bold">Proposals</p>
        <p className="text-gray-600">24</p>
      </div>
      <div>
        <p className="font-bold">Hired</p>
        <p className="text-gray-600">01</p>
      </div>
    </div>
  </div>
</div>


<div className="w-full bg-white rounded-[10px] shadow-lg p-4 flex flex-col items-center md:hidden">
  {/* Profile image and name section */}
  <div className="flex items-center gap-3 mb-3 w-full">
    <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
      <img 
        src={Dp1} // Replace with your image path
        alt="Pradeep"
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.parentElement.classList.add('bg-purple-100');
        }}
      />
    </div>
    <div>
      <h3 className="font-bold text-[16px] text-[#2A1E17]">Pradeep</h3>
      <p className="text-[12px] text-[#2A1E17E5]">UI/UX designer</p>
    </div>
  </div>

  {/* Divider line */}
  <div className="w-full h-[1px] bg-gray-200 mb-3"></div>

  {/* Progress section */}
  <div className="w-full mb-3">
    <div className="flex justify-between font-bold text-[12px] mb-1">
      <span>Set up your account</span>
      <span className="text-[#51218F]">75%</span>
    </div>
    <div className="w-full h-[5px] bg-gray-200 rounded-full">
      <div className="h-full bg-[#51218F] rounded-full" style={{ width: '75%' }} />
    </div>
  </div>

  {/* Button */}
  <button 
    style={{ border: '1px solid #51218F' }}
    className="w-full rounded-full py-2 text-[#51218F] font-bold text-[11px] cursor-pointer hover:bg-[#51218F] hover:text-white transition-all duration-200"
  >
    Complete your profile
  </button>
</div>
            {/* Mobile-only sidebar elements */}
        <div className="relative md:hidden"> {/* Hide on md and larger */}
          
  {/* Main card with responsive height */}
  <div className="w-full h-[65px] sm:h-[75px] md:h-[98px] opacity-100 rounded-[10px] shadow-[0px_4px_45px_0px_#0000001F] overflow-hidden relative"
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
    <div className="relative z-10 h-full flex items-center pl-4 sm:pl-5 md:pl-6 pr-16 sm:pr-20 md:pr-24">
      {/* Text with proper padding - exactly two lines */}
      <div>
        <div className="font-medium text-[13px] sm:text-[15px] md:text-[18px] leading-tight text-white whitespace-nowrap">
          Get Subscription for getting
        </div>
        <div className="font-medium text-[13px] sm:text-[15px] md:text-[18px] leading-tight text-white whitespace-nowrap">
          more revenue in a month
        </div>
      </div>
    </div>
  </div>

  {/* Circle with arrow - responsive sizing */}
  <div
    className="absolute w-[68px] h-[68px] sm:w-[55px] sm:h-[55px] md:w-[65px] md:h-[65px] lg:w-[102px] lg:h-[102px] top-1/2 right-[-19px] sm:right-[-12px] md:right-[-15px] lg:right-[-30px] transform -translate-y-1/2 opacity-100 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200 z-10 shadow-lg"
    style={{
      background: 'linear-gradient(180deg, #FFA412 0%, #6C4343 100%)',
    }}
  >
    <svg
      className="w-[28px] h-[28px] sm:w-[24px] sm:h-[24px] md:w-[30px] md:h-[30px] lg:w-[54px] lg:h-[54px]"
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

            {/* Tabs */}
            <div className="relative">
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200" />
              <div className="flex">
                <button
                  onClick={() => setActiveTab('discover')}
                  className={`relative px-5 py-3 max-[420px]:py-2.5 text-[14px] max-[420px]:text-[13px] font-medium transition-all ${
                    activeTab === 'discover' ? 'text-[#51218F] font-semibold' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Discover Talent
                  {activeTab === 'discover' && (
                    <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#51218F] rounded-t-sm" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`relative px-5 py-3 max-[420px]:py-2.5 text-[14px] max-[420px]:text-[13px] font-medium transition-all ${
                    activeTab === 'saved' ? 'text-[#51218F] font-semibold' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Saved Draft
                  {activeTab === 'saved' && (
                    <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#51218F] rounded-t-sm" />
                  )}
                </button>
              </div>
            </div>

            {/* Tab content */}
            {activeTab === 'discover' ? (
              <div className="space-y-5 max-[420px]:space-y-4">
                <h3 className="font-semibold text-[15px] max-[420px]:text-[14px]">
                  Best matches for you ({initialProfiles.length})
                </h3>

                {initialProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="bg-white rounded-[10px] shadow p-4 max-[420px]:p-3 relative h-[200px] max-[420px]:h-[190px] md:h-[240px]"
                  >
                    {profile.badge && (
                      <span className="absolute top-[-8px] left-14 max-[420px]:left-12 bg-[#51218F] text-white text-[9px] max-[420px]:text-[8px] px-2.5 py-0.5 rounded-full">
                        {profile.badge}
                      </span>
                    )}

                    <div className="flex gap-3 max-[420px]:gap-2.5 mb-3 max-[420px]:mb-2">
                      <div className="relative shrink-0">
                        <img
                          src={profile.dpImage}
                          alt={profile.name}
                          className="w-11 h-11 max-[420px]:w-10 max-[420px]:h-10 rounded-full object-cover"
                        />
                        <div
                          className={`absolute bottom-7 right-0 w-3 h-3 max-[420px]:w-2.5 max-[420px]:h-2.5 rounded-full border-2 border-white ${
                            profile.isOnline ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-[13px] max-[420px]:text-[12px] md:text-[16px] truncate">
                            {profile.name}
                          </h4>
                          <button
                            style={{ border: '1px solid #51218F' }}
                            className="text-[#51218F] rounded-full px-2.5 py-1 text-[9px] max-[420px]:text-[8px] md:px-3 md:text-[11px] font-bold hover:bg-[#51218F] hover:text-white shrink-0"
                          >
                            Invite
                          </button>
                        </div>
                        <p className="text-gray-500 text-[11px] max-[420px]:text-[10px] md:text-[14px] truncate mt-0.5">
                          {profile.jobTitle}
                        </p>
                      </div>
                    </div>

                    <div className="mb-2">
                      <p className="font-bold text-[11px] max-[420px]:text-[10px] md:text-[14px]">
                        {profile.hourlyRate}
                      </p>
                      <p className="text-gray-500 text-[9px] max-[420px]:text-[8px] md:text-[12px] truncate">
                        {profile.totalEarnings}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-[420px]:gap-1 mb-3 max-[420px]:mb-2">
                      {profile.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-[#51218FD9] text-white text-[9px] max-[420px]:text-[8px] px-2 py-0.5 rounded-full flex items-center gap-1"
                        >
                          {skill}
                          <span onClick={() => handleRemoveSkill(profile.id, idx)} className="cursor-pointer text-sm">×</span>
                        </span>
                      ))}
                      <span className="text-[#51218F] text-[10px] max-[420px]:text-[9px] cursor-pointer">more</span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] max-[420px]:text-[9px] md:text-[12px] text-gray-400 mt-auto">
                      <span className="flex items-center text-[#51218F]">
                        ★★★★☆ <span className="ml-1 text-gray-400">{profile.rating}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <img src={profile.countryFlag} className="w-3.5 h-2.5 max-[420px]:h-2" alt="" />
                        {profile.location}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <SavedDraft />
            )}
          </main>

          {/* ==================== RIGHT SIDEBAR (Desktop only) ==================== */}
          <aside className="
            hidden lg:flex lg:flex-col lg:gap-8 xl:gap-10
            w-full lg:w-[380px] xl:w-[420px]
            order-1 lg:order-2
            lg:sticky lg:top-[140px] lg:self-start
          ">
            <button
              onClick={() => navigate("/finder")}
              className="w-[190px] self-end h-[39px] rounded-full bg-gradient-to-r from-[#51218F] to-[#170929] text-white font-bold text-[12px]"
            >
              Find collaborator
            </button>

            <div className="w-full bg-white rounded-[10px] shadow-lg p-6 flex flex-col items-center">
              <h3 className="font-bold text-[22px]">Pradeep</h3>
              <p className="text-[14px] mb-4">UI/UX Designer</p>
              <div className="w-full flex justify-between font-bold text-[14px] mb-2">
                <span>Set up your account</span>
                <span>75%</span>
              </div>
              <div className="w-full h-[6px] bg-gray-200 rounded-full mb-6">
                <div className="h-full bg-[#51218F] rounded-full" style={{ width: '75%' }} />
              </div>
              <button 
  style={{ border: '1px solid #51218F' }}
  className="w-full rounded-full py-3 text-[#51218F] font-bold text-[12px] cursor-pointer hover:bg-[#51218F] hover:text-white transition-all duration-200"
>
  Complete your profile
</button>
            </div>

            {/* Verification */}
            <div className="w-full bg-white rounded-[10px] shadow-lg p-6">
              <h3 className="font-semibold text-[20px] mb-4">Verification</h3>
              <div className="flex flex-col gap-5">
                {['Phone verified', 'Email verified'].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[16px] text-[#2A1E17]">
                    <span>{item}</span>
                    <button className="text-[#51218F] font-medium">Verify</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Gradient Promo */}
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
              <div
                className="absolute w-[65px] h-[65px] lg:w-[102px] lg:h-[102px] top-1/2 right-[-15px] lg:right-[-30px] transform -translate-y-1/2 opacity-100 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200 z-10 shadow-lg"
                style={{
                  background: 'linear-gradient(180deg, #FFA412 0%, #6C4343 100%)',
                }}
              >
                <svg
                  width="54"
                  height="54"
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

            {/* Job Stats */}
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
                  style={{ border: '1px solid #51218F' }}
                  className="w-[122px] h-[39px] opacity-100 rounded-[100px] flex items-center justify-center px-[36px] py-[12px] gap-[10px] bg-transparent hover:bg-[#51218F] hover:text-white transition-all duration-200 cursor-pointer group"
                >
                  <span className="font-montserrat font-bold text-[12px] leading-[100%] text-[#51218F] group-hover:text-white whitespace-nowrap">
                    View all
                  </span>
                </button>
                          </div>
                        </div>
          </aside>
        </div>
      </section>

      {/* ==================== POPUP – CENTERED & RESPONSIVE ==================== */}
      {showAllJobsPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setShowAllJobsPopup(false)}
              className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#51218F] to-[#2a0e4a] text-white hover:opacity-90 transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="px-6 sm:px-10 pt-16 pb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Recent Jobs</h2>

              <div className="space-y-10">
                {[
                  {
                    title: "UI / UX Designer",
                    subtitle: "Fixed-price · Intermediate · Est. Budget $2,000 · Posted 8h ago",
                    desc: "Looking for experienced UI/UX designer for formative years learning platform...",
                  },
                  {
                    title: "UI Designer – Online Learning Platform",
                    subtitle: "Fixed-price · Intermediate · Est. Budget $2,000 · Posted 8h ago",
                    desc: "Design core pages and visual system for new learning platform in Figma...",
                  },
                  {
                    title: "UX Designer – SaaS Dashboard",
                    subtitle: "Hourly · Intermediate · Est. Budget ~$2,000 · Posted 8h ago",
                    desc: "Fix multiple UX issues: document chat confusion, branding unclear...",
                  },
                ].map((job, i) => (
                  <div key={i} className={`pb-8 ${i < 2 ? 'border-b border-gray-200' : ''}`}>
                    <h3 className="font-semibold text-xl text-gray-900 mb-2">{job.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{job.subtitle}</p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {job.desc}
                      <span className="text-[#51218F] font-medium cursor-pointer ml-1">more</span>
                    </p>
                    <div className="flex flex-wrap gap-5 text-sm text-gray-600">
                      <span className="text-[#51218F] font-medium">
                        {job.subtitle.includes("Fixed") ? "Fixed Rate" : "Hourly Rate"}
                      </span>
                      <span className="text-[#51218F]">★★★★☆ 4/5 (12 Reviews)</span>
                      <div className="flex items-center gap-2">
                        <img src={flag} alt="USA" className="w-5 h-3.5 rounded object-cover" />
                        <span>Manhattan, USA</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default JobCreated;