// message.jsx - Complete Fixed Version with Scroll Fix
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import EmojiPicker from 'emoji-picker-react';
import api from "../../utils/axiosConfig";
import { useUser } from "../../contexts/UserContext";
import { useNotification } from "../../contexts/NotificationContext";
import toast from "../../component/Toast";

import User1 from "../../assets/myproject/user1.png";
import User2 from "../../assets/myproject/user2.png";
import User3 from "../../assets/myproject/user3.png";
import User4 from "../../assets/myproject/user4.png";
import User5 from "../../assets/myproject/user5.png";

import { CallButton, CallWindow, IncomingCallNotification } from "./CallComponents";

/* ----------------------------------
   TEMP UI AVATARS
---------------------------------- */
const avatarPool = [User1, User2, User3, User4, User5];

/* ----------------------------------
   QUICK REACTIONS
---------------------------------- */
const DEFAULT_QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢"];

/* ----------------------------------
   QUICK REACTIONS BAR WITH CUSTOM EMOJIS
---------------------------------- */
const QuickReactionsBar = ({ onReact, customReactions, onAddCustomEmoji, onRemoveCustomEmoji, onClose }) => {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };
    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showPicker]);

  const allReactions = [...DEFAULT_QUICK_REACTIONS, ...customReactions].slice(0, 5);

  const handleReactAndClose = (emoji) => {
    onReact(emoji);
    setTimeout(() => {
      if (onClose) onClose();
    }, 100);
  };

  return (
    <div className="flex items-center justify-start px-2 py-2 bg-gray-50/80 border-b border-gray-100 gap-1">
      {allReactions.map((emoji, idx) => (
        <button
          key={`${emoji}-${idx}`}
          onClick={() => handleReactAndClose(emoji)}
          className="text-lg hover:scale-125 transition-all duration-200 active:scale-95 p-1.5 rounded-lg hover:bg-gray-200 flex-shrink-0 relative group"
          title={`React with ${emoji}`}
        >
          {emoji}
          {customReactions.includes(emoji) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveCustomEmoji(emoji);
              }}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-3 h-3 text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          )}
        </button>
      ))}
      
      {allReactions.length < 5 && (
        <div className="relative" ref={pickerRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowPicker(!showPicker);
            }}
            className="text-lg hover:scale-125 transition-all duration-200 active:scale-95 p-1.5 rounded-lg hover:bg-gray-200 flex-shrink-0 w-8 h-8 flex items-center justify-center"
            title="Add custom emoji"
          >
            ➕
          </button>
          
          {showPicker && (
            <div 
              className="absolute bottom-full mb-2 left-0 z-50 animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-2">
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    onAddCustomEmoji(emojiData.emoji);
                    setShowPicker(false);
                  }}
                  autoFocusSearch={false}
                  theme="light"
                  width={280}
                  height={350}
                  lazyLoadEmojis={true}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ----------------------------------
   CHAT HEADER ACTIONS COMPONENT
---------------------------------- */
const ChatHeaderActions = React.memo(({ 
  activeUser, 
  currentUserId, 
  currentUserName,
  activeCall, 
  handleCallInitiated,
  showSearchInChat,
  setShowSearchInChat,
  setChatSearch,
  showStarred,
  setShowStarred,
  setShowDeleteConversation
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const timerRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const startAutoCloseTimer = () => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      setShowMoreMenu(false);
    }, 60000);
  };

  const toggleMenu = (e) => {
    e?.stopPropagation();
    e?.preventDefault();
    
    if (!showMoreMenu) {
      setShowMoreMenu(true);
      startAutoCloseTimer();
    } else {
      clearTimer();
      setShowMoreMenu(false);
    }
  };

  const handleMenuAction = (action) => {
    action();
    clearTimer();
    setShowMoreMenu(false);
  };

  const resetTimer = () => {
    if (showMoreMenu) {
      clearTimer();
      startAutoCloseTimer();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonRef.current && buttonRef.current.contains(event.target)) {
        return;
      }
      if (menuRef.current && menuRef.current.contains(event.target)) {
        resetTimer();
        return;
      }
      clearTimer();
      setShowMoreMenu(false);
    };

    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [showMoreMenu]);

  useEffect(() => {
    return () => clearTimer();
  }, []);

  const menuContent = showMoreMenu && (
    <div 
      ref={menuRef}
      className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 py-1.5 z-50"
      onMouseEnter={resetTimer}
      onMouseLeave={resetTimer}
    >
      <button
        onClick={() => {
          setShowSearchInChat((p) => !p);
          setChatSearch("");
          handleMenuAction(() => {});
        }}
        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${
          showSearchInChat 
            ? "text-purple-600" 
            : "text-gray-600 hover:bg-gray-50"
        }`}
        type="button"
      >
        <span className="text-lg">🔍</span>
        <span>Search</span>
        {showSearchInChat && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-500" />
        )}
      </button>

      <button
        onClick={() => {
          setShowStarred((p) => !p);
          handleMenuAction(() => {});
        }}
        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${
          showStarred 
            ? "text-amber-600" 
            : "text-gray-600 hover:bg-gray-50"
        }`}
        type="button"
      >
        <span className="text-lg">⭐</span>
        <span>Starred</span>
        {showStarred && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500" />
        )}
      </button>

      <div className="my-1 h-px bg-gray-100 mx-3" />

      <button
        onClick={() => {
          setShowDeleteConversation(true);
          handleMenuAction(() => {});
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-b-2xl"
        type="button"
      >
        <span className="text-lg">🗑️</span>
        <span>Delete</span>
      </button>
    </div>
  );
  
  return (
    <div className="flex items-center gap-0.5 md:gap-2">
      <div className="flex items-center gap-0.5 md:gap-1">
        <CallButton 
          otherUserId={activeUser?.id} 
          callType="audio" 
          onCallInitiated={handleCallInitiated} 
          currentUserId={currentUserId} 
          currentUserName={currentUserName}
          disabled={!!activeCall} 
        />
        <CallButton 
          otherUserId={activeUser?.id} 
          callType="video" 
          onCallInitiated={handleCallInitiated} 
          currentUserId={currentUserId} 
          currentUserName={currentUserName}
          disabled={!!activeCall} 
        />
      </div>

      <div className="hidden md:flex items-center gap-0.5 md:gap-2">
        <button
          onClick={() => { setShowSearchInChat((p) => !p); setChatSearch(""); }}
          className={`p-2 rounded-full transition-all duration-200 ${showSearchInChat ? "bg-purple-100 text-purple-600" : "text-gray-500 hover:bg-gray-100"}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </button>
        <button
          onClick={() => setShowStarred((p) => !p)}
          className={`p-2 rounded-full transition-all duration-200 ${showStarred ? "bg-amber-100 text-amber-500" : "text-gray-500 hover:bg-gray-100"}`}
        >
          <span className="text-lg">⭐</span>
        </button>
        <button
          onClick={() => setShowDeleteConversation(true)}
          className="p-2 rounded-full transition-all duration-200 text-red-400 hover:bg-red-50 hover:text-red-600"
        >
          <span className="text-lg">🗑️</span>
        </button>
      </div>

      <div className="relative md:hidden">
        <button
          ref={buttonRef}
          onClick={toggleMenu}
          className={`p-2 rounded-full transition-all duration-200 ${showMoreMenu ? "bg-gray-100" : "text-gray-500 hover:bg-gray-100"}`}
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
        {menuContent}
      </div>
    </div>
  );
});

/* ----------------------------------
   MOBILE MESSAGE ACTIONS MODAL
---------------------------------- */
const MobileMessageActions = ({ message, messageElement, onClose, onReply, onStar, onContextMenu, isStarred, topBarHeight = 56 }) => {
  const [position, setPosition] = useState({ top: 0, left: 0, placement: 'top' });
  const modalRef = useRef(null);

  useEffect(() => {
    if (messageElement && modalRef.current) {
      const rect = messageElement.getBoundingClientRect();
      const modalHeight = modalRef.current.offsetHeight;
      const spaceAbove = rect.top - topBarHeight;
      const spaceBelow = window.innerHeight - rect.bottom;
      const modalWidth = modalRef.current.offsetWidth;
      
      let top, placement;
      
      if (spaceBelow >= modalHeight + 10) {
        top = rect.bottom + 8;
        placement = 'bottom';
      } else if (spaceAbove >= modalHeight + 10) {
        top = rect.top - modalHeight - 8;
        placement = 'top';
      } else {
        if (spaceBelow > spaceAbove) {
          top = rect.bottom + 8;
          placement = 'bottom';
        } else {
          top = Math.max(topBarHeight + 10, rect.top - modalHeight - 8);
          placement = 'top';
        }
      }
      
      let left = rect.left + (rect.width / 2) - (modalWidth / 2);
      
      if (left < 10) left = 10;
      if (left + modalWidth > window.innerWidth - 10) left = window.innerWidth - modalWidth - 10;
      
      setPosition({ top, left, placement });
    }
  }, [messageElement, topBarHeight]);

  return (
    <>
      <div 
        className="fixed inset-0 z-[150]"
        style={{ top: topBarHeight, height: `calc(100% - ${topBarHeight}px)` }}
        onClick={onClose}
      />
      <div
        ref={modalRef}
        className="fixed z-[151] bg-white rounded-2xl shadow-2xl py-2 px-3 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200"
        style={{
          top: position.top,
          left: position.left,
          transformOrigin: position.placement === 'top' ? 'bottom center' : 'top center'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className={`absolute w-3 h-3 bg-white rotate-45 ${position.placement === 'top' ? 'bottom-[-6px]' : 'top-[-6px]'}`}
          style={{
            left: '50%',
            marginLeft: '-6px'
          }}
        />
        
        <button
          onClick={() => { onReply(message); onClose(); }}
          className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors min-w-[60px] active:bg-gray-200"
        >
          <span className="text-xl">↩️</span>
          <span className="text-[10px] font-medium text-gray-600">Reply</span>
        </button>
        
        <button
          onClick={() => { onStar(message); onClose(); }}
          className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors min-w-[60px] active:bg-gray-200 ${
            isStarred ? "text-amber-500" : "text-gray-600"
          }`}
        >
          <span className="text-xl">⭐</span>
          <span className="text-[10px] font-medium">Star</span>
        </button>
        
        <button
          onClick={(e) => { onContextMenu(message, e); onClose(); }}
          className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors min-w-[60px] active:bg-gray-200"
        >
          <span className="text-xl">⋯</span>
          <span className="text-[10px] font-medium text-gray-600">More</span>
        </button>
      </div>
    </>
  );
};

/* ----------------------------------
   CONTEXT MENU COMPONENT
---------------------------------- */
function MessageContextMenu({
  message,
  position,
  onClose,
  onDelete,
  onReply,
  onCopy,
  onEdit,
  onForward,
  onPin,
  onStar,
  onReact,
  isOwnMessage,
  messageElement,
  topBarHeight = 56,
  customReactions = [],
  onAddCustomEmoji,
  onRemoveCustomEmoji
}) {
  const menuRef = useRef(null);
  const [mobilePosition, setMobilePosition] = useState({ top: 0, left: 0, placement: 'top' });

  useEffect(() => {
    if (window.innerWidth < 768 && messageElement && menuRef.current) {
      const rect = messageElement.getBoundingClientRect();
      const menuHeight = menuRef.current.offsetHeight;
      const spaceAbove = rect.top - topBarHeight;
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuWidth = menuRef.current.offsetWidth;
      
      let top, placement;
      
      if (spaceBelow >= menuHeight + 10) {
        top = rect.bottom + 8;
        placement = 'bottom';
      } else if (spaceAbove >= menuHeight + 10) {
        top = rect.top - menuHeight - 8;
        placement = 'top';
      } else {
        if (spaceBelow > spaceAbove) {
          top = rect.bottom + 8;
          placement = 'bottom';
        } else {
          top = Math.max(topBarHeight + 10, rect.top - menuHeight - 8);
          placement = 'top';
        }
      }
      
      let left = rect.left + (rect.width / 2) - (menuWidth / 2);
      
      if (left < 10) left = 10;
      if (left + menuWidth > window.innerWidth - 10) left = window.innerWidth - menuWidth - 10;
      
      setMobilePosition({ top, left, placement });
    }
  }, [messageElement, topBarHeight]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [onClose]);

  const menuStyle = useMemo(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const menuWidth = Math.min(260, vw - 16);
    const menuHeight = 420;
    let x = position.x;
    let y = position.y;
    
    if (x + menuWidth > vw) x = vw - menuWidth - 8;
    if (y + menuHeight > vh) y = vh - menuHeight - 8;
    if (x < 8) x = 8;
    if (y < 8) y = 8;
    
    return { top: y, left: x };
  }, [position]);

  if (window.innerWidth < 768 && messageElement) {
    return (
      <div
        className="fixed inset-0 z-[100]"
        style={{ top: topBarHeight, height: `calc(100% - ${topBarHeight}px)` }}
        onClick={onClose}
        onContextMenu={(e) => { e.preventDefault(); onClose(); }}
      >
        <div className="absolute inset-0" onClick={onClose} />
        
        <div
          ref={menuRef}
          className="fixed bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden select-none animate-in fade-in zoom-in-95 duration-200"
          style={{
            top: mobilePosition.top,
            left: mobilePosition.left,
            width: 'min(240px, calc(100vw - 32px))',
            maxWidth: 'calc(100vw - 48px)',
            transformOrigin: mobilePosition.placement === 'top' ? 'bottom center' : 'top center'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className={`absolute w-3 h-3 bg-white rotate-45 ${mobilePosition.placement === 'top' ? 'bottom-[-6px]' : 'top-[-6px]'}`}
            style={{
              left: '50%',
              marginLeft: '-6px'
            }}
          />
          
          <QuickReactionsBar 
            onReact={onReact}
            customReactions={customReactions}
            onAddCustomEmoji={onAddCustomEmoji}
            onRemoveCustomEmoji={onRemoveCustomEmoji}
            onClose={onClose}
          />
          
          <div className="py-1">
            <ContextMenuItem icon="↩️" label="Reply" onClick={() => { onReply(message); onClose(); }} />
            {message.text && <ContextMenuItem icon="📋" label="Copy" onClick={() => { onCopy(message); onClose(); }} />}
            <ContextMenuItem icon="📤" label="Forward" onClick={() => { onForward(message); onClose(); }} />
            <ContextMenuItem icon="⭐" label="Star" onClick={() => { onStar(message); onClose(); }} />
            <ContextMenuItem icon="📌" label="Pin" onClick={() => { onPin(message); onClose(); }} />
            {isOwnMessage && message.message_type === "text" && (
              <ContextMenuItem icon="✏️" label="Edit" onClick={() => { onEdit(message); onClose(); }} />
            )}
            {isOwnMessage && (
              <ContextMenuItem icon="🗑️" label="Delete" onClick={() => { onDelete(message); onClose(); }} danger />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100]"
      onClick={onClose}
      onContextMenu={(e) => { e.preventDefault(); onClose(); }}
    >
      <div
        ref={menuRef}
        className="absolute bg-white rounded-xl md:rounded-2xl shadow-2xl border border-gray-100 overflow-hidden select-none animate-in fade-in zoom-in-95 duration-200"
        style={{ ...menuStyle, width: 'min(240px, calc(100vw - 32px))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <QuickReactionsBar 
          onReact={onReact}
          customReactions={customReactions}
          onAddCustomEmoji={onAddCustomEmoji}
          onRemoveCustomEmoji={onRemoveCustomEmoji}
          onClose={onClose}
        />
        
        <div className="py-1 md:py-2">
          <ContextMenuItem icon="↩️" label="Reply" onClick={() => { onReply(message); onClose(); }} />
          {message.text && <ContextMenuItem icon="📋" label="Copy" onClick={() => { onCopy(message); onClose(); }} />}
          <ContextMenuItem icon="📤" label="Forward" onClick={() => { onForward(message); onClose(); }} />
          <ContextMenuItem icon="⭐" label="Star" onClick={() => { onStar(message); onClose(); }} />
          <ContextMenuItem icon="📌" label="Pin" onClick={() => { onPin(message); onClose(); }} />
          {isOwnMessage && message.message_type === "text" && (
            <ContextMenuItem icon="✏️" label="Edit" onClick={() => { onEdit(message); onClose(); }} />
          )}
          {isOwnMessage && (
            <ContextMenuItem icon="🗑️" label="Delete" onClick={() => { onDelete(message); onClose(); }} danger />
          )}
        </div>
      </div>
    </div>
  );
}

const ContextMenuItem = ({ icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 transition-colors text-left ${
      danger 
        ? 'text-red-600 hover:bg-red-50' 
        : 'text-gray-700 hover:bg-gray-100'
    }`}
  >
    <span className="text-sm md:text-lg flex-shrink-0">{icon}</span>
    <span className="text-sm md:text-sm font-medium">{label}</span>
  </button>
);

/* ----------------------------------
   FORWARD MODAL
---------------------------------- */
function ForwardModal({ message, users, onForward, onClose, topBarHeight = 56 }) {
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");

  const filtered = users.filter((u) => {
    const s = search.toLowerCase();
    return (u.name || "").toLowerCase().includes(s) || (u.email || "").toLowerCase().includes(s);
  });

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" style={{ top: topBarHeight, height: `calc(100% - ${topBarHeight}px)` }} onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <h3 className="font-semibold text-gray-800">Forward to...</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full h-10 rounded-full bg-gray-100 px-4 text-sm outline-none focus:ring-2 focus:ring-purple-200 transition-all"
          />
        </div>
        <div className="overflow-y-auto flex-1 py-2">
          {filtered.map((u) => (
            <label
              key={u.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                className="accent-purple-600 w-5 h-5 md:w-4 md:h-4 flex-shrink-0"
                checked={selected.includes(u.id)}
                onChange={(e) => {
                  if (e.target.checked) setSelected((p) => [...p, u.id]);
                  else setSelected((p) => p.filter((id) => id !== u.id));
                }}
              />
              <img src={u.avatar} className="w-10 h-10 rounded-full object-cover flex-shrink-0" alt={u.name} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{u.name}</p>
                <p className="text-xs text-gray-400 truncate">{u.email}</p>
              </div>
            </label>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
          <button
            disabled={selected.length === 0}
            onClick={() => { onForward(message, selected); onClose(); }}
            className="w-full h-12 md:h-10 rounded-full bg-purple-600 text-white text-sm font-medium disabled:opacity-40 hover:bg-purple-700 transition-all transform active:scale-95"
          >
            Forward {selected.length > 0 ? `(${selected.length})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------
   STARRED MESSAGES SIDEBAR
---------------------------------- */
function StarredMessagesSidebar({ messages, starredIds, onClose, onJumpTo, topBarHeight = 56 }) {
  const starredMessages = messages.filter((m) => starredIds.has(m.id));

  return (
    <div className="fixed inset-0 z-[90] flex justify-end" style={{ top: topBarHeight, height: `calc(100% - ${topBarHeight}px)` }}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <h3 className="font-semibold text-gray-800">Starred Messages</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-3">
          {starredMessages.length === 0 ? (
            <div className="text-center py-12 px-4">
              <span className="text-5xl mb-3 block">⭐</span>
              <p className="text-gray-400 text-sm">No starred messages yet</p>
              <p className="text-xs text-gray-300 mt-1">Star important messages to find them easily</p>
            </div>
          ) : (
            starredMessages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => { onJumpTo(msg.id); onClose(); }}
                className="w-full text-left px-4 py-4 md:py-3 hover:bg-gray-50 border-b border-gray-50 transition-all hover:pl-5"
              >
                <p className="text-xs text-purple-600 font-medium mb-1">
                  {msg.from === "me" ? "You" : "Other"}
                </p>
                <p className="text-sm text-gray-700 line-clamp-2 flex items-center gap-1">
                  {msg.file_url ? (
                    <>
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span className="truncate">{msg.file_url.split('/').pop() || "Attachment"}</span>
                    </>
                  ) : (
                    msg.text
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-1">{msg.time}</p>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------
   PINNED MESSAGE BANNER
---------------------------------- */
function PinnedMessageBanner({ message, onDismiss, onJump }) {
  if (!message) return null;
  return (
    <div 
      className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100 flex-shrink-0 cursor-pointer hover:bg-purple-100 transition-colors group" 
      onClick={() => onJump(message.id)}
    >
      <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-purple-600 font-semibold flex items-center gap-1">
          <span>📌</span> Pinned Message
        </p>
        <p className="text-sm text-gray-700 truncate flex items-center gap-1">
          {message.file_url ? (
            <>
              <svg className="w-4 h-4 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <span className="truncate">{message.file_url.split('/').pop() || "Attachment"}</span>
            </>
          ) : (
            message.text
          )}
        </p>
      </div>
      <button 
        onClick={(e) => { e.stopPropagation(); onDismiss(); }} 
        className="text-gray-400 hover:text-gray-600 p-2 md:p-1.5 rounded-full hover:bg-white/50 transition-colors flex-shrink-0"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/* ----------------------------------
   TYPING INDICATOR
---------------------------------- */
function TypingIndicator({ user }) {
  return (
    <div className="flex items-center gap-2 px-2 py-2">
      <img src={user?.avatar} className="w-7 h-7 rounded-full object-cover" alt="" />
      <div className="bg-gray-100 rounded-2xl px-4 py-2.5 flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
      </div>
    </div>
  );
}

/* ----------------------------------
   EDIT MESSAGE INPUT
---------------------------------- */
function EditMessageInput({ message, onSave, onCancel }) {
  const [value, setValue] = useState(message.text || "");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleBlur = () => {
    if (value.trim() !== (message.text || "")) {
      onSave(value);
    } else {
      onCancel();
    }
  };

  return (
    <div className="flex items-center gap-2 edit-message-input">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) { 
            e.preventDefault(); 
            onSave(value); 
          }
          if (e.key === "Escape") onCancel();
        }}
        onBlur={handleBlur}
        className="flex-1 bg-white/20 text-inherit rounded-lg px-3 py-1.5 text-sm outline-none border border-white/30 focus:border-white/60"
      />
      <button onClick={() => onSave(value)} className="text-green-300 hover:text-green-100 text-xs font-medium px-2 py-1 rounded-lg hover:bg-white/10 transition">Save</button>
      <button onClick={onCancel} className="text-gray-300 hover:text-gray-100 text-sm px-1 py-1 rounded-lg hover:bg-white/10 transition">✕</button>
    </div>
  );
}

/* ----------------------------------
   REACTIONS DISPLAY
---------------------------------- */
function ReactionsDisplay({ reactions, onReact, currentUserId }) {
  if (!reactions || Object.keys(reactions).length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {Object.entries(reactions).map(([emoji, users]) => {
        const userList = Array.isArray(users) ? users : [];
        const hasReacted = userList.includes(currentUserId);
        
        return (
          <button
            key={emoji}
            onClick={() => onReact(emoji)}
            className={`flex items-center gap-0.5 text-xs rounded-full px-2 py-1 md:px-1.5 md:py-0.5 transition-all shadow-sm hover:scale-105 ${
              hasReacted 
                ? 'bg-purple-100 border-purple-300 text-purple-700' 
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
            title={userList.map(id => id === currentUserId ? 'You' : `User ${id}`).join(', ')}
          >
            <span className="text-sm">{emoji}</span>
            <span className="font-medium text-xs ml-0.5">{userList.length}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ==================================
   MAIN MESSAGE COMPONENT
================================== */
export default function Message() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useUser();
  const { clearUnreadMessages } = useNotification();
  const [searchParams] = useSearchParams();
  const targetUserIdFromUrl = searchParams.get("user");
  const jobIdFromUrl = searchParams.get("jobId");

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const searchTimeout = useRef(null);
  const shouldAutoScroll = useRef(true);
  const longPressTimer = useRef(null);
  const pollIntervalRef = useRef(null);
  const isMounted = useRef(true);
  const heartbeatInterval = useRef(null);
  const initialScrollDone = useRef(false);
  const dragCounterRef = useRef(0);
  const messageRefs = useRef({});
  const lastTapRef = useRef(0);
  const scrollAfterSend = useRef(false);
  const scrollTimeoutRef = useRef(null);

  const jobId = jobIdFromUrl ?? location.state?.jobId ?? null;
  const receiverId = targetUserIdFromUrl ?? location.state?.receiverId ?? null;
  const currentUserId = userData?.id ?? null;
  
  let currentUserName = userData?.name;
  if (!currentUserName || currentUserName === '' || currentUserName === 'null' || currentUserName === 'undefined') {
    currentUserName = userData?.full_name || userData?.display_name;
  }
  if (!currentUserName || currentUserName === '') {
    currentUserName = userData?.email?.split('@')[0] || `User ${currentUserId}`;
  }
  currentUserName = currentUserName.replace(/[0-9]+$/, '');
  currentUserName = currentUserName.charAt(0).toUpperCase() + currentUserName.slice(1).toLowerCase();

  const [allUsers, setAllUsers] = useState([]);
  const [conversationUsers, setConversationUsers] = useState([]);
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [activeUserId, setActiveUserId] = useState(null);
  const [input, setInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showChatMobile, setShowChatMobile] = useState(false);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [userScrolled, setUserScrolled] = useState(false);
  const [imageViewer, setImageViewer] = useState({ open: false, url: null });
  const [showDeleteConversation, setShowDeleteConversation] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [contextMenu, setContextMenu] = useState(null);
  const [contextMenuElement, setContextMenuElement] = useState(null);
  const [reactions, setReactions] = useState({});
  const [starredIds, setStarredIds] = useState(new Set());
  const [showStarred, setShowStarred] = useState(false);
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [forwardMessage, setForwardMessage] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [showSearchInChat, setShowSearchInChat] = useState(false);
  const [chatSearch, setChatSearch] = useState("");
  const [chatSearchResults, setChatSearchResults] = useState([]);
  const [chatSearchIndex, setChatSearchIndex] = useState(0);
  const [highlightedMsgId, setHighlightedMsgId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mobileActionMessage, setMobileActionMessage] = useState(null);
  const [mobileActionElement, setMobileActionElement] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callerProfileImage, setCallerProfileImage] = useState(null);
  const [calleeProfileImage, setCalleeProfileImage] = useState(null);
  const [topBarHeight, setTopBarHeight] = useState(56);
  
  const [customReactions, setCustomReactions] = useState(() => {
    const saved = localStorage.getItem('custom_quick_reactions');
    return saved ? JSON.parse(saved) : [];
  });

  const activeUser = displayedUsers.find((u) => u.id === activeUserId) || null;

  // SCROLL TO BOTTOM HELPER
  const scrollToBottom = useCallback((smooth = false) => {
    if (messagesContainerRef.current) {
      if (smooth) {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      } else {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }
  }, []);

  // Save custom reactions to localStorage
  useEffect(() => {
    localStorage.setItem('custom_quick_reactions', JSON.stringify(customReactions));
  }, [customReactions]);

  // Handle adding custom emoji
  const handleAddCustomEmoji = useCallback((emoji) => {
    setCustomReactions(prev => {
      const currentTotal = DEFAULT_QUICK_REACTIONS.length + prev.length;
      if (prev.includes(emoji)) {
        toast.error("Emoji already exists");
        return prev;
      }
      if (currentTotal >= 5) {
        toast.error("Maximum 5 emojis allowed");
        return prev;
      }
      toast.success(`Added ${emoji} to quick reactions`);
      return [...prev, emoji];
    });
  }, []);

  // Handle removing custom emoji
  const handleRemoveCustomEmoji = useCallback((emoji) => {
    setCustomReactions(prev => {
      const newReactions = prev.filter(e => e !== emoji);
      toast.success(`Removed ${emoji} from quick reactions`);
      return newReactions;
    });
  }, []);

  useEffect(() => {
    const updateTopBarHeight = () => {
      const topBar = document.querySelector('.top-bar');
      if (topBar) {
        setTopBarHeight(topBar.offsetHeight);
      } else {
        if (window.innerWidth < 640) setTopBarHeight(56);
        else if (window.innerWidth < 768) setTopBarHeight(64);
        else setTopBarHeight(72);
      }
    };
    
    updateTopBarHeight();
    window.addEventListener('resize', updateTopBarHeight);
    return () => window.removeEventListener('resize', updateTopBarHeight);
  }, []);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const handleIncomingCall = (e) => {
      const callData = e.detail;
      let callerName = callData.caller_name;
      
      if (!callerName || callerName === 'User' || callerName.includes('@')) {
        const caller = allUsers.find(u => Number(u.id) === Number(callData.caller_id));
        if (caller) {
          callerName = caller.name || caller.email?.split('@')[0] || `User ${callData.caller_id}`;
        }
      }
      
      if (callerName && callerName !== 'User') {
        callerName = callerName.replace(/[0-9]+$/, '');
        callerName = callerName.charAt(0).toUpperCase() + callerName.slice(1).toLowerCase();
      }
      
      if (!callerName || callerName === 'User') {
        callerName = `User ${callData.caller_id}`;
      }
      
      const enrichedCallData = {
        ...callData,
        caller_name: callerName
      };
      
      setIncomingCall(enrichedCallData);
    };
    
    window.addEventListener("incoming-call", handleIncomingCall);
    
    return () => {
      window.removeEventListener("incoming-call", handleIncomingCall);
    };
  }, [allUsers]);

  useEffect(() => {
    const handleAcceptCall = async (e) => {
      const callData = e.detail;
      
      const callerId = callData.caller_id;
      const caller = allUsers.find(u => Number(u.id) === Number(callerId));
      
      if (caller && caller.avatar) {
        setCallerProfileImage(caller.avatar);
        setCalleeProfileImage(caller.avatar);
      } else if (window.incomingCallProfileImage) {
        setCallerProfileImage(window.incomingCallProfileImage);
        setCalleeProfileImage(window.incomingCallProfileImage);
      }
      
      setActiveCall(callData);
      setIncomingCall(null);
    };
    
    const handleCallEnded = () => {
      setActiveCall(null);
      setIncomingCall(null);
      setCallerProfileImage(null);
      setCalleeProfileImage(null);
      delete window.incomingCallProfileImage;
    };
    
    window.addEventListener("accept-call", handleAcceptCall);
    window.addEventListener("call-ended", handleCallEnded);
    
    return () => {
      window.removeEventListener("accept-call", handleAcceptCall);
      window.removeEventListener("call-ended", handleCallEnded);
    };
  }, [allUsers]);

  useEffect(() => {
    const handleNewMessage = (e) => {
      const { sender_id } = e.detail;
      if (sender_id === activeUserId) fetchMessages(activeUserId);
    };
    window.addEventListener("new-message-received", handleNewMessage);
    return () => window.removeEventListener("new-message-received", handleNewMessage);
  }, [activeUserId]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (contextMenu) {
          setContextMenu(null);
          setContextMenuElement(null);
        }
        if (forwardMessage) setForwardMessage(null);
        if (showStarred) setShowStarred(false);
        if (imageViewer.open) setImageViewer({ open: false, url: null });
        if (showDeleteConversation) setShowDeleteConversation(false);
        if (showEmojiPicker) setShowEmojiPicker(false);
        if (mobileActionMessage) {
          setMobileActionMessage(null);
          setMobileActionElement(null);
        }
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [contextMenu, forwardMessage, showStarred, imageViewer.open, showDeleteConversation, showEmojiPicker, mobileActionMessage]);

  useEffect(() => {
    if (imageViewer.open || showStarred || contextMenu || mobileActionMessage || incomingCall) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [imageViewer.open, showStarred, contextMenu, mobileActionMessage, incomingCall]);

  const formatLastSeen = useCallback((timestamp) => {
    if (!timestamp) return "";
    const diffMs = new Date() - new Date(timestamp);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  }, []);

  const formatMessageTime = useCallback((timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, []);

  const formatMessageDate = useCallback((timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }, []);

  const markMessagesAsSeen = useCallback(async (conversationId) => {
    if (!currentUserId || !conversationId) return;
    try {
      await api.post(`/message/seen/${conversationId}/${currentUserId}`);
      setMessages((prev) => prev.map((msg) => (msg.from === "other" ? { ...msg, is_seen: true } : msg)));
      setConversationUsers((prev) => prev.map((u) => (u.id === activeUserId ? { ...u, unread_count: 0 } : u)));
      setDisplayedUsers((prev) => prev.map((u) => (u.id === activeUserId ? { ...u, unread_count: 0 } : u)));
      clearUnreadMessages(activeUserId);
    } catch (error) {
      console.error("Failed to mark messages as seen", error);
    }
  }, [currentUserId, activeUserId, clearUnreadMessages]);

  const fetchMessages = useCallback(async (otherUserId) => {
    if (!currentUserId || !otherUserId || !isMounted.current) return;
    setLoading(true);
    try {
      const response = await api.get(`/message/conversation/${currentUserId}/${otherUserId}`);
      if (!isMounted.current) return;

      const updateStatus = (users) =>
        users.map((u) =>
          u.id === otherUserId
            ? { ...u, online: response.data.other_user_online || false, last_active: response.data.other_user_last_active }
            : u
        );

      setAllUsers((prev) => updateStatus(prev));
      setConversationUsers((prev) => updateStatus(prev));
      setDisplayedUsers((prev) => updateStatus(prev));

      if (response.data.other_user_typing !== undefined) {
        setIsTyping(response.data.other_user_typing);
      }

      if (response.data.messages) {
        const formatted = response.data.messages.map((msg) => ({
          id: msg.id,
          text: msg.content,
          from: msg.sender === currentUserId ? "me" : "other",
          time: new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          timestamp: msg.created_at,
          file_url: msg.file_url,
          message_type: msg.message_type,
          reply_to: msg.reply_to,
          is_seen: msg.is_seen,
          call_data: msg.call_data,
          edited: msg.edited || false,
        }));
        setMessages(formatted);
        
        await loadAllReactions(formatted);
        
        if (response.data.conversation_id) {
          const hasUnseen = formatted.some((m) => m.from === "other" && !m.is_seen);
          if (hasUnseen) await markMessagesAsSeen(response.data.conversation_id);
        }
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, markMessagesAsSeen]);

  const loadAllReactions = useCallback(async (messagesList) => {
    const allReactions = {};
    for (const msg of messagesList) {
      try {
        const response = await api.get(`/message/message/${msg.id}/reactions`);
        allReactions[msg.id] = response.data.reactions;
      } catch (error) {
        console.error(`Failed to load reactions for message ${msg.id}`, error);
      }
    }
    setReactions(allReactions);
  }, []);

  const sendHeartbeat = useCallback(async () => {
    if (!currentUserId) return;
    try {
      await api.post("/message/user/heartbeat", null, { params: { user_id: currentUserId } });
    } catch (e) {}
  }, [currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      sendHeartbeat();
      heartbeatInterval.current = setInterval(sendHeartbeat, 30000);
      return () => clearInterval(heartbeatInterval.current);
    }
  }, [currentUserId, sendHeartbeat]);

  useEffect(() => {
    if (!currentUserId) {
      toast.error("Please login to access messages");
      navigate("/login", { replace: true });
    }
  }, [currentUserId, navigate]);

  const handleFileDownload = async (fileUrl, fileName) => {
    try {
      let actualFileName = fileName || fileUrl.split("/").pop();
      let fileType = fileUrl.includes("chat_files") ? "chat_files" : "message_files";
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      const downloadUrl = `${baseUrl}/message/download/${fileType}/${actualFileName}`;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", actualFileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("File downloaded successfully");
    } catch (error) {
      toast.error("Failed to download file");
    }
  };

  useEffect(() => {
    if (!chatSearch.trim()) {
      setChatSearchResults([]);
      setChatSearchIndex(0);
      return;
    }
    const results = messages
      .map((m, i) => ({ ...m, _idx: i }))
      .filter((m) => m.text && m.text.toLowerCase().includes(chatSearch.toLowerCase()));
    setChatSearchResults(results);
    setChatSearchIndex(0);
  }, [chatSearch, messages]);

  const jumpToSearchResult = useCallback((idx) => {
    const result = chatSearchResults[idx];
    if (!result) return;
    setHighlightedMsgId(result.id);
    const el = messageRefs.current[result.id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setTimeout(() => setHighlightedMsgId(null), 2000);
  }, [chatSearchResults]);

  useEffect(() => {
    if (chatSearchResults.length > 0) jumpToSearchResult(chatSearchIndex);
  }, [chatSearchIndex, chatSearchResults, jumpToSearchResult]);

  const jumpToMessage = useCallback((msgId) => {
    setShowChatMobile(true);
    setHighlightedMsgId(msgId);
    setTimeout(() => {
      const el = messageRefs.current[msgId];
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
    setTimeout(() => setHighlightedMsgId(null), 2000);
  }, []);

  const handleMobileLongPress = useCallback((msg, e, element) => {
    e.preventDefault();
    e.stopPropagation();
    setMobileActionMessage(msg);
    setMobileActionElement(element);
  }, []);

  const handleDoubleTap = useCallback((msg, e, element) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapRef.current;
    
    if (tapLength < 300 && tapLength > 0) {
      e.preventDefault();
      e.stopPropagation();
      const rect = element.getBoundingClientRect();
      const syntheticEvent = {
        clientX: rect.left + (rect.width / 2),
        clientY: rect.top + (rect.height / 2),
        preventDefault: () => {},
        stopPropagation: () => {}
      };
      setContextMenu({ message: msg, position: { x: syntheticEvent.clientX, y: syntheticEvent.clientY } });
      setContextMenuElement(element);
    }
    lastTapRef.current = currentTime;
  }, []);

  const handleReact = useCallback(async (emoji, msgId) => {
    if (!currentUserId) return;
    
    const currentMessageReactions = reactions[msgId] || {};
    const currentUsers = currentMessageReactions[emoji] || [];
    const hasReacted = currentUsers.includes(currentUserId);
    
    setReactions(prev => {
      const newMessageReactions = { ...(prev[msgId] || {}) };
      
      if (hasReacted) {
        const updatedUsers = currentUsers.filter(id => id !== currentUserId);
        if (updatedUsers.length === 0) {
          delete newMessageReactions[emoji];
        } else {
          newMessageReactions[emoji] = updatedUsers;
        }
      } else {
        newMessageReactions[emoji] = [...currentUsers, currentUserId];
      }
      
      const newReactions = { ...prev, [msgId]: newMessageReactions };
      if (Object.keys(newMessageReactions).length === 0) {
        delete newReactions[msgId];
      }
      
      return newReactions;
    });
    
    try {
      const response = await api.post(`/message/message/${msgId}/react`, {
        user_id: currentUserId,
        emoji: emoji
      });
      
      if (response.data && response.data.reactions) {
        setReactions(prev => ({
          ...prev,
          [msgId]: response.data.reactions
        }));
      }
      
      if (!hasReacted) {
        toast.success(`Reacted with ${emoji}`);
      }
      
    } catch (error) {
      console.error("Failed to send reaction:", error);
      toast.error("Failed to add reaction");
      await fetchMessages(activeUserId);
    }
  }, [currentUserId, activeUserId, reactions, fetchMessages]);

  const handleCopyText = useCallback((message) => {
    if (message.text) {
      navigator.clipboard.writeText(message.text).then(() => toast.success("Copied to clipboard"));
    }
  }, []);

  const handleEditMessage = useCallback((message) => {
    setEditingMessageId(message.id);
    setContextMenu(null);
    setContextMenuElement(null);
  }, []);

  const handleSaveEdit = useCallback(async (msgId, newText) => {
    if (!newText.trim()) return;
    
    const originalMessage = messages.find(m => m.id === msgId);
    const originalText = originalMessage?.text || "";
    
    try {
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, text: newText.trim(), edited: true } : m))
      );
      setEditingMessageId(null);
      
      await api.put(`/message/${msgId}`, {
        content: newText.trim(),
        user_id: currentUserId
      });
      
      toast.success("Message updated");
      await fetchMessages(activeUserId);
      
    } catch (err) {
      console.error("Edit error:", err);
      
      setMessages((prev) =>
        prev.map((m) => 
          (m.id === msgId ? { ...m, text: originalText, edited: false } : m)
        )
      );
      
      toast.error(err.response?.data?.detail || "Failed to edit message");
    }
  }, [currentUserId, activeUserId, messages, fetchMessages]);

  const handleForwardMessage = useCallback(async (message, userIds) => {
    if (!userIds.length) return;
    let successCount = 0;
    for (const uid of userIds) {
      try {
        const formData = new FormData();
        formData.append("sender_id", String(currentUserId));
        formData.append("receiver_id", String(uid));
        if (message.text) formData.append("content", message.text);
        await api.post("/message/send", formData, { headers: { "Content-Type": "multipart/form-data" } });
        successCount++;
      } catch {}
    }
    toast.success(`Forwarded to ${successCount} user${successCount !== 1 ? "s" : ""}`);
  }, [currentUserId]);

  const handlePinMessage = useCallback((message) => {
    setPinnedMessage((prev) => (prev?.id === message.id ? null : message));
    toast.success(pinnedMessage?.id === message.id ? "Message unpinned" : "Message pinned");
  }, [pinnedMessage]);

  const handleStarMessage = useCallback((message) => {
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(message.id)) { next.delete(message.id); toast.success("Message unstarred"); }
      else { next.add(message.id); toast.success("Message starred ⭐"); }
      return next;
    });
  }, []);

  useEffect(() => {
    if (editingMessageId) {
      const handleClickOutsideEdit = (e) => {
        const editInput = document.querySelector('.edit-message-input');
        if (editInput && !editInput.contains(e.target)) {
          const currentMsg = messages.find(m => m.id === editingMessageId);
          if (currentMsg) {
            const editValue = document.querySelector('.edit-message-input input')?.value;
            if (editValue && editValue !== (currentMsg.text || "")) {
              handleSaveEdit(editingMessageId, editValue);
            } else {
              setEditingMessageId(null);
            }
          }
        }
      };
      
      document.addEventListener('mousedown', handleClickOutsideEdit);
      return () => document.removeEventListener('mousedown', handleClickOutsideEdit);
    }
  }, [editingMessageId, messages, handleSaveEdit]);

  const openContextMenu = useCallback((message, e, element) => {
    e.preventDefault();
    e.stopPropagation();
    const x = e.clientX || e.touches?.[0]?.clientX || 0;
    const y = e.clientY || e.touches?.[0]?.clientY || 0;
    setContextMenu({ message, position: { x, y } });
    setContextMenuElement(element);
  }, []);

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (term.length >= 2) {
      searchTimeout.current = setTimeout(() => {
        const filtered = allUsers.filter((u) => {
          const s = term.toLowerCase();
          return (u.email || "").toLowerCase().includes(s) || (u.name || "").toLowerCase().includes(s);
        });
        setDisplayedUsers(filtered);
      }, 300);
    } else {
      if (targetUserIdFromUrl) {
        const t = allUsers.find((u) => Number(u.id) === Number(targetUserIdFromUrl));
        setDisplayedUsers(t ? [t] : []);
      } else {
        setDisplayedUsers(conversationUsers);
      }
    }
  };

  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); dragCounterRef.current++; setIsDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); dragCounterRef.current--; if (dragCounterRef.current === 0) setIsDragOver(false); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); dragCounterRef.current = 0; setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files?.length > 0) {
      const file = files[0];
      if (file.size > 25 * 1024 * 1024) { toast.error("File size should be less than 25MB"); return; }
      setSelectedFile(file); setSelectedFileName(file.name);
      toast.success(`${file.name} selected`);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const filtered = allUsers.filter((u) => {
        const s = searchTerm.toLowerCase();
        return (u.email || "").toLowerCase().includes(s) || (u.name || "").toLowerCase().includes(s);
      });
      setDisplayedUsers(filtered);
    } else {
      if (targetUserIdFromUrl) {
        const t = allUsers.find((u) => Number(u.id) === Number(targetUserIdFromUrl));
        setDisplayedUsers(t ? [t] : []);
      } else {
        setDisplayedUsers(conversationUsers);
      }
    }
  }, [searchTerm, allUsers, conversationUsers, targetUserIdFromUrl]);

  useEffect(() => {
    if (!currentUserId) return;
    const loadUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const res = await api.get("/message/users", { params: { current_user_id: currentUserId } });
        if (!isMounted.current) return;
        const processed = res.data.map((u, i) => ({
          id: u.id, name: u.name || u.email?.split("@")[0] || `User ${u.id}`, email: u.email,
          avatar: u.profile_picture || avatarPool[i % avatarPool.length],
          lastMessage: u.last_message || "", online: u.online || false,
          last_message_time: u.last_message_time, last_active: u.last_active,
          unread_count: u.unread_count || 0, hasConversation: !!u.last_message,
        }));
        const convoUsers = processed.filter((u) => u.hasConversation);
        setAllUsers(processed); setConversationUsers(convoUsers);

        if (targetUserIdFromUrl) {
          const t = processed.find((u) => Number(u.id) === Number(targetUserIdFromUrl));
          if (t) {
            setDisplayedUsers([t]); setActiveUserId(t.id); setShowChatMobile(true); clearUnreadMessages(t.id);
          } else {
            try {
              const ur = await api.get(`/user/${targetUserIdFromUrl}`);
              if (ur.data && isMounted.current) {
                const nu = { id: ur.data.id, name: ur.data.name || ur.data.email?.split("@")[0], email: ur.data.email, avatar: ur.data.profile_picture || avatarPool[0], lastMessage: "", online: ur.data.online || false, last_active: ur.data.last_active, unread_count: 0, hasConversation: false };
                setDisplayedUsers([nu]); setActiveUserId(nu.id); setShowChatMobile(true);
                setAllUsers((p) => [...p, nu]); clearUnreadMessages(nu.id);
              }
            } catch { setDisplayedUsers([]); setActiveUserId(null); }
          }
        } else {
          setDisplayedUsers(convoUsers);
          let uid = null;
          if (receiverId) {
            if (convoUsers.some((u) => Number(u.id) === Number(receiverId))) uid = Number(receiverId);
            else {
              try {
                const ur = await api.get(`/user/${receiverId}`);
                if (ur.data && isMounted.current) {
                  const nu = { id: ur.data.id, name: ur.data.name || ur.data.email?.split("@")[0], email: ur.data.email, avatar: ur.data.profile_picture || avatarPool[0], lastMessage: "", online: ur.data.online || false, last_active: ur.data.last_active, unread_count: 0, hasConversation: false };
                  setAllUsers((p) => [...p, nu]); setDisplayedUsers((p) => [...p, nu]); uid = nu.id; clearUnreadMessages(nu.id);
                }
              } catch {}
            }
          }
          if (!uid && convoUsers.length > 0) uid = convoUsers[0].id;
          if (uid) { setActiveUserId(uid); setShowChatMobile(true); clearUnreadMessages(uid); }
        }
        setInitialLoadDone(true);
      } catch (err) {
        console.error("Failed to load users", err); setInitialLoadDone(true);
      } finally { setIsLoadingUsers(false); }
    };
    loadUsers();
  }, [currentUserId, targetUserIdFromUrl, receiverId, clearUnreadMessages]);

  useEffect(() => {
    if (activeUserId && currentUserId) {
      fetchMessages(activeUserId); clearUnreadMessages(activeUserId);
    }
  }, [activeUserId, currentUserId, fetchMessages, clearUnreadMessages]);

  useEffect(() => {
    const handleReactionUpdate = (event) => {
      const data = event.detail;
      if (data.type === 'reaction_updated') {
        setReactions(prev => ({
          ...prev,
          [data.message_id]: data.reactions
        }));
        
        if (data.action === 'added' && data.user_id !== currentUserId) {
          const reactedUser = allUsers.find(u => u.id === data.user_id);
          if (reactedUser) {
            toast(`${reactedUser.name} reacted ${data.emoji}`, {
              icon: data.emoji,
              duration: 2000
            });
          }
        }
      }
    };
    
    window.addEventListener('reaction-updated', handleReactionUpdate);
    return () => window.removeEventListener('reaction-updated', handleReactionUpdate);
  }, [currentUserId, allUsers]);

  // Initial scroll to bottom when opening chat
  useEffect(() => {
    if (!loading && messages.length > 0 && messagesContainerRef.current && !initialScrollDone.current) {
      setTimeout(() => {
        scrollToBottom(false);
        initialScrollDone.current = true;
        shouldAutoScroll.current = true;
        setUserScrolled(false);
      }, 200);
    }
  }, [loading, messages.length, scrollToBottom]);

  // Reset scroll when switching chats
  useEffect(() => {
    if (activeUserId) { 
      initialScrollDone.current = false; 
      shouldAutoScroll.current = true; 
      setUserScrolled(false);
      scrollAfterSend.current = false;
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
    }
  }, [activeUserId]);

  // Poll for new messages - fixed scroll behavior
  useEffect(() => {
    if (activeUserId && currentUserId) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = setInterval(() => {
        const container = messagesContainerRef.current;
        if (!container) return;
        
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        
        // User is near bottom (within 100px) - considered "at bottom"
        const isNearBottom = distanceFromBottom < 100;
        
        fetchMessages(activeUserId).then(() => {
          // If user was near bottom OR just sent a message, scroll to bottom
          if (isNearBottom || scrollAfterSend.current) {
            if (scrollAfterSend.current) {
              scrollToBottom(true);
              scrollAfterSend.current = false;
            } else {
              scrollToBottom(false);
            }
            shouldAutoScroll.current = true;
            setUserScrolled(false);
          }
        });
      }, 5000);
      return () => { 
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current); 
      };
    }
  }, [activeUserId, currentUserId, fetchMessages, scrollToBottom]);

  // Handle scroll to show/hide jump-to-bottom button
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isScrolledUpMoreThan50px = distanceFromBottom > 50;
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    if (isScrolledUpMoreThan50px) {
      setUserScrolled(true);
      shouldAutoScroll.current = false;
      
      scrollTimeoutRef.current = setTimeout(() => {
        setUserScrolled(false);
        scrollTimeoutRef.current = null;
      }, 10000);
    } else {
      setUserScrolled(false);
      shouldAutoScroll.current = true;
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    const c = messagesContainerRef.current;
    if (c) { 
      c.addEventListener("scroll", handleScroll); 
      return () => c.removeEventListener("scroll", handleScroll); 
    }
  }, [handleScroll]);

  // Scroll after sending a message
  useEffect(() => {
    if (messages.length > 0 && scrollAfterSend.current) {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
      
      setTimeout(() => {
        scrollToBottom(true);
        scrollAfterSend.current = false;
        shouldAutoScroll.current = true;
        setUserScrolled(false);
      }, 150);
    }
  }, [messages, scrollToBottom]);

  const handleJumpToBottom = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
    shouldAutoScroll.current = true;
    setUserScrolled(false);
    scrollToBottom(true);
  }, [scrollToBottom]);

  const sendTypingStatus = useCallback(async (isTyping) => {
    if (!currentUserId || !activeUserId) return;
    try {
      await api.post("/message/typing", { user_id: currentUserId, chat_with: activeUserId, is_typing: isTyping });
    } catch {}
  }, [currentUserId, activeUserId]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    sendTypingStatus(e.target.value.length > 0);
  };

  const handleEmojiClick = (emojiObject) => {
    setInput(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
    const textarea = document.querySelector('textarea[placeholder="Type a message..."]');
    if (textarea) {
      textarea.focus();
    }
  };

  const emojiPickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) { toast.error("File too large (max 25MB)"); return; }
    setSelectedFile(file); setSelectedFileName(file.name);
    toast.success(`${file.name} ready to send`);
    e.target.value = "";
  };

  const clearSelectedFile = () => { setSelectedFile(null); setSelectedFileName(""); };
  const clearReply = () => setReplyingTo(null);

  const handleDeleteMessage = async (message) => {
    if (!message || !currentUserId) return;
    try {
      await api.delete(`/message/${message.id}`, { params: { user_id: currentUserId } });
      setMessages((prev) => prev.filter((m) => m.id !== message.id));
      toast.success("Message deleted");
    } catch {
      toast.error("Failed to delete message");
    }
  };

  const handleDeleteConversation = async () => {
    if (!activeUserId || !currentUserId) return;
    try {
      await api.delete(`/message/conversation/${currentUserId}/${activeUserId}`, { params: { user_id: currentUserId } });
      setMessages([]); setConversationUsers((p) => p.filter((u) => u.id !== activeUserId));
      setAllUsers((p) => p.map((u) => (u.id === activeUserId ? { ...u, hasConversation: false, lastMessage: "" } : u)));
      setDisplayedUsers((p) => p.filter((u) => u.id !== activeUserId));
      const next = conversationUsers.find((u) => u.id !== activeUserId);
      if (next) setActiveUserId(next.id);
      else { setActiveUserId(null); setShowChatMobile(false); }
      setShowDeleteConversation(false);
      toast.success("Conversation deleted");
    } catch { toast.error("Failed to delete conversation"); }
  };

  const sendMessage = async () => {
    if ((!input.trim() && !selectedFile) || sending || !activeUserId) return;
    if (!currentUserId) { toast.error("Missing required data."); return; }
    const messageText = input.trim();
    setSending(true);
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
    scrollAfterSend.current = true;
    
    const tempId = Date.now();
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const tempMessage = {
      id: tempId, 
      text: messageText || (selectedFile ? `📎 ${selectedFile.name}` : ""), 
      from: "me", 
      time, 
      timestamp: new Date().toISOString(),
      file_url: selectedFile ? URL.createObjectURL(selectedFile) : null,
      message_type: selectedFile ? (selectedFile.type.startsWith("image/") ? "image" : "file") : "text",
      is_seen: false, 
      isTemp: true,
    };
    
    setMessages((p) => [...p, tempMessage]);
    
    try {
      const formData = new FormData();
      formData.append("sender_id", String(currentUserId));
      formData.append("receiver_id", String(activeUserId));
      if (messageText) formData.append("content", messageText);
      if (selectedFile) formData.append("file", selectedFile);
      if (replyingTo) formData.append("reply_to", String(replyingTo.id));
      
      const response = await api.post("/message/send", formData, { 
        headers: { "Content-Type": "multipart/form-data" } 
      });
      
      setMessages((p) =>
        p.map((m) =>
          m.id === tempId
            ? { 
                id: response.data.message_id, 
                text: messageText || (selectedFile ? `📎 ${selectedFile.name}` : ""), 
                from: "me", 
                time, 
                timestamp: new Date().toISOString(), 
                file_url: response.data.file_url || tempMessage.file_url, 
                message_type: response.data.message_type || tempMessage.message_type, 
                is_seen: false,
                isTemp: false,
              }
            : m
        )
      );
      
      const newLast = messageText || (selectedFile ? `📎 ${selectedFile.name}` : "");
      setAllUsers((p) => p.map((u) => (u.id === activeUserId ? { ...u, lastMessage: newLast, last_message_time: new Date().toISOString(), hasConversation: true } : u)));
      setConversationUsers((p) => {
        if (p.some((u) => u.id === activeUserId)) return p.map((u) => (u.id === activeUserId ? { ...u, lastMessage: newLast, last_message_time: new Date().toISOString() } : u));
        const nu = allUsers.find((u) => u.id === activeUserId);
        return nu ? [...p, { ...nu, lastMessage: newLast, last_message_time: new Date().toISOString() }] : p;
      });
      setDisplayedUsers((p) => {
        if (p.some((u) => u.id === activeUserId)) return p.map((u) => (u.id === activeUserId ? { ...u, lastMessage: newLast, last_message_time: new Date().toISOString(), hasConversation: true } : u));
        const nu = allUsers.find((u) => u.id === activeUserId);
        return nu ? [...p, { ...nu, lastMessage: newLast, last_message_time: new Date().toISOString(), hasConversation: true }] : p;
      });
      
      setInput(""); 
      clearSelectedFile(); 
      clearReply(); 
      sendTypingStatus(false);
      
    } catch (error) {
      setMessages((p) => p.filter((m) => m.id !== tempId));
      toast.error("Failed to send message");
      scrollAfterSend.current = false;
    } finally { 
      setSending(false); 
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleCallInitiated = (callData) => {
    if (activeUser && activeUser.avatar) {
      setCallerProfileImage(activeUser.avatar);
      setCalleeProfileImage(activeUser.avatar);
    }
    
    let cleanCallerName = currentUserName;
    if (cleanCallerName && cleanCallerName.includes('@')) {
      cleanCallerName = cleanCallerName.split('@')[0];
    }
    cleanCallerName = cleanCallerName.replace(/[0-9]+$/, '');
    cleanCallerName = cleanCallerName.charAt(0).toUpperCase() + cleanCallerName.slice(1).toLowerCase();
    
    const enrichedCallData = {
      ...callData,
      caller_id: currentUserId,
      caller_name: cleanCallerName,
      receiver_id: activeUser?.id,
      receiver_name: activeUser?.name || activeUser?.email?.split('@')[0] || `User ${activeUser?.id}`,
    };
    
    setActiveCall(enrichedCallData);
  };

  const handleEndCall = () => {
    setActiveCall(null);
    setIncomingCall(null);
    setCallerProfileImage(null);
    setCalleeProfileImage(null);
    delete window.incomingCallProfileImage;
  };

  const handleAcceptIncomingCall = () => {
    if (incomingCall) {
      window.dispatchEvent(new CustomEvent("accept-call", { detail: incomingCall }));
    }
  };

  const handleDeclineIncomingCall = async () => {
    if (incomingCall) {
      try {
        await api.post(`/message/call/${incomingCall.call_id}/end?user_id=${currentUserId}`);
      } catch (e) {
        console.warn('Decline call API:', e);
      }
      setIncomingCall(null);
    }
  };

  const renderMessage = useCallback((msg, index) => {
    const showDate = index === 0 || new Date(msg.timestamp).toDateString() !== new Date(messages[index - 1]?.timestamp).toDateString();
    const isOwn = msg.from === "me";
    const isEditing = editingMessageId === msg.id;
    const isHighlighted = highlightedMsgId === msg.id;
    const msgReactions = reactions[msg.id] || {};
    const isStarred = starredIds.has(msg.id);

    if (msg.message_type === "call") {
      return (
        <React.Fragment key={msg.id}>
          {showDate && (
            <div className="flex justify-center my-3 md:my-4">
              <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-500">{formatMessageDate(msg.timestamp)}</span>
            </div>
          )}
          <div className="flex justify-center my-2">
            <div className="bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-600 flex items-center gap-2">
              <span className="text-lg">{msg.text?.toLowerCase().includes("video") ? "📹" : "📞"}</span>
              <span>{msg.text || "Call"}</span>
              <span className="text-xs text-gray-400">{isOwn ? " (You called)" : " (Incoming call)"}</span>
            </div>
          </div>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment key={msg.id}>
        {showDate && (
          <div className="flex justify-center my-3 md:my-4">
            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-500">{formatMessageDate(msg.timestamp)}</span>
          </div>
        )}
        <div
          ref={(el) => { if (el) messageRefs.current[msg.id] = el; }}
          className={`flex ${isOwn ? "justify-end" : "justify-start"} transition-all duration-300 ${isHighlighted ? "scale-[1.02]" : ""}`}
        >
          {!isOwn && (
            <img src={activeUser?.avatar} className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover mr-2 mt-1 flex-shrink-0" alt="" />
          )}
          <div className={`relative group max-w-[85%] md:max-w-[70%] xl:max-w-[60%] 4k:max-w-[50%] ${isOwn ? "ml-8 md:ml-12" : "mr-8 md:mr-12"}`}>
            {isStarred && (
              <div className={`absolute -top-2 ${isOwn ? "right-2" : "left-2"} z-10`}>
                <span className="text-sm text-amber-400">⭐</span>
              </div>
            )}
            {msg.reply_to && (
              <div
                className={`mb-1.5 text-xs bg-black/5 p-2 rounded-xl cursor-pointer hover:bg-black/10 transition-colors ${isOwn ? "ml-2" : "mr-2"}`}
                onClick={() => msg.reply_to?.id && jumpToMessage(msg.reply_to.id)}
              >
                <div className="flex items-start gap-1.5">
                  <span className="font-semibold opacity-70 flex-shrink-0">↩ Replying to:</span>
                  <div className="flex-1 min-w-0">
                    {msg.reply_to.file_url ? (
                      <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span className="opacity-60 truncate">
                          {msg.reply_to.file_url.split('/').pop() || "Attachment"}
                        </span>
                      </div>
                    ) : (
                      <span className="opacity-60">
                        {msg.reply_to.content?.substring(0, 50)}
                        {msg.reply_to.content?.length > 50 && "..."}
                      </span>
                    )}
                    {msg.reply_to.edited && (
                      <span className="ml-1 text-[10px] opacity-40 italic">(edited)</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div
              ref={(el) => {
                if (el) {
                  messageRefs.current[msg.id] = el;
                }
              }}
              className={`relative px-3 py-2 rounded-2xl transition-all duration-200 ${
                isOwn 
                  ? "bg-purple-600 text-white rounded-br-sm" 
                  : "bg-white text-gray-900 rounded-bl-sm shadow-sm border border-gray-100"
              } ${msg.isTemp ? "opacity-70" : ""} ${isHighlighted ? "ring-2 ring-amber-400 ring-offset-2" : ""}`}
              onContextMenu={(e) => openContextMenu(msg, e, e.currentTarget)}
              onTouchStart={(e) => {
                const targetElement = e.currentTarget;
                longPressTimer.current = setTimeout(() => handleMobileLongPress(msg, e, targetElement), 500);
              }}
              onTouchEnd={() => { 
                if (longPressTimer.current) clearTimeout(longPressTimer.current); 
              }}
              onTouchCancel={() => { 
                if (longPressTimer.current) clearTimeout(longPressTimer.current); 
              }}
              onClick={(e) => {
                handleDoubleTap(msg, e, e.currentTarget);
              }}
            >
              {msg.file_url && (
                <div className="mb-2">
                  {msg.message_type === "image" ? (
                    <div className="relative">
                      <img
                        src={msg.file_url}
                        alt="attachment"
                        className="max-w-full max-h-48 md:max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setImageViewer({ open: true, url: msg.file_url })}
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); handleFileDownload(msg.file_url, msg.file_url.split("/").pop()); }}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-2 md:p-1.5 rounded-full md:opacity-0 md:group-hover:opacity-100 transition-all"
                        title="Download"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                      </button>
                    </div>
                  ) : (
                    <div className={`flex items-center justify-between gap-2 p-2 rounded-lg ${isOwn ? "bg-purple-700" : "bg-gray-100"}`}>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-lg">📄</span>
                        <span className="text-sm truncate max-w-[120px] md:max-w-[150px]">{msg.file_url.split("/").pop()}</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleFileDownload(msg.file_url, msg.file_url.split("/").pop()); }}
                        className="p-2 md:p-1.5 rounded-lg hover:bg-black/10 transition-colors flex-shrink-0"
                        title="Download"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {isEditing ? (
                <EditMessageInput
                  message={msg}
                  onSave={(val) => handleSaveEdit(msg.id, val)}
                  onCancel={() => setEditingMessageId(null)}
                />
              ) : (
                msg.text && (
                  <div>
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                      {msg.text}
                    </p>
                    {msg.edited && (
                      <span 
                        className="inline-block text-[10px] opacity-60 mt-1 italic"
                        title={`Edited at ${new Date(msg.timestamp).toLocaleString()}`}
                      >
                        edited
                      </span>
                    )}
                  </div>
                )
              )}

              <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isOwn ? "text-purple-200" : "text-gray-400"}`}>
                <span>{msg.time}</span>
                {isOwn && (
                  <div
                    className="flex items-center"
                    title={msg.is_seen ? "Seen" : "Sent"}
                  >
                    {msg.is_seen ? (
                      <span
                        style={{
                          position: "relative",
                          display: "inline-block",
                          width: "16px",
                          height: "12px",
                        }}
                      >
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#1d9bf0"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{
                            position: "absolute",
                            left: "0px",
                            top: "0px",
                          }}
                        >
                          <path d="M20 6L9 17L4 12" />
                        </svg>
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#1d9bf0"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{
                            position: "absolute",
                            left: "4px",
                            bottom: "0px",
                          }}
                        >
                          <path d="M20 6L9 17L4 12" />
                        </svg>
                      </span>
                    ) : (
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6L9 17L4 12" />
                      </svg>
                    )}
                  </div>
                )}
              </div>
            </div>

            <ReactionsDisplay
              reactions={msgReactions}
              onReact={(emoji) => handleReact(emoji, msg.id)}
              currentUserId={currentUserId}
            />

            <div className={`absolute top-1/2 -translate-y-1/2 ${isOwn ? "left-0 -translate-x-full pr-2" : "right-0 translate-x-full pl-2"} hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200`}>
              <button
                onClick={() => setReplyingTo(msg)}
                className="p-1.5 bg-white rounded-full shadow-md text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                title="Reply"
              >
                <span className="text-sm">↩️</span>
              </button>
              <button
                onClick={() => handleStarMessage(msg)}
                className={`p-1.5 bg-white rounded-full shadow-md transition-colors ${isStarred ? "text-amber-400" : "text-gray-400 hover:text-amber-400"}`}
                title="Star"
              >
                <span className="text-sm">⭐</span>
              </button>
              <button
                onClick={(e) => openContextMenu(msg, e, e.currentTarget)}
                className="p-1.5 bg-white rounded-full shadow-md text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                title="More"
              >
                <span className="text-sm">⋯</span>
              </button>
            </div>
          </div>
          {isOwn && (
            <div className="w-7 md:w-8 flex-shrink-0" />
          )}
        </div>
      </React.Fragment>
    );
  }, [messages, formatMessageDate, editingMessageId, highlightedMsgId, reactions, starredIds, openContextMenu, handleReact, handleStarMessage, handleSaveEdit, jumpToMessage, handleFileDownload, activeUser, handleMobileLongPress, handleDoubleTap]);

  const UserListItem = ({ user }) => (
    <div
      onClick={() => { setActiveUserId(user.id); setShowChatMobile(true); setMobileMenuOpen(false); clearUnreadMessages(user.id); }}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer relative transition-all duration-200 ${
        activeUserId === user.id 
          ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md" 
          : "hover:bg-gray-50"
      }`}
    >
      <div className="relative flex-shrink-0">
        <img src={user.avatar} className="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover" alt={user.name} />
        {user.online && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold truncate">{user.name || user.email?.split("@")[0]}</p>
          {user.last_message_time && (
            <p className="text-[10px] opacity-70 flex-shrink-0">{formatMessageTime(user.last_message_time)}</p>
          )}
        </div>
        <p className="text-xs truncate opacity-70">{user.lastMessage || "No messages yet"}</p>
        {user.online ? (
          <p className="text-[10px] text-green-500 mt-0.5">● Online</p>
        ) : user.last_active ? (
          <p className="text-[10px] opacity-50 mt-0.5">{formatLastSeen(user.last_active)}</p>
        ) : null}
      </div>
      {user.unread_count > 0 && activeUserId !== user.id && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 font-semibold">
          {user.unread_count > 99 ? "99+" : user.unread_count}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col overflow-hidden">
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideInFromRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-bounce { animation: bounce 1s infinite; }
        .animate-spin { animation: spin 1s linear infinite; }
        .animate-in { animation: fadeIn 0.2s ease-out; }
        .slide-in-from-right { animation: slideInFromRight 0.3s ease-out; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .safe-bottom { padding-bottom: env(safe-area-inset-bottom, 0px); }
        
        @media (min-width: 2560px) {
          .chat-main-wrapper { display: flex; width: 100%; }
          .chat-list-container { width: 480px !important; min-width: 480px !important; flex-shrink: 0 !important; }
          .chat-area-container { flex: 1 !important; width: calc(100% - 480px) !important; }
          .chat-header-name { font-size: 1.25rem !important; }
          .chat-header-status { font-size: 0.875rem !important; }
          .message-text { font-size: 1rem !important; }
          .message-time { font-size: 0.75rem !important; }
          .search-input { height: 48px !important; font-size: 1rem !important; }
          .user-list-item { padding: 1rem !important; }
          .user-name { font-size: 1rem !important; }
          .user-message-preview { font-size: 0.875rem !important; }
          .input-textarea { font-size: 1rem !important; }
        }
        
        @media (min-width: 1920px) and (max-width: 2559px) {
          .chat-list-container { width: 420px !important; min-width: 420px !important; }
          .message-text { font-size: 0.95rem !important; }
        }
        
        @media (min-width: 3840px) {
          .chat-list-container { width: 600px !important; min-width: 600px !important; }
          .message-text { font-size: 1.1rem !important; }
          .message-time { font-size: 0.85rem !important; }
          .search-input { height: 56px !important; font-size: 1.1rem !important; }
          .user-list-item { padding: 1.25rem !important; }
          .user-name { font-size: 1.1rem !important; }
          .user-message-preview { font-size: 1rem !important; }
        }
        
        @media (max-width: 767px) {
          .chat-list-container { width: 100% !important; }
          .message-bubble { max-width: 85% !important; }
        }
      `}</style>

      {/* Top Bar */}
      <div className="h-14 sm:h-16 md:h-[72px] px-3 sm:px-4 md:px-6 flex items-center justify-between flex-shrink-0 bg-white shadow-sm z-10 top-bar">
        <h1
          className="text-xl sm:text-2xl md:text-3xl font-bold truncate"
          style={{ fontFamily: "Trochut, cursive", background: "linear-gradient(135deg,#51218F 0%,#7c3aed 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
        >
          Talenta
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 sm:px-5 py-1.5 rounded-full bg-gradient-to-r from-[#51218F] to-[#7c3aed] text-white text-xs sm:text-sm font-medium hover:shadow-md transition-all transform active:scale-95 flex-shrink-0 ml-2"
        >
          Back
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden bg-white sm:rounded-t-2xl md:m-4 md:rounded-2xl chat-main-wrapper"
        style={{
          boxShadow: '0 0 30px rgba(81, 33, 143, 0.5), 0 25px 50px -12px rgba(81, 33, 143, 0.6), 0 0 0 1px rgba(124, 58, 237, 0.3)'
        }}
      >
        {/* LEFT: USER LIST */}
        <div className={`${showChatMobile ? "hidden md:flex" : "flex"} w-full md:w-[320px] lg:w-[360px] flex-col border-r border-gray-200 bg-white flex-shrink-0 chat-list-container`}>
          <div className="p-3 sm:p-4 pb-2">
            <div className="relative">
              <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base sm:text-lg">🔍</span>
              <input
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input w-full h-10 sm:h-11 rounded-full bg-gray-100 pl-10 sm:pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-purple-300 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 sm:px-3 pb-3">
            {!initialLoadDone || isLoadingUsers ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : displayedUsers.length === 0 ? (
              <div className="text-center py-12 px-4">
                <span className="text-4xl sm:text-5xl mb-3 block">💬</span>
                <p className="text-gray-400 text-sm">
                  {searchTerm.length >= 2 ? "No users match your search" : "No conversations yet"}
                </p>
                <p className="text-xs text-gray-300 mt-1">Start a chat by searching for users</p>
              </div>
            ) : (
              <div className="space-y-1">
                {displayedUsers.map((user) => (
                  <UserListItem key={user.id} user={user} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: CHAT AREA */}
        {activeUser ? (
          <div className={`flex-1 flex flex-col h-full ${showChatMobile ? "flex" : "hidden md:flex"} bg-gray-50 min-w-0 chat-area-container`}>
            <div className="h-14 sm:h-16 md:h-[72px] px-2 sm:px-3 md:px-5 flex items-center gap-2 sm:gap-3 border-b border-gray-200 bg-white flex-shrink-0">
              <button 
                onClick={() => setShowChatMobile(false)} 
                className="md:hidden p-2 -ml-1 text-purple-600 hover:bg-purple-50 rounded-full transition-colors flex-shrink-0"
                aria-label="Back to users"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="relative flex-shrink-0">
                <img src={activeUser.avatar} className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full object-cover" alt={activeUser.name} />
                {activeUser.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full animate-pulse" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[11px] sm:text-sm md:text-base truncate chat-header-name">
                  {activeUser.name || activeUser.email?.split("@")[0]}
                </p>
                <p className="text-[9px] sm:text-xs text-gray-400 truncate hidden sm:block chat-header-status">
                  {activeUser.email}
                </p>
                {activeUser.online ? (
                  <p className="text-[9px] sm:text-xs text-green-600 chat-header-status">Online</p>
                ) : activeUser.last_active ? (
                  <p className="text-[9px] sm:text-xs text-gray-400 chat-header-status">Last seen {formatLastSeen(activeUser.last_active)}</p>
                ) : null}
              </div>
              <ChatHeaderActions 
                activeUser={activeUser}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                activeCall={activeCall}
                handleCallInitiated={handleCallInitiated}
                showSearchInChat={showSearchInChat}
                setShowSearchInChat={setShowSearchInChat}
                setChatSearch={setChatSearch}
                showStarred={showStarred}
                setShowStarred={setShowStarred}
                setShowDeleteConversation={setShowDeleteConversation}
              />
            </div>

            {showSearchInChat && (
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-white border-b border-gray-100 flex-shrink-0">
                <span className="text-gray-400">🔍</span>
                <input
                  autoFocus
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                  placeholder="Search in this chat..."
                  className="flex-1 text-sm outline-none bg-transparent"
                />
                {chatSearchResults.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span>{chatSearchIndex + 1}/{chatSearchResults.length}</span>
                    <button onClick={() => setChatSearchIndex((p) => (p > 0 ? p - 1 : chatSearchResults.length - 1))} className="p-1.5 hover:text-purple-600 rounded-full hover:bg-gray-100">
                      <span>↑</span>
                    </button>
                    <button onClick={() => setChatSearchIndex((p) => (p < chatSearchResults.length - 1 ? p + 1 : 0))} className="p-1.5 hover:text-purple-600 rounded-full hover:bg-gray-100">
                      <span>↓</span>
                    </button>
                  </div>
                )}
                {chatSearch && chatSearchResults.length === 0 && <span className="text-xs text-gray-400">No results</span>}
                <button onClick={() => { setShowSearchInChat(false); setChatSearch(""); }} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100">
                  <span>✕</span>
                </button>
              </div>
            )}

            <PinnedMessageBanner
              message={pinnedMessage}
              onDismiss={() => setPinnedMessage(null)}
              onJump={jumpToMessage}
            />

            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-2 sm:px-3 md:px-5 py-3 md:py-5"
              style={{ minHeight: 0 }}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="space-y-2 max-w-full lg:max-w-7xl xl:max-w-[90%] 2xl:max-w-[1400px] mx-auto px-2 sm:px-3 md:px-4">
                {loading && messages.length === 0 ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-3 px-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-2xl sm:text-3xl">💬</span>
                    </div>
                    <p className="text-gray-400 text-sm text-center">No messages yet. Say hello! 👋</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, i) => renderMessage(msg, i))}
                    {isTyping && <TypingIndicator user={activeUser} />}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
              {userScrolled && (
                <button
                  onClick={handleJumpToBottom}
                  className="fixed bottom-20 sm:bottom-24 right-3 sm:right-4 md:bottom-28 md:right-9 text-white rounded-full p-2.5 shadow-lg transition-all transform hover:scale-105 z-10 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #51218F 0%, #7c3aed 100%)" }}
                  aria-label="Jump to bottom"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M19 12l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>

            {isDragOver && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] pointer-events-none p-4" style={{ top: topBarHeight, height: `calc(100% - ${topBarHeight}px)` }}>
                <div className="bg-white rounded-2xl p-6 sm:p-8 text-center shadow-2xl animate-in max-w-xs w-full">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl sm:text-4xl">📎</span>
                  </div>
                  <p className="text-lg sm:text-xl font-semibold text-purple-600 mb-2">Drop to Send</p>
                  <p className="text-sm text-gray-500">Images, documents, up to 25MB</p>
                </div>
              </div>
            )}

            {replyingTo && (
              <div className="px-3 sm:px-4 py-2.5 bg-purple-50 border-t border-purple-100 flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <div className="w-1 h-8 bg-purple-400 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-purple-600 font-semibold">↩ Replying to</p>
                  <p className="text-sm text-gray-700 truncate flex items-center gap-1.5">
                    {replyingTo.file_url ? (
                      <>
                        <svg className="w-4 h-4 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span className="truncate">Attachment</span>
                      </>
                    ) : (
                      replyingTo.text
                    )}
                  </p>
                </div>
                <button onClick={clearReply} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-white/50 flex-shrink-0">
                  <span>✕</span>
                </button>
              </div>
            )}

            {selectedFileName && (
              <div className="px-3 sm:px-4 py-2.5 bg-gray-100 border-t border-gray-200 flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span className="text-sm text-gray-700 truncate flex-1">{selectedFileName}</span>
                <button 
                  onClick={clearSelectedFile} 
                  className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-white/50 flex-shrink-0 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <div className="p-2 sm:p-3 md:p-4 bg-white border-t border-gray-200 flex-shrink-0 safe-bottom">
              <div className="flex items-end gap-1 sm:gap-2 bg-gray-100 rounded-2xl p-1.5 sm:p-2">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sending}
                    className="p-1.5 sm:p-2 text-purple-600 hover:bg-purple-100 rounded-full transition-colors disabled:opacity-40"
                    title="Attach file"
                  >
                    <svg className="w-5 h-5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                  <div className="relative" ref={emojiPickerRef}>
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      disabled={sending}
                      className="p-1.5 sm:p-2 text-purple-600 hover:bg-purple-100 rounded-full transition-colors disabled:opacity-40"
                      title="Insert emoji"
                    >
                      <span className="text-base sm:text-lg">😊</span>
                    </button>
                    {showEmojiPicker && (
                      <div className="absolute bottom-full mb-2 left-0 sm:right-0 z-50">
                        <div className="hidden sm:block">
                          <EmojiPicker
                            onEmojiClick={(emoji) => {
                              handleEmojiClick(emoji);
                              setShowEmojiPicker(false);
                            }}
                            autoFocusSearch={false}
                            theme="light"
                            width={320}
                            height={380}
                          />
                        </div>
                        <div className="sm:hidden">
                          <EmojiPicker
                            onEmojiClick={(emoji) => {
                              handleEmojiClick(emoji);
                              setShowEmojiPicker(false);
                            }}
                            autoFocusSearch={false}
                            theme="light"
                            width={280}
                            height={350}
                            style={{
                              maxWidth: 'calc(100vw - 32px)',
                              maxHeight: '60vh'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <textarea
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a message..."
                  disabled={sending}
                  rows={1}
                  className="input-textarea flex-1 bg-transparent text-sm outline-none resize-none max-h-24 sm:max-h-32 py-1.5 sm:py-2 min-h-[36px] sm:min-h-[40px]"
                />
                <button
                  onClick={sendMessage}
                  disabled={(!input.trim() && !selectedFile) || sending}
                  className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                    (!input.trim() && !selectedFile) || sending 
                      ? "bg-gray-300 text-gray-400 cursor-not-allowed" 
                      : "bg-purple-600 text-white hover:bg-purple-700 shadow-md active:scale-95"
                  }`}
                  aria-label="Send message"
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M22 2L11 13" />
                      <path d="M22 2L15 22 11 13 2 9 22 2Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 hidden md:flex flex-col items-center justify-center gap-4 px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-3xl sm:text-4xl">💬</span>
            </div>
            <p className="text-gray-400 text-sm text-center">Select a conversation to start messaging</p>
          </div>
        )}
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf,.doc,.docx,.txt,.zip,.xls,.xlsx,.csv" />

      {contextMenu && (
        <MessageContextMenu
          message={contextMenu.message}
          position={contextMenu.position}
          onClose={() => {
            setContextMenu(null);
            setContextMenuElement(null);
          }}
          isOwnMessage={contextMenu.message.from === "me"}
          onDelete={(msg) => handleDeleteMessage(msg)}
          onReply={(msg) => setReplyingTo(msg)}
          onCopy={handleCopyText}
          onEdit={handleEditMessage}
          onForward={(msg) => { setForwardMessage(msg); setContextMenu(null); setContextMenuElement(null); }}
          onPin={handlePinMessage}
          onStar={handleStarMessage}
          onReact={(emoji) => handleReact(emoji, contextMenu.message.id)}
          messageElement={contextMenuElement}
          topBarHeight={topBarHeight}
          customReactions={customReactions}
          onAddCustomEmoji={handleAddCustomEmoji}
          onRemoveCustomEmoji={handleRemoveCustomEmoji}
        />
      )}

      {forwardMessage && (
        <ForwardModal
          message={forwardMessage}
          users={allUsers.filter((u) => u.id !== currentUserId)}
          onForward={handleForwardMessage}
          onClose={() => setForwardMessage(null)}
          topBarHeight={topBarHeight}
        />
      )}

      {showStarred && (
        <StarredMessagesSidebar
          messages={messages}
          starredIds={starredIds}
          onClose={() => setShowStarred(false)}
          onJumpTo={jumpToMessage}
          topBarHeight={topBarHeight}
        />
      )}

      {incomingCall && (
        <IncomingCallNotification 
          callData={incomingCall} 
          onAccept={handleAcceptIncomingCall}
          onDecline={handleDeclineIncomingCall}
        />
      )}

      {activeCall && (
        <CallWindow 
          callData={activeCall} 
          onClose={handleEndCall} 
          currentUserId={currentUserId}
        />
      )}

      {showDeleteConversation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" style={{ top: topBarHeight, height: `calc(100% - ${topBarHeight}px)` }} onClick={() => setShowDeleteConversation(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-6 max-w-sm w-full animate-in mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl sm:text-3xl">🗑️</span>
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">Delete Conversation?</h3>
            <p className="text-gray-500 text-sm text-center mb-6">This action cannot be undone. All messages will be permanently deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConversation(false)} className="flex-1 h-11 sm:h-10 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">
                Cancel
              </button>
              <button onClick={handleDeleteConversation} className="flex-1 h-11 sm:h-10 rounded-full bg-red-500 text-white hover:bg-red-600 text-sm font-medium transition-all transform active:scale-95">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {imageViewer.open && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" style={{ top: topBarHeight, height: `calc(100% - ${topBarHeight}px)` }} onClick={() => setImageViewer({ open: false, url: null })}>
          <button 
            onClick={() => setImageViewer({ open: false, url: null })} 
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 sm:p-2 transition-colors z-10"
            aria-label="Close image viewer"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <img 
            src={imageViewer.url} 
            alt="Full size" 
            className="max-w-full max-h-[85vh] object-contain rounded-lg" 
            onClick={(e) => e.stopPropagation()} 
          />
          <button
            onClick={(e) => { e.stopPropagation(); handleFileDownload(imageViewer.url, imageViewer.url.split("/").pop()); }}
            className="absolute bottom-6 right-6 bg-white/10 hover:bg-white/20 text-white rounded-full px-4 py-2.5 sm:py-2 text-sm flex items-center gap-2 transition-colors"
          >
            <span>📥</span> <span className="hidden sm:inline">Download</span>
          </button>
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-xs hidden sm:block">Tap anywhere to close</p>
        </div>
      )}

      {mobileActionMessage && mobileActionElement && (
        <MobileMessageActions
          message={mobileActionMessage}
          messageElement={mobileActionElement}
          onClose={() => {
            setMobileActionMessage(null);
            setMobileActionElement(null);
          }}
          onReply={(msg) => {
            setReplyingTo(msg);
            setMobileActionMessage(null);
            setMobileActionElement(null);
          }}
          onStar={(msg) => {
            handleStarMessage(msg);
            setMobileActionMessage(null);
            setMobileActionElement(null);
          }}
          onContextMenu={(msg, e) => {
            const syntheticEvent = {
              clientX: window.innerWidth / 2,
              clientY: window.innerHeight / 2,
              preventDefault: () => {},
              stopPropagation: () => {}
            };
            openContextMenu(msg, syntheticEvent, mobileActionElement);
            setMobileActionMessage(null);
            setMobileActionElement(null);
          }}
          isStarred={starredIds.has(mobileActionMessage?.id)}
          topBarHeight={topBarHeight}
        />
      )}
    </div>
  );
}