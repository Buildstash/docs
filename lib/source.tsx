import { guide, api, integrations } from '@/.source';
import {
  type InferMetaType,
  type InferPageType,
  type LoaderPlugin,
  loader,
  multiple,
} from 'fumadocs-core/source';
import { customIconsPlugin } from './icons-plugin';
import { openapiPlugin, openapiSource } from 'fumadocs-openapi/server';

// Single combined source with all content
export const source = loader({
  baseUrl: '/',
  source: {
    files: [
      ...guide.toFumadocsSource().files,
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

export function getPageImage(page: InferPageType<typeof guideDocs>) {
  const segments = [...page.slugs, 'image.png'];

  return {
    segments,
    url: `/og/${segments.join('/')}`,
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

export async function getLLMText(page: InferPageType<typeof guideDocs>) {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title} (${page.url})

${processed}`;
}

export type Page = InferPageType<typeof source>;
export type Meta = InferMetaType<typeof source>;