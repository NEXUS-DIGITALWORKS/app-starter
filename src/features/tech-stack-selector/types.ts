export type PatternId = string;

export type Pattern = {
  id: PatternId;
  name: string;
};

export type TechElement = {
  id: string;
  name: string;
  description: string;
  patternIds: PatternId[];
};

export type TechCategory = {
  id: string;
  order: number;
  title: string;
  elements: TechElement[];
};

// カテゴリID -> 選択した要素IDの配列（同一カテゴリ内でも複数選択可）
export type Selection = Record<string, string[]>;

export type PatternMatch = {
  pattern: Pattern;
  matchedCount: number;
  totalSelected: number;
  isPerfectMatch: boolean;
};
