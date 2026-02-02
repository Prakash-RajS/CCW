import React from "react";
// Ensure you have these paths correct in your project
import googlepay from "../../assets/Financials/googlepay.png";
import phonepay from "../../assets/Financials/phonepay.png";
import paytm from "../../assets/Financials/paytm.png";
import successIcon from "../../assets/Financials/successIcon.png";

export default function WithdrawFunds() {
  const [selectedWithdrawMethod, setSelectedWithdrawMethod] = React.useState("bank");
  const walletBalance = 100.0;

  // Modal States
  const [showWithdrawPopup, setShowWithdrawPopup] = React.useState(false);
  const [showBankDetailsPopup, setShowBankDetailsPopup] = React.useState(false);
  const [showUPIPopup, setShowUPIPopup] = React.useState(false); // New
  const [showAmountPopup, setShowAmountPopup] = React.useState(false); // New
  const [showSuccessPopup, setShowSuccessPopup] = React.useState(false);

  // Form States for UPI flow
  const [upiId, setUpiId] = React.useState('');
  const [amount, setAmount] = React.useState('');

  // Helper function for UPI handle selection
  const handleUpiSelection = (handle) => {
    let newUpiId = upiId;
    if (newUpiId.includes('@')) {
      newUpiId = newUpiId.split('@')[0];
    }
    setUpiId(newUpiId + handle);
  };

  return (
    <>
      {/* ================= MAIN CONTENT ================= */}
      <div className="font-['Montserrat'] w-full">
        
        {/* Responsive Text Size */}
        <h2 className="font-['Montserrat'] font-semibold text-[18px] md:text-[24px]">
          Withdraw Funds from Your Wallet
        </h2>

        <p className="mt-1 font-['Montserrat'] font-medium text-[12px] md:text-[16px] text-black">
          Transfer your wallet balance securely and track withdrawals in real time.
        </p>

        <div className="w-full h-[1px] bg-black/10 my-3 md:my-4"></div>

        {/* Balance Card */}
        <div className="w-full md:max-w-[880px] rounded-[10px] p-2 md:p-8 bg-gradient-to-r from-[#6A2E9B] to-[#8F4CD1] text-white">
          <p className="font-semibold text-[20px] md:text-[36px]">
            ${walletBalance.toFixed(2)}
          </p>

          <p className="mt-1 font-medium text-[16px] md:text-[24px]">
            View Transactions
          </p>

          {/* Withdraw Button */}
          <button
            onClick={() => setShowWithdrawPopup(true)}
            className="mt-1 md:mt-6 w-[100px] md:w-[180px] h-[30px] md:h-[50px] rounded-[6px] cursor-pointer
            bg-gradient-to-r from-[#51218F] to-black
            font-semibold text-[12px] md:text-[18px]"
          >
            Withdraw
          </button>
        </div>
      </div>

      {/* ================= POPUP MODAL (METHOD SELECTION) ================= */}
      {showWithdrawPopup && (
        <div className="absolute inset-0 z-50 bg-black/40 flex justify-center items-center px-4">
          
          <div className="relative w-full max-w-[350px] md:max-w-[792px] h-auto md:h-[621px] bg-white rounded-[10px] p-4 md:p-8">

            {/* Back Button */}
            <button
              onClick={() => setShowWithdrawPopup(false)}
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
                onClick={() => setSelectedWithdrawMethod("bank")}
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
                    selectedWithdrawMethod === "bank"
                      ? "bg-gradient-to-r from-[#51218F] to-black text-white"
                      : "border border-[#E1E6EF] bg-[#F8FAFC] text-black hover:bg-gradient-to-r hover:from-[#51218F] hover:to-black hover:text-white"
                  }
                `}
              >
                <svg className="w-[18px] h-[18px] md:w-[22px] md:h-[22px]" viewBox="0 0 24 24" fill="none">
                  <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
                  <path d="M5 10V20M12 10V20M19 10V20" stroke="currentColor" strokeWidth="2" />
                  <path d="M3 10L12 4L21 10" stroke="currentColor" strokeWidth="2" />
                </svg>

                <span className="whitespace-nowrap">Bank Transfer</span>
              </button>

              {/* UPI Transaction */}
              <button
                onClick={() => setSelectedWithdrawMethod("upi")}
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
                    selectedWithdrawMethod === "upi"
                      ? "bg-gradient-to-r from-[#51218F] to-black text-white"
                      : "border border-[#E1E6EF] bg-[#F8FAFC] text-black hover:bg-gradient-to-r hover:from-[#51218F] hover:to-black hover:text-white"
                  }
                `}
              >
                <div className="flex gap-1 md:gap-2 items-center">
                  <img src={googlepay} className="w-[18px] h-[20px] md:w-[22px] md:h-[24px] rounded-full object-cover" />
                  <img src={paytm} className="w-[18px] h-[20px] md:w-[22px] md:h-[24px] rounded-full object-cover" />
                  <img src={phonepay} className="w-[18px] h-[20px] md:w-[22px] md:h-[24px] rounded-full object-cover" />
                </div>

                <span className="whitespace-nowrap">UPI Transaction</span>
              </button>
            </div>

            {/* Footer Buttons */}
            <div className="mt-6 md:mt-10 flex justify-center gap-2 md:gap-4">
              <button
                onClick={() => setShowWithdrawPopup(false)}
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
                  if (selectedWithdrawMethod === 'bank') {
                    setShowWithdrawPopup(false);
                    setShowBankDetailsPopup(true);
                  } else if (selectedWithdrawMethod === 'upi') {
                    setShowWithdrawPopup(false);
                    setShowUPIPopup(true); // Navigate to UPI Popup
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
            <p className="mt-4 md:mt-6 font-['Inter'] text-[12px] md:text-[16px] text-[#667085] text-center md:text-left">
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
                setShowWithdrawPopup(true);
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
                  placeholder="1234 5678 1245"
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
                setShowWithdrawPopup(true); 
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
                  setShowAmountPopup(true); // Navigate to Amount Popup
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

      {/* ================= POPUP MODAL (AMOUNT DETAILS - NEW) ================= */}
      {showAmountPopup && (
        <div className="absolute inset-0 z-50 bg-black/40 flex justify-center items-center px-4">
          <div className="relative w-full max-w-[350px] md:max-w-[792px] h-auto bg-white rounded-[10px] p-4 md:p-8 font-['Inter'] shadow-2xl">
            
            {/* Back Button */}
            <button
              onClick={() => {
                setShowAmountPopup(false);
                setShowUPIPopup(true); // Go back to UPI popup
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
                if (selectedWithdrawMethod === 'bank') {
                  setShowBankDetailsPopup(true);
                } else {
                  setShowAmountPopup(true); // Go back to Amount popup for UPI
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
                 onClick={() => navigate("/home")}
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
    </>
  );
}