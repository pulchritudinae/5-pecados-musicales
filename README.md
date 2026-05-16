# 5PM Web Structure

This folder contains the main 5PM website.

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

```bash
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173
```

If you are unsure whether you are opening the latest version, check `COMO_VER_LA_WEB.md`.

## Runtime notes

- `index.html` loads `styles/styles.css`, `scripts/three-scene.js`, GSAP from CDN, and `scripts/app.js`.
- The individual avatar pages load the shared stylesheet at `styles/styles.css`.
- The entry gate is kept as a full-screen ritual interaction layer.
- `scripts/three-scene.js` tries to load Three.js from CDN at runtime; if it cannot, it falls back to a lighter 2D canvas atmosphere.
