import defaultMdxComponents from 'fumadocs-ui/mdx';
import * as FilesComponents from 'fumadocs-ui/components/files';
import * as TabsComponents from 'fumadocs-ui/components/tabs';
import type { MDXComponents } from 'mdx/types';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import * as lucideIcons from 'lucide-react';
import * as devicons from 'devicons-react';
import * as stashicons from 'stashicons/react';
import * as stashiconsBrand from 'stashicons/react/brand';
import { IntegrationCard } from '@/components/ui/integration-card';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { ImageZoom } from 'fumadocs-ui/components/image-zoom';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...(lucideIcons as unknown as MDXComponents),
    ...(devicons as unknown as MDXComponents),
    ...(stashicons as unknown as MDXComponents),
    ...(stashiconsBrand as unknown as MDXComponents),
    ...defaultMdxComponents,
    ...TabsComponents,
    ...FilesComponents,
    Accordion,
    Accordions,
    IntegrationCard,
    Step,
    Steps,
    img: (props) => <ImageZoom {...(props as any)} />,
    ...components,
  } satisfies MDXComponents;
}

declare module 'mdx/types.js' {
  // Augment the MDX types to make it understand React.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    type Element = React.JSX.Element;
    type ElementClass = React.JSX.ElementClass;
    type ElementType = React.JSX.ElementType;
    type IntrinsicElements = React.JSX.IntrinsicElements;
  }
}

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}