import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/theme/colors';

interface GlassBackgroundProps {
  children: React.ReactNode;
}

export function GlassBackground({ children }: GlassBackgroundProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.bg, colors.surfaceElevated, colors.bg]}
        locations={[0, 0.4, 1]}
        style={styles.gradient}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
  },
});