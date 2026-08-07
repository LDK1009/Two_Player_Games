import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/shared/theme/tokens';

export type ChoiceOption<T extends string> = {
  value: T;
  label: string;
  color?: string;
};

type ChoiceButtonsProps<T extends string> = {
  options: readonly ChoiceOption<T>[];
  selectedValue?: T;
  disabled?: boolean;
  onSelect: (value: T) => void;
};

export function ChoiceButtons<T extends string>({
  options,
  selectedValue,
  disabled = false,
  onSelect,
}: ChoiceButtonsProps<T>) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const isSelected = option.value === selectedValue;

        return (
          <Pressable
            disabled={disabled}
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={[
              styles.button,
              option.color ? { borderColor: option.color } : undefined,
              isSelected && { backgroundColor: option.color ?? colors.ink },
              disabled && styles.disabled,
            ]}
          >
            <Text style={[styles.label, isSelected && styles.selectedLabel]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  button: { flex: 1, minHeight: 54, borderRadius: radius.md, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.sm },
  disabled: { opacity: 0.65 },
  label: { color: colors.ink, fontSize: typography.body, fontWeight: '900', textAlign: 'center' },
  selectedLabel: { color: colors.surface },
});
