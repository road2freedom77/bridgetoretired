// lib/blog-faq.ts
// Extracts FAQ items from blog content for FAQPage structured data (schema.org).
// Used by app/blog/[slug]/page.tsx to emit JSON-LD on both Supabase and
// contentlayer posts. Hybrid strategy: curated frontmatter `faq` wins when
// present; otherwise FAQs are auto-extracted from the markdown's
// "## Frequently Asked Questions" section (### question + answer paragraphs).

export interface FaqItem {
  question: string
  answer: string
}

// Strip markdown syntax + custom embed tokens so answers are plain text
function cleanAnswer(md: string): string {
  return md
    // Drop custom embeds entirely: [[tool:...]], [[table:...]], [[image:...]]
    .replace(/\[\[(tool|table|image):[\s\S]*?\]\]/g, '')
    // Drop blockquote CTA lines (start with >)
    .replace(/^\s*>.*$/gm, '')
    // Links: [text](url) → text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    // Bold/italic markers
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    // Inline code
    .replace(/`([^`]+)`/g, '$1')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Auto-extract FAQ items from markdown content.
 * Looks for a "## Frequently Asked Questions" section containing
 * "### question" headings; the text under each heading (until the next
 * ### or ## heading) is the answer.
 * Returns [] if no FAQ section or fewer than 2 valid items.
 */
export function extractFaqFromMarkdown(content: string): FaqItem[] {
  // Find the FAQ section: from "## Frequently Asked Questions" to next "## " or end
  const sectionMatch = content.match(
    /^##\s+Frequently Asked Questions\s*$([\s\S]*?)(?=^##\s|(?![\s\S]))/m
  )
  if (!sectionMatch) return []

  const section = sectionMatch[1]

  // Split into "### question" blocks
  const blocks = section.split(/^###\s+/m).slice(1) // slice(1): drop pre-heading text
  const items: FaqItem[] = []

  for (const block of blocks) {
    const newlineIdx = block.indexOf('\n')
    if (newlineIdx === -1) continue
    const question = block.slice(0, newlineIdx).trim()
    const answer = cleanAnswer(block.slice(newlineIdx + 1))
    if (question && answer.length >= 20) {
      items.push({ question, answer })
    }
  }

  return items.length >= 2 ? items : []
}

/**
 * Resolve final FAQ list: curated frontmatter list wins if valid,
 * else auto-extract from content. Returns [] when neither yields ≥2 items.
 */
export function resolveFaq(
  frontmatterFaq: FaqItem[] | undefined | null,
  content: string
): FaqItem[] {
  if (Array.isArray(frontmatterFaq)) {
    const valid = frontmatterFaq.filter(
      f => f?.question?.trim() && f?.answer?.trim()
    )
    if (valid.length >= 2) return valid
  }
  return extractFaqFromMarkdown(content)
}

/** Build the schema.org FAQPage object, or null if no FAQs. */
export function buildFaqSchema(faqs: FaqItem[]): object | null {
  if (faqs.length < 2) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}