export type SalesGranularity = 'daily' | 'monthly' | 'yearly';

export interface ProductSaleRecord {
  saleDate: string;
  qtyOrdered: number;
  salesAmount: number;
  discountAmount: number;
  unitPrice: number | null;
  customerType: string | null;
}

export interface ProductSalePeriodSummary {
  period: string;
  qtyOrdered: number;
  salesAmount: number;
  discountAmount: number;
  orderCount: number;
  unitPrice: number | null;
}

export interface ProductSalesSummary {
  totalQtyOrdered: number;
  totalSalesAmount: number;
  totalDiscountAmount: number;
  orderCount: number;
  averageUnitPrice: number | null;
  dailySummaries: ProductSalePeriodSummary[];
}

// Home画面の売上集計カード用。home_sales_summary ビュー
// （supabase/migrations/add_home_sales_summary_view.sql）が返す固定期間の累積売上。
export interface HomeSalesSummary {
  periodStart: string; // 'YYYY-MM-DD'
  periodEnd: string;
  totalSalesAmount: number;
}
