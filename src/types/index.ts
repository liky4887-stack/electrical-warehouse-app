export interface Shelf {
  code: string;
  nameAr: string;
  descriptionAr: string;
  color: string;
}

export interface Box {
  locationCode: string;
  shelfCode: string;
  boxNumber: number;
  descriptionAr: string;
}

export interface Item {
  id: string;
  code: string;
  nameAr: string;
  brandAr?: string;
  category: string;
  locationCode: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  barcode?: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'dispense' | 'receive' | 'adjust';

export interface Transaction {
  id: string;
  receiptNumber: string;
  itemId: string;
  itemNameAr: string;
  itemCode: string;
  itemUnit: string;
  itemLocationCode: string;
  type: TransactionType;
  quantity: number;
  balanceAfter: number;
  recipientName: string;
  operatorName: string;
  notes?: string;
  createdAt: string;
  printedAt: string | null;
}

export type StockStatus = 'available' | 'low' | 'out';

export const CATEGORIES = [
  'قواطع',
  'كوابل',
  'إضاءة',
  'محولات',
  'مستلزمات',
  'أخرى',
] as const;

export const UNITS = ['قطعة', 'متر', 'علبة', 'كيلوغرام'] as const;

export const CATEGORY_ABBR: Record<string, string> = {
  'قواطع': 'CIR',
  'كوابل': 'CBL',
  'إضاءة': 'LIT',
  'محولات': 'TRF',
  'مستلزمات': 'SUP',
  'أخرى': 'MISC',
};