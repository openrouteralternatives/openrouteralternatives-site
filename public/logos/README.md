# Brand assets

Locally stored marks for the gateways in the dataset. `GatewayLogo` renders the
file named in a record's `logo` field inside a fixed-size box, and draws a
monogram for every record whose `logo` is `null`, so nothing on the site
hotlinks a third party's image and no row shifts while an image loads.

`npm run audit` fails if a record points at a file that is not here.

## Provenance

Every file below is the icon the vendor serves from its own website (the
`apple-touch-icon`, `<link rel="icon">` target, the PNG embedded in its
`favicon.ico`, or a mark cut from its own logo SVG), retrieved on September 17,
2026. Marks remain the property of their owners and are used here for
identification only. No logo was taken from a third-party logo directory.

| File | Gateway | Retrieved from |
| --- | --- | --- |
| `aiml-api.png` | AI/ML API | aimlapi.com site icon (Webflow asset CDN) |
| `amazon-bedrock.png` | Amazon Bedrock | aws.amazon.com touch icon (a0.awsstatic.com) |
| `anannas.png` | Anannas | anannas.ai/Icon.png (`apple-touch-icon` / `mask-icon`), padded onto a square transparent canvas |
| `atlas-cloud.svg` | Atlas Cloud | atlascloud.ai/logo.svg — the "A" mark path only, re-framed square; the rest of that file is the wordmark |
| `azure-ai-foundry.png` | Azure AI Foundry | learn.microsoft.com/apple-touch-icon.png |
| `braintrust.png` | Braintrust | braintrust.dev/icon180.png |
| `cortecs.png` | Cortecs | cortecs.ai/favicon.ico (48 px entry) |
| `eden-ai.png` | Eden AI | edenai.co site icon (Webflow asset CDN) |
| `edgee.svg` | Edgee | edgee.ai/assets/icons/favicon.svg (edgee.cloud redirects there) |
| `envoy-ai-gateway.png` | Envoy AI Gateway | envoyproxy.io/favicon.ico (128 px entry, Envoy project mark) |
| `eurouter.png` | EUrouter | eurouter.ai/apple-icon.png (180 px) |
| `google-vertex-ai.png` | Google Vertex AI | cloud.google.com site icon (gstatic.com) |
| `helicone.png` | Helicone | helicone.ai/favicon.ico (256 px PNG entry) |
| `kong-ai-gateway.png` | Kong AI Gateway | konghq.com/favicon-180.png |
| `litellm.png` | LiteLLM | litellm.ai site icon (Webflow asset CDN) |
| `llmgateway.png` | llmgateway.io | llmgateway.io/favicon/apple-touch-icon.png |
| `martian.png` | Martian | withmartian.com site icon (Webflow asset CDN) |
| `maxim-ai.png` | Maxim AI (Bifrost) | getmaxim.ai site icon (Framer asset CDN) |
| `nexos-ai.png` | nexos.ai | nexos.ai `apple-touch-icon` 180 px (served from the company's own sb.nordcdn.com asset CDN) |
| `not-diamond.png` | Not Diamond | notdiamond.ai `og:image` mark (Sanity asset CDN), 256 px render |
| `novita-ai.png` | Novita AI | novita.ai/favicon-dark.ico (256 px PNG entry) |
| `opper.png` | Opper AI | opper.ai/images/icon-dark.png |
| `orq-ai.svg` | Orq.ai | orq.ai site icon (Framer asset CDN) |
| `portkey.png` | Portkey | portkey.ai site icon (Framer asset CDN), 64 px |
| `requesty.png` | Requesty | requesty.ai/apple-icon.png |
| `respan.png` | Respan | respan.ai/icon-192.png (keywordsai.co redirects there) |
| `routescope.svg` | RouteScope | routescope.ai/favicon.svg |
| `truefoundry.png` | TrueFoundry | truefoundry.com site icon (Webflow asset CDN) |

Every record in the dataset now has a local mark; the monogram fallback in
`GatewayLogo` remains for future entries whose official mark has not been
retrieved yet.

The site's own icon set (`app/favicon.ico`, `app/icon.svg`, `app/apple-icon.png`)
is rendered from the routing glyph in `components/layout/wordmark.tsx`. The
previous favicon was the OpenRouter product mark, which is not this site's brand.

## Adding or replacing a mark

1. Take the file from the vendor's own site or repository, never from a logo
   aggregator. Prefer SVG, then a PNG of at least 64 px.
2. Save it here as `<gateway-slug>.<ext>` and add a row to the table above.
3. Set `logo: "/logos/<gateway-slug>.<ext>"` on the record in `data/gateways.ts`.
4. Run `npm run audit`.
