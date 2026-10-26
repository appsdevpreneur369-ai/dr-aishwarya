# Editing the Aishwarya Dental Clinic website

All site text, colours, hours, phone numbers and image paths live in `/content`; components hold none of them. A bad value (an unknown doctor id, a time like `25:00`, a fake review link) **fails the build and names the file and field**.

After any edit: `npm test && npm run build`. After a colour change: `npm run contrast` and `npm run brand`. After changing clinic, doctor, hours or treatment data: `npm run tenant` (regenerates `tenant/aishwarya.json`). Before publishing new copy: `npm run originality` (no 9-word run may repeat the SPDC, DR-SINDHU or SMSDC sites).

## Approved vs placeholder

Every record has `"status": "approved" | "placeholder"`. With `NEXT_PUBLIC_SHOW_PLACEHOLDER_BADGES=true` (local, staging) placeholders show a **Draft** badge. When the clinic confirms an item, set `approved` and tick it in `PENDING_ITEMS.md`.

## One-edit swaps (waiting for the clinic)

| What arrives | Edit | Then |
| --- | --- | --- |
| **Google review link** | `content/clinic.json` → `googleReview.writeReviewUrl` = `https://search.google.com/local/writereview?placeid=<PLACE_ID>` (Place ID from Google's free Place ID Finder) or `https://g.page/r/<code>/review`; `status` → `approved` | `npm run tenant`. On an onboarded environment run `setup-staging.py` again (step 5 sets it), or Clinic Admin → Settings. Old `/r/` links follow automatically: core resolves the clinic's current link on every click. |
| **Google Maps pin** | `clinic.json` → `maps.shareUrl` (Maps → Share → copy link), `maps.geo` `{lat, lng}`, `status` `approved` | "Approximate" note disappears; JSON-LD gets `GeoCoordinates`. |
| **Clinic email** | `clinic.json` → `email` `{ "status": "approved", "value": "…" }` | Mail buttons and JSON-LD appear; tenant file sends it. |
| **Registration number** | `doctors.json` → `registrationNumber` (State Dental Council number) | `npm run tenant`; update the doctor in ClinicFlow (Admin → Doctors). |
| **24×7 emergency confirmed** | `content/emergency.json` → `availability.status` `approved` (adjust `text` if she offers phone advice only) | Draft badge goes from the home band, footer and emergency page. |
| **Doctor photo** | Add the file to `images/`, add it to `OWN` in `scripts/fetch-photos.mjs`, run `node scripts/fetch-photos.mjs`, add an `images.json` entry with id `doctor-…`, `status: approved`, no `credit`; set `doctors.json` → `photo` | Never a stock photo (the build rejects one). |
| **Years of experience** | `doctors.json` → `experienceYears`, `experienceStatus: approved` | Only from the doctor. |
| **Consultation fee / slot length** | `doctors.json` → `consultSlotMinutes` (15 today) | Fees are never published on the site. |
| **Staff login emails** | `scripts/build-tenant.mjs` → `alias()` / owner + doctor emails | Placeholders are `appsdevpreneur369+adc-…@gmail.com`. |

## Which file do I edit?

| I want to change… | File |
| --- | --- |
| Phone / WhatsApp (+91 70755 65444) | `content/clinic.json` → `phone`, `whatsapp` |
| Address, directions | `clinic.json` → `address`, `maps.wayfinding` |
| Opening hours (Mon–Sat 10–8, Sunday closed) | `clinic.json` → `hours.days` (an empty `sessions` list = closed) |
| Colours / fonts | `content/brand.json` (Playfair Display + Manrope, registered in `src/lib/theme.ts`) |
| Logo | `images/logo.png`, then `npm run brand` (header mark, favicon, app icons, OG image) |
| Photos / gallery | `content/images.json`, `content/gallery.json` (stock captions must say "representative") |
| Doctor profile | `content/doctors.json` |
| Treatments | `content/services.json` (visit counts say "usually"; never prices) |
| Symptom chips | `content/routing.json` |
| Home / About / FAQs / Emergency | `home.json`, `about.json`, `faqs.json`, `emergency.json` |
| Articles | `content/education/<slug>.md` (`reviewStatus: reviewed` after Dr. Aishwarya checks it) |
| Legal pages | `content/legal/*.md` (Draft until `draft: false` after legal review) |
| Page titles / descriptions | `content/pages.json` (title ≤ 60, description 50–170 characters) |
| Menus | `content/navigation.json` |
| Booking popup, consent, messages | `content/booking.json`, see `docs/BOOKING.md` |
| Portal links / subdomain | `content/portal.json` (`aishwarya` proposed, not confirmed) |
