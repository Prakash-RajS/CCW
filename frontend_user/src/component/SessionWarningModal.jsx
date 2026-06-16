// component/SessionWarningModal.jsx
import React, { useEffect, useRef } from 'react';
import { useAutoLogout } from '../hooks/useAutoLogout';

export const SessionWarningModal = () => {
  const { showWarning, timeLeft, extendSession } = useAutoLogout();
  const modalRef = useRef(null);

  // Handle escape key to extend session
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showWarning) {
        extendSession();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showWarning, extendSession]);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (showWarning) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showWarning]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={extendSession}
      />
      
      {/* Modal - Fully responsive */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-[90%] sm:max-w-[400px] md:max-w-[440px] lg:max-w-[480px] 
                   mx-auto bg-gradient-to-b from-[#3D1768] to-[#1a0a2e] 
                   rounded-2xl sm:rounded-3xl 
                   p-5 sm:p-6 md:p-8 lg:p-10 
                   shadow-2xl border border-purple-500/30
                   animate-[fadeIn_0.3s_ease-out]"
      >
        {/* Warning icon - responsive sizing */}
        <div className="flex justify-center mb-3 sm:mb-4 md:mb-5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 
                          rounded-full bg-yellow-500/20 
                          flex items-center justify-center
                          transition-all duration-300 hover:scale-110">
            <svg 
              className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-yellow-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
        </div>

        {/* Title - responsive text */}
        <h2 className="text-white text-xl sm:text-2xl md:text-3xl 
                       font-bold text-center mb-2 
                       font-['Poppins'] tracking-tight">
          Session Expiring Soon
        </h2>
        
        {/* Message - responsive text */}
        <p className="text-white/80 text-center mb-5 sm:mb-6 md:mb-7 
                      text-sm sm:text-base md:text-lg 
                      font-['Jost'] leading-relaxed">
          Your session will expire in 
          <span className="text-yellow-400 font-bold mx-1 
                          text-base sm:text-lg md:text-xl">
            {timeLeft}
          </span>
          seconds due to inactivity.
        </p>

        {/* Single Button - Full width and responsive */}
        <button
          onClick={extendSession}
          className="w-full px-4 sm:px-6 py-3 sm:py-3.5 md:py-4 
                     bg-gradient-to-r from-purple-600 to-purple-800 
                     hover:from-purple-700 hover:to-purple-900 
                     text-white text-sm sm:text-base md:text-lg 
                     rounded-xl sm:rounded-2xl 
                     font-semibold font-['Poppins']
                     transition-all duration-300 
                     shadow-lg hover:shadow-purple-500/30 
                     hover:scale-[1.02] active:scale-[0.98]
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#1a0a2e]"
        >
          Stay Logged In
        </button>

        {/* Helper text - responsive */}
        <p className="text-white/40 text-center mt-3 sm:mt-4 
                      text-[10px] sm:text-xs md:text-sm 
                      font-['Jost']">
          Click anywhere on the backdrop or press ESC to stay logged in
        </p>

        {/* Countdown visual indicator - responsive */}
        <div className="mt-4 sm:mt-5 md:mt-6 w-full bg-white/10 rounded-full h-1.5 sm:h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 
                       rounded-full transition-all duration-1000 ease-linear"
            style={{ 
              width: `${(timeLeft / 30) * 100}%`,
              transition: 'width 1s linear'
            }}
          />
        </div>
      </div>

      {/* Add animation keyframes */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .animate-pulse-slow {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};