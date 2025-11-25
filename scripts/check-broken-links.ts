import { guideDocs, apiDocs, integrationsDocs } from '../lib/source';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

interface BrokenLink {
  file: string;
  link: string;
  text: string;
  reason: string;
}

// Collect all pages from all sources
const allPages = new Map<string, { url: string; path: string }>();

// Guide pages
guideDocs.getPages().forEach((page) => {
  allPages.set(page.url, { url: page.url, path: page.path });
  // Also index by path without extension
  const pathWithoutExt = page.path.replace(/\.mdx$/, '');
  allPages.set(`/${pathWithoutExt}`, { url: page.url, path: page.path });
});

// API pages
apiDocs.getPages().forEach((page) => {
  allPages.set(page.url, { url: page.url, path: page.path });
  const pathWithoutExt = page.path.replace(/\.mdx$/, '');
  allPages.set(`/api/${pathWithoutExt}`, { url: page.url, path: page.path });
});

// Integrations pages
integrationsDocs.getPages().forEach((page) => {
  allPages.set(page.url, { url: page.url, path: page.path });
  const pathWithoutExt = page.path.replace(/\.mdx$/, '');
  allPages.set(`/integrations/${pathWithoutExt}`, { url: page.url, path: page.path });
});

// Helper to normalize URLs
function normalizeUrl(url: string): string {
  // Remove hash fragments
  url = url.split('#')[0];
  // Remove query params
  url = url.split('?')[0];
  // Ensure leading slash
  if (!url.startsWith('/')) {
    url = '/' + url;
  }
  // Remove trailing slash (except root)
  if (url !== '/' && url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  return url;
}

// Check if a link is external
function isExternalLink(url: string): boolean {
  return (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('mailto:') ||
    url.startsWith('#')
  );
}

// Resolve relative path to absolute
function resolveRelativePath(
  fromPath: string,
  relativePath: string,
  baseUrl: string,
): string {
  // Remove .mdx extension from fromPath
  const fromDir = fromPath.replace(/\/[^/]+\.mdx$/, '').replace(/^content\//, '');
  const fromParts = fromDir.split('/').filter(Boolean);

  // Handle relative paths
  if (relativePath.startsWith('./')) {
    relativePath = relativePath.slice(2);
  }

  const relativeParts = relativePath.split('/').filter(Boolean);
  const resolvedParts: string[] = [];

  for (const part of relativeParts) {
    if (part === '..') {
      resolvedParts.pop();
    } else if (part !== '.') {
      resolvedParts.push(part);
    }
  }

  // Remove .mdx extension if present
  const lastPart = resolvedParts[resolvedParts.length - 1];
  if (lastPart?.endsWith('.mdx')) {
    resolvedParts[resolvedParts.length - 1] = lastPart.slice(0, -4);
  }

  // Build the path
  const pathParts = [...fromParts.slice(0, -1), ...resolvedParts];
  const path = '/' + pathParts.join('/');

  return normalizeUrl(path);
}

// Extract links from markdown content
function extractLinks(content: string): Array<{ text: string; url: string }> {
  const links: Array<{ text: string; url: string }> = [];
  
  // Match markdown links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    const text = match[1];
    const url = match[2];
    links.push({ text, url });
  }
  
  return links;
}

// Check if a link resolves to a valid page
function checkLink(
  linkUrl: string,
  fromFile: string,
  baseUrl: string,
): { valid: boolean; reason?: string; resolvedUrl?: string } {
  // Skip external links
  if (isExternalLink(linkUrl)) {
    return { valid: true };
  }

  // Handle relative paths
  let normalizedUrl: string;
  if (linkUrl.startsWith('/')) {
    normalizedUrl = normalizeUrl(linkUrl);
  } else {
    normalizedUrl = resolveRelativePath(fromFile, linkUrl, baseUrl);
  }

  // Check if the page exists
  if (allPages.has(normalizedUrl)) {
    return { valid: true, resolvedUrl: normalizedUrl };
  }

  // Try with index
  const withIndex = normalizedUrl === '/' ? '/' : normalizedUrl + '/index';
  if (allPages.has(withIndex)) {
    return { valid: true, resolvedUrl: withIndex };
  }

  // Try without index (if it ends with /index)
  if (normalizedUrl.endsWith('/index')) {
    const withoutIndex = normalizedUrl.slice(0, -6) || '/';
    if (allPages.has(withoutIndex)) {
      return { valid: true, resolvedUrl: withoutIndex };
    }
  }

  return {
    valid: false,
    reason: `Page not found: ${normalizedUrl}`,
    resolvedUrl: normalizedUrl,
  };
}

async function checkFile(
  filePath: string,
  contentDir: string,
): Promise<BrokenLink[]> {
  const content = await readFile(filePath, 'utf-8');
  const relativePath = filePath.replace(contentDir + '/', '');
  const brokenLinks: BrokenLink[] = [];

  // Determine base URL based on file location
  let baseUrl = '/';
  if (relativePath.startsWith('api/')) {
    baseUrl = '/api';
  } else if (relativePath.startsWith('integrations/')) {
    baseUrl = '/integrations';
  }

  const links = extractLinks(content);

  for (const link of links) {
    const result = checkLink(link.url, relativePath, baseUrl);
    if (!result.valid) {
      brokenLinks.push({
        file: relativePath,
        link: link.url,
        text: link.text,
        reason: result.reason || 'Unknown error',
      });
    }
  }

  return brokenLinks;
}

async function getAllMdxFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAllMdxFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      files.push(fullPath);
    }
  }

  return files;
}

async function main() {
  const contentDir = join(process.cwd(), 'content');
  const mdxFiles = await getAllMdxFiles(contentDir);
  const allBrokenLinks: BrokenLink[] = [];

  console.log(`Checking ${mdxFiles.length} MDX files for broken links...\n`);

  for (const file of mdxFiles) {
    const brokenLinks = await checkFile(file, contentDir);
    allBrokenLinks.push(...brokenLinks);
  }

  if (allBrokenLinks.length === 0) {
    console.log('✅ No broken links found!');
    process.exit(0);
  }

  console.log(`❌ Found ${allBrokenLinks.length} broken link(s):\n`);

  // Group by file
  const byFile = new Map<string, BrokenLink[]>();
  for (const link of allBrokenLinks) {
    if (!byFile.has(link.file)) {
      byFile.set(link.file, []);
    }
    byFile.get(link.file)!.push(link);
  }

  for (const [file, links] of byFile.entries()) {
    console.log(`📄 ${file}`);
    for (const link of links) {
      console.log(`   [${link.text}](${link.link})`);
      console.log(`   └─ ${link.reason}`);
    }
    console.log('');
  }

  process.exit(1);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

