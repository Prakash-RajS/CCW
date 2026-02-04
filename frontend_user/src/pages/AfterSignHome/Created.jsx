import React, { useState } from "react";
import Header from "../../component/Header";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axiosConfig";
import { useUser } from "../../contexts/UserContext";

export default function Created() {
  const navigate = useNavigate();
  const { userData } = useUser();

  // =========================================================
  // STATE MANAGEMENT
  // =========================================================
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [budgetType, setBudgetType] = useState("Hourly");
  const [budget, setBudget] = useState({
    from: "",
    to: "",
  });

  // State for Estimate Level section
  const [estimateLevel, setEstimateLevel] = useState("");

  // State for Estimate Time section
  const [estimateTime, setEstimateTime] = useState("");
  const [durationUnit, setDurationUnit] = useState("");

  const [skills, setSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState("");

  // =========================================================
  // HANDLERS – SKILLS & FILES
  // =========================================================
  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).filter(
      (file) => file.size > 0
    );
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = currentSkill.trim();
      if (trimmed && !skills.includes(trimmed) && skills.length < 15) {
        setSkills([...skills, trimmed]);
        setCurrentSkill("");
      }
    }
  };

  const addSkill = (skill) => {
    if (!skills.includes(skill) && skills.length < 15) {
      setSkills([...skills, skill]);
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // =========================================================
  // SUBMIT LOGIC – INTEGRATED WITH BACKEND
  // =========================================================
  const submitJob = async (status) => {
    // Form Validation
    if (!title.trim()) { alert("Job title is required"); return; }
    if (!description.trim()) { alert("Description is required"); return; }
    if (!skills.length) { alert("Please add at least one skill"); return; }
    if (!estimateLevel) { alert("Please select expertise level"); return; }
    if (!durationUnit) { alert("Please select project duration"); return; }
    if (!budget.from) { alert("Budget from is required"); return; }
    if (budgetType === "Hourly" && !budget.to) { alert("Budget to is required for hourly jobs"); return; }

    if (!userData?.id) {
      alert("User not authenticated");
      return;
    }

    try {
      const formData = new FormData();

      // Text Fields
      formData.append("title", title);
      formData.append("description", description);

      // Skills mapped to comma-separated string for FastAPI split(",")
      formData.append("skills", skills.join(","));

      // Duration: format "1 weeks" for Backend regex parsing
      formData.append("duration", `1 ${durationUnit}`);

      // Taxonomy & Formatting
      formData.append("expertise_level", estimateLevel.trim().toLowerCase());
      formData.append("budget_type", budgetType === "Fixed" ? "fixed" : "hourly");

      // Budget logic
      const budgetFrom = parseFloat(budget.from);
      const budgetTo = budgetType === "Fixed" ? budgetFrom : parseFloat(budget.to);

      formData.append("budget_from", String(budgetFrom));
      formData.append("budget_to", String(budgetTo));
      formData.append("status", status === "posted" ? "posted" : "draft");

      // File handling
      if (files.length > 0) {
        files.forEach((file) => {
          if (file.size > 0) {
            formData.append("attachments", file);
          }
        });
      }

      // API POST
      await api.post(`/jobs/create/${userData.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate(status === "posted" ? "/job-created" : "/saved-draft");

    } catch (err) {
      console.error("Job creation failed", err);
      const errorMsg = err.response?.data?.detail || "Failed to create job";
      alert(typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg));
    }
  };

  return (
    <section className="w-full min-h-screen bg-white flex justify-center py-[100px] px-4">
      <div className="relative w-full max-w-[1163px] bg-white rounded-[10px] shadow-[0px_4px_45px_rgba(0,0,0,0.12)] p-6 md:p-[40px] flex flex-col h-fit">

        {/* Back Button */}
        <div onClick={() => navigate("/home")} className="mb-6 font-['Montserrat'] font-medium text-[14px] leading-none tracking-normal text-black flex items-center cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="w-4 h-4 mr-1" fill="none">
            <path d="M9.5 3L4.5 8L9.5 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Back</span>
        </div>

        {/* Top Divider */}
        <div className="w-full h-[1px] bg-[rgba(0,0,0,0.1)] "></div>

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row lg:gap-10 xl:gap-16">

          {/* LEFT SIDE CONTENT */}
          <div className="flex-1 flex flex-col gap-8">

            {/* Job Title Group */}
            <div className="flex flex-col gap-3 mt-6">
              <label className="font-['Montserrat'] font-bold text-[16px] leading-none tracking-normal text-[#2A1E17]">Job title</label>
              <input
                type="text"
                placeholder="ex, need Web developer for figma"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-[45px] rounded-[10px] !border !border-black/30 text-[#040200] font-['Montserrat'] font-semibold text-[16px] px-4 outline-none placeholder-gray-400"
              />
            </div>

            {/* Description Group */}
            <div className="flex flex-col gap-3">
              <label className="font-['Montserrat'] font-semibold text-[#2A1E17] text-[16px] leading-none tracking-normal">Describe about the project</label>
              <textarea
                placeholder="write here"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-[287px] rounded-[10px] !border !border-black/30 p-4 resize-none font-['Montserrat'] text-[16px] outline-none placeholder-gray-400"
              />
            </div>

            {/* Skills Group */}
            <div className="flex flex-col gap-3">
              <label className="font-['Montserrat'] font-bold text-[16px] leading-none tracking-normal text-[#2A1E17]">Skills</label>
              <div className="w-full min-h-[45px] rounded-[10px] !border !border-black/30 flex flex-wrap items-center gap-2 px-3 py-1.5 focus-within:border-black transition-colors">
                {skills.map((skill, index) => (
                  <span key={index} className="flex items-center gap-1 px-3 py-1 bg-[#51218F] text-white rounded-full text-[14px] font-['Montserrat'] font-medium">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="hover:text-gray-200">×</button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder={skills.length === 0 ? "Add skills" : ""}
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={skills.length >= 15}
                  className="flex-1 min-w-[80px] bg-transparent outline-none font-['Montserrat'] font-semibold text-[16px] text-[#040200] placeholder-gray-400 disabled:cursor-not-allowed"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                {["Web Design", "Mockup", "UI/UX", "Figma", "react", "Angular", "javascript"].map((s) => (
                  <button key={s} onClick={() => addSkill(s)} disabled={skills.length >= 15} className="px-4 py-1 rounded-full bg-[#C9B6E4] text-[#3D1768] text-[14px] font-['Montserrat'] font-medium hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                    {s}
                  </button>
                ))}
              </div>
              <p className="text-right text-[16px] mt-2 font-['Montserrat'] font-regular text-gray-500">Add max 15 skills</p>
            </div>

            <div className="w-full h-[1px] bg-[rgba(0,0,0,0.1)]"></div>

            {/* Estimate Time Section */}
            <div className="flex flex-col gap-4 ">
              <label className="font-['Montserrat'] font-bold text-[16px] leading-none tracking-normal text-[#2A1E17]">Estimate your timeline here</label>
              <div className="flex flex-wrap gap-6 mb-2">
                {["Small", "Medium", "Large"].map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="estimateTime" value={option} checked={estimateTime === option} onChange={(e) => setEstimateTime(e.target.value)} className="hidden" />
                    <div className={`w-4 h-4 rounded-full !border flex items-center justify-center transition-all ${estimateTime === option ? '!border-[#51218F]' : '!border-gray-400'}`}>
                      {estimateTime === option && <div className="w-2.5 h-2.5 rounded-full bg-[#51218F]"></div>}
                    </div>
                    <span className={`font-['Montserrat'] text-[14px] ${estimateTime === option ? 'font-bold text-black' : 'font-medium text-[#040200]'}`}>{option}</span>
                  </label>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-['Montserrat'] font-semibold text-[14px] text-[#2A1E17]">How long your work take?</label>
                <div className="relative">
                  <select value={durationUnit} onChange={(e) => setDurationUnit(e.target.value)} className="w-full sm:w-[322px] h-[45px] rounded-[10px] !border !border-black/30 px-4 font-['Montserrat'] font-semibold text-[16px] text-[#040200] outline-none bg-white appearance-none cursor-pointer">
                    <option value="" disabled>Select Duration</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                    <option value="fixed">Fixed Project</option>
                  </select>
                  <div className="absolute top-1/2 left-[290px] -translate-y-1/2 pointer-events-none hidden sm:block">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1.5L6 6.5L11 1.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full h-[1px] bg-[rgba(0,0,0,0.1)]"></div>

            {/* Expertise level section */}
            <div className="flex flex-col gap-4">
              <label className="font-['Montserrat'] font-bold text-[16px] leading-none tracking-normal text-[#2A1E17]">Expertise level you want</label>
              <div className="flex flex-wrap gap-6 mb-2">
                {["Fresher", "Medium", "Experienced"].map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="estimateLevel" value={option} checked={estimateLevel === option} onChange={(e) => setEstimateLevel(e.target.value)} className="hidden" />
                    <div className={`w-4 h-4 rounded-full !border flex items-center justify-center transition-all ${estimateLevel === option ? '!border-[#51218F]' : '!border-gray-400'}`}>
                      {estimateLevel === option && <div className="w-2.5 h-2.5 rounded-full bg-[#51218F]"></div>}
                    </div>
                    <span className={`font-['Montserrat'] text-[14px] ${estimateLevel === option ? 'font-bold text-black' : 'font-medium text-[#040200]'}`}>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="w-full h-[1px] bg-[rgba(0,0,0,0.1)]"></div>

            {/* Budget Section */}
            <div className="flex flex-col gap-6">
              <label className="font-['Montserrat'] font-bold text-[16px] leading-none tracking-normal text-[#2A1E17]">Tell us about your budget?</label>
              <div className="flex flex-wrap gap-6">
                {[{ key: "Fixed", label: "Fixed price", icon: "tag" }, { key: "Hourly", label: "Hourly", icon: "hourglass" }].map((item) => (
                  <label key={item.key} className={`relative w-[190px] h-[94px] rounded-[12px] !border cursor-pointer flex items-center justify-center gap-3 transition-all ${budgetType === item.key ? "!border-[#51218F] text-[#51218F]" : "!border-gray-300 text-[#2A1E17]"}`}>
                    <input type="radio" name="budgetType" value={item.key} checked={budgetType === item.key} onChange={() => setBudgetType(item.key)} className="hidden" />
                    <div className={`absolute top-[10px] w-[18px] h-[18px] rounded-full !border flex items-center justify-center ${budgetType === item.key ? "!border-[#51218F]" : "!border-gray-400"}`}>
                      {budgetType === item.key && <div className="w-[10px] h-[10px] rounded-full bg-[#51218F]" />}
                    </div>
                    {item.icon === "tag" ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41L11 3H3v8l9.59 9.59a2 2 0 0 0 2.82 0l5.18-5.18a2 2 0 0 0 0-2.82z" /><circle cx="7.5" cy="7.5" r="1.5" /></svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2h12M6 22h12M6 2c0 6 6 6 6 10s-6 4-6 10M18 2c0 6-6 6-6 10s6 4 6 10" /></svg>
                    )}
                    <span className="font-['Montserrat'] font-bold text-[20px]">{item.label}</span>
                  </label>
                ))}
              </div>

              <div className="flex flex-wrap gap-10 mt-2">
                {["from", "to"].map((key) => (
                  <div key={key} className="flex flex-col gap-2">
                    <label className="font-['Montserrat'] font-semibold text-[16px] text-[#2A1E17] capitalize">{key}</label>
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center w-[165px] h-[45px] rounded-[10px] !border px-3 ${budgetType === "Fixed" && key === "to" ? "opacity-50 pointer-events-none !border-gray-300" : "!border-gray-300"}`}>
                        <span className="text-[18px] font-bold text-black">$</span>
                        <input type="number" value={budget[key]} onChange={(e) => setBudget({ ...budget, [key]: e.target.value })} className="w-full text-right text-[18px] font-bold outline-none bg-transparent pl-2 no-spinner" />
                      </div>
                      {budgetType === "Hourly" && <span className="font-['Montserrat'] font-semibold text-[16px] text-gray-400">/hr</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full h-[1px] bg-[rgba(0,0,0,0.1)]"></div>

            {/* Attachments Section */}
            <div className="flex flex-col gap-4">
              <label className="font-['Montserrat'] font-semibold text-[16px] text-[#2A1E17]">Attachments</label>
              <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} className="w-full max-w-[789px] h-[76px] rounded-[14px] !border !border-[#51218F] flex items-center justify-center cursor-pointer hover:bg-purple-50/30 transition-colors">
                <input type="file" multiple onChange={(e) => handleFiles(e.target.files)} className="hidden" id="fileUpload" />
                <label htmlFor="fileUpload" className="cursor-pointer font-['Montserrat'] text-[18px]">
                  Drag or <span className="text-[#51218F] font-semibold">upload project </span>files
                </label>
              </div>
              {files.length > 0 && (
                <ul className="flex flex-col gap-2 mt-2">
                  {files.map((file, index) => (
                    <li key={index} className="text-[14px] font-['Montserrat'] text-gray-600">• {file.name}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Mobile View Action Buttons */}
            <div className="mt-6 flex gap-4 lg:hidden">
              <button onClick={() => submitJob("posted")} className="w-[190px] h-[39px] cursor-pointer rounded-[100px] bg-gradient-to-r from-[#51218F] to-black text-white font-['Montserrat'] font-bold text-[14px] shadow-md hover:opacity-90">Post job now</button>
              <button onClick={() => submitJob("draft")} className="w-[190px] h-[39px] cursor-pointer rounded-[100px] !border !border-[rgba(38,50,56,1)] bg-white text-[rgba(38,50,56,1)] font-['Montserrat'] font-bold text-[14px] hover:bg-gray-50">Save as draft</button>
            </div>
          </div>

          {/* Desktop Dividers & Right Buttons */}
          <div className="hidden lg:block w-[1px] bg-[rgba(0,0,0,0.1)] min-h-[400px]"></div>
          <div className="block lg:hidden w-full h-[1px] bg-[rgba(0,0,0,0.1)] my-6"></div>

          <div className="flex flex-col gap-4 lg:pt-4 mt-2">
            <button onClick={() => submitJob("posted")} className="w-full sm:w-[190px] h-[39px] cursor-pointer rounded-[100px] bg-gradient-to-r from-[#51218F] to-black text-white font-['Montserrat'] font-bold text-[14px] shadow-md hover:opacity-90 transition-opacity">Post job now</button>
            <button onClick={() => submitJob("draft")} className="w-[190px] h-[39px] cursor-pointer rounded-[100px] !border !border-[rgba(38,50,56,1)] bg-white text-[rgba(38,50,56,1)] font-['Montserrat'] font-bold text-[14px] hover:bg-gray-50">Save as draft</button>
          </div>
        </div>
      </div>
    </section>
  );
}