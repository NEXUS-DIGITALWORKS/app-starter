import { getProductImageUrl } from '../lib/productImage';
import type { ProductWorkspace } from '../types';

// MVP1用のMockデータ（実データ接続はMVP2以降）。参考画面（Curel 温和潔淨洗髮精）に準拠。
// 原文（マスターデータ）は日本語。繁体字（台湾ストアビュー向け）・英語（英語ストアビュー向け）は
// 原文からのAI翻訳＋人による編集後コンテンツとして保持する。
export const MOCK_SKU = '4901301276070';
const MOCK_IMAGE_PATH = '/1/0/101775621734_0157658996.jpg';

export const mockProductWorkspace: ProductWorkspace = {
  product: {
    id: 'prod_1017',
    sku: MOCK_SKU,
    brand: 'Curel',
    name: '【花王】キュレルシャンプーポンプ 420ml',
    nameZhHant: '【花王】Curel 温和潔淨洗髮精 420ml',
    nameEn: '【Kao】Curel hair shampoo Unisex 420ml',
    price: '¥1,000',
    ecStatus: 'enabled',
    ecStatusLabel: '公開中',
    ecVisibility: 'Catalog & Search',
    workflowStatus: 'editing',
    imagePath: getProductImageUrl(MOCK_IMAGE_PATH),
    createdAt: '2023-09-12T05:59:31+09:00',
    updatedAt: '2026-07-10T18:21:14+09:00',
  },
  storeView: {
    id: 'sv_tw_2',
    productId: 'prod_1017',
    storeId: '2',
    storeViewCode: 'tw',
    storeViewName: 'Taiwan Store View',
    locale: 'zh-Hant-TW',
  },
  content: {
    storeViewId: 'sv_tw_2',
    original: {
      shortDescription: '弱酸性・無香料・無着色。頭皮をやさしく洗い上げるシャンプー。',
      description:
        '頭皮の乾燥が気になる方にも配慮した、やさしい洗い心地のシャンプーです。\n保湿成分を配合し、きめ細かな泡で髪と頭皮をやさしく洗い上げます。\n洗い上がりはなめらかで、髪が絡まりにくい処方です。\n赤ちゃんにも使用できます。\n弱酸性・無香料・無着色。\n内容量：420mL\n原産国：日本',
      ingredients:
        '有効成分：グリチルリチン酸2K\nその他の成分：精製水、ラウレス硫酸Na、アルキルグリコシド、ヤシ油脂肪酸アシルグルタミン酸Na、オレンジ油、ユーカリ油、エタノール、エデト酸塩、安息香酸塩 ほか',
      usageNotes: '肌に異常がある場合は使用しないでください。\n目に入った場合はすぐに水で洗い流してください。\n乳幼児の手の届かないところに保管してください。',
    },
    zhHant: {
      aiTranslation: {
        shortDescription: '弱酸性、無香料、無色素',
        description:
          '溫和潔淨，不易造成頭皮乾燥困擾，保持頭髮與頭皮健康\n含保濕成分\n細緻綿密的泡泡，洗後髮絲柔順不打結\n嬰兒也可使用\n弱酸性、無香料、無色素\n內容量：420mL\n生產國：日本',
        ingredients:
          '有效成分：甘草酸2K\n其他成分：精製水、勞拉醇硫酸鈉、烷基糖苷、椰子油脂肪酸醯基谷氨酸Na、橙油、尤加利油、乙醇、EDTA鹽、安息香酸鹽 其他',
        usageNotes: '皮膚有異狀、濕疹等異常現象時請勿使用，以免惡化。\n若不慎觸及眼睛請立即以清水充分沖洗。\n請勿放置於嬰幼兒容易取用之處。',
      },
      edited: {
        shortDescription: '弱酸性、無香料、無色素。溫和潔淨頭皮的低刺激洗髮精。',
        description:
          '溫和潔淨，不易造成頭皮乾燥困擾，保持頭髮與頭皮健康。\n含保濕成分，細緻綿密的泡泡包覆髮絲與頭皮的髒污，溫和洗淨。\n洗後髮絲柔順不打結。\n從嬰兒到大人，全家都能安心使用。\n弱酸性、無香料、無色素。內容量420mL，日本製造。',
        ingredients:
          '有效成分：甘草酸2K\n其他成分：精製水、勞拉醇硫酸鈉、烷基糖苷、椰子油脂肪酸醯基谷氨酸Na、橙油、尤加利油、乙醇、EDTA鹽、安息香酸鹽 其他',
        usageNotes: '皮膚有異狀時請停止使用。\n若不慎觸及眼睛請立即以清水充分沖洗。\n請勿放置於嬰幼兒容易取用之處。',
      },
    },
    en: {
      aiTranslation: {
        shortDescription: 'Mildly acidic, fragrance-free, colorant-free shampoo that gently cleanses the scalp.',
        description:
          'A gentle shampoo designed for those concerned about scalp dryness.\nFormulated with moisturizing ingredients and a fine, dense lather that gently cleanses hair and scalp.\nLeaves hair smooth and tangle-free.\nSafe for use on babies.\nMildly acidic, fragrance-free, colorant-free.\nVolume: 420mL\nCountry of origin: Japan',
        ingredients:
          'Active ingredient: Dipotassium Glycyrrhizate\nOther ingredients: Purified Water, Sodium Laureth Sulfate, Alkyl Glycoside, Sodium Cocoyl Glutamate, Orange Oil, Eucalyptus Oil, Ethanol, Edetate, Benzoate, and others',
        usageNotes:
          'Discontinue use if any abnormality occurs on the skin.\nRinse thoroughly with water if it gets into eyes.\nKeep out of reach of infants and young children.',
      },
      edited: {
        shortDescription: 'Mildly acidic, fragrance-free, colorant-free. A low-irritation shampoo gentle on sensitive scalps.',
        description:
          'A low-irritation shampoo suited for those concerned about scalp dryness.\nFormulated with moisturizing ingredients, its fine, dense lather gently wraps away dirt from hair and scalp.\nLeaves hair smooth and easy to manage.\nGentle enough for the whole family, from babies to adults.\nMildly acidic, fragrance-free, colorant-free. 420mL, made in Japan.',
        ingredients:
          'Active ingredient: Dipotassium Glycyrrhizate\nOther ingredients: Purified Water, Sodium Laureth Sulfate, Alkyl Glycoside, Sodium Cocoyl Glutamate, Orange Oil, Eucalyptus Oil, Ethanol, Edetate, Benzoate, and others',
        usageNotes:
          'Discontinue use if any irritation occurs.\nRinse thoroughly with water if it gets into eyes.\nKeep out of reach of infants and young children.',
      },
    },
  },
  attributes: [
    { key: 'proper_use', label: 'Proper use', value: '頭皮と髪をやさしく洗浄', status: 'available', confidence: 0.9 },
    {
      key: 'target_audience',
      label: 'Target audience',
      value: '頭皮の乾燥が気になる方 / 赤ちゃんも使用可',
      status: 'available',
      confidence: 0.85,
    },
    { key: 'capacity', label: 'Capacity', value: '420mL', unit: 'mL', status: 'available', confidence: 0.99 },
    { key: 'country_of_origin', label: 'Country of origin', value: '日本', status: 'available', confidence: 0.95 },
    {
      key: 'ingredients',
      label: 'Ingredients',
      value: 'グリチルリチン酸2K ほか',
      status: 'available',
      confidence: 0.8,
    },
  ],
  extractedFeatures: [
    { key: 'proper_use', label: 'Proper use', value: '頭皮と髪をやさしく洗浄' },
    { key: 'target_audience', label: 'Target audience', value: '頭皮の乾燥が気になる方 / 赤ちゃんも使用可' },
    { key: 'capacity', label: 'Capacity', value: '420mL' },
    { key: 'country_of_origin', label: 'Country of origin', value: '日本' },
    { key: 'ingredients', label: 'Ingredients', value: 'グリチルリチン酸2K ほか' },
  ],
  missingFields: [
    { key: 'usage_method', label: '使用方法', status: 'missing' },
    { key: 'target_age', label: '対象年齢', status: 'missing' },
    { key: 'volume_refill', label: '内容量（本数・詰め替え有無）', status: 'missing' },
  ],
  seo: {
    original: {
      issues: [
        { id: 'seo_ja_1', field: 'meta_description', severity: 'warning', message: 'meta_description が短い' },
        { id: 'seo_ja_2', field: 'url_key', severity: 'warning', message: 'url_key が数値のみでSEO効果が低い' },
      ],
      suggestion: {
        metaTitle: '【花王】Curel 潤和洗髪シャンプー 420mL｜弱酸性・無香料・無着色',
        metaDescription:
          '頭皮をやさしく洗い上げるCurelの低刺激シャンプー。弱酸性・無香料・無着色で、保湿成分を配合。髪と頭皮のうるおいを守り、赤ちゃんにも使用できます。内容量420mL、日本製。',
        urlKey: 'curel-gentle-shampoo-420ml',
      },
    },
    zhHant: {
      issues: [
        { id: 'seo_zh_1', field: 'meta_description', severity: 'critical', message: 'meta_description が未設定' },
        { id: 'seo_zh_2', field: 'short_description', severity: 'warning', message: 'short_description が短すぎる' },
        { id: 'seo_zh_3', field: 'url_key', severity: 'warning', message: 'url_key が数値のみでSEO効果が低い' },
        { id: 'seo_zh_4', field: 'description', severity: 'info', message: '繁体字向けの説明文と見出し整理を推奨' },
      ],
      suggestion: {
        metaTitle: 'Curel 溫和潔淨洗髮精 420mL｜弱酸性、無香料、無色素',
        metaDescription:
          '溫和潔淨頭皮的Curel低刺激洗髮精。弱酸性、無香料、無色素，含保濕成分。呵護秀髮與頭皮的水潤，嬰兒也可使用。內容量420mL，日本製造。',
        urlKey: 'curel-gentle-shampoo-420ml',
      },
    },
    en: {
      issues: [
        { id: 'seo_en_1', field: 'meta_description', severity: 'critical', message: 'meta_description が未設定' },
        { id: 'seo_en_2', field: 'short_description', severity: 'warning', message: 'short_description が短すぎる' },
        { id: 'seo_en_3', field: 'url_key', severity: 'warning', message: 'url_key が数値のみでSEO効果が低い' },
      ],
      suggestion: {
        metaTitle: 'Curel Gentle Cleansing Shampoo 420mL | Mildly Acidic, Fragrance-Free, Colorant-Free',
        metaDescription:
          "Curel's low-irritation shampoo gently cleanses the scalp. Mildly acidic, fragrance-free, colorant-free, with moisturizing ingredients. Safe for babies. 420mL, made in Japan.",
        urlKey: 'curel-gentle-shampoo-420ml-en',
      },
    },
  },
  metadata: {
    entityId: '1017',
    sku: MOCK_SKU,
    storeId: '2',
    storeViewCode: 'tw',
    storeViewName: 'Taiwan Store View',
    metaTitle: 'Curel 溫和潔淨洗髮精 420ml',
    metaDescription: null,
    metaKeyword: 'Curel 溫和潔淨洗髮精 420ml',
    urlKey: MOCK_SKU,
    baseImage: MOCK_IMAGE_PATH,
    smallImage: MOCK_IMAGE_PATH,
    thumbnail: MOCK_IMAGE_PATH,
  },
  images: [
    { key: 'base_image', label: 'Base Image', path: getProductImageUrl(MOCK_IMAGE_PATH), alt: null },
    { key: 'small_image', label: 'Small Image', path: getProductImageUrl(MOCK_IMAGE_PATH), alt: null },
    { key: 'thumbnail', label: 'Thumbnail', path: getProductImageUrl(MOCK_IMAGE_PATH), alt: null },
  ],
  stats: {
    imageCount: 1,
    headingCount: 3,
  },
};
