// lib/feature-flags.ts
// To enable Pro: set NEXT_PUBLIC_PRO_ENABLED=true in Vercel env vars, then redeploy

export const FLAGS = {
  PRO_ENABLED: process.env.NEXT_PUBLIC_PRO_ENABLED === 'true',
}
