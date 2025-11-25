import type { SidebarTab } from 'fumadocs-ui/utils/get-sidebar-tabs';

function normalize(url: string) {
  if (url.length > 1 && url.endsWith('/')) return url.slice(0, -1);
  return url;
}

export function isActive(
  url: string,
  pathname: string,
  nested = true,
): boolean {
  url = normalize(url);
  pathname = normalize(pathname);

  // Handle root path specially - match root and paths that don't start with other sections
  if (url === '/') {
    if (pathname === '/') return true;
    if (!nested) return false;
    // Match paths under root, but exclude paths that start with known section prefixes
    return pathname.startsWith('/') && 
           !pathname.startsWith('/api') && 
           !pathname.startsWith('/integrations');
  }

  return url === pathname || (nested && pathname.startsWith(`${url}/`));
}

export function isTabActive(tab: SidebarTab, pathname: string) {
  if (tab.urls) return tab.urls.has(normalize(pathname));

  return isActive(tab.url, pathname, true);
}
