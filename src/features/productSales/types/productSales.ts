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
