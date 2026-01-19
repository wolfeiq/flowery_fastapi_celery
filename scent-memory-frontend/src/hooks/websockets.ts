import { useEffect, useRef, MutableRefObject } from "react";
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { memoryKeys } from './useMemories';

interface WebSocketMessage {
  event: 'memory_processed' | 'memory_failed';
  memory_id: string;
  error?: string;
}

export function useWebSocket(userId?: string): MutableRefObject<WebSocket | null> {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isCleaningUpRef = useRef(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    isCleaningUpRef.current = false;

    const connect = () => {
      if (isCleaningUpRef.current) return;

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      try {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL!;
        const ws = new WebSocket(`${wsUrl}/ws/${userId}`);
        wsRef.current = ws;

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as WebSocketMessage;

            if (data.event === 'memory_processed') {
              toast.success('Memory processed successfully!');
              queryClient.invalidateQueries({ queryKey: memoryKeys.lists() });
              queryClient.invalidateQueries({ queryKey: memoryKeys.detail(data.memory_id) });
            } else if (data.event === 'memory_failed') {
              toast.error(
                data.error || 'Failed to process memory. Please try again.',
                { duration: 5000, icon: '⚠️' }
              );
              queryClient.invalidateQueries({ queryKey: memoryKeys.lists() });
              queryClient.invalidateQueries({ queryKey: memoryKeys.detail(data.memory_id) });
            }
          } catch (err) {

          }
        };

        ws.onclose = (event) => {
          if (!isCleaningUpRef.current && event.code !== 1000 && event.code !== 1001) {
            reconnectTimeoutRef.current = setTimeout(connect, 3000);
          }
        };
      } catch (error) {

      }
    };

    const initTimeout = setTimeout(connect, 100);

    return () => {
      isCleaningUpRef.current = true;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      clearTimeout(initTimeout);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [userId, queryClient]);

  return wsRef;
}