import { User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Account() {
  const { session, profile } = useAuth();

  const name = profile?.display_name || '';
  const email = session?.user.email ?? '';

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-[#111827]">アカウント</h1>
      <p className="mt-1 text-sm text-[#667085]">ログイン中のアカウント情報を確認できます。</p>

      <div className="mt-6 rounded-xl border border-[#D0D5DD] bg-white shadow-[0_12px_32px_rgba(16,24,40,0.08)]">
        <div className="flex items-center gap-4 border-b border-[#EEF0F4] px-6 py-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3157E5] to-[#6D8CF5] text-white shadow-[0_6px_18px_rgba(49,87,229,0.22)]">
            <User size={20} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-[#111827]">{name || '未設定'}</p>
            {email && <p className="truncate text-sm text-[#667085]">{email}</p>}
          </div>
        </div>

        <div className="grid gap-5 px-6 py-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#98A2B3]">表示名</p>
            <p className="mt-1 text-sm font-medium text-[#111827]">{name || '未設定'}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#98A2B3]">メールアドレス</p>
            <p className="mt-1 text-sm font-medium text-[#111827]">{email || '未設定'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
