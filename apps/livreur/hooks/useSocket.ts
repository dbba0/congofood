import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const BACKEND_URL = __DEV__ ? 'http://localhost:3000' : 'https://api.congofood.cd';

interface UseSocketOptions {
  token: string | null;
  enabled: boolean;
  onMissionIncoming: (mission: IncomingSocketMission) => void;
  onMissionCancelled: () => void;
}

export interface IncomingSocketMission {
  id: string;
  restaurantName: string;
  restaurantAddress: string;
  deliveryAddress: string;
  distanceKm: number;
  estimatedMinutes: number;
  earningsAmount: number;
  timeoutSeconds: number;
}

export function useSocket({ token, enabled, onMissionIncoming, onMissionCancelled }: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);

  const acceptMission = useCallback((missionId: string) => {
    socketRef.current?.emit('mission:accept', { missionId });
  }, []);

  const refuseMission = useCallback((missionId: string) => {
    socketRef.current?.emit('mission:refuse', { missionId });
  }, []);

  useEffect(() => {
    if (!enabled || !token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const socket = io(BACKEND_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 10000,
    });

    socket.on('mission:incoming', onMissionIncoming);
    socket.on('mission:cancelled', onMissionCancelled);

    socketRef.current = socket;

    return () => {
      socket.off('mission:incoming', onMissionIncoming);
      socket.off('mission:cancelled', onMissionCancelled);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled, token]); // eslint-disable-line react-hooks/exhaustive-deps

  return { acceptMission, refuseMission };
}
