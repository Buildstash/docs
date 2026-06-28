import { generateFiles } from 'fumadocs-openapi';
import { openapi } from '@/lib/openapi';
import { readdirSync, renameSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';

function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function renameGeneratedFiles(dir: string) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.mdx')) {
      const kebab = toKebabCase(basename(entry.name, '.mdx')) + '.mdx';
      if (kebab !== entry.name) {
        renameSync(join(dir, entry.name), join(dir, kebab));
      }
    }
  }
}

const output = './content/api/endpoint';

await generateFiles({
  input: openapi,
  output,
  includeDescription: true,
});

renameGeneratedFiles(output);