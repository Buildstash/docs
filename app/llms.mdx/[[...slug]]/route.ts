import { getLLMTextFromPage, getLLMText } from '@/lib/source';
import { source, guideDocs } from '@/lib/source';
import { notFound } from 'next/navigation';

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  const { slug } = await params;
  // Handle root index page - when slug is ['index'], find it in guideDocs
  const isRootPage = slug?.length === 1 && slug[0] === 'index';
  
  let page = source.getPage(slug);
  if (!page && isRootPage) {
    // Root page lives in guideDocs, not the combined source
    page = guideDocs.getPage(undefined) || guideDocs.getPage([]);
  }
  if (!page) notFound();
  
  // Use getLLMText for root page (from guideDocs), getLLMTextFromPage for others
  const text = isRootPage 
    ? await getLLMText(page as any)
    : await getLLMTextFromPage(page as any);

  return new Response(text, {
    headers: {
      'Content-Type': 'text/markdown',
    },
  });
}

export function generateStaticParams() {
  return source.generateParams();
}

