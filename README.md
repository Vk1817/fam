# CrickCast — Live Sports

A lightweight live-sports frontend that automatically reads the latest match feed from the **drmlive/fancode-live-events** repository. The UI is based on the supplied Cricket Yoddha design, with the data source switched to the requested `fancode.json`.

## Data source

The application fetches the latest data directly from:

`https://raw.githubusercontent.com/drmlive/fancode-live-events/main/fancode.json`

The frontend reads the `matches` array and uses the published `dai_url` first, with `adfree_url` as a fallback. No stream URLs are hard-coded into the project.

## Features

- CrickCast branding
- Automatic live-match feed refresh
- LIVE / upcoming match cards
- Match artwork and tournament information
- DAI and Ad-Free stream choices when published by the feed
- Clappr player with quality selector support
- Responsive desktop/mobile layout
- No build step required

## Project structure

```text
CrickCast/
├── index.html
├── fc/
│   └── player.html
├── README.md
└── LICENSE
```

## How it works

```text
drmlive/fancode-live-events
          │
          ▼
     fancode.json
          │
          ▼
       CrickCast
          │
     ┌────┴────┐
     ▼         ▼
 dai_url   adfree_url
     │         │
     └────┬────┘
          ▼
     Video player
```

## Deployment

Upload the project to GitHub and deploy it with GitHub Pages, Cloudflare Pages, Netlify, or another static hosting provider. No Node.js build command is required.

## Notes

The stream URLs are consumed at runtime because live CDN URLs may change or expire. Browser playback also depends on the upstream stream server allowing the required requests.

## Branding

**CrickCast** is the frontend brand for this implementation. The upstream JSON remains the external data source.
