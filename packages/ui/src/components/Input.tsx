import * as React from 'react';
import { cn } from '../lib';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Design spec bars: 38px tall, 12px left padding, 10px radius.
          'flex h-[38px] w-full rounded-[10px] bg-[var(--alpha-4)] border border-[var(--alpha-12)]',
          'py-1.5 pl-3 pr-3 text-sm leading-5 text-foreground transition-colors',
          'placeholder:text-muted-foreground',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
          'hover:bg-[var(--alpha-8)]',
          'focus:outline-none focus:shadow-[0_0_0_1px_rgb(var(--inverse)),0_0_0_2px_rgb(var(--foreground))]',
          'disabled:cursor-not-allowed disabled:text-[rgb(var(--disabled))] disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
