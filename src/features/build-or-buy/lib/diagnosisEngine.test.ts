import { describe, expect, it } from 'vitest'
import { categorize, computeArchitectureScores, computeBuildOrBuy, diagnose } from './diagnosisEngine'
import type { Answers } from '../types'

describe('categorize', () => {
  it('buildScoreが-7以下ならカテゴリA', () => {
    expect(categorize(-7, false)).toBe('A')
    expect(categorize(-8, false)).toBe('A')
  })

  it('buildScoreが-4〜-6ならカテゴリB', () => {
    expect(categorize(-6, false)).toBe('B')
    expect(categorize(-4, false)).toBe('B')
  })

  it('buildScoreが-1〜-3ならカテゴリC', () => {
    expect(categorize(-3, false)).toBe('C')
    expect(categorize(-1, false)).toBe('C')
  })

  it('buildScoreが0以上ならカテゴリD', () => {
    expect(categorize(0, false)).toBe('D')
    expect(categorize(10, false)).toBe('D')
  })

  it('hardNoBuildがtrueならbuildScoreによらず常にカテゴリE', () => {
    expect(categorize(10, true)).toBe('E')
    expect(categorize(-8, true)).toBe('E')
  })
})

describe('computeBuildOrBuy', () => {
  it('回答が空でも基礎補正(+2)によりbuildScore=2・カテゴリDになる', () => {
    const result = computeBuildOrBuy({}, 'internal_ops')
    expect(result.buildScore).toBe(2)
    expect(result.category).toBe('D')
    expect(result.hardFlags).toEqual([])
  })

  it('決済・金融相当のセキュリティ要件を選ぶとhard_no_buildフラグが立ちカテゴリEになる', () => {
    const answers: Answers = {
      q_security_level: ['payment_grade'],
      // 他はSaaS寄り(A)に見える回答を混ぜても、hardFlagがcategoryを強制的にEにすることを確認する
      q_current: ['general_saas'],
      q_data_complexity: ['simple'],
    }
    const result = computeBuildOrBuy(answers, 'internal_ops')
    expect(result.hardFlags).toContain('hard_no_build')
    expect(result.category).toBe('E')
  })
})

describe('computeArchitectureScores', () => {
  it('Entra ID必須の場合、P3(BaaS中心型)は除外され、P4(Microsoft統合型)が最上位になる', () => {
    const answers: Answers = { q_entra: ['required'] }
    const { ranked, excludedIds } = computeArchitectureScores(answers)

    expect(excludedIds.has('P3')).toBe(true)
    expect(ranked.some((entry) => entry.pattern.id === 'P3')).toBe(false)
    expect(ranked[0]?.pattern.id).toBe('P4')
  })

  it('除外ルールに該当しないパターンはスコアリングルールの合計点で順位が決まる', () => {
    const answers: Answers = { q_dev_team: ['ai_coding_solo'] }
    const { ranked } = computeArchitectureScores(answers)

    // sr-p3-01: q_dev_team=ai_coding_solo は P3 に score 6 を与える唯一のルール
    expect(ranked[0]?.pattern.id).toBe('P3')
    expect(ranked[0]?.score).toBe(6)
  })
})

describe('diagnose', () => {
  it('最小限の回答でも一貫した結果を返す', () => {
    const result = diagnose({})

    expect(result.buildOrBuy.category).toBe('D')
    expect(result.primaryPattern).toBeDefined()
    expect(result.rankedPatterns.length).toBeLessThanOrEqual(3)
    expect(result.fitScore.overall).toBeGreaterThanOrEqual(0)
    expect(result.fitScore.overall).toBeLessThanOrEqual(100)
    expect(result.reasons.length).toBeGreaterThan(0)
  })

  it('決済・金融相当のセキュリティ要件を選ぶと自作非推奨(E)の代替提案が入る', () => {
    const result = diagnose({ q_security_level: ['payment_grade'] })

    expect(result.buildOrBuy.category).toBe('E')
    expect(result.nonRecommendAlternative).toBeDefined()
    expect(result.buildRange[0]).toContain('自作は非推奨')
  })
})
