import type { Gateway } from "./gateway";

/** How a category page decides who appears and in what order. */
export type RankingMetric =
  /** Directly measured model counts only, at a single declared scope. */
  | "measured-models"
  /** Figures the providers publish themselves, kept apart from measurements. */
  | "official-models"
  | "providers"
  | "modalities"
  /**
   * A weighted sum of normalised attributes declared on the category itself
   * (see `signals`). Every signal is a recorded, structured field; an
   * attribute a gateway has not recorded earns nothing, and no gateway is
   * ever special-cased by name.
   */
  | "score"
  | "none";

/**
 * One attribute that contributes to a score-ranked category.
 *
 * `value` normalises a recorded field to the 0..1 range, or returns null when
 * the field has no recorded value. Weights are relative: the score is the
 * weighted sum divided by the total weight, so it always reads on a 0..100
 * scale regardless of how many signals a category declares.
 */
export interface RankingSignal {
  id: string;
  /** Short label used in the breakdown shown beside each ranked entry. */
  label: string;
  weight: number;
  value: (gateway: Gateway) => number | null;
}

export interface CategoryDefinition {
  slug: string;
  /** Short label for navigation and cards. */
  name: string;
  /** H1 on the category page. */
  title: string;
  /** <title> tag. */
  seoTitle: string;
  metaDescription: string;
  /** One-paragraph neutral introduction. */
  intro: string;
  /** Exactly what puts a gateway in this list. Shown on the page and on cards. */
  inclusionCriterion: string;
  /** Exactly how the list is ordered, or why it is not ranked. */
  rankingCriterion: string;
  rankingMetric: RankingMetric;
  /** Signals consumed when `rankingMetric` is "score". Ignored otherwise. */
  signals?: RankingSignal[];
  /** Whether a "top 3" block is editorially justified for this category. */
  showTopThree: boolean;
  /** Predicate over the canonical dataset. */
  filter: (gateway: Gateway) => boolean;
  /**
   * Whether the page should also show provider-stated model figures, ranked
   * separately. Only meaningful on a measured-model category.
   */
  showSecondaryModelRanking?: boolean;
  /** Lucide icon name used by the card grid. */
  icon: string;
}

export interface UseCase {
  slug: string;
  title: string;
  description: string;
  /** Category page this use case maps to. */
  categorySlug: string;
  icon: string;
}
