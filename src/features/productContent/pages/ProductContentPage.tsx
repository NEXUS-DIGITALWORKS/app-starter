import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductHeader from '../components/ProductHeader';
import ProductSummaryCard from '../components/ProductSummaryCard';
import ProductSectionNav from '../components/ProductSectionNav';
import ProductStats from '../components/ProductStats';
import ContentTabs from '../components/ContentTabs';
import ProductMetadataTable from '../components/ProductMetadataTable';
import SeoTabs from '../components/SeoTabs';
import SeoQualityPanel from '../components/SeoQualityPanel';
import SeoSuggestionPanel from '../components/SeoSuggestionPanel';
import MissingFieldsPanel from '../components/MissingFieldsPanel';
import ExtractedFeaturesPanel from '../components/ExtractedFeaturesPanel';
import ImagePanel from '../components/ImagePanel';
import FieldComparisonCard from '../components/FieldComparisonCard';
import type { SectionKey } from '../components/sectionKeys';
import { addTagToProduct, fetchProductWorkspace, removeTagFromProduct, saveProductContent } from '../api/productContentApi';
import { translateProduct, improveProductDescription } from '../api/aiStub';
import { useProductCategoryEditor } from '../../categories/hooks/useProductCategoryEditor';
import type { ExtractedFeature, LocaleContent, LocaleSeo, ProductContentText, ProductWorkspace, SeoSuggestion, TargetLocale } from '../types';

type ProductNames = { name: string; nameZhHant: string; nameEn: string };
type PageMode = 'view' | 'edit';
type SeoByLocale = { original: LocaleSeo; zhHant: LocaleSeo; en: LocaleSeo };

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
  const categoryEditorState = useProductCategoryEditor(sku);

  const [workspace, setWorkspace] = useState<ProductWorkspace | null | undefined>(undefined);
  const [mode, setMode] = useState<PageMode>('view');
  const [original, setOriginal] = useState<ProductContentText | null>(null);
  const [savedOriginal, setSavedOriginal] = useState<ProductContentText | null>(null);
  const [zhHant, setZhHant] = useState<LocaleContent | null>(null);
  const [en, setEn] = useState<LocaleContent | null>(null);
  const [savedEdited, setSavedEdited] = useState<{ zhHant: ProductContentText; en: ProductContentText } | null>(null);
  const [names, setNames] = useState<ProductNames | null>(null);
  const [savedNames, setSavedNames] = useState<ProductNames | null>(null);
  const [features, setFeatures] = useState<ExtractedFeature[] | null>(null);
  const [savedFeatures, setSavedFeatures] = useState<ExtractedFeature[] | null>(null);
  const [seo, setSeo] = useState<SeoByLocale | null>(null);
  const [savedSeo, setSavedSeo] = useState<SeoByLocale | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [section, setSection] = useState<SectionKey>('overview');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let ignore = false;
    fetchProductWorkspace(sku).then((data) => {
      if (ignore) return;
      setWorkspace(data);
      if (data) {
        setOriginal(data.content.original);
        setSavedOriginal(data.content.original);
        setZhHant(data.content.zhHant);
        setEn(data.content.en);
        setSavedEdited({ zhHant: data.content.zhHant.edited, en: data.content.en.edited });
        const initialNames = { name: data.product.name, nameZhHant: data.product.nameZhHant, nameEn: data.product.nameEn };
        setNames(initialNames);
        setSavedNames(initialNames);
        setFeatures(data.extractedFeatures);
        setSavedFeatures(data.extractedFeatures);
        setSeo(data.seo);
        setSavedSeo(data.seo);
        setTags(data.product.tags ?? []);
      }
    });
    return () => {
      ignore = true;
    };
  }, [sku]);

  const isDirty = Boolean(
    original &&
      savedOriginal &&
      zhHant &&
      en &&
      savedEdited &&
      names &&
      savedNames &&
      features &&
      savedFeatures &&
      seo &&
      savedSeo &&
      (JSON.stringify(original) !== JSON.stringify(savedOriginal) ||
        JSON.stringify(zhHant.edited) !== JSON.stringify(savedEdited.zhHant) ||
        JSON.stringify(en.edited) !== JSON.stringify(savedEdited.en) ||
        JSON.stringify(names) !== JSON.stringify(savedNames) ||
        JSON.stringify(features) !== JSON.stringify(savedFeatures) ||
        JSON.stringify(seo) !== JSON.stringify(savedSeo)),
  );
  useBeforeUnloadGuard(isDirty);

  if (workspace === undefined) {
    return <div className="flex min-h-[60vh] items-center justify-center text-sm text-[#667085]">読み込み中...</div>;
  }

  if (workspace === null || !original || !zhHant || !en || !names || !features || !seo) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-sm text-[#667085]">
        <p>SKU「{sku}」の商品情報が見つかりませんでした。</p>
        <button type="button" onClick={() => navigate('/app/products')} className="text-[#3157E5] hover:underline">
          商品一覧に戻る
        </button>
      </div>
    );
  }

  const { storeView, attributes, missingFields, metadata, images, stats } = workspace;
  void attributes;

  const product = { ...workspace.product, ...names, tags };
  const editable = mode === 'edit';

  const localeState = { zhHant, en };
  const setLocaleState = { zhHant: setZhHant, en: setEn };

  const handleAdoptTranslation = (locale: TargetLocale, next: ProductContentText) => {
    setLocaleState[locale]((prev) => (prev ? { ...prev, aiTranslation: next } : prev));
  };

  const handleAdoptImproved = (locale: TargetLocale, next: ProductContentText) => {
    setLocaleState[locale]((prev) => (prev ? { ...prev, edited: next } : prev));
  };

  const handleChangeName = (field: keyof ProductNames, value: string) => {
    setNames((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleChangeFeatureValue = (key: string, value: string) => {
    setFeatures((prev) => (prev ? prev.map((f) => (f.key === key ? { ...f, value } : f)) : prev));
  };

  const handleChangeSeoSuggestion = (locale: keyof SeoByLocale, next: SeoSuggestion) => {
    setSeo((prev) => (prev ? { ...prev, [locale]: { ...prev[locale], suggestion: next } } : prev));
  };

  const handleAddTag = async (tag: string) => {
    await addTagToProduct(tag);
    setTags((prev) => (prev.includes(tag.trim()) ? prev : [...prev, tag.trim()]));
  };

  const handleRemoveTag = async (tag: string) => {
    await removeTagFromProduct(tag);
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleEdit = () => setMode('edit');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveProductContent({
        sku,
        storeViewId: storeView.id,
        original,
        zhHant: zhHant.edited,
        en: en.edited,
        productName: names,
        extractedFeatures: features,
        seo,
      });
      setSavedOriginal(original);
      setSavedEdited({ zhHant: zhHant.edited, en: en.edited });
      setSavedNames(names);
      setSavedFeatures(features);
      setSavedSeo(seo);
      setMode('view');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (isDirty && !window.confirm('保存されていない変更があります。破棄して閉じますか？')) return;
    navigate('/app/products');
  };

  return (
    <div className="flex flex-col gap-4">
      <ProductHeader
        sku={sku}
        mode={mode}
        isDirty={isDirty}
        isSaving={isSaving}
        onEdit={handleEdit}
        onSave={handleSave}
        onClose={handleClose}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-[220px]">
          <ProductSectionNav active={section} onChange={setSection} />
          <ProductStats stats={stats} product={product} />
        </aside>

        <main className="min-w-0 flex-1 space-y-4">
          <ProductSummaryCard
            product={product}
            editable={editable}
            onChangeName={handleChangeName}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            categoryEditorState={categoryEditorState}
          />

          {section === 'overview' && (
            <ContentTabs
              productName={product.name}
              productImage={product.imagePath}
              original={original}
              onChangeOriginal={setOriginal}
              zhHant={zhHant}
              en={en}
              features={features}
              editable={editable}
              onRegenerateTranslation={() => translateProduct(original)}
              onRegenerateImproved={(locale) => improveProductDescription(localeState[locale].edited)}
              onAdoptTranslation={handleAdoptTranslation}
              onAdoptImproved={handleAdoptImproved}
            />
          )}

          {section === 'features' && (
            <ExtractedFeaturesPanel features={features} editable={editable} onChangeValue={handleChangeFeatureValue} />
          )}

          {section === 'ingredients' && (
            <div className="space-y-4">
              <FieldComparisonCard
                title="成分・原材料（繁体字）"
                leftLabel="原文（日本語）"
                leftValue={original.ingredients}
                onLeftValueChange={editable ? (value) => setOriginal({ ...original, ingredients: value }) : undefined}
                rightLabel="繁体字（改善案）"
                rightValue={zhHant.edited.ingredients}
                onRightValueChange={
                  editable ? (value) => handleAdoptImproved('zhHant', { ...zhHant.edited, ingredients: value }) : undefined
                }
              />
              <FieldComparisonCard
                title="成分・原材料（英語）"
                leftLabel="原文（日本語）"
                leftValue={original.ingredients}
                onLeftValueChange={editable ? (value) => setOriginal({ ...original, ingredients: value }) : undefined}
                rightLabel="英語（改善案）"
                rightValue={en.edited.ingredients}
                onRightValueChange={editable ? (value) => handleAdoptImproved('en', { ...en.edited, ingredients: value }) : undefined}
              />
            </div>
          )}

          {section === 'usage' && (
            <div className="space-y-4">
              <FieldComparisonCard
                title="使用上の注意（繁体字）"
                leftLabel="原文（日本語）"
                leftValue={original.usageNotes}
                onLeftValueChange={editable ? (value) => setOriginal({ ...original, usageNotes: value }) : undefined}
                rightLabel="繁体字（改善案）"
                rightValue={zhHant.edited.usageNotes}
                onRightValueChange={
                  editable ? (value) => handleAdoptImproved('zhHant', { ...zhHant.edited, usageNotes: value }) : undefined
                }
              />
              <FieldComparisonCard
                title="使用上の注意（英語）"
                leftLabel="原文（日本語）"
                leftValue={original.usageNotes}
                onLeftValueChange={editable ? (value) => setOriginal({ ...original, usageNotes: value }) : undefined}
                rightLabel="英語（改善案）"
                rightValue={en.edited.usageNotes}
                onRightValueChange={editable ? (value) => handleAdoptImproved('en', { ...en.edited, usageNotes: value }) : undefined}
              />
            </div>
          )}

          {section === 'seo' && (
            <SeoTabs
              seo={seo}
              missingFields={missingFields}
              contentForRegeneration={{ original, zhHant: zhHant.edited, en: en.edited }}
              editable={editable}
              onChangeSuggestion={handleChangeSeoSuggestion}
            />
          )}

          {section === 'images' && <ImagePanel images={images} productName={product.name} />}

          {section === 'metadata' && <ProductMetadataTable metadata={metadata} />}
        </main>

        <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-[300px]">
          {section !== 'seo' && <SeoQualityPanel issues={seo.zhHant.issues} missingFields={missingFields} />}
          <MissingFieldsPanel fields={missingFields} />
          {section !== 'features' && <ExtractedFeaturesPanel features={features} />}
          {section !== 'seo' && <SeoSuggestionPanel suggestion={seo.zhHant.suggestion} contentForRegeneration={zhHant.edited} />}
        </aside>
      </div>
    </div>
  );
}
