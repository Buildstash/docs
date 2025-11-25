import { getRSS } from '@/lib/rss';

export const revalidate = false;

export function GET() {
  return new Response(getRSS(), {
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'Content-Disposition': 'inline',
    },
  });
}