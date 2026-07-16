'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import SequenceOfReturnsSimulator from '@/components/SequenceOfReturnsSimulator'
import BridgeStrategyVisualizer   from '@/components/BridgeStrategyVisualizer'
import RothLadderBuilder          from '@/components/RothLadderBuilder'
import ACASubsidyEstimator        from '@/components/ACASubsidyEstimator'
import SocialSecurityCalculator   from '@/components/SocialSecurityCalculator'
import FIRENumberCalculator       from '@/components/FIRENumberCalculator'
import WithdrawalOrderOptimizer   from '@/components/WithdrawalOrderOptimizer'
import TaxBracketVisualizer       from '@/components/TaxBracketVisualizer'
import TaxableBrokerageAnalyzer   from '@/components/TaxableBrokerageAnalyzer'
import SEPPCalculator             from '@/components/SEPPCalculator'
const EMBED_MAP: Record<string, React.ComponentType> = {
  'roth-ladder-builder':      RothLadderBuilder,
  'sepp-calculator':          SEPPCalculator,
  'sequence-of-returns':      SequenceOfReturnsSimulator,
  'social-security':          SocialSecurityCalculator,
  'tax-bracket':              TaxBracketVisualizer,
  'taxable-bridge':           TaxableBrokerageAnalyzer,
  'withdrawal-optimizer':     WithdrawalOrderOptimizer,
  'bridge-strategy':          BridgeStrategyVisualizer,
  'fire-number':              FIRENumberCalculator,
  'aca-estimator':            ACASubsidyEstimator,
}

// Regex to match [[tool:component-name]] tokens on their own line
const EMBED_REGEX = /\[\[tool:([a-z0-9-]+)\]\]/g

interface Segment {
  type: 'markdown' | 'embed'
  content: string
}

function parseSegments(content: string): Segment[] {
  const segments: Segment[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  EMBED_REGEX.lastIndex = 0
  while ((match = EMBED_REGEX.exec(content)) !== null) {
    // Markdown before this embed
    if (match.index > lastIndex) {
      segments.push({ type: 'markdown', content: content.slice(lastIndex, match.index) })
    }
    segments.push({ type: 'embed', content: match[1] })
    lastIndex = match.index + match[0].length
  }

  // Remaining markdown after last embed
  if (lastIndex < content.length) {
    segments.push({ type: 'markdown', content: content.slice(lastIndex) })
  }

  return segments
}

// react-markdown component overrides to apply prose-dark styles
const mdComponents = {
  h2: ({ children }: any) => (
    <h2 className="font-syne text-2xl font-bold text-white mt-10 mb-4 tracking-tight">{children}</h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="font-syne text-xl font-semibold text-white mt-8 mb-3 tracking-tight">{children}</h3>
  ),
  p: ({ children }: any) => (
    <p className="mb-5 text-base text-white/75 leading-relaxed">{children}</p>
  ),
  a: ({ href, children }: any) => (
    <a href={href} className="text-gold underline underline-offset-4 hover:opacity-80 transition-opacity">{children}</a>
  ),
  ul: ({ children }: any) => (
    <ul className="list-disc pl-6 mb-5 space-y-2 text-white/75">{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal pl-6 mb-5 space-y-2 text-white/75">{children}</ol>
  ),
  li: ({ children }: any) => (
    <li className="leading-relaxed">{children}</li>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-2 border-gold pl-5 italic text-white/60 my-6">{children}</blockquote>
  ),
  code: ({ children, className }: any) => {
    // Block code (has language class) vs inline code
    const isBlock = className?.startsWith('language-')
    if (isBlock) {
      return (
        <pre className="bg-white/5 border border-white/10 rounded-lg p-4 overflow-x-auto mb-5">
          <code className="font-mono text-sm text-white/80">{children}</code>
        </pre>
      )
    }
    return (
      <code className="font-mono text-sm bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">{children}</code>
    )
  },
  strong: ({ children }: any) => (
    <strong className="text-white font-semibold">{children}</strong>
  ),
  hr: () => (
    <hr className="border-white/10 my-8" />
  ),
}

interface BlogRendererProps {
  content: string
}

export default function BlogRenderer({ content }: BlogRendererProps) {
  const segments = parseSegments(content)

  return (
    <div className="prose-dark">
      {segments.map((segment, i) => {
        if (segment.type === 'embed') {
          const Component = EMBED_MAP[segment.content]
          if (!Component) {
            console.warn(`BlogRenderer: unknown embed token "${segment.content}"`)
            return null
          }
          return <Component key={i} />
        }

        return (
          <ReactMarkdown
            key={i}
            remarkPlugins={[remarkGfm]}
            components={mdComponents}
          >
            {segment.content}
          </ReactMarkdown>
        )
      })}
    </div>
  )
}