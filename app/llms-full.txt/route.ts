import { getPageLLMText } from '@/lib/source';
import { guideDocs, apiDocs, integrationsDocs } from '@/lib/source';

export async function GET() {
  // Combine pages from all three sources
  const allPages = [
    ...guideDocs.getPages(),
    ...apiDocs.getPages(),
    ...integrationsDocs.getPages(),
  ];

  const scan = allPages.map(getPageLLMText);
  const scanned = await Promise.all(scan);

  return new Response(scanned.join('\n\n'));
}