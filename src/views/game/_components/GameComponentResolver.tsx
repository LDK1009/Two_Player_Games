import type { GameComponentProps, GameId } from '@/shared/types/game';
import { AirHockeyGame } from '@/views/game/_components/games/AirHockeyGame';
import { BombManualGame } from '@/views/game/_components/games/BombManualGame';
import { ChickenButtonGame } from '@/views/game/_components/games/ChickenButtonGame';
import { ColorTrapGame } from '@/views/game/_components/games/ColorTrapGame';
import { CoupleSyncGame } from '@/views/game/_components/games/CoupleSyncGame';
import { DualRocketGame } from '@/views/game/_components/games/DualRocketGame';
import { FingerSumoGame } from '@/views/game/_components/games/FingerSumoGame';
import { ReactionStopGame } from '@/views/game/_components/games/ReactionStopGame';
import { SecretPredictionGame } from '@/views/game/_components/games/SecretPredictionGame';
import { TiltMazeGame } from '@/views/game/_components/games/TiltMazeGame';

type GameComponentResolverProps = GameComponentProps & {
  gameId: GameId;
};

export function GameComponentResolver({ gameId, ...gameProps }: GameComponentResolverProps) {
  switch (gameId) {
    case 'reaction-stop':
      return <ReactionStopGame {...gameProps} />;
    case 'color-trap':
      return <ColorTrapGame {...gameProps} />;
    case 'chicken-button':
      return <ChickenButtonGame {...gameProps} />;
    case 'secret-prediction':
      return <SecretPredictionGame {...gameProps} />;
    case 'couple-sync':
      return <CoupleSyncGame {...gameProps} />;
    case 'bomb-manual':
      return <BombManualGame {...gameProps} />;
    case 'finger-sumo':
      return <FingerSumoGame {...gameProps} />;
    case 'air-hockey':
      return <AirHockeyGame {...gameProps} />;
    case 'dual-rocket':
      return <DualRocketGame {...gameProps} />;
    case 'tilt-maze':
      return <TiltMazeGame {...gameProps} />;
  }
}
