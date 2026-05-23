'use client';

import { Lightbulb } from 'lucide-react';

const TIPS = [
  'Write down 3 things you are grateful for — it rewires your brain for positivity.',
  'The most productive people do their hardest task first. Eat that frog!',
  'A 2-minute walk can reset your focus. Step away from the screen.',
  'Hydrate first thing — your brain is 75% water and wakes up slowly.',
  'Set an intention for today. Not a task — a feeling you want to cultivate.',
  'The 2-minute rule: if it takes less than 2 minutes, do it now.',
  'Your habits compound. A 1% improvement today is 37x better in a year.',
  'Breathe deeply for 10 seconds. You are exactly where you need to be.',
];

export function DailyTip() {
  if (typeof window === 'undefined') return null;

  const seed = new Date().toISOString().split('T')[0];
  const index = seed.split('-').reduce((a, b) => a + parseInt(b), 0) % TIPS.length;

  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl border border-border bg-surface/50">
      <Lightbulb className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm text-text-secondary leading-relaxed">{TIPS[index]}</p>
      </div>
    </div>
  );
}
