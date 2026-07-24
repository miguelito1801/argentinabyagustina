# Argentina by Agustina 1.1 GOLD — Audit report

## Corrected before delivery
- Removed fictional fallback testimonials and articles. Empty CMS collections now show honest empty states.
- Added loading skeletons and friendly API error states.
- Preserved review moderation: only `approved` and published reviews are public.
- Added URL protocol validation for external links received from the CMS.
- Improved modal accessibility, keyboard focus and reduced-motion support.
- Hardened the review API: input size limit, malformed JSON handling, consent validation, honeypot and minimum completion time.
- Added additional production security headers.
- Corrected static asset caching so new deployments are not trapped behind a one-year immutable cache.
- Kept local detail-page links compatible with Live Server and clean production routes on Vercel.

## Required production configuration
- Vercel environment variable: `SANITY_WRITE_TOKEN`.
- Sanity CORS origins: production domain and approved local development origins.
- Web3Forms access key must remain active for contact and newsletter delivery.

## Content policy
Only real reviews approved by Agustina should be published. Empty sections are preferable to invented content.
