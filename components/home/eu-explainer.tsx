import Link from "next/link";
import { ArrowRight, Building2, ChevronDown, Cpu, Server } from "lucide-react";
import { allGateways } from "@/lib/gateway";
import { Container, SectionHeading } from "@/components/layout/container";

const LAYERS = [
  {
    step: "01",
    icon: Building2,
    title: "Company jurisdiction",
    question: "Who are you contracting with?",
    body: "Where the operating company is incorporated. It determines which courts and corporate law apply, not where your requests go.",
    check: "Look for: a registry entry naming the operating entity, not a marketing page.",
  },
  {
    step: "02",
    icon: Server,
    title: "Gateway location",
    question: "Where does your prompt first land?",
    body: "Where the gateway receives, authenticates and logs your request before forwarding it. The first place your prompt exists outside your own systems.",
    check: "Look for: documented regions, and a statement about where request logs are stored.",
  },
  {
    step: "03",
    icon: Cpu,
    title: "Inference location",
    question: "Where does the model actually run?",
    body: "Where the upstream provider serves the model. It is set by that provider and often differs per model, so one gateway can be EU-hosted for some models and not others.",
    check: "Look for: per-model or per-route region information, not a single site-wide claim.",
  },
];

const CLAIMS = [
  {
    claim: "“We are a European company.”",
    means: "A statement about incorporation.",
    doesNot: "It does not establish where requests are processed or where models run.",
  },
  {
    claim: "“EU-hosted infrastructure.”",
    means: "A statement about the gateway's own servers.",
    doesNot:
      "It does not establish that the upstream models run in the EU, which is the larger share of processing.",
  },
  {
    claim: "“GDPR compliant.”",
    means: "A claim about the legal basis and contractual terms for processing.",
    doesNot:
      "It does not imply data stays in the EU. Transfers outside the EU can be lawful under the right mechanism.",
  },
  {
    claim: "“Zero data retention.”",
    means: "A statement about how long content is kept.",
    doesNot: "It does not say where it was processed while it was being handled.",
  },
];

const QUESTIONS = [
  "Which legal entity will appear on the contract, and in which country is it registered?",
  "In which region does the gateway terminate requests, and where are request and response logs stored?",
  "For the specific models we intend to use, in which region does inference run?",
  "Is EU processing the default, a setting, limited to certain routes, or only available under an enterprise agreement?",
  "Which subprocessors receive prompt content, and where are they located?",
  "Is content retained at all, and if so for how long and for what purpose?",
];

/**
 * The site's central editorial point: three separate attributes that are
 * routinely collapsed into one claim. The dataset records them in separate
 * columns and never infers one from another. The longer treatment that used
 * to live on its own page sits in the disclosure beneath the three cards.
 */
export function EuExplainer() {
  const gateways = allGateways();
  const euIncorporated = gateways.filter((g) => g.euJurisdiction.value === true);
  const euProcessing = gateways.filter((g) =>
    ["eu-by-default", "eu-available", "eu-routes"].includes(g.euResidency.value ?? ""),
  );
  const both = euIncorporated.filter((g) => euProcessing.includes(g));

  return (
    <section
      id="eu-explainer"
      aria-labelledby="eu-explainer-heading"
      className="scroll-mt-20 py-14"
    >
      <Container>
        <SectionHeading
          id="eu-explainer-heading"
          eyebrow="Data residency"
          title="EU company ≠ EU data residency"
          description="Three separate attributes get collapsed into a single claim. This directory records them in three separate columns, and never infers one from another."
          action={
            <Link
              href="/categories/eu-hosted"
              className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-brand-ink hover:underline"
            >
              Compare EU-hosted gateways
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          }
        />

        <ol className="mt-8 grid gap-4 lg:grid-cols-3 lg:gap-0">
          {LAYERS.map((layer, index) => {
            const Icon = layer.icon;
            return (
              <li key={layer.step} className="relative flex">
                <div
                  className={`flex w-full flex-col rounded-card border border-line bg-surface p-5 shadow-card lg:rounded-none ${
                    index === 0 ? "lg:rounded-l-card" : ""
                  } ${index === 2 ? "lg:rounded-r-card" : "lg:border-r-0"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-lg border border-line bg-subtle">
                      <Icon aria-hidden="true" className="size-4 text-ink-muted" />
                    </span>
                    <span className="font-mono text-[11px] text-ink-subtle">{layer.step}</span>
                  </div>
                  <h3 className="mt-4 text-[15px] font-semibold tracking-[-0.01em] text-ink">
                    {layer.title}
                  </h3>
                  <p className="mt-1 text-[12.5px] font-medium text-brand-ink">{layer.question}</p>
                  <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-ink-muted">
                    {layer.body}
                  </p>
                  <p className="mt-4 border-t border-line pt-3 text-[12.5px] leading-relaxed text-ink-subtle">
                    {layer.check}
                  </p>
                </div>

                {index < 2 ? (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-3 left-1/2 z-10 hidden size-6 -translate-x-1/2 items-center justify-center rounded-full border border-line bg-surface lg:right-0 lg:top-1/2 lg:bottom-auto lg:left-auto lg:flex lg:translate-x-1/2 lg:-translate-y-1/2"
                  >
                    <ArrowRight className="size-3 text-ink-subtle" />
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>

        <p className="mt-4 text-[12.5px] leading-relaxed text-ink-subtle">
          In the current dataset: {euIncorporated.length} EU-incorporated companies,{" "}
          {euProcessing.length} gateways with documented EU processing on standard plans, and{" "}
          {both.length} that are both. The intersection is computed from separately sourced
          fields, never assumed.
        </p>

        <details className="group mt-6 overflow-hidden rounded-card border border-line bg-surface shadow-card">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
            <span>
              <span className="block text-[14.5px] font-semibold tracking-[-0.01em] text-ink">
                What common claims actually establish
              </span>
              <span className="mt-1 block text-[13px] text-ink-muted">
                None of these is dishonest. Each answers a narrower question than it appears to,
                and here are the questions worth asking instead.
              </span>
            </span>
            <ChevronDown
              aria-hidden="true"
              className="size-4 shrink-0 text-ink-subtle transition-transform duration-200 group-open:rotate-180"
            />
          </summary>

          <div className="border-t border-line">
            <div className="scroll-shadow-x overflow-x-auto">
              <table className="w-full min-w-[40rem] text-left">
                <caption className="sr-only">
                  Common vendor claims, what each establishes and what it does not.
                </caption>
                <thead>
                  <tr className="border-b border-line bg-subtle">
                    {["Claim", "What it establishes", "What it does not"].map((heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-muted"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CLAIMS.map((row) => (
                    <tr key={row.claim} className="border-b border-line last:border-b-0">
                      <th
                        scope="row"
                        className="px-5 py-3.5 align-top text-[13.5px] font-medium text-ink"
                      >
                        {row.claim}
                      </th>
                      <td className="px-5 py-3.5 align-top text-[13.5px] leading-relaxed text-ink-muted">
                        {row.means}
                      </td>
                      <td className="px-5 py-3.5 align-top text-[13.5px] leading-relaxed text-ink-muted">
                        {row.doesNot}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-line bg-subtle px-5 py-5">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-subtle">
                Questions worth asking a vendor
              </h3>
              <ol className="mt-3 grid gap-2 sm:grid-cols-2">
                {QUESTIONS.map((question, index) => (
                  <li
                    key={question}
                    className="flex gap-3 rounded-card border border-line bg-surface p-3.5"
                  >
                    <span className="tnum font-mono text-[11.5px] text-ink-subtle">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[13.5px] leading-relaxed text-ink">{question}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-[12.5px] text-ink-subtle">
                Each maps to a field in this dataset, so an answer can be recorded rather than
                remembered. The residency labels used in the table are defined under{" "}
                <Link href="/#eu-residency" className="text-brand-ink hover:underline">
                  methodology
                </Link>
                .
              </p>
            </div>
          </div>
        </details>
      </Container>
    </section>
  );
}
