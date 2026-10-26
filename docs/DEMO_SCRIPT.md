# Demo script: Dr. Aishwarya, ClinicFlow247 (staging)

**Goal:** show Dr. Aishwarya her own clinic running on ClinicFlow247: website, live booking, and the post-visit automation (thank-you, then Google review request, then one reminder). About 15 minutes. Use your phone for the website part, since that's how her patients will see it.

**Before the meeting (only after onboarding and deploy are approved and done):**
- [ ] Set the website to min-instances 1 about 30 minutes before, so there's no cold start: `gcloud run services update adc-frontend-staging --project sincere-stock-499113-f1 --region asia-south1 --min-instances 1`. **Set it back to 0 afterwards** (command at the end of this page).
- [ ] Open these tabs and sign in as clinic admin. Logins are in `credentials/DEMO_LOGINS.local.md`, never in chat.
- [ ] Check the three demo patients show the right stages (`qa/staging/post-visit-demo.json`, step 6 below).
- [ ] Have the message texts below ready on a second screen. Core has no message-preview screen yet (see "If she asks").

| What | Staging URL |
|---|---|
| Website | https://adc-frontend-staging-1071497363324.asia-south1.run.app |
| Book page | https://adc-frontend-staging-1071497363324.asia-south1.run.app/book |
| Clinic login (branded) | https://clinicflow-frontend-staging-1071497363324.asia-south1.run.app/clinic/aishwarya-dental-clinic/login |
| Public booking page in the portal | https://clinicflow-frontend-staging-1071497363324.asia-south1.run.app/book/aishwarya-dental-clinic |

## 1. Her website (phone), about 3 minutes
Open the website on your phone and hand it to her.
- **Say:** "This is your clinic's website. Your logo, your colours, your treatments. It's written for your patients in Guntur."
- Scroll: hero with **MDS Periodontics & Implantology** and **Laser**, then the **24×7 emergency line** band, then "Where does it hurt?" chips, the treatments (gum care and implants first, her specialty), the gallery with her own clinic photos, and the map.
- Point at a **Draft** badge: "Anything marked Draft is waiting for you to confirm: your registration number, the exact Maps pin, your Google review link, and whether you want the 24×7 emergency line. Nothing on the site is invented; when you confirm, each one is a single change."
- **Ask her** (and note the answers): Does she take emergency calls 24×7? Who answers at night? Phone advice only, or night visits too?

## 2. A patient books a slot, about 2 minutes
On the phone, tap **"Gums bleed or look swollen"** → the booking opens with the concern filled in.
- Pick tomorrow, a free time, enter a demo name and a **90000113xx** mobile, then the OTP **123456** (staging test code).
- **Say:** "That's a real booking in your ClinicFlow, not a contact form. The patient gets a confirmation and a reminder on WhatsApp automatically."
- Show the confirmation screen (add to calendar).

## 3. The booking in her dashboard, about 2 minutes
Laptop, clinic admin: **Appointments / Today's Queue**. The booking just made is there, with the concern as the visit reason.
- **Say:** "Your front desk sees every booking here, from the website, from walk-ins or from the phone."

## 4. The doctor ends the visit, about 2 minutes
Open a visit, then **Start consultation**, then **End consultation** (or as doctor: Rx → *Finalise & end visit*).
- **Say:** "The moment you end the visit, ClinicFlow schedules the follow-up. Nobody has to remember to send anything."

## 5. What the patient receives, about 3 minutes
Show these three messages. **Be honest:** "On staging, WhatsApp is in test mode, so nothing goes to a real phone. This is exactly the text your patients will receive once your WhatsApp templates are live."

| When | Message (WhatsApp template) |
|---|---|
| **2 hours after the visit** (`post_visit_thank_you`) | *Hi Kavya Demo, thank you for visiting Aishwarya Dental Clinic and Implant Centre and choosing Dr. Aishwarya P. We hope you had a good experience. We appreciate your trust in us.* |
| **About 14 hours after the visit** (`review_request`) | *Hi Suresh Demo, we would really appreciate your honest feedback about your experience at Aishwarya Dental Clinic and Implant Centre. Share your experience here: https://…/r/AbC123* |
| **2½ days later, only if the link wasn't tapped** (`review_reminder`) | *Hi Padma Demo, just a gentle reminder in case you didn't get a chance earlier. If you have a moment, we'd really appreciate your honest feedback about your visit to Aishwarya Dental Clinic and Implant Centre: https://…/r/AbC123* |

- **Say:** "Every patient gets the same polite request, with no filtering of happy patients (Google doesn't allow that). The link is tracked: if they tap it, the reminder is cancelled automatically. Never more than one reminder. No medical details ever go in these messages."
- The `/r/` link opens her Google page. On staging it's a stand-in (her Google search panel) until we have her exact "write a review" link.

## 6. The three demo patients, about 2 minutes
Admin, **Patients**: search "Demo".

| Patient | Visit | Where they are in the sequence |
|---|---|---|
| Kavya Demo (9000011301) | just now | Thank-you **scheduled** (goes out 2 h after the visit) |
| Suresh Demo (9000011302) | yesterday | Thank-you sent, **review request sent**, reminder waiting |
| Padma Demo (9000011303) | 3 days ago | Thank-you sent, review request sent, **reminder sent** (or **skipped: link already tapped**) |

Proof that each was sent: the staging API log, Cloud Logging → `clinicflow-api-staging`, search `WhatsApp DRY RUN` and the patient's number. Each line shows the template name and the exact values filled in.

## 7. Dashboard and close, about 1 minute
Admin **Dashboard / Analytics**: bookings, completed visits, no-shows.
- **Close:** the Founding price, setup fee waived on annual, and a start date. "We switch your website and WhatsApp live as soon as you send the items marked Draft."

## If she asks
- **"Can I see the messages per patient in the app?"** A per-visit message timeline and preview screen is being added to ClinicFlow (modular-pricing release). Today we show the text above and the delivery log.
- **"Will patients get messages at night?"** Quiet hours (nothing between 9 PM and 9 AM) are in the plan. Today the review request goes out about 14 hours after the visit ends. Don't promise quiet hours until it's released.
- **"Does it work for walk-ins?"** Yes: front desk adds the walk-in and ends the visit, and the same sequence starts.

## After the meeting
- [ ] `gcloud run services update adc-frontend-staging --project sincere-stock-499113-f1 --region asia-south1 --min-instances 0`
- [ ] Note her answers (emergency line, review link, registration number, email, Maps pin, photos) in `PENDING_ITEMS.md`.
