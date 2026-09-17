import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost, publishedPosts } from "@/data/blog";
import { getGateway } from "@/lib/gateway";
import { formatDate } from "@/lib/format";
import { JsonLd, breadcrumbJsonLd, canonical, pageMetadata } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";

/**
 * Only slugs present in `data/blog.ts` are generated. With no articles the
 * route builds to nothing and any request under /blog/* is a 404, which is
 * the intended behaviour rather than a placeholder page.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return publishedPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return pageMetadata({
    title: post.title,
    description: post.summary,
    path: `/blog/${post.slug}`,
    keywords: post.tags,
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const related = (post.gateways ?? [])
    .map((gatewaySlug) => getGateway(gatewaySlug))
    .filter((gateway) => gateway !== undefined);

  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title={post.title}
        description={post.summary}
        breadcrumb={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      >
        <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-ink-subtle">
          <time dateTime={post.publishedAt}>Published {formatDate(post.publishedAt)}</time>
          {post.updatedAt ? (
            <time dateTime={post.updatedAt}>Updated {formatDate(post.updatedAt)}</time>
          ) : null}
        </p>
      </PageHeader>

      <Container width="prose">
        <article className="flex flex-col gap-5 py-12 text-[15.5px] leading-[1.75] text-ink-muted">
          {post.body.map((block, index) => {
            if (block.type === "heading") {
              return (
                <h2
                  key={index}
                  className="mt-4 text-[22px] font-semibold tracking-[-0.02em] text-ink"
                >
                  {block.text}
                </h2>
              );
            }
            if (block.type === "list") {
              return (
                <ul key={index} className="flex list-disc flex-col gap-2 pl-5">
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              );
            }
            return <p key={index}>{block.text}</p>;
          })}

          {post.tags && post.tags.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <li key={tag}>
                  <Badge tone="outline" size="sm">
                    {tag}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : null}

          {related.length > 0 ? (
            <div className="mt-6 rounded-card border border-line bg-subtle p-5">
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.07em] text-ink-subtle">
                Gateways discussed
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {related.map((gateway) => (
                  <li key={gateway.id}>
                    <Link
                      href={`/gateways/${gateway.slug}`}
                      className="text-[13.5px] font-medium text-brand-ink hover:underline"
                    >
                      {gateway.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </article>
      </Container>

      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.summary,
            datePublished: post.publishedAt,
            ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
            url: canonical(`/blog/${post.slug}`),
            publisher: { "@id": `${canonical("/")}#organization` },
          },
        ]}
      />
    </>
  );
}
