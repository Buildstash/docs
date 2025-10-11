import { guide, api, integrations } from '@/.source';
import { type InferPageType, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';

// Single combined source with all content
export const source = loader({
  baseUrl: '/',
  source: {
    files: [
      ...guide.toFumadocsSource().files.map(file => ({
        ...file,
        path: `guide/${file.path}`,
      })),
      ...api.toFumadocsSource().files.map(file => ({
        ...file,
        path: `api/${file.path}`,
      })),
      ...integrations.toFumadocsSource().files.map(file => ({
        ...file,
        path: `integrations/${file.path}`,
      })),
    ],
  },
  plugins: [lucideIconsPlugin()],
});

// Individual sources for page routes
export const guideDocs = loader({
  baseUrl: '/guide',
  source: guide.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
});

export const apiDocs = loader({
  baseUrl: '/api',
  source: api.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
});

export const integrationsDocs = loader({
  baseUrl: '/integrations',
  source: integrations.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
});

export function getPageImage(page: InferPageType<typeof guideDocs>) {
  const segments = [...page.slugs, 'image.png'];

  return {
    segments,
    url: `/og/${segments.join('/')}`,
  };
}

export async function getLLMText(page: InferPageType<typeof guideDocs>) {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title} (${page.url})

${processed}`;
}