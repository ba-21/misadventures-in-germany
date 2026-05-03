alter table public.posts
add column if not exists body text not null default '';

update public.posts
set body = case slug
  when 'koln-cathedral-sprint' then
    'The first view of Koln Cathedral should have been cinematic. Instead, it involved me exiting the station on the wrong side, dragging a backpack over uneven stones, and circling the plaza like someone who had lost both her map and her dignity in the same five-minute window.

Once I finally reached the open square, the frustration dropped away almost instantly. The cathedral is so oversized and dramatic that it makes every surrounding building look like stage dressing. Even the crowd noise seemed to flatten out under those towers. I stood there pretending to study the architecture when in reality I was mostly recovering from the suitcase workout.

The best part of Koln was how quickly the chaos turned into delight. One wrong turn led me toward the bridge, which gave me the view I should have aimed for in the first place: cathedral spires, the Hohenzollern Bridge, and the kind of grey-gold evening light that makes every bad navigational choice feel retroactively intentional.'
  when 'heidelberg-uphill' then
    'From the river, Heidelberg looked like it had been assembled by someone with a deep commitment to charm and absolutely no concern for calf muscles. The castle sat above the town with a level of confidence I found mildly offensive once I started climbing toward it.

Halfway up, I had reached the stage where every staircase feels personal. I stopped twice for water, once for emotional recovery, and once to admire a view I was too out of breath to fully appreciate. The old town below kept getting prettier while my posture got worse.

At the top, the payoff was immediate. Red roofs, wooded hills, and the river stretched out in a way that made the entire uphill negotiation feel almost reasonable. Scenic views in Germany are rarely free. They usually require either excellent shoes or a willingness to suffer artistically.'
  when 'dresden-detour' then
    'The plan in Dresden was simple: stay on the platform, stretch my legs, and get back on the train with the composure of a competent adult. The actual result was a slow-motion drift toward a riverside market I had no business finding during a "quick stop."

One stall smelled like potato soup, another had pastries that were impossible to ignore, and somewhere nearby a violinist was performing with such confidence that it felt rude to hurry. I kept telling myself I had time, which is historically the exact thought that causes me trouble.

What made Dresden memorable was how quietly it won me over. There was no dramatic mishap, just the realization that a city can derail your schedule by being too beautiful to leave at platform distance. Germany keeps doing this thing where logistical mistakes become emotional highlights.'
  when 'berlin-after-midnight' then
    'Berlin after dark has a very specific talent for making every street corner look like it could lead either to a perfect evening or an accidental forty-minute detour. I went out for a casual walk and ended up on a mission to find a courtyard bar that apparently existed in a dimension adjacent to my own.

The directions I received were all technically sensible. "Second archway, then left past the bicycles" should not have been difficult. Unfortunately, each set of bicycles in Berlin appears to lead to a completely different social universe. I kept arriving somewhere plausible, but never somewhere correct.

Eventually I found the place, mostly by surrendering to the city''s logic instead of insisting on mine. Berlin rewards curiosity, improvisation, and a tolerance for being wrong in public. It is less interested in rewarding neat itineraries.'
  when 'hamburg-but-wetter' then
    'Hamburg introduced itself with water from every possible direction. The harbor tour guide promised dramatic weather, which in retrospect should have been treated less like marketing copy and more like a legal disclaimer.

By the second bridge, my umbrella had inverted into a modern art installation. A gull carried out a daylight robbery involving half a fish sandwich, and everyone around me behaved as though this was simply part of the city''s standard onboarding process.

Still, Hamburg has the unfair advantage of being lovely even when it is actively trying to soak you through. Brick facades, steel bridges, and grey skies all conspired to make the entire ordeal look cinematic. Also, the cinnamon roll afterward was strong enough to repair morale at a structural level.'
  when 'munich-madness' then
    'Munich managed to humble me before lunch. I approached the ticket area with the confidence of someone who had watched exactly one helpful travel video and concluded that this made her effectively local.

What I validated, unfortunately, was not my ticket but my ability to misunderstand a machine with real authority. Forty minutes later I was balancing an enormous pretzel, attempting apology-German, and learning that public transit systems do not award points for enthusiasm.

Once the panic passed, Munich softened considerably. The city has a way of making even your mistakes feel clean, efficient, and well-lit. I spent the rest of the day recovering through architecture, pastries, and a renewed respect for any button that appears official.'
  else body
end
where coalesce(body, '') = '';
