# CLAUDE.md — Aishwarya Dental Clinic and Implant Centre website (ADC)

Public website for **Aishwarya Dental Clinic and Implant Centre**, 4-5-57, beside Sai Baba Road, opp. EMGEE House, Vidyanagar, Guntur 522007 (project code **ADC**, ClinicFlow slug `aishwarya-dental-clinic`), led by **Dr. Aishwarya P, MDS (Periodontics & Implantology), Fellowship in Laser Dentistry**. Built 25 Oct 2026 as a **sales demo**: it shows the doctor how ClinicFlow247 runs her website, booking and post-visit automation. ClinicFlow247 **ENTERPRISE (white-label)**.

**Delivery model: website + core tenant**, copied from the SPDC pattern (`D:\SPDC`). This repo is the public site plus the generated tenant file `tenant/aishwarya.json`. Every role and workflow comes from ClinicFlow core, branded via theme tokens, logo and appTitle. **Never fork core** (`D:\ClinicFlow\CLAUDE.md` forbids per-tenant codebases).

Status (25 Oct 2026): built and checked locally. **Not onboarded, not deployed, no git repo yet.** Open items: `PENDING_ITEMS.md`. Demo flow: `docs/DEMO_SCRIPT.md`.

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
Next.js 14.2 App Router, TypeScript strict, Tailwind, next/font (**Playfair Display** headings + **Manrope** body), zod, vitest, lucide-react. Palette from the logo (`content/brand.json`): steel blue `#2F5878`, graphite `#1B2128`, silver tint `#C7D2DD`, champagne CTA `#DCC08A` (background only, graphite text). `npm run contrast` passes AA. The same colours feed `themeTokens`. Logo master `images/logo.png` (transparent); `npm run brand` derives header mark, favicon, app icons and OG image.

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

## Deployments (none yet)

Same manual pattern as SPDC: build the image locally, push to Artifact Registry, `gcloud run deploy`. Never touch other services, `clinicflow-lb`, certs or DNS.

| Item | Value |
| --- | --- |
| GCP | project `sincere-stock-499113-f1`, region `asia-south1` |
| Image | `asia-south1-docker.pkg.dev/sincere-stock-499113-f1/clinicflow/adc-frontend:<tag>` |
| Staging service | `adc-frontend-staging`: 256Mi, 1 CPU, min-instances 0 (1 only during the meeting window), unauthenticated, port 3000 |
| Expected URL | https://adc-frontend-staging-1071497363324.asia-south1.run.app |
| Build args | `NEXT_PUBLIC_SITE_ENV=staging`, `NEXT_PUBLIC_SHOW_PLACEHOLDER_BADGES=true`, `NEXT_PUBLIC_NOINDEX=true`, `NEXT_PUBLIC_SITE_URL=<staging URL>`, `NEXT_PUBLIC_CLINICFLOW_API_URL=https://clinicflow-api-staging-1071497363324.asia-south1.run.app/api/v1`, `NEXT_PUBLIC_CLINICFLOW_CLINIC_SLUG=aishwarya-dental-clinic`, `NEXT_PUBLIC_BOOKING_OTP_HINT=123456`, `NEXT_PUBLIC_PORTAL_BASE_URL=https://clinicflow-frontend-staging-1071497363324.asia-south1.run.app` |
| Staging API CORS | Add the site origin to `APP_CORS_ALLOWEDORIGINS` of `clinicflow-api-staging` with `--update-env-vars` (keep every existing origin). |
