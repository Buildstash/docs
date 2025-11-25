'use client';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import Link from 'fumadocs-core/link';

export function SidebarLogo() {
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme, systemTheme } = useTheme();

  // Ensure component is mounted before using theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // More robust theme detection with mounted check
  const currentTheme = mounted ? (resolvedTheme || theme || systemTheme || 'light') : 'light';
  const isDark = currentTheme === 'dark';

  return (
    <Link href="/">
      <img 
        src={isDark ? '/logos/logo-docs-dark.svg' : '/logos/logo-docs-light.svg'}
        alt="Buildstash"
        className="h-[38.4px] w-[153.6px] object-contain"
      />
    </Link>
  );
}

