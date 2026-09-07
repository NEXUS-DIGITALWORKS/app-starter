export type DiffToken = { type: 'equal' | 'add' | 'remove'; value: string };

// 文字単位のLCSベース差分。日本語は分かち書きされていないため語単位ではなく文字単位で比較する。
// テキストは商品説明文程度の短さを想定（数百文字）のため計算量は問題にならない。
export function diffText(before: string, after: string): DiffToken[] {
  const a = Array.from(before);
  const b = Array.from(after);
  const n = a.length;
  const m = b.length;

  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const rawTokens: DiffToken[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      rawTokens.push({ type: 'equal', value: a[i] });
      i += 1;
      j += 1;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      rawTokens.push({ type: 'remove', value: a[i] });
      i += 1;
    } else {
      rawTokens.push({ type: 'add', value: b[j] });
      j += 1;
    }
  }
  while (i < n) {
    rawTokens.push({ type: 'remove', value: a[i] });
    i += 1;
  }
  while (j < m) {
    rawTokens.push({ type: 'add', value: b[j] });
    j += 1;
  }

  // 連続する同種トークンを結合して表示用に圧縮する
  const merged: DiffToken[] = [];
  for (const token of rawTokens) {
    const last = merged[merged.length - 1];
    if (last && last.type === token.type) {
      last.value += token.value;
    } else {
      merged.push({ ...token });
    }
  }
  return merged;
}
