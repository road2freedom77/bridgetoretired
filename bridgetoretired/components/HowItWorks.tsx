// components/HowItWorks.tsx
import React from 'react'

const steps = [
  {
    n: '01',
    title: 'Enter Your Numbers',
    desc: 'Input current balances across taxable, 401(k), and Roth accounts, plus your planned retirement age and annual spending need.',
  },
  {
    n: '02',
    title: 'The Planner Maps Your Bridge',
    desc: 'Automatically calculates the optimal withdrawal order (Taxable → 401k → Roth) year-by-year, showing exactly when each account is tapped.',
  },
  {
    n: '03',
    title: 'See Your Full Projection',
    desc: 'From retirement through Social Security claim age to life expectancy — a complete inflation-adjusted picture of your financial future.',
  },
  {
    n: '04',
    title: 'Stress Test & Optimize',
    desc: 'Adjust return rates, spending, and Roth conversion strategies to find your optimal path to financial freedom.',
  },
]

const timeline = [
  { icon: '🏠', age: 'Age 48 — Today',            desc: 'Building the bridge. Maxing accounts.',           tag: '4 years to go',    tagColor: 'gold' },
  { icon: '🎯', age: 'Age 52 — Retire Early',      desc: '$860k total portfolio. Bridge begins.',           tag: 'Retire Year 2030', tagColor: 'gold' },
  { icon: '📊', age: 'Age 52–59½ — Bridge Years',  desc: 'Drawing from taxable only. 401k grows untouched.', tag: '$40k/yr withdrawal', tagColor: 'teal' },
  { icon: '🔓', age: 'Age 59½ — 401k Unlocks',     desc: 'Penalty-free access to tax-deferred funds.',      tag: 'Bridge End',        tagColor: 'sage' },
  { icon: '💰', age: 'Age 67 — Social Security',   desc: 'Full benefits claimed. Portfolio pressure eases.', tag: 'Max Benefit',        tagColor: 'sage' },
]

export function HowItWorks() {
  return (
    <section id="how" className="py-24 px-5 bg-navy relative overflow-hidden">
      <div className="absolute right-[-200px] top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold/[0.03] blur-[120px] pointer-events-none" />
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">

        <div>
          <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.24em] uppercase text-gold mb-5">
            <span className="block w-6 h-px bg-gold" />
            How It Works
          </div>
          <h2 className="font-syne font-bold text-[clamp(28px,3.5vw,44px)] tracking-tight text-white mb-4">
            The Bridge Strategy,<br />Explained
          </h2>
          <p className="text-white/55 text-[15px] leading-relaxed mb-12 max-w-md">
            Retiring before 59½ means you can&apos;t touch your 401(k) without a 10% penalty.
            The bridge strategy uses your taxable accounts to cover the gap — strategically and tax-efficiently.
          </p>

          <div className="divide-y divide-white/[0.05]">
            {steps.map(s => (
              <div key={s.n} className="grid grid-cols-[56px_1fr] gap-5 py-7">
                <div className="font-syne font-extrabold text-[38px] text-gold/[0.14] leading-none tracking-tight pt-1">
                  {s.n}
                </div>
                <div>
                  <div className="font-syne font-semibold text-[15px] tracking-tight text-white mb-2">
                    {s.title}
                  </div>
                  <div className="text-[13px] text-white/50 leading-[1.75]">
                    {s.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-ink border border-white/[0.07] rounded-xl p-7">
          <div className="font-mono text-[10px] tracking-widest uppercase text-white/30 mb-6">
            Example: Retire at 52 → SS at 67
          </div>
          <div className="space-y-5">
            {timeline.map((t, i) => (
              <div key={i} className="flex items-start gap-4 relative">
                {i < timeline.length - 1 && (
                  <div className="absolute left-[15px] top-[30px] bottom-[-20px] w-px bg-gradient-to-b from-white/[0.07] to-transparent" />
                )}
                <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center text-[12px] shrink-0 border ${
                  i <= 1 ? 'bg-gold/10 border-gold/25' : 'bg-slate border-white/[0.07]'
                }`}>
                  {t.icon}
                </div>
                <div>
                  <div className="font-syne font-semibold text-[13px] text-white mb-1">{t.age}</div>
                  <div className="font-mono text-[10px] text-white/35 mb-2 leading-relaxed">{t.desc}</div>
                  <span className={`inline-block font-mono text-[9px] tracking-wide px-2 py-0.5 rounded border ${
                    t.tagColor === 'gold' ? 'text-gold bg-gold/10 border-gold/25' :
                    t.tagColor === 'teal' ? 'text-teal bg-teal/10 border-teal/25' :
                                            'text-sage bg-sage/10 border-sage/25'
                  }`}>
                    {t.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
