create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.site_settings (
  singleton boolean primary key default true check (singleton),
  hero_eyebrow text not null,
  hero_title text not null,
  hero_subtitle text not null,
  author_name text not null,
  author_initials text not null,
  author_bio text not null,
  instagram_url text not null,
  youtube_url text not null,
  contact_email text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  location text not null,
  day_label text not null,
  summary text not null,
  highlight text not null,
  cover_image_url text not null,
  cover_image_alt text not null,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.popular_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  blurb text not null,
  sort_order integer not null default 0 unique,
  created_at timestamptz not null default now()
);

create table if not exists public.recent_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  blurb text not null,
  sort_order integer not null default 0 unique,
  created_at timestamptz not null default now()
);

create table if not exists public.travel_tips (
  id uuid primary key default gen_random_uuid(),
  content text not null unique,
  sort_order integer not null default 0 unique,
  created_at timestamptz not null default now()
);

create index if not exists posts_status_sort_order_idx
  on public.posts (status, sort_order);

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
before update on public.site_settings
for each row
execute function public.set_updated_at();

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
before update on public.posts
for each row
execute function public.set_updated_at();

alter table public.site_settings enable row level security;
alter table public.posts enable row level security;
alter table public.popular_posts enable row level security;
alter table public.recent_posts enable row level security;
alter table public.travel_tips enable row level security;

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
on public.site_settings
for select
to public
using (true);

drop policy if exists "Public can read published posts" on public.posts;
create policy "Public can read published posts"
on public.posts
for select
to public
using (status = 'published');

drop policy if exists "Public can read popular posts" on public.popular_posts;
create policy "Public can read popular posts"
on public.popular_posts
for select
to public
using (true);

drop policy if exists "Public can read recent posts" on public.recent_posts;
create policy "Public can read recent posts"
on public.recent_posts
for select
to public
using (true);

drop policy if exists "Public can read travel tips" on public.travel_tips;
create policy "Public can read travel tips"
on public.travel_tips
for select
to public
using (true);

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can view post images" on storage.objects;
create policy "Public can view post images"
on storage.objects
for select
to public
using (bucket_id = 'post-images');

insert into public.site_settings (
  singleton,
  hero_eyebrow,
  hero_title,
  hero_subtitle,
  author_name,
  author_initials,
  author_bio,
  instagram_url,
  youtube_url,
  contact_email
)
values (
  true,
  'Travel notes from missed turns and lucky detours',
  'Misadventures in Germany',
  'A scrapbook-style travel blog about trains missed by seconds, bakeries discovered by accident, and every chaotic mile in between.',
  'Julia',
  'JT',
  'I am Julia, a chronic over-planner documenting what happens when a color-coded itinerary meets Deutsche Bahn and questionable shortcuts.',
  'https://www.instagram.com',
  'https://www.youtube.com',
  'hello@misadventuresingermany.com'
)
on conflict (singleton) do update
set
  hero_eyebrow = excluded.hero_eyebrow,
  hero_title = excluded.hero_title,
  hero_subtitle = excluded.hero_subtitle,
  author_name = excluded.author_name,
  author_initials = excluded.author_initials,
  author_bio = excluded.author_bio,
  instagram_url = excluded.instagram_url,
  youtube_url = excluded.youtube_url,
  contact_email = excluded.contact_email;

insert into public.posts (
  slug,
  title,
  location,
  day_label,
  summary,
  highlight,
  cover_image_url,
  cover_image_alt,
  sort_order,
  status,
  published_at
)
values
  (
    'munich-madness',
    'Munich Madness',
    'Munich',
    'Day 2',
    'I meant to validate my train ticket and somehow validated my confidence instead. Forty minutes later I was sharing apology-German with a conductor while balancing a pretzel bigger than my face.',
    'Lesson learned: when a machine looks important in Germany, it is.',
    'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80',
    'Munich city skyline at golden hour',
    1,
    'published',
    now()
  ),
  (
    'hamburg-but-wetter',
    'Hamburg, But Wetter',
    'Hamburg',
    'Day 5',
    'The harbor tour guide promised dramatic weather and delivered with theatrical commitment. My umbrella folded inside out before we reached the second bridge, and a gull stole half a fish sandwich in broad daylight.',
    'The rain was aggressive, but the cinnamon roll justified the ordeal.',
    'https://images.unsplash.com/photo-1534313314376-a72289b6181e?auto=format&fit=crop&w=1200&q=80',
    'Hamburg waterfront with boats and historic buildings',
    2,
    'published',
    now()
  ),
  (
    'berlin-after-midnight',
    'Berlin After Midnight',
    'Berlin',
    'Day 8',
    'A casual evening walk became an accidental three-hour search for the correct courtyard bar. Everyone I asked gave perfectly logical directions, which I interpreted in increasingly experimental ways.',
    'Berlin rewards curiosity and mildly punishes poor navigation.',
    'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1200&q=80',
    'Berlin street with warm evening lights',
    3,
    'published',
    now()
  ),
  (
    'dresden-detour',
    'Dresden Detour',
    'Dresden',
    'Day 10',
    'I stepped off the train for a quick platform break and somehow ended up in a riverside market with violin music, potato soup, and absolutely no sense of time.',
    'In Germany, a short stop can escalate into a full memory without warning.',
    'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80',
    'Dresden skyline along the Elbe River',
    4,
    'published',
    now()
  ),
  (
    'heidelberg-uphill',
    'Heidelberg Uphill',
    'Heidelberg',
    'Day 12',
    'The castle looked charming from below and deeply personal from the staircase. By the time I reached the top, my backpack, my calves, and my dignity were all negotiating separately.',
    'Scenic views in Germany are apparently paid for in leg effort.',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Heidelberg_Castle%2C_2014.JPG/1280px-Heidelberg_Castle%2C_2014.JPG',
    'Heidelberg castle overlooking the old town',
    5,
    'published',
    now()
  )
on conflict (slug) do update
set
  title = excluded.title,
  location = excluded.location,
  day_label = excluded.day_label,
  summary = excluded.summary,
  highlight = excluded.highlight,
  cover_image_url = excluded.cover_image_url,
  cover_image_alt = excluded.cover_image_alt,
  sort_order = excluded.sort_order,
  status = excluded.status,
  published_at = excluded.published_at;

insert into public.popular_posts (title, blurb, sort_order)
values
  (
    'How I Ordered Seven Mustards',
    'A sausage stand misunderstanding with excellent consequences.',
    1
  ),
  (
    'Lost in the Black Forest',
    'A scenic detour featuring fog, cake, and zero phone signal.',
    2
  ),
  (
    'The Cologne Cathedral Sprint',
    'Arrived reverent, left breathless, still worth it.',
    3
  )
on conflict (title) do update
set
  blurb = excluded.blurb,
  sort_order = excluded.sort_order;

insert into public.recent_posts (title, blurb, sort_order)
values
  (
    'Frankfurt Layover Panic',
    'Twenty-seven minutes, one wrong escalator, and a surprisingly calm pretzel vendor.',
    1
  ),
  (
    'Leipzig Tram Roulette',
    'I boarded confidently, exited somewhere interpretive, and found a great coffee shop.',
    2
  ),
  (
    'Neuschwanstein in Bad Shoes',
    'A castle worth the climb, even when your footwear files a formal complaint.',
    3
  )
on conflict (title) do update
set
  blurb = excluded.blurb,
  sort_order = excluded.sort_order;

insert into public.travel_tips (content, sort_order)
values
  (
    'Always carry coins for station lockers and emergency pastries.',
    1
  ),
  (
    'Assume platform changes are part of the character-building exercise.',
    2
  ),
  (
    'Trust bakery windows more than any itinerary.',
    3
  )
on conflict (content) do update
set
  sort_order = excluded.sort_order;
