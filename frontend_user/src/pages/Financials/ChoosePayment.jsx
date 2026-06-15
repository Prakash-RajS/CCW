import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";

import headerbg from "../../assets/Financials/headerbg.png";
import WalletOverview from "./WalletOverview";
import TransactionHistory from "./TransactionHistroy";
import WithdrawFunds from "./WithdrawFunds";
import AddFunds from "./AddFunds";
import Footer from '../../component/Footer';
import Header from "../../component/Header";
import toast from "../../component/Toast";
import api from "../../utils/axiosConfig";

export default function ChoosePayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, loading } = useUser();
  const [searchParams] = useSearchParams();
  const [activeMenu, setActiveMenu] = useState("addFunds");
  const [isVerifying, setIsVerifying] = useState(false);
  
  const contentCardRef = useRef(null);

  // Icons
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

  const menuItems = [
    { key: "addFunds", label: "Add Funds", icon: addFundsIcon },
    { key: "wallet", label: "Wallet Overview", icon: walletIcon },
    { key: "history", label: "Transaction History", icon: historyIcon },
    { key: "withdraw", label: "Withdraw Funds", icon: withdrawIcon },
  ];

  useEffect(() => {
    const state = location.state;
    if (state?.openTransferModal && state?.contractId) {
      setActiveMenu("wallet");
    }
  }, [location.state]);

  useEffect(() => {
    const orderId = searchParams.get("order_id");

    const alreadyHandled = sessionStorage.getItem(
      `payment_handled_${orderId}`
    );

    if (orderId && !alreadyHandled) {
      sessionStorage.setItem(`payment_handled_${orderId}`, "true");

      setIsVerifying(true);

      const pendingAmount = sessionStorage.getItem("pendingWalletAmount");
      const pendingUserId = sessionStorage.getItem("pendingWalletUserId");

      api
        .post("/wallet/verify-payment", {
          order_id: orderId,
          user_id: Number(pendingUserId),
          amount: Number(pendingAmount) || 0,
        })
        .then(() => {
          toast.success("Payment Successful", "Wallet will be updated shortly.");
          sessionStorage.removeItem("pendingWalletAmount");
          sessionStorage.removeItem("pendingWalletUserId");
          window.history.replaceState({}, document.title, "/choose-payment");
          setActiveMenu("wallet");
        })
        .catch((err) => {
          const detail = err?.response?.data?.detail || "";

          const isCancelled =
            typeof detail === "string" &&
            (detail.toLowerCase().includes("active") ||
              detail.toLowerCase().includes("not completed") ||
              detail.toLowerCase().includes("pending") ||
              detail.toLowerCase().includes("cancelled"));

          toast.error(
            isCancelled ? "Payment Cancelled" : "Payment Failed",
            isCancelled
              ? "You cancelled the payment. No amount was deducted."
              : detail || "Payment was not completed. Please try again."
          );

          sessionStorage.removeItem("pendingWalletAmount");
          sessionStorage.removeItem("pendingWalletUserId");
          window.history.replaceState({}, document.title, "/choose-payment");
          setActiveMenu("addFunds");
        })
        .finally(() => {
          setIsVerifying(false);
        });
    }
  }, [searchParams]);

  const scrollToContentCard = () => {
    if (contentCardRef.current) {
      const cardPosition = contentCardRef.current.getBoundingClientRect().top;
      const currentScrollPosition = window.pageYOffset;
      const targetPosition = cardPosition + currentScrollPosition - 20;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    setTimeout(() => {
      scrollToContentCard();
    }, 100);
  }, [activeMenu]);

  useEffect(() => {
    setTimeout(() => {
      scrollToContentCard();
    }, 100);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#51218F] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="relative w-full min-h-screen bg-white overflow-x-hidden">
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

      <div className="absolute top-[95px] left-4 z-40 md:hidden">
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-1.5 text-white hover:text-white/80 transition-colors group"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-[#51218F] to-[#2a0e4a] group-hover:from-[#3d1768] group-hover:to-[#1a0830] transition-all shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 12H5M12 19l-7-7 7-7"
              />
            </svg>
          </div>
          <span className="font-medium text-sm text-white">Back</span>
        </button>
      </div>

      {isVerifying && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="w-12 h-12 border-4 border-[#51218F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Verifying your payment...</p>
            <p className="text-gray-500 text-sm mt-2">Please wait while we confirm your transaction</p>
          </div>
        </div>
      )}

      {/* Content Card - Fixed gaps on all sides */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-10">
        <div
          ref={contentCardRef}
          className="
            relative
            w-full
            md:mx-auto
            md:max-w-[1212px]
            -mt-[150px] md:-mt-[239px]
            min-h-fit
            md:min-h-[607px]
            bg-transparent
            shadow-none
            md:bg-white
            md:shadow-[0px_4px_4px_rgba(0,0,0,0.25)]
            md:rounded-[10px]
            overflow-visible
            mb-4 sm:mb-6 md:mb-8
          "
        >
          <div className="flex flex-col md:flex-row h-full relative">
  {/* Sidebar */}
  <aside className="w-full md:max-w-[280px] lg:max-w-[417px] flex flex-col relative bg-[#3D1367] md:bg-transparent md:rounded-l-[10px]">
    <div className="hidden md:flex items-center gap-2 lg:gap-3 px-3 lg:px-6 py-3 lg:py-6 border-b border-black/10 font-['Montserrat'] cursor-pointer">
      <button
        onClick={() => navigate("/home")}
        className="flex items-center gap-2 text-black hover:text-black/80 transition-colors group"
      >
        <div className="flex items-center justify-center w-6 h-6 lg:w-10 lg:h-10 rounded-full bg-gradient-to-r from-[#51218F] to-[#2a0e4a] group-hover:from-[#3d1768] group-hover:to-[#1a0830] transition-all">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 lg:h-5 lg:w-5 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 12H5M12 19l-7-7 7-7"
            />
          </svg>
        </div>
        <span className="font-medium text-xs lg:text-base">Back</span>
      </button>
    </div>

    <div className="relative mt-[16px] lg:mt-[24px] hidden md:block">
      <div className="w-full h-[1px] bg-black/10"></div>
    </div>

    <div className="flex flex-row md:flex-col justify-between md:justify-start md:mt-[10px] lg:mt-[20px] md:gap-1 lg:gap-4 px-1 md:px-0 py-0 md:p-0">
      {menuItems.map((item) => {
        const isActive = activeMenu === item.key;
        return (
          <div
            key={item.key}
            onClick={() => setActiveMenu(item.key)}
            className={`
              cursor-pointer font-['Montserrat'] transition-all
              flex-1 flex justify-center items-center py-2 md:py-2 lg:py-4 text-[10px] sm:text-[11px] md:text-[12px] lg:text-[24px] leading-tight text-center whitespace-normal
              ${
                isActive
                  ? "text-white !border-b-4 !border-white md:border-0"
                  : "text-white hover:bg-gradient-to-r hover:from-[#51218F] hover:to-black hover:text-white md:text-gray-700 md:hover:bg-gradient-to-r md:hover:from-[#51218F] md:hover:text-white"
              }
              md:flex md:items-center md:justify-start md:gap-2 lg:gap-4 md:px-2 lg:px-6 md:py-2 lg:py-4 md:text-[12px] lg:text-[24px] md:font-normal md:whitespace-nowrap md:leading-normal md:text-left
              ${
                isActive
                  ? "md:bg-gradient-to-r md:from-[#51218F] md:to-black md:text-white md:rounded-l-[10px]"
                  : ""
              }
            `}
          >
            <span className={`hidden md:inline-flex md:items-center md:justify-center ${isActive ? "text-white" : "text-gray-700"} w-4 h-4 lg:w-6 lg:h-6 flex-shrink-0`}>
              {React.cloneElement(item.icon, {
                width: 16,
                height: 16,
                className: `w-4 h-4 lg:w-6 lg:h-6 ${isActive ? "text-white" : "text-gray-700"}`
              })}
            </span>
            <span className="w-auto block text-center md:text-left text-[10px] sm:text-[11px] md:text-[12px] lg:text-[24px]">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
    <div className="hidden md:block absolute right-0 top-0 h-full w-[1px] bg-black/10"></div>
  </aside>

  {/* Right Content */}
  <div className="flex-1 font-['Montserrat'] bg-white mt-6 p-3 sm:p-4 shadow-[0px_4px_4px_rgba(0,0,0,0.25)] rounded-[10px] md:bg-transparent md:mt-0 md:shadow-none md:rounded-none md:rounded-r-[10px] md:py-3 lg:py-8 md:px-2 lg:px-4">
    {activeMenu === "addFunds" && <AddFunds onWalletSelect={() => setActiveMenu("wallet")} />}
    {activeMenu === "wallet" && <WalletOverview />}
    {activeMenu === "history" && <TransactionHistory />}
    {activeMenu === "withdraw" && <WithdrawFunds />}
  </div>
</div>
        </div>
      </div>

      <div className="mt-[80px] md:mt-[150px]">
        <Footer />
      </div>
    </section>
  );
}