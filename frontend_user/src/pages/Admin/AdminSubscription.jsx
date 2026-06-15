import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  ChevronsUpDown,
  Users,
  BookMarked,
  CheckCircle2,
  Contact,
  Pencil,
  X,
  Download,
  ChevronDown // Add this import
} from "lucide-react";

import sub1 from "../../assets/Adminimages/sub1.png";
import sub2 from "../../assets/Adminimages/sub2.png";
import sub3 from "../../assets/Adminimages/sub3.png";
import sub4 from "../../assets/Adminimages/sub4.png";
import sub5 from "../../assets/Adminimages/sub5.png";
import DownloadIcon from "../../assets/Financials/successIcon.png";

const SubscriptionPage = () => {
  const profileImages = [sub1, sub2, sub3, sub4, sub5];
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [paymentData, setPaymentData] = useState({
    plan: '',
    subscriptionType: 'monthly',
    role: 'Creator',
    charges: ''
  });
const [openDropdown, setOpenDropdown] = useState(null);

const [plan, setPlan] = useState("Pro");
const [subscription, setSubscription] = useState("Monthly");
const [role, setRole] = useState("Creator");
const [charges, setCharges] = useState("20");

  // Add these missing state variables
  const [isEditPaymentModalOpen, setIsEditPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // State for dark mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") return true;
    if (savedTheme === "light") return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // State for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Subscription history data
  const subscriptionData = [
    { 
      id: 1, 
      name: "James", 
      email: "James@gmail.com", 
      username: "Jam124", 
      role: "Creator", 
      date: "March 12, 2023", 
      plan: "Pro" 
    },
    { 
      id: 2, 
      name: "Michael", 
      email: "Michael@gmail.com", 
      username: "Mic457", 
      role: "Collaborator", 
      date: "June 27, 2022", 
      plan: "Pro" 
    },
    { 
      id: 3, 
      name: "John", 
      email: "John@gmail.com", 
      username: "John3", 
      role: "Creator", 
      date: "January 8, 2024", 
      plan: "Agent" 
    },
    { 
      id: 4, 
      name: "Robert", 
      email: "Robert@gmail.com", 
      username: "Robe12", 
      role: "Creator", 
      date: "October 5, 2021", 
      plan: "Free" 
    },
    { 
      id: 5, 
      name: "David", 
      email: "David@gmail.com", 
      username: "David7", 
      role: "Creator", 
      date: "February 19, 2023", 
      plan: "Agent" 
    },
  ];

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark") {
        setIsDarkMode(true);
      } else if (savedTheme === "light") {
        setIsDarkMode(false);
      } else {
        setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
      }
    };

    window.addEventListener("theme-change", handleThemeChange);
    return () => window.removeEventListener("theme-change", handleThemeChange);
  }, []);

  const handleDownloadClick = (row) => {
    setSelectedRow(row);
    setIsDownloadModalOpen(true);
  };

  const handleConfirmDownload = () => {
    console.log(`Downloading data for ${selectedRow?.name}`);
    // Add your download logic here
    setIsDownloadModalOpen(false);
  };
  const GradientOptions = ({ options, onSelect }) => (
  <div
    className="absolute top-full left-0 mt-2 w-full rounded-xl overflow-hidden shadow-2xl z-50"
    style={{
      background: "linear-gradient(180deg, #51218F 0%, #020202 100%)",
    }}
  >
    {options.map((item) => (
      <button
        key={item}
        onClick={() => onSelect(item)}
        className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition"
      >
        {item}
      </button>
    ))}
  </div>
);


  // Pricing plans data
  const pricingPlans = [
    {
      name: "Free",
      price: "Free",
      yearly: "",
      users: "450",
      features: [
        "Basic messaging (Twilio)",
        "Upload files upto1GB total storage",
        "Email support (standard)",
        "join 1 active collabration workspace",
      ],
    },
    {
      name: "Pro",
      price: "$20/month",
      yearly: "$2400 / Year",
      users: "390",
      features: [
        "Unlimited collaboration invities",
        "Access to resource marketplace",
        "join or create up to 5 active workspaces",
        "Task boards (Trello-style)",
      ],
    },
    {
      name: "Agent",
      price: "$40/month",
      yearly: "$4800 / Year",
      users: "150",
      features: [
        "Unlimited team members",
        "Unlimited workspaces",
        "Unlimited storage",
        "Advanced analytics dashboard",
      ],
    },
  ];

  const handleEditPlanClick = (plan) => {
    setSelectedPlan(plan);
    setPaymentData({
      plan: plan.name,
      subscriptionType: 'monthly',
      role: 'Creator',
      charges: plan.name === 'Pro' ? '20' : plan.name === 'Agent' ? '40' : '0'
    });
    setIsEditPaymentModalOpen(true);
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    console.log('Payment data saved:', paymentData);
    setIsEditPaymentModalOpen(false);
  };

  const handleNumberInputChange = (field, value) => {
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setPaymentData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className={`w-full h-full ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* ================= SUBSCRIPTION CONTENT STARTS HERE ================= */}
      <div className="px-0 pt-0 pb-8 max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="mt-2 mb-4"> 
          <h1 className={`text-2xl lg:text-[32px] font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
            Subscription Management
          </h1>
        </div>

        {/* ================= STATS SECTION ================= */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  {[
    { label: "Total Subscribers", value: "1824", icon: <Users size={26} /> },
    { label: "Active free Plan", value: "1000", icon: <BookMarked size={26} /> },
    { label: "Active Pro Plan", value: "500", icon: <CheckCircle2 size={26} /> },
    { label: "Active Agent Plan", value: "200", icon: <Contact size={26} /> },
  ].map((item, i) => (
    <div
      key={i}
      className={`
        flex items-center gap-4 px-6 py-5 rounded-xl
        ${isDarkMode ? "bg-black text-white" : "text-white"}
        shadow-xl transition-all duration-300
      `}
      style={
        isDarkMode
          ? {}
          : {
              background:
                "linear-gradient(90deg, #37264a 0%, #020202 100%)",
            }
      }
    >
      {/* ICON – LEFT */}
      <div className="flex-shrink-0">
        {item.icon}
      </div>

      {/* TEXT – LEFT ALIGNED */}
      <div className="flex flex-col items-start">
        <h2 className="text-3xl font-medium leading-none tracking-tight">
          {item.value}
        </h2>
        <p
          className="text-[13px] mt-1 capitalize opacity-90"
          style={{ fontFamily: "'Old Standard TT', serif" }}
        >
          {item.label}
        </p>
      </div>
    </div>
  ))}
</div>


      {/* ================= PRICING CARDS SECTION ================= */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 w-full">
  {pricingPlans.map((plan, idx) => (
    <div
      key={idx}
      className={`
        relative rounded-[24px] p-8 flex flex-col min-h-[380px]
        ${isDarkMode ? "bg-[#0f0f0f] text-white border border-white/10" : "text-white"}
      `}
      style={
        isDarkMode
          ? {}
          : {
              background:
                plan.name === "Free"
                  ? "linear-gradient(180deg, #7d54af 0%, #8264a7 100%)"
                  : "linear-gradient(180deg, #7A5C97 0%, #6A4E87 100%)",
            }
      }
    >
      {/* ===== EDIT ICON ===== */}
      <button
        onClick={() => handleEditPlanClick(plan)}
        className={`
          absolute top-1 right-4 w-[25px] h-[25px] rounded-full 
          flex items-center justify-center hover:scale-110 transition
          ${isDarkMode ? "bg-white text-black" : ""}
        `}
        style={
          isDarkMode
            ? {}
            : { background: "linear-gradient(180deg, #51218F 0%, #020202 100%)" }
        }
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 20h9"
            stroke={isDarkMode ? "black" : "white"}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
            stroke={isDarkMode ? "black" : "white"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-start mb-6">
        <div
          className={`
            px-4 py-1 rounded-lg text-sm font-bold
            ${isDarkMode ? "bg-white text-black" : "bg-[#C9A7FF] text-black"}
          `}
        >
          {plan.name}
        </div>

        {plan.price !== "Free" && (
          <div className="px-4 py-1 rounded-lg bg-white text-black text-sm font-bold">
            {plan.price}
          </div>
        )}
      </div>

      {/* ===== FEATURES ===== */}
      <div className="flex-grow space-y-4">
        {plan.features.map((feature, fIdx) => (
          <div key={fIdx} className="flex items-start gap-3">
            <div
              className={`
                w-5 h-5 rounded-full flex items-center justify-center
                ${isDarkMode ? "border border-white/40" : "border border-white"}
              `}
            >
              <CheckCircle size={14} />
            </div>
            <span className="text-[14px] leading-snug opacity-90">
              {feature}
            </span>
          </div>
        ))}
      </div>

      {/* ===== FOOTER ===== */}
      <div className="mt-6 pt-4">
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-bold">{plan.users}</span>
          <span className="text-sm opacity-70">Active User</span>
        </div>

        <div
          className={`h-px w-full mb-4 ${
            isDarkMode ? "bg-white/20" : "bg-white/40"
          }`}
        />

        {plan.yearly && (
          <div
            className={`
              text-center py-2.5 rounded-lg font-bold text-sm
              ${isDarkMode ? "bg-white text-black" : "bg-white text-black"}
            `}
          >
            {plan.yearly}
          </div>
        )}
      </div>
    </div>
  ))}
</div>

{/* ================= EDIT PAYMENT MODAL ================= */}
{isEditPaymentModalOpen && (
  <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
    <div className={`w-full max-w-lg rounded-2xl shadow-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      
      {/* HEADER */}
      <div className={`flex items-center justify-between px-6 py-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Edit Payment</h2>
        <button
          onClick={() => setIsEditPaymentModalOpen(false)}
          className="w-8 h-8 rounded-full text-white flex items-center justify-center hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(180deg, #51218F 0%, #020202 100%)" }}
        >
          ✕
        </button>
      </div>

      {/* BODY */}
      <div className="px-6 py-6 space-y-6">

        {/* PLAN + SUBSCRIPTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* PLAN */}
          <div className="relative">
            <label className={`text-sm mb-2 block ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Plan</label>
            <button
              onClick={() => setOpenDropdown(openDropdown === "plan" ? null : "plan")}
              className={`w-full px-4 py-3 rounded-lg flex justify-between items-center ${
                isDarkMode 
                  ? 'bg-gray-700 border border-gray-600 text-white hover:bg-gray-600' 
                  : 'bg-gray-50 !border border-gray-300 hover:bg-gray-100'
              }`}
            >
              {plan}
              <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>▾</span>
            </button>

            {openDropdown === "plan" && (
              <GradientOptions
                options={["Pro", "Agent"]}
                onSelect={(v) => {
                  setPlan(v);
                  setOpenDropdown(null);
                }}
                isDarkMode={isDarkMode}
              />
            )}
          </div>

          {/* SUBSCRIPTION */}
          <div className="relative">
            <label className={`text-sm mb-2 block ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Subscription Plan
            </label>
            <button
              onClick={() =>
                setOpenDropdown(openDropdown === "subscription" ? null : "subscription")
              }
              className={`w-full px-4 py-3 rounded-lg flex justify-between items-center ${
                isDarkMode 
                  ? 'bg-gray-700 border border-gray-600 text-white hover:bg-gray-600' 
                  : 'bg-gray-50 !border border-gray-300 hover:bg-gray-100'
              }`}
            >
              {subscription}
              <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>▾</span>
            </button>

            {openDropdown === "subscription" && (
              <GradientOptions
                options={["Monthly", "Annually"]}
                onSelect={(v) => {
                  setSubscription(v);
                  setOpenDropdown(null);
                }}
                isDarkMode={isDarkMode}
              />
            )}
          </div>
        </div>

        {/* ROLE + CHARGES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* ROLE */}
          <div className="relative">
            <label className={`text-sm mb-2 block ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Role</label>
            <button
              onClick={() => setOpenDropdown(openDropdown === "role" ? null : "role")}
              className={`w-full px-4 py-3 rounded-lg flex justify-between items-center ${
                isDarkMode 
                  ? 'bg-gray-700 border border-gray-600 text-white hover:bg-gray-600' 
                  : 'bg-gray-50 !border border-gray-300 hover:bg-gray-100'
              }`}
            >
              {role}
              <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>▾</span>
            </button>

            {openDropdown === "role" && (
              <GradientOptions
                options={["Creator", "Collaborator"]}
                onSelect={(v) => {
                  setRole(v);
                  setOpenDropdown(null);
                }}
                isDarkMode={isDarkMode}
              />
            )}
          </div>

          {/* CHARGES */}
          <div className="relative">
            <label className={`text-sm mb-2 block ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Update Charges
            </label>
            <button
              onClick={() =>
                setOpenDropdown(openDropdown === "charges" ? null : "charges")
              }
              className={`w-full px-4 py-3 rounded-lg flex justify-between items-center ${
                isDarkMode 
                  ? 'bg-gray-700 border border-gray-600 text-white hover:bg-gray-600' 
                  : 'bg-gray-50 !border border-gray-300 hover:bg-gray-100'
              }`}
            >
              {charges}
              <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>▾</span>
            </button>

            {openDropdown === "charges" && (
              <GradientOptions
                options={["20", "30"]}
                onSelect={(v) => {
                  setCharges(v);
                  setOpenDropdown(null);
                }}
                isDarkMode={isDarkMode}
              />
            )}
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-4 pt-25">
          <button
            className="flex-1 py-3 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(90deg, #51218F 0%, #020202 100%)" }}
          >
            Save Change
          </button>
          <button
            onClick={() => setIsEditPaymentModalOpen(false)}
            className={`flex-1 py-3 rounded-lg font-medium ${
              isDarkMode 
                ? 'bg-gray-700 border border-gray-600 text-white hover:bg-gray-600' 
                : '!border border-black hover:bg-gray-100'
            }`}
          >
            Cancel
          </button>
         
        </div>
      </div>
    </div>
  </div>
)}

        {/* ================= SUBSCRIPTION HISTORY SECTION ================= */}
        <div className="mt-8">
          <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-black'}`}>
            Subscription History
          </h2>

          <div className={`border rounded-lg ${isDarkMode ? 'bg-black border-white/40' : 'bg-white border-black/40'} shadow-lg`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                {/* ================= TABLE HEAD ================= */}
                <thead>
                  <tr
                    className={`
                      text-[15px] font-medium
                      ${isDarkMode ? "text-white" : "text-white"}
                      ${isDarkMode ? "border-b border-white/30" : "border-b border-[#6D3BBF]"}
                    `}
                    style={
                      isDarkMode
                        ? { background: "linear-gradient(90deg, #2a2a2a 0%, #1a1a1a 100%)" }
                        : {
                            background:
                              "linear-gradient(90deg, #65527a 0%, #baa5c6 100%)",
                            backgroundBlendMode: "darken",
                          }
                    }
                  >
                    <th className="p-4">Full Name</th>
                    <th className="p-4">
                      <div className="flex items-center justify-between min-w-[140px]">
                        <span>Email</span>
                        <ChevronsUpDown size={14} className="text-white/70" />
                      </div>
                    </th>
                    <th className="p-4">
                      <div className="flex items-center justify-between min-w-[120px]">
                        <span>Username</span>
                        <ChevronsUpDown size={14} className="text-white/70" />
                      </div>
                    </th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Date Of Subscription</th>
                    <th className="p-4">Subscription Plan</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>

                {/* ================= TABLE BODY ================= */}
                <tbody>
                  {subscriptionData.map((user, idx) => (
                    <tr
                      key={user.id}
                      className={`
                        text-[14px]
                        hover:bg-white/5
                        transition-colors
                        ${isDarkMode ? 'text-white border-b border-white/20' : 'text-black border-b border-gray-200'}
                      `}
                    >
                      {/* FULL NAME */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full border overflow-hidden shrink-0 ${isDarkMode ? 'border-white/50' : 'border-black/50'}`}>
                            <img
                              src={profileImages[idx]}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="font-semibold whitespace-nowrap">
                            {user.name}
                          </span>
                        </div>
                      </td>

                      {/* EMAIL */}
                      <td className="p-4">{user.email}</td>

                      {/* USERNAME */}
                      <td className="p-4">{user.username}</td>

                      {/* ROLE */}
                      <td className="p-4">{user.role}</td>

                      {/* DATE OF SUBSCRIPTION */}
                      <td className="p-4">{user.date}</td>

                      {/* SUBSCRIPTION PLAN */}
                      <td className="p-4 font-bold">{user.plan}</td>

                      {/* ACTIONS - Download Icon */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownloadClick(user)}
                            className={`cursor-pointer hover:scale-125 transition-transform p-1 ${isDarkMode ? 'text-white hover:text-gray-300' : 'text-gray-700 hover:text-gray-900'}`}
                          >
                            <Download size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ================= DOWNLOAD CONFIRMATION MODAL ================= */}
        {isDownloadModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div
              className={`w-full max-w-md rounded-[28px] px-8 py-10 text-center shadow-2xl
                ${isDarkMode ? "bg-[#1b1b1b]" : "bg-white"}
              `}
            >
              {/* ===== TITLE (TOP) ===== */}
              <h1
                className={`text-[54px] font-bold mb-6 font-bold trochut-font cursor-pointer
                  ${isDarkMode ? "text-white" : "text-[#2b163f]"}
                `}
                style={{ fontFamily: "serif" }}
              >
                Talenta
              </h1>

              {/* ===== ICON ===== */}
              <div className="flex justify-center mb-6">
                <img
                  src={DownloadIcon}
                  alt="download"
                  className="w-20 h-20"
                />
              </div>

              {/* ===== TEXT ===== */}
              <p
                className={`text-[17px] mb-10
                  ${isDarkMode ? "text-gray-300" : "text-gray-600"}
                `}
              >
                Are you sure you want to download this file
              </p>

              {/* ===== BUTTONS ===== */}
              <div className="flex justify-center gap-6">
                {/* Cancel */}
                <button
                  onClick={() => setIsDownloadModalOpen(false)}
                  className={`px-10 py-2.5 rounded-full text-[15px] font-medium transition
                    ${
                      isDarkMode
                        ? "!border border-gray-500 text-gray-300 hover:bg-gray-800"
                        : "!border border-black text-black hover:bg-gray-100"
                    }
                  `}
                >
                  Cancel
                </button>

                {/* Confirm */}
                <button
                  onClick={handleConfirmDownload}
                  className="px-10 py-2.5 rounded-full text-[15px] font-medium text-white
                           bg-gradient-to-r from-[#1a0b2e] via-[#3D1768] to-[#6a1bb1]
                           hover:opacity-90 transition"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SubscriptionPage;