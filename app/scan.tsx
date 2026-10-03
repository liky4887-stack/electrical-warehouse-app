import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X } from 'lucide-react-native';
import { useStore } from '@/store';
import { colors } from '@/theme/colors';

const { width: screenW } = Dimensions.get('window');
const scanSize = Math.min(screenW * 0.65, 280);

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const getItemByBarcode = useStore((s) => s.getItemByBarcode);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = (data: string) => {
    if (scanned) return;
    setScanned(true);
    const item = getItemByBarcode(data);
    if (item) {
      router.replace(`/item/${item.id}`);
    } else {
      Alert.alert('تنبيه', 'القطعة غير مسجلة', [
        { text: 'حسنا', onPress: () => setScanned(false) },
      ]);
    }
  };

  if (!permission || !permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera permission is required to scan barcodes</Text>
        <Pressable onPress={requestPermission} style={styles.permissionBtn}>
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeText}>Cancel</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'code128', 'code39', 'ean13'],
        }}
        onBarcodeScanned={(event) => handleBarCodeScanned(event.data)}
      />

      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} activeOpacity={0.7} style={styles.closeCircle}>
            <X size={24} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.scanArea}>
          <View style={[styles.corner, styles.cornerTopRight]} />
          <View style={[styles.corner, styles.cornerTopLeft]} />
          <View style={[styles.corner, styles.cornerBottomRight]} />
          <View style={[styles.corner, styles.cornerBottomLeft]} />
        </View>

        <View style={styles.bottomBar}>
          <Text style={styles.bottomText}>وجّه الكاميرا نحو الباركود</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  permissionContainer: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 },
  permissionText: { fontFamily: 'Cairo-Regular', fontSize: 16, color: colors.text, textAlign: 'center', writingDirection: 'rtl' },
  permissionBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 14 },
  permissionBtnText: { fontFamily: 'Cairo-Bold', fontSize: 15, color: '#FFFFFF' },
  closeBtn: { padding: 8 },
  closeText: { fontFamily: 'Cairo-Regular', fontSize: 14, color: colors.textSecondary },
  overlay: { flex: 1, justifyContent: 'space-between' },
  topBar: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8 },
  closeCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  scanArea: { width: scanSize, height: scanSize, alignSelf: 'center', justifyContent: 'center' },
  corner: { position: 'absolute', width: 32, height: 32, borderColor: colors.primary, borderWidth: 3 },
  cornerTopRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 12 },
  cornerTopLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 12 },
  cornerBottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 12 },
  cornerBottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 12 },
  bottomBar: { alignItems: 'center', paddingBottom: 32 },
  bottomText: { fontFamily: 'Cairo-Medium', fontSize: 15, color: '#FFFFFF', writingDirection: 'rtl', backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
});