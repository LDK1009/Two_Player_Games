import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme/tokens';

type SplitPlayerBoardProps = {
  playerOne: ReactNode;
  playerTwo: ReactNode;
  center?: ReactNode;
};

export function SplitPlayerBoard({ playerOne, playerTwo, center }: SplitPlayerBoardProps) {
  return (
    <View style={styles.board}>
      <View style={[styles.panel, styles.rotated]}>{playerTwo}</View>
      {center ? <View style={styles.center}>{center}</View> : <View style={styles.divider} />}
      <View style={styles.panel}>{playerOne}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: { flex: 1, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surface },
  panel: { flex: 1, padding: spacing.md },
  rotated: { transform: [{ rotate: '180deg' }] },
  divider: { height: 2, backgroundColor: colors.border },
  center: { minHeight: 50, alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
});
