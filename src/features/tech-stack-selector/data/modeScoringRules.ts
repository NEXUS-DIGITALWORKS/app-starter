import type { ModeScoringRule } from '../types';

// RequirementProfile（自由文抽出＋追加質問の回答）からSystemModeを判定するスコアリングルール。
// build-or-buy側の data/scoringRules.ts と同じ「条件キーに応じて対象へ加点」方式を踏襲する。
// value候補は lib/modeEngine.ts のコメントに合わせて統一する。
export const MODE_SCORING_RULES: ModeScoringRule[] = [
  // P01: かんたんWebアプリ
  { id: 'ms-p01-01', conditionKey: 'primary_device', operator: '=', conditionValue: 'pc_browser', targetId: 'P01', score: 2, reason: 'PCブラウザ中心の利用はシンプルなWeb構成で十分' },
  { id: 'ms-p01-02', conditionKey: 'expected_scale', operator: '=', conditionValue: 'small', targetId: 'P01', score: 2, reason: '小規模な想定利用規模' },
  { id: 'ms-p01-03', conditionKey: 'data_relations', operator: '=', conditionValue: 'simple', targetId: 'P01', score: 2, reason: 'データの関係性がシンプル' },
  { id: 'ms-p01-04', conditionKey: 'ops_tolerance', operator: '=', conditionValue: 'none', targetId: 'P01', score: 2, reason: '運用の手間をかけられない' },

  // P02: Web業務アプリ
  { id: 'ms-p02-01', conditionKey: 'public_access', operator: '=', conditionValue: 'internal_only', targetId: 'P02', score: 2, reason: '社内限定の業務利用' },
  { id: 'ms-p02-02', conditionKey: 'data_relations', operator: '=', conditionValue: 'relational', targetId: 'P02', score: 2, reason: 'ある程度関係性のあるデータを扱う' },
  { id: 'ms-p02-03', conditionKey: 'login_required', operator: '=', conditionValue: 'required', targetId: 'P02', score: 1, reason: 'ログイン・ユーザー管理が必要' },

  // P03: SPA＋安全なサーバー処理
  { id: 'ms-p03-01', conditionKey: 'external_integration', operator: '=', conditionValue: 'required', targetId: 'P03', score: 2, reason: '外部サービス連携が必要' },
  { id: 'ms-p03-02', conditionKey: 'security_requirement', operator: '=', conditionValue: 'high', targetId: 'P03', score: 2, reason: '秘密情報を扱う処理を安全に分離したい' },

  // P04: 標準Webサービス
  { id: 'ms-p04-01', conditionKey: 'login_required', operator: '=', conditionValue: 'required', targetId: 'P04', score: 2, reason: '会員制サービスとしてログインが必要' },
  { id: 'ms-p04-02', conditionKey: 'public_access', operator: '=', conditionValue: 'external_customers', targetId: 'P04', score: 2, reason: '社外の顧客向けサービス' },
  { id: 'ms-p04-03', conditionKey: 'search_aggregation', operator: '=', conditionValue: 'required', targetId: 'P04', score: 1, reason: '検索・集計機能が必要' },

  // P05: 本格Webサービス
  { id: 'ms-p05-01', conditionKey: 'expected_scale', operator: '=', conditionValue: 'large', targetId: 'P05', score: 3, reason: '将来的に大規模化する見込み' },
  { id: 'ms-p05-02', conditionKey: 'security_requirement', operator: '=', conditionValue: 'high', targetId: 'P05', score: 2, reason: '高いセキュリティ要求' },
  { id: 'ms-p05-03', conditionKey: 'ops_tolerance', operator: '=', conditionValue: 'dedicated', targetId: 'P05', score: 1, reason: '専任の運用担当者がいる' },

  // P06: 公開Webサイト・ブログ
  { id: 'ms-p06-01', conditionKey: 'public_access', operator: '=', conditionValue: 'public', targetId: 'P06', score: 3, reason: '誰でも見られる公開サイト' },
  { id: 'ms-p06-02', conditionKey: 'login_required', operator: '=', conditionValue: 'not_required', targetId: 'P06', score: 2, reason: 'ログイン不要のコンテンツ配信' },
  { id: 'ms-p06-03', conditionKey: 'data_relations', operator: '=', conditionValue: 'simple', targetId: 'P06', score: 1, reason: 'コンテンツ中心でデータ構造がシンプル' },

  // P07: リアルタイムWebアプリ
  { id: 'ms-p07-01', conditionKey: 'realtime', operator: '=', conditionValue: 'required', targetId: 'P07', score: 4, reason: '複数人の同時利用・即時反映が必要' },

  // P08: オフライン対応Webアプリ
  { id: 'ms-p08-01', conditionKey: 'offline_usage', operator: '=', conditionValue: 'required', targetId: 'P08', score: 4, reason: '電波の弱い環境での利用が前提' },

  // P09: TypeScript業務システム
  { id: 'ms-p09-01', conditionKey: 'data_relations', operator: '=', conditionValue: 'complex', targetId: 'P09', score: 2, reason: '複雑な業務データ構造' },
  { id: 'ms-p09-02', conditionKey: 'expected_scale', operator: '=', conditionValue: 'large', targetId: 'P09', score: 1, reason: '将来的な規模拡大が見込まれる業務システム' },
  { id: 'ms-p09-03', conditionKey: 'ops_tolerance', operator: '=', conditionValue: 'dedicated', targetId: 'P09', score: 1, reason: '専任の運用担当者がいる' },

  // P10: Python業務システム
  { id: 'ms-p10-01', conditionKey: 'search_aggregation', operator: '=', conditionValue: 'required', targetId: 'P10', score: 2, reason: 'データ集計・分析処理が中心' },
  { id: 'ms-p10-02', conditionKey: 'processing_volume', operator: '=', conditionValue: 'large', targetId: 'P10', score: 2, reason: '処理量の多いデータ処理' },

  // P11: スマホアプリ
  { id: 'ms-p11-01', conditionKey: 'primary_device', operator: '=', conditionValue: 'smartphone', targetId: 'P11', score: 4, reason: 'スマートフォンでの利用が中心' },

  // P12: Web・スマホ共通アプリ
  { id: 'ms-p12-01', conditionKey: 'primary_device', operator: '=', conditionValue: 'multiple', targetId: 'P12', score: 3, reason: 'Webとスマホの両方で使いたい' },

  // P13: 軽量PCアプリ
  { id: 'ms-p13-01', conditionKey: 'primary_device', operator: '=', conditionValue: 'desktop_app', targetId: 'P13', score: 2, reason: 'PC専用アプリとしての利用' },
  { id: 'ms-p13-02', conditionKey: 'ops_tolerance', operator: '=', conditionValue: 'none', targetId: 'P13', score: 1, reason: 'サーバー運用不要で完結させたい' },

  // P14: 高機能PCアプリ
  { id: 'ms-p14-01', conditionKey: 'primary_device', operator: '=', conditionValue: 'desktop_app', targetId: 'P14', score: 2, reason: 'PC専用アプリとしての利用' },
  { id: 'ms-p14-02', conditionKey: 'processing_volume', operator: '=', conditionValue: 'large', targetId: 'P14', score: 2, reason: '端末側で処理量の多い作業を行う' },

  // P15: Python PC業務ツール
  { id: 'ms-p15-01', conditionKey: 'primary_device', operator: '=', conditionValue: 'desktop_app', targetId: 'P15', score: 2, reason: 'PC専用ツールとしての利用' },
  { id: 'ms-p15-02', conditionKey: 'search_aggregation', operator: '=', conditionValue: 'required', targetId: 'P15', score: 2, reason: 'データ処理中心のPCツール' },

  // P20: 低価格セルフホスト
  { id: 'ms-p20-01', conditionKey: 'cost_condition', operator: '=', conditionValue: 'free_tier_first', targetId: 'P20', score: 3, reason: '無料枠を最優先したい' },
  { id: 'ms-p20-02', conditionKey: 'cost_condition', operator: '=', conditionValue: 'low_cost', targetId: 'P20', score: 3, reason: '低価格運用を優先したい' },
  { id: 'ms-p20-03', conditionKey: 'company_environment', operator: '=', conditionValue: 'none', targetId: 'P20', score: 1, reason: '会社指定のクラウド環境がない' },

  // P21: 企業クラウド基盤
  { id: 'ms-p21-01', conditionKey: 'company_environment', operator: '=', conditionValue: 'aws', targetId: 'P21', score: 4, reason: '会社の指定環境がAWS' },
  { id: 'ms-p21-02', conditionKey: 'company_environment', operator: '=', conditionValue: 'gcp', targetId: 'P21', score: 4, reason: '会社の指定環境がGoogle Cloud' },
  { id: 'ms-p21-03', conditionKey: 'company_environment', operator: '=', conditionValue: 'azure', targetId: 'P21', score: 4, reason: '会社の指定環境がAzure' },
  { id: 'ms-p21-04', conditionKey: 'expected_scale', operator: '=', conditionValue: 'large', targetId: 'P21', score: 2, reason: '企業規模での利用拡大が見込まれる' },
  { id: 'ms-p21-05', conditionKey: 'security_requirement', operator: '=', conditionValue: 'high', targetId: 'P21', score: 1, reason: '企業として高いセキュリティ要求がある' },

  // P22: 大規模クラウドネイティブ
  { id: 'ms-p22-01', conditionKey: 'processing_volume', operator: '=', conditionValue: 'large', targetId: 'P22', score: 3, reason: '大規模な処理量が見込まれる' },
  { id: 'ms-p22-02', conditionKey: 'expected_scale', operator: '=', conditionValue: 'large', targetId: 'P22', score: 3, reason: '大規模な利用拡大が見込まれる' },
  { id: 'ms-p22-03', conditionKey: 'ops_tolerance', operator: '=', conditionValue: 'dedicated', targetId: 'P22', score: 2, reason: '専任のインフラ運用体制がある' },

  // P23: オンプレミス
  { id: 'ms-p23-01', conditionKey: 'company_environment', operator: '=', conditionValue: 'onpremise', targetId: 'P23', score: 5, reason: '社内サーバー・オンプレミス環境が指定されている' },
  { id: 'ms-p23-02', conditionKey: 'security_requirement', operator: '=', conditionValue: 'high', targetId: 'P23', score: 1, reason: '外部クラウドを避けたいセキュリティ要求' },
];
