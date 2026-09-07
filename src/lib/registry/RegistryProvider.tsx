import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { loadRegistry, resetRegistry } from './registryCache'
import type { RegistryData } from './types'

type RegistryStatus =
  | { status: 'loading' }
  | { status: 'ready'; data: RegistryData }
  | { status: 'error'; error: Error }

type RegistryContextValue = RegistryStatus & { retry: () => void; refresh: () => Promise<void> }

const RegistryContext = createContext<RegistryContextValue | null>(null)

export function RegistryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RegistryStatus>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    // loadRegistry()はモジュール単位でin-flightリクエストを共有するため、fetch自体は
    // AbortControllerでキャンセルしない（StrictModeの二重effect実行で先勝ちのabortが
    // 後続effectのエラーとして誤伝播するのを避けるため）。代わりにこのeffectが
    // 生きている間だけsetStateする、というcancelledフラグでガードする。
    let cancelled = false
    setState({ status: 'loading' })
    loadRegistry()
      .then((data) => {
        if (!cancelled) setState({ status: 'ready', data })
      })
      .catch((err) => {
        if (!cancelled) setState({ status: 'error', error: err instanceof Error ? err : new Error(String(err)) })
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  const retry = () => {
    // loadRegistry()は失敗時にキャッシュへ書き込まないため、resetは不要だが
    // in-flightのPromiseが残っていないことを明示的に保証するために呼ぶ。
    if (state.status === 'error') resetRegistry()
    setAttempt((n) => n + 1)
  }

  // 管理画面での作成/更新/削除が成功した直後に呼ぶ。retry()と異なり常にキャッシュを
  // 破棄して再取得し、完了をawaitできる（呼び出し側は再取得後の最新dataを続けて使える）。
  const refresh = async () => {
    resetRegistry()
    try {
      const data = await loadRegistry()
      setState({ status: 'ready', data })
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setState({ status: 'error', error })
      throw error
    }
  }

  return <RegistryContext.Provider value={{ ...state, retry, refresh }}>{children}</RegistryContext.Provider>
}

export function useRegistry(): RegistryContextValue {
  const ctx = useContext(RegistryContext)
  if (!ctx) throw new Error('useRegistry() must be used within <RegistryProvider>')
  return ctx
}
