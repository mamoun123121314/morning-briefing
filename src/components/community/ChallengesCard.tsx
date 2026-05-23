'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Swords, Loader2, CheckCircle2, Zap } from 'lucide-react';
import type { Challenge } from '@/types';

interface Props {
  challenges: Challenge[];
  loading: boolean;
}

export function ChallengesCard({ challenges, loading }: Props) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-primary" />
            Weekly Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-text-secondary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (challenges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-primary" />
            Weekly Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-secondary text-center py-4">No active challenges right now.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-primary" />
          Weekly Challenges
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {challenges.map((challenge) => {
          const pct = challenge.progress ?? 0;
          const progress = Math.min((pct / challenge.goal) * 100, 100);
          return (
            <div key={challenge.id} className="p-3 rounded-xl bg-surface/50 border border-border">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{challenge.title}</p>
                    {challenge.completed && (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">{challenge.description}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-primary font-medium">
                  <Zap className="w-3 h-3" />
                  +{challenge.xp_reward} XP
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
                  <span>{pct} / {challenge.goal}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
