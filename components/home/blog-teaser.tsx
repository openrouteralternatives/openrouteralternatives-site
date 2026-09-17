import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { publishedPosts } from "@/data/blog";
import { formatDate } from "@/lib/format";
import { Container, SectionHeading } from "@/components/layout/container";

/**
 * Blog teaser for the homepage.
 *
 * Shows the newest articles when there are any. With none published it shows
 * a single, honest "coming soon" line rather than placeholder cards.
 */
export function BlogTeaser({ limit = 3 }: { limit?: number }) {
  const posts = publishedPosts().slice(0, limit);

  return (
    <section aria-labelledby="blog-heading" className="py-14">
      <Container>
        <SectionHeading
          id="blog-heading"
          eyebrow="Blog"
          title="Notes from the dataset"
          description="Longer-form explanations of how figures are measured and what changes between revisions."
          action={
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-brand-ink hover:underline"
            >
              Open the blog
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          }
        />

        {posts.length === 0 ? (
          <p className="mt-6 rounded-card border border-dashed border-line bg-surface px-5 py-4 text-[13.5px] text-ink-muted">
            Articles coming soon. Nothing is published yet, and nothing is shown here until it is.
          </p>
        ) : (
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.slug} className="flex">
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex w-full flex-col rounded-card border border-line bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-raised"
                >
                  <time dateTime={post.publishedAt} className="text-[12px] text-ink-subtle">
                    {formatDate(post.publishedAt)}
                  </time>
                  <h3 className="mt-2 text-[15px] font-semibold tracking-[-0.01em] text-ink group-hover:text-brand-ink">
                    {post.title}
                  </h3>
                  <p className="mt-2 flex-1 text-[13px] leading-relaxed text-ink-muted">
                    {post.summary}
                  </p>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </Container>
    </section>
  );
}
