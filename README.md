# 📡 CRICKCAST LIVE

> A lightweight, auto-refreshing live sports web application with a dedicated streaming player.

## 🌐 Live Website

**CRICKCAST:** https://crickcast-fam.pages.dev/

---

## ✨ Features

- 📺 Live and upcoming sports event listings
- 🔄 Automatic feed refresh in the browser
- ⚡ Dedicated Shaka Player page for playback
- 🖥️ Responsive desktop and mobile interface
- 🌙 Light / dark theme support
- 📡 Telegram community integration
- ☁️ Cloudflare Pages compatible deployment
- 💰 Publisher Popunder and Social Bar integration

---

## 🧩 Project Structure

```text
CRICKCAST
├── index.html
├── fc-play.html
├── fc/
│   └── player.html
├── functions/
│   └── api/
│       └── proxy.js
├── assets/
│   ├── architecture.svg
│   ├── banner.svg
│   ├── feature-strip.svg
│   ├── logo-mark.svg
│   ├── preview.svg
│   └── ui-preview.svg
└── README.md
```

### Application Flow

```text
Auto-updated FanCode feed
        ↓
   index.html
        ↓
Live / Upcoming match cards
        ↓
   Watch Live
        ↓
  fc-play.html
        ↓
     Shaka Player
        ↓
   HLS stream playback
```

---

## 🔄 Automatic Updates

CRICKCAST uses the auto-updated event feed maintained in the **Vk1817/Fancode_autoupdate** repository.

**Primary JSON feed**

```
https://raw.githubusercontent.com/Vk1817/Fancode_autoupdate/main/pranav.json
```

The feed is updated automatically through GitHub Actions, while the CRICKCAST homepage re-checks the feed periodically so newly available live events and refreshed stream information can appear without manually editing the site.

---

## 🎬 Player

The main player is served from:

```
/fc-play.html
```

The player uses **Shaka Player** and the included Cloudflare Pages Function for stream requests that require the project's proxy layer.

Player capabilities include:

- Quality selection
- Fullscreen playback
- Picture-in-picture
- Audio controls
- Responsive video layout
- CRICKCAST watermark
- Telegram community prompt

---

## ☁️ Deployment

CRICKCAST is designed for **Cloudflare Pages**.

### Deploy

1. Connect the GitHub repository to Cloudflare Pages.
2. Use the repository root as the project directory.
3. No framework build step is required.
4. Deploy with `index.html` as the site entry point.
5. The `functions/` directory is used for the Pages Function API.

### Production URL

```
https://crickcast-fam.pages.dev/
```

---

## 💰 Publisher Ads

The production pages include the publisher scripts supplied for this deployment.

### Popunder

Configured before the closing `</head>` tag, using one Popunder placement per page.

### Social Bar

Configured immediately before the closing `</body>` tag.

These placements are included on the main CRICKCAST homepage and player page.

---

## 📡 Community

Join the CRICKCAST Telegram community:

**https://t.me/addlist/6qALMSdKoVVkNWI1**

---

## 🛠️ Technology

| Component | Technology |
|---|---|
| Frontend | HTML5, CSS, JavaScript |
| UI | Tailwind CSS + Font Awesome |
| Player | Shaka Player |
| Data | JSON feed |
| Auto Update | GitHub Actions |
| Hosting | Cloudflare Pages |
| API Layer | Cloudflare Pages Functions |

---

## 📌 Data Source

The application consumes the auto-updated JSON published by:

**Vk1817/Fancode_autoupdate**

CRICKCAST uses the feed as its event-data source and renders the available live/upcoming information on the website.

---

## 👤 Project

**CRICKCAST LIVE**  
Built and maintained by **Vk1817**

---

## ⚠️ Note

CRICKCAST is a frontend project that displays data supplied by its configured feed source. Stream availability and event status depend on the current data returned by that source.
