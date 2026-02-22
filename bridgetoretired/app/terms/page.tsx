import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Use – BridgeToRetired',
  description: 'Terms of Use for BridgeToRetired.com.',
}

const LAST_UPDATED = 'February 22, 2025'
const EMAIL = 'hello@bridgetoretired.com'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="bg-navy border-b border-white/[0.06] py-16 px-5">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.24em] uppercase text-gold mb-4">
            <span className="block w-6 h-px bg-gold" />
            Legal
          </div>
          <h1 className="font-syne font-bold text-[clamp(28px,4vw,46px)] tracking-tight text-white mb-3">
            Terms of Use
          </h1>
          <p className="font-mono text-[11px] text-white/30">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-14">
        <div className="prose-dark space-y-10">

          <p className="text-white/60 text-[15px] leading-[1.85]">
            Please read these Terms of Use carefully before using BridgeToRetired.com (the "Site").
            By accessing or using the Site, you agree to be bound by these terms. If you do not
            agree with any part of these terms, do not use the Site.
          </p>

          {[
            {
              title: '1. Educational Purpose Only',
              content: (
                <div className="space-y-3 text-white/60 text-[15px] leading-[1.85]">
                  <p>
                    All content on BridgeToRetired.com — including articles, calculators, spreadsheets,
                    guides, and tools — is provided for <strong className="text-white">educational and informational purposes only</strong>.
                    Nothing on this Site constitutes financial, investment, tax, or legal advice.
                  </p>
                  <p>
                    We are not registered investment advisors, financial planners, tax professionals,
                    or attorneys. The information provided does not take into account your individual
                    financial situation, goals, risk tolerance, or other personal factors.
                  </p>
                  <p>
                    <strong className="text-white">Always consult a qualified, licensed financial professional</strong> before
                    making any retirement, investment, or tax decisions. The stakes in retirement
                    planning are high — professional advice specific to your situation is essential.
                  </p>
                </div>
              ),
            },
            {
              title: '2. No Guarantees or Warranties',
              content: (
                <div className="space-y-3 text-white/60 text-[15px] leading-[1.85]">
                  <p>
                    The Site and all content are provided "as is" without warranty of any kind,
                    express or implied. We make no guarantees regarding:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>The accuracy, completeness, or timeliness of any information on the Site</li>
                    <li>The results of using our calculators, planners, or spreadsheets</li>
                    <li>The suitability of any strategy described for your specific situation</li>
                    <li>Future investment returns, tax rates, or government program benefits</li>
                  </ul>
                  <p>
                    Financial projections and calculator outputs are hypothetical illustrations only.
                    Past performance does not guarantee future results. Actual outcomes will differ
                    from any projections shown.
                  </p>
                </div>
              ),
            },
            {
              title: '3. Affiliate Relationships',
              content: (
                <p className="text-white/60 text-[15px] leading-[1.85]">
                  BridgeToRetired participates in affiliate marketing programs. We may earn a
                  commission when you click certain links and sign up for or purchase third-party
                  products or services. This compensation does not influence the editorial content
                  of the Site, but you should be aware that a financial incentive exists. All
                  affiliate relationships are disclosed in accordance with FTC guidelines. See our
                  full <Link href="/disclosures" className="text-gold underline">Affiliate Disclosures</Link> page.
                </p>
              ),
            },
            {
              title: '4. Limitation of Liability',
              content: (
                <p className="text-white/60 text-[15px] leading-[1.85]">
                  To the fullest extent permitted by law, BridgeToRetired and its owners, authors,
                  and contributors shall not be liable for any direct, indirect, incidental, special,
                  consequential, or punitive damages arising from your use of the Site or reliance
                  on any content herein. This includes, without limitation, any financial losses,
                  missed investment opportunities, tax penalties, or retirement shortfalls resulting
                  from decisions influenced by content on this Site.
                </p>
              ),
            },
            {
              title: '5. Third-Party Links',
              content: (
                <p className="text-white/60 text-[15px] leading-[1.85]">
                  The Site contains links to third-party websites. These links are provided for
                  convenience only. We have no control over the content, accuracy, or practices
                  of third-party sites and assume no responsibility for them. Linking to a
                  third-party site does not imply endorsement of that site or its content beyond
                  what is explicitly stated on this Site.
                </p>
              ),
            },
            {
              title: '6. Intellectual Property',
              content: (
                <p className="text-white/60 text-[15px] leading-[1.85]">
                  All original content on BridgeToRetired.com — including articles, graphics,
                  calculators, and the Bridge Planner spreadsheet — is the intellectual property
                  of BridgeToRetired. The Bridge Planner is provided free for personal use only.
                  You may not reproduce, distribute, sell, or commercially exploit any content
                  from this Site without written permission.
                </p>
              ),
            },
            {
              title: '7. User Conduct',
              content: (
                <div className="space-y-3 text-white/60 text-[15px] leading-[1.85]">
                  <p>By using this Site, you agree not to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Use the Site for any unlawful purpose</li>
                    <li>Attempt to gain unauthorized access to any part of the Site</li>
                    <li>Reproduce or redistribute Site content commercially without permission</li>
                    <li>Transmit any harmful, offensive, or disruptive content</li>
                  </ul>
                </div>
              ),
            },
            {
              title: '8. Changes to These Terms',
              content: (
                <p className="text-white/60 text-[15px] leading-[1.85]">
                  We reserve the right to modify these Terms at any time. Changes will be posted
                  on this page with an updated date. Your continued use of the Site after any
                  changes constitutes acceptance of the updated Terms.
                </p>
              ),
            },
            {
              title: '9. Governing Law',
              content: (
                <p className="text-white/60 text-[15px] leading-[1.85]">
                  These Terms shall be governed by and construed in accordance with the laws of
                  the United States, without regard to conflict of law provisions.
                </p>
              ),
            },
            {
              title: '10. Contact',
              content: (
                <p className="text-white/60 text-[15px] leading-[1.85]">
                  Questions about these Terms? Contact us at{' '}
                  <a href={`mailto:${EMAIL}`} className="text-gold underline">{EMAIL}</a>.
                </p>
              ),
            },
          ].map(({ title, content }) => (
            <div key={title}>
              <h2 className="font-syne font-bold text-[20px] tracking-tight text-white mb-4">{title}</h2>
              {content}
            </div>
          ))}

          <div className="border-t border-white/[0.07] pt-8 flex flex-wrap gap-5">
            <Link href="/privacy" className="font-mono text-[11px] text-gold hover:opacity-75 transition-opacity">Privacy Policy →</Link>
            <Link href="/disclosures" className="font-mono text-[11px] text-gold hover:opacity-75 transition-opacity">Affiliate Disclosures →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
