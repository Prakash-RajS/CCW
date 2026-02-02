import React from 'react';
import headerbg from "../../assets/Financials/headerbg.png";
import WalletOverview from "./WalletOverview";
import TransactionHistroy from "./TransactionHistroy";
import WithdrawFunds from "./WithdrawFunds";
import AddFunds from "./AddFunds";
import Footer from '../../component/Footer';
import Header from "../../component/Header";
import { useNavigate } from "react-router-dom";

export default function ChoosePayment() {

  const navigate = useNavigate();

  // ... (Icons code remains the same) ...
  const walletIcon = (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 7H21V17H3V7Z" stroke="currentColor" strokeWidth="2" />
      <path d="M16 12H18" stroke="currentColor" strokeWidth="2" />
    </svg>
  );

  const addFundsIcon = (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="7" rx="9" ry="3" stroke="currentColor" strokeWidth="2" />
      <path d="M3 7V17C3 19 7 21 12 21C17 21 21 19 21 17V7" stroke="currentColor" strokeWidth="2" />
    </svg>
  );

  const historyIcon = (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" />
    </svg>
  );

  const withdrawIcon = (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 3V15" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11L12 15L16 11" stroke="currentColor" strokeWidth="2" />
      <rect x="4" y="17" width="16" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
  // ... (End of Icons) ...

  const [activeMenu, setActiveMenu] = React.useState("addFunds");
  
  // CHANGE 1: New state to control if the Card Popup should open immediately
  const [openCardPopup, setOpenCardPopup] = React.useState(false);

  const menuItems = [
    { key: "addFunds", label: "Add Funds", icon: addFundsIcon },
    { key: "wallet", label: "Wallet Overview", icon: walletIcon },
    { key: "history", label: "Transaction Histroy", icon: historyIcon }, 
    { key: "withdraw", label: "Withdraw Funds", icon: withdrawIcon },
  ];

  const walletAmount = 75.0;
  
  // Helper to handle switching menu without auto-opening popup
  const handleMenuChange = (key) => {
    setOpenCardPopup(false); 
    setActiveMenu(key);
  };

  return (
    <section className="relative w-full min-h-screen bg-white overflow-x-hidden">
      {/* ... (Header and Background code remains same) ... */}
      <div className="absolute top-0 left-0 w-full z-50">
        <Header />
      </div>

      <div className="w-full h-[300px] md:h-[478px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)]">
        <img
          src={headerbg}
          alt="payment background"
          className="w-full h-full object-cover"
        />
      </div>

      <div 
        onClick={() => navigate("/home")}
        className="absolute top-[100px] left-6 z-40 md:hidden cursor-pointer"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </div>


      {/* ---------------- Content Card ---------------- */}
      <div
        className="
            relative
            mx-4 
            w-auto
            md:mx-auto
            md:w-full
            md:max-w-[1212px]
            -mt-[150px] md:-mt-[239px]
            min-h-[607px]
            bg-transparent
            shadow-none
            md:bg-white
            md:shadow-[0px_4px_4px_rgba(0,0,0,0.25)]
            md:rounded-[10px]
            overflow-visible
        "
      >

        {/* ---------------- PAYMENT LAYOUT ---------------- */}
        <div className="flex flex-col md:flex-row h-full relative">

          {/* ---------- SIDEBAR ---------------- */}
          <aside className="w-full md:max-w-[417px] flex flex-col relative bg-[#3D1367] md:bg-transparent">
            {/* ... (Back button code remains same) ... */}
            <div className="hidden md:flex items-center gap-3 px-6 py-6 border-b border-black/10 font-['Montserrat'] font-normal text-[24px] cursor-pointer">
              <div onClick={() => navigate("/home")}
                className="w-[40px] h-[40px] rounded-full bg-[#51218F] border border-[#E1E6EF] flex items-center justify-center hover:bg-gradient-to-r hover:from-[#51218F] hover:to-black transition-all"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M20 12H4M4 12L10 6M4 12L10 18" stroke="white" strokeWidth="3" />
                </svg>
              </div>
              <span>Back</span>
            </div>

            <div className="relative mt-[24px] hidden md:block">
              <div className="w-full h-[1px] bg-black/10"></div>
            </div>

            <div className="flex flex-row md:flex-col justify-between md:justify-start md:mt-[20px] md:gap-4 px-2 py-0 md:p-0">
              {menuItems.map((item) => {
                const isActive = activeMenu === item.key;
                return (
                  <div
                    key={item.key}
                    // CHANGE 2: Use handleMenuChange to ensure popup flag is reset
                    onClick={() => handleMenuChange(item.key)}
                    className={`
                        cursor-pointer font-['Montserrat'] transition-all
                        flex-1 flex justify-center items-center py-4 text-[13px] leading-tight text-center whitespace-normal
                        ${isActive ? 'text-white !border-b-4 !border-white md:border-0' : 'text-white hover:bg-gradient-to-r hover:from-[#51218F] hover:to-black hover:text-white md:text-black md:hover:bg-gradient-to-r md:hover:from-[#51218F] md:hover:text-white'}
                        md:flex md:items-center md:justify-start md:gap-4 md:px-6 md:py-4 md:text-[24px] md:font-normal md:whitespace-nowrap md:leading-normal md:text-left
                        ${isActive ? "md:bg-gradient-to-r md:from-[#51218F] md:to-black md:text-white" : ""}
                    `}
                  >
                    <span className={`hidden md:block ${isActive ? "text-white" : "text-black"}`}>{item.icon}</span>
                    <span className="w-16 md:w-auto block">{item.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="hidden md:block absolute right-0 top-0 h-full w-[1px] bg-black/10"></div>
          </aside>


          {/* ---------- RIGHT CONTENT ---------- */}
          <div className="flex-1 font-['Montserrat'] bg-white mt-6 p-4 shadow-[0px_4px_4px_rgba(0,0,0,0.25)] rounded-[10px] md:bg-transparent md:mt-0 md:shadow-none md:rounded-none md:py-8 md:px-4">

            {activeMenu === "walletPayment" && (
              <div className="animate-fadeIn flex flex-col gap-6">

                {/* ... (Heading and Subtitle remain same) ... */}
                <div className="w-full">
                  <h2 className="font-semibold text-[16px] md:text-[24px]">
                    Choose Your Preferred Payment Method
                  </h2>

                  <p className="mt-1 font-medium text-[12px] md:text-[16px] text-black">
                    Select wallet for free-free transactions or card for secure payments.
                  </p>

                  <div className="w-full h-[1px] bg-black/10 my-4"></div>

                  <h3 className="mt-2 font-semibold text-[20px] md:text-[24px]">
                    Select Your Preferred Payment Method
                  </h3>

                  <div className="mt-4 flex gap-3 md:gap-6">
                    {/* CHANGE 3: The Card Payment Button Logic */}
                    <button
                      onClick={() => {
                        setOpenCardPopup(true); // Trigger the popup
                        setActiveMenu("addFunds"); // Switch view
                      }}
                      className="w-[140px]
                        cursor-pointer
                        flex-none md:flex-none
                        md:w-[360px]
                        h-[38px] md:h-[80px]
                        rounded-[10px]
                        flex
                        items-center
                        justify-start
                        gap-2 md:gap-4
                        px-4 md:px-8
                        font-semibold
                        text-[10px] md:text-[22px]
                        text-black
                        !border
                        !border-black
                        transition-all
                        hover:bg-gradient-to-r
                        hover:from-[#51218F]
                        hover:to-black
                        hover:text-white
                        hover:border-transparent
                        group
                      "
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="md:w-[28px] md:h-[28px]">
                        <circle cx="12" cy="12" r="10" stroke="black" strokeWidth="2" />
                      </svg>
                      
                      Card Payment
                    </button>

                    {/* ... (Wallet Payment Button remains same) ... */}
                    <button
                      className="w-[140px]
                        cursor-pointer
                        flex-none md:flex-none
                        md:w-[290px]
                        h-[38px] md:h-[80px]
                        rounded-[10px]
                        flex
                        items-center
                        justify-start
                        gap-2 md:gap-4
                        px-4 md:px-8
                        font-semibold
                        text-[10px] md:text-[22px]
                        text-white
                        bg-gradient-to-r
                        from-[#51218F]
                        to-black
                        transition-all
                      "
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="md:w-[28px] md:h-[28px]">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="group-hover:stroke-white" />
                        <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" className="group-hover:stroke-white" />
                      </svg>
                      Wallet Payment
                    </button>
                  </div>
                </div>
                
                {/* CHANGE 4: Update "+ Add funds" to reset popup flag */}
                <p
                 
                  className="font-bold text-[20px] md:text-[24px] text-black mt-4"
                >
                  + Add funds
                </p>

                {/* ... (Balance Card remains same) ... */}
                <div className="mt-2">
                  <div className="w-[160px] md:w-[220px] h-[85px] rounded-[10px] bg-[#7F3FBF] flex flex-col justify-center items-start px-4 text-white">
                    <p className="font-bold text-[22px] leading-tight">
                      ${walletAmount.toFixed(2)}
                    </p>
                    <p className="font-medium text-[12px] mt-0">
                      Available Balance
                    </p>
                  </div>
                </div>

              </div>
            )}

            {activeMenu === "wallet" && <WalletOverview />}

            {/* CHANGE 5: Pass the openCardPopup state to AddFunds */}
            {activeMenu === "addFunds" && (
              <AddFunds
                onWalletSelect={() => setActiveMenu("walletPayment")}
                openCardPopup={openCardPopup} 
              />
            )}

            {activeMenu === "history" && <TransactionHistroy />}

            {activeMenu === "withdraw" && <WithdrawFunds />}

          </div>

        </div>
      </div>

      <div className="mt-[100px] md:mt-[150px]"> <Footer /></div>

    </section>
  );
}