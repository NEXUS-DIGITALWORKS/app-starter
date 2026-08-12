export type RiskLevel = '完全自動' | 'AI半自動' | '手動';

export type RiskCategory =
  | '①外部依存'
  | '②セキュリティ'
  | '③データ'
  | '④AI・開発品質'
  | '⑤インフラ・障害'
  | '⑥コスト・契約'
  | '⑦運用・人的'
  | '⑧事業継続・変更';

export type RiskItem = {
  id: number;
  category: RiskCategory;
  name: string;
  level: RiskLevel;
  tool: string;
  logic: string;
  description: string;
};

export type RiskStatus = 'pending' | 'pass' | 'action' | 'na';

export type RiskStatusMap = Record<number, RiskStatus>;
