import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { I18nManager, View, ActivityIndicator, StyleSheet } from 'react-native';
import {
  useFonts,
  Cairo_400Regular,
  Cairo_500Medium,
  Cairo_700Bold,
} from '@expo-google-fonts/cairo';
import { useStore } from '@/store';
import { colors } from '@/theme/colors';

SplashScreen.preventAutoHideAsync().catch(() => {});

I18nManager.forceRTL(true);

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Cairo-Regular': Cairo_400Regular,
    'Cairo-Medium': Cairo_500Medium,
    'Cairo-Bold': Cairo_700Bold,
  });

  const init = useStore((s) => s.init);
  const loaded = useStore((s) => s.loaded);
  const [initStarted, setInitStarted] = useState(false);

  useEffect(() => {
    if (fontsLoaded && !initStarted) {
      setInitStarted(true);
      init();
    }
  }, [fontsLoaded, initStarted, init]);

  useEffect(() => {
    if (fontsLoaded && loaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, loaded]);

  if (!fontsLoaded || !loaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="scan" options={{ presentation: 'modal' }} />
      <Stack.Screen name="item/[id]" />
      <Stack.Screen name="item/new" />
      <Stack.Screen name="confirm/[transactionId]" />
      <Stack.Screen name="reports/index" />
      <Stack.Screen name="shelves/[code]" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});