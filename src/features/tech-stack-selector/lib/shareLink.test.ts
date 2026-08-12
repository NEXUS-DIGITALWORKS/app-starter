import { describe, expect, it } from 'vitest'
import { decodeSelectionFromParam, encodeSelectionToParam } from './shareLink'
import type { Selection } from '../types'

describe('encodeSelectionToParam / decodeSelectionFromParam', () => {
  it('エンコードしたパラメータをデコードすると元のSelectionに戻る', () => {
    const selection: Selection = { frontend: ['react-vite'], database: ['supabase-postgresql', 'redis'] }
    const param = encodeSelectionToParam(selection)

    expect(decodeSelectionFromParam(param)).toEqual(selection)
  })

  it('空配列のカテゴリはエンコード時に除外される', () => {
    const selection: Selection = { frontend: ['react-vite'], database: [] }
    const param = encodeSelectionToParam(selection)

    expect(decodeSelectionFromParam(param)).toEqual({ frontend: ['react-vite'] })
  })

  it('URLセーフなBase64のみを含む（+ / = を含まない）', () => {
    // 十分な件数を詰め込みBase64のパディングや特殊文字が発生する余地を作る
    const selection: Selection = { frontend: ['react-vite', 'nextjs', 'vue-vite', 'nuxt', 'sveltekit'] }
    const param = encodeSelectionToParam(selection)

    expect(param).not.toMatch(/[+/=]/)
  })

  it('不正な入力（改ざんされた共有URL等）に対しては空のSelectionを返す', () => {
    expect(decodeSelectionFromParam('not-valid-base64-json!!')).toEqual({})
    expect(decodeSelectionFromParam('')).toEqual({})
  })
})
