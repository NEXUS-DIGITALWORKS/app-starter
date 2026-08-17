import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { DEV_LOGIN_EMAIL, DEV_LOGIN_PASSWORD, devSignIn, isDevLoginAvailable } from '../../hooks/useAuth';

type Mode = 'login' | 'signup' | 'forgot';

export default function AuthForm() {
  const devMode = isDevLoginAvailable();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState(devMode ? DEV_LOGIN_EMAIL : '');
  const [password, setPassword] = useState(devMode ? DEV_LOGIN_PASSWORD : '');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);

    if (devMode) {
      const ok = devSignIn(email, password);
      if (!ok) {
        setError('開発用アカウントのメールアドレスまたはパスワードが違います。');
      } else {
        navigate('/app');
      }
      setSubmitting(false);
      return;
    }

    if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        setError(error.message);
      } else {
        setInfo('パスワード再設定用のメールを送信しました。メール内のリンクから新しいパスワードを設定してください。');
      }
      setSubmitting(false);
      return;
    }

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        navigate('/app');
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName || undefined } },
      });
      if (error) {
        setError(error.message);
      } else {
        setInfo('確認メールを送信しました。メール内のリンクから登録を完了してください。');
      }
    }

    setSubmitting(false);
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError('');
    setInfo('');
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {devMode && (
        <p className="form-msg info">
          開発用アカウントでログイン後の画面を確認できます。
          <br />
          email: {DEV_LOGIN_EMAIL}
          <br />
          password: {DEV_LOGIN_PASSWORD}
        </p>
      )}

      {!devMode && mode !== 'forgot' && (
        <div className="auth-tabs">
          <button
            type="button"
            className="btn btn-tab"
            data-active={mode === 'login'}
            onClick={() => switchMode('login')}
            disabled={mode === 'login'}
          >
            ログイン
          </button>
          <button
            type="button"
            className="btn btn-tab"
            data-active={mode === 'signup'}
            onClick={() => switchMode('signup')}
            disabled={mode === 'signup'}
          >
            サインアップ
          </button>
        </div>
      )}

      {!devMode && mode === 'signup' && (
        <input
          type="text"
          className="field"
          placeholder="表示名（任意）"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      )}
      <input
        type="email"
        className="field"
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      {mode !== 'forgot' && (
        <input
          type="password"
          className="field"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      )}

      {!devMode && mode === 'login' && (
        <button type="button" className="auth-link" onClick={() => switchMode('forgot')}>
          パスワードをお忘れですか？
        </button>
      )}

      <button className="btn btn-primary" type="submit" disabled={submitting}>
        {devMode
          ? 'ログイン（開発用）'
          : mode === 'login'
            ? 'ログイン'
            : mode === 'signup'
              ? 'サインアップ'
              : '再設定メールを送信'}
      </button>

      {!devMode && mode === 'forgot' && (
        <button type="button" className="auth-link" onClick={() => switchMode('login')}>
          ログインに戻る
        </button>
      )}

      {error && <p className="form-msg error">{error}</p>}
      {info && <p className="form-msg info">{info}</p>}
    </form>
  );
}
