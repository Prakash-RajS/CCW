// src/component/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const forceScrollToTop = () => {
      // Method 1: Target the main content in Dashboard (most specific)
      const dashboardMain = document.querySelector('main.flex-1.overflow-y-auto');
      if (dashboardMain) {
        dashboardMain.scrollTop = 0;
        return; // Exit early if found
      }
      
      // Method 2: Target any element with overflow-y-auto class
      const overflowElements = document.querySelectorAll('.overflow-y-auto, [class*="overflow-y-auto"], .app-main-content');
      let scrolled = false;
      
      overflowElements.forEach(el => {
        if (el && el.scrollTop > 0) {
          el.scrollTop = 0;
          scrolled = true;
        }
      });
      
      // Method 3: Target main element
      if (!scrolled) {
        const mainElement = document.querySelector('main');
        if (mainElement && mainElement.scrollTop > 0) {
          mainElement.scrollTop = 0;
          scrolled = true;
        }
      }
      
      // Method 4: Force window scroll as fallback
      if (!scrolled) {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    };

    // Execute multiple times to catch content after rendering
    forceScrollToTop();
    
    const timeouts = [
      setTimeout(forceScrollToTop, 0),
      setTimeout(forceScrollToTop, 50),
      setTimeout(forceScrollToTop, 100),
      setTimeout(forceScrollToTop, 200),
      setTimeout(forceScrollToTop, 500)
    ];

    return () => timeouts.forEach(clearTimeout);
  }, [pathname]);

  return null;
};

export default ScrollToTop;