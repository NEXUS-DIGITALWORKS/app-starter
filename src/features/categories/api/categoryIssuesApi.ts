import { isSupabaseConfigured, supabase } from '../../../lib/supabaseClient';
import { evaluateCategoryIssues, type CategoryIssueRow } from '../lib/categoryIssueRules';
import { fetchCategories, fetchCategoryActualProductCounts } from './categoriesApi';
import type { CategoryIssueItem } from '../types/categoryIssue';

// category_sales_summary ビュー（supabase/migrations/add_category_sales_summary_view.sql）から
// カテゴリごとの直近2年売上合計をN+1なしで一括取得する。
async function fetchCategorySalesTotals(): Promise<Record<string, number>> {
  if (!isSupabaseConfigured()) return {};

  const { data, error } = await supabase.from('category_sales_summary').select('category_id, sales_total_2y');
  if (error || !data) return {};

  const totals: Record<string, number> = {};
  for (const row of data as { category_id: string; sales_total_2y: number }[]) {
    totals[row.category_id] = row.sales_total_2y;
  }
  return totals;
}

export async function fetchCategoryIssues(): Promise<CategoryIssueItem[]> {
  if (!isSupabaseConfigured()) return [];

  const [categories, productCounts, salesTotals] = await Promise.all([
    fetchCategories(),
    fetchCategoryActualProductCounts(),
    fetchCategorySalesTotals(),
  ]);

  const byId = new Map(categories.map((c) => [c.id, c]));

  const items: CategoryIssueItem[] = categories.map((category) => {
    const parent = category.parentId ? byId.get(category.parentId) : undefined;
    const row: CategoryIssueRow = {
      isActive: category.isActive,
      productCount: productCounts[category.id] ?? 0,
      salesTotal2y: salesTotals[category.id] ?? 0,
      nameJa: category.nameJa,
      nameEn: category.nameEn,
      nameZhTw: category.nameZhTw,
      description: category.description,
      parentIsActive: category.parentId ? (parent?.isActive ?? null) : null,
    };

    return {
      id: category.id,
      code: category.code,
      nameJa: category.nameJa,
      nameEn: category.nameEn,
      nameZhTw: category.nameZhTw,
      categoryType: category.categoryType,
      parentNameJa: parent?.nameJa ?? null,
      productCount: row.productCount,
      salesTotal2y: row.salesTotal2y,
      issues: evaluateCategoryIssues(row),
    };
  });

  return items.filter((item) => item.issues.length > 0);
}
