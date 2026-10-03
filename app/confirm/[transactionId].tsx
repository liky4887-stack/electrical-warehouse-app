import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle, Printer, Home } from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { GlassBackground } from '@/components/GlassBackground';
import { ScreenHeader } from '@/components/ScreenHeader';
import { LiquidGlassCard } from '@/components/LiquidGlassCard';
import { LiquidGlassButton } from '@/components/LiquidGlassButton';
import { useStore } from '@/store';
import { buildReceiptHtml } from '@/lib/print';
import { colors } from '@/theme/colors';

export default function ConfirmScreen() {
  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
  const router = useRouter();
  const transaction = useStore((s) => s.transactions.find((t) => t.id === transactionId));
  const item = useStore((s) => s.getItemById(transaction?.itemId ?? ''));
  const markPrinted = useStore((s) => s.markPrinted);
  const [printing, setPrinting] = useState(false);

  if (!transaction || !item) {
    return (
      <GlassBackground>
        <SafeAreaView style={styles.safe} edges={['top']}>
          <ScreenHeader title="تأكيد العملية" showBack onBack={() => router.replace('/')} />
          <View style={styles.center}>
            <Text style={styles.notFound}>العملية غير موجودة</Text>
          </View>
        </SafeAreaView>
      </GlassBackground>
    );
  }

  const dateObj = new Date(transaction.createdAt);
  const dateStr = dateObj.toLocaleString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = async () => {
    setPrinting(true);
    try {
      const html = buildReceiptHtml(transaction, item);
      const { uri } = await Print.printToFileAsync({ html });
      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'إذن الصرف' });
      } else {
        const newPath = `${FileSystem.cacheDirectory}${transaction.receiptNumber}.pdf`;
        await FileSystem.copyAsync({ from: uri, to: newPath });
        await Sharing.shareAsync(newPath, { mimeType: 'application/pdf', dialogTitle: 'إذن الصرف' });
      }
      markPrinted(transaction.id);
    } catch (err) {
      Alert.alert('خطأ', 'فشل في إنشاء ملف الطباعة');
    } finally {
      setPrinting(false);
    }
  };

  return (
    <GlassBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.successIconContainer}>
            <View style={styles.successCircle}>
              <CheckCircle size={48} color={colors.success} />
            </View>
            <Text style={styles.successTitle}>تمت عملية الصرف بنجاح</Text>
          </View>

          <LiquidGlassCard style={styles.summaryCard}>
            <Text style={styles.cardTitle}>ملخص العملية</Text>

            <View style={styles.row}>
              <Text style={styles.rowLabel}>رقم الإذن</Text>
              <Text style={styles.rowValueLtr}>#{transaction.receiptNumber}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>القطعة</Text>
              <Text style={styles.rowValue}>{item.nameAr}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>الموقع</Text>
              <Text style={styles.rowValueLtr}>{item.locationCode}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>الكمية المسحوبة</Text>
              <Text style={styles.rowValueLtr}>{transaction.quantity} {item.unit}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>المتبقي في الرف {item.locationCode}</Text>
              <Text style={styles.rowValueLtr}>{transaction.balanceAfter} {item.unit}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>المستلم</Text>
              <Text style={styles.rowValue}>{transaction.recipientName}</Text>
            </View>
            <View style={styles.rowNoBorder}>
              <Text style={styles.rowLabel}>التاريخ والوقت</Text>
              <Text style={styles.rowValueLtr}>{dateStr}</Text>
            </View>
          </LiquidGlassCard>

          <View style={styles.actions}>
            <LiquidGlassButton
              title={printing ? 'جاري الإنشاء...' : 'طباعة إذن الصرف (MIV)'}
              onPress={handlePrint}
              variant="primary"
              size="lg"
              disabled={printing}
              icon={<Printer size={20} color="#FFFFFF" />}
            />
            <LiquidGlassButton
              title="العودة للرئيسية"
              onPress={() => router.replace('/')}
              variant="outline"
              size="lg"
              icon={<Home size={20} color={colors.primary} />}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { fontFamily: 'Cairo-Regular', fontSize: 16, color: colors.textSecondary },
  successIconContainer: { alignItems: 'center', marginTop: 24, marginBottom: 24, gap: 12 },
  successCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.success + '26', alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontFamily: 'Cairo-Bold', fontSize: 20, color: colors.text, writingDirection: 'rtl' },
  summaryCard: { marginBottom: 24 },
  cardTitle: { fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.text, textAlign: 'right', writingDirection: 'rtl', marginBottom: 16 },
  row: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.divider },
  rowNoBorder: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  rowLabel: { fontFamily: 'Cairo-Medium', fontSize: 14, color: colors.textSecondary, writingDirection: 'rtl' },
  rowValue: { fontFamily: 'Cairo-Bold', fontSize: 14, color: colors.text, writingDirection: 'rtl', textAlign: 'left', flexShrink: 1 },
  rowValueLtr: { fontFamily: 'Cairo-Bold', fontSize: 14, color: colors.text, writingDirection: 'ltr', textAlign: 'left' },
  actions: { gap: 12 },
});