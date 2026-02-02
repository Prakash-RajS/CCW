import React, { useState, useEffect } from "react";
import {
  User, ChevronDown, X, Search, Plus, Pencil,
  Trash2, Calendar, Award, Share, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight
} from "lucide-react";
import user1 from "../../assets/Adminimages/user1.png";
import user2 from "../../assets/Adminimages/user2.png";
import user3 from "../../assets/Adminimages/user3.png";
import user4 from "../../assets/Adminimages/user4.png";
import user5 from "../../assets/Adminimages/user5.png";
import user6 from "../../assets/Adminimages/user6.png";
import user7 from "../../assets/Adminimages/user7.png";
import user8 from "../../assets/Adminimages/user8.png";
import user9 from "../../assets/Adminimages/user9.png";
import user10 from "../../assets/Adminimages/user10.png";
import user11 from "../../assets/Adminimages/user11.png";

const UserPage = () => {
  const userImages = [
    user1, user2, user3, user4, user5, user6,
    user7, user8, user9, user10, user11,
  ];

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const users = [
    { name: "James", email: "James@gmail.com", user: "Jam124", status: "Active", role: "Creator", date: "March 12, 2023", active: "1 minute ago", img: "https://i.pravatar.cc/150?u=1" },
    { name: "Michael", email: "Michael@gmail.com", user: "Mic457", status: "Inactive", role: "Collaborator", date: "June 27, 2022", active: "1 month ago", img: "https://i.pravatar.cc/150?u=2" },
    { name: "John", email: "John@gmail.com", user: "John3", status: "Banned", role: "Creator", date: "January 8, 2024", active: "4 days ago", img: "https://i.pravatar.cc/150?u=3" },
    { name: "Robert", email: "Robert@gmail.com", user: "Robe12", status: "Active", role: "Creator", date: "October 5, 2021", active: "10 days ago", img: "https://i.pravatar.cc/150?u=4" },
    { name: "David", email: "David@gmail.com", user: "David7", status: "Active", role: "Creator", date: "February 19, 2023", active: "3 months ago", img: "https://i.pravatar.cc/150?u=5" },
    { name: "Isabelle Clark", email: "Isabelle@gmail.com", user: "Isab47", status: "Active", role: "Creator", date: "August 30, 2022", active: "1 week ago", img: "https://i.pravatar.cc/150?u=6" },
    { name: "William", email: "William@gmail.com", user: "William", status: "Active", role: "Collaborator", date: "April 23, 2024", active: "4 hours ago", img: "https://i.pravatar.cc/150?u=7" },
    { name: "Richard", email: "Richard@gmail.com", user: "Richard32", status: "Banned", role: "Collaborator", date: "April 14, 2020", active: "2 months ago", img: "https://i.pravatar.cc/150?u=8" },
    { name: "Amanda", email: "Amanda@gmail.com", user: "Amandas009", status: "Inactive", role: "Creator", date: "July 6, 2023", active: "3 hours ago", img: "https://i.pravatar.cc/150?u=9" },
    { name: "Angela", email: "Angela@gmail.com", user: "Ange", status: "Inactive", role: "Collaborator", date: "June 31, 2021", active: "4 months ago", img: "https://i.pravatar.cc/150?u=10" },
    { name: "Olivia", email: "Olivia@gmail.com", user: "Oliviai", status: "Active", role: "Creator", date: "August 10, 2024", active: "15 minutes ago", img: "https://i.pravatar.cc/150?u=11" },
  ];

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

  return (
    <div className={`w-full h-full ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* ================= USER CONTENT STARTS HERE ================= */}
      <div className="px-0 md:px-0 pt-0 pb-8 max-w-[1400px] mx-auto">
        
       {/* USER MANAGEMENT HEADER */}
<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-6">
  <div className="flex flex-col flex-1">
    <h2 className={`text-2xl md:text-[32px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}>
      User Management
    </h2>
    <p className={`text-sm mt-1 max-w-[550px] ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>
      Manage all users in one place. Control access, assign roles, and monitor activity across your platform.
    </p>
  </div>

  <div className="flex flex-row gap-2 md:gap-3 w-full lg:w-auto shrink-0 mt-4 lg:mt-0">
    {[
      { label: "All Users", val: "1250" },
      { label: "Active", val: "1125", dot: true },
      { label: "Suspended", val: "12" }
    ].map((item, i) => (
      <div
        key={i}
        className={`
          flex-1 lg:flex-none lg:px-6 px-1 py-2 rounded-xl text-center
          bg-transparent
          border-[2px] ${isDarkMode ? 'border-white shadow-[0_0_0_1px_rgba(255,255,255,0.9)]' : 'border-black shadow-[0_0_0_1px_rgba(0,0,0,0.9)]'}
        `}
      >
        <p className={`text-[9px] sm:text-[10px] md:text-[12px] font-bold flex items-center justify-center gap-1 whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-black'}`}>
          {item.label}
          {item.dot && (
            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#05CD99] rounded-full shrink-0" />
          )}
        </p>
        <p className={`text-lg sm:text-xl md:text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}>
          {item.val}
        </p>
      </div>
    ))}
  </div>
</div>


{/* ================= FILTER BAR ================= */}
<div className="overflow-x-auto no-scrollbar mb-6 -mx-4 px-4 lg:mx-0 lg:px-0">
  <div
    className={`
      rounded-xl
      px-4 py-3 flex items-center gap-3 min-w-max
      transition-colors duration-300
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
    {/* ================= SEARCH ================= */}
    <div className="bg-white rounded-full px-4 h-[38px] flex items-center w-[180px] md:w-[240px] shrink-0">
      <Search size={16} className="mr-2 text-[#3D1768]" />
      <input
        placeholder="Search"
        className="bg-transparent outline-none text-[13px] w-full font-medium text-[#3D1768] placeholder-[#3D1768]/60"
      />
    </div>

    {/* ================= ROLE ================= */}
    <button className="bg-white px-4 h-[38px] rounded-full text-[12px] font-bold flex items-center gap-2 shrink-0 text-[#3D1768]">
      <User size={16} /> Role <ChevronDown size={14} />
    </button>

    {/* ================= STATUS ================= */}
    <button className="bg-white px-4 h-[38px] rounded-full text-[12px] font-bold flex items-center gap-2 shrink-0 text-[#3D1768]">
      <Award size={16} /> Status <ChevronDown size={14} />
    </button>

    {/* ================= DATE ================= */}
    <button className="bg-white px-4 h-[38px] rounded-full text-[12px] font-bold flex items-center gap-2 shrink-0 text-[#3D1768]">
      <Calendar size={16} /> Date <ChevronDown size={14} />
    </button>

    <div className="flex-grow min-w-[20px]" />

    {/* ================= ACTIONS ================= */}
    <div className="flex gap-2 shrink-0">
      <button className="bg-white px-4 h-[38px] rounded-full text-[12px] font-bold flex items-center gap-2 text-[#3D1768]">
        <Share size={16} /> Export
      </button>

      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-white px-4 h-[38px] rounded-full text-[12px] font-bold flex items-center gap-2 text-[#3D1768]"
      >
        <Plus size={16} /> Add User
      </button>
    </div>
  </div>
</div>


{/* TABLE SECTION */}
<div className={`mb-4 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
  <div className="w-full overflow-x-auto">
    <table className="w-full min-w-[800px] lg:min-w-full text-left">

      {/* TABLE HEAD */}
      <thead className={`text-[12px] font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
        <tr className="shadow-[inset_0_-2px_0_#ffffff]">
          <th className="px-3 py-3 w-[15%]">Full Name</th>
          <th className="px-3 py-3 w-[20%]">Email</th>
          <th className="px-3 py-3 w-[12%]">Username</th>
          <th className="px-3 py-3 w-[10%]">Status</th>
          <th className="px-3 py-3 w-[10%]">Role</th>
          <th className="px-3 py-3 w-[13%]">Joined Date</th>
          <th className="px-3 py-3 w-[12%]">Last Active</th>
          <th className="px-3 py-3 text-center w-[8%]">Actions</th>
        </tr>
      </thead>

      {/* TABLE BODY */}
      <tbody>
        {users.map((u, i) => (
          <tr
            key={i}
            className={`
              text-[11px] lg:text-[13px]
              shadow-[inset_0_-2px_0_#ffffff]
              hover:bg-white/5
              transition-colors
              ${isDarkMode ? 'text-white' : 'text-black'}
            `}
          >
            {/* Full Name */}
            <td className="px-3 py-4">
              <div className="flex items-center gap-2 font-semibold">
                <img
                  src={userImages[i % userImages.length]}
                  className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full shrink-0 border-2 object-cover ${isDarkMode ? 'border-white' : 'border-black'}`}
                  alt={u.name}
                />
                <span className="truncate">{u.name}</span>
              </div>
            </td>

            {/* Email */}
            <td className="px-3 py-4">{u.email}</td>

            {/* Username */}
            <td className="px-3 py-4">{u.user}</td>

{/* Status */}
<td className="px-3 py-4 text-center">
  <span
    className={`text-[11px] lg:text-[13px] font-bold
      ${
        u.status === 'Active'
          ? 'text-green-500'
          : u.status === 'Inactive'
          ? 'text-gray-400'
          : 'text-red-500'
      }`}
  >
    {u.status}
  </span>
</td>


            {/* Role */}
            <td className="px-3 py-4">{u.role}</td>

            {/* Joined Date */}
            <td className="px-3 py-4">{u.date}</td>

            {/* Last Active */}
            <td className={`px-3 py-4 ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>{u.active}</td>

            {/* Actions */}
            <td className="px-3 py-4">
              <div className="flex justify-center gap-3">
                <Pencil
                  size={16}
                  className="cursor-pointer hover:scale-125 transition-transform"
                  onClick={() => {
                    setSelectedUser(u);
                    setIsEditModalOpen(true);
                  }}
                />
                <Trash2
                  size={16}
                  className="text-red-500 cursor-pointer hover:scale-125 transition-transform"
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>

    </table>
  </div>
</div>


{/* PAGINATION SECTION */}
<div className={`flex flex-col md:flex-row justify-between items-center gap-4 px-2 py-4 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>

  {/* ROWS INFO */}
  <div className={`flex items-center gap-2 order-2 md:order-1 ${isDarkMode ? 'text-white/80' : 'text-black/80'}`}>
    Rows per page
    <select
      className={`
        bg-transparent
        px-3 py-1.5
        rounded-full
        font-medium
        border-2 focus:outline-none
        ${isDarkMode ? 'text-white border-white' : 'text-black border-black'}
      `}
    >
      <option className="text-black">10</option>
    </select>
    of 140 rows
  </div>

  {/* PAGINATION */}
  <div className="flex items-center gap-2 order-1 md:order-2">

    {/* LEFT ARROWS */}
    <button className={`w-9 h-9 rounded-full border-2 flex items-center justify-center hover:bg-black/10 ${isDarkMode ? 'border-white text-white hover:bg-white/10' : 'border-black text-black hover:bg-white/10'}`}>
      <ChevronsLeft size={18} />
    </button>

    <button className={`w-9 h-9 rounded-full border-2 flex items-center justify-center hover:bg-black/10 ${isDarkMode ? 'border-white text-white hover:bg-white/10' : 'border-black text-black hover:bg-white/10'}`}>
      <ChevronLeft size={18} />
    </button>

    {/* ACTIVE PAGE */}
    <button className={`w-9 h-9 rounded-full flex items-center justify-center font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
      1
    </button>

    {/* PAGE NUMBERS */}
    <button className={`w-9 h-9 rounded-full border-2 flex items-center justify-center hover:bg-black/10 ${isDarkMode ? 'border-white text-white hover:bg-white/10' : 'border-black text-black hover:bg-white/10'}`}>
      2
    </button>

    <button className={`w-9 h-9 rounded-full border-2 flex items-center justify-center hover:bg-black/10 ${isDarkMode ? 'border-white text-white hover:bg-white/10' : 'border-black text-black hover:bg-white/10'}`}>
      3
    </button>

    <span className={`px-1 md:px-2 font-bold ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>...</span>

    <button className={`w-9 h-9 rounded-full border-2 flex items-center justify-center hover:bg-black/10 ${isDarkMode ? 'border-white text-white hover:bg-white/10' : 'border-black text-black hover:bg-white/10'}`}>
      10
    </button>

    {/* RIGHT ARROWS */}
    <button className={`w-9 h-9 rounded-full border-2 flex items-center justify-center hover:bg-black/10 ${isDarkMode ? 'border-white text-white hover:bg-white/10' : 'border-black text-black hover:bg-white/10'}`}>
      <ChevronRight size={18} />
    </button>

    <button className={`w-9 h-9 rounded-full border-2 flex items-center justify-center hover:bg-black/10 ${isDarkMode ? 'border-white text-white hover:bg-white/10' : 'border-black text-black hover:bg-white/10'}`}>
      <ChevronsRight size={18} />
    </button>

  </div>
</div>

      </div>

      {/* ================= MODALS ================= */}

      {/* ADD USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div className="bg-white rounded-[20px] p-6 w-full max-w-[500px] shadow-2xl relative">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <h3 className="text-xl md:text-[22px] font-bold text-[#1B2559]">Add Users</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white rounded-full p-1 hover:opacity-90"
                style={{ background: "linear-gradient(90deg, #3D1768 0%, #020202 100%)" }}>
                <X size={18} strokeWidth={3} />
              </button>
            </div>

            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                setIsModalOpen(false);
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] font-semibold text-black">Name</label>
                  <input type="text" defaultValue="James" className="w-full bg-[#F4F7FE] border-none rounded-[12px] px-4 py-2.5 text-[14px] text-black outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] font-semibold text-black">User name</label>
                  <input type="text" defaultValue="James42" className="w-full bg-[#F4F7FE] border-none rounded-[12px] px-4 py-2.5 text-[14px] text-black outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] font-semibold text-black">Email Address</label>
                  <input type="email" defaultValue="James@gmail.com" className="w-full bg-[#F4F7FE] border-none rounded-[12px] px-4 py-2.5 text-[14px] text-black outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] font-semibold text-black">Role</label>
                  <input type="text" defaultValue="Creator" className="w-full bg-[#F4F7FE] border-none rounded-[12px] px-4 py-2.5 text-[14px] text-black outline-none" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  className="w-full text-white px-6 py-2.5 rounded-[10px] text-[14px] font-bold hover:opacity-90 shadow-lg"
                  style={{ background: "linear-gradient(90deg, #3D1768 0%, #020202 100%)" }}
                >
                  Save Change
                </button>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full bg-white text-black px-8 py-2.5 rounded-[10px] text-[14px] font-bold border-[3px] border-black hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div className="bg-white p-8 w-full max-w-lg rounded-[24px] shadow-2xl relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-black font-sans">Edit Users</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-white rounded-full p-1.5 hover:opacity-90 transition-opacity flex items-center justify-center"
                style={{ background: "linear-gradient(90deg, #3D1768 0%, #020202 100%)" }}
              >
                <X size={18} strokeWidth={3} />
              </button>
            </div>

            <hr className="border-gray-100 mb-8" />

            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsEditModalOpen(false); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#8E92BC] text-[13px] font-semibold">Name</label>
                  <input
                    type="text"
                    defaultValue={selectedUser?.name}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#3D1768] text-black text-sm font-medium bg-[#F4F7FE]/50"
                    placeholder="James"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#8E92BC] text-[13px] font-semibold">User name</label>
                  <input
                    type="text"
                    defaultValue={selectedUser?.user}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#3D1768] text-black text-sm font-medium bg-[#F4F7FE]/50"
                    placeholder="James42"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#8E92BC] text-[13px] font-semibold">Email Address</label>
                  <input
                    type="email"
                    defaultValue={selectedUser?.email}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#3D1768] text-black text-sm font-medium bg-[#F4F7FE]/50"
                    placeholder="James@gmail.com"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#8E92BC] text-[13px] font-semibold">Role</label>
                  <input
                    type="text"
                    defaultValue={selectedUser?.role}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#3D1768] text-black text-sm font-medium bg-[#F4F7FE]/50"
                    placeholder="Creator"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  className="w-full text-white py-3 rounded-xl font-bold hover:opacity-90 shadow-lg transition-all"
                  style={{ background: "linear-gradient(90deg, #3D1768 0%, #020202 100%)" }}
                >
                  Save Change
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-full bg-white text-black py-3 rounded-xl font-bold border-[3px] border-black ring-[3px] ring-black ring-offset-0 shadow-[0_0_0_2px_#000] hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;