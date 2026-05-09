# 📡 CRICKCAST LIVE — FanCode Web Player

A fully functional live sports streaming website powered by FanCode data, built for **Cloudflare Pages** deployment.

## 🗂️ File Structure

```
crickcast/
├── index.html              ← Main matches listing page
├── fc-play.html            ← Video player page (Shaka Player)
├── README.md
└── functions/
    └── api/
        └── proxy.js        ← Cloudflare Pages proxy function (CORS bypass)
```

## 🚀 Deploy on Cloudflare Pages (Free)

1. Push this folder to a **GitHub repo**
2. Go to [Cloudflare Pages](https://pages.cloudflare.com) → Create a project
3. Connect your GitHub repo
4. **Build settings:** leave blank (static site)
5. Click **Deploy**

The `functions/api/proxy.js` runs automatically as a Cloudflare Worker — this is what bypasses CORS and lets the video play.

## 📂 Data Source

Fetches live match data from:
```
https://raw.githubusercontent.com/Vk1817/Fancode_autoupdate/main/pranav.json
```
Auto-updated every 5 minutes via GitHub Actions.

## 📢 Telegram

Join: https://t.me/addlist/6qALMSdKoVVkNWI1

## 💖 Credits

Original architecture by [sayanpal514-hue/Sayan-Fancode-Web](https://github.com/sayanpal514-hue/Sayan-Fancode-Web)  
Data source: [drmlive/fancode-live-events](https://github.com/drmlive/fancode-live-events)
