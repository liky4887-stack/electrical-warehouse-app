import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { Shelf } from '@/types';

interface ShelfCardProps {
  shelf: Shelf;
  itemCount: number;
  onPress: () => void;
}

export function ShelfCard({ shelf, itemCount, onPress }: ShelfCardProps) {
  return (
    <Pressable
      onPress={onPress}
      activeOpacity={0.7}
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.9 },
      ]}
    >
      <View style={[styles.accentBar, { backgroundColor: shelf.color }]} />
      <View style={styles.content}>
        <Text style={styles.name}>{shelf.nameAr}</Text>
        <Text style={styles.description}>{shelf.descriptionAr}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: shelf.color + '20' }]}>
            <Text style={[styles.badgeText, { color: shelf.color }]}>
              {itemCount} قطعة
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row-reverse',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 90,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  accentBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  name: {
    fontFamily: 'Cairo-Bold',
    fontSize: 18,
    color: colors.text,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  description: {
    fontFamily: 'Cairo-Regular',
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row-reverse',
    marginTop: 6,
  },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontFamily: 'Cairo-Medium',
    fontSize: 11,
  },
});