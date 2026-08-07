import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { type LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { colors, radius, spacing, typography } from '@/shared/theme/tokens';
import type { GameComponentProps } from '@/shared/types/game';
import { calculateRocketForce } from '@/views/game/_utils/rocketRules';

const GAME_SECONDS = 30;
const FRAME_MILLISECONDS = 33;
const CHECKPOINT_ALTITUDE = 180;

type FlightState = {
  x: number;
  angle: number;
  altitude: number;
  collisions: number;
  secondsLeft: number;
};

export function DualRocketGame({ onFinish }: GameComponentProps) {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [flight, setFlight] = useState<FlightState>({ x: 0, angle: 0, altitude: 0, collisions: 0, secondsLeft: GAME_SECONDS });
  const leftThrottle = useSharedValue(0);
  const rightThrottle = useSharedValue(0);
  const finishedFlag = useSharedValue(0);

  useEffect(() => {
    if (layout.width === 0) {
      return;
    }

    let x = layout.width / 2;
    let horizontalVelocity = 0;
    let angle = 0;
    let altitude = 0;
    let collisions = 0;
    let elapsedMilliseconds = 0;
    finishedFlag.set(0);

    const interval = setInterval(() => {
      const force = calculateRocketForce(leftThrottle.get(), rightThrottle.get());
      horizontalVelocity = (horizontalVelocity + force.torque * 0.85) * 0.94;
      angle = Math.max(-28, Math.min(28, angle + force.torque * 2.8));
      x += horizontalVelocity;
      altitude += force.thrust * 1.8;
      elapsedMilliseconds += FRAME_MILLISECONDS;

      const minimumX = 38;
      const maximumX = layout.width - 38;
      if (x < minimumX || x > maximumX) {
        x = layout.width / 2;
        horizontalVelocity = 0;
        angle = 0;
        collisions += 1;
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }

      const secondsLeft = Math.max(0, GAME_SECONDS - Math.floor(elapsedMilliseconds / 1000));
      setFlight({ x, angle, altitude, collisions, secondsLeft });
      if (secondsLeft === 0 && finishedFlag.get() === 0) {
        finishedFlag.set(1);
        clearInterval(interval);
        const checkpoints = Math.floor(altitude / CHECKPOINT_ALTITUDE);
        onFinish({
          winner: 'team',
          title: `${checkpoints}개 체크포인트 통과!`,
          subtitle: collisions === 0 ? '완벽한 팀워크로 무충돌 비행에 성공했어요.' : `충돌 ${collisions}회, 다음에는 더 높이 가봐요.`,
          recordValue: checkpoints,
        });
      }
    }, FRAME_MILLISECONDS);

    return () => clearInterval(interval);
  }, [finishedFlag, layout.width, leftThrottle, onFinish, rightThrottle]);

  const handleLayout = (event: LayoutChangeEvent) => setLayout(event.nativeEvent.layout);
  const checkpointProgress = (flight.altitude % CHECKPOINT_ALTITUDE) / CHECKPOINT_ALTITUDE;

  return (
    <View onLayout={handleLayout} style={styles.container}>
      <View style={styles.hud}>
        <Text style={styles.hudText}>고도 {Math.floor(flight.altitude)}m</Text>
        <Text style={styles.timer}>{flight.secondsLeft}s</Text>
        <Text style={styles.hudText}>충돌 {flight.collisions}</Text>
      </View>
      <View style={[styles.checkpointLine, { top: `${18 + checkpointProgress * 42}%` }]}>
        <Text style={styles.checkpointText}>CHECKPOINT</Text>
      </View>
      <View style={[styles.rocket, { left: flight.x - 26, transform: [{ rotate: `${flight.angle}deg` }] }]}>
        <Text style={styles.rocketIcon}>🚀</Text>
      </View>
      <View style={styles.controls}>
        <Pressable
          onPressIn={() => leftThrottle.set(1)}
          onPressOut={() => leftThrottle.set(0)}
          style={({ pressed }) => [styles.engineButton, styles.leftEngine, pressed && styles.pressedButton]}
        >
          <Text style={styles.engineOwner}>P1</Text>
          <Text style={styles.engineText}>왼쪽 엔진</Text>
        </Pressable>
        <Pressable
          onPressIn={() => rightThrottle.set(1)}
          onPressOut={() => rightThrottle.set(0)}
          style={({ pressed }) => [styles.engineButton, styles.rightEngine, pressed && styles.pressedButton]}
        >
          <Text style={styles.engineOwner}>P2</Text>
          <Text style={styles.engineText}>오른쪽 엔진</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: '#17152B' },
  hud: { position: 'absolute', zIndex: 4, top: spacing.md, left: spacing.md, right: spacing.md, flexDirection: 'row', justifyContent: 'space-between' },
  hudText: { color: colors.surface, fontSize: typography.caption, fontWeight: '800' },
  timer: { color: '#FFD66B', fontSize: typography.heading, fontWeight: '900' },
  checkpointLine: { position: 'absolute', left: 0, right: 0, height: 2, borderStyle: 'dashed', borderWidth: 1, borderColor: '#7F79B9', alignItems: 'center' },
  checkpointText: { color: '#7F79B9', fontSize: 10, fontWeight: '900', backgroundColor: '#17152B', paddingHorizontal: spacing.sm },
  rocket: { position: 'absolute', bottom: 132, width: 52, height: 72, alignItems: 'center', justifyContent: 'center' },
  rocketIcon: { fontSize: 52 },
  controls: { position: 'absolute', left: spacing.md, right: spacing.md, bottom: spacing.md, flexDirection: 'row', gap: spacing.md },
  engineButton: { flex: 1, minHeight: 92, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.surface },
  leftEngine: { backgroundColor: colors.coral },
  rightEngine: { backgroundColor: colors.blue },
  pressedButton: { opacity: 0.65, transform: [{ scale: 0.97 }] },
  engineOwner: { color: colors.surface, fontSize: typography.caption, fontWeight: '900' },
  engineText: { color: colors.surface, fontSize: typography.body, fontWeight: '900' },
});
