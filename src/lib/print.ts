import { Transaction, Item } from '@/types';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildReceiptHtml(tx: Transaction, item: Item): string {
  const date = new Date(tx.createdAt);
  const dateStr = date.toLocaleString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: 80mm auto; margin: 4mm; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Cairo', 'Tahoma', Arial, sans-serif;
      direction: rtl;
      text-align: right;
      margin: 0;
      padding: 0;
      color: #000;
    }
    .header {
      text-align: center;
      font-weight: bold;
      font-size: 14px;
      border-bottom: 2px dashed #000;
      padding-bottom: 8px;
      margin-bottom: 8px;
    }
    .company { font-size: 12px; color: #444; font-weight: normal; }
    .receipt-no {
      font-size: 16px;
      font-weight: bold;
      text-align: center;
      margin: 10px 0;
      direction: ltr;
    }
    .row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      font-size: 12px;
    }
    .row .label { color: #555; }
    .row .value { font-weight: bold; }
    .ltr { direction: ltr; text-align: left; }
    .divider { border-top: 1px dashed #000; margin: 8px 0; }
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 28px;
      font-size: 11px;
    }
    .sig-line {
      border-top: 1px solid #000;
      width: 38%;
      padding-top: 4px;
      text-align: center;
    }
    .footer {
      text-align: center;
      font-size: 10px;
      margin-top: 14px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>مخزن الكهربائيات</div>
    <div class="company">فياض برقن للنفط</div>
  </div>
  <div class="receipt-no">${escapeHtml(tx.receiptNumber)}</div>
  <div class="row">
    <span class="label">التاريخ:</span>
    <span class="value ltr">${dateStr}</span>
  </div>
  <div class="divider"></div>
  <div class="row">
    <span class="label">اسم القطعة:</span>
    <span class="value">${escapeHtml(item.nameAr)}</span>
  </div>
  <div class="row">
    <span class="label">الرمز:</span>
    <span class="value ltr">${escapeHtml(item.code)}</span>
  </div>
  <div class="row">
    <span class="label">الموقع:</span>
    <span class="value ltr">${escapeHtml(item.locationCode)}</span>
  </div>
  <div class="row">
    <span class="label">الكمية المسحوبة:</span>
    <span class="value ltr">${tx.quantity} ${escapeHtml(item.unit)}</span>
  </div>
  <div class="row">
    <span class="label">الرصيد المتبقي:</span>
    <span class="value ltr">${tx.balanceAfter} ${escapeHtml(item.unit)}</span>
  </div>
  <div class="divider"></div>
  <div class="row">
    <span class="label">المستلم:</span>
    <span class="value">${escapeHtml(tx.recipientName)}</span>
  </div>
  <div class="row">
    <span class="label">أمين المخزن:</span>
    <span class="value">${escapeHtml(tx.operatorName)}</span>
  </div>
  <div class="signatures">
    <div class="sig-line">توقيع المستلم</div>
    <div class="sig-line">توقيع أمين المخزن</div>
  </div>
  <div class="footer">شكراً لاستخدامك نظام مخزن الكهربائيات</div>
</body>
</html>`;
}

export function buildReportHtml(
  transactions: Transaction[],
  period: string,
): string {
  const totalDispensed = transactions
    .filter((t) => t.type === 'dispense')
    .reduce((sum, t) => sum + t.quantity, 0);
  const totalReceived = transactions
    .filter((t) => t.type === 'receive')
    .reduce((sum, t) => sum + t.quantity, 0);

  const rows = transactions
    .map((tx) => {
      const time = new Date(tx.createdAt).toLocaleString('en-GB', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
      return `<tr>
        <td style="direction:ltr">${escapeHtml(tx.receiptNumber)}</td>
        <td>${escapeHtml(tx.itemNameAr)}</td>
        <td style="direction:ltr">${escapeHtml(tx.itemLocationCode)}</td>
        <td style="direction:ltr">${tx.quantity}</td>
        <td>${escapeHtml(tx.recipientName)}</td>
        <td style="direction:ltr">${time}</td>
      </tr>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4; margin: 12mm; }
    body { font-family: 'Cairo', 'Tahoma', Arial, sans-serif; direction: rtl; text-align: right; }
    h1 { font-size: 20px; text-align: center; }
    .period { text-align: center; color: #555; font-size: 13px; margin-bottom: 16px; }
    .summary { display: flex; justify-content: space-around; margin: 16px 0; }
    .stat { text-align: center; }
    .stat .num { font-size: 22px; font-weight: bold; }
    .stat .label { font-size: 11px; color: #666; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { background: #E5284B; color: #fff; padding: 8px 6px; text-align: right; }
    td { border-bottom: 1px solid #ddd; padding: 6px; }
  </style>
</head>
<body>
  <h1>تقرير حركة المخزن</h1>
  <div class="period">${escapeHtml(period)}</div>
  <div class="summary">
    <div class="stat"><div class="num">${transactions.length}</div><div class="label">إجمالي العمليات</div></div>
    <div class="stat"><div class="num">${totalDispensed}</div><div class="label">إجمالي المصروف</div></div>
    <div class="stat"><div class="num">${totalReceived}</div><div class="label">إجمالي الوارد</div></div>
  </div>
  <table>
    <thead>
      <tr><th>رقم الإذن</th><th>القطعة</th><th>الموقع</th><th>الكمية</th><th>المستلم</th><th>الوقت</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;
}