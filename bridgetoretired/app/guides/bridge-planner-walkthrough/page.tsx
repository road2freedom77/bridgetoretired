import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How to Use the Bridge Planner — Step-by-Step Walkthrough | BridgeToRetired',
  description: 'Step-by-step guide to using the free Bridge Planner spreadsheet. Learn how to enter your numbers, read the DASHBOARD, interpret RISK FLAGS, and understand what each sheet tells you.',
  alternates: { canonical: 'https://bridgetoretired.com/guides/bridge-planner-walkthrough' },
}

const steps = [
  {
    num: 1,
    sheet: 'START HERE',
    icon: '🗺️',
    title: 'Open the planner and read the sheet guide',
    body: 'When you open the file, go to the START HERE tab first. It lists every sheet, what it does, and the order to use them. The planner has six sheets in the free version: DASHBOARD, INPUTS, BRIDGE YEARS, POST-59½, PROJECTION, and RISK FLAGS. Everything pulls automatically from INPUTS — you only ever type in one place.',
  },
  {
    num: 2,
    sheet: 'INPUTS',
    icon: '📋',
    title: 'Enter your numbers in INPUTS',
    body: 'INPUTS is the only sheet you edit. Blue cells are yours to change — everything else is a formula. Enter your current age, planned retirement age, life expectancy, and Social Security claiming age. Then enter your three account balances: Taxable Brokerage, Traditional 401(k)/IRA, and Roth IRA. Finally enter your annual spending, expected return, and inflation rate. Change any of these and every other sheet updates instantly.',
  },
  {
    num: 3,
    sheet: 'DASHBOARD',
    icon: '🌉',
    title: 'Check the DASHBOARD for your instant health check',
    body: 'After entering your numbers, go to DASHBOARD. The four KPI cards at the top show your total portfolio, bridge years, annual spending, and target retire year at a glance. Below that, six RISK FLAGS update automatically — green means OK, yellow means review, red means the plan has a problem. Read these before looking at anything else.',
  },
  {
    num: 4,
    sheet: 'BRIDGE YEARS',
    icon: '🌉',
    title: 'Read the BRIDGE YEARS sheet year by year',
    body: 'BRIDGE YEARS shows the gap from your retirement date to age 59½ — the hardest years to fund. Each row is one year: your age, starting balance, how much you withdraw, which account it comes from, and the ending balance. The planner draws from taxable first, then Roth, then 401(k) — in that order. Watch for the year your taxable account hits zero. If that happens before 59½ and the Roth is also thin, you have a bridge gap.',
  },
  {
    num: 5,
    sheet: 'POST-59½',
    icon: '📈',
    title: 'Check the POST-59½ sheet for the second phase',
    body: 'Once you pass 59½, all retirement accounts become accessible without penalty. POST-59½ shows the 401(k)-first drawdown from that point through life expectancy. Look for when Social Security income starts — it reduces the annual withdrawal needed from your portfolio significantly. Watch the total portfolio column and make sure it stays positive through your life expectancy.',
  },
  {
    num: 6,
    sheet: 'PROJECTION',
    icon: '📊',
    title: 'Use PROJECTION for the full lifetime view',
    body: 'PROJECTION combines both phases into one continuous view from retirement to life expectancy. It shows the full arc of your plan: bridge years, the 59½ unlock, Social Security start, and final balance. If the total portfolio column goes to zero before your life expectancy, the plan needs adjustment.',
  },
  {
    num: 7,
    sheet: 'RISK FLAGS',
    icon: '⚠️',
    title: 'Act on the RISK FLAGS',
    body: 'RISK FLAGS runs six automatic checks. Each one either passes or raises a flag. Read each flag, understand what it means, then go back to INPUTS and try adjusting one variable at a time — lower spending, higher return, different SS claiming age — and watch the flags update. This is where the planner earns its keep.',
  },
]

const flags = [
  {
    flag: 'Bridge fully funded by taxable?',
    green: 'Taxable account covers all bridge years to 59½ without touching 401(k)',
    yellow: 'Gap detected — taxable runs short before 59½',
    fix: 'Increase taxable balance in INPUTS, add Other Income, or lower spending until the flag clears',
  },
  {
    flag: 'Portfolio survives to life expectancy?',
    green: 'Total portfolio remains positive through your planning age',
    red: 'Portfolio depletes before life expectancy at current spending and return assumptions',
    fix: 'Reduce spending, increase return assumption, or delay retirement age until the flag clears',
  },
  {
    flag: 'Withdrawal rate at or below 4%?',
    green: 'Annual spending divided by total portfolio is 4% or less',
    yellow: 'Rate exceeds 4% — higher long-term failure risk especially with a 35-40 year horizon',
    fix: 'The 4% rule was built for 30-year retirements. At 50, 3.3% is safer. Reduce spending or increase portfolio until you reach that threshold',
  },
  {
    flag: 'Roth ladder opportunity?',
    green: 'No action needed',
    yellow: 'Low-income bridge years available for Roth conversions — tax-efficient window detected',
    fix: 'The Pro version models the exact conversion amounts. In the free version, note which years have low income and consider running conversions in those years',
  },
  {
    flag: 'Ages valid?',
    green: 'All ages are correctly sequenced',
    red: 'An age entry is out of order (e.g. retirement age before current age, or SS age before retirement age)',
    fix: 'Go back to INPUTS and correct the age entries',
  },
  {
    flag: 'Sequence of returns risk?',
    green: 'Two or more years of cash-equivalent spending in taxable — buffer exists',
    yellow: 'Thin buffer — a bad first few years could permanently damage the plan',
    fix: 'Increase taxable balance or cash balance in INPUTS until you have at least 2 years of spending covered before investing begins',
  },
]

const proUpgrades = [
  { sheet: 'TAX ESTIMATE', what: 'Federal tax estimate for every bridge year using 2026 MFJ brackets. Shows taxable income and estimated tax after standard deduction — so you can see the real after-tax cost of each withdrawal year.' },
  { sheet: 'ROTH LADDER', what: '5-year Roth conversion pipeline. Shows remaining 12% bracket space each year, optimal conversion amounts, tax cost, and when each converted rung unlocks penalty-free.' },
  { sheet: 'REBALANCE', what: 'Annual allocation tracker. Enter target percentages by asset class and see current drift, with buy/sell signals. Keeps your portfolio allocation on track across bridge years.' },
  { sheet: 'Extended RISK FLAGS', what: 'Additional automated checks: SS delay opportunity with exact dollar impact, IRMAA Medicare threshold warning, and portfolio balance at 90.' },
]

export default function BridgePlannerWalkthroughPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-navy border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-5 pt-12 pb-10">
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase text-white/30 mb-6">
            <Link href="/" className="hover:text-gold transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white/20">Guides</span>
            <span>/</span>
            <span className="text-white/40">Bridge Planner Walkthrough</span>
          </div>
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-3">Free Resource</div>
          <h1 className="font-syne font-bold text-[clamp(26px,4vw,46px)] tracking-tight text-white leading-tight mb-3">
            How to Use the Bridge Planner
          </h1>
          <p className="text-white/50 text-[15px] leading-relaxed max-w-xl mb-6">
            Step-by-step walkthrough of the free Bridge Planner spreadsheet — how to enter your numbers, read each sheet, interpret the RISK FLAGS, and know what to do when a flag fires.
          </p>
          <a
            href="/#download"
            className="inline-block bg-gold text-black font-syne font-semibold text-[13px] tracking-wide px-6 py-3 rounded hover:opacity-85 transition-opacity"
          >
            Download Free Bridge Planner →
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-12">

        {/* What the planner does */}
        <div className="bg-ink border border-white/[0.07] rounded-xl p-6 mb-10">
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-3">What It Models</div>
          <p className="text-white/60 text-[14px] leading-relaxed mb-4">
            The Bridge Planner answers one question: <strong className="text-white/85">can your taxable, 401(k), and Roth accounts carry you from retirement to age 59½ — and beyond to life expectancy?</strong>
          </p>
          <p className="text-white/60 text-[14px] leading-relaxed mb-4">
            It models the withdrawal sequence year by year — taxable first, then Roth, then 401(k) — and shows you the exact year each account runs dry, what the portfolio looks like at 59½, and whether the plan survives to your life expectancy.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 mt-5">
            {[
              { label: 'Bridge Years', sub: 'Retirement → age 59½', color: 'text-teal' },
              { label: 'Post-59½ Phase', sub: '401(k) access unlocked', color: 'text-gold' },
              { label: 'Full Projection', sub: 'To life expectancy', color: 'text-sage' },
            ].map(({ label, sub, color }) => (
              <div key={label} className="bg-slate rounded-lg px-4 py-3 text-center">
                <div className={`font-syne font-semibold text-[13px] ${color} mb-1`}>{label}</div>
                <div className="font-mono text-[10px] text-white/30">{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Step by step */}
        <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-6">
          Step-by-Step Walkthrough
        </h2>
        <div className="space-y-6 mb-14">
          {steps.map(({ num, sheet, icon, title, body }) => (
            <div key={num} className="flex gap-5">
              {/* Step number */}
              <div className="shrink-0 flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center font-syne font-bold text-[13px] text-black">
                  {num}
                </div>
                {num < steps.length && (
                  <div className="w-px flex-1 bg-white/[0.06] mt-2" />
                )}
              </div>
              {/* Content */}
              <div className="pb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[9px] tracking-widest uppercase text-white/25 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded">
                    {icon} {sheet}
                  </span>
                </div>
                <h3 className="font-syne font-semibold text-[16px] text-white mb-2">{title}</h3>
                <p className="text-white/55 text-[14px] leading-[1.8]">{body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* RISK FLAGS guide */}
        <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-2">
          Understanding the RISK FLAGS
        </h2>
        <p className="text-white/45 text-[13px] mb-6">
          Each flag either passes or raises a warning. Here's what each one means and exactly what to do when it fires.
        </p>
        <div className="space-y-4 mb-14">
          {flags.map(({ flag, green, yellow, red, fix }) => (
            <div key={flag} className="bg-ink border border-white/[0.07] rounded-xl overflow-hidden">
              <div className="bg-slate px-5 py-3 border-b border-white/[0.06]">
                <span className="font-syne font-semibold text-[14px] text-white">{flag}</span>
              </div>
              <div className="px-5 py-4 space-y-2">
                <div className="flex gap-2">
                  <span className="font-mono text-[9px] tracking-widest uppercase text-sage bg-sage/10 border border-sage/20 px-1.5 py-0.5 rounded shrink-0 h-fit mt-0.5">Green</span>
                  <span className="text-white/50 text-[13px]">{green}</span>
                </div>
                {yellow && (
                  <div className="flex gap-2">
                    <span className="font-mono text-[9px] tracking-widest uppercase text-gold bg-gold/10 border border-gold/20 px-1.5 py-0.5 rounded shrink-0 h-fit mt-0.5">Yellow</span>
                    <span className="text-white/50 text-[13px]">{yellow}</span>
                  </div>
                )}
                {red && (
                  <div className="flex gap-2">
                    <span className="font-mono text-[9px] tracking-widest uppercase text-red-400 bg-red-400/10 border border-red-400/20 px-1.5 py-0.5 rounded shrink-0 h-fit mt-0.5">Red</span>
                    <span className="text-white/50 text-[13px]">{red}</span>
                  </div>
                )}
                <div className="flex gap-2 pt-1 border-t border-white/[0.04]">
                  <span className="font-mono text-[9px] tracking-widest uppercase text-teal bg-teal/10 border border-teal/20 px-1.5 py-0.5 rounded shrink-0 h-fit mt-0.5">Fix</span>
                  <span className="text-white/50 text-[13px]">{fix}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Common mistakes */}
        <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-6">
          Common Mistakes to Avoid
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-14">
          {[
            {
              mistake: 'Editing formula cells',
              fix: 'Only blue cells are inputs. If a cell shows a formula, leave it alone. If you accidentally overwrite one, close without saving and reopen.',
            },
            {
              mistake: 'Using optimistic return assumptions',
              fix: 'The default 5% nominal return is conservative on purpose. Avoid using 8-10% — it makes the plan look better than it is. For early retirement stress testing, try 4-5%.',
            },
            {
              mistake: 'Ignoring the bridge gap flag',
              fix: 'A yellow or red bridge flag means the plan has a real structural problem, not a rounding issue. Fix it before retiring — add taxable savings, reduce spending, or add income.',
            },
            {
              mistake: 'Not accounting for healthcare',
              fix: 'Healthcare before Medicare at 65 can cost $12,000-$36,000/year. Add this to your annual spending in INPUTS to get an accurate picture.',
            },
            {
              mistake: 'Assuming Social Security solves bridge years',
              fix: 'SS starts at 62 at the earliest. If you retire at 50, SS is 12 years away — it does not solve bridge funding. Model the bridge independently of SS income.',
            },
            {
              mistake: 'Not stress-testing with lower returns',
              fix: 'Run the planner twice: once at your expected return, once at 2% lower. If the plan only works at the optimistic number, it needs more margin.',
            },
          ].map(({ mistake, fix }) => (
            <div key={mistake} className="bg-ink border border-white/[0.07] rounded-xl p-5">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-red-400 text-[16px] shrink-0 mt-0.5">✗</span>
                <span className="font-syne font-semibold text-[14px] text-white">{mistake}</span>
              </div>
              <p className="text-white/45 text-[13px] leading-relaxed pl-6">{fix}</p>
            </div>
          ))}
        </div>

        {/* What Pro adds */}
        <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-2">
          What the Pro Version Adds
        </h2>
        <p className="text-white/45 text-[13px] mb-6">
          The free planner covers bridge years, post-59½ projection, and RISK FLAGS. Pro adds four additional sheets.
        </p>
        <div className="space-y-3 mb-10">
          {proUpgrades.map(({ sheet, what }) => (
            <div key={sheet} className="flex gap-4 bg-ink border border-gold/10 rounded-xl p-5">
              <div className="font-mono text-[9px] tracking-widest uppercase text-gold bg-gold/10 border border-gold/20 px-2 py-1 rounded shrink-0 h-fit mt-0.5 whitespace-nowrap">
                {sheet}
              </div>
              <p className="text-white/50 text-[13px] leading-relaxed">{what}</p>
            </div>
          ))}
        </div>

        {/* CTA block */}
        <div className="bg-ink border border-gold/20 rounded-xl p-8 text-center">
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-3">Get Started</div>
          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-3">
            Download the Free Bridge Planner
          </h2>
          <p className="text-white/45 text-[14px] leading-relaxed max-w-lg mx-auto mb-6">
            Enter your balances, spending, and retirement age — and see your bridge years, RISK FLAGS, and full projection update instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/#download"
              className="inline-block bg-gold text-black font-syne font-semibold text-[13px] tracking-wide px-8 py-3 rounded hover:opacity-85 transition-opacity"
            >
              Download Free Planner →
            </a>
            <Link
              href="/pricing"
              className="inline-block border border-gold/30 text-gold font-syne font-semibold text-[13px] tracking-wide px-8 py-3 rounded hover:border-gold/60 transition-colors"
            >
              See Pro Plans →
            </Link>
          </div>
        </div>

        {/* Related */}
        <div className="mt-10">
          <h2 className="font-syne font-bold text-[18px] tracking-tight text-white mb-4">Related Guides & Tools</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { href: '/tools/bridge-strategy-calculator',               label: 'Bridge Strategy Calculator' },
              { href: '/blog/what-is-retirement-bridge-strategy',        label: 'Bridge Strategy Explained' },
              { href: '/blog/how-much-taxable-brokerage-to-retire-early', label: 'How Much Taxable Do I Need?' },
              { href: '/blog/can-i-retire-at-50-with-1-million',         label: 'Can I Retire at 50 With $1M?' },
              { href: '/blog/rule-72t-sepp-guide',                       label: 'Rule 72(t) SEPP Guide' },
              { href: '/blog/withdrawal-order-taxable-roth-401k',        label: 'Withdrawal Order Guide' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 bg-ink border border-white/[0.07] rounded-lg px-4 py-3 hover:border-gold/20 transition-colors group"
              >
                <span className="font-mono text-[11px] text-white/50 group-hover:text-gold/80 transition-colors">{label} →</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}