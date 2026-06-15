//import React from "react";
import rolesectionBgLeft from "../../assets/Landing/rolesectionBgLeft.jpg";
import digitalGrraphicDesigne from "../../assets/Landing/digitalGraphicDesigner.jpg";
import Footer from "../../component/Footer";
import { useNavigate } from "react-router-dom";

function RoleSelection() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

      await fetch(`${apiBaseUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(";").forEach(function (c) {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      window.location.href = "/?logout=" + Date.now();
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(";").forEach(function (c) {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      window.location.href = "/?logout=" + Date.now();
    }
  };

  return (
    <div>
      <section className="relative mx-auto w-full bg-white overflow-hidden">

        {/* ================= HEADER ================= */}
        <header
          className="sticky top-4 mx-auto w-[calc(100%-32px)] sm:w-[calc(100%-40px)] max-w-[1281px] h-[56px] sm:h-[64px] rounded-[90px] flex items-center justify-between px-4 sm:px-6 md:px-8 z-50 backdrop-blur-[8px] border border-white/20"
          style={{ background: "rgba(255, 255, 255, 0.01)" }}
        >
          <h1
            className="text-[26px] sm:text-[32px] md:text-[40px] lg:text-[50px] font-bold leading-none"
            style={{
              fontFamily: "Trochut, cursive",
              background: "linear-gradient(270deg, #51218F 22.62%, #030303 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Talenta
          </h1>

          <button
            onClick={handleLogout}
            className="w-[100px] sm:w-[120px] h-[36px] sm:h-[40px] rounded-[30px] bg-gradient-to-r from-[#030303] to-[#51218F] text-white font-semibold text-[13px] sm:text-[14px] cursor-pointer"
          >
            Logout
          </button>
        </header>

        {/* ================= MAIN HEADING ================= */}
        <div className="w-[90%] max-w-[1085px] mx-auto text-center z-40 pt-8 sm:pt-10 px-2">
          <h2 className="milonga-regular text-[22px] sm:text-[26px] md:text-[32px] lg:text-[40px] xl:text-[48px] text-[rgba(61,23,104,1)] leading-snug">
            Select how you want to join
            <br />
            Choose the role that best matches your journey
          </h2>
        </div>

        {/* ================= MOBILE/TABLET: STACKED CARDS (< lg) ================= */}
        <div className="lg:hidden w-full px-4 sm:px-6 mt-8 pb-12">

          {/* Mobile quick-pick buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8">
            <button
              onClick={() => navigate("/creator-role-profile")}
              className="flex items-center justify-center gap-2 w-full sm:w-[220px] max-w-[320px] h-[48px] sm:h-[50px] rounded-[28px] text-white text-[15px] font-semibold shadow-md cursor-pointer"
              style={{
                background: "radial-gradient(50% 50% at 50% 50%, #2A0A4D 40%, #51218F 100%)",
              }}
            >
              Join as a creator
            </button>
            <button
              onClick={() => navigate("/collaborator-role-profile")}
              className="flex items-center justify-center gap-2 w-full sm:w-[220px] max-w-[320px] h-[48px] sm:h-[50px] rounded-[28px] text-white text-[15px] font-semibold shadow-md cursor-pointer"
              style={{
                background: "radial-gradient(50% 50% at 50% 50%, #2A0A4D 40%, #51218F 100%)",
              }}
            >
              Join as a collaborator
            </button>
          </div>

          {/* ── CREATOR CARD ── */}
          <div className="relative w-full rounded-2xl overflow-hidden mb-8 shadow-lg">
            <img
              src={rolesectionBgLeft}
              alt="Creator"
              className="w-full h-[220px] sm:h-[280px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(81,33,143,0.85)] via-[rgba(81,33,143,0.45)] to-transparent" />
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-[90%] text-center">
              <p className="milonga-regular text-white text-[16px] sm:text-[19px] leading-[24px] sm:leading-[28px]">
                Start collaborations, build projects,<br />
                and bring your ideas to life.
              </p>
            </div>
          </div>

          <h3 className="miltonian-tattoo-regular text-[20px] sm:text-[24px] leading-[30px] text-center text-black">
            Creators start and manage<br />collaboration projects.
          </h3>

          <ul className="mt-6 list-disc pl-6 milonga-regular text-[14px] sm:text-[16px] leading-[28px] sm:leading-[32px] space-y-1 text-black">
            <li>Start new creative projects</li>
            <li>Find &amp; invite collaborators</li>
            <li>Assign tasks and set deadlines</li>
            <li>Upload and manage project files</li>
            <li>Track revenue split and payouts</li>
            <li>Hire freelancers from the marketplace</li>
          </ul>

          <div className="mt-6">
            <p className="miltonian-tattoo-regular text-[16px] sm:text-[18px] font-bold text-black">One-line summary</p>
            <p className="milonga-regular text-[14px] sm:text-[16px] leading-[26px] text-black mt-1">
              Creators lead the project and manage the collaboration
            </p>
          </div>

          {/* Horizontal Divider */}
          <div className="my-10 sm:my-12 flex justify-center pointer-events-none">
            <div className="relative w-full max-w-[380px] h-[44px] flex items-center justify-center">
              <div className="absolute w-full h-[28px] rounded-full" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(168,85,247,0.6) 50%, transparent 100%)", filter: "blur(28px)", opacity: 0.7 }} />
              <div className="absolute w-[135%] h-[36px] rounded-full" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(126,34,206,0.85) 50%, transparent 100%)", filter: "blur(10px)", opacity: 0.9 }} />
              <div className="absolute w-[110%] h-[8px] rounded-full" style={{ background: "linear-gradient(90deg, transparent 0%, #7e22ce 50%, transparent 100%)", filter: "blur(2px)", opacity: 0.9 }} />
              <div className="relative w-full h-[1px]" style={{ background: "linear-gradient(90deg, transparent 0%, #4c1d95 50%, transparent 100%)" }} />
            </div>
          </div>

          {/* ── COLLABORATOR CARD ── */}
          <div className="relative w-full rounded-2xl overflow-hidden mb-8 shadow-lg">
            <img
              src={digitalGrraphicDesigne}
              alt="Collaborator"
              className="w-full h-[220px] sm:h-[280px] object-cover object-right"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(81,33,143,0.85)] via-[rgba(81,33,143,0.45)] to-transparent" />
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-[90%] text-center">
              <p className="milonga-regular text-white text-[16px] sm:text-[19px] leading-[24px] sm:leading-[28px]">
                Collaborate on creative projects and<br />
                get recognized for your skills.
              </p>
            </div>
          </div>

          <h3 className="miltonian-tattoo-regular text-[20px] sm:text-[24px] text-center text-black">
            Collaborators join and contribute<br />to creator projects.
          </h3>

          <ul className="mt-6 list-disc pl-6 milonga-regular text-[14px] sm:text-[16px] leading-[28px] sm:leading-[32px] space-y-1 text-black">
            <li>Apply for creator-led projects</li>
            <li>Work on assigned tasks</li>
            <li>Upload deliverables &amp; revisions</li>
            <li>Get paid through revenue share</li>
            <li>Showcase skills &amp; grow profile</li>
            <li>Offer services via marketplace</li>
          </ul>

          <div className="mt-6 mb-4">
            <p className="miltonian-tattoo-regular text-[16px] sm:text-[18px] font-bold text-black">One-line summary</p>
            <p className="milonga-regular text-[14px] sm:text-[16px] leading-[26px] text-black mt-1">
              Collaborators support the project with their skills
            </p>
          </div>
        </div>

        {/* ================= DESKTOP ONLY (≥ lg) ================= */}
        <div className="hidden lg:block">

          {/* Image Row */}
          <div className="flex w-full mt-10">
            {/* LEFT – Creator */}
            <div className="relative w-1/2 h-[520px] xl:h-[680px] 2xl:h-[893px] overflow-hidden">
              <img src={rolesectionBgLeft} alt="Creator" className="absolute inset-0 w-full h-full object-cover object-left" />
              <div className="absolute top-0 left-0 right-0 flex justify-center bg-gradient-to-b from-[rgba(81,33,143,0.9)] to-transparent pt-8">
                <div className="inline-block px-6 py-4">
                  <p className="milonga-regular font-normal text-[22px] xl:text-[28px] 2xl:text-[34px] leading-[1.4] text-center text-white">
                    Start collaborations, build projects,<br />and bring your ideas to life.
                  </p>
                </div>
              </div>
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full flex justify-center px-8">
                <button
                  onClick={() => navigate("/creator-role-profile")}
                  className="w-full max-w-[380px] xl:max-w-[460px] h-[55px] xl:h-[65px] rounded-[40px] text-white font-[Poppins] font-medium text-[17px] xl:text-[20px] shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                  style={{ background: "radial-gradient(50% 50% at 50% 50%, #170929 56.74%, #51218F 100%)" }}
                >
                  Join as a creator
                </button>
              </div>
            </div>

            {/* RIGHT – Collaborator */}
            <div className="relative w-1/2 h-[520px] xl:h-[680px] 2xl:h-[893px] overflow-hidden">
              <img src={digitalGrraphicDesigne} alt="Collaborator" className="absolute inset-0 w-full h-full object-cover object-right" />
              <div className="absolute top-0 left-0 right-0 flex justify-center bg-gradient-to-b from-[rgba(81,33,143,0.9)] to-transparent pt-8">
                <div className="inline-block px-6 py-4">
                  <p className="milonga-regular font-normal text-[22px] xl:text-[28px] 2xl:text-[34px] leading-[1.4] text-center text-white">
                    Collaborate on creative projects and<br />get recognized for your skills.
                  </p>
                </div>
              </div>
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full flex justify-center px-8">
                <button
                  onClick={() => navigate("/collaborator-role-profile")}
                  className="w-full max-w-[380px] xl:max-w-[460px] h-[55px] xl:h-[65px] rounded-[40px] text-white font-[Poppins] font-medium text-[17px] xl:text-[20px] shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                  style={{ background: "radial-gradient(50% 50% at 50% 50%, #170929 56.74%, #51218F 100%)" }}
                >
                  Join as a collaborator
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Description Row with Center Divider */}
          <div className="relative flex flex-row items-start justify-center mt-16 xl:mt-20 pb-16 xl:pb-20">

            {/* Center Vertical Divider */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 z-10 pointer-events-none flex justify-center">
              <div className="relative h-full w-[44px] flex justify-center">
                <div className="absolute h-full w-[68px] rounded-full" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(168,85,247,0.65) 50%, transparent 100%)", filter: "blur(28px)", opacity: 0.8 }} />
                <div className="absolute h-[92%] w-[28px] rounded-full" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(126,34,206,0.9) 50%, transparent 100%)", filter: "blur(10px)", opacity: 0.9 }} />
                <div className="absolute h-[95%] w-[18px] rounded-full" style={{ background: "linear-gradient(180deg, transparent 0%, #7e22ce 50%, transparent 100%)", filter: "blur(2px)", opacity: 0.95 }} />
                <div className="relative h-[90%] w-[1px]" style={{ background: "linear-gradient(180deg, transparent 0%, #4c1d95 50%, transparent 100%)" }} />
              </div>
            </div>

            {/* Left – Creator */}
            <div className="w-1/2 flex flex-col items-end pr-10 xl:pr-16 2xl:pr-20">
              <div className="w-full max-w-[420px] xl:max-w-[480px]">
                <h3 className="miltonian-tattoo-regular font-normal text-[22px] xl:text-[26px] 2xl:text-[30px] leading-[1.4] text-right text-black">
                  Creators start and manage<br />collaboration projects.
                </h3>
                <ul className="mt-5 list-disc pl-6 font-['Milonga'] text-[16px] xl:text-[20px] 2xl:text-[24px] leading-[48px] xl:leading-[56px] text-black space-y-0">
                  <li>Start new creative projects</li>
                  <li>Find &amp; invite collaborators</li>
                  <li>Assign tasks and set deadlines</li>
                  <li>Upload and manage project files</li>
                  <li>Track revenue split and payouts</li>
                  <li>Hire freelancers from the marketplace</li>
                </ul>
                <div className="mt-5">
                  <p className="miltonian-tattoo-regular text-[22px] xl:text-[26px] 2xl:text-[30px] font-bold leading-[1.4]">One-line summary</p>
                  <p className="milonga-regular text-[20px] xl:text-[24px] 2xl:text-[30px] leading-[1.5]">Creators lead the project and manage the collaboration</p>
                </div>
              </div>
            </div>

            {/* Right – Collaborator */}
            <div className="w-1/2 flex flex-col items-start pl-10 xl:pl-16 2xl:pl-20">
              <div className="w-full max-w-[420px] xl:max-w-[500px]">
                <h3 className="miltonian-tattoo-regular font-normal text-[22px] xl:text-[26px] 2xl:text-[30px] leading-[1.4] text-left text-black">
                  Collaborators join and contribute<br />to creator projects.
                </h3>
                <ul className="mt-5 list-disc pl-6 font-['Milonga'] text-[16px] xl:text-[20px] 2xl:text-[24px] leading-[48px] xl:leading-[56px] text-black space-y-0">
                  <li>Apply for creator-led projects</li>
                  <li>Work on assigned tasks</li>
                  <li>Upload deliverables &amp; revisions</li>
                  <li>Get paid through revenue share</li>
                  <li>Showcase their skills &amp; grow their profile</li>
                  <li>Offer services via the marketplace</li>
                </ul>
                <div className="mt-5">
                  <p className="miltonian-tattoo-regular text-[22px] xl:text-[26px] 2xl:text-[30px] font-bold leading-[1.4]">One-line summary</p>
                  <p className="milonga-regular text-[20px] xl:text-[24px] 2xl:text-[30px] leading-[1.5]">Collaborators support the project with their skills</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>
      <Footer />
    </div>
  );
}

export default RoleSelection;