// Tech診断 STEP2: 自由文からRequirementProfileを抽出するEdge Function。
// Claude APIキーはこの関数の環境変数（Supabase Secrets）でのみ保持し、フロントには一切渡さない。
import Anthropic from 'npm:@anthropic-ai/sdk@0.70.0';
import { corsHeaders } from '../_shared/cors.ts';
import { EXTRACT_REQUIREMENTS_TOOL } from './schema.ts';

const MAX_INPUT_LENGTH = 4000;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POSTのみ対応しています' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let text: unknown;
  try {
    const body = await req.json();
    text = body?.text;
  } catch {
    return new Response(JSON.stringify({ error: 'リクエストボディが不正です' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (typeof text !== 'string' || text.trim().length === 0) {
    return new Response(JSON.stringify({ error: '自由文（text）を入力してください' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const trimmedText = text.trim().slice(0, MAX_INPUT_LENGTH);

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'サーバー側の設定が未完了です（ANTHROPIC_API_KEY未設定）' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: 'claude-opus-5',
      max_tokens: 4096,
      system:
        'あなたは初心者向けのシステム開発診断アシスタントです。ユーザーが自由に書いた「作りたいもの・困っていること」の文章から、要件項目を抽出してください。文章から明確に読み取れない項目は無理に推測せずstatus=unknownとしてください。',
      tools: [EXTRACT_REQUIREMENTS_TOOL],
      tool_choice: { type: 'tool', name: 'extract_requirements' },
      messages: [{ role: 'user', content: trimmedText }],
    });

    const toolUse = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
    );

    if (!toolUse) {
      return new Response(JSON.stringify({ error: '要件抽出に失敗しました（AI応答にtool_useがありません）' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ profile: toolUse.input }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('extract-requirements failed', error);
    return new Response(JSON.stringify({ error: 'AIによる要件抽出でエラーが発生しました' }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
