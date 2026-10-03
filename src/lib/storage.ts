import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ITEMS: '@warehouse_items',
  TRANSACTIONS: '@warehouse_transactions',
  INITIALIZED: '@warehouse_initialized',
  OPERATOR_NAME: '@warehouse_operator_name',
  RECEIPT_SEQ: '@warehouse_receipt_seq',
} as const;

export const StorageKeys = KEYS;

export async function loadJSON<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function saveJSON(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // silent fail
  }
}

export async function loadString(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function saveString(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    // silent fail
  }
}

export async function loadNumber(key: string): Promise<number | null> {
  const raw = await loadString(key);
  if (raw == null) return null;
  const n = parseInt(raw, 10);
  return isNaN(n) ? null : n;
}

export async function saveNumber(key: string, value: number): Promise<void> {
  await saveString(key, String(value));
}