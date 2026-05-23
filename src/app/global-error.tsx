'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { Sentry.captureException(error); }, [error]);

  return (
    <html>
      <body className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="text-center max-w-sm">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="font-serif text-3xl font-bold mb-2">Critical Error</h1>
          <p className="text-text-secondary mb-6 text-sm">Something went very wrong. The team has been notified.</p>
          <Button onClick={reset}>Try Again</Button>
        </div>
      </body>
    </html>
  );
}
