import React from "react";
import { useNavigate } from "react-router-dom";

// import Footer from "../../component/Footer";

import BannerImg from "../../assets/myproject/banner.png";
import Child from "../../assets/Landing/Child.png";
import Dp1 from "../../assets/AfterSign/Dp1.jpg";
import Dp2 from "../../assets/AfterSign/Dp2.jpg";

const CompleteProject = () => {
  const navigate = useNavigate();

  const handlePostJob = () => {
    navigate("/created");
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
           <h1 className="font-bold text-[28px] leading-[100%] trochut-font cursor-pointer bg-gradient-to-r from-[#B77BFF] to-[#E0B0FF] text-transparent bg-clip-text">
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
          <div className="relative z-10 flex items-center justify-center h-full text-center px-4">
            <h1 className="text-white text-2xl font-bold leading-snug">
              Assign a Complete Project <br /> on Talenta
            </h1>
          </div>
        </div>

        {/* CONTENT CARD */}
        <div className="bg-white rounded-t-3xl -mt-10 relative z-10 p-6 mx-3 shadow-xl space-y-8">
          
          {/* ASSIGN PROJECT SECTION */}
          <div>
            <div className="flex justify-between items-start gap-4 mb-3">
              <h2 className="text-xl font-bold leading-tight">
                Assign a <span className="text-[#7B3FE4]">Complete</span>
                <br /> Job Project on Talenta
                 <p className="text-gray-600 text-sm leading-relaxed mt-5">
              Congratulations for using Talenta to <br /> assign a whole project! Finding the <br/> 
              ideal freelancer and finishing your <br /> assignment quickly are made possible <br />
              by our platform's smooth and <br /> effective design.
            </p>
              </h2>
              
              <img src={Child} alt="child" className="w-24 h-64 rounded-xl object-cover flex-shrink-0" />
            </div>
           
          </div>

          {/* POST A JOB SECTION */}
          <div>
            <h2 className="text-xl font-bold mb-3">Post a Job</h2>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              One of the most well-known websites for hiring independent contractors is talenta. 
              Make an account and log in if you wish to engage independent contractors. Select 
              "Post a job." Important details concerning your project and work duties must be 
              filled out.
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="w-5 h-5 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-xs mt-0.5 flex-shrink-0">✓</span>
                <span>Click on the "Post a Job" button.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-xs mt-0.5 flex-shrink-0">✓</span>
                <span>Enter the last date for posting a job.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-xs mt-0.5 flex-shrink-0">✓</span>
                <span>After you are done post the job for other freelancers to apply.</span>
              </li>
            </ul>
          </div>

          {/* POST JOB FORM CARD */}
          <div className="bg-white !border !border-gray-300 rounded-xl p-5 shadow-md">
            <h3 className="font-semibold text-lg mb-4 text-[#5A2EA6]">Talenta</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Job title</label>
                <input
                  type="text"
                  placeholder="ex, need Web developer for figma"
                  className="w-full !border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#5A2EA6]"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Describe about the project</label>
                <textarea
                  placeholder="writer here"
                  rows="3"
                  className="w-full !border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#5A2EA6]"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Skills</label>
                <input
                  type="text"
                  placeholder="Web Design, UI Design"
                  className="w-full !border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#5A2EA6]"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Experience Level</label>
                <input
                  type="text"
                  placeholder="Beginner / Intermediate / Expert"
                  className="w-full !border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#5A2EA6]"
                />
              </div>
            </div>
          </div>

          {/* FIND AMAZING FREELANCERS SECTION */}
          <div>
            <h2 className="text-xl font-bold mb-3">Find amazing freelancers</h2>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              Many skilled individuals can be found on Talenta; these independent contractors 
              possess the abilities needed to realize a project. To identify qualified individuals, 
              you can utilize a variety of filters, such as experience and salary. Based on the 
              needs of your job, you can evaluate other freelancers and select the most qualified ones.
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="w-5 h-5 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-xs mt-0.5 flex-shrink-0">✓</span>
                <span>Sort freelancers based on criteria including budget, experience, and skill set.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-xs mt-0.5 flex-shrink-0">✓</span>
                <span>Additionally, you can engage freelancers that you locate on your homepage.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-xs mt-0.5 flex-shrink-0">✓</span>
                <span>You can compare freelancers based on their accomplishments by going to their page.</span>
              </li>
            </ul>
          </div>

          {/* FREELANCER CARD 1 - Sebastian */}
          <div className="bg-[#F8F8F8] rounded-xl p-4 shadow-md">
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-3 items-center">
                <img src={Dp2} alt="Sebastian" className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h3 className="font-semibold text-base">Sebastian</h3>
                  <p className="text-xs text-gray-500">Graphic Designer</p>
                </div>
              </div>
              <button className="!border border-[#5A2EA6] text-[#5A2EA6] px-4 py-1 rounded-full text-xs">
                Invite
              </button>
            </div>
            <p className="font-semibold text-sm mb-1">$50.00 /hr</p>
            <p className="text-xs text-gray-500 mb-3">Total earnings $76k on web and mobile design</p>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-[#5A2EA6] text-white text-xs px-3 py-1 rounded-full">Poster design</span>
              <span className="bg-[#5A2EA6] text-white text-xs px-3 py-1 rounded-full">Mobile design</span>
              <span className="bg-[#5A2EA6] text-white text-xs px-3 py-1 rounded-full">Photos</span>
              <span className="bg-[#5A2EA6] text-white text-xs px-3 py-1 rounded-full">Illustrator</span>
              <span className="text-[#5A2EA6] text-xs cursor-pointer">more</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>⭐⭐⭐⭐ 4/5 (17 Reviews)</span>
              <span>• Manhattan, USA</span>
            </div>
          </div>

          {/* FREELANCER CARD 2 - James */}
          <div className="bg-[#F8F8F8] rounded-xl p-4 shadow-md">
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-3 items-center">
                <img src={Dp1} alt="James" className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h3 className="font-semibold text-base">James</h3>
                  <p className="text-xs text-gray-500">UX Designer, Graphic Designer</p>
                </div>
              </div>
              <button className="!border border-[#5A2EA6] text-[#5A2EA6] px-4 py-1 rounded-full text-xs">
                Invite
              </button>
            </div>
            <p className="font-semibold text-sm mb-1">$10.00 /hr</p>
            <p className="text-xs text-gray-500 mb-3">Total earnings $36k on web and mobile design</p>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-[#5A2EA6] text-white text-xs px-3 py-1 rounded-full">Web design</span>
              <span className="bg-[#5A2EA6] text-white text-xs px-3 py-1 rounded-full">Wire Frame</span>
              <span className="bg-[#5A2EA6] text-white text-xs px-3 py-1 rounded-full">Prototypes</span>
              <span className="bg-[#5A2EA6] text-white text-xs px-3 py-1 rounded-full">Layout Design</span>
              <span className="text-[#5A2EA6] text-xs cursor-pointer">more</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>⭐⭐⭐⭐ 4/5 (12 Reviews)</span>
              <span>• Chennai, India</span>
            </div>
          </div>

          {/* REVIEW PROPOSAL SECTION */}
          <div>
            <h2 className="text-xl font-bold mb-3">Review Proposal</h2>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              Freelancers will submit their proposals once you have finished posting a job. 
              Before hiring them, you can look over their proposals. Additionally, you may 
              examine their profile and read reviews. Talenta helps you and freelancers 
              communicate so that you can negotiate and understand each other well.
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="w-5 h-5 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-xs mt-0.5 flex-shrink-0">✓</span>
                <span>Select the ideal freelancer based on the requirements of your job.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-xs mt-0.5 flex-shrink-0">✓</span>
                <span>Check for proposals by going to the proposals page.</span>
              </li>
            </ul>
          </div>

          {/* PROPOSAL CARD */}
          <div className="bg-white !border border-gray-300 rounded-xl p-5 shadow-md">
            <div className="!border-b pb-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-base">UI/UX Designer beginner</h3>
                <span className="bg-[#5A2EA6] text-white text-xs px-2 py-0.5 rounded-full">Fixed rate</span>
              </div>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Client name:</span> Anisur Rahman
              </p>
              <p className="text-sm text-gray-700 mt-1">
                Budget: <span className="font-medium">$400</span> | 2 contracts
              </p>
            </div>
            <div className="mb-4">
              <label className="block font-medium text-sm mb-2">Describe about the project</label>
              <textarea
                className="w-full !border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#5A2EA6]"
                placeholder="Write project description here..."
                rows="3"
              ></textarea>
            </div>
            <div className="flex gap-3">
              <button className="bg-[#5A2EA6] text-white px-6 py-2 rounded-full text-sm ">
                Message
              </button>
              <button className="bg-green-600 text-white px-6 py-2 rounded-full text-sm ">
                Accept
              </button>
            </div>
          </div>

          {/* COMPENSATE FREELANCERS SECTION */}
          <div>
            <h2 className="text-xl font-bold mb-3">Compensate freelancers with a single tap.</h2>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              Talenta makes it simple to make payments; all you have to do is tap. You must pay 
              your freelancer after the job is completed, and Talenta makes this process simple 
              for you. When you use Talenta to pay freelancers, the money goes directly to them, 
              and they can take it out of their Talenta page.
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="w-5 h-5 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-xs mt-0.5 flex-shrink-0">✓</span>
                <span>Use the Talenta page to make your payment.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-xs mt-0.5 flex-shrink-0">✓</span>
                <span>Freelancers are paid.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-xs mt-0.5 flex-shrink-0">✓</span>
                <span>The money is taken out by freelancers.</span>
              </li>
            </ul>
          </div>

          {/* PAYMENT CARD */}
          <div className="bg-white !border !border-gray-300 rounded-xl p-5 shadow-md">
            <div className="flex justify-center mb-3">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 4H4C2.89 4 2 4.89 2 6V18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z" fill="#10B981"/>
                <circle cx="16.5" cy="15.5" r="1.5" fill="white"/>
              </svg>
            </div>
            <h3 className="text-green-600 font-semibold text-lg mb-2 text-center">Payment Successful!</h3>
            <p className="text-xs text-gray-500 mb-4 text-center">
              Your payment has been processed successfully.
            </p>
            <div className="bg-[#D3D3D3] !border border-gray-300 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-600">Amount</span>
                <span className="font-semibold text-sm">$500.00</span>
              </div>
              <hr className="mb-3 border-gray-200" />
              <div className="space-y-2 text-xs">
                <div className="flex items-center text-gray-600">
                  Transaction ID: <span className="text-gray-900 ml-1 font-medium">#TXN123456789</span>
                </div>
                <div className="flex items-center text-gray-600">
                  Payment Method: <span className="text-gray-900 ml-1 font-medium">Visa ****4242</span>
                </div>
                <div className="flex items-center text-gray-600">
                  Date: <span className="text-gray-900 ml-1 font-medium">March 5, 2026</span>
                </div>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                <span className="text-xs text-gray-600">Merchant</span>
                <span className="font-semibold text-sm text-[#5A2EA6]">Talenta</span>
              </div>
            </div>
            <button className="bg-black text-white w-full py-2.5 rounded-lg text-sm mb-2 hover:bg-gray-800">
              Download Receipt
            </button>
          </div>

          {/* CREATE CONTRACT SECTION */}
          <div>
            <h2 className="text-xl font-bold mb-3">Create Contract</h2>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              You must hire the freelancer listed on the page once you have finished choosing 
              a qualified applicant. Make sure you understand the terms and conditions of 
              employment before a freelancer begins working on your project. To ensure that 
              everyone understands their responsibilities and what is expected of them, a 
              contract might be used.
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="w-5 h-5 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-xs mt-0.5 flex-shrink-0">✓</span>
                <span>On Talenta, mark the applicant as "hired."</span>
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-xs mt-0.5 flex-shrink-0">✓</span>
                <span>Complete the contract and forward it to the selected applicant.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-xs mt-0.5 flex-shrink-0">✓</span>
                <span>Work can begin once the contract has been signed.</span>
              </li>
            </ul>
          </div>

          {/* CONTRACT CARD */}
          <div className="bg-white !border !border-gray-300 rounded-xl p-5 shadow-md">
            <div className="flex items-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400 mr-1">
                <path d="M15 18L9 12L15 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xs text-gray-600">Back</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Job title</label>
                <input
                  type="text"
                  placeholder="ex, need Web developer for figma"
                  className="w-full !border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#5A2EA6]"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Describe about the project</label>
                <textarea
                  placeholder="writer here"
                  rows="3"
                  className="w-full !border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#5A2EA6]"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Skills</label>
                <div className="w-full !border border-gray-300 rounded-lg p-3 flex flex-wrap gap-2">
                  <span className="bg-[#5A2EA6] text-white text-xs px-3 py-1 rounded-full flex items-center">
                    Web Design <span className="ml-2 cursor-pointer">✕</span>
                  </span>
                  <span className="bg-[#5A2EA6] text-white text-xs px-3 py-1 rounded-full flex items-center">
                    Mockup <span className="ml-2 cursor-pointer">✕</span>
                  </span>
                  <input
                    type="text"
                    placeholder="Add skills..."
                    className="outline-none border-none flex-1 min-w-[100px] text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button className="bg-[#5A2EA6] text-white px-5 py-2 rounded-lg text-sm hover:bg-[#6633C4]">
                  Saved as draft
                </button>
                <button
                  onClick={handlePostJob}
                  className="bg-[#5A2EA6] text-white px-5 py-2 rounded-lg text-sm hover:bg-[#6633C4]"
                >
                  Post job now
                </button>
              </div>
            </div>
          </div>

          {/* SUBMIT REVIEW SECTION */}
          <div>
            <h2 className="text-xl font-bold mb-3">Submit a Review</h2>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              You have the opportunity to evaluate the freelancer you collaborated with when 
              your task is finished. Write a review on your Talenta page, then submit it once 
              you're done. The caliber of the work and the freelancer's degree of skill must 
              be the foundation of your evaluation.
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="w-5 h-5 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-xs mt-0.5 flex-shrink-0">✓</span>
                <span>On the page, write a review.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-xs mt-0.5 flex-shrink-0">✓</span>
                <span>When you're finished, submit your review.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-xs mt-0.5 flex-shrink-0">✓</span>
                <span>Mention things like their behavior and conversation.</span>
              </li>
            </ul>
          </div>

          {/* REVIEW CARD */}
          <div className="bg-white !border border-gray-300 rounded-xl p-5 shadow-md">
            <div className="!border-b pb-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-base">UI/UX Designer beginner</h3>
                <span className="bg-[#5A2EA6] text-white text-xs px-2 py-0.5 rounded-full">Fixed rate</span>
              </div>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Client name:</span> Anisur Rahman
              </p>
              <p className="text-sm text-gray-700 mt-1">
                Budget: <span className="font-medium">$400</span> | 2 contracts
              </p>
            </div>
            <div className="mb-4">
              <label className="block font-medium text-sm mb-2">Describe about the project</label>
              <textarea
                className="w-full !border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#5A2EA6]"
                placeholder="Write your review here..."
                rows="3"
              ></textarea>
            </div>
            <div className="flex gap-3">
              <button className="bg-[#5A2EA6] text-white px-6 py-2 rounded-full text-sm hover:bg-[#6633C4]">
                Message
              </button>
              <button className="bg-green-600 text-white px-6 py-2 rounded-full text-sm hover:bg-green-700">
                Accept
              </button>
            </div>
          </div>

        </div>

        {/* <Footer /> */}
      </div>

      {/* ================= DESKTOP VERSION ================= */}
      <div className="hidden md:block">
        {/* HERO SECTION */}
        <div
          className="relative w-full h-[420px] bg-cover bg-center"
          style={{ backgroundImage: `url(${BannerImg})` }}
        >
          {/* HEADER OVER BANNER */}
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

          {/* DARK OVERLAY */}
          <div className="absolute inset-0 bg-black/40"></div>

          {/* HERO TITLE */}
          <div className="relative z-10 flex items-center justify-center h-full text-center px-4">
            <h1 className="text-white text-5xl md:text-4xl font-bold leading-tight">
              Assign a Complete Project <br />
              on Talenta
            </h1>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-6 py-16">
          {/* HERO SECTION WITH IMAGE */}
          <div className="grid md:grid-cols-2 grid-cols-1 gap-12 items-center mb-20">
            {/* LEFT TEXT */}
            <div className="text-center md:text-left">
              <h2 className="text-[40px] md:text-[44px] font-bold leading-tight mb-6">
                Assign a <span className="text-[#7B3FE4]">Complete</span>
                <br /> Project on Talenta
              </h2>
              <p className="text-gray-600 text-lg max-w-[500px] mx-auto md:mx-0 leading-relaxed">
                Congratulations for using Talenta to assign a whole project!
                Finding the ideal freelancer and finishing your assignment
                quickly are made possible by our platform's smooth and
                effective design.
              </p>
            </div>

            {/* RIGHT IMAGE */}
            <div className="flex justify-center md:justify-end">
              <img
                src={Child}
                alt="child"
                className="w-full max-w-[500px] rounded-[26px] shadow-xl"
              />
            </div>
          </div>

          {/* POST A JOB */}
          <div className="grid md:grid-cols-2 grid-cols-1 gap-12 items-start mb-20">
            {/* LEFT TEXT */}
            <div className="text-center md:text-left">
              <h2 className="text-[36px] md:text-[40px] font-bold mb-6">
                Post a Job
              </h2>
              <p className="text-gray-600 text-lg mb-8 max-w-[500px] mx-auto md:mx-0 leading-relaxed">
                One of the most well-known websites for hiring <br />independent contractors
                is talenta. Make an account <br /> and log in if you wish to engage independent <br /> 
                contractors. Select "Post a job." Important details <br />  concerning your
                project and work duties must be filled  <br /> out.
              </p>
              <ul className="space-y-4 max-w-[500px] mx-auto md:mx-0">
                <li className="flex gap-3 items-start">
                  <span className="w-6 h-6 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-sm shrink-0 mt-0.5">✓</span>
                  <span className="text-lg">Click on the "Post a Job" button.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="w-6 h-6 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-sm shrink-0 mt-0.5">✓</span>
                  <span className="text-lg">Enter the last date for posting a job.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="w-6 h-6 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-sm shrink-0 mt-0.5">✓</span>
                  <span className="text-lg">After you are done post the job for other freelancers to apply.</span>
                </li>
              </ul>
            </div>

            {/* RIGHT FORM CARD */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-300 p-8">
              <h3 className="text-2xl font-semibold mb-6 text-[#5A2EA6]">Talenta</h3>
              <div className="mb-5">
                <label className="block text-base font-medium mb-2">Job title</label>
                <input
                  type="text"
                  placeholder="ex, need Web developer for figma"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[#5A2EA6] transition"
                />
              </div>
              <div className="mb-5">
                <label className="block text-base font-medium mb-2">Describe about the project</label>
                <textarea
                  placeholder="writer here"
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[#5A2EA6] transition"
                />
              </div>
              <div className="mb-5">
                <label className="block text-base font-medium mb-2">Skills</label>
                <input
                  type="text"
                  placeholder="Web Design, UI Design"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[#5A2EA6] transition"
                />
              </div>
              <div>
                <label className="block text-base font-medium mb-2">Experience Level</label>
                <input
                  type="text"
                  placeholder="Beginner / Intermediate / Expert"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[#5A2EA6] transition"
                />
              </div>
            </div>
          </div>

          {/* FIND AMAZING FREELANCERS */}
          <div className="grid md:grid-cols-2 grid-cols-1 gap-12 items-start mb-20">
            {/* LEFT FREELANCER CARDS */}
            <div className="flex flex-col gap-6 order-2 md:order-1">
              {/* CARD 1 - James */}
              <div className="bg-[#F8F8F8] rounded-2xl p-6 shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4 items-center">
                    <img src={Dp1} alt="James" className="w-14 h-14 rounded-full object-cover" />
                    <div>
                      <h3 className="font-semibold text-xl">James</h3>
                      <p className="text-gray-500 text-base">UX Designer, Graphic Designer</p>
                    </div>
                  </div>
                  <button className="border border-[#5A2EA6] text-[#5A2EA6] px-6 py-1.5 rounded-full text-base transition">
                    Invite
                  </button>
                </div>
                <p className="font-semibold text-lg mb-1">$10.00 /hr</p>
                <p className="text-gray-500 text-base mb-4">Total earnings $36k on web and mobile design</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-[#5A2EA6] text-white text-sm px-4 py-1.5 rounded-full">Web design</span>
                  <span className="bg-[#5A2EA6] text-white text-sm px-4 py-1.5 rounded-full">Wire Frame</span>
                  <span className="bg-[#5A2EA6] text-white text-sm px-4 py-1.5 rounded-full">Prototypes</span>
                  <span className="bg-[#5A2EA6] text-white text-sm px-4 py-1.5 rounded-full">Layout Design</span>
                  <span className="text-[#5A2EA6] text-base cursor-pointer">more</span>
                </div>
                <div className="flex items-center gap-3 text-base text-gray-500">
                  ⭐⭐⭐⭐ 4/5 (12 Reviews) <span>• Chennai, India</span>
                </div>
              </div>

              {/* CARD 2 - Sebastian */}
              <div className="bg-[#F8F8F8] rounded-2xl p-6 shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4 items-center">
                    <img src={Dp2} alt="Sebastian" className="w-14 h-14 rounded-full object-cover" />
                    <div>
                      <h3 className="font-semibold text-xl">Sebastian</h3>
                      <p className="text-gray-500 text-base">Graphic Designer</p>
                    </div>
                  </div>
                  <button className="border border-[#5A2EA6] text-[#5A2EA6] px-6 py-1.5 rounded-full text-base transition">
                    Invite
                  </button>
                </div>
                <p className="font-semibold text-lg mb-1">$50.00 /hr</p>
                <p className="text-gray-500 text-base mb-4">Total earnings $76k on web and mobile design</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-[#5A2EA6] text-white text-sm px-4 py-1.5 rounded-full">Poster design</span>
                  <span className="bg-[#5A2EA6] text-white text-sm px-4 py-1.5 rounded-full">Mobile design</span>
                  <span className="bg-[#5A2EA6] text-white text-sm px-4 py-1.5 rounded-full">Photos</span>
                  <span className="bg-[#5A2EA6] text-white text-sm px-4 py-1.5 rounded-full">Illustrator</span>
                  <span className="text-[#5A2EA6] text-base cursor-pointer">more</span>
                </div>
                <div className="flex items-center gap-3 text-base text-gray-500">
                  ⭐⭐⭐⭐ 4/5 (17 Reviews) <span>• Manhattan, USA</span>
                </div>
              </div>
            </div>

            {/* RIGHT TEXT */}
            <div className="text-center md:text-left order-1 md:order-2">
              <h2 className="text-[36px] md:text-[40px] font-bold mb-6">Find amazing freelancers</h2>
              <p className="text-gray-600 text-lg mb-8 max-w-[500px] mx-auto md:mx-0 leading-relaxed">
                Many skilled individuals can be found on Talenta; these <br /> independent
                contractors possess the abilities needed <br /> to realize a project.
                To identify qualified individuals,<br />  you can utilize a variety of
                filters, such as experience <br /> and salary. Based on the needs of your
                job, you can <br /> evaluate other freelancers and select the most <br />
                qualified ones.
              </p>
              <ul className="space-y-4 max-w-[500px] mx-auto md:mx-0">
                <li className="flex gap-3 items-start">
                  <span className="w-6 h-6 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-sm shrink-0 mt-0.5">✓</span>
                  <span className="text-lg">Sort freelancers based on criteria including budget, experience, and skill set.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="w-6 h-6 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-sm shrink-0 mt-0.5">✓</span>
                  <span className="text-lg">Additionally, you can engage freelancers that you locate on your homepage.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="w-6 h-6 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-sm shrink-0 mt-0.5">✓</span>
                  <span className="text-lg">You can compare freelancers based on their accomplishments by going to their page.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* REVIEW PROPOSAL */}
          <div className="grid md:grid-cols-2 grid-cols-1 gap-12 items-start mb-20">
            {/* LEFT TEXT */}
            <div className="text-center md:text-left">
              <h2 className="text-[36px] md:text-[40px] font-bold mb-6">Review Proposal</h2>
              <p className="text-gray-600 text-lg mb-8 max-w-[500px] mx-auto md:mx-0 leading-relaxed">
                Freelancers will submit their proposals once you have <br /> finished posting
                a job. Before hiring them, you can look <br /> over their proposals.
                Additionally, you may examine <br /> their profile and read reviews.
                Additionally, <br /> 
                <br />
                Talenta helps you and freelancers communicate so that
                you can negotiate and understand each other well
              </p>
              <ul className="space-y-4 max-w-[500px] mx-auto md:mx-0">
                <li className="flex gap-3 items-start">
                  <span className="w-6 h-6 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-sm shrink-0 mt-0.5">✓</span>
                  <span className="text-lg">Select the ideal freelancer based on the requirements of your job.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="w-6 h-6 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-sm shrink-0 mt-0.5">✓</span>
                  <span className="text-lg">Check for proposals by going to the proposals page.</span>
                </li>
              </ul>
            </div>

            {/* RIGHT CARD */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-300 p-8">
              <div className="border-b pb-6 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-semibold text-xl">UI/UX Designer beginner</h3>
                  <span className="bg-[#5A2EA6] text-white text-sm px-3 py-1 rounded-full">Fixed rate</span>
                </div>
                <p className="text-gray-700 text-lg"><span className="font-semibold">Client name:</span> Anisur Rahman</p>
                <p className="text-gray-700 text-lg mt-2">Budget: <span className="font-semibold">$400</span> | 2 contracts</p>
              </div>
              <div className="mb-8">
                <label className="block font-semibold text-lg mb-3">Describe about the project</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg h-32 p-4 text-base focus:outline-none focus:border-[#5A2EA6] transition resize-none"
                  placeholder="Write project description here..."
                ></textarea>
              </div>
              <div className="flex gap-4">
                <button className="bg-[#5A2EA6] text-white px-10 py-3 rounded-full text-lg hover:bg-[#6633C4] transition">Message</button>
                <button className="bg-green-600 text-white px-10 py-3 rounded-full text-lg hover:bg-green-700 transition">Accept</button>
              </div>
            </div>
          </div>

          {/* PAYMENT SECTION */}
          <div className="grid md:grid-cols-2 grid-cols-1 gap-12 items-start mb-20">
            {/* LEFT PAYMENT CARD */}
            <div className="rounded-[30px] p-10 shadow-lg">
              <div className="flex justify-center mb-6">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 4H4C2.89 4 2 4.89 2 6V18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z" fill="#10B981"/>
                  <circle cx="16.5" cy="15.5" r="1.5" fill="white"/>
                </svg>
              </div>
              <h3 className="text-green-600 font-semibold text-2xl mb-3 text-center">Payment Successful!</h3>
              <p className="text-gray-500 mb-8 text-base text-center">
                Your payment has been processed successfully. You will receive a confirmation email shortly.
              </p>
              <div className="bg-[#F5F5F7] border border-gray-300 rounded-2xl p-6 mb-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600 text-base">Amount</span>
                  <span className="font-semibold text-lg text-gray-900">$300.00</span>
                </div>
                <hr className="mb-4 border-gray-200" />
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600 text-base">
                    Transaction ID: <span className="text-gray-900 ml-1 font-medium">#TXN123456789</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-base">
                    Payment Method: <span className="text-gray-900 ml-1 font-medium">Visa ****4242</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-base">
                    Date: <span className="text-gray-900 ml-1 font-medium">March 5, 2026</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                  <span className="text-gray-600 text-base">Merchant</span>
                  <span className="font-semibold text-lg text-[#5A2EA6]">Talenta</span>
                </div>
              </div>
              <div className="bg-[#5A2EA6] text-white py-3 rounded-lg mb-4 text-base text-center cursor-pointer hover:bg-[#6633C4] transition">
                Receipt sent to customer@example.com
              </div>
              <button className="bg-black text-white w-full py-3 rounded-lg mb-4 text-base cursor-pointer hover:bg-gray-800 transition">
                Download Receipt
              </button>
              <p className="text-base text-gray-500 text-center">
                Need help? Contact our support team at{' '}
                <span className="text-[#5A2EA6] cursor-pointer hover:underline">support@talenta.com</span>
              </p>
            </div>
            
            {/* RIGHT TEXT */}
            <div className="text-center md:text-left">
              <h2 className="text-[36px] md:text-[40px] font-bold mb-6">Compensate freelancers with a single tap.</h2>
              <p className="text-gray-600 text-lg mb-8 max-w-[500px] mx-auto md:mx-0 leading-relaxed">
                Talenta makes it simple to make payments; all you have <br />to do is tap.
                You must pay your freelancer after the job <br /> is completed, and Talenta
                makes this process simple <br /> for you. When you use Talenta to pay freelancers,
                the <br /> money goes directly to them, and they can take it out <br /> of their Talenta page.
              </p>
              <ul className="space-y-4 max-w-[500px] mx-auto md:mx-0">
                <li className="flex gap-3 items-start">
                  <span className="w-6 h-6 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-sm shrink-0 mt-0.5">✓</span>
                  <span className="text-lg">Use the Talenta page to make your payment.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="w-6 h-6 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-sm shrink-0 mt-0.5">✓</span>
                  <span className="text-lg">Freelancers are paid.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="w-6 h-6 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-sm shrink-0 mt-0.5">✓</span>
                  <span className="text-lg">The money is taken out by freelancers.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* CREATE CONTRACT SECTION */}
          <div className="grid md:grid-cols-2 grid-cols-1 gap-12 items-start mb-20">
            {/* LEFT TEXT */}
            <div className="text-center md:text-left">
              <h2 className="text-[36px] md:text-[40px] font-bold mb-6">Create Contract</h2>
              <p className="text-gray-600 text-lg mb-8 max-w-[500px] mx-auto md:mx-0 leading-relaxed">
                You must hire the freelancer listed on the page once <br /> you have finished choosing 
                a qualified applicant. Make <br /> sure you understand the terms and conditions of <br />
                employment before a freelancer begins working on <br /> your project. To ensure that 
                everyone understands <br /> their responsibilities and what is expected of them, a <br />
                contract might be used.
              </p>
              <ul className="space-y-4 max-w-[500px] mx-auto md:mx-0">
                <li className="flex gap-3 items-start">
                  <span className="w-6 h-6 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-sm shrink-0 mt-0.5">✓</span>
                  <span className="text-lg">On Talenta, mark the applicant as "hired."</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="w-6 h-6 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-sm shrink-0 mt-0.5">✓</span>
                  <span className="text-lg">Complete the contract and forward it to the selected applicant.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="w-6 h-6 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-sm shrink-0 mt-0.5">✓</span>
                  <span className="text-lg">Work can begin once the contract has been signed.</span>
                </li>
              </ul>
            </div>

            {/* RIGHT CONTRACT CARD */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-300 p-8">
              <div className="flex items-center mb-6">
                <button className="text-gray-400 hover:text-[#5A2EA6] transition mr-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <span className="text-gray-600 text-lg">Back</span>
              </div>
              <div className="mb-5">
                <label className="block text-base font-medium mb-2">Job title</label>
                <input
                  type="text"
                  placeholder="ex, need Web developer for figma"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[#5A2EA6] transition"
                />
              </div>
              <div className="mb-5">
                <label className="block text-base font-medium mb-2">Describe about the project</label>
                <textarea
                  placeholder="writer here"
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[#5A2EA6] transition resize-none"
                />
              </div>
              <div className="mb-6">
                <label className="block text-base font-medium mb-2">Skills</label>
                <div className="w-full border border-gray-300 rounded-lg p-3 flex flex-wrap gap-2 min-h-[60px]">
                  <span className="bg-[#5A2EA6] text-white text-sm px-4 py-1.5 rounded-full flex items-center">
                    Web Design <span className="ml-2 cursor-pointer hover:text-gray-200">✕</span>
                  </span>
                  <span className="bg-[#5A2EA6] text-white text-sm px-4 py-1.5 rounded-full flex items-center">
                    Mockup <span className="ml-2 cursor-pointer hover:text-gray-200">✕</span>
                  </span>
                  <input
                    type="text"
                    placeholder="Add skills..."
                    className="outline-none border-none flex-1 min-w-[120px] text-base"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="bg-[#5A2EA6] text-white px-8 py-3 rounded-lg hover:bg-[#6633C4] transition text-base font-medium">
                  Saved as draft
                </button>
                <button
                  onClick={handlePostJob}
                  className="bg-[#5A2EA6] text-white px-8 py-3 rounded-lg hover:bg-[#6633C4] transition text-base font-medium"
                >
                  Post job now
                </button>
              </div>
            </div>
          </div>

          {/* SUBMIT REVIEW SECTION */}
          <div className="grid md:grid-cols-2 grid-cols-1 gap-12 items-start">
            {/* LEFT REVIEW CARD */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-300 p-8">
              <div className="border-b pb-6 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-semibold text-xl">UI/UX Designer beginner</h3>
                  <span className="bg-[#5A2EA6] text-white text-sm px-3 py-1 rounded-full">Fixed rate</span>
                </div>
                <p className="text-gray-700 text-lg"><span className="font-semibold">Client name:</span> Anisur Rahman</p>
                <p className="text-gray-700 text-lg mt-2">Budget: <span className="font-semibold">$400</span> | 2 contracts</p>
              </div>
              <div className="mb-8">
                <label className="block font-semibold text-lg mb-3">Describe about the project</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg h-32 p-4 text-base focus:outline-none focus:border-[#5A2EA6] transition resize-none"
                  placeholder="Write your review here..."
                ></textarea>
              </div>
              <div className="flex gap-4">
                <button className="bg-[#5A2EA6] text-white px-10 py-3 rounded-full text-lg hover:bg-[#6633C4] transition">Message</button>
                <button className="bg-green-600 text-white px-10 py-3 rounded-full text-lg hover:bg-green-700 transition">Accept</button>
              </div>
            </div>

            {/* RIGHT TEXT */}
            <div className="text-center md:text-left">
              <h2 className="text-[36px] md:text-[40px] font-bold mb-6">Submit a Review</h2>
              <p className="text-gray-600 text-lg mb-8 max-w-[500px] mx-auto md:mx-0 leading-relaxed">
                You have the opportunity to evaluate the freelancer <br /> you collaborated
                with when your task is finished. Write <br /> a review on your Talenta page,
                then submit it once <br /> you're done. The caliber of the work and the <br />
                freelancer's degree of skill must be the foundation of  <br /> your evaluation.
              </p>
              <ul className="space-y-4 max-w-[500px] mx-auto md:mx-0">
                <li className="flex gap-3 items-start">
                  <span className="w-6 h-6 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-sm shrink-0 mt-0.5">✓</span>
                  <span className="text-lg">On the page, write a review.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="w-6 h-6 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-sm shrink-0 mt-0.5">✓</span>
                  <span className="text-lg">When you're finished, submit your review.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="w-6 h-6 bg-[#5A2EA6] text-white flex items-center justify-center rounded-full text-sm shrink-0 mt-0.5">✓</span>
                  <span className="text-lg">Mention things like their behavior and conversation.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* <Footer /> */}
      </div>
    </>
  );
};

export default CompleteProject;