import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-5 relative overflow-hidden">

      {/* Background grid */}
      <div className="absolute inset-0 bg-grid opacity-100" />

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gold/[0.04] blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 text-center max-w-lg">

        {/* 404 number */}
        <div className="font-syne font-extrabold text-[clamp(80px,18vw,160px)] leading-none tracking-tight text-white/[0.04] select-none mb-0">
          404
        </div>

        {/* Icon */}
        <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-gold/60 -mt-6 mb-8">
          Bridge Not Found
        </div>

        <h1 className="font-syne font-bold text-[clamp(24px,4vw,38px)] tracking-tight text-white leading-tight mb-4">
          This page retired early.
        </h1>

        <p className="text-white/40 text-[15px] leading-relaxed mb-10 font-lora">
          The page you're looking for doesn't exist — or it moved without telling anyone.
          Happens to the best bridges.
        </p>

        {/* Links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="font-syne font-semibold text-[13px] bg-gold text-black px-6 py-3 rounded hover:opacity-85 transition-opacity"
          >
            Back to Home
          </Link>
          <Link
            href="/blog"
            className="font-mono text-[11px] tracking-widest uppercase text-white/35 hover:text-white/70 transition-colors px-6 py-3 border border-white/[0.08] rounded hover:border-white/20"
          >
            Read the Blog
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-12 pt-8 border-t border-white/[0.06]">
          <div className="font-mono text-[9px] tracking-widest uppercase text-white/20 mb-5">Popular pages</div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {[
              { href: '/blog/what-is-retirement-bridge-strategy', label: 'Bridge Strategy' },
              { href: '/blog/how-much-to-retire-at-50', label: 'Retire at 50' },
              { href: '/blog/roth-conversion-ladder-guide', label: 'Roth Ladder' },
              { href: '/blog/zero-tax-early-retirement', label: 'Zero Tax' },
              { href: '/#download', label: 'Free Planner' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="font-mono text-[10px] tracking-wider text-gold/50 hover:text-gold transition-colors"
              >
                {label} →
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
