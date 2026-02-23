# Lewis Hamilton — Portfolio Landing Page

A minimal, interactive single-page hero featuring a circular spotlight reveal effect, parallax motion, and animated grid background.

## Features

- **Spotlight Reveal** — A circular cursor mask reveals an alternate portrait (helmet on) beneath the base image
- **Motion Echoes** — Fast cursor movement spawns soft, fading ring echoes
- **Animated Grid** — Subtle background grid that reacts to cursor position
- **Dynamic Text Inversion** — UI text inverts to white when the spotlight passes over it
- **Light Parallax** — Elements shift slightly opposite to cursor movement
- **Responsive** — Falls back gracefully on mobile (no cursor effects)

## Hosting on GitHub Pages

1. Create a new GitHub repository
2. Push this folder's contents to the `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
3. Go to **Settings → Pages** in your repo
4. Under **Source**, select `Deploy from a branch` → `main` → `/ (root)`
5. Your site will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO/`

## File Structure

```
├── index.html              # Single-file landing page
├── images/
│   ├── hamilton-portrait.png   # Base image (no helmet)
│   └── hamilton-helmet.png     # Reveal image (with helmet)
└── README.md
```

## License

Images are used for personal/portfolio purposes only. All rights to the photographs belong to their respective owners.
