import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';
import { sidebarTabs } from '@/lib/docs-config';

export default function Layout({ children }: LayoutProps<'/guide'>) {
  return (
    <DocsLayout tree={source.pageTree} sidebar={sidebarTabs}>
      {children}
    </DocsLayout>
  );
}
