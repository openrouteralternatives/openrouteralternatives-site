/**
 * Blog content model.
 *
 * Articles are authored as data in `data/blog.ts` and rendered by
 * `app/blog/[slug]`. There are deliberately no placeholder posts: the list is
 * empty until a real article exists, and the blog index renders an intentional
 * empty state in the meantime.
 */
export interface BlogPost {
  /** URL segment under /blog. */
  slug: string;
  title: string;
  /** One or two sentences for the index card and the meta description. */
  summary: string;
  /** ISO date of first publication. */
  publishedAt: string;
  /** ISO date of the last substantive edit, if any. */
  updatedAt?: string;
  /** Free-text tags for grouping; not rendered as taxonomy pages. */
  tags?: string[];
  /**
   * Article body as an ordered list of blocks. Kept intentionally small so
   * the first article does not require a Markdown pipeline; extend when
   * needed.
   */
  body: BlogBlock[];
  /** Gateway slugs the article discusses, for cross-linking to profiles. */
  gateways?: string[];
}

export type BlogBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] };
