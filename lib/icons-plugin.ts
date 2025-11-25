import { type LoaderPlugin } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';

/**
 * Custom icon plugin that supports icons from:
 * - lucide-react
 * - devicons-react
 * - stashicons/react
 * - stashicons/react/brand
 */
/**
 * Parse prefixed icon names like "Lucide-ToyBrick", "Devicons-AzuredevopsOriginal", etc.
 * Returns { library: 'Lucide' | 'Devicons' | 'Stashicons' | 'StashiconsBrand', name: string } or null
 */
function parseIconName(iconName: string): { library: string; name: string } | null {
  const parts = iconName.split('-', 2);
  if (parts.length !== 2) {
    return null;
  }
  return { library: parts[0], name: parts[1] };
}

export function customIconsPlugin(): LoaderPlugin {
  const lucidePlugin = lucideIconsPlugin();
  const lucideFileTransformer = lucidePlugin.transformPageTree?.file;

  return {
    ...lucidePlugin,
    transformPageTree: {
      ...lucidePlugin.transformPageTree,
      file(node) {
        // Check if data exists first
        if (!('data' in node)) {
          // No data, return as-is (don't call lucide plugin)
          return node;
        }

        const data = (node as { data: Record<string, unknown> }).data;
        if (!data) {
          // No data object, return as-is
          return node;
        }

        const iconValue = data.icon;
        
        // If there's no icon, don't call lucide plugin
        if (!iconValue) {
          return node;
        }

        // Check for prefixed icons FIRST - don't call lucide plugin for these
        if (typeof iconValue === 'string') {
          const parsed = parseIconName(iconValue);
          
          if (parsed) {
            // Prefixed icon name - validate the library exists
            const validLibraries = ['Lucide', 'Devicons', 'Stashicons', 'StashiconsBrand'];
            if (validLibraries.includes(parsed.library)) {
              // For all prefixed icons (including Lucide), keep as string for client-side resolution
              // Don't call lucide plugin for prefixed icons
              return node;
            } else {
              // Invalid library prefix, remove icon
              const { icon: _, ...dataWithoutIcon } = data;
              return {
                ...node,
                data: dataWithoutIcon,
              };
            }
          }
          // Not a prefixed name - let lucide plugin handle it (backward compatibility)
          // Only call if there's actually an icon string
          if (lucideFileTransformer) {
            const result = lucideFileTransformer.call(this, node);
            // Validate the result
            if (result && 'data' in result) {
              const resultData = (result as { data: Record<string, unknown> }).data;
              if (resultData) {
                const resultIcon = resultData.icon;
                // If lucide plugin created a React element, validate it
                if (typeof resultIcon === 'object' && resultIcon !== null && 'type' in resultIcon) {
                  const elementType = (resultIcon as { type: unknown }).type;
                  if (elementType === undefined || elementType === null) {
                    // Invalid element - remove it to prevent React errors
                    const { icon: _, ...dataWithoutIcon } = resultData;
                    return {
                      ...result,
                      data: dataWithoutIcon,
                    };
                  }
                }
              }
            }
            return result;
          }
          return node;
        }

        // No icon or other type - pass through to lucide plugin
        return lucideFileTransformer ? lucideFileTransformer.call(this, node) : node;
      },
    },
  };
}

