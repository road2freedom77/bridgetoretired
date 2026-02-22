import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkHtml from 'remark-html'

const postsDir = path.join(process.cwd(), 'content/posts')

export interface Post {
  slug:        string
  title:       string
  description: string
  date:        string
  category:    string
  readTime:    string
  featured:    boolean
  content?:    string
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(postsDir)) return []
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'))
  return files
    .map(filename => {
      const slug = filename.replace(/\.mdx?$/, '')
      const raw  = fs.readFileSync(path.join(postsDir, filename), 'utf8')
      const { data } = matter(raw)
      return {
        slug,
        title:       data.title       ?? 'Untitled',
        description: data.description ?? '',
        date:        data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
        category:    data.category    ?? 'General',
        readTime:    data.readTime    ?? '5 min read',
        featured:    data.featured    ?? false,
      } as Post
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const extensions = ['.md', '.mdx']
  let raw = ''
  let found = false

  for (const ext of extensions) {
    const filePath = path.join(postsDir, `${slug}${ext}`)
    if (fs.existsSync(filePath)) {
      raw = fs.readFileSync(filePath, 'utf8')
      found = true
      break
    }
  }

  if (!found) return null

  const { data, content } = matter(raw)
  const processed = await remark().use(remarkHtml).process(content)

  return {
    slug,
    title:       data.title       ?? 'Untitled',
    description: data.description ?? '',
    date:        data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    category:    data.category    ?? 'General',
    readTime:    data.readTime    ?? '5 min read',
    featured:    data.featured    ?? false,
    content:     processed.toString(),
  }
}
