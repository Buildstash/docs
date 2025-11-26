import { getPageImage, apiDocs } from '@/lib/source';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { OGImage } from '@/components/og-image';

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const page = apiDocs.getPage(slug.slice(0, -1));
  if (!page) notFound();

  // Read the logo SVG file
  const logoSvg = await readFile(
    join(process.cwd(), 'public', 'logos', 'logo-dark.svg'),
    'utf-8',
  );

  return new ImageResponse(
    (
      <OGImage
        title={page.data.title}
        description={page.data.description}
        logoSvg={logoSvg}
      />
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}

export function generateStaticParams() {
  return apiDocs.getPages().map((page) => ({
    slug: getPageImage(page).segments,
  }));
}

