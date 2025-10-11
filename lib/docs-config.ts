import type { DocsLayoutProps } from 'fumadocs-ui/layouts/docs';

export const sidebarTabs: DocsLayoutProps['sidebar'] = {
  tabs: [
    { title: 'Guide', url: '/guide', description: 'Guide to the Buildstash platform' },
    { title: 'Integrations', url: '/integrations', description: 'Connect Buildstash to the other tools you use' },
    { title: 'API', url: '/api', description: 'API documentation' },
  ],
};