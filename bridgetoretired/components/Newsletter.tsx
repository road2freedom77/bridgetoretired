'use client'
import { useState } from 'react'

export function Newsletter() {
  const [email,   setEmail]   = useState('')
  const [status,  setStatus]  = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage('Check your inbox — your planner is on its way!')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  return (
    <section id="download" className="py-24 px-5 bg-navy relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,rgba(232,184,75,0.04),transparent)]" />
      </div>

      <div className="relative z-10 max-w-[560px] mx-auto text-center">
        <div className="flex items-center justify-center gap-3 font-mono text-[10px] tracking-[0.24em] uppercase text-gold mb-5">
          <span className="block w-6 h-px bg-gold" />
          Free Download
          <span className="block w-6 h-px bg-gold" />
        </div>

        <h2 className="font-syne font-bold text-[clamp(28px,3.5vw,42px)] tracking-tight text-white mb-4">
          Get the Bridge Planner
        </h2>
        <p className="text-white/55 text-[15px] leading-relaxed mb-8">
          The spreadsheet that maps your Taxable → 401k → Roth withdrawal strategy year-by-year.
          Free. Yours forever.
        </p>

        {/* File preview */}
        <div className="bg-ink border border-white/[0.07] rounded-xl p-5 mb-7 text-left flex items-center gap-4">
          <div className="w-13 h-13 bg-gold/10 border border-gold/25 rounded-lg flex items-center justify-center text-2xl shrink-0 w-12 h-12">
            📋
          </div>
          <div>
            <div className="font-syne font-semibold text-[14px] text-white mb-1">
              Early Retirement Bridge Planner v1.xlsx
            </div>
            <div className="font-mono text-[10px] text-white/30 leading-relaxed">
              6 sheets · Multi-account modeling · Inflation-adjusted · Bridge + Post-59½ + Full projection
            </div>
          </div>
        </div>

        {status === 'success' ? (
          <div className="bg-sage/10 border border-sage/25 rounded-xl px-6 py-5">
            <div className="text-2xl mb-2">✓</div>
            <div className="font-syne font-semibold text-white mb-1">You're in!</div>
            <div className="font-mono text-[12px] text-white/50">{message}</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2.5">
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={status === 'loading'}
              className="flex-1 bg-ink border border-white/[0.08] rounded px-4 py-3.5 
                         font-mono text-[13px] text-white placeholder:text-white/25
                         focus:border-gold/40 focus:outline-none transition-colors
                         disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-gold text-black font-syne font-semibold text-[12px] 
                         tracking-wide px-5 py-3.5 rounded hover:opacity-85 
                         transition-opacity disabled:opacity-50 whitespace-nowrap"
            >
              {status === 'loading' ? 'Sending…' : 'Send My Planner'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="font-mono text-[11px] text-red-400 mt-3">{message}</p>
        )}

        <p className="font-mono text-[10px] text-white/25 mt-4">
          No spam. Unsubscribe anytime. We will never sell your data.
        </p>
      </div>
    </section>
  )
}
