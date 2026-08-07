import { useLocalSearchParams } from 'expo-router';

import { GameRouteView } from '@/views/game/GameRouteView';

export default function GameRoute() {
  const { gameId } = useLocalSearchParams<{ gameId?: string | string[] }>();
  const normalizedGameId = Array.isArray(gameId) ? gameId[0] : gameId;

  return <GameRouteView gameId={normalizedGameId ?? ''} />;
}
