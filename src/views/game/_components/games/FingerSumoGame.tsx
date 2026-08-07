import * as Haptics from 'expo-haptics';
import { Circle, Vec2, World } from 'planck';
import { useEffect, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { PlayerBadge } from '@/shared/components/game/PlayerBadge';
import { colors, radius, spacing, typography } from '@/shared/theme/tokens';
import type { GameComponentProps } from '@/shared/types/game';
import { isCircleOutsideArena } from '@/views/game/_utils/physicsBounds';

const PHYSICS_SCALE = 50;
const PLAYER_RADIUS = 30;
const IMPULSE_SCALE = 0.008;

export function FingerSumoGame({ onFinish }: GameComponentProps) {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const playerOneX = useSharedValue(0);
  const playerOneY = useSharedValue(0);
  const playerTwoX = useSharedValue(0);
  const playerTwoY = useSharedValue(0);
  const playerOneImpulseX = useSharedValue(0);
  const playerOneImpulseY = useSharedValue(0);
  const playerTwoImpulseX = useSharedValue(0);
  const playerTwoImpulseY = useSharedValue(0);
  const finishedFlag = useSharedValue(0);
  const arenaRadius = Math.min(layout.width, layout.height) * 0.36;
  const arenaCenterX = layout.width / 2;
  const arenaCenterY = layout.height / 2;

  const playerOneStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: playerOneX.get() - PLAYER_RADIUS },
      { translateY: playerOneY.get() - PLAYER_RADIUS },
    ],
  }));
  const playerTwoStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: playerTwoX.get() - PLAYER_RADIUS },
      { translateY: playerTwoY.get() - PLAYER_RADIUS },
    ],
  }));

  useEffect(() => {
    if (layout.width === 0 || layout.height === 0) {
      return;
    }

    finishedFlag.set(0);
    const world = new World({ gravity: Vec2(0, 0) });
    const playerOneBody = world.createDynamicBody(
      Vec2((arenaCenterX - arenaRadius * 0.42) / PHYSICS_SCALE, arenaCenterY / PHYSICS_SCALE),
    );
    const playerTwoBody = world.createDynamicBody(
      Vec2((arenaCenterX + arenaRadius * 0.42) / PHYSICS_SCALE, arenaCenterY / PHYSICS_SCALE),
    );
    playerOneBody.createFixture(Circle(PLAYER_RADIUS / PHYSICS_SCALE), {
      density: 1,
      friction: 0.2,
      restitution: 0.75,
    });
    playerTwoBody.createFixture(Circle(PLAYER_RADIUS / PHYSICS_SCALE), {
      density: 1,
      friction: 0.2,
      restitution: 0.75,
    });
    playerOneBody.setLinearDamping(2.2);
    playerTwoBody.setLinearDamping(2.2);

    let animationFrame = 0;
    const stepWorld = () => {
      const p1Impulse = Vec2(
        playerOneImpulseX.get() * IMPULSE_SCALE,
        playerOneImpulseY.get() * IMPULSE_SCALE,
      );
      const p2Impulse = Vec2(
        playerTwoImpulseX.get() * IMPULSE_SCALE,
        playerTwoImpulseY.get() * IMPULSE_SCALE,
      );
      playerOneImpulseX.set(0);
      playerOneImpulseY.set(0);
      playerTwoImpulseX.set(0);
      playerTwoImpulseY.set(0);
      playerOneBody.applyLinearImpulse(p1Impulse, playerOneBody.getWorldCenter(), true);
      playerTwoBody.applyLinearImpulse(p2Impulse, playerTwoBody.getWorldCenter(), true);

      world.step(1 / 60);
      const playerOnePosition = playerOneBody.getPosition();
      const playerTwoPosition = playerTwoBody.getPosition();
      const playerOneCircle = {
        x: playerOnePosition.x * PHYSICS_SCALE,
        y: playerOnePosition.y * PHYSICS_SCALE,
        radius: PLAYER_RADIUS,
      };
      const playerTwoCircle = {
        x: playerTwoPosition.x * PHYSICS_SCALE,
        y: playerTwoPosition.y * PHYSICS_SCALE,
        radius: PLAYER_RADIUS,
      };
      playerOneX.set(playerOneCircle.x);
      playerOneY.set(playerOneCircle.y);
      playerTwoX.set(playerTwoCircle.x);
      playerTwoY.set(playerTwoCircle.y);

      if (finishedFlag.get() === 0) {
        const arena = { x: arenaCenterX, y: arenaCenterY, radius: arenaRadius };
        const isPlayerOneOut = isCircleOutsideArena(playerOneCircle, arena);
        const isPlayerTwoOut = isCircleOutsideArena(playerTwoCircle, arena);
        if (isPlayerOneOut || isPlayerTwoOut) {
          finishedFlag.set(1);
          const winner = isPlayerOneOut && isPlayerTwoOut ? 'draw' : isPlayerOneOut ? 'p2' : 'p1';
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onFinish({
            winner,
            title: winner === 'draw' ? '동시에 탈락!' : `${winner.toUpperCase()} 승리!`,
            subtitle: '상대를 원 밖으로 완전히 밀어냈어요.',
          });
          return;
        }
      }

      animationFrame = requestAnimationFrame(stepWorld);
    };
    animationFrame = requestAnimationFrame(stepWorld);

    return () => cancelAnimationFrame(animationFrame);
  }, [
    arenaCenterX,
    arenaCenterY,
    arenaRadius,
    finishedFlag,
    layout.height,
    layout.width,
    onFinish,
    playerOneImpulseX,
    playerOneImpulseY,
    playerOneX,
    playerOneY,
    playerTwoImpulseX,
    playerTwoImpulseY,
    playerTwoX,
    playerTwoY,
  ]);

  const playerOneGesture = Gesture.Pan().onChange((event) => {
    playerOneImpulseX.set(playerOneImpulseX.get() + event.changeX);
    playerOneImpulseY.set(playerOneImpulseY.get() + event.changeY);
  });
  const playerTwoGesture = Gesture.Pan().onChange((event) => {
    playerTwoImpulseX.set(playerTwoImpulseX.get() + event.changeX);
    playerTwoImpulseY.set(playerTwoImpulseY.get() + event.changeY);
  });

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  };

  return (
    <View onLayout={handleLayout} style={styles.container}>
      {layout.width > 0 && (
        <View
          pointerEvents="none"
          style={[
            styles.arena,
            {
              width: arenaRadius * 2,
              height: arenaRadius * 2,
              borderRadius: arenaRadius,
              left: arenaCenterX - arenaRadius,
              top: arenaCenterY - arenaRadius,
            },
          ]}
        >
          <Text style={styles.arenaText}>버텨내!</Text>
        </View>
      )}
      <GestureDetector gesture={playerOneGesture}>
        <Animated.View style={[styles.player, styles.playerOne, playerOneStyle]}>
          <PlayerBadge player="P1" />
        </Animated.View>
      </GestureDetector>
      <GestureDetector gesture={playerTwoGesture}>
        <Animated.View style={[styles.player, styles.playerTwo, playerTwoStyle]}>
          <PlayerBadge player="P2" />
        </Animated.View>
      </GestureDetector>
      <View pointerEvents="none" style={styles.hintWrap}>
        <Text style={styles.hint}>캐릭터를 빠르게 밀어 충돌시키세요</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: '#F4EDE4' },
  arena: { position: 'absolute', borderWidth: 7, borderColor: colors.ink, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  arenaText: { color: colors.border, fontSize: typography.heading, fontWeight: '900' },
  player: { position: 'absolute', width: PLAYER_RADIUS * 2, height: PLAYER_RADIUS * 2, borderRadius: PLAYER_RADIUS, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: colors.surface, shadowColor: colors.ink, shadowOpacity: 0.18, shadowRadius: 6, elevation: 4 },
  playerOne: { backgroundColor: colors.coral },
  playerTwo: { backgroundColor: colors.blue },
  hintWrap: { position: 'absolute', left: spacing.md, right: spacing.md, bottom: spacing.md, alignItems: 'center' },
  hint: { color: colors.muted, fontSize: typography.caption, fontWeight: '800', backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
});
