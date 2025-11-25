import { getPageImage, integrationsDocs } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/mdx-components';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { getGithubLastEdit } from 'fumadocs-core/content/github';
import { LLMCopyButton, ViewOptions } from '@/components/page-actions';

export default async function Page(props: PageProps<'/integrations/[[...slug]]'>) {
  const params = await props.params;
  const page = integrationsDocs.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  
  // Get last edit time from GitHub (hidden for now, may add back later)
  // const lastEditTime = await getGithubLastEdit({
  //   owner: 'buildstash',
  //   repo: 'docs',
  //   path: `content/integrations/${page.path}`,
  // });

  return (
    <DocsPage 
      toc={page.data.toc} 
      full={page.data.full} 
      tableOfContent={{
        style: 'clerk'
      }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <div className="relative h-0 pointer-events-none">
        <div className="absolute -top-20 right-0 flex flex-row gap-2 items-center pointer-events-auto">
          <LLMCopyButton markdownUrl={`${page.url}.mdx`} />
          <ViewOptions
            markdownUrl={`${page.url}.mdx`}
            githubUrl={`https://github.com/buildstash/docs/blob/main/content/integrations/${page.path}`}
          />
        </div>
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(integrationsDocs, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return integrationsDocs.generateParams();
}

export async function generateMetadata(
  props: PageProps<'/integrations/[[...slug]]'>,
): Promise<Metadata> {
  const params = await props.params;
  const page = integrationsDocs.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}
