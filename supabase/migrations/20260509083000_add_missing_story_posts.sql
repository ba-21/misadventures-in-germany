insert into public.posts (
  slug,
  title,
  location,
  day_label,
  summary,
  highlight,
  body,
  cover_image_url,
  cover_image_alt,
  sort_order,
  status,
  published_at
)
values
  (
    'how-i-ordered-seven-mustards',
    'How I Ordered Seven Mustards',
    'Nuremberg',
    'Side Note',
    'A sausage stand misunderstanding with excellent consequences and far more mustard than the situation required.',
    'Ordering with confidence only works if the confidence is attached to the right noun.',
    'The plan was simple enough: point at one sausage, ask for mustard, look competent, and leave with lunch. Instead, I managed to trigger an escalating sequence of condiments that suggested I was either hosting a tasting panel or quietly opening a mustard dealership.

The vendor was efficient, unbothered, and far too experienced to be surprised by my improvised German. By the time I realized I had said something closer to "several kinds, please" than "just a little," the counter was already covered in tiny yellow negotiations.

In fairness, it was not a total failure. Germany tends to reward even bad ordering decisions with something delicious, and this one came with a useful reminder: if you are going to guess, do it in front of people who know how to keep the line moving.',
    'https://upload.wikimedia.org/wikipedia/commons/b/b0/German_Bratw%C3%BCrste.jpg',
    'Bratwurst grilling at the Hauptmarkt in Nuremberg',
    11,
    'published',
    '2026-04-27T09:10:00+00:00'
  ),
  (
    'lost-in-the-black-forest',
    'Lost in the Black Forest',
    'Black Forest',
    'Side Note',
    'A scenic detour featuring fog, cake, and zero phone signal.',
    'Dense trees, low fog, and one excellent cake stop can make a wrong turn feel extremely deliberate.',
    'Some places make getting lost feel like incompetence. The Black Forest makes it feel like a mood board. I missed the correct walking path, followed what looked like a reasonable trail, and ended up in the kind of fog that makes every tree look slightly more literary than necessary.

The practical part was less romantic. Signal disappeared, the trail markers became sporadic, and I had to decide whether confidence or caution was more convincing. Fortunately, the region also seems committed to placing cake within reach of mild crisis.

By the time I found my way back, the detour had fully rewritten the day. It is hard to stay annoyed when the scenery is dramatic, the air smells like wet pine, and someone hands you a slice of something dense and perfect on a porcelain plate.',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Path_into_the_forest_%28Blackforest%29.jpg/1280px-Path_into_the_forest_%28Blackforest%29.jpg',
    'Misty hiking path through the Black Forest',
    10,
    'published',
    '2026-04-26T08:40:00+00:00'
  ),
  (
    'frankfurt-layover-panic',
    'Frankfurt Layover Panic',
    'Frankfurt',
    'Side Note',
    'Twenty-seven minutes, one wrong escalator, and a surprisingly calm pretzel vendor.',
    'A short layover becomes much longer in your head the second you take the wrong escalator.',
    'Frankfurt was supposed to be a brief and highly controlled transfer. Instead, it became a time trial involving one wrong escalator, a platform display that changed just as I reached it, and the very specific kind of optimism people develop when there are still twenty-seven minutes left on the clock.

The station itself did not help by being efficient in a way that assumes you also intend to be efficient. I went up when I should have gone down, cut across the wrong concourse, and briefly considered whether sprinting with luggage counts as character development.

The strangest part was how calm everyone else seemed. A pretzel vendor watched the whole sequence with the expression of someone who had seen far worse by breakfast. He was probably right, but at the time I felt like the only person in Germany negotiating with stairs on a deadline.',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Inside_Frankfurt_Airport_2017.jpg/1280px-Inside_Frankfurt_Airport_2017.jpg',
    'Interior of Frankfurt Airport Terminal 2',
    12,
    'published',
    '2026-04-28T07:55:00+00:00'
  ),
  (
    'neuschwanstein-in-bad-shoes',
    'Neuschwanstein in Bad Shoes',
    'Neuschwanstein',
    'Side Note',
    'A castle worth the climb, even when your footwear files a formal complaint.',
    'Fairy-tale scenery is less forgiving when your footwear has quietly stopped supporting the mission.',
    'Neuschwanstein is the kind of place that encourages heroic expectations. Unfortunately, I arrived dressed for "picturesque outing" rather than "inclined approach with consequences." The castle was stunning; my shoes were emotionally unavailable.

Every scenic stretch on the way up introduced a fresh negotiation between beauty and blisters. The views kept improving, which was tactically useful because it prevented me from focusing entirely on the poor life choices happening below the ankle.

Still, there are worse places to learn a lesson about preparation. The whole landscape looks engineered to reward persistence, even when that persistence is limping slightly. By the time the castle finally filled the frame, I was willing to forgive both Bavaria and myself.',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Exterior_of_Neuschwanstein_Castle.jpg/1280px-Exterior_of_Neuschwanstein_Castle.jpg',
    'Exterior of Neuschwanstein Castle above the Bavarian landscape',
    9,
    'published',
    '2026-04-25T10:05:00+00:00'
  )
on conflict (slug) do update
set
  title = excluded.title,
  location = excluded.location,
  day_label = excluded.day_label,
  summary = excluded.summary,
  highlight = excluded.highlight,
  body = excluded.body,
  cover_image_url = excluded.cover_image_url,
  cover_image_alt = excluded.cover_image_alt,
  sort_order = excluded.sort_order,
  status = excluded.status,
  published_at = excluded.published_at;
