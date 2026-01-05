
import { useEffect, useRef } from "react";
import toast from 'react-hot-toast';

export function useWebSocket(userId?: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const isCleaningUpRef = useRef(false);

  useEffect(() => {
    if (!userId) {
      console.log('⏸️ No userId yet, waiting...');
      return;
    }

    isCleaningUpRef.current = false;

    const connect = () => {
      // Don't connect if we're in the middle of cleanup
      if (isCleaningUpRef.current) {
        console.log('🛑 Cleanup in progress, skipping connection');
        return;
      }

      // Clean up existing connection if any
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      console.log('🔌 Connecting WebSocket for user:', userId);
      
      try {
        const ws = new WebSocket(`ws://localhost:8000/ws/${userId}`);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('✅ WebSocket CONNECTED successfully!');
          console.log('👤 Connected as user:', userId);
        };

        ws.onmessage = (event) => {
          console.log('📨 RAW MESSAGE RECEIVED:', event.data);
          try {
            const data = JSON.parse(event.data);
            console.log('📦 PARSED MESSAGE:', data);
      
            if (data.event === 'memory_processed') {
              console.log('🎉 MEMORY PROCESSED! Memory ID:', data.memory_id);
              toast.success('Memory processed!');
            } else {
              console.log('📬 Received event:', data.event);
            }
          } catch (err) {
            console.error('❌ Error parsing message:', err);
          }
        };

        ws.onerror = (error) => {
          // Only log error if we're not cleaning up (to avoid spam in dev mode)
          if (!isCleaningUpRef.current) {
            console.error("❌ WebSocket error:", error);
          }
        };

        ws.onclose = (event) => {
          // Only log and attempt reconnect if we didn't manually close
          if (!isCleaningUpRef.current) {
            console.log("🔌 WebSocket disconnected. Code:", event.code);
            
            // Attempt to reconnect after 3 seconds (unless it was a normal closure)
            if (event.code !== 1000 && event.code !== 1001) {
              console.log('🔄 Attempting to reconnect in 3 seconds...');
              reconnectTimeoutRef.current = setTimeout(connect, 3000);
            }
          }
        };
      } catch (error) {
        console.error("❌ Error creating WebSocket:", error);
      }
    };

    // Initial connection with a small delay to avoid React Strict Mode double-mount issues
    const initTimeout = setTimeout(connect, 100);

    return () => {
      console.log('🧹 Cleaning up WebSocket connection');
      isCleaningUpRef.current = true;
      
      // Clear any pending reconnect attempts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      // Clear init timeout
      clearTimeout(initTimeout);
      
      // Close WebSocket
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [userId]);

  return wsRef;
}