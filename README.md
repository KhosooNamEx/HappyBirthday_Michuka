# 🎂 Interactive Birthday Website (Multi-page)

A small, static website you can host on **GitHub Pages**. It includes:
- Home with confetti + music
- Gallery with lightbox
- Wishes wall (saved in browser localStorage)
- Mini games: Balloon Pop + Blow the Candle
- About page

## Deploy on GitHub Pages
1. Create a repo (e.g., `happy-birthday`) on GitHub.
2. Upload all files in this folder to the repo root and commit.
3. Go to **Settings → Pages**: set Source = *Deploy from a branch*, Branch = `main`, Folder = `/root`.
4. Open: `https://<your-username>.github.io/happy-birthday/`

## Customize
- Edit **shared.js** → change `CONFIG.NAME` and `CONFIG.PHOTOS`.
- Put your images in **assets/** (update file names if needed).
- Replace `assets/hbd.mp3` with your own music (optional).

No build tools, no backend. Just HTML/CSS/JS.
