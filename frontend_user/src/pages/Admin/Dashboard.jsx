import React, { useState, useEffect } from 'react';
import sidebarBg from "../../assets/Adminimages/sidebar.png";
import { 
  LayoutGrid, User, Ticket, LineChart, Settings, 
  LogOut, Users, BookMarked, CheckCircle2, Contact, 
  ChevronDown, TrendingUp, Bell, Menu, X, Sun, Moon 
} from 'lucide-react';
import c1 from "../../assets/Adminimages/c1.png";
import c2 from "../../assets/Adminimages/c2.png";
import c3 from "../../assets/Adminimages/c3.png";
import c4 from "../../assets/Adminimages/c4.png";
import c5 from "../../assets/Adminimages/c5.png";
import topProfile from "../../assets/Adminimages/topprofile.png";
import logoutpic from "../../assets/Adminimages/logoutpic.png";
import UserPage from './User';
import SubscriptionPage from './AdminSubscription';
import Analytics from './Analytics';
import Setting from './Setting';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  // ✅ Track theme locally (IMPORTANT)
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") return true;
    if (savedTheme === "light") return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  

  // 🌙 APPLY + SYNC THEME (GLOBAL CONTROLLER)
  useEffect(() => {
    const applyTheme = () => {
      const savedTheme = localStorage.getItem("theme");
      let currentTheme;

      if (savedTheme) {
        currentTheme = savedTheme;
      } else {
        // Check system preference when no saved theme
        currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light";
      }

      setTheme(currentTheme);
      setIsDarkMode(currentTheme === "dark");

      // Apply theme to document
      if (currentTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    // Apply theme immediately on mount
    applyTheme();

    // listen for theme change from settings
    const handleThemeChange = () => {
      applyTheme();
    };

    window.addEventListener("theme-change", handleThemeChange);

    // listen for system theme changes when no saved theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (!localStorage.getItem("theme")) {
        applyTheme();
      }
    };
    mediaQuery.addEventListener('change', handleSystemChange);

    return () => {
      window.removeEventListener("theme-change", handleThemeChange);
      mediaQuery.removeEventListener('change', handleSystemChange);
    };
  }, []);

  const handleNavigation = (viewName) => {
    setCurrentView(viewName);
    setIsSidebarOpen(false);
  };

  // ✅ Sidebar link class (light + dark safe)
  const getSidebarLinkClass = (viewName) => {
    const isActive = currentView === viewName;

    return `
      flex items-center gap-3 px-4 py-3 rounded-full cursor-pointer transition-all
      ${
        isActive
          ? "bg-[#3b0764] text-white"
          : isDarkMode ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"
      }
    `;
  };

  return (
    <div
      className={`
        min-h-screen flex relative
        ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}
        transition-colors duration-300
      `}
    >
{/* SIDEBAR */}
<aside
  className={`fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col justify-between
    transition-transform duration-300 transform
    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0 lg:static lg:shrink-0
    text-white
  `}
  style={{
    backgroundImage: `url(${sidebarBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }}
>





  {/* 🌙 DARK MODE OVERLAY */}
  {isDarkMode && (
    <div className="absolute inset-0 bg-black/70 z-0" />
  )}

  





{/* 🪟 GLASS BLACK OVERLAY */}
<div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" />


  {/* CONTENT */}
  <div
    className="relative z-10 flex flex-col h-full"
    style={{ textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}
  >
        {/* LOGO / HEADER */}
<div
  className={`
    px-6 py-6 text-2xl font-bold flex justify-between items-center
    ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}
    border-b border-black/10 dark:border-white/10
    transition-colors duration-300
  `}
>
  <h1
    className={`
      font-bold trochut-font cursor-pointer
      text-[24px] md:text-[34px] leading-[100%]
      ${isDarkMode ? 'text-white' : 'text-[#3D1768]'}
    `}
  >
    Talenta
  </h1>

  <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
    <X size={24} className="text-black dark:text-white" />
  </button>
</div>
          {/* MENU */}
          <div className="px-4 py-6 flex-1 overflow-y-auto">
            <p className="text-xs uppercase tracking-wider opacity-70 mb-4">
              Main Menu
            </p>

            <nav className="space-y-2 text-sm">
              <div
                onClick={() => handleNavigation("dashboard")}
                className={getSidebarLinkClass("dashboard")}
              >
                <LayoutGrid size={24} strokeWidth={2.5} />
                <span className="font-medium">Dashboard</span>
              </div>

              <div
                onClick={() => handleNavigation("users")}
                className={getSidebarLinkClass("users")}
              >
                <User size={24} strokeWidth={2.5} />
                <span className="font-medium">Users</span>
              </div>

              <div
                onClick={() => handleNavigation("subscription")}
                className={getSidebarLinkClass("subscription")}
              >
                <Ticket size={24} strokeWidth={2.5} />
                <span className="font-medium">Subscription and plan</span>
              </div>

              <div
                onClick={() => handleNavigation("analytics")}
                className={getSidebarLinkClass("analytics")}
              >
                <LineChart size={24} strokeWidth={2.5} />
                <span className="font-medium">
                  Analytics & Revenue splits
                </span>
              </div>

              <div
                onClick={() => handleNavigation("setting")}
                className={getSidebarLinkClass("setting")}
              >
                <Settings size={24} strokeWidth={2.5} />
                <span className="font-medium">Settings</span>
              </div>
            </nav>
          </div>

          {/* LOGOUT */}
          <div
            onClick={() => setShowLogoutPopup(true)}
            className="flex items-center gap-3 px-6 py-4 cursor-pointer
              text-red-500 hover:bg-black/10 dark:hover:bg-white/10"
            style={{
              background: "rgba(61, 23, 104, 0.7)",
              borderRadius: "0px",
            }}
          >
            <LogOut size={22} strokeWidth={2.5} className="rotate-180" />
            <span className="text-lg font-medium">Log Out</span>
          </div>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}


{/* ================= MAIN CONTENT ================= */}
<main
  className={`
    flex-1 overflow-y-auto w-full
    ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}
  `}
>



{/* TOP BAR */}
<div
  className={`
    px-4 lg:px-8 py-4 mb-6 sticky top-0 z-30
    ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}
    transition-colors duration-300
  `}
  style={{ borderBottom: "1px solid rgba(229, 229, 229, 0.3)" }}
>
  <div className="flex justify-between lg:justify-end items-center">
    {/* Mobile Menu Button */}
    <button className="lg:hidden p-2" onClick={() => setIsSidebarOpen(true)}>
      <Menu size={24} className="text-black dark:text-white" />
    </button>

   <div className="flex items-center gap-4 lg:gap-6">
  <Bell 
    size={24} 
    className={`
      cursor-pointer
      ${isDarkMode ? 'text-white' : 'text-black'}
    `}
  />
  <div className="flex items-center gap-3">
    <span className={`
      text-lg lg:text-xl font-medium
      ${isDarkMode ? 'text-white' : 'text-black'}
    `}>
      Julie
    </span>
    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-gray-600 shadow-sm">
      <img
        src={topProfile}
        alt="Admin Profile"
        className="w-full h-full object-cover"
      />
    </div>
  </div>
</div>
  </div>
</div>


<div
  className={`
    px-4 lg:px-8 pb-8
    ${isDarkMode ? 'bg-transparent text-white' : 'bg-[#f7f7fb] text-black'}
    transition-colors duration-300
  `}
>
  {/* ================= DYNAMIC CONTENT SWITCH ================= */}
  {currentView === 'dashboard' && (
    <>
      {/* ================= WELCOME HEADER (DASHBOARD ONLY) ================= */}
      <h1 className={`text-xl lg:text-2xl font-semibold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
        Welcome back, Julie! 👋
      </h1>

{/* ================= STATS ================= */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  {[
    { label: "Total Users", value: "1824", icon: <Users size={26} /> },
    { label: "Active Projects", value: "18", icon: <BookMarked size={26} /> },
    { label: "Completed Task", value: "30", icon: <CheckCircle2 size={26} /> },
    { label: "Total Revenue", value: "$35,741", icon: <Contact size={26} /> },
  ].map((item, i) => (
    <div
      key={i}
      className={`
        flex items-center gap-4 p-5 rounded-xl
        text-white border outline outline-1
        shadow-[inset_0_0_0_1px_rgba(255,255,255,0.9)]
        transition-all duration-300
        ${isDarkMode ? "bg-black" : ""}
      `}
      style={
        isDarkMode
          ? {}
          : {
              background:
                "linear-gradient(90deg, #3D1768 0%, #020202 100%)",
              backgroundBlendMode: "darken",
            }
      }
    >
      {/* Icon */}
      <div className="w-10 h-10 flex items-center justify-center">
        {item.icon}
      </div>

      {/* Text */}
      <div>
        <h2 className="text-2xl font-semibold leading-none">
          {item.value}
        </h2>
        <p className="text-xs mt-1 text-white/70 tracking-wide">
          {item.label}
        </p>
      </div>
    </div>
  ))}
</div>



{/* ================= CHARTS ROW ================= */}
<div
  className={`
    flex flex-col lg:flex-row gap-4 mb-8 w-full items-stretch
    ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}
    transition-colors duration-300
  `}
>

{/* =================1. TOTAL REVENUE CARD ================= */}
<div
  className="
    rounded-[24px] p-7 flex flex-col justify-between w-full lg:w-1/3
    text-white

    dark:bg-black dark:text-white
    dark:border dark:border-white
    dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.9)]

    transition-colors duration-300
  "
  style={{
    height: "300px",
    fontFamily: "sans-serif",
    ...(isDarkMode
      ? {}
      : {
          background: "linear-gradient(180deg, #8e4de8 0%, #8a46ee 100%)",
        }),
  }}
>
  <div>
    <div className="flex justify-between items-start">
      <h3 className="text-2xl font-semibold tracking-tight">
        Total Revenue
      </h3>
      <div className="flex items-center gap-1 text-sm text-white/70 font-medium">
        Yearly <ChevronDown size={16} />
      </div>
    </div>

    <p className="text-sm font-medium mt-4 text-white/70">
      December 2024
    </p>

    <div className="flex items-center gap-3 mt-2">
      <h3 className="text-4xl font-bold">$108.9k</h3>

      <div className="flex items-center gap-1.5 text-white font-bold">
        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
          <TrendingUp size={10} className="text-[#3D1768]" />
        </div>
        <span className="text-lg">2.3%</span>
      </div>
    </div>
  </div>

  {/* CHART */}
  <div className="relative h-32 w-full mt-4 flex items-end">
    <div className="absolute right-0 h-full flex flex-col justify-between text-[10px] font-bold py-1 text-white/50">
      <span>5k</span><span>4k</span><span>3k</span>
      <span>2k</span><span>1k</span><span>0</span>
    </div>

    <svg viewBox="0 0 400 100" className="w-[92%] h-full" preserveAspectRatio="none">
      {[0, 20, 40, 60, 80].map((line) => (
        <line
          key={line}
          x1="0"
          y1={line}
          x2="400"
          y2={line}
          stroke="white"
          opacity="0.15"
        />
      ))}

      <path
        d="M0,70 C40,75 60,55 90,65 C120,75 150,50 180,60 C210,70 240,40 270,10 C300,50 330,65 360,60 C380,55 400,30 400,30 L400,100 L0,100 Z"
        fill="rgba(101, 5, 228, 0.15)"
      />
      <path
        d="M0,70 C40,75 60,55 90,65 C120,75 150,50 180,60 C210,70 240,40 270,10 C300,50 330,65 360,60 C380,55 400,30 400,30"
        fill="none"
        stroke="white"
        strokeWidth="2"
      />
    </svg>
  </div>

  <div className="flex justify-between w-[92%] text-[9px] font-bold uppercase mt-4 text-white/60">
    {["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"].map(m => (
      <div key={m}>{m}</div>
    ))}
  </div>
</div>


{/* ================= PROJECT STATUS CARD ================= */}
<div
  className="
    rounded-[16px] flex flex-col overflow-hidden
    w-full lg:w-1/3

    /* LIGHT MODE */
    bg-white text-[#111827] border border-gray-200

    /* DARK MODE (NO CHANGE) */
    dark:bg-black dark:text-white
    dark:border dark:border-white
    dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.9)]

    transition-colors duration-300
  "
  style={{
    height: "300px",
    fontFamily: "sans-serif",
    ...(isDarkMode
      ? {}
      : {
          background: "linear-gradient(180deg, #8e4de8 0%, #8a46ee 100%)",
        }),
  }}

>
  {/* ================= HEADER ================= */}
  <div className="px-5 pt-4 pb-3">
    <h3 className="text-[18px] font-semibold text-[#111827] dark:text-white mb-3">
      Project Status
    </h3>

    <div className="flex gap-2">
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-medium bg-white text-[#111827] border border-gray-300">
        Metric <ChevronDown size={14} />
      </button>

      <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-medium bg-white text-[#111827] border border-gray-300">
        Today <ChevronDown size={14} />
      </button>
    </div>
  </div>

  {/* DIVIDER */}
  <div className="w-full h-px bg-gray-200 dark:bg-white/30" />

 {/* ================= BODY ================= */}
<div className="flex flex-1 items-center px-5 gap-6">
  {/* DONUT CHART */}
  <div className="relative flex items-center justify-center shrink-0" style={{ width: '180px', height: '180px' }}>
    {/* DONUT CHART - Light Mode */}
    {!isDarkMode && (
      <div className="relative w-full h-full">
        {/* Background circle for In Progress (40%) */}
        <div
          className="absolute w-full h-full rounded-full"
          style={{
            border: '32.4px solid #F1F0F5',
            boxSizing: 'border-box',
          }}
        />
        
        {/* Completed segment (60%) - Purple with opacity */}
        <div
          className="absolute w-full h-full rounded-full"
          style={{
            border: '32.4px solid transparent',
            borderTopColor: '#700edf9e',
            borderRightColor: '#dae6d89e',
            borderBottomColor: '#3D17689E',
            borderLeftColor: '#c69c669e',
            transform: 'rotate(-90deg)',
            clipPath: 'polygon(0 0, 100% 0, 100% 60%, 0 60%)',
            boxSizing: 'border-box',
          }}
        />
        
        {/* On Hold segment (10%) - Light green */}
        <div
          className="absolute w-full h-full rounded-full"
          style={{
            border: '32.4px solid transparent',
            borderTopColor: '#e5e8e3',
            borderRightColor: '#e5e8e3',
            borderBottomColor: '#e5e8e3',
            borderLeftColor: '#e5e8e3',
            transform: 'rotate(126deg)', // -90deg + 60% of 360deg = 126deg
            clipPath: 'polygon(0 0, 100% 0, 100% 10%, 0 10%)',
            boxSizing: 'border-box',
          }}
        />
      </div>
    )}

    {/* DONUT CHART - Dark Mode */}
    {isDarkMode && (
      <div className="relative w-full h-full">
        {/* Background circle for In Progress (40%) */}
        <div
          className="absolute w-full h-full rounded-full"
          style={{
            border: '32.4px solid #4A4A4A',
            boxSizing: 'border-box',
          }}
        />
        
        {/* Completed segment (60%) - White */}
        <div
          className="absolute w-full h-full rounded-full"
          style={{
            border: '32.4px solid transparent',
            borderTopColor: '#FFFFFF',
            borderRightColor: '#FFFFFF',
            borderBottomColor: '#FFFFFF',
            borderLeftColor: '#FFFFFF',
            transform: 'rotate(-90deg)',
            clipPath: 'polygon(0 0, 100% 0, 100% 60%, 0 60%)',
            boxSizing: 'border-box',
          }}
        />
        
        {/* On Hold segment (10%) - Light gray */}
        <div
          className="absolute w-full h-full rounded-full"
          style={{
            border: '32.4px solid transparent',
            borderTopColor: '#A0A0A0',
            borderRightColor: '#A0A0A0',
            borderBottomColor: '#A0A0A0',
            borderLeftColor: '#A0A0A0',
            transform: 'rotate(126deg)',
            clipPath: 'polygon(0 0, 100% 0, 100% 10%, 0 10%)',
            boxSizing: 'border-box',
          }}
        />
      </div>
    )}

    {/* CENTER TEXT */}
    <div className="absolute flex flex-col items-center justify-center bg-white dark:bg-black rounded-full" 
         style={{ width: '100px', height: '100px' }}>
      <span className="text-[24px] font-bold text-[#111827] dark:text-white">
        1,234
      </span>
      <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium text-center leading-tight">
        Project Status<br />Chart
      </span>
    </div>
  </div>

  {/* ================= LEGEND ================= */}
  <div className="flex flex-col gap-3 flex-1">
    {/* Completed - 60% */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#3D1768] dark:bg-white" />
        <span className="text-[12px] text-gray-700 dark:text-gray-300 font-medium">
          Completed
        </span>
      </div>
      <span className="text-[12px] font-semibold text-[#111827] dark:text-white">
        60%
      </span>
    </div>

    {/* On Hold - 10% */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#8B6FB3] dark:bg-[#A0A0A0]" />
        <span className="text-[12px] text-gray-700 dark:text-gray-300 font-medium">
          On Hold
        </span>
      </div>
      <span className="text-[12px] font-semibold text-[#111827] dark:text-white">
        10%
      </span>
    </div>

    {/* In Progress - 40% */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#F1F0F5] dark:bg-[#4A4A4A]" />
        <span className="text-[12px] text-gray-700 dark:text-gray-300 font-medium">
          In Progress
        </span>
      </div>
      <span className="text-[12px] font-semibold text-[#111827] dark:text-white">
        40%
      </span>
    </div>
  </div>
</div>
</div>



{/* 3. PROGRESS CARD */}
<div
  className="
    flex flex-col w-full lg:w-1/3
    bg-transparent
    transition-colors duration-300
    rounded-[8px]
  "
  style={{
    height: "300px",
    fontFamily: "sans-serif",
  }}
>
  {/* HEADER */}
  <div className="flex justify-between items-center mb-3">
    <div className="flex items-center gap-2">
      <h3 className={`text-[22px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1e293b]'}`}>
        Progress
      </h3>
      <div className="flex items-center text-[#3CD4A0] text-xs font-bold gap-0.5">
        <TrendingUp size={12} strokeWidth={3} />
        <span>+23.64</span>
      </div>
    </div>

    {/* TOGGLE */}
    <div className={`${isDarkMode ? 'bg-black border-white' : 'bg-white border-gray-300'} border p-0.5 rounded-full flex items-center`}>
      <button className={`${isDarkMode ? 'bg-white text-black' : 'bg-[#31135E] text-white'} text-[9px] px-3 py-1 rounded-full font-bold shadow-sm`}>
        Month
      </button>
      <button className={`text-[9px] px-3 py-1 rounded-full font-bold ${isDarkMode ? 'text-white/60' : 'text-[#64748B]'}`}>
        Week
      </button>
    </div>
  </div>

  {/* BODY */}
  <div
    className={`
      rounded-[22px] p-4 flex gap-3 h-full
      overflow-hidden items-stretch shadow-sm
      transition-colors duration-300
      ${isDarkMode 
        ? 'border border-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.9)]' 
        : 'bg-gradient-to-br from-[#F8F5FF] to-[#F0EBFF]'
      }
    `}
  >
    {/* LEFT STATS */}
    <div className="flex flex-col justify-between py-1 w-20 shrink-0">
      {[
        ["All Task", "108", "#3CD4A0"],
        ["Done", "108", "#FF8B66"],
        ["In Progress", "108", "#3CD4A0"],
      ].map(([l, v, c], i) => (
        <div key={i} className="flex flex-col">
          <span className={`text-[10px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1e293b]'}`}>
            {l}
          </span>
          <span className={`text-[22px] font-bold leading-tight ${isDarkMode ? 'text-white/60' : 'text-[#6D28D9]'}`}>
            {v}
          </span>
          <span
            className="text-[8px] font-bold flex items-center gap-0.5"
            style={{ color: c }}
          >
            <TrendingUp size={8} strokeWidth={3} /> +23.64%
          </span>
        </div>
      ))}
    </div>

    {/* BAR CHART */}
    <div className="flex-1 flex items-end justify-between gap-1 pb-1 relative h-full">
      {[
        { day: "1 Oct", h: "50%" },
        { day: "8 Oct", h: "30%" },
        { day: "15 Oct", h: "75%", active: true },
        { day: "21 Oct", h: "60%" },
        { day: "28 Oct", h: "60%" },
      ].map((item, i) => (
        <div
          key={i}
          className="flex flex-col items-center justify-end h-full w-full gap-2"
        >
          <div className="relative w-full flex flex-col items-center justify-end h-full">
            <div
              className={`
                w-full max-w-[22px] rounded-full
                ${isDarkMode 
                  ? (item.active ? 'bg-white' : 'bg-white/40')
                  : (item.active ? 'bg-[#6D28D9]' : 'bg-[#C4B5FD]')
                }
              `}
              style={{ height: item.h }}
            />
          </div>
          <span className={`text-[9px] font-bold whitespace-nowrap ${isDarkMode ? 'text-white/60' : 'text-[#1e293b]'}`}>
            {item.day}
          </span>
        </div>
      ))}
    </div>
  </div>
</div>
 </div>

{/* ================= ACTIVE PROJECTS ================= */}
<div
  className={`
    w-full mt-10
    ${isDarkMode ? 'bg-black rounded-[24px] p-6' : ''}
    transition-colors duration-300
  `}
>
  <div className="flex items-center gap-2 mb-4">
    <h3 className={`text-xl lg:text-[28px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}>
      Active projects
    </h3>
    <span className="text-gray-400 text-lg font-medium pt-1">(12)</span>
  </div>

  <div className="w-full border-t-2 border-gray-300 dark:border-white/30 mb-5" />

  <div className="w-full overflow-x-auto">
    <table className="w-full min-w-[800px] table-fixed border-collapse">
      <thead>
        <tr
          className={`
            ${isDarkMode ? 'bg-black text-white/70' : 'bg-[#f7f7f7] text-[#6B6B6B]'}
            text-left text-[14px] font-medium
          `}
        >
          <th className="py-5 pl-6 pr-2 w-[25%] rounded-l-xl">Client Name</th>
          <th className="py-5 px-4 w-[20%]">Project</th>
          <th className="py-5 px-4 w-[12%]">Price</th>
          <th className="py-5 px-4 w-[20%]">Delivered in</th>
          <th className="py-5 pr-6 pl-4 w-[23%] rounded-r-xl">Progress</th>
        </tr>
      </thead>

      <tbody>
        {[
          { name: "Steven Terry", id: "Steve03", project: "Landing page", price: "$800", time: "1 days 2 hours", progress: "90%", img: c1 },
          { name: "Audrey Jones", id: "Audre75", project: "Development", price: "$300", time: "4 days 8 hours", progress: "50%", img: c2 },
          { name: "Brian Fisher", id: "Bria10", project: "Translator", price: "$180", time: "14 days 2 hours", progress: "95%", img: c3 },
          { name: "Molly Mills", id: "Moll 210", project: "Data Analyst", price: "$920", time: "8 days 20 hours", progress: "20%", img: c4 },
          { name: "Orlando Versa", id: "Orlan 102", project: "Landing page", price: "$300", time: "4 days 2 hours", progress: "80%", img: c5 },
        ].map((row, i) => (
          <tr
            key={i}
            className={`
              transition-colors
              ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}
            `}
          >
            {/* CLIENT */}
            <td className={`py-6 pl-4 pr-2 shadow-[inset_0_-1.5px_0_${isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(180,180,180,0.6)'}]`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full overflow-hidden shrink-0 shadow-sm border ${isDarkMode ? 'border-white/30' : 'border-gray-100'}`}>
                  <img src={row.img} alt={row.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col truncate">
                  <span className={`font-bold text-[15px] truncate ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    {row.name}
                  </span>
                  <span className={`text-[10px] font-bold opacity-80 ${isDarkMode ? 'text-white/60' : 'text-[#3D1768]'}`}>
                    {row.id}
                  </span>
                </div>
              </div>
            </td>

            {/* PROJECT */}
            <td className={`py-6 px-4 shadow-[inset_0_-1.5px_0_${isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(180,180,180,0.6)'}] font-medium text-[15px] truncate ${isDarkMode ? 'text-white/80' : 'text-black'}`}>
              {row.project}
            </td>

            {/* PRICE */}
            <td className={`py-6 px-4 shadow-[inset_0_-1.5px_0_${isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(180,180,180,0.6)'}] font-bold text-[15px] ${isDarkMode ? 'text-white' : 'text-black'}`}>
              {row.price}
            </td>

            {/* TIME */}
            <td className={`py-6 px-4 shadow-[inset_0_-1.5px_0_${isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(180,180,180,0.6)'}] font-medium text-[14px] whitespace-nowrap ${isDarkMode ? 'text-white/70' : 'text-black'}`}>
              {row.time}
            </td>

            {/* PROGRESS */}
            <td className={`py-6 pr-4 pl-4 shadow-[inset_0_-1.5px_0_${isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(180,180,180,0.6)'}]`}>
              <div className="flex items-center gap-3">
                <div className={`flex-1 min-w-[60px] max-w-[120px] h-[6px] rounded-full overflow-hidden ${isDarkMode ? 'bg-white/20' : 'bg-[#F1F0F5]'}`}>
                  <div
                    className={`h-full rounded-full ${isDarkMode ? 'bg-white' : 'bg-[#3D1768]'}`}
                    style={{ width: row.progress }}
                  />
                </div>
                <span className={`font-bold text-xs min-w-[30px] ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  {row.progress}
                </span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

            </>
          )}

          {/* ================= USERS VIEW ================= */}
          {currentView === 'users' && (
            <UserPage />
          )}

          {/* ================= SUBSCRIPTION VIEW PLACEHOLDER ================= */}
          {currentView === 'subscription' && (
            <SubscriptionPage />
          )}

          {/* ================= analytics VIEW PLACEHOLDER ================= */}
          {currentView === 'analytics' && (
            <Analytics />
          )}

          {/* ================= setting VIEW PLACEHOLDER ================= */}
          {currentView === 'setting' && (
            <Setting />
          )}
          
           

        </div>
      </main>

      {/* ================= LOGOUT POPUP OVERLAY ================= */}
{showLogoutPopup && (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-[2px]">
    <div
      className={`
        rounded-[24px] flex flex-col items-center justify-center p-6 shadow-2xl relative
        animate-in fade-in zoom-in duration-200
        ${isDarkMode ? 'bg-black text-white !border !border-white/20' : 'bg-white text-black'}
      `}
      style={{ width: '370px', height: '300px' }}
    >
      <div className="mb-4">
        <img
          src={logoutpic}
          alt="User"
          className={`
            w-[100px] h-[100px] rounded-[20px] object-cover shadow-sm
            ${isDarkMode ? 'border border-white/20' : 'border border-gray-100'}
          `}
        />
      </div>

      <h3 className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-black'}`}>
        Logout
      </h3>

      <p className={`text-sm font-medium mb-8 ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
        Are you sure you want to logout?
      </p>

      <div className="flex gap-4 w-full justify-center px-2">
        <button
          onClick={() => setShowLogoutPopup(false)}
          className={`
            flex-1 py-2.5 rounded-full cursor-pointer font-medium transition-colors
            ${isDarkMode
              ? '!border !border-white text-white hover:bg-white/10'
              : 'border border-black text-black hover:bg-gray-50'}
          `}
        >
          Cancel
        </button>

        <button
          onClick={() => {
            console.log("Logged out");
            setShowLogoutPopup(false);
          }}
         className={`
    flex-1 py-2.5 rounded-full cursor-pointer font-medium transition-colors
    ${isDarkMode
      ? '!border !border-white text-white hover:bg-white/10'
      : 'text-white'}
  `}
  style={
    !isDarkMode
      ? { background: "linear-gradient(90deg, #020202 0%, #792ECE 100%)" }
      : undefined
  }
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default Dashboard;