import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/shared/theme/tokens';
import type { GameComponentProps } from '@/shared/types/game';
import { hasReachedCheckpoint, nextCheckpointIndex } from '@/views/game/_utils/mazeRules';

const BALL_RADIUS = 13;
const CHECKPOINT_RADIUS = 30;
const SENSOR_INTERVAL = 33;
const GAME_SECONDS = 45;

type Point = { x: number; y: number };

export function TiltMazeGame({ onFinish }: GameComponentProps) {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [ball, setBall] = useState<Point>({ x: 0, y: 0 });
  const [checkpointIndex, setCheckpointIndex] = useState(0);
  const [collisions, setCollisions] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(GAME_SECONDS);
  const [sensorAvailable, setSensorAvailable] = useState(true);
  const checkpoints = useMemo(() => [
    { x: layout.width * 0.22, y: layout.height * 0.72 },
    { x: layout.width * 0.78, y: layout.height * 0.48 },
    { x: layout.width * 0.32, y: layout.height * 0.22 },
  ], [layout.height, layout.width]);

  useEffect(() => {
    if (layout.width === 0 || layout.height === 0) {
      return;
    }

    let x = layout.width / 2;
    let y = layout.height - 54;
    let velocityX = 0;
    let velocityY = 0;
    let activeCheckpoint = 0;
    let collisionCount = 0;
    let lastCollisionTimestamp = 0;
    let elapsedMilliseconds = 0;
    let isFinished = false;
    Accelerometer.setUpdateInterval(SENSOR_INTERVAL);

    const subscription = Accelerometer.addListener((measurement) => {
      if (isFinished) {
        return;
      }
      velocityX = (velocityX + measurement.x * 1.9) * 0.88;
      velocityY = (velocityY - measurement.y * 1.9) * 0.88;
      const nextX = x + velocityX;
      const nextY = y + velocityY;
      const minimumX = BALL_RADIUS;
      const maximumX = layout.width - BALL_RADIUS;
      const minimumY = BALL_RADIUS;
      const maximumY = layout.height - BALL_RADIUS;
      const hitBoundary = nextX < minimumX || nextX > maximumX || nextY < minimumY || nextY > maximumY;
      x = Math.min(maximumX, Math.max(minimumX, nextX));
      y = Math.min(maximumY, Math.max(minimumY, nextY));
      const firstWallY = layout.height * 0.6;
      const secondWallY = layout.height * 0.35;
      const hitFirstWall = x <= layout.width * 0.48 && Math.abs(y - firstWallY) <= BALL_RADIUS + 8;
      const hitSecondWall = x >= layout.width * 0.48 && Math.abs(y - secondWallY) <= BALL_RADIUS + 8;
      const hitInternalWall = hitFirstWall || hitSecondWall;
      const hitWall = hitBoundary || hitInternalWall;
      if (hitInternalWall) {
        const wallY = hitFirstWall ? firstWallY : secondWallY;
        y = velocityY > 0 ? wallY - BALL_RADIUS - 9 : wallY + BALL_RADIUS + 9;
      }
      if (hitWall) {
        velocityX *= -0.45;
        velocityY *= -0.45;
        if (elapsedMilliseconds - lastCollisionTimestamp > 450) {
          lastCollisionTimestamp = elapsedMilliseconds;
          collisionCount += 1;
          setCollisions(collisionCount);
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }

      const checkpoint = checkpoints[activeCheckpoint];
      if (checkpoint && hasReachedCheckpoint(
        { x, y, radius: BALL_RADIUS },
        { ...checkpoint, radius: CHECKPOINT_RADIUS },
      )) {
        activeCheckpoint = nextCheckpointIndex(activeCheckpoint, checkpoints.length);
        setCheckpointIndex(activeCheckpoint);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (activeCheckpoint === checkpoints.length) {
          isFinished = true;
          onFinish({
            winner: 'team',
            title: '미로 탈출 성공!',
            subtitle: `벽 충돌 ${collisionCount}회로 세 체크포인트를 통과했어요.`,
            recordValue: collisionCount,
          });
        }
      }
      setBall({ x, y });
    });

    const timer = setInterval(() => {
      elapsedMilliseconds += 1000;
      const nextSeconds = Math.max(0, GAME_SECONDS - elapsedMilliseconds / 1000);
      setSecondsLeft(nextSeconds);
      if (nextSeconds === 0 && !isFinished) {
        isFinished = true;
        onFinish({
          winner: 'team',
          title: `${activeCheckpoint}/3 체크포인트`,
          subtitle: '시간 종료! 기기를 천천히 기울이면 공을 더 안정적으로 움직일 수 있어요.',
          recordValue: activeCheckpoint,
        });
      }
    }, 1000);

    void Accelerometer.isAvailableAsync().then(setSensorAvailable);
    return () => {
      isFinished = true;
      subscription.remove();
      clearInterval(timer);
    };
  }, [checkpoints, layout.height, layout.width, onFinish]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const nextLayout = event.nativeEvent.layout;
    setLayout(nextLayout);
    setBall({ x: nextLayout.width / 2, y: nextLayout.height - 54 });
  };

  return (
    <View onLayout={handleLayout} style={styles.container}>
      <View style={styles.hud}>
        <Text style={styles.hudText}>체크포인트 {checkpointIndex}/3</Text>
        <Text style={styles.timer}>{secondsLeft}s</Text>
        <Text style={styles.hudText}>충돌 {collisions}</Text>
      </View>
      {checkpoints.map((checkpoint, index) => (
        <View
          key={`${checkpoint.x}-${checkpoint.y}`}
          style={[
            styles.checkpoint,
            index < checkpointIndex && styles.completedCheckpoint,
            index === checkpointIndex && styles.activeCheckpoint,
            { left: checkpoint.x - CHECKPOINT_RADIUS, top: checkpoint.y - CHECKPOINT_RADIUS },
          ]}
        >
          <Text style={styles.checkpointText}>{index + 1}</Text>
        </View>
      ))}
      <View style={[styles.wall, styles.wallOne]} />
      <View style={[styles.wall, styles.wallTwo]} />
      <View style={[styles.ball, { left: ball.x - BALL_RADIUS, top: ball.y - BALL_RADIUS }]} />
      <Text style={styles.guide}>{sensorAvailable ? '휴대폰 양끝을 잡고 함께 기울이세요' : '이 기기에서는 기울기 센서를 사용할 수 없어요'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: '#EAF7EF', borderWidth: 4, borderColor: '#1E6F4A' },
  hud: { position: 'absolute', zIndex: 5, top: spacing.md, left: spacing.md, right: spacing.md, flexDirection: 'row', justifyContent: 'space-between' },
  hudText: { color: '#1E6F4A', fontSize: typography.caption, fontWeight: '900' },
  timer: { color: colors.ink, fontSize: typography.heading, fontWeight: '900' },
  checkpoint: { position: 'absolute', width: CHECKPOINT_RADIUS * 2, height: CHECKPOINT_RADIUS * 2, borderRadius: CHECKPOINT_RADIUS, borderWidth: 3, borderColor: '#8CBCA1', alignItems: 'center', justifyContent: 'center', backgroundColor: '#D4ECDD' },
  activeCheckpoint: { borderColor: '#F3A83B', backgroundColor: '#FFF0C9' },
  completedCheckpoint: { borderColor: '#29A36A', backgroundColor: '#29A36A' },
  checkpointText: { color: '#1E6F4A', fontSize: typography.body, fontWeight: '900' },
  wall: { position: 'absolute', height: 16, borderRadius: radius.pill, backgroundColor: '#1E6F4A' },
  wallOne: { width: '48%', left: 0, top: '60%' },
  wallTwo: { width: '52%', right: 0, top: '35%' },
  ball: { position: 'absolute', width: BALL_RADIUS * 2, height: BALL_RADIUS * 2, borderRadius: BALL_RADIUS, backgroundColor: colors.coral, borderWidth: 3, borderColor: colors.surface, elevation: 4 },
  guide: { position: 'absolute', left: spacing.md, right: spacing.md, bottom: spacing.md, color: '#1E6F4A', fontSize: typography.caption, fontWeight: '800', textAlign: 'center' },
});
