'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type CheckboxProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
};

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ checked, onCheckedChange, className, disabled }, ref) => {
    return (
      <button
        ref={ref}
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          'peer h-5 w-5 shrink-0 rounded-md border border-border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 cursor-pointer',
          checked ? 'bg-primary border-primary' : 'bg-transparent',
          className
        )}
      >
        {checked && <Check className="h-4 w-4 text-white mx-auto" strokeWidth={3} />}
      </button>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
