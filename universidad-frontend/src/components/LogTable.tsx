import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import LogsViewer from "./LogsViewer";

interface LogTableProps {
  limit?: number;
  refreshInterval?: number;
}

const LogTable: React.FC<LogTableProps> = ({ 
  limit = 100,
  refreshInterval = 3000 
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
        `http://localhost:4000/logs/latest`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data && response.data.length > 0) {
        // If new logs exist, update lastChecked and trigger re-render
        if (response.data[0].date > lastChecked) {
          setLastChecked(Date.now());
          setUpdateTrigger(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error("Error checking for log updates:", error);
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
      type="regular" 
      limit={limit} 
      refreshInterval={refreshInterval}
      key={`regular-${updateTrigger}`} // Force re-render when updateTrigger changes
    />
  );
};

export default LogTable;
