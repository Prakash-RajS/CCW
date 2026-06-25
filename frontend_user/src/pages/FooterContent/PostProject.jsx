import React, { useState } from "react";
// import Footer from "../../component/Footer";
import BannerImg from "../../assets/myproject/banner.png";
import Card from "../../assets/Landing/Card.png";
import { useNavigate } from "react-router-dom";

const PostProject = () => {
  const navigate = useNavigate();
  
  // Create a ref for the target section
  const jobTitleSectionRef = React.useRef(null);
  
  // State to check if user is logged in (replace with your actual auth logic)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Form state for job posting
  const [formData, setFormData] = useState({
    jobTitle: "",
    projectDescription: "",
    skills: "",
    experienceLevel: ""
  });
  
  const [errors, setErrors] = useState({});

  // Check authentication status on component mount
  React.useEffect(() => {
    // Replace this with your actual authentication check
    // Example: Check localStorage, context, or Redux state
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.jobTitle.trim()) newErrors.jobTitle = "Job title is required";
    if (!formData.projectDescription.trim()) newErrors.projectDescription = "Project description is required";
    if (!formData.skills.trim()) newErrors.skills = "At least one skill is required";
    if (!formData.experienceLevel.trim()) newErrors.experienceLevel = "Experience level is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to scroll to Job Title section
  const scrollToJobTitle = () => {
    jobTitleSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const handlePostJob = () => {
    // Scroll to the Job Title section instead of navigating
    scrollToJobTitle();
  };

  const handleSubmitJob = (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    
    if (validateForm()) {
      // Here you would typically make an API call to save the job
      console.log("Job data to submit:", formData);
      
      // Show success message or navigate to dashboard
      alert("Job posted successfully!");
      
      // Reset form or navigate to jobs list
      // navigate("/my-jobs");
    }
  };

  return (
    <>
      {/* ================= MOBILE VERSION ================= */}
      <div className="block md:hidden">
        {/* HERO */}
        <div
          className="relative w-full h-[260px] bg-cover bg-center"
          style={{ backgroundImage: `url(${BannerImg})` }}
        >
          <div className="absolute top-0 w-full z-20 flex justify-between items-center px-4 py-3">
           <h1 className="font-bold text-[32px] leading-[100%] trochut-font cursor-pointer bg-gradient-to-r from-[#B77BFF] to-[#E0B0FF] text-transparent bg-clip-text">
  Talenta
</h1>
            <button
              onClick={() => navigate(-1)}
              className="w-[80px] h-[32px] rounded-[30px] cursor-pointer bg-gradient-to-r from-[#030303] to-[#51218F] hover:opacity-90 transition-opacity flex items-center justify-center"
            >
              <span className="text-white font-semibold text-[12px]">
                Back
              </span>
            </button>
          </div>
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative z-10 flex items-center justify-center h-full">
            <h1 className="text-white text-2xl font-bold">How to Post a Job</h1>
          </div>
        </div>

        {/* CONTENT CARD */}
        <div className="bg-white rounded-t-3xl -mt-10 relative z-10 px-6 pt-6 pb-12 mx-3">
          {/* TOP SECTION */}
          <div className="flex items-start justify-between gap-4 mb-8">
            <div className="flex-1">
              <h2 className="text-xl font-bold leading-tight">
                How to <span className="text-[#7B3FE4]">Post</span> a Job
              </h2>
              <p className="text-gray-600 text-sm mt-2 leading-5">
                Discover the perfect job for yourself, collaborating with amazing clients, on the global work platform.
              </p>
              <button
                onClick={handlePostJob}
                className="mt-4 bg-[#5A2EA6] text-white px-5 py-2 rounded-lg text-xs hover:bg-[#6633C4] transition-all duration-300"
              >
                Post a Job
              </button>
            </div>
            <img
              src={Card}
              alt="card"
              className="w-[100px] h-[120px] rounded-xl object-cover shadow-md flex-shrink-0"
            />
          </div>

          {/* JOB TITLE SECTION with ref */}
          <div ref={jobTitleSectionRef} className="mb-10">
            <h3 className="text-lg font-bold mb-3">Job Title and Description</h3>
            <p className="text-gray-600 text-sm mb-4 leading-5">
              Writing a job description clearly is essential for attracting the right talent for your project. By clearly outlining your project requirements, you'll gain an advantage.
            </p>
            <ul className="space-y-2 text-sm text-gray-700 mb-6">
              <li className="flex gap-2">
                <span className="w-5 h-5 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-xs mt-1 flex-shrink-0">✓</span>
                <span>Choose a job title that accurately reflects the position.</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-xs mt-1 flex-shrink-0">✓</span>
                <span>A job description must explicitly outline the duties and qualifications needed for the role.</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-xs mt-1 flex-shrink-0">✓</span>
                <span>Apply the appropriate format when crafting a project description to enhance its readability.</span>
              </li>
            </ul>
          </div>

          {/* FORM CARD */}
          <form onSubmit={handleSubmitJob}>
            <div className="border border-gray-300 rounded-xl p-5 mb-8 shadow-sm">
              <h3 className="font-semibold text-lg mb-4">Talenta</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-700 block mb-1.5 font-semibold">Job title</label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    placeholder="ex, need Web developer for figma"
                    className={`w-full border ${errors.jobTitle ? 'border-red-500' : 'border-gray-400'} rounded-lg p-3 text-sm`}
                  />
                  {errors.jobTitle && <p className="text-red-500 text-xs mt-1">{errors.jobTitle}</p>}
                </div>
                <div>
                  <label className="text-sm text-gray-700 block mb-1.5 font-semibold">Describe about the project</label>
                  <textarea
                    name="projectDescription"
                    value={formData.projectDescription}
                    onChange={handleInputChange}
                    placeholder="writer here"
                    rows="3"
                    className={`w-full border ${errors.projectDescription ? 'border-red-500' : 'border-gray-400'} rounded-lg p-3 text-sm`}
                  />
                  {errors.projectDescription && <p className="text-red-500 text-xs mt-1">{errors.projectDescription}</p>}
                </div>
                <div>
                  <label className="text-sm text-gray-700 block mb-1.5 font-semibold">Skills</label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder="Web Design, Mockup, UI Design, Photoshop"
                    className={`w-full border ${errors.skills ? 'border-red-500' : 'border-gray-400'} rounded-lg p-3 text-sm`}
                  />
                  {errors.skills && <p className="text-red-500 text-xs mt-1">{errors.skills}</p>}
                </div>
                <div>
                  <label className="text-sm text-gray-700 block mb-1.5 font-semibold">Experience Level</label>
                  <input
                    type="text"
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleInputChange}
                    placeholder="0 1 2 3 4 5 6 7 8 9 10+"
                    className={`w-full border ${errors.experienceLevel ? 'border-red-500' : 'border-gray-400'} rounded-lg p-3 text-sm`}
                  />
                  {errors.experienceLevel && <p className="text-red-500 text-xs mt-1">{errors.experienceLevel}</p>}
                </div>
              </div>
            </div>

            {isLoggedIn && (
              <button
                type="submit"
                className="w-full bg-[#5A2EA6] text-white py-3 rounded-lg font-semibold hover:bg-[#6633C4] transition-all duration-300"
              >
                Submit Job Post
              </button>
            )}
          </form>

          {/* ADD SKILLS SECTION - MOBILE */}
          <div className="mt-12 mb-10">
            <h2 className="text-2xl font-bold mb-4">Add Skills</h2>
            <p className="text-gray-600 text-sm leading-5 mb-6">
              To finish a job, a certain set of abilities is needed. Any of the set skills such as programming, editing, software competency, etc. can be used. You must provide the appropriate talents in a description since it is the primary factor in hiring a candidate.
            </p>
            <ul className="space-y-3 text-sm text-gray-700 mb-6">
              <li className="flex gap-2">
                <span className="w-5 h-5 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-xs mt-0.5 flex-shrink-0">✓</span>
                <span>Look for the talents that will help your project progress by conducting some study.</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-xs mt-0.5 flex-shrink-0">✓</span>
                <span>Make your description easier to read and make sure it includes all the important details.</span>
              </li>
            </ul>

            <div className="border border-gray-300 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-lg mb-4">Talenta</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-700 block mb-1.5 font-semibold">Job title</label>
                  <input
                    type="text"
                    placeholder="ex, need Web developer for figma"
                    className="w-full border border-gray-400 rounded-lg p-3 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 block mb-1.5 font-semibold">Describe about the project</label>
                  <textarea
                    placeholder="writer here"
                    rows="3"
                    className="w-full border border-gray-400 rounded-lg p-3 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 block mb-1.5 font-semibold">Skills</label>
                  <div className="w-full border border-gray-400 rounded-lg p-3 flex flex-wrap gap-2 min-h-[50px]">
                    <span className="bg-[#5A2EA6] text-white px-3 py-1 rounded-full text-xs cursor-pointer">Web Design</span>
                    <span className="bg-[#5A2EA6] text-white px-3 py-1 rounded-full text-xs cursor-pointer">Mockup</span>
                    <span className="bg-[#5A2EA6] text-white px-3 py-1 rounded-full text-xs cursor-pointer">UI Design</span>
                    <span className="bg-[#5A2EA6] text-white px-3 py-1 rounded-full text-xs cursor-pointer">Photoshop</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-700 block mb-1.5 font-semibold">Experience Level</label>
                  <input
                    type="text"
                    placeholder="Beginner / Intermediate / Expert"
                    className="w-full border border-gray-400 rounded-lg p-3 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* EXPERIENCE LEVEL SECTION - MOBILE */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Experience Level</h2>
            <p className="text-gray-600 text-sm leading-5 mb-6">
              Determine the project's requirements and the degree of experience required. Either an expert or a novice can finish your project; it is up to you to choose the best professional and take advantage of their abilities.
            </p>
            <ul className="space-y-3 text-sm text-gray-700 mb-6">
              <li className="flex gap-2">
                <span className="w-5 h-5 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-xs mt-0.5 flex-shrink-0">✓</span>
                <span>Add the abilities you want pros to possess.</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-xs mt-0.5 flex-shrink-0">✓</span>
                <span>Make it clear what experience your project requires.</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-xs mt-0.5 flex-shrink-0">✓</span>
                <span>Talk about the additional duties that professionals need to fulfill.</span>
              </li>
            </ul>

            <div className="border border-gray-300 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-lg mb-4">Talenta</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-700 block mb-1.5 font-semibold">Job title</label>
                  <input
                    type="text"
                    placeholder="ex, need Web developer for figma"
                    className="w-full border border-gray-400 rounded-lg p-3 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 block mb-1.5 font-semibold">Describe about the project</label>
                  <textarea
                    placeholder="writer here"
                    rows="3"
                    className="w-full border border-gray-400 rounded-lg p-3 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 block mb-1.5 font-semibold">Skills</label>
                  <input
                    type="text"
                    placeholder="Web Design, Mockup, UI Design, Photoshop"
                    className="w-full border border-gray-400 rounded-lg p-3 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 block mb-1.5 font-semibold">Experience Level</label>
                  <input
                    type="text"
                    placeholder="0 1 2 3 4 5 6 7 8 9 10+"
                    className="w-full border border-gray-400 rounded-lg p-3 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* <Footer /> */}
      </div>

      {/* ================= DESKTOP & TABLET VERSION ================= */}
      <div className="hidden md:block">
        {/* HERO SECTION */}
        <div
          className="relative w-full h-[480px] md:h-[400px] bg-cover bg-center"
          style={{ backgroundImage: `url(${BannerImg})` }}
        >
          <div className="absolute top-0 w-full z-20 flex justify-between items-center px-6 py-4">
           <h1 className="font-bold text-[36px] md:text-[42px] leading-[100%] trochut-font cursor-pointer bg-gradient-to-r from-[#B77BFF] to-[#E0B0FF] text-transparent bg-clip-text">
  Talenta
</h1>
            <button
              onClick={() => navigate(-1)}
              className="w-[100px] h-[38px] md:w-[90px] md:h-[36px] rounded-[30px] cursor-pointer bg-gradient-to-r from-[#030303] to-[#51218F] hover:opacity-90 transition-opacity flex items-center justify-center"
            >
              <span className="text-white font-semibold text-[13px] md:text-[12px]">
                Back
              </span>
            </button>
          </div>
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="relative z-10 flex items-center justify-center h-full text-center px-4">
            <h1 className="text-white text-5xl md:text-4xl font-bold">How to Post a Job</h1>
          </div>
        </div>

        {/* SECTION 1 */}
        <div className="max-w-[1200px] mx-auto px-6 lg:px-4 md:px-4 py-20 lg:py-16 md:py-14">
          <div className="grid md:grid-cols-2 grid-cols-1 gap-12 lg:gap-10 md:gap-8 items-center">
            <div className="w-full md:w-[584px] flex flex-col gap-[55px] lg:gap-[45px] md:gap-[35px]">
              <div>
                <h2 className="text-[40px] lg:text-[36px] md:text-[32px] font-bold leading-tight">
                  How to <span className="text-[#7B3FE4]">Post</span> a Job
                </h2>
                <p className="text-gray-600 text-[18px] lg:text-[16px] md:text-[15px] leading-7 lg:leading-6 md:leading-6 mt-6 lg:mt-5 md:mt-4">
                  Discover the perfect job for yourself, collaborating with amazing clients, on the global work platform.
                </p>
              </div>
              <button
                onClick={handlePostJob}
                className="bg-[#5A2EA6] text-white px-8 lg:px-7 md:px-6 py-3 lg:py-2.5 md:py-2 w-fit rounded-lg hover:bg-[#6633C4] transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 text-sm lg:text-xs md:text-xs"
              >
                Post a Job
              </button>
            </div>
            <div className="w-full flex justify-end md:justify-end">
              <img
                src={Card}
                alt="card"
                className="w-[540px] lg:w-[480px] md:w-[420px] h-[540px] lg:h-[480px] md:h-[420px] rounded-[26px] shadow-xl object-cover"
              />
            </div>
          </div>
        </div>

        {/* JOB TITLE SECTION with ref */}
        <div ref={jobTitleSectionRef} className="w-full py-4 lg:py-3 md:py-2">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-4 md:px-4 grid md:grid-cols-2 grid-cols-1 gap-16 lg:gap-14 md:gap-12 items-start">
            <div>
              <h2 className="text-[32px] lg:text-[28px] md:text-[26px] font-bold mb-6 lg:mb-5 md:mb-4">
                Job Title and Description
              </h2>
              <p className="text-gray-600 leading-7 lg:leading-6 md:leading-6 mb-8 lg:mb-6 md:mb-5 text-[16px] lg:text-[15px] md:text-[14px]">
                Writing a job description clearly is essential for attracting the right talent for your project. By clearly outlining your project requirements, you'll gain an advantage. It's important to consider both the responsibilities and the qualifications needed for the role you're hiring for.
              </p>
              <ul className="space-y-4 lg:space-y-3 md:space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-xs mt-1 flex-shrink-0">✓</span>
                  <span className="text-[16px] lg:text-[15px] md:text-[14px]">Choose a job title that accurately reflects the position.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-xs mt-1 flex-shrink-0">✓</span>
                  <span className="text-[16px] lg:text-[15px] md:text-[14px]">A job description must explicitly outline the duties and qualifications needed for the role.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-xs mt-1 flex-shrink-0">✓</span>
                  <span className="text-[16px] lg:text-[15px] md:text-[14px]">Apply the appropriate format when crafting a project description to enhance its readability.</span>
                </li>
              </ul>
            </div>

            <form onSubmit={handleSubmitJob}>
              <div className="bg-white border border-gray-300 rounded-xl shadow-sm p-8 lg:p-7 md:p-6">
                <h3 className="font-semibold text-[22px] lg:text-[20px] md:text-[18px] mb-6 lg:mb-5 md:mb-4">Talenta</h3>
                <div className="space-y-5 lg:space-y-4 md:space-y-4">
                  <div>
                    <label className="text-sm lg:text-xs md:text-xs text-gray-700 block mb-2 font-semibold">Job title</label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      placeholder="ex, need Web developer for figma"
                      className={`w-full border ${errors.jobTitle ? 'border-red-500' : 'border-gray-400'} rounded-lg px-4 lg:px-3 md:px-3 py-3 lg:py-2.5 md:py-2 outline-none shadow-sm text-[15px] lg:text-[14px] md:text-[13px] placeholder-gray-400`}
                    />
                    {errors.jobTitle && <p className="text-red-500 text-xs mt-1">{errors.jobTitle}</p>}
                  </div>
                  <div>
                    <label className="text-sm lg:text-xs md:text-xs text-gray-700 block mb-2 font-semibold">Describe about the project</label>
                    <textarea
                      name="projectDescription"
                      value={formData.projectDescription}
                      onChange={handleInputChange}
                      placeholder="writer here"
                      rows="3"
                      className={`w-full border ${errors.projectDescription ? 'border-red-500' : 'border-gray-400'} rounded-lg px-4 lg:px-3 md:px-3 py-3 lg:py-2.5 md:py-2 outline-none shadow-sm text-[15px] lg:text-[14px] md:text-[13px] placeholder-gray-400`}
                    />
                    {errors.projectDescription && <p className="text-red-500 text-xs mt-1">{errors.projectDescription}</p>}
                  </div>
                  <div>
                    <label className="text-sm lg:text-xs md:text-xs text-gray-700 block mb-2 font-semibold">Skills</label>
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      placeholder="Web Design, Mockup, UI Design, Photoshop"
                      className={`w-full border ${errors.skills ? 'border-red-500' : 'border-gray-400'} rounded-lg px-4 lg:px-3 md:px-3 py-3 lg:py-2.5 md:py-2 outline-none shadow-sm text-[15px] lg:text-[14px] md:text-[13px] placeholder-gray-400`}
                    />
                    {errors.skills && <p className="text-red-500 text-xs mt-1">{errors.skills}</p>}
                  </div>
                  <div>
                    <label className="text-sm lg:text-xs md:text-xs text-gray-700 block mb-2 font-semibold">Experience Level</label>
                    <input
                      type="text"
                      name="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleInputChange}
                      placeholder="0 1 2 3 4 5 6 7 8 9 10+"
                      className={`w-full border ${errors.experienceLevel ? 'border-red-500' : 'border-gray-400'} rounded-lg px-4 lg:px-3 md:px-3 py-3 lg:py-2.5 md:py-2 outline-none shadow-sm text-[15px] lg:text-[14px] md:text-[13px] placeholder-gray-400`}
                    />
                    {errors.experienceLevel && <p className="text-red-500 text-xs mt-1">{errors.experienceLevel}</p>}
                  </div>
                </div>
              </div>
              {isLoggedIn && (
                <div className="mt-6">
                  <button
                    type="submit"
                    className="w-full bg-[#5A2EA6] text-white py-3 rounded-lg font-semibold hover:bg-[#6633C4] transition-all duration-300"
                  >
                    Submit Job Post
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* ADD SKILLS SECTION */}
        <div className="w-full py-4 lg:py-3 md:py-2">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-4 md:px-4 grid md:grid-cols-2 grid-cols-1 gap-20 lg:gap-16 md:gap-12 items-start">
            <div className="w-full">
              <h2 className="text-[36px] lg:text-[32px] md:text-[28px] font-bold mb-6 lg:mb-5 md:mb-4">Add Skills</h2>
              <p className="text-gray-700 leading-8 lg:leading-7 md:leading-6 mb-10 lg:mb-8 md:mb-6 text-[16px] lg:text-[15px] md:text-[14px]">
                To finish a job, a certain set of abilities is needed. Any of the set skills such as programming, editing, software competency, etc. can be used. You must provide the appropriate talents in a description since it is the primary factor in hiring a candidate.
              </p>
              <ul className="space-y-6 lg:space-y-5 md:space-y-4 text-gray-800">
                <li className="flex gap-3 items-start">
                  <span className="w-6 h-6 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-xs mt-1 flex-shrink-0">✓</span>
                  <p className="text-[16px] lg:text-[15px] md:text-[14px]">Look for the talents that will help your project progress by conducting some study.</p>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="w-6 h-6 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-xs mt-1 flex-shrink-0">✓</span>
                  <p className="text-[16px] lg:text-[15px] md:text-[14px]">Make your description easier to read and make sure it includes all the important details.</p>
                </li>
              </ul>
            </div>
            <div className="w-full bg-white border border-gray-300 rounded-xl shadow-sm p-8 lg:p-7 md:p-6">
              <h3 className="font-semibold text-[22px] lg:text-[20px] md:text-[18px] mb-6 lg:mb-5 md:mb-4">Talenta</h3>
              <div className="space-y-5 lg:space-y-4 md:space-y-4">
                <div>
                  <label className="text-sm lg:text-xs md:text-xs text-gray-700 block mb-2 font-semibold">Job title</label>
                  <input
                    type="text"
                    placeholder="ex, need Web developer for figma"
                    className="w-full border border-gray-400 rounded-lg px-4 lg:px-3 md:px-3 py-3 lg:py-2.5 md:py-2 outline-none shadow-sm text-[15px] lg:text-[14px] md:text-[13px] placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="text-sm lg:text-xs md:text-xs text-gray-700 block mb-2 font-semibold">Describe about the project</label>
                  <textarea
                    placeholder="writer here"
                    rows="3"
                    className="w-full border border-gray-400 rounded-lg px-4 lg:px-3 md:px-3 py-3 lg:py-2.5 md:py-2 outline-none shadow-sm text-[15px] lg:text-[14px] md:text-[13px] placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="text-sm lg:text-xs md:text-xs text-gray-700 block mb-2 font-semibold">Skills</label>
                  <div className="w-full border border-gray-400 rounded-lg px-4 lg:px-3 md:px-3 py-3 lg:py-2.5 md:py-2 flex flex-wrap gap-2">
                    <span className="bg-[#5A2EA6] text-white px-4 lg:px-3 md:px-3 py-1 rounded-full text-sm lg:text-xs md:text-xs cursor-pointer">Web Design</span>
                    <span className="bg-[#5A2EA6] text-white px-4 lg:px-3 md:px-3 py-1 rounded-full text-sm lg:text-xs md:text-xs cursor-pointer">Mockup</span>
                    <span className="bg-[#5A2EA6] text-white px-4 lg:px-3 md:px-3 py-1 rounded-full text-sm lg:text-xs md:text-xs cursor-pointer">UI Design</span>
                    <span className="bg-[#5A2EA6] text-white px-4 lg:px-3 md:px-3 py-1 rounded-full text-sm lg:text-xs md:text-xs cursor-pointer">Photoshop</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm lg:text-xs md:text-xs text-gray-700 block mb-2 font-semibold">Experience Level</label>
                  <input
                    type="text"
                    placeholder="Beginner / Intermediate / Expert"
                    className="w-full border border-gray-400 rounded-lg px-4 lg:px-3 md:px-3 py-3 lg:py-2.5 md:py-2 outline-none shadow-sm text-[15px] lg:text-[14px] md:text-[13px] placeholder-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* EXPERIENCE LEVEL SECTION */}
        <div className="w-full pb-20 lg:pb-16 md:pb-14">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-4 md:px-4 grid md:grid-cols-2 grid-cols-1 gap-16 lg:gap-14 md:gap-12 items-start">
            <div>
              <h2 className="text-[32px] lg:text-[28px] md:text-[26px] font-bold mb-6 lg:mb-5 md:mb-4">Experience Level</h2>
              <p className="text-gray-600 leading-7 lg:leading-6 md:leading-6 mb-8 lg:mb-6 md:mb-5 text-[16px] lg:text-[15px] md:text-[14px]">
                Determine the project's requirements and the degree of experience required. Either an expert or a novice can finish your project; it is up to you to choose the best professional and take advantage of their abilities.
              </p>
              <ul className="space-y-4 lg:space-y-3 md:space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-xs mt-1 flex-shrink-0">✓</span>
                  <span className="text-[16px] lg:text-[15px] md:text-[14px]">Add the abilities you want pros to possess.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-xs mt-1 flex-shrink-0">✓</span>
                  <span className="text-[16px] lg:text-[15px] md:text-[14px]">Make it clear what experience your project requires.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-xs mt-1 flex-shrink-0">✓</span>
                  <span className="text-[16px] lg:text-[15px] md:text-[14px]">Talk about the additional duties that professionals need to fulfill.</span>
                </li>
              </ul>
            </div>
            <div className="bg-white border border-gray-300 rounded-xl shadow-sm p-8 lg:p-7 md:p-6">
              <h3 className="font-semibold text-[22px] lg:text-[20px] md:text-[18px] mb-6 lg:mb-5 md:mb-4">Talenta</h3>
              <div className="space-y-5 lg:space-y-4 md:space-y-4">
                <div>
                  <label className="text-sm lg:text-xs md:text-xs text-gray-700 block mb-2 font-semibold">Job title</label>
                  <input
                    type="text"
                    placeholder="ex, need Web developer for figma"
                    className="w-full border border-gray-400 rounded-lg px-4 lg:px-3 md:px-3 py-3 lg:py-2.5 md:py-2 outline-none shadow-sm text-[15px] lg:text-[14px] md:text-[13px] placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="text-sm lg:text-xs md:text-xs text-gray-700 block mb-2 font-semibold">Describe about the project</label>
                  <textarea
                    placeholder="writer here"
                    rows="3"
                    className="w-full border border-gray-400 rounded-lg px-4 lg:px-3 md:px-3 py-3 lg:py-2.5 md:py-2 outline-none shadow-sm text-[15px] lg:text-[14px] md:text-[13px] placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="text-sm lg:text-xs md:text-xs text-gray-700 block mb-2 font-semibold">Skills</label>
                  <input
                    type="text"
                    placeholder="Web Design, Mockup, UI Design, Photoshop"
                    className="w-full border border-gray-400 rounded-lg px-4 lg:px-3 md:px-3 py-3 lg:py-2.5 md:py-2 outline-none shadow-sm text-[15px] lg:text-[14px] md:text-[13px] placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="text-sm lg:text-xs md:text-xs text-gray-700 block mb-2 font-semibold">Experience Level</label>
                  <input
                    type="text"
                    placeholder="0 1 2 3 4 5 6 7 8 9 10+"
                    className="w-full border border-gray-400 rounded-lg px-4 lg:px-3 md:px-3 py-3 lg:py-2.5 md:py-2 outline-none shadow-sm text-[15px] lg:text-[14px] md:text-[13px] placeholder-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* <Footer /> */}
      </div>
    </>
  );
};

export default PostProject;