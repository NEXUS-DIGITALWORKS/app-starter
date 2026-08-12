import type { AppType } from '../types'

export const appTypes: AppType[] = [
  {
    id: 'internal_ops',
    name: '社内業務システム',
    description: '部門・全社の定常業務を電子化する汎用システム',
    examples: ['勤怠管理', '経費精算補助', '社内申請の入口'],
    enabled: true,
  },
  {
    id: 'crm_deals',
    name: '顧客・案件管理',
    description: '顧客・商談・案件の進捗を一元管理',
    examples: ['営業案件管理', '代理店管理', '顧客台帳'],
    enabled: true,
  },
  {
    id: 'approval_workflow',
    name: '申請・承認システム',
    description: '多段階承認・条件分岐のあるワークフロー',
    examples: ['稟議', '休暇申請', '発注承認'],
    enabled: true,
  },
  {
    id: 'reservation',
    name: '予約・受付システム',
    description: '日時・リソースに紐づく予約と受付管理',
    examples: ['施設予約', '面談予約', '順番受付'],
    enabled: true,
  },
  {
    id: 'inventory',
    name: '在庫・受発注・商品管理',
    description: '在庫数・入出庫・発注点管理',
    examples: ['倉庫在庫', '商品マスタ連携', '発注アラート'],
    enabled: true,
  },
  {
    id: 'knowledge_ai_search',
    name: '情報管理・ナレッジ管理／AI検索',
    description: '社内文書・ノウハウの蓄積と検索（RAG含む）',
    examples: ['社内Wiki', '問い合わせFAQ', 'AI文書検索'],
    enabled: true,
  },
  {
    id: 'saas_integration',
    name: 'SaaS間データ連携・業務自動化',
    description: '複数SaaS/基幹システム間のデータ同期・自動化',
    examples: ['会計⇄CRM連携', 'メール自動仕分け', '定期集計'],
    enabled: true,
  },
  {
    id: 'dashboard_analytics',
    name: 'ダッシュボード・分析',
    description: '複数データソースを集約した可視化',
    examples: ['経営ダッシュボード', 'KPIモニタリング'],
    enabled: true,
  },
]
