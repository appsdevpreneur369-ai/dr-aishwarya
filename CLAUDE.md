# CLAUDE.md — Aishwarya Dental Clinic and Implant Centre website (ADC)

Public website for **Aishwarya Dental Clinic and Implant Centre**, 4-5-57, beside Sai Baba Road, opp. EMGEE House, Vidyanagar, Guntur 522007 (project code **ADC**, ClinicFlow slug `aishwarya-dental-clinic`), led by **Dr. Aishwarya P, MDS (Periodontics & Implantology), Fellowship in Laser Dentistry**. Built 25 Oct 2026 as a **sales demo**: it shows the doctor how ClinicFlow247 runs her website, booking and post-visit automation. ClinicFlow247 **ENTERPRISE (white-label)**.

**Delivery model: website + core tenant**, copied from the SPDC pattern (`D:\SPDC`). This repo is the public site plus the generated tenant file `tenant/aishwarya.json`. Every role and workflow comes from ClinicFlow core, branded via theme tokens, logo and appTitle. **Never fork core** (`D:\ClinicFlow\CLAUDE.md` forbids per-tenant codebases).

Status (26 Oct 2026): repo https://github.com/appsdevpreneur369-ai/dr-aishwarya (`main`). **Website on staging** (owner's yes 26 Oct); staging API CORS includes it. **Clinic not yet onboarded** (setup-staging.py needs the owner's super-admin password). Open items: `PENDING_ITEMS.md`. Demo flow: `docs/DEMO_SCRIPT.md`.

## Hard rules

- **Ask the owner first** before: pushing to GitHub, running the tenant file / any script against staging, changing the staging API (CORS: `--update-env-vars` only), any deploy. **Never production.**
- **Another session may be deploying core to staging.** Before any step that touches the shared staging API (onboarding, CORS, demo data), tell the owner and wait for the go, so the two don't collide.
- **Read-only:** `D:\ClinicFlow`, `D:\SPDC`, `D:\DR-SINDHU`, `D:\SMSDC`. Core bugs go in `PENDING_ITEMS.md` → "Core", not patched here.
- **Never invent** phone, email, registration number, experience, reviews, ratings, prices, patient counts. Missing = `status: placeholder` (Draft badge). Initials avatar until a real photo; never stock for the doctor or the clinic. Stock photos are captioned "representative".
- **Copy is original:** `npm run originality` fails on any 9-word run shared with SPDC, DR-SINDHU or SMSDC (runs in `npm run check`; skipped where those folders don't exist).
- **Booking never fakes success:** `clinicflow` → `enquiry` → `whatsapp` → "not available" + Call.
- **Plan gate:** `content/plan.json` = `enterprise`; `src/lib/plan.ts` stops the site promising features the plan lacks.
- Logins live only in `credentials/DEMO_LOGINS.local.md` (git-ignored), never in chat or docs.

## Facts and their source (25 Oct 2026)
- From the account owner: name, address, phone + WhatsApp +91 70755 65444, hours Mon–Sat 10 AM–8 PM / Sunday closed, Dr. Aishwarya MDS Periodontics & Implantology, logo, 4 clinic photos.
- From the clinic signboard (exterior photo; use approved by the owner): initial "P", Fellowship in Laser Dentistry, services Laser Surgery, Dental Implants, Root Canal, Clear Aligners, Cosmetology (cosmetic dentistry only until confirmed).
- 24×7 emergency phone line: requested by the owner, **placeholder until the doctor confirms**.
- Google review link: **placeholder** (the owner has only the Google search URL; it is kept as `googleReview.stagingDemoUrl`, staging demo only).

## Core behaviour this demo relies on (checked read-only, core `94ac120`)
- Completion (`PUT /appointments/{id}/complete`, or `POST /appointments/quick-visit`) fires `ConsultationCompletedEvent` → thank-you at +2 h, review request at +14 h (only if the clinic has `googleReviewLink`), reminder +60 h after the request only if `/r/<code>` was not clicked. Jobs run every 10 min; no expiry window, no quiet hours.
- On staging `WHATSAPP_ENABLED=false`: sends are logged `[WhatsApp DRY RUN] to=… template=… params=[…]`. **No admin screen shows message text yet** (being built in the modular-pricing session; don't build it here).

## Stack and brand
Next.js 14.2 App Router, TypeScript strict, Tailwind, next/font (**Sora** headings + **Nunito Sans** body), zod, vitest, lucide-react.

**Design v2 (26 Oct 2026, owner's feedback):** clean clinical layout, different from the other clinic sites (SPDC/SMSDC teal, DR-SINDHU blue, WalkWell green). Violet palette taken from the name label on Dr. Aishwarya's photo (`content/brand.json`): primary `#5A3EB8` (all main buttons, white text), violet-ink `#1D1934` (top bar, footer), lavender tints, lilac `#C9BAFB` accent on dark only. One radius family (12px cards/images, 10px buttons/inputs), plain-text nav with an underline for the current page (no pills), no decorative blobs. The header has a FIXED 72px height: scrolling only toggles its shadow (a padding change at the scroll threshold made it bounce). Her photo `images/dr-aishwarya.png` is used as two crops without its printed name label (`doctor-aishwarya-wide`, `-portrait`), always at natural size (it is only ~600 px wide). `npm run contrast` passes AA; the same colours and fonts feed `themeTokens`.

**Design v3 (26 Oct 2026, owner's "awesome" brief):** full-width hero on the clinic's own operatory photo under a violet veil (photo pinned to the top band on phones), her portrait in a glass card, Google badge, live "next free slot" chip (ClinicFlow `getNextAvailable`, loaded when the browser is idle, hidden without live booking). New home sections, all content-driven (`home.json`): Tap where it hurts (`smileMap`, SVG hotspots → booking prefill), implant journey (`journey`), WhatsApp phone mock-up (`afterVisit`, always labelled as example messages), Google reviews (`clinic.json google`; live via `src/lib/google-reviews.ts` when `GOOGLE_PLACES_API_KEY` is set), clinic tour (scroll-snap + `<dialog>` lightbox). Signature motif `ToothMark` (line drawing of her logo). Nav items never show a box: tap highlight off, focus shown as underline. Local builds on this machine need `NEXT_BUILD_CPUS=1` (low free RAM made the build workers crash natively).

## Commands

| Command | What |
| --- | --- |
| `npm run dev` / `npm run build && npm start` | Dev / production |
| `npm run check` | lint + typecheck + tests + contrast + originality + build |
| `npm run brand` / `npm run images` | Logo assets / WebP variants (images run before every build) |
| `node scripts/fetch-photos.mjs` | Clinic photos from `images/` (offline); `--stock` re-downloads stock |
| `npm run tenant` | Regenerate `tenant/aishwarya.json` from `/content` |
| `node scripts/qa/screens.mjs <base> qa/screens` | 360/768/1280 screenshots, overflow + tap-target report |
| `node scripts/qa/e2e-booking.mjs <base> qa/e2e` | Booking e2e (local or staging, never production; phones 90000113xx) |
| `python scripts/staging/setup-staging.py --admin-email <sa> [--demo-review-link]` | **Owner's yes first.** Onboard on staging: import, ACTIVE, dental suite, logo/favicon, schedules, review link |
| `python scripts/staging/seed-post-visit-demo.py --admin-email <sa> [--clicked]` | **Owner's yes first.** 3 demo patients + phase A/B SQL for the post-visit stages |

In Git Bash, prefix scripts that take `/paths` with `MSYS_NO_PATHCONV=1`.

## Deployments

Same manual pattern as SPDC: build the image locally, push to Artifact Registry, `gcloud run deploy`. Never touch other services, `clinicflow-lb`, certs or DNS.

| Item | Value |
| --- | --- |
| GCP | project `sincere-stock-499113-f1`, region `asia-south1` |
| Image | `asia-south1-docker.pkg.dev/sincere-stock-499113-f1/clinicflow/adc-frontend:<tag>` |
| Staging service | `adc-frontend-staging`: 256Mi, 1 CPU, min-instances 0 (1 only during the meeting window), unauthenticated, port 3000 |
| Expected URL | https://adc-frontend-staging-1071497363324.asia-south1.run.app |
| Build args | `NEXT_PUBLIC_SITE_ENV=staging`, `NEXT_PUBLIC_SHOW_PLACEHOLDER_BADGES=true`, `NEXT_PUBLIC_NOINDEX=true`, `NEXT_PUBLIC_SITE_URL=<staging URL>`, `NEXT_PUBLIC_CLINICFLOW_API_URL=https://clinicflow-api-staging-1071497363324.asia-south1.run.app/api/v1`, `NEXT_PUBLIC_CLINICFLOW_CLINIC_SLUG=aishwarya-dental-clinic`, `NEXT_PUBLIC_BOOKING_OTP_HINT=123456`, `NEXT_PUBLIC_PORTAL_BASE_URL=https://clinicflow-frontend-staging-1071497363324.asia-south1.run.app` |
| Build | `gcloud builds submit --project sincere-stock-499113-f1 --region asia-south1 --config cloudbuild.staging.yaml --substitutions _TAG=$(git rev-parse --short HEAD) .` then `gcloud run deploy adc-frontend-staging --project sincere-stock-499113-f1 --region asia-south1 --image <image>:<tag>` |
| Staging API CORS | Add the site origin to `APP_CORS_ALLOWEDORIGINS` of `clinicflow-api-staging` with `--update-env-vars` (keep every existing origin). |

History (staging):

| Date | Commit / image tag | Revision | Notes |
| --- | --- | --- | --- |
| 2026-10-26 | (ClinicFlow API, env only) | `clinicflow-api-staging-00098-556` | `APP_CORS_ALLOWEDORIGINS` += ADC origin, the 7 existing origins kept (rollback `00097-pzn`, the modular-pricing revision). Verified ADC/SPDC/SMSDC allowed, unknown origin 403, no ERROR logs. |
| 2026-10-26 | `7253992` | `adc-frontend-staging-00001-75c` | First deploy (Cloud Build). 13 pages 200, 404 page, noindex header + robots Disallow, `/login` 307 to the staging portal, no ERROR logs. |
| 2026-10-26 | `eba41a6` | `adc-frontend-staging-00002-5sm` | Redesign v2 (violet palette, Sora/Nunito Sans, fixed-height header, her photo). 8 pages 200 + 404; header height constant 73px while scrolling at 360 and 1280. Rollback `00001-75c`. |
