import React, { useState, useEffect } from "react";
import { useUser } from "../../contexts/UserContext";
import api from "../../utils/axiosConfig";
import toast from "../../component/Toast";

export default function TransactionHistory() {
  const { userData } = useUser();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const tableRef = React.useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (userData?.id) {
      fetchTransactions();
    }
  }, [userData]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/wallet/transactions?user_id=${userData.id}`);

      const formattedTxs = response.data.map(tx => {
        let displayName = "Transaction";
        const txType = (tx.transaction_type || tx.type || "").toLowerCase();

        if (
          txType.includes("deposit") ||
          txType.includes("wallet topup") ||
          txType.includes("topup")
        ) {
          displayName = "Wallet Top Up";
        }
        else if (
          txType.includes("contract payment") ||
          txType.includes("milestone")
        ) {
          displayName = tx.to_user || "Collaborator";
        }
        else if (
          txType.includes("payment received")
        ) {
          displayName = tx.from_user || "Creator";
        }
        else if (
          txType.includes("withdrawal")
        ) {
          displayName = "Withdrawal";
        }

        let displayType = "Other";

        if (
          txType.includes("deposit") ||
          txType.includes("topup")
        ) {
          displayType = "Top Up";
        }
        else if (
          txType.includes("contract payment") ||
          txType.includes("payment received") ||
          txType.includes("milestone")
        ) {
          displayType = "Internal Transfer";
        }
        else if (
          txType.includes("withdrawal")
        ) {
          displayType = "Withdrawal";
        }

        let displayStatus = "Success";
        const statusRaw = (tx.status || "").toLowerCase();
        if (statusRaw === "pending") displayStatus = "Pending";
        else if (statusRaw === "failed" || statusRaw === "rejected") displayStatus = "Rejected";

        return {
          date: new Date(tx.date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }).replace(/\//g, '-'),
          name: displayName,
          amount: tx.amount,
          type: displayType,
          status: displayStatus,
        };
      });

      setTransactions(formattedTxs);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      toast.error(
        "Failed to load transactions",
        err.response?.data?.detail || "Please refresh the page and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setTimeout(() => {
      if (tableRef.current) {
        const yOffset = -200;
        const y = tableRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  };

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const currentTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "Success":  return "bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium whitespace-nowrap";
      case "Pending":  return "bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium whitespace-nowrap";
      case "Rejected": return "bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium whitespace-nowrap";
      default:         return "bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium whitespace-nowrap";
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "Top Up":    return "bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium whitespace-nowrap";
      case "Internal Transfer":  return "bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium whitespace-nowrap";
      case "Withdrawal": return "bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium whitespace-nowrap";
      default:           return "bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium whitespace-nowrap";
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="font-['Montserrat'] flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-[#51218F] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="font-['Montserrat'] w-full">
      {/* Header */}
      <div className="mb-3 md:mb-4 px-2 sm:px-3 md:px-4">
        <h2 className="hidden md:block font-semibold text-[22px] lg:text-[24px] xl:text-[26px] text-black">Transaction History</h2>
        <p className="font-medium text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] xl:text-[16px] text-black">
          Review all wallet transactions with detailed insights. Track deposits, withdrawals, and payments effortlessly in one place.
        </p>
      </div>

      <div className="w-full h-[1px] bg-black/10 mb-4"></div>

      {/* Table */}
      <div className="w-full" ref={tableRef}>
        {transactions.length > 0 ? (
          <>
            {/* Card Layout for Mobile & Tablet - Shows on mobile and tablet */}
            <div className="space-y-3 px-2 sm:px-3 md:px-4">
              {currentTransactions.map((tx, index) => (
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs text-gray-500">{tx.date}</p>
                      <p className="font-semibold text-gray-800 text-sm mt-1 break-words max-w-[200px] sm:max-w-[300px] md:max-w-[400px]">
                        {tx.name}
                      </p>
                    </div>
                    <span className={getStatusBadge(tx.status)}>
                      {tx.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className={getTypeBadge(tx.type)}>{tx.type}</span>
                    <p className="font-bold text-purple-700 text-base sm:text-lg">
                      ₹{tx.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6 px-2 sm:px-3 md:px-4">
              {totalPages > 1 && (
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="flex items-center justify-center gap-1 flex-wrap">
                    {/* Prev */}
                    <button
                      onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                      disabled={currentPage === 1}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-b from-[#4c1d95] to-[#1e1b4b] text-white shadow-md active:scale-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m0 0l7-7m-7 7l7 7" />
                      </svg>
                    </button>

                    {getPageNumbers().map((page, i) =>
                      page === "..." ? (
                        <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">…</span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                            currentPage === page
                              ? 'bg-gradient-to-r from-[#51218F] to-black text-white shadow-sm'
                              : 'border border-gray-200 text-gray-600 hover:border-[#51218F] hover:text-[#51218F]'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}

                    {/* Next */}
                    <button
                      onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-b from-[#4c1d95] to-[#1e1b4b] text-white shadow-md active:scale-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m0 0l-7-7m7 7l-7 7" />
                      </svg>
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    Page {currentPage} of {totalPages} • {transactions.length} total transaction{transactions.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}

              {totalPages <= 1 && transactions.length > 0 && (
                <p className="text-xs text-gray-500 text-center">
                  Showing all <span className="font-semibold text-gray-700">{transactions.length}</span> transaction{transactions.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm font-medium">No transactions found</p>
            <button onClick={fetchTransactions} className="mt-2 text-[#51218F] text-xs hover:underline font-medium">Refresh</button>
          </div>
        )}
      </div>
    </div>
  );
}