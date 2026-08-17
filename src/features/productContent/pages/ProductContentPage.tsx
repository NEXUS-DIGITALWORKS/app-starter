import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductContentHeader from '../components/ProductContentHeader';
import ProductHeader from '../components/ProductHeader';
import ProductSummaryCard from '../components/ProductSummaryCard';
import ProductSectionNav from '../components/ProductSectionNav';
import ProductStats from '../components/ProductStats';
import ContentTabs from '../components/ContentTabs';
import ProductMetadataTable from '../components/ProductMetadataTable';
import SeoQualityPanel from '../components/SeoQualityPanel';
import MissingFieldsPanel from '../components/MissingFieldsPanel';
import ExtractedFeaturesPanel from '../components/ExtractedFeaturesPanel';
import SeoSuggestionPanel from '../components/SeoSuggestionPanel';
import ImagePanel from '../components/ImagePanel';
import FieldComparisonCard from '../components/FieldComparisonCard';
import type { SectionKey } from '../components/sectionKeys';
import { fetchProductWorkspace, requestApproval, saveProductContent } from '../api/productContentApi';
import { translateProduct, improveProductDescription } from '../api/aiStub';
import type { ProductContentText, ProductWorkspace } from '../types';

function useBeforeUnloadGuard(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);
}

export default function ProductContentPage() {
  const { sku = '' } = useParams<{ sku: string }>();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState<ProductWorkspace | null | undefined>(undefined);
  const [translationJa, setTranslationJa] = useState<ProductContentText | null>(null);
  const [improvedJa, setImprovedJa] = useState<ProductContentText | null>(null);
  const [savedImprovedJa, setSavedImprovedJa] = useState<ProductContentText | null>(null);
  const [section, setSection] = useState<SectionKey>('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [isRequestingApproval, setIsRequestingApproval] = useState(false);
  const [approvalSubmittedAt, setApprovalSubmittedAt] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    fetchProductWorkspace(sku).then((data) => {
      if (ignore) return;
      setWorkspace(data);
      if (data) {
        setTranslationJa(data.content.translationJa);
        setImprovedJa(data.content.improvedJa);
        setSavedImprovedJa(data.content.improvedJa);
      }
    });
    return () => {
      ignore = true;
    };
  }, [sku]);

  const isDirty = Boolean(improvedJa && savedImprovedJa && JSON.stringify(improvedJa) !== JSON.stringify(savedImprovedJa));
  useBeforeUnloadGuard(isDirty);

  if (workspace === undefined) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F7F8FA]">
        <ProductContentHeader />
        <div className="flex flex-1 items-center justify-center text-sm text-[#667085]">読み込み中...</div>
      </div>
    );
  }

  if (workspace === null || !translationJa || !improvedJa) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F7F8FA]">
        <ProductContentHeader />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-sm text-[#667085]">
          <p>SKU「{sku}」の商品情報が見つかりませんでした。</p>
          <button type="button" onClick={() => navigate('/app')} className="text-[#3157E5] hover:underline">
            商品一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  const { product, storeView, content, attributes, extractedFeatures, missingFields, seoIssues, seoSuggestion, metadata, images, stats } =
    workspace;
  void attributes;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveProductContent({ sku, storeViewId: storeView.id, improvedJa });
      setSavedImprovedJa(improvedJa);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestApproval = async () => {
    setIsRequestingApproval(true);
    try {
      const res = await requestApproval({ sku, requestedBy: 'Admin' });
      setApprovalSubmittedAt(res.requestedAt);
    } finally {
      setIsRequestingApproval(false);
    }
  };

  const handleClose = () => {
    if (isDirty && !window.confirm('保存されていない変更があります。破棄して閉じますか？')) return;
    navigate('/app');
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8FA]">
      <ProductContentHeader />
      <ProductHeader
        sku={sku}
        isDirty={isDirty}
        isSaving={isSaving}
        isRequestingApproval={isRequestingApproval}
        onSave={handleSave}
        onRequestApproval={handleRequestApproval}
        onClose={handleClose}
      />

      {approvalSubmittedAt && (
        <div className="border-b border-[#EEF0F4] bg-[#EEF0FE] px-4 py-2 text-center text-xs font-medium text-[#2748C7] sm:px-6">
          承認申請を送信しました（{new Date(approvalSubmittedAt).toLocaleString('ja-JP')}）
        </div>
      )}

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 lg:flex-row lg:items-start">
        <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-[220px]">
          <ProductSectionNav active={section} onChange={setSection} />
          <ProductStats stats={stats} />
        </aside>

        <main className="min-w-0 flex-1 space-y-4">
          <ProductSummaryCard product={product} storeView={storeView} onOpenPreview={() => setSection('overview')} />

          {section === 'overview' && (
            <>
              <ContentTabs
                productName={product.name}
                productImage={product.imagePath}
                original={content.original}
                translationJa={translationJa}
                improvedJa={improvedJa}
                features={extractedFeatures}
                onRegenerateTranslation={() => translateProduct(content.original)}
                onRegenerateImproved={() => improveProductDescription(improvedJa)}
                onAdoptTranslation={setTranslationJa}
                onAdoptImproved={setImprovedJa}
              />
              <ProductMetadataTable metadata={metadata} />
            </>
          )}

          {section === 'features' && <ExtractedFeaturesPanel features={extractedFeatures} />}

          {section === 'ingredients' && (
            <FieldComparisonCard
              title="成分・原材料"
              leftLabel="原文（繁体字）"
              leftValue={content.original.ingredients}
              rightLabel="改善案（日本語）"
              rightValue={improvedJa.ingredients}
            />
          )}

          {section === 'usage' && (
            <FieldComparisonCard
              title="使用上の注意"
              leftLabel="原文（繁体字）"
              leftValue={content.original.usageNotes}
              rightLabel="改善案（日本語）"
              rightValue={improvedJa.usageNotes}
            />
          )}

          {section === 'seo' && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <SeoQualityPanel issues={seoIssues} missingFields={missingFields} />
              <SeoSuggestionPanel suggestion={seoSuggestion} contentForRegeneration={improvedJa} />
            </div>
          )}

          {section === 'images' && <ImagePanel images={images} productName={product.name} />}

          {section === 'metadata' && <ProductMetadataTable metadata={metadata} />}
        </main>

        <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-[300px]">
          <SeoQualityPanel issues={seoIssues} missingFields={missingFields} />
          <MissingFieldsPanel fields={missingFields} />
          <ExtractedFeaturesPanel features={extractedFeatures} />
          <SeoSuggestionPanel suggestion={seoSuggestion} contentForRegeneration={improvedJa} />
        </aside>
      </div>
    </div>
  );
}
