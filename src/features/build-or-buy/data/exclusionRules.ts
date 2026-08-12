import type { ExclusionRule } from '../types'

export const exclusionRules: ExclusionRule[] = [
  {
    id: 'ex-01',
    conditionKey: 'q_hosting_pref',
    operator: '=',
    conditionValue: 'onprem_required',
    targetType: 'architecture_pattern',
    targetId: 'P3',
    reason: 'BaaS中心型はクラウド専有サービス前提のため、オンプレミス必須要件と両立できない',
  },
  {
    id: 'ex-02',
    conditionKey: 'q_hosting_pref',
    operator: '=',
    conditionValue: 'onprem_required',
    targetType: 'architecture_pattern',
    targetId: 'P6',
    reason: '多くのSaaS間連携・自動化ツールはクラウド前提のため、オンプレミス必須要件と両立しにくい',
  },
  {
    id: 'ex-03',
    conditionKey: 'q_entra',
    operator: '=',
    conditionValue: 'required',
    targetType: 'architecture_pattern',
    targetId: 'P3',
    reason: 'BaaS中心型の主要候補（Supabase/Firebase）はEntra IDに標準対応していない',
  },
  {
    id: 'ex-04',
    conditionKey: 'q_entra',
    operator: '=',
    conditionValue: 'required',
    targetType: 'architecture_pattern',
    targetId: 'P9',
    reason: 'CMS・EC拡張型の主要候補はEntra ID統合が一般的に困難',
  },
]
