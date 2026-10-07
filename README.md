# Chicago Marathon Pace Card

A small web app for people cheering at the Chicago Marathon (Sunday, October 11, 2026).
Enter your runner's pace and wave, and it tells you when they will pass every 5K split, the
popular spectator zones, and any cheer spots you add. Share one link with your whole crew.
Install it on your phone and it keeps working without signal.

Live: see the Vercel project `marathon-pace-card`.

## How it works

- Plain static files in `public/`. No framework, no build step, no runtime dependencies.
- `public/pace.js` holds all the math (pure functions, tested). `public/course-data.js` holds
  everything Chicago-specific: route, splits, neighbourhoods, popular zones.
- The map: the route is the official course GPS track (GoAndRace export of the 2025 course), lightly
  simplified, with miles scaled to 26.2188 along the track. One leg differs in 2026: the southbound
  Loop leg between Grand Ave. and Jackson Blvd. was corrected from State St. to Dearborn St., from the
  official 2026 printed map (`26-BACM-COURSE-MAP-PRINT.pdf`). Lake, river and parks are OpenStreetMap data (© OpenStreetMap contributors, ODbL), pulled
  with Overpass and simplified by `scripts/build-map-data.py`, which writes `public/map-data.js`.
  Positions are good to about a block.
- Times assume an even pace. On race day the official Chicago Marathon app has live tracking.
- The race-day runner dot uses the phone's local time, which is right for anyone standing in Chicago.

## Run locally

```
npm test          # unit tests (node --test)
npm run dev       # serves public/ on http://localhost:8123
```

## Deploy

Pushes to `main` deploy to Vercel automatically. Bump `VERSION` in `public/sw.js` whenever
files in `public/` change, so installed copies pick up the update.

## Icons

`public/icons/icon.svg` is the master. `python3 scripts/make-icons.py` renders the PNGs (needs Pillow).
