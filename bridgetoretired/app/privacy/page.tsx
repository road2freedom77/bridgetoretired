import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy – BridgeToRetired',
  description: 'Privacy Policy for BridgeToRetired.com — how we collect, use, and protect your information.',
}

const LAST_UPDATED = 'February 22, 2025'
const SITE = 'BridgeToRetired.com'
const EMAIL = 'hello@bridgetoretired.com'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="bg-navy border-b border-white/[0.06] py-16 px-5">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.24em] uppercase text-gold mb-4">
            <span className="block w-6 h-px bg-gold" />
            Legal
          </div>
          <h1 className="font-syne font-bold text-[clamp(28px,4vw,46px)] tracking-tight text-white mb-3">
            Privacy Policy
          </h1>
          <p className="font-mono text-[11px] text-white/30">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-14">
        <div className="prose-dark space-y-10">

          <p>
            This Privacy Policy describes how {SITE} ("we," "us," or "our") collects, uses, and
            shares information when you visit our website at bridgetoretired.com (the "Site").
            By using the Site, you agree to the collection and use of information in accordance
            with this policy.
          </p>

          {[
            {
              title: '1. Information We Collect',
              content: (
                <div className="space-y-4 text-white/60 text-[15px] leading-[1.85]">
                  <p><strong className="text-white">Information you provide directly:</strong> When you submit your email address to receive our free Bridge Planner or newsletter, we collect that email address. We do not collect your name, address, payment information, or any other personal details unless you voluntarily provide them.</p>
                  <p><strong className="text-white">Automatically collected information:</strong> Like most websites, we may collect standard log data including your IP address, browser type, pages visited, time spent on pages, and referring URLs. This data is used in aggregate to understand how visitors use the Site and to improve our content.</p>
                  <p><strong className="text-white">Cookies and tracking:</strong> We may use cookies and similar tracking technologies to analyze Site traffic and usage patterns. You can instruct your browser to refuse cookies, though some features of the Site may not function properly as a result.</p>
                </div>
              ),
            },
            {
              title: '2. How We Use Your Information',
              content: (
                <div className="space-y-3 text-white/60 text-[15px] leading-[1.85]">
                  <p>We use the information we collect to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Send you the Bridge Planner spreadsheet and any other resources you requested</li>
                    <li>Send periodic email newsletters and updates about early retirement planning (you may unsubscribe at any time)</li>
                    <li>Analyze and improve the Site's content and performance</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                  <p>We do <strong className="text-white">not</strong> sell your personal information to third parties. Ever.</p>
                </div>
              ),
            },
            {
              title: '3. Email Communications',
              content: (
                <p className="text-white/60 text-[15px] leading-[1.85]">
                  When you subscribe to our newsletter or download the Bridge Planner, you consent to receive
                  email communications from us. Every email we send includes an unsubscribe link.
                  You may opt out at any time and we will remove you from our list promptly.
                  We use Resend (resend.com) to deliver emails. Your email address is shared with
                  Resend solely for the purpose of sending you communications you have requested.
                </p>
              ),
            },
            {
              title: '4. Affiliate Links and Third-Party Services',
              content: (
                <p className="text-white/60 text-[15px] leading-[1.85]">
                  Our Site contains affiliate links to third-party products and services. When you
                  click an affiliate link, you will be directed to a third-party website. We have
                  no control over and assume no responsibility for the content, privacy policies,
                  or practices of any third-party sites. We encourage you to review the privacy
                  policy of every site you visit. Third-party services we link to (such as Empower,
                  Boldin, M1 Finance, and others) have their own privacy policies governing how
                  they collect and use your information.
                </p>
              ),
            },
            {
              title: '5. Analytics',
              content: (
                <p className="text-white/60 text-[15px] leading-[1.85]">
                  We may use analytics services (such as Google Analytics or similar) to understand
                  how visitors interact with our Site. These services may collect information about
                  your visits using cookies and similar technologies. The information generated is
                  used to compile reports on Site activity. You can opt out of Google Analytics by
                  installing the Google Analytics opt-out browser add-on.
                </p>
              ),
            },
            {
              title: '6. Data Retention',
              content: (
                <p className="text-white/60 text-[15px] leading-[1.85]">
                  We retain your email address for as long as you are subscribed to our communications.
                  If you unsubscribe, we will remove your email from our active mailing list. We may
                  retain anonymized, aggregated data for analytics purposes indefinitely.
                </p>
              ),
            },
            {
              title: '7. Your Rights',
              content: (
                <div className="space-y-3 text-white/60 text-[15px] leading-[1.85]">
                  <p>Depending on your location, you may have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Access the personal information we hold about you</li>
                    <li>Request correction of inaccurate information</li>
                    <li>Request deletion of your personal information</li>
                    <li>Opt out of marketing communications at any time</li>
                  </ul>
                  <p>To exercise any of these rights, contact us at <a href={`mailto:${EMAIL}`} className="text-gold underline">{EMAIL}</a>.</p>
                </div>
              ),
            },
            {
              title: '8. Children\'s Privacy',
              content: (
                <p className="text-white/60 text-[15px] leading-[1.85]">
                  Our Site is not directed to children under the age of 13. We do not knowingly
                  collect personal information from children under 13. If you believe we have
                  inadvertently collected information from a child under 13, please contact us
                  immediately and we will take steps to delete such information.
                </p>
              ),
            },
            {
              title: '9. Changes to This Policy',
              content: (
                <p className="text-white/60 text-[15px] leading-[1.85]">
                  We may update this Privacy Policy from time to time. We will notify you of any
                  changes by posting the new policy on this page with an updated "Last updated" date.
                  Your continued use of the Site after any changes constitutes your acceptance of
                  the updated policy.
                </p>
              ),
            },
            {
              title: '10. Contact Us',
              content: (
                <p className="text-white/60 text-[15px] leading-[1.85]">
                  If you have questions about this Privacy Policy, please contact us at{' '}
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
            <Link href="/terms" className="font-mono text-[11px] text-gold hover:opacity-75 transition-opacity">Terms of Use →</Link>
            <Link href="/disclosures" className="font-mono text-[11px] text-gold hover:opacity-75 transition-opacity">Affiliate Disclosures →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
