'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface VerifyResult {
  success: boolean
  email: string
  downloadToken: string
  downloadExp: number
  error?: string
}

function XlsDownloadInner() {
  const searchParams = useSearchParams()
  const sessionId    = searchParams.get('session_id')

  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [downloading, setDownloading] = useState(false)

  const verify = useCallback(async () => {
    if (!sessionId) { setState('error'); return }

    try {
      const res  = await fetch(`/api/xls-purchase/verify?session_id=${sessionId}`)
      const data = await res.json()

      if (data.success) {
        setResult(data)
        setState('ready')
      } else {
        setState('error')
      }
    } catch {
      setState('error')
    }
  }, [sessionId])

  useEffect(() => { verify() }, [verify])

  function getDownloadUrl() {
    if (!result || !sessionId) return '#'
    return `/api/xls-download?token=${result.downloadToken}&exp=${result.downloadExp}&session_id=${sessionId}`
  }

  function handleDownload() {
    setDownloading(true)
    // Reset after a moment so they can click again if needed
    setTimeout(() => setDownloading(false), 3000)
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="border-b border-white/[0.06] bg-navy">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="font-mono text-[11px] tracking-widest uppercase text-white/40 hover:text-gold transition-colors">
            ← BridgeToRetired
          </Link>
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold">Pro Excel Planner v3</div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-20">
        <div className="max-w-lg w-full text-center">

          {/* Loading */}
          {state === 'loading' && (
            <>
              <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center mx-auto mb-8 animate-pulse">
                <div className="w-6 h-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
              </div>
              <div className="font-mono text-[11px] tracking-widest uppercase text-white/30">
                Verifying payment...
              </div>
            </>
          )}

          {/* Ready to download */}
          {state === 'ready' && result && (
            <>
              {/* Success icon */}
              <div className="w-20 h-20 rounded-full bg-sage/10 border border-sage/25 flex items-center justify-center mx-auto mb-8">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-3">
                Payment confirmed
              </div>
              <h1 className="font-syne font-bold text-[32px] text-white tracking-tight mb-3">
                Your planner is ready.
              </h1>
              <p className="text-white/45 text-[14px] leading-relaxed mb-2">
                Receipt sent to <span className="text-white/70">{result.email}</span>
              </p>
              <p className="text-white/30 text-[12px] font-mono mb-10">
                Download link expires in 1 hour — save the file to your computer.
              </p>

              {/* Download button */}
              <a
                href={getDownloadUrl()}
                onClick={handleDownload}
                download="Bridge-Planner-Pro-v3.xlsx"
                className="inline-flex items-center gap-3 bg-gold text-black font-syne font-bold text-[15px] tracking-wide px-10 py-4 rounded-xl hover:opacity-90 transition-opacity mb-6"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {downloading ? 'Downloading...' : 'Download Pro Excel Planner v3'}
              </a>

              {/* What's inside */}
              <div className="bg-ink border border-white/[0.07] rounded-2xl p-6 text-left mb-8">
                <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-4">What you just got</div>
                <div className="space-y-2">
                  {[
                    ['INPUTS', 'Single entry point — all 9 sheets update automatically'],
                    ['BRIDGE', 'Year-by-year funding: taxable → Roth → 401k cascade'],
                    ['TAX ESTIMATE', 'Federal tax per bridge year, MFJ/Single switchable'],
                    ['ROTH LADDER', 'Optimal conversions with ACA cliff cross-check'],
                    ['POST-59½', 'Full projection to life expectancy with SS income'],
                    ['MONTE CARLO', '200 randomized sequences — press F9 to re-run'],
                    ['RISK FLAGS', '9 automated checks with color coding'],
                    ['REBALANCE', 'Annual target vs actual with drift alerts'],
                  ].map(([name, desc]) => (
                    <div key={name} className="flex items-start gap-3">
                      <div className="font-mono text-[8px] tracking-widest uppercase text-gold/70 w-24 shrink-0 mt-0.5">{name}</div>
                      <div className="text-white/45 text-[12px] leading-snug">{desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next steps */}
              <div className="bg-ink border border-white/[0.07] rounded-xl p-5 text-left mb-6">
                <div className="font-mono text-[9px] tracking-widest uppercase text-white/30 mb-3">Get started in 3 steps</div>
                {[
                  'Open the file and go to the INPUTS sheet',
                  'Enter your ages, balances, and spending — every sheet updates',
                  'Check MONTE CARLO last — that\'s the number that matters',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3 mb-2 last:mb-0">
                    <div className="w-5 h-5 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="font-mono text-[9px] text-gold font-bold">{i + 1}</span>
                    </div>
                    <span className="text-white/50 text-[12px] leading-snug">{step}</span>
                  </div>
                ))}
              </div>

              {/* Explore online tools */}
              <div className="text-white/25 text-[12px] font-mono">
                Want to run scenarios in the browser?{' '}
                <Link href="/pro/planner" className="text-gold/60 hover:text-gold transition-colors underline underline-offset-2">
                  Try the online planner →
                </Link>
              </div>
            </>
          )}

          {/* Error state */}
          {state === 'error' && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center mx-auto mb-8">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h1 className="font-syne font-bold text-[28px] text-white mb-4">
                Unable to verify payment
              </h1>
              <p className="text-white/45 text-[14px] leading-relaxed mb-8">
                This can happen if the link expired or was already used. If you completed a payment, please contact support and we'll get your file to you within a few hours.
              </p>
              <div className="flex flex-col gap-3 items-center">
                <Link
                  href="/contact?subject=XLS+Download+Issue"
                  className="inline-block bg-gold text-black font-syne font-semibold text-[13px] tracking-wide px-8 py-3 rounded-lg hover:opacity-85 transition-opacity"
                >
                  Contact Support →
                </Link>
                <Link
                  href="/pricing"
                  className="font-mono text-[10px] tracking-widest uppercase text-white/25 hover:text-white/50 transition-colors"
                >
                  ← Back to pricing
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function XlsDownloadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="font-mono text-[11px] tracking-widest uppercase text-white/30 animate-pulse">
          Loading...
        </div>
      </div>
    }>
      <XlsDownloadInner />
    </Suspense>
  )
}