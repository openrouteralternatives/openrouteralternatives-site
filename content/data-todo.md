# Open data items

What is still open after the September 17, 2026 verified research pass, and what would
close each item.

**The research pass is the source of truth for current vendor figures.** Every
quantitative field carries a `MetricStatus` explaining what kind of evidence it is, so
a gateway without a number states *why*: the provider publishes none
(`not_published`), the catalogue is whatever the customer configures (`variable`), the
only published figure counts something else (`not_comparable`), or sources disagree
(`conflicting`). Those are answers, not gaps. Where the research pass published a
figure it is the `current` observation; this project's September 15, 2026 endpoint
measurements stay in each metric's `history` and still drive the measured rankings.

Two display rules apply to vendor figures. A count copied from a vendor's catalogue or
documentation page is shown rounded down to the nearest ten (72 → "70+"); counts under 20
stay exact; the exact figure remains the sortable value and is stated in the tooltip.
Integration counts of customer-configured gateways carry the `documented` status: shown and
sortable, never ranked against hosted catalogues. Rankings prefer a measured count over a
vendor figure of any date (`EVIDENCE_PRIORITY` in `types/metric.ts`).

Run `npm run audit` after any edit. It classifies every unresolved field as a
genuine conflict, a not-applicable attribute, or open research, and fails on
integrity defects (duplicate entities, routes recorded as models, EU jurisdiction
leaking into an EU residency label, a field citing a source the record does not
have, a declared category list that differs from what the filters compute, a
malformed public URL, or an ownership status without the parent it implies).

## Preserved conflicts — do not "resolve" these without new primary evidence

| Entry | Field | Why it stays unresolved |
| --- | --- | --- |
| TrueFoundry | Legal entity | Entity evidence conflicts. The research pass records United States operations, so the country is shown with a needs-verification mark, but the incorporating entity is deliberately left open. |
| Edgee | Legal entity, country, ownership | The research pass records a French presence with an unresolved corporate structure; earlier evidence pointed to both a French and a US entity. Not counted as EU-incorporated. |
| Anannas | Country, legal entity | The published Terms contain an unfinished `[your jurisdiction]` placeholder. United States operations are recorded, but incorporation is not inferred from them. |
| Novita AI | Country, legal entity | Operates from the United States and globally; no registry or legal page establishes the entity. Not inferred from operating locations. |
| AI/ML API | Governing law | Terms name Estonian governing law while the entity is UAE-registered. Both observations are recorded side by side. |
| Requesty | Model count | The vendor's catalogue page separates 211 unique models from 684 endpoints and a 600+ headline; this project measured 545 on September 15. All four figures are on record and none is presented as another. |

## Not applicable

Recorded as `not-applicable` rather than missing: company fields on Envoy AI Gateway
(a community project, not a company), zero-data-retention on self-hosted gateways (no
vendor endpoint receives the traffic), certifications and pricing at the Envoy project
level, and licence/repository on products documented as closed source.

## Open research

### Dataset-wide

| Field | What closes it |
| --- | --- |
| Route counts | Vendor documentation or a catalogue exposing per-model providers. Measured for Cortecs (196) and llmgateway.io (571); published by Edgee (972). Endpoint counts are measured for Eden AI (428), Requesty (684) and AI/ML API (943) and published by Portkey (313). |
| Non-LLM catalogue counts | An enumerable endpoint for OCR, speech, image, video or document models. Only AI/ML API exposes one today (790 across all modalities). |
| Registry confirmation | Outstanding for Eden AI (entity), LiteLLM, Kong Inc., Maxim AI (H3 Labs Inc.) and TrueFoundry. Their countries are shown with a needs-verification mark. |
| Funding history | A filing or the vendor's own announcement. |
| Pricing model detail | The vendor's pricing page. `pricingTransparency` is recorded for every entry except RouteScope; the free-text pricing model is still open. |
| Inference regions | Per-model or per-route region documentation — not a single site-wide claim. Recorded for Cortecs and the hyperscalers only. |
| DPA and subprocessors | The vendor's legal pages. Recorded for Requesty and the hyperscalers only. |
| Founding years | A registry filing or an about page; open for every entry. |

### Per gateway

- **Next catalogue refresh** — append a new `measured(...)` observation to
  `models.history` rather than editing an existing figure, and keep the same counting
  rule so the snapshots stay comparable. The measured ranking uses the newest observation
  at `llm` scope wherever it sits in the metric.
- **Eden AI** — the operating legal entity has not been read from a registry filing. The
  pricing page's "private deployments" option on the custom plan is recorded as the
  `private` deployment option, because the vendor does not say whether it runs in the
  customer's cloud or on-premise; a public statement of its form would let it be recorded
  as VPC or on-premise.
- **EUrouter** — the research pass cited `eu-router.ai`, which did not resolve when
  checked; `eurouter.ai` carries the same KVK number and is recorded as the website.
- **Anannas** — the vendor describes multimodal support without enumerating modalities,
  so only text generation is recorded.
- **RouteScope** — only the website is established. Listed so the dataset does not
  silently drop a candidate, not because it can be compared yet.
- **Social snapshots** — recorded for 27 gateways on September 17, 2026 with company-page
  URLs. Still open: X follower counts for Cortecs, EUrouter and llmgateway.io, and any
  verified account for RouteScope.
