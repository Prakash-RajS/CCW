import React from "react";
import { useNavigate } from "react-router-dom"; 
import bgImage from "../../assets/landing/background.jpg";   
import successIcon from "../../assets/landing/successIcon.png"; 

export default function CollaboratorSucces() {

  const navigate = useNavigate(); 

  return (
    <div className="relative w-full h-screen overflow-hidden">

      {/* BACKGROUND */}
      <img
        src={bgImage}
        alt="bg"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* SUCCESS CARD */}
      <div
        className="
          absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          w-[90%] md:w-[700px]
          bg-white rounded-[32px] border border-[#C8A7FF]
          shadow-xl text-center py-12 px-6 md:px-10
        "
      >
        {/* BACK BUTTON */}
    <button
  onClick={() => navigate("/collaborator-profile")}
  className="
    absolute left-6 top-6 w-10 h-10
    rounded-full bg-gradient-to-br from-[#6D2EFF] to-[#431A85]
    text-white flex items-center justify-center
  "
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 5 5 12 12 19" />
  </svg>
</button>


        {/* TITLE */}
        <h1
          className="text-[32px] text-[#4C2E81] font-bold mb-6"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Talenta
        </h1>

        {/* SUCCESS IMAGE */}
        <div className="flex justify-center mb-6">
          <img
            src={successIcon}
            alt="success"
            className="w-[120px] h-[120px] object-contain"
          />
        </div>

        {/* MAIN MESSAGE */}
        <p
          className="text-[26px] md:text-[30px] text-[#4C2E81] font-semibold leading-snug mb-4"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          You are successfully created <br />
          the collaborator profile
        </p>

        <p className="text-[#6B6B6B] text-[14px] mb-10">
          This can be edited anytime on your dashboard screen
        </p>

        {/* BUTTON */}
        <button
          className="
            w-full py-4 rounded-full text-white text-lg font-semibold
            bg-gradient-to-r from-[#6D2EFF] to-[#120026]
          "
        >
          Continue to dashboard
        </button>
      </div>
    </div>
  );
}
