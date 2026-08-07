import type { ComponentType } from 'react';

export type GameId =
  | 'finger-sumo'
  | 'reaction-stop'
  | 'air-hockey'
  | 'dual-rocket'
  | 'couple-sync'
  | 'bomb-manual'
  | 'chicken-button'
  | 'color-trap'
  | 'secret-prediction'
  | 'tilt-maze';

export type GameMode = '대전' | '협동' | '커플';

export type GamePhase = 'ready' | 'countdown' | 'playing' | 'result';

export type GameDefinition = {
  id: GameId;
  title: string;
  icon: string;
  mode: GameMode;
  durationSeconds: number;
  accent: string;
  description: string;
  rule: string;
};

export type GameResult = {
  winner: 'p1' | 'p2' | 'draw' | 'team';
  title: string;
  subtitle: string;
  p1Score?: number;
  p2Score?: number;
  recordValue?: number;
};

export type GameComponentProps = {
  onFinish: (result: GameResult) => void;
  roundKey: number;
};

export type GameComponent = ComponentType<GameComponentProps>;
