let counter = 0;

export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  counter = (counter + 1) % 1000;
  return `${timestamp}-${random}-${counter.toString(36).padStart(3, '0')}`;
}

export async function generateReceiptNumber(
  loadSeq: () => Promise<number | null>,
  saveSeq: (n: number) => Promise<void>,
): Promise<string> {
  let seq = await loadSeq();
  if (seq == null) {
    seq = 1000;
  } else {
    seq += 1;
  }
  await saveSeq(seq);
  return `MIV-${seq}`;
}

export function generateItemCode(
  categoryAbbr: string,
  brandAbbr: string,
  existingCount: number,
): string {
  const seq = String(existingCount + 1).padStart(3, '0');
  return `${categoryAbbr}-${brandAbbr}-${seq}`;
}

export function getBrandAbbr(brand: string): string {
  if (!brand) return 'GEN';
  const parts = brand.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return brand.substring(0, 3).toUpperCase();
}