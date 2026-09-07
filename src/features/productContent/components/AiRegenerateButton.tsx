import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AiRegenerateButtonProps {
  onClick: () => void;
  loading?: boolean;
  label?: string;
}

export default function AiRegenerateButton({ onClick, loading, label = 'AI再提案' }: AiRegenerateButtonProps) {
  return (
    <Button
      type="button"
      size="sm"
      onClick={onClick}
      disabled={loading}
      className="bg-[#3157E5] hover:bg-[#2748C7] hover:opacity-100"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
      {label}
    </Button>
  );
}
