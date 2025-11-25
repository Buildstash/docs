'use client';
import { cva } from 'class-variance-authority';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { type HTMLAttributes, useLayoutEffect, useState } from 'react';
import { cn } from '../lib/cn';

const itemVariants = cva(
  'size-6.5 rounded-full p-1.5 text-fd-muted-foreground',
  {
    variants: {
      active: {
        true: 'bg-fd-accent text-fd-accent-foreground',
        false: 'text-fd-muted-foreground',
      },
    },
  },
);

const themes = [
  ['light', Sun] as const,
  ['dark', Moon] as const,
];

export function ThemeToggle({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  const container = cn(
    'inline-flex items-center rounded-full border p-1',
    className,
  );

  // Use resolvedTheme to get the actual theme being applied (system preference when theme is 'system')
  // If no theme is set, default to system preference
  const currentTheme = mounted ? resolvedTheme : null;
  
  // Determine which theme to toggle to
  const toggleToTheme = currentTheme === 'light' ? 'dark' : 'light';

  return (
    <button
      className={container}
      aria-label={`Toggle Theme`}
      onClick={() => setTheme(toggleToTheme)}
      data-theme-toggle=""
      {...props}
    >
      {themes.map(([key, Icon]) => (
        <Icon
          key={key}
          fill="currentColor"
          className={cn(itemVariants({ active: currentTheme === key }))}
        />
      ))}
    </button>
  );
}
