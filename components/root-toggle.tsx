'use client';
import { Check, ChevronsUpDown } from 'lucide-react';
import { type ComponentProps, type ReactNode, useMemo, useState, useEffect } from 'react';
import Link from 'fumadocs-core/link';
import { usePathname } from 'fumadocs-core/framework';
import { cn } from '../lib/cn';
import { isTabActive } from '../lib/is-active';
import { useSidebar } from 'fumadocs-ui/contexts/sidebar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import type { SidebarTab } from 'fumadocs-ui/utils/get-sidebar-tabs';
import { useTheme } from 'next-themes';

export interface Option extends SidebarTab {
  props?: ComponentProps<'a'>;
  logo?: {
    light: string; // URL to light mode SVG logo
    dark: string;  // URL to dark mode SVG logo
  };
}

export function RootToggle({
  options,
  placeholder,
  ...props
}: {
  placeholder?: ReactNode;
  options: Option[];
} & ComponentProps<'button'>) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { closeOnRedirect } = useSidebar();
  const { theme, resolvedTheme, systemTheme } = useTheme();
  const pathname = usePathname();

  // Ensure component is mounted before using theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const selected = useMemo(() => {
    return options.findLast((item) => isTabActive(item, pathname));
  }, [options, pathname]);

  const onClick = () => {
    closeOnRedirect.current = false;
    setOpen(false);
  };

  // More robust theme detection with mounted check
  const currentTheme = mounted ? (resolvedTheme || theme || systemTheme || 'light') : 'light';
  const isDark = currentTheme === 'dark';

  const item = selected ? (
    <>
      <div className="flex-1 flex items-center justify-start">
        {selected.logo ? (
          <img 
            src={isDark ? selected.logo.dark : selected.logo.light}
            alt={typeof selected.title === 'string' ? selected.title : 'Logo'}
            className="h-6 w-auto object-contain"
          />
        ) : (
          selected.icon
        )}
      </div>
    </>
  ) : (
    placeholder
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {item && (
        <PopoverTrigger
          {...props}
          className={cn(
            'flex items-center gap-2 rounded-lg p-2 text-start text-fd-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground data-[state=open]:bg-fd-accent data-[state=open]:text-fd-accent-foreground',
            props.className,
          )}
        >
          {item}
          <ChevronsUpDown className="shrink-0 ms-auto size-4 text-fd-muted-foreground" />
        </PopoverTrigger>
      )}
      <PopoverContent className="flex flex-col gap-1 w-(--radix-popover-trigger-width) overflow-hidden p-1">
        {options.map((item) => {
          const isActive = selected && item.url === selected.url;
          if (!isActive && item.unlisted) return;

          return (
            <Link
              key={item.url}
              href={item.url}
              onClick={onClick}
              {...item.props}
              className={cn(
                'flex items-center gap-2 rounded-lg p-1.5 hover:bg-fd-accent hover:text-fd-accent-foreground',
                item.props?.className,
              )}
            >
              <div className="shrink-0 size-9 md:mt-1 md:mb-auto md:size-5">
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-[13px] text-fd-muted-foreground empty:hidden">
                  {item.description}
                </p>
              </div>

              <Check
                className={cn(
                  'shrink-0 ms-auto size-3.5 text-fd-primary',
                  !isActive && 'invisible',
                )}
              />
            </Link>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
