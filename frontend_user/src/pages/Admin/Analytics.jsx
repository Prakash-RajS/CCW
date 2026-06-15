import React, { useState, useEffect } from 'react';
import user2 from "../../assets/Adminimages/user2.png";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 
import { Users, BookMarked, CheckCircle2, Contact, ChevronLeft, ChevronRight, BarChart2, ArrowUp } from 'lucide-react';
import {
  ComposedChart, Line, CartesianGrid, Tooltip,
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import api from "../../utils/axiosConfig";

export default function Analytics() {
  
  // --- THEME STATE ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === "dark") return true;
    if (savedTheme === "light") return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // --- STATE FOR REAL DATA ---
  const [value, onChange] = useState(new Date());
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

  // Colors for charts
  const barColors = ['#4a235a', '#7d5a8f', '#3b0764', '#c0a6d3'];
  const donutColors = ['#3b0764', '#7d5a8f', '#d8b4fe', '#a855f7'];
  const pieColors = ['#3b0764', '#bdbdbd', '#e9d5ff'];

  // --- CHECK AUTHENTICATION ---
  useEffect(() => {
    const checkAuth = () => {
      const adminId = localStorage.getItem('adminId');
      const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
      
      if (!adminId || !adminLoggedIn) {
        setError('Please login to view analytics');
        setIsAuthenticated(false);
        return false;
      }
      
      setIsAuthenticated(true);
      return true;
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
        const adminId = localStorage.getItem('adminId');
        
        if (!adminId) {
          throw new Error('No admin ID found');
        }

        const headers = { 
          'user_id': adminId
        };

        console.log('Fetching analytics with headers:', headers);

        const [
          statsResponse,
          overviewResponse,
          taskResponse,
          trafficResponse,
          revenueResponse,
          collaboratorsResponse
        ] = await Promise.allSettled([
          api.get('/admin/analytics/stats', { headers }),
          api.get('/admin/analytics/user-overview', { headers }),
          api.get('/admin/analytics/task-performance', { headers }),
          api.get('/admin/analytics/traffic-data', { headers }),
          api.get('/admin/analytics/revenue-splits', { headers }),
          api.get('/admin/analytics/top-collaborators?limit=5', { headers })
        ]);

        // Handle Stats
        if (statsResponse.status === 'fulfilled' && statsResponse.value?.data) {
          const data = statsResponse.value.data;
          setStats({
            revenue_month: data.revenue_month || 0,
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
          
          // Format the yearly data
          setYearlyData({
            percentChange: data.growth || 0,
            daysAgo: 31,
            total: data.tasks_this_year ? `$${data.tasks_this_year.toFixed(2)}` : '$0.00',
            footerLabel: `${(data.growth || 0).toFixed(1)}% Increase from last year`
          });
        }

        // Handle Traffic Data
        if (trafficResponse.status === 'fulfilled' && trafficResponse.value?.data) {
          const data = trafficResponse.value.data;
          console.log('Traffic data received:', data);
          
          setTrafficData({
            device: data.device || [],
            location: data.location || []
          });
        } else {
          // Fallback data
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

        // Handle Revenue Splits - FIXED for visibility
        if (revenueResponse.status === 'fulfilled' && revenueResponse.value?.data) {
          const data = revenueResponse.value.data;
          console.log('Revenue splits received:', data);
          
          let splitsData = [];
          
          // Check if data has splits property or is directly the array
          if (data.splits && Array.isArray(data.splits)) {
            splitsData = data.splits;
          } else if (Array.isArray(data)) {
            splitsData = data;
          } else {
            // Fallback data - ensure values are numbers
            splitsData = [
              { name: "Platform Fees", value: 10 },
              { name: "Creator", value: 60 },
              { name: "Collaborator", value: 30 }
            ];
          }
          
          // Ensure all values are numbers and add colors
          const formattedSplits = splitsData.map((item, index) => ({
            name: item.name || 'Unknown',
            value: Number(item.value) || 0,
            color: pieColors[index % pieColors.length]
          }));
          
          setRevenueSplits(formattedSplits);
        } else {
          // Fallback data with proper values
          setRevenueSplits([
            { name: "Platform Fees", value: 10, color: pieColors[0] },
            { name: "Creator", value: 60, color: pieColors[1] },
            { name: "Collaborator", value: 30, color: pieColors[2] }
          ]);
        }

        // Handle Collaborators
        if (collaboratorsResponse.status === 'fulfilled' && collaboratorsResponse.value?.data) {
          const data = collaboratorsResponse.value.data;
          if (Array.isArray(data) && data.length > 0) {
            const transformedCollaborators = data.map((collab, index) => ({
              id: index + 1,
              name: collab.name || 'Unknown',
              username: collab.email ? collab.email.split('@')[0] : 'user',
              email: collab.email || '',
              date: collab.joined_date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
              amount: `$${collab.earnings?.toLocaleString() || '0'}`,
              avatar: user2
            }));
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
  }, [isAuthenticated]);

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

    const handleThemeChange = () => {
      applyTheme();
    };

    window.addEventListener("theme-change", handleThemeChange);

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

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    
    // Only show label if percent is greater than 5%
    if (percent * 100 < 5) return null;
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central" 
        fontSize={12} 
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (!isAuthenticated) {
    return (
      <main className={`w-full max-w-full p-2 md:p-4 font-sans overflow-x-hidden mt-[-14px] ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">⚠️ Authentication Required</div>
            <p className="text-gray-600">Please login to view analytics</p>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className={`w-full max-w-full p-2 md:p-4 font-sans overflow-x-hidden mt-[-14px] ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={`w-full max-w-full p-2 md:p-4 font-sans overflow-x-hidden mt-[-14px] ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-purple-900 text-white rounded-lg hover:bg-purple-800"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

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
          { 
            label: "Total revenue for this month", 
            value: `$${stats.revenue_month?.toLocaleString() || '0'}`, 
            icon: <Users size={28} /> 
          },
          { 
            label: "Active Creators", 
            value: stats.active_creators?.toString() || "0", 
            icon: <BookMarked size={28} /> 
          },
          { 
            label: "Active Collaborators", 
            value: stats.active_collaborators?.toString() || "0", 
            icon: <CheckCircle2 size={28} /> 
          },
          { 
            label: "Total Subscription this month", 
            value: stats.total_subs?.toString() || "0", 
            icon: <Contact size={28} /> 
          },
        ].map((item, i) => (
          <div
            key={i}
            className={`flex items-center p-5 rounded-xl shadow-lg ${isDarkMode ? 'text-white' : 'text-white'}`}
            style={{ 
              background: isDarkMode ? "linear-gradient(90deg, #0c0c0c 0%, #000000 100%)" : "linear-gradient(90deg, #3D1768 0%, #020202 100%)",
            }}
          >
            <div className="w-12 flex justify-center opacity-90">{item.icon}</div>
            <div className="flex-grow flex flex-col">
              <h2 className="text-3xl font-medium poppins leading-none">{item.value}</h2>
              <p className="text-[10px] milonga-regular mt-2 opacity-80 tracking-wider">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MAIN CONTENT FLEX LAYOUT ================= */}
      <div className="flex flex-col xl:flex-row gap-6 items-start w-full">
        
        {/* === LEFT COLUMN === */}
        <div className="w-full xl:flex-[2] flex flex-col gap-6 min-w-0">
            
          {/* 1. USERS OVERVIEW CHART */}
          <div className={`p-6 rounded-xl shadow-sm w-full h-[420px] ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
            <div className="mb-6 flex flex-col">
              <h2 className={`text-lg font-bold font-outfit mb-4 uppercase tracking-wide ${isDarkMode ? 'text-white' : 'text-[#4B5563]'}`}>USERS OVERVIEW</h2>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#3b0764]"></div>
                  <span className={`font-outfit font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Collaborator</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#9ca3af] opacity-80"></div>
                  <span className={`font-outfit font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Creator</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-0.5 bg-[#3b0764]"></div>
                  <span className={`font-outfit font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Transactions</span>
                </div>
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart 
                  data={userOverviewData.length > 0 ? userOverviewData : [{ name: 'Jan', collaborator: 0, creator: 0, transactions: 0 }]} 
                  margin={{ top: 20, right: 20, bottom: 20, left: 2 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#9CA3AF' : 'rgba(61, 23, 104, 0.45)', fontSize: 14, dy: 15 }} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: isDarkMode ? '#9CA3AF' : 'rgba(61, 23, 104, 0.45)', fontSize: 14, dx: -10 }} 
                    tickFormatter={(value) => value === 0 ? '0' : `${value / 1000}K`} 
                  />
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
            <div className={`h-[78px] px-8 flex items-center border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-xl font-outfit font-bold tracking-tight ${isDarkMode ? 'text-gray-200' : 'text-slate-700'}`}>Top Collaborator</h2>
            </div>
            <div className={`w-full h-[1px] ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`}></div>
            
            <div className="px-8 flex flex-col h-[352px] overflow-y-auto"> 
              {collaborators.length > 0 ? collaborators.map((user) => (
                <div key={user.id} className={`flex items-center py-3 border-b last:border-0 transition-colors ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-50 hover:bg-gray-50'}`}>
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

                  <div className="flex flex-col w-[40%] pl-2">
                    <span className={`font-outfit text-[15px] leading-tight mb-0.5 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>{user.email}</span>
                    <span className={`font-outfit text-sm leading-tight ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>{user.date}</span>
                  </div>

                  <div className="w-[25%] text-right">
                    <span className={`font-outfit font-semibold text-[15px] tracking-wide ${isDarkMode ? 'text-gray-200' : 'text-slate-800'}`}>{user.amount}</span>
                  </div>
                </div>
              )) : (
                <div className="flex items-center justify-center h-full">
                  <p className={`text-gray-500 ${isDarkMode ? 'text-gray-400' : ''}`}>No collaborators found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN (Calendar & Sidebar) - FIXED CALENDAR === */}
        <div className="w-full xl:flex-[1] min-w-0">
          <div className={`rounded-xl shadow-sm relative w-full min-h-[850px] p-6 pb-20 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
            {/* Calendar Container with fixed styling */}
            <div className="calendar-container mb-6">
              <style>{`
                .react-calendar {
                  width: 100%;
                  border: none;
                  background: transparent;
                  font-family: ui-sans-serif, system-ui, sans-serif;
                }
                .react-calendar__navigation {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 1rem;
                  height: 40px;
                }
                .react-calendar__navigation button {
                  background: ${isDarkMode ? '#374151' : 'rgba(61, 23, 104, 0.1)'};
                  border: none;
                  border-radius: 9999px;
                  width: 32px;
                  height: 32px;
                  font-size: 1.2rem;
                  color: ${isDarkMode ? '#9CA3AF' : '#4B5563'};
                  cursor: pointer;
                }
                .react-calendar__navigation button:hover {
                  background: ${isDarkMode ? '#4B5563' : 'rgba(61, 23, 104, 0.2)'};
                }
                .react-calendar__navigation__label {
                  font-weight: 600;
                  font-size: 1rem;
                  color: ${isDarkMode ? '#9CA3AF' : '#4B5563'};
                  background: transparent !important;
                  flex-grow: 1;
                  text-align: center;
                }
                .react-calendar__month-view__weekdays {
                  text-align: center;
                  font-weight: 600;
                  font-size: 0.8rem;
                  color: #9CA3AF;
                  text-decoration: none;
                  margin-bottom: 0.5rem;
                }
                .react-calendar__month-view__weekdays abbr {
                  text-decoration: none;
                  cursor: default;
                }
                .react-calendar__tile {
                  height: 36px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: 500;
                  font-size: 0.85rem;
                  color: ${isDarkMode ? '#9CA3AF' : '#1F2937'};
                  background: transparent;
                  border: none;
                  border-radius: 9999px;
                  cursor: pointer;
                }
                .react-calendar__tile:enabled:hover {
                  background-color: ${isDarkMode ? '#374151' : '#F3F4F6'};
                }
                .react-calendar__tile--active,
                .react-calendar__tile--active:enabled:hover,
                .react-calendar__tile--active:enabled:focus {
                  background: #3b0764 !important;
                  color: white !important;
                }
                .react-calendar__tile--now {
                  background: transparent;
                  color: #3b0764;
                  font-weight: bold;
                }
                .react-calendar__tile--now.react-calendar__tile--active {
                  background: #3b0764 !important;
                  color: white !important;
                }
                .react-calendar__navigation__prev2-button,
                .react-calendar__navigation__next2-button {
                  display: none;
                }
                .react-calendar__month-view__days__day--neighboringMonth {
                  color: ${isDarkMode ? '#4B5563' : '#D1D5DB'};
                }
              `}</style>
              <Calendar
                onChange={onChange}
                value={value}
                formatShortWeekday={(locale, date) => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()]}
                nextLabel="›"
                prevLabel="‹"
                next2Label={null}
                prev2Label={null}
                showNeighboringMonth={false}
                locale="en-US"
              />
            </div>

            <div className="mt-6 flex flex-col gap-8">
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
                    <span className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      {taskPerformance.total_completed} of {taskPerformance.total_target}
                    </span>
                  </div>
                  <div className={`w-full rounded-full h-4 overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div 
                      className="bg-[#3b0764] h-4 rounded-full" 
                      style={{ width: taskPerformance.total_target > 0 ? `${(taskPerformance.total_completed / taskPerformance.total_target) * 100}%` : '0%' }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-outfit font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>Tasks On-time</span>
                    <span className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      {taskPerformance.on_time} of {taskPerformance.total_target}
                    </span>
                  </div>
                  <div className={`w-full rounded-full h-4 overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div 
                      className={`h-4 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-[rgba(61,23,104,0.45)]'}`} 
                      style={{ width: taskPerformance.total_target > 0 ? `${(taskPerformance.on_time / taskPerformance.total_target) * 100}%` : '0%' }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-outfit font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>Tasks Late</span>
                    <span className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      {taskPerformance.late} of {taskPerformance.total_target}
                    </span>
                  </div>
                  <div className={`w-full rounded-full h-4 overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div 
                      className="bg-[#F87171] h-4 rounded-full" 
                      style={{ width: taskPerformance.total_target > 0 ? `${(taskPerformance.late / taskPerformance.total_target) * 100}%` : '0%' }}
                    ></div>
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
                      {yearlyData.percentChange.toFixed(1)}%
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

      {/* 3. BOTTOM 3 CHARTS ROW - FIXED REVENUE SPLITS VISIBILITY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full min-h-[300px] mt-10">
        
        {/* Chart 1: Traffic by Device */}
        <div className={`rounded-xl p-5 shadow-sm flex flex-col ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
          <h3 className={`text-[15px] font-outfit font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-slate-900'}`}>Traffic by Device</h3>
          <div className="flex-grow h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficData.device.length > 0 ? trafficData.device : [{ name: 'No Data', value: 0 }]} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280', fontSize: 11, dy: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280', fontSize: 11 }} />
                <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={24}>
                  {trafficData.device.map((entry, index) => (
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
          <div className="flex-grow flex items-center h-[200px]">
            <div className="w-[55%] h-full relative">
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
                  >
                    {(trafficData.location.length > 0 ? trafficData.location : [{ name: 'No Data', value: 100 }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={donutColors[index % donutColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-[45%] pl-2">
              <ul className="flex flex-col gap-3">
                {trafficData.location.length > 0 ? trafficData.location.map((entry, index) => (
                  <li key={index} className="flex items-center justify-between w-full text-xs">
                    <div className="flex items-center">
                      <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: donutColors[index] }}></span>
                      <span className={`font-outfit font-semibold text-[11px] truncate max-w-[60px] ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>{entry.name}</span>
                    </div>
                    <span className={`font-medium text-[11px] ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>{entry.value}%</span>
                  </li>
                )) : (
                  <li className="text-xs text-gray-400">No data available</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Chart 3: Revenue Splits - FIXED VISIBILITY */}
        <div className={`rounded-xl p-5 shadow-sm flex flex-col ${isDarkMode ? 'bg-black border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`font-outfit text-[15px] font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-slate-900'}`}>Revenue Splits</h3>
          <div className="flex-grow flex items-center h-[200px]">
            <div className="w-[55%] h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={revenueSplits.length > 0 ? revenueSplits : [{ name: 'Platform Fees', value: 10, color: pieColors[0] }, { name: 'Creator', value: 60, color: pieColors[1] }, { name: 'Collaborator', value: 30, color: pieColors[2] }]} 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={70}
                    dataKey="value" 
                    labelLine={false} 
                    label={renderCustomizedLabel}
                    stroke="white" 
                    strokeWidth={2}
                  >
                    {(revenueSplits.length > 0 ? revenueSplits : [
                      { name: 'Platform Fees', value: 10, color: pieColors[0] },
                      { name: 'Creator', value: 60, color: pieColors[1] },
                      { name: 'Collaborator', value: 30, color: pieColors[2] }
                    ]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-[45%] pl-2">
              <ul className="flex flex-col gap-3 justify-center">
                {(revenueSplits.length > 0 ? revenueSplits : [
                  { name: 'Platform Fees', value: 10, color: pieColors[0] },
                  { name: 'Creator', value: 60, color: pieColors[1] },
                  { name: 'Collaborator', value: 30, color: pieColors[2] }
                ]).map((entry, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-3.5 h-3.5 rounded-sm mr-2" style={{ backgroundColor: entry.color || pieColors[index] }}></span>
                    <span className={`font-outfit font-medium text-[11px] ${isDarkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                      {entry.name}
                    </span>
                    <span className={`ml-auto font-medium text-[11px] ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                      {entry.value}%
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