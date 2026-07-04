'use client';
import { createOpenAPIPage } from 'fumadocs-openapi/ui';
import { createApiCodeUsageRegistry } from '@/lib/api-code-samples';

export const APIPage = createOpenAPIPage({
  codeUsages: createApiCodeUsageRegistry(),
  schemaUI: {
    showExample: true,
  },
  playground: {
    enabled: false
  },
  shikiOptions: {
    themes: {
      dark: 'vesper',
      light: 'vitesse-light',
    },
  },
});
