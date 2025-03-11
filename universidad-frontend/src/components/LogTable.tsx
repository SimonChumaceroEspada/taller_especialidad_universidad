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
  const [lastId, setLastId] = useState<number>(0);
  const [updateTrigger, setUpdateTrigger] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Function to check for updates and trigger re-render if necessary
  const checkForUpdates = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      
      // First get the latest log ID to compare with our lastId
      const response = await axios.get(
        `http://localhost:4000/logs/latest?limit=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data && response.data.length > 0) {
        const latestLog = response.data[0];
        // If we found a newer log with a higher ID
        if (lastId === 0 || latestLog.id > lastId) {
          console.log(`Found new logs! Last known ID: ${lastId}, Latest ID: ${latestLog.id}`);
          setLastId(latestLog.id);
          setUpdateTrigger(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error("Error checking for log updates:", error);
    }
  };
  
  // Initialize lastId on first render
  useEffect(() => {
    const getInitialId = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;
        
        const response = await axios.get(
          `http://localhost:4000/logs?limit=1`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (response.data && response.data.length > 0) {
          setLastId(response.data[0].id);
        }
      } catch (error) {
        console.error("Error getting initial log ID:", error);
      }
    };
    
    getInitialId();
  }, []);
  
  // Setup polling interval
  useEffect(() => {
    // Set up regular polling
    timerRef.current = setInterval(checkForUpdates, refreshInterval);
    
    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [refreshInterval, lastId]);
  
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
