import { Suspense } from 'react'
import type { Metadata } from 'next'
import ContactForm from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'Contact | BridgeToRetired',
  description: 'Have a question, found an error, or want to share feedback? Get in touch with the BridgeToRetired team.',
  alternates: { canonical: 'https://bridgetoretired.com/contact' },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="bg-navy border-b border-white/[0.06]">
        <div className="max-w-2xl mx-auto px-5 pt-12 pb-10">
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-3">Get In Touch</div>
          <h1 className="font-syne font-bold text-[clamp(26px,4vw,42px)] tracking-tight text-white leading-tight mb-3">
            Contact Us
          </h1>
          <p className="text-white/50 text-[15px] leading-relaxed">
            Have a question, found an error in a calculator, or just want to say hello? We'd love to hear from you.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-12">
        <Suspense fallback={null}>
          <ContactForm />
        </Suspense>
      </div>
    </div>
  )
}