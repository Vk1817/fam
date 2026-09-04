# 🏏 CrickCast

> **Simple. Live. Automatic.**

![CrickCast Banner](assets/banner.svg)

CrickCast is a lightweight live-events web frontend that automatically reads the latest match data and **current live-stream URLs** from the upstream `fancode.json` feed. The project is intentionally simple: one frontend, no database, no build system, and no manually maintained stream-link list.

![CrickCast Preview](assets/preview.svg)

## ✨ What CrickCast Does

- 🔄 **Automatic updates** — fetches the upstream JSON every 60 seconds.
- 🔴 **Live-first listing** — currently live matches appear first.
- 🔗 **Dynamic stream URLs** — reads `dai_url` and `adfree_url` directly from each current match record.
- ▶️ **In-page playback** — clicking **Watch Live** opens the stream in the CrickCast player instead of sending the user to GitHub.
- 🖼️ **Event artwork** — uses the image supplied by the feed.
- 📱 **Responsive UI** — designed for desktop, tablet and mobile.
- ⚡ **No build step** — plain HTML, CSS and JavaScript.

## 🧭 Architecture

![CrickCast Architecture](assets/architecture.svg)

```text
┌──────────────────────────────────────────┐
│ drmlive/fancode-live-events              │
│ fancode.json                             │
└─────────────────────┬────────────────────┘
                      │
                      │ fresh JSON request
                      ▼
┌──────────────────────────────────────────┐
│                 CrickCast                │
│                 index.html                │
└─────────────────────┬────────────────────┘
                      │
             ┌────────┴─────────┐
             │                  │
             ▼                  ▼
       Match information   dai_url / adfree_url
                                │
                                ▼
                         Browser HLS player
```

The important point is that **stream URLs are not hard-coded into CrickCast**. Each page load and automatic refresh retrieves the latest values supplied by the upstream JSON.

## 🔗 Upstream Data Source

Default source:

```text
https://raw.githubusercontent.com/drmlive/fancode-live-events/main/fancode.json
```

The feed contains a `matches` array. A live match can include fields such as:

```json
{
  "match_id": "...",
  "match_name": "Team A vs Team B",
  "team_1": "Team A",
  "team_2": "Team B",
  "status": "LIVE",
  "src": "https://.../image.jpg",
  "dai_url": "https://.../1080p.m3u8?...",
  "adfree_url": "https://.../1080p.m3u8?..."
}
```

### Stream selection

For every match, CrickCast builds its stream candidates from:

1. `dai_url`
2. `adfree_url`

The first available URL is used. If the first source cannot be played, the player attempts the next available candidate.

Because these URLs can be signed and time-limited, CrickCast fetches them dynamically instead of storing old copies in the repository.

## 📁 Project Structure

```text
CrickCast/
├── index.html                 # Complete frontend, feed loader and HLS player
├── assets/
│   ├── banner.svg             # README hero artwork
│   ├── architecture.svg      # Architecture diagram
│   └── preview.svg            # Product/UI preview
├── LICENSE
└── README.md
```

The project deliberately contains **no separate player page and no server-side proxy**. The browser receives the current stream URL directly from the live JSON feed.

## ▶️ Playback

The frontend uses [HLS.js](https://github.com/video-dev/hls.js) where Media Source Extensions are required and native HLS playback where the browser supports it.

Playback flow:

```text
User clicks Watch Live
        ↓
Current match object
        ↓
Read dai_url
        ↓
Fallback to adfree_url if necessary
        ↓
HLS.js / native HLS
        ↓
CrickCast video player
```

If a stream cannot play, the UI reports that the upstream URL may have expired or may not be available to the browser.

> **Important:** Use only streams that you are authorized to access, display, or redistribute. CrickCast does not attempt to bypass DRM, authentication, paywalls, or other access controls.

## 🚀 Deployment

CrickCast is a static website and can be deployed to any static hosting platform.

### GitHub Pages / Cloudflare Pages / Netlify

1. Push the project to your repository.
2. Select the repository in your hosting provider.
3. Use the project root as the publishing directory.
4. No build command is required.
5. Deploy.

## 🔧 Configuration

At the top of `index.html`:

```js
const DATA_URL = 'https://raw.githubusercontent.com/drmlive/fancode-live-events/main/fancode.json';
const REFRESH_MS = 60000;
```

`DATA_URL` controls the upstream JSON source and `REFRESH_MS` controls the automatic refresh interval.

## 🧪 Troubleshooting

### Matches load but the player does not start

Check:

- the match is currently marked `LIVE`;
- the current JSON record contains `dai_url` or `adfree_url`;
- the signed stream URL has not expired;
- the upstream CDN permits playback from the browser;
- the browser console does not report a CORS, network, or HLS error.

### The site shows old matches

Use **Refresh**. CrickCast also performs an automatic refresh every 60 seconds and uses a cache-busting request so it does not intentionally retain an old JSON response.

### The URL works elsewhere but not in CrickCast

The browser may be enforcing the source server's CORS policy or another playback restriction. CrickCast does not circumvent those controls.

## 🎨 Design

CrickCast uses a compact dark sports interface with:

- strong CrickCast branding;
- live-status badges;
- match artwork;
- responsive event cards;
- an integrated video modal; and
- minimal controls for a fast viewing experience.

![CrickCast UI](assets/preview.svg)

## 🛠️ Technology

- HTML5
- CSS3
- Vanilla JavaScript
- HLS.js
- GitHub-hosted JSON feed

## 📄 License

See [`LICENSE`](LICENSE) for the applicable license terms.

## 🙌 Credits

CrickCast is a lightweight frontend project built around a dynamically supplied live-events JSON feed.

**CrickCast — Simple. Live. Automatic.**
