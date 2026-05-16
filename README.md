# 5PM Web Structure

This folder contains the main 5PM website.

- `index.html` — landing page with hero, manifesto, avatars, ritual, and contact sections.
- `scripts/app.js` — general interactions: entry gate, parallax variables, carousel controls, reveals, avatar stats, and GSAP-enhanced hero reveal.
- `scripts/three-scene.js` — lightweight Three.js atmospheric hero layer with particles, fog, colored lights, and mobile/reduced-motion safeguards.
- `styles/styles.css` — global styling for the landing page and individual avatar pages.
- `images/` — current visual assets used by the website.
- `assets/images/` — placeholder for future organized image assets.
- `assets/archives/` — placeholder for media or archive assets.

## Runtime notes

- `index.html` loads `styles/styles.css`, `scripts/three-scene.js`, GSAP from CDN, and `scripts/app.js`.
- The individual avatar pages load the shared stylesheet at `styles/styles.css`.
- The entry gate is kept as a full-screen ritual interaction layer.
- Because `scripts/three-scene.js` is an ES module, run the site through a static server instead of opening `index.html` directly from `file://`.

Example local server:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.
