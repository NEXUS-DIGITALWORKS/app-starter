// 商品・カテゴリの改善候補抽出（features/productContent, features/categories）で共用する
// 言語判定・文字列比較のユーティリティ。多言語カラムに誤った言語の文章が入っていないかを
// ヒューリスティックに検査する用途で、厳密な言語判定ではない。

// CJK統合漢字（拡張A・互換漢字含む）。繁体字と日本語の漢字は同じ範囲を使うため区別できないが、
// 英語欄にこの範囲の文字が含まれていること自体が「英語のはずが中国語/日本語になっている」ことの十分なシグナルになる。
const CJK_REGEX = /[㐀-鿿豈-﫿]/;

// ひらがな・カタカナ。実質的に日本語文にのみ出現するため、CJK漢字と組み合わせて
// 「漢字はあるが仮名が一切ない」＝日本語ではなく繁体字である、の判定に使う。
const KANA_REGEX = /[ぁ-んァ-ヶー]/;

export function containsCjk(text: string): boolean {
  return CJK_REGEX.test(text);
}

export function containsKana(text: string): boolean {
  return KANA_REGEX.test(text);
}

export function looksEnglishOnly(text: string): boolean {
  return !containsCjk(text) && /[a-zA-Z]/.test(text);
}

// 繁体字/英語のテキストが「実質同じ」かどうかの比較用。Magentoエクスポートは全角/半角の違いや
// ノーブレークスペース等の見た目では分からない差異を含むことがあり、単純な === では
// 同一とみなすべきものを見逃すため、Unicode正規化(NFKC)と空白の畳み込みをしてから比較する。
export function normalizeForCompare(text: string): string {
  return text.normalize('NFKC').replace(/\s+/g, ' ').trim();
}
