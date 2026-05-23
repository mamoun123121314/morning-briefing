import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-text-secondary hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="font-serif text-lg font-bold">Morning Briefing</span>
        </div>
      </header>
      <main className="flex-1 max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-serif text-3xl font-bold mb-8">Terms of Service</h1>
        <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
          <p><strong className="text-foreground">Last updated:</strong> May 2026</p>

          <h2 className="text-lg font-semibold text-foreground pt-4">1. Acceptance</h2>
          <p>By using Morning Briefing, you agree to these terms. If you do not agree, do not use the service.</p>

          <h2 className="text-lg font-semibold text-foreground pt-4">2. Service</h2>
          <p>Morning Briefing provides a personalized daily briefing dashboard. The service is provided &quot;as is&quot; without warranty of any kind.</p>

          <h2 className="text-lg font-semibold text-foreground pt-4">3. Accounts</h2>
          <p>You are responsible for maintaining your account credentials. You must be at least 13 years old to use this service.</p>

          <h2 className="text-lg font-semibold text-foreground pt-4">4. Acceptable Use</h2>
          <p>You agree not to misuse the service, including but not limited to: attempting to access other users&apos; data, submitting harmful content, or exceeding rate limits.</p>

          <h2 className="text-lg font-semibold text-foreground pt-4">5. Limitation of Liability</h2>
          <p>Morning Briefing is not liable for any damages arising from the use or inability to use the service.</p>

          <h2 className="text-lg font-semibold text-foreground pt-4">6. Changes</h2>
          <p>These terms may be updated at any time. Continued use after changes constitutes acceptance of the new terms.</p>
        </div>
      </main>
    </div>
  );
}
