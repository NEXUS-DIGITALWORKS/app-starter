import type { Answers } from '../types'

export function getAnswer(answers: Answers, id: string): string[] {
  return answers[id] ?? []
}

export function getSingle(answers: Answers, id: string): string | undefined {
  return answers[id]?.[0]
}

export function getNumber(answers: Answers, id: string): number | undefined {
  const raw = answers[id]?.[0]
  if (raw === undefined) return undefined
  const value = Number(raw)
  return Number.isFinite(value) ? value : undefined
}

export function includesValue(answers: Answers, id: string, value: string): boolean {
  return getAnswer(answers, id).includes(value)
}
