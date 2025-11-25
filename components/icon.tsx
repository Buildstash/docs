'use client';

import { resolveIcon } from './icon-resolver';
import type { ReactNode } from 'react';

interface IconProps {
  icon: string | ReactNode | undefined | null;
  className?: string;
}

/**
 * Client component that resolves icon names to React elements
 * Use this in server components to render icons
 */
export function Icon({ icon, className }: IconProps) {
  if (!icon) return null;
  
  // If it's already a React element (from lucide plugin), return it directly
  if (typeof icon === 'object' && 'type' in icon) {
    return icon as ReactNode;
  }
  
  // Otherwise, try to resolve it (for prefixed icon names like "Devicons-AzuredevopsOriginal")
  const resolved = resolveIcon(icon);
  if (resolved) return resolved;
  
  return null;
}

