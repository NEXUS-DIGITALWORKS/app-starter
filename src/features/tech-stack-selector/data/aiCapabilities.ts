import type { AiCapability } from '../types';

// 旧AI-01〜AI-06パターンを、他方式に重ねられる「追加機能」4種へ変換したもの。
// SystemModeとは独立した軸として扱い、排他的にしない（複数選択可）。
export const AI_CAPABILITIES: AiCapability[] = [
  {
    id: 'ai-text',
    name: 'AI文章生成・要約',
    summary: '文章の作成・要約・分類など、テキスト処理をAIに任せる機能',
    elements: ['openai-api', 'claude-api', 'gemini-api'],
    legacyPatternIds: ['AI-01'],
  },
  {
    id: 'ai-chat-rag',
    name: 'AIチャット・RAG（文書検索）',
    summary: '社内資料やPDFを検索し、根拠となる文書をもとにAIが回答するチャット機能',
    elements: ['rag', 'pgvector', 'claude-api', 'openai-api'],
    legacyPatternIds: ['AI-02', 'AI-04'],
  },
  {
    id: 'ai-agent',
    name: 'AIエージェント',
    summary: '複数ステップの判断・外部ツール操作をAIが自律的に行う機能',
    elements: ['langgraph', 'mcp', 'claude-api'],
    legacyPatternIds: ['AI-06'],
  },
  {
    id: 'ai-automation',
    name: 'AI業務自動化',
    summary: '外部SaaS連携や定型業務をAI・自動化ツールで代行する機能',
    elements: ['n8n', 'vercel-ai-sdk', 'mcp'],
    legacyPatternIds: ['AI-05', 'AI-03'],
  },
];

export const AI_CAPABILITY_MAP: Record<string, AiCapability> = Object.fromEntries(
  AI_CAPABILITIES.map((capability) => [capability.id, capability]),
);
