import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, Settings, Home, PackagePlus, FileText } from 'lucide-react-native';
import { GlassBackground } from '@/components/GlassBackground';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchBar } from '@/components/SearchBar';
import { ShelfCard } from '@/components/ShelfCard';
import { ItemRow } from '@/components/ItemRow';
import { EmptyState } from '@/components/EmptyState';
import { useStore } from '@/store';
import { colors } from '@/theme/colors';

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const items = useStore((s) => s.items);
  const shelves = useStore((s) => s.shelves);
  const searchItems = useStore((s) => s.searchItems);
  const getRecentItems = useStore((s) => s.getRecentItems);
  const getLowStockItems = useStore((s) => s.getLowStockItems);
  const getItemsByShelf = useStore((s) => s.getItemsByShelf);
  const getStockStatus = useStore((s) => s.getStockStatus);

  const searchResults = useMemo(() => (search ? searchItems(search) : []), [search, searchItems]);
  const recentItems = useMemo(() => getRecentItems(8), [items, getRecentItems]);
  const lowStock = useMemo(() => getLowStockItems(), [items, getLowStockItems]);

  const displayItems = search ? searchResults : [...lowStock, ...recentItems.filter((i) => !lowStock.includes(i))].slice(0, 8);

  return (
    <GlassBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ScreenHeader
            title="مخزن الكهربائيات - رئيسي"
            rightIcon={<Menu size={24} color={colors.text} />}
            leftIcon={<Settings size={22} color={colors.text} />}
          />

          <View style={styles.searchContainer}>
            <SearchBar
              value={search}
              onChangeText={setSearch}
              onScanPress={() => router.push('/scan')}
            />
          </View>

          {search ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>نتائج البحث ({searchResults.length})</Text>
              {searchResults.length === 0 ? (
                <EmptyState message="لا توجد نتائج" />
              ) : (
                <View style={styles.listColumn}>
                  {searchResults.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      status={getStockStatus(item)}
                      onPress={() => router.push(`/item/${item.id}`)}
                    />
                  ))}
                </View>
              )}
            </View>
          ) : (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>تصفح حسب الرف/القسم</Text>
                <View style={styles.grid}>
                  {shelves.map((shelf) => (
                    <ShelfCard
                      key={shelf.code}
                      shelf={shelf}
                      itemCount={getItemsByShelf(shelf.code).length}
                      onPress={() => router.push(`/shelves/${shelf.code}`)}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>أحدث القطع / النواقص</Text>
                {displayItems.length === 0 ? (
                  <EmptyState message="لا توجد قطع لعرضها" />
                ) : (
                  <View style={styles.listColumn}>
                    {displayItems.map((item) => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        status={getStockStatus(item)}
                        onPress={() => router.push(`/item/${item.id}`)}
                      />
                    ))}
                  </View>
                )}
              </View>
            </>
          )}
        </ScrollView>

        <View style={styles.tabBar}>
          <TabItem icon={<Home size={22} color={colors.primary} />} label="الرئيسية" active />
          <TabItem
            icon={<PackagePlus size={22} color={colors.textSecondary} />}
            label="إضافة"
            onPress={() => router.push('/item/new')}
          />
          <TabItem
            icon={<FileText size={22} color={colors.textSecondary} />}
            label="التقارير"
            onPress={() => router.push('/reports')}
          />
        </View>
      </SafeAreaView>
    </GlassBackground>
  );
}

function TabItem({
  icon,
  label,
  active,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} activeOpacity={0.7} style={styles.tabItem}>
      {icon}
      <Text style={[styles.tabLabel, active && { color: colors.primary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  searchContainer: { marginTop: 8, marginBottom: 18 },
  section: { marginBottom: 18 },
  sectionLabel: { fontFamily: 'Cairo-Medium', fontSize: 14, color: colors.textSecondary, textAlign: 'right', writingDirection: 'rtl', marginBottom: 12 },
  grid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12 },
  listColumn: { gap: 10 },
  tabBar: { flexDirection: 'row-reverse', justifyContent: 'space-around', alignItems: 'center', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 8, paddingBottom: 12 },
  tabItem: { alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 16 },
  tabLabel: { fontFamily: 'Cairo-Medium', fontSize: 12, color: colors.textSecondary, writingDirection: 'rtl' },
});