"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced in the browser console and in server logs via the digest.
    console.error(error);
  }, [error]);

  return (
    <Container width="prose">
      <div className="flex flex-col items-start py-24 sm:py-32">
        <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink-subtle">
          Something went wrong
        </p>
        <h1 className="mt-4 text-[30px] font-semibold tracking-[-0.03em] text-ink sm:text-[36px]">
          This page failed to render
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
          The comparison data is static, so this is most likely a temporary rendering failure
          rather than a problem with the dataset.
          {error.digest ? (
            <>
              {" "}
              Reference: <code className="font-mono text-[13px]">{error.digest}</code>.
            </>
          ) : null}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="primary" onClick={reset}>
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back to the directory</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
