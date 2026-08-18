import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import OnboardingGuide from '../components/OnboardingGuide';

export default function AppHome() {
  const { session, profile } = useAuth();
  const name = profile?.display_name || session?.user.email || '';

  return (
    <div className="max-w-6xl">
      <h1 className="m-0 text-2xl font-bold text-[#0F172A]">{name ? `ようこそ、${name}さん` : 'ホーム'}</h1>

      <Link
        to="/app/products"
        className="mt-6 flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4 transition-colors hover:border-[#3157E5] hover:bg-[#F8FAFC]"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EEF0FE] text-[#3157E5]">
          <Sparkles size={18} />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-[#111827]">商品情報整備AI（Beta）</span>
          <span className="block truncate text-xs text-[#667085]">SKU単位で商品情報を整理・翻訳・SEO整備します</span>
        </span>
      </Link>

      <div className="mt-8">
        <OnboardingGuide />
      </div>
    </div>
  );
}
