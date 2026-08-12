import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

type Profile = { id: string; display_name: string; avatar_url: string | null } | null;

type AuthState = {
  session: Session | null | undefined;
  isAuthenticated: boolean;
  profile: Profile;
};

// useAuth()は複数コンポーネントから呼ばれる想定のため、セッション監視は
// モジュール単位のシングルトンに持たせ、各コンポーネントは購読のみ行う。
let state: AuthState = { session: undefined, isAuthenticated: false, profile: null };
let initialized = false;
const listeners = new Set<(state: AuthState) => void>();

function setState(patch: Partial<AuthState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener(state));
}

// --- 開発用ログイン迂回 ---------------------------------------------------
// .env が未設定（isSupabaseConfigured() === false）の間だけ有効なローカル専用
// ログイン。Supabase接続情報が設定された瞬間にisDevLoginAvailable()がfalseに
// なり、一切機能しなくなる。バックエンドなしで/app配下の画面を検証するための
// 迂回であり、本番の認証経路には影響しない。
export const DEV_LOGIN_EMAIL = 'dev@local.test';
export const DEV_LOGIN_PASSWORD = 'Bt#7qLr2!xVn9Zk';
const DEV_SESSION_TOKEN = 'dev-local-session';
const DEV_USER_ID = 'dev-local-user';
const DEV_DISPLAY_NAME = 'Demo User';
const DEV_STORAGE_KEY = 'dev-auth-active';

export function isDevLoginAvailable(): boolean {
  return !isSupabaseConfigured();
}

function createDevSession(): Session {
  const nowSeconds = Math.floor(Date.now() / 1000);
  return {
    access_token: DEV_SESSION_TOKEN,
    refresh_token: 'dev-local-refresh',
    expires_in: 60 * 60 * 24,
    expires_at: nowSeconds + 60 * 60 * 24,
    token_type: 'bearer',
    user: {
      id: DEV_USER_ID,
      aud: 'authenticated',
      app_metadata: {},
      user_metadata: { display_name: DEV_DISPLAY_NAME },
      email: DEV_LOGIN_EMAIL,
      created_at: new Date().toISOString(),
    },
  } as unknown as Session;
}

function isDevSession(session: AuthState['session']): boolean {
  return Boolean(session && (session as Session).access_token === DEV_SESSION_TOKEN);
}

export function devSignIn(email: string, password: string): boolean {
  if (!isDevLoginAvailable()) return false;
  if (email !== DEV_LOGIN_EMAIL || password !== DEV_LOGIN_PASSWORD) return false;

  localStorage.setItem(DEV_STORAGE_KEY, '1');
  setState({
    session: createDevSession(),
    isAuthenticated: true,
    profile: { id: DEV_USER_ID, display_name: DEV_DISPLAY_NAME, avatar_url: null },
  });
  return true;
}

export async function signOut(): Promise<void> {
  if (isDevSession(state.session)) {
    localStorage.removeItem(DEV_STORAGE_KEY);
    setState({ session: null, isAuthenticated: false, profile: null });
    return;
  }
  await supabase.auth.signOut();
}
// ---------------------------------------------------------------------------

async function fetchProfile(userId: string) {
  const { data } = await supabase
    .from('user_profiles')
    .select('id, display_name, avatar_url')
    .eq('id', userId)
    .single();
  setState({ profile: data ?? null });
}

function initAuth() {
  if (initialized) return;
  initialized = true;

  if (isDevLoginAvailable() && localStorage.getItem(DEV_STORAGE_KEY) === '1') {
    setState({
      session: createDevSession(),
      isAuthenticated: true,
      profile: { id: DEV_USER_ID, display_name: DEV_DISPLAY_NAME, avatar_url: null },
    });
    return;
  }

  supabase.auth.getSession().then(({ data }) => {
    setState({ session: data.session, isAuthenticated: Boolean(data.session) });
    if (data.session) fetchProfile(data.session.user.id);
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    setState({ session, isAuthenticated: Boolean(session), profile: session ? state.profile : null });
    if (session) fetchProfile(session.user.id);
  });
}

export function useAuth(): AuthState {
  const [local, setLocal] = useState<AuthState>(state);

  useEffect(() => {
    initAuth();
    setLocal(state);
    listeners.add(setLocal);
    return () => {
      listeners.delete(setLocal);
    };
  }, []);

  return local;
}
