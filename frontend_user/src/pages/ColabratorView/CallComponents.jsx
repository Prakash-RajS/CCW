// // src/components/collaboratorview/CallComponents.jsx
// import React, { useState, useEffect, useRef } from 'react';
// import { LiveKitRoom, VideoConference, RoomAudioRenderer } from '@livekit/components-react';
// import '@livekit/components-styles';
// import api from "../../utils/axiosConfig";

// export const CallButton = ({ otherUserId, callType, onCallInitiated, currentUserId, disabled }) => {
//   const [isInitiating, setIsInitiating] = useState(false);
//   const [error, setError] = useState(null);

//   const initiateCall = async () => {
//     if (isInitiating || disabled) return;

//     setIsInitiating(true);
//     setError(null);
    
//     try {
//       console.log(`📞 Initiating ${callType} call to user ${otherUserId}`);
      
//       const response = await api.post('/message/call/initiate', {
//         caller_id: currentUserId,
//         receiver_id: otherUserId,
//         call_type: callType
//       });

//       console.log('✅ Call initiated response:', response.data);

//       if (response.data.status === 'success') {
//         onCallInitiated(response.data);
//       } else {
//         throw new Error('Failed to initiate call: Invalid response');
//       }
//     } catch (error) {
//       console.error('❌ Failed to initiate call:', error);
      
//       let errorMessage = 'Failed to start call. Please try again.';
      
//       if (error.response) {
//         console.error('Error response data:', error.response.data);
//         console.error('Error response status:', error.response.status);
        
//         if (error.response.data && error.response.data.detail) {
//           errorMessage = error.response.data.detail;
//         } else if (error.response.status === 500) {
//           errorMessage = 'Server error. Please check if LiveKit is configured correctly.';
//         }
//       } else if (error.request) {
//         console.error('No response received:', error.request);
//         errorMessage = 'No response from server. Please check your connection.';
//       }
      
//       setError(errorMessage);
//       alert(errorMessage);
//     } finally {
//       setIsInitiating(false);
//     }
//   };

//   return (
//     <button
//       onClick={initiateCall}
//       disabled={isInitiating || disabled}
//       className={`p-2 hover:bg-gray-100 rounded-full transition-colors relative ${
//         isInitiating || disabled ? 'opacity-50 cursor-not-allowed' : ''
//       }`}
//       title={`Start ${callType} call`}
//     >
//       {isInitiating ? (
//         <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
//       ) : callType === 'video' ? (
//         <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//           <path d="M23 7l-7 5 7 5V7z" />
//           <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
//         </svg>
//       ) : (
//         <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//           <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8 10a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
//         </svg>
//       )}
//     </button>
//   );
// };

// export const CallWindow = ({ callData, onClose, currentUserId }) => {
//   const [isJoining, setIsJoining] = useState(true);
//   const [error, setError] = useState(null);
//   const [token, setToken] = useState(null);
//   const [livekitUrl, setLivekitUrl] = useState(null);
//   const [roomName, setRoomName] = useState(null);

//   useEffect(() => {
//     const joinCall = async () => {
//       try {
//         console.log('🎥 Joining LiveKit Cloud call with data:', callData);
        
//         // Get token for joining
//         const response = await api.post(`/message/call/${callData.call_id}/join`, {
//           user_id: currentUserId,
//           call_id: callData.call_id
//         });

//         console.log('✅ Join response:', response.data);

//         setToken(response.data.token);
//         setLivekitUrl(response.data.livekit_url);
//         setRoomName(response.data.room_name);
//         setIsJoining(false);

//       } catch (error) {
//         console.error('❌ Failed to join call:', error);
//         let errorMessage = 'Failed to join call. Please try again.';
        
//         if (error.response) {
//           console.error('Error response:', error.response.data);
//           if (error.response.data && error.response.data.detail) {
//             errorMessage = error.response.data.detail;
//           }
//         } else if (error.request) {
//           errorMessage = 'No response from server. Please check your connection.';
//         }
        
//         setError(errorMessage);
//         setIsJoining(false);
//       }
//     };

//     if (callData) {
//       joinCall();
//     }
//   }, [callData, currentUserId]);

//   const handleEndCall = async () => {
//     try {
//       console.log('🔚 Ending call:', callData?.call_id);
//       if (callData?.call_id) {
//         await api.post(`/message/call/${callData.call_id}/end?user_id=${currentUserId}`);
//       }
//     } catch (error) {
//       console.error('Failed to end call properly:', error);
//     } finally {
//       onClose();
//     }
//   };

//   // If we have a token and LiveKit URL, render the LiveKit room
//   if (token && livekitUrl && roomName) {
//     return (
//       <>
//         {/* Overlay */}
//         <div 
//           className="fixed inset-0 bg-black/70 z-[999]"
//         />

//         {/* Call container */}
//         <div className="fixed inset-0 z-[1000] flex items-center justify-center">
//           <div className="relative w-[95%] h-[95%] max-w-[1400px] bg-black rounded-xl overflow-hidden shadow-2xl">
//             <LiveKitRoom
//   serverUrl={livekitUrl}
//   token={token}
//   connect={true}
//   audio={true}
//   video={true}
//   onDisconnected={() => console.log("Disconnected")}
//   className="w-full h-full"
//   connectOptions={{
//     autoSubscribe: true,
//   }}
//   data-lk-theme="default"
// >
//   <VideoConference />
//   <RoomAudioRenderer />
// </LiveKitRoom>

//             {/* Close button (top right) */}
//             <button
//               onClick={handleEndCall}
//               className="absolute top-4 right-4 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition-colors z-20 shadow-lg"
//               title="End call"
//             >
//               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <path d="M18 6L6 18M6 6l12 12" />
//               </svg>
//             </button>

//             {/* Info badge */}
//             <div className="absolute bottom-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
//               LiveKit Cloud
//             </div>
//           </div>
//         </div>
//       </>
//     );
//   }

//   // Loading or error state
//   return (
//     <>
//       <div 
//         className="fixed inset-0 bg-black/70 z-[999]"
//         onClick={onClose}
//       />

//       <div className="fixed inset-0 z-[1000] flex items-center justify-center">
//         <div className="relative w-[95%] h-[95%] max-w-[1400px] bg-black rounded-xl overflow-hidden shadow-2xl">
//           <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
//             <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md">
//               {error ? (
//                 <>
//                   <div className="text-red-600 text-xl mb-4">⚠️</div>
//                   <p className="text-gray-800 mb-4">{error}</p>
//                   <p className="text-sm text-gray-500 mb-4">
//                     {error.includes('LiveKit') ? 
//                       'Please check your LiveKit Cloud configuration.' : 
//                       'Please try again or contact support.'}
//                   </p>
//                   <button
//                     onClick={onClose}
//                     className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
//                   >
//                     Close
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
//                   <p className="text-gray-600">Connecting to LiveKit Cloud...</p>
//                   <p className="text-sm text-gray-400 mt-2">Please allow camera and microphone access</p>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export const IncomingCallNotification = ({ callData, onAccept, onDecline }) => {
//   const [isRinging, setIsRinging] = useState(true);
//   const audioContextRef = useRef(null);
//   const oscillatorRef = useRef(null);

//   useEffect(() => {
//     // Play ringtone using Web Audio API
//     const playRingtone = async () => {
//       try {
//         const AudioContextClass = window.AudioContext || window.webkitAudioContext;
//         audioContextRef.current = new AudioContextClass();
        
//         // Resume audio context (required by browser policies)
//         await audioContextRef.current.resume();
        
//         const oscillator = audioContextRef.current.createOscillator();
//         const gainNode = audioContextRef.current.createGain();
        
//         oscillator.connect(gainNode);
//         gainNode.connect(audioContextRef.current.destination);
        
//         oscillator.frequency.value = 440; // A4 note
//         gainNode.gain.value = 0.3;
        
//         oscillator.start();
//         oscillatorRef.current = oscillator;
        
//         // Create a repeating pattern
//         const interval = setInterval(() => {
//           if (!isRinging) {
//             clearInterval(interval);
//             return;
//           }
//           if (gainNode.gain.value === 0.3) {
//             gainNode.gain.value = 0;
//           } else {
//             gainNode.gain.value = 0.3;
//           }
//         }, 500);
        
//         return () => {
//           clearInterval(interval);
//           if (oscillatorRef.current) {
//             oscillatorRef.current.stop();
//           }
//           if (audioContextRef.current) {
//             audioContextRef.current.close();
//           }
//         };
//       } catch (e) {
//         console.log('Audio play failed:', e);
//       }
//     };
    
//     const cleanup = playRingtone();
    
//     return () => {
//       setIsRinging(false);
//       if (cleanup) {
//         cleanup.then(cleanupFn => cleanupFn && cleanupFn());
//       }
//       if (oscillatorRef.current) {
//         oscillatorRef.current.stop();
//       }
//       if (audioContextRef.current) {
//         audioContextRef.current.close();
//       }
//     };
//   }, [isRinging]);

//   return (
//     <div className="fixed top-4 right-4 bg-white rounded-lg shadow-2xl p-6 z-50 animate-slide-down w-80">
//       <div className="flex items-center gap-4 mb-4">
//         <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center animate-pulse">
//           {callData.call_type === 'video' ? (
//             <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
//             </svg>
//           ) : (
//             <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
//             </svg>
//           )}
//         </div>
//         <div>
//           <h3 className="font-semibold text-lg">Incoming {callData.call_type} call</h3>
//           <p className="text-sm text-gray-600">{callData.caller_name}</p>
//         </div>
//       </div>

//       <div className="flex gap-3">
//         <button
//           onClick={onAccept}
//           className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
//         >
//           Accept
//         </button>
//         <button
//           onClick={onDecline}
//           className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
//         >
//           Decline
//         </button>
//       </div>
//     </div>
//   );
// };
// src/components/collaboratorview/CallComponents.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from "../../utils/axiosConfig";

// ─── CallButton ───────────────────────────────────────────────────────────────
export const CallButton = ({ otherUserId, callType, onCallInitiated, currentUserId, disabled }) => {
  const [isInitiating, setIsInitiating] = useState(false);

  const initiateCall = async () => {
    if (isInitiating || disabled) return;
    setIsInitiating(true);
    try {
      const response = await api.post('/message/call/initiate', {
        caller_id: currentUserId,
        receiver_id: otherUserId,
        call_type: callType
      });
      if (response.data.status === 'success') {
        onCallInitiated({ ...response.data, caller_id: currentUserId });
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
      className={`p-2 hover:bg-gray-100 rounded-full transition-colors ${isInitiating || disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={`Start ${callType} call`}
    >
      {isInitiating ? (
        <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      ) : callType === 'video' ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
  const wsConnectedRef     = useRef(false);       // WS open guard
  const hasJoinedRef       = useRef(false);        // sent join guard
  const iceCandidateQueue  = useRef([]);           // buffer ICE before remoteDesc
  const isCleanedUpRef     = useRef(false);
  const isEndedRef         = useRef(false);
  const callTimerRef       = useRef(null);
  const mountedRef         = useRef(true);         // StrictMode guard

  const [isJoining,    setIsJoining]    = useState(true);
  const [error,        setError]        = useState(null);
  const [isMuted,      setIsMuted]      = useState(false);
  const [isVideoOff,   setIsVideoOff]   = useState(false);
  const [callStatus,   setCallStatus]   = useState('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(false);

  // caller_id must be in callData — callers pass it, callees get it via incoming_call WS event
  const isCaller = Number(currentUserId) === Number(callData.caller_id);

  const ICE_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ]
  };

  // ── helpers ───────────────────────────────────────────────────────────────
  const sendSignal = useCallback((msg) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  // ── cleanup ───────────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    if (isCleanedUpRef.current) return;
    isCleanedUpRef.current = true;
    mountedRef.current = false;

    if (callTimerRef.current) clearInterval(callTimerRef.current);

    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;

    if (localVideoRef.current)  localVideoRef.current.srcObject  = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    if (pcRef.current) {
      pcRef.current.ontrack = null;
      pcRef.current.onicecandidate = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.oniceconnectionstatechange = null;
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
  }, []);

  // ── end call ─────────────────────────────────────────────────────────────
  const handleEndCall = useCallback(async () => {
    if (isEndedRef.current) return;
    isEndedRef.current = true;
    if (mountedRef.current) setCallStatus('ended');
    try {
      await api.post(`/message/call/${callData.call_id}/end?user_id=${currentUserId}`);
    } catch (e) {
      console.warn('end-call API:', e);
    } finally {
      cleanup();
      setTimeout(onClose, 400);
    }
  }, [callData.call_id, currentUserId, cleanup, onClose]);

  // ── timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isCallActive) return;
    callTimerRef.current = setInterval(() => {
      if (mountedRef.current) setCallDuration(s => s + 1);
    }, 1000);
    return () => clearInterval(callTimerRef.current);
  }, [isCallActive]);

  // ── drain ICE candidate queue ─────────────────────────────────────────────
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

  // ── create offer (caller only) ────────────────────────────────────────────
  const createOffer = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;
    try {
      console.log('📤 Creating offer...');
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: callData.call_type === 'video',
      });
      await pc.setLocalDescription(offer);
      sendSignal({ type: 'offer', offer: pc.localDescription, call_id: callData.call_id, from: Number(currentUserId) });
      console.log('📤 Offer sent');
    } catch (e) {
      console.error('createOffer failed:', e);
    }
  }, [callData, currentUserId, sendSignal]);

  // ── handle offer (callee only) ────────────────────────────────────────────
  const handleOffer = useCallback(async (offer) => {
    const pc = pcRef.current;
    if (!pc) return;
    try {
      console.log('📥 Handling offer...');
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      await drainIceCandidateQueue();
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendSignal({ type: 'answer', answer: pc.localDescription, call_id: callData.call_id, from: Number(currentUserId) });
      console.log('📤 Answer sent');
    } catch (e) {
      console.error('handleOffer failed:', e);
    }
  }, [callData, currentUserId, sendSignal, drainIceCandidateQueue]);

  // ── handle answer (caller only) ───────────────────────────────────────────
  const handleAnswer = useCallback(async (answer) => {
    const pc = pcRef.current;
    if (!pc) return;
    try {
      if (pc.signalingState !== 'have-local-offer') return;
      console.log('📥 Handling answer...');
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      await drainIceCandidateQueue();
    } catch (e) {
      console.error('handleAnswer failed:', e);
    }
  }, [drainIceCandidateQueue]);

  // ── handle ICE candidate ──────────────────────────────────────────────────
  const handleIceCandidate = useCallback(async (candidate) => {
    const pc = pcRef.current;
    if (!pc) return;
    if (pc.remoteDescription && pc.remoteDescription.type) {
      try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); }
      catch (e) { console.warn('ICE add error:', e); }
    } else {
      // Buffer until remote description is set
      iceCandidateQueue.current.push(candidate);
    }
  }, []);

  // ── setup peer connection ─────────────────────────────────────────────────
  const setupPeerConnection = useCallback((stream) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.ontrack = (e) => {
      console.log('🎥 Remote track received');
      if (remoteVideoRef.current && e.streams[0]) {
        remoteVideoRef.current.srcObject = e.streams[0];
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
      console.log('🔗 Connection state:', pc.connectionState);
      if (!mountedRef.current) return;
      if (pc.connectionState === 'connected') {
        setCallStatus('active');
        setIsCallActive(true);
      }
      if (pc.connectionState === 'failed') handleEndCall();
      if (pc.connectionState === 'disconnected') setCallStatus('disconnected');
    };

    return pc;
  }, [callData, currentUserId, sendSignal, handleEndCall]);

  // ── signaling WebSocket ───────────────────────────────────────────────────
  // KEY: only one WS ever created per mount, guarded by wsConnectedRef
  const connectSignaling = useCallback(() => {
    // StrictMode / double-mount guard
    if (wsConnectedRef.current) {
      console.log('⚠️ Signaling WS already connecting, skipping duplicate');
      return;
    }
    wsConnectedRef.current = true;

    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const wsBase  = apiBase.replace(/^http/, 'ws');
    const url     = `${wsBase}/message/call/${callData.call_id}/signal`;

    console.log('🔌 Opening signaling WS:', url);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ Signaling WS open');
      if (hasJoinedRef.current) return; // guard against re-sends
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

      console.log('📩 Signal:', msg.type, '| from:', msg.from ?? msg.user_id ?? '?');

      switch (msg.type) {
        // Server tells us another peer joined
        case 'user-joined': {
          const joinedId = Number(msg.user_id);
          // Caller creates offer when the OTHER user (callee) joins
          if (isCaller && joinedId !== Number(currentUserId)) {
            console.log('✅ Callee joined → creating offer');
            await createOffer();
          }
          // Callee does nothing here — waits for the offer
          break;
        }

        case 'offer':
          // Only callee handles offers
          if (!isCaller && msg.from !== Number(currentUserId)) {
            await handleOffer(msg.offer);
          }
          break;

        case 'answer':
          // Only caller handles answers
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
          console.log('👋 Other peer left');
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

    ws.onclose = () => {
      console.log('Signaling WS closed');
    };
  }, [callData, currentUserId, isCaller, createOffer, handleOffer, handleAnswer, handleIceCandidate, handleEndCall]);

  // ── join call ─────────────────────────────────────────────────────────────
  const joinCall = useCallback(async () => {
    try {
      setCallStatus('requesting-media');

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

      // Tell server we're in (updates call state)
      await api.post(`/message/call/${callData.call_id}/join`, {
        user_id: Number(currentUserId),
        call_id: callData.call_id,
      });

      // Set up PC first, then open signaling WS
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
      cleanup();
    }
  }, [callData, currentUserId, setupPeerConnection, connectSignaling, cleanup]);

  // ── mount/unmount ─────────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;

    joinCall();

    const onCallEnded = (e) => {
      if (!e.detail?.call_id || e.detail.call_id === callData.call_id) handleEndCall();
    };
    window.addEventListener('call-ended', onCallEnded);

    return () => {
      window.removeEventListener('call-ended', onCallEnded);
      // Don't call cleanup() here in dev — StrictMode unmounts immediately.
      // Let the WS guard prevent duplicate connections.
      // Actual cleanup happens in handleEndCall or on hard unmount.
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // empty deps — run once

  // Hard cleanup on true unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── controls ──────────────────────────────────────────────────────────────
  const toggleMute = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setIsMuted(!track.enabled); }
  };

  const toggleVideo = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setIsVideoOff(!track.enabled); }
  };

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

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="fixed inset-0 z-[999]" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }} />
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div className="relative overflow-hidden rounded-3xl shadow-2xl" style={{
          width: '100%', maxWidth: '900px', height: '90vh', maxHeight: '680px',
          background: 'linear-gradient(160deg, #0f0a1e 0%, #1a0f2e 50%, #0a0f1e 100%)',
          border: '1px solid rgba(139,92,246,0.15)',
        }}>
          {/* ambient glow */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 70%)',
          }} />

          {/* remote video */}
          <div className="absolute inset-0">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover"
              style={{ opacity: callStatus === 'active' ? 1 : 0, transition: 'opacity 0.6s ease' }} />
          </div>

          {/* waiting overlay */}
          {callStatus !== 'active' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="relative mb-8">
                <div className="absolute inset-[-16px] rounded-full animate-ping"
                  style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)', animationDuration: '2s' }} />
                <div className="w-28 h-28 rounded-full flex items-center justify-center" style={{
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(109,40,217,0.4) 100%)',
                  border: '2px solid rgba(139,92,246,0.5)',
                }}>
                  <svg className="w-14 h-14" fill="none" stroke="rgba(196,181,253,0.9)" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <p style={{ color: 'rgba(196,181,253,0.95)', fontSize: '18px', fontWeight: 600 }}>
                {callStatus === 'ended' ? 'Call Ended' : callStatus === 'failed' ? 'Connection Failed' : 'Connecting…'}
              </p>
              {['connecting','requesting-media'].includes(callStatus) && (
                <div className="mt-3 flex gap-1.5">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-400"
                      style={{ animation: 'dotBounce 1.2s ease-in-out infinite', animationDelay: `${i*0.2}s` }} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* local video PiP */}
          {callData.call_type === 'video' && (
            <div className="absolute top-5 right-5 overflow-hidden shadow-2xl z-10" style={{
              width: '180px', height: '135px', borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.15)', background: '#111',
            }}>
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover"
                style={{ display: isVideoOff ? 'none' : 'block' }} />
              {isVideoOff && (
                <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(30,10,50,0.9)' }}>
                  <svg className="w-10 h-10" fill="none" stroke="rgba(139,92,246,0.7)" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <div style={{ position: 'absolute', bottom: 6, left: 8, fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>You</div>
            </div>
          )}

          {/* loading / error overlay */}
          {(isJoining || error) && (
            <div className="absolute inset-0 flex items-center justify-center z-20"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
              <div className="text-center p-8 rounded-2xl" style={{
                background: 'rgba(15,10,30,0.95)', border: '1px solid rgba(139,92,246,0.2)', maxWidth: '360px',
              }}>
                {error ? (
                  <>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                    <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '20px', lineHeight: 1.5 }}>{error}</p>
                    <button onClick={handleEndCall} className="px-6 py-2.5 rounded-xl font-medium"
                      style={{ background: 'rgba(139,92,246,0.8)', color: 'white' }}>Close</button>
                  </>
                ) : (
                  <>
                    <div className="mx-auto mb-5 rounded-full border-4 border-t-transparent animate-spin" style={{
                      width: '52px', height: '52px',
                      borderColor: 'rgba(139,92,246,0.8) rgba(139,92,246,0.2) rgba(139,92,246,0.2) rgba(139,92,246,0.2)',
                    }} />
                    <p style={{ color: 'rgba(196,181,253,0.9)', fontWeight: 500 }}>Connecting…</p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '8px' }}>Allow camera &amp; microphone access</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* top status bar */}
          <div className="absolute top-5 left-5 z-20 flex items-center gap-3">
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)',
              borderRadius: '999px', padding: '6px 14px', border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', background: statusColor,
                boxShadow: `0 0 8px ${statusColor}`,
                animation: callStatus === 'active' ? 'none' : 'pulse 1.5s ease-in-out infinite',
              }} />
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontFamily: 'monospace', letterSpacing: '0.03em' }}>
                {statusLabel}
              </span>
            </div>
            <div style={{
              background: 'rgba(139,92,246,0.25)', backdropFilter: 'blur(8px)',
              borderRadius: '999px', padding: '5px 12px', border: '1px solid rgba(139,92,246,0.3)',
            }}>
              <span style={{ color: 'rgba(196,181,253,0.9)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {callData.call_type === 'video' ? '📹 Video' : '🎙️ Audio'}
              </span>
            </div>
          </div>

          {/* bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 z-20" style={{
            padding: '32px 32px 28px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)',
          }}>
            <div className="flex items-center justify-center gap-4">
              <ControlBtn active={isMuted} onClick={toggleMute} label={isMuted ? 'Unmute' : 'Mute'} activeColor="#ef4444"
                icon={isMuted
                  ? <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                  : <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                }
              />

              {callData.call_type === 'video' && (
                <ControlBtn active={isVideoOff} onClick={toggleVideo} label={isVideoOff ? 'Camera on' : 'Camera off'} activeColor="#ef4444"
                  icon={isVideoOff
                    ? <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" /></svg>
                    : <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  }
                />
              )}

              {/* End call */}
              <button onClick={handleEndCall} title="End call" style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 24px rgba(220,38,38,0.45)', transition: 'transform 0.2s ease',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.12-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
                  <line x1="1" y1="1" x2="23" y2="23" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </button>

              <ControlBtn active={false} onClick={() => {}} label="Speaker"
                icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536a5 5 0 000 7.072" /></svg>}
              />

              <ControlBtn active={false}
                onClick={() => !document.fullscreenElement ? document.documentElement.requestFullscreen?.() : document.exitFullscreen?.()}
                label="Fullscreen"
                icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dotBounce { 0%,80%,100%{transform:translateY(0);opacity:.6} 40%{transform:translateY(-6px);opacity:1} }
      `}</style>
    </>
  );
};

const ControlBtn = ({ icon, onClick, label, active = false, activeColor = '#374151' }) => (
  <button onClick={onClick} title={label} style={{
    width: '52px', height: '52px', borderRadius: '50%',
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

// ─── IncomingCallNotification ─────────────────────────────────────────────────
export const IncomingCallNotification = ({ callData, onAccept, onDecline }) => {
  const isVideo = callData?.call_type === 'video';
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onEnded = (e) => {
      if (!e.detail?.call_id || e.detail.call_id === callData?.call_id) {
        setDismissed(true);
        onDecline?.();
      }
    };
    window.addEventListener('call-ended', onEnded);
    return () => window.removeEventListener('call-ended', onEnded);
  }, [callData?.call_id, onDecline]);

  if (dismissed) return null;

  return (
    <>
      <div className="fixed inset-0 z-[9998]" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }} />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ pointerEvents: 'none' }}>
        <div style={{
          pointerEvents: 'auto', width: '100%', maxWidth: '360px', borderRadius: '28px', overflow: 'hidden',
          background: 'linear-gradient(160deg, #12072a 0%, #1e0d3c 60%, #0d1226 100%)',
          border: '1px solid rgba(139,92,246,0.25)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
          animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
        }}>
          <div className="flex flex-col items-center" style={{ padding: '36px 28px 24px' }}>
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  position: 'absolute', inset: `-${(i+1)*12}px`, borderRadius: '50%',
                  border: '1px solid rgba(139,92,246,0.25)',
                  animation: 'ripple 2s ease-out infinite', animationDelay: `${i*0.5}s`,
                }} />
              ))}
              <div style={{
                width: '96px', height: '96px', borderRadius: '50%', position: 'relative', zIndex: 1,
                background: 'linear-gradient(135deg, rgba(139,92,246,0.4) 0%, rgba(109,40,217,0.6) 100%)',
                border: '2px solid rgba(139,92,246,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="48" height="48" fill="none" stroke="rgba(216,180,254,0.9)" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>

            <p style={{ color: 'rgba(196,181,253,0.7)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>
              Incoming {isVideo ? 'Video' : 'Audio'} Call
            </p>
            <h2 style={{ color: 'rgba(255,255,255,0.95)', fontSize: '22px', fontWeight: 700, textAlign: 'center', marginBottom: '4px' }}>
              {callData?.caller_name?.split('@')[0] || 'Unknown Caller'}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '12px', height: '18px' }}>
              {[0.4,0.7,1,0.6,0.9,0.5,0.8,0.4,0.7,1,0.5,0.9].map((h, i) => (
                <div key={i} style={{ width: '3px', height: `${h*18}px`, borderRadius: '2px',
                  background: `rgba(167,139,250,${h*0.7})`,
                  animation: 'wave 0.8s ease-in-out infinite', animationDelay: `${i*0.07}s` }} />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', borderTop: '1px solid rgba(139,92,246,0.15)' }}>
            {/* Decline */}
            <button onClick={onDecline} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
              padding: '20px 16px', background: 'transparent', border: 'none', cursor: 'pointer',
              borderRight: '1px solid rgba(139,92,246,0.15)', transition: 'background 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg,#dc2626,#b91c1c)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" fill="currentColor" style={{ color: 'white' }} viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  <line x1="1" y1="1" x2="23" y2="23" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span style={{ color: 'rgba(252,165,165,0.85)', fontSize: '12px', fontWeight: 600 }}>Decline</span>
            </button>

            {/* Accept */}
            <button onClick={onAccept} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
              padding: '20px 16px', background: 'transparent', border: 'none', cursor: 'pointer',
              transition: 'background 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg,#16a34a,#15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isVideo
                  ? <svg width="22" height="22" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                  : <svg width="22" height="22" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                }
              </div>
              <span style={{ color: 'rgba(134,239,172,0.85)', fontSize: '12px', fontWeight: 600 }}>Accept</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(24px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes ripple { 0%{opacity:.6;transform:scale(1)} 100%{opacity:0;transform:scale(1.4)} }
        @keyframes wave { 0%,100%{transform:scaleY(.5)} 50%{transform:scaleY(1)} }
      `}</style>
    </>
  );
};