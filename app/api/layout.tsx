import { DocsLayout } from '@/components/layout/docs';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';
import { sidebarTabs } from '@/lib/docs-config';
import { ApiSidebarItem } from '@/components/api-sidebar-item';

export default function Layout({ children }: LayoutProps<'/api'>) {
  return (
    <DocsLayout 
      tree={source.pageTree} 
      sidebar={{
        ...sidebarTabs,
        components: {
          Item: ApiSidebarItem,
        },
      }}
      {...baseOptions()}
      nav={{ title: null }}
    >
      {children}
    </DocsLayout>
  );
}
