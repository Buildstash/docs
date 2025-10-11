'use client';
import { useMemo, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { usePathname } from 'fumadocs-core/framework';
import { isTabActive } from '../lib/is-active';
import type { Option } from './root-toggle';

export function ActiveTabLogo({ options }: { options: Option[] }) {
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme, systemTheme } = useTheme();
  const pathname = usePathname();

  // Ensure component is mounted before using theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const selected = useMemo(() => {
    return options.findLast((item) => isTabActive(item, pathname));
  }, [options, pathname]);

  // More robust theme detection with mounted check
  const currentTheme = mounted ? (resolvedTheme || theme || systemTheme || 'light') : 'light';
  const isDark = currentTheme === 'dark';

  if (!selected || !selected.logo) {
    return null;
  }

  return (
    <img 
      src={isDark ? selected.logo.dark : selected.logo.light}
      alt={typeof selected.title === 'string' ? selected.title : 'Logo'}
      className="h-6 w-auto object-contain"
    />
  );
}
