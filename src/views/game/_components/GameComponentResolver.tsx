import type { GameComponentProps, GameId } from '@/shared/types/game';
import { ColorTrapGame } from '@/views/game/_components/games/ColorTrapGame';
import { PlaceholderGame } from '@/views/game/_components/games/PlaceholderGame';
import { ReactionStopGame } from '@/views/game/_components/games/ReactionStopGame';

type GameComponentResolverProps = GameComponentProps & {
  gameId: GameId;
};

export function GameComponentResolver({ gameId, ...gameProps }: GameComponentResolverProps) {
  switch (gameId) {
    case 'reaction-stop':
      return <ReactionStopGame {...gameProps} />;
    case 'color-trap':
      return <ColorTrapGame {...gameProps} />;
    default:
      return <PlaceholderGame {...gameProps} />;
  }
}
