'use client';

import * as lucideIcons from 'lucide-react';
import * as devicons from 'devicons-react';
import * as stashicons from 'stashicons/react';
import * as stashiconsBrand from 'stashicons/react/brand';
import { createElement, type ReactElement, type ReactNode } from 'react';

// Create icon registry on client side
const iconRegistry: Record<string, React.ComponentType<any>> = {};

// Add Lucide icons (they are forwardRef objects, not functions, but can still be used with createElement)
for (const [name, Icon] of Object.entries(lucideIcons)) {
  if (Icon) {
    // Lucide icons are forwardRef objects, but React.createElement can handle them
    iconRegistry[name] = Icon as React.ComponentType<any>;
  }
}

// Add Devicons
for (const [name, Icon] of Object.entries(devicons)) {
  if (Icon && typeof Icon === 'function') {
    iconRegistry[name] = Icon;
  }
}

// Add Stashicons (they are forwardRef objects, not functions, but can still be used with createElement)
for (const [name, Icon] of Object.entries(stashicons)) {
  if (Icon) {
    iconRegistry[name] = Icon as React.ComponentType<any>;
  }
}

// Add Stashicons Brand (they are forwardRef objects, not functions, but can still be used with createElement)
for (const [name, Icon] of Object.entries(stashiconsBrand)) {
  if (Icon) {
    iconRegistry[name] = Icon as React.ComponentType<any>;
  }
}

/**
 * Parse prefixed icon names like "Lucide-ToyBrick", "Devicons-AzuredevopsOriginal", etc.
 */
function parseIconName(iconName: string): { library: string; name: string } | null {
  const parts = iconName.split('-', 2);
  if (parts.length !== 2) {
    return null;
  }
  return { library: parts[0], name: parts[1] };
}

/**
 * Resolves an icon name to a React element on the client side
 * Supports prefixed format: "Library-IconName" (e.g., "Lucide-ToyBrick", "Devicons-AzuredevopsOriginal")
 */
export function resolveIcon(iconName: ReactNode): ReactElement | null {
  // Handle null/undefined
  if (!iconName) {
    return null;
  }

  // Handle non-string, non-object types (numbers, booleans, etc.)
  if (typeof iconName !== 'string' && typeof iconName !== 'object') {
    return null;
  }

  // If it's already a React element, validate and return it
  if (typeof iconName === 'object' && 'type' in iconName) {
    // Validate the element has a valid type
    if (iconName.type === undefined || iconName.type === null) {
      console.warn('[icon-resolver] Invalid React element with undefined type');
      return null;
    }
    return iconName as ReactElement;
  }

  // If it's a string, resolve it
  if (typeof iconName === 'string') {
    const parsed = parseIconName(iconName);
    
    if (parsed) {
      // Prefixed icon name - resolve from the specified library
      const iconNameToLookup = parsed.name;
      let IconComponent = iconRegistry[iconNameToLookup];

      // Try variations if not found
      if (!IconComponent) {
        const variations = [
          `${iconNameToLookup}Icon`,
          `${iconNameToLookup}Original`,
          `${iconNameToLookup}Plain`,
        ];
        for (const variant of variations) {
          IconComponent = iconRegistry[variant];
          if (IconComponent) break;
        }
      }

      if (IconComponent) {
        try {
          // IconComponent can be a function or a forwardRef object (for lucide icons)
          const element = createElement(IconComponent as React.ComponentType<any>);
          // Validate the created element
          if (element && element.type) {
            return element;
          }
          console.warn(`[icon-resolver] Created element has invalid type for "${iconName}"`);
          return null;
        } catch (error) {
          console.warn(`[icon-resolver] Failed to create icon for "${iconName}":`, error);
          return null;
        }
      } else {
        console.warn(`[icon-resolver] Icon "${iconNameToLookup}" not found in registry for "${iconName}"`);
        return null;
      }
    } else {
      // Not a prefixed name - try direct lookup (backward compatibility)
      let IconComponent = iconRegistry[iconName];
      if (!IconComponent) {
        const variations = [
          `${iconName}Icon`,
          `${iconName}Original`,
          `${iconName}Plain`,
        ];
        for (const variant of variations) {
          IconComponent = iconRegistry[variant];
          if (IconComponent) break;
        }
      }

      if (IconComponent) {
        try {
          // IconComponent can be a function or a forwardRef object (for lucide icons)
          const element = createElement(IconComponent as React.ComponentType<any>);
          if (element && element.type) {
            return element;
          }
          return null;
        } catch (error) {
          console.warn(`[icon-resolver] Failed to create icon for "${iconName}":`, error);
          return null;
        }
      }
    }
  }

  return null;
}

