import type { DocsLayoutProps } from 'fumadocs-ui/layouts/docs';

export const sidebarTabs: DocsLayoutProps['sidebar'] = {
  tabs: [
    { 
      title: 'Guide', 
      url: '/guide', 
      description: 'Guide to the Buildstash platform',
      logo: {
        light: '/logos/logo-api-light.svg',
        dark: '/logos/logo-api-dark.svg'
      }
    },
    { 
      title: 'Integrations', 
      url: '/integrations', 
      description: 'Connect Buildstash to the other tools you use',
      logo: {
        light: '/logos/logo-api-light.svg',
        dark: '/logos/logo-api-dark.svg'
      }
    },
    { 
      title: 'API', 
      url: '/api', 
      description: 'API documentation',
      logo: {
        light: '/logos/logo-api-light.svg',
        dark: '/logos/logo-api-dark.svg'
      }
    },
  ],
};