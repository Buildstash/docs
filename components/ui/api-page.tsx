import { openapi } from '@/lib/openapi';
import { createAPIPage } from 'fumadocs-openapi/ui';

export const APIPage = createAPIPage(openapi, {
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