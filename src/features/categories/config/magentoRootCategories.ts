// Magentoカテゴリパスのルートカテゴリ名（例:「関西美克薬粧Main/化妝品」の先頭部分）。
// ストアごとに変わり得るため、コード中に直書きせずここへ集約する。
// 将来的には管理画面の設定値やDBへ移す想定（現時点では定数のみ）。
export type MagentoLocale = 'ja' | 'en' | 'zhTw';

export const MAGENTO_ROOT_CATEGORY_NAME: Record<MagentoLocale, string> = {
  ja: 'MIKJapanMain',
  en: 'MIKJapanMain',
  zhTw: '関西美克薬粧Main',
};
