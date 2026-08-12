import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const location = useLocation();

  if (session === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[#667085]">読み込み中...</div>
    );
  }

  if (session === null) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
