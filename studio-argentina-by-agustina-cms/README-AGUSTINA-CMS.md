# Argentina by Agustina CMS

Panel de contenidos construido con Sanity Studio.

## Content types

- `article`
- `city`
- `category`
- `place`
- `event`
- `review`
- `websiteSettings` (singleton)

## Review moderation

Reviews are organized into Pending, Approved and Rejected lists. The public website must query
only documents where `status == "approved"`.

## Local development

```bash
npm install
npm run dev
```

Studio: `http://localhost:3333`

## Production safety

Never place a Sanity write token in `script.js` or any browser-visible file. Public review
submissions must go through a Vercel serverless function with the token stored as an environment
variable.
