import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <svg
            width="24"
            height="24"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Logo"
          >
            <circle cx={12} cy={12} r={12} fill="currentColor" />
          </svg>
          Buildstash
        </>
      ),
    },
    githubUrl: 'https://github.com/buildstash',
    // see https://fumadocs.dev/docs/ui/navigation/links
    links: [
      {
        text: 'Roadmap',
        url: 'https://support.buildstash.com',
        // secondary items will be displayed differently on navbar
        secondary: false,
      },
      {
        text: 'Changelog',
        url: 'https://support.buildstash.com/changelog',
        // secondary items will be displayed differently on navbar
        secondary: false,
      },
      {
        text: 'Support',
        url: 'https://support.buildstash.com',
        secondary: false,
      },
      {
        type: 'menu',
        text: 'More',
        items: [
          {
            text: 'Buildstash.com',
            url: 'https://buildstash.com',
            secondary: false,
          },
          {
            text: 'Blog',
            url: 'https://blog.buildstash.com',
            secondary: false,
          },
          {
            text: 'Pricing',
            url: 'https://buildstash.com/pricing',
            secondary: false,
          },
          {
            text: 'Go to App',
            url: 'https://app.buildstash.com',
            secondary: false,
          },
        ],
      },
    ],
  };
}
