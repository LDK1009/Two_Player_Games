import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from '@/shared/storage/mmkvStorage';

type SettingsState = {
  isHapticsEnabled: boolean;
  isSoundEnabled: boolean;
  toggleHaptics: () => void;
  toggleSound: () => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      isHapticsEnabled: true,
      isSoundEnabled: true,
      toggleHaptics: () =>
        set((state) => ({ isHapticsEnabled: !state.isHapticsEnabled })),
      toggleSound: () =>
        set((state) => ({ isSoundEnabled: !state.isSoundEnabled })),
    }),
    {
      name: 'two-player-games-settings',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
