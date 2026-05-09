import { type FormEvent, useEffect, useState } from 'react'
import './App.css'
import authorAvatar from './assets/julia-avatar-cartoon.webp'
import AdminPanel from './components/AdminPanel'
import { defaultPublicContent } from './content/fallback'
import { contentSyncingMessage, loadPublicContent, missingConfigMessage } from './content/loadPublicContent'
import type { Post, Story } from './content/types'
import { splitSettingList, type SiteSettings } from './lib/siteSettings'
import { isSupabaseConfigured, supabase } from './lib/supabase'

type ViewMode =
  | { kind: 'site' }
  | { kind: 'admin' }
  | { kind: 'about' }
  | { kind: 'contact' }
  | { kind: 'post'; slug: string }

const publishedDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function getViewMode(): ViewMode {
  const hash = window.location.hash

  if (hash.startsWith('#admin')) {
    return { kind: 'admin' }
  }

  if (hash === '#about-me') {
    return { kind: 'about' }
  }

  if (hash === '#contact') {
    return { kind: 'contact' }
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

function getSettingText(value: string, fallback = ''): string {
  const trimmed = value.trim()
  return trimmed || fallback
}

function getAuthorName(settings: SiteSettings): string {
  return getSettingText(settings.author_name, 'Julia')
}

type SocialLink = {
  href: string
  label: string
  external?: boolean
}

function getSocialLinks(
  settings: SiteSettings,
  options: {
    includeContactPageLink?: boolean
    includeDirectEmailLink?: boolean
  } = {},
): SocialLink[] {
  const links: SocialLink[] = []
  const instagramUrl = settings.instagram_url.trim()
  const youtubeUrl = settings.youtube_url.trim()
  const contactEmail = settings.contact_email.trim()

  if (instagramUrl) {
    links.push({ href: instagramUrl, label: 'Instagram', external: true })
  }

  if (youtubeUrl) {
    links.push({ href: youtubeUrl, label: 'YouTube', external: true })
  }

  if (options.includeDirectEmailLink && contactEmail) {
    links.push({ href: `mailto:${contactEmail}`, label: 'Email' })
  } else if (options.includeContactPageLink) {
    links.push({ href: '#contact', label: 'Email' })
  }

  return links
}

function renderSocialLinks(
  settings: SiteSettings,
  options: {
    emptyMessage: string
    includeContactPageLink?: boolean
    includeDirectEmailLink?: boolean
  },
) {
  const links = getSocialLinks(settings, options)

  if (links.length === 0) {
    return <p className="empty-copy">{options.emptyMessage}</p>
  }

  return (
    <div className="social-links">
      {links.map((link) => (
        <a
          href={link.href}
          key={`${link.label}:${link.href}`}
          rel={link.external ? 'noreferrer' : undefined}
          target={link.external ? '_blank' : undefined}
        >
          {link.label}
        </a>
      ))}
    </div>
  )
}

function SidebarPostCard({
  post,
  hasStory,
}: {
  post: Post
  hasStory: boolean
}) {
  if (hasStory) {
    return (
      <a className="mini-post mini-post--link" href={`#post/${encodeURIComponent(post.slug)}`}>
        <h2>{post.title}</h2>
        <p>{post.blurb}</p>
      </a>
    )
  }

  return (
    <article className="mini-post">
      <h2>{post.title}</h2>
      <p>{post.blurb}</p>
      <p className="empty-copy">Full post unavailable.</p>
    </article>
  )
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
  const authorName = getAuthorName(settings)
  const authorBio = settings.author_bio.trim()
  const storyParagraphs = story ? getBodyParagraphs(story.body) : []

  return (
    <div className="page-shell">
      <header className="topbar">
        <a href="#journal">Home</a>
        <a href="#about-me">About Me</a>
        <a href="#contact">Contact</a>
      </header>

      <main className="blog-layout story-detail-layout">
        {isLoading ? (
          <section className="story-detail-card">
            <p className="story-detail-kicker">Loading story</p>
            <h1>Fetching the full entry from Supabase...</h1>
          </section>
        ) : story ? (
          <article className="story-detail-card">
            <a
              href="#archive"
              className="detail-back-link detail-back-link--icon"
              aria-label="Back to search"
            />
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
          <section className="sidebar-card author-card">
            <div className="section-label compact">Hello!</div>
            <a href="#about-me" className="avatar-link" aria-label={`Read more about ${authorName}`}>
              <img src={authorAvatar} alt={`Cartoon portrait of ${authorName}`} className="avatar" />
            </a>
            {authorBio ? <p>{authorBio}</p> : <p className="empty-copy">Author bio not published yet.</p>}
          </section>

          <section className="sidebar-card" id="contact">
            <div className="section-label compact">Follow Me</div>
            {renderSocialLinks(settings, {
              emptyMessage: 'No contact links published yet.',
              includeContactPageLink: true,
            })}
          </section>
        </aside>
      </main>
    </div>
  )
}

function AboutPageView({
  settings,
  stories,
}: {
  settings: SiteSettings
  stories: Story[]
}) {
  const currentYear = new Date().getFullYear()
  const authorName = getAuthorName(settings)
  const authorBio = settings.author_bio.trim()
  const galleryStories = stories.slice(0, 3)
  const highlightStory = galleryStories[0] ?? null
  const aboutStoryParagraphs = getBodyParagraphs(settings.about_story_body)
  const aboutBlogParagraphs = getBodyParagraphs(settings.about_blog_section_body)
  const aboutTravelStyleParagraphs = getBodyParagraphs(settings.about_travel_style_body)
  const aboutBadges = splitSettingList(settings.about_badges)
  const aboutStats = [
    {
      text: settings.about_travel_pattern_stat_1_text.trim(),
      value: settings.about_travel_pattern_stat_1_value.trim(),
    },
    {
      text: settings.about_travel_pattern_stat_2_text.trim(),
      value: settings.about_travel_pattern_stat_2_value.trim(),
    },
    {
      text: settings.about_travel_pattern_stat_3_text.trim(),
      value: settings.about_travel_pattern_stat_3_value.trim(),
    },
  ].filter((stat) => stat.text && stat.value)

  return (
    <div className="page-shell">
      <header className="topbar">
        <a href="#journal">Home</a>
        <a href="#about-me">About Me</a>
        <a href="#contact">Contact</a>
      </header>

      <main className="blog-layout about-layout">
        <section className="about-hero-card">
          <div className="about-hero-copy">
            <p className="story-detail-kicker">About the author</p>
            <h1>{getSettingText(settings.about_hero_title, 'About')}</h1>
            {authorBio ? <p className="about-lead">{authorBio}</p> : null}
            {aboutStoryParagraphs.length > 0 ? (
              aboutStoryParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
            ) : (
              <p className="empty-copy">About copy has not been published yet.</p>
            )}

            {aboutBadges.length > 0 ? (
              <div className="about-pill-row">
                {aboutBadges.map((badge) => (
                  <span key={badge}>{badge}</span>
                ))}
              </div>
            ) : null}
          </div>

          <aside className="about-portrait-panel">
            <div className="about-portrait-frame">
              <img src={authorAvatar} alt={`Portrait of ${authorName}`} className="about-portrait" />
            </div>
            <div className="about-note-card">
              <p className="archive-kicker">Current fixation</p>
              {highlightStory ? (
                <>
                  <h2>{highlightStory.title}</h2>
                  <p>The latest published story came from {highlightStory.location}.</p>
                  <a href={`#post/${encodeURIComponent(highlightStory.slug)}`} className="detail-back-link">
                    Read the latest story
                  </a>
                </>
              ) : (
                <>
                  <h2>No published stories yet</h2>
                  <p>Publish a story in Supabase to populate this panel.</p>
                </>
              )}
            </div>
          </aside>
        </section>

        <div className="about-grid">
          <section className="about-card">
            <div className="section-label compact">
              {getSettingText(settings.about_blog_section_title, 'What This Blog Covers')}
            </div>
            {aboutBlogParagraphs.length > 0 ? (
              aboutBlogParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
            ) : (
              <p className="empty-copy">This section has not been filled in yet.</p>
            )}
          </section>

          <section className="about-card">
            <div className="section-label compact">
              {getSettingText(settings.about_travel_pattern_title, 'Travel Pattern')}
            </div>
            {aboutStats.length > 0 ? (
              <div className="about-stat-grid">
                {aboutStats.map((stat) => (
                  <article className="about-stat-card" key={`${stat.value}:${stat.text}`}>
                    <span className="about-stat-value">{stat.value}</span>
                    <p>{stat.text}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="empty-copy">No travel pattern stats published yet.</p>
            )}
          </section>

          <section className="about-card about-gallery-card">
            <div className="section-label compact">Field Notes in Pictures</div>
            {galleryStories.length > 0 ? (
              <div className="about-gallery-grid">
                {galleryStories.map((story) => (
                  <a
                    className="about-gallery-item"
                    href={`#post/${encodeURIComponent(story.slug)}`}
                    key={story.slug}
                  >
                    <img src={story.image} alt={story.imageAlt} className="about-gallery-image" />
                    <div className="about-gallery-caption">
                      <span>{story.location}</span>
                      <h2>{story.title}</h2>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="empty-copy">No gallery stories published yet.</p>
            )}
          </section>

          <section className="about-card">
            <div className="section-label compact">
              {getSettingText(settings.about_travel_style_title, 'How I Travel')}
            </div>
            {aboutTravelStyleParagraphs.length > 0 ? (
              aboutTravelStyleParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
            ) : (
              <p className="empty-copy">Travel style notes have not been published yet.</p>
            )}
          </section>

          <section className="about-card about-contact-card" id="contact">
            <div className="section-label compact">
              {getSettingText(settings.about_contact_title, 'Say Hello')}
            </div>
            {settings.about_contact_body.trim() ? (
              <p>{settings.about_contact_body}</p>
            ) : (
              <p className="empty-copy">Contact copy has not been published yet.</p>
            )}
            {renderSocialLinks(settings, {
              emptyMessage: 'No contact links published yet.',
              includeContactPageLink: true,
            })}
          </section>
        </div>
      </main>

      <footer className="footerbar">Copyright © {currentYear} Misadventures in Germany</footer>
    </div>
  )
}

function ContactPageView({
  settings,
}: {
  settings: SiteSettings
}) {
  const currentYear = new Date().getFullYear()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)

  const contactTips = splitSettingList(settings.contact_tips)
  const contactEmail = settings.contact_email.trim()
  const hasContactEmail = contactEmail.length > 0
  const contactBackgroundImage = settings.contact_background_image_url.trim()
  const contactFormIntro =
    settings.contact_form_intro.trim() ||
    (hasContactEmail ? 'This form opens a prefilled email draft using your default mail app.' : '')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!hasContactEmail) {
      setSubmitMessage('A contact email has not been published yet.')
      return
    }

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    const trimmedSubject = subject.trim()
    const trimmedMessage = message.trim()

    if (!trimmedName || !trimmedEmail || !trimmedSubject || !trimmedMessage) {
      setSubmitMessage('Fill in all fields before opening your email draft.')
      return
    }

    const body = [
      `Name: ${trimmedName}`,
      `Email: ${trimmedEmail}`,
      '',
      trimmedMessage,
    ].join('\n')

    window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(
      trimmedSubject,
    )}&body=${encodeURIComponent(body)}`

    setSubmitMessage('Your email app should open with a prefilled draft.')
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <a href="#journal">Home</a>
        <a href="#about-me">About Me</a>
        <a href="#contact">Contact</a>
      </header>

      <main className="blog-layout contact-layout">
        <section
          className="contact-hero-card"
          style={{
            backgroundImage: contactBackgroundImage
              ? `linear-gradient(180deg, rgba(26, 49, 67, 0.28), rgba(18, 36, 49, 0.62)), url(${contactBackgroundImage})`
              : 'linear-gradient(180deg, rgba(26, 49, 67, 0.78), rgba(18, 36, 49, 0.92))',
          }}
        >
          <div className="contact-hero-content">
            <p className="contact-hero-kicker">{getSettingText(settings.contact_hero_eyebrow, 'Contact')}</p>
            <h1>{getSettingText(settings.contact_hero_title, 'Get in touch')}</h1>
            {settings.contact_hero_body.trim() ? <p>{settings.contact_hero_body}</p> : null}
          </div>
        </section>

        <div className="contact-grid">
          <section className="contact-form-card">
            <div className="section-label compact">
              {getSettingText(settings.contact_form_title, 'Write To Julia')}
            </div>
            <p className="contact-support-copy">
              {hasContactEmail ? (
                <>
                  {contactFormIntro} <strong>{contactEmail}</strong>.
                </>
              ) : (
                'A contact email has not been published yet.'
              )}
            </p>

            <form className="contact-form" onSubmit={handleSubmit}>
              <label className="contact-field">
                <span>Name</span>
                <input type="text" value={name} onChange={(event) => setName(event.target.value)} />
              </label>

              <label className="contact-field">
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>

              <label className="contact-field">
                <span>Subject</span>
                <input
                  type="text"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                />
              </label>

              <label className="contact-field contact-field--full">
                <span>Message</span>
                <textarea
                  rows={8}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />
              </label>

              <button className="contact-submit-button" disabled={!hasContactEmail} type="submit">
                {hasContactEmail ? 'Open email draft' : 'Email unavailable'}
              </button>
            </form>

            {submitMessage ? <p className="contact-feedback">{submitMessage}</p> : null}
          </section>

          <aside className="contact-sidebar">
            <section className="contact-info-card">
              <div className="section-label compact">
                {getSettingText(settings.contact_sidebar_title, 'Other Ways To Reach Me')}
              </div>
              {settings.contact_sidebar_body.trim() ? (
                <p>{settings.contact_sidebar_body}</p>
              ) : (
                <p className="empty-copy">No alternate contact copy published yet.</p>
              )}
              {renderSocialLinks(settings, {
                emptyMessage: 'No alternate contact links published yet.',
                includeDirectEmailLink: true,
              })}
            </section>

            <section className="contact-info-card">
              <div className="section-label compact">Best Messages</div>
              {contactTips.length > 0 ? (
                <ul className="contact-tip-list">
                  {contactTips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              ) : (
                <p className="empty-copy">No contact prompts published yet.</p>
              )}
            </section>
          </aside>
        </div>
      </main>

      <footer className="footerbar">Copyright © {currentYear} Misadventures in Germany</footer>
    </div>
  )
}

function App() {
  const currentYear = new Date().getFullYear()
  const [viewMode, setViewMode] = useState<ViewMode>(() => getViewMode())
  const [content, setContent] = useState(defaultPublicContent)
  const [syncMessage, setSyncMessage] = useState<string | null>(
    isSupabaseConfigured ? contentSyncingMessage : missingConfigMessage,
  )
  const [isFallback, setIsFallback] = useState(!isSupabaseConfigured)
  const [archiveQuery, setArchiveQuery] = useState('')
  const [archiveDate, setArchiveDate] = useState('')
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false)
  const { settings, stories: allStories, popularPosts, recentPosts, checklist } = content

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

    let cancelled = false

    async function syncContent() {
      const result = await loadPublicContent({
        client: supabase,
        isConfigured: isSupabaseConfigured,
      })

      if (cancelled) {
        return
      }

      setContent(result.content)
      setIsFallback(result.isFallback)
      setSyncMessage(result.syncMessage)
    }

    void syncContent()

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
  const storySlugs = new Set(allStories.map((story) => story.slug))
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

  if (viewMode.kind === 'about') {
    return <AboutPageView settings={settings} stories={allStories} />
  }

  if (viewMode.kind === 'contact') {
    return <ContactPageView settings={settings} />
  }

  if (viewMode.kind === 'post') {
    return <StoryDetailView settings={settings} story={selectedStory} isLoading={isStoryLoading} />
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <a href="#journal">Home</a>
        <a href="#about-me">About Me</a>
        <a href="#contact">Contact</a>
      </header>

      <main className="blog-layout">
        <section className="hero-panel">
          {settings.hero_eyebrow.trim() ? <p className="eyebrow">{settings.hero_eyebrow}</p> : null}
          <h1>{getSettingText(settings.hero_title, 'Misadventures in Germany')}</h1>
          {settings.hero_subtitle.trim() ? <p className="hero-subtitle">{settings.hero_subtitle}</p> : null}
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
                    <a
                      className="story-photo-frame"
                      href={`#post/${encodeURIComponent(story.slug)}`}
                      aria-label={`Open full story: ${story.title}`}
                    >
                      <div className="story-photo-clip">
                        <img src={story.image} alt={story.imageAlt} className="story-photo" />
                      </div>
                      <div className="story-hover-modal" aria-label={`${story.title} description`}>
                        <p>{story.summary}</p>
                        <p className="story-highlight">{story.highlight}</p>
                      </div>
                    </a>
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
          </section>

          <aside className="sidebar">
            <section className="sidebar-card author-card">
              <div className="section-label compact">Hello!</div>
              <a href="#about-me" className="avatar-link" aria-label={`Read more about ${getAuthorName(settings)}`}>
                <img src={authorAvatar} alt={`Cartoon portrait of ${getAuthorName(settings)}`} className="avatar" />
              </a>
              {settings.author_bio.trim() ? (
                <p>{settings.author_bio}</p>
              ) : (
                <p className="empty-copy">Author bio not published yet.</p>
              )}
            </section>

            <section className="sidebar-card">
              <div className="section-label compact">Popular Posts</div>
              <div className="sidebar-list">
                {popularPosts.length > 0 ? (
                  popularPosts.map((post) => (
                    <SidebarPostCard hasStory={storySlugs.has(post.slug)} key={post.slug} post={post} />
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
                    <SidebarPostCard hasStory={storySlugs.has(post.slug)} key={post.slug} post={post} />
                  ))
                ) : (
                  <p className="empty-copy">No recent entries yet.</p>
                )}
              </div>
            </section>

            <section className="sidebar-card sidebar-card--follow" id="contact">
              <div className="section-label compact">Follow Me</div>
              {renderSocialLinks(settings, {
                emptyMessage: 'No contact links published yet.',
                includeContactPageLink: true,
              })}
            </section>
          </aside>

          <div className="content-bottom-panels">
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
          </div>
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
