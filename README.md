# Leonida Platinum

[![GTA 6 Trophy Guide](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/kainze29/gta6-trophy-guide-01/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/kainze29/gta6-trophy-guide-01/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

The best offline guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI. Built for the [gta6-trophy-guide-01 bounty on make.fun](https://make.fun/c/gta6-trophy-guide-01). See also [make.fun](https://make.fun).

## What it is

Leonida Platinum covers every one of the game's 55 trophies (1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden) with the official name, description and grade exactly as PlayStation publishes them, plus a guide in our own words for each one: what to do, where and how, and when it can be missed. Every guide cites its sources, and steps that go beyond the official description are marked honestly as inferred, not yet verified in game.

It is a tracker too. Tick trophies off as you earn them and progress is saved in your browser (localStorage), with a progress bar and per-grade counters. You can export your progress to a JSON file and import it back later.

## Features

- Checklist of all 55 trophies with earned checkboxes saved in localStorage
- Progress bar and counters (x of 55, plus platinum, gold, silver and bronze counts)
- Export progress to JSON and import it back, plus reset
- Filters by kind (story, missable, collectibles, activities, cleanup) and by grade, plus text search and an earned-only toggle
- Spoiler setting that hides the names and descriptions of unearned story (hidden) trophies until they are earned
- Roadmap to the platinum in six ordered stages: story, side strands, activities, collectibles, money and cleanup
- Missables page flagging all 8 missable trophies with why each one can be missed
- Detail pane for every trophy: official name, description and grade, its guide, its sources, and its tracked count where PlayStation tracks one
- Fully offline: static files only, no build step, no network requests at run time, no Rockstar logo or official artwork

## How to run offline

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. The app works with the network off: every file it loads lives under `app/`.

## Layout

- `app/index.html` - the page shell
- `app/style.css` - the Vice City night theme
- `app/app.js` - boot, routing and wiring
- `app/store.js` - localStorage progress, export and import
- `app/filters.js` - filters, search and the spoiler rule
- `app/views.js` - checklist, detail pane, roadmap and missables views
- `app/data/trophies.json` - the 55 official trophies with guides and sources
- `app/data/roadmap.json` - the six roadmap stages
- `main.ts` - hands the entry in (copies `app/` and `screenshots/` to the output directory and writes `dossier.json`)
- `serve.ts` - tiny static server for local use
- `screenshots/` - four screenshots of the guide running

## Sources

Official trophy names, descriptions and grades as published by PlayStation, as listed by Exophase (exophase.com) and PSNProfiles (psnprofiles.com). Guides are original writing for this entry; nothing is copied from other guides.

## License

MIT. See LICENSE.
