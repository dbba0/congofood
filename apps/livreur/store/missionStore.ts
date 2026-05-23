import { create } from 'zustand';
import type { Delivery, DeliveryStatus } from '@wapi/types';

interface MissionState {
  activeMission: Delivery | null;
  isOnline: boolean;

  setActiveMission: (mission: Delivery | null) => void;
  updateMissionStatus: (status: DeliveryStatus) => void;
  updateLocation: (lat: number, lng: number) => void;
  setOnline: (online: boolean) => void;
}

export const useMissionStore = create<MissionState>((set) => ({
  activeMission: null,
  isOnline: false,

  setActiveMission: (activeMission) => set({ activeMission }),

  updateMissionStatus: (status) =>
    set((s) =>
      s.activeMission
        ? { activeMission: { ...s.activeMission, status } }
        : {}
    ),

  updateLocation: (lat, lng) =>
    set((s) =>
      s.activeMission
        ? {
            activeMission: {
              ...s.activeMission,
              currentLocation: { lat, lng, updatedAt: new Date().toISOString() },
            },
          }
        : {}
    ),

  setOnline: (isOnline) => set({ isOnline }),
}));
