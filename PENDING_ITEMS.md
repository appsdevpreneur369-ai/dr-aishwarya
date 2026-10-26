# Pending items: Aishwarya Dental Clinic and Implant Centre (ADC)

Updated 25 Oct 2026. Swap steps for every clinic item: `docs/EDITING.md` → "One-edit swaps".

## From the clinic (shown as Draft / placeholder until received)
- [ ] **Google "write a review" link**: Place ID via Google's Place ID Finder → `clinic.json` `googleReview.writeReviewUrl`. Until then the tenant file sends `googleReviewLink: null` (core creates **no** review rows); staging demo uses the Google search panel stand-in (`--demo-review-link`).
- [ ] **24×7 emergency line**: Dr. Aishwarya to confirm (who answers at night; phone advice only or night visits). `emergency.json` `availability`.
- [ ] Google Maps place link + pin (`clinic.json` `maps`): map and directions are approximate (address search).
- [ ] Clinic email.
- [ ] Dr. Aishwarya: State Dental Council registration number (tenant sends `PENDING-VERIFICATION-AISHWARYA`), photo, years of experience, consultation fee, slot length (15 min assumed), her own consultation hours (clinic hours assumed).
- [ ] Confirm the placeholder treatment categories: check-ups, cleaning, extractions/minor oral surgery, crowns/bridges/dentures. Signboard "Cosmetology": cosmetic dentistry only for now; ask whether she offers facial aesthetics.
- [ ] Staff: real admin/front-desk name and login emails (placeholders `appsdevpreneur369+adc-…@gmail.com`).
- [ ] Portal subdomain (`aishwarya.clinicflow247.com` proposed) and whether she buys a domain.
- [ ] Social media links; more clinic photos (all four supplied photos are ≤ 680 px wide: higher-resolution originals would sharpen the hero).
- [ ] Legal drafts reviewed (privacy, terms, disclaimer, cookies); grievance officer name.
- [ ] Article review by Dr. Aishwarya (`reviewStatus: pending` on all four).

## Needs the owner's yes (not done)
- [ ] Staging onboarding (`scripts/staging/setup-staging.py --demo-review-link`). Check first that no other session is deploying core to staging.
- [x] Add the site origin to staging API CORS (26 Oct, `clinicflow-api-staging-00098-556`).
- [x] Deploy `adc-frontend-staging` (26 Oct, `00001-75c`, 256Mi, min 0). Set min 1 during the meeting window, then back to 0.
- [ ] Post-visit demo data (`scripts/staging/seed-post-visit-demo.py` + the two SQL files it writes, run on the staging DB).
- [ ] Booking e2e against staging after onboarding.
- [x] GitHub: https://github.com/appsdevpreneur369-ai/dr-aishwarya (26 Oct).

## Core (ClinicFlow), reported, not patched here
- [ ] **No per-visit message preview / timeline screen** for the clinic admin. `GET /notifications/appointment/{id}/logs` exists (type, channel, status) but returns no message text and no screen uses it; the `[DRY RUN]` text is only in the API log. Being added in the modular-pricing session (Review Booster S5).
- [ ] **No quiet hours** for review messages: the request is due completion + 2 h + 12 h (a 10 AM visit → request around midnight). Spec (Review Booster W4) says next day 10 AM, nothing 9 PM–9 AM.
- [ ] **Messages use the full clinic name** (42 characters: "Aishwarya Dental Clinic and Implant Centre"). Spec W0/W9 has a "name shown in messages" (≤ 40) setting; not in core yet.
- [ ] **Importer (`onboard_tenant.py`) does not send `googleReviewLink`**: our setup script sets it with `PUT /clinics/{id}` (step 5).
- [ ] Importer takes the super-admin password as a command-line argument (briefly visible in the process list).
- [ ] `POST /appointments/quick-visit` is on staging since `clinicflow-api-staging-00097-pzn` (modular pricing, 25 Oct). The demo seed falls back to walk-in token + start + complete.
