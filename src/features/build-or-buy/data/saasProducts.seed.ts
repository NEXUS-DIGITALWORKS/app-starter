export type SaasProduct = {
  id: string
  name: string
  appTypeIds: string[]
  /** このパターンが該当する場合に優先表示する（例: Microsoft統合が必要な場合） */
  preferWhenPatternIds?: string[]
  description: string
  strengths: string[]
  /** 月額基本料金の目安（円、公開情報等をもとにした概算） */
  monthlyBaseFee: number
  /** 1ユーザーあたり月額料金の目安（円） */
  monthlyPricePerUser: number
}

export const saasProducts: SaasProduct[] = [
  {
    id: 'kintone',
    name: 'kintone',
    appTypeIds: ['internal_ops', 'crm_deals', 'approval_workflow', 'inventory'],
    description: '業務アプリをノーコードで素早く作れる国産SaaS。承認フロー・帳票・権限管理が標準機能として揃っている',
    strengths: ['短期間で業務アプリを構築できる', '承認フローが標準搭載', '国内での導入実績が豊富'],
    monthlyBaseFee: 0,
    monthlyPricePerUser: 1500,
  },
  {
    id: 'm365_power_platform',
    name: 'Microsoft 365（SharePoint + Power Automate）',
    appTypeIds: ['internal_ops', 'approval_workflow'],
    preferWhenPatternIds: ['P4'],
    description: '既にMicrosoft 365を利用している場合、追加コストを抑えて承認フローや簡易業務アプリを構築できる',
    strengths: ['追加コストが少ない', 'Entra IDとシームレスに連携', 'Teams通知と統合できる'],
    monthlyBaseFee: 0,
    monthlyPricePerUser: 1500,
  },
  {
    id: 'salesforce_sales_cloud',
    name: 'Salesforce Sales Cloud',
    appTypeIds: ['crm_deals'],
    description: '商談・案件管理の定番SaaS。API連携やカスタムオブジェクトによる拡張性が高い',
    strengths: ['営業プロセス管理の実績が豊富', '外部連携APIが充実', 'カスタマイズ性が高い'],
    monthlyBaseFee: 0,
    monthlyPricePerUser: 19800,
  },
  {
    id: 'hubspot_crm',
    name: 'HubSpot CRM',
    appTypeIds: ['crm_deals'],
    description: '無料枠から始められるCRM。マーケティング機能との連携に強みがある',
    strengths: ['低コストで開始できる', 'マーケティング機能と統合できる', 'UIが使いやすい'],
    monthlyBaseFee: 0,
    monthlyPricePerUser: 3000,
  },
  {
    id: 'coubic_stores_reserve',
    name: 'STORES 予約 / Coubic',
    appTypeIds: ['reservation'],
    description: '日時・リソース予約に特化した国産SaaS。空き枠管理や自動通知が標準機能',
    strengths: ['予約管理に特化している', '低コストで導入できる', '決済連携も可能'],
    monthlyBaseFee: 8000,
    monthlyPricePerUser: 0,
  },
  {
    id: 'logizard_zero',
    name: 'ロジザードZERO',
    appTypeIds: ['inventory'],
    description: '倉庫在庫管理に特化した国産SaaS。ハンディ端末連携も標準対応',
    strengths: ['在庫管理に特化している', 'ハンディ端末に対応', '国内導入実績が豊富'],
    monthlyBaseFee: 30000,
    monthlyPricePerUser: 0,
  },
  {
    id: 'notion_qast',
    name: 'Notion / Qast',
    appTypeIds: ['knowledge_ai_search'],
    description: '社内ナレッジの蓄積・共有に特化したSaaS。近年はAI検索機能も強化されている',
    strengths: ['導入が容易', '検索性が高い', '社内Wikiとして定着しやすい'],
    monthlyBaseFee: 0,
    monthlyPricePerUser: 1200,
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    appTypeIds: ['saas_integration'],
    description: '問い合わせ対応・チケット管理の定番SaaS。API/Webhookでの外部連携が豊富',
    strengths: ['外部連携APIが豊富', 'マルチチャネル対応', '導入実績が豊富'],
    monthlyBaseFee: 0,
    monthlyPricePerUser: 7000,
  },
  {
    id: 'power_automate_zapier',
    name: 'Power Automate / Zapier',
    appTypeIds: ['saas_integration'],
    description: 'SaaS間のデータ連携・自動化に特化したノーコードツール',
    strengths: ['ノーコードで連携を構築できる', '対応SaaSコネクタが多い', '低コストで開始できる'],
    monthlyBaseFee: 10000,
    monthlyPricePerUser: 0,
  },
  {
    id: 'looker_studio',
    name: 'Looker Studio',
    appTypeIds: ['dashboard_analytics'],
    description: '複数データソースを無料で可視化できるダッシュボードSaaS',
    strengths: ['無料で始められる', '多様なデータソースに接続できる', '共有が容易'],
    monthlyBaseFee: 0,
    monthlyPricePerUser: 0,
  },
]

/** q_existing_saas の選択肢値 → saasProducts.id のマッピング（一致するものだけ） */
export const existingSaasOptionToProductId: Record<string, string> = {
  kintone: 'kintone',
  m365: 'm365_power_platform',
  salesforce: 'salesforce_sales_cloud',
  hubspot: 'hubspot_crm',
  notion: 'notion_qast',
  zendesk: 'zendesk',
}

export function findSaasProducts(appTypeId: string, patternId?: string): SaasProduct[] {
  const candidates = saasProducts.filter((product) => product.appTypeIds.includes(appTypeId))
  const preferred = candidates.filter((product) => patternId && product.preferWhenPatternIds?.includes(patternId))
  const rest = candidates.filter((product) => !preferred.includes(product))
  return [...preferred, ...rest].slice(0, 2)
}

export function estimateSaasMonthlyCost(product: SaasProduct, userCount: number): number {
  return product.monthlyBaseFee + product.monthlyPricePerUser * Math.max(userCount, 1)
}
