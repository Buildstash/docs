import { apiDocs } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

export const { GET } = createFromSource(apiDocs, {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: 'english',
});
