import React, { useState } from 'react';
import ColHeader from "../../component/ColHeader";
import Footer from "../../component/Footer";
import HomeBg from "../../assets/AfterSign/HomeBg.png";

import { useNavigate } from "react-router-dom";

const Transaction = () => {
 
  const navigate = useNavigate();

  const transactionHistory = [
    {
      date: "12-01-25", // Shortened year to match image
      name: "Ram",
      amount: 2.0,
      type: "Card",
      status: "Success",
    },
    {
      date: "24-03-25",
      name: "Liam",
      amount: 4.0,
      type: "Card",
      status: "Pending",
    },
    {
      date: "11-04-25",
      name: "Noah",
      amount: 1.0,
      type: "Card",
      status: "Success",
    },
    {
      date: "21-03-25",
      name: "Oliver",
      amount: 3.0,
      type: "Card",
      status: "Rejected",
    },
    {
      date: "14-01-25",
      name: "James",
      amount: 7.0,
      type: "Card",
      status: "Success",
    },
  ];

  return (
    // Main Container
    <div className="w-full min-h-screen flex flex-col overflow-x-hidden relative bg-[#F5F5F5] md:bg-transparent">
      <section className="w-full flex flex-col items-center justify-start px-0 md:px-4 relative min-w-0 pb-20">
        
        {/* Background Image Container */}
        <div
          className="absolute top-0 md:top-[-104px] left-0 w-full h-[400px] md:h-[582px] z-0"
          style={{
            backgroundImage: `url(${HomeBg})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          {/* White Overlay */}
          <div className="absolute inset-0 bg-white opacity-20 md:opacity-50" />
        </div>
        
        <ColHeader />

        {/* DESKTOP ONLY: Back Button */}
        <div className="hidden md:block absolute top-[140px] left-1/2 transform -translate-x-1/2 w-[1005px] z-20">
             <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity"
             >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="font-outfit text-[18px]">Back</span>
             </button>
        </div>

        {/* MOBILE ONLY: Back Arrow and Title */}
        <div className="w-[90%] mx-auto mt-[100px] mb-4 md:hidden relative z-10 flex flex-col gap-2">
            {/* Back Arrow */}
            <button 
                onClick={() => navigate(-1)} 
                className="text-white w-8 h-8 flex items-center justify-center mb-1"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 12H5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 19L5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
            
            {/* Title */}
            <h1 className="font-outfit font-bold text-[32px] text-white leading-tight">
              Transactions
            </h1>
        </div>

        {/* Main Content Container */}
        <div
          className="relative z-10 w-[90%] md:w-[1005px] mt-0 md:mt-[197px] mx-auto opacity-100 shadow-[0px_4px_4px_0px_#00000040] bg-white min-h-[460px] rounded-xl md:rounded-none"
        >
          {/* DESKTOP ONLY: Overview Text */}
          <div className="hidden md:block absolute top-[21px] left-[77px]">
            <h1 className="font-outfit font-normal text-[40px] leading-[100%] text-black">
              Transactions
            </h1>
          </div>

          {/* Table Container */}
          {/* Removed overflow-x-auto to force fit, added padding adjustments */}
          <div className="w-full mt-4 md:mt-[81px] px-2 md:px-20 pb-6 md:pb-0">
            <table className="w-full border border-[#d9d9d9] text-left table-fixed md:table-auto">
              <thead>
                <tr className="!border-b !border-[#d9d9d9]">
                  {/* Custom Header Cells to allow wrapping and sizing */}
                  <th className="px-1 md:px-4 py-3 text-[12px] md:text-[18px] font-bold md:font-medium border-r border-[#d9d9d9] text-left">Date</th>
                  <th className="px-1 md:px-4 py-3 text-[12px] md:text-[18px] font-bold md:font-medium border-r border-[#d9d9d9] text-center">Name</th>
                  <th className="px-1 md:px-4 py-3 text-[12px] md:text-[18px] font-bold md:font-medium border-r border-[#d9d9d9] text-center">Amount</th>
                  {/* Transaction Type - Allowed to wrap on mobile */}
                  <th className="px-1 md:px-4 py-3 text-[12px] md:text-[18px] font-bold md:font-medium border-r border-[#d9d9d9] text-center whitespace-normal md:whitespace-nowrap leading-tight">
                    Transaction Type
                  </th>
                  <th className="px-1 md:px-4 py-3 text-[12px] md:text-[18px] font-bold md:font-medium text-right md:text-left">Status</th>
                </tr>
              </thead>

              <tbody>
                {transactionHistory.map((tx, index) => (
                  <tr
                    key={index}
                    className="border-t border-[#d9d9d9]"
                  >
                    <td className="px-1 md:px-4 py-3 border-r border-[#d9d9d9] text-[12px] md:text-base font-medium text-left">{tx.date}</td>
                    <td className="px-1 md:px-4 py-3 border-r border-[#d9d9d9] text-[12px] md:text-base font-medium text-center">{tx.name}</td>
                    <td className="px-1 md:px-4 py-3 border-r border-[#d9d9d9] text-[12px] md:text-base font-medium text-center">${tx.amount.toFixed(2)}</td>
                    <td className="px-1 md:px-4 py-3 border-r border-[#d9d9d9] text-[12px] md:text-base font-medium text-center">{tx.type}</td>
                    <td
                      className={`px-1 md:px-4 py-3 font-medium text-[12px] md:text-base text-right md:text-left
                        ${
                          tx.status === "Success"
                            ? "text-green-500"
                            : tx.status === "Pending"
                            ? "text-blue-500"
                            : "text-red-500"
                        }
                      `}
                    >
                      {tx.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

         </div>
      </section>
      
      <div className="w-full mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default Transaction;