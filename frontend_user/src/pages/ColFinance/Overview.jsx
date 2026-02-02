import React, { useState } from 'react';
import ColHeader from "../../component/ColHeader";
import Footer from "../../component/Footer";
import HomeBg from "../../assets/AfterSign/HomeBg.png";
import Bank from "../../assets/AfterSign/Bank.png";
import Ppay from "../../assets/AfterSign/Ppay.png";
import Paytm from "../../assets/AfterSign/Paytm.png";
import Gpay from "../../assets/AfterSign/Gpay.png";
import Default from "../../assets/AfterSign/Default.png";
import successIcon from "../../assets/Financials/successIcon.png";
import { useNavigate } from "react-router-dom";

const Overview = () => {
  const [activeTab, setActiveTab] = useState('work-in-progress');
  
  // Modal States matching Overview logic
  const [showPopup, setShowPopup] = useState(false); // Method Selection
  const [showBankDetailsPopup, setShowBankDetailsPopup] = useState(false);
  const [showUPIPopup, setShowUPIPopup] = useState(false);
  const [showAmountPopup, setShowAmountPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); 
  
  const [selectedPayment, setSelectedPayment] = useState('bank');
  
  // Form States
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');

  const navigate = useNavigate();

  const handleUpiSelection = (handle) => {
    let newUpiId = upiId;
    if (newUpiId.includes('@')) {
      newUpiId = newUpiId.split('@')[0];
    }
    setUpiId(newUpiId + handle);
  };

  // Helper to render the text content for tabs
  const renderTabContent = (label, price) => (
    <>
      <div className="h-[16px] opacity-100">
        <p className="font-outfit font-normal text-[12px] md:text-[14px] leading-[100%] whitespace-nowrap">
          {label}
        </p>
      </div>
      <div className="h-[16px] opacity-100 mt-1">
        <p className="font-outfit font-normal text-[12px] md:text-[14px] leading-[100%] whitespace-nowrap">
          {price}
        </p>
      </div>
    </>
  );

  return (
    <div className="w-full min-h-screen flex flex-col overflow-x-hidden relative">
      <section className="w-full flex flex-col items-center justify-start px-4 relative min-w-0 pb-20">
        {/* Background Image Container */}
        <div
          className="absolute top-[-104px] left-0 w-full h-[582px] z-0"
          style={{
            backgroundImage: `url(${HomeBg})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="absolute inset-0 bg-white opacity-50" />
        </div>
        
        <ColHeader />

        {/* Back Button (Added) */}
        <div className="absolute top-[100px] left-4 md:top-[140px] md:left-1/2 md:transform md:-translate-x-1/2 md:w-[1215px] z-20">
             <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity"
             >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 12H5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 19L5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="hidden md:block font-outfit text-[18px]">Back</span>
             </button>
        </div>

        {/* Main Content Container */}
        <div
          className="relative w-full md:w-[1215px] mt-[120px] md:mt-[197px] mx-auto opacity-100 
                     bg-white md:shadow-[0px_4px_4px_0px_#00000040] 
                     min-h-0 md:min-h-[589px] rounded-[16px] md:rounded-none pb-10 md:pb-0"
        >
          
          {/* Header Section */}
          <div className="relative md:absolute md:top-[21px] md:left-[37px] mt-2 px-4 md:px-0 mb-3 md:mb-0">
            <h1 className="font-outfit font-normal text-[28px] md:text-[40px] leading-[100%] text-black">
              Overview
            </h1>
            
            {activeTab === 'available' && (
              <p className="font-outfit font-normal text-[16px] leading-[130%] text-black mt-3">
                Transfer your wallet balance securely and track withdrawals in real time..
              </p>
            )}
          </div>

          {/* ================= MOBILE TABS ================= */}
          <div className="block md:hidden px-4 mb-6">
            <div className="w-full h-[60px] rounded-[12px] bg-[#D9D9D980] !border-2 !border-black flex items-center p-1 relative z-10">
              <button
                onClick={() => setActiveTab('work-in-progress')}
                className={`flex-1 h-full rounded-[12px] flex flex-col items-center justify-center transition-all duration-200
                  ${activeTab === 'work-in-progress' 
                    ? 'bg-white !border-2 !border-black shadow-md z-20' 
                    : 'bg-transparent !border-2 !border-transparent text-black/70'}`}
              >
                {renderTabContent('Work in Progress', '$0.00')}
              </button>

              <button
                onClick={() => setActiveTab('in-review')}
                className={`flex-1 h-full rounded-[12px] flex flex-col items-center justify-center transition-all duration-200
                  ${activeTab === 'in-review' 
                    ? 'bg-white !border-2 !border-black shadow-md z-20' 
                    : 'bg-transparent !border-2 !border-transparent text-black/70'}`}
              >
                {renderTabContent('In review', '$0.00')}
              </button>

              <button
                onClick={() => setActiveTab('available')}
                className={`flex-1 h-full rounded-[12px] flex flex-col items-center justify-center transition-all duration-200
                  ${activeTab === 'available' 
                    ? 'bg-white !border-2 !border-black shadow-md z-20' 
                    : 'bg-transparent !border-2 !border-transparent text-black/70'}`}
              >
                {renderTabContent('Available', '$0.00')}
              </button>
            </div>
          </div>

          {/* ================= DESKTOP TABS ================= */}
          <div
            className="hidden md:block absolute top-[116px] left-[27px] w-[1134px] h-[101px] 
                       rounded-[16px] bg-[#D9D9D980] !border-2 !border-[#000000]"
          >
            <button
              onClick={() => setActiveTab('work-in-progress')}
              className={`absolute w-[151px] h-[77px] left-[14px] top-1/2 transform -translate-y-1/2
                          rounded-[16px] flex flex-col items-center justify-center transition-all duration-200 cursor-pointer
                          ${activeTab === 'work-in-progress' 
                            ? 'bg-white shadow-md text-black !border-2 !border-black' 
                            : 'bg-transparent text-black !border-2 !border-transparent hover:bg-white/40'}`}
            >
              {renderTabContent('Work in Progress', '$0.00')}
            </button>

            <button
              onClick={() => setActiveTab('in-review')}
              className={`absolute w-[151px] h-[77px] left-[180px] top-1/2 transform -translate-y-1/2
                          rounded-[16px] flex flex-col items-center justify-center transition-all duration-200 cursor-pointer
                          ${activeTab === 'in-review' 
                            ? 'bg-white shadow-md text-black !border-2 !border-black' 
                            : 'bg-transparent text-black !border-2 !border-transparent hover:bg-white/40'}`}
            >
               {renderTabContent('In review', '$0.00')}
            </button>

            <button
              onClick={() => setActiveTab('available')}
              className={`absolute w-[151px] h-[77px] left-[346px] top-1/2 transform -translate-y-1/2
                          rounded-[16px] flex flex-col items-center justify-center transition-all duration-200 cursor-pointer
                          ${activeTab === 'available' 
                            ? 'bg-white shadow-md text-black !border-2 !border-black' 
                            : 'bg-transparent text-black !border-2 !border-transparent hover:bg-white/40'}`}
            >
               {renderTabContent('Available', '$0.00')}
            </button>
          </div>

          {/* ================= CONTENT DISPLAY AREA ================= */}
          {activeTab === 'available' ? (
            <div
              className="relative md:absolute w-[calc(100%-32px)] md:w-[1134px] h-auto md:h-[267px] 
                         mt-0 md:top-[262px] md:left-[27px] 
                         rounded-[16px] p-6 gap-7 mx-4 md:mx-0
                         flex-shrink-0"
              style={{
                
                background: 'linear-gradient(90deg, rgba(48, 1, 87, 0.75) 0%, rgba(104, 2, 189, 0.75) 100%)',
              }}
            >
              <div className="md:w-[1134px] hidden md:block"></div>
              
              <div className="relative md:absolute w-auto md:w-[220px] md:top-[24px] md:left-[16px] opacity-100 flex flex-col">
                <div className="h-[36px] opacity-100">
                  <p className="font-montserrat font-semibold text-[20px] md:text-[36px] leading-[100%] text-white whitespace-nowrap">
                    $00.00
                  </p>
                </div>
                <div className="h-[24px] opacity-100 md:mt-[22px] md:mb-[10px]">
                  <p className="font-montserrat font-medium text-[16px] md:text-[20px] leading-[100%] text-white whitespace-nowrap">
                    View Transactions
                  </p>
                </div>
                <button
                  onClick={() => setShowPopup(true)}
                  className="mt-1 md:mt-6 w-[100px] md:w-[180px] h-[40px] md:h-[50px] rounded-[6px] cursor-pointer
                  bg-gradient-to-r from-[#51218F] to-black
                  font-semibold text-[12px] md:text-[18px]"
                >
                  <span className="font-montserrat font-medium text-[14px] md:text-[20px] leading-[100%] text-white 
                                   group-hover:tracking-wide transition-all duration-300">
                    Withdraw
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center relative md:absolute mt-10 md:mt-0 md:top-[243px]">
              <div className="w-[200px] md:w-[295px] h-auto md:h-[261px] opacity-100 mb-8">
                <img 
                  src={Default} 
                  alt="No work in progress" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="w-auto md:w-[175px] h-[36px] opacity-100">
                <p className="font-outfit font-normal text-center text-[16px] leading-[100%] text-[#000000] whitespace-nowrap">
                  There is no Work in progress
                </p>
              </div>
            </div>
          )}
        </div>

      {/* ================= POPUP MODAL (METHOD SELECTION) ================= */}
      {showPopup && (
        <div className="absolute inset-0 z-50 bg-black/40 flex justify-center items-center px-4">
          
          <div className="relative w-full max-w-[350px] md:max-w-[792px] h-auto md:h-[621px] bg-white rounded-[10px] p-4 md:p-8">

            {/* Back Button */}
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-[10px] left-[12px] md:top-[14px] md:left-[24px]
              w-[30px] h-[30px] md:w-[40px] md:h-[40px] rounded-full
              bg-[#51218F]
              border border-[#E1E6EF]
              flex items-center justify-center
              hover:bg-gradient-to-r hover:from-[#51218F] hover:to-black
              transition-all"
            >
              <svg className="w-4 h-4 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none">
                <path d="M20 12H4M4 12L10 6M4 12L10 18" stroke="white" strokeWidth="2" />
              </svg>
            </button>

            {/* Heading */}
            <h1
              className="pl-[36px] md:pl-[52px] text-[30px] md:text-[50px] mt-2 md:mt-4 font-bold leading-none"
              style={{
                fontFamily: "Trochut",
                background: "linear-gradient(270deg, #51218F 0%, #030303 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Talenta
            </h1>

            {/* Subtitle */}
            <p className="pl-[36px] md:pl-[52px] mt-2 md:mt-4 font-['Inter'] font-medium text-[12px] md:text-[16px] text-[#667085]">
              Payment Details
            </p>

            {/* Payment Options */}
            <div className="mt-4 md:mt-2 flex gap-2 md:gap-4 justify-center">

              {/* Bank Transfer */}
              <button
                onClick={() => setSelectedPayment("bank")}
                className={`
                  flex-1 md:flex-none
                  md:w-[300px]
                  h-[70px] md:h-[88px]
                  rounded-[10px]
                  font-['Inter']
                  font-medium
                  text-[12px] md:text-[16px]
                  flex
                  flex-col
                  items-start
                  justify-start
                  px-3 pt-3 md:px-6 md:pt-4
                  gap-1 md:gap-2
                  cursor-pointer
                  transition-all
                  ${
                    selectedPayment === "bank"
                      ? "bg-gradient-to-r from-[#51218F] to-black text-white"
                      : "border border-[#E1E6EF] bg-[#F8FAFC] text-black hover:bg-gradient-to-r hover:from-[#51218F] hover:to-black hover:text-white"
                  }
                `}
              >
                <img 
                  src={Bank} 
                  alt="Bank" 
                  className={`w-[18px] h-[18px] md:w-[22px] md:h-[22px] ${selectedPayment === 'bank' ? 'brightness-0 invert' : ''}`} 
                />

                <span className="whitespace-nowrap">Bank Transfer</span>
              </button>

            {/* UPI Transaction */}
              <button
                onClick={() => setSelectedPayment("upi")}
                className={`
                  flex-1 md:flex-none
                  md:w-[300px]
                  h-[70px] md:h-[88px]
                  rounded-[10px]
                  font-['Inter']
                  font-medium
                  text-[12px] md:text-[16px]
                  flex
                  flex-col
                  items-start
                  justify-start
                  px-3 pt-3 md:px-6 md:pt-4
                  gap-1 md:gap-2
                  cursor-pointer
                  transition-all
                  ${
                    selectedPayment === "upi"
                      ? "bg-gradient-to-r from-[#51218F] to-black text-white"
                      : "border border-[#E1E6EF] bg-[#F8FAFC] text-black hover:bg-gradient-to-r hover:from-[#51218F] hover:to-black hover:text-white"
                  }
                `}
              >
                <div className="flex gap-1 md:gap-2 items-center">
                  {/* REMOVED the conditional 'brightness-0 invert' classes so images stay colored */}
                  <img 
                    src={Ppay} 
                    alt="PhonePe"
                    className="w-[18px] h-[18px] md:w-[22px] md:h-[22px] rounded-full object-cover" 
                  />
                  <img 
                    src={Paytm} 
                    alt="Paytm"
                    className="w-[18px] h-[18px] md:w-[22px] md:h-[22px] rounded-full object-cover" 
                  />
                  <img 
                    src={Gpay} 
                    alt="GPay"
                    className="w-[18px] h-[18px] md:w-[22px] md:h-[22px] rounded-full object-cover" 
                  />
                </div>

                <span className="whitespace-nowrap">UPI Transaction</span>
              </button>
            </div>

            {/* Footer Buttons */}
            <div className="mt-6 md:mt-10 flex justify-center gap-2 md:gap-4">
              <button
                onClick={() => setShowPopup(false)}
                className="
                  w-[100px] md:w-[220px]
                  h-[40px] md:h-[48px]
                  rounded-[10px]
                  border border-[#E1E6EF]
                  bg-[#F8FAFC]
                  font-['Inter']
                  font-medium
                  text-[12px] md:text-[16px]
                  cursor-pointer
                  transition-all
                  hover:bg-gradient-to-r
                  hover:from-[#51218F]
                  hover:to-black
                  hover:text-white
                "
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  if (selectedPayment === 'bank') {
                    setShowPopup(false);
                    setShowBankDetailsPopup(true);
                  } else if (selectedPayment === 'upi') {
                    setShowPopup(false);
                    setShowUPIPopup(true);
                  }
                }}
                className="
                  flex-1 md:flex-none
                  md:w-[320px]
                  h-[40px] md:h-[48px]
                  rounded-[10px]
                  bg-gradient-to-r from-[#51218F] to-black
                  font-['Inter']
                  font-medium
                  text-[12px] md:text-[16px]
                  text-white
                  cursor-pointer
                  transition-all
                  hover:opacity-90
                  whitespace-nowrap
                "
              >
                Continue to payment
              </button>
            </div>

            {/* Disclaimer */}
            <p className="mt-4 md:mt-6 font-['Inter'] text-[10px] md:text-[16px] text-[#667085] text-center md:text-left">
              By providing your card information, you allow us to charge your card
              for future payment in accordance with their terms.
            </p>

          </div>
        </div>
      )}

      {/* ================= POPUP MODAL (BANK DETAILS) ================= */}
      {showBankDetailsPopup && (
        <div className="absolute inset-0 z-50 bg-black/40 flex justify-center items-center px-4">

          <div className="relative w-full max-w-[350px] md:max-w-[792px] h-auto md:h-[749px] bg-white rounded-[10px] p-4 md:p-8 font-['Inter']">

            {/* Back Button */}
            <button
              onClick={() => {
                setShowBankDetailsPopup(false);
                setShowPopup(true);
              }}
              className="absolute top-[10px] left-[12px] md:top-[14px] md:left-[24px] cursor-pointer
              w-[30px] h-[30px] md:w-[40px] md:h-[40px] rounded-full
              bg-[#51218F]
              border border-[#E1E6EF]
              flex items-center justify-center
              hover:bg-gradient-to-r hover:from-[#51218F] hover:to-black
              transition-all"
            >
              <svg className="w-4 h-4 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none">
                <path d="M20 12H4M4 12L10 6M4 12L10 18" stroke="white" strokeWidth="2" />
              </svg>
            </button>

            {/* Heading */}
            <h1
              className="text-[30px] md:text-[50px] mt-6 md:mt-8 font-bold leading-none px-[15px] md:px-[30px]"
              style={{
                fontFamily: "Trochut",
                background: "linear-gradient(270deg, #51218F 0%, #030303 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Talenta
            </h1>

            {/* Form */}
            <div className="mt-1 flex flex-col gap-2 md:gap-4 px-[15px] md:px-[30px] py-[10px] md:py-[20px]">

              {/* Name */}
              <div>
                <label className="text-[#667085] text-[12px] md:text-[16px] font-medium">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Jane Smith"
                  className="mt-1 md:mt-2 w-full h-[40px] md:h-[56px] rounded-[8px] md:rounded-[12px]
                  !border !border-[#E1E6EF] px-3 md:px-4 text-[12px] md:text-[16px]"
                />
              </div>

              {/* Bank Account */}
              <div>
                <label className="text-[#667085] text-[12px] md:text-[16px] font-medium">
                  Bank account number
                </label>
                <input
                  type="number"
                  placeholder="1234 5678 1245"
                  className="mt-1 md:mt-2 w-full h-[40px] md:h-[56px] rounded-[8px] md:rounded-[12px]
                  !border !border-[#E1E6EF] px-3 md:px-4 text-[12px] md:text-[16px] outline-none no-spinner"
                />
              </div>

              {/* IFSC */}
              <div>
                <label className="text-[#667085] text-[12px] md:text-[16px] font-medium">
                  IFSC code
                </label>
                <input
                  type="text"
                  placeholder="SBIN0001234"
                  className="mt-1 md:mt-2 w-full h-[40px] md:h-[56px] rounded-[8px] md:rounded-[12px]
                  !border !border-[#E1E6EF] px-3 md:px-4 text-[12px] md:text-[16px]"
                />
              </div>

                 {/* Enter Amount */}
                <div>
                  <label className="text-[#667085] text-[12px] md:text-[16px] font-medium">
                    Enter Amount
                  </label>
                  <input
                    type="text"
                    placeholder="$ 100.1"
                     className="mt-1 md:mt-2 w-full h-[40px] md:h-[56px] rounded-[8px] md:rounded-[12px]
                  !border !border-[#E1E6EF] px-3 md:px-4 text-[12px] md:text-[16px]"
                  />
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-2 px-[15px] md:px-[30px] py-[10px] md:py-[20px]">
              <button
                onClick={() => setShowBankDetailsPopup(false)}
                className="
                  w-[100px] md:w-[220px]
                  h-[40px] md:h-[56px]
                  rounded-[8px] md:rounded-[12px]
                  bg-[#F3F4F6]
                  text-[12px] md:text-[16px]
                  font-['Inter']
                  cursor-pointer
                  transition-all
                  hover:bg-gradient-to-r
                  hover:from-[#51218F]
                  hover:to-black
                  hover:text-white
                "
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowBankDetailsPopup(false);
                  setShowSuccessPopup(true);
                }}
                className="
                  flex-1
                  h-[40px] md:h-[56px]
                  rounded-[8px] md:rounded-[12px]
                  bg-gradient-to-r from-[#51218F] to-black
                  text-white
                  text-[12px] md:text-[16px]
                  cursor-pointer
                  transition-all
                  hover:opacity-90
                "
              >
                Continue to payment
              </button>
            </div>

            {/* Disclaimer */}
            <p className="mt-1 md:mt-2 text-[#667085] text-[12px] md:text-[16px] leading-[150%] font-regular px-[15px] md:px-[30px]">
              By providing your card information, you allow us to charge your card for
              future payment in accordance with their terms.
            </p>

          </div>
        </div>
      )}

      {/* ================= POPUP MODAL (UPI DETAILS) ================= */}
      {showUPIPopup && (
        <div className="absolute inset-0 z-50 bg-black/40 flex justify-center items-center px-4">
          <div className="relative w-full max-w-[350px] md:max-w-[792px] h-auto bg-white rounded-[10px] p-4 md:p-8 font-['Inter'] shadow-2xl">
            
            {/* Back Button */}
            <button
              onClick={() => {
                setShowUPIPopup(false);
                setShowPopup(true); 
              }}
              className="absolute top-[10px] left-[12px] md:top-[14px] md:left-[24px] cursor-pointer
              w-[30px] h-[30px] md:w-[40px] md:h-[40px] rounded-full
              bg-[#51218F]
              border border-[#E1E6EF]
              flex items-center justify-center
              hover:bg-gradient-to-r hover:from-[#51218F] hover:to-black
              transition-all"
            >
              <svg className="w-4 h-4 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none">
                <path d="M20 12H4M4 12L10 6M4 12L10 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Heading */}
            <h1
              className="text-[30px] md:text-[50px] mt-6 md:mt-8 font-bold leading-none px-[15px] md:px-[30px]"
              style={{
                fontFamily: "Trochut",
                background: "linear-gradient(270deg, #51218F 0%, #030303 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Talenta
            </h1>

            {/* Form */}
            <div className="mt-4 md:mt-6 flex flex-col gap-4 px-[15px] md:px-[30px] py-[10px] md:py-[20px]">
              {/* Enter UPI Number */}
              <div>
                <label className="text-[#667085] text-[12px] md:text-[16px] font-medium">
                  Enter UPI Number
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="123412@Sbi"
                  className="mt-2 w-full h-[40px] md:h-[56px] rounded-[8px] md:rounded-[12px]
                             !border !border-[#E1E6EF] px-3 md:px-4 text-[12px] md:text-[16px] focus:outline-none focus:border-[#51218F]"
                />
              </div>
              
              {/* UPI Handles */}
              <div className="flex flex-wrap gap-2 md:gap-3 mt-2">
                {['@sbi', '@Hdfc', '@Tmb', '@Ptys'].map((handle) => (
                  <button
                    key={handle}
                    onClick={() => handleUpiSelection(handle)}
                    className={`px-3 md:px-4 py-1 md:py-2 rounded-full text-[12px] md:text-[14px] font-medium transition-all
                      ${upiId.endsWith(handle) 
                        ? 'bg-[#51218F] text-white' 
                        : 'bg-[#E1E6EF] text-black hover:bg-[#d1d6df]'}`}
                  >
                    {handle}
                  </button>
                ))}
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="flex gap-2 px-[15px] md:px-[30px] py-[10px] md:py-[20px] mt-2 md:mt-4">
              <button
                onClick={() => setShowUPIPopup(false)}
                className="
                  w-[100px] md:w-[220px]
                  h-[40px] md:h-[56px]
                  rounded-[8px] md:rounded-[12px]
                  bg-[#F3F4F6]
                  text-[12px] md:text-[16px]
                  font-['Inter']
                  cursor-pointer
                  transition-all
                  hover:bg-gradient-to-r
                  hover:from-[#51218F]
                  hover:to-black
                  hover:text-white
                "
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowUPIPopup(false);
                  setShowAmountPopup(true);
                }}
                className="
                  flex-1
                  h-[40px] md:h-[56px]
                  rounded-[8px] md:rounded-[12px]
                  bg-gradient-to-r from-[#51218F] to-black
                  text-white
                  text-[12px] md:text-[16px]
                  cursor-pointer
                  transition-all
                  hover:opacity-90
                "
              >
                Continue to payment
              </button>
            </div>

            {/* Disclaimer */}
            <p className="mt-2 text-[#667085] text-[12px] md:text-[16px] leading-[150%] font-regular px-[15px] md:px-[30px] pb-4 md:pb-8">
              By providing your card information, you allow us to charge your card for
              future payment in accordance with their terms.
            </p>
          </div>
        </div>
      )}

      {/* ================= POPUP MODAL (AMOUNT DETAILS) ================= */}
      {showAmountPopup && (
        <div className="absolute inset-0 z-50 bg-black/40 flex justify-center items-center px-4">
          <div className="relative w-full max-w-[350px] md:max-w-[792px] h-auto bg-white rounded-[10px] p-4 md:p-8 font-['Inter'] shadow-2xl">
            
            {/* Back Button */}
            <button
              onClick={() => {
                setShowAmountPopup(false);
                setShowUPIPopup(true);
              }}
              className="absolute top-[10px] left-[12px] md:top-[14px] md:left-[24px] cursor-pointer
              w-[30px] h-[30px] md:w-[40px] md:h-[40px] rounded-full
              bg-[#51218F]
              border border-[#E1E6EF]
              flex items-center justify-center
              hover:bg-gradient-to-r hover:from-[#51218F] hover:to-black
              transition-all"
            >
              <svg className="w-4 h-4 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none">
                <path d="M20 12H4M4 12L10 6M4 12L10 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Heading */}
            <h1
              className="text-[30px] md:text-[50px] mt-6 md:mt-8 font-bold leading-none px-[15px] md:px-[30px]"
              style={{
                fontFamily: "Trochut",
                background: "linear-gradient(270deg, #51218F 0%, #030303 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Talenta
            </h1>

            {/* Form */}
            <div className="mt-4 md:mt-6 flex flex-col gap-4 px-[15px] md:px-[30px] py-[10px] md:py-[20px]">
              {/* Enter Amount */}
              <div>
                <label className="text-[#667085] text-[12px] md:text-[16px] font-medium">
                  Enter Amount
                </label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="$ 10.2"
                  className="mt-2 w-full h-[40px] md:h-[56px] rounded-[8px] md:rounded-[12px]
                             !border !border-[#E1E6EF] px-3 md:px-4 text-[12px] md:text-[16px] focus:outline-none focus:border-[#51218F]"
                />
              </div>
              
              {/* Amount Chips */}
              <div className="flex flex-wrap gap-2 md:gap-3 mt-2">
                {['$ 10.2', '$ 50.1', '$100', '$200'].map((val) => (
                  <button
                    key={val}
                    onClick={() => setAmount(val)}
                    className={`px-3 md:px-4 py-1 md:py-2 rounded-full text-[12px] md:text-[14px] font-medium transition-all
                      ${amount === val
                        ? 'bg-[#51218F] text-white' 
                        : 'bg-[#E1E6EF] text-black hover:bg-[#d1d6df]'}`}
                  >
                    {val}
                  </button>
                ))}
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="flex gap-2 px-[15px] md:px-[30px] py-[10px] md:py-[20px] mt-2 md:mt-4">
              <button
                onClick={() => setShowAmountPopup(false)}
                className="
                  w-[100px] md:w-[220px]
                  h-[40px] md:h-[56px]
                  rounded-[8px] md:rounded-[12px]
                  bg-[#F3F4F6]
                  text-[12px] md:text-[16px]
                  font-['Inter']
                  cursor-pointer
                  transition-all
                  hover:bg-gradient-to-r
                  hover:from-[#51218F]
                  hover:to-black
                  hover:text-white
                "
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowAmountPopup(false);
                  setShowSuccessPopup(true);
                }}
                className="
                  flex-1
                  h-[40px] md:h-[56px]
                  rounded-[8px] md:rounded-[12px]
                  bg-gradient-to-r from-[#51218F] to-black
                  text-white
                  text-[12px] md:text-[16px]
                  cursor-pointer
                  transition-all
                  hover:opacity-90
                "
              >
                Continue to payment
              </button>
            </div>

            {/* Disclaimer */}
            <p className="mt-2 text-[#667085] text-[12px] md:text-[16px] leading-[150%] font-regular px-[15px] md:px-[30px] pb-4 md:pb-8">
              By providing your card information, you allow us to charge your card for
              future payment in accordance with their terms.
            </p>
          </div>
        </div>
      )}

      {/* ================= POPUP MODAL (SUCCESS) ================= */}
      {showSuccessPopup && (
        <div className="absolute inset-0 z-50 bg-black/40 flex justify-center items-center px-4">

          <div className="relative w-full max-w-[350px] md:max-w-[875px] h-auto md:h-[642px] bg-white rounded-[20px] md:rounded-[32px] px-5 py-6 md:px-10 md:py-12">

            {/* Back Button */}
            <button
              onClick={() => {
                setShowSuccessPopup(false);
                if (selectedPayment === 'bank') {
                  setShowBankDetailsPopup(true);
                } else {
                  setShowAmountPopup(true); 
                }
              }}
              className="
                absolute top-[12px] left-[12px] md:top-[24px] md:left-[24px]
                cursor-pointer
                w-[30px] h-[30px] md:w-[40px] md:h-[40px]
                rounded-full
                bg-[#51218F]
                border border-[#E1E6EF]
                flex items-center justify-center
                hover:bg-gradient-to-r hover:from-[#51218F] hover:to-black
                transition-all
              "
            >
              <svg className="w-4 h-4 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none">
                <path d="M20 12H4M4 12L10 6M4 12L10 18" stroke="white" strokeWidth="2" />
              </svg>
            </button>

            {/* Heading */}
            <h1
              className="text-[30px] md:text-[48px] font-bold text-center"
              style={{ fontFamily: "Trochut" }}
            >
              Talenta
            </h1>

            {/* Center Icon */}
            <div className="mt-6 md:mt-10 flex justify-center">
              <img
                src={successIcon}
                alt="Payment Success"
                className="w-[80px] h-[80px] md:w-[136px] md:h-[136px] object-contain"
              />
            </div>

            {/* Message */}
            <p
              className="mt-6 md:mt-10 text-center text-[16px] md:text-[38px] leading-tight md:leading-none"
              style={{
                fontFamily: "Milonga",
                background: "linear-gradient(270deg, #3D1768 22.62%, #030303 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Your Payment has successfully Processed.
              <br className="hidden md:block" />{" "}
              <span className="md:inline block">Now you can go to the homepage & discover new things.</span>
            </p>

            {/* CTA Button */}
            <div className="mt-8 md:mt-12 flex justify-center">
              <button
                onClick={() => navigate("/collabration")}
                className="w-full md:w-[754px] h-[40px] md:h-[56px] rounded-[40px]
                bg-gradient-to-r from-[#51218F] to-black
                text-white text-[14px] md:text-[18px] cursor-pointer"
              >
                Go To Homepage
              </button>
            </div>

          </div>
        </div>
      )}

      </section>
      
      <div className="w-full mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default Overview;