import type { Tables } from '../lib/database.types'

export type SiteSettings = Tables<'site_settings'>

export type Story = {
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

export type Post = {
  slug: string
  title: string
  blurb: string
}

export type SidebarFallbackStoryTemplate = Omit<Story, 'slug' | 'title' | 'summary'>

export type PublicContent = {
  settings: SiteSettings
  stories: Story[]
  popularPosts: Post[]
  recentPosts: Post[]
  checklist: string[]
}
