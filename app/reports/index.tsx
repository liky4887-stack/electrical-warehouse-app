import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, Printer, TrendingDown, TrendingUp, Package, AlertTriangle } from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { GlassBackground } from '@/components/GlassBackground';
import { ScreenHeader } from '@/components/ScreenHeader';
import { LiquidGlassCard } from '@/components/LiquidGlassCard';
import { LiquidGlassButton } from '@/components/LiquidGlassButton';
import { EmptyState } from '@/components/EmptyState';
import { useStore } from '@/store';
import { buildReportHtml } from '@/lib/print';
import { colors } from '@/theme/colors';
import { Transaction } from '@/types';

type PeriodKey = 'today' | '7days' | '30days';

export default function ReportsScreen() {
  const router = useRouter();
  const transactions = useStore((s) => s.transactions);
  const getTransactionsByDateRange = useStore((s) => s.getTransactionsByDateRange);
  const getLowStockItems = useStore((s) => s.getLowStockItems);
  const [period, setPeriod] = useState<PeriodKey>('today');
  const [printing, setPrinting] = useState(false);

  const periodTransactions = useMemo(() => {
    const now = new Date();
    const to = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    let from: Date;
    if (period === 'today') {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === '7days') {
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    return getTransactionsByDateRange(from, to);
  }, [period, transactions, getTransactionsByDateRange]);

  const totalDispensed = periodTransactions.filter((t) => t.type === 'dispense').reduce((s, t) => s + t.quantity, 0);
  const totalReceived = periodTransactions.filter((t) => t.type === 'receive').reduce((s, t) => s + t.quantity, 0);
  const lowStockCount = getLowStockItems().length;

  const periodLabels: Record<PeriodKey, string> = {
    today: 'اليوم',
    '7days': 'آخر 7 أيام',
    '30days': 'آخر 30 يوم',
  };

  const groupedByDay = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    periodTransactions.forEach((tx) => {
      const day = new Date(tx.createdAt).toLocaleDateString('en-GB');
      if (!groups[day]) groups[day] = [];
      groups[day].push(tx);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [periodTransactions]);

  const handleExport = async () => {
    setPrinting(true);
    try {
      const html = buildReportHtml(periodTransactions, periodLabels[period]);
      const { uri } = await Print.printToFileAsync({ html });
      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'تقرير المخزن' });
      } else {
        const newPath = `${FileSystem.cacheDirectory}warehouse-report.pdf`;
        await FileSystem.copyAsync({ from: uri, to: newPath });
        await Sharing.shareAsync(newPath, { mimeType: 'application/pdf', dialogTitle: 'تقرير المخزن' });
      }
    } catch (err) {
      Alert.alert('خطأ', 'فشل في إنشاء ملف التقرير');
    } finally {
      setPrinting(false);
    }
  };

  return (
    <GlassBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader
          title="التقارير"
          showBack
          onBack={() => router.back()}
          rightIcon={<ArrowRight size={24} color={colors.text} />}
        />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.periodRow}>
            {(Object.keys(periodLabels) as PeriodKey[]).map((key) => (
              <Pressable
                key={key}
                onPress={() => setPeriod(key)}
                activeOpacity={0.7}
                style={[styles.periodChip, period === key && styles.periodChipActive]}
              >
                <Text style={[styles.periodChipText, period === key && styles.periodChipTextActive]}>
                  {periodLabels[key]}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.statsGrid}>
            <StatCard icon={<Package size={20} color={colors.primary} />} label="إجمالي العمليات" value={String(periodTransactions.length)} tint={colors.primary} />
            <StatCard icon={<TrendingDown size={20} color={colors.warning} />} label="إجمالي المصروف" value={String(totalDispensed)} tint={colors.warning} />
            <StatCard icon={<TrendingUp size={20} color={colors.success} />} label="إجمالي الوارد" value={String(totalReceived)} tint={colors.success} />
            <StatCard icon={<AlertTriangle size={20} color={colors.error} />} label="نواقص المخزون" value={String(lowStockCount)} tint={colors.error} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>سجل العمليات</Text>
            {periodTransactions.length === 0 ? (
              <EmptyState message="لا توجد عمليات في هذه الفترة" />
            ) : (
              groupedByDay.map(([day, txs]) => (
                <View key={day} style={styles.dayGroup}>
                  <Text style={styles.dayHeader}>{day}</Text>
                  {txs.map((tx) => (
                    <TransactionRow key={tx.id} tx={tx} />
                  ))}
                </View>
              ))
            )}
          </View>

          <LiquidGlassButton
            title={printing ? 'جاري الإنشاء...' : 'تصدير PDF'}
            onPress={handleExport}
            variant="primary"
            size="lg"
            disabled={printing || periodTransactions.length === 0}
            icon={<Printer size={20} color="#FFFFFF" />}
            style={styles.exportBtn}
          />
        </ScrollView>
      </SafeAreaView>
    </GlassBackground>
  );
}

function StatCard({ icon, label, value, tint }: { icon: React.ReactNode; label: string; value: string; tint: string }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: tint + '18' }]}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const time = new Date(tx.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const isDispense = tx.type === 'dispense';
  return (
    <View style={styles.txRow}>
      <View style={[styles.txTypeDot, { backgroundColor: isDispense ? colors.warning : colors.success }]} />
      <View style={styles.txInfo}>
        <Text style={styles.txReceipt}>{tx.receiptNumber}</Text>
        <Text style={styles.txItem}>{tx.itemNameAr}</Text>
        <Text style={styles.txRecipient}>{tx.recipientName}</Text>
      </View>
      <View style={styles.txRight}>
        <Text style={[styles.txQty, { color: isDispense ? colors.warning : colors.success }]}>
          {isDispense ? '-' : '+'}{tx.quantity}
        </Text>
        <Text style={styles.txTime}>{time}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  periodRow: { flexDirection: 'row-reverse', gap: 8, marginBottom: 20 },
  periodChip: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  periodChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  periodChipText: { fontFamily: 'Cairo-Medium', fontSize: 13, color: colors.textSecondary, writingDirection: 'rtl' },
  periodChipTextActive: { color: '#FFFFFF' },
  statsGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: { width: '48%', backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 14, alignItems: 'center', gap: 6, flexBasis: '48%' },
  statIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontFamily: 'Cairo-Bold', fontSize: 24, color: colors.text, writingDirection: 'ltr' },
  statLabel: { fontFamily: 'Cairo-Regular', fontSize: 12, color: colors.textSecondary, writingDirection: 'rtl', textAlign: 'center' },
  section: { marginBottom: 20 },
  sectionLabel: { fontFamily: 'Cairo-Medium', fontSize: 14, color: colors.textSecondary, writingDirection: 'rtl', marginBottom: 12 },
  dayGroup: { marginBottom: 16 },
  dayHeader: { fontFamily: 'Cairo-Bold', fontSize: 14, color: colors.text, writingDirection: 'ltr', marginBottom: 8, backgroundColor: colors.divider, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start' },
  txRow: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 12, gap: 10, marginBottom: 8 },
  txTypeDot: { width: 8, height: 8, borderRadius: 4 },
  txInfo: { flex: 1, alignItems: 'flex-end', gap: 2 },
  txReceipt: { fontFamily: 'Cairo-Bold', fontSize: 13, color: colors.text, writingDirection: 'ltr' },
  txItem: { fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary, writingDirection: 'rtl', textAlign: 'right' },
  txRecipient: { fontFamily: 'Cairo-Regular', fontSize: 11, color: colors.textTertiary, writingDirection: 'rtl' },
  txRight: { alignItems: 'center', minWidth: 50 },
  txQty: { fontFamily: 'Cairo-Bold', fontSize: 18, writingDirection: 'ltr' },
  txTime: { fontFamily: 'Cairo-Regular', fontSize: 11, color: colors.textTertiary, writingDirection: 'ltr' },
  exportBtn: { marginTop: 8 },
});