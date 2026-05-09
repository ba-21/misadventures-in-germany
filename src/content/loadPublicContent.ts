import type { SupabaseClient } from '@supabase/supabase-js'
import { withSiteSettingsDefaults } from '../lib/siteSettings'
import type { Database, Tables } from '../lib/database.types'
import { defaultPublicContent } from './fallback'
import { toSidebarPost, toStory } from './mappers'
import type { PublicContent } from './types'

type TravelTipRow = Tables<'travel_tips'>

export type LoadPublicContentResult = {
  content: PublicContent
  isFallback: boolean
  syncMessage: string | null
}

export const contentSyncingMessage = 'Syncing the latest entries from Supabase...'
export const missingConfigMessage =
  'Supabase env vars are missing, so the page is showing local fallback content.'
export const syncFailureFallbackMessage =
  'Live content could not be loaded. Showing local fallback content instead.'

export async function loadPublicContent({
  client,
  isConfigured,
}: {
  client: SupabaseClient<Database> | null
  isConfigured: boolean
}): Promise<LoadPublicContentResult> {
  if (!isConfigured || !client) {
    return {
      content: defaultPublicContent,
      isFallback: true,
      syncMessage: missingConfigMessage,
    }
  }

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

  const firstError = [
    settingsResult.error,
    storiesResult.error,
    popularPostsResult.error,
    recentPostsResult.error,
    checklistResult.error,
  ].find((error) => Boolean(error))

  if (firstError) {
    console.error('Supabase sync failed.', firstError)

    return {
      content: defaultPublicContent,
      isFallback: true,
      syncMessage: syncFailureFallbackMessage,
    }
  }

  return {
    content: {
      settings: withSiteSettingsDefaults(settingsResult.data),
      stories: (storiesResult.data ?? []).map(toStory),
      popularPosts: (popularPostsResult.data ?? []).map(toSidebarPost),
      recentPosts: (recentPostsResult.data ?? []).map(toSidebarPost),
      checklist: (checklistResult.data ?? []).map((item: TravelTipRow) => item.content),
    },
    isFallback: false,
    syncMessage: null,
  }
}
