import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="font-serif text-4xl font-bold mb-2">404</h1>
        <p className="text-text-secondary mb-6">This page doesn&apos;t exist. Start your morning fresh.</p>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
