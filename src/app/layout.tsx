import type { Metadata, Viewport } from 'next';
import { Playfair_Display, DM_Sans, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const playfair = Playfair_Display({
  variable: '--font-serif',
  subsets: ['latin'],
  display: 'swap',
});

const dmSans = DM_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0D0D0D',
};

export const metadata: Metadata = {
  title: {
    default: 'Morning Briefing — Your daily ritual',
    template: '%s | Morning Briefing',
  },
  description: 'A personalized daily briefing dashboard with weather, news, habits, journaling, achievements, and AI-powered insights. Start each day with clarity.',
  keywords: ['daily briefing', 'morning routine', 'habit tracker', 'journal', 'weather dashboard', 'AI insights', 'productivity', 'personal dashboard'],
  authors: [{ name: 'Morning Briefing' }],
  creator: 'Morning Briefing',
  metadataBase: new URL('https://papaya-capybara-2d13fb.netlify.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://papaya-capybara-2d13fb.netlify.app',
    siteName: 'Morning Briefing',
    title: 'Morning Briefing — Your daily ritual',
    description: 'A personalized dashboard that brings together weather, news, habits, journaling, community, and AI-powered insights. Start each day with clarity.',
    images: [{ url: 'https://papaya-capybara-2d13fb.netlify.app/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Morning Briefing — Your daily ritual',
    description: 'Weather, news, habits, journal, AI insights, and community in one beautiful daily dashboard.',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: 'n4JEZ4M7xwAyCL05ZndzxXaLLZ_FXoZk6MOj9Ag2558',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
