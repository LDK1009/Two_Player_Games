import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { PlayerBadge } from '@/shared/components/game/PlayerBadge';
import { SplitPlayerBoard } from '@/shared/components/game/SplitPlayerBoard';
import { colors, radius, spacing, typography } from '@/shared/theme/tokens';
import type { GameComponentProps } from '@/shared/types/game';
import { resolveChickenRound } from '@/views/game/_utils/chickenRules';

const MIN_EXPLOSION_MS = 4500;
const EXPLOSION_RANGE_MS = 3500;

function getCurrentTimestamp(): number {
  return Date.now();
}

export function ChickenButtonGame({ onFinish }: GameComponentProps) {
  const [heldPlayers, setHeldPlayers] = useState({ p1: false, p2: false });
  const [hasStarted, setHasStarted] = useState(false);
  const startTimeRef = useRef(0);
  const explosionTimeRef = useRef(0);
  const releaseTimesRef = useRef<[number | null, number | null]>([null, null]);
  const finishedRef = useRef(false);
  const pressure = useSharedValue(0);
  const pressureStyle = useAnimatedStyle(() => ({ width: `${Math.min(100, pressure.get() * 100)}%` }));

  const finishRound = useCallback((didExplode: boolean) => {
    if (finishedRef.current) {
      return;
    }

    finishedRef.current = true;
    const winner = resolveChickenRound(releaseTimesRef.current, explosionTimeRef.current);
    void Haptics.notificationAsync(
      didExplode ? Haptics.NotificationFeedbackType.Error : Haptics.NotificationFeedbackType.Success,
    );
    onFinish({
      winner,
      title: didExplode ? '💥 펑!' : winner === 'draw' ? '동시에 멈췄다!' : `${winner.toUpperCase()} 승리`,
      subtitle: winner === 'draw' ? '둘의 담력이 똑같아요.' : '폭발 직전까지 더 오래 버텼어요.',
    });
  }, [onFinish]);

  useEffect(() => {
    if (!hasStarted) {
      return;
    }

    const explosionTime = MIN_EXPLOSION_MS + Math.random() * EXPLOSION_RANGE_MS;
    startTimeRef.current = getCurrentTimestamp();
    explosionTimeRef.current = explosionTime;
    pressure.set(withTiming(1, { duration: explosionTime }));
    const timer = setTimeout(() => finishRound(true), explosionTime);
    return () => clearTimeout(timer);
  }, [finishRound, hasStarted, pressure]);

  const pressIn = (player: 'p1' | 'p2') => {
    setHeldPlayers((current) => {
      const next = { ...current, [player]: true };
      if (next.p1 && next.p2 && !hasStarted) {
        setHasStarted(true);
      }
      return next;
    });
  };

  const pressOut = (player: 'p1' | 'p2') => {
    if (!hasStarted || finishedRef.current) {
      setHeldPlayers((current) => ({ ...current, [player]: false }));
      return;
    }

    const playerIndex = player === 'p1' ? 0 : 1;
    if (releaseTimesRef.current[playerIndex] !== null) {
      return;
    }
    releaseTimesRef.current[playerIndex] = getCurrentTimestamp() - startTimeRef.current;
    setHeldPlayers((current) => ({ ...current, [player]: false }));

    if (releaseTimesRef.current[0] !== null && releaseTimesRef.current[1] !== null) {
      finishRound(false);
    }
  };

  const renderButton = (player: 'p1' | 'p2') => (
    <View style={styles.playerPanel}>
      <PlayerBadge player={player === 'p1' ? 'P1' : 'P2'} />
      <Pressable onPressIn={() => pressIn(player)} onPressOut={() => pressOut(player)} style={[styles.chickenButton, heldPlayers[player] && styles.heldButton]}>
        <Text style={styles.fire}>🔥</Text>
        <Text style={styles.buttonText}>{hasStarted ? '버텨!' : '누르고 대기'}</Text>
      </Pressable>
    </View>
  );

  return (
    <SplitPlayerBoard
      center={
        <View style={styles.meterTrack}>
          <Animated.View style={[styles.meterFill, pressureStyle]} />
          <Text style={styles.meterLabel}>{hasStarted ? '언제 터질까?' : '둘 다 누르면 시작'}</Text>
        </View>
      }
      playerOne={renderButton('p1')}
      playerTwo={renderButton('p2')}
    />
  );
}

const styles = StyleSheet.create({
  playerPanel: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  chickenButton: { width: '88%', flex: 1, maxHeight: 145, borderRadius: radius.lg, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  heldButton: { backgroundColor: '#E8582B', transform: [{ scale: 0.97 }] },
  fire: { fontSize: 46 },
  buttonText: { color: colors.surface, fontSize: typography.body, fontWeight: '900' },
  meterTrack: { width: '84%', height: 30, borderRadius: radius.pill, backgroundColor: colors.border, overflow: 'hidden', justifyContent: 'center' },
  meterFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: '#FF9838' },
  meterLabel: { color: colors.ink, fontSize: typography.caption, fontWeight: '900', textAlign: 'center' },
});
