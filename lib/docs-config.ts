import type { DocsLayoutProps } from 'fumadocs-ui/layouts/docs';

export const sidebarTabs: DocsLayoutProps['sidebar'] = {
  tabs: [
    { 
      title: 'Platform', 
      url: '/', 
      description: 'Buildstash platform',
      icon: 'BookOpen',
    },
    { 
      title: 'Integrations',
      url: '/integrations', 
      description: 'Connect external tools',
      icon: 'Plug',
    },
    { 
      title: 'API', 
      url: '/api', 
      description: 'API reference',
      icon: 'Code',
    },
  ],
};