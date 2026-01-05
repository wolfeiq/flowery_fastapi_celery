
import { useEffect, useRef } from "react";
import toast from 'react-hot-toast';

export function useWebSocket(userId?: string) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!userId) {
      return;
    }

    
    try {
      wsRef.current = new WebSocket(`ws://localhost:8000/ws/${userId}`);

      wsRef.current.onmessage = (event) => {
        
        try {
          const data = JSON.parse(event.data);
    
          if (data.event === 'memory_processed') {
            toast.success('Memory processed!');
          } else {
            console.log('Unknown event type:', data.event);
          }
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      wsRef.current.onclose = (event) => {
        console.log("WebSocket disconnected. Code:", event.code, "Reason:", event.reason);
      };
    } catch (error) {
      console.error("Error creating WebSocket:", error);
    }

    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [userId]);

  return wsRef;
}