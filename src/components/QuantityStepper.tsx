import React from 'react';
import { View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { colors } from '@/theme/colors';

interface QuantityStepperProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}

export function QuantityStepper({ value, onChange, min = 1, max = 9999 }: QuantityStepperProps) {
  const decrement = () => {
    if (value > min) onChange(value - 1);
  };
  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  const handleChange = (text: string) => {
    const n = parseInt(text, 10);
    if (isNaN(n)) {
      onChange(min);
    } else {
      onChange(Math.max(min, Math.min(max, n)));
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={decrement}
        activeOpacity={0.7}
        disabled={value <= min}
        style={({ pressed }) => [
          styles.button,
          pressed && { opacity: 0.7 },
          value <= min && { opacity: 0.4 },
        ]}
      >
        <Minus size={20} color={colors.primary} />
      </Pressable>
      <TextInput
        style={styles.input}
        value={String(value)}
        onChangeText={handleChange}
        keyboardType="numeric"
        textAlign="center"
        writingDirection="ltr"
        selectTextOnFocus
      />
      <Pressable
        onPress={increment}
        activeOpacity={0.7}
        disabled={value >= max}
        style={({ pressed }) => [
          styles.button,
          pressed && { opacity: 0.7 },
          value >= max && { opacity: 0.4 },
        ]}
      >
        <Plus size={20} color={colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: 80,
    height: 48,
    fontFamily: 'Cairo-Bold',
    fontSize: 22,
    color: colors.text,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    writingDirection: 'ltr',
    textAlign: 'center',
  },
});