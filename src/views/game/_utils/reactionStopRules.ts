export type ReactionPlayer = 'p1' | 'p2' | 'both';
export type ReactionSignalState = 'waiting' | 'green';

export function resolveReactionWinner(
  releasedPlayer: ReactionPlayer,
  signalState: ReactionSignalState,
): 'p1' | 'p2' | 'draw' {
  if (releasedPlayer === 'both') {
    return 'draw';
  }

  if (signalState === 'green') {
    return releasedPlayer;
  }

  return releasedPlayer === 'p1' ? 'p2' : 'p1';
}
