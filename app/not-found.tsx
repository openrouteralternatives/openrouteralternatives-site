import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";

export default function NotFound() {
  return (
    <Container width="prose">
      <div className="flex flex-col items-start py-24 sm:py-32">
        <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink-subtle">
          404 — not found
        </p>
        <h1 className="mt-4 text-[32px] font-semibold tracking-[-0.03em] text-ink sm:text-[40px]">
          This page is not in the directory
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
          The gateway, category or page you asked for is not part of the current dataset. It may
          have been renamed, or it may never have been tracked here.
        </p>
        <ul className="mt-8 flex flex-col gap-3">
          {[
            ["/compare", "Compare every gateway"],
            ["/gateways", "Browse gateway profiles"],
            ["/categories", "Browse categories"],
            ["/#methodology", "Read the methodology"],
            ["/blog", "Read the blog"],
          ].map(([href, label]) => (
            <li key={href}>
              <Link
                href={href}
                className="inline-flex items-center gap-1.5 text-[14.5px] font-medium text-brand-ink hover:underline"
              >
                {label}
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Container>
  );
}
