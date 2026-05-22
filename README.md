# 5PM Web Structure

This repository contains the main 5PM website.

- `index.html` — landing page with hero, manifesto, avatars, ritual, and contact sections.
- `ander.html`, `asher.html`, `leo.html`, `kim.html`, `bodhi.html` — individual avatar worlds.
- `scripts/` — JavaScript modules and interaction code.
- `styles/styles.css` — primary stylesheet for the landing page.
- `styles.css` — shared stylesheet used by the individual avatar pages.
- `smoke.css` — smoke/atmosphere layer used by the individual avatar pages.
- `images/` — visual assets for hero, avatar carousels, and figure cameos.

Notes:
- `index.html` loads `styles/styles.css`, `scripts/three-scene.js`, and `scripts/app.js`.
- The `entry-gate` opener is kept as a full-screen interaction layer.
- The active development base is `main`. Experimental branches should not be treated as canonical unless explicitly chosen.
