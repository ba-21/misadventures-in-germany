import { defaultSiteSettings } from '../content/fallback/siteSettings'
import type { SiteSettings } from '../content/types'

export { defaultSiteSettings }
export type { SiteSettings }

export function withSiteSettingsDefaults(
  settings?: Partial<SiteSettings> | null,
): SiteSettings {
  return {
    ...defaultSiteSettings,
    ...settings,
    singleton: true,
    updated_at: settings?.updated_at ?? defaultSiteSettings.updated_at,
  }
}

export function splitSettingList(value: string): string[] {
  return value
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean)
}
