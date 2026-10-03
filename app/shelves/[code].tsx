import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';
import { GlassBackground } from '@/components/GlassBackground';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ItemRow } from '@/components/ItemRow';
import { EmptyState } from '@/components/EmptyState';
import { useStore } from '@/store';
import { colors } from '@/theme/colors';

export default function ShelfDetailScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const shelves = useStore((s) => s.shelves);
  const getItemsByShelf = useStore((s) => s.getItemsByShelf);
  const getStockStatus = useStore((s) => s.getStockStatus);

  const shelf = useMemo(() => shelves.find((s) => s.code === code), [shelves, code]);
  const items = useMemo(() => getItemsByShelf(code), [code, getItemsByShelf]);

  return (
    <GlassBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader
          title={shelf ? `${shelf.nameAr} - ${shelf.descriptionAr}` : 'الرف'}
          showBack
          onBack={() => router.back()}
          rightIcon={<ArrowRight size={24} color={colors.text} />}
        />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.countText}>{items.length} قطعة في هذا الرف</Text>
          {items.length === 0 ? (
            <EmptyState message="لا توجد قطع في هذا الرف" />
          ) : (
            <View style={styles.list}>
              {items.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  status={getStockStatus(item)}
                  onPress={() => router.push(`/item/${item.id}`)}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  countText: { fontFamily: 'Cairo-Medium', fontSize: 14, color: colors.textSecondary, writingDirection: 'rtl', marginBottom: 16 },
  list: { gap: 10 },
});