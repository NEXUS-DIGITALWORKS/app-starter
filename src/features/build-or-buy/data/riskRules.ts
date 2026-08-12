import type { RiskRule } from '../types'
import { getSingle, includesValue } from '../lib/answers'

export const riskRules: RiskRule[] = [
  {
    id: 'risk-lockin',
    riskType: 'ロックイン',
    severity: '中',
    message: 'SaaSを中心に据えるため、契約終了時にデータを自社側へ持ち出せなくなるリスクがある',
    mitigation: '日次バックアップ、API/CSVによる定期出力、共通IDでの自社DB保存を検討する',
    matches: (_answers, ctx) => ctx.category === 'A' || ctx.category === 'B',
  },
  {
    id: 'risk-security-global-pii',
    riskType: 'セキュリティ',
    severity: '高',
    message: '個人情報を扱いながら海外利用もあるため、越境移転や準拠法の確認が必要になる',
    mitigation: 'データ保管リージョンの確認、DPA/プライバシーポリシーの整備',
    matches: (answers) => getSingle(answers, 'q_pii') === 'yes' && getSingle(answers, 'q_global') === 'global_now',
  },
  {
    id: 'risk-ops-none',
    riskType: '運用',
    severity: '高',
    message: '運用担当者が不在のまま独自開発すると、障害対応や日常保守が滞るリスクが高い',
    mitigation: '保守委託契約の締結、監視・アラートの自動化を先に整備する',
    matches: (answers, ctx) => getSingle(answers, 'q_ops_team') === 'none' && ctx.category === 'D',
  },
  {
    id: 'risk-maintainability-solo',
    riskType: '保守性',
    severity: '中',
    message: 'AIコーディング中心の少人数体制に対して、選定構成の複雑度がやや高い',
    mitigation: 'よりシンプルな構成（BaaS中心型など）への変更を検討する',
    matches: (answers, ctx) => {
      if (getSingle(answers, 'q_dev_team') !== 'ai_coding_solo') return false
      return ctx.patternId === 'P2' || ctx.patternId === 'P4' || ctx.patternId === 'P7' || ctx.patternId === 'P8'
    },
  },
  {
    id: 'risk-cost-small-build',
    riskType: '費用',
    severity: '中',
    message: '小規模予算に対して独自開発は初期費用が超過するリスクがある',
    mitigation: 'MVP範囲を絞り込む、SaaS＋独自開発（C）への切り替えを検討する',
    matches: (answers, ctx) => getSingle(answers, 'q_budget') === 'small' && ctx.category === 'D',
  },
  {
    id: 'risk-migration-c',
    riskType: 'データ移行',
    severity: '中',
    message: 'SaaS＋独自開発は連携先SaaSの仕様変更に構成が引きずられるリスクがある',
    mitigation: '連携先のAPI/Webhook仕様変更を監視し、疎結合な連携設計を保つ',
    matches: (_answers, ctx) => ctx.category === 'C',
  },
  {
    id: 'risk-scalability-p1-public',
    riskType: '拡張性',
    severity: '中',
    message: '統合型Webアプリを一般公開規模で使い続けると、将来的な分離・再設計が必要になりやすい',
    mitigation: '早期にフロント/バックエンドの責務分離を意識した設計にしておく',
    matches: (answers, ctx) => ctx.patternId === 'P1' && getSingle(answers, 'q_scope') === 'public',
  },
  {
    id: 'risk-incident-public-high-security',
    riskType: '障害時対応',
    severity: '高',
    message: '一般公開かつ高いセキュリティ要件のため、障害時の事業影響・説明責任が大きくなる',
    mitigation: '監視・アラート体制とインシデント対応フローを事前に整備する',
    matches: (answers) => getSingle(answers, 'q_scope') === 'public' && getSingle(answers, 'q_security_level') === 'high',
  },
  {
    id: 'risk-offline-conflict',
    riskType: '保守性',
    severity: '中',
    message: 'オフライン利用がある場合、同期時の競合解決ルールを決めずに実装すると不具合の温床になる',
    mitigation: '競合解決方針（Last Write Wins等）と再送キューの設計を先に固める',
    matches: (answers) => includesValue(answers, 'q_biz_features', 'offline'),
  },
]
