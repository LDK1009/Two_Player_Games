import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

export const applicationStorage = createMMKV({
  id: 'two-player-games',
});

export const zustandStorage: StateStorage = {
  getItem: (key) => applicationStorage.getString(key) ?? null,
  setItem: (key, value) => applicationStorage.set(key, value),
  removeItem: (key) => applicationStorage.remove(key),
};
