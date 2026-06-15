import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import api from "../../utils/axiosConfig";
import toast from "../../component/Toast"; 
import UserAvatar from "../../assets/myproject/user1.png";

export default function MyProjectmessage() {
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showChatMobile, setShowChatMobile] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState({});
  const [typingStatus, setTypingStatus] = useState({});
  const [ws, setWs] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);

  const { userData } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (!userData?.id) return;

    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//${window.location.host}/api/message/ws/${userData.id}`;

    console.log("🔄 Connecting to WebSocket:", wsUrl);
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log("✅ WebSocket connected");
      setReconnectAttempts(0);
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📨 WebSocket message:", data);

        if (data.type === "new_message") {
          // New message received
          if (data.sender_id === activeUser?.id) {
            // Add message to current conversation
            setMessages(prev => [...prev, {
              id: data.message_id,
              sender: data.sender_id,
              content: data.content,
              file_url: data.file_url,
              message_type: data.message_type,
              created_at: data.timestamp,
              is_seen: false
            }]);
          } else {
            // Update user list to show unread count
            fetchUsers();
          }
        } else if (data.type === "typing") {
          // Update typing status
          if (data.user_id === activeUser?.id) {
            setTypingStatus(prev => ({ ...prev, [data.user_id]: data.is_typing }));

            // Clear typing indicator after 3 seconds
            if (data.is_typing) {
              setTimeout(() => {
                setTypingStatus(prev => ({ ...prev, [data.user_id]: false }));
              }, 3000);
            }
          }
        } else if (data.type === "pong") {
          // Connection is alive
          console.log("💓 Heartbeat received");
        } else if (data.type === "connected") {
          console.log("✅ Connected confirmation received");
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    websocket.onclose = () => {
      console.log("🔌 WebSocket disconnected");
      // Attempt to reconnect after delay
      if (reconnectAttempts < 5) {
        setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          connectWebSocket();
        }, 3000 * (reconnectAttempts + 1));
      }
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setWs(websocket);

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, [userData?.id, activeUser?.id, reconnectAttempts]);

  // Heartbeat to keep user online
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(async () => {
      if (userData?.id) {
        try {
          await api.post(`/message/user/heartbeat?user_id=${userData.id}`);
        } catch (error) {
          console.error("Heartbeat failed:", error);
        }
      }
    }, 30000); // Every 30 seconds
  }, [userData?.id]);

  useEffect(() => {
    if (userData?.id) {
      connectWebSocket();
      startHeartbeat();

      return () => {
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }
      };
    }
  }, [userData?.id, connectWebSocket, startHeartbeat]);

  // Fetch users list
  const fetchUsers = async () => {
    if (!userData?.id) return;

    try {
      setLoading(true);
      const response = await api.get("/message/users", {
        params: { current_user_id: userData.id }
      });

      console.log("Users response:", response.data);
      setUsers(response.data);

      // Update online status map
      const onlineMap = {};
      response.data.forEach(user => {
        onlineMap[user.id] = user.online;
      });
      setOnlineStatus(onlineMap);

      // Check if there's a user to open from navigation state
const receiverId = location.state?.receiverId || location.state?.userId;
if (receiverId) {
  const userToOpen = response.data.find(u => u.id === receiverId);
  if (userToOpen) {
    // Only set if not already set
    if (!activeUser || activeUser.id !== userToOpen.id) {
      setActiveUser(userToOpen);
      setShowChatMobile(true);
      await fetchMessages(userToOpen.id);
    }
  } else if (!activeUser) {
    // If user is not in the list yet, create a temporary user object
    const tempUser = {
      id: receiverId,
      name: location.state?.userName || `User ${receiverId}`,
      email: location.state?.userEmail || "",
      online: false,
      last_message: "No messages yet"
    };
    setActiveUser(tempUser);
    setShowChatMobile(true);
    await fetchMessages(receiverId);
  }
}
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Ensure user exists in users list
  const ensureUserInList = useCallback((userId, userName, userEmail) => {
    setUsers(prev => {
      const userExists = prev.some(u => u.id === userId);
      if (!userExists) {
        return [...prev, {
          id: userId,
          name: userName || `User ${userId}`,
          email: userEmail || "",
          online: false,
          last_message: "No messages yet"
        }];
      }
      return prev;
    });
  }, []);

  const fetchMessages = async (otherUserId) => {
    if (!userData?.id) return;

    try {
      const response = await api.get(`/message/conversation/${userData.id}/${otherUserId}`);
      console.log("Messages response:", response.data);

      setMessages(response.data.messages || []);

      // Ensure user appears in users list
      if (activeUser) {
        ensureUserInList(otherUserId, activeUser.name, activeUser.email);
      }

      // Mark messages as seen
      if (response.data.conversation_id) {
        await api.post(`/message/seen/${response.data.conversation_id}/${userData.id}`);
      }

      // Update online and typing status
      setOnlineStatus(prev => ({ ...prev, [otherUserId]: response.data.other_user_online }));
      setTypingStatus(prev => ({ ...prev, [otherUserId]: response.data.other_user_typing }));

    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    }
  };

  // Send typing indicator
  const sendTypingIndicator = async (isTyping) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(JSON.stringify({
      type: "typing",
      user_id: userData.id,
      chat_with: activeUser?.id,
      is_typing: isTyping
    }));
  };

  // Handle input change with typing indicator
  const handleInputChange = (e) => {
    setInput(e.target.value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    sendTypingIndicator(true);

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(false);
    }, 1000);
  };

  // Send message
  const sendMessage = async () => {
    if (!input.trim() && !selectedFile) return;
    if (!activeUser) return;

    setSending(true);

    try {
      const formData = new FormData();
      formData.append("sender_id", userData.id);
      formData.append("receiver_id", activeUser.id);
      if (input.trim()) {
        formData.append("content", input.trim());
      }
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const response = await api.post("/message/send", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      console.log("Message sent:", response.data);

      // Add message to local state
      const newMessage = {
        id: response.data.message_id,
        sender: userData.id,
        content: input.trim() || (selectedFile?.name || "File sent"),
        file_url: response.data.file_url,
        message_type: response.data.message_type,
        created_at: response.data.created_at,
        is_seen: false
      };

      setMessages(prev => [...prev, newMessage]);
      setInput("");
      setSelectedFile(null);
      setFilePreview(null);

      // Clear typing indicator
      sendTypingIndicator(false);

    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // Handle file selection
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle user selection
  const handleUserSelect = async (user) => {
    setActiveUser(user);
    setShowChatMobile(true);
    await fetchMessages(user.id);

    // Mark user as read in users list
    setUsers(prev => prev.map(u =>
      u.id === user.id ? { ...u, unread_count: 0 } : u
    ));
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  // Format date for message grouping
  const formatMessageDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
      } else {
        return date.toLocaleDateString();
      }
    } catch {
      return "";
    }
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = {};
    messages.forEach(msg => {
      const date = formatMessageDate(msg.created_at);
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  // Render message content
  const renderMessageContent = (msg) => {
    if (msg.message_type === "image" && msg.file_url) {
      return (
        <img
          src={msg.file_url}
          alt="Shared image"
          className="max-w-[200px] max-h-[200px] rounded-lg cursor-pointer"
          onClick={() => window.open(msg.file_url, "_blank")}
        />
      );
    } else if (msg.message_type === "file" && msg.file_url) {
      return (
        <a
          href={msg.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-blue-600 underline"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {msg.content || "Download file"}
        </a>
      );
    } else {
      return <p>{msg.content}</p>;
    }
  };

  useEffect(() => {
  if (userData?.id) {
    fetchUsers();

    // Also check if we have a receiverId from navigation state
    const receiverId = location.state?.receiverId || location.state?.userId;
    if (receiverId && !activeUser) {
      // Fetch messages directly even if user not in list yet
      fetchMessages(receiverId);
      // Create temporary active user only if not already set
      if (!activeUser) {
        setActiveUser({
          id: receiverId,
          name: location.state?.userName || `User ${receiverId}`,
          email: location.state?.userEmail || "",
          online: false,
          last_message: "Loading..."
        });
        setShowChatMobile(true);
      }
    }
  }
}, [userData?.id, location.state]);

  // Get user avatar URL
  const getUserAvatar = (user) => {
    if (user?.profile_picture) {
      return user.profile_picture;
    }
    return UserAvatar;
  };

  if (loading && users.length === 0) {
    return (
      <div className="w-full h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-white flex flex-col">
     

      {/* HEADER */}
      <div className="h-[72px] px-6 md:px-[60px] flex items-center justify-between">
        <h1
          className="text-[28px] md:text-[32px] font-bold"
          style={{
            fontFamily: "Trochut, cursive",
            background: "linear-gradient(270deg,#51218F 22.62%,#030303 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Talenta
        </h1>

        <button
          onClick={() => navigate(-1)}
          className="w-[36px] h-[36px] rounded-full bg-[#3B1B63] text-white flex items-center justify-center"
        >
          ✕
        </button>
      </div>

      <div className="w-full h-[1px] bg-black/10" />

      {/* MAIN */}
      <div className="flex flex-1 max-w-[1440px] mx-auto w-full overflow-hidden flex-col md:flex-row">
        {/* LEFT USERS */}
        <div className={`md:w-[380px] flex flex-col ${showChatMobile ? "hidden md:flex" : "flex"}`}>
          <div className="px-6 py-6">
            <input
              placeholder="Search users..."
              className="w-full h-[44px] rounded-full bg-gray-100 px-5 outline-none"
              onChange={(e) => {
                const searchTerm = e.target.value.toLowerCase();
                if (!searchTerm) {
                  fetchUsers();
                } else {
                  setUsers(prev => prev.filter(u =>
                    u.name.toLowerCase().includes(searchTerm)
                  ));
                }
              }}
            />
            <div className="w-full h-[1px] bg-black/10 mt-6" />
          </div>

          <div className="flex-1 overflow-y-auto px-6">
            {users.map(user => (
              <div
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className={`flex items-center gap-4 px-4 py-4 rounded-xl cursor-pointer transition-all ${activeUser?.id === user.id
                  ? "bg-[#51218F] text-white"
                  : "hover:bg-gray-100"
                  }`}
              >
                <div className="relative">
                  <img
                    src={getUserAvatar(user)}
                    alt={user.name}
                    className="w-[46px] h-[46px] rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = UserAvatar;
                    }}
                  />
                  {onlineStatus[user.id] && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="text-[14px] font-semibold truncate">{user.name}</p>
                    {user.last_message_time && (
                      <p className="text-[10px] opacity-70">
                        {formatTime(user.last_message_time)}
                      </p>
                    )}
                  </div>
                  <p className="text-[12px] truncate">{user.last_message || "No messages yet"}</p>
                </div>

                {user.unread_count > 0 && (
                  <div className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                    {user.unread_count}
                  </div>
                )}
              </div>
            ))}

            {users.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                No users found
              </div>
            )}
          </div>
        </div>

        {/* RIGHT CHAT */}
        <div className={`flex-1 flex flex-col ${showChatMobile ? "flex" : "hidden md:flex"}`}>
          {activeUser ? (
            <>
              {/* CHAT HEADER */}
              <div className="h-[72px] px-6 flex items-center justify-between border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowChatMobile(false)}
                    className="md:hidden text-[#51218F] text-xl"
                  >
                    ←
                  </button>
                  <div className="relative">
                    <img
                      src={getUserAvatar(activeUser)}
                      alt={activeUser.name}
                      className="w-[42px] h-[42px] rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = UserAvatar;
                      }}
                    />
                    {onlineStatus[activeUser.id] && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{activeUser.name}</p>
                    <p className="text-xs text-gray-500">
                      {typingStatus[activeUser.id] ? "Typing..." :
                        onlineStatus[activeUser.id] ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
              </div>

              {/* MESSAGES */}
              <div className="flex-1 px-6 py-6 overflow-y-auto">
                {Object.entries(groupMessagesByDate()).map(([date, dateMessages]) => (
                  <div key={date}>
                    <div className="flex justify-center my-4">
                      <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {date}
                      </span>
                    </div>
                    {dateMessages.map((msg, i) => (
                      <div
                        key={msg.id || i}
                        className={`flex mb-4 ${msg.sender === userData?.id ? "justify-end" : "justify-start"}`}
                      >
                        {msg.sender !== userData?.id && (
                          <img
                            src={getUserAvatar(activeUser)}
                            className="w-[32px] h-[32px] rounded-full mr-2 self-end"
                            onError={(e) => {
                              e.target.src = UserAvatar;
                            }}
                          />
                        )}

                        <div
                          className={`px-5 py-3 rounded-[20px] max-w-[70%] ${msg.sender === userData?.id
                            ? "bg-[#51218F] text-white"
                            : "bg-gray-200 text-gray-800"
                            }`}
                        >
                          {renderMessageContent(msg)}
                          <p
                            className={`text-[10px] mt-1 ${msg.sender === userData?.id ? "text-right opacity-70" : "text-left opacity-70"
                              }`}
                          >
                            {formatTime(msg.created_at)}
                            {msg.sender === userData?.id && msg.is_seen && (
                              <span className="ml-1">✓✓</span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* FILE PREVIEW */}
              {filePreview && (
                <div className="px-6 py-2 border-t border-gray-200">
                  <div className="relative inline-block">
                    <img src={filePreview} alt="Preview" className="h-20 rounded-lg" />
                    <button
                      onClick={removeSelectedFile}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {/* INPUT */}
              <div className="min-h-[80px] px-6 py-4 flex items-center gap-4 border-t border-gray-200">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gray-500 hover:text-[#51218F] transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>

                <input
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === "Enter" && !sending && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 h-[44px] bg-gray-100 rounded-full px-6 outline-none"
                  disabled={sending}
                />

                <button
                  onClick={sendMessage}
                  disabled={sending || (!input.trim() && !selectedFile)}
                  className="text-[#51218F] text-xl disabled:opacity-50 transition"
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-[#51218F] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "➤"
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}