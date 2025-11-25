import { DocsLayout } from '@/components/layout/docs';
import { baseOptions } from '@/lib/layout.shared';
import { guideDocs } from '@/lib/source';
import { sidebarTabs } from '@/lib/docs-config';

export default function Layout({ children }: LayoutProps<'/[[...slug]]'>) {
  return (
    <DocsLayout 
      tree={guideDocs.pageTree} 
      sidebar={sidebarTabs}
      {...baseOptions()}
      nav={{ title: null }}
    >
      {children}
    </DocsLayout>
  );
}

