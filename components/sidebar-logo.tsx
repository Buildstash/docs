'use client';
import Link from 'fumadocs-core/link';

export function SidebarLogo() {
  return (
    <Link href="/" suppressHydrationWarning>
      <img 
        src="/logos/logo-docs-light.svg"
        alt="Buildstash"
        className="h-[38.4px] w-[153.6px] object-contain dark:hidden"
        suppressHydrationWarning
      />
      <img 
        src="/logos/logo-docs-dark.svg"
        alt="Buildstash"
        className="h-[38.4px] w-[153.6px] object-contain hidden dark:block"
        suppressHydrationWarning
      />
    </Link>
  );
}

