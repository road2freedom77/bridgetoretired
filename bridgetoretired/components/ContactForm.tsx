'use client'

import { useState } from 'react'

const SUBJECTS = [
  'General Question',
  'Calculator Error',
  'Feature Request',
  'Pro Subscription',
  'Partnership / Media',
  'Other',
]

type Status = 'idle' | 'sending' | 'success' | 'error'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit() {
    if (!name || !email || !subject || !message) {
      setErrorMsg('All fields are required.')
      return
    }
    setErrorMsg('')
    setStatus('sending')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong.')
        setStatus('error')
      } else {
        setStatus('success')
      }
    } catch {
      setErrorMsg('Failed to send. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-ink border border-emerald-500/20 rounded-xl p-10 text-center">
        <div className="text-4xl mb-4">✓</div>
        <h2 className="font-syne font-bold text-[20px] text-white mb-2">Message sent</h2>
        <p className="font-mono text-[13px] text-white/45 leading-relaxed">
          Thanks for reaching out. We'll get back to you at <span className="text-white/70">{email}</span>.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-ink border border-white/[0.07] rounded-xl p-6 md:p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Name */}
        <div>
          <label className="font-mono text-[9px] tracking-widest uppercase text-white/35 block mb-1.5">
            Your Name
          </label>
          <input
            type="text"
            placeholder="Jane Smith"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-black border border-white/[0.08] rounded-lg px-3 py-2.5 font-mono text-[13px] text-white placeholder:text-white/20 outline-none focus:border-gold/40 transition-colors"
          />
        </div>

        {/* Email */}
        <div>
          <label className="font-mono text-[9px] tracking-widest uppercase text-white/35 block mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-black border border-white/[0.08] rounded-lg px-3 py-2.5 font-mono text-[13px] text-white placeholder:text-white/20 outline-none focus:border-gold/40 transition-colors"
          />
        </div>
      </div>

      {/* Subject */}
      <div className="mb-4">
        <label className="font-mono text-[9px] tracking-widest uppercase text-white/35 block mb-1.5">
          Subject
        </label>
        <select
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className="w-full bg-black border border-white/[0.08] rounded-lg px-3 py-2.5 font-mono text-[13px] text-white outline-none focus:border-gold/40 transition-colors appearance-none"
        >
          <option value="" disabled>— Select a topic —</option>
          {SUBJECTS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div className="mb-6">
        <label className="font-mono text-[9px] tracking-widest uppercase text-white/35 block mb-1.5">
          Message
        </label>
        <textarea
          rows={6}
          placeholder="Tell us what's on your mind..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="w-full bg-black border border-white/[0.08] rounded-lg px-3 py-2.5 font-mono text-[13px] text-white placeholder:text-white/20 outline-none focus:border-gold/40 transition-colors resize-y"
        />
      </div>

      {/* Error */}
      {(status === 'error' || errorMsg) && (
        <p className="font-mono text-[11px] text-red-400 mb-4">{errorMsg}</p>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={status === 'sending'}
        className="w-full bg-gold text-navy font-syne font-bold text-[14px] py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {status === 'sending' ? 'Sending…' : 'Send Message →'}
      </button>

      <p className="font-mono text-[10px] text-white/20 text-center mt-4">
        We typically respond within 1–2 business days.
      </p>
    </div>
  )
}