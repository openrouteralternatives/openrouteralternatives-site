import { Container } from "@/components/layout/container";

/** Skeleton matching the page-header plus table rhythm used across the site. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      <div className="border-b border-line bg-subtle">
        <Container>
          <div className="py-12">
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-5 h-9 w-[min(28rem,80%)] animate-pulse rounded bg-muted" />
            <div className="mt-4 h-4 w-[min(36rem,92%)] animate-pulse rounded bg-muted" />
            <div className="mt-8 flex gap-10">
              {[0, 1, 2].map((i) => (
                <div key={i}>
                  <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                  <div className="mt-2 h-3 w-24 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          </div>
        </Container>
      </div>

      <Container width="wide">
        <div className="py-10">
          <div className="overflow-hidden rounded-card border border-line">
            <div className="h-11 border-b border-line bg-subtle" />
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-line px-4 py-4">
                <div className="size-9 animate-pulse rounded-lg bg-muted" />
                <div className="flex-1">
                  <div className="h-3.5 w-40 animate-pulse rounded bg-muted" />
                  <div className="mt-2 h-2.5 w-56 animate-pulse rounded bg-muted" />
                </div>
                <div className="hidden h-3.5 w-20 animate-pulse rounded bg-muted sm:block" />
                <div className="hidden h-3.5 w-24 animate-pulse rounded bg-muted lg:block" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
