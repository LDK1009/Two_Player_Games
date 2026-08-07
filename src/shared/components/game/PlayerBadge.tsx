import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/shared/theme/tokens';

type PlayerBadgeProps = {
  player: 'P1' | 'P2';
  isRotated?: boolean;
};

export function PlayerBadge({ player, isRotated = false }: PlayerBadgeProps) {
  const isPlayerOne = player === 'P1';

  return (
    <View
      style={[
        styles.badge,
        isPlayerOne ? styles.playerOne : styles.playerTwo,
        isRotated && styles.rotated,
      ]}
    >
      <Text style={styles.label}>{player}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  playerOne: {
    backgroundColor: colors.coral,
  },
  playerTwo: {
    backgroundColor: colors.blue,
  },
  rotated: {
    transform: [{ rotate: '180deg' }],
  },
  label: {
    color: colors.surface,
    fontSize: typography.caption,
    fontWeight: '900',
  },
});
