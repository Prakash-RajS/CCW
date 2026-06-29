
import React, { useState, useEffect } from 'react';
import ColHeader from "../../component/ColHeader";
import Footer from "../../component/Footer";
import HomeBg from "../../assets/AfterSign/HomeBg.png";
import Default from "../../assets/AfterSign/Default.png";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import api from "../../utils/axiosConfig";
import toast from "../../component/Toast";

const Transaction = () => {
  const navigate = useNavigate();
  const { userData } = useUser();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Refs for scrolling
  const tableRef = React.useRef(null);

  // Fetch transaction history
  useEffect(() => {
    if (userData?.id) {
      fetchTransactions();
    }
  }, [userData]);

  const fetchTransactions = async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await api.get(`/wallet/transactions?user_id=${userData.id}`);

    // Transform data to match the required format
    const formattedTransactions = response.data.map(tx => {
      // Determine display name
      let displayName = "Transaction";
      const txType = (tx.type || tx.transaction_type || "").toLowerCase();

      // ✅ Check for withdrawal - use the user field
      if (txType.includes("withdrawal")) {
        // Use the user name from the transaction
        if (tx.user) {
          // ✅ Check if this is the current user's withdrawal
          if (tx.user_id === userData.id) {
            displayName = `${tx.user} (You)`;
          } else {
            displayName = tx.user;
          }
        } else {
          displayName = "Withdrawal";
        }
      }
      else if (
        txType.includes("deposit") ||
        txType.includes("wallet topup") ||
        txType.includes("topup")
      ) {
        displayName = "Wallet Top Up";
      }
      else if (
        txType.includes("payment received")
      ) {
        // Collaborator sees creator name
        displayName = tx.from_user || "Creator";
      }
      else if (
        txType.includes("contract payment") ||
        txType.includes("milestone")
      ) {
        // Creator sees collaborator name
        displayName = tx.to_user || "Collaborator";
      }
      else if (
        txType.includes("transfer")
      ) {
        displayName = tx.to_user || tx.from_user || "Transfer";
      }

      // Determine display type
      let displayType = "Other";
      if (txType.includes("deposit") || txType.includes("topup")) displayType = "Top Up";
      else if (
        txType.includes("contract payment") ||
        txType.includes("payment received") ||
        txType.includes("milestone")
      )
        displayType = "Internal Transfer";
      else if (txType.includes("withdrawal")) displayType = "Withdrawal";
      else if (tx.type === "deposit") displayType = "Top Up";
      else if (tx.type === "transfer") displayType = "Transfer";
      else if (tx.type === "withdrawal") displayType = "Withdrawal";

      // Determine status
      let displayStatus = "Success";
      const statusRaw = (tx.status || "").toLowerCase();
      if (statusRaw === "pending") displayStatus = "Pending";
      else if (statusRaw === "failed" || statusRaw === "rejected") displayStatus = "Rejected";

      return {
        id: tx.id,
        date: formatDate(tx.date),
        name: displayName,
        amount: tx.amount,
        type: displayType,
        status: displayStatus,
        raw_date: tx.date
      };
    });

    setTransactions(formattedTransactions);
    setCurrentPage(1);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    setError("Failed to load transaction history");
    toast.error(
      "Failed to load transactions",
      err.response?.data?.detail || "Please refresh the page and try again."
    );
  } finally {
    setLoading(false);
  }
};

  // Format date to DD-MM-YY
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  };

  // Helper function to format Indian Rupees
  const formatIndianRupee = (amount) => {
    if (!amount && amount !== 0) return "0";
    const num = Number(amount);
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(num);
  };

  // Get status color class and badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case "Success": return "bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium";
      case "Pending": return "bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium";
      case "Rejected": return "bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium";
      default: return "bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium";
    }
  };

  // Get type badge styling
  const getTypeBadge = (type) => {
    switch (type) {
      case "Top Up": return "bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium";
      case "Internal Transfer": return "bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium";
      case "Withdrawal": return "bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium";
      default: return "bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium";
    }
  };

  // Get type icon for mobile cards
  const getTypeIcon = (type) => {
    switch (type) {
      case "Top Up": return "💰";
      case "Internal Transfer": return "🔄";
      case "Withdrawal": return "💸";
      default: return "📊";
    }
  };

  // Get status icon for mobile cards
  const getStatusIcon = (status) => {
    switch (status) {
      case "Success": return "✅";
      case "Pending": return "⏳";
      case "Rejected": return "❌";
      default: return "❓";
    }
  };

  // Pagination logic - with ellipsis
  const getCurrentPageItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return transactions.slice(indexOfFirstItem, indexOfLastItem);
  };

  const getTotalPages = () => {
    return Math.ceil(transactions.length / itemsPerPage);
  };

  // Build page numbers with ellipsis
  const getPageNumbers = () => {
    const totalPages = getTotalPages();
    if (totalPages <= 1) return [1];
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

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setTimeout(() => {
      if (tableRef.current) {
        const yOffset = -80;
        const y = tableRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setTimeout(() => {
        if (tableRef.current) {
          const yOffset = -80;
          const y = tableRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const goToNextPage = () => {
    if (currentPage < getTotalPages()) {
      setCurrentPage(currentPage + 1);
      setTimeout(() => {
        if (tableRef.current) {
          const yOffset = -80;
          const y = tableRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const currentItems = getCurrentPageItems();
  const totalPages = getTotalPages();

  return (
    <div className="w-full h-auto flex flex-col overflow-x-hidden relative bg-[#F5F5F5] md:bg-transparent">
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
          <div className="absolute inset-0 bg-black opacity-40 md:opacity-20" />
        </div>
        
        <ColHeader />

        {/* Main Content Container */}
        {/* Main Content Container - FIXED */}
<div
  ref={tableRef}
  className="relative z-10 w-[95%] md:w-[90%] lg:w-[95%] xl:w-[1215px] mt-[100px] md:mt-[140px] mx-auto opacity-100 shadow-[0px_4px_4px_0px_#00000040] bg-white rounded-xl md:rounded-none"
>
          {/* Back Button - Positioned above the container */}
          <div className="absolute -top-[50px] md:-top-[60px] left-0 z-20">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-white hover:text-white/80 transition-colors group"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-[#51218F] to-[#2a0e4a] group-hover:from-[#3d1768] group-hover:to-[#1a0830] transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </div>
              <span className="font-medium text-base hidden md:block">Back</span>
            </button>
          </div>

          {/* DESKTOP ONLY: Overview Text */}
          <div className="hidden md:block absolute top-[21px] left-[37px]">
            <h1 className="font-outfit font-normal text-[40px] leading-[100%] text-black">
              Transactions
            </h1>
          </div>

          {/* MOBILE ONLY: Title */}
          <div className="md:hidden px-4 pt-4">
            <h1 className="font-outfit font-bold text-[24px] text-black">
              Transactions
            </h1>
          </div>

          {/* Table Container */}
          <div className="w-full mt-4 md:mt-[81px] px-3 md:px-10 pb-6 md:pb-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-[#51218F] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500">Loading transactions...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-red-500 mb-4">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={fetchTransactions}
                  className="px-4 py-2 bg-[#51218F] text-white rounded-lg hover:bg-gradient-to-r hover:from-[#51218F] hover:to-black transition-all"
                >
                  Retry
                </button>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-[180px] md:w-[295px] h-auto mb-6 md:mb-8">
                  <img 
                    src={Default} 
                    alt="No transactions" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="font-outfit font-normal text-center text-[14px] md:text-[16px] text-black">
                  No transactions found
                </p>
                <p className="font-outfit text-center text-[12px] md:text-[14px] text-gray-500 mt-2">
                  Your transaction history will appear here
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Cards View - Enhanced for better visibility */}
                <div className="block md:hidden space-y-4">
                  {currentItems.map((tx, index) => (
                    <div 
                      key={tx.id || index} 
                      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-xl"
                      style={{
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)'
                      }}
                    >
                      {/* Card Header with Gradient */}
                      <div className="bg-gradient-to-r from-[#51218F] to-[#7B2FBF] px-4 py-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-white text-lg">{getTypeIcon(tx.type)}</span>
                            <h3 className="font-semibold text-white text-sm truncate max-w-[150px]">
                              {tx.name}
                            </h3>
                          </div>
                          <span className={getStatusBadge(tx.status)}>
                            {getStatusIcon(tx.status)} {tx.status}
                          </span>
                        </div>
                      </div>
                      
                      {/* Card Body */}
                      <div className="px-4 py-3 space-y-3 bg-white">
                        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                          <span className="text-gray-500 text-sm font-medium">Date</span>
                          <span className="text-gray-700 text-sm">{tx.date}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                          <span className="text-gray-500 text-sm font-medium">Type</span>
                          <span className={getTypeBadge(tx.type)}>{tx.type}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 text-sm font-medium">Amount</span>
                          <span className={`font-bold text-lg ${
                            tx.type === "Withdrawal" ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {tx.type === "Withdrawal" ? '-' : '+'} ₹{formatIndianRupee(tx.amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gradient-to-r from-[#51218F] to-black text-white">
                          <th className="px-4 md:px-6 py-4 text-[14px] md:text-[16px] font-semibold border-r border-white/20 text-left">
                            Date
                          </th>
                          <th className="px-4 md:px-6 py-4 text-[14px] md:text-[16px] font-semibold border-r border-white/20 text-left">
                            Name
                          </th>
                          <th className="px-4 md:px-6 py-4 text-[14px] md:text-[16px] font-semibold border-r border-white/20 text-left">
                            Amount
                          </th>
                          <th className="px-4 md:px-6 py-4 text-[14px] md:text-[16px] font-semibold border-r border-white/20 text-left">
                            Type
                          </th>
                          <th className="px-4 md:px-6 py-4 text-[14px] md:text-[16px] font-semibold text-left">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.map((tx, index) => (
                          <tr
                            key={tx.id || index}
                            className={`border-b border-gray-100 hover:bg-purple-50/40 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                          >
                            <td className="px-4 md:px-6 py-4 text-[13px] md:text-[14px] text-gray-600 whitespace-nowrap">
                              {tx.date}
                            </td>
                            <td className="px-4 md:px-6 py-4 text-[13px] md:text-[14px] font-medium text-gray-800 max-w-[150px] md:max-w-[250px] truncate">
                              {tx.name}
                            </td>
                            <td className="px-4 md:px-6 py-4 text-[13px] md:text-[14px] font-semibold text-gray-900 whitespace-nowrap">
                              ₹{formatIndianRupee(tx.amount)}
                            </td>
                            <td className="px-4 md:px-6 py-4">
                              <span className={getTypeBadge(tx.type)}>{tx.type}</span>
                            </td>
                            <td className="px-4 md:px-6 py-4">
                              <span className={getStatusBadge(tx.status)}>{tx.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Modern Pagination - Always Show */}
                <div className="flex flex-col md:flex-row items-center justify-between mt-6 gap-3">
                  {/* Showing info - hidden on mobile, visible on desktop */}
                  <p className="text-xs text-gray-500 hidden md:block">
                    Showing <span className="font-semibold text-gray-700">{((currentPage - 1) * itemsPerPage) + 1}</span>–<span className="font-semibold text-gray-700">{Math.min(currentPage * itemsPerPage, transactions.length)}</span> of <span className="font-semibold text-gray-700">{transactions.length}</span> transactions
                  </p>

                  {/* Pagination buttons - centered on mobile, hidden if only 1 page */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-1 w-full md:w-auto">
                      <button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-[#51218F] hover:text-[#51218F] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
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

                      <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-[#51218F] hover:text-[#51218F] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Showing info - mobile version */}
                  <p className="text-xs text-gray-500 text-center md:hidden">
                    Page {currentPage} of {totalPages}
                  </p>
                </div>
              </>
            )}
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