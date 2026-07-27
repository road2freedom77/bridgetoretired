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
import FinanceTable               from '@/components/FinanceTable'

// ── Zero-prop tool embeds ─────────────────────────────────────────────────────
const EMBED_MAP: Record<string, React.ComponentType> = {
  'roth-ladder-builder':  RothLadderBuilder,
  'sepp-calculator':      SEPPCalculator,
  'sequence-of-returns':  SequenceOfReturnsSimulator,
  'social-security':      SocialSecurityCalculator,
  'tax-bracket':          TaxBracketVisualizer,
  'taxable-bridge':       TaxableBrokerageAnalyzer,
  'withdrawal-optimizer': WithdrawalOrderOptimizer,
  'bridge-strategy':      BridgeStrategyVisualizer,
  'fire-number':          FIRENumberCalculator,
  'aca-estimator':        ACASubsidyEstimator,
}

// ── Token regexes ─────────────────────────────────────────────────────────────
const TOOL_REGEX  = /\[\[tool:([a-z0-9-]+)\]\]/
const TABLE_REGEX = /\[\[table:(\{[\s\S]*?\})\]\]/
// [[image:filename.ext]] or [[image:filename.ext|Optional caption]]
const IMAGE_REGEX = /\[\[image:([^\]|]+)(?:\|([^\]]*))?\]\]/

// Combined splitter
const TOKEN_REGEX = /(\[\[tool:[a-z0-9-]+\]\]|\[\[table:\{[\s\S]*?\}\]\]|\[\[image:[^\]]+\]\])/g

// ── Segment types ─────────────────────────────────────────────────────────────
interface Segment {
  type: 'markdown' | 'tool' | 'table' | 'image'
  content: string
  caption?: string
}

function parseSegments(content: string): Segment[] {
  const segments: Segment[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  TOKEN_REGEX.lastIndex = 0
  while ((match = TOKEN_REGEX.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'markdown', content: content.slice(lastIndex, match.index) })
    }

    const token = match[1]
    const toolMatch  = token.match(TOOL_REGEX)
    const tableMatch = token.match(TABLE_REGEX)
    const imageMatch = token.match(IMAGE_REGEX)

    if (toolMatch)  segments.push({ type: 'tool',  content: toolMatch[1] })
    if (tableMatch) segments.push({ type: 'table', content: tableMatch[1] })
    if (imageMatch) segments.push({
      type: 'image',
      content: imageMatch[1].trim(),
      caption: imageMatch[2]?.trim() || undefined,
    })

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < content.length) {
    segments.push({ type: 'markdown', content: content.slice(lastIndex) })
  }

  return segments
}

// ── react-markdown component overrides ───────────────────────────────────────
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
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-6 rounded-lg border border-white/10">
      <table className="w-full text-left border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="bg-white/[0.04]">{children}</thead>
  ),
  th: ({ children }: any) => (
    <th className="px-4 py-3 font-syne text-[13px] font-semibold text-white border-b border-white/10 whitespace-nowrap">{children}</th>
  ),
  td: ({ children }: any) => (
    <td className="px-4 py-3 text-[13px] text-white/70 border-b border-white/[0.05] align-top">{children}</td>
  ),
  tr: ({ children }: any) => (
    <tr className="hover:bg-white/[0.02] transition-colors">{children}</tr>
  ),
}

// ── Main renderer ─────────────────────────────────────────────────────────────
interface BlogRendererProps {
  content: string
}

export default function BlogRenderer({ content }: BlogRendererProps) {
  const segments = parseSegments(content)

  return (
    <div className="prose-dark">
      {segments.map((segment, i) => {

        // Zero-prop tool embed
        if (segment.type === 'tool') {
          const Component = EMBED_MAP[segment.content]
          if (!Component) {
            console.warn(`BlogRenderer: unknown tool token "${segment.content}"`)
            return null
          }
          return <Component key={i} />
        }

        // FinanceTable embed — supports two formats:
        // 1. {columns: [{key, header}], rows: [{key: value}]} — original FinanceTable format
        // 2. {headers: [string], rows: [[string]]}            — simpler GPT-friendly format
        if (segment.type === 'table') {
          try {
            const props = JSON.parse(segment.content)

            // Normalize headers/rows array format → columns/rows object format
            if (Array.isArray(props.headers)) {
              const columns = props.headers.map((h: string, idx: number) => ({
                key:    `col${idx}`,
                header: h,
              }))
              const rows = (props.rows as string[][]).map((row: string[]) => {
                const obj: Record<string, string> = {}
                columns.forEach((col: { key: string }, idx: number) => {
                  obj[col.key] = row[idx] ?? ''
                })
                return obj
              })
              return (
                <FinanceTable
                  key={i}
                  columns={columns}
                  rows={rows}
                  caption={props.caption}
                />
              )
            }

            // Original columns/rows format
            return (
              <FinanceTable
                key={i}
                columns={props.columns}
                rows={props.rows}
                caption={props.caption}
              />
            )
          } catch (e) {
            console.warn(`BlogRenderer: invalid table JSON at segment ${i}`, e)
            return null
          }
        }

        // Image embed — resolves from /public/images/
        if (segment.type === 'image') {
          return (
            <figure key={i} className="my-8">
              <img
                src={`/images/${segment.content}`}
                alt={segment.caption || ''}
                className="w-full rounded-xl border border-white/10"
              />
              {segment.caption && (
                <figcaption className="mt-3 text-center font-mono text-[11px] tracking-wide text-white/35">
                  {segment.caption}
                </figcaption>
              )}
            </figure>
          )
        }

        // Markdown
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