import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from '@/shared/storage/mmkvStorage';
import type { GameId, GameResult } from '@/shared/types/game';

type GameRecord = {
  plays: number;
  p1Wins: number;
  p2Wins: number;
  teamWins: number;
  bestRecord?: number;
};

type GameRecordsState = {
  recentGameId?: GameId;
  records: Partial<Record<GameId, GameRecord>>;
  saveResult: (gameId: GameId, result: GameResult) => void;
};

const EMPTY_RECORD: GameRecord = {
  plays: 0,
  p1Wins: 0,
  p2Wins: 0,
  teamWins: 0,
};

export const useGameRecordsStore = create<GameRecordsState>()(
  persist(
    (set) => ({
      records: {},
      saveResult: (gameId, result) =>
        set((state) => {
          const currentRecord = state.records[gameId] ?? EMPTY_RECORD;
          const bestRecord =
            result.recordValue === undefined
              ? currentRecord.bestRecord
              : Math.max(currentRecord.bestRecord ?? 0, result.recordValue);

          const nextRecord: GameRecord = {
            plays: currentRecord.plays + 1,
            p1Wins: currentRecord.p1Wins + Number(result.winner === 'p1'),
            p2Wins: currentRecord.p2Wins + Number(result.winner === 'p2'),
            teamWins: currentRecord.teamWins + Number(result.winner === 'team'),
            bestRecord,
          };

          return {
            recentGameId: gameId,
            records: { ...state.records, [gameId]: nextRecord },
          };
        }),
    }),
    {
      name: 'two-player-game-records',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
