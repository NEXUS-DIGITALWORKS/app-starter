import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchProductIdsByCategory } from '../api/productCategoriesApi';
import { fetchProductsBySkus } from '../../productContent/api/productListApi';
import { downloadCsv } from '../lib/downloadCsv';
import { buildMagentoCategoryPath } from '../lib/magentoPath';
import { getCategoryDisplayName } from '../lib/categoryName';
import type { Category } from '../types';

const CSV_HEADERS = [
  'SKU',
  '商品名',
  'ブランド',
  'StoreView',
  'ステータス',
  'SEOスコア',
  '更新日時',
  'カテゴリコード',
  'カテゴリ名（日本語）',
  'カテゴリ名（英語）',
  'カテゴリ名（繁体字）',
  'Magentoパス（日本語）',
];

interface CsvExportButtonProps {
  category: Category;
  categories: Category[];
}

export default function CsvExportButton({ category, categories }: CsvExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const skus = await fetchProductIdsByCategory(category.id);
      const products = await fetchProductsBySkus(skus);
      const magentoPathJa = buildMagentoCategoryPath(categories, category.id, 'ja');

      const rows = products.map((p) => [
        p.sku,
        p.name,
        p.brand,
        p.storeView,
        p.status,
        p.seoScore,
        p.updatedAt,
        category.code,
        category.nameJa,
        category.nameEn,
        category.nameZhTw,
        magentoPathJa,
      ]);

      downloadCsv(`category_${category.code}_products.csv`, CSV_HEADERS, rows);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport} disabled={isExporting}>
      <Download size={14} />
      {isExporting ? '出力中...' : `「${getCategoryDisplayName(category)}」の商品をCSV出力`}
    </Button>
  );
}
