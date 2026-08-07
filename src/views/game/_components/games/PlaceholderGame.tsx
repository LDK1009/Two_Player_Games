import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/shared/theme/tokens';
import type { GameComponentProps } from '@/shared/types/game';

export function PlaceholderGame({ onFinish }: GameComponentProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>게임 엔진 연결 중</Text>
      <Text style={styles.description}>화면 흐름을 확인하기 위한 임시 경기장입니다.</Text>
      <Pressable
        onPress={() => onFinish({ winner: 'draw', title: '연결 확인', subtitle: '게임 화면 흐름이 정상입니다.' })}
        style={styles.button}
      >
        <Text style={styles.buttonText}>임시 결과 보기</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, borderRadius: radius.lg, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  title: { color: colors.ink, fontSize: typography.heading, fontWeight: '900' },
  description: { color: colors.muted, fontSize: typography.body, textAlign: 'center' },
  button: { marginTop: spacing.md, borderRadius: radius.md, backgroundColor: colors.ink, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  buttonText: { color: colors.surface, fontWeight: '900' },
});
