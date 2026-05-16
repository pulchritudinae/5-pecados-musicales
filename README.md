# 5PM Web Structure

This folder contains the main 5PM website.

## What changed visually

The current release is **5PM IMMERSIVE v3**. If you are seeing the latest version, the page shows a gold/green/red ribbon at the top that says:

```text
5PM IMMERSIVE v3 · SI VES ESTO, ESTÁS EN LA NUEVA WEB
```

If you do not see that ribbon, you are viewing an old cached page, an old folder, or a deployment that is not using the latest `index.html`.

## Project files

- `index.html` — landing page with hero, manifesto, avatars, ritual, and contact sections.
- `styles/styles.css` — global styling for the landing page and individual avatar pages.
- `scripts/app.js` — general interactions: entry gate, parallax variables, carousel controls, reveals, avatar stats, and GSAP-enhanced hero reveal.
- `scripts/three-scene.js` — atmospheric hero layer; it tries Three.js first and falls back to a lighter 2D canvas atmosphere if the CDN is unavailable.
- `images/` — current visual assets used by the website.
- `index.html` — landing page with hero, manifesto, avatars, ritual, and contact sections.
- `scripts/app.js` — general interactions: entry gate, parallax variables, carousel controls, reveals, avatar stats, and GSAP-enhanced hero reveal.
- `scripts/three-scene.js` — lightweight Three.js atmospheric hero layer with particles, fog, colored lights, and mobile/reduced-motion safeguards.
- `styles/styles.css` — global styling for the landing page and individual avatar pages.
- `images/` — current visual assets used by the website.
- `assets/images/` — placeholder for future organized image assets.
- `assets/archives/` — placeholder for media or archive assets.
- `COMO_VER_LA_WEB.md` — simple non-technical instructions for opening the latest version.
- `ABRIR_WEB.command` / `ABRIR_WEB.bat` — optional launchers for opening a local preview without typing commands.

## Quick start

The simplest option is to open `index.html` from the latest downloaded or pulled copy of the repository.

For the most reliable local preview, double-click `ABRIR_WEB.command` on Mac or `ABRIR_WEB.bat` on Windows. You can also serve the folder manually with:
## Runtime notes

- `index.html` loads `styles/styles.css`, `scripts/three-scene.js`, GSAP from CDN, and `scripts/app.js`.
- The individual avatar pages load the shared stylesheet at `styles/styles.css`.
- The entry gate is kept as a full-screen ritual interaction layer.
- Because `scripts/three-scene.js` is an ES module, run the site through a static server instead of opening `index.html` directly from `file://`.

Example local server:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173
```

## Cache note

`index.html` uses cache-busting query strings on CSS and JS, for example `styles/styles.css?v=5pm-immersive-v3`, so browsers are less likely to keep showing the previous CSS/JS files.
If you are unsure whether you are opening the latest version, check `COMO_VER_LA_WEB.md`.

## Runtime notes

- `index.html` loads `styles/styles.css`, `scripts/three-scene.js`, GSAP from CDN, and `scripts/app.js`.
- The individual avatar pages load the shared stylesheet at `styles/styles.css`.
- The entry gate is kept as a full-screen ritual interaction layer.
- `scripts/three-scene.js` tries to load Three.js from CDN at runtime; if it cannot, it falls back to a lighter 2D canvas atmosphere.
Then open `http://localhost:4173`.
