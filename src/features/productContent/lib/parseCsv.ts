// RFC4180ライクな最小CSVパーサ。ダブルクオートで囲まれたフィールド内のカンマ・改行・
// エスケープされたダブルクオート("")に対応する。Magento/Excel由来のCSVはdescription列等に
// HTMLやカンマを含むため、単純な text.split('\n').map(l => l.split(',')) では壊れる。
export function parseCsv(text: string): string[][] {
  // ExcelがUTF-8保存時に付与するBOMを除去
  const input = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  while (i < input.length) {
    const char = input[i];

    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += char;
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (char === ',') {
      row.push(field);
      field = '';
      i += 1;
      continue;
    }
    if (char === '\r') {
      i += 1;
      continue;
    }
    if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i += 1;
      continue;
    }
    field += char;
    i += 1;
  }

  // 末尾に改行がないファイルの最終フィールド・行を回収
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // 空行（末尾の改行由来などフィールド1つだけの空文字列）は除外
  return rows.filter((r) => !(r.length === 1 && r[0] === ''));
}
