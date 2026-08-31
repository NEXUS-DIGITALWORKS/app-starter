import type { FollowUpQuestion } from '../types';

// 自由文から確定できなかった項目のみ質問する候補プール。全問を必ず聞くわけではない
// （lib/missingQuestions.ts が RequirementProfile の unknown/未取得キーだけを抽出して使う）。
export const FOLLOW_UP_QUESTIONS: FollowUpQuestion[] = [
  {
    key: 'public_access',
    question: '社外からも利用しますか？',
    options: [
      { value: 'internal_only', label: '社内だけ' },
      { value: 'remote_staff', label: '自宅・外出先からも使う' },
      { value: 'external_customers', label: '顧客など社外の人も使う' },
      { value: 'unknown', label: 'まだ分からない' },
    ],
  },
  {
    key: 'automation',
    question: '処理は自動で実行したいですか？',
    options: [
      { value: 'manual', label: 'ボタンを押したときだけ' },
      { value: 'on_action', label: '登録時など特定の操作時' },
      { value: 'scheduled', label: '毎日・毎時間など定期実行' },
      { value: 'unknown', label: 'まだ決めていない' },
    ],
  },
  {
    key: 'company_environment',
    question: '会社から指定されている環境はありますか？',
    options: [
      { value: 'none', label: '特にない・分からない' },
      { value: 'aws', label: 'AWS' },
      { value: 'gcp', label: 'Google Cloud / Firebase' },
      { value: 'azure', label: 'Microsoft Azure' },
      { value: 'onpremise', label: '社内サーバー' },
    ],
  },
  {
    key: 'cost_condition',
    question: '費用面で優先したいことはありますか？',
    options: [
      { value: 'free_tier_first', label: '無料枠を最優先したい' },
      { value: 'low_cost', label: 'できるだけ低価格にしたい' },
      { value: 'ops_ease', label: '多少費用がかかっても運用の簡単さを優先したい' },
      { value: 'reliability_first', label: '費用より信頼性・拡張性を優先したい' },
    ],
  },
  {
    key: 'ops_tolerance',
    question: 'システムの面倒を見られる担当者はいますか？',
    options: [
      { value: 'none', label: 'いない（できるだけお任せしたい）' },
      { value: 'light', label: '簡単な運用ならできる' },
      { value: 'dedicated', label: '専任の担当者がいる' },
    ],
  },
];

export const FOLLOW_UP_QUESTION_MAP: Record<string, FollowUpQuestion> = Object.fromEntries(
  FOLLOW_UP_QUESTIONS.map((question) => [question.key, question]),
);
