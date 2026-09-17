import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, PenLine } from "lucide-react";
import { publishedPosts } from "@/data/blog";
import { REPOSITORY_URL } from "@/data/site";
import { formatDate } from "@/lib/format";
import { JsonLd, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description:
    "Notes on measuring AI gateways: how model catalogues are counted, what EU residency claims actually establish, and what changes between dataset revisions.",
  path: "/blog",
  keywords: ["AI gateway blog", "OpenRouter alternatives analysis", "model router research"],
});

export default function BlogIndexPage() {
  const posts = publishedPosts();

  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title="Notes from the dataset"
        description="Articles that go deeper than a table cell: how a figure was measured, why two vendors' numbers cannot be compared, and what changed between revisions."
        breadcrumb={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ]}
      />

      <Container width="reading">
        <div className="py-12">
          {posts.length === 0 ? (
            <div className="rounded-card border border-line bg-surface p-8 shadow-card sm:p-10">
              <span className="flex size-10 items-center justify-center rounded-lg border border-line bg-subtle">
                <PenLine aria-hidden="true" className="size-4 text-ink-muted" />
              </span>
              <h2 className="mt-5 text-[22px] font-semibold tracking-[-0.02em] text-ink">
                Articles coming soon
              </h2>
              <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-ink-muted">
                Nothing is published here yet. Articles will follow the same rule as the rest of
                the site: every figure carries its source and the date it was observed, and no
                vendor is called the best without a stated criterion.
              </p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
                <Link
                  href="/#compare"
                  className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-brand-ink hover:underline"
                >
                  Open the comparison table
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </Link>
                <a
                  href={REPOSITORY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-ink-muted hover:text-ink"
                >
                  Follow the project on GitHub
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <ol className="flex flex-col gap-4">
              {posts.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col gap-2 rounded-card border border-line bg-surface p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-raised"
                  >
                    <time dateTime={post.publishedAt} className="text-[12.5px] text-ink-subtle">
                      {formatDate(post.publishedAt)}
                    </time>
                    <h2 className="text-[19px] font-semibold tracking-[-0.02em] text-ink group-hover:text-brand-ink">
                      {post.title}
                    </h2>
                    <p className="text-[14px] leading-relaxed text-ink-muted">{post.summary}</p>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
      </Container>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ])}
      />
    </>
  );
}
