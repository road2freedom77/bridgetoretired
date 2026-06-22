'use client'

import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { ProNav } from '@/components/ProNav'

const GOLD = '#E8B84B'
const SAGE = '#4ADE80'
const TEAL = '#2DD4BF'
const RED  = '#F87171'

interface ActiveScenario {
  id:                  string
  name:                string
  retire_age:          number
  withdrawal_rate:     number | null
  portfolio_at_90:     number | null
  monte_carlo_success: number | null
  risk_flags:          any
  updated_at:          string
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)     return `$${Math.round(n / 1_000)}k`
  return `$${Math.round(n)}`
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7)  return `${days} days ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function ProWelcomePage() {
  const { user, isLoaded } = useUser()

  const displayName = user?.firstName
    || user?.username
    || user?.primaryEmailAddress?.emailAddress?.split('@')[0]
    || null

  const [active,  setActive]  = useState<ActiveScenario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded) return
    const fetchActive = async () => {
      try {
        const res  = await fetch('/api/planner/scenarios')
        const data = await res.json()
        if (data.scenarios) {
          const found = data.scenarios.find((s: any) => s.is_active === true)
          setActive(found ?? null)
        }
      } catch {}
      finally { setLoading(false) }
    }
    fetchActive()
  }, [isLoaded])

  const hasActive = !loading && active !== null
  const wr        = active?.withdrawal_rate
  const at90      = active?.portfolio_at_90
  const mc        = active?.monte_carlo_success
  const source    = active?.risk_flags?._source
  const isPlanner = source !== 'compare'

  const PRO_TOOLS = [
    { icon: '🖥️', title: 'Online Retirement Planner', badge: 'New', badgeColor: 'gold', description: 'Build and save up to 5 retirement plans. Compare ages, run Monte Carlo, and see which scenario survives longest.', href: '/pro/planner', cta: 'Open Planner →', download: false, featured: true },
    { icon: '🛡️', title: 'Bridge Risk Score™', badge: 'Signature Feature', badgeColor: 'gold', description: 'Discover your biggest retirement risk and what to fix first. Every risk factor ranked by severity with a specific fix amount.', href: '/bridge-risk-score', cta: 'Calculate My Score →', download: false, featured: false },
    { icon: '📉', title: 'Sequence-of-Returns Stress Tester', badge: 'Pro', badgeColor: 'gold', description: 'Would your plan survive another 2008? Run your bridge through the dot-com crash, financial crisis, and worst historical sequences.', href: '/sequence-tester', cta: 'Run Stress Test →', download: false, featured: false },
    { icon: '💾', title: 'Scenario Save + Compare', badge: 'Pro', badgeColor: 'gold', description: 'Compare retirement ages side-by-side. See whether retiring at 50, 52, or 55 gives your plan the best chance of lasting to 90.', href: '/scenario-compare', cta: 'Compare Scenarios →', download: false, featured: false },
    { icon: '📊', title: 'Advanced Bridge Calculator', badge: 'Pro', badgeColor: 'gold', description: 'All variables unlocked. Three SS scenarios side-by-side. Full withdrawal order control. Dynamic spending mode.', href: '/advanced-calculator', cta: 'Open Calculator →', download: false, featured: false },
    { icon: '📄', title: 'PDF Report Export', badge: 'Pro', badgeColor: 'gold', description: 'One-click export of your complete retirement plan. Branded, shareable, and CPA-ready.', href: '/pdf-report', cta: 'Generate Report →', download: false, featured: false },
    { icon: '📋', title: 'Pro Excel Planner v3', badge: 'Download', badgeColor: 'sage', description: '9-sheet system: BRIDGE, TAX ESTIMATE, ROTH LADDER, MONTE CARLO, RISK FLAGS, REBALANCE. The offline companion to the online planner.', href: '/downloads/bridge-planner-pro-v3.xlsx', cta: 'Download v3 ↓', download: true, featured: false },
  ]

  const ONBOARDING_STEPS = [
    { step: 1, label: 'Build your first scenario', sub: 'Online Planner', href: '/pro/planner', color: GOLD },
    { step: 2, label: 'Calculate your Bridge Risk Score™', sub: 'Signature feature', href: '/bridge-risk-score', color: TEAL },
    { step: 3, label: 'Run the 2008 crash stress test', sub: 'Stress Tester', href: '/sequence-tester', color: '#A78BFA' },
    { step: 4, label: 'Export your report', sub: 'PDF Export', href: '/pdf-report', color: SAGE },
  ]

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-100" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gold/[0.05] blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-5 py-20">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sage/10 border border-sage/25 mb-8">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-4">Pro Membership Active</div>
          <h1 className="font-syne font-bold text-[clamp(28px,4vw,46px)] tracking-tight text-white leading-tight mb-4">
            {!isLoaded ? (
              <>Your Retirement<br /><span className="text-gold">Command Center.</span></>
            ) : displayName ? (
              <>Welcome back, <span className="text-gold">{displayName}.</span></>
            ) : (
              <>Your Retirement<br /><span className="text-gold">Command Center.</span></>
            )}
          </h1>
          <p className="text-white/50 text-[15px] leading-relaxed max-w-lg mx-auto">
            {hasActive
              ? 'Your active scenario is loaded and ready across all Pro tools.'
              : 'Build scenarios, score your risk, stress-test crashes, and compare retirement dates — everything updates from one plan.'}
          </p>
        </div>

        {/* ── Active Scenario Hero Card ───────────────────────────────────── */}
        {hasActive && active && (
          <div className="bg-ink border border-gold/25 rounded-2xl overflow-hidden mb-8">
            {/* Header row */}
            <div className="bg-gold/8 border-b border-gold/15 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">⭐</span>
                <div>
                  <div className="font-mono text-[8px] tracking-widest uppercase text-gold/70 mb-0.5">Active Scenario</div>
                  <div className="font-syne font-bold text-white text-[20px] leading-tight">{active.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/pro/planner"
                  className="bg-gold text-black font-syne font-semibold text-[11px] tracking-wide px-4 py-2 rounded hover:opacity-85 transition-opacity">
                  Open Planner →
                </Link>
                <Link href="/scenario-compare"
                  className="border border-white/[0.12] text-white/50 font-mono text-[10px] tracking-widest uppercase px-4 py-2 rounded hover:border-white/25 hover:text-white/70 transition-all">
                  Switch →
                </Link>
              </div>
            </div>

            {/* Stats row */}
            <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Stat label="Retire Age" value={`${active.retire_age}`} color="white" />
              {wr !== null && wr !== undefined && (
                <Stat label="Withdrawal Rate" value={`${wr.toFixed(1)}%`} color={wr <= 4 ? SAGE : RED} />
              )}
              {at90 !== null && at90 !== undefined && (
                <Stat label="Portfolio at 90" value={fmt(at90)} color={at90 > 0 ? TEAL : RED} />
              )}
              {mc !== null && mc !== undefined && isPlanner && (
                <Stat label="Monte Carlo" value={`${Math.round(mc)}%`} color={mc >= 80 ? SAGE : RED} />
              )}
              <Stat label="Last Updated" value={timeAgo(active.updated_at)} color="rgba(255,255,255,0.35)" />
            </div>

            {/* Quick actions */}
            <div className="border-t border-white/[0.06] px-6 py-3 flex items-center gap-4 flex-wrap">
              <span className="font-mono text-[9px] tracking-widest uppercase text-white/25">Run with this scenario:</span>
              {[
                { label: 'Risk Score', href: '/bridge-risk-score' },
                { label: 'Stress Test', href: '/sequence-tester' },
                { label: 'PDF Report', href: '/pdf-report' },
                { label: 'Advanced Calc', href: '/advanced-calculator' },
              ].map(a => (
                <Link key={a.label} href={a.href}
                  className="font-mono text-[9px] tracking-widest uppercase text-gold/60 hover:text-gold transition-colors">
                  {a.label} →
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── No active scenario — show onboarding ───────────────────────── */}
        {!hasActive && !loading && (
          <div className="bg-ink border border-gold/20 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-1">Start Here</div>
                <div className="font-syne font-bold text-white text-[18px]">New to Pro? Follow this sequence.</div>
              </div>
              <div className="font-mono text-[10px] text-white/25">Estimated time: 5 minutes</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ONBOARDING_STEPS.map(s => (
                <Link key={s.step} href={s.href}
                  className="group flex items-center gap-4 bg-black/30 rounded-xl px-4 py-3 border border-white/[0.06] hover:border-gold/20 transition-all no-underline">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0"
                    style={{ background: s.color, color: '#0D1420' }}>
                    {s.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-syne font-semibold text-white text-[13px] group-hover:text-gold transition-colors">{s.label}</div>
                    <div className="font-mono text-[10px] text-white/30">{s.sub}</div>
                  </div>
                  <div className="font-mono text-[11px] text-white/20 group-hover:text-gold/60 transition-colors shrink-0">→</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Loading state ───────────────────────────────────────────────── */}
        {loading && (
          <div className="bg-ink border border-white/[0.07] rounded-2xl p-6 mb-8 flex items-center justify-center h-32">
            <div className="font-mono text-[10px] tracking-widest uppercase text-white/20 animate-pulse">Loading your plan...</div>
          </div>
        )}

        {/* ── What's new banner ───────────────────────────────────────────── */}
        <div className="bg-gold/10 border border-gold/20 rounded-xl px-5 py-4 mb-6 flex items-center gap-4">
          <div className="text-2xl shrink-0">🆕</div>
          <div>
            <div className="font-syne font-semibold text-white text-[13px] mb-0.5">
              Online Planner is now live — save scenarios, run Monte Carlo, access from anywhere
            </div>
            <div className="text-white/40 text-[12px]">
              Pro v3 also ships a new 9-sheet Excel system.{' '}
              <Link href="/blog/bridge-planner-pro-v3" className="text-gold/70 hover:text-gold transition-colors underline underline-offset-2">
                See what's new →
              </Link>
              {' · '}
              <Link href="/blog/online-retirement-planner" className="text-gold/70 hover:text-gold transition-colors underline underline-offset-2">
                Why we built the online planner →
              </Link>
            </div>
          </div>
        </div>

        {/* ── Tool grid ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {PRO_TOOLS.map(tool => (
            <div key={tool.title} className="bg-ink rounded-xl p-5 flex items-start gap-4 border border-gold/20" style={{ position: 'relative' }}>
              {tool.featured && (
                <div className="absolute top-0 left-0 right-0 flex justify-center">
                  <div className="font-mono text-[8px] tracking-widest uppercase bg-gold text-black px-3 py-0.5 rounded-b-lg">
                    ⭐ Most Members Start Here
                  </div>
                </div>
              )}
              <div className="text-2xl flex-shrink-0" style={{ marginTop: tool.featured ? 16 : 0 }}>{tool.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-syne font-semibold text-white text-[14px]">{tool.title}</span>
                  <span className={`font-mono text-[7px] tracking-widest uppercase px-2 py-0.5 rounded-full border ${
                    tool.badgeColor === 'gold' ? 'bg-gold/10 text-gold border-gold/20' : 'bg-sage/10 text-sage border-sage/20'
                  }`}>
                    {tool.badge}
                  </span>
                </div>
                <p className="text-white/40 text-[12px] leading-relaxed mb-3">{tool.description}</p>
                {tool.download ? (
                  <a href={tool.href} className="inline-block border border-white/[0.12] text-white/60 font-mono text-[10px] tracking-widest uppercase px-4 py-2 rounded hover:border-white/25 hover:text-white/80 transition-all">
                    {tool.cta}
                  </a>
                ) : (
                  <Link href={tool.href} className="inline-block bg-gold text-black font-syne font-semibold text-[11px] tracking-wide px-4 py-2 rounded hover:opacity-85 transition-opacity">
                    {tool.cta}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Bottom row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-ink border border-white/[0.07] rounded-xl p-5 flex items-start gap-4">
            <div className="text-2xl flex-shrink-0">🧮</div>
            <div className="flex-1">
              <div className="font-syne font-semibold text-white text-[14px] mb-1">All Free Calculators</div>
              <p className="text-white/40 text-[12px] leading-relaxed mb-3">Roth ladder, ACA subsidies, SEPP/72(t), taxable gap, Social Security, and more.</p>
              <Link href="/tools" className="inline-block border border-white/[0.12] text-white/60 font-mono text-[10px] tracking-widest uppercase px-4 py-2 rounded hover:border-white/25 hover:text-white/80 transition-all">
                Browse All Tools →
              </Link>
            </div>
          </div>
          <div className="bg-ink border border-white/[0.07] rounded-xl p-5 flex items-start gap-4">
            <div className="text-2xl flex-shrink-0">✉️</div>
            <div className="flex-1">
              <div className="font-syne font-semibold text-white text-[14px] mb-1">Pro Support</div>
              <p className="text-white/40 text-[12px] leading-relaxed mb-3">Questions about your numbers? Reach out directly — we respond same day.</p>
              <Link href="/contact?subject=Pro+Support" className="inline-block border border-white/[0.12] text-white/60 font-mono text-[10px] tracking-widest uppercase px-4 py-2 rounded hover:border-white/25 hover:text-white/80 transition-all">
                Contact Support →
              </Link>
            </div>
          </div>
        </div>

        {/* ── Manage subscription ─────────────────────────────────────────── */}
        <div className="bg-ink border border-white/[0.06] rounded-xl p-5 mb-8">
          <div className="font-mono text-[9px] tracking-widest uppercase text-white/25 mb-2">Manage Subscription</div>
          <p className="text-white/35 text-[12px] leading-relaxed mb-3">Need to cancel, pause, or update your billing? Send us a message and we'll handle it same day.</p>
          <Link href="/contact?subject=Manage+Subscription" className="inline-block border border-white/[0.12] text-white/60 font-mono text-[10px] tracking-widest uppercase px-4 py-2 rounded hover:border-white/25 hover:text-white/80 transition-all">
            Manage Subscription →
          </Link>
        </div>
      </div>

      <ProNav />
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div className="font-mono text-[8px] tracking-widest uppercase text-white/25 mb-1">{label}</div>
      <div className="font-syne font-bold text-[18px]" style={{ color }}>{value}</div>
    </div>
  )
}