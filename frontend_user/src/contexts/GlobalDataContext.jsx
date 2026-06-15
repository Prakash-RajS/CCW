// contexts/GlobalDataContext.jsx (create this)
import React, { createContext, useContext, useEffect, useState } from 'react';

const GlobalDataContext = createContext();

export const useGlobalData = () => useContext(GlobalDataContext);

export const GlobalDataProvider = ({ children }) => {
  const [contracts, setContracts] = useState([]);
  const [messages, setMessages] = useState([]);
  
  // WebSocket connection lives here, NOT in App.jsx
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'contractUpdated') {
        // Auto-update contracts globally
        setContracts(prev => 
          prev.map(c => c.id === data.contractId ? {...c, ...data} : c)
        );
      }
      
      if (data.type === 'newMessage') {
        setMessages(prev => [data, ...prev]);
      }
    };
    
    return () => ws.close();
  }, []);
  
  return (
    <GlobalDataContext.Provider value={{ contracts, messages, setContracts, setMessages }}>
      {children}
    </GlobalDataContext.Provider>
  );
};