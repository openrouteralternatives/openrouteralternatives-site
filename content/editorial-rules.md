# Editorial rules

These are the rules the site is built to. They are recorded here so that a future dataset
update or page can be checked against them without re-reading the original brief.

## Positioning

- Core: "Compare AI gateways, model routers and multi-provider AI APIs."
- Secondary: "Compare OpenRouter alternatives by models, providers, EU jurisdiction, data
  residency, infrastructure, deployment, modalities, company scale and more."
- The homepage leads with the comparison database, not with an editorial article.
- The site must not read as a sales page for any vendor, including the one operating it.

## What may never appear

- An arbitrary overall score, rating or composite index. A category page may order its
  members by a weighted score only when the page itself declares every recorded attribute
  and weight that feeds it, the scoring code refers to no gateway by name, and an
  attribute that is not recorded earns nothing.
- The claim that one company is "the best OpenRouter alternative" without a specific
  measurable criterion attached to that claim.
- An invented value of any kind: model count, provider count, follower count, legal
  entity, jurisdiction, residency claim or certification.
- Two different companies merged into one entry, or one company split into two.
- A jurisdiction assigned without evidence, or EU incorporation presented as evidence of
  EU data residency.
- Unverified allegations about any vendor.
- A competitor's blog post or comparison page used as primary evidence, in either
  direction.
- Sorting or filtering manipulated to favour one entry, or a competitor hidden from a
  list they qualify for.
- A gateway named in ranking, scoring or category code. Membership and order follow from
  recorded values only.

## Counting rules

**Models.** Distinct models addressable through a gateway's public API, deduplicated where
possible. Measured directly from a public model endpoint where one exists, and always
displayed with the measurement date. Vendor-stated totals are labelled as such and are
excluded from rankings built on measured counts. Routes are counted separately as
model × provider combinations.

**Providers.** Distinct upstream inference providers or model companies reachable through
the gateway. The same provider is not counted twice for being offered in two regions.
Vendor-published counts are marked vendor-stated.

**Routes and endpoints.** A route is one model served by one provider; an endpoint is an
individually addressable API entry as the vendor publishes it. They are separate fields
that share one table column, labelled with whichever is shown, and neither is ever
derived from the other or from modalities.

**Source of truth.** The most recent verified research pass supplies the current vendor
figures and company attributes. Where it publishes a figure, that figure is current and
this project's earlier measurements stay on record in the metric's history; where it
publishes none, the project's own dated measurement remains current.

**Employees.** LinkedIn company-size bands only. Precise headcounts are never
reconstructed from third-party databases.

**Social.** LinkedIn and X captured on the same date so the pair stays comparable, and
displayed rounded by scale. Follower count is never used to order anything.

**Funding.** The number of disclosed financing rounds and the investors named in them,
describing the operating company, from its own announcements or a named company database.
Grants, strategic investments outside a disclosed round and acquisitions are described,
never counted. Funding that could not be publicly verified is "Not publicly listed", never
zero; zero is written only where the company is known to have raised no external round. A
cloud provider's product or a community project records "Not applicable".

**Observability.** One of five levels read from vendor documentation, never inferred from
the product category and never used to rank anything: None · Basic · Limited · Detailed ·
Advanced. The definitions live in the methodology section.

## The three residency attributes

These are separate fields, populated from separate sources, and none is derived from
another:

1. **Company jurisdiction** — where the operating legal entity is incorporated.
2. **Gateway location** — where the gateway receives, authenticates and logs the request.
3. **Inference location** — where the upstream model actually runs.

Residency labels: EU by default · EU available · EU routes / selected models ·
Enterprise only · Not stated · Self-hosted / customer controlled · Needs verification.

## Data status labels

Verified · Vendor-stated · Estimated · Needs verification · Not disclosed ·
Not applicable. Missing data is labelled, never guessed.

## Corrections

Corrections are dated and logged in the changelog with the previous value, the new value
and the source. Major historical figures are never silently overwritten — a superseded
measurement stays visible next to the one that replaced it.

## Tone

Neutral, technical, evidence-driven, concise. Confident without promotional language. No
"AI is transforming…" copy. Where the dataset supports a fact about a vendor, state the
fact; do not decorate it.
