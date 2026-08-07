import type { GameComponentProps, GameId } from '@/shared/types/game';
import { BombManualGame } from '@/views/game/_components/games/BombManualGame';
import { ChickenButtonGame } from '@/views/game/_components/games/ChickenButtonGame';
import { ColorTrapGame } from '@/views/game/_components/games/ColorTrapGame';
import { CoupleSyncGame } from '@/views/game/_components/games/CoupleSyncGame';
import { PlaceholderGame } from '@/views/game/_components/games/PlaceholderGame';
import { ReactionStopGame } from '@/views/game/_components/games/ReactionStopGame';
import { SecretPredictionGame } from '@/views/game/_components/games/SecretPredictionGame';

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
    default:
      return <PlaceholderGame {...gameProps} />;
  }
}
