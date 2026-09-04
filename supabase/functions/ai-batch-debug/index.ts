// Claude Message Batches APIとの疎通確認専用エンドポイント（Phase1）。
// リクエストにbatchIdクエリが無ければ新規バッチを1件作成し、あればステータス確認→(ended時)結果取得を行う。
//
// 動作確認手順:
//   1. POST /ai-batch-debug            → { batch_id, processing_status } を取得
//   2. GET  /ai-batch-debug?batchId=xxx → in_progressの間はステータスのみ、endedになったら結果本文まで返す
import { corsHeaders, handleCorsPreflight } from '../_shared/cors.ts'
import { createBatch, fetchBatchResults, retrieveBatch } from '../_shared/anthropicClient.ts'

Deno.serve(async (req) => {
  const preflight = handleCorsPreflight(req)
  if (preflight) return preflight

  const jsonHeaders = { ...corsHeaders, 'content-type': 'application/json' }

  try {
    const url = new URL(req.url)
    const batchId = url.searchParams.get('batchId')

    if (batchId) {
      const status = await retrieveBatch(batchId)

      if (status.processing_status !== 'ended') {
        return new Response(
          JSON.stringify({
            batch_id: status.id,
            processing_status: status.processing_status,
            request_counts: status.request_counts,
          }),
          { headers: jsonHeaders },
        )
      }

      if (!status.results_url) {
        return new Response(
          JSON.stringify({ batch_id: status.id, processing_status: status.processing_status, error: 'results_url is missing despite ended status' }),
          { status: 500, headers: jsonHeaders },
        )
      }

      const results = await fetchBatchResults(status.results_url)
      return new Response(
        JSON.stringify({ batch_id: status.id, processing_status: status.processing_status, results }),
        { headers: jsonHeaders },
      )
    }

    const created = await createBatch([
      {
        custom_id: 'debug-1',
        params: {
          model: 'claude-sonnet-5',
          max_tokens: 256,
          messages: [{ role: 'user', content: 'こんにちは、と一言だけ日本語で返してください。' }],
        },
      },
    ])

    return new Response(
      JSON.stringify({ batch_id: created.id, processing_status: created.processing_status }),
      { headers: jsonHeaders },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: jsonHeaders })
  }
})
