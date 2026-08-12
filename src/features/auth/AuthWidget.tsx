import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import AccountMenu from './AccountMenu';
import AuthForm from './AuthForm';

export default function AuthWidget() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);

  if (isAuthenticated) {
    return <AccountMenu />;
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 appearance-none items-center justify-center rounded-xl border-0 bg-[#3157E5] px-5 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(49,87,229,0.22)] outline-none transition-all duration-200 hover:-translate-y-px hover:bg-[#2748C7] focus-visible:ring-2 focus-visible:ring-[#3157E5] focus-visible:ring-offset-2 active:translate-y-0"
      >
        ログイン
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-30 w-[min(320px,88vw)] rounded-xl border border-[#D0D5DD] bg-white p-5 shadow-[0_12px_32px_rgba(16,24,40,0.12)]">
          <AuthForm />
        </div>
      )}
    </div>
  );
}
