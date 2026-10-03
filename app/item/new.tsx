import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, Camera, Check } from 'lucide-react-native';
import { GlassBackground } from '@/components/GlassBackground';
import { ScreenHeader } from '@/components/ScreenHeader';
import { LiquidGlassCard } from '@/components/LiquidGlassCard';
import { LiquidGlassButton } from '@/components/LiquidGlassButton';
import { useStore } from '@/store';
import { colors } from '@/theme/colors';
import { CATEGORIES, UNITS } from '@/types';

export default function AddItemScreen() {
  const router = useRouter();
  const addItem = useStore((s) => s.addItem);
  const shelves = useStore((s) => s.shelves);
  const boxes = useStore((s) => s.boxes);

  const [nameAr, setNameAr] = useState('');
  const [brandAr, setBrandAr] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [shelfCode, setShelfCode] = useState('A');
  const [boxNumber, setBoxNumber] = useState(1);
  const [quantity, setQuantity] = useState('0');
  const [unit, setUnit] = useState<string>(UNITS[0]);
  const [minQuantity, setMinQuantity] = useState('1');
  const [barcode, setBarcode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const availableBoxes = boxes.filter((b) => b.shelfCode === shelfCode);
  const locationCode = `${shelfCode}${boxNumber}`;

  const canSave = nameAr.trim().length > 0 && !submitting;

  const handleSave = async () => {
    if (!nameAr.trim()) {
      Alert.alert('تنبيه', 'الرجاء إدخال اسم القطعة');
      return;
    }
    setSubmitting(true);
    try {
      const newItem = await addItem({
        nameAr: nameAr.trim(),
        brandAr: brandAr.trim() || undefined,
        category,
        locationCode,
        quantity: parseInt(quantity) || 0,
        minQuantity: parseInt(minQuantity) || 0,
        unit,
        barcode: barcode.trim() || undefined,
      });
      Alert.alert('تم', `تمت إضافة القطعة بنجاح. الرمز: ${newItem.code}`);
      router.back();
    } catch (err) {
      Alert.alert('خطأ', 'فشل في إضافة القطعة');
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
            title="إضافة قطعة جديدة"
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
              <Text style={styles.sectionTitle}>معلومات القطعة</Text>

              <FieldLabel label="اسم القطعة *" />
              <TextInput
                style={styles.input}
                value={nameAr}
                onChangeText={setNameAr}
                placeholder="مفتاح أوتوماتيك 16A"
                placeholderTextColor={colors.textTertiary}
                textAlign="right"
                writingDirection="rtl"
              />

              <FieldLabel label="العلامة التجارية" />
              <TextInput
                style={styles.input}
                value={brandAr}
                onChangeText={setBrandAr}
                placeholder="ABB"
                placeholderTextColor={colors.textTertiary}
                textAlign="right"
                writingDirection="rtl"
              />

              <FieldLabel label="القسم" />
              <ChipSelector
                options={[...CATEGORIES]}
                value={category}
                onChange={setCategory}
              />
            </LiquidGlassCard>

            <LiquidGlassCard style={styles.section}>
              <Text style={styles.sectionTitle}>الموقع في المخزن</Text>

              <FieldLabel label="الرف" />
              <ChipSelector
                options={shelves.map((s) => s.code)}
                value={shelfCode}
                onChange={(v) => {
                  setShelfCode(v);
                  setBoxNumber(1);
                }}
              />

              <FieldLabel label="الصندوق" />
              <ChipSelector
                options={availableBoxes.map((b) => String(b.boxNumber))}
                value={String(boxNumber)}
                onChange={(v) => setBoxNumber(parseInt(v))}
              />

              <View style={styles.locationPreview}>
                <Text style={styles.locationPreviewLabel}>رمز الموقع:</Text>
                <Text style={styles.locationPreviewValue}>{locationCode}</Text>
              </View>
            </LiquidGlassCard>

            <LiquidGlassCard style={styles.section}>
              <Text style={styles.sectionTitle}>الكمية والوحدة</Text>

              <FieldLabel label="الكمية الابتدائية" />
              <TextInput
                style={[styles.input, styles.numberInput]}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                writingDirection="ltr"
                textAlign="center"
              />

              <FieldLabel label="الوحدة" />
              <ChipSelector options={[...UNITS]} value={unit} onChange={setUnit} />

              <FieldLabel label="حد التنبيه (أقل كمية)" />
              <TextInput
                style={[styles.input, styles.numberInput]}
                value={minQuantity}
                onChangeText={setMinQuantity}
                keyboardType="numeric"
                writingDirection="ltr"
                textAlign="center"
              />
            </LiquidGlassCard>

            <LiquidGlassCard style={styles.section}>
              <Text style={styles.sectionTitle}>الباركود (اختياري)</Text>
              <View style={styles.barcodeRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={barcode}
                  onChangeText={setBarcode}
                  placeholder="6112345678901"
                  placeholderTextColor={colors.textTertiary}
                  writingDirection="ltr"
                  textAlign="left"
                />
                <Pressable
                  onPress={() => router.push('/scan')}
                  activeOpacity={0.7}
                  style={styles.scanIconBtn}
                >
                  <Camera size={20} color={colors.primary} />
                </Pressable>
              </View>
            </LiquidGlassCard>

            <LiquidGlassButton
              title="حفظ القطعة"
              onPress={handleSave}
              variant="primary"
              size="lg"
              disabled={!canSave}
              icon={<Check size={20} color="#FFFFFF" />}
              style={styles.saveBtn}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GlassBackground>
  );
}

function FieldLabel({ label }: { label: string }) {
  return <Text style={styles.fieldLabel}>{label}</Text>;
}

function ChipSelector({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.chipRow}>
      {options.map((opt) => (
        <Pressable
          key={opt}
          onPress={() => onChange(opt)}
          activeOpacity={0.7}
          style={[
            styles.chip,
            value === opt && styles.chipActive,
          ]}
        >
          <Text
            style={[
              styles.chipText,
              value === opt && styles.chipTextActive,
            ]}
          >
            {opt}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, gap: 16 },
  section: {},
  sectionTitle: { fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.text, textAlign: 'right', writingDirection: 'rtl', marginBottom: 14 },
  fieldLabel: { fontFamily: 'Cairo-Medium', fontSize: 14, color: colors.textSecondary, writingDirection: 'rtl', marginBottom: 8, marginTop: 12 },
  input: { fontFamily: 'Cairo-Regular', fontSize: 15, color: colors.text, backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, height: 48, textAlign: 'right', writingDirection: 'rtl' },
  numberInput: { maxWidth: 120, writingDirection: 'ltr' },
  chipRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: 'Cairo-Medium', fontSize: 13, color: colors.textSecondary, writingDirection: 'rtl' },
  chipTextActive: { color: '#FFFFFF' },
  locationPreview: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginTop: 16, backgroundColor: colors.primaryGlow, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  locationPreviewLabel: { fontFamily: 'Cairo-Medium', fontSize: 14, color: colors.textSecondary, writingDirection: 'rtl' },
  locationPreviewValue: { fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.primary, writingDirection: 'ltr' },
  barcodeRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  scanIconBtn: { width: 48, height: 48, borderRadius: 12, backgroundColor: colors.primaryGlow, alignItems: 'center', justifyContent: 'center' },
  saveBtn: { marginTop: 8 },
});