'use client';

import { cn } from '@/lib/utils';

interface LoadingCardProps {
  className?: string;
  height?: string;
}

export function LoadingCard({ className, height = 'h-48' }: LoadingCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card p-6 overflow-hidden',
        className
      )}
    >
      <div className="animate-shimmer rounded-lg h-4 w-1/3 mb-4" />
      <div className="animate-shimmer rounded-lg h-3 w-2/3 mb-3" />
      <div className={cn('flex flex-col gap-3', height)}>
        <div className="animate-shimmer rounded-lg h-3 w-full" />
        <div className="animate-shimmer rounded-lg h-3 w-5/6" />
        <div className="animate-shimmer rounded-lg h-3 w-4/6" />
      </div>
    </div>
  );
}
