import { type ChangeEvent, type Dispatch, type FormEvent, type SetStateAction, useEffect, useState } from 'react'
import './AdminPanel.css'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Tables } from '../lib/database.types'

type SiteSettingsRow = Tables<'site_settings'>
type PostRow = Tables<'posts'>
type PopularPostRow = Tables<'popular_posts'>
type RecentPostRow = Tables<'recent_posts'>
type TravelTipRow = Tables<'travel_tips'>

type EditablePost = {
  id: string
  slug: string
  title: string
  location: string
  day_label: string
  summary: string
  highlight: string
  body: string
  cover_image_url: string
  cover_image_alt: string
  sort_order: number
  status: 'draft' | 'published'
  published_at: string
}

type EditableSidebarPost = {
  id: string
  title: string
  blurb: string
  sort_order: number
}

type EditableTravelTip = {
  id: string
  content: string
  sort_order: number
}

type AuthForm = {
  email: string
  password: string
}

const defaultAdminEmail = import.meta.env.VITE_SUPABASE_ADMIN_EMAIL ?? ''

function toDatetimeLocal(value: string | null): string {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16)
}

function toIsoTimestamp(value: string): string | null {
  if (!value) {
    return null
  }

  return new Date(value).toISOString()
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function mapPost(post: PostRow): EditablePost {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    location: post.location,
    day_label: post.day_label,
    summary: post.summary,
    highlight: post.highlight,
    body: post.body,
    cover_image_url: post.cover_image_url,
    cover_image_alt: post.cover_image_alt,
    sort_order: post.sort_order,
    status: post.status === 'draft' ? 'draft' : 'published',
    published_at: toDatetimeLocal(post.published_at),
  }
}

function mapSidebarPost(post: PopularPostRow | RecentPostRow): EditableSidebarPost {
  return {
    id: post.id,
    title: post.title,
    blurb: post.blurb,
    sort_order: post.sort_order,
  }
}

function mapTravelTip(tip: TravelTipRow): EditableTravelTip {
  return {
    id: tip.id,
    content: tip.content,
    sort_order: tip.sort_order,
  }
}

function createEmptyPost(nextSortOrder: number): EditablePost {
  return {
    id: crypto.randomUUID(),
    slug: '',
    title: '',
    location: '',
    day_label: '',
    summary: '',
    highlight: '',
    body: '',
    cover_image_url: '',
    cover_image_alt: '',
    sort_order: nextSortOrder,
    status: 'draft',
    published_at: '',
  }
}

function createSidebarPost(nextSortOrder: number): EditableSidebarPost {
  return {
    id: crypto.randomUUID(),
    title: '',
    blurb: '',
    sort_order: nextSortOrder,
  }
}

function createTravelTip(nextSortOrder: number): EditableTravelTip {
  return {
    id: crypto.randomUUID(),
    content: '',
    sort_order: nextSortOrder,
  }
}

function AdminPanel() {
  const [authForm, setAuthForm] = useState<AuthForm>({
    email: defaultAdminEmail,
    password: '',
  })
  const [authMessage, setAuthMessage] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [sessionEmail, setSessionEmail] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [dashboardMessage, setDashboardMessage] = useState<string | null>(null)
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null)
  const [postsMessage, setPostsMessage] = useState<string | null>(null)
  const [sidebarMessage, setSidebarMessage] = useState<string | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordForm, setPasswordForm] = useState({
    password: '',
    confirmPassword: '',
  })
  const [siteSettings, setSiteSettings] = useState<SiteSettingsRow | null>(null)
  const [posts, setPosts] = useState<EditablePost[]>([])
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [popularPosts, setPopularPosts] = useState<EditableSidebarPost[]>([])
  const [recentPosts, setRecentPosts] = useState<EditableSidebarPost[]>([])
  const [travelTips, setTravelTips] = useState<EditableTravelTip[]>([])

  useEffect(() => {
    if (!supabase) {
      return
    }

    let isMounted = true

    void supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return
      }

      const nextEmail = data.session?.user.email ?? null
      const nextIsAdmin = data.session?.user.app_metadata?.role === 'admin'
      setSessionEmail(nextEmail)
      setIsAdmin(nextIsAdmin)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSessionEmail(nextSession?.user.email ?? null)
      setIsAdmin(nextSession?.user.app_metadata?.role === 'admin')
    })

    return () => {
      isMounted = false
      data.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!supabase || !isAdmin) {
      return
    }

    const client = supabase
    let cancelled = false

    async function loadAdminContent() {
      setDashboardMessage('Loading admin content from Supabase...')

      const [
        settingsResult,
        postsResult,
        popularPostsResult,
        recentPostsResult,
        travelTipsResult,
      ] = await Promise.all([
        client.from('site_settings').select('*').maybeSingle(),
        client
          .from('posts')
          .select('*')
          .order('published_at', { ascending: false })
          .order('sort_order', { ascending: false }),
        client.from('popular_posts').select('*').order('sort_order', { ascending: true }),
        client.from('recent_posts').select('*').order('sort_order', { ascending: true }),
        client.from('travel_tips').select('*').order('sort_order', { ascending: true }),
      ])

      if (cancelled) {
        return
      }

      const firstError = [
        settingsResult.error,
        postsResult.error,
        popularPostsResult.error,
        recentPostsResult.error,
        travelTipsResult.error,
      ].find(Boolean)

      if (firstError) {
        setDashboardMessage(firstError.message)
        return
      }

      const mappedPosts = (postsResult.data ?? []).map(mapPost)

      setSiteSettings(settingsResult.data)
      setPosts(mappedPosts)
      setSelectedPostId((current) => {
        if (current && mappedPosts.some((post) => post.id === current)) {
          return current
        }

        return mappedPosts[0]?.id ?? null
      })
      setPopularPosts((popularPostsResult.data ?? []).map(mapSidebarPost))
      setRecentPosts((recentPostsResult.data ?? []).map(mapSidebarPost))
      setTravelTips((travelTipsResult.data ?? []).map(mapTravelTip))
      setDashboardMessage(null)
    }

    void loadAdminContent()

    return () => {
      cancelled = true
    }
  }, [isAdmin])

  const selectedPost =
    selectedPostId === null ? null : posts.find((post) => post.id === selectedPostId) ?? null

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!supabase) {
      return
    }

    setAuthLoading(true)
    setAuthMessage(null)

    const { error } = await supabase.auth.signInWithPassword(authForm)

    if (error) {
      setAuthMessage(error.message)
      setAuthLoading(false)
      return
    }

    setAuthLoading(false)
    setAuthForm((current) => ({ ...current, password: '' }))
  }

  async function handleSignOut() {
    if (!supabase) {
      return
    }

    await supabase.auth.signOut()
    setPostsMessage(null)
    setSettingsMessage(null)
    setSidebarMessage(null)
    setPasswordMessage(null)
  }

  function updateSelectedPost<K extends keyof EditablePost>(field: K, value: EditablePost[K]) {
    if (!selectedPostId) {
      return
    }

    setPosts((current) =>
      current.map((post) =>
        post.id === selectedPostId
          ? {
              ...post,
              [field]: value,
            }
          : post,
      ),
    )
  }

  function handleCreatePost() {
    const nextSortOrder =
      posts.length === 0 ? 1 : Math.max(...posts.map((post) => post.sort_order)) + 1
    const nextPost = createEmptyPost(nextSortOrder)
    setPosts((current) => [nextPost, ...current])
    setSelectedPostId(nextPost.id)
    setPostsMessage('New draft ready. Add the details and save it to Supabase.')
  }

  async function handleDeletePost() {
    if (!supabase || !selectedPost) {
      return
    }

    const { error } = await supabase.from('posts').delete().eq('id', selectedPost.id)

    if (error) {
      setPostsMessage(error.message)
      return
    }

    setPosts((current) => current.filter((post) => post.id !== selectedPost.id))
    setSelectedPostId((current) => {
      if (current !== selectedPost.id) {
        return current
      }

      const remaining = posts.filter((post) => post.id !== selectedPost.id)
      return remaining[0]?.id ?? null
    })
    setPostsMessage('Post deleted.')
  }

  async function handleSavePost() {
    if (!supabase || !selectedPost) {
      return
    }

    const slug = slugify(selectedPost.slug || selectedPost.title)

    if (
      !slug ||
      !selectedPost.title.trim() ||
      !selectedPost.location.trim() ||
      !selectedPost.day_label.trim() ||
      !selectedPost.summary.trim() ||
      !selectedPost.highlight.trim() ||
      !selectedPost.body.trim() ||
      !selectedPost.cover_image_url.trim() ||
      !selectedPost.cover_image_alt.trim()
    ) {
      setPostsMessage('Fill in all post fields before saving.')
      return
    }

    const normalizedPost: EditablePost = {
      ...selectedPost,
      slug,
      sort_order: Number(selectedPost.sort_order) || 0,
      published_at:
        selectedPost.status === 'published' && !selectedPost.published_at
          ? toDatetimeLocal(new Date().toISOString())
          : selectedPost.published_at,
    }

    setPosts((current) =>
      current.map((post) => (post.id === normalizedPost.id ? normalizedPost : post)),
    )

    const { data, error } = await supabase
      .from('posts')
      .upsert({
        id: normalizedPost.id,
        slug: normalizedPost.slug,
        title: normalizedPost.title.trim(),
        location: normalizedPost.location.trim(),
        day_label: normalizedPost.day_label.trim(),
        summary: normalizedPost.summary.trim(),
        highlight: normalizedPost.highlight.trim(),
        body: normalizedPost.body.trim(),
        cover_image_url: normalizedPost.cover_image_url.trim(),
        cover_image_alt: normalizedPost.cover_image_alt.trim(),
        sort_order: normalizedPost.sort_order,
        status: normalizedPost.status,
        published_at: toIsoTimestamp(normalizedPost.published_at),
      })
      .select('*')
      .single()

    if (error) {
      setPostsMessage(error.message)
      return
    }

    const savedPost = mapPost(data)

    setPosts((current) =>
      current
        .map((post) => (post.id === savedPost.id ? savedPost : post))
        .sort((left, right) => {
          const leftDate = left.published_at ? new Date(left.published_at).getTime() : 0
          const rightDate = right.published_at ? new Date(right.published_at).getTime() : 0

          if (rightDate !== leftDate) {
            return rightDate - leftDate
          }

          return right.sort_order - left.sort_order
        }),
    )
    setSelectedPostId(savedPost.id)
    setPostsMessage('Post saved.')
  }

  async function handleUploadImage(event: ChangeEvent<HTMLInputElement>) {
    if (!supabase || !selectedPost) {
      return
    }

    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const extension = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const baseName = slugify(selectedPost.slug || selectedPost.title || selectedPost.id)
    const path = `${baseName}-${Date.now()}.${extension}`

    setPostsMessage('Uploading image...')

    const { error } = await supabase.storage
      .from('post-images')
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (error) {
      setPostsMessage(error.message)
      event.target.value = ''
      return
    }

    const { data } = supabase.storage.from('post-images').getPublicUrl(path)
    updateSelectedPost('cover_image_url', data.publicUrl)

    if (!selectedPost.cover_image_alt.trim()) {
      updateSelectedPost(
        'cover_image_alt',
        `${selectedPost.title.trim() || 'Blog post'} cover image`,
      )
    }

    setPostsMessage('Image uploaded. Save the post to persist the new image URL.')
    event.target.value = ''
  }

  async function handleSaveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!supabase || !siteSettings) {
      return
    }

    const { error } = await supabase.from('site_settings').upsert(siteSettings)

    if (error) {
      setSettingsMessage(error.message)
      return
    }

    setSettingsMessage('Site settings saved.')
  }

  async function handleSaveSidebarPosts(
    table: 'popular_posts' | 'recent_posts',
    rows: EditableSidebarPost[],
    successMessage: string,
  ) {
    if (!supabase) {
      return
    }

    if (rows.some((row) => !row.title.trim() || !row.blurb.trim())) {
      setSidebarMessage('Every sidebar post needs both a title and a blurb.')
      return
    }

    const { error } = await supabase.from(table).upsert(
      rows.map((row) => ({
        id: row.id,
        title: row.title.trim(),
        blurb: row.blurb.trim(),
        sort_order: Number(row.sort_order) || 0,
      })),
    )

    if (error) {
      setSidebarMessage(error.message)
      return
    }

    setSidebarMessage(successMessage)
  }

  async function handleSaveTravelTips() {
    if (!supabase) {
      return
    }

    if (travelTips.some((tip) => !tip.content.trim())) {
      setSidebarMessage('Every travel tip needs text before saving.')
      return
    }

    const { error } = await supabase.from('travel_tips').upsert(
      travelTips.map((tip) => ({
        id: tip.id,
        content: tip.content.trim(),
        sort_order: Number(tip.sort_order) || 0,
      })),
    )

    if (error) {
      setSidebarMessage(error.message)
      return
    }

    setSidebarMessage('Travel tips saved.')
  }

  async function handleDeleteSidebarPost(
    table: 'popular_posts' | 'recent_posts',
    id: string,
    setRows: Dispatch<SetStateAction<EditableSidebarPost[]>>,
  ) {
    if (!supabase) {
      return
    }

    const { error } = await supabase.from(table).delete().eq('id', id)

    if (error) {
      setSidebarMessage(error.message)
      return
    }

    setRows((current) => current.filter((row) => row.id !== id))
  }

  async function handleDeleteTravelTip(id: string) {
    if (!supabase) {
      return
    }

    const { error } = await supabase.from('travel_tips').delete().eq('id', id)

    if (error) {
      setSidebarMessage(error.message)
      return
    }

    setTravelTips((current) => current.filter((tip) => tip.id !== id))
  }

  async function handleChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!supabase) {
      return
    }

    if (!passwordForm.password || passwordForm.password.length < 8) {
      setPasswordMessage('Use a password with at least 8 characters.')
      return
    }

    if (passwordForm.password !== passwordForm.confirmPassword) {
      setPasswordMessage('The password confirmation does not match.')
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: passwordForm.password,
    })

    if (error) {
      setPasswordMessage(error.message)
      return
    }

    setPasswordForm({ password: '', confirmPassword: '' })
    setPasswordMessage('Password updated.')
  }

  if (!isSupabaseConfigured || !supabase) {
    return (
      <div className="admin-shell">
        <header className="admin-header">
          <a href="#journal" className="admin-back-link">
            Back to site
          </a>
          <span>Supabase Admin</span>
        </header>

        <main className="admin-layout">
          <section className="admin-card">
            <h1>Supabase is not configured</h1>
            <p>Add the required `VITE_SUPABASE_*` variables before using the admin UI.</p>
          </section>
        </main>
      </div>
    )
  }

  if (!sessionEmail) {
    return (
      <div className="admin-shell">
        <header className="admin-header">
          <a href="#journal" className="admin-back-link">
            Back to site
          </a>
          <span>Supabase Admin</span>
        </header>

        <main className="admin-layout admin-layout--auth">
          <section className="admin-card admin-card--auth">
            <p className="admin-kicker">Private editor</p>
            <h1>Sign in to manage the blog</h1>
            <p className="admin-copy">
              Use the Supabase admin account for this project. The public site stays read-only.
            </p>

            <form className="admin-form" onSubmit={handleSignIn}>
              <label className="admin-field">
                <span>Email</span>
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(event) =>
                    setAuthForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  required
                />
              </label>

              <label className="admin-field">
                <span>Password</span>
                <input
                  type="password"
                  value={authForm.password}
                  onChange={(event) =>
                    setAuthForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  required
                />
              </label>

              <button type="submit" className="admin-button admin-button--primary" disabled={authLoading}>
                {authLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            {authMessage ? <p className="admin-feedback admin-feedback--error">{authMessage}</p> : null}
          </section>
        </main>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="admin-shell">
        <header className="admin-header">
          <a href="#journal" className="admin-back-link">
            Back to site
          </a>
          <span>Supabase Admin</span>
        </header>

        <main className="admin-layout">
          <section className="admin-card">
            <h1>Access denied</h1>
            <p className="admin-copy">
              {sessionEmail} is signed in, but this account does not have the `admin` role in
              Supabase Auth.
            </p>
            <button type="button" className="admin-button" onClick={handleSignOut}>
              Sign out
            </button>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <a href="#journal" className="admin-back-link">
          Back to site
        </a>
        <div className="admin-header-copy">
          <span className="admin-kicker">Supabase-backed editor</span>
          <strong>{sessionEmail}</strong>
        </div>
        <button type="button" className="admin-button" onClick={handleSignOut}>
          Sign out
        </button>
      </header>

      <main className="admin-layout">
        {dashboardMessage ? <p className="admin-feedback">{dashboardMessage}</p> : null}

        <section className="admin-card">
          <div className="admin-section-heading">
            <div>
              <p className="admin-kicker">Site settings</p>
              <h1>Hero and contact details</h1>
            </div>
          </div>

          {siteSettings ? (
            <form className="admin-form admin-form--two-column" onSubmit={handleSaveSettings}>
              <label className="admin-field admin-field--full">
                <span>Hero eyebrow</span>
                <input
                  value={siteSettings.hero_eyebrow}
                  onChange={(event) =>
                    setSiteSettings((current) =>
                      current
                        ? {
                            ...current,
                            hero_eyebrow: event.target.value,
                          }
                        : current,
                    )
                  }
                />
              </label>

              <label className="admin-field admin-field--full">
                <span>Hero title</span>
                <input
                  value={siteSettings.hero_title}
                  onChange={(event) =>
                    setSiteSettings((current) =>
                      current
                        ? {
                            ...current,
                            hero_title: event.target.value,
                          }
                        : current,
                    )
                  }
                />
              </label>

              <label className="admin-field admin-field--full">
                <span>Hero subtitle</span>
                <textarea
                  rows={3}
                  value={siteSettings.hero_subtitle}
                  onChange={(event) =>
                    setSiteSettings((current) =>
                      current
                        ? {
                            ...current,
                            hero_subtitle: event.target.value,
                          }
                        : current,
                    )
                  }
                />
              </label>

              <label className="admin-field">
                <span>Author name</span>
                <input
                  value={siteSettings.author_name}
                  onChange={(event) =>
                    setSiteSettings((current) =>
                      current
                        ? {
                            ...current,
                            author_name: event.target.value,
                          }
                        : current,
                    )
                  }
                />
              </label>

              <label className="admin-field">
                <span>Author initials</span>
                <input
                  value={siteSettings.author_initials}
                  onChange={(event) =>
                    setSiteSettings((current) =>
                      current
                        ? {
                            ...current,
                            author_initials: event.target.value,
                          }
                        : current,
                    )
                  }
                />
              </label>

              <label className="admin-field admin-field--full">
                <span>Author bio</span>
                <textarea
                  rows={4}
                  value={siteSettings.author_bio}
                  onChange={(event) =>
                    setSiteSettings((current) =>
                      current
                        ? {
                            ...current,
                            author_bio: event.target.value,
                          }
                        : current,
                    )
                  }
                />
              </label>

              <label className="admin-field">
                <span>Instagram URL</span>
                <input
                  value={siteSettings.instagram_url}
                  onChange={(event) =>
                    setSiteSettings((current) =>
                      current
                        ? {
                            ...current,
                            instagram_url: event.target.value,
                          }
                        : current,
                    )
                  }
                />
              </label>

              <label className="admin-field">
                <span>YouTube URL</span>
                <input
                  value={siteSettings.youtube_url}
                  onChange={(event) =>
                    setSiteSettings((current) =>
                      current
                        ? {
                            ...current,
                            youtube_url: event.target.value,
                          }
                        : current,
                    )
                  }
                />
              </label>

              <label className="admin-field admin-field--full">
                <span>Contact email</span>
                <input
                  type="email"
                  value={siteSettings.contact_email}
                  onChange={(event) =>
                    setSiteSettings((current) =>
                      current
                        ? {
                            ...current,
                            contact_email: event.target.value,
                          }
                        : current,
                    )
                  }
                />
              </label>

              <div className="admin-actions admin-actions--full">
                <button type="submit" className="admin-button admin-button--primary">
                  Save settings
                </button>
                {settingsMessage ? <p className="admin-feedback">{settingsMessage}</p> : null}
              </div>
            </form>
          ) : (
            <p className="admin-copy">Loading site settings...</p>
          )}
        </section>

        <section className="admin-card">
          <div className="admin-section-heading">
            <div>
              <p className="admin-kicker">Posts</p>
              <h2>Edit stories and upload cover images</h2>
            </div>
            <button type="button" className="admin-button admin-button--primary" onClick={handleCreatePost}>
              New post
            </button>
          </div>

          <div className="admin-posts-layout">
            <aside className="admin-post-list">
              {posts.map((post) => (
                <button
                  type="button"
                  key={post.id}
                  className={`admin-post-list-item${post.id === selectedPostId ? ' is-active' : ''}`}
                  onClick={() => setSelectedPostId(post.id)}
                >
                  <strong>{post.title.trim() || 'Untitled draft'}</strong>
                  <span>{post.status}</span>
                  <small>{post.day_label || 'No day label yet'}</small>
                </button>
              ))}
            </aside>

            <div className="admin-post-editor">
              {selectedPost ? (
                <>
                  <div className="admin-form admin-form--two-column">
                    <label className="admin-field admin-field--full">
                      <span>Title</span>
                      <input
                        value={selectedPost.title}
                        onChange={(event) => updateSelectedPost('title', event.target.value)}
                      />
                    </label>

                    <label className="admin-field">
                      <span>Slug</span>
                      <input
                        value={selectedPost.slug}
                        onChange={(event) => updateSelectedPost('slug', event.target.value)}
                      />
                    </label>

                    <label className="admin-field">
                      <span>Status</span>
                      <select
                        value={selectedPost.status}
                        onChange={(event) =>
                          updateSelectedPost(
                            'status',
                            event.target.value === 'draft' ? 'draft' : 'published',
                          )
                        }
                      >
                        <option value="draft">draft</option>
                        <option value="published">published</option>
                      </select>
                    </label>

                    <label className="admin-field">
                      <span>Location</span>
                      <input
                        value={selectedPost.location}
                        onChange={(event) => updateSelectedPost('location', event.target.value)}
                      />
                    </label>

                    <label className="admin-field">
                      <span>Day label</span>
                      <input
                        value={selectedPost.day_label}
                        onChange={(event) => updateSelectedPost('day_label', event.target.value)}
                      />
                    </label>

                    <label className="admin-field">
                      <span>Sort order</span>
                      <input
                        type="number"
                        value={selectedPost.sort_order}
                        onChange={(event) =>
                          updateSelectedPost('sort_order', Number(event.target.value) || 0)
                        }
                      />
                    </label>

                    <label className="admin-field">
                      <span>Published at</span>
                      <input
                        type="datetime-local"
                        value={selectedPost.published_at}
                        onChange={(event) => updateSelectedPost('published_at', event.target.value)}
                      />
                    </label>

                    <label className="admin-field admin-field--full">
                      <span>Summary</span>
                      <textarea
                        rows={5}
                        value={selectedPost.summary}
                        onChange={(event) => updateSelectedPost('summary', event.target.value)}
                      />
                    </label>

                    <label className="admin-field admin-field--full">
                      <span>Highlight</span>
                      <textarea
                        rows={3}
                        value={selectedPost.highlight}
                        onChange={(event) => updateSelectedPost('highlight', event.target.value)}
                        />
                      </label>

                    <label className="admin-field admin-field--full">
                      <span>Full story body</span>
                      <textarea
                        rows={9}
                        value={selectedPost.body}
                        onChange={(event) => updateSelectedPost('body', event.target.value)}
                      />
                    </label>

                    <label className="admin-field admin-field--full">
                      <span>Cover image URL</span>
                      <input
                        value={selectedPost.cover_image_url}
                        onChange={(event) =>
                          updateSelectedPost('cover_image_url', event.target.value)
                        }
                      />
                    </label>

                    <label className="admin-field admin-field--full">
                      <span>Cover image alt text</span>
                      <input
                        value={selectedPost.cover_image_alt}
                        onChange={(event) =>
                          updateSelectedPost('cover_image_alt', event.target.value)
                        }
                      />
                    </label>
                  </div>

                  <div className="admin-upload-strip">
                    <label className="admin-upload-button">
                      <span>Upload image to Supabase Storage</span>
                      <input type="file" accept="image/*" onChange={handleUploadImage} />
                    </label>

                    {selectedPost.cover_image_url ? (
                      <img
                        src={selectedPost.cover_image_url}
                        alt={selectedPost.cover_image_alt || selectedPost.title}
                        className="admin-image-preview"
                      />
                    ) : null}
                  </div>

                  <div className="admin-actions">
                    <button type="button" className="admin-button admin-button--primary" onClick={handleSavePost}>
                      Save post
                    </button>
                    <button type="button" className="admin-button admin-button--danger" onClick={handleDeletePost}>
                      Delete post
                    </button>
                    {postsMessage ? <p className="admin-feedback">{postsMessage}</p> : null}
                  </div>
                </>
              ) : (
                <p className="admin-copy">Select a post or create a new one.</p>
              )}
            </div>
          </div>
        </section>

        <section className="admin-card">
          <div className="admin-section-heading">
            <div>
              <p className="admin-kicker">Sidebar content</p>
              <h2>Popular posts, recent posts, and travel tips</h2>
            </div>
          </div>

          <div className="admin-grid">
            <div className="admin-subcard">
              <div className="admin-subcard-heading">
                <h3>Popular posts</h3>
                <button
                  type="button"
                  className="admin-button"
                  onClick={() =>
                    setPopularPosts((current) => [
                      ...current,
                      createSidebarPost(current.length + 1),
                    ])
                  }
                >
                  Add row
                </button>
              </div>

              {popularPosts.map((post) => (
                <div className="admin-inline-editor" key={post.id}>
                  <input
                    placeholder="Title"
                    value={post.title}
                    onChange={(event) =>
                      setPopularPosts((current) =>
                        current.map((row) =>
                          row.id === post.id ? { ...row, title: event.target.value } : row,
                        ),
                      )
                    }
                  />
                  <input
                    placeholder="Blurb"
                    value={post.blurb}
                    onChange={(event) =>
                      setPopularPosts((current) =>
                        current.map((row) =>
                          row.id === post.id ? { ...row, blurb: event.target.value } : row,
                        ),
                      )
                    }
                  />
                  <input
                    type="number"
                    value={post.sort_order}
                    onChange={(event) =>
                      setPopularPosts((current) =>
                        current.map((row) =>
                          row.id === post.id
                            ? { ...row, sort_order: Number(event.target.value) || 0 }
                            : row,
                        ),
                      )
                    }
                  />
                  <button
                    type="button"
                    className="admin-button admin-button--danger"
                    onClick={() => void handleDeleteSidebarPost('popular_posts', post.id, setPopularPosts)}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="admin-button admin-button--primary"
                onClick={() =>
                  void handleSaveSidebarPosts(
                    'popular_posts',
                    popularPosts,
                    'Popular posts saved.',
                  )
                }
              >
                Save popular posts
              </button>
            </div>

            <div className="admin-subcard">
              <div className="admin-subcard-heading">
                <h3>Recent posts</h3>
                <button
                  type="button"
                  className="admin-button"
                  onClick={() =>
                    setRecentPosts((current) => [
                      ...current,
                      createSidebarPost(current.length + 1),
                    ])
                  }
                >
                  Add row
                </button>
              </div>

              {recentPosts.map((post) => (
                <div className="admin-inline-editor" key={post.id}>
                  <input
                    placeholder="Title"
                    value={post.title}
                    onChange={(event) =>
                      setRecentPosts((current) =>
                        current.map((row) =>
                          row.id === post.id ? { ...row, title: event.target.value } : row,
                        ),
                      )
                    }
                  />
                  <input
                    placeholder="Blurb"
                    value={post.blurb}
                    onChange={(event) =>
                      setRecentPosts((current) =>
                        current.map((row) =>
                          row.id === post.id ? { ...row, blurb: event.target.value } : row,
                        ),
                      )
                    }
                  />
                  <input
                    type="number"
                    value={post.sort_order}
                    onChange={(event) =>
                      setRecentPosts((current) =>
                        current.map((row) =>
                          row.id === post.id
                            ? { ...row, sort_order: Number(event.target.value) || 0 }
                            : row,
                        ),
                      )
                    }
                  />
                  <button
                    type="button"
                    className="admin-button admin-button--danger"
                    onClick={() => void handleDeleteSidebarPost('recent_posts', post.id, setRecentPosts)}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="admin-button admin-button--primary"
                onClick={() =>
                  void handleSaveSidebarPosts(
                    'recent_posts',
                    recentPosts,
                    'Recent posts saved.',
                  )
                }
              >
                Save recent posts
              </button>
            </div>

            <div className="admin-subcard">
              <div className="admin-subcard-heading">
                <h3>Travel tips</h3>
                <button
                  type="button"
                  className="admin-button"
                  onClick={() =>
                    setTravelTips((current) => [...current, createTravelTip(current.length + 1)])
                  }
                >
                  Add row
                </button>
              </div>

              {travelTips.map((tip) => (
                <div className="admin-inline-editor" key={tip.id}>
                  <input
                    placeholder="Travel tip"
                    value={tip.content}
                    onChange={(event) =>
                      setTravelTips((current) =>
                        current.map((row) =>
                          row.id === tip.id ? { ...row, content: event.target.value } : row,
                        ),
                      )
                    }
                  />
                  <input
                    type="number"
                    value={tip.sort_order}
                    onChange={(event) =>
                      setTravelTips((current) =>
                        current.map((row) =>
                          row.id === tip.id
                            ? { ...row, sort_order: Number(event.target.value) || 0 }
                            : row,
                        ),
                      )
                    }
                  />
                  <button
                    type="button"
                    className="admin-button admin-button--danger"
                    onClick={() => void handleDeleteTravelTip(tip.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="admin-button admin-button--primary"
                onClick={() => void handleSaveTravelTips()}
              >
                Save travel tips
              </button>
            </div>
          </div>

          {sidebarMessage ? <p className="admin-feedback">{sidebarMessage}</p> : null}
        </section>

        <section className="admin-card">
          <div className="admin-section-heading">
            <div>
              <p className="admin-kicker">Security</p>
              <h2>Change the admin password</h2>
            </div>
          </div>

          <form className="admin-form admin-form--two-column" onSubmit={handleChangePassword}>
            <label className="admin-field">
              <span>New password</span>
              <input
                type="password"
                value={passwordForm.password}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
              />
            </label>

            <label className="admin-field">
              <span>Confirm password</span>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    confirmPassword: event.target.value,
                  }))
                }
              />
            </label>

            <div className="admin-actions admin-actions--full">
              <button type="submit" className="admin-button admin-button--primary">
                Update password
              </button>
              {passwordMessage ? <p className="admin-feedback">{passwordMessage}</p> : null}
            </div>
          </form>
        </section>

      </main>
    </div>
  )
}

export default AdminPanel
