'use client'

import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'

const COLORS = {
  gold: '#E8B84B', teal: '#2DD4BF', sage: '#4ADE80',
  red: '#F87171', purple: '#A78BFA', orange: '#FB923C',
  dark: '#0D1420', ink: '#141C28', navy: '#0F1A2E',
}

const JOURNEY = [
  {
    step: 1,
    title: 'Find your retirement age',
    desc: 'Start here. See when you can realistically retire based on your current savings rate.',
    href: '/tools/early-retirement-age-calculator',
    color: COLORS.teal,
    icon: '🎯',
  },
  {
    step: 2,
    title: 'Check your bridge health',
    desc: 'Score your plan 0–100. See your biggest weakness and what to fix first.',
    href: '/tools/bridge-health-check',
    color: COLORS.gold,
    icon: '🌉',
  },
  {
    step: 3,
    title: 'Optimize your withdrawals',
    desc: 'Learn the exact account order to minimize taxes and maximize lifetime wealth.',
    href: '/tools/withdrawal-order-optimizer',
    color: COLORS.purple,
    icon: '📊',
  },
  {
    step: 4,
    title: 'Model your Roth ladder',
    desc: 'Build a tax-free bridge from 401k conversions. See every rung unlock.',
    href: '/tools/roth-conversion-ladder-calculator',
    color: COLORS.sage,
    icon: '🪜',
  },
]

const FEATURED_TOOLS = [
  {
    href: '/tools/early-retirement-age-calculator',
    icon: '🎯',
    title: 'Early Retirement Age Calculator',
    desc: 'When could you realistically retire?',
    tag: 'Start here',
    tagColor: COLORS.teal,
  },
  {
    href: '/tools/bridge-health-check',
    icon: '🌉',
    title: 'Bridge Health Check',
    desc: 'See where your plan is strongest and weakest.',
    tag: 'Most popular',
    tagColor: COLORS.gold,
  },
  {
    href: '/tools/withdrawal-order-optimizer',
    icon: '📊',
    title: 'Withdrawal Order Optimizer',
    desc: 'Reduce taxes and make your money last longer.',
    tag: null,
    tagColor: null,
  },
  {
    href: '/tools/fire-number-calculator',
    icon: '🔢',
    title: 'FIRE Number Calculator',
    desc: 'Your real number — bridge years, healthcare, SS included.',
    tag: null,
    tagColor: null,
  },
  {
    href: '/tools/coast-fire-calculator',
    icon: '🏄',
    title: 'CoastFIRE Calculator',
    desc: 'Can you stop saving today and still retire on time?',
    tag: null,
    tagColor: null,
  },
  {
    href: '/tools/retirement-readiness-score',
    icon: '📋',
    title: 'Retirement Readiness Score',
    desc: 'One score across 5 dimensions. See exactly what to fix.',
    tag: 'New',
    tagColor: COLORS.purple,
  },
]

const ALL_TOOLS = [
  { href: '/tools/taxable-brokerage-gap-calculator', label: 'Taxable Brokerage Gap' },
  { href: '/tools/roth-conversion-ladder-calculator', label: 'Roth Conversion Ladder' },
  { href: '/tools/72t-sepp-calculator', label: '72t SEPP Calculator' },
  { href: '/tools/72t-vs-roth-ladder', label: '72t vs Roth Ladder' },
  { href: '/tools/aca-subsidy-estimator', label: 'ACA Subsidy Estimator' },
  { href: '/tools/social-security-calculator', label: 'Social Security Calculator' },
  { href: '/tools/bridge-strategy-calculator', label: 'Bridge Strategy Calculator' },
  { href: '/tools/sequence-of-returns-simulator', label: 'Sequence of Returns' },
]

const PRO_FEATURES = [
  { icon: '🖥️', label: 'Online Retirement Planner', desc: 'Save up to 5 scenarios' },
  { icon: '🛡️', label: 'Bridge Risk Score™', desc: 'Signature feature — grade your plan in 60s' },
  { icon: '📉', label: 'Sequence-of-Returns Stress Tester', desc: '2000, 2008, worst-case crashes' },
  { icon: '📄', label: 'PDF Report Export', desc: 'CPA-ready, shareable' },
]

export default function FreeHome() {
  const { user } = useUser()
  const firstName = user?.firstName || null
  const [recentTools, setRecentTools] = useState<string[]>([])

  // Read recently visited tools from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('btr_recent_tools')
      if (stored) setRecentTools(JSON.parse(stored))
    } catch {}
  }, [])

  return (
    <div className="min-h-screen bg-black" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>

      {/* Welcome hero */}
      <div style={{ background: COLORS.navy, borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '48px 24px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: COLORS.gold, marginBottom: 12 }}>
            BridgeToRetired
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 700, color: '#fff', marginBottom: 12, lineHeight: 1.2 }}>
            {firstName ? `Welcome, ${firstName}.` : 'Welcome to BridgeToRetired.'}
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', maxWidth: 520, lineHeight: 1.7, marginBottom: 24 }}>
            Start with a calculator below, follow the recommended path, or explore the full tool suite. No data is saved yet — everything runs in your browser.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' as const }}>
            <Link href="/tools/early-retirement-age-calculator"
              style={{ background: COLORS.gold, color: COLORS.dark, fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 13, padding: '10px 22px', borderRadius: 8, textDecoration: 'none' }}>
              Find My Retirement Age →
            </Link>
            <Link href="/pricing"
              style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', fontSize: 11, padding: '10px 18px', borderRadius: 8, textDecoration: 'none', letterSpacing: 1, textTransform: 'uppercase' as const }}>
              Explore Pro
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>

        {/* Recently used — only if localStorage has data */}
        {recentTools.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 14 }}>Recently Used</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
              {recentTools.slice(0, 4).map(href => {
                const tool = [...FEATURED_TOOLS, ...ALL_TOOLS.map(t => ({ href: t.href, title: t.label, icon: '🧮', desc: '', tag: null, tagColor: null }))].find(t => t.href === href)
                if (!tool) return null
                return (
                  <Link key={href} href={href}
                    style={{ fontSize: 10, color: COLORS.teal, border: `1px solid ${COLORS.teal}30`, padding: '6px 14px', borderRadius: 6, textDecoration: 'none', background: 'rgba(45,212,191,0.05)' }}>
                    {'icon' in tool ? tool.icon : '🧮'} {'title' in tool ? tool.title : tool.label} →
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Recommended Path */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 6 }}>Recommended Path</div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 6 }}>New to early retirement?</div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 24, lineHeight: 1.6 }}>Follow this sequence to go from zero to a complete bridge plan.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {JOURNEY.map((j, i) => (
              <Link key={j.step} href={j.href} style={{ textDecoration: 'none' }}>
                <div style={{ background: COLORS.ink, borderRadius: 12, padding: '16px', border: `1px solid ${j.color}20`, borderTop: `3px solid ${j.color}`, height: '100%', transition: 'border-color 0.15s', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: j.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: COLORS.dark, flexShrink: 0 }}>{j.step}</div>
                    <span style={{ fontSize: 16 }}>{j.icon}</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 6, lineHeight: 1.3 }}>{j.title}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>{j.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Tools */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 6 }}>Featured Calculators</div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Free tools — no account required</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
            {FEATURED_TOOLS.map(tool => (
              <Link key={tool.href} href={tool.href} style={{ textDecoration: 'none' }}>
                <div style={{ background: COLORS.ink, borderRadius: 12, padding: '16px 18px', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{tool.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' as const }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{tool.title}</span>
                      {tool.tag && (
                        <span style={{ fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', color: tool.tagColor!, border: `1px solid ${tool.tagColor}40`, padding: '1px 6px', borderRadius: 4 }}>{tool.tag}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{tool.desc}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* All Tools */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 14 }}>All Tools</div>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
            {ALL_TOOLS.map(t => (
              <Link key={t.href} href={t.href}
                style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: 6, textDecoration: 'none', background: COLORS.ink }}>
                {t.label} →
              </Link>
            ))}
          </div>
        </div>

        {/* Pro preview */}
        <div style={{ background: 'linear-gradient(135deg, rgba(232,184,75,0.08) 0%, rgba(232,184,75,0.02) 100%)', border: '1px solid rgba(232,184,75,0.2)', borderRadius: 16, padding: '28px 28px' }}>
          <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: COLORS.gold, marginBottom: 8 }}>BridgeToRetired Pro — $9/mo</div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Ready to go deeper?</div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 20, lineHeight: 1.7, maxWidth: 480 }}>
            Free tools show the math. Pro tells you whether your plan survives market crashes, inflation, and 40 years of withdrawals.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 20 }}>
            {PRO_FEATURES.map(({ icon, label, desc }) => (
              <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 600, marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <Link href="/pricing"
            style={{ background: COLORS.gold, color: COLORS.dark, fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 13, padding: '11px 26px', borderRadius: 8, textDecoration: 'none', display: 'inline-block' }}>
            Explore Pro — $9/mo →
          </Link>
        </div>
      </div>
    </div>
  )
}