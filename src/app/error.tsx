'use client';

import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="font-serif text-3xl font-bold mb-2">Something went wrong</h1>
        <p className="text-text-secondary mb-6 text-sm">{error.message || 'An unexpected error occurred.'}</p>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
