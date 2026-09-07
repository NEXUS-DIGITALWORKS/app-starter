import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import logo from '../assets/logo.png';
import '../App.css';

export default function ResetPassword() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('パスワードが一致しません。');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    navigate('/app');
  }

  return (
    <div className="page tools-scope">
      <header className="site-header">
        <Link to="/" className="brand">
          <img src={logo} alt="BizTools" className="brand-logo" />
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm rounded-xl border border-[#D0D5DD] bg-white p-6 shadow-[0_12px_32px_rgba(16,24,40,0.08)]">
          <h1 className="text-lg font-bold text-[#111827]">新しいパスワードを設定</h1>

          {session === undefined && (
            <p className="mt-4 text-sm text-[#667085]">確認しています...</p>
          )}

          {session === null && (
            <div className="mt-4 space-y-3">
              <p className="form-msg error">
                リンクの有効期限が切れているか、無効なリンクです。もう一度パスワード再設定をリクエストしてください。
              </p>
              <Link to="/" className="auth-link">
                トップページへ戻る
              </Link>
            </div>
          )}

          {session && (
            <form onSubmit={handleSubmit} className="auth-form mt-4">
              <p className="text-sm text-[#667085]">新しいパスワードを入力してください。</p>
              <input
                type="password"
                className="field"
                placeholder="新しいパスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <input
                type="password"
                className="field"
                placeholder="新しいパスワード（確認）"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                パスワードを更新
              </button>
              {error && <p className="form-msg error">{error}</p>}
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
