import { describe, expect, it } from 'vitest'
import { buildSelectionForPattern, computePatternMatches, countSelectedElements, getSelectedElements } from './matchEngine'
import type { Selection } from '../types'

describe('getSelectedElements', () => {
  it('選択されたIDに対応する要素を返す', () => {
    const selection: Selection = { frontend: ['react-vite'], database: ['supabase-postgresql'] }
    const elements = getSelectedElements(selection)

    expect(elements.map((e) => e.id)).toEqual(['react-vite', 'supabase-postgresql'])
  })

  it('存在しない要素IDは無視される（不正な共有URL経由の入力を想定）', () => {
    const selection: Selection = { frontend: ['not-a-real-element'] }
    expect(getSelectedElements(selection)).toEqual([])
  })
})

describe('countSelectedElements', () => {
  it('カテゴリをまたいだ選択数の合計を返す', () => {
    const selection: Selection = { frontend: ['react-vite'], database: ['supabase-postgresql', 'redis'] }
    expect(countSelectedElements(selection)).toBe(3)
  })
})

describe('computePatternMatches', () => {
  it('選択した全要素に共通するパターンを完全一致として返す', () => {
    // react-vite: ['WEB-01','BIZ-01','BIZ-05','INF-01']
    // supabase-postgresql: ['WEB-01','WEB-03','WEB-07','MOB-02','AI-01']
    // 共通するのは WEB-01 のみ
    const selection: Selection = { frontend: ['react-vite'], database: ['supabase-postgresql'] }
    const matches = computePatternMatches(selection)

    const perfect = matches.filter((m) => m.isPerfectMatch)
    expect(perfect).toHaveLength(1)
    expect(perfect[0].pattern.id).toBe('WEB-01')
    expect(perfect[0].matchedCount).toBe(2)
  })

  it('未選択の場合は空配列を返す', () => {
    expect(computePatternMatches({})).toEqual([])
  })
})

describe('buildSelectionForPattern', () => {
  it('指定パターンに対応する要素をカテゴリごとに復元する', () => {
    const selection = buildSelectionForPattern('WEB-01')

    expect(selection.frontend).toContain('react-vite')
    expect(selection.database).toContain('supabase-postgresql')
  })

  it('復元したSelectionをcomputePatternMatchesに通すと元のパターンが完全一致になる', () => {
    const selection = buildSelectionForPattern('WEB-01')
    const matches = computePatternMatches(selection)
    const perfect = matches.find((m) => m.pattern.id === 'WEB-01')

    expect(perfect?.isPerfectMatch).toBe(true)
  })
})
