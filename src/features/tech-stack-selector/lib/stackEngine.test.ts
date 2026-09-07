import { describe, expect, it } from 'vitest'
import { resolveStack } from './stackEngine'
import { SYSTEM_MODE_MAP } from '../data/systemModes'
import type { RequirementProfile } from '../types'

describe('resolveStack', () => {
  it('会社指定環境がなければP01のデフォルト候補（Supabase系）を選ぶ', () => {
    const stack = resolveStack(SYSTEM_MODE_MAP['P01'], {})
    expect(stack.database).toBe('supabase-postgresql')
    expect(stack.auth).toBe('supabase-auth')
  })

  it('会社指定環境がGoogle CloudならFirebase系を優先する', () => {
    const profile: RequirementProfile = {
      company_environment: { key: 'company_environment', value: 'gcp', status: 'confirmed' },
    }
    const stack = resolveStack(SYSTEM_MODE_MAP['P11'], profile)
    expect(stack.database).toBe('firestore')
    expect(stack.auth).toBe('firebase-auth')
  })

  it('ai_usageが設定されていればstack.aiが埋まる', () => {
    const profile: RequirementProfile = {
      ai_usage: { key: 'ai_usage', value: ['chat_rag'], status: 'confirmed' },
    }
    const stack = resolveStack(SYSTEM_MODE_MAP['P01'], profile)
    expect(stack.ai).toBeDefined()
  })
})
