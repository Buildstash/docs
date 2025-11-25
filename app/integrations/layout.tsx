import { DocsLayout } from '@/components/layout/docs';
import { baseOptions } from '@/lib/layout.shared';
import { integrationsDocs } from '@/lib/source';
import { sidebarTabs } from '@/lib/docs-config';

export default function Layout({ children }: LayoutProps<'/integrations'>) {
  return (
    <DocsLayout 
      tree={integrationsDocs.pageTree} 
      sidebar={sidebarTabs}
      {...baseOptions()}
      nav={{ title: null }}
    >
      {children}
    </DocsLayout>
  );
}
