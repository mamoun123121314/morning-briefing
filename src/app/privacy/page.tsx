import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
};

export default function PrivacyPage() {
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
        <h1 className="font-serif text-3xl font-bold mb-8">Privacy Policy</h1>
        <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
          <p><strong className="text-foreground">Last updated:</strong> May 2026</p>

          <h2 className="text-lg font-semibold text-foreground pt-4">1. Data We Collect</h2>
          <p>We collect only the data you provide: email address, display name, city location, journal entries, tasks, habits, and news interests. We use Supabase for authentication and data storage.</p>

          <h2 className="text-lg font-semibold text-foreground pt-4">2. How We Use Data</h2>
          <p>Your data is used solely to provide the Morning Briefing service: personalizing your dashboard, generating AI insights, showing relevant weather and news, and enabling community features like leaderboards and friend activity.</p>

          <h2 className="text-lg font-semibold text-foreground pt-4">3. Third-Party Services</h2>
          <p>We use Supabase (auth + database), Open-Meteo (weather), NewsAPI (news headlines), and Google OAuth (optional sign-in). Each service processes data according to their own privacy policies.</p>

          <h2 className="text-lg font-semibold text-foreground pt-4">4. AI Insights</h2>
          <p>Journal entries may be sent to Claude AI (Anthropic) to generate daily insights. No data is stored by Anthropic beyond the API request. You can disable AI insights in settings.</p>

          <h2 className="text-lg font-semibold text-foreground pt-4">5. Data Retention</h2>
          <p>Your data is retained until you delete your account. You can delete your account at any time from the Settings page, which removes all associated data.</p>

          <h2 className="text-lg font-semibold text-foreground pt-4">6. Contact</h2>
          <p>For questions about this policy, contact the project maintainer through the GitHub repository.</p>
        </div>
      </main>
    </div>
  );
}
