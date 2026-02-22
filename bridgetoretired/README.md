# BridgeToRetired

A fully functional Next.js 14 website for early retirement bridge planning — with a live interactive calculator, working email capture, MDX blog, and affiliate link tracking.

## Stack

| Layer       | Tech                          | Why                                      |
|-------------|-------------------------------|------------------------------------------|
| Framework   | Next.js 14 (App Router)       | SEO, server components, Vercel-native    |
| Blog / CMS  | Contentlayer + MDX            | Type-safe, file-based, no database needed |
| Email       | Resend                        | Simple API, free tier = 3k emails/mo    |
| Styling     | Tailwind CSS                  | Utility-first, matches design system     |
| Fonts       | Google Fonts via next/font    | Syne + Lora + IBM Plex Mono             |
| Deploy      | Vercel                        | Free, auto-deploys on git push           |

## Project Structure

```
bridgetoretired/
├── app/
│   ├── layout.tsx              # Root layout, fonts, metadata
│   ├── page.tsx                # Home page (assembles all sections)
│   ├── globals.css             # Tailwind + design tokens
│   ├── blog/
│   │   ├── page.tsx            # Blog index page
│   │   └── [slug]/page.tsx     # Individual post page
│   └── api/
│       └── subscribe/route.ts  # Email capture API (Resend)
├── components/
│   ├── Nav.tsx                 # Sticky nav with mobile menu
│   ├── Hero.tsx                # Hero section with planner mockup
│   ├── HowItWorks.tsx          # 4-step explainer + timeline
│   ├── Calculator.tsx          # 🔥 Live interactive bridge calculator
│   ├── AffiliateTools.tsx      # Affiliate cards with click tracking
│   ├── Newsletter.tsx          # Email capture form
│   ├── BlogPreview.tsx         # Homepage blog preview
│   ├── TopicPillars.tsx        # SEO pillar topic grid
│   └── Footer.tsx              # Footer with legal disclosures
├── content/posts/              # Blog posts (write .mdx files here)
│   ├── taxable-brokerage-secret-weapon.mdx
│   └── zero-tax-early-retirement.mdx
├── lib/
│   └── affiliate.ts            # 🔑 PUT YOUR AFFILIATE LINKS HERE
├── contentlayer.config.ts      # Blog schema definition
└── .env.local.example          # Environment variables template
```

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/bridgetoretired
cd bridgetoretired
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
RESEND_API_KEY=re_your_key_here          # resend.com → API Keys
RESEND_FROM_EMAIL=hello@bridgetoretired.com
NOTIFY_EMAIL=you@youremail.com
NEXT_PUBLIC_SITE_URL=https://bridgetoretired.com
```

**Getting a Resend API key:**
1. Sign up at [resend.com](https://resend.com) (free)
2. Add & verify your domain (takes ~5 min with DNS records)
3. Create an API key → paste into `.env.local`

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Adding Your Affiliate Links

Open `lib/affiliate.ts` and replace the placeholder URLs:

```ts
export const AFFILIATE_LINKS: AffiliateLink[] = [
  {
    id: 'empower',
    name: 'Empower',
    url: 'https://YOUR-REAL-EMPOWER-LINK.com',   // ← replace this
    utm: { source: 'bridgetoretired', medium: 'affiliate', campaign: 'empower-tools' },
  },
  // ... etc
]
```

**Recommended affiliate programs for this niche:**
| Program      | Commission        | Apply at                     |
|--------------|-------------------|------------------------------|
| Empower      | ~$100/lead        | impact.com                   |
| Boldin       | $50–150/sale      | boldin.com/affiliates         |
| M1 Finance   | $75–100/account   | m1.com/affiliates             |
| TurboTax     | 15-20% commission | CJ Affiliate                 |
| Betterment   | $75–125/account   | betterment.com/affiliates    |

---

## Writing Blog Posts

Create a new `.mdx` file in `content/posts/`:

```
content/posts/my-new-post.mdx
```

Required frontmatter:

```mdx
---
title: "Your Post Title"
description: "One sentence description for SEO meta tag"
date: 2025-03-01
category: "Tax Strategy"
readTime: "7 min read"
featured: false
---

Your post content here in Markdown...
```

The slug is automatically generated from the filename. A file named `roth-conversion-ladder.mdx` becomes `/blog/roth-conversion-ladder`.

---

## Deploy to Vercel (10 minutes)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Add environment variables in Vercel dashboard (Settings → Environment Variables)
4. Deploy → Vercel gives you a `.vercel.app` URL immediately
5. Add your custom domain in Vercel → Settings → Domains

**Every `git push` to main auto-deploys.** No CI/CD setup needed.

---

## Adding Analytics (recommended)

For affiliate click tracking, add Google Analytics 4 or Plausible to `app/layout.tsx`:

```tsx
// Google Analytics 4
import Script from 'next/script'

// In your layout:
<Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" />
<Script id="ga">
  {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-XXXXXXXXXX')`}
</Script>
```

The `AffiliateTools` component already fires `gtag('event', 'affiliate_click', {...})` on each click — it just needs GA4 loaded to capture them.

---

## SEO Checklist

- [x] Title & meta description on every page
- [x] Open Graph tags for social sharing
- [x] Schema.org WebSite structured data
- [x] Canonical URLs
- [x] Semantic HTML (`h1`, `h2`, `article`)
- [x] `generateStaticParams` for blog posts (static generation)
- [ ] Add `sitemap.xml` — `npm install next-sitemap` and configure
- [ ] Add `robots.txt`
- [ ] Submit to Google Search Console after launch

---

## Legal Pages (Required)

Before going live, create these pages:

- `/privacy` — Privacy Policy (use [Termly](https://termly.io) free generator)  
- `/terms` — Terms of Use
- `/disclosures` — FTC Affiliate Disclosure (required by law)

The footer already links to these pages.

---

## Spreadsheet Download

Place your Excel file at:
```
public/downloads/bridge-planner-v1.xlsx
```

The welcome email already links to `${NEXT_PUBLIC_SITE_URL}/downloads/bridge-planner-v1.xlsx`.
