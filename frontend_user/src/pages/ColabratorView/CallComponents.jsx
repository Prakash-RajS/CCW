// CallComponents.jsx - Complete Fixed Version
import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from "../../utils/axiosConfig";

// ─── Simple Audio Context ───────────────────────────────────────────────
let globalAudioContext = null;
let currentSoundRef = null;

const getAudioContext = () => {
  if (!globalAudioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    globalAudioContext = new AudioContextClass();
  }
  return globalAudioContext;
};

const stopAllSounds = () => {
  if (currentSoundRef) {
    if (currentSoundRef.oscillator) {
      try { currentSoundRef.oscillator.stop(); } catch(e) {}
    }
    if (currentSoundRef.interval) {
      clearInterval(currentSoundRef.interval);
    }
    if (currentSoundRef.timeout) {
      clearTimeout(currentSoundRef.timeout);
    }
    currentSoundRef = null;
  }
};

const closeAudioContext = () => {
  stopAllSounds();
  if (globalAudioContext) {
    globalAudioContext.close().catch(e => console.log('Audio close error:', e));
    globalAudioContext = null;
  }
};

// Simple dialing sound (gentle beep every 2 seconds)
const playDialingSound = (isActiveRef) => {
  stopAllSounds();
  
  const audioCtx = getAudioContext();
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  let isActive = true;
  let oscillator = null;
  let intervalId = null;
  
  const beep = () => {
    if (!isActive || !isActiveRef.current) return;
    try {
      oscillator = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      oscillator.connect(gain);
      gain.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.value = 450;
      gain.gain.value = 0.1;
      oscillator.start();
      gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.4);
      setTimeout(() => {
        try { oscillator.stop(); } catch(e) {}
      }, 400);
    } catch(e) {}
  };
  
  beep();
  intervalId = setInterval(() => {
    if (isActive && isActiveRef.current) {
      beep();
    } else {
      clearInterval(intervalId);
    }
  }, 2500);
  
  currentSoundRef = { oscillator, interval: intervalId };
  
  return () => {
    isActive = false;
    if (intervalId) clearInterval(intervalId);
  };
};

// Simple ringtone (two beeps repeating)
const playRingtone = (isActiveRef) => {
  stopAllSounds();
  
  const audioCtx = getAudioContext();
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  let isActive = true;
  let timeouts = [];
  
  const beep = (frequency, delay, duration = 0.4, volume = 0.12) => {
    const timeoutId = setTimeout(() => {
      if (!isActive || !isActiveRef.current) return;
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.value = frequency;
        gain.gain.value = volume;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
        setTimeout(() => {
          try { osc.stop(); } catch(e) {}
        }, duration * 1000);
      } catch(e) {}
    }, delay);
    timeouts.push(timeoutId);
  };
  
  const playPattern = () => {
    if (!isActive || !isActiveRef.current) return;
    beep(525, 0, 0.4, 0.12);
    beep(525, 700, 0.4, 0.12);
    
    const patternTimeout = setTimeout(() => {
      if (isActive && isActiveRef.current) playPattern();
    }, 2000);
    timeouts.push(patternTimeout);
  };
  
  playPattern();
  
  currentSoundRef = { timeouts };
  
  return () => {
    isActive = false;
    timeouts.forEach(id => clearTimeout(id));
  };
};

// Simple connected sound (short double beep)
const playConnectedSound = () => {
  const audioCtx = getAudioContext();
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  const beep = (frequency, delay, volume = 0.15) => {
    setTimeout(() => {
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.value = frequency;
        gain.gain.value = volume;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.2);
        setTimeout(() => osc.stop(), 200);
      } catch(e) {}
    }, delay);
  };
  
  beep(587.33, 0);
  beep(783.99, 150);
};

// Simple end call sound (short descending beep)
const playEndSound = () => {
  const audioCtx = getAudioContext();
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  const beep = (frequency, delay, volume = 0.12) => {
    setTimeout(() => {
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.value = frequency;
        gain.gain.value = volume;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.3);
        setTimeout(() => osc.stop(), 300);
      } catch(e) {}
    }, delay);
  };
  
  beep(392.00, 0);
  beep(349.23, 120);
  beep(293.66, 240);
};

// Helper to get initials from name
const getInitials = (name) => {
  if (!name || name === 'User' || name === 'Caller' || name === 'undefined' || name === 'null' || name === '') return '??';
  
  let cleanName = name.split('@')[0];
  cleanName = cleanName.replace(/[0-9]+$/, '');
  
  if (!cleanName || cleanName.length === 0) return 'U';
  
  const nameParts = cleanName.split(/[\s._-]+/);
  
  if (nameParts.length === 1) {
    const singleName = nameParts[0];
    if (singleName.length >= 2) {
      return singleName.substring(0, 2).toUpperCase();
    }
    return singleName.substring(0, 1).toUpperCase();
  }
  
  const firstInitial = nameParts[0]?.charAt(0) || '';
  const lastInitial = nameParts[nameParts.length - 1]?.charAt(0) || '';
  const result = (firstInitial + lastInitial).toUpperCase();
  return result || 'U';
};

// Helper to get random color based on name
const getAvatarColor = (name) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7B731', '#5D9BEC', '#F06292',
    '#BA68C8', '#4DB6AC', '#FF8A65', '#A1887F', '#E57373',
    '#7986CB', '#4FC3F7', '#4DD0E1', '#4DB6AC', '#81C784',
    '#FFB74D', '#FF8A65', '#A1887F', '#E57373', '#F06292'
  ];
  
  let hash = 0;
  const nameStr = String(name || 'User');
  for (let i = 0; i < nameStr.length; i++) {
    hash = ((hash << 5) - hash) + nameStr.charCodeAt(i);
    hash = hash & hash;
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// FIXED: Convert any raw name/email into a clean display name
const formatDisplayName = (rawName) => {
  if (!rawName || rawName === 'User' || rawName === 'Caller' || rawName === 'undefined' || rawName === 'null' || rawName === '') {
    return null;
  }

  let name = String(rawName);

  // If it's an email, extract username part and clean it
  if (name.includes('@')) {
    name = name.split('@')[0];
    // Remove numbers at the end (e.g., "priya123" -> "priya")
    name = name.replace(/[0-9]+$/, '');
    // Capitalize first letter
    if (name.length > 0) {
      name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }
    return name || null;
  }

  // Remove trailing numbers
  name = name.replace(/[0-9]+$/, '');
  
  if (!name) return null;

  // Split by common separators and capitalize each part
  const parts = name.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return null;

  const formatted = parts
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
  
  return formatted;
};

// ─── Avatar with Initials Component ──────────────────────────────────────
const InitialsAvatar = ({ name, size = 'large' }) => {
  const safeName = name && name !== 'undefined' && name !== 'null' && name !== '' ? name : 'User';
  const initials = getInitials(safeName);
  const backgroundColor = getAvatarColor(safeName);
  
  const sizeClasses = {
    small: 'w-12 h-12 text-lg',
    medium: 'w-16 h-16 text-xl',
    large: 'w-20 h-20 sm:w-28 sm:h-28 text-2xl sm:text-4xl',
    xlarge: 'w-32 h-32 text-4xl'
  };
  
  const sizeClass = sizeClasses[size] || sizeClasses.large;
  
  return (
    <div 
      className={`${sizeClass} rounded-full flex items-center justify-center font-bold shadow-lg transition-all duration-300`}
      style={{ backgroundColor, color: 'white' }}
    >
      {initials}
    </div>
  );
};

// ─── CallButton ───────────────────────────────────────────────────────────────
export const CallButton = ({ otherUserId, callType, onCallInitiated, currentUserId, currentUserName, disabled }) => {
  const [isInitiating, setIsInitiating] = useState(false);

  const initiateCall = async () => {
    if (isInitiating || disabled) return;
    setIsInitiating(true);
    
    // Clean the caller name before sending
    let cleanCallerName = currentUserName;
    if (cleanCallerName && cleanCallerName.includes('@')) {
      cleanCallerName = cleanCallerName.split('@')[0];
      cleanCallerName = cleanCallerName.replace(/[0-9]+$/, '');
      cleanCallerName = cleanCallerName.charAt(0).toUpperCase() + cleanCallerName.slice(1).toLowerCase();
    }
    
    // console.log('📞 CallButton - Original caller_name:', currentUserName);
    // console.log('📞 CallButton - Clean caller_name:', cleanCallerName);
    // console.log('📞 CallButton - receiver_id:', otherUserId);
    
    try {
      const response = await api.post('/message/call/initiate', {
        caller_id: currentUserId,
        caller_name: cleanCallerName || currentUserName, // Send cleaned name
        receiver_id: otherUserId,
        call_type: callType
      });
      if (response.data.status === 'success') {
        onCallInitiated({ 
          ...response.data, 
          caller_id: currentUserId, 
          caller_name: cleanCallerName || currentUserName
        });
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      console.error('❌ Failed to initiate call:', error);
      alert(error.response?.data?.detail || 'Failed to start call. Please try again.');
    } finally {
      setIsInitiating(false);
    }
  };

  return (
    <button
      onClick={initiateCall}
      disabled={isInitiating || disabled}
      className={`p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors ${isInitiating || disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={`Start ${callType} call`}
    >
      {isInitiating ? (
        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      ) : callType === 'video' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8 10a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      )}
    </button>
  );
};

// ─── CallWindow ───────────────────────────────────────────────────────────────
export const CallWindow = ({ callData, onClose, currentUserId }) => {
  const localVideoRef      = useRef(null);
  const remoteVideoRef     = useRef(null);
  const pcRef              = useRef(null);
  const localStreamRef     = useRef(null);
  const wsRef              = useRef(null);
  const wsConnectedRef     = useRef(false);
  const hasJoinedRef       = useRef(false);
  const iceCandidateQueue  = useRef([]);
  const isCleanedUpRef     = useRef(false);
  const isEndedRef         = useRef(false);
  const callTimerRef       = useRef(null);
  const mountedRef         = useRef(true);
  
  // Sound refs
  const isDialingRef = useRef(false);
  const isRingtoneRef = useRef(false);
  const hasConnectedPlayedRef = useRef(false);

  const [isJoining,    setIsJoining]    = useState(true);
  const [error,        setError]        = useState(null);
  const [isMuted,      setIsMuted]      = useState(false);
  const [isVideoOff,   setIsVideoOff]   = useState(false);
  const [callStatus,   setCallStatus]   = useState('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isCaller = Number(currentUserId) === Number(callData.caller_id);
  
  // FIXED: Better name extraction for CallWindow
  useEffect(() => {
    let rawName;
    if (isCaller) {
      // Caller sees the receiver's name
      rawName = callData.receiver_name || callData.receiver_name_from_api;
    } else {
      // Receiver sees the caller's name
      rawName = callData.caller_name || callData.caller_name_from_api;
    }
    
    // Format the name properly
    const formatted = formatDisplayName(rawName);
    setDisplayName(formatted || (isCaller ? 'Other User' : 'Caller'));
  }, [isCaller, callData]);

  // Stop all sounds immediately
  const stopSounds = useCallback(() => {
    isDialingRef.current = false;
    isRingtoneRef.current = false;
    stopAllSounds();
  }, []);

  const ICE_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ]
  };

  const sendSignal = useCallback((msg) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const cleanup = useCallback(() => {
    if (isCleanedUpRef.current) return;
    isCleanedUpRef.current = true;
    mountedRef.current = false;

    stopSounds();
    closeAudioContext();

    if (callTimerRef.current) clearInterval(callTimerRef.current);

    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;

    if (localVideoRef.current)  localVideoRef.current.srcObject  = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    if (pcRef.current) {
      pcRef.current.ontrack = null;
      pcRef.current.onicecandidate = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.close();
      pcRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.onopen    = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror   = null;
      wsRef.current.onclose   = null;
      if (wsRef.current.readyState <= WebSocket.OPEN) wsRef.current.close();
      wsRef.current = null;
    }
    wsConnectedRef.current = false;
    hasJoinedRef.current   = false;
  }, [stopSounds]);

  const handleEndCall = useCallback(async () => {
    if (isEndedRef.current) return;
    isEndedRef.current = true;
    
    stopSounds();
    playEndSound();
    
    if (mountedRef.current) setCallStatus('ended');
    try {
      await api.post(`/message/call/${callData.call_id}/end?user_id=${currentUserId}`);
    } catch (e) {
      console.warn('end-call API:', e);
    } finally {
      cleanup();
      setTimeout(onClose, 400);
    }
  }, [callData.call_id, currentUserId, cleanup, onClose, stopSounds]);

  useEffect(() => {
    if (!isCallActive) return;
    callTimerRef.current = setInterval(() => {
      if (mountedRef.current) setCallDuration(s => s + 1);
    }, 1000);
    return () => clearInterval(callTimerRef.current);
  }, [isCallActive]);

  const drainIceCandidateQueue = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc || !pc.remoteDescription) return;
    while (iceCandidateQueue.current.length) {
      const candidate = iceCandidateQueue.current.shift();
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn('ICE drain error:', e);
      }
    }
  }, []);

  const createOffer = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;
    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: callData.call_type === 'video',
      });
      await pc.setLocalDescription(offer);
      sendSignal({ type: 'offer', offer: pc.localDescription, call_id: callData.call_id, from: Number(currentUserId) });
    } catch (e) {
      console.error('createOffer failed:', e);
    }
  }, [callData, currentUserId, sendSignal]);

  const handleOffer = useCallback(async (offer) => {
    const pc = pcRef.current;
    if (!pc) return;
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      await drainIceCandidateQueue();
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendSignal({ type: 'answer', answer: pc.localDescription, call_id: callData.call_id, from: Number(currentUserId) });
    } catch (e) {
      console.error('handleOffer failed:', e);
    }
  }, [callData, currentUserId, sendSignal, drainIceCandidateQueue]);

  const handleAnswer = useCallback(async (answer) => {
    const pc = pcRef.current;
    if (!pc) return;
    try {
      if (pc.signalingState !== 'have-local-offer') return;
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      await drainIceCandidateQueue();
    } catch (e) {
      console.error('handleAnswer failed:', e);
    }
  }, [drainIceCandidateQueue]);

  const handleIceCandidate = useCallback(async (candidate) => {
    const pc = pcRef.current;
    if (!pc) return;
    if (pc.remoteDescription && pc.remoteDescription.type) {
      try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); }
      catch (e) { console.warn('ICE add error:', e); }
    } else {
      iceCandidateQueue.current.push(candidate);
    }
  }, []);

  const setupPeerConnection = useCallback((stream) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.ontrack = (e) => {
      if (remoteVideoRef.current && e.streams[0]) {
        remoteVideoRef.current.srcObject = e.streams[0];
        // Speaker is off by default — leave audio on the default route
        // (e.g. connected earphones) until the user taps the speaker button.
      }
      if (mountedRef.current) {
        setCallStatus('active');
        setIsCallActive(true);
      }
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        sendSignal({ type: 'ice-candidate', candidate: e.candidate, call_id: callData.call_id, from: Number(currentUserId) });
      }
    };

    pc.onconnectionstatechange = () => {
      if (!mountedRef.current) return;
      if (pc.connectionState === 'connected') {
        setCallStatus('active');
        setIsCallActive(true);
        
        if (!hasConnectedPlayedRef.current) {
          hasConnectedPlayedRef.current = true;
          stopSounds();
          playConnectedSound();
        }
      }
      if (pc.connectionState === 'failed') handleEndCall();
      if (pc.connectionState === 'disconnected') setCallStatus('disconnected');
    };

    return pc;
  }, [callData, currentUserId, sendSignal, handleEndCall, stopSounds, isSpeakerOn]);

  const connectSignaling = useCallback(() => {
    if (wsConnectedRef.current) return;
    wsConnectedRef.current = true;

    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const wsBase  = apiBase.replace(/^http/, 'ws');
    const url     = `${wsBase}/message/call/${callData.call_id}/signal`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (hasJoinedRef.current) return;
      hasJoinedRef.current = true;
      ws.send(JSON.stringify({
        type: 'join',
        call_id: callData.call_id,
        user_id: Number(currentUserId),
        is_caller: isCaller,
      }));
    };

    ws.onmessage = async (event) => {
      if (!mountedRef.current) return;
      let msg;
      try { msg = JSON.parse(event.data); }
      catch (e) { return; }

      switch (msg.type) {
        case 'user-joined': {
          const joinedId = Number(msg.user_id);
          if (isCaller && joinedId !== Number(currentUserId)) {
            await createOffer();
          }
          break;
        }
        case 'offer':
          if (!isCaller && msg.from !== Number(currentUserId)) {
            await handleOffer(msg.offer);
          }
          break;
        case 'answer':
          if (isCaller && msg.from !== Number(currentUserId)) {
            await handleAnswer(msg.answer);
          }
          break;
        case 'ice-candidate':
          if (msg.from !== Number(currentUserId)) {
            await handleIceCandidate(msg.candidate);
          }
          break;
        case 'user-left':
          handleEndCall();
          break;
        default:
          break;
      }
    };

    ws.onerror = (e) => {
      console.error('Signaling WS error:', e);
      if (mountedRef.current) setError('Signaling connection error. Please try again.');
    };
  }, [callData, currentUserId, isCaller, createOffer, handleOffer, handleAnswer, handleIceCandidate, handleEndCall]);

  const joinCall = useCallback(async () => {
    try {
      setCallStatus('requesting-media');
      
      if (isCaller) {
        isDialingRef.current = true;
        playDialingSound(isDialingRef);
      } else {
        isRingtoneRef.current = true;
        playRingtone(isRingtoneRef);
      }

      const constraints = {
        audio: true,
        video: callData.call_type === 'video'
          ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
          : false,
      };

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (mountedRef.current) setIsVideoOff(true);
      }

      localStreamRef.current = stream;
      if (localVideoRef.current && callData.call_type === 'video') {
        localVideoRef.current.srcObject = stream;
      }

      if (mountedRef.current) setCallStatus('connecting');

      await api.post(`/message/call/${callData.call_id}/join`, {
        user_id: Number(currentUserId),
        call_id: callData.call_id,
      });

      setupPeerConnection(stream);
      connectSignaling();

      if (mountedRef.current) setIsJoining(false);
    } catch (err) {
      console.error('❌ joinCall error:', err);
      if (!mountedRef.current) return;
      let msg = 'Failed to join call. ';
      if (err.name === 'NotAllowedError')    msg += 'Please allow camera/microphone access.';
      else if (err.name === 'NotFoundError') msg += 'No camera or microphone found.';
      else msg += err.response?.data?.detail || err.message || 'Unknown error.';
      setError(msg);
      setIsJoining(false);
      setCallStatus('failed');
      stopSounds();
      cleanup();
    }
  }, [callData, currentUserId, setupPeerConnection, connectSignaling, cleanup, isCaller, stopSounds]);

  useEffect(() => {
    mountedRef.current = true;
    joinCall();

    const onCallEnded = (e) => {
      if (!e.detail?.call_id || e.detail.call_id === callData.call_id) {
        stopSounds();
        handleEndCall();
      }
    };
    window.addEventListener('call-ended', onCallEnded);

    return () => {
      window.removeEventListener('call-ended', onCallEnded);
      stopSounds();
    };
  }, []);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      stopSounds();
      cleanup();
    };
  }, [cleanup, stopSounds]);

  const toggleMute = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setIsMuted(!track.enabled); }
  };

  const toggleVideo = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setIsVideoOff(!track.enabled); }
  };

  // Speaker is OFF by default — audio follows whatever output the OS has
  // chosen (e.g. connected earphones/Bluetooth). Tapping the button forces
  // playback through the device's built-in/loud speaker, even if earphones
  // are plugged in. Tapping again returns to the default route.
  const toggleSpeaker = useCallback(async () => {
    const mediaEl = remoteVideoRef.current;
    const nextState = !isSpeakerOn;

    if (mediaEl) {
      if (typeof mediaEl.setSinkId === 'function' && navigator.mediaDevices?.enumerateDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const outputs = devices.filter(d => d.kind === 'audiooutput');

          // DEBUG: log what audio output devices this browser actually exposes.
          // Check the console — if labels are blank/generic, setSinkId has
          // nothing useful to target and the OS controls routing instead.
          // console.log('🔊 Available audio outputs:', outputs.map(d => ({ id: d.deviceId, label: d.label })));

          if (nextState) {
            // Force the device's built-in/loud speaker, bypassing earphones/headset
            const builtInSpeaker = outputs.find(d => /speaker|built[- ]?in/i.test(d.label));
            if (builtInSpeaker) {
              await mediaEl.setSinkId(builtInSpeaker.deviceId);
            } else {
              // No labeled built-in speaker available — at least max the volume
              mediaEl.volume = 1.0;
            }
          } else {
            // Return audio to the default route (earphone/headset if connected)
            await mediaEl.setSinkId('default');
          }
        } catch (e) {
          console.warn('setSinkId not available, using volume fallback:', e);
          mediaEl.volume = nextState ? 1.0 : 0.7;
        }
      } else {
        // No output-switching support on this browser/device — use volume as the cue
        mediaEl.volume = nextState ? 1.0 : 0.7;
      }
    }

    setIsSpeakerOn(nextState);
  }, [isSpeakerOn]);

  const fmt = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  const statusColor = { active: '#22c55e', connecting: '#facc15', disconnected: '#f97316', failed: '#ef4444', ended: '#9ca3af' }[callStatus] ?? '#facc15';

  const statusLabel = {
    'requesting-media': 'Requesting permissions…',
    'connecting':       'Connecting…',
    'active':           fmt(callDuration),
    'disconnected':     'Reconnecting…',
    'failed':           'Connection failed',
    'ended':            'Call ended',
  }[callStatus] ?? '…';

  return (
    <>
      <div className="fixed inset-0 z-[999]" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }} />
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl w-full" style={{
          width: '100%', 
          maxWidth: isMobile ? '100%' : '900px', 
          height: isMobile ? '100%' : '90vh', 
          maxHeight: isMobile ? '100%' : '680px',
          background: 'linear-gradient(160deg, #0f0a1e 0%, #1a0f2e 50%, #0a0f1e 100%)',
          border: '1px solid rgba(139,92,246,0.15)',
        }}>
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 70%)',
          }} />

         <div className="absolute inset-0">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover"
              style={{ opacity: (callStatus === 'active' && callData.call_type === 'video') ? 1 : 0, transition: 'opacity 0.6s ease' }} />
          </div>

          {(callStatus !== 'active' || callData.call_type !== 'video') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              <div className="relative mb-4 sm:mb-8">
                {callStatus !== 'active' && (
                  <div className="absolute inset-[-12px] sm:inset-[-16px] rounded-full animate-ping"
                    style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)', animationDuration: '2s' }} />
                )}
                <InitialsAvatar name={displayName || 'User'} size="large" />
              </div>
              <p style={{ color: 'rgba(196,181,253,0.95)', fontSize: '14px', sm: '18px', fontWeight: 600 }}>
                {displayName || 'User'}
              </p>
              <p style={{ color: 'rgba(196,181,253,0.7)', fontSize: '12px', marginTop: '4px' }}>
                {callStatus === 'ended' ? 'Call Ended' : callStatus === 'failed' ? 'Connection Failed' :
                  callStatus === 'active' ? fmt(callDuration) :
                  isCaller ? 'Calling...' : 'Incoming call...'}
              </p>
              {['connecting','requesting-media'].includes(callStatus) && (
                <div className="mt-2 sm:mt-3 flex gap-1 sm:gap-1.5">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-purple-400"
                      style={{ animation: 'dotBounce 1.2s ease-in-out infinite', animationDelay: `${i*0.2}s` }} />
                  ))}
                </div>
              )}
            </div>
          )}

          {callData.call_type === 'video' && (
            <div className="absolute top-2 right-2 sm:top-5 sm:right-5 overflow-hidden shadow-2xl z-10" style={{
              width: isMobile ? '80px' : '180px', 
              height: isMobile ? '60px' : '135px', 
              borderRadius: isMobile ? '10px' : '16px',
              border: '1px solid rgba(255,255,255,0.15)', background: '#111',
            }}>
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover"
                style={{ display: isVideoOff ? 'none' : 'block' }} />
              {isVideoOff && (
                <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(30,10,50,0.9)' }}>
                  <svg className="w-6 h-6 sm:w-10 sm:h-10" fill="none" stroke="rgba(139,92,246,0.7)" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <div style={{ position: 'absolute', bottom: 4, left: 6, fontSize: isMobile ? '8px' : '10px', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>You</div>
            </div>
          )}

          {(isJoining || error) && (
            <div className="absolute inset-0 flex items-center justify-center z-20 p-4"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
              <div className="text-center p-4 sm:p-8 rounded-2xl" style={{
                background: 'rgba(15,10,30,0.95)', border: '1px solid rgba(139,92,246,0.2)', maxWidth: '320px',
              }}>
                {error ? (
                  <>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚠️</div>
                    <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '16px', lineHeight: 1.5, fontSize: '13px' }}>{error}</p>
                    <button onClick={handleEndCall} className="px-4 py-2 rounded-xl font-medium text-sm"
                      style={{ background: 'rgba(139,92,246,0.8)', color: 'white' }}>Close</button>
                  </>
                ) : (
                  <>
                    <div className="mx-auto mb-4 rounded-full border-4 border-t-transparent animate-spin" style={{
                      width: '40px', height: '40px',
                      borderColor: 'rgba(139,92,246,0.8) rgba(139,92,246,0.2) rgba(139,92,246,0.2) rgba(139,92,246,0.2)',
                    }} />
                    <p style={{ color: 'rgba(196,181,253,0.9)', fontWeight: 500, fontSize: '13px' }}>Connecting…</p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '6px' }}>Allow camera & microphone access</p>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="absolute top-2 left-2 sm:top-5 sm:left-5 z-20 flex items-center gap-2 sm:gap-3">
            <div style={{
              display: 'flex', alignItems: 'center', gap: '4px', sm: '8px',
              background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)',
              borderRadius: '999px', padding: '3px 8px', sm: '6px 14px', border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%', background: statusColor,
                boxShadow: `0 0 8px ${statusColor}`,
                animation: callStatus === 'active' ? 'none' : 'pulse 1.5s ease-in-out infinite',
              }} />
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '10px', sm: '13px', fontFamily: 'monospace', letterSpacing: '0.03em' }}>
                {statusLabel}
              </span>
            </div>
            <div style={{
              background: 'rgba(139,92,246,0.25)', backdropFilter: 'blur(8px)',
              borderRadius: '999px', padding: '3px 8px', sm: '5px 12px', border: '1px solid rgba(139,92,246,0.3)',
            }}>
              <span style={{ color: 'rgba(196,181,253,0.9)', fontSize: '9px', sm: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {callData.call_type === 'video' ? '📹 Video' : '🎙️ Audio'}
              </span>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-20" style={{
            padding: isMobile ? '12px 12px 16px' : '32px 32px 28px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
          }}>
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              <ControlBtn active={isMuted} onClick={toggleMute} label={isMuted ? 'Unmute' : 'Mute'} activeColor="#ef4444" isMobile={isMobile}
                icon={isMuted
                  ? <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                  : <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                }
              />

              {callData.call_type === 'video' && (
                <ControlBtn active={isVideoOff} onClick={toggleVideo} label={isVideoOff ? 'Camera on' : 'Camera off'} activeColor="#ef4444" isMobile={isMobile}
                  icon={isVideoOff
                    ? <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" /></svg>
                    : <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  }
                />
              )}

              <button onClick={handleEndCall} title="End call" style={{
                width: isMobile ? '44px' : '58px', 
                height: isMobile ? '44px' : '58px', 
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 24px rgba(220,38,38,0.45)', transition: 'transform 0.2s ease',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <svg width={isMobile ? "18" : "22"} height={isMobile ? "18" : "22"} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="rotate(135)">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </button>

              <ControlBtn active={isSpeakerOn} onClick={toggleSpeaker} label={isSpeakerOn ? 'Speaker on' : 'Speaker off'} activeColor="#7c3aed" isMobile={isMobile}
                icon={isSpeakerOn
                  ? <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5L6 9H2v6h4l5 4V5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.54 8.46a5 5 0 010 7.07" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.07 5.93a9 9 0 010 12.73" />
                    </svg>
                  : <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5L6 9H2v6h4l5 4V5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 9l5 5m0-5l-5 5" />
                    </svg>
                }
              />

              {!isMobile && (
                <ControlBtn active={false}
                  onClick={() => !document.fullscreenElement ? document.documentElement.requestFullscreen?.() : document.exitFullscreen?.()}
                  label="Fullscreen"
                  icon={<svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dotBounce { 0%,80%,100%{transform:translateY(0);opacity:.6} 40%{transform:translateY(-6px);opacity:1} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </>
  );
};

const ControlBtn = ({ icon, onClick, label, active = false, activeColor = '#374151', isMobile = false }) => (
  <button onClick={onClick} title={label} style={{
    width: isMobile ? '38px' : '52px', 
    height: isMobile ? '38px' : '52px', 
    borderRadius: '50%',
    background: active ? activeColor : 'rgba(255,255,255,0.1)',
    border: `1px solid ${active ? 'transparent' : 'rgba(255,255,255,0.12)'}`,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(8px)', transition: 'all 0.2s ease',
  }}
    onMouseEnter={e => e.currentTarget.style.background = active ? activeColor : 'rgba(255,255,255,0.18)'}
    onMouseLeave={e => e.currentTarget.style.background = active ? activeColor : 'rgba(255,255,255,0.1)'}
  >
    {icon}
  </button>
);

// ─── IncomingCallNotification with ringtone and Initials Avatar ─────────────────
export const IncomingCallNotification = ({ callData, onAccept, onDecline }) => {
  const isVideo = callData?.call_type === 'video';
  const [dismissed, setDismissed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const isPlayingRef = useRef(true);
  const timeoutsRef = useRef([]);
  
  // FIXED: Better name extraction for incoming call
  let rawCallerName = callData?.caller_name || callData?.name || callData?.from_name;
  
  // Clean the name
  let displayName = formatDisplayName(rawCallerName);
  
  // If still no name, try to get from email
  if (!displayName && callData?.caller_email) {
    displayName = callData.caller_email.split('@')[0];
    displayName = displayName.replace(/[0-9]+$/, '');
    displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1).toLowerCase();
  }
  
  // Final fallback
  if (!displayName) {
    displayName = 'Caller';
  }

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Play ringtone when notification appears
  useEffect(() => {
    const playRingtone = async () => {
      try {
        const audioCtx = getAudioContext();
        await audioCtx.resume();
        
        const beep = (frequency, delay, duration = 0.4, volume = 0.12) => {
          const timeoutId = setTimeout(() => {
            if (!isPlayingRef.current) return;
            try {
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.type = 'sine';
              osc.frequency.value = frequency;
              gain.gain.value = volume;
              osc.start();
              gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
              setTimeout(() => {
                try { osc.stop(); } catch(e) {}
              }, duration * 1000);
            } catch(e) {}
          }, delay);
          timeoutsRef.current.push(timeoutId);
        };
        
        const playPattern = () => {
          if (!isPlayingRef.current) return;
          beep(525, 0, 0.4, 0.12);
          beep(525, 700, 0.4, 0.12);
          
          const patternTimeout = setTimeout(() => {
            if (isPlayingRef.current) playPattern();
          }, 2000);
          timeoutsRef.current.push(patternTimeout);
        };
        
        playPattern();
      } catch (e) {
        // console.log('Ringtone error:', e);
      }
    };
    
    playRingtone();
    
    return () => {
      isPlayingRef.current = false;
      timeoutsRef.current.forEach(id => clearTimeout(id));
      timeoutsRef.current = [];
      stopAllSounds();
    };
  }, []);

  const handleAccept = () => {
    isPlayingRef.current = false;
    timeoutsRef.current.forEach(id => clearTimeout(id));
    timeoutsRef.current = [];
    stopAllSounds();
    onAccept();
  };

  const handleDecline = () => {
    isPlayingRef.current = false;
    timeoutsRef.current.forEach(id => clearTimeout(id));
    timeoutsRef.current = [];
    stopAllSounds();
    onDecline();
  };

  useEffect(() => {
    const onEnded = (e) => {
      if (!e.detail?.call_id || e.detail.call_id === callData?.call_id) {
        setDismissed(true);
        isPlayingRef.current = false;
        timeoutsRef.current.forEach(id => clearTimeout(id));
        timeoutsRef.current = [];
        stopAllSounds();
      }
    };
    window.addEventListener('call-ended', onEnded);
    return () => window.removeEventListener('call-ended', onEnded);
  }, [callData?.call_id]);

  // Don't render if dismissed
  if (dismissed) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}>
      <div style={{
        width: '100%', maxWidth: isMobile ? '320px' : '360px', 
        borderRadius: isMobile ? '24px' : '28px', overflow: 'hidden',
        background: 'linear-gradient(160deg, #12072a 0%, #1e0d3c 60%, #0d1226 100%)',
        border: '1px solid rgba(139,92,246,0.25)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
        animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        <div className="flex flex-col items-center" style={{ padding: isMobile ? '24px 20px 20px' : '36px 28px 24px' }}>
          <div style={{ position: 'relative', marginBottom: isMobile ? '16px' : '20px' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                position: 'absolute', inset: isMobile ? `-${(i+1)*8}px` : `-${(i+1)*12}px`, 
                borderRadius: '50%', border: '1px solid rgba(139,92,246,0.25)',
                animation: 'ripple 2s ease-out infinite', animationDelay: `${i*0.5}s`,
              }} />
            ))}
            <InitialsAvatar name={displayName} size="large" />
          </div>

          <p style={{ color: 'rgba(196,181,253,0.7)', fontSize: isMobile ? '10px' : '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>
            Incoming {isVideo ? 'Video' : 'Audio'} Call
          </p>
          <h2 style={{ color: 'rgba(255,255,255,0.95)', fontSize: isMobile ? '18px' : '22px', fontWeight: 700, textAlign: 'center', marginBottom: '2px' }}>
            {displayName}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '10px', height: isMobile ? '14px' : '18px' }}>
            {[0.4,0.7,1,0.6,0.9,0.5,0.8,0.4,0.7,1,0.5,0.9].map((h, i) => (
              <div key={i} style={{ width: isMobile ? '2px' : '3px', height: `${h * (isMobile ? 12 : 18)}px`, borderRadius: '2px',
                background: `rgba(167,139,250,${h*0.7})`,
                animation: 'wave 0.8s ease-in-out infinite', animationDelay: `${i*0.07}s` }} />
            ))}
          </div>
          <p style={{ color: 'rgba(167,139,250,0.6)', fontSize: '10px', marginTop: '8px' }}>Ringing...</p>
        </div>

        <div style={{ display: 'flex', borderTop: '1px solid rgba(139,92,246,0.15)' }}>
          <button onClick={handleDecline} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isMobile ? '6px' : '8px',
            padding: isMobile ? '14px 12px' : '20px 16px', background: 'transparent', border: 'none', cursor: 'pointer',
            borderRight: '1px solid rgba(139,92,246,0.15)',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ width: isMobile ? '48px' : '56px', height: isMobile ? '48px' : '56px', borderRadius: '50%', background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width={isMobile ? "22" : "26"} height={isMobile ? "22" : "26"} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" transform="rotate(135)">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <span style={{ color: '#f87171', fontSize: isMobile ? '11px' : '12px', fontWeight: 600 }}>Decline</span>
          </button>

          <button onClick={handleAccept} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isMobile ? '6px' : '8px',
            padding: isMobile ? '14px 12px' : '20px 16px', background: 'transparent', border: 'none', cursor: 'pointer',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ width: isMobile ? '48px' : '56px', height: isMobile ? '48px' : '56px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width={isMobile ? "22" : "26"} height={isMobile ? "22" : "26"} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" transform="rotate(-45)">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <span style={{ color: '#86efac', fontSize: isMobile ? '11px' : '12px', fontWeight: 500 }}>Accept</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(24px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes ripple { 0%{opacity:.6;transform:scale(1)} 100%{opacity:0;transform:scale(1.4)} }
        @keyframes wave { 0%,100%{transform:scaleY(.5)} 50%{transform:scaleY(1)} }
      `}</style>
    </div>
  );
};
