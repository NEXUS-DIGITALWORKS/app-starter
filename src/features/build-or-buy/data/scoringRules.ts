import type { ScoringRule } from '../types'

export const scoringRules: ScoringRule[] = [
  // P1: 統合型Webアプリ
  { id: 'sr-p1-01', conditionKey: 'q_scope', operator: '=', conditionValue: 'internal_only', targetType: 'architecture_pattern', targetId: 'P1', score: 2, reason: '社内限定なら単一フレームワークで完結できる' },
  { id: 'sr-p1-02', conditionKey: 'q_deadline', operator: '=', conditionValue: 'asap', targetType: 'architecture_pattern', targetId: 'P1', score: 2, reason: '短納期では構成をシンプルに保つ方が現実的' },
  { id: 'sr-p1-03', conditionKey: 'q_data_complexity', operator: '=', conditionValue: 'medium', targetType: 'architecture_pattern', targetId: 'P1', score: 1, reason: '中程度のデータ構造は統合型で十分扱える' },

  // P2: フロント・API分離型
  { id: 'sr-p2-01', conditionKey: 'q_devices', operator: 'includes', conditionValue: 'native_app', targetType: 'architecture_pattern', targetId: 'P2', score: 3, reason: 'モバイルアプリとAPIを共有する構成に適している' },
  { id: 'sr-p2-02', conditionKey: 'q_scope', operator: '=', conditionValue: 'public', targetType: 'architecture_pattern', targetId: 'P2', score: 3, reason: '外部公開サービスは画面とAPIの分離が長期的に有利' },
  { id: 'sr-p2-03', conditionKey: 'q_deadline', operator: '=', conditionValue: 'flexible', targetType: 'architecture_pattern', targetId: 'P2', score: 1, reason: '長期拡張前提であれば分離構成の投資回収がしやすい' },

  // P3: BaaS中心型
  { id: 'sr-p3-01', conditionKey: 'q_dev_team', operator: '=', conditionValue: 'ai_coding_solo', targetType: 'architecture_pattern', targetId: 'P3', score: 6, reason: 'AIコーディング中心の少人数開発はBaaS中心型が最も速い' },
  { id: 'sr-p3-02', conditionKey: 'q_budget', operator: '=', conditionValue: 'small', targetType: 'architecture_pattern', targetId: 'P3', score: 4, reason: '小規模予算ではインフラ運用コストを抑えられるBaaSが有利' },
  { id: 'sr-p3-03', conditionKey: 'q_deadline', operator: '=', conditionValue: 'asap', targetType: 'architecture_pattern', targetId: 'P3', score: 3, reason: '短納期はBaaSの開発速度が活きる' },

  // P4: Microsoft統合型
  { id: 'sr-p4-01', conditionKey: 'q_entra', operator: '=', conditionValue: 'required', targetType: 'architecture_pattern', targetId: 'P4', score: 8, reason: 'Entra ID必須はMicrosoft統合型が唯一の高適合パターン' },
  { id: 'sr-p4-02', conditionKey: 'q_entra', operator: '=', conditionValue: 'preferred', targetType: 'architecture_pattern', targetId: 'P4', score: 3, reason: 'Microsoft認証をできれば統一したい場合も適合度が上がる' },
  { id: 'sr-p4-03', conditionKey: 'q_env', operator: 'includes', conditionValue: 'm365', targetType: 'architecture_pattern', targetId: 'P4', score: 4, reason: '既存Microsoft 365資産との親和性' },
  { id: 'sr-p4-04', conditionKey: 'q_env', operator: 'includes', conditionValue: 'azure', targetType: 'architecture_pattern', targetId: 'P4', score: 3, reason: '既存Azure環境との親和性' },

  // P5: Python業務・AI型
  { id: 'sr-p5-01', conditionKey: 'q_data_traits', operator: 'includes', conditionValue: 'ai_search', targetType: 'architecture_pattern', targetId: 'P5', score: 6, reason: 'AI検索・類似検索はpgvector/Python構成に適合' },
  { id: 'sr-p5-02', conditionKey: 'q_biz_features', operator: 'includes', conditionValue: 'reporting', targetType: 'architecture_pattern', targetId: 'P5', score: 3, reason: '帳票・Excel処理はPython系のライブラリ資産が豊富' },
  { id: 'sr-p5-03', conditionKey: 'q_app_type', operator: '=', conditionValue: 'knowledge_ai_search', targetType: 'architecture_pattern', targetId: 'P5', score: 5, reason: 'ナレッジ管理・AI検索領域は本パターンの主戦場' },

  // P6: SaaS連携・自動化型
  { id: 'sr-p6-01', conditionKey: 'q_app_type', operator: '=', conditionValue: 'saas_integration', targetType: 'architecture_pattern', targetId: 'P6', score: 5, reason: 'SaaS間連携・自動化が主目的の領域に合致' },
  { id: 'sr-p6-02', conditionKey: 'q_biz_features', operator: 'includes', conditionValue: 'batch', targetType: 'architecture_pattern', targetId: 'P6', score: 3, reason: '定期バッチ処理は自動化ツールと相性が良い' },
  { id: 'sr-p6-03', conditionKey: 'q_biz_features', operator: 'includes', conditionValue: 'external_integration', targetType: 'architecture_pattern', targetId: 'P6', score: 2, reason: '外部システム連携が中心の要件に合致' },

  // P7: モバイル中心型
  { id: 'sr-p7-01', conditionKey: 'q_biz_features', operator: 'includes', conditionValue: 'offline', targetType: 'architecture_pattern', targetId: 'P7', score: 6, reason: 'オフライン利用がUXの中核であればモバイル中心型が最適' },
  { id: 'sr-p7-02', conditionKey: 'q_devices', operator: 'includes', conditionValue: 'native_app', targetType: 'architecture_pattern', targetId: 'P7', score: 3, reason: 'ネイティブアプリ前提の要件に合致' },
  { id: 'sr-p7-03', conditionKey: 'q_app_type', operator: '=', conditionValue: 'inventory', targetType: 'architecture_pattern', targetId: 'P7', score: 2, reason: '現場入力用途はモバイル中心型と相性が良い' },

  // P8: デスクトップ型
  { id: 'sr-p8-01', conditionKey: 'q_devices', operator: 'includes', conditionValue: 'pos_terminal', targetType: 'architecture_pattern', targetId: 'P8', score: 6, reason: '店舗POS端末との連携はデスクトップ型が扱いやすい' },
  { id: 'sr-p8-02', conditionKey: 'q_hosting_pref', operator: '=', conditionValue: 'onprem_required', targetType: 'architecture_pattern', targetId: 'P8', score: 3, reason: 'オンプレミス常時稼働はデスクトップ型と相性が良い' },

  // P9: CMS・EC拡張型
  { id: 'sr-p9-01', conditionKey: 'q_env', operator: 'includes', conditionValue: 'ec', targetType: 'architecture_pattern', targetId: 'P9', score: 5, reason: '既存EC基盤があるなら拡張の方が合理的' },
]
