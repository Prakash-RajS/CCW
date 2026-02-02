import React from "react";

export default function TransactionHistroy() {
  const transactionHistory = [
    {
      date: "12-01-2025",
      name: "Ram",
      amount: 2.0,
      type: "Card",
      status: "Success",
    },
    {
      date: "24-03-2025",
      name: "Liam",
      amount: 4.0,
      type: "Card",
      status: "Pending",
    },
    {
      date: "11-04-2025",
      name: "Noah",
      amount: 1.0,
      type: "Card",
      status: "Success",
    },
    {
      date: "21-03-2025",
      name: "Oliver",
      amount: 3.0,
      type: "Card",
      status: "Rejected",
    },
    {
      date: "14-01-2025",
      name: "James",
      amount: 7.0,
      type: "Card",
      status: "Success",
    },
  ];

  return (
    <div className="font-['Montserrat'] w-full">
      {/* ---------------- Header Section ---------------- */}
      <div className="mb-4 md:mb-0">
        {/* Title: Hidden on Mobile, Visible on Desktop */}
        <h2 className="hidden md:block font-semibold text-[24px]  text-black">
          Transaction History
        </h2>

        {/* Description */}
        <p className="font-medium text-[13px] md:text-[16px] text-black  md:pr-[12px]">
          Review all wallet transactions with detailed insights. Track deposits,
          withdrawals, and payments effortlessly in one place.
        </p>
      </div>

      <div className="w-full h-[1px] bg-black/10 my-1 md:my-0"></div>

      {/* ---------------- Table Section ---------------- */}
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-full text-left border-collapse">
          <thead>
            <tr>
              {/* Date */}
              <th className="py-2 md:py-4 !border-b !border-gray-300 text-[10px] md:text-[16px] font-semibold text-black whitespace-nowrap pr-1 md:pr-0">
                Date
              </th>
              
              {/* Name - Centered on Mobile */}
              <th className="px-0.5 md:px-2 py-2 md:py-4 !border-b !border-gray-300 text-[10px] md:text-[16px] font-semibold text-black text-center md:text-left">
                Name
              </th>
              
              {/* Amount - Centered on Mobile */}
              <th className="px-0.5 md:px-2 py-2 md:py-4 !border-b !border-gray-300 text-[10px] md:text-[16px] font-semibold text-black text-center md:text-left">
                Amount
              </th>
              
              {/* Transaction Type */}
              <th className="px-0.5 md:px-2 py-2 md:py-4 !border-b !border-gray-300 text-[10px] md:text-[16px] font-semibold text-black text-center md:text-left">
                <span className="block md:inline">Transaction</span>
                <span className="block md:inline md:ml-1">Type</span>
              </th>
              
              {/* Status */}
              <th className="py-2 md:py-4 !border-b !border-gray-300 text-[10px] md:text-[16px] font-semibold text-black text-right md:text-left pl-1 md:pl-0">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {transactionHistory.map((tx, index) => (
              <tr key={index}>
                {/* Date */}
                <td className="py-3 md:py-4 !border-b !border-gray-300 md:!border-0 text-[10px] md:text-[16px] font-medium text-black whitespace-nowrap pr-1 md:pr-0">
                  {tx.date}
                </td>

                {/* Name - Centered on Mobile */}
                <td className="px-0.5 md:px-2 py-3 md:py-4 !border-b !border-gray-300 md:!border-0 text-[10px] md:text-[16px] font-medium text-black text-center md:text-left">
                  {tx.name}
                </td>

                {/* Amount - Centered on Mobile */}
                <td className="px-0.5 md:px-2 py-3 md:py-4 !border-b !border-gray-300 md:!border-0 text-[10px] md:text-[16px] font-medium text-black text-center md:text-left">
                  ${tx.amount.toFixed(2)}
                </td>

                {/* Transaction Type */}
                <td className="px-0.5 md:px-2 py-3 md:py-4 !border-b !border-gray-300 md:!border-0 text-[10px] md:text-[16px] font-medium text-black text-center md:text-left">
                  {tx.type}
                </td>

                {/* Status */}
                <td
                  className={`py-3 md:py-4 !border-b !border-gray-300 md:!border-0 text-[10px] md:text-[16px] font-medium text-right md:text-left pl-1 md:pl-0
                    ${
                      tx.status === "Success"
                        ? "text-[#4ADE80] md:text-green-500" 
                        : tx.status === "Pending"
                        ? "text-[#60A5FA] md:text-blue-500"
                        : "text-[#F87171] md:text-red-500"
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
  );
}