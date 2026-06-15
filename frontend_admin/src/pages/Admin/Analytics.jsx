// import React, { useState, useEffect } from 'react';
// import user2 from "../../assets/Adminimages/user2.png";
// import Calendar from 'react-calendar';
// import 'react-calendar/dist/Calendar.css';
// import { Users, BookMarked, CheckCircle2, Contact, ChevronLeft, ChevronRight, BarChart2, ArrowUp } from 'lucide-react';
// import {
//   ComposedChart, Line, CartesianGrid, Tooltip,
//   BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
//   PieChart, Pie, Cell,
// } from 'recharts';
// import api from "../../utils/axiosConfig";

// export default function Analytics() {

//   // --- THEME STATE ---
//   const [isDarkMode, setIsDarkMode] = useState(() => {
//     const savedTheme = localStorage.getItem('theme');
//     if (savedTheme === "dark") return true;
//     if (savedTheme === "light") return false;
//     return window.matchMedia('(prefers-color-scheme: dark)').matches;
//   });

//   // --- STATE FOR REAL DATA ---
//   // FIX: Separate calendar states to prevent invalid highlighting
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [currentMonth, setCurrentMonth] = useState(new Date());
//   const [stats, setStats] = useState({
//     revenue_month: 0,
//     active_creators: 0,
//     active_collaborators: 0,
//     total_subs: 0
//   });
//   const [userOverviewData, setUserOverviewData] = useState([]);
//   const [taskPerformance, setTaskPerformance] = useState({
//     total_completed: 0,
//     total_target: 0,
//     on_time: 0,
//     late: 0,
//     tasks_this_year: 0,
//     growth: 0
//   });
//   const [trafficData, setTrafficData] = useState({
//     device: [],
//     location: []
//   });
//   const [revenueSplits, setRevenueSplits] = useState([]);
//   const [collaborators, setCollaborators] = useState([]);
//   const [yearlyData, setYearlyData] = useState({
//     percentChange: 0,
//     daysAgo: 31,
//     total: 0,
//     footerLabel: "0% Increase from last year"
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   // Colors for charts
//   const barColors = ['#4a235a', '#7d5a8f', '#3b0764', '#c0a6d3'];
//   const donutColors = ['#3b0764', '#7d5a8f', '#d8b4fe', '#a855f7'];
//   const pieColors = ['#3b0764', '#bdbdbd', '#e9d5ff'];

//   // --- CHECK AUTHENTICATION USING COOKIES ---
//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         // Verify authentication with server (cookie-based)
//         await api.get('/admin/verify');
//         setIsAuthenticated(true);
//       } catch (error) {
//         console.error('Authentication failed:', error);
//         setError('Please login to view analytics');
//         setIsAuthenticated(false);
//       }
//     };

//     checkAuth();
//   }, []);

//   // --- FETCH ALL DATA ---
//   useEffect(() => {
//     const fetchAllData = async () => {
//       if (!isAuthenticated) return;

//       setLoading(true);
//       setError(null);

//       try {
//         console.log('Fetching analytics data...');

//         const [
//           statsResponse,
//           overviewResponse,
//           taskResponse,
//           trafficResponse,
//           revenueResponse,
//           collaboratorsResponse
//         ] = await Promise.allSettled([
//           api.get('/admin/analytics/stats'),
//           api.get('/admin/analytics/user-overview'),
//           api.get('/admin/analytics/task-performance'),
//           api.get('/admin/analytics/traffic-data'),
//           api.get('/admin/analytics/revenue-splits'),
//           api.get('/admin/analytics/top-collaborators?limit=5')
//         ]);

//         // Handle Stats
//         if (statsResponse.status === 'fulfilled' && statsResponse.value?.data) {
//           const data = statsResponse.value.data;
//           setStats({
//             revenue_month: data.revenue_month || 0,
//             active_creators: data.active_creators || 0,
//             active_collaborators: data.active_collaborators || 0,
//             total_subs: data.total_subs || 0
//           });
//         }

//         // Handle User Overview Chart
//         if (overviewResponse.status === 'fulfilled' && overviewResponse.value?.data) {
//           const data = overviewResponse.value.data;
//           if (Array.isArray(data) && data.length > 0) {
//             const transformedData = data.map(item => ({
//               name: item.Month || '',
//               collaborator: item.Collaborator || 0,
//               creator: item.Creator || 0,
//               transactions: item.Transactions || 0
//             }));
//             setUserOverviewData(transformedData);
//           } else {
//             setUserOverviewData([]);
//           }
//         }

//         // Handle Task Performance
//         if (taskResponse.status === 'fulfilled' && taskResponse.value?.data) {
//           const data = taskResponse.value.data;
//           const taskData = {
//             total_completed: data.total_completed || 0,
//             total_target: data.total_target || 0,
//             on_time: data.on_time || 0,
//             late: data.late || 0,
//             tasks_this_year: data.tasks_this_year || 0,
//             growth: data.growth || 0
//           };

//           setTaskPerformance(taskData);

//           // Format the yearly data
//           setYearlyData({
//             percentChange: data.growth || 0,
//             daysAgo: 31,
//             total: data.tasks_this_year ? `$${data.tasks_this_year.toFixed(2)}` : '$0.00',
//             footerLabel: `${(data.growth || 0).toFixed(1)}% Increase from last year`
//           });
//         }

//         // Handle Traffic Data
//         if (trafficResponse.status === 'fulfilled' && trafficResponse.value?.data) {
//           const data = trafficResponse.value.data;
//           console.log('Traffic data received:', data);

//           setTrafficData({
//             device: data.device || [],
//             location: data.location || []
//           });
//         } else {
//           // Fallback data
//           setTrafficData({
//             device: [
//               { name: "Windows", value: 4500 },
//               { name: "Mac", value: 2500 },
//               { name: "Android", value: 2000 },
//               { name: "iOS", value: 1000 }
//             ],
//             location: [
//               { name: "United States", value: 52.1 },
//               { name: "Canada", value: 22.8 },
//               { name: "Mexico", value: 13.9 },
//               { name: "Other", value: 11.2 }
//             ]
//           });
//         }

//         // Handle Revenue Splits
//         if (revenueResponse.status === 'fulfilled' && revenueResponse.value?.data) {
//           const data = revenueResponse.value.data;
//           console.log('Revenue splits received:', data);

//           let splitsData = [];

//           // Check if data has splits property or is directly the array
//           if (data.splits && Array.isArray(data.splits)) {
//             splitsData = data.splits;
//           } else if (Array.isArray(data)) {
//             splitsData = data;
//           } else {
//             // Fallback data - ensure values are numbers
//             splitsData = [
//               { name: "Platform Fees", value: 10 },
//               { name: "Creator", value: 60 },
//               { name: "Collaborator", value: 30 }
//             ];
//           }

//           // Ensure all values are numbers and add colors
//           // Step 1: calculate total
//           const total = splitsData.reduce((sum, item) => {
//             return sum + (Number(item.value) || 0);
//           }, 0);

//           // Step 2: convert to percentage
//           const formattedSplits = splitsData.map((item, index) => {
//             const rawValue = Number(item.value) || 0;

//             return {
//               name: item.name || 'Unknown',
//               value: total > 0 ? (rawValue / total) * 100 : 0,
//               color: pieColors[index % pieColors.length]
//             };
//           });

//           setRevenueSplits(formattedSplits);
//         } else {
//           // Fallback data with proper values
//           setRevenueSplits([
//             { name: "Platform Fees", value: 10, color: pieColors[0] },
//             { name: "Creator", value: 60, color: pieColors[1] },
//             { name: "Collaborator", value: 30, color: pieColors[2] }
//           ]);
//         }

//         // Handle Collaborators
//         if (collaboratorsResponse.status === 'fulfilled' && collaboratorsResponse.value?.data) {
//           const data = collaboratorsResponse.value.data;
//           if (Array.isArray(data) && data.length > 0) {
//             const transformedCollaborators = data.map((collab, index) => ({
//               id: index + 1,
//               name: collab.name || 'Unknown',
//               username: collab.email ? collab.email.split('@')[0] : 'user',
//               email: collab.email || '',
//               date: collab.joined_date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
//               amount: `$${collab.earnings?.toLocaleString() || '0'}`,
//               avatar: collab.profile_image || user2
//             }));
//             setCollaborators(transformedCollaborators);
//           } else {
//             setCollaborators([]);
//           }
//         }

//       } catch (err) {
//         console.error('Error fetching analytics data:', err);
//         setError(err.message || 'Failed to load analytics data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAllData();
//   }, [isAuthenticated]);

//   // Theme effect
//   useEffect(() => {
//     const applyTheme = () => {
//       const savedTheme = localStorage.getItem('theme');
//       let currentTheme;

//       if (savedTheme) {
//         currentTheme = savedTheme;
//       } else {
//         currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light";
//       }

//       setIsDarkMode(currentTheme === "dark");
//     };

//     applyTheme();

//     const handleThemeChange = () => {
//       applyTheme();
//     };

//     window.addEventListener("theme-change", handleThemeChange);

//     const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
//     const handleSystemChange = () => {
//       if (!localStorage.getItem("theme")) {
//         applyTheme();
//       }
//     };
//     mediaQuery.addEventListener('change', handleSystemChange);

//     return () => {
//       window.removeEventListener("theme-change", handleThemeChange);
//       mediaQuery.removeEventListener('change', handleSystemChange);
//     };
//   }, []);

//   // FIX: Calendar handler functions to prevent invalid selection and highlighting
//   const handleDateChange = (date) => {
//     setSelectedDate(date);
//   };

//   const handleActiveStartDateChange = ({ activeStartDate }) => {
//     // Update the current month when user navigates
//     setCurrentMonth(activeStartDate);

//     // IMPORTANT: Clear selected date if it's not in the new month
//     if (selectedDate) {
//       const isSelectedDateInNewMonth =
//         selectedDate.getMonth() === activeStartDate.getMonth() &&
//         selectedDate.getFullYear() === activeStartDate.getFullYear();

//       if (!isSelectedDateInNewMonth) {
//         // If the previously selected date is not in the new month, clear it
//         setSelectedDate(null);
//       }
//     }
//   };

//   const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
//     const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
//     const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
//     const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

//     // Only show label if percent is greater than 5%
//     if (percent * 100 < 5) return null;

//     return (
//       <text
//         x={x}
//         y={y}
//         fill="white"
//         textAnchor="middle"
//         dominantBaseline="central"
//         fontSize={12}
//         fontWeight="600"
//       >
//         {`${(percent * 100).toFixed(0)}%`}
//       </text>
//     );
//   };

//   // if (!isAuthenticated) {
//   //   return (
//   //     <main className={`w-full max-w-full p-2 md:p-4 font-sans overflow-x-hidden mt-[-14px] ${isDarkMode ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}>
//   //       <div className="flex items-center justify-center h-screen">
//   //         <div className="text-center">
//   //           <div className="text-red-500 text-xl mb-4">⚠️ Authentication Required</div>
//   //           <p className="text-gray-600">Please login to view analytics</p>
//   //         </div>
//   //       </div>
//   //     </main>
//   //   );
//   // }

//   if (loading) {
//     return (
//       <main className={`w-full max-w-full p-2 md:p-4 font-sans overflow-x-hidden mt-[-14px] ${isDarkMode ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}>
//         <div className="flex items-center justify-center h-screen">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-900 mx-auto"></div>
//             <p className="mt-4 text-gray-600">Loading analytics data...</p>
//           </div>
//         </div>
//       </main>
//     );
//   }

//   if (error) {
//     return (
//       <main className={`w-full max-w-full p-2 md:p-4 font-sans overflow-x-hidden mt-[-14px] ${isDarkMode ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}>
//         <div className="flex items-center justify-center h-screen">
//           <div className="text-center">
//             <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
//             <p className="text-gray-600">{error}</p>
//             <button
//               onClick={() => window.location.reload()}
//               className="mt-4 px-4 py-2 bg-purple-900 text-white rounded-lg hover:bg-purple-800"
//             >
//               Retry
//             </button>
//           </div>
//         </div>
//       </main>
//     );
//   }

//   return (
//     <main className={`w-full max-w-full p-2 md:p-4 font-sans overflow-x-hidden mt-[-14px] ${isDarkMode ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}>

//       {/* ================= TOP STATS ROW ================= */}
//       <h3 className={`
//         font-outfit
//         font-semibold
//         text-[24px]
//         leading-none
//         tracking-normal
//         ${isDarkMode ? 'text-white' : 'text-black'}
//       `}>Analytics & Revenue splits</h3>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-14 mt-4 mb-6">
//         {[
//           {
//             label: "Total revenue for this month",
//             value: `$${stats.revenue_month?.toLocaleString() || '0'}`,
//             icon: <Users size={28} />
//           },
//           {
//             label: "Active Creators",
//             value: stats.active_creators?.toString() || "0",
//             icon: <BookMarked size={28} />
//           },
//           {
//             label: "Active Collaborators",
//             value: stats.active_collaborators?.toString() || "0",
//             icon: <CheckCircle2 size={28} />
//           },
//           {
//             label: "Total Subscription this month",
//             value: stats.total_subs?.toString() || "0",
//             icon: <Contact size={28} />
//           },
//         ].map((item, i) => (
//           <div
//             key={i}
//             className={`flex items-center p-5 rounded-xl shadow-lg ${isDarkMode ? 'text-white' : 'text-white'}`}
//             style={{
//               background: isDarkMode ? "linear-gradient(90deg, #0c0c0c 0%, #000000 100%)" : "linear-gradient(90deg, #3D1768 0%, #020202 100%)",
//             }}
//           >
//             <div className="w-12 flex justify-center opacity-90">{item.icon}</div>
//             <div className="flex-grow flex flex-col">
//               <h2 className="text-3xl font-medium poppins leading-none">{item.value}</h2>
//               <p className="text-[10px] milonga-regular mt-2 opacity-80 tracking-wider">{item.label}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* ================= MAIN CONTENT FLEX LAYOUT ================= */}
//       <div className="flex flex-col xl:flex-row gap-6 items-start w-full">

//         {/* === LEFT COLUMN === */}
//         <div className="w-full xl:flex-[2] flex flex-col gap-6 min-w-0">

//           {/* 1. USERS OVERVIEW CHART */}
//           <div className={`p-6 rounded-xl shadow-sm w-full h-[420px] ${isDarkMode ? 'bg-black' : 'bg-gray-100'}`}>
//             <div className="mb-6 flex flex-col">
//               <h2 className={`text-lg font-bold font-outfit mb-4 uppercase tracking-wide ${isDarkMode ? 'text-white' : 'text-[#4B5563]'}`}>USERS OVERVIEW</h2>
//               <div className="flex items-center gap-8">
//                 <div className="flex items-center gap-3">
//                   <div className="w-4 h-4 rounded-full bg-[#3b0764]"></div>
//                   <span className={`font-outfit font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Collaborator</span>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <div className="w-4 h-4 rounded-full bg-[#9ca3af] opacity-80"></div>
//                   <span className={`font-outfit font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Creator</span>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <div className="w-4 h-0.5 bg-[#3b0764]"></div>
//                   <span className={`font-outfit font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Transactions</span>
//                 </div>
//               </div>
//             </div>

//             <div className="h-[300px] w-full">
//               <ResponsiveContainer width="100%" height="100%">
//                 <ComposedChart
//                   data={userOverviewData.length > 0 ? userOverviewData : [{ name: 'Jan', collaborator: 0, creator: 0, transactions: 0 }]}
//                   margin={{ top: 20, right: 20, bottom: 20, left: 2 }}
//                 >
//                   <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#E5E7EB" />
//                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#9CA3AF' : 'rgba(61, 23, 104, 0.45)', fontSize: 14, dy: 15 }} />
//                   <YAxis
//                     axisLine={false}
//                     tickLine={false}
//                     tick={{ fill: isDarkMode ? '#9CA3AF' : 'rgba(61, 23, 104, 0.45)', fontSize: 14, dx: -10 }}
//                     tickFormatter={(value) => value === 0 ? '0' : `${value / 1000}K`}
//                   />
//                   <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
//                   <Bar dataKey="collaborator" barSize={6} fill="#3b0764" radius={[10, 10, 0, 0]} />
//                   <Bar dataKey="creator" barSize={6} fill="rgba(61, 23, 104, 0.45)" radius={[10, 10, 0, 0]} />
//                   <Line type="monotone" dataKey="transactions" stroke="#3b0764" strokeWidth={2} strokeDasharray="6 6" dot={false} activeDot={{ r: 6, fill: "#3b0764", stroke: "white", strokeWidth: 2 }} />
//                 </ComposedChart>
//               </ResponsiveContainer>
//             </div>
//           </div>

//           {/* 2. TOP COLLABORATOR TABLE */}
//           <div className={`rounded-xl shadow-sm overflow-hidden w-full h-[430px] ${isDarkMode ? 'bg-black' : 'bg-gray-100'}`}>
//             <div className={`h-[78px] px-8 flex items-center border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
//               <h2 className={`text-xl font-outfit font-bold tracking-tight ${isDarkMode ? 'text-gray-200' : 'text-slate-700'}`}>Top Collaborator</h2>
//             </div>
//             <div className={`w-full h-[1px] ${isDarkMode ? 'bg-gray-100/10' : 'bg-black/10'}`}></div>

//             <div className="px-8 flex flex-col h-[352px] overflow-y-auto">
//               {collaborators.length > 0 ? collaborators.map((user) => (
//                 <div key={user.id} className={`flex items-center py-3 border-b last:border-0 transition-colors ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-50 hover:bg-gray-50'}`}>
//                   <div className="flex items-center w-[35%]">
//                     <img
//                       src={user.avatar}
//                       alt={user.name}
//                       className="w-11 h-11 rounded-full object-cover mr-4 border border-gray-100 shadow-sm"
//                       onError={(e) => { e.target.src = user2; }}
//                     />
//                     <div className="flex flex-col">
//                       <span className={`font-medium font-outfit text-[15px] leading-tight mb-0.5 ${isDarkMode ? 'text-gray-200' : 'text-slate-800'}`}>{user.name}</span>
//                       <span className={`text-sm font-outfit leading-tight ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>{user.username}</span>
//                     </div>
//                   </div>

//                   <div className="flex flex-col w-[40%] pl-2">
//                     <span className={`font-outfit text-[15px] leading-tight mb-0.5 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>{user.email}</span>
//                     <span className={`font-outfit text-sm leading-tight ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>{user.date}</span>
//                   </div>

//                   <div className="w-[25%] text-right">
//                     <span className={`font-outfit font-semibold text-[15px] tracking-wide ${isDarkMode ? 'text-gray-200' : 'text-slate-800'}`}>{user.amount}</span>
//                   </div>
//                 </div>
//               )) : (
//                 <div className="flex items-center justify-center h-full">
//                   <p className={`text-gray-500 ${isDarkMode ? 'text-gray-400' : ''}`}>No collaborators found</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* === RIGHT COLUMN (Calendar & Sidebar) === */}
//         <div className="w-full xl:flex-[1] min-w-0">
//           <div className={`rounded-xl shadow-sm relative w-full min-h-[850px] p-6 pb-20 ${isDarkMode ? 'bg-black' : 'bg-gray-100'}`}>
//             {/* Calendar Container with fixed styling */}
//             <div
//               className="calendar-container mb-6 rounded-xl p-4"
//               style={{
//                 border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
//                 boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : 'none'
//               }}
//             >
//               <style>{`
//   .react-calendar {
//     width: 100%;
//     border: none;
//     background: transparent;
//     font-family: ui-sans-serif, system-ui, sans-serif;
//   }
  
//   /* Navigation styles */
//   .react-calendar__navigation {
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     margin-bottom: 1rem;
//     height: 40px;
//   }
  
//   .react-calendar__navigation button {
//     background: ${isDarkMode ? '#374151' : 'rgba(61, 23, 104, 0.1)'};
//     border: none;
//     border-radius: 50% !important;
//     width: 32px;
//     height: 32px;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     cursor: pointer;
//     transition: all 0.2s ease;
//   }
  
//   .react-calendar__navigation button:hover {
//     background: ${isDarkMode ? '#4B5563' : 'rgba(61, 23, 104, 0.2)'};
//     transform: scale(1.05);
//   }
  
//   .react-calendar__navigation__label {
//     font-weight: 600;
//     font-size: 1rem;
//     color: ${isDarkMode ? '#9CA3AF' : '#4B5563'};
//     background: transparent !important;
//     flex-grow: 1;
//     text-align: center;
//   }
  
//   /* Weekdays - 7 columns exactly */
//   .react-calendar__month-view__weekdays {
//     display: flex !important;
//     width: 100%;
//     margin-bottom: 8px;
//   }
  
//   .react-calendar__month-view__weekdays__weekday {
//     flex: 1 !important;
//     text-align: center;
//     font-weight: 600;
//     font-size: 0.75rem;
//     color: #9CA3AF;
//     padding: 8px 0;
//   }
  
//   .react-calendar__month-view__weekdays abbr {
//     text-decoration: none;
//     cursor: default;
//   }
  
//   /* Days grid - 7 columns exactly */
//   .react-calendar__month-view__days {
//     display: flex !important;
//     flex-wrap: wrap !important;
//     width: 100%;
//   }
  
//   /* Each day cell takes exactly 1/7th of the width */
//   .react-calendar__month-view__days__day {
//     flex: 0 0 14.2857% !important;
//     width: 14.2857% !important;
//     display: flex !important;
//     justify-content: center !important;
//     align-items: center !important;
//     padding: 4px;
//     box-sizing: border-box;
//   }
  
//   /* Tile styling */
//   .react-calendar__tile {
//     display: flex !important;
//     align-items: center !important;
//     justify-content: center !important;
//     font-weight: 500;
//     font-size: 0.85rem;
//     color: ${isDarkMode ? '#9CA3AF' : '#1F2937'};
//     background: transparent;
//     border: none;
//     border-radius: 50% !important;
//     cursor: pointer;
//     transition: all 0.2s ease;
//     width: 100%;
//     max-width: 40px;
//     height: auto;
//     aspect-ratio: 1 / 1;
//     margin: 0 auto;
//     padding: 0;
//   }
  
//   .react-calendar__tile:enabled:hover {
//     background-color: ${isDarkMode ? '#374151' : '#F3F4F6'};
//     transform: scale(1.05);
//   }
  
//   .react-calendar__tile--active,
//   .react-calendar__tile--active:enabled:hover,
//   .react-calendar__tile--active:enabled:focus {
//     background: #3b0764 !important;
//     color: white !important;
//     border-radius: 50% !important;
//   }
  
// .react-calendar__tile--now {
//   background: transparent !important;
//   color: inherit !important;
//   font-weight: normal !important;
//   border-radius: 50% !important;
// }
  
//   .react-calendar__tile--now.react-calendar__tile--active {
//     background: #3b0764 !important;
//     color: white !important;
//     border-radius: 50% !important;
//   }
  
//   /* Hide double arrow buttons */
//   .react-calendar__navigation__prev2-button,
//   .react-calendar__navigation__next2-button {
//     display: none !important;
//   }
  
//   /* FIX: Neighboring month days - completely non-clickable and no highlight */
//   .react-calendar__month-view__days__day--neighboringMonth {
//     color: ${isDarkMode ? '#4B5563' : '#D1D5DB'} !important;
//     cursor: default !important;
//     pointer-events: none !important;
//     opacity: 0.4 !important;
//   }
  
//   .react-calendar__month-view__days__day--neighboringMonth:hover {
//     background: transparent !important;
//     transform: none !important;
//     cursor: default !important;
//   }
  
//   /* Remove any default margins/padding that might break alignment */
//   .react-calendar__month-view {
//     padding: 0;
//     margin: 0;
//   }
  
//   /* Responsive */
//   @media (max-width: 640px) {
//     .react-calendar__tile {
//       font-size: 0.75rem;
//       max-width: 32px;
//     }
//     .react-calendar__navigation button {
//       width: 28px;
//       height: 28px;
//     }
//   }
// `}</style>

//               {/* FIX: Updated Calendar with proper handlers */}
//               <Calendar
//                 onChange={handleDateChange}
//                 value={selectedDate}
//                 activeStartDate={currentMonth}
//                 onActiveStartDateChange={handleActiveStartDateChange}

//                 tileDisabled={({ date, view }) => {
//                   if (view === "month") {
//                     return (
//                       date.getMonth() !== currentMonth.getMonth() ||
//                       date.getFullYear() !== currentMonth.getFullYear()
//                     );
//                   }
//                   return false;
//                 }}

//                 formatShortWeekday={(locale, date) =>
//                   ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()]
//                 }
//                 showNeighboringMonth={false}
//                 next2Label={null}
//                 prev2Label={null}


//               />
//             </div>

//             <div className="mt-6 flex flex-col gap-8">
//               <div className="flex items-center justify-between">
//                 <h3 className={`font-outfit text-lg font-semibold ${isDarkMode ? 'text-gray-400' : 'text-[#6B7280]'}`}>Completed Tasks</h3>
//                 <div className="flex gap-2">
//                   {/* Navigation buttons if needed */}
//                 </div>
//               </div>

//               {/* Progress Bars */}
//               <div
//                 className="space-y-6"
//                 style={{
//                   border: isDarkMode ? '1px solid rgba(107, 114, 128, 0.5)' : 'none',
//                   borderRadius: '12px',
//                   padding: isDarkMode ? '16px' : '0'
//                 }}
//               >
//                 <div>
//                   <div className="flex justify-between items-center mb-2">
//                     <span className={`font-outfit font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>Total Tasks Completed</span>
//                     <span className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>
//                       {taskPerformance.total_completed} of {taskPerformance.total_target}
//                     </span>
//                   </div>
//                   <div className={`w-full rounded-full h-4 overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
//                     <div
//                       className="bg-[#3b0764] h-4 rounded-full"
//                       style={{ width: taskPerformance.total_target > 0 ? `${(taskPerformance.total_completed / taskPerformance.total_target) * 100}%` : '0%' }}
//                     ></div>
//                   </div>
//                 </div>

//                 <div>
//                   <div className="flex justify-between items-center mb-2">
//                     <span className={`font-outfit font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>Tasks On-time</span>
//                     <span className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>
//                       {taskPerformance.on_time} of {taskPerformance.total_target}
//                     </span>
//                   </div>
//                   <div className={`w-full rounded-full h-4 overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
//                     <div
//                       className={`h-4 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-[rgba(61,23,104,0.45)]'}`}
//                       style={{ width: taskPerformance.total_target > 0 ? `${(taskPerformance.on_time / taskPerformance.total_target) * 100}%` : '0%' }}
//                     ></div>
//                   </div>
//                 </div>

//                 <div>
//                   <div className="flex justify-between items-center mb-2">
//                     <span className={`font-outfit font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>Tasks Late</span>
//                     <span className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>
//                       {taskPerformance.late} of {taskPerformance.total_target}
//                     </span>
//                   </div>
//                   <div className={`w-full rounded-full h-4 overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
//                     <div
//                       className="bg-[#F87171] h-4 rounded-full"
//                       style={{ width: taskPerformance.total_target > 0 ? `${(taskPerformance.late / taskPerformance.total_target) * 100}%` : '0%' }}
//                     ></div>
//                   </div>
//                 </div>
//               </div>

//               {/* Tasks This Year */}
//               <div className="mt-4">
//                 <div
//                   className="flex flex-col"
//                   style={{
//                     border: isDarkMode ? '1px solid #6B7280' : '1px solid #E5E7EB',
//                     borderRadius: '12px',
//                     padding: '12px'
//                   }}
//                 >
//                   <h4 className={`font-outfit font-semibold text-[9px] sm:text-[10px] mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-[#6B7280]'}`}>
//                     Tasks This Year
//                   </h4>
//                   <div className="flex justify-between items-center gap-2">
//                     <div
//                       className="p-2 rounded-lg shadow-sm flex flex-col justify-center flex-1"
//                       style={{
//                         border: isDarkMode ? '1px solid #6B7280' : 'none'
//                       }}
//                     >
//                       <div className="text-[#3D1768] font-bold text-base sm:text-xl flex items-center mb-0.5">
//                         <ArrowUp size={14} strokeWidth={3} className="mr-1 sm:w-5 sm:h-5" />
//                         {yearlyData.percentChange.toFixed(1)}%
//                       </div>
//                       <div className={`text-[7px] sm:text-[8px] font-outfit font-bold tracking-wider uppercase ${isDarkMode ? 'text-gray-500' : 'text-[#9CA3AF]'}`}>
//                         {yearlyData.daysAgo} DAYS AGO
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <div
//                         className={`font-light leading-tight tracking-tight ${isDarkMode ? 'text-gray-300' : 'text-[#6B7280]'}`}
//                         style={{ fontSize: '2.5rem' }}
//                       >
//                         {yearlyData.total}
//                       </div>
//                       <div className={`font-outfit font-medium text-[9px] sm:text-[10px] -mt-1 ${isDarkMode ? 'text-gray-500' : 'text-[#9CA3AF]'}`}>
//                         Tasks This Year
//                       </div>
//                     </div>
//                   </div>


//                   {/* Footer Bar inside border */}
//                   <div className={`w-full h-12 flex items-center justify-between px-2 rounded-b-xl ${isDarkMode ? 'bg-transparent' : 'bg-[#3b0764]'}`}>
//                     <span className={`font-outfit font-semibold text-xs whitespace-nowrap ${isDarkMode ? 'text-gray-400' : 'text-white'}`}>
//                       {yearlyData.footerLabel}
//                     </span>
//                     <div className={`p-1.5 rounded cursor-pointer ${isDarkMode ? 'bg-gray-700/50 hover:bg-gray-600/50' : 'bg-gray-100/20 hover:bg-gray-100/30'}`}>
//                       <BarChart2 size={14} className={`${isDarkMode ? 'text-gray-400' : 'text-white'}`} />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>


//           </div>
//         </div>
//       </div>

//       {/* 3. BOTTOM 3 CHARTS ROW */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full min-h-[300px] mt-10">

//         {/* Chart 1: Traffic by Device */}
//         <div className={`rounded-xl p-5 shadow-sm flex flex-col ${isDarkMode ? 'bg-black' : 'bg-gray-100'}`}>
//           <h3 className={`text-[15px] font-outfit font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-slate-900'}`}>Traffic by Device</h3>
//           <div className="flex-grow h-[200px]">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={trafficData.device.length > 0 ? trafficData.device : [{ name: 'No Data', value: 0 }]} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
//                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280', fontSize: 11, dy: 10 }} />
//                 <YAxis axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280', fontSize: 11 }} />
//                 <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={24}>
//                   {trafficData.device.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
//                   ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Chart 2: Traffic by Location */}
//         <div className={`rounded-xl p-5 shadow-sm flex flex-col ${isDarkMode ? 'bg-black' : 'bg-gray-100'}`}>
//           <h3 className={`font-outfit text-[15px] font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-slate-900'}`}>Traffic by Location</h3>
//           <div className="flex-grow flex items-center h-[200px]">
//             <div className="w-[55%] h-full relative">
//               <ResponsiveContainer width="100%" height="100%">
//                 <PieChart>
//                   <Pie
//                     data={trafficData.location.length > 0 ? trafficData.location : [{ name: 'No Data', value: 100 }]}
//                     cx="50%"
//                     cy="50%"
//                     innerRadius={35}
//                     outerRadius={60}
//                     paddingAngle={3}
//                     dataKey="value"
//                     stroke="none"
//                   >
//                     {(trafficData.location.length > 0 ? trafficData.location : [{ name: 'No Data', value: 100 }]).map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={donutColors[index % donutColors.length]} />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>
//             <div className="w-[45%] pl-2">
//               <ul className="flex flex-col gap-3">
//                 {trafficData.location.length > 0 ? trafficData.location.map((entry, index) => (
//                   <li key={index} className="flex items-center justify-between w-full text-xs">
//                     <div className="flex items-center">
//                       <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: donutColors[index] }}></span>
//                       <span className={`font-outfit font-semibold text-[11px] truncate max-w-[60px] ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>{entry.name}</span>
//                     </div>
//                     <span className={`font-medium text-[11px] ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>{entry.value}%</span>
//                   </li>
//                 )) : (
//                   <li className="text-xs text-gray-400">No data available</li>
//                 )}
//               </ul>
//             </div>
//           </div>
//         </div>

//         {/* Chart 3: Revenue Splits */}
//         <div className={`rounded-xl p-5 shadow-sm flex flex-col ${isDarkMode ? 'bg-black border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
//           <h3 className={`font-outfit text-[15px] font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-slate-900'}`}>Revenue Splits</h3>
//           <div className="flex-grow flex items-center h-[200px]">
//             <div className="w-[55%] h-full">
//               <ResponsiveContainer width="100%" height="100%">
//                 <PieChart width={300} height={300}>
//                   <Pie
//                     data={revenueSplits}
//                     dataKey="value"
//                     nameKey="name"
//                     cx="50%"
//                     cy="50%"
//                     outerRadius={100}
//                     label={renderCustomizedLabel}
//                   >
//                     {revenueSplits.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={entry.color} />
//                     ))}
//                   </Pie>
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>
//             <div className="w-[45%] pl-2">
//               <ul className="flex flex-col gap-3 justify-center">
//                 {(revenueSplits.length > 0 ? revenueSplits : [
//                   { name: 'Platform Fees', value: 10, color: pieColors[0] },
//                   { name: 'Creator', value: 60, color: pieColors[1] },
//                   { name: 'Collaborator', value: 30, color: pieColors[2] }
//                 ]).map((entry, index) => (
//                   <li key={index} className="flex items-center">
//                     <span className="w-3.5 h-3.5 rounded-sm mr-2" style={{ backgroundColor: entry.color || pieColors[index] }}></span>
//                     <span className={`font-outfit font-medium text-[11px] ${isDarkMode ? 'text-gray-200' : 'text-slate-800'}`}>
//                       {entry.name}
//                     </span>
//                     <span className={`ml-auto font-medium text-[11px] ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
//                       {entry.value}%
//                     </span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// }


import React, { useState, useEffect } from 'react';
import user2 from "../../assets/Adminimages/user2.png";
import { Users, BookMarked, CheckCircle2, Contact, BarChart2, IndianRupee, ArrowUp, Briefcase, DollarSign, TrendingUp, Award, Trophy, Moon, Sun } from 'lucide-react';
import {
  ComposedChart, Line, CartesianGrid, Tooltip,
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import api from "../../utils/axiosConfig";

const formatINR = (amount) => {
  if (!amount && amount !== 0) return '₹0';
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,  // ← This rounds to nearest integer
    maximumFractionDigits: 0,  // ← This removes decimals
  }).format(numAmount);
};

export default function Analytics() {

  // --- THEME STATE ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === "dark") return true;
    if (savedTheme === "light") return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // --- STATE FOR REAL DATA ---
  const [stats, setStats] = useState({
    revenue_month: 0,
    active_creators: 0,
    active_collaborators: 0,
    total_subs: 0
  });
  const [userOverviewData, setUserOverviewData] = useState([]);
  const [taskPerformance, setTaskPerformance] = useState({
    total_completed: 0,
    total_target: 0,
    on_time: 0,
    late: 0,
    tasks_this_year: 0,
    growth: 0
  });
  const [trafficData, setTrafficData] = useState({
    device: [],
    location: []
  });
  const [revenueSplits, setRevenueSplits] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [yearlyData, setYearlyData] = useState({
    percentChange: 0,
    daysAgo: 31,
    total: 0,
    footerLabel: "0% Increase from last year"
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Colors for charts - enhanced for dark mode
  const barColors = ['#8b5cf6', '#a78bfa', '#c084fc', '#e9d5ff'];
  const donutColors = ['#8b5cf6', '#a78bfa', '#c084fc', '#e9d5ff'];

  // Custom tooltip styles for better visibility and readability
  const customTooltipStyle = {
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    border: isDarkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '10px 14px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    fontSize: '13px',
    fontWeight: '500',
    lineHeight: '1.4'
  };

  const customTooltipLabelStyle = {
    color: isDarkMode ? '#f3f4f6' : '#1f2937',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '6px',
    borderBottom: isDarkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
    paddingBottom: '4px'
  };

  const customTooltipItemStyle = {
    color: isDarkMode ? '#d1d5db' : '#4b5563',
    fontSize: '12px',
    padding: '2px 0'
  };

  // --- CHECK AUTHENTICATION USING COOKIES ---
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get('/admin/verify');
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Authentication failed:', error);
        setError('Please login to view analytics');
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // --- FETCH ALL DATA ---
  useEffect(() => {
    const fetchAllData = async () => {
      if (!isAuthenticated) return;

      setLoading(true);
      setError(null);

      try {
        console.log('Fetching analytics data...');

        const [
          statsResponse,
          overviewResponse,
          taskResponse,
          trafficResponse,
          revenueResponse,
          collaboratorsResponse
        ] = await Promise.allSettled([
          api.get('/admin/analytics/stats'),
          api.get('/admin/analytics/user-overview'),
          api.get('/admin/analytics/task-performance'),
          api.get('/admin/analytics/traffic-data'),
          api.get('/admin/analytics/revenue-splits'),
          api.get('/admin/analytics/top-collaborators?limit=5')
        ]);

        // Handle Stats
        // Handle Stats
if (statsResponse.status === 'fulfilled' && statsResponse.value?.data) {
  const data = statsResponse.value.data;
  setStats({
    revenue_month: data.revenue_month || 0,  // ✅ Direct assignment (already in INR)
    active_creators: data.active_creators || 0,
    active_collaborators: data.active_collaborators || 0,
    total_subs: data.total_subs || 0
  });
}

        // Handle User Overview Chart
        if (overviewResponse.status === 'fulfilled' && overviewResponse.value?.data) {
          const data = overviewResponse.value.data;
          if (Array.isArray(data) && data.length > 0) {
            const transformedData = data.map(item => ({
              name: item.Month || '',
              collaborator: item.Collaborator || 0,
              creator: item.Creator || 0,
              transactions: item.Transactions || 0
            }));
            setUserOverviewData(transformedData);
          } else {
            setUserOverviewData([]);
          }
        }

        // Handle Task Performance
        if (taskResponse.status === 'fulfilled' && taskResponse.value?.data) {
          const data = taskResponse.value.data;
          const taskData = {
            total_completed: data.total_completed || 0,
            total_target: data.total_target || 0,
            on_time: data.on_time || 0,
            late: data.late || 0,
            tasks_this_year: data.tasks_this_year || 0,
            growth: data.growth || 0
          };

          setTaskPerformance(taskData);

          setYearlyData({
            percentChange: data.growth || 0,
            daysAgo: 31,
            total: data.tasks_this_year ? `${data.tasks_this_year}` : '0',
            footerLabel: `${(data.growth || 0).toFixed(1)}% Increase from last year`
          });
        }

        // Handle Traffic Data
        if (trafficResponse.status === 'fulfilled' && trafficResponse.value?.data) {
          const data = trafficResponse.value.data;
          setTrafficData({
            device: data.device || [],
            location: data.location || []
          });
        } else {
          setTrafficData({
            device: [
              { name: "Windows", value: 4500 },
              { name: "Mac", value: 2500 },
              { name: "Android", value: 2000 },
              { name: "iOS", value: 1000 }
            ],
            location: [
              { name: "United States", value: 52.1 },
              { name: "Canada", value: 22.8 },
              { name: "Mexico", value: 13.9 },
              { name: "Other", value: 11.2 }
            ]
          });
        }

        // Handle Revenue Splits
        if (revenueResponse.status === 'fulfilled' && revenueResponse.value?.data) {
          const data = revenueResponse.value.data;
          let splitsData = [];

          if (data.splits && Array.isArray(data.splits)) {
            splitsData = data.splits;
          } else if (Array.isArray(data)) {
            splitsData = data;
          } else {
            splitsData = [
              { name: "Platform Fees", value: 10 },
              { name: "Creator", value: 60 },
              { name: "Collaborator", value: 30 }
            ];
          }

          const total = splitsData.reduce((sum, item) => {
            return sum + (Number(item.value) || 0);
          }, 0);

          const formattedSplits = splitsData.map((item, index) => {
            const rawValue = Number(item.value) || 0;
            let darkColor;
            if (item.name === "Platform Fees") darkColor = "#f87171";
            else if (item.name === "Creator") darkColor = "#a78bfa";
            else darkColor = "#34d399";
            
            let lightColor;
            if (item.name === "Platform Fees") lightColor = "#dc2626";
            else if (item.name === "Creator") lightColor = "#7c3aed";
            else lightColor = "#059669";
            
            let percentage = total > 0 ? (rawValue / total) * 100 : 0;
            percentage = Math.round(percentage);
            
            return {
              name: item.name || 'Unknown',
              value: percentage,
              originalValue: rawValue,
              color: isDarkMode ? darkColor : lightColor
            };
          });

          setRevenueSplits(formattedSplits);
        } else {
          setRevenueSplits([
            { name: "Platform Fees", value: 10, color: isDarkMode ? "#f87171" : "#dc2626" },
            { name: "Creator", value: 60, color: isDarkMode ? "#a78bfa" : "#7c3aed" },
            { name: "Collaborator", value: 30, color: isDarkMode ? "#34d399" : "#059669" }
          ]);
        }

        // Handle Collaborators
        // Handle Collaborators
if (collaboratorsResponse.status === 'fulfilled' && collaboratorsResponse.value?.data) {
  const data = collaboratorsResponse.value.data;
  if (Array.isArray(data) && data.length > 0) {
    const transformedCollaborators = data.map((collab, index) => ({
      id: collab.id || index + 1,
      rank: collab.rank || index + 1,
      name: collab.name || 'Unknown',
      email: collab.email || '',
      date: collab.joined_date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      earnings: collab.earnings || 0, 
      total_jobs: collab.total_jobs || 0,
      completed_jobs: collab.completed_jobs || 0,
      pending_jobs: collab.pending_jobs || 0,
      completion_rate: collab.completion_rate || 0,
      avg_job_value: collab.avg_job_value || 0,
      monthly_revenue: collab.monthly_revenue || 0,
      total_budget: collab.total_budget || 0,  // ← MAKE SURE THIS IS HERE
      avatar: collab.profile_image || user2,
      performance_score: collab.performance_score || 0,
      status: collab.status || 'Active'
    }));
    transformedCollaborators.sort((a, b) => a.rank - b.rank);
    setCollaborators(transformedCollaborators);
  } else {
    setCollaborators([]);
  }
}

      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError(err.message || 'Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [isAuthenticated, isDarkMode]);

  // Update revenue splits colors when theme changes
  useEffect(() => {
    setRevenueSplits(prev => prev.map(split => {
      if (split.name === "Platform Fees") return { ...split, color: isDarkMode ? "#f87171" : "#dc2626" };
      if (split.name === "Creator") return { ...split, color: isDarkMode ? "#a78bfa" : "#7c3aed" };
      if (split.name === "Collaborator") return { ...split, color: isDarkMode ? "#34d399" : "#059669" };
      return split;
    }));
  }, [isDarkMode]);

  // Theme effect
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

    applyTheme();
    const handleThemeChange = () => applyTheme();
    window.addEventListener("theme-change", handleThemeChange);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (!localStorage.getItem("theme")) applyTheme();
    };
    mediaQuery.addEventListener('change', handleSystemChange);

    return () => {
      window.removeEventListener("theme-change", handleThemeChange);
      mediaQuery.removeEventListener('change', handleSystemChange);
    };
  }, []);

  if (loading) {
    return (
      <main className={`w-full max-w-full p-2 md:p-4 font-sans overflow-x-hidden mt-[-14px] min-h-screen ${isDarkMode ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading analytics data...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={`w-full max-w-full p-2 md:p-4 font-sans overflow-x-hidden mt-[-14px] min-h-screen ${isDarkMode ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Calculate top performer
  const topPerformer = collaborators.length > 0 ? collaborators[0] : null;
  const totalJobs = collaborators.reduce((sum, c) => sum + (c.completed_jobs || 0), 0);
  const totalRevenue = collaborators.reduce((sum, c) => sum + (c.earnings || 0), 0);

  // Custom tooltip renderer for bar chart
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={customTooltipStyle}>
          <div style={customTooltipLabelStyle}>{label}</div>
          <div style={customTooltipItemStyle}>
            <span style={{ fontWeight: 'bold' }}>Value: </span>
            <span>{payload[0]?.value?.toLocaleString() || 0}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip renderer for pie chart
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={customTooltipStyle}>
          <div style={customTooltipLabelStyle}>{data.name}</div>
          <div style={customTooltipItemStyle}>
            <span style={{ fontWeight: 'bold' }}>Percentage: </span>
            <span>{data.value}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for composed chart
  const CustomComposedTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={customTooltipStyle}>
          <div style={customTooltipLabelStyle}>{label}</div>
          {payload.map((item, index) => (
            <div key={index} style={customTooltipItemStyle}>
              <span style={{ fontWeight: 'bold' }}>{item.name}: </span>
              <span>{item.value?.toLocaleString() || 0}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <main className={`w-full max-w-full p-2 md:p-4 font-sans overflow-x-hidden mt-[-14px] min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-black' : 'bg-gray-100'}`}>

      {/* ================= TOP STATS ROW ================= */}
      <h3 className={`font-outfit font-semibold text-[24px] leading-none tracking-normal mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        Analytics & Revenue splits
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 mb-8">
        {[
          { label: "Total revenue for this month", value: formatINR(stats.revenue_month), icon: <Users size={28} /> },
          { label: "Active Creators", value: stats.active_creators?.toString() || "0", icon: <BookMarked size={28} /> },
          { label: "Active Collaborators", value: stats.active_collaborators?.toString() || "0", icon: <CheckCircle2 size={28} /> },
          { label: "Total Subscription this month", value: stats.total_subs?.toString() || "0", icon: <Contact size={28} /> },
        ].map((item, i) => (
          <div 
            key={i} 
            className={`flex items-center p-5 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 ${
              isDarkMode 
                ? 'bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700' 
                : 'bg-gradient-to-r from-purple-900 to-purple-800'
            }`}
          >
            <div className="w-12 flex justify-center opacity-90 text-white">{item.icon}</div>
            <div className="flex-grow flex flex-col">
              <h2 className="text-2xl font-medium text-white leading-none">{item.value}</h2>
              <p className="text-[10px] mt-2 opacity-80 tracking-wider text-white/80">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MAIN CONTENT GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        
        {/* LEFT COLUMN - Users Overview Chart */}
        <div className="lg:col-span-2">
          <div className={`p-6 rounded-xl shadow-sm w-full h-[420px] transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
          }`}>
            <div className="mb-6 flex flex-col">
              <h2 className={`text-lg font-bold font-outfit mb-4 uppercase tracking-wide ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>USERS OVERVIEW</h2>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-purple-600"></div>
                  <span className={`font-outfit font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Collaborator</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-400'}`}></div>
                  <span className={`font-outfit font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Creator</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-0.5 bg-purple-600"></div>
                  <span className={`font-outfit font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Transactions</span>
                </div>
              </div>
            </div>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={userOverviewData.length > 0 ? userOverviewData : [{ name: 'Jan', collaborator: 0, creator: 0, transactions: 0 }]} margin={{ top: 20, right: 20, bottom: 20, left: 2 }}>
                  <CartesianGrid vertical={false} strokeDasharray="4 4" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280', fontSize: 14, dy: 15 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280', fontSize: 14, dx: -10 }} tickFormatter={(value) => value === 0 ? '0' : `${value / 1000}K`} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }} 
                    content={<CustomComposedTooltip />}
                  />
                  <Bar dataKey="collaborator" barSize={6} fill="#8b5cf6" radius={[10, 10, 0, 0]} />
                  <Bar dataKey="creator" barSize={6} fill={isDarkMode ? '#6B7280' : '#9ca3af'} radius={[10, 10, 0, 0]} />
                  <Line type="monotone" dataKey="transactions" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="6 6" dot={false} activeDot={{ r: 6, fill: "#8b5cf6", stroke: "white", strokeWidth: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Task Performance */}
        <div className="lg:col-span-1">
          <div className={`rounded-xl shadow-sm w-full p-6 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`font-outfit text-lg font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Completed Tasks</h3>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-outfit font-semibold text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total Tasks Completed</span>
                  <span className={`font-semibold text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{taskPerformance.total_completed} of {taskPerformance.total_target}</span>
                </div>
                <div className={`w-full rounded-full h-4 overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div className="bg-purple-600 h-4 rounded-full transition-all duration-500" style={{ width: taskPerformance.total_target > 0 ? `${(taskPerformance.total_completed / taskPerformance.total_target) * 100}%` : '0%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-outfit font-semibold text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tasks On-time</span>
                  <span className={`font-semibold text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{taskPerformance.on_time} of {taskPerformance.total_target}</span>
                </div>
                <div className={`w-full rounded-full h-4 overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div className={`h-4 rounded-full transition-all duration-500 ${isDarkMode ? 'bg-gray-500' : 'bg-gray-500'}`} style={{ width: taskPerformance.total_target > 0 ? `${(taskPerformance.on_time / taskPerformance.total_target) * 100}%` : '0%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-outfit font-semibold text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tasks Late</span>
                  <span className={`font-semibold text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{taskPerformance.late} of {taskPerformance.total_target}</span>
                </div>
                <div className={`w-full rounded-full h-4 overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div className="bg-red-500 h-4 rounded-full transition-all duration-500" style={{ width: taskPerformance.total_target > 0 ? `${(taskPerformance.late / taskPerformance.total_target) * 100}%` : '0%' }}></div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <div className={`flex flex-col rounded-xl p-4 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                <h4 className={`font-outfit font-semibold text-[10px] mb-1.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Tasks This Year</h4>
                <div className="flex justify-between items-center gap-2">
                  <div className={`p-2 rounded-lg flex flex-col justify-center flex-1 ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                    <div className={`font-bold text-base sm:text-xl flex items-center mb-0.5 ${isDarkMode ? 'text-green-400' : 'text-purple-700'}`}>
                      <ArrowUp size={14} strokeWidth={3} className="mr-1" />
                      {yearlyData.percentChange.toFixed(1)}%
                    </div>
                    <div className={`text-[7px] sm:text-[8px] font-outfit font-bold tracking-wider uppercase ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{yearlyData.daysAgo} DAYS AGO</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-light leading-tight tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-800'}`} style={{ fontSize: '2.5rem' }}>{yearlyData.total}</div>
                    <div className={`font-outfit font-medium text-[9px] sm:text-[10px] -mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Tasks This Year</div>
                  </div>
                </div>
                <div className={`w-full h-12 flex items-center justify-between px-3 rounded-xl mt-3 transition-colors duration-300 ${isDarkMode ? 'bg-purple-900/40 border border-purple-800' : 'bg-purple-700'}`}>
                  <span className={`font-outfit font-semibold text-xs whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-white'}`}>{yearlyData.footerLabel}</span>
                  <div className={`p-1.5 rounded cursor-pointer transition-all hover:scale-110 ${isDarkMode ? 'bg-gray-700/50 hover:bg-gray-600/50' : 'bg-white/20 hover:bg-white/30'}`}>
                    <BarChart2 size={14} className={isDarkMode ? 'text-gray-400' : 'text-white'} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= TOP COLLABORATOR TABLE ================= */}
      <div className={`rounded-xl shadow-sm overflow-hidden w-full mt-6 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
      }`}>
        <div className={`h-[78px] px-8 flex items-center justify-between border-b transition-colors duration-300 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <Trophy size={24} className="text-yellow-500" />
            <h2 className={`text-xl font-outfit font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Top Collaborators
            </h2>
          </div>
          <div className="flex gap-3">
            <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
            }`}>
              <Briefcase size={12} /> Jobs Done
            </span>
            <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
            }`}>
              <IndianRupee size={12} /> Revenue
            </span>
          </div>
        </div>

        <div className="flex flex-col max-h-[600px] overflow-y-auto">
          {collaborators.length > 0 ? collaborators.map((user) => (
            <div 
              key={user.id} 
              className={`w-full transition-all duration-200 ${
                isDarkMode ? 'border-b border-gray-800 hover:bg-gray-800/50' : 'border-b border-gray-100 hover:bg-gray-50'
              }`}
            >
              <div className="px-8 py-4">
                <div className="flex flex-wrap items-center">
                  {/* Rank, Avatar, Name */}
                  <div className="flex items-center w-[35%] min-w-[240px]">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 font-bold text-sm shrink-0 ${
                      user.rank === 1 ? 'bg-yellow-500 text-white' : 
                      user.rank === 2 ? 'bg-gray-400 text-white' : 
                      user.rank === 3 ? 'bg-orange-600 text-white' :
                      isDarkMode ? 'bg-purple-900/50 text-purple-300 border border-purple-700' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {user.rank}
                    </div>
                    <img src={user.avatar} alt={user.name} className="w-11 h-11 rounded-full object-cover mr-4 border shadow-sm shrink-0" onError={(e) => { e.target.src = user2; }} />
                    <div className="flex flex-col min-w-0">
                      <span className={`font-medium font-outfit text-[15px] leading-tight truncate ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{user.name}</span>
                      <span className={`text-xs font-outfit ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Joined {user.date}</span>
                    </div>
                  </div>

                  {/* Job Metrics */}
                  <div className="flex items-center gap-6 w-[40%] min-w-[280px] mt-3 sm:mt-0">
                    <div className="flex flex-col min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <Briefcase size={14} className={isDarkMode ? 'text-green-400' : 'text-green-600'} />
                        <span className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{user.completed_jobs || 0}</span>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>/ {user.total_jobs || 0}</span>
                      </div>
                      <div className="mt-1">
                        <div className={`w-24 rounded-full h-1.5 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{ width: `${user.completion_rate || 0}%` }}></div>
                        </div>
                        <span className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{user.completion_rate || 0}% complete</span>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
  
  <span className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
    {formatINR(user.earnings)}
  </span>
</div>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Avg: {formatINR(user.avg_job_value)}/job</span>
                    </div>
                  </div>

                  {/* Email and Monthly Revenue */}
                  <div className="flex flex-col w-[25%] min-w-[180px] text-right mt-3 sm:mt-0">
                    <span className={`font-outfit text-[13px] truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{user.email}</span>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <TrendingUp size={12} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
                      <span className={`text-xs font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        Earned in last 30 days: {formatINR(user.monthly_revenue)} 
                      </span>
                    </div>
                  </div>
                </div>

                {/* Revenue Progress Bar */}
                {/* Revenue Progress Bar */}
<div className="mt-3 ml-[35%] min-w-[300px]">
  <div className="flex justify-between text-xs mb-1">
    <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
      Revenue Progress ({user.completed_jobs}/{user.total_jobs} jobs completed)
    </span>
    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
      {formatINR(user.monthly_revenue)} / {formatINR(user.total_budget)}
    </span>
  </div>
  <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
    <div 
      className={`h-2 rounded-full transition-all duration-500 ${isDarkMode ? 'bg-gradient-to-r from-purple-500 to-purple-400' : 'bg-gradient-to-r from-purple-600 to-purple-400'}`} 
      style={{ width: `${user.total_budget > 0 ? Math.min((user.monthly_revenue / user.total_budget) * 100, 100) : 0}%` }}
    />
  </div>
</div>
              </div>
            </div>
          )) : (
            <div className="flex items-center justify-center h-64">
              <p className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>No collaborators found</p>
            </div>
          )}
        </div>

        {/* Summary Footer */}
        {collaborators.length > 0 && (
          <div className={`px-8 py-3 border-t transition-colors duration-300 ${
            isDarkMode ? 'border-gray-800 bg-gray-800/50' : 'border-gray-100 bg-gray-50'
          }`}>
            <div className="flex flex-wrap justify-between items-center gap-4 text-sm">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-purple-500" />
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Top Performer: <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{topPerformer?.name}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className="text-green-500" />
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Total Jobs: <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{totalJobs}</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <IndianRupee size={16} className="text-yellow-500" />
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Total Revenue: <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{formatINR(totalRevenue)}</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM 3 CHARTS ROW - NO HOVER BACKGROUND */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-10">
        
        {/* Chart 1: Traffic by Device - NO HOVER */}
        <div className={`rounded-xl p-5 shadow-sm flex flex-col transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
        }`}>
          <h3 className={`text-[15px] font-outfit font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Traffic by Device</h3>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={trafficData.device.length > 0 ? trafficData.device : [{ name: 'No Data', value: 0 }]} 
                margin={{ top: 10, right: 0, left: -25, bottom: 0 }}
              >
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280', fontSize: 11, dy: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280', fontSize: 11 }} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  content={<CustomBarTooltip />}
                />
                <Bar 
                  dataKey="value" 
                  radius={[6, 6, 6, 6]} 
                  barSize={24}
                  isAnimationActive={true}
                  animationDuration={500}
                >
                  {trafficData.device.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Traffic by Location - NO HOVER */}
        <div className={`rounded-xl p-5 shadow-sm flex flex-col transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
        }`}>
          <h3 className={`font-outfit text-[15px] font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Traffic by Location</h3>
          <div className="flex-grow flex items-center" style={{ minHeight: '200px' }}>
            <div className="w-[55%]" style={{ height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trafficData.location.length > 0 ? trafficData.location : [{ name: 'No Data', value: 100 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                    labelLine={false}
                  >
                    {(trafficData.location.length > 0 ? trafficData.location : [{ name: 'No Data', value: 100 }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={donutColors[index % donutColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-[45%] pl-2">
              <ul className="flex flex-col gap-3">
                {trafficData.location.length > 0 ? trafficData.location.map((entry, index) => (
                  <li key={index} className="flex items-center justify-between w-full text-xs">
                    <div className="flex items-center">
                      <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: donutColors[index % donutColors.length] }}></span>
                      <span className={`font-outfit font-semibold text-[11px] truncate max-w-[60px] ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>{entry.name}</span>
                    </div>
                    <span className={`font-medium text-[11px] ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{entry.value}%</span>
                  </li>
                )) : (
                  <li className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No data available</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Chart 3: Revenue Splits - NO HOVER */}
        <div className={`rounded-xl p-5 shadow-sm flex flex-col transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
        }`}>
          <h3 className={`font-outfit text-[15px] font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Revenue Splits</h3>
          <div className="flex flex-col items-center justify-center w-full">
            <div style={{ width: '100%', height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueSplits}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ percent }) => {
                      const percentage = Math.round(percent * 100);
                      if (percentage < 5) return null;
                      return `${percentage}%`;
                    }}
                    labelLine={false}
                    labelStyle={{ fill: isDarkMode ? '#ffffff' : '#ffffff', fontSize: '12px', fontWeight: 'bold' }}
                  >
                    {revenueSplits.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full mt-3">
              <ul className="flex flex-row justify-center gap-4 flex-wrap">
                {revenueSplits.map((entry, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }} />
                    <span className={`font-outfit font-medium text-[11px] ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                      {entry.name}
                    </span>
                    <span className={`font-bold text-[11px] ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {Math.round(entry.value)}%
                    </span>
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