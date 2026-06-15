import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Slide1 from "../../assets/Landing/Slide1.png";
import Profilepic from "../../assets/Landing/Profilepic.png";
import Penicon from "../../assets/Landing/Penicon.png";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";


export default function CreatorProfile() {
  const navigate = useNavigate();

  // Controlled state for every required field
  const [name, setName] = useState("");
  const [creatorCategory, setCreatorCategory] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [primaryNiche, setPrimaryNiche] = useState("");
  const [secondaryNiche, setSecondaryNiche] = useState(""); // optional
  const [platform, setPlatform] = useState("");
  const [followers, setFollowers] = useState("");
  const [portfolioCategory, setPortfolioCategory] = useState("");
  const [location, setLocation] = useState("");
  const [collabType, setCollabType] = useState(""); // radio
  const [projectType, setProjectType] = useState(""); // radio

  const fileInputRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  // Refs for focusing on missing elements
  const nameRef = useRef(null);
  const creatorCategoryRef = useRef(null);
  const experienceRef = useRef(null);
  const primaryNicheRef = useRef(null);
  const platformRef = useRef(null);
  const followersRef = useRef(null);
  const portfolioRef = useRef(null);
  const uploadRef = useRef(null);
  const locationRef = useRef(null);

  function onFileChange(e) {
    const file = e.target.files && e.target.files[0];
    setUploadedFile(file || null);
  }

 function handleSubmit(e) {
  e.preventDefault();

  if (!name.trim()) {
    toast.error("Please enter your name.");
    nameRef.current?.focus();
    return;
  }
  if (!creatorCategory) {
    toast.error("Please select a Creator Category.");
    creatorCategoryRef.current?.focus();
    return;
  }
  if (!experienceLevel) {
    toast.error("Please select your Experience level.");
    experienceRef.current?.focus();
    return;
  }
  if (!primaryNiche) {
    toast.error("Please select a Primary Niche.");
    primaryNicheRef.current?.focus();
    return;
  }
  if (!platform) {
    toast.error("Please select a Platform.");
    platformRef.current?.focus();
    return;
  }
  if (!followers) {
    toast.error("Please select your Follower/subscribers range.");
    followersRef.current?.focus();
    return;
  }
  if (!portfolioCategory) {
    toast.error("Please select a Portfolio category.");
    portfolioRef.current?.focus();
    return;
  }
  if (!uploadedFile) {
    toast.error("Please upload at least one portfolio file.");
    fileInputRef.current?.click();
    return;
  }
  if (!collabType) {
    toast.error("Please select a Collaboration type.");
    return;
  }
  if (!projectType) {
    toast.error("Please select a Project type preference.");
    return;
  }
  if (!location) {
    toast.error("Please select your Location.");
    locationRef.current?.focus();
    return;
  }

  navigate("/creator-success");
}


  return (
     <section className="relative mx-auto overflow-hidden w-full max-w-[1440px] min-h-screen bg-[linear-gradient(180deg,#3D1768_0%,#030303_100%)] opacity-100 pb-20">
      
      {/* Background image */}
      <img
        src={Slide1}
        alt=""
        // {/* UPDATED: Added object-cover and w-full to ensure bg scales */}
        className="absolute left-0 w-full h-[1180px] top-[-16px] z-10 opacity-100 object-cover"
      />

      {/* Background Overlay */}
      <div className="absolute left-0 top-0 w-full h-full bg-[linear-gradient(180deg,#3D1768_0%,#030303_100%)] opacity-100 z-0" />

      {/* Centered card Container */}
      {/* UPDATED: 
          1. Removed absolute positioning (top/left).
          2. Used flex/mx-auto for centering.
          3. Added responsive width (w-[95%] on mobile, max-w on desktop).
          4. Added margin-top to push it down visually. 
      */}
      <div className="relative z-20 w-[95%] max-w-[878px] mx-auto mt-[150px] md:mt-[382px] shadow-xl rounded-[32px]  p-[14px] bg-gradient-to-b from-[#6D2EFF]/70 to-[#431A85]/70">
        
        {/* Inner Card White Background */}
        {/* UPDATED: Changed fixed width/height to w-full/h-auto to fit parent */}
        <div className="w-full h-auto min-h-[1765px] rounded-[32px] bg-[rgba(255,255,255,1)] border border-black shadow-xl relative overflow-hidden pb-10">
          
          {/* Arrow button */}
          <button className="absolute flex items-center justify-center text-[24px] w-[48px] h-[48px] top-[34px] left-[31px] rounded-[30px] border border-[rgba(138,56,245,0.2)] bg-[linear-gradient(180deg,rgba(3,3,3,0.9)_0%,rgba(81,33,143,0.9)_100%)] backdrop-blur-[90px] text-white cursor-pointer z-50">
            ←
          </button>

          {/* HEADER SECTION - Replaced absolute positioning with Flex column */}
          <div className="flex flex-col items-center pt-24 md:pt-[28px] px-4">
            
            {/* Title */}
            {/* UPDATED: Responsive font size (text-3xl -> md:text-[48px]) and width */}
            <h1 className="w-full text-3xl md:text-[48px] font-['Trochut'] font-bold leading-tight text-center bg-[linear-gradient(270deg,#3D1768_22.62%,#030303_100%)] bg-clip-text text-transparent">
              Talenta
            </h1>

            {/* Subtitle */}
            {/* UPDATED: Responsive font size and margins */}
            <h2 className="w-full text-2xl md:text-[42px] font-['Milonga'] font-normal text-center bg-[linear-gradient(270deg,#3D1768_22.62%,#030303_100%)] bg-clip-text text-transparent">
              Set-up your creator profile
            </h2>

            {/* Description */}
            <p className="w-full max-w-[666px] text-base md:text-[20px] font-['Poppins'] font-normal text-center leading-relaxed bg-[linear-gradient(270deg,#3D1768_22.62%,#030303_100%)] bg-clip-text text-transparent">
              Tell us more about your work so we can personalize the <br className="hidden md:block" /> collaboration for you
            </p>

            {/* Profile Image Section */}
            <div className="relative mt-4 md:mt-8 w-[200px] h-[200px]">
              <img
                src={Profilepic}
                alt="profile"
                className="w-full h-full rounded-full border-[3px] border-[#C8A7FF] object-cover"
              />
              <input
                id="editImageInput"
                type="file"
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => document.getElementById("editImageInput").click()}
                className="absolute bottom-4 right-4 w-[24px] h-[24px] rounded-full flex items-center justify-center bg-white shadow-md hover:bg-gray-50"
              >
                <img src={Penicon} className="w-[24px] h-[24px]" alt="edit" />
              </button>
            </div>
          </div>

          {/* FORM SECTION */}
          {/* UPDATED: 
              1. Removed absolute positioning.
              2. Used w-full max-w-[636px] mx-auto for centering.
              3. Added padding for mobile screens.
          */}
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-[636px] mx-auto mt-12 flex flex-col gap-[19px] px-4 md:px-0 z-[21]"
          >
            {/* 1) Creator name title */}
            <div className="w-full">
              <p className="font-['Poppins'] font-semibold text-xl md:text-[28px] leading-[100%] text-black mb-2">
                Creator name
              </p>
              <input
                ref={nameRef}
                type="text"
                placeholder="keerthana"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                // {/* UPDATED: Input is now w-full to adapt to container */}
                className="w-full h-[56px] !border !border-[rgba(0,0,0,1)] rounded-[12px] px-4 font-['Poppins'] font-medium text-[16px] bg-[rgba(255,255,255,1)] text-[rgba(81,33,143,1)] outline-none"
              />
            </div>

            {/* 2) Creator Type block */}
            <div className="w-full mt-4">
              <div className="font-['Poppins'] font-semibold text-xl md:text-[28px] leading-[100%] text-black">
                Creator Type
              </div>

              {/* UPDATED: Flex-col for mobile, Flex-row for desktop */}
              <div className="flex flex-col md:flex-row items-start justify-between w-full mt-3 gap-4 md:gap-0">
                <div className="w-full md:w-[48%]">
                  <div className="font-['Poppins'] font-medium text-lg md:text-[24px] leading-[100%] text-black">
                    Creator Category
                  </div>
                  <div className="mt-2">
                    <select
                      ref={creatorCategoryRef}
                      value={creatorCategory}
                      onChange={(e) => setCreatorCategory(e.target.value)}
                      // {/* UPDATED: w-full for mobile responsiveness */}
                      className="w-full h-[56px] rounded-[12px] !border !border-[rgba(0,0,0,1)] font-['Poppins'] font-medium text-[16px] bg-white text-[rgba(81,33,143,1)] px-4"
                    >
                      <option value="">Select category</option>
                      <option value="uiux">UI/UX designer</option>
                      <option value="photography">Photography</option>
                      <option value="writing">Writing</option>
                    </select>
                  </div>
                </div>

                <div className="w-full md:w-[48%]">
                  <div className="font-['Poppins'] font-medium text-lg md:text-[24px] leading-[100%] text-black">
                    Experience level
                  </div>
                  <div className="mt-2">
                    <select
                      ref={experienceRef}
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="w-full h-[56px] rounded-[12px] !border !border-[rgba(0,0,0,1)] font-['Poppins'] font-medium text-[16px] bg-white text-[rgba(81,33,143,1)] px-4"
                    >
                      <option value="">Select experience</option>
                      <option value="expert">Expert</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="beginner">Beginner</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <div className="font-['Poppins'] font-normal text-sm md:text-[17px] text-[rgba(81,33,143,1)]">
                  This helps us to personalize you experience
                </div>
              </div>
            </div>

            {/* 3) Niche / Specialty block */}
            <div className="w-full mt-4">
              <div className="font-['Poppins'] font-semibold text-xl md:text-[28px] leading-[100%] text-black">
                Niche / Specialty
              </div>

              {/* UPDATED: Flex-col on mobile */}
              <div className="flex flex-col md:flex-row items-start justify-between w-full mt-3 gap-4 md:gap-0">
                <div className="w-full md:w-[48%]">
                  <div className="font-['Poppins'] font-medium text-lg md:text-[24px] leading-[100%] text-black">
                    Primary Niche
                  </div>
                  <div className="mt-2">
                    <select
                      ref={primaryNicheRef}
                      value={primaryNiche}
                      onChange={(e) => setPrimaryNiche(e.target.value)}
                      className="w-full h-[56px] rounded-[12px] !border !border-[rgba(0,0,0,1)] font-['Poppins'] font-medium text-[16px] bg-white text-[rgba(81,33,143,1)] px-4"
                    >
                      <option value="">Select primary</option>
                      <option value="art">Art & design</option>
                      <option value="fashion">Fashion</option>
                      <option value="tech">Tech</option>
                    </select>
                  </div>
                </div>

                <div className="w-full md:w-[48%]">
                  <div className="font-['Poppins'] font-medium text-lg md:text-[24px] leading-[100%] text-black">
                    Secondary Niche (opt)
                  </div>
                  <div className="mt-2">
                    <select
                      value={secondaryNiche}
                      onChange={(e) => setSecondaryNiche(e.target.value)}
                      className="w-full h-[56px] rounded-[12px] !border !border-[rgba(0,0,0,1)] font-['Poppins'] font-medium text-[16px] bg-white text-[rgba(81,33,143,1)] px-4"
                    >
                      <option value="">None</option>
                      <option value="fashion">Fashion</option>
                      <option value="lifestyle">Lifestyle</option>
                      <option value="food">Food</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <p className="font-['Poppins'] text-sm md:text-[15px] text-[rgba(81,33,143,1)]">
                  This helps us to know where your content is focused
                </p>
              </div>
            </div>

            {/* 4) Audience stats */}
            <div className="w-full mt-4">
              <div className="font-['Poppins'] font-semibold text-xl md:text-[28px] leading-[100%] text-black">
                Audience stats
              </div>

              {/* UPDATED: Flex-col on mobile */}
              <div className="flex flex-col md:flex-row items-start justify-between w-full mt-3 gap-4 md:gap-0">
                <div className="w-full md:w-[48%]">
                  <div className="font-['Poppins'] font-medium text-lg md:text-[24px] leading-[100%] text-black">
                    Platforms
                  </div>
                  <div className="mt-2">
                    <select
                      ref={platformRef}
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full h-[56px] rounded-[12px] !border !border-[rgba(0,0,0,1)] font-['Poppins'] font-medium text-[16px] bg-white text-[rgba(81,33,143,1)] px-4"
                    >
                      <option value="">Select platform</option>
                      <option value="instagram">Instagram</option>
                      <option value="youtube">YouTube</option>
                      <option value="tiktok">TikTok</option>
                    </select>
                  </div>
                </div>

                <div className="w-full md:w-[48%]">
                  <div className="font-['Poppins'] font-medium text-lg md:text-[24px] leading-[100%] text-black">
                    Follower/subscribers
                  </div>
                  <div className="mt-2">
                    <select
                      ref={followersRef}
                      value={followers}
                      onChange={(e) => setFollowers(e.target.value)}
                      className="w-full h-[56px] rounded-[12px] !border !border-[rgba(0,0,0,1)] font-['Poppins'] font-medium text-[16px] bg-white text-[rgba(81,33,143,1)] px-4"
                    >
                      <option value="">Select range</option>
                      <option value="10000">10000+</option>
                      <option value="5000">5k-10k</option>
                      <option value="1000">1k-5k</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <p className="font-['Poppins'] text-sm md:text-[15px] text-[rgba(81,33,143,1)]">
                  This helps collaborator under your reach you can update it anytime
                </p>
              </div>
            </div>

            {/* 5) Portfolio block */}
            <div className="w-full mt-4">
              <div className="font-['Poppins'] font-semibold text-xl md:text-[28px] leading-[100%] text-black">
                Portfolio
              </div>

              {/* UPDATED: Flex-col on mobile */}
              <div className="flex flex-col md:flex-row items-start justify-between w-full mt-3 gap-4 md:gap-0">
                <div className="w-full md:w-[48%]">
                  <div className="font-['Poppins'] font-medium text-lg md:text-[24px] leading-[100%] text-black">
                    Portfolio category
                  </div>
                  <div className="mt-2">
                    <select
                      ref={portfolioRef}
                      value={portfolioCategory}
                      onChange={(e) => setPortfolioCategory(e.target.value)}
                      className="w-full h-[56px] rounded-[12px] !border !border-[rgba(0,0,0,1)] font-['Poppins'] font-medium text-[16px] bg-white text-[rgba(81,33,143,1)] px-4"
                    >
                      <option value="">Select portfolio</option>
                      <option value="ui">UI designs</option>
                      <option value="branding">Branding</option>
                      <option value="illustration">Illustration</option>
                    </select>
                  </div>
                </div>

                <div className="w-full md:w-[48%]">
                  <div className="font-['Poppins'] font-medium text-lg md:text-[24px] leading-[100%] text-black">
                    Upload
                  </div>
                  <div className="mt-2">
                    <input
                      ref={fileInputRef}
                      id="portfolio-upload"
                      type="file"
                      className="hidden"
                      onChange={onFileChange}
                    />
                    <label
                      htmlFor="portfolio-upload"
                      ref={uploadRef}
                      // {/* UPDATED: w-full for mobile */}
                      className="w-full h-[56px] rounded-[12px] !border !border-[rgba(0,0,0,1)] font-['Poppins'] font-medium text-[16px] bg-white text-[rgba(81,33,143,1)] flex items-center px-4 cursor-pointer"
                    >
                      {uploadedFile ? uploadedFile.name : "Upload samples"}
                      <span className="ml-auto text-[24px] font-semibold text-[rgba(81,33,143,1)]">
                        ⬆
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <p className="font-['Poppins'] text-sm md:text-[15px] text-[rgba(81,33,143,1)]">
                  This helps collaborator under your reach you can update it anytime
                </p>
              </div>
            </div>

            {/* 6) Preferences & Project type */}
            {/* UPDATED: Flex-col on mobile */}
            <div className="w-full flex flex-col md:flex-row items-start justify-between mt-4 gap-6 md:gap-0">
              <div className="w-full md:w-[48%]">
                <div className="font-['Poppins'] font-semibold text-xl md:text-[28px] leading-[100%] text-black">
                  Preferences
                </div>
                <div className="font-['Poppins'] font-medium text-lg md:text-[24px] leading-[100%] text-black mt-2">
                  Collaboration type
                </div>

                <div className="mt-3 space-y-2">
                  <label className="flex items-center gap-3 font-['Poppins'] text-[16px]">
                    <input
                      type="radio"
                      name="collab"
                      value="paid"
                      checked={collabType === "paid"}
                      onChange={() => setCollabType("paid")}
                      className="accent-[#6F2DBD]"
                    />
                    Paid projects
                  </label>
                  <label className="flex items-center gap-3 font-['Poppins'] text-[16px]">
                    <input
                      type="radio"
                      name="collab"
                      value="skills"
                      checked={collabType === "skills"}
                      onChange={() => setCollabType("skills")}
                      className="accent-[#6F2DBD]"
                    />
                    Skills Exchange
                  </label>
                  <label className="flex items-center gap-3 font-['Poppins'] text-[16px]">
                    <input
                      type="radio"
                      name="collab"
                      value="longterm"
                      checked={collabType === "longterm"}
                      onChange={() => setCollabType("longterm")}
                      className="accent-[#6F2DBD]"
                    />
                    Long-Terms Partnerships
                  </label>
                </div>
              </div>

              <div className="w-full md:w-[48%]">
                {/* Added spacing for mobile visual hierarchy */}
                <div className="font-['Poppins'] font-medium text-lg md:text-[24px] leading-[100%] text-black md:mt-9">
                  Project type you prefer
                </div>
                <div className="mt-3 space-y-2">
                  <label className="flex items-center gap-3 font-['Poppins'] text-[16px]">
                    <input
                      type="radio"
                      name="project"
                      value="long"
                      checked={projectType === "long"}
                      onChange={() => setProjectType("long")}
                      className="accent-[#6F2DBD]"
                    />
                    Long term project
                  </label>
                  <label className="flex items-center gap-3 font-['Poppins'] text-[16px]">
                    <input
                      type="radio"
                      name="project"
                      value="short"
                      checked={projectType === "short"}
                      onChange={() => setProjectType("short")}
                      className="accent-[#6F2DBD]"
                    />
                    Short term project
                  </label>
                  <label className="flex items-center gap-3 font-['Poppins'] text-[16px]">
                    <input
                      type="radio"
                      name="project"
                      value="one"
                      checked={projectType === "one"}
                      onChange={() => setProjectType("one")}
                      className="accent-[#6F2DBD]"
                    />
                    One-Time task
                  </label>
                </div>
              </div>
            </div>

            {/* 7) Location */}
            <div className="w-full mt-4">
              <div className="font-['Poppins'] font-medium text-xl md:text-[24px] leading-[100%] text-black mb-2">
                Location
              </div>
              <select
                ref={locationRef}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                // {/* UPDATED: w-full for responsiveness */}
                className="w-full h-[56px] rounded-[12px] !border !border-[rgba(0,0,0,1)] flex items-center px-4 bg-white text-[rgba(81,33,143,1)]"
              >
                <option value="">Select location</option>
                <option value="india">India</option>
                <option value="usa">United States</option>
                <option value="uk">United Kingdom</option>
              </select>
            </div>

            {/* 8) Submit button (gradient) */}
            <div className="w-full mt-4 mb-8">
              <button
                type="submit"
                // {/* UPDATED: w-full to fill container */}
                className="w-full h-[48px] rounded-[24px] bg-gradient-to-r from-[#3D1768] via-[#5A2A86] to-[#000000] text-white font-['Poppins'] font-medium shadow-lg hover:opacity-90 transition-opacity"
              >
                Set up Your profile
              </button>
            </div>
          </form>
        </div>
      </div>


    </section>
  );
}
