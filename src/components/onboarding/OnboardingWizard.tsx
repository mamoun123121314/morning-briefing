'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, ArrowRight, ArrowLeft, MapPin, CheckCircle2 } from 'lucide-react';

const NEWS_TOPICS = [
  'Technology', 'Science', 'Health', 'Business',
  'Sports', 'Entertainment', 'Politics', 'World',
];

const HABIT_SUGGESTIONS = [
  { emoji: '🧘', name: 'Meditate' },
  { emoji: '🏃', name: 'Exercise' },
  { emoji: '📚', name: 'Read' },
  { emoji: '💧', name: 'Drink Water' },
  { emoji: '📝', name: 'Journal' },
  { emoji: '🌅', name: 'Wake Up Early' },
  { emoji: '🎯', name: 'Review Goals' },
  { emoji: '📵', name: 'No Phone Morning' },
];

interface OnboardingWizardProps {
  userId: string;
}

export function OnboardingWizard({ userId }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [city, setCity] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [habits, setHabits] = useState<{ emoji: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const steps = [
    { title: 'Welcome', subtitle: "Let's personalize your morning" },
    { title: 'Location', subtitle: 'Where are you based?' },
    { title: 'Interests', subtitle: 'What topics interest you?' },
    { title: 'Habits', subtitle: 'What habits do you want to track?' },
  ];

  async function finishOnboarding() {
    setLoading(true);

    await supabase.from('profiles').upsert({
      id: userId,
      display_name: displayName || null,
      city: city || null,
      news_interests: interests,
    });

    for (const habit of habits) {
      await supabase.from('habits').insert({
        user_id: userId,
        name: habit.name,
        emoji: habit.emoji,
      });
    }

    // Generate initial AI insight
    try {
      await fetch('/api/ai/insight', { method: 'POST' });
    } catch {}

    router.push('/dashboard');
  }

  function toggleInterest(topic: string) {
    setInterests((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  }

  function toggleSuggestion(suggestion: { emoji: string; name: string }) {
    setHabits((prev) => {
      const exists = prev.find((h) => h.name === suggestion.name);
      if (exists) return prev.filter((h) => h.name !== suggestion.name);
      if (prev.length >= 5) return prev;
      return [...prev, suggestion];
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="font-serif text-xl font-bold">Morning Briefing</span>
          </div>
          <h1 className="font-serif text-3xl font-bold mb-2">{steps[step].title}</h1>
          <p className="text-text-secondary">{steps[step].subtitle}</p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-colors ${
                i <= step ? 'bg-primary' : 'bg-border'
              }`}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <Input
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <p className="text-xs text-text-secondary text-center">
              This will appear on your dashboard greeting.
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <Input
                className="pl-10"
                placeholder="City, Country (e.g., London, UK)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <button
              onClick={() => {
                if ('geolocation' in navigator) {
                  navigator.geolocation.getCurrentPosition(async (pos) => {
                    await supabase.from('profiles').upsert({
                      id: userId,
                      latitude: pos.coords.latitude,
                      longitude: pos.coords.longitude,
                    });
                  });
                }
              }}
              className="text-sm text-primary hover:underline w-full text-center cursor-pointer"
            >
              Or use my current location
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {NEWS_TOPICS.map((topic) => (
              <button
                key={topic}
                onClick={() => toggleInterest(topic)}
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
        )}

        {step === 3 && (
          <div className="space-y-3">
            <p className="text-xs text-text-secondary text-center mb-2">
              Pick up to 5 habits to start tracking.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {HABIT_SUGGESTIONS.map((suggestion) => {
                const selected = habits.find((h) => h.name === suggestion.name);
                return (
                  <button
                    key={suggestion.name}
                    onClick={() => toggleSuggestion(suggestion)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition-all cursor-pointer ${
                      selected
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span>{suggestion.emoji}</span>
                    <span className="font-medium">{suggestion.name}</span>
                    {selected && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>

          {step < steps.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)}>
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={finishOnboarding} disabled={loading}>
              {loading ? 'Setting up...' : 'Start Your Day'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
