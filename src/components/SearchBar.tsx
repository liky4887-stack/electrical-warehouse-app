import React from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Search, Camera } from 'lucide-react-native';
import { colors } from '@/theme/colors';

interface SearchBarProps {
  value: string;
  onChangeText: (t: string) => void;
  onScanPress: () => void;
}

export function SearchBar({ value, onChangeText, onScanPress }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <Search size={20} color={colors.textTertiary} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="ابحث باسم القطعة أو الكود..."
          placeholderTextColor={colors.textTertiary}
          textAlign="right"
          writingDirection="rtl"
        />
      </View>
      <Pressable
        onPress={onScanPress}
        activeOpacity={0.7}
        style={({ pressed }) => [
          styles.scanButton,
          pressed && { opacity: 0.8 },
        ]}
      >
        <Camera size={20} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  inputRow: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    gap: 8,
  },
  input: {
    flex: 1,
    fontFamily: 'Cairo-Regular',
    fontSize: 14,
    color: colors.text,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  scanButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});