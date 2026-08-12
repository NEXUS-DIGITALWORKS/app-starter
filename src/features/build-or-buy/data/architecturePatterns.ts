import type { ArchitecturePattern } from '../types'

export const architecturePatterns: ArchitecturePattern[] = [
  {
    id: 'P1',
    name: '統合型Webアプリ',
    description: 'フロント・バックエンド・管理画面を一つのフレームワークで構築',
    complexityLevel: 2,
    suitableConditions: ['小中規模', '開発者少数', '単一チームで完結', '納期優先'],
    unsuitableConditions: ['大規模同時アクセス', 'フロント/バックエンドを別チームで運用したい'],
    candidates: ['Django', 'Laravel', 'Ruby on Rails', 'ASP.NET Core', 'Spring Boot＋テンプレート', 'Next.js単体構成'],
  },
  {
    id: 'P2',
    name: 'フロント・API分離型',
    description: '画面とAPIを分離し、モバイル共有や長期拡張に備える',
    complexityLevel: 3,
    suitableConditions: ['モバイルアプリとAPI共有', '外部公開SaaS', '長期拡張前提'],
    unsuitableConditions: ['MVP・小規模・開発速度最優先'],
    candidates: ['React', 'Vue', 'Angular', 'Next.js', 'Nuxt', 'NestJS', 'FastAPI', 'ASP.NET Core', 'Go'],
  },
  {
    id: 'P3',
    name: 'BaaS中心型',
    description: '認証・DB・ストレージ・リアルタイムをBaaSで構築',
    complexityLevel: 1,
    suitableConditions: ['MVP', '少人数開発', 'AIコーディング中心', '開発速度最優先'],
    unsuitableConditions: ['複雑なSQL集計', 'オンプレミス必須', '厳密なトランザクション制御'],
    candidates: ['Supabase', 'Firebase', 'Appwrite', 'PocketBase', 'AWS Amplify'],
  },
  {
    id: 'P4',
    name: 'Microsoft統合型',
    description: 'Microsoft 365 / Entra ID / Azureを前提とした構成',
    complexityLevel: 3,
    suitableConditions: ['Microsoft 365利用', 'Entra ID必須', 'Windows/Azure統一'],
    unsuitableConditions: ['Microsoft環境がない', '脱Microsoftを志向'],
    candidates: ['ASP.NET Core', 'Blazor', 'Azure SQL', 'Entra ID', 'Azure Functions', 'Power Platform'],
  },
  {
    id: 'P5',
    name: 'Python業務・AI型',
    description: 'AI/RAG、データ処理、自動化を中心とした構成',
    complexityLevel: 2,
    suitableConditions: ['AI/RAG', 'PDF・Excel処理', 'データ分析・自動化'],
    unsuitableConditions: ['リッチなSPA UIが必須', 'リアルタイム性が極めて高い'],
    candidates: ['Python', 'Django', 'FastAPI', 'Flask', 'Streamlit', 'Gradio', 'Celery', 'Pandas'],
  },
  {
    id: 'P6',
    name: 'SaaS連携・自動化型',
    description: 'SaaS間のデータ同期・定期処理・通知の自動化が主目的',
    complexityLevel: 1,
    suitableConditions: ['SaaS間データ同期', '定期処理', '通知の自動化が主目的'],
    unsuitableConditions: ['独自UIを持つ業務システム本体が必要'],
    candidates: ['n8n', 'Make', 'Zapier', 'Power Automate', 'Python', 'Node.js', 'Cloud Functions'],
  },
  {
    id: 'P7',
    name: 'モバイル中心型',
    description: '現場入力・オフライン利用・端末機能が中核',
    complexityLevel: 3,
    suitableConditions: ['現場入力', 'オフライン利用', '位置情報・カメラ等端末機能が中核'],
    unsuitableConditions: ['PC管理画面が主用途'],
    candidates: ['Swift', 'Kotlin', 'Flutter', 'React Native', 'Expo', 'Capacitor'],
  },
  {
    id: 'P8',
    name: 'デスクトップ型',
    description: '店舗端末・POS連携やオフライン常時稼働の業務ツール',
    complexityLevel: 3,
    suitableConditions: ['店舗端末・POS連携', 'Windows専用業務ツール', 'オフライン常時稼働'],
    unsuitableConditions: ['複数拠点からのWebアクセスが前提'],
    candidates: ['.NET', 'WPF', 'WinUI', 'Tauri', 'Electron', 'PySide', 'Flet'],
  },
  {
    id: 'P9',
    name: 'CMS・EC拡張型',
    description: '全面自作ではなく既存EC/CMS基盤を拡張利用',
    complexityLevel: 1,
    suitableConditions: ['一般的なEC・CMS機能が中心', '独自機能は付加的'],
    unsuitableConditions: ['業務フロー全体が既存EC/CMSの概念に合わない'],
    candidates: ['Shopify', 'Magento', 'WooCommerce', 'EC-CUBE', 'WordPress', 'Headless CMS'],
  },
]

export function getArchitecturePattern(id: string) {
  return architecturePatterns.find((pattern) => pattern.id === id)
}
