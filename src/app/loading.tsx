import { Sparkles } from 'lucide-react';

export default function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Sparkles className="w-8 h-8 text-primary animate-pulse" />
    </div>
  );
}
