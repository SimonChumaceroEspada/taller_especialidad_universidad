import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import LogsViewer from "./LogsViewer";

interface EncryptedLogTableProps {
  limit?: number;
  refreshInterval?: number;
}

const EncryptedLogTable: React.FC<EncryptedLogTableProps> = ({ 
  limit = 100,
  refreshInterval = 5000 
}) => {
  const [lastChecked, setLastChecked] = useState<number>(Date.now());
  const [updateTrigger, setUpdateTrigger] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Function to check for updates and trigger re-render if necessary
  const checkForUpdates = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      
      const response = await axios.get(
        `http://localhost:4000/encrypted-logs/hex`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { limit: 1 } // Just get the latest record to check
        }
      );
      
      if (response.data && response.data.length > 0) {
        // For encrypted logs, we'll use a timestamp-based approach
        const currentTime = Date.now();
        if (currentTime - lastChecked >= refreshInterval) {
          setLastChecked(currentTime);
          setUpdateTrigger(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error("Error checking for encrypted log updates:", error);
    }
  };
  
  // Setup polling interval
  useEffect(() => {
    // Initial check
    checkForUpdates();
    
    // Set up regular polling
    timerRef.current = setInterval(checkForUpdates, refreshInterval);
    
    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [refreshInterval]);
  
  return (
    <LogsViewer 
      type="encrypted" 
      limit={limit} 
      refreshInterval={refreshInterval}
      key={`encrypted-${updateTrigger}`} // Force re-render when updateTrigger changes
    />
  );
};

export default EncryptedLogTable;
