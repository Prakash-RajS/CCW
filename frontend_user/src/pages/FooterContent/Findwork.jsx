import React from "react";
import { useNavigate } from "react-router-dom";
import WorkImg from "../../assets/AfterSign/HomeSub.png";
import Howworkbg from "../../assets/Landing/Howworkbg.png";
import flag from "../../assets/collabration/flag9.png";

// import Footer from "../../component/Footer";
import BannerImg from "../../assets/myproject/banner.png";

const Findwork = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full overflow-x-hidden">
      
      {/* ================= HEADER ================= */}
      <div className="absolute top-0 w-full z-20 flex justify-between items-center px-4 md:px-6 py-3 md:py-4">
       <h1 className="font-bold text-[28px] md:text-[36px] lg:text-[50px] leading-[100%] trochut-font cursor-pointer bg-gradient-to-r from-[#B77BFF] to-[#E0B0FF] text-transparent bg-clip-text">
  Talenta
</h1>
        <button
          onClick={() => navigate(-1)}
          className="w-[80px] h-[32px] md:w-[90px] md:h-[36px] lg:w-[100px] lg:h-[38px] rounded-[30px] cursor-pointer bg-gradient-to-r from-[#030303] to-[#51218F] hover:opacity-90 transition-opacity flex items-center justify-center"
        >
          <span className="text-white font-semibold text-[12px] md:text-[13px]">
            Back
          </span>
        </button>
      </div>

 {/* HERO SECTION WITH BLACK SHADOW OVERLAY */}
<div
  className="relative w-full h-[200px] md:h-[460px] bg-cover bg-center"
  style={{ backgroundImage: `url(${BannerImg})` }}
>
  {/* Black shadow overlay */}
  <div className="absolute inset-0 bg-black/40"></div>
  
  {/* Content */}
  <div className="relative z-10 flex items-center justify-center h-full">
    <h1 className="text-white text-2xl md:text-5xl font-bold">
      How to Find Work
    </h1>
  </div>
</div>

      {/* MAIN CONTENT */}
      <div className="hidden md:block max-w-6xl mx-auto px-6 py-16">

        {/* SECTION 1 */}
        <div className="grid md:grid-cols-2 gap-10 items-center">

          <div>
            <h2
              className="mb-4"
              style={{
                fontFamily: "Outfit, sans-serif",
                fontWeight: 600,
                fontSize: "46px",
                lineHeight: "100%"
              }}
            >
              How to{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #5705C2 0%, #020202 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: "inline-block"
                }}
              >
                Find
              </span>{" "}
              Work
            </h2>

            <p
              className="text-gray-600 mb-6"
              style={{
                fontFamily: "Outfit, sans-serif",
                fontWeight: 500,
                fontSize: "23px",
                lineHeight: "120%"
              }}
            >
              Discover the ideal job with wonderful <br />
              clients at the global job marketplace. Find <br />
              exciting work opportunities from <br />
              companies around the world. Connect with <br />
              trusted clients and grow your professional <br />
              career. Explore thousands of jobs <br />
              that match your skills and experience.
            </p>
          </div>

          <div className="flex justify-center">
            <img
              src={Howworkbg}
              alt="how work"
              className="rounded-xl shadow-lg w-[380px]"
            />
          </div>

        </div>

        {/* SECTION 2 */}
        <div className="mt-20 grid md:grid-cols-2 gap-16 items-start">

          {/* LEFT SIDE */}
          <div>
            <h3
              className="mb-4"
              style={{
                fontFamily: "Outfit, sans-serif",
                fontWeight: 600,
                fontSize: "32px",
                lineHeight: "110%"
              }}
            >
              Find the perfect project for you
            </h3>

            <p
              className="text-black mb-6"
              style={{
                fontFamily: "Outfit, sans-serif",
                fontWeight: 400,
                fontSize: "18px",
                lineHeight: "140%"
              }}
            >
              Web development, content creation, and many other <br />
              types of projects are all available under one roof at <br />
              Talenta. You are free to select from a wide range of <br />
              projects.
            </p>

            <ul
              className="space-y-4 text-black"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              <li className="flex gap-3 items-start">
                <span
                  className="flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{
                    minWidth: "24px",
                    minHeight: "24px",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "linear-gradient(180deg, #6A1B9A 0%, #000000 100%)"
                  }}
                >
                  ✓
                </span>
                <span>
                  To find pertinent projects that you wish to work on,
                  use the appropriate criteria.
                </span>
              </li>

              <li className="flex gap-3 items-start">
                <span
                  className="flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{
                    minWidth: "24px",
                    minHeight: "24px",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "linear-gradient(180deg, #6A1B9A 0%, #000000 100%)"
                  }}
                >
                  ✓
                </span>
                <span>
                  Verify that the project requirements match your
                  area of expertise and that you have reviewed them carefully.
                </span>
              </li>

              <li className="flex gap-3 items-start">
                <span
                  className="flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{
                    minWidth: "24px",
                    minHeight: "24px",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "linear-gradient(180deg, #6A1B9A 0%, #000000 100%)"
                  }}
                >
                  ✓
                </span>
                <span>
                  Additionally, you can decide whether you wish to
                  collaborate with the client and act accordingly.
                </span>
              </li>
            </ul>
          </div>

          {/* RIGHT SIDE CARD */}
          <div className="flex justify-center">
            <div
              className="bg-[#F9F9FB] rounded-[11px] shadow-[inset_0px_0px_12px_0px_rgba(0,0,0,0.25)] w-full max-w-[520px] p-4"
            >
              {/* HEADER */}
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-semibold text-[14px] text-gray-900">
                  Looking for a UX Web Designer
                </h4>

                <div className="text-right">
                  <span className="font-semibold text-[14px] text-black">
                    $10.00 USD
                  </span>
                  <p className="text-[10px] text-gray-400">
                    BIDDING ENDS IN 6 DAYS,23 HOURS
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-gray-400 mb-2">
                Posted 3 hours ago
              </p>

              {/* DESCRIPTION */}
              <p className="text-[12px] text-gray-700 leading-snug mb-2">
                I need a website for a software development and services company.
                The company is a new startup, so the focus is on what we offer to
                provide, than what we did in the past.
              </p>

              {/* CONTENT + BUTTONS */}
              <div className="flex justify-between">
                {/* LEFT SIDE */}
                <div className="w-[65%]">
                  <p className="text-[12px] text-gray-800 mb-2">
                    The key areas are - <br/>
                    +Digital Transformation work <br/>
                    +Platform modernization <br/>
                    +Maintenance and support <br/>
                    +Utility tool development <br/>
                    +Secure Data migration <br/>
                    +Round the clock support
                  </p>
                </div>

                {/* RIGHT SIDE BUTTONS */}
                <div className="flex flex-col gap-3 items-end mt-6">
                  <button className="bg-[#6C2BD9] text-white text-[12px] w-[180px] h-[36px] rounded-full font-medium">
                    Submit a proposal
                  </button>
                  <button className="border border-[rgba(38,50,56,1)] ring-1 ring-gray-300 text-[#263238] text-[12px] w-[180px] h-[36px] rounded-full font-medium flex items-center justify-center bg-white shadow-sm">
                    Saved the project
                  </button>
                </div>
              </div>

              {/* SKILLS */}
              <p className="font-semibold text-[13px] mt-3 mb-2">
                Skills and Expertise
              </p>

              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-[2px] bg-gray-200 rounded-full text-[10px]">
                  Web Design
                </span>
                <span className="px-2 py-[2px] bg-gray-200 rounded-full text-[10px]">
                  Mockup
                </span>
                <span className="px-2 py-[2px] bg-gray-200 rounded-full text-[10px]">
                  Web Design
                </span>
                <span className="px-2 py-[2px] bg-gray-200 rounded-full text-[10px]">
                  Mockup
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3 */}
        <div className="mt-24 grid md:grid-cols-2 gap-16 items-center">

          {/* LEFT SIDE PAYMENT CARD */}
          <div className="bg-[#F9F9FB] shadow-[inset_0px_0px_12px_0px_rgba(0,0,0,0.25)] w-full max-w-[440px] p-[16px] rounded-[30px] flex flex-col gap-[5px]">

            {/* SUCCESS ICON */}
            <div className="flex justify-center mb-1">
              <div className="flex justify-center items-center bg-[#DDF3E6] w-[52px] h-[52px] rounded-[12px]">
                <svg
                  width="34"
                  height="34"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <mask id="cutoutIcon">
                      <rect width="100" height="100" fill="white" />
                      <circle cx="70" cy="76" r="23" fill="black" />
                    </mask>
                  </defs>

                  <g mask="url(#cutoutIcon)">
                    <rect x="10" y="25" width="75" height="50" rx="8" stroke="#00A651" strokeWidth="4"/>
                    <line x1="10" y1="38" x2="85" y2="38" stroke="#00A651" strokeWidth="4"/>
                    <circle cx="22" cy="60" r="4" stroke="#00A651" strokeWidth="4"/>
                  </g>

                  <line x1="10" y1="50" x2="85" y2="50" stroke="#00A651" strokeWidth="4"/>

                  <circle cx="70" cy="76" r="19" stroke="#00A651" strokeWidth="4" fill="#DDF3E6"/>

                  <path
                    d="M61 76L67 82L79 70"
                    stroke="#00A651"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* TITLE */}
            <h4 className="text-center font-semibold text-green-600 text-[13px]">
              Payment Successful!
            </h4>

            <p className="text-center text-gray-500 text-[10px] leading-tight mb-1">
              Your payment has been processed successfully. You will receive a confirmation email shortly.
            </p>

            {/* PAYMENT DETAILS */}
            <div className="bg-gray-100 rounded-lg p-2 text-[10px] border-b border-gray-300">
              <div className="flex justify-between pb-1 border-b border-gray-300">
                <span className="text-gray-500">Amount</span>
                <span className="font-semibold">$300.00</span>
              </div>

              <div className="flex justify-between pt-1">
                <span className="text-gray-500">Transaction ID</span>
              </div>

              <div className="flex justify-between pt-1">
                <span className="text-gray-500">Payment Method</span>
              </div>

              <div className="flex justify-between pt-1">
                <span className="text-gray-500">Date</span>
              </div>

              <div className="flex justify-between pt-1">
                <span className="text-gray-500">Merchant</span>
                <span>Talenta</span>
              </div>
            </div>

            {/* EMAIL BAR */}
            <div className="mt-1">
              <div className="flex items-center justify-center gap-2 py-[4px] rounded-md text-white text-[10px] bg-purple-700">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <rect x="4" y="6" width="16" height="12" rx="3" />
                  <path d="M4 7l8 6 8-6" />
                </svg>
                <span>Receipt sent to customer@example.com</span>
              </div>
            </div>

            {/* DOWNLOAD BUTTON */}
            <button
              className="w-full bg-black text-white py-[4px] rounded-md text-[10px] flex items-center justify-center gap-2"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M12 4v10" />
                <path d="M8 11l4 4 4-4" />
                <path d="M5 18v2a1 1 0 001 1h12a1 1 0 001-1v-2" />
              </svg>
              <span>Download Receipt</span>
            </button>

            <p className="text-center text-[9px] text-gray-400">
              Need help? Contact support@talent.com
            </p>
          </div>

          {/* RIGHT SIDE CONTENT */}
          <div>
            <h3
              className="mb-4"
              style={{
                fontFamily: "Outfit, sans-serif",
                fontWeight: 600,
                fontSize: "48px",
                lineHeight: "100%",
                letterSpacing: "0%"
              }}
            >
              Easy to withdraw
            </h3>
            
            <p
              className="mb-6 text-black"
              style={{
                fontFamily: "Outfit, sans-serif",
                fontWeight: 400,
                fontSize: "20px",
                lineHeight: "32px",
                letterSpacing: "2%"
              }}
            >
              Depending on the laws in your location, there are several ways to earn paid on Talenta.
            </p>

            <ul
              className="space-y-5 text-black"
              style={{
                fontFamily: "Outfit, sans-serif",
                fontWeight: 400,
                fontSize: "18px",
                lineHeight: "28px",
                letterSpacing: "1%"
              }}
            >
              <li className="flex gap-3 items-start">
                <span
                  className="flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{
                    minWidth: "24px",
                    minHeight: "24px",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "linear-gradient(180deg, #6A1B9A 0%, #000000 100%)"
                  }}
                >
                  ✓
                </span>
                When it comes to a payment method, you should be honest.
              </li>

              <li className="flex gap-3 items-start">
                <span
                  className="flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{
                    minWidth: "24px",
                    minHeight: "24px",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "linear-gradient(180deg, #6A1B9A 0%, #000000 100%)"
                  }}
                >
                  ✓
                </span>
                Make sure your payment details are correct.
              </li>

              <li className="flex gap-3 items-start">
                <span
                  className="flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{
                    minWidth: "24px",
                    minHeight: "24px",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "linear-gradient(180deg, #6A1B9A 0%, #000000 100%)"
                  }}
                >
                  ✓
                </span>
                Use your favorite method to withdraw money.
              </li>
            </ul>
          </div>
        </div>

        {/* SECTION 4 */}
        <div className="mt-24 grid md:grid-cols-2 gap-12 items-start">

          {/* LEFT SIDE */}
          <div>
            <h3
              className="mb-4 text-black"
              style={{
                fontFamily: "Outfit, sans-serif",
                fontWeight: 600,
                fontSize: "36px",
                lineHeight: "110%"
              }}
            >
              Project Completed get review
            </h3>

            <p
              className="mb-8 max-w-[520px] text-black"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Your client will assess your work once you have completed it.
              A favorable review will raise your profile and attract more customers.
            </p>

            <ul className="space-y-4 text-black" style={{ fontFamily: "Outfit, sans-serif" }}>
              <li className="flex items-start gap-3">
                <span
                  className="flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{
                    minWidth: "24px",
                    minHeight: "24px",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "linear-gradient(180deg, #6A1B9A 0%, #000000 100%)"
                  }}
                >
                  ✓
                </span>
                The project should be finished on schedule.
              </li>

              <li className="flex items-start gap-3">
                <span
                  className="flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{
                    minWidth: "24px",
                    minHeight: "24px",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "linear-gradient(180deg, #6A1B9A 0%, #000000 100%)"
                  }}
                >
                  ✓
                </span>
                Take client comments carefully and make the necessary improvement
              </li>

              <li className="flex items-start gap-3">
                <span
                  className="flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{
                    minWidth: "24px",
                    minHeight: "24px",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "linear-gradient(180deg, #6A1B9A 0%, #000000 100%)"
                  }}
                >
                  ✓
                </span>
                You can also respond to clients and take important inputs.
              </li>

              <li className="flex items-start gap-3">
                <span
                  className="flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{
                    minWidth: "24px",
                    minHeight: "24px",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "linear-gradient(180deg, #6A1B9A 0%, #000000 100%)"
                  }}
                >
                  ✓
                </span>
                You will receive favorable ratings if it is done appropriately.
              </li>
            </ul>
          </div>

          {/* RIGHT SIDE JOB CARD */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 w-full max-w-[520px] ring-1 ring-black">
            {/* JOB 1 */}
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-900">
                UI / UX Designer
              </h4>

              <p className="text-xs text-gray-500 mb-2">
                Fixed-price - Intermediate - Est. Budget: $2,000 - Posted 8 hours ago
              </p>

              <p className="text-xs text-gray-600 leading-relaxed mb-2">
                Hi, this post is to search for UI / UX Designer. I am looking for someone
                with good experience designing plans for formative years. The final
                design should look modern, clean, and premium
                <span className="text-purple-600 cursor-pointer"> more</span>
              </p>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>
                  <span className="text-purple-600">$</span>{" "}
                  <span className="text-black">Fixed Rate</span>
                </span>
                <span className="text-purple-600">★★★★☆</span>
                <span>4/5 (12 Reviews)</span>
                <span className="flex items-center gap-1">
                  <img src={flag} alt="flag" className="w-3 h-3 object-contain" />
                  Manhattan, USA
                </span>
              </div>
            </div>

            {/* JOB 2 */}
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-900">
                UI designer
              </h4>

              <p className="text-xs text-gray-500 mb-2">
                Fixed-price - Intermediate - Est. Budget: $2,000 - Posted 8 hours ago
              </p>

              <p className="text-xs text-gray-600 leading-relaxed mb-2">
                We are looking for a talented Web UX/UI Designer to design the core
                pages and visual system for a new online learning platform
                <span className="text-purple-600 cursor-pointer"> more</span>
              </p>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>
                  <span className="text-purple-600">$</span>{" "}
                  <span className="text-black">Fixed Rate</span>
                </span>
                <span className="text-purple-600">★★★★☆</span>
                <span>4/5 (12 Reviews)</span>
                <span className="flex items-center gap-1">
                  <img src={flag} alt="flag" className="w-3 h-3 object-contain" />
                  Manhattan, USA
                </span>
              </div>
            </div>

            {/* JOB 3 */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                UX Designer
              </h4>

              <p className="text-xs text-gray-500 mb-2">
                Fixed-price - Intermediate - Est. Budget: $2,000 - Posted 8 hours ago
              </p>

              <p className="text-xs text-gray-600 leading-relaxed mb-2">
                This role is ideal for a designer who understands learning platforms
                and can translate business goals into intuitive interfaces
                <span className="text-purple-600 cursor-pointer"> more</span>
              </p>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>
                  <span className="text-purple-600">$</span>{" "}
                  <span className="text-black">Fixed Rate</span>
                </span>
                <span className="text-purple-600">★★★★☆</span>
                <span>4/5 (12 Reviews)</span>
                <span className="flex items-center gap-1">
                  <img src={flag} alt="flag" className="w-3 h-3 object-contain" />
                  Manhattan, USA
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5 */}
        <div className="mt-24 grid md:grid-cols-2 gap-16 items-start">

          {/* LEFT CARD */}
          <div className="bg-[#F5F5F7] shadow-[inset_0px_0px_12px_0px_rgba(0,0,0,0.25)] w-full max-w-[440px] p-[16px] rounded-[18px] flex flex-col gap-[5px]">
            
            {/* SELECT CONTRACT */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-[15px] font-semibold text-gray-800">
                Select contract
              </p>

              <div className="relative w-[200px]">
                <select
                  className="w-[160px] appearance-none bg-[#F5F5F7] rounded-[10px] px-2 py-1.5 text-[12px] font-medium focus:outline-none ring-1 ring-[rgba(38,50,56,1)]"
                >
                  <option>All</option>
                </select>

                {/* Arrow */}
                <svg
                  className="absolute left-14 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M5 7l5 5 5-5H5z" />
                </svg>
              </div>
            </div>

            {/* Divider line */}
            <div className="w-full h-[2px] bg-gray-700 mt-4 mb-4"></div>
            
            {/* JOB TITLE */}
            <div className="mb-2 flex items-center gap-2">
              <h4 className="text-[14px] font-semibold">
                UI/UX Designer beginner
              </h4>
              <span className="text-[10px] bg-[rgba(81,33,143,1)] text-white px-2 py-[2px] rounded-full">
                Fixed rate
              </span>
            </div>

            {/* CLIENT */}
            <p className="text-[12px] text-gray-700 mb-1">
              <span className="font-medium">Client name:</span> Anisaur Rahman
            </p>

            <p className="text-[12px] text-gray-700 mb-4">
              Budget : <span className="font-semibold text-black">$400</span> | 2 contracts
            </p>

            {/* Divider line */}
            <div className="w-full h-[2px] bg-gray-700 mt-4 mb-4"></div>

            {/* PROJECT TITLE */}
            <p className="text-[14px] font-semibold mb-2 text-gray-800">
              Describe about the project
            </p>

            {/* PROJECT BOX */}
            <div className="border border-gray-300 ring-1 ring-black rounded-lg p-3 bg-[#FDFDFD] mb-4">
              <p className="text-[12px] font-semibold mb-1">
                UI / UX Designer
              </p>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Hi, This post is to search for UI / UX Designer. I am looking for someone
                who has good experience in designing plans for formative years. The final
                design should look modern, clean, and premium.
                <span className="text-purple-600 cursor-pointer"> more</span>
              </p>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-4">
              <button className="bg-[rgba(81,33,143,1)] text-white px-5 py-1.5 text-[12px] rounded-full">
                Message
              </button>
              <button className="bg-[#4F9A87] text-white px-5 py-1.5 text-[12px] rounded-full">
                Accept
              </button>
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div
            className="text-black"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            <h3
              className="mb-4"
              style={{
                fontWeight: 600,
                fontSize: "36px",
                lineHeight: "110%"
              }}
            >
              Your Proposal your way
            </h3>

            <p
              className="mb-6 text-[16px] text-black"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Talenta lets you curate your own suggestions,<br />
              customizing your proposal is quite simple. Your<br />
              proposal can be enhanced in a number of ways,<br />
              including by adding media and pictures.
            </p>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span
                  className="flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{
                    minWidth: "24px",
                    minHeight: "24px",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "linear-gradient(180deg, #6A1B9A 0%, #000000 100%)"
                  }}
                >
                  ✓
                </span>
                Engaging in a professional manner might increase your credibility.
              </li>

              <li className="flex items-start gap-3">
                <span
                  className="flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{
                    minWidth: "24px",
                    minHeight: "24px",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "linear-gradient(180deg, #6A1B9A 0%, #000000 100%)"
                  }}
                >
                  ✓
                </span>
                Concentrate on the abilities that will be useful for the assignment.
              </li>

              <li className="flex items-start gap-3">
                <span
                  className="flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{
                    minWidth: "24px",
                    minHeight: "24px",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "linear-gradient(180deg, #6A1B9A 0%, #000000 100%)"
                  }}
                >
                  ✓
                </span>
                You can also explain how you approached the project.
              </li>
            </ul>
          </div>
        </div>
      </div>

    {/* MOBILE BIG WHITE CARD */}
<div className="md:hidden px-5 -mt-15 relative z-20">
  <div className="bg-white rounded-[20px] shadow-xl p-6 space-y-10">
   

          {/* SECTION 1 MOBILE */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                className="text-[20px] font-semibold whitespace-nowrap leading-[120%] mb-3"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                How to{" "}
                <span
                  style={{
                    background: "linear-gradient(90deg,#5705C2 0%,#020202 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                  }}
                >
                  Find
                </span>{" "}
                Work
              </h2>

              <p className="text-[15px] leading-[160%] text-black">
                Discover the ideal job with wonderful clients at the global job marketplace.
                Find exciting work opportunities from companies around the world.
                Connect with trusted clients and grow your professional career.
                Explore thousands of jobs that match your skills and experience.
              </p>
            </div>

            <img
              src={Howworkbg}
              alt="how work"
              className="w-[120px] rounded-[20px] mt-10"
            />
          </div>

          {/* SECTION 2 MOBILE */}
          <div className="md:hidden mt-10">
            {/* TITLE */}
            <h3
              className="text-[24px] font-semibold mb-3"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Find the perfect project for you
            </h3>

            {/* DESCRIPTION */}
            <p
              className="text-[14px] leading-[150%] text-black mb-6"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Web development, content creation, and many other types of projects
              are all available under one roof at Talenta. You are free to select
              from a wide range of projects.
            </p>

            {/* CHECKLIST */}
            <ul className="space-y-4 mb-8">
              <li className="flex gap-3 items-start">
                <span className="w-[22px] h-[22px] flex-shrink-0 flex items-center justify-center text-white text-xs rounded-full bg-gradient-to-b from-purple-700 to-black">
                  ✓
                </span>
                <span className="text-[14px]">
                  To find pertinent projects that you wish to work on, use the appropriate criteria.
                </span>
              </li>

              <li className="flex gap-3 items-start">
                <span className="w-[22px] h-[22px] flex-shrink-0 flex items-center justify-center text-white text-xs rounded-full bg-gradient-to-b from-purple-700 to-black">
                  ✓
                </span>
                <span className="text-[14px]">
                  Verify that the project requirements match your area of expertise.
                </span>
              </li>

              <li className="flex gap-3 items-start">
                <span className="w-[22px] h-[22px] flex-shrink-0 flex items-center justify-center text-white text-xs rounded-full bg-gradient-to-b from-purple-700 to-black">
                  ✓
                </span>
                <span className="text-[14px]">
                  Decide whether you wish to collaborate with the client and act accordingly.
                </span>
              </li>
            </ul>

            {/* PROJECT CARD */}
            <div className="bg-[#F9F9FB] rounded-[14px] shadow-md p-4">
              {/* HEADER */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-[14px] font-semibold">
                    Looking for a UX Web Designer
                  </h4>
                  <p className="text-[11px] text-gray-400">
                    Posted 3 hours ago
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[14px] font-semibold">
                    $10.00 USD
                  </p>
                  <p className="text-[10px] text-gray-400">
                    BIDDING ENDS IN 6 DAYS
                  </p>
                </div>
              </div>

              {/* DESCRIPTION */}
              <p className="text-[12px] text-gray-700 mb-3">
                I need a website for a software development and services company.
                The company is a new startup.
              </p>

              {/* PROJECT LIST + BUTTONS */}
              <div className="flex justify-between items-start mb-4 gap-4">
                {/* LEFT SIDE LIST */}
                <p className="text-[12px] text-gray-800 leading-[18px]">
                  +Digital Transformation work <br/>
                  +Platform modernization <br/>
                  +Maintenance and support <br/>
                  +Utility tool development
                </p>

                {/* RIGHT SIDE BUTTONS */}
                <div className="flex flex-col gap-3">
                  <button className="bg-[#6C2BD9] text-white text-[12px] px-4 h-[34px] rounded-full whitespace-nowrap">
                    Submit a proposal
                  </button>
                  <button className="text-[12px] px-4 h-[34px] rounded-full whitespace-nowrap ring-1 ring-black">
                    Saved the project
                  </button>
                </div>
              </div>

              {/* SKILLS */}
              <p className="font-semibold text-[13px] mb-2">
                Skills and Expertise
              </p>

              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-200 rounded-full text-[11px]">
                  Web Design
                </span>
                <span className="px-3 py-1 bg-gray-200 rounded-full text-[11px]">
                  Mockup
                </span>
                <span className="px-3 py-1 bg-gray-200 rounded-full text-[11px]">
                  UI Design
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 3 MOBILE */}
          <div className="md:hidden mt-12">
            {/* TITLE */}
            <h3
              className="text-[22px] font-semibold mb-3"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Easy to withdraw
            </h3>

            {/* DESCRIPTION */}
            <p
              className="text-[14px] text-black mb-6 leading-[150%]"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Depending on the laws in your location, there are several
              ways to earn paid on Talenta.
            </p>

            {/* CHECKLIST */}
            <ul className="space-y-4 mb-8 text-[14px]">
              <li className="flex gap-3 items-start">
                <span className="min-w-[22px] min-h-[22px] flex-shrink-0 flex items-center justify-center text-white text-xs rounded-full bg-gradient-to-b from-purple-700 to-black">
                  ✓
                </span>
                When it comes to a payment method, you should be honest.
              </li>

              <li className="flex gap-3 items-start">
                <span className="min-w-[22px] min-h-[22px] flex-shrink-0 flex items-center justify-center text-white text-xs rounded-full bg-gradient-to-b from-purple-700 to-black">
                  ✓
                </span>
                To ensure seamless payment processing, make sure your payment details are correct.
              </li>

              <li className="flex gap-3 items-start">
                <span className="min-w-[22px] min-h-[22px] flex-shrink-0 flex items-center justify-center text-white text-xs rounded-full bg-gradient-to-b from-purple-700 to-black">
                  ✓
                </span>
                You can always use your favorite method to withdraw your money.
              </li>
            </ul>

            {/* PAYMENT CARD */}
            <div className="bg-[#F9F9FB] rounded-[22px] shadow-md p-4">
              {/* SUCCESS ICON */}
              <div className="flex justify-center mb-2">
                <div className="flex items-center justify-center bg-[#DDF3E6] w-[40px] h-[40px] md:w-[52px] md:h-[52px] rounded-[10px] md:rounded-[12px]">
                  <svg
                    className="w-[22px] h-[22px] md:w-[34px] md:h-[34px]"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <mask id="cutoutIcon">
                        <rect width="100" height="100" fill="white" />
                        <circle cx="70" cy="76" r="23" fill="black" />
                      </mask>
                    </defs>

                    <g mask="url(#cutoutIcon)">
                      <rect x="10" y="25" width="75" height="50" rx="8" stroke="#00A651" strokeWidth="4"/>
                      <line x1="10" y1="38" x2="85" y2="38" stroke="#00A651" strokeWidth="4"/>
                      <circle cx="22" cy="60" r="4" stroke="#00A651" strokeWidth="4"/>
                    </g>

                    <line x1="10" y1="50" x2="85" y2="50" stroke="#00A651" strokeWidth="4"/>

                    <circle cx="70" cy="76" r="19" stroke="#00A651" strokeWidth="4" fill="#DDF3E6"/>

                    <path
                      d="M61 76L67 82L79 70"
                      stroke="#00A651"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* TITLE */}
              <p className="text-center text-green-600 font-semibold text-[12px] md:text-[13px] mb-2">
                Payment Successful!
              </p>

              <p className="text-center text-gray-500 text-[11px] mb-4">
                Your payment has been processed successfully.
              </p>

              {/* DETAILS */}
              <div className="bg-gray-100 rounded-lg p-3 text-[11px] mb-4">
                <div className="flex justify-between border-b pb-1 mb-1">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-semibold">$300.00</span>
                </div>

                <p className="text-gray-500">Transaction ID</p>
                <p className="text-gray-500">Payment Method</p>
                <p className="text-gray-500">Date</p>

                <div className="flex justify-between">
                  <span className="text-gray-500">Merchant</span>
                  <span>Talenta</span>
                </div>
              </div>

              {/* EMAIL BAR */}
              <div className="mb-3">
                <div className="flex items-center justify-center gap-2 py-2 rounded-md text-white text-[11px] bg-purple-700">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <rect x="4" y="6" width="16" height="12" rx="3" />
                    <path d="M4 7l8 6 8-6" />
                  </svg>
                  <span>Receipt sent to customer@example.com</span>
                </div>
              </div>

              {/* DOWNLOAD BUTTON */}
              <button
                className="w-full bg-black text-white py-2 rounded-md text-[12px] flex items-center justify-center gap-2"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 4v10" />
                  <path d="M8 11l4 4 4-4" />
                  <path d="M5 18v2a1 1 0 001 1h12a1 1 0 001-1v-2" />
                </svg>
                <span>Download Receipt</span>
              </button>

              <p className="text-center text-[10px] text-gray-400 mt-2">
                Need help? Contact support@talent.com
              </p>
            </div>
          </div>
          
          {/* SECTION 4 MOBILE */}
          <div className="md:hidden mt-12">
            {/* TITLE */}
            <h3
              className="text-[22px] font-semibold mb-3"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Project Completed get review
            </h3>

            {/* DESCRIPTION */}
            <p
              className="text-[14px] text-black mb-6 leading-[150%]"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Your client will assess your work once you have completed it.
              A favorable review will raise your profile and attract more customers.
            </p>

            {/* CHECKLIST */}
            <ul className="space-y-4 mb-8 text-[14px]">
              <li className="flex gap-3 items-start">
                <span className="w-[22px] h-[22px] flex items-center justify-center text-white text-xs rounded-full bg-gradient-to-b from-purple-700 to-black">
                  ✓
                </span>
                The project should be finished on schedule.
              </li>

              <li className="flex gap-3 items-start">
                <span className="w-[22px] h-[22px] flex items-center justify-center text-white text-xs rounded-full bg-gradient-to-b from-purple-700 to-black">
                  ✓
                </span>
                Take client comments carefully and make improvements.
              </li>

              <li className="flex gap-3 items-start">
                <span className="w-[22px] h-[22px] flex items-center justify-center text-white text-xs rounded-full bg-gradient-to-b from-purple-700 to-black">
                  ✓
                </span>
                Respond to clients and take important inputs.
              </li>

              <li className="flex gap-3 items-start">
                <span className="w-[22px] h-[22px] flex items-center justify-center text-white text-xs rounded-full bg-gradient-to-b from-purple-700 to-black">
                  ✓
                </span>
                You will receive favorable ratings if done properly.
              </li>
            </ul>

            {/* JOB LIST CARD */}
            <div className="bg-white rounded-[20px] shadow-sm p-4 ring-1 ring-black">
              {/* JOB 1 */}
              <div className="mb-5">
                <h4 className="text-[14px] font-semibold text-gray-900">
                  UI / UX Designer
                </h4>

                <p className="text-[11px] text-gray-500 mb-2">
                  Fixed-price • Intermediate • Budget: $2,000
                </p>

                <p className="text-[12px] text-gray-600 mb-2">
                  Hi, this post is to search for UI / UX Designer. Looking for someone
                  with experience designing modern and clean interfaces.
                  <span className="text-purple-600"> more</span>
                </p>

                <div className="flex items-center gap-2 text-[11px] text-gray-500 whitespace-nowrap">
                  <span>
                    <span className="text-purple-600">$</span>{" "}
                    Fixed Rate
                  </span>
                  <span className="text-purple-600">★★★★☆</span>
                  <span>4/5 (12 Reviews)</span>
                  <span className="flex items-center gap-1">
                    <img src={flag} alt="flag" className="w-3 h-3" />
                    Manhattan, USA
                  </span>
                </div>
              </div>

              {/* JOB 2 */}
              <div className="mb-5">
                <h4 className="text-[14px] font-semibold text-gray-900">
                  UI Designer
                </h4>

                <p className="text-[11px] text-gray-500 mb-2">
                  Fixed-price • Intermediate • Budget: $2,000
                </p>

                <p className="text-[12px] text-gray-600 mb-2">
                  Looking for a Web UX/UI Designer to design the core pages
                  and visual system for an online learning platform.
                  <span className="text-purple-600"> more</span>
                </p>

                <div className="flex items-center gap-2 text-[11px] text-gray-500 whitespace-nowrap">
                  <span>
                    <span className="text-purple-600">$</span>{" "}
                    Fixed Rate
                  </span>
                  <span className="text-purple-600">★★★★☆</span>
                  <span>4/5 (12 Reviews)</span>
                  <span className="flex items-center gap-1">
                    <img src={flag} alt="flag" className="w-3 h-3" />
                    Manhattan, USA
                  </span>
                </div>
              </div>

              {/* JOB 3 */}
              <div>
                <h4 className="text-[14px] font-semibold text-gray-900">
                  UX Designer
                </h4>

                <p className="text-[11px] text-gray-500 mb-2">
                  Fixed-price • Intermediate • Budget: $2,000
                </p>

                <p className="text-[12px] text-gray-600 mb-2">
                  Ideal for designers who understand learning platforms
                  and can translate business goals into intuitive UI.
                  <span className="text-purple-600"> more</span>
                </p>

                <div className="flex items-center gap-2 text-[11px] text-gray-500 whitespace-nowrap">
                  <span>
                    <span className="text-purple-600">$</span>{" "}
                    Fixed Rate
                  </span>
                  <span className="text-purple-600">★★★★☆</span>
                  <span>4/5 (12 Reviews)</span>
                  <span className="flex items-center gap-1">
                    <img src={flag} alt="flag" className="w-3 h-3" />
                    Manhattan, USA
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5 MOBILE */}
          <div className="md:hidden mt-12">
            {/* TITLE */}
            <h3
              className="text-[22px] font-semibold mb-3"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Your Proposal your way
            </h3>

            {/* DESCRIPTION */}
            <p
              className="text-[14px] text-black mb-6 leading-[150%]"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Talenta lets you curate your own suggestions. Customizing your proposal
              is quite simple and can be enhanced in a number of ways.
            </p>

            {/* CHECKLIST */}
            <ul className="space-y-4 mb-8 text-[14px]">
              <li className="flex gap-3 items-start">
                <span className="min-w-[22px] min-h-[22px] flex-shrink-0 flex items-center justify-center text-white text-xs rounded-full bg-gradient-to-b from-purple-700 to-black">
                  ✓
                </span>
                Engaging in a professional manner might increase your credibility.
              </li>

              <li className="flex gap-3 items-start">
                <span className="min-w-[22px] min-h-[22px] flex-shrink-0 flex items-center justify-center text-white text-xs rounded-full bg-gradient-to-b from-purple-700 to-black">
                  ✓
                </span>
                Concentrate on the abilities that will be useful for the assignment.
              </li>

              <li className="flex gap-3 items-start">
                <span className="min-w-[22px] min-h-[22px] flex-shrink-0 flex items-center justify-center text-white text-xs rounded-full bg-gradient-to-b from-purple-700 to-black">
                  ✓
                </span>
                Explain how you approached the project.
              </li>
            </ul>

            {/* PROPOSAL CARD */}
            <div className="bg-[#F5F5F7] rounded-[18px] shadow-md p-4">
              {/* SELECT CONTRACT */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-[13px] font-semibold whitespace-nowrap">
                  Select contract
                </p>

                <select className="w-[200px] text-[12px] bg-[#F5F5F7] rounded-lg px-2 py-1 ring-1 ring-black focus:outline-none">
                  <option>All</option>
                </select>
              </div>

              {/* JOB TITLE */}
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-[13px] font-semibold">
                  UI/UX Designer beginner
                </h4>
                <span className="text-[10px] bg-purple-700 text-white px-2 py-[2px] rounded-full">
                  Fixed rate
                </span>
              </div>

              {/* CLIENT */}
              <p className="text-[12px] text-gray-700">
                <span className="font-medium">Client name:</span> Anisaur Rahman
              </p>

              <p className="text-[12px] text-gray-700 mb-3">
                Budget: <span className="font-semibold">$400</span> | 2 contracts
              </p>

              {/* PROJECT BOX */}
              <div className="rounded-lg p-3 bg-white mb-4 ring-1 ring-black">
                <p className="text-[12px] font-semibold mb-1">
                  UI / UX Designer
                </p>

                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Hi, this post is to search for UI / UX Designer. Looking for someone
                  with good experience designing modern and clean interfaces.
                  <span className="text-purple-600"> more</span>
                </p>
              </div>

              {/* BUTTONS */}
              <div className="flex gap-3">
                <button className="bg-purple-700 text-white text-[12px] px-4 py-2 rounded-full">
                  Message
                </button>
                <button className="bg-[#4F9A87] text-white text-[12px] px-4 py-2 rounded-full">
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="-mx-4">
        {/* <Footer /> */}
      </div>
    </div>
  );
};

export default Findwork;