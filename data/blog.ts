import type { BlogPost } from "@/types/blog";

/**
 * Published articles.
 *
 * Empty on purpose. Adding the first article means appending a `BlogPost`
 * here; the index, the article route, the sitemap and the homepage teaser all
 * read this list. No dates, authors or cards are invented in the meantime.
 */
export const blogPosts: BlogPost[] = [];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

/** Newest first. */
export function publishedPosts(): BlogPost[] {
  return [...blogPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
