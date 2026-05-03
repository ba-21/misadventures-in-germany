import type { Tables } from './database.types'

export type SiteSettings = Tables<'site_settings'>

export const defaultSiteSettings: SiteSettings = {
  about_badges:
    'Color-coded plans\nTrain-platform optimism\nEmergency pastry strategy',
  about_blog_section_body:
    'The blog is built around first-person travel entries rather than destination guides. You will get the architecture, the atmosphere, and the practical chaos, but always through the lens of what actually happened on the day.\n\nExpect rail mishaps, museum pacing errors, strong opinions about bakery windows, and occasional evidence that a bad turn can still produce the best photograph.',
  about_blog_section_title: 'What This Blog Covers',
  about_contact_body:
    'If you enjoy travel writing that keeps the polish but leaves in the mistakes, you are in the right place. Send recommendations, station survival tips, or your own favorite accidental detours.',
  about_contact_title: 'Say Hello',
  about_hero_title: 'Julia plans everything. Germany edits the draft.',
  about_story_body:
    'I started this blog because my most memorable travel moments were never the ones I scheduled. They were the platform changes, scenic wrong turns, suspiciously good pastries, and the small recoveries that turned minor disasters into stories worth retelling.\n\nIf a city can be explored with a notebook, a day pass, and a willingness to look slightly lost in public, I am interested. I like layered itineraries, old train halls, riverside walks, and the exact bakery you only find after taking the wrong exit.',
  about_travel_pattern_stat_1_text: 'notebook always in the bag, even when the map app is open',
  about_travel_pattern_stat_1_value: '1',
  about_travel_pattern_stat_2_text:
    'backup plans for every long train ride, none of them ever fully survive',
  about_travel_pattern_stat_2_value: '3',
  about_travel_pattern_stat_3_text:
    'small detours that somehow become the story worth writing down',
  about_travel_pattern_stat_3_value: 'Infinity',
  about_travel_pattern_title: 'Travel Pattern',
  about_travel_style_body:
    'I usually arrive with a careful list and leave with handwriting that gets less tidy by the hour. The system is simple: start with one reliable landmark, walk until the city starts making better suggestions, and record the moment the day stops behaving like the plan.\n\nThat is why the posts on this site are equal parts place, mood, and mild logistical regret. It is also why I trust local bakeries more than perfect timing.',
  about_travel_style_title: 'How I Travel',
  author_bio:
    'I am Julia, a chronic over-planner documenting what happens when a color-coded itinerary meets Deutsche Bahn and questionable shortcuts.',
  author_initials: 'JT',
  author_name: 'Julia',
  contact_background_image_url:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Heidelberg_Castle%2C_2014.JPG/1280px-Heidelberg_Castle%2C_2014.JPG',
  contact_email: 'hello@misadventuresingermany.com',
  contact_form_intro: 'This form opens a prefilled email draft using your default mail app.',
  contact_form_title: 'Write To Julia',
  contact_hero_body:
    'Questions, travel recommendations, station survival strategies, or a city I should get lost in next all belong here.',
  contact_hero_eyebrow: 'Contact',
  contact_hero_title: 'Send a note from your own detour.',
  contact_sidebar_body:
    'If you prefer a direct route, the links below go straight to the channels already listed on the site.',
  contact_sidebar_title: 'Other Ways To Reach Me',
  contact_tips:
    'Unexpected travel finds worth adding to the list.\nGerman city recommendations with strong bakery density.\nNotes about a post that made you laugh or wince in recognition.',
  hero_eyebrow: 'Travel notes from missed turns and lucky detours',
  hero_subtitle:
    'A scrapbook-style travel blog about trains missed by seconds, bakeries discovered by accident, and every chaotic mile in between.',
  hero_title: 'Misadventures in Germany',
  instagram_url: 'https://www.instagram.com',
  singleton: true,
  updated_at: '',
  youtube_url: 'https://www.youtube.com',
}

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
