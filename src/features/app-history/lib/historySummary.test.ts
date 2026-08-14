import { describe, expect, it } from 'vitest'
import { buildDiagnosisSummary, countSelectedTechItems } from './historySummary'

describe('countSelectedTechItems', () => {
  it('カテゴリごとの選択数を合算して返す', () => {
    const selection = {
      frontend: ['react-vite', 'nextjs'],
      backend: ['supabase-data-api'],
      empty: [],
    }

    expect(countSelectedTechItems(selection)).toBe(3)
  })
})

describe('buildDiagnosisSummary', () => {
  it('診断の見出しと主要情報を整形する', () => {
    const entry = {
      build_or_buy_result: { category: 'D', label: 'カスタム開発を推奨' },
      recommended_stack: { patternId: 'BIZ-01' },
      score_details: { buildScore: 8 },
      structured_requirements: { appTypeId: 'business' },
    }

    expect(buildDiagnosisSummary(entry)).toEqual({
      title: 'カスタム開発を推奨',
      category: 'D',
      patternId: 'BIZ-01',
      buildScore: 8,
      appTypeId: 'business',
    })
  })
})
