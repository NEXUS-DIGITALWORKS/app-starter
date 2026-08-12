import { useAuth } from '../hooks/useAuth';
import OnboardingGuide from '../components/OnboardingGuide';

export default function AppHome() {
  const { session, profile } = useAuth();
  const name = profile?.display_name || session?.user.email || '';

  return (
    <div className="max-w-6xl">
      <h1 className="m-0 text-2xl font-bold text-[#0F172A]">{name ? `ようこそ、${name}さん` : 'ホーム'}</h1>

      <div className="mt-8">
        <OnboardingGuide />
      </div>
    </div>
  );
}
