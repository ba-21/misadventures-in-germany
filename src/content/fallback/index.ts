import type { PublicContent } from '../types'
import { defaultStories } from './posts'
import { defaultChecklist, defaultPopularPosts, defaultRecentPosts } from './sidebar'
import { defaultSiteSettings } from './siteSettings'

export const defaultPublicContent: PublicContent = {
  settings: defaultSiteSettings,
  stories: defaultStories,
  popularPosts: defaultPopularPosts,
  recentPosts: defaultRecentPosts,
  checklist: defaultChecklist,
}

export { defaultChecklist, defaultPopularPosts, defaultRecentPosts, defaultSiteSettings, defaultStories }
