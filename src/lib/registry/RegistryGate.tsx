import type { ReactNode } from 'react'
import { useRegistry } from './RegistryProvider'

/**
 * Registry依存ページ専用のガード。ロード完了後のみchildrenをmountするため、
 * 配下のコンポーネントは getRegistrySync() を安全に同期呼び出しできる。
 */
export function RegistryGate({ children }: { children: ReactNode }) {
  const state = useRegistry()

  if (state.status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[#667085]">技術情報を読み込み中...</div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-[#667085]">技術情報の取得に失敗しました。しばらくしてから再度お試しください。</p>
        <p className="text-xs text-[#98A2B3]">{state.error.message}</p>
        <button
          type="button"
          onClick={state.retry}
          className="rounded-lg bg-[#3157E5] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2745C4]"
        >
          再試行
        </button>
      </div>
    )
  }

  return <>{children}</>
}
