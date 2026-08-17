import type { ProductWorkspace } from '../types';

// MVP1用のMockデータ（実データ接続はMVP2以降）。参考画面（Curel 温和潔淨洗髮精）に準拠。
export const MOCK_SKU = '4901301276070';

export const mockProductWorkspace: ProductWorkspace = {
  product: {
    id: 'prod_1017',
    sku: MOCK_SKU,
    brand: 'Curel',
    name: '【花王】Curel 潤和潔淨洗髮精 420ml',
    ecStatus: 'enabled',
    ecStatusLabel: '公開中',
    ecVisibility: 'Catalog & Search',
    workflowStatus: 'editing',
    imagePath: '/4/9/4901301276070_00.png',
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
      shortDescription: '弱酸性、無香料、無色素',
      description:
        '溫和潔淨，不易造成頭皮乾燥困擾，保持頭髮與頭皮健康\n含保濕成分\n細緻綿密的泡泡，洗後髮絲柔順不打結\n嬰兒也可使用\n弱酸性、無香料、無色素\n內容量：420mL\n生產國：日本',
      ingredients:
        '有效成分：甘草酸2K\n其他成分：精製水、勞拉醇硫酸鈉、烷基糖苷、椰子油脂肪酸醯基谷氨酸Na、橙油、尤加利油、乙醇、EDTA鹽、安息香酸鹽 其他',
      usageNotes: '皮膚有異狀、濕疹等異常現象時請勿使用，以免惡化。\n若不慎觸及眼睛請立即以清水充分沖洗。\n請勿放置於嬰幼兒容易取用之處。',
    },
    translationJa: {
      shortDescription: '弱酸性・無香料・無着色。頭皮をやさしく洗い上げるシャンプー。',
      description:
        '頭皮の乾燥が気になる方にも配慮した、やさしい洗い心地のシャンプーです。\n保湿成分を配合し、きめ細かな泡で髪と頭皮をやさしく洗い上げます。\n洗い上がりはなめらかで、髪が絡まりにくい処方です。\n赤ちゃんにも使用できます。\n弱酸性・無香料・無着色。\n内容量：420mL\n原産国：日本',
      ingredients:
        '有効成分：グリチルリチン酸2K\nその他の成分：精製水、ラウレス硫酸Na、アルキルグリコシド、ヤシ油脂肪酸アシルグルタミン酸Na、オレンジ油、ユーカリ油、エタノール、エデト酸塩、安息香酸塩 ほか',
      usageNotes: '肌に異常がある場合は使用しないでください。\n目に入った場合はすぐに水で洗い流してください。\n乳幼児の手の届かないところに保管してください。',
    },
    improvedJa: {
      shortDescription: '弱酸性・無香料・無着色。敏感肌にもやさしいCurelの低刺激シャンプー。',
      description:
        '頭皮の乾燥が気になる方にも使いやすい、低刺激設計のシャンプーです。\n保湿成分を配合し、きめ細かい泡が髪と頭皮の汚れをやさしく包み込んで洗い上げます。\n洗い上がりはなめらかで、髪がまとまりやすい処方です。\n赤ちゃんから大人まで、家族みんなでお使いいただけます。\n弱酸性・無香料・無着色。内容量420mL、日本製。',
      ingredients:
        '有効成分：グリチルリチン酸2K\nその他の成分：精製水、ラウレス硫酸Na、アルキルグリコシド、ヤシ油脂肪酸アシルグルタミン酸Na、オレンジ油、ユーカリ油、エタノール、エデト酸塩、安息香酸塩 ほか',
      usageNotes: '肌に異常がある場合は使用を中止してください。\n目に入った場合はすぐに水で洗い流してください。\n乳幼児の手の届かないところに保管してください。',
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
  seoIssues: [
    { id: 'seo_1', field: 'meta_description', severity: 'critical', message: 'meta_description が未設定' },
    { id: 'seo_2', field: 'short_description', severity: 'warning', message: 'short_description が短すぎる' },
    { id: 'seo_3', field: 'url_key', severity: 'warning', message: 'url_key が数値のみでSEO効果が低い' },
    { id: 'seo_4', field: 'description', severity: 'info', message: '日本語向けの説明文と見出し整理を推奨' },
  ],
  seoSuggestion: {
    metaTitle: '【花王】Curel 低刺激シャンプー 420mL｜弱酸性・無香料・無着色',
    metaDescription:
      '頭皮をやさしく洗い上げるCurelの低刺激シャンプー。弱酸性・無香料・無着色で、保湿成分を配合。髪と頭皮のうるおいを守り、赤ちゃんにも使用できます。内容量420mL、日本製。',
    urlKey: 'curel-gentle-shampoo-420ml',
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
    baseImage: '/4/9/4901301276070_00.png',
    smallImage: '/4/9/4901301276070_00.png',
    thumbnail: '/4/9/4901301276070_00.png',
  },
  images: [
    { key: 'base_image', label: 'Base Image', path: '/4/9/4901301276070_00.png', alt: null },
    { key: 'small_image', label: 'Small Image', path: '/4/9/4901301276070_00.png', alt: null },
    { key: 'thumbnail', label: 'Thumbnail', path: '/4/9/4901301276070_00.png', alt: null },
  ],
  stats: {
    charCount: 530,
    imageCount: 1,
    headingCount: 3,
    storeViewCode: 'tw',
  },
};
