'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type ProgressProps = {
  value: number;
  className?: string;
};

function Progress({ value, className }: ProgressProps) {
  return (
    <div className={cn('h-2 w-full rounded-full bg-surface overflow-hidden', className)}>
      <div
        className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export { Progress };
