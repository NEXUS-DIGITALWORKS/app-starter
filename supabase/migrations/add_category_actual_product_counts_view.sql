-- =========================================================
-- category_actual_product_counts ビュー
-- 依存: setup_product_categories.sql, setup_products.sql
--
-- 既存の category_product_counts は product_categories の紐づけ行を
-- 単純カウントするため、products に実在しないSKU（削除済み・未投入の
-- SKUへの紐づけ）も件数に含まれてしまう。商品一覧（product_list_with_sales）
-- は products を起点にしているため、実際に一覧へ表示される商品数とは
-- ズレが生じることがある。
--
-- このビューは products に実在するSKUのみをJOINしてカウントし、
-- 商品一覧側の件数と一致させる（カテゴリ管理画面の件数表示切り替え用）。
-- さらに ec_status = 'disabled'（非公開）の商品もカウントから除外する。
-- =========================================================

CREATE OR REPLACE VIEW public.category_actual_product_counts AS
SELECT pc.category_id, COUNT(DISTINCT pc.product_id)::INT AS product_count
FROM public.product_categories pc
JOIN public.products p ON p.sku = pc.product_id
WHERE p.ec_status = 'enabled'
GROUP BY pc.category_id;

GRANT SELECT ON public.category_actual_product_counts TO authenticated;
