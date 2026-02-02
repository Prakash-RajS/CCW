import React, { useState } from "react";
import { useNavigate } from "react-router-dom";  
import bgImage from "../../assets/landing/background.jpg";
import userImage from "../../assets/landing/user.png";
import "../../App.css";

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const icon = type === 'success' ? '✓' : '✗';
  
  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3`}>
        <span className="text-xl">{icon}</span>
        <span className="font-medium">{message}</span>
        <button 
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default function CollaboratorProfile() {
  const [toast, setToast] = useState(null);
  const navigate = useNavigate(); 

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleSubmit = () => {
    const name = document.querySelector("input[name='name']")?.value;
    const price = document.querySelector("input[name='price']")?.value;
    const location = document.querySelector("select[name='location']")?.value;

    if (!name || !price || !location) {
      showToast("Please fill all required fields marked with *", "error");
      return;
    }

    // Show success message
    showToast("Profile setup successful! Redirecting...", "success");
    
    // Navigate after a delay
    setTimeout(() => {
      navigate("/success-collaboration");
    }, 1500);
  };

  return (
    <div
      className="relative mx-auto overflow-hidden w-full h-[2409px]"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      {/* Add CSS for animation */}
      <style>
        {`
          @keyframes slide-in {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          .animate-slide-in {
            animation: slide-in 0.3s ease-out;
          }
        `}
      </style>

      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* BACKGROUND IMAGE */}
      <img
        src={bgImage}
        alt="bg"
        className="absolute top-[-16px] w-full h-[993px] object-cover"
      />

      {/* BOTTOM GRADIENT */}
      <div className="absolute top-[977px] w-full h-[1428px] bg-gradient-to-b from-[#3B0B59] to-[#120026]" />

      {/* OUTER PURPLE BORDER */}
      <div
        className="
          absolute left-[303px] top-[238px]
          rounded-[40px] p-[3px]
          bg-gradient-to-b from-[#6D2EFF] to-[#431A85]
        "
      >
        {/* WHITE MAIN CARD */}
        <div
          className="
            bg-white w-[834px] h-[1703px] ml-2 mr-2 mt-2 mb-2
            rounded-[42px] border border-black shadow-xl
            relative
          "
        >
          {/* HEADER SECTION */}
          <div className="absolute w-[666px] top-[60px] left-[84px] flex flex-col items-center">
            
            <button
              onClick={() => navigate(-1)}
              className="
                absolute left-[-60px] top-[-5px]
                w-10 h-10 flex items-center justify-center
                rounded-full bg-gradient-to-br from-[#6D2EFF] to-[#431A85]
                shadow-md text-white text-[23px] hover:scale-105 transition-transform
              "
            >
              ←
            </button>

            <h1
              className="text-[36px] font-bold text-[#4C2E81]"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Talenta
            </h1>

            <p
              className="text-[28px] text-[#4C2E81] leading-tight"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Set-up your collaborate profile
            </p>

            <p className="text-[16px] text-[#6B6B6B] font-medium text-center">
              Complete your profile set up details and start <br />
              getting hired by creators
            </p>
          </div>

          {/* PROFILE PHOTO */}
          <div className="absolute top-[220px] left-1/2 transform -translate-x-1/2">
            <div className="relative">
              <img
                src={userImage}
                alt="profile"
                className="w-[120px] h-[120px] rounded-full border-[4px] border-[#C8A7FF] object-cover"
              />
              {/* HIDDEN FILE INPUT */}
              <input
                id="editImageInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    showToast("Profile picture updated successfully!", "success");
                  }
                }}
              />

              {/* EDIT ICON */}
              <div
                onClick={() => document.getElementById("editImageInput").click()}
                className="
                  absolute bottom-0 right-2
                  w-7 h-7 rounded-full bg-[#7A3EFF]
                  text-white flex items-center justify-center text-sm
                  cursor-pointer hover:bg-[#6D2EFF] transition-colors
                "
              >
                {/* SVG PENCIL ICON */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="white"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM21.71 6.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" />
                </svg>
              </div>
            </div>
          </div>

          {/* FORM SECTION */}
          <div className="absolute top-[380px] w-full left-0 px-[68px] pb-10">
            <div className="flex justify-between mb-8 gap-4">
              {/* NAME (Required) */}
              <div className="w-[48%]">
                <p className="text-black font-semibold mb-2">
                  Name <span className="text-red-600">*</span>
                </p>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Sandeep"
                  className="
                    w-full h-[56px]
                    !border !border-[#4C2E81]
                    rounded-[12px]
                    px-4 bg-white
                    text-[#4C2E81] font-medium
                    outline-none focus:ring-2 focus:ring-[#4C2E81]/50
                  "
                />
              </div>

              {/* LANGUAGE */}
              <div className="w-[48%]">
                <p className="text-black font-semibold mb-2">Language</p>
                <select
                  className="
                    w-full h-[56px]
                    !border !border-[#4C2E81]
                    rounded-[12px]
                    px-4 bg-white
                    text-[#4C2E81] font-medium
                    outline-none focus:ring-2 focus:ring-[#4C2E81]/50
                  "
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Telugu</option>
                  <option>Tamil</option>
                </select>
              </div>
            </div>

            {/* SKILLS */}
            <p className="text-black text-xl font-semibold mb-2">Skills & Expertise</p>

            <div className="flex justify-between mb-8">
              <div className="w-[48%]">
                <p className="text-[13px] text-black font-semibold mb-2">Skill Category</p>
                <select
                  className="
                    w-full h-[56px]
                    !border !border-[#4C2E81]
                    rounded-[12px]
                    px-4 bg-white
                    text-[#4C2E81] font-medium
                    outline-none focus:ring-2 focus:ring-[#4C2E81]/50
                  "
                >
                  <option>UI designs</option>
                  <option>Front-end</option>
                  <option>Back-end</option>
                  <option>Full-stack</option>
                </select>

                <p className="text-[13px] text-[#6B6B6B] mt-1">
                  This helps us about your skills and your experience
                </p>
              </div>

              <div className="w-[48%]">
                <p className="text-[13px] text-black font-semibold mb-2">Experience</p>
                <select
                  className="
                    w-full h-[56px]
                    !border !border-[#4C2E81]
                    rounded-[12px]
                    px-4 bg-white
                    text-[#4C2E81] font-medium
                    outline-none focus:ring-2 focus:ring-[#4C2E81]/50
                  "
                >
                  <option>Expert</option>
                  <option>Intermediate</option>
                  <option>Beginner</option>
                </select>
              </div>
            </div>

            <p className="text-black text-lg font-semibold mb-2">
              Pricing <span className="text-red-600">*</span>
            </p>

            <div className="flex justify-between gap-4 mb-4 w-full">
              <div className="w-[48%]">
                <select
                  className="
                    w-full h-[56px]
                    !border !border-[#4C2E81]
                    rounded-[12px] px-4
                    text-[#4C2E81] font-medium
                    bg-white outline-none focus:ring-2 focus:ring-[#4C2E81]/50
                  "
                >
                  <option>Hourly</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>

              {/* PRICE INPUT REQUIRED */}
              <div className="w-[48%]">
                <div
                  className="
                    w-full h-[56px]
                    !border !border-[#4C2E81]
                    rounded-[12px]
                    px-4
                    flex items-center justify-between
                    bg-white
                    text-[#4C2E81]
                    font-medium
                  "
                >
                  <input
                    type="text"
                    name="price"
                    required
                    placeholder="$300"
                    className="w-[70%] outline-none bg-transparent text-[#4C2E81] focus:ring-2 focus:ring-[#4C2E81]/50"
                  />
                  <span>/hour</span>
                </div>
              </div>
            </div>

            <p className="text-[13px] text-[#6B6B6B] mb-8">
              This helps us to know the pricing
            </p>

            {/* AVAILABILITY */}
            <p className="text-black text-xl font-semibold mb-1">Availability</p>

            <div className="flex justify-between mb-8">
              <div className="w-[48%]">
                <p className="text-[13px] font-semibold mb-2">Availability</p>
                <select
                  className="
                    w-full h-[56px]
                    !border !border-[#4C2E81]
                    rounded-[12px] px-4
                    bg-white text-[#4C2E81]
                    font-medium outline-none focus:ring-2 focus:ring-[#4C2E81]/50
                  "
                >
                  <option>Monday to Friday</option>
                  <option>Weekends</option>
                  <option>All days</option>
                </select>
              </div>

              <div className="w-[48%]">
                <p className="text-[13px] font-semibold mb-2">Timing</p>
                <select
                  className="
                    w-full h-[56px]
                    !border !border-[#4C2E81]
                    rounded-[12px] px-4
                    bg-white text-[#4C2E81]
                    font-medium outline-none focus:ring-2 focus:ring-[#4C2E81]/50
                  "
                >
                  <option>9:30am to 6:00pm IST</option>
                  <option>10:00am to 7:00pm IST</option>
                  <option>11:30am to 8:00pm IST</option>
                </select>
              </div>
            </div>

            {/* SOCIAL */}
            <p className="text-black text-xl font-semibold mb-1">Social / Portfolio</p>

            <div className="flex justify-between mb-6">
              <div className="w-[48%]">
                <p className="text-[13px] font-semibold mb-2">Portfolio category</p>
                <select
                  className="
                    w-full h-[56px]
                    !border !border-[#4C2E81]
                    rounded-[12px] px-4
                    bg-white text-[#4C2E81]
                    font-medium outline-none focus:ring-2 focus:ring-[#4C2E81]/50
                  "
                >
                  <option>UI design</option>
                  <option>Web design</option>
                  <option>Branding</option>
                </select>
              </div>

              <div className="w-[48%]">
                <p className="text-[13px] font-semibold mb-2">Upload</p>
                <button
                  onClick={() => {
                    document.getElementById("fileUploadInput").click();
                    showToast("File upload dialog opened", "success");
                  }}
                  className="
                    w-full h-[56px]
                    !border !border-[#4C2E81]
                    rounded-[12px] px-4
                    flex justify-between items-center
                    bg-white text-[#4C2E81] font-medium
                    hover:bg-[#4C2E81] hover:text-white transition-colors
                  "
                >
                  Upload samples <span>⬆️</span>
                </button>

                <input
                  id="fileUploadInput"
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const fileName = e.target.files[0].name;
                      showToast(`File "${fileName}" uploaded successfully!`, "success");
                    }
                  }}
                />
              </div>
            </div>

            {/* LINK */}
            <div className="mb-8">
              <p className="text-black font-semibold mb-2">Social media / Portfolio link</p>
              <input
                type="text"
                placeholder="https://dribbble.com/"
                className="
                  w-full h-[56px]
                  !border !border-[#4C2E81]
                  rounded-[12px] px-4
                  bg-white text-[#4C2E81]
                  font-medium outline-none focus:ring-2 focus:ring-[#4C2E81]/50
                "
              />
            </div>

            {/* BADGES + SKILLS */}
            <div className="flex justify-between mb-8">
              <div className="w-[45%]">
                <p className="text-black font-semibold mb-2">Badges</p>

                <div className="space-y-2 text-[#4C2E81] text-[15px] font-medium">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="badge" className="accent-[#4C2E81]" />
                    Top rated
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="badge" className="accent-[#4C2E81]" />
                    Verified
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="badge" className="accent-[#4C2E81]" />
                    Popular
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="badge" className="accent-[#4C2E81]" />
                    New
                  </label>
                </div>
              </div>

              {/* SKILL RATING */}
              <div className="w-[50%]">
                <p className="text-black font-semibold mb-2">Skills rating</p>

                <div className="flex items-center gap-3 mb-2">
                  <p className="text-[22px] text-[#4C2E81] leading-none">★ ★ ★ ★ ★</p>
                  <p className="text-[#4C2E81] text-sm font-medium">80%</p>
                </div>

                <div className="w-full h-[6px] bg-[#E3D5FF] rounded-full mb-4">
                  <div className="h-full w-[80%] bg-[#4C2E81] rounded-full" />
                </div>

                <p className="text-black font-semibold mb-2">About you in one word</p>

                <input
                  type="text"
                  placeholder="I am professional and very talented..."
                  className="
                    w-full h-[56px]
                    !border !border-[#4C2E81]
                    rounded-[12px] px-4
                    bg-white text-[#4C2E81] font-medium
                    outline-none focus:ring-2 focus:ring-[#4C2E81]/50
                  "
                />
              </div>
            </div>

            {/* LOCATION (Required) */}
            <div className="mb-10">
              <p className="text-black font-semibold mb-2">
                Location <span className="text-red-600">*</span>
              </p>

              <select
                name="location"
                required
                className="
                  w-full h-[56px]
                  !border !border-[#4C2E81]
                  rounded-[12px] px-4
                  bg-white text-[#4C2E81]
                  font-medium outline-none focus:ring-2 focus:ring-[#4C2E81]/50
                "
              >
                <option value="">Select location</option>
                <option>India</option>
                <option>USA</option>
                <option>UK</option>
                <option>Canada</option>
              </select>
            </div>

            {/* SUBMIT */}
            <button
              onClick={handleSubmit}
              className="
                w-full py-4 rounded-[24px]
                text-white text-lg font-semibold
                bg-gradient-to-r from-[#6D2EFF] to-[#120026]
                hover:from-[#5A25D9] hover:to-[#0F0020]
                transition-all transform hover:scale-[1.02]
                shadow-lg hover:shadow-xl
              "
            >
              Set up your profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}