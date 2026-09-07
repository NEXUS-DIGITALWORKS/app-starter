import type { ProductSalePeriodSummary, ProductSaleRecord, ProductSalesSummary } from '../types/productSales';

export function summarizeSalesRecords(records: ProductSaleRecord[]): ProductSalesSummary {
  const byDate = new Map<string, { qtyOrdered: number; salesAmount: number; discountAmount: number; orderCount: number }>();

  let totalQtyOrdered = 0;
  let totalSalesAmount = 0;
  let totalDiscountAmount = 0;

  for (const record of records) {
    totalQtyOrdered += record.qtyOrdered;
    totalSalesAmount += record.salesAmount;
    totalDiscountAmount += record.discountAmount;

    const existing = byDate.get(record.saleDate);
    if (existing) {
      existing.qtyOrdered += record.qtyOrdered;
      existing.salesAmount += record.salesAmount;
      existing.discountAmount += record.discountAmount;
      existing.orderCount += 1;
    } else {
      byDate.set(record.saleDate, {
        qtyOrdered: record.qtyOrdered,
        salesAmount: record.salesAmount,
        discountAmount: record.discountAmount,
        orderCount: 1,
      });
    }
  }

  const dailySummaries: ProductSalePeriodSummary[] = Array.from(byDate.entries())
    .map(([period, agg]) => ({
      period,
      ...agg,
      unitPrice: agg.qtyOrdered > 0 ? agg.salesAmount / agg.qtyOrdered : null,
    }))
    .sort((a, b) => (a.period < b.period ? 1 : -1));

  return {
    totalQtyOrdered,
    totalSalesAmount,
    totalDiscountAmount,
    orderCount: records.length,
    averageUnitPrice: totalQtyOrdered > 0 ? totalSalesAmount / totalQtyOrdered : null,
    dailySummaries,
  };
}

// 顧客区分フィルタのSelect選択肢を、実データに存在する値だけから動的に組み立てる
// （customer_typeの表記が"new"/"existing"以外の可能性もあるため決め打ちしない）。
export function collectCustomerTypes(records: ProductSaleRecord[]): string[] {
  return Array.from(new Set(records.map((r) => r.customerType).filter((v): v is string => Boolean(v)))).sort();
}
