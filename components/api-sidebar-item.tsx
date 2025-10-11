'use client';
import { SidebarItem } from './sidebar';
import { cn } from '@/lib/cn';
import type * as PageTree from 'fumadocs-core/page-tree';
import { apiHttpMethods } from '@/lib/api-http-methods';

interface ApiSidebarItemProps {
  item: PageTree.Item;
  className?: string;
}

// Function to get HTTP method color
function getMethodColor(method: string): string {
  switch (method) {
    case 'GET':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'POST':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case 'PUT':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'PATCH':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    case 'DELETE':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
}

// Function to extract HTTP method from mapping or URL patterns
function getHttpMethodFromItem(item: PageTree.Item): string | null {
  // First check the generated mapping
  const mappedMethod = apiHttpMethods[item.url];
  if (mappedMethod) {
    return mappedMethod;
  }
  
  // Fallback: check URL patterns
  const url = item.url.toLowerCase();
  
  // Generic patterns
  if (url.includes('/post')) return 'POST';
  if (url.includes('/get')) return 'GET';
  if (url.includes('/put')) return 'PUT';
  if (url.includes('/patch')) return 'PATCH';
  if (url.includes('/delete')) return 'DELETE';
  
  return null;
}

export function ApiSidebarItem({ item, className }: ApiSidebarItemProps) {
  const httpMethod = getHttpMethodFromItem(item);
  
  return (
    <SidebarItem
      href={item.url}
      icon={item.icon}
      external={item.external}
      className={className}
    >
      <div className="flex items-center gap-2 w-full">
        <span className="flex-1 truncate">{item.name}</span>
        {httpMethod && (
          <span
            className={cn(
              'px-1.5 py-0.5 text-xs font-medium rounded-sm shrink-0',
              getMethodColor(httpMethod)
            )}
          >
            {httpMethod}
          </span>
        )}
      </div>
    </SidebarItem>
  );
}
