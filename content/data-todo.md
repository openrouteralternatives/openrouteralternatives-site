# Open data items

What is still open after the September 15, 2026 measurement and validated-research
revision, and what would close each item.

**Model and provider counts are no longer "open" in the old sense.** Every
quantitative field now carries a `MetricStatus` explaining what kind of evidence
it is, so a gateway without a number states *why*: the provider publishes none
(`not_published`), the catalogue is whatever the customer configures
(`variable`), the only published figure counts something else
(`not_comparable`), or sources disagree (`conflicting`). Those are answers, not
gaps, and they do not need closing. Filling any of these is a change to `data/gateways.ts`
alone — no component changes are required.

Run `npm run audit` after any edit. It classifies every unresolved field as a
genuine conflict, a not-applicable attribute, or open research, and fails on
integrity defects (duplicate entities, routes recorded as models, EU jurisdiction
leaking into an EU residency label, a field citing a source the record does not
have).

## Preserved conflicts — do not "resolve" these without new primary evidence

These are the only unresolved fields that are unresolved on purpose. Each was
researched and the evidence conflicted; publishing either side would be a guess.

| Entry | Field | Why it stays unresolved |
| --- | --- | --- |
| TrueFoundry | Legal entity, country | Entity evidence conflicts. San Francisco is recorded as a city, which is a separate fact from incorporation. |
| Edgee | Legal entity, country | French and US entity evidence conflicts, so it is **not** counted as EU-incorporated despite its European presence. |
| Anannas | Country, legal entity | The published Terms contain an unfinished `[your jurisdiction]` placeholder, so there is no governing jurisdiction to read. |
| Opper | Model count | The vendor publishes both 700+ and 300+. The higher figure is shown with the conflict noted, not presented as settled. |
| Requesty | Model count | The vendor headline "600+" tracks its 684 endpoints; the deduplicated catalogue measures 545. Both are recorded, neither is presented as the other. |
| AI/ML API | Governing law | Terms name Estonian governing law while the entity is UAE-registered. Both observations are recorded side by side. |

## Not applicable

Recorded as `not-applicable` rather than missing: company fields on Envoy AI
Gateway (a community project, not a company), zero-data-retention on self-hosted
gateways (no vendor endpoint receives the traffic), and licence/repository on
products documented as closed source.

## Open research

### Dataset-wide

| Field | What closes it |
| --- | --- |
| Route counts | Vendor documentation or a catalogue exposing per-model providers. Measured for Cortecs (196) and llmgateway.io (571); published by Edgee (972). |
| Non-LLM catalogue counts | An enumerable endpoint for OCR, speech, image, video or document models. Only AI/ML API exposes one today (790 across all modalities). |
| Social snapshots | Recorded for 19 gateways on September 15, 2026. Still open for AI/ML API, Cortecs, EUrouter, nexos.ai, Opper, Orq.ai, Requesty, Envoy AI Gateway and RouteScope. Capture LinkedIn and X on the same date so the pair stays comparable. |
| LinkedIn profile URLs | Follower counts are recorded but the company-page URLs are not, so the figures are shown without a link. Add `social.linkedinUrl` once each slug is confirmed. |
| Funding history | A filing or the vendor's own announcement. |
| Pricing model detail | The vendor's pricing page. `pricingTransparency` is now recorded for twelve entries — six of them measured from per-model pricing inside the public endpoints — but the free-text pricing model is still open for most. |
| Inference regions | Per-model or per-route region documentation — not a single site-wide claim. |
| DPA and subprocessors | The vendor's legal pages. Recorded for Requesty and the hyperscalers only. |

### Per gateway

- **Founding years** — open for every entry. A registry filing or an about page
  closes each one.

- **Next catalogue refresh** — the September 15, 2026 measurement is complete for
  all seven gateways with public endpoints. For the next one, append a new
  `measured(...)` observation to `models.history` rather than editing an existing
  figure, and keep the same counting rule so the snapshots stay comparable. The
  measured ranking uses the newest observation at `llm` scope.
- **Eden AI** — the operating legal entity has not been read from a registry
  filing, and EU residency is recorded as `eu-routes` because EU processing is
  documented for part of the catalogue rather than every route. A per-route or
  per-region statement would let that be narrowed or widened.
- **Orq.ai** — EU residency is deliberately open. The company is EU-incorporated,
  but that is never used as evidence of where requests are processed.
- **Novita AI** — no operating entity or jurisdiction established. None assumed.
- **Maxim AI** — entity is H3 Labs Inc., but its country of registration has not
  been read from a filing, so `jurisdictionBucket` stays `unresolved`.
- **RouteScope** — nothing established. Listed so the dataset does not silently
  drop a candidate, not because it can be compared yet.
- **EUrouter, Atlas Cloud, Anannas, RouteScope** — official product URLs are not
  confirmed, so `website` is `null` rather than a guessed domain. Their
  vendor-sourced figures cite a `Vendor material` source with no link; the audit
  warns about this so it stays visible.
- **Certifications** — recorded for Eden AI, Orq.ai, nexos.ai, Cortecs, Edgee,
  TrueFoundry, Not Diamond, Maxim AI and the hyperscalers. Atlas Cloud is
  recorded as an explicit "none claimed". The rest are open.
