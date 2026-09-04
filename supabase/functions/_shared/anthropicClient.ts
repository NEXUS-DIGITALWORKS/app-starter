// Claude Message Batches API への薄いクライアント。
// Anthropic SDKは追加せず、Deno標準のfetchのみで完結させる（Edge Function側の依存を最小化するため）。
// Phase2以降（ai-run-start / ai-run-advance）からもそのまま再利用する想定。

const ANTHROPIC_API_BASE = 'https://api.anthropic.com/v1'
const ANTHROPIC_VERSION = '2023-06-01'

export type AnthropicMessageParams = {
  model: string
  max_tokens: number
  system?: string
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
}

export type BatchRequestItem = {
  custom_id: string
  params: AnthropicMessageParams
}

export type BatchProcessingStatus = 'in_progress' | 'canceling' | 'ended'

export type BatchStatusResponse = {
  id: string
  type: 'message_batch'
  processing_status: BatchProcessingStatus
  request_counts: {
    processing: number
    succeeded: number
    errored: number
    canceled: number
    expired: number
  }
  created_at: string
  ended_at: string | null
  expires_at: string
  results_url: string | null
}

export type BatchResultLine = {
  custom_id: string
  result:
    | { type: 'succeeded'; message: { content: Array<{ type: string; text?: string }> } }
    | { type: 'errored'; error: { type: string; message: string } }
    | { type: 'canceled' }
    | { type: 'expired' }
}

function getApiKey(): string {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set. Run `supabase secrets set ANTHROPIC_API_KEY=...` first.')
  }
  return apiKey
}

function authHeaders(): Record<string, string> {
  return {
    'x-api-key': getApiKey(),
    'anthropic-version': ANTHROPIC_VERSION,
    'content-type': 'application/json',
  }
}

export async function createBatch(requests: BatchRequestItem[]): Promise<BatchStatusResponse> {
  const res = await fetch(`${ANTHROPIC_API_BASE}/messages/batches`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ requests }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Anthropic batch create failed (${res.status}): ${text}`)
  }

  return (await res.json()) as BatchStatusResponse
}

export async function retrieveBatch(batchId: string): Promise<BatchStatusResponse> {
  const res = await fetch(`${ANTHROPIC_API_BASE}/messages/batches/${batchId}`, {
    method: 'GET',
    headers: authHeaders(),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Anthropic batch retrieve failed (${res.status}): ${text}`)
  }

  return (await res.json()) as BatchStatusResponse
}

// resultsはJSONL（改行区切り）で返り、順序は保証されない。
// 呼び出し側は必ず custom_id をキーに突き合わせて処理すること。
export async function fetchBatchResults(resultsUrl: string): Promise<BatchResultLine[]> {
  const res = await fetch(resultsUrl, {
    method: 'GET',
    headers: authHeaders(),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Anthropic batch results fetch failed (${res.status}): ${text}`)
  }

  const text = await res.text()
  return text
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as BatchResultLine)
}
