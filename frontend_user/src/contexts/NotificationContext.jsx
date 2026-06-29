//src/contexts/NottificationContext.jsx
import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useUser } from './UserContext';
import { IncomingCallNotification } from '../pages/ColabratorView/CallComponents';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Plays a very short, subtle two-tone "pop" for new messages.
 * Duration ~150 ms — barely noticeable but gives feedback.
 */
function playMessageSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.07);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
    osc.onended = () => ctx.close();
  } catch (e) {
    // Audio not available — silently ignore
  }
}

/**
 * Plays a soft repeating two-note ringtone (C5 → B4) for incoming calls.
 * Returns a stop() function.
 */
function startRingtone() {
  let stopped = false;
  let ctx = null;
  let osc = null;
  let gain = null;
  let intervalId = null;

  try {
    ctx  = new (window.AudioContext || window.webkitAudioContext)();
    osc  = ctx.createOscillator();
    gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    gain.gain.value = 0;
    osc.start();

    let high = true;
    const ring = () => {
      if (stopped || !ctx) return;
      osc.frequency.value = high ? 523.25 : 493.88;   // C5 / B4
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.setValueAtTime(0.10, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
      high = !high;
    };

    ring();
    intervalId = setInterval(ring, 900);
  } catch (e) {
    // Silently ignore
  }

  const stop = () => {
    stopped = true;
    if (intervalId) clearInterval(intervalId);
    try {
      if (gain) gain.gain.setValueAtTime(0, ctx.currentTime);
      if (osc)  osc.stop();
      if (ctx)  ctx.close();
    } catch (_) {}
  };

  return stop;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export const NotificationProvider = ({ children }) => {
  const { userData } = useUser();

  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('messageSoundEnabled');
    return saved !== null ? saved === 'true' : true;
  });

  const [incomingCall,   setIncomingCall]   = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({});

  const wsRef                = useRef(null);
  const reconnectTimeoutRef  = useRef(null);
  const isMountedRef         = useRef(true);
  const stopRingtoneRef      = useRef(null);   // holds the stop() fn returned by startRingtone()
  const soundEnabledRef      = useRef(soundEnabled);
  soundEnabledRef.current    = soundEnabled;   // always up-to-date in callbacks

  // ── ringtone management ─────────────────────────────────────────────────
  const stopRingtone = useCallback(() => {
    if (stopRingtoneRef.current) {
      stopRingtoneRef.current();
      stopRingtoneRef.current = null;
    }
  }, []);

  const playRingtone = useCallback(() => {
    if (!soundEnabledRef.current) return;
    stopRingtone();                            // stop any existing ringtone first
    stopRingtoneRef.current = startRingtone();
  }, [stopRingtone]);

  // ── accept / decline ────────────────────────────────────────────────────
  const handleAcceptCall = useCallback(async () => {
    if (!incomingCall || !userData?.id) return;
    stopRingtone();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/message/call/${incomingCall.call_id}/join`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userData.id, call_id: incomingCall.call_id }),
        }
      );
      const data = await response.json();

      window.dispatchEvent(new CustomEvent('accept-call', {
        detail: { ...incomingCall, room_url: data.room_url, token: data.token }
      }));

      setIncomingCall(null);

      if (!window.location.pathname.includes('/message')) {
        window.location.href = `/message?user=${incomingCall.caller_id}`;
      }
    } catch (err) {
      console.error('Failed to accept call:', err);
      alert('Failed to accept call. Please try again.');
      setIncomingCall(null);
    }
  }, [incomingCall, userData?.id, stopRingtone]);

  const handleDeclineCall = useCallback(async () => {
    if (!incomingCall) { stopRingtone(); setIncomingCall(null); return; }
    stopRingtone();

    try {
      await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/message/call/${incomingCall.call_id}/end?user_id=${userData?.id}`,
        { method: 'POST' }
      );
    } catch (err) {
      console.error('Failed to decline call:', err);
    } finally {
      setIncomingCall(null);
    }
  }, [incomingCall, userData?.id, stopRingtone]);

  // ── WebSocket ───────────────────────────────────────────────────────────
  const getWebSocketUrl = useCallback(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    return `${apiBase.replace(/^http/, 'ws')}/message/ws/${userData?.id}`;
  }, [userData?.id]);

  const connectWebSocket = useCallback(() => {
    if (!userData?.id) return;
    if (wsRef.current?.readyState === WebSocket.OPEN ||
        wsRef.current?.readyState === WebSocket.CONNECTING) return;

    const ws = new WebSocket(getWebSocketUrl());

    ws.onopen = () => {
      // console.log('✅ Global WS connected');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // console.log('📩 Global WS msg:', data.type);

        // ── new message ──────────────────────────────────────────────────
        if (data.type === 'new_message') {
          // Subtle sound only — no toast popup
          if (soundEnabledRef.current) playMessageSound();

          setUnreadMessages(prev => ({
            ...prev,
            [data.sender_id]: {
              count: (prev[data.sender_id]?.count || 0) + 1,
              content: data.content,
              timestamp: data.timestamp,
              sender_id: data.sender_id,
            }
          }));

          // Let message page refresh if conversation is open
          window.dispatchEvent(new CustomEvent('new-message-received', {
            detail: { sender_id: data.sender_id, content: data.content, timestamp: data.timestamp }
          }));
        }

        // ── incoming call ────────────────────────────────────────────────
        else if (data.type === 'incoming_call') {
          // console.log('📞 Incoming call:', data.callData);
          playRingtone();
          setIncomingCall(data.callData);
          window.dispatchEvent(new CustomEvent('incoming-call', { detail: data.callData }));

          // Auto-decline after 30 s if user ignores it
          setTimeout(() => {
            setIncomingCall(current => {
              if (current?.call_id === data.callData?.call_id) {
                stopRingtone();
                return null;
              }
              return current;
            });
          }, 30_000);
        }

        // ── call ended (by the other side) ───────────────────────────────
        else if (data.type === 'call_ended') {
          // console.log('🔚 Call ended by remote:', data.call_id);
          stopRingtone();
          setIncomingCall(null);

          // Tell CallWindow (if open) to close itself
          window.dispatchEvent(new CustomEvent('call-ended', {
            detail: { call_id: data.call_id, reason: data.reason }
          }));
        }

        // ── call joined confirmation ─────────────────────────────────────
        else if (data.type === 'call_joined') {
          // console.log('✅ Call joined:', data.call_id);
        }

      } catch (err) {
        console.error('WS parse error:', err);
      }
    };

    ws.onerror = (err) => console.error('Global WS error:', err);

    ws.onclose = () => {
      // console.log('🔌 Global WS closed — will reconnect in 5 s');
      if (isMountedRef.current && userData?.id) {
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
      }
    };

    wsRef.current = ws;
  }, [userData?.id, getWebSocketUrl, playRingtone, stopRingtone]);

  // ── lifecycle ───────────────────────────────────────────────────────────
  useEffect(() => {
    isMountedRef.current = true;
    if (userData?.id) connectWebSocket();

    return () => {
      isMountedRef.current = false;
      stopRingtone();
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [userData?.id, connectWebSocket, stopRingtone]);

  // ── helpers ─────────────────────────────────────────────────────────────
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      localStorage.setItem('messageSoundEnabled', next);
      return next;
    });
  }, []);

  const clearUnreadMessages = useCallback((userId) => {
    setUnreadMessages(prev => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  }, []);

  const getTotalUnreadCount = useCallback(() =>
    Object.values(unreadMessages).reduce((sum, m) => sum + (m.count || 0), 0),
  [unreadMessages]);

  // ── render ──────────────────────────────────────────────────────────────
  return (
    <NotificationContext.Provider value={{
      soundEnabled,
      toggleSound,
      incomingCall,
      unreadMessages,
      clearUnreadMessages,
      getTotalUnreadCount,
      // kept for backward-compat (message page uses these)
      showToast: null,
      setShowToast: () => {},
      playNotificationSound: soundEnabledRef.current ? playMessageSound : () => {},
    }}>
      {children}

      {/* Global incoming-call popup */}
      {incomingCall && (
        <IncomingCallNotification
          callData={incomingCall}
          onAccept={handleAcceptCall}
          onDecline={handleDeclineCall}
        />
      )}

      {/* Floating unread-message button */}
      {getTotalUnreadCount() > 0 && (
        <div className="fixed bottom-6 right-6 z-[9998]">
          <button
            onClick={() => window.location.href = '/message'}
            className="w-14 h-14 bg-purple-600 rounded-full shadow-lg hover:bg-purple-700 transition-all transform hover:scale-105 flex items-center justify-center relative"
            style={{ animation: 'gentleBounce 2s ease-in-out infinite' }}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {getTotalUnreadCount() > 9 ? '9+' : getTotalUnreadCount()}
            </span>
          </button>
        </div>
      )}

      <style>{`
        @keyframes gentleBounce {
          0%, 100% { transform: translateY(0);   }
          50%       { transform: translateY(-6px); }
        }
      `}</style>
    </NotificationContext.Provider>
  );
};