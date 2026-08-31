import { describe, expect, it } from 'vitest'
import { diagnoseSystemMode, resolveAiCapabilityIds } from './modeEngine'
import type { RequirementProfile } from '../types'

function profile(entries: RequirementProfile): RequirementProfile {
  return entries
}

describe('diagnoseSystemMode', () => {
  it('リアルタイム性が必須ならP07（リアルタイムWebアプリ）が最上位になる', () => {
    const result = diagnoseSystemMode(
      profile({ realtime: { key: 'realtime', value: 'required', status: 'confirmed' } }),
    )
    expect(result.primary.mode.id).toBe('P07')
  })

  it('スマートフォン中心の利用ならP11（スマホアプリ）が最上位になる', () => {
    const result = diagnoseSystemMode(
      profile({ primary_device: { key: 'primary_device', value: 'smartphone', status: 'confirmed' } }),
    )
    expect(result.primary.mode.id).toBe('P11')
  })

  it('オンプレミス指定ならクラウド前提のP01は除外され、P23が候補に残る', () => {
    const result = diagnoseSystemMode(
      profile({
        company_environment: { key: 'company_environment', value: 'onpremise', status: 'confirmed' },
      }),
    )
    const modeIds = [result.primary.mode.id, ...result.alternatives.map((m) => m.mode.id)]
    expect(modeIds).not.toContain('P01')
    expect(result.primary.mode.id).toBe('P23')
  })

  it('要件が何もない場合でも例外を投げず、いずれかのモードを返す', () => {
    const result = diagnoseSystemMode({})
    expect(result.primary.mode).toBeDefined()
  })
})

describe('resolveAiCapabilityIds', () => {
  it('ai_usageの値からAiCapability idへ変換する', () => {
    const ids = resolveAiCapabilityIds(
      profile({ ai_usage: { key: 'ai_usage', value: ['chat_rag', 'automation'], status: 'confirmed' } }),
    )
    expect(ids).toEqual(['ai-chat-rag', 'ai-automation'])
  })

  it('ai_usageが未指定なら空配列を返す', () => {
    expect(resolveAiCapabilityIds({})).toEqual([])
  })
})
