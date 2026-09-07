// フェア・キャンペーン等のイベント期間。特定のSKU・カテゴリには紐付けない店舗全体共通のマスタで、
// 商品詳細の売上推移グラフに背景として重ねて表示する（supabase/migrations/setup_sales_events.sql参照）。

export interface SalesEvent {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface SalesEventInput {
  name: string;
  startDate: string;
  endDate: string;
}
