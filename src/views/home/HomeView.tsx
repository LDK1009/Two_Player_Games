import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GAME_DEFINITIONS } from '@/shared/constants/games';
import { useGameRecordsStore } from '@/shared/store/useGameRecordsStore';
import { useSettingsStore } from '@/shared/store/useSettingsStore';
import { colors, radius, spacing, typography } from '@/shared/theme/tokens';
import type { GameDefinition } from '@/shared/types/game';

export function HomeView() {
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const recentGameId = useGameRecordsStore((state) => state.recentGameId);
  const isHapticsEnabled = useSettingsStore((state) => state.isHapticsEnabled);
  const isSoundEnabled = useSettingsStore((state) => state.isSoundEnabled);
  const toggleHaptics = useSettingsStore((state) => state.toggleHaptics);
  const toggleSound = useSettingsStore((state) => state.toggleSound);

  const openGame = (gameId: GameDefinition['id']) => {
    router.push({ pathname: '/games/[gameId]', params: { gameId } });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.eyebrow}>TWO PLAYER ARCADE</Text>
            <Text style={styles.title}>오늘 뭐 하고 놀까?</Text>
            <Text style={styles.subtitle}>한 화면, 두 사람, 바로 시작.</Text>
          </View>
          <Pressable onPress={() => setIsSettingsVisible((current) => !current)} style={styles.settingsButton}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </Pressable>
        </View>

        {isSettingsVisible && (
          <Animated.View entering={FadeInDown.duration(220)} style={styles.settingsCard}>
            <SettingRow label="효과음" isEnabled={isSoundEnabled} onToggle={toggleSound} />
            <View style={styles.divider} />
            <SettingRow label="진동" isEnabled={isHapticsEnabled} onToggle={toggleHaptics} />
          </Animated.View>
        )}

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>게임 10개</Text>
          <Text style={styles.sectionHint}>마주 보고 플레이</Text>
        </View>

        <View style={styles.grid}>
          {GAME_DEFINITIONS.map((game, index) => (
            <Animated.View entering={FadeInDown.delay(index * 45).duration(280)} key={game.id} style={styles.cardWrap}>
              <Pressable onPress={() => openGame(game.id)} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.gameIcon}>{game.icon}</Text>
                  <View style={[styles.modeBadge, { backgroundColor: game.accent }]}>
                    <Text style={styles.modeText}>{game.mode}</Text>
                  </View>
                </View>
                <Text style={styles.gameTitle}>{game.title}</Text>
                <Text numberOfLines={2} style={styles.gameDescription}>{game.description}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.duration}>{game.durationSeconds}초</Text>
                  {recentGameId === game.id && <Text style={styles.recent}>최근 플레이</Text>}
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type SettingRowProps = {
  label: string;
  isEnabled: boolean;
  onToggle: () => void;
};

function SettingRow({ label, isEnabled, onToggle }: SettingRowProps) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch onValueChange={onToggle} thumbColor={colors.surface} trackColor={{ false: colors.coralSoft, true: colors.blue }} value={isEnabled} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.xl },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing.lg },
  headerTextWrap: { flex: 1, gap: spacing.xs },
  eyebrow: { color: colors.coral, fontSize: typography.caption, fontWeight: '900', letterSpacing: 1.6 },
  title: { color: colors.ink, fontSize: typography.title, fontWeight: '900' },
  subtitle: { color: colors.muted, fontSize: typography.body },
  settingsButton: { width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  settingsIcon: { fontSize: 21 },
  settingsCard: { borderRadius: radius.md, backgroundColor: colors.surface, paddingHorizontal: spacing.md, marginBottom: spacing.lg },
  settingRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingLabel: { color: colors.ink, fontSize: typography.body, fontWeight: '800' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.coralSoft },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  sectionTitle: { color: colors.ink, fontSize: typography.heading, fontWeight: '900' },
  sectionHint: { color: colors.muted, fontSize: typography.caption, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cardWrap: { width: '48.7%' },
  card: { minHeight: 190, borderRadius: radius.lg, backgroundColor: colors.surface, padding: spacing.md, gap: spacing.sm, borderWidth: 1, borderColor: colors.border },
  cardPressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gameIcon: { fontSize: 34 },
  modeBadge: { borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  modeText: { color: colors.surface, fontSize: 10, fontWeight: '900' },
  gameTitle: { color: colors.ink, fontSize: 17, fontWeight: '900', lineHeight: 21 },
  gameDescription: { flex: 1, color: colors.muted, fontSize: typography.caption, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  duration: { color: colors.muted, fontSize: 11, fontWeight: '800' },
  recent: { color: colors.coral, fontSize: 10, fontWeight: '900' },
});
