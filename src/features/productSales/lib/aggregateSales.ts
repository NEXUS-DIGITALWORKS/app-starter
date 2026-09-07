import type { ProductSalePeriodSummary, SalesGranularity } from '../types/productSales';

// dailySummaries.periodは常にYYYY-MM-DD（sale_dateそのもの）のため、文字列の前方一致で
// 月次(YYYY-MM)・年次(YYYY)キーを切り出せる。
function periodKey(dailyPeriod: string, granularity: SalesGranularity): string {
  if (granularity === 'monthly') return dailyPeriod.slice(0, 7);
  if (granularity === 'yearly') return dailyPeriod.slice(0, 4);
  return dailyPeriod;
}

export function aggregateSalesByGranularity(
  dailySummaries: ProductSalePeriodSummary[],
  granularity: SalesGranularity,
): ProductSalePeriodSummary[] {
  if (granularity === 'daily') return dailySummaries;

  const byPeriod = new Map<string, { qtyOrdered: number; salesAmount: number; discountAmount: number; orderCount: number }>();
  for (const day of dailySummaries) {
    const key = periodKey(day.period, granularity);
    const existing = byPeriod.get(key);
    if (existing) {
      existing.qtyOrdered += day.qtyOrdered;
      existing.salesAmount += day.salesAmount;
      existing.discountAmount += day.discountAmount;
      existing.orderCount += day.orderCount;
    } else {
      byPeriod.set(key, {
        qtyOrdered: day.qtyOrdered,
        salesAmount: day.salesAmount,
        discountAmount: day.discountAmount,
        orderCount: day.orderCount,
      });
    }
  }

  return Array.from(byPeriod.entries())
    .map(([period, agg]) => ({
      period,
      ...agg,
      unitPrice: agg.qtyOrdered > 0 ? agg.salesAmount / agg.qtyOrdered : null,
    }))
    .sort((a, b) => (a.period < b.period ? 1 : -1));
}
