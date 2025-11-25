import { source } from './source';

const SITE_URL = 'https://docs.buildstash.com';
const SITE_TITLE = 'Buildstash Docs';
const SITE_DESCRIPTION = 'Buildstash platform documentation, API reference, and integration guides';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatDate(date: Date): string {
  return date.toUTCString();
}

export function getRSS(): string {
  const pages = source.getPages();
  const now = new Date();

  // Sort pages by URL for consistent ordering
  const sortedPages = [...pages].sort((a, b) => a.url.localeCompare(b.url));

  const items = sortedPages
    .map((page) => {
      const title = page.data.title || 'Untitled';
      const description = page.data.description || '';
      const url = `${SITE_URL}${page.url}`;
      const pubDate = formatDate(now);

      return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(url)}</link>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${formatDate(now)}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

