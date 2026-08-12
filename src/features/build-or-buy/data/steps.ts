export type DiagnosisStep = {
  id: number
  title: string
  description: string
  questionIds: string[]
}

export const diagnosisSteps: DiagnosisStep[] = [
  {
    id: 1,
    title: 'アプリの目的・概要',
    description: '解決したい課題を教えてください',
    questionIds: ['q_app_type', 'q_problem', 'q_users', 'q_current'],
  },
  {
    id: 2,
    title: '利用範囲・利用者',
    description: '誰が、どのくらいの規模で使うか',
    questionIds: ['q_scope', 'q_users_count', 'q_concurrent', 'q_global', 'q_devices'],
  },
  {
    id: 3,
    title: 'データ・業務要件',
    description: '扱うデータと必要な業務機能',
    questionIds: ['q_data_complexity', 'q_data_volume', 'q_data_traits', 'q_biz_features'],
  },
  {
    id: 4,
    title: '既存システム・連携',
    description: '今お使いのツールとの関係',
    questionIds: ['q_existing_saas', 'q_existing_saas_other', 'q_env', 'q_entra'],
  },
  {
    id: 5,
    title: '運用・技術条件',
    description: '体制・予算・セキュリティ要件',
    questionIds: ['q_dev_team', 'q_ops_team', 'q_budget', 'q_deadline', 'q_hosting_pref', 'q_pii', 'q_security_level'],
  },
  {
    id: 6,
    title: '確認・診断',
    description: '回答内容を確認して診断結果を保存',
    questionIds: [],
  },
]

export function getStep(id: number) {
  return diagnosisSteps.find((step) => step.id === id)
}
