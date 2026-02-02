import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import User1 from "../../assets/myproject/user1.png";
import User2 from "../../assets/myproject/user2.png";
import User3 from "../../assets/myproject/user3.png";
import User4 from "../../assets/myproject/user4.png";
import User5 from "../../assets/myproject/user5.png";

const usersData = [
  { id: 1, name: "Manmohan Desia", avatar: User1, lastMessage: "Sir please send the link",
    messages: [
      { from: "them", text: "Hi sir Good morning", time: "10:59 AM" },
      { from: "them", text: "Can we have a call by today at 7.00 clock", time: "11:00 AM" },
      { from: "me", text: "Good morning manmohan", time: "11:01 AM" },
    ]},
  { id: 2, name: "Adam Smit", avatar: User2, lastMessage: "Lets connect now i am free",
    messages: [
      { from: "them", text: "Hi sir Good morning", time: "10:59 AM" },
      { from: "them", text: "Can we have a call by today at 7.00 clock", time: "11:00 AM" },
      { from: "me", text: "Good morning Adam Smit", time: "11:01 AM" },
    ]},
  { id: 3, name: "Kiran Kher", avatar: User3, lastMessage: "Can we discuss the project?",
    messages: [
      { from: "them", text: "Hi sir Good morning", time: "10:59 AM" },
      { from: "them", text: "Can we have a call by today at 7.00 clock", time: "11:00 AM" },
      { from: "me", text: "Good morning Kiran Kher", time: "11:01 AM" },
    ]},
  { id: 4, name: "Kabir khan", avatar: User4, lastMessage: "Please review the document",
    messages: [
      { from: "them", text: "Hi sir Good morning", time: "10:59 AM" },
      { from: "them", text: "Can we have a call by today at 7.00 clock", time: "11:00 AM" },
      { from: "me", text: "Good morning Kabir Khan", time: "11:01 AM" },
    ]},
  { id: 5, name: "Kajol Sharma", avatar: User5, lastMessage: "Thanks, waiting for update",
    messages: [
      { from: "them", text: "Hi sir Good morning", time: "10:59 AM" },
      { from: "them", text: "Can we have a call by today at 7.00 clock", time: "11:00 AM" },
      { from: "me", text: "Good morning Kajol Sharma", time: "11:01 AM" },
    ]},
];

export default function MyProjectmessage() {
  const [users, setUsers] = useState(usersData);
  const [activeUserId, setActiveUserId] = useState(1);
  const [input, setInput] = useState("");
  const [showChatMobile, setShowChatMobile] = useState(false);
  const navigate = useNavigate();

  const activeUser = users.find(u => u.id === activeUserId);

  const sendMessage = () => {
    if (!input.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setUsers(prev => prev.map(u =>
      u.id === activeUserId ? { ...u, messages: [...u.messages, { from: "me", text: input, time }] } : u
    ));

    setInput("");
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col">

      {/* HEADER */}
      <div className="h-[72px] px-6 md:px-[60px] flex items-center justify-between">
        <h1 className="text-[28px] md:text-[32px] font-bold"
          style={{
            fontFamily: "Trochut, cursive",
            background: "linear-gradient(270deg,#51218F 22.62%,#030303 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
          Talenta
        </h1>

        <button onClick={() => navigate(-1)} className="w-[36px] h-[36px] rounded-full bg-[#3B1B63] text-white">
          ✕
        </button>
      </div>

      <div className="w-full h-[1px] bg-black/10" />

      {/* MAIN */}
      <div className="flex flex-1 max-w-[1440px] mx-auto w-full overflow-hidden flex-col md:flex-row">

        {/* LEFT USERS */}
        <div className={`md:w-[380px] flex flex-col ${showChatMobile ? "hidden md:flex" : "flex"}`}>
          <div className="px-6 py-6">
            <input placeholder="Search" className="w-full h-[44px] rounded-full bg-gray-100 px-5 outline-none" />
            <div className="w-full h-[1px] bg-black/10 mt-6" />
          </div>

          <div className="flex-1 overflow-y-auto px-6">
            {users.map(user => (
              <div key={user.id} onClick={() => { setActiveUserId(user.id); setShowChatMobile(true); }}
                className={`flex items-center gap-4 px-4 py-4 rounded-xl cursor-pointer ${activeUserId === user.id ? "bg-[#51218F] text-white" : "hover:bg-gray-100"}`}>
                <img src={user.avatar} className="w-[46px] h-[46px] rounded-full" />
                <div className="flex-1">
                  <p className="text-[14px] font-semibold">{user.name}</p>
                  <p className="text-[12px] truncate">{user.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT CHAT */}
        <div className={`flex-1 flex flex-col ${showChatMobile ? "flex" : "hidden md:flex"}`}>

          {/* CHAT HEADER */}
          <div className="h-[72px] px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setShowChatMobile(false)} className="md:hidden text-[#51218F]">←</button>
              <img src={activeUser.avatar} className="w-[42px] h-[42px] rounded-full" />
              <p className="font-semibold">{activeUser.name}</p>
            </div>
          </div>

          <div className="w-full h-[1px] bg-black/10" />

          {/* MESSAGES */}
          <div className="flex-1 px-6 py-6 space-y-4 overflow-y-auto">
            {activeUser.messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === "me" ? "justify-end" : "items-start gap-3"}`}>
                {msg.from === "them" && <img src={activeUser.avatar} className="w-[32px] h-[32px] rounded-full" />}
                <div className={`px-5 py-3 rounded-[20px] max-w-[420px] ${msg.from === "me" ? "bg-[#51218F] text-white" : "bg-gray-200"}`}>
                  <p>{msg.text}</p>
                  <p className="text-[10px] text-right opacity-70">{msg.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full h-[1px] bg-black/10" />

          {/* INPUT */}
          <div className="h-[80px] px-6 flex items-center gap-4">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Type here..." className="flex-1 h-[44px] bg-gray-100 rounded-full px-6 outline-none" />
            <button onClick={sendMessage} className="text-[#51218F] text-xl">➤</button>
          </div>

        </div>
      </div>
    </div>
  );
}
