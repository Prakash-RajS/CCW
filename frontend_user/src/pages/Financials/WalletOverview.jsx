import React from "react";

export default function WalletOverview() {

  const walletSummary = [
    { key: "available", label: "Available Balance", amount: 75, bg: "bg-[#7F3FBF]" },
    { key: "pending", label: "Pending Payment", amount: 0, bg: "bg-[#5A00A3]" },
    { key: "total", label: "Total Deposits", amount: 20, bg: "bg-[#6A2E9B]" },
  ];

  const transactions = [
    {
      date: "12-12-2025",
      type: "CARD",
      amount: 2.0,
      status: "Completed",
    },
    {
      date: "20-11-2025",
      type: "CARD",
      amount: 4.0,
      status: "Completed",
    },
    {
      date: "23-10-2025",
      type: "CARD",
      amount: 1.0,
      status: "Completed",
    },
  ];

  return (
    <div className="font-['Montserrat']">

      {/* Header */}
      <h2 className="font-['Montserrat'] font-semibold text-[14px] md:text-[24px]">
        Manage Your Wallet - Secure, Fast, Flexible
      </h2>
      <p className="mt-0.5 md:mt-1 font-['Montserrat'] font-medium text-[12px] md:text-[16px] text-black">
        Track your balances, manage payment, and deposit or withdraw funds seamlessly and securely.
      </p>

      <div className="w-full h-[1px] bg-black/10 my-3"></div>

      {/* Summary Cards */}
      <div className="flex gap-2 md:gap-6">
        {walletSummary.map((item) => (
          <div
            key={item.key}
            className={`
            flex-1 md:flex-none md:w-[180px]
            h-[60px] md:h-[120px]
            rounded-[6px]
            text-white
            flex
            flex-col
            justify-center
            items-center
            p-1
            ${item.bg}
          `}
          >
            <p className="font-['Montserrat'] font-medium text-[16px] md:text-[24px]">
              ${item.amount.toFixed(2)}
            </p>
            <p className="font-['Montserrat'] font-medium text-[11px] md:text-[16px] text-center leading-tight">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      {/* Info Text */}
      <p className="mt-6 font-['Montserrat'] font-medium text-[12px] md:text-[16px] text-black md:pr-[160px]">
        Your funds are securely stored and protected by industry-standard encryption.
        Withdraw anytime if not used for payments.
      </p>

      {/* Transactions Table - UPDATED SECTION */}
      {/* Removed overflow-x-auto to prevent scroll, table will now fit width */}
      <div className="mt-8 w-full"> 
        <table className="w-full !border !border-black/30 !border-[#d9d9d9] text-center table-fixed">
          <thead>
            <tr className="!border-b !border-black/30 !border-[#d9d9d9]">
              {["Date", "Transaction Type", "Amount", "Status"].map((head) => (
                <th
                  key={head}
                  // UPDATED: Text reduced to 11px on mobile, 20px on desktop. Padding reduced.
                  className="py-2 md:py-3 font-['Montserrat'] font-medium text-[11px] md:text-[20px] leading-tight !border-r !border-[#d9d9d9] last:border-r-0 break-words"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {transactions.map((tx, i) => (
              <tr
                key={i}
                className="!border-t !border-black/30 !border-[#d9d9d9]"
              >
                 {/* UPDATED: Text reduced to 11px on mobile, 20px on desktop */}
                <td className="py-2 md:py-3 font-['Montserrat'] font-medium text-[11px] md:text-[20px] !border-r !border-[#d9d9d9] break-words">
                  {tx.date}
                </td>
                <td className="py-2 md:py-3 font-['Montserrat'] font-medium text-[11px] md:text-[20px] !border-r !border-[#d9d9d9] break-words">
                  {tx.type}
                </td>
                <td className="py-2 md:py-3 font-['Montserrat'] font-medium text-[11px] md:text-[20px] !border-r !border-[#d9d9d9] break-words">
                  ${tx.amount.toFixed(2)}
                </td>
                <td className="py-2 md:py-3 font-['Montserrat'] font-medium text-[11px] md:text-[20px] break-words">
                  {tx.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}