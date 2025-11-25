import Link from 'fumadocs-core/link';
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type IntegrationCardProps = Omit<
  HTMLAttributes<HTMLElement>,
  'title'
> & {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  href?: string;
  external?: boolean;
  disabled?: boolean;
  color?: string;
};

export function IntegrationCard({
  icon,
  title,
  description,
  disabled,
  color,
  href,
  ...props
}: IntegrationCardProps) {
  const E = href && !disabled ? Link : 'div';
  const isClickable = href && !disabled;

  return (
    <E
      {...(href && !disabled ? { href } : {})}
      {...props}
      data-integration-card
      className={cn(
        'flex flex-row items-center gap-4 rounded-xl border bg-fd-card p-4 text-fd-card-foreground transition-colors @max-lg:col-span-full no-underline',
        isClickable && 'hover:bg-fd-accent/80',
        disabled && 'opacity-50 cursor-not-allowed',
        color === 'grey' && 'bg-fd-muted',
        props.className,
      )}
    >
      {icon && (
        <div className="not-prose shrink-0 w-10 h-10 flex items-center justify-center shadow-md rounded-lg border bg-fd-muted p-1.5 text-fd-muted-foreground [&_svg]:!w-6 [&_svg]:!h-6 [&_svg]:!max-w-6 [&_svg]:!max-h-6 [&>*]:!w-6 [&>*]:!h-6">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="not-prose mb-1 text-sm font-medium no-underline">{title}</h3>
        {description && (
          <p className="my-0! text-sm text-fd-muted-foreground">
            {description}
          </p>
        )}
        <div className="text-sm text-fd-muted-foreground prose-no-margin empty:hidden">
          {props.children}
        </div>
      </div>
    </E>
  );
}

