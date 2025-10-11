import type { DocsLayoutProps } from 'fumadocs-ui/layouts/docs';

export const sidebarTabs: DocsLayoutProps['sidebar'] = {
  tabs: [
    { 
      title: 'Guide', 
      url: '/guide', 
      description: 'Buildstash platform docs',
      logo: {
        light: '/logos/logo-docs-light.svg',
        dark: '/logos/logo-docs-dark.svg'
      }
    } as any,
    { 
      title: 'Plugins',
      url: '/integrations', 
      description: 'Connect external tools',
      logo: {
        light: '/logos/logo-api-light.svg',
        dark: '/logos/logo-plugins-dark.svg'
      }
    } as any,
    { 
      title: 'API', 
      url: '/api', 
      description: 'API documentation',
      logo: {
        light: '/logos/logo-api-light.svg',
        dark: '/logos/logo-api-dark.svg'
      }
    } as any,
  ],
};