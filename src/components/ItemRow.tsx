import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { Item, StockStatus } from '@/types';

interface ItemRowProps {
  item: Item;
  status: StockStatus;
  onPress: () => void;
}

const statusColors: Record<StockStatus, string> = {
  available: colors.success,
  low: colors.warning,
  out: colors.error,
};

const statusLabels: Record<StockStatus, string> = {
  available: 'متوفر',
  low: 'منخفض',
  out: 'غير متوفر',
};

export function ItemRow({ item, status, onPress }: ItemRowProps) {
  const color = statusColors[status];

  return (
    <Pressable
      onPress={onPress}
      activeOpacity={0.7}
      style={({ pressed }) => [
        styles.container,
        pressed && { opacity: 0.9 },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.nameAr}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>الرف: {item.locationCode}</Text>
          </View>
          <Text style={styles.statusText}>{statusLabels[status]}</Text>
        </View>
      </View>
      <View style={styles.quantityBox}>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <Text style={styles.unit}>{item.unit}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  info: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 4,
  },
  name: {
    fontFamily: 'Cairo-Bold',
    fontSize: 15,
    color: colors.text,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  metaRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    backgroundColor: colors.divider,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  chipText: {
    fontFamily: 'Cairo-Medium',
    fontSize: 12,
    color: colors.textSecondary,
    writingDirection: 'rtl',
  },
  statusText: {
    fontFamily: 'Cairo-Regular',
    fontSize: 12,
    color: colors.textTertiary,
  },
  quantityBox: {
    alignItems: 'center',
    minWidth: 60,
  },
  quantity: {
    fontFamily: 'Cairo-Bold',
    fontSize: 22,
    color: colors.text,
    writingDirection: 'ltr',
  },
  unit: {
    fontFamily: 'Cairo-Regular',
    fontSize: 11,
    color: colors.textTertiary,
  },
});