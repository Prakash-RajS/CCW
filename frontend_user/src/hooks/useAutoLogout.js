// hooks/useAutoLogout.js
import { useEffect, useRef, useCallback, useState } from 'react'; // ✅ Added useState
import { useUser } from '../contexts/UserContext';

// For testing - auto logout in 1 minute, warning in 30 seconds
const AUTO_LOGOUT_TIME = 60 * 1000; // 1 minute (testing)
const WARNING_TIME = 30 * 1000; // 30 seconds (testing)

export const useAutoLogout = (enabled = true) => {
  const { logout, isAuthenticated, isLoggingOut } = useUser();
  const timerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null); // ✅ Added this ref
  const lastActivityRef = useRef(Date.now());
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  // Reset timers
  const resetTimers = useCallback(() => {
    if (!enabled || !isAuthenticated || isLoggingOut) return;

    // Clear existing timers
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    setShowWarning(false);
    lastActivityRef.current = Date.now();

    // Set warning timer (1 minute before logout)
    if (AUTO_LOGOUT_TIME > WARNING_TIME) {
      warningTimerRef.current = setTimeout(() => {
        setShowWarning(true);
        let remaining = Math.floor(WARNING_TIME / 1000);
        setTimeLeft(remaining);

        // Update time left every second
        countdownIntervalRef.current = setInterval(() => {
          remaining -= 1;
          setTimeLeft(remaining);
          if (remaining <= 0) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
        }, 1000);
      }, AUTO_LOGOUT_TIME - WARNING_TIME);
    }

    // Set logout timer
    timerRef.current = setTimeout(() => {
      if (!isLoggingOut) {
        console.log('⏰ Auto-logout triggered due to inactivity');
        logout();
      }
    }, AUTO_LOGOUT_TIME);
  }, [enabled, isAuthenticated, isLoggingOut, logout]);

  // Track user activity
  const handleActivity = useCallback(() => {
    if (!enabled || !isAuthenticated || isLoggingOut) return;
    
    const now = Date.now();
    // Only reset if there was significant activity (avoid unnecessary resets)
    if (now - lastActivityRef.current > 1000) {
      resetTimers();
    }
  }, [enabled, isAuthenticated, isLoggingOut, resetTimers]);

  // Setup activity listeners
  useEffect(() => {
    if (!enabled || !isAuthenticated || isLoggingOut) {
      // Clean up timers when disabled
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
        warningTimerRef.current = null;
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setShowWarning(false);
      return;
    }

    const events = [
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'click',
      'mousemove',
      'wheel',
      'touchmove',
    ];

    // Throttled handler to prevent excessive resets
    let throttledHandle = null;
    const throttledActivity = () => {
      if (throttledHandle) return;
      throttledHandle = setTimeout(() => {
        handleActivity();
        throttledHandle = null;
      }, 2000); // Throttle to max once every 2 seconds
    };

    // Initial timer setup
    resetTimers();

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, throttledActivity);
    });

    // Handle visibility change (tab switching)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab hidden - store last activity time
        lastActivityRef.current = Date.now();
      } else {
        // Tab visible again - check if we need to reset timers
        const timeAway = Date.now() - lastActivityRef.current;
        if (timeAway > AUTO_LOGOUT_TIME) {
          // User was away too long, auto-logout
          console.log('⏰ Auto-logout due to tab being hidden too long');
          logout();
        } else {
          // Reset timers on return
          resetTimers();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      // Cleanup
      events.forEach(event => {
        document.removeEventListener(event, throttledActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
        warningTimerRef.current = null;
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      if (throttledHandle) {
        clearTimeout(throttledHandle);
      }
    };
  }, [enabled, isAuthenticated, isLoggingOut, handleActivity, resetTimers, logout]);

  // Reset on route changes
  useEffect(() => {
    if (enabled && isAuthenticated && !isLoggingOut) {
      resetTimers();
    }
  }, [window.location.pathname, enabled, isAuthenticated, isLoggingOut, resetTimers]);

  return {
    showWarning,
    timeLeft,
    resetTimers,
    extendSession: () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setShowWarning(false);
      resetTimers();
    }
  };
};