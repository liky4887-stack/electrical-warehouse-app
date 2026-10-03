import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PackageSearch } from 'lucide-react-native';
import { colors } from '@/theme/colors';

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
}

export function EmptyState({ message, icon }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {icon ?? <PackageSearch size={48} color={colors.textTertiary} />}
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  message: {
    fontFamily: 'Cairo-Regular',
    fontSize: 15,
    color: colors.textTertiary,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});