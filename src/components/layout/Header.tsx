'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Sparkles, Settings, LogOut, History, Sun, Moon, Swords } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import type { Profile } from '@/types';

interface HeaderProps {
  profile: Profile | null;
}

export function Header({ profile }: HeaderProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const supabase = createClient();

  useState(() => {
    setMounted(true);
  });

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-serif text-lg font-bold">Morning Briefing</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-sm text-text-secondary hidden sm:block">
            {formatDate(new Date())}
          </span>

          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-xl hover:bg-surface transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          <Link href="/community">
            <Button variant="ghost" size="icon" className="relative" title="Community">
              <Swords className="w-4 h-4" />
            </Button>
          </Link>

          <Link href="/history">
            <Button variant="ghost" size="icon" title="History">
              <History className="w-4 h-4" />
            </Button>
          </Link>

          <Link href="/settings">
            <Button variant="ghost" size="icon" title="Settings">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>

          <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
            <LogOut className="w-4 h-4" />
          </Button>

          {profile?.display_name && (
            <span className="text-sm font-medium hidden md:block">
              {profile.display_name}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
