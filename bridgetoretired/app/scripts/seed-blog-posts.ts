import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local', override: true })

const SUPABASE_URL = 'https://orusctsalixusnvqstxt.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts')

// Skip these — not blog posts
const SKIP_FILES = ['ACASubsidyEstimator.tsx', 'RothLadderBuilder.tsx']

function parseFrontmatter(raw: string): { frontmatter: Record<string, any>; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return { frontmatter: {}, content: raw }

  const yamlBlock = match[1]
  const content = match[2].trim()

  const frontmatter: Record<string, any> = {}
  for (const line of yamlBlock.split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim()
    let value = line.slice(colonIdx + 1).trim()
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    // Boolean
    if (value === 'true') frontmatter[key] = true
    else if (value === 'false') frontmatter[key] = false
    else frontmatter[key] = value
  }

  return { frontmatter, content }
}

function transformContent(content: string): string {
  // Replace <RothLadderBuilder /> with embed token
  content = content.replace(/<RothLadderBuilder\s*\/>/g, '[[tool:roth-ladder-builder]]')
  // Replace any other component embeds if present
  content = content.replace(/<SEPPCalculator\s*\/>/g, '[[tool:sepp-calculator]]')
  content = content.replace(/<SequenceOfReturnsSimulator\s*\/>/g, '[[tool:sequence-of-returns]]')
  content = content.replace(/<SocialSecurityCalculator\s*\/>/g, '[[tool:social-security]]')
  content = content.replace(/<TaxBracketVisualizer\s*\/>/g, '[[tool:tax-bracket]]')
  content = content.replace(/<TaxableBrokerageAnalyzer\s*\/>/g, '[[tool:taxable-bridge]]')
  content = content.replace(/<WithdrawalOrderOptimizer\s*\/>/g, '[[tool:withdrawal-optimizer]]')
  content = content.replace(/<BridgeStrategyVisualizer\s*\/>/g, '[[tool:bridge-strategy]]')
  content = content.replace(/<FIRENumberCalculator\s*\/>/g, '[[tool:fire-number]]')
  content = content.replace(/<ACASubsidyEstimator\s*\/>/g, '[[tool:aca-estimator]]')
  return content
}

function slugFromFilename(filename: string): string {
  return filename.replace(/\.mdx$/, '')
}

async function main() {
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.mdx') && !SKIP_FILES.includes(f))
  console.log(`Found ${files.length} MDX files to seed\n`)

  let inserted = 0
  let skipped = 0
  let errors = 0

  for (const file of files) {
    const slug = slugFromFilename(file)
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8')
    const { frontmatter, content } = parseFrontmatter(raw)
    const transformedContent = transformContent(content)

    // Parse published_at from frontmatter date field
    const dateStr = frontmatter.date || frontmatter.publishedAt || frontmatter.published_at
    const published_at = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString()

    const record = {
      slug,
      title: frontmatter.title || slug,
      description: frontmatter.description || null,
      category: frontmatter.category || null,
      read_time: frontmatter.readTime || frontmatter.read_time || null,
      featured: frontmatter.featured === true,
      published: true,
      published_at,
      updated_at: new Date().toISOString(),
      content: transformedContent,
    }

    const { error } = await supabase
      .from('blog_posts')
      .upsert(record, { onConflict: 'slug' })

    if (error) {
      console.error(`❌ ${file}: ${error.message}`)
      errors++
    } else {
      console.log(`✓ ${slug}`)
      inserted++
    }
  }

  console.log(`\nDone — ${inserted} upserted, ${skipped} skipped, ${errors} errors`)
}

main()