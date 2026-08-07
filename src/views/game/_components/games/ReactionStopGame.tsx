import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PlayerBadge } from '@/shared/components/game/PlayerBadge';
import { SplitPlayerBoard } from '@/shared/components/game/SplitPlayerBoard';
import { colors, radius, spacing, typography } from '@/shared/theme/tokens';
import type { GameComponentProps } from '@/shared/types/game';
import { resolveReactionWinner, type ReactionSignalState } from '@/views/game/_utils/reactionStopRules';

const MIN_WAIT_MS = 1500;
const WAIT_RANGE_MS = 2500;

export function ReactionStopGame({ onFinish }: GameComponentProps) {
  const [signalState, setSignalState] = useState<ReactionSignalState>('waiting');
  const finishedRef = useRef(false);

  useEffect(() => {
    const signalTimer = setTimeout(() => {
      setSignalState('green');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, MIN_WAIT_MS + Math.random() * WAIT_RANGE_MS);

    return () => clearTimeout(signalTimer);
  }, []);

  const release = (player: 'p1' | 'p2') => {
    if (finishedRef.current) {
      return;
    }

    finishedRef.current = true;
    const winner = resolveReactionWinner(player, signalState);
    const isFalseStart = signalState === 'waiting';
    void Haptics.notificationAsync(
      isFalseStart ? Haptics.NotificationFeedbackType.Error : Haptics.NotificationFeedbackType.Success,
    );
    onFinish({
      winner,
      title: winner === 'draw' ? '동시에!' : `${winner.toUpperCase()} 승리`,
      subtitle: isFalseStart ? `${player.toUpperCase()} 부정 출발!` : '초록불을 더 빠르게 잡았어요.',
    });
  };

  const playerOne = <HoldButton player="P1" signalState={signalState} onRelease={() => release('p1')} />;
  const playerTwo = <HoldButton player="P2" signalState={signalState} onRelease={() => release('p2')} />;

  return (
    <SplitPlayerBoard
      center={<Text style={[styles.signal, signalState === 'green' && styles.greenSignal]}>{signalState === 'green' ? 'GO!' : '기다려...'}</Text>}
      playerOne={playerOne}
      playerTwo={playerTwo}
    />
  );
}

type HoldButtonProps = {
  player: 'P1' | 'P2';
  signalState: ReactionSignalState;
  onRelease: () => void;
};

function HoldButton({ player, signalState, onRelease }: HoldButtonProps) {
  return (
    <View style={styles.playerPanel}>
      <PlayerBadge player={player} />
      <Pressable onPressOut={onRelease} style={[styles.holdButton, signalState === 'green' && styles.greenButton]}>
        <Text style={styles.holdText}>{signalState === 'green' ? '떼!' : '누르고 있어'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  playerPanel: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  holdButton: { width: '88%', flex: 1, maxHeight: 145, borderRadius: radius.lg, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  greenButton: { backgroundColor: colors.success },
  holdText: { color: colors.surface, fontSize: typography.heading, fontWeight: '900' },
  signal: { color: colors.muted, fontSize: typography.heading, fontWeight: '900' },
  greenSignal: { color: colors.success },
});
