import { describe, expect, it } from 'vitest'
import { resolveHosting } from './hostingEngine'
import { resolveStack } from './stackEngine'
import { SYSTEM_MODE_MAP } from '../data/systemModes'
import type { RequirementProfile } from '../types'

describe('resolveHosting', () => {
  it('P01・低価格優先ならCloudflare Workersを第一候補にする', () => {
    const profile: RequirementProfile = {
      cost_condition: { key: 'cost_condition', value: 'low_cost', status: 'confirmed' },
    }
    const stack = resolveStack(SYSTEM_MODE_MAP['P01'], profile)
    const hosting = resolveHosting('P01', stack, profile)
    expect(hosting.primary).toBe('cloudflare-workers')
  })

  it('会社指定環境がAWSならAWS系サービスへ強制的に寄せる', () => {
    const profile: RequirementProfile = {
      company_environment: { key: 'company_environment', value: 'aws', status: 'confirmed' },
    }
    const stack = resolveStack(SYSTEM_MODE_MAP['P21'], profile)
    const hosting = resolveHosting('P21', stack, profile)
    expect(['aws-amplify', 'aws-app-runner', 'aws-ecs']).toContain(hosting.primary)
  })

  it('代替候補は最大2件までに絞られる', () => {
    const stack = resolveStack(SYSTEM_MODE_MAP['P21'], {})
    const hosting = resolveHosting('P21', stack, {})
    expect(hosting.alternatives.length).toBeLessThanOrEqual(2)
  })
})
