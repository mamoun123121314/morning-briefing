import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/shared/BreadcrumbJsonLd';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Changelog',
};

const updates = [
  {
    date: 'May 23, 2026',
    items: [
      'Added Google Search Console verification for SEO',
      'Submitted sitemap for search engine indexing',
      'Added breadcrumb structured data on all pages',
      'Added share buttons on achievements page',
      'Added invite-friends section with social sharing',
      'Added privacy policy and terms pages',
      'Added 404 page and error boundary',
      'Added loading skeletons for better UX',
    ],
  },
  {
    date: 'May 22, 2026',
    items: [
      'Built complete gamification system: friends, XP, levels, achievements, challenges, leaderboards',
      'Added 32 achievements with bronze/silver/gold/platinum tiers',
      'Added 11 level titles (Newcomer → Mythic)',
      'Added 5 weekly challenges with auto-seeding',
      'Added activity feed showing friend activity',
      'Added global + friends leaderboards with rank',
      'Added XP toast notifications on actions',
      'Built community page with tabs',
    ],
  },
  {
    date: 'May 21, 2026',
    items: [
      'Fixed habit completion streak bug (missing user_id)',
      'Fixed all API routes to use getCurrentUser()',
      'Added error display on Focus, AI Insight, Journal cards',
      'Added AI Insight refresh with force param',
      'Added news refresh with cache-busting',
      'Added publication dates on news articles',
      'Security hardening: rate limiting, input validation, CSP headers',
      'Added tooltips to all 13 icon-only buttons',
      'Added Google Calendar setup guide in settings',
    ],
  },
  {
    date: 'May 20, 2026',
    items: [
      'Initial build: Next.js 16 with Supabase auth',
      'Dashboard with 8 cards: Weather, Focus, Calendar, AI Insight, Habits, News, Journal, Community',
      '4-step onboarding wizard',
      'API routes for weather, news, AI, habits, journal, history',
      'Habit tracking with emoji picker and streak calendar',
      'Journal with daily prompts and word count goals',
      'Focus tasks with XP rewards',
      'Calendar heatmap in history page',
    ],
  },
];

export default function ChangelogPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: '/' },
        { name: 'Changelog', url: '/changelog' },
      ]} />
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
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="font-serif text-3xl font-bold">Changelog</h1>
          </div>

          <div className="space-y-10">
            {updates.map((update) => (
              <div key={update.date}>
                <h2 className="font-serif text-lg font-semibold mb-4 text-text-secondary">{update.date}</h2>
                <ul className="space-y-2">
                  {update.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-1 select-none">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
