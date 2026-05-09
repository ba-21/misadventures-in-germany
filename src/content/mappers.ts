import type { Tables } from '../lib/database.types'
import type { Post, Story } from './types'

type StoryRow = Tables<'posts'>
type SidebarPostRow = Tables<'popular_posts'>
type RecentPostRow = Tables<'recent_posts'>

const sidebarPostSlugAliases: Record<string, string> = {
  'the-cologne-cathedral-sprint': 'koln-cathedral-sprint',
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function resolveSidebarPostSlug(title: string): string {
  const normalized = slugify(title)
  return sidebarPostSlugAliases[normalized] ?? normalized
}

export function toStory(story: StoryRow): Story {
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

export function toSidebarPost(post: SidebarPostRow | RecentPostRow): Post {
  return {
    slug: resolveSidebarPostSlug(post.title),
    title: post.title,
    blurb: post.blurb,
  }
}
