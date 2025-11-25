import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from 'fumadocs-mdx/config';

import { remarkNpm } from 'fumadocs-core/mdx-plugins';
import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';

// Plugin to remove auto-linked emails and URLs, keeping only explicit markdown links
function remarkNoAutoLinks() {
  return (tree: Root) => {
    visit(tree, 'link', (node, index, parent) => {
      if (!node.url || !parent || typeof index !== 'number') return;
      
      // Extract text content from link children
      const getLinkText = (node: any): string => {
        if (!node.children || node.children.length === 0) return '';
        return node.children
          .map((child: any) => {
            if (child.type === 'text') return child.value;
            if (child.type === 'code') return child.value;
            return '';
          })
          .join('');
      };
      
      const linkText = getLinkText(node);
      const url = node.url;
      
      // Check if it's a mailto link
      const isMailto = url.startsWith('mailto:');
      // Check if the URL itself is an email address
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url);
      
      // Check if it's an auto-linked URL (text content matches the URL)
      // Normalize both for comparison (remove trailing slashes, etc.)
      const normalizeUrl = (u: string) => u.replace(/\/$/, '').toLowerCase();
      const textMatchesUrl = normalizeUrl(linkText) === normalizeUrl(url) || 
                            normalizeUrl(linkText) === normalizeUrl(url.replace(/^https?:\/\//, ''));
      
      // Remove auto-links: emails, mailto links, or URLs where text matches URL
      if (isMailto || isEmail || textMatchesUrl) {
        // Use the link text if available, otherwise use the URL
        const text = linkText || (isMailto ? url.replace('mailto:', '') : url);
        // Replace the link node with a text node
        parent.children[index] = {
          type: 'text',
          value: text,
        } as any;
      }
    });
  };
}

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections
export const guide = defineDocs({
  dir: "content/guide",
  docs: {
    schema: frontmatterSchema,
    postprocess: {
      includeProcessedMarkdown: true
    }
  },
  meta: {
    schema: metaSchema
  }
});

export const api = defineDocs({
  dir: "content/api",
  docs: {
    schema: frontmatterSchema,
    postprocess: {
      includeProcessedMarkdown: true
    }
  },
  meta: {
    schema: metaSchema
  }
});

export const integrations = defineDocs({
  dir: "content/integrations",
  docs: {
    schema: frontmatterSchema,
    postprocess: {
      includeProcessedMarkdown: true
    }
  },
  meta: {
    schema: metaSchema
  }
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkNpm, remarkNoAutoLinks],
    remarkCodeTabOptions: {
      parseMdx: true,
    },
  },
});
