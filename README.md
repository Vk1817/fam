# 📡 CRICKCAST LIVE — FanCode Web Player (fixed)

A live sports streaming website powered by FanCode data, built for **Cloudflare Pages**.

## What was fixed in this version

1. **`index.html`** now actually fetches from Pranav's own auto-updated mirror
   (`Vk1817/Fancode_autoupdate/pranav.json`) instead of the old hardcoded
   `drmlive` URL, with a fallback to the `drmlive` feed directly if the mirror
   is ever unreachable. Cache-busting was added since `raw.githubusercontent.com`
   caches aggressively.
2. **`functions/api/proxy.js`** now rewrites `.m3u8` manifests (master +
   variant playlists, `#EXT-X-KEY` / `#EXT-X-MAP` URIs) so every segment and
   key request also routes back through the proxy with the correct
   `Referer`/`User-Agent`. This was the actual reason streams "loaded" in the
   player but never played — the browser was trying to fetch segments
   directly from FanCode's CDN and getting blocked.

## File Structure

```
crickcast/
├── index.html              ← Main matches listing page
├── fc-play.html            ← Video player page (Shaka Player)
├── README.md
└── functions/
    └── api/
        └── proxy.js        ← Cloudflare Pages proxy function (CORS + HLS rewrite)
```

## Deploy on Cloudflare Pages (Free)

1. Push this folder to a **GitHub repo** (or upload directly via drag-and-drop
   on an existing repo page).
2. Go to [Cloudflare Pages](https://pages.cloudflare.com) → Create a project.
3. Connect your GitHub repo.
4. **Build settings:** leave blank (static site).
5. Click **Deploy**.

`functions/api/proxy.js` runs automatically as a Cloudflare Worker.

## Data Source

Fetches live match data from:
```
https://raw.githubusercontent.com/Vk1817/Fancode_autoupdate/main/pranav.json
```
Auto-updated every 5 minutes via GitHub Actions, mirroring
`drmlive/fancode-live-events`.

## Credits

Original architecture by sayanpal514-hue/Sayan-Fancode-Web.
Data source: drmlive/fancode-live-events.
