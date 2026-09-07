/** Technology / Category / Tag のid（slug）バリデーション。Worker側 adminService.ts と同じ正規表現。 */
export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

/** Stack Preset のid（P1〜P9・WEB-01等の既存命名を許容するため大文字を許す）。Worker側と同じ正規表現。 */
export const STACK_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9-]*$/

export function isValidSlug(value: string): boolean {
  return SLUG_PATTERN.test(value)
}

export function isValidStackId(value: string): boolean {
  return STACK_ID_PATTERN.test(value)
}
