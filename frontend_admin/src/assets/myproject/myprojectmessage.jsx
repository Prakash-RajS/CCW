import React, { useState } from "react";

import User1 from "../../assets/Landing/user1.png";
import User2 from "../../assets/Landing/user2.png";
import User3 from "../../assets/Landing/user3.png";
import User4 from "../../assets/Landing/user4.png";
import User5 from "../../assets/Landing/user5.png";

const usersData = [
  {
    id: 1,
    name: "Manmohan Desia",
    avatar: User1,
    lastMessage: "Sir please send the link",
    messages: [
      { from: "them", text: "Hi sir Good morning", time: "10:59 AM" },
      { from: "them", text: "Can we have a call by today at 7.00 clock", time: "11:00 AM" },
      { from: "me", text: "Good morning manmohan", time: "11:01 AM" },
    ],
  },
  {
    id: 2,
    name: "Adam Smit",
    avatar: User2,
lastMessage: "Lets connect now i am free",
  messages: [
      { from: "them", text: "Hi sir Good morning", time: "10:59 AM" },
      { from: "them", text: "Can we have a call by today at 7.00 clock", time: "11:00 AM" },
      { from: "me", text: "Good morning Adam Smit", time: "11:01 AM" },
    ],
  },
  {
    id: 3,
    name: "Kiran Kher",
    avatar: User3,
  lastMessage: "Can we discuss the project?",
   messages: [
      { from: "them", text: "Hi sir Good morning", time: "10:59 AM" },
      { from: "them", text: "Can we have a call by today at 7.00 clock", time: "11:00 AM" },
      { from: "me", text: "Good morning Kiran Kher", time: "11:01 AM" },
    ],
  },
  {
    id: 4,
    name: "Kabir khan",
    avatar: User4,
 lastMessage: "Please review the document",
   messages: [
      { from: "them", text: "Hi sir Good morning", time: "10:59 AM" },
      { from: "them", text: "Can we have a call by today at 7.00 clock", time: "11:00 AM" },
      { from: "me", text: "Good morning Kabir Khan", time: "11:01 AM" },
    ],
  },
  {
    id: 5,
    name: "Kajol Sharma",
    avatar: User5,
    lastMessage: "Thanks, waiting for update",
   messages: [
      { from: "them", text: "Hi sir Good morning", time: "10:59 AM" },
      { from: "them", text: "Can we have a call by today at 7.00 clock", time: "11:00 AM" },
      { from: "me", text: "Good morning manmohan", time: "11:01 AM" },
    ],
  },


  
];

export default function MyProjectmessage() {
  const [users, setUsers] = useState(usersData);
  const [activeUserId, setActiveUserId] = useState(1);
  const [input, setInput] = useState("");

  const activeUser = users.find((u) => u.id === activeUserId);

  const sendMessage = () => {
    if (!input.trim()) return;

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setUsers((prev) =>
      prev.map((u) =>
        u.id === activeUserId
          ? {
              ...u,
              messages: [...u.messages, { from: "me", text: input, time }],
            }
          : u
      )
    );

    setInput("");
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">

      {/* ================= HEADER ================= */}
      <div className="h-[72px] px-[60px] flex items-center justify-between">
        <h1
          className="text-[32px] font-bold"
          style={{
            fontFamily: "Trochut, cursive",
            background: "linear-gradient(270deg,#51218F 22.62%,#030303 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Talenta
        </h1>

        <button className="w-[36px] h-[36px] rounded-full bg-[#3B1B63] text-white">
          ✕
        </button>
      </div>

      {/* HEADER LINE */}
      <div className="w-full h-[1px] bg-black/10"></div>

     {/* ================= PAGE WRAPPER ================= */}
<div className="w-full h-screen overflow-hidden flex flex-col">

  {/* ================= MAIN ================= */}
  <div className="flex flex-1 max-w-[1440px] mx-auto w-full overflow-hidden">

    {/* ================= LEFT USERS ================= */}
  {/* SEARCH (FIXED) */}
<div className="px-6 py-6 shrink-0">
  <div className="relative">
    <input
      placeholder="Search"
      className="
        w-full
        h-[44px]
        rounded-full
        bg-gray-100
        pl-5
        pr-12
        outline-none
      "
    />

    {/* SEARCH SVG ICON */}
    <button
      type="button"
      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          cx="11"
          cy="11"
          r="7"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M20 20L17 17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  </div>

  {/* SEARCH BOTTOM LINE */}
  <div className="w-full h-[1px] bg-black/10 mt-6"></div>



      {/* USER LIST (LEFT SCROLLS ONLY HERE) */}
      <div className="flex-1 overflow-y-auto px-6">
        {users.map((user) => (
          <div key={user.id}>
            <div
              onClick={() => setActiveUserId(user.id)}
              className={`flex items-center gap-4 px-4 py-4 rounded-xl cursor-pointer transition
              ${
                activeUserId === user.id
                  ? "bg-[#51218F]"
                  : "hover:bg-gray-100"
              }`}
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-[46px] h-[46px] rounded-full object-cover"
              />

              <div className="flex-1">
                <p
                  className={`text-[14px] font-semibold ${
                    activeUserId === user.id ? "text-white" : "text-black"
                  }`}
                >
                  {user.name}
                </p>
                <p
                  className={`text-[12px] truncate ${
                    activeUserId === user.id
                      ? "text-white/80"
                      : "text-gray-500"
                  }`}
                >
                  {user.lastMessage}
                </p>
              </div>
            </div>

            <div className="w-full h-[1px] bg-black/10 my-2"></div>
          </div>
        ))}
      </div>
    </div>

    {/* CENTER DIVIDER */}
    <div className="w-[1px] bg-black/10"></div>

    {/* ================= RIGHT CHAT ================= */}
    <div className="flex-1 flex flex-col h-full overflow-hidden">

      {/* CHAT HEADER (FIXED) */}
      <div className="h-[72px] px-8 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <img
            src={activeUser.avatar}
            alt={activeUser.name}
            className="w-[42px] h-[42px] rounded-full"
          />
          <p className="font-semibold">{activeUser.name}</p>
        </div>

        <div className="flex gap-5 text-[#51218F]">
          <span className="cursor-pointer">📞</span>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="6" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M16 10L22 7V17L16 14V10Z" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
      </div>

      <div className="w-full h-[1px] bg-black/10"></div>

      {/* RIGHT CHAT SCROLLS ONLY HERE */}
      <div className="flex-1 px-10 py-6 space-y-4 overflow-y-auto">
        {activeUser.messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.from === "me" ? "justify-end" : "items-start gap-3"
            }`}
          >
            {msg.from === "them" && (
              <img
                src={activeUser.avatar}
                className="w-[32px] h-[32px] rounded-full"
              />
            )}

            <div
              className={`px-5 py-3 rounded-[20px] text-[14px] max-w-[420px]
              ${
                msg.from === "me"
                  ? "bg-[#51218F] text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              <p>{msg.text}</p>
              <p className="text-[10px] text-right mt-1 opacity-70">
                {msg.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full h-[1px] bg-black/10"></div>

      {/* INPUT (FIXED) */}
      <div className="h-[80px] px-8 flex items-center gap-4 shrink-0">
        <button className="text-[#51218F]">🖼️</button>
        <button className="text-[#51218F]">GIF</button>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type here..."
          className="flex-1 h-[44px] bg-gray-100 rounded-full px-6 outline-none"
        />

        <button onClick={sendMessage} className="text-[#51218F] text-xl">
          ➤
        </button>
      </div>
    </div>
  </div>
</div>

    </div>
  );
}
