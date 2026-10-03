import { create } from 'zustand';
import { Item, Transaction, Shelf, Box, StockStatus } from '@/types';
import { SEED_SHELVES, SEED_BOXES, SEED_ITEMS, DEFAULT_OPERATOR } from '@/lib/seed';
import {
  loadJSON,
  saveJSON,
  loadString,
  saveString,
  loadNumber,
  saveNumber,
  StorageKeys,
} from '@/lib/storage';
import { generateId, generateReceiptNumber, generateItemCode, getBrandAbbr } from '@/lib/id';
import { CATEGORY_ABBR } from '@/types';

interface WarehouseState {
  items: Item[];
  transactions: Transaction[];
  shelves: Shelf[];
  boxes: Box[];
  loaded: boolean;
  operatorName: string;

  init: () => Promise<void>;
  addItem: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Item>;
  updateItem: (id: string, patch: Partial<Item>) => Promise<void>;
  dispenseItem: (itemId: string, qty: number, recipient: string, notes?: string) => Promise<Transaction>;
  receiveItem: (itemId: string, qty: number, notes?: string) => Promise<Transaction>;
  getItemById: (id: string) => Item | undefined;
  getItemByBarcode: (barcode: string) => Item | undefined;
  getItemsByShelf: (shelfCode: string) => Item[];
  getLowStockItems: () => Item[];
  getRecentItems: (limit: number) => Item[];
  searchItems: (query: string) => Item[];
  getTransactionsByDateRange: (from: Date, to: Date) => Transaction[];
  getStockStatus: (item: Item) => StockStatus;
  markPrinted: (transactionId: string) => void;
  setOperatorName: (name: string) => void;
  persistItems: () => Promise<void>;
  persistTransactions: () => Promise<void>;
}

export const useStore = create<WarehouseState>((set, get) => ({
  items: [],
  transactions: [],
  shelves: SEED_SHELVES,
  boxes: SEED_BOXES,
  loaded: false,
  operatorName: DEFAULT_OPERATOR,

  init: async () => {
    const initialized = await loadString(StorageKeys.INITIALIZED);
    if (!initialized) {
      await saveJSON(StorageKeys.ITEMS, SEED_ITEMS);
      await saveJSON(StorageKeys.TRANSACTIONS, []);
      await saveString(StorageKeys.INITIALIZED, '1');
      await saveString(StorageKeys.OPERATOR_NAME, DEFAULT_OPERATOR);
      set({ items: SEED_ITEMS, transactions: [], loaded: true, operatorName: DEFAULT_OPERATOR });
    } else {
      const items = await loadJSON<Item[]>(StorageKeys.ITEMS);
      const transactions = await loadJSON<Transaction[]>(StorageKeys.TRANSACTIONS);
      const operator = await loadString(StorageKeys.OPERATOR_NAME);
      set({
        items: items ?? [],
        transactions: transactions ?? [],
        operatorName: operator ?? DEFAULT_OPERATOR,
        loaded: true,
      });
    }
  },

  addItem: async (itemData) => {
    const state = get();
    const now = new Date().toISOString();
    const abbr = CATEGORY_ABBR[itemData.category] ?? 'MISC';
    const brandAbbr = getBrandAbbr(itemData.brandAr ?? '');
    const countInCategory = state.items.filter((i) => i.code.startsWith(`${abbr}-`)).length;
    const code = generateItemCode(abbr, brandAbbr, countInCategory);

    const newItem: Item = {
      ...itemData,
      id: generateId(),
      code,
      createdAt: now,
      updatedAt: now,
    };

    const items = [...state.items, newItem];
    set({ items });
    await saveJSON(StorageKeys.ITEMS, items);
    return newItem;
  },

  updateItem: async (id, patch) => {
    const state = get();
    const items = state.items.map((i) =>
      i.id === id ? { ...i, ...patch, updatedAt: new Date().toISOString() } : i,
    );
    set({ items });
    await saveJSON(StorageKeys.ITEMS, items);
  },

  dispenseItem: async (itemId, qty, recipient, notes) => {
    const state = get();
    const item = state.items.find((i) => i.id === itemId);
    if (!item) throw new Error('Item not found');
    if (qty > item.quantity) throw new Error('Quantity exceeds available stock');

    const receiptNumber = await generateReceiptNumber(
      () => loadNumber(StorageKeys.RECEIPT_SEQ),
      (n) => saveNumber(StorageKeys.RECEIPT_SEQ, n),
    );

    const balanceAfter = item.quantity - qty;
    const now = new Date().toISOString();

    const transaction: Transaction = {
      id: generateId(),
      receiptNumber,
      itemId: item.id,
      itemNameAr: item.nameAr,
      itemCode: item.code,
      itemUnit: item.unit,
      itemLocationCode: item.locationCode,
      type: 'dispense',
      quantity: qty,
      balanceAfter,
      recipientName: recipient,
      operatorName: state.operatorName,
      notes,
      createdAt: now,
      printedAt: null,
    };

    const items = state.items.map((i) =>
      i.id === itemId
        ? { ...i, quantity: balanceAfter, updatedAt: now }
        : i,
    );
    const transactions = [transaction, ...state.transactions];

    set({ items, transactions });
    await saveJSON(StorageKeys.ITEMS, items);
    await saveJSON(StorageKeys.TRANSACTIONS, transactions);
    return transaction;
  },

  receiveItem: async (itemId, qty, notes) => {
    const state = get();
    const item = state.items.find((i) => i.id === itemId);
    if (!item) throw new Error('Item not found');

    const receiptNumber = await generateReceiptNumber(
      () => loadNumber(StorageKeys.RECEIPT_SEQ),
      (n) => saveNumber(StorageKeys.RECEIPT_SEQ, n),
    );

    const balanceAfter = item.quantity + qty;
    const now = new Date().toISOString();

    const transaction: Transaction = {
      id: generateId(),
      receiptNumber,
      itemId: item.id,
      itemNameAr: item.nameAr,
      itemCode: item.code,
      itemUnit: item.unit,
      itemLocationCode: item.locationCode,
      type: 'receive',
      quantity: qty,
      balanceAfter,
      recipientName: '-',
      operatorName: state.operatorName,
      notes,
      createdAt: now,
      printedAt: null,
    };

    const items = state.items.map((i) =>
      i.id === itemId ? { ...i, quantity: balanceAfter, updatedAt: now } : i,
    );
    const transactions = [transaction, ...state.transactions];

    set({ items, transactions });
    await saveJSON(StorageKeys.ITEMS, items);
    await saveJSON(StorageKeys.TRANSACTIONS, transactions);
    return transaction;
  },

  getItemById: (id) => get().items.find((i) => i.id === id),
  getItemByBarcode: (barcode) => get().items.find((i) => i.barcode === barcode),
  getItemsByShelf: (shelfCode) => get().items.filter((i) => i.locationCode.startsWith(shelfCode)),
  getLowStockItems: () => get().items.filter((i) => i.quantity <= i.minQuantity),
  getRecentItems: (limit) =>
    [...get().items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, limit),
  searchItems: (query) => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return get().items.filter(
      (i) =>
        i.nameAr.toLowerCase().includes(q) ||
        i.code.toLowerCase().startsWith(q) ||
        i.locationCode.toLowerCase() === q ||
        i.brandAr?.toLowerCase().includes(q),
    );
  },
  getTransactionsByDateRange: (from, to) => {
    const fromMs = from.getTime();
    const toMs = to.getTime();
    return get()
      .transactions.filter((t) => {
        const tMs = new Date(t.createdAt).getTime();
        return tMs >= fromMs && tMs <= toMs;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  getStockStatus: (item) => {
    if (item.quantity === 0) return 'out';
    if (item.quantity <= item.minQuantity) return 'low';
    return 'available';
  },
  markPrinted: (transactionId) => {
    const state = get();
    const transactions = state.transactions.map((t) =>
      t.id === transactionId ? { ...t, printedAt: new Date().toISOString() } : t,
    );
    set({ transactions });
    saveJSON(StorageKeys.TRANSACTIONS, transactions);
  },
  setOperatorName: (name) => {
    set({ operatorName: name });
    saveString(StorageKeys.OPERATOR_NAME, name);
  },
  persistItems: async () => {
    await saveJSON(StorageKeys.ITEMS, get().items);
  },
  persistTransactions: async () => {
    await saveJSON(StorageKeys.TRANSACTIONS, get().transactions);
  },
}));