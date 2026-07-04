import { generateFiles } from 'fumadocs-openapi';
import { openapi } from '@/lib/openapi';
import { readdirSync, renameSync, readFileSync, writeFileSync } from 'node:fs';
import { join, basename } from 'node:path';

function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function renameGeneratedFiles(dir: string) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      renameGeneratedFiles(join(dir, entry.name));
    }
    if (entry.isFile() && entry.name.endsWith('.mdx')) {
      const kebab = toKebabCase(basename(entry.name, '.mdx')) + '.mdx';
      if (kebab !== entry.name) {
        renameSync(join(dir, entry.name), join(dir, kebab));
      }
    }
  }
}

function fixMetaJson(dir: string) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      fixMetaJson(join(dir, entry.name));
    }
    if (entry.isFile() && entry.name === 'meta.json') {
      const filePath = join(dir, entry.name);
      const content = JSON.parse(readFileSync(filePath, 'utf-8'));
      if (content.pages) {
        content.pages = content.pages.map((page: string) => toKebabCase(page));
      }
      writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n');
    }
  }
}

const output = './content/api/endpoint';

await generateFiles({
  input: openapi,
  output,
  includeDescription: true,
  meta: {
    folderStyle: 'folder',
  },
});

renameGeneratedFiles(output);
fixMetaJson(output);
