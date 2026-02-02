import React, { useState, useEffect } from 'react';
// Make sure to replace this with your actual image path or a placeholder
import user2 from "../../assets/Adminimages/user2.png";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 
import { Users, BookMarked, CheckCircle2, Contact, ChevronLeft, ChevronRight, BarChart2, ArrowUp } from 'lucide-react';
import {
  ComposedChart, Line, CartesianGrid, Tooltip,
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

export default function Analytics() {
  
  // --- THEME STATE ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === "dark") return true;
    if (savedTheme === "light") return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const applyTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      let currentTheme;

      if (savedTheme) {
        currentTheme = savedTheme;
      } else {
        currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light";
      }

      setIsDarkMode(currentTheme === "dark");
    };

    // Apply theme immediately on mount
    applyTheme();

    // Listen for theme change from settings
    const handleThemeChange = () => {
      applyTheme();
    };

    window.addEventListener("theme-change", handleThemeChange);

    // Listen for system theme changes when no saved theme
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

  // --- STATE ---
  const [value, onChange] = useState(new Date(2025, 11, 6));

  // --- DATA ---
  const data = [
    { name: 'Jan', collaborator: 50000, creator: 28000, transactions: 40000 },
    { name: 'Feb', collaborator: 100000, creator: 90000, transactions: 80000 },
    { name: 'Mar', collaborator: 28000, creator: 22000, transactions: 22000 },
    { name: 'Apr', collaborator: 68000, creator: 50000, transactions: 82000 },
    { name: 'May', collaborator: 40000, creator: 22000, transactions: 42000 },
    { name: 'Jun', collaborator: 35000, creator: 22000, transactions: 22000 },
    { name: 'Jul', collaborator: 78000, creator: 60000, transactions: 38000 },
  ];

  const barData = [
    { name: 'Windows', value: 28000 },
    { name: 'Mac', value: 21000 },
    { name: 'Android', value: 29000 },
    { name: 'iOS', value: 13000 },
  ];
  const barColors = ['#4a235a', '#7d5a8f', '#3b0764', '#c0a6d3'];

  const donutData = [
    { name: 'United States', value: 52.1 },
    { name: 'Canada', value: 22.8 },
    { name: 'Mexico', value: 13.9 },
    { name: 'Other', value: 11.2 },
  ];
  const donutColors = ['#3b0764', '#7d5a8f', '#d8b4fe', '#a855f7'];

  const pieData = [
    { name: 'Creator', value: 60 },
    { name: 'Collaborator', value: 30 },
    { name: 'Platform Fees', value: 10 },
  ];
  const pieColors = ['#3b0764', '#bdbdbd', '#e9d5ff'];

  const yearlyData = {
    percentChange: 9.2,
    daysAgo: 31,
    total: 643,
    footerLabel: "12% Increase from last year"
  };

  const collaborators = [
    { id: 1, name: 'Jonh', username: 'joh210', email: 'John@gmailcom', date: '24 Apr 2021', amount: '$12,863.08', avatar: user2 },
    { id: 2, name: 'Leo', username: 'Leo03', email: 'Leo@gmailcom', date: '24 Apr 2021', amount: '$08,257.01', avatar: user2 },
    { id: 3, name: 'Charlotte', username: 'Cha47', email: 'Charl@gmailcom', date: '24 Apr 2021', amount: '$11,4544.32', avatar: user2 },
    { id: 4, name: 'Sophia', username: 'Sophia20', email: 'Sophia@gmailcom', date: '24 Apr 2021', amount: '$12,796.02', avatar: user2 },
    { id: 5, name: 'James', username: 'James2', email: 'James@gmailcom', date: '24 Apr 2021', amount: '$42,86.08', avatar: user2 }
  ];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="600">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <main className={`w-full max-w-full p-2 md:p-4 font-sans overflow-x-hidden mt-[-14px] ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      
      {/* ================= TOP STATS ROW ================= */}
      <h3 className={`
  font-outfit
  font-semibold
  text-[24px]
  leading-none
  tracking-normal
  ${isDarkMode ? 'text-white' : 'text-black'}
`}>Analytics & Revenue splits</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-14 mt-4 mb-6">
        
        {[
          { label: "Total revenue for this month", value: "$20,000", icon: <Users size={28} /> },
          { label: "Active Creators", value: "500", icon: <BookMarked size={28} /> },
          { label: "Active Collaborators", value: "2500", icon: <CheckCircle2 size={28} /> },
          { label: "Total Subscription this month", value: "350", icon: <Contact size={28} /> },
        ].map((item, i) => (
          <div
            key={i}
            className={`flex items-center p-5 rounded-xl shadow-lg ${isDarkMode ? 'text-white' : 'text-white'}`}
            style={{ 
              background: isDarkMode ? "linear-gradient(90deg, #0c0c0c 0%, #000000 100%)" : "linear-gradient(90deg, #3D1768 0%, #020202 100%)",
            }}
          >
            <div className="w-12 flex justify-center opacity-90">{item.icon}</div>
            <div className="flex-grow flex flex-col ">
              <h2 className="text-3xl font-medium poppins leading-none">{item.value}</h2>
              <p className="text-[10px] milonga-regular mt-2 opacity-80 tracking-wider">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MAIN CONTENT FLEX LAYOUT ================= */}
      <div className="flex flex-col xl:flex-row gap-1 items-start w-full">
        
        {/* === LEFT COLUMN === */}
        {/* Forced to 720px width on large screens to match your specific chart/table requirements */}
       <div className="w-full xl:flex-[2] flex flex-col gap-6 min-w-0">
            
    {/* 1. USERS OVERVIEW CHART */}
    <div className={`p-6 rounded-xl shadow-sm w-full h-[420px] ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
       <div className="mb-6 flex flex-col">
    <h2 className={`text-lg font-bold font-outfit mb-4 uppercase tracking-wide ${isDarkMode ? 'text-white' : 'text-[#4B5563]'}`}>USERS OVERVIEW</h2>
    <div className="flex items-center gap-8">
        
        {/* Collaborator: Dark Purple Ring */}
        <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full !border-[4px] !border-[#3b0764]"></div>
            <span className={`font-outfit font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Collaborator</span>
        </div>

        {/* Creator: Light Purple/Gray Ring */}
        <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full !border-[4px] !border-[#9ca3af] opacity-80"></div>
            <span className={`font-outfit font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Creator</span>
        </div>

        {/* Transactions: Dark Purple Ring */}
        <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full !border-[4px] !border-[#3b0764]"></div>
            <span className={`font-outfit font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Transactions</span>
        </div>

    </div>
</div>

        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 2 }}>
                <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(61, 23, 104, 0.45)', fontSize: 14, dy: 15 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(61, 23, 104, 0.45)', fontSize: 14, dx: -10 }} ticks={[0, 25000, 50000, 80000, 100000]} tickFormatter={(value) => value === 0 ? '0' : `${value / 1000}K`} domain={[0, 100000]} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="collaborator" barSize={6} fill="#3b0764" radius={[10, 10, 0, 0]} />
                <Bar dataKey="creator" barSize={6} fill="rgba(61, 23, 104, 0.45)" radius={[10, 10, 0, 0]} />
                <Line type="monotone" dataKey="transactions" stroke="#3b0764" strokeWidth={2} strokeDasharray="6 6" dot={false} activeDot={{ r: 6, fill: "#3b0764", stroke: "white", strokeWidth: 2 }} />
            </ComposedChart>
            </ResponsiveContainer>
        </div>
    </div>

    {/* 2. TOP COLLABORATOR TABLE */}
    <div className={`rounded-xl shadow-sm overflow-hidden w-full h-[430px] ${isDarkMode ? 'bg-black' : 'bg-white'}`}>

    {/* Header - Fixed height (78px) */}
    <div className={`h-[78px] px-8 flex items-center border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className={`text-xl font-outfit font-bold tracking-tight ${isDarkMode ? 'text-gray-200' : 'text-slate-700'}`}>Top Collaborator</h2>
    </div>
    <div className={`w-full h-[1px] ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`}></div>
    
    {/* Table Rows Container */}
    <div className="px-8 flex flex-col h-[352px]"> 
        {collaborators.map((user) => (
        <div key={user.id} className={`flex items-center flex-1 border-b last:border-0 transition-colors ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-50 hover:bg-gray-50'}`}>
            
            {/* Column 1: Avatar & Identity */}
            <div className="flex items-center w-[35%]">
                <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-11 h-11 rounded-full object-cover mr-4 border border-gray-100 shadow-sm" 
                />
                <div className="flex flex-col">
                    <span className={`font-medium font-outfit text-[15px] leading-tight mb-0.5 ${isDarkMode ? 'text-gray-200' : 'text-slate-800'}`}>{user.name}</span>
                    <span className={`text-sm font-outfit leading-tight ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>{user.username}</span>
                </div>
            </div>

            {/* Column 2: Email & Date */}
            <div className="flex flex-col w-[40%] pl-2">
                <span className={`font-outfit text-[15px] leading-tight mb-0.5 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>{user.email}</span>
                <span className={`font-outfit text-sm leading-tight ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>{user.date}</span>
            </div>

            {/* Column 3: Amount */}
            <div className="w-[25%] text-right">
                <span className={`font-outfit font-semibold text-[15px] tracking-wide ${isDarkMode ? 'text-gray-200' : 'text-slate-800'}`}>{user.amount}</span>
            </div>

        </div>
        ))}
    </div>
    </div>

</div>

        {/* === RIGHT COLUMN (Calendar & Sidebar) === */}
        {/* Fixed width 380px as requested */}
        <div className="w-full xl:flex-[1] min-w-0">
     <div className={`rounded-xl shadow-sm relative w-full min-h-[850px] p-6 pb-20 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
        
        {/* Calendar Styles */}
       <style>{`
    .react-calendar { width: 100%; border: none; background: transparent; font-family: ui-sans-serif, system-ui, sans-serif; margin-bottom: 1rem; }
    
    /* Navigation Container */
    .react-calendar__navigation { display: flex; margin-bottom: 1.5rem; height: 22px; align-items: center; gap: 10px; }
    
    /* Month Label: Order 1 (First/Left) */
    .react-calendar__navigation__label { 
    order: 1; 
    text-align: left; 
    font-weight: 600; 
    font-size: 1.1rem; 
    color: #4B5563; 
    background: none !important; 
    padding-left: 0; 
    flex-grow: 1; 
    pointer-events: none; 
    }

    /* Arrow Buttons: Order 2 (Second/Right) */
    .react-calendar__navigation__arrow { 
    order: 2;
    width: 26px; /* Decreased width */
    height: 26px;    /* Decreased height */
    background: rgba(61, 23, 104, 0.45) !important; 
    border-radius: 50%; 
    color: white; 
    font-size: 1.2rem; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    margin-left: 15px; /* Added more gap between buttons */
    transition: opacity 0.2s;
    }
    
    .react-calendar__navigation__arrow:hover { opacity: 0.8; }

    /* Weekday Headers */
    .react-calendar__month-view__weekdays { text-align: center; font-weight: 600; font-size: 0.8rem; color: #9CA3AF; margin-bottom: 1rem; text-decoration: none !important; }
    .react-calendar__month-view__weekdays__weekday abbr { text-decoration: none; cursor: default; }

    /* Day Tiles */
    .react-calendar__tile { height: 40px; width: 40px; display: flex; align-items: center; justify-content: center; font-weight: 500; font-size: 0.9rem; color: #1F2937; background: none; margin-bottom: 2px; border-radius: 50%; }
    .react-calendar__tile:enabled:hover { background-color: #F3F4F6; }

    /* Selected Day (Purple Circle, White Text) */
    .react-calendar__tile--active,
    .react-calendar__tile--active:enabled:hover,
    .react-calendar__tile--active:enabled:focus { 
    background: #3b0764 !important; 
    color: white !important; 
    }

    /* Current Day (Today) - Purple Text */
    .react-calendar__tile--now { 
    background: transparent; 
    color: #3b0764; 
    font-weight: bold; 
    }

    /* FIX: When Today is ALSO Selected -> White Text on Purple Background */
    .react-calendar__tile--now.react-calendar__tile--active {
    background: #3b0764 !important;
    color: white !important;
    }
    
    /* Hide double arrows */
    .react-calendar__navigation__prev2-button, .react-calendar__navigation__next2-button { display: none; }
    `}</style>

    {/* Calendar Component */}
    <Calendar
        onChange={onChange}
        value={value}
        formatShortWeekday={(locale, date) => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()]}
        // Reduced icon size to 14 to fit the smaller buttons
        nextLabel={<ChevronRight size={10} strokeWidth={3} />}
        prevLabel={<ChevronLeft size={10} strokeWidth={3} />}
        showNeighboringMonth={false}
        locale="en-US"
        view="month"
    />

    
        <div className="mt-6 flex flex-col gap-8">
             {/* Completed Tasks Header */}
             <div className="flex items-center justify-between">
                <h3 className={`font-outfit text-lg font-semibold ${isDarkMode ? 'text-gray-400' : 'text-[#6B7280]'}`}>Completed Tasks</h3>
                <div className="flex gap-2">
                     <div className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-[rgba(61,23,104,0.45)] text-gray-500'}`}>
                        <ChevronLeft size={16} strokeWidth={3} />
                     </div>
                     <div className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-[rgba(61,23,104,0.45)] text-gray-500'}`}>
                        <ChevronRight size={16} strokeWidth={3} />
                     </div>
                </div>
            </div>

            {/* Progress Bars */}
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className={`font-outfit font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>Total Tasks Completed</span>
                        <span className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>92 of 100</span>
                    </div>
                    <div className={`w-full rounded-full h-4 overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div className="bg-[#3b0764] h-4 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className={`font-outfit font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>Tasks On-time</span>
                        <span className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>88 of 100</span>
                    </div>
                    <div className={`w-full rounded-full h-4 overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div className={`h-4 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-[rgba(61,23,104,0.45)]'}`} style={{ width: '88%' }}></div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className={`font-outfit font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>Tasks Late</span>
                        <span className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>18 of 100</span>
                    </div>
                    <div className={`w-full rounded-full h-4 overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div className="bg-[#F87171] h-4 rounded-full" style={{ width: '18%' }}></div>
                    </div>
                </div>
            </div>

            {/* Tasks This Year */}
            <div className="mt-4">
                <h4 className={`font-outfit font-semibold text-sm ${isDarkMode ? 'text-gray-400' : 'text-[#6B7280]'}`}>Tasks This Year</h4>
                <div className="flex justify-between items-end">
                    <div className={`border p-3 rounded-lg shadow-sm flex flex-col justify-center min-w-[100px] ${isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-100 bg-white'}`}>
                        <div className="text-[#3b0764] font-bold text-2xl flex items-center mb-1">
                            <ArrowUp size={20} strokeWidth={3} className="mr-1" />
                            {yearlyData.percentChange}%
                        </div>
                        <div className={`text-[9px] font-outfit font-bold tracking-wider uppercase ${isDarkMode ? 'text-gray-500' : 'text-[#9CA3AF]'}`}>
                            {yearlyData.daysAgo} DAYS AGO
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`text-[4rem] font-light leading-none tracking-tight ${isDarkMode ? 'text-gray-300' : 'text-[#6B7280]'}`}>
                            {yearlyData.total}
                        </div>
                        <div className={`font-outfit text-sm font-medium mt-1 ${isDarkMode ? 'text-gray-500' : 'text-[#9CA3AF]'}`}>
                            Tasks This Year
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Purple Footer Bar */}
        <div className="absolute bottom-0 left-0 w-full bg-[#3b0764] h-14 flex items-center justify-between px-6 rounded-b-xl">
            <span className="text-white font-outfit font-semibold text-sm">{yearlyData.footerLabel}</span>
            <div className="bg-white/20 p-1.5 rounded hover:bg-white/30 cursor-pointer">
                <BarChart2 size={20} className="text-white" />
            </div>
        </div>

     </div>
</div>

      </div>


          {/* 3. BOTTOM 3 CHARTS ROW */}
            {/* Adjusted to grid-cols-3 and w-full to fit perfectly inside the 720px column */}
            {/* 3. BOTTOM 3 CHARTS ROW */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full min-h-[300px] mt-10">
    
    {/* Chart 1: Traffic by Device */}
    <div className={`rounded-xl p-5 shadow-sm flex flex-col ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
        <h3 className={`text-[15px] font-outfit font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-slate-900'}`}>Traffic by Device</h3>
        <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11, dy: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(value) => value === 0 ? 0 : `${value / 1000}K`} domain={[0, 32000]} ticks={[0, 10000, 20000, 30000]} />
                <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={24}>
                {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                ))}
                </Bar>
            </BarChart>
            </ResponsiveContainer>
        </div>
    </div>

    {/* Chart 2: Traffic by Location */}
    <div className={`rounded-xl p-5 shadow-sm flex flex-col ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
        <h3 className={`font-outfit text-[15px] font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-slate-900'}`}>Traffic by Location</h3>
        <div className="flex-grow flex items-center">
            <div className="w-[55%] h-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie 
                            data={donutData} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={35} /* Increased size */
                            outerRadius={60} /* Increased size */
                            paddingAngle={3} 
                            dataKey="value" 
                            stroke="none"
                        >
                        {donutData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={donutColors[index % donutColors.length]} />
                        ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="w-[45%] pl-2">
                <ul className="flex flex-col gap-3"> {/* Increased gap */}
                    {donutData.map((entry, index) => (
                        <li key={index} className="flex items-center justify-between w-full text-xs">
                            <div className="flex items-center">
                                <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: donutColors[index] }}></span>
                                <span className={`font-outfit font-semibold text-[11px] truncate max-w-[60px] ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>{entry.name}</span> {/* Increased font */}
                            </div>
                            <span className={`font-medium text-[11px] ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>{entry.value}%</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </div>

    {/* Chart 3: Revenue Splits */}
    <div className={`rounded-xl p-5 shadow-sm flex flex-col border ${isDarkMode ? 'bg-black border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`font-outfit text-[15px] font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-slate-900'}`}>Revenue Splits</h3>
        <div className="flex-grow flex items-center">
            <div className="w-[55%] h-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie 
                            data={pieData} 
                            cx="50%" 
                            cy="50%" 
                            outerRadius={70} /* Increased size */
                            dataKey="value" 
                            labelLine={false} 
                            label={renderCustomizedLabel} 
                            stroke="white" 
                            strokeWidth={2}
                        >
                        {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="w-[45%] pl-2">
                <ul className="flex flex-col gap-3 justify-center"> {/* Increased gap */}
                    {pieData.map((entry, index) => (
                        <li key={index} className="flex items-center">
                            <span className="w-3.5 h-3.5 rounded-sm mr-2" style={{ backgroundColor: pieColors[index] }}></span> {/* Increased box */}
                            <span className={`font-outfit font-medium text-[11px] ${isDarkMode ? 'text-gray-200' : 'text-slate-800'}`}>{entry.name}</span> {/* Increased font */}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </div>
</div>
    </main>
  );
}