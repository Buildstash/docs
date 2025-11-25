'use client';
import { Check, ChevronsUpDown } from 'lucide-react';
import { resolveIcon } from './icon-resolver';
import { type ComponentProps, type ReactNode, useMemo, useState } from 'react';
import Link from 'fumadocs-core/link';
import { usePathname } from 'fumadocs-core/framework';
import { cn } from '../lib/cn';
import { isTabActive } from '../lib/is-active';
import { useSidebar } from 'fumadocs-ui/contexts/sidebar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import type { SidebarTab } from 'fumadocs-ui/utils/get-sidebar-tabs';

export interface Option extends SidebarTab {
  props?: ComponentProps<'a'>;
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
  const { closeOnRedirect } = useSidebar();
  const pathname = usePathname();

  const selected = useMemo(() => {
    return options.findLast((item) => isTabActive(item, pathname));
  }, [options, pathname]);

  const onClick = () => {
    closeOnRedirect.current = false;
    setOpen(false);
  };

  const item = selected ? (
    <>
      <div className="shrink-0 size-4 [&_svg]:size-4">
        {(() => {
          const resolved = resolveIcon(selected.icon);
          return resolved || (typeof selected.icon === 'object' ? selected.icon : null);
        })()}
      </div>
      <span className="text-sm font-medium">{selected.title}</span>
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
            'flex items-center gap-2 rounded-lg border bg-fd-secondary/50 p-2 text-start text-fd-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground data-[state=open]:bg-fd-accent data-[state=open]:text-fd-accent-foreground w-full',
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
              <div className="shrink-0 size-4 [&_svg]:size-4">
                {(() => {
                  const resolved = resolveIcon(item.icon);
                  return resolved || (typeof item.icon === 'object' ? item.icon : null);
                })()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.title}</p>
                {item.description && (
                  <p className="text-[13px] text-fd-muted-foreground">
                    {item.description}
                  </p>
                )}
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
