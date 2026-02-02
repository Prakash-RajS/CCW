import React, { useState, useRef, useEffect } from 'react';
import { BarChart3, User, ChevronRight, ChevronDown } from 'lucide-react';
import user2 from "../../assets/Adminimages/user2.png";

/* ================== CUSTOM DROPDOWN (ADAPTIVE THEME) ================== */
const CustomDropdown = ({ options, defaultSelected, onSelect, theme }) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(defaultSelected || options[0]);
  const ref = useRef(null);

  // Sync internal state if external default changes
  useEffect(() => {
    if (defaultSelected) setSelected(defaultSelected);
  }, [defaultSelected]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (opt) => {
    setSelected(opt);
    setOpen(false);
    if (onSelect) onSelect(opt);
  };

  const isDark = theme === 'Dark';

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <div
        onClick={() => setOpen(!open)}
        className={`
          w-full p-3 pl-4 pr-10 rounded-full cursor-pointer relative flex items-center h-10 outline-none
          ${isDark 
            ? 'bg-transparent !border !border-white text-white'
            : 'bg-[#c0a6d3] text-white'
          }
        `}
      >
        <span className="truncate font-outfit">{selected}</span>
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 transition-transform ${
            open ? 'rotate-180' : ''
          } ${isDark ? 'text-white' : 'text-white'}`}
          size={20}
        />
      </div>

      {/* Dropdown Options */}
      {open && (
        <div
          className={`
            absolute z-50 w-full mt-2 rounded-md shadow-lg overflow-hidden border-2
            ${isDark 
              ? 'bg-black border-gray-700 text-white' 
              : 'bg-white border-purple-200 text-black'
            }
          `}
        >
          <div className="max-h-56 overflow-y-auto">
            {options.map((opt, i) => (
              <div
                key={i}
                onClick={() => handleSelect(opt)}
                className={`
                  px-4 py-2 cursor-pointer text-sm transition-colors font-outfit
                  ${isDark
                    ? (selected === opt ? 'bg-gray-800 font-medium' : 'hover:bg-gray-900')
                    : (selected === opt ? 'bg-purple-100 font-medium' : 'hover:bg-purple-50')
                  }
                `}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Setting = () => {
  /* ================== 🔥 GLOBAL DARK MODE CONTROLLER (ADDED) ================== */
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") return "Dark";
    if (savedTheme === "light") return "Light";
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? "Dark"
      : "Light";
  });

  const isDark = theme === 'Dark';

  useEffect(() => {
    const darkMode = theme === "Dark";
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    window.dispatchEvent(new Event("theme-change"));
  }, [theme]);
  /* =========================================================================== */

  // --- State ---
  const [activeSetting, setActiveSetting] = useState('dashboard');

  // --- Static Data ---
  const themes = ["Dark", "Light"];
  const timeZones = [
    "UTC (Coordinated Universal Time )",
    "EST (Eastern Standard Time)",
    "PST (Pacific Standard Time)",
    "IST (Indian Standard Time)"
  ];
  const dateFormats = [
    "ISO Format (YYYY-MM-DD)",
    "DD/MM/YYYY",
    "MM/DD/YYYY",
    "DD-MMM-YYYY"
  ];
  const dashboards = [
    "Overview Dashboard",
    "Analytics Dashboard",
    "Financial Dashboard"
  ];

  // --- Profile State ---
  const [profile, setProfile] = useState({
    firstName: "Pradeep",
    lastName: "S",
    email: "Pradeep@gmail.com",
    role: "Admin",
    twoFactor: true
  });
  const [emailError, setEmailError] = useState("");

  // --- Handlers ---
  const handleEmailChange = (e) => {
    const val = e.target.value;
    setProfile({ ...profile, email: val });
    setEmailError("");
  };

  const handleFileChange = (e) => {
    console.log("File selected:", e.target.files[0]);
  };

  const handleThemeChange = (selectedTheme) => {
    setTheme(selectedTheme);
  };

  return (
    <div 
      className={`
        flex gap-8 font-outfit p-4 items-start min-h-screen mt-[-20px] mb-[30px] transition-colors duration-300
        ${isDark ? 'bg-black' : 'bg-white'}
      `}
    >

      {/* ================= LEFT COLUMN: MENU ================= */}
      <main
        className={`
          w-[400px] h-[780px] p-2 rounded-2xl shadow-sm shrink-0 transition-colors duration-300
          ${isDark ? 'bg-black border-none' : 'bg-white'}
        `}
      >
        <h2
          className={`font-outfit mb-10 mt-2 ${isDark ? 'text-white' : 'text-black'}`}
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 400,
            fontSize: '24px',
            lineHeight: '100%',
            letterSpacing: '0%'
          }}
        >
          Settings Menu
        </h2>

        {/* ⬇️ EVERYTHING BELOW IS UNCHANGED */}
        {/* (menu, dashboard, profile, cards, inputs, buttons — ALL PRESERVED) */}

        {/* … FULL CONTENT CONTINUES EXACTLY AS YOUR ORIGINAL FILE … */}

        <div className="flex flex-col gap-8">
          {/* Dashboard Menu Item */}
          <div
            onClick={() => setActiveSetting('dashboard')}
            className={`
              flex items-center justify-between
              w-full p-5 rounded-xl cursor-pointer transition-all border
              ${activeSetting === 'dashboard'
                ? (isDark 
                    ? 'bg-transparent text-white !border-white !border-[1px]' 
                    : 'bg-[#3b0764] text-white shadow-md border-transparent'
                  )
                : (isDark
                    ? 'bg-transparent text-white border-transparent hover:bg-gray-900'
                    : 'bg-white text-black hover:bg-gray-50 border-transparent'
                  )
              }
            `}
          >
            <div className="flex items-center gap-4">
              <BarChart3 size={24} strokeWidth={1.5} />
              <div className="flex flex-col">
                <span style={{ fontWeight: 400, fontSize: '20px', lineHeight: '100%', fontFamily: 'Outfit, sans-serif' }}>
                  Dashboard & Visualization
                </span>
                <span className={`text-[14px] font-outfit font-light mt-2 ${activeSetting === 'dashboard' ? 'opacity-80' : (isDark ? 'text-gray-400' : 'text-black')}`}>
                  Preferences
                </span>
              </div>
            </div>
            <ChevronRight size={20} />
          </div>

          {/* Profile Menu Item */}
          <div
            onClick={() => setActiveSetting('profile')}
            className={`
              flex items-center justify-between
              w-full p-5 rounded-xl cursor-pointer transition-all border
              ${activeSetting === 'profile'
                ? (isDark 
                    ? 'bg-transparent text-white !border-white !border-[1px]' 
                    : 'bg-[#3b0764] text-white shadow-md border-transparent'
                  )
                : (isDark
                    ? 'bg-transparent text-white border-transparent hover:bg-gray-900'
                    : 'bg-white text-black hover:bg-gray-50 border-transparent'
                  )
              }
            `}
          >
            <div className="flex items-center gap-4">
              <User size={24} strokeWidth={1.5} />
              <div className="flex flex-col">
                <span style={{ fontWeight: 400, fontSize: '20px', lineHeight: '100%', fontFamily: 'Outfit, sans-serif' }}>
                  User Profile & Account
                </span>
                <span className={`text-[14px] font-outfit font-light mt-2 ${activeSetting === 'profile' ? 'opacity-80' : (isDark ? 'text-gray-400' : 'text-black')}`}>
                  Account settings and profile
                </span>
              </div>
            </div>
            <ChevronRight size={20} />
          </div>

        </div>

      </main>

      {/* ================= RIGHT COLUMN: CONTENT ================= */}
      <aside
        className={`
          w-[620px] min-h-[740px] rounded-2xl shadow-sm p-3 transition-colors duration-300
          ${isDark ? 'bg-black text-white' : 'bg-white text-black'}
        `}
      >
        {activeSetting === 'dashboard' && (
            <div>
             <h2
              className={`flex items-center gap-3 mb-8 mt-2 ${isDark ? 'text-white' : 'text-black'}`}
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 400,
                fontSize: '27px',
                lineHeight: '100%',
                letterSpacing: '0%',
              }}
            >
              <BarChart3 size={28} strokeWidth={1.5} className={isDark ? "text-white" : "text-black"} />
              Dashboard & Visualization
            </h2>
          <div className="flex flex-col gap-6">
            
            {/* Theme Card */}
            <div className={`
                p-6 rounded-2xl !border-2 transition-colors
                ${isDark 
                  ? 'bg-black border-white text-white' 
                  : 'bg-white border-[#c0a6d3] text-black'
                }
            `}>
              <h3 className="text-2xl font-outfit font-medium mb-2">Theme</h3>
              <p className={`text-base font-outfit mb-6 ${isDark ? 'text-gray-300' : 'text-black'}`}>
                Choose your preferred color scheme
              </p>
              <CustomDropdown 
                options={themes} 
                defaultSelected={theme} 
                onSelect={handleThemeChange} 
                theme={theme} 
              />
            </div>

            {/* Time & Date Card */}
            <div className={`
                p-6 rounded-2xl !border-2 transition-colors
                ${isDark 
                  ? 'bg-black border-white text-white' 
                  : 'bg-white border-[#c0a6d3] text-black'
                }
            `}>
              <h3 className="text-2xl font-outfit font-medium mb-2">Time Zone & Date Format</h3>
              <p className={`text-base font-outfit mb-6 ${isDark ? 'text-gray-300' : 'text-black'}`}>
                Configure time and date display preferences
              </p>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-lg font-outfit font-medium block mb-2">Time Zone</label>
                  <CustomDropdown options={timeZones} theme={theme} />
                </div>
                <div>
                  <label className="text-lg font-outfit font-medium block mb-2">Date Format</label>
                  <CustomDropdown options={dateFormats} theme={theme} />
                </div>
              </div>
            </div>

            {/* Default Dashboard Card */}
            <div className={`
                p-6 rounded-2xl !border-2 transition-colors
                ${isDark 
                  ? 'bg-black border-white text-white' 
                  : 'bg-white border-[#c0a6d3] text-black'
                }
            `}>
              <h3 className="text-2xl font-outfit font-medium mb-2">Default Dashboard</h3>
              <p className={`text-base font-outfit mb-6 ${isDark ? 'text-gray-300' : 'text-black'}`}>
                Choose which analytics screen loads first
              </p>
              <CustomDropdown options={dashboards} theme={theme} />
            </div>
          </div>
          </div>
        )}

      {activeSetting === 'profile' && (
          <div>
            <h2 className={`flex items-center gap-3 mb-8 mt-2 ${isDark ? 'text-white' : 'text-black'}`} style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400, fontSize: '27px', lineHeight: '100%' }}>
              <User size={28} strokeWidth={1.5} className={isDark ? "text-white" : "text-black"} />
              User Profile & Account
            </h2>

            <div className="flex flex-col gap-6">

                {/* --- Profile Details Card --- */}
                <div className={`
                  p-4 rounded-sm shadow-sm !border transition-colors
                  ${isDark 
                    ? 'bg-black !border-white text-white' 
                    : 'bg-white border-gray-500 text-black'
                  }
                `}>
                    <h3 className="text-xl font-outfit font-normal mb-1">Profile Details</h3>
                    <p className={`text-sm font-outfit mb-6 font-light ${isDark ? 'text-gray-300' : 'text-black'}`}>Update your personal information and profile picture</p>

                    <div className="flex flex-col items-center gap-4 mb-6">
                        <img src={user2} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-gray-200" />
                        <div className="flex items-center gap-4">
                            <label className={`
                              px-4 py-1 rounded text-sm font-outfit font-normal cursor-pointer transition-colors border
                              ${isDark
                                ? 'bg-transparent !border !border-white text-white hover:bg-gray-800'
                                : 'bg-[#b794f4] border-transparent text-white hover:bg-[#a782e5]'
                              }
                            `}>
                                Change Picture
                                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                            </label>
                            <button className={`text-sm font-outfit cursor-pointer font-normal ${isDark ? 'text-white hover:text-gray-300' : 'text-black hover:text-black'}`}>Remove Picture</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className={`font-outfit font-medium mb-1.5 block ${isDark ? 'text-white' : 'text-black'}`}>First Name</label>
                            <input
                                type="text"
                                value={profile.firstName}
                                onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                                className={`w-full p-2 rounded-full outline-none border
                                  ${isDark 
                                    ? 'bg-transparent !border !border-white text-white placeholder-gray-400'  // CHANGED
                                    : 'bg-[#9871c5] border-transparent text-white'
                                  }
                                `}
                            />
                        </div>
                        <div>
                            <label className={`font-outfit font-medium mb-1.5 block ${isDark ? 'text-white' : 'text-black'}`}>Last Name</label>
                            <input
                                type="text"
                                value={profile.lastName}
                                onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                                className={`w-full p-2 rounded-full outline-none border
                                  ${isDark 
                                    ? 'bg-transparent !border !border-white text-white placeholder-gray-400' // CHANGED
                                    : 'bg-[#9871c5] border-transparent text-white'
                                  }
                                `}
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className={`font-outfit font-medium mb-1.5 block ${isDark ? 'text-white' : 'text-black'}`}>Email Address</label>
                        <input
                            type="email"
                            value={profile.email}
                            onChange={handleEmailChange}
                            className={`w-full p-2 rounded-full outline-none border
                              ${isDark 
                                ? 'bg-transparent !border !border-white text-white placeholder-gray-400' // CHANGED
                                : 'bg-[#9871c5] border-transparent text-white'
                              }
                            `}
                        />
                        {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                    </div>

                    <div className="mb-6">
                        <label className={`font-outfit font-medium mb-1.5 block ${isDark ? 'text-white' : 'text-black'}`}>Role</label>
                        <input
                            type="text"
                            value={profile.role}
                            readOnly
                            className={`w-full p-2 rounded-full outline-none border
                              ${isDark 
                                ? 'bg-transparent !border !border-white text-white' // CHANGED
                                : 'bg-[#9871c5] border-transparent text-white'
                              }
                            `}
                        />
                    </div>

                    <button className={`
                      px-4 py-1 rounded transition-colors text-sm font-outfit font-normal cursor-pointer border
                      ${isDark
                        ? 'bg-transparent !border !border-white text-white hover:bg-gray-800'
                        : 'bg-[#b794f4] border-transparent text-white hover:bg-[#a782e5]'
                      }
                    `}>
                        Save Changes
                    </button>
                </div>

                {/* --- Password & Security Card --- */}
                <div className={`
                  p-4 rounded-sm shadow-sm !border transition-colors
                  ${isDark 
                    ? 'bg-black !border !border-white text-white' 
                    : 'bg-white border-gray-500 text-black'
                  }
                `}>
                    <h3 className="text-xl font-outfit font-normal mb-1">Password & Security</h3>
                    <p className={`text-sm font-outfit mb-6 font-light ${isDark ? 'text-gray-300' : 'text-black'}`}>Manage your password and enable two-factor authentication</p>

                    <button className={`
                      w-full py-2 cursor-pointer rounded-full mb-6 text-sm font-outfit font-normal transition-colors border
                      ${isDark
                        ? 'bg-transparent !border !border-white text-white hover:bg-gray-800'
                        : 'bg-[#9871c5] border-transparent text-white hover:bg-[#8861b5]'
                      }
                    `}>
                        Change Password
                    </button>

                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h4 className="text-xl font-outfit text-base font-normal">Two-Factor Authentication</h4>
                            <p className={`text-sm font-sm font-outfit mt-1 ${isDark ? 'text-gray-300' : 'text-black'}`}>Add an extra layer of security to your account</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`text-xs font-medium font-outfit ${isDark ? 'text-white' : 'text-black'}`}>
                                {profile.twoFactor ? 'Enabled' : 'Disabled'}
                            </span>
                            <div
                                onClick={() => setProfile({...profile, twoFactor: !profile.twoFactor})}
                                className={`
                                  w-10 h-5 rounded-full relative cursor-pointer transition-colors border border-gray-300
                                  ${isDark 
                                    ? (profile.twoFactor ? 'bg-white' : 'bg-transparent')
                                    : (profile.twoFactor ? 'bg-[#3b0764]' : 'bg-gray-200')
                                  }
                                `}
                            >
                                <div className={`
                                  w-4 h-4 rounded-full absolute top-0.5 transition-all
                                  ${isDark
                                    ? (profile.twoFactor ? 'bg-black left-5' : 'bg-white left-0.5')
                                    : (profile.twoFactor ? 'bg-white left-5' : 'bg-white left-0.5')
                                  }
                                `}></div>
                            </div>
                        </div>
                    </div>

                    <button className={`
                      px-5 py-1 cursor-pointer rounded text-sm font-normal transition-colors border
                      ${isDark
                         ? 'bg-transparent !border !border-white text-white hover:bg-gray-800'
                         : 'bg-[#b794f4] border-transparent text-white hover:bg-[#a782e5]'
                      }
                    `}>
                        Manage Settings
                    </button>
                </div>

                {/* --- Account Actions Card --- */}
                <div className={`
                  p-4 rounded-sm shadow-sm !border transition-colors
                  ${isDark 
                    ? 'bg-black !border-white text-white' 
                    : 'bg-white !border-gray-500 text-black'
                  }
                `}>
                    <h3 className="text-xl font-outfit font-normal mb-1">Account Actions</h3>
                    <p className={`text-sm font-outfit mb-6 font-sm ${isDark ? 'text-gray-300' : 'text-black'}`}>Manage your account settings and preferences</p>

                    <div className="flex flex-col gap-3">
                        <button className={`
                          w-full py-2 cursor-pointer rounded-full text-sm font-outfit font-normal transition-colors border
                          ${isDark
                            ? 'bg-transparent !border !border-white text-white hover:bg-gray-800'
                            : 'bg-[#9871c5] border-transparent text-white hover:bg-[#8861b5]'
                          }
                        `}>
                            Export Account Data
                        </button>
                        <button className={`
                          w-full py-2 cursor-pointer rounded-full text-sm font-outfit font-normal transition-colors border
                          ${isDark
                            ? 'bg-transparent !border !border-white text-white hover:bg-gray-800'
                            : 'bg-[#9871c5] border-transparent text-white hover:bg-[#8861b5]'
                          }
                        `}>
                            Download Account Report
                        </button>
                        <button className="w-full cursor-pointer bg-red-600 text-white py-2 rounded-full text-sm font-outfit font-normal hover:bg-red-700 transition-colors">
                            Delete Account
                        </button>
                    </div>
                    <p className={`text-[10px] mt-3 text-left ${isDark ? 'text-gray-400' : 'text-black'}`}>This action cannot be undone. All your data will be permanently deleted.</p>
                </div>

            </div>
          </div>
        )}
      </aside>

    </div>
  );
};

export default Setting;
