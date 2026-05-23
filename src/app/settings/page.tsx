'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { ArrowLeft, Sparkles, MapPin, Hash, Palette, Trash2, CheckCircle2, Plus, X, Trophy, Zap, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { LevelBadge } from '@/components/community/LevelBadge';
import type { Profile, Habit } from '@/types';
import { BreadcrumbJsonLd } from '@/components/shared/BreadcrumbJsonLd';

const NEWS_TOPICS = [
  'Technology', 'Science', 'Health', 'Business',
  'Sports', 'Entertainment', 'Politics', 'World',
];

const HABIT_EMOJIS = [
  { emoji: '🧘', label: 'Meditation' },
  { emoji: '🏃', label: 'Running' },
  { emoji: '📚', label: 'Reading' },
  { emoji: '💧', label: 'Water' },
  { emoji: '📝', label: 'Writing' },
  { emoji: '🌅', label: 'Sunrise' },
  { emoji: '🎯', label: 'Target' },
  { emoji: '📵', label: 'No Phone' },
  { emoji: '🎨', label: 'Art' },
  { emoji: '🎵', label: 'Music' },
  { emoji: '🌿', label: 'Nature' },
  { emoji: '💪', label: 'Exercise' },
];

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [city, setCity] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState('');
  const [saveError, setSaveError] = useState('');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitEmoji, setNewHabitEmoji] = useState('✅');
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data: p } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (p) {
        const profile = p as Profile;
        setProfile(profile);
        setDisplayName(profile.display_name ?? '');
        setCity(profile.city ?? '');
        setInterests(profile.news_interests ?? []);
      }

      const { data: h } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at');

      setHabits((h ?? []) as Habit[]);
    }

    loadData();
  }, [supabase, router]);

  async function geocodeCity(cityName: string): Promise<{ lat: number; lon: number } | null> {
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
      );
      const data = await res.json();
      if (data.results?.[0]) {
        return { lat: data.results[0].latitude, lon: data.results[0].longitude };
      }
    } catch {}
    return null;
  }

  async function handleSave() {
    setSaving(true);
    setSaved('');
    setSaveError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaveError('Not logged in'); setSaving(false); return; }

    try {
      const coords = city ? await geocodeCity(city) : null;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: displayName || null,
          city: city || null,
          latitude: coords?.lat ?? null,
          longitude: coords?.lon ?? null,
          news_interests: interests,
        });

      if (error) {
        setSaveError(error.message);
      } else {
        setSaved('Settings saved!');
        setProfile((prev) => prev ? { ...prev, display_name: displayName, city, news_interests: interests } : prev);
        setTimeout(() => setSaved(''), 2000);
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function addHabit() {
    const name = newHabitName.trim();
    if (!name || habits.length >= 8) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('habits')
      .insert({ user_id: user.id, name, emoji: newHabitEmoji })
      .select()
      .single();

    if (!error && data) {
      setHabits((prev) => [...prev, data as Habit]);
      setNewHabitName('');
    }
  }

  async function deleteHabit(id: string) {
    await supabase.from('habits').delete().eq('id', id);
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }

  return (
    <div className="min-h-screen flex flex-col">
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: '/' },
        { name: 'Settings', url: '/settings' },
      ]} />
      <Header profile={profile} />
      <main className="flex-1 max-w-2xl mx-auto px-6 py-8 w-full">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" title="Back to dashboard">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="font-serif text-3xl font-bold">Settings</h1>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Display Name</label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City, Country (e.g., London, UK)"
              />
              <p className="text-xs text-text-secondary mt-2">
                Used for weather forecasts. Coordinates are auto-resolved.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Habits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                {habits.map((habit) => (
                  <div key={habit.id} className="flex items-center gap-3 group">
                    <span className="text-lg">{habit.emoji}</span>
                    <span className="text-sm font-medium flex-1">{habit.name}</span>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      title="Delete habit"
                      className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-destructive transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {habits.length === 0 && (
                  <p className="text-sm text-text-secondary">No habits yet. Add up to 8.</p>
                )}
              </div>

              {habits.length < 8 && (
                <div className="flex items-center gap-2">
                  <select
                    value={newHabitEmoji}
                    onChange={(e) => setNewHabitEmoji(e.target.value)}
                    title="Choose habit emoji"
                    className="h-10 rounded-xl border border-border bg-transparent px-2 text-sm"
                  >
                    {HABIT_EMOJIS.map((item) => (
                      <option key={item.emoji} value={item.emoji}>{item.emoji} {item.label}</option>
                    ))}
                  </select>
                  <Input
                    placeholder="Habit name..."
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addHabit(); }}
                    className="flex-1 h-10 text-sm"
                  />
                  <button
                    onClick={addHabit}
                    title="Add habit"
                    className="p-2 rounded-lg hover:bg-surface transition-colors cursor-pointer"
                  >
                    <Plus className="w-5 h-5 text-primary" />
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-primary" />
                News Interests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {NEWS_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    onClick={() =>
                      setInterests((prev) =>
                        prev.includes(topic)
                          ? prev.filter((t) => t !== topic)
                          : [...prev, topic]
                      )
                    }
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer ${
                      interests.includes(topic)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-transparent border-border hover:border-primary'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile ? (
                <LevelBadge level={profile.xp_level ?? 1} xp={profile.xp ?? 0} size="md" />
              ) : (
                <p className="text-sm text-text-secondary">Complete tasks and habits to earn XP!</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-primary" />
                Google Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary mb-3">
                Connect your Google Calendar to see your events on the dashboard.
              </p>
              <div className="p-3 rounded-xl bg-surface/50 border border-border text-sm space-y-2">
                <p className="font-medium">Setup instructions:</p>
                <ol className="text-text-secondary list-decimal list-inside space-y-1 text-xs">
                  <li>Go to <span className="font-mono">console.cloud.google.com</span></li>
                  <li>Create a project and enable Google Calendar API</li>
                  <li>Create OAuth 2.0 credentials (Web application)</li>
                  <li>Add redirect URI: <span className="font-mono break-all">{typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : ''}</span></li>
                  <li>Copy Client ID and Secret to <span className="font-mono">.env.local</span>:</li>
                </ol>
                <pre className="text-xs bg-background p-2 rounded-lg mt-2 overflow-x-auto">
                  GOOGLE_CLIENT_ID=your-id{'\n'}
                  GOOGLE_CLIENT_SECRET=your-secret
                </pre>
                <p className="text-xs text-text-secondary mt-2">
                  After setup, calendar events appear automatically on your dashboard.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Theme
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 p-4 rounded-xl border text-center transition-all cursor-pointer ${
                    theme === 'dark' ? 'border-primary bg-primary/10' : 'border-border'
                  }`}
                >
                  <div className="w-8 h-8 bg-[#0D0D0D] rounded-lg mx-auto mb-2 border border-[#2A2A2A]" />
                  <span className="text-sm font-medium">Dark</span>
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className={`flex-1 p-4 rounded-xl border text-center transition-all cursor-pointer ${
                    theme === 'light' ? 'border-primary bg-primary/10' : 'border-border'
                  }`}
                >
                  <div className="w-8 h-8 bg-[#FAF8F3] rounded-lg mx-auto mb-2 border border-[#E0DCD0]" />
                  <span className="text-sm font-medium">Light</span>
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="w-5 h-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary mb-3">
                Permanently delete your account and all data.
              </p>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (!window.confirm('Are you sure? This cannot be undone.')) return;
                  await supabase.auth.signOut();
                  router.push('/');
                }}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between pb-8">
            <div>
              {saveError && <p className="text-sm text-destructive">{saveError}</p>}
              {saved && <p className="text-sm text-green-500">{saved}</p>}
            </div>
            <Button onClick={handleSave} disabled={saving} size="lg">
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
