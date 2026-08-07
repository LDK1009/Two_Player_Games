import { Canvas, Circle, Group, Rect } from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import { World, Vec2 } from 'planck';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSettingsStore } from '@/shared/store/useSettingsStore';
import { colors, radius, spacing, typography } from '@/shared/theme/tokens';

const physicsWorld = new World({ gravity: Vec2(0, 9.81) });
const physicsGravity = physicsWorld.getGravity().y;

export function HomeView() {
  const isHapticsEnabled = useSettingsStore((state) => state.isHapticsEnabled);
  const isSoundEnabled = useSettingsStore((state) => state.isSoundEnabled);
  const toggleHaptics = useSettingsStore((state) => state.toggleHaptics);
  const toggleSound = useSettingsStore((state) => state.toggleSound);
  const arenaScale = useSharedValue(1);

  const arenaStyle = useAnimatedStyle(() => ({
    transform: [{ scale: arenaScale.get() }],
  }));

  const arenaTapGesture = Gesture.Tap()
    .runOnJS(true)
    .onEnd(() => {
      arenaScale.set(withSequence(withSpring(0.96), withSpring(1)));

      if (isHapticsEnabled) {
        void Haptics.selectionAsync();
      }
    });

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View entering={FadeInDown.duration(420)} style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>TWO PLAYER ARCADE</Text>
          <Text style={styles.title}>둘이 하는 게임</Text>
          <Text style={styles.subtitle}>한 화면에서 바로 붙는 미니게임 모음</Text>
        </View>

        <GestureDetector gesture={arenaTapGesture}>
          <Animated.View style={[styles.arena, arenaStyle]}>
            <Canvas style={styles.canvas}>
              <Rect x={0} y={0} width={320} height={180} color={colors.surface} />
              <Group>
                <Circle cx={78} cy={90} r={52} color={colors.coralSoft} />
                <Circle cx={78} cy={90} r={28} color={colors.coral} />
                <Circle cx={242} cy={90} r={52} color={colors.blueSoft} />
                <Circle cx={242} cy={90} r={28} color={colors.blue} />
              </Group>
            </Canvas>
            <View
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, styles.arenaOverlay]}
            >
              <Text style={styles.playerLabel}>P1</Text>
              <Text style={styles.versus}>VS</Text>
              <Text style={styles.playerLabel}>P2</Text>
            </View>
          </Animated.View>
        </GestureDetector>

        <View style={styles.statusRow}>
          <Text style={styles.statusDot}>●</Text>
          <Text style={styles.statusText}>게임 엔진 준비 완료 · 중력 {physicsGravity.toFixed(2)}</Text>
        </View>

        <View style={styles.settingsCard}>
          <SettingRow
            label="효과음"
            isEnabled={isSoundEnabled}
            onValueChange={toggleSound}
          />
          <View style={styles.divider} />
          <SettingRow
            label="진동"
            isEnabled={isHapticsEnabled}
            onValueChange={toggleHaptics}
          />
        </View>

        <Text style={styles.hint}>경기장을 눌러 터치·애니메이션·햅틱을 확인하세요</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

type SettingRowProps = {
  label: string;
  isEnabled: boolean;
  onValueChange: () => void;
};

function SettingRow({ label, isEnabled, onValueChange }: SettingRowProps) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch
        accessibilityLabel={`${label} 설정`}
        onValueChange={onValueChange}
        thumbColor={colors.surface}
        trackColor={{ false: colors.coralSoft, true: colors.blue }}
        value={isEnabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  header: {
    gap: spacing.sm,
  },
  eyebrow: {
    color: colors.coral,
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  title: {
    color: colors.ink,
    fontSize: typography.title,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: typography.body,
  },
  arena: {
    alignSelf: 'center',
    width: 320,
    height: 180,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  canvas: {
    flex: 1,
  },
  arenaOverlay: {
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerLabel: {
    color: colors.surface,
    fontSize: typography.heading,
    fontWeight: '900',
  },
  versus: {
    color: colors.ink,
    fontSize: typography.heading,
    fontWeight: '900',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  statusDot: {
    color: colors.success,
    fontSize: typography.caption,
  },
  statusText: {
    color: colors.muted,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  settingsCard: {
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  settingRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLabel: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: '700',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.coralSoft,
  },
  hint: {
    color: colors.muted,
    fontSize: typography.caption,
    textAlign: 'center',
  },
});
