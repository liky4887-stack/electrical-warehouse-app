import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, Package, MapPin, BarChart3, RotateCcw } from 'lucide-react-native';
import { GlassBackground } from '@/components/GlassBackground';
import { ScreenHeader } from '@/components/ScreenHeader';
import { LiquidGlassCard } from '@/components/LiquidGlassCard';
import { LiquidGlassButton } from '@/components/LiquidGlassButton';
import { QuantityStepper } from '@/components/QuantityStepper';
import { StatusBadge } from '@/components/StatusBadge';
import { useStore } from '@/store';
import { colors } from '@/theme/colors';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const item = useStore((s) => s.getItemById(id));
  const shelves = useStore((s) => s.shelves);
  const boxes = useStore((s) => s.boxes);
  const dispenseItem = useStore((s) => s.dispenseItem);
  const getStockStatus = useStore((s) => s.getStockStatus);

  const [qty, setQty] = useState(1);
  const [recipient, setRecipient] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const shelf = useMemo(() => shelves.find((s) => item?.locationCode.startsWith(s.code)), [shelves, item]);
  const box = useMemo(() => boxes.find((b) => b.locationCode === item?.locationCode), [boxes, item]);
  const status = item ? getStockStatus(item) : 'available';

  if (!item) {
    return (
      <GlassBackground>
        <SafeAreaView style={styles.safe} edges={['top']}>
          <ScreenHeader title="تفاصيل القطعة" showBack onBack={() => router.back()} rightIcon={<ArrowRight size={24} color={colors.text} />} />
          <View style={styles.center}>
            <Text style={styles.notFound}>القطعة غير موجودة</Text>
          </View>
        </SafeAreaView>
      </GlassBackground>
    );
  }

  const canDispense = qty > 0 && qty <= item.quantity && recipient.trim().length > 0 && !submitting;

  const handleConfirm = async () => {
    if (!recipient.trim()) {
      Alert.alert('تنبيه', 'الرجاء إدخال اسم المستلم');
      return;
    }
    if (qty > item.quantity) {
      Alert.alert('تنبيه', 'الكمية المطلوبة أكبر من المتاح');
      return;
    }
    setSubmitting(true);
    try {
      const tx = await dispenseItem(item.id, qty, recipient.trim());
      router.replace(`/confirm/${tx.id}`);
    } catch (err) {
      Alert.alert('خطأ', 'فشل في تنفيذ العملية');
      setSubmitting(false);
    }
  };

  return (
    <GlassBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScreenHeader
            title="تفاصيل القطعة"
            showBack
            onBack={() => router.back()}
            rightIcon={<ArrowRight size={24} color={colors.text} />}
          />
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <LiquidGlassCard style={styles.section}>
              <View style={styles.labelRow}>
                <Package size={16} color={colors.textSecondary} />
                <Text style={styles.labelText}>اسم القطعة</Text>
              </View>
              <Text style={styles.itemName}>{item.nameAr}</Text>
              {item.brandAr ? (
                <Text style={styles.brandText}>({item.brandAr}) - {item.category}</Text>
              ) : (
                <Text style={styles.brandText}>{item.category}</Text>
              )}
            </LiquidGlassCard>

            <LiquidGlassCard style={styles.section}>
              <View style={styles.labelRow}>
                <MapPin size={16} color={colors.textSecondary} />
                <Text style={styles.labelText}>موقع القطعة في المخزن</Text>
              </View>
              <View style={styles.locationCard}>
                <View style={styles.locationItem}>
                  <Text style={styles.locationLabel}>{shelf?.nameAr ?? ''}</Text>
                  <Text style={styles.locationSub}>الرف</Text>
                </View>
                <View style={styles.locationDivider} />
                <View style={styles.locationItem}>
                  <Text style={styles.locationLabel}>{box?.descriptionAr ?? ''}</Text>
                  <Text style={styles.locationSub}>الصندوق</Text>
                </View>
              </View>
              <View style={styles.codeChip}>
                <Text style={styles.codeChipText}>رمز المكان: {item.locationCode}</Text>
              </View>
            </LiquidGlassCard>

            <LiquidGlassCard style={styles.section}>
              <View style={styles.labelRow}>
                <BarChart3 size={16} color={colors.textSecondary} />
                <Text style={styles.labelText}>حالة المخزون</Text>
              </View>
              <View style={styles.stockRow}>
                <Text style={styles.stockLabel}>الرصيد المتاح</Text>
                <View style={styles.stockValueBox}>
                  <Text style={styles.stockValue}>{item.quantity}</Text>
                  <Text style={styles.stockUnit}>{item.unit}</Text>
                </View>
              </View>
              <View style={styles.stockRow}>
                <Text style={styles.stockLabel}>حالة القطعة</Text>
                <StatusBadge status={status} />
              </View>
            </LiquidGlassCard>

            <LiquidGlassCard style={styles.section}>
              <Text style={styles.dispenseTitle}>عملية الصرف / السحب</Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>الكمية المطلوبة</Text>
                <QuantityStepper
                  value={qty}
                  onChange={setQty}
                  min={1}
                  max={item.quantity}
                />
                {qty > item.quantity && (
                  <Text style={styles.errorText}>الكمية أكبر من المتاح ({item.quantity})</Text>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>اسم المستلم / الورشة</Text>
                <TextInput
                  style={styles.textInput}
                  value={recipient}
                  onChangeText={setRecipient}
                  placeholder="ورشة الصيانة العامة"
                  placeholderTextColor={colors.textTertiary}
                  textAlign="right"
                  writingDirection="rtl"
                />
              </View>

              <LiquidGlassButton
                title="تأكيد الصرف والخصم"
                onPress={handleConfirm}
                variant="primary"
                size="lg"
                disabled={!canDispense}
                icon={<RotateCcw size={20} color="#FFFFFF" />}
                style={styles.confirmBtn}
              />
            </LiquidGlassCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, gap: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { fontFamily: 'Cairo-Regular', fontSize: 16, color: colors.textSecondary },
  section: {},
  labelRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 8 },
  labelText: { fontFamily: 'Cairo-Medium', fontSize: 14, color: colors.textSecondary, writingDirection: 'rtl' },
  itemName: { fontFamily: 'Cairo-Bold', fontSize: 24, color: colors.text, textAlign: 'right', writingDirection: 'rtl' },
  brandText: { fontFamily: 'Cairo-Regular', fontSize: 14, color: colors.textSecondary, textAlign: 'right', writingDirection: 'rtl', marginTop: 4 },
  locationCard: { flexDirection: 'row-reverse', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 12, backgroundColor: colors.surfaceElevated, borderRadius: 12, marginBottom: 10 },
  locationItem: { alignItems: 'center', gap: 2 },
  locationLabel: { fontFamily: 'Cairo-Bold', fontSize: 16, color: colors.text, writingDirection: 'rtl' },
  locationSub: { fontFamily: 'Cairo-Regular', fontSize: 12, color: colors.textTertiary, writingDirection: 'rtl' },
  locationDivider: { width: 1, height: 30, backgroundColor: colors.border },
  codeChip: { alignSelf: 'center', backgroundColor: colors.primaryGlow, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  codeChipText: { fontFamily: 'Cairo-Bold', fontSize: 16, color: colors.primary, writingDirection: 'ltr' },
  stockRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  stockLabel: { fontFamily: 'Cairo-Medium', fontSize: 14, color: colors.textSecondary, writingDirection: 'rtl' },
  stockValueBox: { flexDirection: 'row-reverse', alignItems: 'baseline', gap: 4 },
  stockValue: { fontFamily: 'Cairo-Bold', fontSize: 28, color: colors.text, writingDirection: 'ltr' },
  stockUnit: { fontFamily: 'Cairo-Regular', fontSize: 14, color: colors.textSecondary, writingDirection: 'rtl' },
  dispenseTitle: { fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.text, textAlign: 'right', writingDirection: 'rtl', marginBottom: 16 },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { fontFamily: 'Cairo-Medium', fontSize: 14, color: colors.textSecondary, writingDirection: 'rtl', marginBottom: 10 },
  textInput: { fontFamily: 'Cairo-Regular', fontSize: 15, color: colors.text, backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, height: 48, textAlign: 'right', writingDirection: 'rtl' },
  errorText: { fontFamily: 'Cairo-Regular', fontSize: 12, color: colors.error, writingDirection: 'rtl', marginTop: 6 },
  confirmBtn: { marginTop: 8 },
});