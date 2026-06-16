import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How to Use the Bridge Planner — Step-by-Step Walkthrough | BridgeToRetired',
  description: 'Step-by-step guide to using the free Bridge Planner spreadsheet and Pro online planner. Learn how to enter your numbers, read the DASHBOARD, interpret RISK FLAGS, and understand what each sheet tells you.',
  alternates: { canonical: 'https://bridgetoretired.com/guides/bridge-planner-walkthrough' },
}

const sheets = [
  {
    name: 'DASHBOARD',
    icon: '🗺️',
    role: 'Mission control',
    desc: 'KPI cards, risk flags, and the full year-by-year projection table. Start here after entering your numbers — it gives you the instant health check.',
  },
  {
    name: 'START HERE',
    icon: '📋',
    role: 'Sheet guide',
    desc: 'Lists every sheet, what it does, and the order to use them. Open this first when you download the file.',
  },
  {
    name: 'INPUTS',
    icon: '✏️',
    role: 'The only sheet you edit',
    desc: 'Enter your ages, balances, spending, return, and inflation here. Blue cells are inputs. Everything else is a formula — do not edit black cells.',
  },
  {
    name: 'BRIDGE CLEAN',
    icon: '🌉',
    role: 'Bridge years plan',
    desc: 'The main bridge sheet. Shows each year from retirement to age 59½ with starting and ending balances for all three accounts. Taxable is drawn first, 401(k) grows untouched, Roth used only if taxable is exhausted.',
  },
  {
    name: 'POST-59.5',
    icon: '📈',
    role: 'Post-59½ projection',
    desc: '401(k) access is now unlocked. This sheet draws from the 401(k) first, preserves Roth as long as possible, and projects balances to life expectancy.',
  },
  {
    name: 'PROJECTION',
    icon: '📊',
    role: 'Full lifetime view',
    desc: 'Combines both phases into one continuous table from retirement to life expectancy. Shows total portfolio, annual withdrawal, and which phase each year falls into — Bridge, Post-59½, or Post-SS.',
  },
  {
    name: 'RISK FLAGS',
    icon: '⚠️',
    role: 'Automatic health check',
    desc: 'Five automated checks that update instantly when you change INPUTS. Green means OK, yellow means review, red means the plan has a structural problem.',
  },
]

const steps = [
  {
    num: 1,
    sheet: 'START HERE',
    icon: '📋',
    title: 'Open the file and read the sheet guide',
    body: 'Go to the START HERE tab first. It lists every sheet, what it does, and the recommended order. The planner has 8 tabs total — two of those (BRIDGE YEARS and BRIDGE CLEAN) show the same bridge period in different formats. BRIDGE CLEAN is the one to read.',
  },
  {
    num: 2,
    sheet: 'INPUTS',
    icon: '✏️',
    title: 'Enter your numbers — blue cells only',
    body: `INPUTS is the only sheet you edit. Change any blue cell and every other sheet updates automatically. Enter these in order:

Timeline: current age, retirement age, life expectancy (default 90), Social Security claiming age.

Account balances: Taxable Brokerage, Traditional 401(k), Roth IRA.

Spending and assumptions: annual spending, expected return (default 5%), inflation (default 2.5%).

The default scenario ships with Age 48 retiring at 52, $120K taxable, $650K 401(k), $90K Roth, $40K spending. Change these to your numbers before reading any other sheet.`,
  },
  {
    num: 3,
    sheet: 'DASHBOARD',
    icon: '🗺️',
    title: 'Check the DASHBOARD for your instant health check',
    body: `After entering your numbers, go to DASHBOARD. Four KPI cards show your total portfolio, bridge years, annual spending, and target retire year.

Below the KPIs, five RISK FLAGS update automatically. With the default inputs, two flags fire immediately — a bridge gap warning and a portfolio depletion flag. That's intentional: the default scenario is designed to show you what a stressed plan looks like. Enter your actual numbers and watch the flags change.

The DASHBOARD also shows the full year-by-year projection table — every year from retirement to life expectancy with account balances and the withdrawal phase label.`,
  },
  {
    num: 4,
    sheet: 'BRIDGE CLEAN',
    icon: '🌉',
    title: 'Read BRIDGE CLEAN year by year',
    body: `BRIDGE CLEAN shows the hardest years to fund: from your retirement date to age 59½. Each row is one year with:
— Taxable Start, 401(k) Start, Roth Start
— Annual Withdrawal (inflation-adjusted)
— Taxable End, 401(k) End, Roth End, Total End

The withdrawal order is Taxable → Roth → 401(k). Find the year your taxable account hits zero. If that happens before 59½ and the Roth is also thin, you have a bridge gap — which the RISK FLAGS sheet will flag automatically.

The 401(k) column should be growing throughout the bridge years in a well-funded plan. If it's being drawn down before 59½, that signals a problem with the taxable bridge.`,
  },
  {
    num: 5,
    sheet: 'POST-59.5',
    icon: '📈',
    title: 'Check POST-59.5 for the second phase',
    body: `Once past 59½, all retirement accounts are accessible without penalty. POST-59.5 draws from the 401(k) first, preserving Roth for as long as possible.

Look at two things: first, whether the total portfolio column stays positive through your life expectancy. Second, the year Social Security income starts — in the projection, this reduces the annual withdrawal needed from the portfolio.

With the default inputs, the portfolio depletes around age 85-86. Reducing spending, increasing the return assumption, or building more taxable before retiring will push that depletion date out or eliminate it entirely.`,
  },
  {
    num: 6,
    sheet: 'PROJECTION',
    icon: '📊',
    title: 'Use PROJECTION for the full lifetime picture',
    body: `PROJECTION combines BRIDGE CLEAN and POST-59.5 into one continuous table from retirement to life expectancy. Three phases are labeled: Bridge (Taxable), Post-59½ (401k), and Post-SS (401k+).

If the total portfolio column goes to zero before your life expectancy, the plan needs adjustment. Go back to INPUTS and adjust one variable at a time — lower spending, change the return rate, or shift your retirement age — and watch the PROJECTION table update.`,
  },
  {
    num: 7,
    sheet: 'RISK FLAGS',
    icon: '⚠️',
    title: 'Act on the RISK FLAGS',
    body: `RISK FLAGS runs five automatic checks. Read each one, understand what it means, then go back to INPUTS and try changing one variable at a time to clear the flags. Each flag is either passing or flagged — there's no middle ground.`,
  },
]

const flags = [
  {
    flag: 'Taxable account fully funds bridge?',
    green: 'Taxable account covers all bridge years to 59½ without needing 401(k) or Roth funds',
    yellow: 'Gap exists — taxable may run short before 59½. Consider increasing taxable balance, adding other income, or using Roth contributions.',
    fix: 'In INPUTS: increase Taxable Brokerage balance, add Other Income, or reduce Annual Spending until the flag clears.',
  },
  {
    flag: 'Portfolio intact at life expectancy?',
    green: 'Total portfolio remains positive through your planning age',
    red: 'Portfolio depletes before life expectancy at current spending and return assumptions',
    fix: 'In INPUTS: reduce spending, increase return assumption, delay retirement age, or add Social Security income until the flag clears.',
  },
  {
    flag: 'Retirement age > current age?',
    green: 'Ages are correctly sequenced — no conflict',
    red: 'An age entry is out of order (retirement age before current age, or SS age before retirement age)',
    fix: 'Go back to INPUTS and correct the age entries.',
  },
  {
    flag: 'Withdrawal rate ≤ 4%?',
    green: 'Annual spending divided by total portfolio is 4% or below',
    yellow: 'Rate exceeds 4% — higher long-term failure risk, especially with a 35-40 year horizon at age 50',
    fix: 'The 4% rule was built for 30-year retirements. At 50, 3.3% is safer. Reduce spending or increase portfolio balance in INPUTS.',
  },
  {
    flag: 'Bridge years fully covered?',
    green: 'Bridge period is supported by available non-penalty funds',
    yellow: 'Bridge period may exceed available non-penalty funds — review taxable and Roth contribution balances',
    fix: 'Increase Taxable Brokerage or Roth IRA in INPUTS, or reduce bridge length by adjusting retirement age.',
  },
]

const mistakes = [
  {
    mistake: 'Editing formula cells (black cells)',
    fix: 'Only blue cells are inputs. If you accidentally overwrite a formula, close without saving and reopen the file.',
  },
  {
    mistake: 'Using the default numbers as your plan',
    fix: 'The default scenario (Age 48, $860K total, $40K spending) is designed to show a stressed plan with flags firing. Always enter your actual numbers before reading results.',
  },
  {
    mistake: 'Using optimistic return assumptions',
    fix: 'The default 5% nominal return is already moderate. Avoid 8-10% assumptions — they make the plan look better than it is. For stress testing, try 3-4%.',
  },
  {
    mistake: 'Ignoring the bridge gap flag',
    fix: 'A bridge gap warning is a structural problem, not a rounding issue. The plan needs more taxable savings, additional income, or a different strategy before retiring.',
  },
  {
    mistake: 'Not including healthcare costs',
    fix: 'Healthcare before Medicare at 65 can cost $12,000-$36,000/year. Add this to Annual Spending in INPUTS for an accurate picture.',
  },
  {
    mistake: 'Assuming Social Security solves the bridge',
    fix: 'SS starts at 62 at the earliest. If you retire at 50, SS is 12 years away and does not help the bridge at all. The planner models them separately for this reason.',
  },
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
            Step-by-step walkthrough of the free Bridge Planner spreadsheet and the Pro online planner. How to enter your numbers, what each sheet shows, how to read the RISK FLAGS, and what to do when one fires.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/#download"
              className="inline-block bg-gold text-black font-syne font-semibold text-[13px] tracking-wide px-6 py-3 rounded hover:opacity-85 transition-opacity"
            >
              Download Free Planner →
            </a>
            <Link
              href="/pro/planner"
              className="inline-block border border-gold/30 text-gold font-syne font-semibold text-[13px] tracking-wide px-6 py-3 rounded hover:border-gold/60 transition-colors"
            >
              Try Online Planner →
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-12">

        {/* What it models */}
        <div className="bg-ink border border-white/[0.07] rounded-xl p-6 mb-10">
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-3">What It Models</div>
          <p className="text-white/60 text-[14px] leading-relaxed mb-4">
            The Bridge Planner answers one question: <strong className="text-white/85">can your taxable, 401(k), and Roth accounts carry you from retirement to age 59½ — and beyond to life expectancy?</strong>
          </p>
          <p className="text-white/60 text-[14px] leading-relaxed mb-5">
            It models the withdrawal sequence year by year — taxable first, then Roth, then 401(k) — and shows the exact year each account runs dry, what the portfolio looks like at 59½, and whether the plan survives to your life expectancy.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
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

        {/* Sheet overview */}
        <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-6">
          The 8 Sheets at a Glance
        </h2>
        <div className="grid sm:grid-cols-2 gap-3 mb-12">
          {sheets.map(({ name, icon, role, desc }) => (
            <div key={name} className="bg-ink border border-white/[0.07] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[16px]">{icon}</span>
                <span className="font-mono text-[10px] tracking-widest uppercase text-gold font-semibold">{name}</span>
                <span className="font-mono text-[9px] text-white/25">— {role}</span>
              </div>
              <p className="text-white/45 text-[12px] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Step by step */}
        <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-6">
          Step-by-Step Walkthrough
        </h2>
        <div className="space-y-6 mb-14">
          {steps.map(({ num, sheet, icon, title, body }) => (
            <div key={num} className="flex gap-5">
              <div className="shrink-0 flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center font-syne font-bold text-[13px] text-black shrink-0">
                  {num}
                </div>
                {num < steps.length && (
                  <div className="w-px flex-1 bg-white/[0.06] mt-2" />
                )}
              </div>
              <div className="pb-6 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-[9px] tracking-widest uppercase text-white/25 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded">
                    {icon} {sheet}
                  </span>
                </div>
                <h3 className="font-syne font-semibold text-[16px] text-white mb-2">{title}</h3>
                <p className="text-white/55 text-[14px] leading-[1.9] whitespace-pre-line">{body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Risk flags */}
        <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-2">
          Understanding the 5 RISK FLAGS
        </h2>
        <p className="text-white/45 text-[13px] mb-6">
          Each flag either passes or fires. Here's what each one means and exactly what to change in INPUTS to clear it.
        </p>
        <div className="space-y-4 mb-14">
          {flags.map(({ flag, green, yellow, red, fix }) => (
            <div key={flag} className="bg-ink border border-white/[0.07] rounded-xl overflow-hidden">
              <div className="bg-slate px-5 py-3 border-b border-white/[0.06]">
                <span className="font-syne font-semibold text-[14px] text-white">{flag}</span>
              </div>
              <div className="px-5 py-4 space-y-2">
                <div className="flex gap-2">
                  <span className="font-mono text-[9px] tracking-widest uppercase text-sage bg-sage/10 border border-sage/20 px-1.5 py-0.5 rounded shrink-0 h-fit mt-0.5">✓ Green</span>
                  <span className="text-white/50 text-[13px]">{green}</span>
                </div>
                {yellow && (
                  <div className="flex gap-2">
                    <span className="font-mono text-[9px] tracking-widest uppercase text-gold bg-gold/10 border border-gold/20 px-1.5 py-0.5 rounded shrink-0 h-fit mt-0.5">⚠ Yellow</span>
                    <span className="text-white/50 text-[13px]">{yellow}</span>
                  </div>
                )}
                {red && (
                  <div className="flex gap-2">
                    <span className="font-mono text-[9px] tracking-widest uppercase text-red-400 bg-red-400/10 border border-red-400/20 px-1.5 py-0.5 rounded shrink-0 h-fit mt-0.5">✗ Red</span>
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
          {mistakes.map(({ mistake, fix }) => (
            <div key={mistake} className="bg-ink border border-white/[0.07] rounded-xl p-5">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-red-400 text-[15px] shrink-0 mt-0.5">✗</span>
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
          The free planner covers bridge years, post-59½ projection, full lifetime projection, and 5 RISK FLAGS. Pro adds deeper planning layers — including an online planner with cloud scenario saving.
        </p>
        <div className="space-y-3 mb-10">
          {[
            { sheet: 'ONLINE PLANNER', what: 'Save up to 5 named scenarios in the cloud, run Monte Carlo simulation across 200 randomized return sequences, and access your plan from any device. All 8 tabs update automatically as you change inputs — no spreadsheet required. Available at bridgetoretired.com/pro/planner.' },
            { sheet: 'TAX ESTIMATE', what: 'Federal tax estimate for every bridge year using 2026 MFJ brackets. Shows taxable income and estimated tax after standard deduction so you can see the real after-tax cost of each withdrawal year.' },
            { sheet: 'ROTH LADDER', what: '5-year Roth conversion pipeline. Shows remaining 12% bracket space each year, optimal conversion amounts, tax cost per conversion, ACA cliff cross-check, and when each converted rung unlocks penalty-free.' },
            { sheet: 'REBALANCE', what: 'Annual allocation tracker. Enter target percentages by asset class and see current drift with buy/sell signals — keeps your portfolio allocation on track across bridge years.' },
            { sheet: 'Extended RISK FLAGS', what: '9 automated checks including SS delay opportunity with exact dollar impact, IRMAA Medicare threshold warning, ACA cliff exposure, and Monte Carlo success rate.' },
          ].map(({ sheet, what }) => (
            <div key={sheet} className="flex gap-4 bg-ink border border-gold/10 rounded-xl p-5">
              <div className="font-mono text-[9px] tracking-widest uppercase text-gold bg-gold/10 border border-gold/20 px-2 py-1 rounded shrink-0 h-fit mt-0.5 whitespace-nowrap">
                {sheet}
              </div>
              <p className="text-white/50 text-[13px] leading-relaxed">{what}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-ink border border-gold/20 rounded-xl p-8 text-center mb-10">
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-3">Get Started</div>
          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-3">
            Download the Free Bridge Planner
          </h2>
          <p className="text-white/45 text-[14px] leading-relaxed max-w-lg mx-auto mb-6">
            Enter your balances, spending, and retirement age — and see your bridge years, RISK FLAGS, and full projection update instantly. Pro members also get the online planner with Monte Carlo simulation and cloud scenario saving.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/#download"
              className="inline-block bg-gold text-black font-syne font-semibold text-[13px] tracking-wide px-8 py-3 rounded hover:opacity-85 transition-opacity"
            >
              Download Free Planner →
            </a>
            <Link
              href="/pro/planner"
              className="inline-block border border-gold/30 text-gold font-syne font-semibold text-[13px] tracking-wide px-8 py-3 rounded hover:border-gold/60 transition-colors"
            >
              Try Online Planner →
            </Link>
            <Link
              href="/pricing"
              className="inline-block border border-white/[0.12] text-white/60 font-mono text-[10px] tracking-widest uppercase px-8 py-3 rounded hover:border-white/25 transition-colors"
            >
              See Pro Plans →
            </Link>
          </div>
        </div>

        {/* Related */}
        <h2 className="font-syne font-bold text-[18px] tracking-tight text-white mb-4">Related Guides & Tools</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/tools/bridge-strategy-calculator',                label: 'Bridge Strategy Calculator' },
            { href: '/blog/what-is-retirement-bridge-strategy',         label: 'Bridge Strategy Explained' },
            { href: '/blog/online-retirement-planner',                  label: 'Why We Built the Online Planner' },
            { href: '/blog/how-much-taxable-brokerage-to-retire-early', label: 'How Much Taxable Do I Need?' },
            { href: '/blog/can-i-retire-at-50-with-1-million',          label: 'Can I Retire at 50 With $1M?' },
            { href: '/blog/rule-72t-sepp-guide',                        label: 'Rule 72(t) SEPP Guide' },
            { href: '/blog/roth-ladder-vs-72t',                         label: 'Roth Ladder vs 72(t)' },
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
  )
}