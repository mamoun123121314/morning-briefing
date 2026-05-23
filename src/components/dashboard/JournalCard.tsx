'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { LoadingCard } from '@/components/shared/LoadingCard';
import { BookOpen, Sparkles, Save } from 'lucide-react';
import { getToday } from '@/lib/utils';
import { useXP } from '@/hooks/useXP';

export function JournalCard() {
  const [prompt, setPrompt] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [promptLoading, setPromptLoading] = useState(false);
  const [hasAwardedXP, setHasAwardedXP] = useState(false);
  const { earnXP } = useXP();
  const supabase = createClient();
  const today = getToday();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadEntry() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) return;

        const { data, error } = await supabase
          .from('daily_entries')
          .select('journal_text, journal_prompt')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          setSaveError(error.message);
        } else {
          if (data?.journal_text) {
            setText(data.journal_text);
            setWordCount(data.journal_text.split(/\s+/).filter(Boolean).length);
          }
          if (data?.journal_prompt) {
            setPrompt(data.journal_prompt);
          } else {
            setPromptLoading(true);
            try {
              const res = await fetch('/api/ai/journal-prompt', { method: 'POST' });
              if (!cancelled) {
                const json = await res.json();
                if (json.data?.prompt) setPrompt(json.data.prompt);
              }
            } catch {
              if (!cancelled) setPrompt('What is one thing you are grateful for today?');
            } finally {
              if (!cancelled) setPromptLoading(false);
            }
          }
        }

        if (!cancelled) setLoading(false);
      } catch {
        if (!cancelled) setLoading(false);
      }
    }

    loadEntry();
    return () => { cancelled = true; };
  }, [supabase, today]);

  const [saveError, setSaveError] = useState('');

  function handleChange(value: string) {
    setText(value);
    setWordCount(value.split(/\s+/).filter(Boolean).length);
    setSaveError('');

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setSaving(true);
      const { error } = await supabase.from('daily_entries').upsert(
        { user_id: user.id, date: today, journal_text: value },
        { onConflict: 'user_id,date' }
      );
      if (error) setSaveError(error.message);
      setSaving(false);
    }, 2000);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('daily_entries').upsert(
      { user_id: user.id, date: today, journal_text: text },
      { onConflict: 'user_id,date' }
    );
    if (error) {
      setSaveError(error.message);
    } else if (!hasAwardedXP && wordCount > 0) {
      earnXP('journal_written');
      setHasAwardedXP(true);
    }
    setSaving(false);
  }

  if (loading) return <LoadingCard height="h-48" />;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Journal
        </CardTitle>
        <div className="flex items-center gap-2">
          {saving && <span className="text-xs text-text-secondary">Saving...</span>}
          <button
            onClick={handleSave}
            className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"
          >
            <Save className="w-3 h-3" />
            Save Entry
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {saveError && (
          <p className="text-sm text-destructive mb-3 bg-destructive/10 rounded-lg p-2">{saveError}</p>
        )}
        {promptLoading ? (
          <div className="animate-shimmer rounded-lg h-5 w-3/4 mb-4" />
        ) : (
          <div className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-surface/50">
            <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm italic text-text-secondary leading-relaxed">{prompt}</p>
          </div>
        )}

        <div className="relative">
          <Textarea
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Start writing your thoughts..."
            className="journal-paper min-h-[160px] resize-y"
          />
          <div className="absolute bottom-3 right-3 text-xs text-text-secondary">
            {wordCount} words
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
