import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  onRightPress?: () => void;
  onLeftPress?: () => void;
}

export function ScreenHeader({
  title,
  showBack,
  onBack,
  rightIcon,
  leftIcon,
  onRightPress,
  onLeftPress,
}: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {showBack ? (
          <Pressable onPress={onBack} activeOpacity={0.7} style={styles.iconButton}>
            {rightIcon}
          </Pressable>
        ) : (
          rightIcon && (
            <Pressable onPress={onRightPress} activeOpacity={0.7} style={styles.iconButton}>
              {rightIcon}
            </Pressable>
          )
        )}
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.side}>
        {leftIcon && (
          <Pressable onPress={onLeftPress} activeOpacity={0.7} style={styles.iconButton}>
            {leftIcon}
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
  },
  side: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontFamily: 'Cairo-Bold',
    fontSize: 20,
    color: colors.text,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  iconButton: {
    padding: 8,
  },
});