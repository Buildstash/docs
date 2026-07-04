import { guide, api, integrations } from '@/.source/server';
import {
  type InferMetaType,
  type InferPageType,
  type LoaderPlugin,
  loader,
  multiple,
} from 'fumadocs-core/source';
import { customIconsPlugin } from './icons-plugin';
import {
  generateApiEndpointLLMMarkdown,
  isApiEndpointPage,
} from './api-llm-markdown';
import { openapiPlugin, openapiSource } from 'fumadocs-openapi/server';

// Single combined source with all content
export const source = loader({
  baseUrl: '/',
  source: {
    files: [
      ...guide.toFumadocsSource().files,
      ...api.toFumadocsSource().files.map((file: any) => ({
        ...file,
        path: `api/${file.path}`,
      })),
      ...integrations.toFumadocsSource().files.map((file: any) => ({
        ...file,
        path: `integrations/${file.path}`,
      })),
    ],
  },
  plugins: [customIconsPlugin()],
});

// Individual sources for page routes
export const guideDocs = loader({
  baseUrl: '/',
  source: guide.toFumadocsSource(),
  plugins: [pageTreeCodeTitles(), customIconsPlugin()],
});

export const apiDocs = loader({
  baseUrl: '/api',
  source: api.toFumadocsSource(),
  plugins: [pageTreeCodeTitles(), customIconsPlugin(), openapiPlugin()],
});

export const integrationsDocs = loader({
  baseUrl: '/integrations',
  source: integrations.toFumadocsSource(),
  plugins: [pageTreeCodeTitles(), customIconsPlugin()],
});

// Generic function to get OG image URL for any page type
export function getPageImage(
  page:
    | InferPageType<typeof guideDocs>
    | InferPageType<typeof apiDocs>
    | InferPageType<typeof integrationsDocs>,
) {
  // Determine the base path based on the page URL
  let basePath = 'root';
  if (page.url.startsWith('/api/')) {
    basePath = 'api';
  } else if (page.url.startsWith('/integrations/')) {
    basePath = 'integrations';
  }

  const segments = [...page.slugs, 'image.png'];

  return {
    segments,
    url: `/og/${basePath}/${segments.join('/')}`,
  };
}

function pageTreeCodeTitles(): LoaderPlugin {
  return {
    transformPageTree: {
      file(node) {
        if (
          typeof node.name === 'string' &&
          (node.name.endsWith('()') || node.name.match(/^<\w+ \/>$/))
        ) {
          return {
            ...node,
            name: <code className="text-[13px]">{node.name}</code>,
          };
        }
        return node;
      },
    },
  };
}

export async function getPageLLMText(page: {
  url: string;
  data: {
    title?: string;
    getText: (type: 'processed' | 'raw') => Promise<string>;
  };
}) {
  if (isApiEndpointPage(page.url)) {
    const [raw, processed] = await Promise.all([
      page.data.getText('raw'),
      page.data.getText('processed'),
    ]);

    return generateApiEndpointLLMMarkdown({
      title: page.data.title ?? 'Untitled',
      url: page.url,
      raw,
      processed,
    });
  }

  const processed = await page.data.getText('processed');

  return `# ${page.data.title ?? 'Untitled'} (${page.url})

${processed}`;
}

export async function getLLMText(page: InferPageType<typeof guideDocs>) {
  return getPageLLMText(page);
}

// Generic version that works with combined source
export async function getLLMTextFromPage(page: InferPageType<typeof source>) {
  return getPageLLMText(page);
}

export type Page = InferPageType<typeof source>;
export type Meta = InferMetaType<typeof source>;