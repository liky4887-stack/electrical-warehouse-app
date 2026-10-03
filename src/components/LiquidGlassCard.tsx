import React from 'react';
import {
  View,
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '@/theme/colors';

interface LiquidGlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  selected?: boolean;
  onPress?: () => void;
  testID?: string;
}

export function LiquidGlassCard({
  children,
  style,
  selected,
  onPress,
  testID,
}: LiquidGlassCardProps) {
  const baseStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: selected ? 1.5 : 1,
    borderColor: selected ? colors.primary : colors.border,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  };

  if (onPress) {
    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        activeOpacity={0.7}
        style={({ pressed }) => [
          baseStyle,
          pressed && { opacity: 0.92 },
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View testID={testID} style={[baseStyle, style]}>
      {children}
    </View>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
  valueStyle?: TextStyle;
}

export function InfoRow({ label, value, valueStyle }: InfoRowProps) {
  return (
    <View style={infoRowStyles.row}>
      <Text style={infoRowStyles.label}>{label}</Text>
      <Text style={[infoRowStyles.value, valueStyle]}>{value}</Text>
    </View>
  );
}

const infoRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  label: {
    fontFamily: 'Cairo-Medium',
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  value: {
    fontFamily: 'Cairo-Bold',
    fontSize: 14,
    color: colors.text,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
});