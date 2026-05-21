# 5PM Project Context

This repository is the source of truth for the current 5PM website.

## Current Base

- Work from `main`.
- Treat PR #7 / branch `5-pecados-musicales-webdev-a82c6` as experimental and not part of the active direction unless explicitly requested.
- The production site is deployed on Vercel at `https://5-pecados-musicales.vercel.app`.

## Architecture

- Static HTML/CSS/JavaScript site.
- Main page: `index.html`.
- Shared landing styles: `styles/styles.css`.
- Root `styles.css` is used by the individual avatar pages.
- Character pages: `ander.html`, `asher.html`, `leo.html`, `kim.html`, `bodhi.html`.
- Landing interactions: `scripts/app.js`.
- Hero atmosphere: `scripts/three-scene.js`, with canvas fallback.
- Character smoke layer: `smoke.css`.
- Image assets are referenced from `images/`.

## Working Notes

- Local Codex terminal access is currently unreliable on the Windows workspace, so GitHub/Vercel can be used as the working path.
- Prefer small, reversible changes on top of `main`.
- Keep the cinematic marble/gold/dark visual language and the five avatar color accents.
- Figma may be useful later for design exploration, but the active implementation is this static site.
