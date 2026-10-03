import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { StockStatus } from '@/types';

interface StatusBadgeProps {
  status: StockStatus;
}

const config: Record<StockStatus, { color: string; label: string }> = {
  available: { color: colors.success, label: 'متوفر' },
  low: { color: colors.warning, label: 'منخفض' },
  out: { color: colors.error, label: 'غير متوفر' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { color, label } = config[status];
  return (
    <View style={[styles.badge, { backgroundColor: color + '18' }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    fontFamily: 'Cairo-Medium',
    fontSize: 13,
    writingDirection: 'rtl',
  },
});