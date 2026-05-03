import { type FormEvent, useEffect, useState } from 'react'
import './App.css'
import authorAvatar from './assets/julia-avatar-cartoon.webp'
import AdminPanel from './components/AdminPanel'
import type { Tables } from './lib/database.types'
import { isSupabaseConfigured, supabase } from './lib/supabase'

type Story = {
  slug: string
  title: string
  location: string
  dayLabel: string
  summary: string
  highlight: string
  body: string
  image: string
  imageAlt: string
  publishedAt: string | null
}

type Post = {
  title: string
  blurb: string
}

type ViewMode =
  | { kind: 'site' }
  | { kind: 'admin' }
  | { kind: 'post'; slug: string }

type SiteSettings = Tables<'site_settings'>
type StoryRow = Tables<'posts'>
type SidebarPostRow = Tables<'popular_posts'>
type RecentPostRow = Tables<'recent_posts'>
type TravelTipRow = Tables<'travel_tips'>

const publishedDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const defaultSettings: SiteSettings = {
  author_bio:
    'I am Julia, a chronic over-planner documenting what happens when a color-coded itinerary meets Deutsche Bahn and questionable shortcuts.',
  author_initials: 'JT',
  author_name: 'Julia',
  contact_email: 'hello@misadventuresingermany.com',
  hero_eyebrow: 'Travel notes from missed turns and lucky detours',
  hero_subtitle:
    'A scrapbook-style travel blog about trains missed by seconds, bakeries discovered by accident, and every chaotic mile in between.',
  hero_title: 'Misadventures in Germany',
  instagram_url: 'https://www.instagram.com',
  singleton: true,
  updated_at: '',
  youtube_url: 'https://www.youtube.com',
}

const defaultStories: Story[] = [
  {
    slug: 'koln-cathedral-sprint',
    title: 'Koln Cathedral Sprint',
    location: 'Koln',
    dayLabel: 'Day 14',
    summary:
      'I arrived at the cathedral with a very confident plan, immediately picked the wrong side of the station, and spent twenty minutes orbiting the spires while dragging a backpack over cobblestones and pretending this was all part of the itinerary.',
    highlight: 'Koln is spectacular even when it is making you work for the postcard view.',
    body: `The first view of Koln Cathedral should have been cinematic. Instead, it involved me exiting the station on the wrong side, dragging a backpack over uneven stones, and circling the plaza like someone who had lost both her map and her dignity in the same five-minute window.

Once I finally reached the open square, the frustration dropped away almost instantly. The cathedral is so oversized and dramatic that it makes every surrounding building look like stage dressing. Even the crowd noise seemed to flatten out under those towers. I stood there pretending to study the architecture when in reality I was mostly recovering from the suitcase workout.

The best part of Koln was how quickly the chaos turned into delight. One wrong turn led me toward the bridge, which gave me the view I should have aimed for in the first place: cathedral spires, the Hohenzollern Bridge, and the kind of grey-gold evening light that makes every bad navigational choice feel retroactively intentional.`,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Cologne_Cathedral_and_Hohenzollern_Bridge.jpg/1280px-Cologne_Cathedral_and_Hohenzollern_Bridge.jpg',
    imageAlt: 'Cologne Cathedral and Hohenzollern Bridge at dusk',
    publishedAt: '2026-05-01T08:25:27.263275+00:00',
  },
  {
    slug: 'heidelberg-uphill',
    title: 'Heidelberg Uphill',
    location: 'Heidelberg',
    dayLabel: 'Day 12',
    summary:
      'The castle looked charming from below and deeply personal from the staircase. By the time I reached the top, my backpack, my calves, and my dignity were all negotiating separately.',
    highlight: 'Scenic views in Germany are apparently paid for in leg effort.',
    body: `From the river, Heidelberg looked like it had been assembled by someone with a deep commitment to charm and absolutely no concern for calf muscles. The castle sat above the town with a level of confidence I found mildly offensive once I started climbing toward it.

Halfway up, I had reached the stage where every staircase feels personal. I stopped twice for water, once for emotional recovery, and once to admire a view I was too out of breath to fully appreciate. The old town below kept getting prettier while my posture got worse.

At the top, the payoff was immediate. Red roofs, wooded hills, and the river stretched out in a way that made the entire uphill negotiation feel almost reasonable. Scenic views in Germany are rarely free. They usually require either excellent shoes or a willingness to suffer artistically.`,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Heidelberg_Castle%2C_2014.JPG/1280px-Heidelberg_Castle%2C_2014.JPG',
    imageAlt: 'Heidelberg castle overlooking the old town',
    publishedAt: '2026-05-01T08:03:06.320599+00:00',
  },
  {
    slug: 'dresden-detour',
    title: 'Dresden Detour',
    location: 'Dresden',
    dayLabel: 'Day 10',
    summary:
      'I stepped off the train for a quick platform break and somehow ended up in a riverside market with violin music, potato soup, and absolutely no sense of time.',
    highlight: 'In Germany, a short stop can escalate into a full memory without warning.',
    body: `The plan in Dresden was simple: stay on the platform, stretch my legs, and get back on the train with the composure of a competent adult. The actual result was a slow-motion drift toward a riverside market I had no business finding during a "quick stop."

One stall smelled like potato soup, another had pastries that were impossible to ignore, and somewhere nearby a violinist was performing with such confidence that it felt rude to hurry. I kept telling myself I had time, which is historically the exact thought that causes me trouble.

What made Dresden memorable was how quietly it won me over. There was no dramatic mishap, just the realization that a city can derail your schedule by being too beautiful to leave at platform distance. Germany keeps doing this thing where logistical mistakes become emotional highlights.`,
    image:
      'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Dresden skyline along the Elbe River',
    publishedAt: '2026-05-01T08:03:06.320599+00:00',
  },
  {
    slug: 'berlin-after-midnight',
    title: 'Berlin After Midnight',
    location: 'Berlin',
    dayLabel: 'Day 8',
    summary:
      'A casual evening walk became an accidental three-hour search for the correct courtyard bar. Everyone I asked gave perfectly logical directions, which I interpreted in increasingly experimental ways.',
    highlight: 'Berlin rewards curiosity and mildly punishes poor navigation.',
    body: `Berlin after dark has a very specific talent for making every street corner look like it could lead either to a perfect evening or an accidental forty-minute detour. I went out for a casual walk and ended up on a mission to find a courtyard bar that apparently existed in a dimension adjacent to my own.

The directions I received were all technically sensible. "Second archway, then left past the bicycles" should not have been difficult. Unfortunately, each set of bicycles in Berlin appears to lead to a completely different social universe. I kept arriving somewhere plausible, but never somewhere correct.

Eventually I found the place, mostly by surrendering to the city's logic instead of insisting on mine. Berlin rewards curiosity, improvisation, and a tolerance for being wrong in public. It is less interested in rewarding neat itineraries.`,
    image:
      'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Berlin street with warm evening lights',
    publishedAt: '2026-05-01T08:03:06.320599+00:00',
  },
  {
    slug: 'hamburg-but-wetter',
    title: 'Hamburg, But Wetter',
    location: 'Hamburg',
    dayLabel: 'Day 5',
    summary:
      'The harbor tour guide promised dramatic weather and delivered with theatrical commitment. My umbrella folded inside out before we reached the second bridge, and a gull stole half a fish sandwich in broad daylight.',
    highlight: 'The rain was aggressive, but the cinnamon roll justified the ordeal.',
    body: `Hamburg introduced itself with water from every possible direction. The harbor tour guide promised dramatic weather, which in retrospect should have been treated less like marketing copy and more like a legal disclaimer.

By the second bridge, my umbrella had inverted into a modern art installation. A gull carried out a daylight robbery involving half a fish sandwich, and everyone around me behaved as though this was simply part of the city's standard onboarding process.

Still, Hamburg has the unfair advantage of being lovely even when it is actively trying to soak you through. Brick facades, steel bridges, and grey skies all conspired to make the entire ordeal look cinematic. Also, the cinnamon roll afterward was strong enough to repair morale at a structural level.`,
    image:
      'https://images.unsplash.com/photo-1534313314376-a72289b6181e?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Hamburg waterfront with boats and historic buildings',
    publishedAt: '2026-05-01T08:03:06.320599+00:00',
  },
  {
    slug: 'munich-madness',
    title: 'Munich Madness',
    location: 'Munich',
    dayLabel: 'Day 2',
    summary:
      'I meant to validate my train ticket and somehow validated my confidence instead. Forty minutes later I was sharing apology-German with a conductor while balancing a pretzel bigger than my face.',
    highlight: 'Lesson learned: when a machine looks important in Germany, it is.',
    body: `Munich managed to humble me before lunch. I approached the ticket area with the confidence of someone who had watched exactly one helpful travel video and concluded that this made her effectively local.

What I validated, unfortunately, was not my ticket but my ability to misunderstand a machine with real authority. Forty minutes later I was balancing an enormous pretzel, attempting apology-German, and learning that public transit systems do not award points for enthusiasm.

Once the panic passed, Munich softened considerably. The city has a way of making even your mistakes feel clean, efficient, and well-lit. I spent the rest of the day recovering through architecture, pastries, and a renewed respect for any button that appears official.`,
    image:
      'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Munich city skyline at golden hour',
    publishedAt: '2026-04-29T08:03:06.320599+00:00',
  },
]

const defaultPopularPosts: Post[] = [
  {
    title: 'How I Ordered Seven Mustards',
    blurb: 'A sausage stand misunderstanding with excellent consequences.',
  },
  {
    title: 'Lost in the Black Forest',
    blurb: 'A scenic detour featuring fog, cake, and zero phone signal.',
  },
  {
    title: 'The Cologne Cathedral Sprint',
    blurb: 'Arrived reverent, left breathless, still worth it.',
  },
]

const defaultRecentPosts: Post[] = [
  {
    title: 'Frankfurt Layover Panic',
    blurb: 'Twenty-seven minutes, one wrong escalator, and a surprisingly calm pretzel vendor.',
  },
  {
    title: 'Leipzig Tram Roulette',
    blurb: 'I boarded confidently, exited somewhere interpretive, and found a great coffee shop.',
  },
  {
    title: 'Neuschwanstein in Bad Shoes',
    blurb: 'A castle worth the climb, even when your footwear files a formal complaint.',
  },
]

const defaultChecklist = [
  'Always carry coins for station lockers and emergency pastries.',
  'Assume platform changes are part of the character-building exercise.',
  'Trust bakery windows more than any itinerary.',
]

const missingConfigMessage =
  'Supabase env vars are missing, so the page is showing local fallback content.'

function toStory(story: StoryRow): Story {
  return {
    slug: story.slug,
    title: story.title,
    location: story.location,
    dayLabel: story.day_label,
    summary: story.summary,
    highlight: story.highlight,
    body: story.body,
    image: story.cover_image_url,
    imageAlt: story.cover_image_alt,
    publishedAt: story.published_at,
  }
}

function toSidebarPost(post: SidebarPostRow | RecentPostRow): Post {
  return {
    title: post.title,
    blurb: post.blurb,
  }
}

function getViewMode(): ViewMode {
  const hash = window.location.hash

  if (hash.startsWith('#admin')) {
    return { kind: 'admin' }
  }

  if (hash.startsWith('#post/')) {
    const slug = decodeURIComponent(hash.slice('#post/'.length)).trim()
    return slug ? { kind: 'post', slug } : { kind: 'site' }
  }

  return { kind: 'site' }
}

function formatPublishedDate(value: string | null): string {
  if (!value) {
    return 'Draft date unavailable'
  }

  return publishedDateFormatter.format(new Date(value))
}

function getDateFilterValue(value: string | null): string {
  if (!value) {
    return ''
  }

  return value.slice(0, 10)
}

function getBodyParagraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

function StoryDetailView({
  settings,
  story,
  isLoading,
}: {
  settings: SiteSettings
  story: Story | null
  isLoading: boolean
}) {
  const storyParagraphs = story ? getBodyParagraphs(story.body) : []

  return (
    <div className="page-shell">
      <header className="topbar">
        <a href="#journal">Home</a>
        <a href="#archive">Archive</a>
        <a href="#about">About Me</a>
        <a href="#contact">Contact</a>
        <a href="#admin">Admin</a>
      </header>

      <main className="blog-layout story-detail-layout">
        {isLoading ? (
          <section className="story-detail-card">
            <p className="story-detail-kicker">Loading story</p>
            <h1>Fetching the full entry from Supabase...</h1>
          </section>
        ) : story ? (
          <article className="story-detail-card">
            <a href="#archive" className="detail-back-link">
              Back to search
            </a>
            <p className="story-detail-kicker">{story.location}</p>
            <h1>{story.title}</h1>
            <div className="story-detail-meta">
              <span>{story.dayLabel}</span>
              <span>{formatPublishedDate(story.publishedAt)}</span>
            </div>

            <div className="story-detail-image-frame">
              <img src={story.image} alt={story.imageAlt} className="story-detail-image" />
            </div>

            <div className="story-detail-copy">
              <p className="story-detail-lead">{story.summary}</p>
              {storyParagraphs.length > 0 ? (
                storyParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
              ) : (
                <p className="story-detail-fallback">
                  This entry is live in the archive, but its longer body has not been filled in
                  yet. The summary and highlight are shown below until it is expanded in the admin
                  editor.
                </p>
              )}
              <p className="story-detail-highlight">{story.highlight}</p>
            </div>
          </article>
        ) : (
          <section className="story-detail-card">
            <p className="story-detail-kicker">Story not found</p>
            <h1>This entry is not available.</h1>
            <p className="story-detail-lead">
              It may still be syncing, or the slug does not exist in the published archive.
            </p>
            <a href="#archive" className="detail-back-link">
              Return to the archive
            </a>
          </section>
        )}

        <aside className="story-detail-sidebar">
          <section className="sidebar-card author-card" id="about">
            <div className="section-label compact">Hello!</div>
            <img src={authorAvatar} alt={`Cartoon portrait of ${settings.author_name}`} className="avatar" />
            <p>{settings.author_bio}</p>
          </section>

          <section className="sidebar-card" id="contact">
            <div className="section-label compact">Follow Me</div>
            <div className="social-links">
              <a href={settings.instagram_url} target="_blank" rel="noreferrer">
                Instagram
              </a>
              <a href={settings.youtube_url} target="_blank" rel="noreferrer">
                YouTube
              </a>
              <a href={`mailto:${settings.contact_email}`}>Email</a>
            </div>
          </section>
        </aside>
      </main>
    </div>
  )
}

function App() {
  const currentYear = new Date().getFullYear()
  const [viewMode, setViewMode] = useState<ViewMode>(() => getViewMode())
  const [settings, setSettings] = useState(defaultSettings)
  const [allStories, setAllStories] = useState(defaultStories)
  const [popularPosts, setPopularPosts] = useState(defaultPopularPosts)
  const [recentPosts, setRecentPosts] = useState(defaultRecentPosts)
  const [checklist, setChecklist] = useState(defaultChecklist)
  const [syncMessage, setSyncMessage] = useState<string | null>(
    isSupabaseConfigured ? 'Syncing the latest entries from Supabase...' : missingConfigMessage,
  )
  const [isFallback, setIsFallback] = useState(!isSupabaseConfigured)
  const [archiveQuery, setArchiveQuery] = useState('')
  const [archiveDate, setArchiveDate] = useState('')
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false)

  useEffect(() => {
    const handleHashChange = () => {
      setViewMode(getViewMode())
    }

    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  useEffect(() => {
    if (viewMode.kind === 'admin') {
      return
    }

    if (!supabase) {
      return
    }

    const client = supabase
    let cancelled = false

    async function loadContent() {
      const [
        settingsResult,
        storiesResult,
        popularPostsResult,
        recentPostsResult,
        checklistResult,
      ] = await Promise.all([
        client.from('site_settings').select('*').maybeSingle(),
        client
          .from('posts')
          .select('*')
          .eq('status', 'published')
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
        storiesResult.error,
        popularPostsResult.error,
        recentPostsResult.error,
        checklistResult.error,
      ].find(Boolean)

      if (firstError) {
        console.error('Supabase sync failed.', firstError)
        setIsFallback(true)
        setSyncMessage('Live content could not be loaded. Showing local fallback content instead.')
        return
      }

      if (settingsResult.data) {
        setSettings(settingsResult.data)
      }

      setAllStories((storiesResult.data ?? []).map(toStory))
      setPopularPosts((popularPostsResult.data ?? []).map(toSidebarPost))
      setRecentPosts((recentPostsResult.data ?? []).map(toSidebarPost))
      setChecklist((checklistResult.data ?? []).map((item: TravelTipRow) => item.content))
      setIsFallback(false)
      setSyncMessage(null)
    }

    void loadContent()

    return () => {
      cancelled = true
    }
  }, [viewMode.kind])

  useEffect(() => {
    if (!isArchiveModalOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsArchiveModalOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isArchiveModalOpen])

  const featuredStories = allStories.slice(0, 5)
  const selectedStory =
    viewMode.kind === 'post' ? allStories.find((story) => story.slug === viewMode.slug) ?? null : null
  const isStoryLoading = viewMode.kind === 'post' && selectedStory === null && syncMessage !== null && !isFallback

  const normalizedQuery = archiveQuery.trim().toLowerCase()
  const archiveResults = allStories.filter((story) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      [
        story.title,
        story.location,
        story.dayLabel,
        story.summary,
        story.highlight,
        story.body,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)

    const matchesDate =
      archiveDate.length === 0 || getDateFilterValue(story.publishedAt) === archiveDate

    return matchesQuery && matchesDate
  })
  const hasArchiveFilters = normalizedQuery.length > 0 || archiveDate.length > 0
  const archiveResultsLabel = hasArchiveFilters
    ? `${archiveResults.length} stor${archiveResults.length === 1 ? 'y' : 'ies'} match the current filters.`
    : `${archiveResults.length} published stor${archiveResults.length === 1 ? 'y is' : 'ies are'} available.`

  function handleArchiveSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsArchiveModalOpen(true)
  }

  function handleShowAllStories() {
    setArchiveQuery('')
    setArchiveDate('')
    setIsArchiveModalOpen(true)
  }

  if (viewMode.kind === 'admin') {
    return <AdminPanel />
  }

  if (viewMode.kind === 'post') {
    return <StoryDetailView settings={settings} story={selectedStory} isLoading={isStoryLoading} />
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <a href="#journal">Home</a>
        <a href="#archive">Archive</a>
        <a href="#about">About Me</a>
        <a href="#contact">Contact</a>
        <a href="#admin">Admin</a>
      </header>

      <main className="blog-layout">
        <section className="hero-panel">
          <p className="eyebrow">{settings.hero_eyebrow}</p>
          <h1>{settings.hero_title}</h1>
          <p className="hero-subtitle">{settings.hero_subtitle}</p>
        </section>

        <div className="content-grid">
          <section className="main-column" id="journal">
            {syncMessage ? (
              <p className={`sync-note${isFallback ? ' is-warning' : ''}`}>{syncMessage}</p>
            ) : null}

            <div className="postcard-grid">
              {featuredStories.length > 0 ? (
                featuredStories.map((story, index) => (
                  <article
                    className={`story-card${story.slug === 'koln-cathedral-sprint' ? ' story-card--koln' : ''}`}
                    key={story.slug}
                  >
                    <div className="section-label">{story.title}</div>
                    <div className="story-photo-frame" tabIndex={0}>
                      <div className="story-photo-clip">
                        <img src={story.image} alt={story.imageAlt} className="story-photo" />
                      </div>
                      <div className="story-hover-modal" aria-label={`${story.title} description`}>
                        <p>{story.summary}</p>
                        <p className="story-highlight">{story.highlight}</p>
                      </div>
                    </div>
                    <div className="story-copy">
                      <div className="story-meta">
                        <span>{story.location}</span>
                        <span>{story.dayLabel}</span>
                        <span>Entry {String(index + 1).padStart(2, '0')}</span>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <article className="story-empty-state">
                  Publish your first entry in Supabase to populate the journal.
                </article>
              )}
            </div>

            <section className="notes-panel">
              <div className="section-label">Wunderbar, In Hindsight</div>
              {checklist.length > 0 ? (
                <ul>
                  {checklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="empty-copy">No travel notes yet.</p>
              )}
            </section>

            <section className="archive-panel" id="archive">
              <div className="section-label compact">Blog Archive</div>

              <form className="archive-controls" onSubmit={handleArchiveSearch}>
                <label className="archive-field">
                  <span>Search by name, city, or text</span>
                  <input
                    type="search"
                    value={archiveQuery}
                    onChange={(event) => setArchiveQuery(event.target.value)}
                    placeholder="Try Koln, Berlin, Day 8, cathedral..."
                  />
                </label>

                <label className="archive-field">
                  <span>Filter by published date</span>
                  <input
                    type="date"
                    value={archiveDate}
                    onChange={(event) => setArchiveDate(event.target.value)}
                  />
                </label>

                <div className="archive-actions">
                  <button type="submit" className="archive-search-button">
                    Search
                  </button>
                  <button
                    type="button"
                    className="archive-reset-button"
                    onClick={handleShowAllStories}
                  >
                    Show all
                  </button>
                </div>
              </form>
            </section>
          </section>

          <aside className="sidebar">
            <section className="sidebar-card author-card" id="about">
              <div className="section-label compact">Hello!</div>
              <img src={authorAvatar} alt={`Cartoon portrait of ${settings.author_name}`} className="avatar" />
              <p>{settings.author_bio}</p>
            </section>

            <section className="sidebar-card">
              <div className="section-label compact">Popular Posts</div>
              <div className="sidebar-list">
                {popularPosts.length > 0 ? (
                  popularPosts.map((post) => (
                    <article key={post.title} className="mini-post">
                      <h2>{post.title}</h2>
                      <p>{post.blurb}</p>
                    </article>
                  ))
                ) : (
                  <p className="empty-copy">Nothing featured yet.</p>
                )}
              </div>
            </section>

            <section className="sidebar-card">
              <div className="section-label compact">Recent Posts</div>
              <div className="sidebar-list">
                {recentPosts.length > 0 ? (
                  recentPosts.map((post) => (
                    <article key={post.title} className="mini-post">
                      <h2>{post.title}</h2>
                      <p>{post.blurb}</p>
                    </article>
                  ))
                ) : (
                  <p className="empty-copy">No recent entries yet.</p>
                )}
              </div>
            </section>

            <section className="sidebar-card" id="contact">
              <div className="section-label compact">Follow Me</div>
              <div className="social-links">
                <a href={settings.instagram_url} target="_blank" rel="noreferrer">
                  Instagram
                </a>
                <a href={settings.youtube_url} target="_blank" rel="noreferrer">
                  YouTube
                </a>
                <a href={`mailto:${settings.contact_email}`}>Email</a>
              </div>
            </section>
          </aside>
        </div>
      </main>

      {isArchiveModalOpen ? (
        <div
          className="archive-modal-backdrop"
          onClick={() => setIsArchiveModalOpen(false)}
          role="presentation"
        >
          <section
            className="archive-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="archive-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="archive-modal-header">
              <div>
                <p className="archive-kicker">Blog archive</p>
                <h2 id="archive-modal-title">{hasArchiveFilters ? 'Search results' : 'All blogs'}</h2>
              </div>
              <button
                type="button"
                className="archive-close-button"
                onClick={() => setIsArchiveModalOpen(false)}
              >
                Close
              </button>
            </div>

            <p className="archive-results-meta">{archiveResultsLabel}</p>

            <div className="archive-results">
              {archiveResults.length > 0 ? (
                archiveResults.map((story) => (
                  <a
                    className="archive-result-card"
                    href={`#post/${encodeURIComponent(story.slug)}`}
                    key={story.slug}
                    onClick={() => setIsArchiveModalOpen(false)}
                  >
                    <div className="archive-result-copy">
                      <div className="archive-result-meta">
                        <span>{story.location}</span>
                        <span>{story.dayLabel}</span>
                        <span>{formatPublishedDate(story.publishedAt)}</span>
                      </div>
                      <h3>{story.title}</h3>
                      <p>{story.summary}</p>
                    </div>
                    <span className="archive-result-action">Read full story</span>
                  </a>
                ))
              ) : (
                <div className="archive-empty-state">
                  No stories match that search. Try a broader title, city, or date.
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}

      <footer className="footerbar">Copyright © {currentYear} Misadventures in Germany</footer>
    </div>
  )
}

export default App
