// Google reviews for the site: live from the Google Places API (New) when configured, else the hand-copied values in
// content/clinic.json → google. Server-only: the API key never reaches the browser.
//   GOOGLE_PLACES_API_KEY  server env (Cloud Run env / secret), never NEXT_PUBLIC_*
//   placeId                content/clinic.json → google.placeId (or GOOGLE_PLACE_ID env)
// Fetched at most once a day (Next.js data cache). Any API problem falls back to the content values silently.
// Places API terms: show the reviewer's name and the relative time as Google gives them, and attribute Google.
import 'server-only';
import { siteClinic } from './content';

export type GoogleReview = { author: string; rating: number; text: string; when: string; authorUrl?: string };
export type GoogleReviews = { rating: number | null; count: number; url: string; reviews: GoogleReview[]; live: boolean; checkedOn: string };

type PlacesResponse = {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: { rating?: number; relativePublishTimeDescription?: string; text?: { text?: string }; authorAttribution?: { displayName?: string; uri?: string } }[];
};

export async function getGoogleReviews(): Promise<GoogleReviews | null> {
  const g = siteClinic.google;
  if (!g) return null;
  const fallback: GoogleReviews = { rating: g.rating, count: g.reviewCount, url: g.url, reviews: g.reviews, live: false, checkedOn: g.checkedOn };
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID || g.placeId;
  if (!key || !placeId) return fallback;
  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=en`, {
      headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'rating,userRatingCount,googleMapsUri,reviews' },
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return fallback;
    const p = (await res.json()) as PlacesResponse;
    const reviews = (p.reviews ?? [])
      .filter((r) => r.text?.text && r.authorAttribution?.displayName && r.rating)
      .map((r) => ({ author: r.authorAttribution!.displayName!, rating: r.rating!, text: r.text!.text!, when: r.relativePublishTimeDescription ?? '', authorUrl: r.authorAttribution?.uri }));
    return {
      rating: p.rating ?? g.rating,
      count: p.userRatingCount ?? g.reviewCount,
      url: p.googleMapsUri ?? g.url,
      reviews: reviews.length ? reviews : g.reviews,
      live: true,
      checkedOn: new Date().toISOString().slice(0, 10),
    };
  } catch {
    return fallback;
  }
}
