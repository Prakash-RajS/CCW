// src/component/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // console.log(`Route changed to: ${pathname}`);
    
    const forceScrollToTop = () => {
      // Method 1: Target the main content in Dashboard (most specific)
      const dashboardMain = document.querySelector('main.flex-1.overflow-y-auto');
      if (dashboardMain) {
        dashboardMain.scrollTop = 0;
        // console.log("Scrolled dashboard main to top");
      }
      
      // Method 2: Target any element with these exact classes
      const possibleElements = [
        ...document.querySelectorAll('.overflow-y-auto'),
        ...document.querySelectorAll('[class*="overflow-y-auto"]'),
        ...document.querySelectorAll('.app-main-content'),
        document.querySelector('main'),
        document.documentElement,
        document.body
      ];
      
      possibleElements.forEach(el => {
        if (el && el.scrollTop > 0) {
          el.scrollTop = 0;
          // console.log("Scrolled element:", el.className);
        }
      });
      
      // Method 3: Force window scroll
      window.scrollTo(0, 0);
    };

    // Execute multiple times to catch content after rendering
    forceScrollToTop(); // Immediate
    
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