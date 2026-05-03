alter table public.site_settings
add column if not exists about_hero_title text not null default 'Julia plans everything. Germany edits the draft.',
add column if not exists about_story_body text not null default 'I started this blog because my most memorable travel moments were never the ones I scheduled. They were the platform changes, scenic wrong turns, suspiciously good pastries, and the small recoveries that turned minor disasters into stories worth retelling.

If a city can be explored with a notebook, a day pass, and a willingness to look slightly lost in public, I am interested. I like layered itineraries, old train halls, riverside walks, and the exact bakery you only find after taking the wrong exit.',
add column if not exists about_badges text not null default 'Color-coded plans
Train-platform optimism
Emergency pastry strategy',
add column if not exists about_blog_section_title text not null default 'What This Blog Covers',
add column if not exists about_blog_section_body text not null default 'The blog is built around first-person travel entries rather than destination guides. You will get the architecture, the atmosphere, and the practical chaos, but always through the lens of what actually happened on the day.

Expect rail mishaps, museum pacing errors, strong opinions about bakery windows, and occasional evidence that a bad turn can still produce the best photograph.',
add column if not exists about_travel_pattern_title text not null default 'Travel Pattern',
add column if not exists about_travel_pattern_stat_1_value text not null default '1',
add column if not exists about_travel_pattern_stat_1_text text not null default 'notebook always in the bag, even when the map app is open',
add column if not exists about_travel_pattern_stat_2_value text not null default '3',
add column if not exists about_travel_pattern_stat_2_text text not null default 'backup plans for every long train ride, none of them ever fully survive',
add column if not exists about_travel_pattern_stat_3_value text not null default 'Infinity',
add column if not exists about_travel_pattern_stat_3_text text not null default 'small detours that somehow become the story worth writing down',
add column if not exists about_travel_style_title text not null default 'How I Travel',
add column if not exists about_travel_style_body text not null default 'I usually arrive with a careful list and leave with handwriting that gets less tidy by the hour. The system is simple: start with one reliable landmark, walk until the city starts making better suggestions, and record the moment the day stops behaving like the plan.

That is why the posts on this site are equal parts place, mood, and mild logistical regret. It is also why I trust local bakeries more than perfect timing.',
add column if not exists about_contact_title text not null default 'Say Hello',
add column if not exists about_contact_body text not null default 'If you enjoy travel writing that keeps the polish but leaves in the mistakes, you are in the right place. Send recommendations, station survival tips, or your own favorite accidental detours.',
add column if not exists contact_background_image_url text not null default 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Heidelberg_Castle%2C_2014.JPG/1280px-Heidelberg_Castle%2C_2014.JPG',
add column if not exists contact_hero_eyebrow text not null default 'Contact',
add column if not exists contact_hero_title text not null default 'Send a note from your own detour.',
add column if not exists contact_hero_body text not null default 'Questions, travel recommendations, station survival strategies, or a city I should get lost in next all belong here.',
add column if not exists contact_form_title text not null default 'Write To Julia',
add column if not exists contact_form_intro text not null default 'This form opens a prefilled email draft using your default mail app.',
add column if not exists contact_sidebar_title text not null default 'Other Ways To Reach Me',
add column if not exists contact_sidebar_body text not null default 'If you prefer a direct route, the links below go straight to the channels already listed on the site.',
add column if not exists contact_tips text not null default 'Unexpected travel finds worth adding to the list.
German city recommendations with strong bakery density.
Notes about a post that made you laugh or wince in recognition.';
