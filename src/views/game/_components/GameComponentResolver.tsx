import type { GameComponentProps, GameId } from '@/shared/types/game';
import { PlaceholderGame } from '@/views/game/_components/games/PlaceholderGame';

type GameComponentResolverProps = GameComponentProps & {
  gameId: GameId;
};

export function GameComponentResolver({ gameId: _gameId, ...gameProps }: GameComponentResolverProps) {
  return <PlaceholderGame {...gameProps} />;
}
