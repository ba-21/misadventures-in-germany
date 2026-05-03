create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

drop policy if exists "Admins can read all posts" on public.posts;
create policy "Admins can read all posts"
on public.posts
for select
to authenticated
using ((select public.is_admin()));

drop policy if exists "Admins can manage site settings" on public.site_settings;
create policy "Admins can manage site settings"
on public.site_settings
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Admins can manage posts" on public.posts;
create policy "Admins can manage posts"
on public.posts
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Admins can manage popular posts" on public.popular_posts;
create policy "Admins can manage popular posts"
on public.popular_posts
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Admins can manage recent posts" on public.recent_posts;
create policy "Admins can manage recent posts"
on public.recent_posts
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Admins can manage travel tips" on public.travel_tips;
create policy "Admins can manage travel tips"
on public.travel_tips
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Admins can manage post images" on storage.objects;
create policy "Admins can manage post images"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'post-images'
  and (select public.is_admin())
)
with check (
  bucket_id = 'post-images'
  and (select public.is_admin())
);
