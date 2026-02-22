import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center bg-grid overflow-hidden">
      {/* Glow blobs */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-gold/[0.06] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[20%] w-[400px] h-[400px] rounded-full bg-teal/[0.04] blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 py-20 grid md:grid-cols-2 gap-16 items-center w-full">

        {/* Content */}
        <div>
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/25 rounded px-3 py-1.5 font-mono text-[10px] tracking-widest uppercase text-gold mb-7">
            <span className="text-[8px]">◆</span>
            Early Retirement · FIRE Strategy
          </div>

          <h1 className="font-syne font-extrabold text-[clamp(42px,5.5vw,72px)] leading-[1.0] tracking-tight text-white mb-6">
            Retire Early.<br />
            Bridge the{' '}
            <em className="font-lora font-normal text-gold not-italic italic">Gap.</em>
            <br />
            Live Free.
          </h1>

          <p className="text-[15px] text-white/60 leading-[1.85] mb-10 max-w-[460px]">
            Most FIRE calculators stop at "do you have enough?" We go further — showing you
            exactly how to fund the years between retirement and 59½ without tax penalties
            or guesswork.
          </p>

          <div className="flex flex-wrap gap-4 items-center mb-12">
            <Link
              href="/#download"
              className="font-syne font-semibold text-[13px] bg-gold text-black px-6 py-3.5 rounded hover:opacity-85 transition-opacity active:scale-95"
            >
              Download Free Planner
            </Link>
            <Link
              href="/#calculator"
              className="font-mono text-[11px] tracking-widest uppercase text-white/50 hover:text-white transition-colors flex items-center gap-2 group"
            >
              Try Calculator
              <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
            </Link>
          </div>

          <div className="flex gap-8 pt-7 border-t border-white/[0.07]">
            {[
              { val: '4–12', unit: '', label: 'Bridge Years Planned' },
              { val: '3',    unit: '', label: 'Account Types Modeled' },
              { val: '$0',   unit: '', label: 'Cost to Download'      },
            ].map(({ val, label }) => (
              <div key={label}>
                <div className="font-syne font-bold text-[26px] text-white leading-none mb-1">
                  {val}
                </div>
                <div className="font-mono text-[10px] tracking-widest uppercase text-white/35">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Planner mockup */}
        <div className="hidden md:block">
          <div className="bg-ink border border-white/[0.07] rounded-xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6),0_0_80px_rgba(232,184,75,0.04)]">
            {/* Title bar */}
            <div className="bg-slate px-4 py-3 flex items-center gap-3 border-b border-white/[0.06]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c941]" />
              </div>
              <span className="font-mono text-[11px] text-white/30 tracking-wide">
                Early_Retirement_Bridge_Planner_v1.xlsx
              </span>
            </div>

            {/* Tabs */}
            <div className="flex bg-navy border-b border-white/[0.06]">
              {['INPUTS', 'BRIDGE YEARS', 'PROJECTION'].map((t, i) => (
                <div
                  key={t}
                  className={`font-mono text-[10px] tracking-wider px-4 py-2 border-r border-white/[0.06] cursor-default ${
                    i === 0 ? 'bg-ink text-gold border-b-2 border-b-gold' : 'text-white/30'
                  }`}
                >
                  {t}
                </div>
              ))}
            </div>

            {/* Body */}
            <div className="p-5">
              <div className="font-mono text-[9px] tracking-[0.18em] uppercase text-gold mb-3">
                Timeline
              </div>
              {[
                { label: 'Current Age',      val: '48',    gold: true  },
                { label: 'Retirement Age',   val: '52',    gold: true  },
                { label: 'SS Claim Age',     val: '67',    gold: false },
                { label: 'Life Expectancy',  val: '90',    gold: false },
              ].map(({ label, val, gold }) => (
                <div key={label} className="flex justify-between items-center px-2.5 py-1.5 rounded hover:bg-white/[0.02] mb-1">
                  <span className="font-mono text-[11px] text-white/55">{label}</span>
                  <span className={`font-mono text-[11px] px-2.5 py-0.5 rounded border min-w-[72px] text-right ${
                    gold
                      ? 'text-gold bg-gold/10 border-gold/25'
                      : 'text-white bg-white/[0.04] border-white/[0.08]'
                  }`}>
                    {val}
                  </span>
                </div>
              ))}

              <div className="font-mono text-[9px] tracking-[0.18em] uppercase text-gold mb-3 mt-5">
                Account Balances
              </div>
              {[
                { label: 'Taxable Brokerage', val: '$120,000' },
                { label: 'Traditional 401(k)', val: '$650,000' },
                { label: 'Roth IRA',           val: '$90,000'  },
                { label: 'Annual Spending',     val: '$40,000', green: true },
              ].map(({ label, val, green }) => (
                <div key={label} className="flex justify-between items-center px-2.5 py-1.5 rounded hover:bg-white/[0.02] mb-1">
                  <span className="font-mono text-[11px] text-white/55">{label}</span>
                  <span className={`font-mono text-[11px] px-2.5 py-0.5 rounded border min-w-[90px] text-right ${
                    green
                      ? 'text-sage bg-sage/[0.08] border-sage/20'
                      : 'text-white bg-white/[0.04] border-white/[0.08]'
                  }`}>
                    {val}
                  </span>
                </div>
              ))}

              {/* Mini chart */}
              <div className="mt-4 p-3.5 bg-navy rounded-md border border-white/[0.06]">
                <div className="font-mono text-[9px] tracking-widest uppercase text-white/30 mb-3">
                  Portfolio at Retirement
                </div>
                <div className="flex items-end gap-1 h-14">
                  {[40, 35, 80, 90, 100, 28, 25].map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-sm ${
                        i < 2 ? 'bg-gradient-to-t from-gold/60 to-gold' :
                        i < 5 ? 'bg-gradient-to-t from-teal/60 to-teal' :
                                'bg-gradient-to-t from-sage/60 to-sage'
                      }`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <div className="flex gap-4 mt-2.5">
                  {[['gold', 'Taxable'], ['teal', '401(k)'], ['sage', 'Roth']].map(([c, l]) => (
                    <div key={l} className="flex items-center gap-1.5 font-mono text-[8.5px] text-white/35">
                      <div className={`w-2 h-2 rounded-[2px] bg-${c}`} />
                      {l}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
