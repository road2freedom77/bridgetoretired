'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { FLAGS } from '@/lib/feature-flags'
import { useAuth, useUser, SignOutButton } from '@clerk/nextjs'

export function Nav() {
  const [open, setOpen] = useState(false)
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const isPro = (user?.publicMetadata as any)?.isPro === true

  return (
    <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-5 h-[60px] flex items-center justify-between">
        <Link href="/" className="font-syne font-bold text-[18px] text-white tracking-tight">
          Bridge<span className="text-gold">ToRetired</span>
        </Link>
        {/* Desktop */}
        <ul className="hidden md:flex items-center gap-7">
          {[
            { href: '/#how',        label: 'How It Works' },
            { href: '/#calculator', label: 'Calculator'   },
            { href: '/blog',        label: 'Blog'         },
            { href: '/#tools',      label: 'Tools'        },
          ].map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="font-mono text-[11px] tracking-widest uppercase text-white/40 hover:text-white/80 transition-colors"
              >
                {label}
              </Link>
            </li>
          ))}
          {FLAGS.PRO_ENABLED && (
            <li>
              <Link
                href={isPro ? '/pro-welcome' : '/pricing'}
                className="font-mono text-[11px] tracking-widest uppercase text-gold/70 hover:text-gold transition-colors flex items-center gap-1.5"
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold/60" />
                {isPro ? 'Pro ✓' : 'Pro'}
              </Link>
            </li>
          )}
          {isSignedIn ? (
            <li>
              <SignOutButton redirectUrl="/">
                <button className="font-mono text-[11px] tracking-widest uppercase text-white/30 hover:text-white/60 transition-colors">
                  Sign Out
                </button>
              </SignOutButton>
            </li>
          ) : null}
          <li>
            <Link
              href="/#download"
              className="font-syne font-semibold text-[12px] bg-gold text-black px-4 py-2 rounded hover:opacity-85 transition-opacity"
            >
              Free Planner ↓
            </Link>
          </li>
        </ul>
        {/* Mobile toggle */}
        <button
          className="md:hidden text-white/60"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-ink border-t border-white/[0.06] px-5 py-4 flex flex-col gap-4">
          {[
            { href: '/#how',        label: 'How It Works' },
            { href: '/#calculator', label: 'Calculator'   },
            { href: '/blog',        label: 'Blog'         },
            { href: '/#tools',      label: 'Tools'        },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="font-mono text-[12px] tracking-wider uppercase text-white/50 hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
          {FLAGS.PRO_ENABLED && (
            <Link
              href={isPro ? '/pro-welcome' : '/pricing'}
              onClick={() => setOpen(false)}
              className="font-mono text-[12px] tracking-wider uppercase text-gold/70 hover:text-gold transition-colors flex items-center gap-2"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold/60" />
              {isPro ? 'Pro ✓' : 'Pro — $9/mo'}
            </Link>
          )}
          {isSignedIn && (
            <SignOutButton redirectUrl="/">
              <button
                onClick={() => setOpen(false)}
                className="font-mono text-[12px] tracking-wider uppercase text-white/30 hover:text-white/60 transition-colors text-left"
              >
                Sign Out
              </button>
            </SignOutButton>
          )}
          <Link
            href="/#download"
            onClick={() => setOpen(false)}
            className="font-syne font-semibold text-[13px] bg-gold text-black px-4 py-2.5 rounded text-center"
          >
            Free Planner ↓
          </Link>
        </div>
      )}
    </nav>
  )
}
