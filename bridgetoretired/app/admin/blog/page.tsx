'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const ADMIN_USER_ID = 'user_3Ev0Q9ORn9oZwaXGROJq4bniaBI'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Post {
  id: string
  slug: string
  title: string
  description: string
  category: string
  read_time: string
  featured: boolean
  published: boolean
  published_at: string
  updated_at: string
  content: string
}

const EMPTY_POST: Omit<Post, 'id' | 'updated_at'> = {
  slug: '',
  title: '',
  description: '',
  category: '',
  read_time: '',
  featured: false,
  published: false,
  published_at: new Date().toISOString().slice(0, 16),
  content: '',
}

const CATEGORIES = [
  'Bridge Strategy',
  'Tax Strategy',
  'Roth Conversions',
  'Healthcare',
  'Social Security',
  'Sequence Risk',
  'FIRE Planning',
  'Tools & Calculators',
]

const TOOL_TOKENS = [
  { label: 'Roth Ladder Builder',       token: '[[tool:roth-ladder-builder]]' },
  { label: 'SEPP Calculator',           token: '[[tool:sepp-calculator]]' },
  { label: 'Sequence of Returns',       token: '[[tool:sequence-of-returns]]' },
  { label: 'Social Security Calc',      token: '[[tool:social-security]]' },
  { label: 'Tax Bracket Visualizer',    token: '[[tool:tax-bracket]]' },
  { label: 'Taxable Bridge Analyzer',   token: '[[tool:taxable-bridge]]' },
  { label: 'Withdrawal Optimizer',      token: '[[tool:withdrawal-optimizer]]' },
  { label: 'Bridge Strategy Visualizer',token: '[[tool:bridge-strategy]]' },
  { label: 'FIRE Number Calculator',    token: '[[tool:fire-number]]' },
  { label: 'ACA Subsidy Estimator',     token: '[[tool:aca-estimator]]' },
]

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  page:     { background: '#0D1420', minHeight: '100vh', fontFamily: "'IBM Plex Mono', monospace", padding: '0 0 80px' },
  header:   { background: '#141C28', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title:    { color: '#E8B84B', fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const },
  body:     { maxWidth: 1100, margin: '0 auto', padding: '32px 24px' },
  card:     { background: '#141C28', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px 24px', marginBottom: 16 },
  label:    { display: 'block', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.35)', marginBottom: 6 },
  input:    { width: '100%', background: '#0D1420', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const },
  textarea: { width: '100%', background: '#0D1420', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 14px', color: '#fff', fontSize: 12, fontFamily: 'monospace', outline: 'none', resize: 'vertical' as const, boxSizing: 'border-box' as const, lineHeight: 1.6 },
  select:   { width: '100%', background: '#0D1420', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 13, fontFamily: 'inherit', outline: 'none' },
  btnGold:  { background: '#E8B84B', color: '#0D1420', border: 'none', borderRadius: 8, padding: '10px 22px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  btnGhost: { background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 16px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' },
  btnRed:   { background: 'rgba(248,113,113,0.1)', color: '#F87171', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '8px 16px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' },
  tag:      (published: boolean) => ({
    display: 'inline-block', fontSize: 8, letterSpacing: 1, textTransform: 'uppercase' as const,
    padding: '2px 8px', borderRadius: 4,
    background: published ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.06)',
    color: published ? '#4ADE80' : 'rgba(255,255,255,0.35)',
    border: `1px solid ${published ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.1)'}`,
  }),
}

export default function AdminBlogPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  const [posts, setPosts] = useState<Post[]>([])
  const [view, setView] = useState<'list' | 'edit'>('list')
  const [editing, setEditing] = useState<Partial<Post> & { id?: string }>(EMPTY_POST)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isLoaded && user?.id !== ADMIN_USER_ID) {
      router.replace('/')
    }
  }, [isLoaded, user, router])

  // ── Load posts ──────────────────────────────────────────────────────────────
  const loadPosts = useCallback(async () => {
    const { data } = await supabase
      .from('blog_posts')
      .select('id, slug, title, category, published, published_at, featured, read_time, description, updated_at, content')
      .order('published_at', { ascending: false })
    setPosts(data ?? [])
  }, [])

  useEffect(() => { loadPosts() }, [loadPosts])

  // ── Toast ───────────────────────────────────────────────────────────────────
  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // ── New post ────────────────────────────────────────────────────────────────
  function handleNew() {
    setEditing({ ...EMPTY_POST, published_at: new Date().toISOString().slice(0, 16) })
    setView('edit')
  }

  // ── Edit post ───────────────────────────────────────────────────────────────
  function handleEdit(post: Post) {
    setEditing({
      ...post,
      published_at: post.published_at?.slice(0, 16) ?? new Date().toISOString().slice(0, 16),
    })
    setView('edit')
  }

  // ── Save post ───────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!editing.slug || !editing.title || !editing.content) {
      showToast('⚠ Slug, title, and content are required')
      return
    }
    setSaving(true)
    const record = {
      slug:         editing.slug!.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      title:        editing.title!,
      description:  editing.description || null,
      category:     editing.category || null,
      read_time:    editing.read_time || null,
      featured:     editing.featured ?? false,
      published:    editing.published ?? false,
      published_at: editing.published_at ? new Date(editing.published_at).toISOString() : new Date().toISOString(),
      updated_at:   new Date().toISOString(),
      content:      editing.content!,
    }

    let error
    if (editing.id) {
      ;({ error } = await supabase.from('blog_posts').update(record).eq('id', editing.id))
    } else {
      ;({ error } = await supabase.from('blog_posts').insert(record))
    }

    setSaving(false)
    if (error) {
      showToast(`❌ ${error.message}`)
    } else {
      showToast(editing.id ? '✓ Post updated' : '✓ Post created')
      await loadPosts()
      setView('list')
    }
  }

  // ── Delete post ─────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    if (!confirm('Delete this post? This cannot be undone.')) return
    setDeleting(id)
    const { error } = await supabase.from('blog_posts').delete().eq('id', id)
    setDeleting(null)
    if (error) showToast(`❌ ${error.message}`)
    else { showToast('✓ Post deleted'); await loadPosts() }
  }

  // ── Toggle published ────────────────────────────────────────────────────────
  async function togglePublished(post: Post) {
    const { error } = await supabase
      .from('blog_posts')
      .update({ published: !post.published, updated_at: new Date().toISOString() })
      .eq('id', post.id)
    if (!error) { showToast(`✓ ${!post.published ? 'Published' : 'Unpublished'}`); await loadPosts() }
  }

  // ── Insert token into content ────────────────────────────────────────────────
  function insertToken(token: string) {
    setEditing(e => ({ ...e, content: (e.content ?? '') + '\n\n' + token + '\n\n' }))
  }

  if (!isLoaded || user?.id !== ADMIN_USER_ID) return null

  const filtered = posts.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.slug?.toLowerCase().includes(search.toLowerCase())
  )

  // ── LIST VIEW ───────────────────────────────────────────────────────────────
  if (view === 'list') return (
    <div style={S.page}>
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: '#141C28', border: '1px solid rgba(232,184,75,0.3)', borderRadius: 8, padding: '10px 18px', color: '#E8B84B', fontSize: 12, zIndex: 9999 }}>
          {toast}
        </div>
      )}
      <div style={S.header}>
        <span style={S.title}>Blog Admin</span>
        <button style={S.btnGold} onClick={handleNew}>+ New Post</button>
      </div>
      <div style={S.body}>
        <div style={{ marginBottom: 20 }}>
          <input
            placeholder="Search posts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...S.input, maxWidth: 360 }}
          />
        </div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
          {filtered.length} post{filtered.length !== 1 ? 's' : ''}
        </div>
        {filtered.map(post => (
          <div key={post.id} style={{ ...S.card, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' as const }}>
                <span style={S.tag(post.published)}>{post.published ? 'Published' : 'Draft'}</span>
                {post.featured && <span style={{ fontSize: 8, color: '#E8B84B', letterSpacing: 1 }}>★ Featured</span>}
                {post.category && <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{post.category}</span>}
              </div>
              <div style={{ fontSize: 14, color: '#fff', fontWeight: 600, marginBottom: 4, fontFamily: 'Georgia, serif' }}>
                {post.title}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>
                /{post.slug} · {post.read_time} · {new Date(post.published_at).toLocaleDateString()}
              </div>
              {post.description && (
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                  {post.description.slice(0, 120)}{post.description.length > 120 ? '...' : ''}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' as const }}>
              <button style={S.btnGhost} onClick={() => handleEdit(post)}>Edit</button>
              <button style={S.btnGhost} onClick={() => togglePublished(post)}>
                {post.published ? 'Unpublish' : 'Publish'}
              </button>
              <a
                href={`/blog/${post.slug}`}
                target="_blank"
                rel="noreferrer"
                style={{ ...S.btnGhost, textDecoration: 'none', display: 'inline-block' }}
              >
                View →
              </a>
              <button
                style={S.btnRed}
                onClick={() => handleDelete(post.id)}
                disabled={deleting === post.id}
              >
                {deleting === post.id ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, textAlign: 'center', padding: '60px 0' }}>
            No posts found. <button style={{ ...S.btnGold, marginLeft: 12 }} onClick={handleNew}>Create first post</button>
          </div>
        )}
      </div>
    </div>
  )

  // ── EDIT VIEW ───────────────────────────────────────────────────────────────
  return (
    <div style={S.page}>
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: '#141C28', border: '1px solid rgba(232,184,75,0.3)', borderRadius: 8, padding: '10px 18px', color: '#E8B84B', fontSize: 12, zIndex: 9999 }}>
          {toast}
        </div>
      )}
      <div style={S.header}>
        <button style={S.btnGhost} onClick={() => setView('list')}>← Back to Posts</button>
        <span style={S.title}>{editing.id ? 'Edit Post' : 'New Post'}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={S.btnGhost} onClick={() => setView('list')}>Cancel</button>
          <button style={S.btnGold} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : editing.id ? 'Save Changes' : 'Create Post'}
          </button>
        </div>
      </div>

      <div style={S.body}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>

          {/* Left: content */}
          <div>
            <div style={S.card}>
              <label style={S.label}>Title</label>
              <input
                style={{ ...S.input, fontSize: 16, marginBottom: 16 }}
                placeholder="Post title..."
                value={editing.title ?? ''}
                onChange={e => setEditing(p => ({ ...p, title: e.target.value }))}
              />
              <label style={S.label}>Slug</label>
              <input
                style={{ ...S.input, marginBottom: 16 }}
                placeholder="post-slug-here"
                value={editing.slug ?? ''}
                onChange={e => setEditing(p => ({ ...p, slug: e.target.value }))}
              />
              <label style={S.label}>Description (meta)</label>
              <textarea
                style={{ ...S.textarea, minHeight: 80, marginBottom: 0 }}
                placeholder="SEO description..."
                value={editing.description ?? ''}
                onChange={e => setEditing(p => ({ ...p, description: e.target.value }))}
              />
            </div>

            <div style={S.card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <label style={{ ...S.label, margin: 0 }}>Content (Markdown)</label>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>
                  {(editing.content ?? '').length} chars
                </span>
              </div>

              {/* Tool token insert buttons */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>
                  Insert Tool Embed
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                  {TOOL_TOKENS.map(t => (
                    <button
                      key={t.token}
                      style={{ ...S.btnGhost, fontSize: 10, padding: '4px 10px' }}
                      onClick={() => insertToken(t.token)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                style={{ ...S.textarea, minHeight: 520 }}
                placeholder={`Write your post in Markdown...\n\nUse [[tool:roth-ladder-builder]] to embed a calculator.\n\nUse [[table:{...}]] to embed a FinanceTable.`}
                value={editing.content ?? ''}
                onChange={e => setEditing(p => ({ ...p, content: e.target.value }))}
              />

              {/* Table token helper */}
              <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, fontSize: 10, color: 'rgba(255,255,255,0.3)', lineHeight: 1.7 }}>
                <strong style={{ color: 'rgba(255,255,255,0.5)' }}>Table syntax:</strong>
                {' '}{'[[table:{"columns":[{"key":"col1","header":"Col 1","highlight":true},{"key":"col2","header":"Col 2"}],"rows":[{"col1":"Value","col2":"Value","_highlight":false}],"caption":"Optional caption"}]]'}
              </div>
            </div>
          </div>

          {/* Right: settings */}
          <div>
            <div style={S.card}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>Publishing</div>

              <label style={S.label}>Status</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {['Draft', 'Published'].map(s => (
                  <button
                    key={s}
                    onClick={() => setEditing(p => ({ ...p, published: s === 'Published' }))}
                    style={{
                      flex: 1, padding: '8px', borderRadius: 6, border: 'none', cursor: 'pointer',
                      fontFamily: 'monospace', fontSize: 11, fontWeight: 600,
                      background: (editing.published ? 'Published' : 'Draft') === s ? '#E8B84B' : 'rgba(255,255,255,0.06)',
                      color: (editing.published ? 'Published' : 'Draft') === s ? '#0D1420' : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <label style={S.label}>Publish Date / Schedule</label>
              <input
                type="datetime-local"
                style={{ ...S.input, marginBottom: 16 }}
                value={editing.published_at?.slice(0, 16) ?? ''}
                onChange={e => setEditing(p => ({ ...p, published_at: e.target.value }))}
              />

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 0 }}>
                <input
                  type="checkbox"
                  checked={editing.featured ?? false}
                  onChange={e => setEditing(p => ({ ...p, featured: e.target.checked }))}
                  style={{ accentColor: '#E8B84B', width: 14, height: 14 }}
                />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Featured post</span>
              </label>
            </div>

            <div style={S.card}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>Metadata</div>

              <label style={S.label}>Category</label>
              <select
                style={{ ...S.select, marginBottom: 16 }}
                value={editing.category ?? ''}
                onChange={e => setEditing(p => ({ ...p, category: e.target.value }))}
              >
                <option value="">— Select category —</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <label style={S.label}>Read Time</label>
              <input
                style={{ ...S.input, marginBottom: 0 }}
                placeholder="e.g. 10 min read"
                value={editing.read_time ?? ''}
                onChange={e => setEditing(p => ({ ...p, read_time: e.target.value }))}
              />
            </div>

            {editing.slug && (
              <div style={{ ...S.card, padding: '14px 16px' }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Preview URL</div>
                <div style={{ fontSize: 11, color: '#2DD4BF', wordBreak: 'break-all' as const }}>
                  /blog/{editing.slug}
                </div>
              </div>
            )}

            <div style={{ ...S.card, padding: '14px 16px' }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Scheduling</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                Set status to <strong style={{ color: '#fff' }}>Published</strong> + a future date to schedule. The post won't appear until the date is reached (ISR checks published_at ≤ now()).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}