import React from "react";
import rolesectionBgLeft from "../../assets/Landing/rolesectionBgLeft.jpg";
import digitalGrraphicDesigne from "../../assets/Landing/digitalGraphicDesigner.jpg";
import Footer from "../../component/Footer";
import { useNavigate } from "react-router-dom";



function RoleSelection() {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/"); // still redirect
    }
  };

  return (
  <div>
      <section className="relative mx-auto w-full min-h-[2093px] bg-white overflow-hidden">
        {/* ================= HEADER (Both Mobile & Desktop) ================= */}
        <header
          className="absolute top-[24px] left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-[1281px] h-[64px] rounded-[90px] flex items-center justify-between px-6 md:px-8 z-50 backdrop-blur-[8px] border border-white/20"
          style={{ background: "rgba(255, 255, 255, 0.01)" }}
        >
          <h1
            className="text-[28px] md:text-[40px] lg:text-[50px] font-bold leading-none"
            style={{
              fontFamily: "Trochut, cursive",
              background:
                "linear-gradient(270deg, #51218F 22.62%, #030303 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Talenta
          </h1>

       <div className="flex gap-2 ml-8 ">

      {/* Sign Out Button */}
      <div className="flex gap-2 ml-8">
  <button
    onClick={handleLogout}
    className="
      w-[120px] h-[40px] rounded-[30px]
      bg-gradient-to-r from-[#030303] to-[#51218F]
      text-white font-semibold
      cursor-pointer
    "
  >
    Logout
  </button>
</div>


    </div>
      </header>

      {/* ================= MAIN HEADING (Mobile + Desktop) ================= */}
<div className="absolute top-[121px] left-1/2 -translate-x-1/2 w-[90%] max-w-[1085px] text-center z-40 px-2">
  <h2 className="milonga-regular text-[26px] sm:text-[28px] md:text-[36px] lg:text-[48px] text-[rgba(61,23,104,1)] leading-snug">
    Select how you want to join
    <br />
    Choose the role that best matches your journey
  </h2>

 {/* ===== MOBILE BUTTONS (EXACT SAME AS IMAGE) ===== */}
<div className="mt-6 flex gap-4 lg:hidden justify-center">
  {/* Join as creator */}
  <button
    onClick={() => navigate("/creator-role-profile")}
    className="flex items-center justify-between w-[190px] h-[44px] px-4 rounded-[28px] text-white text-[14px] font-semibold shadow-md whitespace-nowrap"
    style={{
      background:
        "radial-gradient(50% 50% at 50% 50%, #2A0A4D 40%, #51218F 100%)",
    }}
  >
    <span>Join as a creator</span>
    <span className="text-[13px] mt-[-6px] leading-none">⌄</span>
  </button>

  {/* Join as collaborator */}
  <button
    onClick={() => navigate("/collaborator-role-profile")}
    className="flex items-center justify-between w-[210px] h-[44px] px-4 rounded-[28px] text-white text-[14px] font-semibold shadow-md whitespace-nowrap"
    style={{
      background:
        "radial-gradient(50% 50% at 50% 50%, #2A0A4D 40%, #51218F 100%)",
    }}
  >
    <span>Join as a collaborator</span>
    <span className="text-[13px] ml-[7px]  mt-[-6px]  leading-none">⌄</span>
  </button>
</div>

</div>


        {/* ================= DESKTOP ONLY: IMAGE SECTION ================= */}
        <div className="hidden lg:flex absolute top-[283px] left-0 w-full">
          {/* LEFT IMAGE - CREATOR */}
          <div className="relative w-1/2 h-[892.55px] overflow-hidden">
            <img
              src={rolesectionBgLeft}
              alt="Creator"
              className="absolute inset-0 w-full h-full object-cover object-left"
            />

            {/* Overlay Content Box */}
            <div className="absolute top-0 left-0 right-0 flex justify-center bg-gradient-to-b from-[rgba(81,33,143,0.9)] to-transparent pt-8">
              <div className="inline-block px-6 py-4">
                <p className="milonga-regular font-normal text-[34px] leading-[45px] text-center text-white">
                  Start collaborations, build projects,
                  <br />
                  and bring your ideas to life.
                </p>
              </div>
            </div>

            {/* Button */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full flex justify-center">
             <button
  onClick={() => navigate("/creator-role-profile")}
  className="
    w-full max-w-[460px] h-[65px]
    rounded-[40px]
    text-white font-[Poppins] font-medium text-[20px]
    shadow-lg
    hover:scale-[1.02]
    transition-all duration-200
    cursor-pointer
  "
  style={{
    background:
      "radial-gradient(50% 50% at 50% 50%, #170929 56.74%, #51218F 100%)",
  }}
>
  Join as a creator
</button>

            </div>
          </div>

          {/* RIGHT IMAGE - COLLABORATOR */}
          <div className="relative w-1/2 h-[892.55px] overflow-hidden">
            <img
              src={digitalGrraphicDesigne}
              alt="Collaborator"
              className="absolute inset-0 w-full h-full object-cover object-right"
            />

            {/* Overlay Content Box */}
            <div className="absolute top-0 left-0 right-0 flex justify-center bg-gradient-to-b from-[rgba(81,33,143,0.9)] to-transparent pt-8">
              <div className="inline-block px-6 py-4">
                <p className="milonga-regular font-normal text-[34px] leading-[45px] text-center text-white">
                  Collaborate on creative project and
                  <br />
                  get recognized your skills
                </p>
              </div>
            </div>

            {/* Button */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full flex justify-center">
              <button
                onClick={() => navigate("/collaborator-role-profile")}
                className="w-full max-w-[460px] h-[65px] rounded-[40px] cursor-pointer text-white font-[Poppins] font-medium text-[20px] shadow-lg hover:scale-[1.02] transition-all duration-200"
                style={{
                  background: "radial-gradient(50% 50% at 50% 50%, #170929 56.74%, #51218F 100%)",
                }}
              >
                Join as a collaborator
              </button>
            </div>
          </div>
        </div>

        {/* ================= DESKTOP ONLY: BOTTOM DESCRIPTION ================= */}
        <div className="hidden lg:block">
          {/* PURPLE CENTER DIVIDER */}


{/* ================= DESKTOP CENTER VERTICAL DIVIDER ================= */}
<div className="hidden lg:block absolute top-[1182px] left-1/2 -translate-x-1/2 z-10 pointer-events-none">
  <div className="relative h-[830px] w-[44px] flex justify-center">

    {/* Layer 1: Ultra soft ambient vertical haze */}
    <div
      className="absolute h-full w-[68px] rounded-full"
      style={{
        background:
          "linear-gradient(180deg, transparent 0%, rgba(168,85,247,0.65) 50%, transparent 100%)",
        filter: "blur(28px)",
        opacity: 0.8,
      }}
    />

    {/* Layer 2: Mid glow body */}
    <div
      className="absolute h-[92%] w-[28px] rounded-full"
      style={{
        background:
          "linear-gradient(180deg, transparent 0%, rgba(126,34,206,0.9) 50%, transparent 100%)",
        filter: "blur(10px)",
        opacity: 0.9,
      }}
    />

    {/* Layer 3: Thin glow line */}
    <div
      className="absolute h-[95%] w-[18px] rounded-full"
      style={{
        background:
          "linear-gradient(180deg, transparent 0%, #7e22ce 50%, transparent 100%)",
        filter: "blur(2px)",
        opacity: 0.95,
      }}
    />

    {/* Layer 4: Sharp core line */}
    <div
      className="relative h-[90%] w-[1px]"
      style={{
        background:
          "linear-gradient(180deg, transparent 0%, #4c1d95 50%, transparent 100%)",
      }}
    />
  </div>
</div>


          <div className="absolute top-[1210px] left-0 w-full flex flex-row items-start justify-center">
            {/* Left Side Content - CREATOR */}
            <div className="w-1/2 px-0 flex flex-col items-end pr-12 xl:pr-20">
              <div className="w-full max-w-[480px]">
                <h3 className="miltonian-tattoo-regular font-normal text-[30px] leading-[40px] text-right text-black">
                  Creators start and manage
                  <br />
                  collaboration projects.
                </h3>

                <ul className="mt-6 list-disc pl-6 font-['Milonga'] text-[24px] leading-[60px] text-black space-y-2">
                  <li>Start new creative projects</li>
                  <li>Find & invite collaborators</li>
                  <li>Assign tasks and set deadlines</li>
                  <li>Upload and manage project files</li>
                  <li>Track revenue split and payouts</li>
                  <li>Hire freelancers from the marketplace</li>
                </ul>

                <div className="mt-6">
                  <p className="miltonian-tattoo-regular text-[30px] font-bold leading-[45px]">
                    One-line summary
                  </p>
                  <p className="milonga-regular text-[30px] leading-[45px]">
                    Creators lead the project and manage the collaboration
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side Content - COLLABORATOR */}
            <div className="w-1/2 px-0 flex flex-col items-start pl-12 xl:pl-30">
              <div className="w-full max-w-[500px]">
                <h3 className="miltonian-tattoo-regular font-normal text-[30px] leading-[40px] text-left text-black">
                  Collaborators join and contribute
                  <br />
                  to creator projects.
                </h3>

                <ul className="mt-6 list-disc pl-6 font-['Milonga'] text-[24px] leading-[60px] text-black space-y-2">
                  <li>Apply for creator-led projects</li>
                  <li>Work on assigned tasks</li>
                  <li>Upload deliverables & revisions</li>
                  <li>Get paid through revenue share</li>
                  <li>Showcase their skills & grow their profile</li>
                  <li>Offer services via the marketplace</li>
                </ul>

                <div className="mt-6">
                  <p className="miltonian-tattoo-regular text-[30px] font-bold leading-[45px]">
                    One-line summary
                  </p>
                  <p className="milonga-regular text-[30px] leading-[45px]">
                    Collaborators support the project with their skills
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= MOBILE ONLY: CONTENT FLOW ================= */}
        <div className="lg:hidden mt-[320px] h-full">
        {/* ================= MOBILE CREATOR IMAGE WITH OVERLAY TEXT ================= */}
<div className="relative w-full  rounded-xl overflow-hidden">
  <img
    src={rolesectionBgLeft}
    alt="Creator"
    className="w-full h-auto object-cover"
  />

  {/* Overlay gradient */}
  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(81,33,143,0.85)] via-[rgba(81,33,143,0.45)] to-transparent" />

{/* Overlay text */}
<div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] text-center px-2">
  <p className="milonga-regular text-white text-[20px] leading-[26px]">
    Start collaborations, build projects,<br />
    and bring your ideas to life.
  </p>
</div>

</div>


{/* ================= MOBILE CREATOR SECTION ================= */}
<h3 className="mt-15 miltonian-tattoo-regular text-[22px] leading-[30px] text-center text-black">
  Creators start and manage
  <br />
  collaboration projects.
</h3>

<ul className="mt-10 list-disc pl-6 milonga-regular text-[16px] leading-[28px] space-y-3 text-black">
  <li>Start new creative projects</li>
  <li>Find & invite collaborators</li>
  <li>Assign tasks and set deadlines</li>
  <li>Upload and manage project files</li>
  <li>Track revenue split and payouts</li>
  <li>Hire freelancers from the marketplace</li>
</ul>

{/* ===== ONE-LINE SUMMARY ===== */}
<div className="mt-10 text-left">
  <p className="miltonian-tattoo-regular text-[18px] font-bold text-black">
    One-line summary
  </p>
  <p className="milonga-regular text-[16px] leading-[26px] text-black mt-1">
    Creators lead the project and manage the collaboration
  </p>
</div>
{/* ================= MOBILE HORIZONTAL DIVIDER ================= */}
<div className="lg:hidden my-14 flex justify-center pointer-events-none">
  <div className="relative w-[380px] h-[44px] flex items-center justify-center">

    {/* Layer 1: Ultra Soft Ambient Glow */}
    <div
      className="absolute w-full h-[28px] rounded-full"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, rgba(168,85,247,0.6) 50%, transparent 100%)",
        filter: "blur(28px)",
        opacity: 0.7,
      }}
    />

    {/* Layer 2: Mid Glow Body */}
    <div
      className="absolute w-[135%] h-[36px] rounded-full"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, rgba(126,34,206,0.85) 50%, transparent 100%)",
        filter: "blur(10px)",
        opacity: 0.9,
      }}
    />

    {/* Layer 3: Thin Glow Line */}
    <div
      className="absolute w-[110%] h-[8px] rounded-full"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, #7e22ce 50%, transparent 100%)",
        filter: "blur(2px)",
        opacity: 0.9,
      }}
    />

    {/* Layer 4: Sharp Core Line */}
    <div
      className="relative w-full h-[1px]"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, #4c1d95 50%, transparent 100%)",
      }}
    />
  </div>
</div>

{/* ================= MOBILE COLLABORATOR SECTION ================= */}
<h3 className="mt-16 miltonian-tattoo-regular text-[22px] text-center text-black">
  Collaborators join and contribute
  <br />
  to creator projects.
</h3>

<ul className="mt-14 list-disc pl-6 milonga-regular text-[20px] leading-[26px] space-y-2 text-black">
  <li>Apply for creator-led projects</li>
  <li>Work on assigned tasks</li>
  <li>Upload deliverables & revisions</li>
  <li>Get paid through revenue share</li>
  <li>Showcase skills & grow profile</li>
  <li>Offer services via marketplace</li>
</ul>

{/* ===== ONE-LINE SUMMARY ===== */}
<div className="mt-14">
  <p className="miltonian-tattoo-regular text-[24px] font-bold text-black">
    One-line summary
  </p>
  <p className="milonga-regular text-[18px] leading-[34px] text-black">
    Collaborators support the project with their skills
  </p>
</div>

        </div>
        
         
        
       
      </section>
      

 
  <Footer />
 
</div>
    
  );
}

export default RoleSelection;