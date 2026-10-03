import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';

type Variant = 'primary' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface LiquidGlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
  testID?: string;
}

const sizeMap: Record<Size, { height: number; fontSize: number; paddingHorizontal: number }> = {
  sm: { height: 40, fontSize: 13, paddingHorizontal: 16 },
  md: { height: 48, fontSize: 15, paddingHorizontal: 24 },
  lg: { height: 56, fontSize: 16, paddingHorizontal: 32 },
};

export function LiquidGlassButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
  icon,
  testID,
}: LiquidGlassButtonProps) {
  const dims = sizeMap[size];
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={({ pressed }) => [
        styles.base,
        {
          height: dims.height,
          paddingHorizontal: dims.paddingHorizontal,
          backgroundColor: isPrimary ? colors.primary : 'transparent',
          borderWidth: isPrimary ? 0 : 1.5,
          borderColor: colors.primary,
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {icon}
      <Text
        style={[
          styles.text,
          {
            fontSize: dims.fontSize,
            color: isPrimary ? '#FFFFFF' : colors.primary,
          },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 8,
  },
  text: {
    fontFamily: 'Cairo-Bold',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});