import * as Haptics from 'expo-haptics';
import { Circle, Edge, Vec2, World } from 'planck';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { colors, radius, spacing, typography } from '@/shared/theme/tokens';
import type { GameComponentProps } from '@/shared/types/game';
import { detectGoal } from '@/views/game/_utils/physicsBounds';

const PHYSICS_SCALE = 50;
const PUCK_RADIUS = 15;
const PADDLE_RADIUS = 30;
const WINNING_SCORE = 5;
const GAME_SECONDS = 45;

function createWall(world: World, x1: number, y1: number, x2: number, y2: number) {
  const wall = world.createBody();
  wall.createFixture(Edge(Vec2(x1, y1), Vec2(x2, y2)), { restitution: 1, friction: 0 });
}

export function AirHockeyGame({ onFinish }: GameComponentProps) {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [secondsLeft, setSecondsLeft] = useState(GAME_SECONDS);
  const scoresRef = useRef(scores);
  const finishedFlag = useSharedValue(0);
  const puckX = useSharedValue(0);
  const puckY = useSharedValue(0);
  const playerOneX = useSharedValue(0);
  const playerOneY = useSharedValue(0);
  const playerTwoX = useSharedValue(0);
  const playerTwoY = useSharedValue(0);
  const playerOneDeltaX = useSharedValue(0);
  const playerOneDeltaY = useSharedValue(0);
  const playerTwoDeltaX = useSharedValue(0);
  const playerTwoDeltaY = useSharedValue(0);
  const puckStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: puckX.get() - PUCK_RADIUS }, { translateY: puckY.get() - PUCK_RADIUS }],
  }));
  const playerOneStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: playerOneX.get() - PADDLE_RADIUS }, { translateY: playerOneY.get() - PADDLE_RADIUS }],
  }));
  const playerTwoStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: playerTwoX.get() - PADDLE_RADIUS }, { translateY: playerTwoY.get() - PADDLE_RADIUS }],
  }));

  const finishWithScores = useCallback((finalScores: { p1: number; p2: number }) => {
    if (finishedFlag.get() === 1) {
      return;
    }
    finishedFlag.set(1);
    const winner = finalScores.p1 === finalScores.p2 ? 'draw' : finalScores.p1 > finalScores.p2 ? 'p1' : 'p2';
    onFinish({
      winner,
      title: winner === 'draw' ? '연장전 같은 무승부!' : `${winner.toUpperCase()} 승리!`,
      subtitle: '상대 골문에 퍽을 더 많이 넣었어요.',
      p1Score: finalScores.p1,
      p2Score: finalScores.p2,
    });
  }, [finishedFlag, onFinish]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((current) => {
        const next = Math.max(0, current - 1);
        if (next === 0) {
          finishWithScores(scoresRef.current);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [finishWithScores]);

  useEffect(() => {
    if (layout.width === 0 || layout.height === 0) {
      return;
    }

    finishedFlag.set(0);
    const width = layout.width / PHYSICS_SCALE;
    const height = layout.height / PHYSICS_SCALE;
    const goalHalfWidth = width * 0.23;
    const world = new World({ gravity: Vec2(0, 0) });
    createWall(world, 0, 0, 0, height);
    createWall(world, width, 0, width, height);
    createWall(world, 0, 0, width / 2 - goalHalfWidth, 0);
    createWall(world, width / 2 + goalHalfWidth, 0, width, 0);
    createWall(world, 0, height, width / 2 - goalHalfWidth, height);
    createWall(world, width / 2 + goalHalfWidth, height, width, height);

    const puckBody = world.createDynamicBody(Vec2(width / 2, height / 2));
    puckBody.createFixture(Circle(PUCK_RADIUS / PHYSICS_SCALE), { density: 0.6, restitution: 1, friction: 0 });
    puckBody.setBullet(true);
    puckBody.setLinearVelocity(Vec2(2.8, 3.4));
    const playerOneBody = world.createDynamicBody(Vec2(width / 2, height * 0.78));
    const playerTwoBody = world.createDynamicBody(Vec2(width / 2, height * 0.22));
    playerOneBody.createFixture(Circle(PADDLE_RADIUS / PHYSICS_SCALE), { density: 8, restitution: 0.95, friction: 0 });
    playerTwoBody.createFixture(Circle(PADDLE_RADIUS / PHYSICS_SCALE), { density: 8, restitution: 0.95, friction: 0 });
    playerOneBody.setLinearDamping(8);
    playerTwoBody.setLinearDamping(8);

    const movePaddle = (player: 'p1' | 'p2') => {
      const body = player === 'p1' ? playerOneBody : playerTwoBody;
      const deltaX = player === 'p1' ? playerOneDeltaX.get() : playerTwoDeltaX.get();
      const deltaY = player === 'p1' ? playerOneDeltaY.get() : playerTwoDeltaY.get();
      if (player === 'p1') {
        playerOneDeltaX.set(0);
        playerOneDeltaY.set(0);
      } else {
        playerTwoDeltaX.set(0);
        playerTwoDeltaY.set(0);
      }
      const position = body.getPosition();
      const minX = PADDLE_RADIUS / PHYSICS_SCALE;
      const maxX = width - PADDLE_RADIUS / PHYSICS_SCALE;
      const halfHeight = height / 2;
      const minY = player === 'p1' ? halfHeight + PADDLE_RADIUS / PHYSICS_SCALE : PADDLE_RADIUS / PHYSICS_SCALE;
      const maxY = player === 'p1' ? height - PADDLE_RADIUS / PHYSICS_SCALE : halfHeight - PADDLE_RADIUS / PHYSICS_SCALE;
      const nextX = Math.min(maxX, Math.max(minX, position.x + deltaX / PHYSICS_SCALE));
      const nextY = Math.min(maxY, Math.max(minY, position.y + deltaY / PHYSICS_SCALE));
      body.setPosition(Vec2(nextX, nextY));
      body.setLinearVelocity(Vec2(deltaX * 0.2, deltaY * 0.2));
    };
    const resetPuck = (verticalDirection: number) => {
      puckBody.setPosition(Vec2(width / 2, height / 2));
      puckBody.setLinearVelocity(Vec2((Math.random() - 0.5) * 4, verticalDirection * 3.5));
    };

    let animationFrame = 0;
    const stepWorld = () => {
      movePaddle('p1');
      movePaddle('p2');
      world.step(1 / 60);
      const puckPosition = puckBody.getPosition();
      const playerOnePosition = playerOneBody.getPosition();
      const playerTwoPosition = playerTwoBody.getPosition();
      puckX.set(puckPosition.x * PHYSICS_SCALE);
      puckY.set(puckPosition.y * PHYSICS_SCALE);
      playerOneX.set(playerOnePosition.x * PHYSICS_SCALE);
      playerOneY.set(playerOnePosition.y * PHYSICS_SCALE);
      playerTwoX.set(playerTwoPosition.x * PHYSICS_SCALE);
      playerTwoY.set(playerTwoPosition.y * PHYSICS_SCALE);

      const goal = detectGoal(
        { y: puckPosition.y * PHYSICS_SCALE, radius: PUCK_RADIUS },
        { height: layout.height },
      );
      if (goal && finishedFlag.get() === 0) {
        const scoringPlayer = goal === 'top' ? 'p1' : 'p2';
        const nextScores = {
          ...scoresRef.current,
          [scoringPlayer]: scoresRef.current[scoringPlayer] + 1,
        };
        scoresRef.current = nextScores;
        setScores(nextScores);
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        if (nextScores[scoringPlayer] >= WINNING_SCORE) {
          finishWithScores(nextScores);
          return;
        }
        resetPuck(goal === 'top' ? -1 : 1);
      }

      animationFrame = requestAnimationFrame(stepWorld);
    };
    animationFrame = requestAnimationFrame(stepWorld);
    return () => cancelAnimationFrame(animationFrame);
  }, [
    finishWithScores,
    finishedFlag,
    layout.height,
    layout.width,
    playerOneDeltaX,
    playerOneDeltaY,
    playerOneX,
    playerOneY,
    playerTwoDeltaX,
    playerTwoDeltaY,
    playerTwoX,
    playerTwoY,
    puckX,
    puckY,
  ]);

  const playerOneGesture = Gesture.Pan().onChange((event) => {
    playerOneDeltaX.set(playerOneDeltaX.get() + event.changeX);
    playerOneDeltaY.set(playerOneDeltaY.get() + event.changeY);
  });
  const playerTwoGesture = Gesture.Pan().onChange((event) => {
    playerTwoDeltaX.set(playerTwoDeltaX.get() + event.changeX);
    playerTwoDeltaY.set(playerTwoDeltaY.get() + event.changeY);
  });
  const handleLayout = (event: LayoutChangeEvent) => setLayout(event.nativeEvent.layout);

  return (
    <View onLayout={handleLayout} style={styles.field}>
      <View style={styles.scoreBar}>
        <Text style={styles.playerTwoScore}>P2 {scores.p2}</Text>
        <Text style={styles.timer}>{secondsLeft}s</Text>
        <Text style={styles.playerOneScore}>{scores.p1} P1</Text>
      </View>
      <View pointerEvents="none" style={styles.centerLine} />
      <View pointerEvents="none" style={[styles.goal, styles.topGoal]} />
      <View pointerEvents="none" style={[styles.goal, styles.bottomGoal]} />
      <GestureDetector gesture={playerTwoGesture}>
        <Animated.View style={[styles.paddle, styles.playerTwoPaddle, playerTwoStyle]}>
          <Text style={styles.paddleText}>P2</Text>
        </Animated.View>
      </GestureDetector>
      <GestureDetector gesture={playerOneGesture}>
        <Animated.View style={[styles.paddle, styles.playerOnePaddle, playerOneStyle]}>
          <Text style={styles.paddleText}>P1</Text>
        </Animated.View>
      </GestureDetector>
      <Animated.View pointerEvents="none" style={[styles.puck, puckStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { flex: 1, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: '#EAF7FF', borderWidth: 4, borderColor: colors.ink },
  scoreBar: { position: 'absolute', zIndex: 5, top: spacing.sm, left: spacing.md, right: spacing.md, flexDirection: 'row', justifyContent: 'space-between' },
  playerOneScore: { color: colors.coral, fontSize: typography.body, fontWeight: '900' },
  playerTwoScore: { color: colors.blue, fontSize: typography.body, fontWeight: '900', transform: [{ rotate: '180deg' }] },
  timer: { color: colors.ink, fontSize: typography.caption, fontWeight: '900' },
  centerLine: { position: 'absolute', left: 0, right: 0, top: '50%', height: 2, backgroundColor: '#B7D8EA' },
  goal: { position: 'absolute', width: '46%', height: 10, left: '27%', backgroundColor: colors.ink },
  topGoal: { top: -4 },
  bottomGoal: { bottom: -4 },
  paddle: { position: 'absolute', width: PADDLE_RADIUS * 2, height: PADDLE_RADIUS * 2, borderRadius: PADDLE_RADIUS, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: colors.surface, elevation: 3 },
  playerOnePaddle: { backgroundColor: colors.coral },
  playerTwoPaddle: { backgroundColor: colors.blue },
  paddleText: { color: colors.surface, fontSize: typography.caption, fontWeight: '900' },
  puck: { position: 'absolute', width: PUCK_RADIUS * 2, height: PUCK_RADIUS * 2, borderRadius: PUCK_RADIUS, backgroundColor: colors.ink, borderWidth: 3, borderColor: colors.surface },
});
